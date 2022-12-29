import { useState } from "react";
import {
  DidDocument,
  ReferenceVM,
  EmbeddedUsage,
  verificationRelationships,
  ReferencedUsage,
} from "../../lib/verificationMaterialBuilder";

export default function UpsertReferenceMethod({
  htmlId,
  material,
  save,
}: {
  htmlId: string;
  material?: ReferenceVM;
  didDocument: DidDocument;
  save: (vm: ReferenceVM) => void;
}): JSX.Element {
  const initialMethods = material ? material.usage : {};
  const [id, setId] = useState<string>(material?.id || "");
  const [methods, setMethods] = useState<ReferencedUsage>(initialMethods);

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
                    <div>
                      <button
                        className={`btn btn-xs ${
                          methods[method] === "Reference" ? "btn-primary" : ""
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
                    </div>
                    <div>
                      <button
                        className={`btn btn-xs ${
                          !methods[method] ? "btn-primary" : "btn-outline"
                        }`}
                        onClick={() => {
                          const { [method]: remove, ...keep } = methods;
                          setMethods(keep);
                        }}
                      >
                        Not used
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
            let newVerificationMethod: ReferenceVM = {
              id,
              usage: methods,
            };

            save(newVerificationMethod);
          }}
        >
          {material ? "Save" : "Add"}
        </label>
      </div>
    </div>
  );
}
