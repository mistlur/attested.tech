import { Did } from "@/lib/did";
import { useState } from "react";
import DidInput from "./DidInput";
import { didDocumentDeserializer } from "@/lib/verificationMaterialBuilder";
import { documentSchema } from "@/lib/didParser";
import { DidDocument } from "@/lib/DidDocument";

export default function ImportDocument({
  htmlId,
  save,
}: {
  htmlId: string;
  save: (document: DidDocument) => void;
}): JSX.Element {
  const [document, setDocument] = useState<DidDocument | null>(null);
  const [
    importedDocumentValidationStatus,
    setImportedDocumentValidationStatus,
  ] = useState<string | undefined>(undefined);

  return (
    <div>
      <h3 className="text-lg font-bold text-base-content">Import Document</h3>
      <div className="form-control">
        <label className="label">
          <span className="label-text">
            The supported set of key types is limited
          </span>
          <span
            className={`label-text-alt ${
              importedDocumentValidationStatus === "Valid" ? "text-success" : ""
            } ${
              importedDocumentValidationStatus &&
              importedDocumentValidationStatus !== "Valid"
                ? "text-error"
                : ""
            }`}
          >
            {importedDocumentValidationStatus &&
              importedDocumentValidationStatus !== "Valid" &&
              "Invalid"}
          </span>
        </label>
        <textarea
          className={`textarea bg-base-300 textarea-bordered w-full h-36 font-mono text-xs ${
            importedDocumentValidationStatus === "Valid"
              ? "textarea-success"
              : ""
          } ${
            importedDocumentValidationStatus &&
            importedDocumentValidationStatus !== "Valid"
              ? "textarea-error"
              : importedDocumentValidationStatus === "Valid"
              ? "textarea-success"
              : ""
          }`}
          onChange={(e) => {
            if (e.target.value === "") {
              setImportedDocumentValidationStatus(undefined);
              return;
            }
            try {
              const maybeDocument = didDocumentDeserializer(
                documentSchema.parse(JSON.parse(e.target.value))
              );
              setImportedDocumentValidationStatus("Valid");
              setDocument(maybeDocument);
            } catch (e) {
              setImportedDocumentValidationStatus(`${e}`);
            }
          }}
        />
      </div>
      {importedDocumentValidationStatus &&
        importedDocumentValidationStatus !== "Valid" && (
          <div className="bg-error text-error-content p-4 mt-4">
            <span className="font-bold">Error importing DID Document:</span>
            <pre className="font-mono text-sm overflow-scroll">
              {importedDocumentValidationStatus}
            </pre>
          </div>
        )}
      <label
        htmlFor={htmlId}
        className={`btn btn-info btn-outline btn-block mt-4 ${
          importedDocumentValidationStatus ? "" : "btn-disabled"
        }`}
        onClick={() => {
          save(document);
        }}
      >
        Import DID Document
      </label>
    </div>
  );
}
