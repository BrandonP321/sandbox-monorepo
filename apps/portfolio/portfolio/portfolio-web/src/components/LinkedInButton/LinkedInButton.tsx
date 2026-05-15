import { Linkedin } from "lucide-react";
import type { GlassButtonLinkProps } from "../GlassButtonLink";
import { GlassButtonLink } from "../GlassButtonLink";

type LinkedInButtonProps = Pick<GlassButtonLinkProps, "size" | "variant">;

const linkedInProfileUrl = "https://www.linkedin.com/in/brandon-phillips-dev";

export function LinkedInButton({
  size,
  variant = "secondary"
}: LinkedInButtonProps) {
  return (
    <GlassButtonLink
      href={linkedInProfileUrl}
      icon={<Linkedin />}
      rel="noreferrer"
      size={size}
      target="_blank"
      variant={variant}
    >
      LinkedIn
    </GlassButtonLink>
  );
}
