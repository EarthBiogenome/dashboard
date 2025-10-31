#!/usr/bin/env python3
"""
Traffic Data Analysis and Visualization for EBP Dashboard Repository
Focuses on clone metrics with both actual weekly and cumulative views
"""

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
import numpy as np
from pathlib import Path

def load_and_prepare_data():
    """Load traffic data and prepare for analysis"""
    
    csv_file = Path("weekly_summary.csv")
    
    if not csv_file.exists():
        print(f"❌ Could not find {csv_file}")
        return None
    
    # Load data
    df = pd.read_csv(csv_file)
    
    # Convert date column to datetime (handle mixed formats)
    df['collection_date'] = pd.to_datetime(df['collection_date'], format='mixed', dayfirst=False)
    
    # Sort by date to ensure proper chronological order
    df = df.sort_values('collection_date')
    
    # Calculate cumulative totals
    df['cumulative_clones_count'] = df['clones_count'].cumsum()
    df['cumulative_clones_uniques'] = df['clones_uniques'].cumsum()
    
    # Create readable date labels
    df['week_label'] = df['collection_date'].dt.strftime('%m/%d')
    df['month_year'] = df['collection_date'].dt.strftime('%b %Y')
    
    print(f"✅ Loaded {len(df)} weeks of traffic data")
    print(f"📅 Date range: {df['collection_date'].min().strftime('%Y-%m-%d')} to {df['collection_date'].max().strftime('%Y-%m-%d')}")
    
    return df


def create_trend_analysis(df):
    """Create clone traffic trend analysis visualization"""
    
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(8, 6))
    
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
    
    # Combined weekly view
    x_pos = np.arange(len(df))
    width = 0.35
    
    bars1 = ax1.bar(x_pos - width/2, df['clones_count'], width, 
                    label='Weekly Clones', color='skyblue', alpha=0.8)
    bars2 = ax1.bar(x_pos + width/2, df['clones_uniques'], width,
                    label='Weekly Unique Cloners', color='lightcoral', alpha=0.8)
    
    # Add gap indicators to first chart
    for gap in gaps:
        gap_center = (gap['start_idx'] + gap['end_idx']) / 2
        ax1.axvline(x=gap_center, color='red', linestyle='--', alpha=0.5, linewidth=2)
        ax1.text(gap_center, ax1.get_ylim()[1] * 0.9, 
                f"Gap: {gap['weeks_missing']} weeks\nmissing", 
                ha='center', va='top', fontsize=8, style='italic',
                bbox=dict(boxstyle='round,pad=0.5', facecolor='yellow', alpha=0.7))
    
    ax1.set_xlabel('Week (Month/Day)')
    ax1.set_ylabel('Activity Count')
    ax1.set_xticks(x_pos)
    ax1.set_xticklabels(df['week_label'], rotation=45)
    ax1.legend()
    ax1.set_facecolor('#f8f9fa')
    ax1.grid(True, color='#e0e0e0', linestyle='-', linewidth=0.5, alpha=0.7)
    
    # Cumulative trend comparison
    ax2.plot(df['week_label'], df['cumulative_clones_count'], 
             marker='o', linewidth=3, label='Total Clones', color='darkblue')
    ax2.fill_between(df['week_label'], df['cumulative_clones_count'], alpha=0.3, color='lightblue')
    ax2.plot(df['week_label'], df['cumulative_clones_uniques'], 
             marker='s', linewidth=3, label='Total Unique Cloners', color='darkred')
    ax2.fill_between(df['week_label'], df['cumulative_clones_uniques'], alpha=0.3, color='lightcoral')
    
    # Add gap indicators to second chart
    for gap in gaps:
        gap_center = (gap['start_idx'] + gap['end_idx']) / 2
        ax2.axvline(x=gap_center, color='red', linestyle='--', alpha=0.5, linewidth=2)
    
    ax2.set_xlabel('Week (Month/Day)')
    ax2.set_ylabel('Cumulative Count')
    ax2.legend()
    ax2.set_facecolor('#f8f9fa')
    ax2.grid(True, color='#e0e0e0', linestyle='-', linewidth=0.5, alpha=0.7)
    plt.xticks(rotation=45)
    
    plt.tight_layout()
    
    # Save trend analysis
    trend_file = "traffic_trends_analysis.png"
    plt.savefig(trend_file, dpi=300, bbox_inches='tight')
    print(f"📈 Clone traffic analysis saved as: {trend_file}")
    
    # Report detected gaps
    if gaps:
        print(f"\n⚠️  Detected {len(gaps)} data gap(s):")
        for gap in gaps:
            print(f"   • {gap['start_date'].strftime('%Y-%m-%d')} to {gap['end_date'].strftime('%Y-%m-%d')} "
                  f"({gap['weeks_missing']} weeks missing)")
    
    plt.show()

def print_summary_statistics(df):
    """Print summary statistics"""
    
    print("\n" + "="*60)
    print("📈 CLONE TRAFFIC SUMMARY STATISTICS")
    print("="*60)
    
    print(f"\n🗓️  TIMEFRAME:")
    print(f"   • Start Date: {df['collection_date'].min().strftime('%B %d, %Y')}")
    print(f"   • End Date: {df['collection_date'].max().strftime('%B %d, %Y')}")
    print(f"   • Total Weeks: {len(df)}")
    
    print(f"\n📊 CLONE STATISTICS:")
    print(f"   • Total Clones (All Time): {df['cumulative_clones_count'].iloc[-1]:,}")
    print(f"   • Total Unique Cloners: {df['cumulative_clones_uniques'].iloc[-1]:,}")
    print(f"   • Average Clones per Week: {df['clones_count'].mean():.1f}")
    print(f"   • Peak Weekly Clones: {df['clones_count'].max()} (Week of {df.loc[df['clones_count'].idxmax(), 'collection_date'].strftime('%m/%d/%Y')})")
    
    print(f"\n🎯 ENGAGEMENT METRICS:")
    print(f"   • Unique vs Total Clone Ratio: {(df['cumulative_clones_uniques'].iloc[-1] / df['cumulative_clones_count'].iloc[-1] * 100):.1f}%")
    print(f"   • Most Active Week: {df['collection_date'][df['clones_count'].idxmax()].strftime('%B %d, %Y')}")
    print(f"   • Recent Activity: {df['clones_count'].tail(3).sum()} clones in last 3 weeks")
    
    print("="*60)

def main():
    """Main analysis function"""
    
    print("🚀 Starting EBP Dashboard Clone Traffic Analysis...")
    print("="*60)
    
    # Load data
    df = load_and_prepare_data()
    
    if df is None:
        return
    
    # Print data overview
    print("\n📋 DATA OVERVIEW:")
    print(df[['week', 'collection_date', 'clones_count', 'clones_uniques', 
              'cumulative_clones_count', 'cumulative_clones_uniques']].to_string(index=False))
    
    # Create visualizations
    print("\n📈 Creating trend analysis...")
    create_trend_analysis(df)
    
    # Print summary statistics
    print_summary_statistics(df)
    
    print("\n✅ Analysis complete! Check traffic_trends_analysis.png for visualization.")

if __name__ == "__main__":
    main()
