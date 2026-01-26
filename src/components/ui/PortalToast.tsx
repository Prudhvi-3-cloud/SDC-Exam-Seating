"use client";

export default function PortalToast({
  message,
  tone = "success",
  onClose,
}: {
  message: string | null;
  tone?: "success" | "error";
  onClose: () => void;
}) {
  if (!message) {
    return null;
  }

  return (
    <div className={`toast ${tone === "error" ? "toast-error" : "toast-success"}`} role="status">
      <span>{message}</span>
      <button type="button" onClick={onClose} aria-label="Close notification">
        x
      </button>
    </div>
  );
}
