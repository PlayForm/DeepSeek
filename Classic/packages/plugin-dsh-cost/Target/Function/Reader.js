const u={Session:`SELECT Session.Title AS Title,
    Session.Cwd AS Cwd,
    Session.Origin AS Origin,
    Session.AgentPreset AS AgentPreset,
    Session.ParentSessionId AS ParentSessionId,
    Session.DelegationDepth AS DelegationDepth,
    Session.CreatedAt AS CreatedAt,
    Session.EndedAt AS EndedAt
FROM Session
WHERE Session.SessionId = ?;`,Project:`SELECT Project.Name AS Name,
    Project.Root AS Root,
    Client.Name AS ClientName
FROM Session
LEFT JOIN Project ON Project.ProjectId = Session.ProjectId
LEFT JOIN Client ON Client.ClientId = Project.ClientId
WHERE Session.SessionId = ?;`,Calls:`SELECT Call.CallId AS CallId,
    Call.Turn AS Turn,
    Call.Step AS Step,
    Call.Seq AS Seq,
    Call.At AS At,
    Call.Provider AS Provider,
    Call.Model AS Model,
    Call.Mode AS Mode,
    Call.Region AS Region,
    Call.Tier AS Tier,
    Call.PriceId IS NOT NULL AS Priced,
    Call.Currency AS Currency,
    Call.InputTokens AS InputTokens,
    Call.OutputTokens AS OutputTokens,
    Call.CacheReadTokens AS CacheReadTokens,
    Call.CacheWriteTokens AS CacheWriteTokens,
    Call.ReasoningTokens AS ReasoningTokens,
    Call.TotalTokens AS TotalTokens,
    Call.CostInput AS CostInput,
    Call.CostOutput AS CostOutput,
    Call.CostCacheRead AS CostCacheRead,
    Call.CostCacheWrite AS CostCacheWrite,
    Call.CostReasoning AS CostReasoning,
    Call.CostTotal AS CostTotal,
    Call.CacheSaving AS CacheSaving,
    Call.Attempts AS Attempts,
    Call.ErrorCode AS ErrorCode,
    Call.SurfaceTokens AS SurfaceTokens,
    Call.Purpose AS Purpose,
    Call.ContextWindow AS ContextWindow,
    Call.Utilization AS Utilization,
    Call.LatencyMs AS LatencyMs,
    Call.FirstTokenMs AS FirstTokenMs,
    Call.TokensPerSecond AS TokensPerSecond
FROM Call
WHERE Call.SessionId = ?
ORDER BY Call.Turn DESC, Call.Step DESC
LIMIT ?;`,Touches:`SELECT Touch.CallId AS CallId,
    Touch.FileId AS FileId,
    File.Path AS Path,
    Touch.Kind AS Kind,
    Touch.Stage AS Stage,
    Touch.Tool AS Tool,
    Touch.Branch AS Branch,
    Touch.ReadBeforeEdit AS ReadBeforeEdit,
    Touch.LinesDelta AS LinesDelta,
    Touch.BytesDelta AS BytesDelta,
    Touch.DurationMs AS DurationMs,
    Touch.Seq AS Seq,
    Touch.At AS At
FROM Touch
JOIN File ON File.FileId = Touch.FileId
WHERE Touch.SessionId = ?
ORDER BY Touch.CallId ASC, Touch.Seq ASC;`,Allocations:`SELECT Allocation.CallId AS CallId,
    Allocation.FileId AS FileId,
    File.Path AS Path,
    Allocation.DirectCost AS DirectCost,
    Allocation.AmortizedCost AS AmortizedCost
FROM Allocation
JOIN Call ON Call.CallId = Allocation.CallId
LEFT JOIN File ON File.FileId = Allocation.FileId
WHERE Call.SessionId = ?;`,Summary:`WITH CallRow AS (
    SELECT Call.CallId AS CallId, Call.Turn AS Turn, Call.PriceId AS PriceId,
        Call.InputTokens AS InputTokens, Call.OutputTokens AS OutputTokens,
        Call.CacheReadTokens AS CacheReadTokens, Call.CacheWriteTokens AS CacheWriteTokens,
        Call.ReasoningTokens AS ReasoningTokens, Call.TotalTokens AS TotalTokens,
        Call.CostInput AS CostInput, Call.CostOutput AS CostOutput,
        Call.CostCacheRead AS CostCacheRead, Call.CostCacheWrite AS CostCacheWrite,
        Call.CostReasoning AS CostReasoning, Call.CostTotal AS CostTotal,
        Call.CacheSaving AS CacheSaving, Call.Currency AS Currency
    FROM Call
    WHERE Call.SessionId = ?
),
CallMoney AS (
    SELECT Allocation.CallId AS CallId,
        SUM(Allocation.DirectCost) AS Direct,
        SUM(Allocation.AmortizedCost) AS Amortized
    FROM Allocation
    WHERE Allocation.CallId IN (SELECT CallId FROM CallRow)
    GROUP BY Allocation.CallId
)
SELECT
    (SELECT COUNT(*) FROM CallRow) AS Calls,
    (SELECT COUNT(*) FROM CallRow WHERE PriceId IS NOT NULL) AS Priced,
    (SELECT COUNT(*) FROM CallRow WHERE PriceId IS NULL) AS Unpriced,
    (SELECT COUNT(DISTINCT Turn) FROM CallRow) AS Turns,
    (SELECT COUNT(*) FROM CallRow) AS Steps,
    (SELECT SUM(InputTokens) FROM CallRow) AS InputTokens,
    (SELECT SUM(OutputTokens) FROM CallRow) AS OutputTokens,
    (SELECT SUM(CacheReadTokens) FROM CallRow) AS CacheReadTokens,
    (SELECT SUM(CacheWriteTokens) FROM CallRow) AS CacheWriteTokens,
    (SELECT SUM(ReasoningTokens) FROM CallRow) AS ReasoningTokens,
    (SELECT SUM(TotalTokens) FROM CallRow) AS ReportedTokens,
    (SELECT SUM(CostInput) FROM CallRow) AS CostInput,
    (SELECT SUM(CostOutput) FROM CallRow) AS CostOutput,
    (SELECT SUM(CostCacheRead) FROM CallRow) AS CostCacheRead,
    (SELECT SUM(CostCacheWrite) FROM CallRow) AS CostCacheWrite,
    (SELECT SUM(CostReasoning) FROM CallRow) AS CostReasoning,
    (SELECT SUM(CostTotal) FROM CallRow) AS CostTotal,
    (SELECT SUM(CacheSaving) FROM CallRow) AS Saving,
    (SELECT SUM(Direct) FROM CallMoney) AS Direct,
    (SELECT SUM(Amortized) FROM CallMoney) AS Amortized,
    (SELECT COUNT(DISTINCT Allocation.FileId) FROM Allocation
        WHERE Allocation.CallId IN (SELECT CallId FROM CallRow)) AS Files,
    (SELECT Listed.Currency FROM (
            SELECT Currency, SUM(CostTotal) AS Total FROM CallRow GROUP BY Currency
        ) AS Listed
        ORDER BY Listed.Total DESC, Listed.Currency ASC LIMIT 1) AS Currency,
    (SELECT json_group_array(Listed.Currency) FROM (
            SELECT DISTINCT Currency FROM CallRow ORDER BY Currency ASC
        ) AS Listed) AS Currencies;`,TopFiles:`SELECT File.Path AS Path,
    SUM(Allocation.DirectCost) AS Direct,
    SUM(Allocation.AmortizedCost) AS Amortized,
    COUNT(DISTINCT Allocation.CallId) AS Calls
FROM Allocation
JOIN Call ON Call.CallId = Allocation.CallId
JOIN File ON File.FileId = Allocation.FileId
WHERE Call.SessionId = ?
GROUP BY File.Path
ORDER BY SUM(Allocation.DirectCost + Allocation.AmortizedCost) DESC, File.Path ASC
LIMIT 5;`,Files:`WITH SessionCall AS (
    SELECT Call.CallId AS CallId, Call.Turn AS Turn
    FROM Call
    WHERE Call.SessionId = ?
),
Money AS (
    SELECT Allocation.FileId AS FileId,
        SUM(Allocation.DirectCost) AS Direct,
        SUM(Allocation.AmortizedCost) AS Amortized
    FROM Allocation
    JOIN SessionCall ON SessionCall.CallId = Allocation.CallId
    WHERE Allocation.FileId IS NOT NULL
    GROUP BY Allocation.FileId
),
TurnMoney AS (
    SELECT Allocation.FileId AS FileId,
        SUM(Allocation.DirectCost + Allocation.AmortizedCost) AS Turn
    FROM Allocation
    JOIN SessionCall ON SessionCall.CallId = Allocation.CallId
    WHERE Allocation.FileId IS NOT NULL
        AND SessionCall.Turn = (SELECT MAX(Turn) FROM SessionCall)
    GROUP BY Allocation.FileId
),
Lifetime AS (
    SELECT Allocation.FileId AS FileId,
        SUM(Allocation.DirectCost + Allocation.AmortizedCost) AS Lifetime
    FROM Allocation
    JOIN Call ON Call.CallId = Allocation.CallId
    WHERE Allocation.FileId IS NOT NULL
    GROUP BY Allocation.FileId
),
Tally AS (
    SELECT Touch.FileId AS FileId,
        COUNT(*) AS Touches,
        SUM(CASE WHEN Touch.Kind = 'read' THEN 1 ELSE 0 END) AS Reads,
        SUM(CASE WHEN Touch.Kind = 'write' THEN 1 ELSE 0 END) AS Writes,
        SUM(CASE WHEN Touch.Kind = 'edit' THEN 1 ELSE 0 END) AS Edits,
        SUM(CASE WHEN Touch.Kind = 'search' THEN 1 ELSE 0 END) AS Searches,
        MAX(Touch.ReadBeforeEdit) AS ReadBeforeEdit,
        GROUP_CONCAT(DISTINCT COALESCE(Touch.Stage, 'unclassified')) AS Stages,
        MIN(Touch.At) AS FirstAt,
        MAX(Touch.At) AS LastAt
    FROM Touch
    JOIN SessionCall ON SessionCall.CallId = Touch.CallId
    GROUP BY Touch.FileId
),
EditLine AS (
    SELECT Touch.FileId AS FileId,
        SUM(Edit.LinesAdded) AS Added,
        SUM(Edit.LinesRemoved) AS Removed,
        SUM(Edit.BytesAdded) AS BytesAdded,
        SUM(Edit.BytesRemoved) AS BytesRemoved
    FROM Edit
    JOIN Touch ON Touch.TouchId = Edit.TouchId
    JOIN SessionCall ON SessionCall.CallId = Touch.CallId
    GROUP BY Touch.FileId
),
VerdictRow AS (
    SELECT Verdict.FileId AS FileId, Verdict.State AS State
    FROM Verdict
    WHERE Verdict.SessionId = ?
),
Seed AS (
    SELECT FileId FROM Tally
    UNION
    SELECT FileId FROM Money
)
SELECT File.Path AS Path,
    COALESCE(Tally.Touches, 0) AS Touches,
    COALESCE(Tally.Reads, 0) AS Reads,
    COALESCE(Tally.Edits, 0) AS Edits,
    COALESCE(Tally.Writes, 0) AS Writes,
    COALESCE(Tally.Searches, 0) AS Searches,
    COALESCE(EditLine.Added, 0) AS Added,
    COALESCE(EditLine.Removed, 0) AS Removed,
    COALESCE(EditLine.BytesAdded, 0) AS BytesAdded,
    COALESCE(EditLine.BytesRemoved, 0) AS BytesRemoved,
    COALESCE(Money.Direct, 0) AS Direct,
    COALESCE(Money.Amortized, 0) AS Amortized,
    COALESCE(Money.Direct, 0) + COALESCE(Money.Amortized, 0) AS Total,
    Lifetime.Lifetime AS Lifetime,
    TurnMoney.Turn AS Turn,
    Tally.Stages AS Stages,
    VerdictRow.State AS Verdict,
    COALESCE(Tally.ReadBeforeEdit, 0) AS ReadBeforeEdit,
    Tally.FirstAt AS FirstAt,
    Tally.LastAt AS LastAt
FROM Seed
JOIN File ON File.FileId = Seed.FileId
LEFT JOIN Tally ON Tally.FileId = Seed.FileId
LEFT JOIN Money ON Money.FileId = Seed.FileId
LEFT JOIN TurnMoney ON TurnMoney.FileId = Seed.FileId
LEFT JOIN Lifetime ON Lifetime.FileId = Seed.FileId
LEFT JOIN EditLine ON EditLine.FileId = Seed.FileId
LEFT JOIN VerdictRow ON VerdictRow.FileId = Seed.FileId
ORDER BY (COALESCE(Money.Direct, 0) + COALESCE(Money.Amortized, 0)) DESC, File.Path ASC
LIMIT 500;`,Stages:`SELECT COALESCE(Touch.Stage, 'unclassified') AS Stage,
    COUNT(*) AS Touches,
    SUM(Call.TotalTokens) AS Tokens,
    SUM(COALESCE(Allocation.DirectCost, 0) + COALESCE(Allocation.AmortizedCost, 0)) AS Cost
FROM Touch
JOIN Call ON Call.CallId = Touch.CallId
LEFT JOIN Allocation ON Allocation.CallId = Touch.CallId AND Allocation.FileId = Touch.FileId
WHERE Call.SessionId = ?
GROUP BY Stage
ORDER BY Cost DESC, Stage ASC;`,Models:`WITH CallRow AS (
    SELECT Call.CallId AS CallId, Call.Provider AS Provider, Call.Model AS Model,
        Call.InputTokens AS InputTokens, Call.OutputTokens AS OutputTokens,
        Call.CacheReadTokens AS CacheReadTokens
    FROM Call
    WHERE Call.SessionId = ?
),
CallMoney AS (
    SELECT Allocation.CallId AS CallId,
        SUM(Allocation.DirectCost + Allocation.AmortizedCost) AS Cost
    FROM Allocation
    JOIN CallRow ON CallRow.CallId = Allocation.CallId
    GROUP BY Allocation.CallId
)
SELECT CallRow.Provider AS Provider,
    CallRow.Model AS Model,
    COUNT(*) AS Calls,
    SUM(CallRow.InputTokens) AS Input,
    SUM(CallRow.OutputTokens) AS Output,
    SUM(CallRow.CacheReadTokens) AS CacheRead,
    SUM(COALESCE(CallMoney.Cost, 0)) AS Total
FROM CallRow
LEFT JOIN CallMoney ON CallMoney.CallId = CallRow.CallId
GROUP BY CallRow.Provider, CallRow.Model
ORDER BY Total DESC, CallRow.Provider ASC, CallRow.Model ASC;`},ne=200,se=1,ie=2e3;function re(d,C,k){const H=Number.isFinite(k)?Math.floor(k):ne,O=Math.min(Math.max(H,se),ie),U={},a=(e,l)=>{const o=e[l];return typeof o=="string"?o:null},r=(e,l)=>{const o=e[l];return typeof o=="number"&&Number.isFinite(o)?o:null},t=(e,l)=>r(e,l)??0,p=(e,l)=>e[l]===1,J=(e,l,o)=>{const i=l+e+o;return i>0?Math.min(1,l/i):null},V=e=>{const l=t(e,"InputTokens"),o=t(e,"OutputTokens"),i=t(e,"CacheReadTokens"),S=t(e,"CacheWriteTokens");return{input:l,output:o,cacheRead:i,cacheWrite:S,reasoning:t(e,"ReasoningTokens"),total:l+i+S+o,reported:r(e,"TotalTokens")}},j=e=>{const l=t(e,"CostInput"),o=t(e,"CostOutput"),i=t(e,"CostCacheRead"),S=t(e,"CostTotal");return{input:l,output:o,cacheRead:i,cacheWrite:t(e,"CostCacheWrite"),reasoning:t(e,"CostReasoning"),total:S,other:Math.max(0,S-i-l-o)}},Y=e=>{if(typeof e!="string")return[];const l=JSON.parse(e);return Array.isArray(l)?l.filter(o=>typeof o=="string"):[]},T=e=>Math.round(e*1e6)/1e6,w=e=>typeof e!="string"?[]:e.split(",").filter(o=>o.length>0).sort(),A=d.prepare(u.Session).get(C);if(A===void 0)return{ok:!1,code:"session",message:`client-dsh-panel-cost: the session ${C} is not recorded in the ledger`,path:"",rows:O,truncated:!1,session:null,currency:"USD",currencies:[],summary:{calls:0,priced:0,unpriced:0,turns:0,steps:0,tokens:{input:0,output:0,cacheRead:0,cacheWrite:0,reasoning:0,total:0,reported:null},cost:{input:0,output:0,cacheRead:0,cacheWrite:0,reasoning:0,total:0,other:0},direct:0,amortized:0,saving:0,cacheHit:null,files:0,currency:"USD",currencies:[],topFiles:[]},calls:[],files:null,stages:null,models:null};const R=d.prepare(u.Project).get(C)??U,b={id:C,project:a(R,"Name"),root:a(R,"Root"),client:a(R,"ClientName"),title:a(A,"Title"),cwd:a(A,"Cwd"),origin:a(A,"Origin"),agentPreset:a(A,"AgentPreset"),parentSessionId:a(A,"ParentSessionId"),delegationDepth:r(A,"DelegationDepth"),createdAt:t(A,"CreatedAt"),endedAt:r(A,"EndedAt")},Q=d.prepare(u.Calls).all(C,O),G=d.prepare(u.Touches).all(C),x=d.prepare(u.Allocations).all(C),q=d.prepare(u.TopFiles).all(C),n=d.prepare(u.Summary).get(C)??U,K=d.prepare(u.Files).all(C,C),X=d.prepare(u.Stages).all(C),_=d.prepare(u.Models).all(C),h=new Map;for(const e of x){const l=t(e,"CallId"),o=h.get(l);o===void 0?h.set(l,[e]):o.push(e)}const F=new Map;for(const e of G){const l=t(e,"CallId"),o=F.get(l);o===void 0?F.set(l,[e]):o.push(e)}const M=Q.map(e=>{const l=t(e,"CallId"),o=t(e,"At"),i=h.get(l)??[],S=F.get(l)??[],I=new Map;for(const s of S){const c=t(s,"FileId");I.has(c)||I.set(c,{path:a(s,"Path")??"",kind:a(s,"Kind"),stage:a(s,"Stage"),tool:a(s,"Tool"),branch:a(s,"Branch"),readBeforeEdit:p(s,"ReadBeforeEdit"),direct:0,amortized:0,total:0,linesDelta:r(s,"LinesDelta"),bytesDelta:r(s,"BytesDelta"),durationMs:r(s,"DurationMs"),touched:!0,at:t(s,"At")})}for(const s of i){const c=a(s,"Path");if(c===null)continue;const v=t(s,"FileId"),N=t(s,"DirectCost"),f=t(s,"AmortizedCost"),E=I.get(v);if(E===void 0){I.set(v,{path:c,kind:null,stage:null,tool:null,branch:null,readBeforeEdit:!1,direct:N,amortized:f,total:N+f,linesDelta:null,bytesDelta:null,durationMs:null,touched:!1,at:o});continue}E.direct+=N,E.amortized+=f,E.total=E.direct+E.amortized}const le=[...I.values()].sort((s,c)=>c.total-s.total||(s.path<c.path?-1:1)),oe=i.reduce((s,c)=>s+t(c,"DirectCost"),0),ae=i.reduce((s,c)=>s+t(c,"AmortizedCost"),0);return{turn:t(e,"Turn"),step:t(e,"Step"),seq:t(e,"Seq"),at:o,provider:a(e,"Provider")??"",model:a(e,"Model")??"",mode:a(e,"Mode")??"standard",region:a(e,"Region"),tier:r(e,"Tier"),priced:p(e,"Priced"),currency:a(e,"Currency")??"USD",tokens:V(e),cost:j(e),saving:t(e,"CacheSaving"),attempts:t(e,"Attempts"),error:a(e,"ErrorCode"),surfaceTokens:t(e,"SurfaceTokens"),purpose:a(e,"Purpose"),contextWindow:r(e,"ContextWindow"),utilization:r(e,"Utilization"),latencyMs:r(e,"LatencyMs"),firstTokenMs:r(e,"FirstTokenMs"),tokensPerSecond:r(e,"TokensPerSecond"),direct:oe,amortized:ae,allocations:i.length,files:le}});M.sort((e,l)=>e.turn-l.turn||e.step-l.step);const m=t(n,"InputTokens"),D=t(n,"OutputTokens"),L=t(n,"CacheReadTokens"),y=t(n,"CacheWriteTokens"),P=t(n,"CostInput"),W=t(n,"CostOutput"),B=t(n,"CostCacheRead"),z=t(n,"CostTotal"),$=q.map(e=>{const l=t(e,"Direct"),o=t(e,"Amortized");return{path:a(e,"Path")??"",direct:l,amortized:o,total:l+o,calls:t(e,"Calls")}}),Z=K.map(e=>{const l=T(t(e,"Direct")),o=T(t(e,"Amortized")),i=T(l+o),S=r(e,"Lifetime");return{path:a(e,"Path")??"",touches:t(e,"Touches"),reads:t(e,"Reads"),edits:t(e,"Edits"),writes:t(e,"Writes"),searches:t(e,"Searches"),added:t(e,"Added"),removed:t(e,"Removed"),bytesAdded:t(e,"BytesAdded"),bytesRemoved:t(e,"BytesRemoved"),direct:l,amortized:o,total:i,lifetime:S,before:S===null?null:T(S-i),turn:r(e,"Turn"),stages:w(e.Stages),verdict:a(e,"Verdict"),readBeforeEdit:p(e,"ReadBeforeEdit"),firstAt:r(e,"FirstAt"),lastAt:r(e,"LastAt")}}),ee=X.map(e=>({stage:a(e,"Stage")??"unclassified",touches:t(e,"Touches"),tokens:t(e,"Tokens"),cost:T(t(e,"Cost"))})),te=_.map(e=>{const l=t(e,"Input"),o=t(e,"Output"),i=t(e,"CacheRead");return{provider:a(e,"Provider")??"",model:a(e,"Model")??"",calls:t(e,"Calls"),tokens:l+o+i,input:l,output:o,cacheRead:i,total:T(t(e,"Total"))}}),g={calls:t(n,"Calls"),priced:t(n,"Priced"),unpriced:t(n,"Unpriced"),turns:t(n,"Turns"),steps:t(n,"Steps"),tokens:{input:m,output:D,cacheRead:L,cacheWrite:y,reasoning:t(n,"ReasoningTokens"),total:m+L+y+D,reported:r(n,"ReportedTokens")},cost:{input:P,output:W,cacheRead:B,cacheWrite:t(n,"CostCacheWrite"),reasoning:t(n,"CostReasoning"),total:z,other:Math.max(0,z-B-P-W)},direct:t(n,"Direct"),amortized:t(n,"Amortized"),saving:t(n,"Saving"),cacheHit:J(m,L,y),files:t(n,"Files"),currency:a(n,"Currency")??"USD",currencies:Y(n.Currencies),topFiles:$};return{ok:!0,code:"ok",message:null,path:"",rows:O,truncated:M.length===O,session:b,currency:g.currency,currencies:g.currencies,summary:g,calls:M,files:Z,stages:ee,models:te}}export{re as default};
