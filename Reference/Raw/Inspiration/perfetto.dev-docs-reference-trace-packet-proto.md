# TracePacket
TracePacket is the root object of a Perfetto trace. A Perfetto trace is a linear sequence of TracePacket(s).
The tracing service guarantees that all TracePacket(s) written by a given TraceWriter are seen in-order, without gaps or duplicates. If, for any reason, a TraceWriter sequence becomes invalid, no more packets are returned to the Consumer (or written into the trace file). TracePacket(s) written by different TraceWriter(s), hence even different data sources, can be seen in arbitrary order. The consumer can re-establish a total order, if interested, using the packet timestamps, after having synchronized the different clocks onto a global clock.
The tracing service is agnostic of the content of TracePacket, with the exception of few fields (e.g.. trusted_*, trace_config) that are written by the service itself.
See the [Buffers and Dataflow](https://perfetto.dev/docs/concepts/buffers) doc for details.
Defined in [trace_packet.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/trace_packet.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| timestamp  | uint64  | The timestamp of the TracePacket.By default this timestamps refers to the trace clock (CLOCK_BOOTTIME on Android). It can be overridden using a different timestamp_clock_id.The clock domain definition in ClockSnapshot can also override:- The unit (default: 1ns).- The absolute vs delta encoding (default: absolute timestamp).  |  
| timestamp_clock_id  | uint32  | Specifies the ID of the clock used for the TracePacket `timestamp`. Can be one of the built-in types from ClockSnapshot::BuiltinClocks, or a producer-defined clock id.If unspecified and if no default per-sequence value has been provided via TracePacketDefaults, it defaults to BuiltinClocks::BOOTTIME.  |  
| track_event  | == STABLE PUBLIC API: TrackEvent == TrackEvent is the stable, extensible API for recording trace events.See docs/instrumentation/track-events.md for details.  |  
| track_descriptor  | [TrackDescriptor](https://perfetto.dev/docs/reference/trace-packet-proto#TrackDescriptor)  |  
| generic_kernel_task_state_event  | [GenericKernelTaskStateEvent](https://perfetto.dev/docs/reference/trace-packet-proto#GenericKernelTaskStateEvent)  | == STABLE PUBLIC API: GENERIC KERNEL EVENTS == Stable API for OS-level and hardware events from non-ftrace data sources.  |  
| generic_kernel_cpu_freq_event  | [GenericKernelCpuFrequencyEvent](https://perfetto.dev/docs/reference/trace-packet-proto#GenericKernelCpuFrequencyEvent)  |  
| generic_kernel_task_rename_event  | [GenericKernelTaskRenameEvent](https://perfetto.dev/docs/reference/trace-packet-proto#GenericKernelTaskRenameEvent)  |  
| generic_kernel_process_tree  | [GenericKernelProcessTree](https://perfetto.dev/docs/reference/trace-packet-proto#GenericKernelProcessTree)  |  
| generic_gpu_frequency_event  | [GenericGpuFrequencyEvent](https://perfetto.dev/docs/reference/trace-packet-proto#GenericGpuFrequencyEvent)  |  
| process_tree  | IDs up to 15 are reserved. They take only one byte to encode their preamble so should be used for frequent events.  |  
| track_event_range_of_interest  | [TrackEventRangeOfInterest](https://perfetto.dev/docs/reference/trace-packet-proto#TrackEventRangeOfInterest)  |  
| process_stats  |  
| inode_file_map  |  
| chrome_events  | [ChromeEventBundle](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeEventBundle)  |  
| clock_snapshot  | [ClockSnapshot](https://perfetto.dev/docs/reference/trace-packet-proto#ClockSnapshot)  |  
| sys_stats  |  
| trace_uuid  |  
| trace_config  |  
| ftrace_stats  |  
| trace_stats  |  
| experimental_tracing_v2_producer_stats  | [ExperimentalTracingV2ProducerStats](https://perfetto.dev/docs/reference/trace-packet-proto#ExperimentalTracingV2ProducerStats)  |  
| profile_packet  | [ProfilePacket](https://perfetto.dev/docs/reference/trace-packet-proto#ProfilePacket)  |  
| streaming_allocation  | [StreamingAllocation](https://perfetto.dev/docs/reference/trace-packet-proto#StreamingAllocation)  |  
| streaming_free  | [StreamingFree](https://perfetto.dev/docs/reference/trace-packet-proto#StreamingFree)  |  
| battery  | [BatteryCounters](https://perfetto.dev/docs/reference/trace-packet-proto#BatteryCounters)  |  
| power_rails  |  
| android_log  | [AndroidLogPacket](https://perfetto.dev/docs/reference/trace-packet-proto#AndroidLogPacket)  |  
| system_info  |  
| trigger  |  
| chrome_trigger  | [ChromeTrigger](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeTrigger)  |  
| packages_list  |  
| chrome_benchmark_metadata  | [ChromeBenchmarkMetadata](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeBenchmarkMetadata)  |  
| perfetto_metatrace  | [PerfettoMetatrace](https://perfetto.dev/docs/reference/trace-packet-proto#PerfettoMetatrace)  |  
| chrome_metadata  | [ChromeMetadataPacket](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeMetadataPacket)  |  
| gpu_counter_event  | [GpuCounterEvent](https://perfetto.dev/docs/reference/trace-packet-proto#GpuCounterEvent)  |  
| gpu_render_stage_event  | [GpuRenderStageEvent](https://perfetto.dev/docs/reference/trace-packet-proto#GpuRenderStageEvent)  |  
| streaming_profile_packet  | [StreamingProfilePacket](https://perfetto.dev/docs/reference/trace-packet-proto#StreamingProfilePacket)  |  
| art_process_metadata  | [ArtProcessMetadata](https://perfetto.dev/docs/reference/trace-packet-proto#ArtProcessMetadata)  |  
| graphics_frame_event  | [GraphicsFrameEvent](https://perfetto.dev/docs/reference/trace-packet-proto#GraphicsFrameEvent)  |  
| vulkan_memory_event  | [VulkanMemoryEvent](https://perfetto.dev/docs/reference/trace-packet-proto#VulkanMemoryEvent)  |  
| gpu_log  |  
| vulkan_api_event  | [VulkanApiEvent](https://perfetto.dev/docs/reference/trace-packet-proto#VulkanApiEvent)  |  
| perf_sample  |  
| cpu_info  |  
| smaps_packet  |  
| service_event  | [TracingServiceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TracingServiceEvent)  |  
| concurrent_session_event  | [ConcurrentSessionEvent](https://perfetto.dev/docs/reference/trace-packet-proto#ConcurrentSessionEvent)  |  
| stack_sample  | Transport-neutral stack sampling (see profiling/stack_sample.proto).Independent of PerfSample.  |  
| initial_display_state  | [InitialDisplayState](https://perfetto.dev/docs/reference/trace-packet-proto#InitialDisplayState)  |  
| gpu_mem_total_event  | [GpuMemTotalEvent](https://perfetto.dev/docs/reference/trace-packet-proto#GpuMemTotalEvent)  |  
| memory_tracker_snapshot  | [MemoryTrackerSnapshot](https://perfetto.dev/docs/reference/trace-packet-proto#MemoryTrackerSnapshot)  |  
| android_energy_estimation_breakdown  | [AndroidEnergyEstimationBreakdown](https://perfetto.dev/docs/reference/trace-packet-proto#AndroidEnergyEstimationBreakdown)  |  
| ui_state  |  
| translation_table  | [TranslationTable](https://perfetto.dev/docs/reference/trace-packet-proto#TranslationTable)  |  
| android_game_intervention_list  | [AndroidGameInterventionList](https://perfetto.dev/docs/reference/trace-packet-proto#AndroidGameInterventionList)  |  
| statsd_atom  |  
| android_system_property  | [AndroidSystemProperty](https://perfetto.dev/docs/reference/trace-packet-proto#AndroidSystemProperty)  |  
| entity_state_residency  | [EntityStateResidency](https://perfetto.dev/docs/reference/trace-packet-proto#EntityStateResidency)  |  
| trace_provenance  | [TraceProvenance](https://perfetto.dev/docs/reference/trace-packet-proto#TraceProvenance)  |  
| protovms  |  
| trace_attributes  | [TraceAttributes](https://perfetto.dev/docs/reference/trace-packet-proto#TraceAttributes)  |  
| android_aflags  | [AndroidAflags](https://perfetto.dev/docs/reference/trace-packet-proto#AndroidAflags)  |  
| gpu_info  |  
| interrupt_info  | [InterruptInfo](https://perfetto.dev/docs/reference/trace-packet-proto#InterruptInfo)  |  
| module_symbols  | [ModuleSymbols](https://perfetto.dev/docs/reference/trace-packet-proto#ModuleSymbols)  | Only used in profile packets.  |  
| deobfuscation_mapping  | [DeobfuscationMapping](https://perfetto.dev/docs/reference/trace-packet-proto#DeobfuscationMapping)  |  
| process_descriptor  | [ProcessDescriptor](https://perfetto.dev/docs/reference/trace-packet-proto#ProcessDescriptor)  | Deprecated, use TrackDescriptor instead.  |  
| thread_descriptor  | [ThreadDescriptor](https://perfetto.dev/docs/reference/trace-packet-proto#ThreadDescriptor)  | Deprecated, use TrackDescriptor instead.  |  
| ftrace_events  | [FtraceEventBundle](https://perfetto.dev/docs/reference/trace-packet-proto#FtraceEventBundle)  | Events from the Linux kernel ftrace infrastructure.  |  
| synchronization_marker  | bytes  | This field is emitted at periodic intervals (~10s) and contains always the binary representation of the UUID {82477a76-b28d-42ba-81dc-33326d57a079}. This is used to be able to efficiently partition long traces without having to fully parse them.  |  
| compressed_packets  | bytes  | Zero or more proto encoded trace packets compressed using deflate.Each compressed_packets TracePacket (including the two field ids and sizes) should be less than 512KB.  |  
| zstd_compressed_packets  | bytes  | The zstd counterpart of `compressed_packets`.  |  
| extension_descriptor  | [ExtensionDescriptor](https://perfetto.dev/docs/reference/trace-packet-proto#ExtensionDescriptor)  | Data sources can extend the trace proto with custom extension protos (see docs/instrumentation/extensions.md). When they do that, the descriptor of their extension proto descriptor is serialized in this packet. This allows trace_processor to deserialize extended messages using reflection even if the extension proto is not checked in the Perfetto repo.  |  
| etw_events  | [EtwTraceEventBundle](https://perfetto.dev/docs/reference/trace-packet-proto#EtwTraceEventBundle)  | Events from the Windows etw infrastructure.  |  
| v8_js_code  |  
| v8_internal_code  | [V8InternalCode](https://perfetto.dev/docs/reference/trace-packet-proto#V8InternalCode)  |  
| v8_wasm_code  |  
| v8_reg_exp_code  |  
| v8_code_move  |  
| remote_clock_sync  | [RemoteClockSync](https://perfetto.dev/docs/reference/trace-packet-proto#RemoteClockSync)  | Clock synchronization with remote machines.  |  
| pixel_modem_events  | [PixelModemEvents](https://perfetto.dev/docs/reference/trace-packet-proto#PixelModemEvents)  |  
| pixel_modem_token_database  | [PixelModemTokenDatabase](https://perfetto.dev/docs/reference/trace-packet-proto#PixelModemTokenDatabase)  |  
| clone_snapshot_trigger  |  
| kernel_wakelock_data  | [KernelWakelockData](https://perfetto.dev/docs/reference/trace-packet-proto#KernelWakelockData)  |  
| cpu_per_uid_data  | [CpuPerUidData](https://perfetto.dev/docs/reference/trace-packet-proto#CpuPerUidData)  |  
| user_list  | [AndroidUserList](https://perfetto.dev/docs/reference/trace-packet-proto#AndroidUserList)  |  
| journald_event  | [SystemdJournaldEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SystemdJournaldEvent)  |  
| recovered_trace_info  | [RecoveredTraceInfo](https://perfetto.dev/docs/reference/trace-packet-proto#RecoveredTraceInfo)  | Injected into TracePacket by perfetto post-reboot recovery to record recovered trace metadata.  |  
| memcg_stats  | Values of the cgroup v2 memory controller, from the "linux.cgroup" data source.  |  
| for_testing  | This field is only used for testing.In previous versions of this proto this field had the id 268435455 This caused many problems:- protozero decoder does not handle field ids larger than 999.- old versions of protoc produce Java bindings with syntax errors when the field id is large enough.  |  
| trusted_uid  | int32  |  
| trusted_packet_sequence_id  | uint32  |  
| trusted_pid  | int32  | Trusted process id of the producer which generated this packet, written by the service.  |  
| interned_data  | Incrementally emitted interned data, valid only on the packet's sequence (packets with the same `trusted_packet_sequence_id`). The writer will usually emit new interned data in the same TracePacket that first refers to it (since the last reset of interning state). It may also be emitted proactively in advance of referring to them in later packets.  |  
| sequence_flags  | uint32  |  
| incremental_state_cleared  | bool  | DEPRECATED. Moved to SequenceFlags::SEQ_INCREMENTAL_STATE_CLEARED.  |  
| trace_packet_defaults  | [TracePacketDefaults](https://perfetto.dev/docs/reference/trace-packet-proto#TracePacketDefaults)  | Default values for fields of later TracePackets emitted on this packet's sequence (TracePackets with the same `trusted_packet_sequence_id`).It must be reemitted when incremental state is cleared (see `incremental_state_cleared`).Requires that any future packet emitted on the same sequence specifies the SEQ_NEEDS_INCREMENTAL_STATE flag.TracePacketDefaults always override the global defaults for any future packet on this sequence (regardless of SEQ_NEEDS_INCREMENTAL_STATE).  |  
| previous_packet_dropped  | uint32  | Set by the service if, for the current packet sequence (see `trusted_packet_sequence_id`), either:* this is the first packet, or * one or multiple packets were dropped since the last packet that the consumer read from the sequence. This can happen if chunks in the trace buffer are overridden before the consumer could read them when the trace is configured in ring buffer mode. 0 means not dropped, nonzero means dropped (so this stays compatible with the historical bool semantics). The value is a DataLossReason bitmask:DATA_LOSS_PRESENT (bit 0) is always set when there is a loss, and TraceBufferV2 additionally sets a bit identifying the cause. TraceBufferV1 and producer-signalled drops set the bare value 1 (DATA_LOSS_PRESENT), i.e.dropped with no specific cause attributed. When packet loss occurs, incrementally emitted data (including interned data) on the sequence should be considered invalid up until the next packet with SEQ_INCREMENTAL_STATE_CLEARED set.  |  
| first_packet_on_sequence  | bool  | Flag set by a producer (starting from SDK v29) if, for the current packet sequence (see `trusted_packet_sequence_id`), this is the first packet. This flag can be used for distinguishing the two situations when processing the trace:1. There are no prior events for the sequence because of data loss, e.g.due to ring buffer wrapping.2. There are no prior events for the sequence because it didn't start before this packet (= there's definitely no preceding data loss). Given that older SDK versions do not support this flag, this flag not being present for a particular sequence does not necessarily imply data loss.  |  
| machine_id  | uint32  | The machine ID for identifying trace packets in a multi-machine tracing session. Is emitted by the tracing service for producers running on a remote host (e.g. a VM guest). For more context: go/crosetto-vm-tracing.  |  
##  TrackEvent
NOTE: Full TrackEvent support in the client lib and chrome is WIP, thus these protos are still subject to change. Don't depend on them staying as they are.
Trace events emitted by client instrumentation library (TRACE_EVENT macros), which describe activity on a track, such as a thread or asynchronous event track. The track is specified using separate TrackDescriptor messages and referred to via the track's UUID.
A simple TrackEvent packet specifies a timestamp, category, name and type:
`trace_packet { timestamp: 1000 track_event { categories: ["my_cat"] name: "my_event" type: TYPE_INSTANT } }`
To associate an event with a custom track (e.g. a thread), the track is defined in a separate packet and referred to from the TrackEvent by its UUID:
`trace_packet { track_descriptor { track_uuid: 1234 name: "my_track" // Optionally, associate the track with a thread. thread_descriptor { pid: 10 tid: 10 .. } } }`
A pair of TYPE_SLICE_BEGIN and _END events form a slice on the track:
`trace_packet { timestamp: 1200 track_event { track_uuid: 1234 categories: ["my_cat"] name: "my_slice" type: TYPE_SLICE_BEGIN } } trace_packet { timestamp: 1400 track_event { track_uuid: 1234 type: TYPE_SLICE_END } }`
TrackEvents also support optimizations to reduce data repetition and encoded data size, e.g. through data interning (names, categories, ...) and delta encoding of timestamps/counters. For details, see the InternedData message. Further, default values for attributes of events on the same sequence (e.g. their default track association) can be emitted as part of a TrackEventDefaults message.
Defined in [track_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/track_event.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| category_iids  | uint64[]  | Names of categories of the event. In the client library, categories are a way to turn groups of individual events on or off.interned EventCategoryName.  |  
| categories  | string[]  | non-interned variant.  |  
| name_iid  | uint64  | interned EventName.  |  
| name  | string  | non-interned variant.  |  
| type  |  
| track_uuid  | uint64  | Identifies the track of the event. The default value may be overridden using TrackEventDefaults, e.g., to specify the track of the TraceWriter's sequence (in most cases sequence = one thread). If no value is specified here or in TrackEventDefaults, the TrackEvent will be associated with an implicit trace-global track (uuid 0). See TrackDescriptor::uuid.  |  
| counter_value  | int64  |  
| double_counter_value  | double  |  
| extra_counter_track_uuids  | uint64[]  | To encode counter values more efficiently, we support attaching additional counter values to a TrackEvent of any type. All values will share the same timestamp specified in the TracePacket. The value at extra_counter_values[N] is for the counter track referenced by extra_counter_track_uuids[N]. `extra_counter_track_uuids` may also be set via TrackEventDefaults. There should always be equal or more uuids than values. It is valid to set more uuids (e.g. via defaults) than values. If uuids are specified in TrackEventDefaults and a TrackEvent, the TrackEvent uuids override the default uuid list. For example, this allows snapshotting the thread time clock at each thread-track BEGIN and END event to capture the cpu time delta of a slice.  |  
| extra_counter_values  | int64[]  |  
| extra_double_counter_track_uuids  | uint64[]  | Counter snapshots using floating point instead of integer values.  |  
| extra_double_counter_values  | double[]  |  
| flow_ids_old  | uint64[]  | IDs of flows originating, passing through, or ending at this event.Flow IDs are global within a trace. A flow connects a sequence of TrackEvents within or across tracks, e.g.an input event may be handled on one thread but cause another event on a different thread - a flow between the two events can associate them. The direction of the flows between events is inferred from the events' timestamps. The earliest event with the same flow ID becomes the source of the flow. Any events thereafter are intermediate steps of the flow, until the flow terminates at the last event with the flow ID. Flows can also be explicitly terminated (see `terminating_flow_ids`), so that the same ID can later be reused for another flow.DEPRECATED. Only kept for backwards compatibility. Use `flow_ids`.  |  
| flow_ids  | fixed64[]  | TODO(b/204341740): replace "flow_ids_old" with "flow_ids" to reduce memory consumption.  |  
| terminating_flow_ids_old  | uint64[]  | List of flow ids which should terminate on this event, otherwise same as `flow_ids`.Any one flow ID should be either listed as part of `flow_ids` OR `terminating_flow_ids`, not both.DEPRECATED. Only kept for backwards compatibility. Use `terminating_flow_ids`.  |  
| terminating_flow_ids  | fixed64[]  | TODO(b/204341740): replace "terminating_flow_ids_old" with "terminating_flow_ids" to reduce memory consumption.  |  
| correlation_id  | uint64  | A 64-bit unsigned integer used as the correlation ID. Best for performance and compact traces if the identifier is naturally numerical or can be easily mapped to one by the trace producer.  |  
| correlation_id_str  | string  | A string value used as the correlation ID. Offers maximum flexibility for human-readable or complex identifiers (e.g., GUIDs). Note: Using many unique, long strings may increase trace size. For frequently repeated string identifiers, consider 'correlation_id_string_iid'.  |  
| correlation_id_str_iid  | uint64  | An interned string identifier (an IID) for correlation. This 64-bit ID refers to a string defined in the 'correlation_id_str' field within the packet sequence's InternedData. This approach combines the descriptiveness and uniqueness of strings with the efficiency of integer IDs for storage and comparison, especially for identifiers that repeat across many events.  |  
| callstack  | [InlineCallstack](https://perfetto.dev/docs/reference/trace-packet-proto#TrackEvent.InlineCallstack)  | Inline callstack data. Use this for simplicity when interning is not needed (e.g., for unique callstacks or when trace size is not critical).  |  
| callstack_iid  | uint64  | Reference to interned Callstack (see InternedData.callstacks).This is the efficient option when callstacks are repeated. Note: iids _always_ start from 1. A value of 0 is considered "not set".  |  
| callstack_weight  | double  | An optional additive value attributed to this callstack occurrence. When present, weighted callstack aggregations only include occurrences which have this field set; they do not mix weighted and unweighted samples.Consumers can use sample count as a separate fallback measure when no weighted occurrences are available.  |  
| debug_annotations  | [DebugAnnotation[]](https://perfetto.dev/docs/reference/trace-packet-proto#DebugAnnotation)  | Debug annotations associated with this event. These are arbitrary key-value pairs that can be used to attach additional information to the event.See DebugAnnotation message for details on supported value types. For example, debug annotations can be used to attach a URL or resource identifier to a network request event. Arrays, dictionaries and full nested structures (e.g. arrays of dictionaries of dictionaries) are supported.  |  
| task_execution  | [TaskExecution](https://perfetto.dev/docs/reference/trace-packet-proto#TaskExecution)  | Typed event arguments:  |  
| log_message  |  
| cc_scheduler_state  | [ChromeCompositorSchedulerState](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeCompositorSchedulerState)  |  
| chrome_user_event  | [ChromeUserEvent](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeUserEvent)  |  
| chrome_keyed_service  | [ChromeKeyedService](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeKeyedService)  |  
| chrome_legacy_ipc  | [ChromeLegacyIpc](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeLegacyIpc)  |  
| chrome_histogram_sample  | [ChromeHistogramSample](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeHistogramSample)  |  
| chrome_latency_info  | [ChromeLatencyInfo](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeLatencyInfo)  |  
| chrome_frame_reporter  | [ChromeFrameReporter](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeFrameReporter)  | DEPRECATED. Only kept for backwards compatibility. Use the  |  
| chrome_application_state_info  | [ChromeApplicationStateInfo](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeApplicationStateInfo)  |  
| chrome_renderer_scheduler_state  | [ChromeRendererSchedulerState](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeRendererSchedulerState)  |  
| chrome_window_handle_event_info  | [ChromeWindowHandleEventInfo](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeWindowHandleEventInfo)  |  
| chrome_content_settings_event_info  | [ChromeContentSettingsEventInfo](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeContentSettingsEventInfo)  |  
| chrome_active_processes  | [ChromeActiveProcesses](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeActiveProcesses)  |  
| screenshot  |  
| source_location  | [SourceLocation](https://perfetto.dev/docs/reference/trace-packet-proto#SourceLocation)  | Non-interned field.  |  
| source_location_iid  | uint64  | Interned field.  |  
| chrome_message_pump  | [ChromeMessagePump](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeMessagePump)  |  
| chrome_mojo_event_info  | [ChromeMojoEventInfo](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeMojoEventInfo)  |  
| timestamp_delta_us  | int64  | Delta timestamp value since the last TrackEvent or ThreadDescriptor. To calculate the absolute timestamp value, sum up all delta values of the preceding TrackEvents since the last ThreadDescriptor and add the sum to the `reference_timestamp` in ThreadDescriptor. This value should always be positive.  |  
| timestamp_absolute_us  | int64  | Absolute value (e.g. a manually specified timestamp in the macro).This is a one-off value that does not affect delta timestamp computation in subsequent TrackEvents.  |  
| thread_time_delta_us  | int64  | Delta timestamp value since the last TrackEvent or ThreadDescriptor. To calculate the absolute timestamp value, sum up all delta values of the preceding TrackEvents since the last ThreadDescriptor and add the sum to the `reference_timestamp` in ThreadDescriptor. This value should always be positive.  |  
| thread_time_absolute_us  | int64  | This is a one-off absolute value that does not affect delta timestamp computation in subsequent TrackEvents.  |  
| thread_instruction_count_delta  | int64  | Same encoding as `thread_time` field above.  |  
| thread_instruction_count_absolute  | int64  |  
| legacy_event  |  
###  TrackEvent.Type
Type of the TrackEvent (required if `phase` in LegacyEvent is not set).
Defined in [track_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/track_event.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| TYPE_UNSPECIFIED  | 0  |  
| TYPE_SLICE_BEGIN  | 1  | Slice events are events that have a begin and end timestamp, i.e. a duration. They can be nested similar to a callstack: If, on the same track, event B begins after event A, but before A ends, B is a child event of A and will be drawn as a nested event underneath A in the UI.Note that child events should always end before their parents (e.g. B before A). Each slice event is formed by a pair of BEGIN + END events. The END event does not need to repeat any TrackEvent fields it has in common with its corresponding BEGIN event. Arguments and debug annotations of the BEGIN + END pair will be merged during trace import. Note that we deliberately chose not to support COMPLETE events (which would specify a duration directly) since clients would need to delay writing them until the slice is completed, which can result in reordered events in the trace and loss of unfinished events at the end of a trace.  |  
| TYPE_SLICE_END  | 2  |  
| TYPE_INSTANT  | 3  | Instant events are nestable events without duration. They can be children of slice events on the same track.  |  
| TYPE_COUNTER  | 4  | Event that provides a value for a counter track. `track_uuid` should refer to a counter track and `counter_value` set to the new value. Note that most other TrackEvent fields (e.g. categories, name, ..) are not supported for TYPE_COUNTER events. See also CounterDescriptor.  |  
| TYPE_STATE  | 5  | Event that provides a state value update for a state track. Think of this as a symbolic counter (a TYPE_COUNTER with literals rather then numbers).`track_uuid` should refer to a state track, and the state value update is carried in the `state` field. An empty or unset state field indicates "no state" / "idle". For more details, see [RFC-0023](https://github.com/google/perfetto/discussions/5549).  |  
###  TrackEvent.InlineCallstack
Inline callstack for TrackEvents when interning is not needed. This is a simplified version of the profiling Callstack/Frame messages, designed for cases where trace size is not critical or callstacks are unique.
Use this for simple callstacks with function names and source locations. For binary/library information (mappings, build IDs, relative PCs), use interned callstacks via callstack_iid instead.
Defined in [track_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/track_event.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| frames  | Frames of this callstack, ordered from bottom (outermost) to top (innermost). For example, if main() calls foo() which calls bar(), the frames would be: [main, foo, bar]  |  
###  TrackEvent.InlineCallstack.Frame
Frame within an inline callstack.
Defined in [track_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/track_event.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| function_name  | string  | Function name, e.g., "malloc" or "std::vector::push_back"  |  
| source_file  | string  | Optional: Source file path, e.g., "/src/foo.cc"  |  
| line_number  | uint32  | Optional: Line number in the source file  |  
###  DebugAnnotation
Proto representation of untyped key/value annotations provided in TRACE_EVENT macros. Users of the Perfetto SDK should prefer to use the perfetto::TracedValue API to fill these protos, rather than filling them manually.
Debug annotations are intended for debug use and are not considered a stable API of the trace contents. Trace-based metrics that use debug annotation values are prone to breakage, so please rely on typed TrackEvent fields for these instead.
DebugAnnotations support nested arrays and dictionaries. Each entry is encoded as a single DebugAnnotation message. Only dictionary entries set the "name" field. The TrackEvent message forms an implicit root dictionary.
Example TrackEvent with nested annotations: track_event { debug_annotations { name: "foo" dict_entries { name: "a" bool_value: true } dict_entries { name: "b" int_value: 123 } } debug_annotations { name: "bar" array_values { string_value: "hello" } array_values { string_value: "world" } } } Reserved ID: 15
Defined in [debug_annotation.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/debug_annotation.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name_iid  | uint64  | interned DebugAnnotationName.  |  
| name  | string  | non-interned variant.  |  
| bool_value  | bool  |  
| uint_value  | uint64  |  
| int_value  | int64  |  
| double_value  | double  |  
| pointer_value  | uint64  | Pointers are stored in a separate type as the JSON output treats them differently from other uint64 values.  |  
| nested_value  | Deprecated. Use dict_entries / array_values instead.  |  
| legacy_json_value  | string  | Legacy instrumentation may not support conversion of nested data to NestedValue yet.  |  
| string_value  | string  | interned and non-interned variants of strings.  |  
| string_value_iid  | uint64  | Corresponds to `debug_annotation_string_values` field in InternedData.  |  
| proto_type_name  | string  |  
| proto_type_name_iid  | uint64  | interned DebugAnnotationValueTypeName.  |  
| proto_value  | bytes  |  
| dict_entries  | [DebugAnnotation[]](https://perfetto.dev/docs/reference/trace-packet-proto#DebugAnnotation)  |  
| array_values  | [DebugAnnotation[]](https://perfetto.dev/docs/reference/trace-packet-proto#DebugAnnotation)  |  
###  DebugAnnotation.NestedValue
Deprecated legacy way to use nested values. Only kept for backwards-compatibility in TraceProcessor. May be removed in the future - code filling protos should use `dict_entries` and `array_values` instead.
Defined in [debug_annotation.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/debug_annotation.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| nested_type  |  
| dict_keys  | string[]  |  
| dict_values  |  
| array_values  |  
| int_value  | int64  |  
| double_value  | double  |  
| bool_value  | bool  |  
| string_value  | string  |  
###  DebugAnnotation.NestedValue.NestedType
Defined in [debug_annotation.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/debug_annotation.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| UNSPECIFIED  | 0  | leaf value.  |  
| DICT  | 1  |  
| ARRAY  | 2  |  
###  TaskExecution
TrackEvent arguments describing the execution of a task.
Defined in [task_execution.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/task_execution.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| posted_from_iid  | uint64  | Source location that the task was posted from.interned SourceLocation.  |  
###  LogMessage
Defined in [log_message.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/log_message.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| source_location_iid  | uint64  | interned SourceLocation.  |  
| body_iid  | uint64  | interned LogMessageBody.  |  
| prio  |  
###  LogMessage.Priority
Defined in [log_message.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/log_message.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| PRIO_UNSPECIFIED  | 0  |  
| PRIO_UNUSED  | 1  |  
| PRIO_VERBOSE  | 2  |  
| PRIO_DEBUG  | 3  |  
| PRIO_INFO  | 4  |  
| PRIO_WARN  | 5  |  
| PRIO_ERROR  | 6  |  
| PRIO_FATAL  | 7  |  
###  ChromeCompositorSchedulerState
Defined in [chrome_compositor_scheduler_state.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/chrome_compositor_scheduler_state.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| state_machine  | [ChromeCompositorStateMachine](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeCompositorStateMachine)  |  
| observing_begin_frame_source  | bool  |  
| begin_impl_frame_deadline_task  | bool  |  
| pending_begin_frame_task  | bool  |  
| skipped_last_frame_missed_exceeded_deadline  | bool  |  
| inside_action  | [ChromeCompositorSchedulerAction](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeCompositorSchedulerAction)  |  
| deadline_mode  | [BeginImplFrameDeadlineMode](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeCompositorSchedulerState.BeginImplFrameDeadlineMode)  |  
| deadline_us  | int64  |  
| deadline_scheduled_at_us  | int64  |  
| now_us  | int64  |  
| now_to_deadline_delta_us  | int64  |  
| now_to_deadline_scheduled_at_delta_us  | int64  |  
| begin_impl_frame_args  | [BeginImplFrameArgs](https://perfetto.dev/docs/reference/trace-packet-proto#BeginImplFrameArgs)  |  
| begin_frame_observer_state  | [BeginFrameObserverState](https://perfetto.dev/docs/reference/trace-packet-proto#BeginFrameObserverState)  |  
| begin_frame_source_state  | [BeginFrameSourceState](https://perfetto.dev/docs/reference/trace-packet-proto#BeginFrameSourceState)  |  
| compositor_timing_history  | [CompositorTimingHistory](https://perfetto.dev/docs/reference/trace-packet-proto#CompositorTimingHistory)  |  
###  ChromeCompositorStateMachine
Describes the current values stored in the Chrome Compositor state machine.
Defined in [chrome_compositor_scheduler_state.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/chrome_compositor_scheduler_state.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| major_state  |  
| minor_state  |  
###  ChromeCompositorStateMachine.MajorState
Defined in [chrome_compositor_scheduler_state.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/chrome_compositor_scheduler_state.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| next_action  | [ChromeCompositorSchedulerAction](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeCompositorSchedulerAction)  |  
| begin_impl_frame_state  | [BeginImplFrameState](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeCompositorStateMachine.MajorState.BeginImplFrameState)  |  
| begin_main_frame_state  | [BeginMainFrameState](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeCompositorStateMachine.MajorState.BeginMainFrameState)  |  
| layer_tree_frame_sink_state  | [LayerTreeFrameSinkState](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeCompositorStateMachine.MajorState.LayerTreeFrameSinkState)  |  
| forced_redraw_state  | [ForcedRedrawOnTimeoutState](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeCompositorStateMachine.MajorState.ForcedRedrawOnTimeoutState)  |  
###  ChromeCompositorSchedulerAction
Describes Chrome's Compositor scheduler's current state and associated variables.
These protos and enums were adapted from the corresponding original JSON trace event for the scheduler state. In contrast to the JSON, we use strongly typed enum values instead of strings for many fields, and microsecond-granularity timestamps.
The original format was generated in JSON by the code at [https://cs.chromium.org/chromium/src/cc/scheduler/scheduler.cc?l=870&rcl=5e15eabc9c0eec8daf94fdf78e93f13b6e3b63dd](https://cs.chromium.org/chromium/src/cc/scheduler/scheduler.cc?l=870&rcl=5e15eabc9c0eec8daf94fdf78e93f13b6e3b63dd)
And is now generated as protozero: <https://cs.chromium.org/chromium/src/cc/scheduler/scheduler.cc?q=Scheduler::AsPro>
All non-delta-timestamps are absolute CLOCK_MONOTONIC timestamps.
Defined in [chrome_compositor_scheduler_state.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/chrome_compositor_scheduler_state.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| CC_SCHEDULER_ACTION_UNSPECIFIED  | 0  |  
| CC_SCHEDULER_ACTION_NONE  | 1  |  
| CC_SCHEDULER_ACTION_SEND_BEGIN_MAIN_FRAME  | 2  |  
| CC_SCHEDULER_ACTION_COMMIT  | 3  |  
| CC_SCHEDULER_ACTION_ACTIVATE_SYNC_TREE  | 4  |  
| CC_SCHEDULER_ACTION_DRAW_IF_POSSIBLE  | 5  |  
| CC_SCHEDULER_ACTION_DRAW_FORCED  | 6  |  
| CC_SCHEDULER_ACTION_DRAW_ABORT  | 7  |  
| CC_SCHEDULER_ACTION_BEGIN_LAYER_TREE_FRAME_SINK_CREATION  | 8  |  
| CC_SCHEDULER_ACTION_PREPARE_TILES  | 9  |  
| CC_SCHEDULER_ACTION_INVALIDATE_LAYER_TREE_FRAME_SINK  | 10  |  
| CC_SCHEDULER_ACTION_PERFORM_IMPL_SIDE_INVALIDATION  | 11  |  
| CC_SCHEDULER_ACTION_NOTIFY_BEGIN_MAIN_FRAME_NOT_EXPECTED_UNTIL  | 12  |  
| CC_SCHEDULER_ACTION_NOTIFY_BEGIN_MAIN_FRAME_NOT_EXPECTED_SOON  | 13  |  
###  ChromeCompositorStateMachine.MajorState.BeginImplFrameState
Defined in [chrome_compositor_scheduler_state.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/chrome_compositor_scheduler_state.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| BEGIN_IMPL_FRAME_UNSPECIFIED  | 0  |  
| BEGIN_IMPL_FRAME_IDLE  | 1  |  
| BEGIN_IMPL_FRAME_INSIDE_BEGIN_FRAME  | 2  |  
| BEGIN_IMPL_FRAME_INSIDE_DEADLINE  | 3  |  
###  ChromeCompositorStateMachine.MajorState.BeginMainFrameState
Defined in [chrome_compositor_scheduler_state.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/chrome_compositor_scheduler_state.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| BEGIN_MAIN_FRAME_UNSPECIFIED  | 0  |  
| BEGIN_MAIN_FRAME_IDLE  | 1  |  
| BEGIN_MAIN_FRAME_SENT  | 2  |  
| BEGIN_MAIN_FRAME_READY_TO_COMMIT  | 3  |  
###  ChromeCompositorStateMachine.MajorState.LayerTreeFrameSinkState
Defined in [chrome_compositor_scheduler_state.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/chrome_compositor_scheduler_state.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| LAYER_TREE_FRAME_UNSPECIFIED  | 0  |  
| LAYER_TREE_FRAME_NONE  | 1  |  
| LAYER_TREE_FRAME_ACTIVE  | 2  |  
| LAYER_TREE_FRAME_CREATING  | 3  |  
| LAYER_TREE_FRAME_WAITING_FOR_FIRST_COMMIT  | 4  |  
| LAYER_TREE_FRAME_WAITING_FOR_FIRST_ACTIVATION  | 5  |  
###  ChromeCompositorStateMachine.MajorState.ForcedRedrawOnTimeoutState
Defined in [chrome_compositor_scheduler_state.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/chrome_compositor_scheduler_state.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| FORCED_REDRAW_UNSPECIFIED  | 0  |  
| FORCED_REDRAW_IDLE  | 1  |  
| FORCED_REDRAW_WAITING_FOR_COMMIT  | 2  |  
| FORCED_REDRAW_WAITING_FOR_ACTIVATION  | 3  |  
| FORCED_REDRAW_WAITING_FOR_DRAW  | 4  |  
###  ChromeCompositorStateMachine.MinorState
Defined in [chrome_compositor_scheduler_state.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/chrome_compositor_scheduler_state.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| commit_count  | int32  |  
| current_frame_number  | int32  |  
| last_frame_number_submit_performed  | int32  |  
| last_frame_number_draw_performed  | int32  |  
| last_frame_number_begin_main_frame_sent  | int32  |  
| did_draw  | bool  |  
| did_send_begin_main_frame_for_current_frame  | bool  |  
| did_notify_begin_main_frame_not_expected_until  | bool  |  
| did_notify_begin_main_frame_not_expected_soon  | bool  |  
| wants_begin_main_frame_not_expected  | bool  |  
| did_commit_during_frame  | bool  |  
| did_invalidate_layer_tree_frame_sink  | bool  |  
| did_perform_impl_side_invalidaion  | bool  |  
| did_prepare_tiles  | bool  |  
| consecutive_checkerboard_animations  | int32  |  
| pending_submit_frames  | int32  |  
| submit_frames_with_current_layer_tree_frame_sink  | int32  |  
| needs_redraw  | bool  |  
| needs_prepare_tiles  | bool  |  
| needs_begin_main_frame  | bool  |  
| needs_one_begin_impl_frame  | bool  |  
| visible  | bool  |  
| begin_frame_source_paused  | bool  |  
| can_draw  | bool  |  
| resourceless_draw  | bool  |  
| has_pending_tree  | bool  |  
| pending_tree_is_ready_for_activation  | bool  |  
| active_tree_needs_first_draw  | bool  |  
| active_tree_is_ready_to_draw  | bool  |  
| did_create_and_initialize_first_layer_tree_frame_sink  | bool  |  
| tree_priority  |  
| scroll_handler_state  |  
| critical_begin_main_frame_to_activate_is_fast  | bool  |  
| main_thread_missed_last_deadline  | bool  |  
| video_needs_begin_frames  | bool  |  
| defer_begin_main_frame  | bool  |  
| last_commit_had_no_updates  | bool  |  
| did_draw_in_last_frame  | bool  |  
| did_submit_in_last_frame  | bool  |  
| needs_impl_side_invalidation  | bool  |  
| current_pending_tree_is_impl_side  | bool  |  
| previous_pending_tree_was_impl_side  | bool  |  
| processing_animation_worklets_for_active_tree  | bool  |  
| processing_animation_worklets_for_pending_tree  | bool  |  
| processing_paint_worklets_for_pending_tree  | bool  |  
###  ChromeCompositorStateMachine.MinorState.TreePriority
Defined in [chrome_compositor_scheduler_state.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/chrome_compositor_scheduler_state.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| TREE_PRIORITY_UNSPECIFIED  | 0  |  
| TREE_PRIORITY_SAME_PRIORITY_FOR_BOTH_TREES  | 1  |  
| TREE_PRIORITY_SMOOTHNESS_TAKES_PRIORITY  | 2  |  
| TREE_PRIORITY_NEW_CONTENT_TAKES_PRIORITY  | 3  |  
###  ChromeCompositorStateMachine.MinorState.ScrollHandlerState
Defined in [chrome_compositor_scheduler_state.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/chrome_compositor_scheduler_state.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| SCROLL_HANDLER_UNSPECIFIED  | 0  |  
| SCROLL_AFFECTS_SCROLL_HANDLER  | 1  |  
| SCROLL_DOES_NOT_AFFECT_SCROLL_HANDLER  | 2  |  
###  ChromeCompositorSchedulerState.BeginImplFrameDeadlineMode
Defined in [chrome_compositor_scheduler_state.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/chrome_compositor_scheduler_state.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| DEADLINE_MODE_UNSPECIFIED  | 0  |  
| DEADLINE_MODE_NONE  | 1  |  
| DEADLINE_MODE_IMMEDIATE  | 2  |  
| DEADLINE_MODE_REGULAR  | 3  |  
| DEADLINE_MODE_LATE  | 4  |  
| DEADLINE_MODE_BLOCKED  | 5  |  
###  BeginImplFrameArgs
Defined in [chrome_compositor_scheduler_state.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/chrome_compositor_scheduler_state.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| updated_at_us  | int64  |  
| finished_at_us  | int64  |  
| state  |  
| current_args  | [BeginFrameArgs](https://perfetto.dev/docs/reference/trace-packet-proto#BeginFrameArgs)  | Only set if `state` is BEGIN_FRAME_FINISHED.  |  
| last_args  | [BeginFrameArgs](https://perfetto.dev/docs/reference/trace-packet-proto#BeginFrameArgs)  | Only set if `state` is BEGIN_FRAME_USING.  |  
| timestamps_in_us  |  
###  BeginImplFrameArgs.State
Defined in [chrome_compositor_scheduler_state.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/chrome_compositor_scheduler_state.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| BEGIN_FRAME_FINISHED  | 0  |  
| BEGIN_FRAME_USING  | 1  |  
###  BeginFrameArgs
Defined in [chrome_compositor_scheduler_state.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/chrome_compositor_scheduler_state.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| type  | [BeginFrameArgsType](https://perfetto.dev/docs/reference/trace-packet-proto#BeginFrameArgs.BeginFrameArgsType)  |  
| source_id  | uint64  |  
| sequence_number  | uint64  |  
| frame_time_us  | int64  |  
| deadline_us  | int64  |  
| interval_delta_us  | int64  |  
| on_critical_path  | bool  |  
| animate_only  | bool  |  
| source_location_iid  | uint64  | The interned SourceLocation.  |  
| source_location  | [SourceLocation](https://perfetto.dev/docs/reference/trace-packet-proto#SourceLocation)  | The SourceLocation that this args was created from.TypedArgument TraceEvents and then we shouldn't need this SourceLocation since we can emit it as part of the InternedData message. When we can remove this `source_location`.  |  
| frames_throttled_since_last  | int64  |  
###  BeginFrameArgs.BeginFrameArgsType
JSON format has a "type" field that was always just "BeginFrameArgs" we drop this in the proto representation, and instead make the JSON format "subtype" field become the type field.
Defined in [chrome_compositor_scheduler_state.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/chrome_compositor_scheduler_state.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| BEGIN_FRAME_ARGS_TYPE_UNSPECIFIED  | 0  |  
| BEGIN_FRAME_ARGS_TYPE_INVALID  | 1  |  
| BEGIN_FRAME_ARGS_TYPE_NORMAL  | 2  |  
| BEGIN_FRAME_ARGS_TYPE_MISSED  | 3  |  
###  SourceLocation
Defined in [source_location.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/source_location.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| iid  | uint64  |  
| file_name  | string  |  
| function_name  | string  |  
| line_number  | uint32  |  
###  BeginImplFrameArgs.TimestampsInUs
Defined in [chrome_compositor_scheduler_state.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/chrome_compositor_scheduler_state.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| interval_delta  | int64  |  
| now_to_deadline_delta  | int64  |  
| frame_time_to_now_delta  | int64  |  
| frame_time_to_deadline_delta  | int64  |  
| now  | int64  |  
| frame_time  | int64  |  
| deadline  | int64  |  
###  BeginFrameObserverState
Defined in [chrome_compositor_scheduler_state.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/chrome_compositor_scheduler_state.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dropped_begin_frame_args  | int64  |  
| last_begin_frame_args  | [BeginFrameArgs](https://perfetto.dev/docs/reference/trace-packet-proto#BeginFrameArgs)  |  
###  BeginFrameSourceState
Defined in [chrome_compositor_scheduler_state.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/chrome_compositor_scheduler_state.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| source_id  | uint32  |  
| paused  | bool  |  
| num_observers  | uint32  |  
| last_begin_frame_args  | [BeginFrameArgs](https://perfetto.dev/docs/reference/trace-packet-proto#BeginFrameArgs)  |  
###  CompositorTimingHistory
Defined in [chrome_compositor_scheduler_state.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/chrome_compositor_scheduler_state.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| begin_main_frame_queue_critical_estimate_delta_us  | int64  |  
| begin_main_frame_queue_not_critical_estimate_delta_us  | int64  |  
| begin_main_frame_start_to_ready_to_commit_estimate_delta_us  | int64  |  
| commit_to_ready_to_activate_estimate_delta_us  | int64  |  
| prepare_tiles_estimate_delta_us  | int64  |  
| activate_estimate_delta_us  | int64  |  
| draw_estimate_delta_us  | int64  |  
###  ChromeUserEvent
Details about a UI interaction initiated by the user, such as opening or closing a tab or a context menu.
Defined in [chrome_user_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/chrome_user_event.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| action  | string  | Name of the action, e.g. "NewTab", "ShowBookmarkManager", etc. (in Chrome, these are usually static strings known at compile time, or concatenations of multiple such static strings).  |  
| action_hash  | uint64  | MD5 hash of the action string.  |  
###  ChromeKeyedService
Details about one of Chrome's keyed services associated with the event.
Defined in [chrome_keyed_service.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/chrome_keyed_service.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  | Name of the service, e.g. "MediaRouter", "PreviewsService", etc. (in Chrome, these are static strings known at compile time).  |  
###  ChromeLegacyIpc
Details about a legacy Chrome IPC message that is either sent by the event.
Defined in [chrome_legacy_ipc.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/chrome_legacy_ipc.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| message_class  | Corresponds to the message class type defined in Chrome's IPCMessageStart enum, e.g. FrameMsgStart,  |  
| message_line  | uint32  | Line number of the message definition. See Chrome's IPC_MESSAGE_ID and IPC_MESSAGE_START macros.  |  
###  ChromeLegacyIpc.MessageClass
Defined in [chrome_legacy_ipc.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/chrome_legacy_ipc.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| CLASS_UNSPECIFIED  | 0  |  
| CLASS_AUTOMATION  | 1  |  
| CLASS_FRAME  | 2  |  
| CLASS_PAGE  | 3  |  
| CLASS_VIEW  | 4  |  
| CLASS_WIDGET  | 5  |  
| CLASS_INPUT  | 6  |  
| CLASS_TEST  | 7  |  
| CLASS_WORKER  | 8  |  
| CLASS_NACL  | 9  |  
| CLASS_GPU_CHANNEL  | 10  |  
| CLASS_MEDIA  | 11  |  
| CLASS_PPAPI  | 12  |  
| CLASS_CHROME  | 13  |  
| CLASS_DRAG  | 14  |  
| CLASS_PRINT  | 15  |  
| CLASS_EXTENSION  | 16  |  
| CLASS_TEXT_INPUT_CLIENT  | 17  |  
| CLASS_BLINK_TEST  | 18  |  
| CLASS_ACCESSIBILITY  | 19  |  
| CLASS_PRERENDER  | 20  |  
| CLASS_CHROMOTING  | 21  |  
| CLASS_BROWSER_PLUGIN  | 22  |  
| CLASS_ANDROID_WEB_VIEW  | 23  |  
| CLASS_NACL_HOST  | 24  |  
| CLASS_ENCRYPTED_MEDIA  | 25  |  
| CLASS_CAST  | 26  |  
| CLASS_GIN_JAVA_BRIDGE  | 27  |  
| CLASS_CHROME_UTILITY_PRINTING  | 28  |  
| CLASS_OZONE_GPU  | 29  |  
| CLASS_WEB_TEST  | 30  |  
| CLASS_NETWORK_HINTS  | 31  |  
| CLASS_EXTENSIONS_GUEST_VIEW  | 32  |  
| CLASS_GUEST_VIEW  | 33  |  
| CLASS_MEDIA_PLAYER_DELEGATE  | 34  |  
| CLASS_EXTENSION_WORKER  | 35  |  
| CLASS_SUBRESOURCE_FILTER  | 36  |  
| CLASS_UNFREEZABLE_FRAME  | 37  |  
###  ChromeHistogramSample
An individual histogram sample logged via Chrome's UMA metrics system.
Defined in [chrome_histogram_sample.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/chrome_histogram_sample.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name_hash  | uint64  | MD5 hash of the metric name. Either `name_hash` or `name`/`name_iid` or both must be present.  |  
| name  | string  |  
| sample  | int64  |  
| name_iid  | uint64  | Interned HistogramName. Only one of `name`, `name_iid` can be set.  |  
###  ChromeLatencyInfo
Defined in [chrome_latency_info.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/chrome_latency_info.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| trace_id  | int64  |  
| step  |  
| frame_tree_node_id  | int32  |  
| component_info  |  
| is_coalesced  | bool  |  
| gesture_scroll_id  | int64  |  
| touch_id  | int64  |  
| input_type  | The type of input corresponding to this `ChromeLatencyInfo`.  |  
###  ChromeLatencyInfo.Step
All step are optional but the enum is ordered (not by number) below in the order we expect them to appear if they are emitted in trace in a blocking fashion.
Defined in [chrome_latency_info.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/chrome_latency_info.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| STEP_UNSPECIFIED  | 0  |  
| STEP_SEND_INPUT_EVENT_UI  | 3  | Emitted on the browser main thread.  |  
| STEP_HANDLE_INPUT_EVENT_IMPL  | 5  | Happens on the renderer's compositor.  |  
| STEP_DID_HANDLE_INPUT_AND_OVERSCROLL  | 8  |  
| STEP_HANDLE_INPUT_EVENT_MAIN  | 4  | Occurs on the Renderer's main thread.  |  
| STEP_MAIN_THREAD_SCROLL_UPDATE  | 2  |  
| STEP_HANDLE_INPUT_EVENT_MAIN_COMMIT  | 1  |  
| STEP_HANDLED_INPUT_EVENT_MAIN_OR_IMPL  | 9  | Could be emitted on both the renderer's main OR compositor.  |  
| STEP_HANDLED_INPUT_EVENT_IMPL  | 10  | Optionally sometimes HANDLED_INPUT_EVENT_MAIN_OR_IMPL will proxy to the renderer's compositor and this will be emitted.  |  
| STEP_SWAP_BUFFERS  | 6  | Renderer's compositor.  |  
| STEP_DRAW_AND_SWAP  | 7  | Happens on the VizCompositor in the GPU process.  |  
| STEP_FINISHED_SWAP_BUFFERS  | 11  | Happens on the GPU main thread after the swap has completed.  |  
###  ChromeLatencyInfo.ComponentInfo
Defined in [chrome_latency_info.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/chrome_latency_info.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| component_type  | [LatencyComponentType](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeLatencyInfo.LatencyComponentType)  |  
| time_us  | uint64  | Microsecond timestamp in CLOCK_MONOTONIC domain  |  
###  ChromeLatencyInfo.LatencyComponentType
This enum is a copy of LatencyComponentType enum in Chrome, located in ui/latency/latency_info.h, modulo added UNKNOWN value per protobuf practices.
Defined in [chrome_latency_info.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/chrome_latency_info.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| COMPONENT_UNSPECIFIED  | 0  |  
| COMPONENT_INPUT_EVENT_LATENCY_BEGIN_RWH  | 1  |  
| COMPONENT_INPUT_EVENT_LATENCY_SCROLL_UPDATE_ORIGINAL  | 2  |  
| COMPONENT_INPUT_EVENT_LATENCY_FIRST_SCROLL_UPDATE_ORIGINAL  | 3  |  
| COMPONENT_INPUT_EVENT_LATENCY_ORIGINAL  | 4  |  
| COMPONENT_INPUT_EVENT_LATENCY_UI  | 5  |  
| COMPONENT_INPUT_EVENT_LATENCY_RENDERER_MAIN  | 6  |  
| COMPONENT_INPUT_EVENT_LATENCY_RENDERING_SCHEDULED_MAIN  | 7  |  
| COMPONENT_INPUT_EVENT_LATENCY_RENDERING_SCHEDULED_IMPL  | 8  |  
| COMPONENT_INPUT_EVENT_LATENCY_SCROLL_UPDATE_LAST_EVENT  | 9  |  
| COMPONENT_INPUT_EVENT_LATENCY_ACK_RWH  | 10  |  
| COMPONENT_INPUT_EVENT_LATENCY_RENDERER_SWAP  | 11  |  
| COMPONENT_DISPLAY_COMPOSITOR_RECEIVED_FRAME  | 12  |  
| COMPONENT_INPUT_EVENT_GPU_SWAP_BUFFER  | 13  |  
| COMPONENT_INPUT_EVENT_LATENCY_FRAME_SWAP  | 14  |  
###  ChromeLatencyInfo.InputType
Defined in [chrome_latency_info.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/chrome_latency_info.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| UNSPECIFIED_OR_OTHER  | 0  |  
| TOUCH_MOVED  | 1  |  
| GESTURE_SCROLL_BEGIN  | 2  |  
| GESTURE_SCROLL_UPDATE  | 3  |  
| GESTURE_SCROLL_END  | 4  |  
| GESTURE_TAP  | 5  |  
| GESTURE_TAP_CANCEL  | 6  |  
###  ChromeFrameReporter
DEPRECATED. Only kept for backwards compatibility. Use `ChromeFrameReporter2` in <https://source.chromium.org/chromium/chromium/src/+/main:base/tracing/protos/chrome_track_event.proto> instead.
Defined in [chrome_frame_reporter.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/chrome_frame_reporter.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| state  |  
| reason  | The reason is set only if `state` is not `STATE_UPDATED_ALL`.  |  
| frame_source  | uint64  |  
| frame_sequence  | uint64  |  
| affects_smoothness  | bool  | If this is a droped frame (i.e. if `state` is set to `STATE_DROPPED` or `STATE_PRESENTED_PARTIAL`), then indicates whether this frame impacts smoothness.  |  
| scroll_state  | The type of active scroll.  |  
| has_main_animation  | bool  | If any main thread animation is active during this frame.  |  
| has_compositor_animation  | bool  | If any compositor thread animation is active during this frame.  |  
| has_smooth_input_main  | bool  | If any touch-driven UX (not scroll) is active during this frame.  |  
| has_missing_content  | bool  | Whether the frame contained any missing content (i.e. whether there was checkerboarding in the frame). If has_missing_content, checkerboarded_needs_raster and checkerboarded_needs_record all have values, has_missing_content should equal checkerboarded_needs_raster  |  
| layer_tree_host_id  | uint64  | The id of layer_tree_host that the frame has been produced for.  |  
| has_high_latency  | bool  | If total latency of PipelineReporter exceeds a certain limit.  |  
| frame_type  | Indicate if the frame is "FORKED" (i.e. a PipelineReporter event starts at the same frame sequence as another PipelineReporter) or "BACKFILL" (i.e. dropped frames when there are no partial compositor updates).  |  
| high_latency_contribution_stage  | string[]  | The breakdown stage of PipelineReporter that is most likely accountable for high latency.  |  
| checkerboarded_needs_raster  | bool  | Whether the frame contained any content that is not fully rastered.  |  
| checkerboarded_needs_record  | bool  | Whether the frame contained any content that is not fully recorded.  |  
| surface_frame_trace_id  | int64  | viz::BeginFrameArgs.trace_id of the frame (before surface aggregation). See also ChromeTrackEvent.EventLatency.surface_frame_trace_id.  |  
| display_trace_id  | int64  | gfx::PresentationFeedback.display_trace_id of the frame (after surface aggregation). See also ChromeTrackEvent.EventLatency.display_trace_id.  |  
###  ChromeFrameReporter.State
Defined in [chrome_frame_reporter.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/chrome_frame_reporter.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| STATE_NO_UPDATE_DESIRED  | 0  | The frame did not have any updates to present.  |  
| STATE_PRESENTED_ALL  | 1  | The frame presented all the desired updates (i.e. any updates requested from both the compositor thread and main-threads were handled).  |  
| STATE_PRESENTED_PARTIAL  | 2  | The frame was presented with some updates, but also missed some updates (e.g. missed updates from the main-thread, but included updates from the compositor thread).  |  
| STATE_DROPPED  | 3  | The frame was dropped, i.e. some updates were desired for the frame, but was not presented.  |  
###  ChromeFrameReporter.FrameDropReason
Defined in [chrome_frame_reporter.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/chrome_frame_reporter.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| REASON_UNSPECIFIED  | 0  |  
| REASON_DISPLAY_COMPOSITOR  | 1  | Frame was dropped by the display-compositor.The display-compositor may drop a frame some times (e.g. the frame missed the deadline, or was blocked on surface-sync, etc.)  |  
| REASON_MAIN_THREAD  | 2  | Frame was dropped because of the main-thread.The main-thread may cause a frame to be dropped, e.g. if the main-thread is running expensive javascript, or doing a lot of layout updates, etc.  |  
| REASON_CLIENT_COMPOSITOR  | 3  | Frame was dropped by the client compositor.The client compositor can drop some frames too (e.g. attempting to recover latency, missing the deadline, etc.).  |  
###  ChromeFrameReporter.ScrollState
Defined in [chrome_frame_reporter.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/chrome_frame_reporter.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| SCROLL_NONE  | 0  |  
| SCROLL_MAIN_THREAD  | 1  |  
| SCROLL_COMPOSITOR_THREAD  | 2  |  
| SCROLL_RASTER  | 3  |  
| SCROLL_UNKNOWN  | 4  | Used when it can't be determined whether a scroll is in progress or not.  |  
###  ChromeFrameReporter.FrameType
Defined in [chrome_frame_reporter.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/chrome_frame_reporter.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| FORKED  | 0  |  
| BACKFILL  | 1  |  
###  ChromeApplicationStateInfo
Trace event arguments for application state changes.
Defined in [chrome_application_state_info.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/chrome_application_state_info.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| application_state  | [ChromeApplicationState](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeApplicationStateInfo.ChromeApplicationState)  |  
###  ChromeApplicationStateInfo.ChromeApplicationState
Enum definition taken from: <https://source.chromium.org/chromium/chromium/src/+/master:base/android/application_status_listener.h>
Defined in [chrome_application_state_info.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/chrome_application_state_info.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| APPLICATION_STATE_UNKNOWN  | 0  |  
| APPLICATION_STATE_HAS_RUNNING_ACTIVITIES  | 1  |  
| APPLICATION_STATE_HAS_PAUSED_ACTIVITIES  | 2  |  
| APPLICATION_STATE_HAS_STOPPED_ACTIVITIES  | 3  |  
| APPLICATION_STATE_HAS_DESTROYED_ACTIVITIES  | 4  |  
###  ChromeRendererSchedulerState
Describes the state of the RendererScheduler for a given Renderer Process.
Defined in [chrome_renderer_scheduler_state.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/chrome_renderer_scheduler_state.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| rail_mode  | [ChromeRAILMode](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeRAILMode)  |  
| is_backgrounded  | bool  |  
| is_hidden  | bool  |  
###  ChromeRAILMode
RAIL Mode is an indication of the kind of work that a Renderer is currently performing which is in turn used to prioritise work accordingly. A fuller description of these modes can be found <https://web.dev/rail/>
Defined in [chrome_renderer_scheduler_state.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/chrome_renderer_scheduler_state.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| RAIL_MODE_NONE  | 0  |  
| RAIL_MODE_RESPONSE  | 1  |  
| RAIL_MODE_ANIMATION  | 2  |  
| RAIL_MODE_IDLE  | 3  |  
| RAIL_MODE_LOAD  | 4  |  
###  ChromeWindowHandleEventInfo
Details about HWNDMessageHandler trace events.
Defined in [chrome_window_handle_event_info.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/chrome_window_handle_event_info.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dpi  | uint32  |  
| message_id  | uint32  |  
| hwnd_ptr  | fixed64  |  
###  ChromeContentSettingsEventInfo
Details about ContentSettings trace events.
Defined in [chrome_content_settings_event_info.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/chrome_content_settings_event_info.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| number_of_exceptions  | uint32  | The number of user defined hostname patterns for content settings at browser start. Similar to UMA histogram 'ContentSettings.NumberOfExceptions'.  |  
###  ChromeActiveProcesses
A list of processes connected to the tracing service.
Defined in [chrome_active_processes.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/chrome_active_processes.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| pid  | int32[]  |  
###  Screenshot
Defined in [screenshot.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/screenshot.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| jpg_image  | bytes  | The JPEG (Joint Photographic Experts Group) file format.  |  
| pam_image  | bytes  | The PAM (Portable Arbitrary Map) file format.  |  
| ppm_image  | bytes  | The PPM (Portable Pixmap) file format.  |  
###  ChromeMessagePump
Details about Chrome message pump events
Defined in [chrome_message_pump.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/chrome_message_pump.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| sent_messages_in_queue  | bool  | True if there are sent messages in the queue.  |  
| io_handler_location_iid  | uint64  | Interned SourceLocation of IO handler that MessagePumpForIO is about to invoke.  |  
###  ChromeMojoEventInfo
Contains information to identify mojo handling events. The trace events in mojo are common for all mojo interfaces and this information is used to identify who is the caller or callee.
Defined in [chrome_mojo_event_info.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/chrome_mojo_event_info.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| watcher_notify_interface_tag  | string  | Contains the interface name or the file name of the creator of a mojo handle watcher, recorded when an event if notified to the watcher. The code that runs within the track event belongs to the interface.  |  
| ipc_hash  | uint32  | The hash of the IPC message that is being handled.  |  
| mojo_interface_tag  | string  | A static string representing the mojo interface name of the message that is being handled.  |  
| mojo_interface_method_iid  | uint64  | Refers to an interned UnsymbolizedSourceLocation.The UnsymbolizedSourceLocation contains the interface method that's being handled, represented as a native symbol.The native symbol can be symbolized after the trace is recorded.Not using a symbolized source location for official Chromium builds to reduce binary size - emitting file/function names as strings into the trace requires storing them in the binary, which causes a significant binary size bloat for Chromium.  |  
| is_reply  | bool  | Indicate whether this is a message or reply.  |  
| payload_size  | uint64  | The payload size of the message being sent through mojo messages.  |  
| data_num_bytes  | uint64  | Represents the size of the message. Includes all headers and user payload.  |  
###  TrackEvent.LegacyEvent
Apart from {category, time, thread time, tid, pid}, other legacy trace event attributes are initially simply proxied for conversion to a JSON trace. We intend to gradually transition these attributes to similar native features in TrackEvent (e.g. async + flow events), or deprecate them without replacement where transition is unsuitable.
Defined in [track_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/track_event.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name_iid  | uint64  | Deprecated, use TrackEvent::name(_iid) instead.interned EventName.  |  
| phase  | int32  |  
| duration_us  | int64  |  
| thread_duration_us  | int64  |  
| thread_instruction_delta  | int64  | Elapsed retired instruction count during the event.  |  
| unscoped_id  | uint64  |  
| local_id  | uint64  |  
| global_id  | uint64  |  
| id_scope  | string  | Additional optional scope for `id`.  |  
| use_async_tts  | bool  | Consider the thread timestamps for async BEGIN/END event pairs as valid.  |  
| bind_id  | uint64  | Idenfifies a flow. Flow events with the same bind_id are connected.  |  
| bind_to_enclosing  | bool  | Use the enclosing slice as binding point for a flow end event instead of the next slice. Flow start/step events always bind to the enclosing slice.  |  
| flow_direction  |  
| instant_event_scope  | [InstantEventScope](https://perfetto.dev/docs/reference/trace-packet-proto#TrackEvent.LegacyEvent.InstantEventScope)  |  
| pid_override  | int32  | Override the pid/tid if the writer needs to emit events on behalf of another process/thread. This should be the exception. Normally, the pid+tid from ThreadDescriptor is used.  |  
| tid_override  | int32  |  
###  TrackEvent.LegacyEvent.FlowDirection
Defined in [track_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/track_event.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| FLOW_UNSPECIFIED  | 0  |  
| FLOW_IN  | 1  |  
| FLOW_OUT  | 2  |  
| FLOW_INOUT  | 3  |  
###  TrackEvent.LegacyEvent.InstantEventScope
Defined in [track_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/track_event.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| SCOPE_UNSPECIFIED  | 0  |  
| SCOPE_GLOBAL  | 1  |  
| SCOPE_PROCESS  | 2  |  
| SCOPE_THREAD  | 3  |  
##  TrackDescriptor
Defines a track for TrackEvents. Slices and instant events on the same track will be nested based on their timestamps, see TrackEvent::Type.
A TrackDescriptor only needs to be emitted by one trace writer / producer and is valid for the entirety of the trace. To ensure the descriptor isn't lost when the ring buffer wraps, it should be reemitted whenever incremental state is cleared.
As a fallback, TrackEvents emitted without an explicit track association will be associated with an implicit trace-global track (uuid = 0), see also |TrackEvent::track_uuid|. It is possible but not necessary to emit a TrackDescriptor for this implicit track.
Defined in [track_descriptor.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/track_descriptor.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| uuid  | uint64  | Unique ID that identifies this track. This ID is global to the whole trace.Producers should ensure that it is unlikely to clash with IDs emitted by other producers. A value of 0 denotes the implicit trace-global track. For example, legacy TRACE_EVENT macros may use a hash involving the async event id + id_scope, pid, and/or tid to compute this ID.  |  
| parent_uuid  | uint64  | A parent track reference can be used to describe relationships between tracks. For example, to define an asynchronous track which is scoped to a specific process, specify the uuid for that process's process track here.Similarly, to associate a COUNTER_THREAD_TIME_NS counter track with a thread, specify the uuid for that thread's thread track here. In general, setting a parent will _nest_ that track under the parent in the UI and in the trace processor data model (with the important exception noted below). If not specified, the track will be a root track, i.e. not nested under any other track. Note: if the `thread` or `process` fields are set, this value will be _ignored_ as priority is given to those fields. Note: if the parent is set to a track with `thread` or `process` fields set, the track will _not_ be nested under the parent in the UI and in the trace processor data model. Instead, the track will inherit the parent's thread/process association and will appear as a _sibling_ of the parent.This semantic exists for back-compat reasons as the UI used to work this way for years and changing this leads to a lot of traces subtly breaking.If you want to force nesting, create _another_ intermediate track to act as the parent.  |  
| name  | string  |  
| static_name  | string  | This field is only set by the SDK when perfetto::StaticString is provided.  |  
| atrace_name  | string  | Equivalent to name, used just to mark that the data is coming from android.os.Trace.  |  
| description  | string  | A human-readable description of the track providing more context about its data. In the UI, this is shown in a popup when the track's help button is clicked.  |  
| process  | [ProcessDescriptor](https://perfetto.dev/docs/reference/trace-packet-proto#ProcessDescriptor)  | Associate the track with a process, making it the process-global track.There should only be one such track per process (usually for instant events; trace processor uses this fact to detect pid reuse). If you need more (e.g. for asynchronous events), create child tracks using parent_uuid. Trace processor will merge events on a process track with slice-type events from other sources (e.g. ftrace) for the same process into a single timeline view.  |  
| chrome_process  | [ChromeProcessDescriptor](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeProcessDescriptor)  |  
| thread  | [ThreadDescriptor](https://perfetto.dev/docs/reference/trace-packet-proto#ThreadDescriptor)  | Associate the track with a thread, indicating that the track's events describe synchronous code execution on the thread. There should only be one such track per thread (trace processor uses this fact to detect tid reuse). Trace processor will merge events on a thread track with slice-type events from other sources (e.g. ftrace) for the same thread into a single timeline view.  |  
| chrome_thread  | [ChromeThreadDescriptor](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeThreadDescriptor)  |  
| counter  | [CounterDescriptor](https://perfetto.dev/docs/reference/trace-packet-proto#CounterDescriptor)  | Descriptor for a counter track. If set, the track will only support TYPE_COUNTER TrackEvents (and values provided via TrackEvent's `extra_counter_values`).  |  
| state  | [StateDescriptor](https://perfetto.dev/docs/reference/trace-packet-proto#StateDescriptor)  | Descriptor for a state track. If set, the track will support TYPE_STATE TrackEvents.  |  
| disallow_merging_with_system_tracks  | bool  | If true, forces Trace Processor to use separate tracks for track events and system events for the same thread. Track events timestamps in Chrome have microsecond resolution, while system events use nanoseconds. It results in broken event nesting when track events and system events share a track.  |  
| child_ordering  | [ChildTracksOrdering](https://perfetto.dev/docs/reference/trace-packet-proto#TrackDescriptor.ChildTracksOrdering)  |  
| sibling_order_rank  | int32  | An opaque value which allows specifying how sibling tracks should be ordered relative to each other: tracks with lower ranks will appear before tracks with higher ranks. An unspecified rank will be treated as a rank of 0. This rank is used in the following scenarios:- For standard child tracks, if the parent track has `child_ordering` set to `EXPLICIT`.- For process tracks, if the root track descriptor (uuid = 0) has `process_ordering` set to `PROCESS_ORDERING_EXPLICIT`.- For thread tracks, if the root track descriptor (uuid = 0) has `thread_ordering` set to `THREAD_ORDERING_EXPLICIT`. In all other cases, this value is ignored.  |  
| sibling_merge_behavior  | [SiblingMergeBehavior](https://perfetto.dev/docs/reference/trace-packet-proto#TrackDescriptor.SiblingMergeBehavior)  |  
| sibling_merge_key  | string  |  
| sibling_merge_key_int  | uint64  |  
| process_ordering  |  
| thread_ordering  |  
| dimensions  | [TrackDimension[]](https://perfetto.dev/docs/reference/trace-packet-proto#TrackDimension)  | Custom, producer-declared dimensions for this track. Repeated so that a track can carry more than one independent dimension (e.g. `rank` and `stage`). Dimensions declared here apply to this track and its `parent_uuid` descendants. See TrackDimension for the full resolution rules. Dimensions are part of the track's identity: every descriptor emitted for this `uuid` must declare the same dimensions, starting with the first one, and only siblings declaring the same dimensions are merged. See TrackDimension for details. Well-known dimensions (`machine`, `gpu`, `cpu`, `process`, `thread`) are synthesized by trace processor from the typed fields above and from import context: their names are reserved and producers must _not_ declare them here. See TrackDimension for the full list of reserved names.  |  
###  ProcessDescriptor
Describes a process's attributes. Emitted as part of a TrackDescriptor, usually by the process's main thread.
Defined in [process_descriptor.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/process_descriptor.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| pid  | int32  |  
| cmdline  | string[]  |  
| process_name  | string  |  
| process_priority  | int32  |  
| start_timestamp_ns  | int64  | Process start time in nanoseconds.The timestamp refers to the trace clock by default. Other clock IDs provided in TracePacket are not supported.  |  
| chrome_process_type  | [ChromeProcessType](https://perfetto.dev/docs/reference/trace-packet-proto#ProcessDescriptor.ChromeProcessType)  |  
| legacy_sort_index  | int32  | To support old UI. New UI should determine default sorting by process_type.  |  
| process_labels  | string[]  | Labels can be used to further describe properties of the work performed by the process. For example, these can be used by Chrome renderer process to provide titles of frames being rendered.  |  
###  ProcessDescriptor.ChromeProcessType
See chromium's content::ProcessType.
Defined in [process_descriptor.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/process_descriptor.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| PROCESS_UNSPECIFIED  | 0  |  
| PROCESS_BROWSER  | 1  |  
| PROCESS_RENDERER  | 2  |  
| PROCESS_UTILITY  | 3  |  
| PROCESS_ZYGOTE  | 4  |  
| PROCESS_SANDBOX_HELPER  | 5  |  
| PROCESS_GPU  | 6  |  
| PROCESS_PPAPI_PLUGIN  | 7  |  
| PROCESS_PPAPI_BROKER  | 8  |  
###  ChromeProcessDescriptor
Describes the attributes for a Chrome process. Must be paired with a ProcessDescriptor in the same TrackDescriptor.
Defined in [chrome_process_descriptor.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/chrome_process_descriptor.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| process_type  | int32  | This is a chrome_enums::ProcessType from //protos/third_party/chromium/chrome_enums.proto. The enum definition can't be imported here because of a dependency loop.  |  
| process_priority  | int32  |  
| legacy_sort_index  | int32  | To support old UI. New UI should determine default sorting by process_type.  |  
| host_app_package_name  | string  | Name of the hosting app for WebView. Used to match renderer processes to their hosting apps.  |  
| crash_trace_id  | uint64  | The ID to link crashes to trace.Notes:* The ID is per process. So, each trace may contain many IDs, and you need to look for the ID from crashed process to find the crash report.* Having a "chrome-trace-id" in crash doesn't necessarily mean we can get an uploaded trace, since uploads could have failed.* On the other hand, if there was a crash during the session and trace was uploaded, it is very likely to find a crash report with the trace ID.* This is not crash ID or trace ID. It is just a random 64-bit number recorded in both traces and crashes. It is possible to have collisions, though very rare.  |  
###  ThreadDescriptor
Describes a thread's attributes. Emitted as part of a TrackDescriptor, usually by the thread's trace writer.
Defined in [thread_descriptor.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/thread_descriptor.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| pid  | int32  |  
| tid  | int64  |  
| thread_name  | string  |  
| chrome_thread_type  | [ChromeThreadType](https://perfetto.dev/docs/reference/trace-packet-proto#ThreadDescriptor.ChromeThreadType)  |  
| reference_timestamp_us  | int64  | Deprecated. Use ClockSnapshot in combination with TracePacket's timestamp and timestamp_clock_id fields instead.  |  
| reference_thread_time_us  | int64  | Absolute reference values. Clock values in subsequent TrackEvents can be encoded accumulatively and relative to these. This reduces their var-int encoding size.  |  
| reference_thread_instruction_count  | int64  |  
| legacy_sort_index  | int32  | To support old UI. New UI should determine default sorting by thread_type.  |  
###  ThreadDescriptor.ChromeThreadType
Defined in [thread_descriptor.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/thread_descriptor.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| CHROME_THREAD_UNSPECIFIED  | 0  |  
| CHROME_THREAD_MAIN  | 1  |  
| CHROME_THREAD_IO  | 2  |  
| CHROME_THREAD_POOL_BG_WORKER  | 3  | Scheduler:  |  
| CHROME_THREAD_POOL_FG_WORKER  | 4  |  
| CHROME_THREAD_POOL_FB_BLOCKING  | 5  |  
| CHROME_THREAD_POOL_BG_BLOCKING  | 6  |  
| CHROME_THREAD_POOL_SERVICE  | 7  |  
| CHROME_THREAD_COMPOSITOR  | 8  | Compositor:  |  
| CHROME_THREAD_VIZ_COMPOSITOR  | 9  |  
| CHROME_THREAD_COMPOSITOR_WORKER  | 10  |  
| CHROME_THREAD_SERVICE_WORKER  | 11  | Renderer:  |  
| CHROME_THREAD_MEMORY_INFRA  | 50  | Tracing related threads:  |  
| CHROME_THREAD_SAMPLING_PROFILER  | 51  |  
###  ChromeThreadDescriptor
Describes a Chrome thread's attributes. Emitted as part of a TrackDescriptor, usually by the thread's trace writer. Must be paired with a ThreadDescriptor in the same TrackDescriptor.
Defined in [chrome_thread_descriptor.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/chrome_thread_descriptor.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| thread_type  | int32  | This is a chrome_enums::ThreadType from //protos/third_party/chromium/chrome_enums.proto. The enum definition can't be imported here because of a dependency loop.  |  
| legacy_sort_index  | int32  | To support old UI. New UI should determine default sorting by thread_type.  |  
| is_sandboxed_tid  | bool  | Indicates whether the thread's tid specified in the thread descriptor is namespaced by Chromium's sandbox. Only set on Linux, and from Chrome M140.  |  
###  CounterDescriptor
Defines properties of a counter track, e.g. for built-in counters (thread time, instruction count, ..) or user-specified counters (e.g. memory usage of a specific app component).
Counter tracks only support TYPE_COUNTER track events, which specify new values for the counter. For counters that require per-slice values, counter values can instead be provided in a more efficient encoding via TrackEvent's `extra_counter_track_uuids` and `extra_counter_values` fields. However, slice-type events cannot be emitted onto a counter track.
Values for counters that are only emitted on a single packet sequence can optionally be delta-encoded, see `is_incremental`.
Defined in [counter_descriptor.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/counter_descriptor.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| type  | [BuiltinCounterType](https://perfetto.dev/docs/reference/trace-packet-proto#CounterDescriptor.BuiltinCounterType)  | For built-in counters (e.g. thread time). Custom user-specified counters (e.g. those emitted by TRACE_COUNTER macros of the client library) shouldn't set this, and instead provide a counter name via TrackDescriptor.  |  
| categories  | string[]  | Names of categories of the counter (usually for user-specified counters).In the client library, categories are a way to turn groups of individual counters (or events) on or off.  |  
| unit  | Type of the counter's values. Built-in counters imply a value for this field.  |  
| unit_name  | string  | In order to use a unit not defined as a part of `Unit`, a free-form unit name can be used instead.  |  
| unit_multiplier  | int64  | Multiplication factor of this counter's values, e.g. to supply COUNTER_THREAD_TIME_NS timestamps in microseconds instead.  |  
| is_incremental  | bool  | Whether values for this counter are provided as delta values. Only supported for counters that are emitted on a single packet-sequence (e.g.thread time). Counter values in subsequent packets on the current packet sequence will be interpreted as delta values from the sequence's most recent value for the counter. When incremental state is cleared, the counter value is considered to be reset to 0. Thus, the first value after incremental state is cleared is effectively an absolute value.  |  
| y_axis_share_key  | string  | When visualizing multiple counter tracks, it is often useful to have them share the same Y-axis range. This allows for easy comparison of their values. All counter tracks with the same `y_axis_share_key` and the same parent track (e.g. grouped under the same process track) will share their y-axis range in the UI.  |  
###  CounterDescriptor.BuiltinCounterType
Built-in counters, usually with special meaning in the client library, trace processor, legacy JSON format, or UI. Trace processor will infer a track name from the enum value if none is provided in TrackDescriptor.
Thread-scoped counters. The thread's track should be specified via `parent_uuid` in the TrackDescriptor for such a counter.
Defined in [counter_descriptor.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/counter_descriptor.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| COUNTER_UNSPECIFIED  | 0  |  
| COUNTER_THREAD_TIME_NS  | 1  | implies UNIT_TIME_NS.  |  
| COUNTER_THREAD_INSTRUCTION_COUNT  | 2  | implies UNIT_COUNT.  |  
###  CounterDescriptor.Unit
Type of the values for the counters - to supply lower granularity units, see also `unit_multiplier`.
Defined in [counter_descriptor.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/counter_descriptor.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| UNIT_UNSPECIFIED  | 0  |  
| UNIT_TIME_NS  | 1  |  
| UNIT_COUNT  | 2  |  
| UNIT_SIZE_BYTES  | 3  |  
###  StateDescriptor
Descriptor for a state track. For now, this message is empty. It is used to identify a track as a state track.
Defined in [state_descriptor.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/state_descriptor.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
###  TrackDescriptor.ChildTracksOrdering
Specifies how the UI should display child tracks of this track (i.e. tracks where `parent_uuid` is specified to this track `uuid`). Note that this value is simply a _hint_ to the UI: the UI is not guarnateed to respect this if it has a good reason not to do so.
Note: for tracks where `thread` or `process` are set (i.e. process tracks and thread tracks), this option is _ignored_. Instead, use `thread_ordering` and `process_ordering` on the root track descriptor (uuid = 0) to configure process and thread track ordering. See `parent_uuid` for details.
Defined in [track_descriptor.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/track_descriptor.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| UNKNOWN  | 0  | The default ordering, with no bearing on how the UI will visualise the tracks.  |  
| LEXICOGRAPHIC  | 1  | Order tracks by `name` or `static_name` depending on which one has been specified.  |  
| CHRONOLOGICAL  | 2  | Order tracks by the first `ts` event in a track.  |  
| EXPLICIT  | 3  | Order tracks by `sibling_order_rank` of child tracks. Child tracks with the lower values will be shown before tracks with higher values. Tracks with no value will be treated as having 0 rank.  |  
###  TrackDescriptor.SiblingMergeBehavior
Specifies how the analysis tools should "merge" different sibling TrackEvent tracks.
For two or more tracks to be merged, they must be "eligible" siblings. Eligibility is determined by the following rules:
  1. All tracks must have the same parent.
  2. All tracks must have the same `sibling_merge_behavior`. The only exception is `SIBLING_MERGE_BEHAVIOR_UNSPECIFIED` which is treated as `SIBLING_MERGE_BEHAVIOR_BY_TRACK_NAME`.
  3. Depending on the behavior, the corresponding key must match (e.g. `name` for `BY_TRACK_NAME`, `sibling_merge_key` for `BY_SIBLING_MERGE_KEY`).
  4. All tracks must declare the same `dimensions`.


Specifically:
  * in the UI, all tracks which are merged together will be displayed as a single "visual" track.
  * in the trace processor, all tracks which are merged together will be "multiplexed" into n "analysis" tracks where n is the maximum number of tracks which have an active event at the same time.


When tracks are merged togther, the properties for the merged track will be chosen from the source tracks based on the following rules:
  * for `sibling_order_rank`: the rank of the merged track will be the smallest rank among the source tracks.
  * for all other properties: the property taken is unspecified and can be any value provided by one of the source tracks. This can lead to non-deterministic behavior.
  * examples of other properties include `name`, `child_ordering` etc.
  * because of this, it's strongly recommended to ensure that all source tracks have the same value for these properties.
  * the trace processor will also emit an error stat if it detects that the properties are not the same across all source tracks.


Note: merging is done _recursively_ so entire trees of tracks can be merged together. To make this clearer, consider an example track hierarchy (in the diagrams: "smk" refers to "sibling_merge_key", the first word on a track line, like "Updater", is its 'name' property):
Initial track hierarchy: SystemActivity ├── AuthService (smk: "auth_main_cluster") │ └── LoginOp (smk: "login_v1") ├── AuthService (smk: "auth_main_cluster") │ └── LoginOp (smk: "login_v1") ├── AuthService (smk: "auth_backup_cluster") │ └── GuestOp (smk: "guest_v1") └── UserProfileService (smk: "profile_cluster") └── GetProfileOp (smk: "getprofile_v1")
Merging outcomes:
Scenario 1: Merging by `SIBLING_MERGE_BEHAVIOR_BY_SIBLING_MERGE_KEY`
  * The first two "AuthService" tracks merge because they share `smk: "auth_main_cluster"`. Their names are consistent ("AuthService"), aligning with recommendations. The merged track is named "AuthService".
  * The third "AuthService" track (with `smk: "auth_backup_cluster"`) remains separate, as its `sibling_merge_key` is different.
  * "UserProfileService" also remains separate.
  * Within the merged "AuthService" (from "auth_main_cluster"): "LoginOp" get merged as they have the same sibling merge key.


Resulting UI (when merging by SIBLING_MERGE_KEY): SystemActivity ├── AuthService (merged by smk: "auth_main_cluster") │ ├── LoginOp (merged by smk: "login_v1") ├── AuthService (smk: "auth_backup_cluster") │ └── GuestOp (smk: "guest_v1") └── UserProfileService (smk: "profile_cluster") └── GetProfileOp (smk: "getprofile_v1")
Scenario 2: Merging by `SIBLING_MERGE_BEHAVIOR_BY_TRACK_NAME`
  * All three tracks named "AuthService" merge because they share the same name. The merged track is named "AuthService". The `sibling_merge_key` for this merged track would be taken from one of the source tracks (e.g., "auth_main_cluster" or "auth_backup_cluster"), which could be relevant if its children had key-based merge behaviors.
  * "UserProfileService" remains separate due to its different name.
  * Within the single merged "AuthService" track: "LoginOp", "GuestOp" become siblings. "LoginOp" tracks gets merged as they have the same name.


Resulting UI (when merging by SIBLING_MERGE_BEHAVIOR_BY_TRACK_NAME): SystemActivity ├── AuthService (merged from 3 "AuthService" tracks) │ ├── LoginOp (smk: "login_v1") │ └── GuestOp (smk: "guest_v1") └── UserProfileService (smk: "profile_cluster") └── GetProfileOp (smk: "getprofile_v1")
Note: for tracks where `thread` or `process` are set, this option is _ignored_. See `parent_uuid` for details.
Defined in [track_descriptor.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/track_descriptor.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| SIBLING_MERGE_BEHAVIOR_UNSPECIFIED  | 0  | When unspecified or not set, defaults to `SIBLING_MERGE_BEHAVIOR_BY_TRACK_NAME`.  |  
| SIBLING_MERGE_BEHAVIOR_BY_TRACK_NAME  | 1  | Merge this track with eligible siblings which have the same `name`. This is the default behavior.option. Fun fact: this is the default beahavior for legacy reasons as the UI has worked this way for years and inherited this behavior from chrome://tracing which has worked this way for even longer  |  
| SIBLING_MERGE_BEHAVIOR_NONE  | 2  | Never merge this track with any siblings. Useful if if this track has a specific meaning and you want to see separately from any others.  |  
| SIBLING_MERGE_BEHAVIOR_BY_SIBLING_MERGE_KEY  | 3  | Merge this track with eligible siblings which have the same `sibling_merge_key`.  |  
###  TrackDescriptor.ProcessOrdering
Specifies how the UI should display top-level process tracks relative to each other. Note that this value is simply a _hint_ to the UI and is only valid on the root track descriptor (uuid = 0).
Defined in [track_descriptor.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/track_descriptor.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| PROCESS_ORDERING_UNSPECIFIED  | 0  | The default ordering, with no bearing on how the UI will visualise the processes.  |  
| PROCESS_ORDERING_EXPLICIT  | 1  | Order processes by `sibling_order_rank` of their process track descriptors. Processes with lower ranks will be shown before processes with higher ranks. Processes with no rank specified will be treated as having a rank of 0.  |  
###  TrackDescriptor.ThreadOrdering
Specifies how the UI should display thread tracks within a process group relative to each other. Note that this value is simply a _hint_ to the UI and is only valid on the root track descriptor (uuid = 0).
Defined in [track_descriptor.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/track_descriptor.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| THREAD_ORDERING_UNSPECIFIED  | 0  | The default ordering, with no bearing on how the UI will visualise the threads.  |  
| THREAD_ORDERING_EXPLICIT  | 1  | Order threads by `sibling_order_rank` of their thread track descriptors.Threads with lower ranks will be shown before threads with higher ranks.Threads with no rank specified will be treated as having a rank of 0.  |  
###  TrackDimension
A named, typed key/value which is part of a track's identity.
Dimensions are the single vocabulary for identifiers which apply to a set of tracks: _well-known_ dimensions are synthesized by trace processor, while producers can declare their own _custom_ dimensions (`rank`, `shard`, `stage`, ...) on a TrackDescriptor.
Reserved names: the names of the well-known dimensions are reserved and cannot be used for custom dimensions. They are:
  * `machine`: the machine the track belongs to.
  * `gpu`: the GPU the track belongs to.
  * `cpu`: the CPU the track belongs to.
  * `process`: the process the track belongs to.
  * `thread`: the thread the track belongs to. Their values are derived by trace processor from the typed fields of the TrackDescriptor (e.g. `process`, `thread`) and from import context, and mean the same thing across data sources. A custom dimension using a reserved name is ignored and trace processor records the `track_descriptor_reserved_dimension_name` import error.


A dimension has no scope field: it is declared on the track described by the containing TrackDescriptor and applies to that track and its `parent_uuid` descendants, whether it is a process, thread or any other track. In particular, a dimension declared on a process track doesn't apply to the threads of the process unless their tracks are `parent_uuid` descendants of the process track.
Declaring a _different_ value for a dimension name which is already inherited from an ancestor is invalid: trace processor records an import error and keeps the inherited value.
The dimensions declared on a TrackDescriptor (names and values; the order and `display_name` don't matter) are part of the identity of that track:
  * they are fixed for the lifetime of the track, so every TrackDescriptor emitted for a given `uuid`, including the first one, must declare the same dimensions. A TrackDescriptor declaring different dimensions is rejected as a conflicting reservation and the first one is kept.
  * sibling tracks are only merged (see `TrackDescriptor.sibling_merge_behavior`) if they declare the same dimensions.


Defined in [track_dimension.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/track_dimension.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
| name_iid  | uint64  | Interned version of `name`: corresponds to the `track_dimension_strings` field in InternedData, looked up like `string_value_iid`.  |  
| int_value  | int64  |  
| string_value  | string  |  
| string_value_iid  | uint64  | Interned version of `string_value`: corresponds to the `track_dimension_strings` field in InternedData, looked up in the interned data of the sequence the TrackDescriptor is emitted on. The resolved string is the value, so an interned and an inline string with the same contents are the same value.  |  
| display_name  | string  |  
| display_name_iid  | uint64  | Interned version of `display_name`: corresponds to the `track_dimension_strings` field in InternedData, looked up like `string_value_iid`.  |  
##  GenericKernelTaskStateEvent
GenericKernelTaskStateEvent is the standard proto to capture thread state change events in a generic kernel implementation. This is mainly for the case where scheduler events are not directly supported in the kernel's tracing mechanism.
By capturing these task state events Perfetto is able to infer higher-level events such as context switches and task waking events, providing as much parity as possible with established tracing frameworks such as Linux's ftrace.
Defined in [generic_task.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/generic_kernel/generic_task.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| cpu  | int32  | CPU in which the event occurred.This field is only relevant with the TASK_STATE_RUNNING state. There is no specific meaning to the cpu field in a non-running state event.  |  
| comm  | string  | Command name for the thread.  |  
| tid  | int64  | Thread id.  |  
| state  | New state of the thread.  |  
| prio  | int32  | Priority of the thread.This value is OS agnostic and should only be interpreted based on the kernel who emitted the message.  |  
###  GenericKernelTaskStateEvent.TaskStateEnum
TaskStateEnum represents the valid states of a thread. These states are a generic representation of the actual thread state and don't necessarily map one-to-one to the states the actual OS kernel tracks internally.
Note: Consecutive TASK_STATE_RUNNING states for the same TID is considered an error resulting in potential data loss.
Defined in [generic_task.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/generic_kernel/generic_task.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| TASK_STATE_UNKNOWN  | 0  |  
| TASK_STATE_CREATED  | 1  |  
| TASK_STATE_RUNNABLE  | 2  |  
| TASK_STATE_RUNNING  | 3  |  
| TASK_STATE_INTERRUPTIBLE_SLEEP  | 4  |  
| TASK_STATE_UNINTERRUPTIBLE_SLEEP  | 5  |  
| TASK_STATE_STOPPED  | 6  |  
| TASK_STATE_DEAD  | 7  |  
| TASK_STATE_DESTROYED  | 8  |  
##  GenericKernelCpuFrequencyEvent
GenericKernelCpuFrequencyEvent is the standard proto to capture CPU frequency change events in a generic kernel implementation.
Defined in [generic_power.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/generic_kernel/generic_power.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| cpu  | int32  | CPU in which the event occurred.  |  
| freq_hz  | int64  | Frequency (Hz) of the CPU.  |  
##  GenericKernelTaskRenameEvent
GenericKernelTaskRenameEvent is the standard proto to capture the renaming of a thread.
Defined in [generic_task.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/generic_kernel/generic_task.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| tid  | int64  | Thread id.  |  
| comm  | string  | New command name for the thread.  |  
##  GenericKernelProcessTree
Metadata about the processes and threads in the trace. The main goal of this proto is to provide a generic kernel implementation a mechanism to outline its process structure.
Defined in [generic_task.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/generic_kernel/generic_task.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| processes  | List of processes and threads in the kernel. These lists are incremental and not exhaustive. A process and its threads might show up separately in different ProcessTree messages. A thread might not show up at all, if no sched switch activity was detected, for instance:#0 { processes: [{pid: 10, ...}], threads: [{tid: 11, pid: 10}] } #1 { threads: [{tid: 12, pid: 10}] } #2 { processes: [{pid: 20, ...}], threads: [{tid: 13, pid: 10}] }  |  
| threads  |  
###  GenericKernelProcessTree.Process
Representation of a process.
Defined in [generic_task.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/generic_kernel/generic_task.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| pid  | int64  | Process id.  |  
| ppid  | int64  | Parent process id.  |  
| cmdline  | string  | The command line of the process.If the cmdline has spaces in it, then we use the characters from position 0 to the first instance of the space char (' ') as the name of the process. If no spaces are present, then the entire cmdline is used as the name.  |  
###  GenericKernelProcessTree.Thread
Representation of a thread.
Defined in [generic_task.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/generic_kernel/generic_task.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| tid  | int64  | Thread id.  |  
| pid  | int64  | Id of the parent process.  |  
| comm  | string  | The command name of the thread.  |  
| is_main_thread  | bool  | True if thread is the main thread.  |  
| is_idle  | bool  | True if thread is an idle thread.  |  
##  GenericGpuFrequencyEvent
GenericGpuFrequencyEvent is the standard proto to capture GPU frequency change events in a generic kernel implementation.
Defined in [generic_gpu_frequency.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/generic_kernel/generic_gpu_frequency.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| gpu_id  | uint32  | GPU on which the frequency change occurred.  |  
| frequency_khz  | uint32  | Frequency (kHz) of the GPU.  |  
##  ProcessTree
Metadata about the processes and threads in the trace. Note: this proto was designed to be filled in by traced_probes and should only be populated with accurate information coming from the system. Other trace writers should prefer to fill ThreadDescriptor and ProcessDescriptor in TrackDescriptor.
Defined in [process_tree.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ps/process_tree.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| processes  | List of processes and threads in the client. These lists are incremental and not exhaustive. A process and its threads might show up separately in different ProcessTree messages. A thread might event not show up at all, if no sched_switch activity was detected, for instance:#0 { processes: [{pid: 10, ...}], threads: [{pid: 11, tgid: 10}] } #1 { threads: [{pid: 12, tgid: 10}] } #2 { processes: [{pid: 20, ...}], threads: [{pid: 13, tgid: 10}] }  |  
| threads  |  
| collection_end_timestamp  | uint64  | The time at which we finish collecting this process tree; the top-level packet timestamp is the time at which we begin collection.  |  
###  ProcessTree.Process
Representation of a process.
Defined in [process_tree.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ps/process_tree.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| pid  | int32  | The UNIX process ID, aka thread group ID (as per getpid()) in the root PID namespace.  |  
| ppid  | int32  | The parent process ID, as per getppid().  |  
| cmdline  | string[]  | The command line for the process, as per /proc/pid/cmdline, broken up on NUL bytes.If it is a kernel thread or a zombie, there will only be one cmdline field and it will contain /proc/pid/comm.  |  
| cmdline_is_comm  | bool  | If true, the `cmdline` field was filled with the main thread's "comm" field instead.Introduced in: perfetto v50.  |  
| uid  | int32  | The uid for the process, as per /proc/pid/status.  |  
| nspid  | int32[]  | The non-root-level process IDs if the process runs in a PID namespace.Read from the NSpid entry of /proc//status, with the first element (root-level process ID) omitted.  |  
| process_start_from_boot  | uint64  | Timestamp of when the process was created, in nanoseconds from boot. Parsed from starttime in /proc/pid/stat.Recorded if record_process_age config option is set.Resolution of "clock ticks", usually 10ms.  |  
| is_kthread  | bool  | If true, the process is a kernel thread.Set only on linux v6.4+. For traces from older devices, it is possible to infer most kthreads by checking that they're a descendant of kthreadd (pid=2), or are the idle process (pid=0).Introduced in: perfetto v50.  |  
###  ProcessTree.Thread
Representation of a thread.
Defined in [process_tree.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ps/process_tree.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| tid  | int32  | The thread ID (as per gettid()) in the root PID namespace.  |  
| tgid  | int32  | Thread group id (i.e. the PID of the process, == TID of the main thread)  |  
| name  | string  | The name of the thread.  |  
| nstid  | int32[]  | The non-root-level thread IDs if the thread runs in a PID namespace. Read from the NSpid entry of /proc//status, with the first element (root- level thread ID) omitted.  |  
##  TrackEventRangeOfInterest
This message specifies the "range of interest" for track events. With the `drop_track_event_data_before` option set to `kTrackEventRangeOfInterest`, Trace Processor drops track events outside of this range.
Defined in [range_of_interest.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/range_of_interest.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| start_us  | int64  |  
##  ProcessStats
Per-process periodically sampled stats. These samples are wrapped in a dedicated message (as opposite to be fields in process_tree.proto) because they are dumped at a different rate than cmdline and thread list. Note: not all of these stats will be present in every ProcessStats message and sometimes processes may be missing. This is because counters are cached to reduce emission of counters which do not change.
Defined in [process_stats.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ps/process_stats.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| processes  |  
| collection_end_timestamp  | uint64  | The time at which we finish collecting this batch of samples; the top-level packet timestamp is the time at which we begin collection.  |  
###  ProcessStats.Process
When adding a new field remember to update kProcMemCounterSize in the trace processor.
Defined in [process_stats.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ps/process_stats.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| pid  | int32  |  
| threads  |  
| vm_size_kb  | uint64  | See /proc/[pid]/status in `man 5 proc` for a description of these fields.  |  
| vm_rss_kb  | uint64  |  
| rss_anon_kb  | uint64  |  
| rss_file_kb  | uint64  |  
| rss_shmem_kb  | uint64  |  
| vm_swap_kb  | uint64  |  
| vm_locked_kb  | uint64  |  
| vm_hwm_kb  | uint64  |  
| oom_score_adj  | int64  |  
| is_peak_rss_resettable  | bool  | The peak resident set size is resettable in newer Posix kernels.This field specifies if reset is supported and if the writer had reset the peaks after each process stats recording.  |  
| chrome_private_footprint_kb  | uint32  | Private, shared and swap footprint of the process as measured by Chrome. To know more about these metrics refer to:<https://docs.google.com/document/d/1_WmgE1F5WUrhwkPqJis3dWyOiUmQKvpXp5cd4w86TvA>  |  
| chrome_peak_resident_set_kb  | uint32  |  
| fds  |  
| smr_rss_kb  | uint64  | These fields are set only when scan_smaps_rollup=true  |  
| smr_pss_kb  | uint64  |  
| smr_pss_anon_kb  | uint64  |  
| smr_pss_file_kb  | uint64  |  
| smr_pss_shmem_kb  | uint64  |  
| smr_swap_pss_kb  | uint64  |  
| runtime_user_mode  | uint64  | Time spent scheduled in user mode in nanoseconds. Parsed from utime in /proc/pid/stat. Recorded if record_process_runtime config option is set.Resolution of "clock ticks", usually 10ms.  |  
| runtime_kernel_mode  | uint64  | Time spent scheduled in kernel mode in nanoseconds. Parsed from stime in /proc/pid/stat. Recorded if record_process_runtime config option is set.Resolution of "clock ticks", usually 10ms.  |  
| dmabuf_rss_kb  | uint64  | The total size of all dmabufs referenced by a process via FDs or VMAs.  |  
###  ProcessStats.Thread
Per-thread periodically sampled stats. Note: not all of these stats will be present in every message. See the note for ProcessStats.
Defined in [process_stats.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ps/process_stats.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| tid  | int32  |  
###  ProcessStats.FDInfo
Defined in [process_stats.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ps/process_stats.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| fd  | uint64  |  
| path  | string  |  
##  InodeFileMap
Represents the mapping between inode numbers in a block device and their path on the filesystem
Defined in [inode_file_map.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/filesystem/inode_file_map.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| block_device_id  | uint64  |  
| mount_points  | string[]  | The mount points of the block device, e.g. ["system"].  |  
| entries  | The list of all the entries from the block device  |  
###  InodeFileMap.Entry
Representation of Entry
Defined in [inode_file_map.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/filesystem/inode_file_map.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| inode_number  | uint64  |  
| paths  | string[]  | The path to the file, e.g. "etc/file.xml" List of strings for multiple hardlinks  |  
| type  |  
###  InodeFileMap.Entry.Type
The file type
Defined in [inode_file_map.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/filesystem/inode_file_map.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| UNKNOWN  | 0  |  
| FILE  | 1  |  
| DIRECTORY  | 2  |  
##  ChromeEventBundle
Defined in [chrome_trace_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/chrome/chrome_trace_event.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| trace_events  | [ChromeTraceEvent[]](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeTraceEvent)  | Deprecated, use TrackEvent protos instead.  |  
| metadata  | [ChromeMetadata[]](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeMetadata)  | which contains typed fields.  |  
| legacy_ftrace_output  | string[]  | ftrace output from CrOS and Cast system tracing agents.  |  
| legacy_json_trace  | [ChromeLegacyJsonTrace[]](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeLegacyJsonTrace)  |  
| string_table  | [ChromeStringTableEntry[]](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeStringTableEntry)  | Contents of a string table that's valid for the whole ChromeEventBundle entry.  |  
###  ChromeTraceEvent
Deprecated, use TrackEvent protos instead.
Defined in [chrome_trace_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/chrome/chrome_trace_event.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
| timestamp  | int64  |  
| phase  | int32  |  
| thread_id  | int32  |  
| duration  | int64  |  
| thread_duration  | int64  |  
| scope  | string  |  
| id  | uint64  |  
| flags  | uint32  |  
| category_group_name  | string  |  
| process_id  | int32  |  
| thread_timestamp  | int64  |  
| bind_id  | uint64  |  
| args  |  
| name_index  | uint32  | Takes precedence over respectively `name` and `category_group_name_index` if set, and are indices into `string_table`.  |  
| category_group_name_index  | uint32  |  
###  ChromeTraceEvent.Arg
Defined in [chrome_trace_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/chrome/chrome_trace_event.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
| bool_value  | bool  |  
| uint_value  | uint64  |  
| int_value  | int64  |  
| double_value  | double  |  
| string_value  | string  |  
| pointer_value  | uint64  | Pointers are stored in a separate type as the JSON output treats them differently from other uint64 values.  |  
| json_value  | string  |  
| traced_value  | [ChromeTracedValue](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeTracedValue)  |  
| name_index  | uint32  | Takes precedence over `name` if set, and is an index into `string_table`.  |  
###  ChromeTracedValue
Defined in [chrome_trace_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/chrome/chrome_trace_event.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| nested_type  |  
| dict_keys  | string[]  |  
| dict_values  | [ChromeTracedValue[]](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeTracedValue)  |  
| array_values  | [ChromeTracedValue[]](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeTracedValue)  |  
| int_value  | int32  |  
| double_value  | double  |  
| bool_value  | bool  |  
| string_value  | string  |  
###  ChromeTracedValue.NestedType
Defined in [chrome_trace_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/chrome/chrome_trace_event.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| DICT  | 0  |  
| ARRAY  | 1  |  
###  ChromeMetadata
Defined in [chrome_trace_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/chrome/chrome_trace_event.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
| string_value  | string  |  
| bool_value  | bool  |  
| int_value  | int64  |  
| json_value  | string  |  
###  ChromeLegacyJsonTrace
Subtraces produced in legacy json format by Chrome tracing agents not yet updated to support the new binary format, e.g. ETW and CrOS ARC.
Defined in [chrome_trace_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/chrome/chrome_trace_event.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| type  |  
| data  | string  |  
###  ChromeLegacyJsonTrace.TraceType
Defined in [chrome_trace_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/chrome/chrome_trace_event.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| USER_TRACE  | 0  |  
| SYSTEM_TRACE  | 1  | Deprecated.  |  
###  ChromeStringTableEntry
Defined in [chrome_trace_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/chrome/chrome_trace_event.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| value  | string  |  
| index  | int32  |  
##  ClockSnapshot
A snapshot of clock readings to allow for trace alignment.
Defined in [clock_snapshot.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/clock_snapshot.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| clocks  |  
| primary_trace_clock  | The authoritative clock domain for the trace. When set, this definitively overrides the trace time clock. If not set, the trace time clock remains at its default (BUILTIN_CLOCK_TRACE_FILE), unless a format-specific fallback applies (e.g. BOOTTIME for legacy proto traces without clock snapshots). Trace processor will attempt to translate packet/event timestamps from various data sources (and their chosen clock domains) to this domain during import.  |  
###  ClockSnapshot.Clock
Defined in [clock_snapshot.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/clock_snapshot.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| clock_id  | uint32  | Clock IDs have the following semantic:[1, 63]: Builtin types, see BuiltinClock from ../common/builtin_clock.proto.[64, 127]: User-defined clocks. These clocks are sequence-scoped. They are only valid within the same `trusted_packet_sequence_id` (i.e. only for TracePacket(s) emitted by the same TraceWriter that emitted the clock snapshot).[128, MAX]: Reserved for future use. The idea is to allow global clock IDs and setting this ID to hash(full_clock_name) & ~127.  |  
| timestamp  | uint64  | Absolute timestamp. Unit is ns unless specified otherwise by the unit_multiplier_ns field below.  |  
| is_incremental  | bool  | When true each TracePacket's timestamp should be interpreted as a delta from the last TracePacket's timestamp (referencing this clock) emitted by the same packet_sequence_id. Should only be used for user-defined sequence-local clocks. The first packet timestamp after each ClockSnapshot that contains this clock is relative to the `timestamp` in the ClockSnapshot.  |  
| unit_multiplier_ns  | uint64  | Allows to specify a custom unit different than the default (ns) for this clock domain. * A multiplier of 1000 means that a timestamp = 3 should be interpreted as 3000 ns = 3 us.* All snapshots for the same clock within a trace need to use the same unit.* `unit_multiplier_ns` is _not_ supported for the `primary_trace_clock`.  |  
###  BuiltinClock
Builtin clock domains used in Perfetto traces.
The default trace time clock is BUILTIN_CLOCK_TRACE_FILE: a synthetic clock representing the trace file's own timeline. Each trace file gets its own instance (scoped by trace file index).
For backwards compatibility, Perfetto proto traces register BOOTTIME as a fallback: if the first timestamp conversion uses a clock other than the trace file clock and no explicit clock snapshot data exists, the trace time is switched to BOOTTIME. This fallback does not fire for modern traces that include ClockSnapshots or that only use the trace file clock directly.
The `primary_trace_clock` field in ClockSnapshot can definitively override the trace time clock regardless of the above.
Defined in [builtin_clock.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/common/builtin_clock.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| BUILTIN_CLOCK_UNKNOWN  | 0  |  
| BUILTIN_CLOCK_REALTIME  | 1  | Corresponds to CLOCK_REALTIME. See clock_gettime(2).  |  
| BUILTIN_CLOCK_REALTIME_COARSE  | 2  | Corresponds to CLOCK_REALTIME_COARSE. See clock_gettime(2).  |  
| BUILTIN_CLOCK_MONOTONIC  | 3  | Corresponds to CLOCK_MONOTONIC. See clock_gettime(2).  |  
| BUILTIN_CLOCK_MONOTONIC_COARSE  | 4  | Corresponds to CLOCK_MONOTONIC_COARSE. See clock_gettime(2).  |  
| BUILTIN_CLOCK_MONOTONIC_RAW  | 5  | Corresponds to CLOCK_MONOTONIC_RAW. See clock_gettime(2).  |  
| BUILTIN_CLOCK_BOOTTIME  | 6  | Corresponds to CLOCK_BOOTTIME. See clock_gettime(2).For proto traces, this is used as a backwards-compatible fallback trace time clock when no explicit clock snapshots are present.  |  
| BUILTIN_CLOCK_TSC  | 9  | TSC (Time Stamp Counter). Architecture-specific high-resolution counter.  |  
| BUILTIN_CLOCK_PERF  | 10  | Corresponds to the perf event clock (PERF_CLOCK).  |  
| BUILTIN_CLOCK_TRACE_FILE  | 11  | A synthetic clock representing the trace file's own timeline. Each trace file gets its own instance (scoped by trace file index). This is the default trace time clock before any clock snapshot or format-specific override takes effect.  |  
| BUILTIN_CLOCK_MAX_ID  | 63  |  
##  SysStats
Various Linux system stat counters from /proc. The fields in this message can be reported at different rates and with different granularity. See sys_stats_config.proto.
Defined in [sys_stats.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/sys_stats/sys_stats.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| meminfo  | [MeminfoValue[]](https://perfetto.dev/docs/reference/trace-packet-proto#SysStats.MeminfoValue)  |  
| vmstat  |  
| cpu_stat  | One entry per cpu.  |  
| num_forks  | uint64  | Num processes forked since boot.Populated only if FORK_COUNT in config.stat_counters.  |  
| num_irq_total  | uint64  | Number of interrupts, broken by IRQ number.Populated only if IRQ_COUNTS in config.stat_counters. Total num of irqs serviced since boot.  |  
| num_irq  | [InterruptCount[]](https://perfetto.dev/docs/reference/trace-packet-proto#SysStats.InterruptCount)  |  
| num_softirq_total  | uint64  | Number of softirqs, broken by softirq number.Populated only if SOFTIRQ_COUNTS in config.stat_counters. Total num of softirqs since boot.  |  
| num_softirq  | [InterruptCount[]](https://perfetto.dev/docs/reference/trace-packet-proto#SysStats.InterruptCount)  | Per-softirq count.  |  
| collection_end_timestamp  | uint64  | The time at which we finish collecting this set of samples; the top-level packet timestamp is the time at which we begin collection.  |  
| devfreq  | [DevfreqValue[]](https://perfetto.dev/docs/reference/trace-packet-proto#SysStats.DevfreqValue)  | One entry per device.  |  
| cpufreq_khz  | uint32[]  | Cpu current frequency from /sys/devices/system/cpu/cpu*/cpufreq/cpuinfo_cur_freq in kHz.One entry per cpu. Report 0 for offline cpu  |  
| buddy_info  | One entry per each node's zones.  |  
| disk_stat  | One entry per disk device.  |  
| psi  | One entry per PsiResource type.  |  
| thermal_zone  |  
| cpuidle_state  | [CpuIdleState[]](https://perfetto.dev/docs/reference/trace-packet-proto#SysStats.CpuIdleState)  |  
| gpufreq_mhz  | uint64[]  | Read GPU frequency info on Intel/AMD devices.  |  
| slab_info  |  
###  SysStats.MeminfoValue
Counters from /proc/meminfo. Values are in KB.
Defined in [sys_stats.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/sys_stats/sys_stats.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| key  | [MeminfoCounters](https://perfetto.dev/docs/reference/trace-packet-proto#MeminfoCounters)  |  
| value  | uint64  |  
###  MeminfoCounters
When editing entries here remember also to update "sys_stats_counters.h" with the corresponding string definitions for the actual /proc files parser.
Counter definitions for Linux's /proc/meminfo.
Defined in [sys_stats_counters.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/common/sys_stats_counters.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| MEMINFO_UNSPECIFIED  | 0  |  
| MEMINFO_MEM_TOTAL  | 1  |  
| MEMINFO_MEM_FREE  | 2  |  
| MEMINFO_MEM_AVAILABLE  | 3  |  
| MEMINFO_BUFFERS  | 4  |  
| MEMINFO_CACHED  | 5  |  
| MEMINFO_SWAP_CACHED  | 6  |  
| MEMINFO_ACTIVE  | 7  |  
| MEMINFO_INACTIVE  | 8  |  
| MEMINFO_ACTIVE_ANON  | 9  |  
| MEMINFO_INACTIVE_ANON  | 10  |  
| MEMINFO_ACTIVE_FILE  | 11  |  
| MEMINFO_INACTIVE_FILE  | 12  |  
| MEMINFO_UNEVICTABLE  | 13  |  
| MEMINFO_MLOCKED  | 14  |  
| MEMINFO_SWAP_TOTAL  | 15  |  
| MEMINFO_SWAP_FREE  | 16  |  
| MEMINFO_DIRTY  | 17  |  
| MEMINFO_WRITEBACK  | 18  |  
| MEMINFO_ANON_PAGES  | 19  |  
| MEMINFO_MAPPED  | 20  |  
| MEMINFO_SHMEM  | 21  |  
| MEMINFO_SLAB  | 22  |  
| MEMINFO_SLAB_RECLAIMABLE  | 23  |  
| MEMINFO_SLAB_UNRECLAIMABLE  | 24  |  
| MEMINFO_KERNEL_STACK  | 25  |  
| MEMINFO_PAGE_TABLES  | 26  |  
| MEMINFO_COMMIT_LIMIT  | 27  |  
| MEMINFO_COMMITED_AS  | 28  |  
| MEMINFO_VMALLOC_TOTAL  | 29  |  
| MEMINFO_VMALLOC_USED  | 30  |  
| MEMINFO_VMALLOC_CHUNK  | 31  |  
| MEMINFO_CMA_TOTAL  | 32  |  
| MEMINFO_CMA_FREE  | 33  |  
| MEMINFO_GPU  | 34  |  
| MEMINFO_ZRAM  | 35  |  
| MEMINFO_MISC  | 36  |  
| MEMINFO_ION_HEAP  | 37  |  
| MEMINFO_ION_HEAP_POOL  | 38  |  
###  SysStats.VmstatValue
Counter from /proc/vmstat. Units are often pages, not KB.
Defined in [sys_stats.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/sys_stats/sys_stats.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| key  | [VmstatCounters](https://perfetto.dev/docs/reference/trace-packet-proto#VmstatCounters)  |  
| value  | uint64  |  
###  VmstatCounters
Counter definitions for Linux's /proc/vmstat.
Defined in [sys_stats_counters.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/common/sys_stats_counters.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| VMSTAT_UNSPECIFIED  | 0  |  
| VMSTAT_NR_FREE_PAGES  | 1  |  
| VMSTAT_NR_ALLOC_BATCH  | 2  |  
| VMSTAT_NR_INACTIVE_ANON  | 3  |  
| VMSTAT_NR_ACTIVE_ANON  | 4  |  
| VMSTAT_NR_INACTIVE_FILE  | 5  |  
| VMSTAT_NR_ACTIVE_FILE  | 6  |  
| VMSTAT_NR_UNEVICTABLE  | 7  |  
| VMSTAT_NR_MLOCK  | 8  |  
| VMSTAT_NR_ANON_PAGES  | 9  |  
| VMSTAT_NR_MAPPED  | 10  |  
| VMSTAT_NR_FILE_PAGES  | 11  |  
| VMSTAT_NR_DIRTY  | 12  |  
| VMSTAT_NR_WRITEBACK  | 13  |  
| VMSTAT_NR_SLAB_RECLAIMABLE  | 14  |  
| VMSTAT_NR_SLAB_UNRECLAIMABLE  | 15  |  
| VMSTAT_NR_PAGE_TABLE_PAGES  | 16  |  
| VMSTAT_NR_KERNEL_STACK  | 17  |  
| VMSTAT_NR_OVERHEAD  | 18  |  
| VMSTAT_NR_UNSTABLE  | 19  |  
| VMSTAT_NR_BOUNCE  | 20  |  
| VMSTAT_NR_VMSCAN_WRITE  | 21  |  
| VMSTAT_NR_VMSCAN_IMMEDIATE_RECLAIM  | 22  |  
| VMSTAT_NR_WRITEBACK_TEMP  | 23  |  
| VMSTAT_NR_ISOLATED_ANON  | 24  |  
| VMSTAT_NR_ISOLATED_FILE  | 25  |  
| VMSTAT_NR_SHMEM  | 26  |  
| VMSTAT_NR_DIRTIED  | 27  |  
| VMSTAT_NR_WRITTEN  | 28  |  
| VMSTAT_NR_PAGES_SCANNED  | 29  |  
| VMSTAT_WORKINGSET_REFAULT  | 30  |  
| VMSTAT_WORKINGSET_ACTIVATE  | 31  |  
| VMSTAT_WORKINGSET_NODERECLAIM  | 32  |  
| VMSTAT_NR_ANON_TRANSPARENT_HUGEPAGES  | 33  |  
| VMSTAT_NR_FREE_CMA  | 34  |  
| VMSTAT_NR_SWAPCACHE  | 35  |  
| VMSTAT_NR_DIRTY_THRESHOLD  | 36  |  
| VMSTAT_NR_DIRTY_BACKGROUND_THRESHOLD  | 37  |  
| VMSTAT_PGPGIN  | 38  |  
| VMSTAT_PGPGOUT  | 39  |  
| VMSTAT_PGPGOUTCLEAN  | 40  |  
| VMSTAT_PSWPIN  | 41  |  
| VMSTAT_PSWPOUT  | 42  |  
| VMSTAT_PGALLOC_DMA  | 43  |  
| VMSTAT_PGALLOC_NORMAL  | 44  |  
| VMSTAT_PGALLOC_MOVABLE  | 45  |  
| VMSTAT_PGFREE  | 46  |  
| VMSTAT_PGACTIVATE  | 47  |  
| VMSTAT_PGDEACTIVATE  | 48  |  
| VMSTAT_PGFAULT  | 49  |  
| VMSTAT_PGMAJFAULT  | 50  |  
| VMSTAT_PGREFILL_DMA  | 51  |  
| VMSTAT_PGREFILL_NORMAL  | 52  |  
| VMSTAT_PGREFILL_MOVABLE  | 53  |  
| VMSTAT_PGSTEAL_KSWAPD_DMA  | 54  |  
| VMSTAT_PGSTEAL_KSWAPD_NORMAL  | 55  |  
| VMSTAT_PGSTEAL_KSWAPD_MOVABLE  | 56  |  
| VMSTAT_PGSTEAL_DIRECT_DMA  | 57  |  
| VMSTAT_PGSTEAL_DIRECT_NORMAL  | 58  |  
| VMSTAT_PGSTEAL_DIRECT_MOVABLE  | 59  |  
| VMSTAT_PGSCAN_KSWAPD_DMA  | 60  |  
| VMSTAT_PGSCAN_KSWAPD_NORMAL  | 61  |  
| VMSTAT_PGSCAN_KSWAPD_MOVABLE  | 62  |  
| VMSTAT_PGSCAN_DIRECT_DMA  | 63  |  
| VMSTAT_PGSCAN_DIRECT_NORMAL  | 64  |  
| VMSTAT_PGSCAN_DIRECT_MOVABLE  | 65  |  
| VMSTAT_PGSCAN_DIRECT_THROTTLE  | 66  |  
| VMSTAT_PGINODESTEAL  | 67  |  
| VMSTAT_SLABS_SCANNED  | 68  |  
| VMSTAT_KSWAPD_INODESTEAL  | 69  |  
| VMSTAT_KSWAPD_LOW_WMARK_HIT_QUICKLY  | 70  |  
| VMSTAT_KSWAPD_HIGH_WMARK_HIT_QUICKLY  | 71  |  
| VMSTAT_PAGEOUTRUN  | 72  |  
| VMSTAT_ALLOCSTALL  | 73  |  
| VMSTAT_PGROTATED  | 74  |  
| VMSTAT_DROP_PAGECACHE  | 75  |  
| VMSTAT_DROP_SLAB  | 76  |  
| VMSTAT_PGMIGRATE_SUCCESS  | 77  |  
| VMSTAT_PGMIGRATE_FAIL  | 78  |  
| VMSTAT_COMPACT_MIGRATE_SCANNED  | 79  |  
| VMSTAT_COMPACT_FREE_SCANNED  | 80  |  
| VMSTAT_COMPACT_ISOLATED  | 81  |  
| VMSTAT_COMPACT_STALL  | 82  |  
| VMSTAT_COMPACT_FAIL  | 83  |  
| VMSTAT_COMPACT_SUCCESS  | 84  |  
| VMSTAT_COMPACT_DAEMON_WAKE  | 85  |  
| VMSTAT_UNEVICTABLE_PGS_CULLED  | 86  |  
| VMSTAT_UNEVICTABLE_PGS_SCANNED  | 87  |  
| VMSTAT_UNEVICTABLE_PGS_RESCUED  | 88  |  
| VMSTAT_UNEVICTABLE_PGS_MLOCKED  | 89  |  
| VMSTAT_UNEVICTABLE_PGS_MUNLOCKED  | 90  |  
| VMSTAT_UNEVICTABLE_PGS_CLEARED  | 91  |  
| VMSTAT_UNEVICTABLE_PGS_STRANDED  | 92  |  
| VMSTAT_NR_ZSPAGES  | 93  |  
| VMSTAT_NR_ION_HEAP  | 94  |  
| VMSTAT_NR_GPU_HEAP  | 95  |  
| VMSTAT_ALLOCSTALL_DMA  | 96  |  
| VMSTAT_ALLOCSTALL_MOVABLE  | 97  |  
| VMSTAT_ALLOCSTALL_NORMAL  | 98  |  
| VMSTAT_COMPACT_DAEMON_FREE_SCANNED  | 99  |  
| VMSTAT_COMPACT_DAEMON_MIGRATE_SCANNED  | 100  |  
| VMSTAT_NR_FASTRPC  | 101  |  
| VMSTAT_NR_INDIRECTLY_RECLAIMABLE  | 102  |  
| VMSTAT_NR_ION_HEAP_POOL  | 103  |  
| VMSTAT_NR_KERNEL_MISC_RECLAIMABLE  | 104  |  
| VMSTAT_NR_SHADOW_CALL_STACK_BYTES  | 105  |  
| VMSTAT_NR_SHMEM_HUGEPAGES  | 106  |  
| VMSTAT_NR_SHMEM_PMDMAPPED  | 107  |  
| VMSTAT_NR_UNRECLAIMABLE_PAGES  | 108  |  
| VMSTAT_NR_ZONE_ACTIVE_ANON  | 109  |  
| VMSTAT_NR_ZONE_ACTIVE_FILE  | 110  |  
| VMSTAT_NR_ZONE_INACTIVE_ANON  | 111  |  
| VMSTAT_NR_ZONE_INACTIVE_FILE  | 112  |  
| VMSTAT_NR_ZONE_UNEVICTABLE  | 113  |  
| VMSTAT_NR_ZONE_WRITE_PENDING  | 114  |  
| VMSTAT_OOM_KILL  | 115  |  
| VMSTAT_PGLAZYFREE  | 116  |  
| VMSTAT_PGLAZYFREED  | 117  |  
| VMSTAT_PGREFILL  | 118  |  
| VMSTAT_PGSCAN_DIRECT  | 119  |  
| VMSTAT_PGSCAN_KSWAPD  | 120  |  
| VMSTAT_PGSKIP_DMA  | 121  |  
| VMSTAT_PGSKIP_MOVABLE  | 122  |  
| VMSTAT_PGSKIP_NORMAL  | 123  |  
| VMSTAT_PGSTEAL_DIRECT  | 124  |  
| VMSTAT_PGSTEAL_KSWAPD  | 125  |  
| VMSTAT_SWAP_RA  | 126  |  
| VMSTAT_SWAP_RA_HIT  | 127  |  
| VMSTAT_WORKINGSET_RESTORE  | 128  |  
| VMSTAT_ALLOCSTALL_DEVICE  | 129  |  
| VMSTAT_ALLOCSTALL_DMA32  | 130  |  
| VMSTAT_BALLOON_DEFLATE  | 131  |  
| VMSTAT_BALLOON_INFLATE  | 132  |  
| VMSTAT_BALLOON_MIGRATE  | 133  |  
| VMSTAT_CMA_ALLOC_FAIL  | 134  |  
| VMSTAT_CMA_ALLOC_SUCCESS  | 135  |  
| VMSTAT_NR_FILE_HUGEPAGES  | 136  |  
| VMSTAT_NR_FILE_PMDMAPPED  | 137  |  
| VMSTAT_NR_FOLL_PIN_ACQUIRED  | 138  |  
| VMSTAT_NR_FOLL_PIN_RELEASED  | 139  |  
| VMSTAT_NR_SEC_PAGE_TABLE_PAGES  | 140  |  
| VMSTAT_NR_SHADOW_CALL_STACK  | 141  |  
| VMSTAT_NR_SWAPCACHED  | 142  |  
| VMSTAT_NR_THROTTLED_WRITTEN  | 143  |  
| VMSTAT_PGALLOC_DEVICE  | 144  |  
| VMSTAT_PGALLOC_DMA32  | 145  |  
| VMSTAT_PGDEMOTE_DIRECT  | 146  |  
| VMSTAT_PGDEMOTE_KSWAPD  | 147  |  
| VMSTAT_PGREUSE  | 148  |  
| VMSTAT_PGSCAN_ANON  | 149  |  
| VMSTAT_PGSCAN_FILE  | 150  |  
| VMSTAT_PGSKIP_DEVICE  | 151  |  
| VMSTAT_PGSKIP_DMA32  | 152  |  
| VMSTAT_PGSTEAL_ANON  | 153  |  
| VMSTAT_PGSTEAL_FILE  | 154  |  
| VMSTAT_THP_COLLAPSE_ALLOC  | 155  |  
| VMSTAT_THP_COLLAPSE_ALLOC_FAILED  | 156  |  
| VMSTAT_THP_DEFERRED_SPLIT_PAGE  | 157  |  
| VMSTAT_THP_FAULT_ALLOC  | 158  |  
| VMSTAT_THP_FAULT_FALLBACK  | 159  |  
| VMSTAT_THP_FAULT_FALLBACK_CHARGE  | 160  |  
| VMSTAT_THP_FILE_ALLOC  | 161  |  
| VMSTAT_THP_FILE_FALLBACK  | 162  |  
| VMSTAT_THP_FILE_FALLBACK_CHARGE  | 163  |  
| VMSTAT_THP_FILE_MAPPED  | 164  |  
| VMSTAT_THP_MIGRATION_FAIL  | 165  |  
| VMSTAT_THP_MIGRATION_SPLIT  | 166  |  
| VMSTAT_THP_MIGRATION_SUCCESS  | 167  |  
| VMSTAT_THP_SCAN_EXCEED_NONE_PTE  | 168  |  
| VMSTAT_THP_SCAN_EXCEED_SHARE_PTE  | 169  |  
| VMSTAT_THP_SCAN_EXCEED_SWAP_PTE  | 170  |  
| VMSTAT_THP_SPLIT_PAGE  | 171  |  
| VMSTAT_THP_SPLIT_PAGE_FAILED  | 172  |  
| VMSTAT_THP_SPLIT_PMD  | 173  |  
| VMSTAT_THP_SWPOUT  | 174  |  
| VMSTAT_THP_SWPOUT_FALLBACK  | 175  |  
| VMSTAT_THP_ZERO_PAGE_ALLOC  | 176  |  
| VMSTAT_THP_ZERO_PAGE_ALLOC_FAILED  | 177  |  
| VMSTAT_VMA_LOCK_ABORT  | 178  |  
| VMSTAT_VMA_LOCK_MISS  | 179  |  
| VMSTAT_VMA_LOCK_RETRY  | 180  |  
| VMSTAT_VMA_LOCK_SUCCESS  | 181  |  
| VMSTAT_WORKINGSET_ACTIVATE_ANON  | 182  |  
| VMSTAT_WORKINGSET_ACTIVATE_FILE  | 183  |  
| VMSTAT_WORKINGSET_NODES  | 184  |  
| VMSTAT_WORKINGSET_REFAULT_ANON  | 185  |  
| VMSTAT_WORKINGSET_REFAULT_FILE  | 186  |  
| VMSTAT_WORKINGSET_RESTORE_ANON  | 187  |  
| VMSTAT_WORKINGSET_RESTORE_FILE  | 188  |  
###  SysStats.CpuTimes
Times in each mode, since boot. Unit: nanoseconds.
Defined in [sys_stats.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/sys_stats/sys_stats.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| cpu_id  | uint32  |  
| user_ns  | uint64  | Time spent in user mode.  |  
| user_nice_ns  | uint64  | Time spent in user mode (low prio).  |  
| system_mode_ns  | uint64  | Time spent in system mode.  |  
| idle_ns  | uint64  | Time spent in the idle task.  |  
| io_wait_ns  | uint64  | Time spent waiting for I/O.  |  
| irq_ns  | uint64  | Time spent servicing interrupts.  |  
| softirq_ns  | uint64  | Time spent servicing softirqs.  |  
| steal_ns  | uint64  | Time spent executing something else on host than this guest.  |  
###  SysStats.InterruptCount
Defined in [sys_stats.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/sys_stats/sys_stats.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| irq  | int32  |  
| count  | uint64  |  
###  SysStats.DevfreqValue
Frequencies for /sys/class/devfreq/ entries in kHz.
Defined in [sys_stats.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/sys_stats/sys_stats.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| key  | string  |  
| value  | uint64  |  
###  SysStats.BuddyInfo
Defined in [sys_stats.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/sys_stats/sys_stats.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| node  | string  |  
| zone  | string  |  
| order_pages  | uint32[]  |  
###  SysStats.DiskStat
Counters from /proc/diskstats.
Defined in [sys_stats.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/sys_stats/sys_stats.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| device_name  | string  |  
| read_sectors  | uint64  |  
| read_time_ms  | uint64  |  
| write_sectors  | uint64  |  
| write_time_ms  | uint64  |  
| discard_sectors  | uint64  |  
| discard_time_ms  | uint64  |  
| flush_count  | uint64  |  
| flush_time_ms  | uint64  |  
###  SysStats.PsiSample
Reading from /proc/pressure/_. Note that /proc/pressure/_ exposes historical average utilization values (as a %), but we don't yet sample those. They could easily be added as additional fields should the total stall time readings be insufficient.
Defined in [sys_stats.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/sys_stats/sys_stats.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| resource  |  
| total_ns  | uint64  | Total absolute stall time (in nanos) for a given resource.While PSI readings are in micros, we store in nanos for consistency with most other time-based counters.  |  
###  SysStats.PsiSample.PsiResource
Type of resource that may have exhibited pressure stalls.
  * _SOME indicates some resource tasks stalled.
  * _FULL indicates all non-idle resource tasks stalled simultaneously.


Defined in [sys_stats.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/sys_stats/sys_stats.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| PSI_RESOURCE_UNSPECIFIED  | 0  |  
| PSI_RESOURCE_CPU_SOME  | 1  |  
| PSI_RESOURCE_CPU_FULL  | 2  |  
| PSI_RESOURCE_IO_SOME  | 3  |  
| PSI_RESOURCE_IO_FULL  | 4  |  
| PSI_RESOURCE_MEMORY_SOME  | 5  |  
| PSI_RESOURCE_MEMORY_FULL  | 6  |  
###  SysStats.ThermalZone
Reading from /sys/class/thermal/*.
Defined in [sys_stats.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/sys_stats/sys_stats.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
| temp  | uint64  |  
| type  | string  |  
###  SysStats.CpuIdleState
Defined in [sys_stats.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/sys_stats/sys_stats.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| cpu_id  | uint32  |  
| cpuidle_state_entry  | [CpuIdleStateEntry[]](https://perfetto.dev/docs/reference/trace-packet-proto#SysStats.CpuIdleStateEntry)  |  
###  SysStats.CpuIdleStateEntry
Reading from /sys/devices/system/cpu/cpu*/cpuidle/state*.
Defined in [sys_stats.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/sys_stats/sys_stats.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| state  | string  | Name of the idle state, e.g. C1-C10  |  
| duration_us  | uint64  |  
###  SysStats.SlabInfo
Reading from /proc/slabinfo.
Defined in [sys_stats.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/sys_stats/sys_stats.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
| pages_per_slab  | uint32  |  
| num_slabs  | uint32  |  
##  TraceUuid
A random unique ID that identifies the trace. This message has been introduced in v32. Prior to that, the UUID was only (optionally) present in the TraceConfig.trace_uuid_msb/lsb fields. This has been moved to a standalone packet to deal with new use-cases for go/gapless-aot, where the same tracing session can be serialized several times, in which case the UUID is changed on each snapshot and does not match the one in the TraceConfig.
Defined in [trace_uuid.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/trace_uuid.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| msb  | int64  |  
| lsb  | int64  |  
##  FtraceStats
Errors and kernel buffer stats for the ftrace data source.
Defined in [ftrace_stats.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ftrace_stats.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| phase  | A pair of FtraceStats is written on every trace flush:* START_OF_TRACE - stats recorded at the beginning of the trace.* END_OF_TRACE - stats recorded during the flush. In other words shortly before this packet was written. For simple traces this will be once at the end of the trace.  |  
| cpu_stats  | [FtraceCpuStats[]](https://perfetto.dev/docs/reference/trace-packet-proto#FtraceCpuStats)  | Per-CPU stats (one entry for each CPU).  |  
| kernel_symbols_parsed  | uint32  | When FtraceConfig.symbolize_ksyms = true, this records the number of symbols parsed from /proc/kallsyms, whether they have been seen in the trace or not. It can be used to debug kptr_restrict or security-related errors.Note: this will be valid only when phase = END_OF_TRACE. The symbolizer is initialized. When START_OF_TRACE is emitted it is not ready yet.  |  
| kernel_symbols_mem_kb  | uint32  | The memory used by the kernel symbolizer (KernelSymbolMap.size_bytes()).  |  
| atrace_errors  | string  | Atrace errors (even non-fatal ones) are reported here. A typical example is one or more atrace categories not available on the device.  |  
| exclusive_feature_error  | string  | Error message due to exclusivity violation of a single-tenant feature.  |  
| unknown_ftrace_events  | string[]  | Ftrace events requested by the config but not present on device.  |  
| failed_ftrace_events  | string[]  | Ftrace events requested by the config and present on device, but which we failed to enable due to permissions, or due to a conflicting option (currently FtraceConfig.disable_generic_events).  |  
| preserve_ftrace_buffer  | bool  | The data source was configured to preserve existing events in the ftrace buffer before the start of the trace.  |  
| ftrace_parse_errors  | [FtraceParseStatus[]](https://perfetto.dev/docs/reference/trace-packet-proto#FtraceParseStatus)  | Unique errors encountered during reading and parsing of the raw ftrace data. Ring buffer ABI related errors will also be recorded in the affected FtraceEventBundles with a timestamp.Any traces with entries in this field should be investigated, as they indicate a bug in perfetto or the kernel.  |  
| kprobe_stats  | [FtraceKprobeStats](https://perfetto.dev/docs/reference/trace-packet-proto#FtraceKprobeStats)  | Kprobe profile stats for functions hits and misses  |  
| cpu_buffer_size_pages  | uint32  | Per-cpu buffer size as returned by buffer_size_kb in pages (rounded up).Added in: perfetto v52.  |  
| cached_cpu_buffer_size_pages  | uint32  | Per-cpu buffer size as cached by our implementation (ftrace muxer), based on the value we're writing into the tracefs control file. Might not be exactly equal to `cpu_buffer_size_pages` due to the kernel allocating extra scratch pages (and/or other factors). Added in: perfetto v52.  |  
###  FtraceStats.Phase
Defined in [ftrace_stats.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ftrace_stats.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| UNSPECIFIED  | 0  |  
| START_OF_TRACE  | 1  |  
| END_OF_TRACE  | 2  |  
###  FtraceCpuStats
Per-CPU kernel buffer stats for the ftrace data source gathered from /sys/kernel/tracing/per_cpu/cpuX/stats.
Defined in [ftrace_stats.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ftrace_stats.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| cpu  | uint64  | CPU index.  |  
| entries  | uint64  | Number of entries currently in the kernel buffer.  |  
| overrun  | uint64  | Number of events lost in kernel buffers due to overwriting of old events before userspace had a chance to drain them. Valid if the buffer is in "overwrite" mode, otherwise see `dropped_events`.  |  
| commit_overrun  | uint64  | This should always be zero. If not the buffer size is way too small or something went wrong with the tracer. Quoting the kernel: "number of commits failing due to the buffer wrapping around while there are uncommitted events, such as during an interrupt storm".  |  
| bytes_read  | uint64  | Size of entries currently in the kernel buffer (see `entries`) in bytes.The field should be named "bytes", but is misnamed for historical reasons.This value has known inaccuracies before Linux v6.6:<https://github.com/torvalds/linux/commit/45d99ea>  |  
| oldest_event_ts  | double  | The timestamp for the oldest event still in the ring buffer.Unit: seconds for typical trace clocks (i.e. not tsc/counter).  |  
| now_ts  | double  | The current timestamp.Unit: seconds for typical trace clocks (i.e. not tsc/counter).  |  
| dropped_events  | uint64  | If the kernel buffer has overwrite mode disabled, this will show the number of new events that were lost because the buffer was full. This is similar to `overrun` but only for the overwrite=false case.  |  
| read_events  | uint64  | The number of events read (consumed) from the buffer by userspace.  |  
###  FtraceParseStatus
Defined in [ftrace_stats.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ftrace_stats.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| FTRACE_STATUS_UNSPECIFIED  | 0  |  
| FTRACE_STATUS_OK  | 1  | Not written, used for convenience of implementation:  |  
| FTRACE_STATUS_UNEXPECTED_READ_ERROR  | 2  | Issues with reading data out of the ftrace ring buffer:  |  
| FTRACE_STATUS_PARTIAL_PAGE_READ  | 3  |  
| FTRACE_STATUS_ABI_INVALID_PAGE_HEADER  | 4  | Ring buffer binary data not matching our understanding of the layout:  |  
| FTRACE_STATUS_ABI_SHORT_EVENT_HEADER  | 5  |  
| FTRACE_STATUS_ABI_NULL_PADDING  | 6  |  
| FTRACE_STATUS_ABI_SHORT_PADDING_LENGTH  | 7  |  
| FTRACE_STATUS_ABI_INVALID_PADDING_LENGTH  | 8  |  
| FTRACE_STATUS_ABI_SHORT_TIME_EXTEND  | 9  |  
| FTRACE_STATUS_ABI_SHORT_TIME_STAMP  | 10  |  
| FTRACE_STATUS_ABI_SHORT_DATA_LENGTH  | 11  |  
| FTRACE_STATUS_ABI_ZERO_DATA_LENGTH  | 12  |  
| FTRACE_STATUS_ABI_INVALID_DATA_LENGTH  | 13  |  
| FTRACE_STATUS_ABI_SHORT_EVENT_ID  | 14  |  
| FTRACE_STATUS_ABI_END_OVERFLOW  | 15  |  
| FTRACE_STATUS_SHORT_COMPACT_EVENT  | 16  | Issues with parsing the event payload:  |  
| FTRACE_STATUS_INVALID_EVENT  | 17  |  
###  FtraceKprobeStats
Kprobe statistical data, gathered from /sys/kernel/tracing/kprobe_profile.
Defined in [ftrace_stats.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ftrace_stats.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| hits  | int64  | Cumulative number of kprobe events generated for this function  |  
| misses  | int64  | Cumulative number of kprobe events that could not be generated for this function and were missed. This happens when too much nesting happens between a kprobe and its kretprobe, overflowing the maxactives buffer.  |  
##  TraceStats
Statistics for the internals of the tracing service.
Defined in [trace_stats.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/common/trace_stats.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| buffer_stats  | Stats for the TraceBuffer(s) of the current trace session.  |  
| chunk_payload_histogram_def  | int64[]  | The thresholds of each the `writer_stats` histogram buckets. This is emitted only once as all WriterStats share the same bucket layout.This field has the same cardinality of the `writer_stats.chunk_payload_histogram_{counts,sum}` - 1.(The -1 is because the last overflow bucket is not reported in the _def).An array of values [10, 100, 1000] in the _def array means that there are four buckets (3 + the implicit overflow bucket):[0]: x <= 10; [1]: 100 < x <= 1000; [2]: 1000 < x <= 1000; [3]: x > 1000.  |  
| writer_stats  |  
| producers_connected  | uint32  | Num. producers connected (whether they are involved in the current tracing session or not).  |  
| producers_seen  | uint64  | Num. producers ever seen for all trace sessions since startup (it's a good proxy for inferring num. producers crashed / killed).  |  
| data_sources_registered  | uint32  | Num. data sources registered for all trace sessions.  |  
| data_sources_seen  | uint64  | Num. data sources ever seen for all trace sessions since startup.  |  
| tracing_sessions  | uint32  | Num. concurrently active tracing sessions.  |  
| total_buffers  | uint32  | Num. buffers for all tracing session (not just the current one). This will be >= buffer_stats.size(), because the latter is only about the current session.  |  
| chunks_discarded  | uint64  | Num. chunks that were discarded by the service before attempting to commit them to a buffer, e.g. because the producer specified an invalid buffer ID.  |  
| patches_discarded  | uint64  | Num. patches that were discarded by the service before attempting to apply them to a buffer, e.g. because the producer specified an invalid buffer ID.  |  
| invalid_packets  | uint64  | Packets that failed validation of the TrustedPacket. If this is > 0, there is a bug in the producer.  |  
| filter_stats  |  
| flushes_requested  | uint64  | Count of Flush() requests (either from the Consumer, or self-induced periodic flushes). The final Flush() is also included in the count.  |  
| flushes_succeeded  | uint64  | The count of the Flush() requests that were completed successfully.In a well behaving trace this should always be == `flush_requests`.  |  
| flushes_failed  | uint64  | The count of the Flush() requests that failed (in most timed out).In a well behaving trace this should always be == 0.  |  
| final_flush_outcome  | [FinalFlushOutcome](https://perfetto.dev/docs/reference/trace-packet-proto#TraceStats.FinalFlushOutcome)  |  
###  TraceStats.BufferStats
From TraceBuffer::Stats.
Defined in [trace_stats.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/common/trace_stats.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| buffer_size  | uint64  | Size of the circular buffer in bytes.  |  
| bytes_written  | uint64  | Num. bytes written into the circular buffer, including chunk headers.  |  
| bytes_overwritten  | uint64  | Num. bytes overwritten before they have been read (i.e. loss of data).  |  
| bytes_read  | uint64  | Total size of chunks that were fully read from the circular buffer by the consumer. This may not be equal to `bytes_written` either in the middle of tracing, or if `chunks_overwritten` is non-zero. Note that this is the size of the chunks read from the buffer, including chunk headers, which will be different from the total size of packets returned to the consumer. The current utilization of the trace buffer (mid-tracing) can be obtained by subtracting `bytes_read` and `bytes_overwritten` from `bytes_written`, adding the difference of `padding_bytes_written` and `padding_bytes_cleared`, and comparing this sum to the `buffer_size`.Note that this represents the total size of buffered data in the buffer, yet this data may be spread non-contiguously through the buffer and may be overridden before the utilization reaches 100%.  |  
| padding_bytes_written  | uint64  | Num. bytes that were allocated as padding between chunks in the circular buffer.  |  
| padding_bytes_cleared  | uint64  | Num. of padding bytes that were removed from the circular buffer when they were overwritten. The difference between `padding_bytes_written` and `padding_bytes_cleared` denotes the total size of padding currently present in the buffer.  |  
| chunks_written  | uint64  | Num. chunks (!= packets) written into the buffer.  |  
| chunks_rewritten  | uint64  | Num. chunks (!= packets) rewritten into the buffer. This means we rewrote the same chunk with additional packets appended to the end.  |  
| chunks_relocated  | uint64  | TraceBufferV2 only. Num. chunks that we moved to the write cursor instead of rewriting in place. We do this for scraped chunks that have been fully read: their old position can be so close to the write cursor that the packets we just recovered would be overwritten before any read. Introduced in v59 / Android 26Q3+.  |  
| chunks_overwritten  | uint64  | Num. chunks overwritten before they have been read (i.e. loss of data).  |  
| chunks_discarded  | uint64  | Num. chunks discarded (i.e. loss of data). For SMB chunks, this can be > 0 only when a buffer is configured with FillPolicy == DISCARD.TraceBufferV2 also counts SMB v2 batches rejected because their producer has a ProtoVM on this buffer.  |  
| chunks_read  | uint64  | Num. chunks (!= packets) that were fully read from the circular buffer by the consumer. This may not be equal to `chunks_written` either in the middle of tracing, or if `chunks_overwritten` is non-zero.  |  
| chunks_committed_out_of_order  | uint64  | Num. chunks that were committed out of order.  |  
| write_wrap_count  | uint64  | Num. times the ring buffer wrapped around.  |  
| compactions  | uint64  | Number of completed TraceBufferV2 compactions.Includes compactions that move no chunks and excludes calls that skip compaction, such as calls on DISCARD or read-only buffers. Compaction moves remaining chunks to the front and clears the unused tail.It keeps the pages that a similar write cycle can reuse, and releases the other whole pages where supported.The next writes start after the remaining chunks, which can reduce how often `write_wrap_count` and `chunks_overwritten` increase.Incomplete chunks can remain until later writes overwrite them. Introduced in v59 / Android 26Q4+.  |  
| compactions_skipped  | uint64  | Number of TraceBufferV2 compactions skipped because live chunks were on both sides of the write cursor. Introduced in v59 / Android 26Q4+.  |  
| patches_succeeded  | uint64  | Num. out-of-band (OOB) patches that succeeded.  |  
| patches_failed  | uint64  | Num. OOB patches that failed (e.g., the chunk to patch was gone).  |  
| readaheads_succeeded  | uint64  | Num. readaheads (for large multi-chunk packet reads) that ended up in a successful packet read.  |  
| readaheads_failed  | uint64  | Num. readaheads aborted because of missing chunks in the sequence stream.Note that a small number > 0 is totally expected: occasionally, when issuing a read, the very last packet in a sequence might be incomplete (because the producer is still writing it while we read). The read will stop at that point, for that sequence, increasing this counter.  |  
| abi_violations  | uint64  | Num. of violations of the SharedMemoryABI or the shared ring buffer ABI found while writing or reading the buffer. This includes SMB v2 packets that TraceBufferV2 cannot rewrite because they are malformed or nest more than 128 groups. It also includes chunks whose writer ID already uses the other input format.This is an indication of either a bug in the producer(s) or malicious producer(s).  |  
| trace_writer_packet_loss  | uint64  | Num. of times the service detected packet loss on a trace writer sequence. This is usually caused by exhaustion of available chunks in the writer process's SMB. Note that this relies on the client's TraceWriter indicating this loss to the service -- packets lost for other reasons are not reflected in this stat.  |  
| oversized_packets_dropped  | uint64  | TraceBufferV2 only. Num. SMB v2 packets dropped at read time because they contain a nested message larger than 256 MiB, the limit of the four-byte length field. The packet can be valid. Loss is reported on the next packet of the same sequence.  |  
###  TraceStats.WriterStats
Per TraceWriter stat. Each {producer, trace writer} tuple is publicly visible as a unique sequence ID in the trace.
Defined in [trace_stats.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/common/trace_stats.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| sequence_id  | uint64  | This matches the TracePacket.trusted_packet_sequence_id and is used to correlate the stats with the actual packet types.  |  
| buffer  | uint32  | The buffer index (0..N, as defined in the TraceConfig).  |  
| protocol_abi_versions  | uint32  | Which protocol carried this writer's chunks to the buffer.This is a bitmask of ProtocolAbiVersion (see producer_port.proto).The value is 1 for the SMB (v1) and 2 for the tracing v2 ring buffer.Both bits are set only if a v1 and a v2 writer of the same producer used the same writer ID which should NOT be happening.  |  
| chunk_payload_histogram_counts  | uint64[]  | These two arrays have the same cardinality and match the cardinality of chunk_payload_histogram_def + 1 (for the overflow bucket, see below).`sum` contains the SUM(entries) and `counts` contains the COUNT(entries) for each bucket.  |  
| chunk_payload_histogram_sum  | int64[]  |  
###  TraceStats.FilterStats
This is set only when the TraceConfig specifies a TraceFilter.
Defined in [trace_stats.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/common/trace_stats.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| input_packets  | uint64  |  
| input_bytes  | uint64  |  
| output_bytes  | uint64  |  
| errors  | uint64  |  
| time_taken_ns  | uint64  |  
| bytes_discarded_per_buffer  | uint64[]  | The number of bytes discarded by the filter (i.e. output - input).The array has one entry for each buffer defined in the config (unless no packets for that buffer were seen and hence filtered).Note: the SUM(bytes_discarded_per_buffer) will be <= but not == the total (output_bytes - input_bytes) because the filter might also discard server-generated synthetic packets, that have no buffer index.  |  
###  TraceStats.FinalFlushOutcome
Defined in [trace_stats.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/common/trace_stats.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| FINAL_FLUSH_UNSPECIFIED  | 0  |  
| FINAL_FLUSH_SUCCEEDED  | 1  |  
| FINAL_FLUSH_FAILED  | 2  |  
##  ExperimentalTracingV2ProducerStats
Stats for the tracing v2 ring buffer of one producer since connection. The service emits one packet for each connected producer that has a data source in the session and an attached ring buffer. A producer that only uses the SMB has no stats packet. A cloned session keeps the stats from the time of the clone.
These stats include producer identity, so they are separate from TraceStats and pass through the session's trace filter.
Defined in [tracing_v2_producer_stats.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/perfetto/tracing_v2_producer_stats.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| producer_id  | uint32  | The producer that owns the ring buffer.  |  
| pid  | int32  |  
| producer_name  | string  |  
| chunk_size_bytes  | uint32  | Layout of the attached ring buffer.  |  
| num_chunks  | uint32  |  
| chunks_read  | uint64  | Num. chunks that the service copied out of the ring buffer.  |  
| bytes_read  | uint64  | Total size of the packet fragments in `chunks_read`. It excludes the chunk headers and the fragment sizes.  |  
| data_loss_chunks  | uint64  | Num. chunks discarded because their writer marked them as lossy.A writer marks the next chunk it gets after it dropped data, e.g. when the ring buffer was full.  |  
| malformed_chunks  | uint64  | Num. chunks discarded because the sizes of their fragments are invalid.Either a size cannot be decoded, or the fragments do not fit in the chunk. A nonzero value points to a writer bug or to corrupt memory.  |  
| unsupported_format_chunks  | uint64  | Num. chunks discarded because the service does not know their format.  |  
| invalid_writer_chunks  | uint64  | The chunk's writer ID was zero or out of range.  |  
| invalid_destination_chunks  | uint64  | The chunk's target buffer is not a TraceBuffer that the producer can write to.  |  
| trace_buffer_rejected_chunks  | uint64  | The trace buffer refused the chunk. Its BufferStats say why, in `abi_violations` or `chunks_discarded`.  |  
| rewrite_requests  | uint64  | Num. chunks that the service read while their writer was still filling them. The writer then moves its open fragment to another chunk.  |  
| positions_skipped  | uint64  | Num. ring buffer positions that gave no chunk to the service. They are positions that no writer claimed, chunks with no published fragment and the discarded chunks above.  |  
| drain_passes  | uint64  | Num. times the service read the ring buffer. It reads it when the producer sends a DrainV2RingBuffer request, on its own (e.g. on a flush), and to retry a pass that stopped early.  |  
| drain_time_ns  | uint64  | Time that the service spent in `drain_passes`, measured with CLOCK_MONOTONIC. It does not count time when the device was suspended.  |  
| drain_max_time_ns  | uint64  | Time of the longest of `drain_passes`, on the same clock. The service has one main thread, so a long pass delays every other producer and request.  |  
| writer_dropped_packets  | uint64  | Num. packets that the writers dropped before the packets reached a chunk. This includes packets dropped before the service attached the ring buffer. A writer adds its drops when it flushes or stops dropping, so the value can lag.  |  
| writer_stalls  | uint64  | Num. times a writer waited for a free chunk, and the total time of those waits. This is time that the app's threads were blocked. A writer checks again after about 100 ms, so a longer stall counts several times.  |  
| writer_stall_time_ms  | uint64  |  
##  ProfilePacket
This file contains a mixture of messages emitted by various sampling profilers:
##  Memory allocator profiling
ProfilePacket: The packet emitted by heapprofd, which started off as a native heap (malloc/free) profiler, but now supports custom allocators as well. Each packet contains a preaggregated state of the heap at snapshot time, which report the total allocated/free bytes per callstack (plus other info such as the number of samples). StreamingAllocation/StreamingFree: Emitted by heapprofd when configured in streaming mode (i.e. when stream_allocations = true). This is only for local testing, and doesn't report callstacks (only address time and size of each alloc/free). It can lead to enormous traces, as it contains the stream of each alloc/free call.
##  Callstack sampling
StreamingProfilePacket: The packet emitted by the chromium in-process sampling profiler, which is based on periodically sending a signal to itself, and unwinding the stack in the signal handler. Each packet contains a series of individual stack samples for a Chromium thread.
##  Callstack and performance counter sampling
PerfSample: The packet emitted by traced_perf sampling performance profiler based on the perf_event_open syscall. Each packet represents an individual sample of a performance counter (which might be a timer), and optionally a callstack of the process that was scheduled at the time of the sample.
The packet emitted by heapprofd for each heap snapshot. A snapshot can involve more than one ProfilePacket if the snapshot is big (when `continued` is true). The cardinality and grouping is as follows: A ProfilePacket contains:
  * 1+ per-process heap snapshots (ProcessHeapSamples). Normally there is only one heap per process (the main malloc/free heap), but there can be more if the process is using the heapprofd API to profile custom allocators.
  * Globally interned strings, mappings and frames (to allow de-duplicating frames/mapping in common between different processes). A ProcessHeapSamples contains:
  * The process and heap identifier.
  * A number of HeapSample, one for each callsite that had some alloc/frees.
  * Statistics about heapprofd internals (e.g., sampling/unwinding timings). A HeapSample contains statistics about callsites:
  * Total number of bytes allocated and freed from that callsite.
  * Total number of alloc/free calls sampled.
  * Stats at the local maximum when dump_at_max = true. See <https://perfetto.dev/docs/data-sources/native-heap-profiler> for more.


Defined in [profile_packet.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/profiling/profile_packet.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| strings  | [InternedString[]](https://perfetto.dev/docs/reference/trace-packet-proto#InternedString)  | The following interning tables are only used in Android version Q.In newer versions, these tables are in InternedData (see protos/perfetto/trace/interned_data) and are shared across multiple ProfilePackets.For backwards compatibility, consumers need to first look up interned data in the tables within the ProfilePacket, and then, if they are empty, look up in the InternedData instead.  |  
| mappings  |  
| frames  |  
| callstacks  |  
| process_dumps  | [ProcessHeapSamples[]](https://perfetto.dev/docs/reference/trace-packet-proto#ProfilePacket.ProcessHeapSamples)  |  
| continued  | bool  | If this is true, the next ProfilePacket in this package_sequence_id is a continuation of this one.To get all samples for a process, accummulate its ProcessHeapSamples.samples until you see continued=false.  |  
| index  | uint64  | Index of this ProfilePacket on its package_sequence_id. Can be used to detect dropped data.Verify these are consecutive.  |  
###  InternedString
The interning fields in this file can refer to 2 different intern tables, depending on the message they are used in. If the interned fields are present in ProfilePacket proto, then the intern tables included in the ProfilePacket should be used. If the intered fields are present in the StreamingProfilePacket proto, then the intern tables included in all of the previous InternedData message with same sequence ID should be used.
Defined in [profile_common.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/profiling/profile_common.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| iid  | uint64  | Interning key. Starts from 1, 0 is the same as "not set".  |  
| str  | bytes  | The actual string.  |  
###  Mapping
Defined in [profile_common.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/profiling/profile_common.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| iid  | uint64  | Interning key.Starts from 1, 0 is the same as "not set".  |  
| build_id  | uint64  | Interning key.Starts from 1, 0 is the same as "not set".  |  
| exact_offset  | uint64  | The linker may create multiple memory mappings for the same shared library.This is so that the ELF header is mapped as read only, while the executable memory is mapped as executable only.The details of this depend on the linker, a possible mapping of an ELF file is this:+----------------------+ ELF `xxxxxxxxxyyyyyyyyyyyyy` +---------+------------+  |  
| start_offset  | uint64  |  
| start  | uint64  |  
| end  | uint64  |  
| load_bias  | uint64  | Libunwindstack-specific concept, not to be confused with bionic linker's notion of load_bias. Needed to correct relative pc addresses (as produced by libunwindstack) when doing offline resymbolisation. For an executable ELF PT_LOAD segment, this is:p_vaddr - p_offset Where p_offset means that the code is at that offset into the ELF file on disk. While p_vaddr is the offset at which the code gets _mapped_ , relative to where the linker loads the ELF into the address space. For most ELFs, the two values are identical and therefore load_bias is zero.  |  
| path_string_ids  | uint64[]  | E.g. ["system", "lib64", "libc.so"] id of string.  |  
###  Frame
Defined in [profile_common.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/profiling/profile_common.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| iid  | uint64  | Interning key. Starts from 1, 0 is the same as "not set".  |  
| function_name_id  | uint64  | E.g. "fopen" id of string.  |  
| mapping_id  | uint64  | The mapping in which this frame's instruction pointer resides.iid of Mapping.iid. If set (non-zero), rel_pc MUST also be set. If mapping_id is 0 (not set), this frame has no associated memory mapping (e.g., symbolized frames without address information). Starts from 1, 0 is the same as "not set".  |  
| rel_pc  | uint64  | Instruction pointer relative to the start of the mapping.MUST be set if mapping_id is set (non-zero). Ignored if mapping_id is 0.  |  
| source_path_iid  | uint64  | Source file path for this frame.This is typically set during online symbolization when symbol information is available at trace collection time. If not set, source file paths may be added later via offline symbolization (see ModuleSymbols). Starts from 1, 0 is the same as "not set". iid of InternedData.source_paths.  |  
| line_number  | uint32  | Line number in the source file for this frame.This is typically set during online symbolization when symbol information is available at trace collection time. If not set, line numbers may be added later via offline symbolization (see ModuleSymbols).  |  
| kind  |  
| kind_str  | string  |  
###  Frame.Kind
The kind of code this frame represents, for categorization (e.g. coloring a flamegraph, or telling interpreted Python frames apart from native and GC frames in one mixed stack). Set the well-known `kind` when one fits, otherwise set `kind_str` to a custom label. The well-known enum is append-only and language-neutral; language-specific labels go in kind_str.
Defined in [profile_common.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/profiling/profile_common.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| KIND_UNKNOWN  | 0  |  
| KIND_NATIVE  | 1  |  
| KIND_KERNEL  | 2  |  
| KIND_INTERPRETED  | 3  |  
| KIND_JIT  | 4  |  
| KIND_GC  | 5  |  
| KIND_RUNTIME  | 6  |  
###  Callstack
Defined in [profile_common.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/profiling/profile_common.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| iid  | uint64  | Interning key. Starts from 1, 0 is the same as "not set".  |  
| frame_ids  | uint64[]  | Frames of this callstack. Bottom frame first.  |  
###  ProfilePacket.ProcessHeapSamples
Defined in [profile_packet.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/profiling/profile_packet.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| pid  | uint64  |  
| from_startup  | bool  | This process was profiled from startup.If false, this process was already running when profiling started.  |  
| rejected_concurrent  | bool  | This process was not profiled because a concurrent session was active.If this is true, samples will be empty.  |  
| disconnected  | bool  | This process disconnected while it was profiled.If false, the process outlived the profiling session.  |  
| buffer_overran  | bool  | If disconnected, this disconnect was caused by the client overrunning the buffer.Equivalent to client_error == CLIENT_ERROR_HIT_TIMEOUT on new S builds.  |  
| client_error  |  
| buffer_corrupted  | bool  | If disconnected, this disconnected was caused by the shared memory buffer being corrupted. THIS IS ALWAYS A BUG IN HEAPPROFD OR CLIENT MEMORY CORRUPTION.  |  
| hit_guardrail  | bool  | If disconnected, this disconnect was caused by heapprofd exceeding guardrails during this profiling session.  |  
| heap_name  | string  |  
| sampling_interval_bytes  | uint64  |  
| orig_sampling_interval_bytes  | uint64  |  
| timestamp  | uint64  | Timestamp of the state of the target process that this dump represents, i.e. the end of the interval covered by the dump (`start_timestamp` is the start). This can be different to the timestamp of the TracePackets for various reasons:* If disconnected is set above, this is the timestamp of last state heapprofd had of the process before it disconnected.* Otherwise, if the rate of events produced by the process is high, heapprofd might be behind.to have a type enum that we can reuse here.  |  
| start_timestamp  | uint64  | Start of the interval this dump covers (`timestamp` is the end): the profiling start for the first dump, the previous dump's timestamp afterwards. Same clock as `timestamp`. Unset on older producers.  |  
| stats  | Metadata about heapprofd.  |  
| samples  |  
###  ProfilePacket.ProcessHeapSamples.ClientError
Defined in [profile_packet.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/profiling/profile_packet.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| CLIENT_ERROR_NONE  | 0  |  
| CLIENT_ERROR_HIT_TIMEOUT  | 1  |  
| CLIENT_ERROR_INVALID_STACK_BOUNDS  | 2  |  
###  ProfilePacket.ProcessStats
Defined in [profile_packet.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/profiling/profile_packet.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| unwinding_errors  | uint64  |  
| heap_samples  | uint64  |  
| map_reparses  | uint64  |  
| unwinding_time_us  |  
| total_unwinding_time_us  | uint64  |  
| client_spinlock_blocked_us  | uint64  |  
###  ProfilePacket.Histogram
Defined in [profile_packet.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/profiling/profile_packet.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| buckets  |  
###  ProfilePacket.Histogram.Bucket
Defined in [profile_packet.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/profiling/profile_packet.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| upper_limit  | uint64  | This bucket counts values from the previous bucket's (or -infinity if this is the first bucket) upper_limit (inclusive) to this upper_limit (exclusive).  |  
| max_bucket  | bool  | This is the highest bucket. This is set instead of the upper_limit. Any values larger or equal to the previous bucket's upper_limit are counted in this bucket.  |  
| count  | uint64  | Number of values that fall into this range.  |  
###  ProfilePacket.HeapSample
Defined in [profile_packet.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/profiling/profile_packet.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| callstack_id  | uint64  |  
| self_allocated  | uint64  | bytes allocated at this callstack.  |  
| self_freed  | uint64  | bytes allocated at this callstack that have been freed.  |  
| self_max  | uint64  | Bytes allocated by this callstack but not freed at the time the malloc heap usage of this process was maximal. This is only set if dump_at_max is true in HeapprofdConfig. In that case, self_allocated, self_freed and self_idle will not be set.  |  
| self_max_count  | uint64  | Number of allocations that were sampled at this callstack but not freed at the time the malloc heap usage of this process was maximal. This is only set if dump_at_max is true in HeapprofdConfig. In that case, self_allocated, self_freed and self_idle will not be set.  |  
| timestamp  | uint64  | timestamp [opt]  |  
| alloc_count  | uint64  | Number of allocations that were sampled at this callstack.  |  
| free_count  | uint64  | Number of allocations that were sampled at this callstack that have been freed.  |  
##  StreamingAllocation
Packet emitted by heapprofd when stream_allocations = true. Only for local testing. Doesn't report the callsite.
Defined in [profile_packet.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/profiling/profile_packet.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| address  | uint64[]  |  
| size  | uint64[]  |  
| sample_size  | uint64[]  |  
| clock_monotonic_coarse_timestamp  | uint64[]  |  
| heap_id  | uint32[]  |  
| sequence_number  | uint64[]  |  
##  StreamingFree
Packet emitted by heapprofd when stream_allocations = true. Only for local testing. Doesn't report the callsite.
Defined in [profile_packet.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/profiling/profile_packet.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| address  | uint64[]  |  
| heap_id  | uint32[]  |  
| sequence_number  | uint64[]  |  
##  BatteryCounters
Defined in [battery_counters.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/power/battery_counters.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| charge_counter_uah  | int64  | Battery capacity in microampere-hours(µAh). Also known as Coulomb counter.  |  
| capacity_percent  | float  | Remaining battery capacity percentage of total capacity  |  
| current_ua  | int64  | Instantaneous battery current in microamperes(µA).Negative values indicate current being drained from the battery and positive values indicate current feeding the battery from a charge source (USB). See <https://perfetto.dev/docs/data-sources/battery-counters> for more info.  |  
| current_avg_ua  | int64  | Instantaneous battery current in microamperes(µA).  |  
| name  | string  | Battery name, emitted only on multiple batteries.  |  
| energy_counter_uwh  | int64  | Battery capacity in microwatt-hours(µWh).  |  
| voltage_uv  | int64  | Battery voltage in microvolts(µV).  |  
##  PowerRails
Defined in [power_rails.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/power/power_rails.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| rail_descriptor  | [RailDescriptor[]](https://perfetto.dev/docs/reference/trace-packet-proto#PowerRails.RailDescriptor)  | This is only emitted at the beginning of the trace.  |  
| energy_data  |  
| session_uuid  | uint64  | A unique session id that can be used to match energy data to sets of descriptors. The indices used by rail descriptors and energy data packets are meant to be unique to a given session uuid. When multiple data sources are running in parallel, each data source should use a unique id.  |  
###  PowerRails.RailDescriptor
Defined in [power_rails.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/power/power_rails.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| index  | uint32  | Index corresponding to the rail  |  
| rail_name  | string  | Name of the rail  |  
| subsys_name  | string  | Name of the subsystem to which this rail belongs  |  
| sampling_rate  | uint32  | Hardware sampling rate (Hz).  |  
###  PowerRails.EnergyData
Defined in [power_rails.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/power/power_rails.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| index  | uint32  | Index corresponding to RailDescriptor.index  |  
| timestamp_ms  | uint64  | Time since device boot(CLOCK_BOOTTIME) in milli-seconds.  |  
| energy  | uint64  | Accumulated energy since device boot in microwatt-seconds (uWs).  |  
##  AndroidLogPacket
Defined in [android_log.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/android/android_log.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| events  |  
| stats  |  
###  AndroidLogPacket.LogEvent
Defined in [android_log.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/android/android_log.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| log_id  | The log buffer (e.g. MAIN, SYSTEM, RADIO) the event comes from.  |  
| pid  | int32  | PID (TGID), TID and UID of the task that emitted the event.  |  
| tid  | int32  |  
| uid  | int32  |  
| timestamp  | uint64  | Timestamp [ns]. The clock source is CLOCK_REALTIME, unlike many other Perfetto trace events that instead use CLOCK_BOOTTIME. The trace processor will take care of realigning clocks using the ClockSnapshot(s).  |  
| tag  | string  | When log_id == LID_EVENTS, `tag` corresponds to the event name defined in the second column of /system/etc/event-log-tags. For all other events, `tag` is the app-specified argument passed to __android_log_write().  |  
| prio  | [AndroidLogPriority](https://perfetto.dev/docs/reference/trace-packet-proto#AndroidLogPriority)  | Empty when log_id == LID_EVENTS.  |  
| message  | string  | Empty when log_id == LID_EVENTS.  |  
| args  | Only populated when log_id == LID_EVENTS.  |  
###  AndroidLogId
Values from NDK's android/log.h.
Defined in [android_log_constants.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/common/android_log_constants.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| LID_DEFAULT  | 0  | MAIN.  |  
| LID_RADIO  | 1  |  
| LID_EVENTS  | 2  |  
| LID_SYSTEM  | 3  |  
| LID_CRASH  | 4  |  
| LID_STATS  | 5  |  
| LID_SECURITY  | 6  |  
| LID_KERNEL  | 7  |  
###  AndroidLogPriority
Defined in [android_log_constants.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/common/android_log_constants.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| PRIO_UNSPECIFIED  | 0  |  
| PRIO_UNUSED  | 1  | _DEFAULT, but should never be seen in logs.  |  
| PRIO_VERBOSE  | 2  |  
| PRIO_DEBUG  | 3  |  
| PRIO_INFO  | 4  |  
| PRIO_WARN  | 5  |  
| PRIO_ERROR  | 6  |  
| PRIO_FATAL  | 7  |  
###  AndroidLogPacket.LogEvent.Arg
Defined in [android_log.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/android/android_log.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
| int_value  | int64  |  
| float_value  | float  |  
| string_value  | string  |  
###  AndroidLogPacket.Stats
Stats are emitted only upon Flush() and are monotonic (i.e. they are absolute counters since the beginning of the lifetime of the tracing session and NOT relative to the previous Stats snapshot).
Defined in [android_log.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/android/android_log.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| num_total  | uint64  | Total number of log events seen, including errors and skipped entries (num of events stored in the trace = total - failed - skipped).  |  
| num_failed  | uint64  | Parser failures.  |  
| num_skipped  | uint64  | Messages skipped due to filters.  |  
##  SystemInfo
Defined in [system_info.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/common/system_info.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| utsname  |  
| android_build_fingerprint  | string  |  
| android_device_manufacturer  | string  | The manufacturer of the product/hardware.Source : "ro.product.manufacturer" Introduced after Android W in Nov 2024 and is not supported on older versions.  |  
| android_soc_model  | string  | The SoC model from which trace is collected  |  
| device_tree_compatibles  | string[]  | Device tree compatible strings for Linux devices. This field is populated from the firmware file /sys/firmware/devicetree/base/compatible on the target device. The ordering matches the ordering in the device tree.Introduced after 26Q3 in Sept 2026 and is not supported on older versions.  |  
| android_guest_soc_model  | string  | The guest SoC model from which trace is collected in case of VMs  |  
| android_hardware_revision  | string  | The hardware reversion from android device  |  
| android_storage_model  | string  | The storage component from android_device. This field has been introduced after Android W in Aug 2024 and is not supported on older versions.  |  
| android_ram_model  | string  | The RAM component information from android device. This field has been introduced after Android W in Aug 2024 and is not supported on older versions.  |  
| android_serial_console  | string  | The serial console information from android device.  |  
| tracing_service_version  | string  | The version of traced (the same returned by `traced --version`).This is a human readable string with and its format varies depending on the build system and the repo (standalone vs AOSP).This is intended for human debugging only.  |  
| android_sdk_version  | uint64  | The Android SDK vesion (e.g. 21 for L, 31 for S etc).Introduced in Android T.  |  
| page_size  | uint32  | Kernel page size - sysconf(_SC_PAGESIZE).  |  
| num_cpus  | uint32  | Number of cpus - sysconf(_SC_NPROCESSORS_CONF).Might be different to the number of online cpus.Introduced in perfetto v44.  |  
| timezone_off_mins  | int32  | The timezone offset from UTC, as per strftime("%z"), in minutes.Introduced in v38 / Android V.  |  
| hz  | int64  | Ticks per second - sysconf(_SC_CLK_TCK).Not serialised as of perfetto v44.  |  
| system_ram_bytes  | uint64  | The size of the system RAM in bytes. On Linux/Android: sysinfo.totalram * sysinfo.mem_unit.Other POSIX (e.g. Mac): sysconf(_SC_PHYS_PAGES) * sysconf(_SC_PAGESIZE). Introduced in perfetto v54 / Android 26Q1+.  |  
| machine_name  | string  | Human-readable name of the machine this SystemInfo describes, used as the machine's label in the UI (falling back to "machine " when unset). A producer attributing its data to a non-host machine can set this by emitting a SystemInfo packet to give that machine a name. Only meaningful when the packet carries a non-zero machine_id.  |  
###  Utsname
Defined in [system_info.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/common/system_info.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| sysname  | string  |  
| version  | string  |  
| release  | string  |  
| machine  | string  |  
##  Trigger
When a TracingSession receives a trigger it records the boot time nanoseconds in the TracePacket's timestamp field as well as the name of the producer that triggered it. We emit this data so filtering can be done on triggers received in the trace.
Defined in [trigger.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/trigger.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| trigger_name  | string  | Name of the trigger which was received.  |  
| producer_name  | string  | The actual producer that activated `trigger`.  |  
| trusted_producer_uid  | int32  | The verified UID of the producer.  |  
| stop_delay_ms  | uint64  | The value of stop_delay_ms from the configuration.  |  
##  ChromeTrigger
Information about a specific trigger during a background tracing scenario Associated packet timestamps are useful to delimitate a scenario range in a trace. Triggers are also useful for filtering traces.
Defined in [chrome_trigger.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/chrome/chrome_trigger.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| trigger_name  | string  | Name of the trigger which was received.  |  
| trigger_name_hash  | fixed32  | SHA1 hash of the trigger name.  |  
| flow_id  | fixed64  | Flow id which should terminate on this trigger.  |  
##  PackagesList
Defined in [packages_list.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/android/packages_list.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| packages  |  
| parse_error  | bool  | At least one error occurred parsing the packages.list.  |  
| read_error  | bool  | Failed to open / read packages.list.  |  
###  PackagesList.PackageInfo
Defined in [packages_list.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/android/packages_list.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
| uid  | uint64  |  
| debuggable  | bool  |  
| profileable_from_shell  | bool  |  
| version_code  | int64  |  
| profileable  | bool  |  
##  ChromeBenchmarkMetadata
This message is not intended to be written by the chrome on the device. It's emitted on the host by the telemetry benchmark infrastructure (it's a part of the trace that's written by the telemetry tracing agent).
Defined in [chrome_benchmark_metadata.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/chrome/chrome_benchmark_metadata.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| benchmark_start_time_us  | int64  | Time when the benchmark execution started (host unixtime in microseconds).  |  
| story_run_time_us  | int64  | Time when this particular story was run (host unixtime in microseconds).  |  
| benchmark_name  | string  | Name of benchmark.  |  
| benchmark_description  | string  | Description of benchmark.  |  
| label  | string  | Optional label.  |  
| story_name  | string  | Name of story.  |  
| story_tags  | string[]  | List of story tags.  |  
| story_run_index  | int32  | Index of the story run (>0 if the same story was run several times).  |  
| had_failures  | bool  | Whether this run failed.  |  
##  PerfettoMetatrace
Used to trace the execution of perfetto itself.
Defined in [perfetto_metatrace.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/perfetto/perfetto_metatrace.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| event_id  | uint32  |  
| counter_id  | uint32  |  
| event_name  | string  | For trace processor metatracing.  |  
| event_name_iid  | uint64  |  
| counter_name  | string  |  
| event_duration_ns  | uint64  | Only when using `event_id`.  |  
| counter_value  | int32  | Only when using `counter_id`.  |  
| thread_id  | uint32  | ID of the thread that emitted the event.  |  
| has_overruns  | bool  | If true the meta-tracing ring buffer had overruns and hence some data is missing from this point.  |  
| args  | Args for the event.  |  
| interned_strings  | [InternedString[]](https://perfetto.dev/docs/reference/trace-packet-proto#PerfettoMetatrace.InternedString)  |  
###  PerfettoMetatrace.Arg
Defined in [perfetto_metatrace.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/perfetto/perfetto_metatrace.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| key  | string  |  
| key_iid  | uint64  |  
| value  | string  |  
| value_iid  | uint64  |  
###  PerfettoMetatrace.InternedString
Interned strings corresponding to the `event_name_iid`, `key_iid` and `value_iid` above.
Defined in [perfetto_metatrace.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/perfetto/perfetto_metatrace.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| iid  | uint64  |  
| value  | string  |  
##  ChromeMetadataPacket
Metadata for chrome traces.
Defined in [chrome_metadata.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/chrome/chrome_metadata.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| background_tracing_metadata  | [BackgroundTracingMetadata](https://perfetto.dev/docs/reference/trace-packet-proto#BackgroundTracingMetadata)  |  
| chrome_version_code  | int32  | Version code of Chrome used by Android's Play Store. This field is only set on Android.  |  
| enabled_categories  | string  | Comma separated list of enabled categories for tracing. The list of possible category strings are listed in code base/trace_event/builtin_categories.h.  |  
| field_trial_hashes  | List of Finch study/groups that apply to this trace.  |  
| app_package_name  | string  | The package name of the app which is being traced. This field is only set on Android.  |  
| app_version  | string  | A version number string for Chrome. This matches SystemProfileProto::app_version.  |  
| channel  | uint32  | This matches SystemProfileProto::channel.  |  
| os_name  | string  | The user's operating system. This matches SystemProfileProto::OS::name.  |  
###  BackgroundTracingMetadata
Metadata related to background tracing scenarios, states and triggers.
Defined in [chrome_metadata.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/chrome/chrome_metadata.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| triggered_rule  | Specifies the rule that caused the trace to be uploaded.  |  
| active_rules  | List of all active triggers in current session, when trace was triggered.  |  
| scenario_name_hash  | fixed32  | Hash of the scenario name.  |  
###  BackgroundTracingMetadata.TriggerRule
Information about a trigger rule defined in the experiment config.
Defined in [chrome_metadata.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/chrome/chrome_metadata.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| trigger_type  |  
| histogram_rule  |  
| named_rule  |  
| name_hash  | fixed32  | Hash of the rule name.  |  
###  BackgroundTracingMetadata.TriggerRule.TriggerType
Defined in [chrome_metadata.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/chrome/chrome_metadata.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| TRIGGER_UNSPECIFIED  | 0  |  
| MONITOR_AND_DUMP_WHEN_SPECIFIC_HISTOGRAM_AND_VALUE  | 1  | Traces are triggered by specific range of values of an UMA histogram.  |  
| MONITOR_AND_DUMP_WHEN_TRIGGER_NAMED  | 2  | Traces are triggered by specific named events in chromium codebase, like "second-update-failure".  |  
###  BackgroundTracingMetadata.TriggerRule.HistogramRule
Configuration of histogram trigger.
Defined in [chrome_metadata.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/chrome/chrome_metadata.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| histogram_name_hash  | fixed64  | UMA histogram name hash, same as HistogramEventProto.name_hash.  |  
| histogram_min_trigger  | int64  | Range of values of the histogram that activates trigger.  |  
| histogram_max_trigger  | int64  |  
###  BackgroundTracingMetadata.TriggerRule.NamedRule
Configuration of named trigger.
Defined in [chrome_metadata.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/chrome/chrome_metadata.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| event_type  |  
| content_trigger_name_hash  | fixed64  | If `event_type` is CONTENT_TRIGGER, then this stores the hash of the content-trigger that actually fired.  |  
###  BackgroundTracingMetadata.TriggerRule.NamedRule.EventType
Defined in [chrome_metadata.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/chrome/chrome_metadata.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| UNSPECIFIED  | 0  |  
| SESSION_RESTORE  | 1  |  
| NAVIGATION  | 2  |  
| STARTUP  | 3  |  
| REACHED_CODE  | 4  |  
| CONTENT_TRIGGER  | 5  |  
| TEST_RULE  | 1000  |  
###  ChromeMetadataPacket.FinchHash
Finch name and group based on the ActiveGroupId.
Defined in [chrome_metadata.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/chrome/chrome_metadata.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | uint32  |  
| group  | uint32  |  
##  GpuCounterEvent
Events for emitting information about GPU counters.
There are two "modes" to use these protos:
  1. Using GpuCounterDescriptor. This is the simplest way to use this proto but has the limitation that counter ids are _global_ so must only be emitted by a single producer or requires coordination between different producers. This is the mechanism which _must_ be used by Android OEMS to be complaint with CDD/CTS tests.
  2. Using InternedGpuCounterDescriptor. This is generally recommended for more complex use-cases involving multiple producers, multiple GPUs etc.


Defined in [gpu_counter_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/gpu/gpu_counter_event.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| counter_descriptor  | [GpuCounterDescriptor](https://perfetto.dev/docs/reference/trace-packet-proto#GpuCounterDescriptor)  | Must be specified on first trace packet of each session if using mode 1.(e.g. if you're an Android GPU vendor).  |  
| counter_descriptor_iid  | uint64  | ID to a InternedGpuCounterDescriptor in InternedData. Must be specified on first trace packet of the trusted sequence if using mode 2.  |  
| counters  |  
| gpu_id  | int32  | Identifier for GPU in a multi-gpu device. If `counter_descriptor_iid` is specified, the `gpu_id` in `InternedGpuCounterDescriptor` takes precedence over this field.  |  
###  GpuCounterDescriptor
Description of GPU counters. This message is sent by a GPU counter producer to specify the counters available in the hardware.
Defined in [gpu_counter_descriptor.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/common/gpu_counter_descriptor.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| specs  |  
| blocks  | [GpuCounterBlock[]](https://perfetto.dev/docs/reference/trace-packet-proto#GpuCounterDescriptor.GpuCounterBlock)  |  
| counter_groups  | [GpuCounterGroupSpec[]](https://perfetto.dev/docs/reference/trace-packet-proto#GpuCounterDescriptor.GpuCounterGroupSpec)  |  
| min_sampling_period_ns  | uint64  | optional. Minimum sampling period supported by the producer in nanoseconds.  |  
| max_sampling_period_ns  | uint64  | optional. Maximum sampling period supported by the producer in nanoseconds.  |  
| supports_instrumented_sampling  | bool  | optional. The producer supports counter sampling by instrumenting the command buffer.  |  
| supports_counter_names  | bool  | optional. The producer supports selecting counters by name via GpuCounterConfig.counter_names. Not all producers support this; Android GPU producers typically do not.  |  
| supports_counter_name_globs  | bool  | optional. The producer supports glob patterns in GpuCounterConfig.counter_names for matching multiple counters by name.  |  
###  GpuCounterDescriptor.GpuCounterSpec
Defined in [gpu_counter_descriptor.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/common/gpu_counter_descriptor.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| counter_id  | uint32  |  
| name  | string  |  
| description  | string  |  
| int_peak_value  | int64  |  
| double_peak_value  | double  |  
| numerator_units  |  
| denominator_units  |  
| select_by_default  | bool  |  
| groups  | [GpuCounterGroup[]](https://perfetto.dev/docs/reference/trace-packet-proto#GpuCounterDescriptor.GpuCounterGroup)  |  
| value_direction  |  
###  GpuCounterDescriptor.MeasureUnit
Defined in [gpu_counter_descriptor.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/common/gpu_counter_descriptor.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| NONE  | 0  |  
| BIT  | 1  |  
| KILOBIT  | 2  |  
| MEGABIT  | 3  |  
| GIGABIT  | 4  |  
| TERABIT  | 5  |  
| PETABIT  | 6  |  
| BYTE  | 7  |  
| KILOBYTE  | 8  |  
| MEGABYTE  | 9  |  
| GIGABYTE  | 10  |  
| TERABYTE  | 11  |  
| PETABYTE  | 12  |  
| HERTZ  | 13  |  
| KILOHERTZ  | 14  |  
| MEGAHERTZ  | 15  |  
| GIGAHERTZ  | 16  |  
| TERAHERTZ  | 17  |  
| PETAHERTZ  | 18  |  
| NANOSECOND  | 19  |  
| MICROSECOND  | 20  |  
| MILLISECOND  | 21  |  
| SECOND  | 22  |  
| MINUTE  | 23  |  
| HOUR  | 24  |  
| VERTEX  | 25  |  
| PIXEL  | 26  |  
| TRIANGLE  | 27  |  
| PRIMITIVE  | 38  |  
| FRAGMENT  | 39  |  
| MILLIWATT  | 28  |  
| WATT  | 29  |  
| KILOWATT  | 30  |  
| JOULE  | 31  |  
| VOLT  | 32  |  
| AMPERE  | 33  |  
| CELSIUS  | 34  |  
| FAHRENHEIT  | 35  |  
| KELVIN  | 36  |  
| PERCENT  | 37  | Values should be out of 100.  |  
| INSTRUCTION  | 40  |  
###  GpuCounterDescriptor.GpuCounterGroup
Logical groups for a counter. This is used in the UI to present the related counters together.
Defined in [gpu_counter_descriptor.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/common/gpu_counter_descriptor.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| UNCLASSIFIED  | 0  |  
| SYSTEM  | 1  |  
| VERTICES  | 2  |  
| FRAGMENTS  | 3  |  
| PRIMITIVES  | 4  |  
| MEMORY  | 5  | Includes counters relating to caching and bandwidth.  |  
| COMPUTE  | 6  |  
| RAY_TRACING  | 7  |  
###  GpuCounterDescriptor.GpuCounterSpec.ValueDirection
Direction of the time interval that each emitted sample applies to. A GPU counter is sampled at discrete timestamps, but its value really represents a measurement over some interval around that timestamp (e.g. average GPU utilization over the sampling window). This field tells trace processor on which side of the timestamp that interval lies, which controls where the value is drawn in the UI.
Example: samples at t=10, 20, 30 with values 5, 7, 0. BACKWARDS_LOOKING: 5 covers (-inf, 10], 7 covers (10, 20], 0 covers (20, 30]; the UI draws 7 between t=10 and t=20. FORWARDS_LOOKING: 5 covers [10, 20), 7 covers [20, 30), 0 covers [30, +inf); the UI draws 5 between t=10 and t=20.
Defined in [gpu_counter_descriptor.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/common/gpu_counter_descriptor.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| VALUE_DIRECTION_UNSPECIFIED  | 0  | Treated as BACKWARDS_LOOKING (the historical default).  |  
| VALUE_DIRECTION_BACKWARDS_LOOKING  | 1  | The value applies to the interval ending at this event's timestamp.This is the convention used by AGI and most existing GPU producers, where a sample reports what happened during the window leading up to the timestamp.  |  
| VALUE_DIRECTION_FORWARDS_LOOKING  | 2  | The value applies to the interval starting at this event's timestamp, matching standard Perfetto counters. Producers that emit explicit zero samples to denote "no activity from here on" should use this so the zero is not back-propagated over earlier non-zero samples (<https://github.com/google/perfetto/issues/5683>).  |  
###  GpuCounterDescriptor.GpuCounterBlock
Allow producer to group counters into block to represent counter islands. A capacity may be specified to indicate the number of counters that can be enable simultaneously in that block.
Defined in [gpu_counter_descriptor.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/common/gpu_counter_descriptor.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| block_id  | uint32  | required. Unique ID for the counter group.  |  
| block_capacity  | uint32  | optional. Number of counters supported by the block. No limit if unset.  |  
| name  | string  | optional. Name of block.  |  
| description  | string  | optional. Description for the block.  |  
| counter_ids  | uint32[]  | list of counters that are part of the block.  |  
###  GpuCounterDescriptor.GpuCounterGroupSpec
Allow producer to define custom counter groups. Unlike the fixed GpuCounterGroup enum (which provides broad categories), these groups let the producer define hardware-specific groupings that the UI uses to organize counter tracks. Can also be used to provide display names and descriptions for the fixed GpuCounterGroup enum values by setting group_id to the enum value.
Defined in [gpu_counter_descriptor.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/common/gpu_counter_descriptor.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| group_id  | uint32  | required. Unique ID for this group within the descriptor.  |  
| name  | string  | optional. Display name for the group.  |  
| description  | string  | optional. Description of the group.  |  
| counter_ids  | uint32[]  | Counters that belong directly to this group (by counter_id).  |  
###  GpuCounterEvent.GpuCounter
Defined in [gpu_counter_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/gpu/gpu_counter_event.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| counter_id  | uint32  | required. Identifier for counter.  |  
| int_value  | int64  |  
| double_value  | double  |  
##  GpuRenderStageEvent
Defined in [gpu_render_stage_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/gpu/gpu_render_stage_event.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| event_id  | uint64  | required. Unique ID for the event.  |  
| duration  | uint64  | optional. Duration of the event in nanoseconds. If unset, this is a single time point event.  |  
| hw_queue_iid  | uint64  | required. ID to a hardware queue description in the specifications.InternedGpuRenderStageSpecification  |  
| stage_iid  | uint64  | required. ID to a render stage description in the specifications.InternedGpuRenderStageSpecification  |  
| gpu_id  | int32  | optional. Identifier for GPU in a multi-gpu device.  |  
| context  | uint64  | required. Graphics context for the event.For OpenGL, this is the GL context.For Vulkan, this is the VkDevice.  |  
| render_target_handle  | uint64  | optional. The render target for this event.For OpenGL, this is the GL frame buffer handle.For Vulkan, this is the VkFrameBuffer handle.  |  
| submission_id  | uint32  | optional. Submission ID generated by the UMD.For OpenGL, the ID should map to an API submission (e.g., glFlush, glFinish, eglSwapBufffers) event. The set of submissions to the HW due to a single API submission should share the same ID.For Vulkan, it should map 1:1 with a vkQueueSubmit.  |  
| extra_data  |  
| render_pass_handle  | uint64  | optional. The Vulkan render pass handle.  |  
| render_pass_instance_id  | uint64  | optional. An ID for the render pass instance. This is used to correlate different events on different queues produced by the same Vulkan render pass instance.  |  
| render_subpass_index_mask  | uint64[]  | optional. A bit mask representing which render subpasses contributed to this render stage event. Subpass index 0 is represented by setting the LSB of the mask. Additional mask can be added for subpass index greater than 63.  |  
| command_buffer_handle  | uint64  | optional. The Vulkan command buffer handle.  |  
| name  | string  |  
| name_iid  | uint64  | Interned event name. Refers to EventName in InternedData.  |  
| event_wait_ids  | uint64[]  | Event IDs of other GpuRenderStageEvents that this event had to wait on before it could run.  |  
| kernel_iid  | uint64  | optional. ID to a compute kernel description in the interned data.InternedComputeKernel  |  
| launch  | [ComputeKernelLaunch](https://perfetto.dev/docs/reference/trace-packet-proto#GpuRenderStageEvent.ComputeKernelLaunch)  | optional. Compute kernel launch parameters for this event.  |  
| specifications  | Deprecated. Use hw_queue_iid and stage_iid to refer to InternedGpuRenderStageSpecification instead.  |  
| hw_queue_id  | int32  | Deprecated. Use hw_queue_iid instead;  |  
| stage_id  | int32  | Deprecated. Use stage_iid instead;  |  
###  GpuRenderStageEvent.ExtraData
optional. Additional data for the user. This may include attributes for the event like resource ids, shaders, etc.
Defined in [gpu_render_stage_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/gpu/gpu_render_stage_event.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
| value  | string  |  
###  GpuRenderStageEvent.ComputeKernelLaunch
Compute kernel launch parameters for a single dispatch.
Defined in [gpu_render_stage_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/gpu/gpu_render_stage_event.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| grid_size  | Grid dimensions (number of workgroups in each dimension).  |  
| workgroup_size  | Workgroup dimensions (number of threads per workgroup in each dimension).  |  
| args  | [ExtraComputeArg[]](https://perfetto.dev/docs/reference/trace-packet-proto#GpuRenderStageEvent.ExtraComputeArg)  | Additional typed launch parameters (e.g. registers_per_thread, shared_mem_dynamic, shared_mem_static).  |  
###  GpuRenderStageEvent.Dim3
3D unsigned integer vector for grid and workgroup dimensions.
Defined in [gpu_render_stage_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/gpu/gpu_render_stage_event.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| x  | uint32  |  
| y  | uint32  |  
| z  | uint32  |  
###  GpuRenderStageEvent.ExtraComputeArg
Typed key/value argument for extending compute kernel descriptions and launch parameters with custom data.
Defined in [gpu_render_stage_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/gpu/gpu_render_stage_event.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name_iid  | uint64  | Interned InternedComputeArgName.  |  
| name  | string  | Non-interned variant.  |  
| int_value  | int64  |  
| uint_value  | uint64  |  
| double_value  | double  |  
| string_value  | string  |  
| string_value_iid  | uint64  | Interned InternedString via debug_annotation_string_values.  |  
###  GpuRenderStageEvent.Specifications
Deprecated. Use InternedGpuRenderStageSpecification instead. The first trace packet of each session should include a Specifications to enumerate _all_ IDs that will be used. The timestamp of this packet must be earlier than all other packets. Only one packet with Specifications is expected.
Defined in [gpu_render_stage_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/gpu/gpu_render_stage_event.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| context_spec  |  
| hw_queue  | Labels to categorize the hw Queue this event goes on.  |  
| stage  | Labels to categorize render stage(binning, render, compute etc).  |  
###  GpuRenderStageEvent.Specifications.ContextSpec
Defined in [gpu_render_stage_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/gpu/gpu_render_stage_event.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| context  | uint64  |  
| pid  | int32  |  
###  GpuRenderStageEvent.Specifications.Description
Defined in [gpu_render_stage_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/gpu/gpu_render_stage_event.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
| description  | string  |  
##  StreamingProfilePacket
Packet emitted by the chromium in-process signal-based callstack sampler. Represents a series of individual stack samples (sampled at discrete points in time), rather than aggregated over an interval.
Defined in [profile_packet.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/profiling/profile_packet.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| callstack_iid  | uint64[]  | Index into InternedData.callstacks  |  
| timestamp_delta_us  | int64[]  | this with ClockSnapshot-based delta encoding instead.  |  
| process_priority  | int32  |  
##  ArtProcessMetadata
Defined in [art_process_metadata.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/profiling/art_process_metadata.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| pid  | int32  |  
| uid  | int32  |  
| process_name  | string  | proc/self/cmdline argv0  |  
| package_name  | string  | Set by VMRuntime.setProcessPackageName  |  
| oom_allocation_size  | uint64  | OutOfMemoryError details (if heap dump was triggered by an OOM) The size of the allocation that ended up failing with OOME  |  
| oom_total_bytes_free  | uint64  | Amount of free memory until the runtime would need to grow the heap  |  
| oom_free_bytes_until_oom  | uint64  | Amount of memory remaining until the max heap size supported  |  
| oom_thread_java_stack  | Stacktrace for the thread doing the failing allocation  |  
| oom_error_msg  | string  | Full OOME exception message  |  
###  JavaStack
Defined in [art_process_metadata.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/profiling/art_process_metadata.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| frames  |  
###  JavaFrame
Defined in [art_process_metadata.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/profiling/art_process_metadata.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| method_name  | string  |  
| source_file  | string  |  
| line_number  | int32  |  
##  GraphicsFrameEvent
Generated by Android's SurfaceFlinger.
Defined in [graphics_frame_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/android/graphics_frame_event.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| buffer_event  |  
###  GraphicsFrameEvent.BufferEvent
Defined in [graphics_frame_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/android/graphics_frame_event.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| frame_number  | uint32  |  
| type  |  
| layer_name  | string  |  
| duration_ns  | uint64  | If no duration is set, the event is an instant event.  |  
| buffer_id  | uint32  | Unique buffer identifier.  |  
###  GraphicsFrameEvent.BufferEventType
Defined in [graphics_frame_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/android/graphics_frame_event.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| UNSPECIFIED  | 0  |  
| DEQUEUE  | 1  |  
| QUEUE  | 2  |  
| POST  | 3  |  
| ACQUIRE_FENCE  | 4  |  
| LATCH  | 5  |  
| HWC_COMPOSITION_QUEUED  | 6  | HWC will compose this buffer  |  
| FALLBACK_COMPOSITION  | 7  | renderEngine composition  |  
| PRESENT_FENCE  | 8  |  
| RELEASE_FENCE  | 9  |  
| MODIFY  | 10  |  
| DETACH  | 11  |  
| ATTACH  | 12  |  
| CANCEL  | 13  |  
##  VulkanMemoryEvent
Each VulkanMemoryEvent encompasses information regarding one single function call that results in reserving, binding or freeing host or GPU memory. There is a special message type, ANNOTATIONS, which is used to communicate information that are not directly related to a memory event, nonetheless are essential to understand the memory usage. An example is the size and memory types of the memory heaps.
Defined in [vulkan_memory_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/gpu/vulkan_memory_event.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| source  |  
| operation  |  
| timestamp  | int64  |  
| pid  | uint32  |  
| memory_address  | fixed64  |  
| memory_size  | uint64  |  
| caller_iid  | uint64  | Interned string. Original string value is stored in function_names from protos/perfetto/trace/interned_data/interned_data.proto.  |  
| allocation_scope  |  
| annotations  | [VulkanMemoryEventAnnotation[]](https://perfetto.dev/docs/reference/trace-packet-proto#VulkanMemoryEventAnnotation)  | Extra related information, e.g., create configs, etc.  |  
| device  | fixed64  | Field IDs used for device memory (low sampling rate)  |  
| device_memory  | fixed64  |  
| memory_type  | uint32  |  
| heap  | uint32  |  
| object_handle  | fixed64  |  
###  VulkanMemoryEvent.Source
Defined in [vulkan_memory_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/gpu/vulkan_memory_event.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| SOURCE_UNSPECIFIED  | 0  |  
| SOURCE_DRIVER  | 1  |  
| SOURCE_DEVICE  | 2  |  
| SOURCE_DEVICE_MEMORY  | 3  |  
| SOURCE_BUFFER  | 4  |  
| SOURCE_IMAGE  | 5  |  
###  VulkanMemoryEvent.Operation
Defined in [vulkan_memory_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/gpu/vulkan_memory_event.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| OP_UNSPECIFIED  | 0  |  
| OP_CREATE  | 1  | alloc, create  |  
| OP_DESTROY  | 2  | free, destroy(non-bound)  |  
| OP_BIND  | 3  | bind buffer and image  |  
| OP_DESTROY_BOUND  | 4  | destroy (bound)  |  
| OP_ANNOTATIONS  | 5  | only annotations  |  
###  VulkanMemoryEvent.AllocationScope
Defined in [vulkan_memory_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/gpu/vulkan_memory_event.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| SCOPE_UNSPECIFIED  | 0  |  
| SCOPE_COMMAND  | 1  |  
| SCOPE_OBJECT  | 2  |  
| SCOPE_CACHE  | 3  |  
| SCOPE_DEVICE  | 4  |  
| SCOPE_INSTANCE  | 5  |  
###  VulkanMemoryEventAnnotation
All the information that cannot be sent within a VulkanMemoryEvent message, are sent as annotations to the main memory event. One example is the properties of the object that consumes the allocated memory, for example, a buffer or an image. key_iid and string_iid are both interned strings. Original string value is stored in vulkan_memory_keys from protos/perfetto/trace/interned_data/interned_data.proto.
Defined in [vulkan_memory_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/gpu/vulkan_memory_event.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| key_iid  | uint64  |  
| int_value  | int64  |  
| double_value  | double  |  
| string_iid  | uint64  |  
##  GpuLog
Message for logging events GPU data producer.
Defined in [gpu_log.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/gpu/gpu_log.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| severity  |  
| tag  | string  |  
| log_message  | string  |  
###  GpuLog.Severity
Defined in [gpu_log.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/gpu/gpu_log.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| LOG_SEVERITY_UNSPECIFIED  | 0  |  
| LOG_SEVERITY_VERBOSE  | 1  |  
| LOG_SEVERITY_DEBUG  | 2  |  
| LOG_SEVERITY_INFO  | 3  |  
| LOG_SEVERITY_WARNING  | 4  |  
| LOG_SEVERITY_ERROR  | 5  |  
##  VulkanApiEvent
Message for recording the Vulkan call.
Defined in [vulkan_api_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/gpu/vulkan_api_event.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| vk_debug_utils_object_name  | [VkDebugUtilsObjectName](https://perfetto.dev/docs/reference/trace-packet-proto#VulkanApiEvent.VkDebugUtilsObjectName)  |  
| vk_queue_submit  |  
###  VulkanApiEvent.VkDebugUtilsObjectName
For recording vkSetDebugUtilsObjectNameEXT and vkDebugMarkerSetObjectNameEXT
Defined in [vulkan_api_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/gpu/vulkan_api_event.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| pid  | uint32  |  
| vk_device  | uint64  |  
| object_type  | int32  | VkObjectType. Value must match <https://www.khronos.org/registry/vulkan/specs/1.1-extensions/man/html/VkObjectType.html>.  |  
| object  | uint64  |  
| object_name  | string  |  
###  VulkanApiEvent.VkQueueSubmit
For recording vkQueueSubmit call.
Defined in [vulkan_api_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/gpu/vulkan_api_event.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| duration_ns  | uint64  |  
| pid  | uint32  |  
| tid  | uint32  |  
| vk_queue  | uint64  |  
| vk_command_buffers  | uint64[]  |  
| submission_id  | uint32  | Submission ID. An identifier unique to each vkQueueSubmit call. This submission_id must match GpuRenderStageEvent.submission_id if the GpuRenderStageEvent is created due to this vkQueueSubmit.  |  
##  PerfSample
Packet emitted by the traced_perf sampling performance profiler, which gathers data via the perf_event_open syscall. Each packet contains an individual sample with a counter value, and optionally a callstack.
Timestamps are within the root packet. The config can specify the clock, or the implementation will default to CLOCK_MONOTONIC_RAW. Within the Android R timeframe, the default was CLOCK_BOOTTIME.
There are several distinct views of this message:
  * indication of kernel buffer data loss (kernel_records_lost set)
  * indication of skipped samples (sample_skipped_reason set)
  * notable event in the sampling implementation (producer_event set)
  * normal sample (timebase_count set, typically also callstack_iid)


Defined in [profile_packet.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/profiling/profile_packet.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| cpu  | uint32  |  
| pid  | uint32  |  
| tid  | uint32  |  
| cpu_mode  | [Profiling.CpuMode](https://perfetto.dev/docs/reference/trace-packet-proto#Profiling.CpuMode)  | Execution state that the process was sampled at.  |  
| timebase_count  | uint64  | Value of the timebase counter (since the event was configured, no deltas).  |  
| follower_counts  | uint64[]  | Value of the followers counter (since the event was configured, no deltas).  |  
| callstack_iid  | uint64  | Unwound callstack. Might be partial, in which case a synthetic "error" frame is appended, and `unwind_error` is set accordingly.  |  
| unwind_error  | [Profiling.StackUnwindError](https://perfetto.dev/docs/reference/trace-packet-proto#Profiling.StackUnwindError)  |  
| kernel_records_lost  | uint64  | If set, indicates that this message is not a sample, but rather an indication of data loss in the ring buffer allocated for `cpu`. Such data loss occurs when the kernel has insufficient ring buffer capacity to write a record (which gets discarded). A record in this context is an individual ring buffer entry, and counts more than just sample records. The `timestamp` of the packet corresponds to the time that the producer wrote the packet for trace-sorting purposes alone, and should not be interpreted relative to the sample timestamps. This field is sufficient to detect that _some_ kernel data loss happened within the trace, but not the specific time bounds of that loss (which would require tracking precedessor & successor timestamps, which is not deemed necessary at the moment).  |  
| sample_skipped_reason  | [SampleSkipReason](https://perfetto.dev/docs/reference/trace-packet-proto#PerfSample.SampleSkipReason)  |  
| producer_event  |  
###  Profiling.CpuMode
Defined in [profile_packet.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/profiling/profile_packet.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| MODE_UNKNOWN  | 0  |  
| MODE_KERNEL  | 1  |  
| MODE_USER  | 2  |  
| MODE_HYPERVISOR  | 3  | The following values aren't expected, but included for completeness:  |  
| MODE_GUEST_KERNEL  | 4  |  
| MODE_GUEST_USER  | 5  |  
###  Profiling.StackUnwindError
Enumeration of libunwindstack's error codes. NB: the integral representations of the two enums are different.
Defined in [profile_packet.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/profiling/profile_packet.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| UNWIND_ERROR_UNKNOWN  | 0  |  
| UNWIND_ERROR_NONE  | 1  |  
| UNWIND_ERROR_MEMORY_INVALID  | 2  |  
| UNWIND_ERROR_UNWIND_INFO  | 3  |  
| UNWIND_ERROR_UNSUPPORTED  | 4  |  
| UNWIND_ERROR_INVALID_MAP  | 5  |  
| UNWIND_ERROR_MAX_FRAMES_EXCEEDED  | 6  |  
| UNWIND_ERROR_REPEATED_FRAME  | 7  |  
| UNWIND_ERROR_INVALID_ELF  | 8  |  
| UNWIND_ERROR_SYSTEM_CALL  | 9  |  
| UNWIND_ERROR_THREAD_TIMEOUT  | 10  |  
| UNWIND_ERROR_THREAD_DOES_NOT_EXIST  | 11  |  
| UNWIND_ERROR_BAD_ARCH  | 12  |  
| UNWIND_ERROR_MAPS_PARSE  | 13  |  
| UNWIND_ERROR_INVALID_PARAMETER  | 14  |  
| UNWIND_ERROR_PTRACE_CALL  | 15  |  
###  PerfSample.SampleSkipReason
If set, indicates that the profiler encountered a sample that was relevant, but was skipped.
Defined in [profile_packet.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/profiling/profile_packet.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| PROFILER_SKIP_UNKNOWN  | 0  |  
| PROFILER_SKIP_READ_STAGE  | 1  |  
| PROFILER_SKIP_UNWIND_STAGE  | 2  |  
| PROFILER_SKIP_UNWIND_ENQUEUE  | 3  |  
| PROFILER_SKIP_NOT_IN_SCOPE  | 4  |  
###  PerfSample.ProducerEvent
A notable event within the sampling implementation.
Defined in [profile_packet.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/profiling/profile_packet.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| source_stop_reason  | [DataSourceStopReason](https://perfetto.dev/docs/reference/trace-packet-proto#PerfSample.ProducerEvent.DataSourceStopReason)  |  
###  PerfSample.ProducerEvent.DataSourceStopReason
Defined in [profile_packet.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/profiling/profile_packet.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| PROFILER_STOP_UNKNOWN  | 0  |  
| PROFILER_STOP_GUARDRAIL  | 1  |  
##  CpuInfo
Information about CPUs from procfs and sysfs.
Defined in [cpu_info.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/system_info/cpu_info.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| cpus  | Describes available CPUs, one entry per CPU.  |  
###  CpuInfo.Cpu
Information about a single CPU.
Defined in [cpu_info.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/system_info/cpu_info.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| processor  | string  | Value of "Processor" field from /proc/cpuinfo for this CPU.Example: "AArch64 Processor rev 12 (aarch64)"  |  
| frequencies  | uint32[]  | Frequencies from /sys/devices/system/cpu/cpuX/cpufreq/scaling_available_frequencies where X is the index of this CPU.  |  
| capacity  | uint32  | Cpu capacity from /sys/devices/system/cpu/cpuX/cpu_capacity where X is the index of this CPU.  |  
| arm_identifier  | [ArmCpuIdentifier](https://perfetto.dev/docs/reference/trace-packet-proto#CpuInfo.ArmCpuIdentifier)  |  
| features  | uint64  | Features is a bitmap containing a bit set for each feature defined in kCpuInfoFlags (cpu_info_flags_allowlist.h) for the corresponding array index.  |  
###  CpuInfo.ArmCpuIdentifier
Defined in [cpu_info.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/system_info/cpu_info.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| implementer  | uint32  | Implementer code  |  
| architecture  | uint32  | Architecture code  |  
| variant  | uint32  | CPU variant  |  
| part  | uint32  | CPU part  |  
| revision  | uint32  | CPU revision  |  
##  SmapsPacket
Defined in [smaps.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/profiling/smaps.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| pid  | uint32  |  
| entries  | [SmapsEntry[]](https://perfetto.dev/docs/reference/trace-packet-proto#SmapsEntry)  |  
| packed_entries  |  
| recording_type  |  
###  SmapsEntry
Defined in [smaps.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/profiling/smaps.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| path  | string  |  
| size_kb  | uint64  |  
| private_dirty_kb  | uint64  |  
| swap_kb  | uint64  |  
| file_name  | string  | for field upload (instead of path).  |  
| start_address  | uint64  | Fields below added and used only for Chromium memory infra, see crbug.com/1098746.  |  
| module_timestamp  | uint64  |  
| module_debugid  | string  |  
| module_debug_path  | string  |  
| protection_flags  | uint32  |  
| private_clean_resident_kb  | uint64  |  
| shared_dirty_resident_kb  | uint64  |  
| shared_clean_resident_kb  | uint64  |  
| locked_kb  | uint64  |  
| proportional_resident_kb  | uint64  |  
###  PackedSmaps
Structure-of-arrays style smaps packet of a single process. All packed repeated fields, if set, must have the same length.
Defined in [smaps.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/profiling/smaps.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| string_table  | string[]  | Table of path names. Notes:* first element is the empty string, serialised explicitly.* the table might contain duplicates.  |  
| name_id  | uint32[]  | Interned file paths as an index into `string_table`.Note: the "(deleted)" suffix is kept as part of the string_table entry, and is to be handled during trace import stage.Written only if config.unaggregated == true. Otherwise the string_table is exactly the ordered names of the aggregated mappings.  |  
| aggregate_count  | uint32[]  | How many mappings were merged by name, summing the values below.Written only if config.unaggregated == false.  |  
| size_kb  | uint64[]  |  
| rss_kb  | uint64[]  |  
| anonymous_kb  | uint64[]  |  
| swap_kb  | uint64[]  |  
| shared_clean_kb  | uint64[]  |  
| shared_dirty_kb  | uint64[]  |  
| private_clean_kb  | uint64[]  |  
| private_dirty_kb  | uint64[]  |  
| locked_kb  | uint64[]  |  
| pss_kb  | uint64[]  |  
| pss_dirty_kb  | uint64[]  |  
| swap_pss_kb  | uint64[]  |  
###  SmapsPacket.RecordingType
Records how the snapshot was generated, as the message is shared by multiple smaps writers. If populating `packed_entries`, set explicitly to RECORDING_TYPE_STANDALONE as otherwise the trace importer might transform the data.
Defined in [smaps.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/profiling/smaps.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| RECORDING_TYPE_UNKNOWN  | 0  |  
| RECORDING_TYPE_STANDALONE  | 1  | Normal recording.  |  
| RECORDING_TYPE_ART_HPROF_POSTFORK  | 2  | Android: recorded in the perfetto_hprof ART plugin as part of a managed heap dump. Recording is done inside of a forked child process, which means private/shared and pss fields are misleading as there is copy-on-write page sharing with the forked child.  |  
| RECORDING_TYPE_ART_HPROF_PREFORK  | 3  | Android: recorded in the perfetto_hprof ART plugin as part of a managed heap dump, but with the original smaps calculated before forking in the plugin.  |  
##  TracingServiceEvent
Events emitted by the tracing service.
Defined in [tracing_service_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/perfetto/tracing_service_event.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| tracing_started  | bool  | Emitted when we start tracing and specifically, this will be before any producer is notified about the existence of this trace. This is always emitted before the all_data_sources_started event. This event is also guaranteed to be seen (byte-offset wise) before any data packets from producers.  |  
| all_data_sources_started  | bool  | Emitted after all data sources saw the start event and ACKed it.This identifies the point in time when it's safe to assume that all data sources have been recording events.  |  
| flush_started  | bool  | Emitted when a flush is started.  |  
| all_data_sources_flushed  | bool  | Emitted when all data sources have been flushed successfully or with an error (including timeouts). This can generally happen many times over the course of the trace.  |  
| read_tracing_buffers_completed  | bool  | Emitted when reading back the central tracing buffers has been completed.If `write_into_file` is specified, this can happen many times over the course of the trace.  |  
| tracing_disabled  | bool  | Emitted after tracing has been disabled and specifically, this will be after all packets from producers have been included in the central tracing buffer.  |  
| seized_for_bugreport  | bool  | Emitted if perfetto --save-for-bugreport was invoked while the current tracing session was running and it had the highest bugreport_score. In this case the original consumer will see a nearly empty trace, because the contents are routed onto the bugreport file. This event flags the situation explicitly. Traces that contain this marker should be discarded by test infrastructures / pipelines.Deprecated since Android U, where --save-for-bugreport uses non-destructive cloning.  |  
| slow_starting_data_sources  | Emitted when not all data sources in all producers reply to a start request after some time.  |  
| last_flush_slow_data_sources  | Emitted when the last flush request has failed. Lists data sources that did not reply on time.  |  
| clone_started  | bool  | If this was a cloned tracing session, emitted when the tracing serice started the clone operation.  |  
| buffer_cloned  | uint32  | If this was a cloned tracing session, emitted when the tracing service finished the clone operation (for a specific buffer).  |  
###  TracingServiceEvent.DataSources
Defined in [tracing_service_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/perfetto/tracing_service_event.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| data_source  |  
###  TracingServiceEvent.DataSources.DataSource
Defined in [tracing_service_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/perfetto/tracing_service_event.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| producer_name  | string  |  
| data_source_name  | string  |  
##  ConcurrentSessionEvent
Emitted by the tracing service to record a state change of another tracing session that was active while this trace was being recorded. Opt-in via TraceConfig.BuiltinDataSource.enable_concurrent_session_events.
One packet per state change; its time is carried by the enclosing TracePacket's timestamp (CLOCK_BOOTTIME). Events of the same session share the same `session_id`. The trace UUID is deliberately not included.
Introduced in v58 / Android 26Q3+.
Defined in [concurrent_session_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/perfetto/concurrent_session_event.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| state  | The state the session transitioned to at this timestamp.  |  
| session_name  | string  | unique_session_name from the session's TraceConfig. May be empty.  |  
| session_id  | uint64  | Service-local monotonic counter identifying the session. Shared by all state changes of one session, never reused within a service instance.  |  
| consumer_uid  | int32  | Unix uid of the consumer that started the session.  |  
| num_data_sources  | uint32  | Number of data sources in the session at the time of the state change.  |  
###  ConcurrentSessionEvent.State
Mirrors the tracing service's internal session state machine (TracingSession::State in the service): keep these two enums in sync. These values are part of the trace wire format and must stay stable: never renumber or reuse an existing value, only append new ones at the end.
Defined in [concurrent_session_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/perfetto/concurrent_session_event.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| STATE_UNSPECIFIED  | 0  |  
| STATE_DISABLED  | 1  | Not recording (initial and final state).  |  
| STATE_CONFIGURED  | 2  | Configured but waiting for a start signal (e.g. a trigger).  |  
| STATE_STARTED  | 3  | Actively recording data.  |  
| STATE_DISABLING_WAITING_STOP_ACKS  | 4  | Stopping, waiting for data sources to ack and drain their final data.  |  
| STATE_CLONED_READ_ONLY  | 5  | A read-only snapshot of another session, created by a clone operation.  |  
##  StackSample
A single stack sample: a callstack captured for a task, measured against a counter timebase. This is transport-neutral and timebase-neutral. The timebase can be CPU cycles, wall-clock nanoseconds, allocated bytes, page faults, etc.; the primary CounterDescriptor says which. It is not specific to CPU profiling.
Each context/callstack/descriptor can be given inline or as an `iid` referencing an InternedData entry. Producers that reuse a context across samples should intern it so the per-sample cost is a single varint.
Defined in [stack_sample.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/profiling/stack_sample.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| task_context  | Inline task context.  |  
| task_context_iid  | uint64  | Interned task context, referencing InternedData.stack_sample_task_contexts.  |  
| execution_context  | [ExecutionContext](https://perfetto.dev/docs/reference/trace-packet-proto#StackSample.ExecutionContext)  | Inline execution context.  |  
| execution_context_iid  | uint64  | Interned execution context, referencing InternedData.stack_sample_execution_contexts.  |  
| callstack  | [InlineCallstack](https://perfetto.dev/docs/reference/trace-packet-proto#InlineCallstack)  | Fully-inline callstack: each frame carries its function name and source location directly, no interning. Simple but larger; prefer `callstack_iid` when callstacks repeat or frames need binary/library information (mappings, build ids, relative pcs).  |  
| callstack_iid  | uint64  | Interned callstack, referencing InternedData.callstacks.  |  
| unwind_error  | string  | Inline unwind error string.  |  
| unwind_error_iid  | uint64  | Interned unwind error string, referencing an InternedData string entry.  |  
| primary_descriptor  | [CounterDescriptor](https://perfetto.dev/docs/reference/trace-packet-proto#StackSample.CounterDescriptor)  | Inline timebase descriptor.  |  
| primary_descriptor_iid  | uint64  | Interned timebase descriptor, referencing InternedData.stack_sample_counter_descriptors.  |  
| primary_weight  | uint64  | The value attributed to this sample for the primary counter (e.g. the number of cycles or nanoseconds this sample represents).  |  
| follower_descriptors  | [CounterDescriptor[]](https://perfetto.dev/docs/reference/trace-packet-proto#StackSample.CounterDescriptor)  | Additional counters read at the same sample (e.g. instructions, cache misses read alongside a cycles timebase). follower_weights is positional with whichever of follower_descriptors / follower_descriptor_iids is set.  |  
| follower_descriptor_iids  | uint64[]  |  
| follower_weights  | uint64[]  |  
###  StackSample.TaskContext
The task an observation is attributed to. At least one of pid / tid / async_id should be set. async_id identifies a stackful async context (goroutine, fiber, ...) described by an AsyncContextDescriptor whose iid equals the async_id.
Defined in [stack_sample.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/profiling/stack_sample.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| iid  | uint64  | Interning key, used when this context is emitted via InternedData.stack_sample_task_contexts and referenced by StackSample.task_context_iid. Starts from 1; 0 is the same as "not set".  |  
| pid  | uint32  | OS process id the sample belongs to.  |  
| tid  | uint32  | OS thread id the sample belongs to. If only tid is set, the process is inferred from thread association elsewhere in the trace.  |  
| async_id  | uint64  |  
###  StackSample.ExecutionContext
The execution state a sample was taken in. All fields are optional: an off-CPU sample (e.g. a wall-clock sampler catching a sleeping thread) has no meaningful cpu or mode.
Defined in [stack_sample.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/profiling/stack_sample.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| iid  | uint64  | Interning key, used when this context is emitted via InternedData.stack_sample_execution_contexts and referenced by StackSample.execution_context_iid. Starts from 1; 0 is the same as "not set".  |  
| cpu  | uint32  | The cpu the sample was taken on.  |  
| mode  | The privilege level the sampled code was running at.  |  
###  StackSample.Mode
The privilege level a sample was taken at. Append-only: never renumber or repurpose an existing value.
Defined in [stack_sample.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/profiling/stack_sample.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| MODE_UNKNOWN  | 0  |  
| MODE_USER  | 1  |  
| MODE_KERNEL  | 2  |  
| MODE_HYPERVISOR  | 3  |  
| MODE_GUEST_USER  | 4  |  
| MODE_GUEST_KERNEL  | 5  |  
###  InlineCallstack
A fully-inline, self-contained callstack: each frame carries its function name and source location directly, with no interning. This is the simple alternative to Callstack (whose frames are interned Frame/Mapping references): use it when trace size is not a concern or callstacks are unique. For binary/library information (mappings, build ids, relative pcs) or efficient repetition, use interned Callstacks instead.
Used by StackSample as the inline (non-interned) variant of its callstack field.
Defined in [inline_callstack.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/profiling/inline_callstack.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| frames  | Frames of this callstack, ordered from bottom (outermost) to top (innermost). For example, if main() calls foo() which calls bar(), the frames are: [main, foo, bar].  |  
###  InlineCallstack.Frame
A frame within an inline callstack.
Defined in [inline_callstack.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/profiling/inline_callstack.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| function_name  | string  | Function name, e.g. "malloc" or "std::vector::push_back".  |  
| source_file  | string  | Source file path, e.g. "/src/foo.cc".  |  
| line_number  | uint32  | Line number in the source file.  |  
###  StackSample.CounterDescriptor
Describes a counter: a named, typed quantity a sample is measured against (the sampling timebase) or observed alongside (a follower). Values live on the sample as weights; this only describes their meaning.
Defined in [stack_sample.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/profiling/stack_sample.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| iid  | uint64  | Interning key, used when this descriptor is emitted via InternedData.stack_sample_counter_descriptors and referenced by StackSample.primary_descriptor_iid. Starts from 1; 0 is the same as "not set".  |  
| name  | string  | Human-readable counter name, e.g. "cycles", "wall-time", "cache-misses".  |  
| unit  | A well-known unit from the Unit enum.  |  
| unit_str  | string  | A custom unit label, used when no Unit enum value fits.  |  
| unit_multiplier  | uint64  | Scales raw weights to `unit`. E.g. unit=UNIT_BYTES, unit_multiplier=1024 means weights are in KiB. Absent means 1.  |  
| description  | string  | Free-form description of what the counter measures.  |  
| scope  | The scope of this counter's instances. Absent means SCOPE_GLOBAL.  |  
###  StackSample.Unit
The unit a CounterDescriptor's values are expressed in. Append-only: new units may be added, but existing values are never renumbered or repurposed. If none of these fit, set CounterDescriptor.unit_str instead.
Defined in [stack_sample.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/profiling/stack_sample.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| UNIT_UNSPECIFIED  | 0  |  
| UNIT_NANOSECONDS  | 1  |  
| UNIT_CPU_CYCLES  | 2  |  
| UNIT_INSTRUCTIONS  | 3  |  
| UNIT_BYTES  | 4  |  
| UNIT_PAGE_FAULTS  | 5  |  
| UNIT_CACHE_MISSES  | 6  |  
| UNIT_CACHE_REFERENCES  | 7  |  
| UNIT_BRANCH_MISSES  | 8  |  
| UNIT_COUNT  | 9  |  
###  StackSample.CounterDescriptor.Scope
The scope of a counter instance: which stream of values the per-sample weights belong to. Counter instances accumulate independently, so values from different instances must never be merged into one stream. Trace processor keeps sampling streams separate and materializes one counter track per instance within each stream: SCOPE_GLOBAL yields one track per sampling stream and SCOPE_CPU one track per (sampling stream, cpu).
If your profiler needs a scope that is not listed here, please file a bug at <https://github.com/google/perfetto/issues> explaining what you are trying to record and which scope you would like added. Append-only: never renumber or repurpose an existing value.
Defined in [stack_sample.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/profiling/stack_sample.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| SCOPE_UNSPECIFIED  | 0  | Treated as SCOPE_GLOBAL.  |  
| SCOPE_GLOBAL  | 1  | A single counter instance, not split by cpu, thread or anything else.  |  
| SCOPE_CPU  | 2  | One counter instance per cpu. Each sample's weight belongs to the instance of the cpu in its ExecutionContext; samples without a cpu cannot be attributed and their weights for this counter are dropped.  |  
##  InitialDisplayState
Defined in [initial_display_state.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/android/initial_display_state.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| display_state  | int32  | Same values as android.view.Display.STATE_*  |  
| brightness  | double  |  
##  GpuMemTotalEvent
Generated by Android's GpuService.
Defined in [gpu_mem_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/gpu/gpu_mem_event.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| gpu_id  | uint32  |  
| pid  | uint32  |  
| size  | uint64  |  
##  MemoryTrackerSnapshot
Message definitions for app-reported memory breakdowns. At the moment, this is a Chrome-only tracing feature, historically known as 'memory-infra'. See <https://chromium.googlesource.com/chromium/src/+/master/docs/memory-infra/> . This is unrelated to the native or java heap profilers (those protos live in //protos/perfetto/trace/profiling/).
Defined in [memory_graph.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/memory_graph.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| global_dump_id  | uint64  | Unique ID that represents the global memory dump.  |  
| level_of_detail  |  
| process_memory_dumps  | [ProcessSnapshot[]](https://perfetto.dev/docs/reference/trace-packet-proto#MemoryTrackerSnapshot.ProcessSnapshot)  |  
###  MemoryTrackerSnapshot.LevelOfDetail
Defined in [memory_graph.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/memory_graph.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| DETAIL_FULL  | 0  |  
| DETAIL_LIGHT  | 1  |  
| DETAIL_BACKGROUND  | 2  |  
###  MemoryTrackerSnapshot.ProcessSnapshot
Memory snapshot of a process. The snapshot contains memory data that is from 2 different sources, namely system stats and instrumentation stats. The system memory usage stats come from the OS based on standard API available in the platform to query memory usage. The instrumentation stats are added by instrumenting specific piece of code which tracks memory allocations and deallocations made by a small sub-system within the application. The system stats of the global memory snapshot are recorded as part of ProcessStats and SmapsPacket fields in trace packet with the same timestamp.
Defined in [memory_graph.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/memory_graph.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| pid  | int32  | Process ID of the process  |  
| allocator_dumps  |  
| memory_edges  |  
###  MemoryTrackerSnapshot.ProcessSnapshot.MemoryNode
Memory dumps are represented as a graph of memory nodes which contain statistics. To avoid double counting the same memory across different nodes, edges are used to mark nodes that account for the same memory. See this doc for examples of the usage: <https://docs.google.com/document/d/1WGQRJ1sjJrfVkNcgPVY6frm64UqPc94tsxUOXImZUZI>
A single node in the memory graph.
Defined in [memory_graph.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/memory_graph.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| id  | uint64  | Unique ID of the node across all processes involved in the global memory dump. The ID is only unique within this particular global dump identified by GlobalMemoryDumpPacket.global_dump_id.  |  
| absolute_name  | string  | Absolute name is a unique name for the memory node within the process with ProcessMemoryDump.pid. The name can contain multiple parts separated by '/', which traces the edges of the node from the root node.Eg: "partition_allocator/array_buffers/buffer1" refers to the child node "buffer1" in a graph structure of:root -> partition_allocator -> array_buffers -> buffer1.  |  
| weak  | bool  | A weak node means that the instrumentation that added the current node is unsure about the existence of the actual memory. Unless a "strong" (non-weak is default) node that has an edge to the current node exists in the current global dump, the current node will be discarded.  |  
| size_bytes  | uint64  | Size of the node in bytes, used to compute the effective size of the nodes without double counting.  |  
| entries  |  
###  MemoryTrackerSnapshot.ProcessSnapshot.MemoryNode.MemoryNodeEntry
Entries in the memory node that contain statistics and additional debuggable information about the memory. The size of the node is tracked separately in the `size_bytes` field.
Defined in [memory_graph.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/memory_graph.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
| units  |  
| value_uint64  | uint64  | Contains either one of uint64 or string value.  |  
| value_string  | string  |  
###  MemoryTrackerSnapshot.ProcessSnapshot.MemoryNode.MemoryNodeEntry.Units
Defined in [memory_graph.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/memory_graph.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| UNSPECIFIED  | 0  |  
| BYTES  | 1  |  
| COUNT  | 2  |  
###  MemoryTrackerSnapshot.ProcessSnapshot.MemoryEdge
A directed edge that connects any 2 nodes in the graph above. These are in addition to the inherent edges added due to the tree structure of the node's absolute names. Node with id `source_id` owns the node with id `target_id`, and has the effect of attributing the memory usage of target to source. `importance` is optional and relevant only for the cases of co-ownership, where it acts as a z-index: the owner with the highest importance will be attributed target's memory.
Defined in [memory_graph.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/memory_graph.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| source_id  | uint64  |  
| target_id  | uint64  |  
| importance  | uint32  |  
| overridable  | bool  |  
##  AndroidEnergyEstimationBreakdown
Energy data retrieve using the ODPM(On Device Power Monitor) API. This proto represents the aidl class: android.hardware.power.stats.EnergyConsumerResult.
Defined in [android_energy_estimation_breakdown.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/power/android_energy_estimation_breakdown.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| energy_consumer_descriptor  | [AndroidEnergyConsumerDescriptor](https://perfetto.dev/docs/reference/trace-packet-proto#AndroidEnergyConsumerDescriptor)  | The first trace packet of each session should include a energy consumer descriptor.  |  
| energy_consumer_id  | int32  | ID of the AndroidEnergyConsumer associated with this result. Matches the energy_consumer_id in the AndroidEnergyConsumerDescriptor that should be sent at the beginning of a trace.  |  
| energy_uws  | int64  | Total accumulated energy since boot in microwatt-seconds (uWs)  |  
| per_uid_breakdown  | [EnergyUidBreakdown[]](https://perfetto.dev/docs/reference/trace-packet-proto#AndroidEnergyEstimationBreakdown.EnergyUidBreakdown)  | Optional attributed energy per Android ID / Linux UID for this EnergyConsumer. Sum total of attributed energy must be less than or equal to total accumulated energy.  |  
###  AndroidEnergyConsumerDescriptor
Defined in [android_energy_consumer_descriptor.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/common/android_energy_consumer_descriptor.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| energy_consumers  | [AndroidEnergyConsumer[]](https://perfetto.dev/docs/reference/trace-packet-proto#AndroidEnergyConsumer)  |  
###  AndroidEnergyConsumer
Energy consumer based on aidl class: android.hardware.power.stats.EnergyConsumer.
Defined in [android_energy_consumer_descriptor.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/common/android_energy_consumer_descriptor.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| energy_consumer_id  | int32  | Unique ID of this energy consumer. Matches the ID in a AndroidEnergyEstimationBreakdown.  |  
| ordinal  | int32  | For a group of energy consumers of the same logical type, sorting by ordinal gives their physical order. Ordinals must be consecutive integers starting from 0.  |  
| type  | string  | Type of this energy consumer.  |  
| name  | string  | Unique name of this energy consumer. Vendor/device specific. Opaque to framework.  |  
###  AndroidEnergyEstimationBreakdown.EnergyUidBreakdown
Defined in [android_energy_estimation_breakdown.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/power/android_energy_estimation_breakdown.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| uid  | int32  | Android ID/Linux UID, the accumulated energy is attributed to.  |  
| energy_uws  | int64  | Accumulated energy since boot in microwatt-seconds (uWs).  |  
##  UiState
Common state for UIs visualizing Perfetto traces. This message can be appended as a TracePacket by UIs to save the visible state (e.g. scroll position/zoom state) for future opening of the trace. Design doc: go/trace-ui-state.
Defined in [ui_state.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ui_state.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| timeline_start_ts  | int64  | The start and end bounds of the viewport of the UI in nanoseconds. This is the absolute time associated to slices and other events in trace processor tables (i.e. the `ts` column of most tables)  |  
| timeline_end_ts  | int64  |  
| highlight_process  | [HighlightProcess](https://perfetto.dev/docs/reference/trace-packet-proto#UiState.HighlightProcess)  |  
###  UiState.HighlightProcess
Indicates that the given process should be highlighted by the UI.
Defined in [ui_state.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ui_state.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| pid  | uint32  | The pid of the process to highlight. This is useful for UIs to focus on tracks of a particular process in the trace. If more than one process in a trace has the same pid, it is UI implementation specific how the process to be focused will be chosen.  |  
| cmdline  | string  | The command line of the process to highlight; for most Android apps, this is the package name of the app. This is useful for UIs to focus on a particular app in the trace. If more than one process hasthe same cmdline, it is UI implementation specific how the process to be focused will be chosen.  |  
##  TranslationTable
Translation rules for the trace processor. See the comments for each rule type for specific meaning.
Defined in [translation_table.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/translation/translation_table.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| chrome_histogram  | [ChromeHistorgramTranslationTable](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeHistorgramTranslationTable)  |  
| chrome_user_event  | [ChromeUserEventTranslationTable](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeUserEventTranslationTable)  |  
| chrome_performance_mark  | [ChromePerformanceMarkTranslationTable](https://perfetto.dev/docs/reference/trace-packet-proto#ChromePerformanceMarkTranslationTable)  |  
| slice_name  | [SliceNameTranslationTable](https://perfetto.dev/docs/reference/trace-packet-proto#SliceNameTranslationTable)  |  
| process_track_name  | [ProcessTrackNameTranslationTable](https://perfetto.dev/docs/reference/trace-packet-proto#ProcessTrackNameTranslationTable)  |  
| chrome_study  | [ChromeStudyTranslationTable](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeStudyTranslationTable)  |  
###  ChromeHistorgramTranslationTable
Chrome histogram sample hash -> name translation rules.
Defined in [translation_table.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/translation/translation_table.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| hash_to_name  | string  |  
###  ChromeUserEventTranslationTable
Chrome user event action hash -> name translation rules.
Defined in [translation_table.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/translation/translation_table.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| action_hash_to_name  | string  |  
###  ChromePerformanceMarkTranslationTable
Chrome performance mark translation rules.
Defined in [translation_table.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/translation/translation_table.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| site_hash_to_name  | string  |  
| mark_hash_to_name  | string  |  
###  SliceNameTranslationTable
Raw -> deobfuscated slice name translation rules.
Defined in [translation_table.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/translation/translation_table.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| raw_to_deobfuscated_name  | string  |  
###  ProcessTrackNameTranslationTable
Raw -> deobfuscated process track name translation rules.
Defined in [translation_table.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/translation/translation_table.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| raw_to_deobfuscated_name  | string  |  
###  ChromeStudyTranslationTable
Chrome study hash -> name translation rules.
Defined in [translation_table.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/translation/translation_table.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| hash_to_name  | string  |  
##  AndroidGameInterventionList
Defined in [android_game_intervention_list.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/android/android_game_intervention_list.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| game_packages  |  
| parse_error  | bool  | True when at least one error occurred when parsing game_mode_intervention.list  |  
| read_error  | bool  | Failed to open / read game_mode_intervention.list  |  
###  AndroidGameInterventionList.GamePackageInfo
Defined in [android_game_intervention_list.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/android/android_game_intervention_list.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
| uid  | uint64  |  
| current_mode  | uint32  |  
| game_mode_info  |  
###  AndroidGameInterventionList.GameModeInfo
Defined in [android_game_intervention_list.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/android/android_game_intervention_list.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| mode  | uint32  |  
| use_angle  | bool  |  
| resolution_downscale  | float  |  
| fps  | float  |  
##  StatsdAtom
One or more statsd atoms. This must continue to match: perfetto/protos/third_party/statsd/shell_data.proto So that we can efficiently add data from statsd directly to the trace.
Defined in [statsd_atom.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/statsd/statsd_atom.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| atom  | Atom should be filled with an Atom proto from:<https://cs.android.com/android/platform/superproject/main/+/main:frameworks/proto_logging/stats/atoms.proto?q=f:stats%2Fatoms.proto$%20message%5C%20Atom> We don't reference Atom directly here since we don't want to import Atom.proto and all its transitive dependencies into Perfetto.atom and timestamp_nanos have the same cardinality  |  
| timestamp_nanos  | int64[]  |  
###  Atom
Deliberate empty message. See comment on StatsdAtom#atom below.
Defined in [statsd_atom.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/statsd/statsd_atom.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
##  AndroidSystemProperty
Defined in [android_system_property.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/android/android_system_property.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| values  |  
###  AndroidSystemProperty.PropertyValue
Defined in [android_system_property.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/android/android_system_property.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
| value  | string  |  
##  EntityStateResidency
Defined in [android_entity_state_residency.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/power/android_entity_state_residency.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| power_entity_state  | [PowerEntityState[]](https://perfetto.dev/docs/reference/trace-packet-proto#EntityStateResidency.PowerEntityState)  | This is only emitted at the beginning of the trace.  |  
| residency  |  
###  EntityStateResidency.PowerEntityState
Defined in [android_entity_state_residency.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/power/android_entity_state_residency.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| entity_index  | int32  | Index corresponding to the entity  |  
| state_index  | int32  | Index corresponding to the state  |  
| entity_name  | string  | Name of the entity. This is device-specific, determined by the PowerStats HAL, and cannot be configured by the user. An example would be "Bluetooth".  |  
| state_name  | string  | Name of the state. This is device-specific, determined by the PowerStats HAL, and cannot be configured by the user. An example would be "Active".  |  
###  EntityStateResidency.StateResidency
Defined in [android_entity_state_residency.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/power/android_entity_state_residency.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| entity_index  | int32  | Index corresponding to PowerEntityState.entity_index  |  
| state_index  | int32  | Index corresponding to PowerEntityState.state_index  |  
| total_time_in_state_ms  | uint64  | Time since boot that this entity has been in this state  |  
| total_state_entry_count  | uint64  | Total number of times since boot that the entity has entered this state  |  
| last_entry_timestamp_ms  | uint64  | Timestamp of the last time the entity entered this state  |  
##  TraceProvenance
Defined in [trace_provenance.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/perfetto/trace_provenance.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| buffers  |  
###  TraceProvenance.Buffer
Describes a trace buffer and all the sequences writing to it.
Defined in [trace_provenance.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/perfetto/trace_provenance.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| sequences  |  
###  TraceProvenance.Sequence
Defined in [trace_provenance.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/perfetto/trace_provenance.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| id  | uint32  | The trusted_packet_sequence_id reported in each TracePacket.  |  
| producer_id  | int32  | ID of the producer, as per Producer.id.  |  
##  TracePacket.ProtoVms
Encapsulates the state and configuration of the ProtoVM instances running when the trace was snapshotted. This allows TP to re-instantiate the VMs and use them to inflate patches into full-state packets. Note: this message can't be defined in a dedicated file because it has a recursive dependency with TracePacket (see 'state' field below).
Defined in [trace_packet.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/trace_packet.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| instance  |  
###  TracePacket.ProtoVms.Instance
Defined in [trace_packet.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/trace_packet.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| program  |  
| state  |  
| memory_limit_kb  | uint32  |  
| producer_id  | int32[]  |  
###  VmProgram
Defined in [vm_program.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/protovm/vm_program.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| version  | uint32  |  
| instructions  | [VmInstruction[]](https://perfetto.dev/docs/reference/trace-packet-proto#VmInstruction)  |  
###  VmInstruction
Defined in [vm_program.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/protovm/vm_program.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| select  |  
| reg_load  |  
| merge  |  
| set  |  
| del  |  
| abort_level  |  
| nested_instructions  | [VmInstruction[]](https://perfetto.dev/docs/reference/trace-packet-proto#VmInstruction)  | Sub-instructions executed if the current instruction succeeds  |  
###  VmOpSelect
Defined in [vm_program.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/protovm/vm_program.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| cursor  | Enum SRC`DST`BOTH. Default=SRC.  |  
| relative_path  | [PathComponent[]](https://perfetto.dev/docs/reference/trace-packet-proto#VmOpSelect.PathComponent)  |  
| create_if_not_exist  | bool  | Creates the submessage if doesn't exist in the DST cursor (think of mkdir -p). Only valid when cursor=DST  |  
###  VmCursorEnum
Defined in [vm_program.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/protovm/vm_program.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| VM_CURSOR_UNSPECIFIED  | 0  |  
| VM_CURSOR_SRC  | 1  |  
| VM_CURSOR_DST  | 2  |  
| VM_CURSOR_BOTH  | 3  |  
###  VmOpSelect.PathComponent
A path component is either: (1) a field id to descend into (common case); (2) an array index (for repeated fields); (3) a map lookup operation (for repeated fields, where we snoop a sub-field as a map key)
Defined in [vm_program.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/protovm/vm_program.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| field_id  | uint32  |  
| array_index  | uint32  |  
| map_key_field_id  | uint32  | The ID of the field in the repeated submessage that we use as a key (e.g. LayerState.layer_id). When setting this register_to_match must also be set, to tell what's the expected value of the key we are looking up.  |  
| is_repeated  | bool  | Only valid when using field_id. This makes select have foreach semantics. This means that the body of nested_instructions is executed several times, once per each repeated submessage.  |  
| register_to_match  | uint32  | Only valid when using map_key_field_id. This defines which register (R1..R32) should be used to match the key of the dict in a map lookup operation.In other words:foreach msg in repeated message { if msg[map_key_field_id] == R[register_to_match] { break; // Lookup succeeded, PathComponent resolves here.} }  |  
| store_foreach_index_into_register  | uint32  | Only valid when using field_id and is_repeated=true. When iterating over repeated fields, stores the current iteration index into the the register R1..R32 defined below. This can be used to do complex operations like "find the entry in the array that has width==100, remember its offset in the SRC array and overwrite the matching i-th element in the DST array. We will probably never implement this but it's here for completeness.  |  
###  VmOpRegLoad
Defined in [vm_program.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/protovm/vm_program.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| cursor  | SRC(default)  |  
| dst_register  | uint32  | 1=R1, 2=R2... 32=R32  |  
###  VmOpMerge
Merges SRC into DST. Both need to point to a message (not a field).
Defined in [vm_program.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/protovm/vm_program.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| skip_submessages  | bool  | When true, the merge operation will skip any field that is already resolved as a message node in the destination tree. This is used to support merging of nested messages. Because ProtoVM does not know the schema, a standard MERGE cannot distinguish between a string and a message on the wire and it would overwrite the entire blob, destroying granular updates. By setting this to true, a program can be implemented to do a bottom-up, multi-step merge by traversing into and merging the deepest submessages first, then moving up to the parent message and merging it with skip_submessages = true.  |  
| del_if_src_empty  | bool  | When true, the merge operation will remove the dst field if the src field is empty. This can be used to replicate the removal of a subobject within the producer's state. E.g.This event on the producer side: mProducerState.mSubobject = nullptr can be represented by this patch: { producer_state { subobject {} }}  |  
###  VmOpSet
Copies SRC into DST. If a message, replaces the DST node, discarding any pre-existing field.
Defined in [vm_program.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/protovm/vm_program.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
###  VmOpDel
Delete the field or message pointed by DST.
Defined in [vm_program.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/protovm/vm_program.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
###  VmInstruction.AbortLevel
Defined in [vm_program.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/protovm/vm_program.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| SKIP_CURRENT_INSTRUCTION  | 1  | Skip current instruction but execute following ones  |  
| SKIP_CURRENT_INSTRUCTION_AND_BREAK_OUTER  | 2  | Skip current instruction as well as following ones (default)  |  
| ABORT  | 3  | Abort whole program  |  
##  TraceAttributes
Arbitrary key value pairs which can attached to a trace to provide context about any facet of the trace. This can include, what data it contains, properties of the host / machine the trace was collected on, and other interesting information about a trace.
Examples include: gradle_version = "9.0.10-alpha01" java_major_version = 24
Attributes can be written as a TracePacket or set in `TraceConfig.trace_attributes` (e.g. via `perfetto --add-attribute`).
All keys get prefixed with `trace_attribute.` in the UI and in `traceprocessor`. If there are multiple trace attribute packets that use the same key, then the latest value wins. These key value pairs show up in the `Overview` section in Perfetto UI. Additionally, these key, value pairs can also be queried using Pefetto SQL by using the following query:
`SELECT * FROM metadata WHERE name GLOB 'trace_attribute.*';`
Defined in [trace_attributes.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/common/trace_attributes.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| attribute  |  
###  TraceAttributes.Attribute
Defined in [trace_attributes.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/common/trace_attributes.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| key  | string  | The key  |  
| long_value  | int64  |  
| string_value  | string  |  
##  AndroidAflags
Android aconfig flags (aflags). This message captures a snapshot of the state of aconfig flags on the device. Keep in sync with: <http://ac/packages/modules/ConfigInfrastructure/aflags/proto/aflags.proto>
Defined in [android_aflags.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/android/android_aflags.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| flags  | A collection of flags.  |  
| error  | string  | A human-readable error logged if aflags processing fails.This is a perfetto specific field used to help debugging.  |  
###  AndroidAflags.Flag
Representation of an aconfig flag and its metadata.
Defined in [android_aflags.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/android/android_aflags.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| flag_namespace  | string  |  
| name  | string  |  
| pkg  | string  | The aconfig package (e.g. "com.android.foo"). These are system-level identifiers and not privacy-impacting.  |  
| container  | string  | The container where the flag lives (e.g. "system", "vendor", or mainline module name).  |  
| value  | string  | The flag value as a string to support different future data types.  |  
| staged_value  | string  | The value that will be applied after the next reboot, if different from the current value.  |  
| permission  |  
| value_picked_from  |  
| storage_backend  | [FlagStorageBackend](https://perfetto.dev/docs/reference/trace-packet-proto#AndroidAflags.FlagStorageBackend)  |  
| type  |  
###  AndroidAflags.FlagPermission
Whether a flag can be modified at runtime.
Defined in [android_aflags.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/android/android_aflags.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| FLAG_PERMISSION_UNSPECIFIED  | 0  |  
| FLAG_PERMISSION_READ_ONLY  | 1  |  
| FLAG_PERMISSION_READ_WRITE  | 2  |  
###  AndroidAflags.ValuePickedFrom
The source of the current flag value.
Defined in [android_aflags.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/android/android_aflags.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| VALUE_PICKED_FROM_UNSPECIFIED  | 0  |  
| VALUE_PICKED_FROM_DEFAULT  | 1  | The value is the build-time default.  |  
| VALUE_PICKED_FROM_SERVER  | 2  | The value comes from a server-side override.  |  
| VALUE_PICKED_FROM_LOCAL  | 3  | The value comes from a local override on the device.  |  
###  AndroidAflags.FlagStorageBackend
The underlying storage mechanism for the flag.
Defined in [android_aflags.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/android/android_aflags.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| FLAG_STORAGE_BACKEND_UNSPECIFIED  | 0  |  
| FLAG_STORAGE_BACKEND_NONE  | 1  |  
| FLAG_STORAGE_BACKEND_ACONFIGD  | 2  |  
| FLAG_STORAGE_BACKEND_DEVICE_CONFIG  | 3  |  
###  AndroidAflags.FlagType
The value type of the flag.
Defined in [android_aflags.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/android/android_aflags.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| FLAG_TYPE_UNSPECIFIED  | 0  | Flag type unspecified. This flag type means the flag is an old version boolean flag or unknown newer type.  |  
| FLAG_TYPE_BOOLEAN  | 1  |  
| FLAG_TYPE_INTEGER  | 2  |  
##  GpuInfo
Information about GPUs on the device.
Defined in [gpu_info.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/system_info/gpu_info.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| gpus  | Describes available GPUs, one entry per GPU. The index in the list corresponds to the gpu_id used elsewhere in the trace.  |  
###  GpuInfo.Gpu
Information about a single GPU.
Defined in [gpu_info.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/system_info/gpu_info.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  | GPU name (e.g., "NVIDIA A100", "Adreno 740").Used by the Perfetto UI as the display label for GPU tracks (e.g., "NVIDIA A100 Frequency" instead of "GPU 0 Frequency"). If multiple GPUs share the same name, consider appending an index to distinguish them (e.g., "NVIDIA A100 #0", "NVIDIA A100 #1").  |  
| vendor  | string  | GPU vendor string (e.g., "NVIDIA", "AMD", "Qualcomm").  |  
| model  | string  | GPU model/product identifier.  |  
| architecture  | string  | GPU architecture (e.g., "Ampere", "RDNA 3", "Adreno").  |  
| uuid  | bytes  | 16-byte device UUID when available.  |  
| pci_bdf  | string  | PCI bus location (domain:bus:device.function, e.g., "0000:01:00.0").  |  
| extra_info  |  
###  GpuInfo.Gpu.KeyValue
Arbitrary key-value pairs for vendor-specific info (driver version, memory size, compute capability, clock speeds, etc.).
Defined in [gpu_info.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/system_info/gpu_info.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| key  | string  |  
| value  | string  |  
##  InterruptInfo
Hardware interrupt (IRQ) ID-to-name mappings collected from /proc/interrupts at the start of a trace. Emitted by the linux.system_info data source when irq_names: true is set in SystemInfoConfig.
Defined in [interrupt_info.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/system_info/interrupt_info.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| irq_mapping  | [InterruptMapping[]](https://perfetto.dev/docs/reference/trace-packet-proto#InterruptInfo.InterruptMapping)  | One entry per hardware IRQ found in /proc/interrupts.  |  
###  InterruptInfo.InterruptMapping
Defined in [interrupt_info.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/system_info/interrupt_info.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| irq_id  | uint32  | Numeric IRQ identifier.  |  
| name  | string  | Human-readable name for the IRQ (e.g. "arch_timer", "arm-pmu").  |  
##  ModuleSymbols
Symbols for addresses seen in a module. Used in re-symbolisation of complete traces.
Defined in [profile_common.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/profiling/profile_common.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| path  | string  | Fully qualified path to the mapping.E.g. /system/lib64/libc.so.  |  
| build_id  | string  | .note.gnu.build-id on Linux (not hex encoded).uuid on MacOS.Module GUID on Windows.  |  
| address_symbols  | [AddressSymbols[]](https://perfetto.dev/docs/reference/trace-packet-proto#AddressSymbols)  |  
###  AddressSymbols
Symbols for a given address in a module.
Defined in [profile_common.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/profiling/profile_common.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| address  | uint64  |  
| lines  | Source lines that correspond to this address. These are repeated because when inlining happens, multiple functions' frames can be at a single address. Imagine function Foo calling the std::vector constructor, which gets inlined at 0xf00. We then get both Foo and the std::vector constructor when we symbolize the address.  |  
###  Line
Source line info.
Defined in [profile_common.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/profiling/profile_common.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| function_name  | string  |  
| source_file_name  | string  |  
| line_number  | uint32  |  
##  DeobfuscationMapping
Defined in [deobfuscation.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/profiling/deobfuscation.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| package_name  | string  |  
| version_code  | int64  |  
| obfuscated_classes  | [ObfuscatedClass[]](https://perfetto.dev/docs/reference/trace-packet-proto#ObfuscatedClass)  |  
###  ObfuscatedClass
Defined in [deobfuscation.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/profiling/deobfuscation.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| obfuscated_name  | string  |  
| deobfuscated_name  | string  |  
| obfuscated_members  | [ObfuscatedMember[]](https://perfetto.dev/docs/reference/trace-packet-proto#ObfuscatedMember)  | fields.  |  
| obfuscated_methods  | [ObfuscatedMember[]](https://perfetto.dev/docs/reference/trace-packet-proto#ObfuscatedMember)  |  
| merged_classes  |  
###  ObfuscatedMember
Defined in [deobfuscation.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/profiling/deobfuscation.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| obfuscated_name  | string  | This is the obfuscated field name relative to the class containing the ObfuscatedMember.  |  
| deobfuscated_name  | string  | If this is fully qualified (i.e. contains a '.') this is the deobfuscated field name including its class. Otherwise, this is this the unqualified deobfuscated field name relative to the class containing this ObfuscatedMember.  |  
| obfuscated_line_start  | uint32  | R8 inline method support: line number ranges for disambiguation.When multiple methods map to the same obfuscated name, the line number from the stack frame is used to select the correct mapping. Format in R8 mapping: "1:3:void foo():10:12 -> a" - obfuscated_line_start/end = 1:3 (line range in obfuscated code) - source_line_start/end = 10:12 (line range in original source) Methods with the same obfuscated_name and overlapping obfuscated line ranges form an inline chain, ordered innermost (inlined) first.  |  
| obfuscated_line_end  | uint32  |  
| source_line_start  | uint32  |  
| source_line_end  | uint32  |  
###  ObfuscatedClass.MergedClasses
Set of classes merged into this obfuscated class by optimization.
Defined in [deobfuscation.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/profiling/deobfuscation.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| class_id_field_name  | string  |  
| merged_classes  |  
| unknown_merged_classes  | bool  | Set to true if other unknown classes may have been merged into this class by optimization (e.g. when using older R8 mapping versions that do not emit mergedClasses metadata).  |  
###  ObfuscatedClass.MergedClass
Information about a single class merged by optimization into this obfuscated class.
Defined in [deobfuscation.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/profiling/deobfuscation.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
| class_id  | int32  |  
| merged_classes  |  
##  FtraceEventBundle
The result of tracing one or more ftrace data pages from a single per-cpu kernel ring buffer. If collating multiple pages' worth of events, all of them come from contiguous pages, with no kernel data loss in between.
Defined in [ftrace_event_bundle.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ftrace_event_bundle.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| cpu  | uint32  |  
| event  | [FtraceEvent[]](https://perfetto.dev/docs/reference/trace-packet-proto#FtraceEvent)  |  
| lost_events  | bool  | Set to true if there was data loss between the last time we've read from the corresponding per-cpu kernel buffer, and the earliest event recorded in this bundle.  |  
| compact_sched  |  
| ftrace_clock  | Perfetto will by default try to use the boottime ("boot") clock for ftrace timestamps as that counts during suspend, is available to userspace, and is coherent across cpus. If this field is set, it means that a different clock was used during recording. Either because the boot clock is unavailable (e.g. old kernels before 3.x), or the trace config has set an incompatible option (use_monotonic_raw_clock / preserve_ftrace_buffer). In that case, trace_processor will do best-effort clock alignment using timestamp pairs from `ftrace_timestamp` and `boot_timestamp` fields. This field is omitted when the ftrace clock is "boot", as that is the default assumption. Some clocks (local/global) are technically per-cpu, but we make a simplifying assumption that they are global, as their inter-cpu skew should be reasonably bounded on modern systems. Added in: perfetto v19. Android T (13).  |  
| ftrace_timestamp  | int64  | The timestamp according to the ftrace clock, taken at the same instant as `boot_timestamp`. Note: timestamping is done at buffer read time, so it will be in the future relative to the data covered by this bundle.Implementation note: Populated by reading the 'now ts:' field in tracefs/per_cpu/cpu0/stat. Set only if `ftrace_clock` != FTRACE_CLOCK_UNSPECIFIED.  |  
| boot_timestamp  | int64  | The timestamp according to CLOCK_BOOTTIME, taken at the same instant as `ftrace_timestamp`. Set only if `ftrace_clock` != FTRACE_CLOCK_UNSPECIFIED.  |  
| error  |  
| last_read_event_timestamp  | uint64  | Superseded by `previous_bundle_end_timestamp` in perfetto v47+. The primary difference is that this field tracked the last timestamp read from the per-cpu buffer, while the newer field tracks events that get serialised into the trace.Added in: perfetto v44.  |  
| previous_bundle_end_timestamp  | uint64  | The timestamp (using ftrace clock) of the last event written into this data source on this cpu. In other words: the last event in the previous bundle.Lets the trace processing find an initial timestamp after which ftrace data is known to be valid across all cpus. Of particular importance when the perfetto trace buffer is a ring buffer as well, as the overwriting of oldest bundles can skew the first valid timestamp per cpu significantly.Added in: perfetto v47.  |  
| generic_event_descriptors  | [GenericEventDescriptor[]](https://perfetto.dev/docs/reference/trace-packet-proto#FtraceEventBundle.GenericEventDescriptor)  |  
| broken_abi_trace_page  | bytes  | Written only on android builds if the config sets `debug_ftrace_abi`.Contains the raw ring buffer tracing page that the implementation could not parse.Addded in: perfetto v50.  |  
###  FtraceEvent
Defined in [ftrace_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ftrace_event.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| timestamp  | uint64  | Timestamp in nanoseconds using .../tracing/trace_clock.  |  
| pid  | uint32  | Kernel pid (do not confuse with userspace pid aka tgid).  |  
| common_flags  | uint32  | Not populated in actual traces. Wire format might change.Placeholder declaration so that the ftrace parsing code accepts the existence of this common field. If this becomes needed for all events:consider merging with common_preempt_count to avoid extra proto tags.  |  
| print  | [PrintFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#PrintFtraceEvent)  |  
| sched_switch  | [SchedSwitchFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SchedSwitchFtraceEvent)  |  
| cpu_frequency  | [CpuFrequencyFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#CpuFrequencyFtraceEvent)  | removed field with id 5; removed field with id 6; removed field with id 7; removed field with id 8; removed field with id 9; removed field with id 10;  |  
| cpu_frequency_limits  | [CpuFrequencyLimitsFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#CpuFrequencyLimitsFtraceEvent)  |  
| cpu_idle  | [CpuIdleFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#CpuIdleFtraceEvent)  |  
| clock_enable  | [ClockEnableFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#ClockEnableFtraceEvent)  |  
| clock_disable  | [ClockDisableFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#ClockDisableFtraceEvent)  |  
| clock_set_rate  | [ClockSetRateFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#ClockSetRateFtraceEvent)  |  
| sched_wakeup  | [SchedWakeupFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SchedWakeupFtraceEvent)  |  
| sched_blocked_reason  | [SchedBlockedReasonFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SchedBlockedReasonFtraceEvent)  |  
| sched_cpu_hotplug  | [SchedCpuHotplugFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SchedCpuHotplugFtraceEvent)  |  
| sched_waking  | [SchedWakingFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SchedWakingFtraceEvent)  |  
| ipi_entry  | [IpiEntryFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#IpiEntryFtraceEvent)  |  
| ipi_exit  | [IpiExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#IpiExitFtraceEvent)  |  
| ipi_raise  | [IpiRaiseFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#IpiRaiseFtraceEvent)  |  
| softirq_entry  | [SoftirqEntryFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SoftirqEntryFtraceEvent)  |  
| softirq_exit  | [SoftirqExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SoftirqExitFtraceEvent)  |  
| softirq_raise  | [SoftirqRaiseFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SoftirqRaiseFtraceEvent)  |  
| i2c_read  | [I2cReadFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#I2cReadFtraceEvent)  |  
| i2c_write  | [I2cWriteFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#I2cWriteFtraceEvent)  |  
| i2c_result  | [I2cResultFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#I2cResultFtraceEvent)  |  
| i2c_reply  | [I2cReplyFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#I2cReplyFtraceEvent)  |  
| smbus_read  | [SmbusReadFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SmbusReadFtraceEvent)  |  
| smbus_write  | [SmbusWriteFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SmbusWriteFtraceEvent)  |  
| smbus_result  | [SmbusResultFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SmbusResultFtraceEvent)  |  
| smbus_reply  | [SmbusReplyFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SmbusReplyFtraceEvent)  |  
| lowmemory_kill  | [LowmemoryKillFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#LowmemoryKillFtraceEvent)  |  
| irq_handler_entry  | [IrqHandlerEntryFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#IrqHandlerEntryFtraceEvent)  |  
| irq_handler_exit  | [IrqHandlerExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#IrqHandlerExitFtraceEvent)  |  
| sync_pt  | [SyncPtFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SyncPtFtraceEvent)  |  
| sync_timeline  | [SyncTimelineFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SyncTimelineFtraceEvent)  |  
| sync_wait  | [SyncWaitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SyncWaitFtraceEvent)  |  
| ext4_da_write_begin  | [Ext4DaWriteBeginFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4DaWriteBeginFtraceEvent)  |  
| ext4_da_write_end  | [Ext4DaWriteEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4DaWriteEndFtraceEvent)  |  
| ext4_sync_file_enter  | [Ext4SyncFileEnterFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4SyncFileEnterFtraceEvent)  |  
| ext4_sync_file_exit  | [Ext4SyncFileExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4SyncFileExitFtraceEvent)  |  
| block_rq_issue  | [BlockRqIssueFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BlockRqIssueFtraceEvent)  |  
| mm_vmscan_direct_reclaim_begin  | [MmVmscanDirectReclaimBeginFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmVmscanDirectReclaimBeginFtraceEvent)  |  
| mm_vmscan_direct_reclaim_end  | [MmVmscanDirectReclaimEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmVmscanDirectReclaimEndFtraceEvent)  |  
| mm_vmscan_kswapd_wake  | [MmVmscanKswapdWakeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmVmscanKswapdWakeFtraceEvent)  |  
| mm_vmscan_kswapd_sleep  | [MmVmscanKswapdSleepFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmVmscanKswapdSleepFtraceEvent)  |  
| binder_transaction  | [BinderTransactionFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BinderTransactionFtraceEvent)  |  
| binder_transaction_received  | [BinderTransactionReceivedFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BinderTransactionReceivedFtraceEvent)  |  
| binder_set_priority  | [BinderSetPriorityFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BinderSetPriorityFtraceEvent)  |  
| binder_lock  | [BinderLockFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BinderLockFtraceEvent)  |  
| binder_locked  | [BinderLockedFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BinderLockedFtraceEvent)  |  
| binder_unlock  | [BinderUnlockFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BinderUnlockFtraceEvent)  |  
| workqueue_activate_work  | [WorkqueueActivateWorkFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#WorkqueueActivateWorkFtraceEvent)  |  
| workqueue_execute_end  | [WorkqueueExecuteEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#WorkqueueExecuteEndFtraceEvent)  |  
| workqueue_execute_start  | [WorkqueueExecuteStartFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#WorkqueueExecuteStartFtraceEvent)  |  
| workqueue_queue_work  | [WorkqueueQueueWorkFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#WorkqueueQueueWorkFtraceEvent)  |  
| regulator_disable  | [RegulatorDisableFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#RegulatorDisableFtraceEvent)  |  
| regulator_disable_complete  | [RegulatorDisableCompleteFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#RegulatorDisableCompleteFtraceEvent)  |  
| regulator_enable  | [RegulatorEnableFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#RegulatorEnableFtraceEvent)  |  
| regulator_enable_complete  | [RegulatorEnableCompleteFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#RegulatorEnableCompleteFtraceEvent)  |  
| regulator_enable_delay  | [RegulatorEnableDelayFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#RegulatorEnableDelayFtraceEvent)  |  
| regulator_set_voltage  | [RegulatorSetVoltageFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#RegulatorSetVoltageFtraceEvent)  |  
| regulator_set_voltage_complete  | [RegulatorSetVoltageCompleteFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#RegulatorSetVoltageCompleteFtraceEvent)  |  
| cgroup_attach_task  | [CgroupAttachTaskFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#CgroupAttachTaskFtraceEvent)  |  
| cgroup_mkdir  | [CgroupMkdirFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#CgroupMkdirFtraceEvent)  |  
| cgroup_remount  | [CgroupRemountFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#CgroupRemountFtraceEvent)  |  
| cgroup_rmdir  | [CgroupRmdirFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#CgroupRmdirFtraceEvent)  |  
| cgroup_transfer_tasks  | [CgroupTransferTasksFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#CgroupTransferTasksFtraceEvent)  |  
| cgroup_destroy_root  | [CgroupDestroyRootFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#CgroupDestroyRootFtraceEvent)  |  
| cgroup_release  | [CgroupReleaseFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#CgroupReleaseFtraceEvent)  |  
| cgroup_rename  | [CgroupRenameFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#CgroupRenameFtraceEvent)  |  
| cgroup_setup_root  | [CgroupSetupRootFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#CgroupSetupRootFtraceEvent)  |  
| mdp_cmd_kickoff  | [MdpCmdKickoffFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MdpCmdKickoffFtraceEvent)  |  
| mdp_commit  | [MdpCommitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MdpCommitFtraceEvent)  |  
| mdp_perf_set_ot  | [MdpPerfSetOtFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MdpPerfSetOtFtraceEvent)  |  
| mdp_sspp_change  | [MdpSsppChangeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MdpSsppChangeFtraceEvent)  |  
| tracing_mark_write  | [TracingMarkWriteFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TracingMarkWriteFtraceEvent)  |  
| mdp_cmd_pingpong_done  | [MdpCmdPingpongDoneFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MdpCmdPingpongDoneFtraceEvent)  |  
| mdp_compare_bw  | [MdpCompareBwFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MdpCompareBwFtraceEvent)  |  
| mdp_perf_set_panic_luts  | [MdpPerfSetPanicLutsFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MdpPerfSetPanicLutsFtraceEvent)  |  
| mdp_sspp_set  | [MdpSsppSetFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MdpSsppSetFtraceEvent)  |  
| mdp_cmd_readptr_done  | [MdpCmdReadptrDoneFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MdpCmdReadptrDoneFtraceEvent)  |  
| mdp_misr_crc  | [MdpMisrCrcFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MdpMisrCrcFtraceEvent)  |  
| mdp_perf_set_qos_luts  | [MdpPerfSetQosLutsFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MdpPerfSetQosLutsFtraceEvent)  |  
| mdp_trace_counter  | [MdpTraceCounterFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MdpTraceCounterFtraceEvent)  |  
| mdp_cmd_release_bw  | [MdpCmdReleaseBwFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MdpCmdReleaseBwFtraceEvent)  |  
| mdp_mixer_update  | [MdpMixerUpdateFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MdpMixerUpdateFtraceEvent)  |  
| mdp_perf_set_wm_levels  | [MdpPerfSetWmLevelsFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MdpPerfSetWmLevelsFtraceEvent)  |  
| mdp_video_underrun_done  | [MdpVideoUnderrunDoneFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MdpVideoUnderrunDoneFtraceEvent)  |  
| mdp_cmd_wait_pingpong  | [MdpCmdWaitPingpongFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MdpCmdWaitPingpongFtraceEvent)  |  
| mdp_perf_prefill_calc  | [MdpPerfPrefillCalcFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MdpPerfPrefillCalcFtraceEvent)  |  
| mdp_perf_update_bus  | [MdpPerfUpdateBusFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MdpPerfUpdateBusFtraceEvent)  |  
| rotator_bw_ao_as_context  | [RotatorBwAoAsContextFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#RotatorBwAoAsContextFtraceEvent)  |  
| mm_filemap_add_to_page_cache  | [MmFilemapAddToPageCacheFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmFilemapAddToPageCacheFtraceEvent)  |  
| mm_filemap_delete_from_page_cache  | [MmFilemapDeleteFromPageCacheFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmFilemapDeleteFromPageCacheFtraceEvent)  |  
| mm_compaction_begin  | [MmCompactionBeginFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmCompactionBeginFtraceEvent)  |  
| mm_compaction_defer_compaction  | [MmCompactionDeferCompactionFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmCompactionDeferCompactionFtraceEvent)  |  
| mm_compaction_deferred  | [MmCompactionDeferredFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmCompactionDeferredFtraceEvent)  |  
| mm_compaction_defer_reset  | [MmCompactionDeferResetFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmCompactionDeferResetFtraceEvent)  |  
| mm_compaction_end  | [MmCompactionEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmCompactionEndFtraceEvent)  |  
| mm_compaction_finished  | [MmCompactionFinishedFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmCompactionFinishedFtraceEvent)  |  
| mm_compaction_isolate_freepages  | [MmCompactionIsolateFreepagesFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmCompactionIsolateFreepagesFtraceEvent)  |  
| mm_compaction_isolate_migratepages  | [MmCompactionIsolateMigratepagesFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmCompactionIsolateMigratepagesFtraceEvent)  |  
| mm_compaction_kcompactd_sleep  | [MmCompactionKcompactdSleepFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmCompactionKcompactdSleepFtraceEvent)  |  
| mm_compaction_kcompactd_wake  | [MmCompactionKcompactdWakeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmCompactionKcompactdWakeFtraceEvent)  |  
| mm_compaction_migratepages  | [MmCompactionMigratepagesFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmCompactionMigratepagesFtraceEvent)  |  
| mm_compaction_suitable  | [MmCompactionSuitableFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmCompactionSuitableFtraceEvent)  |  
| mm_compaction_try_to_compact_pages  | [MmCompactionTryToCompactPagesFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmCompactionTryToCompactPagesFtraceEvent)  |  
| mm_compaction_wakeup_kcompactd  | [MmCompactionWakeupKcompactdFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmCompactionWakeupKcompactdFtraceEvent)  |  
| suspend_resume  | [SuspendResumeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SuspendResumeFtraceEvent)  |  
| sched_wakeup_new  | [SchedWakeupNewFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SchedWakeupNewFtraceEvent)  |  
| block_bio_backmerge  | [BlockBioBackmergeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BlockBioBackmergeFtraceEvent)  |  
| block_bio_bounce  | [BlockBioBounceFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BlockBioBounceFtraceEvent)  |  
| block_bio_complete  | [BlockBioCompleteFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BlockBioCompleteFtraceEvent)  |  
| block_bio_frontmerge  | [BlockBioFrontmergeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BlockBioFrontmergeFtraceEvent)  |  
| block_bio_queue  | [BlockBioQueueFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BlockBioQueueFtraceEvent)  |  
| block_bio_remap  | [BlockBioRemapFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BlockBioRemapFtraceEvent)  |  
| block_dirty_buffer  | [BlockDirtyBufferFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BlockDirtyBufferFtraceEvent)  |  
| block_getrq  | [BlockGetrqFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BlockGetrqFtraceEvent)  |  
| block_plug  | [BlockPlugFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BlockPlugFtraceEvent)  |  
| block_rq_abort  | [BlockRqAbortFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BlockRqAbortFtraceEvent)  |  
| block_rq_complete  | [BlockRqCompleteFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BlockRqCompleteFtraceEvent)  |  
| block_rq_insert  | [BlockRqInsertFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BlockRqInsertFtraceEvent)  |  
| block_rq_remap  | [BlockRqRemapFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BlockRqRemapFtraceEvent)  | removed field with id 127;  |  
| block_rq_requeue  | [BlockRqRequeueFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BlockRqRequeueFtraceEvent)  |  
| block_sleeprq  | [BlockSleeprqFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BlockSleeprqFtraceEvent)  |  
| block_split  | [BlockSplitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BlockSplitFtraceEvent)  |  
| block_touch_buffer  | [BlockTouchBufferFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BlockTouchBufferFtraceEvent)  |  
| block_unplug  | [BlockUnplugFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BlockUnplugFtraceEvent)  |  
| ext4_alloc_da_blocks  | [Ext4AllocDaBlocksFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4AllocDaBlocksFtraceEvent)  |  
| ext4_allocate_blocks  | [Ext4AllocateBlocksFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4AllocateBlocksFtraceEvent)  |  
| ext4_allocate_inode  | [Ext4AllocateInodeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4AllocateInodeFtraceEvent)  |  
| ext4_begin_ordered_truncate  | [Ext4BeginOrderedTruncateFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4BeginOrderedTruncateFtraceEvent)  |  
| ext4_collapse_range  | [Ext4CollapseRangeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4CollapseRangeFtraceEvent)  |  
| ext4_da_release_space  | [Ext4DaReleaseSpaceFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4DaReleaseSpaceFtraceEvent)  |  
| ext4_da_reserve_space  | [Ext4DaReserveSpaceFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4DaReserveSpaceFtraceEvent)  |  
| ext4_da_update_reserve_space  | [Ext4DaUpdateReserveSpaceFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4DaUpdateReserveSpaceFtraceEvent)  |  
| ext4_da_write_pages  | [Ext4DaWritePagesFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4DaWritePagesFtraceEvent)  |  
| ext4_da_write_pages_extent  | [Ext4DaWritePagesExtentFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4DaWritePagesExtentFtraceEvent)  |  
| ext4_direct_IO_enter  | [Ext4DirectIOEnterFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4DirectIOEnterFtraceEvent)  |  
| ext4_direct_IO_exit  | [Ext4DirectIOExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4DirectIOExitFtraceEvent)  |  
| ext4_discard_blocks  | [Ext4DiscardBlocksFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4DiscardBlocksFtraceEvent)  |  
| ext4_discard_preallocations  | [Ext4DiscardPreallocationsFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4DiscardPreallocationsFtraceEvent)  |  
| ext4_drop_inode  | [Ext4DropInodeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4DropInodeFtraceEvent)  |  
| ext4_es_cache_extent  | [Ext4EsCacheExtentFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4EsCacheExtentFtraceEvent)  |  
| ext4_es_find_delayed_extent_range_enter  | [Ext4EsFindDelayedExtentRangeEnterFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4EsFindDelayedExtentRangeEnterFtraceEvent)  |  
| ext4_es_find_delayed_extent_range_exit  | [Ext4EsFindDelayedExtentRangeExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4EsFindDelayedExtentRangeExitFtraceEvent)  |  
| ext4_es_insert_extent  | [Ext4EsInsertExtentFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4EsInsertExtentFtraceEvent)  |  
| ext4_es_lookup_extent_enter  | [Ext4EsLookupExtentEnterFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4EsLookupExtentEnterFtraceEvent)  |  
| ext4_es_lookup_extent_exit  | [Ext4EsLookupExtentExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4EsLookupExtentExitFtraceEvent)  |  
| ext4_es_remove_extent  | [Ext4EsRemoveExtentFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4EsRemoveExtentFtraceEvent)  |  
| ext4_es_shrink  | [Ext4EsShrinkFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4EsShrinkFtraceEvent)  |  
| ext4_es_shrink_count  | [Ext4EsShrinkCountFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4EsShrinkCountFtraceEvent)  |  
| ext4_es_shrink_scan_enter  | [Ext4EsShrinkScanEnterFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4EsShrinkScanEnterFtraceEvent)  |  
| ext4_es_shrink_scan_exit  | [Ext4EsShrinkScanExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4EsShrinkScanExitFtraceEvent)  |  
| ext4_evict_inode  | [Ext4EvictInodeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4EvictInodeFtraceEvent)  |  
| ext4_ext_convert_to_initialized_enter  | [Ext4ExtConvertToInitializedEnterFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4ExtConvertToInitializedEnterFtraceEvent)  |  
| ext4_ext_convert_to_initialized_fastpath  | [Ext4ExtConvertToInitializedFastpathFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4ExtConvertToInitializedFastpathFtraceEvent)  |  
| ext4_ext_handle_unwritten_extents  | [Ext4ExtHandleUnwrittenExtentsFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4ExtHandleUnwrittenExtentsFtraceEvent)  |  
| ext4_ext_in_cache  | [Ext4ExtInCacheFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4ExtInCacheFtraceEvent)  |  
| ext4_ext_load_extent  | [Ext4ExtLoadExtentFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4ExtLoadExtentFtraceEvent)  |  
| ext4_ext_map_blocks_enter  | [Ext4ExtMapBlocksEnterFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4ExtMapBlocksEnterFtraceEvent)  |  
| ext4_ext_map_blocks_exit  | [Ext4ExtMapBlocksExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4ExtMapBlocksExitFtraceEvent)  |  
| ext4_ext_put_in_cache  | [Ext4ExtPutInCacheFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4ExtPutInCacheFtraceEvent)  |  
| ext4_ext_remove_space  | [Ext4ExtRemoveSpaceFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4ExtRemoveSpaceFtraceEvent)  |  
| ext4_ext_remove_space_done  | [Ext4ExtRemoveSpaceDoneFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4ExtRemoveSpaceDoneFtraceEvent)  |  
| ext4_ext_rm_idx  | [Ext4ExtRmIdxFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4ExtRmIdxFtraceEvent)  |  
| ext4_ext_rm_leaf  | [Ext4ExtRmLeafFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4ExtRmLeafFtraceEvent)  |  
| ext4_ext_show_extent  | [Ext4ExtShowExtentFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4ExtShowExtentFtraceEvent)  |  
| ext4_fallocate_enter  | [Ext4FallocateEnterFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4FallocateEnterFtraceEvent)  |  
| ext4_fallocate_exit  | [Ext4FallocateExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4FallocateExitFtraceEvent)  |  
| ext4_find_delalloc_range  | [Ext4FindDelallocRangeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4FindDelallocRangeFtraceEvent)  |  
| ext4_forget  | [Ext4ForgetFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4ForgetFtraceEvent)  |  
| ext4_free_blocks  | [Ext4FreeBlocksFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4FreeBlocksFtraceEvent)  |  
| ext4_free_inode  | [Ext4FreeInodeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4FreeInodeFtraceEvent)  |  
| ext4_get_implied_cluster_alloc_exit  | [Ext4GetImpliedClusterAllocExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4GetImpliedClusterAllocExitFtraceEvent)  |  
| ext4_get_reserved_cluster_alloc  | [Ext4GetReservedClusterAllocFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4GetReservedClusterAllocFtraceEvent)  |  
| ext4_ind_map_blocks_enter  | [Ext4IndMapBlocksEnterFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4IndMapBlocksEnterFtraceEvent)  |  
| ext4_ind_map_blocks_exit  | [Ext4IndMapBlocksExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4IndMapBlocksExitFtraceEvent)  |  
| ext4_insert_range  | [Ext4InsertRangeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4InsertRangeFtraceEvent)  |  
| ext4_invalidatepage  | [Ext4InvalidatepageFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4InvalidatepageFtraceEvent)  |  
| ext4_journal_start  | [Ext4JournalStartFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4JournalStartFtraceEvent)  |  
| ext4_journal_start_reserved  | [Ext4JournalStartReservedFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4JournalStartReservedFtraceEvent)  |  
| ext4_journalled_invalidatepage  | [Ext4JournalledInvalidatepageFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4JournalledInvalidatepageFtraceEvent)  |  
| ext4_journalled_write_end  | [Ext4JournalledWriteEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4JournalledWriteEndFtraceEvent)  |  
| ext4_load_inode  | [Ext4LoadInodeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4LoadInodeFtraceEvent)  |  
| ext4_load_inode_bitmap  | [Ext4LoadInodeBitmapFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4LoadInodeBitmapFtraceEvent)  |  
| ext4_mark_inode_dirty  | [Ext4MarkInodeDirtyFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4MarkInodeDirtyFtraceEvent)  |  
| ext4_mb_bitmap_load  | [Ext4MbBitmapLoadFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4MbBitmapLoadFtraceEvent)  |  
| ext4_mb_buddy_bitmap_load  | [Ext4MbBuddyBitmapLoadFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4MbBuddyBitmapLoadFtraceEvent)  |  
| ext4_mb_discard_preallocations  | [Ext4MbDiscardPreallocationsFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4MbDiscardPreallocationsFtraceEvent)  |  
| ext4_mb_new_group_pa  | [Ext4MbNewGroupPaFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4MbNewGroupPaFtraceEvent)  |  
| ext4_mb_new_inode_pa  | [Ext4MbNewInodePaFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4MbNewInodePaFtraceEvent)  |  
| ext4_mb_release_group_pa  | [Ext4MbReleaseGroupPaFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4MbReleaseGroupPaFtraceEvent)  |  
| ext4_mb_release_inode_pa  | [Ext4MbReleaseInodePaFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4MbReleaseInodePaFtraceEvent)  |  
| ext4_mballoc_alloc  | [Ext4MballocAllocFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4MballocAllocFtraceEvent)  |  
| ext4_mballoc_discard  | [Ext4MballocDiscardFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4MballocDiscardFtraceEvent)  |  
| ext4_mballoc_free  | [Ext4MballocFreeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4MballocFreeFtraceEvent)  |  
| ext4_mballoc_prealloc  | [Ext4MballocPreallocFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4MballocPreallocFtraceEvent)  |  
| ext4_other_inode_update_time  | [Ext4OtherInodeUpdateTimeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4OtherInodeUpdateTimeFtraceEvent)  |  
| ext4_punch_hole  | [Ext4PunchHoleFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4PunchHoleFtraceEvent)  |  
| ext4_read_block_bitmap_load  | [Ext4ReadBlockBitmapLoadFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4ReadBlockBitmapLoadFtraceEvent)  |  
| ext4_readpage  | [Ext4ReadpageFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4ReadpageFtraceEvent)  |  
| ext4_releasepage  | [Ext4ReleasepageFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4ReleasepageFtraceEvent)  |  
| ext4_remove_blocks  | [Ext4RemoveBlocksFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4RemoveBlocksFtraceEvent)  |  
| ext4_request_blocks  | [Ext4RequestBlocksFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4RequestBlocksFtraceEvent)  |  
| ext4_request_inode  | [Ext4RequestInodeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4RequestInodeFtraceEvent)  |  
| ext4_sync_fs  | [Ext4SyncFsFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4SyncFsFtraceEvent)  |  
| ext4_trim_all_free  | [Ext4TrimAllFreeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4TrimAllFreeFtraceEvent)  |  
| ext4_trim_extent  | [Ext4TrimExtentFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4TrimExtentFtraceEvent)  |  
| ext4_truncate_enter  | [Ext4TruncateEnterFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4TruncateEnterFtraceEvent)  |  
| ext4_truncate_exit  | [Ext4TruncateExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4TruncateExitFtraceEvent)  |  
| ext4_unlink_enter  | [Ext4UnlinkEnterFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4UnlinkEnterFtraceEvent)  |  
| ext4_unlink_exit  | [Ext4UnlinkExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4UnlinkExitFtraceEvent)  |  
| ext4_write_begin  | [Ext4WriteBeginFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4WriteBeginFtraceEvent)  |  
| ext4_write_end  | [Ext4WriteEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4WriteEndFtraceEvent)  | removed field with id 220; removed field with id 221; removed field with id 222; removed field with id 223; removed field with id 224; removed field with id 225; removed field with id 226; removed field with id 227; removed field with id 228; removed field with id 229;  |  
| ext4_writepage  | [Ext4WritepageFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4WritepageFtraceEvent)  |  
| ext4_writepages  | [Ext4WritepagesFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4WritepagesFtraceEvent)  |  
| ext4_writepages_result  | [Ext4WritepagesResultFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4WritepagesResultFtraceEvent)  |  
| ext4_zero_range  | [Ext4ZeroRangeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4ZeroRangeFtraceEvent)  |  
| task_newtask  | [TaskNewtaskFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TaskNewtaskFtraceEvent)  |  
| task_rename  | [TaskRenameFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TaskRenameFtraceEvent)  |  
| sched_process_exec  | [SchedProcessExecFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SchedProcessExecFtraceEvent)  |  
| sched_process_exit  | [SchedProcessExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SchedProcessExitFtraceEvent)  |  
| sched_process_fork  | [SchedProcessForkFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SchedProcessForkFtraceEvent)  |  
| sched_process_free  | [SchedProcessFreeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SchedProcessFreeFtraceEvent)  |  
| sched_process_hang  | [SchedProcessHangFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SchedProcessHangFtraceEvent)  |  
| sched_process_wait  | [SchedProcessWaitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SchedProcessWaitFtraceEvent)  |  
| f2fs_do_submit_bio  | [F2fsDoSubmitBioFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsDoSubmitBioFtraceEvent)  |  
| f2fs_evict_inode  | [F2fsEvictInodeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsEvictInodeFtraceEvent)  |  
| f2fs_fallocate  | [F2fsFallocateFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsFallocateFtraceEvent)  |  
| f2fs_get_data_block  | [F2fsGetDataBlockFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsGetDataBlockFtraceEvent)  |  
| f2fs_get_victim  | [F2fsGetVictimFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsGetVictimFtraceEvent)  |  
| f2fs_iget  | [F2fsIgetFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsIgetFtraceEvent)  |  
| f2fs_iget_exit  | [F2fsIgetExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsIgetExitFtraceEvent)  |  
| f2fs_new_inode  | [F2fsNewInodeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsNewInodeFtraceEvent)  |  
| f2fs_readpage  | [F2fsReadpageFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsReadpageFtraceEvent)  |  
| f2fs_reserve_new_block  | [F2fsReserveNewBlockFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsReserveNewBlockFtraceEvent)  |  
| f2fs_set_page_dirty  | [F2fsSetPageDirtyFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsSetPageDirtyFtraceEvent)  |  
| f2fs_submit_write_page  | [F2fsSubmitWritePageFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsSubmitWritePageFtraceEvent)  |  
| f2fs_sync_file_enter  | [F2fsSyncFileEnterFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsSyncFileEnterFtraceEvent)  |  
| f2fs_sync_file_exit  | [F2fsSyncFileExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsSyncFileExitFtraceEvent)  |  
| f2fs_sync_fs  | [F2fsSyncFsFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsSyncFsFtraceEvent)  |  
| f2fs_truncate  | [F2fsTruncateFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsTruncateFtraceEvent)  |  
| f2fs_truncate_blocks_enter  | [F2fsTruncateBlocksEnterFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsTruncateBlocksEnterFtraceEvent)  |  
| f2fs_truncate_blocks_exit  | [F2fsTruncateBlocksExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsTruncateBlocksExitFtraceEvent)  |  
| f2fs_truncate_data_blocks_range  | [F2fsTruncateDataBlocksRangeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsTruncateDataBlocksRangeFtraceEvent)  |  
| f2fs_truncate_inode_blocks_enter  | [F2fsTruncateInodeBlocksEnterFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsTruncateInodeBlocksEnterFtraceEvent)  |  
| f2fs_truncate_inode_blocks_exit  | [F2fsTruncateInodeBlocksExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsTruncateInodeBlocksExitFtraceEvent)  |  
| f2fs_truncate_node  | [F2fsTruncateNodeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsTruncateNodeFtraceEvent)  |  
| f2fs_truncate_nodes_enter  | [F2fsTruncateNodesEnterFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsTruncateNodesEnterFtraceEvent)  |  
| f2fs_truncate_nodes_exit  | [F2fsTruncateNodesExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsTruncateNodesExitFtraceEvent)  |  
| f2fs_truncate_partial_nodes  | [F2fsTruncatePartialNodesFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsTruncatePartialNodesFtraceEvent)  |  
| f2fs_unlink_enter  | [F2fsUnlinkEnterFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsUnlinkEnterFtraceEvent)  |  
| f2fs_unlink_exit  | [F2fsUnlinkExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsUnlinkExitFtraceEvent)  |  
| f2fs_vm_page_mkwrite  | [F2fsVmPageMkwriteFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsVmPageMkwriteFtraceEvent)  |  
| f2fs_write_begin  | [F2fsWriteBeginFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsWriteBeginFtraceEvent)  |  
| f2fs_write_checkpoint  | [F2fsWriteCheckpointFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsWriteCheckpointFtraceEvent)  |  
| f2fs_write_end  | [F2fsWriteEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsWriteEndFtraceEvent)  |  
| alloc_pages_iommu_end  | [AllocPagesIommuEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#AllocPagesIommuEndFtraceEvent)  |  
| alloc_pages_iommu_fail  | [AllocPagesIommuFailFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#AllocPagesIommuFailFtraceEvent)  |  
| alloc_pages_iommu_start  | [AllocPagesIommuStartFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#AllocPagesIommuStartFtraceEvent)  |  
| alloc_pages_sys_end  | [AllocPagesSysEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#AllocPagesSysEndFtraceEvent)  |  
| alloc_pages_sys_fail  | [AllocPagesSysFailFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#AllocPagesSysFailFtraceEvent)  |  
| alloc_pages_sys_start  | [AllocPagesSysStartFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#AllocPagesSysStartFtraceEvent)  |  
| dma_alloc_contiguous_retry  | [DmaAllocContiguousRetryFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DmaAllocContiguousRetryFtraceEvent)  |  
| iommu_map_range  | [IommuMapRangeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#IommuMapRangeFtraceEvent)  |  
| iommu_sec_ptbl_map_range_end  | [IommuSecPtblMapRangeEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#IommuSecPtblMapRangeEndFtraceEvent)  |  
| iommu_sec_ptbl_map_range_start  | [IommuSecPtblMapRangeStartFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#IommuSecPtblMapRangeStartFtraceEvent)  |  
| ion_alloc_buffer_end  | [IonAllocBufferEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#IonAllocBufferEndFtraceEvent)  |  
| ion_alloc_buffer_fail  | [IonAllocBufferFailFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#IonAllocBufferFailFtraceEvent)  |  
| ion_alloc_buffer_fallback  | [IonAllocBufferFallbackFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#IonAllocBufferFallbackFtraceEvent)  |  
| ion_alloc_buffer_start  | [IonAllocBufferStartFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#IonAllocBufferStartFtraceEvent)  |  
| ion_cp_alloc_retry  | [IonCpAllocRetryFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#IonCpAllocRetryFtraceEvent)  |  
| ion_cp_secure_buffer_end  | [IonCpSecureBufferEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#IonCpSecureBufferEndFtraceEvent)  |  
| ion_cp_secure_buffer_start  | [IonCpSecureBufferStartFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#IonCpSecureBufferStartFtraceEvent)  |  
| ion_prefetching  | [IonPrefetchingFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#IonPrefetchingFtraceEvent)  |  
| ion_secure_cma_add_to_pool_end  | [IonSecureCmaAddToPoolEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#IonSecureCmaAddToPoolEndFtraceEvent)  |  
| ion_secure_cma_add_to_pool_start  | [IonSecureCmaAddToPoolStartFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#IonSecureCmaAddToPoolStartFtraceEvent)  |  
| ion_secure_cma_allocate_end  | [IonSecureCmaAllocateEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#IonSecureCmaAllocateEndFtraceEvent)  |  
| ion_secure_cma_allocate_start  | [IonSecureCmaAllocateStartFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#IonSecureCmaAllocateStartFtraceEvent)  |  
| ion_secure_cma_shrink_pool_end  | [IonSecureCmaShrinkPoolEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#IonSecureCmaShrinkPoolEndFtraceEvent)  |  
| ion_secure_cma_shrink_pool_start  | [IonSecureCmaShrinkPoolStartFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#IonSecureCmaShrinkPoolStartFtraceEvent)  |  
| kfree  | [KfreeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KfreeFtraceEvent)  |  
| kmalloc  | [KmallocFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KmallocFtraceEvent)  |  
| kmalloc_node  | [KmallocNodeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KmallocNodeFtraceEvent)  |  
| kmem_cache_alloc  | [KmemCacheAllocFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KmemCacheAllocFtraceEvent)  |  
| kmem_cache_alloc_node  | [KmemCacheAllocNodeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KmemCacheAllocNodeFtraceEvent)  |  
| kmem_cache_free  | [KmemCacheFreeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KmemCacheFreeFtraceEvent)  |  
| migrate_pages_end  | [MigratePagesEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MigratePagesEndFtraceEvent)  |  
| migrate_pages_start  | [MigratePagesStartFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MigratePagesStartFtraceEvent)  |  
| migrate_retry  | [MigrateRetryFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MigrateRetryFtraceEvent)  |  
| mm_page_alloc  | [MmPageAllocFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmPageAllocFtraceEvent)  |  
| mm_page_alloc_extfrag  | [MmPageAllocExtfragFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmPageAllocExtfragFtraceEvent)  |  
| mm_page_alloc_zone_locked  | [MmPageAllocZoneLockedFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmPageAllocZoneLockedFtraceEvent)  |  
| mm_page_free  | [MmPageFreeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmPageFreeFtraceEvent)  |  
| mm_page_free_batched  | [MmPageFreeBatchedFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmPageFreeBatchedFtraceEvent)  |  
| mm_page_pcpu_drain  | [MmPagePcpuDrainFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmPagePcpuDrainFtraceEvent)  |  
| rss_stat  | [RssStatFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#RssStatFtraceEvent)  |  
| ion_heap_shrink  | [IonHeapShrinkFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#IonHeapShrinkFtraceEvent)  |  
| ion_heap_grow  | [IonHeapGrowFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#IonHeapGrowFtraceEvent)  |  
| fence_init  | [FenceInitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#FenceInitFtraceEvent)  |  
| fence_destroy  | [FenceDestroyFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#FenceDestroyFtraceEvent)  |  
| fence_enable_signal  | [FenceEnableSignalFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#FenceEnableSignalFtraceEvent)  |  
| fence_signaled  | [FenceSignaledFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#FenceSignaledFtraceEvent)  |  
| clk_enable  | [ClkEnableFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#ClkEnableFtraceEvent)  |  
| clk_disable  | [ClkDisableFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#ClkDisableFtraceEvent)  |  
| clk_set_rate  | [ClkSetRateFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#ClkSetRateFtraceEvent)  |  
| binder_transaction_alloc_buf  | [BinderTransactionAllocBufFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BinderTransactionAllocBufFtraceEvent)  |  
| signal_deliver  | [SignalDeliverFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SignalDeliverFtraceEvent)  |  
| signal_generate  | [SignalGenerateFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SignalGenerateFtraceEvent)  |  
| oom_score_adj_update  | [OomScoreAdjUpdateFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#OomScoreAdjUpdateFtraceEvent)  |  
| generic  | [GenericFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#GenericFtraceEvent)  |  
| mm_event_record  | [MmEventRecordFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmEventRecordFtraceEvent)  |  
| sys_enter  | [SysEnterFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SysEnterFtraceEvent)  |  
| sys_exit  | [SysExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SysExitFtraceEvent)  |  
| zero  | [ZeroFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#ZeroFtraceEvent)  |  
| gpu_frequency  | [GpuFrequencyFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#GpuFrequencyFtraceEvent)  |  
| sde_tracing_mark_write  | [SdeTracingMarkWriteFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SdeTracingMarkWriteFtraceEvent)  |  
| mark_victim  | [MarkVictimFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MarkVictimFtraceEvent)  |  
| ion_stat  | [IonStatFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#IonStatFtraceEvent)  |  
| ion_buffer_create  | [IonBufferCreateFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#IonBufferCreateFtraceEvent)  |  
| ion_buffer_destroy  | [IonBufferDestroyFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#IonBufferDestroyFtraceEvent)  |  
| scm_call_start  | [ScmCallStartFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#ScmCallStartFtraceEvent)  |  
| scm_call_end  | [ScmCallEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#ScmCallEndFtraceEvent)  |  
| gpu_mem_total  | [GpuMemTotalFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#GpuMemTotalFtraceEvent)  |  
| thermal_temperature  | [ThermalTemperatureFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#ThermalTemperatureFtraceEvent)  |  
| cdev_update  | [CdevUpdateFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#CdevUpdateFtraceEvent)  |  
| cpuhp_exit  | [CpuhpExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#CpuhpExitFtraceEvent)  |  
| cpuhp_multi_enter  | [CpuhpMultiEnterFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#CpuhpMultiEnterFtraceEvent)  |  
| cpuhp_enter  | [CpuhpEnterFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#CpuhpEnterFtraceEvent)  |  
| cpuhp_latency  | [CpuhpLatencyFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#CpuhpLatencyFtraceEvent)  |  
| fastrpc_dma_stat  | [FastrpcDmaStatFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#FastrpcDmaStatFtraceEvent)  |  
| dpu_tracing_mark_write  | [DpuTracingMarkWriteFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DpuTracingMarkWriteFtraceEvent)  |  
| g2d_tracing_mark_write  | [G2dTracingMarkWriteFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#G2dTracingMarkWriteFtraceEvent)  |  
| mali_tracing_mark_write  | [MaliTracingMarkWriteFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliTracingMarkWriteFtraceEvent)  |  
| dma_heap_stat  | [DmaHeapStatFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DmaHeapStatFtraceEvent)  |  
| cpuhp_pause  | [CpuhpPauseFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#CpuhpPauseFtraceEvent)  |  
| sched_pi_setprio  | [SchedPiSetprioFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SchedPiSetprioFtraceEvent)  |  
| sde_sde_evtlog  | [SdeSdeEvtlogFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SdeSdeEvtlogFtraceEvent)  |  
| sde_sde_perf_calc_crtc  | [SdeSdePerfCalcCrtcFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SdeSdePerfCalcCrtcFtraceEvent)  |  
| sde_sde_perf_crtc_update  | [SdeSdePerfCrtcUpdateFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SdeSdePerfCrtcUpdateFtraceEvent)  |  
| sde_sde_perf_set_qos_luts  | [SdeSdePerfSetQosLutsFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SdeSdePerfSetQosLutsFtraceEvent)  |  
| sde_sde_perf_update_bus  | [SdeSdePerfUpdateBusFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SdeSdePerfUpdateBusFtraceEvent)  |  
| rss_stat_throttled  | [RssStatThrottledFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#RssStatThrottledFtraceEvent)  |  
| netif_receive_skb  | [NetifReceiveSkbFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#NetifReceiveSkbFtraceEvent)  |  
| net_dev_xmit  | [NetDevXmitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#NetDevXmitFtraceEvent)  |  
| inet_sock_set_state  | [InetSockSetStateFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#InetSockSetStateFtraceEvent)  |  
| tcp_retransmit_skb  | [TcpRetransmitSkbFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TcpRetransmitSkbFtraceEvent)  |  
| cros_ec_sensorhub_data  | [CrosEcSensorhubDataFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#CrosEcSensorhubDataFtraceEvent)  |  
| napi_gro_receive_entry  | [NapiGroReceiveEntryFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#NapiGroReceiveEntryFtraceEvent)  |  
| napi_gro_receive_exit  | [NapiGroReceiveExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#NapiGroReceiveExitFtraceEvent)  |  
| kfree_skb  | [KfreeSkbFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KfreeSkbFtraceEvent)  |  
| kvm_access_fault  | [KvmAccessFaultFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmAccessFaultFtraceEvent)  |  
| kvm_ack_irq  | [KvmAckIrqFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmAckIrqFtraceEvent)  |  
| kvm_age_hva  | [KvmAgeHvaFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmAgeHvaFtraceEvent)  |  
| kvm_age_page  | [KvmAgePageFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmAgePageFtraceEvent)  |  
| kvm_arm_clear_debug  | [KvmArmClearDebugFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmArmClearDebugFtraceEvent)  |  
| kvm_arm_set_dreg32  | [KvmArmSetDreg32FtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmArmSetDreg32FtraceEvent)  |  
| kvm_arm_set_regset  | [KvmArmSetRegsetFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmArmSetRegsetFtraceEvent)  |  
| kvm_arm_setup_debug  | [KvmArmSetupDebugFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmArmSetupDebugFtraceEvent)  |  
| kvm_entry  | [KvmEntryFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmEntryFtraceEvent)  |  
| kvm_exit  | [KvmExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmExitFtraceEvent)  |  
| kvm_fpu  | [KvmFpuFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmFpuFtraceEvent)  |  
| kvm_get_timer_map  | [KvmGetTimerMapFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmGetTimerMapFtraceEvent)  |  
| kvm_guest_fault  | [KvmGuestFaultFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmGuestFaultFtraceEvent)  |  
| kvm_handle_sys_reg  | [KvmHandleSysRegFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmHandleSysRegFtraceEvent)  |  
| kvm_hvc_arm64  | [KvmHvcArm64FtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmHvcArm64FtraceEvent)  |  
| kvm_irq_line  | [KvmIrqLineFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmIrqLineFtraceEvent)  |  
| kvm_mmio  | [KvmMmioFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmMmioFtraceEvent)  |  
| kvm_mmio_emulate  | [KvmMmioEmulateFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmMmioEmulateFtraceEvent)  |  
| kvm_set_guest_debug  | [KvmSetGuestDebugFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmSetGuestDebugFtraceEvent)  |  
| kvm_set_irq  | [KvmSetIrqFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmSetIrqFtraceEvent)  |  
| kvm_set_spte_hva  | [KvmSetSpteHvaFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmSetSpteHvaFtraceEvent)  |  
| kvm_set_way_flush  | [KvmSetWayFlushFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmSetWayFlushFtraceEvent)  |  
| kvm_sys_access  | [KvmSysAccessFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmSysAccessFtraceEvent)  |  
| kvm_test_age_hva  | [KvmTestAgeHvaFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmTestAgeHvaFtraceEvent)  |  
| kvm_timer_emulate  | [KvmTimerEmulateFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmTimerEmulateFtraceEvent)  |  
| kvm_timer_hrtimer_expire  | [KvmTimerHrtimerExpireFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmTimerHrtimerExpireFtraceEvent)  |  
| kvm_timer_restore_state  | [KvmTimerRestoreStateFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmTimerRestoreStateFtraceEvent)  |  
| kvm_timer_save_state  | [KvmTimerSaveStateFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmTimerSaveStateFtraceEvent)  |  
| kvm_timer_update_irq  | [KvmTimerUpdateIrqFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmTimerUpdateIrqFtraceEvent)  |  
| kvm_toggle_cache  | [KvmToggleCacheFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmToggleCacheFtraceEvent)  |  
| kvm_unmap_hva_range  | [KvmUnmapHvaRangeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmUnmapHvaRangeFtraceEvent)  |  
| kvm_userspace_exit  | [KvmUserspaceExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmUserspaceExitFtraceEvent)  |  
| kvm_vcpu_wakeup  | [KvmVcpuWakeupFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmVcpuWakeupFtraceEvent)  |  
| kvm_wfx_arm64  | [KvmWfxArm64FtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmWfxArm64FtraceEvent)  |  
| trap_reg  | [TrapRegFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TrapRegFtraceEvent)  |  
| vgic_update_irq_pending  | [VgicUpdateIrqPendingFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#VgicUpdateIrqPendingFtraceEvent)  |  
| wakeup_source_activate  | [WakeupSourceActivateFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#WakeupSourceActivateFtraceEvent)  |  
| wakeup_source_deactivate  | [WakeupSourceDeactivateFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#WakeupSourceDeactivateFtraceEvent)  |  
| ufshcd_command  | [UfshcdCommandFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#UfshcdCommandFtraceEvent)  |  
| ufshcd_clk_gating  | [UfshcdClkGatingFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#UfshcdClkGatingFtraceEvent)  |  
| console  | [ConsoleFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#ConsoleFtraceEvent)  |  
| drm_vblank_event  | [DrmVblankEventFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DrmVblankEventFtraceEvent)  |  
| drm_vblank_event_delivered  | [DrmVblankEventDeliveredFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DrmVblankEventDeliveredFtraceEvent)  |  
| drm_sched_job  | [DrmSchedJobFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DrmSchedJobFtraceEvent)  |  
| drm_run_job  | [DrmRunJobFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DrmRunJobFtraceEvent)  |  
| drm_sched_process_job  | [DrmSchedProcessJobFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DrmSchedProcessJobFtraceEvent)  |  
| dma_fence_init  | [DmaFenceInitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DmaFenceInitFtraceEvent)  |  
| dma_fence_emit  | [DmaFenceEmitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DmaFenceEmitFtraceEvent)  |  
| dma_fence_signaled  | [DmaFenceSignaledFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DmaFenceSignaledFtraceEvent)  |  
| dma_fence_wait_start  | [DmaFenceWaitStartFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DmaFenceWaitStartFtraceEvent)  |  
| dma_fence_wait_end  | [DmaFenceWaitEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DmaFenceWaitEndFtraceEvent)  |  
| f2fs_iostat  | [F2fsIostatFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsIostatFtraceEvent)  |  
| f2fs_iostat_latency  | [F2fsIostatLatencyFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsIostatLatencyFtraceEvent)  |  
| sched_cpu_util_cfs  | [SchedCpuUtilCfsFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SchedCpuUtilCfsFtraceEvent)  |  
| v4l2_qbuf  | [V4l2QbufFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#V4l2QbufFtraceEvent)  |  
| v4l2_dqbuf  | [V4l2DqbufFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#V4l2DqbufFtraceEvent)  |  
| vb2_v4l2_buf_queue  | [Vb2V4l2BufQueueFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Vb2V4l2BufQueueFtraceEvent)  |  
| vb2_v4l2_buf_done  | [Vb2V4l2BufDoneFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Vb2V4l2BufDoneFtraceEvent)  |  
| vb2_v4l2_qbuf  | [Vb2V4l2QbufFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Vb2V4l2QbufFtraceEvent)  |  
| vb2_v4l2_dqbuf  | [Vb2V4l2DqbufFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Vb2V4l2DqbufFtraceEvent)  |  
| dsi_cmd_fifo_status  | [DsiCmdFifoStatusFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DsiCmdFifoStatusFtraceEvent)  |  
| dsi_rx  | [DsiRxFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DsiRxFtraceEvent)  |  
| dsi_tx  | [DsiTxFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DsiTxFtraceEvent)  |  
| android_fs_dataread_end  | [AndroidFsDatareadEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#AndroidFsDatareadEndFtraceEvent)  |  
| android_fs_dataread_start  | [AndroidFsDatareadStartFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#AndroidFsDatareadStartFtraceEvent)  |  
| android_fs_datawrite_end  | [AndroidFsDatawriteEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#AndroidFsDatawriteEndFtraceEvent)  |  
| android_fs_datawrite_start  | [AndroidFsDatawriteStartFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#AndroidFsDatawriteStartFtraceEvent)  |  
| android_fs_fsync_end  | [AndroidFsFsyncEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#AndroidFsFsyncEndFtraceEvent)  |  
| android_fs_fsync_start  | [AndroidFsFsyncStartFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#AndroidFsFsyncStartFtraceEvent)  |  
| funcgraph_entry  | [FuncgraphEntryFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#FuncgraphEntryFtraceEvent)  |  
| funcgraph_exit  | [FuncgraphExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#FuncgraphExitFtraceEvent)  |  
| virtio_video_cmd  | [VirtioVideoCmdFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#VirtioVideoCmdFtraceEvent)  |  
| virtio_video_cmd_done  | [VirtioVideoCmdDoneFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#VirtioVideoCmdDoneFtraceEvent)  |  
| virtio_video_resource_queue  | [VirtioVideoResourceQueueFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#VirtioVideoResourceQueueFtraceEvent)  |  
| virtio_video_resource_queue_done  | [VirtioVideoResourceQueueDoneFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#VirtioVideoResourceQueueDoneFtraceEvent)  |  
| mm_shrink_slab_start  | [MmShrinkSlabStartFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmShrinkSlabStartFtraceEvent)  |  
| mm_shrink_slab_end  | [MmShrinkSlabEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmShrinkSlabEndFtraceEvent)  |  
| trusty_smc  | [TrustySmcFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TrustySmcFtraceEvent)  |  
| trusty_smc_done  | [TrustySmcDoneFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TrustySmcDoneFtraceEvent)  |  
| trusty_std_call32  | [TrustyStdCall32FtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TrustyStdCall32FtraceEvent)  |  
| trusty_std_call32_done  | [TrustyStdCall32DoneFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TrustyStdCall32DoneFtraceEvent)  |  
| trusty_share_memory  | [TrustyShareMemoryFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TrustyShareMemoryFtraceEvent)  |  
| trusty_share_memory_done  | [TrustyShareMemoryDoneFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TrustyShareMemoryDoneFtraceEvent)  |  
| trusty_reclaim_memory  | [TrustyReclaimMemoryFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TrustyReclaimMemoryFtraceEvent)  |  
| trusty_reclaim_memory_done  | [TrustyReclaimMemoryDoneFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TrustyReclaimMemoryDoneFtraceEvent)  |  
| trusty_irq  | [TrustyIrqFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TrustyIrqFtraceEvent)  |  
| trusty_ipc_handle_event  | [TrustyIpcHandleEventFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TrustyIpcHandleEventFtraceEvent)  |  
| trusty_ipc_connect  | [TrustyIpcConnectFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TrustyIpcConnectFtraceEvent)  |  
| trusty_ipc_connect_end  | [TrustyIpcConnectEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TrustyIpcConnectEndFtraceEvent)  |  
| trusty_ipc_write  | [TrustyIpcWriteFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TrustyIpcWriteFtraceEvent)  |  
| trusty_ipc_poll  | [TrustyIpcPollFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TrustyIpcPollFtraceEvent)  |  
| trusty_ipc_read  | [TrustyIpcReadFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TrustyIpcReadFtraceEvent)  | removed field with id 459;  |  
| trusty_ipc_read_end  | [TrustyIpcReadEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TrustyIpcReadEndFtraceEvent)  |  
| trusty_ipc_rx  | [TrustyIpcRxFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TrustyIpcRxFtraceEvent)  |  
| trusty_enqueue_nop  | [TrustyEnqueueNopFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TrustyEnqueueNopFtraceEvent)  | removed field with id 463;  |  
| cma_alloc_start  | [CmaAllocStartFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#CmaAllocStartFtraceEvent)  |  
| cma_alloc_info  | [CmaAllocInfoFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#CmaAllocInfoFtraceEvent)  |  
| lwis_tracing_mark_write  | [LwisTracingMarkWriteFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#LwisTracingMarkWriteFtraceEvent)  |  
| virtio_gpu_cmd_queue  | [VirtioGpuCmdQueueFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#VirtioGpuCmdQueueFtraceEvent)  |  
| virtio_gpu_cmd_response  | [VirtioGpuCmdResponseFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#VirtioGpuCmdResponseFtraceEvent)  |  
| mali_mali_KCPU_CQS_SET  | [MaliMaliKCPUCQSSETFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliKCPUCQSSETFtraceEvent)  |  
| mali_mali_KCPU_CQS_WAIT_START  | [MaliMaliKCPUCQSWAITSTARTFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliKCPUCQSWAITSTARTFtraceEvent)  |  
| mali_mali_KCPU_CQS_WAIT_END  | [MaliMaliKCPUCQSWAITENDFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliKCPUCQSWAITENDFtraceEvent)  |  
| mali_mali_KCPU_FENCE_SIGNAL  | [MaliMaliKCPUFENCESIGNALFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliKCPUFENCESIGNALFtraceEvent)  |  
| mali_mali_KCPU_FENCE_WAIT_START  | [MaliMaliKCPUFENCEWAITSTARTFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliKCPUFENCEWAITSTARTFtraceEvent)  |  
| mali_mali_KCPU_FENCE_WAIT_END  | [MaliMaliKCPUFENCEWAITENDFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliKCPUFENCEWAITENDFtraceEvent)  |  
| hyp_enter  | [HypEnterFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#HypEnterFtraceEvent)  |  
| hyp_exit  | [HypExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#HypExitFtraceEvent)  |  
| host_hcall  | [HostHcallFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#HostHcallFtraceEvent)  |  
| host_smc  | [HostSmcFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#HostSmcFtraceEvent)  |  
| host_mem_abort  | [HostMemAbortFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#HostMemAbortFtraceEvent)  |  
| suspend_resume_minimal  | [SuspendResumeMinimalFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SuspendResumeMinimalFtraceEvent)  |  
| mali_mali_CSF_INTERRUPT_START  | [MaliMaliCSFINTERRUPTSTARTFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliCSFINTERRUPTSTARTFtraceEvent)  |  
| mali_mali_CSF_INTERRUPT_END  | [MaliMaliCSFINTERRUPTENDFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliCSFINTERRUPTENDFtraceEvent)  |  
| samsung_tracing_mark_write  | [SamsungTracingMarkWriteFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SamsungTracingMarkWriteFtraceEvent)  |  
| binder_command  | [BinderCommandFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BinderCommandFtraceEvent)  |  
| binder_return  | [BinderReturnFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BinderReturnFtraceEvent)  |  
| sched_switch_with_ctrs  | [SchedSwitchWithCtrsFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SchedSwitchWithCtrsFtraceEvent)  |  
| gpu_work_period  | [GpuWorkPeriodFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#GpuWorkPeriodFtraceEvent)  |  
| rpm_status  | [RpmStatusFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#RpmStatusFtraceEvent)  |  
| panel_write_generic  | [PanelWriteGenericFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#PanelWriteGenericFtraceEvent)  |  
| sched_migrate_task  | [SchedMigrateTaskFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SchedMigrateTaskFtraceEvent)  |  
| dpu_dsi_cmd_fifo_status  | [DpuDsiCmdFifoStatusFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DpuDsiCmdFifoStatusFtraceEvent)  |  
| dpu_dsi_rx  | [DpuDsiRxFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DpuDsiRxFtraceEvent)  |  
| dpu_dsi_tx  | [DpuDsiTxFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DpuDsiTxFtraceEvent)  |  
| f2fs_background_gc  | [F2fsBackgroundGcFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsBackgroundGcFtraceEvent)  |  
| f2fs_gc_begin  | [F2fsGcBeginFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsGcBeginFtraceEvent)  |  
| f2fs_gc_end  | [F2fsGcEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsGcEndFtraceEvent)  |  
| fastrpc_dma_free  | [FastrpcDmaFreeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#FastrpcDmaFreeFtraceEvent)  |  
| fastrpc_dma_alloc  | [FastrpcDmaAllocFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#FastrpcDmaAllocFtraceEvent)  |  
| fastrpc_dma_unmap  | [FastrpcDmaUnmapFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#FastrpcDmaUnmapFtraceEvent)  |  
| fastrpc_dma_map  | [FastrpcDmaMapFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#FastrpcDmaMapFtraceEvent)  |  
| google_icc_event  | [GoogleIccEventFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#GoogleIccEventFtraceEvent)  |  
| google_irm_event  | [GoogleIrmEventFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#GoogleIrmEventFtraceEvent)  |  
| device_pm_callback_start  | [DevicePmCallbackStartFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DevicePmCallbackStartFtraceEvent)  |  
| device_pm_callback_end  | [DevicePmCallbackEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DevicePmCallbackEndFtraceEvent)  |  
| thermal_exynos_acpm_bulk  | [ThermalExynosAcpmBulkFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#ThermalExynosAcpmBulkFtraceEvent)  |  
| thermal_exynos_acpm_high_overhead  | [ThermalExynosAcpmHighOverheadFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#ThermalExynosAcpmHighOverheadFtraceEvent)  |  
| dcvsh_freq  | [DcvshFreqFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DcvshFreqFtraceEvent)  |  
| kgsl_gpu_frequency  | [KgslGpuFrequencyFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KgslGpuFrequencyFtraceEvent)  |  
| mali_mali_PM_MCU_HCTL_CORES_DOWN_SCALE_NOTIFY_PEND  | [MaliMaliPMMCUHCTLCORESDOWNSCALENOTIFYPENDFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliPMMCUHCTLCORESDOWNSCALENOTIFYPENDFtraceEvent)  |  
| mali_mali_PM_MCU_HCTL_CORES_NOTIFY_PEND  | [MaliMaliPMMCUHCTLCORESNOTIFYPENDFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliPMMCUHCTLCORESNOTIFYPENDFtraceEvent)  |  
| mali_mali_PM_MCU_HCTL_CORE_INACTIVE_PEND  | [MaliMaliPMMCUHCTLCOREINACTIVEPENDFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliPMMCUHCTLCOREINACTIVEPENDFtraceEvent)  |  
| mali_mali_PM_MCU_HCTL_MCU_ON_RECHECK  | [MaliMaliPMMCUHCTLMCUONRECHECKFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliPMMCUHCTLMCUONRECHECKFtraceEvent)  |  
| mali_mali_PM_MCU_HCTL_SHADERS_CORE_OFF_PEND  | [MaliMaliPMMCUHCTLSHADERSCOREOFFPENDFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliPMMCUHCTLSHADERSCOREOFFPENDFtraceEvent)  |  
| mali_mali_PM_MCU_HCTL_SHADERS_PEND_OFF  | [MaliMaliPMMCUHCTLSHADERSPENDOFFFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliPMMCUHCTLSHADERSPENDOFFFtraceEvent)  |  
| mali_mali_PM_MCU_HCTL_SHADERS_PEND_ON  | [MaliMaliPMMCUHCTLSHADERSPENDONFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliPMMCUHCTLSHADERSPENDONFtraceEvent)  |  
| mali_mali_PM_MCU_HCTL_SHADERS_READY_OFF  | [MaliMaliPMMCUHCTLSHADERSREADYOFFFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliPMMCUHCTLSHADERSREADYOFFFtraceEvent)  |  
| mali_mali_PM_MCU_IN_SLEEP  | [MaliMaliPMMCUINSLEEPFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliPMMCUINSLEEPFtraceEvent)  |  
| mali_mali_PM_MCU_OFF  | [MaliMaliPMMCUOFFFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliPMMCUOFFFtraceEvent)  |  
| mali_mali_PM_MCU_ON  | [MaliMaliPMMCUONFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliPMMCUONFtraceEvent)  |  
| mali_mali_PM_MCU_ON_CORE_ATTR_UPDATE_PEND  | [MaliMaliPMMCUONCOREATTRUPDATEPENDFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliPMMCUONCOREATTRUPDATEPENDFtraceEvent)  |  
| mali_mali_PM_MCU_ON_GLB_REINIT_PEND  | [MaliMaliPMMCUONGLBREINITPENDFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliPMMCUONGLBREINITPENDFtraceEvent)  |  
| mali_mali_PM_MCU_ON_HALT  | [MaliMaliPMMCUONHALTFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliPMMCUONHALTFtraceEvent)  |  
| mali_mali_PM_MCU_ON_HWCNT_DISABLE  | [MaliMaliPMMCUONHWCNTDISABLEFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliPMMCUONHWCNTDISABLEFtraceEvent)  |  
| mali_mali_PM_MCU_ON_HWCNT_ENABLE  | [MaliMaliPMMCUONHWCNTENABLEFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliPMMCUONHWCNTENABLEFtraceEvent)  |  
| mali_mali_PM_MCU_ON_PEND_HALT  | [MaliMaliPMMCUONPENDHALTFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliPMMCUONPENDHALTFtraceEvent)  |  
| mali_mali_PM_MCU_ON_PEND_SLEEP  | [MaliMaliPMMCUONPENDSLEEPFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliPMMCUONPENDSLEEPFtraceEvent)  |  
| mali_mali_PM_MCU_ON_SLEEP_INITIATE  | [MaliMaliPMMCUONSLEEPINITIATEFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliPMMCUONSLEEPINITIATEFtraceEvent)  |  
| mali_mali_PM_MCU_PEND_OFF  | [MaliMaliPMMCUPENDOFFFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliPMMCUPENDOFFFtraceEvent)  |  
| mali_mali_PM_MCU_PEND_ON_RELOAD  | [MaliMaliPMMCUPENDONRELOADFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliPMMCUPENDONRELOADFtraceEvent)  |  
| mali_mali_PM_MCU_POWER_DOWN  | [MaliMaliPMMCUPOWERDOWNFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliPMMCUPOWERDOWNFtraceEvent)  |  
| mali_mali_PM_MCU_RESET_WAIT  | [MaliMaliPMMCURESETWAITFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliPMMCURESETWAITFtraceEvent)  |  
| bcl_irq_trigger  | [BclIrqTriggerFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BclIrqTriggerFtraceEvent)  |  
| kgsl_adreno_cmdbatch_queued  | [KgslAdrenoCmdbatchQueuedFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KgslAdrenoCmdbatchQueuedFtraceEvent)  |  
| kgsl_adreno_cmdbatch_submitted  | [KgslAdrenoCmdbatchSubmittedFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KgslAdrenoCmdbatchSubmittedFtraceEvent)  |  
| kgsl_adreno_cmdbatch_sync  | [KgslAdrenoCmdbatchSyncFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KgslAdrenoCmdbatchSyncFtraceEvent)  |  
| kgsl_adreno_cmdbatch_retired  | [KgslAdrenoCmdbatchRetiredFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KgslAdrenoCmdbatchRetiredFtraceEvent)  |  
| pixel_mm_kswapd_wake  | [PixelMmKswapdWakeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#PixelMmKswapdWakeFtraceEvent)  |  
| pixel_mm_kswapd_done  | [PixelMmKswapdDoneFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#PixelMmKswapdDoneFtraceEvent)  |  
| sched_wakeup_task_attr  | [SchedWakeupTaskAttrFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SchedWakeupTaskAttrFtraceEvent)  |  
| devfreq_frequency  | [DevfreqFrequencyFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DevfreqFrequencyFtraceEvent)  |  
| kprobe_event  |  
| param_set_value_cpm  | [ParamSetValueCpmFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#ParamSetValueCpmFtraceEvent)  |  
| do_sys_open  | [DoSysOpenFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DoSysOpenFtraceEvent)  |  
| open_exec  | [OpenExecFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#OpenExecFtraceEvent)  |  
| block_io_start  | [BlockIoStartFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BlockIoStartFtraceEvent)  |  
| block_io_done  | [BlockIoDoneFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BlockIoDoneFtraceEvent)  |  
| mali_gpu_power_state  | [MaliGpuPowerStateFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliGpuPowerStateFtraceEvent)  |  
| dpu_disp_dpu_underrun  | [DpuDispDpuUnderrunFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DpuDispDpuUnderrunFtraceEvent)  |  
| dpu_disp_vblank_irq_enable  | [DpuDispVblankIrqEnableFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DpuDispVblankIrqEnableFtraceEvent)  |  
| hrtimer_start  | [HrtimerStartFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#HrtimerStartFtraceEvent)  |  
| hrtimer_cancel  | [HrtimerCancelFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#HrtimerCancelFtraceEvent)  |  
| hrtimer_expire_entry  | [HrtimerExpireEntryFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#HrtimerExpireEntryFtraceEvent)  |  
| hrtimer_expire_exit  | [HrtimerExpireExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#HrtimerExpireExitFtraceEvent)  |  
| timer_start  | [TimerStartFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TimerStartFtraceEvent)  |  
| timer_cancel  | [TimerCancelFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TimerCancelFtraceEvent)  |  
| timer_expire_entry  | [TimerExpireEntryFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TimerExpireEntryFtraceEvent)  |  
| timer_expire_exit  | [TimerExpireExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TimerExpireExitFtraceEvent)  |  
| local_timer_entry  | [LocalTimerEntryFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#LocalTimerEntryFtraceEvent)  |  
| local_timer_exit  | [LocalTimerExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#LocalTimerExitFtraceEvent)  |  
| dwc3_alloc_request  | [Dwc3AllocRequestFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Dwc3AllocRequestFtraceEvent)  |  
| dwc3_complete_trb  | [Dwc3CompleteTrbFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Dwc3CompleteTrbFtraceEvent)  |  
| dwc3_ctrl_req  | [Dwc3CtrlReqFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Dwc3CtrlReqFtraceEvent)  |  
| dwc3_ep_dequeue  | [Dwc3EpDequeueFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Dwc3EpDequeueFtraceEvent)  |  
| dwc3_ep_queue  | [Dwc3EpQueueFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Dwc3EpQueueFtraceEvent)  |  
| dwc3_event  | [Dwc3EventFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Dwc3EventFtraceEvent)  |  
| dwc3_free_request  | [Dwc3FreeRequestFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Dwc3FreeRequestFtraceEvent)  |  
| dwc3_gadget_ep_cmd  | [Dwc3GadgetEpCmdFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Dwc3GadgetEpCmdFtraceEvent)  |  
| dwc3_gadget_ep_disable  | [Dwc3GadgetEpDisableFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Dwc3GadgetEpDisableFtraceEvent)  |  
| dwc3_gadget_ep_enable  | [Dwc3GadgetEpEnableFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Dwc3GadgetEpEnableFtraceEvent)  |  
| dwc3_gadget_generic_cmd  | [Dwc3GadgetGenericCmdFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Dwc3GadgetGenericCmdFtraceEvent)  |  
| dwc3_gadget_giveback  | [Dwc3GadgetGivebackFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Dwc3GadgetGivebackFtraceEvent)  |  
| dwc3_prepare_trb  | [Dwc3PrepareTrbFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Dwc3PrepareTrbFtraceEvent)  |  
| dwc3_readl  | [Dwc3ReadlFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Dwc3ReadlFtraceEvent)  |  
| dwc3_writel  | [Dwc3WritelFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Dwc3WritelFtraceEvent)  |  
| cma_alloc_finish  | [CmaAllocFinishFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#CmaAllocFinishFtraceEvent)  |  
| mm_alloc_contig_migrate_range_info  | [MmAllocContigMigrateRangeInfoFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmAllocContigMigrateRangeInfoFtraceEvent)  |  
| host_ffa_call  | [HostFfaCallFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#HostFfaCallFtraceEvent)  |  
| dmabuf_rss_stat  | [DmabufRssStatFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DmabufRssStatFtraceEvent)  |  
| iommu_idmap  | [IommuIdmapFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#IommuIdmapFtraceEvent)  |  
| psci_mem_protect  | [PsciMemProtectFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#PsciMemProtectFtraceEvent)  |  
| hypervisor_host_hcall  | [HypervisorHostHcallFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#HypervisorHostHcallFtraceEvent)  |  
| hypervisor_host_smc  | [HypervisorHostSmcFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#HypervisorHostSmcFtraceEvent)  |  
| hypervisor_hyp_exit  | [HypervisorHypExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#HypervisorHypExitFtraceEvent)  |  
| hypervisor_iommu_idmap  | [HypervisorIommuIdmapFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#HypervisorIommuIdmapFtraceEvent)  |  
| hypervisor_psci_mem_protect  | [HypervisorPsciMemProtectFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#HypervisorPsciMemProtectFtraceEvent)  |  
| hypervisor_host_mem_abort  | [HypervisorHostMemAbortFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#HypervisorHostMemAbortFtraceEvent)  |  
| hypervisor_hyp_enter  | [HypervisorHypEnterFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#HypervisorHypEnterFtraceEvent)  |  
| hypervisor_iommu_idmap_complete  | [HypervisorIommuIdmapCompleteFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#HypervisorIommuIdmapCompleteFtraceEvent)  |  
| hypervisor_vcpu_illegal_trap  | [HypervisorVcpuIllegalTrapFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#HypervisorVcpuIllegalTrapFtraceEvent)  |  
| drm_sched_job_add_dep  | [DrmSchedJobAddDepFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DrmSchedJobAddDepFtraceEvent)  |  
| drm_sched_job_done  | [DrmSchedJobDoneFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DrmSchedJobDoneFtraceEvent)  |  
| drm_sched_job_queue  | [DrmSchedJobQueueFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DrmSchedJobQueueFtraceEvent)  |  
| drm_sched_job_run  | [DrmSchedJobRunFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DrmSchedJobRunFtraceEvent)  |  
| drm_sched_job_unschedulable  | [DrmSchedJobUnschedulableFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DrmSchedJobUnschedulableFtraceEvent)  |  
| fwtp_perfetto_counter  | [FwtpPerfettoCounterFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#FwtpPerfettoCounterFtraceEvent)  |  
| scsi_dispatch_cmd_error  | [ScsiDispatchCmdErrorFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#ScsiDispatchCmdErrorFtraceEvent)  |  
| scsi_dispatch_cmd_timeout  | [ScsiDispatchCmdTimeoutFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#ScsiDispatchCmdTimeoutFtraceEvent)  |  
| scsi_eh_wakeup  | [ScsiEhWakeupFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#ScsiEhWakeupFtraceEvent)  |  
| fwtp_perfetto_slice  | [FwtpPerfettoSliceFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#FwtpPerfettoSliceFtraceEvent)  |  
| gpu_power_state  | [GpuPowerStateFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#GpuPowerStateFtraceEvent)  |  
| gram_collision  | [GramCollisionFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#GramCollisionFtraceEvent)  |  
| f2fs_lock_elapsed_time  | [F2fsLockElapsedTimeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsLockElapsedTimeFtraceEvent)  |  
| sched_group_tracker  | [SchedGroupTrackerFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SchedGroupTrackerFtraceEvent)  |  
| dpu_disp_frame_done_timeout  | [DpuDispFrameDoneTimeoutFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DpuDispFrameDoneTimeoutFtraceEvent)  |  
| dpu_disp_frame_start_timeout  | [DpuDispFrameStartTimeoutFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DpuDispFrameStartTimeoutFtraceEvent)  |  
| mm_vmscan_memcg_reclaim_begin  | [MmVmscanMemcgReclaimBeginFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmVmscanMemcgReclaimBeginFtraceEvent)  |  
| mm_vmscan_memcg_reclaim_end  | [MmVmscanMemcgReclaimEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmVmscanMemcgReclaimEndFtraceEvent)  |  
| dpu_disp_frame_done_missing  | [DpuDispFrameDoneMissingFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DpuDispFrameDoneMissingFtraceEvent)  |  
| dpu_disp_frame_start_missing  | [DpuDispFrameStartMissingFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DpuDispFrameStartMissingFtraceEvent)  |  
| panel_settings_full  | [PanelSettingsFullFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#PanelSettingsFullFtraceEvent)  |  
| panel_settings_lite  | [PanelSettingsLiteFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#PanelSettingsLiteFtraceEvent)  |  
| dpu_disp_dpu_line_underrun  | [DpuDispDpuLineUnderrunFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DpuDispDpuLineUnderrunFtraceEvent)  |  
| psci_domain_idle_exit  | [PsciDomainIdleExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#PsciDomainIdleExitFtraceEvent)  |  
| psci_domain_idle_enter  | [PsciDomainIdleEnterFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#PsciDomainIdleEnterFtraceEvent)  |  
| long_irq  | [LongIrqFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#LongIrqFtraceEvent)  |  
| long_softirq  | [LongSoftirqFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#LongSoftirqFtraceEvent)  |  
###  PrintFtraceEvent
Defined in [ftrace.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ftrace.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| ip  | uint64  |  
| buf  | string  |  
###  SchedSwitchFtraceEvent
Defined in [sched.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/sched.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| prev_comm  | string  |  
| prev_pid  | int32  |  
| prev_prio  | int32  |  
| prev_state  | int64  |  
| next_comm  | string  |  
| next_pid  | int32  |  
| next_prio  | int32  |  
###  CpuFrequencyFtraceEvent
Defined in [power.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/power.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| state  | uint32  |  
| cpu_id  | uint32  |  
###  CpuFrequencyLimitsFtraceEvent
Defined in [power.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/power.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| min_freq  | uint32  |  
| max_freq  | uint32  |  
| cpu_id  | uint32  |  
###  CpuIdleFtraceEvent
Defined in [power.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/power.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| state  | uint32  |  
| cpu_id  | uint32  |  
###  ClockEnableFtraceEvent
Defined in [power.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/power.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
| state  | uint64  |  
| cpu_id  | uint64  |  
###  ClockDisableFtraceEvent
Defined in [power.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/power.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
| state  | uint64  |  
| cpu_id  | uint64  |  
###  ClockSetRateFtraceEvent
Defined in [power.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/power.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
| state  | uint64  |  
| cpu_id  | uint64  |  
###  SchedWakeupFtraceEvent
Defined in [sched.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/sched.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| comm  | string  |  
| pid  | int32  |  
| prio  | int32  |  
| success  | int32  |  
| target_cpu  | int32  |  
###  SchedBlockedReasonFtraceEvent
Defined in [sched.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/sched.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| pid  | int32  |  
| caller  | uint64  |  
| io_wait  | uint32  |  
###  SchedCpuHotplugFtraceEvent
Defined in [sched.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/sched.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| affected_cpu  | int32  |  
| error  | int32  |  
| status  | int32  |  
###  SchedWakingFtraceEvent
Defined in [sched.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/sched.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| comm  | string  |  
| pid  | int32  |  
| prio  | int32  |  
| success  | int32  |  
| target_cpu  | int32  |  
###  IpiEntryFtraceEvent
Defined in [ipi.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ipi.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| reason  | string  |  
###  IpiExitFtraceEvent
Defined in [ipi.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ipi.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| reason  | string  |  
###  IpiRaiseFtraceEvent
Defined in [ipi.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ipi.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| target_cpus  | uint32  |  
| reason  | string  |  
###  SoftirqEntryFtraceEvent
Defined in [irq.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/irq.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| vec  | uint32  |  
###  SoftirqExitFtraceEvent
Defined in [irq.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/irq.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| vec  | uint32  |  
###  SoftirqRaiseFtraceEvent
Defined in [irq.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/irq.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| vec  | uint32  |  
###  I2cReadFtraceEvent
Defined in [i2c.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/i2c.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| adapter_nr  | int32  |  
| msg_nr  | uint32  |  
| addr  | uint32  |  
| flags  | uint32  |  
| len  | uint32  |  
###  I2cWriteFtraceEvent
Defined in [i2c.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/i2c.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| adapter_nr  | int32  |  
| msg_nr  | uint32  |  
| addr  | uint32  |  
| flags  | uint32  |  
| len  | uint32  |  
| buf  | bytes  |  
###  I2cResultFtraceEvent
Defined in [i2c.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/i2c.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| adapter_nr  | int32  |  
| nr_msgs  | uint32  |  
| ret  | int32  |  
###  I2cReplyFtraceEvent
Defined in [i2c.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/i2c.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| adapter_nr  | int32  |  
| msg_nr  | uint32  |  
| addr  | uint32  |  
| flags  | uint32  |  
| len  | uint32  |  
| buf  | bytes  |  
###  SmbusReadFtraceEvent
Defined in [i2c.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/i2c.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| adapter_nr  | int32  |  
| flags  | uint32  |  
| addr  | uint32  |  
| command  | uint32  |  
| protocol  | uint32  |  
###  SmbusWriteFtraceEvent
Defined in [i2c.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/i2c.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| adapter_nr  | int32  |  
| addr  | uint32  |  
| flags  | uint32  |  
| command  | uint32  |  
| len  | uint32  |  
| protocol  | uint32  |  
###  SmbusResultFtraceEvent
Defined in [i2c.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/i2c.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| adapter_nr  | int32  |  
| addr  | uint32  |  
| flags  | uint32  |  
| read_write  | uint32  |  
| command  | uint32  |  
| res  | int32  |  
| protocol  | uint32  |  
###  SmbusReplyFtraceEvent
Defined in [i2c.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/i2c.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| adapter_nr  | int32  |  
| addr  | uint32  |  
| flags  | uint32  |  
| command  | uint32  |  
| len  | uint32  |  
| protocol  | uint32  |  
###  LowmemoryKillFtraceEvent
Defined in [lowmemorykiller.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/lowmemorykiller.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| comm  | string  |  
| pid  | int32  |  
| pagecache_size  | int64  |  
| pagecache_limit  | int64  |  
| free  | int64  |  
###  IrqHandlerEntryFtraceEvent
Defined in [irq.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/irq.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| irq  | int32  |  
| name  | string  |  
| handler  | uint32  |  
###  IrqHandlerExitFtraceEvent
Defined in [irq.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/irq.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| irq  | int32  |  
| ret  | int32  |  
###  SyncPtFtraceEvent
Defined in [sync.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/sync.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| timeline  | string  |  
| value  | string  |  
###  SyncTimelineFtraceEvent
Defined in [sync.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/sync.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
| value  | string  |  
###  SyncWaitFtraceEvent
Defined in [sync.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/sync.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
| status  | int32  |  
| begin  | uint32  |  
###  Ext4DaWriteBeginFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| pos  | int64  |  
| len  | uint32  |  
| flags  | uint32  |  
###  Ext4DaWriteEndFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| pos  | int64  |  
| len  | uint32  |  
| copied  | uint32  |  
###  Ext4SyncFileEnterFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| parent  | uint64  |  
| datasync  | int32  |  
###  Ext4SyncFileExitFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| ret  | int32  |  
###  BlockRqIssueFtraceEvent
Defined in [block.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/block.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| sector  | uint64  |  
| nr_sector  | uint32  |  
| bytes  | uint32  |  
| rwbs  | string  |  
| comm  | string  |  
| cmd  | string  |  
###  MmVmscanDirectReclaimBeginFtraceEvent
Defined in [vmscan.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/vmscan.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| order  | int32  |  
| may_writepage  | int32  |  
| gfp_flags  | uint32  |  
###  MmVmscanDirectReclaimEndFtraceEvent
Defined in [vmscan.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/vmscan.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| nr_reclaimed  | uint64  |  
###  MmVmscanKswapdWakeFtraceEvent
Defined in [vmscan.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/vmscan.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| nid  | int32  |  
| order  | int32  |  
| zid  | int32  |  
###  MmVmscanKswapdSleepFtraceEvent
Defined in [vmscan.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/vmscan.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| nid  | int32  |  
###  BinderTransactionFtraceEvent
Defined in [binder.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/binder.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| debug_id  | int32  |  
| target_node  | int32  |  
| to_proc  | int32  |  
| to_thread  | int32  |  
| reply  | int32  |  
| code  | uint32  |  
| flags  | uint32  |  
###  BinderTransactionReceivedFtraceEvent
Defined in [binder.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/binder.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| debug_id  | int32  |  
###  BinderSetPriorityFtraceEvent
Defined in [binder.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/binder.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| proc  | int32  |  
| thread  | int32  |  
| old_prio  | uint32  |  
| new_prio  | uint32  |  
| desired_prio  | uint32  |  
###  BinderLockFtraceEvent
Defined in [binder.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/binder.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| tag  | string  |  
###  BinderLockedFtraceEvent
Defined in [binder.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/binder.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| tag  | string  |  
###  BinderUnlockFtraceEvent
Defined in [binder.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/binder.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| tag  | string  |  
###  WorkqueueActivateWorkFtraceEvent
Defined in [workqueue.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/workqueue.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| work  | uint64  |  
| function  | uint64  |  
###  WorkqueueExecuteEndFtraceEvent
Defined in [workqueue.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/workqueue.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| work  | uint64  |  
| function  | uint64  |  
###  WorkqueueExecuteStartFtraceEvent
Defined in [workqueue.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/workqueue.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| work  | uint64  |  
| function  | uint64  |  
###  WorkqueueQueueWorkFtraceEvent
Defined in [workqueue.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/workqueue.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| work  | uint64  |  
| function  | uint64  |  
| req_cpu  | int32  |  
| cpu  | int32  |  
| workqueue  | string  |  
###  RegulatorDisableFtraceEvent
Defined in [regulator.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/regulator.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
###  RegulatorDisableCompleteFtraceEvent
Defined in [regulator.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/regulator.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
###  RegulatorEnableFtraceEvent
Defined in [regulator.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/regulator.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
###  RegulatorEnableCompleteFtraceEvent
Defined in [regulator.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/regulator.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
###  RegulatorEnableDelayFtraceEvent
Defined in [regulator.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/regulator.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
###  RegulatorSetVoltageFtraceEvent
Defined in [regulator.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/regulator.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
| min  | int32  |  
| max  | int32  |  
###  RegulatorSetVoltageCompleteFtraceEvent
Defined in [regulator.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/regulator.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
| val  | uint32  |  
###  CgroupAttachTaskFtraceEvent
Defined in [cgroup.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/cgroup.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dst_root  | int32  |  
| dst_id  | int32  |  
| pid  | int32  |  
| comm  | string  |  
| cname  | string  |  
| dst_level  | int32  |  
| dst_path  | string  |  
###  CgroupMkdirFtraceEvent
Defined in [cgroup.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/cgroup.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| root  | int32  |  
| id  | int32  |  
| cname  | string  |  
| level  | int32  |  
| path  | string  |  
###  CgroupRemountFtraceEvent
Defined in [cgroup.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/cgroup.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| root  | int32  |  
| ss_mask  | uint32  |  
| name  | string  |  
###  CgroupRmdirFtraceEvent
Defined in [cgroup.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/cgroup.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| root  | int32  |  
| id  | int32  |  
| cname  | string  |  
| level  | int32  |  
| path  | string  |  
###  CgroupTransferTasksFtraceEvent
Defined in [cgroup.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/cgroup.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dst_root  | int32  |  
| dst_id  | int32  |  
| pid  | int32  |  
| comm  | string  |  
| cname  | string  |  
| dst_level  | int32  |  
| dst_path  | string  |  
###  CgroupDestroyRootFtraceEvent
Defined in [cgroup.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/cgroup.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| root  | int32  |  
| ss_mask  | uint32  |  
| name  | string  |  
###  CgroupReleaseFtraceEvent
Defined in [cgroup.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/cgroup.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| root  | int32  |  
| id  | int32  |  
| cname  | string  |  
| level  | int32  |  
| path  | string  |  
###  CgroupRenameFtraceEvent
Defined in [cgroup.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/cgroup.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| root  | int32  |  
| id  | int32  |  
| cname  | string  |  
| level  | int32  |  
| path  | string  |  
###  CgroupSetupRootFtraceEvent
Defined in [cgroup.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/cgroup.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| root  | int32  |  
| ss_mask  | uint32  |  
| name  | string  |  
###  MdpCmdKickoffFtraceEvent
Defined in [mdss.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mdss.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| ctl_num  | uint32  |  
| kickoff_cnt  | int32  |  
###  MdpCommitFtraceEvent
Defined in [mdss.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mdss.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| num  | uint32  |  
| play_cnt  | uint32  |  
| clk_rate  | uint32  |  
| bandwidth  | uint64  |  
###  MdpPerfSetOtFtraceEvent
Defined in [mdss.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mdss.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| pnum  | uint32  |  
| xin_id  | uint32  |  
| rd_lim  | uint32  |  
| is_vbif_rt  | uint32  |  
###  MdpSsppChangeFtraceEvent
Defined in [mdss.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mdss.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| num  | uint32  |  
| play_cnt  | uint32  |  
| mixer  | uint32  |  
| stage  | uint32  |  
| flags  | uint32  |  
| format  | uint32  |  
| img_w  | uint32  |  
| img_h  | uint32  |  
| src_x  | uint32  |  
| src_y  | uint32  |  
| src_w  | uint32  |  
| src_h  | uint32  |  
| dst_x  | uint32  |  
| dst_y  | uint32  |  
| dst_w  | uint32  |  
| dst_h  | uint32  |  
###  TracingMarkWriteFtraceEvent
Defined in [mdss.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mdss.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| pid  | int32  |  
| trace_name  | string  |  
| trace_begin  | uint32  |  
###  MdpCmdPingpongDoneFtraceEvent
Defined in [mdss.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mdss.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| ctl_num  | uint32  |  
| intf_num  | uint32  |  
| pp_num  | uint32  |  
| koff_cnt  | int32  |  
###  MdpCompareBwFtraceEvent
Defined in [mdss.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mdss.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| new_ab  | uint64  |  
| new_ib  | uint64  |  
| new_wb  | uint64  |  
| old_ab  | uint64  |  
| old_ib  | uint64  |  
| old_wb  | uint64  |  
| params_changed  | uint32  |  
| update_bw  | uint32  |  
###  MdpPerfSetPanicLutsFtraceEvent
Defined in [mdss.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mdss.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| pnum  | uint32  |  
| fmt  | uint32  |  
| mode  | uint32  |  
| panic_lut  | uint32  |  
| robust_lut  | uint32  |  
###  MdpSsppSetFtraceEvent
Defined in [mdss.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mdss.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| num  | uint32  |  
| play_cnt  | uint32  |  
| mixer  | uint32  |  
| stage  | uint32  |  
| flags  | uint32  |  
| format  | uint32  |  
| img_w  | uint32  |  
| img_h  | uint32  |  
| src_x  | uint32  |  
| src_y  | uint32  |  
| src_w  | uint32  |  
| src_h  | uint32  |  
| dst_x  | uint32  |  
| dst_y  | uint32  |  
| dst_w  | uint32  |  
| dst_h  | uint32  |  
###  MdpCmdReadptrDoneFtraceEvent
Defined in [mdss.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mdss.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| ctl_num  | uint32  |  
| koff_cnt  | int32  |  
###  MdpMisrCrcFtraceEvent
Defined in [mdss.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mdss.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| block_id  | uint32  |  
| vsync_cnt  | uint32  |  
| crc  | uint32  |  
###  MdpPerfSetQosLutsFtraceEvent
Defined in [mdss.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mdss.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| pnum  | uint32  |  
| fmt  | uint32  |  
| intf  | uint32  |  
| rot  | uint32  |  
| fl  | uint32  |  
| lut  | uint32  |  
| linear  | uint32  |  
###  MdpTraceCounterFtraceEvent
Defined in [mdss.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mdss.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| pid  | int32  |  
| counter_name  | string  |  
| value  | int32  |  
###  MdpCmdReleaseBwFtraceEvent
Defined in [mdss.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mdss.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| ctl_num  | uint32  |  
###  MdpMixerUpdateFtraceEvent
Defined in [mdss.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mdss.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| mixer_num  | uint32  |  
###  MdpPerfSetWmLevelsFtraceEvent
Defined in [mdss.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mdss.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| pnum  | uint32  |  
| use_space  | uint32  |  
| priority_bytes  | uint32  |  
| wm0  | uint32  |  
| wm1  | uint32  |  
| wm2  | uint32  |  
| mb_cnt  | uint32  |  
| mb_size  | uint32  |  
###  MdpVideoUnderrunDoneFtraceEvent
Defined in [mdss.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mdss.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| ctl_num  | uint32  |  
| underrun_cnt  | uint32  |  
###  MdpCmdWaitPingpongFtraceEvent
Defined in [mdss.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mdss.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| ctl_num  | uint32  |  
| kickoff_cnt  | int32  |  
###  MdpPerfPrefillCalcFtraceEvent
Defined in [mdss.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mdss.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| pnum  | uint32  |  
| latency_buf  | uint32  |  
| ot  | uint32  |  
| y_buf  | uint32  |  
| y_scaler  | uint32  |  
| pp_lines  | uint32  |  
| pp_bytes  | uint32  |  
| post_sc  | uint32  |  
| fbc_bytes  | uint32  |  
| prefill_bytes  | uint32  |  
###  MdpPerfUpdateBusFtraceEvent
Defined in [mdss.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mdss.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| client  | int32  |  
| ab_quota  | uint64  |  
| ib_quota  | uint64  |  
###  RotatorBwAoAsContextFtraceEvent
Defined in [mdss.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mdss.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| state  | uint32  |  
###  MmFilemapAddToPageCacheFtraceEvent
Defined in [filemap.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/filemap.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| pfn  | uint64  |  
| i_ino  | uint64  |  
| index  | uint64  |  
| s_dev  | uint64  |  
| page  | uint64  |  
###  MmFilemapDeleteFromPageCacheFtraceEvent
Defined in [filemap.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/filemap.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| pfn  | uint64  |  
| i_ino  | uint64  |  
| index  | uint64  |  
| s_dev  | uint64  |  
| page  | uint64  |  
###  MmCompactionBeginFtraceEvent
Defined in [compaction.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/compaction.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| zone_start  | uint64  |  
| migrate_pfn  | uint64  |  
| free_pfn  | uint64  |  
| zone_end  | uint64  |  
| sync  | uint32  |  
###  MmCompactionDeferCompactionFtraceEvent
Defined in [compaction.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/compaction.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| nid  | int32  |  
| idx  | uint32  |  
| order  | int32  |  
| considered  | uint32  |  
| defer_shift  | uint32  |  
| order_failed  | int32  |  
###  MmCompactionDeferredFtraceEvent
Defined in [compaction.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/compaction.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| nid  | int32  |  
| idx  | uint32  |  
| order  | int32  |  
| considered  | uint32  |  
| defer_shift  | uint32  |  
| order_failed  | int32  |  
###  MmCompactionDeferResetFtraceEvent
Defined in [compaction.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/compaction.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| nid  | int32  |  
| idx  | uint32  |  
| order  | int32  |  
| considered  | uint32  |  
| defer_shift  | uint32  |  
| order_failed  | int32  |  
###  MmCompactionEndFtraceEvent
Defined in [compaction.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/compaction.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| zone_start  | uint64  |  
| migrate_pfn  | uint64  |  
| free_pfn  | uint64  |  
| zone_end  | uint64  |  
| sync  | uint32  |  
| status  | int32  |  
###  MmCompactionFinishedFtraceEvent
Defined in [compaction.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/compaction.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| nid  | int32  |  
| idx  | uint32  |  
| order  | int32  |  
| ret  | int32  |  
###  MmCompactionIsolateFreepagesFtraceEvent
Defined in [compaction.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/compaction.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| start_pfn  | uint64  |  
| end_pfn  | uint64  |  
| nr_scanned  | uint64  |  
| nr_taken  | uint64  |  
###  MmCompactionIsolateMigratepagesFtraceEvent
Defined in [compaction.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/compaction.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| start_pfn  | uint64  |  
| end_pfn  | uint64  |  
| nr_scanned  | uint64  |  
| nr_taken  | uint64  |  
###  MmCompactionKcompactdSleepFtraceEvent
Defined in [compaction.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/compaction.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| nid  | int32  |  
###  MmCompactionKcompactdWakeFtraceEvent
Defined in [compaction.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/compaction.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| nid  | int32  |  
| order  | int32  |  
| classzone_idx  | uint32  |  
| highest_zoneidx  | uint32  |  
###  MmCompactionMigratepagesFtraceEvent
Defined in [compaction.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/compaction.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| nr_migrated  | uint64  |  
| nr_failed  | uint64  |  
###  MmCompactionSuitableFtraceEvent
Defined in [compaction.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/compaction.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| nid  | int32  |  
| idx  | uint32  |  
| order  | int32  |  
| ret  | int32  |  
###  MmCompactionTryToCompactPagesFtraceEvent
Defined in [compaction.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/compaction.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| order  | int32  |  
| gfp_mask  | uint32  |  
| mode  | uint32  |  
| prio  | int32  |  
###  MmCompactionWakeupKcompactdFtraceEvent
Defined in [compaction.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/compaction.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| nid  | int32  |  
| order  | int32  |  
| classzone_idx  | uint32  |  
| highest_zoneidx  | uint32  |  
###  SuspendResumeFtraceEvent
Defined in [power.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/power.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| action  | string  |  
| val  | int32  |  
| start  | uint32  |  
###  SchedWakeupNewFtraceEvent
Defined in [sched.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/sched.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| comm  | string  |  
| pid  | int32  |  
| prio  | int32  |  
| success  | int32  |  
| target_cpu  | int32  |  
###  BlockBioBackmergeFtraceEvent
Defined in [block.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/block.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| sector  | uint64  |  
| nr_sector  | uint32  |  
| rwbs  | string  |  
| comm  | string  |  
###  BlockBioBounceFtraceEvent
Defined in [block.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/block.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| sector  | uint64  |  
| nr_sector  | uint32  |  
| rwbs  | string  |  
| comm  | string  |  
###  BlockBioCompleteFtraceEvent
Defined in [block.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/block.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| sector  | uint64  |  
| nr_sector  | uint32  |  
| error  | int32  |  
| rwbs  | string  |  
###  BlockBioFrontmergeFtraceEvent
Defined in [block.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/block.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| sector  | uint64  |  
| nr_sector  | uint32  |  
| rwbs  | string  |  
| comm  | string  |  
###  BlockBioQueueFtraceEvent
Defined in [block.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/block.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| sector  | uint64  |  
| nr_sector  | uint32  |  
| rwbs  | string  |  
| comm  | string  |  
###  BlockBioRemapFtraceEvent
Defined in [block.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/block.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| sector  | uint64  |  
| nr_sector  | uint32  |  
| old_dev  | uint64  |  
| old_sector  | uint64  |  
| rwbs  | string  |  
###  BlockDirtyBufferFtraceEvent
Defined in [block.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/block.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| sector  | uint64  |  
| size  | uint64  |  
###  BlockGetrqFtraceEvent
Defined in [block.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/block.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| sector  | uint64  |  
| nr_sector  | uint32  |  
| rwbs  | string  |  
| comm  | string  |  
###  BlockPlugFtraceEvent
Defined in [block.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/block.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| comm  | string  |  
###  BlockRqAbortFtraceEvent
Defined in [block.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/block.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| sector  | uint64  |  
| nr_sector  | uint32  |  
| errors  | int32  |  
| rwbs  | string  |  
| cmd  | string  |  
###  BlockRqCompleteFtraceEvent
Defined in [block.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/block.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| sector  | uint64  |  
| nr_sector  | uint32  |  
| errors  | int32  |  
| rwbs  | string  |  
| cmd  | string  |  
| error  | int32  |  
###  BlockRqInsertFtraceEvent
Defined in [block.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/block.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| sector  | uint64  |  
| nr_sector  | uint32  |  
| bytes  | uint32  |  
| rwbs  | string  |  
| comm  | string  |  
| cmd  | string  |  
###  BlockRqRemapFtraceEvent
Defined in [block.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/block.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| sector  | uint64  |  
| nr_sector  | uint32  |  
| old_dev  | uint64  |  
| old_sector  | uint64  |  
| nr_bios  | uint32  |  
| rwbs  | string  |  
###  BlockRqRequeueFtraceEvent
Defined in [block.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/block.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| sector  | uint64  |  
| nr_sector  | uint32  |  
| errors  | int32  |  
| rwbs  | string  |  
| cmd  | string  |  
###  BlockSleeprqFtraceEvent
Defined in [block.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/block.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| sector  | uint64  |  
| nr_sector  | uint32  |  
| rwbs  | string  |  
| comm  | string  |  
###  BlockSplitFtraceEvent
Defined in [block.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/block.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| sector  | uint64  |  
| new_sector  | uint64  |  
| rwbs  | string  |  
| comm  | string  |  
###  BlockTouchBufferFtraceEvent
Defined in [block.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/block.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| sector  | uint64  |  
| size  | uint64  |  
###  BlockUnplugFtraceEvent
Defined in [block.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/block.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| nr_rq  | int32  |  
| comm  | string  |  
###  Ext4AllocDaBlocksFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| data_blocks  | uint32  |  
| meta_blocks  | uint32  |  
###  Ext4AllocateBlocksFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| block  | uint64  |  
| len  | uint32  |  
| logical  | uint32  |  
| lleft  | uint32  |  
| lright  | uint32  |  
| goal  | uint64  |  
| pleft  | uint64  |  
| pright  | uint64  |  
| flags  | uint32  |  
###  Ext4AllocateInodeFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| dir  | uint64  |  
| mode  | uint32  |  
###  Ext4BeginOrderedTruncateFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| new_size  | int64  |  
###  Ext4CollapseRangeFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| offset  | int64  |  
| len  | int64  |  
###  Ext4DaReleaseSpaceFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| i_blocks  | uint64  |  
| freed_blocks  | int32  |  
| reserved_data_blocks  | int32  |  
| reserved_meta_blocks  | int32  |  
| allocated_meta_blocks  | int32  |  
| mode  | uint32  |  
###  Ext4DaReserveSpaceFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| i_blocks  | uint64  |  
| reserved_data_blocks  | int32  |  
| reserved_meta_blocks  | int32  |  
| mode  | uint32  |  
| md_needed  | int32  |  
###  Ext4DaUpdateReserveSpaceFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| i_blocks  | uint64  |  
| used_blocks  | int32  |  
| reserved_data_blocks  | int32  |  
| reserved_meta_blocks  | int32  |  
| allocated_meta_blocks  | int32  |  
| quota_claim  | int32  |  
| mode  | uint32  |  
###  Ext4DaWritePagesFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| first_page  | uint64  |  
| nr_to_write  | int64  |  
| sync_mode  | int32  |  
| b_blocknr  | uint64  |  
| b_size  | uint32  |  
| b_state  | uint32  |  
| io_done  | int32  |  
| pages_written  | int32  |  
###  Ext4DaWritePagesExtentFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| lblk  | uint64  |  
| len  | uint32  |  
| flags  | uint32  |  
###  Ext4DirectIOEnterFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| pos  | int64  |  
| len  | uint64  |  
| rw  | int32  |  
###  Ext4DirectIOExitFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| pos  | int64  |  
| len  | uint64  |  
| rw  | int32  |  
| ret  | int32  |  
###  Ext4DiscardBlocksFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| blk  | uint64  |  
| count  | uint64  |  
###  Ext4DiscardPreallocationsFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| len  | uint32  |  
| needed  | uint32  |  
###  Ext4DropInodeFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| drop  | int32  |  
###  Ext4EsCacheExtentFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| lblk  | uint32  |  
| len  | uint32  |  
| pblk  | uint64  |  
| status  | uint32  |  
###  Ext4EsFindDelayedExtentRangeEnterFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| lblk  | uint32  |  
###  Ext4EsFindDelayedExtentRangeExitFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| lblk  | uint32  |  
| len  | uint32  |  
| pblk  | uint64  |  
| status  | uint64  |  
###  Ext4EsInsertExtentFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| lblk  | uint32  |  
| len  | uint32  |  
| pblk  | uint64  |  
| status  | uint64  |  
###  Ext4EsLookupExtentEnterFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| lblk  | uint32  |  
###  Ext4EsLookupExtentExitFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| lblk  | uint32  |  
| len  | uint32  |  
| pblk  | uint64  |  
| status  | uint64  |  
| found  | int32  |  
###  Ext4EsRemoveExtentFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| lblk  | int64  |  
| len  | int64  |  
###  Ext4EsShrinkFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| nr_shrunk  | int32  |  
| scan_time  | uint64  |  
| nr_skipped  | int32  |  
| retried  | int32  |  
###  Ext4EsShrinkCountFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| nr_to_scan  | int32  |  
| cache_cnt  | int32  |  
###  Ext4EsShrinkScanEnterFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| nr_to_scan  | int32  |  
| cache_cnt  | int32  |  
###  Ext4EsShrinkScanExitFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| nr_shrunk  | int32  |  
| cache_cnt  | int32  |  
###  Ext4EvictInodeFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| nlink  | int32  |  
###  Ext4ExtConvertToInitializedEnterFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| m_lblk  | uint32  |  
| m_len  | uint32  |  
| u_lblk  | uint32  |  
| u_len  | uint32  |  
| u_pblk  | uint64  |  
###  Ext4ExtConvertToInitializedFastpathFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| m_lblk  | uint32  |  
| m_len  | uint32  |  
| u_lblk  | uint32  |  
| u_len  | uint32  |  
| u_pblk  | uint64  |  
| i_lblk  | uint32  |  
| i_len  | uint32  |  
| i_pblk  | uint64  |  
###  Ext4ExtHandleUnwrittenExtentsFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| flags  | int32  |  
| lblk  | uint32  |  
| pblk  | uint64  |  
| len  | uint32  |  
| allocated  | uint32  |  
| newblk  | uint64  |  
###  Ext4ExtInCacheFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| lblk  | uint32  |  
| ret  | int32  |  
###  Ext4ExtLoadExtentFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| pblk  | uint64  |  
| lblk  | uint32  |  
###  Ext4ExtMapBlocksEnterFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| lblk  | uint32  |  
| len  | uint32  |  
| flags  | uint32  |  
###  Ext4ExtMapBlocksExitFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| flags  | uint32  |  
| pblk  | uint64  |  
| lblk  | uint32  |  
| len  | uint32  |  
| mflags  | uint32  |  
| ret  | int32  |  
###  Ext4ExtPutInCacheFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| lblk  | uint32  |  
| len  | uint32  |  
| start  | uint64  |  
###  Ext4ExtRemoveSpaceFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| start  | uint32  |  
| end  | uint32  |  
| depth  | int32  |  
###  Ext4ExtRemoveSpaceDoneFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| start  | uint32  |  
| end  | uint32  |  
| depth  | int32  |  
| partial  | int64  |  
| eh_entries  | uint32  |  
| pc_lblk  | uint32  |  
| pc_pclu  | uint64  |  
| pc_state  | int32  |  
###  Ext4ExtRmIdxFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| pblk  | uint64  |  
###  Ext4ExtRmLeafFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| partial  | int64  |  
| start  | uint32  |  
| ee_lblk  | uint32  |  
| ee_pblk  | uint64  |  
| ee_len  | int32  |  
| pc_lblk  | uint32  |  
| pc_pclu  | uint64  |  
| pc_state  | int32  |  
###  Ext4ExtShowExtentFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| pblk  | uint64  |  
| lblk  | uint32  |  
| len  | uint32  |  
###  Ext4FallocateEnterFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| offset  | int64  |  
| len  | int64  |  
| mode  | int32  |  
| pos  | int64  |  
###  Ext4FallocateExitFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| pos  | int64  |  
| blocks  | uint32  |  
| ret  | int32  |  
###  Ext4FindDelallocRangeFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| from  | uint32  |  
| to  | uint32  |  
| reverse  | int32  |  
| found  | int32  |  
| found_blk  | uint32  |  
###  Ext4ForgetFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| block  | uint64  |  
| is_metadata  | int32  |  
| mode  | uint32  |  
###  Ext4FreeBlocksFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| block  | uint64  |  
| count  | uint64  |  
| flags  | int32  |  
| mode  | uint32  |  
###  Ext4FreeInodeFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| uid  | uint32  |  
| gid  | uint32  |  
| blocks  | uint64  |  
| mode  | uint32  |  
###  Ext4GetImpliedClusterAllocExitFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| flags  | uint32  |  
| lblk  | uint32  |  
| pblk  | uint64  |  
| len  | uint32  |  
| ret  | int32  |  
###  Ext4GetReservedClusterAllocFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| lblk  | uint32  |  
| len  | uint32  |  
###  Ext4IndMapBlocksEnterFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| lblk  | uint32  |  
| len  | uint32  |  
| flags  | uint32  |  
###  Ext4IndMapBlocksExitFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| flags  | uint32  |  
| pblk  | uint64  |  
| lblk  | uint32  |  
| len  | uint32  |  
| mflags  | uint32  |  
| ret  | int32  |  
###  Ext4InsertRangeFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| offset  | int64  |  
| len  | int64  |  
###  Ext4InvalidatepageFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| index  | uint64  |  
| offset  | uint64  |  
| length  | uint32  |  
###  Ext4JournalStartFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ip  | uint64  |  
| blocks  | int32  |  
| rsv_blocks  | int32  |  
| nblocks  | int32  |  
| revoke_creds  | int32  |  
###  Ext4JournalStartReservedFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ip  | uint64  |  
| blocks  | int32  |  
###  Ext4JournalledInvalidatepageFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| index  | uint64  |  
| offset  | uint64  |  
| length  | uint32  |  
###  Ext4JournalledWriteEndFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| pos  | int64  |  
| len  | uint32  |  
| copied  | uint32  |  
###  Ext4LoadInodeFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
###  Ext4LoadInodeBitmapFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| group  | uint32  |  
###  Ext4MarkInodeDirtyFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| ip  | uint64  |  
###  Ext4MbBitmapLoadFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| group  | uint32  |  
###  Ext4MbBuddyBitmapLoadFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| group  | uint32  |  
###  Ext4MbDiscardPreallocationsFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| needed  | int32  |  
###  Ext4MbNewGroupPaFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| pa_pstart  | uint64  |  
| pa_lstart  | uint64  |  
| pa_len  | uint32  |  
###  Ext4MbNewInodePaFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| pa_pstart  | uint64  |  
| pa_lstart  | uint64  |  
| pa_len  | uint32  |  
###  Ext4MbReleaseGroupPaFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| pa_pstart  | uint64  |  
| pa_len  | uint32  |  
###  Ext4MbReleaseInodePaFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| block  | uint64  |  
| count  | uint32  |  
###  Ext4MballocAllocFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| orig_logical  | uint32  |  
| orig_start  | int32  |  
| orig_group  | uint32  |  
| orig_len  | int32  |  
| goal_logical  | uint32  |  
| goal_start  | int32  |  
| goal_group  | uint32  |  
| goal_len  | int32  |  
| result_logical  | uint32  |  
| result_start  | int32  |  
| result_group  | uint32  |  
| result_len  | int32  |  
| found  | uint32  |  
| groups  | uint32  |  
| buddy  | uint32  |  
| flags  | uint32  |  
| tail  | uint32  |  
| cr  | uint32  |  
###  Ext4MballocDiscardFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| result_start  | int32  |  
| result_group  | uint32  |  
| result_len  | int32  |  
###  Ext4MballocFreeFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| result_start  | int32  |  
| result_group  | uint32  |  
| result_len  | int32  |  
###  Ext4MballocPreallocFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| orig_logical  | uint32  |  
| orig_start  | int32  |  
| orig_group  | uint32  |  
| orig_len  | int32  |  
| result_logical  | uint32  |  
| result_start  | int32  |  
| result_group  | uint32  |  
| result_len  | int32  |  
###  Ext4OtherInodeUpdateTimeFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| orig_ino  | uint64  |  
| uid  | uint32  |  
| gid  | uint32  |  
| mode  | uint32  |  
###  Ext4PunchHoleFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| offset  | int64  |  
| len  | int64  |  
| mode  | int32  |  
###  Ext4ReadBlockBitmapLoadFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| group  | uint32  |  
| prefetch  | uint32  |  
###  Ext4ReadpageFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| index  | uint64  |  
###  Ext4ReleasepageFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| index  | uint64  |  
###  Ext4RemoveBlocksFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| from  | uint32  |  
| to  | uint32  |  
| partial  | int64  |  
| ee_pblk  | uint64  |  
| ee_lblk  | uint32  |  
| ee_len  | uint32  |  
| pc_lblk  | uint32  |  
| pc_pclu  | uint64  |  
| pc_state  | int32  |  
###  Ext4RequestBlocksFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| len  | uint32  |  
| logical  | uint32  |  
| lleft  | uint32  |  
| lright  | uint32  |  
| goal  | uint64  |  
| pleft  | uint64  |  
| pright  | uint64  |  
| flags  | uint32  |  
###  Ext4RequestInodeFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| dir  | uint64  |  
| mode  | uint32  |  
###  Ext4SyncFsFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| wait  | int32  |  
###  Ext4TrimAllFreeFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev_major  | int32  |  
| dev_minor  | int32  |  
| group  | uint32  |  
| start  | int32  |  
| len  | int32  |  
###  Ext4TrimExtentFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev_major  | int32  |  
| dev_minor  | int32  |  
| group  | uint32  |  
| start  | int32  |  
| len  | int32  |  
###  Ext4TruncateEnterFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| blocks  | uint64  |  
###  Ext4TruncateExitFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| blocks  | uint64  |  
###  Ext4UnlinkEnterFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| parent  | uint64  |  
| size  | int64  |  
###  Ext4UnlinkExitFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| ret  | int32  |  
###  Ext4WriteBeginFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| pos  | int64  |  
| len  | uint32  |  
| flags  | uint32  |  
###  Ext4WriteEndFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| pos  | int64  |  
| len  | uint32  |  
| copied  | uint32  |  
###  Ext4WritepageFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| index  | uint64  |  
###  Ext4WritepagesFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| nr_to_write  | int64  |  
| pages_skipped  | int64  |  
| range_start  | int64  |  
| range_end  | int64  |  
| writeback_index  | uint64  |  
| sync_mode  | int32  |  
| for_kupdate  | uint32  |  
| range_cyclic  | uint32  |  
###  Ext4WritepagesResultFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| ret  | int32  |  
| pages_written  | int32  |  
| pages_skipped  | int64  |  
| writeback_index  | uint64  |  
| sync_mode  | int32  |  
###  Ext4ZeroRangeFtraceEvent
Defined in [ext4.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ext4.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| offset  | int64  |  
| len  | int64  |  
| mode  | int32  |  
###  TaskNewtaskFtraceEvent
Defined in [task.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/task.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| pid  | int32  |  
| comm  | string  |  
| clone_flags  | uint64  |  
| oom_score_adj  | int32  |  
###  TaskRenameFtraceEvent
Defined in [task.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/task.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| pid  | int32  |  
| oldcomm  | string  |  
| newcomm  | string  |  
| oom_score_adj  | int32  |  
###  SchedProcessExecFtraceEvent
Defined in [sched.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/sched.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| filename  | string  |  
| pid  | int32  |  
| old_pid  | int32  |  
###  SchedProcessExitFtraceEvent
Defined in [sched.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/sched.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| comm  | string  |  
| pid  | int32  |  
| tgid  | int32  |  
| prio  | int32  |  
###  SchedProcessForkFtraceEvent
Defined in [sched.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/sched.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| parent_comm  | string  |  
| parent_pid  | int32  |  
| child_comm  | string  |  
| child_pid  | int32  |  
###  SchedProcessFreeFtraceEvent
Defined in [sched.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/sched.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| comm  | string  |  
| pid  | int32  |  
| prio  | int32  |  
###  SchedProcessHangFtraceEvent
Defined in [sched.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/sched.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| comm  | string  |  
| pid  | int32  |  
###  SchedProcessWaitFtraceEvent
Defined in [sched.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/sched.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| comm  | string  |  
| pid  | int32  |  
| prio  | int32  |  
###  F2fsDoSubmitBioFtraceEvent
Defined in [f2fs.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/f2fs.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| btype  | int32  |  
| sync  | uint32  |  
| sector  | uint64  |  
| size  | uint32  |  
###  F2fsEvictInodeFtraceEvent
Defined in [f2fs.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/f2fs.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| pino  | uint64  |  
| mode  | uint32  |  
| size  | int64  |  
| nlink  | uint32  |  
| blocks  | uint64  |  
| advise  | uint32  |  
###  F2fsFallocateFtraceEvent
Defined in [f2fs.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/f2fs.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| mode  | int32  |  
| offset  | int64  |  
| len  | int64  |  
| size  | int64  |  
| blocks  | uint64  |  
| ret  | int32  |  
###  F2fsGetDataBlockFtraceEvent
Defined in [f2fs.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/f2fs.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| iblock  | uint64  |  
| bh_start  | uint64  |  
| bh_size  | uint64  |  
| ret  | int32  |  
###  F2fsGetVictimFtraceEvent
Defined in [f2fs.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/f2fs.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| type  | int32  |  
| gc_type  | int32  |  
| alloc_mode  | int32  |  
| gc_mode  | int32  |  
| victim  | uint32  |  
| ofs_unit  | uint32  |  
| pre_victim  | uint32  |  
| prefree  | uint32  |  
| free  | uint32  |  
| cost  | uint32  |  
###  F2fsIgetFtraceEvent
Defined in [f2fs.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/f2fs.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| pino  | uint64  |  
| mode  | uint32  |  
| size  | int64  |  
| nlink  | uint32  |  
| blocks  | uint64  |  
| advise  | uint32  |  
###  F2fsIgetExitFtraceEvent
Defined in [f2fs.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/f2fs.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| ret  | int32  |  
###  F2fsNewInodeFtraceEvent
Defined in [f2fs.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/f2fs.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| ret  | int32  |  
###  F2fsReadpageFtraceEvent
Defined in [f2fs.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/f2fs.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| index  | uint64  |  
| blkaddr  | uint64  |  
| type  | int32  |  
| dir  | int32  |  
| dirty  | int32  |  
| uptodate  | int32  |  
###  F2fsReserveNewBlockFtraceEvent
Defined in [f2fs.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/f2fs.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| nid  | uint32  |  
| ofs_in_node  | uint32  |  
###  F2fsSetPageDirtyFtraceEvent
Defined in [f2fs.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/f2fs.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| type  | int32  |  
| dir  | int32  |  
| index  | uint64  |  
| dirty  | int32  |  
| uptodate  | int32  |  
###  F2fsSubmitWritePageFtraceEvent
Defined in [f2fs.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/f2fs.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| type  | int32  |  
| index  | uint64  |  
| block  | uint32  |  
###  F2fsSyncFileEnterFtraceEvent
Defined in [f2fs.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/f2fs.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| pino  | uint64  |  
| mode  | uint32  |  
| size  | int64  |  
| nlink  | uint32  |  
| blocks  | uint64  |  
| advise  | uint32  |  
###  F2fsSyncFileExitFtraceEvent
Defined in [f2fs.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/f2fs.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| need_cp  | uint32  |  
| datasync  | int32  |  
| ret  | int32  |  
| cp_reason  | int32  |  
###  F2fsSyncFsFtraceEvent
Defined in [f2fs.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/f2fs.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| dirty  | int32  |  
| wait  | int32  |  
###  F2fsTruncateFtraceEvent
Defined in [f2fs.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/f2fs.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| pino  | uint64  |  
| mode  | uint32  |  
| size  | int64  |  
| nlink  | uint32  |  
| blocks  | uint64  |  
| advise  | uint32  |  
###  F2fsTruncateBlocksEnterFtraceEvent
Defined in [f2fs.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/f2fs.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| size  | int64  |  
| blocks  | uint64  |  
| from  | uint64  |  
###  F2fsTruncateBlocksExitFtraceEvent
Defined in [f2fs.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/f2fs.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| ret  | int32  |  
###  F2fsTruncateDataBlocksRangeFtraceEvent
Defined in [f2fs.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/f2fs.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| nid  | uint32  |  
| ofs  | uint32  |  
| free  | int32  |  
###  F2fsTruncateInodeBlocksEnterFtraceEvent
Defined in [f2fs.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/f2fs.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| size  | int64  |  
| blocks  | uint64  |  
| from  | uint64  |  
###  F2fsTruncateInodeBlocksExitFtraceEvent
Defined in [f2fs.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/f2fs.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| ret  | int32  |  
###  F2fsTruncateNodeFtraceEvent
Defined in [f2fs.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/f2fs.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| nid  | uint32  |  
| blk_addr  | uint32  |  
###  F2fsTruncateNodesEnterFtraceEvent
Defined in [f2fs.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/f2fs.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| nid  | uint32  |  
| blk_addr  | uint32  |  
###  F2fsTruncateNodesExitFtraceEvent
Defined in [f2fs.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/f2fs.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| ret  | int32  |  
###  F2fsTruncatePartialNodesFtraceEvent
Defined in [f2fs.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/f2fs.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| nid  | uint32  |  
| depth  | int32  |  
| err  | int32  |  
###  F2fsUnlinkEnterFtraceEvent
Defined in [f2fs.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/f2fs.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| size  | int64  |  
| blocks  | uint64  |  
| name  | string  |  
###  F2fsUnlinkExitFtraceEvent
Defined in [f2fs.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/f2fs.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| ret  | int32  |  
###  F2fsVmPageMkwriteFtraceEvent
Defined in [f2fs.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/f2fs.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| type  | int32  |  
| dir  | int32  |  
| index  | uint64  |  
| dirty  | int32  |  
| uptodate  | int32  |  
###  F2fsWriteBeginFtraceEvent
Defined in [f2fs.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/f2fs.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| pos  | int64  |  
| len  | uint32  |  
| flags  | uint32  |  
###  F2fsWriteCheckpointFtraceEvent
Defined in [f2fs.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/f2fs.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| is_umount  | uint32  |  
| msg  | string  |  
| reason  | int32  |  
| phase  | uint32  |  
###  F2fsWriteEndFtraceEvent
Defined in [f2fs.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/f2fs.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ino  | uint64  |  
| pos  | int64  |  
| len  | uint32  |  
| copied  | uint32  |  
###  AllocPagesIommuEndFtraceEvent
Defined in [kmem.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kmem.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| gfp_flags  | uint32  |  
| order  | uint32  |  
###  AllocPagesIommuFailFtraceEvent
Defined in [kmem.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kmem.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| gfp_flags  | uint32  |  
| order  | uint32  |  
###  AllocPagesIommuStartFtraceEvent
Defined in [kmem.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kmem.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| gfp_flags  | uint32  |  
| order  | uint32  |  
###  AllocPagesSysEndFtraceEvent
Defined in [kmem.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kmem.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| gfp_flags  | uint32  |  
| order  | uint32  |  
###  AllocPagesSysFailFtraceEvent
Defined in [kmem.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kmem.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| gfp_flags  | uint32  |  
| order  | uint32  |  
###  AllocPagesSysStartFtraceEvent
Defined in [kmem.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kmem.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| gfp_flags  | uint32  |  
| order  | uint32  |  
###  DmaAllocContiguousRetryFtraceEvent
Defined in [kmem.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kmem.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| tries  | int32  |  
###  IommuMapRangeFtraceEvent
Defined in [kmem.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kmem.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| chunk_size  | uint64  |  
| len  | uint64  |  
| pa  | uint64  |  
| va  | uint64  |  
###  IommuSecPtblMapRangeEndFtraceEvent
Defined in [kmem.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kmem.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| len  | uint64  |  
| num  | int32  |  
| pa  | uint32  |  
| sec_id  | int32  |  
| va  | uint64  |  
###  IommuSecPtblMapRangeStartFtraceEvent
Defined in [kmem.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kmem.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| len  | uint64  |  
| num  | int32  |  
| pa  | uint32  |  
| sec_id  | int32  |  
| va  | uint64  |  
###  IonAllocBufferEndFtraceEvent
Defined in [kmem.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kmem.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| client_name  | string  |  
| flags  | uint32  |  
| heap_name  | string  |  
| len  | uint64  |  
| mask  | uint32  |  
###  IonAllocBufferFailFtraceEvent
Defined in [kmem.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kmem.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| client_name  | string  |  
| error  | int64  |  
| flags  | uint32  |  
| heap_name  | string  |  
| len  | uint64  |  
| mask  | uint32  |  
###  IonAllocBufferFallbackFtraceEvent
Defined in [kmem.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kmem.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| client_name  | string  |  
| error  | int64  |  
| flags  | uint32  |  
| heap_name  | string  |  
| len  | uint64  |  
| mask  | uint32  |  
###  IonAllocBufferStartFtraceEvent
Defined in [kmem.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kmem.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| client_name  | string  |  
| flags  | uint32  |  
| heap_name  | string  |  
| len  | uint64  |  
| mask  | uint32  |  
###  IonCpAllocRetryFtraceEvent
Defined in [kmem.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kmem.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| tries  | int32  |  
###  IonCpSecureBufferEndFtraceEvent
Defined in [kmem.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kmem.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| align  | uint64  |  
| flags  | uint64  |  
| heap_name  | string  |  
| len  | uint64  |  
###  IonCpSecureBufferStartFtraceEvent
Defined in [kmem.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kmem.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| align  | uint64  |  
| flags  | uint64  |  
| heap_name  | string  |  
| len  | uint64  |  
###  IonPrefetchingFtraceEvent
Defined in [kmem.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kmem.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| len  | uint64  |  
###  IonSecureCmaAddToPoolEndFtraceEvent
Defined in [kmem.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kmem.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| is_prefetch  | uint32  |  
| len  | uint64  |  
| pool_total  | int32  |  
###  IonSecureCmaAddToPoolStartFtraceEvent
Defined in [kmem.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kmem.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| is_prefetch  | uint32  |  
| len  | uint64  |  
| pool_total  | int32  |  
###  IonSecureCmaAllocateEndFtraceEvent
Defined in [kmem.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kmem.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| align  | uint64  |  
| flags  | uint64  |  
| heap_name  | string  |  
| len  | uint64  |  
###  IonSecureCmaAllocateStartFtraceEvent
Defined in [kmem.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kmem.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| align  | uint64  |  
| flags  | uint64  |  
| heap_name  | string  |  
| len  | uint64  |  
###  IonSecureCmaShrinkPoolEndFtraceEvent
Defined in [kmem.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kmem.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| drained_size  | uint64  |  
| skipped_size  | uint64  |  
###  IonSecureCmaShrinkPoolStartFtraceEvent
Defined in [kmem.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kmem.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| drained_size  | uint64  |  
| skipped_size  | uint64  |  
###  KfreeFtraceEvent
Defined in [kmem.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kmem.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| call_site  | uint64  |  
| ptr  | uint64  |  
###  KmallocFtraceEvent
Defined in [kmem.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kmem.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| bytes_alloc  | uint64  |  
| bytes_req  | uint64  |  
| call_site  | uint64  |  
| gfp_flags  | uint32  |  
| ptr  | uint64  |  
###  KmallocNodeFtraceEvent
Defined in [kmem.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kmem.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| bytes_alloc  | uint64  |  
| bytes_req  | uint64  |  
| call_site  | uint64  |  
| gfp_flags  | uint32  |  
| node  | int32  |  
| ptr  | uint64  |  
###  KmemCacheAllocFtraceEvent
Defined in [kmem.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kmem.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| bytes_alloc  | uint64  |  
| bytes_req  | uint64  |  
| call_site  | uint64  |  
| gfp_flags  | uint32  |  
| ptr  | uint64  |  
###  KmemCacheAllocNodeFtraceEvent
Defined in [kmem.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kmem.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| bytes_alloc  | uint64  |  
| bytes_req  | uint64  |  
| call_site  | uint64  |  
| gfp_flags  | uint32  |  
| node  | int32  |  
| ptr  | uint64  |  
###  KmemCacheFreeFtraceEvent
Defined in [kmem.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kmem.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| call_site  | uint64  |  
| ptr  | uint64  |  
###  MigratePagesEndFtraceEvent
Defined in [kmem.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kmem.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| mode  | int32  |  
###  MigratePagesStartFtraceEvent
Defined in [kmem.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kmem.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| mode  | int32  |  
###  MigrateRetryFtraceEvent
Defined in [kmem.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kmem.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| tries  | int32  |  
###  MmPageAllocFtraceEvent
Defined in [kmem.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kmem.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| gfp_flags  | uint32  |  
| migratetype  | int32  |  
| order  | uint32  |  
| page  | uint64  |  
| pfn  | uint64  |  
###  MmPageAllocExtfragFtraceEvent
Defined in [kmem.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kmem.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| alloc_migratetype  | int32  |  
| alloc_order  | int32  |  
| fallback_migratetype  | int32  |  
| fallback_order  | int32  |  
| page  | uint64  |  
| change_ownership  | int32  |  
| pfn  | uint64  |  
###  MmPageAllocZoneLockedFtraceEvent
Defined in [kmem.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kmem.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| migratetype  | int32  |  
| order  | uint32  |  
| page  | uint64  |  
| pfn  | uint64  |  
###  MmPageFreeFtraceEvent
Defined in [kmem.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kmem.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| order  | uint32  |  
| page  | uint64  |  
| pfn  | uint64  |  
###  MmPageFreeBatchedFtraceEvent
Defined in [kmem.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kmem.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| cold  | int32  |  
| page  | uint64  |  
| pfn  | uint64  |  
###  MmPagePcpuDrainFtraceEvent
Defined in [kmem.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kmem.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| migratetype  | int32  |  
| order  | uint32  |  
| page  | uint64  |  
| pfn  | uint64  |  
###  RssStatFtraceEvent
Defined in [kmem.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kmem.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| member  | int32  |  
| size  | int64  |  
| curr  | uint32  |  
| mm_id  | uint32  |  
###  IonHeapShrinkFtraceEvent
Defined in [kmem.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kmem.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| heap_name  | string  |  
| len  | uint64  |  
| total_allocated  | int64  |  
###  IonHeapGrowFtraceEvent
Defined in [kmem.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kmem.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| heap_name  | string  |  
| len  | uint64  |  
| total_allocated  | int64  |  
###  FenceInitFtraceEvent
Defined in [fence.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/fence.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| context  | uint32  |  
| driver  | string  |  
| seqno  | uint32  |  
| timeline  | string  |  
###  FenceDestroyFtraceEvent
Defined in [fence.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/fence.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| context  | uint32  |  
| driver  | string  |  
| seqno  | uint32  |  
| timeline  | string  |  
###  FenceEnableSignalFtraceEvent
Defined in [fence.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/fence.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| context  | uint32  |  
| driver  | string  |  
| seqno  | uint32  |  
| timeline  | string  |  
###  FenceSignaledFtraceEvent
Defined in [fence.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/fence.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| context  | uint32  |  
| driver  | string  |  
| seqno  | uint32  |  
| timeline  | string  |  
###  ClkEnableFtraceEvent
Defined in [clk.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/clk.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
###  ClkDisableFtraceEvent
Defined in [clk.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/clk.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
###  ClkSetRateFtraceEvent
Defined in [clk.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/clk.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
| rate  | uint64  |  
###  BinderTransactionAllocBufFtraceEvent
Defined in [binder.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/binder.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| data_size  | uint64  |  
| debug_id  | int32  |  
| offsets_size  | uint64  |  
| extra_buffers_size  | uint64  |  
###  SignalDeliverFtraceEvent
Defined in [signal.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/signal.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| code  | int32  |  
| sa_flags  | uint64  |  
| sig  | int32  |  
###  SignalGenerateFtraceEvent
Defined in [signal.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/signal.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| code  | int32  |  
| comm  | string  |  
| group  | int32  |  
| pid  | int32  |  
| result  | int32  |  
| sig  | int32  |  
###  OomScoreAdjUpdateFtraceEvent
Defined in [oom.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/oom.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| comm  | string  |  
| oom_score_adj  | int32  |  
| pid  | int32  |  
###  GenericFtraceEvent
This generic proto is used to output events in the trace when a specific proto for that event does not exist.
Defined in [generic.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/generic.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| event_name  | string  |  
| field  |  
###  GenericFtraceEvent.Field
Defined in [generic.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/generic.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
| str_value  | string  |  
| int_value  | int64  |  
| uint_value  | uint64  |  
###  MmEventRecordFtraceEvent
Defined in [mm_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mm_event.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| avg_lat  | uint32  |  
| count  | uint32  |  
| max_lat  | uint32  |  
| type  | uint32  |  
###  SysEnterFtraceEvent
Defined in [raw_syscalls.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/raw_syscalls.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| id  | int64  |  
| args  | uint64[]  |  
###  SysExitFtraceEvent
Defined in [raw_syscalls.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/raw_syscalls.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| id  | int64  |  
| ret  | int64  |  
###  ZeroFtraceEvent
Defined in [systrace.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/systrace.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| flag  | int32  |  
| name  | string  |  
| pid  | int32  |  
| value  | int64  |  
###  GpuFrequencyFtraceEvent
Defined in [power.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/power.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| gpu_id  | uint32  |  
| state  | uint32  |  
###  SdeTracingMarkWriteFtraceEvent
Defined in [sde.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/sde.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| pid  | int32  |  
| trace_name  | string  |  
| trace_type  | uint32  |  
| value  | int32  |  
| trace_begin  | uint32  |  
###  MarkVictimFtraceEvent
Defined in [oom.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/oom.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| pid  | int32  |  
###  IonStatFtraceEvent
Defined in [ion.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ion.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| buffer_id  | uint32  |  
| len  | int64  |  
| total_allocated  | uint64  |  
###  IonBufferCreateFtraceEvent
Defined in [kmem.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kmem.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| addr  | uint64  |  
| len  | uint64  |  
###  IonBufferDestroyFtraceEvent
Defined in [kmem.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kmem.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| addr  | uint64  |  
| len  | uint64  |  
###  ScmCallStartFtraceEvent
Defined in [scm.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/scm.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| arginfo  | uint32  |  
| x0  | uint64  |  
| x5  | uint64  |  
###  ScmCallEndFtraceEvent
Defined in [scm.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/scm.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
###  GpuMemTotalFtraceEvent
Defined in [gpu_mem.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/gpu_mem.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| gpu_id  | uint32  |  
| pid  | uint32  |  
| size  | uint64  |  
###  ThermalTemperatureFtraceEvent
Defined in [thermal.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/thermal.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| id  | int32  |  
| temp  | int32  |  
| temp_prev  | int32  |  
| thermal_zone  | string  |  
###  CdevUpdateFtraceEvent
Defined in [thermal.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/thermal.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| target  | uint64  |  
| type  | string  |  
###  CpuhpExitFtraceEvent
Defined in [cpuhp.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/cpuhp.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| cpu  | uint32  |  
| idx  | int32  |  
| ret  | int32  |  
| state  | int32  |  
###  CpuhpMultiEnterFtraceEvent
Defined in [cpuhp.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/cpuhp.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| cpu  | uint32  |  
| fun  | uint64  |  
| idx  | int32  |  
| target  | int32  |  
###  CpuhpEnterFtraceEvent
Defined in [cpuhp.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/cpuhp.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| cpu  | uint32  |  
| fun  | uint64  |  
| idx  | int32  |  
| target  | int32  |  
###  CpuhpLatencyFtraceEvent
Defined in [cpuhp.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/cpuhp.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| cpu  | uint32  |  
| ret  | int32  |  
| state  | uint32  |  
| time  | uint64  |  
###  FastrpcDmaStatFtraceEvent
Defined in [fastrpc.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/fastrpc.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| cid  | int32  |  
| len  | int64  |  
| total_allocated  | uint64  |  
###  DpuTracingMarkWriteFtraceEvent
Defined in [dpu.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/dpu.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| pid  | int32  |  
| trace_name  | string  |  
| trace_begin  | uint32  |  
| name  | string  |  
| type  | uint32  |  
| value  | int32  |  
###  G2dTracingMarkWriteFtraceEvent
Defined in [g2d.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/g2d.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| pid  | int32  |  
| name  | string  |  
| type  | uint32  |  
| value  | int32  |  
###  MaliTracingMarkWriteFtraceEvent
Defined in [mali.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mali.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
| pid  | int32  |  
| type  | uint32  |  
| value  | int32  |  
###  DmaHeapStatFtraceEvent
Defined in [dmabuf_heap.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/dmabuf_heap.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| inode  | uint64  |  
| len  | int64  |  
| total_allocated  | uint64  |  
###  CpuhpPauseFtraceEvent
Defined in [cpuhp.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/cpuhp.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| active_cpus  | uint32  |  
| cpus  | uint32  |  
| pause  | uint32  |  
| time  | uint32  |  
###  SchedPiSetprioFtraceEvent
Defined in [sched.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/sched.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| comm  | string  |  
| newprio  | int32  |  
| oldprio  | int32  |  
| pid  | int32  |  
###  SdeSdeEvtlogFtraceEvent
Defined in [sde.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/sde.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| evtlog_tag  | string  |  
| pid  | int32  |  
| tag_id  | uint32  |  
| d00  | uint32  |  
| d01  | uint32  |  
| d02  | uint32  |  
| d03  | uint32  |  
| d04  | uint32  |  
| d05  | uint32  |  
| d06  | uint32  |  
| d07  | uint32  |  
| d08  | uint32  |  
| d09  | uint32  |  
| d10  | uint32  |  
| d11  | uint32  |  
| d12  | uint32  |  
| d13  | uint32  |  
| d14  | uint32  |  
###  SdeSdePerfCalcCrtcFtraceEvent
Defined in [sde.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/sde.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| bw_ctl_ebi  | uint64  |  
| bw_ctl_llcc  | uint64  |  
| bw_ctl_mnoc  | uint64  |  
| core_clk_rate  | uint32  |  
| crtc  | uint32  |  
| ib_ebi  | uint64  |  
| ib_llcc  | uint64  |  
| ib_mnoc  | uint64  |  
###  SdeSdePerfCrtcUpdateFtraceEvent
Defined in [sde.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/sde.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| bw_ctl_ebi  | uint64  |  
| bw_ctl_llcc  | uint64  |  
| bw_ctl_mnoc  | uint64  |  
| core_clk_rate  | uint32  |  
| crtc  | uint32  |  
| params  | int32  |  
| per_pipe_ib_ebi  | uint64  |  
| per_pipe_ib_llcc  | uint64  |  
| per_pipe_ib_mnoc  | uint64  |  
| stop_req  | uint32  |  
| update_bus  | uint32  |  
| update_clk  | uint32  |  
###  SdeSdePerfSetQosLutsFtraceEvent
Defined in [sde.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/sde.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| fl  | uint32  |  
| fmt  | uint32  |  
| lut  | uint64  |  
| lut_usage  | uint32  |  
| pnum  | uint32  |  
| rt  | uint32  |  
###  SdeSdePerfUpdateBusFtraceEvent
Defined in [sde.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/sde.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| ab_quota  | uint64  |  
| bus_id  | uint32  |  
| client  | int32  |  
| ib_quota  | uint64  |  
###  RssStatThrottledFtraceEvent
Defined in [synthetic.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/synthetic.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| curr  | uint32  |  
| member  | int32  |  
| mm_id  | uint32  |  
| size  | int64  |  
###  NetifReceiveSkbFtraceEvent
Defined in [net.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/net.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| len  | uint32  |  
| name  | string  |  
| skbaddr  | uint64  |  
###  NetDevXmitFtraceEvent
Defined in [net.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/net.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| len  | uint32  |  
| name  | string  |  
| rc  | int32  |  
| skbaddr  | uint64  |  
###  InetSockSetStateFtraceEvent
Defined in [sock.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/sock.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| daddr  | uint32  |  
| dport  | uint32  |  
| family  | uint32  |  
| newstate  | int32  |  
| oldstate  | int32  |  
| protocol  | uint32  |  
| saddr  | uint32  |  
| skaddr  | uint64  |  
| sport  | uint32  |  
###  TcpRetransmitSkbFtraceEvent
Defined in [tcp.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/tcp.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| daddr  | uint32  |  
| dport  | uint32  |  
| saddr  | uint32  |  
| skaddr  | uint64  |  
| skbaddr  | uint64  |  
| sport  | uint32  |  
| state  | int32  |  
###  CrosEcSensorhubDataFtraceEvent
Defined in [cros_ec.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/cros_ec.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| current_time  | int64  |  
| current_timestamp  | int64  |  
| delta  | int64  |  
| ec_fifo_timestamp  | uint32  |  
| ec_sensor_num  | uint32  |  
| fifo_timestamp  | int64  |  
###  NapiGroReceiveEntryFtraceEvent
Defined in [net.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/net.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| data_len  | uint32  |  
| gso_size  | uint32  |  
| gso_type  | uint32  |  
| hash  | uint32  |  
| ip_summed  | uint32  |  
| l4_hash  | uint32  |  
| len  | uint32  |  
| mac_header  | int32  |  
| mac_header_valid  | uint32  |  
| name  | string  |  
| napi_id  | uint32  |  
| nr_frags  | uint32  |  
| protocol  | uint32  |  
| queue_mapping  | uint32  |  
| skbaddr  | uint64  |  
| truesize  | uint32  |  
| vlan_proto  | uint32  |  
| vlan_tagged  | uint32  |  
| vlan_tci  | uint32  |  
###  NapiGroReceiveExitFtraceEvent
Defined in [net.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/net.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| ret  | int32  |  
###  KfreeSkbFtraceEvent
Defined in [skb.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/skb.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| location  | uint64  |  
| protocol  | uint32  |  
| skbaddr  | uint64  |  
###  KvmAccessFaultFtraceEvent
Defined in [kvm.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kvm.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| ipa  | uint64  |  
###  KvmAckIrqFtraceEvent
Defined in [kvm.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kvm.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| irqchip  | uint32  |  
| pin  | uint32  |  
###  KvmAgeHvaFtraceEvent
Defined in [kvm.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kvm.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| end  | uint64  |  
| start  | uint64  |  
###  KvmAgePageFtraceEvent
Defined in [kvm.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kvm.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| gfn  | uint64  |  
| hva  | uint64  |  
| level  | uint32  |  
| referenced  | uint32  |  
###  KvmArmClearDebugFtraceEvent
Defined in [kvm.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kvm.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| guest_debug  | uint32  |  
###  KvmArmSetDreg32FtraceEvent
Defined in [kvm.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kvm.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
| value  | uint32  |  
###  KvmArmSetRegsetFtraceEvent
Defined in [kvm.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kvm.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| len  | int32  |  
| name  | string  |  
###  KvmArmSetupDebugFtraceEvent
Defined in [kvm.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kvm.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| guest_debug  | uint32  |  
| vcpu  | uint64  |  
###  KvmEntryFtraceEvent
Defined in [kvm.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kvm.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| vcpu_pc  | uint64  |  
###  KvmExitFtraceEvent
Defined in [kvm.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kvm.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| esr_ec  | uint32  |  
| ret  | int32  |  
| vcpu_pc  | uint64  |  
###  KvmFpuFtraceEvent
Defined in [kvm.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kvm.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| load  | uint32  |  
###  KvmGetTimerMapFtraceEvent
Defined in [kvm.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kvm.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| direct_ptimer  | int32  |  
| direct_vtimer  | int32  |  
| emul_ptimer  | int32  |  
| vcpu_id  | uint64  |  
###  KvmGuestFaultFtraceEvent
Defined in [kvm.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kvm.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| hsr  | uint64  |  
| hxfar  | uint64  |  
| ipa  | uint64  |  
| vcpu_pc  | uint64  |  
###  KvmHandleSysRegFtraceEvent
Defined in [kvm.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kvm.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| hsr  | uint64  |  
###  KvmHvcArm64FtraceEvent
Defined in [kvm.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kvm.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| imm  | uint64  |  
| r0  | uint64  |  
| vcpu_pc  | uint64  |  
###  KvmIrqLineFtraceEvent
Defined in [kvm.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kvm.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| irq_num  | int32  |  
| level  | int32  |  
| type  | uint32  |  
| vcpu_idx  | int32  |  
###  KvmMmioFtraceEvent
Defined in [kvm.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kvm.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| gpa  | uint64  |  
| len  | uint32  |  
| type  | uint32  |  
| val  | uint64  |  
###  KvmMmioEmulateFtraceEvent
Defined in [kvm.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kvm.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| cpsr  | uint64  |  
| instr  | uint64  |  
| vcpu_pc  | uint64  |  
###  KvmSetGuestDebugFtraceEvent
Defined in [kvm.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kvm.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| guest_debug  | uint32  |  
| vcpu  | uint64  |  
###  KvmSetIrqFtraceEvent
Defined in [kvm.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kvm.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| gsi  | uint32  |  
| irq_source_id  | int32  |  
| level  | int32  |  
###  KvmSetSpteHvaFtraceEvent
Defined in [kvm.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kvm.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| hva  | uint64  |  
###  KvmSetWayFlushFtraceEvent
Defined in [kvm.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kvm.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| cache  | uint32  |  
| vcpu_pc  | uint64  |  
###  KvmSysAccessFtraceEvent
Defined in [kvm.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kvm.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| CRm  | uint32  |  
| CRn  | uint32  |  
| Op0  | uint32  |  
| Op1  | uint32  |  
| Op2  | uint32  |  
| is_write  | uint32  |  
| name  | string  |  
| vcpu_pc  | uint64  |  
###  KvmTestAgeHvaFtraceEvent
Defined in [kvm.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kvm.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| hva  | uint64  |  
###  KvmTimerEmulateFtraceEvent
Defined in [kvm.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kvm.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| should_fire  | uint32  |  
| timer_idx  | int32  |  
###  KvmTimerHrtimerExpireFtraceEvent
Defined in [kvm.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kvm.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| timer_idx  | int32  |  
###  KvmTimerRestoreStateFtraceEvent
Defined in [kvm.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kvm.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| ctl  | uint64  |  
| cval  | uint64  |  
| timer_idx  | int32  |  
###  KvmTimerSaveStateFtraceEvent
Defined in [kvm.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kvm.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| ctl  | uint64  |  
| cval  | uint64  |  
| timer_idx  | int32  |  
###  KvmTimerUpdateIrqFtraceEvent
Defined in [kvm.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kvm.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| irq  | uint32  |  
| level  | int32  |  
| vcpu_id  | uint64  |  
###  KvmToggleCacheFtraceEvent
Defined in [kvm.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kvm.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| now  | uint32  |  
| vcpu_pc  | uint64  |  
| was  | uint32  |  
###  KvmUnmapHvaRangeFtraceEvent
Defined in [kvm.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kvm.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| end  | uint64  |  
| start  | uint64  |  
###  KvmUserspaceExitFtraceEvent
Defined in [kvm.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kvm.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| reason  | uint32  |  
###  KvmVcpuWakeupFtraceEvent
Defined in [kvm.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kvm.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| ns  | uint64  |  
| valid  | uint32  |  
| waited  | uint32  |  
###  KvmWfxArm64FtraceEvent
Defined in [kvm.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kvm.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| is_wfe  | uint32  |  
| vcpu_pc  | uint64  |  
###  TrapRegFtraceEvent
Defined in [kvm.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kvm.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| fn  | string  |  
| is_write  | uint32  |  
| reg  | int32  |  
| write_value  | uint64  |  
###  VgicUpdateIrqPendingFtraceEvent
Defined in [kvm.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kvm.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| irq  | uint32  |  
| level  | uint32  |  
| vcpu_id  | uint64  |  
###  WakeupSourceActivateFtraceEvent
Defined in [power.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/power.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
| state  | uint64  |  
###  WakeupSourceDeactivateFtraceEvent
Defined in [power.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/power.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
| state  | uint64  |  
###  UfshcdCommandFtraceEvent
Defined in [ufs.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ufs.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev_name  | string  |  
| doorbell  | uint32  |  
| intr  | uint32  |  
| lba  | uint64  |  
| opcode  | uint32  |  
| str  | string  |  
| tag  | uint32  |  
| transfer_len  | int32  |  
| group_id  | uint32  |  
| str_t  | uint32  |  
###  UfshcdClkGatingFtraceEvent
Defined in [ufs.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ufs.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev_name  | string  |  
| state  | int32  |  
###  ConsoleFtraceEvent
Defined in [printk.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/printk.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| msg  | string  |  
###  DrmVblankEventFtraceEvent
Defined in [drm.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/drm.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| crtc  | int32  |  
| high_prec  | uint32  |  
| seq  | uint32  |  
| time  | int64  |  
###  DrmVblankEventDeliveredFtraceEvent
Defined in [drm.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/drm.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| crtc  | int32  |  
| file  | uint64  |  
| seq  | uint32  |  
###  DrmSchedJobFtraceEvent
Defined in [gpu_scheduler.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/gpu_scheduler.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| entity  | uint64  |  
| fence  | uint64  |  
| hw_job_count  | int32  |  
| id  | uint64  |  
| job_count  | uint32  |  
| name  | string  |  
###  DrmRunJobFtraceEvent
Defined in [gpu_scheduler.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/gpu_scheduler.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| entity  | uint64  |  
| fence  | uint64  |  
| hw_job_count  | int32  |  
| id  | uint64  |  
| job_count  | uint32  |  
| name  | string  |  
###  DrmSchedProcessJobFtraceEvent
Defined in [gpu_scheduler.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/gpu_scheduler.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| fence  | uint64  |  
###  DmaFenceInitFtraceEvent
Defined in [dma_fence.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/dma_fence.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| context  | uint32  |  
| driver  | string  |  
| seqno  | uint32  |  
| timeline  | string  |  
###  DmaFenceEmitFtraceEvent
Defined in [dma_fence.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/dma_fence.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| context  | uint32  |  
| driver  | string  |  
| seqno  | uint32  |  
| timeline  | string  |  
###  DmaFenceSignaledFtraceEvent
Defined in [dma_fence.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/dma_fence.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| context  | uint32  |  
| driver  | string  |  
| seqno  | uint32  |  
| timeline  | string  |  
###  DmaFenceWaitStartFtraceEvent
Defined in [dma_fence.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/dma_fence.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| context  | uint32  |  
| driver  | string  |  
| seqno  | uint32  |  
| timeline  | string  |  
###  DmaFenceWaitEndFtraceEvent
Defined in [dma_fence.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/dma_fence.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| context  | uint32  |  
| driver  | string  |  
| seqno  | uint32  |  
| timeline  | string  |  
###  F2fsIostatFtraceEvent
Defined in [f2fs.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/f2fs.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| app_bio  | uint64  |  
| app_brio  | uint64  |  
| app_dio  | uint64  |  
| app_drio  | uint64  |  
| app_mio  | uint64  |  
| app_mrio  | uint64  |  
| app_rio  | uint64  |  
| app_wio  | uint64  |  
| dev  | uint64  |  
| fs_cdrio  | uint64  |  
| fs_cp_dio  | uint64  |  
| fs_cp_mio  | uint64  |  
| fs_cp_nio  | uint64  |  
| fs_dio  | uint64  |  
| fs_discard  | uint64  |  
| fs_drio  | uint64  |  
| fs_gc_dio  | uint64  |  
| fs_gc_nio  | uint64  |  
| fs_gdrio  | uint64  |  
| fs_mio  | uint64  |  
| fs_mrio  | uint64  |  
| fs_nio  | uint64  |  
| fs_nrio  | uint64  |  
###  F2fsIostatLatencyFtraceEvent
Defined in [f2fs.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/f2fs.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| d_rd_avg  | uint32  |  
| d_rd_cnt  | uint32  |  
| d_rd_peak  | uint32  |  
| d_wr_as_avg  | uint32  |  
| d_wr_as_cnt  | uint32  |  
| d_wr_as_peak  | uint32  |  
| d_wr_s_avg  | uint32  |  
| d_wr_s_cnt  | uint32  |  
| d_wr_s_peak  | uint32  |  
| dev  | uint64  |  
| m_rd_avg  | uint32  |  
| m_rd_cnt  | uint32  |  
| m_rd_peak  | uint32  |  
| m_wr_as_avg  | uint32  |  
| m_wr_as_cnt  | uint32  |  
| m_wr_as_peak  | uint32  |  
| m_wr_s_avg  | uint32  |  
| m_wr_s_cnt  | uint32  |  
| m_wr_s_peak  | uint32  |  
| n_rd_avg  | uint32  |  
| n_rd_cnt  | uint32  |  
| n_rd_peak  | uint32  |  
| n_wr_as_avg  | uint32  |  
| n_wr_as_cnt  | uint32  |  
| n_wr_as_peak  | uint32  |  
| n_wr_s_avg  | uint32  |  
| n_wr_s_cnt  | uint32  |  
| n_wr_s_peak  | uint32  |  
###  SchedCpuUtilCfsFtraceEvent
Defined in [sched.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/sched.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| active  | int32  |  
| capacity  | uint64  |  
| capacity_orig  | uint64  |  
| cpu  | uint32  |  
| cpu_importance  | uint64  |  
| cpu_util  | uint64  |  
| exit_lat  | uint32  |  
| group_capacity  | uint64  |  
| grp_overutilized  | uint32  |  
| idle_cpu  | uint32  |  
| nr_running  | uint32  |  
| spare_cap  | int64  |  
| task_fits  | uint32  |  
| wake_group_util  | uint64  |  
| wake_util  | uint64  |  
###  V4l2QbufFtraceEvent
Defined in [v4l2.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/v4l2.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| bytesused  | uint32  |  
| field  | uint32  |  
| flags  | uint32  |  
| index  | uint32  |  
| minor  | int32  |  
| sequence  | uint32  |  
| timecode_flags  | uint32  |  
| timecode_frames  | uint32  |  
| timecode_hours  | uint32  |  
| timecode_minutes  | uint32  |  
| timecode_seconds  | uint32  |  
| timecode_type  | uint32  |  
| timecode_userbits0  | uint32  |  
| timecode_userbits1  | uint32  |  
| timecode_userbits2  | uint32  |  
| timecode_userbits3  | uint32  |  
| timestamp  | int64  |  
| type  | uint32  |  
###  V4l2DqbufFtraceEvent
Defined in [v4l2.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/v4l2.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| bytesused  | uint32  |  
| field  | uint32  |  
| flags  | uint32  |  
| index  | uint32  |  
| minor  | int32  |  
| sequence  | uint32  |  
| timecode_flags  | uint32  |  
| timecode_frames  | uint32  |  
| timecode_hours  | uint32  |  
| timecode_minutes  | uint32  |  
| timecode_seconds  | uint32  |  
| timecode_type  | uint32  |  
| timecode_userbits0  | uint32  |  
| timecode_userbits1  | uint32  |  
| timecode_userbits2  | uint32  |  
| timecode_userbits3  | uint32  |  
| timestamp  | int64  |  
| type  | uint32  |  
###  Vb2V4l2BufQueueFtraceEvent
Defined in [v4l2.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/v4l2.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| field  | uint32  |  
| flags  | uint32  |  
| minor  | int32  |  
| sequence  | uint32  |  
| timecode_flags  | uint32  |  
| timecode_frames  | uint32  |  
| timecode_hours  | uint32  |  
| timecode_minutes  | uint32  |  
| timecode_seconds  | uint32  |  
| timecode_type  | uint32  |  
| timecode_userbits0  | uint32  |  
| timecode_userbits1  | uint32  |  
| timecode_userbits2  | uint32  |  
| timecode_userbits3  | uint32  |  
| timestamp  | int64  |  
###  Vb2V4l2BufDoneFtraceEvent
Defined in [v4l2.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/v4l2.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| field  | uint32  |  
| flags  | uint32  |  
| minor  | int32  |  
| sequence  | uint32  |  
| timecode_flags  | uint32  |  
| timecode_frames  | uint32  |  
| timecode_hours  | uint32  |  
| timecode_minutes  | uint32  |  
| timecode_seconds  | uint32  |  
| timecode_type  | uint32  |  
| timecode_userbits0  | uint32  |  
| timecode_userbits1  | uint32  |  
| timecode_userbits2  | uint32  |  
| timecode_userbits3  | uint32  |  
| timestamp  | int64  |  
###  Vb2V4l2QbufFtraceEvent
Defined in [v4l2.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/v4l2.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| field  | uint32  |  
| flags  | uint32  |  
| minor  | int32  |  
| sequence  | uint32  |  
| timecode_flags  | uint32  |  
| timecode_frames  | uint32  |  
| timecode_hours  | uint32  |  
| timecode_minutes  | uint32  |  
| timecode_seconds  | uint32  |  
| timecode_type  | uint32  |  
| timecode_userbits0  | uint32  |  
| timecode_userbits1  | uint32  |  
| timecode_userbits2  | uint32  |  
| timecode_userbits3  | uint32  |  
| timestamp  | int64  |  
###  Vb2V4l2DqbufFtraceEvent
Defined in [v4l2.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/v4l2.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| field  | uint32  |  
| flags  | uint32  |  
| minor  | int32  |  
| sequence  | uint32  |  
| timecode_flags  | uint32  |  
| timecode_frames  | uint32  |  
| timecode_hours  | uint32  |  
| timecode_minutes  | uint32  |  
| timecode_seconds  | uint32  |  
| timecode_type  | uint32  |  
| timecode_userbits0  | uint32  |  
| timecode_userbits1  | uint32  |  
| timecode_userbits2  | uint32  |  
| timecode_userbits3  | uint32  |  
| timestamp  | int64  |  
###  DsiCmdFifoStatusFtraceEvent
Defined in [panel.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/panel.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| header  | uint32  |  
| payload  | uint32  |  
###  DsiRxFtraceEvent
Defined in [panel.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/panel.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| cmd  | uint32  |  
| rx_buf  | bytes  |  
###  DsiTxFtraceEvent
Defined in [panel.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/panel.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| last  | uint32  |  
| type  | uint32  |  
| tx_buf  | bytes  |  
###  AndroidFsDatareadEndFtraceEvent
Defined in [android_fs.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/android_fs.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| bytes  | int32  |  
| ino  | uint64  |  
| offset  | int64  |  
###  AndroidFsDatareadStartFtraceEvent
Defined in [android_fs.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/android_fs.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| bytes  | int32  |  
| cmdline  | string  |  
| i_size  | int64  |  
| ino  | uint64  |  
| offset  | int64  |  
| pathbuf  | string  |  
| pid  | int32  |  
###  AndroidFsDatawriteEndFtraceEvent
Defined in [android_fs.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/android_fs.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| bytes  | int32  |  
| ino  | uint64  |  
| offset  | int64  |  
###  AndroidFsDatawriteStartFtraceEvent
Defined in [android_fs.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/android_fs.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| bytes  | int32  |  
| cmdline  | string  |  
| i_size  | int64  |  
| ino  | uint64  |  
| offset  | int64  |  
| pathbuf  | string  |  
| pid  | int32  |  
###  AndroidFsFsyncEndFtraceEvent
Defined in [android_fs.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/android_fs.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| bytes  | int32  |  
| ino  | uint64  |  
| offset  | int64  |  
###  AndroidFsFsyncStartFtraceEvent
Defined in [android_fs.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/android_fs.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| cmdline  | string  |  
| i_size  | int64  |  
| ino  | uint64  |  
| pathbuf  | string  |  
| pid  | int32  |  
###  FuncgraphEntryFtraceEvent
Defined in [ftrace.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ftrace.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| depth  | int32  |  
| func  | uint64  |  
###  FuncgraphExitFtraceEvent
Defined in [ftrace.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ftrace.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| calltime  | uint64  |  
| depth  | int32  |  
| func  | uint64  |  
| overrun  | uint64  |  
| rettime  | uint64  |  
###  VirtioVideoCmdFtraceEvent
Defined in [virtio_video.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/virtio_video.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| stream_id  | uint32  |  
| type  | uint32  |  
###  VirtioVideoCmdDoneFtraceEvent
Defined in [virtio_video.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/virtio_video.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| stream_id  | uint32  |  
| type  | uint32  |  
###  VirtioVideoResourceQueueFtraceEvent
Defined in [virtio_video.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/virtio_video.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| data_size0  | uint32  |  
| data_size1  | uint32  |  
| data_size2  | uint32  |  
| data_size3  | uint32  |  
| queue_type  | uint32  |  
| resource_id  | int32  |  
| stream_id  | int32  |  
| timestamp  | uint64  |  
###  VirtioVideoResourceQueueDoneFtraceEvent
Defined in [virtio_video.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/virtio_video.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| data_size0  | uint32  |  
| data_size1  | uint32  |  
| data_size2  | uint32  |  
| data_size3  | uint32  |  
| queue_type  | uint32  |  
| resource_id  | int32  |  
| stream_id  | int32  |  
| timestamp  | uint64  |  
###  MmShrinkSlabStartFtraceEvent
Defined in [vmscan.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/vmscan.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| cache_items  | uint64  |  
| delta  | uint64  |  
| gfp_flags  | uint32  |  
| lru_pgs  | uint64  |  
| nr_objects_to_shrink  | int64  |  
| pgs_scanned  | uint64  |  
| shr  | uint64  |  
| shrink  | uint64  |  
| total_scan  | uint64  |  
| nid  | int32  |  
| priority  | int32  |  
###  MmShrinkSlabEndFtraceEvent
Defined in [vmscan.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/vmscan.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| new_scan  | int64  |  
| retval  | int32  |  
| shr  | uint64  |  
| shrink  | uint64  |  
| total_scan  | int64  |  
| unused_scan  | int64  |  
| nid  | int32  |  
###  TrustySmcFtraceEvent
Defined in [trusty.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/trusty.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| r0  | uint64  |  
| r1  | uint64  |  
| r2  | uint64  |  
| r3  | uint64  |  
###  TrustySmcDoneFtraceEvent
Defined in [trusty.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/trusty.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| ret  | uint64  |  
###  TrustyStdCall32FtraceEvent
Defined in [trusty.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/trusty.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| r0  | uint64  |  
| r1  | uint64  |  
| r2  | uint64  |  
| r3  | uint64  |  
###  TrustyStdCall32DoneFtraceEvent
Defined in [trusty.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/trusty.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| ret  | int64  |  
###  TrustyShareMemoryFtraceEvent
Defined in [trusty.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/trusty.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| len  | uint64  |  
| lend  | uint32  |  
| nents  | uint32  |  
###  TrustyShareMemoryDoneFtraceEvent
Defined in [trusty.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/trusty.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| handle  | uint64  |  
| len  | uint64  |  
| lend  | uint32  |  
| nents  | uint32  |  
| ret  | int32  |  
###  TrustyReclaimMemoryFtraceEvent
Defined in [trusty.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/trusty.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| id  | uint64  |  
###  TrustyReclaimMemoryDoneFtraceEvent
Defined in [trusty.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/trusty.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| id  | uint64  |  
| ret  | int32  |  
###  TrustyIrqFtraceEvent
Defined in [trusty.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/trusty.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| irq  | int32  |  
###  TrustyIpcHandleEventFtraceEvent
Defined in [trusty.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/trusty.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| chan  | uint32  |  
| event_id  | uint32  |  
| srv_name  | string  |  
###  TrustyIpcConnectFtraceEvent
Defined in [trusty.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/trusty.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| chan  | uint32  |  
| port  | string  |  
| state  | int32  |  
###  TrustyIpcConnectEndFtraceEvent
Defined in [trusty.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/trusty.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| chan  | uint32  |  
| err  | int32  |  
| state  | int32  |  
###  TrustyIpcWriteFtraceEvent
Defined in [trusty.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/trusty.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| buf_id  | uint64  |  
| chan  | uint32  |  
| kind_shm  | int32  |  
| len_or_err  | int32  |  
| shm_cnt  | uint64  |  
| srv_name  | string  |  
###  TrustyIpcPollFtraceEvent
Defined in [trusty.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/trusty.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| chan  | uint32  |  
| poll_mask  | uint32  |  
| srv_name  | string  |  
###  TrustyIpcReadFtraceEvent
Defined in [trusty.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/trusty.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| chan  | uint32  |  
| srv_name  | string  |  
###  TrustyIpcReadEndFtraceEvent
Defined in [trusty.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/trusty.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| buf_id  | uint64  |  
| chan  | uint32  |  
| len_or_err  | int32  |  
| shm_cnt  | uint64  |  
| srv_name  | string  |  
###  TrustyIpcRxFtraceEvent
Defined in [trusty.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/trusty.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| buf_id  | uint64  |  
| chan  | uint32  |  
| srv_name  | string  |  
###  TrustyEnqueueNopFtraceEvent
Defined in [trusty.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/trusty.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| arg1  | uint32  |  
| arg2  | uint32  |  
| arg3  | uint32  |  
###  CmaAllocStartFtraceEvent
Defined in [cma.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/cma.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| align  | uint32  |  
| count  | uint32  |  
| name  | string  |  
###  CmaAllocInfoFtraceEvent
Defined in [cma.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/cma.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| align  | uint32  |  
| count  | uint32  |  
| err_iso  | uint32  |  
| err_mig  | uint32  |  
| err_test  | uint32  |  
| name  | string  |  
| nr_mapped  | uint64  |  
| nr_migrated  | uint64  |  
| nr_reclaimed  | uint64  |  
| pfn  | uint64  |  
###  LwisTracingMarkWriteFtraceEvent
Defined in [lwis.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/lwis.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| lwis_name  | string  |  
| type  | uint32  |  
| pid  | int32  |  
| func_name  | string  |  
| value  | int64  |  
###  VirtioGpuCmdQueueFtraceEvent
Defined in [virtio_gpu.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/virtio_gpu.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| ctx_id  | uint32  |  
| dev  | int32  |  
| fence_id  | uint64  |  
| flags  | uint32  |  
| name  | string  |  
| num_free  | uint32  |  
| seqno  | uint32  |  
| type  | uint32  |  
| vq  | uint32  |  
###  VirtioGpuCmdResponseFtraceEvent
Defined in [virtio_gpu.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/virtio_gpu.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| ctx_id  | uint32  |  
| dev  | int32  |  
| fence_id  | uint64  |  
| flags  | uint32  |  
| name  | string  |  
| num_free  | uint32  |  
| seqno  | uint32  |  
| type  | uint32  |  
| vq  | uint32  |  
###  MaliMaliKCPUCQSSETFtraceEvent
Defined in [mali.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mali.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| id  | uint32  |  
| info_val1  | uint64  |  
| info_val2  | uint64  |  
| kctx_id  | uint32  |  
| kctx_tgid  | int32  |  
###  MaliMaliKCPUCQSWAITSTARTFtraceEvent
Defined in [mali.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mali.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| id  | uint32  |  
| info_val1  | uint64  |  
| info_val2  | uint64  |  
| kctx_id  | uint32  |  
| kctx_tgid  | int32  |  
###  MaliMaliKCPUCQSWAITENDFtraceEvent
Defined in [mali.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mali.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| id  | uint32  |  
| info_val1  | uint64  |  
| info_val2  | uint64  |  
| kctx_id  | uint32  |  
| kctx_tgid  | int32  |  
###  MaliMaliKCPUFENCESIGNALFtraceEvent
Defined in [mali.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mali.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| info_val1  | uint64  |  
| info_val2  | uint64  |  
| kctx_tgid  | int32  |  
| kctx_id  | uint32  |  
| id  | uint32  |  
###  MaliMaliKCPUFENCEWAITSTARTFtraceEvent
Defined in [mali.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mali.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| info_val1  | uint64  |  
| info_val2  | uint64  |  
| kctx_tgid  | int32  |  
| kctx_id  | uint32  |  
| id  | uint32  |  
###  MaliMaliKCPUFENCEWAITENDFtraceEvent
Defined in [mali.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mali.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| info_val1  | uint64  |  
| info_val2  | uint64  |  
| kctx_tgid  | int32  |  
| kctx_id  | uint32  |  
| id  | uint32  |  
###  HypEnterFtraceEvent
Defined in [hyp.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/hyp.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
###  HypExitFtraceEvent
Defined in [hyp.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/hyp.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
###  HostHcallFtraceEvent
Defined in [hyp.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/hyp.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| id  | uint32  |  
| invalid  | uint32  |  
###  HostSmcFtraceEvent
Defined in [hyp.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/hyp.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| id  | uint64  |  
| forwarded  | uint32  |  
###  HostMemAbortFtraceEvent
Defined in [hyp.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/hyp.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| esr  | uint64  |  
| addr  | uint64  |  
###  SuspendResumeMinimalFtraceEvent
Defined in [synthetic.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/synthetic.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| start  | uint32  |  
###  MaliMaliCSFINTERRUPTSTARTFtraceEvent
Defined in [mali.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mali.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| kctx_tgid  | int32  |  
| kctx_id  | uint32  |  
| info_val  | uint64  |  
###  MaliMaliCSFINTERRUPTENDFtraceEvent
Defined in [mali.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mali.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| kctx_tgid  | int32  |  
| kctx_id  | uint32  |  
| info_val  | uint64  |  
###  SamsungTracingMarkWriteFtraceEvent
Defined in [samsung.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/samsung.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| pid  | int32  |  
| trace_name  | string  |  
| trace_begin  | uint32  |  
| trace_type  | uint32  |  
| value  | int32  |  
###  BinderCommandFtraceEvent
Defined in [binder.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/binder.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| cmd  | uint32  |  
###  BinderReturnFtraceEvent
Defined in [binder.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/binder.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| cmd  | uint32  |  
###  SchedSwitchWithCtrsFtraceEvent
Defined in [perf_trace_counters.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/perf_trace_counters.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| old_pid  | int32  |  
| new_pid  | int32  |  
| cctr  | uint64  |  
| ctr0  | uint64  |  
| ctr1  | uint64  |  
| ctr2  | uint64  |  
| ctr3  | uint64  |  
| lctr0  | uint32  |  
| lctr1  | uint32  |  
| ctr4  | uint64  |  
| ctr5  | uint64  |  
| prev_comm  | string  |  
| prev_pid  | int32  |  
| cyc  | uint32  |  
| inst  | uint32  |  
| stallbm  | uint32  |  
| l3dm  | uint32  |  
| next_pid  | int32  |  
| next_comm  | string  |  
| prev_state  | int64  |  
| amu0  | uint64  |  
| amu1  | uint64  |  
| amu2  | uint64  |  
###  GpuWorkPeriodFtraceEvent
Defined in [power.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/power.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| gpu_id  | uint32  |  
| uid  | uint32  |  
| start_time_ns  | uint64  |  
| end_time_ns  | uint64  |  
| total_active_duration_ns  | uint64  |  
###  RpmStatusFtraceEvent
Defined in [rpm.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/rpm.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
| status  | int32  |  
###  PanelWriteGenericFtraceEvent
Defined in [panel.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/panel.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| pid  | int32  |  
| trace_name  | string  |  
| trace_begin  | uint32  |  
| name  | string  |  
| type  | uint32  |  
| value  | int32  |  
###  SchedMigrateTaskFtraceEvent
Defined in [sched.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/sched.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| comm  | string  |  
| pid  | int32  |  
| prio  | int32  |  
| orig_cpu  | int32  |  
| dest_cpu  | int32  |  
| running  | int32  |  
| load  | uint32  |  
###  DpuDsiCmdFifoStatusFtraceEvent
Defined in [dpu.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/dpu.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| header  | uint32  |  
| payload  | uint32  |  
###  DpuDsiRxFtraceEvent
Defined in [dpu.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/dpu.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| cmd  | uint32  |  
| rx_buf  | bytes  |  
###  DpuDsiTxFtraceEvent
Defined in [dpu.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/dpu.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| type  | uint32  |  
| last  | uint32  |  
| delay_ms  | uint32  |  
| tx_buf  | bytes  |  
###  F2fsBackgroundGcFtraceEvent
Defined in [f2fs.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/f2fs.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| wait_ms  | uint32  |  
| prefree  | uint32  |  
| free  | uint32  |  
###  F2fsGcBeginFtraceEvent
Defined in [f2fs.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/f2fs.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| sync  | uint32  |  
| background  | uint32  |  
| dirty_nodes  | int64  |  
| dirty_dents  | int64  |  
| dirty_imeta  | int64  |  
| free_sec  | uint32  |  
| free_seg  | uint32  |  
| reserved_seg  | int32  |  
| prefree_seg  | uint32  |  
| gc_type  | int32  |  
| no_bg_gc  | uint32  |  
| nr_free_secs  | uint32  |  
###  F2fsGcEndFtraceEvent
Defined in [f2fs.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/f2fs.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| ret  | int32  |  
| seg_freed  | int32  |  
| sec_freed  | int32  |  
| dirty_nodes  | int64  |  
| dirty_dents  | int64  |  
| dirty_imeta  | int64  |  
| free_sec  | uint32  |  
| free_seg  | uint32  |  
| reserved_seg  | int32  |  
| prefree_seg  | uint32  |  
###  FastrpcDmaFreeFtraceEvent
Defined in [fastrpc.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/fastrpc.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| cid  | int32  |  
| phys  | uint64  |  
| size  | uint64  |  
###  FastrpcDmaAllocFtraceEvent
Defined in [fastrpc.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/fastrpc.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| cid  | int32  |  
| phys  | uint64  |  
| size  | uint64  |  
| attr  | uint64  |  
| mflags  | int32  |  
###  FastrpcDmaUnmapFtraceEvent
Defined in [fastrpc.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/fastrpc.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| cid  | int32  |  
| phys  | uint64  |  
| size  | uint64  |  
###  FastrpcDmaMapFtraceEvent
Defined in [fastrpc.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/fastrpc.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| cid  | int32  |  
| fd  | int32  |  
| phys  | uint64  |  
| size  | uint64  |  
| len  | uint64  |  
| attr  | uint32  |  
| mflags  | int32  |  
###  GoogleIccEventFtraceEvent
Defined in [google_icc_trace.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/google_icc_trace.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| event  | string  |  
| timestamp  | uint64  |  
###  GoogleIrmEventFtraceEvent
Defined in [google_irm_trace.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/google_irm_trace.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| event  | string  |  
| timestamp  | uint64  |  
###  DevicePmCallbackStartFtraceEvent
Defined in [power.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/power.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| device  | string  |  
| driver  | string  |  
| parent  | string  |  
| pm_ops  | string  |  
| event  | int32  |  
###  DevicePmCallbackEndFtraceEvent
Defined in [power.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/power.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| device  | string  |  
| driver  | string  |  
| error  | int32  |  
###  ThermalExynosAcpmBulkFtraceEvent
Defined in [thermal_exynos.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/thermal_exynos.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| tz_id  | uint32  |  
| current_temp  | uint32  |  
| ctrl_temp  | uint32  |  
| cdev_state  | uint32  |  
| pid_et_p  | int32  |  
| pid_power_range  | int32  |  
| pid_p  | int32  |  
| pid_i  | int32  |  
| k_p  | int32  |  
| k_i  | int32  |  
| timestamp  | uint64  |  
###  ThermalExynosAcpmHighOverheadFtraceEvent
Defined in [thermal_exynos.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/thermal_exynos.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| tz_id  | int32  |  
| current_temp  | uint32  |  
| ctrl_temp  | uint32  |  
| cdev_state  | uint32  |  
| pid_et_p  | int32  |  
| k_p  | int32  |  
| k_i  | int32  |  
###  DcvshFreqFtraceEvent
Defined in [dcvsh.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/dcvsh.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| cpu  | uint64  |  
| freq  | uint64  |  
###  KgslGpuFrequencyFtraceEvent
Defined in [kgsl.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kgsl.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| gpu_freq  | uint32  |  
| gpu_id  | uint32  |  
###  MaliMaliPMMCUHCTLCORESDOWNSCALENOTIFYPENDFtraceEvent
Defined in [mali.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mali.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| kctx_tgid  | int32  |  
| kctx_id  | uint32  |  
| info_val  | uint64  |  
###  MaliMaliPMMCUHCTLCORESNOTIFYPENDFtraceEvent
Defined in [mali.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mali.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| kctx_tgid  | int32  |  
| kctx_id  | uint32  |  
| info_val  | uint64  |  
###  MaliMaliPMMCUHCTLCOREINACTIVEPENDFtraceEvent
Defined in [mali.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mali.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| kctx_tgid  | int32  |  
| kctx_id  | uint32  |  
| info_val  | uint64  |  
###  MaliMaliPMMCUHCTLMCUONRECHECKFtraceEvent
Defined in [mali.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mali.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| kctx_tgid  | int32  |  
| kctx_id  | uint32  |  
| info_val  | uint64  |  
###  MaliMaliPMMCUHCTLSHADERSCOREOFFPENDFtraceEvent
Defined in [mali.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mali.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| kctx_tgid  | int32  |  
| kctx_id  | uint32  |  
| info_val  | uint64  |  
###  MaliMaliPMMCUHCTLSHADERSPENDOFFFtraceEvent
Defined in [mali.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mali.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| kctx_tgid  | int32  |  
| kctx_id  | uint32  |  
| info_val  | uint64  |  
###  MaliMaliPMMCUHCTLSHADERSPENDONFtraceEvent
Defined in [mali.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mali.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| kctx_tgid  | int32  |  
| kctx_id  | uint32  |  
| info_val  | uint64  |  
###  MaliMaliPMMCUHCTLSHADERSREADYOFFFtraceEvent
Defined in [mali.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mali.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| kctx_tgid  | int32  |  
| kctx_id  | uint32  |  
| info_val  | uint64  |  
###  MaliMaliPMMCUINSLEEPFtraceEvent
Defined in [mali.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mali.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| kctx_tgid  | int32  |  
| kctx_id  | uint32  |  
| info_val  | uint64  |  
###  MaliMaliPMMCUOFFFtraceEvent
Defined in [mali.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mali.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| kctx_tgid  | int32  |  
| kctx_id  | uint32  |  
| info_val  | uint64  |  
###  MaliMaliPMMCUONFtraceEvent
Defined in [mali.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mali.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| kctx_tgid  | int32  |  
| kctx_id  | uint32  |  
| info_val  | uint64  |  
###  MaliMaliPMMCUONCOREATTRUPDATEPENDFtraceEvent
Defined in [mali.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mali.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| kctx_tgid  | int32  |  
| kctx_id  | uint32  |  
| info_val  | uint64  |  
###  MaliMaliPMMCUONGLBREINITPENDFtraceEvent
Defined in [mali.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mali.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| kctx_tgid  | int32  |  
| kctx_id  | uint32  |  
| info_val  | uint64  |  
###  MaliMaliPMMCUONHALTFtraceEvent
Defined in [mali.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mali.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| kctx_tgid  | int32  |  
| kctx_id  | uint32  |  
| info_val  | uint64  |  
###  MaliMaliPMMCUONHWCNTDISABLEFtraceEvent
Defined in [mali.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mali.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| kctx_tgid  | int32  |  
| kctx_id  | uint32  |  
| info_val  | uint64  |  
###  MaliMaliPMMCUONHWCNTENABLEFtraceEvent
Defined in [mali.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mali.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| kctx_tgid  | int32  |  
| kctx_id  | uint32  |  
| info_val  | uint64  |  
###  MaliMaliPMMCUONPENDHALTFtraceEvent
Defined in [mali.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mali.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| kctx_tgid  | int32  |  
| kctx_id  | uint32  |  
| info_val  | uint64  |  
###  MaliMaliPMMCUONPENDSLEEPFtraceEvent
Defined in [mali.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mali.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| kctx_tgid  | int32  |  
| kctx_id  | uint32  |  
| info_val  | uint64  |  
###  MaliMaliPMMCUONSLEEPINITIATEFtraceEvent
Defined in [mali.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mali.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| kctx_tgid  | int32  |  
| kctx_id  | uint32  |  
| info_val  | uint64  |  
###  MaliMaliPMMCUPENDOFFFtraceEvent
Defined in [mali.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mali.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| kctx_tgid  | int32  |  
| kctx_id  | uint32  |  
| info_val  | uint64  |  
###  MaliMaliPMMCUPENDONRELOADFtraceEvent
Defined in [mali.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mali.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| kctx_tgid  | int32  |  
| kctx_id  | uint32  |  
| info_val  | uint64  |  
###  MaliMaliPMMCUPOWERDOWNFtraceEvent
Defined in [mali.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mali.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| kctx_tgid  | int32  |  
| kctx_id  | uint32  |  
| info_val  | uint64  |  
###  MaliMaliPMMCURESETWAITFtraceEvent
Defined in [mali.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mali.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| kctx_tgid  | int32  |  
| kctx_id  | uint32  |  
| info_val  | uint64  |  
###  BclIrqTriggerFtraceEvent
Defined in [bcl_exynos.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/bcl_exynos.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| id  | int32  |  
| throttle  | int32  |  
| cpu0_limit  | int32  |  
| cpu1_limit  | int32  |  
| cpu2_limit  | int32  |  
| tpu_limit  | int32  |  
| gpu_limit  | int32  |  
| voltage  | int32  |  
| capacity  | int32  |  
###  KgslAdrenoCmdbatchQueuedFtraceEvent
Defined in [kgsl.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kgsl.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| id  | uint32  |  
| timestamp  | uint32  |  
| queued  | uint32  |  
| flags  | uint32  |  
| prio  | uint32  |  
###  KgslAdrenoCmdbatchSubmittedFtraceEvent
Defined in [kgsl.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kgsl.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| id  | uint32  |  
| timestamp  | uint32  |  
| inflight  | int64  |  
| flags  | uint32  |  
| ticks  | uint64  |  
| secs  | uint64  |  
| usecs  | uint64  |  
| prio  | int32  |  
| rb_id  | int32  |  
| rptr  | uint32  |  
| wptr  | uint32  |  
| q_inflight  | int32  |  
| dispatch_queue  | int32  |  
###  KgslAdrenoCmdbatchSyncFtraceEvent
Defined in [kgsl.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kgsl.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| id  | uint32  |  
| timestamp  | uint32  |  
| ticks  | uint64  |  
| prio  | int32  |  
###  KgslAdrenoCmdbatchRetiredFtraceEvent
Defined in [kgsl.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kgsl.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| id  | uint32  |  
| timestamp  | uint32  |  
| inflight  | int64  |  
| recovery  | uint32  |  
| flags  | uint32  |  
| start  | uint64  |  
| retire  | uint64  |  
| prio  | int32  |  
| rb_id  | int32  |  
| rptr  | uint32  |  
| wptr  | uint32  |  
| q_inflight  | int32  |  
| fault_recovery  | uint64  |  
| dispatch_queue  | uint32  |  
| submitted_to_rb  | uint64  |  
| retired_on_gmu  | uint64  |  
| active  | uint64  |  
###  PixelMmKswapdWakeFtraceEvent
Defined in [pixel_mm.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/pixel_mm.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| whatever  | int32  |  
###  PixelMmKswapdDoneFtraceEvent
Defined in [pixel_mm.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/pixel_mm.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| delta_nr_scanned  | uint64  |  
| delta_nr_reclaimed  | uint64  |  
| delta_nr_allocated  | uint64  |  
| duration_ns  | uint64  |  
###  SchedWakeupTaskAttrFtraceEvent
Defined in [sched.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/sched.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| pid  | int32  |  
| cpu_affinity  | uint64  |  
| task_util  | uint64  |  
| uclamp_min  | uint64  |  
| vruntime  | uint64  |  
| sched_qos_user_defined_flag  | uint64  |  
| rampup_multiplier  | uint32  |  
| effect_rampup_multiplier  | uint32  |  
| tag_nice  | int32  |  
###  DevfreqFrequencyFtraceEvent
Defined in [devfreq.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/devfreq.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev_name  | string  |  
| freq  | uint64  |  
| prev_freq  | uint64  |  
| busy_time  | uint64  |  
| total_time  | uint64  |  
###  KprobeEvent
Defined in [generic.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/generic.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
| type  |  
###  KprobeEvent.KprobeType
Defined in [generic.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/generic.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| KPROBE_TYPE_UNKNOWN  | 0  |  
| KPROBE_TYPE_BEGIN  | 1  |  
| KPROBE_TYPE_END  | 2  |  
| KPROBE_TYPE_INSTANT  | 3  |  
###  ParamSetValueCpmFtraceEvent
Defined in [cpm_trace.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/cpm_trace.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| body  | string  |  
| value  | uint32  |  
| timestamp  | int64  |  
###  DoSysOpenFtraceEvent
Defined in [fs.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/fs.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| filename  | string  |  
| flags  | int32  |  
| mode  | int32  |  
###  OpenExecFtraceEvent
Defined in [fs.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/fs.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| filename  | string  |  
###  BlockIoStartFtraceEvent
Defined in [block.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/block.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| sector  | uint64  |  
| nr_sector  | uint32  |  
| bytes  | uint32  |  
| ioprio  | uint32  |  
| rwbs  | string  |  
| comm  | string  |  
| cmd  | string  |  
###  BlockIoDoneFtraceEvent
Defined in [block.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/block.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| sector  | uint64  |  
| nr_sector  | uint32  |  
| bytes  | uint32  |  
| ioprio  | uint32  |  
| rwbs  | string  |  
| comm  | string  |  
| cmd  | string  |  
###  MaliGpuPowerStateFtraceEvent
Defined in [mali.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/mali.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| change_ns  | uint64  |  
| from_state  | int32  |  
| to_state  | int32  |  
###  DpuDispDpuUnderrunFtraceEvent
Defined in [dpu.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/dpu.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| id  | int32  |  
| frames_pending  | int32  |  
| vsync_count  | int32  |  
###  DpuDispVblankIrqEnableFtraceEvent
Defined in [dpu.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/dpu.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| id  | int32  |  
| output_id  | int32  |  
| enable  | int32  |  
###  HrtimerStartFtraceEvent
Defined in [timer.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/timer.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| hrtimer  | uint64  |  
| function  | uint64  |  
| expires  | int64  |  
| softexpires  | int64  |  
| mode  | uint32  |  
###  HrtimerCancelFtraceEvent
Defined in [timer.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/timer.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| hrtimer  | uint64  |  
###  HrtimerExpireEntryFtraceEvent
Defined in [timer.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/timer.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| hrtimer  | uint64  |  
| now  | int64  |  
| function  | uint64  |  
###  HrtimerExpireExitFtraceEvent
Defined in [timer.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/timer.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| hrtimer  | uint64  |  
###  TimerStartFtraceEvent
Defined in [timer.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/timer.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| timer  | uint64  |  
| function  | uint64  |  
| expires  | uint64  |  
| now  | uint64  |  
| deferrable  | uint32  |  
| flags  | uint32  |  
| bucket_expiry  | uint64  |  
###  TimerCancelFtraceEvent
Defined in [timer.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/timer.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| timer  | uint64  |  
###  TimerExpireEntryFtraceEvent
Defined in [timer.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/timer.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| timer  | uint64  |  
| now  | uint64  |  
| function  | uint64  |  
| baseclk  | uint64  |  
###  TimerExpireExitFtraceEvent
Defined in [timer.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/timer.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| timer  | uint64  |  
###  LocalTimerEntryFtraceEvent
Defined in [irq_vectors.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/irq_vectors.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| vector  | int32  |  
###  LocalTimerExitFtraceEvent
Defined in [irq_vectors.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/irq_vectors.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| vector  | int32  |  
###  Dwc3AllocRequestFtraceEvent
Defined in [dwc3.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/dwc3.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
| req  | uint64  |  
| actual  | uint32  |  
| length  | uint32  |  
| status  | int32  |  
| zero  | int32  |  
| short_not_ok  | int32  |  
| no_interrupt  | int32  |  
###  Dwc3CompleteTrbFtraceEvent
Defined in [dwc3.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/dwc3.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
| trb  | uint64  |  
| allocated  | uint32  |  
| queued  | uint32  |  
| bpl  | uint32  |  
| bph  | uint32  |  
| size  | uint32  |  
| ctrl  | uint32  |  
| type  | uint32  |  
| enqueue  | uint32  |  
| dequeue  | uint32  |  
###  Dwc3CtrlReqFtraceEvent
Defined in [dwc3.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/dwc3.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| bRequestType  | uint32  |  
| bRequest  | uint32  |  
| wValue  | uint32  |  
| wIndex  | uint32  |  
| wLength  | uint32  |  
| str  | string  |  
###  Dwc3EpDequeueFtraceEvent
Defined in [dwc3.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/dwc3.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
| req  | uint64  |  
| actual  | uint32  |  
| length  | uint32  |  
| status  | int32  |  
| zero  | int32  |  
| short_not_ok  | int32  |  
| no_interrupt  | int32  |  
###  Dwc3EpQueueFtraceEvent
Defined in [dwc3.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/dwc3.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
| req  | uint64  |  
| actual  | uint32  |  
| length  | uint32  |  
| status  | int32  |  
| zero  | int32  |  
| short_not_ok  | int32  |  
| no_interrupt  | int32  |  
###  Dwc3EventFtraceEvent
Defined in [dwc3.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/dwc3.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| event  | uint32  |  
| ep0state  | uint32  |  
| str  | string  |  
###  Dwc3FreeRequestFtraceEvent
Defined in [dwc3.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/dwc3.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
| req  | uint64  |  
| actual  | uint32  |  
| length  | uint32  |  
| status  | int32  |  
| zero  | int32  |  
| short_not_ok  | int32  |  
| no_interrupt  | int32  |  
###  Dwc3GadgetEpCmdFtraceEvent
Defined in [dwc3.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/dwc3.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
| cmd  | uint32  |  
| param0  | uint32  |  
| param1  | uint32  |  
| param2  | uint32  |  
| cmd_status  | int32  |  
###  Dwc3GadgetEpDisableFtraceEvent
Defined in [dwc3.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/dwc3.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
| maxpacket  | uint32  |  
| maxpacket_limit  | uint32  |  
| max_streams  | uint32  |  
| maxburst  | uint32  |  
| flags  | uint32  |  
| direction  | uint32  |  
| trb_enqueue  | uint32  |  
| trb_dequeue  | uint32  |  
###  Dwc3GadgetEpEnableFtraceEvent
Defined in [dwc3.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/dwc3.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
| maxpacket  | uint32  |  
| maxpacket_limit  | uint32  |  
| max_streams  | uint32  |  
| maxburst  | uint32  |  
| flags  | uint32  |  
| direction  | uint32  |  
| trb_enqueue  | uint32  |  
| trb_dequeue  | uint32  |  
###  Dwc3GadgetGenericCmdFtraceEvent
Defined in [dwc3.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/dwc3.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| cmd  | uint32  |  
| param  | uint32  |  
| status  | int32  |  
###  Dwc3GadgetGivebackFtraceEvent
Defined in [dwc3.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/dwc3.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
| req  | uint64  |  
| actual  | uint32  |  
| length  | uint32  |  
| status  | int32  |  
| zero  | int32  |  
| short_not_ok  | int32  |  
| no_interrupt  | int32  |  
###  Dwc3PrepareTrbFtraceEvent
Defined in [dwc3.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/dwc3.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
| trb  | uint64  |  
| allocated  | uint32  |  
| queued  | uint32  |  
| bpl  | uint32  |  
| bph  | uint32  |  
| size  | uint32  |  
| ctrl  | uint32  |  
| type  | uint32  |  
| enqueue  | uint32  |  
| dequeue  | uint32  |  
###  Dwc3ReadlFtraceEvent
Defined in [dwc3.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/dwc3.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| base  | uint64  |  
| offset  | uint32  |  
| value  | uint32  |  
| msg  | string  |  
###  Dwc3WritelFtraceEvent
Defined in [dwc3.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/dwc3.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| base  | uint64  |  
| offset  | uint32  |  
| value  | uint32  |  
| msg  | string  |  
###  CmaAllocFinishFtraceEvent
Defined in [cma.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/cma.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
| pfn  | uint64  |  
| page  | uint64  |  
| count  | uint64  |  
| align  | uint32  |  
| errorno  | int32  |  
###  MmAllocContigMigrateRangeInfoFtraceEvent
Defined in [kmem.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kmem.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| start  | uint64  |  
| end  | uint64  |  
| nr_migrated  | uint64  |  
| nr_reclaimed  | uint64  |  
| nr_mapped  | uint64  |  
| migratetype  | int32  |  
###  HostFfaCallFtraceEvent
Defined in [hyp.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/hyp.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| func_id  | uint64  |  
| res_a1  | uint64  |  
| res_a2  | uint64  |  
| res_a3  | uint64  |  
| res_a4  | uint64  |  
| handled  | int32  |  
| err  | int32  |  
###  DmabufRssStatFtraceEvent
Defined in [kmem.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/kmem.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| rss  | uint64  |  
| rss_delta  | int64  |  
| i_ino  | uint64  |  
###  IommuIdmapFtraceEvent
Defined in [hyp.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/hyp.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| from  | uint64  |  
| to  | uint64  |  
| prot  | int32  |  
###  PsciMemProtectFtraceEvent
Defined in [hyp.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/hyp.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| count  | uint64  |  
| was  | uint64  |  
###  HypervisorHostHcallFtraceEvent
Defined in [hypervisor.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/hypervisor.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| id  | uint32  |  
| invalid  | uint32  |  
###  HypervisorHostSmcFtraceEvent
Defined in [hypervisor.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/hypervisor.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| id  | uint64  |  
| forwarded  | uint32  |  
###  HypervisorHypExitFtraceEvent
Defined in [hypervisor.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/hypervisor.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
###  HypervisorIommuIdmapFtraceEvent
Defined in [hypervisor.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/hypervisor.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| from  | uint64  |  
| to  | uint64  |  
| prot  | int32  |  
###  HypervisorPsciMemProtectFtraceEvent
Defined in [hypervisor.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/hypervisor.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| count  | uint64  |  
| was  | uint64  |  
###  HypervisorHostMemAbortFtraceEvent
Defined in [hypervisor.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/hypervisor.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| esr  | uint64  |  
| addr  | uint64  |  
###  HypervisorHypEnterFtraceEvent
Defined in [hypervisor.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/hypervisor.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
###  HypervisorIommuIdmapCompleteFtraceEvent
Defined in [hypervisor.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/hypervisor.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| map  | uint32  |  
###  HypervisorVcpuIllegalTrapFtraceEvent
Defined in [hypervisor.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/hypervisor.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| esr  | uint64  |  
###  DrmSchedJobAddDepFtraceEvent
Defined in [gpu_scheduler.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/gpu_scheduler.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| fence_context  | uint64  |  
| fence_seqno  | uint64  |  
| ctx  | uint64  |  
| seqno  | uint64  |  
###  DrmSchedJobDoneFtraceEvent
Defined in [gpu_scheduler.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/gpu_scheduler.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| fence_context  | uint64  |  
| fence_seqno  | uint64  |  
###  DrmSchedJobQueueFtraceEvent
Defined in [gpu_scheduler.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/gpu_scheduler.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
| job_count  | uint32  |  
| hw_job_count  | int32  |  
| dev  | string  |  
| fence_context  | uint64  |  
| fence_seqno  | uint64  |  
| client_id  | uint64  |  
###  DrmSchedJobRunFtraceEvent
Defined in [gpu_scheduler.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/gpu_scheduler.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
| job_count  | uint32  |  
| hw_job_count  | int32  |  
| dev  | string  |  
| fence_context  | uint64  |  
| fence_seqno  | uint64  |  
| client_id  | uint64  |  
###  DrmSchedJobUnschedulableFtraceEvent
Defined in [gpu_scheduler.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/gpu_scheduler.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| fence_context  | uint64  |  
| fence_seqno  | uint64  |  
| ctx  | uint64  |  
| seqno  | uint64  |  
###  FwtpPerfettoCounterFtraceEvent
Defined in [fwtp_ftrace.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/fwtp_ftrace.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| timestamp  | uint64  |  
| track_id  | uint32  |  
| category  | string  |  
| name  | string  |  
| value  | uint32  |  
###  ScsiDispatchCmdErrorFtraceEvent
Defined in [scsi.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/scsi.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| host_no  | uint32  |  
| channel  | uint32  |  
| id  | uint32  |  
| lun  | uint32  |  
| rtn  | int32  |  
| opcode  | uint32  |  
| cmd_len  | uint32  |  
| data_sglen  | uint32  |  
| prot_sglen  | uint32  |  
| prot_op  | uint32  |  
| driver_tag  | int32  |  
| scheduler_tag  | int32  |  
| cmnd  | bytes  |  
###  ScsiDispatchCmdTimeoutFtraceEvent
Defined in [scsi.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/scsi.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| host_no  | uint32  |  
| channel  | uint32  |  
| id  | uint32  |  
| lun  | uint32  |  
| result  | int32  |  
| opcode  | uint32  |  
| cmd_len  | uint32  |  
| data_sglen  | uint32  |  
| prot_sglen  | uint32  |  
| prot_op  | uint32  |  
| driver_tag  | int32  |  
| scheduler_tag  | int32  |  
| sense_key  | uint32  |  
| asc  | uint32  |  
| ascq  | uint32  |  
| cmnd  | bytes  |  
###  ScsiEhWakeupFtraceEvent
Defined in [scsi.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/scsi.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| host_no  | uint32  |  
###  FwtpPerfettoSliceFtraceEvent
Defined in [fwtp_ftrace.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/fwtp_ftrace.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| timestamp  | uint64  |  
| track_id  | uint32  |  
| category  | string  |  
| name  | string  |  
| begin  | uint32  |  
###  GpuPowerStateFtraceEvent
Defined in [power.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/power.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| old_state  | int32  |  
| new_state  | int32  |  
###  GramCollisionFtraceEvent
Defined in [panel.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/panel.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| panel_index  | int32  |  
| collision_cnt  | uint32  |  
###  F2fsLockElapsedTimeFtraceEvent
Defined in [f2fs.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/f2fs.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| dev  | uint64  |  
| comm  | string  |  
| pid  | int32  |  
| prio  | int32  |  
| ioprio_class  | int32  |  
| ioprio_data  | int32  |  
| lock_name  | uint32  |  
| is_write  | uint32  |  
| total_time  | uint64  |  
| running_time  | uint64  |  
| runnable_time  | uint64  |  
| io_sleep_time  | uint64  |  
| other_time  | uint64  |  
###  SchedGroupTrackerFtraceEvent
Defined in [sched.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/sched.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| comm  | string  |  
| pid  | int32  |  
| group  | string  |  
| group_num  | int32  |  
###  DpuDispFrameDoneTimeoutFtraceEvent
Defined in [dpu.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/dpu.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| display_id  | int32  |  
| output_id  | uint32  |  
| frames_pending  | int32  |  
| te_count  | int32  |  
| during_disable  | uint32  |  
###  DpuDispFrameStartTimeoutFtraceEvent
Defined in [dpu.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/dpu.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| display_id  | int32  |  
| output_id  | uint32  |  
| frames_pending  | int32  |  
| te_count  | int32  |  
###  MmVmscanMemcgReclaimBeginFtraceEvent
Defined in [vmscan.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/vmscan.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| order  | int32  |  
| may_writepage  | int32  |  
| gfp_flags  | uint64  |  
###  MmVmscanMemcgReclaimEndFtraceEvent
Defined in [vmscan.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/vmscan.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| nr_reclaimed  | uint64  |  
###  DpuDispFrameDoneMissingFtraceEvent
Defined in [dpu.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/dpu.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| display_id  | int32  |  
| output_id  | uint32  |  
| frames_pending  | int32  |  
| te_count  | int32  |  
###  DpuDispFrameStartMissingFtraceEvent
Defined in [dpu.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/dpu.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| display_id  | int32  |  
| output_id  | uint32  |  
| frames_pending  | int32  |  
| te_count  | int32  |  
###  PanelSettingsFullFtraceEvent
Defined in [panel.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/panel.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| panel_index  | int32  |  
| hbm  | uint32  |  
| irc  | uint32  |  
| h_pwm  | uint32  |  
| fi_auto  | uint32  |  
| fi_manual  | uint32  |  
| early_exit  | uint32  |  
| min_rr  | uint32  |  
| max_rr  | uint32  |  
| te_freq  | uint32  |  
###  PanelSettingsLiteFtraceEvent
Defined in [panel.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/panel.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| panel_index  | int32  |  
| vrr  | uint32  |  
| min_rr  | uint32  |  
| max_rr  | uint32  |  
| te_freq  | uint32  |  
###  DpuDispDpuLineUnderrunFtraceEvent
Defined in [dpu.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/dpu.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| id  | int32  |  
| frames_pending  | int32  |  
| vsync_count  | int32  |  
###  PsciDomainIdleExitFtraceEvent
Defined in [power.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/power.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| cpu_id  | uint32  |  
| state  | uint32  |  
| s2idle  | uint32  |  
###  PsciDomainIdleEnterFtraceEvent
Defined in [power.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/power.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| cpu_id  | uint32  |  
| state  | uint32  |  
| s2idle  | uint32  |  
###  LongIrqFtraceEvent
Defined in [pixel_metrics.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/pixel_metrics.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| irq  | int32  |  
| latency  | uint32  |  
| count  | uint32  |  
###  LongSoftirqFtraceEvent
Defined in [pixel_metrics.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/pixel_metrics.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| vec_nr  | int32  |  
| latency  | uint32  |  
| count  | uint32  |  
###  FtraceEventBundle.CompactSched
Optionally-enabled compact encoding of a batch of scheduling events. Only a subset of events & their fields is recorded. All fields (except comms) are stored in a structure-of-arrays form, one entry in each repeated field per event.
Defined in [ftrace_event_bundle.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ftrace_event_bundle.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| intern_table  | string[]  | Interned table of unique strings for this bundle.  |  
| switch_timestamp  | uint64[]  | Delta-encoded timestamps across all sched_switch events within this bundle. The first is absolute, each next one is relative to its predecessor.  |  
| switch_prev_state  | int64[]  |  
| switch_next_pid  | int32[]  |  
| switch_next_prio  | int32[]  |  
| switch_next_comm_index  | uint32[]  | One per event, index into `intern_table` corresponding to the next_comm field of the event.  |  
| waking_timestamp  | uint64[]  | Delta-encoded timestamps across all sched_waking events within this bundle. The first is absolute, each next one is relative to its predecessor.  |  
| waking_pid  | int32[]  |  
| waking_target_cpu  | int32[]  |  
| waking_prio  | int32[]  |  
| waking_comm_index  | uint32[]  | One per event, index into `intern_table` corresponding to the comm field of the event.  |  
| waking_common_flags  | uint32[]  |  
###  FtraceClock
Defined in [ftrace_event_bundle.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ftrace_event_bundle.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| FTRACE_CLOCK_UNSPECIFIED  | 0  | There is no FTRACE_CLOCK_BOOT entry as that's the default assumption. When the ftrace clock is "boot", it's just omitted (so UNSPECIFIED == BOOT).  |  
| FTRACE_CLOCK_UNKNOWN  | 1  |  
| FTRACE_CLOCK_GLOBAL  | 2  |  
| FTRACE_CLOCK_LOCAL  | 3  |  
| FTRACE_CLOCK_MONO_RAW  | 4  |  
###  FtraceEventBundle.FtraceError
Errors encountered during parsing of the raw ftrace data. In case of ring buffer layout errors, the parser skips the rest of the offending kernel buffer page and continues from the next page. See also FtraceStats.ftrace_parse_errors, which collates all unique errors seen within the duration of the trace (even if the affected bundles get overwritten in ring buffer mode).
Defined in [ftrace_event_bundle.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ftrace_event_bundle.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| timestamp  | uint64  | Timestamp of the data that we're unable to parse, in the ftrace clock domain. Currently, we use the base timestamp of the tracing page containing the bad record rather than the time of the record itself.  |  
| status  | [FtraceParseStatus](https://perfetto.dev/docs/reference/trace-packet-proto#FtraceParseStatus)  |  
###  FtraceEventBundle.GenericEventDescriptor
Describes the serialised `FtraceEvent` protos for events not known at compile time, when using the `denser_generic_event_encoding` option. Addded in: perfetto v50.
Defined in [ftrace_event_bundle.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/ftrace/ftrace_event_bundle.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| field_id  | int32  | submessage id within FtraceEvent described by `event_descriptor`.  |  
| group_name  | string  | optional: the event's group, e.g. "sched" for "sched/sched_switch".The event name itself is in  |  
| event_descriptor  | bytes  | serialised DescriptorProto.  |  
##  ExtensionDescriptor
This message contains descriptors used to parse extension fields of TrackEvent.
See docs/instrumentation/extensions.md for more details.
Defined in [extension_descriptor.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/extension_descriptor.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| extension_set  | [FileDescriptorSet](https://perfetto.dev/docs/reference/trace-packet-proto#FileDescriptorSet)  |  
| extension_set_gzip  | bytes  | Same as extension_set, but gzip-compressed. This is used by the tracing service on Android to emit pre-compressed descriptor files from /etc/tracing_descriptors.gz without decompressing them first.  |  
| file_name  | string  | Optional, for debugging only. The file name or path of the descriptor source. Can be omitted without affecting functionality.  |  
###  FileDescriptorSet
The protocol compiler can output a FileDescriptorSet containing the .proto files it parses.
Defined in [descriptor.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/common/descriptor.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| file  | [FileDescriptorProto[]](https://perfetto.dev/docs/reference/trace-packet-proto#FileDescriptorProto)  |  
###  FileDescriptorProto
Describes a complete .proto file.
Defined in [descriptor.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/common/descriptor.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  | file name, relative to root of source tree  |  
| package  | string  | e.g. "foo", "foo.bar", etc.  |  
| dependency  | string[]  | Names of files imported by this file.  |  
| public_dependency  | int32[]  | Indexes of the public imported files in the dependency list above.  |  
| weak_dependency  | int32[]  | Indexes of the weak imported files in the dependency list.For Google-internal migration only. Do not use.  |  
| message_type  | [DescriptorProto[]](https://perfetto.dev/docs/reference/trace-packet-proto#DescriptorProto)  | All top-level definitions in this file.  |  
| enum_type  | [EnumDescriptorProto[]](https://perfetto.dev/docs/reference/trace-packet-proto#EnumDescriptorProto)  |  
| extension  | [FieldDescriptorProto[]](https://perfetto.dev/docs/reference/trace-packet-proto#FieldDescriptorProto)  |  
###  DescriptorProto
Describes a message type.
Defined in [descriptor.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/common/descriptor.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
| field  | [FieldDescriptorProto[]](https://perfetto.dev/docs/reference/trace-packet-proto#FieldDescriptorProto)  |  
| extension  | [FieldDescriptorProto[]](https://perfetto.dev/docs/reference/trace-packet-proto#FieldDescriptorProto)  |  
| nested_type  | [DescriptorProto[]](https://perfetto.dev/docs/reference/trace-packet-proto#DescriptorProto)  |  
| enum_type  | [EnumDescriptorProto[]](https://perfetto.dev/docs/reference/trace-packet-proto#EnumDescriptorProto)  |  
| oneof_decl  | [OneofDescriptorProto[]](https://perfetto.dev/docs/reference/trace-packet-proto#OneofDescriptorProto)  |  
| reserved_range  |  
| reserved_name  | string[]  | Reserved field names, which may not be used by fields in the same message.A given name may only be reserved once.  |  
###  FieldDescriptorProto
Describes a field within a message.
Defined in [descriptor.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/common/descriptor.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
| number  | int32  |  
| label  |  
| type  | If type_name is set, this need not be set. If both this and type_name are set, this must be one of TYPE_ENUM, TYPE_MESSAGE or TYPE_GROUP.  |  
| type_name  | string  | For message and enum types, this is the name of the type. If the name starts with a '.', it is fully-qualified. Otherwise, C++-like scoping rules are used to find the type (i.e. first the nested types within this message are searched, then within the parent, on up to the root namespace).  |  
| extendee  | string  | For extensions, this is the name of the type being extended. It is resolved in the same manner as type_name.  |  
| default_value  | string  | For numeric types, contains the original text representation of the value.For booleans, "true" or "false".For strings, contains the default text contents (not escaped in any way).For bytes, contains the C escaped value. All bytes >= 128 are escaped.  |  
| options  |  
| oneof_index  | int32  | If set, gives the index of a oneof in the containing type's oneof_decl list. This field is a member of that oneof.  |  
###  FieldDescriptorProto.Label
Defined in [descriptor.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/common/descriptor.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| LABEL_OPTIONAL  | 1  | 0 is reserved for errors  |  
| LABEL_REQUIRED  | 2  |  
| LABEL_REPEATED  | 3  |  
###  FieldDescriptorProto.Type
Defined in [descriptor.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/common/descriptor.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| TYPE_DOUBLE  | 1  | 0 is reserved for errors.Order is weird for historical reasons.  |  
| TYPE_FLOAT  | 2  |  
| TYPE_INT64  | 3  | Not ZigZag encoded. Negative numbers take 10 bytes. Use TYPE_SINT64 if negative values are likely.  |  
| TYPE_UINT64  | 4  |  
| TYPE_INT32  | 5  | Not ZigZag encoded. Negative numbers take 10 bytes. Use TYPE_SINT32 if negative values are likely.  |  
| TYPE_FIXED64  | 6  |  
| TYPE_FIXED32  | 7  |  
| TYPE_BOOL  | 8  |  
| TYPE_STRING  | 9  |  
| TYPE_GROUP  | 10  | Tag-delimited aggregate.Group type is deprecated and not supported in proto3. However, Proto3 implementations should still be able to parse the group wire format and treat group fields as unknown fields.  |  
| TYPE_MESSAGE  | 11  | Length-delimited aggregate.  |  
| TYPE_BYTES  | 12  | New in version 2.  |  
| TYPE_UINT32  | 13  |  
| TYPE_ENUM  | 14  |  
| TYPE_SFIXED32  | 15  |  
| TYPE_SFIXED64  | 16  |  
| TYPE_SINT32  | 17  | Uses ZigZag encoding.  |  
| TYPE_SINT64  | 18  | Uses ZigZag encoding.  |  
###  FieldOptions
Defined in [descriptor.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/common/descriptor.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| packed  | bool  | The packed option can be enabled for repeated primitive fields to enable a more efficient representation on the wire. Rather than repeatedly writing the tag and type for each element, the entire array is encoded as a single length-delimited blob. In proto3, only explicit setting it to false will avoid using packed encoding.  |  
| uninterpreted_option  | [UninterpretedOption[]](https://perfetto.dev/docs/reference/trace-packet-proto#UninterpretedOption)  | The parser stores options it doesn't recognize here. See above.  |  
###  UninterpretedOption
A message representing a option the parser does not recognize. This only appears in options protos created by the compiler::Parser class. DescriptorPool resolves these when building Descriptor objects. Therefore, options protos in descriptor objects (e.g. returned by Descriptor::options(), or produced by Descriptor::CopyTo()) will never have UninterpretedOptions in them.
Defined in [descriptor.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/common/descriptor.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  |  
| identifier_value  | string  | The value of the uninterpreted option, in whatever type the tokenizer identified it as during parsing. Exactly one of these should be set.  |  
| positive_int_value  | uint64  |  
| negative_int_value  | int64  |  
| double_value  | double  |  
| string_value  | bytes  |  
| aggregate_value  | string  |  
###  UninterpretedOption.NamePart
The name of the uninterpreted option. Each string represents a segment in a dot-separated name. is_extension is true iff a segment represents an extension (denoted with parentheses in options specs in .proto files). E.g.,{ ["foo", false], ["bar.baz", true], ["moo", false] } represents "foo.(bar.baz).moo".
Defined in [descriptor.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/common/descriptor.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name_part  | string  |  
| is_extension  | bool  |  
###  EnumDescriptorProto
Describes an enum type.
Defined in [descriptor.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/common/descriptor.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
| value  | [EnumValueDescriptorProto[]](https://perfetto.dev/docs/reference/trace-packet-proto#EnumValueDescriptorProto)  |  
| reserved_name  | string[]  | Reserved enum value names, which may not be reused. A given name may only be reserved once.  |  
###  EnumValueDescriptorProto
Describes a value within an enum.
Defined in [descriptor.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/common/descriptor.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
| number  | int32  |  
###  OneofDescriptorProto
Describes a oneof.
Defined in [descriptor.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/common/descriptor.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  |  
| options  |  
###  OneofOptions
Defined in [descriptor.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/common/descriptor.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
###  DescriptorProto.ReservedRange
Range of reserved tag numbers. Reserved tag numbers may not be used by fields or extension ranges in the same message. Reserved ranges may not overlap.
Defined in [descriptor.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/common/descriptor.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| start  | int32  | Inclusive.  |  
| end  | int32  | Exclusive.  |  
##  EtwTraceEventBundle
The result of tracing one or more etw event uses per-processor buffers where an in-use buffer is assigned to each processor at all times. Therefore, collecting multiple events they should already be synchronized.
Defined in [etw_event_bundle.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/etw/etw_event_bundle.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| cpu  | uint32  |  
| event  | [EtwTraceEvent[]](https://perfetto.dev/docs/reference/trace-packet-proto#EtwTraceEvent)  |  
###  EtwTraceEvent
Defined in [etw_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/etw/etw_event.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| timestamp  | uint64  |  
| cpu  | uint32  |  
| thread_id  | uint32  |  
| c_switch  | [CSwitchEtwEvent](https://perfetto.dev/docs/reference/trace-packet-proto#CSwitchEtwEvent)  |  
| ready_thread  | [ReadyThreadEtwEvent](https://perfetto.dev/docs/reference/trace-packet-proto#ReadyThreadEtwEvent)  |  
| mem_info  | [MemInfoEtwEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MemInfoEtwEvent)  |  
| file_io_create  | [FileIoCreateEtwEvent](https://perfetto.dev/docs/reference/trace-packet-proto#FileIoCreateEtwEvent)  |  
| file_io_dir_enum  | [FileIoDirEnumEtwEvent](https://perfetto.dev/docs/reference/trace-packet-proto#FileIoDirEnumEtwEvent)  |  
| file_io_info  | [FileIoInfoEtwEvent](https://perfetto.dev/docs/reference/trace-packet-proto#FileIoInfoEtwEvent)  |  
| file_io_read_write  | [FileIoReadWriteEtwEvent](https://perfetto.dev/docs/reference/trace-packet-proto#FileIoReadWriteEtwEvent)  |  
| file_io_simple_op  | [FileIoSimpleOpEtwEvent](https://perfetto.dev/docs/reference/trace-packet-proto#FileIoSimpleOpEtwEvent)  |  
| file_io_op_end  | [FileIoOpEndEtwEvent](https://perfetto.dev/docs/reference/trace-packet-proto#FileIoOpEndEtwEvent)  |  
| stack_walk  | [StackWalkEtwEvent](https://perfetto.dev/docs/reference/trace-packet-proto#StackWalkEtwEvent)  |  
| file_io_path_operation  | [FileIoPathOperationEtwEvent](https://perfetto.dev/docs/reference/trace-packet-proto#FileIoPathOperationEtwEvent)  |  
| disk_io  | [DiskIoEtwEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DiskIoEtwEvent)  |  
###  CSwitchEtwEvent
Proto definition based on the Thread_v2 CSwitch class definition See: <https://learn.microsoft.com/en-us/windows/win32/etw/cswitch>
Defined in [etw.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/etw/etw.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| new_thread_id  | uint32  | New thread ID after the switch.  |  
| old_thread_id  | uint32  | Previous thread ID.  |  
| new_thread_priority  | sint32  | Thread priority of the new thread.  |  
| old_thread_priority  | sint32  | Thread priority of the previous thread.  |  
| previous_c_state  | uint32  | The index of the C-state that was last used by the processor. A value of 0 represents the lightest idle state with higher values representing deeper C-states.  |  
| old_thread_wait_reason  | [OldThreadWaitReason](https://perfetto.dev/docs/reference/trace-packet-proto#CSwitchEtwEvent.OldThreadWaitReason)  |  
| old_thread_wait_reason_int  | int32  |  
| old_thread_wait_mode  | [OldThreadWaitMode](https://perfetto.dev/docs/reference/trace-packet-proto#CSwitchEtwEvent.OldThreadWaitMode)  |  
| old_thread_wait_mode_int  | int32  |  
| old_thread_state  |  
| old_thread_state_int  | sint32  |  
| old_thread_wait_ideal_processor  | sint32  | Ideal wait time of the previous thread.  |  
| new_thread_wait_time  | uint32  | Wait time for the new thread.  |  
###  CSwitchEtwEvent.OldThreadWaitReason
Wait reason for the previous thread. The ordering is important as based on the OldThreadWaitReason definition from the link above. The following are the possible values:
Defined in [etw.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/etw/etw.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| EXECUTIVE  | 0  |  
| FREE_PAGE  | 1  |  
| PAGE_IN  | 2  |  
| POOL_ALLOCATION  | 3  |  
| DELAY_EXECUTION  | 4  |  
| SUSPEND  | 5  |  
| USER_REQUEST  | 6  |  
| WR_EXECUTIVE  | 7  |  
| WR_FREE_PAGE  | 8  |  
| WR_PAGE_IN  | 9  |  
| WR_POOL_ALLOCATION  | 10  |  
| WR_DELAY_EXECUTION  | 11  |  
| WR_SUSPENDED  | 12  |  
| WR_USER_REQUEST  | 13  |  
| WR_EVENT_PAIR  | 14  |  
| WR_QUEUE  | 15  |  
| WR_LPC_RECEIVER  | 16  |  
| WR_LPC_REPLY  | 17  |  
| WR_VIRTUAL_MEMORY  | 18  |  
| WR_PAGE_OUT  | 19  |  
| WR_RENDEZ_VOUS  | 20  |  
| WR_KEYED_EVENT  | 21  |  
| WR_TERMINATED  | 22  |  
| WR_PROCESS_IN_SWAP  | 23  |  
| WR_CPU_RATE_CONTROL  | 24  |  
| WR_CALLOUT_STACK  | 25  |  
| WR_KERNEL  | 26  |  
| WR_RESOURCE  | 27  |  
| WR_PUSH_LOCK  | 28  |  
| WR_MUTEX  | 29  |  
| WR_QUANTUM_END  | 30  |  
| WR_DISPATCH_INT  | 31  |  
| WR_PREEMPTED  | 32  |  
| WR_YIELD_EXECUTION  | 33  |  
| WR_FAST_MUTEX  | 34  |  
| WR_GUARD_MUTEX  | 35  |  
| WR_RUNDOWN  | 36  |  
| MAXIMUM_WAIT_REASON  | 37  |  
###  CSwitchEtwEvent.OldThreadWaitMode
Wait mode for the previous thread. The ordering is important as based on the OldThreadWaitMode definition from the link above. The following are the possible values:
Defined in [etw.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/etw/etw.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| KERNEL_MODE  | 0  |  
| USER_MODE  | 1  |  
###  CSwitchEtwEvent.OldThreadState
State of the previous thread. The ordering is important as based on the OldThreadState definition from the link above. The following are the possible state values:
Defined in [etw.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/etw/etw.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| INITIALIZED  | 0  |  
| READY  | 1  |  
| RUNNING  | 2  |  
| STANDBY  | 3  |  
| TERMINATED  | 4  |  
| WAITING  | 5  |  
| TRANSITION  | 6  |  
| DEFERRED_READY  | 7  |  
###  ReadyThreadEtwEvent
Proto definition based on the Thread_v2 CSwitch class definition See: <https://learn.microsoft.com/en-us/windows/win32/etw/readythread>
Defined in [etw.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/etw/etw.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| t_thread_id  | uint32  | The thread identifier of the thread being readied for execution.  |  
| adjust_reason  |  
| adjust_reason_int  | int32  |  
| adjust_increment  | sint32  | The value by which the priority is being adjusted.  |  
| flag  |  
| flag_int  | int32  |  
###  ReadyThreadEtwEvent.AdjustReason
The reason for the priority boost. The ordering is important as based on the AdjustReason definition from the link above.
Defined in [etw.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/etw/etw.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| IGNORE_THE_INCREMENT  | 0  |  
| APPLY_INCREMENT  | 1  | Apply the increment, which will decay incrementally at the end of each quantum.  |  
| APPLY_INCREMENT_BOOST  | 2  | Apply the increment as a boost that will decay in its entirety at quantum (typically for priority donation).  |  
###  ReadyThreadEtwEvent.TraceFlag
Defined in [etw.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/etw/etw.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| TRACE_FLAG_UNSPECIFIED  | 0  |  
| THREAD_READIED  | 1  | The thread has been readied from DPC (deferred procedure call).  |  
| KERNEL_STACK_SWAPPED_OUT  | 2  | The kernel stack is currently swapped out.  |  
| PROCESS_ADDRESS_SWAPPED_OUT  | 4  | The process address space is swapped out.  |  
###  MemInfoEtwEvent
Proto definition based on the type of MemInfoArgs_V1, found here and observed on local traces using tracerpt: <https://github.com/repnz/etw-providers-docs/blob/master/Manifests-Win10-17134/Microsoft-Windows-Kernel-Memory.xml>
Defined in [etw.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/etw/etw.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| priority_levels  | uint32  | Number of memory priorities on the system.  |  
| zero_page_count  | uint64  | Number of pages in the zero list.  |  
| free_page_count  | uint64  | Number of pages in the free list.  |  
| modified_page_count  | uint64  | Number of pages in the modified list.  |  
| modified_no_write_page_count  | uint64  | Number of modified non-paged pool pages.  |  
| bad_page_count  | uint64  | Number of bad pages.  |  
| standby_page_counts  | uint64[]  | Number of standby pages by memory priority.  |  
| repurposed_page_counts  | uint64[]  | Number of repurposed pages by memory priority.  |  
| modified_page_count_page_file  | uint64  | Modified paged pages.  |  
| paged_pool_page_count  | uint64  | Pool page counts.  |  
| non_paged_pool_page_count  | uint64  |  
| mdl_page_count  | uint64  | Memory Descriptor List page count.  |  
| commit_page_count  | uint64  | Commit weight.  |  
###  FileIoCreateEtwEvent
Proto definition based on the `FileIo_Create` class definition.
Defined in [etw.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/etw/etw.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| irp_ptr  | uint64  |  
| file_object  | uint64  |  
| ttid  | uint32  |  
| create_options  | uint32  |  
| file_attributes  | uint32  |  
| share_access  | uint32  |  
| open_path  | string  |  
###  FileIoDirEnumEtwEvent
Proto definition based on the `FileIo_DirEnum` class definition.
Defined in [etw.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/etw/etw.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| irp_ptr  | uint64  |  
| file_object  | uint64  |  
| file_key  | uint64  |  
| ttid  | uint32  |  
| length  | uint32  |  
| info_class  | uint32  |  
| file_index  | uint32  |  
| file_name  | string  |  
| opcode  | uint32  |  
###  FileIoInfoEtwEvent
Proto definition based on the `FileIo_Info` class definition.
Defined in [etw.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/etw/etw.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| irp_ptr  | uint64  |  
| file_object  | uint64  |  
| file_key  | uint64  |  
| extra_info  | uint64  |  
| ttid  | uint32  |  
| info_class  | uint32  |  
| opcode  | uint32  |  
###  FileIoReadWriteEtwEvent
Proto definition based on the `FileIo_ReadWrite` class definition.
Defined in [etw.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/etw/etw.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| offset  | uint64  |  
| irp_ptr  | uint64  |  
| file_object  | uint64  |  
| file_key  | uint64  |  
| ttid  | uint32  |  
| io_size  | uint32  |  
| io_flags  | uint32  |  
| opcode  | uint32  |  
###  FileIoSimpleOpEtwEvent
Proto definition based on the `FileIo_SimpleOp` class definition.
Defined in [etw.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/etw/etw.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| irp_ptr  | uint64  |  
| file_object  | uint64  |  
| file_key  | uint64  |  
| ttid  | uint32  |  
| opcode  | uint32  |  
###  FileIoOpEndEtwEvent
Proto definition based on the `FileIo_OpEnd` class definition.
Defined in [etw.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/etw/etw.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| irp_ptr  | uint64  |  
| extra_info  | uint64  |  
| nt_status  | uint32  |  
###  StackWalkEtwEvent
Proto definition based on the `StackWalk_Event` class definition. See `Callstack` in `perfetto/protos/perfetto/trace/track_event/track_event.proto` for context on what is contained in it.
Defined in [etw.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/etw/etw.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| trigger  | string  |  
| callstack_iid  | uint64  |  
###  FileIoPathOperationEtwEvent
Proto definition based on the `FileIo_PathOperation` class definition.
Defined in [etw.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/etw/etw.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| irp_ptr  | uint64  |  
| file_object  | uint64  |  
| file_key  | uint64  |  
| extra_info  | uint64  |  
| ttid  | uint32  |  
| info_class  | uint32  |  
| file_name  | string  |  
| opcode  | uint32  |  
###  DiskIoEtwEvent
Proto definition based on the `DiskIo_TypeGroup1/2/3` class definitions.
Defined in [etw.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/etw/etw.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| disk_number  | uint32  |  
| irp_flags  | uint32  |  
| transfer_size  | uint32  |  
| byte_offset  | int64  |  
| file_object  | uint64  |  
| irp_ptr  | uint64  |  
| response_time  | int64  |  
| issuing_thread_id  | uint32  |  
| opcode  | uint32  |  
##  V8JsCode
Defined in [v8.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/chrome/v8.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| v8_isolate_iid  | uint64  |  
| tid  | uint32  |  
| v8_js_function_iid  | uint64  |  
| tier  |  
| instruction_start  | uint64  |  
| instruction_size_bytes  | uint64  |  
| machine_code  | bytes  |  
| bytecode  | bytes  |  
| source_positions  | bytes  | For Ignition / bytecode:- Maps bytecode-ranges to byte offsets (for the same script as the related js function)  |  
| bytecode_positions  | bytes  | For Sparkplug code:- Maps machine-code ranges to bytecode ranges in the corresponding ignition code object for the same js-function.  |  
| inlined_bytecode_positions  | bytes  | For optimized code:- Maps machine-code-ranges to bytecode ranges in various ignition code objects (inlining might happen from multiple functions)  |  
###  V8JsCode.Tier
Defined in [v8.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/chrome/v8.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| TIER_UNKNOWN  | 0  |  
| TIER_IGNITION  | 1  |  
| TIER_SPARKPLUG  | 2  |  
| TIER_MAGLEV  | 3  |  
| TIER_TURBOSHAFT  | 4  |  
| TIER_TURBOFAN  | 5  |  
##  V8InternalCode
Defined in [v8.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/chrome/v8.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| v8_isolate_iid  | uint64  |  
| tid  | uint32  |  
| name  | string  |  
| type  |  
| builtin_id  | int32  |  
| instruction_start  | uint64  |  
| instruction_size_bytes  | uint64  |  
| machine_code  | bytes  |  
###  V8InternalCode.Type
Defined in [v8.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/chrome/v8.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| TYPE_UNKNOWN  | 0  |  
| TYPE_BYTECODE_HANDLER  | 1  |  
| TYPE_FOR_TESTING  | 2  |  
| TYPE_BUILTIN  | 3  |  
| TYPE_WASM_FUNCTION  | 4  |  
| TYPE_WASM_TO_CAPI_FUNCTION  | 5  |  
| TYPE_WASM_TO_JS_FUNCTION  | 6  |  
| TYPE_JS_TO_WASM_FUNCTION  | 7  |  
| TYPE_JS_TO_JS_FUNCTION  | 8  |  
| TYPE_C_WASM_ENTRY  | 9  |  
##  V8WasmCode
Defined in [v8.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/chrome/v8.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| v8_isolate_iid  | uint64  |  
| tid  | uint32  |  
| v8_wasm_script_iid  | uint64  |  
| function_name  | string  |  
| tier  |  
| code_offset_in_module  | int32  |  
| instruction_start  | uint64  |  
| instruction_size_bytes  | uint64  |  
| machine_code  | bytes  |  
###  V8WasmCode.Tier
Defined in [v8.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/chrome/v8.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| TIER_UNKNOWN  | 0  |  
| TIER_LIFTOFF  | 1  |  
| TIER_TURBOFAN  | 2  |  
##  V8RegExpCode
Defined in [v8.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/chrome/v8.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| v8_isolate_iid  | uint64  |  
| tid  | uint32  |  
| pattern  |  
| instruction_start  | uint64  |  
| instruction_size_bytes  | uint64  |  
| machine_code  | bytes  |  
###  V8String
These are the protos for the V8 data source.
All events are associated to a V8 isolate instance. There can be multiple instances associated to a given thread, although this is rare.
Generated code in V8 is allocated in the V8 heap (in a special executeable section), this means that code can be garbage collected (when no longer used) or can be moved around (e.g. during heap compactation). This means that a given callsite might correspond to function `A` at one point in time and to function `B` later on. In addition V8 code has various levels of optimization, so a function might have multiple associated code snippets.
V8 does not track code deletion, so we have to indirectly infer it by detecting code overlaps, if a newer code creation event overlaps with older code we need to asume that the old code was deleted. Code moves are logged, and there is an event to track those.
Strings used by V8 can have different encodings, instead of coverting to a common encoding (e.g. UTF-8) on device is expensive. Instead we send the "raw" string and do the convestion at trace ingestion time.
ATTENTION: There is some overhead in using a message (as opossed to having the `oneof encoded_string`` direcly embedded in the message), so use this message in places were these extra bytes don't matter that much.
Defined in [v8.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/chrome/v8.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| latin1  | bytes  | ISO/IEC 8859-1:1998 encoding aka latin1 <https://en.wikipedia.org/wiki/ISO/IEC_8859-1>  |  
| utf16_le  | bytes  | UTF-16 Little Endian Encoding  |  
| utf16_be  | bytes  | UTF-16 Big Endian Encoding  |  
##  V8CodeMove
Move event for V8 code (JS / Wasm / Internal / Regexp) that was relocated in memory by V8's GC.
Defined in [v8.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/chrome/v8.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| isolate_iid  | uint64  |  
| tid  | uint32  |  
| from_instruction_start_address  | uint64  |  
| to_instruction_start_address  | uint64  |  
| instruction_size_bytes  | uint64  |  
| to_machine_code  | bytes  |  
| to_bytecode  | bytes  |  
##  RemoteClockSync
Records the parameters for aligning clock readings between machines.
Defined in [remote_clock_sync.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/remote_clock_sync.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| synced_clocks  |  
###  RemoteClockSync.SyncedClocks
Synchronized clock snapshots taken on both sides of the relay port (the tracing service and the relay service). A round of clock synchronization IPC takes emits 2 SyncedClocks messages, i.e., client snapshot -> host snapshot -> client snapshot -> host snapshot.
Defined in [remote_clock_sync.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/remote_clock_sync.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| client_clocks  | [ClockSnapshot](https://perfetto.dev/docs/reference/trace-packet-proto#ClockSnapshot)  |  
| host_clocks  | [ClockSnapshot](https://perfetto.dev/docs/reference/trace-packet-proto#ClockSnapshot)  |  
##  PixelModemEvents
Defined in [pixel_modem_events.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/android/pixel_modem_events.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| events  | bytes[]  | Pigweed-format dehydrated events.  |  
| event_time_nanos  | uint64[]  | Timestamps of the events, converted to CLOCK_BOOTTIME. The first timestamp is the absolute timestamp of the first event. Subsequent timestamps are deltas from the previous timestamp.The nth entry from `events` gets the nth entry here.  |  
##  PixelModemTokenDatabase
NB: this is not emitted in the trace but can be prepended later.
Defined in [pixel_modem_events.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/android/pixel_modem_events.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| database  | bytes  | Pigweed-format database to allow event rehydration.  |  
##  KernelWakelockData
Defined in [kernel_wakelock_data.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/android/kernel_wakelock_data.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| wakelock  | This is only emitted when we encounter new wakelocks.  |  
| wakelock_id  | uint32[]  | Interning id.  |  
| time_held_millis  | uint64[]  | If we interned the wakelock name in this packet, this is the total time the wakelock has been held.If not, it's a delta from the last time we saw it.  |  
| error_flags  | uint64  |  
###  KernelWakelockData.Wakelock
Defined in [kernel_wakelock_data.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/android/kernel_wakelock_data.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| wakelock_id  | uint32  | Interning id.  |  
| wakelock_name  | string  | Name of the wakelock.  |  
| wakelock_type  | Type of the wakelock. We record data about both true kernel wakelocks and "native" wakelocks which are taken in userspace but are more conceptually similar to kernel wakelocks than normal userspace ones.  |  
###  KernelWakelockData.Wakelock.Type
Defined in [kernel_wakelock_data.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/android/kernel_wakelock_data.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| WAKELOCK_TYPE_UNKNOWN  | 0  |  
| WAKELOCK_TYPE_KERNEL  | 1  |  
| WAKELOCK_TYPE_NATIVE  | 2  |  
##  CpuPerUidData
Defined in [cpu_per_uid_data.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/android/cpu_per_uid_data.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| cluster_count  | uint32  | Number of clusters in the device. This will only be filled in the first packet in a sequence.  |  
| uid  | uint32[]  | The UIDs for which we have data in this packet.  |  
| total_time_ms  | uint64[]  | List of times for {UID, cluster} tuples. This will be cluster_count times as long as the UID list. Ordered like:[{UID 0, cluster 0}, {UID 0, cluster 1}, {UID 0, cluster 2}, {UID 1, cluster 0}, {UID 1, cluster 1}, {UID 1, cluster 2}, ...] Each value is an absolute count for the first packet in a sequence, and a delta thereafter. UIDs for which all clusters have a zero delta are omitted; a single non-zero value for any cluster for a UID will cause values for all clusters to be recorded.  |  
##  AndroidUserList
Defined in [user_list.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/android/user_list.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| users  |  
| error  | int32  | Error number  |  
###  AndroidUserList.UserInfo
Defined in [user_list.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/android/user_list.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| type  | string  | eg. android.os.usertype.full.SYSTEM, android.os.usertype.full.SECONDARY  |  
| uid  | int32  |  
##  SystemdJournaldEvent
A journald log event packet, collected from the Linux systemd journal. Emitted by the "linux.systemd_journald" data source in traced_probes.
Defined in [journald_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/linux/journald_event.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| pid  | uint32  | _PID: PID of the process that wrote the log entry (trusted).  |  
| tid  | uint32  | _TID: thread ID of the logging thread (trusted, set by journald for native journal protocol entries). Absent for syslog, stdout-piped, and kernel entries.  |  
| uid  | uint32  | _UID: user ID of the process (trusted).  |  
| gid  | uint32  | _GID: group ID of the process (trusted).  |  
| prio  | uint32  | PRIORITY: syslog priority level 0 (EMERG) .. 7 (DEBUG).  |  
| tag  | string  | SYSLOG_IDENTIFIER: program name / tag, set by the logging application.  |  
| message  | string  | MESSAGE: the human-readable log message text.  |  
| comm  | string  | _COMM: short process name as known to the kernel (trusted).  |  
| exe  | string  | _EXE: full executable path (trusted).  |  
| systemd_unit  | string  | _SYSTEMD_UNIT: the systemd unit that owns this process (trusted).  |  
| hostname  | string  | _HOSTNAME: hostname of the machine (trusted).  |  
| transport  | string  | _TRANSPORT: how the entry was received by journald (trusted).Values: "audit", "driver", "syslog", "journal", "stdout", "kernel".  |  
| num_total  | uint64  | These statistics emitted once on Flush()  |  
| num_failed  | uint64  |  
##  RecoveredTraceInfo
Injected into TracePacket by perfetto post-reboot recovery to record recovered trace metadata.
Defined in [recovered_trace_info.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/android/recovered_trace_info.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| reason  |  
| original_file_size_bytes  | uint64  | Raw trace file size (in bytes) on disk prior to post-reboot recovery.  |  
| bytes_truncated  | uint64  | Amount of trailing corrupted/incomplete bytes truncated during recovery.  |  
###  RecoveredTraceInfo.Reason
Defined in [recovered_trace_info.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/android/recovered_trace_info.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| REASON_UNSPECIFIED  | 0  |  
| REASON_UNEXPECTED_REBOOT  | 1  |  
##  MemcgStats
Values read from the files of the cgroup v2 memory controller (memcg), as recorded by the "linux.cgroup" data source.
The values are as reported by the kernel: sizes are in bytes, and limits set to "max" are UINT64_MAX. See Documentation/admin-guide/cgroup-v2.rst in the kernel for their meaning.
Defined in [memcg_stats.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/linux/memcg_stats.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| cgroup  |  
###  MemcgStats.Cgroup
The values of one cgroup.
Defined in [memcg_stats.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/linux/memcg_stats.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| android_group  | Identifies the cgroup in the hierarchy created by Android's libprocessgroup: {apps,system}/uid_/pid_.  |  
| uid  | uint32  |  
| pid  | uint32  |  
| current  | uint64  | Single-valued files.memory.current  |  
| peak  | uint64  | memory.peak  |  
| min  | uint64  | memory.min (UINT64_MAX if "max")  |  
| low  | uint64  | memory.low (UINT64_MAX if "max")  |  
| high  | uint64  | memory.high (UINT64_MAX if "max")  |  
| max  | uint64  | memory.max (UINT64_MAX if "max")  |  
| swap_current  | uint64  | memory.swap.current  |  
| swap_peak  | uint64  | memory.swap.peak  |  
| swap_high  | uint64  | memory.swap.high (UINT64_MAX if "max")  |  
| swap_max  | uint64  | memory.swap.max (UINT64_MAX if "max")  |  
| zswap_current  | uint64  | memory.zswap.current  |  
| zswap_max  | uint64  | memory.zswap.max (UINT64_MAX if "max")  |  
| events  | memory.events (including descendant cgroups).  |  
| events_local  | memory.events.local (only this exact cgroup).  |  
| swap_events  | memory.swap.events  |  
| stat  | memory.stat  |  
###  MemcgStats.Group
The top-level groups of the hierarchy created by Android's libprocessgroup.
Defined in [memcg_stats.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/linux/memcg_stats.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| GROUP_UNSPECIFIED  | 0  |  
| GROUP_APPS  | 1  | apps/  |  
| GROUP_SYSTEM  | 2  | system/  |  
###  MemcgStats.Events
memory.events and memory.events.local
Defined in [memcg_stats.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/linux/memcg_stats.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| low  | uint64  |  
| high  | uint64  |  
| max  | uint64  |  
| oom  | uint64  |  
| oom_kill  | uint64  |  
| oom_group_kill  | uint64  |  
| sock_throttled  | uint64  |  
###  MemcgStats.SwapEvents
memory.swap.events
Defined in [memcg_stats.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/linux/memcg_stats.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| high  | uint64  |  
| max  | uint64  |  
| fail  | uint64  |  
###  MemcgStats.Stat
memory.stat (as of linux v7.3)
Defined in [memcg_stats.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/linux/memcg_stats.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| anon  | uint64  |  
| file  | uint64  |  
| kernel  | uint64  |  
| kernel_stack  | uint64  |  
| pagetables  | uint64  |  
| sec_pagetables  | uint64  |  
| percpu  | uint64  |  
| sock  | uint64  |  
| vmalloc  | uint64  |  
| shmem  | uint64  |  
| zswap  | uint64  |  
| zswapped  | uint64  |  
| zswap_incomp  | uint64  |  
| file_mapped  | uint64  |  
| file_dirty  | uint64  |  
| file_writeback  | uint64  |  
| swapcached  | uint64  |  
| anon_thp  | uint64  |  
| file_thp  | uint64  |  
| shmem_thp  | uint64  |  
| inactive_anon  | uint64  |  
| active_anon  | uint64  |  
| inactive_file  | uint64  |  
| active_file  | uint64  |  
| unevictable  | uint64  |  
| slab_reclaimable  | uint64  |  
| slab_unreclaimable  | uint64  |  
| slab  | uint64  |  
| hugetlb  | uint64  |  
| workingset_refault_anon  | uint64  |  
| workingset_refault_file  | uint64  |  
| workingset_activate_anon  | uint64  |  
| workingset_activate_file  | uint64  |  
| workingset_restore_anon  | uint64  |  
| workingset_restore_file  | uint64  |  
| workingset_nodereclaim  | uint64  |  
| pgdemote_kswapd  | uint64  |  
| pgdemote_direct  | uint64  |  
| pgdemote_khugepaged  | uint64  |  
| pgdemote_proactive  | uint64  |  
| pgsteal_kswapd  | uint64  |  
| pgsteal_direct  | uint64  |  
| pgsteal_khugepaged  | uint64  |  
| pgsteal_proactive  | uint64  |  
| pgscan_kswapd  | uint64  |  
| pgscan_direct  | uint64  |  
| pgscan_khugepaged  | uint64  |  
| pgscan_proactive  | uint64  |  
| pgrefill  | uint64  |  
| pgpromote_success  | uint64  |  
| pgscan  | uint64  |  
| pgsteal  | uint64  |  
| pswpin  | uint64  |  
| pswpout  | uint64  |  
| pgfault  | uint64  |  
| pgmajfault  | uint64  |  
| pgactivate  | uint64  |  
| pgdeactivate  | uint64  |  
| pglazyfree  | uint64  |  
| pglazyfreed  | uint64  |  
| swpin_zero  | uint64  |  
| swpout_zero  | uint64  |  
| zswpin  | uint64  |  
| zswpout  | uint64  |  
| zswpwb  | uint64  |  
| thp_fault_alloc  | uint64  |  
| thp_collapse_alloc  | uint64  |  
| thp_swpout  | uint64  |  
| thp_swpout_fallback  | uint64  |  
| numa_pages_migrated  | uint64  |  
| numa_pte_updates  | uint64  |  
| numa_hint_faults  | uint64  |  
##  TestEvent
Event used by testing code.
Defined in [test_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/test_event.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| str  | string  | Arbitrary string used in tests.  |  
| seq_value  | uint32  | The current value of the random number sequence used in tests.  |  
| counter  | uint64  | Monotonically increased on each packet.  |  
| is_last  | bool  | No more packets should follow (from the current sequence).  |  
| payload  |  
| protovm_patch  |  
| protovm_incremental_state  | [ProtoVmIncrementalState](https://perfetto.dev/docs/reference/trace-packet-proto#TestEvent.ProtoVmIncrementalState)  |  
###  TestEvent.TestPayload
Defined in [test_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/test_event.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| str  | string[]  |  
| nested  |  
| single_string  | string  |  
| single_int  | int32  |  
| repeated_ints  | int32[]  |  
| remaining_nesting_depth  | uint32  | When 0 this is the bottom-most nested message.  |  
| debug_annotations  | [DebugAnnotation[]](https://perfetto.dev/docs/reference/trace-packet-proto#DebugAnnotation)  |  
###  TestEvent.ProtoVmPatch
Defined in [test_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/test_event.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| string_to_merge  | string  |  
| int_to_merge  | int32  |  
| single_message  |  
| messages  | [ProtoVmMessage[]](https://perfetto.dev/docs/reference/trace-packet-proto#TestEvent.ProtoVmMessage)  |  
| delete_message_ids  | uint32[]  |  
###  TestEvent.ProtoVmMessage
Simple ProtoVm patch and incremental state formats used for testing
Defined in [test_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/test_event.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| id  | uint32  |  
| submessage  |  
###  TestEvent.ProtoVmMessage.ProtoVmSubmessage
Defined in [test_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/test_event.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| single_int  | uint32  |  
###  TestEvent.ProtoVmIncrementalState
Defined in [test_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/test_event.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| string_merged  | string  |  
| int_merged  | int32  |  
| single_message  |  
| messages  | [ProtoVmMessage[]](https://perfetto.dev/docs/reference/trace-packet-proto#TestEvent.ProtoVmMessage)  |  
##  InternedData
------------------------------ DATA INTERNING: ------------------------------ Interning indexes are built up gradually by adding the entries contained in each TracePacket of the same packet sequence (packets emitted by the same producer and TraceWriter, see `trusted_packet_sequence_id`). Thus, packets can only refer to interned data from other packets in the same sequence.
The writer will emit new entries when it encounters new internable values that aren't yet in the index. Data in current and subsequent TracePackets can then refer to the entry by its position (interning ID, abbreviated "iid") in its index. An interning ID with value 0 is considered invalid (not set).
##  Because of the incremental build-up, the interning index will miss data when TracePackets are lost, e.g. because a chunk was overridden in the central ring buffer. To avoid invalidation of the whole trace in such a case, the index is periodically reset (see SEQ_INCREMENTAL_STATE_CLEARED). When packet loss occurs, the reader will only lose interning data up to the next reset.
Message that contains new entries for the interning indices of a packet sequence.
The writer will usually emit new entries in the same TracePacket that first refers to them (since the last reset of interning state). They may also be emitted proactively in advance of referring to them in later packets.
Each field's message type needs to specify an `iid` field, which is the ID of the entry in the field's interning index. Each field constructs its own index, thus interning IDs are scoped to the tracing session and field (usually as a counter for efficient var-int encoding), and optionally to the incremental state generation of the packet sequence.
Note: field IDs up to 15 should be used for frequent data only.
Defined in [interned_data.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/interned_data/interned_data.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| event_categories  | [EventCategory[]](https://perfetto.dev/docs/reference/trace-packet-proto#EventCategory)  | == STABLE PUBLIC API: TrackEvent == Interning for the stable TrackEvent API (see trace_packet.proto and docs/instrumentation/track-events.md).  |  
| event_names  |  
| debug_annotation_names  | [DebugAnnotationName[]](https://perfetto.dev/docs/reference/trace-packet-proto#DebugAnnotationName)  |  
| debug_annotation_value_type_names  | [DebugAnnotationValueTypeName[]](https://perfetto.dev/docs/reference/trace-packet-proto#DebugAnnotationValueTypeName)  |  
| debug_annotation_string_values  | [InternedString[]](https://perfetto.dev/docs/reference/trace-packet-proto#InternedString)  | Interned string values in the DebugAnnotation proto.  |  
| correlation_id_str  | [InternedString[]](https://perfetto.dev/docs/reference/trace-packet-proto#InternedString)  | Interned correlation ids in track_event.  |  
| track_dimension_strings  | [InternedString[]](https://perfetto.dev/docs/reference/trace-packet-proto#InternedString)  | Interned names, string values and display names of TrackDimensions (see TrackDimension.name_iid, string_value_iid and display_name_iid).  |  
| build_ids  | [InternedString[]](https://perfetto.dev/docs/reference/trace-packet-proto#InternedString)  | == STABLE PUBLIC API: Callstacks and symbolization == Interned callstacks, frames, mappings and symbol strings. Referenced by the stable TrackEvent callstack fields (TrackEvent.callstack_iid) and by the StackSample API. Build IDs of exectuable files.  |  
| mapping_paths  | [InternedString[]](https://perfetto.dev/docs/reference/trace-packet-proto#InternedString)  | Paths to executable files.  |  
| source_paths  | [InternedString[]](https://perfetto.dev/docs/reference/trace-packet-proto#InternedString)  | Paths to source files.  |  
| function_names  | [InternedString[]](https://perfetto.dev/docs/reference/trace-packet-proto#InternedString)  | Names of functions used in frames below.  |  
| mappings  | Executable files mapped into processes.  |  
| frames  | Frames of callstacks of a program.  |  
| callstacks  | A callstack of a program.  |  
| stack_sample_task_contexts  | [StackSample.TaskContext[]](https://perfetto.dev/docs/reference/trace-packet-proto#StackSample.TaskContext)  | == STABLE PUBLIC API: StackSample == Interned StackSample context and descriptors, referenced by iid from StackSample. See protos/perfetto/trace/profiling/stack_sample.proto.  |  
| stack_sample_execution_contexts  | [StackSample.ExecutionContext[]](https://perfetto.dev/docs/reference/trace-packet-proto#StackSample.ExecutionContext)  |  
| stack_sample_counter_descriptors  | [StackSample.CounterDescriptor[]](https://perfetto.dev/docs/reference/trace-packet-proto#StackSample.CounterDescriptor)  |  
| stack_sample_async_context_descriptors  | [StackSample.AsyncContextDescriptor[]](https://perfetto.dev/docs/reference/trace-packet-proto#StackSample.AsyncContextDescriptor)  |  
| source_locations  | [SourceLocation[]](https://perfetto.dev/docs/reference/trace-packet-proto#SourceLocation)  | Interning for the non-stable TrackEvent arguments below the "NOT part of the stable public API" line in track_event.proto: source_location, log_message and chrome_histogram_sample (Chrome/Android internal).  |  
| unsymbolized_source_locations  | [UnsymbolizedSourceLocation[]](https://perfetto.dev/docs/reference/trace-packet-proto#UnsymbolizedSourceLocation)  |  
| log_message_body  | [LogMessageBody[]](https://perfetto.dev/docs/reference/trace-packet-proto#LogMessageBody)  |  
| histogram_names  | [HistogramName[]](https://perfetto.dev/docs/reference/trace-packet-proto#HistogramName)  |  
| vulkan_memory_keys  | [InternedString[]](https://perfetto.dev/docs/reference/trace-packet-proto#InternedString)  | Additional Vulkan information sent in a VulkanMemoryEvent message  |  
| graphics_contexts  | [InternedGraphicsContext[]](https://perfetto.dev/docs/reference/trace-packet-proto#InternedGraphicsContext)  | Graphics context of a render stage event. This represent the GL context for an OpenGl app or the VkDevice for a Vulkan app.  |  
| gpu_specifications  | [InternedGpuRenderStageSpecification[]](https://perfetto.dev/docs/reference/trace-packet-proto#InternedGpuRenderStageSpecification)  | Description of a GPU hardware queue or render stage.  |  
| gpu_counter_descriptors  | [InternedGpuCounterDescriptor[]](https://perfetto.dev/docs/reference/trace-packet-proto#InternedGpuCounterDescriptor)  | Description of GPU counters available in a data source.  |  
| kernel_symbols  | [InternedString[]](https://perfetto.dev/docs/reference/trace-packet-proto#InternedString)  | This is set when FtraceConfig.symbolize_ksyms = true.The id of each symbol the number that will be reported in ftrace events like sched_block_reason.caller and is obtained from a monotonic counter.The same symbol can have different indexes in different bundles.This is is NOT the real address. This is to avoid disclosing KASLR through traces.  |  
| v8_js_function_name  | [InternedV8String[]](https://perfetto.dev/docs/reference/trace-packet-proto#InternedV8String)  | Interned name of a js function. We only intern js functions as there is a lot of duplication for them, but less so for other strings in the V8 data source.  |  
| v8_js_function  | [InternedV8JsFunction[]](https://perfetto.dev/docs/reference/trace-packet-proto#InternedV8JsFunction)  | Js functions can be emitted multiple times for various compilation tiers, so it makes sense to deduplicate all this.  |  
| v8_js_script  | [InternedV8JsScript[]](https://perfetto.dev/docs/reference/trace-packet-proto#InternedV8JsScript)  | Interned JS script (there is one associated with each JS function)  |  
| v8_wasm_script  | [InternedV8WasmScript[]](https://perfetto.dev/docs/reference/trace-packet-proto#InternedV8WasmScript)  | Interned Wasm script (there is one associated with each Wasm function)  |  
| v8_isolate  | [InternedV8Isolate[]](https://perfetto.dev/docs/reference/trace-packet-proto#InternedV8Isolate)  | Every V8 event is associated with an isolate, intern the isolate to remove duplication.  |  
###  EventCategory
Defined in [track_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/track_event.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| iid  | uint64  |  
| name  | string  |  
###  EventName
Defined in [track_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/track_event.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| iid  | uint64  |  
| name  | string  |  
###  DebugAnnotationName
Defined in [debug_annotation.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/debug_annotation.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| iid  | uint64  |  
| name  | string  |  
###  DebugAnnotationValueTypeName
See the `proto_type_descriptor` comment.
Defined in [debug_annotation.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/debug_annotation.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| iid  | uint64  |  
| name  | string  |  
###  StackSample.AsyncContextDescriptor
Describes an async context referenced by TaskContext.async_id: a stackful unit of execution that is not an OS thread (goroutine, fiber, coroutine).
Defined in [stack_sample.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/profiling/stack_sample.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| iid  | uint64  | Interning key, equal to the TaskContext.async_id it describes. Starts from 1, 0 is the same as "not set".  |  
| name  | string  | A human-readable name for this specific context, e.g. "worker-7".  |  
| kind  | string  | The kind of async context, e.g. "goroutine", "fiber".  |  
| parent_iid  | uint64  | iid of the structural parent AsyncContextDescriptor, if any.  |  
###  UnsymbolizedSourceLocation
A source location, represented as a native symbol. This is similar to `message Frame` from protos/perfetto/trace/profiling/profile_common.proto, but for abitrary source code locations (for example in track event args), not stack frames.
Defined in [source_location.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/source_location.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| iid  | uint64  |  
| mapping_id  | uint64  |  
| rel_pc  | uint64  |  
###  LogMessageBody
Defined in [log_message.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/log_message.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| iid  | uint64  |  
| body  | string  |  
###  HistogramName
Defined in [chrome_histogram_sample.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/chrome_histogram_sample.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| iid  | uint64  |  
| name  | string  |  
###  InternedGraphicsContext
The iid is the numeric value of either the GL Context or the VkDevice handle.
Defined in [gpu_render_stage_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/gpu/gpu_render_stage_event.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| iid  | uint64  |  
| pid  | int32  |  
| api  |  
###  InternedGraphicsContext.Api
Defined in [gpu_render_stage_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/gpu/gpu_render_stage_event.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| UNDEFINED  | 0  |  
| OPEN_GL  | 1  |  
| VULKAN  | 2  |  
| OPEN_CL  | 3  |  
| CUDA  | 4  |  
| HIP  | 5  |  
###  InternedGpuRenderStageSpecification
Defined in [gpu_render_stage_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/gpu/gpu_render_stage_event.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| iid  | uint64  |  
| name  | string  |  
| description  | string  |  
| category  | [RenderStageCategory](https://perfetto.dev/docs/reference/trace-packet-proto#InternedGpuRenderStageSpecification.RenderStageCategory)  |  
###  InternedGpuRenderStageSpecification.RenderStageCategory
Defined in [gpu_render_stage_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/gpu/gpu_render_stage_event.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| OTHER  | 0  |  
| GRAPHICS  | 1  |  
| COMPUTE  | 2  |  
###  InternedGpuCounterDescriptor
Interned GPU counter descriptor for sequence-scoped counter specs.
Defined in [gpu_counter_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/gpu/gpu_counter_event.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| iid  | uint64  |  
| counter_descriptor  | [GpuCounterDescriptor](https://perfetto.dev/docs/reference/trace-packet-proto#GpuCounterDescriptor)  |  
| gpu_id  | int32  | optional. Identifier for GPU in a multi-gpu device.  |  
###  InternedV8String
Interned version of V8String
Defined in [v8.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/chrome/v8.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| iid  | uint64  |  
| latin1  | bytes  | ISO/IEC 8859-1:1998 encoding aka latin1 <https://en.wikipedia.org/wiki/ISO/IEC_8859-1>  |  
| utf16_le  | bytes  | UTF-16 Little Endian Encoding  |  
| utf16_be  | bytes  | UTF-16 Big Endian Encoding  |  
###  InternedV8JsFunction
Defined in [v8.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/chrome/v8.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| iid  | uint64  |  
| v8_js_function_name_iid  | uint64  |  
| v8_js_script_iid  | uint64  |  
| is_toplevel  | bool  |  
| kind  |  
| byte_offset  | uint32  | Where in the script source this function is defined. This is counted in bytes not characters.  |  
| line  | uint32  |  
| column  | uint32  |  
###  InternedV8JsFunction.Kind
Defined in [v8.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/chrome/v8.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| KIND_UNKNOWN  | 0  |  
| KIND_NORMAL_FUNCTION  | 1  |  
| KIND_MODULE  | 2  |  
| KIND_ASYNC_MODULE  | 3  |  
| KIND_BASE_CONSTRUCTOR  | 4  |  
| KIND_DEFAULT_BASE_CONSTRUCTOR  | 5  |  
| KIND_DEFAULT_DERIVED_CONSTRUCTOR  | 6  |  
| KIND_DERIVED_CONSTRUCTOR  | 7  |  
| KIND_GETTER_FUNCTION  | 8  |  
| KIND_STATIC_GETTER_FUNCTION  | 9  |  
| KIND_SETTER_FUNCTION  | 10  |  
| KIND_STATIC_SETTER_FUNCTION  | 11  |  
| KIND_ARROW_FUNCTION  | 12  |  
| KIND_ASYNC_ARROW_FUNCTION  | 13  |  
| KIND_ASYNC_FUNCTION  | 14  |  
| KIND_ASYNC_CONCISE_METHOD  | 15  |  
| KIND_STATIC_ASYNC_CONCISE_METHOD  | 16  |  
| KIND_ASYNC_CONCISE_GENERATOR_METHOD  | 17  |  
| KIND_STATIC_ASYNC_CONCISE_GENERATOR_METHOD  | 18  |  
| KIND_ASYNC_GENERATOR_FUNCTION  | 19  |  
| KIND_GENERATOR_FUNCTION  | 20  |  
| KIND_CONCISE_GENERATOR_METHOD  | 21  |  
| KIND_STATIC_CONCISE_GENERATOR_METHOD  | 22  |  
| KIND_CONCISE_METHOD  | 23  |  
| KIND_STATIC_CONCISE_METHOD  | 24  |  
| KIND_CLASS_MEMBERS_INITIALIZER_FUNCTION  | 25  |  
| KIND_CLASS_STATIC_INITIALIZER_FUNCTION  | 26  |  
| KIND_INVALID  | 27  |  
###  InternedV8JsScript
Represents a script that was compiled to generate code. Some V8 code is generated out of scripts and will reference a V8Script other types of code will not (e.g. builtins).
Defined in [v8.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/chrome/v8.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| iid  | uint64  |  
| script_id  | int32  | Unique in a given isolate  |  
| type  |  
| name  |  
| source  | Actual source of the script  |  
###  InternedV8JsScript.Type
Defined in [v8.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/chrome/v8.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| TYPE_UNKNOWN  | 0  |  
| TYPE_NORMAL  | 1  |  
| TYPE_EVAL  | 2  |  
| TYPE_MODULE  | 3  |  
| TYPE_NATIVE  | 4  |  
| TYPE_EXTENSION  | 5  |  
| TYPE_INSPECTOR  | 6  |  
###  InternedV8WasmScript
Defined in [v8.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/chrome/v8.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| iid  | uint64  |  
| script_id  | int32  | Unique in a given isolate  |  
| url  | string  |  
| wire_bytes  | bytes  | Raw transferred wasm native module wire bytes.  |  
###  InternedV8Isolate
A V8 Isolate instance. A V8 Isolate represents an isolated instance of the V8 engine.
Defined in [v8.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/chrome/v8.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| iid  | uint64  |  
| pid  | uint32  |  
| isolate_id  | int32  | Process unique isolate id.  |  
| code_range  |  
| embedded_blob_code_start_address  | uint64  | The embedded blob holds code for built in functions that are precompiled in the V8 library.  |  
| embedded_blob_code_size  | uint64  |  
###  InternedV8Isolate.CodeRange
A code range is a virtual memory cage that may contain executable code. Depending on the Isolate settings the Isolate might have one or not. See: <https://source.chromium.org/chromium/chromium/src/+/main:v8/src/heap/code-range.h> If the isolate defines code range this will be tracked here.
Defined in [v8.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/chrome/v8.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| base_address  | uint64  |  
| size  | uint64  |  
| embedded_blob_code_copy_start_address  | uint64  | Used when short builtin calls are enabled, where embedded builtins are copied into the CodeRange so calls can be nearer.  |  
| is_process_wide  | bool  | Whether this code range is shared with other Isolates in the same process  |  
##  TracePacketDefaults
Default values for TracePacket fields that hold for a particular TraceWriter packet sequence. This message contains a subset of the TracePacket fields with matching IDs. When provided, these fields define the default values that should be applied, at import time, to all TracePacket(s) with the same `trusted_packet_sequence_id`, unless otherwise specified in each packet.
Should be reemitted whenever incremental state is cleared on the sequence.
Defined in [trace_packet_defaults.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/trace_packet_defaults.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| timestamp_clock_id  | uint32  |  
| track_event_defaults  | [TrackEventDefaults](https://perfetto.dev/docs/reference/trace-packet-proto#TrackEventDefaults)  | Default values for TrackEvents (e.g. default track).  |  
| perf_sample_defaults  | [PerfSampleDefaults](https://perfetto.dev/docs/reference/trace-packet-proto#PerfSampleDefaults)  | Defaults for perf profiler packets (PerfSample).  |  
| stack_sample_defaults  | [StackSampleDefaults](https://perfetto.dev/docs/reference/trace-packet-proto#StackSampleDefaults)  | Defaults for transport-neutral stack sampling packets (StackSample).  |  
| v8_code_defaults  | [V8CodeDefaults](https://perfetto.dev/docs/reference/trace-packet-proto#V8CodeDefaults)  | Defaults for V8 code packets (V8JsCode, V8InternalCode, V8WasmCode, V8RegexpCode)  |  
###  TrackEventDefaults
Default values for fields of all TrackEvents on the same packet sequence. Should be emitted as part of TracePacketDefaults whenever incremental state is cleared. It's defined here because field IDs should match those of the corresponding fields in TrackEvent.
Defined in [track_event.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/track_event/track_event.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| track_uuid  | uint64  |  
| extra_counter_track_uuids  | uint64[]  |  
| extra_double_counter_track_uuids  | uint64[]  |  
###  PerfSampleDefaults
Submessage for TracePacketDefaults.
Defined in [profile_packet.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/profiling/profile_packet.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| timebase  | [PerfEvents.Timebase](https://perfetto.dev/docs/reference/trace-packet-proto#PerfEvents.Timebase)  | The sampling timebase. Might not be identical to the data source config if the implementation decided to default/override some parameters.  |  
| followers  | [FollowerEvent[]](https://perfetto.dev/docs/reference/trace-packet-proto#FollowerEvent)  | Description of followers event  |  
| process_shard_count  | uint32  | If the config requested process sharding, report back the count and which of those bins was selected. Never changes for the duration of a trace.  |  
| chosen_process_shard  | uint32  |  
###  PerfEvents.Timebase
The primary event to count. If recording multiple events, this counter is the "group leader". Commented from the perspective of its use in `PerfEventConfig`.
Defined in [perf_events.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/common/perf_events.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| frequency  | uint64  | Per-cpu sampling frequency in Hz, as requested from the kernel. Not the same as 1/period.Details: the actual sampling will still be based on a period, but the kernel will dynamically adjust it based on the observed event rate, to approximate this frequency. Works best with steady-rate events like timers.Not guaranteed to be honored as the kernel can throttle the sampling rate if it's too high.  |  
| period  | uint64  | Per-cpu sampling will occur every `period` counts of `event`.Prefer `frequency` by default, as it's easier to oversample with a fixed period.Not guaranteed to be honored as the kernel can throttle the sampling rate if it's too high.  |  
| poll_period_ms  | uint32  | Per-cpu values are read by the userspace every interval. If using this mode, only follower events are supported. Options such as  |  
| counter  |  
| tracepoint  |  
| raw_event  |  
| modifiers  | [EventModifier[]](https://perfetto.dev/docs/reference/trace-packet-proto#PerfEvents.EventModifier)  | Optional modifiers for the event. Modelled after the perftool's <https://man7.org/linux/man-pages/man1/perf-list.1.html#EVENT_MODIFIERS> Currently supported: count scoping such as :u, :k, :uk, ...Modifiers can differ between the timebase and followers.  |  
| timestamp_clock  | If set, samples will be timestamped with the given clock.If unset, the clock is chosen by the implementation.For software events, prefer PERF_CLOCK_BOOTTIME. However it cannot be used for hardware events (due to interrupt safety), for which the recommendation is to use one of the monotonic clocks.  |  
| name  | string  | Optional arbitrary name for the event, to identify it in the parsed trace. Does _not_ affect the profiling itself. If unset, the trace parser will choose a suitable name.  |  
###  PerfEvents.Counter
Builtin counter names from the uapi header. Commented with their perf tool aliases. finite), and generally make this list as extensive as possible. Excluding things like dynamic PMUs since those don't fit into a static enum.
Defined in [perf_events.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/common/perf_events.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| UNKNOWN_COUNTER  | 0  |  
| SW_CPU_CLOCK  | 1  | cpu-clock  |  
| SW_PAGE_FAULTS  | 2  | page-faults, faults  |  
| SW_TASK_CLOCK  | 3  | task-clock  |  
| SW_CONTEXT_SWITCHES  | 4  | context-switches, cs  |  
| SW_CPU_MIGRATIONS  | 5  | cpu-migrations, migrations  |  
| SW_PAGE_FAULTS_MIN  | 6  | minor-faults  |  
| SW_PAGE_FAULTS_MAJ  | 7  | major-faults  |  
| SW_ALIGNMENT_FAULTS  | 8  | alignment-faults  |  
| SW_EMULATION_FAULTS  | 9  | emulation-faults  |  
| SW_DUMMY  | 20  | dummy  |  
| HW_CPU_CYCLES  | 10  | cpu-cycles, cycles  |  
| HW_INSTRUCTIONS  | 11  | instructions  |  
| HW_CACHE_REFERENCES  | 12  | cache-references  |  
| HW_CACHE_MISSES  | 13  | cache-misses  |  
| HW_BRANCH_INSTRUCTIONS  | 14  | branch-instructions, branches  |  
| HW_BRANCH_MISSES  | 15  | branch-misses  |  
| HW_BUS_CYCLES  | 16  | bus-cycles  |  
| HW_STALLED_CYCLES_FRONTEND  | 17  | stalled-cycles-frontend, idle-cycles-frontend  |  
| HW_STALLED_CYCLES_BACKEND  | 18  | stalled-cycles-backend, idle-cycles-backend  |  
| HW_REF_CPU_CYCLES  | 19  | ref-cycles  |  
###  PerfEvents.Tracepoint
Defined in [perf_events.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/common/perf_events.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| name  | string  | Group and name for the tracepoint, acceptable forms:* "sched/sched_switch" * "sched:sched_switch"  |  
| filter  | string  | Optional field-level filter for the tracepoint. Only events matching this filter will be counted (and therefore contribute to the sampling period).Example: "prev_pid >= 42 && next_pid == 0".For full syntax, see kernel documentation on "Event filtering":<https://www.kernel.org/doc/Documentation/trace/events.txt>  |  
###  PerfEvents.RawEvent
Syscall-level description of the event, propagated to the perf_event_attr struct. Primarily for local use-cases, since the event availability and encoding is hardware-specific.
Defined in [perf_events.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/common/perf_events.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| type  | uint32  | Either `type` or `pmu_name` can be set.  |  
| config  | uint64  |  
| config1  | uint64  |  
| config2  | uint64  |  
| pmu_name  | string  | The name of a dynamic PMU under /sys/bus/event_source/devices (e.g. "armv8_pmuv3").If set, leave `type` unset.Android: the relevant sysfs paths are not allowlisted by default, so this option will require a rooted device with selinux disabled.  |  
###  PerfEvents.EventModifier
Defined in [perf_events.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/common/perf_events.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| UNKNOWN_EVENT_MODIFIER  | 0  |  
| EVENT_MODIFIER_COUNT_USERSPACE  | 1  | count only while in userspace  |  
| EVENT_MODIFIER_COUNT_KERNEL  | 2  | count only while in kernel  |  
| EVENT_MODIFIER_COUNT_HYPERVISOR  | 3  | count only while in hypervisor  |  
###  PerfEvents.PerfClock
Subset of clocks that is supported by perf timestamping. CLOCK_TAI is excluded since it's not expected to be used in practice, but would require additions to the trace clock synchronisation logic.
Defined in [perf_events.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/common/perf_events.proto)
#### Enum values:  
| Name  | Value  | Description  |  
| --- | --- | --- |  
| UNKNOWN_PERF_CLOCK  | 0  |  
| PERF_CLOCK_REALTIME  | 1  |  
| PERF_CLOCK_MONOTONIC  | 2  |  
| PERF_CLOCK_MONOTONIC_RAW  | 3  |  
| PERF_CLOCK_BOOTTIME  | 4  |  
###  FollowerEvent
Additional events associated with a leader. See <https://man7.org/linux/man-pages/man1/perf-list.1.html#LEADER_SAMPLING>
Defined in [perf_events.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/common/perf_events.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| counter  | [PerfEvents.Counter](https://perfetto.dev/docs/reference/trace-packet-proto#PerfEvents.Counter)  |  
| tracepoint  | [PerfEvents.Tracepoint](https://perfetto.dev/docs/reference/trace-packet-proto#PerfEvents.Tracepoint)  |  
| raw_event  | [PerfEvents.RawEvent](https://perfetto.dev/docs/reference/trace-packet-proto#PerfEvents.RawEvent)  |  
| modifiers  | [PerfEvents.EventModifier[]](https://perfetto.dev/docs/reference/trace-packet-proto#PerfEvents.EventModifier)  | Modifiers can differ between the timebase and followers.  |  
| name  | string  | Optional arbitrary name for the event, to identify it in the parsed trace. Does _not_ affect the profiling itself. If unset, the trace parser will choose a suitable name.  |  
###  StackSampleDefaults
Per-sequence defaults for StackSample. Lets a producer declare the source and the common timebase / followers once instead of on every sample.
Defined in [stack_sample.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/profiling/stack_sample.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| source  | string  | Identifies the profiler that produced these samples, e.g. "linux.perf", "python.wall". Recorded once per sampling stream.  |  
| primary_descriptor  | [StackSample.CounterDescriptor](https://perfetto.dev/docs/reference/trace-packet-proto#StackSample.CounterDescriptor)  | Default primary timebase for samples that omit their own.  |  
| follower_descriptors  | [StackSample.CounterDescriptor[]](https://perfetto.dev/docs/reference/trace-packet-proto#StackSample.CounterDescriptor)  | Default follower counters, positional with StackSample.follower_weights.  |  
###  V8CodeDefaults
Defined in [v8.proto](https://github.com/google/perfetto/blob/main/protos/perfetto/trace/chrome/v8.proto)
#### Fields:  
| Field  | Type  | Description  |  
| --- | --- | --- |  
| tid  | uint32  |  
  * [TrackEvent.InlineCallstack](https://perfetto.dev/docs/reference/trace-packet-proto#TrackEvent.InlineCallstack)
  * [TrackEvent.InlineCallstack.Frame](https://perfetto.dev/docs/reference/trace-packet-proto#TrackEvent.InlineCallstack.Frame)
  * [DebugAnnotation.NestedValue](https://perfetto.dev/docs/reference/trace-packet-proto#DebugAnnotation.NestedValue)
  * [DebugAnnotation.NestedValue.NestedType](https://perfetto.dev/docs/reference/trace-packet-proto#DebugAnnotation.NestedValue.NestedType)
  * [ChromeCompositorSchedulerState](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeCompositorSchedulerState)
  * [ChromeCompositorStateMachine](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeCompositorStateMachine)
  * [ChromeCompositorStateMachine.MajorState](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeCompositorStateMachine.MajorState)
  * [ChromeCompositorSchedulerAction](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeCompositorSchedulerAction)
  * [ChromeCompositorStateMachine.MajorState.BeginImplFrameState](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeCompositorStateMachine.MajorState.BeginImplFrameState)
  * [ChromeCompositorStateMachine.MajorState.BeginMainFrameState](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeCompositorStateMachine.MajorState.BeginMainFrameState)
  * [ChromeCompositorStateMachine.MajorState.LayerTreeFrameSinkState](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeCompositorStateMachine.MajorState.LayerTreeFrameSinkState)
  * [ChromeCompositorStateMachine.MajorState.ForcedRedrawOnTimeoutState](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeCompositorStateMachine.MajorState.ForcedRedrawOnTimeoutState)
  * [ChromeCompositorStateMachine.MinorState](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeCompositorStateMachine.MinorState)
  * [ChromeCompositorStateMachine.MinorState.TreePriority](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeCompositorStateMachine.MinorState.TreePriority)
  * [ChromeCompositorStateMachine.MinorState.ScrollHandlerState](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeCompositorStateMachine.MinorState.ScrollHandlerState)
  * [ChromeCompositorSchedulerState.BeginImplFrameDeadlineMode](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeCompositorSchedulerState.BeginImplFrameDeadlineMode)
  * [BeginImplFrameArgs.State](https://perfetto.dev/docs/reference/trace-packet-proto#BeginImplFrameArgs.State)
  * [BeginFrameArgs.BeginFrameArgsType](https://perfetto.dev/docs/reference/trace-packet-proto#BeginFrameArgs.BeginFrameArgsType)
  * [BeginImplFrameArgs.TimestampsInUs](https://perfetto.dev/docs/reference/trace-packet-proto#BeginImplFrameArgs.TimestampsInUs)
  * [BeginFrameObserverState](https://perfetto.dev/docs/reference/trace-packet-proto#BeginFrameObserverState)
  * [BeginFrameSourceState](https://perfetto.dev/docs/reference/trace-packet-proto#BeginFrameSourceState)
  * [CompositorTimingHistory](https://perfetto.dev/docs/reference/trace-packet-proto#CompositorTimingHistory)
  * [ChromeLegacyIpc.MessageClass](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeLegacyIpc.MessageClass)
  * [ChromeHistogramSample](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeHistogramSample)
  * [ChromeLatencyInfo.Step](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeLatencyInfo.Step)
  * [ChromeLatencyInfo.ComponentInfo](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeLatencyInfo.ComponentInfo)
  * [ChromeLatencyInfo.LatencyComponentType](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeLatencyInfo.LatencyComponentType)
  * [ChromeLatencyInfo.InputType](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeLatencyInfo.InputType)
  * [ChromeFrameReporter.State](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeFrameReporter.State)
  * [ChromeFrameReporter.FrameDropReason](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeFrameReporter.FrameDropReason)
  * [ChromeFrameReporter.ScrollState](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeFrameReporter.ScrollState)
  * [ChromeFrameReporter.FrameType](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeFrameReporter.FrameType)
  * [ChromeApplicationStateInfo](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeApplicationStateInfo)
  * [ChromeApplicationStateInfo.ChromeApplicationState](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeApplicationStateInfo.ChromeApplicationState)
  * [ChromeRendererSchedulerState](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeRendererSchedulerState)
  * [ChromeWindowHandleEventInfo](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeWindowHandleEventInfo)
  * [ChromeContentSettingsEventInfo](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeContentSettingsEventInfo)
  * [ChromeActiveProcesses](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeActiveProcesses)
  * [TrackEvent.LegacyEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TrackEvent.LegacyEvent)
  * [TrackEvent.LegacyEvent.FlowDirection](https://perfetto.dev/docs/reference/trace-packet-proto#TrackEvent.LegacyEvent.FlowDirection)
  * [TrackEvent.LegacyEvent.InstantEventScope](https://perfetto.dev/docs/reference/trace-packet-proto#TrackEvent.LegacyEvent.InstantEventScope)
  * [ProcessDescriptor.ChromeProcessType](https://perfetto.dev/docs/reference/trace-packet-proto#ProcessDescriptor.ChromeProcessType)
  * [ChromeProcessDescriptor](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeProcessDescriptor)
  * [ThreadDescriptor.ChromeThreadType](https://perfetto.dev/docs/reference/trace-packet-proto#ThreadDescriptor.ChromeThreadType)
  * [ChromeThreadDescriptor](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeThreadDescriptor)
  * [CounterDescriptor.BuiltinCounterType](https://perfetto.dev/docs/reference/trace-packet-proto#CounterDescriptor.BuiltinCounterType)
  * [CounterDescriptor.Unit](https://perfetto.dev/docs/reference/trace-packet-proto#CounterDescriptor.Unit)
  * [TrackDescriptor.ChildTracksOrdering](https://perfetto.dev/docs/reference/trace-packet-proto#TrackDescriptor.ChildTracksOrdering)
  * [TrackDescriptor.SiblingMergeBehavior](https://perfetto.dev/docs/reference/trace-packet-proto#TrackDescriptor.SiblingMergeBehavior)
  * [TrackDescriptor.ProcessOrdering](https://perfetto.dev/docs/reference/trace-packet-proto#TrackDescriptor.ProcessOrdering)
  * [TrackDescriptor.ThreadOrdering](https://perfetto.dev/docs/reference/trace-packet-proto#TrackDescriptor.ThreadOrdering)
  * [GenericKernelTaskStateEvent](https://perfetto.dev/docs/reference/trace-packet-proto#GenericKernelTaskStateEvent)
  * [GenericKernelTaskStateEvent.TaskStateEnum](https://perfetto.dev/docs/reference/trace-packet-proto#GenericKernelTaskStateEvent.TaskStateEnum)
  * [GenericKernelCpuFrequencyEvent](https://perfetto.dev/docs/reference/trace-packet-proto#GenericKernelCpuFrequencyEvent)
  * [GenericKernelTaskRenameEvent](https://perfetto.dev/docs/reference/trace-packet-proto#GenericKernelTaskRenameEvent)
  * [GenericKernelProcessTree](https://perfetto.dev/docs/reference/trace-packet-proto#GenericKernelProcessTree)
  * [GenericKernelProcessTree.Process](https://perfetto.dev/docs/reference/trace-packet-proto#GenericKernelProcessTree.Process)
  * [GenericKernelProcessTree.Thread](https://perfetto.dev/docs/reference/trace-packet-proto#GenericKernelProcessTree.Thread)
  * [GenericGpuFrequencyEvent](https://perfetto.dev/docs/reference/trace-packet-proto#GenericGpuFrequencyEvent)
  * [TrackEventRangeOfInterest](https://perfetto.dev/docs/reference/trace-packet-proto#TrackEventRangeOfInterest)
  * [InodeFileMap.Entry.Type](https://perfetto.dev/docs/reference/trace-packet-proto#InodeFileMap.Entry.Type)
  * [ChromeTracedValue.NestedType](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeTracedValue.NestedType)
  * [ChromeLegacyJsonTrace](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeLegacyJsonTrace)
  * [ChromeLegacyJsonTrace.TraceType](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeLegacyJsonTrace.TraceType)
  * [ChromeStringTableEntry](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeStringTableEntry)
  * [SysStats.MeminfoValue](https://perfetto.dev/docs/reference/trace-packet-proto#SysStats.MeminfoValue)
  * [SysStats.InterruptCount](https://perfetto.dev/docs/reference/trace-packet-proto#SysStats.InterruptCount)
  * [SysStats.DevfreqValue](https://perfetto.dev/docs/reference/trace-packet-proto#SysStats.DevfreqValue)
  * [SysStats.PsiSample.PsiResource](https://perfetto.dev/docs/reference/trace-packet-proto#SysStats.PsiSample.PsiResource)
  * [SysStats.CpuIdleState](https://perfetto.dev/docs/reference/trace-packet-proto#SysStats.CpuIdleState)
  * [SysStats.CpuIdleStateEntry](https://perfetto.dev/docs/reference/trace-packet-proto#SysStats.CpuIdleStateEntry)
  * [TraceStats.BufferStats](https://perfetto.dev/docs/reference/trace-packet-proto#TraceStats.BufferStats)
  * [TraceStats.WriterStats](https://perfetto.dev/docs/reference/trace-packet-proto#TraceStats.WriterStats)
  * [TraceStats.FilterStats](https://perfetto.dev/docs/reference/trace-packet-proto#TraceStats.FilterStats)
  * [TraceStats.FinalFlushOutcome](https://perfetto.dev/docs/reference/trace-packet-proto#TraceStats.FinalFlushOutcome)
  * [ExperimentalTracingV2ProducerStats](https://perfetto.dev/docs/reference/trace-packet-proto#ExperimentalTracingV2ProducerStats)
  * [Memory allocator profiling](https://perfetto.dev/docs/reference/trace-packet-proto#memory-allocator-profiling)
  * [Callstack and performance counter sampling](https://perfetto.dev/docs/reference/trace-packet-proto#callstack-and-performance-counter-sampling)
  * [ProfilePacket.ProcessHeapSamples](https://perfetto.dev/docs/reference/trace-packet-proto#ProfilePacket.ProcessHeapSamples)
  * [ProfilePacket.ProcessHeapSamples.ClientError](https://perfetto.dev/docs/reference/trace-packet-proto#ProfilePacket.ProcessHeapSamples.ClientError)
  * [ProfilePacket.ProcessStats](https://perfetto.dev/docs/reference/trace-packet-proto#ProfilePacket.ProcessStats)
  * [ProfilePacket.Histogram](https://perfetto.dev/docs/reference/trace-packet-proto#ProfilePacket.Histogram)
  * [ProfilePacket.Histogram.Bucket](https://perfetto.dev/docs/reference/trace-packet-proto#ProfilePacket.Histogram.Bucket)
  * [ProfilePacket.HeapSample](https://perfetto.dev/docs/reference/trace-packet-proto#ProfilePacket.HeapSample)
  * [PowerRails.RailDescriptor](https://perfetto.dev/docs/reference/trace-packet-proto#PowerRails.RailDescriptor)
  * [PowerRails.EnergyData](https://perfetto.dev/docs/reference/trace-packet-proto#PowerRails.EnergyData)
  * [AndroidLogPacket.LogEvent](https://perfetto.dev/docs/reference/trace-packet-proto#AndroidLogPacket.LogEvent)
  * [AndroidLogPacket.LogEvent.Arg](https://perfetto.dev/docs/reference/trace-packet-proto#AndroidLogPacket.LogEvent.Arg)
  * [AndroidLogPacket.Stats](https://perfetto.dev/docs/reference/trace-packet-proto#AndroidLogPacket.Stats)
  * [PackagesList.PackageInfo](https://perfetto.dev/docs/reference/trace-packet-proto#PackagesList.PackageInfo)
  * [ChromeBenchmarkMetadata](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeBenchmarkMetadata)
  * [PerfettoMetatrace.Arg](https://perfetto.dev/docs/reference/trace-packet-proto#PerfettoMetatrace.Arg)
  * [PerfettoMetatrace.InternedString](https://perfetto.dev/docs/reference/trace-packet-proto#PerfettoMetatrace.InternedString)
  * [BackgroundTracingMetadata](https://perfetto.dev/docs/reference/trace-packet-proto#BackgroundTracingMetadata)
  * [BackgroundTracingMetadata.TriggerRule](https://perfetto.dev/docs/reference/trace-packet-proto#BackgroundTracingMetadata.TriggerRule)
  * [BackgroundTracingMetadata.TriggerRule.TriggerType](https://perfetto.dev/docs/reference/trace-packet-proto#BackgroundTracingMetadata.TriggerRule.TriggerType)
  * [BackgroundTracingMetadata.TriggerRule.HistogramRule](https://perfetto.dev/docs/reference/trace-packet-proto#BackgroundTracingMetadata.TriggerRule.HistogramRule)
  * [BackgroundTracingMetadata.TriggerRule.NamedRule](https://perfetto.dev/docs/reference/trace-packet-proto#BackgroundTracingMetadata.TriggerRule.NamedRule)
  * [BackgroundTracingMetadata.TriggerRule.NamedRule.EventType](https://perfetto.dev/docs/reference/trace-packet-proto#BackgroundTracingMetadata.TriggerRule.NamedRule.EventType)
  * [ChromeMetadataPacket.FinchHash](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeMetadataPacket.FinchHash)
  * [GpuCounterDescriptor.GpuCounterSpec](https://perfetto.dev/docs/reference/trace-packet-proto#GpuCounterDescriptor.GpuCounterSpec)
  * [GpuCounterDescriptor.MeasureUnit](https://perfetto.dev/docs/reference/trace-packet-proto#GpuCounterDescriptor.MeasureUnit)
  * [GpuCounterDescriptor.GpuCounterGroup](https://perfetto.dev/docs/reference/trace-packet-proto#GpuCounterDescriptor.GpuCounterGroup)
  * [GpuCounterDescriptor.GpuCounterSpec.ValueDirection](https://perfetto.dev/docs/reference/trace-packet-proto#GpuCounterDescriptor.GpuCounterSpec.ValueDirection)
  * [GpuCounterDescriptor.GpuCounterBlock](https://perfetto.dev/docs/reference/trace-packet-proto#GpuCounterDescriptor.GpuCounterBlock)
  * [GpuCounterDescriptor.GpuCounterGroupSpec](https://perfetto.dev/docs/reference/trace-packet-proto#GpuCounterDescriptor.GpuCounterGroupSpec)
  * [GpuCounterEvent.GpuCounter](https://perfetto.dev/docs/reference/trace-packet-proto#GpuCounterEvent.GpuCounter)
  * [GpuRenderStageEvent.ExtraData](https://perfetto.dev/docs/reference/trace-packet-proto#GpuRenderStageEvent.ExtraData)
  * [GpuRenderStageEvent.ComputeKernelLaunch](https://perfetto.dev/docs/reference/trace-packet-proto#GpuRenderStageEvent.ComputeKernelLaunch)
  * [GpuRenderStageEvent.Dim3](https://perfetto.dev/docs/reference/trace-packet-proto#GpuRenderStageEvent.Dim3)
  * [GpuRenderStageEvent.ExtraComputeArg](https://perfetto.dev/docs/reference/trace-packet-proto#GpuRenderStageEvent.ExtraComputeArg)
  * [GpuRenderStageEvent.Specifications](https://perfetto.dev/docs/reference/trace-packet-proto#GpuRenderStageEvent.Specifications)
  * [GpuRenderStageEvent.Specifications.ContextSpec](https://perfetto.dev/docs/reference/trace-packet-proto#GpuRenderStageEvent.Specifications.ContextSpec)
  * [GpuRenderStageEvent.Specifications.Description](https://perfetto.dev/docs/reference/trace-packet-proto#GpuRenderStageEvent.Specifications.Description)
  * [StreamingProfilePacket](https://perfetto.dev/docs/reference/trace-packet-proto#StreamingProfilePacket)
  * [GraphicsFrameEvent.BufferEvent](https://perfetto.dev/docs/reference/trace-packet-proto#GraphicsFrameEvent.BufferEvent)
  * [GraphicsFrameEvent.BufferEventType](https://perfetto.dev/docs/reference/trace-packet-proto#GraphicsFrameEvent.BufferEventType)
  * [VulkanMemoryEvent.Source](https://perfetto.dev/docs/reference/trace-packet-proto#VulkanMemoryEvent.Source)
  * [VulkanMemoryEvent.Operation](https://perfetto.dev/docs/reference/trace-packet-proto#VulkanMemoryEvent.Operation)
  * [VulkanMemoryEvent.AllocationScope](https://perfetto.dev/docs/reference/trace-packet-proto#VulkanMemoryEvent.AllocationScope)
  * [VulkanMemoryEventAnnotation](https://perfetto.dev/docs/reference/trace-packet-proto#VulkanMemoryEventAnnotation)
  * [VulkanApiEvent.VkDebugUtilsObjectName](https://perfetto.dev/docs/reference/trace-packet-proto#VulkanApiEvent.VkDebugUtilsObjectName)
  * [VulkanApiEvent.VkQueueSubmit](https://perfetto.dev/docs/reference/trace-packet-proto#VulkanApiEvent.VkQueueSubmit)
  * [Profiling.StackUnwindError](https://perfetto.dev/docs/reference/trace-packet-proto#Profiling.StackUnwindError)
  * [PerfSample.SampleSkipReason](https://perfetto.dev/docs/reference/trace-packet-proto#PerfSample.SampleSkipReason)
  * [PerfSample.ProducerEvent](https://perfetto.dev/docs/reference/trace-packet-proto#PerfSample.ProducerEvent)
  * [PerfSample.ProducerEvent.DataSourceStopReason](https://perfetto.dev/docs/reference/trace-packet-proto#PerfSample.ProducerEvent.DataSourceStopReason)
  * [CpuInfo.ArmCpuIdentifier](https://perfetto.dev/docs/reference/trace-packet-proto#CpuInfo.ArmCpuIdentifier)
  * [SmapsPacket.RecordingType](https://perfetto.dev/docs/reference/trace-packet-proto#SmapsPacket.RecordingType)
  * [TracingServiceEvent.DataSources](https://perfetto.dev/docs/reference/trace-packet-proto#TracingServiceEvent.DataSources)
  * [TracingServiceEvent.DataSources.DataSource](https://perfetto.dev/docs/reference/trace-packet-proto#TracingServiceEvent.DataSources.DataSource)
  * [ConcurrentSessionEvent](https://perfetto.dev/docs/reference/trace-packet-proto#ConcurrentSessionEvent)
  * [ConcurrentSessionEvent.State](https://perfetto.dev/docs/reference/trace-packet-proto#ConcurrentSessionEvent.State)
  * [StackSample.TaskContext](https://perfetto.dev/docs/reference/trace-packet-proto#StackSample.TaskContext)
  * [StackSample.ExecutionContext](https://perfetto.dev/docs/reference/trace-packet-proto#StackSample.ExecutionContext)
  * [InlineCallstack.Frame](https://perfetto.dev/docs/reference/trace-packet-proto#InlineCallstack.Frame)
  * [StackSample.CounterDescriptor](https://perfetto.dev/docs/reference/trace-packet-proto#StackSample.CounterDescriptor)
  * [StackSample.CounterDescriptor.Scope](https://perfetto.dev/docs/reference/trace-packet-proto#StackSample.CounterDescriptor.Scope)
  * [MemoryTrackerSnapshot](https://perfetto.dev/docs/reference/trace-packet-proto#MemoryTrackerSnapshot)
  * [MemoryTrackerSnapshot.LevelOfDetail](https://perfetto.dev/docs/reference/trace-packet-proto#MemoryTrackerSnapshot.LevelOfDetail)
  * [MemoryTrackerSnapshot.ProcessSnapshot](https://perfetto.dev/docs/reference/trace-packet-proto#MemoryTrackerSnapshot.ProcessSnapshot)
  * [MemoryTrackerSnapshot.ProcessSnapshot.MemoryNode](https://perfetto.dev/docs/reference/trace-packet-proto#MemoryTrackerSnapshot.ProcessSnapshot.MemoryNode)
  * [MemoryTrackerSnapshot.ProcessSnapshot.MemoryNode.MemoryNodeEntry](https://perfetto.dev/docs/reference/trace-packet-proto#MemoryTrackerSnapshot.ProcessSnapshot.MemoryNode.MemoryNodeEntry)
  * [MemoryTrackerSnapshot.ProcessSnapshot.MemoryNode.MemoryNodeEntry.Units](https://perfetto.dev/docs/reference/trace-packet-proto#MemoryTrackerSnapshot.ProcessSnapshot.MemoryNode.MemoryNodeEntry.Units)
  * [MemoryTrackerSnapshot.ProcessSnapshot.MemoryEdge](https://perfetto.dev/docs/reference/trace-packet-proto#MemoryTrackerSnapshot.ProcessSnapshot.MemoryEdge)
  * [AndroidEnergyEstimationBreakdown](https://perfetto.dev/docs/reference/trace-packet-proto#AndroidEnergyEstimationBreakdown)
  * [AndroidEnergyConsumerDescriptor](https://perfetto.dev/docs/reference/trace-packet-proto#AndroidEnergyConsumerDescriptor)
  * [AndroidEnergyConsumer](https://perfetto.dev/docs/reference/trace-packet-proto#AndroidEnergyConsumer)
  * [AndroidEnergyEstimationBreakdown.EnergyUidBreakdown](https://perfetto.dev/docs/reference/trace-packet-proto#AndroidEnergyEstimationBreakdown.EnergyUidBreakdown)
  * [UiState.HighlightProcess](https://perfetto.dev/docs/reference/trace-packet-proto#UiState.HighlightProcess)
  * [ChromeHistorgramTranslationTable](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeHistorgramTranslationTable)
  * [ChromeUserEventTranslationTable](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeUserEventTranslationTable)
  * [ChromePerformanceMarkTranslationTable](https://perfetto.dev/docs/reference/trace-packet-proto#ChromePerformanceMarkTranslationTable)
  * [SliceNameTranslationTable](https://perfetto.dev/docs/reference/trace-packet-proto#SliceNameTranslationTable)
  * [ProcessTrackNameTranslationTable](https://perfetto.dev/docs/reference/trace-packet-proto#ProcessTrackNameTranslationTable)
  * [ChromeStudyTranslationTable](https://perfetto.dev/docs/reference/trace-packet-proto#ChromeStudyTranslationTable)
  * [AndroidGameInterventionList](https://perfetto.dev/docs/reference/trace-packet-proto#AndroidGameInterventionList)
  * [AndroidGameInterventionList.GamePackageInfo](https://perfetto.dev/docs/reference/trace-packet-proto#AndroidGameInterventionList.GamePackageInfo)
  * [AndroidGameInterventionList.GameModeInfo](https://perfetto.dev/docs/reference/trace-packet-proto#AndroidGameInterventionList.GameModeInfo)
  * [AndroidSystemProperty](https://perfetto.dev/docs/reference/trace-packet-proto#AndroidSystemProperty)
  * [AndroidSystemProperty.PropertyValue](https://perfetto.dev/docs/reference/trace-packet-proto#AndroidSystemProperty.PropertyValue)
  * [EntityStateResidency.PowerEntityState](https://perfetto.dev/docs/reference/trace-packet-proto#EntityStateResidency.PowerEntityState)
  * [EntityStateResidency.StateResidency](https://perfetto.dev/docs/reference/trace-packet-proto#EntityStateResidency.StateResidency)
  * [TraceProvenance.Buffer](https://perfetto.dev/docs/reference/trace-packet-proto#TraceProvenance.Buffer)
  * [TraceProvenance.Sequence](https://perfetto.dev/docs/reference/trace-packet-proto#TraceProvenance.Sequence)
  * [TracePacket.ProtoVms.Instance](https://perfetto.dev/docs/reference/trace-packet-proto#TracePacket.ProtoVms.Instance)
  * [VmOpSelect.PathComponent](https://perfetto.dev/docs/reference/trace-packet-proto#VmOpSelect.PathComponent)
  * [VmInstruction.AbortLevel](https://perfetto.dev/docs/reference/trace-packet-proto#VmInstruction.AbortLevel)
  * [TraceAttributes.Attribute](https://perfetto.dev/docs/reference/trace-packet-proto#TraceAttributes.Attribute)
  * [AndroidAflags.FlagPermission](https://perfetto.dev/docs/reference/trace-packet-proto#AndroidAflags.FlagPermission)
  * [AndroidAflags.ValuePickedFrom](https://perfetto.dev/docs/reference/trace-packet-proto#AndroidAflags.ValuePickedFrom)
  * [AndroidAflags.FlagStorageBackend](https://perfetto.dev/docs/reference/trace-packet-proto#AndroidAflags.FlagStorageBackend)
  * [AndroidAflags.FlagType](https://perfetto.dev/docs/reference/trace-packet-proto#AndroidAflags.FlagType)
  * [InterruptInfo.InterruptMapping](https://perfetto.dev/docs/reference/trace-packet-proto#InterruptInfo.InterruptMapping)
  * [ObfuscatedClass.MergedClasses](https://perfetto.dev/docs/reference/trace-packet-proto#ObfuscatedClass.MergedClasses)
  * [ObfuscatedClass.MergedClass](https://perfetto.dev/docs/reference/trace-packet-proto#ObfuscatedClass.MergedClass)
  * [SchedSwitchFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SchedSwitchFtraceEvent)
  * [CpuFrequencyFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#CpuFrequencyFtraceEvent)
  * [CpuFrequencyLimitsFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#CpuFrequencyLimitsFtraceEvent)
  * [ClockEnableFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#ClockEnableFtraceEvent)
  * [ClockDisableFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#ClockDisableFtraceEvent)
  * [ClockSetRateFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#ClockSetRateFtraceEvent)
  * [SchedWakeupFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SchedWakeupFtraceEvent)
  * [SchedBlockedReasonFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SchedBlockedReasonFtraceEvent)
  * [SchedCpuHotplugFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SchedCpuHotplugFtraceEvent)
  * [SchedWakingFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SchedWakingFtraceEvent)
  * [SoftirqEntryFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SoftirqEntryFtraceEvent)
  * [SoftirqExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SoftirqExitFtraceEvent)
  * [SoftirqRaiseFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SoftirqRaiseFtraceEvent)
  * [SmbusWriteFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SmbusWriteFtraceEvent)
  * [SmbusResultFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SmbusResultFtraceEvent)
  * [SmbusReplyFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SmbusReplyFtraceEvent)
  * [LowmemoryKillFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#LowmemoryKillFtraceEvent)
  * [IrqHandlerEntryFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#IrqHandlerEntryFtraceEvent)
  * [IrqHandlerExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#IrqHandlerExitFtraceEvent)
  * [SyncTimelineFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SyncTimelineFtraceEvent)
  * [Ext4DaWriteBeginFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4DaWriteBeginFtraceEvent)
  * [Ext4DaWriteEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4DaWriteEndFtraceEvent)
  * [Ext4SyncFileEnterFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4SyncFileEnterFtraceEvent)
  * [Ext4SyncFileExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4SyncFileExitFtraceEvent)
  * [BlockRqIssueFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BlockRqIssueFtraceEvent)
  * [MmVmscanDirectReclaimBeginFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmVmscanDirectReclaimBeginFtraceEvent)
  * [MmVmscanDirectReclaimEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmVmscanDirectReclaimEndFtraceEvent)
  * [MmVmscanKswapdWakeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmVmscanKswapdWakeFtraceEvent)
  * [MmVmscanKswapdSleepFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmVmscanKswapdSleepFtraceEvent)
  * [BinderTransactionFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BinderTransactionFtraceEvent)
  * [BinderTransactionReceivedFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BinderTransactionReceivedFtraceEvent)
  * [BinderSetPriorityFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BinderSetPriorityFtraceEvent)
  * [BinderLockFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BinderLockFtraceEvent)
  * [BinderLockedFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BinderLockedFtraceEvent)
  * [BinderUnlockFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BinderUnlockFtraceEvent)
  * [WorkqueueActivateWorkFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#WorkqueueActivateWorkFtraceEvent)
  * [WorkqueueExecuteEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#WorkqueueExecuteEndFtraceEvent)
  * [WorkqueueExecuteStartFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#WorkqueueExecuteStartFtraceEvent)
  * [WorkqueueQueueWorkFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#WorkqueueQueueWorkFtraceEvent)
  * [RegulatorDisableFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#RegulatorDisableFtraceEvent)
  * [RegulatorDisableCompleteFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#RegulatorDisableCompleteFtraceEvent)
  * [RegulatorEnableFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#RegulatorEnableFtraceEvent)
  * [RegulatorEnableCompleteFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#RegulatorEnableCompleteFtraceEvent)
  * [RegulatorEnableDelayFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#RegulatorEnableDelayFtraceEvent)
  * [RegulatorSetVoltageFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#RegulatorSetVoltageFtraceEvent)
  * [RegulatorSetVoltageCompleteFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#RegulatorSetVoltageCompleteFtraceEvent)
  * [CgroupAttachTaskFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#CgroupAttachTaskFtraceEvent)
  * [CgroupMkdirFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#CgroupMkdirFtraceEvent)
  * [CgroupRemountFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#CgroupRemountFtraceEvent)
  * [CgroupRmdirFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#CgroupRmdirFtraceEvent)
  * [CgroupTransferTasksFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#CgroupTransferTasksFtraceEvent)
  * [CgroupDestroyRootFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#CgroupDestroyRootFtraceEvent)
  * [CgroupReleaseFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#CgroupReleaseFtraceEvent)
  * [CgroupRenameFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#CgroupRenameFtraceEvent)
  * [CgroupSetupRootFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#CgroupSetupRootFtraceEvent)
  * [MdpCmdKickoffFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MdpCmdKickoffFtraceEvent)
  * [MdpPerfSetOtFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MdpPerfSetOtFtraceEvent)
  * [MdpSsppChangeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MdpSsppChangeFtraceEvent)
  * [TracingMarkWriteFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TracingMarkWriteFtraceEvent)
  * [MdpCmdPingpongDoneFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MdpCmdPingpongDoneFtraceEvent)
  * [MdpCompareBwFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MdpCompareBwFtraceEvent)
  * [MdpPerfSetPanicLutsFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MdpPerfSetPanicLutsFtraceEvent)
  * [MdpSsppSetFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MdpSsppSetFtraceEvent)
  * [MdpCmdReadptrDoneFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MdpCmdReadptrDoneFtraceEvent)
  * [MdpMisrCrcFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MdpMisrCrcFtraceEvent)
  * [MdpPerfSetQosLutsFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MdpPerfSetQosLutsFtraceEvent)
  * [MdpTraceCounterFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MdpTraceCounterFtraceEvent)
  * [MdpCmdReleaseBwFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MdpCmdReleaseBwFtraceEvent)
  * [MdpMixerUpdateFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MdpMixerUpdateFtraceEvent)
  * [MdpPerfSetWmLevelsFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MdpPerfSetWmLevelsFtraceEvent)
  * [MdpVideoUnderrunDoneFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MdpVideoUnderrunDoneFtraceEvent)
  * [MdpCmdWaitPingpongFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MdpCmdWaitPingpongFtraceEvent)
  * [MdpPerfPrefillCalcFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MdpPerfPrefillCalcFtraceEvent)
  * [MdpPerfUpdateBusFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MdpPerfUpdateBusFtraceEvent)
  * [RotatorBwAoAsContextFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#RotatorBwAoAsContextFtraceEvent)
  * [MmFilemapAddToPageCacheFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmFilemapAddToPageCacheFtraceEvent)
  * [MmFilemapDeleteFromPageCacheFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmFilemapDeleteFromPageCacheFtraceEvent)
  * [MmCompactionBeginFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmCompactionBeginFtraceEvent)
  * [MmCompactionDeferCompactionFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmCompactionDeferCompactionFtraceEvent)
  * [MmCompactionDeferredFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmCompactionDeferredFtraceEvent)
  * [MmCompactionDeferResetFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmCompactionDeferResetFtraceEvent)
  * [MmCompactionEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmCompactionEndFtraceEvent)
  * [MmCompactionFinishedFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmCompactionFinishedFtraceEvent)
  * [MmCompactionIsolateFreepagesFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmCompactionIsolateFreepagesFtraceEvent)
  * [MmCompactionIsolateMigratepagesFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmCompactionIsolateMigratepagesFtraceEvent)
  * [MmCompactionKcompactdSleepFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmCompactionKcompactdSleepFtraceEvent)
  * [MmCompactionKcompactdWakeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmCompactionKcompactdWakeFtraceEvent)
  * [MmCompactionMigratepagesFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmCompactionMigratepagesFtraceEvent)
  * [MmCompactionSuitableFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmCompactionSuitableFtraceEvent)
  * [MmCompactionTryToCompactPagesFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmCompactionTryToCompactPagesFtraceEvent)
  * [MmCompactionWakeupKcompactdFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmCompactionWakeupKcompactdFtraceEvent)
  * [SuspendResumeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SuspendResumeFtraceEvent)
  * [SchedWakeupNewFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SchedWakeupNewFtraceEvent)
  * [BlockBioBackmergeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BlockBioBackmergeFtraceEvent)
  * [BlockBioBounceFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BlockBioBounceFtraceEvent)
  * [BlockBioCompleteFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BlockBioCompleteFtraceEvent)
  * [BlockBioFrontmergeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BlockBioFrontmergeFtraceEvent)
  * [BlockBioQueueFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BlockBioQueueFtraceEvent)
  * [BlockBioRemapFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BlockBioRemapFtraceEvent)
  * [BlockDirtyBufferFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BlockDirtyBufferFtraceEvent)
  * [BlockGetrqFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BlockGetrqFtraceEvent)
  * [BlockRqAbortFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BlockRqAbortFtraceEvent)
  * [BlockRqCompleteFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BlockRqCompleteFtraceEvent)
  * [BlockRqInsertFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BlockRqInsertFtraceEvent)
  * [BlockRqRemapFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BlockRqRemapFtraceEvent)
  * [BlockRqRequeueFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BlockRqRequeueFtraceEvent)
  * [BlockSleeprqFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BlockSleeprqFtraceEvent)
  * [BlockSplitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BlockSplitFtraceEvent)
  * [BlockTouchBufferFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BlockTouchBufferFtraceEvent)
  * [BlockUnplugFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BlockUnplugFtraceEvent)
  * [Ext4AllocDaBlocksFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4AllocDaBlocksFtraceEvent)
  * [Ext4AllocateBlocksFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4AllocateBlocksFtraceEvent)
  * [Ext4AllocateInodeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4AllocateInodeFtraceEvent)
  * [Ext4BeginOrderedTruncateFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4BeginOrderedTruncateFtraceEvent)
  * [Ext4CollapseRangeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4CollapseRangeFtraceEvent)
  * [Ext4DaReleaseSpaceFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4DaReleaseSpaceFtraceEvent)
  * [Ext4DaReserveSpaceFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4DaReserveSpaceFtraceEvent)
  * [Ext4DaUpdateReserveSpaceFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4DaUpdateReserveSpaceFtraceEvent)
  * [Ext4DaWritePagesFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4DaWritePagesFtraceEvent)
  * [Ext4DaWritePagesExtentFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4DaWritePagesExtentFtraceEvent)
  * [Ext4DirectIOEnterFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4DirectIOEnterFtraceEvent)
  * [Ext4DirectIOExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4DirectIOExitFtraceEvent)
  * [Ext4DiscardBlocksFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4DiscardBlocksFtraceEvent)
  * [Ext4DiscardPreallocationsFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4DiscardPreallocationsFtraceEvent)
  * [Ext4DropInodeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4DropInodeFtraceEvent)
  * [Ext4EsCacheExtentFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4EsCacheExtentFtraceEvent)
  * [Ext4EsFindDelayedExtentRangeEnterFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4EsFindDelayedExtentRangeEnterFtraceEvent)
  * [Ext4EsFindDelayedExtentRangeExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4EsFindDelayedExtentRangeExitFtraceEvent)
  * [Ext4EsInsertExtentFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4EsInsertExtentFtraceEvent)
  * [Ext4EsLookupExtentEnterFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4EsLookupExtentEnterFtraceEvent)
  * [Ext4EsLookupExtentExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4EsLookupExtentExitFtraceEvent)
  * [Ext4EsRemoveExtentFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4EsRemoveExtentFtraceEvent)
  * [Ext4EsShrinkFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4EsShrinkFtraceEvent)
  * [Ext4EsShrinkCountFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4EsShrinkCountFtraceEvent)
  * [Ext4EsShrinkScanEnterFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4EsShrinkScanEnterFtraceEvent)
  * [Ext4EsShrinkScanExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4EsShrinkScanExitFtraceEvent)
  * [Ext4EvictInodeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4EvictInodeFtraceEvent)
  * [Ext4ExtConvertToInitializedEnterFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4ExtConvertToInitializedEnterFtraceEvent)
  * [Ext4ExtConvertToInitializedFastpathFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4ExtConvertToInitializedFastpathFtraceEvent)
  * [Ext4ExtHandleUnwrittenExtentsFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4ExtHandleUnwrittenExtentsFtraceEvent)
  * [Ext4ExtInCacheFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4ExtInCacheFtraceEvent)
  * [Ext4ExtLoadExtentFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4ExtLoadExtentFtraceEvent)
  * [Ext4ExtMapBlocksEnterFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4ExtMapBlocksEnterFtraceEvent)
  * [Ext4ExtMapBlocksExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4ExtMapBlocksExitFtraceEvent)
  * [Ext4ExtPutInCacheFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4ExtPutInCacheFtraceEvent)
  * [Ext4ExtRemoveSpaceFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4ExtRemoveSpaceFtraceEvent)
  * [Ext4ExtRemoveSpaceDoneFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4ExtRemoveSpaceDoneFtraceEvent)
  * [Ext4ExtRmIdxFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4ExtRmIdxFtraceEvent)
  * [Ext4ExtRmLeafFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4ExtRmLeafFtraceEvent)
  * [Ext4ExtShowExtentFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4ExtShowExtentFtraceEvent)
  * [Ext4FallocateEnterFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4FallocateEnterFtraceEvent)
  * [Ext4FallocateExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4FallocateExitFtraceEvent)
  * [Ext4FindDelallocRangeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4FindDelallocRangeFtraceEvent)
  * [Ext4ForgetFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4ForgetFtraceEvent)
  * [Ext4FreeBlocksFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4FreeBlocksFtraceEvent)
  * [Ext4FreeInodeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4FreeInodeFtraceEvent)
  * [Ext4GetImpliedClusterAllocExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4GetImpliedClusterAllocExitFtraceEvent)
  * [Ext4GetReservedClusterAllocFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4GetReservedClusterAllocFtraceEvent)
  * [Ext4IndMapBlocksEnterFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4IndMapBlocksEnterFtraceEvent)
  * [Ext4IndMapBlocksExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4IndMapBlocksExitFtraceEvent)
  * [Ext4InsertRangeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4InsertRangeFtraceEvent)
  * [Ext4InvalidatepageFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4InvalidatepageFtraceEvent)
  * [Ext4JournalStartFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4JournalStartFtraceEvent)
  * [Ext4JournalStartReservedFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4JournalStartReservedFtraceEvent)
  * [Ext4JournalledInvalidatepageFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4JournalledInvalidatepageFtraceEvent)
  * [Ext4JournalledWriteEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4JournalledWriteEndFtraceEvent)
  * [Ext4LoadInodeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4LoadInodeFtraceEvent)
  * [Ext4LoadInodeBitmapFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4LoadInodeBitmapFtraceEvent)
  * [Ext4MarkInodeDirtyFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4MarkInodeDirtyFtraceEvent)
  * [Ext4MbBitmapLoadFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4MbBitmapLoadFtraceEvent)
  * [Ext4MbBuddyBitmapLoadFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4MbBuddyBitmapLoadFtraceEvent)
  * [Ext4MbDiscardPreallocationsFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4MbDiscardPreallocationsFtraceEvent)
  * [Ext4MbNewGroupPaFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4MbNewGroupPaFtraceEvent)
  * [Ext4MbNewInodePaFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4MbNewInodePaFtraceEvent)
  * [Ext4MbReleaseGroupPaFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4MbReleaseGroupPaFtraceEvent)
  * [Ext4MbReleaseInodePaFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4MbReleaseInodePaFtraceEvent)
  * [Ext4MballocAllocFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4MballocAllocFtraceEvent)
  * [Ext4MballocDiscardFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4MballocDiscardFtraceEvent)
  * [Ext4MballocFreeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4MballocFreeFtraceEvent)
  * [Ext4MballocPreallocFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4MballocPreallocFtraceEvent)
  * [Ext4OtherInodeUpdateTimeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4OtherInodeUpdateTimeFtraceEvent)
  * [Ext4PunchHoleFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4PunchHoleFtraceEvent)
  * [Ext4ReadBlockBitmapLoadFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4ReadBlockBitmapLoadFtraceEvent)
  * [Ext4ReadpageFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4ReadpageFtraceEvent)
  * [Ext4ReleasepageFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4ReleasepageFtraceEvent)
  * [Ext4RemoveBlocksFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4RemoveBlocksFtraceEvent)
  * [Ext4RequestBlocksFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4RequestBlocksFtraceEvent)
  * [Ext4RequestInodeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4RequestInodeFtraceEvent)
  * [Ext4SyncFsFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4SyncFsFtraceEvent)
  * [Ext4TrimAllFreeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4TrimAllFreeFtraceEvent)
  * [Ext4TrimExtentFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4TrimExtentFtraceEvent)
  * [Ext4TruncateEnterFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4TruncateEnterFtraceEvent)
  * [Ext4TruncateExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4TruncateExitFtraceEvent)
  * [Ext4UnlinkEnterFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4UnlinkEnterFtraceEvent)
  * [Ext4UnlinkExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4UnlinkExitFtraceEvent)
  * [Ext4WriteBeginFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4WriteBeginFtraceEvent)
  * [Ext4WriteEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4WriteEndFtraceEvent)
  * [Ext4WritepageFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4WritepageFtraceEvent)
  * [Ext4WritepagesFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4WritepagesFtraceEvent)
  * [Ext4WritepagesResultFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4WritepagesResultFtraceEvent)
  * [Ext4ZeroRangeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Ext4ZeroRangeFtraceEvent)
  * [TaskNewtaskFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TaskNewtaskFtraceEvent)
  * [TaskRenameFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TaskRenameFtraceEvent)
  * [SchedProcessExecFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SchedProcessExecFtraceEvent)
  * [SchedProcessExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SchedProcessExitFtraceEvent)
  * [SchedProcessForkFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SchedProcessForkFtraceEvent)
  * [SchedProcessFreeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SchedProcessFreeFtraceEvent)
  * [SchedProcessHangFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SchedProcessHangFtraceEvent)
  * [SchedProcessWaitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SchedProcessWaitFtraceEvent)
  * [F2fsDoSubmitBioFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsDoSubmitBioFtraceEvent)
  * [F2fsEvictInodeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsEvictInodeFtraceEvent)
  * [F2fsFallocateFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsFallocateFtraceEvent)
  * [F2fsGetDataBlockFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsGetDataBlockFtraceEvent)
  * [F2fsGetVictimFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsGetVictimFtraceEvent)
  * [F2fsIgetExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsIgetExitFtraceEvent)
  * [F2fsNewInodeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsNewInodeFtraceEvent)
  * [F2fsReadpageFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsReadpageFtraceEvent)
  * [F2fsReserveNewBlockFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsReserveNewBlockFtraceEvent)
  * [F2fsSetPageDirtyFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsSetPageDirtyFtraceEvent)
  * [F2fsSubmitWritePageFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsSubmitWritePageFtraceEvent)
  * [F2fsSyncFileEnterFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsSyncFileEnterFtraceEvent)
  * [F2fsSyncFileExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsSyncFileExitFtraceEvent)
  * [F2fsSyncFsFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsSyncFsFtraceEvent)
  * [F2fsTruncateFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsTruncateFtraceEvent)
  * [F2fsTruncateBlocksEnterFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsTruncateBlocksEnterFtraceEvent)
  * [F2fsTruncateBlocksExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsTruncateBlocksExitFtraceEvent)
  * [F2fsTruncateDataBlocksRangeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsTruncateDataBlocksRangeFtraceEvent)
  * [F2fsTruncateInodeBlocksEnterFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsTruncateInodeBlocksEnterFtraceEvent)
  * [F2fsTruncateInodeBlocksExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsTruncateInodeBlocksExitFtraceEvent)
  * [F2fsTruncateNodeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsTruncateNodeFtraceEvent)
  * [F2fsTruncateNodesEnterFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsTruncateNodesEnterFtraceEvent)
  * [F2fsTruncateNodesExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsTruncateNodesExitFtraceEvent)
  * [F2fsTruncatePartialNodesFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsTruncatePartialNodesFtraceEvent)
  * [F2fsUnlinkEnterFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsUnlinkEnterFtraceEvent)
  * [F2fsUnlinkExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsUnlinkExitFtraceEvent)
  * [F2fsVmPageMkwriteFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsVmPageMkwriteFtraceEvent)
  * [F2fsWriteBeginFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsWriteBeginFtraceEvent)
  * [F2fsWriteCheckpointFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsWriteCheckpointFtraceEvent)
  * [F2fsWriteEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsWriteEndFtraceEvent)
  * [AllocPagesIommuEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#AllocPagesIommuEndFtraceEvent)
  * [AllocPagesIommuFailFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#AllocPagesIommuFailFtraceEvent)
  * [AllocPagesIommuStartFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#AllocPagesIommuStartFtraceEvent)
  * [AllocPagesSysEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#AllocPagesSysEndFtraceEvent)
  * [AllocPagesSysFailFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#AllocPagesSysFailFtraceEvent)
  * [AllocPagesSysStartFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#AllocPagesSysStartFtraceEvent)
  * [DmaAllocContiguousRetryFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DmaAllocContiguousRetryFtraceEvent)
  * [IommuMapRangeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#IommuMapRangeFtraceEvent)
  * [IommuSecPtblMapRangeEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#IommuSecPtblMapRangeEndFtraceEvent)
  * [IommuSecPtblMapRangeStartFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#IommuSecPtblMapRangeStartFtraceEvent)
  * [IonAllocBufferEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#IonAllocBufferEndFtraceEvent)
  * [IonAllocBufferFailFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#IonAllocBufferFailFtraceEvent)
  * [IonAllocBufferFallbackFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#IonAllocBufferFallbackFtraceEvent)
  * [IonAllocBufferStartFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#IonAllocBufferStartFtraceEvent)
  * [IonCpAllocRetryFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#IonCpAllocRetryFtraceEvent)
  * [IonCpSecureBufferEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#IonCpSecureBufferEndFtraceEvent)
  * [IonCpSecureBufferStartFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#IonCpSecureBufferStartFtraceEvent)
  * [IonPrefetchingFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#IonPrefetchingFtraceEvent)
  * [IonSecureCmaAddToPoolEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#IonSecureCmaAddToPoolEndFtraceEvent)
  * [IonSecureCmaAddToPoolStartFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#IonSecureCmaAddToPoolStartFtraceEvent)
  * [IonSecureCmaAllocateEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#IonSecureCmaAllocateEndFtraceEvent)
  * [IonSecureCmaAllocateStartFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#IonSecureCmaAllocateStartFtraceEvent)
  * [IonSecureCmaShrinkPoolEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#IonSecureCmaShrinkPoolEndFtraceEvent)
  * [IonSecureCmaShrinkPoolStartFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#IonSecureCmaShrinkPoolStartFtraceEvent)
  * [KmallocNodeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KmallocNodeFtraceEvent)
  * [KmemCacheAllocFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KmemCacheAllocFtraceEvent)
  * [KmemCacheAllocNodeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KmemCacheAllocNodeFtraceEvent)
  * [KmemCacheFreeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KmemCacheFreeFtraceEvent)
  * [MigratePagesEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MigratePagesEndFtraceEvent)
  * [MigratePagesStartFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MigratePagesStartFtraceEvent)
  * [MigrateRetryFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MigrateRetryFtraceEvent)
  * [MmPageAllocFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmPageAllocFtraceEvent)
  * [MmPageAllocExtfragFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmPageAllocExtfragFtraceEvent)
  * [MmPageAllocZoneLockedFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmPageAllocZoneLockedFtraceEvent)
  * [MmPageFreeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmPageFreeFtraceEvent)
  * [MmPageFreeBatchedFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmPageFreeBatchedFtraceEvent)
  * [MmPagePcpuDrainFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmPagePcpuDrainFtraceEvent)
  * [IonHeapShrinkFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#IonHeapShrinkFtraceEvent)
  * [IonHeapGrowFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#IonHeapGrowFtraceEvent)
  * [FenceDestroyFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#FenceDestroyFtraceEvent)
  * [FenceEnableSignalFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#FenceEnableSignalFtraceEvent)
  * [FenceSignaledFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#FenceSignaledFtraceEvent)
  * [ClkDisableFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#ClkDisableFtraceEvent)
  * [ClkSetRateFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#ClkSetRateFtraceEvent)
  * [BinderTransactionAllocBufFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BinderTransactionAllocBufFtraceEvent)
  * [SignalDeliverFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SignalDeliverFtraceEvent)
  * [SignalGenerateFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SignalGenerateFtraceEvent)
  * [OomScoreAdjUpdateFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#OomScoreAdjUpdateFtraceEvent)
  * [GenericFtraceEvent.Field](https://perfetto.dev/docs/reference/trace-packet-proto#GenericFtraceEvent.Field)
  * [MmEventRecordFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmEventRecordFtraceEvent)
  * [GpuFrequencyFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#GpuFrequencyFtraceEvent)
  * [SdeTracingMarkWriteFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SdeTracingMarkWriteFtraceEvent)
  * [MarkVictimFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MarkVictimFtraceEvent)
  * [IonBufferCreateFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#IonBufferCreateFtraceEvent)
  * [IonBufferDestroyFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#IonBufferDestroyFtraceEvent)
  * [ScmCallStartFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#ScmCallStartFtraceEvent)
  * [ScmCallEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#ScmCallEndFtraceEvent)
  * [GpuMemTotalFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#GpuMemTotalFtraceEvent)
  * [ThermalTemperatureFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#ThermalTemperatureFtraceEvent)
  * [CdevUpdateFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#CdevUpdateFtraceEvent)
  * [CpuhpMultiEnterFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#CpuhpMultiEnterFtraceEvent)
  * [CpuhpEnterFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#CpuhpEnterFtraceEvent)
  * [CpuhpLatencyFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#CpuhpLatencyFtraceEvent)
  * [FastrpcDmaStatFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#FastrpcDmaStatFtraceEvent)
  * [DpuTracingMarkWriteFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DpuTracingMarkWriteFtraceEvent)
  * [G2dTracingMarkWriteFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#G2dTracingMarkWriteFtraceEvent)
  * [MaliTracingMarkWriteFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliTracingMarkWriteFtraceEvent)
  * [DmaHeapStatFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DmaHeapStatFtraceEvent)
  * [CpuhpPauseFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#CpuhpPauseFtraceEvent)
  * [SchedPiSetprioFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SchedPiSetprioFtraceEvent)
  * [SdeSdeEvtlogFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SdeSdeEvtlogFtraceEvent)
  * [SdeSdePerfCalcCrtcFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SdeSdePerfCalcCrtcFtraceEvent)
  * [SdeSdePerfCrtcUpdateFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SdeSdePerfCrtcUpdateFtraceEvent)
  * [SdeSdePerfSetQosLutsFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SdeSdePerfSetQosLutsFtraceEvent)
  * [SdeSdePerfUpdateBusFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SdeSdePerfUpdateBusFtraceEvent)
  * [RssStatThrottledFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#RssStatThrottledFtraceEvent)
  * [NetifReceiveSkbFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#NetifReceiveSkbFtraceEvent)
  * [NetDevXmitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#NetDevXmitFtraceEvent)
  * [InetSockSetStateFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#InetSockSetStateFtraceEvent)
  * [TcpRetransmitSkbFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TcpRetransmitSkbFtraceEvent)
  * [CrosEcSensorhubDataFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#CrosEcSensorhubDataFtraceEvent)
  * [NapiGroReceiveEntryFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#NapiGroReceiveEntryFtraceEvent)
  * [NapiGroReceiveExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#NapiGroReceiveExitFtraceEvent)
  * [KvmAccessFaultFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmAccessFaultFtraceEvent)
  * [KvmAgePageFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmAgePageFtraceEvent)
  * [KvmArmClearDebugFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmArmClearDebugFtraceEvent)
  * [KvmArmSetDreg32FtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmArmSetDreg32FtraceEvent)
  * [KvmArmSetRegsetFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmArmSetRegsetFtraceEvent)
  * [KvmArmSetupDebugFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmArmSetupDebugFtraceEvent)
  * [KvmGetTimerMapFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmGetTimerMapFtraceEvent)
  * [KvmGuestFaultFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmGuestFaultFtraceEvent)
  * [KvmHandleSysRegFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmHandleSysRegFtraceEvent)
  * [KvmHvcArm64FtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmHvcArm64FtraceEvent)
  * [KvmIrqLineFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmIrqLineFtraceEvent)
  * [KvmMmioEmulateFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmMmioEmulateFtraceEvent)
  * [KvmSetGuestDebugFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmSetGuestDebugFtraceEvent)
  * [KvmSetSpteHvaFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmSetSpteHvaFtraceEvent)
  * [KvmSetWayFlushFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmSetWayFlushFtraceEvent)
  * [KvmSysAccessFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmSysAccessFtraceEvent)
  * [KvmTestAgeHvaFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmTestAgeHvaFtraceEvent)
  * [KvmTimerEmulateFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmTimerEmulateFtraceEvent)
  * [KvmTimerHrtimerExpireFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmTimerHrtimerExpireFtraceEvent)
  * [KvmTimerRestoreStateFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmTimerRestoreStateFtraceEvent)
  * [KvmTimerSaveStateFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmTimerSaveStateFtraceEvent)
  * [KvmTimerUpdateIrqFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmTimerUpdateIrqFtraceEvent)
  * [KvmToggleCacheFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmToggleCacheFtraceEvent)
  * [KvmUnmapHvaRangeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmUnmapHvaRangeFtraceEvent)
  * [KvmUserspaceExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmUserspaceExitFtraceEvent)
  * [KvmVcpuWakeupFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmVcpuWakeupFtraceEvent)
  * [KvmWfxArm64FtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KvmWfxArm64FtraceEvent)
  * [VgicUpdateIrqPendingFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#VgicUpdateIrqPendingFtraceEvent)
  * [WakeupSourceActivateFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#WakeupSourceActivateFtraceEvent)
  * [WakeupSourceDeactivateFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#WakeupSourceDeactivateFtraceEvent)
  * [UfshcdCommandFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#UfshcdCommandFtraceEvent)
  * [UfshcdClkGatingFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#UfshcdClkGatingFtraceEvent)
  * [DrmVblankEventFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DrmVblankEventFtraceEvent)
  * [DrmVblankEventDeliveredFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DrmVblankEventDeliveredFtraceEvent)
  * [DrmSchedJobFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DrmSchedJobFtraceEvent)
  * [DrmSchedProcessJobFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DrmSchedProcessJobFtraceEvent)
  * [DmaFenceInitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DmaFenceInitFtraceEvent)
  * [DmaFenceEmitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DmaFenceEmitFtraceEvent)
  * [DmaFenceSignaledFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DmaFenceSignaledFtraceEvent)
  * [DmaFenceWaitStartFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DmaFenceWaitStartFtraceEvent)
  * [DmaFenceWaitEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DmaFenceWaitEndFtraceEvent)
  * [F2fsIostatFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsIostatFtraceEvent)
  * [F2fsIostatLatencyFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsIostatLatencyFtraceEvent)
  * [SchedCpuUtilCfsFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SchedCpuUtilCfsFtraceEvent)
  * [Vb2V4l2BufQueueFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Vb2V4l2BufQueueFtraceEvent)
  * [Vb2V4l2BufDoneFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Vb2V4l2BufDoneFtraceEvent)
  * [Vb2V4l2QbufFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Vb2V4l2QbufFtraceEvent)
  * [Vb2V4l2DqbufFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Vb2V4l2DqbufFtraceEvent)
  * [DsiCmdFifoStatusFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DsiCmdFifoStatusFtraceEvent)
  * [AndroidFsDatareadEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#AndroidFsDatareadEndFtraceEvent)
  * [AndroidFsDatareadStartFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#AndroidFsDatareadStartFtraceEvent)
  * [AndroidFsDatawriteEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#AndroidFsDatawriteEndFtraceEvent)
  * [AndroidFsDatawriteStartFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#AndroidFsDatawriteStartFtraceEvent)
  * [AndroidFsFsyncEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#AndroidFsFsyncEndFtraceEvent)
  * [AndroidFsFsyncStartFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#AndroidFsFsyncStartFtraceEvent)
  * [FuncgraphEntryFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#FuncgraphEntryFtraceEvent)
  * [FuncgraphExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#FuncgraphExitFtraceEvent)
  * [VirtioVideoCmdFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#VirtioVideoCmdFtraceEvent)
  * [VirtioVideoCmdDoneFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#VirtioVideoCmdDoneFtraceEvent)
  * [VirtioVideoResourceQueueFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#VirtioVideoResourceQueueFtraceEvent)
  * [VirtioVideoResourceQueueDoneFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#VirtioVideoResourceQueueDoneFtraceEvent)
  * [MmShrinkSlabStartFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmShrinkSlabStartFtraceEvent)
  * [MmShrinkSlabEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmShrinkSlabEndFtraceEvent)
  * [TrustySmcDoneFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TrustySmcDoneFtraceEvent)
  * [TrustyStdCall32FtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TrustyStdCall32FtraceEvent)
  * [TrustyStdCall32DoneFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TrustyStdCall32DoneFtraceEvent)
  * [TrustyShareMemoryFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TrustyShareMemoryFtraceEvent)
  * [TrustyShareMemoryDoneFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TrustyShareMemoryDoneFtraceEvent)
  * [TrustyReclaimMemoryFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TrustyReclaimMemoryFtraceEvent)
  * [TrustyReclaimMemoryDoneFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TrustyReclaimMemoryDoneFtraceEvent)
  * [TrustyIpcHandleEventFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TrustyIpcHandleEventFtraceEvent)
  * [TrustyIpcConnectFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TrustyIpcConnectFtraceEvent)
  * [TrustyIpcConnectEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TrustyIpcConnectEndFtraceEvent)
  * [TrustyIpcWriteFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TrustyIpcWriteFtraceEvent)
  * [TrustyIpcPollFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TrustyIpcPollFtraceEvent)
  * [TrustyIpcReadFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TrustyIpcReadFtraceEvent)
  * [TrustyIpcReadEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TrustyIpcReadEndFtraceEvent)
  * [TrustyIpcRxFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TrustyIpcRxFtraceEvent)
  * [TrustyEnqueueNopFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TrustyEnqueueNopFtraceEvent)
  * [CmaAllocStartFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#CmaAllocStartFtraceEvent)
  * [CmaAllocInfoFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#CmaAllocInfoFtraceEvent)
  * [LwisTracingMarkWriteFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#LwisTracingMarkWriteFtraceEvent)
  * [VirtioGpuCmdQueueFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#VirtioGpuCmdQueueFtraceEvent)
  * [VirtioGpuCmdResponseFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#VirtioGpuCmdResponseFtraceEvent)
  * [MaliMaliKCPUCQSSETFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliKCPUCQSSETFtraceEvent)
  * [MaliMaliKCPUCQSWAITSTARTFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliKCPUCQSWAITSTARTFtraceEvent)
  * [MaliMaliKCPUCQSWAITENDFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliKCPUCQSWAITENDFtraceEvent)
  * [MaliMaliKCPUFENCESIGNALFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliKCPUFENCESIGNALFtraceEvent)
  * [MaliMaliKCPUFENCEWAITSTARTFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliKCPUFENCEWAITSTARTFtraceEvent)
  * [MaliMaliKCPUFENCEWAITENDFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliKCPUFENCEWAITENDFtraceEvent)
  * [HostMemAbortFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#HostMemAbortFtraceEvent)
  * [SuspendResumeMinimalFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SuspendResumeMinimalFtraceEvent)
  * [MaliMaliCSFINTERRUPTSTARTFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliCSFINTERRUPTSTARTFtraceEvent)
  * [MaliMaliCSFINTERRUPTENDFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliCSFINTERRUPTENDFtraceEvent)
  * [SamsungTracingMarkWriteFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SamsungTracingMarkWriteFtraceEvent)
  * [BinderCommandFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BinderCommandFtraceEvent)
  * [BinderReturnFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BinderReturnFtraceEvent)
  * [SchedSwitchWithCtrsFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SchedSwitchWithCtrsFtraceEvent)
  * [GpuWorkPeriodFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#GpuWorkPeriodFtraceEvent)
  * [PanelWriteGenericFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#PanelWriteGenericFtraceEvent)
  * [SchedMigrateTaskFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SchedMigrateTaskFtraceEvent)
  * [DpuDsiCmdFifoStatusFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DpuDsiCmdFifoStatusFtraceEvent)
  * [F2fsBackgroundGcFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsBackgroundGcFtraceEvent)
  * [F2fsGcBeginFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsGcBeginFtraceEvent)
  * [FastrpcDmaFreeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#FastrpcDmaFreeFtraceEvent)
  * [FastrpcDmaAllocFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#FastrpcDmaAllocFtraceEvent)
  * [FastrpcDmaUnmapFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#FastrpcDmaUnmapFtraceEvent)
  * [FastrpcDmaMapFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#FastrpcDmaMapFtraceEvent)
  * [GoogleIccEventFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#GoogleIccEventFtraceEvent)
  * [GoogleIrmEventFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#GoogleIrmEventFtraceEvent)
  * [DevicePmCallbackStartFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DevicePmCallbackStartFtraceEvent)
  * [DevicePmCallbackEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DevicePmCallbackEndFtraceEvent)
  * [ThermalExynosAcpmBulkFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#ThermalExynosAcpmBulkFtraceEvent)
  * [ThermalExynosAcpmHighOverheadFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#ThermalExynosAcpmHighOverheadFtraceEvent)
  * [KgslGpuFrequencyFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KgslGpuFrequencyFtraceEvent)
  * [MaliMaliPMMCUHCTLCORESDOWNSCALENOTIFYPENDFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliPMMCUHCTLCORESDOWNSCALENOTIFYPENDFtraceEvent)
  * [MaliMaliPMMCUHCTLCORESNOTIFYPENDFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliPMMCUHCTLCORESNOTIFYPENDFtraceEvent)
  * [MaliMaliPMMCUHCTLCOREINACTIVEPENDFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliPMMCUHCTLCOREINACTIVEPENDFtraceEvent)
  * [MaliMaliPMMCUHCTLMCUONRECHECKFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliPMMCUHCTLMCUONRECHECKFtraceEvent)
  * [MaliMaliPMMCUHCTLSHADERSCOREOFFPENDFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliPMMCUHCTLSHADERSCOREOFFPENDFtraceEvent)
  * [MaliMaliPMMCUHCTLSHADERSPENDOFFFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliPMMCUHCTLSHADERSPENDOFFFtraceEvent)
  * [MaliMaliPMMCUHCTLSHADERSPENDONFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliPMMCUHCTLSHADERSPENDONFtraceEvent)
  * [MaliMaliPMMCUHCTLSHADERSREADYOFFFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliPMMCUHCTLSHADERSREADYOFFFtraceEvent)
  * [MaliMaliPMMCUINSLEEPFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliPMMCUINSLEEPFtraceEvent)
  * [MaliMaliPMMCUOFFFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliPMMCUOFFFtraceEvent)
  * [MaliMaliPMMCUONFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliPMMCUONFtraceEvent)
  * [MaliMaliPMMCUONCOREATTRUPDATEPENDFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliPMMCUONCOREATTRUPDATEPENDFtraceEvent)
  * [MaliMaliPMMCUONGLBREINITPENDFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliPMMCUONGLBREINITPENDFtraceEvent)
  * [MaliMaliPMMCUONHALTFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliPMMCUONHALTFtraceEvent)
  * [MaliMaliPMMCUONHWCNTDISABLEFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliPMMCUONHWCNTDISABLEFtraceEvent)
  * [MaliMaliPMMCUONHWCNTENABLEFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliPMMCUONHWCNTENABLEFtraceEvent)
  * [MaliMaliPMMCUONPENDHALTFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliPMMCUONPENDHALTFtraceEvent)
  * [MaliMaliPMMCUONPENDSLEEPFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliPMMCUONPENDSLEEPFtraceEvent)
  * [MaliMaliPMMCUONSLEEPINITIATEFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliPMMCUONSLEEPINITIATEFtraceEvent)
  * [MaliMaliPMMCUPENDOFFFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliPMMCUPENDOFFFtraceEvent)
  * [MaliMaliPMMCUPENDONRELOADFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliPMMCUPENDONRELOADFtraceEvent)
  * [MaliMaliPMMCUPOWERDOWNFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliPMMCUPOWERDOWNFtraceEvent)
  * [MaliMaliPMMCURESETWAITFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliMaliPMMCURESETWAITFtraceEvent)
  * [BclIrqTriggerFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BclIrqTriggerFtraceEvent)
  * [KgslAdrenoCmdbatchQueuedFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KgslAdrenoCmdbatchQueuedFtraceEvent)
  * [KgslAdrenoCmdbatchSubmittedFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KgslAdrenoCmdbatchSubmittedFtraceEvent)
  * [KgslAdrenoCmdbatchSyncFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KgslAdrenoCmdbatchSyncFtraceEvent)
  * [KgslAdrenoCmdbatchRetiredFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#KgslAdrenoCmdbatchRetiredFtraceEvent)
  * [PixelMmKswapdWakeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#PixelMmKswapdWakeFtraceEvent)
  * [PixelMmKswapdDoneFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#PixelMmKswapdDoneFtraceEvent)
  * [SchedWakeupTaskAttrFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SchedWakeupTaskAttrFtraceEvent)
  * [DevfreqFrequencyFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DevfreqFrequencyFtraceEvent)
  * [KprobeEvent.KprobeType](https://perfetto.dev/docs/reference/trace-packet-proto#KprobeEvent.KprobeType)
  * [ParamSetValueCpmFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#ParamSetValueCpmFtraceEvent)
  * [BlockIoStartFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BlockIoStartFtraceEvent)
  * [BlockIoDoneFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#BlockIoDoneFtraceEvent)
  * [MaliGpuPowerStateFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MaliGpuPowerStateFtraceEvent)
  * [DpuDispDpuUnderrunFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DpuDispDpuUnderrunFtraceEvent)
  * [DpuDispVblankIrqEnableFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DpuDispVblankIrqEnableFtraceEvent)
  * [HrtimerStartFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#HrtimerStartFtraceEvent)
  * [HrtimerCancelFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#HrtimerCancelFtraceEvent)
  * [HrtimerExpireEntryFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#HrtimerExpireEntryFtraceEvent)
  * [HrtimerExpireExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#HrtimerExpireExitFtraceEvent)
  * [TimerStartFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TimerStartFtraceEvent)
  * [TimerCancelFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TimerCancelFtraceEvent)
  * [TimerExpireEntryFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TimerExpireEntryFtraceEvent)
  * [TimerExpireExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#TimerExpireExitFtraceEvent)
  * [LocalTimerEntryFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#LocalTimerEntryFtraceEvent)
  * [LocalTimerExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#LocalTimerExitFtraceEvent)
  * [Dwc3AllocRequestFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Dwc3AllocRequestFtraceEvent)
  * [Dwc3CompleteTrbFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Dwc3CompleteTrbFtraceEvent)
  * [Dwc3CtrlReqFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Dwc3CtrlReqFtraceEvent)
  * [Dwc3EpDequeueFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Dwc3EpDequeueFtraceEvent)
  * [Dwc3EpQueueFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Dwc3EpQueueFtraceEvent)
  * [Dwc3FreeRequestFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Dwc3FreeRequestFtraceEvent)
  * [Dwc3GadgetEpCmdFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Dwc3GadgetEpCmdFtraceEvent)
  * [Dwc3GadgetEpDisableFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Dwc3GadgetEpDisableFtraceEvent)
  * [Dwc3GadgetEpEnableFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Dwc3GadgetEpEnableFtraceEvent)
  * [Dwc3GadgetGenericCmdFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Dwc3GadgetGenericCmdFtraceEvent)
  * [Dwc3GadgetGivebackFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Dwc3GadgetGivebackFtraceEvent)
  * [Dwc3PrepareTrbFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Dwc3PrepareTrbFtraceEvent)
  * [Dwc3WritelFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#Dwc3WritelFtraceEvent)
  * [CmaAllocFinishFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#CmaAllocFinishFtraceEvent)
  * [MmAllocContigMigrateRangeInfoFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmAllocContigMigrateRangeInfoFtraceEvent)
  * [HostFfaCallFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#HostFfaCallFtraceEvent)
  * [DmabufRssStatFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DmabufRssStatFtraceEvent)
  * [IommuIdmapFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#IommuIdmapFtraceEvent)
  * [PsciMemProtectFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#PsciMemProtectFtraceEvent)
  * [HypervisorHostHcallFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#HypervisorHostHcallFtraceEvent)
  * [HypervisorHostSmcFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#HypervisorHostSmcFtraceEvent)
  * [HypervisorHypExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#HypervisorHypExitFtraceEvent)
  * [HypervisorIommuIdmapFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#HypervisorIommuIdmapFtraceEvent)
  * [HypervisorPsciMemProtectFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#HypervisorPsciMemProtectFtraceEvent)
  * [HypervisorHostMemAbortFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#HypervisorHostMemAbortFtraceEvent)
  * [HypervisorHypEnterFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#HypervisorHypEnterFtraceEvent)
  * [HypervisorIommuIdmapCompleteFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#HypervisorIommuIdmapCompleteFtraceEvent)
  * [HypervisorVcpuIllegalTrapFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#HypervisorVcpuIllegalTrapFtraceEvent)
  * [DrmSchedJobAddDepFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DrmSchedJobAddDepFtraceEvent)
  * [DrmSchedJobDoneFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DrmSchedJobDoneFtraceEvent)
  * [DrmSchedJobQueueFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DrmSchedJobQueueFtraceEvent)
  * [DrmSchedJobRunFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DrmSchedJobRunFtraceEvent)
  * [DrmSchedJobUnschedulableFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DrmSchedJobUnschedulableFtraceEvent)
  * [FwtpPerfettoCounterFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#FwtpPerfettoCounterFtraceEvent)
  * [ScsiDispatchCmdErrorFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#ScsiDispatchCmdErrorFtraceEvent)
  * [ScsiDispatchCmdTimeoutFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#ScsiDispatchCmdTimeoutFtraceEvent)
  * [ScsiEhWakeupFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#ScsiEhWakeupFtraceEvent)
  * [FwtpPerfettoSliceFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#FwtpPerfettoSliceFtraceEvent)
  * [GpuPowerStateFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#GpuPowerStateFtraceEvent)
  * [GramCollisionFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#GramCollisionFtraceEvent)
  * [F2fsLockElapsedTimeFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#F2fsLockElapsedTimeFtraceEvent)
  * [SchedGroupTrackerFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#SchedGroupTrackerFtraceEvent)
  * [DpuDispFrameDoneTimeoutFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DpuDispFrameDoneTimeoutFtraceEvent)
  * [DpuDispFrameStartTimeoutFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DpuDispFrameStartTimeoutFtraceEvent)
  * [MmVmscanMemcgReclaimBeginFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmVmscanMemcgReclaimBeginFtraceEvent)
  * [MmVmscanMemcgReclaimEndFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#MmVmscanMemcgReclaimEndFtraceEvent)
  * [DpuDispFrameDoneMissingFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DpuDispFrameDoneMissingFtraceEvent)
  * [DpuDispFrameStartMissingFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DpuDispFrameStartMissingFtraceEvent)
  * [PanelSettingsFullFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#PanelSettingsFullFtraceEvent)
  * [PanelSettingsLiteFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#PanelSettingsLiteFtraceEvent)
  * [DpuDispDpuLineUnderrunFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#DpuDispDpuLineUnderrunFtraceEvent)
  * [PsciDomainIdleExitFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#PsciDomainIdleExitFtraceEvent)
  * [PsciDomainIdleEnterFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#PsciDomainIdleEnterFtraceEvent)
  * [LongSoftirqFtraceEvent](https://perfetto.dev/docs/reference/trace-packet-proto#LongSoftirqFtraceEvent)
  * [FtraceEventBundle.CompactSched](https://perfetto.dev/docs/reference/trace-packet-proto#FtraceEventBundle.CompactSched)
  * [FtraceEventBundle.FtraceError](https://perfetto.dev/docs/reference/trace-packet-proto#FtraceEventBundle.FtraceError)
  * [FtraceEventBundle.GenericEventDescriptor](https://perfetto.dev/docs/reference/trace-packet-proto#FtraceEventBundle.GenericEventDescriptor)
  * [FieldDescriptorProto.Label](https://perfetto.dev/docs/reference/trace-packet-proto#FieldDescriptorProto.Label)
  * [FieldDescriptorProto.Type](https://perfetto.dev/docs/reference/trace-packet-proto#FieldDescriptorProto.Type)
  * [UninterpretedOption.NamePart](https://perfetto.dev/docs/reference/trace-packet-proto#UninterpretedOption.NamePart)
  * [EnumValueDescriptorProto](https://perfetto.dev/docs/reference/trace-packet-proto#EnumValueDescriptorProto)
  * [DescriptorProto.ReservedRange](https://perfetto.dev/docs/reference/trace-packet-proto#DescriptorProto.ReservedRange)
  * [CSwitchEtwEvent.OldThreadWaitReason](https://perfetto.dev/docs/reference/trace-packet-proto#CSwitchEtwEvent.OldThreadWaitReason)
  * [CSwitchEtwEvent.OldThreadWaitMode](https://perfetto.dev/docs/reference/trace-packet-proto#CSwitchEtwEvent.OldThreadWaitMode)
  * [CSwitchEtwEvent.OldThreadState](https://perfetto.dev/docs/reference/trace-packet-proto#CSwitchEtwEvent.OldThreadState)
  * [ReadyThreadEtwEvent.AdjustReason](https://perfetto.dev/docs/reference/trace-packet-proto#ReadyThreadEtwEvent.AdjustReason)
  * [ReadyThreadEtwEvent.TraceFlag](https://perfetto.dev/docs/reference/trace-packet-proto#ReadyThreadEtwEvent.TraceFlag)
  * [FileIoDirEnumEtwEvent](https://perfetto.dev/docs/reference/trace-packet-proto#FileIoDirEnumEtwEvent)
  * [FileIoReadWriteEtwEvent](https://perfetto.dev/docs/reference/trace-packet-proto#FileIoReadWriteEtwEvent)
  * [FileIoSimpleOpEtwEvent](https://perfetto.dev/docs/reference/trace-packet-proto#FileIoSimpleOpEtwEvent)
  * [FileIoPathOperationEtwEvent](https://perfetto.dev/docs/reference/trace-packet-proto#FileIoPathOperationEtwEvent)
  * [RemoteClockSync.SyncedClocks](https://perfetto.dev/docs/reference/trace-packet-proto#RemoteClockSync.SyncedClocks)
  * [PixelModemTokenDatabase](https://perfetto.dev/docs/reference/trace-packet-proto#PixelModemTokenDatabase)
  * [KernelWakelockData.Wakelock](https://perfetto.dev/docs/reference/trace-packet-proto#KernelWakelockData.Wakelock)
  * [KernelWakelockData.Wakelock.Type](https://perfetto.dev/docs/reference/trace-packet-proto#KernelWakelockData.Wakelock.Type)
  * [AndroidUserList.UserInfo](https://perfetto.dev/docs/reference/trace-packet-proto#AndroidUserList.UserInfo)
  * [RecoveredTraceInfo.Reason](https://perfetto.dev/docs/reference/trace-packet-proto#RecoveredTraceInfo.Reason)
  * [MemcgStats.SwapEvents](https://perfetto.dev/docs/reference/trace-packet-proto#MemcgStats.SwapEvents)
  * [TestEvent.TestPayload](https://perfetto.dev/docs/reference/trace-packet-proto#TestEvent.TestPayload)
  * [TestEvent.ProtoVmPatch](https://perfetto.dev/docs/reference/trace-packet-proto#TestEvent.ProtoVmPatch)
  * [TestEvent.ProtoVmMessage](https://perfetto.dev/docs/reference/trace-packet-proto#TestEvent.ProtoVmMessage)
  * [TestEvent.ProtoVmMessage.ProtoVmSubmessage](https://perfetto.dev/docs/reference/trace-packet-proto#TestEvent.ProtoVmMessage.ProtoVmSubmessage)
  * [TestEvent.ProtoVmIncrementalState](https://perfetto.dev/docs/reference/trace-packet-proto#TestEvent.ProtoVmIncrementalState)
  * [Because of the incremental build-up, the interning index will miss data when TracePackets are lost, e.g. because a chunk was overridden in the central ring buffer. To avoid invalidation of the whole trace in such a case, the index is periodically reset (see SEQ_INCREMENTAL_STATE_CLEARED). When packet loss occurs, the reader will only lose interning data up to the next reset.](https://perfetto.dev/docs/reference/trace-packet-proto#because-of-the-incremental-build-up-the-interning-index-will-miss-data-when-tracepackets-are-lost-e-g-because-a-chunk-was-overridden-in-the-central-ring-buffer-to-avoid-invalidation-of-the-whole-trace-in-such-a-case-the-index-is-periodically-reset-see-seq_incremental_state_cleared-when-packet-loss-occurs-the-reader-will-only-lose-interning-data-up-to-the-next-reset-)
  * [DebugAnnotationValueTypeName](https://perfetto.dev/docs/reference/trace-packet-proto#DebugAnnotationValueTypeName)
  * [StackSample.AsyncContextDescriptor](https://perfetto.dev/docs/reference/trace-packet-proto#StackSample.AsyncContextDescriptor)
  * [UnsymbolizedSourceLocation](https://perfetto.dev/docs/reference/trace-packet-proto#UnsymbolizedSourceLocation)
  * [InternedGraphicsContext](https://perfetto.dev/docs/reference/trace-packet-proto#InternedGraphicsContext)
  * [InternedGraphicsContext.Api](https://perfetto.dev/docs/reference/trace-packet-proto#InternedGraphicsContext.Api)
  * [InternedGpuRenderStageSpecification](https://perfetto.dev/docs/reference/trace-packet-proto#InternedGpuRenderStageSpecification)
  * [InternedGpuRenderStageSpecification.RenderStageCategory](https://perfetto.dev/docs/reference/trace-packet-proto#InternedGpuRenderStageSpecification.RenderStageCategory)
  * [InternedGpuCounterDescriptor](https://perfetto.dev/docs/reference/trace-packet-proto#InternedGpuCounterDescriptor)
  * [InternedV8JsFunction.Kind](https://perfetto.dev/docs/reference/trace-packet-proto#InternedV8JsFunction.Kind)
  * [InternedV8JsScript.Type](https://perfetto.dev/docs/reference/trace-packet-proto#InternedV8JsScript.Type)
  * [InternedV8Isolate.CodeRange](https://perfetto.dev/docs/reference/trace-packet-proto#InternedV8Isolate.CodeRange)
  * [PerfEvents.Tracepoint](https://perfetto.dev/docs/reference/trace-packet-proto#PerfEvents.Tracepoint)
  * [PerfEvents.EventModifier](https://perfetto.dev/docs/reference/trace-packet-proto#PerfEvents.EventModifier)


