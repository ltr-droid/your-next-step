import { useEffect, useMemo, useState, type ElementType } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, Building2, CalendarDays, Landmark, Sparkles } from "lucide-react";
import { AppShell } from "@/components/bidlens/app-shell";
import { Pagination } from "@/components/bidlens/pagination";
import { Countdown, FitScore } from "@/components/bidlens/indicators";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AWARDS } from "@/data/awards";
import { ENTITIES } from "@/data/entities";
import { formatMoney, rankedOpportunities } from "@/lib/bidlens";
import { useAppState } from "@/state/app-state";

export const Route = createFileRoute("/intelligence")({
  component: IntelligencePage,
});

function IntelligencePage() {
  const { state } = useAppState();
  const opportunities = rankedOpportunities(state.preferences);
  const [entityId, setEntityId] = useState(ENTITIES[0]?.id ?? "zpc");

  const entity = ENTITIES.find((item) => item.id === entityId) ?? ENTITIES[0];
  const entityAwards = AWARDS.filter((award) => award.entityId === entityId).sort((a, b) => b.date.localeCompare(a.date));
  const entityOpps = opportunities.filter((o) => o.entityId === entityId);
  const [opportunityPage, setOpportunityPage] = useState(1);
  const [awardPage, setAwardPage] = useState(1);
  const opportunityPageSize = 4;
  const awardPageSize = 6;
  const opportunityPageCount = Math.max(1, Math.ceil(entityOpps.length / opportunityPageSize));
  const awardPageCount = Math.max(1, Math.ceil(entityAwards.length / awardPageSize));
  const currentOpportunityPage = Math.min(opportunityPage, opportunityPageCount);
  const currentAwardPage = Math.min(awardPage, awardPageCount);
  const visibleOpps = entityOpps.slice(
    (currentOpportunityPage - 1) * opportunityPageSize,
    currentOpportunityPage * opportunityPageSize,
  );
  const visibleAwards = entityAwards.slice((currentAwardPage - 1) * awardPageSize, currentAwardPage * awardPageSize);

  useEffect(() => {
    setOpportunityPage(1);
    setAwardPage(1);
  }, [entityId]);

  const metrics = useMemo(() => {
    return {
      tenders: entityOpps.length,
      categories: new Set(entityOpps.map((o) => o.category)).size,
      awards: entityAwards.length,
      averageValue:
        entityOpps.length === 0
          ? 0
          : Math.round(entityOpps.reduce((sum, o) => sum + (o.estimatedValue ?? 0), 0) / entityOpps.length),
    };
  }, [entityOpps, entityAwards]);

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    entityOpps.forEach((o) => map.set(o.category, (map.get(o.category) ?? 0) + 1));
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [entityOpps]);

  const yearGroups = useMemo(() => {
    const map = new Map<string, typeof entityAwards>();
    visibleAwards.forEach((award) => {
      const year = award.date.slice(0, 4);
      map.set(year, [...(map.get(year) ?? []), award]);
    });
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [visibleAwards]);

  return (
    <AppShell
      title="Intelligence"
      subtitle="Buyer intelligence and market overview for the demo procurement set."
      actions={
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{entity?.name}</span>
        </div>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
        <Card className="h-fit p-5">
          <h2 className="text-sm font-semibold">Buyer intelligence</h2>
          <div className="mt-4">
            <Select value={entityId} onValueChange={setEntityId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENTITIES.map((buyer) => (
                  <SelectItem key={buyer.id} value={buyer.id}>
                    {buyer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="mt-4 text-xs leading-6 text-muted-foreground">{entity?.about}</p>

          <div className="mt-5 space-y-3">
            <MiniStat label="Historical tenders" value={entity?.historicalTenders ?? 0} icon={BarChart3} />
            <MiniStat label="Average tender size" value={formatMoney(entity?.averageTenderValue ?? null)} icon={Landmark} />
            <MiniStat label="Recent awards" value={entityAwards.length} icon={CalendarDays} />
          </div>
        </Card>

        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label="Tenders tracked" value={metrics.tenders} />
            <Metric label="Distinct categories" value={metrics.categories} />
            <Metric label="Historical awards" value={metrics.awards} />
            <Metric label="Average value" value={formatMoney(metrics.averageValue)} />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card className="p-5">
              <h3 className="text-sm font-semibold">Market overview</h3>
              <div className="mt-4 space-y-3">
                {categoryCounts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No active opportunities found for this buyer.</p>
                ) : (
                  categoryCounts.map(([name, count]) => (
                    <div key={name}>
                      <div className="flex items-center justify-between text-xs">
                        <span>{name}</span>
                        <span className="mono-ref text-muted-foreground">{count}</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${(count / categoryCounts[0][1]) * 100}%` }} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-semibold">Recent opportunities</h3>
              <div className="mt-4 space-y-3">
                {visibleOpps.map((opportunity) => (
                  <div key={opportunity.id} className="rounded-md border border-border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs text-muted-foreground">{opportunity.reference}</div>
                        <div className="text-sm font-medium">{opportunity.title}</div>
                      </div>
                      <FitScore score={opportunity.score} size="sm" showLabel={false} />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{opportunity.category}</span>
                      <Countdown days={opportunity.daysRemaining} />
                    </div>
                  </div>
                ))}
              </div>
              <Pagination
                page={currentOpportunityPage}
                pageSize={opportunityPageSize}
                total={entityOpps.length}
                onPageChange={setOpportunityPage}
              />
            </Card>
          </div>

          <Card className="p-5">
            <h3 className="text-sm font-semibold">Award history</h3>
            <div className="mt-4 space-y-4">
              {yearGroups.map(([year, awards]) => (
                <div key={year}>
                  <div className="text-xs font-semibold uppercase text-muted-foreground">{year}</div>
                  <div className="mt-2 overflow-hidden rounded-md border border-border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Organization</TableHead>
                          <TableHead>Tender</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Supplier</TableHead>
                          <TableHead className="text-right">Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {awards.map((award) => (
                          <TableRow key={award.id}>
                            <TableCell>{entity?.name}</TableCell>
                            <TableCell className="max-w-[240px]">
                              <div className="text-sm font-medium">{award.tender}</div>
                              <div className="mono-ref text-[11px] text-muted-foreground">{award.reference}</div>
                            </TableCell>
                            <TableCell>{award.category}</TableCell>
                            <TableCell>{award.supplier}</TableCell>
                            <TableCell className="text-right mono-ref">{formatMoney(award.value)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}
            </div>
            <Pagination page={currentAwardPage} pageSize={awardPageSize} total={entityAwards.length} onPageChange={setAwardPage} />
          </Card>

          <Card className="border-agent/30 bg-agent/5 p-5">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-4 w-4 text-agent" />
              <div>
                <h3 className="text-sm font-semibold">Demo market insight</h3>
                <p className="mt-1 text-xs leading-6 text-muted-foreground">
                  The intelligence view is intentionally lightweight. It gives a procurement analyst enough context to
                  understand what a buyer tends to buy without turning the interface into a dashboard maze.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="p-4">
      <div className="text-[11px] uppercase text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </Card>
  );
}

function MiniStat({ label, value, icon: Icon }: { label: string; value: string | number; icon: ElementType }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 p-3">
      <div>
        <div className="text-[11px] uppercase text-muted-foreground">{label}</div>
        <div className="mt-1 text-sm font-medium">{value}</div>
      </div>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}
