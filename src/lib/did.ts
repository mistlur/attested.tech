export const getDidPath = () => process.env.NEXT_PUBLIC_EXTERNAL_URL
export const getDidUri = () => `did:web:${getDidPath()}:api`
export const getCompleteDid = (id: string) => `${getDidUri()}:${id}`

export function getInitialDidDocument(id: string)  {
  return {
      "@context": [
        "https://www.w3.org/ns/did/v1",
        "https://w3id.org/security/suites/jws-2020/v1",
        "https://w3id.org/security/suites/multikey-2021/v1",
      ],
      id: `did:web:attested.tech:api:${id}`,
  }
}