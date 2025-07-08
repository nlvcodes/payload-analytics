import React from 'react'
import { AfterNavLinksClient } from './AfterNavLinksClient'

export const AfterNavLinks: React.FC = () => {
  // Get the provider name and icon preference from global config
  const providerName = (global as any).__analyticsProviderName || 'plausible'
  const useGenericIcon = (global as any).__analyticsUseGenericIcon || false
  
  return <AfterNavLinksClient provider={providerName} useGenericIcon={useGenericIcon} />
}

export default AfterNavLinks