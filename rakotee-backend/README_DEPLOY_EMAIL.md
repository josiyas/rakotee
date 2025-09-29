SMTP setup and test

1) Recommended providers
- SendGrid, Mailgun, Amazon SES, Postmark, or your own SMTP server.

2) Environment variables (add to production env / .env)
- EMAIL_HOST (smtp host)
- EMAIL_PORT (587 for TLS, 465 for SSL)
- EMAIL_USER (SMTP username)
- EMAIL_PASS (SMTP password)
- EMAIL_FROM (From header, e.g. "RAKOTEE <no-reply@yourdomain.com>")
- EMAIL_SECURE (true for port 465)

3) DNS records for good deliverability
- Add SPF record: v=spf1 include:sendgrid.net ~all (provider-specific)
- Add DKIM: provider will give DKIM records to add to DNS
- Add DMARC (optional but recommended)

4) Test via API (after starting backend with env vars configured)
- POST /api/debug/send-test-email with JSON body { "to": "you@domain.com" }

PowerShell example:

$body = @{ to = 'you@domain.com'; subject = 'SMTP test'; html = '<p>Hello from RAKOTEE</p>' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:5000/api/debug/send-test-email -ContentType 'application/json' -Body $body

5) Notes
- In development, if no SMTP env vars are provided, Ethereal will be used and a preview URL will be returned in the response.
- Ensure rate limits and abuse controls in production.
