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
      <div className="bg-base-200">
        <ContentMeta
          title="ATTESTED.TECH"
          description="Playground for decentralized identifiers"
          socialImage={`/meta_banner.png`}
        />
        <div className="p-8 pt-8 md:pb-16 md:pt-16 md:36 flex flex-col items-center gap-8 max-w-screen-xl mx-auto">
          {/*<Logo size="lg" className="mx-auto" />*/}
          <h2 className="h2 text-center">
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
          <h2 className="h2 text-center">
            <span className={"font-black mt-4"}>Attested.tech</span> is a
            playground for DID Documents.
          </h2>
        </div>
      </div>
      <div className="bg-base-300">
        <div id="#dids" className="max-w-screen-xl mx-auto">
          {id && (
            <DidBuilder
              id={id}
              name={"DID Document Playground"}
              document={getInitialDidDocument(id)}
            />
          )}
        </div>
      </div>
      <div className="bg-base-200">
        <div className="p-8 pt-8 md:pb-16 md:pt-16 md:36 flex flex-col items-center gap-8 max-w-screen-xl mx-auto">
          <p className="text-center">
            Attested.tech is maintained by{" "}
            <Link
              className={"underline"}
              href={"https://github.com/johanssonanton"}
              passHref
              target={"_blank"}
            >
              Anton Johansson
            </Link>{" "}
            and{" "}
            <Link
              className={"underline"}
              href={"https://github.com/johannessjoberg"}
              passHref
              target={"_blank"}
            >
              Johannes Sjöberg
            </Link>
            .
          </p>
          <p className="text-center">
            We created this playground to increase understanding and adoption of
            DIDs. The{" "}
            <Link
              className={"underline"}
              href={"https://www.w3.org/TR/did-core/"}
              passHref
              target={"_blank"}
            >
              DID specification
            </Link>{" "}
            can be challenging for newcomers to grasp and utilize effectively,
            something we ourselves experienced. If you have any issues or
            feedback, or want to contribute, head over to{" "}
            <Link
              className={"underline"}
              href={"https://github.com/mistlur/attested.tech"}
              passHref
              target={"_blank"}
            >
              github
            </Link>
            .
          </p>
        </div>
      </div>
    </>
  );
};

export default AttestedHomepage;
