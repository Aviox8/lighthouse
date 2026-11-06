"use client";

import { useCallback, useMemo, useState } from "react";
import { SearchField } from "@heroui/react";
import { ASSET_TYPE_MAP } from "@/lib/types";

/**
 * Searchable catalog of every asset type Lighthouse can query. Clicking a
 * type copies its structured `type:` token to the clipboard (type keys are
 * not valid standalone queries — validateQuery requires a geographic scope —
 * so the catalog hands you the token to compose with).
 */

const COPIED_RESET_MS = 1500;

export default function TypesCatalog() {
  const [search, setSearch] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const entries = useMemo(() => {
    const all = Object.entries(ASSET_TYPE_MAP).sort(([a], [b]) =>
      a.localeCompare(b),
    );
    const needle = search.trim().toLowerCase();
    if (!needle) return all;
    return all.filter(
      ([key, config]) =>
        key.toLowerCase().includes(needle) ||
        config.label.toLowerCase().includes(needle),
    );
  }, [search]);

  const handleCopy = useCallback((key: string) => {
    const token = `type:${key}`;
    const copy = navigator.clipboard?.writeText?.(token);
    if (copy) {
      copy.then(() => {
        setCopiedKey(key);
        window.setTimeout(() => {
          setCopiedKey((current) => (current === key ? null : current));
        }, COPIED_RESET_MS);
      });
    }
  }, []);

  return (
    <div aria-label="Asset type catalog">
      <div className="types-toolbar">
        <SearchField
          aria-label="Filter asset types"
          className="types-search"
          fullWidth
          name="type-filter"
          onChange={setSearch}
          value={search}
          variant="secondary"
        >
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input
              autoComplete="off"
              placeholder="Filter types — try “tower”, “hospital”, “substation”…"
              spellCheck={false}
            />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
        <span className="types-count" aria-live="polite">
          {entries.length} / {Object.keys(ASSET_TYPE_MAP).length} types
        </span>
      </div>

      <p className="types-hint">
        Click any type to copy its <code>type:</code> token, then add a scope —{" "}
        <code>type:wind near:copenhagen</code> or{" "}
        <code>type:hospital region:karnataka</code>.
      </p>

      {entries.length === 0 ? (
        <p className="types-empty">
          No types match &ldquo;{search}&rdquo;. Try a shorter fragment.
        </p>
      ) : (
        <div className="types-grid">
          {entries.map(([key, config]) => {
            const copied = copiedKey === key;
            return (
              <button
                key={key}
                type="button"
                className={`type-item${copied ? " copied" : ""}`}
                onClick={() => handleCopy(key)}
                title={`Copy type:${key}`}
                aria-label={`Copy type:${key} to clipboard`}
              >
                <span className="type-item-label">
                  {copied ? "Copied ✓" : config.label}
                </span>
                <span className="type-item-key">type:{key}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
