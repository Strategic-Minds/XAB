# Xtreme AI Systems (XAI) Supabase Hardening Spec

## 1. Relational Database Hardening
XAI utilizes Supabase (PostgreSQL) as its secure, atomic relational storage layer. All production and sandbox schemas must be explicitly declared and protected.

*   **Row-Level Security (RLS):** RLS must be activated on 100% of public database tables. No table is allowed to accept unauthenticated reads/writes unless protected by specific, narrow policies.
*   **Strict Table Schema Requirements:** Every table must contain `id` (UUID), `created_at` (timestamptz), and `updated_at` (timestamptz).
*   **Audit Trail:** System modifications, agent state transitions, and operator log-ins write immutable records to the `audit_ledger` table.

## 2. Required Core Tables
1.  **Queue Tables:** Manages state and leases for the 25 system queues.
2.  **Receipt Tables:** Holds signed cryptographic logs of all agent operations.
3.  **Approval Tables:** Records operator override approvals and digital signatures.
4.  **Release Tables:** Tracks deployment version histories, hashes, and release managers.
5.  **Cost Tables:** Tracks API and compute expenditure across jobs.
6.  **Revenue Tables:** Captures financial invoices, margins, and lead values.
7.  **Failure Tables:** Logs runtime exceptions and failing tests.
8.  **Recovery Tables:** Tracks backup executions and recovery rollback logs.
9.  **Artifact Tables:** Holds compiled webpack files, code files, and build hashes.
10. **Webpack Tables:** Stores approved design schemas and checksums.
11. **Validation Tables:** Holds BrowserWorker receipts and comparison scorecards.
12. **Contact-Delivery Tables:** Tracks client lead distributions.

## 3. Lead Generation Contact Workbook Standard
All leads captured, verified, and delivered by the system (including those produced by the Xtreme Scraper) must be structured into a highly organized, clean Excel/CSV workbook containing the following columns:
1.  **full_name:** Contact's first and last name.
2.  **verified_email:** Dual-checked active email address.
3.  **phone:** Formatted telephone number (E.164 standard).
4.  **business_name:** Registered commercial business name.
5.  **website:** Target's active domain URL.
6.  **location:** Country, state, and city.
7.  **category:** Primary industrial trade (e.g., concrete polishing).
8.  **source:** Scrape source identifier.
9.  **source_url:** Direct URL where contact was indexed.
10. **verification_status:** Status flag (`VERIFIED` | `UNVERIFIED`).
11. **confidence:** Numeric confidence grade (1-100).
12. **retrieval_date:** Acquisition timestamp.
13. **last_verified_date:** Timestamp of last verification check.
14. **notes:** Contextual business details scraped.
15. **compliance_status:** CAN-SPAM / GDPR verification compliance flag.

**Inviolable Integrity Rule:** Never represent a lead as verified without direct SMTP ping and syntax proof. Fraudulent lead statuses block releases.
