const E=`CREATE TABLE Price (
    PriceId INTEGER PRIMARY KEY,
    Provider TEXT NOT NULL, Model TEXT NOT NULL, Currency TEXT NOT NULL DEFAULT 'USD',
    InputRate REAL NOT NULL, OutputRate REAL NOT NULL,
    CacheReadRate REAL, CacheWriteRate REAL, ReasoningRate REAL,
    EffectiveFrom INTEGER NOT NULL, EffectiveTo INTEGER,
    Source TEXT NOT NULL, Note TEXT,
    UNIQUE (Provider, Model, EffectiveFrom)
) STRICT;`,T=`CREATE TABLE Client (
    ClientId INTEGER PRIMARY KEY, Name TEXT NOT NULL UNIQUE
) STRICT;`,o=`CREATE TABLE Project (
    ProjectId INTEGER PRIMARY KEY, ClientId INTEGER REFERENCES Client (ClientId),
    Name TEXT NOT NULL, Root TEXT NOT NULL UNIQUE
) STRICT;`,e=`CREATE TABLE Session (
    SessionId TEXT PRIMARY KEY, ProjectId INTEGER REFERENCES Project (ProjectId),
    ParentSessionId TEXT, Origin TEXT, DelegationDepth INTEGER, AgentPreset TEXT,
    Cwd TEXT, Title TEXT, CreatedAt INTEGER NOT NULL, EndedAt INTEGER
) STRICT;`,N=`CREATE TABLE File (
    FileId INTEGER PRIMARY KEY, ProjectId INTEGER NOT NULL REFERENCES Project (ProjectId),
    Path TEXT NOT NULL, Language TEXT, FirstSeenAt INTEGER NOT NULL,
    UNIQUE (ProjectId, Path)
) STRICT;`,l=`CREATE TABLE FileVersion (
    VersionId INTEGER PRIMARY KEY, FileId INTEGER NOT NULL REFERENCES File (FileId),
    Hash TEXT, Bytes INTEGER, Lines INTEGER, ObservedAt INTEGER NOT NULL
) STRICT;`,t=`CREATE TABLE Call (
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
) STRICT;`,I=`CREATE TABLE Touch (
    TouchId INTEGER PRIMARY KEY, CallId INTEGER NOT NULL REFERENCES Call (CallId),
    SessionId TEXT NOT NULL, Turn INTEGER NOT NULL, Step INTEGER NOT NULL,
    CallKey TEXT NOT NULL, Tool TEXT NOT NULL, FileId INTEGER NOT NULL REFERENCES File (FileId),
    VersionId INTEGER REFERENCES FileVersion (VersionId), Kind TEXT NOT NULL,
    BytesBefore INTEGER, BytesAfter INTEGER, BytesDelta INTEGER, LinesDelta INTEGER,
    Seq INTEGER NOT NULL, At INTEGER NOT NULL,
    UNIQUE (SessionId, CallKey, FileId)
) STRICT;`,L=`CREATE TABLE ContextMass (
    CallId INTEGER NOT NULL REFERENCES Call (CallId),
    FileId INTEGER REFERENCES File (FileId), Tokens INTEGER NOT NULL,
    PRIMARY KEY (CallId, FileId)
) STRICT;`,R=`CREATE TABLE Allocation (
    AllocationId INTEGER PRIMARY KEY, CallId INTEGER NOT NULL REFERENCES Call (CallId),
    FileId INTEGER REFERENCES File (FileId),
    DirectCost REAL NOT NULL, AmortizedCost REAL NOT NULL,
    ContextTokens INTEGER NOT NULL, SurfaceTokens INTEGER NOT NULL, Weight REAL NOT NULL,
    Method TEXT NOT NULL, At INTEGER NOT NULL,
    UNIQUE (CallId, FileId)
) STRICT;`,i=`CREATE TABLE Rollup (
    Scope TEXT NOT NULL, Key TEXT NOT NULL, Day TEXT NOT NULL,
    DirectCost REAL NOT NULL, AmortizedCost REAL NOT NULL, Cost REAL NOT NULL,
    Calls INTEGER NOT NULL, Tokens INTEGER NOT NULL, UpdatedAt INTEGER NOT NULL,
    PRIMARY KEY (Scope, Key, Day)
) STRICT;`,C=`CREATE TABLE Annotation (
    AnnotationId INTEGER PRIMARY KEY, FileId INTEGER NOT NULL REFERENCES File (FileId),
    VersionId INTEGER REFERENCES FileVersion (VersionId), Marker TEXT NOT NULL,
    Body TEXT NOT NULL, Cost REAL NOT NULL, At INTEGER NOT NULL
) STRICT;`,A=`CREATE TABLE Cursor (
    SessionId TEXT PRIMARY KEY, LastSeq INTEGER NOT NULL, UpdatedAt INTEGER NOT NULL
) STRICT;`,n=`CREATE VIEW FileCost AS
SELECT Allocation.FileId AS FileId,
    File.Path AS Path,
    SUM(Allocation.DirectCost) AS Direct,
    SUM(Allocation.AmortizedCost) AS Amortized,
    SUM(Allocation.DirectCost + Allocation.AmortizedCost) AS Total,
    COUNT(DISTINCT Allocation.CallId) AS Calls
FROM Allocation
JOIN Call ON Call.CallId = Allocation.CallId
JOIN File ON File.FileId = Allocation.FileId
GROUP BY Allocation.FileId, File.Path;`,s=`CREATE VIEW ModelCost AS
SELECT Call.Provider AS Provider,
    Call.Model AS Model,
    SUM(Allocation.DirectCost) AS Direct,
    SUM(Allocation.AmortizedCost) AS Amortized,
    SUM(Allocation.DirectCost + Allocation.AmortizedCost) AS Total,
    COUNT(DISTINCT Allocation.CallId) AS Calls,
    SUM(Call.TotalTokens) AS Tokens
FROM Allocation
JOIN Call ON Call.CallId = Allocation.CallId
GROUP BY Call.Provider, Call.Model;`,a=`CREATE VIEW SessionCost AS
SELECT Call.SessionId AS SessionId,
    SUM(Allocation.DirectCost) AS Direct,
    SUM(Allocation.AmortizedCost) AS Amortized,
    SUM(Allocation.DirectCost + Allocation.AmortizedCost) AS Total,
    COUNT(DISTINCT Allocation.CallId) AS Calls,
    SUM(Call.TotalTokens) AS Tokens
FROM Allocation
JOIN Call ON Call.CallId = Allocation.CallId
GROUP BY Call.SessionId;`,d=`CREATE VIEW ClientCost AS
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
GROUP BY Project.ClientId, Client.Name;`,r=[E,T,o,e,N,l,t,I,L,R,i,C,A,n,s,a,d];var U=r;export{R as Allocation,C as Annotation,t as Call,T as Client,d as ClientCost,L as ContextMass,A as Cursor,r as Ddl,N as File,n as FileCost,l as FileVersion,s as ModelCost,E as Price,o as Project,i as Rollup,e as Session,a as SessionCost,I as Touch,U as default};
