import { Did } from "@/lib/did";
import { useState } from "react";
import DidInput from "./DidInput";
import Link from "next/link";
import AnnotatedHeader from "../attested-default-content/annotatedHeader";

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
    <div className="flex flex-col gap-y-8 text-base-content">
      <div>
        <AnnotatedHeader
          headerText="Edit DID Subject"
          headerSize="text-xl"
          body="The subject of a DID is, by definition, the entity identified by the
        DID. The DID subject might also be the DID controller. Anything can be
        the subject of a DID: person, group, organization, thing, or concept."
          externalDocsLink="https://w3c.github.io/did-core/#did-subject"
          externalDocsDesc="DID Subject documentation"
        />
      </div>
      <div className="flex flex-col gap-y-8 border-2 border-neutral text-base-content">
        <div className="font-mono text-neutral-content w-full text-center overflow-scroll whitespace-nowrap p-8 px-4">
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
          <p className="text-xs text-neutral-content/50 mt-4">
            The{" "}
            <Link
              className={"underline"}
              href={"https://w3c.github.io/did-core/#did-syntax"}
              passHref
              target={"_blank"}
            >
              DID Syntax
            </Link>{" "}
            consist of different parts, you can hover to discover these parts.
          </p>
        </div>
      </div>
      <DidInput
        value={existingSubject}
        callback={(e) => {
          setIsDidValid(e.valid);
          if (e.did) setDid(e.did);
        }}
      />
      <label
        htmlFor={htmlId}
        className={`btn btn-info btn-outline btn-block ${
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
