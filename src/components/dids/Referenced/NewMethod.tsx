import { DidDocument } from "@/lib/DidDocument";
import { ReferencedMaterial } from "@/lib/DidMaterial";
import ReferenceMethodSettings from "./MethodSettings";

export default function NewReferenceMethod({
  htmlId,
  didDocument,
  save,
}: {
  htmlId: string;
  didDocument: DidDocument;
  save: (vm: ReferencedMaterial) => void;
}): JSX.Element {
  return (
    <>
      <h3 className="text-lg font-bold mb-8">{"New Reference method"}</h3>
      <ReferenceMethodSettings
        htmlId={htmlId}
        didDocument={didDocument}
        save={save}
        method={
          new ReferencedMaterial("", {
            usage: {
              authentication: "Reference",
              assertionMethod: "Reference",
              keyAgreement: "Reference",
              capabilityInvocation: "Reference",
              capabilityDelegation: "Reference",
            },
          })
        }
      />
    </>
  );
}
