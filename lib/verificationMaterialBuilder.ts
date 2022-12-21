import { z } from 'zod'
import { getCompleteDid } from './did';
import { documentSchema, verificationMethodSchema } from './didParser'
import * as b58 from 'multiformats/bases/base58'
import { ec as EC } from 'elliptic'

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

function getMultiKeyBase(rawKeyMaterial: Uint8Array): string {
    const p256codec = [0x80, 0x24]
    const ec = new EC('p256')
    const keypair = ec.keyFromPublic(rawKeyMaterial)
    const keyMaterialCompactForm = keypair.getPublic(true, 'array')
    const multibase = b58.base58btc.encode(new Uint8Array([...p256codec, ...keyMaterialCompactForm]))
    return multibase.toString()
}

function getKeyJwk(rawKeyMaterial: Uint8Array): JsonWebKey {
    const ec = new EC('p256')
    const keypair = ec.keyFromPublic(rawKeyMaterial)
    return {
        crv: "P-256",
        kty: "EC",
        x: keypair.getPublic().getX().toString(), // TODO: This is the wrong value
        y: keypair.getPublic().getY().toString(), // TODO: This is the wrong value
    }
}

export const representVerificationMaterial = (representation: string, id: string, rawKeyMaterial: Uint8Array): z.infer<typeof verificationMethodSchema> => {
    if (representation === 'JsonWebKey2020') {
        return {
            id: `${getCompleteDid(id)}#FINGERPRINT`, // TODO: Add fingerprinting here
            type: 'JsonWebKey2020',
            controller: getCompleteDid(id),
            publicKeyJwk: getKeyJwk(rawKeyMaterial)
        }
    } else {
        return {
            id: `${getCompleteDid(id)}#FINGERPRINT`, // TODO: Add fingerprinting here
            type: 'P256Key2021',
            controller: getCompleteDid(id),
            publicKeyMultibase: getMultiKeyBase(rawKeyMaterial)
        }
    }

}

export const newVerificationMaterial = async (): Promise<Uint8Array> => {
    const keys = await generateKey()
    return new Uint8Array(await window.crypto.subtle.exportKey('raw', keys.publicKey))
}

// Move to separate file

export const decodeVerificationMethod = (verificationMethod: z.infer<typeof verificationMethodSchema>) => {
    let keyMaterial
    let keyType
    if (verificationMethod.type) {
        const ec = new EC('p256')
        keyType = 'p256'
        if (verificationMethod.type === 'JsonWebKey2020') {
            if (!verificationMethod.publicKeyJwk || !verificationMethod.publicKeyJwk.x || !verificationMethod.publicKeyJwk.y) throw new Error('Invalid key') // TODO: better error handling
            const keypair = ec.keyFromPublic({ x: verificationMethod.publicKeyJwk.x, y: verificationMethod.publicKeyJwk.y })
            keyMaterial = new Uint8Array(keypair.getPublic(false, 'array'))
        }
        else if (verificationMethod.type === 'P256Key2021') {
            if (!verificationMethod.publicKeyMultibase) throw new Error('Invalid key') // TODO: better error handling
            const multibase = b58.base58btc.decode(verificationMethod.publicKeyMultibase)
            const keyBytes = multibase.slice(2) // Omitting the first two codec bytes (0x12, 0x00) TODO: This can probably be done better by multicodec...
            // TODO assert keysize
            const keypair = ec.keyFromPublic(keyBytes)
            keyMaterial = new Uint8Array(keypair.getPublic(false, 'array'))
        }
    }

    if (!keyMaterial || !keyType) throw Error('Invalid key')

    return {
        id: verificationMethod.id,
        keyType,
        keyMaterial
    }
}

export const encodeVerificationMethod = (verificationMethod: LogicVM, repr: string): z.infer<typeof verificationMethodSchema> => {
    return representVerificationMaterial(repr, verificationMethod.id, verificationMethod.keyMaterial)
}

export const didDocumentEncoder = (logicDocument: LogicDocument, repr = 'JsonWebKey2020'): z.infer<typeof documentSchema> => {
    return {
        id: logicDocument.id,
        controller: logicDocument.controller,
        verificationMethod: logicDocument.verificationMethods.map(vm => encodeVerificationMethod(vm, repr))
    }
}

export type LogicVM = {
    id: string;
    keyType: string;
    keyMaterial: Uint8Array;
}

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