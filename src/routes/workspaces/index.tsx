import { useState, type ElementType, type ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Briefcase, CheckCircle2, Clock3, FileText, PencilLine, Play, Sparkles } from "lucide-react";
import { AppShell } from "@/components/bidlens/app-shell";
import { Pagination } from "@/components/bidlens/pagination";
import { Countdown, FitScore, StatusBadge } from "@/components/bidlens/indicators";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatMoney, rankedOpportunities } from "@/lib/bidlens";
import { useAppState } from "@/state/app-state";

export const Route = createFileRoute("/workspaces/")({
  component: WorkspacesIndex,
});

function WorkspacesIndex() {
  const { state, readiness } = useAppState();
  const [page, setPage] = useState(1);
  const opportunities = rankedOpportunities(state.preferences);
  const workspaces = Object.values(state.workspaces)
    .map((workspace) => ({
      workspace,
      tender: opportunities.find((o) => o.id === workspace.tenderId),
    }))
    .filter((entry): entry is { workspace: (typeof state.workspaces)[string]; tender: NonNullable<(typeof opportunities)[number]> } => Boolean(entry.tender));

  const avgReadiness =
    workspaces.length === 0 ? 0 : Math.round(workspaces.reduce((sum, item) => sum + readiness(item.workspace.tenderId), 0) / workspaces.length);
  const readyCount = workspaces.filter((item) => readiness(item.workspace.tenderId) >= 80).length;
  const pendingCount = workspaces.filter((item) => !item.workspace.readyForSubmission).length;
  const pageSize = 4;
  const pageCount = Math.max(1, Math.ceil(workspaces.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleWorkspaces = workspaces.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <AppShell
      title="Bid Workspaces"
      subtitle="Prepare, track and complete bids without leaving the procurement workspace."
      actions={
        <Button asChild>
          <Link to="/opportunities">
            <Play className="h-4 w-4" />
            Find more opportunities
          </Link>
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Active workspaces" value={workspaces.length} icon={Briefcase} />
        <Metric label="Average readiness" value={`${avgReadiness}%`} icon={Sparkles} />
        <Metric label="Ready to review" value={readyCount} icon={CheckCircle2} />
        <Metric label="Needs work" value={pendingCount} icon={Clock3} />
      </div>

      {workspaces.length === 0 ? (
        <Card className="mt-6 p-10 text-center">
          <Briefcase className="mx-auto h-8 w-8 text-muted-foreground" />
          <h2 className="mt-3 text-lg font-semibold">No bid workspaces yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Analyze an opportunity and choose Prepare Bid to create a structured compliance workspace.
          </p>
          <div className="mt-5">
            <Button asChild>
              <Link to="/opportunities">Browse opportunities</Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {visibleWorkspaces.map(({ workspace, tender }) => {
            const pct = readiness(workspace.tenderId);
            const attached = workspace.documents.filter((d) => d.attached).length;
            const completed = workspace.checklist.filter((c) => c.status === "complete").length;
            return (
              <Card key={workspace.tenderId} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="mono-ref text-[11px] text-muted-foreground">{tender.reference}</div>
                    <h3 className="mt-1 text-base font-semibold">{tender.title}</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <StatusBadge status={tender.displayStatus} />
                      <Badge variant="outline">{tender.category}</Badge>
                      <Countdown days={tender.daysRemaining} />
                    </div>
                  </div>
                  <FitScore score={pct} showLabel={false} />
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Bid readiness</span>
                    <span className="mono-ref">{pct}%</span>
                  </div>
                  <Progress className="mt-2" value={pct} />
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                  <Stat label="Checklist" value={`${completed}/${workspace.checklist.length}`} />
                  <Stat label="Documents" value={`${attached}/${workspace.documents.length}`} />
                  <Stat label="Clarifications" value={workspace.clarifications.length} />
                </div>

                <div className="mt-4 rounded-md border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
                  {workspace.notes ? workspace.notes : "No bid notes captured yet."}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button asChild size="sm">
                    <Link to="/workspaces/$tenderId" params={{ tenderId: tender.id }}>
                      Open workspace
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/opportunities/$tenderId" params={{ tenderId: tender.id }}>
                      View opportunity
                    </Link>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      <Pagination page={currentPage} pageSize={pageSize} total={workspaces.length} onPageChange={setPage} />

      <Card className="mt-6 border-agent/30 bg-agent/5 p-5">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-4 w-4 text-agent" />
          <div>
            <h3 className="text-sm font-semibold">Human approval model</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Workspaces can be prepared and updated by an agent, but legal or state-changing actions always stay
              with the human reviewer.
            </p>
          </div>
        </div>
      </Card>
    </AppShell>
  );
}

function Metric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: ElementType;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
          <div className="mt-1 text-2xl font-semibold">{value}</div>
        </div>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-muted/30 p-3 text-center">
      <div className="text-[11px] uppercase text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}
