import { DidDocument } from "@/lib/DidDocument";
import { EmbeddedMaterial } from "@/lib/DidMaterial";
import {
  EmbeddedType,
  KeyFormat,
  Representation,
  UsageFormat,
} from "@/types/dids";
import { useState } from "react";
import DidInput from "../DidInput";
import { deriveIdentificationFragment } from "@/lib/keys";
import Link from "next/link";
import AnnotatedHeader from "@/components/attested-default-content/annotatedHeader";

export default function EmbeddedMethodSettings({
  htmlId,
  method,
  save,
}: {
  htmlId: string;
  method: EmbeddedMaterial;
  didDocument: DidDocument;
  save: (vm: EmbeddedMaterial) => void;
}): JSX.Element {
  const material = method.material.keyMaterial;
  const [id, setId] = useState<string>(method.id);
  const [controller, setController] = useState<string>(
    method.material.controller
  );
  const [format, setFormat] = useState<KeyFormat>(method.material.format);
  const [methods, setMethods] = useState<UsageFormat<Representation>>(
    method.material.usage
  );

  return (
    <div className="flex flex-col gap-y-2 text-base-content">
      <div>
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Id</span>
            <span className="label-text-alt">Leave blank to derive Id</span>
          </label>
          <input
            type="text"
            value={id}
            onChange={(e) =>
              setId(
                e.target.value.startsWith("#")
                  ? e.target.value
                  : `#${e.target.value}`
              )
            }
            placeholder="#lwg2wFClmq7gEjv..."
            className={`input input-bordered w-full`}
          />
        </div>
        <DidInput
          value={controller}
          label="Controller"
          callback={(e) => {
            setController(e.did?.serialize() || "");
          }}
        />
      </div>
      <div className="divider my-1" />
      <div>
        <AnnotatedHeader
          headerText="Verification Relationships"
          headerSize="text-lg"
          body="Verification methods can be embedded in or referenced from properties
          associated with various verification relationships. Referencing
          verification methods allows them to be used by more than one
          verification relationship."
          externalDocsLink="https://w3c.github.io/did-core/#verification-methods"
          externalDocsDesc="Verification Methods Documentation"
        />
        <div className="form-control">
          {method.material.curve.capabilities.map((method, indexMethod) => {
            return (
              <div
                key={indexMethod}
                className="flex flex-col my-2 md:my-0 md:flex-row justify-between w-full"
              >
                <div>
                  <span>{method}</span>
                  <span className="opacity-50"> as</span>
                </div>
                <div className="btn-group">
                  <button
                    className={`btn btn-xs ${
                      methods[method] === "Embedded" ? "btn-primary" : ""
                    }`}
                    onClick={() => {
                      setMethods({
                        [method]: "Embedded",
                      });
                    }}
                  >
                    Embedded
                  </button>

                  <button
                    className={`btn btn-xs ${
                      methods[method] === "Reference" ? "btn-secondary" : ""
                    }`}
                    onClick={() => {
                      const embeddedMethodsToUpdate = Object.entries(
                        methods
                      ).reduce<UsageFormat<Representation>>(
                        (acc, [key, value]) => {
                          if (value === "Embedded") {
                            return {
                              ...acc,
                              [key]: "Reference",
                            };
                          }

                          return {
                            ...acc,
                            [key]: value,
                          };
                        },
                        {}
                      );

                      setMethods({
                        ...embeddedMethodsToUpdate,
                        [method]: "Reference",
                      });
                    }}
                  >
                    Referenced
                  </button>

                  <button
                    className={`btn btn-xs ${
                      !methods[method] ? "btn-active" : ""
                    }`}
                    onClick={() => {
                      const { [method]: remove, ...keep } = methods;
                      setMethods(keep);
                    }}
                  >
                    Unused
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="divider my-1" />
      <div>
        <AnnotatedHeader
          headerText="Format"
          headerSize="text-lg"
          body='The format is the structured representation of the keys. The cryptographic type "type" is expected to be used to determine its compatibility with verification method processes. Properties such as "publicKeyJwk", "publicKeyMultibase" et cetera provides the public key value in a specific encoding (e.g., JWK or base58).'
          externalDocsLink="https://www.w3.org/TR/did-core/#verification-material"
          externalDocsDesc="Verification Material Documentation"
        />
        <div>
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">JWK</span>
              <input
                type="radio"
                name="radio-10"
                className="radio checked:bg-red-500"
                onChange={() => setFormat("JsonWebKey2020")}
                checked={format === "JsonWebKey2020"}
              />
            </label>
          </div>
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Multibase</span>
              <input
                type="radio"
                name="radio-10"
                className="radio checked:bg-blue-500"
                onChange={() => setFormat("Multibase")}
                checked={format === "Multibase"}
              />
            </label>
          </div>
        </div>
      </div>
      <label
        htmlFor={htmlId}
        className={`btn btn-info btn-outline btn-block mt-4 ${
          controller !== "" ? "" : "btn-disabled"
        }`}
        onClick={async () => {
          const finalMaterial: EmbeddedType = {
            format,
            curve: method.material.curve,
            controller,
            usage: methods,
            keyMaterial: material,
          };
          let finalId =
            id || (await deriveIdentificationFragment(finalMaterial));
          const newVerificationMethod: EmbeddedMaterial = new EmbeddedMaterial(
            finalId,
            finalMaterial
          );
          save(newVerificationMethod);
        }}
      >
        Save to Document
      </label>
    </div>
  );
}
