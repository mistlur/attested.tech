import { describe, expect, it } from "vitest";
import { CurveEd25519, CurveP256 } from "./curves";
import { EmbeddedMaterial } from "./DidMaterial";

// Fetched from https://www.rfc-editor.org/rfc/rfc8037#appendix-A
const ed25519PublicKeyBytes = new Uint8Array([
  0xd7, 0x5a, 0x98, 0x01, 0x82, 0xb1, 0x0a, 0xb7, 0xd5, 0x4b, 0xfe, 0xd3, 0xc9,
  0x64, 0x07, 0x3a, 0x0e, 0xe1, 0x72, 0xf3, 0xda, 0xa6, 0x23, 0x25, 0xaf, 0x02,
  0x1a, 0x68, 0xf7, 0x07, 0x51, 0x1a,
]);

// Fetched from https://www.rfc-editor.org/rfc/rfc7517.html#appendix-A.1
const p256PublicKeyBytes = new Uint8Array([
  0x04, 0x30, 0xa0, 0x42, 0x4c, 0xd2, 0x1c, 0x29, 0x44, 0x83, 0x8a, 0x2d, 0x75,
  0xc9, 0x2b, 0x37, 0xe7, 0x6e, 0xa2, 0x0d, 0x9f, 0x00, 0x89, 0x3a, 0x3b, 0x4e,
  0xee, 0x8a, 0x3c, 0x0a, 0xaf, 0xec, 0x3e, 0xe0, 0x4b, 0x65, 0xe9, 0x24, 0x56,
  0xd9, 0x88, 0x8b, 0x52, 0xb3, 0x79, 0xbd, 0xfb, 0xd5, 0x1e, 0xe8, 0x69, 0xef,
  0x1f, 0x0f, 0xc6, 0x5b, 0x66, 0x59, 0x69, 0x5b, 0x6c, 0xce, 0x08, 0x17, 0x23,
]);

describe("serialize", () => {
  it("ED25519 - JWK", () => {
    const material = new EmbeddedMaterial(
      "#z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw",
      {
        controller: "did:web:example.com",
        format: "JsonWebKey2020",
        curve: CurveEd25519,
        usage: Object.fromEntries(
          CurveEd25519.capabilities.map((capability) => [
            capability,
            "Reference",
          ])
        ),
        keyMaterial: ed25519PublicKeyBytes,
      }
    );

    const expected = {
      id: "#z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw",
      type: "JsonWebKey2020",
      controller: "did:web:example.com",
      publicKeyJwk: {
        crv: "Ed25519",
        kty: "OKP",
        x: "11qYAYKxCrfVS_7TyWQHOg7hcvPapiMlrwIaaPcHURo",
      },
    };

    expect(expected).toStrictEqual(material.serialize("Embedded"));
  });

  it("ED25519 - Multibase", () => {
    const material = new EmbeddedMaterial(
      "#z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw",
      {
        controller: "did:web:example.com",
        format: "Multibase",
        curve: CurveEd25519,
        usage: Object.fromEntries(
          CurveEd25519.capabilities.map((capability) => [
            capability,
            "Reference",
          ])
        ),
        keyMaterial: ed25519PublicKeyBytes,
      }
    );

    const expected = {
      id: "#z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw",
      type: "ED25519Key2020",
      controller: "did:web:example.com",
      publicKeyMultibase: "z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw",
    };

    expect(expected).toStrictEqual(material.serialize("Embedded"));
  });

  it("P-256   - JWK", () => {
    const material = new EmbeddedMaterial(
      "#cn-I_WNMClehiVp51i_0VpOENW1upEerA8sEam5hn-s",
      {
        controller: "did:web:example.com",
        format: "JsonWebKey2020",
        curve: CurveP256,
        usage: Object.fromEntries(
          CurveEd25519.capabilities.map((capability) => [
            capability,
            "Reference",
          ])
        ),
        keyMaterial: p256PublicKeyBytes,
      }
    );

    const expected = {
      id: "#cn-I_WNMClehiVp51i_0VpOENW1upEerA8sEam5hn-s",
      type: "JsonWebKey2020",
      controller: "did:web:example.com",
      publicKeyJwk: {
        crv: "P-256",
        kty: "EC",
        x: "MKBCTNIcKUSDii11ySs3526iDZ8AiTo7Tu6KPAqv7D4",
        y: "4Etl6SRW2YiLUrN5vfvVHuhp7x8PxltmWWlbbM4IFyM",
      },
    };

    expect(expected).toStrictEqual(material.serialize("Embedded"));
  });

  it("P-256   - Multibase", () => {
    const material = new EmbeddedMaterial(
      "#cn-I_WNMClehiVp51i_0VpOENW1upEerA8sEam5hn-s",
      {
        controller: "did:web:example.com",
        format: "Multibase",
        curve: CurveP256,
        usage: Object.fromEntries(
          CurveEd25519.capabilities.map((capability) => [
            capability,
            "Reference",
          ])
        ),
        keyMaterial: p256PublicKeyBytes,
      }
    );

    const expected = {
      id: "#cn-I_WNMClehiVp51i_0VpOENW1upEerA8sEam5hn-s",
      type: "P256Key2021",
      controller: "did:web:example.com",
      publicKeyMultibase: "zDnaekw6iisW1j4ronMuZagbvVehJK4unit6kvZ8UqJ2LSG1j",
    };

    expect(expected).toStrictEqual(material.serialize("Embedded"));
  });
});
