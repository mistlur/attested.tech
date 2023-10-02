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
  const [showOverlay, setShowOverlay] = useState(false);
  useEffect(() => {
    setId(uuidv4());
  }, []);

  return (
    <>
      <div className="bg-accent">
        <div
          className={`fixed inset-0 opacity-60 bg-black z-10 ${
            showOverlay ? "" : "hidden"
          }`}
        ></div>
        <ContentMeta
          title="ATTESTED.TECH"
          description="Playground for decentralized identifiers"
          // socialImage={`/meta_banner.png`}
        />
        <div className="alert alert-warning gap-0 sm:hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>This site works best on a bigger screen</span>
        </div>
        <div className="bg-accent/100 p-8 md:py-16 flex flex-col items-center gap-8 max-w-screen-lg mx-auto">
          {/*<Logo size="lg" className="mx-auto" />*/}
          <h2 className="h2 text-center text-black">
            <span className="font-black">Decentralized identifiers (DIDs)</span>{" "}
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
          <h2 className="h2 text-center text-black">
            <span className={"mt-4 font-extrabold"}>Attested.tech</span> is a
            playground for DID Documents.
          </h2>
        </div>
      </div>
      <div className="bg-accent">
        <div id="#dids" className="max-w-screen-xl mx-auto">
          {id && (
            <DidBuilder
              id={id}
              name={"DID Document Playground"}
              document={getInitialDidDocument(id)}
              setShowOverlay={setShowOverlay}
            />
          )}
        </div>
      </div>
      <div className="bg-accent text-black">
        <div className="p-8 pt-8 md:pb-16 md:pt-16 md:36 flex flex-col items-center gap-8 max-w-screen-lg mx-auto">
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
