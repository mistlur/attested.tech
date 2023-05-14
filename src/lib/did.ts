export const getDidPath = () => process.env.NEXT_PUBLIC_EXTERNAL_URL
export const getDidUri = () => `did:web:${getDidPath()}:api`
export const getCompleteDid = (id: string) => `${getDidUri()}:${id}`

export type DidMethod = string
export type DidIdentifier = string
export type DidPath = string
export type DidQuery = string
export type DidFragment = string

export class Did {

  public method: DidMethod
  public identifier: DidIdentifier
  public path: DidPath | null
  public query: DidQuery | null
  public fragment: DidFragment | null

  private static didRegex = /^did:(?<method>[a-z0-9]+):(?<identifier>[a-zA-Z0-9_.:-]+)(?<path>\/[a-zA-Z0-9_.:-]*)?(\?(?<query>[a-zA-Z0-9_.-]+=[a-zA-Z0-9:_.-]+(&[a-zA-Z0-9:_.-\/]+=[a-zA-Z0-9:_.-\/]+)*)|)(#(?<fragment>[a-zA-Z0-9_.-]+)|)$/u;



  constructor(id: string) {
    const match = this.parse(id)

    if (match) {
      const method = match.groups?.method
      const identifier = match.groups?.identifier
      const path = match.groups?.path?.replace(/^\//, '')
      const query = match.groups?.query
      const fragment = match.groups?.fragment

      this.method = method
      this.identifier = identifier
      this.path = path
      this.query = query
      this.fragment = fragment
    } else {
      throw Error('Invalid DID')
    }

  }

  private parse(did: string) {
    return did.match(Did.didRegex);
  }

  static validate(did: string): boolean {
    return !!did.match(Did.didRegex);
  }

  serialize(): string {
    return `did:${this.method}:${this.identifier}${this.path ? `/${this.path}` : ``}${this.query ? `?${this.query}` : ``}${this.fragment ? `#${this.fragment}` : ``}`
  }
}

export function getInitialDidDocument(id: string) {
  return {
    "@context": [
      "https://www.w3.org/ns/did/v1",
      "https://w3id.org/security/suites/jws-2020/v1",
      "https://w3id.org/security/suites/multikey-2021/v1",
    ],
    id: `did:web:attested.tech:api:${id}`,
  }
}