import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createLocalSummary,
  generateSummary,
  getSummaryCacheKey,
  type SummaryInput,
} from '@/lib/summary';

const ENV_KEYS = [
  'OPENROUTER_API_KEY',
  'OPENROUTER_MODEL',
  'OLLAMA_API_KEY',
  'OLLAMA_BASE_URL',
  'OLLAMA_MODEL',
  'EXA_API_KEY',
  'EXA_SEARCH_TYPE',
  'EXA_NUM_RESULTS',
  'EXA_ANSWER_MODEL',
] as const;

const input: SummaryInput = {
  query: 'power plants in texas',
  stats: {
    total: 1234,
    types: { power_plant: 900, solar: 334 },
    operators: { 'Acme Power': 600, Unknown: 634 },
  },
  truncated: true,
};

const generatedFields = {
  headline: 'Texas power infrastructure',
  overview: 'The search returned a large set of power facilities across Texas.',
  observations: ['Natural gas dominates the tagged capacity.'],
  caveats: ['Counts reflect OpenStreetMap tagging, not official capacity.'],
  followups: ['solar farms in texas'],
};

function mockResponse(data: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  } as Response;
}

function chatResponse(content: unknown): Response {
  return mockResponse({
    choices: [{ message: { content: JSON.stringify(content) } }],
  });
}

function clearProviderEnv() {
  for (const key of ENV_KEYS) {
    vi.stubEnv(key, '');
  }
}

beforeEach(() => {
  clearProviderEnv();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('createLocalSummary', () => {
  it('uses only aggregate counts and flags truncation', () => {
    const summary = createLocalSummary(input);

    expect(summary.provider).toBe('local');
    expect(summary.fallback).toBe(true);
    expect(summary.headline).toContain('1,234 power plants');
    expect(summary.observations.join(' ')).toContain('5,000-feature limit');
    expect(summary.observations.join(' ')).not.toContain('Unknown');
    expect(summary.caveats.join(' ')).toContain('OpenStreetMap');
    expect(summary.caveats.join(' ')).toContain('operator tag');
  });

  it('uses singular labels for one matching feature', () => {
    const summary = createLocalSummary({
      query: 'airport in malta',
      stats: { total: 1, types: { aeroway: 1 }, operators: {} },
    });

    expect(summary.headline).toBe('1 airport in malta');
  });

  it('handles empty result sets', () => {
    const summary = createLocalSummary({
      query: 'in nowhere',
      stats: { total: 0, types: {}, operators: {} },
    });

    expect(summary.headline).toContain('No infrastructure features');
    expect(summary.overview).toContain('without matching');
  });
});

describe('generateSummary', () => {
  it('returns a local summary when no providers are configured', async () => {
    const summary = await generateSummary(input);
    expect(summary.provider).toBe('local');
    expect(summary.degraded).toBe(false);
  });

  it('uses OpenRouter when configured', async () => {
    vi.stubEnv('OPENROUTER_API_KEY', 'test-key');
    const fetchMock = vi.fn().mockResolvedValue(chatResponse(generatedFields));
    vi.stubGlobal('fetch', fetchMock);

    const summary = await generateSummary(input);

    expect(summary.provider).toBe('openrouter');
    expect(summary.headline).toBe(generatedFields.headline);
    expect(summary.groundingUsed).toBe(false);
    expect(summary.sources).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain('openrouter.ai');
  });

  it('adds Exa grounding context before calling the LLM', async () => {
    vi.stubEnv('OPENROUTER_API_KEY', 'test-key');
    vi.stubEnv('EXA_API_KEY', 'exa-key');
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        mockResponse({
          results: [
            {
              title: 'Texas grid overview',
              url: 'https://example.com/texas-grid',
              highlights: ['Texas has a large and diverse power sector.'],
            },
          ],
        }),
      )
      .mockResolvedValueOnce(chatResponse(generatedFields));
    vi.stubGlobal('fetch', fetchMock);

    const summary = await generateSummary(input);

    expect(summary.provider).toBe('openrouter');
    expect(summary.groundingUsed).toBe(true);
    expect(summary.sources[0].url).toBe('https://example.com/texas-grid');

    const llmBody = JSON.parse(fetchMock.mock.calls[1][1].body as string);
    expect(llmBody.messages[1].content).toContain('Texas grid overview');
  });

  it('falls back from OpenRouter to Ollama', async () => {
    vi.stubEnv('OPENROUTER_API_KEY', 'test-key');
    vi.stubEnv('OLLAMA_BASE_URL', 'http://localhost:11434');
    vi.stubEnv('OLLAMA_MODEL', 'llama3.2');
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(mockResponse({}, 500))
      .mockResolvedValueOnce(chatResponse(generatedFields));
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const summary = await generateSummary(input);

    expect(summary.provider).toBe('ollama');
    expect(summary.degraded).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('uses Exa Answer only after both LLM providers fail', async () => {
    vi.stubEnv('OPENROUTER_API_KEY', 'test-key');
    vi.stubEnv('OLLAMA_BASE_URL', 'http://localhost:11434');
    vi.stubEnv('OLLAMA_MODEL', 'llama3.2');
    vi.stubEnv('EXA_API_KEY', 'exa-key');
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(mockResponse({ results: [] }))
      .mockResolvedValueOnce(mockResponse({}, 503))
      .mockResolvedValueOnce(mockResponse({}, 503))
      .mockResolvedValueOnce(
        mockResponse({
          answer: generatedFields,
          citations: [
            {
              title: 'Example source',
              url: 'https://example.com/source',
            },
          ],
        }),
      );
    vi.stubGlobal('fetch', fetchMock);

    const summary = await generateSummary(input);

    expect(summary.provider).toBe('exa');
    expect(summary.sources).toHaveLength(1);
    expect(fetchMock.mock.calls[3][0]).toContain('/answer');
  });

  it('returns a degraded local summary when all providers fail', async () => {
    vi.stubEnv('OPENROUTER_API_KEY', 'test-key');
    vi.stubEnv('EXA_API_KEY', 'exa-key');
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(mockResponse({ results: [] }))
      .mockResolvedValueOnce(mockResponse({}, 500))
      .mockResolvedValueOnce(mockResponse({}, 500));
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const summary = await generateSummary(input);

    expect(summary.provider).toBe('local');
    expect(summary.degraded).toBe(true);
    expect(summary.caveats.join(' ')).toContain('AI providers were unavailable');
  });
});

describe('getSummaryCacheKey', () => {
  it('changes when aggregate stats change', () => {
    const first = getSummaryCacheKey(input);
    const second = getSummaryCacheKey({
      ...input,
      stats: { ...input.stats, total: 1 },
    });
    expect(first).not.toBe(second);
  });
});
