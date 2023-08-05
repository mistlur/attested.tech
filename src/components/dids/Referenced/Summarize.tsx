import { DidDocument } from "@/lib/DidDocument";
import { ReferencedMaterial } from "@/lib/DidMaterial";
import { VerificationRelationship } from "@/types/dids";

function getRelationShipIcon(
  relationship: VerificationRelationship
): JSX.Element {
  switch (relationship) {
    case "authentication":
      return <span className="font-mono">Auth</span>;
    case "assertionMethod":
      return <span className="font-mono">AM</span>;
    case "keyAgreement":
      return <span className="font-mono">KA</span>;
    case "capabilityDelegation":
      return <span className="font-mono">CD</span>;
    case "capabilityInvocation":
      return <span className="font-mono">CI</span>;
    default:
      return <span>unknown</span>;
  }
}

export default function SummarizeReferenceMethod({
  method,
  index,
}: {
  index: number;
  method: ReferencedMaterial;
  didDocument: DidDocument;
}): JSX.Element {
  return (
    <>
      <div className="flex flex-col min-w-0 pr-1" key={index}>
        <div className="text-sm">
          <div className="truncate">
            <span className="opacity-50 text-neutral-content">
              Referenced material
            </span>
          </div>
          <div className="truncate">
            <span className="opacity-50">Id:</span> {method.id}
          </div>
          <div className="flex flex-wrap">
            <span className="opacity-50 mr-1">Usage:</span>
            {Object.keys(method.material.usage).map(
              (relationship, index, arr) => (
                <div key={index}>
                  <div
                    className="tooltip"
                    data-tip={`${relationship} as ${
                      method.material.usage[
                        relationship as VerificationRelationship
                      ]
                    }`}
                  >
                    {getRelationShipIcon(
                      relationship as VerificationRelationship
                    )}
                    {index === arr.length - 1 ? "" : " -"}
                    &nbsp;
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
}
