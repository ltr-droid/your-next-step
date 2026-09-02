import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, GitCompareArrows, MinusCircle, Sparkles, X } from "lucide-react";
import { AppShell } from "@/components/bidlens/app-shell";
import { Countdown, FitScore, RecommendationBadge, RiskBadge } from "@/components/bidlens/indicators";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatMoney, rankedOpportunities } from "@/lib/bidlens";
import { useAppState } from "@/state/app-state";

export const Route = createFileRoute("/compare")({
  component: ComparePage,
});

function ComparePage() {
  const { state, clearCompare, toggleCompare } = useAppState();
  const opportunities = rankedOpportunities(state.preferences);
  const selected = opportunities.filter((o) => state.compare.includes(o.id));
  const fallback = opportunities.filter((o) => o.score >= 70).slice(0, 3);
  const items = selected.length > 0 ? selected : fallback;
  const topPick = [...items].sort((a, b) => b.score - a.score)[0];

  return (
    <AppShell
      title="Compare Opportunities"
      subtitle="Compare two or three tenders side by side before you commit preparation time."
      actions={
        <Button variant="outline" onClick={clearCompare} disabled={state.compare.length === 0}>
          <X className="h-4 w-4" />
          Clear compare
        </Button>
      }
    >
      {items.length === 0 ? (
        <Card className="p-10 text-center">
          <GitCompareArrows className="mx-auto h-8 w-8 text-muted-foreground" />
          <h2 className="mt-3 text-lg font-semibold">No opportunities selected</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Add tenders from the Opportunities page or open a tender and choose Compare.
          </p>
          <div className="mt-5">
            <Button asChild>
              <Link to="/opportunities">Browse opportunities</Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-3">
            {items.map((item) => (
              <Card key={item.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="mono-ref text-[11px] text-muted-foreground">{item.reference}</div>
                    <h3 className="mt-1 text-base font-semibold">{item.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="outline">{item.entityName}</Badge>
                      <Badge variant="outline">{item.category}</Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => toggleCompare(item.id)} title="Remove from compare">
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <FitScore score={item.score} showLabel={false} />
                  <RecommendationBadge recommendation={item.recommendation} />
                </div>
                <div className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                  <div className="flex justify-between gap-3">
                    <span>Closing</span>
                    <Countdown days={item.daysRemaining} />
                  </div>
                  <div className="flex justify-between gap-3">
                    <span>Value</span>
                    <span className="mono-ref">{formatMoney(item.estimatedValue)}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span>Preparation</span>
                    <span>{item.preparationEffort}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span>Risk</span>
                    <RiskBadge level={item.riskLevel} />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead />
                  {items.map((item) => (
                    <TableHead key={item.id} className="min-w-[180px]">
                      {item.reference}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <ComparisonRow label="Fit score" values={items.map((item) => `${item.score}%`)} strong />
                <ComparisonRow label="Category match" values={items.map((item) => `${item.fit.category}%`)} />
                <ComparisonRow label="Eligibility" values={items.map((item) => `${item.fit.eligibility}%`)} />
                <ComparisonRow label="Estimated value" values={items.map((item) => formatMoney(item.estimatedValue))} />
                <ComparisonRow label="Closing date" values={items.map((item) => item.closing.toLocaleDateString("en-GB"))} />
                <ComparisonRow label="Preparation effort" values={items.map((item) => item.preparationEffort)} />
                <ComparisonRow
                  label="Missing documents"
                  values={items.map((item) => `${item.documents.filter((d) => d.required && d.status !== "Available").length}`)}
                />
                <ComparisonRow label="Risk" values={items.map((item) => item.riskLevel)} />
                <ComparisonRow label="Buyer" values={items.map((item) => item.entityName)} />
                <ComparisonRow label="Recommendation" values={items.map((item) => item.recommendation)} />
              </TableBody>
            </Table>
          </Card>

          {topPick && (
            <Card className="border-agent/30 bg-agent/5 p-5">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-4 w-4 text-agent" />
                <div>
                  <h3 className="text-sm font-semibold">Overall recommendation</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {topPick.title} is the strongest near-term bid in this comparison set because it combines the
                    highest fit score with the lowest preparation burden.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild>
                  <Link to="/opportunities/$tenderId" params={{ tenderId: topPick.id }}>
                    Open top pick
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/workspaces/$tenderId" params={{ tenderId: topPick.id }}>
                    Prepare bid workspace
                  </Link>
                </Button>
              </div>
            </Card>
          )}

          {selected.length === 0 && (
            <Card className="p-5">
              <h3 className="text-sm font-semibold">Suggested shortlist</h3>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                {fallback.map((item) => (
                  <Link
                    key={item.id}
                    to="/opportunities/$tenderId"
                    params={{ tenderId: item.id }}
                    className="rounded-md border border-border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="text-xs text-muted-foreground">{item.reference}</div>
                    <div className="mt-1 text-sm font-medium">{item.title}</div>
                    <div className="mt-2 flex items-center justify-between">
                      <FitScore score={item.score} size="sm" showLabel={false} />
                      <Button size="sm" variant="ghost" onClick={(e) => {
                        e.preventDefault();
                        toggleCompare(item.id);
                      }}>
                        Compare
                      </Button>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </AppShell>
  );
}

function ComparisonRow({
  label,
  values,
  strong = false,
}: {
  label: string;
  values: string[];
  strong?: boolean;
}) {
  return (
    <TableRow>
      <TableCell className={strong ? "font-medium text-foreground" : "text-muted-foreground"}>{label}</TableCell>
      {values.map((value, index) => (
        <TableCell key={`${label}-${index}`} className={strong ? "font-medium" : undefined}>
          {index === 0 && value === "0%" ? <CheckCircle2 className="h-4 w-4 text-success" /> : value}
        </TableCell>
      ))}
    </TableRow>
  );
}
