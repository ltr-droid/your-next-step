import { useState, type ElementType, type ReactNode } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  BadgeCheck,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  Landmark,
  MapPin,
  PencilLine,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/bidlens/app-shell";
import { AnalysisPanel } from "@/components/bidlens/analysis-panel";
import { Countdown, FitScore, RecommendationBadge, RiskBadge, StatusBadge } from "@/components/bidlens/indicators";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AWARDS } from "@/data/awards";
import { ENTITIES, entityById } from "@/data/entities";
import { formatDate, formatMoney, missingRequirements, rankedOpportunities } from "@/lib/bidlens";
import { useAppState } from "@/state/app-state";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/opportunities/$tenderId")({
  component: TenderDetailPage,
});

function TenderDetailPage() {
  const { tenderId } = Route.useParams();
  const navigate = useNavigate();
  const { state, createWorkspace, isSaved, toggleSave, toggleCompare, markAnalyzed } = useAppState();
  const [analysisOpen, setAnalysisOpen] = useState(false);

  const opportunity =
    rankedOpportunities(state.preferences).find((o) => o.id === tenderId) ??
    rankedOpportunities(state.preferences)[0];

  if (!opportunity) {
    return (
      <AppShell title="Opportunity not found" subtitle="The tender could not be located in the demo dataset.">
        <Card className="p-8 text-center">
          <h2 className="text-base font-semibold">Opportunity not found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This prototype only includes demonstration tenders. Try browsing the opportunities registry instead.
          </p>
          <div className="mt-5">
            <Button asChild>
              <Link to="/opportunities">Browse opportunities</Link>
            </Button>
          </div>
        </Card>
      </AppShell>
    );
  }

  const entity = entityById(opportunity.entityId);
  const awards = AWARDS.filter((a) => a.entityId === opportunity.entityId).sort((a, b) => b.date.localeCompare(a.date));
  const related = rankedOpportunities(state.preferences)
    .filter((o) => o.entityId === opportunity.entityId && o.id !== opportunity.id)
    .slice(0, 4);
  const missing = missingRequirements(opportunity);
  const missingDocs = opportunity.documents.filter((d) => d.required && d.status !== "Available");
  const workspace = state.workspaces[opportunity.id];

  const viewDoc = (name: string) => toast.message(`Mock document action: ${name}`);

  return (
    <AppShell
      title={opportunity.reference}
      subtitle={opportunity.title}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => setAnalysisOpen(true)}>
            <Sparkles className="h-4 w-4" />
            Analyze Opportunity
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              createWorkspace(opportunity.id);
              markAnalyzed(opportunity.id);
              toast.success("Bid workspace created");
              void navigate({ to: "/workspaces/$tenderId", params: { tenderId: opportunity.id } });
            }}
          >
            <Briefcase className="h-4 w-4" />
            Add to Bid Workspace
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              toggleCompare(opportunity.id);
              toast.success("Comparison updated");
            }}
          >
            Compare
          </Button>
          <Button
            variant={isSaved(opportunity.id) ? "secondary" : "default"}
            onClick={() => {
              toggleSave(opportunity.id);
              toast.success(isSaved(opportunity.id) ? "Removed from saved" : "Saved opportunity");
            }}
          >
            {isSaved(opportunity.id) ? <CheckCircle2 className="h-4 w-4" /> : <BadgeCheck className="h-4 w-4" />}
            {isSaved(opportunity.id) ? "Saved" : "Save"}
          </Button>
        </div>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="mono-ref text-[11px] text-muted-foreground">{opportunity.reference}</div>
                <h2 className="mt-1 text-2xl font-semibold text-foreground">{opportunity.title}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    {opportunity.entityName}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {opportunity.location}
                  </span>
                  <Badge variant="secondary">{opportunity.category}</Badge>
                </div>
              </div>
              <div className="flex items-end gap-4">
                <div className="text-right">
                  <div className="text-[11px] text-muted-foreground uppercase">BidLens Fit</div>
                  <FitScore score={opportunity.score} size="lg" showLabel={false} />
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-muted-foreground uppercase">Status</div>
                  <StatusBadge status={opportunity.displayStatus} />
                  <div className="mt-2">
                    <Countdown days={opportunity.daysRemaining} />
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-5" />

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <KeyStat label="Estimated value" value={formatMoney(opportunity.estimatedValue)} icon={Landmark} />
              <KeyStat label="Publication date" value={formatDate(opportunity.published)} icon={CalendarDays} />
              <KeyStat label="Closing date" value={formatDate(opportunity.closing)} icon={CalendarDays} />
              <KeyStat label="Procurement method" value={opportunity.procurementMethod} icon={FileText} />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <RecommendationBadge recommendation={opportunity.recommendation} />
              <RiskBadge level={opportunity.riskLevel} />
              <Badge variant="outline">{opportunity.tenderType}</Badge>
              <Badge variant="outline">{opportunity.entityType}</Badge>
            </div>
          </Card>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="buyer">Buyer</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card className="p-5">
                <h3 className="text-sm font-semibold">Description</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{opportunity.description}</p>
              </Card>

              <div className="grid gap-4 lg:grid-cols-2">
                <Card className="p-5">
                  <h3 className="text-sm font-semibold">Scope</h3>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {opportunity.scope.map((item) => (
                      <li key={item} className="flex gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card className="p-5">
                  <h3 className="text-sm font-semibold">Procurement facts</h3>
                  <dl className="mt-3 grid gap-3 text-sm">
                    <MetaRow label="Category" value={`${opportunity.categoryCode} · ${opportunity.category}`} />
                    <MetaRow label="Buyer" value={opportunity.entityName} />
                    <MetaRow label="Location" value={opportunity.location} />
                    <MetaRow label="Method" value={opportunity.procurementMethod} />
                    <MetaRow label="Closing countdown" value={<Countdown days={opportunity.daysRemaining} />} />
                  </dl>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="requirements" className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-3">
                <RequirementPanel
                  title="Eligibility"
                  items={opportunity.eligibility}
                  accent="success"
                  note={`${missing.filter((m) => m.met !== "met").length} eligibility gaps detected`}
                />
                <RequirementPanel
                  title="Technical"
                  items={opportunity.technical}
                  accent="info"
                  note={`${opportunity.technical.filter((m) => m.met === "missing").length} technical items missing`}
                />
                <Card className="p-5">
                  <h3 className="text-sm font-semibold">Commercial</h3>
                  <div className="mt-3 space-y-3">
                    {opportunity.commercial.map((item) => (
                      <div key={item.label} className="rounded-md border border-border p-3">
                        <div className="text-xs font-medium text-foreground">{item.label}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <Card className="p-5">
                <h3 className="text-sm font-semibold">Gaps the analysis will flag</h3>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {missing.map((item) => (
                    <div key={item.id} className="rounded-md border border-border p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-medium">{item.label}</div>
                        <Badge variant="outline">{item.met}</Badge>
                      </div>
                      {item.detail && <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>}
                    </div>
                  ))}
                  {missing.length === 0 && (
                    <p className="text-sm text-muted-foreground">No material requirement gaps identified.</p>
                  )}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <Card className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Filename</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {opportunity.documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div className="font-medium">{doc.filename}</div>
                          <div className="text-[11px] text-muted-foreground">{doc.required ? "Required" : "Optional"}</div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{doc.type}</TableCell>
                        <TableCell>
                          <Badge variant={doc.status === "Available" ? "secondary" : "outline"}>{doc.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => viewDoc(doc.filename)}>
                              <Eye className="h-3.5 w-3.5" />
                              View
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => viewDoc(doc.filename)}>
                              <Download className="h-3.5 w-3.5" />
                              Download
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>

              {missingDocs.length > 0 && (
                <Card className="p-5">
                  <h3 className="text-sm font-semibold">Items to source</h3>
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    {missingDocs.map((doc) => (
                      <div key={doc.id} className="rounded-md border border-warning/30 bg-warning/5 p-3 text-sm">
                        {doc.filename}
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="buyer" className="space-y-4">
              <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
                <Card className="p-5">
                  <h3 className="text-sm font-semibold">Buyer profile</h3>
                  <div className="mt-3 space-y-3 text-sm">
                    <MetaRow label="Organization" value={entity?.name ?? opportunity.entityName} />
                    <MetaRow label="Organization type" value={entity?.type ?? opportunity.entityType} />
                    <MetaRow label="Location" value={entity?.location ?? opportunity.location} />
                    <MetaRow
                      label="Historical tenders"
                      value={entity?.historicalTenders.toLocaleString() ?? "—"}
                    />
                    <MetaRow label="Average tender size" value={formatMoney(entity?.averageTenderValue ?? null)} />
                  </div>

                  <Separator className="my-4" />

                  <h4 className="text-xs font-semibold uppercase text-muted-foreground">Major categories</h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(entity?.majorCategories ?? []).map((cat) => (
                      <Badge key={cat} variant="outline">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </Card>

                <Card className="p-5">
                  <h3 className="text-sm font-semibold">Recent awards</h3>
                  <div className="mt-3 space-y-3">
                    {awards.slice(0, 5).map((award) => (
                      <div key={award.id} className="rounded-md border border-border p-3">
                        <div className="text-sm font-medium text-foreground">{award.tender}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {award.supplier} · {formatDate(new Date(award.date))} · {formatMoney(award.value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <Card className="p-5">
                <h3 className="text-sm font-semibold">Related opportunities from the same buyer</h3>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {related.map((item) => (
                    <Link
                      key={item.id}
                      to="/opportunities/$tenderId"
                      params={{ tenderId: item.id }}
                      className="rounded-md border border-border p-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs text-muted-foreground">{item.reference}</div>
                        <FitScore score={item.score} size="sm" showLabel={false} />
                      </div>
                      <div className="mt-1 text-sm font-medium">{item.title}</div>
                    </Link>
                  ))}
                  {related.length === 0 && <div className="text-sm text-muted-foreground">No related records available.</div>}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="text-sm font-semibold">Analysis snapshot</h3>
            <div className="mt-3 rounded-lg border border-border bg-muted/40 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground uppercase">Fit score</div>
                  <div className="mt-1 text-3xl font-semibold">{opportunity.score}</div>
                </div>
                <RecommendationBadge recommendation={opportunity.recommendation} />
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {opportunity.recommendationNote ||
                  "This is a structured assessment based on the published requirements and the company's demo profile."}
              </p>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              {opportunity.fitNotes.positive.slice(0, 3).map((item) => (
                <div key={item} className="flex gap-2 text-foreground/80">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  {item}
                </div>
              ))}
              {opportunity.fitNotes.caution.slice(0, 3).map((item) => (
                <div key={item} className="flex gap-2 text-foreground/80">
                  <PencilLine className="mt-0.5 h-4 w-4 shrink-0 text-warning-foreground" />
                  {item}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold">Quick actions</h3>
            <div className="mt-3 grid gap-2">
              <Button
                onClick={() => {
                  createWorkspace(opportunity.id);
                  toast.success("Bid workspace created");
                  void navigate({ to: "/workspaces/$tenderId", params: { tenderId: opportunity.id } });
                }}
              >
                <Briefcase className="h-4 w-4" />
                Prepare Bid
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  toggleCompare(opportunity.id);
                  toast.success("Comparison updated");
                }}
              >
                Compare with shortlist
              </Button>
              <Button variant="outline" onClick={() => setAnalysisOpen(true)}>
                Open analysis panel
              </Button>
            </div>
            <Separator className="my-4" />
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>Read-only actions: view, analyze, compare and save.</p>
              <p>State-changing actions: prepare bid workspace and update bid readiness.</p>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold">Workspace status</h3>
            {workspace ? (
              <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Active workspace</span>
                  <Badge variant="secondary">Created</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Checklist items</span>
                  <span>{workspace.checklist.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Attached documents</span>
                  <span>{workspace.documents.filter((d) => d.attached).length}</span>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">No workspace has been created for this opportunity yet.</p>
            )}
          </Card>
        </div>
      </div>

      <AnalysisPanel opportunity={opportunity} open={analysisOpen} onOpenChange={setAnalysisOpen} />
    </AppShell>
  );
}

function KeyStat({ label, value, icon: Icon }: { label: string; value: ReactNode; icon: ElementType }) {
  return (
    <div className="rounded-md border border-border bg-muted/30 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[11px] uppercase text-muted-foreground">{label}</div>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-2 text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border pb-2 last:border-b-0 last:pb-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="max-w-[65%] text-right text-sm text-foreground">{value}</dd>
    </div>
  );
}

function RequirementPanel({
  title,
  items,
  note,
  accent,
}: {
  title: string;
  items: { id: string; label: string; detail?: string; met: "met" | "partial" | "missing" }[];
  note: string;
  accent: "success" | "info";
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        <Badge variant={accent === "success" ? "secondary" : "outline"}>{note}</Badge>
      </div>
      <div className="mt-3 space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-md border border-border p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-medium">{item.label}</div>
                {item.detail && <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>}
              </div>
              <Badge variant={item.met === "met" ? "secondary" : "outline"}>{item.met}</Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
