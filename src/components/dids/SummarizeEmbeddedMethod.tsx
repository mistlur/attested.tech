import {
  DidDocument,
  EmbeddedVM,
  VerificationRelationship,
} from "../../lib/verificationMaterialBuilder";

export default function SummarizeEmbeddedMaterial({
  material,
  didDocument,
  index,
}: {
  index: number;
  material: EmbeddedVM;
  didDocument: DidDocument;
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
      </div>
    </>
  );
}
