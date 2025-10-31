# Traffic Data Collection Recovery Plan
**Issue Date:** October 31, 2025  
**Last Valid Data:** August 25, 2025 (Week 2025-W35)  
**Missing Weeks:** ~9-10 weeks (Sept 7 - Oct 31, 2025)

---

## 🔍 Problem Identified

### What Happened
The GitHub Actions workflow **"Collect Repository Traffic Data"** has been running successfully every week since September 7, 2025, BUT:
- ❌ Changes were **not being pushed back** to the `ebp-main` branch
- ❌ The workflow was using `${{ github.ref }}` instead of explicitly pushing to `ebp-main`
- ❌ The push action (`ad-m/github-push-action@master`) may have been failing silently

### Data Loss Assessment
⚠️ **CRITICAL:** GitHub only retains **14 days** of traffic data. Since collection ran but didn't save:
- **Lost Forever:** Weeks W36-W42 (Sept 1 - Oct 17, 2025) - approximately 7-8 weeks
- **Recoverable:** Last ~2 weeks (Oct 18-31, 2025) - still within GitHub's 14-day window

---

## ✅ Fixes Applied

### Workflow Changes Made
1. **Explicit Branch Checkout:** Added `ref: ebp-main` to checkout step
2. **Explicit Push Command:** Replaced generic action with `git push origin ebp-main`
3. **Better Error Detection:** Added conditional checks and error messages
4. **Enhanced Logging:** Added branch verification and push status checks
5. **Improved Summary:** Shows push status and warns about collection issues

### Modified File
- `.github/workflows/traffic-collector.yml`

---

## 🚀 Recovery Steps

### Step 1: Commit and Push Workflow Fix
```powershell
# From the repository root
git add .github/workflows/traffic-collector.yml
git commit -m "🔧 Fix traffic data collection push to ebp-main"
git push origin ebp-main
```

### Step 2: Manually Trigger Workflow to Recover Last 2 Weeks
1. Go to: **GitHub Repository → Actions → "Collect Repository Traffic Data"**
2. Click **"Run workflow"** button (top right)
3. Ensure branch is set to `ebp-main`
4. Click **"Run workflow"**

### Step 3: Monitor the Workflow Run
1. Watch the workflow execution in real-time
2. Check the **Summary** section for:
   - ✅ Data collection success
   - ✅ Commit created
   - ✅ Push to ebp-main successful
3. Look for any error messages in the logs

### Step 4: Verify Data Updated Locally
```powershell
cd "C:\Users\fchen13\ASU Dropbox\Fang Chen\Work Documents\EBP\Dashboard reports"
git pull origin ebp-main

# Check the latest data entry
cd traffic-data
Get-Content weekly_summary.csv | Select-Object -Last 1
```

Expected output should show data from October 2025.

### Step 5: Run Analysis
```powershell
# Make sure you're in the traffic-data directory
python run_analysis.py
```

---

## 🔍 Verification Checklist

After recovery, verify:
- [ ] Workflow runs without errors
- [ ] New entries appear in `weekly_summary.csv`
- [ ] JSON files are created (e.g., `traffic-2025-W43.json`)
- [ ] Changes are committed to `ebp-main` branch
- [ ] Analysis script shows updated data through October
- [ ] Next scheduled run (Monday 2:00 AM UTC) works automatically

---

## 📊 What to Expect

### Recovered Data
- ✅ **Current week** (W44: Oct 28 - Nov 3, 2025)
- ✅ **Previous week** (W43: Oct 21-27, 2025)
- *Possibly W42 if within 14-day window*

### Data Gap
Between August 25 and October 18, 2025:
- 📉 This gap **cannot be recovered** (GitHub's 14-day limit)
- 📊 Analysis charts will show a discontinuity
- ℹ️ Consider adding a note in reports explaining the gap

### Future Protection
- ✅ Workflow now explicitly pushes to `ebp-main`
- ✅ Better error detection and logging
- ✅ Summary report shows push status
- ✅ `if: always()` ensures summary runs even if steps fail

---

## 🆘 Troubleshooting

### If Manual Trigger Fails

**Check TRAFFIC_TOKEN Permissions:**
1. Go to: **Settings → Secrets and variables → Actions**
2. Verify `TRAFFIC_TOKEN` exists
3. Token should have `repo` and `workflow` scopes

**Check Actions Are Enabled:**
1. Go to: **Settings → Actions → General**
2. Ensure "Allow all actions and reusable workflows" is selected

### If Push Still Fails

**Token might lack permissions:**
```yaml
# The token needs these scopes:
- repo (full control)
- workflow (update GitHub Action workflows)
```

**Branch protection rules:**
- Check if `ebp-main` has protection rules blocking the push
- GitHub Actions needs to be allowed to push

### If No Data Appears

**API Rate Limits:**
- GitHub API has rate limits
- Wait 1 hour and try again

**Token Expired:**
- Regenerate `TRAFFIC_TOKEN` with proper scopes
- Update secret in repository settings

---

## 📅 Ongoing Monitoring

### Weekly Checks (First 4 Weeks)
Every Monday after 2:30 AM UTC:
1. Check GitHub Actions tab for successful run
2. Verify new entry in `weekly_summary.csv`:
   ```powershell
   git pull origin ebp-main
   cd traffic-data
   Get-Content weekly_summary.csv | Select-Object -Last 1
   ```
3. Look for green checkmark ✅ next to workflow run

### Monthly Analysis
Run the analysis script monthly:
```powershell
cd traffic-data
python analyze_traffic_data.py
```

Review trends and ensure continuous data collection.

---

## 📞 Support

If issues persist after applying fixes:
1. Check GitHub Actions run logs for specific error messages
2. Verify `TRAFFIC_TOKEN` hasn't expired
3. Confirm repository permissions for GitHub Actions
4. Check if there are any branch protection rules blocking automated commits

---

## 📋 Summary

**Fixed:**
- ✅ Workflow now explicitly uses `ebp-main` branch
- ✅ Push command updated for reliability
- ✅ Better error detection and logging

**Action Required:**
1. Commit and push the workflow fix
2. Manually trigger workflow to recover last 2 weeks
3. Verify data is updated
4. Monitor next scheduled run

**Expected Outcome:**
- Data from last 2 weeks recovered
- Automatic weekly collection resumes
- No further manual intervention needed

---

*Last Updated: October 31, 2025*

