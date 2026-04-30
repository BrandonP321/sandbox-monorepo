import { definePostmanRequest } from "@repo/postman-sync";
import {
  createAssessmentUpdateRequestSchema,
  signalTrackerRoutes
} from "@repo/signal-tracker-shared";

export default definePostmanRequest({
  routeName: "createAssessmentUpdate",
  route: signalTrackerRoutes.createAssessmentUpdate,
  folder: "Assessments",
  name: "Create Assessment Update",
  description:
    "Creates a dated assessment update with structured judgment fields.",
  requestSchema: createAssessmentUpdateRequestSchema,
  exampleBody: {
    topicId: "topic-1",
    judgment: "Escalation risk remains limited.",
    confidenceLabel: "medium",
    probabilityPct: 35,
    assumptions: ["Diplomatic channels remain open"],
    indicators: ["Watch for evacuation orders"],
    resolutionCriteria: "Direct military action occurs.",
    targetResolvesAt: "2026-05-25T00:00:00.000Z",
    sortAt: "2026-04-25T00:00:00.000Z"
  }
});
