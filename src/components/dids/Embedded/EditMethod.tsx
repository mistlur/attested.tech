import {
  DidDocument,
  EmbeddedVM,
} from "../../../lib/verificationMaterialBuilder";
import MethodSettings from "./MethodSettings";

export default function EditMethod({
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
      <h3 className="text-lg font-bold">{"Smirper Edit"}</h3>
      <MethodSettings
        htmlId={htmlId}
        didDocument={didDocument}
        save={save}
        material={method}
      />
    </>
  );
}
