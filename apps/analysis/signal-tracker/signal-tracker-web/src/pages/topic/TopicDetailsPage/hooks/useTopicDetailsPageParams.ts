import { useParams } from "@tanstack/react-router";

import { appRoutes } from "@/routeRegistry";

export function useTopicDetailsPageParams() {
  return useParams({ from: appRoutes.topicDetails.path });
}
