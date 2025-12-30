# Troubleshooting Guide

## Supabase Signup 401 Unauthorized Error

If you're getting a `401 Unauthorized` error when trying to create an account, it can be caused by:

1. **Invalid API Key** (most common) - The anon key in your `.env` file is incorrect or expired
2. **Email signup disabled** - Email provider is disabled in Supabase dashboard
3. **Environment variables not loaded** - Vite hasn't picked up your `.env` file changes

### Solution 1: Fix Invalid API Key Error

If you see `"Invalid API key"` in the error message:

1. **Get Fresh API Keys from Supabase**
   - Go to: https://supabase.com/dashboard/project/ounwyifyrjfvzaaiywxl
   - Navigate to **Settings** → **API**
   - Copy the **Project URL** and **anon/public key**

2. **Update Your `.env` File**
   - Open `.env` in the project root
   - Update the values (make sure there are NO quotes, NO spaces):
     ```env
     VITE_SUPABASE_URL=https://ounwyifyrjfvzaaiywxl.supabase.co
     VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here
     ```
   - **Important**: No quotes, no trailing spaces, no line breaks in the key

3. **Restart Your Dev Server**
   - **Stop** the server completely (Ctrl+C)
   - **Start** it again: `bun run dev`
   - Vite only reads `.env` files on startup!

4. **Verify in Browser Console**
   - Open DevTools (F12) → Console
   - Look for "Supabase Config Check" log
   - Verify both `hasUrl` and `hasKey` are `true`

### Solution 2: Enable Email Signup

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard/project/ounwyifyrjfvzaaiywxl
   - Navigate to **Authentication** → **Providers**

2. **Enable Email Provider**
   - Find the **Email** provider in the list
   - Make sure it's **enabled** (toggle should be ON)
   - If disabled, click the toggle to enable it

3. **Check Email Settings**
   - Go to **Authentication** → **Settings**
   - Under **Email Auth**, ensure:
     - "Enable email signup" is checked
     - "Confirm email" can be enabled or disabled (depending on your preference)
     - If "Confirm email" is enabled, users will need to verify their email before logging in

4. **Check Site URL Configuration**
   - Go to **Authentication** → **URL Configuration**
   - Ensure your **Site URL** is set correctly (e.g., `http://localhost:5173` for development)
   - Add your development URL to **Redirect URLs** if needed

5. **Restart Your Dev Server**
   - After making changes, restart your Vite dev server:
     ```bash
     # Stop the server (Ctrl+C) and restart
     bun run dev
     ```

### Other Common Issues

#### WebSocket Connection Error
The `WebSocket connection to 'ws://localhost:5174/' failed` error is typically a Vite HMR (Hot Module Replacement) issue and is not critical. It doesn't affect functionality.

**To fix:**
- Restart your dev server
- Check if port 5174 is already in use
- This is usually harmless and can be ignored

#### Invalid API Key
If you see "Invalid API key" errors:

1. **Verify the key is correct**
   - Go to Supabase Dashboard → **Settings** → **API**
   - Copy the **anon/public** key (not the service_role key!)
   - Make sure you're using the anon key, not the service role key

2. **Check `.env` file format**
   - No quotes around values: `VITE_SUPABASE_ANON_KEY=key_here` ✅
   - Not: `VITE_SUPABASE_ANON_KEY="key_here"` ❌
   - No spaces: `VITE_SUPABASE_ANON_KEY=key_here` ✅
   - Not: `VITE_SUPABASE_ANON_KEY = key_here` ❌

3. **Restart dev server**
   - Vite only reads `.env` on startup
   - Stop server (Ctrl+C) and restart: `bun run dev`

4. **Check browser console**
   - Open DevTools (F12) → Console
   - Look for "Supabase Config Check" log
   - Verify the key preview matches what you expect

#### CORS Issues
If you see CORS errors:
1. Check your Supabase project's **Settings** → **API**
2. Ensure your localhost origin is allowed
3. For development, Supabase usually allows localhost by default

### Getting More Error Details

The application now logs detailed error information to the browser console. Open your browser's Developer Tools (F12) and check the Console tab for more specific error messages.

### Still Having Issues?

1. **Check Supabase Project Status**
   - Ensure your project is active and healthy
   - Check for any service disruptions

2. **Verify Environment Variables**
   - Make sure `.env` file exists in the project root
   - Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set correctly
   - Restart dev server after changing `.env`

3. **Test Direct API Call**
   - Try making a direct API call to Supabase to verify connectivity
   - Check network tab in browser DevTools for the actual request/response

4. **Check Supabase Logs**
   - Go to Supabase Dashboard → **Logs** → **API Logs**
   - Look for any errors related to your signup attempts

