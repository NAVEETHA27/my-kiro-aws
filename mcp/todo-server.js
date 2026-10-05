#!/usr/bin/env node
/**
 * Kiro Todo List — MCP Server
 *
 * A minimal Model Context Protocol server that exposes the todo data
 * from localStorage as structured tools an AI assistant can call.
 *
 * Because this project stores todos in the browser's localStorage (not a
 * server-side database), this MCP server operates on a JSON file that
 * mirrors the localStorage data. The file is at mcp/todos.json and can be
 * populated by exporting from the browser or by the tools below.
 *
 * Transport: stdio (standard Kiro MCP configuration)
 *
 * Available tools:
 *   list_todos     — Return all todos, optionally filtered
 *   get_todo       — Get a single todo by id
 *   search_todos   — Search todos by title/description
 *   get_stats      — Return count summary statistics
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TODOS_FILE = join(__dirname, 'todos.json');

// ── helpers ───────────────────────────────────────────────────────────────────

function loadTodos() {
  try {
    if (!existsSync(TODOS_FILE)) return [];
    const raw = readFileSync(TODOS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveTodos(todos) {
  writeFileSync(TODOS_FILE, JSON.stringify(todos, null, 2), 'utf-8');
}

function isOverdue(todo) {
  if (!todo.dueDate || todo.completed) return false;
  const today = new Date().toISOString().slice(0, 10);
  return todo.dueDate < today;
}

// ── MCP protocol helpers ──────────────────────────────────────────────────────

function sendResponse(id, result) {
  const msg = JSON.stringify({ jsonrpc: '2.0', id, result });
  process.stdout.write(msg + '\n');
}

function sendError(id, code, message) {
  const msg = JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } });
  process.stdout.write(msg + '\n');
}

function toolResult(text) {
  return { content: [{ type: 'text', text }] };
}

// ── tool implementations ──────────────────────────────────────────────────────

const TOOLS = {
  list_todos: {
    name: 'list_todos',
    description: 'Return all todos from the todo list. Can filter by completion status.',
    inputSchema: {
      type: 'object',
      properties: {
        filter: {
          type: 'string',
          enum: ['all', 'pending', 'completed'],
          description: 'Filter todos by completion status. Defaults to "all".',
        },
      },
    },
    handler(args) {
      const todos = loadTodos();
      const filter = args?.filter ?? 'all';
      const filtered =
        filter === 'pending'
          ? todos.filter((t) => !t.completed)
          : filter === 'completed'
          ? todos.filter((t) => t.completed)
          : todos;
      return toolResult(JSON.stringify(filtered, null, 2));
    },
  },

  get_todo: {
    name: 'get_todo',
    description: 'Get a single todo by its ID.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The UUID of the todo to retrieve.' },
      },
      required: ['id'],
    },
    handler(args) {
      const todos = loadTodos();
      const todo = todos.find((t) => t.id === args.id);
      if (!todo) return toolResult(`No todo found with id: ${args.id}`);
      return toolResult(JSON.stringify(todo, null, 2));
    },
  },

  search_todos: {
    name: 'search_todos',
    description: 'Search todos by title or description (case-insensitive substring match).',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'The search query string.' },
      },
      required: ['query'],
    },
    handler(args) {
      const todos = loadTodos();
      const lower = args.query.toLowerCase();
      const results = todos.filter(
        (t) =>
          t.title.toLowerCase().includes(lower) ||
          (t.description ?? '').toLowerCase().includes(lower)
      );
      return toolResult(JSON.stringify(results, null, 2));
    },
  },

  get_stats: {
    name: 'get_stats',
    description: 'Get summary statistics for all todos: total, pending, completed, overdue counts, and priority breakdown.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    handler() {
      const todos = loadTodos();
      const completed = todos.filter((t) => t.completed).length;
      const pending = todos.length - completed;
      const overdue = todos.filter(isOverdue).length;
      const byPriority = { low: 0, medium: 0, high: 0 };
      todos.forEach((t) => { byPriority[t.priority] = (byPriority[t.priority] ?? 0) + 1; });
      const stats = {
        total: todos.length,
        pending,
        completed,
        overdue,
        byPriority,
      };
      return toolResult(JSON.stringify(stats, null, 2));
    },
  },
};

// ── MCP request handler ───────────────────────────────────────────────────────

function handleRequest(raw) {
  let req;
  try {
    req = JSON.parse(raw);
  } catch {
    sendError(null, -32700, 'Parse error');
    return;
  }

  const { id, method, params } = req;

  if (method === 'initialize') {
    sendResponse(id, {
      protocolVersion: '2024-11-05',
      capabilities: { tools: {} },
      serverInfo: { name: 'todo-mcp-server', version: '1.0.0' },
    });
    return;
  }

  if (method === 'tools/list') {
    sendResponse(id, {
      tools: Object.values(TOOLS).map(({ name, description, inputSchema }) => ({
        name,
        description,
        inputSchema,
      })),
    });
    return;
  }

  if (method === 'tools/call') {
    const toolName = params?.name;
    const tool = TOOLS[toolName];
    if (!tool) {
      sendError(id, -32601, `Unknown tool: ${toolName}`);
      return;
    }
    try {
      const result = tool.handler(params?.arguments ?? {});
      sendResponse(id, result);
    } catch (err) {
      sendError(id, -32000, String(err));
    }
    return;
  }

  // Unknown method — return a valid JSON-RPC error
  sendError(id, -32601, `Method not found: ${method}`);
}

// ── main: stdio line-by-line processing ──────────────────────────────────────

const rl = createInterface({ input: process.stdin });
rl.on('line', (line) => {
  const trimmed = line.trim();
  if (trimmed) handleRequest(trimmed);
});
