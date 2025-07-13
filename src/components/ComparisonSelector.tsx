'use client'

import React, {useState, useEffect} from 'react'
import {SelectInput} from '@payloadcms/ui'
import type {ComparisonOption, ComparisonData} from '../types'

interface ComparisonSelectorProps {
    value: ComparisonData | null
    onChange: (value: ComparisonData | null) => void
    currentPeriod: string
    currentStartDate?: string
    currentEndDate?: string
}

const COMPARISON_OPTIONS = [
    {label: 'No comparison', value: 'none'},
    {label: 'Previous period', value: 'previousPeriod'},
    {label: 'Same period last year', value: 'sameLastYear'},
    {label: 'Custom date range', value: 'custom'},
]

export const ComparisonSelector: React.FC<ComparisonSelectorProps> = ({
                                                                          value,
                                                                          onChange,
                                                                          currentPeriod,
                                                                          currentStartDate,
                                                                          currentEndDate,
                                                                      }) => {

    const handleComparisonChange = (option: any) => {
        if (!option || option.value === 'none') {
            onChange(null)
            return
        }

        const newValue = option.value as ComparisonOption

        if (newValue === 'custom') {
            onChange({
                period: 'custom',
                customStartDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                customEndDate: new Date().toISOString().split('T')[0],
            })
        } else {
            onChange({period: newValue})
        }
    }

    return (
        <SelectInput
            label="Compare to"
            name="analytics-comparison"
            path="analytics-comparison"
            value={value ? (value.period === 'custom' ? 'custom' : value.period) : 'none'}
            onChange={handleComparisonChange}
            options={COMPARISON_OPTIONS}
            isClearable={false}
            isSortable={false}
        />
    )
}