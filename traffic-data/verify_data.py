#!/usr/bin/env python3
"""
Simple data verification script without emojis for PowerShell compatibility
"""

import pandas as pd
from pathlib import Path

def main():
    csv_file = Path("weekly_summary.csv")
    
    if not csv_file.exists():
        print("ERROR: Could not find weekly_summary.csv")
        return
    
    # Load data with mixed date format support
    df = pd.read_csv(csv_file)
    df['collection_date'] = pd.to_datetime(df['collection_date'], format='mixed', dayfirst=False)
    df = df.sort_values('collection_date')
    
    print("=" * 70)
    print("TRAFFIC DATA VERIFICATION")
    print("=" * 70)
    print(f"\nTotal weeks collected: {len(df)}")
    print(f"Date range: {df['collection_date'].min().strftime('%Y-%m-%d')} to {df['collection_date'].max().strftime('%Y-%m-%d')}")
    print("\nAll entries:")
    print("-" * 70)
    
    for idx, row in df.iterrows():
        print(f"{row['week']} | {row['collection_date'].strftime('%Y-%m-%d')} | "
              f"Views: {row['views_count']:3d} ({row['views_uniques']:2d} unique) | "
              f"Clones: {row['clones_count']:3d} ({row['clones_uniques']:2d} unique)")
    
    print("-" * 70)
    print(f"\nTotal clones: {df['clones_count'].sum()}")
    print(f"Total unique cloners: {df['clones_uniques'].sum()}")
    print(f"Total views: {df['views_count'].sum()}")
    print(f"Total unique viewers: {df['views_uniques'].sum()}")
    print("\nSUCCESS: Data loaded and parsed correctly!")
    print("=" * 70)

if __name__ == "__main__":
    main()

