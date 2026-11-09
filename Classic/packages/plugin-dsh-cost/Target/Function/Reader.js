const T={Session:`SELECT Session.Title AS Title,
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
LIMIT 5;`},$=200,X=1,Z=2e3;function ee(S,C,L){const j=Number.isFinite(L)?Math.floor(L):$,h=Math.min(Math.max(j,X),Z),f={},l=(e,o)=>{const n=e[o];return typeof n=="string"?n:null},r=(e,o)=>{const n=e[o];return typeof n=="number"&&Number.isFinite(n)?n:null},t=(e,o)=>r(e,o)??0,P=(e,o)=>e[o]===1,v=(e,o,n)=>{const i=o+e+n;return i>0?Math.min(1,o/i):null},H=e=>{const o=t(e,"InputTokens"),n=t(e,"OutputTokens"),i=t(e,"CacheReadTokens"),d=t(e,"CacheWriteTokens");return{input:o,output:n,cacheRead:i,cacheWrite:d,reasoning:t(e,"ReasoningTokens"),total:o+i+d+n,reported:r(e,"TotalTokens")}},b=e=>{const o=t(e,"CostInput"),n=t(e,"CostOutput"),i=t(e,"CostCacheRead"),d=t(e,"CostTotal");return{input:o,output:n,cacheRead:i,cacheWrite:t(e,"CostCacheWrite"),reasoning:t(e,"CostReasoning"),total:d,other:Math.max(0,d-i-o-n)}},w=e=>{if(typeof e!="string")return[];const o=JSON.parse(e);return Array.isArray(o)?o.filter(n=>typeof n=="string"):[]},u=S.prepare(T.Session).get(C);if(u===void 0)return{ok:!1,code:"session",message:`client-dsh-panel-cost: the session ${C} is not recorded in the ledger`,path:"",rows:h,truncated:!1,session:null,currency:"USD",currencies:[],summary:{calls:0,priced:0,unpriced:0,turns:0,steps:0,tokens:{input:0,output:0,cacheRead:0,cacheWrite:0,reasoning:0,total:0,reported:null},cost:{input:0,output:0,cacheRead:0,cacheWrite:0,reasoning:0,total:0,other:0},direct:0,amortized:0,saving:0,cacheHit:null,files:0,currency:"USD",currencies:[],topFiles:[]},calls:[]};const R=S.prepare(T.Project).get(C)??f,V={id:C,project:l(R,"Name"),root:l(R,"Root"),client:l(R,"ClientName"),title:l(u,"Title"),cwd:l(u,"Cwd"),origin:l(u,"Origin"),agentPreset:l(u,"AgentPreset"),parentSessionId:l(u,"ParentSessionId"),delegationDepth:r(u,"DelegationDepth"),createdAt:t(u,"CreatedAt"),endedAt:r(u,"EndedAt")},Q=S.prepare(T.Calls).all(C,h),x=S.prepare(T.Touches).all(C),q=S.prepare(T.Allocations).all(C),J=S.prepare(T.TopFiles).all(C),s=S.prepare(T.Summary).get(C)??f,E=new Map;for(const e of q){const o=t(e,"CallId"),n=E.get(o);n===void 0?E.set(o,[e]):n.push(e)}const m=new Map;for(const e of x){const o=t(e,"CallId"),n=m.get(o);n===void 0?m.set(o,[e]):n.push(e)}const O=Q.map(e=>{const o=t(e,"CallId"),n=t(e,"At"),i=E.get(o)??[],d=m.get(o)??[],p=new Map;for(const a of d){const c=t(a,"FileId");p.has(c)||p.set(c,{path:l(a,"Path")??"",kind:l(a,"Kind"),stage:l(a,"Stage"),tool:l(a,"Tool"),branch:l(a,"Branch"),readBeforeEdit:P(a,"ReadBeforeEdit"),direct:0,amortized:0,total:0,linesDelta:r(a,"LinesDelta"),bytesDelta:r(a,"BytesDelta"),durationMs:r(a,"DurationMs"),touched:!0,at:t(a,"At")})}for(const a of i){const c=l(a,"Path");if(c===null)continue;const B=t(a,"FileId"),k=t(a,"DirectCost"),y=t(a,"AmortizedCost"),A=p.get(B);if(A===void 0){p.set(B,{path:c,kind:null,stage:null,tool:null,branch:null,readBeforeEdit:!1,direct:k,amortized:y,total:k+y,linesDelta:null,bytesDelta:null,durationMs:null,touched:!1,at:n});continue}A.direct+=k,A.amortized+=y,A.total=A.direct+A.amortized}const K=[...p.values()].sort((a,c)=>c.total-a.total||(a.path<c.path?-1:1)),G=i.reduce((a,c)=>a+t(c,"DirectCost"),0),_=i.reduce((a,c)=>a+t(c,"AmortizedCost"),0);return{turn:t(e,"Turn"),step:t(e,"Step"),seq:t(e,"Seq"),at:n,provider:l(e,"Provider")??"",model:l(e,"Model")??"",mode:l(e,"Mode")??"standard",region:l(e,"Region"),tier:r(e,"Tier"),priced:P(e,"Priced"),currency:l(e,"Currency")??"USD",tokens:H(e),cost:b(e),saving:t(e,"CacheSaving"),attempts:t(e,"Attempts"),error:l(e,"ErrorCode"),surfaceTokens:t(e,"SurfaceTokens"),purpose:l(e,"Purpose"),contextWindow:r(e,"ContextWindow"),utilization:r(e,"Utilization"),latencyMs:r(e,"LatencyMs"),firstTokenMs:r(e,"FirstTokenMs"),tokensPerSecond:r(e,"TokensPerSecond"),direct:G,amortized:_,allocations:i.length,files:K}});O.sort((e,o)=>e.turn-o.turn||e.step-o.step);const I=t(s,"InputTokens"),D=t(s,"OutputTokens"),g=t(s,"CacheReadTokens"),M=t(s,"CacheWriteTokens"),U=t(s,"CostInput"),N=t(s,"CostOutput"),W=t(s,"CostCacheRead"),z=t(s,"CostTotal"),Y=J.map(e=>{const o=t(e,"Direct"),n=t(e,"Amortized");return{path:l(e,"Path")??"",direct:o,amortized:n,total:o+n,calls:t(e,"Calls")}}),F={calls:t(s,"Calls"),priced:t(s,"Priced"),unpriced:t(s,"Unpriced"),turns:t(s,"Turns"),steps:t(s,"Steps"),tokens:{input:I,output:D,cacheRead:g,cacheWrite:M,reasoning:t(s,"ReasoningTokens"),total:I+g+M+D,reported:r(s,"ReportedTokens")},cost:{input:U,output:N,cacheRead:W,cacheWrite:t(s,"CostCacheWrite"),reasoning:t(s,"CostReasoning"),total:z,other:Math.max(0,z-W-U-N)},direct:t(s,"Direct"),amortized:t(s,"Amortized"),saving:t(s,"Saving"),cacheHit:v(I,g,M),files:t(s,"Files"),currency:l(s,"Currency")??"USD",currencies:w(s.Currencies),topFiles:Y};return{ok:!0,code:"ok",message:null,path:"",rows:h,truncated:O.length===h,session:V,currency:F.currency,currencies:F.currencies,summary:F,calls:O}}export{ee as default};
