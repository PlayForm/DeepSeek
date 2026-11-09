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
    'bytes/context') AS PolicyVersion;`},Te=200,Ee=1,pe=2e3;function Ie(d,c,k,P,D){const Q=Number.isFinite(k)?Math.floor(k):Te,R=Math.min(Math.max(Q,Ee),pe),O={},n=(e,o)=>{const l=e[o];return typeof l=="string"?l:null},r=(e,o)=>{const l=e[o];return typeof l=="number"&&Number.isFinite(l)?l:null},t=(e,o)=>r(e,o)??0,h=(e,o)=>e[o]===1,G=(e,o,l)=>{const s=o+e+l;return s>0?Math.min(1,o/s):null},q=e=>{const o=t(e,"InputTokens"),l=t(e,"OutputTokens"),s=t(e,"CacheReadTokens"),S=t(e,"CacheWriteTokens");return{input:o,output:l,cacheRead:s,cacheWrite:S,reasoning:t(e,"ReasoningTokens"),total:o+s+S+l,reported:r(e,"TotalTokens")}},K=e=>{const o=t(e,"CostInput"),l=t(e,"CostOutput"),s=t(e,"CostCacheRead"),S=t(e,"CostTotal");return{input:o,output:l,cacheRead:s,cacheWrite:t(e,"CostCacheWrite"),reasoning:t(e,"CostReasoning"),total:S,other:Math.max(0,S-s-o-l)}},X=e=>{if(typeof e!="string")return[];const o=JSON.parse(e);return Array.isArray(o)?o.filter(l=>typeof l=="string"):[]},T=e=>Math.round(e*1e6)/1e6,_=e=>typeof e!="string"?[]:e.split(",").filter(l=>l.length>0).sort(),$=()=>{const e=P?.basis??"as-recorded",o=P?.revisionId;switch(!0){case e==="as-recorded":return;case o===void 0:return;case D===void 0:throw new Error(`plugin-dsh-cost: the valuation basis "${e}" needs the pricing service, which this context did not provide - the ledger write handle was absent`);default:{const l=D.preview(o,c),s=d.prepare(u.Policy).get()??O;return{basis:e,revisionId:o,policyVersion:n(s,"PolicyVersion")??"bytes/context",calculatedAt:Date.now(),recorded:l.current,revised:l.revised,difference:l.difference,unpriced:l.unpriced}}}},A=d.prepare(u.Session).get(c);if(A===void 0)return{ok:!1,code:"session",message:`client-dsh-panel-cost: the session ${c} is not recorded in the ledger`,path:"",rows:R,truncated:!1,session:null,currency:"USD",currencies:[],summary:{calls:0,priced:0,unpriced:0,turns:0,steps:0,tokens:{input:0,output:0,cacheRead:0,cacheWrite:0,reasoning:0,total:0,reported:null},cost:{input:0,output:0,cacheRead:0,cacheWrite:0,reasoning:0,total:0,other:0},direct:0,amortized:0,saving:0,cacheHit:null,files:0,currency:"USD",currencies:[],topFiles:[]},coverage:{calls:0,priced:0,unpriced:0,unpricedTokens:{input:0,output:0,cacheRead:0,cacheWrite:0,reasoning:0,total:0,reported:null}},calls:[],files:null,stages:null,models:null};const M=d.prepare(u.Project).get(c)??O,Z={id:c,project:n(M,"Name"),root:n(M,"Root"),client:n(M,"ClientName"),title:n(A,"Title"),cwd:n(A,"Cwd"),origin:n(A,"Origin"),agentPreset:n(A,"AgentPreset"),parentSessionId:n(A,"ParentSessionId"),delegationDepth:r(A,"DelegationDepth"),createdAt:t(A,"CreatedAt"),endedAt:r(A,"EndedAt")},ee=d.prepare(u.Calls).all(c,R),te=d.prepare(u.Touches).all(c),oe=d.prepare(u.Allocations).all(c),le=d.prepare(u.TopFiles).all(c),a=d.prepare(u.Summary).get(c)??O,ne=d.prepare(u.Files).all(c,c),ae=d.prepare(u.Stages).all(c),ie=d.prepare(u.Models).all(c),L=new Map;for(const e of oe){const o=t(e,"CallId"),l=L.get(o);l===void 0?L.set(o,[e]):l.push(e)}const F=new Map;for(const e of te){const o=t(e,"CallId"),l=F.get(o);l===void 0?F.set(o,[e]):l.push(e)}const m=ee.map(e=>{const o=t(e,"CallId"),l=t(e,"At"),s=L.get(o)??[],S=F.get(o)??[],I=new Map;for(const i of S){const C=t(i,"FileId");I.has(C)||I.set(C,{path:n(i,"Path")??"",kind:n(i,"Kind"),stage:n(i,"Stage"),tool:n(i,"Tool"),branch:n(i,"Branch"),readBeforeEdit:h(i,"ReadBeforeEdit"),direct:0,amortized:0,total:0,linesDelta:r(i,"LinesDelta"),bytesDelta:r(i,"BytesDelta"),durationMs:r(i,"DurationMs"),touched:!0,at:t(i,"At")})}for(const i of s){const C=n(i,"Path");if(C===null)continue;const x=t(i,"FileId"),N=t(i,"DirectCost"),U=t(i,"AmortizedCost"),p=I.get(x);if(p===void 0){I.set(x,{path:C,kind:null,stage:null,tool:null,branch:null,readBeforeEdit:!1,direct:N,amortized:U,total:N+U,linesDelta:null,bytesDelta:null,durationMs:null,touched:!1,at:l});continue}p.direct+=N,p.amortized+=U,p.total=p.direct+p.amortized}const Se=[...I.values()].sort((i,C)=>C.total-i.total||(i.path<C.path?-1:1)),ue=s.reduce((i,C)=>i+t(C,"DirectCost"),0),Ae=s.reduce((i,C)=>i+t(C,"AmortizedCost"),0);return{turn:t(e,"Turn"),step:t(e,"Step"),seq:t(e,"Seq"),at:l,provider:n(e,"Provider")??"",model:n(e,"Model")??"",mode:n(e,"Mode")??"standard",region:n(e,"Region"),tier:r(e,"Tier"),priced:h(e,"Priced"),currency:n(e,"Currency")??"USD",tokens:q(e),cost:K(e),saving:t(e,"CacheSaving"),attempts:t(e,"Attempts"),error:n(e,"ErrorCode"),surfaceTokens:t(e,"SurfaceTokens"),purpose:n(e,"Purpose"),contextWindow:r(e,"ContextWindow"),utilization:r(e,"Utilization"),latencyMs:r(e,"LatencyMs"),firstTokenMs:r(e,"FirstTokenMs"),tokensPerSecond:r(e,"TokensPerSecond"),direct:ue,amortized:Ae,allocations:s.length,files:Se}});m.sort((e,o)=>e.turn-o.turn||e.step-o.step);const y=t(a,"InputTokens"),W=t(a,"OutputTokens"),g=t(a,"CacheReadTokens"),f=t(a,"CacheWriteTokens"),v=t(a,"CostInput"),B=t(a,"CostOutput"),z=t(a,"CostCacheRead"),H=t(a,"CostTotal"),se=le.map(e=>{const o=t(e,"Direct"),l=t(e,"Amortized");return{path:n(e,"Path")??"",direct:o,amortized:l,total:o+l,calls:t(e,"Calls")}}),re=ne.map(e=>{const o=T(t(e,"Direct")),l=T(t(e,"Amortized")),s=T(o+l),S=r(e,"Lifetime");return{path:n(e,"Path")??"",touches:t(e,"Touches"),reads:t(e,"Reads"),edits:t(e,"Edits"),writes:t(e,"Writes"),searches:t(e,"Searches"),added:t(e,"Added"),removed:t(e,"Removed"),bytesAdded:t(e,"BytesAdded"),bytesRemoved:t(e,"BytesRemoved"),direct:o,amortized:l,total:s,lifetime:S,before:S===null?null:T(S-s),turn:r(e,"Turn"),stages:_(e.Stages),verdict:n(e,"Verdict"),readBeforeEdit:h(e,"ReadBeforeEdit"),firstAt:r(e,"FirstAt"),lastAt:r(e,"LastAt")}}),ce=ae.map(e=>({stage:n(e,"Stage")??"unclassified",touches:t(e,"Touches"),tokens:t(e,"Tokens"),cost:T(t(e,"Cost"))})),Ce=ie.map(e=>{const o=t(e,"Input"),l=t(e,"Output"),s=t(e,"CacheRead");return{provider:n(e,"Provider")??"",model:n(e,"Model")??"",calls:t(e,"Calls"),tokens:o+l+s,input:o,output:l,cacheRead:s,total:T(t(e,"Total"))}}),E={calls:t(a,"Calls"),priced:t(a,"Priced"),unpriced:t(a,"Unpriced"),turns:t(a,"Turns"),steps:t(a,"Steps"),tokens:{input:y,output:W,cacheRead:g,cacheWrite:f,reasoning:t(a,"ReasoningTokens"),total:y+g+f+W,reported:r(a,"ReportedTokens")},cost:{input:v,output:B,cacheRead:z,cacheWrite:t(a,"CostCacheWrite"),reasoning:t(a,"CostReasoning"),total:H,other:Math.max(0,H-z-v-B)},direct:t(a,"Direct"),amortized:t(a,"Amortized"),saving:t(a,"Saving"),cacheHit:G(y,g,f),files:t(a,"Files"),currency:n(a,"Currency")??"USD",currencies:X(a.Currencies),topFiles:se},V=t(a,"UnpricedInput"),w=t(a,"UnpricedOutput"),j=t(a,"UnpricedCacheRead"),J=t(a,"UnpricedCacheWrite"),de={calls:E.calls,priced:E.priced,unpriced:E.unpriced,unpricedTokens:{input:V,output:w,cacheRead:j,cacheWrite:J,reasoning:t(a,"UnpricedReasoning"),total:V+j+J+w,reported:r(a,"UnpricedReported")}},b={ok:!0,code:"ok",message:null,path:"",rows:R,truncated:m.length===R,session:Z,currency:E.currency,currencies:E.currencies,summary:E,coverage:de,calls:m,files:re,stages:ce,models:Ce},Y=$();return Y===void 0?b:{...b,valuation:Y}}export{Ie as default};
