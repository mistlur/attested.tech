import { DidDocument } from "@/lib/DidDocument";
import { EmbeddedMaterial } from "@/lib/DidMaterial";
import { VerificationRelationship } from "@/types/dids";

export default function SummarizeEmbeddedMethod({
  method,
  didDocument,
  index,
}: {
  index: number;
  method: EmbeddedMaterial;
  didDocument: DidDocument;
}): JSX.Element {
  return (
    <>
      <div className="bg-base-200 p-8 gap-y-4 flex flex-col" key={index}>
        <div className="text-2xl opacity-50">{method.material.curve}</div>
        <div className="text-sm">
          <span className="opacity-75">Id:</span>{" "}
          <span className="font-mono">{method.id}</span>
        </div>
        <div className="text-sm">
          <span className="opacity-75">Controller:</span>{" "}
          <span className="font-mono">{method.material.controller}</span>
          {" ("}
          {method.material.controller === didDocument.id ? (
            <span className="text-success">DID Subject</span>
          ) : (
            <span className="text-error">External</span>
          )}
          {")"}
        </div>
        <div className="flex flex-wrap gap-2 bg-base-300 p-4">
          {Object.keys(method.material.usage).map((relationship, index) => (
            <div
              className={`badge badge-outline ${method.material.usage[relationship as VerificationRelationship] ===
                "Reference"
                ? "badge-secondary"
                : "badge-accent"
                }`}
              key={index}
            >
              <div
                className="tooltip"
                data-tip={
                  method.material.usage[relationship as VerificationRelationship]
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
