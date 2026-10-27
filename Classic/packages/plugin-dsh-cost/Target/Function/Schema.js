const o=`CREATE TABLE Price (
    PriceId INTEGER PRIMARY KEY,
    Provider TEXT NOT NULL, Model TEXT NOT NULL, Currency TEXT NOT NULL DEFAULT 'USD',
    InputRate REAL NOT NULL, OutputRate REAL NOT NULL,
    CacheReadRate REAL, CacheWriteRate REAL, ReasoningRate REAL,
    EffectiveFrom INTEGER NOT NULL, EffectiveTo INTEGER,
    Source TEXT NOT NULL, Note TEXT,
    Window TEXT NOT NULL DEFAULT 'any',
    UNIQUE (Provider, Model, EffectiveFrom)
) STRICT;`,N=`CREATE TABLE Client (
    ClientId INTEGER PRIMARY KEY, Name TEXT NOT NULL UNIQUE
) STRICT;`,t=`CREATE TABLE Project (
    ProjectId INTEGER PRIMARY KEY, ClientId INTEGER REFERENCES Client (ClientId),
    Name TEXT NOT NULL, Root TEXT NOT NULL UNIQUE
) STRICT;`,l=`CREATE TABLE Session (
    SessionId TEXT PRIMARY KEY, ProjectId INTEGER REFERENCES Project (ProjectId),
    ParentSessionId TEXT, Origin TEXT, DelegationDepth INTEGER, AgentPreset TEXT,
    Cwd TEXT, Title TEXT, CreatedAt INTEGER NOT NULL, EndedAt INTEGER
) STRICT;`,L=`CREATE TABLE File (
    FileId INTEGER PRIMARY KEY, ProjectId INTEGER NOT NULL REFERENCES Project (ProjectId),
    Path TEXT NOT NULL, Language TEXT, FirstSeenAt INTEGER NOT NULL,
    UNIQUE (ProjectId, Path)
) STRICT;`,i=`CREATE TABLE FileVersion (
    VersionId INTEGER PRIMARY KEY, FileId INTEGER NOT NULL REFERENCES File (FileId),
    Hash TEXT, Bytes INTEGER, Lines INTEGER, ObservedAt INTEGER NOT NULL
) STRICT;`,I=`CREATE TABLE Call (
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
    UNIQUE (SessionId, Turn, Step)
) STRICT;`,R=`CREATE TABLE Touch (
    TouchId INTEGER PRIMARY KEY, CallId INTEGER NOT NULL REFERENCES Call (CallId),
    SessionId TEXT NOT NULL, Turn INTEGER NOT NULL, Step INTEGER NOT NULL,
    CallKey TEXT NOT NULL, Tool TEXT NOT NULL, FileId INTEGER NOT NULL REFERENCES File (FileId),
    VersionId INTEGER REFERENCES FileVersion (VersionId), Kind TEXT NOT NULL,
    Stage TEXT, Branch TEXT, ReadBeforeEdit INTEGER NOT NULL DEFAULT 0,
    BytesBefore INTEGER, BytesAfter INTEGER, BytesDelta INTEGER, LinesDelta INTEGER,
    Seq INTEGER NOT NULL, At INTEGER NOT NULL,
    UNIQUE (SessionId, CallKey, FileId)
) STRICT;`,A=`CREATE TABLE ContextMass (
    CallId INTEGER NOT NULL REFERENCES Call (CallId),
    FileId INTEGER REFERENCES File (FileId), Tokens INTEGER NOT NULL,
    PRIMARY KEY (CallId, FileId)
) STRICT;`,C=`CREATE TABLE Allocation (
    AllocationId INTEGER PRIMARY KEY, CallId INTEGER NOT NULL REFERENCES Call (CallId),
    FileId INTEGER REFERENCES File (FileId),
    DirectCost REAL NOT NULL, AmortizedCost REAL NOT NULL,
    ContextTokens INTEGER NOT NULL, SurfaceTokens INTEGER NOT NULL, Weight REAL NOT NULL,
    Method TEXT NOT NULL, At INTEGER NOT NULL,
    UNIQUE (CallId, FileId)
) STRICT;`,n=`CREATE TABLE Rollup (
    Scope TEXT NOT NULL, Key TEXT NOT NULL, Day TEXT NOT NULL,
    DirectCost REAL NOT NULL, AmortizedCost REAL NOT NULL, Cost REAL NOT NULL,
    Calls INTEGER NOT NULL, Tokens INTEGER NOT NULL, UpdatedAt INTEGER NOT NULL,
    PRIMARY KEY (Scope, Key, Day)
) STRICT;`,s=`CREATE TABLE Annotation (
    AnnotationId INTEGER PRIMARY KEY, FileId INTEGER NOT NULL REFERENCES File (FileId),
    VersionId INTEGER REFERENCES FileVersion (VersionId), Marker TEXT NOT NULL,
    Body TEXT NOT NULL, Cost REAL NOT NULL, At INTEGER NOT NULL
) STRICT;`,a=`CREATE TABLE Cursor (
    SessionId TEXT PRIMARY KEY, LastSeq INTEGER NOT NULL, UpdatedAt INTEGER NOT NULL
) STRICT;`,d=`CREATE VIEW FileCost AS
SELECT Allocation.FileId AS FileId,
    File.Path AS Path,
    SUM(Allocation.DirectCost) AS Direct,
    SUM(Allocation.AmortizedCost) AS Amortized,
    SUM(Allocation.DirectCost + Allocation.AmortizedCost) AS Total,
    COUNT(DISTINCT Allocation.CallId) AS Calls
FROM Allocation
JOIN Call ON Call.CallId = Allocation.CallId
JOIN File ON File.FileId = Allocation.FileId
GROUP BY Allocation.FileId, File.Path;`,r=`CREATE VIEW ModelCost AS
SELECT Call.Provider AS Provider,
    Call.Model AS Model,
    SUM(Allocation.DirectCost) AS Direct,
    SUM(Allocation.AmortizedCost) AS Amortized,
    SUM(Allocation.DirectCost + Allocation.AmortizedCost) AS Total,
    COUNT(DISTINCT Allocation.CallId) AS Calls,
    SUM(Call.TotalTokens) AS Tokens
FROM Allocation
JOIN Call ON Call.CallId = Allocation.CallId
GROUP BY Call.Provider, Call.Model;`,U=`CREATE VIEW SessionCost AS
SELECT Call.SessionId AS SessionId,
    SUM(Allocation.DirectCost) AS Direct,
    SUM(Allocation.AmortizedCost) AS Amortized,
    SUM(Allocation.DirectCost + Allocation.AmortizedCost) AS Total,
    COUNT(DISTINCT Allocation.CallId) AS Calls,
    SUM(Call.TotalTokens) AS Tokens
FROM Allocation
JOIN Call ON Call.CallId = Allocation.CallId
GROUP BY Call.SessionId;`,S=`CREATE VIEW ClientCost AS
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
GROUP BY Project.ClientId, Client.Name;`,c="ALTER TABLE Price ADD COLUMN Window TEXT NOT NULL DEFAULT 'any';",O="ALTER TABLE Call ADD COLUMN CacheSaving REAL NOT NULL DEFAULT 0;",F="ALTER TABLE Touch ADD COLUMN Stage TEXT;",G="ALTER TABLE Touch ADD COLUMN Branch TEXT;",P="ALTER TABLE Touch ADD COLUMN ReadBeforeEdit INTEGER NOT NULL DEFAULT 0;",E=`CREATE TABLE Alias (
    AliasId INTEGER PRIMARY KEY, FileId INTEGER NOT NULL REFERENCES File (FileId),
    FromPath TEXT NOT NULL, ToPath TEXT NOT NULL, At INTEGER NOT NULL
) STRICT;`,T=`CREATE TABLE Verdict (
    SessionId TEXT NOT NULL REFERENCES Session (SessionId),
    FileId INTEGER NOT NULL REFERENCES File (FileId),
    State TEXT NOT NULL, LinesAdded INTEGER NOT NULL DEFAULT 0,
    LinesRemoved INTEGER NOT NULL DEFAULT 0, At INTEGER NOT NULL,
    PRIMARY KEY (SessionId, FileId)
) STRICT;`,e=`CREATE VIEW FileLifetime AS
SELECT f.FileId, f.Path, count(DISTINCT c.SessionId) AS Sessions,
       sum(a.DirectCost) AS Direct, sum(a.AmortizedCost) AS Amortized,
       sum(a.DirectCost + a.AmortizedCost) AS Cost
FROM File AS f
JOIN Allocation AS a ON a.FileId = f.FileId
JOIN Call AS c ON c.CallId = a.CallId
GROUP BY f.FileId;`,M=[c,O,F,G,P,E,T,e,"PRAGMA user_version = 2;"],D=[o,N,t,l,L,i,I,R,A,C,n,s,a,d,r,U,S,E,T,e];var p=D;export{E as Alias,C as Allocation,s as Annotation,I as Call,O as CallSaving,N as Client,S as ClientCost,A as ContextMass,a as Cursor,D as Ddl,L as File,d as FileCost,e as FileLifetime,i as FileVersion,M as Migration,r as ModelCost,o as Price,c as PriceWindow,t as Project,n as Rollup,l as Session,U as SessionCost,R as Touch,G as TouchBranch,P as TouchRead,F as TouchStage,T as Verdict,p as default};
