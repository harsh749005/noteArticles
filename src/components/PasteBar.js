"use client";
import { useState } from "react";
import { looksLikeALink } from "@/lib/linkHelpers";

// The box you paste links into. On phones it floats at the bottom of the screen.
export default function PasteBar({ onSaveLink, onOpenSearch }) {
  const [typedLink, setTypedLink] = useState("");

  async function saveTheLink(link = typedLink) {
    const itWorked = await onSaveLink(link);
    if (itWorked) setTypedLink("");
  }

  // Pasting a link into the box saves it straight away: no extra click.
  function whenSomethingIsPasted(event) {
    const pastedText = event.clipboardData.getData("text");
    if (looksLikeALink(pastedText)) {
      event.preventDefault();
      saveTheLink(pastedText);
    }
  }

  async function pasteFromClipboardAndSave() {
    try {
      saveTheLink(await navigator.clipboard.readText());
    } catch {
      /* the browser blocked clipboard access; the person can paste by hand */
    }
  }

  return (
    <div className="paste">
      <input
        type="url"
        placeholder="Paste an article link and press Enter…"
        value={typedLink}
        onChange={(event) => setTypedLink(event.target.value)}
        onPaste={whenSomethingIsPasted}
        onKeyDown={(event) => event.key === "Enter" && saveTheLink()}
      />
      <button className="ghost" onClick={pasteFromClipboardAndSave}>Paste &amp; save</button>
      <button className="btn" onClick={() => saveTheLink()}>Save</button>
      <button className="fab" onClick={onOpenSearch} aria-label="Search articles">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </button>
    </div>
  );
}
