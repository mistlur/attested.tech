import { useState } from "react";
import {
  DidDocument,
  EmbeddedMaterial,
  EmbeddedVM,
  EmbeddedUsage,
  verificationRelationships,
  deriveIdentificationFragment,
} from "../../../lib/verificationMaterialBuilder";

export default function MethodSettings({
  htmlId,
  material,
  didDocument,
  save,
}: {
  htmlId: string;
  material: EmbeddedVM;
  didDocument: DidDocument;
  save: (vm: EmbeddedVM) => void;
}): JSX.Element {
  const [id, setId] = useState<string>(material.id);
  const [controller, setController] = useState<string>(material.controller);
  const [format, setFormat] = useState<EmbeddedMaterial>(material.format);
  const [methods, setMethods] = useState<EmbeddedUsage>(material.usage);

  return (
    <div>
      <div className="flex flex-col gap-y-8">
        <div>
          <div>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Id</span>
                {/* TODO: Validate DID */}
                <span className="label-text-alt text-xs">
                  Leave blank to generate the Id
                </span>
              </label>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="did:web:..."
                className={`input input-bordered w-full ${
                  !id ? "input-error" : ""
                }`}
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Controller</span>
              </label>
              {/* TODO: Validate DID */}
              <input
                type="text"
                value={controller}
                onChange={(e) => setController(e.target.value)}
                placeholder="did:web:..."
                className="input input-bordered w-full"
              />
            </div>
          </div>
        </div>

        <div>
          <span className="opacity-50">Format</span>
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
          <span className="opacity-50">Use in</span>
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
                      className={`btn btn-xs ${
                        methods[method] === "Embedded" ? "btn-accent" : ""
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
                      className={`btn btn-xs ${
                        methods[method] === "Reference" ? "btn-secondary" : ""
                      }`}
                      onClick={() => {
                        setMethods({
                          ...methods,
                          [method]: "Reference",
                        });
                      }}
                    >
                      Reference
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
        className="btn btn-info btn-outline btn-block mt-4"
        onClick={() => {
          const newVerificationMethod: EmbeddedVM = {
            id: id
              ? id
              : `${didDocument.id}#${deriveIdentificationFragment(
                  format,
                  material.keyMaterial
                )}`,
            format,
            curve: "P-256",
            controller,
            usage: methods,
            keyMaterial: material.keyMaterial,
          };
          save(newVerificationMethod);
        }}
      >
        Save to Document
      </label>
    </div>
  );
}
