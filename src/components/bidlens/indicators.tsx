import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, CircleDashed, MinusCircle, Clock } from "lucide-react";
import type { TenderStatus } from "@/data/types";
import type { Recommendation, Urgency } from "@/lib/bidlens";

export function StatusBadge({ status }: { status: TenderStatus }) {
  const map: Record<TenderStatus, string> = {
    Open: "bg-success/10 text-success border-success/30",
    "Closing Soon": "bg-warning/15 text-warning-foreground border-warning/40",
    Closed: "bg-muted text-muted-foreground border-border",
    Awarded: "bg-info/10 text-info border-info/30",
    Cancelled: "bg-destructive/10 text-destructive border-destructive/30",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap",
        map[status],
      )}
    >
      {status}
    </span>
  );
}

export function FitScore({
  score,
  size = "md",
  showLabel = true,
}: {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}) {
  const tone =
    score >= 85
      ? "text-success border-success/40 bg-success/10"
      : score >= 65
        ? "text-info border-info/40 bg-info/10"
        : score >= 45
          ? "text-warning-foreground border-warning/50 bg-warning/15"
          : "text-destructive border-destructive/40 bg-destructive/10";
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-11 w-11 text-sm",
    lg: "h-20 w-20 text-2xl",
  } as const;
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "mono-ref flex items-center justify-center rounded-full border-2 font-semibold",
          sizes[size],
          tone,
        )}
      >
        {score}
      </div>
      {showLabel && <span className="text-xs text-muted-foreground">Fit score</span>}
    </div>
  );
}

export function FitBar({ value }: { value: number }) {
  const tone =
    value >= 85 ? "bg-success" : value >= 65 ? "bg-info" : value >= 45 ? "bg-warning" : "bg-destructive";
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div className={cn("h-full rounded-full transition-all", tone)} style={{ width: `${value}%` }} />
    </div>
  );
}

export function Countdown({ days, className }: { days: number; className?: string }) {
  const u: Urgency = days < 0 ? "closed" : days <= 2 ? "critical" : days <= 4 ? "urgent" : days <= 7 ? "soon" : "normal";
  const tone: Record<Urgency, string> = {
    critical: "text-destructive",
    urgent: "text-warning-foreground",
    soon: "text-warning-foreground",
    normal: "text-muted-foreground",
    closed: "text-muted-foreground",
  };
  const label =
    days < 0 ? "Closed" : days === 0 ? "Closes today" : days === 1 ? "1 day left" : `${days} days left`;
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", tone[u], className)}>
      <Clock className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

export function RecommendationBadge({ recommendation }: { recommendation: Recommendation }) {
  const map: Record<Recommendation, string> = {
    "Strongly Pursue": "bg-success text-success-foreground",
    Consider: "bg-info text-info-foreground",
    "Weak Fit": "bg-warning text-warning-foreground",
    "Do Not Pursue": "bg-destructive text-destructive-foreground",
  };
  return <Badge className={cn("rounded-full px-3", map[recommendation])}>{recommendation}</Badge>;
}

export function RiskBadge({ level }: { level: "Low" | "Medium" | "High" }) {
  const map = {
    Low: "bg-success/10 text-success border-success/30",
    Medium: "bg-warning/15 text-warning-foreground border-warning/40",
    High: "bg-destructive/10 text-destructive border-destructive/30",
  } as const;
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium", map[level])}>
      {level} risk
    </span>
  );
}

export function RequirementIcon({ met }: { met: "met" | "partial" | "missing" }) {
  if (met === "met") return <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />;
  if (met === "partial") return <CircleDashed className="h-4 w-4 shrink-0 text-warning" />;
  return <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />;
}

export function NotApplicableIcon() {
  return <MinusCircle className="h-4 w-4 shrink-0 text-muted-foreground" />;
}

export function AgentTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-agent/40 bg-agent/10 px-2 py-0.5 text-[11px] font-medium text-agent">
      {children}
    </span>
  );
}
