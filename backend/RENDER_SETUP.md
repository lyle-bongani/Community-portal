# Render Deployment Setup Guide

This guide explains how to configure your Render deployment to ensure data persistence and email functionality.

## ⚠️ Important: Data Persistence on Render

**Render's filesystem is ephemeral** - files written to the default `data/` directory will be **lost on every deploy or restart**. 

### Solution 1: Use Render Persistent Disk (Recommended)

1. **In Render Dashboard:**
   - Go to your service settings
   - Scroll to "Persistent Disk" section
   - Click "Add Persistent Disk"
   - Set mount path: `/persistent`
   - Set size: 1GB (minimum)

2. **Set Environment Variable:**
   - Go to "Environment" tab in Render
   - Add new environment variable:
     - Key: `DATA_DIR`
     - Value: `/persistent/data`

3. **Redeploy** your service

### Solution 2: Use Environment Variable for Custom Path

If you can't use persistent disk, you can set `DATA_DIR` to any path, but **data will still be lost on deploys**. This is only useful for testing.

## 📧 Email Configuration

To enable email sending on Render, you need to configure SMTP settings:

### Step 1: Get SMTP Credentials

**Option A: Gmail (Recommended for testing)**
1. Enable 2-Factor Authentication on your Gmail account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Create an app password for "Mail"
4. Copy the 16-character password

**Option B: Other Email Providers**
- Use your email provider's SMTP settings
- Common providers: Outlook, Yahoo, SendGrid, Mailgun, etc.

### Step 2: Set Environment Variables in Render

Go to your Render service → Environment tab → Add these variables:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
SMTP_FROM=Community Portal <noreply@communityportal.com>
```

**Important:** 
- For Gmail, use the **App Password** (16 characters), not your regular password
- Never commit these credentials to Git
- Use Render's environment variables (secure)

### Step 3: Verify Email Configuration

After setting the environment variables:
1. **Redeploy** your service
2. Check the logs on startup - you should see:
   ```
   📧 Email service: CONFIGURED (SMTP enabled)
   ```
3. If you see "NOT CONFIGURED", check that all SMTP variables are set correctly

## 🔍 Troubleshooting

### Users Not Being Saved

**Symptoms:** Users register successfully but can't log in later

**Causes:**
1. **Ephemeral filesystem** - Data directory is being wiped
2. **Wrong DATA_DIR path** - Path doesn't exist or isn't writable
3. **Permission issues** - Server can't write to the directory

**Solutions:**
1. ✅ Use Render Persistent Disk (see Solution 1 above)
2. ✅ Check server logs for "Successfully saved X users" messages
3. ✅ Verify `DATA_DIR` environment variable is set correctly
4. ✅ Check Render logs for file write errors

### Emails Not Sending

**Symptoms:** Registration works but no email is received

**Causes:**
1. **SMTP not configured** - Environment variables missing
2. **Wrong credentials** - Invalid SMTP username/password
3. **Firewall/Network** - Render can't connect to SMTP server

**Solutions:**
1. ✅ Check Render logs for email errors
2. ✅ Verify all SMTP environment variables are set
3. ✅ For Gmail, ensure you're using App Password, not regular password
4. ✅ Test SMTP connection from Render logs
5. ✅ Check if your email provider blocks automated emails

### Check Server Logs

In Render Dashboard:
1. Go to your service
2. Click "Logs" tab
3. Look for:
   - `📁 Database directory: /path/to/data`
   - `✅ Successfully saved X users`
   - `📧 Email service: CONFIGURED` or `NOT CONFIGURED`
   - Any error messages

## 📋 Quick Checklist

Before deploying to Render, ensure:

- [ ] Persistent disk is mounted (if using Solution 1)
- [ ] `DATA_DIR` environment variable is set (if using persistent disk)
- [ ] `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` are set (for emails)
- [ ] `CORS_ORIGIN` is set to your Vercel frontend URL
- [ ] `JWT_SECRET` is set to a secure random string
- [ ] `NODE_ENV=production` is set

## 🚀 After Deployment

1. **Test user registration:**
   - Register a new user
   - Check Render logs for "Successfully saved X users"
   - Try logging in with the new user

2. **Test email:**
   - Register a new user
   - Check your email inbox
   - Check Render logs for email sending status

3. **Verify data persistence:**
   - Register a user
   - Restart the service (or wait for auto-deploy)
   - Try logging in - user should still exist

## 💡 Alternative: Use a Database

For production, consider migrating to a real database:
- **MongoDB Atlas** (free tier available)
- **PostgreSQL** (Render offers managed PostgreSQL)
- **Supabase** (free tier available)

This provides better reliability and scalability than file-based storage.
