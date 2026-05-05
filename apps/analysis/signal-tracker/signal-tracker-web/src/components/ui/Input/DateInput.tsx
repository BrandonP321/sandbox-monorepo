import { Input, type DateInputNativeProps } from "./Input";

type DateInputProps = Omit<DateInputNativeProps, "placeholder" | "type">;

function DateInput(props: DateInputProps) {
  return <Input {...props} type="date" />;
}

export { DateInput, type DateInputProps };
