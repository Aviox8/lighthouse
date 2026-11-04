"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ASSET_TYPE_MAP } from "@/lib/types";

interface TypeEntry {
  key: string;
  label: string;
}

const COPY_FEEDBACK_MS = 1500;

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for insecure contexts: hidden textarea + execCommand.
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(textarea);
      return ok;
    } catch {
      return false;
    }
  }
}

export default function TypesCatalog() {
  const [query, setQuery] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  const entries = useMemo<TypeEntry[]>(
    () =>
      Object.entries(ASSET_TYPE_MAP)
        .map(([key, value]) => ({ key, label: value.label }))
        .sort((a, b) => a.label.localeCompare(b.label) || a.key.localeCompare(b.key)),
    [],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (entry) =>
        entry.label.toLowerCase().includes(q) || entry.key.toLowerCase().includes(q),
    );
  }, [entries, query]);

  const handleCopy = (key: string) => {
    copyToClipboard(`type:${key}`).then((ok) => {
      if (!ok) return;
      setCopiedKey(key);
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = setTimeout(() => setCopiedKey(null), COPY_FEEDBACK_MS);
    });
  };

  return (
    <div className="types-catalog">
      <div className="types-toolbar">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter types, e.g. tower, power, hospital…"
          className="types-search-input"
          aria-label="Filter asset types"
        />
        <span className="types-count" aria-live="polite">
          {visible.length.toLocaleString()} of {entries.length.toLocaleString()}
        </span>
      </div>

      <p className="types-hint">
        Click any type to copy <code>type:key</code>. Paste it into search and add a scope — e.g.{" "}
        <code>type:wind near:copenhagen</code>.
      </p>

      {visible.length === 0 ? (
        <p className="types-empty">No types match &ldquo;{query}&rdquo;.</p>
      ) : (
        <div className="types-grid" role="list">
          {visible.map((entry) => (
            <button
              key={entry.key}
              type="button"
              role="listitem"
              className={`type-item ${copiedKey === entry.key ? "copied" : ""}`}
              onClick={() => handleCopy(entry.key)}
            >
              <span className="type-item-label">
                {copiedKey === entry.key ? "Copied ✓" : entry.label}
              </span>
              <span className="type-item-key">type:{entry.key}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
