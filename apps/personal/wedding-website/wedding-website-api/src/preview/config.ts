export type PreviewConfig = { createdAt: number; expiresAt: number };
export function previewConfig(env: NodeJS.ProcessEnv): PreviewConfig {
  const createdAt = Date.parse(env.PREVIEW_CREATED_AT ?? "");
  const expiresAt = Date.parse(env.PREVIEW_EXPIRES_AT ?? "");
  if (
    !Number.isFinite(createdAt) ||
    !Number.isFinite(expiresAt) ||
    expiresAt <= createdAt ||
    expiresAt - createdAt > 86_400_000
  )
    throw new Error("Invalid preview lifetime");
  return { createdAt, expiresAt };
}
export function previewActive(config: PreviewConfig, now: number): boolean {
  return now >= config.createdAt && now < config.expiresAt;
}
