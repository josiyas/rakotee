Rakotee — Supabase deployment notes

This folder contains database migrations and Edge Function skeletons for deploying the Rakotee backend to Supabase.

Prerequisites
- Install Supabase CLI: https://supabase.com/docs/guides/cli
- Login: supabase login
- Have a Supabase project created and copy SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY

Deploy steps
1. Run migrations
```bash
cd supabase
supabase db remote set <YOUR_DB_URL_IF_NEEDED>
supabase db reset # or supabase db push/migrate depending on CLI version
# Or use the SQL file in the SQL Editor in the Supabase dashboard
```

2. Deploy functions
```bash
# install supabase cli and from project root
supabase functions deploy list-users --project-ref <project-ref> --env-file .env
supabase functions deploy manage-user --project-ref <project-ref> --env-file .env
```

Environment variables for functions
- SUPABASE_URL=https://<project>.supabase.co
- SUPABASE_SERVICE_ROLE_KEY=<service_role_key> (very sensitive — only for server-side)

Security notes
- Do NOT embed the service role key in client-side code. Use Edge Functions as server-side proxies.
- Protect Edge Functions with an internal header or verify JWTs from Supabase Auth (recommended).

Data migration
- Use `scripts/migrate-mongo-to-pg.js` to move basic collections from MongoDB to Postgres. Set `MONGO_URI` and `PG_CONNECTION` env vars before running.

CI/CD
- You can add a GitHub Action to deploy Edge Functions and run migrations on merges to `main`.

Next steps
- Harden auth in functions (verify Supabase JWTs and ensure admin role).
- Add RLS policies for `users` so client-side anon key usage is safe.
- Add triggers for `updated_at` and stock decrement on order creation.

