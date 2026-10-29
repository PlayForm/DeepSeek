# Client-side Apps
Use OpenTelemetry on end-user controlled apps running on devices like mobile phones, desktop computers, and retail kiosks.
Client-side applications present unique challenges for observability compared to server-side workloads. These apps run on devices you don’t control, with varying network conditions, hardware capabilities, and user behaviors.
## Why client-side observability matters 
Traditional server-side monitoring gives you visibility into your backend systems, but misses the complete picture of user experience. Client-side observability helps you:
  * **Understand real user experience** : See actual load times, frame rates, and responsiveness as users experience them.
  * **Debug issues in context** : Correlate errors with device characteristics, network conditions, and user actions.
  * **Track end-to-end transactions** : Connect client-side operations with backend traces for complete distributed tracing.
  * **Monitor app health at scale** : Aggregate telemetry across your user base to identify patterns and trends.


## Key differences from server-side instrumentation 
When instrumenting client apps, consider these factors:
  * **Resource constraints** : Mobile devices and browsers have limited CPU, memory, and battery. Telemetry collection must be efficient and avoid impacting app performance.
  * **Network variability** : Users may have slow, intermittent, or no connectivity. Implement offline buffering and batch exports to handle network unreliability.
  * **Session management** : Track user sessions to group related telemetry and understand user journeys across multiple app launches.
  * **Privacy and consent** : Client apps often collect data subject to privacy regulations. Plan for data minimization, consent management, and attribute redaction.
  * **Data volume** : With potentially millions of users, sampling strategies become essential to manage costs while maintaining representative telemetry.


## Real User Monitoring (RUM) 
OpenTelemetry supports Real User Monitoring (RUM) patterns that capture how real users experience your application:
  * **Page/screen load performance** : Time to first byte, first contentful paint, and full load completion.
  * **User interactions** : Click events, navigation patterns, and form submissions.
  * **Errors and crashes** : Unhandled exceptions, ANR events, and error rates.
  * **Resource loading** : Network request timing, cache hit rates, and resource sizes.


## Connecting to your backend 
Client telemetry becomes most valuable when connected to your backend traces. Propagate trace context through your HTTP requests to maintain end-to-end visibility:

```
Client App → API Gateway → Backend Services → Database
    │              │              │              │
    └──────────────┴──────────────┴──────────────┘
                 Correlated Traces

```

Configure your client SDK to inject trace headers (`traceparent`, `tracestate`) and ensure your backend services propagate this context through their operations.
Use OpenTelemetry in apps running on Android platforms
Use OpenTelemetry in apps running on iOS and iPadOS
Use OpenTelemetry in apps running on web browsers
## Feedback
Was this page helpful?
Yes No
Thank you. Your feedback is appreciated!
Please let us know [how we can improve this page](https://github.com/open-telemetry/opentelemetry.io/issues/new?template=PAGE_FEEDBACK.yml&title=\[Page+feedback\]%3A+ADD+A+SUMMARY+OF+YOUR+FEEDBACK+HERE). Your feedback is appreciated!
Last modified January 29, 2026: [chore(aliases): normalize aliases, tweak redirects partial (#9065) (6cebc46d)](https://github.com/open-telemetry/opentelemetry.io/commit/6cebc46de450dd44481a8a6f17c9b3d6f04aa0f2)
