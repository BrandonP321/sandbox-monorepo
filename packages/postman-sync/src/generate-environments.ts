import type {
  LoadedPostmanProject,
  PostmanEnvironmentFile,
  PostmanVariableType
} from "./types.js";

export function generateEnvironments(
  project: LoadedPostmanProject
): Record<string, PostmanEnvironmentFile> {
  return Object.fromEntries(
    Object.entries(project.config.environments).map(([environmentKey, config]) => [
      environmentKey,
      {
        name: config.name,
        values: Object.entries(config.values)
          .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
          .map(([key, value]) => ({
            key,
            value: value.value,
            enabled: value.enabled ?? true,
            type: normalizeVariableType(value.type),
            ...(value.description ? { description: value.description } : {})
          }))
      }
    ])
  );
}

function normalizeVariableType(
  variableType: PostmanVariableType | undefined
): PostmanVariableType {
  return variableType ?? "default";
}
