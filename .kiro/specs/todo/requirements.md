# Requirements Document

## Introduction

This document specifies the requirements for the **Kiro Todo List** application — a complete, polished, and fully functional single-page application (SPA) built with React, TypeScript, and Vite. The application demonstrates all Kiro University Build-Along core lessons and must run locally, be easy to demonstrate in a 30-second to 3-minute video. Persistence is handled via `localStorage` with no backend required.

---

## Glossary

- **Todo**: A task item stored in the application with a title, optional description, priority, optional due date, and completion state.
- **TodoStore**: The in-memory state and `localStorage` persistence layer managing all Todo items.
- **TodoFilter**: The current view filter applied to the list — one of `all`, `pending`, or `completed`.
- **Priority**: A categorical urgency level assigned to a Todo — one of `low`, `medium`, or `high`.
- **DueDate**: An optional ISO 8601 date string (`YYYY-MM-DD`) representing when a Todo is due.
- **SearchQuery**: A user-provided string used to filter Todos by title or description.
- **EmptyState**: The UI component displayed when no Todos match the current filter or search query.
- **Validator**: The module responsible for validating user input before creating or updating a Todo.
- **TodoApp**: The root React component that orchestrates all features.
- **TaskCount**: A summary display showing the number of total, pending, and completed Todos.

---

## Requirements

### Requirement 1: Create a Todo

**User Story:** As a user, I want to create a new todo item with a title, optional description, priority, and optional due date, so that I can capture tasks I need to accomplish.

#### Acceptance Criteria

1. WHEN a user submits a non-empty title, THE TodoStore SHALL create a new Todo with a unique UUID `id`, the provided `title`, `completed` set to `false`, `priority` defaulting to `medium`, and `createdAt`/`updatedAt` set to the current ISO datetime.
2. WHEN a user provides an optional `description`, THE TodoStore SHALL store it on the created Todo.
3. WHEN a user provides an optional `dueDate`, THE TodoStore SHALL store it as an ISO date string on the created Todo.
4. WHEN a user provides a `priority` value of `low`, `medium`, or `high`, THE TodoStore SHALL store the provided priority on the created Todo.
5. WHEN a user attempts to create a Todo with an empty or whitespace-only title, THE Validator SHALL reject the input and THE TodoApp SHALL display a descriptive validation error message.
6. WHEN a user provides a `dueDate` that is not a valid ISO date string, THE Validator SHALL reject the input and THE TodoApp SHALL display a descriptive validation error message.
7. WHEN a Todo is successfully created, THE TodoApp SHALL clear the input form and return focus to the title input field.
8. WHEN a Todo is successfully created, THE TodoStore SHALL immediately persist the updated Todo list to `localStorage`.

---

### Requirement 2: View All Todos

**User Story:** As a user, I want to view all my todo items in a list, so that I can see everything I need to do.

#### Acceptance Criteria

1. THE TodoApp SHALL display all Todos currently stored in the TodoStore when the `all` filter is active.
2. WHEN the TodoStore is empty, THE TodoApp SHALL display the EmptyState component with a message indicating no todos exist.
3. THE TodoApp SHALL display each Todo's `title`, `description` (if present), `priority`, `dueDate` (if present), and completion state.
4. THE TodoApp SHALL render Todos in descending order of `createdAt` by default (newest first).

---

### Requirement 3: View Pending Todos

**User Story:** As a user, I want to view only my incomplete todo items, so that I can focus on what still needs to be done.

#### Acceptance Criteria

1. WHEN the `pending` filter is active, THE TodoApp SHALL display only Todos where `completed` is `false`.
2. WHEN no pending Todos exist, THE TodoApp SHALL display the EmptyState component with a message indicating no pending todos.

---

### Requirement 4: View Completed Todos

**User Story:** As a user, I want to view only my completed todo items, so that I can review my accomplishments.

#### Acceptance Criteria

1. WHEN the `completed` filter is active, THE TodoApp SHALL display only Todos where `completed` is `true`.
2. WHEN no completed Todos exist, THE TodoApp SHALL display the EmptyState component with a message indicating no completed todos.

---

### Requirement 5: Mark Todo as Completed

**User Story:** As a user, I want to mark a todo as completed, so that I can track my progress.

#### Acceptance Criteria

1. WHEN a user marks a pending Todo as completed, THE TodoStore SHALL set `completed` to `true` and update `updatedAt` to the current ISO datetime.
2. WHEN a Todo is marked as completed, THE TodoApp SHALL visually distinguish it from pending todos (e.g., strikethrough title, muted styling).
3. WHEN a Todo is marked as completed, THE TodoStore SHALL immediately persist the updated Todo list to `localStorage`.

---

### Requirement 6: Mark Todo as Pending

**User Story:** As a user, I want to mark a completed todo as pending again, so that I can reopen tasks I need to revisit.

#### Acceptance Criteria

1. WHEN a user marks a completed Todo as pending, THE TodoStore SHALL set `completed` to `false` and update `updatedAt` to the current ISO datetime.
2. WHEN a Todo is marked as pending, THE TodoApp SHALL render it in the default (non-completed) visual style.
3. WHEN a Todo is marked as pending, THE TodoStore SHALL immediately persist the updated Todo list to `localStorage`.

---

### Requirement 7: Edit a Todo

**User Story:** As a user, I want to edit an existing todo's title, description, priority, and due date, so that I can keep my tasks up to date.

#### Acceptance Criteria

1. WHEN a user saves an edited Todo with a non-empty title, THE TodoStore SHALL update the `title`, `description`, `priority`, and `dueDate` fields and set `updatedAt` to the current ISO datetime.
2. WHEN a user attempts to save an edited Todo with an empty or whitespace-only title, THE Validator SHALL reject the input and THE TodoApp SHALL display a descriptive validation error message.
3. WHEN a user cancels an edit, THE TodoApp SHALL discard all changes and restore the original Todo data.
4. WHEN a Todo is successfully edited, THE TodoStore SHALL immediately persist the updated Todo list to `localStorage`.

---

### Requirement 8: Delete a Todo

**User Story:** As a user, I want to delete a todo item, so that I can remove tasks I no longer need.

#### Acceptance Criteria

1. WHEN a user deletes a Todo, THE TodoStore SHALL remove it from the Todo list by its `id`.
2. WHEN a Todo is deleted, THE TodoStore SHALL immediately persist the updated Todo list to `localStorage`.
3. WHEN the last Todo is deleted, THE TodoApp SHALL display the EmptyState component.

---

### Requirement 9: Search Todos

**User Story:** As a user, I want to search my todos by title or description, so that I can quickly find a specific task.

#### Acceptance Criteria

1. WHEN a user types a SearchQuery of one or more characters, THE TodoApp SHALL display only Todos whose `title` or `description` contains the SearchQuery (case-insensitive).
2. WHEN a SearchQuery matches no Todos, THE TodoApp SHALL display the EmptyState component with a message indicating no search results were found.
3. WHEN a user clears the SearchQuery, THE TodoApp SHALL display all Todos matching the current TodoFilter.
4. WHEN a SearchQuery is active, THE TodoApp SHALL apply it in combination with the active TodoFilter.

---

### Requirement 10: Filter Todos

**User Story:** As a user, I want to filter todos by status (All / Pending / Completed), so that I can focus on the relevant subset of my tasks.

#### Acceptance Criteria

1. THE TodoApp SHALL provide three filter options: `All`, `Pending`, and `Completed`.
2. WHEN the user selects the `All` filter, THE TodoApp SHALL display all Todos regardless of `completed` state.
3. WHEN the user selects the `Pending` filter, THE TodoApp SHALL display only Todos where `completed` is `false`.
4. WHEN the user selects the `Completed` filter, THE TodoApp SHALL display only Todos where `completed` is `true`.
5. WHEN a filter is active, THE TodoApp SHALL visually highlight the selected filter option.
6. WHEN the active filter changes, THE TodoApp SHALL preserve the active SearchQuery and apply both simultaneously.

---

### Requirement 11: Set Priority

**User Story:** As a user, I want to set a priority level (Low / Medium / High) on each todo, so that I can distinguish urgent tasks from less critical ones.

#### Acceptance Criteria

1. WHEN creating a Todo, THE TodoApp SHALL allow the user to select a priority of `low`, `medium`, or `high`, defaulting to `medium`.
2. WHEN editing a Todo, THE TodoApp SHALL allow the user to change the priority.
3. THE TodoApp SHALL visually distinguish between priority levels using color, icon, or label (e.g., red for high, yellow for medium, green for low).

---

### Requirement 12: Set Due Date

**User Story:** As a user, I want to set an optional due date on a todo, so that I can track deadlines.

#### Acceptance Criteria

1. WHEN creating or editing a Todo, THE TodoApp SHALL allow the user to set an optional `dueDate` as an ISO date string (`YYYY-MM-DD`).
2. WHEN a `dueDate` is set and the date is in the past, THE TodoApp SHALL visually indicate the Todo is overdue.
3. WHEN a `dueDate` is set and the date is today or in the future, THE TodoApp SHALL display the due date without an overdue indicator.
4. WHEN no `dueDate` is set, THE TodoApp SHALL display no due date information for that Todo.

---

### Requirement 13: Display Task Status

**User Story:** As a user, I want each todo to clearly show its status, priority, and due date, so that I can quickly assess my workload.

#### Acceptance Criteria

1. THE TodoApp SHALL display a visual completion indicator (e.g., checkbox or toggle) for each Todo.
2. THE TodoApp SHALL display the `priority` level of each Todo using a consistent visual treatment.
3. WHEN a `dueDate` is present, THE TodoApp SHALL display it alongside the Todo.
4. WHEN a Todo is overdue (dueDate is in the past and not completed), THE TodoApp SHALL display a distinct overdue indicator.

---

### Requirement 14: Display Task Count

**User Story:** As a user, I want to see a summary of total, pending, and completed task counts, so that I can understand my overall progress at a glance.

#### Acceptance Criteria

1. THE TodoApp SHALL display the total number of Todos in the TodoStore.
2. THE TodoApp SHALL display the number of pending (incomplete) Todos.
3. THE TodoApp SHALL display the number of completed Todos.
4. WHEN the Todo list changes (add, delete, toggle), THE TodoApp SHALL update the TaskCount display immediately.

---

### Requirement 15: Responsive UI

**User Story:** As a user, I want the application to work well on both desktop and mobile screens, so that I can manage my todos from any device.

#### Acceptance Criteria

1. THE TodoApp SHALL render a usable layout on screen widths from 320px to 1440px and above.
2. THE TodoApp SHALL use a single-column layout on screens narrower than 640px.
3. THE TodoApp SHALL use a multi-column or wider layout on screens 640px and wider.

---

### Requirement 16: Empty-State UI

**User Story:** As a user, I want to see a helpful message when there are no todos to display, so that I understand the current state of the list and know what to do next.

#### Acceptance Criteria

1. WHEN the filtered and searched Todo list is empty, THE TodoApp SHALL display the EmptyState component.
2. THE EmptyState component SHALL display a context-appropriate message (e.g., "No todos yet — add your first task!" for the empty list, "No completed todos yet" for the completed filter, "No results found" for an active search).
3. THE EmptyState component SHALL not display error messages or broken UI elements.

---

### Requirement 17: Validation

**User Story:** As a user, I want the application to validate my input before saving, so that I don't accidentally create or save incomplete or malformed todo items.

#### Acceptance Criteria

1. WHEN a user submits a todo creation or edit form with an empty or whitespace-only title, THE Validator SHALL return an error and THE TodoApp SHALL display a non-empty error message adjacent to the title field.
2. WHEN a user provides a `dueDate` that is not a valid `YYYY-MM-DD` date string, THE Validator SHALL return an error and THE TodoApp SHALL display a non-empty error message adjacent to the due date field.
3. WHEN all inputs are valid, THE Validator SHALL return no errors.
4. WHEN a validation error is displayed and the user corrects the input, THE TodoApp SHALL clear the error message upon the next successful validation.

---

### Requirement 18: Error Handling

**User Story:** As a user, I want the application to handle unexpected errors gracefully without crashing, so that I can continue using the app even when something goes wrong.

#### Acceptance Criteria

1. IF `localStorage` is unavailable or throws an error when reading, THE TodoStore SHALL initialize with an empty Todo list and THE TodoApp SHALL continue to function.
2. IF `localStorage` is unavailable or throws an error when writing, THE TodoStore SHALL log the error to the console and THE TodoApp SHALL continue to function without persisting.
3. IF the data retrieved from `localStorage` is not valid JSON or does not conform to the expected Todo array schema, THE TodoStore SHALL discard the corrupted data and initialize with an empty Todo list.
4. WHEN an unexpected runtime error occurs in any component, THE TodoApp SHALL display a user-friendly error boundary message rather than a blank page.

---

### Requirement 19: Persistence

**User Story:** As a user, I want my todos to be saved automatically so that they are still there when I return to the application.

#### Acceptance Criteria

1. WHEN the TodoStore state changes (create, update, delete), THE TodoStore SHALL write the updated Todo array to `localStorage` under a consistent key (e.g., `"kiro-todos"`).
2. WHEN the TodoApp initializes, THE TodoStore SHALL read the Todo array from `localStorage` and hydrate the application state.
3. WHEN the user reloads the page, THE TodoApp SHALL restore all Todos from `localStorage` without data loss.

---

### Requirement 20: Testing

**User Story:** As a developer, I want comprehensive unit and property-based tests, so that I can verify the correctness of the application logic with confidence.

#### Acceptance Criteria

1. THE Validator SHALL have unit tests covering valid inputs, empty inputs, and whitespace-only inputs.
2. THE TodoStore SHALL have property-based tests using `fast-check` covering creation, update, deletion, and filtering operations.
3. THE search and filter logic SHALL have property-based tests verifying that results are always a subset of the input and match the query conditions.
4. FOR ALL valid Todo objects, serializing the Todo array to JSON and deserializing it SHALL produce an array of equivalent Todo objects (round-trip property).
5. THE TodoApp SHALL have tests verifying that TaskCount values are always consistent with the actual Todo list state.
