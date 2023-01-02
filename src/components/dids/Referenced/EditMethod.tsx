import {
  DidDocument,
  ReferenceVM,
} from "../../../lib/verificationMaterialBuilder";
import ReferenceMethodSettings from "./MethodSettings";

export default function EditReferenceMethod({
  htmlId,
  didDocument,
  method,
  save,
}: {
  htmlId: string;
  didDocument: DidDocument;
  method: ReferenceVM;
  save: (vm: ReferenceVM) => void;
}): JSX.Element {
  return (
    <>
      <h3 className="text-lg font-bold">{"Edit"}</h3>
      <ReferenceMethodSettings
        htmlId={htmlId}
        didDocument={didDocument}
        save={save}
        method={method}
      />
    </>
  );
}
