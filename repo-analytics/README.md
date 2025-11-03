# EBP Dashboard Traffic Data Collection

Automated weekly collection of GitHub repository traffic data (views and clones).

---

## 🚀 Quick Start

**Get latest data:**
```bash
git pull
```
# You'll see updates like:
# repo-analytics/weekly_summary.csv (new row for this week)
# web-analytics/weekly_web_analytics.csv (new row for this week)
# repo-analytics/traffic_data_all.json (updated)
# web-analytics/weekly_analytics_all.json (updated)
# Both weekly_trends_analysis.png (new charts)

### Run Analysis
```bash
cd repo-analytics
python analyze_traffic_data.py

# Or:
cd web-analytics  
python analyze_web_trends.py
```

**View raw data:**
- `weekly_summary.csv` - Open in Excel
- `traffic_data_all.json` - Consolidated detailed data (all weeks)

---

## 📖 Documentation

**See [TRAFFIC_DATA_GUIDE.md](TRAFFIC_DATA_GUIDE.md)** for complete documentation including:
- How the system works
- Troubleshooting guide
- Manual workflow triggers
- Data format details
- Technical information

---

## 📊 System Info

- **Collection:** Automated weekly (Mondays 2:00 AM UTC or Sundays 7:00 PM MST)
- **Workflow:** https://github.com/EarthBiogenome/dashboard/actions/workflows/repo-analytics-collector.yml
- **Status:** Fully Operational ✅

---

## 🔧 Requirements

```bash
pip install pandas matplotlib seaborn numpy
```

