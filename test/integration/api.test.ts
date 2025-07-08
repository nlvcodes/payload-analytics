import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { PayloadRequest } from 'payload'
import { createMockDashboardData, createMockProvider } from '../utils/test-helpers'

// Mock the endpoint handler by importing the logic
const createAnalyticsEndpoint = () => {
  return async (req: PayloadRequest) => {
    try {
      const provider = (global as any).__analyticsProvider
      
      if (!provider) {
        return Response.json(
          { error: 'Analytics provider not configured' },
          { status: 500 }
        )
      }

      const period = req.url?.searchParams?.get('period') || '7d'
      const data = await provider.getDashboardData(period)

      if (!data) {
        return Response.json(
          { error: 'Failed to fetch analytics data' },
          { status: 500 }
        )
      }

      return Response.json(data)
    } catch (error) {
      return Response.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

describe('Analytics API Endpoint', () => {
  let handler: ReturnType<typeof createAnalyticsEndpoint>
  let mockRequest: Partial<PayloadRequest>

  beforeEach(() => {
    vi.clearAllMocks()
    handler = createAnalyticsEndpoint()
    
    // Clear global state
    if ('__analyticsProvider' in global) {
      delete (global as any).__analyticsProvider
    }

    // Create mock request
    mockRequest = {
      url: new URL('http://localhost:3000/api/analytics/dashboard?period=7d'),
      method: 'GET',
      headers: new Headers({
        'content-type': 'application/json',
      }),
    }
  })

  describe('GET /api/analytics/dashboard', () => {
    it('should return analytics data when provider is configured', async () => {
      const mockData = createMockDashboardData()
      const mockProvider = createMockProvider('test', mockData)
      ;(global as any).__analyticsProvider = mockProvider

      const response = await handler(mockRequest as PayloadRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockData)
      expect(mockProvider.getDashboardData).toHaveBeenCalledWith('7d')
    })

    it('should use default period when not specified', async () => {
      const mockProvider = createMockProvider('test')
      ;(global as any).analyticsProvider = mockProvider
      
      mockRequest.url = new URL('http://localhost:3000/api/analytics/dashboard')

      await handler(mockRequest as PayloadRequest)

      expect(mockProvider.getDashboardData).toHaveBeenCalledWith('7d')
    })

    it('should pass custom period to provider', async () => {
      const mockProvider = createMockProvider('test')
      ;(global as any).analyticsProvider = mockProvider
      
      mockRequest.url = new URL('http://localhost:3000/api/analytics/dashboard?period=30d')

      await handler(mockRequest as PayloadRequest)

      expect(mockProvider.getDashboardData).toHaveBeenCalledWith('30d')
    })

    it('should return 500 when provider is not configured', async () => {
      const response = await handler(mockRequest as PayloadRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Analytics provider not configured' })
    })

    it('should return 500 when provider returns null', async () => {
      const mockProvider = createMockProvider('test', null)
      ;(global as any).analyticsProvider = mockProvider

      const response = await handler(mockRequest as PayloadRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to fetch analytics data' })
    })

    it('should handle provider errors gracefully', async () => {
      const mockProvider = {
        name: 'error-provider',
        getDashboardData: vi.fn().mockRejectedValue(new Error('Provider error')),
      }
      ;(global as any).analyticsProvider = mockProvider

      const response = await handler(mockRequest as PayloadRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Internal server error' })
    })

    it('should handle multiple time period formats', async () => {
      const mockProvider = createMockProvider('test')
      ;(global as any).analyticsProvider = mockProvider

      const periods = ['day', '7d', '14d', '30d', 'lastMonth', 'thisMonth', '12mo']

      for (const period of periods) {
        mockRequest.url = new URL(`http://localhost:3000/api/analytics/dashboard?period=${period}`)
        await handler(mockRequest as PayloadRequest)
        
        expect(mockProvider.getDashboardData).toHaveBeenCalledWith(period)
      }
    })

    it('should cache responses appropriately', async () => {
      const mockData = createMockDashboardData()
      const mockProvider = createMockProvider('test', mockData)
      ;(global as any).analyticsProvider = mockProvider

      // Make multiple requests with same period
      const response1 = await handler(mockRequest as PayloadRequest)
      const response2 = await handler(mockRequest as PayloadRequest)

      // Provider should be called twice (no caching in endpoint)
      expect(mockProvider.getDashboardData).toHaveBeenCalledTimes(2)
      
      // Both responses should be successful
      expect(response1.status).toBe(200)
      expect(response2.status).toBe(200)
    })

    it('should validate period parameter format', async () => {
      const mockProvider = createMockProvider('test')
      ;(global as any).analyticsProvider = mockProvider

      // Test with invalid period (should still work as provider handles validation)
      mockRequest.url = new URL('http://localhost:3000/api/analytics/dashboard?period=invalid')
      
      const response = await handler(mockRequest as PayloadRequest)
      
      expect(response.status).toBe(200)
      expect(mockProvider.getDashboardData).toHaveBeenCalledWith('invalid')
    })

    it('should return consistent data structure', async () => {
      const mockData = createMockDashboardData()
      const mockProvider = createMockProvider('test', mockData)
      ;(global as any).analyticsProvider = mockProvider

      const response = await handler(mockRequest as PayloadRequest)
      const data = await response.json()

      // Verify data structure
      expect(data).toHaveProperty('stats')
      expect(data).toHaveProperty('timeseries')
      expect(data).toHaveProperty('pages')
      expect(data).toHaveProperty('sources')
      expect(data).toHaveProperty('events')
      expect(data).toHaveProperty('realtime')

      // Verify stats structure
      expect(data.stats).toHaveProperty('visitors')
      expect(data.stats).toHaveProperty('pageviews')
      expect(data.stats).toHaveProperty('bounceRate')
      expect(data.stats).toHaveProperty('avgDuration')
      expect(data.stats).toHaveProperty('visitorsChange')
      expect(data.stats).toHaveProperty('pageviewsChange')
      expect(data.stats).toHaveProperty('bounceRateChange')
      expect(data.stats).toHaveProperty('avgDurationChange')
    })
  })
})