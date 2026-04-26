import {
  AppError,
  responses,
  type ApiRequest,
  type RouteHandler
} from "@repo/api-core";
import {
  createTopicRequestSchema,
  createTopicResponseSchema
} from "@repo/signal-tracker-shared";

import { createTopicRecord } from "../../domain/topics/create-topic";
import {
  InMemoryTopicRepository,
  type TopicRepository
} from "../../domain/topics/topic-repository";

type CreateTopicHandlerDependencies = {
  repository: TopicRepository;
  createId?: () => string;
  now?: () => Date;
};

const defaultTopicRepository = new InMemoryTopicRepository();

export function createCreateTopicHandler(
  dependencies: CreateTopicHandlerDependencies = {
    repository: defaultTopicRepository
  }
): RouteHandler {
  return async (request: ApiRequest) => {
    const payload = parseJsonBody(request.body);
    const parsedRequest = createTopicRequestSchema.safeParse(payload);

    if (!parsedRequest.success) {
      throw new AppError(
        "VALIDATION_ERROR",
        "Topic creation request is invalid",
        400
      );
    }

    const topic = await createTopicRecord(parsedRequest.data, dependencies);
    const response = createTopicResponseSchema.parse({ topic });

    return responses.ok(response);
  };
}

export const createTopic = createCreateTopicHandler();

function parseJsonBody(body: string | null | undefined): unknown {
  if (!body) {
    return {};
  }

  try {
    return JSON.parse(body) as unknown;
  } catch {
    throw new AppError(
      "VALIDATION_ERROR",
      "Request body must be valid JSON",
      400
    );
  }
}
