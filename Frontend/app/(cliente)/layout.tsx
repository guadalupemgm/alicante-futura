import Header from "@/components/layout/Header";
import SidebarCliente from "@/components/layout/SidebarCliente";
import AuthGuardCliente from "@/components/layout/AuthGuardCliente";

export default function ClienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuardCliente>
      <div className="admin-shell">
        <SidebarCliente />
        <div className="admin-main">
          <Header />
          <div className="admin-content">{children}</div>
        </div>
      </div>
    </AuthGuardCliente>
  );
}