import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AlertTriangle, Briefcase, CheckCircle2, ChevronRight, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FitBar, RecommendationBadge, RequirementIcon, RiskBadge } from "./indicators";
import { fitFactors, missingRequirements, type EnrichedTender } from "@/lib/bidlens";
import { useAppState } from "@/state/app-state";
import { cn } from "@/lib/utils";

export function AnalysisPanel({
  opportunity,
  open,
  onOpenChange,
}: {
  opportunity: EnrichedTender | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const { createWorkspace, workspaceFor, log } = useAppState();
  const navigate = useNavigate();
  if (!opportunity) return null;

  const factors = fitFactors(opportunity);
  const missing = missingRequirements(opportunity);
  const hasWorkspace = Boolean(workspaceFor(opportunity.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <div className="mono-ref text-[11px] text-muted-foreground">{opportunity.reference}</div>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-agent" />
            BidLens Analysis — {opportunity.title}
          </DialogTitle>
          <DialogDescription>
            Structured assessment generated from your company profile and the published tender requirements. This is a
            recommendation, not a determination of eligibility by the procuring entity.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-[200px_1fr]">
          <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-muted/40 p-5">
            <div className="mono-ref text-5xl font-semibold text-foreground">{opportunity.score}</div>
            <div className="text-xs text-muted-foreground">out of 100</div>
            <div className="mt-3">
              <RecommendationBadge recommendation={opportunity.recommendation} />
            </div>
            <div className="mt-3 flex flex-col items-center gap-1">
              <RiskBadge level={opportunity.riskLevel} />
              <span className="text-[11px] text-muted-foreground">{opportunity.preparationEffort} preparation effort</span>
            </div>
          </div>

          <div className="space-y-3">
            {factors.map((f) => (
              <button
                key={f.key}
                onClick={() => setExpanded(expanded === f.key ? null : f.key)}
                className="w-full rounded-md border border-border p-3 text-left transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 font-medium text-foreground">
                    <ChevronRight
                      className={cn("h-3.5 w-3.5 transition-transform", expanded === f.key && "rotate-90")}
                    />
                    {f.label}
                  </span>
                  <span className="mono-ref font-semibold text-foreground">{f.value}%</span>
                </div>
                <div className="mt-2">
                  <FitBar value={f.value} />
                </div>
                {expanded === f.key && <p className="mt-2 text-xs text-muted-foreground">{f.why}</p>}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Recommendation</div>
          <p className="mt-1.5 text-sm text-foreground">
            {opportunity.recommendationNote ||
              `${opportunity.recommendation}. Fit score of ${opportunity.score} is driven mainly by ${
                opportunity.fit.category >= 80 ? "a strong category match" : "limited category alignment"
              } and ${opportunity.fit.timeline >= 80 ? "a workable submission timeline" : "a tight submission timeline"}.`}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-success/30 bg-success/5 p-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-success uppercase">
              <CheckCircle2 className="h-3.5 w-3.5" /> Strengths
            </div>
            <ul className="mt-2 space-y-1.5 text-sm">
              {(opportunity.fitNotes.positive.length
                ? opportunity.fitNotes.positive
                : ["No material strengths identified for this opportunity"]
              ).map((s) => (
                <li key={s} className="flex gap-2 text-foreground/85">
                  <span className="text-success">✓</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-warning/40 bg-warning/5 p-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-warning-foreground uppercase">
              <AlertTriangle className="h-3.5 w-3.5" /> Risks
            </div>
            <ul className="mt-2 space-y-1.5 text-sm">
              {(opportunity.fitNotes.caution.length
                ? opportunity.fitNotes.caution
                : ["No significant risks identified"]
              ).map((s) => (
                <li key={s} className="flex gap-2 text-foreground/85">
                  <span className="text-warning">⚠</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Missing or partial requirements ({missing.length})
          </div>
          <div className="mt-2 divide-y divide-border rounded-lg border border-border">
            {missing.length === 0 && (
              <div className="p-3 text-sm text-muted-foreground">All published requirements appear satisfied.</div>
            )}
            {missing.map((m) => (
              <div key={m.id} className="flex items-start gap-2.5 p-3">
                <RequirementIcon met={m.met} />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground">{m.label}</div>
                  {m.detail && <div className="text-xs text-muted-foreground">{m.detail}</div>}
                </div>
                <span className="mono-ref ml-auto text-[11px] text-muted-foreground uppercase">{m.met}</span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-md text-[11px] text-muted-foreground">
            Analysis is a read-only operation. Creating a bid workspace changes application state and requires your
            explicit confirmation.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                createWorkspace(opportunity.id);
                log(`Bid workspace created for ${opportunity.reference}`);
                toast.success("Bid workspace created");
                onOpenChange(false);
                void navigate({ to: "/workspaces/$tenderId", params: { tenderId: opportunity.id } });
              }}
            >
              <Briefcase className="h-4 w-4" />
              {hasWorkspace ? "Open Bid Workspace" : "Prepare Bid"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
