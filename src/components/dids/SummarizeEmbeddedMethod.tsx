import {
  DidDocument,
  EmbeddedVM,
  VerificationRelationship,
} from "../../lib/verificationMaterialBuilder";
import UpsertEmbeddedMethod from "./UpsertEmbeddedMethod";

export default function SummarizeEmbeddedMaterial({
  material,
  didDocument,
  index,
  save,
  remove,
}: {
  index: number;
  material: EmbeddedVM;
  didDocument: DidDocument;
  save: (vm: EmbeddedVM) => void;
  remove: () => void;
}): JSX.Element {
  return (
    <>
      <div className="bg-base-200 p-8 gap-y-4 flex flex-col" key={index}>
        <div className="text-2xl opacity-50">{material.curve}</div>
        <div className="text-sm">
          <span className="opacity-75">Id:</span>{" "}
          <span className="font-mono">{material.id}</span>
        </div>
        <div className="text-sm">
          <span className="opacity-75">Controller:</span>{" "}
          <span className="font-mono">{material.controller}</span>
          {" ("}
          {material.controller === didDocument.id ? (
            <span className="text-success">DID Subject</span>
          ) : (
            <span className="text-error">External</span>
          )}
          {")"}
        </div>
        <div className="flex flex-wrap gap-2 bg-base-300 p-4">
          {Object.keys(material.usage).map((method, index) => (
            <div
              className={`badge badge-outline ${
                material.usage[method as VerificationRelationship] ===
                "Reference"
                  ? "badge-secondary"
                  : "badge-accent"
              }`}
              key={index}
            >
              <div
                className="tooltip"
                data-tip={material.usage[method as VerificationRelationship]}
              >
                {method}
              </div>
            </div>
          ))}
        </div>

        <div className="flex w-full justify-between mt-4">
          <label htmlFor={`embeddedVm${index}`} className="btn btn-wide">
            Edit
          </label>
          <input
            type="checkbox"
            id={`embeddedVm${index}`}
            className="modal-toggle"
          />
          <UpsertEmbeddedMethod
            htmlId={`embeddedVm${index}`}
            material={material}
            didDocument={didDocument}
            save={(vm: EmbeddedVM) => save(vm)}
          />
          <button
            className="btn btn-error btn-outline"
            onClick={() => remove()}
          >
            Delete
          </button>
        </div>
      </div>
    </>
  );
}
