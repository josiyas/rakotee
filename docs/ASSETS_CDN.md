# Assets Strategy: Object Storage + CDN (Long-term)

Goal
- Keep the repository small and fast.
- Serve product images and static assets via an object store (S3-compatible) + CDN (CloudFront or Cloudflare) for performance, cacheability, and scalability.

Why this is best for the long run
- Reduces repo size and clone times (no large binary assets in git).
- Improves page load times via a CDN (edge caching and HTTP/2/3 support).
- Easy to rotate/cross-origin assets and version them independently of code.
- Simplifies cache invalidation and large-scale asset purging.

High-level plan
1. Prepare assets locally (scripts/package-assets.ps1 or other helper).
2. Sync assets to S3 (or S3-compatible bucket) keyed by release or asset hash (e.g., `assets/v1/...` or `products/<sku>-<hash>.jpg`).
3. Serve images from a CDN in front of the bucket (CloudFront, Cloudflare, Fastly).
4. Invalidate CDN cache when deploying new assets (CloudFront invalidation or Cloudflare purge).
5. Update frontend references to the CDN-hosted URLs (or use a small helper to rewrite URLs at build time).

Security & credentials
- Use CI secrets to store `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET`, and optionally `CLOUDFRONT_DISTRIBUTION_ID`.
- Do NOT commit credentials to the repository.

Suggested URL pattern
- Production: `https://cdn.example.com/products/<sku>-<hash>.jpg`
- Versioned paths make cache invalidation trivial and safe.

CI workflow (what to run on deploy)
- Build or collect assets from `images/products/`.
- Sync to S3 with `aws s3 sync` or an action like `jakejarvis/s3-sync-action`.
- Optionally run `aws cloudfront create-invalidation` to purge CDN cache.

Local helper
- See `scripts/package-assets.ps1` — a convenience script to copy/zip and prepare an assets folder ready for upload.

Rollout notes
- Start by syncing a subset / test bucket and configure CORS if your frontend will request images across origins.
- Test origin performance and CDN TTLs. Use long TTLs in production and versioned filenames to avoid frequent invalidations.

If you want, I can:
- Add a GitHub Actions workflow (template included in repo) and help wire up the required secrets in your repository settings.
- Run the local pack script and create a one-off upload if you provide S3 credentials (or add them to CI secrets).
