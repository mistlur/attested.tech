import Head from "next/head";
import getFullRedirectUrl from "@/utils/get-full-redirect-url";

type Props = {
  title: string;
  description: string;
  socialDescription?: string;
};

const ContentMeta = ({ title, description, socialDescription }: Props) => {
  return (
    <Head>
      <title>{title}</title>
      <link
        href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;600&family=Abel&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Unbounded:wght@900&display=swap"
        rel="stylesheet"
      />
      <link
        rel="apple-touch-icon"
        sizes="57x57"
        href="/static/apple-icon-57x57.png"
      />
      <link
        rel="apple-touch-icon"
        sizes="60x60"
        href="/static/apple-icon-60x60.png"
      />
      <link
        rel="apple-touch-icon"
        sizes="72x72"
        href="/static/apple-icon-72x72.png"
      />
      <link
        rel="apple-touch-icon"
        sizes="76x76"
        href="/static/apple-icon-76x76.png"
      />
      <link
        rel="apple-touch-icon"
        sizes="114x114"
        href="/static/apple-icon-114x114.png"
      />
      <link
        rel="apple-touch-icon"
        sizes="120x120"
        href="/static/apple-icon-120x120.png"
      />
      <link
        rel="apple-touch-icon"
        sizes="144x144"
        href="/static/apple-icon-144x144.png"
      />
      <link
        rel="apple-touch-icon"
        sizes="152x152"
        href="/static/apple-icon-152x152.png"
      />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/static/apple-icon-180x180.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="192x192"
        href="/static/android-icon-192x192.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/static/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="96x96"
        href="/static/favicon-96x96.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/static/favicon-16x16.png"
      />
      <meta name="twitter:card" content="summary" />
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
      <>
        <meta
          property="og:image"
          content={getFullRedirectUrl("/static/apple-icon-180x180.png")}
        />
        <meta
          name="twitter:image"
          content={getFullRedirectUrl("/static/apple-icon-180x180.png")}
        />
      </>
    </Head>
  );
};

export default ContentMeta;
