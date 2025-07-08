# Claude AI Context File - Payload Analytics Plugin

This file provides context for AI assistants working on the payload-analytics-plugin project.

## Project Overview
A third-party analytics plugin for Payload CMS that provides a beautiful analytics dashboard integrated directly into the admin panel. Supports multiple analytics providers: Plausible, Umami, Matomo, PostHog, and Google Analytics.

## Tech Stack
- **Language**: TypeScript
- **Target**: Payload CMS v3.0.0+
- **UI Library**: React 19
- **Charts**: Recharts
- **Validation**: Zod
- **Analytics Providers**: Plausible, Umami, Matomo, PostHog, Google Analytics

## Key Architecture Decisions
1. **Provider Pattern**: Extensible system allowing multiple analytics providers
2. **Component Exports**: Special export structure for Payload's dynamic imports
3. **Global State**: Provider instance stored in global for API access
4. **Environment Variables**: Auto-configuration from standard env vars
5. **No External State**: All data fetched on-demand

## Plugin Structure
```
payload-analytics/
├── src/
│   ├── index.ts              # Main plugin entry & configuration
│   ├── types.ts              # TypeScript interfaces
│   ├── constants.ts          # Time periods, labels, provider mappings
│   ├── providers/
│   │   ├── plausible.ts      # Plausible provider implementation
│   │   ├── umami.ts          # Umami provider implementation
│   │   ├── matomo.ts         # Matomo provider implementation
│   │   ├── posthog.ts        # PostHog provider implementation
│   │   └── google-analytics.ts # Google Analytics provider implementation
│   ├── components/
│   │   ├── AnalyticsView.tsx # Full dashboard server component
│   │   ├── AnalyticsClient.tsx # Client-side dashboard
│   │   ├── AnalyticsWidget.tsx # Dashboard widget component
│   │   ├── AfterNavLinksServer.tsx # Server navigation component
│   │   ├── AfterNavLinksClient.tsx # Client navigation with provider icons
│   │   └── Analytics.css     # Styled to match Payload UI
│   └── lib/
│       └── formatters.ts     # Number/date formatting utilities
├── components/               # Re-export wrappers for Payload
│   ├── AnalyticsView.ts
│   ├── AnalyticsWidget.ts
│   └── AfterNavLinks.ts
```

## Configuration API
```typescript
analyticsPlugin({
  provider: 'plausible' | 'umami' | 'matomo' | 'posthog' | 'google-analytics' | AnalyticsProvider,
  config?: PlausibleConfig | UmamiConfig | MatomoConfig | PostHogConfig | GoogleAnalyticsConfig,
  enabled?: boolean,
  enableDashboard?: boolean,
  dashboardPath?: string,
  dashboardWidget?: DashboardWidgetConfig | boolean,
  analyticsView?: AnalyticsViewConfig | boolean,
  customNavigation?: boolean,
  useGenericIcon?: boolean,
  timePeriods?: TimePeriod[],
  defaultTimePeriod?: TimePeriod,
  comparisonOptions?: ComparisonOption[],
  enableComparison?: boolean,
})

// Example usage:
analyticsPlugin({
  provider: 'plausible',
  config: {
    apiKey: process.env.PLAUSIBLE_API_KEY,
    siteId: process.env.PLAUSIBLE_SITE_ID,
    apiHost: 'https://plausible.io',
  },
})
```

## Key Features
1. **Analytics Dashboard**: Full-page view at `/admin/analytics`
2. **Dashboard Widget**: Quick stats on main admin dashboard (configurable position)
3. **Time Period Selection**: Customizable periods with defaults (day, 7d, 14d, 30d, lastMonth, thisMonth, 12mo, custom)
4. **Real-time Visitors**: Live visitor count (provider-dependent)
5. **Multiple Metrics**: Visitors, pageviews, bounce rate, duration with period comparisons
6. **Traffic Analysis**: Top pages, sources, and events/goals
7. **Provider Icons**: Dynamic navigation icons for each provider or generic option
8. **Flexible Positioning**: Configure dashboard widget and navigation link positions

## Provider Interface
```typescript
interface AnalyticsProvider {
  name: string
  getDashboardData: (period?: string) => Promise<DashboardData | null>
  trackEvent?: (eventName: string, props?: Record<string, any>) => void
}
```

## API Endpoints
- `GET /api/analytics/dashboard?period=7d` - Returns analytics data

## Styling Approach
- Uses Payload's CSS variables for theming
- Responsive grid layouts
- Automatic dark mode support
- Consistent with Payload's design system

## Building & Publishing
```bash
pnpm build          # Compile TypeScript
pnpm test          # Run tests (when implemented)
npm publish        # Publish to npm
```

## Testing in Projects
Can be tested locally using file path:
```typescript
plugins: [
  analyticsPlugin({
    provider: 'plausible',
    // config
  }),
]
```

## Current Status
- ✅ Core functionality complete
- ✅ All 5 providers implemented (Plausible, Umami, Matomo, PostHog, Google Analytics)
- ✅ Dashboard and widget components with configurable positioning
- ✅ TypeScript support with full type safety
- ✅ Dynamic navigation icons for all providers
- ✅ Generic icon option (useGenericIcon)
- ✅ Customizable time periods and comparison options
- ✅ Environment variable support for all providers
- ✅ Lean package size (~22KB compressed)
- ⏳ Tests need to be written
- ⏳ Advanced GA features (OAuth, custom dimensions) planned
- ⏳ Additional providers (Mixpanel, Amplitude) could be added

## Important Notes
- Package name is `payload-analytics-plugin` (not official Payload plugin)
- Requires server-side rendering for API routes
- Provider instance stored in global scope
- Components use dynamic imports via string paths
- Google Analytics uses API key auth (simpler than OAuth)
- All providers follow the same interface pattern for consistency

## Package Size Analysis
- **Total size**: ~22KB compressed (very lightweight)
- **Provider breakdown**:
  - Plausible: 6.2KB
  - Umami: 7.8KB
  - Matomo: 10KB
  - PostHog: 12KB
  - Google Analytics: 16KB
- **Only 2 runtime dependencies**: recharts and zod

## Future Enhancements
- [ ] Custom date ranges with date picker
- [ ] Export functionality (CSV, PDF)
- [ ] Caching layer for better performance
- [ ] Error boundaries and loading skeletons
- [ ] Advanced Google Analytics features (OAuth, custom dimensions)
- [ ] Additional providers (Mixpanel, Amplitude, Fathom)
- [ ] Webhook notifications for alerts
- [ ] Multi-site support
- [ ] Custom metrics and dimensions

## Assistant Memories
- Always use context7. Let me know if you don't have access to it.