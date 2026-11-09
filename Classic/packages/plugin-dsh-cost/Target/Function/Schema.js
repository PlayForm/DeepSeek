const A=`CREATE TABLE Price (
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
) STRICT;`,r=`CREATE TABLE Client (
    ClientId INTEGER PRIMARY KEY, Name TEXT NOT NULL UNIQUE
) STRICT;`,C=`CREATE TABLE Project (
    ProjectId INTEGER PRIMARY KEY, ClientId INTEGER REFERENCES Client (ClientId),
    Name TEXT NOT NULL, Root TEXT NOT NULL UNIQUE
) STRICT;`,d=`CREATE TABLE Session (
    SessionId TEXT PRIMARY KEY, ProjectId INTEGER REFERENCES Project (ProjectId),
    ParentSessionId TEXT, Origin TEXT, DelegationDepth INTEGER, AgentPreset TEXT,
    Cwd TEXT, Title TEXT, CreatedAt INTEGER NOT NULL, EndedAt INTEGER
) STRICT;`,s=`CREATE TABLE File (
    FileId INTEGER PRIMARY KEY, ProjectId INTEGER NOT NULL REFERENCES Project (ProjectId),
    Path TEXT NOT NULL, Language TEXT, FirstSeenAt INTEGER NOT NULL,
    UNIQUE (ProjectId, Path)
) STRICT;`,U=`CREATE TABLE FileVersion (
    VersionId INTEGER PRIMARY KEY, FileId INTEGER NOT NULL REFERENCES File (FileId),
    Hash TEXT, Bytes INTEGER, Lines INTEGER, ObservedAt INTEGER NOT NULL
) STRICT;`,O=`CREATE TABLE Call (
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
) STRICT;`,c=`CREATE TABLE Touch (
    TouchId INTEGER PRIMARY KEY, CallId INTEGER NOT NULL REFERENCES Call (CallId),
    SessionId TEXT NOT NULL, Turn INTEGER NOT NULL, Step INTEGER NOT NULL,
    CallKey TEXT NOT NULL, Tool TEXT NOT NULL, FileId INTEGER NOT NULL REFERENCES File (FileId),
    VersionId INTEGER REFERENCES FileVersion (VersionId), Kind TEXT NOT NULL,
    Stage TEXT, Branch TEXT, ReadBeforeEdit INTEGER NOT NULL DEFAULT 0,
    BytesBefore INTEGER, BytesAfter INTEGER, BytesDelta INTEGER, LinesDelta INTEGER,
    DurationMs INTEGER, ResultBytes INTEGER,
    Seq INTEGER NOT NULL, At INTEGER NOT NULL,
    UNIQUE (SessionId, CallKey, FileId)
) STRICT;`,S=`CREATE TABLE ContextMass (
    CallId INTEGER NOT NULL REFERENCES Call (CallId),
    FileId INTEGER REFERENCES File (FileId), Tokens INTEGER NOT NULL,
    PRIMARY KEY (CallId, FileId)
) STRICT;`,F=`CREATE TABLE Allocation (
    AllocationId INTEGER PRIMARY KEY, CallId INTEGER NOT NULL REFERENCES Call (CallId),
    FileId INTEGER REFERENCES File (FileId),
    DirectCost REAL NOT NULL, AmortizedCost REAL NOT NULL,
    ContextTokens INTEGER NOT NULL, SurfaceTokens INTEGER NOT NULL, Weight REAL NOT NULL,
    Method TEXT NOT NULL, At INTEGER NOT NULL,
    UNIQUE (CallId, FileId)
) STRICT;`,M=`CREATE TABLE Rollup (
    Scope TEXT NOT NULL, Key TEXT NOT NULL, Day TEXT NOT NULL,
    DirectCost REAL NOT NULL, AmortizedCost REAL NOT NULL, Cost REAL NOT NULL,
    Calls INTEGER NOT NULL, Tokens INTEGER NOT NULL, UpdatedAt INTEGER NOT NULL,
    PRIMARY KEY (Scope, Key, Day)
) STRICT;`,G=`CREATE TABLE Annotation (
    AnnotationId INTEGER PRIMARY KEY, FileId INTEGER NOT NULL REFERENCES File (FileId),
    VersionId INTEGER REFERENCES FileVersion (VersionId), Marker TEXT NOT NULL,
    Body TEXT NOT NULL, Cost REAL NOT NULL, At INTEGER NOT NULL
) STRICT;`,D=`CREATE TABLE Cursor (
    SessionId TEXT PRIMARY KEY, LastSeq INTEGER NOT NULL, UpdatedAt INTEGER NOT NULL
) STRICT;`,p=`CREATE VIEW FileCost AS
SELECT Allocation.FileId AS FileId,
    File.Path AS Path,
    SUM(Allocation.DirectCost) AS Direct,
    SUM(Allocation.AmortizedCost) AS Amortized,
    SUM(Allocation.DirectCost + Allocation.AmortizedCost) AS Total,
    COUNT(DISTINCT Allocation.CallId) AS Calls
FROM Allocation
JOIN Call ON Call.CallId = Allocation.CallId
JOIN File ON File.FileId = Allocation.FileId
GROUP BY Allocation.FileId, File.Path;`,P=`CREATE VIEW ModelCost AS
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
GROUP BY Call.Provider, Call.Model;`,u=`CREATE VIEW SessionCost AS
SELECT Call.SessionId AS SessionId,
    SUM(Money.Direct) AS Direct,
    SUM(Money.Amortized) AS Amortized,
    SUM(Money.Direct + Money.Amortized) AS Total,
    COUNT(Call.CallId) AS Calls,
    SUM(Call.TotalTokens) AS Tokens
FROM Call
JOIN (SELECT CallId, SUM(DirectCost) AS Direct, SUM(AmortizedCost) AS Amortized
    FROM Allocation GROUP BY CallId) AS Money ON Money.CallId = Call.CallId
GROUP BY Call.SessionId;`,X=`CREATE VIEW ClientCost AS
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
GROUP BY Project.ClientId, Client.Name;`,B="ALTER TABLE Price ADD COLUMN Window TEXT NOT NULL DEFAULT 'any';",x="ALTER TABLE Call ADD COLUMN CacheSaving REAL NOT NULL DEFAULT 0;",m="ALTER TABLE Touch ADD COLUMN Stage TEXT;",v="ALTER TABLE Touch ADD COLUMN Branch TEXT;",y="ALTER TABLE Touch ADD COLUMN ReadBeforeEdit INTEGER NOT NULL DEFAULT 0;",E=`CREATE TABLE Alias (
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
GROUP BY f.FileId;`,Y="ALTER TABLE Price ADD COLUMN TierFrom INTEGER NOT NULL DEFAULT 0;",g="ALTER TABLE Price ADD COLUMN TierTo INTEGER;",h="ALTER TABLE Price ADD COLUMN Mode TEXT NOT NULL DEFAULT 'standard';",V="ALTER TABLE Price ADD COLUMN Region TEXT;",o=`CREATE TABLE Modifier (
    ModifierId INTEGER PRIMARY KEY, Provider TEXT NOT NULL, Model TEXT,
    Kind TEXT NOT NULL, Value TEXT NOT NULL, Multiplier REAL NOT NULL,
    EffectiveFrom INTEGER NOT NULL, EffectiveTo INTEGER, Source TEXT NOT NULL
) STRICT;`,t=`CREATE TABLE Factor (
    FactorId INTEGER PRIMARY KEY, Scope TEXT NOT NULL, Key TEXT NOT NULL, Value TEXT NOT NULL,
    UNIQUE (Scope, Key, Value)
) STRICT;`,N=`CREATE TABLE CallFactor (
    CallId INTEGER NOT NULL REFERENCES Call (CallId),
    FactorId INTEGER NOT NULL REFERENCES Factor (FactorId), Weight REAL NOT NULL DEFAULT 1,
    PRIMARY KEY (CallId, FactorId)
) STRICT;`,f="ALTER TABLE Call ADD COLUMN Mode TEXT NOT NULL DEFAULT 'standard';",K="ALTER TABLE Call ADD COLUMN Region TEXT;",W="ALTER TABLE Call ADD COLUMN Tier INTEGER;",L=`CREATE TABLE Edit (
    EditId INTEGER PRIMARY KEY,
    TouchId INTEGER NOT NULL REFERENCES Touch (TouchId),
    Ordinal INTEGER NOT NULL, LinesAdded INTEGER NOT NULL DEFAULT 0,
    LinesRemoved INTEGER NOT NULL DEFAULT 0, BytesAdded INTEGER NOT NULL DEFAULT 0,
    BytesRemoved INTEGER NOT NULL DEFAULT 0, BeforeHash TEXT, AfterHash TEXT,
    At INTEGER NOT NULL, UNIQUE (TouchId, Ordinal)
) STRICT;`,z="ALTER TABLE Call ADD COLUMN LatencyMs INTEGER;",k="ALTER TABLE Call ADD COLUMN FirstTokenMs INTEGER;",w="ALTER TABLE Call ADD COLUMN TokensPerSecond REAL;",j="ALTER TABLE Call ADD COLUMN Attempts INTEGER NOT NULL DEFAULT 1;",Q="ALTER TABLE Call ADD COLUMN ErrorCode TEXT;",b="ALTER TABLE Call ADD COLUMN ContextWindow INTEGER;",J="ALTER TABLE Call ADD COLUMN Utilization REAL;",H="ALTER TABLE Touch ADD COLUMN DurationMs INTEGER;",_="ALTER TABLE Touch ADD COLUMN ResultBytes INTEGER;",R=`CREATE TABLE Catalog (
    CatalogId INTEGER PRIMARY KEY, Name TEXT NOT NULL UNIQUE
) STRICT;`,i=`CREATE TABLE Revision (
    RevisionId INTEGER PRIMARY KEY,
    CatalogId INTEGER NOT NULL REFERENCES Catalog (CatalogId),
    ParentRevisionId INTEGER REFERENCES Revision (RevisionId),
    CreatedAt INTEGER NOT NULL, Reason TEXT NOT NULL,
    Status TEXT NOT NULL DEFAULT 'draft'
) STRICT;`,l=`CREATE TABLE RateRow (
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
) STRICT;`,a=`CREATE TABLE Valuation (
    ValuationId INTEGER PRIMARY KEY, Basis TEXT NOT NULL,
    RevisionId INTEGER NOT NULL REFERENCES Revision (RevisionId),
    PolicyVersion TEXT NOT NULL, EvidenceCutoff INTEGER,
    CreatedAt INTEGER NOT NULL, Note TEXT
) STRICT;`,I=`CREATE TABLE ValuationCost (
    ValuationId INTEGER NOT NULL REFERENCES Valuation (ValuationId),
    CallId INTEGER NOT NULL REFERENCES Call (CallId),
    Component TEXT NOT NULL, Amount REAL NOT NULL, Currency TEXT NOT NULL,
    PRIMARY KEY (ValuationId, CallId, Component)
) STRICT;`,n=`CREATE TABLE ValuationAllocation (
    ValuationAllocationId INTEGER PRIMARY KEY,
    ValuationId INTEGER NOT NULL REFERENCES Valuation (ValuationId),
    CallId INTEGER NOT NULL REFERENCES Call (CallId),
    FileId INTEGER REFERENCES File (FileId),
    Amount REAL NOT NULL, Currency TEXT NOT NULL,
    UNIQUE (ValuationId, CallId, FileId)
) STRICT;`,q="INSERT INTO Catalog (Name) VALUES ('bootstrap');",Z=`INSERT INTO Revision (CatalogId, ParentRevisionId, CreatedAt, Reason, Status)
SELECT CatalogId, NULL, CAST(strftime('%s', 'now') AS INTEGER) * 1000,
    'the recorded price book, seeded at the v5 rung', 'published'
FROM Catalog WHERE Name = 'bootstrap';`,$=`INSERT INTO RateRow (RevisionId, Provider, Model, Currency, InputRate, OutputRate,
    CacheReadRate, CacheWriteRate, ReasoningRate, ValidFrom, ValidTo, Mode, Region, Window,
    TierFrom, TierTo, Note)
SELECT Revision.RevisionId, Provider, Model, Currency, InputRate, OutputRate,
    CacheReadRate, CacheWriteRate, ReasoningRate, EffectiveFrom, EffectiveTo, Mode, Region,
    Window, TierFrom, TierTo, Note
FROM Price
JOIN Revision ON Revision.CatalogId = (SELECT CatalogId FROM Catalog WHERE Name = 'bootstrap');`,EE=`INSERT INTO Valuation (Basis, RevisionId, PolicyVersion, EvidenceCutoff, CreatedAt, Note)
SELECT 'as-recorded', Revision.RevisionId,
    COALESCE((SELECT Method FROM Allocation ORDER BY AllocationId DESC LIMIT 1), 'bytes/context'),
    NULL, CAST(strftime('%s', 'now') AS INTEGER) * 1000,
    'the recorded book, priced by the bootstrap revision'
FROM Revision
WHERE Revision.CatalogId = (SELECT CatalogId FROM Catalog WHERE Name = 'bootstrap');`,eE=[B,x,m,v,y,E,T,e,"PRAGMA user_version = 2;"],oE=[Y,g,h,V,o,t,N,f,K,W,"PRAGMA user_version = 3;"],tE=[L,z,k,w,j,Q,b,J,H,_,"PRAGMA user_version = 4;"],NE=[R,i,l,a,I,n,q,Z,$,EE,"PRAGMA user_version = 5;"],TE=[A,r,C,d,s,U,O,c,S,F,M,G,D,p,P,u,X,E,T,e,o,t,N,L,R,i,l,a,I,n];var LE=TE;export{E as Alias,F as Allocation,G as Annotation,O as Call,j as CallAttempts,Q as CallError,N as CallFactor,k as CallFirstToken,z as CallLatency,f as CallMode,w as CallRate,K as CallRegion,x as CallSaving,W as CallTier,J as CallUtilization,b as CallWindow,R as Catalog,r as Client,X as ClientCost,S as ContextMass,D as Cursor,TE as Ddl,L as Edit,t as Factor,s as File,p as FileCost,e as FileLifetime,U as FileVersion,eE as Migration,oE as MigrationFactor,NE as MigrationPricing,tE as MigrationTelemetry,P as ModelCost,o as Modifier,A as Price,h as PriceMode,V as PriceRegion,Y as PriceTier,g as PriceTierTo,B as PriceWindow,C as Project,l as RateRow,i as Revision,M as Rollup,q as SeedCatalog,$ as SeedRateRow,Z as SeedRevision,EE as SeedValuation,d as Session,u as SessionCost,c as Touch,v as TouchBranch,_ as TouchBytes,H as TouchDuration,y as TouchRead,m as TouchStage,a as Valuation,n as ValuationAllocation,I as ValuationCost,T as Verdict,LE as default};
