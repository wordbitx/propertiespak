"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";

/** Native top-layer dialog: focus is trapped by the browser, never by z-index tricks. */
export function NavigationDialog({
  label,
  onDismiss,
  children,
  className = "",
  triggerRef,
}: {
  label: string;
  onDismiss: () => void;
  children: ReactNode;
  className?: string;
  triggerRef?: RefObject<HTMLElement | null>;
}) {
  const ref = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const trigger = triggerRef?.current ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    dialog.querySelector<HTMLElement>("[data-dialog-initial]")?.focus({ preventScroll: true });
    return () => {
      if (dialog.open) dialog.close();
      document.body.style.overflow = previousOverflow;
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, [triggerRef]);

  return (
    <dialog
      ref={ref}
      className={`navigation-dialog ${className}`}
      aria-label={label}
      aria-modal="true"
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        // Native modality keeps the page inert. Explicit end-point wrapping
        // also avoids Chrome's transient document.body focus on short sheets.
        const controls = [...event.currentTarget.querySelectorAll<HTMLElement>(
          'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
        )].filter((element) => element.getClientRects().length > 0 && !element.closest('[inert], [aria-hidden="true"]'));
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }}
      onCancel={(event) => {
        event.preventDefault();
        onDismiss();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onDismiss();
      }}
    >
      {children}
    </dialog>
  );
}
