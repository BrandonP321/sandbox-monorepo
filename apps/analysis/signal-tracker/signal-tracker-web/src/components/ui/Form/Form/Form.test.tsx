import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { z } from "zod";

import { useNotifications } from "../../Notifications";
import { Form } from "./Form";
import { FormProvider } from "../FormProvider";

const exampleFormSchema = z.object({
  title: z.string()
});

type ExampleFormValues = z.input<typeof exampleFormSchema>;

function RegisteredInput() {
  return <input aria-label="Title" name="title" />;
}

type FormHarnessProps = {
  children?: ReactNode;
  error?: string;
  errorTitle?: string;
};

const defaultValues = {
  title: "Initial title"
} satisfies ExampleFormValues;

function FormHarness({ children, error, errorTitle }: FormHarnessProps) {
  return (
    <FormProvider defaultValues={defaultValues} schema={exampleFormSchema}>
      <Form<ExampleFormValues>
        error={error}
        errorTitle={errorTitle}
        onSubmit={async () => undefined}
      >
        <RegisteredInput />
        {children}
      </Form>
    </FormProvider>
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

  it("renders error notifications from form children as alerts", () => {
    render(
      <FormHarness>
        <ProviderErrorButton />
      </FormHarness>
    );

    fireEvent.click(screen.getByRole("button", { name: "Show API error" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "The API request failed."
    );
    expect(screen.getByText("Unable to save form")).toBeInTheDocument();
  });
});

function ProviderErrorButton() {
  const { notifyError } = useNotifications();

  return (
    <button
      onClick={() =>
        notifyError({
          content: "The API request failed.",
          header: "Unable to save form"
        })
      }
      type="button"
    >
      Show API error
    </button>
  );
}
