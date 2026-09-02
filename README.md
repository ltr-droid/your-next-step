# BidLens

BidLens is an agent-native procurement intelligence platform for Zimbabwean
suppliers. It helps teams discover relevant tenders, understand fit and
compliance gaps, compare opportunities, and prepare bid workspaces with a
human approval step for state-changing actions.

Live demo: https://425cf10f.your-next-step.pages.dev/

The application uses demonstration data modelled on Zimbabwean e-GP
structures. It is not connected to the Government of Zimbabwe or any
procuring entity.

## Features

- Dashboard ranked by supplier capabilities and bid preferences
- Searchable opportunity registry with cards, table view and pagination
- Tender detail pages with fit analysis, requirements and document gaps
- Opportunity comparison with a recommendation
- Bid workspaces with compliance checklists, documents, notes and readiness
- Buyer intelligence and historical award context
- Persistent local demo state using browser localStorage

## WebMCP

When document.modelContext is available, BidLens registers five high-level
site tools:

- find_opportunities
- investigate_opportunity
- compare_opportunities
- prepare_bid_workspace
- update_bid_workspace

The first three are read-only. Workspace creation and updates require an
explicit human confirmation before changing application state. The bridge is
implemented in src/components/bidlens/webmcp.tsx.

To test locally, enable WebMCP in Chrome at
chrome://flags/#enable-webmcp-testing, relaunch Chrome, and open the app.
The deployed site can be opened in the ChatGPT desktop app's built-in browser,
where site tools are supported when enabled for the account.

## Development

Requirements: Node.js 22 or newer and npm.

    npm install
    npm run dev

The local development server runs on Vite. The application is a client-side
SPA, so all state is kept in the browser for this demonstration.

## Production build

    npm run build

The static output is written to dist. Cloudflare Pages should use:

- Build command: npm run build
- Build output directory: dist
- Root directory: /

public/_redirects preserves client-side routes, and public/_headers enables
origin isolation and the WebMCP tools permissions policy.

## License

This project is licensed under the GNU Affero General Public License v3.0 or
later. See LICENSE for the license notice and the official terms.

AGPL-3.0-or-later is an open-source copyleft license and does not prohibit
commercial use. It requires compliant source availability for modified
network-served versions. Separate commercial licensing may be negotiated with
the project maintainers, but this README is not a substitute for legal advice.
