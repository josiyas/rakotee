RAKOTEE - Quick deploy guide (Backend -> Render, Frontend -> Netlify)

Overview
- Backend: Node.js + Express (rakotee-backend)
- Frontend: Static files in root (can be hosted on Netlify/Vercel)

1) Provision MongoDB Atlas
- Create a free cluster, create a database user, whitelist your server IP (or 0.0.0.0/0 for testing), and copy connection string.
- Set MONGO_URI in Render/host environment variables.

2) Backend (Render)
- Create a new Web Service on Render.
- Connect your GitHub repo, select `main` branch and the `rakotee-backend` folder as the root (if Render supports monorepo subdir). If not, set the build command to `cd rakotee-backend && npm ci && npm run build` and start command `cd rakotee-backend && npm start`.
- Add environment variables in Render's dashboard (JWT_SECRET, MONGO_URI, EMAIL_* from `.env.example`).
- Add `TRUST_PROXY=true` and `FORCE_HTTPS=true` for production behind a proxy.
- Deploy.

3) Frontend (Netlify)
- In Netlify, create a new site from Git -> select the repo -> set build command to `echo "static"` and publish directory to repository root (or use `npm run build` if you convert to a build step).
- Alternatively, deploy frontend by connecting a simple static hosting and pointing DNS.

4) DNS & SSL
- Point your domain to the provider (Render or Netlify) and enable automatic SSL.

5) GitHub Actions
- The included `.github/workflows/ci-deploy.yml` builds the backend Docker image and optionally pushes to Docker Hub and triggers a Render deploy. Add secrets in GitHub repo settings:
  - DOCKERHUB_USERNAME, DOCKERHUB_TOKEN, DOCKERHUB_REPO
  - RENDER_SERVICE_ID, RENDER_API_KEY

6) Final checks
- Verify /health endpoint and login flow.
- Verify email flows using the SMTP provider.

If you want, I can:
- Set up the Render service configuration file (.render.yaml) for you.
- Walk through adding the GitHub secrets and triggering the first deploy.
