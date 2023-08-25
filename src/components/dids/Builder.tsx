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

import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { json } from "react-syntax-highlighter/dist/cjs/languages/hljs";
import { syntaxHighlightingTheme } from "@/utils/syntaxHighlightingTheme";
import EditServices from "@/components/dids/EditServices";
import { Service } from "@/types/dids";
import { usePlausible } from "next-plausible";

SyntaxHighlighter.registerLanguage("json", json);

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
    <div className="bg-base-300">
      <div className="text-base-content p-4 flex justify-between">
        <div>
          <h2 className="font-bold text-lg">DID Document</h2>
          <div className="flex gap-x-2">
            <h3 className="text-sm">Format</h3>
            <div className="btn-group">
              <button
                className={`btn btn-xs ${isJsonLd ? "btn-success" : ""}`}
                onClick={() => setIsJsonLd(!isJsonLd)}
              >
                JSON-LD
              </button>
              <button
                className={`btn btn-xs ${isJsonLd ? "" : "btn-success"}`}
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
        <div className="bg-base-300 px-4 md:pr-4">
          <div className="bg-base-200">
            <pre className="p-4 text-xs overflow-scroll">
              <SyntaxHighlighter
                language="json"
                style={syntaxHighlightingTheme}
              >
                {result}
              </SyntaxHighlighter>
            </pre>
          </div>
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

  type MyEvents = {
    editSubject: never;
    editSubjectSave: never;
    editController: never;
    editControllerSave: never;
    editServices: never;
    editServicesSave: never;
    importDocument: never;
    importDocumentSave: never;
    addEmbeddedMaterial: never;
    addEmbeddedMaterialSave: { curve: string; format: string };
    addReferencedMaterial: never;
    addReferencedMaterialSave: never;
  };

  const plausible = usePlausible<MyEvents>();

  const [didDocument, setDidDocument] = useState<DidDocument>(maybeDocument);
  const [showNewEmbeddedMethodModal, setShowNewEmbeddedMethodModal] =
    useState<boolean>(false);
  const [showNewReferenceMethodModal, setShowNewReferenceMethodModal] =
    useState<boolean>(false);
  const [showEditDidControllerModal, setShowEditDidControllerModal] =
    useState<boolean>(false);
  const [showEditDidSubjectModal, setShowEditDidSubjectModal] =
    useState<boolean>(false);
  const [showEditServices, setShowEditServicesModal] = useState<boolean>(false);
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
        setShowEditServicesModal(false);
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
    <div className="bg-base-300">
      <div className="flex gap-x-4 gap-4 px-4 pb-4 bg-base-300">
        <div>
          <label
            onClick={() => {
              setShowEditDidSubjectModal(true);
              plausible("editSubject");
            }}
            className="btn btn-outline btn-default"
          >
            Edit DID Subject
          </label>
        </div>
        <div>
          <label
            onClick={() => {
              setShowEditDidControllerModal(true);
              plausible("editController");
            }}
            className="btn btn-outline btn-default"
          >
            Edit DID Controller
          </label>
        </div>
        <div>
          <label
            onClick={() => {
              setShowEditServicesModal(true);
              plausible("editServices");
            }}
            className="btn btn-outline btn-default"
          >
            Edit Services
          </label>
        </div>
        <div className="ml-auto md:inline hidden">
          <label
            onClick={() => {
              setShowImportDocumentModal(true);
              plausible("importDocument");
            }}
            className="btn btn-default"
          >
            Import Document
          </label>
        </div>
      </div>
      <div className="flex gap-x-4 gap-4 px-4 pb-4 bg-base-300 md:hidden">
        <div>
          <button
            className="btn btn-outline btn-default"
            onClick={() => {
              setShowNewEmbeddedMethodModal(true);
              plausible("addEmbeddedMaterial");
            }}
          >
            Add Embedded Material
          </button>
        </div>
        <div>
          <button
            className="btn btn-outline btn-default"
            onClick={() => {
              setShowNewReferenceMethodModal(true);
              plausible("addReferencedMaterial");
            }}
          >
            Add Referenced Material
          </button>
        </div>
        <div className="ml-auto">
          <label
            onClick={() => {
              setShowImportDocumentModal(true);
              plausible("importDocument");
            }}
            className="btn btn-default"
          >
            Import Document
          </label>
        </div>
      </div>

      <div className="flex justify-between pl-4">
        <div className="w-1/3 bg-base-200 text-neutral-content p-0">
          <div className="flex flex-col p-4">
            {!didDocument.verificationMethod.length && (
              <div className="text-center py-4 text-sm opacity-50">
                No material associated with DID
              </div>
            )}
            {didDocument.verificationMethod.map(
              (vm, index) =>
                (isEmbeddedMaterial(vm) && (
                  <div key={index}>
                    <div className="md:py-4 flex flex-col-reverse md:flex-row w-full">
                      <div className="divider md:hidden m-2" />
                      <div className="flex flex-row md:flex-col justify-between m-2 md:mx-2 md:my-0">
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
                    <div className="md:py-4 flex flex-col-reverse md:flex-row w-full">
                      <div className="divider md:hidden m-2" />
                      <div className="flex flex-row md:flex-col justify-between m-2 md:mx-2 md:my-0">
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
              className="btn btn-outline text-neutral-content btn-default my-4 hidden md:block"
              onClick={() => {
                plausible("addEmbeddedMaterial");
                setShowNewEmbeddedMethodModal(true);
              }}
            >
              Add Embedded Material
            </button>
            <button
              className="btn btn-outline text-neutral-content btn-default hidden md:block"
              onClick={() => {
                plausible("addReferencedMaterial");
                setShowNewReferenceMethodModal(true);
              }}
            >
              Add Referenced Material
            </button>
          </div>
        </div>
        <div className="w-2/3">
          <AttemptSerialization didDocument={didDocument} />
        </div>
      </div>
      <Modal
        show={showEditDidSubjectModal}
        id={"editDidSubject"}
        className={"max-w-none lg:w-2/3"}
        onChange={() => {
          setShowEditDidSubjectModal(false);
        }}
      >
        <EditDidSubject
          htmlId="editDidSubject"
          existingSubject={didDocument.id}
          save={(did: string) => {
            setDidDocument(
              produce(didDocument, (draft) => {
                draft.setIdentifier(did);
              })
            );
            plausible("editSubjectSave");
          }}
        />
      </Modal>
      <Modal
        show={showEditDidControllerModal}
        id={"editDidController"}
        className={"max-w-none lg:w-2/3"}
        onChange={() => {
          setShowEditDidControllerModal(false);
        }}
      >
        <EditDidController
          htmlId="editDidController"
          existingControllers={didDocument.controller}
          subject={didDocument.id}
          save={(controller: DidController | null) => {
            setDidDocument(
              produce(didDocument, (draft) => {
                draft.setController(controller);
              })
            );
            plausible("editControllerSave");
          }}
        />
      </Modal>
      <Modal
        show={showEditServices}
        id={"editServices"}
        className={"max-w-none lg:w-2/3"}
        onChange={() => {
          setShowEditServicesModal(false);
        }}
      >
        <EditServices
          htmlId="editServices"
          existingServices={didDocument.services}
          save={(services: Service[]) => {
            setDidDocument(
              produce(didDocument, (draft) => {
                draft.setServices(services);
              })
            );
            plausible("editServicesSave");
          }}
        />
      </Modal>
      <Modal
        show={showNewEmbeddedMethodModal}
        id={"newVerificationMaterial"}
        onChange={() => {
          setShowNewEmbeddedMethodModal(false);
        }}
      >
        <NewEmbeddedMethod
          htmlId="newVerificationMaterial"
          didDocument={didDocument}
          save={(vm: EmbeddedMaterial) => {
            setDidDocument(
              produce(didDocument, (draft) => {
                draft.addVerificationMethod(vm);
              })
            );
            plausible("addEmbeddedMaterialSave", {
              props: {
                curve: vm.material.curve.name.display,
                format: vm.material.format,
              },
            });
          }}
        />
      </Modal>
      <Modal
        show={showNewReferenceMethodModal}
        id={"newReferenceVerificationMaterial"}
        onChange={() => {
          setShowNewReferenceMethodModal(false);
        }}
      >
        <NewReferenceMethod
          htmlId="newReferenceVerificationMaterial"
          didDocument={didDocument}
          save={(vm: ReferencedMaterial) => {
            setDidDocument(
              produce(didDocument, (draft) => {
                draft.addVerificationMethod(vm);
              })
            );
            plausible("addReferencedMaterialSave");
          }}
        />
      </Modal>
      <Modal
        className={"max-w-none lg:w-2/3"}
        show={showImportDocumentModal}
        id={"importDocument"}
        onChange={() => {
          setShowImportDocumentModal(false);
        }}
      >
        <ImportDocument
          htmlId="importDocument"
          save={(document: DidDocument) => {
            setDidDocument(document);
            plausible("importDocumentSave");
          }}
        />
      </Modal>
    </div>
  );
}
