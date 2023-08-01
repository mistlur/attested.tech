import Link from "next/link";
import { useState } from "react";
import { InformationCircleIcon } from "@heroicons/react/outline";

const AnnotatedHeader = ({
  headerText,
  headerSize,
  body,
  externalDocsLink,
  externalDocsDesc,
}: {
  headerText: string;
  headerSize: string;
  body: string;
  externalDocsLink: string;
  externalDocsDesc: string;
}) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="pb-4">
      <div className="flex items-center">
        <h3 className={`${headerSize} font-bold`}>{headerText}</h3>
        <button
          className="btn btn-circle btn-xs btn-ghost ml-1"
          onClick={() => setExpanded(!expanded)}
        >
          <InformationCircleIcon className="h-5 w-5 text-info" />
        </button>
      </div>
      <div
        className={`flex flex-col gap-y-2 border-l-info border-l-2 pl-2 ${
          !expanded ? "hidden" : ""
        }`}
      >
        <p className="prose text-sm text-justify">{body}</p>
        <p className="min-w-full prose text-sm">
          See the{" "}
          <Link
            className={"underline"}
            href={externalDocsLink}
            passHref
            target={"_blank"}
          >
            {externalDocsDesc}
          </Link>{" "}
          for more information.
        </p>
      </div>
    </div>
  );
};
export default AnnotatedHeader;
