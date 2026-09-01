import { Link } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck, GitCompareArrows, Sparkles, ArrowRight, MapPin, Building2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Countdown, FitScore, StatusBadge } from "./indicators";
import { formatDate, formatMoney, type EnrichedTender } from "@/lib/bidlens";
import { useAppState } from "@/state/app-state";
import { cn } from "@/lib/utils";

export function OpportunityCard({
  opportunity,
  onAnalyze,
  compact = false,
}: {
  opportunity: EnrichedTender;
  onAnalyze?: (o: EnrichedTender) => void;
  compact?: boolean;
}) {
  const { isSaved, toggleSave, toggleCompare, state } = useAppState();
  const saved = isSaved(opportunity.id);
  const inCompare = state.compare.includes(opportunity.id);

  return (
    <Card className="flex h-full flex-col gap-4 p-5 transition-shadow hover:shadow-panel">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mono-ref text-[11px] tracking-wide text-muted-foreground">{opportunity.reference}</div>
          <Link
            to="/opportunities/$tenderId"
            params={{ tenderId: opportunity.id }}
            className="mt-1 block text-[15px] leading-snug font-semibold text-foreground hover:text-primary"
          >
            {opportunity.title}
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              {opportunity.entityName}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {opportunity.location}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <FitScore score={opportunity.score} showLabel={false} />
          <span className="text-[10px] text-muted-foreground">Fit</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 rounded-md border border-border bg-muted/40 px-3 py-2.5 text-xs">
        <div>
          <div className="text-[10px] tracking-wide text-muted-foreground uppercase">Category</div>
          <div className="mt-0.5 truncate font-medium text-foreground">{opportunity.category}</div>
        </div>
        <div>
          <div className="text-[10px] tracking-wide text-muted-foreground uppercase">Closing</div>
          <div className="mono-ref mt-0.5 font-medium text-foreground">{formatDate(opportunity.closing)}</div>
        </div>
        <div>
          <div className="text-[10px] tracking-wide text-muted-foreground uppercase">Est. value</div>
          <div className="mono-ref mt-0.5 font-medium text-foreground">{formatMoney(opportunity.estimatedValue)}</div>
        </div>
      </div>

      {!compact && (
        <ul className="space-y-1 text-xs">
          {opportunity.fitNotes.positive.slice(0, 3).map((p) => (
            <li key={p} className="flex gap-1.5 text-foreground/80">
              <span className="text-success">✓</span>
              {p}
            </li>
          ))}
          {opportunity.fitNotes.caution.slice(0, 2).map((p) => (
            <li key={p} className="flex gap-1.5 text-foreground/80">
              <span className="text-warning">⚠</span>
              {p}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-2">
          <StatusBadge status={opportunity.displayStatus} />
          <Countdown days={opportunity.daysRemaining} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={saved ? "secondary" : "outline"}
          onClick={() => {
            toggleSave(opportunity.id);
            toast.success(saved ? "Removed from saved" : "Opportunity saved");
          }}
        >
          {saved ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
          {saved ? "Saved" : "Save"}
        </Button>
        <Button
          size="sm"
          variant={inCompare ? "secondary" : "outline"}
          onClick={() => {
            toggleCompare(opportunity.id);
            toast.success(inCompare ? "Removed from comparison" : "Added to comparison");
          }}
          className={cn(inCompare && "border-primary/40")}
        >
          <GitCompareArrows className="h-3.5 w-3.5" />
          Compare
        </Button>
        {onAnalyze && (
          <Button size="sm" variant="outline" onClick={() => onAnalyze(opportunity)}>
            <Sparkles className="h-3.5 w-3.5" />
            Analyze
          </Button>
        )}
        <Button size="sm" asChild>
          <Link to="/opportunities/$tenderId" params={{ tenderId: opportunity.id }}>
            View
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
