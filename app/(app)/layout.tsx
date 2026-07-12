import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { AppChatPanel } from "@/components/layout/app-chat-panel";

// Auth gate is enforced by middleware.ts
// Layout is sync to avoid client-reference-manifest ENOENT in Next.js 15
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <AppChatPanel />
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Header displayName="User" initials="U" />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
