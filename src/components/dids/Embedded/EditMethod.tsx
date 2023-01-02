import {
  DidDocument,
  EmbeddedVM,
} from "../../../lib/verificationMaterialBuilder";
import EmbeddedMethodSettings from "./MethodSettings";

export default function EditEmbeddedMethod({
  htmlId,
  didDocument,
  method,
  save,
}: {
  htmlId: string;
  didDocument: DidDocument;
  method: EmbeddedVM;
  save: (vm: EmbeddedVM) => void;
}): JSX.Element {
  return (
    <>
      <h3 className="text-lg font-bold">{"Edit"}</h3>
      <EmbeddedMethodSettings
        htmlId={htmlId}
        didDocument={didDocument}
        save={save}
        method={method}
      />
    </>
  );
}
