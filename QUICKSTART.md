# Quick Start Guide: SRM LifeStyle Events

This guide provides instructions to get the SRM LifeStyle Events project up and running on your local machine.

## Prerequisites

- **Node.js**: Version 18.17 or higher.
- **npm** or **pnpm**: For managing dependencies.
- **Supabase Account**: A Supabase project with the required database tables.

## 1. Setup Environment Variables

Create a `.env.local` file in the root directory and fill in the following values:

```env
# Supabase Settings
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Twilio Settings (Optional for SMS)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number

# Nodemailer SMTP Settings (For Email OTP and Reminders)
# If using Gmail, use an "App Password"
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Master Contact for Testing
NEXT_PUBLIC_MASTER_PHONE="+91XXXXXXXXXX"
NEXT_PUBLIC_MASTER_EMAIL="master@example.com"

# Server Port
PORT=2000
```

## 2. Install Dependencies

Run the following command in the root directory:

```bash
npm install
```

## 3. Run the Development Server

Start the frontend and backend (Next.js handles both):

```bash
npm run dev
```

The application will be available at [http://localhost:2000](http://localhost:2000).

## 4. Authentication Tiers

### Bypass Login (Development Only)
- **URL**: `/auth/login`
- **Username**: `SRMdgl`
- **Password**: `SRMdgl`
- *Note: This uses a placeholder ID. OTP features require a real account to pass database constraints.*

### Real Authentication
- Use the Sign Up flow to create a real Supabase user. This is required for full OTP and database functionality.

## 5. Testing Reminders

1. Log in with a real account.
2. Go to **Settings** and add an Email Contact.
3. Verify the contact using the OTP sent to your email.
4. Navigate to `/api/test-setup` to generate test data.
5. Navigate to `/api/cron/reminders` to manually trigger the reminder email logic.

---

**Troubleshooting:**
- **OTP Fails to Send**: Ensure your `SMTP_PASSWORD` is a 16-character App Password (for Gmail) and not your regular password.
- **Database Errors**: Ensure your Supabase tables (`members`, `settings`, `notification_contacts`, `otp_verifications`) are created and match the schema in `lib/types.ts`.
