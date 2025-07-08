'use client'

import React, { useEffect, useState } from 'react'
import { formatNumber, formatPercentage, formatDuration } from '../lib/formatters'
import type { DashboardData } from '../types'

export const AnalyticsWidget: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

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
    <div style={{
      background: 'var(--theme-elevation-100)',
      border: '1px solid var(--theme-elevation-200)',
      borderRadius: '8px',
      padding: '1.5rem',
      marginBottom: '2rem',
    }}>
      <h3 style={{ 
        fontSize: '1rem', 
        fontWeight: '600', 
        marginBottom: '1rem',
        color: 'var(--theme-text)'
      }}>
        Today's Analytics
      </h3>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
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
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--theme-elevation-200)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          color: 'var(--theme-text-light)'
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