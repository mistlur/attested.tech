"use client";

import { useState } from "react";
import { documentSchema } from "../../lib/didParser";
import { updateDidDocument as updateDidDocumentDAO } from "../../lib/dao";
import {
  didDocumentDecoder,
  didDocumentEncoder,
  newVerificationMaterial,
  representVerificationMaterial,
} from "../../lib/verificationMaterialBuilder";
import { getCompleteDid, getDidUri } from "../../lib/did";

export default function DidBuilder({
  id,
  name,
  document,
}: {
  id: string;
  name: string;
  document: Record<string, any>;
}) {
  const [didDocument, setDidDocument] = useState(
    didDocumentDecoder(documentSchema.parse(document))
  );
  const [isDidDocumentValid, setIsDidDocumentValid] = useState(
    documentSchema.safeParse(document).success
  );
  const [validationError, setValidationError] = useState<string>("");
  const [isRepresentationJwk, setIsRepresentationJwk] =
    useState<boolean>(false);

  //   const updateDidDocument = (doc: string) => {
  //     const res = documentSchema.safeParse(JSON.parse(doc));
  //     setIsDidDocumentValid(res.success);
  //     if (res.success) setDidDocument(res.data);
  //     else {
  //       setValidationError(JSON.stringify(res.error, null, 2));
  //     }
  //   };

  const updateToDidDocument = (property: Record<string, any>) => {
    const newDoc = { ...didDocument, ...property };
    const res = documentSchema.safeParse(newDoc);
    setIsDidDocumentValid(res.success);
    if (res.success)
      setDidDocument(didDocumentDecoder(documentSchema.parse(res.data)));
    else {
      setValidationError(JSON.stringify(res.error, null, 2));
    }
  };

  return (
    <>
      <h1 className="text-2xl font-extrabold ml-4 mb-4">{name}</h1>
      <div className="flex">
        <div className="w-1/2 p-4">
          <div className="dropdown">
            <label tabIndex={0} className="btn m-1">
              Add DID Controller
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content menu p-2 shadow bg-base-300 rounded-box w-96"
            >
              <li
                onClick={async () =>
                  updateToDidDocument({ controller: getCompleteDid(id) })
                }
              >
                <div>DID Subject</div>
              </li>
              <li>
                <div>
                  Another entity <span className="italic">(opens modal)</span>
                </div>
              </li>
            </ul>
          </div>
          <button
            className="btn"
            onClick={async () =>
              updateToDidDocument({
                verificationMethod: [
                  ...didDocument.verificationMethods,
                  await representVerificationMaterial(
                    isRepresentationJwk ? "JsonWebKey2020" : "P256Key2021",
                    id,
                    await newVerificationMaterial()
                  ),
                ],
              })
            }
          >
            Add VerificationMethod
          </button>
          {didDocument.verificationMethods.map((vm, index) => (
            <div className="bg-primary text-xs p-16 flex flex-col" key={index}>
              <div>{vm.id}</div>
              <div>
                <input
                  type="checkbox"
                  className="toggle toggle-info"
                  checked={isRepresentationJwk}
                  onChange={() => setIsRepresentationJwk(!isRepresentationJwk)}
                />
              </div>
            </div>
          ))}
          <button
            className="btn btn-block"
            onClick={async () => await updateDidDocumentDAO(id, didDocument)}
          >
            Save
          </button>
        </div>
        <div className="w-1/2 p-4">
          <div className="bg-zinc-800 text-lime-500">
            <pre className="p-4 text-xs overflow-scroll">
              {JSON.stringify(
                didDocumentEncoder(
                  didDocument,
                  isRepresentationJwk ? "JsonWebKey2020" : "wd"
                ),
                null,
                2
              )}
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
