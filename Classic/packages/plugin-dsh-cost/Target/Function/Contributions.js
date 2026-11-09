const C={Contributions:`WITH FileScope AS (
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
ORDER BY SessionRow.Total DESC, SessionRow.SessionId ASC;`};function u(S,A){const n=(t,e)=>{const o=t[e];return typeof o=="string"?o:null},s=(t,e)=>{const o=t[e];return typeof o=="number"&&Number.isFinite(o)?o:null},l=(t,e)=>s(t,e)??0,i=t=>Math.round(t*1e6)/1e6,d=t=>{if(typeof t!="string")return[];const e=JSON.parse(t);return Array.isArray(e)?e.filter(o=>typeof o=="string"):[]};return S.prepare(C.Contributions).all(A).map(t=>{const e=i(l(t,"Direct")),o=i(l(t,"Amortized")),r=i(e+o),a=i(l(t,"Lifetime"));return{sessionId:n(t,"SessionId")??"",title:n(t,"Title"),calls:l(t,"Calls"),direct:e,amortized:o,total:r,share:a>0?Math.min(1,Math.max(0,r/a)):0,firstAt:s(t,"FirstAt"),lastAt:s(t,"LastAt"),models:d(t.Models)}})}export{u as default};
