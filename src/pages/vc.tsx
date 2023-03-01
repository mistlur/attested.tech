import ContentMeta from "@/components/content-pages/content-meta";
import useTranslation from "next-translate/useTranslation";
import { v4 as uuidv4 } from 'uuid';
import {useEffect, useState} from "react";
import Issue from "@/components/vc/Issue";

const DidDocument = () => {
  const [id, setId] = useState()
  const { t } = useTranslation("content");

  useEffect(() => {
    setId(uuidv4())
  }, [])

  return (
    <div className="max-w-screen-xl mx-auto">
      <ContentMeta
        title={t("vc")}
        description={t("vcDescription")}
        socialDescription={t("vcDescription")}
      />
      { id && <Issue/>}
    </div>
  )
};

export default DidDocument;
