import { z } from 'zod'

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
})

// export const jwk2020 = z.object({
//     id: z.string(),
//     type: z.literal('JsonWebKey2020'),
//     controller: z.string().optional(),
//     publicKeyJwk: publicKeyJwkSchema.optional(),
// })

export const verificationMethodSchema = z.object({
    id: z.string(),
    type: z.string(),
    controller: z.string(),
    publicKeyJwk: publicKeyJwkSchema.optional(),
    publicKeyMultibase: z.string().optional(),
    blockchainAccountId: z.string().optional(),
    // NOT SUPPORTED
    // publicKeyBase64: z.string().optional(), // NOT MENTIONED IN https://www.w3.org/TR/did-spec-registries/#verification-method-properties
    // publicKeyBase58: z.string().optional(), // DEPRECATED
    // publicKeyHex: z.string().optional(), // DEPRECATED
    // ethereumAddress: z.string().optional() // DEPRECATED
}).or(z.string())

export const verificationMethodsSchema = z.array(verificationMethodSchema)

export const documentSchema = z.object({
    ['@context']: z.literal('https://w3.org/ns/did/v1').or(z.string()).or(z.array(z.string())).optional(),
    id: z.string(),
    alsoKnownAs: z.string().optional(),
    controller: z.string().optional(),
    verificationMethod: verificationMethodsSchema.optional(),
    authentication: verificationMethodsSchema.optional(),
    assertionMethod: verificationMethodsSchema.optional(),
    keyAgreement: verificationMethodsSchema.optional(),
    capabilityInvocation: verificationMethodsSchema.optional(),
    capabilityDelegation: verificationMethodsSchema.optional(),
    service: z.string().optional(),
})

