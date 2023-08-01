import Head from "next/head";
import getFullRedirectUrl from "@/utils/get-full-redirect-url";

type Props = {
  title: string;
  description: string;
  socialDescription?: string;
  socialImage?: string;
};

const ContentMeta = ({
  title,
  description,
  socialDescription,
  socialImage,
}: Props) => {
  return (
    <Head>
      <title>{title}</title>
      <link
        href="https://fonts.googleapis.com/css2?family=Abel&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Unbounded:wght@900&display=swap"
        rel="stylesheet"
      />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="description" content={description} key="desc" />
      <meta property="og:title" content={title} />
      <meta name="twitter:title" content={title} />
      <meta
        property="og:description"
        content={socialDescription || description}
      />
      <meta
        name="twitter:description"
        content={socialDescription || description}
      />
      {!!socialImage && (
        <>
          <meta property="og:image" content={getFullRedirectUrl(socialImage)} />
          <meta
            name="twitter:image"
            content={getFullRedirectUrl(socialImage)}
          />
        </>
      )}
    </Head>
  );
};

export default ContentMeta;
