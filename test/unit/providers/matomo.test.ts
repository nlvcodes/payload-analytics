import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MatomoProvider } from '@/providers/matomo'
import { mockFetchResponse } from '../../utils/test-helpers'
import { matomoVisitsSummaryResponse, matomoPageTitlesResponse } from '../../fixtures/api-responses'

describe('MatomoProvider', () => {
  let provider: MatomoProvider

  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  describe('constructor', () => {
    it('should initialize with provided config', () => {
      provider = new MatomoProvider({
        apiToken: 'test-token',
        siteId: '1',
        apiHost: 'https://matomo.example.com',
      })

      expect(provider.name).toBe('matomo')
    })

    it('should use environment variables when config is not provided', () => {
      process.env.MATOMO_API_TOKEN = 'env-token'
      process.env.MATOMO_SITE_ID = '2'
      process.env.MATOMO_API_HOST = 'https://env.matomo.com'

      provider = new MatomoProvider({})

      expect(provider.name).toBe('matomo')

      delete process.env.MATOMO_API_TOKEN
      delete process.env.MATOMO_SITE_ID
      delete process.env.MATOMO_API_HOST
    })
  })

  describe('getDashboardData', () => {
    beforeEach(() => {
      provider = new MatomoProvider({
        apiToken: 'test-token',
        siteId: '1',
        apiHost: 'https://matomo.example.com',
      })
    })

    it('should fetch and transform data correctly', async () => {
      // Mock API responses
      ;(global.fetch as any)
        .mockResolvedValueOnce(mockFetchResponse(matomoVisitsSummaryResponse)) // current stats
        .mockResolvedValueOnce(mockFetchResponse([ // comparison stats
          {
            nb_visits: 1000,
            nb_actions: 5000,
            bounce_rate: '50%',
            avg_time_on_site: 150,
          },
        ]))
        .mockResolvedValueOnce(mockFetchResponse([ // timeseries
          { label: '2024-01-01', nb_visits: 100, nb_actions: 250 },
          { label: '2024-01-02', nb_visits: 120, nb_actions: 300 },
          { label: '2024-01-03', nb_visits: 110, nb_actions: 280 },
        ]))
        .mockResolvedValueOnce(mockFetchResponse(matomoPageTitlesResponse)) // pages
        .mockResolvedValueOnce(mockFetchResponse([ // referrers
          { label: 'google.com', nb_visits: 400 },
          { label: 'Direct Entry', nb_visits: 350 },
          { label: 'twitter.com', nb_visits: 200 },
        ]))
        .mockResolvedValueOnce(mockFetchResponse([ // goals
          { label: 'Signup', nb_conversions: 45 },
          { label: 'Purchase', nb_conversions: 23 },
        ]))
        .mockResolvedValueOnce(mockFetchResponse([ // live visitors
          { visits: 42 },
        ]))

      const result = await provider.getDashboardData('7d')

      expect(result).toBeDefined()
      expect(result?.stats).toEqual({
        visitors: 1234,
        pageviews: 5678,
        bounceRate: 45,
        avgDuration: 180,
        visitorsChange: 23.4, // (1234-1000)/1000 * 100
        pageviewsChange: 13.56, // (5678-5000)/5000 * 100
        bounceRateChange: -10, // (45-50)/50 * 100
        avgDurationChange: 20, // (180-150)/150 * 100
      })

      expect(result?.timeseries).toHaveLength(3)
      expect(result?.pages).toHaveLength(2)
      expect(result?.sources).toHaveLength(3)
      expect(result?.events).toHaveLength(2)
      expect(result?.realtime?.visitors).toBe(42)
    })

    it('should handle percentage parsing correctly', async () => {
      ;(global.fetch as any)
        .mockResolvedValueOnce(mockFetchResponse([
          {
            nb_visits: 1000,
            nb_actions: 2000,
            bounce_rate: '75.5%',
            avg_time_on_site: 200,
          },
        ]))
        .mockResolvedValue(mockFetchResponse([]))

      const result = await provider.getDashboardData('7d')

      expect(result?.stats.bounceRate).toBe(75.5)
    })

    it('should map time periods correctly', async () => {
      ;(global.fetch as any).mockResolvedValue(mockFetchResponse([]))

      const periodMappings = [
        { input: 'day', expected: 'day' },
        { input: '7d', expected: 'week' },
        { input: '30d', expected: 'month' },
        { input: '12mo', expected: 'year' },
      ]

      for (const { input, expected } of periodMappings) {
        await provider.getDashboardData(input)
        
        const calls = (global.fetch as any).mock.calls
        const lastCall = calls[calls.length - 1]
        expect(lastCall[0]).toContain(`period=${expected}`)
      }
    })

    it('should handle missing live visitor data', async () => {
      ;(global.fetch as any)
        .mockResolvedValueOnce(mockFetchResponse(matomoVisitsSummaryResponse))
        .mockResolvedValue(mockFetchResponse([]))

      const result = await provider.getDashboardData('7d')

      expect(result?.realtime).toBeUndefined()
    })

    it('should construct API URLs correctly', async () => {
      ;(global.fetch as any).mockResolvedValue(mockFetchResponse([]))

      await provider.getDashboardData('7d')

      const calls = (global.fetch as any).mock.calls
      calls.forEach(call => {
        const url = call[0]
        expect(url).toContain('module=API')
        expect(url).toContain('format=JSON')
        expect(url).toContain('idSite=1')
        expect(url).toContain('token_auth=test-token')
      })
    })

    it('should handle API errors gracefully', async () => {
      ;(global.fetch as any).mockRejectedValueOnce(new Error('API Error'))

      const result = await provider.getDashboardData('7d')

      expect(result).toBeNull()
    })

    it('should handle non-200 responses', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 403,
        text: () => Promise.resolve('Forbidden'),
      })

      const result = await provider.getDashboardData('7d')

      expect(result).toBeNull()
    })

    it('should calculate source percentages correctly', async () => {
      ;(global.fetch as any)
        .mockResolvedValueOnce(mockFetchResponse(matomoVisitsSummaryResponse))
        .mockResolvedValueOnce(mockFetchResponse([]))
        .mockResolvedValueOnce(mockFetchResponse([]))
        .mockResolvedValueOnce(mockFetchResponse([]))
        .mockResolvedValueOnce(mockFetchResponse([
          { label: 'google.com', nb_visits: 500 },
          { label: 'direct', nb_visits: 300 },
          { label: 'twitter.com', nb_visits: 200 },
        ]))
        .mockResolvedValue(mockFetchResponse([]))

      const result = await provider.getDashboardData('7d')

      expect(result?.sources).toHaveLength(3)
      expect(result?.sources[0].percentage).toBe(50) // 500/1000 * 100
      expect(result?.sources[1].percentage).toBe(30) // 300/1000 * 100
      expect(result?.sources[2].percentage).toBe(20) // 200/1000 * 100
    })
  })

  describe('trackEvent', () => {
    it('should not implement event tracking', () => {
      provider = new MatomoProvider({
        apiToken: 'test-token',
        siteId: '1',
      })

      expect(provider.trackEvent).toBeUndefined()
    })
  })
})