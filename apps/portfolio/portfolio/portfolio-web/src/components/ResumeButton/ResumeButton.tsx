import { FileText } from "lucide-react";
import type { GlassButtonLinkProps } from "../GlassButtonLink";
import { GlassButtonLink } from "../GlassButtonLink";
import resumePdfUrl from "./assets/resume.pdf";

type ResumeButtonProps = Pick<GlassButtonLinkProps, "variant">;

export function ResumeButton({ variant = "primary" }: ResumeButtonProps) {
  return (
    <GlassButtonLink
      href={resumePdfUrl}
      icon={<FileText />}
      rel="noreferrer"
      target="_blank"
      variant={variant}
    >
      Resume
    </GlassButtonLink>
  );
}
