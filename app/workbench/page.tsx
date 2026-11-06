"use client";

import { useState, useCallback, useEffect, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ToggleButton, ToggleButtonGroup, Typography } from "@heroui/react";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import Filters from "./filters";
import ResultList from "./result-list";
import SummaryCard from "./summary-card";
import type {
  SearchResult,
  SearchError,
  SearchStats,
  Summary,
} from "@/lib/types";

const MapView = dynamic(() => import("./map-view"), {
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

export default function WorkbenchPage() {
  return (
    <Suspense fallback={<div className="app-loading">Loading...</div>}>
      <WorkbenchContent />
    </Suspense>
  );
}

function EmptyWorkbench() {
  return (
    <div className="app-container">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Navbar />
      <main className="workbench-empty" id="main-content">
        <span className="home-kicker">Workbench</span>
        <Typography className="workbench-empty-title" type="h1">
          Point it at a place.
        </Typography>
        <p className="workbench-empty-sub">
          One query opens the map, the result list, and an optional aggregate
          summary. No account, no install.
        </p>
        <div className="workbench-empty-search">
          <SearchBar
            navigateTo="/workbench"
            placeholder="e.g. wind farms near Copenhagen radius:120"
            shortcut
            variant="hero"
          />
        </div>
      </main>
    </div>
  );
}

function WorkbenchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentQuery, setCurrentQuery] = useState<string>("");

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
        router.push(`/workbench?${params.toString()}`, { scroll: false });
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
        setCurrentQuery(sanitized);
        handleSearch(sanitized, false);
      }
    }
  }, [searchParams, handleSearch]);

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

  const handleRadiusCommit = useCallback(
    (radiusKm: number) => {
      const stripped = currentQuery
        .replace(/\bradius:\s*\d+(?:\.\d+)?/i, "")
        .trim();
      handleSearch(`${stripped} radius:${radiusKm}`);
    },
    [currentQuery, handleSearch],
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

  if (!currentQuery) {
    return <EmptyWorkbench />;
  }

  return (
    <div className="app-container">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Navbar />

      <div className="workbench-search">
        <SearchBar
          key={currentQuery}
          ariaLabel="Search infrastructure"
          initialValue={currentQuery}
          loading={loading}
          onSearch={handleSearch}
          placeholder="Search infrastructure…"
          variant="workbench"
        />
      </div>

      {error && (
        <div className="error-banner" role="alert">
          <svg className="error-icon" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
          <button
            type="button"
            className="error-dismiss"
            onClick={() => setError(null)}
            aria-label="Dismiss error"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
      )}

      <main
        className="app-main"
        id="main-content"
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
            onRadiusCommit={handleRadiusCommit}
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

      <div className="mobile-nav" aria-label="Workbench panels">
        <ToggleButtonGroup
          disallowEmptySelection
          fullWidth
          onSelectionChange={(keys) => {
            const next = Array.from(keys)[0];
            if (next === "map" || next === "results" || next === "filters") {
              setMobileTab(next);
            }
          }}
          selectedKeys={[mobileTab]}
          selectionMode="single"
        >
          <ToggleButton id="map">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 shrink-0" aria-hidden="true">
              <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Map
          </ToggleButton>
          <ToggleButton id="results">
            <ToggleButtonGroup.Separator />
            Results{searchResult ? ` (${searchResult.stats.total})` : ""}
          </ToggleButton>
          <ToggleButton id="filters">
            <ToggleButtonGroup.Separator />
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="size-4 shrink-0" aria-hidden="true">
              <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </ToggleButton>
        </ToggleButtonGroup>
      </div>
    </div>
  );
}
