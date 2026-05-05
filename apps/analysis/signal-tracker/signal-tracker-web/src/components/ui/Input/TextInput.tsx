import { Input, type TextInputNativeProps } from "./Input";

type TextInputProps = TextInputNativeProps;

function TextInput({ type = "text", ...props }: TextInputProps) {
  return <Input {...props} type={type} />;
}

export { TextInput, type TextInputProps };
