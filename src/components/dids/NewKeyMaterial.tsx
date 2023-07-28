import { DidDocument } from "@/lib/DidDocument";
import { EmbeddedMaterial } from "@/lib/DidMaterial";
import { decodeJwk, generateKeyPair } from "@/lib/keys";
import { useState } from "react";
import { publicKeyJwkSchema } from "../../lib/didParser";
import { SupportedCurves } from "@/types/dids";

export default function NewKeyMaterial({
  didDocument,
  setMethod,
}: {
  didDocument: DidDocument;
  setMethod: (km: EmbeddedMaterial) => void;
}): JSX.Element {
  const [curve, setCurve] = useState<SupportedCurves>("Ed25519");
  const [isGeneratedKey, setIsGeneratedKey] = useState<boolean>(true);
  const [importedKeyValidationStatus, setImportedKeyValidationStatus] =
    useState<string | undefined>(undefined);
  const [privateKey, setPrivateKey] = useState<string>("");
  const [keyMaterial, setKeyMaterial] = useState<Uint8Array | undefined>(
    undefined
  );

  function completeSetup() {
    if (!keyMaterial) throw Error("KeyMaterial is undefined");
    const format = "JsonWebKey2020";
    const method: EmbeddedMaterial = new EmbeddedMaterial(undefined, {
      controller: didDocument.id,
      format,
      curve,
      usage: {},
      keyMaterial,
    });
    setMethod(method);
  }

  return (
    <div className="mb-8">
      <div className="btn-group w-full mb-4">
        <button
          className={`btn w-1/2 ${isGeneratedKey ? "btn-active" : ""}`}
          onClick={() => {
            setIsGeneratedKey(true);
          }}
        >
          Generate new key
        </button>
        <button
          className={`btn w-1/2 ${!isGeneratedKey ? "btn-active" : ""}`}
          onClick={() => {
            setIsGeneratedKey(false);
          }}
        >
          Import key
        </button>
      </div>
      {isGeneratedKey ? (
        <div>
          <div>
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Ed25519</span>
                <input
                  type="radio"
                  name="radio-10"
                  className="radio checked:bg-red-500"
                  onClick={() => setCurve("Ed25519")}
                  checked={curve === "Ed25519"}
                />
              </label>
            </div>
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">P-256</span>
                <input
                  type="radio"
                  name="radio-10"
                  className="radio checked:bg-blue-500"
                  onClick={() => setCurve("P-256")}
                  checked={curve === "P-256"}
                />
              </label>
            </div>
          </div>
          <button
            className="btn btn-block mb-4 mt-8"
            onClick={() => {
              const keyPair = generateKeyPair(curve);
              const privateKey = JSON.stringify(keyPair.privateKey, null, 2);
              setPrivateKey(privateKey);
              setKeyMaterial(keyPair.publicKey);
            }}
          >
            {privateKey === "" ? "Generate new key" : "Regenerate key"}
          </button>
          <div className={`${privateKey === "" ? "hidden" : ""}`}>
            <div className="w-full bg-base-300 font-mono text-xs flex justify-between">
              <pre className="p-4">{privateKey}</pre>
              <div
                onClick={() => {
                  navigator.clipboard.writeText(privateKey);
                }}
              >
                <button className="btn btn-square btn-sm m-2">
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
            <div className="p-2 font-bold text-xs bg-warning text-warning-content w-full">
              Save this key. You will not be able to retrieve it later
            </div>
          </div>
        </div>
      ) : (
        <div className="form-control">
          <label className="label">
            <span className="label-text">
              Import a JWK formatted Public Key.
              <br /> Supported curves: Ed25519 and P-256.
            </span>
            <span
              className={`label-text-alt ${
                importedKeyValidationStatus === "Valid" ? "text-success" : ""
              } ${
                importedKeyValidationStatus &&
                importedKeyValidationStatus !== "Valid"
                  ? "text-error"
                  : ""
              }`}
            >
              {importedKeyValidationStatus}
            </span>
          </label>
          <textarea
            className={`textarea bg-base-300 textarea-bordered w-full h-36 font-mono text-xs ${
              importedKeyValidationStatus === "Valid" ? "textarea-success" : ""
            } ${
              importedKeyValidationStatus &&
              importedKeyValidationStatus !== "Valid"
                ? "textarea-error"
                : ""
            }`}
            onChange={(e) => {
              if (e.target.value === "") {
                setImportedKeyValidationStatus(undefined);
                return;
              }
              try {
                const parsedJson = JSON.parse(e.target.value);
                const parsedSchema = publicKeyJwkSchema.parse(parsedJson);
                const decoded = decodeJwk(parsedSchema);
                setImportedKeyValidationStatus("Valid");
                setKeyMaterial(decoded);
                setCurve(parsedSchema.crv === "P-256" ? "P-256" : "Ed25519");
              } catch (e) {
                setImportedKeyValidationStatus("Invalid key or key format");
              }
            }}
          />
        </div>
      )}
      <button
        className={`btn btn-block mt-4 btn-success ${
          !keyMaterial ? "btn-disabled" : ""
        }`}
        onClick={() => {
          completeSetup();
        }}
      >
        Done, configure method
      </button>
    </div>
  );
}
