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

  const minimzedId =
    "#" + verificationMethod.id.split("#")![1] || verificationMethod.id;
  return new EmbeddedMaterial(minimzedId, {
    curve,
    controller: verificationMethod.controller,
    keyMaterial,
    format,
    ...(method !== "verificationMethod" && {
      usage: { [method]: representation },
    }),
  });
};

export const didDocumentDeserializer = (
  document: z.infer<typeof documentSchema>
): DidDocument => {
  const relationships: DidMaterial[] = [];
  const verificationMethods: DidMaterial[] = [];

  verificationRelationships.map((relationship) => {
    if (document[relationship]) {
      document[relationship]!.forEach((verificationMethod) =>
        relationships.push(
          decodeVerificationRelationship(verificationMethod, relationship)
        )
      );
    }
  });

  if (document["verificationMethod"]) {
    document["verificationMethod"]!.forEach((verificationMethod) =>
      verificationMethods.push(
        decodeVerificationRelationship(verificationMethod, "verificationMethod")
      )
    );
  }

  const refs = [];
  for (let material of relationships) {
    const existingIndex = Math.max(
      verificationMethods.findIndex((t) => t.id === material.id),
      verificationMethods.findIndex(
        (t) => t.id === `${document.id}${material.id}`
      )
    );
    if (existingIndex >= 0) {
      verificationMethods[existingIndex].setUsage({
        ...verificationMethods[existingIndex].getUsage(),
        ...material.getUsage(),
      });
    } else {
      refs.push(material);
    }
  }

  return new DidDocument(
    document.id,
    new Set<string>(document.controller),
    [...verificationMethods, ...refs],
    // @ts-ignore
    document.services
  );
};
