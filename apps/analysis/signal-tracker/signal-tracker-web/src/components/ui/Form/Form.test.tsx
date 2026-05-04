import { render, screen } from "@testing-library/react";
import {
  FormProvider as ReactHookFormProvider,
  useForm
} from "react-hook-form";
import { describe, expect, it } from "vitest";

import { Form } from "./Form";

type ExampleFormValues = {
  title: string;
};

function FormHarness({
  error,
  errorTitle
}: {
  error?: string;
  errorTitle?: string;
}) {
  const form = useForm<ExampleFormValues>({
    defaultValues: {
      title: "Initial title"
    }
  });

  return (
    <ReactHookFormProvider {...form}>
      <Form<ExampleFormValues>
        error={error}
        errorTitle={errorTitle}
        onSubmit={async () => undefined}
      >
        <input {...form.register("title")} aria-label="Title" />
      </Form>
    </ReactHookFormProvider>
  );
}

describe("Form", () => {
  it("renders form errors as an alert", () => {
    render(
      <FormHarness
        error="Topic could not be saved."
        errorTitle="Unable to create topic"
      />
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Topic could not be saved."
    );
    expect(screen.getByText("Unable to create topic")).toBeInTheDocument();
  });

  it("does not render an alert without a form error", () => {
    render(<FormHarness />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
