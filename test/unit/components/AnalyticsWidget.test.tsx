import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { AnalyticsWidget } from '@/components/AnalyticsWidget'
import { createMockDashboardData } from '../../utils/test-helpers'

// Mock fetch
global.fetch = vi.fn()

describe('AnalyticsWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => createMockDashboardData(),
    })
  })

  it('should render widget with analytics data', async () => {
    render(<AnalyticsWidget />)

    await waitFor(() => {
      // Check widget title
      expect(screen.getByText("Today's Analytics")).toBeInTheDocument()
      
      // Check stats
      expect(screen.getByText('Visitors')).toBeInTheDocument()
      expect(screen.getByText('1.2K')).toBeInTheDocument()
      
      expect(screen.getByText('Pageviews')).toBeInTheDocument()
      expect(screen.getByText('5.7K')).toBeInTheDocument()
      
      expect(screen.getByText('Bounce Rate')).toBeInTheDocument()
      expect(screen.getByText('45%')).toBeInTheDocument()
      
      expect(screen.getByText('Avg Duration')).toBeInTheDocument()
      expect(screen.getByText('3m')).toBeInTheDocument()
    })
  })

  it('should display nothing while loading', () => {
    render(<AnalyticsWidget />)
    expect(screen.queryByText("Today's Analytics")).not.toBeInTheDocument()
  })

  it('should handle error state by rendering nothing', async () => {
    ;(global.fetch as any).mockRejectedValueOnce(new Error('API Error'))

    const { container } = render(<AnalyticsWidget />)

    await waitFor(() => {
      expect(container.firstChild).toBeNull()
    })
  })

  it('should not show link to full dashboard', async () => {
    render(<AnalyticsWidget />)

    await waitFor(() => {
      expect(screen.queryByText('View full dashboard →')).not.toBeInTheDocument()
    })
  })

  it('should fetch data for today period', async () => {
    render(<AnalyticsWidget />)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/analytics/dashboard?period=day')
    })
  })

  it('should handle empty data by rendering nothing', async () => {
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => null,
    })

    const { container } = render(<AnalyticsWidget />)

    await waitFor(() => {
      expect(container.firstChild).toBeNull()
    })
  })

  it('should display real-time visitors if available', async () => {
    render(<AnalyticsWidget />)

    await waitFor(() => {
      expect(screen.getByText('42 visitors online now')).toBeInTheDocument()
    })
  })

  it('should not display real-time visitors if not available', async () => {
    const dataWithoutRealtime = createMockDashboardData()
    delete dataWithoutRealtime.realtime
    
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => dataWithoutRealtime,
    })

    render(<AnalyticsWidget />)

    await waitFor(() => {
      expect(screen.getByText('1.2K')).toBeInTheDocument()
    })

    expect(screen.queryByText(/visitors online/)).not.toBeInTheDocument()
  })
})