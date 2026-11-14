export type TechFactCategory = 'Go' | 'Backend' | 'React' | 'Frontend' | 'Architecture'

export interface TechFact {
  id: number
  category: TechFactCategory
  title: string
  fact: string
}

export const TECH_FACTS: readonly TechFact[] = [
  {
    id: 1,
    category: 'Go',
    title: 'Preallocate Slices When Size Is Known',
    fact: 'Use make([]T, 0, n) when you know the approximate capacity to avoid repeated array reallocations and copying during append.',
  },
  {
    id: 2,
    category: 'Go',
    title: 'Accept Interfaces, Return Structs',
    fact: 'Define small consumer-side interfaces where dependencies are used, and return concrete structs from constructors to keep APIs flexible.',
  },
  {
    id: 3,
    category: 'Go',
    title: 'Always Cancel Context Timers',
    fact: 'Even if a context.WithTimeout block finishes early, always call defer cancel() to release timer resources immediately.',
  },
  {
    id: 4,
    category: 'Go',
    title: 'Defer Arguments Evaluate Immediately',
    fact: 'Arguments passed to a deferred function are evaluated when defer is scheduled, not when the surrounding function returns.',
  },
  {
    id: 5,
    category: 'Go',
    title: 'Nil Slices Are Safe to Append',
    fact: 'A nil slice has length 0 and capacity 0, works with len(), range, and append() out of the box without needing make().',
  },
  {
    id: 6,
    category: 'Go',
    title: 'Writing to a Nil Map Panics',
    fact: 'Reading from a nil map safely returns the zero value, but writing to an uninitialized nil map causes a runtime panic.',
  },
  {
    id: 7,
    category: 'Go',
    title: 'Wrap Errors with %w',
    fact: 'Use fmt.Errorf("context: %w", err) so callers can inspect the underlying error chain using errors.Is and errors.As.',
  },
  {
    id: 8,
    category: 'Go',
    title: 'Zero-Allocation Signal Channels',
    fact: 'Use chan struct{} instead of chan bool for signaling between goroutines because struct{}{} occupies zero bytes of memory.',
  },
  {
    id: 9,
    category: 'Go',
    title: 'Empty Struct Sets',
    fact: 'Implement a memory-efficient set in Go using map[string]struct{} where each value consumes zero additional bytes.',
  },
  {
    id: 10,
    category: 'Go',
    title: 'Avoid Goroutine Leaks on Channels',
    fact: 'Ensure every goroutine sending on an unbuffered channel has a receiver or selects on ctx.Done() so it never blocks forever.',
  },
  {
    id: 11,
    category: 'Go',
    title: 'Set Timeouts on http.Client',
    fact: 'Go’s default http.DefaultClient has no timeout; always configure an explicit Timeout on custom http.Client instances in production.',
  },
  {
    id: 12,
    category: 'Go',
    title: 'Drain and Close HTTP Response Bodies',
    fact: 'Always close resp.Body after checking err == nil so the underlying TCP connection can be reused by the HTTP transport pool.',
  },
  {
    id: 13,
    category: 'Go',
    title: 'Use sync.Once for Lazy Initialization',
    fact: 'sync.Once guarantees that an initialization function runs exactly once across all concurrent goroutines.',
  },
  {
    id: 14,
    category: 'Go',
    title: 'Run Tests with the Race Detector',
    fact: 'Use go test -race in CI pipelines to catch unsynchronized concurrent memory access before it reaches production.',
  },
  {
    id: 15,
    category: 'Go',
    title: 'Use strings.Builder for Concatenation',
    fact: 'Building strings in a loop with strings.Builder avoids O(n²) memory allocations caused by repeated + concatenation.',
  },
  {
    id: 16,
    category: 'Go',
    title: 'Table-Driven Subtests',
    fact: 'Combine slice-based test cases with t.Run(tc.name, ...) to isolate failures, filter test cases, and run subtests in parallel.',
  },
  {
    id: 17,
    category: 'Go',
    title: 'Avoid Copying sync.Mutex',
    fact: 'Always pass structs containing a sync.Mutex or sync.WaitGroup by pointer; copying a mutex duplicates its internal lock state.',
  },
  {
    id: 18,
    category: 'Go',
    title: 'Embed Static Assets with go:embed',
    fact: 'The embed package compiles SQL migrations, templates, or static files directly into the Go binary for single-file deployments.',
  },
  {
    id: 19,
    category: 'Go',
    title: 'Check sql.Rows.Err After Loops',
    fact: 'After iterating with rows.Next(), always check rows.Err() to catch network or cursor failures that terminated the loop early.',
  },
  {
    id: 20,
    category: 'Go',
    title: 'Graceful HTTP Server Shutdown',
    fact: 'Use srv.Shutdown(ctx) with signal.NotifyContext so in-flight HTTP requests finish cleanly before the process exits.',
  },
  {
    id: 21,
    category: 'Backend',
    title: 'Use Parameterized SQL Queries',
    fact: 'Always bind user inputs via placeholders ($1, $2) instead of string formatting to eliminate SQL injection vulnerabilities.',
  },
  {
    id: 22,
    category: 'Backend',
    title: 'Database Transactions Should Be Short',
    fact: 'Never make external HTTP calls or S3 uploads inside an open database transaction, as it holds row locks and exhausts connection pools.',
  },
  {
    id: 23,
    category: 'Backend',
    title: 'Idempotency Keys Prevent Double Charges',
    fact: 'Accept an Idempotency-Key header on state-changing POST requests so client retries safely return the original result.',
  },
  {
    id: 24,
    category: 'Backend',
    title: 'Composite Index Column Order Matters',
    fact: 'In PostgreSQL, a B-tree index on (module_id, student_id) accelerates queries filtering by module_id alone, but not student_id alone.',
  },
  {
    id: 25,
    category: 'Backend',
    title: 'Cursor Pagination Beats OFFSET at Scale',
    fact: 'Large OFFSET values force the database to scan and discard rows; keyset pagination (WHERE id > last_id) stays fast at any depth.',
  },
  {
    id: 26,
    category: 'Backend',
    title: 'Solve N+1 Queries with Batch Loading',
    fact: 'Instead of running a query inside a loop for each parent row, fetch child records in a single WHERE parent_id = ANY($1) query.',
  },
  {
    id: 27,
    category: 'Backend',
    title: 'Hash Refresh Tokens Before Storing',
    fact: 'Store SHA-256 hashes of refresh tokens in the database so a database read leak cannot be used to mint new access tokens.',
  },
  {
    id: 28,
    category: 'Backend',
    title: 'Keep JWT Access Tokens Short-Lived',
    fact: 'Stateless JWT access tokens cannot be revoked easily without a blocklist; keep their TTL short (5–15 minutes) and rotate refresh tokens.',
  },
  {
    id: 29,
    category: 'Backend',
    title: 'Use 409 Conflict for Duplicate State',
    fact: 'Return HTTP 409 when a request conflicts with existing resource state, such as a duplicate enrollment or an already-submitted quiz.',
  },
  {
    id: 30,
    category: 'Backend',
    title: 'Distinguish 401 vs 403',
    fact: 'HTTP 401 Unauthorized means the caller is not authenticated; HTTP 403 Forbidden means the caller’s identity is known but lacks permission.',
  },
  {
    id: 31,
    category: 'Backend',
    title: 'Partial Unique Indexes for Soft Deletes',
    fact: 'In PostgreSQL, use CREATE UNIQUE INDEX ... WHERE deleted_at IS NULL so soft-deleted rows do not block recreating the same record.',
  },
  {
    id: 32,
    category: 'Backend',
    title: 'Always Store Timestamps in UTC',
    fact: 'Use TIMESTAMPTZ in PostgreSQL and store all server timestamps in UTC, converting to local time zones only at the presentation layer.',
  },
  {
    id: 33,
    category: 'Backend',
    title: 'Use SELECT FOR UPDATE for Atomic Reads',
    fact: 'When reading a row to validate and update it inside a transaction, lock it with FOR UPDATE to prevent race conditions.',
  },
  {
    id: 34,
    category: 'Backend',
    title: 'Separate Liveness and Readiness Probes',
    fact: 'Liveness (/healthz) checks if the process is running; Readiness (/readyz) verifies dependencies like the DB before routing traffic.',
  },
  {
    id: 35,
    category: 'Backend',
    title: 'Bound Request Payload Sizes',
    fact: 'Wrap incoming request bodies with http.MaxBytesReader to protect server memory from oversized JSON or multipart uploads.',
  },
  {
    id: 36,
    category: 'Backend',
    title: 'Return 202 Accepted for Async Jobs',
    fact: 'When triggering slow background work like AI generation, return HTTP 202 immediately with a status field the client can poll.',
  },
  {
    id: 37,
    category: 'Backend',
    title: 'Hash Passwords with Bcrypt or Argon2id',
    fact: 'Plain SHA-256 is too fast for passwords; use adaptive hashing like bcrypt or Argon2id with a per-user cryptographic salt.',
  },
  {
    id: 38,
    category: 'Backend',
    title: 'Configure Connection Pool Limits',
    fact: 'Set MaxOpenConns, MaxIdleConns, and ConnMaxLifetime on sql.DB to avoid exhausting PostgreSQL max_connections under load.',
  },
  {
    id: 39,
    category: 'Backend',
    title: 'Use EXPLAIN ANALYZE to Profile SQL',
    fact: 'Run EXPLAIN (ANALYZE, BUFFERS) on slow SQL queries to see actual execution time, sequential scans, and buffer hits.',
  },
  {
    id: 40,
    category: 'Backend',
    title: 'Never Leak Internal Errors to Clients',
    fact: 'Log detailed database and stack errors server-side, but return structured, safe error codes and messages in the HTTP response.',
  },
  {
    id: 41,
    category: 'React',
    title: 'Derive State Instead of Syncing It',
    fact: 'If a value can be computed from existing props or state during render, calculate it inline instead of copying it with useEffect.',
  },
  {
    id: 42,
    category: 'React',
    title: 'Use Stable Keys in Dynamic Lists',
    fact: 'Never use array indices as keys when items can be reordered, inserted, or deleted; use stable domain IDs to preserve component state.',
  },
  {
    id: 43,
    category: 'React',
    title: 'Reset Component State with the key Prop',
    fact: 'Passing a new key (like key={item.id}) to a form or runner component cleanly resets all of its internal state without useEffect.',
  },
  {
    id: 44,
    category: 'React',
    title: 'Functional State Updates Prevent Stale Closures',
    fact: 'Use setCount(prev => prev + 1) when the next state depends on the previous state inside async callbacks or event handlers.',
  },
  {
    id: 45,
    category: 'React',
    title: 'Lazy Initializer for Expensive useState',
    fact: 'Pass a function useState(() => readLocalStorage()) so expensive initial computations run only on mount, not on every render.',
  },
  {
    id: 46,
    category: 'React',
    title: 'useRef Does Not Trigger Re-renders',
    fact: 'Store mutable values like timer IDs, DOM nodes, or drag thresholds in useRef when changing them should not re-render the UI.',
  },
  {
    id: 47,
    category: 'React',
    title: 'Clean Up Subscriptions in useEffect',
    fact: 'Always return a cleanup function from useEffect to remove window event listeners, clear intervals, or abort in-flight fetches.',
  },
  {
    id: 48,
    category: 'React',
    title: 'Keep State Minimal and Normalized',
    fact: 'Store selectedItemId in state rather than duplicating the entire item object so updates to the main list stay in sync automatically.',
  },
  {
    id: 49,
    category: 'React',
    title: 'Split Contexts by Update Frequency',
    fact: 'Separating fast-changing state (like hover coordinates) from slow-changing state prevents unnecessary re-renders across consumers.',
  },
  {
    id: 50,
    category: 'React',
    title: 'AbortController in Data Fetching Effects',
    fact: 'Pass an AbortController signal to fetch requests inside useEffect so rapid navigation never applies out-of-order responses.',
  },
  {
    id: 51,
    category: 'React',
    title: 'Colocate State Close to Where It Is Used',
    fact: 'Keep modal inputs and filter text in the leaf component that needs them; lift state up only when sibling components must share it.',
  },
  {
    id: 52,
    category: 'React',
    title: 'Children Prop Avoids Re-rendering Subtrees',
    fact: 'When a wrapper component manages state and renders {children}, React skips re-rendering the children when only the wrapper state changes.',
  },
  {
    id: 53,
    category: 'React',
    title: 'Avoid Creating Components Inside Components',
    fact: 'Defining a child component function inside a parent component creates a new function reference every render, unmounting its DOM and state.',
  },
  {
    id: 54,
    category: 'React',
    title: 'Batching State Updates in React 18+',
    fact: 'React automatically batches multiple setState calls inside promises, timeouts, and native event handlers into a single render pass.',
  },
  {
    id: 55,
    category: 'React',
    title: 'Controlled Inputs Need Defined Values',
    fact: 'Always pass value={text ?? ""} to controlled inputs so they never switch between uncontrolled (undefined) and controlled mid-lifecycle.',
  },
  {
    id: 56,
    category: 'React',
    title: 'Custom Hooks Share Logic, Not State',
    fact: 'Calling a custom hook in two components creates two completely independent state instances while reusing the stateful logic.',
  },
  {
    id: 57,
    category: 'React',
    title: 'Use Portal for Modals and Tooltips',
    fact: 'Rendering modals via createPortal into document.body avoids clipping and z-index stacking context bugs caused by parent overflow:hidden.',
  },
  {
    id: 58,
    category: 'React',
    title: 'Guard Against 0 Rendering in JSX',
    fact: 'Use items.length > 0 && <List /> instead of items.length && <List /> so React does not render a literal "0" when the array is empty.',
  },
  {
    id: 59,
    category: 'React',
    title: 'Prefer Explicit Event Handlers Over Effects',
    fact: 'User-triggered actions like submitting a form or analytics logging belong in onClick/onSubmit handlers rather than reactive useEffects.',
  },
  {
    id: 60,
    category: 'React',
    title: 'Use Error Boundaries for Resilient UI',
    fact: 'Wrap major feature panels in an Error Boundary so an unexpected render error in one widget does not crash the entire application.',
  },
  {
    id: 61,
    category: 'Frontend',
    title: 'URL Hash Fragments Never Hit the Server',
    fact: 'Anything after # in a URL is processed purely in the browser and is never sent in HTTP request headers, avoiding 431 Header Too Large errors.',
  },
  {
    id: 62,
    category: 'Frontend',
    title: 'Use 100dvh Instead of 100vh on Mobile',
    fact: 'Dynamic viewport height (h-dvh) adapts automatically when mobile browser address bars expand or retract, preventing cut-off footers.',
  },
  {
    id: 63,
    category: 'Frontend',
    title: 'Discriminated Unions in TypeScript',
    fact: 'Use a shared literal field like type: "assignment" | "resource" | "quiz" so TypeScript narrows the exact item shape in switch/if blocks.',
  },
  {
    id: 64,
    category: 'Frontend',
    title: 'Distinguish Drag from Click with Pointer Delta',
    fact: 'On interactive pan/zoom canvases, measure Math.hypot(dx, dy) between pointerdown and pointerup to ignore accidental clicks after dragging.',
  },
  {
    id: 65,
    category: 'Frontend',
    title: 'Prefer unknown Over any for External Data',
    fact: 'Type untrusted JSON or catch errors as unknown so TypeScript forces runtime type checks before accessing properties.',
  },
  {
    id: 66,
    category: 'Frontend',
    title: 'Animate transform and opacity for 60fps',
    fact: 'Animating CSS transform and opacity runs on the GPU compositor thread without triggering expensive layout or paint recalculations.',
  },
  {
    id: 67,
    category: 'Frontend',
    title: 'Always Specify type="button" Inside Forms',
    fact: 'A <button> without a type attribute defaults to type="submit", which can accidentally submit an enclosing form when clicked.',
  },
  {
    id: 68,
    category: 'Frontend',
    title: 'Debounce Search Inputs',
    fact: 'Wait 200–300ms after the user stops typing before firing search API requests to reduce server load and UI flicker.',
  },
  {
    id: 69,
    category: 'Frontend',
    title: 'Use ResizeObserver Instead of Window Resize',
    fact: 'ResizeObserver reacts directly when a specific container changes size, even when caused by sidebar toggles or dynamic content.',
  },
  {
    id: 70,
    category: 'Frontend',
    title: 'Beware of new Date("YYYY-MM-DD") Timezone Shifts',
    fact: 'Parsing a date-only ISO string with new Date("2026-11-14") treats it as UTC midnight, which can shift to the previous day in local time.',
  },
  {
    id: 71,
    category: 'Frontend',
    title: 'Use rel="noopener noreferrer" on External Links',
    fact: 'When opening external links with target="_blank", include rel="noopener noreferrer" to protect the opener page and hide referrer data.',
  },
  {
    id: 72,
    category: 'Frontend',
    title: 'Run Independent Requests with Promise.all',
    fact: 'Avoid sequential await waterfalls when fetching independent endpoints; run them concurrently with Promise.all to cut load time.',
  },
  {
    id: 73,
    category: 'Frontend',
    title: 'Set min-w-0 on Flex Children for Truncation',
    fact: 'Flex items default to min-width: auto, which prevents text-overflow: ellipsis from working unless you add min-w-0 to the flex child.',
  },
  {
    id: 74,
    category: 'Frontend',
    title: 'Keyboard Accessibility for Modals',
    fact: 'Every modal dialog should close on Escape, trap focus inside while open, and restore focus to the trigger button when closed.',
  },
  {
    id: 75,
    category: 'Frontend',
    title: 'Use URLSearchParams for Query Strings',
    fact: 'Build query strings with new URLSearchParams() instead of manual string concatenation so special characters are URI-encoded safely.',
  },
  {
    id: 76,
    category: 'Frontend',
    title: 'Code-Split Heavy Routes with lazy()',
    fact: 'Load large admin dashboards or editors on demand with React.lazy() and dynamic import() to keep the initial bundle small and fast.',
  },
  {
    id: 77,
    category: 'Frontend',
    title: 'Use CSS Custom Properties for Dynamic Metrics',
    fact: 'Publishing measured heights to a CSS variable like --header-h lets child canvases size themselves purely in CSS calc() without re-renders.',
  },
  {
    id: 78,
    category: 'Frontend',
    title: 'Optimistic UI Updates Improve Perceived Speed',
    fact: 'Update local UI state immediately on user action and roll back only if the network request fails to make interactions feel instant.',
  },
  {
    id: 79,
    category: 'Frontend',
    title: 'Respect prefers-reduced-motion',
    fact: 'Use motion-reduce utilities or media queries to tone down large zoom or spin transitions for users sensitive to screen motion.',
  },
  {
    id: 80,
    category: 'Frontend',
    title: 'Never Trust Client-Side Validation Alone',
    fact: 'Frontend validation provides fast UX feedback, but every permission, role, and deadline rule must be enforced on the backend.',
  },
  {
    id: 81,
    category: 'Architecture',
    title: 'Transactional Outbox Pattern',
    fact: 'Write domain changes and outgoing message events in the same DB transaction, then publish asynchronously so events are never lost.',
  },
  {
    id: 82,
    category: 'Architecture',
    title: 'Design Consumers for At-Least-Once Delivery',
    fact: 'Message brokers like RabbitMQ may redeliver messages after network blips; make consumers idempotent by tracking processed event IDs.',
  },
  {
    id: 83,
    category: 'Architecture',
    title: 'Dependency Inversion at Package Boundaries',
    fact: 'High-level business services should depend on interfaces (like Store or QuizGenerator) rather than low-level SQL or HTTP implementations.',
  },
  {
    id: 84,
    category: 'Architecture',
    title: 'Exponential Backoff with Jitter',
    fact: 'When retrying failed network or broker calls, add random jitter to exponential backoff so recovering services are not hit by a thundering herd.',
  },
  {
    id: 85,
    category: 'Architecture',
    title: 'Stateless API Servers Scale Horizontally',
    fact: 'Keeping session state in tokens or shared stores instead of local process memory allows any load-balanced replica to serve any request.',
  },
  {
    id: 86,
    category: 'Architecture',
    title: 'Separate Domain Models from Wire DTOs',
    fact: 'Decoupling database entities from JSON request/response DTOs lets you evolve internal schemas without breaking public API contracts.',
  },
  {
    id: 87,
    category: 'Architecture',
    title: 'Circuit Breakers Prevent Cascading Failures',
    fact: 'When a downstream API or SMTP server is failing repeatedly, trip a circuit breaker to fail fast instead of tying up worker threads.',
  },
  {
    id: 88,
    category: 'Architecture',
    title: 'Store Secrets in Environment, Never in Git',
    fact: 'Follow the Twelve-Factor App principle: inject API keys and database credentials via environment variables and keep .env gitignored.',
  },
  {
    id: 89,
    category: 'Architecture',
    title: 'Use Presigned URLs for Large File Transfers',
    fact: 'Offload heavy file downloads and uploads to S3-compatible object storage while keeping metadata and authorization checks in the API.',
  },
  {
    id: 90,
    category: 'Architecture',
    title: 'Forward-Compatible Database Migrations',
    fact: 'Add nullable columns or new tables before deploying code that uses them so zero-downtime rolling deployments never break old instances.',
  },
  {
    id: 91,
    category: 'Architecture',
    title: 'Dead-Letter Queues (DLQ) for Poison Messages',
    fact: 'Route permanently failing messages to a Dead-Letter Queue after max retries so one malformed payload never blocks the entire queue.',
  },
  {
    id: 92,
    category: 'Architecture',
    title: 'Cache-Aside with Explicit TTLs',
    fact: 'Always set an upper-bound TTL on cached entries so even if a cache invalidation event is missed, stale data eventually self-heals.',
  },
  {
    id: 93,
    category: 'Architecture',
    title: 'Classify Transient vs. Permanent Errors',
    fact: 'Retry transient network timeouts and 503 responses, but fail immediately on permanent errors like 400 Bad Request or invalid credentials.',
  },
  {
    id: 94,
    category: 'Architecture',
    title: 'Propagate Correlation IDs Across Services',
    fact: 'Attach a unique request or event ID to logs and message envelopes so a single user action can be traced across API and worker services.',
  },
  {
    id: 95,
    category: 'Architecture',
    title: 'Defense in Depth for Authorization',
    fact: 'Enforce role guards at the route middleware layer AND verify resource ownership or module assignment inside the service layer.',
  },
  {
    id: 96,
    category: 'Architecture',
    title: 'Keep Background Workers Observable',
    fact: 'Expose health checks, structured error logs, and delivery status tables for async workers so silent background failures are visible.',
  },
  {
    id: 97,
    category: 'Architecture',
    title: 'Prefer Composition Over Deep Inheritance',
    fact: 'Compose small focused components and services rather than building deep inheritance hierarchies that become brittle when requirements change.',
  },
  {
    id: 98,
    category: 'Architecture',
    title: 'Fail Fast on Startup Misconfiguration',
    fact: 'Validate required environment variables, database connectivity, and migrations at boot time so broken deployments fail immediately.',
  },
  {
    id: 99,
    category: 'Architecture',
    title: 'CQRS for Asymmetric Read/Write Workloads',
    fact: 'Separate complex write validation models from optimized read queries when dashboards and course views need fast aggregated data.',
  },
  {
    id: 100,
    category: 'Architecture',
    title: 'Automate Checks in CI Pipelines',
    fact: 'Run typechecking, linting, unit tests, and secret scanning on every pull request so regressions are caught before code review.',
  },
]

export function getRandomTechFact(excludeId?: number): TechFact {
  if (TECH_FACTS.length === 0) {
    throw new Error('TECH_FACTS cannot be empty')
  }
  if (TECH_FACTS.length === 1) {
    return TECH_FACTS[0]
  }
  let candidate = TECH_FACTS[Math.floor(Math.random() * TECH_FACTS.length)]
  while (excludeId !== undefined && candidate.id === excludeId) {
    candidate = TECH_FACTS[Math.floor(Math.random() * TECH_FACTS.length)]
  }
  return candidate
}
