const c={Contributions:`WITH FileScope AS (
    SELECT File.FileId AS FileId
    FROM File
    WHERE File.Path = ?
),
CallMoney AS (
    SELECT Allocation.CallId AS CallId,
        SUM(Allocation.DirectCost) AS Direct,
        SUM(Allocation.AmortizedCost) AS Amortized
    FROM Allocation
    JOIN FileScope ON FileScope.FileId = Allocation.FileId
    GROUP BY Allocation.CallId
),
Lifetime AS (
    SELECT SUM(CallMoney.Direct + CallMoney.Amortized) AS Total
    FROM CallMoney
),
SessionRow AS (
    SELECT Call.SessionId AS SessionId,
        COUNT(*) AS Calls,
        SUM(CallMoney.Direct) AS Direct,
        SUM(CallMoney.Amortized) AS Amortized,
        SUM(CallMoney.Direct + CallMoney.Amortized) AS Total,
        MIN(Call.At) AS FirstAt,
        MAX(Call.At) AS LastAt
    FROM CallMoney
    JOIN Call ON Call.CallId = CallMoney.CallId
    GROUP BY Call.SessionId
)
SELECT SessionRow.SessionId AS SessionId,
    Session.Title AS Title,
    SessionRow.Calls AS Calls,
    SessionRow.Direct AS Direct,
    SessionRow.Amortized AS Amortized,
    SessionRow.Total AS Total,
    (SELECT Lifetime.Total FROM Lifetime) AS Lifetime,
    SessionRow.FirstAt AS FirstAt,
    SessionRow.LastAt AS LastAt,
    (SELECT json_group_array(Model.Id) FROM (
            SELECT DISTINCT Call.Provider || '/' || Call.Model AS Id
            FROM CallMoney
            JOIN Call ON Call.CallId = CallMoney.CallId
            WHERE Call.SessionId = SessionRow.SessionId
            ORDER BY Id ASC
        ) AS Model) AS Models
FROM SessionRow
LEFT JOIN Session ON Session.SessionId = SessionRow.SessionId
ORDER BY SessionRow.Total DESC, SessionRow.SessionId ASC;`,FileCalls:`WITH FileScope AS (
    SELECT File.FileId AS FileId
    FROM File
    WHERE File.Path = ?
),
CallScope AS (
    SELECT Call.CallId AS CallId,
        Call.Turn AS Turn,
        Call.Step AS Step,
        Call.At AS At,
        Call.Provider AS Provider,
        Call.Model AS Model,
        Call.InputTokens AS InputTokens,
        Call.OutputTokens AS OutputTokens,
        Call.CacheReadTokens AS CacheReadTokens,
        Call.CacheWriteTokens AS CacheWriteTokens
    FROM Call
    WHERE Call.SessionId = ?
),
CallMoney AS (
    SELECT Allocation.CallId AS CallId,
        SUM(Allocation.DirectCost) AS Direct,
        SUM(Allocation.AmortizedCost) AS Amortized
    FROM Allocation
    JOIN FileScope ON FileScope.FileId = Allocation.FileId
    JOIN CallScope ON CallScope.CallId = Allocation.CallId
    GROUP BY Allocation.CallId
),
TouchRow AS (
    SELECT Touch.CallId AS CallId,
        MAX(Touch.Stage) AS Stage,
        COUNT(*) AS Touched
    FROM Touch
    JOIN FileScope ON FileScope.FileId = Touch.FileId
    JOIN CallScope ON CallScope.CallId = Touch.CallId
    GROUP BY Touch.CallId
)
SELECT CallScope.CallId AS CallId,
    CallScope.Turn AS Turn,
    CallScope.Step AS Step,
    CallScope.At AS At,
    CallScope.Provider AS Provider,
    CallScope.Model AS Model,
    CallMoney.Direct AS Direct,
    CallMoney.Amortized AS Amortized,
    CallMoney.Direct + CallMoney.Amortized AS Total,
    CallScope.InputTokens AS InputTokens,
    CallScope.OutputTokens AS OutputTokens,
    CallScope.CacheReadTokens AS CacheReadTokens,
    CallScope.CacheWriteTokens AS CacheWriteTokens,
    TouchRow.Stage AS Stage,
    COALESCE(TouchRow.Touched, 0) AS Touched
FROM CallMoney
JOIN CallScope ON CallScope.CallId = CallMoney.CallId
LEFT JOIN TouchRow ON TouchRow.CallId = CallMoney.CallId
ORDER BY CallScope.Turn ASC, CallScope.Step ASC, CallScope.CallId ASC;`},s=(o,a)=>{const t=o[a];return typeof t=="string"?t:null},r=(o,a)=>{const t=o[a];return typeof t=="number"&&Number.isFinite(t)?t:null},e=(o,a)=>r(o,a)??0,S=o=>Math.round(o*1e6)/1e6;function u(o,a){const t=l=>{if(typeof l!="string")return[];const i=JSON.parse(l);return Array.isArray(i)?i.filter(n=>typeof n=="string"):[]};return o.prepare(c.Contributions).all(a).map(l=>{const i=S(e(l,"Direct")),n=S(e(l,"Amortized")),C=S(i+n),A=S(e(l,"Lifetime"));return{sessionId:s(l,"SessionId")??"",title:s(l,"Title"),calls:e(l,"Calls"),direct:i,amortized:n,total:C,share:A>0?Math.min(1,Math.max(0,C/A)):0,firstAt:r(l,"FirstAt"),lastAt:r(l,"LastAt"),models:t(l.Models)}})}function I(o,a,t){return o.prepare(c.FileCalls).all(a,t).map(l=>{const i=S(e(l,"Direct")),n=S(e(l,"Amortized"));return{callId:e(l,"CallId"),turn:e(l,"Turn"),step:e(l,"Step"),at:e(l,"At"),provider:s(l,"Provider")??"",model:s(l,"Model")??"",direct:i,amortized:n,total:S(i+n),input:e(l,"InputTokens"),output:e(l,"OutputTokens"),cacheRead:e(l,"CacheReadTokens"),cacheWrite:e(l,"CacheWriteTokens"),stage:s(l,"Stage"),touched:e(l,"Touched")>0}})}export{I as FileCalls,u as default};
