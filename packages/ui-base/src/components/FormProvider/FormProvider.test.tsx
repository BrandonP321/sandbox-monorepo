import { renderToStaticMarkup } from "react-dom/server";
import { useFormContext } from "react-hook-form";
import { describe, expect, it } from "vitest";
import { z } from "zod";

import { FormProvider } from "./FormProvider";

const exampleSchema = z.object({
  company: z.string().min(1)
});

type ExampleFormValues = z.infer<typeof exampleSchema>;

function ContextReader() {
  const { formState, getValues } = useFormContext<ExampleFormValues>();

  return (
    <output data-submit-count={String(formState.submitCount)}>
      {getValues("company")}
    </output>
  );
}

describe("FormProvider", () => {
  it("provides react-hook-form context configured from the required schema", () => {
    const markup = renderToStaticMarkup(
      <FormProvider defaultValues={{ company: "OpenAI" }} schema={exampleSchema}>
        <ContextReader />
      </FormProvider>
    );

    expect(markup).toContain("OpenAI");
    expect(markup).toContain('data-submit-count="0"');
  });
});
