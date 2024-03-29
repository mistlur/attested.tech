import "../styles/global.css";
import "react-toastify/dist/ReactToastify.css";
import type { AppProps } from "next/app";
import ContentLayout from "../components/content-pages/content-layout";
import { Theme } from "react-daisyui";
import useThemeStorage from "@/utils/use-theme-storage";
import { ToastContainer } from "react-toastify";
import { useEffect } from "react";
import PlausibleProvider from "next-plausible";

function MyApp({ Component, pageProps, router }: AppProps) {
  const { theme } = useThemeStorage("attested");

  useEffect(() => {
    // our dropdowns are used for navigation a lot
    // they work off css focus states, so they don't get removed
    // on navigation transitions.  this is a hack to force them to
    const element = window?.document?.activeElement as HTMLElement;
    if (typeof element?.blur === "function") {
      element.blur();
    }
  }, [router.asPath]);
  return (
    <PlausibleProvider domain={"attested.tech"}>
      <Theme dataTheme={theme} className="bg-base">
        <ContentLayout>
          <Component {...pageProps} />
        </ContentLayout>
        <ToastContainer />
      </Theme>
    </PlausibleProvider>
  );
}

export default MyApp;
