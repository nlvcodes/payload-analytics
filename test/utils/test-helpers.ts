import { vi } from 'vitest'
import type { Config } from 'payload'
import type { DashboardData, AnalyticsProvider } from '@/types'

export const createMockConfig = (overrides?: Partial<Config>): Config => ({
  serverURL: 'http://localhost:3000',
  collections: [],
  secret: 'test-secret',
  typescript: {
    outputFile: './payload-types.ts',
  },
  ...overrides,
})

export const createMockDashboardData = (overrides?: Partial<DashboardData>): DashboardData => ({
  stats: {
    visitors: { value: 1234, change: 12.5 },
    pageviews: { value: 5678, change: -5.3 },
    bounce_rate: { value: 45.2, change: -2.1 },
    visit_duration: { value: 180, change: 15.0 },
  },
  timeseries: [
    { date: '2024-01-01', visitors: 100, pageviews: 250 },
    { date: '2024-01-02', visitors: 120, pageviews: 300 },
    { date: '2024-01-03', visitors: 110, pageviews: 280 },
  ],
  pages: [
    { page: '/', visitors: 500, pageviews: 1200, bounce_rate: 35, visit_duration: 240 },
    { page: '/about', visitors: 300, pageviews: 450, bounce_rate: 55, visit_duration: 120 },
    { page: '/contact', visitors: 200, pageviews: 250, bounce_rate: 65, visit_duration: 90 },
  ],
  sources: [
    { source: 'google', visitors: 400 },
    { source: 'direct', visitors: 350 },
    { source: 'twitter', visitors: 200 },
  ],
  events: [
    { goal: 'Signup', visitors: 45, events: 50, conversion_rate: 20.5 },
    { goal: 'Purchase', visitors: 23, events: 25, conversion_rate: 10.2 },
    { goal: 'Newsletter', visitors: 67, events: 70, conversion_rate: 5.8 },
  ],
  realtime: {
    visitors: 42,
  },
  ...overrides,
})

export const createMockProvider = (name: string, data?: DashboardData): AnalyticsProvider => ({
  name,
  getDashboardData: vi.fn().mockResolvedValue(data || createMockDashboardData()),
  trackEvent: vi.fn(),
})

export const mockFetchResponse = (data: any, status = 200) => {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
    headers: new Headers({
      'content-type': 'application/json',
    }),
  } as Response)
}

export const expectToHaveBeenCalledWithHeaders = (
  fetchMock: any,
  expectedHeaders: Record<string, string>
) => {
  const calls = fetchMock.mock.calls
  const lastCall = calls[calls.length - 1]
  const [, options] = lastCall
  
  Object.entries(expectedHeaders).forEach(([key, value]) => {
    expect(options.headers[key]).toBe(value)
  })
}