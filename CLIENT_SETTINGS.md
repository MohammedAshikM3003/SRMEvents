# Client Handover & Setup Guide

Welcome to the SRM LifeStyle Events application! 

This application relies on a few external services (like Gmail, Supabase, and Twilio). Currently, it is using the developer's credentials. To fully take ownership of this application, you will need to replace those credentials with your own.

Everything is configured via **Environment Variables**. You do not need to edit any code. You simply need to update the Environment Variables in your hosting provider (e.g., Vercel) and your local `.env.local` file.

---

## 1. Emails That Need Changing

There are two primary email addresses configured in this application:

### A. The Sending Email (`SMTP_EMAIL`)
This is the email address the application uses to *send* OTP codes and event reminders to your users. Currently, this is set up to use Gmail.
- **Environment Variable Name**: `SMTP_EMAIL`
- **Password Variable Name**: `SMTP_PASSWORD` (See instructions below on how to generate this)

### B. The Master Email (`NEXT_PUBLIC_MASTER_EMAIL`)
This is a secure fallback/testing email used for the "Command Center" dashboard and bypassing certain trial restrictions.
- **Environment Variable Name**: `NEXT_PUBLIC_MASTER_EMAIL`

*(Note: There is also a `NEXT_PUBLIC_MASTER_PHONE` variable if you wish to change the master phone number for SMS).*

---

## 2. How to Set Up the Sending Email (Gmail)

Because standard Gmail passwords cannot be used directly in applications for security reasons, you must generate an **App Password**. 

Please follow these steps using the Gmail account you wish to send emails from:

1. Go to your **Google Account settings** (Manage your Google Account).
2. Navigate to the **Security** tab on the left sidebar.
3. Ensure **2-Step Verification** is turned ON. (You cannot generate an App Password without this).
4. Use the search bar at the top of the settings page and search for **"App passwords"**.
5. Create a new App Password:
   - Select **App**: Choose `Other (Custom name)` and type `SRM Events App`.
   - Click **Generate**.
6. Google will give you a **16-character password** (e.g., `abcd efgh ijkl mnop`).
7. Save this password! You will use this as your `SMTP_PASSWORD`.

---

## 3. Where to Update These Variables

### If hosting on Vercel (Production):
1. Log in to your Vercel Dashboard.
2. Select the **SRM Events** project.
3. Go to **Settings** > **Environment Variables**.
4. Find the existing variables and edit them, OR add new ones if they are missing:
   - Key: `SMTP_EMAIL` | Value: `your_client_email@gmail.com`
   - Key: `SMTP_PASSWORD` | Value: `the_16_character_app_password` (no spaces)
   - Key: `NEXT_PUBLIC_MASTER_EMAIL` | Value: `your_client_email@gmail.com`
5. Click **Save**.
6. Go to the **Deployments** tab and click the three dots on the latest deployment -> **Redeploy**. Environment variables only take effect after a new deployment!

### If running Locally (Development):
1. Open the project folder.
2. Open the `.env.local` file.
3. Update the lines to look like this:
   ```env
   SMTP_EMAIL="your_client_email@gmail.com"
   SMTP_PASSWORD="the_16_character_app_password"
   NEXT_PUBLIC_MASTER_EMAIL="your_client_email@gmail.com"
   ```
4. Restart your development server (`npm run dev`).

---

## Summary of All Required Environment Variables

For your reference, here is the full list of environment variables the application uses. Make sure all of these are transferred to the client's Vercel account:

**Database (Supabase):**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Email Sending (Nodemailer/Gmail):**
- `SMTP_EMAIL`
- `SMTP_PASSWORD`

**Master Testing Credentials:**
- `NEXT_PUBLIC_MASTER_PHONE`
- `NEXT_PUBLIC_MASTER_EMAIL`

**SMS Sending (Twilio) (Optional if only using Email):**
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`
