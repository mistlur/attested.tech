import { ec as EC, eddsa as EdDSA } from "elliptic";
import * as b58 from "multiformats/bases/base58";
import * as b64 from "multiformats/bases/base64";
import {
  EmbeddedType,
  SupportedCurves,
} from "@/types/dids";
import * as jose from 'jose'

export async function deriveIdentificationFragment(
  material: EmbeddedType
): Promise<string> {
  let fragment: string
  let fragmentDelimiter = "#"
  if (material.format === "JsonWebKey2020")
    fragment = await jose.calculateJwkThumbprint(
      encodeJsonWebKey(material) as jose.JWK,
    )
  else if (material.format === "Multibase") fragment = encodeMultibaseKey(material)
  else {
    throw new Error(`Encoding error: Failed deriving id-fragment for material. Unsupported keytype ${material.format}`)
  }
  return `${fragmentDelimiter}${fragment}`
}

export function generateKeyPair(curve: SupportedCurves): { privateKey: JsonWebKey, publicKey: Uint8Array } {
  const ec = curve === "P-256" ? new EC("p256") : EC("ed25519");
  const keyPair = ec.genKeyPair();
  const publicKey = curve === 'P-256' ? new Uint8Array(keyPair.getPublic().encode("array", false)) : new Uint8Array(keyPair.getPublic().getX().toArray())
  const privateKey = exportPrivateKey(keyPair, curve)
  return {
    privateKey,
    publicKey,
  }
}

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------

function getCryptoSuite(curve: string) {
  if (curve.toLowerCase() === 'p-256') {
    return new EC("p256");
  } else if (curve.toLowerCase() === 'ed25519') {
    return new EdDSA("ed25519");
  } else throw Error(`Unsupported curve: ${curve}`)
}

function getKeyCompactForm(material: EmbeddedType): { bytes: Uint8Array, points: Record<string, number[]> } {
  const ec = getCryptoSuite(material.curve)
  const keypair = ec.keyFromPublic(material.keyMaterial)
  const bytes = keypair.getPublic(true, "array") as Uint8Array
  let points = {}
  if (material.curve === 'Ed25519') {
    points = { x: b64.base64url.baseEncode(bytes) }
  } else if (material.curve === 'P-256') {
    const xBytes = new Uint8Array(keypair.getPublic().getX().toArray());
    const yBytes = new Uint8Array(keypair.getPublic().getY().toArray());
    const x = b64.base64url.baseEncode(xBytes);
    const y = b64.base64url.baseEncode(yBytes);
    points = { x, y }
  }
  else throw Error(`Unsupported curve: ${material.curve}`)
  return { bytes, points }
}

// -----------------------------------------------------------------------------
// MULTIBASE
// -----------------------------------------------------------------------------
export function getMultibaseCodec(material: EmbeddedType): number[] {
  // Codecs taken from https://github.com/multiformats/multicodec/blob/master/table.csv
  if (material.curve === 'P-256') {
    return [0x80, 0x24]
  } else if (material.curve === 'Ed25519') {
    return [0xED, 0x01]
  } else throw Error(`Unsupported curve: Missing codec for ${material.curve}`)
}

export function encodeMultibaseKey(material: EmbeddedType): string {
  const codec = getMultibaseCodec(material)
  const keyMaterialCompactForm = getKeyCompactForm(material)
  const multibase = b58.base58btc.encode(
    //@ts-ignore
    new Uint8Array([...codec, ...keyMaterialCompactForm.bytes])
  );
  return multibase.toString();
}

// -----------------------------------------------------------------------------
// JWK
// -----------------------------------------------------------------------------

export function encodeJsonWebKey(
  material: EmbeddedType
): JsonWebKey {
  if (material.curve === "P-256") return encodeP256JsonWebKey(material)
  if (material.curve === "Ed25519") return encodeEd25519JsonWebKey(material)
  else throw Error(`Encoding error: JWK encoding of '${material.curve}' is not supported`)
}

export function encodeEd25519JsonWebKey(material: EmbeddedType): JsonWebKey {
  const keyMaterialCompactForm = getKeyCompactForm(material)
  return {
    crv: "Ed25519",
    kty: "OKP",
    ...keyMaterialCompactForm.points,
  };
}

function encodeP256JsonWebKey(material: EmbeddedType) {
  const keyMaterialCompactForm = getKeyCompactForm(material)
  return {
    crv: "P-256",
    kty: "EC",
    ...keyMaterialCompactForm.points,
  };
}

export function decodeJwk(key: JsonWebKey): Uint8Array {
  const ec = getCryptoSuite(key.crv)
  if (!key.crv) throw new Error('Invalid key')
  let bytes: Uint8Array
  if (key.crv === 'Ed25519') {
    if (!key.x) throw new Error("Invalid key")
    bytes = b64.base64url.baseDecode(key.x)
  } else if (key.crv === 'P-256') {
    if (!key.x || !key.y) throw new Error("Invalid key")
    const x = b64.base64url.baseDecode(key.x);
    const y = b64.base64url.baseDecode(key.y);
    // Set point compression to uncompressed as we are dealing with x and y in JWK
    const POINT_COMPRESSION = 0x04;
    //@ts-ignore
    bytes = [POINT_COMPRESSION, ...x, ...y]
  } else {
    throw new Error(`DecodingError: Unsupported curve ${key.crv}`)
  }
  //@ts-ignore
  const keypair = ec.keyFromPublic(bytes);
  return new Uint8Array(keypair.getPublic(false, "array"));
}

export function exportPrivateKey(
  keypair: EC.KeyPair,
  curve: SupportedCurves
): JsonWebKey {
  const dBytes = new Uint8Array(keypair.getPrivate().toArray());
  const xBytes = new Uint8Array(keypair.getPublic().getX().toArray());
  const yBytes = new Uint8Array(keypair.getPublic().getY().toArray());
  const d = b64.base64url.baseEncode(dBytes);
  const x = b64.base64url.baseEncode(xBytes);
  const y = b64.base64url.baseEncode(yBytes);

  return {
    crv: curve === "P-256" ? "P-256" : "Ed25519",
    d,
    kty: curve === "P-256" ? "EC" : "OKP",
    x,
    ...(curve === "P-256" && { y }),
  };
}
