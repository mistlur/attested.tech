import {
  DidDocument,
  ReferenceVM,
} from "../../../lib/verificationMaterialBuilder";
import ReferenceMethodSettings from "./MethodSettings";

export default function NewReferenceMethod({
  htmlId,
  didDocument,
  save,
}: {
  htmlId: string;
  didDocument: DidDocument;
  save: (vm: ReferenceVM) => void;
}): JSX.Element {
  return (
    <>
      <h3 className="text-lg font-bold">{"New Reference method"}</h3>
      <ReferenceMethodSettings
        htmlId={htmlId}
        didDocument={didDocument}
        save={save}
        method={{ id: "", usage: {} }}
      />
    </>
  );
}
