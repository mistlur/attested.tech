import { DidDocument } from "@/lib/DidDocument";
import { ReferencedMaterial } from "@/lib/DidMaterial";
import ReferenceMethodSettings from "./MethodSettings";

export default function EditReferenceMethod({
  htmlId,
  didDocument,
  method,
  save,
}: {
  htmlId: string;
  didDocument: DidDocument;
  method: ReferencedMaterial;
  save: (vm: ReferencedMaterial) => void;
}): JSX.Element {
  return (
    <>
      <h3 className="text-lg font-bold text-base-content truncate max-w-sm">Edit <span className="font-mono opacity-75">{method.id}</span></h3>
      <ReferenceMethodSettings
        htmlId={htmlId}
        didDocument={didDocument}
        save={save}
        method={method}
      />
    </>
  );
}
