# Xtreme AI Systems (XAI) Authority Map

## 1. The Ten Orders of System Authority
To resolve conflicts, prevent unauthorized overrides, and govern autonomous operations, XAI enforces an absolute hierarchy of authority. Lower-numbered orders are HIGHER in authority and can never be overridden by higher-numbered orders.

| Rank | Authority Source | Description |
| :---: | :--- | :--- |
| **1** | **Approved Project Workbook** | Direct product specifications, financial boundaries, and customer goals. |
| **2** | **Explicit Operator Decisions** | Human-in-the-loop cryptographically signed instructions or direct overrides. |
| **3** | **Approved Webpack & Visual Contract** | The binding design system, layout files, components, and responsive contracts. |
| **4** | **GitHub Source Control** | The current state of `Strategic-Minds/XAB` main branch. |
| **5** | **Database Schema & Migrations** | Active production database state and schema definition files (Supabase/PostgreSQL). |
| **6** | **Vercel Deployment State** | Active environment configurations, edge functions, and hosting routing tables. |
| **7** | **BrowserWorker Validation Evidence** | Signed verification receipts from the canonical `https://browserworker.vercel.app`. |
| **8** | **Google Drive Records** | Shared spreadsheets, customer CSVs, and long-term data archives. |
| **9** | **Base44 Registries** | App configurations, active connector credentials, and platform state records. |
| **10** | **Agent Memory & Inference** | Internal vector stores, log history, and LLM-inferred contextual execution states. |

## 2. Inviolable Rule of Authority
*   **Lower sources NEVER override higher sources.**
*   If an Agent's memory or LLM inference (Rank 10) conflicts with the GitHub Source (Rank 4), the GitHub Source wins.
*   If the Vercel Deployment State (Rank 6) conflicts with the Webpack Contract (Rank 3), the system must rollback to enforce Rank 3.
*   Any agent violating this hierarchy will have its job lease immediately revoked and routed to the `Dead-Letter Queue`.

## 3. Current Active Authorities
*   **Parent Company:** Xtreme Polishing Systems (Coordinates industrial machinery and concrete prep supply).
*   **AI Operating System:** Xtreme AI Systems (XAI) (Governs the intelligence layer).
*   **Control Plane Repo:** `Strategic-Minds/XAB` (The singular source of governance, architecture, and deployment state).
*   **Browser Layer Repo:** `Strategic-Minds/BROWSERWORKER` (Hosts the validation and scraping engine).
*   **First Product:** Xtreme Scraper (Visual-first automated concrete scraper).
