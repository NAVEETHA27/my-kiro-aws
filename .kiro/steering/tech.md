# Technical Steering — Kiro Todo List

## Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | React 18 | Industry standard, component model maps cleanly to the todo feature set |
| Language | TypeScript 5 | Type safety eliminates an entire class of runtime bugs; required by the spec |
| Build tool | Vite 6 | Fast HMR, zero-config TS/React support, excellent DX |
| Testing | Vitest | Native Vite integration, Jest-compatible API, fast |
| PBT library | fast-check | Most widely used property-based testing library for TypeScript |
| Styling | CSS Modules or plain CSS | No CSS-in-JS overhead; keeps the stack minimal and beginner-friendly |
| Persistence | localStorage | No backend required; immediate persistence; works offline |
| State management | React useReducer + custom hook | No external state library; reducer is a pure function that is easy to test |

## No Backend

This project deliberately uses no backend, database, or server. All data lives in the browser's `localStorage`. This keeps:
- setup to a single `npm install && npm run dev`
- the demo to "open browser, it just works"
- the stack small enough to understand in a 30-minute lesson

## Architecture Principles

1. **Pure functions everywhere possible.** The reducer, validators, filters, sorters, and storage utilities are all pure functions. They have no side effects and are easy to unit-test and property-test.
2. **Single source of truth.** All application state lives in `useTodos`. Components are purely presentational — they receive data and callbacks as props.
3. **Derived state over stored state.** `filteredTodos` and `counts` are derived from `state.todos` on every render — never stored separately. This avoids state synchronisation bugs.
4. **Error boundaries at the root.** The `ErrorBoundary` component wraps the entire app to prevent a broken render from showing a blank page.

## Folder Structure

```
c:\Users\naveetha\my-kiro-aws\
├── .kiro/
│   ├── specs/todo/          # Spec-driven development artifacts
│   ├── steering/            # These steering documents
│   ├── hooks/               # Kiro hooks
│   ├── powers/              # Kiro powers
│   └── agents/              # Kiro custom agents
├── src/
│   ├── components/          # React UI components (presentational)
│   ├── hooks/               # useTodos custom hook
│   ├── reducers/            # todoReducer pure function
│   ├── utils/               # validation, storage, filters, sorting
│   ├── types/               # TypeScript interfaces and types
│   ├── tests/               # Vitest unit and property-based tests
│   └── main.tsx             # Entry point
├── docs/                    # Project documentation
├── public/                  # Static assets
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Data Persistence

- **Key**: `"kiro-todos"` in `localStorage`
- **Format**: `JSON.stringify(Todo[])`
- **Read**: on app mount via `useTodos` init function
- **Write**: on every state change via `useEffect` in `useTodos`
- **Failure modes**: all read/write errors are caught, logged, and gracefully degraded

## TypeScript Strictness

`tsconfig.json` must enable at minimum:
- `"strict": true`
- `"noImplicitAny": true`
- `"strictNullChecks": true`
- `"noUnusedLocals": true`

No `any` types in production code. Use `unknown` + type guards for external data (e.g., parsed localStorage JSON).

## Dependency Policy

- Introduce no npm packages without a clear, specific reason.
- Never add a utility library (lodash, ramda, date-fns) when the native API is sufficient.
- Keep `devDependencies` and `dependencies` strictly separated.
- Pin dependency versions in `package.json` (exact version, no `^` for production deps — `^` is acceptable for dev tools).
