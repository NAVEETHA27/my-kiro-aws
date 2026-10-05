# Kiro Todo List — MCP Server

## Overview

This directory contains a minimal [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server for the Kiro Todo List application. It exposes the todo data as structured tools that an AI assistant (such as Kiro) can call directly.

## How It Works

Because the Todo List stores data in the **browser's localStorage** (not a server-side database), this MCP server operates on a local mirror file: `mcp/todos.json`.

**Data flow:**
1. User manages todos in the browser at `http://localhost:5173`
2. To sync data to the MCP server, copy the localStorage value:
   - Open browser DevTools → Application → Local Storage → `kiro-todos`
   - Copy the JSON array value
   - Paste it into `mcp/todos.json`
3. AI assistant calls MCP tools — they read from `mcp/todos.json`

## Available Tools

| Tool | Description |
|---|---|
| `list_todos` | Return all todos, optionally filtered by `all` / `pending` / `completed` |
| `get_todo` | Get a single todo by its UUID |
| `search_todos` | Search todos by title or description (case-insensitive) |
| `get_stats` | Get summary statistics: total, pending, completed, overdue, priority breakdown |

## Running the Server

```bash
node mcp/todo-server.js
```

The server uses **stdio transport** — it reads JSON-RPC messages from stdin and writes responses to stdout.

## Kiro IDE Configuration

To connect this server to Kiro, add the following to your Kiro MCP configuration (typically accessible via the Kiro settings panel → MCP servers):

```json
{
  "mcpServers": {
    "todo-list": {
      "command": "node",
      "args": ["mcp/todo-server.js"],
      "cwd": "${workspaceFolder}"
    }
  }
}
```

> **Manual step required**: Open Kiro's MCP configuration panel and add the server configuration above. The server files are ready; only the IDE registration step requires a UI action.

## Testing the Server Manually

You can test the server by piping JSON-RPC messages to it:

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}' | node mcp/todo-server.js
echo '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}' | node mcp/todo-server.js
echo '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"get_stats","arguments":{}}}' | node mcp/todo-server.js
```

## Example Responses

### `get_stats`
```json
{
  "total": 5,
  "pending": 3,
  "completed": 2,
  "overdue": 1,
  "byPriority": { "low": 1, "medium": 2, "high": 2 }
}
```

### `list_todos` (filter: "pending")
Returns an array of Todo objects where `completed === false`.
