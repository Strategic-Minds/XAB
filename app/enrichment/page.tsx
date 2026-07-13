import EnrichmentClient from "@/components/enrichment/EnrichmentClient";

export const metadata = {
  title: "Bulk Lead Enrichment & Email Verification | XAB",
  description: "Verify email deliverability and scrape additional contractor social profiles in bulk.",
};

export default function EnrichmentPage() {
  return <EnrichmentClient />;
}
