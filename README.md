# Payload Analytics Plugin

A powerful third-party analytics plugin for Payload CMS that integrates with popular analytics providers. Supports Plausible Analytics, Umami, Matomo, PostHog, and Google Analytics.

**Note**: This is not an official Payload CMS plugin. It's a community-contributed plugin.

## Features

- 📊 Beautiful analytics dashboard integrated into Payload admin
- 📈 Real-time visitor tracking
- 📉 Historical data with customizable time periods
- 🎯 Goals and custom events tracking
- 🌍 Traffic sources analysis
- 📱 Responsive design
- 🔌 Extensible provider system
- 🎨 Styled to match Payload's admin UI
- 🎯 Dynamic navigation icons based on provider (Plausible, Umami, Matomo, PostHog, Google Analytics logos)
- 📊 Option to use generic analytics icon

## Installation

```bash
npm install payload-analytics-plugin
# or
yarn add payload-analytics-plugin
# or
pnpm add payload-analytics-plugin
```

## Basic Usage

### Plausible Analytics

```typescript
import { buildConfig } from 'payload'
import { analyticsPlugin } from 'payload-analytics-plugin'

export default buildConfig({
  // ... your config
  plugins: [
    analyticsPlugin({
      provider: 'plausible',
      config: {
        apiKey: process.env.PLAUSIBLE_API_KEY,
        siteId: process.env.PLAUSIBLE_SITE_ID,
        apiHost: 'https://plausible.io', // or your self-hosted instance
      },
    }),
  ],
})
```

### Umami

```typescript
analyticsPlugin({
  provider: 'umami',
  config: {
    apiKey: process.env.UMAMI_API_KEY,
    siteId: process.env.UMAMI_SITE_ID,
    apiHost: 'https://analytics.example.com', // your Umami instance
  },
})
```

### Matomo

```typescript
analyticsPlugin({
  provider: 'matomo',
  config: {
    apiToken: process.env.MATOMO_API_TOKEN,
    siteId: process.env.MATOMO_SITE_ID,
    apiHost: 'https://matomo.example.com', // your Matomo instance
  },
})
```

### PostHog

```typescript
analyticsPlugin({
  provider: 'posthog',
  config: {
    apiKey: process.env.POSTHOG_API_KEY,
    projectId: process.env.POSTHOG_PROJECT_ID,
    apiHost: 'https://app.posthog.com', // or your self-hosted instance
  },
})
```

### Google Analytics

```typescript
analyticsPlugin({
  provider: 'google-analytics',
  config: {
    propertyId: process.env.GA4_PROPERTY_ID,
    apiKey: process.env.GA4_API_KEY,
  },
})
```

## Advanced Configuration

### Dashboard Widget Positioning

Control where and how the analytics widget appears on the main dashboard:

```typescript
analyticsPlugin({
  provider: 'plausible',
  dashboardWidget: {
    enabled: true,
    position: 'beforeDashboard' // or 'afterDashboard' (default)
  },
  // Or disable it entirely
  // dashboardWidget: false
})
```

### Analytics Navigation Link

Control the analytics link in the navigation:

```typescript
analyticsPlugin({
  provider: 'plausible',
  analyticsView: {
    enabled: true,
    position: 'beforeNavLinks' // or 'afterNavLinks' (default)
  },
  // Or disable it entirely
  // analyticsView: false
})
```

### Time Period Customization

Customize available time periods and set defaults:

```typescript
analyticsPlugin({
  provider: 'plausible',
  // Limit available time periods
  timePeriods: ['day', '7d', '30d'],
  // Set default time period
  defaultTimePeriod: '30d',
  // Add provider-specific custom periods
  timePeriods: ['day', '7d', '30d', 'custom_period'],
})
```

### Comparison Options

Configure period-over-period comparisons:

```typescript
analyticsPlugin({
  provider: 'plausible',
  // Disable comparisons entirely
  enableComparison: false,
  // Or customize comparison options
  comparisonOptions: ['previousPeriod', 'sameLastYear'],
})
```

## Configuration Options

### Plugin Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `provider` | `'plausible' \| 'umami' \| 'matomo' \| 'posthog' \| 'google-analytics' \| AnalyticsProvider` | `'plausible'` | Analytics provider to use |
| `plausible` | `PlausibleConfig` | `{}` | Plausible-specific configuration |
| `umami` | `UmamiConfig` | `{}` | Umami-specific configuration |
| `matomo` | `MatomoConfig` | `{}` | Matomo-specific configuration |
| `posthog` | `PostHogConfig` | `{}` | PostHog-specific configuration |
| `googleAnalytics` | `GoogleAnalyticsConfig` | `{}` | Google Analytics-specific configuration |
| `enabled` | `boolean` | `true` | Enable/disable the plugin |
| `enableDashboard` | `boolean` | `true` | Show analytics dashboard in admin |
| `dashboardPath` | `string` | `'/analytics'` | Path for the analytics dashboard |
| `dashboardWidget` | `DashboardWidgetConfig \| boolean` | `{ enabled: true, position: 'afterDashboard' }` | Dashboard widget configuration |
| `analyticsView` | `AnalyticsViewConfig \| boolean` | `{ enabled: true, position: 'afterNavLinks' }` | Analytics navigation link configuration |
| `customNavigation` | `boolean` | `true` | Use custom navigation with provider-specific icons |
| `useGenericIcon` | `boolean` | `false` | Use generic analytics icon instead of provider-specific icons |
| `timePeriods` | `TimePeriod[]` | `['day', '7d', '14d', '30d', 'lastMonth', 'thisMonth', '12mo', 'custom']` | Available time period options |
| `defaultTimePeriod` | `TimePeriod` | `'7d'` | Default selected time period |
| `comparisonOptions` | `ComparisonOption[]` | `['previousPeriod', 'sameLastYear', 'custom']` | Available comparison options |
| `enableComparison` | `boolean` | `true` | Enable period-over-period comparisons |
| `collections` | `Record<string, CollectionAnalyticsConfig>` | `{}` | Enable analytics tabs for specific collections |

### Provider Configurations

#### Plausible

| Option | Type | Description |
|--------|------|-------------|
| `apiKey` | `string` | Your Plausible API key |
| `siteId` | `string` | Your site ID in Plausible |
| `apiHost` | `string` | Plausible API host (defaults to plausible.io) |

#### Umami

| Option | Type | Description |
|--------|------|-------------|
| `apiKey` | `string` | Your Umami API key |
| `siteId` | `string` | Your website ID in Umami |
| `apiHost` | `string` | Your Umami instance URL |

#### Matomo

| Option | Type | Description |
|--------|------|-------------|
| `apiToken` | `string` | Your Matomo API authentication token |
| `siteId` | `string` | Your site ID in Matomo |
| `apiHost` | `string` | Your Matomo instance URL |

#### PostHog

| Option | Type | Description |
|--------|------|-------------|
| `apiKey` | `string` | Your PostHog API key |
| `projectId` | `string` | Your project ID in PostHog |
| `apiHost` | `string` | PostHog API host (defaults to app.posthog.com) |

#### Google Analytics

| Option | Type | Description |
|--------|------|-------------|
| `propertyId` | `string` | Your GA4 property ID |
| `apiKey` | `string` | Your Google Analytics API key |

### Collection Analytics

Enable analytics for specific collections to track page-level metrics:

```typescript
analyticsPlugin({
  provider: 'plausible',
  collections: {
    pages: {
      enabled: true,
      rootPath: '/',
      tabbedUI: true, // Optional: add as tab (default) or group field
      fields: ({ defaultFields }) => [...defaultFields], // Optional: customize fields
    },
    posts: {
      enabled: true,
      rootPath: '/blog',
      tabbedUI: false, // Add as group field at end of collection
    },
  },
})
```

**UI Options:**
- **With `tabbedUI: true` (default)**: Analytics are added as a tab in your collection
- **With `tabbedUI: false`**: Analytics are added as a group field at the end of your collection fields

**Manual Field Usage:**

You can also import and use the analytics field manually:

```typescript
import { CollectionAnalyticsField } from 'payload-analytics-plugin/fields'

const Pages: CollectionConfig = {
  slug: 'pages',
  fields: [
    // Your existing fields...
    CollectionAnalyticsField('/', {
      label: 'Page Analytics',
      // Other field overrides
    }),
  ],
}
```

This adds analytics showing:
- Page-specific visitor count
- Pageviews for that URL
- Bounce rate
- Average visit duration

The analytics only appear for existing documents with a slug field. The plugin constructs the tracked URL as `{rootPath}/{slug}`.

## Environment Variables

The plugin will automatically use these environment variables if not explicitly configured:

### Plausible
- `PLAUSIBLE_API_KEY` - Your Plausible API key
- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` - Your site ID
- `PLAUSIBLE_API_HOST` - API host for self-hosted instances

### Umami
- `UMAMI_API_KEY` - Your Umami API key
- `UMAMI_SITE_ID` - Your website ID
- `UMAMI_API_HOST` - Your Umami instance URL

### Matomo
- `MATOMO_API_TOKEN` - Your Matomo API authentication token
- `MATOMO_SITE_ID` - Your site ID
- `MATOMO_API_HOST` - Your Matomo instance URL

### PostHog
- `POSTHOG_API_KEY` - Your PostHog API key
- `POSTHOG_PROJECT_ID` - Your project ID
- `POSTHOG_API_HOST` - API host for self-hosted instances

### Google Analytics
- `GA4_PROPERTY_ID` - Your GA4 property ID
- `GA4_API_KEY` - Your Google Analytics API key

## Dashboard Features

### Main Statistics
- **Visitors**: Unique visitors with period-over-period comparison
- **Pageviews**: Total pageviews with trends
- **Bounce Rate**: Percentage of single-page sessions
- **Visit Duration**: Average time spent on site

### Visualizations
- **Time Series Chart**: Interactive visitor trends over time
- **Top Pages**: Most visited pages with metrics
- **Traffic Sources**: Where your visitors come from
- **Custom Events**: Goals and conversions tracking

### Time Periods
- Last 24 hours
- Last 7 days
- Last 30 days
- Last 12 months

## Custom Providers

You can create custom analytics providers by implementing the `AnalyticsProvider` interface:

```typescript
import { AnalyticsProvider } from 'payload-analytics-plugin'

const myCustomProvider: AnalyticsProvider = {
  name: 'custom',
  async getDashboardData(period) {
    // Fetch and return analytics data
    return {
      stats: { /* ... */ },
      timeseries: [ /* ... */ ],
      pages: [ /* ... */ ],
      sources: [ /* ... */ ],
      events: [ /* ... */ ],
      realtime: { visitors: 0 },
    }
  },
  trackEvent(eventName, props) {
    // Track custom events (optional)
  },
}

// Use in config
analyticsPlugin({
  provider: myCustomProvider,
})
```

## Styling

The plugin uses Payload's CSS variables for consistent theming:
- Automatically adapts to light/dark mode
- Matches Payload's design system
- Responsive layout for all screen sizes

## API Endpoints

The plugin creates the following endpoint:

### GET `/api/analytics/dashboard`

Query parameters:
- `period`: Time period (`day`, `7d`, `30d`, `12mo`)

Returns analytics data in JSON format.

## TypeScript

Full TypeScript support with exported types:

```typescript
import type {
  AnalyticsProvider,
  DashboardData,
  AnalyticsPluginConfig,
  DashboardWidgetConfig,
  AnalyticsViewConfig,
  TimePeriod,
  ComparisonOption,
} from 'payload-analytics-plugin'
```

## Requirements

- Payload CMS v3.0.0 or higher
- React 19.0.0 or higher
- An analytics provider account (e.g., Plausible)

## Provider Notes

### Umami
- Real-time visitor count is not available in Umami's API
- Bounce rate and average duration are calculated site-wide and applied to individual pages
- Events are tracked as custom events in Umami

### Matomo
- Requires API authentication token (not just API key)
- Goals must be configured in Matomo to appear as events
- Live visitor count requires Live plugin to be enabled

### PostHog
- Bounce rate and average duration metrics are approximated
- Real-time visitor count is currently not available
- Custom events are fetched from the events API
- Requires both API key and project ID for authentication

### Google Analytics
- Uses GA4 Data API v1 (not Universal Analytics)
- Requires API key authentication (simpler than OAuth)
- Real-time data requires additional API permissions
- Custom events exclude page_view events
- Supports all standard GA4 dimensions and metrics

## Coming Soon

- Custom date range selection
- Export functionality
- Email reports
- Webhook notifications
- Advanced Google Analytics features (OAuth, custom dimensions)

## License

MIT