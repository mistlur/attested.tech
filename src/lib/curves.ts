import { VerificationRelationship } from "@/types/dids";

export type Curve = {
  name: {
    display: string;
    jwk: string;
    elliptic: string;
  };
  capabilities: VerificationRelationship[];
};

export const CurveP256: Curve = {
  name: {
    display: "P-256",
    jwk: "P-256",
    elliptic: "p256",
  },
  capabilities: [
    "authentication",
    "assertionMethod",
    "keyAgreement",
    "capabilityInvocation",
    "capabilityDelegation",
  ] as VerificationRelationship[],
};

export const CurveEd25519: Curve = {
  name: {
    display: "Ed25519",
    jwk: "Ed25519",
    elliptic: "ed25519",
  },
  capabilities: [
    "authentication",
    "assertionMethod",
    "capabilityInvocation",
    "capabilityDelegation",
  ] as VerificationRelationship[],
};

export const isP256 = (curve: Curve): boolean => {
  return curve.name.jwk === "P-256" || curve.name.elliptic === "p256";
};

export const isEd25519 = (curve: Curve): boolean => {
  return curve.name.jwk === "Ed25519" || curve.name.elliptic === "ed25519";
};

export function curveFromName(name: string): Curve {
  if (name === "p256" || name === "P-256") return CurveP256;
  else if (name === "Ed25519" || name === "ed25519") return CurveEd25519;
  else throw new Error(`UnsupportedCurveError: ${name}`);
}

export function curveToName(curve: Curve, format: "jwk" | "elliptic"): string {
  console.log(curve);
  if (isP256(curve)) {
    if (format === "elliptic") return "p256";
    if (format === "jwk") return "P-256";
  }

  if (isEd25519(curve)) {
    if (format === "elliptic") return "ed25519";
    if (format === "jwk") return "Ed25519";
  }

  throw new Error(`Unsupported curve: ${curve}`);
}
