import useTranslation from "next-translate/useTranslation";
import Serialize from "@/components/vc/Serialize";
import {useState, useRef, useCallback, useEffect} from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import * as Monaco from "monaco-editor/esm/vs/editor/editor.api";
import * as jose from 'jose'
import {KeyLike} from "jose";
import {getBindingIdentifiers} from "@babel/types";
import keys = getBindingIdentifiers.keys;

interface RefObject extends Monaco.editor.ICodeEditor {
  _domElement?: HTMLElement;
}

const pem = `-----BEGIN PRIVATE KEY-----
MC4CAQAwBQYDK2VwBCIEIMJwhs6BDO1YWxvHjY9HttVjOpYPDvkIAeVkHBGVcO2p
-----END PRIVATE KEY-----
`

const defaultValue = JSON.stringify({
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://www.w3.org/2018/credentials/examples/v1"
  ],
  "id": "http://example.edu/credentials/3732",
  "type": ["VerifiableCredential", "UniversityDegreeCredential"],
  "issuer": "https://example.edu/issuers/565049",
  "issuanceDate": "2010-01-01T00:00:00Z",
  "credentialSubject": {
    "id": "did:example:ebfeb1f712ebc6f1c276e12ec21",
    "degree": {
      "type": "BachelorDegree",
      "name": "Bachelor of Science and Arts"
    }
  }
}, null, 2)

const prettifyJsonString = (jsonString: string): string => {
  try {
    return JSON.stringify(JSON.parse(jsonString), null, "\t");
  } catch (err) {
    return jsonString;
  }
};

export default function Issue({}) {
  const { t } = useTranslation("content");
  const [vc, setVc] = useState(defaultValue)
  const [key, setKey] = useState<KeyLike | null>(null)
  const editorRef = useRef<RefObject | null>(null);



  async function calcJwt() {
    if (key) {
      console.log('key', key)
      const jwt = await new jose.SignJWT({ 'test': true })
        .setProtectedHeader({ alg: 'ECDSA' })
        .sign(key)
      console.log('jwt', jwt)

      return jwt
    }
  }

  // async function initKey() {
  //     // const { publicKey, privateKey } = await jose.generateKeyPair('PS256', { extractable: true })
  //     const key = await jose.importPKCS8(pem)
  //
  //     setKey(ecPrivateKey)
  // }
  //
  // useEffect(() => {
  //   initKey()
  // }, []);
  //
  // useEffect(() => {
  //   calcJwt()
  // }, [vc]);

  const handleEditorUpdateValue = useCallback((value?: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.setValue(value || "");
    value && editor.getAction("editor.action.formatDocument").run();
  }, []);

  const handleEditorChange = useCallback(
    (value) => {
      setVc && setVc(value);
    },
    [setVc]
  );

  const updateEditorLayout = useCallback(() => {
    // Type BUG: editor.IDimension.width & editor.IDimension.height should be "number"
    // but it needs to have "auto" otherwise layout can't be updated;
    // eslint-disable-next-line
    const editor: any = editorRef.current;
    if (!editor) return;
    // Initialize layout's width and height
    editor.layout({
      width: "auto",
      height: "auto",
    });
    // eslint-disable-next-line
    const editorEl = editor._domElement;
    if (!editorEl) return;
    const { width, height } = editorEl.getBoundingClientRect();
    // update responsive width and height
    editor.layout({
      width,
      height,
    });
  }, []);

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;

    editor.getModel()?.updateOptions({ tabSize: 2, insertSpaces: false });
    updateEditorLayout();

    window.addEventListener("resize", () => {
      // automaticLayout isn't working
      // https://github.com/suren-atoyan/monaco-react/issues/89#issuecomment-666581193
      // clear current layout
      updateEditorLayout();
    });

    // need to use formatted prettify json string
    defaultValue && handleEditorUpdateValue(prettifyJsonString(defaultValue));
  };

  return (
    <>
      <h1 className="text-xl font-extrabold ml-4 mb-4">{t("vcDescription")}</h1>
      <div className="flex">
        <div className="w-1/2 p-4">
          <h2 className="text-lg font-extrabold mb-4">{t("vcBody")}</h2>
          <Editor
            language="json"
            defaultValue={vc}
            // path={path}
            height={400}
            options={{
              automaticLayout: true,
              autoClosingBrackets: "always",
              autoClosingQuotes: "always",
              formatOnPaste: true,
              formatOnType: true,
              scrollBeyondLastLine: false,
            }}
            onMount={handleEditorDidMount}
            onChange={setVc}
            // beforeMount={handleEditorWillMount}
            // onValidate={handleEditorValidation}
          />
        </div>
        <div className="w-1/2 p-4">
          <Serialize vc={vc} type={'jwt'}/>
        </div>
      </div>
    </>
  )
}