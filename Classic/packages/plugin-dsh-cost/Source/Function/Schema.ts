// Schema - the ledger's DDL (Documentation/Plans/COST-TRACK-PLUGIN.md
// sections 3, 14 and 17.6): one exported string constant per table plus the
// cost views, in creation order inside the exported Ddl array - a fresh file
// creates the v3 schema directly, with the price book's tier, mode and
// region columns inline and the Modifier, Factor and CallFactor tables of
// the factor layer. The additive rungs are also exported one constant each
// and rolled up into the Migration array (v1 to v2) and the MigrationFactor
// array (v2 to v3), which Function/Open runs inside one transaction each
// when the ledger's user_version sits below 3. Every table is STRICT; money
// is REAL in one currency per row with rates stored per million tokens; the
// price book is append-only and effective-dated so a historical invoice
// stays reproducible, and one effective-dated rate card is now a family of
// tier rows - one per TierFrom - which is why the fresh Price unique key
// carries TierFrom.
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
    UNIQUE (SessionId, Turn, Step)
) STRICT;`;

export const Touch = `CREATE TABLE Touch (
    TouchId INTEGER PRIMARY KEY, CallId INTEGER NOT NULL REFERENCES Call (CallId),
    SessionId TEXT NOT NULL, Turn INTEGER NOT NULL, Step INTEGER NOT NULL,
    CallKey TEXT NOT NULL, Tool TEXT NOT NULL, FileId INTEGER NOT NULL REFERENCES File (FileId),
    VersionId INTEGER REFERENCES FileVersion (VersionId), Kind TEXT NOT NULL,
    Stage TEXT, Branch TEXT, ReadBeforeEdit INTEGER NOT NULL DEFAULT 0,
    BytesBefore INTEGER, BytesAfter INTEGER, BytesDelta INTEGER, LinesDelta INTEGER,
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

export const ModelCost = `CREATE VIEW ModelCost AS
SELECT Call.Provider AS Provider,
    Call.Model AS Model,
    SUM(Allocation.DirectCost) AS Direct,
    SUM(Allocation.AmortizedCost) AS Amortized,
    SUM(Allocation.DirectCost + Allocation.AmortizedCost) AS Total,
    COUNT(DISTINCT Allocation.CallId) AS Calls,
    SUM(Call.TotalTokens) AS Tokens
FROM Allocation
JOIN Call ON Call.CallId = Allocation.CallId
GROUP BY Call.Provider, Call.Model;`;

export const SessionCost = `CREATE VIEW SessionCost AS
SELECT Call.SessionId AS SessionId,
    SUM(Allocation.DirectCost) AS Direct,
    SUM(Allocation.AmortizedCost) AS Amortized,
    SUM(Allocation.DirectCost + Allocation.AmortizedCost) AS Total,
    COUNT(DISTINCT Allocation.CallId) AS Calls,
    SUM(Call.TotalTokens) AS Tokens
FROM Allocation
JOIN Call ON Call.CallId = Allocation.CallId
GROUP BY Call.SessionId;`;

export const ClientCost = `CREATE VIEW ClientCost AS
SELECT Project.ClientId AS ClientId,
    Client.Name AS Name,
    SUM(Allocation.DirectCost) AS Direct,
    SUM(Allocation.AmortizedCost) AS Amortized,
    SUM(Allocation.DirectCost + Allocation.AmortizedCost) AS Total,
    COUNT(DISTINCT Allocation.CallId) AS Calls,
    SUM(Call.TotalTokens) AS Tokens
FROM Allocation
JOIN Call ON Call.CallId = Allocation.CallId
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
];

export default Ddl;
