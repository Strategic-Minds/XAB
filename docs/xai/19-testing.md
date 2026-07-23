# Xtreme AI Systems (XAI) Operational Testing Spec

## 1. The Three-Pass Operational Testing Rule
No application deployment is pushed to production without successfully executing three consecutive, 100% clean operational test passes. A single failure on any run resets the test suite and blocks release.

## 2. Isolated Test Execution
Each of the three sequential test runs must execute inside a completely pristine browser and runtime environment:
1.  **Fresh Browser Session:** Absolute clearance of all cookies, local storage, manifest caches, and cached service workers.
2.  **Unique Tracking Identifiers:** Every run generates a fresh `job_id` and a distinct, signed validation receipt.
3.  **Unique Form Inputs:** Interactive form tests must utilize newly compiled synthetic data to verify that forms do not rely on hardcoded entries.
4.  **Complete Logging Capture:** Full recording of network headers, console logs, and performance marks.

## 3. Comprehensive Coverage Requirements
The automated testing script must interact with and verify:
*   **All User Routes:** Every single page must compile and load without blank screens.
*   **Every Navigation Link:** Every navbar, menu, button, and footer link must return HTTP 200.
*   **Interactive Forms:** Fill and submit forms, asserting successful database writes.
*   **PWA Assets:** Manifest file validation, service worker installation, and verification of custom offline screens.
*   **Visual Assets:** High-resolution screenshots of Desktop, Tablet, and Mobile viewports.
*   **Errors:** Verification that bad input patterns trigger inline forms validation errors.

## 4. Failure Rule
Any unhandled console exception, API failure, asset timeout ($> 5$ seconds), or visual misalignment instantly terminates the testing pipeline. The system marks the active deployment as `FAILED` and dispatches the build code to the Automated Repair Queue.
