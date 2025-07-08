'use client'

import React, { useEffect, useState } from 'react'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { formatNumber, formatDuration, formatPercentage, formatChange, formatAxisDate, formatTooltipDate } from '../lib/formatters'
import type { DashboardData, TimePeriod } from '../types'
import { TIME_PERIOD_LABELS } from '../constants'
import './Analytics.css'

export const AnalyticsClient: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Get config from global
  const timePeriods = (window as any).__analyticsTimePeriods || ['day', '7d', '30d', '12mo']
  const defaultTimePeriod = (window as any).__analyticsDefaultTimePeriod || '7d'
  const enableComparison = (window as any).__analyticsEnableComparison !== false
  
  const [period, setPeriod] = useState<TimePeriod>(defaultTimePeriod)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/analytics/dashboard?period=${period}`)
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data')
        }
        const analyticsData = await response.json()
        setData(analyticsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [period])

  if (loading) {
    return <div className="analytics-loading">Loading analytics...</div>
  }

  if (error || !data) {
    return <div className="analytics-error">{error || 'Unable to load analytics data'}</div>
  }

  const { stats, timeseries, pages, sources, events, realtime } = data

  return (
    <div className="analytics-container">
      <div className="analytics-controls">
        <div className="analytics-period-selector">
          <label>Time Period:</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as TimePeriod)}
            className="payload-select"
          >
            {timePeriods.map((tp: TimePeriod) => (
              <option key={tp} value={tp}>
                {TIME_PERIOD_LABELS[tp] || tp}
              </option>
            ))}
          </select>
        </div>
        <div className="analytics-realtime">
          <span className="analytics-realtime-dot"></span>
          <span>{realtime.visitors} visitor{realtime.visitors !== 1 ? 's' : ''} online now</span>
        </div>
      </div>

      <div className="analytics-stats-grid">
        <div className="analytics-stat-card">
          <h3>Visitors</h3>
          <div className="analytics-stat-value">{formatNumber(stats.visitors.value)}</div>
          {enableComparison && (
            <div
              className={`analytics-stat-change ${stats.visitors.change && stats.visitors.change > 0 ? 'positive' : 'negative'}`}>
              {formatChange(stats.visitors.change).text} from previous period
            </div>
          )}
        </div>

        <div className="analytics-stat-card">
          <h3>Pageviews</h3>
          <div className="analytics-stat-value">{formatNumber(stats.pageviews.value)}</div>
          {enableComparison && (
            <div
              className={`analytics-stat-change ${stats.pageviews.change && stats.pageviews.change > 0 ? 'positive' : 'negative'}`}>
              {formatChange(stats.pageviews.change).text} from previous period
            </div>
          )}
        </div>

        <div className="analytics-stat-card">
          <h3>Bounce Rate</h3>
          <div className="analytics-stat-value">{formatPercentage(stats.bounce_rate.value)}</div>
          {enableComparison && (
            <div
              className={`analytics-stat-change ${stats.bounce_rate.change && stats.bounce_rate.change < 0 ? 'positive' : 'negative'}`}>
              {formatChange(stats.bounce_rate.change).text} from previous period
            </div>
          )}
        </div>

        <div className="analytics-stat-card">
          <h3>Visit Duration</h3>
          <div className="analytics-stat-value">{formatDuration(stats.visit_duration.value)}</div>
          {enableComparison && (
            <div
              className={`analytics-stat-change ${stats.visit_duration.change && stats.visit_duration.change > 0 ? 'positive' : 'negative'}`}>
              {formatChange(stats.visit_duration.change).text} from previous period
            </div>
          )}
        </div>
      </div>

      <div className="analytics-charts">
        <div className="analytics-chart-section">
          <h3>Visitors Over Time</h3>
          <div className="analytics-timeseries">
            {timeseries.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart
                  data={timeseries}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-elevation-200)" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value, index) => formatAxisDate(value, period)}
                    stroke="var(--theme-text-light)"
                    style={{ fontSize: '0.75rem' }}
                    tick={{ fill: 'var(--theme-text-light)' }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    stroke="var(--theme-text-light)"
                    style={{ fontSize: '0.75rem' }}
                    tick={{ fill: 'var(--theme-text-light)' }}
                    tickFormatter={formatNumber}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--theme-elevation-1000)',
                      border: 'none',
                      borderRadius: '4px',
                      color: 'white',
                      padding: '8px 12px',
                      fontSize: '0.875rem',
                    }}
                    labelFormatter={(value) => formatTooltipDate(value, period)}
                    formatter={(value: number) => [`${formatNumber(value)} visitors`]}
                    separator=""
                  />
                  <Area
                    type="monotone"
                    dataKey="visitors"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorVisitors)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p>No data available for this period</p>
            )}
          </div>
        </div>

        <div className="analytics-tables">
          <div className="analytics-table-section">
            <h3>Top Pages</h3>
            <table className="analytics-table">
              <thead>
              <tr>
                <th>Page</th>
                <th>Visitors</th>
                <th>Pageviews</th>
                <th>Bounce Rate</th>
              </tr>
              </thead>
              <tbody>
              {pages.map((page, index) => (
                <tr key={index}>
                  <td>{page.page}</td>
                  <td>{formatNumber(page.visitors)}</td>
                  <td>{formatNumber(page.pageviews)}</td>
                  <td>{formatPercentage(page.bounce_rate)}</td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>

          <div className="analytics-table-section">
            <h3>Top Sources</h3>
            <table className="analytics-table">
              <thead>
              <tr>
                <th>Source</th>
                <th>Visitors</th>
                <th>Bounce Rate</th>
                <th>Visit Duration</th>
              </tr>
              </thead>
              <tbody>
              {sources.map((source, index) => (
                <tr key={index}>
                  <td>{source.source}</td>
                  <td>{formatNumber(source.visitors)}</td>
                  <td>{formatPercentage(source.bounce_rate)}</td>
                  <td>{formatDuration(source.visit_duration)}</td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>

        {events && events.length > 0 && (
          <div className="analytics-table-section" style={{ marginTop: '2rem' }}>
            <h3>Custom Events / Goals</h3>
            <table className="analytics-table">
              <thead>
              <tr>
                <th>Event</th>
                <th>Unique Visitors</th>
                <th>Total Events</th>
                <th>Conversion Rate</th>
              </tr>
              </thead>
              <tbody>
              {events.map((event, index) => (
                <tr key={index}>
                  <td>{event.goal}</td>
                  <td>{formatNumber(event.visitors)}</td>
                  <td>{formatNumber(event.events)}</td>
                  <td>{formatPercentage(event.conversion_rate)}</td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}