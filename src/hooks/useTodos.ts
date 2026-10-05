import { useReducer, useEffect } from 'react';

import type { TodoFilter, TodoFormValues, TaskCounts } from '../types/todo';
import { todoReducer } from '../reducers/todoReducer';
import { loadTodos, saveTodos } from '../utils/storage';
import { applyFilter, applySearch, computeCounts } from '../utils/filters';
import { sortByCreatedAt } from '../utils/sorting';
import type { TodoState } from '../types/todo';
import type { Todo } from '../types/todo';

function initState(): TodoState {
  return {
    todos: loadTodos(),
    filter: 'all',
    searchQuery: '',
  };
}

export interface UseTodosReturn {
  todos: Todo[];
  filteredTodos: Todo[];
  filter: TodoFilter;
  searchQuery: string;
  counts: TaskCounts;
  createTodo: (values: TodoFormValues) => void;
  updateTodo: (id: string, values: TodoFormValues) => void;
  deleteTodo: (id: string) => void;
  toggleTodo: (id: string) => void;
  setFilter: (filter: TodoFilter) => void;
  setSearch: (query: string) => void;
}

export function useTodos(): UseTodosReturn {
  const [state, dispatch] = useReducer(todoReducer, undefined, initState);

  // Persist todos to localStorage on every change
  useEffect(() => {
    saveTodos(state.todos);
  }, [state.todos]);

  // Derive the filtered + searched + sorted list
  const filteredTodos = sortByCreatedAt(
    applySearch(applyFilter(state.todos, state.filter), state.searchQuery)
  );

  const counts = computeCounts(state.todos);

  function createTodo(values: TodoFormValues): void {
    dispatch({ type: 'CREATE_TODO', payload: values });
  }

  function updateTodo(id: string, values: TodoFormValues): void {
    dispatch({ type: 'UPDATE_TODO', payload: { id, values } });
  }

  function deleteTodo(id: string): void {
    dispatch({ type: 'DELETE_TODO', payload: { id } });
  }

  function toggleTodo(id: string): void {
    dispatch({ type: 'TOGGLE_TODO', payload: { id } });
  }

  function setFilter(filter: TodoFilter): void {
    dispatch({ type: 'SET_FILTER', payload: { filter } });
  }

  function setSearch(query: string): void {
    dispatch({ type: 'SET_SEARCH', payload: { query } });
  }

  return {
    todos: state.todos,
    filteredTodos,
    filter: state.filter,
    searchQuery: state.searchQuery,
    counts,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    setFilter,
    setSearch,
  };
}
