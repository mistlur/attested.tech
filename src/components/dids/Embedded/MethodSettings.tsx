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
    <div className="flex flex-col gap-y-8 text-base-content">
      <div className="flex flex-col gap-y-8 text-base-content">
        <div>
          <div>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Id</span>
                <span className="label-text-alt">Leave blank to derive Id</span>
              </label>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
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
        </div>

        <div>
          <span className="opacity-50 font-bold">Format</span>
          <div className="flex w-full">
            <div className="btn-group w-full">
              <button
                className={`btn w-1/2 ${
                  format === "JsonWebKey2020" ? "btn-active " : ""
                }`}
                onClick={() => {
                  setFormat("JsonWebKey2020");
                }}
              >
                JWK
              </button>
              <button
                className={`btn w-1/2 ${
                  format === "Multibase" ? "btn-active" : ""
                }`}
                onClick={() => {
                  setFormat("Multibase");
                }}
              >
                Multibase
              </button>
            </div>
          </div>
        </div>
        <div>
          <span className="opacity-50 font-bold">Used for</span>
          <div className="form-control">
            {method.material.curve.capabilities.map((method, indexMethod) => {
              return (
                <div key={indexMethod} className="flex justify-between w-full">
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
      <div className="prose">
        <p>
          Verification methods can be embedded in or referenced from properties
          associated with various verification relationships. Referencing
          verification methods allows them to be used by more than one
          verification relationship. See the{" "}
          <Link
            className={"underline"}
            href={"https://w3c.github.io/did-core/#verification-methods"}
            passHref
            target={"_blank"}
          >
            Verification Methods Documentation
          </Link>{" "}
          for more information of each usage.
        </p>
      </div>
    </div>
  );
}
