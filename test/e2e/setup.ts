import { getPayload } from 'payload'
import config from './payload.config'
import { createMockDashboardData } from '../utils/test-helpers'

export async function setupE2ETests() {
  // Initialize Payload
  const payload = await getPayload({
    config,
    disableDBConnect: false,
  })

  // Set up mock provider with test data
  const mockData = createMockDashboardData()
  ;(global as any).__analyticsProvider = {
    name: 'test',
    getDashboardData: async () => mockData,
  }

  return { payload }
}

export async function teardownE2ETests(payload: any) {
  // Clean up
  if (payload?.db) {
    await payload.db.destroy()
  }
}