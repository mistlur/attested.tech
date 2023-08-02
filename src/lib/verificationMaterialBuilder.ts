import { z } from "zod";
import { documentSchema, verificationRelationshipSchema } from "./didParser";
import * as b58 from "multiformats/bases/base58";
import {
  KeyFormat,
  Representation,
  VerificationRelationship,
  verificationRelationships,
} from "@/types/dids";
import {
  DidMaterial,
  EmbeddedMaterial,
  isEmbeddedType,
  ReferencedMaterial,
} from "./DidMaterial";
import { DidDocument } from "./DidDocument";
import { decodeJwk, getCryptoSuite } from "./keys";
import { Curve, curveFromName } from "./curves";

export const decodeVerificationRelationship = (
  verificationMethod: z.infer<typeof verificationRelationshipSchema>,
  method: VerificationRelationship | "verificationMethod"
): DidMaterial => {
  // Referenced method
  if (typeof verificationMethod === "string") {
    return new ReferencedMaterial(verificationMethod, {
      usage: { [method]: "Reference" },
    });
  }

  let keyMaterial;
  let curve: Curve | undefined;
  let representation: Representation | undefined;
  let format: KeyFormat | undefined;

  if (verificationMethod.type) {
    representation = "Embedded";
    if (verificationMethod.type === "JsonWebKey2020") {
      curve = curveFromName(verificationMethod.publicKeyJwk.crv);
      format = "JsonWebKey2020";
      if (!verificationMethod.publicKeyJwk)
        throw new Error(
          'Invalid type: "JsonWebKey2020" must contain "publicKeyJwk"'
        );
      keyMaterial = decodeJwk(verificationMethod.publicKeyJwk);
    } else {
      curve = curveFromName(verificationMethod.type);
      const ec = getCryptoSuite(curve);
      format = "Multibase";
      if (!verificationMethod.publicKeyMultibase)
        throw new Error("Invalid key"); // TODO: better error handling
      const multibase = b58.base58btc.decode(
        verificationMethod.publicKeyMultibase
      );
      // Omitting the first two codec bytes (0x12, 0x00) TODO: This can probably be done better by multicodec...
      const keyBytes = multibase.slice(2);
      const keypair = ec.keyFromPublic(keyBytes);
      keyMaterial = new Uint8Array(keypair.getPublic(false, "array"));
    }
  }

  if (!keyMaterial || !curve || !representation || !format)
    throw Error("Invalid key");

  return new EmbeddedMaterial(verificationMethod.id, {
    curve,
    controller: verificationMethod.controller,
    keyMaterial,
    format,
    usage: { [method]: representation },
  });
};

export const didDocumentDeserializer = (
  document: z.infer<typeof documentSchema>
): DidDocument => {
  const incomingDidMaterial: DidMaterial[] = [];
  const relationships = [
    ...verificationRelationships,
    "verificationMethod",
  ] as const;
  relationships.map((relationship) => {
    if (document[relationship]) {
      document[relationship]!.forEach((verificationMethod) =>
        incomingDidMaterial.push(
          decodeVerificationRelationship(verificationMethod, relationship)
        )
      );
    }
  });

  const denormalized: DidMaterial[] = [];
  for (let material of incomingDidMaterial) {
    const existingIndex = denormalized.findIndex((t) => t.id === material.id);
    const other = denormalized[existingIndex];
    if (existingIndex < 0) denormalized.push(material);
    else {
      if (isEmbeddedType(other.material) && isEmbeddedType(material.material)) {
        if (!material.equals(other)) {
          denormalized.push(material);
        } else {
          other.setUsage({ ...other.getUsage(), ...material.getUsage() });
          denormalized[existingIndex] = other;
        }
      } else {
        material.setUsage({ ...other.getUsage(), ...material.getUsage() });
        denormalized[existingIndex] = material;
      }
    }
  }
  return new DidDocument(
    document.id,
    new Set<string>(document.controller),
    denormalized,
    // @ts-ignore
    document.services
  );
};
