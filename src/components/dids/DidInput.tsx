import { InputProps } from "react-daisyui";
import { ForwardedRef, forwardRef, useState } from "react";
import { Did } from "@/lib/did";
import Input from "../core/input";

type Props = InputProps & {
  label?: string;
  helpText?: string;
  errorMessage?: string;
  callback: ({
    did,
    value,
    valid,
  }: {
    did: Did | null;
    value: string;
    valid: boolean;
  }) => void;
};
const DidInput = forwardRef(
  (
    { label, helpText, errorMessage, color, callback, ...props }: Props,
    ref: ForwardedRef<HTMLInputElement>
  ) => {
    const [didCandidate, setDidCandidate] = useState<string>(
      props.value?.toString() || ""
    );
    const [isDidValid, setIsDidValid] = useState<boolean>(
      Did.validate(didCandidate)
    );

    return (
      <Input
        label={label || "Enter a DID"}
        helpText={helpText}
        errorMessage={
          isDidValid || didCandidate === "" ? "" : "DID is not valid"
        }
        successMessage={isDidValid ? "Valid" : ""}
        data-testid="name"
        placeholder="did:web:..."
        value={didCandidate}
        onChange={(e) => {
          const isValid = Did.validate(e.target.value);
          callback({
            valid: isValid,
            value: e.target.value,
            did: (isValid && new Did(e.target.value)) || null,
          });
          setIsDidValid(isValid);
          setDidCandidate(e.target.value);
        }}
      />
    );
  }
);

DidInput.displayName = "Input";

export default DidInput;
