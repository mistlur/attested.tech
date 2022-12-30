import { z } from 'zod'
import { documentSchema, verificationMethodSchema, verificationMethodsSchema } from './didParser'
import * as b58 from 'multiformats/bases/base58'
import * as b64 from 'multiformats/bases/base64'
import { ec as EC } from 'elliptic'
import { jwkThumbprintByEncoding } from 'jwk-thumbprint';
import { immerable } from 'immer';

export const verificationRelationships = [
    "verificationMethod",
    "authentication",
    "assertionMethod",
    "keyAgreement",
    "capabilityInvocation",
    "capabilityDelegation"
] as const

export type EmbeddedMaterial = 'JsonWebKey2020' | 'Multibase'
export type ReferencedMaterial = 'Reference'
export type Representation = "Embedded" | ReferencedMaterial
export type VerificationRelationship = typeof verificationRelationships[number]
export type SupportedCurves = 'P-256'
export type EmbeddedUsage = { [x in VerificationRelationship]?: Representation }
export type ReferencedUsage = { [x in VerificationRelationship]?: ReferencedMaterial }

export type EmbeddedVM = {
    id: string;
    controller?: string;
    curve: SupportedCurves;
    keyMaterial: Uint8Array;
    format: EmbeddedMaterial
    usage: EmbeddedUsage
}

export type ReferenceVM = {
    id: string,
    usage: ReferencedUsage
}


export type LogicVM = EmbeddedVM | ReferenceVM

export function isEmbeddedVm(vm: EmbeddedVM | ReferenceVM): vm is EmbeddedVM {
    return (vm as EmbeddedVM).curve !== undefined;
}

export type LogicDocument = {
    id: string,
    controller: string | undefined,
    verificationMethods: LogicVM[]
}

export class DidDocument {
    [immerable] = true
    public id: string
    public controller: string | undefined
    public verificationMethods: LogicVM[]

    constructor(id: string, controller: string | undefined, verificationMethods: LogicVM[]) {
        this.id = id
        this.controller = controller
        this.verificationMethods = verificationMethods
    }

    async newVerificationMaterial() {
        const keys = await generateKey()
        const keyMaterial = new Uint8Array(await window.crypto.subtle.exportKey('raw', keys.publicKey))
        const curve: SupportedCurves = "P-256"
        return {
            curve,
            keyMaterial,
        }
    }

    addVerificationMaterial(vm: LogicVM) {
        this.verificationMethods.push(vm)
    }

    getContexts(): string[] {
        const uniqueRepresentations = [...new Set(this.verificationMethods.filter(vm => isEmbeddedVm(vm) && Object.values(vm.usage).includes('Embedded')).map((vm) => (vm as EmbeddedVM).format))]
        const representationsUsed = uniqueRepresentations.map(representation => {
            switch (representation) {
                case 'JsonWebKey2020': return "https://w3id.org/security/suites/jws-2020/v1"
                case 'Multibase': return "https://w3id.org/security/suites/multikey-2021/v1"
                default: return 'Unkown'
            }
        })
        return ["https://www.w3.org/ns/did/v1", ...representationsUsed]
    }

    getRelationships(relationship: VerificationRelationship): LogicVM[] {
        return this.verificationMethods.filter(method => method.usage[relationship])
    }

    serializeVerificationMethod(vm: LogicVM, representation: Representation): z.infer<typeof verificationMethodSchema> {
        if (isEmbeddedVm(vm)) {
            if (!vm.controller) throw Error('Malformed verification method: Embedded material must contain controller')
            const id = !vm.id ? `${this.id}#${deriveIdentificationFragment(vm.format, vm.keyMaterial)}` : vm.id
            if (representation === 'Reference') {
                return id
            }
            if (vm.format === 'JsonWebKey2020') {
                return {
                    id,
                    type: vm.format,
                    controller: vm.controller,
                    publicKeyJwk: encodeJsonWebKey(vm.keyMaterial),
                }
            } else if (vm.format === 'Multibase') {
                return {
                    id,
                    type: 'P256Key2021',
                    controller: vm.controller,
                    publicKeyMultibase: encodeMultibaseKey(vm.keyMaterial)
                }
            } else {
                throw new Error(`Unable to serialize verification method\n${JSON.stringify(vm)}`)
            }
        } else {
            return vm.id
        }
    }

    serializeRelationship(relationships: LogicVM[], relationship: VerificationRelationship): z.infer<typeof verificationMethodsSchema> {
        return relationships.map(method => this.serializeVerificationMethod(method, method.usage[relationship]!))
    }

    public serialize(): z.infer<typeof documentSchema> {
        const relationships: Record<string, any> = {}
        verificationRelationships.map(relationship => {
            const existingRelationships = this.getRelationships(relationship)
            if (existingRelationships.length) relationships[relationship as string] = this.serializeRelationship(existingRelationships, relationship)
        })
        return {
            ['@context']: this.getContexts(),
            id: this.id,
            controller: this.controller,
            ...relationships
        }
    }
}

// DEPRECATED
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

export function deriveIdentificationFragment(format: EmbeddedMaterial, rawKeyMaterial: Uint8Array): string {
    if (format === 'JsonWebKey2020') return jwkThumbprintByEncoding(encodeJsonWebKey(rawKeyMaterial), "SHA-256", 'base64url')!
    else if (format === 'Multibase') return encodeMultibaseKey(rawKeyMaterial)
    else {
        throw new Error('Unsupported keytype')
    }

}

function encodeMultibaseKey(rawKeyMaterial: Uint8Array): string {
    const p256codec = [0x80, 0x24]
    const ec = new EC('p256')
    const keypair = ec.keyFromPublic(rawKeyMaterial)
    const keyMaterialCompactForm = keypair.getPublic(true, 'array')
    const multibase = b58.base58btc.encode(new Uint8Array([...p256codec, ...keyMaterialCompactForm]))
    return multibase.toString()
}

export function exportPrivateKey(keypair: EC.KeyPair): JsonWebKey {
    const dBytes = new Uint8Array(keypair.getPrivate().toArray())
    const xBytes = new Uint8Array(keypair.getPublic().getX().toArray())
    const yBytes = new Uint8Array(keypair.getPublic().getY().toArray())
    const d = b64.base64url.baseEncode(dBytes)
    const x = b64.base64url.baseEncode(xBytes)
    const y = b64.base64url.baseEncode(yBytes)

    return {
        crv: "P-256",
        d,
        kty: "EC",
        x,
        y,
    }
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

export function decodeP256Jwk(key: JsonWebKey): Uint8Array {
    const ec = new EC('p256')
    const POINT_COMPRESSION = 0x04
    if (!key.x || !key.y) throw new Error('Invalid key')
    const x = b64.base64url.baseDecode(key.x)
    const y = b64.base64url.baseDecode(key.y)
    const keypair = ec.keyFromPublic([POINT_COMPRESSION, ...x, ...y])
    return new Uint8Array(keypair.getPublic(false, 'array'))
}

export const decodeVerificationMethod = (verificationMethod: z.infer<typeof verificationMethodSchema>, method: VerificationRelationship): LogicVM => {
    if (typeof verificationMethod === "string") {
        return {
            id: verificationMethod,
            usage: { [method]: 'Reference' }
        }
    }

    let keyMaterial
    let curve: SupportedCurves | undefined
    let representation: Representation | undefined
    let format: EmbeddedMaterial | undefined

    if (verificationMethod.type) {
        const ec = new EC('p256')
        curve = 'P-256'
        representation = 'Embedded'
        if (verificationMethod.type === 'JsonWebKey2020') {
            format = 'JsonWebKey2020'
            // Set point compression to uncompressed as we are dealing with x and y in JWK
            if (!verificationMethod.publicKeyJwk) throw new Error('Invalid type: "JsonWebKey2020" must contain "publicKeyJwk"')
            keyMaterial = decodeP256Jwk(verificationMethod.publicKeyJwk)
        }
        else if (verificationMethod.type === 'P256Key2021') {
            format = 'Multibase'
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

    if (!keyMaterial || !curve || !representation || !format) throw Error('Invalid key')

    return {
        id: verificationMethod.id,
        curve: curve,
        controller: verificationMethod.controller,
        keyMaterial,
        format,
        usage: { [method]: representation }
    }
}

export const didDocumentDeserializer = (document: z.infer<typeof documentSchema>): DidDocument => {
    const verificationMethods: LogicVM[] = []
    verificationRelationships.map(relationship => {
        if (document[relationship]) {
            document[relationship]!.forEach(vm => verificationMethods.push(decodeVerificationMethod(vm, relationship)))
        }
    })

    const denormalized: LogicVM[] = []
    for (let vm of verificationMethods) {
        const existingIndex = denormalized.findIndex((t) => t.id === vm.id)
        const apa = denormalized[existingIndex]
        if (existingIndex < 0) denormalized.push(vm)
        else {
            if (isEmbeddedVm(apa) && isEmbeddedVm(vm)) {
                if (vm.keyMaterial.toString() !== apa.keyMaterial.toString()) {
                    denormalized.push(vm)
                } else {
                    apa.usage = { ...apa.usage, ...vm.usage }
                    denormalized[existingIndex] = apa
                }
            } else {
                vm.usage = { ...apa.usage, ...vm.usage }
                denormalized[existingIndex] = vm
            }
        }
    }

    return new DidDocument(document.id, document.controller, denormalized)
}

