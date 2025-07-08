import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { slateEditor } from '@payloadcms/richtext-slate'
import { analyticsPlugin } from '../../src'
import { createMockProvider } from '../utils/test-helpers'

export default buildConfig({
  secret: 'test-secret',
  collections: [],
  admin: {
    autoLogin: {
      email: 'test@example.com',
      password: 'test',
    },
  },
  editor: slateEditor({}),
  db: mongooseAdapter({
    url: process.env.MONGODB_URI || 'mongodb://localhost:27017/payload-analytics-test',
  }),
  plugins: [
    analyticsPlugin({
      provider: createMockProvider('test'),
      enabled: true,
      enableDashboard: true,
      dashboardWidget: true,
      analyticsView: true,
    }),
  ],
  typescript: {
    outputFile: './test/e2e/payload-types.ts',
  },
})