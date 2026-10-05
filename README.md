# Kiro Todo List

A complete, polished, production-quality Todo List application built with React, TypeScript, and Vite — created as part of the **Kiro University Build-Along** curriculum to demonstrate all core Kiro features.

## Features

- **Create todos** with title, description, priority, and due date
- **View, filter, and search** todos (All / Pending / Completed, case-insensitive search)
- **Edit todos** inline — change any field and save or cancel
- **Delete todos** with a single click
- **Mark complete / pending** with a toggle button
- **Priority levels**: Low / Medium / High with color-coded badges
- **Due date** with automatic overdue detection
- **Task count summary** — Total, Pending, Done counts always in view
- **Empty state** messages that guide the user contextually
- **Validation** — empty or whitespace-only titles and invalid dates are rejected
- **Responsive UI** — works from 320px mobile to 1440px+ desktop
- **Accessible** — semantic HTML, ARIA attributes, keyboard navigation
- **Persistent** — all data saved to `localStorage` automatically
- **Error boundary** — unexpected render errors show a friendly fallback

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 (functional components, hooks) |
| Language | TypeScript 5 (strict mode) |
| Build tool | Vite 6 |
| Testing | Vitest 3 |
| Property-based testing | fast-check 3 |
| Styling | Plain CSS (no CSS-in-JS) |
| Persistence | Browser localStorage |
| State management | React `useReducer` + custom hook |

## Architecture

The application follows a pure-function architecture for all business logic:

```
src/
├── types/todo.ts          → All TypeScript types
├── reducers/todoReducer.ts → Pure state reducer (easy to test)
├── utils/
│   ├── validation.ts      → Form validation (returns errors, never throws)
│   ├── storage.ts         → localStorage read/write with error handling
│   ├── filters.ts         → applyFilter, applySearch, computeCounts
│   └── sorting.ts         → sortByCreatedAt
├── hooks/useTodos.ts      → useReducer + localStorage sync + derived state
├── components/            → Presentational React components
└── tests/                 → Vitest unit + property-based tests
```

State lives entirely in `useTodos`. Components receive data and callbacks as props — no component touches state directly.

## Folder Structure

```
my-kiro-aws/
├── .kiro/
│   ├── specs/todo/        ← Spec-driven development artifacts
│   ├── steering/          ← Product, tech, coding, testing guidelines
│   ├── hooks/             ← Kiro automation hooks
│   ├── powers/            ← Kiro powers
│   └── agents/            ← Kiro custom agents
├── mcp/                   ← MCP server for AI tool integration
├── docs/                  ← Build-along documentation
├── src/                   ← Application source code
├── dist/                  ← Production build output (gitignored)
├── index.html
├── package.json
├── vite.config.ts
├── vitest.config.ts
└── tsconfig.json
```

## Installation

```bash
git clone https://github.com/NAVEETHA27/my-kiro-aws.git
cd my-kiro-aws
npm install
```

## Running Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. The app starts instantly — no configuration or login required.

## Running Tests

```bash
# Run all tests once
npm test

# Watch mode (re-runs on file change)
npm run test:watch
```

**Test suite**: 5 test files, 66 tests, 0 failures.
All 11 correctness properties from the design spec are covered with property-based tests using fast-check.

## Production Build

```bash
npm run build
```

Output goes to `dist/`. Serve it with:

```bash
npm run preview
```

## TypeScript Check

```bash
npx tsc -b
```

Zero errors in strict mode.

## Screenshots

_Demo coming soon — see the [Demo Flow](docs/kiro-build-along.md#demo-flow) section for a walkthrough._

## Kiro Features Demonstrated

1. **Spec-driven development** — full spec under `.kiro/specs/todo/` created before any code
2. **Steering documents** — 4 steering files governing product, tech, coding standards, and testing
3. **Kiro hook** — `todo-dev-automation.json` triggers test runs on TypeScript file edits
4. **Property-based testing** — 11 correctness properties tested with fast-check across 66 tests
5. **Kiro Power** — `todo-assistant` power for development-time code assistance
6. **MCP integration** — stdio MCP server with 4 tools: list, get, search, stats
7. **Custom agent** — `todo-qa-agent.md` for systematic QA reviews

See [docs/kiro-build-along.md](docs/kiro-build-along.md) for the full lesson walkthrough.

## Future Improvements

- Sort todos by priority or due date
- Drag-and-drop reorder
- Bulk actions (complete all, delete completed)
- Export todos as JSON or CSV
- Dark mode
- Due date notifications (browser Notification API)
- Tags / categories beyond priority

## License

MIT
