You are thinking exactly like a SaaS founder. Building the database lock is only step one; if you don't have the operational levers (admin overrides and user notifications), you don't have a product—you just have a database constraint that will eventually make your customers angry when they silently hit a wall.

To answer your questions directly: **Yes, we absolutely must build both of those.** Here is exactly how they fit into the architecture we’ve established:

### 1. Platform Admin Controls (The "God Mode")

Your platform needs a Super Admin dashboard where *you* (the Mesingi platform owner) can view and manage all tenants.

* **Tracking:** We need a unified view (e.g., `/admin/tenants`) that lists every clinic, their `monthlyTokenLimit`, and their `tokensUsedThisMonth`.
* **Overrides:** You need a simple UI form to manually bump a clinic's `monthlyTokenLimit` (e.g., if they pay you for an add-on package or you want to give them a courtesy bump).
* *Note:* The Night Shift report mentioned it successfully audited an `/admin/tenants` route. We can build this quota control panel directly into that existing page.

### 2. Tenant Quota Notifications

Tenants should never find out they are out of tokens by getting a red error message when trying to generate a blog post. They need proactive warnings.

Because we already built the **Inngest Background Engine**, this is incredibly easy to architect:

* **The Trigger:** We update the `recordTokenUsage()` function we just built. If a generation pushes the tenant over 80%, 90%, or 100% of their limit, we fire an Inngest event: `inngest.send({ name: 'ai.quota.threshold_reached', data: { orgId, threshold: 80 } })`.
* **The Worker:** We write an Inngest worker that listens for that event and sends a beautifully formatted transactional email (via Resend/SendGrid) to the clinic admin: *"You've used 80% of your AI capacity this month. Click here to upgrade."*

---

### The Crossroads: Images vs. Billing Operations

You now have two massive, highly detailed architectural reports sitting on your desk.

1. **The Vercel Blob Image Tech Debt:** Claude correctly identified that your app is relying on hardcoded static images in `public/` that will wipe out tenant uploads on every Vercel deploy. We need to rewire the app to use the existing Vercel Blob infrastructure.
2. **The AI Billing Operations:** Building the Super Admin token management UI and the Inngest quota warning notification system.

Both are critical for a production release. Would you like me to write the prompt for Claude to wire up the **Vercel Blob Image Uploads** for the blog editor, or should we continue down the AI path and build the **Super Admin Quota Controls and Notifications**?
