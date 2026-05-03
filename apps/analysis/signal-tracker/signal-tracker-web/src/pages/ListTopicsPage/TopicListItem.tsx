import { Link } from "@tanstack/react-router";
import type { Topic } from "@repo/signal-tracker-shared";

import { appRoutes } from "@/routeRegistry";

type TopicListItemProps = {
  topic: Topic;
};

export function TopicListItem({ topic }: TopicListItemProps) {
  return (
    <li className="min-w-0">
      <Link
        className="border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-ring/50 block w-full rounded-md border p-3 text-left transition-colors outline-none focus-visible:ring-[3px]"
        params={{ topicId: topic.id }}
        to={appRoutes.topicDetails.path}
      >
        <span className="block text-sm font-semibold">{topic.title}</span>
        <span className="text-muted-foreground mt-1 block text-sm">
          {topic.framingQuestion}
        </span>
        {topic.scopeNote ? (
          <span className="text-muted-foreground mt-2 block border-l border-border pl-3 text-xs">
            {topic.scopeNote}
          </span>
        ) : null}
      </Link>
    </li>
  );
}
