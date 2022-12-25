"use client";

import { useState } from "react";
import { documentSchema } from "../../lib/didParser";
import { updateDidDocument as updateDidDocumentDAO } from "../../lib/dao";
import {
  didDocumentDeserializer,
  didDocumentSerializer,
  LogicDocument,
  LogicVM,
  VerificationRelationship,
} from "../../lib/verificationMaterialBuilder";
import produce from "immer";
import { getCompleteDid } from "../../lib/did";
import VerificationMaterial from "./VerificationMaterial";

const attemptSerialization = (didDocument: LogicDocument): JSX.Element => {
  let result: string;
  let validDocument: boolean;
  try {
    result = JSON.stringify(didDocumentSerializer(didDocument), null, 2);
    validDocument = true;
  } catch (e) {
    // @ts-ignore
    result = e.toString();
    validDocument = false;
  }

  return (
    <div>
      {validDocument ? (
        <div className="bg-success text-success-content p-4">✓ Valid</div>
      ) : (
        <div className="bg-error text-error-content p-4">
          <div>Invalid</div>
        </div>
      )}
      <div className="bg-zinc-800 text-lime-500">
        <pre className="p-4 text-xs overflow-scroll">{result}</pre>
      </div>
    </div>
  );
};

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
    didDocumentDeserializer(documentSchema.parse(document))
  );

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
          {/* START Verification method modal */}
          <label htmlFor="my-modal-3" className="btn">
            Add VerificationMethod
          </label>
          <input type="checkbox" id="my-modal-3" className="modal-toggle" />
          <VerificationMaterial
            didDocument={didDocument}
            save={(vm: LogicVM) =>
              setDidDocument(
                produce(didDocument, (draft) => {
                  draft.verificationMethods = [
                    ...didDocument.verificationMethods,
                    vm,
                  ];
                })
              )
            }
          />
          {/* END Verification method modal */}

          <div className="flex flex-col gap-y-4">
            {didDocument.verificationMethods.map((vm, index) => (
              <div
                className="bg-base-200 text-xs p-8 gap-y-2 flex flex-col"
                key={index}
              >
                <div className="text-2xl opacity-50">{vm.curve}</div>
                <div className="font-mono">{vm.id}</div>
                <div>Controller: {vm.controller}</div>
                <div className="flex flex-col gap-y-4 bg-base-300 p-4">
                  {Object.keys(
                    didDocument.verificationMethods[index]["usage"]
                  ).map((method, indexMethod) => (
                    <div
                      key={indexMethod}
                      className="flex align-baseline justify-between w-full"
                    >
                      <div>
                        <span className="mr-4">{method}</span>
                        <button
                          className="btn btn-xs mr-4"
                          onClick={() => {
                            setDidDocument(
                              produce(didDocument, (draft) => {
                                //@ts-ignore
                                draft.verificationMethods[index]["usage"][
                                  method
                                ] = "Multibase";
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
                                // @ts-ignore
                                draft.verificationMethods[index]["usage"][
                                  method
                                ] = "JsonWebKey2020";
                              })
                            );
                          }}
                        >
                          Use JWK
                        </button>
                      </div>
                      <div>
                        <button
                          className="btn btn-xs btn-error btn-square"
                          onClick={() => {
                            setDidDocument(
                              produce(didDocument, (draft) => {
                                // @ts-ignore
                                draft.verificationMethods[index]["usage"][
                                  method
                                ] = undefined;
                              })
                            );
                          }}
                        >
                          X
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <label htmlFor="my-modal-3" className="btn">
                  Add VerificationMethod
                </label>
                <input
                  type="checkbox"
                  id="my-modal-3"
                  className="modal-toggle"
                />
                <VerificationMaterial
                  didDocument={didDocument}
                  save={(vm: LogicVM) =>
                    setDidDocument(
                      produce(didDocument, (draft) => {
                        draft.verificationMethods = [
                          ...didDocument.verificationMethods,
                          vm,
                        ];
                      })
                    )
                  }
                />
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
            ))}
          </div>
          <button
            className="btn btn-block btn-info"
            onClick={async () =>
              await updateDidDocumentDAO(id, didDocumentSerializer(didDocument))
            }
          >
            Publish
          </button>
        </div>
        <div className="w-1/2 p-4">{attemptSerialization(didDocument)}</div>
      </div>
    </>
  );
}
