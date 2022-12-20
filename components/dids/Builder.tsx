"use client";

import { useState } from "react";
import { documentSchema } from "../../lib/didParser";
import { updateDidDocument as updateDidDocumentDAO } from "../../lib/dao";

export default function DidBuilder({
  id,
  name,
  document,
}: {
  id: string;
  name: string;
  document: Record<string, any>;
}) {
  const [didDocument, setDidDocument] = useState(document);
  const [isDidDocumentValid, setIsDidDocumentValid] = useState(
    documentSchema.safeParse(document).success
  );
  const [validationError, setValidationError] = useState<string>("");

  const updateDidDocument = (doc: string) => {
    const res = documentSchema.safeParse(JSON.parse(doc));
    setIsDidDocumentValid(res.success);
    if (res.success) setDidDocument(res.data);
    else {
      setValidationError(JSON.stringify(res.error, null, 2));
      //   setDidDocument({});
    }
  };

  return (
    <>
      <h1 className="text-2xl font-extrabold ml-4 mb-4">{name}</h1>
      <div className="flex">
        <div className="w-1/2 p-4">
          <textarea
            className="textarea w-full h-96 bg-base-200"
            placeholder="DID Document..."
            defaultValue={JSON.stringify(document, null, 2)}
            onChange={(e) => updateDidDocument(e.target.value)}
          />

          <button
            className="btn btn-block"
            onClick={async () => await updateDidDocumentDAO(id, didDocument)}
          >
            Save
          </button>
        </div>
        <div className="w-1/2 p-4">
          <div className="bg-zinc-800 text-lime-500">
            <pre className="p-4 text-xs">
              {JSON.stringify(didDocument, null, 2)}
            </pre>
          </div>
          {isDidDocumentValid ? (
            <div className="bg-success text-success-content p-4">✓ Valid</div>
          ) : (
            <div className="bg-error text-error-content p-4">
              <div>Invalid</div>{" "}
              <pre className="text-xs">{validationError}</pre>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
