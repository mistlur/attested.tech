import { Curve } from "@/lib/curves";

export type Service = {
  id: string;
  type: string | string[];
  serviceEndpoint: string | string[];
};

export const verificationRelationships = [
  "authentication",
  "assertionMethod",
  "keyAgreement",
  "capabilityInvocation",
  "capabilityDelegation",
] as const;

export type KeyFormat = "JsonWebKey2020" | "Multibase";

export type ReferencedMaterialFormat = "Reference";
export type EmbeddedMaterialFormat = "Embedded";
export type Representation = EmbeddedMaterialFormat | ReferencedMaterialFormat;
export type VerificationRelationship = typeof verificationRelationships[number];

export type UsageFormat<Type extends Representation> = {
  [x in VerificationRelationship]?: Type;
};

export type EmbeddedType = {
  controller?: string;
  curve: Curve;
  keyMaterial: Uint8Array;
  format: KeyFormat;
  usage: UsageFormat<Representation>;
};

export type ReferencedType = {
  usage: UsageFormat<ReferencedMaterialFormat>;
};
