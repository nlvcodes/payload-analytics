import type { Config } from 'payload'
import type { AnalyticsPluginConfig, AnalyticsProvider, DashboardWidgetConfig, AnalyticsViewConfig } from './types'
import { createPlausibleProvider } from './providers/plausible'
import { createUmamiProvider } from './providers/umami'
import { createMatomoProvider } from './providers/matomo'
import { createPostHogProvider } from './providers/posthog'
import { createGoogleAnalyticsProvider } from './providers/google-analytics'
import { DEFAULT_TIME_PERIODS, DEFAULT_COMPARISON_OPTIONS } from './constants'
import path from 'path'

export const analyticsPlugin = (pluginConfig: AnalyticsPluginConfig) => (config: Config): Config => {
  const {
    provider = 'plausible',
    plausible,
    umami,
    matomo,
    posthog,
    googleAnalytics,
    enabled = true,
    enableDashboard = true,
    dashboardPath = '/analytics',
    dashboardWidget = { enabled: true, position: 'afterDashboard' },
    analyticsView = { enabled: true, position: 'afterNavLinks' },
    customNavigation = true,
    useGenericIcon = false,
    timePeriods = DEFAULT_TIME_PERIODS,
    defaultTimePeriod = '7d',
    comparisonOptions = DEFAULT_COMPARISON_OPTIONS,
    enableComparison = true,
  } = pluginConfig

  // Handle backward compatibility for dashboardWidget
  const widgetConfig: DashboardWidgetConfig = typeof dashboardWidget === 'boolean' 
    ? { enabled: dashboardWidget, position: 'afterDashboard' }
    : dashboardWidget

  // Handle backward compatibility for analyticsView
  const viewConfig: AnalyticsViewConfig = typeof analyticsView === 'boolean'
    ? { enabled: analyticsView && customNavigation, position: 'afterNavLinks' }
    : analyticsView

  if (!enabled) {
    return config
  }

  // Get the provider instance
  let providerInstance: AnalyticsProvider
  if (typeof provider === 'string') {
    switch (provider) {
      case 'plausible':
        providerInstance = createPlausibleProvider(plausible || {})
        break
      case 'umami':
        providerInstance = createUmamiProvider(umami || {})
        break
      case 'matomo':
        providerInstance = createMatomoProvider(matomo || {})
        break
      case 'posthog':
        providerInstance = createPostHogProvider(posthog || {})
        break
      case 'google-analytics':
        providerInstance = createGoogleAnalyticsProvider(googleAnalytics || {})
        break
      default:
        throw new Error(`Unknown analytics provider: ${provider}`)
    }
  } else {
    providerInstance = provider
  }

  // Store provider and config in global for API routes and components
  ;(global as any).__analyticsProvider = providerInstance
  ;(global as any).__analyticsProviderName = typeof provider === 'string' ? provider : provider.name
  ;(global as any).__analyticsUseGenericIcon = useGenericIcon
  ;(global as any).__analyticsTimePeriods = timePeriods
  ;(global as any).__analyticsDefaultTimePeriod = defaultTimePeriod
  ;(global as any).__analyticsComparisonOptions = comparisonOptions
  ;(global as any).__analyticsEnableComparison = enableComparison

  const updatedConfig: Config = {
    ...config,
    admin: {
      ...config.admin,
      components: {
        ...config.admin?.components,
        views: {
          ...config.admin?.components?.views,
          ...(enableDashboard ? {
            analytics: {
              Component: 'payload-analytics-plugin/components/AnalyticsView',
              path: dashboardPath as `/${string}`,
            },
          } : {}),
        },
        ...(viewConfig.enabled && customNavigation ? {
          [viewConfig.position === 'beforeNavLinks' ? 'beforeNavLinks' : 'afterNavLinks']: [
            ...(config.admin?.components?.[viewConfig.position === 'beforeNavLinks' ? 'beforeNavLinks' : 'afterNavLinks'] || []),
            'payload-analytics-plugin/components/AfterNavLinks',
          ],
        } : {}),
        ...(widgetConfig.enabled ? {
          [widgetConfig.position === 'beforeDashboard' ? 'beforeDashboard' : 'afterDashboard']: [
            ...(config.admin?.components?.[widgetConfig.position === 'beforeDashboard' ? 'beforeDashboard' : 'afterDashboard'] || []),
            'payload-analytics-plugin/components/AnalyticsWidget',
          ],
        } : {}),
      },
    },
    endpoints: [
      ...(config.endpoints || []),
      {
        path: '/api/analytics/dashboard',
        method: 'get',
        handler: async (req) => {
          const provider = (global as any).__analyticsProvider as AnalyticsProvider
          if (!provider) {
            return Response.json({ error: 'Analytics provider not configured' }, { status: 500 })
          }

          const url = new URL(req.url || '', `http://localhost`)
          const period = url.searchParams.get('period') || '7d'
          const data = await provider.getDashboardData(period)
          
          if (!data) {
            return Response.json({ error: 'Failed to fetch analytics data' }, { status: 500 })
          }

          return Response.json(data)
        },
      },
    ],
  }

  return updatedConfig
}

// Export types and utilities
export * from './types'
export * from './lib/formatters'
export * from './constants'
export { createPlausibleProvider } from './providers/plausible'
export { createUmamiProvider } from './providers/umami'
export { createMatomoProvider } from './providers/matomo'
export { createPostHogProvider } from './providers/posthog'
export { createGoogleAnalyticsProvider } from './providers/google-analytics'
export { AnalyticsView } from './components/AnalyticsView'
export { AnalyticsWidget } from './components/AnalyticsWidget'
export { AnalyticsClient } from './components/AnalyticsClient'