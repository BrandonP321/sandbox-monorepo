import { createElement } from "react";
import { FolderKanban } from "lucide-react";

import { defineAppShellRoute, defineAppShellRoutes } from "@/components/ui";
import { appRoutes } from "@/routeRegistry";

const signalTrackerAppShellRoutes = defineAppShellRoutes([
  {
    children: [
      defineAppShellRoute({
        params: ({ params }) => ({
          topicId: params.topicId,
          topicTitle: params.topicTitle
        }),
        path: appRoutes.topicDetails.path,
        title: ({ params }) => `Topic: ${params.topicTitle}`,
        navLinkTitle: ({ params }) => params.topicTitle,
        breadcrumbTitle: ({ params }) => params.topicTitle,
        visibleWhen: "activeBranch"
      })
    ],
    icon: createElement(FolderKanban),
    path: appRoutes.listTopics.path,
    title: "Topics"
  }
]);

export { signalTrackerAppShellRoutes };
