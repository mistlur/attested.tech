import { z } from "zod";
import {
  documentSchema,
  verificationRelationshipSchema,
  verificationRelationshipsSchema,
} from "./didParser";
import * as b58 from "multiformats/bases/base58";
import { ec as EC } from "elliptic";
import {
  Representation,
  VerificationRelationship,
  KeyFormat,
  verificationRelationships,
} from "@/types/dids";
import {
  DidMaterial,
  EmbeddedMaterial,
  isEmbeddedType,
  ReferencedMaterial,
} from "./DidMaterial";
import { DidDocument } from "./DidDocument";
import { decodeJwk } from "./keys";
import { Curve } from "./curves";

export const decodeVerificationRelationship = (
  verificationMethod: z.infer<typeof verificationRelationshipSchema>,
  method: VerificationRelationship
): DidMaterial => {
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
    const ec = new EC(curveFromName());
    curve = "P-256";
    representation = "Embedded";
    if (verificationMethod.type === "JsonWebKey2020") {
      format = "JsonWebKey2020";
      if (!verificationMethod.publicKeyJwk)
        throw new Error(
          'Invalid type: "JsonWebKey2020" must contain "publicKeyJwk"'
        );
      keyMaterial = decodeJwk(verificationMethod.publicKeyJwk);
    } else if (verificationMethod.type === "P256Key2021") {
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
    } else {
      throw new Error(`Unsupported type: ${verificationMethod.type}`);
    }
  }

  if (!keyMaterial || !curve || !representation || !format)
    throw Error("Invalid key");

  return new EmbeddedMaterial(verificationMethod.id, {
    curve: curve,
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

  verificationRelationships.map((relationship) => {
    if (document[relationship]) {
      document[relationship]!.forEach((vm) =>
        incomingDidMaterial.push(
          decodeVerificationRelationship(vm, relationship)
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
    denormalized
  );
};
