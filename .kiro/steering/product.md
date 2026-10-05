# Product Steering — Kiro Todo List

## Purpose

The Kiro Todo List is a single-page web application that helps individuals capture, organize, and track personal tasks. It is built as part of the Kiro University Build-Along curriculum to demonstrate all core Kiro features in a real, runnable project.

## Target User

A developer or knowledge worker who wants a fast, no-friction way to manage daily tasks from a browser — without needing accounts, cloud sync, or a backend.

## Core Values

- **Simplicity first**: every feature must earn its place. If a feature adds complexity without clear user value, it should be cut.
- **Zero friction**: the app opens instantly in a browser and works immediately — no sign-up, no backend, no configuration required.
- **Reliability**: data must never be silently lost. localStorage failures are handled gracefully.
- **Accessibility**: all interactive elements must be keyboard-navigable and screen-reader friendly. Use semantic HTML.

## Feature Scope

In scope for v1:
- Create, read, update, delete todos
- Mark todos complete / incomplete
- Set priority (Low / Medium / High)
- Set optional due date
- Search todos by title and description
- Filter todos: All / Pending / Completed
- Display task count summary
- Persist all data to localStorage
- Responsive layout (320px – 1440px+)
- Empty-state UI
- Input validation and error display

Out of scope for v1:
- User accounts or authentication
- Cloud sync or remote API
- Subtasks / nested todos
- Tags or labels beyond priority
- Notifications or reminders
- Drag-and-drop reordering
- Export / import

## Usability Principles

1. The add-todo form is always visible — no modal required to create a task.
2. Filtering and search work together simultaneously.
3. Every destructive action (delete) must be intentional but not burdensome — no confirmation dialog needed for a todo app.
4. Overdue dates are surfaced visually to help the user prioritize.
5. Empty states tell the user what to do, not just that nothing is there.

## Accessibility Requirements

- All form inputs have associated `<label>` elements.
- Buttons have descriptive `aria-label` attributes where the label text alone may be ambiguous.
- Color is never the sole indicator of state — icons or text labels accompany color cues.
- Focus is managed correctly when forms open and close inline.
- The app passes browser-based keyboard navigation without requiring a mouse.
