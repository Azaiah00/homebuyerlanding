# EmailJS Setup Guide

## Step 1: Sign Up for EmailJS
1. Go to https://www.emailjs.com
2. Sign up for a free account (free tier includes 200 emails/month)

## Step 2: Add Email Service

### Option A: Use Gmail (If you get authentication errors, use Option B or C instead)

**If you get "412 Gmail_API: Request had insufficient authentication scopes" error:**

1. Go to **Email Services** in the dashboard
2. Click **Add New Service**
3. Choose **Gmail**
4. When connecting, make sure to:
   - Grant ALL requested permissions
   - Use the same Google account that owns the Gmail address
   - If it still fails, try **Option B** or **Option C** below

### Option B: Use Gmail SMTP (Recommended - More Reliable)

1. Go to **Email Services** in the dashboard
2. Click **Add New Service**
3. Choose **Gmail** but select **SMTP** option instead of API
4. You'll need to:
   - Enable 2-factor authentication on your Gmail account
   - Generate an "App Password" (not your regular password):
     - Go to Google Account settings
     - Security → 2-Step Verification → App passwords
     - Generate a new app password for "Mail"
     - Use this app password in EmailJS
5. **Copy your Service ID** (you'll need this)

### Option C: Use a Different Email Service (Easiest)

Instead of Gmail, use one of these (they work better with EmailJS):
- **Outlook/Hotmail** - Usually works without issues
- **Yahoo Mail** - Good alternative
- **Custom SMTP** - If you have your own email server

1. Go to **Email Services** in the dashboard
2. Click **Add New Service**
3. Choose your preferred provider
4. Follow the setup instructions
5. **Copy your Service ID** (you'll need this)

## Step 3: Create Email Template
1. Go to **Email Templates** in the dashboard
2. Click **Create New Template**
3. Use this template structure:

**Subject:** New Contact Form Submission from {{from_name}}

**Content:**
```
New contact form submission:

Name: {{from_name}}
Email: {{from_email}}
Phone: {{phone}}
Timeline: {{timeline}}

---
This email was sent from your contact form.
```

4. **Copy your Template ID** (you'll need this)

## Step 4: Get Your Public Key
1. Go to **Account** > **General** in the dashboard
2. Find your **Public Key**
3. Copy it

## Step 5: Update Your Code
Open `src/App.jsx` and find the `handleSubmit` function (around line 740).

Replace these values:
- `YOUR_SERVICE_ID` → Your EmailJS Service ID
- `YOUR_TEMPLATE_ID` → Your EmailJS Template ID  
- `YOUR_PUBLIC_KEY` → Your EmailJS Public Key

## Step 6: Test
1. Submit the form on your website
2. Check your email inbox
3. You should receive the form submission!

## Troubleshooting Gmail API Errors

If you're getting "412 Gmail_API: Request had insufficient authentication scopes":

**Quick Fix - Use Netlify Instead (Recommended):**
The easiest solution is to skip EmailJS and use Netlify's built-in email notifications (see below). No code changes needed!

**Or try these Gmail fixes:**
1. **Revoke and reconnect:** In EmailJS, delete the Gmail service and add it again, making sure to grant all permissions
2. **Use Gmail SMTP instead:** Choose SMTP option and use an App Password (see Option B above)
3. **Use a different email:** Try Outlook or Yahoo instead of Gmail

## Alternative: Use Netlify Dashboard (EASIEST - No Code Changes!)

**This is the recommended approach** - it's much simpler and doesn't require EmailJS setup:

1. Go to https://app.netlify.com
2. Select your site
3. Go to **Site settings** > **Forms** > **Form notifications**
4. Click **Add notification**
5. Choose **Email notifications**
6. Enter your email address (e.g., fred@kerishullteam.com)
7. Select the "contact" form
8. Save

**That's it!** Form submissions will now be emailed directly to you. No code changes, no API setup, no authentication issues.

If you use this method, you can remove the EmailJS code from `src/App.jsx` and just keep the Netlify Forms submission.

