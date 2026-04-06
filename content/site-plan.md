# VibeCodeTracker Site Plan

## Primary navigation

- Dashboard (`/`)
- Projects (`/projects`)
- Accounts (`/accounts`)
- Platforms (`/platforms`)
- Credits (`/credits`)
- Prompts (`/prompts`)
- Discovery (`/discovery`)
- Costs (`/costs`)

## Page-by-page map

### Dashboard
- KPI cards: total projects, active, stalled, needing attention
- Platform distribution chart
- Account distribution chart
- Rescue ranking list
- Recent activity feed
- AI weekly review panels
- Needs attention table
- Links outward to Projects, Accounts, Platforms, Credits

### Projects
- View switcher: cards, table, rescue, heatmap
- Filter panel: query, status, type, platform, account, tags, stalled, priority, rescue score, recency
- Project cards/table rows
- Rescue workflow section
- Activity heatmap with daily drilldown
- Bulk actions: status, account, tags, archive
- Drawer for project detail, notes, edits

### Accounts
- Account health summary
- Active account cards
- Coverage matrix by platform
- Recommended use cases
- Security / hygiene checklist
- Links to Platforms, Credits, Costs

### Platforms
- Platform directory cards
- Category sections: build, code, research, automation, deployment
- Best-fit guidance by use case
- Recommended account pairing
- Model / credit notes
- Links to Accounts, Credits, Discovery, Costs

### Credits
- Promotion summary cards
- Live credit opportunities / promos
- Model directory with free vs paid markers
- Best-use recommendations
- Weekly allocation checklist
- Links to Platforms, Accounts, Costs

### Prompts
- Search and filters
- Prompt cards with markdown preview
- Prompt editor sheet
- Project-link sheet
- Reusable playbooks / prompt vault

### Discovery
- Feed summary cards
- Discovery items grouped by category
- Bookmark / relevance markers
- Suggested next actions
- Links to Platforms, Credits, Projects

### Costs
- Spend summary cards
- Cost entries by platform/account/project
- Monthly spend breakdown
- Cost-control rules of thumb
- Links to Credits, Platforms, Accounts

## Cross-page linking rules

- Accounts should link to Platforms, Credits, and Costs
- Platforms should link to Accounts, Credits, Discovery, and Costs
- Credits should link to Platforms, Accounts, and Costs
- Discovery should link to Platforms, Credits, and Projects
- Costs should link to Credits, Platforms, and Accounts
- Dashboard should surface the most urgent path into Projects and rescue work

## Content status after this build

- Dashboard: implemented
- Projects: implemented
- Accounts: implemented
- Platforms: implemented
- Credits: implemented
- Prompts: implemented
- Discovery: implemented
- Costs: implemented
