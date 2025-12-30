# Supabase Setup Guide

## Project Information

- **Project URL**: https://ounwyifyrjfvzaaiywxl.supabase.co
- **Project ID**: ounwyifyrjfvzaaiywxl
- **Region**: eu-west-2
- **Status**: ACTIVE_HEALTHY

## Environment Variables

Create a `.env` file in the root of your project with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://ounwyifyrjfvzaaiywxl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91bnd5aWZ5cmpmdnphYWl5d3hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMzQ5NzksImV4cCI6MjA4MjYxMDk3OX0.SvkXSOv0u09yMhX0AveBY8XKfaVPh-GjjoSzuBKlhDY

# Alternative: Modern Publishable Key (recommended for new applications)
# VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_cHSaA9QuGD1xZw3ctRrBtA_WuvdTEDp

# Firebase Configuration (Fallback - Optional)
# VITE_FIREBASE_API_KEY=your_firebase_api_key
# VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
# VITE_FIREBASE_DATABASE_URL=your_firebase_database_url
# VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
# VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
# VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
# VITE_FIREBASE_APP_ID=your_firebase_app_id
```

## Database Schema

### Users Table

The `users` table has been created with the following structure:

- **id** (UUID, primary key)
- **auth_user_id** (UUID, foreign key to `auth.users.id`, unique)
- **name** (TEXT, required)
- **surname** (TEXT, required)
- **email** (TEXT, unique, required)
- **phone** (TEXT, optional)
- **role** (user_role enum: 'admin' | 'client', default: 'client')
- **created_at** (TIMESTAMPTZ)
- **updated_at** (TIMESTAMPTZ)

### Row Level Security (RLS)

RLS is enabled on the `users` table with the following policies:

1. **Users can view their own data** - Users can SELECT their own row
2. **Users can update their own profile** - Users can UPDATE their own row (name, surname, phone only)
3. **Admins can view all users** - Admins can SELECT all rows
4. **Service role full access** - Service role can INSERT/UPDATE/DELETE
5. **Users can insert their own record** - Authenticated users can INSERT their own record on signup

## Next Steps

1. Copy the environment variables above to your `.env` file
2. The Supabase client is already configured in `src/lib/supabase.ts`
3. Database helper functions are available in `src/lib/db/users.ts`
4. Configure email templates in the Supabase dashboard (Task 2.4)

## Supabase Dashboard

Access your Supabase dashboard at: https://supabase.com/dashboard/project/ounwyifyrjfvzaaiywxl

