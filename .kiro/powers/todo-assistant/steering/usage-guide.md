# Todo Assistant Power — Usage Guide

## When to Use This Power

Use the Todo Project Assistant power when you are:

1. **Adding a new feature** — ask the power to cross-reference the requirements spec and identify which acceptance criteria apply.

2. **Writing a new test** — ask the power which property has not yet been covered or to generate arbitrary test values following the project's arbitraries pattern.

3. **Debugging a failing test** — ask the power to explain what the failing property is testing and which reducer actions, utilities, or components are involved.

4. **Reviewing a PR** — ask the power to validate that the changed code still satisfies the acceptance criteria in requirements.md.

5. **Seeding the application** — ask the power to generate realistic sample todos you can paste into the browser console for a demo.

## Example Prompts

```
"Validate this todo object and tell me if it satisfies the schema: { id: '...', title: 'Buy milk', ... }"
```

```
"Generate 10 sample todos with mixed priorities and due dates for a demo."
```

```
"Which of the 11 design properties are NOT yet covered by tests in src/tests/?"
```

```
"Explain Requirement 9: Search Todos and the corresponding Property 5."
```

```
"I'm adding a sort-by-priority feature. Which requirements and design sections are relevant?"
```

## How the Power Reads This Codebase

The power has access to:
- All spec files under `.kiro/specs/todo/`
- All source files under `src/`
- The steering documents under `.kiro/steering/`

When answering questions, it reads the actual source files rather than relying on cached knowledge, ensuring answers reflect the current state of the code.
