Things to validate:

Can you reference an existing key in the same method block?

E.g.,

[
{
"id": "did:web:00d9-83-248-113-71.ngrok.io:api:4dbac1c5-2430-459d-8ef6-e3f2327221ff#8JL0i2r1SFDKnhr2pGdEx5FAzkCHs30EAjA5s9M8JPo",
"type": "JsonWebKey2020",
"controller": "did:web:00d9-83-248-113-71.ngrok.io:api:4dbac1c5-2430-459d-8ef6-e3f2327221ff",
"publicKeyJwk": {
"crv": "P-256",
"kty": "EC",
"x": "NhB5TYSxqR_x_0vMpmfdpN3KI6C11tzE6r_xDqbVy9Q",
"y": "nhuaiyE61qQ6A2Sh8loFjh49asQeFqaKD0zKzjESu8s"
}
},
{
"id": "did:web:00d9-83-248-113-71.ngrok.io:api:4dbac1c5-2430-459d-8ef6-e3f2327221ff#8JL0i2r1SFDKnhr2pGdEx5FAzkCHs30EAjA5s9M8JPo"
}
]

Sources

DID Implementers guide: https://www.w3.org/TR/did-imp-guide/
DID Keys: https://w3c-ccg.github.io/did-method-key/#example-9
DID Core: https://www.w3.org/TR/did-core/
DID Key P256: https://github.com/transmute-industries/did-key.js/blob/main/packages/did-key-test-vectors/src/secp256r1/did-key-secp256r1-case-0.json
Where the Multicoded spec derives from: https://github.com/w3c-ccg/lds-ed25519-2018/issues/3
