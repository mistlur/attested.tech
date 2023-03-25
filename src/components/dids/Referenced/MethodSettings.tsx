import { DidDocument } from "@/lib/DidDocument";
import { ReferencedMaterial } from "@/lib/DidMaterial";
import { verificationRelationships, UsageFormat } from "@/types/dids";
import { useState } from "react";

export default function ReferenceMethodSettings({
  htmlId,
  method,
  save,
}: {
  htmlId: string;
  method: ReferencedMaterial;
  didDocument: DidDocument;
  save: (vm: ReferencedMaterial) => void;
}): JSX.Element {
  const [id, setId] = useState<string>(method.id);
  const [methods, setMethods] = useState<UsageFormat<"Reference">>(method.getUsage());

  return (
    <div>
      <div className="flex flex-col gap-y-8">
        <div>
          <div>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Id</span>
                {/* TODO: Validate DID */}
              </label>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="did:web:..."
                className={`input input-bordered w-full ${!id ? "input-error" : ""
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
                <div key={indexMethod} className="flex justify-between w-full">
                  <div>
                    <span>{method}</span>
                    <span className="opacity-50"> as</span>
                  </div>
                  <div className="btn-group">
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
                      Reference
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
        className="btn btn-info btn-outline btn-block mt-4"
        onClick={() => {
          const newVerificationMethod: ReferencedMaterial =
            new ReferencedMaterial(
              id,
              {
                usage: methods,
              });
          save(newVerificationMethod);
        }}
      >
        Save to Document
      </label>
    </div>
  );
}
