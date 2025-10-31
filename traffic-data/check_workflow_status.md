# How to Check and Trigger the Workflow

## Repository

The GitHub Actions workflow runs on the **EarthBiogenome/dashboard** repository.  
Your local repository is connected to this as the `ebp` remote.

### Step 1: Check Recent Workflow Runs

Go to: **https://github.com/EarthBiogenome/dashboard/actions**

Look for the workflow named **"Collect Repository Traffic Data"**

Check:
- ✅ When was the last run?
- ✅ Did it succeed (green checkmark) or fail (red X)?
- ✅ Click on the latest run to see logs

### Step 2: Manually Trigger the Workflow

1. Go to: **https://github.com/EarthBiogenome/dashboard/actions/workflows/traffic-collector.yml**
2. You should see a **"Run workflow"** button on the right side (above the workflow runs list)
3. Click **"Run workflow"**
4. In the dropdown, select branch: **ebp-main**
5. Click the green **"Run workflow"** button

**Note:** If you don't see the "Run workflow" button, you may not have write permissions to the EarthBiogenome/dashboard repository.

### Step 3: Monitor the Run

1. Refresh the page after clicking "Run workflow"
2. A new workflow run should appear at the top with a yellow dot (running)
3. Click on it to watch the progress
4. Each step should show:
   - ✓ Checkout repository
   - ✓ Setup Python
   - ✓ Run traffic data collection
   - ✓ Check for changes and commit
   - ✓ Push changes
   - ✓ Summary

### Step 4: Check the Summary

After the workflow completes:
1. Click on the workflow run
2. Scroll down to see the "Summary" section
3. It should show:
   - Latest entry from weekly_summary.csv
   - Push status
   - Collection schedule

### Step 5: Pull the New Data

If the workflow succeeded:
```powershell
cd "C:\Users\fchen13\ASU Dropbox\Fang Chen\Work Documents\EBP\Dashboard reports"
git pull
cd traffic-data
python run_analysis.py
```

## Troubleshooting

### If You Don't Have Access to Trigger Workflows

You may need to ask the repository owner/admin to:
1. Manually trigger the workflow for you, OR
2. Grant you the necessary permissions

### If the Workflow Fails

Check the error logs in the failed step. Common issues:
- ❌ **TRAFFIC_TOKEN expired or invalid** - Ask admin to regenerate
- ❌ **Permission denied on push** - Token needs `repo` scope
- ❌ **API rate limit** - Wait 1 hour and try again

### Expected Data Recovery

Since today is **October 31, 2025** and the last data is from **September 2, 2025**:
- ⚠️ **Lost**: Data from Sept 3 - Oct 17 (outside GitHub's 14-day window)
- ✅ **Recoverable**: Last ~2 weeks (Oct 18-31, 2025)

The workflow will collect whatever is available in GitHub's 14-day rolling window.

## What You Should See After Success

In `weekly_summary.csv`, you should see new entries like:
```csv
2025-W43,10/21/2025,XX,XX,XX,XX,2025-10-31T...
2025-W44,10/28/2025,XX,XX,XX,XX,2025-10-31T...
```

(Actual week numbers depend on when the workflow runs)

---

**Next Steps:**
1. Go to the GitHub Actions page for EarthBiogenome/dashboard
2. Check recent workflow runs
3. Manually trigger if needed
4. Check logs for any errors
5. Report back what you see

