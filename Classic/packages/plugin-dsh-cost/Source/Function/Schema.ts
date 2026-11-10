/**
 * @module Schema
 *
 * The ledger's DDL: one exported string constant per table plus the cost
 * views, in creation order inside the exported Ddl array, and the additive
 * migration rungs one constant each.
 *
 * @remarks
 * The schema follows `Documentation/Plans/COST-TRACK-PLUGIN.md` sections 3, 14
 * and 17.6. A fresh file creates the v6 schema directly, with the price book's
 * tier, mode and region columns inline, the Modifier, Factor and CallFactor
 * tables of the factor layer, the Edit table of the edit grain, the telemetry
 * columns of the Call and Touch rows and the valuation model's Catalog,
 * Revision, RateRow, Valuation, ValuationCost and ValuationAllocation tables.
 * The additive rungs are also exported one constant each and rolled up into the
 * Migration array (v1 to v2), the MigrationFactor array (v2 to v3), the
 * MigrationTelemetry array (v3 to v4), the MigrationPricing array (v4 to v5)
 * and the MigrationVersioning array (v5 to v6), which `Function/Open` runs
 * inside one transaction each when the ledger's user_version sits below 6. The
 * fresh path creates the pricing tables EMPTY - a new file has no recorded book
 * to seed - while the v5 rung seeds the bootstrap catalog, its one published
 * revision, the rate rows copied out of Price and the as-recorded valuation,
 * all inside the transaction that stamps the version. Every table is STRICT;
 * money is REAL in one currency per row with rates stored per million tokens;
 * the price book is append-only and effective-dated so a historical invoice
 * stays reproducible, and one effective-dated rate card is now a family of tier
 * rows - one per TierFrom - which is why the fresh Price unique key carries
 * TierFrom.
 */
export const Price = `CREATE TABLE Price (
    PriceId INTEGER PRIMARY KEY,
    Provider TEXT NOT NULL, Model TEXT NOT NULL, Currency TEXT NOT NULL DEFAULT 'USD',
    InputRate REAL NOT NULL, OutputRate REAL NOT NULL,
    CacheReadRate REAL, CacheWriteRate REAL, ReasoningRate REAL,
    EffectiveFrom INTEGER NOT NULL, EffectiveTo INTEGER,
    Source TEXT NOT NULL, Note TEXT,
    Window TEXT NOT NULL DEFAULT 'any',
    TierFrom INTEGER NOT NULL DEFAULT 0, TierTo INTEGER,
    Mode TEXT NOT NULL DEFAULT 'standard', Region TEXT,
    UNIQUE (Provider, Model, EffectiveFrom, TierFrom)
) STRICT;`;

export const Client = `CREATE TABLE Client (
    ClientId INTEGER PRIMARY KEY, Name TEXT NOT NULL UNIQUE
) STRICT;`;

export const Project = `CREATE TABLE Project (
    ProjectId INTEGER PRIMARY KEY, ClientId INTEGER REFERENCES Client (ClientId),
    Name TEXT NOT NULL, Root TEXT NOT NULL UNIQUE
) STRICT;`;

export const Session = `CREATE TABLE Session (
    SessionId TEXT PRIMARY KEY, ProjectId INTEGER REFERENCES Project (ProjectId),
    ParentSessionId TEXT, Origin TEXT, DelegationDepth INTEGER, AgentPreset TEXT,
    Cwd TEXT, Title TEXT, CreatedAt INTEGER NOT NULL, EndedAt INTEGER
) STRICT;`;

export const File = `CREATE TABLE File (
    FileId INTEGER PRIMARY KEY, ProjectId INTEGER NOT NULL REFERENCES Project (ProjectId),
    Path TEXT NOT NULL, Language TEXT, FirstSeenAt INTEGER NOT NULL,
    UNIQUE (ProjectId, Path)
) STRICT;`;

export const FileVersion = `CREATE TABLE FileVersion (
    VersionId INTEGER PRIMARY KEY, FileId INTEGER NOT NULL REFERENCES File (FileId),
    Hash TEXT, Bytes INTEGER, Lines INTEGER, ObservedAt INTEGER NOT NULL
) STRICT;`;

export const Call = `CREATE TABLE Call (
    CallId INTEGER PRIMARY KEY, SessionId TEXT NOT NULL REFERENCES Session (SessionId),
    Turn INTEGER NOT NULL, Step INTEGER NOT NULL, Seq INTEGER NOT NULL,
    Provider TEXT NOT NULL, Model TEXT NOT NULL, PriceId INTEGER REFERENCES Price (PriceId),
    InputTokens INTEGER NOT NULL, OutputTokens INTEGER NOT NULL,
    CacheReadTokens INTEGER NOT NULL DEFAULT 0, CacheWriteTokens INTEGER NOT NULL DEFAULT 0,
    ReasoningTokens INTEGER NOT NULL DEFAULT 0, TotalTokens INTEGER,
    CostInput REAL NOT NULL, CostOutput REAL NOT NULL, CostCacheRead REAL NOT NULL DEFAULT 0,
    CostCacheWrite REAL NOT NULL DEFAULT 0, CostReasoning REAL NOT NULL DEFAULT 0,
    CostTotal REAL NOT NULL, Currency TEXT NOT NULL,
    SurfaceTokens INTEGER NOT NULL DEFAULT 0, Purpose TEXT,
    CacheSaving REAL NOT NULL DEFAULT 0, At INTEGER NOT NULL,
    Mode TEXT NOT NULL DEFAULT 'standard', Region TEXT, Tier INTEGER,
    LatencyMs INTEGER, FirstTokenMs INTEGER, TokensPerSecond REAL,
    Attempts INTEGER NOT NULL DEFAULT 1, ErrorCode TEXT,
    ContextWindow INTEGER, Utilization REAL,
    UNIQUE (SessionId, Turn, Step)
) STRICT;`;

export const Touch = `CREATE TABLE Touch (
    TouchId INTEGER PRIMARY KEY, CallId INTEGER NOT NULL REFERENCES Call (CallId),
    SessionId TEXT NOT NULL, Turn INTEGER NOT NULL, Step INTEGER NOT NULL,
    CallKey TEXT NOT NULL, Tool TEXT NOT NULL, FileId INTEGER NOT NULL REFERENCES File (FileId),
    VersionId INTEGER REFERENCES FileVersion (VersionId), Kind TEXT NOT NULL,
    Stage TEXT, Branch TEXT, ReadBeforeEdit INTEGER NOT NULL DEFAULT 0,
    BytesBefore INTEGER, BytesAfter INTEGER, BytesDelta INTEGER, LinesDelta INTEGER,
    DurationMs INTEGER, ResultBytes INTEGER,
    Seq INTEGER NOT NULL, At INTEGER NOT NULL,
    UNIQUE (SessionId, CallKey, FileId)
) STRICT;`;

export const ContextMass = `CREATE TABLE ContextMass (
    CallId INTEGER NOT NULL REFERENCES Call (CallId),
    FileId INTEGER REFERENCES File (FileId), Tokens INTEGER NOT NULL,
    PRIMARY KEY (CallId, FileId)
) STRICT;`;

export const Allocation = `CREATE TABLE Allocation (
    AllocationId INTEGER PRIMARY KEY, CallId INTEGER NOT NULL REFERENCES Call (CallId),
    FileId INTEGER REFERENCES File (FileId),
    DirectCost REAL NOT NULL, AmortizedCost REAL NOT NULL,
    ContextTokens INTEGER NOT NULL, SurfaceTokens INTEGER NOT NULL, Weight REAL NOT NULL,
    Method TEXT NOT NULL, At INTEGER NOT NULL,
    UNIQUE (CallId, FileId)
) STRICT;`;

export const Rollup = `CREATE TABLE Rollup (
    Scope TEXT NOT NULL, Key TEXT NOT NULL, Day TEXT NOT NULL,
    DirectCost REAL NOT NULL, AmortizedCost REAL NOT NULL, Cost REAL NOT NULL,
    Calls INTEGER NOT NULL, Tokens INTEGER NOT NULL, UpdatedAt INTEGER NOT NULL,
    PRIMARY KEY (Scope, Key, Day)
) STRICT;`;

export const Annotation = `CREATE TABLE Annotation (
    AnnotationId INTEGER PRIMARY KEY, FileId INTEGER NOT NULL REFERENCES File (FileId),
    VersionId INTEGER REFERENCES FileVersion (VersionId), Marker TEXT NOT NULL,
    Body TEXT NOT NULL, Cost REAL NOT NULL, At INTEGER NOT NULL
) STRICT;`;

export const Cursor = `CREATE TABLE Cursor (
    SessionId TEXT PRIMARY KEY, LastSeq INTEGER NOT NULL, UpdatedAt INTEGER NOT NULL
) STRICT;`;

export const FileCost = `CREATE VIEW FileCost AS
SELECT Allocation.FileId AS FileId,
    File.Path AS Path,
    SUM(Allocation.DirectCost) AS Direct,
    SUM(Allocation.AmortizedCost) AS Amortized,
    SUM(Allocation.DirectCost + Allocation.AmortizedCost) AS Total,
    COUNT(DISTINCT Allocation.CallId) AS Calls
FROM Allocation
JOIN Call ON Call.CallId = Allocation.CallId
JOIN File ON File.FileId = Allocation.FileId
GROUP BY Allocation.FileId, File.Path;`;

// The three aggregate views (section 5.6): each sums a call's tokens exactly
// once. The per-call money and the call itself come from their own
// subqueries - the Allocation rows collapsed to one row per CallId, then the
// Call row joined once - so a call with several allocation rows can no longer
// repeat its TotalTokens through the fan-out. The view names and the column
// names stay unchanged; only the arithmetic behind them changes.
export const ModelCost = `CREATE VIEW ModelCost AS
SELECT Call.Provider AS Provider,
    Call.Model AS Model,
    SUM(Money.Direct) AS Direct,
    SUM(Money.Amortized) AS Amortized,
    SUM(Money.Direct + Money.Amortized) AS Total,
    COUNT(Call.CallId) AS Calls,
    SUM(Call.TotalTokens) AS Tokens
FROM Call
JOIN (SELECT CallId, SUM(DirectCost) AS Direct, SUM(AmortizedCost) AS Amortized
    FROM Allocation GROUP BY CallId) AS Money ON Money.CallId = Call.CallId
GROUP BY Call.Provider, Call.Model;`;

export const SessionCost = `CREATE VIEW SessionCost AS
SELECT Call.SessionId AS SessionId,
    SUM(Money.Direct) AS Direct,
    SUM(Money.Amortized) AS Amortized,
    SUM(Money.Direct + Money.Amortized) AS Total,
    COUNT(Call.CallId) AS Calls,
    SUM(Call.TotalTokens) AS Tokens
FROM Call
JOIN (SELECT CallId, SUM(DirectCost) AS Direct, SUM(AmortizedCost) AS Amortized
    FROM Allocation GROUP BY CallId) AS Money ON Money.CallId = Call.CallId
GROUP BY Call.SessionId;`;

export const ClientCost = `CREATE VIEW ClientCost AS
SELECT Project.ClientId AS ClientId,
    Client.Name AS Name,
    SUM(Money.Direct) AS Direct,
    SUM(Money.Amortized) AS Amortized,
    SUM(Money.Direct + Money.Amortized) AS Total,
    COUNT(Call.CallId) AS Calls,
    SUM(Call.TotalTokens) AS Tokens
FROM Call
JOIN (SELECT CallId, SUM(DirectCost) AS Direct, SUM(AmortizedCost) AS Amortized
    FROM Allocation GROUP BY CallId) AS Money ON Money.CallId = Call.CallId
JOIN Session ON Session.SessionId = Call.SessionId
JOIN Project ON Project.ProjectId = Session.ProjectId
JOIN Client ON Client.ClientId = Project.ClientId
GROUP BY Project.ClientId, Client.Name;`;

// The v2 additions (section 14), exported one statement each: the additive
// columns the migration ALTERs onto a v1 ledger and the two tables and the
// lifetime view a fresh file creates directly inside the Ddl array. The
// three Touch columns and the Call.CacheSaving column are the storage the
// analysis plugin needs (section 13); Alias keeps a rename from splitting a
// file's cost (section 10); Verdict is the per-session outcome the assess
// buckets read.
export const PriceWindow = `ALTER TABLE Price ADD COLUMN Window TEXT NOT NULL DEFAULT 'any';`;

export const CallSaving = `ALTER TABLE Call ADD COLUMN CacheSaving REAL NOT NULL DEFAULT 0;`;

export const TouchStage = `ALTER TABLE Touch ADD COLUMN Stage TEXT;`;

export const TouchBranch = `ALTER TABLE Touch ADD COLUMN Branch TEXT;`;

export const TouchRead = `ALTER TABLE Touch ADD COLUMN ReadBeforeEdit INTEGER NOT NULL DEFAULT 0;`;

export const Alias = `CREATE TABLE Alias (
    AliasId INTEGER PRIMARY KEY, FileId INTEGER NOT NULL REFERENCES File (FileId),
    FromPath TEXT NOT NULL, ToPath TEXT NOT NULL, At INTEGER NOT NULL
) STRICT;`;

export const Verdict = `CREATE TABLE Verdict (
    SessionId TEXT NOT NULL REFERENCES Session (SessionId),
    FileId INTEGER NOT NULL REFERENCES File (FileId),
    State TEXT NOT NULL, LinesAdded INTEGER NOT NULL DEFAULT 0,
    LinesRemoved INTEGER NOT NULL DEFAULT 0, At INTEGER NOT NULL,
    PRIMARY KEY (SessionId, FileId)
) STRICT;`;

export const FileLifetime = `CREATE VIEW FileLifetime AS
SELECT f.FileId, f.Path, count(DISTINCT c.SessionId) AS Sessions,
       sum(a.DirectCost) AS Direct, sum(a.AmortizedCost) AS Amortized,
       sum(a.DirectCost + a.AmortizedCost) AS Cost
FROM File AS f
JOIN Allocation AS a ON a.FileId = f.FileId
JOIN Call AS c ON c.CallId = a.CallId
GROUP BY f.FileId;`;

// The v3 additions (section 17.6), exported one statement each: the price
// book's tier, mode and region columns, the factor layer's three tables,
// and the call's own mode, region and tier columns. A NULL Mode or Region
// on a price row means "any mode" or "any region", so a mode- or
// region-specific row prices only the calls that name it; Modifier rows are
// effective-dated like prices (section 17.2); Factor and CallFactor carry
// the classification factors, so a new classifier is a row, not a migration
// (section 17.1).
export const PriceTier = `ALTER TABLE Price ADD COLUMN TierFrom INTEGER NOT NULL DEFAULT 0;`;

export const PriceTierTo = `ALTER TABLE Price ADD COLUMN TierTo INTEGER;`;

export const PriceMode = `ALTER TABLE Price ADD COLUMN Mode TEXT NOT NULL DEFAULT 'standard';`;

export const PriceRegion = `ALTER TABLE Price ADD COLUMN Region TEXT;`;

export const Modifier = `CREATE TABLE Modifier (
    ModifierId INTEGER PRIMARY KEY, Provider TEXT NOT NULL, Model TEXT,
    Kind TEXT NOT NULL, Value TEXT NOT NULL, Multiplier REAL NOT NULL,
    EffectiveFrom INTEGER NOT NULL, EffectiveTo INTEGER, Source TEXT NOT NULL
) STRICT;`;

export const Factor = `CREATE TABLE Factor (
    FactorId INTEGER PRIMARY KEY, Scope TEXT NOT NULL, Key TEXT NOT NULL, Value TEXT NOT NULL,
    UNIQUE (Scope, Key, Value)
) STRICT;`;

export const CallFactor = `CREATE TABLE CallFactor (
    CallId INTEGER NOT NULL REFERENCES Call (CallId),
    FactorId INTEGER NOT NULL REFERENCES Factor (FactorId), Weight REAL NOT NULL DEFAULT 1,
    PRIMARY KEY (CallId, FactorId)
) STRICT;`;

export const CallMode = `ALTER TABLE Call ADD COLUMN Mode TEXT NOT NULL DEFAULT 'standard';`;

export const CallRegion = `ALTER TABLE Call ADD COLUMN Region TEXT;`;

export const CallTier = `ALTER TABLE Call ADD COLUMN Tier INTEGER;`;

// The v4 additions (sections 17.3 and 17.4), exported one statement each:
// the edit grain's own table - one row per hunk a write or edit tool call
// produced, unique per (touch, ordinal), with the line and byte counts and
// the optional before and after hashes - and the telemetry columns the
// session log already carries, ALTERed onto the Call row (the latency, the
// first token, the tokens-per-second rate, the retry count, the failure
// code, the context window and its utilization) and onto the Touch row (the
// tool duration and the rendered result bytes).
export const Edit = `CREATE TABLE Edit (
    EditId INTEGER PRIMARY KEY,
    TouchId INTEGER NOT NULL REFERENCES Touch (TouchId),
    Ordinal INTEGER NOT NULL, LinesAdded INTEGER NOT NULL DEFAULT 0,
    LinesRemoved INTEGER NOT NULL DEFAULT 0, BytesAdded INTEGER NOT NULL DEFAULT 0,
    BytesRemoved INTEGER NOT NULL DEFAULT 0, BeforeHash TEXT, AfterHash TEXT,
    At INTEGER NOT NULL, UNIQUE (TouchId, Ordinal)
) STRICT;`;

export const CallLatency = `ALTER TABLE Call ADD COLUMN LatencyMs INTEGER;`;

export const CallFirstToken = `ALTER TABLE Call ADD COLUMN FirstTokenMs INTEGER;`;

export const CallRate = `ALTER TABLE Call ADD COLUMN TokensPerSecond REAL;`;

export const CallAttempts = `ALTER TABLE Call ADD COLUMN Attempts INTEGER NOT NULL DEFAULT 1;`;

export const CallError = `ALTER TABLE Call ADD COLUMN ErrorCode TEXT;`;

export const CallWindow = `ALTER TABLE Call ADD COLUMN ContextWindow INTEGER;`;

export const CallUtilization = `ALTER TABLE Call ADD COLUMN Utilization REAL;`;

export const TouchDuration = `ALTER TABLE Touch ADD COLUMN DurationMs INTEGER;`;

export const TouchBytes = `ALTER TABLE Touch ADD COLUMN ResultBytes INTEGER;`;

// The v5 additions (Temporary/Cost-Research/Plan.md lane B4b; the valuation
// model of Temporary/Cost-Research/Backlog.md section 5, which restates the
// research's sections 3, 5, 6 and 9): the pricing catalog as three tables and
// the valuation as three more. Catalog names a book once. Revision is one
// immutable revision of that book - ParentRevisionId names the revision it
// corrects, CreatedAt is the second date (when the system ACCEPTED the rate,
// as opposed to ValidFrom, when the rate APPLIES to usage), Reason says why
// the revision exists and Status is 'draft' until it is published. RateRow is
// one effective-dated rate inside a revision, carrying the same provider,
// model, currency, rate, window, tier, mode and region columns the
// capture-time Price row carries, so a revision can reproduce the recorded
// arithmetic exactly. Valuation pins one revision and one attribution policy
// version against a fixed evidence cutoff, and Basis names the interpretation
// ('as-recorded', 'corrected-historical', 'current-rates' or 'scenario').
// ValuationCost and ValuationAllocation are the derived results the valuation
// service fills, keyed by ValuationId: one row per call and billing component,
// and one row per call and file, where a NULL FileId is the unattributed
// recipient exactly as Allocation carries it - which is why that table takes
// its own row id and a UNIQUE key instead of a composite PRIMARY KEY. Both
// stay empty until that service runs - a view over nothing cannot be filled,
// which is why they are tables. Price itself is untouched and remains the
// capture-time book - the drain writes it and the reader joins it - and the
// bootstrap catalog is a revision SEEDED FROM it, so a corrected or simulated
// rate is a new revision and never an edit to a recorded call.
export const Catalog = `CREATE TABLE Catalog (
    CatalogId INTEGER PRIMARY KEY, Name TEXT NOT NULL UNIQUE
) STRICT;`;

export const Revision = `CREATE TABLE Revision (
    RevisionId INTEGER PRIMARY KEY,
    CatalogId INTEGER NOT NULL REFERENCES Catalog (CatalogId),
    ParentRevisionId INTEGER REFERENCES Revision (RevisionId),
    CreatedAt INTEGER NOT NULL, Reason TEXT NOT NULL,
    Status TEXT NOT NULL DEFAULT 'draft'
) STRICT;`;

export const RateRow = `CREATE TABLE RateRow (
    RateRowId INTEGER PRIMARY KEY,
    RevisionId INTEGER NOT NULL REFERENCES Revision (RevisionId),
    Provider TEXT NOT NULL, Model TEXT NOT NULL, Currency TEXT NOT NULL DEFAULT 'USD',
    InputRate REAL NOT NULL, OutputRate REAL NOT NULL,
    CacheReadRate REAL, CacheWriteRate REAL, ReasoningRate REAL,
    ValidFrom INTEGER NOT NULL, ValidTo INTEGER,
    Mode TEXT NOT NULL DEFAULT 'standard', Region TEXT,
    Window TEXT NOT NULL DEFAULT 'any',
    TierFrom INTEGER NOT NULL DEFAULT 0, TierTo INTEGER,
    Note TEXT,
    UNIQUE (RevisionId, Provider, Model, Mode, Region, Window, ValidFrom, TierFrom)
) STRICT;`;

export const Valuation = `CREATE TABLE Valuation (
    ValuationId INTEGER PRIMARY KEY, Basis TEXT NOT NULL,
    RevisionId INTEGER NOT NULL REFERENCES Revision (RevisionId),
    PolicyVersion TEXT NOT NULL, EvidenceCutoff INTEGER,
    CreatedAt INTEGER NOT NULL, Note TEXT
) STRICT;`;

export const ValuationCost = `CREATE TABLE ValuationCost (
    ValuationId INTEGER NOT NULL REFERENCES Valuation (ValuationId),
    CallId INTEGER NOT NULL REFERENCES Call (CallId),
    Component TEXT NOT NULL, Amount REAL NOT NULL, Currency TEXT NOT NULL,
    PRIMARY KEY (ValuationId, CallId, Component)
) STRICT;`;

export const ValuationAllocation = `CREATE TABLE ValuationAllocation (
    ValuationAllocationId INTEGER PRIMARY KEY,
    ValuationId INTEGER NOT NULL REFERENCES Valuation (ValuationId),
    CallId INTEGER NOT NULL REFERENCES Call (CallId),
    FileId INTEGER REFERENCES File (FileId),
    Amount REAL NOT NULL, Currency TEXT NOT NULL,
    UNIQUE (ValuationId, CallId, FileId)
) STRICT;`;

// The v5 rung's seed, one statement per row: the catalog the shipped book is
// identified by, the one published revision under it, one rate row per
// existing Price row - the copy that makes the bootstrap revision reproduce
// the recorded arithmetic, with Price.EffectiveFrom/EffectiveTo becoming
// ValidFrom/ValidTo and the Source column dropped because the catalog name
// and the revision reason now carry that provenance - and the as-recorded
// valuation naming that revision. The policy version is the attribution
// method the ledger's own Allocation rows already carry (the most recent one,
// 'bytes/context' when nothing has been allocated yet), so the seeded
// valuation declares the policy the recorded money was split under. The
// stamps are SQLite's own clock in epoch milliseconds: the seed has no caller
// clock, and the rung's own time is the right "accepted at".
export const SeedCatalog = `INSERT INTO Catalog (Name) VALUES ('bootstrap');`;

export const SeedRevision = `INSERT INTO Revision (CatalogId, ParentRevisionId, CreatedAt, Reason, Status)
SELECT CatalogId, NULL, CAST(strftime('%s', 'now') AS INTEGER) * 1000,
    'the recorded price book, seeded at the v5 rung', 'published'
FROM Catalog WHERE Name = 'bootstrap';`;

export const SeedRateRow = `INSERT INTO RateRow (RevisionId, Provider, Model, Currency, InputRate, OutputRate,
    CacheReadRate, CacheWriteRate, ReasoningRate, ValidFrom, ValidTo, Mode, Region, Window,
    TierFrom, TierTo, Note)
SELECT Revision.RevisionId, Provider, Model, Currency, InputRate, OutputRate,
    CacheReadRate, CacheWriteRate, ReasoningRate, EffectiveFrom, EffectiveTo, Mode, Region,
    Window, TierFrom, TierTo, Note
FROM Price
JOIN Revision ON Revision.CatalogId = (SELECT CatalogId FROM Catalog WHERE Name = 'bootstrap');`;

export const SeedValuation = `INSERT INTO Valuation (Basis, RevisionId, PolicyVersion, EvidenceCutoff, CreatedAt, Note)
SELECT 'as-recorded', Revision.RevisionId,
    COALESCE((SELECT Method FROM Allocation ORDER BY AllocationId DESC LIMIT 1), 'bytes/context'),
    NULL, CAST(strftime('%s', 'now') AS INTEGER) * 1000,
    'the recorded book, priced by the bootstrap revision'
FROM Revision
WHERE Revision.CatalogId = (SELECT CatalogId FROM Catalog WHERE Name = 'bootstrap');`;

// The v6 additions (the old-ledger compatibility step): the fresh DDL has
// carried the FileVersion table and the Touch.VersionId reference since the
// file-version grain was added, but no earlier rung creates them, so a
// ledger upgraded from v1 through v5 lacks the table the drain now writes.
// FileVersionIfAbsent is the fresh definition with the IF NOT EXISTS clause
// spliced in - one definition, so the fresh table and the upgraded one can
// never drift, and a ledger that already carries the table keeps its shape.
// TouchVersion is the reference column itself; SQLite has no ADD COLUMN IF
// NOT EXISTS, so Function/Open reads PRAGMA table_info(Touch) and runs this
// ALTER only when the column is absent, inside the transaction that stamps
// the version.
export const FileVersionIfAbsent = FileVersion.replace(
	"CREATE TABLE FileVersion",
	"CREATE TABLE IF NOT EXISTS FileVersion",
);

export const TouchVersion = `ALTER TABLE Touch ADD COLUMN VersionId INTEGER REFERENCES FileVersion (VersionId);`;

// The migration ladder's v6 rung (the old-ledger compatibility step): the
// array holds the CREATE, whose IF NOT EXISTS clause keeps it safe on a
// ledger that already carries the table. Function/Open appends the
// conditional Touch ALTER and the version stamp to this list and runs the
// whole list inside one transaction, so a failure leaves the ledger at its
// old version with nothing half-applied.
// Every fresh-only object the ladder must also give an upgraded ledger: the
// v1-v3 rungs never created Annotation, ContextMass, Cursor, Rollup or the
// FileCost view, yet the drain writes the cursor and the annotations on any
// ledger it opens. The helper rewrites the fresh statement into its IF NOT
// EXISTS form so one definition serves both paths and cannot drift.
const IfAbsent = (Statement: string): string =>
	Statement.replace("CREATE TABLE ", "CREATE TABLE IF NOT EXISTS ").replace(
		"CREATE VIEW ",
		"CREATE VIEW IF NOT EXISTS ",
	);

export const MigrationVersioning: readonly string[] = [
	FileVersionIfAbsent,
	IfAbsent(Annotation),
	IfAbsent(ContextMass),
	IfAbsent(Cursor),
	IfAbsent(Rollup),
	IfAbsent(FileCost),
];

// The migration ladder's v2 rung: the ALTERs in dependency-free order, then
// the new tables and the view, then the version stamp - run inside one
// transaction by Function/Open when the ledger's user_version is 1.
export const Migration: readonly string[] = [
	PriceWindow,
	CallSaving,
	TouchStage,
	TouchBranch,
	TouchRead,
	Alias,
	Verdict,
	FileLifetime,
	"PRAGMA user_version = 2;",
];

// The migration ladder's v3 rung (section 17.6): the price and call ALTERs,
// then the three factor-layer tables, then the version stamp - run inside
// one transaction by Function/Open when the ledger's user_version is 2, and
// after the v2 rung when it is 1.
export const MigrationFactor: readonly string[] = [
	PriceTier,
	PriceTierTo,
	PriceMode,
	PriceRegion,
	Modifier,
	Factor,
	CallFactor,
	CallMode,
	CallRegion,
	CallTier,
	"PRAGMA user_version = 3;",
];

// The migration ladder's v4 rung (sections 17.3 and 17.4): the edit grain's
// table, then the Call and Touch telemetry ALTERs, then the version stamp -
// run inside one transaction by Function/Open when the ledger's user_version
// is 3, and after the earlier rungs when it sits lower.
export const MigrationTelemetry: readonly string[] = [
	Edit,
	CallLatency,
	CallFirstToken,
	CallRate,
	CallAttempts,
	CallError,
	CallWindow,
	CallUtilization,
	TouchDuration,
	TouchBytes,
	"PRAGMA user_version = 4;",
];

// The migration ladder's v5 rung (the valuation model): the six new tables,
// then the bootstrap seed, then the version stamp - run inside one
// transaction by Function/Open when the ledger's user_version is 4, and after
// the earlier rungs when it sits lower. The rung runs exactly once per file
// because the stamp rides the same transaction, so the seed needs no guard:
// a failure anywhere rolls the whole rung back, the file stays at its old
// version and no half-seeded catalog is ever visible.
export const MigrationPricing: readonly string[] = [
	Catalog,
	Revision,
	RateRow,
	Valuation,
	ValuationCost,
	ValuationAllocation,
	SeedCatalog,
	SeedRevision,
	SeedRateRow,
	SeedValuation,
	// A v1-v4 ledger carries the pre-fan-out-fix view text, which repeats a
	// call's tokens once per allocation row; recreate the three aggregates
	// from the current definitions so an upgraded ledger reports correct
	// tokens. DROP before CREATE because the rung runs on an existing file.
	"DROP VIEW IF EXISTS ModelCost;",
	"DROP VIEW IF EXISTS SessionCost;",
	"DROP VIEW IF EXISTS ClientCost;",
	ModelCost,
	SessionCost,
	ClientCost,
	"PRAGMA user_version = 5;",
];

export const Ddl: readonly string[] = [
	Price,
	Client,
	Project,
	Session,
	File,
	FileVersion,
	Call,
	Touch,
	ContextMass,
	Allocation,
	Rollup,
	Annotation,
	Cursor,
	FileCost,
	ModelCost,
	SessionCost,
	ClientCost,
	Alias,
	Verdict,
	FileLifetime,
	Modifier,
	Factor,
	CallFactor,
	Edit,
	Catalog,
	Revision,
	RateRow,
	Valuation,
	ValuationCost,
	ValuationAllocation,
];

export default Ddl;
