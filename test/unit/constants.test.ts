import { describe, it, expect } from 'vitest'
import {
  DEFAULT_TIME_PERIODS,
  TIME_PERIOD_LABELS,
  COMPARISON_LABELS,
  DEFAULT_COMPARISON_OPTIONS,
  PROVIDER_PERIOD_MAPPINGS,
  mapTimePeriodToProvider,
} from '@/constants'

describe('constants', () => {
  describe('DEFAULT_TIME_PERIODS', () => {
    it('should contain expected time periods', () => {
      expect(DEFAULT_TIME_PERIODS).toEqual([
        'day',
        '7d',
        '14d',
        '30d',
        'lastMonth',
        'thisMonth',
        '12mo',
        'custom',
      ])
    })

    it('should have 8 default time periods', () => {
      expect(DEFAULT_TIME_PERIODS).toHaveLength(8)
    })
  })

  describe('TIME_PERIOD_LABELS', () => {
    it('should have labels for all default time periods', () => {
      DEFAULT_TIME_PERIODS.forEach(period => {
        expect(TIME_PERIOD_LABELS).toHaveProperty(period)
        expect(typeof TIME_PERIOD_LABELS[period as keyof typeof TIME_PERIOD_LABELS]).toBe('string')
      })
    })

    it('should have correct label values', () => {
      expect(TIME_PERIOD_LABELS.day).toBe('Today')
      expect(TIME_PERIOD_LABELS['7d']).toBe('Last 7 days')
      expect(TIME_PERIOD_LABELS['14d']).toBe('Last 14 days')
      expect(TIME_PERIOD_LABELS['30d']).toBe('Last 30 days')
      expect(TIME_PERIOD_LABELS.lastMonth).toBe('Last month')
      expect(TIME_PERIOD_LABELS.thisMonth).toBe('This month')
      expect(TIME_PERIOD_LABELS['12mo']).toBe('Last 12 months')
      expect(TIME_PERIOD_LABELS.custom).toBe('Custom')
    })
  })

  describe('PROVIDER_PERIOD_MAPPINGS', () => {
    it('should have mappings for all supported providers', () => {
      const expectedProviders = ['plausible', 'umami', 'matomo', 'posthog', 'google-analytics']
      
      expectedProviders.forEach(provider => {
        expect(PROVIDER_PERIOD_MAPPINGS).toHaveProperty(provider)
      })
    })

    it('should map time periods correctly for each provider', () => {
      expect(PROVIDER_PERIOD_MAPPINGS.plausible['7d']).toBe('7d')
      expect(PROVIDER_PERIOD_MAPPINGS.umami['7d']).toBe('7d')
      expect(PROVIDER_PERIOD_MAPPINGS.matomo['7d']).toBe('week')
      expect(PROVIDER_PERIOD_MAPPINGS.posthog['7d']).toBe('7d')
      expect(PROVIDER_PERIOD_MAPPINGS['google-analytics']['7d']).toBe('7d')
    })
  })

  describe('COMPARISON_LABELS', () => {
    it('should have correct comparison labels', () => {
      expect(COMPARISON_LABELS).toEqual({
        previousPeriod: 'Previous period',
        sameLastYear: 'Same period last year',
        custom: 'Custom comparison',
      })
    })
  })

  describe('DEFAULT_COMPARISON_OPTIONS', () => {
    it('should contain expected default comparison options', () => {
      expect(DEFAULT_COMPARISON_OPTIONS).toEqual(['previousPeriod', 'sameLastYear', 'custom'])
    })

    it('should match COMPARISON_LABELS keys', () => {
      DEFAULT_COMPARISON_OPTIONS.forEach(option => {
        expect(COMPARISON_LABELS).toHaveProperty(option)
      })
    })
  })

  describe('mapTimePeriodToProvider', () => {
    it('should map time periods correctly', () => {
      expect(mapTimePeriodToProvider('7d', 'plausible')).toBe('7d')
      expect(mapTimePeriodToProvider('7d', 'matomo')).toBe('week')
      expect(mapTimePeriodToProvider('30d', 'umami')).toBe('30d')
      expect(mapTimePeriodToProvider('lastMonth', 'google-analytics')).toBe('lastMonth')
    })

    it('should pass through unknown periods', () => {
      expect(mapTimePeriodToProvider('custom-period', 'plausible')).toBe('custom-period')
    })

    it('should handle unknown providers', () => {
      expect(mapTimePeriodToProvider('7d', 'unknown-provider')).toBe('7d')
    })
  })
})