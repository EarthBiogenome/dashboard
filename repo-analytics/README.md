# EBP Dashboard Traffic Data Collection

Automated weekly collection of GitHub repository traffic data (views and clones).

---

## 🚀 Quick Start

**Get latest data:**
```bash
git pull
```

### Run Analysis
```bash
cd repo-analytics
python analyze_traffic_data.py
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

