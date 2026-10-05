# Coding Standards — Kiro Todo List

## File and Folder Naming

- React component files: `PascalCase.tsx` (e.g., `TodoItem.tsx`)
- Non-component TypeScript files: `camelCase.ts` (e.g., `validation.ts`, `useTodos.ts`)
- Test files: `<subject>.test.ts` or `<subject>.test.tsx`, placed in `src/tests/`
- CSS files: `<ComponentName>.module.css` when using CSS Modules

## TypeScript

- Every function, component, and variable must be explicitly typed — no implicit `any`.
- Use `interface` for object shapes that will be extended or implemented; use `type` for unions, intersections, and simple aliases.
- Use `unknown` + type guards for all external/untrusted data (localStorage, user input).
- Prefer `const` over `let`; never use `var`.
- All exported items must have explicit return types.

## React Components

- Functional components only — no class components except `ErrorBoundary`.
- Props interface defined inline above the component:
  ```tsx
  interface TodoItemProps {
    todo: Todo;
    onToggle: (id: string) => void;
  }
  
  export function TodoItem({ todo, onToggle }: TodoItemProps) { ... }
  ```
- Destructure props in the parameter list.
- Do not use `React.FC<Props>` — it hides the return type and adds unnecessary complexity.
- Keep components small and single-purpose. If a component exceeds ~100 lines, consider splitting it.
- No inline event handler logic beyond `() => dispatch(action)`. Extract logic into named functions.

## State Management

- All business logic lives in `todoReducer.ts` and utility files.
- Components never manipulate state directly — they call callbacks received via props.
- `useTodos` is the only hook that touches localStorage.

## Naming Conventions

| Item | Convention | Example |
|---|---|---|
| React component | PascalCase | `TodoItem`, `FilterTabs` |
| Custom hook | camelCase with `use` prefix | `useTodos` |
| Reducer | camelCase with `Reducer` suffix | `todoReducer` |
| Action type string | SCREAMING_SNAKE_CASE | `CREATE_TODO` |
| Utility function | camelCase verb phrase | `validateTodoForm`, `applyFilter` |
| TypeScript type/interface | PascalCase | `Todo`, `TodoFilter` |
| CSS class | kebab-case | `.todo-item`, `.priority-high` |
| localStorage key | kebab-case string literal | `"kiro-todos"` |

## Error Handling

- Never swallow errors silently. Caught errors must either re-throw, return an error value, or log to `console.error`.
- Production code never uses `console.log` — only `console.error` or `console.warn` for exceptional situations.
- Validation errors are returned as data (a `ValidationResult` object), not thrown as exceptions.
- localStorage errors are caught locally in `storage.ts` and logged, not propagated upward.

## Code Quality

- No duplicated logic. If the same transformation appears in two places, extract it to a utility function.
- No magic numbers or strings. Constants go in the `types/todo.ts` file or at the top of the relevant module.
- Keep functions small: aim for ≤ 20 lines per function.
- Comment "why", not "what". Code explains what; comments explain why unusual decisions were made.
- No `TODO` comments in committed code — every committed line should be production quality.

## Import Order

1. External packages (react, etc.)
2. Internal absolute imports (types, utils)
3. Relative imports (sibling or child components)
4. CSS imports (last)

Separate each group with a blank line.

## Accessibility

- All `<input>`, `<select>`, and `<textarea>` elements must have a corresponding `<label htmlFor="...">`.
- All icon-only buttons must have `aria-label="..."`.
- Use semantic elements: `<button>` for actions, `<a>` for navigation, `<header>`, `<main>`, `<section>`, `<ul>`, `<li>` where appropriate.
- Never use `div` or `span` for interactive elements.
- Ensure focus order follows the visual reading order.
