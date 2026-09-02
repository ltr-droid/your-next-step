import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Bot, CheckCircle2, Clock3, GitCompareArrows, Search, ShieldCheck, Sparkles, Briefcase, PencilLine } from "lucide-react";
import { AppShell } from "@/components/bidlens/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/agent")({
  component: AgentPage,
});

function AgentPage() {
  const capabilities = [
    {
      title: "Find Opportunities",
      icon: Search,
      text: "Find procurement opportunities matching a supplier's capabilities and constraints.",
    },
    {
      title: "Investigate Opportunity",
      icon: Sparkles,
      text: "Analyze fit, requirements, risks and missing documentation for a tender.",
    },
    {
      title: "Compare Opportunities",
      icon: GitCompareArrows,
      text: "Compare multiple opportunities and recommend the strongest option.",
    },
    {
      title: "Prepare Bid Workspace",
      icon: Briefcase,
      text: "Create a structured bid preparation workspace from an opportunity.",
    },
    {
      title: "Update Bid Workspace",
      icon: PencilLine,
      text: "Update compliance status, notes and preparation progress.",
    },
  ];

  return (
    <AppShell
      title="Agent Capabilities"
      subtitle="BidLens is designed so a human supplier and an AI agent can operate the same structured workspace."
      actions={
        <Badge variant="secondary" className="gap-1">
          <Bot className="h-3.5 w-3.5" />
          WebMCP-ready
        </Badge>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[11px] uppercase text-muted-foreground">Structured capabilities</div>
              <h2 className="mt-1 text-2xl font-semibold">Agent-operable procurement workflows</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                The product exposes a few high-level operations instead of a chat-first tool zoo. That keeps the
                interface easy to reason about for humans while still giving an agent clear, structured actions.
              </p>
            </div>
            <div className="rounded-full border border-agent/30 bg-agent/10 p-3 text-agent">
              <Bot className="h-6 w-6" />
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {capabilities.map((capability) => (
              <div key={capability.title} className="rounded-lg border border-border p-4">
                <div className="flex items-center gap-2">
                  <capability.icon className="h-4 w-4 text-agent" />
                  <h3 className="text-sm font-semibold">{capability.title}</h3>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{capability.text}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-success" />
              <h3 className="text-sm font-semibold">Human approval model</h3>
            </div>
            <div className="mt-4 space-y-3">
              <Boundary label="Safe read operations" tone="success" items={["Search", "Analyze", "Compare", "View", "Recommend"]} />
              <Boundary
                label="State-changing actions"
                tone="warning"
                items={["Create bid workspace", "Update checklist status", "Edit notes", "Save preferences"]}
              />
            </div>
            <p className="mt-4 text-xs leading-6 text-muted-foreground">
              The demo intentionally stops short of submission, payment or other legally consequential actions.
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Demo workflow</h3>
            </div>
            <ol className="mt-4 space-y-3 text-sm">
              {[
                "Open the dashboard and review recommended opportunities.",
                "Analyze a tender and inspect fit score, risks and missing requirements.",
                "Create a bid workspace for the best opportunity.",
                "Update checklist status and documents as preparation progresses.",
                "Compare opportunities before deciding what to pursue.",
              ].map((step, index) => (
                <li key={step} className="flex gap-3 rounded-md border border-border p-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                    {index + 1}
                  </div>
                  <div className="text-muted-foreground">{step}</div>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>

      <Card className="mt-6 border-agent/30 bg-agent/5 p-5">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-4 w-4 text-agent" />
          <div>
            <h3 className="text-sm font-semibold">Why this matters</h3>
            <p className="mt-1 max-w-3xl text-xs leading-6 text-muted-foreground">
              This layout makes the agent contract visible without dominating the experience. A person can still use
              the procurement dashboard normally, but an agent can operate the same data model through a small set of
              structured operations.
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/opportunities">
              Browse opportunities
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Card>
    </AppShell>
  );
}

function Boundary({
  label,
  tone,
  items,
}: {
  label: string;
  tone: "success" | "warning";
  items: string[];
}) {
  return (
    <div className="rounded-md border border-border p-3">
      <div className="text-xs font-semibold uppercase text-muted-foreground">{label}</div>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <Badge key={item} variant={tone === "success" ? "secondary" : "outline"} className="gap-1">
            {tone === "success" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}
