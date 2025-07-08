// Plausible API response fixtures
export const plausibleStatsResponse = {
  results: {
    visitors: { value: 1234 },
    pageviews: { value: 5678 },
    bounce_rate: { value: 45.2 },
    visit_duration: { value: 180 },
  },
}

export const plausibleTimeseriesResponse = {
  results: [
    { date: '2024-01-01', visitors: 100, pageviews: 250 },
    { date: '2024-01-02', visitors: 120, pageviews: 300 },
    { date: '2024-01-03', visitors: 110, pageviews: 280 },
  ],
}

export const plausibleBreakdownResponse = {
  results: [
    { page: '/', visitors: 500, pageviews: 1200, bounce_rate: { value: 35 }, visit_duration: { value: 240 } },
    { page: '/about', visitors: 300, pageviews: 450, bounce_rate: { value: 55 }, visit_duration: { value: 120 } },
  ],
}

// Umami API response fixtures
export const umamiStatsResponse = {
  pageviews: { value: 5678 },
  visitors: { value: 1234 },
  visits: { value: 1500 },
  bounces: { value: 678 },
  totaltime: { value: 270000 },
}

export const umamiMetricsResponse = {
  pageviews: [
    { x: '/', y: 1200 },
    { x: '/about', y: 450 },
  ],
  referrers: [
    { x: 'google.com', y: 400 },
    { x: 'direct', y: 350 },
  ],
  events: [
    { x: 'Signup', y: 45 },
    { x: 'Purchase', y: 23 },
  ],
}

// Matomo API response fixtures
export const matomoVisitsSummaryResponse = [
  {
    nb_visits: 1234,
    nb_actions: 5678,
    bounce_rate: '45%',
    avg_time_on_site: 180,
  },
]

export const matomoPageTitlesResponse = [
  {
    label: 'Home',
    url: 'http://example.com/',
    nb_visits: 500,
    nb_hits: 1200,
    bounce_rate: '35%',
    avg_time_on_page: 240,
  },
  {
    label: 'About',
    url: 'http://example.com/about',
    nb_visits: 300,
    nb_hits: 450,
    bounce_rate: '55%',
    avg_time_on_page: 120,
  },
]

// PostHog API response fixtures
export const posthogEventsResponse = {
  results: [
    {
      event: '$pageview',
      properties: { $current_url: '/' },
      timestamp: '2024-01-01T00:00:00Z',
      distinct_id: 'user1',
    },
    {
      event: '$pageview',
      properties: { $current_url: '/about' },
      timestamp: '2024-01-01T00:01:00Z',
      distinct_id: 'user2',
    },
    {
      event: 'Signup',
      timestamp: '2024-01-01T00:02:00Z',
      distinct_id: 'user3',
    },
  ],
}

export const posthogInsightsResponse = {
  result: [
    {
      data: [100, 120, 110],
      labels: ['2024-01-01', '2024-01-02', '2024-01-03'],
      days: ['2024-01-01', '2024-01-02', '2024-01-03'],
    },
  ],
}

// Google Analytics API response fixtures
export const googleAnalyticsReportResponse = {
  rows: [
    {
      dimensionValues: [{ value: '20240101' }],
      metricValues: [
        { value: '1234' }, // totalUsers
        { value: '5678' }, // screenPageViews
        { value: '0.452' }, // bounceRate
        { value: '180' }, // averageSessionDuration
      ],
    },
  ],
  dimensionHeaders: [{ name: 'date' }],
  metricHeaders: [
    { name: 'totalUsers' },
    { name: 'screenPageViews' },
    { name: 'bounceRate' },
    { name: 'averageSessionDuration' },
  ],
}

export const googleAnalyticsPagePathResponse = {
  rows: [
    {
      dimensionValues: [{ value: '/' }, { value: 'Home' }],
      metricValues: [
        { value: '500' }, // totalUsers
        { value: '1200' }, // screenPageViews
        { value: '0.35' }, // bounceRate
        { value: '240' }, // userEngagementDuration
      ],
    },
    {
      dimensionValues: [{ value: '/about' }, { value: 'About' }],
      metricValues: [
        { value: '300' },
        { value: '450' },
        { value: '0.55' },
        { value: '120' },
      ],
    },
  ],
}