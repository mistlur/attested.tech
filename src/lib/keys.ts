import { ec as EC } from 'elliptic'
import * as b58 from 'multiformats/bases/base58'
import * as b64 from 'multiformats/bases/base64'
import { KeyFormat } from "@/types/dids";
import { jwkThumbprintByEncoding } from 'jwk-thumbprint';

export function deriveIdentificationFragment(format: KeyFormat, rawKeyMaterial: Uint8Array): string {
  if (format === 'JsonWebKey2020') return jwkThumbprintByEncoding(encodeJsonWebKey(rawKeyMaterial), "SHA-256", 'base64url')!
  else if (format === 'Multibase') return encodeMultibaseKey(rawKeyMaterial)
  else {
    throw new Error('Unsupported keytype')
  }
}

export function encodeMultibaseKey(rawKeyMaterial: Uint8Array): string {
  const p256codec = [0x80, 0x24]
  const ec = new EC('p256')
  const keypair = ec.keyFromPublic(rawKeyMaterial)
  const keyMaterialCompactForm = keypair.getPublic(true, 'array')
  const multibase = b58.base58btc.encode(new Uint8Array([...p256codec, ...keyMaterialCompactForm]))
  return multibase.toString()
}

export function encodeJsonWebKey(rawKeyMaterial: Uint8Array): JsonWebKey {
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

export function decodeP256Jwk(key: JsonWebKey): Uint8Array {
  const ec = new EC('p256')
  // Set point compression to uncompressed as we are dealing with x and y in JWK
  const POINT_COMPRESSION = 0x04
  if (!key.x || !key.y) throw new Error('Invalid key')
  const x = b64.base64url.baseDecode(key.x)
  const y = b64.base64url.baseDecode(key.y)
  //@ts-ignore
  const keypair = ec.keyFromPublic([POINT_COMPRESSION, ...x, ...y])
  return new Uint8Array(keypair.getPublic(false, 'array'))
}