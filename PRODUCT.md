Build a polished, production-quality frontend web application called **BidLens**.

## PRODUCT

BidLens is an **agent-native procurement intelligence platform for suppliers**.

The core problem:

Small and medium-sized suppliers often discover government and institutional procurement opportunities too late, struggle to determine whether they are actually eligible, and spend significant time manually reading tender requirements and preparing compliance checklists.

BidLens helps a supplier:

1. Discover relevant procurement opportunities.
2. Identify opportunities that match their capabilities.
3. Understand why an opportunity is a good or bad fit.
4. Identify eligibility gaps and missing documents.
5. Compare opportunities.
6. Prepare a bid workspace and compliance checklist.
7. Investigate the procuring organization and historical procurement activity.

The application should feel like a **real procurement intelligence SaaS product**, not an AI chatbot demo.

The application is being built specifically to demonstrate **WebMCP / agent-native web applications**, so the UI and information architecture should make it obvious that the same underlying application can be operated by both a human and an AI agent.

---

# IMPORTANT IMPLEMENTATION PRINCIPLE

Do NOT make the product primarily a chatbot.

The primary experience is a professional procurement dashboard.

AI/agent functionality should appear naturally throughout the product as an intelligent layer over structured procurement data.

The application should be fully usable without an AI agent.

At the same time, every major workflow should be designed so that it could be performed by an agent through structured WebMCP tools.

---

# DEMO CONTEXT

Use realistic Zimbabwean public procurement data.

The application does NOT need live government integrations for this prototype.

Create a realistic seeded/mock dataset based on the structure of Zimbabwe's e-GP procurement system.

Use realistic fields such as:

- Tender ID
- Tender reference number
- Tender title
- Required supplier category
- Supplier category code
- Procuring entity
- Scope
- Publication date
- Closing date
- Tender status
- Estimated value where available
- Tender type
- Location
- Requirements
- Required documents
- Technical requirements
- Eligibility requirements
- Evaluation criteria
- Contact information
- Historical awards

Use realistic Zimbabwean organizations such as:

- Zimbabwe Power Company
- ZESA Enterprises
- Rural Electrification Fund
- Zimbabwe National Road Administration
- Ministry of Higher and Tertiary Education
- Zimbabwe Republic Police
- various district councils
- hospitals
- universities
- government ministries
- parastatals

Do NOT claim that the prototype is directly connected to these organizations.

Clearly treat the data as demonstration data.

---

# APPLICATION STRUCTURE

Create the following major sections.

## 1. DASHBOARD

The dashboard should immediately communicate:

**"What should my company bid on?"**

Include:

### Summary metrics

- Relevant opportunities
- Closing this week
- High-fit opportunities
- Saved opportunities
- Active bid workspaces

Example:

- 17 Relevant Opportunities
- 6 Closing This Week
- 4 High Fit
- 8 Saved
- 2 Bid Workspaces

### Recommended Opportunities

Show several opportunity cards.

Each card should contain:

- Tender reference
- Tender title
- Procuring entity
- Category
- Closing date
- Days remaining
- Estimated value if available
- BidLens Fit Score
- short explanation of the score
- Save button
- View button
- Analyze button

Example:

"ZPC/DOM/59/2026 — Supply and Delivery of Network Equipment"

Fit Score: 92%

Reasons:

✓ Category match
✓ Company capability match
✓ Supplier eligibility
✓ Delivery timeline feasible
⚠ Manufacturer authorization required

### Closing Soon

A compact table/list showing tenders closing within the next 7 days.

Use urgency indicators based on remaining time.

### Procurement Activity

Include a small analytics section showing:

- opportunities by category
- opportunities by procuring entity
- opportunity value distribution
- recent awards

Keep this lightweight; it is primarily to make the dashboard feel like a serious intelligence product.

---

# 2. OPPORTUNITIES

Create a full procurement opportunity discovery page.

This should resemble the useful parts of real e-procurement tender registries.

Include:

### Search

Search by:

- keyword
- tender reference
- procuring entity
- category

### Filters

- Status
- Supplier category
- Procuring entity
- Closing date
- Publication date
- Estimated value
- Location
- Fit score

### Views

Allow switching between:

- Cards
- Table

The table should contain:

- Reference
- Opportunity
- Procuring Entity
- Category
- Published
- Closing
- Value
- Fit
- Status

Each opportunity should be clickable.

Include:

- Save
- Compare
- Analyze
- Open

### Tabs / quick filters

- All
- Recommended
- Closing Soon
- Saved
- Analyzed

---

# 3. OPPORTUNITY DETAIL

This is one of the most important screens.

Create a comprehensive tender detail page.

Header:

Tender reference

Tender title

Procuring entity

Status

Closing date

Countdown

Estimated value

Category

Include prominent actions:

- Analyze Opportunity
- Add to Bid Workspace
- Compare
- Save

Then organize the content into tabs:

## Overview

Show:

- description
- scope
- buyer
- procurement method
- category
- publication date
- closing date
- location
- estimated value

## Requirements

Separate:

### Eligibility

- company registration
- tax clearance
- supplier registration
- relevant experience
- category registration
- other requirements

### Technical

- specifications
- delivery requirements
- warranty
- certifications
- manufacturer authorization

### Commercial

- pricing schedule
- validity period
- payment terms
- delivery period

## Documents

Create a document list with:

- filename
- type
- required/optional
- status
- view/download buttons

Examples:

- Tender Document.pdf
- Technical Specifications.pdf
- Pricing Schedule.xlsx
- Declaration Form.pdf

The prototype can use mock documents or document placeholders.

## Buyer

Show a procuring entity profile:

- organization name
- organization type
- location
- number of historical tenders
- major categories
- recent awards

## History

Show previous procurement activity by this organization.

Example:

2026
- Network Equipment
- ICT Services
- Hardware

2025
- Software Licensing
- Computers
- Networking Equipment

---

# 4. AI ANALYSIS PANEL

This is a major differentiator.

Do NOT make this a generic chatbot.

Make it a structured procurement analysis.

When the user clicks "Analyze Opportunity", show an analysis workspace.

## BidLens Fit Score

Large score such as:

**92 / 100**

Break the score into:

- Capability Match — 96%
- Category Match — 100%
- Eligibility — 90%
- Documentation Readiness — 82%
- Timeline Feasibility — 95%

Each score should be clickable and explainable.

## Recommendation

One of:

- Strongly Pursue
- Consider
- Weak Fit
- Do Not Pursue

Then show a concise explanation.

Example:

"Strong fit. The opportunity closely matches your registered ICT and networking capabilities. Your company appears eligible, but manufacturer authorization must be confirmed before submission."

## Strengths

✓ Strong category match
✓ Relevant company capabilities
✓ Existing required certifications
✓ Sufficient delivery capacity

## Risks

⚠ Manufacturer authorization required
⚠ Short submission window
⚠ Two supporting documents missing

## Missing Requirements

Clearly list:

- Manufacturer authorization letter
- Three-year experience references

Give each item a status.

---

# 5. BID WORKSPACE

This should be one of the most polished functional sections.

When a user chooses "Prepare Bid", create a bid workspace for that opportunity.

Header:

Tender reference
Tender title
Closing countdown
Overall preparation progress

Example:

**Bid Readiness: 68%**

Then sections:

## Compliance Checklist

Grouped into:

### Company

✓ Certificate of incorporation
✓ Tax clearance
✓ Supplier registration

### Technical

✓ Product specifications
□ Manufacturer authorization
✓ Warranty documentation

### Commercial

□ Pricing schedule
□ Delivery schedule

Each item should support:

- complete
- incomplete
- not applicable
- notes

## Documents

Show required documents and whether they have been attached.

## Questions / Clarifications

Allow the user to add questions that may need to be sent to the procuring entity.

## Timeline

Show:

- Published
- Analysis started
- Bid preparation
- Clarification deadline
- Submission deadline

## Bid Notes

A simple area for internal notes.

Important:

This prototype should NOT actually submit a government bid.

The final action should be something like:

**"Mark Ready for Submission"**

rather than pretending to submit a legally binding bid.

---

# 6. COMPANY PROFILE

Create a realistic supplier profile.

Example company:

**Nexus Technologies (Pvt) Ltd**

Location:

Harare, Zimbabwe

Sections:

## Company Overview

- company type
- location
- years operating
- employee count
- annual procurement capacity

## Capabilities

Example:

- IT Hardware
- Networking Equipment
- Software Development
- Systems Integration
- Cybersecurity
- Cloud Services

## Supplier Categories

Use realistic procurement categories and codes.

## Certifications & Registrations

Examples:

✓ Company registration
✓ Tax clearance
✓ PRAZ registration
✓ Relevant certifications

## Documents

Show uploaded company documents.

## Bid Preferences

Allow the supplier to define:

- preferred categories
- preferred contract value
- preferred locations
- minimum lead time
- excluded categories

This information should drive the Fit Scores.

---

# 7. INTELLIGENCE

Create a lightweight procurement intelligence section.

Do not overbuild it.

Include:

## Buyer Intelligence

Select a procuring entity.

Show:

- number of tenders
- categories purchased
- recent opportunities
- historical awards
- average tender size where available

## Award History

Show previous procurement records.

Each record:

- organization
- tender
- category
- date
- winning supplier
- value

## Market Overview

Simple charts:

- opportunities by category
- opportunities by organization
- procurement activity over time

This should make BidLens feel more like an intelligence platform than a tender scraper.

---

# 8. COMPARE OPPORTUNITIES

Allow users to select two or three tenders and compare them side-by-side.

Comparison fields:

- Fit Score
- Category match
- Eligibility
- Estimated value
- Closing date
- Preparation effort
- Missing documents
- Risk
- Buyer
- Recommendation

Example:

| | Opportunity A | Opportunity B | Opportunity C |
| Fit | 92% | 84% | 71% |
| Value | $85k | $120k | $45k |
| Closing | 2 days | 6 days | 3 days |
| Missing docs | 1 | 3 | 0 |
| Risk | Low | Medium | Low |

Include an overall recommendation:

"Opportunity A is the strongest near-term bid because it has the highest capability match and lowest preparation burden."

---

# 9. AGENT / WEBMCP VISIBILITY

This is extremely important.

Create a subtle but clearly visible section called:

**Agent Capabilities**

This should NOT dominate the UI.

It should communicate that BidLens is designed to be operated by AI agents as well as humans.

Show five high-level capabilities:

### Find Opportunities

Find procurement opportunities matching a supplier's capabilities and constraints.

### Investigate Opportunity

Analyze an opportunity's fit, requirements, risks and missing documentation.

### Compare Opportunities

Compare multiple opportunities and recommend the strongest option.

### Prepare Bid Workspace

Create a structured bid preparation workspace from an opportunity.

### Update Bid Workspace

Update compliance status, notes and preparation progress.

Do not expose dozens of tiny API-style tools in the UI.

The underlying architecture should be based around these high-level capabilities.

---

# 10. HUMAN APPROVAL MODEL

The application should clearly distinguish between:

### Read operations

Safe:

- searching
- analyzing
- comparing
- viewing
- recommending

and:

### State-changing operations

Require explicit human interaction:

- creating a bid workspace
- changing compliance status
- marking a bid ready
- saving company preferences

Do NOT create functionality for actual tender submission, payments, contract acceptance or other legally consequential actions.

The product should demonstrate responsible human-agent collaboration.

---

# 11. DEMO DATA

Populate the application with enough realistic data that every screen looks complete.

Create approximately:

- 30–50 tenders
- 10–15 procuring entities
- 8–12 categories
- 10–20 historical awards
- 1 primary supplier profile
- 5–8 saved opportunities
- 2 active bid workspaces

Ensure that several tenders are specifically designed to produce strong demonstrations.

For example:

### High Fit

ICT/networking tender

Fit: 92%

### Medium Fit

Software services

Fit: 76%

### Low Fit

Construction tender

Fit: 28%

### Urgent

ICT equipment tender closing tomorrow

### Missing Documents

Strong opportunity but missing manufacturer authorization

### High Value / High Risk

Large infrastructure opportunity

---

# 12. IMPORTANT DEMO SCENARIO

The interface should support this complete story:

1. User opens Dashboard.
2. Dashboard shows recommended opportunities.
3. User opens Opportunities.
4. User filters to ICT-related opportunities.
5. User opens a high-fit tender.
6. User clicks Analyze.
7. BidLens produces the Fit Score and identifies risks.
8. User clicks Prepare Bid.
9. Bid Workspace is created.
10. User sees a structured compliance checklist.
11. User marks one document as complete.
12. Readiness percentage updates.
13. User compares this tender with another opportunity.
14. The system recommends which one to pursue.

The application should feel complete even though this is only a prototype.

---

# 13. COMPONENTS TO BUILD

Create reusable components for:

- App sidebar
- Top navigation
- Dashboard metric cards
- Opportunity cards
- Opportunity table
- Search bar
- Filter controls
- Status badges
- Fit score indicators
- Countdown indicators
- Requirement checklist
- Document list
- Analysis panel
- Recommendation card
- Risk indicators
- Company profile cards
- Buyer profile
- Award history table
- Comparison table
- Bid readiness progress
- Timeline
- Activity feed
- Modal dialogs
- Confirmation dialogs
- Empty states
- Loading states
- Error states
- Toast notifications
- Tabs
- Dropdowns
- Tooltips

Make components reusable rather than hardcoding individual screens.

---

# 14. RESPONSIVENESS

The application must work well on:

- desktop
- laptop
- tablet

Desktop should be the primary target because the demo will be performed on a desktop browser.

Do not sacrifice desktop information density merely to make it look like a mobile application.

---

# 15. UX PRINCIPLES

Prioritize:

- clear information hierarchy
- fast scanning
- procurement terminology
- meaningful status indicators
- obvious deadlines
- clear distinction between facts and AI recommendations
- transparent Fit Scores
- minimal unnecessary clicks
- professional enterprise workflow

Avoid:

- generic chatbot-first UI
- excessive AI branding
- fake futuristic interfaces
- meaningless animations
- unnecessary pages
- overly complicated navigation
- fake government branding
- implying that BidLens is an official government platform

BidLens is an independent procurement intelligence product.

---

# 16. TECHNICAL EXPECTATIONS

Build this as a real interactive web application, not a static mockup.

Use a clean component architecture.

Use realistic seeded data.

Client-side interactions should work:

- searching
- filtering
- sorting
- saving
- comparing
- opening opportunities
- analyzing
- creating bid workspaces
- checking requirements
- updating checklist status
- updating readiness percentage
- navigating between sections

Persist prototype state locally if a backend is unnecessary.

Do not spend time implementing external government integrations.

The priority is a highly polished, coherent, convincing working prototype.

---

# 17. DO NOT OVERBUILD

This is a hackathon demonstration.

Do NOT implement:

- real government authentication
- real tender submission
- payment processing
- legal contract acceptance
- complex ERP functionality
- real-time government synchronization
- unnecessary user management
- complex administrative back office

Build the smallest complete product that makes the concept obvious.

The final application should make someone think:

> "This could become a real procurement intelligence platform."

while also making it obvious:

> "This website was designed to be operated by an AI agent."

---

# FINAL PRODUCT POSITIONING

The application should communicate this idea:

**BidLens**

### Procurement intelligence for businesses that want to bid smarter.

**Discover. Analyze. Prepare.**

Human suppliers get a procurement workspace.

AI agents get structured capabilities for operating that workspace.

The website should feel like a serious, credible product rather than a hackathon prototype.