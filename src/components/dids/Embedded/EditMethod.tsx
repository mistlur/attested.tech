import { DidDocument } from "@/lib/DidDocument";
import { EmbeddedMaterial } from "@/lib/DidMaterial";
import EmbeddedMethodSettings from "./MethodSettings";

export default function EditEmbeddedMethod({
  htmlId,
  didDocument,
  method,
  save,
}: {
  htmlId: string;
  didDocument: DidDocument;
  method: EmbeddedMaterial;
  save: (vm: EmbeddedMaterial) => void;
}): JSX.Element {
  return (
    <>
      <h3 className="text-lg font-bold text-base-content truncate max-w-sm">
        Edit <span className="font-mono opacity-75">{method.id}</span>
      </h3>
      <EmbeddedMethodSettings
        htmlId={htmlId}
        didDocument={didDocument}
        save={save}
        method={method}
      />
    </>
  );
}
