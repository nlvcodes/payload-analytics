'use client'

import React, { useEffect, useState } from 'react'
import { formatNumber, formatPercentage, formatDuration } from '../lib/formatters'
import type { DashboardData } from '../types'

export const AnalyticsWidget: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  // Add styles
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      .card {
        background: var(--theme-elevation-100);
        border: 1px solid var(--theme-elevation-200);
        border-radius: var(--style-radius-m);
        padding: calc(var(--base) * 1.5);
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  useEffect(() => {
    // Widget always shows today's data
    fetch('/api/analytics/dashboard?period=day')
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading || !data) {
    return null
  }

  return (
    <div className="card" style={{ marginBottom: '2rem', display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
      <h3 style={{ 
        fontSize: '1rem', 
        fontWeight: '600', 
        margin: 0,
        color: 'var(--theme-text)',
        flexShrink: 0
      }}>
        Today's Analytics
      </h3>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '1.5rem',
        flex: 1
      }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--theme-text-light)' }}>Visitors</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--theme-text)' }}>
            {formatNumber(data.stats.visitors.value)}
          </div>
        </div>
        
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--theme-text-light)' }}>Pageviews</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--theme-text)' }}>
            {formatNumber(data.stats.pageviews.value)}
          </div>
        </div>
        
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--theme-text-light)' }}>Bounce Rate</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--theme-text)' }}>
            {formatPercentage(data.stats.bounce_rate.value)}
          </div>
        </div>
        
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--theme-text-light)' }}>Avg Duration</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--theme-text)' }}>
            {formatDuration(data.stats.visit_duration.value)}
          </div>
        </div>
      </div>
      
      {data.realtime.visitors > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          color: 'var(--theme-text-light)',
          flexShrink: 0
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            backgroundColor: '#10b981',
            borderRadius: '50%',
            display: 'inline-block'
          }} />
          {data.realtime.visitors} visitor{data.realtime.visitors !== 1 ? 's' : ''} online now
        </div>
      )}
    </div>
  )
}

export default AnalyticsWidget