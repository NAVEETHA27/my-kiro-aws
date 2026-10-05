# Implementation Plan: Kiro Todo List

## Overview

This plan converts the Todo List design into discrete, incremental coding tasks. Each task builds on the previous ones. Tasks marked with `*` are optional test or documentation sub-tasks that can be skipped for a faster MVP. All implementation is in **React + TypeScript + Vite** with **Vitest** and **fast-check** for testing.

---

## Tasks

- [ ] 0. Repository inspection and planning
  - Read the existing workspace structure to understand what already exists
  - Note any existing `package.json`, `tsconfig.json`, or Vite configs
  - Identify the target directory for the project (workspace root or `todo-app/` subfolder)
  - Document findings as inline comments in the first commit message
  - _Requirements: all_

- [ ] 1. Spec creation
  - Spec files are already created under `.kiro/specs/todo/`
  - Verify `requirements.md`, `design.md`, and `tasks.md` exist and are complete
  - _Requirements: all_

- [ ] 2. Steering documents
  - [ ] 2.1 Create `.kiro/steering/todo-project.md` steering file
    - Describe the project stack (React, TypeScript, Vite, Vitest, fast-check)
    - List conventions: file naming, component structure, import order
    - Specify test tag format: `// Feature: todo, Property N: <text>`
    - _Requirements: 20.1, 20.2_
  - [ ]* 2.2 Create `.kiro/steering/testing-conventions.md`
    - Document property-based testing patterns and fast-check arbitrary generators
    - Include examples of `fc.assert(fc.property(...))` usage
    - _Requirements: 20.2, 20.3_

- [ ] 3. Project initialization
  - [ ] 3.1 Scaffold Vite + React + TypeScript project
    - Run `npm create vite@latest . -- --template react-ts` (or in a subfolder)
    - Verify `package.json`, `tsconfig.json`, `vite.config.ts` are created
    - _Requirements: 15.1_
  - [ ] 3.2 Install dependencies
    - Install runtime deps: none beyond Vite defaults
    - Install dev deps: `vitest`, `@vitest/ui`, `@testing-library/react`, `@testing-library/user-event`, `jsdom`, `fast-check`
    - Configure Vitest in `vite.config.ts` with `environment: 'jsdom'`
    - _Requirements: 20.2_
  - [ ] 3.3 Create TypeScript types
    - Create `src/types/todo.ts` with `Todo`, `Priority`, `TodoFilter`, `TodoFormValues`, `ValidationResult`, `TodoState`, `TodoAction` as defined in design.md
    - _Requirements: 1.1, 7.1, 17.3_
  - [ ] 3.4 Set up folder structure
    - Create empty placeholder files for: `src/components/`, `src/hooks/`, `src/reducers/`, `src/utils/`, `src/tests/`
    - _Requirements: all_

- [ ] 4. Core feature implementation
  - [ ] 4.1 Implement `src/utils/validation.ts`
    - Implement `validateTodoForm(values: TodoFormValues): ValidationResult`
    - Title: reject empty string and whitespace-only strings (trim check)
    - DueDate: if non-empty, validate `YYYY-MM-DD` format with regex and `Date` parse check
    - _Requirements: 1.5, 1.6, 7.2, 17.1, 17.2, 17.3_
  - [ ]* 4.2 Write unit tests for `validation.ts`
    - Test: valid title passes
    - Test: empty string title fails
    - Test: whitespace-only title fails (`"   "`, `"\t"`, `"\n"`)
    - Test: valid ISO date passes
    - Test: invalid date string fails (`"not-a-date"`, `"2024-13-01"`)
    - Test: empty dueDate passes (optional field)
    - _Requirements: 17.1, 17.2, 17.3_
  - [ ]* 4.3 Write property tests for validation
    - **Property 2: Whitespace Title Is Always Invalid** — for any whitespace-only string, Validator rejects it
    - **Property 3: Valid Inputs Produce No Validation Errors** — for any valid title + priority, Validator returns `valid: true`
    - _Requirements: 1.5, 17.1, 17.3_

  - [ ] 4.4 Implement `src/utils/storage.ts`
    - Implement `loadTodos(): Todo[]` — reads `"kiro-todos"` from localStorage, parses JSON, validates it's an array, filters malformed items; returns `[]` on any error
    - Implement `saveTodos(todos: Todo[]): void` — JSON.stringify and write to `"kiro-todos"`; catch and log errors
    - _Requirements: 18.1, 18.2, 18.3, 19.1, 19.2, 19.3_
  - [ ]* 4.5 Write property test for storage round-trip
    - **Property 11: Persistence Round-Trip** — for any valid Todo array, `loadTodos(saveTodos(arr))` produces an equivalent array
    - Mock localStorage in tests using `vitest`'s `vi.stubGlobal`
    - _Requirements: 19.1, 19.2, 19.3, 20.4_

  - [ ] 4.6 Implement `src/utils/filters.ts` and `src/utils/sorting.ts`
    - `applyFilter(todos, filter)`: returns correct subset per filter value
    - `applySearch(todos, query)`: case-insensitive substring match on title and description
    - `sortByCreatedAt(todos)`: sorts descending by `createdAt`
    - `computeCounts(todos)`: returns `{ total, pending, completed }`
    - _Requirements: 2.1, 2.4, 3.1, 4.1, 9.1, 9.3, 10.2, 10.3, 10.4, 14.1, 14.2, 14.3_
  - [ ]* 4.7 Write property tests for filters
    - **Property 4: Filter Returns Correct Subset** — filtered result is a subset matching the predicate
    - **Property 5: Search Returns Matching Subset** — search result is a subset where every item matches the query
    - **Property 6: Filter+Search Confluence** — `applySearch(applyFilter(todos, f), q)` === `applyFilter(applySearch(todos, q), f)`
    - **Property 9: TaskCount Invariant** — `total === pending + completed` for any list
    - **Property 10: Sort Order Invariant** — sorted list is in non-increasing `createdAt` order with same items
    - _Requirements: 2.4, 3.1, 4.1, 9.1, 10.6, 14.1, 14.2, 14.3_

  - [ ] 4.8 Implement `src/reducers/todoReducer.ts`
    - Implement pure `todoReducer(state: TodoState, action: TodoAction): TodoState`
    - `CREATE_TODO`: generate UUID with `crypto.randomUUID()`, set all fields, prepend to `todos`
    - `UPDATE_TODO`: find by `id`, update fields, set `updatedAt`
    - `DELETE_TODO`: filter out by `id`
    - `TOGGLE_TODO`: flip `completed`, update `updatedAt`
    - `SET_FILTER`: update `filter`
    - `SET_SEARCH`: update `searchQuery`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 5.1, 6.1, 7.1, 8.1_
  - [ ]* 4.9 Write property tests for todoReducer
    - **Property 1: Todo Creation Round-Trip** — for any valid TodoFormValues, created Todo fields match inputs
    - **Property 7: Toggle Completion Round-Trip** — toggling twice restores original `completed` state
    - **Property 8: Delete Removes Exactly One** — deleting a Todo by id reduces length by 1 and item is absent
    - _Requirements: 1.1, 5.1, 6.1, 8.1_

  - [ ] 4.10 Implement `src/hooks/useTodos.ts`
    - Initialize with `useReducer(todoReducer, undefined, initState)` where `initState` calls `loadTodos()`
    - Sync `state.todos` to `localStorage` via `useEffect` on every change
    - Derive `filteredTodos` = `sortByCreatedAt(applySearch(applyFilter(todos, filter), searchQuery))`
    - Expose `dispatch`, `filteredTodos`, `counts`, `filter`, `searchQuery`
    - _Requirements: 1.8, 2.4, 5.3, 6.3, 7.4, 8.2, 19.1, 19.2_

  - [ ] 4.11 Implement `src/components/TaskCount.tsx`
    - Accept `{ total, pending, completed }` props
    - Render three count chips/badges in a row
    - _Requirements: 14.1, 14.2, 14.3, 14.4_

  - [ ] 4.12 Implement `src/components/FilterTabs.tsx`
    - Render three tab buttons: All, Pending, Completed
    - Highlight the active filter
    - Call `onChange(filter)` on click
    - _Requirements: 10.1, 10.5_

  - [ ] 4.13 Implement `src/components/SearchBar.tsx`
    - Controlled input for search query
    - Show clear button when query is non-empty
    - _Requirements: 9.1, 9.3_

  - [ ] 4.14 Implement `src/components/EmptyState.tsx`
    - Accept `{ filter, hasSearch }` props
    - Display context-appropriate message per filter / search state
    - _Requirements: 2.2, 3.2, 4.2, 16.1, 16.2, 16.3_

  - [ ] 4.15 Implement `src/components/TodoForm.tsx`
    - Works in `create` and `edit` modes
    - Fields: title (required), description (optional textarea), priority (select), dueDate (date input)
    - Call `validateTodoForm` on submit; display field-level errors
    - Clear form after successful `create` submission; restore on cancel in `edit` mode
    - _Requirements: 1.5, 1.6, 1.7, 7.2, 7.3, 11.1, 11.2, 12.1, 17.1, 17.2, 17.4_

  - [ ] 4.16 Implement `src/components/TodoItem.tsx`
    - Display: completion checkbox/toggle, title (strikethrough when completed), description, priority badge, dueDate with overdue indicator
    - Buttons: edit, delete
    - Inline edit mode: renders `<TodoForm mode="edit" />` in place
    - _Requirements: 5.1, 5.2, 6.1, 6.2, 11.3, 12.2, 12.3, 12.4, 13.1, 13.2, 13.3, 13.4_

  - [ ] 4.17 Implement `src/components/TodoList.tsx`
    - Render list of `<TodoItem>` or `<EmptyState>` when list is empty
    - Pass through `onToggle`, `onEdit`, `onDelete` callbacks
    - _Requirements: 2.1, 2.2, 2.3, 8.3_

  - [ ] 4.18 Implement `src/components/TodoApp.tsx`
    - Mount `useTodos` hook
    - Compose all child components
    - Wrap in `<ErrorBoundary>`
    - _Requirements: 2.1, 14.4, 15.1, 15.2, 15.3, 18.4_

  - [ ] 4.19 Implement `ErrorBoundary` class component
    - Catch render errors and display a friendly fallback UI
    - _Requirements: 18.4_

  - [ ] 4.20 Wire `src/main.tsx` to mount `<TodoApp />`
    - Ensure hot module reload works in Vite dev mode
    - _Requirements: all_

- [ ] 5. Checkpoint — Core implementation complete
  - Run `npx vitest --run` and verify all tests pass
  - Manually verify create, edit, delete, toggle, filter, search, and persistence in browser
  - Fix any failing tests or runtime errors before proceeding
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Property-based test consolidation
  - [ ] 6.1 Review all property tests created in Phase 4
    - Ensure every property from design.md (Properties 1–11) has a corresponding `fc.assert(fc.property(...))` test
    - Verify each test has a `// Feature: todo, Property N: <text>` comment
    - Confirm minimum 100 iterations per test (fast-check default is 100)
    - _Requirements: 20.2, 20.3_
  - [ ]* 6.2 Add missing property tests if any were skipped
    - Cross-reference design.md Properties 1–11 against test files
    - Add any omitted property tests
    - _Requirements: 20.2, 20.3_

- [ ] 7. Kiro hook for dev automation
  - [ ] 7.1 Create a `fileEdited` Kiro hook for TypeScript files
    - Trigger: any `*.ts` or `*.tsx` file edited
    - Action: ask agent to run `npx vitest --run` and report failures
    - Save hook to `.kiro/hooks/`
    - _Requirements: 20.1_
  - [ ]* 7.2 Create a `postTaskExecution` hook for test verification
    - After each task execution, verify tests still pass
    - _Requirements: 20.1_

- [ ] 8. Kiro Power
  - [ ] 8.1 Create a Kiro Power for the Todo project
    - Create `.kiro/powers/todo-power/` directory structure
    - Write `POWER.md` describing the power's purpose and capabilities
    - Include a steering guide for working with the Todo codebase
    - _Requirements: all_

- [ ] 9. MCP integration
  - [ ] 9.1 Define an MCP tool for Todo management
    - Create a simple MCP server definition (if applicable to the project)
    - Document the tool interface in the power's documentation
    - _Requirements: all_

- [ ] 10. Custom Kiro agent
  - [ ] 10.1 Create a custom Kiro agent spec
    - Define the agent's purpose: helping debug failing property tests
    - Write the agent prompt and capability description
    - Save to `.kiro/agents/todo-test-debugger/`
    - _Requirements: 20.2, 20.3_

- [ ] 11. Complete testing verification
  - [ ] 11.1 Run the full test suite
    - Execute `npx vitest --run` and ensure all tests pass (0 failures)
    - Check coverage includes all utility functions and reducer
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5_
  - [ ]* 11.2 Add integration-style tests for useTodos hook
    - Use `@testing-library/react` `renderHook` to test the hook with real localStorage mock
    - Test: create → persist → reload → hydrate round-trip
    - _Requirements: 19.1, 19.2, 19.3_
  - [ ]* 11.3 Add component render tests
    - Use `@testing-library/react` to render `TodoApp` with mock data
    - Verify TaskCount updates after add/delete/toggle
    - Verify EmptyState appears when list is empty
    - _Requirements: 14.4, 16.1, 16.2_

- [ ] 12. Documentation
  - [ ] 12.1 Write `README.md`
    - Project overview, tech stack, setup instructions (`npm install`, `npm run dev`, `npm run test`)
    - Screenshots or GIF of the app in action (placeholder note)
    - _Requirements: all_
  - [ ]* 12.2 Write `kiro-build-along.md`
    - Narrate the Kiro University Build-Along lesson flow
    - Cross-reference spec artifacts: requirements, design, tasks, hooks, powers, agents
    - Explain how property-based tests were derived from acceptance criteria
    - _Requirements: all_

- [ ] 13. Final quality check
  - [ ] 13.1 TypeScript compilation check
    - Run `npx tsc --noEmit` and fix all type errors
    - _Requirements: all_
  - [ ] 13.2 Responsive UI verification
    - Verify layout at 320px, 640px, and 1440px using browser devtools
    - _Requirements: 15.1, 15.2, 15.3_
  - [ ] 13.3 Accessibility check
    - Verify all interactive elements have accessible labels
    - Verify keyboard navigation works for form submission and filter selection
    - _Requirements: 15.1_
  - [ ]* 13.4 Final test run
    - Run `npx vitest --run` one last time; confirm 0 failures, 0 skipped (or document intentionally skipped)
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5_

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints (task 5) ensure incremental validation before moving to advanced phases
- Property tests (Phase 6) validate universal correctness properties; unit tests validate specific examples and edge cases
- The Kiro hook (Phase 7), Power (Phase 8), MCP (Phase 9), and Agent (Phase 10) phases demonstrate the full Kiro University curriculum and can be done in any order after Phase 5
- All property test files must include the tag comment: `// Feature: todo, Property N: <property_text>`

## Task Dependency Graph

```json
{
  "waves": [
    { "wave": 1, "tasks": ["0", "1"] },
    { "wave": 2, "tasks": ["2", "3"] },
    { "wave": 3, "tasks": ["4.1", "4.4", "4.6", "4.8"] },
    { "wave": 4, "tasks": ["4.2", "4.3", "4.5", "4.7", "4.9", "4.10"] },
    { "wave": 5, "tasks": ["4.11", "4.12", "4.13", "4.14", "4.15", "4.16", "4.17", "4.18", "4.19", "4.20"] },
    { "wave": 6, "tasks": ["5"] },
    { "wave": 7, "tasks": ["6", "7", "8", "9", "10"] },
    { "wave": 8, "tasks": ["11"] },
    { "wave": 9, "tasks": ["12", "13"] }
  ]
}
```

- Wave 1: Repo inspection and spec verification (no code dependencies)
- Wave 2: Steering documents and project scaffolding
- Wave 3: Pure utility modules (validation, storage, filters, reducer) — all are independent
- Wave 4: Property tests for utilities + useTodos hook (depends on wave 3)
- Wave 5: React components (depend on hook and utilities from waves 3–4)
- Wave 6: Checkpoint — all tests pass before advanced phases
- Wave 7: Kiro hook, Power, MCP, Agent — independent of each other, depend on wave 6
- Wave 8: Full test suite consolidation
- Wave 9: Documentation and final quality check
