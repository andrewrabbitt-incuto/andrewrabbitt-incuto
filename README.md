# incuto Loan Decisioning Engine

A professional, full-featured loan decisioning platform for credit unions. Built with React 18, TypeScript, Vite, and Tailwind CSS.

## Features

### 1. Rules Engine
- Configure scorecards per product (Personal Loan, Car Loan, Credit Builder, Home Improvement)
- **Hard decline rules** — immediate decline regardless of score (bankruptcy, fraud, CCJ threshold, ID check)
- **Scoring rules** — accumulate positive/negative points from member, bureau, and open banking data
- **Score threshold editor** — visual band configuration for auto-approve / refer / auto-decline
- Live approval rate preview based on recent historical data
- Toggle rules on/off without deleting them

### 2. Loan Decision Review
- Full filterable table of all loan applications with decision outcomes
- **Drill-down drawer** — member data, bureau/TransUnion, and open banking data tabs
- **Score waterfall chart** — visualises which rules fired and their point contributions
- **AI Gap Analysis** — identifies decline patterns, near-misses, and product design opportunities
- Filter by decision type, product, time period, and member name

### 3. Sandbox
- Clone the live scorecard and edit it freely without affecting production
- **Simulation engine** — runs proposed rule changes against historical applications
- Side-by-side rate comparison (baseline vs proposed) with a timeline chart
- Full list of applications that would change decision, with score delta

## Data Sources

Rules can be built against three categories of data:

| Source | Examples |
|--------|---------|
| **Member Data** | Account balance, savings, months as member, payment history score, arrears count, DTI ratio |
| **Bureau / TransUnion** | Credit score (0–710), CCJ count, bankruptcy flag, defaults, missed payments, fraud score, ID verification |
| **Open Banking** | Verified income, expenditure, disposable income, housing costs, income stability, gambling transactions |

## Getting Started

### Prerequisites
- Node.js 18+

### Installation

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
npm run build
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build tool | Vite 5 |
| Styling | Tailwind CSS 3 |
| Charts | Recharts 2 |
| Icons | Lucide React |
| Routing | React Router v6 |
| State | React Context |

## Architecture

```
src/
├── types/          # Shared TypeScript interfaces
├── lib/
│   ├── fields.ts         # Data field definitions (member/bureau/open banking)
│   ├── scoring-engine.ts # Rule evaluation and scoring logic
│   ├── mock-data.ts      # 200 realistic sample applications + scorecards
│   ├── gap-analysis.ts   # Decline pattern analysis engine
│   └── simulation.ts     # Historical simulation engine
├── store/
│   └── AppContext.tsx    # Global React context + state
└── components/
    ├── layout/           # AppShell, Sidebar, Header
    ├── ui/               # Badge, Button, Modal, StatCard
    ├── rules-engine/     # Rules Engine section (4 components)
    ├── loan-review/      # Loan Decision Review section (4 components)
    └── sandbox/          # Sandbox simulation section
```

## incuto API Integration

In production, replace mock data in `src/lib/mock-data.ts` with live API calls:

- **Inbound**: `GET /api/v1/applications` — fetch loan applications with member/bureau/open banking data
- **Outbound**: `POST /api/v1/applications/{id}/decision` — push automated decision back to the platform

The scoring engine (`src/lib/scoring-engine.ts`) is pure logic with no UI dependencies and can be deployed as a standalone serverless function or backend service.
