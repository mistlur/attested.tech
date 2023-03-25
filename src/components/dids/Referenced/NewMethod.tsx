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
      <h3 className="text-lg font-bold">{"New Reference method"}</h3>
      <ReferenceMethodSettings
        htmlId={htmlId}
        didDocument={didDocument}
        save={save}
        method={new ReferencedMaterial("", { usage: {} })}
      />
    </>
  );
}
