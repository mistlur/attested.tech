import { uriValidationExpr } from "../types/dids";
import { z } from "zod";

export const publicKeyJwkSchema = z.object({
  alg: z.string().optional(),
  crv: z.string().optional(),
  e: z.string().optional(),
  ext: z.boolean().optional(),
  key_ops: z.array(z.string()).optional(),
  kid: z.string().optional(),
  kty: z.string().optional(),
  n: z.string().optional(),
  use: z.string().optional(),
  x: z.string().optional(),
  y: z.string().optional(),
});

export const verificationMethodSchema = z.object({
  id: z.string(),
  type: z.string(),
  controller: z.string(),
  publicKeyJwk: publicKeyJwkSchema.optional(),
  publicKeyMultibase: z.string().optional(),
});

export const verificationRelationshipSchema = verificationMethodSchema.or(
  z.string()
);

export const verificationMethodsSchema = z.array(verificationMethodSchema);
export const verificationRelationshipsSchema = z.array(
  verificationRelationshipSchema
);

export const serviceSchema = z.object({
  id: z.string(),
  type: z.union([z.string(), z.array(z.string())]),
  serviceEndpoint: z.union([z.string(), z.array(z.string())]),
});

export const documentSchema = z.object({
  ["@context"]: z
    .literal("https://w3.org/ns/did/v1")
    .or(z.string())
    .or(z.array(z.string().or(z.record(z.string(), z.any()))))
    .optional(),
  id: z.string(),
  alsoKnownAs: z
    .array(z.string().regex(uriValidationExpr, { message: "Invalid URI" }))
    .optional(),
  controller: z.string().or(z.array(z.string())).optional(),
  verificationMethod: verificationMethodsSchema.optional(),
  authentication: verificationRelationshipsSchema.optional(),
  assertionMethod: verificationRelationshipsSchema.optional(),
  keyAgreement: verificationRelationshipsSchema.optional(),
  capabilityInvocation: verificationRelationshipsSchema.optional(),
  capabilityDelegation: verificationRelationshipsSchema.optional(),
  services: z.array(serviceSchema).optional(),
});
