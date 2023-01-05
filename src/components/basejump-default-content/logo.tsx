/* istanbul ignore file */
import Image from "next/image";
import cx from "classnames";
import {ShieldCheckIcon} from "@heroicons/react/outline";

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
      <div
        className={cx({
          "w-24 md:w-auto": size === "lg",
          "w-14 md:w-auto": size === "sm",
        })}
      >
        <ShieldCheckIcon
                         className={cx({
                           "w-24 h-24 text-red-600": size === "lg",
                           "w-6 h-6 text-red-600": size === "sm",
                         })}/>
      </div>
      <h1
        className={cx("font-black", {
          "text-3xl md:text-8xl": size === "lg",
          "text-2xl": size === "sm",
        })}
      >
        Attested.tech
      </h1>
    </div>
  );
};

export default Logo;
