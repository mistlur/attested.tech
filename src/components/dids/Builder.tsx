"use client";

import { useState, useCallback, useEffect } from "react";
import { documentSchema } from "../../lib/didParser";
// import { updateDidDocument as updateDidDocumentDAO } from "../../lib/dao";
import {
  DidDocument,
  didDocumentDeserializer,
  EmbeddedVM,
  isEmbeddedVm,
  ReferenceVM,
} from "../../lib/verificationMaterialBuilder";
import produce from "immer";
import { getCompleteDid } from "../../lib/did";
import NewEmbeddedMethod from "./Embedded/NewMethod";
import SummarizeEmbeddedMethod from "./Embedded/Summarize";
import EditEmbeddedMethod from "./Embedded/EditMethod";
import NewReferenceMethod from "./Referenced/NewMethod";
import SummarizeReferenceMethod from "./Referenced/Summarize";
import EditReferenceMethod from "./Referenced/EditMethod";

const attemptSerialization = (didDocument: DidDocument): JSX.Element => {
  let result: string;
  let validDocument: boolean;
  try {
    result = JSON.stringify(didDocument.serialize(), null, 2);
    validDocument = true;
  } catch (e) {
    // @ts-ignore
    result = e.toString();
    validDocument = false;
  }

  return (
    <div>
      <div className="bg-primary text-primary-content p-4">DID Document</div>
      <div className="bg-base-200">
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
  const [didDocument, setDidDocument] = useState<DidDocument>(
    didDocumentDeserializer(documentSchema.parse(document))
  );
  const [showNewEmbeddedMethodModal, setShowNewEmbeddedMethodModal] =
    useState<boolean>(false);
  const [showNewReferenceMethodModal, setShowNewReferenceMethodModal] =
    useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<string | null>(null);

  const onKeyup = useCallback((event) => {
    if (event.key === "Escape") {
      setShowNewEmbeddedMethodModal(false)
      setShowNewReferenceMethodModal(false)
      setShowEditModal(null)
    }
  }, [showNewEmbeddedMethodModal, showNewReferenceMethodModal, showEditModal])

  useEffect(() => {
    if (window) {
        window.addEventListener('keyup', onKeyup);
        return () => window.removeEventListener('keyup', onKeyup);
    }
  }, []);

  return (
    <>
      <h1 className="text-2xl font-extrabold ml-4 mb-4">{name}</h1>
      <div className="flex">
        <div className="w-1/2 p-4">
          <div className="dropdown">
            <label tabIndex={0} className="btn btn-primary">
              Add DID Controller
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content menu p-2 shadow bg-primary text-primary-content rounded-box w-96"
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

          {/* START Embedded */}
          <label htmlFor="newVerificationMaterial" className="btn btn-primary" >
            Add Embedded Verification Method
          </label>
          <input
            type="checkbox"
            id="newVerificationMaterial"
            className="modal-toggle"
            checked={showNewEmbeddedMethodModal}
            onChange={() => {
              setShowNewEmbeddedMethodModal(!showNewEmbeddedMethodModal);
            }}
          />
          <div className="modal">
            {showNewEmbeddedMethodModal && (
              <div className="modal-box relative">
                <label
                  htmlFor="newVerificationMaterial"
                  className="btn btn-sm btn-circle absolute right-2 top-2"
                >
                  ✕
                </label>
                <NewEmbeddedMethod
                  htmlId="newVerificationMaterial"
                  didDocument={didDocument}
                  save={(vm: EmbeddedVM) =>
                    setDidDocument(
                      produce(didDocument, (draft) => {
                        draft.addVerificationMethod(vm);
                      })
                    )
                  }
                />
              </div>
            )}
          </div>
          {/* END Embedded */}

          {/* START Reference */}
          <label htmlFor="newReferenceVerificationMaterial" className="btn btn-primary" >
            Add Reference Verification Method
          </label>
          <input
            type="checkbox"
            id="newReferenceVerificationMaterial"
            className="modal-toggle"
            checked={showNewReferenceMethodModal}
            onChange={() => {
              setShowNewReferenceMethodModal(!showNewReferenceMethodModal);
            }}
          />
          <div className="modal">
            {showNewReferenceMethodModal && (
              <div className="modal-box relative">
                <label
                  htmlFor="newReferenceVerificationMaterial"
                  className="btn btn-sm btn-circle absolute right-2 top-2"
                >
                  ✕
                </label>
                <NewReferenceMethod
                  htmlId="newReferenceVerificationMaterial"
                  didDocument={didDocument}
                  save={(vm: ReferenceVM) =>
                    setDidDocument(
                      produce(didDocument, (draft) => {
                        draft.addVerificationMethod(vm);
                      })
                    )
                  }
                />
              </div>
            )}
          </div>
          {/* END Reference */}

          <div className="flex flex-col gap-y-4 mt-4">
            {didDocument.verificationMethods.map((vm, index) =>
              isEmbeddedVm(vm) ? (
                <div key={index}>
                  <SummarizeEmbeddedMethod
                    method={vm}
                    didDocument={didDocument}
                    index={index}
                  />
                  <div className="bg-base-200 px-8 pb-8 flex w-full justify-between">
                    <label
                      htmlFor={`embeddedVm${index}`}
                      className="btn btn-wide"
                    >
                      Edit
                    </label>
                    <input
                      type="checkbox"
                      id={`embeddedVm${index}`}
                      className="modal-toggle"
                      checked={showEditModal === `embeddedVm${index}`}
                      onChange={() => {
                        setShowEditModal(
                          showEditModal ? null : `embeddedVm${index}`
                        );
                      }}
                    />
                    <div className="modal">
                      {showEditModal && (
                        <div className="modal-box relative">
                          <label
                            htmlFor={`embeddedVm${index}`}
                            className="btn btn-sm btn-circle absolute right-2 top-2"
                          >
                            ✕
                          </label>
                          <EditEmbeddedMethod
                            htmlId={`embeddedVm${index}`}
                            method={vm}
                            didDocument={didDocument}
                            save={(vm: EmbeddedVM) => {
                              setDidDocument(
                                produce(didDocument, (draft) => {
                                  draft.verificationMethods[index] = vm;
                                })
                              );
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <button
                      className="btn btn-error btn-outline"
                      onClick={() => {
                        setDidDocument(
                          produce(didDocument, (draft) => {
                            draft.verificationMethods.splice(index, 1);
                          })
                        );
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div key={index}>
                  <SummarizeReferenceMethod
                    key={index}
                    method={vm}
                    didDocument={didDocument}
                    index={index}
                  />
                  <div className="bg-base-200 px-8 pb-8 flex w-full justify-between">
                    <label
                      htmlFor={`referenceVm${index}`}
                      className="btn btn-wide"
                    >
                      Edit
                    </label>
                    <input
                      type="checkbox"
                      id={`referenceVm${index}`}
                      className="modal-toggle"
                      checked={showEditModal === `referenceVm${index}`}
                      onChange={() => {
                        setShowEditModal(
                          showEditModal ? null : `referenceVm${index}`
                        );
                      }}
                    />
                    <div className="modal">
                      {showEditModal && (
                        <div className="modal-box relative">
                          <label
                            htmlFor={`referenceVm${index}`}
                            className="btn btn-sm btn-circle absolute right-2 top-2"
                          >
                            ✕
                          </label>
                          <EditReferenceMethod
                            htmlId={`referenceVm${index}`}
                            method={vm}
                            didDocument={didDocument}
                            save={(vm: ReferenceVM) => {
                              setDidDocument(
                                produce(didDocument, (draft) => {
                                  draft.verificationMethods[index] = vm;
                                })
                              );
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <button
                      className="btn btn-error btn-outline"
                      onClick={() => {
                        setDidDocument(
                          produce(didDocument, (draft) => {
                            draft.verificationMethods.splice(index, 1);
                          })
                        );
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
        <div className="w-1/2 p-4">
          <button
            className="btn btn-block btn-secondary mb-4"
            onClick={async () => Promise.resolve()}
            // disabled
          >
            Publish (coming soon)
          </button>
          {attemptSerialization(didDocument)}
        </div>
      </div>
    </>
  );
}
