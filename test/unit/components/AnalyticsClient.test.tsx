import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AnalyticsClient } from '@/components/AnalyticsClient'
import { createMockDashboardData } from '../../utils/test-helpers'

// Mock fetch
global.fetch = vi.fn()

describe('AnalyticsClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => createMockDashboardData(),
    })
    // Mock window globals
    ;(window as any).__analyticsTimePeriods = ['day', '7d', '30d', '12mo']
    ;(window as any).__analyticsDefaultTimePeriod = '7d'
    ;(window as any).__analyticsEnableComparison = true
  })

  it('should render loading state initially', () => {
    render(<AnalyticsClient />)
    expect(screen.getByText('Loading analytics...')).toBeInTheDocument()
  })

  it('should fetch and display analytics data', async () => {
    render(<AnalyticsClient />)

    await waitFor(() => {
      expect(screen.getByText('1.2K')).toBeInTheDocument() // Visitors
      expect(screen.getByText('5.7K')).toBeInTheDocument() // Pageviews
      expect(screen.getByText('45%')).toBeInTheDocument() // Bounce rate
      expect(screen.getByText('3m')).toBeInTheDocument() // Avg duration
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/analytics/dashboard?period=7d')
  })

  it('should display percentage changes with correct styling', async () => {
    render(<AnalyticsClient />)

    await waitFor(() => {
      const increaseElements = screen.getAllByText(/\+13%/)
      expect(increaseElements[0]).toHaveClass('positive')
      
      const decreaseElements = screen.getAllByText(/-5%/)
      expect(decreaseElements[0]).toHaveClass('negative')
    })
  })

  it('should handle time period selection', async () => {
    const user = userEvent.setup()
    render(<AnalyticsClient />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('7d')).toBeInTheDocument()
    })

    // Change time period selector
    const selector = screen.getByDisplayValue('7d')
    await user.selectOptions(selector, '30d')

    await waitFor(() => {
      expect(global.fetch).toHaveBeenLastCalledWith('/api/analytics/dashboard?period=30d')
    })
  })

  it('should render charts when data is available', async () => {
    render(<AnalyticsClient />)

    await waitFor(() => {
      // Check for top pages section
      expect(screen.getByText('Top Pages')).toBeInTheDocument()
      expect(screen.getByText('/')).toBeInTheDocument()
      expect(screen.getByText('/about')).toBeInTheDocument()
      
      // Check for traffic sources
      expect(screen.getByText('Traffic Sources')).toBeInTheDocument()
      expect(screen.getByText('google')).toBeInTheDocument()
    })
  })

  it('should display real-time visitors when available', async () => {
    render(<AnalyticsClient />)

    await waitFor(() => {
      expect(screen.getByText('42')).toBeInTheDocument()
      expect(screen.getByText('Current visitors')).toBeInTheDocument()
    })
  })

  it('should handle error states', async () => {
    ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

    render(<AnalyticsClient />)

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })
  })

  it('should retry on error', async () => {
    const user = userEvent.setup()
    ;(global.fetch as any)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: createMockDashboardData() }),
      })

    render(<AnalyticsClient />)

    await waitFor(() => {
      expect(screen.getByText(/Failed to load analytics data/)).toBeInTheDocument()
    })

    const retryButton = screen.getByText('Retry')
    await user.click(retryButton)

    await waitFor(() => {
      expect(screen.getByText('1,234')).toBeInTheDocument()
    })
  })

  it('should handle empty data gracefully', async () => {
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: null }),
    })

    render(<AnalyticsClient />)

    await waitFor(() => {
      expect(screen.getByText('No analytics data available')).toBeInTheDocument()
    })
  })

  it('should update data when refresh button is clicked', async () => {
    const user = userEvent.setup()
    let callCount = 0
    
    ;(global.fetch as any).mockImplementation(() => {
      callCount++
      return Promise.resolve({
        ok: true,
        json: async () => ({
          data: createMockDashboardData({
            stats: {
              visitors: callCount * 100,
              pageviews: callCount * 200,
              bounceRate: 45.2,
              avgDuration: 180,
              visitorsChange: 0,
              pageviewsChange: 0,
              bounceRateChange: 0,
              avgDurationChange: 0,
            },
          }),
        }),
      })
    })

    render(<AnalyticsClient />)

    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument()
    })

    const refreshButton = screen.getByLabelText('Refresh analytics')
    await user.click(refreshButton)

    await waitFor(() => {
      expect(screen.getByText('200')).toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  it('should render custom events section when available', async () => {
    render(<AnalyticsClient />)

    await waitFor(() => {
      expect(screen.getByText('Goals & Events')).toBeInTheDocument()
      expect(screen.getByText('Signup')).toBeInTheDocument()
    })
  })

  it('should handle different time period formats', async () => {
    render(<AnalyticsClient />)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/analytics/dashboard?period=7d')
    })
  })
})