const helpSteps = [
  {
    label: "The DID Document",
    description:
      "The DID Document is like a digital instruction manual for the DID. It contains details about how to interact with the identity, how to confirm it's really you (verification methods) and how to reach you (service endpoints).",
  },
  {
    label: "Embedded material",
    description:
      "Embedded material are cryptographic keys that are directly included within the DID Document itself. Embedded keys are useful when the DID Document is meant to be self-contained, and all the necessary information for key management is within the document.",
  },
  {
    label: "Referenced material",
    description:
      "Referenced material are cryptographic keys that are not included in the DID Document but are instead referenced by another did. They allow you to store keys in separate document which can be updated without changing the referring DID Document.",
  },
  {
    label: "DID Subject",
    description:
      "The DID subject is the digital identity or entity to which the DID document belongs",
  },
  {
    label: "DID Controller",
    description:
      "The DID controller is an entity authorized to make changes to the DID Document and act on behalf of the DID subject. The DID controller is not necessarily the DID subject.",
  },
  {
    label: "Service endpoints",
    description:
      "Service endpoints are like contact points for the DID. They specify how others can connect and interact with the DID. Think of them as web addresses or communication channels that let people find and engage with the DID securely.",
  },
  {
    label: "Also known as",
    description:
      '"Also known as" (often abbreviated as "AKA") can be used to provide additional names or aliases associated with the DID. These aliases could help identify the same entity in different contexts or systems, making it easier for others to recognize and interact with the DID.',
  },
] as const;

export default helpSteps;
