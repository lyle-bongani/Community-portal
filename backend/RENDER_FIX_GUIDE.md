# Render Server Fix Guide

## Issues Identified

### 1. Users Not Being Saved
**Problem**: Users register successfully but disappear after server restart.

**Root Cause**: Render's file system is **ephemeral** by default. Files written to disk are lost when:
- The service restarts
- A new deployment occurs
- The service is scaled down

**Solution**: Enable **Persistent Disk** on Render.

### 2. Emails Not Being Sent
**Problem**: Email notifications are not being sent.

**Root Cause**: SMTP environment variables are not configured on Render.

**Solution**: Add SMTP environment variables in Render's dashboard.

---

## Step-by-Step Fix

### Fix 1: Enable Persistent Disk Storage on Render

1. Go to your Render dashboard: https://dashboard.render.com
2. Select your backend service (`community-portal-9uek`)
3. Go to **Settings** tab
4. Scroll down to **Persistent Disk** section
5. Click **Enable Persistent Disk**
6. Set the mount path to: `/opt/render/project/src/data`
   - Or use: `./data` (relative to project root)
7. Set the size (1GB is usually enough for free tier)
8. Click **Save Changes**

**Important**: After enabling persistent disk:
- The data directory will persist across deployments
- You may need to redeploy the service
- The first deployment after enabling will start with an empty database

### Fix 2: Configure SMTP for Email Sending

1. Go to your Render dashboard
2. Select your backend service
3. Go to **Environment** tab
4. Add the following environment variables:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=Community Portal <noreply@communityportal.com>
```

**For Gmail**:
- Use an **App Password** (not your regular password)
- Enable 2-factor authentication first
- Generate app password: https://myaccount.google.com/apppasswords

**Alternative Email Providers**:
- **Outlook/Hotmail**: `smtp-mail.outlook.com`, port `587`
- **SendGrid**: Use their SMTP settings
- **Mailgun**: Use their SMTP settings

5. Click **Save Changes**
6. The service will automatically redeploy

---

## Verify the Fixes

### Check Data Persistence

1. Visit: `https://community-portal-9uek.onrender.com/health`
2. Look for the `database` section in the response
3. Verify:
   - `directoryExists: true`
   - `usersFileExists: true`
   - `usersFileWritable: true`
   - `writeTestPassed: true`

### Check Email Configuration

1. Check Render logs after a user registers
2. Look for one of these messages:
   - ✅ `📧 Email sent successfully` (SMTP configured correctly)
   - ⚠️ `SMTP NOT CONFIGURED - NOT SENT` (needs configuration)

### Test User Registration

1. Register a new user on the frontend
2. Check the backend logs in Render dashboard
3. Look for: `✅ User [email] saved successfully`
4. Restart the service (or wait for auto-restart)
5. Try to log in with the same credentials
6. If login works, data persistence is working! ✅

---

## Troubleshooting

### Users Still Not Saving

**Check 1**: Verify persistent disk is enabled
- Go to Render dashboard → Settings → Persistent Disk
- Should show "Enabled" with a mount path

**Check 2**: Check health endpoint
- Visit `/health` endpoint
- If `writeTestPassed: false`, there's a permissions issue

**Check 3**: Check logs
- Look for `❌ CRITICAL: Error saving users` in logs
- Check for file permission errors

**Solution**: 
- Ensure persistent disk mount path is correct
- Check that the `data` directory path matches in logs
- Contact Render support if issues persist

### Emails Still Not Sending

**Check 1**: Verify environment variables
- Go to Render dashboard → Environment tab
- Ensure all SMTP variables are set (no typos)

**Check 2**: Test SMTP credentials
- Try sending a test email from your email client
- Verify app password is correct (for Gmail)

**Check 3**: Check logs
- Look for SMTP connection errors
- Check firewall/network restrictions

**Solution**:
- Double-check SMTP credentials
- Try a different email provider
- Check Render logs for specific error messages

---

## Important Notes

1. **Free Tier Limitation**: Render's free tier may have limited persistent disk storage. Consider upgrading if you need more storage.

2. **Data Backup**: Even with persistent disk, regularly backup your data:
   - Use the export script: `npm run export-users`
   - Store backups in a safe location

3. **Alternative Solutions**: For production, consider:
   - Using a real database (PostgreSQL, MongoDB)
   - Using a cloud storage service (AWS S3, Google Cloud Storage)
   - Using a database-as-a-service (Supabase, MongoDB Atlas)

---

## Quick Checklist

- [ ] Persistent disk enabled on Render
- [ ] Mount path configured correctly
- [ ] SMTP_HOST environment variable set
- [ ] SMTP_USER environment variable set
- [ ] SMTP_PASS environment variable set (app password for Gmail)
- [ ] SMTP_PORT environment variable set (587 for TLS)
- [ ] SMTP_SECURE environment variable set (false for TLS)
- [ ] Service redeployed after changes
- [ ] Health endpoint shows `writeTestPassed: true`
- [ ] Test user registration works
- [ ] Test email sending works

---

## Need Help?

If issues persist:
1. Check Render logs for specific error messages
2. Verify all environment variables are set correctly
3. Test the health endpoint: `/health`
4. Check that persistent disk is actually enabled and mounted
5. Contact Render support if persistent disk issues continue
