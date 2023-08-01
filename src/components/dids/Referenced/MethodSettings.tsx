import { DidDocument } from "@/lib/DidDocument";
import { ReferencedMaterial } from "@/lib/DidMaterial";
import { verificationRelationships, UsageFormat } from "@/types/dids";
import { useState } from "react";
import DidInput from "../DidInput";
import Link from "next/link";
import AnnotatedHeader from "@/components/attested-default-content/annotatedHeader";

export default function ReferenceMethodSettings({
  htmlId,
  method,
  save,
}: {
  htmlId: string;
  method: ReferencedMaterial;
  didDocument: DidDocument;
  save: (vm: ReferencedMaterial) => void;
}): JSX.Element {
  const [id, setId] = useState<string>(method.id);
  const [methods, setMethods] = useState<UsageFormat<"Reference">>(
    method.getUsage()
  );

  return (
    <div className="flex flex-col gap-y-8 text-base-content">
      <div className="flex flex-col gap-y-2 text-base-content">
        <DidInput
          value={method.id}
          callback={(e) => {
            setId(e.did?.serialize() || "");
          }}
        />
        <div className="divider my-1" />
        <div>
          <AnnotatedHeader
            headerText="Verification Relationships"
            headerSize="text-lg"
            body="Verification methods can be embedded in or referenced from properties
          associated with various verification relationships. Referencing
          verification methods allows them to be used by more than one
          verification relationship."
            externalDocsLink="https://w3c.github.io/did-core/#verification-methods"
            externalDocsDesc="Verification Methods Documentation"
          />
          <div className="form-control">
            {verificationRelationships.map((method, indexMethod) => {
              return (
                <div key={indexMethod} className="flex justify-between w-full">
                  <div>
                    <span>{method}</span>
                    <span className="opacity-50"> as</span>
                  </div>
                  <div className="btn-group">
                    <button
                      className={`btn btn-xs ${
                        methods[method] === "Reference" ? "btn-secondary" : ""
                      }`}
                      onClick={() => {
                        setMethods({
                          ...methods,
                          [method]: "Reference",
                        });
                      }}
                    >
                      Reference
                    </button>

                    <button
                      className={`btn btn-xs ${
                        !methods[method] ? "btn-active" : ""
                      }`}
                      onClick={() => {
                        const { [method]: remove, ...keep } = methods;
                        setMethods(keep);
                      }}
                    >
                      Unused
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <label
        htmlFor={htmlId}
        className={`btn btn-info btn-outline btn-block mt-4 ${
          id === "" ? "btn-disabled" : ""
        }`}
        onClick={() => {
          const newVerificationMethod: ReferencedMaterial =
            new ReferencedMaterial(id, {
              usage: methods,
            });
          save(newVerificationMethod);
        }}
      >
        Save to Document
      </label>
    </div>
  );
}
