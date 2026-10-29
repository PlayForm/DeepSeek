We value your privacy
We use cookies to enhance your browsing experience, serve personalised ads or content, and analyse our traffic. By clicking "Accept All", you consent to our use of cookies.
Customise Reject All Accept All
Customise Consent Preferences
We use cookies to help you navigate efficiently and perform certain functions. You will find detailed information about all cookies under each consent category below.
The cookies that are categorised as "Necessary" are stored on your browser as they are essential for enabling the basic functionalities of the site. ... Show more
NecessaryAlways Active
Necessary cookies are required to enable the basic features of this site, such as providing secure log-in or adjusting your consent preferences. These cookies do not store any personally identifiable data.
  * Cookie
__Secure-next-auth.csrf-token.EU
  * Duration
session
  * Description
Description is currently not available.


  * Cookie
__Secure-next-auth.callback-url.EU
  * Duration
session
  * Description
Description is currently not available.


  * Cookie
__Secure-next-auth.csrf-token.US
  * Duration
session
  * Description
Description is currently not available.


  * Cookie
__Secure-next-auth.callback-url.US
  * Duration
session
  * Description
Description is currently not available.


  * Cookie
__cf_bm
  * Duration
1 hour
  * Description
This cookie, set by Cloudflare, is used to support Cloudflare Bot Management. 


  * Cookie
__hssrc
  * Duration
session
  * Description
This cookie is set by Hubspot whenever it changes the session cookie. The __hssrc cookie set to 1 indicates that the user has restarted the browser, and if the cookie does not exist, it is assumed to be a new session.


  * Cookie
__hssc
  * Duration
1 hour
  * Description
HubSpot sets this cookie to keep track of sessions and to determine if HubSpot should increment the session number and timestamps in the __hstc cookie.


  * Cookie
__Secure-next-auth.csrf-token.HIPAA
  * Duration
session
  * Description
Description is currently not available.


  * Cookie
__Secure-next-auth.callback-url.HIPAA
  * Duration
session
  * Description
Description is currently not available.


  * Cookie
__Secure-next-auth.csrf-token.JP
  * Duration
session
  * Description
Description is currently not available.


  * Cookie
__Secure-next-auth.callback-url.JP
  * Duration
session
  * Description
Description is currently not available.


  * Cookie
theme
  * Duration
Never Expires
  * Description
No description available.


  * Cookie
cookietest
  * Duration
session
  * Description
The cookietest cookie is typically used to determine whether the user's browser accepts cookies, essential for website functionality and user experience.


  * Cookie
cookieyes-*
  * Duration
1 year
  * Description
CookieYes sets this cookie for consent solution management.


Functional
Functional cookies help perform certain functionalities like sharing the content of the website on social media platforms, collecting feedback, and other third-party features.
  * Cookie
inkeepUsagePreferences_userId
  * Duration
1 year
  * Description
Description is currently not available.


  * Cookie
_octo
  * Duration
1 year
  * Description
No description available.


  * Cookie
logged_in
  * Duration
1 year
  * Description
No description available.


Analytics
Analytical cookies are used to understand how visitors interact with the website. These cookies help provide information on metrics such as the number of visitors, bounce rate, traffic source, etc.
  * Cookie
ph_phc_zkMwFajk8ehObUlMth0D7DtPItFnxETi3lmSvyQDrwB_posthog
  * Duration
1 year
  * Description
Description is currently not available.


  * Cookie
__hstc
  * Duration
6 months
  * Description
Hubspot set this main cookie for tracking visitors. It contains the domain, initial timestamp (first visit), last timestamp (last visit), current timestamp (this visit), and session number (increments for each subsequent session).


  * Cookie
hubspotutk
  * Duration
6 months
  * Description
HubSpot sets this cookie to keep track of the visitors to the website. This cookie is passed to HubSpot on form submission and used when deduplicating contacts.


  * Cookie
_gh_sess
  * Duration
session
  * Description
GitHub sets this cookie for temporary application and framework state between pages like what step the user is on in a multiple step form.


Performance
Performance cookies are used to understand and analyse the key performance indexes of the website which helps in delivering a better user experience for the visitors.
  * Cookie
__sdcfduid
  * Duration
5 years
  * Description
Stores a unique browser identifier to help Discord detect malicious activity, enforce security protections, manage traffic, and maintain service performance.


  * Cookie
__dcfduid
  * Duration
5 years
  * Description
Enables Discord to uniquely identify your device, enhance account security, prevent spam and abuse, and support diagnostics across browsing sessions.


Advertisement
Advertisement cookies are used to provide visitors with customised advertisements based on the pages you visited previously and to analyse the effectiveness of the ad campaigns.
No cookies to display.
Uncategorised
Other uncategorised cookies are those that are being analysed and have not been classified into a category as yet.
No cookies to display.
Reject All Save My Preferences Accept All
AcademyTracing
# [Tracing](https://langfuse.com/academy/tracing#tracing)
## [How tracing fits into the loop](https://langfuse.com/academy/tracing#how-tracing-fits-into-the-loop)
Traditional software is largely deterministic, executions follow a pre-defined format. For LLM applications that's not the case. Agent executions can be messy, we are dealing with emergent behaviour with rich and unexpected inputs and outputs, and execution order. You need something else to follow your agent's behavior: [traces](https://langfuse.com/docs/observability/overview).
A trace is a structured record of what your application did for a single request: which steps it took, what data it saw, what it produced.
Deploy
[Online Trace traces · sessions · agents · prompts](https://langfuse.com/academy/tracing)[Online Monitor dashboards · LLM-as-judge · feedback](https://langfuse.com/academy/monitoring)[Offline Build datasets datasets · features-as-tests](https://langfuse.com/academy/datasets)[Offline Experiment prompts · models · code variants](https://langfuse.com/academy/experiments)[Offline Evaluate judges · custom evals · annotation](https://langfuse.com/academy/evaluate)
Tracing is central to the entire improvement loop. Every other step — reviewing, building datasets, running experiments, evaluating — operates on traces.
If you're already familiar with traditional observability concepts, some of what follows may feel repetitive. Feel free to skim or skip ahead.
## [The anatomy of a trace](https://langfuse.com/academy/tracing#anatomy-of-a-trace)
A trace can be as complex or as simple as your application requires, but all traces share the same basic structure. It's composed of a set of [observations](https://langfuse.com/docs/observability/data-model) that map out the path your agent took.
_An observation is a single step in the process. It has an input, an output, start/end time, and metadata about what happened during that step._
### [Hierarchy](https://langfuse.com/academy/tracing#hierarchy)
A trace has a hierarchical tree structure. Nested inside are observations that can contain other observations, forming a parent-child structure that mirrors the actual execution of your AI application.
NameDuration
Tracerag-chat-pipeline4.23s
Spanretrieve-documents1.07s
Genembed-query150ms
Spanvector-db-search510ms
Eventcache-miss@ 225ms
Genrerank-results180ms
Spangenerate-answer3.16s
Gengenerate-answer1.07s
Eventstream-complete@ 1.93s
tracespangenerationevent
1 trace, 8 observations - p95 1.82s
You can see what happened in what order, and which steps were part of which larger step.
### [Observation data](https://langfuse.com/academy/tracing#observation-data)
**Input and output.** Every observation can have an input and an output. Most of the time it will have both; in some specific cases it might only have one of the two. It's important for interpretability that you set an input and/or output that makes sense for the type of action happening in that observation.
**Observation types.** In order to make it easy to differentiate between operations, you'll see different [types of observations](https://langfuse.com/docs/observability/features/observation-types). Each type of observation is used to capture different kinds of interactions of an agent.  
| Action of an agent  | Observation type  | Typical observation input/output  |  
| --- | --- | --- |  
| A call to a language model  | `generation`  | Full prompt or message history as input, the completion as output, plus metadata like the model name and token counts  |  
| A step that fetches information from an external source  | `retriever`  | Query and the returned documents  |  
| An invocation of a tool or function by an agent  | `tool`  | Which tool was called, the arguments, and the return value  |  
| General processes  | `span`  | Highly dependent on the use case  |  
Observation types make it easier to read traces and to filter. In a trace with 20 observations, being able to quickly spot the LLM calls saves time.
### [Cost, latency, token usage](https://langfuse.com/academy/tracing#cost-latency-token-usage)
Beyond input and output, there are a few attributes on observations that are table stakes in any LLM application: cost, latency, and [token usage](https://langfuse.com/docs/observability/features/token-and-cost-tracking). These are recorded per observation and aggregated at the trace level.
## [Traces vs sessions](https://langfuse.com/academy/tracing#traces-vs-sessions)
Most of the time you would not see an entire agent's lifecycle execution in one trace. Traces can be grouped into [sessions](https://langfuse.com/docs/observability/features/sessions). But where do you draw the line between a trace and a session?
Session
Trace
Observation
Observation
Observation
Trace
Observation
Observation
Observation
Observation
Trace
Observation
Observation
A general rule of thumb is: **one trace corresponds to one invocation of your system** , typically one API call or one agent execution. A session then groups multiple traces together, for example all the turns in a multi-turn conversation.
To make this concrete, here are two examples of applications and how they designed their trace-session split:
Customer support chatbotPR review agent
_A customer support chatbot embedded on a SaaS company's help page. Users open it to ask questions about their account, billing, or product usage. A typical session is a handful of back-and-forth turns until the issue is resolved or the conversation is handed off to a human agent._
The trace and session split looks like this:

```
Session: conversation_8f2a
├── Trace: "Why was I charged twice this month?"
├── Trace: "Can you refund the duplicate?"
└── Trace: "Thanks, when will I see it?"
```

That way, evaluating the execution of the chatbot for a given input can be done on one single trace in isolation. For inspecting the entire conversation, one can look at the session as a whole.
_An automated code review agent that runs on every commit pushed to an open pull request. For each run, the agent reads the diff and the surrounding files, executes static checks, and posts inline review comments. A PR usually receives several review runs over its lifetime as the author iterates._
The trace and session split looks like this:

```
Session: PR #1234
├── Trace: review run on commit a3f9b
├── Trace: review run on commit c7d2e
└── Trace: review run on commit 8b1f0
```

Here a trace is one review iteration. The comment quality depends on what was read. Splitting each step of a review iteration into its own trace would scatter the context and make the review hard to follow.
The shared tradeoff: cut too small and a trace loses the cohesion to tell a story; cut too large and individual failures get buried inside an unreadable trace.
## [Where to start](https://langfuse.com/academy/tracing#where-to-start)
If you're just getting started, focus on instrumenting one real workflow end to end before trying to cover every possible path.
  1. [Set up tracing](https://langfuse.com/docs/observability/get-started) for one important request path in your application.
  2. Make sure each observation captures useful input, output, and metadata for the step it represents.
  3. Review a handful of real traces manually to confirm that the structure is easy to follow and useful for debugging.


## [What comes next](https://langfuse.com/academy/tracing#what-comes-next)
Once you see traces, you can move on to the next step: [monitoring](https://langfuse.com/academy/monitoring). Monitoring is what connects traces to the loop of improving and iterating on your agent.
Was this page helpful?
Last updated on 10/8/2026
[PreviousAI Engineering Loop](https://langfuse.com/academy/ai-engineering-loop)[NextMonitoring](https://langfuse.com/academy/monitoring)
### On this page
[Tracing](https://langfuse.com/academy/tracing#tracing)[How tracing fits into the loop](https://langfuse.com/academy/tracing#how-tracing-fits-into-the-loop)[The anatomy of a trace](https://langfuse.com/academy/tracing#anatomy-of-a-trace)[Hierarchy](https://langfuse.com/academy/tracing#hierarchy)[Observation data](https://langfuse.com/academy/tracing#observation-data)[Cost, latency, token usage](https://langfuse.com/academy/tracing#cost-latency-token-usage)[Traces vs sessions](https://langfuse.com/academy/tracing#traces-vs-sessions)[Where to start](https://langfuse.com/academy/tracing#where-to-start)[What comes next](https://langfuse.com/academy/tracing#what-comes-next)
Actions
[Give us feedback](https://github.com/langfuse/langfuse-docs/issues/new?title=Feedback+for+https%3A%2F%2Flangfuse.com%2Facademy%2Ftracing&labels=feedback)[Edit this page on GitHub](https://github.com/langfuse/langfuse-docs/edit/main/content/academy/tracing.mdx)
Contributors
Last edited Oct 8, 2026
[Lotte Verheyden](https://github.com/Lotte-Verheyden)[Ben Bachem](https://github.com/bezbac)[Annabell Schäfer](https://github.com/annabellscha)+1 more
`Ask AI``A`
