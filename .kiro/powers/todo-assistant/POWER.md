# Todo Project Assistant Power

## Overview

The **Todo Project Assistant** power provides reusable, context-aware capabilities for working with the Kiro Todo List codebase. It helps developers validate todo data, understand the architecture, generate test data, inspect application state, and navigate the spec artifacts.

## Capabilities

### 1. Validate Todo Data
Validate a todo object or form values against the application's schema rules:
- Title must be non-empty and non-whitespace
- Priority must be `low`, `medium`, or `high`
- DueDate, if provided, must be `YYYY-MM-DD` format and a valid calendar date
- `id`, `createdAt`, `updatedAt` must be present strings

**How to invoke**: Ask the power to validate a JSON todo object or form values.

### 2. Generate Todo Test Data
Generate realistic, varied todo items for manual testing or seeding the app:
- Titles from realistic task categories (work, personal, health, errands)
- Mixed priority distribution
- Some with due dates, some without
- Some completed, some pending

**How to invoke**: Ask the power to generate N sample todos.

### 3. Inspect Todo Statistics
Analyze a list of todos and return:
- Total count
- Pending vs completed breakdown
- Priority distribution (low/medium/high counts)
- Overdue count (dueDate in the past, not completed)

**How to invoke**: Ask the power to summarize statistics for a given todo list.

### 4. Navigate the Spec
Quickly retrieve specific sections of the spec artifacts:
- Requirements by number (e.g., "Requirement 9: Search Todos")
- Design properties by number (e.g., "Property 5: Search Returns Matching Subset")
- Relevant tasks for a given feature area

**How to invoke**: Ask the power to explain or retrieve a specific requirement, design property, or task.

### 5. Summarize Test Coverage
Review the test files and confirm which of the 11 design properties are covered:
- Cross-reference `src/tests/` against the property list in `design.md`
- Flag any missing or incomplete property tests

**How to invoke**: Ask the power to audit test coverage.

## Architecture Reference

```
Kiro Todo List — key files:
├── src/types/todo.ts          → All TypeScript types (Todo, Priority, TodoFilter, etc.)
├── src/reducers/todoReducer.ts → Pure state reducer
├── src/utils/validation.ts    → validateTodoForm()
├── src/utils/storage.ts       → loadTodos(), saveTodos()
├── src/utils/filters.ts       → applyFilter(), applySearch(), computeCounts()
├── src/utils/sorting.ts       → sortByCreatedAt()
├── src/hooks/useTodos.ts      → useReducer + localStorage sync
├── src/tests/arbitraries.ts   → fast-check arbitraries
├── .kiro/specs/todo/          → requirements.md, design.md, tasks.md
```

## Key Concepts

- **localStorage key**: `"kiro-todos"`
- **State shape**: `{ todos: Todo[], filter: TodoFilter, searchQuery: string }`
- **Reducer actions**: `CREATE_TODO`, `UPDATE_TODO`, `DELETE_TODO`, `TOGGLE_TODO`, `SET_FILTER`, `SET_SEARCH`
- **11 correctness properties** defined in `design.md` — each maps to one or more property-based tests in `src/tests/`

## Usage Notes

- This power is designed for development-time assistance, not runtime operation.
- All capabilities reference the actual source files in this repository.
- The power respects the project's no-backend constraint — it never suggests adding a server or database.
