import { Github } from "lucide-react";
import type { GlassButtonLinkProps } from "../GlassButtonLink";
import { GlassButtonLink } from "../GlassButtonLink";

type GithubButtonProps = Pick<GlassButtonLinkProps, "size" | "variant">;

const githubProfileUrl = "https://github.com/BrandonP321";

export function GithubButton({
  size,
  variant = "secondary"
}: GithubButtonProps) {
  return (
    <GlassButtonLink
      href={githubProfileUrl}
      icon={<Github />}
      rel="noreferrer"
      size={size}
      target="_blank"
      variant={variant}
    >
      GitHub
    </GlassButtonLink>
  );
}
