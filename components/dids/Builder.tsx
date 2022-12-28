"use client";

import { useState } from "react";
import { documentSchema } from "../../lib/didParser";
import { updateDidDocument as updateDidDocumentDAO } from "../../lib/dao";
import {
  DidDocument,
  didDocumentDeserializer,
  EmbeddedVM,
  isEmbeddedVm,
  ReferenceVM,
} from "../../lib/verificationMaterialBuilder";
import produce from "immer";
import { getCompleteDid } from "../../lib/did";
import Embedded from "./EmbeddedMethod";
import ReferenceMethod from "./ReferenceMethod";
import DisplayEmbeddedMaterial from "./DisplayEmbeddedMethod";
import DisplayReferenceMaterial from "./DisplayReferencedMethod";

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
      <div className="bg-zinc-700 p-4">DID Document</div>
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
  const [didDocument, setDidDocument] = useState<DidDocument>(
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

          {/* START Embedded */}
          <label htmlFor="newVerificationMaterial" className="btn">
            Add Embedded Verification Method
          </label>
          <input
            type="checkbox"
            id="newVerificationMaterial"
            className="modal-toggle"
          />
          <Embedded
            htmlId="newVerificationMaterial"
            didDocument={didDocument}
            save={(vm: EmbeddedVM) =>
              setDidDocument(
                produce(didDocument, (draft) => {
                  draft.addVerificationMaterial(vm);
                })
              )
            }
          />
          {/* END Embedded */}

          {/* START Refrence */}
          <label htmlFor="newReferenceMaterial" className="btn">
            Add Referenced Verification Method
          </label>
          <input
            type="checkbox"
            id="newReferenceMaterial"
            className="modal-toggle"
          />
          <ReferenceMethod
            htmlId="newReferenceMaterial"
            didDocument={didDocument}
            save={(vm: ReferenceVM) =>
              setDidDocument(
                produce(didDocument, (draft) => {
                  draft.addVerificationMaterial(vm);
                })
              )
            }
          />
          {/* END Reference */}

          <div className="flex flex-col gap-y-4 mt-4">
            {didDocument.verificationMethods.map((vm, index) =>
              isEmbeddedVm(vm) ? (
                <DisplayEmbeddedMaterial
                  key={index}
                  material={vm}
                  didDocument={didDocument}
                  index={index}
                  save={(vm: EmbeddedVM) => {
                    setDidDocument(
                      produce(didDocument, (draft) => {
                        draft.verificationMethods[index] = vm;
                      })
                    );
                  }}
                  remove={() => {
                    setDidDocument(
                      produce(didDocument, (draft) => {
                        draft.verificationMethods.splice(index, 1);
                      })
                    );
                  }}
                />
              ) : (
                <DisplayReferenceMaterial
                  key={index}
                  material={vm}
                  didDocument={didDocument}
                  index={index}
                  save={(vm: ReferenceVM) => {
                    setDidDocument(
                      produce(didDocument, (draft) => {
                        draft.verificationMethods[index] = vm;
                      })
                    );
                  }}
                  remove={() => {
                    setDidDocument(
                      produce(didDocument, (draft) => {
                        draft.verificationMethods.splice(index, 1);
                      })
                    );
                  }}
                />
              )
            )}
          </div>
        </div>
        <div className="w-1/2 p-4">
          <button
            className="btn btn-block btn-info mb-4"
            onClick={async () =>
              await updateDidDocumentDAO(id, didDocument.serialize())
            }
          >
            Publish
          </button>
          {attemptSerialization(didDocument)}
        </div>
      </div>
    </>
  );
}
