import { useState } from "react";
import AnnotatedHeader from "../attested-default-content/annotatedHeader";
import { URI, uriValidationExpr } from "@/types/dids";

const getAliasClasses = (
  alias: URI,
  existingAliases: URI[],
  onSuccess: string,
  onFail: string,
  onConflict?: string,
  onNull?: string
): string => {
  if (!alias) return onNull || "";
  if (!alias.match(uriValidationExpr)) return onFail;
  if (existingAliases.includes(alias)) return onConflict || onFail;
  return onSuccess;
};

export default function AlsoKnownAs({
  existingAliases,
  htmlId,
  save,
}: {
  existingAliases: URI[];
  htmlId: string;
  save: (aliases: URI[]) => void;
}): JSX.Element {
  const [alias, setAlias] = useState<URI>("");
  const [aliases, setAliases] = useState<URI[]>(existingAliases);
  return (
    <div className="flex flex-col gap-y-2 text-base-content">
      <div>
        <AnnotatedHeader
          headerText="Edit AlsoKnownAs"
          headerSize="text-xl"
          body='A DID subject can have multiple identifiers for different purposes, or at different times. Use the "alsoKnownAs" property to assert that two or more DIDs (or other types of URI) refer to the same DID subject.'
          externalDocsLink="https://www.w3.org/TR/did-core/#also-known-as"
          externalDocsDesc="AlsoKnownAs Documentation"
        />
      </div>
      <div className="flex flex-col text-base-content gap-y-8">
        <div>
          <div className="flex items-end gap-x-4">
            <div className="form-control w-full">
              <label className="label">
                <span
                  className={`label-text ${getAliasClasses(
                    alias,
                    aliases,
                    "text-success",
                    "text-error"
                  )}`}
                >
                  AlsoKnownAs
                </span>
                <span
                  className={`label-text-alt text-xs ${getAliasClasses(
                    alias,
                    aliases,
                    "text-success",
                    "text-error",
                    "",
                    "text-base-content/30"
                  )}`}
                >
                  {getAliasClasses(
                    alias,
                    aliases,
                    "Valid URI",
                    "Invalid URI",
                    "URI already exist",
                    "Required"
                  )}
                </span>
              </label>
              <input
                type="text"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder="https://alice.com"
                className={`input input-bordered w-full ${getAliasClasses(
                  alias,
                  aliases,
                  "input-success",
                  "input-error"
                )}`}
              />
            </div>
            <button
              disabled={getAliasClasses(alias, aliases, "t", "f") === "f"} // Meh
              className="btn"
              onClick={() => {
                setAliases([...aliases, alias]);
                setAlias("");
              }}
            >
              Add Alias
            </button>
          </div>
        </div>
        <div>
          <h3 className="mb-2">AlsoKnownAs:</h3>
          {!aliases.length && <p className="text-xs">No aliases added yet</p>}
          <ul className="divide-y divide-solid divide-neutral divide-opacity-25">
            {[...aliases].map((alias, i) => (
              <li key={i} className="font-mono text-xs py-2 truncate">
                <>
                  <button
                    className="btn btn-square btn-xs mr-4"
                    onClick={() =>
                      setAliases([...aliases].filter((s) => s !== alias))
                    }
                  >
                    X
                  </button>
                  <span className="text-base-content/50">Alias:</span>{" "}
                  <span className="">{alias}</span>
                </>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <label
        htmlFor={htmlId}
        className={`btn btn-info btn-outline btn-block mt-4`}
        onClick={() => {
          if (aliases.length) {
            save(aliases);
          } else {
            save([]);
          }
        }}
      >
        Save to Document
      </label>
    </div>
  );
}
