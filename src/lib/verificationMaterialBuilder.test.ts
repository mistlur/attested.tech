import '@testing-library/jest-dom'
import { decodeVerificationMethod, DidDocument, didDocumentDeserializer, EmbeddedMaterialFormat, EmbeddedVM, isEmbeddedVm, LogicDocument, LogicVM, SupportedCurves } from './verificationMaterialBuilder'
import * as b58 from 'multiformats/bases/base58'
import * as b64 from 'multiformats/bases/base64'
import { ec as EC } from 'elliptic'
import * as crypto from 'crypto'

describe('Deserialize Verification Method', () => {
    it('handles P-256 JWK method', () => {
        const verificationMethod = {
            "id": "did:example:123#key-4",
            "type": "JsonWebKey2020",
            "controller": "did:example:123",
            "publicKeyJwk": {
                "kty": "EC",
                "crv": "P-256",
                "x": "u7KnnZO3wZz8nIC5pHiWgsOXlRUj0inlEoAsuJ3kR7k",
                "y": "bAR7nCeNMceX4nsd4XqxTCYB96YbFK4TFetgtp9ElbU"
            }
        }
        const deserializedVerificationMethod = decodeVerificationMethod(verificationMethod, 'verificationMethod')
        expect(deserializedVerificationMethod.id).toBe('did:example:123#key-4')
        const assertKeyTypeVm = isEmbeddedVm(deserializedVerificationMethod)
        expect(assertKeyTypeVm).toBeTruthy()
        expect((deserializedVerificationMethod as EmbeddedVM).curve).toBe('P-256')
        expect((deserializedVerificationMethod as EmbeddedVM).keyMaterial!.length).toBe(65)
        expect((deserializedVerificationMethod as EmbeddedVM).format).toBe('JsonWebKey2020')
        expect((deserializedVerificationMethod).usage).toStrictEqual({ 'verificationMethod': 'Embedded' })
    })

    it('handles P-256 Multibase method', () => {
        const verificationMethod = {
            "id": "did:example:123#key-4",
            "type": "P256Key2021",
            "controller": "did:web:be0f-83-248-113-71.ngrok.io:api:4dbac1c5-2430-459d-8ef6-e3f2327221ff",
            "publicKeyMultibase": "zDnaeb7hxqexhrMUYTFzCmesbFF1d12sk4uV7yzhJox5PThAP"
        }

        const deserializedVerificationMethod = decodeVerificationMethod(verificationMethod, 'verificationMethod')
        expect(deserializedVerificationMethod.id).toBe('did:example:123#key-4')
        const assertKeyTypeVm = isEmbeddedVm(deserializedVerificationMethod)
        expect(assertKeyTypeVm).toBeTruthy()
        expect((deserializedVerificationMethod as EmbeddedVM).curve).toBe('P-256')
        expect((deserializedVerificationMethod as EmbeddedVM).keyMaterial!.length).toBe(65)
        expect((deserializedVerificationMethod as EmbeddedVM).format).toBe('Multibase')
        expect((deserializedVerificationMethod).usage).toStrictEqual({ 'verificationMethod': 'Embedded' })
    })

    it('handles Reference method', () => {
        const verificationMethod = "did:example:123456789abcdefghi#keys-1"
        const deserializedVerificationMethod = decodeVerificationMethod(verificationMethod, 'verificationMethod')
        const assertKeyTypeVm = isEmbeddedVm(deserializedVerificationMethod)
        expect(assertKeyTypeVm).toBeFalsy()
        expect(deserializedVerificationMethod.id).toBe(verificationMethod)
        expect((deserializedVerificationMethod).usage).toStrictEqual({ 'verificationMethod': 'Reference' })
    })

    it('throws on unknown key', () => {
        const unsupportedType = 'SomeSortOfType'
        const verificationMethod = {
            id: 'did:example:1234#z6MkkLTyVxNkwxXGUJfA4Uw23FHSAA3SoMoNB8NteMT2BAkd',
            type: unsupportedType,
            controller: 'did:example:1234',
            publicKeyMultibase: 'zXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        }
        expect(() => decodeVerificationMethod(verificationMethod, 'verificationMethod')).toThrow(Error)
        expect(() => decodeVerificationMethod(verificationMethod, 'verificationMethod')).toThrow(`Unsupported type: ${unsupportedType}`)
    })

    it('throws on malformed key', () => {
        const malformedType = 'JsonWebKey2020' // The key is of type Multibase
        const verificationMethod = {
            "id": "did:example:123#key-4",
            "type": malformedType,
            "controller": "did:web:be0f-83-248-113-71.ngrok.io:api:4dbac1c5-2430-459d-8ef6-e3f2327221ff",
            "publicKeyMultibase": "zDnaeb7hxqexhrMUYTFzCmesbFF1d12sk4uV7yzhJox5PThAP"
        }
        expect(() => decodeVerificationMethod(verificationMethod, 'verificationMethod')).toThrow(Error)
        expect(() => decodeVerificationMethod(verificationMethod, 'verificationMethod')).toThrow('Invalid type: "JsonWebKey2020" must contain "publicKeyJwk"')
    })

    it.skip('throws on invalid key', () => { // TODO: Is this within the responsibility of this app?
        const verificationMethod = {
            "id": "did:example:123#key-4",
            "type": "JsonWebKey2020",
            "controller": "did:example:123",
            "publicKeyJwk": {
                "kty": "EC",
                "crv": "P-256",
                "x": "a",
                "y": "b"
            }
        }
        expect(() => decodeVerificationMethod(verificationMethod, 'verificationMethod')).toThrow(Error)
        expect(() => decodeVerificationMethod(verificationMethod, 'verificationMethod')).toThrow(`invalid key`)
    })

    it('throws on missing key material', () => {
        const verificationMethod = {
            id: 'did:example:1234#z6MkkLTyVxNkwxXGUJfA4Uw23FHSAA3SoMoNB8NteMT2BAkd',
            type: "P256Key2021",
            controller: 'did:example:1234',
            publicKeyMultibase: '',
        }
        expect(() => decodeVerificationMethod(verificationMethod, 'verificationMethod')).toThrow(Error)
        expect(() => decodeVerificationMethod(verificationMethod, 'verificationMethod')).toThrow(`Invalid key`)
    })
})

describe('Deserialize DID Document', () => {
    it('handles document with only id', () => {
        const document = {
            id: 'did:example:1234'
        }
        const deserializedDocument = didDocumentDeserializer(document)
        expect(deserializedDocument.id).toBe('did:example:1234')
    })

    it('handles document with controller', () => {
        const document = {
            id: 'did:example:1234',
            controller: 'did:example:456'
        }
        const deserializedDocument = didDocumentDeserializer(document)
        expect(deserializedDocument.id).toBe('did:example:1234')
        expect(deserializedDocument.controller).toBe('did:example:456')
    })

    it('handles document with verification methods', () => {
        const referencedVerificationMaterial = "did:example:456#abc"
        const embeddedVerificationMaterial = {
            "id": "did:example:123#key-4",
            "type": "JsonWebKey2020",
            "controller": "did:example:123",
            "publicKeyJwk": {
                "kty": "EC",
                "crv": "P-256",
                "x": "u7KnnZO3wZz8nIC5pHiWgsOXlRUj0inlEoAsuJ3kR7k",
                "y": "bAR7nCeNMceX4nsd4XqxTCYB96YbFK4TFetgtp9ElbU"
            }
        }

        const document = {
            id: 'did:example:1234',
            controller: 'did:example:456',
            verificationMethod: [embeddedVerificationMaterial, referencedVerificationMaterial],
            authentication: [embeddedVerificationMaterial, referencedVerificationMaterial],
            assertionMethod: [embeddedVerificationMaterial, referencedVerificationMaterial],
            keyAgreement: [embeddedVerificationMaterial, referencedVerificationMaterial],
            capabilityInvocation: [embeddedVerificationMaterial, referencedVerificationMaterial],
            capabilityDelegation: [embeddedVerificationMaterial, referencedVerificationMaterial],
        }

        const deserializedDocument = didDocumentDeserializer(document)
        expect(deserializedDocument.id).toBe('did:example:1234')
        expect(deserializedDocument.controller).toBe('did:example:456')
        expect(deserializedDocument.verificationMethods.length).toBe(2)
        deserializedDocument.verificationMethods.forEach(vm => {
            expect(vm.usage).toEqual({
                verificationMethod: expect.any(String),
                authentication: expect.any(String),
                assertionMethod: expect.any(String),
                keyAgreement: expect.any(String),
                capabilityInvocation: expect.any(String),
                capabilityDelegation: expect.any(String),
            })
        })
    })

    it('handles denormalization of document with same verification material represented in different forms', async () => {
        const jwkMaterial = {
            "id": "did:example:1234#123",
            "type": "JsonWebKey2020",
            "controller": "did:example:1234",
            "publicKeyJwk": {
                "crv": "P-256",
                "kty": "EC",
                "x": "UD4bplQZgdpma2mDdzbB5fp3X-zrlAqKn7apb97S5Nk",
                "y": "Q_yzJQkd_BaOvnxD7VrKNxYMG0GiFVzC_U6c8KNTDh8"
            }
        }

        const multibaseMaterial = {
            "id": "did:example:1234#123",
            "type": "P256Key2021",
            "controller": "did:example:1234",
            "publicKeyMultibase": "zDnaeo4Wxhx9j8MQrx3gGYUon5c7QELjFsWAibfg5rmD7LTNQ"
        }

        const document = {
            id: 'did:example:1234',
            controller: 'did:example:456',
            verificationMethod: [jwkMaterial],
            authentication: [multibaseMaterial],
        }

        const deserializedDocument = didDocumentDeserializer(document)
        expect(deserializedDocument.id).toBe('did:example:1234')
        expect(deserializedDocument.controller).toBe('did:example:456')
        expect(deserializedDocument.verificationMethods.length).toBe(1)
    })
})

describe('Serialize Verification Method', () => {

    const validVerificationMethodP256 = {
        id: 'did:example:123#456',
        curve: 'P-256' as SupportedCurves,
        controller: 'did:example:123',
        usage: {},
        keyMaterial: new Uint8Array([
            4, 187, 178, 167, 157, 147, 183, 193, 156, 252, 156,
            128, 185, 164, 120, 150, 130, 195, 151, 149, 21, 35,
            210, 41, 229, 18, 128, 44, 184, 157, 228, 71, 185,
            108, 4, 123, 156, 39, 141, 49, 199, 151, 226, 123,
            29, 225, 122, 177, 76, 38, 1, 247, 166, 27, 20,
            174, 19, 21, 235, 96, 182, 159, 68, 149, 181
        ])
    }

    const embeddedTestCases: {
        deserializedVerificationMethod: EmbeddedVM,
        expected: any
    }[] = [
            {
                deserializedVerificationMethod: { ...validVerificationMethodP256, format: 'Multibase' },
                expected: {
                    id: validVerificationMethodP256.id,
                    controller: 'did:example:123',
                    type: 'P256Key2021',
                    publicKeyMultibase: "zDnaevHyfCfHYFyscLiRMYacaoXFqnA6gSDwgJXoZia5hNM9J"
                }
            },
            {
                deserializedVerificationMethod: { ...validVerificationMethodP256, format: 'JsonWebKey2020' },
                expected: {
                    "id": "did:example:123#456",
                    "type": "JsonWebKey2020",
                    "controller": "did:example:123",
                    "publicKeyJwk": {
                        "crv": "P-256",
                        "kty": "EC",
                        "x": "u7KnnZO3wZz8nIC5pHiWgsOXlRUj0inlEoAsuJ3kR7k",
                        "y": "bAR7nCeNMceX4nsd4XqxTCYB96YbFK4TFetgtp9ElbU"
                    }
                }
            }
        ]

    const calculatedIds: Record<string, Record<EmbeddedMaterialFormat, string>> = {
        ['P-256']: {
            Multibase: 'did:example:123#zDnaevHyfCfHYFyscLiRMYacaoXFqnA6gSDwgJXoZia5hNM9J',
            JsonWebKey2020: 'did:example:123#71DzuEySoYKSDysvn4QZM_w6uFcKs5gGexvV80H6aEQ'
        }
    }

    embeddedTestCases.forEach((testCase) => {
        it(`handles ${testCase.deserializedVerificationMethod.curve} representation as ${testCase.deserializedVerificationMethod.format}`, () => {
            const didDocument = new DidDocument('did:example:123', 'did:example:123', [])
            const serialized = didDocument.serializeVerificationMethod(testCase.deserializedVerificationMethod, 'Embedded')
            expect(serialized).toStrictEqual(testCase.expected)
        })

        it(`handles calculates the id for ${testCase.deserializedVerificationMethod.curve} represented as ${testCase.deserializedVerificationMethod.format}`, () => {
            const didDocument = new DidDocument('did:example:123', 'did:example:123', [])
            const freshMethod = {
                ...testCase.deserializedVerificationMethod,
                id: undefined
            }
            const serialized = didDocument.serializeVerificationMethod(freshMethod, 'Embedded')
            // @ts-ignore
            expect(serialized.id).toBe(calculatedIds[testCase.deserializedVerificationMethod.curve!][testCase.deserializedVerificationMethod.format])
        })
    })
})

describe('Serialize DID Document', () => {

    const validVerificationMethodP256: EmbeddedVM[] = [{
        id: 'did:example:123#456',
        curve: 'P-256',
        controller: 'did:example:123',
        format: 'Multibase',
        usage: { verificationMethod: 'Embedded', assertionMethod: 'Reference' },
        keyMaterial: new Uint8Array([
            4, 187, 178, 167, 157, 147, 183, 193, 156, 252, 156,
            128, 185, 164, 120, 150, 130, 195, 151, 149, 21, 35,
            210, 41, 229, 18, 128, 44, 184, 157, 228, 71, 185,
            108, 4, 123, 156, 39, 141, 49, 199, 151, 226, 123,
            29, 225, 122, 177, 76, 38, 1, 247, 166, 27, 20,
            174, 19, 21, 235, 96, 182, 159, 68, 149, 181
        ])
    },
    {
        id: 'did:example:123#678',
        curve: 'P-256',
        controller: 'did:example:123',
        format: 'JsonWebKey2020',
        keyMaterial: new Uint8Array([
            4, 74, 75, 165, 56, 77, 105, 2, 249, 70, 40,
            4, 129, 140, 97, 20, 75, 144, 186, 233, 13, 21,
            114, 102, 28, 149, 201, 161, 227, 240, 123, 159, 252,
            130, 181, 204, 135, 17, 137, 83, 80, 18, 90, 97,
            55, 97, 164, 128, 226, 105, 238, 18, 66, 71, 191,
            155, 191, 253, 130, 177, 85, 239, 47, 209, 245
        ]),
        usage: { authentication: 'Embedded' }
    }]

    const validDidDocument = {
        id: 'did:example:123',
        controller: 'did:example:123',
        verificationMethods: validVerificationMethodP256
    }

    const validTestCases: {
        deserializedDocument: LogicDocument,
        expected: any
    }[] = [
            {
                deserializedDocument: validDidDocument,
                expected: {
                    ['@context']: [
                        "https://www.w3.org/ns/did/v1",
                        "https://w3id.org/security/suites/multikey-2021/v1",
                        "https://w3id.org/security/suites/jws-2020/v1",
                    ],
                    id: 'did:example:123',
                    controller: 'did:example:123',
                    verificationMethod: [
                        {
                            "id": "did:example:123#456",
                            "type": "P256Key2021",
                            "controller": "did:example:123",
                            "publicKeyMultibase": "zDnaevHyfCfHYFyscLiRMYacaoXFqnA6gSDwgJXoZia5hNM9J"
                        }
                    ],
                    authentication: [
                        {
                            "id": "did:example:123#678",
                            "type": "JsonWebKey2020",
                            "controller": "did:example:123",
                            "publicKeyJwk": {
                                "crv": "P-256",
                                "kty": "EC",
                                "x": "SkulOE1pAvlGKASBjGEUS5C66Q0VcmYclcmh4_B7n_w",
                                "y": "grXMhxGJU1ASWmE3YaSA4mnuEkJHv5u__YKxVe8v0fU"
                            }
                        }
                    ],
                    "assertionMethod": ["did:example:123#456"]
                }
            }
        ]

    validTestCases.forEach((testCase) => {
        it(`handles DID Document`, () => {
            const document = new DidDocument(testCase.deserializedDocument.id, testCase.deserializedDocument.controller, testCase.deserializedDocument.verificationMethods)
            const serialized = document.serialize()
            expect(serialized).toStrictEqual(testCase.expected)
        })
    })
})

describe('DID tests suite', () => {
    // it('apa', () => {
    //     const validVerificationMethodP256: LogicVM[] = [{
    //         id: 'did:example:123#456',
    //         curve: 'p256',
    //         controller: 'did:example:123',
    //         usage: { verificationMethod: 'JsonWebKey2020', assertionMethod: 'Reference' },
    //         fresh: false,
    //         keyMaterial: new Uint8Array([
    //             4, 187, 178, 167, 157, 147, 183, 193, 156, 252, 156,
    //             128, 185, 164, 120, 150, 130, 195, 151, 149, 21, 35,
    //             210, 41, 229, 18, 128, 44, 184, 157, 228, 71, 185,
    //             108, 4, 123, 156, 39, 141, 49, 199, 151, 226, 123,
    //             29, 225, 122, 177, 76, 38, 1, 247, 166, 27, 20,
    //             174, 19, 21, 235, 96, 182, 159, 68, 149, 181
    //         ])
    //     },
    //     {
    //         id: 'did:example:123#456',
    //         curve: 'p256',
    //         fresh: false,
    //         controller: 'did:example:123',
    //         keyMaterial: new Uint8Array([
    //             4, 74, 75, 165, 56, 77, 105, 2, 249, 70, 40,
    //             4, 129, 140, 97, 20, 75, 144, 186, 233, 13, 21,
    //             114, 102, 28, 149, 201, 161, 227, 240, 123, 159, 252,
    //             130, 181, 204, 135, 17, 137, 83, 80, 18, 90, 97,
    //             55, 97, 164, 128, 226, 105, 238, 18, 66, 71, 191,
    //             155, 191, 253, 130, 177, 85, 239, 47, 209, 245
    //         ]),
    //         usage: { authentication: 'JsonWebKey2020', verificationMethod: 'Multibase' }
    //     }]

    //     const validDidDocument: LogicDocument = {
    //         id: 'did:example:123',
    //         controller: 'did:example:123',
    //         verificationMethods: validVerificationMethodP256
    //     }

    //     const apa = {
    //         "didMethod": "did:web",
    //         "implementation": "todo",
    //         "implementer": "todo",
    //         "supportedContentTypes": [
    //             "application/did+json"
    //         ],
    //         "dids": [
    //             validDidDocument.id
    //         ],
    //         "didParameters": {},
    //         [validDidDocument.id]: {
    //             "didDocumentDataModel": {
    //                 "properties": didDocumentSerializer(validDidDocument)
    //             },
    //             "application/did+json": {
    //                 "didDocumentDataModel": {
    //                     "representationSpecificEntries": {}
    //                 },
    //                 "representation": JSON.stringify(didDocumentSerializer(validDidDocument)),
    //                 "didDocumentMetadata": {},
    //                 "didResolutionMetadata": {
    //                     "contentType": "application/did+json"
    //                 }
    //             }
    //         }
    //     }
    //     console.log(JSON.stringify(apa))
    // })
})
