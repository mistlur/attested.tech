import { z } from 'zod'

const publicKeyJwkSchema = z.object({
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
})

const verificationMethodSchema = z.object({
    id: z.string(),
    type: z.string().optional(),
    controller: z.string().optional(),
    publicKeyBase58: z.string().optional(),
    publicKeyBase64: z.string().optional(),
    publicKeyJwk: publicKeyJwkSchema.optional(),
    publicKeyHex: z.string().optional(),
    publicKeyMultibase: z.string().optional(),
    blockchainAccountId: z.string().optional(),
    ethereumAddress: z.string().optional()
})

export const documentSchema = z.object({
    ['@context']: z.literal('https://w3.org/ns/did/v1').or(z.string()).or(z.array(z.string())).optional(),
    id: z.string(),
    alsoKnownAs: z.string().optional(),
    controller: z.string().optional(),
    verificationMethod: verificationMethodSchema.optional(), // TODO
    service: z.string().optional(),
    authentication: z.array(verificationMethodSchema).or(z.array(z.string())).optional(),
    assertionMethod: z.array(verificationMethodSchema).or(z.array(z.string())).optional(),
    keyAgreement: z.array(verificationMethodSchema).or(z.array(z.string())).optional(),
    capabilityInvocation: z.array(verificationMethodSchema).or(z.array(z.string())).optional(),
    capabilityDelegation: z.array(verificationMethodSchema).or(z.array(z.string())).optional(),
})

