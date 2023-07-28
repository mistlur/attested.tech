import { DidDocument } from "@/lib/DidDocument";
import { EmbeddedMaterial } from "@/lib/DidMaterial";
import { useState } from "react";

import NewKeyMaterial from "../NewKeyMaterial";
import EmbeddedMethodSettings from "./MethodSettings";

export default function NewEmbeddedMethod({
  htmlId,
  didDocument,
  save,
}: {
  htmlId: string;
  didDocument: DidDocument;
  save: (vm: EmbeddedMaterial) => void;
}): JSX.Element {
  const [method, setMethod] = useState<EmbeddedMaterial | undefined>(undefined);
  return (
    <>
      <h3 className="text-lg font-bold mb-8">New Embedded Material</h3>
      {!method ? (
        <NewKeyMaterial
          didDocument={didDocument}
          setMethod={(km: EmbeddedMaterial) => setMethod(km)}
        />
      ) : (
        <EmbeddedMethodSettings
          htmlId={htmlId}
          didDocument={didDocument}
          save={save}
          method={method}
        />
      )}
    </>
  );
}
