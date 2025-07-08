import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PlausibleProvider } from '@/providers/plausible'
import { mockFetchResponse, expectToHaveBeenCalledWithHeaders } from '../../utils/test-helpers'
import {
  plausibleStatsResponse,
  plausibleTimeseriesResponse,
  plausibleBreakdownResponse,
} from '../../fixtures/api-responses'

describe('PlausibleProvider', () => {
  let provider: PlausibleProvider

  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  describe('constructor', () => {
    it('should initialize with provided config', () => {
      provider = new PlausibleProvider({
        apiKey: 'test-api-key',
        siteId: 'test-site.com',
        apiHost: 'https://plausible.io',
      })

      expect(provider.name).toBe('plausible')
    })

    it('should use environment variables when config is not provided', () => {
      process.env.PLAUSIBLE_API_KEY = 'env-api-key'
      process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN = 'env-site.com'
      process.env.PLAUSIBLE_API_HOST = 'https://analytics.example.com'

      provider = new PlausibleProvider({})

      // Provider should use env vars internally
      expect(provider.name).toBe('plausible')

      delete process.env.PLAUSIBLE_API_KEY
      delete process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN
      delete process.env.PLAUSIBLE_API_HOST
    })

    it('should prioritize config over environment variables', () => {
      process.env.PLAUSIBLE_API_KEY = 'env-api-key'
      
      provider = new PlausibleProvider({
        apiKey: 'config-api-key',
        siteId: 'config-site.com',
      })

      expect(provider.name).toBe('plausible')

      delete process.env.PLAUSIBLE_API_KEY
    })
  })

  describe('getDashboardData', () => {
    beforeEach(() => {
      provider = new PlausibleProvider({
        apiKey: 'test-api-key',
        siteId: 'test-site.com',
        apiHost: 'https://plausible.io',
      })
    })

    it('should fetch and transform data correctly', async () => {
      // Mock all API responses
      ;(global.fetch as any)
        .mockResolvedValueOnce(mockFetchResponse(plausibleStatsResponse)) // current stats
        .mockResolvedValueOnce(mockFetchResponse(plausibleStatsResponse)) // comparison stats
        .mockResolvedValueOnce(mockFetchResponse(plausibleTimeseriesResponse)) // timeseries
        .mockResolvedValueOnce(mockFetchResponse(plausibleBreakdownResponse)) // breakdown
        .mockResolvedValueOnce(mockFetchResponse({ // sources
          results: [
            { source: 'Google', visitors: 400 },
            { source: 'Direct / None', visitors: 350 },
            { source: 'Twitter', visitors: 200 },
          ],
        }))
        .mockResolvedValueOnce(mockFetchResponse({ // events
          results: [
            { name: 'Signup', visitors: 45, events: 50 },
            { name: 'Purchase', visitors: 23, events: 25 },
          ],
        }))
        .mockResolvedValueOnce(mockFetchResponse({ // realtime
          visitors: 42,
        }))

      const result = await provider.getDashboardData('7d')

      expect(result).toBeDefined()
      expect(result?.stats).toEqual({
        visitors: { value: 1234, change: 0 },
        pageviews: { value: 5678, change: 0 },
        bounce_rate: { value: 45.2, change: 0 },
        visit_duration: { value: 180, change: 0 },
      })

      expect(result?.timeseries).toHaveLength(3)
      expect(result?.pages).toHaveLength(2)
      expect(result?.sources).toHaveLength(3)
      expect(result?.events).toHaveLength(2)
      expect(result?.realtime?.visitors).toBe(42)
    })

    it('should handle API errors gracefully', async () => {
      ;(global.fetch as any).mockRejectedValueOnce(new Error('API Error'))

      const result = await provider.getDashboardData('7d')

      expect(result).toBeNull()
    })

    it('should handle non-200 responses', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: () => Promise.resolve('Unauthorized'),
      })

      const result = await provider.getDashboardData('7d')

      expect(result).toBeNull()
    })

    it('should send correct headers with API requests', async () => {
      ;(global.fetch as any).mockResolvedValue(mockFetchResponse({}))

      await provider.getDashboardData('7d')

      expectToHaveBeenCalledWithHeaders(global.fetch, {
        'Authorization': 'Bearer test-api-key',
        'Content-Type': 'application/json',
      })
    })

    it('should use correct time periods in API calls', async () => {
      ;(global.fetch as any).mockResolvedValue(mockFetchResponse({}))

      await provider.getDashboardData('30d')

      const calls = (global.fetch as any).mock.calls
      const statsCall = calls[0]
      expect(statsCall[0]).toContain('period=30d')
    })

    it('should calculate percentage changes correctly', async () => {
      // Mock current stats
      ;(global.fetch as any)
        .mockResolvedValueOnce(mockFetchResponse({
          results: {
            visitors: { value: 1200 },
            pageviews: { value: 5000 },
            bounce_rate: { value: 45 },
            visit_duration: { value: 180 },
          },
        }))
        // Mock comparison stats with different values
        .mockResolvedValueOnce(mockFetchResponse({
          results: {
            visitors: { value: 1000 },
            pageviews: { value: 5500 },
            bounce_rate: { value: 50 },
            visit_duration: { value: 150 },
          },
        }))
        .mockResolvedValue(mockFetchResponse({ results: [] }))

      const result = await provider.getDashboardData('7d')

      expect(result?.stats.visitors.change).toBe(20) // (1200-1000)/1000 * 100
      expect(result?.stats.pageviews.change).toBeCloseTo(-9.09, 1) // (5000-5500)/5500 * 100
      expect(result?.stats.bounce_rate.change).toBe(-10) // (45-50)/50 * 100
      expect(result?.stats.visit_duration.change).toBe(20) // (180-150)/150 * 100
    })

    it('should handle missing data gracefully', async () => {
      ;(global.fetch as any).mockResolvedValue(mockFetchResponse({ results: {} }))

      const result = await provider.getDashboardData('7d')

      expect(result).toBeDefined()
      expect(result?.stats.visitors.value).toBe(0)
      expect(result?.timeseries).toEqual([])
      expect(result?.pages).toEqual([])
    })
  })

  describe('trackEvent', () => {
    beforeEach(() => {
      provider = new PlausibleProvider({
        apiKey: 'test-api-key',
        siteId: 'test-site.com',
      })
    })

    it('should not implement event tracking', () => {
      expect(provider.trackEvent).toBeUndefined()
    })
  })
})