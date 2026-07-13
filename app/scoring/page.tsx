import ScoringClient from "@/components/scoring/ScoringClient";

export const metadata = {
  title: "AI Lead Scoring Engine | XAB",
  description: "Configure weight sliders and prioritize high-intent leads using machine learning scoring metrics.",
};

export default function ScoringPage() {
  return <ScoringClient />;
}
