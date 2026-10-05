# Kiro University Build-Along

**Project**: Kiro Todo List  
**Repository**: https://github.com/NAVEETHA27/my-kiro-aws

This document narrates how each Kiro University lesson was applied in this project. Every feature is genuine — nothing here is fake or placeholder.

---

## 1. Spec-driven Development

**What was done:**  
Before writing a single line of application code, a complete product specification was created under `.kiro/specs/todo/`:

- **`requirements.md`** — 20 requirements with formal acceptance criteria using EARS patterns (WHEN/SHALL). Covers all 18 requested features plus persistence and testing. Each requirement has 2–8 specific acceptance criteria.
- **`design.md`** — Full architecture including the component hierarchy, TypeScript data model, state management pattern (`useReducer` + custom hook), utility function signatures, and 11 correctness properties that later became the property-based test suite.
- **`tasks.md`** — 13 phases broken into granular sub-tasks, each cross-referenced to requirements. Includes a task dependency wave graph.

**Why it mattered:**  
The spec drove the implementation order. The `Todo` interface in `src/types/todo.ts` was defined exactly from the data model in `design.md`. The 11 property-based tests were named and numbered in `design.md` before any test code existed. The acceptance criteria in `requirements.md` were the checklist for the QA agent.

---

## 2. Steering Documents

**Files created:**  
- `.kiro/steering/product.md` — Purpose, target user, feature scope (in/out of v1), usability principles, accessibility requirements
- `.kiro/steering/tech.md` — Stack choices with rationale, architecture principles (pure functions, single source of truth, derived state, error boundaries), folder structure, data persistence details, TypeScript strictness settings
- `.kiro/steering/coding-standards.md` — File naming, TypeScript rules, React component patterns, naming conventions table, error handling rules, import order, accessibility standards
- `.kiro/steering/testing.md` — Dual testing philosophy, test runner setup, test file locations, property test format with code template, required 11 properties table, fast-check arbitrary generators, mock strategy, coverage guidance

**Why it mattered:**  
The testing.md steering file defined the exact format for property tests *before* any tests were written. Every property test in `src/tests/` follows the template and uses the `// Feature: todo, Property N:` comment format specified in the steering document. The tech.md file's "no external state library" rule kept the project simple and beginner-friendly.

---

## 3. Hooks

**File**: `.kiro/hooks/todo-dev-automation.json`  
**Existing hook preserved**: `.kiro/hooks/kironomics.json` (unchanged)

**The hook:**  
- **Trigger**: `FileEdited` — fires when any `.ts` or `.tsx` file in `src/` is saved
- **Action**: Agent runs `npx vitest --run` and reports failures
- **Purpose**: Catches broken tests immediately while coding, without the developer needing to manually switch to the terminal

**Why it's genuine:**  
In a real development workflow, forgetting to run tests after a change is a common mistake. This hook automates the feedback loop — the moment a source file is saved, the test suite runs and any failure is surfaced immediately. This is how TDD-adjacent development works in practice.

**Why the existing hook was preserved:**  
The Kironomics hook (`.kiro/hooks/kironomics.json`) tracks Kiro University session telemetry. It was inspected before any hook work and kept entirely unchanged. The new todo hook was added as a separate file.

---

## 4. Property-Based Testing

**Library**: fast-check 3  
**Test runner**: Vitest  
**Total property tests**: 11 properties across 5 test files  
**Total tests**: 66 (property + unit)

**The 11 properties tested:**

| # | Property | File | What it proves |
|---|---|---|---|
| 1 | Todo Creation Round-Trip | `todoReducer.test.ts` | Created todo fields exactly match input |
| 2 | Whitespace Title Is Always Invalid | `validation.test.ts` | No whitespace string can become a valid todo |
| 3 | Valid Inputs Produce No Errors | `validation.test.ts` | All valid inputs pass validation without false positives |
| 4 | Filter Returns Correct Subset | `filters.test.ts` | Filter never drops matching items or includes non-matching ones |
| 5 | Search Returns Matching Subset | `filters.test.ts` | Search results always contain only items matching the query |
| 6 | Filter+Search Confluence | `filters.test.ts` | Applying filter-then-search equals search-then-filter (order independence) |
| 7 | Toggle Completion Round-Trip | `todoReducer.test.ts` | Toggling twice always restores original state |
| 8 | Delete Removes Exactly One | `todoReducer.test.ts` | Delete always reduces count by exactly 1 |
| 9 | TaskCount Invariant | `taskCount.test.ts` | `total === pending + completed` for all list sizes |
| 10 | Sort Order Invariant | `filters.test.ts` | Sorted list is non-increasing by `createdAt`, same items |
| 11 | Persistence Round-Trip | `storage.test.ts` | Save → load produces structurally identical todo array |

Each property runs 100 iterations with random inputs generated by fast-check arbitraries defined in `src/tests/arbitraries.ts`.

**How properties were derived:**  
The properties were identified during the design phase (not the testing phase) by asking: "what must *always* be true about this system, for *any* valid input?" For example, Property 9 (total = pending + completed) is a mathematical invariant that must hold for every possible list, not just a few test cases. This is what makes property-based testing powerful — it finds edge cases that example-based tests miss.

---

## 5. Powers

**File**: `.kiro/powers/todo-assistant/POWER.md`  
**Usage guide**: `.kiro/powers/todo-assistant/steering/usage-guide.md`

**The Todo Project Assistant power provides:**
1. **Validate Todo Data** — checks a todo object against the schema rules
2. **Generate Todo Test Data** — creates realistic sample todos for demos
3. **Inspect Todo Statistics** — counts, priority breakdown, overdue analysis
4. **Navigate the Spec** — retrieve specific requirements and design properties
5. **Summarize Test Coverage** — audit which of the 11 properties are covered

**Architecture reference included in POWER.md** — the power documents every key source file so an AI assistant using it can navigate the codebase immediately.

> **Manual step required**: Open Kiro's Powers panel and activate the `todo-assistant` power. The `POWER.md` and steering files are ready in `.kiro/powers/todo-assistant/`.

---

## 6. Model Context Protocol (MCP)

### What is MCP?

The [Model Context Protocol](https://modelcontextprotocol.io/) is an open standard that lets AI assistants (like Kiro) call structured tools provided by external servers. Instead of the AI guessing about your data, it can call a real tool and get a real answer. Tools are defined with JSON schemas so the AI knows exactly what parameters to pass and what format the response will be in.

### Workspace MCP Configuration

**Location**: `.kiro/settings/mcp.json` (workspace/project level — tracked in Git)

This file is the **workspace-level** MCP configuration for Kiro. It is separate from any user-level config and travels with the repository, so every developer who clones this repo gets the same MCP servers automatically registered.

```json
{
  "mcpServers": {
    "todo-list": {
      "command": "node",
      "args": ["mcp/todo-server.js"],
      "disabled": false,
      "autoApprove": ["list_todos", "get_stats", "search_todos", "get_todo"]
    },
    "fetch": {
      "command": "uvx",
      "args": ["mcp-server-fetch"],
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

### MCP Servers Configured

#### 1. `todo-list` — Custom Todo MCP Server

**Files**: `mcp/todo-server.js`, `mcp/README.md`, `mcp/todos.json`  
**Transport**: stdio  
**Command**: `node mcp/todo-server.js`  
**Requires**: Node.js (already required by this project — no extra install)

This is a custom MCP server built specifically for the Kiro Todo List. It exposes 4 tools:

| Tool | Description |
|---|---|
| `list_todos` | Return all todos, optionally filtered by `all` / `pending` / `completed` |
| `get_todo` | Retrieve a single todo by UUID |
| `search_todos` | Case-insensitive substring search on title and description |
| `get_stats` | Summary: total, pending, completed, overdue, priority breakdown |

**Verified**: All MCP protocol methods (`initialize`, `tools/list`, `tools/call`) tested with live stdio calls:

```bash
# Returns: {"protocolVersion":"2024-11-05","capabilities":{"tools":{}},"serverInfo":{"name":"todo-mcp-server","version":"1.0.0"}}
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}' | node mcp/todo-server.js

# Returns: 4 tools with full inputSchema definitions
echo '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}' | node mcp/todo-server.js

# Returns: {"total":0,"pending":0,"completed":0,"overdue":0,"byPriority":{...}}
echo '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"get_stats","arguments":{}}}' | node mcp/todo-server.js
```

**How the data bridge works:**  
The browser app stores todos in `localStorage`. The MCP server reads from `mcp/todos.json`. To sync: open browser DevTools → Application → Local Storage → copy the `kiro-todos` value → paste into `mcp/todos.json`. The AI assistant can then call `list_todos` and `get_stats` to inspect real todo data.

#### 2. `fetch` — Official MCP Fetch Server

**Command**: `uvx mcp-server-fetch`  
**Transport**: stdio  
**Requires**: `uvx` (uv package manager — installed at `uvx 0.12.12`)

This is an official MCP server from the [MCP repository](https://github.com/modelcontextprotocol/servers). It allows Kiro to fetch content from URLs — useful for checking documentation, verifying library APIs, or fetching external resources during development.

**Why included**: Demonstrates that the workspace MCP config can register both project-specific and general-purpose servers. The `uvx` runner downloads and runs the server without any manual pip install.

### How Kiro Connects to MCP Servers

1. Kiro reads `.kiro/settings/mcp.json` when opening this workspace
2. It registers each enabled server (`"disabled": false`)
3. Each server starts on demand when a tool call is needed (stdio process spawned)
4. Tools with names listed in `autoApprove` run without prompting for confirmation

### How to Verify

1. Open Kiro's **MCP Server panel** (sidebar → Kiro features → MCP Servers)
2. Both `todo-list` and `fetch` should appear as workspace-level servers
3. Click the reconnect icon if a server shows as disconnected
4. Ask Kiro: *"Call the get_stats tool on the todo-list MCP server"* — it should return live JSON

### How This Todo Project Benefits from MCP

- An AI assistant can call `get_stats` to instantly know how many todos are pending/completed/overdue without reading any source code
- `search_todos` lets the AI find specific todos by keyword when helping the user debug or review
- `list_todos` with `filter: "pending"` gives the AI a focused view of what still needs doing
- The pattern demonstrates how any localStorage-backed app can expose its data to AI tooling via a thin MCP bridge, with no backend required

---

## 7. Custom Agents

**File**: `.kiro/agents/todo-qa-agent.md`

**The Todo QA Agent:**  
- **Purpose**: Systematic quality-assurance reviews of the Todo List codebase
- **Responsibilities**: Code inspection, test coverage audit, requirements gap analysis, bug identification, accessibility checking, TypeScript validation, build verification

**Quality checklist included:**  
The agent file contains a 20-point checklist covering functionality, validation, test coverage, accessibility, TypeScript, and build.

**Example invocation prompts:**
- "Run the full test suite and tell me what fails."
- "Check that all 11 property-based tests are present."
- "Verify that Requirements 9 (Search) and 10 (Filter) are correctly implemented."

> **Manual step required**: Open Kiro's agent panel to invoke the `Todo QA Agent`.

---

## One-Line Lesson Summary

1. **Spec-driven development**: Created a complete requirements + design + tasks spec in `.kiro/specs/todo/` before writing any application code.
2. **Steering documents**: Defined 4 steering files covering product vision, tech stack, coding standards, and testing conventions to guide every decision.
3. **Hooks**: Built a `FileEdited` hook that automatically runs the test suite whenever a TypeScript source file is saved.
4. **Property-based testing**: Verified 11 universal correctness properties using fast-check, each running 100 iterations with randomly generated todos.
5. **Powers**: Created the `todo-assistant` power with POWER.md and a usage guide for development-time AI assistance.
6. **MCP**: Built a working stdio MCP server with 4 tools (list, get, search, stats) registered in `.kiro/settings/mcp.json` at workspace level alongside the official `mcp-server-fetch` server.
7. **Custom agents**: Defined a `Todo QA Agent` with a structured 20-point checklist for reviewing the entire codebase against the spec.

---

## Demo Flow

A suggested 30-second to 3-minute demonstration sequence:

### 30-second demo (screencast)
1. Open `http://localhost:5173` — app loads instantly
2. Type a todo title, select "High" priority, pick a past due date → click "Add Todo"
3. The todo appears with a red "⚠ Overdue" indicator
4. Click the toggle button → todo is crossed out (completed)
5. Filter to "Pending" → overdue todo disappears
6. Filter back to "All" → it reappears with completed styling

### 2-minute demo (Kiro features)
1. **Spec**: Open `.kiro/specs/todo/requirements.md` — show Requirement 9 (Search) with acceptance criteria
2. **Steering**: Open `.kiro/steering/testing.md` — show the property test format template
3. **Code**: Open `src/tests/filters.test.ts` — show Property 5 (Search) test using that exact template
4. **Run tests**: `npm test` → 66 tests, 0 failures in ~5 seconds
5. **Hook**: Open `.kiro/hooks/todo-dev-automation.json` — explain the FileEdited trigger
6. **MCP**: `echo '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"get_stats","arguments":{}}}' | node mcp/todo-server.js` → live JSON response
7. **App**: Show responsive layout by resizing to mobile width

### 3-minute demo (full walkthrough)
Add to the 2-minute demo:
8. **Power**: Open `.kiro/powers/todo-assistant/POWER.md` — show the 5 capabilities
9. **Agent**: Open `.kiro/agents/todo-qa-agent.md` — show the QA checklist
10. **Git log**: `git log --oneline` — show the 13 meaningful commits, one per milestone

---

## Files Reference

```
.kiro/specs/todo/
├── requirements.md        ← 20 requirements with acceptance criteria
├── design.md              ← Architecture, types, 11 properties
└── tasks.md               ← 13 phases with dependency graph

.kiro/steering/
├── product.md             ← Product vision and scope
├── tech.md                ← Stack and architecture decisions
├── coding-standards.md    ← Naming, TypeScript, React patterns
└── testing.md             ← Testing philosophy and property test format

.kiro/hooks/
├── kironomics.json        ← Existing AWSUG Madurai telemetry hook (unchanged)
└── todo-dev-automation.json ← New FileEdited hook for test automation

.kiro/powers/todo-assistant/
├── POWER.md               ← Power description and capabilities
└── steering/usage-guide.md ← How to use the power

.kiro/agents/
└── todo-qa-agent.md       ← QA agent with checklist

mcp/
├── todo-server.js         ← Working MCP server (stdio transport)
├── todos.json             ← Data file for MCP server
└── README.md              ← Setup and testing instructions
```
