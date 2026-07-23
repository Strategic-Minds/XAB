# Xtreme AI Systems (XAI) Progressive Web App (PWA) Spec

## 1. Compliance Requirements
All web applications compiled by XAI must qualify as installable Progressive Web Apps. This guarantees a native mobile feel on iOS and Android devices, serving as a primary sales interface.

*   **Web Manifest:** Must deliver a valid `manifest.json` specifying:
    *   `short_name` and `name` (matching approved branding).
    *   `start_url` set to the home route.
    *   `display` set to `standalone`.
    *   `background_color` and `theme_color` (matching Webpack design system tokens).
*   **Service Worker:** A background service worker (`sw.js`) must register successfully on page load, handling caching, offline fallbacks, and push notifications.
*   **Offline Fallback:** If internet connectivity is severed, the app must display a custom branded offline dashboard with contact forms cached locally.
*   **Branded Splash & Icons:** Complete set of high-resolution, masked icons in exact sizes: 192x192px and 512x512px.
*   **Touch-Safe Navigation:** Mobile controls must fit a minimum touch target size of 44x44px with comfortable gutters.
*   **Safe-Area Handling:** All mobile headers, footers, and floating overlays must respect device safe-area insets (`env(safe-area-inset-bottom)`).

## 2. Mandatory Install Button
Every page on mobile viewport sizes must display a branded, prominent install button:
*   **Design:** Branded rectangular element placed in the bottom-right corner.
*   **Styling:** Must match approved Webpack colors, utilize high contrast, and prevent overlapping page text.
*   **Responsive Behavior:** Hidden on desktop viewports; visible only on mobile/tablet viewports where app is not yet installed.
*   **Interaction:** Triggers native install prompt where supported. If not supported (e.g., iOS Safari), displays elegant bubble instructions showing the user how to click "Share" and "Add to Home Screen".
*   **Validation Gate:** This install button must successfully complete three independent operational test runs in BrowserWorker before release is permitted.

## 3. Home-Screen Icon Parity
The installed application icon must match the approved logo design, colors, and visual language of the specific client Webpack. No generic fallback icons are permitted.
