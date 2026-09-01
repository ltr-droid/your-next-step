import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/workspaces/$tenderId")({
  component: () => null,
});
