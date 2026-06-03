# Impact Admin Dashboard

A production-minded React + Supabase admin dashboard for creating organizations, inviting members, and viewing the organizations managed by the signed-in admin.

## Stack

- React 18, TypeScript strict mode, Vite with SWC
- React Router v6 for protected client routes
- Tailwind CSS with Radix-based shadcn-style UI primitives
- TanStack React Query for all server state
- React Hook Form + Zod for form validation
- Supabase Auth, Postgres, RLS, and Edge Functions

## Features

- Admin sign-up and sign-in with Supabase email/password auth
- Protected dashboard routes with visible signed-in email and sign-out control
- Organization creation for schools, nonprofits, and businesses
- Type-specific required fields enforced in Zod and database constraints
- Organization directory with type badges, member counts, and created dates
- Organization detail view with member list and invitation form
- Invitation creation through a Supabase Edge Function
- RLS policies restricting admins to their own organizations and members

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env.local
   ```

3. Fill in:

   ```bash
   VITE_SUPABASE_URL=
   VITE_SUPABASE_ANON_KEY=
   ```

4. Apply the Supabase migration from `supabase/migrations`.

5. Deploy the Edge Function:

   ```bash
   supabase functions deploy invite-member
   ```

6. Start the app:

   ```bash
   npm run dev
   ```

## Supabase Notes

- RLS is enabled on every app table in `supabase/migrations/20260603180000_initial_admin_dashboard.sql`.
- The `organizations_with_member_counts` view uses `security_invoker = true` so table RLS still applies.
- The `invite-member` Edge Function validates the caller, verifies organization ownership, normalizes email, and relies on a unique constraint to prevent duplicate invitations.
- Client code only uses the Supabase anon key. Never expose the service-role key in Vite or Vercel client environment variables.

## Deployment

Configure these Vercel environment variables for both Production and Preview:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Expected branch workflow:

- `development` is the default working branch.
- Short-lived feature branches merge into `development` through pull requests.
- `main` receives stable milestones from `development`.
