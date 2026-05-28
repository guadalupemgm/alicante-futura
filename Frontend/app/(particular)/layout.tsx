"use client";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import AuthGuard from "@/components/layout/AuthGuard";

export default function ParticularLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="admin-shell">
        <Sidebar />
        <div className="admin-main">
          <Header role="particular" />
          <main className="admin-content">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}