import { TimePeriod, ComparisonOption } from './types'

export const DEFAULT_TIME_PERIODS: TimePeriod[] = [
  'day',
  '7d',
  '14d',
  '30d',
  'lastMonth',
  'thisMonth',
  '12mo',
  'custom',
]

export const DEFAULT_COMPARISON_OPTIONS: ComparisonOption[] = [
  'previousPeriod',
  'sameLastYear',
  'custom',
]

export const TIME_PERIOD_LABELS: Record<string, string> = {
  day: 'Today',
  '7d': 'Last 7 days',
  '14d': 'Last 14 days',
  '30d': 'Last 30 days',
  lastMonth: 'Last month',
  thisMonth: 'This month',
  '12mo': 'Last 12 months',
  custom: 'Custom',
}

export const COMPARISON_LABELS: Record<ComparisonOption, string> = {
  previousPeriod: 'Previous period',
  sameLastYear: 'Same period last year',
  custom: 'Custom comparison',
}

// Provider-specific period mappings
export const PROVIDER_PERIOD_MAPPINGS = {
  plausible: {
    day: 'day',
    '7d': '7d',
    '14d': '14d',
    '30d': '30d',
    lastMonth: 'month',
    thisMonth: 'month',
    '12mo': '12mo',
  },
  umami: {
    day: '24h',
    '7d': '7d',
    '14d': '14d',
    '30d': '30d',
    lastMonth: '1m',
    thisMonth: '1m',
    '12mo': '12m',
  },
  matomo: {
    day: 'day',
    '7d': 'week',
    '14d': 'range',
    '30d': 'month',
    lastMonth: 'month',
    thisMonth: 'month',
    '12mo': 'year',
  },
  posthog: {
    day: 'day',
    '7d': '7d',
    '14d': '14d',
    '30d': '30d',
    lastMonth: 'month',
    thisMonth: 'month',
    '12mo': '12mo',
  },
  'google-analytics': {
    day: 'day',
    '7d': '7d',
    '14d': '14d',
    '30d': '30d',
    lastMonth: 'lastMonth',
    thisMonth: 'thisMonth',
    '12mo': '12mo',
  },
}

// Helper function to map time periods to provider-specific formats
export function mapTimePeriodToProvider(period: string, provider: string): string {
  const mappings = PROVIDER_PERIOD_MAPPINGS[provider as keyof typeof PROVIDER_PERIOD_MAPPINGS]
  if (!mappings) return period
  
  // If it's a known period, use the mapping
  if (period in mappings) {
    return mappings[period as keyof typeof mappings]
  }
  
  // Otherwise, pass through as-is (for custom provider-specific periods)
  return period
}