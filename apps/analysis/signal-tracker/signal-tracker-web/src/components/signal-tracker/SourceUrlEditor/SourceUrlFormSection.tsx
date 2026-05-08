import type { FieldValues } from "react-hook-form";

import { ContentHeader } from "@/components/ui";

import { SourceUrlEditor, type SourceUrlEditorProps } from "./SourceUrlEditor";

type SourceUrlFormSectionProps<TFieldValues extends FieldValues> = {
  description: string;
  name: SourceUrlEditorProps<TFieldValues>["name"];
  title?: string;
};

function SourceUrlFormSection<TFieldValues extends FieldValues>({
  description,
  name,
  title = "Sources"
}: SourceUrlFormSectionProps<TFieldValues>) {
  return (
    <section className="border-border grid gap-3 border-t pt-4">
      <ContentHeader
        description={description}
        headingLevel={3}
        headingSize="h5"
        title={title}
      />
      <SourceUrlEditor<TFieldValues> name={name} />
    </section>
  );
}

export { SourceUrlFormSection, type SourceUrlFormSectionProps };
