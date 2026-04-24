import type { BaseSyntheticEvent, FormHTMLAttributes } from "react";
import { type FieldValues, useFormContext } from "react-hook-form";

export type FormSubmitHandler<T extends FieldValues> = (
  values: T,
  event?: BaseSyntheticEvent
) => Promise<void>;

type FormProps<T extends FieldValues> = Omit<
  FormHTMLAttributes<HTMLFormElement>,
  "onSubmit"
> & {
  noValidate?: boolean;
  onSubmit: FormSubmitHandler<T>;
};

export function Form<T extends FieldValues>({
  noValidate = true,
  onSubmit,
  ...props
}: FormProps<T>) {
  const { handleSubmit } = useFormContext<T>();

  return (
    <form
      {...props}
      noValidate={noValidate}
      onSubmit={handleSubmit(onSubmit)}
    />
  );
}
