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
    (SELECT SUM(InputTokens) FROM CallRow WHERE PriceId IS NULL) AS UnpricedInput,
    (SELECT SUM(OutputTokens) FROM CallRow WHERE PriceId IS NULL) AS UnpricedOutput,
    (SELECT SUM(CacheReadTokens) FROM CallRow WHERE PriceId IS NULL) AS UnpricedCacheRead,
    (SELECT SUM(CacheWriteTokens) FROM CallRow WHERE PriceId IS NULL) AS UnpricedCacheWrite,
    (SELECT SUM(ReasoningTokens) FROM CallRow WHERE PriceId IS NULL) AS UnpricedReasoning,
    (SELECT SUM(TotalTokens) FROM CallRow WHERE PriceId IS NULL) AS UnpricedReported,
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
ORDER BY Total DESC, CallRow.Provider ASC, CallRow.Model ASC;`},ce=200,de=1,Se=2e3;function ue(S,C,k){const j=Number.isFinite(k)?Math.floor(k):ce,R=Math.min(Math.max(j,de),Se),f={},a=(e,o)=>{const l=e[o];return typeof l=="string"?l:null},i=(e,o)=>{const l=e[o];return typeof l=="number"&&Number.isFinite(l)?l:null},t=(e,o)=>i(e,o)??0,O=(e,o)=>e[o]===1,Y=(e,o,l)=>{const r=o+e+l;return r>0?Math.min(1,o/r):null},b=e=>{const o=t(e,"InputTokens"),l=t(e,"OutputTokens"),r=t(e,"CacheReadTokens"),d=t(e,"CacheWriteTokens");return{input:o,output:l,cacheRead:r,cacheWrite:d,reasoning:t(e,"ReasoningTokens"),total:o+r+d+l,reported:i(e,"TotalTokens")}},Q=e=>{const o=t(e,"CostInput"),l=t(e,"CostOutput"),r=t(e,"CostCacheRead"),d=t(e,"CostTotal");return{input:o,output:l,cacheRead:r,cacheWrite:t(e,"CostCacheWrite"),reasoning:t(e,"CostReasoning"),total:d,other:Math.max(0,d-r-o-l)}},G=e=>{if(typeof e!="string")return[];const o=JSON.parse(e);return Array.isArray(o)?o.filter(l=>typeof l=="string"):[]},T=e=>Math.round(e*1e6)/1e6,x=e=>typeof e!="string"?[]:e.split(",").filter(l=>l.length>0).sort(),A=S.prepare(u.Session).get(C);if(A===void 0)return{ok:!1,code:"session",message:`client-dsh-panel-cost: the session ${C} is not recorded in the ledger`,path:"",rows:R,truncated:!1,session:null,currency:"USD",currencies:[],summary:{calls:0,priced:0,unpriced:0,turns:0,steps:0,tokens:{input:0,output:0,cacheRead:0,cacheWrite:0,reasoning:0,total:0,reported:null},cost:{input:0,output:0,cacheRead:0,cacheWrite:0,reasoning:0,total:0,other:0},direct:0,amortized:0,saving:0,cacheHit:null,files:0,currency:"USD",currencies:[],topFiles:[]},coverage:{calls:0,priced:0,unpriced:0,unpricedTokens:{input:0,output:0,cacheRead:0,cacheWrite:0,reasoning:0,total:0,reported:null}},calls:[],files:null,stages:null,models:null};const h=S.prepare(u.Project).get(C)??f,q={id:C,project:a(h,"Name"),root:a(h,"Root"),client:a(h,"ClientName"),title:a(A,"Title"),cwd:a(A,"Cwd"),origin:a(A,"Origin"),agentPreset:a(A,"AgentPreset"),parentSessionId:a(A,"ParentSessionId"),delegationDepth:i(A,"DelegationDepth"),createdAt:t(A,"CreatedAt"),endedAt:i(A,"EndedAt")},K=S.prepare(u.Calls).all(C,R),X=S.prepare(u.Touches).all(C),_=S.prepare(u.Allocations).all(C),$=S.prepare(u.TopFiles).all(C),n=S.prepare(u.Summary).get(C)??f,Z=S.prepare(u.Files).all(C,C),ee=S.prepare(u.Stages).all(C),te=S.prepare(u.Models).all(C),M=new Map;for(const e of _){const o=t(e,"CallId"),l=M.get(o);l===void 0?M.set(o,[e]):l.push(e)}const F=new Map;for(const e of X){const o=t(e,"CallId"),l=F.get(o);l===void 0?F.set(o,[e]):l.push(e)}const L=K.map(e=>{const o=t(e,"CallId"),l=t(e,"At"),r=M.get(o)??[],d=F.get(o)??[],I=new Map;for(const s of d){const c=t(s,"FileId");I.has(c)||I.set(c,{path:a(s,"Path")??"",kind:a(s,"Kind"),stage:a(s,"Stage"),tool:a(s,"Tool"),branch:a(s,"Branch"),readBeforeEdit:O(s,"ReadBeforeEdit"),direct:0,amortized:0,total:0,linesDelta:i(s,"LinesDelta"),bytesDelta:i(s,"BytesDelta"),durationMs:i(s,"DurationMs"),touched:!0,at:t(s,"At")})}for(const s of r){const c=a(s,"Path");if(c===null)continue;const w=t(s,"FileId"),N=t(s,"DirectCost"),U=t(s,"AmortizedCost"),p=I.get(w);if(p===void 0){I.set(w,{path:c,kind:null,stage:null,tool:null,branch:null,readBeforeEdit:!1,direct:N,amortized:U,total:N+U,linesDelta:null,bytesDelta:null,durationMs:null,touched:!1,at:l});continue}p.direct+=N,p.amortized+=U,p.total=p.direct+p.amortized}const ie=[...I.values()].sort((s,c)=>c.total-s.total||(s.path<c.path?-1:1)),re=r.reduce((s,c)=>s+t(c,"DirectCost"),0),Ce=r.reduce((s,c)=>s+t(c,"AmortizedCost"),0);return{turn:t(e,"Turn"),step:t(e,"Step"),seq:t(e,"Seq"),at:l,provider:a(e,"Provider")??"",model:a(e,"Model")??"",mode:a(e,"Mode")??"standard",region:a(e,"Region"),tier:i(e,"Tier"),priced:O(e,"Priced"),currency:a(e,"Currency")??"USD",tokens:b(e),cost:Q(e),saving:t(e,"CacheSaving"),attempts:t(e,"Attempts"),error:a(e,"ErrorCode"),surfaceTokens:t(e,"SurfaceTokens"),purpose:a(e,"Purpose"),contextWindow:i(e,"ContextWindow"),utilization:i(e,"Utilization"),latencyMs:i(e,"LatencyMs"),firstTokenMs:i(e,"FirstTokenMs"),tokensPerSecond:i(e,"TokensPerSecond"),direct:re,amortized:Ce,allocations:r.length,files:ie}});L.sort((e,o)=>e.turn-o.turn||e.step-o.step);const m=t(n,"InputTokens"),P=t(n,"OutputTokens"),g=t(n,"CacheReadTokens"),y=t(n,"CacheWriteTokens"),D=t(n,"CostInput"),W=t(n,"CostOutput"),B=t(n,"CostCacheRead"),v=t(n,"CostTotal"),oe=$.map(e=>{const o=t(e,"Direct"),l=t(e,"Amortized");return{path:a(e,"Path")??"",direct:o,amortized:l,total:o+l,calls:t(e,"Calls")}}),le=Z.map(e=>{const o=T(t(e,"Direct")),l=T(t(e,"Amortized")),r=T(o+l),d=i(e,"Lifetime");return{path:a(e,"Path")??"",touches:t(e,"Touches"),reads:t(e,"Reads"),edits:t(e,"Edits"),writes:t(e,"Writes"),searches:t(e,"Searches"),added:t(e,"Added"),removed:t(e,"Removed"),bytesAdded:t(e,"BytesAdded"),bytesRemoved:t(e,"BytesRemoved"),direct:o,amortized:l,total:r,lifetime:d,before:d===null?null:T(d-r),turn:i(e,"Turn"),stages:x(e.Stages),verdict:a(e,"Verdict"),readBeforeEdit:O(e,"ReadBeforeEdit"),firstAt:i(e,"FirstAt"),lastAt:i(e,"LastAt")}}),ne=ee.map(e=>({stage:a(e,"Stage")??"unclassified",touches:t(e,"Touches"),tokens:t(e,"Tokens"),cost:T(t(e,"Cost"))})),ae=te.map(e=>{const o=t(e,"Input"),l=t(e,"Output"),r=t(e,"CacheRead");return{provider:a(e,"Provider")??"",model:a(e,"Model")??"",calls:t(e,"Calls"),tokens:o+l+r,input:o,output:l,cacheRead:r,total:T(t(e,"Total"))}}),E={calls:t(n,"Calls"),priced:t(n,"Priced"),unpriced:t(n,"Unpriced"),turns:t(n,"Turns"),steps:t(n,"Steps"),tokens:{input:m,output:P,cacheRead:g,cacheWrite:y,reasoning:t(n,"ReasoningTokens"),total:m+g+y+P,reported:i(n,"ReportedTokens")},cost:{input:D,output:W,cacheRead:B,cacheWrite:t(n,"CostCacheWrite"),reasoning:t(n,"CostReasoning"),total:v,other:Math.max(0,v-B-D-W)},direct:t(n,"Direct"),amortized:t(n,"Amortized"),saving:t(n,"Saving"),cacheHit:Y(m,g,y),files:t(n,"Files"),currency:a(n,"Currency")??"USD",currencies:G(n.Currencies),topFiles:oe},z=t(n,"UnpricedInput"),H=t(n,"UnpricedOutput"),J=t(n,"UnpricedCacheRead"),V=t(n,"UnpricedCacheWrite"),se={calls:E.calls,priced:E.priced,unpriced:E.unpriced,unpricedTokens:{input:z,output:H,cacheRead:J,cacheWrite:V,reasoning:t(n,"UnpricedReasoning"),total:z+J+V+H,reported:i(n,"UnpricedReported")}};return{ok:!0,code:"ok",message:null,path:"",rows:R,truncated:L.length===R,session:q,currency:E.currency,currencies:E.currencies,summary:E,coverage:se,calls:L,files:le,stages:ne,models:ae}}export{ue as default};
