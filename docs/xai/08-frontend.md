# Xtreme AI Systems (XAI) Frontend Standards

## 1. Core Implementation Rules
All frontend interfaces generated under XAI are compiled with next-generation reactive components and must strictly satisfy the following technical standards:

*   **Responsive Layout:** Grids must adapt dynamically across viewports (Mobile: 375px - 425px, Tablet: 768px - 1024px, Desktop: 1440px+). Zero text clipping or visual wrapping overlap is permitted.
*   **Functional Navigation:** All headers, footers, hamburger menus, and drawer navigation must transition and route perfectly without console errors.
*   **CTAs and Forms:** All buttons must register click events. Forms must utilize reactive states, enforce input-type validations, provide real-time validation feedback, and handle asynchronous submission states safely.
*   **Routes and Links:** Zero dead links (`href="#"` is forbidden). Every link must route to a valid target page or anchor.
*   **Functional Integrations:** Third-party widgets (calendars, payment gateways, lead submission webhooks) must initialize correctly and execute end-to-end.
*   **SEO Metadata:** Standard title tags, meta descriptions, OpenGraph attributes, structural JSON-LD schemas, and canonical tags must compile on every route.
*   **Accessibility Support:** Native semantic HTML, ARIA role mappings, correct alt text on images, keyboard navigable focus states, and a contrast ratio of at least 4.5:1.
*   **Performance Optimization:** Images must utilize modern next-gen compression formats (WebP/AVIF), CSS must be minified, and critical paths must render in under 1.5 seconds.
*   **Error Handling:** Local React Error Boundaries must prevent total page failure. Users must receive informative retry screens in the event of component failure.
*   **Loading Behavior:** Skeletal skeletons and state indicators must represent active data-fetching windows.
*   **Analytics Plan:** Automatic tracking of scroll depth, form interactions, CTA clicks, and conversion events.
