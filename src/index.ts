import type { Config } from 'payload'
import type { AnalyticsPluginConfig, LegacyAnalyticsPluginConfig, AnalyticsProvider, DashboardWidgetConfig, AnalyticsViewConfig } from './types'
import { createPlausibleProvider } from './providers/plausible'
import { createUmamiProvider } from './providers/umami'
import { createMatomoProvider } from './providers/matomo'
import { createPostHogProvider } from './providers/posthog'
import { createGoogleAnalyticsProvider } from './providers/google-analytics'
import { DEFAULT_TIME_PERIODS, DEFAULT_COMPARISON_OPTIONS } from './constants'
import { analyticsEndpoint } from './endpoints/analytics'
import path from 'path'

export const analyticsPlugin = (pluginConfig: AnalyticsPluginConfig | LegacyAnalyticsPluginConfig) => (config: Config): Config => {
  // Extract base configuration
  const {
    provider = 'plausible',
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

  // Handle provider configuration - support both new and legacy patterns
  let providerConfig: any = {}
  
  if ('config' in pluginConfig) {
    // New pattern: config field
    providerConfig = pluginConfig.config || {}
  } else {
    // Legacy pattern: provider-specific fields
    const legacyConfig = pluginConfig as LegacyAnalyticsPluginConfig
    switch (provider) {
      case 'plausible':
        providerConfig = legacyConfig.plausible || {}
        break
      case 'umami':
        providerConfig = legacyConfig.umami || {}
        break
      case 'matomo':
        providerConfig = legacyConfig.matomo || {}
        break
      case 'posthog':
        providerConfig = legacyConfig.posthog || {}
        break
      case 'google-analytics':
        providerConfig = legacyConfig.googleAnalytics || {}
        break
    }
  }

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
        providerInstance = createPlausibleProvider(providerConfig)
        break
      case 'umami':
        providerInstance = createUmamiProvider(providerConfig)
        break
      case 'matomo':
        providerInstance = createMatomoProvider(providerConfig)
        break
      case 'posthog':
        providerInstance = createPostHogProvider(providerConfig)
        break
      case 'google-analytics':
        providerInstance = createGoogleAnalyticsProvider(providerConfig)
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
  ;(global as any).__analyticsDashboardPath = dashboardPath
  ;(global as any).__adminRoute = '/admin' // Default admin route

  // Log for debugging
  console.log('[Analytics Plugin] Initializing with provider:', typeof provider === 'string' ? provider : 'custom')
  console.log('[Analytics Plugin] Registering endpoint at /api/analytics/dashboard')
  console.log('[Analytics Plugin] Existing endpoints:', config.endpoints?.length || 0)

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
        handler: analyticsEndpoint,
      },
    ],
  }

  console.log('[Analytics Plugin] Total endpoints after plugin:', updatedConfig.endpoints?.length || 0)
  
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