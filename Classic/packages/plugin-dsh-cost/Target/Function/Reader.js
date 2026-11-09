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
ORDER BY Total DESC, CallRow.Provider ASC, CallRow.Model ASC;`,Policy:`SELECT COALESCE(
    (SELECT Valuation.PolicyVersion FROM Valuation ORDER BY Valuation.ValuationId DESC LIMIT 1),
    (SELECT Allocation.Method FROM Allocation ORDER BY Allocation.AllocationId DESC LIMIT 1),
    'bytes/context') AS PolicyVersion;`},Te=200,Ee=1,pe=2e3;function Ie(d,c,P,T,D){const Q=Number.isFinite(P)?Math.floor(P):Te,O=Math.min(Math.max(Q,Ee),pe),h={},n=(e,o)=>{const l=e[o];return typeof l=="string"?l:null},s=(e,o)=>{const l=e[o];return typeof l=="number"&&Number.isFinite(l)?l:null},t=(e,o)=>s(e,o)??0,M=(e,o)=>e[o]===1,G=(e,o,l)=>{const r=o+e+l;return r>0?Math.min(1,o/r):null},q=e=>{const o=t(e,"InputTokens"),l=t(e,"OutputTokens"),r=t(e,"CacheReadTokens"),S=t(e,"CacheWriteTokens");return{input:o,output:l,cacheRead:r,cacheWrite:S,reasoning:t(e,"ReasoningTokens"),total:o+r+S+l,reported:s(e,"TotalTokens")}},K=e=>{const o=t(e,"CostInput"),l=t(e,"CostOutput"),r=t(e,"CostCacheRead"),S=t(e,"CostTotal");return{input:o,output:l,cacheRead:r,cacheWrite:t(e,"CostCacheWrite"),reasoning:t(e,"CostReasoning"),total:S,other:Math.max(0,S-r-o-l)}},X=e=>{if(typeof e!="string")return[];const o=JSON.parse(e);return Array.isArray(o)?o.filter(l=>typeof l=="string"):[]},E=e=>Math.round(e*1e6)/1e6,_=e=>typeof e!="string"?[]:e.split(",").filter(l=>l.length>0).sort(),$=()=>{switch(!0){case T===void 0:return;case T.basis==="as-recorded":return;case T.revisionId===void 0:return;case D===void 0:throw new Error(`plugin-dsh-cost: the valuation basis "${T.basis}" needs the pricing service, which this context did not provide - the ledger write handle was absent`);default:{const e=D.preview(T.revisionId,c),o=d.prepare(u.Policy).get()??h;return{basis:T.basis,revisionId:T.revisionId,policyVersion:n(o,"PolicyVersion")??"bytes/context",calculatedAt:Date.now(),recorded:e.current,revised:e.revised,difference:e.difference}}}},A=d.prepare(u.Session).get(c);if(A===void 0)return{ok:!1,code:"session",message:`client-dsh-panel-cost: the session ${c} is not recorded in the ledger`,path:"",rows:O,truncated:!1,session:null,currency:"USD",currencies:[],summary:{calls:0,priced:0,unpriced:0,turns:0,steps:0,tokens:{input:0,output:0,cacheRead:0,cacheWrite:0,reasoning:0,total:0,reported:null},cost:{input:0,output:0,cacheRead:0,cacheWrite:0,reasoning:0,total:0,other:0},direct:0,amortized:0,saving:0,cacheHit:null,files:0,currency:"USD",currencies:[],topFiles:[]},coverage:{calls:0,priced:0,unpriced:0,unpricedTokens:{input:0,output:0,cacheRead:0,cacheWrite:0,reasoning:0,total:0,reported:null}},calls:[],files:null,stages:null,models:null};const L=d.prepare(u.Project).get(c)??h,Z={id:c,project:n(L,"Name"),root:n(L,"Root"),client:n(L,"ClientName"),title:n(A,"Title"),cwd:n(A,"Cwd"),origin:n(A,"Origin"),agentPreset:n(A,"AgentPreset"),parentSessionId:n(A,"ParentSessionId"),delegationDepth:s(A,"DelegationDepth"),createdAt:t(A,"CreatedAt"),endedAt:s(A,"EndedAt")},ee=d.prepare(u.Calls).all(c,O),te=d.prepare(u.Touches).all(c),oe=d.prepare(u.Allocations).all(c),le=d.prepare(u.TopFiles).all(c),a=d.prepare(u.Summary).get(c)??h,ne=d.prepare(u.Files).all(c,c),ae=d.prepare(u.Stages).all(c),ie=d.prepare(u.Models).all(c),F=new Map;for(const e of oe){const o=t(e,"CallId"),l=F.get(o);l===void 0?F.set(o,[e]):l.push(e)}const m=new Map;for(const e of te){const o=t(e,"CallId"),l=m.get(o);l===void 0?m.set(o,[e]):l.push(e)}const y=ee.map(e=>{const o=t(e,"CallId"),l=t(e,"At"),r=F.get(o)??[],S=m.get(o)??[],R=new Map;for(const i of S){const C=t(i,"FileId");R.has(C)||R.set(C,{path:n(i,"Path")??"",kind:n(i,"Kind"),stage:n(i,"Stage"),tool:n(i,"Tool"),branch:n(i,"Branch"),readBeforeEdit:M(i,"ReadBeforeEdit"),direct:0,amortized:0,total:0,linesDelta:s(i,"LinesDelta"),bytesDelta:s(i,"BytesDelta"),durationMs:s(i,"DurationMs"),touched:!0,at:t(i,"At")})}for(const i of r){const C=n(i,"Path");if(C===null)continue;const x=t(i,"FileId"),U=t(i,"DirectCost"),k=t(i,"AmortizedCost"),I=R.get(x);if(I===void 0){R.set(x,{path:C,kind:null,stage:null,tool:null,branch:null,readBeforeEdit:!1,direct:U,amortized:k,total:U+k,linesDelta:null,bytesDelta:null,durationMs:null,touched:!1,at:l});continue}I.direct+=U,I.amortized+=k,I.total=I.direct+I.amortized}const Se=[...R.values()].sort((i,C)=>C.total-i.total||(i.path<C.path?-1:1)),ue=r.reduce((i,C)=>i+t(C,"DirectCost"),0),Ae=r.reduce((i,C)=>i+t(C,"AmortizedCost"),0);return{turn:t(e,"Turn"),step:t(e,"Step"),seq:t(e,"Seq"),at:l,provider:n(e,"Provider")??"",model:n(e,"Model")??"",mode:n(e,"Mode")??"standard",region:n(e,"Region"),tier:s(e,"Tier"),priced:M(e,"Priced"),currency:n(e,"Currency")??"USD",tokens:q(e),cost:K(e),saving:t(e,"CacheSaving"),attempts:t(e,"Attempts"),error:n(e,"ErrorCode"),surfaceTokens:t(e,"SurfaceTokens"),purpose:n(e,"Purpose"),contextWindow:s(e,"ContextWindow"),utilization:s(e,"Utilization"),latencyMs:s(e,"LatencyMs"),firstTokenMs:s(e,"FirstTokenMs"),tokensPerSecond:s(e,"TokensPerSecond"),direct:ue,amortized:Ae,allocations:r.length,files:Se}});y.sort((e,o)=>e.turn-o.turn||e.step-o.step);const g=t(a,"InputTokens"),W=t(a,"OutputTokens"),f=t(a,"CacheReadTokens"),N=t(a,"CacheWriteTokens"),v=t(a,"CostInput"),B=t(a,"CostOutput"),z=t(a,"CostCacheRead"),H=t(a,"CostTotal"),se=le.map(e=>{const o=t(e,"Direct"),l=t(e,"Amortized");return{path:n(e,"Path")??"",direct:o,amortized:l,total:o+l,calls:t(e,"Calls")}}),re=ne.map(e=>{const o=E(t(e,"Direct")),l=E(t(e,"Amortized")),r=E(o+l),S=s(e,"Lifetime");return{path:n(e,"Path")??"",touches:t(e,"Touches"),reads:t(e,"Reads"),edits:t(e,"Edits"),writes:t(e,"Writes"),searches:t(e,"Searches"),added:t(e,"Added"),removed:t(e,"Removed"),bytesAdded:t(e,"BytesAdded"),bytesRemoved:t(e,"BytesRemoved"),direct:o,amortized:l,total:r,lifetime:S,before:S===null?null:E(S-r),turn:s(e,"Turn"),stages:_(e.Stages),verdict:n(e,"Verdict"),readBeforeEdit:M(e,"ReadBeforeEdit"),firstAt:s(e,"FirstAt"),lastAt:s(e,"LastAt")}}),ce=ae.map(e=>({stage:n(e,"Stage")??"unclassified",touches:t(e,"Touches"),tokens:t(e,"Tokens"),cost:E(t(e,"Cost"))})),Ce=ie.map(e=>{const o=t(e,"Input"),l=t(e,"Output"),r=t(e,"CacheRead");return{provider:n(e,"Provider")??"",model:n(e,"Model")??"",calls:t(e,"Calls"),tokens:o+l+r,input:o,output:l,cacheRead:r,total:E(t(e,"Total"))}}),p={calls:t(a,"Calls"),priced:t(a,"Priced"),unpriced:t(a,"Unpriced"),turns:t(a,"Turns"),steps:t(a,"Steps"),tokens:{input:g,output:W,cacheRead:f,cacheWrite:N,reasoning:t(a,"ReasoningTokens"),total:g+f+N+W,reported:s(a,"ReportedTokens")},cost:{input:v,output:B,cacheRead:z,cacheWrite:t(a,"CostCacheWrite"),reasoning:t(a,"CostReasoning"),total:H,other:Math.max(0,H-z-v-B)},direct:t(a,"Direct"),amortized:t(a,"Amortized"),saving:t(a,"Saving"),cacheHit:G(g,f,N),files:t(a,"Files"),currency:n(a,"Currency")??"USD",currencies:X(a.Currencies),topFiles:se},V=t(a,"UnpricedInput"),w=t(a,"UnpricedOutput"),j=t(a,"UnpricedCacheRead"),J=t(a,"UnpricedCacheWrite"),de={calls:p.calls,priced:p.priced,unpriced:p.unpriced,unpricedTokens:{input:V,output:w,cacheRead:j,cacheWrite:J,reasoning:t(a,"UnpricedReasoning"),total:V+j+J+w,reported:s(a,"UnpricedReported")}},b={ok:!0,code:"ok",message:null,path:"",rows:O,truncated:y.length===O,session:Z,currency:p.currency,currencies:p.currencies,summary:p,coverage:de,calls:y,files:re,stages:ce,models:Ce},Y=$();return Y===void 0?b:{...b,valuation:Y}}export{Ie as default};
