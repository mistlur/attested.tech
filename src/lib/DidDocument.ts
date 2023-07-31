import { VerificationRelationship } from "@/types/dids";
import { immerable } from "immer";
import { z } from "zod";
import {
  DidMaterial,
  EmbeddedMaterial,
  isEmbeddedMaterial,
} from "./DidMaterial";
import { documentSchema } from "./didParser";

export type DidController = Set<string>;
export type SerializedRepresentation = "JSON" | "JSONLD";

export type LogicDocument = {
  id: string; // TODO: Proper Id type
  controller: DidController | undefined;
  verificationMethods: DidMaterial[];
};

export class DidDocument {
  [immerable] = true;
  public id: string | undefined;
  public controller: DidController | undefined;
  public verificationMethod: DidMaterial[];

  constructor(
    id: string | undefined,
    controller: DidController | null,
    verificationMethod: DidMaterial[]
  ) {
    this.id = id;
    this.controller = controller || new Set([]);
    this.verificationMethod = verificationMethod;
  }

  addVerificationMethod(material: DidMaterial) {
    this.verificationMethod.push(material);
  }

  setIdentifier(did: string) {
    this.id = did;
  }

  setController(controller: DidController | null) {
    this.controller = controller;
  }

  serializeController() {
    if (!this.controller) return null;
    //@ts-ignore
    const asArray = [...this.controller];
    if (asArray.length === 0) return null;
    else if (asArray.length === 1) return asArray[0];
    else return asArray;
  }

  getContexts(): (string | Record<string, any>)[] {
    const uniqueRepresentations = this.verificationMethod
      .filter((vm) => isEmbeddedMaterial(vm))
      .map((vm) => (vm as EmbeddedMaterial).material.format)
      .filter((value, index, array) => array.indexOf(value) === index);
    const representationsUsed = uniqueRepresentations.map((representation) => {
      switch (representation) {
        case "JsonWebKey2020":
          return {
            JsonWebKey2020: "https://w3id.org/security/suites/jws-2020/v1",
            publicKeyJwk: {
              "@id": "https://w3id.org/security#publicKeyJwk",
              "@type": "@json",
            },
          };
        case "Multibase":
          return "https://w3id.org/security/suites/multikey-2021/v1";
        default:
          return "Unkown";
      }
    });
    return ["https://www.w3.org/ns/did/v1", ...representationsUsed];
  }

  getRelationship(relationship: VerificationRelationship): DidMaterial[] {
    return this.verificationMethod.filter((method) =>
      method.isUsedInRelationship(relationship)
    );
  }

  public serialize(
    representation: SerializedRepresentation = "JSONLD"
  ): z.infer<typeof documentSchema> {
    const relationships: Record<string, (string | object)[]> = {};
    const allMaterials = this.verificationMethod;
    const controller = this.serializeController();

    allMaterials.forEach((material) => {
      const usedIn = material.getUsage();

      // Check if the material is referenced by any relationship(s). If it is,
      // add it to the list of verification methods
      if (isEmbeddedMaterial(material) && material.isUsedAsReference()) {
        if (relationships["verificationMethod"])
          relationships["verificationMethod"] = [
            ...relationships["verificationMethod"],
            material.serialize("Embedded", this.id),
          ];
        else
          relationships["verificationMethod"] = [
            material.serialize("Embedded", this.id),
          ];
      }

      // Traverse the relationships the material is used in, and add the
      // serialized representation of it there
      Object.keys(usedIn).forEach((relationship) => {
        if (relationships[relationship])
          relationships[relationship] = [
            ...relationships[relationship],
            material.serialize(usedIn[relationship]),
          ];
        else
          relationships[relationship] = [
            material.serialize(usedIn[relationship]),
          ];
      });
    });

    return {
      ...(representation === "JSONLD" && { ["@context"]: this.getContexts() }),
      id: this.id,
      ...(controller && { controller }),
      ...relationships,
    };
  }
}
