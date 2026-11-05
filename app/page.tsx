"use client";

import { useState, useCallback, useEffect, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ChevronLeft } from "lucide-react";
import Homepage from "@/components/Homepage";
import SmoothButton from "@/components/smoothui/smooth-button";
import { TabsRoot, TabsList, TabsTab, TabsIndicator } from "@/components/smoothui/tabs";
import Filters from "@/components/Filters";
import ResultList from "@/components/ResultList";
import SummaryCard from "@/components/SummaryCard";
import type {
  SearchResult,
  SearchError,
  SearchStats,
  Summary,
} from "@/lib/types";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => <div className="map-loading">Loading map...</div>,
});

type MobileTab = "map" | "results" | "filters";

function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<"mobile" | "desktop">("desktop");

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1024px)");
    const updateBreakpoint = () =>
      setBreakpoint(mediaQuery.matches ? "mobile" : "desktop");

    updateBreakpoint();
    mediaQuery.addEventListener("change", updateBreakpoint);
    return () => mediaQuery.removeEventListener("change", updateBreakpoint);
  }, []);

  return breakpoint;
}

function sanitizeQuery(query: string): string | null {
  const sanitized = query
    .trim()
    .slice(0, 500)
    .replace(/[\x00-\x1F\x7F]/g, "");
  return sanitized.length > 0 ? sanitized : null;
}

function compactSummaryStats(stats: SearchStats): SearchStats {
  const topEntries = (record: Record<string, number>, limit: number) =>
    Object.fromEntries(
      Object.entries(record)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit),
    );

  return {
    total: stats.total,
    types: topEntries(stats.types, 12),
    operators: topEntries(stats.operators, 12),
  };
}

export default function Home() {
  return (
    <Suspense fallback={<div className="app-loading">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentQuery, setCurrentQuery] = useState<string>("");
  const [initialQuery, setInitialQuery] = useState<string>("");

  const [summary, setSummary] = useState<Summary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summaryRetryKey, setSummaryRetryKey] = useState(0);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterOperator, setFilterOperator] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);

  const [mobileTab, setMobileTab] = useState<MobileTab>("map");
  const [resultsPanelWidth, setResultsPanelWidth] = useState<number>(400);
  const breakpoint = useBreakpoint();

  const isInitialMount = useRef(true);
  const lastUrlQuery = useRef<string | null>(null);
  const isResizing = useRef(false);
  const searchAbortControllerRef = useRef<AbortController | null>(null);
  const summaryAbortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (breakpoint === "mobile") {
      setMobileTab("map");
    }
  }, [breakpoint]);

  const handleSearch = useCallback(
    async (query: string, updateUrl = true) => {
      searchAbortControllerRef.current?.abort();
      summaryAbortControllerRef.current?.abort();
      const controller = new AbortController();
      searchAbortControllerRef.current = controller;

      setLoading(true);
      setError(null);
      setSelectedId(null);
      setFilterOperator(null);
      setFilterType(null);
      setCurrentQuery(query);
      setSearchResult(null);
      setSummary(null);
      setSummaryError(null);
      setSummaryLoading(false);

      if (updateUrl) {
        lastUrlQuery.current = query;
        const params = new URLSearchParams();
        params.set("q", query);
        router.push(`?${params.toString()}`, { scroll: false });
      }

      try {
        const response = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
          signal: controller.signal,
        });

        const contentType = response.headers.get("content-type") || "";
        const data = contentType.includes("application/json")
          ? await response.json()
          : null;
        if (controller.signal.aborted) return;

        if (!response.ok || !data) {
          setError(
            data && typeof data.error === "string"
              ? (data as SearchError).error
              : "Search service timed out or unavailable. Try a smaller area.",
          );
          setSearchResult(null);
        } else {
          setSearchResult(data as SearchResult);
          setError(null);
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        setError("Network error. Please check your connection.");
        setSearchResult(null);
      } finally {
        if (searchAbortControllerRef.current === controller) {
          setLoading(false);
        }
      }
    },
    [router],
  );

  useEffect(() => {
    const urlQuery = searchParams.get("q");

    if (urlQuery === lastUrlQuery.current && !isInitialMount.current) {
      return;
    }
    lastUrlQuery.current = urlQuery;
    isInitialMount.current = false;

    if (urlQuery) {
      const sanitized = sanitizeQuery(urlQuery);
      if (sanitized) {
        setInitialQuery(sanitized);
        handleSearch(sanitized, false);
      }
    }
  }, [searchParams, handleSearch]);

  const handleClear = useCallback(() => {
    setCurrentQuery("");
    setInitialQuery("");
    setSearchResult(null);
    setSelectedId(null);
    setError(null);
    setSummary(null);
    setSummaryError(null);
    setLoading(false);
    lastUrlQuery.current = null;
    router.replace(window.location.pathname, { scroll: false });
  }, [router]);

  useEffect(() => {
    if (!searchResult || !currentQuery) {
      setSummary(null);
      setSummaryLoading(false);
      setSummaryError(null);
      return;
    }

    summaryAbortControllerRef.current?.abort();
    const controller = new AbortController();
    summaryAbortControllerRef.current = controller;

    setSummary(null);
    setSummaryError(null);
    setSummaryLoading(true);

    const requestSummary = async () => {
      try {
        const response = await fetch("/api/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: currentQuery,
            stats: compactSummaryStats(searchResult.stats),
            truncated: searchResult.truncated,
            warning: searchResult.warning,
          }),
          signal: controller.signal,
        });

        const contentType = response.headers.get("content-type") || "";
        const data = contentType.includes("application/json")
          ? await response.json()
          : null;
        if (controller.signal.aborted) return;

        if (!response.ok || !data) {
          setSummaryError(
            data && typeof data.error === "string"
              ? data.error
              : "Summary service unavailable. Search results are unaffected.",
          );
          return;
        }

        setSummary(data as Summary);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        setSummaryError("Could not generate a summary.");
      } finally {
        if (!controller.signal.aborted) {
          setSummaryLoading(false);
        }
      }
    };

    requestSummary();

    return () => controller.abort();
  }, [searchResult, currentQuery, summaryRetryKey]);

  const handleRetrySummary = useCallback(() => {
    setSummaryRetryKey((key) => key + 1);
  }, []);

  const handleSummaryFollowup = useCallback(
    (query: string) => {
      handleSearch(query);
    },
    [handleSearch],
  );

  const handleSelect = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";
  }, []);

  const handleResizeKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const step = e.shiftKey ? 32 : 16;

      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        const delta = e.key === "ArrowLeft" ? -step : step;
        setResultsPanelWidth((width) =>
          Math.max(250, Math.min(600, width + delta)),
        );
      } else if (e.key === "Home") {
        e.preventDefault();
        setResultsPanelWidth(250);
      } else if (e.key === "End") {
        e.preventDefault();
        setResultsPanelWidth(600);
      }
    },
    [],
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;

      const filtersWidth = 240;
      const newWidth = Math.max(250, Math.min(600, e.clientX - filtersWidth));
      setResultsPanelWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (isResizing.current) {
        isResizing.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const inWorkbench = Boolean(currentQuery);
  if (!inWorkbench) {
    return <Homepage onSearch={handleSearch} loading={loading} />;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <svg
              className="logo-mark"
              viewBox="0 0 64 64"
              aria-hidden="true"
              focusable="false"
            >
              <g stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.9">
                <line x1="32" y1="4" x2="32" y2="10" />
                <line x1="13" y1="13" x2="17.5" y2="17.5" />
                <line x1="51" y1="13" x2="46.5" y2="17.5" />
              </g>
              <path d="M26.5 22.5 L24.5 48 L39.5 48 L37.5 22.5 Z" fill="currentColor" opacity="0.9" />
              <rect x="25.5" y="14.5" width="13" height="6.5" rx="1.5" fill="var(--accent)" stroke="none" />
            </svg>
            <span className="logo-text">Lighthouse</span>
          </div>

          <div className="search-container" style={{ flex: 1, maxWidth: 620 }}>
            <input
              className="search-input"
              type="text"
              placeholder="Search OpenStreetMap…"
              value={initialQuery}
              onChange={(e) => setInitialQuery(e.target.value)}
              onSubmit={(e) => {
                e.preventDefault();
                const q = sanitizeQuery(e.currentTarget.value);
                if (q) handleSearch(q);
              }}
              disabled={loading}
            />
            <button
              type="button"
              className="search-button"
              disabled={loading}
              onClick={() => {
                const q = sanitizeQuery(initialQuery);
                if (q) handleSearch(q);
              }}
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
                <circle cx="10" cy="10" r="7" />
                <line x1="16" y1="16" x2="18" y2="18" />
              </svg>
              Search
            </button>
          </div>

          <div className="header-meta">
            <SmoothButton
              type="button"
              variant="soft"
              color="neutral"
              size="sm"
              className="header-new-search"
              onClick={handleClear}
              disabled={loading}
              prefix={<ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />}
            >
              <span className="header-new-search-text">New search</span>
            </SmoothButton>
            <a
              href="https://github.com/Aviox8/lighthouse"
              target="_blank"
              rel="noopener noreferrer"
              className="header-link"
              aria-label="Source code and documentation on GitHub"
            >
              <svg
                className="header-link-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M12 .5A12 12 0 0 0 0 12.67c0 5.36 3.44 9.9 8.21 11.5.6.12.82-.27.82-.6v-2.2c-3.34.75-4.05-1.42-4.05-1.42-.55-1.43-1.34-1.81-1.34-1.81-1.09-.77.08-.75.08-.75 1.2.09 1.84 1.26 1.84 1.26 1.07 1.88 2.82 1.34 3.51 1.02.11-.8.42-1.34.77-1.65-2.67-.31-5.47-1.38-5.47-6.15 0-1.36.47-2.47 1.25-3.34-.13-.31-.54-1.57.12-3.25 0 0 1.01-.33 3.32 1.27a11.18 11.18 0 0 1 6.05 0c2.31-1.6 3.32-1.27 3.32-1.27.66 1.68.25 2.94.12 3.25.78.87 1.25 1.98 1.25 3.34 0 4.78-2.8 5.83-5.48 6.14.43.38.82 1.13.83 2.28v3.38c0 .34.22.74.83.61A12.03 12.03 0 0 0 24 12.67 12 12 0 0 0 12 .5Z"
                />
              </svg>
              <span className="header-link-text">
                Source Code & Documentation
              </span>
            </a>
          </div>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          <svg className="error-icon" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <main
        className="app-main"
        style={{
          gridTemplateColumns: breakpoint === "desktop"
            ? `240px ${resultsPanelWidth}px 1fr`
            : undefined,
        }}
      >
        <div className={`panel-filters ${mobileTab === "filters" ? "mobile-active" : ""}`}>
          <Filters
            searchResult={searchResult}
            selectedOperator={filterOperator}
            selectedType={filterType}
            onOperatorChange={setFilterOperator}
            onTypeChange={setFilterType}
          />
        </div>

        <div className={`panel-results ${mobileTab === "results" ? "mobile-active" : ""}`}>
          <div className="results-host">
            <SummaryCard
              summary={summary}
              loading={summaryLoading}
              error={summaryError}
              onRetry={handleRetrySummary}
              onFollowup={handleSummaryFollowup}
            />
            <ResultList
              results={searchResult?.results || []}
              selectedId={selectedId}
              onSelect={handleSelect}
              filterOperator={filterOperator}
              filterType={filterType}
              truncated={searchResult?.truncated}
              loading={loading}
            />
          </div>
          {breakpoint === "desktop" && (
            <div
              className="resize-handle"
              onMouseDown={handleResizeStart}
              onKeyDown={handleResizeKeyDown}
              role="separator"
              aria-orientation="vertical"
              aria-valuenow={resultsPanelWidth || 0}
              aria-valuemin={250}
              aria-valuemax={600}
              aria-label="Resize results panel (arrow keys)"
              tabIndex={0}
            />
          )}
        </div>

        <div className={`panel-map ${mobileTab === "map" ? "mobile-active" : ""}`}>
          <MapView
            results={searchResult?.results || []}
            bounds={searchResult?.bounds || null}
            selectedId={selectedId}
            onSelect={handleSelect}
            filterOperator={filterOperator}
            filterType={filterType}
            loading={loading}
          />
        </div>
      </main>

      <div className="mobile-nav" aria-label="Panels">
        <TabsRoot value={mobileTab} onValueChange={(v) => setMobileTab(v as MobileTab)}>
          <TabsList variant="segment" className="border border-primary bg-[var(--bg-elevated)] rounded-xl p-1">
            <TabsTab value="map">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 shrink-0" aria-hidden="true">
                <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Map
            </TabsTab>
            <TabsTab value="results">
              Results{searchResult ? ` (${searchResult.stats.total})` : ""}
            </TabsTab>
            <TabsTab value="filters">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="size-4 shrink-0" aria-hidden="true">
                <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </TabsTab>
            <TabsIndicator />
          </TabsList>
        </TabsRoot>
      </div>
    </div>
  );
}
