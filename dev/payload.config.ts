import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { buildConfig } from 'payload'
import { analyticsPlugin } from 'payload-analytics-plugin'
import { fileURLToPath } from 'url'
import path from 'path'
import {lexicalEditor} from '@payloadcms/richtext-lexical'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  editor: lexicalEditor({}),
  admin: {
    user: 'users',
    // autoLogin: {
    //   email: 'dev@payloadcms.com',
    //   password: 'test',
    // },
  },
  collections: [
    {
      slug: 'users',
      auth: true,
      fields: [],
    },
    {
      slug: 'posts',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'content',
          type: 'text',
        },
      ],
    },
  ],
  secret: process.env.PAYLOAD_SECRET || 'YOUR-SECRET-HERE',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || 'mongodb://localhost/payload-analytics-dev',
  }),
  plugins: [
    analyticsPlugin({
      provider: 'plausible',
      config: {
        apiKey: process.env.PLAUSIBLE_API_KEY,
        siteId: process.env.PLAUSIBLE_SITE_ID,
        apiHost: 'https://plausible.io',
      },
      // Test with expanded time periods
      timePeriods: ['day', '7d', '30d', 'month', '6mo', '12mo', 'year', 'all', 'custom'],
    }),
  ],
})