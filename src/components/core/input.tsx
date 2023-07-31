import { Input as InnerInput, InputProps } from "react-daisyui";
import { ForwardedRef, forwardRef } from "react";
import cx from "classnames";

type Props = InputProps & {
  label?: string;
  helpText?: string;
  errorMessage?: string;
  successMessage?: string;
};
const Input = forwardRef(
  (
    { label, helpText, errorMessage, successMessage, color, ...props }: Props,
    ref: ForwardedRef<HTMLInputElement>
  ) => {
    return (
      <div className="form-control w-full">
        <label className="label">
          <span
            className={cx("label-text", {
              "text-error": !!errorMessage,
            })}
          >
            {label}
          </span>
          {(!!helpText || !!errorMessage || !!successMessage) && (
            <span
              className={cx("label-text-alt", {
                "text-success": !!successMessage,
                "text-error": !!errorMessage,
              })}
            >
              {errorMessage || successMessage || helpText}
            </span>
          )}
        </label>
        <InnerInput
          {...props}
          ref={ref}
          color={
            !!errorMessage ? "error" : !!successMessage ? "success" : color
          }
        />
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
