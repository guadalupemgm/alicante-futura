import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import AuthGuard from "@/components/layout/AuthGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="admin-shell">
        <Sidebar />
        <div className="admin-main">
          <Header />
          <div className="admin-content">{children}</div>
        </div>
      </div>
    </AuthGuard>
  );
}