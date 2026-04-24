import { forwardRef, type ReactNode, useId } from "react";
import type {
  ChangeEventHandler,
  FocusEventHandler
} from "react";
import type { LucideIcon } from "lucide-react";

import { InputView } from "./InputView";

export type InputType =
  | "email"
  | "password"
  | "search"
  | "text"
  | "url";

export type InputViewProps = {
  ariaLabel?: string;
  defaultValue?: string;
  description?: ReactNode;
  disabled?: boolean;
  error?: string;
  iconLeft?: LucideIcon;
  id: string;
  label?: ReactNode;
  name?: string;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
  type: InputType;
  value?: string;
};

export type InputProps = Omit<InputViewProps, "id" | "type"> & {
  id?: string;
  type?: InputType;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input(props, ref) {
    const generatedId = useId();
    const { id, type = "text", ...restProps } = props;
    const inputId = id ?? `input-${generatedId}`;

    return <InputView {...restProps} id={inputId} ref={ref} type={type} />;
  }
);
