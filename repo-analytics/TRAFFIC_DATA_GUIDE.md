# EBP Dashboard Traffic Data Collection Guide

**Complete guide for automated GitHub repository traffic data collection and analysis.**

---

## 📊 Overview

This system automatically collects and tracks GitHub traffic data (views and clones) for the EarthBiogenome/dashboard repository on a weekly basis.

**Key Features:**
- ✅ Automated weekly collection via GitHub Actions
- ✅ Historical data preservation (CSV + JSON formats)
- ✅ Visual trend analysis and statistics
- ✅ No manual intervention required

---

## 🚀 Quick Start

### View Latest Data
```powershell
git pull
```

### Run Analysis (Optional)
```powershell
cd traffic-data
python analyze_traffic_data.py
```

This generates:
- Data table showing all weeks
- Visualizations (`traffic_trends_analysis.png`)
- Summary statistics (totals, averages, trends)

### View Raw Data
- **CSV:** `weekly_summary.csv` - Open in Excel
- **JSON:** `traffic-YYYY-WXX.json` files - Detailed daily breakdowns

---

## 📁 Files in This Directory

### Data Files
- `weekly_summary.csv` - Weekly aggregated data (main file)
- `traffic-YYYY-WXX.json` - Detailed weekly snapshots with daily breakdowns

### Scripts
- `analyze_traffic_data.py` - Analysis and visualization script

### Documentation
- This file - Complete guide

---

## ⚙️ How It Works

### Automated Collection
- **Schedule:** Every Monday at 2:00 AM UTC
- **What it collects:** Previous week's completed data
- **Source:** GitHub Traffic API (14-day rolling window)
- **Storage:** Commits to `ebp-main` branch automatically

### Data Format
**Weekly Summary CSV:**
```csv
week,collection_date,views_count,views_uniques,clones_count,clones_uniques,collected_at
2025-W42,2025-10-20,16,3,15,10,2025-10-31T16:27:00Z
```

**Weekly JSON:**
Contains detailed daily breakdowns for each metric within the 14-day collection window.

---

## 🔧 Maintenance

### Weekly Monitoring (Optional)
Every Monday after 2:30 AM UTC:
1. Check GitHub Actions: https://github.com/EarthBiogenome/dashboard/actions
2. Pull latest data: `git pull`
3. Verify: `Get-Content weekly_summary.csv | Select-Object -Last 1`

### Manual Trigger (If Needed)
1. Go to: https://github.com/EarthBiogenome/dashboard/actions/workflows/repo-analytics-collector.yml
2. Click **"Run workflow"** button
3. Select branch: **ebp-main**
4. Click **"Run workflow"**
5. Wait for completion (~30 seconds)
6. Pull data: `git pull`

---

## 🆘 Troubleshooting

### No New Data After Monday
**Check workflow status:**
1. Visit: https://github.com/EarthBiogenome/dashboard/actions
2. Look for "Collect Repository Traffic Data" workflow
3. Check if last run succeeded (green checkmark ✅)
4. Click on the run to see details

**Common causes:**
- ⚠️ Workflow found no changes (might be expected if data already collected)
- ❌ API rate limit (wait 1 hour, try again)
- ❌ Token expired (admin needs to regenerate `TRAFFIC_TOKEN`)

### Analysis Script Errors
**"Could not find weekly_summary.csv":**
- Make sure you're in the `traffic-data` directory
- Check if file exists: `Get-ChildItem weekly_summary.csv`

**"Time data doesn't match format":**
- This was fixed - dates now parse automatically
- If error persists, check for corrupt data in CSV

**Encoding/emoji errors:**
- Should not occur (UTF-8 configured in PowerShell profile)
- If it happens, run: `$env:PYTHONIOENCODING="utf-8"` then retry

### Workflow Not Running
**Permissions issue:**
- You need write/maintain access to EarthBiogenome/dashboard
- Contact repository admin if you can't trigger workflows

**Token issues:**
- Workflow uses `TRAFFIC_TOKEN` secret
- Admin needs to verify it exists and has `repo` scope
- Check: Settings → Secrets and variables → Actions

---

## 📈 Understanding the Data

### Metrics Explained
- **Views:** Page visits to the repository
- **Unique Viewers:** Individual users who viewed
- **Clones:** Repository git clone/fetch operations
- **Unique Cloners:** Individual users who cloned

### Data Gaps
**Current status:**
- ✅ Data available: Weeks W29-W35 (July-August), W42 (October)
- ⚠️ Data gap: Weeks W36-W41 (September - early October) - Lost due to GitHub's 14-day API limit

**Why gaps occur:**
GitHub API only retains 14 days of traffic data. If collection stops for more than 2 weeks, that data is permanently lost.

### Cumulative vs Weekly
- **Weekly metrics:** Activity for that specific week
- **Cumulative metrics:** Running total since data collection began

---

## 🔐 Security & Access

### Repository Access
- **Data collected from:** EarthBiogenome/dashboard
- **Workflow runs on:** EarthBiogenome/dashboard
- **Local remote:** `ebp` → EarthBiogenome/dashboard

### Git Operations
```powershell
# Pull updates
git pull

# Make changes and push
git add .
git commit -m "Your message"
git push
```

No need to specify remote/branch - defaults to `ebp/ebp-main`.

---

## 📅 Collection Schedule

### Automatic Collection
- **Frequency:** Weekly
- **Day/Time:** Monday 2:00 AM UTC
- **Collects:** Previous completed week (Monday-Sunday)
- **Next run:** Check workflow page for schedule

### Week Numbering
- Uses ISO week format: `YYYY-WXX`
- Week starts on Monday
- Example: `2025-W42` = Week starting October 20, 2025

---

## 💡 Tips

### Best Practices
- ✅ Pull data before analyzing: `git pull`
- ✅ Check GitHub Actions occasionally to ensure collection is working
- ✅ Run analysis monthly or quarterly to review trends
- ✅ Keep this repository in sync with remote

### What NOT to Do
- ❌ Don't modify `weekly_summary.csv` manually (use scripts)
- ❌ Don't delete JSON files (they provide detailed history)
- ❌ Don't run analysis from outside `traffic-data` directory

### Performance
- Analysis runs quickly (<5 seconds)
- Visualization opens automatically (close when done)
- PNG file saved to `traffic-data/traffic_trends_analysis.png`

---

## 🛠️ Technical Details

### Workflow Configuration
- File: `.github/workflows/repo-analytics-collector.yml`
- Checkout: Explicitly uses `ebp-main` branch
- Commit: Automatic if data changes detected
- Push: Directly to `ebp-main` branch

### Data Collection Script
- Created dynamically by workflow
- Uses GitHub Traffic API
- Collects views and clones data
- Stores in CSV (append) and JSON (new file per week)

### Analysis Requirements
```bash
pip install pandas matplotlib seaborn numpy
```

### PowerShell Configuration
UTF-8 encoding is set in your PowerShell profile:
- Location: `$PROFILE` (`Microsoft.PowerShell_profile.ps1`)
- Setting: `$env:PYTHONIOENCODING = "utf-8"`
- Applied automatically on PowerShell startup

---

## 📞 Support & Contacts

### For Workflow Issues
Contact EarthBiogenome/dashboard repository administrators.

### For Script Issues
Check this guide first, then review error messages for specific problems.

### Useful Links
- Workflow: https://github.com/EarthBiogenome/dashboard/actions/workflows/traffic-collector.yml
- Actions: https://github.com/EarthBiogenome/dashboard/actions
- Repository: https://github.com/EarthBiogenome/dashboard

---

## 📝 Version History

### Current Setup (October 2025)
- ✅ Automated weekly collection operational
- ✅ Data properly committed and pushed
- ✅ Analysis scripts functional
- ✅ Documentation consolidated

### Known Issues Resolved
- ✅ Gitignore blocking data files (fixed)
- ✅ Workflow push configuration (fixed)
- ✅ Date format parsing (fixed)
- ✅ PowerShell encoding issues (fixed)

---

*Last Updated: October 31, 2025*
*System Status: Fully Operational ✅*

