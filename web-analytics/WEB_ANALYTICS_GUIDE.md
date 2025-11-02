# EBP Dashboard Web Analytics Guide

**Complete guide for Google Analytics 4 tracking and automated data collection.**

---

## 📊 Overview

This system tracks website traffic and user engagement for the EBP Dashboard using Google Analytics 4 (GA4), with automated weekly data collection similar to the GitHub traffic collection system.

**Key Features:**
- ✅ Automated weekly GA4 data collection via GitHub Actions
- ✅ Custom event tracking (clicks, scrolls, interactions)
- ✅ Historical trend analysis and visualizations
- ✅ Geographic and engagement metrics
- ✅ No manual intervention required

---

## 📁 Files in This Directory

### Data Files
- `weekly_web_analytics.csv` - Weekly aggregated data (for analysis)
- `weekly_analytics_all.json` - Consolidated detailed data (all weeks)

### Scripts
- `analyze_web_trends.py` - **Primary script** - Analysis and visualization (run this!)
- `collect_web_analytics.py` - Manual collection script (for backfilling only)

### Configuration (Gitignored)
- `ga4_config.json` - GA4 property configuration
- `ga4_service_account.json` - Service account credentials

### Documentation
- This file - Complete guide (includes setup instructions)
- README.md - Quick start guide

---

## ⚙️ How It Works

### Automated Collection
- **Schedule:** Every Monday at 2:00 AM UTC or Sundays 7:00 PM MST(matches repo-analytics collection schedule)
- **What it collects:** Previous week's completed data
- **Source:** Google Analytics 4 Data API
- **Storage:** Commits to `ebp-main` branch automatically

### Data Collected
**Standard Metrics:**
- Sessions, users (total & new)
- Page views, bounce rate
- Average session duration
- Engagement rate
- Geographic data (countries)

**Custom Events:**
- Dashboard interactions
- Visualization clicks
- Content engagement
- Scroll depth tracking

---

## 📊 Data Collection

### CSV Format
```csv
week,collection_date,sessions,total_users,new_users,screen_page_views,avg_bounce_rate,avg_session_duration,avg_engagement_rate,countries_reached,total_custom_events,days_collected,monthly_active_users,monthly_sessions,collected_at
2025-W35,2025-09-02,17,9,2,12,0.275,333.4,0.725,3,47,6,26,79,2025-09-02T12:51:24Z
```

### JSON Format
Contains detailed daily breakdowns, geographic data, and raw GA4 metrics.

---

## 🔧 Maintenance

### Weekly Monitoring (Optional)
Every Monday after 2:30 AM UTC:
1. Check GitHub Actions: https://github.com/EarthBiogenome/dashboard/actions
2. Pull latest data: `git pull`
3. Verify: `Get-Content weekly_web_analytics.csv | Select-Object -Last 1`

### Manual Collection (Backfilling Only)
For backfilling missed data:
```powershell
cd web-analytics
python collect_web_analytics.py
```

**Note:** Normal usage is just `python analyze_web_trends.py` after `git pull`. Only use manual collection for backfilling missed periods.

**Prerequisites:**
- `ga4_config.json` configured with property ID
- `ga4_service_account.json` with valid credentials

### Manual Trigger Workflow
1. Go to: https://github.com/EarthBiogenome/dashboard/actions/workflows/web-analytics-collector.yml
2. Click **"Run workflow"**
3. Select branch: **ebp-main**
4. Click **"Run workflow"**
5. Wait for completion (~30 seconds)
6. Pull data: `git pull`

---

## 🆘 Troubleshooting

### No New Data After Monday
**Check workflow status:**
1. Visit: https://github.com/EarthBiogenome/dashboard/actions
2. Look for "Weekly Web Analytics Collection" workflow
3. Check if last run succeeded (green checkmark ✅)
4. Click on the run to see logs

**Common causes:**
- ⚠️ No changes detected (might be expected if data already collected)
- ❌ API credentials expired (admin needs to regenerate)
- ❌ Rate limit exceeded (wait 1 hour, try again)

### Analysis Script Errors
**"No weekly analytics data found":**
- Check if `weekly_web_analytics.csv` exists
- Run `collect_web_analytics.py` if file is missing

**"Authentication failed":**
- Verify `ga4_service_account.json` exists and is valid
- Check if service account has GA4 property Viewer access

### Workflow Not Running
**Permissions issue:**
- Verify `GA4_PROPERTY_ID` secret exists
- Verify `GA4_SERVICE_ACCOUNT_KEY` secret exists
- Check: Settings → Secrets and variables → Actions

**Configuration issue:**
- Service account must have Viewer role on GA4 property
- API must be enabled in Google Cloud Console

---

## 📈 Understanding the Data

### Metrics Explained
- **Sessions:** Total user sessions during the week
- **Total Users:** Unique users who visited
- **New Users:** First-time visitors
- **Screen Page Views:** Total page views across all users
- **Bounce Rate:** Percentage of single-page sessions
- **Avg Session Duration:** Average time users spend (seconds)
- **Engagement Rate:** Percentage of engaged sessions
- **Countries Reached:** Number of different countries with visitors
- **Custom Events:** Dashboard interaction events

### Data Gaps
**Current status:**
- ✅ Data available: Weeks W31-W35 (August-early September)
- ⚠️ Data gap: September - October (collection issue resolved)

**Why gaps occur:**
GA4 data is historical, but collection must run regularly to build trends.

### Weekly vs Cumulative
- **Weekly metrics:** Activity for that specific week
- **Cumulative metrics:** Running total since collection began

---

## 🔐 Setup & Configuration

### Initial GA4 Setup

#### 1. Create Google Analytics 4 Property
1. Go to: https://analytics.google.com
2. Create Account: "Earth BioGenome Project"
3. Create Property: "EBP Dashboard"
4. Set Up Web Data Stream
5. Get **Measurement ID** (format: G-XXXXXXXXXX)

#### 2. Add Tracking Code to Website
Update `index.html` with your Measurement ID:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX'); // Your Measurement ID
</script>
```

#### 3. Verify Installation
- Go to GA4 → Reports → Realtime
- Open your dashboard
- Should see active users immediately

---

## 🎯 Custom Events Tracking

### Events Automatically Tracked

| Event Name | Trigger | Purpose |
|------------|---------|---------|
| `visualization_click` | User clicks dashboard item | Track visualization usage |
| `visualization_hover` | User hovers (500ms delay) | Measure interest |
| `category_view` | Category section loads | Track navigation |
| `scroll_depth` | Scrolls to 25%, 50%, 75%, 100% | Engagement depth |
| `dashboard_loaded` | All content loaded | Track successful loads |
| `search_interaction` | Search/filter usage | Filter behavior |
| `external_link_click` | External link clicks | Outbound traffic |

### Event Parameters
Each event includes:
- `event_category`: Type of interaction
- `event_label`: Specific item identifier
- `visualization_type`: What was interacted with
- `timestamp`: When it occurred

---

## 🔧 API Access Setup (For Automation)

### Google Cloud Console

1. **Create or Use Project**
   - Go to: https://console.cloud.google.com
   - Create new project or select existing

2. **Enable GA4 Data API**
   - Navigate to: APIs & Services → Library
   - Search: "Google Analytics Data API"
   - Click "Enable"

3. **Create Service Account**
   - Go to: IAM & Admin → Service Accounts
   - Click "Create Service Account"
   - Name: "GA4 Data Collector"
   - Grant role: None needed here
   - Create and download JSON key

4. **Grant GA4 Property Access**
   - Go to GA4 → Admin → Property Access Management
   - Add Users → Add service account email
   - Role: **Viewer**
   - Save

### Local Configuration

Create `ga4_config.json`:
```json
{
  "property_id": "YOUR_NUMERIC_PROPERTY_ID",
  "website_url": "https://earthbiogenome.github.io/dashboard",
  "custom_events": [
    "visualization_click",
    "category_view",
    "dashboard_loaded",
    "scroll_depth"
  ]
}
```

Place service account JSON as `ga4_service_account.json`.

**Test configuration:**
```powershell
python collect_web_analytics.py
```

This will test authentication and collect a sample of data.

---

## 🤖 GitHub Actions Automation Setup

### One-Time Setup to Enable Automatic Data Collection

After completing the API Access Setup above, configure GitHub Actions for automated collection.

#### Step 1: Add GitHub Secrets

1. **Navigate to Repository Settings**
   - Go to: `https://github.com/EarthBiogenome/dashboard/settings/secrets/actions`
   - Or: `Repository` → `Settings` → `Secrets and variables` → `Actions`

2. **Add Secret #1: GA4_PROPERTY_ID**
   - Click **"New repository secret"**
   - **Name:** `GA4_PROPERTY_ID`
   - **Value:** Your GA4 Property ID (e.g., find this in your GA4 Admin settings)
   - Click **"Add secret"**

3. **Add Secret #2: GA4_SERVICE_ACCOUNT_KEY**
   - Click **"New repository secret"**
   - **Name:** `GA4_SERVICE_ACCOUNT_KEY`
   - **Value:** Copy the entire JSON content from your local `web-analytics/ga4_service_account.json` file (this file is ignored by git and should never be committed)
   - Click **"Add secret"**

#### Step 2: Test the Workflow

1. **Trigger Manual Run**
   - Go to: `https://github.com/EarthBiogenome/dashboard/actions`
   - Click on: `Weekly Web Analytics Collection` (left sidebar)
   - Click: `Run workflow` button (top right)
   - Select branch: `ebp-main`
   - Click: `Run workflow` button (green)

2. **Monitor the Run**
   - Wait 2-3 minutes for completion
   - Click on the workflow run to see details
   - Check each step completes successfully ✅

3. **Verify Results**
   ```bash
   git pull
   ```
   - Check for new/updated files:
     - `web-analytics/weekly_analytics_all.json` (updated)
     - `web-analytics/weekly_web_analytics.csv` (new row added)

#### Step 3: Verify Automatic Schedule

Once the manual test succeeds, the workflow runs automatically:

**Schedule:** Every Monday at 2:00 AM UTC (same as repo-analytics)

**You don't need to do anything!** Just check in weekly:
```bash
git pull
cd web-analytics
python analyze_web_trends.py
```

**Before vs After Automation:**

**Before (Manual):**
```bash
# Every week, you had to:
cd web-analytics
python collect_web_analytics.py  # Manually run
python analyze_web_trends.py
```

**After (Automated):**
```bash
# Every week, you just:
git pull                          # Get auto-collected data
cd web-analytics
python analyze_web_trends.py     # Generate charts
```

**Huge time savings!** 🎉

### Automation Troubleshooting

**Workflow Fails: "Authentication Error"**
- **Cause:** GitHub secrets not set correctly
- **Fix:**
  1. Check secrets exist: Settings → Secrets and variables → Actions
  2. Verify secret names are EXACTLY: `GA4_PROPERTY_ID` and `GA4_SERVICE_ACCOUNT_KEY`
  3. Re-add secrets if needed

**Workflow Fails: "Permission Denied"**
- **Cause:** Service account doesn't have Analytics Viewer access
- **Fix:**
  1. Go to GA4 Admin
  2. Add service account email as Viewer role

**No New Commit After Workflow Run**
- **Cause:** No new data to collect (already up to date)
- **Fix:** This is normal - workflow only commits if there's new data

**If you need to update credentials:**
1. Generate new service account key
2. Update `GA4_SERVICE_ACCOUNT_KEY` secret in GitHub
3. Delete old service account key in Google Cloud

---

## 🔐 Security & Access

### Sensitive Files (Gitignored)
- `ga4_service_account.json` - Service account credentials
- `ga4_config.json` - Property configuration

These files are created by GitHub Actions workflow using secrets.

### GitHub Secrets Required
- `GA4_PROPERTY_ID` - Your GA4 property ID
- `GA4_SERVICE_ACCOUNT_KEY` - Service account JSON (full content)

**Note:** These secrets are encrypted and never exposed in logs. Service account has read-only access (Viewer role), and workflow only has permissions to write to this repo.

---

## 💡 Tips

### Best Practices
- ✅ Pull data before analyzing: `git pull`
- ✅ Check GitHub Actions occasionally
- ✅ Run analysis monthly to review trends
- ✅ Compare with GitHub traffic data for insights

### What NOT to Do
- ❌ Don't commit `ga4_service_account.json` or `ga4_config.json`
- ❌ Don't modify CSV files manually
- ❌ Don't delete JSON files (historical data)
- ❌ Don't share service account credentials

### Performance
- Analysis runs quickly (<5 seconds)
- Visualization opens automatically
- PNG files saved to `web-analytics/` directory

---

## 🛠️ Technical Details

### Workflow Configuration
- File: `.github/workflows/web-analytics-collector.yml`
- Schedule: Monday 2:00 AM UTC (matches repo-analytics-collector.yml)
- Checkout: Explicitly uses `ebp-main` branch
- Commit: Automatic if data changes detected
- Push: Directly to `ebp-main` branch

### Python Requirements
```bash
pip install google-analytics-data pandas python-dateutil matplotlib seaborn numpy
```

Or use requirements file:
```bash
pip install -r requirements.txt
```

### PowerShell Configuration
UTF-8 encoding set in PowerShell profile for emoji support (matches traffic-data setup).

---

## 📞 Support

### For Workflow Issues
Contact EarthBiogenome/dashboard repository administrators.

### For GA4 Issues
Check GA4 Help Center or verify:
- Measurement ID is correct
- Service account has property access
- API is enabled in Google Cloud

### Useful Links
- Workflow: https://github.com/EarthBiogenome/dashboard/actions/workflows/web-analytics-collector.yml
- Actions: https://github.com/EarthBiogenome/dashboard/actions
- GA4: https://analytics.google.com
- API Docs: https://developers.google.com/analytics/devguides/reporting/data/v1

---

## 📝 Version History

### Current Setup (October 2025)
- ✅ Automated weekly collection operational
- ✅ Data properly committed and pushed
- ✅ Analysis scripts functional with gap detection
- ✅ Documentation consolidated

### Known Issues Resolved
- ✅ Gitignore blocking data files (fixed)
- ✅ Workflow configuration (verified)
- ✅ Gap detection added to visualizations

---

*Last Updated: October 31, 2025*  
*System Status: Fully Operational ✅*

