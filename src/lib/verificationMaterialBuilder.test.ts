import { describe, expect, it } from "vitest";
import {
  decodeVerificationRelationship,
  didDocumentDeserializer,
} from "./verificationMaterialBuilder";
import { EmbeddedType } from "../types/dids";

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

describe("decodeVerificationRelationship", () => {
  it("ED25519 - JWK", () => {
    const material = {
      id: "#z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw",
      type: "JsonWebKey2020",
      controller: "did:web:example.com",
      publicKeyJwk: {
        crv: "Ed25519",
        kty: "OKP",
        x: "11qYAYKxCrfVS_7TyWQHOg7hcvPapiMlrwIaaPcHURo",
      },
    };

    const result = decodeVerificationRelationship(
      material,
      "verificationMethod"
    ).material as EmbeddedType;

    expect(result.format).eq("JsonWebKey2020");
    expect(result.keyMaterial).toStrictEqual(ed25519PublicKeyBytes);
    expect(result.curve.capabilities).toStrictEqual([
      "authentication",
      "assertionMethod",
      "capabilityInvocation",
      "capabilityDelegation",
    ]);
  });

  it("ED25519 - Multibase", () => {
    const material = {
      id: "#z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw",
      type: "ED25519Key2020",
      controller: "did:web:example.com",
      publicKeyMultibase: "z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw",
    };

    const result = decodeVerificationRelationship(
      material,
      "verificationMethod"
    ).material as EmbeddedType;

    expect(result.format).eq("Multibase");
    expect(result.keyMaterial).toStrictEqual(ed25519PublicKeyBytes);
    expect(result.curve.capabilities).toStrictEqual([
      "authentication",
      "assertionMethod",
      "capabilityInvocation",
      "capabilityDelegation",
    ]);
  });

  it("P-256   - JWK", () => {
    const material = {
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

    const result = decodeVerificationRelationship(
      material,
      "verificationMethod"
    ).material as EmbeddedType;

    expect(result.format).eq("JsonWebKey2020");
    expect(result.keyMaterial).toStrictEqual(p256PublicKeyBytes);
    expect(result.curve.capabilities).toStrictEqual([
      "authentication",
      "assertionMethod",
      "keyAgreement",
      "capabilityInvocation",
      "capabilityDelegation",
    ]);
  });

  it("P-256   - Multibase", () => {
    const material = {
      id: "#cn-I_WNMClehiVp51i_0VpOENW1upEerA8sEam5hn-s",
      type: "P256Key2021",
      controller: "did:web:example.com",
      publicKeyMultibase: "zDnaekw6iisW1j4ronMuZagbvVehJK4unit6kvZ8UqJ2LSG1j",
    };

    const result = decodeVerificationRelationship(
      material,
      "verificationMethod"
    ).material as EmbeddedType;

    expect(result.format).eq("Multibase");
    expect(result.keyMaterial).toStrictEqual(p256PublicKeyBytes);
    expect(result.curve.capabilities).toStrictEqual([
      "authentication",
      "assertionMethod",
      "keyAgreement",
      "capabilityInvocation",
      "capabilityDelegation",
    ]);
  });

  it("Deflates DID ID to fragment", () => {
    const material = {
      id: "did:web:example.com#test",
      type: "P256Key2021",
      controller: "did:web:example.com",
      publicKeyMultibase: "zDnaekw6iisW1j4ronMuZagbvVehJK4unit6kvZ8UqJ2LSG1j",
    };
    const result = decodeVerificationRelationship(
      material,
      "verificationMethod"
    );
    expect(result.id).eq("#test");
  });

  it("Handles DID ID fragment", () => {
    const material = {
      id: "#test",
      type: "P256Key2021",
      controller: "did:web:example.com:7a2f1910-c345-4085-a71a-5d8dab53d44d",
      publicKeyMultibase: "zDnaekw6iisW1j4ronMuZagbvVehJK4unit6kvZ8UqJ2LSG1j",
    };
    const result = decodeVerificationRelationship(
      material,
      "verificationMethod"
    );
    expect(result.id).eq("#test");
  });

  it("Rejects unknown keys", () => {
    const material = {
      id: "#test",
      type: "SSSShard",
      controller: "did:web:example.com:7a2f1910-c345-4085-a71a-5d8dab53d44d",
      publicKeyMultibase: "fe2b18129e84befe14002f87091706ea3d1e43bc",
    };
    expect(() =>
      decodeVerificationRelationship(material, "verificationMethod")
    ).toThrowError("UnsupportedCurveError: SSSShard");
  });
});

describe("didDocumentDeserializer", () => {
  it("Parses empty Document", () => {
    const document = {
      "@context": ["https://www.w3.org/ns/did/v1"],
      id: "did:web:example.com",
    };
    const result = didDocumentDeserializer(document);
    expect(result.id).eq("did:web:example.com");
    expect(result.verificationMethod.length).eq(0);
    expect(result.services.length).eq(0);
    expect(result.controller).toStrictEqual(new Set());
  });

  it("Parses document with a verification method ", () => {
    const document = {
      "@context": [
        "https://www.w3.org/ns/did/v1",
        {
          JsonWebKey2020: "https://w3id.org/security/suites/jws-2020/v1",
          publicKeyJwk: {
            "@id": "https://w3id.org/security#publicKeyJwk",
            "@type": "@json",
          },
        },
      ],
      id: "did:web:example.com",
      verificationMethod: [
        {
          id: "did:web:example.com#JDzrbHaku0p7UBL5OJZV4qr3MGeLrgGBCy06CBFcXeU",
          type: "JsonWebKey2020",
          controller: "did:web:example.com",
          publicKeyJwk: {
            crv: "Ed25519",
            kty: "OKP",
            x: "PixgV6A3dqXgh7NrvZ0tXJhcqxCQwoxzZF28J8C9idI",
          },
        },
      ],
      authentication: ["#JDzrbHaku0p7UBL5OJZV4qr3MGeLrgGBCy06CBFcXeU"],
      assertionMethod: ["#JDzrbHaku0p7UBL5OJZV4qr3MGeLrgGBCy06CBFcXeU"],
      capabilityInvocation: ["#JDzrbHaku0p7UBL5OJZV4qr3MGeLrgGBCy06CBFcXeU"],
      capabilityDelegation: ["#JDzrbHaku0p7UBL5OJZV4qr3MGeLrgGBCy06CBFcXeU"],
    };
    const result = didDocumentDeserializer(document);
    expect(result.id).eq("did:web:example.com");
    expect(result.verificationMethod.length).eq(1);
    expect(result.verificationMethod[0].getUsage()).toStrictEqual({
      authentication: "Reference",
      assertionMethod: "Reference",
      capabilityInvocation: "Reference",
      capabilityDelegation: "Reference",
    });
    expect(result.services.length).eq(0);
    expect(result.controller).toStrictEqual(new Set());
  });

  it("Parses document with an embedded method", () => {
    const document = {
      "@context": [
        "https://www.w3.org/ns/did/v1",
        {
          JsonWebKey2020: "https://w3id.org/security/suites/jws-2020/v1",
          publicKeyJwk: {
            "@id": "https://w3id.org/security#publicKeyJwk",
            "@type": "@json",
          },
        },
      ],
      id: "did:web:example.com",
      authentication: [
        {
          id: "#JDzrbHaku0p7UBL5OJZV4qr3MGeLrgGBCy06CBFcXeU",
          type: "JsonWebKey2020",
          controller: "did:web:example.com",
          publicKeyJwk: {
            crv: "Ed25519",
            kty: "OKP",
            x: "PixgV6A3dqXgh7NrvZ0tXJhcqxCQwoxzZF28J8C9idI",
          },
        },
      ],
    };
    const result = didDocumentDeserializer(document);
    expect(result.id).eq("did:web:example.com");
    expect(result.verificationMethod.length).eq(1);
    expect(result.verificationMethod[0].getUsage()).toStrictEqual({
      authentication: "Embedded",
    });
    expect(result.services.length).eq(0);
    expect(result.controller).toStrictEqual(new Set());
  });

  it("Parses document with both referenced and embedded methods", () => {
    const document = {
      "@context": [
        "https://www.w3.org/ns/did/v1",
        {
          JsonWebKey2020: "https://w3id.org/security/suites/jws-2020/v1",
          publicKeyJwk: {
            "@id": "https://w3id.org/security#publicKeyJwk",
            "@type": "@json",
          },
        },
        "https://w3id.org/security/suites/multikey-2021/v1",
      ],
      id: "did:web:example.com",
      authentication: [
        {
          id: "#JDzrbHaku0p7UBL5OJZV4qr3MGeLrgGBCy06CBFcXeU",
          type: "JsonWebKey2020",
          controller: "did:web:example.com",
          publicKeyJwk: {
            crv: "Ed25519",
            kty: "OKP",
            x: "PixgV6A3dqXgh7NrvZ0tXJhcqxCQwoxzZF28J8C9idI",
          },
        },
        "#zDnaed1WWHisZVe3WoDswB1Z2zHhBqWHuGRVVqbTGGQvuH2AC",
      ],
      verificationMethod: [
        {
          id: "did:web:example.com:#zDnaed1WWHisZVe3WoDswB1Z2zHhBqWHuGRVVqbTGGQvuH2AC",
          type: "P256Key2021",
          controller: "did:web:example.com",
          publicKeyMultibase:
            "zDnaed1WWHisZVe3WoDswB1Z2zHhBqWHuGRVVqbTGGQvuH2AC",
        },
      ],
      assertionMethod: ["#zDnaed1WWHisZVe3WoDswB1Z2zHhBqWHuGRVVqbTGGQvuH2AC"],
      keyAgreement: ["#zDnaed1WWHisZVe3WoDswB1Z2zHhBqWHuGRVVqbTGGQvuH2AC"],
      capabilityInvocation: [
        "#zDnaed1WWHisZVe3WoDswB1Z2zHhBqWHuGRVVqbTGGQvuH2AC",
      ],
      capabilityDelegation: [
        "#zDnaed1WWHisZVe3WoDswB1Z2zHhBqWHuGRVVqbTGGQvuH2AC",
      ],
    };
    const result = didDocumentDeserializer(document);
    expect(result.id).eq("did:web:example.com");
    expect(result.verificationMethod.length).eq(2);
    expect(result.verificationMethod[0].getUsage()).toStrictEqual({
      authentication: "Reference",
      assertionMethod: "Reference",
      keyAgreement: "Reference",
      capabilityInvocation: "Reference",
      capabilityDelegation: "Reference",
    });
    expect(result.verificationMethod[1].getUsage()).toStrictEqual({
      authentication: "Embedded",
    });
    expect(result.services.length).eq(0);
    expect(result.controller).toStrictEqual(new Set());
  });

  it("Parses document with services", () => {
    const document = {
      "@context": [
        "https://www.w3.org/ns/did/v1",
        "https://w3id.org/security/suites/multikey-2021/v1",
      ],
      id: "did:web:example.com",
      verificationMethod: [
        {
          id: "did:web:example.com#1lp_wdAQL4aZcvbOqKRtb2-VYLjqc8BaWEKZKv0jQ-E",
          type: "ED25519Key2020",
          controller: "did:web:example.com",
          publicKeyMultibase:
            "z6MkmYS4Z13PFJjnNAL7tYxe2weTvGyVavofXv4xPdRpq6uL",
        },
      ],
      capabilityDelegation: ["#1lp_wdAQL4aZcvbOqKRtb2-VYLjqc8BaWEKZKv0jQ-E"],
      services: [
        {
          id: "did:key:123#linked-domain",
          type: "LinkedDomains",
          serviceEndpoint: "https://bar.example.com",
        },
      ],
    };
    const result = didDocumentDeserializer(document);
    expect(result.services.length).eq(1);
    expect(result.services[0]).toStrictEqual({
      id: "did:key:123#linked-domain",
      type: "LinkedDomains",
      serviceEndpoint: "https://bar.example.com",
    });
  });
});
