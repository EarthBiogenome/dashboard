#!/usr/bin/env python3
"""
Traffic Data Analysis and Visualization for EBP Dashboard Repository
Analyzes both visitor (views) and clone metrics with weekly and cumulative trends
"""

import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime
from pathlib import Path

def load_and_prepare_data():
    """Load traffic data and prepare for analysis"""
    
    csv_file = Path("weekly_summary.csv")
    
    if not csv_file.exists():
        print(f"❌ Could not find {csv_file}")
        return None, None
    
    # Load data
    df = pd.read_csv(csv_file)
    
    # Convert date column to datetime (handle mixed formats)
    df['collection_date'] = pd.to_datetime(df['collection_date'], format='mixed', dayfirst=False)
    
    # Sort by date to ensure proper chronological order
    df = df.sort_values('collection_date')
    
    # Calculate cumulative totals for both views and clones
    df['cumulative_views_count'] = df['views_count'].cumsum()
    df['cumulative_views_uniques'] = df['views_uniques'].cumsum()
    df['cumulative_clones_count'] = df['clones_count'].cumsum()
    df['cumulative_clones_uniques'] = df['clones_uniques'].cumsum()
    
    # Create readable date labels (end date of the week being collected)
    # collection_date is the Monday of the week being collected
    # Show the Sunday (end date) of that week as the label
    df['week_label'] = (df['collection_date'] + pd.Timedelta(days=6)).dt.strftime('%m/%d')
    df['month_year'] = df['collection_date'].dt.strftime('%b %Y')

    # Aggregate weekly data into monthly totals for activity plots
    df['year_month'] = df['collection_date'].dt.to_period('M')
    monthly_df = (
        df.groupby('year_month')
          .agg(views_count=('views_count', 'sum'),
               views_uniques=('views_uniques', 'sum'),
               clones_count=('clones_count', 'sum'),
               clones_uniques=('clones_uniques', 'sum'))
          .reset_index()
    )
    monthly_df['collection_date'] = monthly_df['year_month'].dt.to_timestamp()
    monthly_df['cumulative_views_count'] = monthly_df['views_count'].cumsum()
    monthly_df['cumulative_views_uniques'] = monthly_df['views_uniques'].cumsum()
    monthly_df['cumulative_clones_count'] = monthly_df['clones_count'].cumsum()
    monthly_df['cumulative_clones_uniques'] = monthly_df['clones_uniques'].cumsum()

    print(f"✅ Loaded {len(df)} weeks / {len(monthly_df)} months of traffic data")
    print(f"📅 Date range: {df['collection_date'].min().strftime('%Y-%m-%d')} to {df['collection_date'].max().strftime('%Y-%m-%d')}")

    # Check if we have views data
    has_views_data = df['views_count'].sum() > 0
    if has_views_data:
        print(f"👁️  Views data available: {df['views_count'].sum():,} total views")
    else:
        print(f"⚠️  No views data yet (may be zero or not collected)")

    return df, monthly_df


def create_trend_analysis(df, monthly_df):
    """Create comprehensive traffic trend analysis visualization for both views and clones"""

    has_views_data = df['views_count'].sum() > 0
    
    # Create figure with 4 subplots if views data exists, otherwise 2 for clones only
    if has_views_data:
        fig, axes = plt.subplots(4, 1, figsize=(10, 12))
        ax1, ax2, ax3, ax4 = axes
    else:
        fig, axes = plt.subplots(2, 1, figsize=(10, 8))
        ax1, ax2 = axes
    
    # Detect data gaps (more than 14 days between consecutive entries)
    gaps = []
    for i in range(len(df) - 1):
        days_diff = (df.iloc[i+1]['collection_date'] - df.iloc[i]['collection_date']).days
        if days_diff > 14:  # More than 2 weeks gap
            gaps.append({
                'start_idx': i,
                'end_idx': i + 1,
                'start_date': df.iloc[i]['collection_date'],
                'end_date': df.iloc[i+1]['collection_date'],
                'weeks_missing': int(days_diff / 7)
            })
    
    def apply_monthly_xaxis(ax):
        ax.xaxis.set_major_locator(mdates.MonthLocator())
        ax.xaxis.set_major_formatter(mdates.DateFormatter('%b\n%Y'))
        ax.set_xlabel('')

    def setup_ax(ax):
        ax.set_xlabel('')
        ax.xaxis.set_major_locator(mdates.MonthLocator())
        ax.xaxis.set_major_formatter(mdates.DateFormatter('%b\n%Y'))

    if has_views_data:
        m_dates = monthly_df['collection_date'].values

        # CHART 1: Cumulative Views Trend
        ax1.plot_date(m_dates, monthly_df['cumulative_views_count'],
                 fmt='-o', linewidth=3, label='Total Views', color='darkgreen')
        ax1.fill_between(m_dates, monthly_df['cumulative_views_count'], alpha=0.3, color='lightgreen')
        ax1.plot_date(m_dates, monthly_df['cumulative_views_uniques'],
                 fmt='-s', linewidth=3, label='Total Unique Visitors', color='darkorange')
        ax1.fill_between(m_dates, monthly_df['cumulative_views_uniques'], alpha=0.3, color='moccasin')

        final_views_count = monthly_df['cumulative_views_count'].iloc[-1]
        final_views_uniques = monthly_df['cumulative_views_uniques'].iloc[-1]
        ax1.text(m_dates[-1], final_views_count, f'{int(final_views_count):,}',
                 ha='left', va='bottom', fontsize=9, fontweight='bold', color='darkgreen')
        ax1.text(m_dates[-1], final_views_uniques, f'{int(final_views_uniques):,}',
                 ha='left', va='bottom', fontsize=9, fontweight='bold', color='darkorange')

        ax1.set_ylabel('Cumulative Views')
        setup_ax(ax1)
        ax1.legend(loc='upper left', fontsize=12)
        ax1.set_title('Visitor Trends - Cumulative', fontsize=12, fontweight='bold')
        ax1.set_facecolor('#f8f9fa')
        ax1.grid(True, color='#e0e0e0', linestyle='-', linewidth=0.5, alpha=0.7)

        # CHART 2: Monthly Views Activity
        m_dates = monthly_df['collection_date'].values
        ax2.plot_date(m_dates, monthly_df['views_count'], fmt='-o', linewidth=3, label='Monthly Views', color='limegreen')
        ax2.fill_between(m_dates, monthly_df['views_count'], alpha=0.3, color='limegreen')
        ax2.plot_date(m_dates, monthly_df['views_uniques'], fmt='-s', linewidth=3, label='Monthly Unique Visitors', color='orange')
        ax2.fill_between(m_dates, monthly_df['views_uniques'], alpha=0.3, color='moccasin')

        ax2.set_ylabel('Monthly Views')
        setup_ax(ax2)
        ax2.legend(loc='upper left', fontsize=12)
        ax2.set_title('Visitor Trends - Monthly Activity', fontsize=12, fontweight='bold')
        ax2.set_facecolor('#f8f9fa')
        ax2.grid(True, color='#e0e0e0', linestyle='-', linewidth=0.5, alpha=0.7)

        # CHART 3: Cumulative Clones Trend
        ax3.plot_date(m_dates, monthly_df['cumulative_clones_count'],
                 fmt='-o', linewidth=3, label='Total Clones', color='darkblue')
        ax3.fill_between(m_dates, monthly_df['cumulative_clones_count'], alpha=0.3, color='lightblue')
        ax3.plot_date(m_dates, monthly_df['cumulative_clones_uniques'],
                 fmt='-s', linewidth=3, label='Total Unique Cloners', color='darkred')
        ax3.fill_between(m_dates, monthly_df['cumulative_clones_uniques'], alpha=0.3, color='lightcoral')

        final_clones_count = monthly_df['cumulative_clones_count'].iloc[-1]
        final_clones_uniques = monthly_df['cumulative_clones_uniques'].iloc[-1]
        ax3.text(m_dates[-1], final_clones_count, f'{int(final_clones_count):,}',
                 ha='left', va='bottom', fontsize=9, fontweight='bold', color='darkblue')
        ax3.text(m_dates[-1], final_clones_uniques, f'{int(final_clones_uniques):,}',
                 ha='left', va='bottom', fontsize=9, fontweight='bold', color='darkred')

        ax3.set_ylabel('Cumulative Clones')
        setup_ax(ax3)
        ax3.legend(loc='upper left', fontsize=12)
        ax3.set_title('Clone Trends - Cumulative', fontsize=12, fontweight='bold')
        ax3.set_facecolor('#f8f9fa')
        ax3.grid(True, color='#e0e0e0', linestyle='-', linewidth=0.5, alpha=0.7)

        # CHART 4: Monthly Clones Activity
        ax4.plot_date(m_dates, monthly_df['clones_count'], fmt='-o', linewidth=3, label='Monthly Clones', color='skyblue')
        ax4.fill_between(m_dates, monthly_df['clones_count'], alpha=0.3, color='skyblue')
        ax4.plot_date(m_dates, monthly_df['clones_uniques'], fmt='-s', linewidth=3, label='Monthly Unique Cloners', color='lightcoral')
        ax4.fill_between(m_dates, monthly_df['clones_uniques'], alpha=0.3, color='lightcoral')

        ax4.set_ylabel('Monthly Clones')
        setup_ax(ax4)
        ax4.legend(loc='upper left', fontsize=12)
        ax4.set_title('Clone Trends - Monthly Activity', fontsize=12, fontweight='bold')
        ax4.set_facecolor('#f8f9fa')
        ax4.grid(True, color='#e0e0e0', linestyle='-', linewidth=0.5, alpha=0.7)

        chart_title = "Repository Traffic Analysis - Views & Clones"
    else:
        # CHART 1: Cumulative Clones Trend (when no views data)
        m_dates = monthly_df['collection_date'].values
        ax1.plot_date(m_dates, monthly_df['cumulative_clones_count'],
                 fmt='-o', linewidth=3, label='Total Clones', color='darkblue')
        ax1.fill_between(m_dates, monthly_df['cumulative_clones_count'], alpha=0.3, color='lightblue')
        ax1.plot_date(m_dates, monthly_df['cumulative_clones_uniques'],
                 fmt='-s', linewidth=3, label='Total Unique Cloners', color='darkred')
        ax1.fill_between(m_dates, monthly_df['cumulative_clones_uniques'], alpha=0.3, color='lightcoral')

        final_clones_count = monthly_df['cumulative_clones_count'].iloc[-1]
        final_clones_uniques = monthly_df['cumulative_clones_uniques'].iloc[-1]
        ax1.text(m_dates[-1], final_clones_count, f'{int(final_clones_count):,}',
                 ha='left', va='bottom', fontsize=9, fontweight='bold', color='darkblue')
        ax1.text(m_dates[-1], final_clones_uniques, f'{int(final_clones_uniques):,}',
                 ha='left', va='bottom', fontsize=9, fontweight='bold', color='darkred')

        ax1.set_ylabel('Cumulative Count')
        setup_ax(ax1)
        ax1.legend(loc='upper left', fontsize=12)
        ax1.set_title('Clone Trends - Cumulative', fontsize=12, fontweight='bold')
        ax1.set_facecolor('#f8f9fa')
        ax1.grid(True, color='#e0e0e0', linestyle='-', linewidth=0.5, alpha=0.7)

        # CHART 2: Monthly Clones Activity
        m_dates = monthly_df['collection_date'].values
        ax2.plot_date(m_dates, monthly_df['clones_count'], fmt='-o', linewidth=3, label='Monthly Clones', color='skyblue')
        ax2.fill_between(m_dates, monthly_df['clones_count'], alpha=0.3, color='skyblue')
        ax2.plot_date(m_dates, monthly_df['clones_uniques'], fmt='-s', linewidth=3, label='Monthly Unique Cloners', color='lightcoral')
        ax2.fill_between(m_dates, monthly_df['clones_uniques'], alpha=0.3, color='lightcoral')

        ax2.set_ylabel('Monthly Clones')
        setup_ax(ax2)
        ax2.legend(loc='upper left', fontsize=12)
        ax2.set_title('Clone Trends - Monthly Activity', fontsize=12, fontweight='bold')
        ax2.set_facecolor('#f8f9fa')
        ax2.grid(True, color='#e0e0e0', linestyle='-', linewidth=0.5, alpha=0.7)

        chart_title = "Repository Traffic Analysis - Clones Only"
    
    plt.suptitle(chart_title, fontsize=14, fontweight='bold', y=0.995)
    plt.tight_layout()
    
    # Save trend analysis
    trend_file = "traffic_trends_analysis.png"
    plt.savefig(trend_file, dpi=300, bbox_inches='tight')
    print(f"📈 Traffic analysis saved as: {trend_file}")
    
    # Report detected gaps
    if gaps:
        print(f"\n⚠️  Detected {len(gaps)} data gap(s):")
        for gap in gaps:
            print(f"   • {gap['start_date'].strftime('%Y-%m-%d')} to {gap['end_date'].strftime('%Y-%m-%d')} "
                  f"({gap['weeks_missing']} weeks missing)")
    
    # Close the figure to prevent blocking (file already saved)
    plt.close()

def print_summary_statistics(df):
    """Print comprehensive summary statistics for both views and clones"""
    
    has_views_data = df['views_count'].sum() > 0
    
    print("\n" + "="*60)
    print("📈 REPOSITORY TRAFFIC SUMMARY STATISTICS")
    print("="*60)
    
    print(f"\n🗓️  TIMEFRAME:")
    print(f"   • Start Date: {df['collection_date'].min().strftime('%B %d, %Y')}")
    print(f"   • End Date: {df['collection_date'].max().strftime('%B %d, %Y')}")
    print(f"   • Total Weeks: {len(df)}")
    
    if has_views_data:
        print(f"\n👁️  VISITOR (VIEWS) STATISTICS:")
        print(f"   • Total Views (All Time): {df['cumulative_views_count'].iloc[-1]:,}")
        print(f"   • Total Unique Visitors: {df['cumulative_views_uniques'].iloc[-1]:,}")
        print(f"   • Average Views per Week: {df['views_count'].mean():.1f}")
        peak_views_idx = df['views_count'].idxmax()
        print(f"   • Peak Weekly Views: {df['views_count'].max()} (Week of {df.loc[peak_views_idx, 'collection_date'].strftime('%m/%d/%Y')})")
        if df['cumulative_views_count'].iloc[-1] > 0:
            print(f"   • Unique vs Total Views Ratio: {(df['cumulative_views_uniques'].iloc[-1] / df['cumulative_views_count'].iloc[-1] * 100):.1f}%")
        print(f"   • Recent Activity: {df['views_count'].tail(3).sum()} views in last 3 weeks")
    
    print(f"\n📦 CLONE STATISTICS:")
    print(f"   • Total Clones (All Time): {df['cumulative_clones_count'].iloc[-1]:,}")
    print(f"   • Total Unique Cloners: {df['cumulative_clones_uniques'].iloc[-1]:,}")
    print(f"   • Average Clones per Week: {df['clones_count'].mean():.1f}")
    peak_clones_idx = df['clones_count'].idxmax()
    print(f"   • Peak Weekly Clones: {df['clones_count'].max()} (Week of {df.loc[peak_clones_idx, 'collection_date'].strftime('%m/%d/%Y')})")
    if df['cumulative_clones_count'].iloc[-1] > 0:
        print(f"   • Unique vs Total Clone Ratio: {(df['cumulative_clones_uniques'].iloc[-1] / df['cumulative_clones_count'].iloc[-1] * 100):.1f}%")
    print(f"   • Recent Activity: {df['clones_count'].tail(3).sum()} clones in last 3 weeks")
    
    if has_views_data:
        print(f"\n🎯 COMPARATIVE METRICS:")
        # Calculate conversion rate (clones / views)
        if df['cumulative_views_count'].iloc[-1] > 0:
            conversion_rate = (df['cumulative_clones_count'].iloc[-1] / df['cumulative_views_count'].iloc[-1] * 100)
            print(f"   • Clone-to-View Ratio: {conversion_rate:.1f}% (clones per 100 views)")
        # Recent comparison
        recent_views = df['views_count'].tail(3).sum()
        recent_clones = df['clones_count'].tail(3).sum()
        if recent_views > 0:
            recent_conversion = (recent_clones / recent_views * 100)
            print(f"   • Recent 3-Week Conversion: {recent_conversion:.1f}%")
        print(f"   • Most Active Week (Views): {df['collection_date'][df['views_count'].idxmax()].strftime('%B %d, %Y')}")
    else:
        print(f"\n🎯 ENGAGEMENT METRICS:")
        print(f"   • Most Active Week (Clones): {df['collection_date'][df['clones_count'].idxmax()].strftime('%B %d, %Y')}")
    
    print("="*60)

def main():
    """Main analysis function"""
    
    print("🚀 Starting EBP Dashboard Traffic Analysis...")
    print("="*60)
    
    # Load data
    df, monthly_df = load_and_prepare_data()
    
    if df is None:
        return
    
    # Print data overview
    print("\n📋 DATA OVERVIEW:")
    has_views_data = df['views_count'].sum() > 0
    if has_views_data:
        print(df[['week', 'collection_date', 'views_count', 'views_uniques', 
                  'clones_count', 'clones_uniques']].to_string(index=False))
    else:
        print(df[['week', 'collection_date', 'clones_count', 'clones_uniques']].to_string(index=False))
    
    # Create visualizations
    print("\n📈 Creating trend analysis...")
    create_trend_analysis(df, monthly_df)
    
    # Print summary statistics
    print_summary_statistics(df)
    
    print("\n✅ Analysis complete! Check traffic_trends_analysis.png for visualization.")

if __name__ == "__main__":
    main()
