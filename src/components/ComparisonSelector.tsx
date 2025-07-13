'use client'

import React, { useState, useEffect } from 'react'
import { SelectInput } from '@payloadcms/ui'
import type { ComparisonOption, ComparisonData } from '../types'

interface ComparisonSelectorProps {
  value: ComparisonData | null
  onChange: (value: ComparisonData | null) => void
  currentPeriod: string
  currentStartDate?: string
  currentEndDate?: string
}

const COMPARISON_OPTIONS = [
  { label: 'No comparison', value: 'none' },
  { label: 'Previous period', value: 'previousPeriod' },
  { label: 'Same period last year', value: 'sameLastYear' },
  { label: 'Custom date range', value: 'custom' },
]

export const ComparisonSelector: React.FC<ComparisonSelectorProps> = ({
  value,
  onChange,
  currentPeriod,
  currentStartDate,
  currentEndDate,
}) => {
  const [showCustomDates, setShowCustomDates] = useState(false)
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

  useEffect(() => {
    if (value?.period === 'custom') {
      setShowCustomDates(true)
      setCustomStartDate(value.customStartDate || '')
      setCustomEndDate(value.customEndDate || '')
    } else {
      setShowCustomDates(false)
    }
  }, [value])

  const handleComparisonChange = (option: any) => {
    if (!option || option.value === 'none') {
      onChange(null)
      setShowCustomDates(false)
      return
    }

    const newValue = option.value as ComparisonOption
    
    if (newValue === 'custom') {
      setShowCustomDates(true)
      onChange({
        period: 'custom',
        customStartDate: customStartDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        customEndDate: customEndDate || new Date().toISOString().split('T')[0],
      })
    } else {
      setShowCustomDates(false)
      onChange({ period: newValue })
    }
  }

  const handleCustomDateChange = (start: string, end: string) => {
    if (start && end) {
      onChange({
        period: 'custom',
        customStartDate: start,
        customEndDate: end,
      })
    }
  }

  return (
    <div className="analytics-comparison-wrapper">
      <div style={{ marginBottom: showCustomDates ? '1rem' : 0 }}>
        <SelectInput
          label="Compare to"
          name="analytics-comparison"
          path="analytics-comparison"
          value={value ? (value.period === 'custom' ? 'custom' : value.period) : 'none'}
          onChange={handleComparisonChange}
          options={COMPARISON_OPTIONS}
        />
      </div>
      
      {showCustomDates && (
        <div style={{ 
          display: 'flex', 
          gap: '1rem',
          alignItems: 'flex-end'
        }}>
          <div style={{ flex: 1 }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              color: 'var(--theme-text-light)'
            }}>
              Comparison start date
            </label>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => {
                setCustomStartDate(e.target.value)
                handleCustomDateChange(e.target.value, customEndDate)
              }}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid var(--theme-elevation-200)',
                borderRadius: 'var(--style-radius-s)',
                backgroundColor: 'var(--theme-elevation-50)',
                color: 'var(--theme-text)',
                fontSize: '0.875rem',
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              color: 'var(--theme-text-light)'
            }}>
              Comparison end date
            </label>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => {
                setCustomEndDate(e.target.value)
                handleCustomDateChange(customStartDate, e.target.value)
              }}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid var(--theme-elevation-200)',
                borderRadius: 'var(--style-radius-s)',
                backgroundColor: 'var(--theme-elevation-50)',
                color: 'var(--theme-text)',
                fontSize: '0.875rem',
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}