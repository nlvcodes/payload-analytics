import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import type { Payload } from 'payload'
import { setupE2ETests, teardownE2ETests } from './setup'

describe('Analytics Plugin E2E', () => {
  let payload: Payload

  beforeAll(async () => {
    const setup = await setupE2ETests()
    payload = setup.payload
  })

  afterAll(async () => {
    await teardownE2ETests(payload)
  })

  describe('Analytics Dashboard API', () => {
    it('should return analytics data from the dashboard endpoint', async () => {
      const response = await fetch('http://localhost:3000/api/analytics/dashboard?period=7d')
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('stats')
      expect(data).toHaveProperty('timeseries')
      expect(data).toHaveProperty('pages')
      expect(data).toHaveProperty('sources')
      expect(data).toHaveProperty('events')
    })

    it('should handle different time periods', async () => {
      const periods = ['day', '7d', '30d', '12mo']
      
      for (const period of periods) {
        const response = await fetch(`http://localhost:3000/api/analytics/dashboard?period=${period}`)
        const data = await response.json()
        
        expect(response.status).toBe(200)
        expect(data.stats).toBeDefined()
      }
    })
  })

  describe('Plugin Configuration', () => {
    it('should have analytics endpoint registered', () => {
      const endpoints = payload.config.endpoints || []
      const analyticsEndpoint = endpoints.find(e => e.path === '/api/analytics/dashboard')
      
      expect(analyticsEndpoint).toBeDefined()
      expect(analyticsEndpoint?.method).toBe('get')
    })

    it('should have admin components configured', () => {
      const adminConfig = payload.config.admin
      
      expect(adminConfig?.components?.views?.analytics).toBeDefined()
      expect(adminConfig?.components?.afterNavLinks).toBeDefined()
      expect(adminConfig?.components?.afterDashboard).toBeDefined()
    })
  })

  describe('Provider Integration', () => {
    it('should use the configured provider', () => {
      const provider = (global as any).__analyticsProvider
      
      expect(provider).toBeDefined()
      expect(provider.name).toBe('test')
      expect(typeof provider.getDashboardData).toBe('function')
    })

    it('should store provider configuration in global scope', () => {
      expect((global as any).__analyticsProviderName).toBe('test')
      expect((global as any).__analyticsUseGenericIcon).toBeDefined()
      expect((global as any).__analyticsTimePeriods).toBeDefined()
      expect((global as any).__analyticsDefaultTimePeriod).toBeDefined()
    })
  })
})