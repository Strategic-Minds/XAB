import PipelineClient from "@/components/pipeline/PipelineClient";

export const metadata = {
  title: "CRM Pipeline | XAB",
  description: "Track your sales pipeline and deal status.",
};

export default function PipelinePage() {
  return <PipelineClient />;
}
