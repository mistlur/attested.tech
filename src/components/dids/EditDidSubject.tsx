import { DidController } from "@/lib/DidDocument";
import { Did } from "@/lib/did";
import { useState } from "react";

export default function EditDidSubject(
  {
    existingSubject,
    htmlId,
    save,
  }: {
    existingSubject: string,
    htmlId: string;
    save: (did: string) => void;
  }
): JSX.Element {
  const [did, setDid] = useState<Did>(new Did(existingSubject));
  const [didCandidate, setDidCandidate] = useState<string>(did.serialize())
  const [isDidValid, setIsDidValid] = useState<boolean>(Did.validate(didCandidate))

  return (
    <div>
      <h3 className="text-lg font-bold">Edit DID Subject</h3>
      <div className="flex flex-col gap-y-8 text-base-content">
        <div>
          <div className="flex items-end gap-x-4">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text text-error">{!isDidValid ? "Invalid DID" : " "}</span>
              </label>
              <input
                type="text"
                value={didCandidate}
                onChange={(e) => {
                  const isValid = Did.validate(e.target.value)
                  setIsDidValid(isValid)
                  if (isValid) {
                    setDid(new Did(e.target.value))
                  }
                  setDidCandidate(e.target.value)
                }}
                placeholder="did:web:..."
                className={`input input-bordered w-full ${isDidValid ? "" : "input-error"}`}
              />
            </div>
          </div>
        </div>
        <div className="font-mono w-full text-center overflow-scroll whitespace-nowrap py-8 px-4">
          <span className="opacity-40">did</span>
          {did.method && <div className="tooltip" data-tip="Method"><span className="text-info hover:bg-info hover:text-info-content">:{did.method}</span></div>}
          {did.identifier && <div className="tooltip" data-tip="Identifier"><span className="text-success hover:bg-success hover:text-success-content">:{did.identifier}</span></div>}
          {did.path && <div className="tooltip" data-tip="Path"><span className="opacity-80 hover:bg-neutral hover:text-neutral-content">/{did.path}</span></div>}
          {did.query && <div className="tooltip" data-tip="Query"><span className="opacity-50 hover:bg-neutral hover:text-neutral-content">?{did.query}</span></div>}
          {did.fragment && <div className="tooltip" data-tip="Fragment"><span className="opacity-75 hover:bg-neutral hover:text-neutral-content">#{did.fragment}</span></div>}
        </div>
      </div>
      <label
        htmlFor={htmlId}
        className={`btn btn-info btn-outline btn-block mt-4 ${isDidValid ? "" : "btn-disabled"}`}
        onClick={() => {
          save(did.serialize())
        }}
      >
        Save to Document
      </label>
    </div>
  )
}
