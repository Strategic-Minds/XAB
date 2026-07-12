"use client";

import { useEffect, useState } from "react";

// Lazy load the heavy dashboard to avoid client-reference-manifest ENOENT bug
export default function Page() {
  const [Dashboard, setDashboard] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    import("@/components/dashboard/DashboardClient").then((mod) => {
      setDashboard(() => mod.default);
    });
  }, []);

  if (!Dashboard) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
      </div>
    );
  }

  return <Dashboard />;
}
