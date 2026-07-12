"use server";
import * as React from "react";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { AppChatPanel } from "@/components/layout/app-chat-panel";

// Auth is enforced by middleware.ts — no redirect needed here.
// This layout can safely be a server component that reads user data.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let displayName = "User";
  let initials = "U";

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      displayName = user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "User";
      initials = displayName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
  } catch {
    // Middleware handles auth; layout continues gracefully
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <AppChatPanel />
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Header displayName={displayName} initials={initials} />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
