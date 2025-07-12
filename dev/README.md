# Payload Analytics Plugin Development Environment

This is a local development environment for testing the Payload Analytics Plugin.

## Setup

1. Copy `.env.example` to `.env` and add your analytics provider credentials:
   ```bash
   cp .env.example .env
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Build the parent plugin first:
   ```bash
   cd ..
   pnpm build
   cd dev
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

5. Open http://localhost:3000/admin in your browser

6. Create a user account or use the auto-login if configured

7. Click on "Analytics" in the navigation to view the dashboard

## Testing Different Providers

To test different analytics providers, modify the `payload.config.ts` file:

```typescript
// For Plausible (default)
analyticsPlugin({
  provider: 'plausible',
  config: {
    apiKey: process.env.PLAUSIBLE_API_KEY,
    siteId: process.env.PLAUSIBLE_SITE_ID,
  },
})

// For Umami
analyticsPlugin({
  provider: 'umami',
  config: {
    apiKey: process.env.UMAMI_API_KEY,
    siteId: process.env.UMAMI_SITE_ID,
    apiHost: process.env.UMAMI_API_HOST,
  },
})

// For Matomo
analyticsPlugin({
  provider: 'matomo',
  config: {
    apiToken: process.env.MATOMO_API_TOKEN,
    siteId: process.env.MATOMO_SITE_ID,
    apiHost: process.env.MATOMO_API_HOST,
  },
})

// For PostHog
analyticsPlugin({
  provider: 'posthog',
  config: {
    apiKey: process.env.POSTHOG_API_KEY,
    projectId: process.env.POSTHOG_PROJECT_ID,
  },
})

// For Google Analytics
analyticsPlugin({
  provider: 'google-analytics',
  config: {
    propertyId: process.env.GOOGLE_ANALYTICS_PROPERTY_ID,
    apiKey: process.env.GOOGLE_ANALYTICS_API_KEY,
  },
})
```

## Testing Custom Date Ranges

The plugin now supports all Plausible date ranges:
- Today
- Last 7 days
- Last 30 days
- Month to date
- Last 6 months
- Last 12 months
- Year to date
- All time
- Custom date range

When "Custom date" is selected, a date picker will appear allowing you to select a custom date range.

## Hot Reload

Changes to the plugin source code will automatically reload thanks to the file link in package.json. Just save your changes and the dev server will pick them up.