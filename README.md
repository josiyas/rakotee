# Rakotee Store

## Project Organization & Best Practices

1. **Remove Unused Files:**
   - Delete `.vscode/firebase-config.js` and `connect.js` if not needed.
2. **Organize Assets:**
   - Move all product images to `images/products/`.
   - Use compressed images for performance.
3. **Consistent Styling:**
   - Move all inline styles to `style.css`.
   - Use CSS variables for colors and spacing.
4. **Responsive Design:**
   - Use media queries for mobile responsiveness.
5. **Accessibility:**
   - Add descriptive `alt` text to all images.
   - Use semantic HTML tags.
6. **SEO:**
   - Add meta tags and structured data to all HTML pages.
7. **Code Organization:**
   - Split large JS files into modules if needed.
   - Use comments and consistent formatting.
8. **Performance:**
   - Use lazy loading for images.
   - Minify CSS/JS for production.
9. **Security:**
   - Never expose sensitive data in frontend files.
   - Validate all user input on the backend.
10. **User Experience:**
    - Add error handling for images/network issues.
    - Provide feedback for user actions.

## Next Steps
- Follow the above checklist for a clean, fast, and accessible web store.

## Payments (PayFast)

This project includes a server-side PayFast integration to avoid exposing merchant credentials in the frontend.

- Set these environment variables for your backend (do NOT commit them):
   - PAYFAST_MERCHANT_ID
   - PAYFAST_MERCHANT_KEY

- The server exposes `POST /api/order/payfast` which saves an order and returns an auto-submitting form that redirects the customer to PayFast. The IPN endpoint `/api/order/payfast-ipn` verifies notifications from PayFast and marks the order paid only after verification.

Testing locally:

1. Add the PayFast creds to your `.env` (copy `rakotee-backend/.env.example` to `.env`).
2. Start the backend and open `checkout.html` in a browser.
3. Fill the checkout form and click "PayFast" — a new window will open and redirect to PayFast with the server-supplied credentials.
4. Use PayFast sandbox or test flows to complete payment and ensure IPN hits `/api/order/payfast-ipn` on your server (for local testing, use a tunnel like ngrok for PayFast to reach your machine).

If you want, I can implement full IPN logging and an admin UI for reviewing pending and paid orders.

PayFast IPN logging
-------------------
The backend now records incoming PayFast IPN payloads to a small `IpnLog` collection (`rakotee-backend/models/IpnLog.js`). Each IPN attempts verification and the result is saved for troubleshooting. For local testing use ngrok so PayFast can call your `notify_url`.

PayPal setup
------------
If you want to accept PayPal payments the backend now includes endpoints to create orders and capture them server-side, plus a webhook verifier. Add these env vars to your backend `.env`:

- PAYPAL_CLIENT_ID
- PAYPAL_SECRET
- PAYPAL_MODE=sandbox or live
- PAYPAL_WEBHOOK_ID (set in your PayPal developer dashboard after creating a webhook)

Testing locally:

1. Create sandbox REST app in PayPal developer dashboard and get client id/secret.
2. Start your backend and expose it via ngrok (or a similar tunnel) so PayPal can reach your webhook URL.
3. In PayPal developer dashboard create a webhook pointing to `https://<your-ngrok>/api/order/paypal-webhook` and use the Webhook ID in `PAYPAL_WEBHOOK_ID`.
4. Use the frontend PayPal button (I will wire it in `checkout.html`) to create and approve an order; verify the webhook marks the order paid.

Admin orders dashboard
----------------------
I added a lightweight admin page at `admin-orders.html` that shows all orders and recent IPN logs. For demo/admin access include the `x-admin-password` header with your `ADMIN_PASSWORD` value, or use your existing admin cookie. From the page you can mark orders delivered.
