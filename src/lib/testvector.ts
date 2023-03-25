import { DidDocument } from "./verificationMaterialBuilder";

export function produceTestVector(document: DidDocument) {
  const template = {
    "didMethod": "did:web",
    "implementation": "TBD",
    "implementer": "ATTESTED.TECH",
    "supportedContentTypes": [
      "application/did+ld+json"
    ],
    "dids": [
      document.id
    ],
    // "didParameters": {
    //   "service": "did:web:demo.spruceid.com:2021:07:14:service-example?service=hello"
    // },
    [document.id]: {
      "didDocumentDataModel": {
        "properties": {
          "id": document.id,
          "verificationMethod": document.serializeRelationship('verificationMethod'),
          "authentication": document.serializeRelationship('authentication'),
          "assertionMethod": document.serializeRelationship('assertionMethod'),
          "keyAgreement": document.serializeRelationship('keyAgreement'),
          "capabilityInvocation": document.serializeRelationship('capabilityInvocation'),
          "capabilityDelegation": document.serializeRelationship('capabilityDelegation'),
        }
      },
      "application/did+ld+json": {
        "didDocumentDataModel": {
          "representationSpecificEntries": {
            "@context": document.getContexts()
          }
        },
        "representation": `${JSON.stringify(document.serialize())}`,
        "didDocumentMetadata": {},
        "didResolutionMetadata": {
          "contentType": "application/did+ld+json"
        }
      }
    }
  }
  console.log(JSON.stringify(template, null, 2))
}