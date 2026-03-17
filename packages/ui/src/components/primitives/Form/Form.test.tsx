import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { z } from "zod";

import { FormProvider } from "../FormProvider/FormProvider";
import { Form } from "./Form";

const exampleSchema = z.object({
  company: z.string().min(1)
});

type ExampleFormValues = z.infer<typeof exampleSchema>;

function TestHarness({ noValidate }: { noValidate?: boolean }) {
  return (
    <FormProvider
      defaultValues={{ company: "OpenAI" }}
      schema={exampleSchema}
    >
      <Form<ExampleFormValues> noValidate={noValidate} onSubmit={async () => undefined}>
        <input name="company" />
      </Form>
    </FormProvider>
  );
}

describe("Form", () => {
  it("defaults to rendering with native validation disabled", () => {
    const markup = renderToStaticMarkup(<TestHarness />);

    expect(markup).toContain("<form");
    expect(markup).toContain('noValidate=""');
  });

  it("allows callers to opt back into native validation", () => {
    const markup = renderToStaticMarkup(<TestHarness noValidate={false} />);

    expect(markup).toContain("<form");
    expect(markup).not.toContain("novalidate");
  });
});
