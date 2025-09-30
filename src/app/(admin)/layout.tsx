import type { Metadata } from "next";

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
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            {/* Navigation items can be added here */}
          </div>
        </div>
      </header>
      <div className="flex">
        <aside className="w-64 border-r bg-muted/40 min-h-[calc(100vh-4rem)]">
          <nav className="p-4"> 
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-muted-foreground mb-4">
                Navigation
              </h2>
              {/* Navigation links can be added here */}
            </div>
          </nav>
        </aside>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
