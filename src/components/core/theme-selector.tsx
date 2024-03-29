import { MoonIcon, SunIcon } from "@heroicons/react/outline";
import { Button, Dropdown } from "react-daisyui";
import { useMemo } from "react";
import useThemeStorage from "@/utils/use-theme-storage";

export const AVAILABLE_THEMES = {
  light: {
    name: "Light",
    id: "light",
    Icon: SunIcon,
  },
  dark: {
    name: "Dark",
    id: "attested",
    Icon: MoonIcon,
  },
};

const ThemeSelector = () => {
  const { theme, setTheme, clearTheme } = useThemeStorage("dracula");

  const selectedTheme = useMemo(() => {
    return AVAILABLE_THEMES[theme];
  }, [theme]);

  return (
    <Dropdown vertical="middle" horizontal="left">
      <Button color="ghost" shape="square">
        {!selectedTheme ? (
          <SunIcon className="h-5 w-5" />
        ) : (
          <selectedTheme.Icon className="h-5 w-5" />
        )}
      </Button>
      <Dropdown.Menu className="w-56 bg-base-300 text-base-content">
        {Object.values(AVAILABLE_THEMES).map((themeOption) => (
          <Button
            key={`theme-${themeOption.id}`}
            color="ghost"
            onClick={() => setTheme(themeOption.id)}
            className="justify-between"
          >
            <div className="flex items-center">
              <themeOption.Icon className="h-5 w-5 mr-2" />
              {themeOption.name}
            </div>
            {theme === themeOption.id && (
              <span className="text-base-500">✓</span>
            )}
          </Button>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default ThemeSelector;
