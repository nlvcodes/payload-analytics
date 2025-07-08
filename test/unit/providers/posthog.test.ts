import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PostHogProvider } from '@/providers/posthog'
import { mockFetchResponse } from '../../utils/test-helpers'
import { posthogEventsResponse, posthogInsightsResponse } from '../../fixtures/api-responses'

describe('PostHogProvider', () => {
  let provider: PostHogProvider

  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  describe('constructor', () => {
    it('should initialize with provided config', () => {
      provider = new PostHogProvider({
        apiKey: 'test-api-key',
        projectId: 'test-project-id',
        apiHost: 'https://app.posthog.com',
      })

      expect(provider.name).toBe('posthog')
    })

    it('should use environment variables when config is not provided', () => {
      process.env.POSTHOG_API_KEY = 'env-api-key'
      process.env.POSTHOG_PROJECT_ID = 'env-project-id'
      process.env.POSTHOG_API_HOST = 'https://env.posthog.com'

      provider = new PostHogProvider({})

      expect(provider.name).toBe('posthog')

      delete process.env.POSTHOG_API_KEY
      delete process.env.POSTHOG_PROJECT_ID
      delete process.env.POSTHOG_API_HOST
    })

    it('should use default API host if not provided', () => {
      provider = new PostHogProvider({
        apiKey: 'test-api-key',
        projectId: 'test-project-id',
      })

      expect(provider.name).toBe('posthog')
    })
  })

  describe('getDashboardData', () => {
    beforeEach(() => {
      provider = new PostHogProvider({
        apiKey: 'test-api-key',
        projectId: 'test-project-id',
        apiHost: 'https://app.posthog.com',
      })
    })

    it('should fetch and transform data correctly', async () => {
      const mockDate = new Date('2024-01-10T12:00:00Z')
      vi.setSystemTime(mockDate)

      // Mock API responses
      ;(global.fetch as any)
        .mockResolvedValueOnce(mockFetchResponse(posthogEventsResponse)) // events
        .mockResolvedValueOnce(mockFetchResponse({ // previous period events
          results: [
            {
              event: '$pageview',
              properties: { $current_url: '/' },
              timestamp: '2024-01-01T00:00:00Z',
              distinct_id: 'user1',
            },
            {
              event: '$pageview',
              properties: { $current_url: '/about' },
              timestamp: '2024-01-01T00:01:00Z',
              distinct_id: 'user1',
            },
          ],
        }))
        .mockResolvedValueOnce(mockFetchResponse(posthogInsightsResponse)) // insights

      const result = await provider.getDashboardData('7d')

      expect(result).toBeDefined()
      
      // Check stats calculation
      expect(result?.stats.visitors).toBe(3) // 3 unique users
      expect(result?.stats.pageviews).toBe(2) // 2 pageview events
      expect(result?.stats.bounceRate).toBeCloseTo(33.33, 1) // 1 user with single pageview / 3 total
      expect(result?.stats.avgDuration).toBe(180) // default estimate
      
      // Check comparisons
      expect(result?.stats.visitorsChange).toBe(200) // (3-1)/1 * 100
      expect(result?.stats.pageviewsChange).toBe(0) // (2-2)/2 * 100

      // Check pages
      expect(result?.pages).toHaveLength(2)
      expect(result?.pages[0]).toEqual({
        path: '/',
        title: '/',
        visitors: 1,
        pageviews: 1,
        bounceRate: 0,
        avgDuration: 180,
      })

      // Check sources
      expect(result?.sources).toHaveLength(1)
      expect(result?.sources[0]).toEqual({
        source: 'Direct',
        visitors: 3,
        percentage: 100,
      })

      // Check events
      expect(result?.events).toHaveLength(1)
      expect(result?.events[0]).toEqual({
        name: 'Signup',
        count: 1,
        change: 0,
      })

      // Check timeseries
      expect(result?.timeseries).toHaveLength(3)
    })

    it('should handle empty events response', async () => {
      ;(global.fetch as any)
        .mockResolvedValueOnce(mockFetchResponse({ results: [] }))
        .mockResolvedValueOnce(mockFetchResponse({ results: [] }))
        .mockResolvedValueOnce(mockFetchResponse({ result: [] }))

      const result = await provider.getDashboardData('7d')

      expect(result).toBeDefined()
      expect(result?.stats.visitors).toBe(0)
      expect(result?.stats.pageviews).toBe(0)
      expect(result?.pages).toEqual([])
      expect(result?.events).toEqual([])
    })

    it('should calculate bounce rate correctly', async () => {
      ;(global.fetch as any)
        .mockResolvedValueOnce(mockFetchResponse({
          results: [
            // User 1: 2 pageviews (not a bounce)
            {
              event: '$pageview',
              properties: { $current_url: '/' },
              distinct_id: 'user1',
            },
            {
              event: '$pageview',
              properties: { $current_url: '/about' },
              distinct_id: 'user1',
            },
            // User 2: 1 pageview (bounce)
            {
              event: '$pageview',
              properties: { $current_url: '/' },
              distinct_id: 'user2',
            },
            // User 3: 3 pageviews (not a bounce)
            {
              event: '$pageview',
              properties: { $current_url: '/' },
              distinct_id: 'user3',
            },
            {
              event: '$pageview',
              properties: { $current_url: '/contact' },
              distinct_id: 'user3',
            },
            {
              event: '$pageview',
              properties: { $current_url: '/about' },
              distinct_id: 'user3',
            },
          ],
        }))
        .mockResolvedValue(mockFetchResponse({ results: [] }))

      const result = await provider.getDashboardData('7d')

      // 1 bounce out of 3 users = 33.33%
      expect(result?.stats.bounceRate).toBeCloseTo(33.33, 1)
    })

    it('should extract sources from UTM parameters', async () => {
      ;(global.fetch as any)
        .mockResolvedValueOnce(mockFetchResponse({
          results: [
            {
              event: '$pageview',
              properties: { 
                $current_url: '/',
                utm_source: 'google',
              },
              distinct_id: 'user1',
            },
            {
              event: '$pageview',
              properties: { 
                $current_url: '/about',
                utm_source: 'twitter',
              },
              distinct_id: 'user2',
            },
            {
              event: '$pageview',
              properties: { 
                $current_url: '/contact',
                $referring_domain: 'facebook.com',
              },
              distinct_id: 'user3',
            },
            {
              event: '$pageview',
              properties: { 
                $current_url: '/home',
              },
              distinct_id: 'user4',
            },
          ],
        }))
        .mockResolvedValue(mockFetchResponse({ results: [] }))

      const result = await provider.getDashboardData('7d')

      expect(result?.sources).toHaveLength(4)
      expect(result?.sources.find(s => s.source === 'google')).toBeDefined()
      expect(result?.sources.find(s => s.source === 'twitter')).toBeDefined()
      expect(result?.sources.find(s => s.source === 'facebook.com')).toBeDefined()
      expect(result?.sources.find(s => s.source === 'Direct')).toBeDefined()
    })

    it('should handle API errors gracefully', async () => {
      ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

      const result = await provider.getDashboardData('7d')

      expect(result).toBeNull()
    })

    it('should send correct authorization headers', async () => {
      ;(global.fetch as any).mockResolvedValue(mockFetchResponse({ results: [] }))

      await provider.getDashboardData('7d')

      const calls = (global.fetch as any).mock.calls
      expect(calls[0][1].headers['Authorization']).toBe('Bearer test-api-key')
    })

    it('should calculate date ranges correctly', async () => {
      const mockDate = new Date('2024-01-10T12:00:00Z')
      vi.setSystemTime(mockDate)
      
      ;(global.fetch as any).mockResolvedValue(mockFetchResponse({ results: [] }))

      await provider.getDashboardData('30d')

      const calls = (global.fetch as any).mock.calls
      const url = new URL(calls[0][0])
      const params = url.searchParams
      
      expect(params.get('after')).toBe('2023-12-11T12:00:00.000Z')
      expect(params.get('before')).toBe('2024-01-10T12:00:00.000Z')
    })
  })

  describe('trackEvent', () => {
    it('should not implement event tracking', () => {
      provider = new PostHogProvider({
        apiKey: 'test-api-key',
        projectId: 'test-project-id',
      })

      expect(provider.trackEvent).toBeUndefined()
    })
  })
})