# EBP Dashboard Traffic Data Hub

Complete traffic monitoring system for the EBP Dashboard repository.

## 📁 Directory Contents

- **Analysis Tools**: `analyze_traffic_data.py`, `add_historical_traffic.py`, `run_analysis.py`
- **Data Files**: `weekly_summary.csv`, `traffic-YYYY-WXX.json` (detailed weekly data)
- **Visualizations**: `traffic_trends_analysis.png` (generated)

## 🚀 Quick Start

### Get Latest Data
```bash
cd traffic-data
git pull origin ebp-main
```

### Run Analysis
```bash
python analyze_traffic_data.py
# OR
python run_analysis.py
```

**Output**: Data table, trend visualizations (`traffic_trends_analysis.png`), and summary statistics (totals, averages, peak activity, engagement metrics).

### View Raw Data
- **CSV**: Open `weekly_summary.csv` in Excel or any CSV viewer
- **JSON**: Check individual `traffic-YYYY-WXX.json` files for daily breakdowns

## 📊 Data Collection

- **Frequency**: Automated weekly on Mondays at 2:00 AM UTC (collects previous completed week)
- **Source**: GitHub Traffic API via GitHub Actions workflow
- **Coverage**: Captures 14-day rolling window
- **⚠️ Critical**: GitHub only provides **14 days of historical data**. If collection stops, missing weeks **cannot be recovered**.

### Missing Data & Recovery

If data stops at an older date (e.g., August when it's now October):

1. **Manually trigger workflow**: GitHub repository → Actions → "Collect Repository Traffic Data" → Run workflow
2. **Check workflow status**: Ensure Actions are enabled and `TRAFFIC_TOKEN` secret is configured
3. **Verify latest data**: `tail -1 weekly_summary.csv`

**Note**: Data collection happens on Mondays for the **completed previous week**. Checking on Tuesday shows data up to the Sunday that just passed.

## 📈 Analysis Features

Visualizations include weekly and cumulative clone counts, unique cloners, and trend comparisons. Statistics provide all-time totals, weekly averages, peak activity periods, and engagement ratios.

## 📝 Data Format

### Weekly Summary CSV
```csv
week,collection_date,views_count,views_uniques,clones_count,clones_uniques,collected_at
2024-W29,2024-07-15,0,0,34,26,2024-07-15T02:00:00Z
```

### Weekly JSON
Contains detailed daily breakdowns within each 14-day collection window.

## 🔧 Requirements

```bash
pip install pandas matplotlib seaborn numpy
```
