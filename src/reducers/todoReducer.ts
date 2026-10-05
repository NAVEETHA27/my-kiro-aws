import type { TodoState, TodoAction, Todo } from '../types/todo';

/**
 * Pure reducer for the Todo application state.
 * Given a current state and an action, returns a new state.
 * Never mutates the input state.
 */
export function todoReducer(state: TodoState, action: TodoAction): TodoState {
  const now = new Date().toISOString();

  switch (action.type) {
    case 'CREATE_TODO': {
      const { title, description, priority, dueDate } = action.payload;
      const newTodo: Todo = {
        id: crypto.randomUUID(),
        title: title.trim(),
        description: description.trim(),
        completed: false,
        priority,
        dueDate,
        createdAt: now,
        updatedAt: now,
      };
      // Prepend so newest appears first (sortByCreatedAt will re-sort, but prepend is correct)
      return { ...state, todos: [newTodo, ...state.todos] };
    }

    case 'UPDATE_TODO': {
      const { id, values } = action.payload;
      const todos = state.todos.map((todo) => {
        if (todo.id !== id) return todo;
        return {
          ...todo,
          title: values.title.trim(),
          description: values.description.trim(),
          priority: values.priority,
          dueDate: values.dueDate,
          updatedAt: now,
        };
      });
      return { ...state, todos };
    }

    case 'DELETE_TODO': {
      const todos = state.todos.filter((t) => t.id !== action.payload.id);
      return { ...state, todos };
    }

    case 'TOGGLE_TODO': {
      const todos = state.todos.map((todo) => {
        if (todo.id !== action.payload.id) return todo;
        return { ...todo, completed: !todo.completed, updatedAt: now };
      });
      return { ...state, todos };
    }

    case 'SET_FILTER': {
      return { ...state, filter: action.payload.filter };
    }

    case 'SET_SEARCH': {
      return { ...state, searchQuery: action.payload.query };
    }
  }
}
