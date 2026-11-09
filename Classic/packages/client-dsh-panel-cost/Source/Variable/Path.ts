// Path - the route path both halves share: the host half registers it
// through the web server and the browser half fetches it, so neither module
// hardcodes its own copy and the two can never drift.
export default "/api/playform-cost/session" as const;
