"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type RefObject,
} from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button, InputGroup, Kbd, Spinner, TextField } from "@heroui/react";

interface SearchBarProps {
  /** Called when a query is submitted. Ignored when `navigateTo` is set. */
  onSearch?: (query: string) => void;
  /**
   * When set, submitting routes to `${navigateTo}?q=…` instead of calling
   * `onSearch` — used by server-rendered pages that hand off to the workbench.
   */
  navigateTo?: string;
  loading?: boolean;
  inputRef?: RefObject<HTMLInputElement | null>;
  initialValue?: string;
  placeholder?: string;
  ariaLabel?: string;
  variant?: "hero" | "cta" | "workbench";
  kbdHint?: boolean;
  /** Register `/` and Cmd/Ctrl+K to focus the field. */
  shortcut?: boolean;
}

/**
 * Shared query field for the homepage, the closing CTA, and the workbench.
 * It is a real form: Enter submits, the button submits, and the HeroUI input
 * group keeps the focus ring and clear affordances consistent across the site.
 */
export default function SearchBar({
  onSearch,
  navigateTo,
  loading = false,
  inputRef,
  initialValue = "",
  placeholder = "e.g. cell towers in Berlin radius:40",
  ariaLabel = "Search infrastructure",
  variant = "hero",
  kbdHint = false,
  shortcut = false,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialValue);
  const internalRef = useRef<HTMLInputElement | null>(null);
  const fieldRef = inputRef ?? internalRef;

  const submit = useCallback(() => {
    const q = query.trim();
    if (!q || loading) return;
    if (navigateTo) {
      router.push(`${navigateTo}?q=${encodeURIComponent(q)}`);
      return;
    }
    onSearch?.(q);
  }, [query, loading, navigateTo, onSearch, router]);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      submit();
    },
    [submit],
  );

  // "/" and Cmd/Ctrl+K focus the field. Ignored while typing in an input.
  useEffect(() => {
    if (!shortcut) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      const isSlash = event.key === "/" && !isTyping;
      const isCmdK =
        (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (isSlash || isCmdK) {
        event.preventDefault();
        fieldRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcut, fieldRef]);

  return (
    <form
      className={`search-bar search-bar--${variant}`}
      onSubmit={handleSubmit}
      role="search"
    >
      <TextField
        aria-label={ariaLabel}
        className="search-bar-field"
        isDisabled={loading}
        name="query"
      >
        <InputGroup fullWidth variant="secondary">
          <InputGroup.Prefix>
            <Search aria-hidden="true" strokeWidth={2} />
          </InputGroup.Prefix>
          <InputGroup.Input
            ref={fieldRef}
            autoComplete="off"
            placeholder={placeholder}
            spellCheck={false}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {kbdHint && !loading ? (
            <InputGroup.Suffix>
              <Kbd aria-hidden="true" className="search-bar-kbd">
                <Kbd.Content>/</Kbd.Content>
              </Kbd>
            </InputGroup.Suffix>
          ) : null}
        </InputGroup>
      </TextField>

      <Button
        className="search-bar-submit"
        isDisabled={loading}
        size="lg"
        type="submit"
        variant="primary"
      >
        {loading ? (
          <>
            <Spinner aria-hidden="true" color="current" size="sm" />
            Searching
          </>
        ) : (
          "Search"
        )}
      </Button>
    </form>
  );
}
