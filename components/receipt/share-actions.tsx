"use client";

import { useState } from "react";
import { Check, Copy, Download, Share2 } from "lucide-react";

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("copy unavailable");
}

export function ShareActions({
  receiptId,
  title,
}: {
  receiptId: string;
  title: string;
}) {
  const [status, setStatus] = useState("");

  function currentUrl() {
    return `${window.location.origin}/receipt/${encodeURIComponent(receiptId)}`;
  }

  async function copyLink() {
    try {
      await copyText(currentUrl());
      setStatus("Receipt link copied.");
    } catch {
      setStatus("Copying is unavailable in this browser. You can copy the address from the address bar.");
    }
  }

  async function shareReceipt() {
    if (!navigator.share) {
      await copyLink();
      return;
    }

    try {
      await navigator.share({
        title: `Public Receipt — ${receiptId}`,
        text: `${title} — source-backed public budget record.`,
        url: currentUrl(),
      });
      setStatus("Receipt shared.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setStatus("Sharing cancelled.");
        return;
      }
      await copyLink();
    }
  }

  return (
    <div className="mt-7">
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--foreground)] px-5 text-sm font-semibold text-white"
          onClick={shareReceipt}
          type="button"
        >
          <Share2 aria-hidden="true" className="size-4" /> Share
        </button>
        <button
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-white px-5 text-sm font-semibold"
          onClick={copyLink}
          type="button"
        >
          {status === "Receipt link copied." ? <Check aria-hidden="true" className="size-4" /> : <Copy aria-hidden="true" className="size-4" />}
          Copy link
        </button>
        <a
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-white px-5 text-sm font-semibold"
          download={`${receiptId}.png`}
          href={`/api/receipt/${receiptId}/card`}
        >
          <Download aria-hidden="true" className="size-4" /> Download card
        </a>
      </div>
      <p aria-live="polite" className="mt-3 min-h-6 text-sm text-[var(--muted)]" role="status">
        {status}
      </p>
    </div>
  );
}
