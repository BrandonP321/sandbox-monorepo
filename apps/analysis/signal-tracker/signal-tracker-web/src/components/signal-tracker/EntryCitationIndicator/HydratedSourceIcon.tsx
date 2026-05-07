import type { AttachedSourceSummary } from "@repo/signal-tracker-shared";

import { SourceIcon } from "@/components/ui";

type HydratedSourceIconProps = {
  source: AttachedSourceSummary;
};

function HydratedSourceIcon({ source }: HydratedSourceIconProps) {
  return (
    <SourceIcon
      size="sm"
      url={source.url ?? source.canonicalUrl ?? getDomainUrl(source)}
    />
  );
}

function getDomainUrl(source: AttachedSourceSummary) {
  return source.sourceDomain ? `https://${source.sourceDomain}` : undefined;
}

export { HydratedSourceIcon, type HydratedSourceIconProps };
