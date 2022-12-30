import { useState } from "react";
import {
  DidDocument,
  EmbeddedMaterial,
  EmbeddedVM,
  EmbeddedUsage,
  verificationRelationships,
  deriveIdentificationFragment,
} from "../../lib/verificationMaterialBuilder";
import NewKeyMaterial from "./NewKeyMaterial";

export default function UpsertEmbeddedMethod({
  htmlId,
  material,
  didDocument,
  save,
}: {
  htmlId: string;
  material?: EmbeddedVM; // TODO: Make this required. To make reusable component, pre-generate material and then populate
  didDocument: DidDocument;
  save: (vm: EmbeddedVM) => void;
}): JSX.Element {
  const initialMethods = material ? material.usage : {};
  const [id, setId] = useState<string>(material?.id || "");
  const [controller, setController] = useState<string | undefined>(
    material ? material.controller : didDocument.id
  );

  const [keyMaterial, setKeyMaterial] = useState<Uint8Array | undefined>(
    material ? material.keyMaterial : undefined
  );

  const [format, setFormat] = useState<EmbeddedMaterial>(
    material ? material.format : "JsonWebKey2020"
  );

  const [methods, setMethods] = useState<EmbeddedUsage>(initialMethods);

  return (
    <div className="modal">
      <div className="modal-box relative">
        <label
          htmlFor={htmlId}
          className="btn btn-sm btn-circle absolute right-2 top-2"
        >
          ✕
        </label>
        <h3 className="text-lg font-bold">
          {material ? "Edit Material" : "Add Verification Method"}
        </h3>
        {!material?.keyMaterial && (
          <NewKeyMaterial
            saveKeyMaterial={(km: Uint8Array) => setKeyMaterial(km)}
          />
        )}
        <div className="flex flex-col gap-y-8">
          <div>
            <div>
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Id</span>
                  {!id ? (
                    <span className="label-text-alt text-xs text-error">
                      This must be a valid DID URL
                    </span>
                  ) : (
                    <span className="label-text-alt text-xs">
                      Leave blank to generate the Id
                    </span>
                  )}
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
                  <div
                    key={indexMethod}
                    className="flex justify-between w-full"
                  >
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
          onClick={async () => {
            const km = keyMaterial
              ? keyMaterial
              : (await didDocument.newVerificationMaterial()).keyMaterial;
            const newVerificationMethod: EmbeddedVM = {
              id: id
                ? id
                : `${didDocument.id}#${deriveIdentificationFragment(
                    format,
                    km
                  )}`,
              format,
              curve: "P-256",
              controller,
              usage: methods,
              keyMaterial: km,
            };
            save(newVerificationMethod);
            // setPrivateKey(undefined);
            setKeyMaterial(undefined);
          }}
        >
          {material ? "Save" : "Add"}
        </label>
      </div>
    </div>
  );
}
