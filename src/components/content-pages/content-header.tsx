import { Button, Navbar } from "react-daisyui";
import Link from "next/link";
import { useRouter } from "next/router";
import Logo from "@/components/attested-default-content/logo";
import useTranslation from "next-translate/useTranslation";
import { MenuIcon } from "@heroicons/react/outline";
import useHeaderNavigation from "@/utils/content/use-header-navigation";
import ThemeSelector from "@/components/core/theme-selector";

type Props = {
  toggleSidebar: () => void;
};

const ContentHeader = ({ toggleSidebar }: Props) => {
  const router = useRouter();

  const { t } = useTranslation("content");

  const navigation = useHeaderNavigation();

  return (
    <div className="bg-neutral text-neutral-content">
      <Navbar className="flex justify-between items-center md:px-4 py-4 max-w-screen-xl mx-auto">
        <div className="flex gap-2">
          <Link href="/" passHref className="mr-4 cursor-pointer">
            <Logo size="lg" />
          </Link>
          <div className="hidden lg:flex gap-4">
            {navigation.map((nav) => (
              <Link
                key={nav.href}
                href={nav.href}
                passHref
                className="btn btn-ghost"
              >
                {nav.title}
              </Link>
            ))}
          </div>
        </div>
        <div className="block lg:hidden">
          <Button color="ghost" onClick={toggleSidebar}>
            <MenuIcon className="w-6 h-6" />
          </Button>
        </div>
      </Navbar>
    </div>
  );
};

export default ContentHeader;
