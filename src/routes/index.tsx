import { useState, type ElementType } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Bookmark, Briefcase, Flame, Sparkles, Target, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/bidlens/app-shell";
import { OpportunityCard } from "@/components/bidlens/opportunity-card";
import { AnalysisPanel } from "@/components/bidlens/analysis-panel";
import { Countdown, FitScore, StatusBadge } from "@/components/bidlens/indicators";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppState } from "@/state/app-state";
import {
  categoryCounts,
  entityCounts,
  formatDate,
  formatMoney,
  openOpportunities,
  valueBands,
  type EnrichedTender,
} from "@/lib/bidlens";
import { AWARDS } from "@/data/awards";
import { COMPANY } from "@/data/company";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BidLens Dashboard - Procurement Intelligence for Suppliers" },
      {
        name: "description",
        content:
          "See which public procurement opportunities to bid on: fit scores, deadlines and bid readiness in one supplier dashboard.",
      },
      { property: "og:title", content: "BidLens Dashboard - Procurement Intelligence for Suppliers" },
      {
        property: "og:description",
        content: "Discover, analyze and prepare public procurement bids with fit scoring and compliance tracking.",
      },
    ],
  }),
  component: Dashboard,
});

function MetricCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: number | string;
  icon: ElementType;
  hint?: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</div>
          <div className="mono-ref mt-1.5 text-3xl font-semibold text-foreground">{value}</div>
          {hint && <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>}
        </div>
        <div className="rounded-md bg-accent p-2 text-accent-foreground">
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </Card>
  );
}

function BarList({ data, unit = "" }: { data: { name: string; count: number }[]; unit?: string }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="space-y-2.5">
      {data.map((d) => (
        <div key={d.name}>
          <div className="flex items-center justify-between text-xs">
            <span className="truncate text-foreground/85">{d.name}</span>
            <span className="mono-ref text-muted-foreground">
              {d.count}
              {unit}
            </span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${(d.count / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Dashboard() {
  const { state } = useAppState();
  const [analyzing, setAnalyzing] = useState<EnrichedTender | null>(null);
  const open = openOpportunities(state.preferences);
  const relevant = open.filter((o) => o.score >= 55);
  const closingWeek = open.filter((o) => o.daysRemaining <= 7);
  const highFit = open.filter((o) => o.score >= 85);
  const recommended = relevant.slice(0, 4);
  const recentAwards = [...AWARDS].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  return (
    <AppShell
      title="Dashboard"
      subtitle={`What should ${COMPANY.name} bid on this week?`}
      actions={
        <Button asChild size="sm">
          <Link to="/opportunities">
            Browse opportunities
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Relevant opportunities" value={relevant.length} icon={Target} hint="Fit score 55 or above" />
        <MetricCard label="Closing this week" value={closingWeek.length} icon={Flame} hint="Within 7 days" />
        <MetricCard label="High fit" value={highFit.length} icon={TrendingUp} hint="Fit score 85+" />
        <MetricCard label="Saved" value={state.saved.length} icon={Bookmark} />
        <MetricCard label="Bid workspaces" value={Object.keys(state.workspaces).length} icon={Briefcase} />
      </div>

      <section className="mt-8">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">Recommended opportunities</h2>
            <p className="text-xs text-muted-foreground">
              Ranked by BidLens fit score against your capabilities, categories and bid preferences.
            </p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/opportunities">View all</Link>
          </Button>
        </div>
        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
          {recommended.map((o) => (
            <OpportunityCard key={o.id} opportunity={o} onAnalyze={setAnalyzing} />
          ))}
        </div>
      </section>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Closing soon</h2>
              <p className="text-xs text-muted-foreground">Tenders closing in the next 7 days</p>
            </div>
            <span className="mono-ref text-xs text-muted-foreground">{closingWeek.length} tenders</span>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Opportunity</TableHead>
                <TableHead>Closing</TableHead>
                <TableHead className="text-right">Fit</TableHead>
                <TableHead className="text-right">Remaining</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {closingWeek
                .sort((a, b) => a.daysRemaining - b.daysRemaining)
                .map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="mono-ref text-xs text-muted-foreground">{o.reference}</TableCell>
                    <TableCell className="max-w-[280px]">
                      <Link
                        to="/opportunities/$tenderId"
                        params={{ tenderId: o.id }}
                        className="line-clamp-1 text-sm font-medium hover:text-primary"
                      >
                        {o.title}
                      </Link>
                      <div className="text-[11px] text-muted-foreground">{o.entityName}</div>
                    </TableCell>
                    <TableCell className="mono-ref text-xs">{formatDate(o.closing)}</TableCell>
                    <TableCell className="text-right">
                      <span className="mono-ref text-sm font-semibold">{o.score}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Countdown days={o.daysRemaining} />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold text-foreground">Active bid workspaces</h2>
          <p className="text-xs text-muted-foreground">Preparation in progress</p>
          <div className="mt-4 space-y-3">
            {Object.keys(state.workspaces).length === 0 && (
              <p className="rounded-md border border-dashed border-border p-4 text-xs text-muted-foreground">
                No bid workspaces yet. Analyze an opportunity and choose "Prepare Bid".
              </p>
            )}
            {Object.values(state.workspaces).map((w) => {
              const o = open.find((x) => x.id === w.tenderId) ?? recommended[0];
              if (!o) return null;
              return <WorkspaceMini key={w.tenderId} o={o} />;
            })}
          </div>
        </Card>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-base font-semibold text-foreground">Procurement activity</h2>
        <div className="grid gap-4 xl:grid-cols-4">
          <Card className="p-5">
            <h3 className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Opportunities by category
            </h3>
            <BarList data={categoryCounts(state.preferences).slice(0, 6)} />
          </Card>
          <Card className="p-5">
            <h3 className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Opportunities by entity
            </h3>
            <BarList data={entityCounts(state.preferences).slice(0, 6)} />
          </Card>
          <Card className="p-5">
            <h3 className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Value distribution
            </h3>
            <BarList data={valueBands(state.preferences)} />
          </Card>
          <Card className="p-5">
            <h3 className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Recent awards</h3>
            <ul className="space-y-3">
              {recentAwards.map((a) => (
                <li key={a.id} className="text-xs">
                  <div className="font-medium text-foreground">{a.tender}</div>
                  <div className="text-muted-foreground">
                    {a.supplier} · <span className="mono-ref">{formatMoney(a.value)}</span> · {a.date}
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      <Card className="mt-8 flex flex-wrap items-center justify-between gap-4 border-agent/30 bg-agent/5 p-5">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-4 w-4 text-agent" />
          <div>
            <h3 className="text-sm font-semibold text-foreground">This workspace is agent-operable</h3>
            <p className="mt-0.5 max-w-2xl text-xs text-muted-foreground">
              Every workflow on this dashboard - discovery, investigation, comparison and bid preparation - is exposed
              as a high-level structured capability an AI agent can call, with human approval required for any change
              of state.
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/agent">View agent capabilities</Link>
        </Button>
      </Card>

      <AnalysisPanel opportunity={analyzing} open={Boolean(analyzing)} onOpenChange={(v) => !v && setAnalyzing(null)} />
    </AppShell>
  );
}

function WorkspaceMini({ o }: { o: EnrichedTender }) {
  const { readiness } = useAppState();
  const pct = readiness(o.id);
  return (
    <Link
      to="/workspaces/$tenderId"
      params={{ tenderId: o.id }}
      className="block rounded-md border border-border p-3 transition-colors hover:bg-muted/50"
    >
      <div className="flex items-center justify-between">
        <span className="mono-ref text-[11px] text-muted-foreground">{o.reference}</span>
        <StatusBadge status={o.displayStatus} />
      </div>
      <div className="mt-1 line-clamp-1 text-sm font-medium text-foreground">{o.title}</div>
      <div className="mt-2 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
        </div>
        <span className="mono-ref text-xs font-medium text-foreground">{pct}%</span>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <Countdown days={o.daysRemaining} />
        <FitScore score={o.score} size="sm" showLabel={false} />
      </div>
    </Link>
  );
}
