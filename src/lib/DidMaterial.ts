import {
  EmbeddedType,
  ReferencedMaterialFormat,
  ReferencedType,
  Representation,
  UsageFormat,
  VerificationRelationship,
} from "@/types/dids";
import { z } from "zod";
import { verificationRelationshipSchema } from "./didParser";
import {
  deriveIdentificationFragment,
  encodeJsonWebKey,
  encodeMultibaseKey,
} from "./keys";
import { isEd25519 } from "./curves";

export function isEmbeddedType(
  vm: EmbeddedType | ReferencedType
): vm is EmbeddedType {
  return (vm as EmbeddedType).curve !== undefined;
}

export function isEmbeddedMaterial(i: DidMaterial): i is EmbeddedMaterial {
  return isEmbeddedType(i.material);
}

export function isReferencedMaterial(i: DidMaterial): i is ReferencedMaterial {
  return !isEmbeddedType(i.material);
}

export interface DidMaterial {
  id: string;
  material: EmbeddedType | ReferencedType;

  equals(d: DidMaterial): boolean;

  getUsage(): UsageFormat<Representation | ReferencedMaterialFormat>;

  setUsage(usage: UsageFormat<Representation | ReferencedMaterialFormat>);

  isUsedInRelationship(
    verificationRelationship: VerificationRelationship
  ): boolean;

  getRepresentation(
    verificationRelationship: VerificationRelationship
  ): Representation;

  serialize(
    representation: Representation
  ): z.infer<typeof verificationRelationshipSchema>;
}

export class EmbeddedMaterial implements DidMaterial {
  public id: string;
  public material: EmbeddedType;

  // TODO: add use as verfication method without reference

  constructor(id: string, material: EmbeddedType) {
    this.id = id;
    this.material = material;
  }

  public equals(other: EmbeddedMaterial) {
    return this.getKeyMaterial("string") === other.getKeyMaterial("string");
  }

  public getUsage(): UsageFormat<Representation> {
    return this.material.usage;
  }

  public setUsage(usage: UsageFormat<Representation>) {
    this.material.usage = usage;
  }

  public getKeyMaterial(format?: "Uint8Array" | "string"): Uint8Array | string {
    if (format === "Uint8Array") return this.material.keyMaterial;
    return this.material.keyMaterial.toString();
  }

  public isUsedAsReference(): boolean {
    return (
      Object.values(this.material.usage).filter((i) => i === "Reference")
        .length > 0
    );
  }

  public isUsedInRelationship(
    verificationrelationship: VerificationRelationship
  ): boolean {
    return this.material.usage[verificationrelationship] != null;
  }

  public getRepresentation(
    verificationrelationship: VerificationRelationship
  ): Representation {
    return this.material.usage[verificationrelationship];
  }

  public serialize(
    representation: Representation
  ): z.infer<typeof verificationRelationshipSchema> {
    if (!this.material.controller)
      throw Error(
        "Malformed verification method: Embedded material must contain controller"
      );
    if (!this.id || this.id === "")
      throw Error(
        "Malformed verification method: Embedded material must contain id"
      );
    if (representation === "Reference") {
      return this.id;
    }
    let serializedKey = "";
    if (isEd25519(this.material.curve)) {
      if (this.material.format === "JsonWebKey2020") {
        return {
          id: this.id,
          type: this.material.format,
          controller: this.material.controller,
          publicKeyJwk: encodeJsonWebKey(this.material),
        };
      } else if (this.material.format === "Multibase") {
        return {
          id: this.id,
          type: "ED25519Key2020",
          controller: this.material.controller,
          publicKeyMultibase: encodeMultibaseKey(this.material),
        };
      } else {
        throw new Error(
          `Unable to serialize verification method\n${JSON.stringify(
            this.material
          )}`
        );
      }
    } else {
      if (this.material.format === "JsonWebKey2020") {
        return {
          id: this.id,
          type: this.material.format,
          controller: this.material.controller,
          publicKeyJwk: encodeJsonWebKey(this.material),
        };
      } else if (this.material.format === "Multibase") {
        return {
          id: this.id,
          type: "P256Key2021",
          controller: this.material.controller,
          publicKeyMultibase: encodeMultibaseKey(this.material),
        };
      } else {
        throw new Error(
          `Unable to serialize verification method\n${JSON.stringify(
            this.material
          )}`
        );
      }
    }
  }
}

export class ReferencedMaterial implements DidMaterial {
  public id: string;
  public material: ReferencedType;

  constructor(id: string, material: ReferencedType) {
    this.id = id;
    this.material = material;
  }

  public equals(other: ReferencedMaterial) {
    return this.id === other.id;
  }

  public getUsage(): UsageFormat<ReferencedMaterialFormat> {
    return this.material.usage;
  }

  public setUsage(usage: UsageFormat<ReferencedMaterialFormat>) {
    this.material.usage = usage;
  }

  public isUsedInRelationship(
    verificationrelationship: VerificationRelationship
  ): boolean {
    return this.material.usage[verificationrelationship] != null;
  }

  public getRepresentation(): Representation {
    return "Reference";
  }

  public serialize(): z.infer<typeof verificationRelationshipSchema> {
    if (!this.id || this.id === "")
      throw Error(
        "Malformed verification method: Referenced material must contain id"
      );
    return this.id;
  }
}
