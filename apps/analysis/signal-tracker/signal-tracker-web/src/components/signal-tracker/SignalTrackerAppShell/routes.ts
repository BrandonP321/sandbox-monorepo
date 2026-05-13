import { createElement } from "react";

import {
  defineAppShellRoute,
  defineAppShellRoutes
} from "@repo/dashboard-ui/tanstack-router";
import { appRoutes } from "@/routeRegistry";

import { signalTrackerIcons as Icons } from "../signalTrackerIcons";

const signalTrackerAppShellRoutes = defineAppShellRoutes([
  {
    children: [
      defineAppShellRoute({
        params: ({ params }) => ({
          topicId: params.topicId,
          topicTitle: params.topicTitle
        }),
        path: appRoutes.topicDetails.path,
        description: ({ params }) =>
          `Review continuity signals for ${params.topicTitle}.`,
        title: ({ params }) => `Topic: ${params.topicTitle}`,
        navLinkTitle: ({ params }) => params.topicTitle,
        breadcrumbTitle: ({ params }) => params.topicTitle,
        visibleWhen: "activeBranch"
      })
    ],
    icon: createElement(Icons.topic),
    path: appRoutes.listTopics.path,
    description: "Track continuity signals across active topics.",
    title: "Topics"
  }
]);

export { signalTrackerAppShellRoutes };
