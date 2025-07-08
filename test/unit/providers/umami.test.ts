import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UmamiProvider } from '@/providers/umami'
import { mockFetchResponse } from '../../utils/test-helpers'
import { umamiStatsResponse, umamiMetricsResponse } from '../../fixtures/api-responses'

describe('UmamiProvider', () => {
  let provider: UmamiProvider

  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  describe('constructor', () => {
    it('should initialize with provided config', () => {
      provider = new UmamiProvider({
        apiKey: 'test-api-key',
        siteId: 'test-site-id',
        apiHost: 'https://analytics.example.com',
      })

      expect(provider.name).toBe('umami')
    })

    it('should use environment variables when config is not provided', () => {
      process.env.UMAMI_API_KEY = 'env-api-key'
      process.env.UMAMI_SITE_ID = 'env-site-id'
      process.env.UMAMI_API_HOST = 'https://env.analytics.com'

      provider = new UmamiProvider({})

      expect(provider.name).toBe('umami')

      delete process.env.UMAMI_API_KEY
      delete process.env.UMAMI_SITE_ID
      delete process.env.UMAMI_API_HOST
    })
  })

  describe('getDashboardData', () => {
    beforeEach(() => {
      provider = new UmamiProvider({
        apiKey: 'test-api-key',
        siteId: 'test-site-id',
        apiHost: 'https://analytics.example.com',
      })
    })

    it('should fetch and transform data correctly', async () => {
      const mockDate = new Date('2024-01-10T12:00:00Z')
      vi.setSystemTime(mockDate)

      // Mock API responses
      ;(global.fetch as any)
        .mockResolvedValueOnce(mockFetchResponse(umamiStatsResponse)) // current stats
        .mockResolvedValueOnce(mockFetchResponse({ // comparison stats
          pageviews: { value: 5000 },
          visitors: { value: 1000 },
          visits: { value: 1200 },
          bounces: { value: 600 },
          totaltime: { value: 240000 },
        }))
        .mockResolvedValueOnce(mockFetchResponse({ // pageviews timeseries
          pageviews: [
            { x: 1704844800000, y: 250 }, // 2024-01-10
            { x: 1704931200000, y: 300 }, // 2024-01-11
            { x: 1705017600000, y: 280 }, // 2024-01-12
          ],
          sessions: [
            { x: 1704844800000, y: 100 },
            { x: 1704931200000, y: 120 },
            { x: 1705017600000, y: 110 },
          ],
        }))
        .mockResolvedValueOnce(mockFetchResponse(umamiMetricsResponse)) // metrics

      const result = await provider.getDashboardData('7d')

      expect(result).toBeDefined()
      expect(result?.stats).toEqual({
        visitors: 1234,
        pageviews: 5678,
        bounceRate: 45.2, // 678/1500 * 100
        avgDuration: 180, // 270000/1500
        visitorsChange: 23.4, // (1234-1000)/1000 * 100
        pageviewsChange: 13.56, // (5678-5000)/5000 * 100
        bounceRateChange: -10, // (45.2-50)/50 * 100
        avgDurationChange: -10, // (180-200)/200 * 100
      })

      expect(result?.timeseries).toHaveLength(3)
      expect(result?.timeseries[0]).toEqual({
        date: '2024-01-10',
        visitors: 100,
        pageviews: 250,
      })

      expect(result?.pages).toHaveLength(2)
      expect(result?.sources).toHaveLength(2)
      expect(result?.events).toHaveLength(2)
      expect(result?.realtime).toBeUndefined() // Umami doesn't support realtime
    })

    it('should calculate time periods correctly', async () => {
      const mockDate = new Date('2024-01-10T12:00:00Z')
      vi.setSystemTime(mockDate)
      
      ;(global.fetch as any).mockResolvedValue(mockFetchResponse({}))

      await provider.getDashboardData('30d')

      const calls = (global.fetch as any).mock.calls
      const statsCall = calls[0]
      
      // Check URL contains correct parameters
      expect(statsCall[0]).toContain('/api/websites/test-site-id/stats')
      expect(statsCall[0]).toContain('startAt=')
      expect(statsCall[0]).toContain('endAt=')
    })

    it('should handle missing/empty responses', async () => {
      ;(global.fetch as any).mockResolvedValue(mockFetchResponse({}))

      const result = await provider.getDashboardData('7d')

      expect(result).toBeDefined()
      expect(result?.stats.visitors).toBe(0)
      expect(result?.stats.pageviews).toBe(0)
      expect(result?.timeseries).toEqual([])
    })

    it('should handle API errors gracefully', async () => {
      ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

      const result = await provider.getDashboardData('7d')

      expect(result).toBeNull()
    })

    it('should send correct authorization headers', async () => {
      ;(global.fetch as any).mockResolvedValue(mockFetchResponse({}))

      await provider.getDashboardData('7d')

      const calls = (global.fetch as any).mock.calls
      expect(calls[0][1].headers['Authorization']).toBe('Bearer test-api-key')
    })

    it('should calculate bounce rate correctly', async () => {
      ;(global.fetch as any)
        .mockResolvedValueOnce(mockFetchResponse({
          pageviews: { value: 1000 },
          visitors: { value: 500 },
          visits: { value: 600 },
          bounces: { value: 300 },
          totaltime: { value: 108000 }, // 180 seconds * 600 visits
        }))
        .mockResolvedValue(mockFetchResponse({}))

      const result = await provider.getDashboardData('7d')

      // Bounce rate = (bounces / visits) * 100
      expect(result?.stats.bounceRate).toBe(50) // 300/600 * 100
    })

    it('should handle different time period formats', async () => {
      ;(global.fetch as any).mockResolvedValue(mockFetchResponse({}))

      // Test various time periods
      const periods = ['day', '7d', '30d', '12mo']
      
      for (const period of periods) {
        await provider.getDashboardData(period)
      }

      expect(global.fetch).toHaveBeenCalledTimes(periods.length * 4) // 4 API calls per period
    })
  })

  describe('trackEvent', () => {
    it('should not implement event tracking', () => {
      provider = new UmamiProvider({
        apiKey: 'test-api-key',
        siteId: 'test-site-id',
      })

      expect(provider.trackEvent).toBeUndefined()
    })
  })
})