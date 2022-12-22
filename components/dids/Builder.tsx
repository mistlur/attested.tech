"use client";

import { useState } from "react";
import { documentSchema } from "../../lib/didParser";
import { updateDidDocument as updateDidDocumentDAO } from "../../lib/dao";
import {
  didDocumentDecoder,
  didDocumentEncoder,
  encodeVerificationMethod,
  KeyVm,
  LogicDocument,
  newVerificationMaterial,
} from "../../lib/verificationMaterialBuilder";
import produce from "immer";
import { getCompleteDid } from "../../lib/did";

export default function DidBuilder({
  id,
  name,
  document,
}: {
  id: string;
  name: string;
  document: Record<string, any>;
}) {
  const [didDocument, setDidDocument] = useState<LogicDocument>(
    didDocumentDecoder(documentSchema.parse(document))
  );
  const [isDidDocumentValid, setIsDidDocumentValid] = useState(
    documentSchema.safeParse(document).success
  );
  const [validationError, setValidationError] = useState<string>("");

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
                onClick={() => {
                  setDidDocument(
                    produce(didDocument, (draft) => {
                      draft.controller = getCompleteDid(id);
                    })
                  );
                }}
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
            onClick={async () => {
              const newKey = await newVerificationMaterial(id, true);
              setDidDocument(
                produce(didDocument, (draft) => {
                  draft.verificationMethods = [
                    ...didDocument.verificationMethods,
                    newKey,
                  ];
                })
              );
            }}
          >
            Add VerificationMethod
          </button>
          <div className="flex flex-col gap-y-4">
            {didDocument.verificationMethods.map((vm, index) => (
              <div
                className="bg-base-200 text-xs p-8 gap-y-2 flex flex-col"
                key={index}
              >
                <div>{encodeVerificationMethod(vm).id}</div>
                <div>{encodeVerificationMethod(vm).type}</div>
                <div className="collapse">
                  <input type="checkbox" />
                  <div className="collapse-title">Edit Method</div>
                  <div className="collapse-content bg-base-300">
                    {"keyMaterial" in didDocument.verificationMethods[index] ? (
                      <div className="flex gap-x-4">
                        <button
                          className="btn btn-xs"
                          onClick={() => {
                            setDidDocument(
                              produce(didDocument, (draft) => {
                                // prettier-ignore
                                // @ts-ignore
                                draft.verificationMethods[index].representation = "Multibase";
                              })
                            );
                          }}
                        >
                          Use Multibase
                        </button>
                        <button
                          className="btn btn-xs"
                          onClick={() => {
                            setDidDocument(
                              produce(didDocument, (draft) => {
                                // prettier-ignore
                                // @ts-ignore
                                draft.verificationMethods[index].representation = "JsonWebKey2020";
                              })
                            );
                          }}
                        >
                          Use JWK
                        </button>
                      </div>
                    ) : (
                      <></>
                    )}
                    <button
                      className="btn btn-outline btn-error mt-4"
                      onClick={() => {
                        setDidDocument(
                          produce(didDocument, (draft) => {
                            // @ts-ignore
                            draft.verificationMethods.splice(index, 1);
                          })
                        );
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            className="btn btn-block btn-info"
            onClick={async () => await updateDidDocumentDAO(id, didDocument)}
          >
            Save
          </button>
        </div>
        <div className="w-1/2 p-4">
          <div className="bg-zinc-800 text-lime-500">
            <pre className="p-4 text-xs overflow-scroll">
              {JSON.stringify(didDocumentEncoder(didDocument), null, 2)}
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
