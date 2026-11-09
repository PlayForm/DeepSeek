const A={Contributions:`WITH FileScope AS (
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
ORDER BY CallScope.Turn ASC, CallScope.Step ASC, CallScope.CallId ASC;`,History:`WITH FileScope AS (
    SELECT File.FileId AS FileId
    FROM File
    WHERE File.Path = ?
),
VersionRow AS (
    SELECT FileVersion.VersionId AS VersionId,
        FileVersion.Hash AS Hash,
        FileVersion.Bytes AS Bytes,
        FileVersion.Lines AS Lines,
        FileVersion.ObservedAt AS ObservedAt
    FROM FileVersion
    JOIN FileScope ON FileScope.FileId = FileVersion.FileId
),
TouchRow AS (
    SELECT Touch.VersionId AS VersionId,
        COUNT(*) AS Touches,
        MIN(Touch.At) AS FirstAt,
        MAX(Touch.At) AS LastAt,
        COUNT(DISTINCT Touch.SessionId) AS Sessions
    FROM Touch
    JOIN FileScope ON FileScope.FileId = Touch.FileId
    WHERE Touch.VersionId IS NOT NULL
    GROUP BY Touch.VersionId
)
SELECT VersionRow.VersionId AS VersionId,
    VersionRow.Hash AS Hash,
    VersionRow.Bytes AS Bytes,
    VersionRow.Lines AS Lines,
    VersionRow.ObservedAt AS ObservedAt,
    COALESCE(TouchRow.Touches, 0) AS Touches,
    TouchRow.FirstAt AS FirstAt,
    TouchRow.LastAt AS LastAt,
    COALESCE(TouchRow.Sessions, 0) AS Sessions,
    (SELECT json_group_array(Kind) FROM (
            SELECT DISTINCT Touch.Kind AS Kind
            FROM Touch
            JOIN FileScope ON FileScope.FileId = Touch.FileId
            WHERE Touch.VersionId = VersionRow.VersionId
            ORDER BY Kind ASC
        ) AS Kind) AS Kinds
FROM VersionRow
LEFT JOIN TouchRow ON TouchRow.VersionId = VersionRow.VersionId
ORDER BY VersionRow.ObservedAt DESC, VersionRow.VersionId DESC;`},a=(l,i)=>{const t=l[i];return typeof t=="string"?t:null},r=(l,i)=>{const t=l[i];return typeof t=="number"&&Number.isFinite(t)?t:null},o=(l,i)=>r(l,i)??0,S=l=>Math.round(l*1e6)/1e6,u=12;function I(l,i){const t=e=>{if(typeof e!="string")return[];const s=JSON.parse(e);return Array.isArray(s)?s.filter(n=>typeof n=="string"):[]};return l.prepare(A.Contributions).all(i).map(e=>{const s=S(o(e,"Direct")),n=S(o(e,"Amortized")),d=S(s+n),c=S(o(e,"Lifetime"));return{sessionId:a(e,"SessionId")??"",title:a(e,"Title"),calls:o(e,"Calls"),direct:s,amortized:n,total:d,share:c>0?Math.min(1,Math.max(0,d/c)):0,firstAt:r(e,"FirstAt"),lastAt:r(e,"LastAt"),models:t(e.Models)}})}function T(l,i,t){return l.prepare(A.FileCalls).all(i,t).map(e=>{const s=S(o(e,"Direct")),n=S(o(e,"Amortized"));return{callId:o(e,"CallId"),turn:o(e,"Turn"),step:o(e,"Step"),at:o(e,"At"),provider:a(e,"Provider")??"",model:a(e,"Model")??"",direct:s,amortized:n,total:S(s+n),input:o(e,"InputTokens"),output:o(e,"OutputTokens"),cacheRead:o(e,"CacheReadTokens"),cacheWrite:o(e,"CacheWriteTokens"),stage:a(e,"Stage"),touched:o(e,"Touched")>0}})}function p(l,i){const t=e=>{if(typeof e!="string")return[];const s=JSON.parse(e);return Array.isArray(s)?s.filter(n=>typeof n=="string"):[]};return l.prepare(A.History).all(i).map(e=>({versionId:o(e,"VersionId"),hash:a(e,"Hash")?.slice(0,u)??null,bytes:r(e,"Bytes"),lines:r(e,"Lines"),observedAt:o(e,"ObservedAt"),touches:o(e,"Touches"),firstAt:r(e,"FirstAt"),lastAt:r(e,"LastAt"),kinds:t(e.Kinds),sessions:o(e,"Sessions")}))}export{T as FileCalls,p as History,I as default};
