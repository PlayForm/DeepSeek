# Instrumentation
Instrumentation for OpenTelemetry Ruby
[Instrumentation](https://opentelemetry.io/docs/concepts/instrumentation/) is the act of adding observability code to an app yourself.
If you’re instrumenting an app, you need to use the OpenTelemetry SDK for your language. You’ll then use the SDK to initialize OpenTelemetry and the API to instrument your code. This will emit telemetry from your app, and any library you installed that also comes with instrumentation.
If you’re instrumenting a library, only install the OpenTelemetry API package for your language. Your library will not emit telemetry on its own. It will only emit telemetry when it is part of an app that uses the OpenTelemetry SDK. For more on instrumenting libraries, see [Libraries](https://opentelemetry.io/docs/concepts/instrumentation/libraries/).
For more information about the OpenTelemetry API and SDK, see the [specification](https://opentelemetry.io/docs/specs/otel/).
## Setup 
First, ensure you have the SDK package installed:

```
gem install opentelemetry-sdk

```

Then include configuration code that runs when your program initializes. Make sure that `service.name` is set by configuring a service name (for example via the `OTEL_SERVICE_NAME` environment variable).
To instrument many common libraries without enabling each instrumentation individually, use `opentelemetry-instrumentation-all`:

```
gem install opentelemetry-instrumentation-all

```

Then configure the SDK to enable available instrumentations:

```
require 'opentelemetry/sdk'
OpenTelemetry::SDK.configure do |c|
  c.use_all

```

Tip
In a Ruby on Rails app, you can place this configuration in `config/initializers/opentelemetry.rb`.
This approach automatically enables supported library instrumentations (so you typically don’t need to follow the per-instrumentation steps in the [Traces](https://opentelemetry.io/docs/languages/ruby/instrumentation/#traces) section below). You may still need to configure an exporter and environment variables appropriate for your deployment.
## Traces 
### Acquiring a Tracer 
To begin [tracing](https://opentelemetry.io/docs/concepts/signals/traces/), you will need to ensure you have an initialized [`Tracer`](https://opentelemetry.io/docs/concepts/signals/traces/#tracer) that comes from a [`TracerProvider`](https://opentelemetry.io/docs/concepts/signals/traces/#tracer-provider).
The easiest and most common way to do this is to use the globally-registered TracerProvider. If you are using [instrumentation libraries](https://opentelemetry.io/docs/languages/ruby/libraries/), such as in a Rails app, then one will be registered for you.

```
# If in a Rails app, this lives in config/initializers/opentelemetry.rb
require "opentelemetry/sdk"
OpenTelemetry::SDK.configure do |c|
  c.service_name = '<YOUR_SERVICE_NAME>'
# 'Tracer' can be used throughout your code now
MyAppTracer = OpenTelemetry.tracer_provider.tracer('<YOUR_TRACER_NAME>')

```

With a `Tracer` acquired, you can manually trace code.
### Get the current span 
It’s very common to add information to the current [span](https://opentelemetry.io/docs/concepts/signals/traces/#spans) somewhere within your program. To do so, you can get the current span and add [attributes](https://opentelemetry.io/docs/concepts/signals/traces/#attributes) to it.

```
require "opentelemetry/sdk"
def track_extended_warranty(extended_warranty)
  # Get the current span
  current_span = OpenTelemetry::Trace.current_span
  # And add useful stuff to it!
  current_span.add_attributes({
    "com.extended_warranty.id" => extended_warranty.id,
    "com.extended_warranty.timestamp" => extended_warranty.timestamp

```

### Creating New Spans 
To create a [span](https://opentelemetry.io/docs/concepts/signals/traces/#spans), you’ll need a [configured `Tracer`](https://opentelemetry.io/docs/languages/ruby/instrumentation/#acquiring-a-tracer).
Typically when you create a new span, you’ll want it to be the active/current span. To do that, use `in_span`:

```
require "opentelemetry/sdk"
def do_work
  MyAppTracer.in_span("do_work") do |span|
    # do some work that the 'do_work' span tracks!

```

If an exception escapes the `in_span` block, the tracer records the exception on the span by default, sets the span status to `Error`, and re-raises the exception. You can disable automatic exception recording by passing `record_exception: false` as an argument to the `in_span` method.
If you rescue an exception inside the block and don’t re-raise it, set the span status and record the exception manually when appropriate:

```
MyAppTracer.in_span("do_work") do |span|
    # do work that may raise an exception
  rescue StandardError => e
    span.status = OpenTelemetry::Trace::Status.error(e.message)
    span.record_exception(e)
    # Handle the exception without re-raising it, such as returning a fallback.

```

### Creating nested spans 
If you have a distinct sub-operation you’d like to track as a part of another one, you can create nested [spans](https://opentelemetry.io/docs/concepts/signals/traces/#spans) to represent the relationship:

```
require "opentelemetry/sdk"
def parent_work
  MyAppTracer.in_span("parent") do |span|
    # do some work that the 'parent' span tracks!
    child_work
    # do some more work afterwards
def child_work
  MyAppTracer.in_span("child") do |span|
    # do some work that the 'child' span tracks!

```

In the preceding example, two spans are created - named `parent` and `child` - with `child` nested under `parent`. If you view a trace with these spans in a trace visualization tool, `child` will be nested under `parent`.
### Add attributes to a span 
[Attributes](https://opentelemetry.io/docs/concepts/signals/traces/#attributes) let you attach key/value pairs to a [span](https://opentelemetry.io/docs/concepts/signals/traces/#spans) so it carries more information about the current operation that it’s tracking.
You can use `set_attribute` to add a single attribute to a span:

```
require "opentelemetry/sdk"
current_span = OpenTelemetry::Trace.current_span
current_span.set_attribute("animals", ["elephant", "tiger"])

```

You can use `add_attributes` to add a map of attributes:

```
require "opentelemetry/sdk"
current_span = OpenTelemetry::Trace.current_span
current_span.add_attributes({
  "my.cool.attribute" => "a value",
  "my.first.name" => "Oscar"

```

You can also add attributes to a span as [it’s being created](https://opentelemetry.io/docs/languages/ruby/instrumentation/#creating-new-spans):

```
require "opentelemetry/sdk"
MyAppTracer.in_span('foo', attributes: { "hello" => "world", "some.number" => 1024 }) do |span|
  #  do stuff with the span

```

> ⚠ Spans are thread safe data structures that require locks when they are mutated. You should therefore avoid calling `set_attribute` multiple times and instead assign attributes in bulk with a Hash, either during span creation or with `add_attributes` on an existing span.
> ⚠ Sampling decisions happen at the moment of span creation. If your sampler considers span attributes when deciding to sample a span, then you _must_ pass those attributes as part of span creation. Any attributes added after creation will not be seen by the sampler, because the sampling decision has already been made.
### Add semantic attributes 
[Semantic Attributes](https://opentelemetry.io/docs/specs/semconv/general/trace/) are pre-defined [Attributes](https://opentelemetry.io/docs/concepts/signals/traces/#attributes) that are well-known naming conventions for common kinds of data. Using Semantic Attributes lets you normalize this kind of information across your systems.
To use Semantic Attributes in Ruby, add the appropriate gem:

```
gem install opentelemetry-semantic_conventions

```

Then you can use it in code:

```
require 'opentelemetry/sdk'
require 'opentelemetry/semantic_conventions'
current_span = OpenTelemetry::Trace.current_span
current_span.add_attributes({
  OpenTelemetry::SemanticConventions::Trace::HTTP_METHOD => "GET",
  OpenTelemetry::SemanticConventions::Trace::HTTP_URL => "https://opentelemetry.io/",

```

### Add Span Events 
A [span event](https://opentelemetry.io/docs/concepts/signals/traces/#span-events) is a human-readable message on a span that represents “something happening” during it’s lifetime. For example, imagine a function that requires exclusive access to a resource that is under a mutex. An event could be created at two points - once, when we try to gain access to the resource, and another when we acquire the mutex.

```
require "opentelemetry/sdk"
span = OpenTelemetry::Trace.current_span
span.add_event("Acquiring lock")
if mutex.try_lock
  span.add_event("Got lock, doing work...")
  # some code here
  span.add_event("Releasing lock")
  span.add_event("Lock already in use")

```

A useful characteristic of events is that their timestamps are displayed as offsets from the beginning of the span, allowing you to easily see how much time elapsed between them.
Events can also have attributes of their own e.g.

```
require "opentelemetry/sdk"
span.add_event("Cancelled wait due to external signal", attributes: {
  "pid" => 4328,
  "signal" => "SIGHUP"

```

### Add Span Links 
A [span](https://opentelemetry.io/docs/concepts/signals/traces/#spans) can be created with zero or more [span links](https://opentelemetry.io/docs/concepts/signals/traces/#span-links) that causally link it to another span. A link needs a [span context](https://opentelemetry.io/docs/concepts/signals/traces/#span-context) to be created.

```
require "opentelemetry/sdk"
span_to_link_from = OpenTelemetry::Trace.current_span
link = OpenTelemetry::Trace::Link.new(span_to_link_from.context)
MyAppTracer.in_span("new-span", links: [link])
  # do something that 'new_span' tracks
  # The link in 'new_span' casually associated it with the span it's linked from,
  # but it is not necessarily a child span.

```

Span Links are often used to link together different traces that are related in some way, such as a long-running task that calls into sub-tasks asynchronously.
Links can also be created with additional attributes:

```
link = OpenTelemetry::Trace::Link.new(span_to_link_from.context, attributes: { "some.attribute" => 12 })

```

### Set span status 
A [Status](https://opentelemetry.io/docs/concepts/signals/traces/#span-status) can be set on a [Span](https://opentelemetry.io/docs/concepts/signals/traces/#spans), typically used to specify that a Span has not completed successfully - `Error`. By default, all spans are `Unset`, which means a span completed without error. The `Ok` status is reserved for when you need to explicitly mark a span as successful rather than stick with the default of `Unset` (i.e., “without error”).
The status can be set at any time before the span is finished.

```
require "opentelemetry/sdk"
current_span = OpenTelemetry::Trace.current_span
  1/0 # something that obviously fails
rescue
  current_span.status = OpenTelemetry::Trace::Status.error("error message here!")

```

### Record exceptions in spans 
It can be a good idea to record exceptions when they happen. It’s recommended to do this in conjunction with [setting span status](https://opentelemetry.io/docs/languages/ruby/instrumentation/#set-span-status).

```
require "opentelemetry/sdk"
current_span = OpenTelemetry::Trace.current_span
  1/0 # something that obviously fails
rescue Exception => e
  current_span.status = OpenTelemetry::Trace::Status.error("error message here!")
  current_span.record_exception(e)

```

Recording an exception creates a [Span Event](https://opentelemetry.io/docs/concepts/signals/traces/#span-events) on the current span with a stack trace as an attribute on the span event.
Exceptions can also be recorded with additional attributes:

```
current_span.record_exception(ex, attributes: { "some.attribute" => 12 })

```

### Context Propagation 
> Distributed Tracing tracks the progression of a single Request, called a Trace, as it is handled by Services that make up an Application. A Distributed Trace transverses process, network and security boundaries. [Glossary](https://opentelemetry.io/docs/concepts/glossary/)
This requires _context propagation_ , a mechanism where identifiers for a trace are sent to remote processes.
> ℹ The OpenTelemetry Ruby SDK will take care of context propagation as long as your service is leveraging auto-instrumented libraries. Please refer to the [README](https://github.com/open-telemetry/opentelemetry-ruby-contrib/tree/main/instrumentation) for more details.
In order to propagate trace context over the wire, a propagator must be registered with the OpenTelemetry SDK. The W3 TraceContext and Baggage propagators are configured by default. Operators may override this value by setting `OTEL_PROPAGATORS` environment variable to a comma separated list of [propagators](https://github.com/open-telemetry/opentelemetry-ruby/tree/main/propagator). For example, to add B3 propagation, set `OTEL_PROPAGATORS` to the complete list of propagation formats you wish to support:

```
export OTEL_PROPAGATORS=tracecontext,baggage,b3

```

Propagators other than `tracecontext` and `baggage` must be added as gem dependencies to your Gemfile, e.g.:

```
gem 'opentelemetry-propagator-b3'

```

## Metrics 
The metrics API & SDK are currently under development.
## Logs 
The logs API & SDK are currently under development.
To capture application logs emitted via Ruby’s standard `Logger`, install the logger instrumentation package:

```
gem install opentelemetry-instrumentation-logger

```

After installing, ensure you have configured an exporter/endpoint that supports logs for example, via the exporter configuration referenced in the next section.
## Next Steps 
You’ll also want to configure an appropriate exporter to [export your telemetry data](https://opentelemetry.io/docs/languages/ruby/exporters/) to one or more telemetry backends.
## Feedback
Was this page helpful?
Yes No
Thank you. Your feedback is appreciated!
Please let us know [how we can improve this page](https://github.com/open-telemetry/opentelemetry.io/issues/new?template=PAGE_FEEDBACK.yml&title=\[Page+feedback\]%3A+ADD+A+SUMMARY+OF+YOUR+FEEDBACK+HERE). Your feedback is appreciated!
Last modified July 9, 2026: [docs: clarify Ruby in_span exception handling (#10623) (9b901b70)](https://github.com/open-telemetry/opentelemetry.io/commit/9b901b70804517d7b2fdbfebabb408d89ef4ed42)
