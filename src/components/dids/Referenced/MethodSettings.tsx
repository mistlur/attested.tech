import { DidDocument } from "@/lib/DidDocument";
import { ReferencedMaterial } from "@/lib/DidMaterial";
import { verificationRelationships, UsageFormat } from "@/types/dids";
import { useState } from "react";
import DidInput from "../DidInput";
import Link from "next/link";

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
      <div className="flex flex-col gap-y-8 text-base-content">
        <DidInput
          value={method.id}
          callback={(e) => {
            setId(e.did?.serialize() || "");
          }}
        />

        <div>
          <span className="opacity-50">Use in</span>
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
      <div className="prose">
        <p>
          See the{" "}
          <Link
            className={"underline"}
            href={"https://w3c.github.io/did-core/#verification-methods"}
            passHref
            target={"_blank"}
          >
            Verification Methods Documentation
          </Link>{" "}
          for more information of each usage.
        </p>
      </div>
    </div>
  );
}
