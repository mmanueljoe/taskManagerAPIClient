# Testing Strategy

My overall testing strategy focuses on **layered coverage**:

- **Unit tests** verify the correctness of individual classes and pure functions (models, processors, utilities) in isolation.
- **Integration tests** verify how modules collaborate (API client ↔ network, TaskManager ↔ API/processing/model layers).
- **Spies and mocks** are used to isolate external dependencies (network, console, DOM) and to assert behavior (who calls what, with which arguments, and how often).

## Why this strategy

- **Reliability**: Unit tests catch local logic bugs early and make refactoring safe.
- **Confidence in behavior**: Integration tests ensure that realistic workflows (loading data, computing statistics, searching, leaderboards, etc.) behave correctly end-to-end.
- **Determinism**: Mocks for network and time-sensitive behavior remove flakiness and make tests repeatable.
- **Maintainability**: Clear separation of unit/integration tests and systematic mocking keeps the test suite understandable and extendable.

## How test targets were chosen

- **Core domain logic first**: Models (`Task`, `PriorityTask`, `User`) and processing functions (`taskProcessor.js`) are central to the app’s behavior, so they were tested thoroughly.
- **High‑risk / high‑fan‑out modules**: `TaskManager` orchestrates API calls, data transformation, and statistics/queries, so it has extensive integration coverage.
- **External boundaries**: `APIClient` heavily interacts with external services (`fetch`), making it critical to test HTTP paths, error handling, and caching.
- **Utility and side-effects**: Array-heavy utilities and logging paths were targeted with spies to ensure correct usage and to verify side effects without noisy console output.

---

## Test Types Implemented

## Unit Tests

Classes and functions tested:

- **`models.js`**
  - `Task`
    - Constructor behavior (type coercion for `title`, boolean conversion for `completed`, `timeStamp` initialization).
    - `toggle()` state changes.
    - `getStatus()` values ("Completed" vs "Pending").
    - `isOverdue()` time-based boundary conditions (recent vs >7 days, completed vs pending).
    - `toLine()` formatting for completed, pending, and overdue tasks.
  - `PriorityTask`
    - Inheritance from `Task` (`instanceof`, inherited properties and methods).
    - Priority-specific properties (`priority`, `dueDate` defaults and parsing).
    - Overridden `isOverdue()` with due-date-based logic.
    - Overridden `getStatus()` including priority tags and "(Overdue)" suffix.
    - `toLine()` including priority-aware status.
  - `User`
    - Constructor and initial `tasks` array.
    - `addTask()` for `Task` and `PriorityTask`.
    - `getCompletionRate()` (0%, 50%, 100%, rounding behavior).
    - `getTasksByStatus()` for "Completed" and "Pending" and default status.
    - `label()` for normal, null name, and null username cases.

- **`taskProcessor.js`**
  - `toTaskInstances`
    - Mapping raw todos to `Task` instances.
    - ID divisible by 10 → `PriorityTask` with default `priority` and future `dueDate`.
    - `asPriority` flag behavior.
  - `filterByStatus`
    - Filtering by "Completed"/"Pending"/default.
    - Behavior with `PriorityTask` status strings.
    - Empty array and no matches.
  - `filterByUser`
    - Filtering by numeric and string `userId`.
    - No matches and empty arrays.
  - `searchTasks`
    - Single and multiple keyword (AND) search.
    - Case insensitivity.
    - Behavior with numeric keywords and empty keywords.
  - `groupByUser`
    - Grouping tasks by `userId` into a `Map`.
    - Preserving order within each group.
    - Handling mixed `Task`/`PriorityTask`.
  - `uniqueTags`
    - Extracting unique lowercased tags from titles (≥6 chars).
    - Handling empty titles, null titles, non-array input.
  - `calculateStatistics`
    - `totalTasks`, `completedTasks`, `pendingTasks`, `overdueTasks`, `uniqueUsers`.
    - Boundary cases (empty arrays, all completed, all pending, mixed).

- **Spies / utilities**
  - Array prototypes: `filter`, `map`, `reduce`, `forEach` usage in processor functions.
  - Internal methods: `Task.toggle`, `Task.getStatus`, `Task.isOverdue`, `User.addTask`, `User.getCompletionRate`.
  - `console.log`, `console.error`, `console.warn` behavior.

Key scenarios and rationale:

- **Boundary conditions** (e.g., exactly 7 days for `isOverdue`, 1/3 completion rates) to ensure correct rounding and branching.
- **Type coercion** (null/undefined/non-string titles, truthy/falsy `completed`) to avoid subtle bugs in real data.
- **Combination scenarios** (mixed completed/pending, multiple users) to reflect real-world usage patterns.
- **Error expectations** when invalid inputs or unexpected types are passed (null arrays, missing methods).

---

### Integration Tests

Modules and interactions tested:

- **`APIClient` (`src/api.js`)**
  - `fetchUsers()`
  - `fetchTodos()`
  - `fetchUserTodos(userId)`
  - Cache behavior: `useCache` flag and `clearCache()`
  - Underlying helper: `safeJSONFetch` behavior validated indirectly.

- **Module interactions in `TaskManager` (`src/taskManager.js`)**
  - `TaskManager.load()`:
    - `APIClient.fetchUsers()` + `APIClient.fetchTodos()` via `Promise.all`.
    - Creation of `User` instances from raw users.
    - Creation of `Task`/`PriorityTask` instances from raw todos via `toTaskInstances`.
    - Grouping tasks by user via `groupByUser`.
    - Attaching tasks to user instances via `User.addTask`.
  - Query methods:
    - `allTasks`, `tasksByUser`, `completedTasks`, `pendingTasks`, `statistics`, `usersLeaderboard`, `search`, `tags`, `getUserLabel`, `toggleTask`.

Mocking strategy:

- **APIClient integration tests (`tests/integration/api.test.js`)**
  - Mocked **global `fetch`** using `globalThis.fetch = mockFetch`.
  - `mockFetch` responses emulate:
    - Successful JSON (`ok: true`).
    - Network failures (`mockRejectedValueOnce`).
    - HTTP errors (404, 500, 503) via `ok: false` and `status`.
    - Invalid JSON via throwing inside `json()`.
  - Focus: validate that `APIClient`:
    - Calls the correct URLs.
    - Handles success, HTTP errors, network errors, and parsing errors correctly.
    - Implements caching semantics correctly.

- **Data flow integration tests (`tests/integration/dataFlow.test.js`)**
  - TaskManager is constructed with the **mock `APIClient`** from `tests/__mocks__/api.js`.
  - The mock APIClient returns in-memory `mockUsers` and `mockTodos` with realistic structure.
  - Focus: validate complete workflows using **mocked API**, but real `TaskManager`, `User`, `Task`, `PriorityTask`, and `taskProcessor` functions.

Complete workflows tested:

- **Workflow 1: Load data**
  - Call `TaskManager.load()`.
  - Validate:
    - API fetches happen (via mock).
    - `users` is an array of `User` instances with correct data.
    - `tasks` includes both `Task` and auto-upgraded `PriorityTask` instances.
    - Tasks are attached correctly to each user.
    - `loaded` flag is set.

- **Workflow 2: Statistics and filters**
  - After `load()`:
    - `statistics()` returns correctly computed stats.
    - `completedTasks()` and `pendingTasks()` return correct subsets.
    - `tasksByUser(userId)` returns only that user’s tasks.

- **Workflow 3: Searching and tags**
  - `search(...keywords)` returns tasks matching single and multiple keywords.
  - Case-insensitive search is verified.
  - `tags()` returns a `Set` of unique tags with length filter and lowercase transformation.

- **Workflow 4: Leaderboard**
  - `usersLeaderboard()` returns:
    - Properly shaped leaderboard entries (`id`, `name`, `username`, `rate`).
    - Sorted descending by completion rate.
    - Correct calculated rates per user.

- **Workflow 5: Toggle task**
  - `toggleTask(taskId)`:
    - Flips `completed` status.
    - Throws when task is not found.
    - Causes the owning user’s `getCompletionRate()` to reflect updated values.

- **Workflow 6: Error flows**
  - Accessing any query method before `load()` throws the appropriate "Data not loaded" error.
  - Load failures from API propagate as "Load failed: ..." errors.

---

### Mocks & Spies

External dependencies mocked:

- **Network layer**
  - `globalThis.fetch` is mocked in `api.test.js` to control HTTP responses and errors.
  - `tests/__mocks__/api.js` provides a fully mocked `APIClient` with:
    - `fetchUsers`, `fetchTodos`, `fetchUserTodos`.
    - Promise-based and async/await variants (`fetchUsersPromise`, etc.).
    - In-memory `mockUsers` and `mockTodos`.

- **CLI / console**
  - `console.log`, `console.error`, and `console.warn` are spied on and mocked to prevent noisy output while still verifying messages and call sequences.

Function calls spied on:

- **Array methods**
  - `Array.prototype.filter` in `filterByStatus`, `searchTasks`.
  - `Array.prototype.map` in `calculateStatistics`, `toTaskInstances`.
  - `Array.prototype.reduce` in `calculateStatistics`.
  - `Array.prototype.forEach` in `uniqueTags`.

- **Model and domain methods**
  - `Task.toggle` when `TaskManager.toggleTask` is invoked.
  - `Task.getStatus` as used in status filtering.
  - `Task.isOverdue` as used in statistics.
  - `User.addTask` during `TaskManager.load()`.
  - `User.getCompletionRate` during leaderboard computation.

- Console
  - `console.log`, `console.error`, `console.warn` used in CLI and error handling paths (where applicable).

Justification for mocking decisions:

- **Fetch / API**
  - Real network calls are slow and flaky; mocking fetch provides deterministic behavior and allows exhaustive error testing (network failures, HTTP errors, malformed JSON).
- **APIClient in data flow tests**
  - TaskManager tests focus on **data flow and transformation**, not the HTTP layer. Using a mock `APIClient` decouples TaskManager tests from HTTP details already covered in `api.test.js`.
- **Array method spies**
  - Spying on array methods ensures that the intended functional-style transformations are actually used (e.g., using `reduce` for aggregations) and provides confidence in implementation choices where performance and readability matter.
- **Console spies**
  - Prevents test logs from polluting output, while still verifying that error/warning messages are produced with expected content.

---

## Test Coverage Analysis

> Note: Insert the actual screenshot from `jest --coverage` here.

- **Overall coverage**
  - **Statements**: ≥ 80%
  - **Branches**: ≥ 75%
  - **Functions**: ≥ 85%
  - **Lines**: ≥ 80%

The coverage report confirms that we meet or exceed the required thresholds.

### Areas with lower coverage

- **`cli.js` and `main.js`**
  - The interactive CLI flow depends on `readline` and user input timing, which is harder to automate in Jest without additional tooling.
  - Only core error logging paths (e.g., initial load failure logging) are covered indirectly; full interactive flows are not fully exercised.

- **Browser-only UI code (`ui.js`, `uiMain.js`)**
  - DOM manipulations and event wiring are not heavily unit-tested due to the lack of a browser-like environment in the current Jest setup.
  - High-value integration is achieved via `TaskManager` + `APIClient` tests; UI-level coverage is intentionally lighter.

### Actions taken to improve coverage

- Added **boundary tests** for:
  - Empty arrays in processing functions.
  - Null/undefined inputs for processors and model constructors.
  - Edge cases in `Task.isOverdue` and `User.getCompletionRate`.
- Added **error-handling tests** for:
  - API network failures and HTTP error responses.
  - TaskManager’s `ensureLoaded` guard.
  - Non-existent task toggling and invalid IDs.

### Intentionally uncovered code (with justification)

- **Interactive CLI flows (`cli.js`)**
  - Highly coupled to `stdin/stdout` and user timing; would require additional frameworks or integration harnesses to test properly.
  - Risk is mitigated by thorough testing of underlying domain logic (TaskManager, processors, models).

- **DOM-specific UI rendering (`ui.js`, `uiMain.js`)**
  - DOM rendering tests would require a browser-like environment (e.g., jsdom) and significant setup.
  - The focus of this suite is on **data correctness and behavior**, not pixel-perfect UI rendering.

---

## Challenges & Solutions

### Challenge 1: Mocking `fetch` in an ES module / Jest environment

- **Issue**: `global.fetch = jest.fn()` caused linter warnings and required correct timing relative to module imports.
- **Solution**:
  - Switched to `globalThis.fetch = mockFetch`, which is the standard global reference in modern JS.
  - Defined `mockFetch` once at the top of `api.test.js` and assigned it to `globalThis.fetch` before importing `APIClient`.
  - Used `mockFetch` consistently in tests for stubbing and assertions.
- **Lesson learned**: In ESM contexts, always be explicit about the global object (`globalThis`) and initialize mocks before importing modules that depend on them.

### Challenge 2: Designing clear boundaries between unit and integration tests

- **Issue**: Risk of mixing responsibilities (e.g., having TaskManager tests also verify HTTP details).
- **Solution**:
  - **Unit tests**: Focused on pure logic (`models.js`, `taskProcessor.js`) with real implementations and no network.
  - **Integration tests for APIClient**: Use real `APIClient` + mocked `fetch`.
  - **Integration tests for TaskManager**: Use real `TaskManager` + mocked `APIClient` to avoid duplicating HTTP tests.
- **Lesson learned**: Clearly defining test responsibilities for each layer avoids duplication and keeps tests focused and maintainable.

### Challenge 3: Time-dependent logic in `Task.isOverdue` and `PriorityTask.isOverdue`

- **Issue**: `isOverdue()` depends on `Date.now()` and `timeStamp`/`dueDate`, making it easy to get boundary conditions wrong.
- **Solution**:
  - Manually set `timeStamp` and `dueDate` to specific offsets (e.g., 3 days ago, 8 days ago, exactly 7 days + 1ms).
  - Added tests for:
    - Recent vs old tasks.
    - Completed vs pending tasks.
    - Exact 7-day threshold behavior.
- **Lesson learned**: For time-based logic, always test explicit boundaries and override timestamps to remove randomness.

### Challenge 4: Linter warnings about unused parameters and globals

- **Issue**:
  - `options` parameters in mock API methods were unused, triggering eslint warnings.
  - `global` was not recognized as defined by the linter.
- **Solution**:
  - Used `void options;` in mocks to acknowledge intentionally unused parameters.
  - Switched from `global` to `globalThis` to satisfy both runtime and eslint.
- **Lesson learned**: Lint rules often signal design mismatches; when parameters are intentionally unused or environment-specific globals are needed, handle them explicitly and consistently.

---

## Key Learnings

- **Unit testing**
  - Encourages small, focused functions and classes with clear contracts.
  - Helps catch edge cases early (nulls, undefined, empty arrays, boundary values).
  - Makes refactoring safer by locking in behavior with descriptive tests.

- **Integration testing**
  - Validates real-world workflows across multiple modules.
  - Reveals issues that unit tests can’t see (e.g., mis-wired dependencies, incorrect sequence of calls).
  - Using mocks at the right boundaries (HTTP, external APIs) keeps tests fast and deterministic.

- **Mocking and spying**
  - Mocking external dependencies (like `fetch` and API clients) is essential for deterministic tests.
  - Spies (`jest.spyOn`) provide insight into **how** the code behaves, not just the final result (e.g., verifying use of `reduce`, or that `toggle()` is actually called).
  - Console and side-effect spying allow verification of user-facing feedback without producing noisy test output.

- **How testing improved code quality**
  - Forced clearer separation of concerns between networking, data processing, and orchestration.
  - Surfaced edge cases and error paths that weren’t initially obvious (e.g., invalid JSON, caching semantics, pre-load access).
  - Provided a safety net for future changes, making it easier to refactor and extend the codebase.
