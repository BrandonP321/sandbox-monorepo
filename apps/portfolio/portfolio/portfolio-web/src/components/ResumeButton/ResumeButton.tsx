import { FileText } from "lucide-react";
import type { GlassButtonLinkProps } from "../GlassButtonLink";
import { GlassButtonLink } from "../GlassButtonLink";
import resumePdfUrl from "./assets/resume.pdf";

type ResumeButtonProps = Pick<GlassButtonLinkProps, "size" | "variant">;

export function ResumeButton({
  size,
  variant = "secondary"
}: ResumeButtonProps) {
  return (
    <GlassButtonLink
      href={resumePdfUrl}
      icon={<FileText />}
      rel="noreferrer"
      size={size}
      target="_blank"
      variant={variant}
    >
      Resume
    </GlassButtonLink>
  );
}
