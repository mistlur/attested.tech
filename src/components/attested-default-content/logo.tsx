/* istanbul ignore file */
import cx from "classnames";
import { ShieldCheckIcon } from "@heroicons/react/outline";

type Props = {
  size: "sm" | "lg";
  className?: string;
};

const Logo = ({ size = "lg", className }: Props) => {
  const height = size === "sm" ? 40 : 150;
  const width = size === "sm" ? 40 : 150;
  return (
    <div
      className={cx(
        "flex items-center justify-center",
        {
          "gap-x-3 md:gap-x-4": size === "lg",
          "gap-x-1 md:gap-x-2": size === "sm",
        },
        className
      )}
    >
      <h1
        className={cx("font-ultrablack", {
          "text-3xl md:text-7xl": size === "lg",
          "text-lg": size === "sm",
        })}
      >
        ATTESTED.TECH
      </h1>
    </div>
  );
};

export default Logo;
