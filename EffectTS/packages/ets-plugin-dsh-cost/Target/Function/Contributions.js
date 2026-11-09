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
ORDER BY CallScope.Turn ASC, CallScope.Step ASC, CallScope.CallId ASC;`},C=(o,a)=>{const i=o[a];return typeof i=="string"?i:null},A=(o,a)=>{const i=o[a];return typeof i=="number"&&Number.isFinite(i)?i:null},e=(o,a)=>A(o,a)??0,n=o=>Math.round(o*1e6)/1e6,u=o=>{if(typeof o!="string")return[];const a=JSON.parse(o);return Array.isArray(a)?a.filter(i=>typeof i=="string"):[]};var p=o=>{const a=o.prepare(c.Contributions),i=o.prepare(c.FileCalls);return{Contributions:r=>a.all(r).map(t=>{const l=n(e(t,"Direct")),S=n(e(t,"Amortized")),s=n(l+S),d=n(e(t,"Lifetime"));return{SessionId:C(t,"SessionId")??"",Title:C(t,"Title"),Calls:e(t,"Calls"),Direct:l,Amortized:S,Total:s,Share:d>0?Math.min(1,Math.max(0,s/d)):0,FirstAt:A(t,"FirstAt"),LastAt:A(t,"LastAt"),Models:u(t.Models)}}),FileCalls:(r,t)=>i.all(r,t).map(l=>{const S=n(e(l,"Direct")),s=n(e(l,"Amortized"));return{CallId:e(l,"CallId"),Turn:e(l,"Turn"),Step:e(l,"Step"),At:e(l,"At"),Provider:C(l,"Provider")??"",Model:C(l,"Model")??"",Direct:S,Amortized:s,Total:n(S+s),Input:e(l,"InputTokens"),Output:e(l,"OutputTokens"),CacheRead:e(l,"CacheReadTokens"),CacheWrite:e(l,"CacheWriteTokens"),Stage:C(l,"Stage"),Touched:e(l,"Touched")>0}})}};export{p as default};
