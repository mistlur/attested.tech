import { useState } from "react";
import {
  DidDocument,
  isEmbeddedVm,
  LogicVM,
  ReferenceVM,
  Usage,
  verificationRelationships,
} from "../../lib/verificationMaterialBuilder";

export default function VerificationMaterial({
  htmlId,
  material,
  didDocument,
  save,
}: {
  htmlId: string;
  material?: LogicVM;
  didDocument: DidDocument;
  save: (vm: LogicVM) => void;
}): JSX.Element {
  const initialMethods = material ? material.usage : {};
  console.log("initialMethods", initialMethods);

  const [newVerificationMethodType, setNewVerificationMethodType] = useState<
    "key" | "reference"
  >("key");

  const [controller, setController] = useState<string | undefined>(
    material && isEmbeddedVm(material) ? material.controller : didDocument.id
  );

  const [id, setId] = useState<string>(material?.id || "");

  const [selectedVerificationMethodType, setSelectedVerificationMethodType] =
    useState<number | null>(null);

  const [methods, setMethods] = useState<Usage>(initialMethods);

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
          <div className="btn-group">
            <button
              className={`btn ${
                newVerificationMethodType === "key" ? "btn-active" : ""
              }`}
              onClick={() => setNewVerificationMethodType("key")}
            >
              Embedded
            </button>
            <button
              className={`btn ${
                newVerificationMethodType === "reference" ? "btn-active" : ""
              }`}
              onClick={() => setNewVerificationMethodType("reference")}
            >
              Reference
            </button>
          </div>
          <div>
            <div
              className={`${
                newVerificationMethodType === "reference" ? "" : "hidden"
              }`}
            >
              <select className="select select-bordered select-lg w-full max-w-xs">
                {didDocument.verificationMethods.map((vm, index) => (
                  <option
                    key={index}
                    disabled={index === 0}
                    onClick={() => setSelectedVerificationMethodType(index)}
                  >
                    {vm.id}
                  </option>
                ))}
              </select>
            </div>
            <div
              className={`${
                newVerificationMethodType === "reference" ? "hidden" : ""
              }`}
            >
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
            <span className="opacity-50">
              Select Verification Relationships
            </span>
            <div className="form-control">
              {verificationRelationships.map((method, indexMethod) => {
                return (
                  <div
                    key={indexMethod}
                    className="flex justify-between w-full"
                  >
                    <div>
                      <span className="mr-4">{method}</span>
                    </div>
                    <div>
                      <button
                        className={`btn btn-xs ${
                          methods[method] === "Multibase" ? "btn-primary" : ""
                        }`}
                        onClick={() => {
                          setMethods({
                            ...methods,
                            [method]: "Multibase",
                          });
                        }}
                      >
                        Multibase
                      </button>
                    </div>
                    <div>
                      <button
                        className={`btn btn-xs ${
                          methods[method] === "JsonWebKey2020"
                            ? "btn-primary"
                            : ""
                        }`}
                        onClick={() => {
                          setMethods({
                            ...methods,
                            [method]: "JsonWebKey2020",
                          });
                        }}
                      >
                        JWK
                      </button>
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
                          setMethods({
                            ...methods,
                            [method]: undefined,
                          });
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
          className="btn btn-info btn-outline btn-block"
          onClick={async () => {
            let newVerificationMethod: LogicVM;
            if (selectedVerificationMethodType) {
              newVerificationMethod = {
                id: didDocument.verificationMethods[
                  selectedVerificationMethodType
                ].id,
                usage: {},
              } as ReferenceVM; // ACTUALLY MAKE SO THIS CAN ONLY REFERENCE EMBEDDED
            } else {
              newVerificationMethod = {
                ...(await didDocument.newVerificationMaterial()),
                id, /////////////// FIXMEEEEE
                controller,
                usage: methods,
              };
            }
            save(newVerificationMethod);
            setSelectedVerificationMethodType(null);
            setMethods({});
          }}
        >
          {material ? "Save" : "Add"}
        </label>
      </div>
    </div>
  );
}
