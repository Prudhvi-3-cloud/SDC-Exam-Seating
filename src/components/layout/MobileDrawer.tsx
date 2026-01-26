"use client";

import { useEffect } from "react";

export default function MobileDrawer({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="portal-drawer" role="dialog" aria-modal="true" aria-label="Portal navigation">
      <button
        type="button"
        className="portal-drawer-overlay"
        aria-label="Close navigation"
        onClick={onClose}
      />
      <div className="portal-drawer-panel">
        <button type="button" className="portal-drawer-close" onClick={onClose}>
          Close
        </button>
        <div style={{ marginTop: "1.5rem" }}>{children}</div>
      </div>
    </div>
  );
}
