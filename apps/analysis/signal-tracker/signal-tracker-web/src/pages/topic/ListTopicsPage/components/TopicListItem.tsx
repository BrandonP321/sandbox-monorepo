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
        className="border-border bg-white text-foreground hover:border-primary hover:border-l-4 hover:bg-white hover:shadow-sm focus-visible:border-ring focus-visible:ring-ring/50 block w-full rounded-md border p-3 text-left transition-[background-color,border-color,border-left-width,box-shadow,color] duration-150 ease-linear outline-none focus-visible:ring-[3px]"
        params={{ topicId: topic.id, topicTitle: topic.title }}
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
