import type { Config } from 'payload'

export interface AnalyticsProvider {
  name: string
  getDashboardData: (period?: string) => Promise<DashboardData | null>
  trackEvent?: (eventName: string, props?: Record<string, any>) => void
}

export interface PlausibleConfig {
  apiKey?: string
  siteId?: string
  apiHost?: string
}

export interface UmamiConfig {
  apiKey?: string
  siteId?: string
  apiHost?: string
}

export interface MatomoConfig {
  apiToken?: string
  siteId?: string
  apiHost?: string
}

export interface PostHogConfig {
  apiKey?: string
  projectId?: string
  apiHost?: string
}

export interface GoogleAnalyticsConfig {
  propertyId?: string
  apiKey?: string
}

export type TimePeriod = 
  | 'day' 
  | '7d' 
  | '14d' 
  | '30d' 
  | 'lastMonth' 
  | 'thisMonth' 
  | '12mo' 
  | 'custom'
  | string // Allow provider-specific periods

export type ComparisonOption = 
  | 'previousPeriod' 
  | 'sameLastYear' 
  | 'custom'

export interface DashboardWidgetConfig {
  enabled?: boolean
  position?: 'beforeDashboard' | 'afterDashboard'
}

export interface AnalyticsViewConfig {
  enabled?: boolean
  position?: 'beforeNavLinks' | 'afterNavLinks'
}

export interface AnalyticsPluginConfig {
  provider: 'plausible' | 'umami' | 'matomo' | 'posthog' | 'google-analytics' | AnalyticsProvider
  plausible?: PlausibleConfig
  umami?: UmamiConfig
  matomo?: MatomoConfig
  posthog?: PostHogConfig
  googleAnalytics?: GoogleAnalyticsConfig
  enabled?: boolean
  enableDashboard?: boolean
  dashboardPath?: string
  dashboardWidget?: DashboardWidgetConfig | boolean // boolean for backward compatibility
  analyticsView?: AnalyticsViewConfig | boolean // boolean for backward compatibility
  customNavigation?: boolean
  useGenericIcon?: boolean
  timePeriods?: TimePeriod[]
  defaultTimePeriod?: TimePeriod
  comparisonOptions?: ComparisonOption[]
  enableComparison?: boolean
}

export interface DashboardData {
  stats: {
    visitors: { value: number; change: number | null }
    pageviews: { value: number; change: number | null }
    bounce_rate: { value: number; change: number | null }
    visit_duration: { value: number; change: number | null }
  }
  timeseries: Array<{
    date: string
    visitors: number
    pageviews?: number
    bounce_rate?: number
    visit_duration?: number
  }>
  pages: Array<{
    page: string
    visitors: number
    pageviews: number
    bounce_rate: number
    visit_duration: number
  }>
  sources: Array<{
    source: string
    visitors: number
    bounce_rate: number
    visit_duration: number
  }>
  events: Array<{
    goal: string
    visitors: number
    events: number
    conversion_rate: number
  }>
  realtime: {
    visitors: number
  }
}

export type AnalyticsPlugin = (config: AnalyticsPluginConfig) => (payload: Config) => Config