import { DidDocument } from "@/lib/DidDocument";
import { EmbeddedMaterial } from "@/lib/DidMaterial";
import {
  EmbeddedType,
  KeyFormat,
  Representation,
  UsageFormat,
  verificationRelationships,
} from "@/types/dids";
import { useState } from "react";
import DidInput from "../DidInput";
import { deriveIdentificationFragment } from "@/lib/keys";

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
    <div>
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
                className={`btn w-1/2 ${format === "JsonWebKey2020" ? "btn-active " : ""
                  }`}
                onClick={() => {
                  setFormat("JsonWebKey2020");
                }}
              >
                JWK
              </button>
              <button
                className={`btn w-1/2 ${format === "Multibase" ? "btn-active" : ""
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
            {verificationRelationships.map((method, indexMethod) => {
              return (
                <div key={indexMethod} className="flex justify-between w-full">
                  <div>
                    <span>{method}</span>
                    <span className="opacity-50"> as</span>
                  </div>
                  <div className="btn-group">
                    <button
                      className={`btn btn-xs ${methods[method] === "Embedded" ? "btn-primary" : ""
                        }`}
                      onClick={() => {
                        setMethods({
                          ...methods,
                          [method]: "Embedded",
                        });
                      }}
                    >
                      Embedded
                    </button>

                    <button
                      className={`btn btn-xs ${methods[method] === "Reference" ? "btn-secondary" : ""
                        }`}
                      onClick={() => {
                        setMethods({
                          ...methods,
                          [method]: "Reference",
                        });
                      }}
                    >
                      Referenced
                    </button>

                    <button
                      className={`btn btn-xs ${!methods[method] ? "btn-active" : ""
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
        className={`btn btn-info btn-outline btn-block mt-4 ${controller !== "" ? "" : "btn-disabled"
          }`}
        onClick={async () => {
          const finalMaterial: EmbeddedType = {
            format,
            curve: method.material.curve,
            controller,
            usage: methods,
            keyMaterial: material,
          }
          let finalId = id || await deriveIdentificationFragment(finalMaterial)
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
