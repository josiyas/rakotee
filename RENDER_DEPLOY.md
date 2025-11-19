# Deploying rakotee-backend to Render

This guide walks through deploying the backend to Render using the multi-stage Dockerfile included in `rakotee-backend/Dockerfile`.

Prerequisites
- A Render account and connected GitHub account
- The `main` branch of this repo contains the Dockerfile and app code
- Production secrets (MongoDB URI, JWT secret, SMTP credentials)

Steps

1. Create a new Web Service on Render
   - Provider: GitHub
   - Repo: `josiyas/rakotee` (or your fork)
   - Branch: `main`
   - Root Directory: leave blank or set to `rakotee-backend` if you prefer
   - Dockerfile Path: `rakotee-backend/Dockerfile` (or `./Dockerfile` if root is `rakotee-backend`)

2. Build & Instance
   - Instance type: Starter (good for low-traffic), scale up as needed
   - Auto-Deploy: enable if you want pushes to `main` to trigger deploys

3. Environment variables (add these in Render dashboard)
   - `MONGO_URI` (required)
   - `JWT_SECRET` (required)
   - `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_SECURE`, `EMAIL_FROM` (as needed)
   - `NODE_ENV=production`
   - `PORT` is automatically provided by Render — your app already uses `process.env.PORT || 5000`

4. Healthchecks & readiness
   - Render will call the Docker HEALTHCHECK and also the exposed port. The repo includes a `/health` route that reports MongoDB readiness.

5. Logging & monitoring
   - Check Render logs on first deploy and if healthchecks fail.
   - Add alerts in Render for restarts, high error rates, or unhealthy status.

6. DNS & SSL (optional)
   - Add your custom domain in Render and point your DNS provider to the Render-provided records.
   - Render provides managed SSL certificates; enable them in the dashboard.

7. Backup & maintenance
   - Use MongoDB Atlas with automated backups and replica sets for production.
   - Rotate `JWT_SECRET` and any other credentials via Render secrets when needed.

8. Rollbacks
   - Render keeps previous versions; use the dashboard to roll back to a previous deploy if necessary.

Tips for reliability
- Use the `runtime` Docker target locally for debugging (it contains shell+tools), and `final` for production.
- Configure health checks in your application to only report healthy when DB connections and critical services are ready.
- Add a lightweight smoke test in CI (already included) to catch regressions before deployment.

If you'd like, I can generate a Render manifest or help wire up automatic image pushes to GHCR and a Render Web Service that pulls from GHCR.
