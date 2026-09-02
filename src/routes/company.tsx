import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, Building2, CalendarDays, MapPin, Save, ShieldCheck, Sparkles, Tags } from "lucide-react";
import { AppShell } from "@/components/bidlens/app-shell";
import { Countdown, FitScore } from "@/components/bidlens/indicators";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { COMPANY } from "@/data/company";
import { rankedOpportunities, formatMoney } from "@/lib/bidlens";
import { useAppState } from "@/state/app-state";
import { toast } from "sonner";

export const Route = createFileRoute("/company")({
  component: CompanyPage,
});

function CompanyPage() {
  const { state, setPreferences } = useAppState();
  const opportunities = rankedOpportunities(state.preferences).filter((o) => o.daysRemaining >= 0 && o.status === "Open");
  const topMatches = opportunities.slice(0, 3);
  const prefs = state.preferences;

  const updatePreferences = (patch: Partial<typeof prefs>) => {
    setPreferences({ ...prefs, ...patch });
    toast.success("Bid preferences updated");
  };

  const togglePref = (key: "preferredCategories" | "preferredLocations" | "excludedCategories", value: string) => {
    const list = prefs[key];
    updatePreferences({ [key]: list.includes(value) ? list.filter((item) => item !== value) : [...list, value] } as Partial<typeof prefs>);
  };

  return (
    <AppShell title="Company Profile" subtitle="Supplier profile and bid preferences for Nexus Technologies (Pvt) Ltd.">
      <div className="space-y-6">
        <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[11px] uppercase text-muted-foreground">Supplier profile</div>
                <h2 className="mt-1 text-2xl font-semibold">{COMPANY.name}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    {COMPANY.type}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {COMPANY.location}
                  </span>
                </div>
              </div>
              <Badge variant="secondary">Primary supplier</Badge>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MiniStat label="Years operating" value={COMPANY.yearsOperating} />
              <MiniStat label="Employees" value={COMPANY.employees} />
              <MiniStat label="Annual capacity" value={formatMoney(COMPANY.annualCapacity)} />
              <MiniStat label="Open fit avg" value={`${Math.round(topMatches.reduce((sum, o) => sum + o.score, 0) / Math.max(topMatches.length, 1))}%`} />
            </div>

            <Separator className="my-5" />
            <p className="text-sm leading-6 text-muted-foreground">{COMPANY.about}</p>
        </Card>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="p-6">
            <h3 className="text-sm font-semibold">Capabilities</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {COMPANY.capabilities.map((cap) => (
                <Badge key={cap} variant="outline">
                  {cap}
                </Badge>
              ))}
            </div>

            <Separator className="my-5" />
            <h3 className="text-sm font-semibold">Supplier categories</h3>
            <div className="mt-3 grid gap-2">
              {COMPANY.categories.map((category) => (
                <div key={category.code} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                  <div>
                    <div className="text-sm font-medium">{category.name}</div>
                    <div className="mono-ref text-[11px] text-muted-foreground">{category.code}</div>
                  </div>
                  <Badge variant="secondary">Registered</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-success" />
              <h3 className="text-sm font-semibold">Certifications and registrations</h3>
            </div>
            <div className="mt-4 space-y-2">
              {COMPANY.certifications.map((item) => (
                <div key={item.name} className="flex items-start justify-between gap-4 rounded-md border border-border p-3">
                  <div>
                    <div className="text-sm font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.detail}</div>
                  </div>
                  <Badge variant={item.status === "Valid" ? "secondary" : item.status === "Expiring" ? "outline" : "destructive"}>
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>

            <Separator className="my-5" />
            <h3 className="text-sm font-semibold">Documents</h3>
            <div className="mt-3 space-y-2">
              {COMPANY.documents.map((doc) => (
                <div key={doc.filename} className="flex items-center justify-between rounded-md border border-border p-3">
                  <div>
                    <div className="text-sm font-medium">{doc.filename}</div>
                    <div className="text-[11px] text-muted-foreground">{doc.type} · Updated {doc.updated}</div>
                  </div>
                  <Badge variant={doc.status === "Current" ? "secondary" : "outline"}>{doc.status}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-6">
            <div className="flex items-center gap-2">
              <Tags className="h-4 w-4 text-agent" />
              <h3 className="text-sm font-semibold">Bid preferences</h3>
            </div>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">
              These preferences influence the procurement ranking in the dashboard and opportunities registry.
            </p>

            <div className="mt-4 space-y-5">
              <PreferenceGroup
                label="Preferred categories"
                items={COMPANY.categories.map((category) => category.name)}
                values={prefs.preferredCategories}
                onToggle={(value) => togglePref("preferredCategories", value)}
              />
              <PreferenceGroup
                label="Preferred locations"
                items={["Harare", "Bulawayo", "Gweru", "Mutare", "Masvingo", "Midlands"]}
                values={prefs.preferredLocations}
                onToggle={(value) => togglePref("preferredLocations", value)}
              />
              <PreferenceGroup
                label="Excluded categories"
                items={["Building & Civil Works", "Medical Equipment & Supplies", "Transport & Fleet Services", "Energy & Renewables"]}
                values={prefs.excludedCategories}
                onToggle={(value) => togglePref("excludedCategories", value)}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Minimum contract value</Label>
                  <Input
                    className="mt-1.5"
                    type="number"
                    value={prefs.minValue}
                    onChange={(e) => updatePreferences({ minValue: Number(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Maximum contract value</Label>
                  <Input
                    className="mt-1.5"
                    type="number"
                    value={prefs.maxValue}
                    onChange={(e) => updatePreferences({ maxValue: Number(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Minimum lead time days</Label>
                  <Input
                    className="mt-1.5"
                    type="number"
                    value={prefs.minLeadTimeDays}
                    onChange={(e) => updatePreferences({ minLeadTimeDays: Number(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>
        </Card>

        <Card className="p-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-agent" />
              <h3 className="text-sm font-semibold">How preferences affect ranking</h3>
            </div>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">
              The score shown in the dashboard combines the baseline BidLens fit model with your company profile,
              preferred locations and bid size boundaries. Strong matches move up automatically.
            </p>

            <div className="mt-4 space-y-3">
              {topMatches.map((item) => (
                <div key={item.id} className="rounded-md border border-border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs text-muted-foreground">{item.reference}</div>
                      <div className="text-sm font-medium">{item.title}</div>
                    </div>
                    <FitScore score={item.score} showLabel={false} />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{item.entityName}</span>
                    <Countdown days={item.daysRemaining} />
                  </div>
                </div>
              ))}
            </div>
        </Card>
      </div>
    </AppShell>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-border bg-muted/30 p-3">
      <div className="text-[11px] uppercase text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}

function PreferenceGroup({
  label,
  items,
  values,
  onToggle,
}: {
  label: string;
  items: string[];
  values: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase text-muted-foreground">{label}</div>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => {
          const active = values.includes(item);
          return (
            <Button
              key={item}
              type="button"
              size="sm"
              variant={active ? "secondary" : "outline"}
              onClick={() => onToggle(item)}
            >
              {active && <BadgeCheck className="h-4 w-4" />}
              {item}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
