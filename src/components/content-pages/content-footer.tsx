import FeatherIcon from "feather-icons-react";
import Link from "next/link";

const ContentFooter = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-base-300">
      <div className="max-w-7xl mx-auto py-12 flex flex-col md:flex-row justify-center items-center content-center gap-4">
        <p>&copy; {year} Attested.tech</p>
        <Link
          href={"https://github.com/mistlur/attested.tech"}
          passHref
          target={"_blank"}
        >
          <FeatherIcon icon="github" size="24" />
        </Link>
      </div>
    </footer>
  );
};
export default ContentFooter;
