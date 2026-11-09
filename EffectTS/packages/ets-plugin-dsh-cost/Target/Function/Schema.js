const c=`CREATE TABLE Price (
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
) STRICT;`,O=`CREATE TABLE Client (
    ClientId INTEGER PRIMARY KEY, Name TEXT NOT NULL UNIQUE
) STRICT;`,S=`CREATE TABLE Project (
    ProjectId INTEGER PRIMARY KEY, ClientId INTEGER REFERENCES Client (ClientId),
    Name TEXT NOT NULL, Root TEXT NOT NULL UNIQUE
) STRICT;`,F=`CREATE TABLE Session (
    SessionId TEXT PRIMARY KEY, ProjectId INTEGER REFERENCES Project (ProjectId),
    ParentSessionId TEXT, Origin TEXT, DelegationDepth INTEGER, AgentPreset TEXT,
    Cwd TEXT, Title TEXT, CreatedAt INTEGER NOT NULL, EndedAt INTEGER
) STRICT;`,G=`CREATE TABLE File (
    FileId INTEGER PRIMARY KEY, ProjectId INTEGER NOT NULL REFERENCES Project (ProjectId),
    Path TEXT NOT NULL, Language TEXT, FirstSeenAt INTEGER NOT NULL,
    UNIQUE (ProjectId, Path)
) STRICT;`,E=`CREATE TABLE FileVersion (
    VersionId INTEGER PRIMARY KEY, FileId INTEGER NOT NULL REFERENCES File (FileId),
    Hash TEXT, Bytes INTEGER, Lines INTEGER, ObservedAt INTEGER NOT NULL
) STRICT;`,M=`CREATE TABLE Call (
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
) STRICT;`,D=`CREATE TABLE Touch (
    TouchId INTEGER PRIMARY KEY, CallId INTEGER NOT NULL REFERENCES Call (CallId),
    SessionId TEXT NOT NULL, Turn INTEGER NOT NULL, Step INTEGER NOT NULL,
    CallKey TEXT NOT NULL, Tool TEXT NOT NULL, FileId INTEGER NOT NULL REFERENCES File (FileId),
    VersionId INTEGER REFERENCES FileVersion (VersionId), Kind TEXT NOT NULL,
    Stage TEXT, Branch TEXT, ReadBeforeEdit INTEGER NOT NULL DEFAULT 0,
    BytesBefore INTEGER, BytesAfter INTEGER, BytesDelta INTEGER, LinesDelta INTEGER,
    DurationMs INTEGER, ResultBytes INTEGER,
    Seq INTEGER NOT NULL, At INTEGER NOT NULL,
    UNIQUE (SessionId, CallKey, FileId)
) STRICT;`,p=`CREATE TABLE ContextMass (
    CallId INTEGER NOT NULL REFERENCES Call (CallId),
    FileId INTEGER REFERENCES File (FileId), Tokens INTEGER NOT NULL,
    PRIMARY KEY (CallId, FileId)
) STRICT;`,u=`CREATE TABLE Allocation (
    AllocationId INTEGER PRIMARY KEY, CallId INTEGER NOT NULL REFERENCES Call (CallId),
    FileId INTEGER REFERENCES File (FileId),
    DirectCost REAL NOT NULL, AmortizedCost REAL NOT NULL,
    ContextTokens INTEGER NOT NULL, SurfaceTokens INTEGER NOT NULL, Weight REAL NOT NULL,
    Method TEXT NOT NULL, At INTEGER NOT NULL,
    UNIQUE (CallId, FileId)
) STRICT;`,P=`CREATE TABLE Rollup (
    Scope TEXT NOT NULL, Key TEXT NOT NULL, Day TEXT NOT NULL,
    DirectCost REAL NOT NULL, AmortizedCost REAL NOT NULL, Cost REAL NOT NULL,
    Calls INTEGER NOT NULL, Tokens INTEGER NOT NULL, UpdatedAt INTEGER NOT NULL,
    PRIMARY KEY (Scope, Key, Day)
) STRICT;`,X=`CREATE TABLE Annotation (
    AnnotationId INTEGER PRIMARY KEY, FileId INTEGER NOT NULL REFERENCES File (FileId),
    VersionId INTEGER REFERENCES FileVersion (VersionId), Marker TEXT NOT NULL,
    Body TEXT NOT NULL, Cost REAL NOT NULL, At INTEGER NOT NULL
) STRICT;`,B=`CREATE TABLE Cursor (
    SessionId TEXT PRIMARY KEY, LastSeq INTEGER NOT NULL, UpdatedAt INTEGER NOT NULL
) STRICT;`,x=`CREATE VIEW FileCost AS
SELECT Allocation.FileId AS FileId,
    File.Path AS Path,
    SUM(Allocation.DirectCost) AS Direct,
    SUM(Allocation.AmortizedCost) AS Amortized,
    SUM(Allocation.DirectCost + Allocation.AmortizedCost) AS Total,
    COUNT(DISTINCT Allocation.CallId) AS Calls
FROM Allocation
JOIN Call ON Call.CallId = Allocation.CallId
JOIN File ON File.FileId = Allocation.FileId
GROUP BY Allocation.FileId, File.Path;`,T=`CREATE VIEW ModelCost AS
SELECT Call.Provider AS Provider,
    Call.Model AS Model,
    SUM(Allocation.DirectCost) AS Direct,
    SUM(Allocation.AmortizedCost) AS Amortized,
    SUM(Allocation.DirectCost + Allocation.AmortizedCost) AS Total,
    COUNT(DISTINCT Allocation.CallId) AS Calls,
    SUM(Call.TotalTokens) AS Tokens
FROM Allocation
JOIN Call ON Call.CallId = Allocation.CallId
GROUP BY Call.Provider, Call.Model;`,o=`CREATE VIEW SessionCost AS
SELECT Call.SessionId AS SessionId,
    SUM(Allocation.DirectCost) AS Direct,
    SUM(Allocation.AmortizedCost) AS Amortized,
    SUM(Allocation.DirectCost + Allocation.AmortizedCost) AS Total,
    COUNT(DISTINCT Allocation.CallId) AS Calls,
    SUM(Call.TotalTokens) AS Tokens
FROM Allocation
JOIN Call ON Call.CallId = Allocation.CallId
GROUP BY Call.SessionId;`,e=`CREATE VIEW ClientCost AS
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
GROUP BY Project.ClientId, Client.Name;`,g="ALTER TABLE Price ADD COLUMN Window TEXT NOT NULL DEFAULT 'any';",m="ALTER TABLE Call ADD COLUMN CacheSaving REAL NOT NULL DEFAULT 0;",v="ALTER TABLE Touch ADD COLUMN Stage TEXT;",h="ALTER TABLE Touch ADD COLUMN Branch TEXT;",Y="ALTER TABLE Touch ADD COLUMN ReadBeforeEdit INTEGER NOT NULL DEFAULT 0;",t=`CREATE TABLE Alias (
    AliasId INTEGER PRIMARY KEY, FileId INTEGER NOT NULL REFERENCES File (FileId),
    FromPath TEXT NOT NULL, ToPath TEXT NOT NULL, At INTEGER NOT NULL
) STRICT;`,N=`CREATE TABLE Verdict (
    SessionId TEXT NOT NULL REFERENCES Session (SessionId),
    FileId INTEGER NOT NULL REFERENCES File (FileId),
    State TEXT NOT NULL, LinesAdded INTEGER NOT NULL DEFAULT 0,
    LinesRemoved INTEGER NOT NULL DEFAULT 0, At INTEGER NOT NULL,
    PRIMARY KEY (SessionId, FileId)
) STRICT;`,L=`CREATE VIEW FileLifetime AS
SELECT f.FileId, f.Path, count(DISTINCT c.SessionId) AS Sessions,
       sum(a.DirectCost) AS Direct, sum(a.AmortizedCost) AS Amortized,
       sum(a.DirectCost + a.AmortizedCost) AS Cost
FROM File AS f
JOIN Allocation AS a ON a.FileId = f.FileId
JOIN Call AS c ON c.CallId = a.CallId
GROUP BY f.FileId;`,V="ALTER TABLE Price ADD COLUMN TierFrom INTEGER NOT NULL DEFAULT 0;",y="ALTER TABLE Price ADD COLUMN TierTo INTEGER;",f="ALTER TABLE Price ADD COLUMN Mode TEXT NOT NULL DEFAULT 'standard';",K="ALTER TABLE Price ADD COLUMN Region TEXT;",R=`CREATE TABLE Modifier (
    ModifierId INTEGER PRIMARY KEY, Provider TEXT NOT NULL, Model TEXT,
    Kind TEXT NOT NULL, Value TEXT NOT NULL, Multiplier REAL NOT NULL,
    EffectiveFrom INTEGER NOT NULL, EffectiveTo INTEGER, Source TEXT NOT NULL
) STRICT;`,i=`CREATE TABLE Factor (
    FactorId INTEGER PRIMARY KEY, Scope TEXT NOT NULL, Key TEXT NOT NULL, Value TEXT NOT NULL,
    UNIQUE (Scope, Key, Value)
) STRICT;`,l=`CREATE TABLE CallFactor (
    CallId INTEGER NOT NULL REFERENCES Call (CallId),
    FactorId INTEGER NOT NULL REFERENCES Factor (FactorId), Weight REAL NOT NULL DEFAULT 1,
    PRIMARY KEY (CallId, FactorId)
) STRICT;`,W="ALTER TABLE Call ADD COLUMN Mode TEXT NOT NULL DEFAULT 'standard';",k="ALTER TABLE Call ADD COLUMN Region TEXT;",z="ALTER TABLE Call ADD COLUMN Tier INTEGER;",a=`CREATE TABLE Edit (
    EditId INTEGER PRIMARY KEY,
    TouchId INTEGER NOT NULL REFERENCES Touch (TouchId),
    Ordinal INTEGER NOT NULL, LinesAdded INTEGER NOT NULL DEFAULT 0,
    LinesRemoved INTEGER NOT NULL DEFAULT 0, BytesAdded INTEGER NOT NULL DEFAULT 0,
    BytesRemoved INTEGER NOT NULL DEFAULT 0, BeforeHash TEXT, AfterHash TEXT,
    At INTEGER NOT NULL, UNIQUE (TouchId, Ordinal)
) STRICT;`,w="ALTER TABLE Call ADD COLUMN LatencyMs INTEGER;",j="ALTER TABLE Call ADD COLUMN FirstTokenMs INTEGER;",b="ALTER TABLE Call ADD COLUMN TokensPerSecond REAL;",Q="ALTER TABLE Call ADD COLUMN Attempts INTEGER NOT NULL DEFAULT 1;",J="ALTER TABLE Call ADD COLUMN ErrorCode TEXT;",H="ALTER TABLE Call ADD COLUMN ContextWindow INTEGER;",_="ALTER TABLE Call ADD COLUMN Utilization REAL;",q="ALTER TABLE Touch ADD COLUMN DurationMs INTEGER;",Z="ALTER TABLE Touch ADD COLUMN ResultBytes INTEGER;",I=`CREATE TABLE Catalog (
    CatalogId INTEGER PRIMARY KEY, Name TEXT NOT NULL UNIQUE
) STRICT;`,n=`CREATE TABLE Revision (
    RevisionId INTEGER PRIMARY KEY,
    CatalogId INTEGER NOT NULL REFERENCES Catalog (CatalogId),
    ParentRevisionId INTEGER REFERENCES Revision (RevisionId),
    CreatedAt INTEGER NOT NULL, Reason TEXT NOT NULL,
    Status TEXT NOT NULL DEFAULT 'draft'
) STRICT;`,A=`CREATE TABLE RateRow (
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
) STRICT;`,C=`CREATE TABLE Valuation (
    ValuationId INTEGER PRIMARY KEY, Basis TEXT NOT NULL,
    RevisionId INTEGER NOT NULL REFERENCES Revision (RevisionId),
    PolicyVersion TEXT NOT NULL, EvidenceCutoff INTEGER,
    CreatedAt INTEGER NOT NULL, Note TEXT
) STRICT;`,r=`CREATE TABLE ValuationCost (
    ValuationId INTEGER NOT NULL REFERENCES Valuation (ValuationId),
    CallId INTEGER NOT NULL REFERENCES Call (CallId),
    Component TEXT NOT NULL, Amount REAL NOT NULL, Currency TEXT NOT NULL,
    PRIMARY KEY (ValuationId, CallId, Component)
) STRICT;`,s=`CREATE TABLE ValuationAllocation (
    ValuationAllocationId INTEGER PRIMARY KEY,
    ValuationId INTEGER NOT NULL REFERENCES Valuation (ValuationId),
    CallId INTEGER NOT NULL REFERENCES Call (CallId),
    FileId INTEGER REFERENCES File (FileId),
    Amount REAL NOT NULL, Currency TEXT NOT NULL,
    UNIQUE (ValuationId, CallId, FileId)
) STRICT;`,$="INSERT INTO Catalog (Name) VALUES ('bootstrap');",EE=`INSERT INTO Revision (CatalogId, ParentRevisionId, CreatedAt, Reason, Status)
SELECT CatalogId, NULL, CAST(strftime('%s', 'now') AS INTEGER) * 1000,
    'the recorded price book, seeded at the v7 rung', 'published'
FROM Catalog WHERE Name = 'bootstrap';`,TE=`INSERT INTO RateRow (RevisionId, Provider, Model, Currency, InputRate, OutputRate,
    CacheReadRate, CacheWriteRate, ReasoningRate, ValidFrom, ValidTo, Mode, Region, Window,
    TierFrom, TierTo, Note)
SELECT Revision.RevisionId, Provider, Model, Currency, InputRate, OutputRate,
    CacheReadRate, CacheWriteRate, ReasoningRate, EffectiveFrom, EffectiveTo, Mode, Region,
    Window, TierFrom, TierTo, Note
FROM Price
JOIN Revision ON Revision.CatalogId = (SELECT CatalogId FROM Catalog WHERE Name = 'bootstrap');`,oE=`INSERT INTO Valuation (Basis, RevisionId, PolicyVersion, EvidenceCutoff, CreatedAt, Note)
SELECT 'as-recorded', Revision.RevisionId,
    COALESCE((SELECT Method FROM Allocation ORDER BY AllocationId DESC LIMIT 1), 'bytes/context'),
    NULL, CAST(strftime('%s', 'now') AS INTEGER) * 1000,
    'the recorded book, priced by the bootstrap revision'
FROM Revision
WHERE Revision.CatalogId = (SELECT CatalogId FROM Catalog WHERE Name = 'bootstrap');`,NE=[g,m,v,h,Y,t,N,L,"PRAGMA user_version = 2;"],LE=[V,y,f,K,R,i,l,W,k,z,"PRAGMA user_version = 3;"],RE=[a,w,j,b,Q,J,H,_,q,Z,"PRAGMA user_version = 4;"],eE="ALTER TABLE Touch ADD COLUMN VersionId INTEGER REFERENCES FileVersion (VersionId);",iE=(d,U)=>[...d?[]:[E],...U?[]:[eE]],lE=[I,n,A,C,r,s,$,EE,TE,oE,"DROP VIEW IF EXISTS ModelCost;","DROP VIEW IF EXISTS SessionCost;","DROP VIEW IF EXISTS ClientCost;",T,o,e,"PRAGMA user_version = 7;"],tE=[c,O,S,F,G,E,M,D,p,u,P,X,B,x,T,o,e,t,N,L,R,i,l,a,I,n,A,C,r,s];var aE=tE;export{t as Alias,u as Allocation,X as Annotation,M as Call,Q as CallAttempts,J as CallError,l as CallFactor,j as CallFirstToken,w as CallLatency,W as CallMode,b as CallRate,k as CallRegion,m as CallSaving,z as CallTier,_ as CallUtilization,H as CallWindow,I as Catalog,O as Client,e as ClientCost,p as ContextMass,B as Cursor,tE as Ddl,a as Edit,i as Factor,G as File,x as FileCost,L as FileLifetime,E as FileVersion,NE as Migration,LE as MigrationFactor,lE as MigrationPricing,RE as MigrationTelemetry,iE as MigrationVersioning,T as ModelCost,R as Modifier,c as Price,f as PriceMode,K as PriceRegion,V as PriceTier,y as PriceTierTo,g as PriceWindow,S as Project,A as RateRow,n as Revision,P as Rollup,$ as SeedCatalog,TE as SeedRateRow,EE as SeedRevision,oE as SeedValuation,F as Session,o as SessionCost,D as Touch,h as TouchBranch,Z as TouchBytes,q as TouchDuration,Y as TouchRead,v as TouchStage,eE as TouchVersion,C as Valuation,s as ValuationAllocation,r as ValuationCost,N as Verdict,aE as default};
