# EBP Dashboard Web Analytics

Automated weekly collection of Google Analytics 4 (GA4) data for website traffic and user engagement.

---

## 🚀 Quick Start

**Get latest data:**
```bash
git pull
```

**Run analysis (optional):**
```bash
cd web-analytics
python analyze_weekly_trends.py
```

**View raw data:**
- `weekly_web_analytics.csv` - Open in Excel
- `weekly_analytics_YYYY-WXX.json` - Detailed weekly snapshots

---

## 📖 Documentation

**See [WEB_ANALYTICS_GUIDE.md](WEB_ANALYTICS_GUIDE.md)** for complete documentation including:
- How the system works
- GA4 setup instructions
- Custom events reference
- Troubleshooting guide
- API configuration

---

## 📊 System Info

- **Collection:** Automated weekly (Mondays 2:00 AM UTC)
- **Workflow:** https://github.com/EarthBiogenome/dashboard/actions/workflows/web-analytics-collector.yml
- **Status:** Fully Operational ✅

---

## 🔧 Requirements

```bash
pip install -r requirements.txt
```

Or manually:
```bash
pip install google-analytics-data pandas python-dateutil matplotlib seaborn numpy
```

---

*See [WEB_ANALYTICS_GUIDE.md](WEB_ANALYTICS_GUIDE.md) for detailed documentation*

