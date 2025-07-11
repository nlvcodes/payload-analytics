'use client'

import React, { useEffect, useState } from 'react'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { formatNumber, formatDuration, formatPercentage, formatChange, formatAxisDate, formatTooltipDate } from '../lib/formatters'
import type { DashboardData, TimePeriod } from '../types'
import { TIME_PERIOD_LABELS } from '../constants'

export const AnalyticsClient: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Get config from global - safe for SSR
  const [timePeriods, setTimePeriods] = useState<TimePeriod[]>(['day', '7d', '30d', '12mo'])
  const [defaultTimePeriod, setDefaultTimePeriod] = useState<TimePeriod>('7d')
  const [enableComparison, setEnableComparison] = useState<boolean>(true)
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setTimePeriods((window as any).__analyticsTimePeriods || ['day', '7d', '30d', '12mo'])
      setDefaultTimePeriod((window as any).__analyticsDefaultTimePeriod || '7d')
      setEnableComparison((window as any).__analyticsEnableComparison !== false)
    }
  }, [])
  
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

  // Add custom styles for analytics
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes pulse {
        0% {
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
        }
        70% {
          box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
        }
      }
      .analytics-realtime-dot {
        width: 8px;
        height: 8px;
        background-color: #10b981;
        border-radius: 50%;
        animation: pulse 2s infinite;
        display: inline-block;
        vertical-align: middle;
        margin-right: 0.5rem;
      }
      .analytics-period-field {
        margin-bottom: 0;
      }
      .analytics-period-field .field-label {
        margin-bottom: 0.5rem;
      }
      .analytics-stat-change.positive {
        color: var(--theme-success-600);
      }
      .analytics-stat-change.negative {
        color: var(--theme-error-600);
      }
      .analytics-table {
        width: 100%;
        border-collapse: collapse;
      }
      .analytics-table th {
        text-align: left;
        font-weight: 500;
        color: var(--theme-text-light);
        padding: 0.75rem 1rem;
        border-bottom: 1px solid var(--theme-elevation-150);
        font-size: 0.875rem;
      }
      .analytics-table td {
        padding: 0.75rem 1rem;
        color: var(--theme-text);
        font-size: 0.875rem;
        border-bottom: 1px solid var(--theme-elevation-100);
      }
      .analytics-table tr:last-child td {
        border-bottom: none;
      }
      @media (max-width: 768px) {
        .analytics-tables {
          grid-template-columns: 1fr;
        }
        .analytics-table-section {
          overflow-x: auto;
        }
        .analytics-table {
          min-width: 400px;
        }
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  if (loading) {
    return (
      <div className="payload__loading-overlay">
        <div className="payload__loading-overlay__bars">
          <div />
          <div />
          <div />
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="payload__message payload__message--error">
        {error || 'Unable to load analytics data'}
      </div>
    )
  }

  const { stats, timeseries, pages, sources, events, realtime } = data

  return (
    <div>
      {/* Controls */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-end', 
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div className="field-type select analytics-period-field" style={{ maxWidth: '300px', flex: '0 1 auto' }}>
          <label className="field-label" htmlFor="analytics-period">Time Period</label>
          <div className="field-type__wrap">
            <select
              id="analytics-period"
              value={period}
              onChange={(e) => setPeriod(e.target.value as TimePeriod)}
              className="payload__select"
              style={{ width: '100%' }}
            >
              {timePeriods.map((tp: TimePeriod) => (
                <option key={tp} value={tp}>
                  {TIME_PERIOD_LABELS[tp] || tp}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          color: 'var(--theme-text-light)',
          fontSize: '0.875rem'
        }}>
          <span className="analytics-realtime-dot"></span>
          <span>{realtime.visitors} visitor{realtime.visitors !== 1 ? 's' : ''} online now</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        <div className="gutter gutter--left gutter--right" style={{
          border: '1px solid var(--theme-elevation-200)',
          borderRadius: 'var(--border-radius-m)',
          padding: 'calc(var(--base) * 1.5)'
        }}>
          <h3 style={{
            fontSize: '0.875rem',
            fontWeight: 500,
            color: 'var(--theme-text-light)',
            margin: '0 0 0.5rem 0',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>Visitors</h3>
          <div style={{
            fontSize: '2rem',
            fontWeight: 600,
            color: 'var(--theme-text)',
            marginBottom: '0.5rem'
          }}>{formatNumber(stats.visitors.value)}</div>
          {enableComparison && (
            <div className={`analytics-stat-change ${stats.visitors.change && stats.visitors.change > 0 ? 'positive' : 'negative'}`} style={{
              fontSize: '0.875rem'
            }}>
              {formatChange(stats.visitors.change).text} from previous period
            </div>
          )}
        </div>

        <div className="gutter gutter--left gutter--right" style={{
          border: '1px solid var(--theme-elevation-200)',
          borderRadius: 'var(--border-radius-m)',
          padding: 'calc(var(--base) * 1.5)'
        }}>
          <h3 style={{
            fontSize: '0.875rem',
            fontWeight: 500,
            color: 'var(--theme-text-light)',
            margin: '0 0 0.5rem 0',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>Pageviews</h3>
          <div style={{
            fontSize: '2rem',
            fontWeight: 600,
            color: 'var(--theme-text)',
            marginBottom: '0.5rem'
          }}>{formatNumber(stats.pageviews.value)}</div>
          {enableComparison && (
            <div className={`analytics-stat-change ${stats.pageviews.change && stats.pageviews.change > 0 ? 'positive' : 'negative'}`} style={{
              fontSize: '0.875rem'
            }}>
              {formatChange(stats.pageviews.change).text} from previous period
            </div>
          )}
        </div>

        <div className="gutter gutter--left gutter--right" style={{
          border: '1px solid var(--theme-elevation-200)',
          borderRadius: 'var(--border-radius-m)',
          padding: 'calc(var(--base) * 1.5)'
        }}>
          <h3 style={{
            fontSize: '0.875rem',
            fontWeight: 500,
            color: 'var(--theme-text-light)',
            margin: '0 0 0.5rem 0',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>Bounce Rate</h3>
          <div style={{
            fontSize: '2rem',
            fontWeight: 600,
            color: 'var(--theme-text)',
            marginBottom: '0.5rem'
          }}>{formatPercentage(stats.bounce_rate.value)}</div>
          {enableComparison && (
            <div className={`analytics-stat-change ${stats.bounce_rate.change && stats.bounce_rate.change < 0 ? 'positive' : 'negative'}`} style={{
              fontSize: '0.875rem'
            }}>
              {formatChange(stats.bounce_rate.change).text} from previous period
            </div>
          )}
        </div>

        <div className="gutter gutter--left gutter--right" style={{
          border: '1px solid var(--theme-elevation-200)',
          borderRadius: 'var(--border-radius-m)',
          padding: 'calc(var(--base) * 1.5)'
        }}>
          <h3 style={{
            fontSize: '0.875rem',
            fontWeight: 500,
            color: 'var(--theme-text-light)',
            margin: '0 0 0.5rem 0',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>Visit Duration</h3>
          <div style={{
            fontSize: '2rem',
            fontWeight: 600,
            color: 'var(--theme-text)',
            marginBottom: '0.5rem'
          }}>{formatDuration(stats.visit_duration.value)}</div>
          {enableComparison && (
            <div className={`analytics-stat-change ${stats.visit_duration.change && stats.visit_duration.change > 0 ? 'positive' : 'negative'}`} style={{
              fontSize: '0.875rem'
            }}>
              {formatChange(stats.visit_duration.change).text} from previous period
            </div>
          )}
        </div>
      </div>

      {/* Chart Section */}
      <div style={{ marginBottom: '3rem' }}>
        <h3 style={{
          fontSize: '1.125rem',
          fontWeight: 600,
          color: 'var(--theme-text)',
          margin: '0 0 1.5rem 0'
        }}>Visitors Over Time</h3>
        <div className="gutter gutter--left gutter--right" style={{
          border: '1px solid var(--theme-elevation-200)',
          borderRadius: 'var(--border-radius-m)',
          padding: 'calc(var(--base) * 1.5)'
        }}>
          {timeseries.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart
                data={timeseries}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--theme-success-600)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--theme-success-600)" stopOpacity={0.05} />
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
                    backgroundColor: 'var(--theme-elevation-50)',
                    border: '1px solid var(--theme-elevation-150)',
                    borderRadius: 'var(--border-radius-s)',
                    color: 'var(--theme-text)',
                    padding: '8px 12px',
                    fontSize: '0.875rem',
                    boxShadow: 'var(--shadow-lg)'
                  }}
                  labelStyle={{
                    color: 'var(--theme-text)',
                    marginBottom: '4px',
                    fontWeight: '600'
                  }}
                  itemStyle={{
                    color: 'var(--theme-text)',
                    padding: '2px 0'
                  }}
                  labelFormatter={(value) => formatTooltipDate(value, period)}
                  formatter={(value: number) => [`${formatNumber(value)} visitors`, '']}
                  separator=""
                />
                <Area
                  type="monotone"
                  dataKey="visitors"
                  stroke="var(--theme-success-600)"
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

      {/* Tables */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '2rem'
      }}>
        <div className="gutter gutter--left gutter--right" style={{
          border: '1px solid var(--theme-elevation-200)',
          borderRadius: 'var(--border-radius-m)',
          padding: 'calc(var(--base) * 1.5)'
        }}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--theme-text)',
            margin: '0 0 1rem 0'
          }}>Top Pages</h3>
          <div className="table">
            <table className="analytics-table" cellPadding="0" cellSpacing="0">
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
        </div>

        <div className="gutter gutter--left gutter--right" style={{
          border: '1px solid var(--theme-elevation-200)',
          borderRadius: 'var(--border-radius-m)',
          padding: 'calc(var(--base) * 1.5)'
        }}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--theme-text)',
            margin: '0 0 1rem 0'
          }}>Top Sources</h3>
          <div className="table">
            <table className="analytics-table" cellPadding="0" cellSpacing="0">
              <thead>
              <tr>
                <th>Source</th>
                <th>Visitors</th>
                <th>Bounce Rate</th>
                <th>Duration</th>
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

        {events.length > 0 && (
          <div className="gutter gutter--left gutter--right" style={{
            background: 'var(--theme-elevation-100)',
            border: '1px solid var(--theme-elevation-200)',
            borderRadius: 'var(--border-radius-m)',
            padding: 'calc(var(--base) * 1.5)'
          }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--theme-text)',
              margin: '0 0 1rem 0'
            }}>Top Events</h3>
            <div className="table">
              <table className="analytics-table" cellPadding="0" cellSpacing="0">
                <thead>
                <tr>
                  <th>Event</th>
                  <th>Count</th>
                </tr>
                </thead>
                <tbody>
                {events.map((event, index) => (
                  <tr key={index}>
                    <td>{event.goal}</td>
                    <td>{formatNumber(event.events)}</td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}