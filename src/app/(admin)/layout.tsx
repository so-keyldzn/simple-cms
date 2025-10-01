import type { Metadata } from "next";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/features/admin/components/admin-sidebar";
import { Separator } from "@/components/ui/separator";
import { ImpersonationBanner } from "@/features/admin/components/impersonation-banner";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin panel for managing the application",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
   
      <AdminSidebar />
      <SidebarInset>
      <ImpersonationBanner />
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
    
          <Separator orientation="vertical" className="mr-2 h-4" />

          <h1 className="text-lg font-semibold">Admin Dashboard</h1>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
