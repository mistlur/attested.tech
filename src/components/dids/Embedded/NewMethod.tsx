import { useState } from "react";
import {
  DidDocument,
  EmbeddedVM,
} from "../../../lib/verificationMaterialBuilder";
import NewKeyMaterial from "../NewKeyMaterial";
import MethodSettings from "./MethodSettings";

export default function NewMethod({
  htmlId,
  didDocument,
  save,
}: {
  htmlId: string;
  didDocument: DidDocument;
  save: (vm: EmbeddedVM) => void;
}): JSX.Element {
  const [method, setMethod] = useState<EmbeddedVM | undefined>(undefined);
  return (
    <>
      <h3 className="text-lg font-bold">{"Add Verification Method"}</h3>
      {!method ? (
        <NewKeyMaterial
          didDocument={didDocument}
          setMethod={(km: EmbeddedVM) => setMethod(km)}
        />
      ) : (
        <MethodSettings
          htmlId={htmlId}
          didDocument={didDocument}
          save={save}
          material={method}
        />
      )}
    </>
  );
}
