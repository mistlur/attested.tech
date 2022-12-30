import {
  DidDocument,
  ReferenceVM,
} from "../../lib/verificationMaterialBuilder";
import UpsertReferenceMethod from "./UpsertReferenceMethod";

export default function SummarizeReferenceMaterial({
  material,
  didDocument,
  index,
  save,
  remove,
}: {
  index: number;
  material: ReferenceVM;
  didDocument: DidDocument;
  save: (vm: ReferenceVM) => void;
  remove: () => void;
}): JSX.Element {
  return (
    <>
      <div
        className="bg-base-200 text-xs p-8 gap-y-2 flex flex-col"
        key={index}
      >
        <div className="text-2xl opacity-50">Reference</div>
        <div className="font-mono">{material.id}</div>
        <div className="flex flex-wrap gap-2">
          {Object.keys(material.usage).map((method, index) => (
            <div className="badge badge-secondary badge-outline" key={index}>
              {method}
            </div>
          ))}
        </div>
        <label htmlFor={`vm${index}1`} className="btn">
          Edit
        </label>
        <input type="checkbox" id={`vm${index}1`} className="modal-toggle" />
        <UpsertReferenceMethod
          htmlId={`vm${index}1`}
          material={material}
          didDocument={didDocument}
          save={(vm: ReferenceVM) => save(vm)}
        />
        <button
          className="btn btn-outline btn-error mt-4"
          onClick={() => remove()}
        >
          Delete
        </button>
      </div>
    </>
  );
}
