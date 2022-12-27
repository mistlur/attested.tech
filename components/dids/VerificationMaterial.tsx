import { useState } from "react";
import {
  DidDocument,
  EmbeddedMaterial,
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
  console.log("Material coming in", material);
  console.log("diddocument", didDocument);

  const [newVerificationMethodType, setNewVerificationMethodType] = useState<
    "key" | "reference"
  >("key");

  const [id, setId] = useState<string>(material?.id || "");

  const [controller, setController] = useState<string | undefined>(
    material && isEmbeddedVm(material) ? material.controller : didDocument.id
  );

  const [format, setFormat] = useState<EmbeddedMaterial>(
    material && isEmbeddedVm(material) ? material.format : "JsonWebKey2020"
  );

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
              <div
                className={`form-control w-full ${
                  newVerificationMethodType !== "reference" ? "" : "hidden"
                }`}
              >
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
                <div>
                  <span className="opacity-50">Format</span>
                  <div className="flex">
                    <div>
                      <button
                        className={`btn btn-xs ${
                          format === "JsonWebKey2020" ? "btn-primary" : ""
                        }`}
                        onClick={() => {
                          setFormat("JsonWebKey2020");
                        }}
                      >
                        JWK
                      </button>
                    </div>
                    <div>
                      <button
                        className={`btn btn-xs ${
                          format === "Multibase" ? "btn-primary" : ""
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
                    <div
                      className={`${
                        newVerificationMethodType === "reference"
                          ? "hidden"
                          : ""
                      }`}
                    >
                      <button
                        className={`btn btn-xs ${
                          methods[method] === "Embedded" ? "btn-primary" : ""
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
            let newVerificationMethod: LogicVM;
            if (newVerificationMethodType === "reference") {
              newVerificationMethod = {
                id,
                usage: { verificationMethod: "Reference" },
              }; // ACTUALLY MAKE SO THIS CAN ONLY REFERENCE EMBEDDED
            } else {
              newVerificationMethod = {
                id,
                format,
                curve: "P-256",
                controller,
                usage: methods,
                keyMaterial:
                  material && isEmbeddedVm(material)
                    ? material.keyMaterial
                    : (await didDocument.newVerificationMaterial()).keyMaterial,
              };
            }
            save(newVerificationMethod);
          }}
        >
          {material ? "Save" : "Add"}
        </label>
      </div>
    </div>
  );
}
