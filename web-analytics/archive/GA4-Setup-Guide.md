# Google Analytics 4 Setup Guide for EBP Dashboard

## 🚀 Quick Setup Steps

### 1. Create Google Analytics 4 Property

1. **Go to Google Analytics**: Visit [analytics.google.com](https://analytics.google.com)
2. **Create Account** (if you don't have one):
   - Click "Start measuring"
   - Enter account name: "Earth BioGenome Project"
   - Configure data sharing settings as desired

3. **Create Property**:
   - Property name: "EBP Dashboard"
   - Reporting time zone: Select your timezone
   - Currency: Select your preferred currency

4. **Set Up Data Stream**:
   - Choose "Web"
   - Website URL: Enter your dashboard URL
   - Stream name: "EBP Dashboard Website"

5. **Get Measurement ID**:
   - After creating the data stream, copy the **Measurement ID** (format: G-XXXXXXXXXX)

### 2. Configure Your Dashboard

1. **Update the Tracking Code**:
   - Open `index.html`
   - Find **two instances** of `YOUR_GA4_MEASUREMENT_ID`
   - Replace both with your actual Measurement ID

2. **Tracking Code Location**:
   ```html
   <!-- In the <head> section -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-N9WF546FSK"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-N9WF546FSK'); // Your Measurement ID here
   </script>
   ```

3. **Custom Events Configuration**:
   - The dashboard already includes custom event tracking
   - Events like `visualization_click`, `category_view`, `dashboard_loaded`
   - See `GA4-Events-Reference.md` for complete list

### 3. Verify Installation

1. **Real-time Reports**:
   - Go to GA4 → Reports → Realtime
   - Open your dashboard in another tab
   - Should see active users immediately

2. **Debug Mode** (Optional):
   ```html
   <!-- Add to enable debug mode -->
   <script>
     gtag('config', 'G-N9WF546FSK', {
       debug_mode: true
     });
   </script>
   ```

### 4. Enhanced Measurement (Recommended)

In GA4, enable these automatic events:
- **Page views**: ✅ Automatically tracked
- **Scrolls**: ✅ Automatically tracked  
- **Outbound clicks**: ✅ Enable in GA4 settings
- **Site search**: ❌ Not applicable
- **Video engagement**: ❌ Not applicable
- **File downloads**: ✅ Enable if you have downloadable content

### 5. Custom Dimensions (Advanced)

Set up custom dimensions in GA4 for better analysis:

1. **Go to**: Admin → Data display → Custom definitions
2. **Create Custom Dimensions**:
   - `visualization_type`: Track which visualizations are most popular
   - `user_engagement_level`: Based on scroll depth and time spent
   - `device_category`: Automatically available
   - `country`: Automatically available

### 6. Data API Access (For Analytics Collection)

To use the analytics collection system in this folder:

1. **Google Cloud Console Setup**:
   - Create project or use existing
   - Enable Google Analytics Data API
   - Create service account
   - Download JSON credentials

2. **GA4 Property Access**:
   - Add service account email as Viewer
   - Copy Property ID (numeric ID from GA4 settings)

3. **Configuration**:
   - Update `ga4_config.json` with your details
   - Place service account JSON as `ga4_service_account.json`

## 🎯 Testing Your Setup

### Quick Test Checklist:
- [ ] Measurement ID correctly placed in `index.html`
- [ ] Real-time reports show your visits
- [ ] Custom events firing (check Events report after 24 hours)
- [ ] Enhanced measurement enabled
- [ ] API access configured (if using analytics collection)

### Common Issues:
- **No data in reports**: Check Measurement ID, wait 24-48 hours for data
- **Custom events not firing**: Check browser console for gtag errors
- **API access denied**: Verify service account has GA4 property access

## 📊 What You'll Track

### Automatic Events:
- Page views, sessions, users
- Geographic data (countries, cities)
- Technology data (browsers, devices, OS)
- User engagement (session duration, bounce rate)

### Custom Events:
- Dashboard interactions (clicks, hovers)
- Visualization usage patterns
- Category navigation
- Content engagement depth

### Analytics Collection:
- Weekly automated data collection
- Historical trend analysis
- Cumulative growth tracking
- Engagement pattern analysis

---

**Next Step**: See `GA4-Events-Reference.md` for complete list of tracked events and their parameters.

**Troubleshooting**: Run `python setup_ga4_api.py` to test API configuration.
