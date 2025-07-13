import type { PayloadRequest } from 'payload'
import type { AnalyticsProvider } from '../types'

export const analyticsEndpoint = async (req: PayloadRequest) => {
  console.log('[Analytics Endpoint] Called with URL:', req.url)
  
  const provider = (global as any).__analyticsProvider as AnalyticsProvider
  if (!provider) {
    console.error('[Analytics Endpoint] No provider configured')
    return Response.json({ error: 'Analytics provider not configured' }, { status: 500 })
  }

  const url = new URL(req.url || '', `http://localhost`)
  const period = url.searchParams.get('period') || '7d'
  const start = url.searchParams.get('start')
  const end = url.searchParams.get('end')
  
  console.log('[Analytics Endpoint] Period:', period, 'Start:', start, 'End:', end)
  
  let effectivePeriod = period
  if (period === 'custom' && start && end) {
    // Format custom date range for providers
    effectivePeriod = `${start},${end}`
  }
  
  try {
    const data = await provider.getDashboardData(effectivePeriod)
    
    if (!data) {
      console.error('[Analytics Endpoint] Provider returned no data')
      return Response.json({ error: 'Failed to fetch analytics data' }, { status: 500 })
    }

    console.log('[Analytics Endpoint] Returning data successfully')
    return Response.json(data)
  } catch (error) {
    console.error('[Analytics Endpoint] Error fetching data:', error)
    return Response.json({ error: 'Failed to fetch analytics data' }, { status: 500 })
  }
}