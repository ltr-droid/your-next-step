import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Bookmark, BookmarkCheck, GitCompareArrows, LayoutGrid, Rows3, Search, Sparkles, X } from "lucide-react";
import { AppShell } from "@/components/bidlens/app-shell";
import { OpportunityCard } from "@/components/bidlens/opportunity-card";
import { AnalysisPanel } from "@/components/bidlens/analysis-panel";
import { Countdown, FitScore, StatusBadge } from "@/components/bidlens/indicators";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CATEGORIES, ENTITIES } from "@/data/entities";
import { formatDate, formatMoney, LOCATIONS, OPPORTUNITIES, type EnrichedTender } from "@/lib/bidlens";
import { useAppState } from "@/state/app-state";

export const Route = createFileRoute("/opportunities/")({
  head: () => ({
    meta: [
      { title: "Procurement Opportunities — BidLens" },
      {
        name: "description",
        content:
          "Search and filter public procurement opportunities by category, entity, value, location and BidLens fit score.",
      },
      { property: "og:title", content: "Procurement Opportunities — BidLens" },
      {
        property: "og:description",
        content: "Search, filter and shortlist tenders with fit scoring built for suppliers.",
      },
    ],
  }),
  component: OpportunitiesPage,
});

const ALL = "__all__";

type TabKey = "all" | "recommended" | "closing" | "saved" | "analyzed";

function OpportunitiesPage() {
  const { state, isSaved, toggleSave, toggleCompare } = useAppState();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState(ALL);
  const [category, setCategory] = useState(ALL);
  const [entity, setEntity] = useState(ALL);
  const [location, setLocation] = useState(ALL);
  const [closingWithin, setClosingWithin] = useState(ALL);
  const [publishedWithin, setPublishedWithin] = useState(ALL);
  const [minValue, setMinValue] = useState(0);
  const [minFit, setMinFit] = useState(0);
  const [tab, setTab] = useState<TabKey>("all");
  const [view, setView] = useState<"cards" | "table">("cards");
  const [analyzing, setAnalyzing] = useState<EnrichedTender | null>(null);
  const [sort, setSort] = useState("fit");

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = OPPORTUNITIES.filter((o) => {
      if (needle) {
        const hay = `${o.title} ${o.reference} ${o.entityName} ${o.category} ${o.categoryCode} ${o.description}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      if (status !== ALL && o.displayStatus !== status) return false;
      if (category !== ALL && o.categoryCode !== category) return false;
      if (entity !== ALL && o.entityId !== entity) return false;
      if (location !== ALL && o.location !== location) return false;
      if (closingWithin !== ALL && !(o.daysRemaining >= 0 && o.daysRemaining <= Number(closingWithin))) return false;
      if (publishedWithin !== ALL && o.publishedOffsetDays < -Number(publishedWithin)) return false;
      if (minValue > 0 && (o.estimatedValue ?? 0) < minValue) return false;
      if (o.score < minFit) return false;
      if (tab === "recommended" && o.score < 70) return false;
      if (tab === "closing" && !(o.daysRemaining >= 0 && o.daysRemaining <= 7)) return false;
      if (tab === "saved" && !state.saved.includes(o.id)) return false;
      if (tab === "analyzed" && !state.analyzed.includes(o.id)) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === "fit") return b.score - a.score;
      if (sort === "closing") return a.daysRemaining - b.daysRemaining;
      if (sort === "value") return (b.estimatedValue ?? 0) - (a.estimatedValue ?? 0);
      return b.publishedOffsetDays - a.publishedOffsetDays;
    });
    return list;
  }, [q, status, category, entity, location, closingWithin, publishedWithin, minValue, minFit, tab, sort, state.saved, state.analyzed]);

  const resetFilters = () => {
    setQ("");
    setStatus(ALL);
    setCategory(ALL);
    setEntity(ALL);
    setLocation(ALL);
    setClosingWithin(ALL);
    setPublishedWithin(ALL);
    setMinValue(0);
    setMinFit(0);
  };

  return (
    <AppShell
      title="Opportunities"
      subtitle={`${results.length} of ${OPPORTUNITIES.length} demonstration tenders match your filters`}
      actions={
        <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
          <Button size="sm" variant={view === "cards" ? "secondary" : "ghost"} onClick={() => setView("cards")}>
            <LayoutGrid className="h-4 w-4" /> Cards
          </Button>
          <Button size="sm" variant={view === "table" ? "secondary" : "ghost"} onClick={() => setView("table")}>
            <Rows3 className="h-4 w-4" /> Table
          </Button>
        </div>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[260px_1fr]">
        <Card className="h-fit p-4 xl:sticky xl:top-24">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Filters</h2>
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <X className="h-3.5 w-3.5" /> Reset
            </Button>
          </div>
          <div className="mt-4 space-y-4">
            <FilterSelect label="Status" value={status} onChange={setStatus} options={["Open", "Closing Soon", "Closed", "Awarded"].map((s) => ({ value: s, label: s }))} />
            <FilterSelect
              label="Supplier category"
              value={category}
              onChange={setCategory}
              options={CATEGORIES.map((c) => ({ value: c.code, label: `${c.code} · ${c.name}` }))}
            />
            <FilterSelect
              label="Procuring entity"
              value={entity}
              onChange={setEntity}
              options={ENTITIES.map((e) => ({ value: e.id, label: e.name }))}
            />
            <FilterSelect label="Location" value={location} onChange={setLocation} options={LOCATIONS.map((l) => ({ value: l, label: l }))} />
            <FilterSelect
              label="Closing within"
              value={closingWithin}
              onChange={setClosingWithin}
              options={[
                { value: "3", label: "3 days" },
                { value: "7", label: "7 days" },
                { value: "14", label: "14 days" },
                { value: "30", label: "30 days" },
              ]}
            />
            <FilterSelect
              label="Published within"
              value={publishedWithin}
              onChange={setPublishedWithin}
              options={[
                { value: "7", label: "Last 7 days" },
                { value: "14", label: "Last 14 days" },
                { value: "30", label: "Last 30 days" },
              ]}
            />
            <div>
              <Label className="text-xs text-muted-foreground">
                Minimum estimated value · <span className="mono-ref">{formatMoney(minValue)}</span>
              </Label>
              <Slider className="mt-3" value={[minValue]} max={500000} step={25000} onValueChange={([v]) => setMinValue(v ?? 0)} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Minimum fit score · <span className="mono-ref">{minFit}</span>
              </Label>
              <Slider className="mt-3" value={[minFit]} max={100} step={5} onValueChange={([v]) => setMinFit(v ?? 0)} />
            </div>
          </div>
        </Card>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[240px] flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search keyword, tender reference, entity or category…"
                className="pl-9"
              />
            </div>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-[190px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fit">Sort: Fit score</SelectItem>
                <SelectItem value="closing">Sort: Closing soonest</SelectItem>
                <SelectItem value="value">Sort: Estimated value</SelectItem>
                <SelectItem value="published">Sort: Recently published</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)} className="mt-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="recommended">Recommended</TabsTrigger>
              <TabsTrigger value="closing">Closing soon</TabsTrigger>
              <TabsTrigger value="saved">Saved</TabsTrigger>
              <TabsTrigger value="analyzed">Analyzed</TabsTrigger>
            </TabsList>
          </Tabs>

          {results.length === 0 ? (
            <Card className="mt-6 flex flex-col items-center gap-2 p-12 text-center">
              <Search className="h-6 w-6 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">No opportunities match these filters</h3>
              <p className="max-w-sm text-xs text-muted-foreground">
                Try widening the fit score, clearing the category filter or extending the closing window.
              </p>
              <Button size="sm" variant="outline" onClick={resetFilters}>
                Reset filters
              </Button>
            </Card>
          ) : view === "cards" ? (
            <div className="mt-5 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
              {results.map((o) => (
                <OpportunityCard key={o.id} opportunity={o} onAnalyze={setAnalyzing} />
              ))}
            </div>
          ) : (
            <Card className="mt-5 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Opportunity</TableHead>
                    <TableHead>Procuring entity</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead>Closing</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead className="text-right">Fit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="mono-ref text-xs text-muted-foreground">{o.reference}</TableCell>
                      <TableCell className="max-w-[260px]">
                        <Link
                          to="/opportunities/$tenderId"
                          params={{ tenderId: o.id }}
                          className="line-clamp-1 text-sm font-medium hover:text-primary"
                        >
                          {o.title}
                        </Link>
                        <Countdown days={o.daysRemaining} />
                      </TableCell>
                      <TableCell className="max-w-[170px] truncate text-xs">{o.entityName}</TableCell>
                      <TableCell className="max-w-[150px] truncate text-xs">{o.category}</TableCell>
                      <TableCell className="mono-ref text-xs">{formatDate(o.published)}</TableCell>
                      <TableCell className="mono-ref text-xs">{formatDate(o.closing)}</TableCell>
                      <TableCell className="mono-ref text-right text-xs">{formatMoney(o.estimatedValue)}</TableCell>
                      <TableCell className="text-right">
                        <FitScore score={o.score} size="sm" showLabel={false} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={o.displayStatus} />
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            title={isSaved(o.id) ? "Unsave" : "Save"}
                            onClick={() => toggleSave(o.id)}
                          >
                            {isSaved(o.id) ? (
                              <BookmarkCheck className="h-4 w-4 text-primary" />
                            ) : (
                              <Bookmark className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Add to comparison"
                            onClick={() => {
                              toggleCompare(o.id);
                              toast.success("Comparison updated");
                            }}
                          >
                            <GitCompareArrows className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" title="Analyze" onClick={() => setAnalyzing(o)}>
                            <Sparkles className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      </div>

      <AnalysisPanel opportunity={analyzing} open={Boolean(analyzing)} onOpenChange={(v) => !v && setAnalyzing(null)} />
    </AppShell>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="mt-1.5 w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Any</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
