/* istanbul ignore file */
import ContentMeta from "@/components/content-pages/content-meta";
import { useEffect, useState } from "react";
import useTranslation from "next-translate/useTranslation";
import { v4 as uuidv4 } from "uuid";
import Link from "next/link";
import DidBuilder from "@/components/dids/Builder";
import { getInitialDidDocument } from "@/lib/did";

const AttestedHomepage = () => {
  const [id, setId] = useState();
  const { t } = useTranslation("content");

  useEffect(() => {
    setId(uuidv4());
  }, []);

  return (
    <>
      <div className="max-w-screen-xl mx-auto bg-base-100">
        <ContentMeta
          title="Attested.tech"
          description="Playground for decentralized identifiers"
          socialImage={`/api/og?title=Attested.tech`}
        />
        <div
          className={`p-8 pt-8 md:pb-16 md:pt-16 md:36 flex flex-col items-center gap-8`}
        >
          {/*<Logo size="lg" className="mx-auto" />*/}
          <h2 className="h2 text-center my-2">
            <span className="text-accent">
              Decentralized identifiers (DIDs)
            </span>{" "}
            is an&nbsp;
            <Link
              className={"underline"}
              href={"https://www.w3.org/TR/did-core/"}
              passHref
              target={"_blank"}
            >
              open standard
            </Link>
            &nbsp;that enables verifiable, decentralized digital identity.
          </h2>
          <h2 className="h2 text-center my-2">
            <span className={"font-black mt-4"}>Attested.tech</span> is a
            playground for DID Documents.
          </h2>
        </div>
      </div>
      <div className="bg-base-300">
        <div id="#dids" className="w-full mx-auto">
          {id && (
            <DidBuilder
              id={id}
              name={"DID Document Playground"}
              document={getInitialDidDocument(id)}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default AttestedHomepage;
