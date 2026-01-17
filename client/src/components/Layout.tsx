import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Upload as UploadIcon, 
  Database, 
  BarChart2, 
  Menu,
  ShieldCheck,
  Bell,
  Search
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Data Records", icon: Database, href: "/records" },
  { label: "Analytics", icon: BarChart2, href: "/analytics" },
  { label: "Upload Data", icon: UploadIcon, href: "/upload" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const NavContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg tracking-wide">UIDAI VERIFY</h1>
            <p className="text-xs text-slate-400">Data Analytics Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden",
            location === item.href 
              ? "bg-primary text-white shadow-lg shadow-primary/25" 
              : "text-slate-400 hover:text-white hover:bg-white/5"
          )}>
            <item.icon className={cn("h-5 w-5", location === item.href ? "animate-pulse" : "")} />
            {item.label}
            {location === item.href && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]" />
            )}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-xl p-4">
          <p className="text-xs text-slate-400 mb-2">System Status</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-medium text-emerald-400">Operational</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 fixed inset-y-0 left-0 z-50">
        <NavContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="p-0 w-64 border-r-slate-800">
          <NavContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-border sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="lg:hidden">
              <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
            </div>
            <h2 className="text-xl font-display font-semibold text-slate-800 hidden sm:block">
              {NAV_ITEMS.find(n => n.href === location)?.label || "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                placeholder="Search..." 
                className="pl-9 pr-4 py-2 rounded-full border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-64 transition-all"
              />
            </div>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-slate-500" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </Button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white font-bold text-xs shadow-md">
              AD
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
