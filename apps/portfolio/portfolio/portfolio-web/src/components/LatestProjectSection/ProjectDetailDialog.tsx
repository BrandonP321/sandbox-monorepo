import { X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import type * as React from "react";

type ProjectDetailDialogProps = {
  children: ReactNode;
  description: string;
  eyebrow: string;
  title: string;
  triggerLabel?: string;
};

const dialogTransitionMs = 160;

function ProjectDetailDialog({
  children,
  description,
  eyebrow,
  title,
  triggerLabel = "Learn more"
}: ProjectDetailDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const titleId = useId();

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  function openDialog() {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    dialog.removeAttribute("data-closing");

    if (typeof dialog.showModal === "function") {
      try {
        dialog.showModal();
        return;
      } catch {
        dialog.setAttribute("open", "");
        return;
      }
    }

    dialog.setAttribute("open", "");
  }

  function closeDialog() {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (!dialog.open) {
      return;
    }

    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
    }

    if (
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
    ) {
      finishCloseDialog(dialog);
      return;
    }

    dialog.setAttribute("data-closing", "true");
    closeTimerRef.current = window.setTimeout(() => {
      finishCloseDialog(dialog);
    }, dialogTransitionMs);
  }

  function finishCloseDialog(dialog: HTMLDialogElement) {
    dialog.removeAttribute("data-closing");
    closeTimerRef.current = null;

    if (typeof dialog.close === "function") {
      try {
        dialog.close();
        return;
      } catch {
        dialog.removeAttribute("open");
        return;
      }
    }

    dialog.removeAttribute("open");
  }

  function handleCancel(event: React.SyntheticEvent<HTMLDialogElement>) {
    event.preventDefault();
    closeDialog();
  }

  function handleDialogClick(event: React.MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) {
      closeDialog();
    }
  }

  return (
    <>
      <button
        aria-label={`${triggerLabel} for ${title}`}
        className="portfolio-project-detail-link"
        onClick={openDialog}
        type="button"
      >
        {triggerLabel}
      </button>

      <dialog
        aria-labelledby={titleId}
        className="portfolio-project-dialog"
        onCancel={handleCancel}
        onClick={handleDialogClick}
        ref={dialogRef}
      >
        <div className="portfolio-project-dialog__surface">
          <div className="portfolio-project-dialog__header">
            <div>
              <p className="portfolio-project-dialog__eyebrow">{eyebrow}</p>
              <h3 id={titleId}>{title}</h3>
            </div>
            <button
              aria-label={`Close ${title} details`}
              className="portfolio-project-dialog__close"
              onClick={closeDialog}
              type="button"
            >
              <X aria-hidden="true" />
            </button>
          </div>
          <p className="portfolio-project-dialog__description">{description}</p>
          <div className="portfolio-project-dialog__body">{children}</div>
        </div>
      </dialog>
    </>
  );
}

export { ProjectDetailDialog, type ProjectDetailDialogProps };
