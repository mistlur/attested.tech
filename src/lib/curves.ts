export type CurveP256 = "p256" | "P-256"
export type CurveEd25519 = "Ed25519" | "ed25519"
export type NSupportedCurves = CurveP256 | CurveEd25519;

export const isP256 = (curve: NSupportedCurves): curve is CurveP256 => {
  return curve === "p256" || curve === "P-256";
}

export const isEd25519 = (curve: NSupportedCurves): curve is CurveEd25519 => {
  return curve === "Ed25519" || curve === "ed25519";
}

export function curveName<T extends NSupportedCurves>(curve: T, format: "jwk" | "elliptic"): NSupportedCurves {
  if (curve === "p256" || curve === "P-256") {
    if (format === "elliptic") return "p256"
    if (format === "jwk") return "P-256"
  }

  if (curve === "Ed25519" || curve === "ed25519") {
    if (format === "elliptic") return "ed25519"
    if (format === "jwk") return "Ed25519"
  }

  throw new Error(`Unsupported curve: ${curve}`)
}
