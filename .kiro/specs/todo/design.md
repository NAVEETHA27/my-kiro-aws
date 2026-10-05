# Design Document: Kiro Todo List

## Overview

The Kiro Todo List is a React + TypeScript single-page application (SPA) built with Vite. It stores all data in `localStorage` with no backend required. The application demonstrates the full Kiro University Build-Along curriculum: React component architecture, TypeScript type safety, `localStorage` persistence, property-based testing with `fast-check`, Kiro hooks, Kiro powers, and custom agents.

All state is managed in a single custom hook (`useTodos`) via `useReducer`. Components are purely presentational and receive data and callbacks as props. This approach keeps logic testable in isolation.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    TodoApp (root)                    │   │
│  │   useTodos hook (useReducer + localStorage)          │   │
│  │                                                      │   │
│  │  ┌────────────┐  ┌──────────────┐  ┌─────────────┐  │   │
│  │  │  TaskCount │  │  SearchBar   │  │ FilterTabs  │  │   │
│  │  └────────────┘  └──────────────┘  └─────────────┘  │   │
│  │                                                      │   │
│  │  ┌─────────────────────────────────────────────┐     │   │
│  │  │              TodoList                       │     │   │
│  │  │  ┌─────────────────────────────────────┐    │     │   │
│  │  │  │   TodoItem (×N)                     │    │     │   │
│  │  │  │   ┌────────────────────────────┐    │    │     │   │
│  │  │  │   │  TodoForm (edit mode)      │    │    │     │   │
│  │  │  │   └────────────────────────────┘    │    │     │   │
│  │  │  └─────────────────────────────────────┘    │     │   │
│  │  └─────────────────────────────────────────────┘     │   │
│  │                                                      │   │
│  │  ┌─────────────────────────────────────────────┐     │   │
│  │  │         TodoForm (create mode)              │     │   │
│  │  └─────────────────────────────────────────────┘     │   │
│  │                                                      │   │
│  │  ┌────────────────────────────────────────────┐      │   │
│  │  │           EmptyState                       │      │   │
│  │  └────────────────────────────────────────────┘      │   │
│  └──────────────────────────────────────────────────────┘   │
│                         ↕ localStorage                       │
└─────────────────────────────────────────────────────────────┘
```

**Data Flow:**
1. On mount, `useTodos` reads from `localStorage` and hydrates state.
2. User actions dispatch actions to the `todoReducer`.
3. `todoReducer` returns new state.
4. A `useEffect` in `useTodos` writes the updated state to `localStorage` on every change.
5. Components receive derived data (filtered + searched list, counts) via selector functions.

---

## Components and Interfaces

### Component Hierarchy

```
TodoApp
├── ErrorBoundary
├── TaskCount
├── SearchBar
├── FilterTabs
├── TodoForm (create mode)
├── TodoList
│   ├── TodoItem
│   │   └── TodoForm (edit mode, conditionally rendered)
│   └── EmptyState (when list is empty)
└── (global toast/notification for errors — optional)
```

### Component Props Interfaces

```typescript
// TaskCount
interface TaskCountProps {
  total: number;
  pending: number;
  completed: number;
}

// SearchBar
interface SearchBarProps {
  query: string;
  onChange: (query: string) => void;
  onClear: () => void;
}

// FilterTabs
interface FilterTabsProps {
  activeFilter: TodoFilter;
  onChange: (filter: TodoFilter) => void;
}

// TodoForm
interface TodoFormProps {
  mode: 'create' | 'edit';
  initialValues?: Partial<TodoFormValues>;
  onSubmit: (values: TodoFormValues) => void;
  onCancel?: () => void;
}

// TodoList
interface TodoListProps {
  todos: Todo[];
  filter: TodoFilter;
  searchQuery: string;
  onToggle: (id: string) => void;
  onEdit: (id: string, values: TodoFormValues) => void;
  onDelete: (id: string) => void;
}

// TodoItem
interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onEdit: (id: string, values: TodoFormValues) => void;
  onDelete: (id: string) => void;
}

// EmptyState
interface EmptyStateProps {
  filter: TodoFilter;
  hasSearch: boolean;
}
```

---

## Data Models

### TypeScript Types

```typescript
// Core Todo entity
export interface Todo {
  id: string;           // UUID v4
  title: string;        // non-empty
  description?: string; // optional
  completed: boolean;
  priority: Priority;
  dueDate?: string;     // ISO date: YYYY-MM-DD
  createdAt: string;    // ISO datetime
  updatedAt: string;    // ISO datetime
}

// Priority levels
export type Priority = 'low' | 'medium' | 'high';

// Filter options
export type TodoFilter = 'all' | 'pending' | 'completed';

// Form values (user input, no id/timestamps)
export interface TodoFormValues {
  title: string;
  description: string;
  priority: Priority;
  dueDate: string; // '' when not set
}

// Validation result
export interface ValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof TodoFormValues, string>>;
}

// Reducer state
export interface TodoState {
  todos: Todo[];
  filter: TodoFilter;
  searchQuery: string;
}

// Reducer actions
export type TodoAction =
  | { type: 'CREATE_TODO'; payload: TodoFormValues }
  | { type: 'UPDATE_TODO'; payload: { id: string; values: TodoFormValues } }
  | { type: 'DELETE_TODO'; payload: { id: string } }
  | { type: 'TOGGLE_TODO'; payload: { id: string } }
  | { type: 'SET_FILTER'; payload: { filter: TodoFilter } }
  | { type: 'SET_SEARCH'; payload: { query: string } };
```

### localStorage Schema

```
Key:   "kiro-todos"
Value: JSON array of Todo objects
```

---

## Folder Structure

```
src/
├── components/
│   ├── TodoApp.tsx          # Root component, mounts useTodos
│   ├── TaskCount.tsx
│   ├── SearchBar.tsx
│   ├── FilterTabs.tsx
│   ├── TodoForm.tsx
│   ├── TodoList.tsx
│   ├── TodoItem.tsx
│   └── EmptyState.tsx
├── hooks/
│   └── useTodos.ts          # useReducer + localStorage sync
├── reducers/
│   └── todoReducer.ts       # Pure reducer function
├── utils/
│   ├── validation.ts        # Validator: validateTodoForm()
│   ├── storage.ts           # loadTodos(), saveTodos()
│   ├── filters.ts           # applyFilter(), applySearch()
│   └── sorting.ts           # sortByCreatedAt()
├── types/
│   └── todo.ts              # All TypeScript types/interfaces
├── tests/
│   ├── validation.test.ts
│   ├── todoReducer.test.ts
│   ├── filters.test.ts
│   ├── storage.test.ts
│   └── taskCount.test.ts
└── main.tsx
```

---

## State Management

`useTodos` is the single source of truth. It wraps `useReducer` with a `todoReducer` and syncs to `localStorage` via `useEffect`.

```typescript
// hooks/useTodos.ts (sketch)
function useTodos() {
  const [state, dispatch] = useReducer(todoReducer, undefined, initState);

  // Sync to localStorage on every state change
  useEffect(() => {
    saveTodos(state.todos);
  }, [state.todos]);

  // Derived data
  const filteredTodos = applySearch(applyFilter(state.todos, state.filter), state.searchQuery);
  const counts = computeCounts(state.todos);

  return { ...state, filteredTodos, counts, dispatch };
}

function initState(): TodoState {
  return {
    todos: loadTodos(),
    filter: 'all',
    searchQuery: '',
  };
}
```

The `todoReducer` is a **pure function** — given a state and action, it returns a new state. This makes it straightforward to test with property-based testing.

---

## Utility Functions

### `validation.ts`

```typescript
// Returns ValidationResult with errors map
export function validateTodoForm(values: TodoFormValues): ValidationResult
```

Rules:
- `title`: required, must not be empty or whitespace-only after trimming
- `dueDate`: if non-empty, must match `YYYY-MM-DD` and be a valid calendar date

### `storage.ts`

```typescript
export function loadTodos(): Todo[]   // reads from localStorage, returns [] on error
export function saveTodos(todos: Todo[]): void  // writes to localStorage, logs on error
```

### `filters.ts`

```typescript
export function applyFilter(todos: Todo[], filter: TodoFilter): Todo[]
export function applySearch(todos: Todo[], query: string): Todo[]
```

### `sorting.ts`

```typescript
export function sortByCreatedAt(todos: Todo[]): Todo[]  // descending
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

The testing library for property-based tests is **`fast-check`** (version `^3.x`). Each property test runs a minimum of **100 iterations**.

---

### Property 1: Todo Creation Round-Trip

*For any* valid combination of title, optional description, optional dueDate, and priority, creating a Todo and reading it back from the store (or from localStorage) produces a Todo whose fields match the provided inputs exactly.

**Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.8**

---

### Property 2: Whitespace Title Is Always Invalid

*For any* string composed entirely of Unicode whitespace characters (spaces, tabs, newlines, non-breaking spaces), the Validator SHALL reject it as an invalid title and return a non-empty error message.

**Validates: Requirements 1.5, 7.2, 17.1**

---

### Property 3: Valid Inputs Produce No Validation Errors

*For any* valid title (non-empty, non-whitespace), valid optional dueDate (well-formed `YYYY-MM-DD` or empty string), and any priority, the Validator SHALL return `valid: true` with no errors.

**Validates: Requirements 17.3**

---

### Property 4: Filter Returns Correct Subset

*For any* list of Todos and any filter value (`all`, `pending`, `completed`), the filtered result must be a subset of the original list where every item satisfies the filter predicate, and no item satisfying the predicate is omitted.

**Validates: Requirements 2.1, 3.1, 4.1, 10.2, 10.3, 10.4**

---

### Property 5: Search Returns Matching Subset

*For any* list of Todos and any search query string, the search result must be a subset of the input list where every item's `title` or `description` contains the query (case-insensitive), and no matching item is omitted.

**Validates: Requirements 9.1, 9.3**

---

### Property 6: Filter and Search Composition

*For any* Todo list, filter, and search query, applying the filter first then the search produces the same result as applying the search first then the filter (confluence / order-independence).

**Validates: Requirements 10.6**

---

### Property 7: Toggle Completion Is a Round-Trip

*For any* Todo, toggling `completed` twice (pending → completed → pending, or completed → pending → completed) returns the Todo to its original `completed` state.

**Validates: Requirements 5.1, 6.1**

---

### Property 8: Delete Removes Exactly One Todo

*For any* non-empty Todo list and any Todo `id` in the list, deleting that Todo reduces the list length by exactly 1 and the deleted Todo is no longer present in the resulting list.

**Validates: Requirements 8.1**

---

### Property 9: TaskCount Invariant

*For any* Todo list, the total count equals the sum of pending count and completed count. Formally: `total = pending + completed` for all list sizes including empty.

**Validates: Requirements 14.1, 14.2, 14.3**

---

### Property 10: Sort Order Invariant

*For any* list of Todos, after sorting by `createdAt` descending, the resulting list is in non-increasing `createdAt` order and contains exactly the same items as the original list (no items added or removed).

**Validates: Requirements 2.4**

---

### Property 11: Persistence Round-Trip (JSON Serialization)

*For any* valid array of Todo objects, serializing the array to a JSON string and deserializing it back produces an array of objects that are structurally equal to the originals (all fields preserved with correct types).

**Validates: Requirements 19.1, 19.2, 19.3, 20.4**

---

## Error Handling

| Scenario | Behavior |
|---|---|
| `localStorage` unavailable on read | `loadTodos()` catches the error, logs to console, returns `[]` |
| `localStorage` unavailable on write | `saveTodos()` catches the error, logs to console, continues |
| Corrupted JSON in `localStorage` | `loadTodos()` catches `JSON.parse` error, returns `[]` |
| Data in `localStorage` is not an array | `loadTodos()` detects non-array value, returns `[]` |
| Individual Todo missing required fields | `loadTodos()` filters out malformed items, logs a warning |
| Unexpected React render error | `ErrorBoundary` displays a friendly error message |

---

## Testing Strategy

### Dual Testing Approach

Both unit tests and property-based tests are used together:

- **Unit tests** cover: specific examples, edge cases, error conditions, UI component rendering
- **Property-based tests** cover: universal properties across all valid inputs

### Property-Based Testing Setup

- Library: **`fast-check`** (`^3.x`)
- Test runner: **Vitest**
- Minimum iterations per property: **100**
- Each property test references the design property it validates via a comment:
  ```ts
  // Feature: todo, Property 1: Todo Creation Round-Trip
  ```

### Generators (fast-check arbitraries)

```typescript
// Non-empty, non-whitespace title
const titleArb = fc.string({ minLength: 1 }).filter(s => s.trim().length > 0);

// Whitespace-only string
const whitespaceArb = fc.stringOf(fc.constantFrom(' ', '\t', '\n', '\r', '\u00A0'), { minLength: 1 });

// Valid ISO date string YYYY-MM-DD
const isoDateArb = fc.date({ min: new Date('2000-01-01'), max: new Date('2099-12-31') })
  .map(d => d.toISOString().slice(0, 10));

// Priority
const priorityArb = fc.constantFrom<Priority>('low', 'medium', 'high');

// Valid TodoFormValues
const todoFormValuesArb = fc.record({
  title: titleArb,
  description: fc.option(fc.string(), { nil: '' }).map(v => v ?? ''),
  priority: priorityArb,
  dueDate: fc.option(isoDateArb, { nil: '' }).map(v => v ?? ''),
});

// Array of Todos
const todoArrayArb = fc.array(todoFormValuesArb).map(values =>
  values.map(v => todoReducer({ todos: [], filter: 'all', searchQuery: '' },
    { type: 'CREATE_TODO', payload: v }).todos[0])
);
```

### Unit Tests

| File | What it tests |
|---|---|
| `validation.test.ts` | Valid inputs, empty title, whitespace title, invalid date |
| `todoReducer.test.ts` | CREATE, UPDATE, DELETE, TOGGLE, SET_FILTER, SET_SEARCH actions |
| `filters.test.ts` | applyFilter, applySearch edge cases |
| `storage.test.ts` | loadTodos with valid data, corrupted data, missing key |
| `taskCount.test.ts` | counts with empty list, all-pending, all-completed, mixed |

### Property-Based Tests

| Property | File | Iterations |
|---|---|---|
| Property 1: Todo Creation Round-Trip | `todoReducer.test.ts` | 100 |
| Property 2: Whitespace Title Invalid | `validation.test.ts` | 100 |
| Property 3: Valid Inputs No Errors | `validation.test.ts` | 100 |
| Property 4: Filter Returns Correct Subset | `filters.test.ts` | 100 |
| Property 5: Search Returns Matching Subset | `filters.test.ts` | 100 |
| Property 6: Filter+Search Confluence | `filters.test.ts` | 100 |
| Property 7: Toggle Round-Trip | `todoReducer.test.ts` | 100 |
| Property 8: Delete Removes Exactly One | `todoReducer.test.ts` | 100 |
| Property 9: TaskCount Invariant | `taskCount.test.ts` | 100 |
| Property 10: Sort Order Invariant | `filters.test.ts` | 100 |
| Property 11: Persistence Round-Trip | `storage.test.ts` | 100 |
