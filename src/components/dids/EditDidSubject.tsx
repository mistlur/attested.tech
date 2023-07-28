import { Did } from "@/lib/did";
import { useState } from "react";
import DidInput from "./DidInput";
import Link from "next/link";
import { InformationCircleIcon } from "@heroicons/react/outline";

export default function EditDidSubject({
  existingSubject,
  htmlId,
  save,
}: {
  existingSubject: string;
  htmlId: string;
  save: (did: string) => void;
}): JSX.Element {
  let maybeDid: Did;
  try {
    maybeDid = new Did(existingSubject);
  } catch (e) {
    maybeDid = new Did("did:example:1234");
  }
  const [did, setDid] = useState<Did>(maybeDid);
  const [isDidValid, setIsDidValid] = useState<boolean>(
    Did.validate(existingSubject)
  );

  return (
    <div>
      <div className="mb-8">
        <h3 className="text-xl font-bold">
          Edit DID Subject{" "}
          <div
            className="tooltip tooltip-bottom z-50"
            data-tip="The subject of a DID is, by definition, the entity identified by the DID. The DID subject might also be the DID controller. Anything can be the subject of a DID: person, group, organization, thing, or concept."
          >
            <InformationCircleIcon className="h-6 w-6 text-info inline" />
          </div>
          <Link
            className={"underline text-xs mx-2"}
            href={"https://w3c.github.io/did-core/#did-subject"}
            passHref
            target={"_blank"}
          >
            See documentation
          </Link>
        </h3>
      </div>
      <div className="flex flex-col gap-y-8 text-base-content">
        <div className="font-mono bg-neutral text-neutral-content w-full text-center overflow-scroll whitespace-nowrap p-8 px-4">
          <span className="opacity-40">did</span>
          {did.method && (
            <div className="tooltip" data-tip="Method">
              <span className="text-info hover:bg-info hover:text-info-content">
                :{did.method}
              </span>
            </div>
          )}
          {did.identifier && (
            <div className="tooltip" data-tip="Identifier">
              <span className="text-success hover:bg-success hover:text-success-content">
                :{did.identifier}
              </span>
            </div>
          )}
          {did.path && (
            <div className="tooltip" data-tip="Path">
              <span className="opacity-80 hover:bg-neutral hover:text-neutral-content">
                /{did.path}
              </span>
            </div>
          )}
          {did.query && (
            <div className="tooltip" data-tip="Query">
              <span className="opacity-50 hover:bg-neutral hover:text-neutral-content">
                ?{did.query}
              </span>
            </div>
          )}
          {did.fragment && (
            <div className="tooltip" data-tip="Fragment">
              <span className="opacity-75 hover:bg-neutral hover:text-neutral-content">
                #{did.fragment}
              </span>
            </div>
          )}
        </div>
        <DidInput
          value={existingSubject}
          callback={(e) => {
            setIsDidValid(e.valid);
            if (e.did) setDid(e.did);
          }}
        />
      </div>
      <label
        htmlFor={htmlId}
        className={`btn btn-info btn-outline btn-block mt-4 ${
          isDidValid ? "" : "btn-disabled"
        }`}
        onClick={() => {
          save(did.serialize());
        }}
      >
        Save to Document
      </label>
    </div>
  );
}
