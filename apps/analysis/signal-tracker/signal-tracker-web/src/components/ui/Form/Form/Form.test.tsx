import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  NotificationFlashbar,
  NotificationProvider,
  useNotifications
} from "../../Notifications";
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

    expect(
      screen.getByText("The API request failed.").closest("[data-slot='alert']")
    ).toHaveTextContent("The API request failed.");
    expect(screen.getByText("Unable to save form")).toBeInTheDocument();
  });

  it("clears form notifications on submit without clearing parent notifications", async () => {
    render(
      <NotificationProvider mode="multiple">
        <NotificationFlashbar />
        <FormHarness>
          <ProviderErrorButton />
          <ProviderSuccessButton />
          <button type="submit">Save form</button>
        </FormHarness>
      </NotificationProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Show API error" }));
    fireEvent.click(screen.getByRole("button", { name: "Show page success" }));

    expect(
      screen.getByText("The API request failed.").closest("[data-slot='alert']")
    ).toHaveTextContent("The API request failed.");
    expect(screen.getByText("The page request succeeded.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Save form" }));

    await waitFor(() => {
      expect(
        screen.queryByText("The API request failed.")
      ).not.toBeInTheDocument();
    });
    expect(screen.getByText("The page request succeeded.")).toBeInTheDocument();
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

function ProviderSuccessButton() {
  const { notifySuccess } = useNotifications();

  return (
    <button
      onClick={() => notifySuccess("The page request succeeded.")}
      type="button"
    >
      Show page success
    </button>
  );
}
