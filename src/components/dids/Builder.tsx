"use client";

import { useCallback, useEffect, useState } from "react";
import FeatherIcon from "feather-icons-react";
import { documentSchema } from "../../lib/didParser";
import { didDocumentDeserializer } from "../../lib/verificationMaterialBuilder";
import produce from "immer";
import NewEmbeddedMethod from "./Embedded/NewMethod";
import SummarizeEmbeddedMethod from "./Embedded/Summarize";
import EditEmbeddedMethod from "./Embedded/EditMethod";
import NewReferenceMethod from "./Referenced/NewMethod";
import SummarizeReferenceMethod from "./Referenced/Summarize";
import EditReferenceMethod from "./Referenced/EditMethod";
import { DidController, DidDocument } from "@/lib/DidDocument";
import {
  EmbeddedMaterial,
  isEmbeddedMaterial,
  isReferencedMaterial,
  ReferencedMaterial,
} from "@/lib/DidMaterial";
import EditDidController from "./EditDidController";
import EditDidSubject from "./EditDidSubject";
import ImportDocument from "./ImportDocument";
import Modal from "@/components/core/Modal";
import Infobox from "../attested-default-content/infobox";

function AttemptSerialization({ didDocument }: { didDocument: DidDocument }) {
  const [isJsonLd, setIsJsonLd] = useState<boolean>(true);
  let result: string;
  let validDocument: boolean;
  try {
    result = JSON.stringify(
      didDocument.serialize(isJsonLd ? "JSONLD" : "JSON"),
      null,
      2
    );
    documentSchema.parse(didDocument.serialize(isJsonLd ? "JSONLD" : "JSON"));
    validDocument = true;
  } catch (e) {
    // @ts-ignore
    result = e.toString();
    validDocument = false;
  }

  return (
    <div>
      <div className="bg-base-300 text-base-content p-4 flex justify-between">
        <div>
          <h2 className="font-bold text-lg">DID Document</h2>
          <div className="flex gap-x-2">
            <h3 className="text-sm">Format</h3>
            <div className="btn-group">
              <button
                className={`btn btn-xs ${isJsonLd ? "btn-active" : ""}`}
                onClick={() => setIsJsonLd(!isJsonLd)}
              >
                JSON-LD
              </button>
              <button
                className={`btn btn-xs ${isJsonLd ? "" : "btn-active"}`}
                onClick={() => setIsJsonLd(!isJsonLd)}
              >
                JSON
              </button>
            </div>
          </div>
        </div>
        <div>
          <button
            className="btn btn-square btn-sm"
            onClick={() => {
              navigator.clipboard.writeText(result);
            }}
          >
            <svg
              className="w-5 h-5 fill-current"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 32 32"
            >
              <path d="M 16 3 C 14.742188 3 13.847656 3.890625 13.40625 5 L 6 5 L 6 28 L 26 28 L 26 5 L 18.59375 5 C 18.152344 3.890625 17.257813 3 16 3 Z M 16 5 C 16.554688 5 17 5.445313 17 6 L 17 7 L 20 7 L 20 9 L 12 9 L 12 7 L 15 7 L 15 6 C 15 5.445313 15.445313 5 16 5 Z M 8 7 L 10 7 L 10 11 L 22 11 L 22 7 L 24 7 L 24 26 L 8 26 Z"></path>
            </svg>
          </button>
        </div>
      </div>
      {!validDocument && (
        <div className="bg-error text-error-content p-4 text-xs overflow-scroll">
          <h3 className="font-bold">
            Error parsing or generating the DID Document.
          </h3>
          Details:
          <pre className="bg-neutral text-neutral-content p-4">{result}</pre>
        </div>
      )}
      {validDocument && (
        <div className="bg-base-200">
          <pre className="p-4 text-xs overflow-scroll">{result}</pre>
        </div>
      )}
    </div>
  );
}

export default function DidBuilder({
  id,
  name,
  document,
}: {
  id: string;
  name: string;
  document: Record<string, any>;
}) {
  let maybeDocument: DidDocument;
  try {
    maybeDocument = didDocumentDeserializer(documentSchema.parse(document));
  } catch (e) {
    maybeDocument = new DidDocument(id, new Set([id]), []);
  }

  const [didDocument, setDidDocument] = useState<DidDocument>(maybeDocument);
  const [showNewEmbeddedMethodModal, setShowNewEmbeddedMethodModal] =
    useState<boolean>(false);
  const [showNewReferenceMethodModal, setShowNewReferenceMethodModal] =
    useState<boolean>(false);
  const [showEditDidControllerModal, setShowEditDidControllerModal] =
    useState<boolean>(false);
  const [showEditDidSubjectModal, setShowEditDidSubjectModal] =
    useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<string | null>(null);
  const [showImportDocumentModal, setShowImportDocumentModal] =
    useState<boolean>(false);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setShowNewEmbeddedMethodModal(false);
        setShowNewReferenceMethodModal(false);
        setShowEditDidControllerModal(false);
        setShowEditDidSubjectModal(false);
        setShowImportDocumentModal(false);
      }
    };
    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const onKeyup = useCallback(
    (event) => {
      if (event.key === "Escape") {
        setShowNewEmbeddedMethodModal(false);
        setShowNewReferenceMethodModal(false);
        setShowEditModal(null);
      }
    },
    [showNewEmbeddedMethodModal, showNewReferenceMethodModal, showEditModal]
  );

  useEffect(() => {
    if (window) {
      window.addEventListener("keyup", onKeyup);
      return () => window.removeEventListener("keyup", onKeyup);
    }
  }, []);

  return (
    <>
      <div className="flex gap-x-4 gap-4 p-4 bg-base-200">
        {/* START DID Subject */}
        <div>
          <label htmlFor="editDidSubject" className="btn btn-ghost btn-sm">
            Edit DID Subject
          </label>
        </div>
        <Modal
          show={showEditDidSubjectModal}
          id={"editDidSubject"}
          className={"max-w-none w-1/2"}
          onChange={() => {
            setShowEditDidSubjectModal(!showEditDidSubjectModal);
          }}
        >
          <EditDidSubject
            htmlId="editDidSubject"
            existingSubject={didDocument.id}
            save={(did: string) =>
              setDidDocument(
                produce(didDocument, (draft) => {
                  draft.setIdentifier(did);
                })
              )
            }
          />
        </Modal>
        {/* END DID Subject*/}
        {/* START DID Controller */}
        <div>
          <label htmlFor="editDidController" className="btn btn-ghost btn-sm">
            Edit DID Controller
          </label>
        </div>
        <Modal
          show={showEditDidControllerModal}
          id={"editDidController"}
          className={"max-w-none w-1/2"}
          onChange={() => {
            setShowEditDidControllerModal(!showEditDidControllerModal);
          }}
        >
          <EditDidController
            htmlId="editDidController"
            existingControllers={didDocument.controller}
            subject={didDocument.id}
            save={(controller: DidController | null) =>
              setDidDocument(
                produce(didDocument, (draft) => {
                  draft.setController(controller);
                })
              )
            }
          />
        </Modal>
        {/* END DID Controller */}

        {/* START Embedded */}
        <Modal
          show={showNewEmbeddedMethodModal}
          id={"newVerificationMaterial"}
          onChange={() => {
            setShowNewEmbeddedMethodModal(!showNewEmbeddedMethodModal);
          }}
        >
          <NewEmbeddedMethod
            htmlId="newVerificationMaterial"
            didDocument={didDocument}
            save={(vm: EmbeddedMaterial) =>
              setDidDocument(
                produce(didDocument, (draft) => {
                  draft.addVerificationMethod(vm);
                })
              )
            }
          />
        </Modal>
        {/* END Embedded */}

        {/* START Reference */}
        <Modal
          show={showNewReferenceMethodModal}
          id={"newReferenceVerificationMaterial"}
          onChange={() => {
            setShowNewReferenceMethodModal(!showNewReferenceMethodModal);
          }}
        >
          <NewReferenceMethod
            htmlId="newReferenceVerificationMaterial"
            didDocument={didDocument}
            save={(vm: ReferencedMaterial) =>
              setDidDocument(
                produce(didDocument, (draft) => {
                  draft.addVerificationMethod(vm);
                })
              )
            }
          />
        </Modal>
        {/* END Reference */}
        {/* START Import Document */}
        <div className="ml-auto">
          <label htmlFor="importDocument" className="btn btn-sm">
            Import Document
          </label>
        </div>
        <Modal
          show={showImportDocumentModal}
          id={"importDocument"}
          onChange={() => {
            setShowImportDocumentModal(!showImportDocumentModal);
          }}
        >
          <ImportDocument
            htmlId="importDocument"
            save={(document: DidDocument) => setDidDocument(document)}
          />
        </Modal>
        {/* END Import Document*/}
      </div>

      <div className="flex justify-between mb-8">
        <div className="w-1/3 bg-neutral text-neutral-content shadow-[inset_-147px_0px_180px_-180px_rgba(0,0,0,1)]">
          <div className="flex flex-col">
            {!didDocument.verificationMethod.length && (
              <div className="text-center py-4 text-sm opacity-50">
                No material associated with DID
              </div>
            )}
            {didDocument.verificationMethod.map(
              (vm, index) =>
                (isEmbeddedMaterial(vm) && (
                  <div key={index}>
                    <div className="py-4 flex w-full">
                      <div className="flex flex-col justify-between mx-2">
                        <label
                          htmlFor={`embeddedVm${index}`}
                          className="btn btn-ghost btn-xs opacity-50 text-success"
                        >
                          <FeatherIcon icon="edit" size="18" />
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
                                save={(vm: EmbeddedMaterial) => {
                                  setDidDocument(
                                    produce(didDocument, (draft) => {
                                      draft.verificationMethod[index] = vm;
                                    })
                                  );
                                }}
                              />
                            </div>
                          )}
                        </div>
                        <button
                          className="btn btn-ghost btn-xs opacity-50 text-error"
                          onClick={() => {
                            setDidDocument(
                              produce(didDocument, (draft) => {
                                draft.verificationMethod.splice(index, 1);
                              })
                            );
                          }}
                        >
                          <FeatherIcon icon="trash" size="18" />
                        </button>
                      </div>
                      <SummarizeEmbeddedMethod method={vm} index={index} />
                    </div>
                  </div>
                )) ||
                (isReferencedMaterial(vm) && (
                  <div key={index}>
                    <div className="py-4 flex w-full">
                      <div className="flex flex-col justify-between mx-2">
                        <label
                          htmlFor={`referenceVm${index}`}
                          className="btn btn-ghost btn-xs opacity-50 text-success"
                        >
                          <FeatherIcon icon="edit" size="18" />
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
                                save={(vm: ReferencedMaterial) => {
                                  setDidDocument(
                                    produce(didDocument, (draft) => {
                                      draft.verificationMethod[index] = vm;
                                    })
                                  );
                                }}
                              />
                            </div>
                          )}
                        </div>
                        <button
                          className="btn btn-ghost btn-xs opacity-50 text-error"
                          onClick={() => {
                            setDidDocument(
                              produce(didDocument, (draft) => {
                                draft.verificationMethod.splice(index, 1);
                              })
                            );
                          }}
                        >
                          <FeatherIcon icon="trash" size="18" />
                        </button>
                      </div>
                      <SummarizeReferenceMethod
                        method={vm}
                        didDocument={didDocument}
                        index={index}
                      />
                    </div>
                  </div>
                ))
            )}
            <button
              className="btn btn-outline text-neutral-content btn-default m-4"
              onClick={() =>
                setShowNewEmbeddedMethodModal(!showNewEmbeddedMethodModal)
              }
            >
              Add Embedded Material
            </button>
            <button
              className="btn btn-outline text-neutral-content btn-default mx-4 mb-8"
              onClick={() =>
                setShowNewReferenceMethodModal(!showNewEmbeddedMethodModal)
              }
            >
              Add Referenced Material
            </button>
          </div>
        </div>
        <div className="w-2/3">
          <AttemptSerialization didDocument={didDocument} />
        </div>
      </div>
    </>
  );
}
