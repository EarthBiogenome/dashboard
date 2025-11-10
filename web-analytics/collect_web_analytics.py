#!/usr/bin/env python3
"""
Weekly Web Analytics Collector for EBP Dashboard

**Purpose: Manual collection/backfilling only**

This script is used for:
- Backfilling missed periods when automation fails
- Collecting historical data before automation was set up
- Local testing/debugging of collection logic

**Normal Usage:**
For regular operations, data collection happens automatically via GitHub Actions.
Just run: `python analyze_web_trends.py` after `git pull`

Similar to `add_historical_traffic.py` in repo-analytics, but with active API collection
capability for any date range, not just hardcoded historical values.
"""

import os
import json
import csv
import pandas as pd
from datetime import datetime, timezone, timedelta
from pathlib import Path
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    DateRange,
    Dimension,
    Metric,
    RunReportRequest,
    OrderBy
)
from google.oauth2.service_account import Credentials

class WeeklyAnalyticsCollector:
    def __init__(self):
        self.data_dir = Path(".")
        self.weekly_summary_file = "weekly_web_analytics.csv"
        self.config_file = Path("ga4_config.json")
        self.credentials_file = Path("ga4_service_account.json")
        self.client = None
        self.property_id = None
        self.config = None
        
    def get_week_info(self, date=None):
        """Get week number and date info
        
        Matches automated workflow logic: calculates previous completed week's Monday
        """
        if date is None:
            # Calculate previous week's Monday (completed week) to match workflow
            date = datetime.now(timezone.utc)
            days_since_monday = date.weekday()  # 0=Monday, 6=Sunday
            previous_monday = date - timedelta(days=days_since_monday + 7)
            date = previous_monday
            
        # Use ISO week calculation for consistency with automated workflow
        week_str = date.strftime("%Y-W%V")
        
        return {
            "week": week_str,
            "collection_date": date.strftime("%Y-%m-%d"),  # Monday of the collected week
            "week_start": date.strftime("%Y-%m-%d"),  # Same as collection_date (Monday)
            "collected_at": datetime.now(timezone.utc).isoformat()  # Actual collection timestamp
        }
    
    def setup_authentication(self):
        """Set up Google Analytics API authentication"""
        
        if not self.credentials_file.exists():
            print(f"❌ Service account credentials not found: {self.credentials_file}")
            return False
            
        try:
            with open(self.credentials_file, "r", encoding="utf-8") as credentials_source:
                try:
                    credentials_data = json.load(credentials_source)
                except json.JSONDecodeError as json_error:
                    print(f"❌ Authentication failed: Invalid JSON in credentials file ({json_error})")
                    print("   ➜ Re-save the GA4 service account JSON in the GA4_SERVICE_ACCOUNT_KEY secret (paste the raw JSON, no extra characters).")
                    return False

            credentials = Credentials.from_service_account_info(
                credentials_data,
                scopes=["https://www.googleapis.com/auth/analytics.readonly"]
            )
            self.client = BetaAnalyticsDataClient(credentials=credentials)
            print(f"✅ Authentication successful")
            return True
            
        except Exception as e:
            print(f"❌ Authentication failed: {e}")
            return False
    
    def load_config(self):
        """Load configuration from file"""
        
        if not self.config_file.exists():
            print(f"❌ Configuration file not found: {self.config_file}")
            return False
            
        with open(self.config_file, 'r') as f:
            self.config = json.load(f)
            
        self.property_id = self.config.get('property_id')
        print(f"✅ Configuration loaded for property: {self.property_id}")
        return True
    
    def collect_overview_metrics(self, start_date="7daysAgo", end_date="today", include_date_dimension=True):
        """Collect overview metrics (sessions, users, pageviews, etc.)"""
        
        print(f"📊 Collecting overview metrics ({start_date} to {end_date})")
        
        # For monthly aggregated data, don't use date dimension to avoid double-counting
        dimensions = [Dimension(name="date")] if include_date_dimension else []
        order_bys = [OrderBy(dimension={"dimension_name": "date"})] if include_date_dimension else []
        
        request = RunReportRequest(
            property=f"properties/{self.property_id}",
            date_ranges=[DateRange(start_date=start_date, end_date=end_date)],
            metrics=[
                Metric(name="sessions"),
                Metric(name="totalUsers"),
                Metric(name="newUsers"),
                Metric(name="screenPageViews"),
                Metric(name="bounceRate"),
                Metric(name="averageSessionDuration"),
                Metric(name="engagementRate")
            ],
            dimensions=dimensions,
            order_bys=order_bys
        )
        
        try:
            response = self.client.run_report(request=request)
            
            data = []
            for row in response.rows:
                metrics_values = [mv.value for mv in row.metric_values]
                
                # Handle both daily data (with date) and aggregated data (without date)
                if include_date_dimension:
                    date_value = row.dimension_values[0].value
                    data.append({
                        "date": date_value,
                        "sessions": int(float(metrics_values[0] or 0)),
                        "total_users": int(float(metrics_values[1] or 0)),
                        "new_users": int(float(metrics_values[2] or 0)),
                        "screen_page_views": int(float(metrics_values[3] or 0)),
                        "bounce_rate": float(metrics_values[4] or 0),
                        "avg_session_duration": float(metrics_values[5] or 0),
                        "engagement_rate": float(metrics_values[6] or 0)
                    })
                else:
                    # Aggregated data for the entire period
                    data.append({
                        "sessions": int(float(metrics_values[0] or 0)),
                        "total_users": int(float(metrics_values[1] or 0)),
                        "new_users": int(float(metrics_values[2] or 0)),
                        "screen_page_views": int(float(metrics_values[3] or 0)),
                        "bounce_rate": float(metrics_values[4] or 0),
                        "avg_session_duration": float(metrics_values[5] or 0),
                        "engagement_rate": float(metrics_values[6] or 0)
                    })
                
            period_type = "days" if include_date_dimension else "period"
            print(f"✅ Collected {len(data)} {period_type} of overview metrics")
            return data
            
        except Exception as e:
            print(f"❌ Failed to collect overview metrics: {e}")
            return []
    
    def collect_geographic_data(self, start_date="7daysAgo", end_date="today"):
        """Collect geographic data (countries, cities)"""
        
        print(f"🌍 Collecting geographic data ({start_date} to {end_date})")
        
        request = RunReportRequest(
            property=f"properties/{self.property_id}",
            date_ranges=[DateRange(start_date=start_date, end_date=end_date)],
            metrics=[
                Metric(name="sessions"),
                Metric(name="totalUsers"),
                Metric(name="screenPageViews")
            ],
            dimensions=[
                Dimension(name="country"),
                Dimension(name="city")
            ],
            order_bys=[OrderBy(metric={"metric_name": "sessions"}, desc=True)]
        )
        
        try:
            response = self.client.run_report(request=request)
            
            data = []
            for row in response.rows:
                country = row.dimension_values[0].value
                city = row.dimension_values[1].value
                sessions = int(float(row.metric_values[0].value or 0))
                users = int(float(row.metric_values[1].value or 0))
                screen_page_views = int(float(row.metric_values[2].value or 0))
                
                data.append({
                    "country": country,
                    "city": city,
                    "sessions": sessions,
                    "users": users,
                    "screen_page_views": screen_page_views
                })
                
            print(f"✅ Collected geographic data from {len(data)} locations")
            return data
            
        except Exception as e:
            print(f"❌ Failed to collect geographic data: {e}")
            return []
    
    def collect_device_data(self, start_date="7daysAgo", end_date="today"):
        """Collect device and technology data"""
        
        print(f"📱 Collecting device data ({start_date} to {end_date})")
        
        request = RunReportRequest(
            property=f"properties/{self.property_id}",
            date_ranges=[DateRange(start_date=start_date, end_date=end_date)],
            metrics=[
                Metric(name="sessions"),
                Metric(name="totalUsers")
            ],
            dimensions=[
                Dimension(name="deviceCategory"),
                Dimension(name="browser"),
                Dimension(name="operatingSystem")
            ],
            order_bys=[OrderBy(metric={"metric_name": "sessions"}, desc=True)]
        )
        
        try:
            response = self.client.run_report(request=request)
            
            data = []
            for row in response.rows:
                device_category = row.dimension_values[0].value
                browser = row.dimension_values[1].value
                operating_system = row.dimension_values[2].value
                sessions = int(float(row.metric_values[0].value or 0))
                users = int(float(row.metric_values[1].value or 0))
                
                data.append({
                    "device_category": device_category,
                    "browser": browser,
                    "operating_system": operating_system,
                    "sessions": sessions,
                    "users": users
                })
                
            print(f"✅ Collected device data from {len(data)} combinations")
            return data
            
        except Exception as e:
            print(f"❌ Failed to collect device data: {e}")
            return []
    
    def collect_custom_events(self, start_date="7daysAgo", end_date="today"):
        """Collect custom event data (dashboard interactions)"""
        
        print(f"🎯 Collecting custom events ({start_date} to {end_date})")
        
        custom_events = self.config.get("custom_events", [
            "visualization_click",
            "category_view", 
            "dashboard_loaded",
            "scroll_depth"
        ])
        
        request = RunReportRequest(
            property=f"properties/{self.property_id}",
            date_ranges=[DateRange(start_date=start_date, end_date=end_date)],
            metrics=[Metric(name="eventCount")],
            dimensions=[
                Dimension(name="eventName"),
                Dimension(name="date")
            ],
            dimension_filter={
                "filter": {
                    "field_name": "eventName",
                    "in_list_filter": {
                        "values": custom_events
                    }
                }
            },
            order_bys=[OrderBy(dimension={"dimension_name": "date"})]
        )
        
        try:
            response = self.client.run_report(request=request)
            
            data = []
            for row in response.rows:
                event_name = row.dimension_values[0].value
                date_value = row.dimension_values[1].value
                event_count = int(float(row.metric_values[0].value or 0))
                
                data.append({
                    "event_name": event_name,
                    "date": date_value,
                    "event_count": event_count
                })
                
            print(f"✅ Collected {len(data)} custom event records")
            return data
            
        except Exception as e:
            print(f"❌ Failed to collect custom events: {e}")
            return []
    
    def collect_weekly_data(self, days_back=None):
        """Collect GA4 data for the previous completed week (Monday to Sunday)
        
        Matches automated workflow logic to ensure exactly 7 days of data
        """
        
        print(f"🚀 Starting weekly web analytics collection")
        print("=" * 60)
        
        # Load configuration and setup authentication
        if not self.load_config():
            return None
            
        if not self.setup_authentication():
            return None
        
        # Calculate previous week's Monday to Sunday (completed week)
        # This matches the automated workflow logic
        if days_back is None:
            today = datetime.now(timezone.utc)
            days_since_monday = today.weekday()  # 0=Monday, 6=Sunday
            previous_monday = today - timedelta(days=days_since_monday + 7)
            previous_sunday = previous_monday + timedelta(days=6)
            
            # Format dates for GA4 API
            start_date = previous_monday.strftime("%Y-%m-%d")
            end_date = previous_sunday.strftime("%Y-%m-%d")
            
            print(f"📅 Collecting data for previous completed week")
            print(f"   Period: {start_date} to {end_date} (7 days)")
        else:
            # Legacy mode: use days_back for custom periods
            start_date = f"{days_back}daysAgo"
            end_date = "today"
            print(f"📅 Collecting data for past {days_back} days (custom period)")
        
        # Use date strings for API calls
        # GA4 API accepts both "YYYY-MM-DD" format and "NdaysAgo"/"today"
        overview_data = self.collect_overview_metrics(start_date, end_date)
        geographic_data = self.collect_geographic_data(start_date, end_date)
        device_data = self.collect_device_data(start_date, end_date)
        events_data = self.collect_custom_events(start_date, end_date)
        
        # Collect aggregated metrics for the SAME period (to get accurate unique user count)
        # Using include_date_dimension=False gives us period-wide unique users (no double-counting)
        period_overview = self.collect_overview_metrics(start_date, end_date, include_date_dimension=False)
        
        # Also collect 30-day overview for monthly dashboard comparison
        monthly_overview = self.collect_overview_metrics("30daysAgo", "today", include_date_dimension=False)
        
        if not overview_data:
            print("❌ No overview data collected")
            return None
            
        return {
            "overview_data": overview_data,
            "geographic_data": geographic_data,
            "device_data": device_data,
            "events_data": events_data,
            "period_overview": period_overview,
            "monthly_overview": monthly_overview
        }
    
    def aggregate_weekly_metrics(self, data):
        """Aggregate daily data into weekly totals"""
        
        overview_data = data["overview_data"]
        geographic_data = data["geographic_data"]
        device_data = data["device_data"]
        events_data = data["events_data"]
        period_overview = data["period_overview"]
        monthly_overview = data["monthly_overview"]
        
        # Period totals - use aggregated data for accurate counts (no date dimension)
        # This ensures sessions and page views are counted correctly for the entire period
        # without double-counting issues from sessions spanning midnight
        period_metrics = period_overview[0] if period_overview else {}
        weekly_metrics = {
            "sessions": period_metrics.get("sessions", 0),  # Use period-aggregated sessions
            "total_users": period_metrics.get("total_users", 0),  # Use period-aggregated unique users
            "new_users": sum(day.get("new_users", 0) for day in overview_data),  # Keep daily sum for new_users
            "screen_page_views": period_metrics.get("screen_page_views", 0),  # Use period-aggregated page views
            "avg_bounce_rate": sum(day.get("bounce_rate", 0) for day in overview_data) / len(overview_data) if overview_data else 0,
            "avg_session_duration": sum(day.get("avg_session_duration", 0) for day in overview_data) / len(overview_data) if overview_data else 0,
            "avg_engagement_rate": sum(day.get("engagement_rate", 0) for day in overview_data) / len(overview_data) if overview_data else 0,
            "countries_reached": len(set(item["country"] for item in geographic_data)) if geographic_data else 0,
            "total_custom_events": sum(event.get("event_count", 0) for event in events_data) if events_data else 0,
            "days_collected": len(overview_data),
            # Add 30-day active users for dashboard comparison (single aggregated record)
            "monthly_active_users": monthly_overview[0].get("total_users", 0) if monthly_overview else 0,
            "monthly_sessions": monthly_overview[0].get("sessions", 0) if monthly_overview else 0
        }
        
        return weekly_metrics
    
    def save_weekly_json(self, week_info, data, weekly_metrics):
        """Save detailed weekly data to consolidated JSON file"""
        
        # Create week data structure
        week_data = {
            "collection_info": {
                **week_info,
                "property_id": self.property_id,
                "website_url": self.config.get('website_url', 'N/A')
            },
            "weekly_metrics": weekly_metrics,
            "raw_data": data,
            "summary": {
                "period": f"{week_info['week_start']} to {week_info['collection_date']}",
                "days_of_data": weekly_metrics["days_collected"],
                "engagement_quality": "High" if weekly_metrics["avg_engagement_rate"] > 0.7 else "Medium" if weekly_metrics["avg_engagement_rate"] > 0.5 else "Low"
            }
        }
        
        # Load or create consolidated file
        consolidated_file = Path("weekly_analytics_all.json")
        
        if consolidated_file.exists():
            with open(consolidated_file, 'r', encoding='utf-8') as f:
                consolidated = json.load(f)
        else:
            consolidated = {
                "metadata": {
                    "description": "Consolidated weekly web analytics data for EBP Dashboard",
                    "total_weeks": 0,
                    "date_range": {},
                    "last_updated": ""
                },
                "weeks": []
            }
        
        # Check if this week already exists (update) or is new (append)
        existing_week_index = None
        for i, week in enumerate(consolidated['weeks']):
            if week['collection_info']['week'] == week_info['week']:
                existing_week_index = i
                break
        
        if existing_week_index is not None:
            # Update existing week
            consolidated['weeks'][existing_week_index] = week_data
            print(f"🔄 Updated existing week {week_info['week']} in consolidated file")
        else:
            # Append new week
            consolidated['weeks'].append(week_data)
            print(f"➕ Added new week {week_info['week']} to consolidated file")
        
        # Sort weeks by week number
        consolidated['weeks'].sort(key=lambda x: x['collection_info']['week'])
        
        # Update metadata
        consolidated['metadata']['total_weeks'] = len(consolidated['weeks'])
        consolidated['metadata']['last_updated'] = datetime.now().isoformat()
        
        if consolidated['weeks']:
            consolidated['metadata']['date_range'] = {
                "first_week": consolidated['weeks'][0]['collection_info']['week'],
                "last_week": consolidated['weeks'][-1]['collection_info']['week'],
                "first_collection": consolidated['weeks'][0]['collection_info']['collection_date'],
                "last_collection": consolidated['weeks'][-1]['collection_info']['collection_date']
            }
        
        # Save consolidated file
        with open(consolidated_file, 'w', encoding='utf-8') as f:
            json.dump(consolidated, f, indent=2, ensure_ascii=False)
            
        print(f"✅ Weekly data saved to consolidated file: {consolidated_file}")
        return str(consolidated_file)
    
    def update_weekly_summary_csv(self, week_info, weekly_metrics):
        """Update the cumulative weekly summary CSV"""
        
        csv_file = Path(self.weekly_summary_file)
        file_exists = csv_file.exists()
        
        # Check if this week already exists
        existing_data = []
        if file_exists:
            existing_df = pd.read_csv(csv_file)
            if week_info["week"] in existing_df["week"].values:
                print(f"⚠️  Week {week_info['week']} already exists, updating...")
                existing_df = existing_df[existing_df["week"] != week_info["week"]]
                existing_df.to_csv(csv_file, index=False)
                file_exists = len(existing_df) > 0
        
        with open(csv_file, 'a', newline='', encoding='utf-8') as f:
            fieldnames = [
                'week', 'collection_date', 'sessions', 'total_users', 'new_users',
                'screen_page_views', 'avg_bounce_rate', 'avg_session_duration', 
                'avg_engagement_rate', 'countries_reached', 'total_custom_events',
                'days_collected', 'monthly_active_users', 'monthly_sessions', 'collected_at'
            ]
            
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            
            if not file_exists:
                writer.writeheader()
                print(f"📝 Created new weekly summary file: {csv_file}")
            
            writer.writerow({
                'week': week_info['week'],
                'collection_date': week_info['collection_date'],
                'sessions': weekly_metrics['sessions'],
                'total_users': weekly_metrics['total_users'],
                'new_users': weekly_metrics['new_users'],
                'screen_page_views': weekly_metrics['screen_page_views'],
                'avg_bounce_rate': round(weekly_metrics['avg_bounce_rate'], 4),
                'avg_session_duration': round(weekly_metrics['avg_session_duration'], 2),
                'avg_engagement_rate': round(weekly_metrics['avg_engagement_rate'], 4),
                'countries_reached': weekly_metrics['countries_reached'],
                'total_custom_events': weekly_metrics['total_custom_events'],
                'days_collected': weekly_metrics['days_collected'],
                'monthly_active_users': weekly_metrics['monthly_active_users'],
                'monthly_sessions': weekly_metrics['monthly_sessions'],
                'collected_at': week_info['collected_at']
            })
        
        print(f"✅ Weekly summary updated: {csv_file}")
        return csv_file
    
    def create_readme_if_needed(self):
        """Create README for weekly analytics data"""
        
        readme_file = Path("WEEKLY_ANALYTICS_README.md")
        
        if readme_file.exists():
            return
            
        readme_content = """# Weekly Web Analytics Data

This directory contains automatically collected weekly Google Analytics data for the EBP Dashboard.

## Files

- `weekly_web_analytics.csv`: Weekly summary data that grows over time
- `weekly_analytics_all.json`: Consolidated detailed data with raw GA4 metrics (all weeks)

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

Last updated: """ + datetime.now().strftime("%Y-%m-%d") + """
"""
        
        with open(readme_file, 'w', encoding='utf-8') as f:
            f.write(readme_content)
            
        print(f"✅ Created README: {readme_file}")
    
    def run_weekly_collection(self, days_back=None):
        """Main weekly collection workflow
        
        By default (days_back=None), collects previous completed week (Monday-Sunday, 7 days)
        Matches automated workflow behavior for consistency
        """
        
        week_info = self.get_week_info()
        
        print(f"📊 Weekly Web Analytics Collection")
        print(f"Week: {week_info['week']} (Collection: {week_info['collection_date']})")
        print("=" * 60)
        
        # Collect data for previous completed week (7 days, Monday-Sunday)
        # or custom period if days_back is specified
        data = self.collect_weekly_data(days_back=days_back)
        if not data:
            print("❌ Weekly collection failed - no data collected")
            return False
            
        # Aggregate weekly metrics
        weekly_metrics = self.aggregate_weekly_metrics(data)
        
        # Save detailed JSON
        json_file = self.save_weekly_json(week_info, data, weekly_metrics)
        
        # Update weekly summary CSV
        csv_file = self.update_weekly_summary_csv(week_info, weekly_metrics)
        
        # Create README if needed
        self.create_readme_if_needed()
        
        # Print summary
        print("=" * 60)
        print("📈 WEEKLY COLLECTION SUMMARY")
        print("=" * 60)
        print(f"✅ Week: {week_info['week']}")
        print(f"✅ Sessions: {weekly_metrics['sessions']:,}")
        print(f"✅ Users: {weekly_metrics['total_users']:,} ({weekly_metrics['new_users']:,} new)")
        print(f"✅ Screen Page Views: {weekly_metrics['screen_page_views']:,}")
        print(f"✅ Countries Reached: {weekly_metrics['countries_reached']}")
        print(f"✅ Custom Events: {weekly_metrics['total_custom_events']:,}")
        print(f"✅ Engagement Rate: {weekly_metrics['avg_engagement_rate']:.1%}")
        print(f"")
        print(f"📊 30-Day Dashboard Comparison:")
        print(f"✅ Active Users (30 days): {weekly_metrics['monthly_active_users']:,}")
        print(f"✅ Total Sessions (30 days): {weekly_metrics['monthly_sessions']:,}")
        print(f"")
        print(f"📁 Files updated:")
        print(f"   • {json_file} (detailed weekly data)")
        print(f"   • {csv_file} (cumulative summary)")
        print("=" * 60)
        
        return True

def main():
    collector = WeeklyAnalyticsCollector()
    
    if collector.run_weekly_collection():
        print("🎉 Weekly web analytics collection completed successfully!")
    else:
        print("❌ Weekly web analytics collection failed")

if __name__ == "__main__":
    main()
