import { useEffect, useRef, type ReactNode } from "react";

export function Sheet({
  title,
  onClose,
  children,
  wide = false
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement;
    dialog?.showModal();
    return () => {
      dialog?.close();
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`sheet ${wide ? "sheet-wide" : ""}`}
      aria-label={title}
      onCancel={onClose}
    >
      <header className="sheet-heading">
        <div>
          <span className="eyebrow">TIMELINES / WORKSPACE</span>
          <h2>{title}</h2>
        </div>
        <button
          onClick={onClose}
          aria-label="Close panel"
          className="icon-button"
        >
          ×
        </button>
      </header>
      <div className="sheet-content">{children}</div>
    </dialog>
  );
}
