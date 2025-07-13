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
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false)
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        let url = `/api/analytics/dashboard?period=${period}`
        if (period === 'custom' && customStartDate && customEndDate) {
          url = `/api/analytics/dashboard?period=custom&start=${customStartDate}&end=${customEndDate}`
        }
        const response = await fetch(url)
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

    if (period !== 'custom') {
      fetchData()
    }
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
      .analytics-period-selector {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .field-type.select.analytics-period-field {
        margin-top: 1.5rem;
      }
      .analytics-period-selector label {
        font-weight: 500;
        color: var(--theme-text);
      }
      .analytics-period-selector .payload-select {
        padding: 0.5rem 2rem 0.5rem 1rem;
        border: 1px solid var(--theme-elevation-200);
        border-radius: var(--style-radius-s);
        background-color: var(--theme-elevation-0);
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23999' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 0.75rem center;
        background-size: 12px;
        color: var(--theme-text);
        font-size: var(--font-size-small);
        font-family: var(--font-family);
        line-height: var(--line-height-s);
        cursor: pointer;
        appearance: none;
        transition: all var(--transition-duration-default) var(--transition-timing-default);
      }
      .analytics-period-selector .payload-select:hover {
        border-color: var(--theme-elevation-300);
        background-color: var(--theme-elevation-50);
      }
      .analytics-period-selector .payload-select:focus {
        outline: none;
        border-color: var(--theme-success-500);
        box-shadow: 0 0 0 3px var(--theme-success-100);
      }
      .card {
        background: var(--theme-elevation-100);
        border: 1px solid var(--theme-elevation-200);
        border-radius: var(--style-radius-m);
        padding: calc(var(--base) * 1.5);
      }
      .table-card {
        border: 1px solid var(--theme-elevation-200);
        border-radius: var(--style-radius-m);
        padding: calc(var(--base) * 1.5);
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
      .analytics-custom-date-picker {
        display: flex;
        gap: 1rem;
        align-items: center;
        margin-top: 1rem;
        margin-bottom: 2rem;
        padding: 1rem;
        background: var(--theme-elevation-50);
        border: 1px solid var(--theme-elevation-200);
        border-radius: var(--style-radius-m);
      }
      .analytics-custom-date-picker input[type="date"] {
        padding: 0.5rem 1rem;
        border: 1px solid var(--theme-elevation-200);
        border-radius: var(--style-radius-s);
        background-color: var(--theme-elevation-0);
        color: var(--theme-text);
        font-size: var(--font-size-small);
        font-family: var(--font-family);
        line-height: var(--line-height-s);
      }
      .analytics-custom-date-picker input[type="date"]:focus {
        outline: none;
        border-color: var(--theme-success-500);
        box-shadow: 0 0 0 3px var(--theme-success-100);
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
        .analytics-custom-date-picker {
          flex-direction: column;
          align-items: stretch;
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

  if (error || !data || !data.stats) {
    return (
      <div className="payload__message payload__message--error">
        {error || 'Unable to load analytics data'}
      </div>
    )
  }

  const { stats, timeseries = [], pages = [], sources = [], events = [], realtime = { visitors: 0 } } = data

  return (
    <div>
      {/* Controls */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div className="field-type select analytics-period-field">
          <label className="field-label" htmlFor="analytics-period">Time Period</label>
          <div className="field-type__wrap">
            <select
              id="analytics-period"
              value={period}
              onChange={(e) => {
                const newPeriod = e.target.value as TimePeriod
                setPeriod(newPeriod)
                setShowCustomDatePicker(newPeriod === 'custom')
              }}
              className="payload__select"
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

      {/* Custom Date Picker */}
      {showCustomDatePicker && (
        <div className="analytics-custom-date-picker">
          <div>
            <label htmlFor="start-date" style={{ marginRight: '0.5rem' }}>From:</label>
            <input
              type="date"
              id="start-date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label htmlFor="end-date" style={{ marginRight: '0.5rem' }}>To:</label>
            <input
              type="date"
              id="end-date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              min={customStartDate}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          <button
            className={`btn btn--icon-style-without-border btn--size-medium btn--withoutPopup btn--style-primary ${(!customStartDate || !customEndDate) ? 'btn--disabled' : ''}`}
            type="button"
            onClick={async () => {
              if (customStartDate && customEndDate) {
                setLoading(true)
                try {
                  const url = `/api/analytics/dashboard?period=custom&start=${customStartDate}&end=${customEndDate}`
                  const response = await fetch(url)
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
            }}
            disabled={!customStartDate || !customEndDate}
          >
            <span className="btn__content">
              <span className="btn__label">Apply</span>
            </span>
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        <div className="card" style={{ flexDirection: 'column' }}>
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

        <div className="card" style={{ flexDirection: 'column' }}>
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

        <div className="card" style={{ flexDirection: 'column' }}>
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

        <div className="card" style={{ flexDirection: 'column' }}>
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
        <div className="card" style={{ flexDirection: 'column' }}>
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
                  tick={{ fill: 'var(--theme-text)' }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="var(--theme-text-light)"
                  style={{ fontSize: '0.75rem' }}
                  tick={{ fill: 'var(--theme-text)' }}
                  tickFormatter={formatNumber}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--theme-elevation-100)',
                    border: '1px solid var(--theme-elevation-200)',
                    borderRadius: 'var(--style-radius-m)',
                    padding: 'calc(var(--base) * 1.5)'
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
        <div className="table-card">
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

        <div className="table-card">
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
          <div className="table-card">
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