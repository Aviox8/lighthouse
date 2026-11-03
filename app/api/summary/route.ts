import { createHash } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import {
  generateSummary,
  getSummaryCacheKey,
  isAiConfigured,
  type SummaryInput,
} from '@/lib/summary';
import type { Summary } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const MAX_BODY_BYTES = 32_768;
const DEFAULT_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const MAX_CACHE_ENTRIES = 200;

interface CacheEntry {
  summary: Summary;
  expiresAt: number;
}

interface RateBucket {
  windowStart: number;
  count: number;
}

type RateLimitResult =
  | { allowed: true }
  | { allowed: false; reason: 'minute' | 'daily' };

const summaryCache = new Map<string, CacheEntry>();
const inFlightSummaries = new Map<string, Promise<Summary>>();
const rateBuckets = new Map<string, RateBucket>();
let dailyCounter = { day: '', count: 0 };

function envInt(name: string, fallback: number, min: number, max: number): number {
  const parsed = Number.parseInt(process.env[name] || '', 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

function text(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .trim()
    .slice(0, maxLength);
}

const UNSAFE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function sanitizeCounts(value: unknown): Record<string, number> {
  const result = Object.create(null) as Record<string, number>;
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return result;
  }

  for (const [rawKey, rawCount] of Object.entries(value).slice(0, 40)) {
    const key = text(rawKey, 100);
    const count = Number(rawCount);
    if (!key || UNSAFE_KEYS.has(key) || !Number.isFinite(count) || count < 0) {
      continue;
    }
    result[key] = Math.min(Math.trunc(count), 10_000_000);
  }

  return result;
}

function parseSummaryInput(body: unknown): SummaryInput | null {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const payload = body as Record<string, unknown>;

  const query = text(payload.query, 500);
  if (!query) return null;

  const stats =
    payload.stats && typeof payload.stats === 'object' && !Array.isArray(payload.stats)
      ? (payload.stats as Record<string, unknown>)
      : null;
  if (!stats) return null;

  const total = Number(stats.total);
  if (!Number.isFinite(total) || total < 0) return null;

  return {
    query,
    stats: {
      total: Math.min(Math.trunc(total), 10_000_000),
      types: sanitizeCounts(stats.types),
      operators: sanitizeCounts(stats.operators),
    },
    truncated: payload.truncated === true,
    warning: text(payload.warning, 300) || undefined,
  };
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }

  return request.headers.get('x-real-ip')?.trim() || 'unknown';
}

function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const perMinuteLimit = envInt('SUMMARY_RATE_LIMIT_PER_MINUTE', 6, 1, 100);
  const dailyLimit = envInt('SUMMARY_DAILY_LIMIT', 40, 1, 1000);
  const day = new Date(now).toISOString().slice(0, 10);

  let bucket = rateBuckets.get(ip);
  if (!bucket || now - bucket.windowStart >= 60_000) {
    bucket = { windowStart: now, count: 0 };
    rateBuckets.set(ip, bucket);
  }

  if (bucket.count >= perMinuteLimit) {
    return { allowed: false, reason: 'minute' };
  }

  if (dailyCounter.day !== day) {
    dailyCounter = { day, count: 0 };
  }

  if (dailyCounter.count >= dailyLimit) {
    return { allowed: false, reason: 'daily' };
  }

  bucket.count += 1;
  dailyCounter.count += 1;

  if (rateBuckets.size > 2000) {
    for (const [key, value] of rateBuckets) {
      if (now - value.windowStart >= 120_000) {
        rateBuckets.delete(key);
      }
    }
  }

  return { allowed: true };
}

function getCachedSummary(key: string): Summary | null {
  const entry = summaryCache.get(key);
  if (!entry) return null;

  if (entry.expiresAt <= Date.now()) {
    summaryCache.delete(key);
    return null;
  }

  return entry.summary;
}

function cacheSummary(key: string, summary: Summary): void {
  if (summary.provider === 'local') return;

  const ttl = envInt(
    'SUMMARY_CACHE_TTL_MS',
    DEFAULT_CACHE_TTL_MS,
    60_000,
    24 * 60 * 60 * 1000,
  );
  summaryCache.set(key, {
    summary,
    expiresAt: Date.now() + ttl,
  });

  if (summaryCache.size > MAX_CACHE_ENTRIES) {
    const oldestKey = summaryCache.keys().next().value;
    if (oldestKey) summaryCache.delete(oldestKey);
  }
}

function summaryResponse(summary: Summary, cached: boolean, status = 200) {
  return NextResponse.json(
    { ...summary, cached },
    {
      status,
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 415 },
      );
    }

    const contentLength = Number.parseInt(
      request.headers.get('content-length') || '0',
      10,
    );
    if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: 'Request body is too large' },
        { status: 413 },
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 },
      );
    }

    const input = parseSummaryInput(body);
    if (!input) {
      return NextResponse.json(
        { error: 'Invalid summary payload' },
        { status: 400 },
      );
    }

    const cacheKey = createHash('sha256')
      .update(getSummaryCacheKey(input))
      .digest('hex');

    const cached = getCachedSummary(cacheKey);
    if (cached) {
      return summaryResponse(cached, true);
    }

    if (!isAiConfigured()) {
      const summary = await generateSummary(input, { allowAi: false });
      return summaryResponse(summary, false);
    }

    const existing = inFlightSummaries.get(cacheKey);
    if (existing) {
      const summary = await existing;
      return summaryResponse(summary, false);
    }

    const limit = checkRateLimit(getClientIp(request));
    if (!limit.allowed) {
      console.warn(`[summary] rate limited (${limit.reason}); serving local fallback`);
      const notice =
        limit.reason === 'daily'
          ? 'Daily AI summary limit reached; showing a local summary.'
          : 'AI summary rate limit reached; showing a local summary.';
      const summary = await generateSummary(input, {
        allowAi: false,
        localNotice: notice,
      });
      return summaryResponse(summary, false);
    }

    const summaryPromise = generateSummary(input, { allowAi: true })
      .then((summary) => {
        cacheSummary(cacheKey, summary);
        return summary;
      })
      .finally(() => {
        inFlightSummaries.delete(cacheKey);
      });

    inFlightSummaries.set(cacheKey, summaryPromise);
    const summary = await summaryPromise;
    return summaryResponse(summary, false);
  } catch (error) {
    console.error(
      'Summary API error:',
      error instanceof Error ? error.message : 'unknown error',
    );
    return NextResponse.json(
      { error: 'Summary generation failed' },
      { status: 500 },
    );
  }
}
