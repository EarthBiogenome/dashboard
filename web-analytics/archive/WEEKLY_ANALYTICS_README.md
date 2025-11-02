# Weekly Web Analytics Data

This directory contains automatically collected weekly Google Analytics data for the EBP Dashboard.

## Files

- `weekly_web_analytics.csv`: Weekly summary data that grows over time
- `weekly_analytics_YYYY-WXX.json`: Detailed weekly data with raw GA4 metrics

## Data Collection

- **Frequency**: Weekly collection (manually or automated)
- **Data Period**: Each collection covers the past 7 days
- **Metrics Collected**: Sessions, users, page views, engagement, geographic data, custom events
- **Format**: Similar to GitHub traffic data for consistent analysis

## Weekly Summary CSV Format

```csv
week,collection_date,sessions,total_users,new_users,screen_page_views,avg_bounce_rate,avg_session_duration,avg_engagement_rate,countries_reached,total_custom_events,days_collected,collected_at
2025-W34,2025-08-29,81,55,45,76,0.2850,45.2,0.7150,9,750,7,2025-08-29T...
```

## Usage

- **Weekly Collection**: Run `python collect_web_analytics.py`
- **Analysis & Visualization**: Run `python analyze_web_trends.py`
- **Comparison with Repository Traffic**: Both systems use similar week numbering

## Data Interpretation

- **Sessions**: Total user sessions during the week
- **Total Users**: Unique users who visited
- **Screen Page Views**: Total page views across all users
- **Engagement Rate**: Average user engagement (0-1 scale)
- **Countries Reached**: Number of different countries with visitors
- **Custom Events**: Dashboard interaction events (clicks, scrolls, etc.)

Last updated: 2025-08-29
