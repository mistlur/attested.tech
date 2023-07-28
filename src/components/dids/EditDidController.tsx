import { DidController } from "@/lib/DidDocument";
import { useState } from "react";
import DidInput from "./DidInput";
import Link from "next/link";
import { InformationCircleIcon } from "@heroicons/react/outline";

export default function EditDidController({
  existingControllers,
  subject,
  htmlId,
  save,
}: {
  existingControllers: DidController;
  subject: string;
  htmlId: string;
  save: (controller: DidController) => void;
}): JSX.Element {
  const [newDid, setNewDid] = useState<string>("");
  const [controllers, setControllers] =
    useState<DidController>(existingControllers);
  const [isSubject, setIsSubject] = useState<boolean>(controllers.has(subject));
  const [isNewDidValid, setIsNewDidValid] = useState<boolean>(false);
  return (
    <div>
      <div className="mb-8">
        <h3 className="text-xl font-bold">
          Edit DID Controller{" "}
          <div
            className="tooltip tooltip-bottom z-50"
            data-tip="A DID Controller is an entity that has the capability to make
            changes to a DID document. A DID might have more than one DID
            controller. The DID controller(s) can be denoted by the optional
            controller property at the top level DID document. Note that a DID
            controller might be the DID subject."
          >
            <InformationCircleIcon className="h-6 w-6 text-info inline" />
          </div>
          <Link
            className={"underline text-xs mx-2"}
            href={"https://w3c.github.io/did-core/#did-controller"}
            passHref
            target={"_blank"}
          >
            See documentation
          </Link>
        </h3>
      </div>
      <div className="flex flex-col text-base-content">
        <div>
          <div className={`${isSubject ? "opacity-25" : ""}`}>
            <div className="flex items-end gap-x-4">
              <DidInput
                value={""}
                callback={(e) => {
                  setIsNewDidValid(e.valid);
                  if (e.did) setNewDid(e.did.serialize());
                }}
              />
              <button
                disabled={!isNewDidValid}
                className="btn"
                onClick={() => {
                  //@ts-ignore
                  setControllers(new Set([...controllers, newDid]));
                  setNewDid("");
                }}
              >
                Add Controller
              </button>
            </div>
            <ul className="my-4 divide-y divide-solid divide-neutral divide-opacity-25">
              {
                //@ts-ignore
                !controllers.has(subject) &&
                  [...controllers].map((controller, i) => (
                    <li key={i} className="font-mono text-xs py-2 truncate">
                      <button
                        className="btn btn-square btn-xs mr-4"
                        onClick={
                          //@ts-ignore
                          () =>
                            setControllers(
                              new Set(
                                [...controllers].filter((c) => c !== controller)
                              )
                            )
                        }
                      >
                        X
                      </button>
                      {controller}
                    </li>
                  ))
              }
            </ul>
          </div>
        </div>
        <div className="divider">OR</div>
        <label className="label cursor-pointer justify-start gap-x-4">
          <span className="label-text">
            Use the DID Subject as DID controller
          </span>
          <input
            type="checkbox"
            className="toggle"
            checked={isSubject}
            onChange={() => {
              if (isSubject) {
                const updatedControllers = new Set([...controllers]);
                updatedControllers.delete(subject);
                setControllers(updatedControllers);
                setIsSubject(false);
              } else {
                setIsSubject(true);
              }
            }}
          />
        </label>
        <label
          htmlFor={htmlId}
          className={`btn btn-info btn-outline btn-block mt-4`}
          onClick={() => {
            if (isSubject) {
              save(new Set([subject]));
            } else if (controllers.size > 0) {
              save(controllers);
            } else {
              save(new Set([]));
            }
          }}
        >
          Save to Document
        </label>
      </div>
    </div>
  );
}
