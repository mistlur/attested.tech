import { ec as EC } from "elliptic";
import { useState } from "react";
import { publicKeyJwkSchema } from "../../lib/didParser";
import {
  DidDocument,
  EmbeddedMaterial,
  EmbeddedVM,
  EmbeddedUsage,
  verificationRelationships,
  deriveIdentificationFragment,
  exportPrivateKey,
  decodeP256Jwk,
} from "../../lib/verificationMaterialBuilder";

export default function Embedded({
  htmlId,
  material,
  didDocument,
  save,
}: {
  htmlId: string;
  material?: EmbeddedVM;
  didDocument: DidDocument;
  save: (vm: EmbeddedVM) => void;
}): JSX.Element {
  const initialMethods = material ? material.usage : {};
  const [id, setId] = useState<string>(material?.id || "");
  const [controller, setController] = useState<string | undefined>(
    material ? material.controller : didDocument.id
  );

  const [privateKey, setPrivateKey] = useState<string | undefined>();

  const [keyMaterial, setKeyMaterial] = useState<Uint8Array | undefined>(
    material ? material.keyMaterial : undefined
  );

  const [format, setFormat] = useState<EmbeddedMaterial>(
    material ? material.format : "JsonWebKey2020"
  );

  const [methods, setMethods] = useState<EmbeddedUsage>(initialMethods);

  return (
    <div className="modal">
      <div className="modal-box relative">
        <label
          htmlFor={htmlId}
          className="btn btn-sm btn-circle absolute right-2 top-2"
        >
          ✕
        </label>
        <h3 className="text-lg font-bold">
          {material ? "Edit Material" : "Add Verification Method"}
        </h3>

        {privateKey ? (
          <div>
            <textarea
              className="textarea textarea-ghost w-full h-36 bg-base-200 font-mono text-xs"
              value={privateKey}
              readOnly
            />
          </div>
        ) : (
          <div>
            <textarea
              className="textarea w-full h-36 font-mono text-xs"
              placeholder={`{\n  "crv": "P-256",\n  "kty": "EC",\n  "x": "UdxQ_c44q5-W6ro8-qoPz1RNXKiZiafcF-4DUZ3lne4",\n  "y": "Dp0wHEr4YWPymU1e17UOL7WSZbYStsWP-VspiiG-Bqc"\n}`}
              onChange={(e) => {
                try {
                  const parsedJson = JSON.parse(e.target.value);
                  const parsedSchema = publicKeyJwkSchema.parse(parsedJson);
                  const decoded = decodeP256Jwk(parsedSchema);
                  setKeyMaterial(decoded);
                } catch (e) {}
              }}
            />
          </div>
        )}
        <button
          className="btn btn-block"
          onClick={() => {
            const ec = new EC("p256");
            const keypair = ec.genKeyPair();
            setPrivateKey(JSON.stringify(exportPrivateKey(keypair), null, 2));
            setKeyMaterial(
              new Uint8Array(keypair.getPublic().encode("array", false))
            );
          }}
        >
          Generate key
        </button>
        <div className="flex flex-col gap-y-8">
          <div>
            <div>
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Id</span>
                  {!id ? (
                    <span className="label-text-alt text-xs text-error">
                      This must be a valid DID URL
                    </span>
                  ) : (
                    <span className="label-text-alt text-xs">
                      Leave blank to generate the Id
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="did:web:..."
                  className={`input input-bordered w-full ${
                    !id ? "input-error" : ""
                  }`}
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Controller</span>
                </label>
                <input
                  type="text"
                  value={controller}
                  onChange={(e) => setController(e.target.value)}
                  placeholder="did:web:..."
                  className="input input-bordered w-full"
                />
              </div>
            </div>
          </div>

          <div>
            <span className="opacity-50">Format</span>
            <div className="flex w-full">
              <div className="btn-group w-full">
                <button
                  className={`btn w-1/2 ${
                    format === "JsonWebKey2020" ? "btn-active " : ""
                  }`}
                  onClick={() => {
                    setFormat("JsonWebKey2020");
                  }}
                >
                  JWK
                </button>
                <button
                  className={`btn w-1/2 ${
                    format === "Multibase" ? "btn-active" : ""
                  }`}
                  onClick={() => {
                    setFormat("Multibase");
                  }}
                >
                  Multibase
                </button>
              </div>
            </div>
          </div>

          <div>
            <span className="opacity-50">Use in</span>
            <div className="form-control">
              {verificationRelationships.map((method, indexMethod) => {
                return (
                  <div
                    key={indexMethod}
                    className="flex justify-between w-full"
                  >
                    <div>
                      <span>{method}</span>
                      <span className="opacity-50"> as</span>
                    </div>
                    <div className="btn-group">
                      <button
                        className={`btn btn-xs ${
                          methods[method] === "Embedded" ? "btn-accent" : ""
                        }`}
                        onClick={() => {
                          setMethods({
                            ...methods,
                            [method]: "Embedded",
                          });
                        }}
                      >
                        Embedded
                      </button>

                      <button
                        className={`btn btn-xs ${
                          methods[method] === "Reference" ? "btn-secondary" : ""
                        }`}
                        onClick={() => {
                          setMethods({
                            ...methods,
                            [method]: "Reference",
                          });
                        }}
                      >
                        Reference
                      </button>

                      <button
                        className={`btn btn-xs ${
                          !methods[method] ? "btn-active" : ""
                        }`}
                        onClick={() => {
                          const { [method]: remove, ...keep } = methods;
                          setMethods(keep);
                        }}
                      >
                        Unused
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <label
          htmlFor={htmlId}
          className="btn btn-info btn-outline btn-block mt-4"
          onClick={async () => {
            const km = keyMaterial
              ? keyMaterial
              : (await didDocument.newVerificationMaterial()).keyMaterial;
            const newVerificationMethod: EmbeddedVM = {
              id: id
                ? id
                : `${didDocument.id}#${deriveIdentificationFragment(
                    format,
                    km
                  )}`,
              format,
              curve: "P-256",
              controller,
              usage: methods,
              keyMaterial: km,
            };
            save(newVerificationMethod);
            setPrivateKey(undefined);
            setKeyMaterial(undefined);
          }}
        >
          {material ? "Save" : "Add"}
        </label>
      </div>
    </div>
  );
}
