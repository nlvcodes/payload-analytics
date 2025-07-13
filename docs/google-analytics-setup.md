# Google Analytics Setup Guide

This guide will help you set up Google Analytics 4 (GA4) for use with the Payload Analytics Plugin.

## Prerequisites

- A Google Analytics 4 property (not Universal Analytics)
- A Google Cloud account
- Admin access to your GA4 property

## Step-by-Step Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** > **New Project**
3. Enter a project name (e.g., "My Site Analytics")
4. Click **Create**
5. Note your **Project ID** for later

### Step 2: Enable the Google Analytics Data API

1. In your Google Cloud project, navigate to **APIs & Services** > **Library**
2. Search for "Google Analytics Data API v1"
3. Click on the API result
4. Click **Enable**
5. Wait for the API to be enabled (this may take a minute)

### Step 3: Create API Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **API key**
3. A new API key will be created
4. Click **Copy** to copy the API key
5. **Important**: Click on the API key name to configure restrictions:
   - Under **Application restrictions**, you can leave it as "None" for testing
   - Under **API restrictions**, select **Restrict key**
   - Click **Select APIs** and choose **Google Analytics Data API v1**
   - Click **Save**

> **Security Note**: For production use, always restrict your API keys to specific APIs and consider adding IP or referrer restrictions.

### Step 4: Get Your GA4 Property ID

1. Go to [Google Analytics](https://analytics.google.com/)
2. Make sure you're viewing a GA4 property (not Universal Analytics)
3. Click the **Admin** gear icon in the bottom left
4. In the **Property** column, click **Property Settings**
5. Copy your **Property ID** (it will be a number like `123456789`)

### Step 5: Configure the Plugin

You can configure the plugin using environment variables or directly in the plugin configuration.

#### Option A: Using Environment Variables (Recommended)

Add to your `.env` file:
```bash
GA4_PROPERTY_ID=123456789
GA4_API_KEY=AIzaSyD-9tSrke72PouQMGDw28P1ZZ8X3k_9NS4
```

Then in your Payload config:
```typescript
import { analyticsPlugin } from 'payload-analytics-plugin'

export default buildConfig({
  plugins: [
    analyticsPlugin({
      provider: 'google-analytics',
      // Config will be automatically loaded from environment variables
    }),
  ],
})
```

#### Option B: Direct Configuration

```typescript
import { analyticsPlugin } from 'payload-analytics-plugin'

export default buildConfig({
  plugins: [
    analyticsPlugin({
      provider: 'google-analytics',
      config: {
        propertyId: '123456789',
        apiKey: 'AIzaSyD-9tSrke72PouQMGDw28P1ZZ8X3k_9NS4',
      },
    }),
  ],
})
```

## Verifying Your Setup

1. Start your Payload application
2. Navigate to `/admin/analytics` in your browser
3. You should see your analytics dashboard with data from Google Analytics

If you see "No data available", this could mean:
- Your GA4 property is new and hasn't collected data yet (wait 24-48 hours)
- The API key or property ID is incorrect
- The API is not enabled in your Google Cloud project

## Troubleshooting

### "API key not valid" Error
- Ensure the Google Analytics Data API v1 is enabled in your Google Cloud project
- Verify your API key is correct and has not been regenerated
- Check that API key restrictions allow the Google Analytics Data API

### "No data available" Message
- GA4 properties need 24-48 hours to start showing data
- Verify your property ID is correct (should be numbers only, no "GA-" prefix)
- Check that your website is properly sending data to GA4

### "403 Forbidden" Error
- Your API key may not have the correct permissions
- The property ID might be incorrect
- API quotas may have been exceeded (check Google Cloud Console)

### Rate Limits and Quotas
The free tier includes:
- 25,000 tokens per day
- 1,000 requests per day per project

For most small to medium sites, these limits are sufficient.

## API Key vs Service Account

This plugin uses API key authentication for simplicity. This approach:
- ✅ Is easier to set up than OAuth or service accounts
- ✅ Works well for server-side applications
- ✅ Provides read-only access to your analytics data
- ❌ Has lower rate limits than service account authentication
- ❌ Cannot access some advanced GA4 features

For most use cases, API key authentication is sufficient and much simpler to configure.

## Data Availability

Please note:
- **Real-time data**: Limited to current visitors only
- **Historical data**: GA4 may have a processing delay of 24-48 hours
- **Data retention**: Free GA4 accounts retain data for 14 months by default

## Security Best Practices

1. **Never commit API keys to version control**
   - Use environment variables
   - Add `.env` to your `.gitignore`

2. **Restrict API keys in production**
   - Limit to specific APIs (Google Analytics Data API v1)
   - Consider adding IP restrictions for server deployments

3. **Use read-only access**
   - This plugin only needs read access to analytics data
   - The API key method provides read-only access by default

## Need Help?

If you encounter issues not covered in this guide:
1. Check the [Google Analytics Data API documentation](https://developers.google.com/analytics/devguides/reporting/data/v1)
2. Verify your setup in the [Google Cloud Console](https://console.cloud.google.com/)
3. Open an issue on the [plugin repository](https://github.com/nlvcodes/payload-analytics/issues)