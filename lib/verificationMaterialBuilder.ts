import { z } from 'zod'
import { getCompleteDid } from './did';
import { documentSchema, verificationMethodSchema } from './didParser'
import * as b58 from 'multiformats/bases/base58'
import * as b64 from 'multiformats/bases/base64'
import { ec as EC } from 'elliptic'
import { jwkThumbprintByEncoding } from 'jwk-thumbprint';

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

export const encodeVerificationMethod = (vm: LogicVM): z.infer<typeof verificationMethodSchema> => {
    // TODO: Preserve the correct fingerprint when translating
    if (isKeyVm(vm)) {
        const controller = vm.id
        if (vm.representation === 'JsonWebKey2020') {
            const publicKeyJwk = encodeJsonWebKey(vm.keyMaterial)
            const fragment = jwkThumbprintByEncoding(publicKeyJwk, "SHA-256", 'base64url'); // TODO extract key fragmentation
            return {
                id: `${vm.id}#${fragment}`,
                type: 'JsonWebKey2020',
                controller,
                publicKeyJwk,
            }
        } else {
            return {
                id: `${vm.id}#${encodeMultibaseKey(vm.keyMaterial)}`,
                type: 'P256Key2021',
                controller,
                publicKeyMultibase: encodeMultibaseKey(vm.keyMaterial)
            }
        }
    } else {
        return vm
    }

}

export const newVerificationMaterial = async (id: string, withKey?: boolean): Promise<LogicVM> => {
    if (withKey) {
        const keys = await generateKey()
        const keyMaterial = new Uint8Array(await window.crypto.subtle.exportKey('raw', keys.publicKey))
        return {
            id: getCompleteDid(id),
            keyMaterial,
            keyType: 'p256',
            representation: 'JsonWebKey2020'
        }
    }

    return {
        id: 'smirpererss' // TODO: sigh...
    }
}

export const decodeVerificationMethod = (verificationMethod: z.infer<typeof verificationMethodSchema>) => {
    let keyMaterial
    let keyType
    let representation: Representation | undefined
    if (verificationMethod.type) {
        const ec = new EC('p256')
        keyType = 'p256'
        if (verificationMethod.type === 'JsonWebKey2020') {
            representation = 'JsonWebKey2020'
            if (!verificationMethod.publicKeyJwk || !verificationMethod.publicKeyJwk.x || !verificationMethod.publicKeyJwk.y) throw new Error('Invalid key') // TODO: better error handling
            const keypair = ec.keyFromPublic({ x: verificationMethod.publicKeyJwk.x, y: verificationMethod.publicKeyJwk.y })
            keyMaterial = new Uint8Array(keypair.getPublic(false, 'array'))
        }
        else if (verificationMethod.type === 'P256Key2021') {
            representation = 'Multibase'
            if (!verificationMethod.publicKeyMultibase) throw new Error('Invalid key') // TODO: better error handling
            const multibase = b58.base58btc.decode(verificationMethod.publicKeyMultibase)
            const keyBytes = multibase.slice(2) // Omitting the first two codec bytes (0x12, 0x00) TODO: This can probably be done better by multicodec...
            // TODO assert keysize
            const keypair = ec.keyFromPublic(keyBytes)
            keyMaterial = new Uint8Array(keypair.getPublic(false, 'array'))
        }
    }

    if (!keyMaterial || !keyType || !representation) throw Error('Invalid key')

    return {
        id: verificationMethod.id,
        keyType,
        keyMaterial,
        representation,
    }
}

const contextProvider = (verificationMethods: LogicVM[]): string[] => {
    console.log(verificationMethods)
    const representationsUsed = [...new Set(verificationMethods.filter(vm => isKeyVm(vm)).map((vm) => (vm as KeyVm).representation))].map(representation => {
        switch (representation) {
            case 'JsonWebKey2020': return "https://w3id.org/security/suites/jws-2020/v1"
            case 'Multibase': return "https://w3id.org/security/suites/multikey-2021/v1"
            default: return ''
        }
    })
    return ["https://www.w3.org/ns/did/v1", ...representationsUsed]
}

export const didDocumentEncoder = (logicDocument: LogicDocument): z.infer<typeof documentSchema> => {
    return {
        ['@context']: contextProvider(logicDocument.verificationMethods),
        id: logicDocument.id,
        controller: logicDocument.controller,
        verificationMethod: logicDocument.verificationMethods.map(vm => encodeVerificationMethod(vm))
    }
}

export function isKeyVm(vm: KeyVm | RefVm): vm is KeyVm { // TODO: Better typeguard?
    return (vm as KeyVm).keyMaterial !== undefined;
}

export type Representation = 'JsonWebKey2020' | 'Multibase'

export type KeyVm = {
    id: string;
    keyType: string;
    keyMaterial: Uint8Array;
    representation: Representation
}

export type RefVm = {
    id: string
}

export type LogicVM = KeyVm | RefVm

export type LogicDocument = {
    id: string,
    controller: string | undefined,
    verificationMethods: LogicVM[]
}

export const didDocumentDecoder = (document: z.infer<typeof documentSchema>) => {
    const verificationMethods = document.verificationMethod ? document.verificationMethod.map(vm => decodeVerificationMethod(vm)) : []
    return {
        id: document.id,
        controller: document.controller,
        verificationMethods
    }
}