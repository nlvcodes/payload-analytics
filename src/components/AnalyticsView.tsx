import React from 'react'
import { AnalyticsClient } from './AnalyticsClient'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter, SetStepNav } from '@payloadcms/ui'
import { AdminViewServerProps } from 'payload'

export const AnalyticsView: React.FC<AdminViewServerProps> = ({ initPageResult, params, searchParams}) => {

  if (!initPageResult.req.user) {
    return <DefaultTemplate
      i18n={initPageResult.req.i18n}
      locale={initPageResult.locale}
      params={params}
      payload={initPageResult.req.payload}
      permissions={initPageResult.permissions}
      searchParams={searchParams}
      user={undefined}
      visibleEntities={initPageResult.visibleEntities}
    >
      <Gutter>
        <h1>Unauthorized</h1>
        <p>You must be logged in to view this page.</p>
      </Gutter>
    </DefaultTemplate>
  }

  // Get config from global
  const timePeriods = (global as any).__analyticsTimePeriods
  const defaultTimePeriod = (global as any).__analyticsDefaultTimePeriod
  const enableComparison = (global as any).__analyticsEnableComparison
  const dashboardPath = (global as any).__analyticsDashboardPath || '/analytics'
  
  // Get admin route from Payload config
  const adminRoute = '/admin' // Default admin route

  const navItems = [
    {
      url: `${adminRoute}${dashboardPath}`,
      label: 'Analytics'
    }
  ]

  return <DefaultTemplate
    i18n={initPageResult.req.i18n}
    locale={initPageResult.locale}
    params={params}
    payload={initPageResult.req.payload}
    permissions={initPageResult.permissions}
    searchParams={searchParams}
    user={initPageResult.req.user || undefined}
    visibleEntities={initPageResult.visibleEntities}
  >
    <SetStepNav nav={navItems} />
    <div style={{ marginBottom: 'calc(var(--base) * 3)' }}>
      <Gutter>
        <h1>Analytics Dashboard</h1>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__analyticsTimePeriods = ${JSON.stringify(timePeriods)};
              window.__analyticsDefaultTimePeriod = ${JSON.stringify(defaultTimePeriod)};
              window.__analyticsEnableComparison = ${JSON.stringify(enableComparison)};
            `,
          }}
        />
        <AnalyticsClient />
      </Gutter>
    </div>
  </DefaultTemplate>
}

export default AnalyticsView