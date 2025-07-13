import type { Field } from 'payload'

export const createAnalyticsTab = (collectionSlug: string, rootPath: string): Field => ({
  type: 'tabs',
  tabs: [
    {
      label: 'Analytics',
      fields: [
        {
          name: 'analyticsDisplay',
          type: 'ui',
          admin: {
            components: {
              Field: {
                path: 'payload-analytics-plugin/components/CollectionAnalyticsField',
                exportName: 'default',
                clientProps: {
                  collectionSlug,
                  rootPath,
                },
              },
            },
            condition: (data) => {
              // Only show tab if document has a slug and is not new
              return Boolean(data?.slug && data?.id)
            },
          },
        },
      ],
    },
  ],
})