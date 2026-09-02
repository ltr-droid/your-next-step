import { useMemo, useState, type ReactNode } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Clock3,
  FileText,
  MessageSquarePlus,
  Save,
  Sparkles,
  StickyNote,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/bidlens/app-shell";
import { AnalysisPanel } from "@/components/bidlens/analysis-panel";
import { Countdown, FitScore, RiskBadge, StatusBadge } from "@/components/bidlens/indicators";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { rankedOpportunities } from "@/lib/bidlens";
import type { ChecklistStatus } from "@/state/app-state";
import { useAppState } from "@/state/app-state";

export const Route = createFileRoute("/workspaces/$tenderId")({
  component: WorkspaceDetailPage,
});

const checklistOptions: { value: ChecklistStatus; label: string }[] = [
  { value: "complete", label: "Complete" },
  { value: "incomplete", label: "Incomplete" },
  { value: "not_applicable", label: "Not applicable" },
];

function WorkspaceDetailPage() {
  const { tenderId } = Route.useParams();
  const navigate = useNavigate();
  const { state, workspaceFor, createWorkspace, readiness, setChecklistStatus, setChecklistNote, toggleDoc, addClarification, setNotes, setReady, log } =
    useAppState();
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [question, setQuestion] = useState("");

  const opportunity = rankedOpportunities(state.preferences).find((o) => o.id === tenderId);
  const workspace = workspaceFor(tenderId);

  if (!opportunity) {
    return (
      <AppShell title="Workspace" subtitle="This tender could not be found in the demo dataset.">
        <Card className="p-8 text-center">
          <h2 className="text-base font-semibold">Workspace not found</h2>
          <p className="mt-2 text-sm text-muted-foreground">The tender is not part of the demo procurement dataset.</p>
          <div className="mt-5">
            <Button asChild>
              <Link to="/workspaces">Back to workspaces</Link>
            </Button>
          </div>
        </Card>
      </AppShell>
    );
  }

  const pct = workspace ? readiness(workspace.tenderId) : 0;
  const timeline = useMemo(
    () => [
      { label: "Published", value: opportunity.published.toLocaleDateString("en-GB") },
      { label: "Analysis started", value: workspace?.analysisStartedAt ? new Date(workspace.analysisStartedAt).toLocaleString("en-GB") : "Not started" },
      { label: "Bid preparation", value: workspace ? "In progress" : "Not created" },
      { label: "Clarification deadline", value: `${Math.max(opportunity.daysRemaining - 3, 0)} days before closing` },
      { label: "Submission deadline", value: opportunity.closing.toLocaleDateString("en-GB") },
    ],
    [opportunity, workspace],
  );

  const groupedItems = workspace
    ? ["Company", "Technical", "Commercial"].map((group) => ({
        group,
        items: workspace.checklist.filter((item) => item.group === group),
      }))
    : [];

  if (!workspace) {
    return (
      <AppShell
        title={opportunity.reference}
        subtitle="Create a workspace to start structured bid preparation."
        actions={
          <Button
            onClick={() => {
              createWorkspace(opportunity.id);
              log(`Bid workspace created for ${opportunity.reference}`);
              toast.success("Bid workspace created");
              void navigate({ to: "/workspaces/$tenderId", params: { tenderId: opportunity.id } });
            }}
          >
            <Briefcase className="h-4 w-4" />
            Prepare Bid
          </Button>
        }
      >
        <Card className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mono-ref text-[11px] text-muted-foreground">{opportunity.reference}</div>
              <h2 className="mt-1 text-2xl font-semibold">{opportunity.title}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StatusBadge status={opportunity.displayStatus} />
                <Badge variant="outline">{opportunity.category}</Badge>
                <Countdown days={opportunity.daysRemaining} />
              </div>
            </div>
            <FitScore score={opportunity.score} size="lg" showLabel={false} />
          </div>
          <Separator className="my-5" />
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            No workspace exists yet for this opportunity. Create one to manage compliance, track documents, record
            clarification questions and monitor bid readiness.
          </p>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={`Bid workspace: ${opportunity.reference}`}
      subtitle={opportunity.title}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => setAnalysisOpen(true)}>
            <Sparkles className="h-4 w-4" />
            Analyze
          </Button>
          <Button
            variant={workspace.readyForSubmission ? "secondary" : "default"}
            onClick={() => {
              const next = !workspace.readyForSubmission;
              setReady(tenderId, next);
              log(`${next ? "Marked" : "Unmarked"} ${opportunity.reference} as ready for submission`);
              toast.success(next ? "Marked ready for submission" : "Marked not ready");
            }}
          >
            <Save className="h-4 w-4" />
            {workspace.readyForSubmission ? "Ready for submission" : "Mark Ready for Submission"}
          </Button>
        </div>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="mono-ref text-[11px] text-muted-foreground">{opportunity.reference}</div>
                <h2 className="mt-1 text-2xl font-semibold">{opportunity.title}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StatusBadge status={opportunity.displayStatus} />
                  <Badge variant="outline">{opportunity.category}</Badge>
                  <RiskBadge level={opportunity.riskLevel} />
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] uppercase text-muted-foreground">Bid readiness</div>
                <FitScore score={pct} size="lg" showLabel={false} />
                <Countdown days={opportunity.daysRemaining} />
              </div>
            </div>
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Overall preparation progress</span>
                <span className="mono-ref">{pct}%</span>
              </div>
              <Progress className="mt-2" value={pct} />
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>Estimated value: {opportunity.estimatedValue ? opportunity.estimatedValue.toLocaleString() : "Not disclosed"}</span>
              <span>Submission countdown: {opportunity.daysRemaining} days</span>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Compliance checklist</h3>
              <Badge variant="outline">{workspace.checklist.filter((c) => c.status === "complete").length} complete</Badge>
            </div>
            <div className="mt-4 space-y-5">
              {groupedItems.map(({ group, items }) => (
                <div key={group}>
                  <div className="text-xs font-semibold uppercase text-muted-foreground">{group}</div>
                  <div className="mt-3 space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="rounded-lg border border-border p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-foreground">{item.label}</div>
                            <div className="mt-1 text-[11px] text-muted-foreground">
                              Mark the current compliance status and add notes for the bid team.
                            </div>
                          </div>
                          <Select value={item.status} onValueChange={(v) => setChecklistStatus(tenderId, item.id, v as ChecklistStatus)}>
                            <SelectTrigger className="w-[160px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {checklistOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="mt-3 grid gap-2 md:grid-cols-[1fr_auto]">
                          <Input
                            value={item.note ?? ""}
                            onChange={(e) => setChecklistNote(tenderId, item.id, e.target.value)}
                            placeholder="Add a note, contact, or next action..."
                          />
                          <Button
                            variant="outline"
                            onClick={() => {
                              setChecklistStatus(tenderId, item.id, item.status === "complete" ? "incomplete" : "complete");
                              toast.success("Checklist updated");
                            }}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Toggle complete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Documents</h3>
                <Badge variant="outline">
                  {workspace.documents.filter((d) => d.attached).length}/{workspace.documents.length} attached
                </Badge>
              </div>
              <div className="mt-3 space-y-2">
                {workspace.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between gap-3 rounded-md border border-border p-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{doc.filename}</div>
                      <div className="text-[11px] text-muted-foreground">{doc.required ? "Required" : "Optional"}</div>
                    </div>
                    <Button variant={doc.attached ? "secondary" : "outline"} size="sm" onClick={() => toggleDoc(tenderId, doc.id)}>
                      {doc.attached ? "Attached" : "Attach"}
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Questions and clarifications</h3>
                <MessageSquarePlus className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-3 space-y-3">
                <Textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Enter a clarification question for the procuring entity..."
                />
                <Button
                  onClick={() => {
                    if (!question.trim()) return;
                    addClarification(tenderId, question.trim());
                    log(`Added clarification question for ${opportunity.reference}`);
                    toast.success("Clarification added");
                    setQuestion("");
                  }}
                >
                  Add question
                </Button>
              </div>
              <div className="mt-4 space-y-2">
                {workspace.clarifications.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No clarification questions yet.</p>
                ) : (
                  workspace.clarifications.map((item) => (
                    <div key={item.id} className="rounded-md border border-border p-3 text-sm">
                      <div className="font-medium text-foreground">{item.question}</div>
                      <div className="mt-1 text-[11px] text-muted-foreground">
                        {item.asked ? "Asked" : "Draft"} · {new Date(item.createdAt).toLocaleString("en-GB")}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          <Card className="p-5">
            <h3 className="text-sm font-semibold">Bid notes</h3>
            <Textarea
              className="mt-3 min-h-[140px]"
              value={workspace.notes}
              onChange={(e) => setNotes(tenderId, e.target.value)}
              placeholder="Capture internal notes, pricing assumptions, and follow-up tasks..."
            />
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="text-sm font-semibold">Timeline</h3>
            <div className="mt-4 space-y-3">
              {timeline.map((item, index) => (
                <div key={item.label} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-primary" />
                    {index < timeline.length - 1 && <div className="mt-1 h-full w-px bg-border" />}
                  </div>
                  <div className="pb-3">
                    <div className="text-sm font-medium text-foreground">{item.label}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold">Progress summary</h3>
            <div className="mt-3 grid gap-3 text-sm">
              <SummaryRow label="Checklist items complete" value={`${workspace.checklist.filter((c) => c.status === "complete").length}/${workspace.checklist.length}`} />
              <SummaryRow label="Required docs attached" value={`${workspace.documents.filter((d) => d.required && d.attached).length}/${workspace.documents.filter((d) => d.required).length}`} />
              <SummaryRow label="Clarification questions" value={workspace.clarifications.length} />
            </div>
          </Card>

          <Card className="border-agent/30 bg-agent/5 p-5">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-4 w-4 text-agent" />
              <div>
                <h3 className="text-sm font-semibold">Agent-aware workflow</h3>
                <p className="mt-1 text-xs leading-6 text-muted-foreground">
                  This workspace is structured so an agent can update checklist items, attach documents and prepare a
                  bid package, while the human remains the only one able to mark it ready for submission.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold">Opportunity shortcut</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/opportunities/$tenderId" params={{ tenderId: opportunity.id }}>
                  View opportunity
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={() => setAnalysisOpen(true)}>
                Open analysis
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setReady(tenderId, false);
                  toast.success("Marked not ready");
                }}
              >
                <Trash2 className="h-4 w-4" />
                Reset ready state
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <AnalysisPanel opportunity={opportunity} open={analysisOpen} onOpenChange={setAnalysisOpen} />
    </AppShell>
  );
}

function SummaryRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-border bg-muted/30 px-3 py-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}
