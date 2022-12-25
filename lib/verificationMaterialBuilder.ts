import { z } from 'zod'
import { getCompleteDid } from './did';
import { documentSchema, verificationMethodSchema, verificationMethodsSchema } from './didParser'
import * as b58 from 'multiformats/bases/base58'
import * as b64 from 'multiformats/bases/base64'
import { ec as EC } from 'elliptic'
import { jwkThumbprintByEncoding } from 'jwk-thumbprint';

export type Representation = EmbeddedMaterial | ReferencedMaterial
export type EmbeddedMaterial = 'JsonWebKey2020' | 'Multibase'
export type ReferencedMaterial = 'Reference'

const verificationRelationships = [
    "verificationMethod",
    "authentication",
    "assertionMethod",
    "keyAgreement",
    "capabilityInvocation",
    "capabilityDelegation"
] as const

export type VerificationRelationship = typeof verificationRelationships[number]

export type SupportedCurves = 'P-256'

export type LogicVM = {
    id: string;
    fresh: boolean;
    controller?: string;
    curve?: SupportedCurves;
    keyMaterial?: Uint8Array;
} & {
    usage: {
        [x in VerificationRelationship]?: Representation
    }
}

export type LogicDocument = {
    id: string,
    controller: string | undefined,
    verificationMethods: LogicVM[]
}

const generateKey = async () => {
    return await window.crypto.subtle.generateKey(
        {
            name: "ECDSA",
            namedCurve: "P-256"
        },
        true,
        ["sign", "verify"]
    );
}

function encodeMultibaseKey(rawKeyMaterial: Uint8Array): string {
    const p256codec = [0x80, 0x24]
    const ec = new EC('p256')
    const keypair = ec.keyFromPublic(rawKeyMaterial)
    const keyMaterialCompactForm = keypair.getPublic(true, 'array')
    const multibase = b58.base58btc.encode(new Uint8Array([...p256codec, ...keyMaterialCompactForm]))
    return multibase.toString()
}

function encodeJsonWebKey(rawKeyMaterial: Uint8Array): JsonWebKey {
    const ec = new EC('p256')
    const keypair = ec.keyFromPublic(rawKeyMaterial)
    const xBytes = new Uint8Array(keypair.getPublic().getX().toArray())
    const yBytes = new Uint8Array(keypair.getPublic().getY().toArray())
    const x = b64.base64url.baseEncode(xBytes)
    const y = b64.base64url.baseEncode(yBytes)

    return {
        crv: "P-256",
        kty: "EC",
        x,
        y,
    }
}

export const encodeVerificationMethod = (vm: LogicVM, representation: Representation): z.infer<typeof verificationMethodSchema> => {
    // TODO: Preserve the correct fingerprint when translating
    if (vm.keyMaterial && representation !== 'Reference') {
        if (!vm.controller) throw Error('Malformed verification method: Embedded material must contain controller')
        if (representation === 'JsonWebKey2020') {
            const publicKeyJwk = encodeJsonWebKey(vm.keyMaterial)
            const fragment = jwkThumbprintByEncoding(publicKeyJwk, "SHA-256", 'base64url');
            return {
                id: vm.fresh ? `${vm.id}#${fragment}` : vm.id,
                type: 'JsonWebKey2020',
                controller: vm.controller,
                publicKeyJwk,
            }
        } else {
            return {
                id: vm.fresh ? `${vm.id}#${encodeMultibaseKey(vm.keyMaterial)}` : vm.id,
                type: 'P256Key2021',
                controller: vm.controller,
                publicKeyMultibase: encodeMultibaseKey(vm.keyMaterial)
            }
        }
    } else {
        return vm.id
    }
}

export const newVerificationMaterial = async (id: string): Promise<LogicVM> => {
    const keys = await generateKey()
    const keyMaterial = new Uint8Array(await window.crypto.subtle.exportKey('raw', keys.publicKey))
    return {
        id: getCompleteDid(id),
        keyMaterial,
        fresh: true,
        curve: 'P-256',
        usage: { verificationMethod: 'JsonWebKey2020' }
    }
}

export const decodeVerificationMethod = (verificationMethod: z.infer<typeof verificationMethodSchema>, method: VerificationRelationship): LogicVM => {
    let keyMaterial
    let curve: SupportedCurves | undefined
    let representation: Representation | undefined
    if (typeof verificationMethod === "string") {
        return {
            id: verificationMethod,
            fresh: false,
            usage: { [method]: 'Reference' }
        }
    }
    if (verificationMethod.type) {
        const ec = new EC('p256')
        curve = 'P-256'
        if (verificationMethod.type === 'JsonWebKey2020') {
            representation = 'JsonWebKey2020'
            // Set point compression to uncompressed as we are dealing with x and y in JWK
            const POINT_COMPRESSION = 0x04
            if (!verificationMethod.publicKeyJwk) throw new Error('Invalid type: "JsonWebKey2020" must contain "publicKeyJwk"')
            if (!verificationMethod.publicKeyJwk.x || !verificationMethod.publicKeyJwk.y) throw new Error('Invalid key') // TODO: better error handling
            const x = b64.base64url.baseDecode(verificationMethod.publicKeyJwk.x)
            const y = b64.base64url.baseDecode(verificationMethod.publicKeyJwk.y)
            const keypair = ec.keyFromPublic([POINT_COMPRESSION, ...x, ...y])
            keyMaterial = new Uint8Array(keypair.getPublic(false, 'array'))
        }
        else if (verificationMethod.type === 'P256Key2021') {
            representation = 'Multibase'
            if (!verificationMethod.publicKeyMultibase) throw new Error('Invalid key') // TODO: better error handling
            const multibase = b58.base58btc.decode(verificationMethod.publicKeyMultibase)
            // Omitting the first two codec bytes (0x12, 0x00) TODO: This can probably be done better by multicodec...
            const keyBytes = multibase.slice(2)
            // TODO assert keysize
            const keypair = ec.keyFromPublic(keyBytes)
            keyMaterial = new Uint8Array(keypair.getPublic(false, 'array'))
        } else {
            throw new Error(`Unsupported type: ${verificationMethod.type}`)
        }
    }

    if (!keyMaterial || !curve || !representation) throw Error('Invalid key')

    return {
        id: verificationMethod.id,
        curve: curve,
        fresh: false,
        controller: verificationMethod.controller,
        keyMaterial,
        usage: { [method]: representation }
    }
}

const contextProvider = (verificationMethods: LogicVM[]): string[] => {
    const uniqueRepresentations = [...new Set(verificationMethods.reduce<string[]>((acc: string[], curr) =>
        acc.concat(Object.values(curr.usage).filter(usage => (usage !== 'Reference')))
        , []))]

    const representationsUsed = uniqueRepresentations.map(representation => {
        switch (representation) {
            case 'JsonWebKey2020': return "https://w3id.org/security/suites/jws-2020/v1"
            case 'Multibase': return "https://w3id.org/security/suites/multikey-2021/v1"
            default: return 'Unkown'
        }
    })
    return ["https://www.w3.org/ns/did/v1", ...representationsUsed]
}

export const findMaterialForVerificationRelationship = (document: LogicDocument, relationship: VerificationRelationship): LogicVM[] => {
    return document.verificationMethods.filter(method => method.usage[relationship])
}

export const encodeRelationship = (relationships: LogicVM[], relationship: VerificationRelationship): z.infer<typeof verificationMethodsSchema> => {
    return relationships.map(method => encodeVerificationMethod(method, method.usage[relationship]!))
}

export const didDocumentSerializer = (logicDocument: LogicDocument): z.infer<typeof documentSchema> => {
    const relationships: Record<string, any> = {}
    verificationRelationships.map(relationship => {
        const existingRelationships = findMaterialForVerificationRelationship(logicDocument, relationship)
        if (existingRelationships.length) relationships[relationship as string] = encodeRelationship(existingRelationships, relationship)
    })

    return {
        ['@context']: contextProvider(logicDocument.verificationMethods),
        id: logicDocument.id,
        controller: logicDocument.controller,
        ...relationships
    }
}

export const didDocumentDeserializer = (document: z.infer<typeof documentSchema>) => {
    const verificationMethods: LogicVM[] = []
    verificationRelationships.map(relationship => {
        if (document[relationship]) {
            document[relationship]!.forEach(vm => verificationMethods.push(decodeVerificationMethod(vm, relationship)))
        }
    })

    const denormalized: LogicVM[] = []
    for (let vm of verificationMethods) {
        const existingIndex = denormalized.findIndex((t) => t.id === vm.id)
        if (existingIndex < 0) denormalized.push(vm)
        else {
            if (denormalized[existingIndex].keyMaterial) {
                if (vm.keyMaterial && vm.keyMaterial.toString() !== denormalized[existingIndex].keyMaterial!.toString()) {
                    // This is quite a bad state, with different keys using the same id.
                    // However, the spec does not cover this AFAICS, so I assume it is allowed...
                    denormalized.push(vm)
                }
            } else {
                if (vm.keyMaterial) {
                    denormalized[existingIndex].keyMaterial = vm.keyMaterial
                }
            }
            denormalized[existingIndex].usage = { ...denormalized[existingIndex].usage, ...vm.usage }
        }
    }

    return {
        id: document.id,
        controller: document.controller,
        verificationMethods: denormalized
    }
}

