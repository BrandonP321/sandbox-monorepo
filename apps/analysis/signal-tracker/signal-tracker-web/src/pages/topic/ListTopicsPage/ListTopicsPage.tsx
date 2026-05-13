import { ContentHeader } from "@/components/ui";

import { CreateTopicDialog } from "./components/CreateTopicDialog";
import { TopicsList } from "./components/TopicsList";

export function ListTopicsPage() {
  return (
    // TODO: Page width should be handled by AppShell.
    <section className="mx-auto w-full max-w-6xl">
      <header className="border-border border-b pb-5">
        <ContentHeader
          actions={<CreateTopicDialog />}
          description="Scan active dossiers and open one topic workspace at a time."
          headingLevel={1}
          title="Topics"
        />
      </header>

      <TopicsList />
    </section>
  );
}
