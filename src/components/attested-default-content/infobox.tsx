import Link from "next/link";
import { useState } from "react";
import { InformationCircleIcon, XCircleIcon } from "@heroicons/react/outline";

const Infobox = ({
  body,
  externalDocsLink,
  externalDocsDesc,
}: {
  body: string;
  externalDocsLink: string;
  externalDocsDesc: string;
}) => {
  const [expanded, setExpanded] = useState(false);
  if (expanded)
    return (
      <div className="pb-4">
        <button
          className="btn btn-xs btn-link pl-0 mb-1"
          onClick={() => setExpanded(false)}
        >
          <InformationCircleIcon className="h-4 w-4 text-info mr-1" />
          Close
        </button>
        <div className="flex flex-col gap-y-2 border-l-info border-l-2 pl-2">
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
  else
    return (
      <div>
        <button
          className="btn btn-xs btn-link pl-0"
          onClick={() => setExpanded(true)}
        >
          <InformationCircleIcon className="h-4 w-4 text-info mr-1" />
          Info
        </button>
      </div>
    );
};

export default Infobox;
