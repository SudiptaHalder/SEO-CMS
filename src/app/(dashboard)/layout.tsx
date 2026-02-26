import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { SidebarProvider } from "@/components/dashboard/Sidebar";
import Sidebar from "@/components/dashboard/Sidebar";
import MainContent from "./MainContent";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <Sidebar user={session.user} />
        <MainContent>{children}</MainContent>
      </div>
    </SidebarProvider>
  );
}
