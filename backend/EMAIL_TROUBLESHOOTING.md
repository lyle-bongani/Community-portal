# Email Troubleshooting Guide

If emails show as "sent" in logs but aren't arriving, follow these steps:

## Step 1: Check Render Logs

After deploying, check your Render logs for:

1. **On Startup:**
   ```
   📧 Email service: CONFIGURED (SMTP enabled)
   ✅ SMTP connection verified successfully
   ```
   
   If you see `❌ SMTP connection verification failed`, your credentials are wrong.

2. **When Sending Email:**
   ```
   ✅ Email accepted by SMTP server
   📧 Message ID: <...>
   📧 Response: 250 2.0.0 OK ...
   ```

## Step 2: Common Issues

### Issue 1: Authentication Failed (EAUTH)

**Symptoms:** Logs show `❌ Authentication failed!`

**Solutions:**
- ✅ Verify `SMTP_USER` = `communityportal2026@gmail.com` (exact match)
- ✅ Verify `SMTP_PASS` = your 16-character App Password (no spaces)
- ✅ Make sure you're using **App Password**, not your regular Gmail password
- ✅ Ensure 2-Factor Authentication is enabled on Gmail
- ✅ Generate a new App Password if needed: https://myaccount.google.com/apppasswords

### Issue 2: Connection Failed (ECONNECTION)

**Symptoms:** Logs show `❌ Connection failed!`

**Solutions:**
- ✅ Verify `SMTP_HOST` = `smtp.gmail.com` (exact)
- ✅ Verify `SMTP_PORT` = `587` (not 465)
- ✅ Verify `SMTP_SECURE` = `false` (for port 587)
- ✅ Check Render's network/firewall allows SMTP connections

### Issue 3: Email Accepted But Not Arriving

**Symptoms:** Logs show `✅ Email accepted by SMTP server` but no email received

**Possible Causes:**

1. **Gmail Spam Filter**
   - Check recipient's **Spam/Junk folder**
   - Gmail may delay emails from new senders
   - Wait 5-10 minutes for delivery

2. **Gmail Rate Limiting**
   - Gmail limits: ~500 emails/day for free accounts
   - If sending many emails, they may be delayed
   - Check Gmail account for warnings

3. **Recipient Email Issues**
   - Verify recipient email address is correct
   - Check if recipient's inbox is full
   - Some email providers block automated emails

4. **Gmail Security Settings**
   - Gmail may block emails if:
     - App password is expired/revoked
     - Account has "Less secure app access" restrictions
     - Account is flagged for suspicious activity

## Step 3: Verify Environment Variables in Render

Go to Render Dashboard → Your Service → Environment tab, verify:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=communityportal2026@gmail.com
SMTP_PASS=frrtfodmxdwcoulm
SMTP_FROM=Community Portal <communityportal2026@gmail.com>
```

**Important:**
- No spaces in `SMTP_PASS`
- No quotes around values
- Exact spelling/capitalization

## Step 4: Test Email Sending

After fixing issues:

1. **Redeploy** your Render service
2. **Check startup logs** for SMTP verification
3. **Register for an event** or register a new user
4. **Check Render logs** for email sending details
5. **Check recipient inbox AND spam folder**

## Step 5: Gmail-Specific Checks

### Check Gmail Account Status

1. Go to: https://myaccount.google.com/security
2. Check for any security alerts
3. Verify 2-Step Verification is enabled
4. Check App Passwords: https://myaccount.google.com/apppasswords
   - Ensure the app password is still active
   - If revoked, generate a new one

### Gmail Sending Limits

- **Free Gmail:** 500 emails/day
- **Google Workspace:** 2000 emails/day
- If you hit the limit, emails will be delayed

### Check Gmail Activity

1. Go to: https://myaccount.google.com/security
2. Click "Recent security activity"
3. Look for any blocked sign-in attempts
4. If you see blocked attempts, Gmail may be blocking your emails

## Step 6: Alternative Solutions

If Gmail continues to have issues:

### Option A: Use a Different Email Provider

**SendGrid (Free tier: 100 emails/day)**
```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

**Mailgun (Free tier: 5,000 emails/month)**
```
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-mailgun-username
SMTP_PASS=your-mailgun-password
```

### Option B: Use Gmail with OAuth2

For production, consider using Gmail OAuth2 instead of App Passwords for better reliability.

## Debugging Commands

Check Render logs for these patterns:

```bash
# Good signs:
✅ SMTP connection verified successfully
✅ Email accepted by SMTP server
📧 Message ID: <...>

# Bad signs:
❌ SMTP connection verification failed
❌ Authentication failed!
❌ Connection failed!
```

## Still Not Working?

1. **Check Render logs** - Look for detailed error messages
2. **Verify all environment variables** are set correctly
3. **Test with a different email provider** (SendGrid, Mailgun)
4. **Check recipient's email** - Try sending to a different email address
5. **Wait 10-15 minutes** - Gmail may delay delivery

## Quick Checklist

- [ ] SMTP credentials are correct in Render
- [ ] App Password is valid (not expired)
- [ ] 2-Factor Authentication is enabled
- [ ] SMTP connection verified on startup
- [ ] Checked recipient's spam folder
- [ ] Waited 10+ minutes for delivery
- [ ] Tried sending to a different email address
- [ ] Checked Gmail account for security alerts
