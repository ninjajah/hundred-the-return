# Supabase Setup Instructions

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization and project name
5. Set a database password (save it securely!)
6. Select a region closest to your users
7. Wait for the project to be created

## 2. Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **Project API Key (anon, public)** (starts with `eyJ...`)

## 3. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your credentials:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...your-actual-key
   ```

## 4. Run Database Migrations

### Option A: Using Supabase SQL Editor (Recommended)

1. Open your Supabase dashboard
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy the contents of `migrations/001_create_expense_tables.sql`
5. Paste it into the SQL editor
6. Click **Run** to execute the migration

### Option B: Using Supabase CLI (Advanced)

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref your-project-id
   ```

4. Push migrations:
   ```bash
   supabase db push
   ```

## 5. Verify Setup

1. Go to **Table Editor** in your Supabase dashboard
2. You should see three new tables:
   - `expense_groups`
   - `participants`
   - `expenses`

## 6. Test Real-time Functionality

1. Go to **Settings** → **API** → **Realtime**
2. Enable real-time for all three tables:
   - `expense_groups`
   - `participants`
   - `expenses`

## Database Schema

### expense_groups
- `id` (UUID, Primary Key)
- `title` (VARCHAR, Not Null)
- `created_at` (TIMESTAMPTZ)
- `is_active` (BOOLEAN)

### participants
- `id` (UUID, Primary Key)
- `name` (VARCHAR, Not Null)
- `expense_group_id` (UUID, Foreign Key)
- `session_id` (UUID, Not Null)
- `joined_at` (TIMESTAMPTZ)

### expenses
- `id` (UUID, Primary Key)
- `description` (VARCHAR, Not Null)
- `amount` (DECIMAL, Not Null, > 0)
- `participant_name` (VARCHAR, Not Null)
- `expense_group_id` (UUID, Foreign Key)
- `created_at` (TIMESTAMPTZ)

## Security Features

- Row Level Security (RLS) is enabled on all tables
- Users can only read active expense groups
- Users can join any group as participants
- Users can only add/edit/delete their own expenses
- Built-in expense summary calculation function

## Troubleshooting

- **Environment variables not loading**: Make sure your `.env` file is in the project root and restart your dev server
- **Database connection errors**: Double-check your project URL and API key
- **RLS policy errors**: Ensure the policies are properly configured in the SQL migration
