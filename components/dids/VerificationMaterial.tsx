import { useState } from "react";
import {
  LogicDocument,
  LogicVM,
  newVerificationMaterial,
  VerificationRelationship,
  verificationRelationships,
} from "../../lib/verificationMaterialBuilder";

export default function VerificationMaterial({
  material,
  didDocument,
  save,
}: {
  material?: LogicVM;
  didDocument: LogicDocument;
  save: (vm: LogicVM) => void;
}): JSX.Element {
  const initialMethods = material
    ? (Object.keys(material.usage) as VerificationRelationship[])
    : [];
  console.log(initialMethods);

  const [newVerificationMethodType, setNewVerificationMethodType] = useState<
    "key" | "reference"
  >("key");

  const [controller, setController] = useState<string>(
    material?.controller || didDocument.id
  );

  const [id, setId] = useState<string>(material?.id || "");

  const [selectedVerificationMethodType, setSelectedVerificationMethodType] =
    useState<number | null>(null);

  const [methods, setMethods] =
    useState<VerificationRelationship[]>(initialMethods);

  return (
    <div className="modal">
      <div className="modal-box relative">
        <label
          htmlFor={material ? material.id : "newVerificationMaterial"}
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
              Key
            </button>
            <button
              className={`btn ${
                newVerificationMethodType === "reference" ? "btn-active" : ""
              }`}
              onClick={() => setNewVerificationMethodType("reference")}
            >
              Reference Existing
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
              {verificationRelationships.map(
                (verificationRelationship, index) => {
                  return (
                    <label className="label cursor-pointer" key={index}>
                      <span className="label-text capitalize">
                        {verificationRelationship}
                      </span>
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={methods.includes(verificationRelationship)}
                        onChange={() => {
                          methods.includes(verificationRelationship)
                            ? setMethods(
                                methods.filter(
                                  (m) => m !== verificationRelationship
                                )
                              )
                            : setMethods([
                                verificationRelationship,
                                ...methods,
                              ]);
                        }}
                      />
                    </label>
                  );
                }
              )}
            </div>
          </div>
        </div>
        <label
          htmlFor={material ? material.id : "newVerificationMaterial"}
          className="btn btn-info btn-outline btn-block"
          onClick={async () => {
            let newVerificationMethod: LogicVM;
            if (selectedVerificationMethodType) {
              newVerificationMethod = {
                id: didDocument.verificationMethods[
                  selectedVerificationMethodType
                ].id,
                controller,
                fresh: true,
                usage: {
                  ...methods.reduce((a, v) => ({ ...a, [v]: "Reference" }), {}),
                },
              };
            } else {
              newVerificationMethod = {
                ...(await newVerificationMaterial(id)),
                id, /////////////// FIXMEEEEE
                controller,
                usage: {
                  ...methods.reduce(
                    (a, v) => ({ ...a, [v]: "JsonWebKey2020" }),
                    {}
                  ),
                },
              };
            }
            save(newVerificationMethod);
            setSelectedVerificationMethodType(null);
            setMethods(["verificationMethod"]);
          }}
        >
          {material ? "Save" : "Add"}
        </label>
      </div>
    </div>
  );
}
