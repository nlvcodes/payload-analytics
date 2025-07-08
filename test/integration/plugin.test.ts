import { describe, it, expect, vi, beforeEach } from 'vitest'
import { analyticsPlugin } from '@/index'
import { createMockConfig, createMockProvider } from '../utils/test-helpers'
import type { Plugin } from 'payload'

describe('analyticsPlugin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Clear global state
    if ('__analyticsProvider' in global) {
      delete (global as any).__analyticsProvider
    }
    if ('__analyticsProviderName' in global) {
      delete (global as any).__analyticsProviderName
    }
    if ('analyticsConfig' in global) {
      delete (global as any).analyticsConfig
    }
  })

  describe('plugin initialization', () => {
    it('should create a valid Payload plugin', () => {
      const plugin = analyticsPlugin({
        provider: 'plausible',
        plausible: {
          apiKey: 'test-key',
          siteId: 'test-site',
        },
      })

      expect(plugin).toBeDefined()
      expect(typeof plugin).toBe('function')
    })

    it('should return config with analytics endpoints when enabled', () => {
      const plugin = analyticsPlugin({
        provider: 'plausible',
        enabled: true,
      })

      const config = createMockConfig()
      const modifiedConfig = plugin(config)

      expect(modifiedConfig.endpoints).toBeDefined()
      expect(modifiedConfig.endpoints).toHaveLength(1)
      expect(modifiedConfig.endpoints?.[0].path).toBe('/api/analytics/dashboard')
    })

    it('should not add endpoints when disabled', () => {
      const plugin = analyticsPlugin({
        provider: 'plausible',
        enabled: false,
      })

      const config = createMockConfig()
      const modifiedConfig = plugin(config)

      expect(modifiedConfig.endpoints).toBeUndefined()
    })

    it('should add admin components when dashboard is enabled', () => {
      const plugin = analyticsPlugin({
        provider: 'plausible',
        enableDashboard: true,
      })

      const config = createMockConfig()
      const modifiedConfig = plugin(config)

      expect(modifiedConfig.admin?.components?.views).toBeDefined()
      expect(modifiedConfig.admin?.components?.views?.analytics).toBeDefined()
    })

    it('should not add admin components when dashboard is disabled', () => {
      const plugin = analyticsPlugin({
        provider: 'plausible',
        enableDashboard: false,
      })

      const config = createMockConfig()
      const modifiedConfig = plugin(config)

      expect(modifiedConfig.admin?.components?.views?.analytics).toBeUndefined()
    })

    it('should respect custom dashboard path', () => {
      const plugin = analyticsPlugin({
        provider: 'plausible',
        dashboardPath: '/custom-analytics',
      })

      const config = createMockConfig()
      const modifiedConfig = plugin(config)

      expect(modifiedConfig.admin?.components?.views?.['custom-analytics']).toBeDefined()
    })
  })

  describe('provider configuration', () => {
    it('should initialize Plausible provider', () => {
      const plugin = analyticsPlugin({
        provider: 'plausible',
        plausible: {
          apiKey: 'test-key',
          siteId: 'test-site',
        },
      })

      const config = createMockConfig()
      plugin(config)

      expect((global as any).__analyticsProvider).toBeDefined()
      expect((global as any).__analyticsProvider.name).toBe('plausible')
    })

    it('should initialize Umami provider', () => {
      const plugin = analyticsPlugin({
        provider: 'umami',
        umami: {
          apiKey: 'test-key',
          siteId: 'test-site',
          apiHost: 'https://umami.example.com',
        },
      })

      const config = createMockConfig()
      plugin(config)

      expect((global as any).analyticsProvider).toBeDefined()
      expect((global as any).analyticsProvider.name).toBe('umami')
    })

    it('should initialize Matomo provider', () => {
      const plugin = analyticsPlugin({
        provider: 'matomo',
        matomo: {
          apiToken: 'test-token',
          siteId: '1',
          apiHost: 'https://matomo.example.com',
        },
      })

      const config = createMockConfig()
      plugin(config)

      expect((global as any).analyticsProvider).toBeDefined()
      expect((global as any).analyticsProvider.name).toBe('matomo')
    })

    it('should initialize PostHog provider', () => {
      const plugin = analyticsPlugin({
        provider: 'posthog',
        posthog: {
          apiKey: 'test-key',
          projectId: 'test-project',
        },
      })

      const config = createMockConfig()
      plugin(config)

      expect((global as any).analyticsProvider).toBeDefined()
      expect((global as any).analyticsProvider.name).toBe('posthog')
    })

    it('should initialize Google Analytics provider', () => {
      const plugin = analyticsPlugin({
        provider: 'google-analytics',
        googleAnalytics: {
          propertyId: '123456789',
          apiKey: 'test-key',
        },
      })

      const config = createMockConfig()
      plugin(config)

      expect((global as any).analyticsProvider).toBeDefined()
      expect((global as any).analyticsProvider.name).toBe('google-analytics')
    })

    it('should accept custom provider instance', () => {
      const customProvider = createMockProvider('custom')
      
      const plugin = analyticsPlugin({
        provider: customProvider,
      })

      const config = createMockConfig()
      plugin(config)

      expect((global as any).__analyticsProvider).toBe(customProvider)
    })
  })

  describe('dashboard widget configuration', () => {
    it('should add widget to afterDashboard by default', () => {
      const plugin = analyticsPlugin({
        provider: 'plausible',
        dashboardWidget: true,
      })

      const config = createMockConfig()
      const modifiedConfig = plugin(config)

      expect(modifiedConfig.admin?.components?.afterDashboard).toHaveLength(1)
      expect(modifiedConfig.admin?.components?.beforeDashboard).toBeUndefined()
    })

    it('should add widget to beforeDashboard when configured', () => {
      const plugin = analyticsPlugin({
        provider: 'plausible',
        dashboardWidget: {
          enabled: true,
          position: 'beforeDashboard',
        },
      })

      const config = createMockConfig()
      const modifiedConfig = plugin(config)

      expect(modifiedConfig.admin?.components?.beforeDashboard).toHaveLength(1)
      expect(modifiedConfig.admin?.components?.afterDashboard).toBeUndefined()
    })

    it('should not add widget when disabled', () => {
      const plugin = analyticsPlugin({
        provider: 'plausible',
        dashboardWidget: false,
      })

      const config = createMockConfig()
      const modifiedConfig = plugin(config)

      expect(modifiedConfig.admin?.components?.afterDashboard).toBeUndefined()
      expect(modifiedConfig.admin?.components?.beforeDashboard).toBeUndefined()
    })
  })

  describe('navigation configuration', () => {
    it('should add navigation link to afterNavLinks by default', () => {
      const plugin = analyticsPlugin({
        provider: 'plausible',
        analyticsView: true,
      })

      const config = createMockConfig()
      const modifiedConfig = plugin(config)

      expect(modifiedConfig.admin?.components?.afterNavLinks).toHaveLength(1)
      expect(modifiedConfig.admin?.components?.beforeNavLinks).toBeUndefined()
    })

    it('should add navigation link to beforeNavLinks when configured', () => {
      const plugin = analyticsPlugin({
        provider: 'plausible',
        analyticsView: {
          enabled: true,
          position: 'beforeNavLinks',
        },
      })

      const config = createMockConfig()
      const modifiedConfig = plugin(config)

      expect(modifiedConfig.admin?.components?.beforeNavLinks).toHaveLength(1)
      expect(modifiedConfig.admin?.components?.afterNavLinks).toBeUndefined()
    })

    it('should not add navigation when customNavigation is false', () => {
      const plugin = analyticsPlugin({
        provider: 'plausible',
        customNavigation: false,
        analyticsView: true,
      })

      const config = createMockConfig()
      const modifiedConfig = plugin(config)

      expect(modifiedConfig.admin?.components?.afterNavLinks).toBeUndefined()
      expect(modifiedConfig.admin?.components?.beforeNavLinks).toBeUndefined()
    })
  })

  describe('config validation', () => {
    it('should store configuration in global scope', () => {
      const plugin = analyticsPlugin({
        provider: 'plausible',
        timePeriods: ['day', '7d', '30d'],
        defaultTimePeriod: '30d',
        enableComparison: false,
      })

      const config = createMockConfig()
      plugin(config)

      expect((global as any).__analyticsTimePeriods).toEqual(['day', '7d', '30d'])
      expect((global as any).__analyticsDefaultTimePeriod).toBe('30d')
      expect((global as any).__analyticsEnableComparison).toBe(false)
    })

    it('should use default values when not specified', () => {
      const plugin = analyticsPlugin({
        provider: 'plausible',
      })

      const config = createMockConfig()
      plugin(config)

      expect((global as any).__analyticsProvider).toBeDefined()
      expect((global as any).__analyticsDefaultTimePeriod).toBe('7d')
      expect((global as any).__analyticsEnableComparison).toBe(true)
    })
  })

  describe('environment variable support', () => {
    it('should initialize provider using environment variables', () => {
      process.env.PLAUSIBLE_API_KEY = 'env-key'
      process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN = 'env-site.com'

      const plugin = analyticsPlugin({
        provider: 'plausible',
      })

      const config = createMockConfig()
      plugin(config)

      expect((global as any).analyticsProvider).toBeDefined()
      expect((global as any).analyticsProvider.name).toBe('plausible')

      delete process.env.PLAUSIBLE_API_KEY
      delete process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN
    })
  })
})