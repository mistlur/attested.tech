import DidBuilder from "@/components/dids/Builder";
import { getInitialDidDocument } from "@/lib/did";
import ContentMeta from "@/components/content-pages/content-meta";
import useTranslation from "next-translate/useTranslation";
import { v4 as uuidv4 } from "uuid";
import { useEffect, useState } from "react";

const DidDocument = () => {
  const [id, setId] = useState();
  const { t } = useTranslation("content");

  useEffect(() => {
    setId(uuidv4());
  }, []);

  return (
    <div className="max-w-screen-xl mx-auto">
      <ContentMeta
        title={t("didDocument")}
        description={t("didDocumentDescription")}
        socialDescription={t("didDocumentDescription")}
      />
      {id && (
        <DidBuilder
          id={id}
          name={"DID Document Playground"}
          document={getInitialDidDocument(id)}
        />
      )}
    </div>
  );
};

export default DidDocument;
