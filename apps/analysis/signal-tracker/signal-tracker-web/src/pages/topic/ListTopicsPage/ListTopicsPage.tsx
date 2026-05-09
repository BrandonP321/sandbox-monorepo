import { ContentHeader } from "@/components/ui";

import { CreateTopicDialog } from "./components/CreateTopicDialog";
import { TopicsList } from "./components/TopicsList";

export function ListTopicsPage() {
  return (
    <section className="mx-auto w-full max-w-5xl">
      <header className="border-border border-b pb-5">
        <ContentHeader
          actions={<CreateTopicDialog />}
          description="Scan active dossiers and open one topic workspace at a time."
          eyebrow="Signal Tracker"
          headingLevel={1}
          title="Topics"
        />
      </header>

      <TopicsList />
    </section>
  );
}
