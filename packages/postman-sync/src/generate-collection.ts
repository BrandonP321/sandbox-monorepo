import type {
  LoadedPostmanProject,
  LoadedPostmanRequest,
  PostmanCollection,
  PostmanCollectionItem,
  PostmanRequestItem
} from "./types.js";

const COLLECTION_SCHEMA_URL =
  "https://schema.getpostman.com/json/collection/v2.1.0/collection.json";

export function generateCollection(
  project: LoadedPostmanProject,
  requests: LoadedPostmanRequest[]
): PostmanCollection {
  const sortedRequests = [...requests].sort((left, right) => {
    const leftFolder = left.config.folder ?? "";
    const rightFolder = right.config.folder ?? "";

    return (
      leftFolder.localeCompare(rightFolder) ||
      left.config.name.localeCompare(right.config.name)
    );
  });

  return {
    info: {
      name: project.config.postman.collectionName,
      description: `Generated from ${project.config.displayName} route configs. Do not edit by hand.`,
      schema: COLLECTION_SCHEMA_URL
    },
    item: groupRequests(sortedRequests),
    variable: [{ key: "baseUrl", value: "{{baseUrl}}" }]
  };
}

function groupRequests(
  requests: LoadedPostmanRequest[]
): PostmanCollectionItem[] {
  const ungrouped: PostmanRequestItem[] = [];
  const folders = new Map<string, PostmanRequestItem[]>();

  for (const request of requests) {
    const item = createRequestItem(request);
    const folder = request.config.folder;

    if (!folder) {
      ungrouped.push(item);
      continue;
    }

    folders.set(folder, [...(folders.get(folder) ?? []), item]);
  }

  return [
    ...[...folders.entries()].map(([name, item]) => ({ name, item })),
    ...ungrouped
  ];
}

function createRequestItem(request: LoadedPostmanRequest): PostmanRequestItem {
  const rawUrl = `{{baseUrl}}${request.config.route.path}`;
  const exampleBody = request.config.exampleBody;
  const item: PostmanRequestItem = {
    name: request.config.name,
    request: {
      method: request.config.route.method.toUpperCase(),
      url: {
        raw: rawUrl,
        host: ["{{baseUrl}}"],
        path: request.config.route.path.slice(1).split("/")
      },
      description: request.config.description
    },
    response: []
  };

  if (exampleBody !== undefined) {
    item.request.header = [{ key: "Content-Type", value: "application/json" }];
    item.request.body = {
      mode: "raw",
      raw: JSON.stringify(exampleBody, null, 2),
      options: {
        raw: {
          language: "json"
        }
      }
    };
  }

  return item;
}
