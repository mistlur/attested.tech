import { ec as EC, eddsa as EdDSA } from "elliptic";
import * as b58 from "multiformats/bases/base58";
import * as b64 from "multiformats/bases/base64";
import { EmbeddedType } from "@/types/dids";
import * as jose from "jose";
import { Curve, curveFromName, curveToName, isEd25519, isP256 } from "./curves";

export async function deriveIdentificationFragment(
  material: EmbeddedType
): Promise<string> {
  let fragment: string;
  let fragmentDelimiter = "#";
  if (material.format === "JsonWebKey2020")
    fragment = await jose.calculateJwkThumbprint(
      encodeJsonWebKey(material) as jose.JWK
    );
  else if (material.format === "Multibase")
    fragment = encodeMultibaseKey(material);
  else {
    throw new Error(
      `EncodingError: Failed deriving id-fragment for material. Unsupported keytype ${material.format}`
    );
  }
  return `${fragmentDelimiter}${fragment}`;
}

export function generateKeyPair(curve: Curve): {
  privateKey: JsonWebKey;
  publicKey: Uint8Array;
} {
  const ec = new EC(curveToName(curve, "elliptic"));
  const keyPair = ec.genKeyPair();
  const publicKey = isP256(curve)
    ? new Uint8Array(keyPair.getPublic().encode("array", false))
    : new Uint8Array(keyPair.getPublic().getX().toArray());
  const privateKey = exportPrivateKey(keyPair, curve);
  return {
    privateKey,
    publicKey,
  };
}

// -----------------------------------------------------------------------------
// GENERIC HELPERS
// -----------------------------------------------------------------------------

function getCryptoSuite(curve: Curve) {
  const c = curveToName(curve, "elliptic");
  if (isP256(curve)) {
    return new EC(c);
  } else if (isEd25519(curve)) {
    return new EdDSA(c);
  } else throw Error(`CryptographyError: Unsupported curve ${curve}`);
}

function getKeyCompactForm(material: EmbeddedType): {
  bytes: Uint8Array;
  points: Record<string, number[]>;
} {
  const ec = getCryptoSuite(material.curve);
  const keypair = ec.keyFromPublic(material.keyMaterial);
  const bytes = keypair.getPublic(true, "array") as Uint8Array;
  let points = {};
  if (isEd25519(material.curve)) {
    points = { x: b64.base64url.baseEncode(bytes) };
  } else if (isP256(material.curve)) {
    const xBytes = new Uint8Array(keypair.getPublic().getX().toArray());
    const yBytes = new Uint8Array(keypair.getPublic().getY().toArray());
    const x = b64.base64url.baseEncode(xBytes);
    const y = b64.base64url.baseEncode(yBytes);
    points = { x, y };
  } else throw Error(`EncodingError: Unsupported curve: ${material.curve}`);
  return { bytes, points };
}

// -----------------------------------------------------------------------------
// MULTIBASE
// -----------------------------------------------------------------------------

export function getMultibaseCodec(material: EmbeddedType): number[] {
  // Codecs taken from https://github.com/multiformats/multicodec/blob/master/table.csv
  if (isP256(material.curve)) {
    return [0x80, 0x24];
  } else if (isEd25519(material.curve)) {
    return [0xed, 0x01];
  } else
    throw Error(`MultibaseEncodingError: Unsupported curve ${material.curve}`);
}

export function encodeMultibaseKey(material: EmbeddedType): string {
  const codec = getMultibaseCodec(material);
  const keyMaterialCompactForm = getKeyCompactForm(material);
  const multibase = b58.base58btc.encode(
    //@ts-ignore
    new Uint8Array([...codec, ...keyMaterialCompactForm.bytes])
  );
  return multibase.toString();
}

// -----------------------------------------------------------------------------
// JWK
// -----------------------------------------------------------------------------

function getJwkKty(curve: Curve): string {
  if (isP256(curve)) return "EC";
  else if (isEd25519(curve)) return "OKP";
  else
    throw Error(`EncodingError: JWK encoding unsupported for curve ${curve}`);
}

export function encodeJsonWebKey(material: EmbeddedType): JsonWebKey {
  const kty = getJwkKty(material.curve);
  const keyMaterialCompactForm = getKeyCompactForm(material);
  return {
    crv: curveToName(material.curve, "jwk"),
    kty,
    ...keyMaterialCompactForm.points,
  };
}

export function decodeJwk(key: JsonWebKey): Uint8Array {
  if (!key.crv) throw new Error("Invalid key");
  const curve = curveFromName(key.crv);
  const ec = getCryptoSuite(curve);
  let bytes: Uint8Array;
  if (isEd25519(curve)) {
    if (!key.x) throw new Error("Invalid key");
    bytes = b64.base64url.baseDecode(key.x);
  } else if (isP256(curve)) {
    if (!key.x || !key.y) throw new Error("Invalid key");
    const x = b64.base64url.baseDecode(key.x);
    const y = b64.base64url.baseDecode(key.y);
    // Set point compression to uncompressed as we are dealing with x and y in JWK
    const POINT_COMPRESSION = 0x04;
    //@ts-ignore
    bytes = [POINT_COMPRESSION, ...x, ...y];
  } else {
    throw new Error(`DecodingError: Unsupported curve ${key.crv}`);
  }
  //@ts-ignore
  const keypair = ec.keyFromPublic(bytes);
  return new Uint8Array(keypair.getPublic(false, "array"));
}

export function exportPrivateKey(
  keypair: EC.KeyPair,
  curve: Curve
): JsonWebKey {
  const dBytes = new Uint8Array(keypair.getPrivate().toArray());
  const xBytes = new Uint8Array(keypair.getPublic().getX().toArray());
  const yBytes = new Uint8Array(keypair.getPublic().getY().toArray());
  const d = b64.base64url.baseEncode(dBytes);
  const x = b64.base64url.baseEncode(xBytes);
  const y = b64.base64url.baseEncode(yBytes);

  let points;
  let kty;

  if (isP256(curve)) {
    kty = "EC";
    points = {
      x,
      y,
    };
  } else if (isEd25519(curve)) {
    kty = "OKP";
    points = { x };
  } else
    throw new Error(
      `KeyExportError: Private key export for curve ${curve} not supported`
    );

  return {
    crv: curveToName(curve, "jwk"),
    d,
    kty,
    ...points,
  };
}
