import React from 'react'
import { AfterNavLinksClient } from './AfterNavLinksClient'

export const AfterNavLinks: React.FC = () => {
  // Get the provider name and icon preference from global config
  const providerName = (global as any).__analyticsProviderName || 'plausible'
  const useGenericIcon = (global as any).__analyticsUseGenericIcon || false
  const dashboardPath = (global as any).__analyticsDashboardPath || '/analytics'
  const adminRoute = (global as any).__adminRoute || '/admin'
  
  return <AfterNavLinksClient provider={providerName} useGenericIcon={useGenericIcon} dashboardPath={dashboardPath} adminRoute={adminRoute} />
}

export default AfterNavLinks