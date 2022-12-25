import { useState } from "react";
import {
  LogicDocument,
  LogicVM,
  newVerificationMaterial,
  VerificationRelationship,
} from "../../lib/verificationMaterialBuilder";

export default function VerificationMaterial({
  didDocument,
  save,
}: {
  didDocument: LogicDocument;
  save: (vm: LogicVM) => void;
}): JSX.Element {
  const [newVerificationMethodType, setNewVerificationMethodType] = useState<
    "key" | "reference"
  >("key");
  const [selectedVerificationMethodType, setSelectedVerificationMethodType] =
    useState<number | null>(null);
  const [methods, setMethods] = useState<VerificationRelationship[]>([
    "verificationMethod",
  ]);

  return (
    <div className="modal">
      <div className="modal-box relative">
        <label
          htmlFor="my-modal-3"
          className="btn btn-sm btn-circle absolute right-2 top-2"
        >
          ✕
        </label>
        <h3 className="text-lg font-bold">Add Verification Method</h3>
        <div className="flex flex-col gap-y-4">
          <div>
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
          </div>
        </div>
        <div>
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Base Verification Method</span>
              <input
                type="checkbox"
                className="checkbox"
                checked={methods.includes("verificationMethod")}
                onChange={() => {
                  methods.includes("verificationMethod")
                    ? setMethods(
                        methods.filter((m) => m !== "verificationMethod")
                      )
                    : setMethods(["verificationMethod", ...methods]);
                }}
              />
            </label>
            <label className="label cursor-pointer">
              <span className="label-text">Authentication</span>
              <input
                type="checkbox"
                className="checkbox"
                checked={methods.includes("authentication")}
                onChange={() => {
                  methods.includes("authentication")
                    ? setMethods(methods.filter((m) => m !== "authentication"))
                    : setMethods(["authentication", ...methods]);
                }}
              />
            </label>
            <label className="label cursor-pointer">
              <span className="label-text">Assertion Method</span>
              <input
                type="checkbox"
                className="checkbox"
                checked={methods.includes("assertionMethod")}
                onChange={() => {
                  methods.includes("assertionMethod")
                    ? setMethods(methods.filter((m) => m !== "assertionMethod"))
                    : setMethods(["assertionMethod", ...methods]);
                }}
              />
            </label>
            <label className="label cursor-pointer">
              <span className="label-text">Key Agreement</span>
              <input
                type="checkbox"
                className="checkbox"
                checked={methods.includes("keyAgreement")}
                onChange={() => {
                  methods.includes("keyAgreement")
                    ? setMethods(methods.filter((m) => m !== "keyAgreement"))
                    : setMethods(["keyAgreement", ...methods]);
                }}
              />
            </label>
            <label className="label cursor-pointer">
              <span className="label-text">Capability Invocation</span>
              <input
                type="checkbox"
                className="checkbox"
                checked={methods.includes("capabilityInvocation")}
                onChange={() => {
                  methods.includes("capabilityInvocation")
                    ? setMethods(
                        methods.filter((m) => m !== "capabilityInvocation")
                      )
                    : setMethods(["capabilityInvocation", ...methods]);
                }}
              />
            </label>
            <label className="label cursor-pointer">
              <span className="label-text">Capability Delegation</span>
              <input
                type="checkbox"
                className="checkbox"
                checked={methods.includes("capabilityDelegation")}
                onChange={() => {
                  methods.includes("capabilityDelegation")
                    ? setMethods(
                        methods.filter((m) => m !== "capabilityDelegation")
                      )
                    : setMethods(["capabilityDelegation", ...methods]);
                }}
              />
            </label>
          </div>
        </div>
        <label
          htmlFor="my-modal-3"
          className="btn btn-info btn-outline"
          onClick={async () => {
            let newVerificationMethod: LogicVM;
            if (selectedVerificationMethodType) {
              newVerificationMethod = {
                id: didDocument.verificationMethods[
                  selectedVerificationMethodType
                ].id,
                controller: "did:example:123",
                fresh: true,
                usage: {
                  ...methods.reduce((a, v) => ({ ...a, [v]: "Reference" }), {}),
                },
              };
            } else {
              newVerificationMethod = {
                ...(await newVerificationMaterial(didDocument.id)),
                // controller: "did:example:123",
                usage: {
                  ...methods.reduce(
                    (a, v) => ({ ...a, [v]: "JsonWebKey2020" }),
                    {}
                  ),
                },
              };
            }
            save(newVerificationMethod);
            // setDidDocument(
            //   produce(didDocument, (draft) => {
            //     draft.verificationMethods = [
            //       ...didDocument.verificationMethods,
            //       newVerificationMethod,
            //     ];
            //   })
            // );
            setSelectedVerificationMethodType(null);
            setMethods(["verificationMethod"]);
          }}
        >
          Add
        </label>
      </div>
    </div>
  );
}
