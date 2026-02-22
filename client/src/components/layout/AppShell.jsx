import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileNav } from "./MobileNav";
import { cn } from "../../lib/utils";

export function AppShell({ children, breadcrumbs, className = "" }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className={cn("min-h-screen flex flex-col bg-background", className)}>
      <div className="flex flex-1 min-h-0">
        {/* Desktop sidebar - hidden on mobile */}
        <div className="hidden lg:block shrink-0">
          <Sidebar collapsed={sidebarCollapsed} onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Mobile drawer overlay */}
        {sidebarOpen && (
          <>
            <div
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
            <div className="lg:hidden fixed inset-y-0 left-0 z-50 w-56">
              <Sidebar collapsed={false} onClose={() => setSidebarOpen(false)} />
            </div>
          </>
        )}

        <div className="flex-1 flex flex-col min-w-0">
          <Topbar onMenuClick={() => setSidebarOpen(true)} breadcrumbs={breadcrumbs} />
          <main className="flex-1 overflow-auto p-4 lg:p-6 pb-24 lg:pb-6">
            {children}
          </main>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
