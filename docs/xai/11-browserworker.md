# Xtreme AI Systems (XAI) BrowserWorker Integration Spec

## 1. Operational Protocol
BrowserWorker is the supreme validation authority for XAI. No code is compiled, and no application is promoted to production without passing the automated BrowserWorker evaluation loops.

*   **Canonical API Endpoint:** `https://browserworker.vercel.app`
*   **Security Authentication:** Every request must pass a secure header: `Authorization: Bearer [BROWSER_WORKER_SECRET]`.

## 2. Inviolable Validation Checklist
BrowserWorker must execute and output structured audit results for:
1.  **Desktop Viewport:** Full visual render at 1440x900px.
2.  **Tablet Viewport:** Full visual render at 1024x768px.
3.  **Mobile Viewport:** Full visual render at 375x812px.
4.  **PWA Install Surface:** Verification that the custom mobile install button is visible and active.
5.  **Home-Screen Icon:** Verifying that the custom icon exists and is correctly structured in metadata.
6.  **Navigation Links:** Crawling and verifying that all navbar, dropdown, and footer links return HTTP 200.
7.  **Interactive Forms:** Filling out input forms with mock data, clicking submit, and verifying that the target database/webhook receives the submission.
8.  **Routing Checks:** Testing sub-routes and ensuring clean URL structures.
9.  **Console Audit:** Capturing runtime JavaScript console logs. Any unhandled exception blocks release.
10. **Network Audit:** Scanning active network requests. Any resource load failure (HTTP 400+) blocks release.
11. **Responsive Layout Overlap:** Measuring element boundaries to ensure text does not overflow screen boundaries.
12. **Visual Contrast:** Auditing element color contracts.
13. **Screenshot Capture:** Outputting high-resolution PNGs of all main pages.
14. **Webpack Comparison:** Running structural and pixel comparisons against the approved design Webpack.

## 3. Fail-Closed Rule
If BrowserWorker:
*   Is offline or unavailable,
*   Returns an authentication error,
*   Is misconfigured or missing API credentials,
*   Returns a `queued-only` status instead of a completed run,
*   Or fails to generate screenshot audit files;

**Then the deployment status is immediately set to `BLOCKED`.**

Under no circumstances does a queued receipt equal completed validation. The validation is only successful when a finished, signed receipt is returned by the BrowserWorker API containing 100% success metrics.
