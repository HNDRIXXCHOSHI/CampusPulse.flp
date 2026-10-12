"use client";
import { useEffect, useRef } from "react";
/** Keep keyboard navigation inside the active dialog and restore focus on close. */
export function useDialog(open: boolean, close: () => void, busy = false) {
  const action = useRef({ close, busy });
  useEffect(() => {
    action.current = { close, busy };
  }, [close, busy]);
  useEffect(() => {
    if (!open) return;
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
    if (!dialog) return;
    const previous = document.activeElement as HTMLElement | null;
    const targets = () =>
      Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not(:disabled), a[href], input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex="0"]',
        ),
      ).filter((e) => e.getClientRects().length > 0);
    targets()[0]?.focus();
    const handle = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !action.current.busy) {
        event.preventDefault();
        action.current.close();
      }
      if (event.key !== "Tab") return;
      const items = targets(),
        first = items[0],
        last = items[items.length - 1];
      if (!first) {
        event.preventDefault();
        return;
      }
      if (
        event.shiftKey &&
        (document.activeElement === first || !dialog.contains(document.activeElement))
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last || !dialog.contains(document.activeElement))
      ) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handle);
    return () => {
      document.removeEventListener("keydown", handle);
      if (previous?.isConnected) previous.focus();
    };
  }, [open]);
}
