import { useFormContext } from "react-hook-form";

import { Button, type ButtonProps } from "../Button";

type FormButtonProps = ButtonProps & {
  loadingOnSubmit?: boolean;
};

type SubmitButtonProps = Omit<FormButtonProps, "loadingOnSubmit" | "type">;

function FormButton({
  disabled,
  isLoading = false,
  // TODO: Make this true by default?
  loadingOnSubmit = false,
  ...props
}: FormButtonProps) {
  const {
    formState: { isSubmitting }
  } = useFormContext();
  const shouldShowLoading = isLoading || (loadingOnSubmit && isSubmitting);

  return (
    <Button
      {...props}
      disabled={disabled || (isSubmitting && !shouldShowLoading)}
      isLoading={shouldShowLoading}
    />
  );
}

function SubmitButton(props: SubmitButtonProps) {
  return <FormButton {...props} loadingOnSubmit type="submit" />;
}

export {
  FormButton,
  SubmitButton,
  type FormButtonProps,
  type SubmitButtonProps
};
