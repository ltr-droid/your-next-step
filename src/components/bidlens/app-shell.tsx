import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  LayoutDashboard,
  Search,
  Briefcase,
  Building2,
  BarChart3,
  GitCompareArrows,
  Bot,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppState } from "@/state/app-state";
import { COMPANY } from "@/data/company";
import { Toaster } from "@/components/ui/sonner";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/opportunities", label: "Opportunities", icon: Search },
  { to: "/workspaces", label: "Bid Workspaces", icon: Briefcase },
  { to: "/compare", label: "Compare", icon: GitCompareArrows },
  { to: "/intelligence", label: "Intelligence", icon: BarChart3 },
  { to: "/company", label: "Company Profile", icon: Building2 },
  { to: "/agent", label: "Agent Capabilities", icon: Bot },
] as const;

export function AppShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { state } = useAppState();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const compareCount = state.compare.length;
  const workspaceCount = Object.keys(state.workspaces).length;

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <span className="text-sm font-bold">B</span>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-sidebar-accent-foreground">BidLens</div>
            <div className="text-[11px] text-sidebar-foreground/70">Procurement intelligence</div>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 px-3 py-2">
          {NAV.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;
            const badge =
              item.to === "/compare" ? compareCount : item.to === "/workspaces" ? workspaceCount : 0;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1">{item.label}</span>
                {badge > 0 && (
                  <span className="mono-ref rounded-full bg-sidebar-primary px-1.5 py-0.5 text-[10px] text-sidebar-primary-foreground">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border px-5 py-4 text-[11px] leading-relaxed text-sidebar-foreground/60">
          Demonstration data modelled on Zimbabwe e-GP structures. Not an official government platform.
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur">
          <div className="flex flex-wrap items-center gap-3 px-5 py-3.5 lg:px-8">
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-semibold text-foreground">{title}</h1>
              {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-2">{actions}</div>
            <div className="hidden items-center gap-3 border-l border-border pl-3 lg:flex">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <div className="text-right leading-tight">
                <div className="text-xs font-medium text-foreground">{COMPANY.name}</div>
                <div className="text-[11px] text-muted-foreground">{COMPANY.location}</div>
              </div>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto border-t border-border px-3 py-1.5 md:hidden">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-md px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-muted-foreground [&.active]:bg-accent [&.active]:text-accent-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="flex-1 px-5 py-6 lg:px-8">{children}</main>
        <footer className="border-t border-border px-5 py-4 text-[11px] text-muted-foreground lg:px-8">
          BidLens is an independent procurement intelligence prototype. All tenders, entities and awards shown are
          demonstration data and are not connected to any government system.
        </footer>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}
