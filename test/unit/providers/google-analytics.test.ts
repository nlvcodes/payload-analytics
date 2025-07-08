import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GoogleAnalyticsProvider } from '@/providers/google-analytics'
import { mockFetchResponse } from '../../utils/test-helpers'
import { googleAnalyticsReportResponse, googleAnalyticsPagePathResponse } from '../../fixtures/api-responses'

describe('GoogleAnalyticsProvider', () => {
  let provider: GoogleAnalyticsProvider

  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  describe('constructor', () => {
    it('should initialize with provided config', () => {
      provider = new GoogleAnalyticsProvider({
        propertyId: '123456789',
        apiKey: 'test-api-key',
      })

      expect(provider.name).toBe('google-analytics')
    })

    it('should use environment variables when config is not provided', () => {
      process.env.GA4_PROPERTY_ID = '987654321'
      process.env.GA4_API_KEY = 'env-api-key'

      provider = new GoogleAnalyticsProvider({})

      expect(provider.name).toBe('google-analytics')

      delete process.env.GA4_PROPERTY_ID
      delete process.env.GA4_API_KEY
    })
  })

  describe('getDashboardData', () => {
    beforeEach(() => {
      provider = new GoogleAnalyticsProvider({
        propertyId: '123456789',
        apiKey: 'test-api-key',
      })
    })

    it('should fetch and transform data correctly', async () => {
      const mockDate = new Date('2024-01-10T12:00:00Z')
      vi.setSystemTime(mockDate)

      // Mock API responses
      ;(global.fetch as any)
        .mockResolvedValueOnce(mockFetchResponse(googleAnalyticsReportResponse)) // current stats
        .mockResolvedValueOnce(mockFetchResponse({ // comparison stats
          rows: [
            {
              dimensionValues: [{ value: '20240103' }],
              metricValues: [
                { value: '1000' },
                { value: '5000' },
                { value: '0.5' },
                { value: '150' },
              ],
            },
          ],
        }))
        .mockResolvedValueOnce(mockFetchResponse({ // timeseries
          rows: [
            {
              dimensionValues: [{ value: '20240108' }],
              metricValues: [{ value: '100' }, { value: '250' }],
            },
            {
              dimensionValues: [{ value: '20240109' }],
              metricValues: [{ value: '120' }, { value: '300' }],
            },
            {
              dimensionValues: [{ value: '20240110' }],
              metricValues: [{ value: '110' }, { value: '280' }],
            },
          ],
        }))
        .mockResolvedValueOnce(mockFetchResponse(googleAnalyticsPagePathResponse)) // pages
        .mockResolvedValueOnce(mockFetchResponse({ // sources
          rows: [
            {
              dimensionValues: [{ value: 'google' }],
              metricValues: [{ value: '400' }],
            },
            {
              dimensionValues: [{ value: '(direct)' }],
              metricValues: [{ value: '350' }],
            },
            {
              dimensionValues: [{ value: 'twitter.com' }],
              metricValues: [{ value: '200' }],
            },
          ],
        }))
        .mockResolvedValueOnce(mockFetchResponse({ // events
          rows: [
            {
              dimensionValues: [{ value: 'sign_up' }],
              metricValues: [{ value: '45' }],
            },
            {
              dimensionValues: [{ value: 'purchase' }],
              metricValues: [{ value: '23' }],
            },
          ],
        }))

      const result = await provider.getDashboardData('7d')

      expect(result).toBeDefined()
      expect(result?.stats).toEqual({
        visitors: 1234,
        pageviews: 5678,
        bounceRate: 45.2,
        avgDuration: 180,
        visitorsChange: 23.4, // (1234-1000)/1000 * 100
        pageviewsChange: 13.56, // (5678-5000)/5000 * 100
        bounceRateChange: -9.6, // (0.452-0.5)/0.5 * 100
        avgDurationChange: 20, // (180-150)/150 * 100
      })

      expect(result?.timeseries).toHaveLength(3)
      expect(result?.timeseries[0]).toEqual({
        date: '2024-01-08',
        visitors: 100,
        pageviews: 250,
      })

      expect(result?.pages).toHaveLength(2)
      expect(result?.sources).toHaveLength(3)
      expect(result?.events).toHaveLength(2)
      expect(result?.realtime).toBeUndefined() // GA doesn't return realtime in this implementation
    })

    it('should format date ranges correctly for GA4 API', async () => {
      const mockDate = new Date('2024-01-10T12:00:00Z')
      vi.setSystemTime(mockDate)
      
      ;(global.fetch as any).mockResolvedValue(mockFetchResponse({ rows: [] }))

      await provider.getDashboardData('30d')

      const calls = (global.fetch as any).mock.calls
      const body = JSON.parse(calls[0][1].body)
      
      expect(body.dateRanges[0].startDate).toBe('2023-12-11')
      expect(body.dateRanges[0].endDate).toBe('2024-01-10')
    })

    it('should handle bounce rate as decimal conversion', async () => {
      ;(global.fetch as any)
        .mockResolvedValueOnce(mockFetchResponse({
          rows: [
            {
              dimensionValues: [{ value: '20240110' }],
              metricValues: [
                { value: '1000' },
                { value: '2000' },
                { value: '0.753' }, // 75.3% bounce rate as decimal
                { value: '200' },
              ],
            },
          ],
        }))
        .mockResolvedValue(mockFetchResponse({ rows: [] }))

      const result = await provider.getDashboardData('7d')

      expect(result?.stats.bounceRate).toBe(75.3)
    })

    it('should send correct API key in query parameters', async () => {
      ;(global.fetch as any).mockResolvedValue(mockFetchResponse({ rows: [] }))

      await provider.getDashboardData('7d')

      const calls = (global.fetch as any).mock.calls
      const url = calls[0][0]
      expect(url).toContain('key=test-api-key')
    })

    it('should construct proper report request body', async () => {
      ;(global.fetch as any).mockResolvedValue(mockFetchResponse({ rows: [] }))

      await provider.getDashboardData('7d')

      const calls = (global.fetch as any).mock.calls
      const body = JSON.parse(calls[0][1].body)

      // Check dimensions
      expect(body.dimensions).toEqual([{ name: 'date' }])
      
      // Check metrics
      expect(body.metrics).toContainEqual({ name: 'totalUsers' })
      expect(body.metrics).toContainEqual({ name: 'screenPageViews' })
      expect(body.metrics).toContainEqual({ name: 'bounceRate' })
      expect(body.metrics).toContainEqual({ name: 'averageSessionDuration' })
    })

    it('should filter out page_view events from custom events', async () => {
      ;(global.fetch as any)
        .mockResolvedValueOnce(mockFetchResponse({ rows: [] }))
        .mockResolvedValueOnce(mockFetchResponse({ rows: [] }))
        .mockResolvedValueOnce(mockFetchResponse({ rows: [] }))
        .mockResolvedValueOnce(mockFetchResponse({ rows: [] }))
        .mockResolvedValueOnce(mockFetchResponse({ rows: [] }))
        .mockResolvedValueOnce(mockFetchResponse({
          rows: [
            {
              dimensionValues: [{ value: 'page_view' }],
              metricValues: [{ value: '1000' }],
            },
            {
              dimensionValues: [{ value: 'sign_up' }],
              metricValues: [{ value: '50' }],
            },
            {
              dimensionValues: [{ value: 'purchase' }],
              metricValues: [{ value: '25' }],
            },
          ],
        }))

      const result = await provider.getDashboardData('7d')

      // Should only have 2 events (sign_up and purchase), not page_view
      expect(result?.events).toHaveLength(2)
      expect(result?.events.find(e => e.name === 'page_view')).toBeUndefined()
      expect(result?.events.find(e => e.name === 'sign_up')).toBeDefined()
    })

    it('should handle empty API responses', async () => {
      ;(global.fetch as any).mockResolvedValue(mockFetchResponse({ rows: [] }))

      const result = await provider.getDashboardData('7d')

      expect(result).toBeDefined()
      expect(result?.stats.visitors).toBe(0)
      expect(result?.stats.pageviews).toBe(0)
      expect(result?.timeseries).toEqual([])
      expect(result?.pages).toEqual([])
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

    it('should calculate source percentages correctly', async () => {
      ;(global.fetch as any)
        .mockResolvedValueOnce(mockFetchResponse({ rows: [] }))
        .mockResolvedValueOnce(mockFetchResponse({ rows: [] }))
        .mockResolvedValueOnce(mockFetchResponse({ rows: [] }))
        .mockResolvedValueOnce(mockFetchResponse({ rows: [] }))
        .mockResolvedValueOnce(mockFetchResponse({
          rows: [
            {
              dimensionValues: [{ value: 'google' }],
              metricValues: [{ value: '500' }],
            },
            {
              dimensionValues: [{ value: 'facebook' }],
              metricValues: [{ value: '300' }],
            },
            {
              dimensionValues: [{ value: 'twitter' }],
              metricValues: [{ value: '200' }],
            },
          ],
        }))
        .mockResolvedValue(mockFetchResponse({ rows: [] }))

      const result = await provider.getDashboardData('7d')

      expect(result?.sources).toHaveLength(3)
      expect(result?.sources[0].percentage).toBe(50) // 500/1000 * 100
      expect(result?.sources[1].percentage).toBe(30) // 300/1000 * 100
      expect(result?.sources[2].percentage).toBe(20) // 200/1000 * 100
    })
  })

  describe('trackEvent', () => {
    it('should not implement event tracking', () => {
      provider = new GoogleAnalyticsProvider({
        propertyId: '123456789',
        apiKey: 'test-api-key',
      })

      expect(provider.trackEvent).toBeUndefined()
    })
  })
})