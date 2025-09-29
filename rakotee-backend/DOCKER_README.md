
rakotee-backend Dockerfile (Debian-slim runtime)

This folder contains a multi-stage Dockerfile for the rakotee backend. The final runtime image uses `node:18-slim` (Debian slim) which provides a good balance between image size, libc compatibility, and debugging friendliness.

Key points
- Multi-stage: installs dependencies in a build stage and copies only what's needed into the runtime image.
- Runtime: `node:18-slim` (Debian slim) for glibc compatibility and easier troubleshooting compared to Alpine.
- Non-root user: container runs as `rakotee` for improved security.
- Healthcheck: the container exposes a HEALTHCHECK that calls `/health`.

Environment variables (set these in your host/orchestration):
- `MONGO_URI` or `MONGODB_URI`: MongoDB connection URI (required)
- `JWT_SECRET`: secret for signing JWT tokens (required)
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_SECURE`, `EMAIL_FROM`: SMTP settings (optional in dev)
- `PORT`: port the app listens on (default 5000)

Build & run (local Docker - PowerShell)

```powershell
# Build the image
docker build -t rakotee-backend:local .

# Run (example)
docker run -e MONGO_URI="your-mongo-uri" -e JWT_SECRET="a-long-secret" -e PORT=5000 -p 5000:5000 --rm rakotee-backend:local
```

Notes & best practices
- Add a `.dockerignore` to exclude `node_modules`, local env files, logs, and large assets.
- For CI/CD, build the image in your pipeline and push to a registry (Docker Hub, GHCR, etc.).
- Use your host's secrets manager (Render, Kubernetes secrets, or GitHub Actions secrets) to provide sensitive env vars.
- For even smaller runtime images later, you can adopt a distroless runtime; the current choice favors deb-based debugging.

Debugging
- Inspect logs with `docker logs <container-id>` and use the `/health` endpoint at `http://localhost:5000/health` to check container readiness.

Next steps I can help with (pick any):
- create/update a `.dockerignore` (if you don't already have one),
- add a GitHub Actions workflow that builds and pushes this image to a registry, or
- adapt the Dockerfile for Docker Compose or a cloud provider's container registry.

Publishing to GitHub Container Registry (GHCR)

The CI workflow optionally publishes to GHCR. Locally you can push with:

```powershell
# Authenticate (use a personal access token with packages:write or GitHub CLI)
echo $env:GITHUB_TOKEN | docker login ghcr.io -u <USERNAME> --password-stdin

# Tag and push
docker tag rakotee-backend:ci ghcr.io/<OWNER>/rakotee-backend:latest
docker push ghcr.io/<OWNER>/rakotee-backend:latest
```

In CI the workflow uses `docker/build-push-action` with `GITHUB_TOKEN` if available and will push to `ghcr.io/<owner>/rakotee-backend`.

