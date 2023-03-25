import { VerificationRelationship } from "@/types/dids"
import { immerable } from "immer"
import { z } from "zod"
import { DidMaterial, EmbeddedMaterial, isEmbeddedMaterial } from "./DidMaterial"
import { documentSchema } from "./didParser"

export type LogicDocument = {
  id: string, // TODO: Proper Id type
  controller: string | undefined,
  verificationMethods: DidMaterial[]
}

export class DidDocument {
  [immerable] = true
  public id: string | undefined
  public controller: string | undefined
  public verificationMaterials: DidMaterial[]

  constructor(id: string | undefined, controller: string | undefined, verificationMaterials: DidMaterial[]) {
    this.id = id
    this.controller = controller
    this.verificationMaterials = verificationMaterials
  }

  addVerificationMethod(material: DidMaterial) {
    this.verificationMaterials.push(material)
  }

  getContexts(): string[] {
    const uniqueRepresentations = (this.verificationMaterials.filter(vm => isEmbeddedMaterial(vm) && Object.values(vm.getUsage()).includes('Embedded')).map((vm) => (vm as EmbeddedMaterial).material.format)).filter((value, index, array) => array.indexOf(value) === index)
    const representationsUsed = uniqueRepresentations.map(representation => {
      switch (representation) {
        case 'JsonWebKey2020': return "https://w3id.org/security/suites/jws-2020/v1"
        case 'Multibase': return "https://w3id.org/security/suites/multikey-2021/v1"
        default: return 'Unkown'
      }
    })
    return ["https://www.w3.org/ns/did/v1", ...representationsUsed]
  }

  getRelationship(relationship: VerificationRelationship): DidMaterial[] {
    return this.verificationMaterials.filter(method => method.isUsedInRelationship(relationship))
  }

  public serialize(): z.infer<typeof documentSchema> {
    const relationships: Record<string, (string | object)[]> = {}
    const allMaterials = this.verificationMaterials

    allMaterials.forEach(material => {
      const usedIn = material.getUsage()

      // Check if the material is referenced by any relationship(s). If it is,
      // add it to the list of verification methods
      if (isEmbeddedMaterial(material) && material.isUsedAsReference()) {
        if (relationships['verificationMaterial']) relationships['verificationMaterial'] = [...relationships['verificationMaterial'], material.serialize("Embedded")]
        else relationships['verificationMaterial'] = [material.serialize("Embedded")]
      }

      // Traverse the relationships the material is used in, and add the
      // serialized representation of it there
      Object.keys(usedIn).forEach(relationship => {
        if (relationships[relationship]) relationships[relationship] = [...relationships[relationship], material.serialize(usedIn[relationship])]
        else relationships[relationship] = [material.serialize(usedIn[relationship])]
      })
    })

    return {
      ['@context']: this.getContexts(),
      id: this.id,
      controller: this.controller,
      ...relationships
    }
  }
}