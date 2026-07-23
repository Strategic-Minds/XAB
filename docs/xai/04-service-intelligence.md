# Xtreme AI Systems (XAI) Service Intelligence Spec

## 1. Service Evaluation Matrix
Similar to products, services represent massive high-margin revenue streams. The Service Intelligence system catalogs and ranks exactly 20 services using the same scoring criteria: search demand, commercial intent, buyer engagement, market growth, repeat purchase, margin potential, low-friction fulfillment, scalable acquisition, geographic reach, and foreseeable ROI.

## 2. Ranked Catalog (20 Core Services)
1.  **Commercial Concrete Polishing Service:** Large-scale industrial warehouse floor finishing.
2.  **Epoxy Flake Floor Installation:** Decorative and durable garage and retail coatings.
3.  **Surface Prep & Adhesive Removal:** Grinding away old mastic, carpet glue, and thinset.
4.  **Industrial Floor Grinder Rental & Support:** High-end equipment provisioning.
5.  **Concrete Moisture Testing & Remediation:** Vapor barrier application consulting.
6.  **Expansion Joint Sealing & Repair:** Polyurea joint filling for warehouses.
7.  **Polished Concrete Maintenance & Re-burnishing:** Recurring annual shine restoration.
8.  **Stained Concrete Floor Design & Application:** Decorative architectural coloring.
9.  **Dust-Free Concrete Shot Blasting:** Aggressive texture prep for thick overlays.
20. **Self-Leveling Concrete Underlayment:** Leveling uneven floor slabs.
11. **Concrete Terrazzo Restorations:** Delicate aggregate grinding and polishing.
12. **Safety Striping & Floor Line Marking:** OSHA-compliant pathway painting.
13. **Industrial Slurry & Waste Water Disposal Service:** EPA-compliant wastewater removal.
14. **Retail Floor Micro-Topping Application:** Decorative concrete overlay services.
15. **Urethane Cement Slurry Installation:** Thermal-shock resistant food-grade floors.
16. **Slip-Resistance Testing & Certification:** Static coefficient of friction auditing.
17. **Concrete Core Drilling & Testing:** Structural slab analysis.
18. **Acid Stain Concrete Restoration:** Revitalizing historical stained concrete.
19. **Concrete Sealer Re-application Service:** Re-coating existing exterior concrete.
20. **Efflorescence Cleaning & Concrete Acid Wash:** Salt deposit removal.

## 3. Operations & Refresh Schedule
*   **Refresh Times:** Exactly 3 times daily: **6:00 AM, 12:00 PM, and 6:00 PM Eastern Time**.
*   **Process:** The Service Intelligence Agent executes scraping and intelligence tasks to recalculate service feasibility scores.

## 4. Separation & Evidence Rules
*   **Separation:** Products and services are maintained in separate schemas to prevent inventory vs scheduling overlaps.
*   **Evidence Labels:** Every service data row must carry one of: `VERIFIED`, `ESTIMATED`, `INFERRED`, `UNAVAILABLE`, or `REQUIRES VALIDATION`.
*   **No Invention Rule:** Never fabricate client satisfaction rates, private company billing histories, or internal staffing statistics.
