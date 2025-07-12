import { TimePeriod, ComparisonOption } from './types'

export const DEFAULT_TIME_PERIODS: TimePeriod[] = [
  'day',
  '7d',
  '30d',
  'month',
  '6mo',
  '12mo',
  'all',
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
  month: 'Month to date',
  '6mo': 'Last 6 months',
  '12mo': 'Last 12 months',
  lastMonth: 'Last month',
  thisMonth: 'This month',
  year: 'Year to date',
  lastYear: 'Last year',
  thisYear: 'This year',
  all: 'All time',
  custom: 'Custom date',
}

export const COMPARISON_LABELS: Record<ComparisonOption, string> = {
  previousPeriod: 'Previous period',
  sameLastYear: 'Same period last year',
  custom: 'Custom comparison',
}

// Provider-specific period mappings
// Note: Some providers (Umami, PostHog) convert these to date ranges internally
export const PROVIDER_PERIOD_MAPPINGS = {
  plausible: {
    // Plausible accepts these period strings directly
    day: 'day',
    '7d': '7d',
    '14d': '14d',
    '30d': '30d',
    month: 'month',
    '6mo': '6mo',
    '12mo': '12mo',
    lastMonth: 'custom', // Will need special handling
    thisMonth: 'month',
    year: 'custom', // Will need special handling
    lastYear: 'custom', // Will need special handling
    thisYear: 'custom', // Will need special handling
    all: 'custom', // Will need special handling
  },
  umami: {
    // Umami uses timestamps, these are used for calculations
    day: '24h',
    '7d': '7d',
    '14d': '14d',
    '30d': '30d',
    month: 'month',
    '6mo': '6mo',
    '12mo': '12mo',
    lastMonth: 'lastMonth',
    thisMonth: 'month',
    year: 'year',
    lastYear: 'lastYear',
    thisYear: 'year',
    all: 'all',
  },
  matomo: {
    // Matomo period types
    day: 'day',
    '7d': 'range', // Needs date calculation
    '14d': 'range', // Needs date calculation
    '30d': 'range', // Needs date calculation
    month: 'month',
    '6mo': 'range', // Needs date calculation
    '12mo': 'year',
    lastMonth: 'range', // Needs date calculation
    thisMonth: 'month',
    year: 'year',
    lastYear: 'range', // Needs date calculation
    thisYear: 'year',
    all: 'range', // Needs date calculation
  },
  posthog: {
    // PostHog uses date ranges, these are used for calculations
    day: 'day',
    '7d': '7d',
    '14d': '14d',
    '30d': '30d',
    month: 'month',
    '6mo': '6mo',
    '12mo': '12mo',
    lastMonth: 'lastMonth',
    thisMonth: 'month',
    year: 'year',
    lastYear: 'lastYear',
    thisYear: 'year',
    all: 'all',
  },
  'google-analytics': {
    // GA4 relative date formats
    day: 'today',
    '7d': '7daysAgo',
    '14d': '14daysAgo',
    '30d': '30daysAgo',
    month: 'custom', // Needs date calculation for month-to-date
    '6mo': '180daysAgo',
    '12mo': '365daysAgo',
    lastMonth: 'custom', // Needs date calculation
    thisMonth: 'custom', // Needs date calculation for month-to-date
    year: 'custom', // Needs date calculation for year-to-date
    lastYear: 'custom', // Needs date calculation
    thisYear: 'custom', // Needs date calculation for year-to-date
    all: '1095daysAgo', // 3 years of data (GA4 default retention)
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