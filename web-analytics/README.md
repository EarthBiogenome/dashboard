# EBP Dashboard Web Analytics

Automated weekly collection of Google Analytics 4 (GA4) data for website traffic and user engagement.

---

## 🚀 Quick Start

**Get latest data and generate visualization:**

```bash
git pull
cd web-analytics
python analyze_web_trends.py
```

**View results:**
- Open `weekly_engagement_trends.png` to see trends
- Check `weekly_web_analytics.csv` for raw numbers (open in Excel)

**Note:** Data collection happens automatically via GitHub Actions (weekly on Mondays at 2 AM UTC, matches repo-analytics). Just pull and analyze!

---

### Manual Collection (Backfilling Only)

If you need to backfill missed data manually:

```bash
cd web-analytics
python collect_web_analytics.py
python analyze_web_trends.py
```

**Note:** For normal use, just run `analyze_web_trends.py` after `git pull`. Manual collection is only needed for backfilling missed periods.

### Expected Output
- **Sessions**: 15-25 per week (typical)
- **Users**: 8-15 per week
- **Engagement Rate**: 60-70% (good)

---

## 📁 Key Files

| File | Description |
|------|-------------|
| `weekly_web_analytics.csv` | Summary data (easy to view in Excel) |
| `weekly_analytics_all.json` | Consolidated detailed data (all weeks) |
| `weekly_engagement_trends.png` | Visualization charts |

---

## 📊 What to Monitor

| Metric | Good | Concern |
|--------|------|---------|
| Engagement Rate | > 60% | < 40% |
| Weekly Sessions | Growing trend | Declining trend |
| Bounce Rate | < 50% | > 70% |
| Countries Reached | Growing | Stable/declining |

---

## 🔧 Setup Requirements

```bash
pip install google-analytics-data pandas python-dateutil matplotlib seaborn numpy
```

**Configuration files needed:**
- `ga4_config.json` - GA4 property configuration
- `ga4_service_account.json` - Service account credentials

---

## 📖 Full Documentation

See [WEB_ANALYTICS_GUIDE.md](WEB_ANALYTICS_GUIDE.md) for complete documentation including:
- How the system works
- GA4 setup instructions
- Custom events reference
- Troubleshooting guide
- API configuration

---


