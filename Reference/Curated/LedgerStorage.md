# Cost Ledger Storage and Temporal Modeling

> Decision: attribute per-file inference cost with an append-only ledger that is one STRICT table
> row per file-touch event, written to a WAL-mode SQLite database so concurrent readers never block
> the single writer, with per-row payload detail stored as JSON columns and the price joined from a
> Type 2 rate-card dimension by effective timestamp. Every row is immutable once written, so
> aggregates are derived views that can be rebuilt from the ledger (Event Sourcing), and each row is
> booked with two equal and opposite entries (a cost account and a budget account) so debits always
> equal credits and errors are detectable.

## Sources

- SQLite STRICT Tables - https://www.sqlite.org/stricttables.html -
  Reference/Raw/sqlite-stricttables.md
- SQLite Write-Ahead Logging - https://www.sqlite.org/wal.html - Reference/Raw/sqlite-wal.md
- SQLite JSON Functions And Operators - https://www.sqlite.org/json1.html -
  Reference/Raw/sqlite-json1.md
- Why DuckDB - https://duckdb.org/why_duckdb - Reference/Raw/duckdb-why-duckdb.md
- Event Sourcing - https://martinfowler.com/eaaDev/EventSourcing.html -
  Reference/Raw/martinfowler-event-sourcing.md
- Slowly changing dimension - https://en.wikipedia.org/wiki/Slowly_changing_dimension -
  Reference/Raw/wikipedia-slowly-changing-dimension.md
- Double-entry bookkeeping - https://en.wikipedia.org/wiki/Double-entry_bookkeeping -
  Reference/Raw/wikipedia-double-entry-bookkeeping.md

## What the sources establish

1. A STRICT table is declared by appending the STRICT keyword after the closing ")" of CREATE TABLE;
   strict typing is available since SQLite 3.37.0 (2021-11-27)
   (https://www.sqlite.org/stricttables.html).
2. In a STRICT table every column must have a datatype, and the only allowed datatype names are INT,
   INTEGER, REAL, TEXT, BLOB, ANY; a value that cannot be losslessly converted raises
   SQLITE_CONSTRAINT_DATATYPE (https://www.sqlite.org/stricttables.html).
3. In a STRICT table, an ANY column preserves the inserted value exactly ('000123' stays text
   '000123'); in an ordinary table ANY coerces it to integer 123
   (https://www.sqlite.org/stricttables.html).
4. WAL mode exists since SQLite 3.7.0 (2010-07-21), set with PRAGMA journal_mode=WAL; readers do not
   block writers, a writer does not block readers, and there can be only one writer at a time
   (https://www.sqlite.org/wal.html).
5. In WAL mode a COMMIT appends to the WAL file and never writes the main database file until
   checkpointing, so a reader holding an "end mark" sees one consistent point in time while writes
   continue (https://www.sqlite.org/wal.html).
6. SQLite auto-checkpoints when the WAL reaches 1000 pages (about 4 MB); WAL read performance falls
   as the WAL grows, so checkpoint frequency trades read speed against write speed
   (https://www.sqlite.org/wal.html).
7. With PRAGMA synchronous=NORMAL the checkpoint is the only operation that issues fsync, and
   commits are no longer durable after a power failure; WAL mode is persistent across close/reopen,
   unlike other journal modes (https://www.sqlite.org/wal.html).
8. The WAL-reset bug: present in all versions 3.7.0 (2010-07-21) through 3.51.2 (2026-01-09), fixed
   in 3.51.3 (2026-03-13), backports for 3.44.6 and 3.50.7; it needs two or more connections in
   separate threads or processes racing a write and a checkpoint (https://www.sqlite.org/wal.html).
9. SQLite ships 30 JSON functions and 2 operators by default since 3.38.0 (2022-02-22) (opt-out with
   -DSQLITE_OMIT_JSON): 26 scalar functions plus 4 aggregates (json_group_array, jsonb_group_array,
   json_group_object, jsonb_group_object) and 4 table-valued functions (json_each, jsonb_each,
   json_tree, jsonb_tree) (https://www.sqlite.org/json1.html).
10. SQLite stores JSON as ordinary TEXT (a "JSON" type is impossible); -> always returns JSON text,
    ->> returns the SQL value (TEXT/INTEGER/REAL/NULL); a JSONB BLOB variant (3.45.0, 2024-01-15) is
    the internal parse tree, smaller and faster than text, but O(N) and opaque to applications
    (https://www.sqlite.org/json1.html).
11. json_each/json_tree emit one row per JSON element with columns key, value, type, atom, id,
    parent, fullkey, path plus hidden inputs json and root; type is one of 'null', 'true', 'false',
    'integer', 'real', 'text', 'array', 'object'; jsonb_each/jsonb_tree exist since 3.51.0
    (2025-11-04) (https://www.sqlite.org/json1.html).
12. DuckDB is an embedded, dependency-free OLAP engine: columnar-vectorized execution, ACID via
    MVCC, a single-file native database or lakehouse formats (DuckLake scales to petabytes), MIT
    licensed, with C, C++, Go, Python, R, Rust, and Node.js APIs (https://duckdb.org/why_duckdb).
13. Event Sourcing stores every state change as an event in sequence order and enables three
    facilities: Complete Rebuild, Temporal Query (state at any point in time), and Event Replay; the
    event carries both _occurred (business time) and _recorded (processing time)
    (https://martinfowler.com/eaaDev/EventSourcing.html).
14. The system of record can be either the event log or the application state; snapshots let the
    state be cached and rebuilt by replay; reversal needs prior values stored on the event
    (https://martinfowler.com/eaaDev/EventSourcing.html).
15. Accounting systems are the strongest Event Sourcing example: the consequences of a Domain Event
    are AccountingEntrys linked back to the event, and an Account is itself an event log of the
    Entrys that change it (https://martinfowler.com/eaaDev/EventSourcing.html).
16. SCD Types: 0 retain original, 1 overwrite (no history), 2 add new row, 3 add new attribute, 4
    add history table, 5 mini-dimension, 6 combined 1+2+3, 7 hybrid surrogate plus natural key
    (https://en.wikipedia.org/wiki/Slowly_changing_dimension).
17. Type 2 preserves unlimited history per natural key using either a Version column,
    Start_Date/End_Date pairs (NULL End_Date marks the current row; a sentinel such as 9999-12-31
    can replace NULL), or Effective_Date plus Current_Flag 'Y'/'N'
    (https://en.wikipedia.org/wiki/Slowly_changing_dimension).
18. With Type 2, transactions referencing the surrogate key are permanently bound to that time
    slice, so aggregates keep the historical state; but retroactive dimension changes make existing
    transactions need updating, which is expensive, so Type 2 is a poor fit for frequently changing
    dimensions (https://en.wikipedia.org/wiki/Slowly_changing_dimension).
19. Pure Type 6 keeps one surrogate key per master item and joins the fact to the dimension on the
    effective date falling between start_date and end_date; this supports "as at now", "as at
    transaction time", and "as at a point in time" queries, bi-temporal dates, and needs no
    fact-table reprocessing when the dimension changes
    (https://en.wikipedia.org/wiki/Slowly_changing_dimension).
20. Double-entry bookkeeping records every transaction in at least two nominal ledger accounts with
    total debits equal to total credits, preserving Assets = Liabilities + Equity; the trial balance
    confirms the two column totals are equal
    (https://en.wikipedia.org/wiki/Double-entry_bookkeeping).
21. Normal balances: a debit increases Asset and Expense accounts; a credit increases Liability,
    Capital, and Revenue accounts; daybooks (journals) are preliminary records, and the nominal
    ledger is where balance is enforced (https://en.wikipedia.org/wiki/Double-entry_bookkeeping).

## Extracts that matter

STRICT tables (https://www.sqlite.org/stricttables.html):

```
CREATE TABLE t1(a ANY) STRICT;  -- STRICT goes after the closing ")"
Allowed datatypes: INT  INTEGER  REAL  TEXT  BLOB  ANY
Column without datatype: not allowed in STRICT
Type violation: SQLITE_CONSTRAINT_DATATYPE
PRIMARY KEY columns are implicitly NOT NULL;
NULL into INTEGER PRIMARY KEY becomes a unique rowid integer.
```

json_tree / json_each row schema (https://www.sqlite.org/json1.html):

```
CREATE TABLE json_tree(
    key ANY,             -- key for current element relative to its parent
    value ANY,           -- value for the current element
    type TEXT,           -- 'object','array','string','integer', etc.
    atom ANY,            -- value for primitive types, null for array & object
    id INTEGER,          -- integer ID for this element
    parent INTEGER,      -- integer ID for the parent of this element
    fullkey TEXT,        -- full path describing the current element
    path TEXT,           -- path to the container of the current row
    json JSON HIDDEN,    -- 1st input parameter: the raw JSON
    root TEXT HIDDEN     -- 2nd input parameter: the PATH at which to start
);
```

WAL numbers (https://www.sqlite.org/wal.html):

```
PRAGMA journal_mode=WAL;
Auto checkpoint: WAL reaches 1000 pages (~4 MB)
synchronous=FULL:   WAL synced on every commit
synchronous=NORMAL: only the checkpoint issues fsync
1 writer at a time; readers never block; each reader pins an "end mark"
WAL-reset bug: 3.7.0 .. 3.51.2 affected, fixed 3.51.3 (2026-03-13)
```

Fowler event fields (https://martinfowler.com/eaaDev/EventSourcing.html):

```
class DomainEvent...
  DateTime _recorded, _occurred;         // business time vs processing time
  abstract internal void Process();
Reversal stores prior state on the event:
  internal Port priorPort;               // LoadEvent
  internal IDictionary priorCargoInCanada = new Hashtable();  // ArrivalEvent
```

SCD Type 2 effective-date shape (https://en.wikipedia.org/wiki/Slowly_changing_dimension):

```
| Supplier_Key | Supplier_Code | Supplier_Name | Supplier_State | Start_Date         | End_Date           |
| 123          | ABC           | Acme Supply Co| CA             | 2000-01-01T00:00:00| 2004-12-22T00:00:00|
| 123          | ABC           | Acme Supply Co| IL             | 2004-12-22T00:00:00| NULL               |
NULL End_Date = current version; sentinel 9999-12-31 avoids the NULL substitution
```

Debit and credit normal balances (https://en.wikipedia.org/wiki/Double-entry_bookkeeping):

```
| Account Type | Debit   | Credit  |
| Asset        | Increase| Decrease|
| Liability    | Decrease| Increase|
| Capital      | Decrease| Increase|
| Revenue      | Decrease| Increase|
| Expense      | Increase| Decrease|
```

## Open questions

- Exact price units and rate-card fields (USD per 1M input/output tokens, cache read/write
  multipliers, per-request fees) appear in none of these sources; the SCD Type 2 shape is sourced,
  the pricing rows are not.
- The ledger table itself (column names for session id, file path, model id, token counts,
  timestamps) is a synthesis of these sources, not a sourced schema; only the STRICT datatype list
  and the json_tree columns are specified exactly.
- WAL permits one writer at a time; whether all agent processes funnel ledger writes through a
  single connection or the ledger runs in EXCLUSIVE locking mode is not settled by the sources.
- Whether the per-row payload should be TEXT JSON or a JSONB BLOB is open: JSONB is smaller and
  faster but opaque, SQLite-internal, and O(N) with no O(1) lookup; its format may change between
  SQLite versions.
- The rate card changes frequently, and the SCD source warns Type 2 is a poor fit under frequent
  change; no source settles how to store price revisions cheaply for a long conversation.
- Double-entry mapping for cost accounting (which accounts are debited/credited for prompt tokens
  versus completion tokens versus cache reads) is not covered by the sources.
- DuckDB is positioned for analytical rollups over the ledger, but no source benchmarks SQLite
  versus DuckDB for this workload or defines the rollup query shape.
- Fowler notes replay needs external gateways disabled during reprocessing; the equivalent
  boundaries in an agent runtime (UI updates, background jobs triggered by ledger rows) are not
  addressed.
