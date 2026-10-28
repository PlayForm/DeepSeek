#  System profiling, app tracing and trace analysis
## Open-Source · Portable · Efficient
[System Profiling](https://perfetto.dev/#profiling) [In-App Tracing](https://perfetto.dev/#tracing) [Trace Viewer](https://perfetto.dev/#viewer) [Trace Analysis](https://perfetto.dev/#analysis)
## System-wide profiling for Linux and Android
_sort_
### Linux kernel tracing
Capture high frequency ftrace data: scheduling activity, task switching latency, CPU frequency and much more
_nfc_
### Userspace profilers and extra probes
Native heap profiling, Java heap profiling, pollers for /proc stat files
_android_
### Built into Android
Part of the platform since Android 9 Pie, runs on Linux as well
[Get Started](https://perfetto.dev/docs/quickstart/android-tracing)
## App Tracing
_developer_mode_
### Efficient trace point instrumentation
Log your C++ app’s activity with high throughput, low overhead trace points
_ballot_
### Structured and configurable events
Define custom protobuf messages to represent strongly-typed app-specific information, trace only what you need
_view_compact_
### Integrated with system-wide tracing
Correlate your app’s state with system-wide profiling data on the same timeline
[Get Started](https://perfetto.dev/docs/instrumentation/tracing-sdk)
## Trace Viewer
_timeline_
### Interactive trace exploration
Record, view and process trace data with the Perfetto UI
_file_copy_
### Supports popular trace format files
TraceEvent JSON, Android systrace, ftrace text output
_offline_bolt_
### Runs fully in your browser
No server interaction involved, works even if you are offline
## Trace Analysis
_storage_
### SQL-based trace model
Trace processor ingests traces and exposes a SQLite-based interface to access the contents of the trace, both via shell and UI 
_speed_
### Large trace analysis
Supports traces up to tens of GBs 
_compare_arrows_
### Interoperable
Can import and export popular trace formats: Chromium JSON trace format, Android Systrace, ftrace, CSV
