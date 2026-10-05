# Testing Steering — Kiro Todo List

## Testing Philosophy

This project uses a dual testing strategy:
- **Unit tests** for specific examples, edge cases, and component rendering
- **Property-based tests** for universal correctness properties across all valid inputs

Both are required. Property-based tests are not a replacement for unit tests — they complement each other.

## Test Runner

- **Vitest** — configured in `vite.config.ts`
- Environment: `jsdom` for all tests (browser-like environment)
- Run all tests: `npm test` or `npx vitest --run`
- Watch mode: `npx vitest`

## Test File Location

All test files go in `src/tests/`:
- `validation.test.ts` — Validator unit + property tests
- `todoReducer.test.ts` — Reducer unit + property tests
- `filters.test.ts` — Filter/search/sort unit + property tests
- `storage.test.ts` — localStorage utility unit + property tests
- `taskCount.test.ts` — Count invariant property tests

## Unit Testing Rules

1. Every exported utility function must have at least one passing unit test.
2. Every error path (empty input, invalid input, storage failure) must have a unit test.
3. Use `describe` blocks to group related tests by function name.
4. Use `it('should ...')` or `test('...')` with a clear, human-readable description.
5. Each test must have exactly one conceptual assertion. Use multiple `expect` calls only when they all verify the same concept.

## Property-Based Testing (fast-check)

### What to test with properties

Properties are best suited for:
- Invariants that hold for *any* valid input (not just specific examples)
- Round-trip operations (create-then-read, serialize-then-deserialize, toggle-twice)
- Subset operations (filter, search must return a subset of the input)
- Mathematical laws (commutativity, idempotency)

### Property Test Format

Every property-based test must follow this pattern:

```typescript
import { describe, it } from 'vitest';
import * as fc from 'fast-check';

// Feature: todo, Property N: <Property Name from design.md>
describe('<module>', () => {
  it('<property description>', () => {
    fc.assert(
      fc.property(<arbitraries>, (...args) => {
        // arrange
        // act
        // assert (return boolean or use expect())
      }),
      { numRuns: 100 }
    );
  });
});
```

### Required Properties (from design.md)

| # | Property | File |
|---|---|---|
| 1 | Todo Creation Round-Trip | `todoReducer.test.ts` |
| 2 | Whitespace Title Is Always Invalid | `validation.test.ts` |
| 3 | Valid Inputs Produce No Validation Errors | `validation.test.ts` |
| 4 | Filter Returns Correct Subset | `filters.test.ts` |
| 5 | Search Returns Matching Subset | `filters.test.ts` |
| 6 | Filter+Search Confluence | `filters.test.ts` |
| 7 | Toggle Completion Round-Trip | `todoReducer.test.ts` |
| 8 | Delete Removes Exactly One | `todoReducer.test.ts` |
| 9 | TaskCount Invariant | `taskCount.test.ts` |
| 10 | Sort Order Invariant | `filters.test.ts` |
| 11 | Persistence Round-Trip | `storage.test.ts` |

### Arbitrary Generators

Reusable fast-check arbitraries (defined once, imported across test files):

```typescript
// Non-empty, non-whitespace title
const titleArb = fc.string({ minLength: 1 }).filter(s => s.trim().length > 0);

// Whitespace-only string
const whitespaceArb = fc.stringOf(
  fc.constantFrom(' ', '\t', '\n', '\r', '\u00A0'),
  { minLength: 1 }
);

// Valid ISO date string YYYY-MM-DD
const isoDateArb = fc.date({
  min: new Date('2000-01-01'),
  max: new Date('2099-12-31')
}).map(d => d.toISOString().slice(0, 10));

// Priority
const priorityArb = fc.constantFrom<Priority>('low', 'medium', 'high');
```

Define these in `src/tests/arbitraries.ts` and import them in each test file.

### Iteration Count

- Default: `{ numRuns: 100 }` per property test
- Do not reduce below 100. Increasing to 200–500 is acceptable for critical properties.

## Mocking

- Mock `localStorage` using `vi.stubGlobal('localStorage', ...)` or an in-memory mock object.
- Never use real `localStorage` in tests — tests must be isolated and order-independent.
- Reset mocks with `vi.restoreAllMocks()` in `afterEach`.

## Coverage

- Aim for 100% branch coverage on: `validation.ts`, `filters.ts`, `sorting.ts`, `todoReducer.ts`
- `storage.ts` must test both success and failure paths (localStorage unavailable)
- Coverage is a guide, not a target to game. Do not write trivial tests just for coverage.

## What Not to Test

- Do not test React internals (useState setter behavior, React re-render counts).
- Do not snapshot-test entire component trees — it makes tests fragile to style changes.
- Do not test `console.error` is called — test that the system degrades gracefully instead.
