'use client'

import React from 'react'
import { useFormFields } from '@payloadcms/ui'
import { CollectionAnalytics } from './CollectionAnalytics'

interface CollectionAnalyticsFieldProps {
  collectionSlug: string
  rootPath: string
}

export const CollectionAnalyticsField: React.FC<CollectionAnalyticsFieldProps> = ({ 
  collectionSlug, 
  rootPath 
}) => {
  // Get the current document's slug from form fields
  const { slug } = useFormFields(([fields]) => {
    return {
      slug: fields?.slug?.value as string | undefined
    }
  })

  if (!slug) {
    return null
  }

  return (
    <CollectionAnalytics 
      collectionSlug={collectionSlug}
      documentSlug={slug}
      rootPath={rootPath}
    />
  )
}

export default CollectionAnalyticsField