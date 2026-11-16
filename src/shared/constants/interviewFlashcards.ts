export type FlashcardTopic = 'Go' | 'SQL' | 'System Design' | 'React'

export type FlashcardDifficulty = 'Junior' | 'Mid' | 'Senior'

export interface InterviewFlashcard {
  id: string
  topic: FlashcardTopic
  difficulty: FlashcardDifficulty
  question: string
  answer: string
  keyPoint: string
}

export const INTERVIEW_FLASHCARDS: InterviewFlashcard[] = [
  // ================= GO (10) =================
  {
    id: 'go-1',
    topic: 'Go',
    difficulty: 'Junior',
    question: 'What is the difference between a slice and an array in Go, and what happens when append() exceeds capacity?',
    answer:
      'An array has a fixed size defined at compile time and is a value type, whereas a slice is a lightweight descriptor (pointer to underlying array, length, and capacity). When append() exceeds capacity, Go allocates a new larger underlying array (typically growing by ~2x for small slices), copies existing elements over, and returns a new slice header.',
    keyPoint: 'Always assign the result of append(s, x) back to s because the backing array pointer may change.',
  },
  {
    id: 'go-2',
    topic: 'Go',
    difficulty: 'Mid',
    question: 'How do buffered and unbuffered channels differ in Go concurrency?',
    answer:
      'An unbuffered channel has zero capacity, so a send blocks until another goroutine receives from it (synchronous handoff). A buffered channel has capacity N: sends only block when the buffer is full, and receives only block when the buffer is empty.',
    keyPoint: 'Closing a channel signals no more values will be sent; receiving from a closed channel returns buffered items first, then the zero value immediately.',
  },
  {
    id: 'go-3',
    topic: 'Go',
    difficulty: 'Mid',
    question: 'Why is a Go map not safe for concurrent read/write access, and how do you protect it?',
    answer:
      'Go maps do not synchronize internal bucket mutations; concurrent writes (or read + write) trigger a fatal runtime panic ("concurrent map read and map write"). You can protect a map using sync.Mutex / sync.RWMutex, or use sync.Map when keys are mostly stable and reads far outnumber writes.',
    keyPoint: 'Fatal concurrent map panics cannot be caught with recover(); always synchronize map access.',
  },
  {
    id: 'go-4',
    topic: 'Go',
    difficulty: 'Junior',
    question: 'How does defer work in Go, in what order do multiple defers run, and when are arguments evaluated?',
    answer:
      'Deferred function calls execute in LIFO (Last-In, First-Out) order right before the surrounding function returns. However, the arguments passed to a deferred call are evaluated immediately when the defer statement is executed, not when the function actually runs.',
    keyPoint: 'Use a closure defer func() { ... }() if you need to read the latest value of a variable at return time.',
  },
  {
    id: 'go-5',
    topic: 'Go',
    difficulty: 'Mid',
    question: 'Why should you pass context.Context as the first parameter in Go backend services?',
    answer:
      'context.Context propagates request-scoped cancellation signals, deadlines/timeouts, and trace metadata across API boundaries, database queries, and goroutines. When a client disconnects or a timeout expires, downstream DB/HTTP calls abort immediately instead of leaking goroutines.',
    keyPoint: 'Never store Context inside a struct; pass it explicitly as ctx context.Context as the first argument.',
  },
  {
    id: 'go-6',
    topic: 'Go',
    difficulty: 'Mid',
    question: 'What is the "nil interface" trap in Go (why does an interface holding a typed nil pointer compare != nil)?',
    answer:
      'An interface value in Go consists of two words: a dynamic type descriptor and a dynamic data pointer. An interface is only == nil when BOTH type and value are nil. If you return a nil *MyError as an error interface, the type descriptor is *MyError, so err != nil evaluates to true.',
    keyPoint: 'Return an explicit untyped nil for error rather than a typed nil pointer variable.',
  },
  {
    id: 'go-7',
    topic: 'Go',
    difficulty: 'Senior',
    question: 'How does Go’s M:N scheduler (G-M-P model) manage thousands of goroutines efficiently?',
    answer:
      'Go multiplexes Goroutines (G) onto Logical Processors (P, set by GOMAXPROCS) executed by OS Threads (M). Each P has a local run queue of runnable goroutines, and uses work-stealing from other Ps when idle. If a goroutine blocks on a syscall or network I/O, the runtime detaches M or parks G on the netpoller without blocking the OS thread.',
    keyPoint: 'Goroutines start with a tiny ~2KB dynamic stack vs ~1–8MB for OS threads.',
  },
  {
    id: 'go-8',
    topic: 'Go',
    difficulty: 'Mid',
    question: 'What causes goroutine leaks in production Go services and how do you prevent them?',
    answer:
      'A goroutine leaks when it blocks forever waiting on a channel send/receive that no other goroutine will ever read/write, or on an HTTP/network call without a timeout. Prevent leaks by selecting on <-ctx.Done(), closing producer channels properly, and setting timeouts on http.Client.',
    keyPoint: 'Always pair background worker goroutines with a cancellation context or done channel.',
  },
  {
    id: 'go-9',
    topic: 'Go',
    difficulty: 'Junior',
    question: 'How do errors.Is and errors.As work with wrapped errors (%w) in Go?',
    answer:
      'Formatting an error with fmt.Errorf("...: %w", err) wraps the original error in a chain. errors.Is(err, target) unwraps the chain to check if any error matches a specific sentinel value (like sql.ErrNoRows), while errors.As(err, &target) checks if any error in the chain matches a specific struct/type.',
    keyPoint: 'Prefer errors.Is(err, pgx.ErrNoRows) over == because middleware or repos may wrap the error.',
  },
  {
    id: 'go-10',
    topic: 'Go',
    difficulty: 'Senior',
    question: 'What is escape analysis in Go and why does it matter for latency?',
    answer:
      'Escape analysis is the compiler pass that determines whether a variable’s lifetime is confined to its stack frame or "escapes" to the heap (e.g., returning a pointer, storing in an interface, or growing too large). Stack allocations are free and cleaned up on return, whereas heap allocations add pressure on the Garbage Collector (GC).',
    keyPoint: 'Inspect compiler decisions anytime with go build -gcflags="-m".',
  },

  // ================= SQL (10) =================
  {
    id: 'sql-1',
    topic: 'SQL',
    difficulty: 'Junior',
    question: 'How does a composite B-Tree index on (A, B) work, and why does column order matter?',
    answer:
      'A composite B-Tree index on (A, B) sorts rows first by column A, and then by column B within each value of A (the leftmost prefix rule). Queries filtering by WHERE A = ? or WHERE A = ? AND B = ? use the index, but a query filtering only by WHERE B = ? cannot use the B-Tree ordering efficiently.',
    keyPoint: 'Place equality columns first and range/sort columns second in composite indexes.',
  },
  {
    id: 'sql-2',
    topic: 'SQL',
    difficulty: 'Junior',
    question: 'What is the difference between WHERE and HAVING in SQL, and what is the logical query execution order?',
    answer:
      'WHERE filters individual rows BEFORE grouping (GROUP BY) and aggregation occur, so it cannot reference aggregate functions. HAVING filters groups AFTER GROUP BY and aggregate functions (COUNT, SUM, AVG) have been computed.',
    keyPoint: 'Logical order: FROM/JOIN -> WHERE -> GROUP BY -> HAVING -> SELECT -> DISTINCT -> ORDER BY -> LIMIT.',
  },
  {
    id: 'sql-3',
    topic: 'SQL',
    difficulty: 'Mid',
    question: 'What are the 4 ACID properties and how do Read Committed vs Repeatable Read isolation levels differ in PostgreSQL?',
    answer:
      'ACID stands for Atomicity, Consistency, Isolation, and Durability. In PostgreSQL’s default Read Committed level, each statement in a transaction sees data committed before that statement began. In Repeatable Read, all statements in the transaction see a consistent snapshot from when the first query of the transaction started.',
    keyPoint: 'PostgreSQL uses MVCC (Multi-Version Concurrency Control) so readers never block writers and writers never block readers.',
  },
  {
    id: 'sql-4',
    topic: 'SQL',
    difficulty: 'Mid',
    question: 'What is the N+1 query problem in backend APIs and how do you fix it?',
    answer:
      'The N+1 problem happens when code executes 1 query to fetch N parent records (e.g., 20 modules) and then loops N times executing 1 query per parent to fetch child records (e.g., 20 separate queries for items). Fix it using a single JOIN query or a batch query with WHERE module_id = ANY($1).',
    keyPoint: 'Reducing 21 round-trips to 1–2 queries dramatically cuts API tail latency.',
  },
  {
    id: 'sql-5',
    topic: 'SQL',
    difficulty: 'Mid',
    question: 'How do ROW_NUMBER(), RANK(), and DENSE_RANK() window functions differ?',
    answer:
      'All three assign rankings over a window (OVER (PARTITION BY ... ORDER BY ...)) without collapsing rows. For tied values (e.g., two players tied for 1st): ROW_NUMBER gives 1, 2, 3; RANK gives 1, 1, 3 (skips 2); DENSE_RANK gives 1, 1, 2 (no gap).',
    keyPoint: 'Window functions run after WHERE and GROUP BY, so wrap them in a CTE or subquery to filter by rank.',
  },
  {
    id: 'sql-6',
    topic: 'SQL',
    difficulty: 'Mid',
    question: 'What is the difference between EXPLAIN and EXPLAIN ANALYZE in PostgreSQL?',
    answer:
      'EXPLAIN only shows the query planner’s estimated execution plan and cost without running the SQL. EXPLAIN ANALYZE actually executes the query and reports real execution time, actual row counts, loops, and index vs sequential scan usage.',
    keyPoint: 'Wrap EXPLAIN ANALYZE of INSERT/UPDATE/DELETE inside BEGIN ... ROLLBACK so you do not mutate production data.',
  },
  {
    id: 'sql-7',
    topic: 'SQL',
    difficulty: 'Senior',
    question: 'When should you use SELECT ... FOR UPDATE vs optimistic locking?',
    answer:
      'SELECT ... FOR UPDATE (pessimistic locking) locks the selected rows at the DB level until the transaction commits, preventing concurrent transactions from modifying them—ideal for high-contention financial or booking updates. Optimistic locking uses a version or updated_at column (WHERE id = $1 AND version = $2) without holding row locks.',
    keyPoint: 'Always lock rows in a deterministic ID order when updating multiple rows to prevent deadlocks.',
  },
  {
    id: 'sql-8',
    topic: 'SQL',
    difficulty: 'Junior',
    question: 'Why is UNION ALL faster than UNION, and how does NOT IN behave when NULLs are present?',
    answer:
      'UNION deduplicates rows, requiring an expensive sort or hash aggregation step, whereas UNION ALL simply concatenates results without deduplicating. For NOT IN (subquery), if the subquery returns even a single NULL, the entire WHERE x NOT IN (...) condition evaluates to UNKNOWN and returns 0 rows!',
    keyPoint: 'Prefer NOT EXISTS over NOT IN when nullable columns are involved.',
  },
  {
    id: 'sql-9',
    topic: 'SQL',
    difficulty: 'Senior',
    question: 'Why is keyset (cursor) pagination much faster than OFFSET/LIMIT on large tables?',
    answer:
      'With OFFSET 100000 LIMIT 20, PostgreSQL still has to scan and discard all 100,000 skipped rows before returning 20. Keyset pagination (WHERE (created_at, id) < ($1, $2) ORDER BY created_at DESC, id DESC LIMIT 20) jumps directly to the position in the B-Tree index in O(log N) time.',
    keyPoint: 'Always include a unique tie-breaker column (like id) in cursor pagination.',
  },
  {
    id: 'sql-10',
    topic: 'SQL',
    difficulty: 'Mid',
    question: 'How does PostgreSQL JSONB differ from JSON, and how do you index JSONB fields?',
    answer:
      'JSON stores an exact text copy that must be reparsed on every query, whereas JSONB stores data in a decomposed binary format that supports fast key lookups and indexing. You can index all keys/values inside a JSONB column using a GIN index, or index a specific expression with a B-Tree index.',
    keyPoint: 'Use JSONB for structured metadata that needs querying, and regular columns for core relational keys.',
  },

  // ================= SYSTEM DESIGN (10) =================
  {
    id: 'sd-1',
    topic: 'System Design',
    difficulty: 'Mid',
    question: 'What is the Transactional Outbox Pattern and why did we use it with RabbitMQ?',
    answer:
      'If a service writes to PostgreSQL and then publishes a message to RabbitMQ directly, a crash or networkblip between the two leaves the DB and message broker inconsistent (dual-write problem). With the Outbox Pattern, the business record and an outbox_events row are inserted in the SAME DB transaction, and a background worker reliably publishes pending outbox rows to RabbitMQ.',
    keyPoint: 'Outbox guarantees at-least-once delivery, so downstream consumers must be idempotent.',
  },
  {
    id: 'sd-2',
    topic: 'System Design',
    difficulty: 'Mid',
    question: 'How do you make a payment or booking POST endpoint idempotent?',
    answer:
      'Clients send a unique Idempotency-Key header (UUID) with the request. The server stores the key and response status in a database/Redis table with a unique constraint. If the client retries due to a network timeout, the server detects the existing key and returns the original result instead of executing the action twice.',
    keyPoint: 'Combine Idempotency-Key with database unique constraints for defense in depth.',
  },
  {
    id: 'sd-3',
    topic: 'System Design',
    difficulty: 'Junior',
    question: 'Compare Cache-Aside vs Write-Through caching strategies and explain Cache Stampede.',
    answer:
      'In Cache-Aside, the app checks Redis first; on a miss, it reads from Postgres, populates Redis with a TTL, and returns. In Write-Through, every write updates both cache and DB synchronously. A Cache Stampede happens when a popular key expires and thousands of concurrent requests miss the cache and hit the DB simultaneously.',
    keyPoint: 'Prevent cache stampedes using singleflight / mutex locks on cache regeneration or jittered TTLs.',
  },
  {
    id: 'sd-4',
    topic: 'System Design',
    difficulty: 'Mid',
    question: 'How do Token Bucket and Sliding Window rate limiters work?',
    answer:
      'A Token Bucket holds up to B tokens and refills at rate R tokens/second—allowing short bursts up to B while capping sustained traffic at R. A Sliding Window Counter tracks request counts across the current and previous time windows in Redis to enforce smooth per-user or per-IP limits without boundary spikes.',
    keyPoint: 'Return HTTP 429 Too Many Requests with a Retry-After header when rate limits are exceeded.',
  },
  {
    id: 'sd-5',
    topic: 'System Design',
    difficulty: 'Junior',
    question: 'Why do systems use short-lived JWT Access Tokens paired with Refresh Tokens?',
    answer:
      'Stateless JWT access tokens can be verified without a DB lookup, but cannot be easily revoked until they expire. Keeping access tokens short-lived (e.g., 15 minutes) limits the window of compromise, while a longer-lived refresh token (stored in DB/Redis) can be rotated and revoked immediately on logout.',
    keyPoint: 'Never store sensitive secrets inside a JWT payload because base64url is readable by anyone.',
  },
  {
    id: 'sd-6',
    topic: 'System Design',
    difficulty: 'Mid',
    question: 'When should you choose WebSockets vs Server-Sent Events (SSE) vs Short Polling?',
    answer:
      'Use WebSockets for low-latency bidirectional communication (chat, multiplayer games). Use SSE when only the server needs to push live updates to the browser over standard HTTP (live notifications, AI streaming, build logs). Use Short Polling only for simple low-frequency checks.',
    keyPoint: 'SSE works over regular HTTP/2 and automatically reconnects in the browser via EventSource.',
  },
  {
    id: 'sd-7',
    topic: 'System Design',
    difficulty: 'Senior',
    question: 'What does the CAP theorem really mean during a network partition?',
    answer:
      'In a distributed system, network partitions (P) are inevitable, so you must choose between Consistency (CP: reject writes/reads on the minority side so stale data is never served) and Availability (AP: continue serving reads/writes on both sides and reconcile conflicts later).',
    keyPoint: 'Financial ledgers and seat bookings require CP; social feeds and analytics often favor AP.',
  },
  {
    id: 'sd-8',
    topic: 'System Design',
    difficulty: 'Mid',
    question: 'How do Presigned S3 URLs improve backend scalability for file uploads?',
    answer:
      'Instead of streaming multi-megabyte files through your Go API servers (consuming memory, CPU, and bandwidth), the backend authenticates the user, generates a short-lived signed URL for S3/MinIO, and the client uploads the binary directly to object storage.',
    keyPoint: 'Validate file size limits and MIME types in the presigned policy before signing.',
  },
  {
    id: 'sd-9',
    topic: 'System Design',
    difficulty: 'Senior',
    question: 'What is a Dead Letter Queue (DLQ) in RabbitMQ and why is it essential?',
    answer:
      'When a message fails processing repeatedly (e.g., due to malformed payload or downstream outage) and exceeds its maximum retry count with exponential backoff, the broker routes it to a Dead Letter Queue (DLQ). This prevents a "poison pill" message from blocking the main queue in an infinite retry loop.',
    keyPoint: 'Monitor DLQ depth with alerts and provide tooling to inspect and replay dead-lettered messages.',
  },
  {
    id: 'sd-10',
    topic: 'System Design',
    difficulty: 'Mid',
    question: 'How does Consistent Hashing minimize data movement when scaling cache or storage nodes?',
    answer:
      'Traditional modulo hashing (hash(key) % N) remaps almost every key when N changes. Consistent hashing maps both nodes and keys onto a 360° hash ring (with virtual nodes for balance), so adding or removing a node only reassigns ~1/N of the keys to adjacent nodes.',
    keyPoint: 'Virtual nodes prevent hotspots when physical servers have uneven key distributions.',
  },

  // ================= REACT (10) =================
  {
    id: 'react-1',
    topic: 'React',
    difficulty: 'Junior',
    question: 'Why should you never use array index as a React key when list items can be reordered, inserted, or deleted?',
    answer:
      'React uses the key prop to match Virtual DOM elements across renders. If you use the array index and delete or prepend an item, every subsequent item’s key shifts, causing React to reuse the wrong component state/DOM inputs and re-render the entire list unnecessarily.',
    keyPoint: 'Always use a stable, unique domain ID (like item.id) as the React key.',
  },
  {
    id: 'react-2',
    topic: 'React',
    difficulty: 'Mid',
    question: 'What causes the "stale closure" bug in useEffect or event listeners, and how do you fix it?',
    answer:
      'A closure captures state/props from the specific render in which the function was created. If a useEffect or setInterval omits a state variable from its dependency array, the callback keeps reading the old value from the first render. Fix it by including dependencies, using a functional state update setCount(c => c + 1), or storing mutable latest values in a useRef.',
    keyPoint: 'Functional state updates setState(prev => ...) always receive the latest state without needing state in the dependency array.',
  },
  {
    id: 'react-3',
    topic: 'React',
    difficulty: 'Mid',
    question: 'How do useMemo and useCallback differ, and when do they actually help performance?',
    answer:
      'useMemo(fn, deps) caches the computed VALUE returned by fn(), while useCallback(fn, deps) caches the FUNCTION REFERENCE itself. They help when a calculation is genuinely expensive (e.g., filtering/sorting thousands of items) or when passing callbacks/objects to children wrapped in React.memo or into another hook’s dependency array.',
    keyPoint: 'Wrapping trivial primitives in useMemo adds overhead without preventing re-renders unless child components are memoized.',
  },
  {
    id: 'react-4',
    topic: 'React',
    difficulty: 'Junior',
    question: 'When should you use useRef instead of useState in React?',
    answer:
      'Use useState when changing the value should trigger a UI re-render. Use useRef when you need to persist a mutable value across renders WITHOUT triggering a re-render (such as timer IDs, pointer drag coordinates, previous values, or direct DOM element references).',
    keyPoint: 'Mutating ref.current is synchronous and never schedules a component re-render.',
  },
  {
    id: 'react-5',
    topic: 'React',
    difficulty: 'Mid',
    question: 'How do you prevent race conditions when fetching data inside useEffect?',
    answer:
      'If a user quickly switches tabs or filters, an older slow network request might resolve AFTER a newer fast request and overwrite the state with stale data. Prevent this by setting a boolean let cancelled = false (or an AbortController) and ignoring the response in the cleanup function return () => { cancelled = true }.',
    keyPoint: 'Always clean up async effects, timers, and window event listeners on unmount or dependency change.',
  },
  {
    id: 'react-6',
    topic: 'React',
    difficulty: 'Mid',
    question: 'Why does React Portal (createPortal) exist and how does event bubbling work through a Portal?',
    answer:
      'createPortal(child, document.body) renders a component into a DOM node outside its parent DOM hierarchy, escaping parent CSS overflow: hidden, transform, or z-index stacking contexts (ideal for modals and tooltips). Even though it lives at document.body in the DOM, React events still bubble up through the React component tree!',
    keyPoint: 'Remember to call e.stopPropagation() on the inner modal card if the parent tree has an onClick handler.',
  },
  {
    id: 'react-7',
    topic: 'React',
    difficulty: 'Junior',
    question: 'What is the difference between Controlled and Uncontrolled form inputs in React?',
    answer:
      'A Controlled input has its value driven by React state (value={state} + onChange), making React the single source of truth for instant validation and formatting. An Uncontrolled input stores its own value in the DOM and is read on submit via a ref or FormData.',
    keyPoint: 'Never switch an input’s value prop between undefined and a string across renders.',
  },
  {
    id: 'react-8',
    topic: 'React',
    difficulty: 'Senior',
    question: 'Why can a single large React Context cause unnecessary re-renders across the app, and how do you optimize it?',
    answer:
      'Whenever a Context Provider’s value reference changes, EVERY component calling useContext(MyContext) re-renders, even if it only uses an unchanged slice of the context object. Optimize by memoizing the provider value with useMemo, or splitting high-frequency state (like cursor/timer state) into a separate context from stable state (like auth user).',
    keyPoint: 'Always wrap the value={{ ... }} object passed to a Context.Provider in useMemo.',
  },
  {
    id: 'react-9',
    topic: 'React',
    difficulty: 'Mid',
    question: 'Why should derived state be calculated during render instead of syncing it with useEffect + setState?',
    answer:
      'Using useEffect to watch prop/state A and call setState(B) causes an extra wasted render pass with stale intermediate data and risks infinite loops. Computing derived values directly during render (or with useMemo if expensive) keeps state minimal, synchronous, and bug-free.',
    keyPoint: 'If a value can be computed from existing props or state, it does not belong in useState.',
  },
  {
    id: 'react-10',
    topic: 'React',
    difficulty: 'Mid',
    question: 'How does React batch state updates in React 18+?',
    answer:
      'React 18 introduced Automatic Batching: multiple setState calls inside event handlers, promises, setTimeout, or native event listeners are grouped into a single re-render at the end of the microtask, improving performance and avoiding half-updated UI states.',
    keyPoint: 'In rare cases where you must read the updated DOM immediately after setState, use flushSync().',
  },
]
