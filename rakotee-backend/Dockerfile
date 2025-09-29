### Multi-stage Dockerfile for rakotee backend
### - build stage installs deps and runs any build steps
### - final stage runs as a non-root user on a minimal image

FROM node:18-bullseye AS build
WORKDIR /usr/src/app

# Install all dependencies (including devDeps) so build tools can run
COPY package*.json ./
RUN npm ci

# Copy source files
COPY . .

# Optional build step: uncomment if you have one (transpile, bundling, etc.)
# RUN npm run build

# Remove devDependencies to keep the final image small. This leaves only
# production dependencies in node_modules for copying to the runtime stage.
RUN npm prune --production


## Runtime debug stage (useful when you need /bin/bash and debugging tools)
FROM node:18-slim AS runtime
WORKDIR /usr/src/app

# Create non-root user and group for security (fixed UID for distroless compatibility)
RUN groupadd -r rakotee && useradd -r -g rakotee -u 1001 -m -d /home/rakotee rakotee || true

# Copy production node_modules from build stage and app files
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app .

# Ensure files are owned by the non-root user
RUN chown -R rakotee:rakotee /usr/src/app

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Expose the application port
EXPOSE 5000

# Use non-root user
USER rakotee

# A small healthcheck hitting the /health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
	CMD wget -qO- --timeout=3 http://localhost:${PORT:-5000}/health || exit 1

# Start the app (debug/runtime target)
CMD ["node", "server.js"]

## Final production stage (distroless) - small and secure runtime
ARG RUNTIME=final
FROM gcr.io/distroless/nodejs:18 as final
WORKDIR /usr/src/app

# Distroless images do not have user creation tooling; we use UID that matches the runtime stage
# Copy production files and modules from the build stage
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app .

# Ensure the directory permissions are correct for the chosen non-root UID (1001)
USER 1001

# Use environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose port (metadata only; some registries use this)
EXPOSE 5000

# Distroless can't run shell healthchecks; lightweight TCP check using node
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
	CMD node -e "require('http').get({host:'127.0.0.1',port:process.env.PORT||5000,path:'/health'},res=>process.exit(res.statusCode===200?0:1)).on('error',()=>process.exit(1))"

# Default command for distroless
CMD ["server.js"]
