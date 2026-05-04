import { fireEvent, render, screen } from "@testing-library/react";
import {
  FormProvider as ReactHookFormProvider,
  useForm
} from "react-hook-form";
import { describe, expect, it } from "vitest";

import { FormButton, SubmitButton } from "./FormButton";

type ExampleFormValues = {
  title: string;
};

function FormButtonHarness() {
  const form = useForm<ExampleFormValues>({
    defaultValues: {
      title: "Initial title"
    }
  });

  return (
    <ReactHookFormProvider {...form}>
      <form onSubmit={form.handleSubmit(() => new Promise(() => undefined))}>
        <FormButton>Cancel</FormButton>
        <SubmitButton loadingLabel="Saving...">Save</SubmitButton>
      </form>
    </ReactHookFormProvider>
  );
}

describe("FormButton", () => {
  it("disables non-submit actions during submit without marking them busy", async () => {
    render(<FormButtonHarness />);

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    const cancelButton = await screen.findByRole("button", { name: "Cancel" });

    expect(cancelButton).toBeDisabled();
    expect(cancelButton).not.toHaveAttribute("aria-busy");
  });

  it("shows submit loading text during submit", async () => {
    render(<FormButtonHarness />);

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    const submitButton = await screen.findByRole("button", {
      name: "Saving..."
    });

    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveAttribute("aria-busy", "true");
  });
});
