#!/usr/bin/env python3
"""
Weekly Web Analytics Trends Analysis for EBP Dashboard
Creates visualizations showing weekly vs cumulative web traffic trends
Similar to GitHub repository traffic analysis
"""

import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime
from pathlib import Path

# Set up the plotting style to match traffic analysis
plt.style.use('seaborn-v0_8')

def load_weekly_analytics_data():
    """Load weekly analytics data for trend analysis"""
    
    csv_file = Path("weekly_web_analytics.csv")
    
    if not csv_file.exists():
        print("❌ No weekly analytics data found")
        print("💡 Run collect_web_analytics.py first to collect data")
        return None, None
        
    # Load weekly summary data
    weekly_df = pd.read_csv(csv_file)
    weekly_df['collection_date'] = pd.to_datetime(weekly_df['collection_date'])
    weekly_df = weekly_df.sort_values('collection_date')
    
    # Calculate cumulative totals
    weekly_df['cumulative_sessions'] = weekly_df['sessions'].cumsum()
    weekly_df['cumulative_screen_page_views'] = weekly_df['screen_page_views'].cumsum()
    weekly_df['cumulative_custom_events'] = weekly_df['total_custom_events'].cumsum()

    # Cumulative new users: summing new_users each week approximates total unique visitors over time
    weekly_df['cumulative_users'] = weekly_df['new_users'].cumsum()
    
    # Create readable date labels (end date of the week being collected)
    # collection_date is the Monday of the week being collected
    # Show the Sunday (end date) of that week as the label
    weekly_df['week_label'] = (weekly_df['collection_date'] + pd.Timedelta(days=6)).dt.strftime('%m/%d')
    
    # Aggregate weekly data into monthly totals for activity plots
    weekly_df['year_month'] = weekly_df['collection_date'].dt.to_period('M')
    monthly_df = (
        weekly_df.groupby('year_month')
                 .agg(new_users=('new_users', 'sum'),
                      screen_page_views=('screen_page_views', 'sum'))
                 .reset_index()
    )
    monthly_df['collection_date'] = monthly_df['year_month'].dt.to_timestamp()
    monthly_df['cumulative_users'] = monthly_df['new_users'].cumsum()
    monthly_df['cumulative_screen_page_views'] = monthly_df['screen_page_views'].cumsum()

    print(f"✅ Loaded {len(weekly_df)} weeks / {len(monthly_df)} months of analytics data")
    print(f"📅 Date range: {weekly_df['collection_date'].min().strftime('%Y-%m-%d')} to {weekly_df['collection_date'].max().strftime('%Y-%m-%d')}")

    return weekly_df, monthly_df

def create_weekly_trends_analysis(weekly_df):
    """Create weekly trends analysis visualization (similar to GitHub traffic)"""
    
    if weekly_df is None or len(weekly_df) == 0:
        print("❌ No data available for trends analysis")
        return
    
    # Create figure with subplots (2x2 layout similar to GitHub traffic analysis)
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(16, 12))
    
    # Main title
    fig.suptitle('EBP Dashboard Weekly Web Analytics Trends\n(Weekly Actual vs Cumulative Growth)', 
                 fontsize=16, fontweight='bold', y=0.95)
    
    # 1. Weekly Sessions (Actual)
    bars1 = ax1.bar(weekly_df['week_label'], weekly_df['sessions'], 
                    color='skyblue', alpha=0.8, edgecolor='navy', linewidth=0.5)
    ax1.set_title('Weekly Sessions (Actual)', fontweight='bold', fontsize=12)
    ax1.set_xlabel('Week (Month/Day)')
    ax1.set_ylabel('Sessions')
    ax1.grid(True, alpha=0.3)
    
    # Add value labels on bars
    for bar in bars1:
        height = bar.get_height()
        if height > 0:
            ax1.text(bar.get_x() + bar.get_width()/2., height,
                    f'{int(height)}', ha='center', va='bottom', fontsize=9)
    
    plt.setp(ax1.xaxis.get_majorticklabels(), rotation=45)
    
    # 2. Cumulative Sessions (Total)
    line1 = ax2.plot(weekly_df['week_label'], weekly_df['cumulative_sessions'], 
                     marker='o', linewidth=2.5, markersize=6, color='darkblue')
    ax2.fill_between(weekly_df['week_label'], weekly_df['cumulative_sessions'], alpha=0.3, color='lightblue')
    ax2.set_title('Cumulative Sessions (Total)', fontweight='bold', fontsize=12)
    ax2.set_xlabel('Week (Month/Day)')
    ax2.set_ylabel('Total Sessions')
    ax2.grid(True, alpha=0.3)
    
    # Add final total annotation
    final_total = weekly_df['cumulative_sessions'].iloc[-1]
    ax2.text(len(weekly_df)-1, final_total, f'Total: {int(final_total):,}', 
             ha='right', va='bottom', fontsize=10, fontweight='bold',
             bbox=dict(boxstyle='round,pad=0.3', facecolor='yellow', alpha=0.7))
    
    plt.setp(ax2.xaxis.get_majorticklabels(), rotation=45)
    
    # 3. Weekly Users (Actual)
    bars2 = ax3.bar(weekly_df['week_label'], weekly_df['total_users'], 
                    color='lightcoral', alpha=0.8, edgecolor='darkred', linewidth=0.5)
    ax3.set_title('Weekly Users (Actual)', fontweight='bold', fontsize=12)
    ax3.set_xlabel('Week (Month/Day)')
    ax3.set_ylabel('Users')
    ax3.grid(True, alpha=0.3)
    
    # Add value labels on bars
    for bar in bars2:
        height = bar.get_height()
        if height > 0:
            ax3.text(bar.get_x() + bar.get_width()/2., height,
                    f'{int(height)}', ha='center', va='bottom', fontsize=9)
    
    plt.setp(ax3.xaxis.get_majorticklabels(), rotation=45)
    
    # 4. Cumulative Users (Total)
    line2 = ax4.plot(weekly_df['week_label'], weekly_df['cumulative_users'], 
                     marker='s', linewidth=2.5, markersize=6, color='darkred')
    ax4.fill_between(weekly_df['week_label'], weekly_df['cumulative_users'], alpha=0.3, color='lightcoral')
    ax4.set_title('Cumulative Users (Total)', fontweight='bold', fontsize=12)
    ax4.set_xlabel('Week (Month/Day)')
    ax4.set_ylabel('Total Users')
    ax4.grid(True, alpha=0.3)
    
    # Add final total annotation
    final_users = weekly_df['cumulative_users'].iloc[-1]
    ax4.text(len(weekly_df)-1, final_users, f'Total: {int(final_users):,}', 
             ha='right', va='bottom', fontsize=10, fontweight='bold',
             bbox=dict(boxstyle='round,pad=0.3', facecolor='yellow', alpha=0.7))
    
    plt.setp(ax4.xaxis.get_majorticklabels(), rotation=45)
    
    # Adjust layout
    plt.tight_layout()
    
    # Save the plot
    output_file = "weekly_web_analytics_trends.png"
    plt.savefig(output_file, dpi=300, bbox_inches='tight')
    print(f"📊 Weekly trends analysis saved as: {output_file}")

    plt.close()

def create_engagement_trends(monthly_df):
    """Create engagement and interaction trends analysis
    
    Two vertically stacked charts:
    - Top: Cumulative counts (users, views, sessions)
    - Bottom: Weekly actual counts (users, views, sessions)
    
    Note: No gap detection needed - GA4 preserves all data, gaps just mean 
    we haven't collected that period locally yet (not data loss).
    """
    
    def setup_ax(ax):
        ax.set_xlabel('')
        ax.xaxis.set_major_locator(mdates.MonthLocator())
        ax.xaxis.set_major_formatter(mdates.DateFormatter('%b\n%Y'))

    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(14, 10))
    fig.suptitle('EBP Dashboard Web Analytics Trends', fontsize=16, fontweight='bold', y=0.995)

    C_USERS_CUM = 'darkred'
    C_USERS_CUM_FILL = 'lightcoral'
    C_VIEWS_CUM = 'darkblue'
    C_VIEWS_CUM_FILL = 'lightblue'
    C_USERS_WK = 'lightcoral'
    C_VIEWS_WK = 'skyblue'

    # 1. TOP CHART: Cumulative Counts (page views first = top of legend)
    m_dates = monthly_df['collection_date'].values
    ax1.plot_date(m_dates, monthly_df['cumulative_screen_page_views'],
                  fmt='-s', linewidth=3, markersize=6, label='Total Page Views', color=C_VIEWS_CUM)
    ax1.fill_between(m_dates, monthly_df['cumulative_screen_page_views'], alpha=0.3, color=C_VIEWS_CUM_FILL)

    ax1.plot_date(m_dates, monthly_df['cumulative_users'],
                  fmt='-o', linewidth=3, markersize=6, label='Total First-Time Users', color=C_USERS_CUM)
    ax1.fill_between(m_dates, monthly_df['cumulative_users'], alpha=0.3, color=C_USERS_CUM_FILL)

    final_users = monthly_df['cumulative_users'].iloc[-1]
    final_views = monthly_df['cumulative_screen_page_views'].iloc[-1]

    ax1.text(m_dates[-1], final_views, f'{int(final_views):,}',
             ha='left', va='bottom', fontsize=9, fontweight='bold', color=C_VIEWS_CUM)
    ax1.text(m_dates[-1], final_users, f'{int(final_users):,}',
             ha='left', va='bottom', fontsize=9, fontweight='bold', color=C_USERS_CUM)

    ax1.set_title('')
    ax1.set_ylabel('Cumulative Count', fontsize=11, fontweight='bold')
    ax1.legend(loc='upper left', fontsize=18)
    ax1.set_facecolor('#f8f9fa')
    ax1.grid(True, color='#e0e0e0', linestyle='-', linewidth=0.5, alpha=0.7)
    setup_ax(ax1)

    # 2. BOTTOM CHART: Monthly Counts (page views first = top of legend)
    m_dates = monthly_df['collection_date'].values
    ax2.plot_date(m_dates, monthly_df['screen_page_views'],
                  fmt='-s', linewidth=3, markersize=6, label='Monthly Page Views', color=C_VIEWS_WK)
    ax2.fill_between(m_dates, monthly_df['screen_page_views'], alpha=0.3, color=C_VIEWS_WK)

    ax2.plot_date(m_dates, monthly_df['new_users'],
                  fmt='-o', linewidth=3, markersize=6, label='Monthly First-Time Users', color=C_USERS_WK)
    ax2.fill_between(m_dates, monthly_df['new_users'], alpha=0.3, color=C_USERS_WK)

    ax2.set_title('')
    ax2.set_ylabel('Monthly Count', fontsize=11, fontweight='bold')
    ax2.legend(loc='upper left', fontsize=18)
    ax2.set_facecolor('#f8f9fa')
    ax2.grid(True, color='#e0e0e0', linestyle='-', linewidth=0.5, alpha=0.7)
    setup_ax(ax2)
    
    plt.tight_layout()
    
    # Save engagement trends
    engagement_file = "web_engagement_trends.png"
    plt.savefig(engagement_file, dpi=300, bbox_inches='tight')
    print(f"📈 Web analytics trends saved as: {engagement_file}")
    
    plt.close()

def create_geographic_growth_analysis(weekly_df):
    """Create geographic reach growth analysis"""
    
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 7))
    
    fig.suptitle('EBP Dashboard Global Reach & Custom Events Growth', 
                 fontsize=16, fontweight='bold', y=0.95)
    
    # 1. Countries reached over time
    ax1.bar(weekly_df['week_label'], weekly_df['countries_reached'], 
            color='gold', alpha=0.8, edgecolor='orange')
    ax1.set_title('Weekly Countries Reached', fontweight='bold', fontsize=14)
    ax1.set_xlabel('Week')
    ax1.set_ylabel('Number of Countries')
    ax1.grid(True, alpha=0.3)
    
    # Add value labels
    for i, (week, countries) in enumerate(zip(weekly_df['week_label'], weekly_df['countries_reached'])):
        if countries > 0:
            ax1.text(i, countries + 0.1, f'{int(countries)}', 
                    ha='center', va='bottom', fontsize=9, fontweight='bold')
    
    plt.setp(ax1.xaxis.get_majorticklabels(), rotation=45)
    
    # 2. Cumulative custom events (dashboard interactions)
    ax2.plot(weekly_df['week_label'], weekly_df['cumulative_custom_events'], 
             marker='*', linewidth=3, markersize=8, color='purple')
    ax2.fill_between(weekly_df['week_label'], weekly_df['cumulative_custom_events'], 
                     alpha=0.3, color='plum')
    ax2.set_title('Cumulative Custom Events (Dashboard Interactions)', fontweight='bold', fontsize=14)
    ax2.set_xlabel('Week')
    ax2.set_ylabel('Total Custom Events')
    ax2.grid(True, alpha=0.3)
    
    # Add final total
    final_events = weekly_df['cumulative_custom_events'].iloc[-1]
    ax2.text(len(weekly_df)-1, final_events, f'Total: {int(final_events):,}', 
             ha='right', va='bottom', fontsize=10, fontweight='bold',
             bbox=dict(boxstyle='round,pad=0.3', facecolor='yellow', alpha=0.7))
    
    plt.setp(ax2.xaxis.get_majorticklabels(), rotation=45)
    
    plt.tight_layout()
    
    # Save geographic analysis
    geo_file = "weekly_geographic_events.png"
    plt.savefig(geo_file, dpi=300, bbox_inches='tight')
    print(f"🌍 Geographic & events analysis saved as: {geo_file}")
    
    plt.close()

def print_weekly_summary_statistics(weekly_df):
    """Print comprehensive weekly summary statistics"""
    
    print("\n" + "="*80)
    print("📈 WEEKLY WEB ANALYTICS SUMMARY STATISTICS")
    print("="*80)
    
    print(f"\n🗓️  TIMEFRAME:")
    print(f"   • Start Date: {weekly_df['collection_date'].min().strftime('%B %d, %Y')}")
    print(f"   • End Date: {weekly_df['collection_date'].max().strftime('%B %d, %Y')}")
    print(f"   • Total Weeks: {len(weekly_df)}")
    
    print(f"\n📊 TRAFFIC STATISTICS:")
    print(f"   • Total Sessions (All Time): {weekly_df['cumulative_sessions'].iloc[-1]:,}")
    print(f"   • Total Users (All Time): {weekly_df['cumulative_users'].iloc[-1]:,}")
    print(f"   • Total Screen Page Views: {weekly_df['cumulative_screen_page_views'].iloc[-1]:,}")
    print(f"   • Average Weekly Sessions: {weekly_df['sessions'].mean():.1f}")
    print(f"   • Peak Weekly Sessions: {weekly_df['sessions'].max()} (Week of {weekly_df.loc[weekly_df['sessions'].idxmax(), 'collection_date'].strftime('%m/%d/%Y')})")
    
    print(f"\n🎯 ENGAGEMENT METRICS:")
    print(f"   • Average Engagement Rate: {(weekly_df['avg_engagement_rate'].mean() * 100):.1f}%")
    print(f"   • Average Session Duration: {weekly_df['avg_session_duration'].mean():.1f} seconds")
    print(f"   • Total Custom Events: {weekly_df['cumulative_custom_events'].iloc[-1]:,}")
    print(f"   • Peak Countries in Week: {weekly_df['countries_reached'].max()}")
    
    print(f"\n🌍 GROWTH METRICS:")
    print(f"   • Weekly Growth Rate (Sessions): {((weekly_df['sessions'].iloc[-1] / weekly_df['sessions'].iloc[0]) - 1) * 100:.1f}%" if len(weekly_df) > 1 else "N/A")
    print(f"   • User Retention Rate: {(weekly_df['total_users'].sum() - weekly_df['new_users'].sum()) / weekly_df['total_users'].sum() * 100:.1f}%" if weekly_df['total_users'].sum() > 0 else "N/A")
    print(f"   • Recent Activity: {weekly_df['screen_page_views'].tail(3).sum()} page views in last 3 weeks")
    
    print("="*80)

def main():
    """Main weekly trends analysis function"""
    
    print("🚀 Starting EBP Dashboard Weekly Web Analytics Trends Analysis...")
    print("="*80)
    
    # Load weekly data
    weekly_df, monthly_df = load_weekly_analytics_data()
    
    if weekly_df is None:
        return
    
    # Print data overview
    print("\n📋 WEEKLY DATA OVERVIEW:")
    print(weekly_df[['week', 'collection_date', 'sessions', 'total_users',
                     'screen_page_views', 'cumulative_sessions', 'cumulative_users']].to_string(index=False))
    
    # Create visualizations (only engagement trends)
    print("\n📈 Creating engagement trends...")
    create_engagement_trends(monthly_df)
    
    # Print summary statistics
    print_weekly_summary_statistics(weekly_df)
    
    print(f"\n✅ Weekly trends analysis complete!")
    print(f"📁 Generated visualization file:")
    print(f"   • weekly_engagement_trends.png")

if __name__ == "__main__":
    main()
