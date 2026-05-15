import { Linkedin } from "lucide-react";
import type { GlassButtonLinkProps } from "../GlassButtonLink";
import { GlassButtonLink } from "../GlassButtonLink";

type LinkedInButtonProps = Pick<GlassButtonLinkProps, "variant">;

const linkedInProfileUrl = "https://www.linkedin.com/in/brandon-phillips-dev";

export function LinkedInButton({ variant = "secondary" }: LinkedInButtonProps) {
  return (
    <GlassButtonLink
      href={linkedInProfileUrl}
      icon={<Linkedin />}
      rel="noreferrer"
      target="_blank"
      variant={variant}
    >
      LinkedIn
    </GlassButtonLink>
  );
}
