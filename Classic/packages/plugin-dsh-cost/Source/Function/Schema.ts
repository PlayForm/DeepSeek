// Schema - the ledger's DDL (Documentation/Plans/COST-TRACK-PLUGIN.md
// section 3): one exported string constant per table plus the four cost
// views, in creation order inside the exported Ddl array. Every table is
// STRICT; money is REAL in one currency per row with rates stored per million
// tokens; the price book is append-only and effective-dated so a historical
// invoice stays reproducible. Function/Open runs every statement inside one
// transaction on open, guarded by PRAGMA user_version for migrations.
export const Price = `CREATE TABLE Price (
    PriceId INTEGER PRIMARY KEY,
    Provider TEXT NOT NULL, Model TEXT NOT NULL, Currency TEXT NOT NULL DEFAULT 'USD',
    InputRate REAL NOT NULL, OutputRate REAL NOT NULL,
    CacheReadRate REAL, CacheWriteRate REAL, ReasoningRate REAL,
    EffectiveFrom INTEGER NOT NULL, EffectiveTo INTEGER,
    Source TEXT NOT NULL, Note TEXT,
    UNIQUE (Provider, Model, EffectiveFrom)
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
    SurfaceTokens INTEGER NOT NULL DEFAULT 0, Purpose TEXT, At INTEGER NOT NULL,
    UNIQUE (SessionId, Turn, Step)
) STRICT;`;

export const Touch = `CREATE TABLE Touch (
    TouchId INTEGER PRIMARY KEY, CallId INTEGER NOT NULL REFERENCES Call (CallId),
    SessionId TEXT NOT NULL, Turn INTEGER NOT NULL, Step INTEGER NOT NULL,
    CallKey TEXT NOT NULL, Tool TEXT NOT NULL, FileId INTEGER NOT NULL REFERENCES File (FileId),
    VersionId INTEGER REFERENCES FileVersion (VersionId), Kind TEXT NOT NULL,
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
];

export default Ddl;
