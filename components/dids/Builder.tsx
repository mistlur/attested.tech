"use client";

import { useState } from "react";
import { documentSchema } from "../../lib/didParser";
export default function DidBuilder() {
  const [didDocument, setDidDocument] = useState("");
  const [isDidDocumentValid, setIsDidDocumentValid] = useState(false);

  const updateDidDocument = (doc: string) => {
    const res = documentSchema.safeParse(JSON.parse(doc));
    setIsDidDocumentValid(res.success);
    if (res.success) setDidDocument(JSON.stringify(res.data, null, 2));
    else {
      console.log(res);
      setDidDocument("Invalid DID Document");
    }
  };

  return (
    <>
      <div className="bg-zinc-800 text-lime-500">
        <pre className="p-4">{didDocument}</pre>
      </div>
      {isDidDocumentValid ? (
        <div className="btn btn-success">✓ DID Document</div>
      ) : (
        <div className="btn btn-error">Invalid</div>
      )}
      <textarea
        className="textarea w-full h-96 bg-base-200 mt-8"
        placeholder="DID Document..."
        onChange={(e) => updateDidDocument(e.target.value)}
      />
    </>
  );
}
