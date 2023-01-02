import {
  DidDocument,
  ReferenceVM,
  VerificationRelationship,
} from "../../../lib/verificationMaterialBuilder";

export default function SummarizeReferenceMethod({
  method,
  index,
}: {
  index: number;
  method: ReferenceVM;
  didDocument: DidDocument;
}): JSX.Element {
  return (
    <>
      <div className="bg-base-200 p-8 gap-y-4 flex flex-col" key={index}>
        <div className="text-2xl opacity-50">Reference</div>
        <div className="text-sm">
          <span className="opacity-75">Id:</span>{" "}
          <span className="font-mono">{method.id}</span>
        </div>
        <div className="flex flex-wrap gap-2 bg-base-300 p-4">
          {Object.keys(method.usage).map((relationship, index) => (
            <div
              className={`badge badge-outline ${
                method.usage[relationship as VerificationRelationship] ===
                "Reference"
                  ? "badge-secondary"
                  : "badge-accent"
              }`}
              key={index}
            >
              <div
                className="tooltip"
                data-tip={
                  method.usage[relationship as VerificationRelationship]
                }
              >
                {relationship}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
