import type { PayloadRequest } from 'payload'
import type { AnalyticsProvider, ComparisonData } from '../types'

export const analyticsEndpoint = async (req: PayloadRequest): Promise<Response> => {
  const provider = (global as any).__analyticsProvider as AnalyticsProvider
  if (!provider) {
    return Response.json({ error: 'Analytics provider not configured' }, { status: 500 })
  }

  const url = new URL(req.url || '', `http://localhost`)
  const period = url.searchParams.get('period') || '7d'
  const start = url.searchParams.get('start')
  const end = url.searchParams.get('end')
  const grouping = url.searchParams.get('grouping') || 'day'
  
  // Get comparison parameters
  const comparisonType = url.searchParams.get('comparison')
  const compareStart = url.searchParams.get('compareStart')
  const compareEnd = url.searchParams.get('compareEnd')
  
  let effectivePeriod = period
  if (period === 'custom' && start && end) {
    // Format custom date range for providers
    effectivePeriod = `${start},${end}`
  }
  
  let comparison: ComparisonData | undefined
  if (comparisonType) {
    comparison = {
      period: comparisonType as 'previousPeriod' | 'sameLastYear' | 'custom',
      customStartDate: compareStart || undefined,
      customEndDate: compareEnd || undefined,
    }
  }
  
  try {
    const data = await provider.getDashboardData(effectivePeriod, comparison, grouping as any)
    
    if (!data) {
      return Response.json({ error: 'Failed to fetch analytics data' }, { status: 500 })
    }

    return Response.json(data)
  } catch (error) {
    return Response.json({ error: 'Failed to fetch analytics data' }, { status: 500 })
  }
}