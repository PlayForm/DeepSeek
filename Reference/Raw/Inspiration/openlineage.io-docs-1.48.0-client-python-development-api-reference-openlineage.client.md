This is documentation for OpenLineage **1.48.0** , which is no longer actively maintained.
For up-to-date documentation, see the (1.54.0).
Version: 1.48.0
## openlineage.client.client module 

_class _openlineage.client.client.OpenLineageClientOptions(_timeout_ , _verify_ , _api_key_ , _adapter_) 
    
Bases: `object` 

Parameters: 
    
  * **timeout** ()
  * **verify** ()
  * **api_key** (`Optional`[`str`])
  * **adapter** (`Optional`[`HTTPAdapter`])



timeout _ float_ 


verify _ bool_ 


api_key _ str | None_ 


adapter _ HTTPAdapter | None_ 


_class _openlineage.client.client.OpenLineageConfig(_transport NOTHING_, _facets NOTHING_, _filters NOTHING_, _NOTHING_) 
    
Bases: `object` 

Parameters: 
    
  * **transport** (`dict`[`str`, `Any`] | `None`)
  * **facets** (`FacetsConfig`)
  * **filters** ()
  * **tags** (`TagsConfig`)



transport _`dict`[`str`, `Any`] | `None`_ 


facets _`FacetsConfig`_ 


filters _`list`[[`FilterConfig`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.filter.FilterConfig "openlineage.client.filter.FilterConfig")]_ 


_`TagsConfig`_ 


_classmethod _from_dict(_params_) 
     

Parameters: 
    
**params** (`dict`[`str`, `Any`]) 

Return type: 
     

_class _openlineage.client.client.OpenLineageClient(__,_options_ , _session_ , _transport_ , _factory_ , , _config_) 
    
Bases: `object` 

Parameters: 
    
  * **url** (str | None)
  * **options** (OpenLineageClientOptions | None)
  * **session** (Session | None)
  * **transport** (Transport | None)
  * **factory** (TransportFactory | None)
  * **config** (dict[str, Any] | None)



DYNAMIC_ENV_VARS_PREFIX _ 'OPENLINEAGE__'_ 


DEFAULT_URL_TRANSPORT_NAME _ 'default_http'_ 


_classmethod _from_environment() 
     

Return type: 
    
`TypeVar`(, bound= OpenLineageClient) 

_classmethod _from_dict(_config_) 
     

Parameters: 
    
**config** (`dict`[`str`, `str`]) 

Return type: 
    
`TypeVar`(, bound= OpenLineageClient) 

filter_event(_event_) 
    
Filters jobs according to config-defined events 

Parameters: 
    
**event** ([`RunEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.run.RunEvent "openlineage.client.run.RunEvent") | [`DatasetEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.run.DatasetEvent "openlineage.client.run.DatasetEvent") | [`JobEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.run.JobEvent "openlineage.client.run.JobEvent") | [`RunEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.RunEvent "openlineage.client.generated.base.RunEvent") | [`DatasetEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.DatasetEvent "openlineage.client.generated.base.DatasetEvent") | [`JobEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.JobEvent "openlineage.client.generated.base.JobEvent")) 

Return type: 
    
[`RunEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.run.RunEvent "openlineage.client.run.RunEvent") | [`DatasetEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.run.DatasetEvent "openlineage.client.run.DatasetEvent") | [`JobEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.run.JobEvent "openlineage.client.run.JobEvent") | [`RunEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.RunEvent "openlineage.client.generated.base.RunEvent") | [`DatasetEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.DatasetEvent "openlineage.client.generated.base.DatasetEvent") | [`JobEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.JobEvent "openlineage.client.generated.base.JobEvent") | `None` 

(_event_) 
     

Parameters: 
    
**event** ([`RunEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.run.RunEvent "openlineage.client.run.RunEvent") | [`DatasetEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.run.DatasetEvent "openlineage.client.run.DatasetEvent") | [`JobEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.run.JobEvent "openlineage.client.run.JobEvent") | [`RunEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.RunEvent "openlineage.client.generated.base.RunEvent") | [`DatasetEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.DatasetEvent "openlineage.client.generated.base.DatasetEvent") | [`JobEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.JobEvent "openlineage.client.generated.base.JobEvent")) 

Return type: 


close(_timeout_) 
    
Closes down the transport until all events are processed or timeout is reached. Params:
> timeout: Timeout in seconds. -1 means to block until last event is processed, 0 means no timeout. 

Parameters: 
    
**timeout** () 

Return type: 


_property _config 
    
Retrieves the OpenLineage configuration.
This property method returns the content of the OpenLineage YAML config file. The configuration is determined by merging sources in the following order of precedence: 1. User-defined configuration passed to the client constructor. 2. YAML config file located in one of the following paths: - Path specified by the OPENLINEAGE_CONFIG environment variable. - Current working directory. - $HOME/.openlineage. 3. Environment variables with the OPENLINEAGE__ prefix. If the configuration is not already loaded, it will be constructed by merging the above sources. In case of a TypeError during the parsing of the configuration, a ValueError will be raised indicating that the structure of the config does not match the expected format. 

add_environment_facets(_event_) 
    
Adds environment variables as facets to the event object. 

Parameters: 
    
**event** ([`RunEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.run.RunEvent "openlineage.client.run.RunEvent") | [`DatasetEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.run.DatasetEvent "openlineage.client.run.DatasetEvent") | [`JobEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.run.JobEvent "openlineage.client.run.JobEvent") | [`RunEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.RunEvent "openlineage.client.generated.base.RunEvent") | [`DatasetEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.DatasetEvent "openlineage.client.generated.base.DatasetEvent") | [`JobEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.JobEvent "openlineage.client.generated.base.JobEvent")) 

Return type: 
    
[`RunEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.run.RunEvent "openlineage.client.run.RunEvent") | [`DatasetEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.run.DatasetEvent "openlineage.client.run.DatasetEvent") | [`JobEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.run.JobEvent "openlineage.client.run.JobEvent") | [`RunEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.RunEvent "openlineage.client.generated.base.RunEvent") | [`DatasetEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.DatasetEvent "openlineage.client.generated.base.DatasetEvent") | [`JobEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.JobEvent "openlineage.client.generated.base.JobEvent") 

update_event_tags_facets(_event_) 
    
Creates or updates job and run tag facets based on user-supplied environment variables 

Parameters: 
    
**event** ([`RunEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.run.RunEvent "openlineage.client.run.RunEvent") | [`DatasetEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.run.DatasetEvent "openlineage.client.run.DatasetEvent") | [`JobEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.run.JobEvent "openlineage.client.run.JobEvent") | [`RunEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.RunEvent "openlineage.client.generated.base.RunEvent") | [`DatasetEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.DatasetEvent "openlineage.client.generated.base.DatasetEvent") | [`JobEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.JobEvent "openlineage.client.generated.base.JobEvent")) 

Return type: 
    
[`RunEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.run.RunEvent "openlineage.client.run.RunEvent") | [`DatasetEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.run.DatasetEvent "openlineage.client.run.DatasetEvent") | [`JobEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.run.JobEvent "openlineage.client.run.JobEvent") | [`RunEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.RunEvent "openlineage.client.generated.base.RunEvent") | [`DatasetEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.DatasetEvent "openlineage.client.generated.base.DatasetEvent") | [`JobEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.JobEvent "openlineage.client.generated.base.JobEvent") 

add_source_code_location_facet(_event_) 
    
Adds sourceCodeLocation job facet if not already present and not disabled. 

Parameters: 
    
**event** ([`RunEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.run.RunEvent "openlineage.client.run.RunEvent") | [`DatasetEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.run.DatasetEvent "openlineage.client.run.DatasetEvent") | [`JobEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.run.JobEvent "openlineage.client.run.JobEvent") | [`RunEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.RunEvent "openlineage.client.generated.base.RunEvent") | [`DatasetEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.DatasetEvent "openlineage.client.generated.base.DatasetEvent") | [`JobEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.JobEvent "openlineage.client.generated.base.JobEvent")) 

Return type: 
    
[`RunEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.run.RunEvent "openlineage.client.run.RunEvent") | [`DatasetEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.run.DatasetEvent "openlineage.client.run.DatasetEvent") | [`JobEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.run.JobEvent "openlineage.client.run.JobEvent") | [`RunEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.RunEvent "openlineage.client.generated.base.RunEvent") | [`DatasetEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.DatasetEvent "openlineage.client.generated.base.DatasetEvent") | [`JobEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.JobEvent "openlineage.client.generated.base.JobEvent")
## openlineage.client.event_v2 module 

_class _openlineage.client.event_v2.BaseEvent(, _eventTime_ , _producer_) 
    
Bases: [`RedactMixin`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.utils.RedactMixin "openlineage.client.utils.RedactMixin") 

Parameters: 
    
  * **eventTime** ()
  * **producer** ()



eventTime 
    
the time the event occurred at 

producer 


schemaURL 


_property _skip_redact _ liststr_ 


eventtime_check(_attribute_ , _value_) 
     

Parameters: 
    
  * **attribute** ()
  * **value** ()



Return type: 


producer_check(_attribute_ , _value_) 
     

Parameters: 
    
  * **attribute** ()
  * **value** ()



Return type: 


schemaurl_check(_attribute_ , _value_) 
     

Parameters: 
    
  * **attribute** ()
  * **value** ()



Return type: 


_class _openlineage.client.event_v2.Dataset(_namespace_ , __, ,_facets NOTHING_) 
    
Bases: [`RedactMixin`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.utils.RedactMixin "openlineage.client.utils.RedactMixin") 

Parameters: 
    
  * **namespace** (str)
  * **name** (str)
  * **facets** (dict[str, DatasetFacet] | None)



namespace 
    
The namespace containing that dataset
Example: my-datasource-namespace 


    
The unique name for that dataset within that namespace
Example: instance.schema.table 

facets _`dict`[`str`, [`DatasetFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.DatasetFacet "openlineage.client.generated.base.DatasetFacet")] | `None`_ 
    
The facets for this dataset 

_class _openlineage.client.event_v2.DatasetEvent(, _eventTime_ , _producer_ , _dataset_) 
    
Bases: [`BaseEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.BaseEvent "openlineage.client.generated.base.BaseEvent") 

Parameters: 
    
  * **eventTime** (str)
  * **producer** (str)
  * **dataset** (StaticDataset)



dataset 


_class _openlineage.client.event_v2.InputDataset(_namespace_ , __,_inputFacets NOTHING_, , _facets NOTHING_) 
    
Bases: [`Dataset`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.Dataset "openlineage.client.generated.base.Dataset")
An input dataset 

Parameters: 
    
  * **namespace** (str)
  * **name** (str)
  * **inputFacets** (dict[str, InputDatasetFacet] | None)
  * **facets** (dict[str, DatasetFacet] | None)



inputFacets _`dict`[`str`, [`InputDatasetFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.InputDatasetFacet "openlineage.client.generated.base.InputDatasetFacet")] | `None`_ 
    
The input facets for this dataset. 

_class _openlineage.client.event_v2.(_namespace_ , __,_facets NOTHING_) 
    
Bases: [`RedactMixin`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.utils.RedactMixin "openlineage.client.utils.RedactMixin") 

Parameters: 
    
  * **namespace** (str)
  * **name** (str)
  * **facets** (dict[str, JobFacet] | None)



namespace 
    
The namespace containing that job
Example: my-scheduler-namespace 


    
The unique name for that job within that namespace
Example: myjob.mytask 

facets _`dict`[`str`, [`JobFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.JobFacet "openlineage.client.generated.base.JobFacet")] | `None`_ 
    
The job facets. 

_class _openlineage.client.event_v2.JobEvent(, _eventTime_ , _producer_ , , _inputs NOTHING_, _outputs NOTHING_) 
    
Bases: [`BaseEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.BaseEvent "openlineage.client.generated.base.BaseEvent") 

Parameters: 
    
  * **eventTime** (str)
  * **producer** (str)
  * **job** (Job)
  * **inputs** (list[InputDataset] | None)
  * **outputs** (list[OutputDataset] | None)






inputs _`list`[[`InputDataset`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.InputDataset "openlineage.client.generated.base.InputDataset")] | `None`_ 
    
The set of **input** datasets. 

outputs _`list`[[`OutputDataset`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.OutputDataset "openlineage.client.generated.base.OutputDataset")] | `None`_ 
    
The set of **output** datasets. 

_class _openlineage.client.event_v2.OutputDataset(_namespace_ , __,_outputFacets NOTHING_, , _facets NOTHING_) 
    
Bases: [`Dataset`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.Dataset "openlineage.client.generated.base.Dataset")
An output dataset 

Parameters: 
    
  * **namespace** (str)
  * **name** (str)
  * **outputFacets** (dict[str, OutputDatasetFacet] | None)
  * **facets** (dict[str, DatasetFacet] | None)



outputFacets _`dict`[`str`, [`OutputDatasetFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.OutputDatasetFacet "openlineage.client.generated.base.OutputDatasetFacet")] | `None`_ 
    
The output facets for this dataset 

_class _openlineage.client.event_v2.(_runId_ , _facets NOTHING_) 
    
Bases: [`RedactMixin`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.utils.RedactMixin "openlineage.client.utils.RedactMixin") 

Parameters: 
    
  * **runId** (str)
  * **facets** (dict[str, RunFacet] | None)



runId 
    
The globally unique ID of the run associated with the job. 

facets _`dict`[`str`, [`RunFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.RunFacet "openlineage.client.generated.base.RunFacet")] | `None`_ 
    
The run facets. 

runid_check(_attribute_ , _value_) 
     

Parameters: 
    
  * **attribute** ()
  * **value** ()



Return type: 


_class _openlineage.client.event_v2.RunEvent(, _eventTime_ , _producer_ , , , _eventType_ , _inputs NOTHING_, _outputs NOTHING_) 
    
Bases: [`BaseEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.BaseEvent "openlineage.client.generated.base.BaseEvent") 

Parameters: 
    
  * **eventTime** ()
  * **producer** ()
  * **run** ()
  * **job** ()
  * **eventType** (`Optional`[[`EventType`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.EventType "openlineage.client.generated.base.EventType")])
  * **inputs** (`list`[[`InputDataset`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.InputDataset "openlineage.client.generated.base.InputDataset")] | `None`)
  * **outputs** (`list`[[`OutputDataset`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.OutputDataset "openlineage.client.generated.base.OutputDataset")] | `None`)









eventType 
    
the current transition of the run state. It is required to issue 1 START event and 1 of [ COMPLETE, ABORT, FAIL ] event per run. Additional events with OTHER eventType can be added to the same run. For example to send additional metadata after the run is complete
Example: START|RUNNING|COMPLETE|ABORT|FAIL|OTHER 

inputs _`list`[[`InputDataset`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.InputDataset "openlineage.client.generated.base.InputDataset")] | `None`_ 
    
The set of **input** datasets. 

outputs _`list`[[`OutputDataset`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.OutputDataset "openlineage.client.generated.base.OutputDataset")] | `None`_ 
    
The set of **output** datasets. 

openlineage.client.event_v2.RunState 
    
alias of [`EventType`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.EventType "openlineage.client.generated.base.EventType") 

_class _openlineage.client.event_v2.StaticDataset(_namespace_ , __, ,_facets NOTHING_) 
    
Bases: [`Dataset`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.Dataset "openlineage.client.generated.base.Dataset")
A Dataset sent within static metadata events 

Parameters: 
    
  * **namespace** ()
  * **name** ()
  * **facets** (`dict`[`str`, [`DatasetFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.DatasetFacet "openlineage.client.generated.base.DatasetFacet")] | `None`)



openlineage.client.event_v2.set_producer(_producer_) 
     

Parameters: 
    
**producer** () 

Return type: 

## openlineage.client.facet module 

openlineage.client.facet.set_producer(_producer_) 
     

Parameters: 
    
**producer** () 

Return type: 


_class _openlineage.client.facet.BaseFacet 
    
Bases: [`RedactMixin`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.utils.RedactMixin "openlineage.client.utils.RedactMixin") 

_property _skip_redact _ liststr_ 


_class _openlineage.client.facet.NominalTimeRunFacet(_nominalStartTime_ , _nominalEndTime_) 
    
Bases: [`BaseFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.facet.BaseFacet "openlineage.client.facet.BaseFacet") 

Parameters: 
    
  * **nominalStartTime** ()
  * **nominalEndTime** (`Optional`[`str`])



nominalStartTime 


nominalEndTime _`str` | `None`_ 


_class _openlineage.client.facet.ParentRunFacet(, ) 
    
Bases: [`BaseFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.facet.BaseFacet "openlineage.client.facet.BaseFacet") 

Parameters: 
    
  * **run** (`dict`[`Any`, `Any`])
  * **job** (`dict`[`Any`, `Any`])



_`dict`[`Any`, `Any`]_ 


_`dict`[`Any`, `Any`]_ 


_classmethod _create(_runId_ , _namespace_ , __) 
     

Parameters: 
    
  * **runId** ()
  * **namespace** ()
  * **name** ()



Return type: 
     

_class _openlineage.client.facet.DocumentationJobFacet(_description_) 
    
Bases: [`BaseFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.facet.BaseFacet "openlineage.client.facet.BaseFacet") 

Parameters: 
    
**description** () 

description 


_class _openlineage.client.facet.SourceCodeLocationJobFacet(__,) 
    
Bases: [`BaseFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.facet.BaseFacet "openlineage.client.facet.BaseFacet") 

Parameters: 
    
  * **type** ()
  * **url** ()









_class _openlineage.client.facet.SqlJobFacet(_query_) 
    
Bases: [`BaseFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.facet.BaseFacet "openlineage.client.facet.BaseFacet") 

Parameters: 
    
**query** () 

query 


_class _openlineage.client.facet.DocumentationDatasetFacet(_description_) 
    
Bases: [`BaseFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.facet.BaseFacet "openlineage.client.facet.BaseFacet") 

Parameters: 
    
**description** () 

description 


_class _openlineage.client.facet.SchemaField(__,__,_description_) 
    
Bases: [`RedactMixin`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.utils.RedactMixin "openlineage.client.utils.RedactMixin") 

Parameters: 
    
  * **name** ()
  * **type** ()
  * **description** (`Optional`[`str`])









description _`str` | `None`_ 


_class _openlineage.client.facet.SchemaDatasetFacet(_fields_) 
    
Bases: [`BaseFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.facet.BaseFacet "openlineage.client.facet.BaseFacet") 

Parameters: 
    
**fields** () 

fields _`list`[[`SchemaField`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.facet.SchemaField "openlineage.client.facet.SchemaField")]_ 


_class _openlineage.client.facet.DataSourceDatasetFacet(__,) 
    
Bases: [`BaseFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.facet.BaseFacet "openlineage.client.facet.BaseFacet") 

Parameters: 
    
  * **name** ()
  * **uri** ()









_class _openlineage.client.facet.OutputStatisticsOutputDatasetFacet(_rowCount_ , __,_fileCount_) 
    
Bases: [`BaseFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.facet.BaseFacet "openlineage.client.facet.BaseFacet") 

Parameters: 
    
  * **rowCount** (`Optional`[`int`])
  * **size** (`Optional`[`int`])
  * **fileCount** (`Optional`[`int`])



rowCount _`int` | `None`_ 


_`int` | `None`_ 


fileCount _`int` | `None`_ 


_class _openlineage.client.facet.ColumnMetric(_nullCount_ , _distinctCount_ , __,_count_ , __,__,_quantiles_) 
    
Bases: `object` 

Parameters: 
    
  * **nullCount** (`Optional`[`int`])
  * **distinctCount** (`Optional`[`int`])
  * **sum** (`Optional`[`int`])
  * **count** (`Optional`[`int`])
  * **min** (`Optional`[`float`])
  * **max** (`Optional`[`float`])
  * **quantiles** (`Optional`[`dict`[`str`, `float`]])



nullCount _`int` | `None`_ 


distinctCount _`int` | `None`_ 


_`int` | `None`_ 


count _`int` | `None`_ 


_`float` | `None`_ 


_`float` | `None`_ 


quantiles _`dict`[`str`, `float`] | `None`_ 


_class _openlineage.client.facet.DataQualityMetricsInputDatasetFacet(_rowCount_ , _bytes_ , _fileCount_ , _columnMetrics NOTHING_) 
    
Bases: [`BaseFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.facet.BaseFacet "openlineage.client.facet.BaseFacet") 

Parameters: 
    
  * **rowCount** (`Optional`[`int`])
  * **bytes** (`Optional`[`int`])
  * **fileCount** (`Optional`[`int`])
  * **columnMetrics** (`dict`[`str`, [`ColumnMetric`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.facet.ColumnMetric "openlineage.client.facet.ColumnMetric")])



rowCount _`int` | `None`_ 


bytes _`int` | `None`_ 


fileCount _`int` | `None`_ 


columnMetrics _`dict`[`str`, [`ColumnMetric`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.facet.ColumnMetric "openlineage.client.facet.ColumnMetric")]_ 


_class _openlineage.client.facet.Assertion(_assertion_ , _success_ , _column_) 
    
Bases: [`RedactMixin`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.utils.RedactMixin "openlineage.client.utils.RedactMixin") 

Parameters: 
    
  * **assertion** ()
  * **success** ()
  * **column** (`Optional`[`str`])



assertion 


success _`bool`_ 


column _`str` | `None`_ 


_class _openlineage.client.facet.DataQualityAssertionsDatasetFacet(_assertions_) 
    
Bases: [`BaseFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.facet.BaseFacet "openlineage.client.facet.BaseFacet")
This facet represents asserted expectations on dataset or it’s column. 

Parameters: 
    
**assertions** () 

assertions _`list`[[`Assertion`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.facet.Assertion "openlineage.client.facet.Assertion")]_ 


_class _openlineage.client.facet.SourceCodeJobFacet(_language_ , _source_) 
    
Bases: [`BaseFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.facet.BaseFacet "openlineage.client.facet.BaseFacet")
This facet represents source code that the job executed. 

Parameters: 
    
  * **language** ()
  * **source** ()



language 


source 


_class _openlineage.client.facet.ExternalQueryRunFacet(_externalQueryId_ , _source_) 
    
Bases: [`BaseFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.facet.BaseFacet "openlineage.client.facet.BaseFacet") 

Parameters: 
    
  * **externalQueryId** ()
  * **source** ()



externalQueryId 


source 


_class _openlineage.client.facet.ErrorMessageRunFacet(_message_ , _programmingLanguage_ , _stackTrace_) 
    
Bases: [`BaseFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.facet.BaseFacet "openlineage.client.facet.BaseFacet")
This facet represents an error message that was the result of a job run. 

Parameters: 
    
  * **message** ()
  * **programmingLanguage** ()
  * **stackTrace** (`Optional`[`str`])



message 


programmingLanguage 


stackTrace _`str` | `None`_ 


_class _openlineage.client.facet.SymlinksDatasetFacetIdentifiers(_namespace_ , __,__) 
    
Bases: `object` 

Parameters: 
    
  * **namespace** ()
  * **name** ()
  * **type** ()



namespace 








_class _openlineage.client.facet.SymlinksDatasetFacet(_identifiers NOTHING_) 
    
Bases: [`BaseFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.facet.BaseFacet "openlineage.client.facet.BaseFacet")
This facet represents dataset symlink names. 

Parameters: 
    
**identifiers** (`list`[[`SymlinksDatasetFacetIdentifiers`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.facet.SymlinksDatasetFacetIdentifiers "openlineage.client.facet.SymlinksDatasetFacetIdentifiers")]) 

identifiers _`list`[[`SymlinksDatasetFacetIdentifiers`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.facet.SymlinksDatasetFacetIdentifiers "openlineage.client.facet.SymlinksDatasetFacetIdentifiers")]_ 


_class _openlineage.client.facet.StorageDatasetFacet(_storageLayer_ , _fileFormat_) 
    
Bases: [`BaseFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.facet.BaseFacet "openlineage.client.facet.BaseFacet")
This facet represents dataset symlink names. 

Parameters: 
    
  * **storageLayer** ()
  * **fileFormat** ()



storageLayer 


fileFormat 


_class _openlineage.client.facet.OwnershipJobFacetOwners(__,__) 
    
Bases: `object` 

Parameters: 
    
  * **name** ()
  * **type** (`Optional`[`str`])






_`str` | `None`_ 


_class _openlineage.client.facet.OwnershipJobFacet(_owners NOTHING_) 
    
Bases: [`BaseFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.facet.BaseFacet "openlineage.client.facet.BaseFacet")
This facet represents ownership of a job. 

Parameters: 
    
**owners** () 

owners _`list`[[`OwnershipJobFacetOwners`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.facet.OwnershipJobFacetOwners "openlineage.client.facet.OwnershipJobFacetOwners")]_ 


_class _openlineage.client.facet.JobTypeJobFacet(_processingType_ , _integration_ , _jobType_) 
    
Bases: [`BaseFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.facet.BaseFacet "openlineage.client.facet.BaseFacet")
This facet represents job type properties. 

Parameters: 
    
  * **processingType** ()
  * **integration** ()
  * **jobType** ()



processingType 


integration 


jobType 


_class _openlineage.client.facet.DatasetVersionDatasetFacet(_datasetVersion_) 
    
Bases: [`BaseFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.facet.BaseFacet "openlineage.client.facet.BaseFacet")
This facet represents version of a dataset. 

Parameters: 
    
**datasetVersion** () 

datasetVersion 


_class _openlineage.client.facet.LifecycleStateChange(_value_) 
    
Bases: `Enum`
An enumeration. 

ALTER _ 'ALTER'_ 


CREATE _ 'CREATE'_ 


_ 'DROP'_ 


OVERWRITE _ 'OVERWRITE'_ 


RENAME _ 'RENAME'_ 


TRUNCATE _ 'TRUNCATE'_ 


_class _openlineage.client.facet.LifecycleStateChangeDatasetFacetPreviousIdentifier(__,_namespace_) 
    
Bases: `object` 

Parameters: 
    
  * **name** ()
  * **namespace** ()






namespace 


_class _openlineage.client.facet.LifecycleStateChangeDatasetFacet(_lifecycleStateChange_ , _previousIdentifier_) 
    
Bases: [`BaseFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.facet.BaseFacet "openlineage.client.facet.BaseFacet")
This facet represents information of lifecycle changes of a dataset. 

Parameters: 
    
  * **lifecycleStateChange** ()
  * **previousIdentifier** ([`LifecycleStateChangeDatasetFacetPreviousIdentifier`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.facet.LifecycleStateChangeDatasetFacetPreviousIdentifier "openlineage.client.facet.LifecycleStateChangeDatasetFacetPreviousIdentifier"))



lifecycleStateChange 


previousIdentifier _[`LifecycleStateChangeDatasetFacetPreviousIdentifier`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.facet.LifecycleStateChangeDatasetFacetPreviousIdentifier "openlineage.client.facet.LifecycleStateChangeDatasetFacetPreviousIdentifier")_ 


_class _openlineage.client.facet.OwnershipDatasetFacetOwners(__,__) 
    
Bases: `object` 

Parameters: 
    
  * **name** ()
  * **type** ()









_class _openlineage.client.facet.OwnershipDatasetFacet(_owners NOTHING_) 
    
Bases: [`BaseFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.facet.BaseFacet "openlineage.client.facet.BaseFacet")
This facet represents ownership of a dataset. 

Parameters: 
    
**owners** (`list`[[`OwnershipDatasetFacetOwners`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.facet.OwnershipDatasetFacetOwners "openlineage.client.facet.OwnershipDatasetFacetOwners")]) 

owners _`list`[[`OwnershipDatasetFacetOwners`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.facet.OwnershipDatasetFacetOwners "openlineage.client.facet.OwnershipDatasetFacetOwners")]_ 


_class _openlineage.client.facet.ColumnLineageDatasetFacetFieldsAdditionalInputFields(_namespace_ , __,_field_) 
    
Bases: [`RedactMixin`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.utils.RedactMixin "openlineage.client.utils.RedactMixin") 

Parameters: 
    
  * **namespace** ()
  * **name** ()
  * **field** ()



namespace 





field 


_class _openlineage.client.facet.ColumnLineageDatasetFacetFieldsAdditional(_inputFields_ , _transformationDescription_ , _transformationType_) 
    
Bases: `object` 

Parameters: 
    
  * **inputFields** (`ClassVar`[`list`[[`ColumnLineageDatasetFacetFieldsAdditionalInputFields`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.facet.ColumnLineageDatasetFacetFieldsAdditionalInputFields "openlineage.client.facet.ColumnLineageDatasetFacetFieldsAdditionalInputFields")]])
  * **transformationDescription** ()
  * **transformationType** ()



inputFields _`ClassVar`[`list`[[`ColumnLineageDatasetFacetFieldsAdditionalInputFields`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.facet.ColumnLineageDatasetFacetFieldsAdditionalInputFields "openlineage.client.facet.ColumnLineageDatasetFacetFieldsAdditionalInputFields")]]_ 


transformationDescription 


transformationType 


_class _openlineage.client.facet.ColumnLineageDatasetFacet(_fields NOTHING_) 
    
Bases: [`BaseFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.facet.BaseFacet "openlineage.client.facet.BaseFacet")
This facet contains column lineage of a dataset. 

Parameters: 
    
**fields** (`dict`[`str`, [`ColumnLineageDatasetFacetFieldsAdditional`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.facet.ColumnLineageDatasetFacetFieldsAdditional "openlineage.client.facet.ColumnLineageDatasetFacetFieldsAdditional")]) 

fields _`dict`[`str`, [`ColumnLineageDatasetFacetFieldsAdditional`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.facet.ColumnLineageDatasetFacetFieldsAdditional "openlineage.client.facet.ColumnLineageDatasetFacetFieldsAdditional")]_ 


_class _openlineage.client.facet.ProcessingEngineRunFacet(_version_ , __,_openlineageAdapterVersion_) 
    
Bases: [`BaseFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.facet.BaseFacet "openlineage.client.facet.BaseFacet") 

Parameters: 
    
  * **version** ()
  * **name** ()
  * **openlineageAdapterVersion** ()



version 





openlineageAdapterVersion 


_class _openlineage.client.facet.ExtractionError(_errorMessage_ , _stackTrace_ , __,_taskNumber_) 
    
Bases: [`BaseFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.facet.BaseFacet "openlineage.client.facet.BaseFacet") 

Parameters: 
    
  * **errorMessage** ()
  * **stackTrace** (`str` | `None`)
  * **task** (`str` | `None`)
  * **taskNumber** (`int` | `None`)



errorMessage 


stackTrace _`str` | `None`_ 


_`str` | `None`_ 


taskNumber _`int` | `None`_ 


_class _openlineage.client.facet.ExtractionErrorRunFacet(_totalTasks_ , _failedTasks_ , _errors_) 
    
Bases: [`BaseFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.facet.BaseFacet "openlineage.client.facet.BaseFacet") 

Parameters: 
    
  * **totalTasks** ()
  * **failedTasks** ()
  * **errors** ()



totalTasks 


failedTasks 


errors _`list`[[`ExtractionError`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.facet.ExtractionError "openlineage.client.facet.ExtractionError")]_ 

## openlineage.client.facet_v2 module 

_class _openlineage.client.facet_v2.BaseFacet(, _producer_) 
    
Bases: [`RedactMixin`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.utils.RedactMixin "openlineage.client.utils.RedactMixin")
all fields of the base facet are prefixed with _ to avoid name conflicts in facets 

Parameters: 
    
**producer** () 

_property _skip_redact _ liststr_ 


with_additional_properties(_kwargs_) 
    
Add additional properties to updated class instance. 

Parameters: 
    
**kwargs** () 

Return type: 
     

_class _openlineage.client.facet_v2.DatasetFacet(, _producer_ , _deleted_) 
    
Bases: [`BaseFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.BaseFacet "openlineage.client.generated.base.BaseFacet")
A Dataset Facet 

Parameters: 
    
  * **producer** ()
  * **deleted** (`Optional`[`bool`])



_class _openlineage.client.facet_v2.InputDatasetFacet(, _producer_) 
    
Bases: [`BaseFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.BaseFacet "openlineage.client.generated.base.BaseFacet")
An Input Dataset Facet 

Parameters: 
    
**producer** () 

_class _openlineage.client.facet_v2.JobFacet(, _producer_ , _deleted_) 
    
Bases: [`BaseFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.BaseFacet "openlineage.client.generated.base.BaseFacet")
A Job Facet 

Parameters: 
    
  * **producer** ()
  * **deleted** (`Optional`[`bool`])



_class _openlineage.client.facet_v2.OutputDatasetFacet(, _producer_) 
    
Bases: [`BaseFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.BaseFacet "openlineage.client.generated.base.BaseFacet")
An Output Dataset Facet 

Parameters: 
    
**producer** () 

_class _openlineage.client.facet_v2.RunFacet(, _producer_) 
    
Bases: [`BaseFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.BaseFacet "openlineage.client.generated.base.BaseFacet")
A Run Facet 

Parameters: 
    
**producer** () 

openlineage.client.facet_v2.set_producer(_producer_) 
     

Parameters: 
    
**producer** () 

Return type: 

## openlineage.client.filter module 

_class _openlineage.client.filter.FilterConfig(__,_match_ , _regex_) 
    
Bases: `object` 

Parameters: 
    
  * **type** (`Optional`[`str`])
  * **match** (`Optional`[`str`])
  * **regex** (`Optional`[`str`])



_`str` | `None`_ 


match _`str` | `None`_ 


regex _`str` | `None`_ 


_class _openlineage.client.filter.Filter 
    
Bases: `object` 

filter_event(_event_) 
     

Parameters: 
    
**event** () 

Return type: 
     

_class _openlineage.client.filter.ExactMatchFilter(_match_) 
    
Bases: [`Filter`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.filter.Filter "openlineage.client.filter.Filter") 

Parameters: 
    
**match** () 

filter_event(_event_) 
     

Parameters: 
    
**event** () 

Return type: 
     

_class _openlineage.client.filter.RegexFilter(_regex_) 
    
Bases: [`Filter`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.filter.Filter "openlineage.client.filter.Filter") 

Parameters: 
    
**regex** () 

filter_event(_event_) 
     

Parameters: 
    
**event** () 

Return type: 
     

openlineage.client.filter.create_filter(__) 
     

Parameters: 
    
**conf** () 

Return type: 
    
## openlineage.client.run module 

_class _openlineage.client.run.RunState(_value_) 
    
Bases: `Enum`
An enumeration. 

START _ 'START'_ 


RUNNING _ 'RUNNING'_ 


COMPLETE _ 'COMPLETE'_ 


ABORT _ 'ABORT'_ 


_ 'FAIL'_ 


OTHER _ 'OTHER'_ 


_class _openlineage.client.run.Dataset(_namespace_ , __,_facets NOTHING_) 
    
Bases: [`RedactMixin`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.utils.RedactMixin "openlineage.client.utils.RedactMixin") 

Parameters: 
    
  * **namespace** ()
  * **name** ()
  * **facets** (`dict`[`Any`, `Any`])



namespace 





facets _`dict`[`Any`, `Any`]_ 


_class _openlineage.client.run.InputDataset(_namespace_ , __,_facets NOTHING_, _inputFacets NOTHING_) 
    
Bases: [`Dataset`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.run.Dataset "openlineage.client.run.Dataset") 

Parameters: 
    
  * **namespace** ()
  * **name** ()
  * **facets** (`dict`[`Any`, `Any`])
  * **inputFacets** (`dict`[`Any`, `Any`])



inputFacets _`dict`[`Any`, `Any`]_ 


_class _openlineage.client.run.OutputDataset(_namespace_ , __,_facets NOTHING_, _outputFacets NOTHING_) 
    
Bases: [`Dataset`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.run.Dataset "openlineage.client.run.Dataset") 

Parameters: 
    
  * **namespace** ()
  * **name** ()
  * **facets** (`dict`[`Any`, `Any`])
  * **outputFacets** (`dict`[`Any`, `Any`])



outputFacets _`dict`[`Any`, `Any`]_ 


_class _openlineage.client.run.DatasetEvent(_eventTime_ , _producer_ , _schemaURL_ , _dataset_) 
    
Bases: [`RedactMixin`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.utils.RedactMixin "openlineage.client.utils.RedactMixin") 

Parameters: 
    
  * **eventTime** ()
  * **producer** ()
  * **schemaURL** ()
  * **dataset** ()



eventTime 


producer 


schemaURL 


dataset 


_class _openlineage.client.run.(_namespace_ , __,_facets NOTHING_) 
    
Bases: [`RedactMixin`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.utils.RedactMixin "openlineage.client.utils.RedactMixin") 

Parameters: 
    
  * **namespace** ()
  * **name** ()
  * **facets** (`dict`[`Any`, `Any`])



namespace 





facets _`dict`[`Any`, `Any`]_ 


_class _openlineage.client.run.JobEvent(_eventTime_ , _producer_ , _schemaURL_ , , _inputs NOTHING_, _outputs NOTHING_) 
    
Bases: [`RedactMixin`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.utils.RedactMixin "openlineage.client.utils.RedactMixin") 

Parameters: 
    
  * **eventTime** ()
  * **producer** ()
  * **schemaURL** ()
  * **job** ()
  * **inputs** (`list`[[`Dataset`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.run.Dataset "openlineage.client.run.Dataset")] | `None`)
  * **outputs** (`list`[[`Dataset`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.run.Dataset "openlineage.client.run.Dataset")] | `None`)



eventTime 


producer 


schemaURL 





inputs _`list`[[`Dataset`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.run.Dataset "openlineage.client.run.Dataset")] | `None`_ 


outputs _`list`[[`Dataset`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.run.Dataset "openlineage.client.run.Dataset")] | `None`_ 


_class _openlineage.client.run.(_runId_ , _facets NOTHING_) 
    
Bases: [`RedactMixin`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.utils.RedactMixin "openlineage.client.utils.RedactMixin") 

Parameters: 
    
  * **runId** ()
  * **facets** (`dict`[`Any`, `Any`])



runId 


facets _`dict`[`Any`, `Any`]_ 


check(_attribute_ , _value_) 
     

Parameters: 
    
  * **attribute** ()
  * **value** ()



Return type: 


_class _openlineage.client.run.RunEvent(_eventType_ , _eventTime_ , , , _producer_ , _inputs NOTHING_, _outputs NOTHING_, _schemaURL 'https://openlineage.io/spec/1-0-5/OpenLineage.json#/definitions/RunEvent'_) 
    
Bases: [`RedactMixin`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.utils.RedactMixin "openlineage.client.utils.RedactMixin") 

Parameters: 
    
  * **eventType** ()
  * **eventTime** ()
  * **run** ()
  * **job** ()
  * **producer** ()
  * **inputs** (`list`[[`Dataset`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.run.Dataset "openlineage.client.run.Dataset")] | `None`)
  * **outputs** (`list`[[`Dataset`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.run.Dataset "openlineage.client.run.Dataset")] | `None`)
  * **schemaURL** ()



eventType 


eventTime 








producer 


inputs _`list`[[`Dataset`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.run.Dataset "openlineage.client.run.Dataset")] | `None`_ 


outputs _`list`[[`Dataset`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.run.Dataset "openlineage.client.run.Dataset")] | `None`_ 


schemaURL 


check(_attribute_ , _value_) 
     

Parameters: 
    
  * **attribute** ()
  * **value** ()



Return type: 

## openlineage.client.serde module 

_class _openlineage.client.serde.Serde 
    
Bases: `object` 

_classmethod _remove_nulls_and_enums() 
     

Parameters: 
    
**obj** () 

Return type: 


_classmethod _to_dict() 
     

Parameters: 
    
**obj** () 

Return type: 
    
`dict`[`Any`, `Any`] 

_classmethod _to_json(, _kwargs_) 
     

Parameters: 
    
  * **obj** ()
  * **kwargs** ()



Return type: 

## openlineage.client.utils module 

openlineage.client.utils.import_from_string(__) 
     

Parameters: 
    
**path** () 

Return type: 
    
`type`[`Any`] 

openlineage.client.utils.try_import_from_string(__) 
     

Parameters: 
    
**path** () 

Return type: 
    
`type`[`Any`] | `None` 

openlineage.client.utils.get_only_specified_fields(_clazz_ , _params_) 
     

Parameters: 
    
  * **clazz** (`type`[`Any`])
  * **params** (`dict`[`str`, `Any`])



Return type: 
    
`dict`[`str`, `Any`] 

openlineage.client.utils.deep_merge_dicts(_dict1_ , _dict2_) 
    
Deep merges two dictionaries.
This function merges two dictionaries while handling nested dictionaries. For keys that exist in both dictionaries, the values from dict2 take precedence. If a key exists in both dictionaries and the values are dictionaries themselves, they are merged recursively. This function merges only dictionaries. If key is of different type, e.g. list it does not work properly. 

Parameters: 
    
  * **dict1** (`dict`[`Any`, `Any`])
  * **dict2** (`dict`[`Any`, `Any`])



Return type: 
    
`dict`[`Any`, `Any`] 

_class _openlineage.client.utils.RedactMixin 
    
Bases: `object` 

_property _skip_redact _ liststr_ 

## openlineage.client.uuid module 

openlineage.client.uuid.generate_new_uuid(_instant_) 
    
Generate new UUID for an instant of time. Each function call returns a new UUID value.
UUID version is an implementation detail, and **should not** be relied on. For now it is [UUIDv7](<https://datatracker.ietf.org/doc/rfc9562/>), so for increasing instant values, returned UUID is always greater than previous one.
Using uuid6 lib implementation (MIT License), with few changes: * [oittaa/uuid6-python](https://github.com/oittaa/uuid6-python/blob/4f879849178b8a7a564f7cb76c3f7a6e5228d9ed/src/uuid6/__init__.py#L128-L147) * [oittaa/uuid6-python](https://github.com/oittaa/uuid6-python/blob/4f879849178b8a7a564f7cb76c3f7a6e5228d9ed/src/uuid6/__init__.py#L46-L51)
Added in v1.15.0 

Parameters: 
    
**instant** (`Optional`[`datetime`]) – instant of time used to generate UUID. If not provided, current time is used. 

Return type: 


Returns: 
    
UUID 

openlineage.client.uuid.generate_static_uuid(_instant_ , __) 
    
Generate UUID for instant of time and input data. Calling function with same arguments always produces the same result.
UUID version is an implementation detail, and should not* be relied on. For now it is [UUIDv7](<https://datatracker.ietf.org/doc/rfc9562/>), so for increasing instant values, returned UUID is always greater than previous one. The only difference from RFC 9562 is that least significant bytes are not random, but instead a SHA-1 hash of input data.
Using uuid6 lib implementation (MIT License), with few changes: * [oittaa/uuid6-python](https://github.com/oittaa/uuid6-python/blob/4f879849178b8a7a564f7cb76c3f7a6e5228d9ed/src/uuid6/__init__.py#L128-L147) * [oittaa/uuid6-python](https://github.com/oittaa/uuid6-python/blob/4f879849178b8a7a564f7cb76c3f7a6e5228d9ed/src/uuid6/__init__.py#L46-L51)
Added in v1.15.0 

Parameters: 
    
  * **instant** (`datetime`) – instant of time used to generate UUID. If not provided, current time is used.
  * **data** () – input data to generate random part from.



Return type: 


Returns: 
    
UUID
## openlineage.client.generated.base module 

openlineage.client.generated.base.set_producer(_producer_) 
     

Parameters: 
    
**producer** () 

Return type: 


_class _openlineage.client.generated.base.BaseEvent(, _eventTime_ , _producer_) 
    
Bases: [`RedactMixin`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.utils.RedactMixin "openlineage.client.utils.RedactMixin") 

Parameters: 
    
  * **eventTime** ()
  * **producer** ()



eventTime 
    
the time the event occurred at 

producer 


schemaURL 


_property _skip_redact _ liststr_ 


eventtime_check(_attribute_ , _value_) 
     

Parameters: 
    
  * **attribute** ()
  * **value** ()



Return type: 


producer_check(_attribute_ , _value_) 
     

Parameters: 
    
  * **attribute** ()
  * **value** ()



Return type: 


schemaurl_check(_attribute_ , _value_) 
     

Parameters: 
    
  * **attribute** ()
  * **value** ()



Return type: 


_class _openlineage.client.generated.base.BaseFacet(, _producer_) 
    
Bases: [`RedactMixin`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.utils.RedactMixin "openlineage.client.utils.RedactMixin")
all fields of the base facet are prefixed with _ to avoid name conflicts in facets 

Parameters: 
    
**producer** () 

_property _skip_redact _ liststr_ 


with_additional_properties(_kwargs_) 
    
Add additional properties to updated class instance. 

Parameters: 
    
**kwargs** () 

Return type: 
     

_class _openlineage.client.generated.base.Dataset(_namespace_ , __, ,_facets NOTHING_) 
    
Bases: [`RedactMixin`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.utils.RedactMixin "openlineage.client.utils.RedactMixin") 

Parameters: 
    
  * **namespace** (str)
  * **name** (str)
  * **facets** (dict[str, DatasetFacet] | None)



namespace 
    
The namespace containing that dataset
Example: my-datasource-namespace 


    
The unique name for that dataset within that namespace
Example: instance.schema.table 

facets _`dict`[`str`, [`DatasetFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.DatasetFacet "openlineage.client.generated.base.DatasetFacet")] | `None`_ 
    
The facets for this dataset 

_class _openlineage.client.generated.base.DatasetEvent(, _eventTime_ , _producer_ , _dataset_) 
    
Bases: [`BaseEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.BaseEvent "openlineage.client.generated.base.BaseEvent") 

Parameters: 
    
  * **eventTime** (str)
  * **producer** (str)
  * **dataset** (StaticDataset)



dataset 


_class _openlineage.client.generated.base.DatasetFacet(, _producer_ , _deleted_) 
    
Bases: [`BaseFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.BaseFacet "openlineage.client.generated.base.BaseFacet")
A Dataset Facet 

Parameters: 
    
  * **producer** ()
  * **deleted** (`Optional`[`bool`])



_class _openlineage.client.generated.base.EventType(_value_) 
    
Bases: `Enum`
the current transition of the run state. It is required to issue 1 START event and 1 of [ COMPLETE, ABORT, FAIL ] event per run. Additional events with OTHER eventType can be added to the same run. For example to send additional metadata after the run is complete 

START _ 'START'_ 


RUNNING _ 'RUNNING'_ 


COMPLETE _ 'COMPLETE'_ 


ABORT _ 'ABORT'_ 


_ 'FAIL'_ 


OTHER _ 'OTHER'_ 


_class _openlineage.client.generated.base.InputDataset(_namespace_ , __,_inputFacets NOTHING_, , _facets NOTHING_) 
    
Bases: [`Dataset`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.Dataset "openlineage.client.generated.base.Dataset")
An input dataset 

Parameters: 
    
  * **namespace** (str)
  * **name** (str)
  * **inputFacets** (dict[str, InputDatasetFacet] | None)
  * **facets** (dict[str, DatasetFacet] | None)



inputFacets _`dict`[`str`, [`InputDatasetFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.InputDatasetFacet "openlineage.client.generated.base.InputDatasetFacet")] | `None`_ 
    
The input facets for this dataset. 

_class _openlineage.client.generated.base.InputDatasetFacet(, _producer_) 
    
Bases: [`BaseFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.BaseFacet "openlineage.client.generated.base.BaseFacet")
An Input Dataset Facet 

Parameters: 
    
**producer** () 

_class _openlineage.client.generated.base.(_namespace_ , __,_facets NOTHING_) 
    
Bases: [`RedactMixin`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.utils.RedactMixin "openlineage.client.utils.RedactMixin") 

Parameters: 
    
  * **namespace** (str)
  * **name** (str)
  * **facets** (dict[str, JobFacet] | None)



namespace 
    
The namespace containing that job
Example: my-scheduler-namespace 


    
The unique name for that job within that namespace
Example: myjob.mytask 

facets _`dict`[`str`, [`JobFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.JobFacet "openlineage.client.generated.base.JobFacet")] | `None`_ 
    
The job facets. 

_class _openlineage.client.generated.base.JobEvent(, _eventTime_ , _producer_ , , _inputs NOTHING_, _outputs NOTHING_) 
    
Bases: [`BaseEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.BaseEvent "openlineage.client.generated.base.BaseEvent") 

Parameters: 
    
  * **eventTime** (str)
  * **producer** (str)
  * **job** (Job)
  * **inputs** (list[InputDataset] | None)
  * **outputs** (list[OutputDataset] | None)






inputs _`list`[[`InputDataset`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.InputDataset "openlineage.client.generated.base.InputDataset")] | `None`_ 
    
The set of **input** datasets. 

outputs _`list`[[`OutputDataset`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.OutputDataset "openlineage.client.generated.base.OutputDataset")] | `None`_ 
    
The set of **output** datasets. 

_class _openlineage.client.generated.base.JobFacet(, _producer_ , _deleted_) 
    
Bases: [`BaseFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.BaseFacet "openlineage.client.generated.base.BaseFacet")
A Job Facet 

Parameters: 
    
  * **producer** ()
  * **deleted** (`Optional`[`bool`])



_class _openlineage.client.generated.base.OutputDataset(_namespace_ , __,_outputFacets NOTHING_, , _facets NOTHING_) 
    
Bases: [`Dataset`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.Dataset "openlineage.client.generated.base.Dataset")
An output dataset 

Parameters: 
    
  * **namespace** (str)
  * **name** (str)
  * **outputFacets** (dict[str, OutputDatasetFacet] | None)
  * **facets** (dict[str, DatasetFacet] | None)



outputFacets _`dict`[`str`, [`OutputDatasetFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.OutputDatasetFacet "openlineage.client.generated.base.OutputDatasetFacet")] | `None`_ 
    
The output facets for this dataset 

_class _openlineage.client.generated.base.OutputDatasetFacet(, _producer_) 
    
Bases: [`BaseFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.BaseFacet "openlineage.client.generated.base.BaseFacet")
An Output Dataset Facet 

Parameters: 
    
**producer** () 

_class _openlineage.client.generated.base.(_runId_ , _facets NOTHING_) 
    
Bases: [`RedactMixin`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.utils.RedactMixin "openlineage.client.utils.RedactMixin") 

Parameters: 
    
  * **runId** (str)
  * **facets** (dict[str, RunFacet] | None)



runId 
    
The globally unique ID of the run associated with the job. 

facets _`dict`[`str`, [`RunFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.RunFacet "openlineage.client.generated.base.RunFacet")] | `None`_ 
    
The run facets. 

runid_check(_attribute_ , _value_) 
     

Parameters: 
    
  * **attribute** ()
  * **value** ()



Return type: 


_class _openlineage.client.generated.base.RunEvent(, _eventTime_ , _producer_ , , , _eventType_ , _inputs NOTHING_, _outputs NOTHING_) 
    
Bases: [`BaseEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.BaseEvent "openlineage.client.generated.base.BaseEvent") 

Parameters: 
    
  * **eventTime** ()
  * **producer** ()
  * **run** ()
  * **job** ()
  * **eventType** (`Optional`[[`EventType`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.EventType "openlineage.client.generated.base.EventType")])
  * **inputs** (`list`[[`InputDataset`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.InputDataset "openlineage.client.generated.base.InputDataset")] | `None`)
  * **outputs** (`list`[[`OutputDataset`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.OutputDataset "openlineage.client.generated.base.OutputDataset")] | `None`)









eventType 
    
the current transition of the run state. It is required to issue 1 START event and 1 of [ COMPLETE, ABORT, FAIL ] event per run. Additional events with OTHER eventType can be added to the same run. For example to send additional metadata after the run is complete
Example: START|RUNNING|COMPLETE|ABORT|FAIL|OTHER 

inputs _`list`[[`InputDataset`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.InputDataset "openlineage.client.generated.base.InputDataset")] | `None`_ 
    
The set of **input** datasets. 

outputs _`list`[[`OutputDataset`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.OutputDataset "openlineage.client.generated.base.OutputDataset")] | `None`_ 
    
The set of **output** datasets. 

_class _openlineage.client.generated.base.RunFacet(, _producer_) 
    
Bases: [`BaseFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.BaseFacet "openlineage.client.generated.base.BaseFacet")
A Run Facet 

Parameters: 
    
**producer** () 

_class _openlineage.client.generated.base.StaticDataset(_namespace_ , __, ,_facets NOTHING_) 
    
Bases: [`Dataset`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.Dataset "openlineage.client.generated.base.Dataset")
A Dataset sent within static metadata events 

Parameters: 
    
  * **namespace** ()
  * **name** ()
  * **facets** (`dict`[`str`, [`DatasetFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.DatasetFacet "openlineage.client.generated.base.DatasetFacet")] | `None`)


## openlineage.client.generated.column_lineage_dataset module 

_class _openlineage.client.generated.column_lineage_dataset.ColumnLineageDatasetFacet(_fields_ , _dataset NOTHING_, , _producer_ , _deleted_) 
    
Bases: [`DatasetFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.DatasetFacet "openlineage.client.generated.base.DatasetFacet") 

Parameters: 
    
  * **fields** (dict[str, Fields])
  * **dataset** (list[InputField] | None)
  * **producer** (str)
  * **deleted** (bool | None)



fields _`dict`[`str`, [`Fields`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.column_lineage_dataset.Fields "openlineage.client.generated.column_lineage_dataset.Fields")]_ 
    
Column level lineage that maps output fields into input fields used to evaluate them. 

dataset _`list`[[`InputField`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.column_lineage_dataset.InputField "openlineage.client.generated.column_lineage_dataset.InputField")] | `None`_ 
    
Column level lineage that affects the whole dataset. This includes filtering, sorting, grouping (aggregates), joining, window functions, etc. 

_class _openlineage.client.generated.column_lineage_dataset.Fields(_inputFields_ , _transformationDescription_ , _transformationType_) 
    
Bases: [`RedactMixin`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.utils.RedactMixin "openlineage.client.utils.RedactMixin") 

Parameters: 
    
  * **inputFields** (list[InputField])
  * **transformationDescription** (str | None)
  * **transformationType** (str | None)



inputFields _`list`[[`InputField`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.column_lineage_dataset.InputField "openlineage.client.generated.column_lineage_dataset.InputField")]_ 


transformationDescription _`str` | `None`_ 
    
a string representation of the transformation applied 

transformationType _`str` | `None`_ 
    
no original data available (like a hash of PII for example) 

Type: 
    
IDENTITY|MASKED reflects a clearly defined behavior. IDENTITY 

Type: 
    
exact same as input; MASKED 

with_additional_properties(_kwargs_) 
    
Add additional properties to updated class instance. 

Parameters: 
    
**kwargs** () 

Return type: 
     

_class _openlineage.client.generated.column_lineage_dataset.InputField(_namespace_ , __,_field_ , _transformations NOTHING_) 
    
Bases: [`RedactMixin`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.utils.RedactMixin "openlineage.client.utils.RedactMixin")
Represents a single dependency on some field (column). 

Parameters: 
    
  * **namespace** (str)
  * **name** (str)
  * **field** (str)
  * **transformations** (list[Transformation] | None)



namespace 
    
The input dataset namespace 


    
The input dataset name 

field 
    
The input field 

transformations _`list`[[`Transformation`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.column_lineage_dataset.Transformation "openlineage.client.generated.column_lineage_dataset.Transformation")] | `None`_ 


with_additional_properties(_kwargs_) 
    
Add additional properties to updated class instance. 

Parameters: 
    
**kwargs** () 

Return type: 
     

_class _openlineage.client.generated.column_lineage_dataset.Transformation(__,_subtype_ , _description_ , _masking_) 
    
Bases: [`RedactMixin`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.utils.RedactMixin "openlineage.client.utils.RedactMixin") 

Parameters: 
    
  * **type** ()
  * **subtype** (`Optional`[`str`])
  * **description** (`Optional`[`str`])
  * **masking** (`Optional`[`bool`])




    
DIRECT, INDIRECT 

Type: 
    
The type of the transformation. Allowed values are 

subtype _`str` | `None`_ 
    
The subtype of the transformation 

description _`str` | `None`_ 
    
a string representation of the transformation applied 

masking _`bool` | `None`_ 
    
is transformation masking the data or not 

with_additional_properties(_kwargs_) 
    
Add additional properties to updated class instance. 

Parameters: 
    
**kwargs** () 

Return type: 
    
## openlineage.client.generated.data_quality_assertions_dataset module 

_class _openlineage.client.generated.data_quality_assertions_dataset.Assertion(_assertion_ , _success_ , _column_ , _severity_ , __,_description_ , _expected_ , _actual_ , _content_ , _contentType_ , _params NOTHING_) 
    
Bases: [`RedactMixin`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.utils.RedactMixin "openlineage.client.utils.RedactMixin") 

Parameters: 
    
  * **assertion** ()
  * **success** ()
  * **column** (`Optional`[`str`])
  * **severity** (`Optional`[`str`])
  * **name** (`Optional`[`str`])
  * **description** (`Optional`[`str`])
  * **expected** (`Optional`[`str`])
  * **actual** (`Optional`[`str`])
  * **content** (`Optional`[`str`])
  * **contentType** (`Optional`[`str`])
  * **params** (`dict`[`str`, `Any`] | `None`)



assertion 
    
Classification of the test, e.g. ‘not_null’, ‘unique’, ‘row_count’, ‘freshness’, ‘custom_sql’.
Example: not_null 

success _`bool`_ 
    
‘true’ (no issues found), ‘false’ (issues found). Independent of severity - a test can fail without blocking the pipeline when severity is ‘warn’. 

Type: 
    
Whether the test found issues 

column _`str` | `None`_ 
    
Column that test refers to. It should match the name provided in SchemaDatasetFacet. If column field is empty, then test refers to whole dataset.
Example: id 

severity _`str` | `None`_ 
    
The configured severity level of the assertion. Common values are ‘error’ (test failure blocks pipeline) or ‘warn’ (test failure produces warning only).
Example: error 

_`str` | `None`_ 
    
Name identifying the test.
Example: assert_no_orphans 

description _`str` | `None`_ 
    
Human-readable description of what the assertion checks.
Example: Ensures all order IDs are unique across the table. 

expected _`str` | `None`_ 
    
The expected value or threshold for the assertion, serialized as a string.
Example: 1000 

actual _`str` | `None`_ 
    
The actual value observed during the assertion, serialized as a string.
Example: 999 

content _`str` | `None`_ 
    
The assertion body, e.g. a SQL query or expression.
Example: SELECT COUNT(*) FROM orders WHERE amount < 0 

contentType _`str` | `None`_ 
    
The format of the content field, allowing consumers to interpret or filter assertion content. Common values include ‘sql’, ‘json’, ‘expression’.
Example: sql 

params _`dict`[`str`, `Any`] | `None`_ 
    
Arbitrary key-value pairs for assertion-specific inputs. 

_class _openlineage.client.generated.data_quality_assertions_dataset.DataQualityAssertionsDatasetFacet(_assertions_ , , _producer_) 
    
Bases: [`InputDatasetFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.InputDatasetFacet "openlineage.client.generated.base.InputDatasetFacet")
list of tests performed on dataset or dataset columns, and their results 

Parameters: 
    
  * **assertions** ()
  * **producer** ()



assertions _`list`[[`Assertion`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.data_quality_assertions_dataset.Assertion "openlineage.client.generated.data_quality_assertions_dataset.Assertion")]_ 

## openlineage.client.generated.data_quality_metrics_input_dataset module 

_class _openlineage.client.generated.data_quality_metrics_input_dataset.ColumnMetrics(_nullCount_ , _distinctCount_ , __,_count_ , __,__,_quantiles NOTHING_) 
    
Bases: [`RedactMixin`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.utils.RedactMixin "openlineage.client.utils.RedactMixin") 

Parameters: 
    
  * **nullCount** (`Optional`[`int`])
  * **distinctCount** (`Optional`[`int`])
  * **sum** (`Optional`[`float`])
  * **count** (`Optional`[`float`])
  * **min** (`Optional`[`float`])
  * **max** (`Optional`[`float`])
  * **quantiles** (`dict`[`str`, `float`] | `None`)



nullCount _ int | None_ 
    
The number of null values in this column for the rows evaluated 

distinctCount _ int | None_ 
    
The number of distinct values in this column for the rows evaluated 

_ float | None_ 
    
The total sum of values in this column for the rows evaluated 

count _ float | None_ 
    
The number of values in this column 

_ float | None_ 


_ float | None_ 


quantiles _ dict[str, float] | None_ 
    
0.1 0.25 0.5 0.75 1 

Type: 
    
The property key is the quantile. Examples 

_class _openlineage.client.generated.data_quality_metrics_input_dataset.DataQualityMetricsInputDatasetFacet(_columnMetrics_ , _rowCount_ , _bytes_ , _fileCount_ , _lastUpdated_ , , _producer_) 
    
Bases: [`InputDatasetFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.InputDatasetFacet "openlineage.client.generated.base.InputDatasetFacet") 

Parameters: 
    
  * **columnMetrics** (`dict`[`str`, [`ColumnMetrics`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.data_quality_metrics_input_dataset.ColumnMetrics "openlineage.client.generated.data_quality_metrics_input_dataset.ColumnMetrics")])
  * **rowCount** (`Optional`[`int`])
  * **bytes** (`Optional`[`int`])
  * **fileCount** (`Optional`[`int`])
  * **lastUpdated** (`Optional`[`str`])
  * **producer** ()



columnMetrics _ dict[str, ColumnMetrics]_ 
    
The property key is the column name 

rowCount _ int | None_ 
    
The number of rows evaluated 

bytes _ int | None_ 
    
The size in bytes 

fileCount _ int | None_ 
    
The number of files evaluated 

lastUpdated _ str | None_ 
    
The last time the dataset was changed 

lastupdated_check(_attribute_ , _value_) 
     

Parameters: 
    
  * **attribute** ()
  * **value** ()



Return type: 

## openlineage.client.generated.dataset_version_dataset module 

_class _openlineage.client.generated.dataset_version_dataset.DatasetVersionDatasetFacet(_datasetVersion_ , , _producer_ , _deleted_) 
    
Bases: [`DatasetFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.DatasetFacet "openlineage.client.generated.base.DatasetFacet") 

Parameters: 
    
  * **datasetVersion** ()
  * **producer** ()
  * **deleted** (`Optional`[`bool`])



datasetVersion _ str_ 
    
The version of the dataset.
## openlineage.client.generated.datasource_dataset module 

_class _openlineage.client.generated.datasource_dataset.DatasourceDatasetFacet(__,__, ,_producer_ , _deleted_) 
    
Bases: [`DatasetFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.DatasetFacet "openlineage.client.generated.base.DatasetFacet") 

Parameters: 
    
  * **name** (`Optional`[`str`])
  * **uri** (`Optional`[`str`])
  * **producer** ()
  * **deleted** (`Optional`[`bool`])



_`str` | `None`_ 


_`str` | `None`_ 


uri_check(_attribute_ , _value_) 
     

Parameters: 
    
  * **attribute** ()
  * **value** ()



Return type: 

## openlineage.client.generated.documentation_dataset module 

_class _openlineage.client.generated.documentation_dataset.DocumentationDatasetFacet(_description_ , _contentType_ , , _producer_ , _deleted_) 
    
Bases: [`DatasetFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.DatasetFacet "openlineage.client.generated.base.DatasetFacet") 

Parameters: 
    
  * **description** ()
  * **contentType** (`Optional`[`str`])
  * **producer** ()
  * **deleted** (`Optional`[`bool`])



description _ str_ 
    
The description of the dataset.
Example: canonical representation of entity Foo 

contentType _ str | None_ 
    
MIME type of the description field content.
Example: application/json, text/markdown
## openlineage.client.generated.documentation_job module 

_class _openlineage.client.generated.documentation_job.DocumentationJobFacet(_description_ , _contentType_ , , _producer_ , _deleted_) 
    
Bases: [`JobFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.JobFacet "openlineage.client.generated.base.JobFacet") 

Parameters: 
    
  * **description** ()
  * **contentType** (`Optional`[`str`])
  * **producer** ()
  * **deleted** (`Optional`[`bool`])



description _ str_ 
    
The description of the job. 

contentType _ str | None_ 
    
MIME type of the description field content.
Example: application/json, text/markdown
## openlineage.client.generated.error_message_run module 

_class _openlineage.client.generated.error_message_run.ErrorMessageRunFacet(_message_ , _programmingLanguage_ , _stackTrace_ , , _producer_) 
    
Bases: [`RunFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.RunFacet "openlineage.client.generated.base.RunFacet") 

Parameters: 
    
  * **message** ()
  * **programmingLanguage** ()
  * **stackTrace** (`Optional`[`str`])
  * **producer** ()



message 
    
A human-readable string representing error message generated by observed system
Example: org.apache.spark.sql.AnalysisException: Table or view not found: wrong_table_name; line 1 pos 14 

programmingLanguage 
    
Programming language the observed system uses.
Example: JAVA 

stackTrace _`str` | `None`_ 
    
A language-specific stack trace generated by observed system
Example: Exception in thread “main” java.lang.RuntimeException: A test exception at io.openlineage.SomeClass.method(SomeClass.java:13) at io.openlineage.SomeClass.anotherMethod(SomeClass.java:9)
## openlineage.client.generated.external_query_run module 

_class _openlineage.client.generated.external_query_run.ExternalQueryRunFacet(_externalQueryId_ , _source_ , , _producer_) 
    
Bases: [`RunFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.RunFacet "openlineage.client.generated.base.RunFacet") 

Parameters: 
    
  * **externalQueryId** ()
  * **source** ()
  * **producer** ()



externalQueryId _ str_ 
    
Identifier for the external system
Example: my-project-1234:US.bquijob_123x456_123y123z123c 

source _ str_ 
    
source of the external query
Example: bigquery
## openlineage.client.generated.extraction_error_run module 

_class _openlineage.client.generated.extraction_error_run.Error(_errorMessage_ , _stackTrace_ , __,_taskNumber_) 
    
Bases: [`RedactMixin`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.utils.RedactMixin "openlineage.client.utils.RedactMixin") 

Parameters: 
    
  * **errorMessage** ()
  * **stackTrace** (`Optional`[`str`])
  * **task** (`Optional`[`str`])
  * **taskNumber** (`Optional`[`int`])



errorMessage _ str_ 
    
Text representation of extraction error message. 

stackTrace _ str | None_ 
    
Stack trace of extraction error message 

_ str | None_ 
    
Text representation of task that failed. This can be, for example, SQL statement that parser could not interpret. 

taskNumber _ int | None_ 
    
Order of task (counted from 0). 

_class _openlineage.client.generated.extraction_error_run.ExtractionErrorRunFacet(_totalTasks_ , _failedTasks_ , _errors_ , , _producer_) 
    
Bases: [`RunFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.RunFacet "openlineage.client.generated.base.RunFacet") 

Parameters: 
    
  * **totalTasks** ()
  * **failedTasks** ()
  * **errors** ()
  * **producer** ()



totalTasks _ int_ 
    
The number of distinguishable tasks in a run that were processed by OpenLineage, whether successfully or not. Those could be, for example, distinct SQL statements. 

failedTasks _ int_ 
    
The number of distinguishable tasks in a run that were processed not successfully by OpenLineage. Those could be, for example, distinct SQL statements. 

errors _ list[Error]_ 

## openlineage.client.generated.job_type_job module 

_class _openlineage.client.generated.job_type_job.JobTypeJobFacet(_processingType_ , _integration_ , _jobType_ , , _producer_ , _deleted_) 
    
Bases: [`JobFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.JobFacet "openlineage.client.generated.base.JobFacet") 

Parameters: 
    
  * **processingType** ()
  * **integration** ()
  * **jobType** (`Optional`[`str`])
  * **producer** ()
  * **deleted** (`Optional`[`bool`])



processingType _ str_ 
    
BATCH or STREAMING
Example: BATCH 

Type: 
    
Job processing type like 

integration _ str_ 
    
for example SPARK|DBT|AIRFLOW|FLINK
Example: SPARK 

Type: 
    
OpenLineage integration type of this job 

jobType _ str | None_ 
    
QUERY|COMMAND|DAG|TASK|JOB|MODEL. This is an integration-specific field.
Example: QUERY 

Type: 
    
Run type, for example
## openlineage.client.generated.lifecycle_state_change_dataset module 

_class _openlineage.client.generated.lifecycle_state_change_dataset.LifecycleStateChange(_value_) 
    
Bases: `Enum`
The lifecycle state change. 

ALTER _ 'ALTER'_ 


CREATE _ 'CREATE'_ 


_ 'DROP'_ 


OVERWRITE _ 'OVERWRITE'_ 


RENAME _ 'RENAME'_ 


TRUNCATE _ 'TRUNCATE'_ 


_class _openlineage.client.generated.lifecycle_state_change_dataset.LifecycleStateChangeDatasetFacet(_lifecycleStateChange_ , _previousIdentifier_ , , _producer_ , _deleted_) 
    
Bases: [`DatasetFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.DatasetFacet "openlineage.client.generated.base.DatasetFacet") 

Parameters: 
    
  * **lifecycleStateChange** (LifecycleStateChange)
  * **previousIdentifier** (PreviousIdentifier | None)
  * **producer** (str)
  * **deleted** (bool | None)



lifecycleStateChange _ LifecycleStateChange_ 
    
The lifecycle state change. 

previousIdentifier _ PreviousIdentifier | None_ 
    
Previous name of the dataset in case of renaming it. 

_class _openlineage.client.generated.lifecycle_state_change_dataset.PreviousIdentifier(__,_namespace_) 
    
Bases: [`RedactMixin`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.utils.RedactMixin "openlineage.client.utils.RedactMixin")
Previous name of the dataset in case of renaming it. 

Parameters: 
    
  * **name** ()
  * **namespace** ()



_ str_ 


namespace _ str_ 

## openlineage.client.generated.nominal_time_run module 

_class _openlineage.client.generated.nominal_time_run.NominalTimeRunFacet(_nominalStartTime_ , _nominalEndTime_ , , _producer_) 
    
Bases: [`RunFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.RunFacet "openlineage.client.generated.base.RunFacet") 

Parameters: 
    
  * **nominalStartTime** ()
  * **nominalEndTime** (`Optional`[`str`])
  * **producer** ()



nominalStartTime 
    
//en.wikipedia.org/wiki/ISO_8601) timestamp representing the nominal start time (included) of the run. AKA the schedule time
Example: 2020-12-17T03:00:00.000Z 

Type: 
    
An [ISO-8601](https 

nominalEndTime _`str` | `None`_ 
    
//en.wikipedia.org/wiki/ISO_8601) timestamp representing the nominal end time (excluded) of the run. (Should be the nominal start time of the next run)
Example: 2020-12-17T04:00:00.000Z 

Type: 
    
An [ISO-8601](https 

nominalstarttime_check(_attribute_ , _value_) 
     

Parameters: 
    
  * **attribute** ()
  * **value** ()



Return type: 


nominalendtime_check(_attribute_ , _value_) 
     

Parameters: 
    
  * **attribute** ()
  * **value** ()



Return type: 

## openlineage.client.generated.output_statistics_output_dataset module 

_class _openlineage.client.generated.output_statistics_output_dataset.OutputStatisticsOutputDatasetFacet(_rowCount_ , __,_fileCount_ , , _producer_) 
    
Bases: [`OutputDatasetFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.OutputDatasetFacet "openlineage.client.generated.base.OutputDatasetFacet") 

Parameters: 
    
  * **rowCount** (`Optional`[`int`])
  * **size** (`Optional`[`int`])
  * **fileCount** (`Optional`[`int`])
  * **producer** ()



rowCount _`int` | `None`_ 
    
The number of rows written to the dataset 

_`int` | `None`_ 
    
The size in bytes written to the dataset 

fileCount _`int` | `None`_ 
    
The number of files written to the dataset
## openlineage.client.generated.ownership_dataset module 

_class _openlineage.client.generated.ownership_dataset.Owner(__,__) 
    
Bases: [`RedactMixin`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.utils.RedactMixin "openlineage.client.utils.RedactMixin") 

Parameters: 
    
  * **name** ()
  * **type** (`Optional`[`str`])



_ str_ 
    
the identifier of the owner of the Dataset. It is recommended to define this as a URN. For example application:foo, user:jdoe, team:data
Example: application:app_name 

_ str | None_ 
    
The type of ownership (optional)
Example: MAINTAINER 

_class _openlineage.client.generated.ownership_dataset.OwnershipDatasetFacet(_owners NOTHING_, , _producer_ , _deleted_) 
    
Bases: [`DatasetFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.DatasetFacet "openlineage.client.generated.base.DatasetFacet") 

Parameters: 
    
  * **owners** (`list`[[`Owner`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.ownership_dataset.Owner "openlineage.client.generated.ownership_dataset.Owner")] | `None`)
  * **producer** ()
  * **deleted** (`Optional`[`bool`])



owners _ list[Owner] | None_ 
    
The owners of the dataset.
## openlineage.client.generated.ownership_job module 

_class _openlineage.client.generated.ownership_job.Owner(__,__) 
    
Bases: [`RedactMixin`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.utils.RedactMixin "openlineage.client.utils.RedactMixin") 

Parameters: 
    
  * **name** ()
  * **type** (`Optional`[`str`])



_ str_ 
    
the identifier of the owner of the Job. It is recommended to define this as a URN. For example application:foo, user:jdoe, team:data
Example: application:app_name 

_ str | None_ 
    
The type of ownership (optional)
Example: MAINTAINER 

_class _openlineage.client.generated.ownership_job.OwnershipJobFacet(_owners NOTHING_, , _producer_ , _deleted_) 
    
Bases: [`JobFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.JobFacet "openlineage.client.generated.base.JobFacet") 

Parameters: 
    
  * **owners** (`list`[[`Owner`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.ownership_job.Owner "openlineage.client.generated.ownership_job.Owner")] | `None`)
  * **producer** ()
  * **deleted** (`Optional`[`bool`])



owners _ list[Owner] | None_ 
    
The owners of the job.
## openlineage.client.generated.parent_run module 

_class _openlineage.client.generated.parent_run.(_namespace_ , __) 
    
Bases: [`RedactMixin`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.utils.RedactMixin "openlineage.client.utils.RedactMixin") 

Parameters: 
    
  * **namespace** ()
  * **name** ()



namespace 
    
The namespace containing that job
Example: my-scheduler-namespace 


    
The unique name for that job within that namespace
Example: myjob.mytask 

_class _openlineage.client.generated.parent_run.ParentRunFacet(, , __, ,_producer_) 
    
Bases: [`RunFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.RunFacet "openlineage.client.generated.base.RunFacet")
the id of the parent run and job, iff this run was spawn from an other run (for example, the Dag run scheduling its tasks) 

Parameters: 
    
  * **run** (Run)
  * **job** (Job)
  * **root** (Root | None)
  * **producer** (str)












_classmethod _create(_runId_ , _namespace_ , __) 
     

Parameters: 
    
  * **runId** ()
  * **namespace** ()
  * **name** ()



Return type: 
     

_class _openlineage.client.generated.parent_run.(, ) 
    
Bases: [`RedactMixin`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.utils.RedactMixin "openlineage.client.utils.RedactMixin") 

Parameters: 
    
  * **run** (RootRun)
  * **job** (RootJob)









_class _openlineage.client.generated.parent_run.RootJob(_namespace_ , __) 
    
Bases: [`RedactMixin`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.utils.RedactMixin "openlineage.client.utils.RedactMixin") 

Parameters: 
    
  * **namespace** ()
  * **name** ()



namespace 
    
The namespace containing root job
Example: my-scheduler-namespace 


    
The unique name containing root job within that namespace
Example: myjob.mytask 

_class _openlineage.client.generated.parent_run.RootRun(_runId_) 
    
Bases: [`RedactMixin`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.utils.RedactMixin "openlineage.client.utils.RedactMixin") 

Parameters: 
    
**runId** () 

runId 
    
The globally unique ID of the root run associated with the root job. 

runid_check(_attribute_ , _value_) 
     

Parameters: 
    
  * **attribute** ()
  * **value** ()



Return type: 


_class _openlineage.client.generated.parent_run.(_runId_) 
    
Bases: [`RedactMixin`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.utils.RedactMixin "openlineage.client.utils.RedactMixin") 

Parameters: 
    
**runId** () 

runId 
    
The globally unique ID of the run associated with the job. 

runid_check(_attribute_ , _value_) 
     

Parameters: 
    
  * **attribute** ()
  * **value** ()



Return type: 

## openlineage.client.generated.processing_engine_run module 

_class _openlineage.client.generated.processing_engine_run.ProcessingEngineRunFacet(_version_ , __,_openlineageAdapterVersion_ , , _producer_) 
    
Bases: [`RunFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.RunFacet "openlineage.client.generated.base.RunFacet") 

Parameters: 
    
  * **version** ()
  * **name** (`Optional`[`str`])
  * **openlineageAdapterVersion** (`Optional`[`str`])
  * **producer** ()



version _ str_ 
    
Processing engine version. Might be Airflow or Spark version.
Example: 2.5.0 

_ str | None_ 
    
Processing engine name, e.g. Airflow or Spark
Example: Airflow 

openlineageAdapterVersion _ str | None_ 
    
OpenLineage adapter package version. Might be e.g. OpenLineage Airflow integration package version
Example: 0.19.0
## openlineage.client.generated.schema_dataset module 

_class _openlineage.client.generated.schema_dataset.SchemaDatasetFacet(_fields NOTHING_, , _producer_ , _deleted_) 
    
Bases: [`DatasetFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.DatasetFacet "openlineage.client.generated.base.DatasetFacet") 

Parameters: 
    
  * **fields** (list[SchemaDatasetFacetFields] | None)
  * **producer** (str)
  * **deleted** (bool | None)



fields _ list[SchemaDatasetFacetFields] | None_ 
    
The fields of the data source. 

_class _openlineage.client.generated.schema_dataset.SchemaDatasetFacetFields(__,__,_description_ , _ordinal_position_ , _fields NOTHING_) 
    
Bases: [`RedactMixin`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.utils.RedactMixin "openlineage.client.utils.RedactMixin") 

Parameters: 
    
  * **name** (str)
  * **type** (str | None)
  * **description** (str | None)
  * **ordinal_position** (int | None)
  * **fields** (list[SchemaDatasetFacetFields] | None)



_ str_ 
    
The name of the field.
Example: column1 

_ str | None_ 
    
The type of the field.
Example: VARCHAR|INT|… 

description _ str | None_ 
    
The description of the field. 

ordinal_position _ int | None_ 
    
The ordinal position of the field in the schema (1-indexed).
Example: 1 

fields _ list[SchemaDatasetFacetFields] | None_ 
    
Nested struct fields.
## openlineage.client.generated.source_code_job module 

_class _openlineage.client.generated.source_code_job.SourceCodeJobFacet(_language_ , _sourceCode_ , , _producer_ , _deleted_) 
    
Bases: [`JobFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.JobFacet "openlineage.client.generated.base.JobFacet") 

Parameters: 
    
  * **language** ()
  * **sourceCode** ()
  * **producer** ()
  * **deleted** (`Optional`[`bool`])



language 
    
Language in which source code of this job was written. 

sourceCode 
    
Source code of this job.
## openlineage.client.generated.source_code_location_job module 

_class _openlineage.client.generated.source_code_location_job.SourceCodeLocationJobFacet(__, ,_repoUrl_ , __,_version_ , __,_branch_ , _pullRequestNumber_ , , _producer_ , _deleted_) 
    
Bases: [`JobFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.JobFacet "openlineage.client.generated.base.JobFacet") 

Parameters: 
    
  * **type** ()
  * **url** ()
  * **repoUrl** (`Optional`[`str`])
  * **path** (`Optional`[`str`])
  * **version** (`Optional`[`str`])
  * **tag** (`Optional`[`str`])
  * **branch** (`Optional`[`str`])
  * **pullRequestNumber** (`Optional`[`str`])
  * **producer** ()
  * **deleted** (`Optional`[`bool`])




    
the source control system
Example: git|svn 


    
the full http URL to locate the file
Example: [MarquezProject/marquez-airflow](https://github.com/MarquezProject/marquez-airflow)- quickstart/blob/693e35482bc2e526ced2b5f9f76ef83dec6ec691/dags/dummy_example.py 

repoUrl _`str` | `None`_ 
    
the URL to the repository
Example: git@github.com:{org}/{repo}.git or [github](https://github.com)/{org}/{repo}.git|svn://<your_ip>/<repository_name> 

_`str` | `None`_ 
    
the path in the repo containing the source files
Example: path/to/my/dags 

version _`str` | `None`_ 
    
the current version deployed (not a branch name, the actual unique version)
Example: git: the git sha | Svn: the revision number 

_`str` | `None`_ 
    
optional tag name 

branch _`str` | `None`_ 
    
optional branch name 

pullRequestNumber _`str` | `None`_ 
    
optional pull request or merge request number associated with a CI run, populated from CI platform environment variables (e.g. GITHUB_REF, CI_MERGE_REQUEST_IID)
Example: 42 

url_check(_attribute_ , _value_) 
     

Parameters: 
    
  * **attribute** ()
  * **value** ()



Return type: 

## openlineage.client.generated.sql_job module 

_class _openlineage.client.generated.sql_job.SQLJobFacet(_query_ , _dialect_ , , _producer_ , _deleted_) 
    
Bases: [`JobFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.JobFacet "openlineage.client.generated.base.JobFacet") 

Parameters: 
    
  * **query** ()
  * **dialect** (`Optional`[`str`])
  * **producer** ()
  * **deleted** (`Optional`[`bool`])



query _ str_ 
    
SELECT * FROM foo 

Type: 
    
Example 

dialect _ str | None_ 
    
snowflake 

Type: 
    
Example
## openlineage.client.generated.storage_dataset module 

_class _openlineage.client.generated.storage_dataset.StorageDatasetFacet(_storageLayer_ , _fileFormat_ , , _producer_ , _deleted_) 
    
Bases: [`DatasetFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.DatasetFacet "openlineage.client.generated.base.DatasetFacet") 

Parameters: 
    
  * **storageLayer** ()
  * **fileFormat** (`Optional`[`str`])
  * **producer** ()
  * **deleted** (`Optional`[`bool`])



storageLayer _ str_ 
    
iceberg, delta. 

Type: 
    
Storage layer provider with allowed values 

fileFormat _ str | None_ 
    
parquet, orc, avro, json, csv, text, xml. 

Type: 
    
File format with allowed values
## openlineage.client.generated.symlinks_dataset module 

_class _openlineage.client.generated.symlinks_dataset.Identifier(_namespace_ , __,__) 
    
Bases: [`RedactMixin`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.utils.RedactMixin "openlineage.client.utils.RedactMixin") 

Parameters: 
    
  * **namespace** ()
  * **name** ()
  * **type** ()



namespace _ str_ 
    
The dataset namespace 

_ str_ 
    
The dataset name 

_ str_ 
    
Identifier type
Example: table 

_class _openlineage.client.generated.symlinks_dataset.SymlinksDatasetFacet(_identifiers NOTHING_, , _producer_ , _deleted_) 
    
Bases: [`DatasetFacet`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.DatasetFacet "openlineage.client.generated.base.DatasetFacet") 

Parameters: 
    
  * **identifiers** (`list`[[`Identifier`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.symlinks_dataset.Identifier "openlineage.client.generated.symlinks_dataset.Identifier")] | `None`)
  * **producer** ()
  * **deleted** (`Optional`[`bool`])



identifiers _ list[Identifier] | None_ 

## openlineage.client.transport.composite module 

_class _openlineage.client.transport.composite.CompositeConfig(_transports_ , _continue_on_failure_ , _continue_on_success_ , _sort_transports False_) 
    
Bases: [`Config`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.transport.transport.Config "openlineage.client.transport.transport.Config")
CompositeConfig is a configuration class for CompositeTransport. 

transports 
    
A list or dict of dictionaries, where each dictionary represents the configuration for a child transport. Each dictionary should contain the necessary parameters to initialize a specific transport instance. If dict of dictionaries is passed, keys of the dict will be treated as transport names. 

continue_on_failure 
    
If set to True, the CompositeTransport will attempt to emit the event using all configured transports, regardless of whether any previous transport in the list failed to emit the event. If none of the transports successfully emit the event, an error will still be raised at the end to indicate that no events were emitted. If set to False, an error in transport will halt the emission process for subsequent transports. 

continue_on_success 
    
If True, the CompositeTransport will continue emitting events to all transports even after a successful delivery. If False, it will stop emitting to other transports as soon as the first successful delivery occurs. 

sort_transports 
    
If True, transports will be sorted before emission by priority field. If False, order of transports will not be changed. 

Continue behavior summary:
    
  * 

continue_on_failure=True, continue_on_success=True:
    
Always emits to all transports, regardless of successes or failures. Events are delivered everywhere, with no early termination.
  * 

continue_on_failure=True, continue_on_success=False:
    
Stops on the first successful emission. Failures are ignored and transports continue to be tried until a success is found.
  * 

continue_on_failure=False, continue_on_success=False:
    
Stops on the first success or the first failure, whichever occurs first.
  * 

continue_on_failure=False, continue_on_success=True:
    
Stops immediately on the first failure (fail-fast). However, if no failures occur, events will be emitted to all transports, effectively behaving like a “fail-fast all” strategy. This behavior may not align with typical expectations when an early stop after a success is desired; review carefully to ensure it matches the intended delivery semantics.



Parameters: 
    
  * **transports** (`list`[`dict`[`str`, `Any`]] | `dict`[`str`, `dict`[`str`, `Any`]])
  * **continue_on_failure** ()
  * **continue_on_success** ()
  * **sort_transports** ()



transports _`list`[`dict`[`str`, `Any`]] | `dict`[`str`, `dict`[`str`, `Any`]]_ 


continue_on_failure _`bool`_ 


continue_on_success _`bool`_ 


sort_transports _`bool`_ 


_classmethod _from_dict(_params_) 
    
Create a CompositeConfig object from a dictionary. 

Parameters: 
    
**params** (`dict`[`str`, `Any`]) 

Return type: 
     

_class _openlineage.client.transport.composite.CompositeTransport(_config_) 
    
Bases: [`Transport`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.transport.transport.Transport "openlineage.client.transport.transport.Transport")
CompositeTransport is a transport class that emits events using multiple transports. 

Parameters: 
    
**config** () 

_`str` | `None`__ 'composite'_ 


config_class 
    
alias of [`CompositeConfig`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.transport.composite.CompositeConfig "openlineage.client.transport.composite.CompositeConfig") 

_property _transports _ list[Transport](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.transport.transport.Transport "openlineage.client.transport.transport.Transport")_ 
    
Create and return a list of transports based on the config. 

(_event_) 
    
Emit an event using all transports in the config. 

Parameters: 
    
**event** (Event) 

Return type: 
    
None 

close(_timeout_) 
    
Closes the transport, waiting for all events to complete until the timeout is reached. 

Params:
    
timeout: Timeout in seconds. Negative value will block until last event is processed, while 0 means it completes immediately. 

Returns: 
     

True if all events were processed before transport was closed,
    
False if some events were not processed. 

Return type: 
    
bool 

Parameters: 
    
**timeout** ()
## openlineage.client.transport.console module 

_class _openlineage.client.transport.console.ConsoleConfig 
    
Bases: [`Config`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.transport.transport.Config "openlineage.client.transport.transport.Config") 

_class _openlineage.client.transport.console.ConsoleTransport(_config_) 
    
Bases: [`Transport`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.transport.transport.Transport "openlineage.client.transport.transport.Transport") 

Parameters: 
    
**config** () 

_`str` | `None`__ 'console'_ 


config_class 
    
alias of [`ConsoleConfig`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.transport.console.ConsoleConfig "openlineage.client.transport.console.ConsoleConfig") 

(_event_) 
     

Parameters: 
    
**event** ([`RunEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.run.RunEvent "openlineage.client.run.RunEvent") | [`DatasetEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.run.DatasetEvent "openlineage.client.run.DatasetEvent") | [`JobEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.run.JobEvent "openlineage.client.run.JobEvent") | [`RunEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.RunEvent "openlineage.client.generated.base.RunEvent") | [`DatasetEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.DatasetEvent "openlineage.client.generated.base.DatasetEvent") | [`JobEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.JobEvent "openlineage.client.generated.base.JobEvent")) 

Return type: 

## openlineage.client.transport.factory module 

_class _openlineage.client.transport.factory.DefaultTransportFactory 
    
Bases: [`TransportFactory`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.transport.transport.TransportFactory "openlineage.client.transport.transport.TransportFactory") 

register_transport(_of_type_ , _clazz_) 
     

Parameters: 
    
  * **of_type** ()
  * **clazz** (`type`[[`Transport`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.transport.transport.Transport "openlineage.client.transport.transport.Transport")] | `str`)



Return type: 


create(_config_) 
    
Initializes and returns a transport mechanism based on the provided configuration.
If ‘OPENLINEAGE_DISABLED’ is set to ‘true’, a NoopTransport instance is returned, effectively disabling transport. If a configuration dictionary is provided, transport specified by the config is initialized. If no configuration is provided, the function defaults to a console-based transport, logging a warning and printing events to the console. 

Parameters: 
    
**config** (`Optional`[`dict`[`str`, `str`]]) 

Return type: 
    
## openlineage.client.transport.file module 

_class _openlineage.client.transport.file.FileConfig(_log_file_path_ , _append False_, _storage_options_ , _filesystem_ , _fs_kwargs_ , _debug_mode False_) 
    
Bases: [`Config`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.transport.transport.Config "openlineage.client.transport.transport.Config")
Configuration for file-based OpenLineage event transport.
Supports local files and remote filesystems via fsspec (optional dependency). The transport auto-detects protocols from URL schemes (s3://, gs://, etc.). 

log_file_path 
    
Path to the log file. Can be local or URL with protocol. 

Type: 
    
str 

append 
    
Whether to append to existing file (default: False, creates timestamped files). Note: Many cloud/object stores (e.g. GCS) do not support true append mode via fsspec. In such cases, opening with append may raise an error or be emulated by rewriting the object. 

Type: 
    
bool 

storage_options 
    
Options passed to the filesystem (e.g., credentials). 

Type: 
    
dict 

filesystem 
    
Optional filesystem provider specification: - Class path (e.g., “s3fs.S3FileSystem”) - Factory function path (e.g., “mymodule.get_filesystem”) - Instance attribute path (e.g., “mymodule.fs_instance”) 

Type: 
    
str 

fs_kwargs 
    
Keyword arguments for constructing/calling the filesystem provider. 

Type: 
    
dict 

debug_mode 
    
Enable debug mode (default: False). Only effective when append=False. When enabled: - Filenames include short timestamp (2-digit year), job/dataset name sanitized, and event type.
> For RunEvent: uses job name and event type (e.g., START, COMPLETE). For JobEvent: uses job name with “unknown_event_type” as event type. For DatasetEvent: uses dataset name with “unknown_event_type” as event type. Example: “log_file_path/ol-250115T143052.123456-my_job.name-START.json”
  * JSON output is prettified with indentation for easier reading



Type: 
    
bool 

Parameters: 
    
  * **log_file_path** ()
  * **append** ()
  * **storage_options** (`Optional`[`dict`[`str`, `Any`]])
  * **filesystem** (`Optional`[`str`])
  * **fs_kwargs** (`Optional`[`dict`[`str`, `Any`]])
  * **debug_mode** ()



log_file_path 


append _`bool`__ False_ 


storage_options _`dict`[`str`, `Any`] | `None`__ None_ 


filesystem _`str` | `None`__ None_ 


fs_kwargs _`dict`[`str`, `Any`] | `None`__ None_ 


debug_mode _`bool`__ False_ 


_classmethod _from_dict(_params_) 
     

Parameters: 
    
**params** (`dict`[`str`, `Any`]) 

Return type: 
     

_class _openlineage.client.transport.file.FileHandler 
    
Bases: `ABC`
Abstract base class for file handling implementations. 

_abstract _open_file(_file_path_ , __) 
    
Open a file-like handle. 

Parameters: 
    
  * **file_path** ()
  * **mode** ()



Return type: 


_class _openlineage.client.transport.file.LocalFileHandler 
    
Bases: [`FileHandler`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.transport.file.FileHandler "openlineage.client.transport.file.FileHandler")
Handler for local filesystem operations. 

open_file(_file_path_ , __) 
    
Open a file using built-in open for local filesystem. 

Parameters: 
    
  * **file_path** ()
  * **mode** ()



Return type: 


_class _openlineage.client.transport.file.FsspecFileHandler(_config_) 
    
Bases: [`FileHandler`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.transport.file.FileHandler "openlineage.client.transport.file.FileHandler")
Handler for fsspec-based filesystem operations. 

Parameters: 
    
**config** () 

open_file(_file_path_ , __) 
    
Open a file-like handle using fsspec.
  * If an explicit filesystem instance is configured, use its .open.
  * Else use fsspec.open with auto-detection from URL.



Parameters: 
    
  * **file_path** ()
  * **mode** ()



Return type: 


_class _openlineage.client.transport.file.FileTransport(_config_) 
    
Bases: [`Transport`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.transport.transport.Transport "openlineage.client.transport.transport.Transport")
File-based transport for OpenLineage events.
Writes events to local or remote files. Supports automatic protocol detection for remote filesystems via fsspec (s3://, gs://, az://, etc.).
Three filesystem configuration approaches: 1. Auto-detection: Specify only log_file_path with protocol URL 2. Explicit filesystem: Use ‘filesystem’ parameter with class/factory/instance 3. Storage options: Use ‘storage_options’ for credentials and configuration 

Parameters: 
    
**config** () 

_`str` | `None`__ 'file'_ 


config_class 
    
alias of [`FileConfig`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.transport.file.FileConfig "openlineage.client.transport.file.FileConfig") 

(_event_) 
     

Parameters: 
    
**event** ([`RunEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.run.RunEvent "openlineage.client.run.RunEvent") | [`DatasetEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.run.DatasetEvent "openlineage.client.run.DatasetEvent") | [`JobEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.run.JobEvent "openlineage.client.run.JobEvent") | [`RunEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.RunEvent "openlineage.client.generated.base.RunEvent") | [`DatasetEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.DatasetEvent "openlineage.client.generated.base.DatasetEvent") | [`JobEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.JobEvent "openlineage.client.generated.base.JobEvent")) 

Return type: 

## openlineage.client.transport.http module 

_class _openlineage.client.transport.http.TokenProvider(_config_) 
    
Bases: `object` 

Parameters: 
    
**config** (`dict`[`str`, `str`]) 

get_bearer() 
     

Return type: 
    
`str` | `None` 

_class _openlineage.client.transport.http.HttpCompression(_value_) 
    
Bases: `Enum`
An enumeration. 

_ 'gzip'_ 


_class _openlineage.client.transport.http.ApiKeyTokenProvider(_config_) 
    
Bases: [`TokenProvider`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.transport.http.TokenProvider "openlineage.client.transport.http.TokenProvider") 

Parameters: 
    
**config** (`dict`[`str`, `str`]) 

get_bearer() 
     

Return type: 
    
`str` | `None` 

_class _openlineage.client.transport.http.JwtTokenProvider(_config_) 
    
Bases: [`TokenProvider`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.transport.http.TokenProvider "openlineage.client.transport.http.TokenProvider")
TokenProvider that exchanges an API key for a JWT token via a POST endpoint.
Sends the API key and OAuth parameters as URL-encoded form data.
The provider automatically tries multiple common JSON field names for the token: the configured token_fields (default [“token”, “access_token”]). This ensures compatibility with various OAuth providers.
The provider caches tokens and automatically refreshes them before expiry. By default, tokens are refreshed 120 seconds before they expire. This can be configured using the tokenRefreshBuffer parameter. 

Configuration example:
     

{
    
“type”: “jwt”, “apiKey”: “your-api-key”, “tokenEndpoint”: “<https://auth.example.com/token>”, “tokenFields”: [“token”, “access_token”], # optional “expiresInField”: “expires_in”, # optional “grantType”: “[urn:ietf:params:oauth:grant-type:jwt-bearer](urn:ietf:params:oauth:grant-type:jwt-bearer)”, # optional “responseType”: “token”, # optional “tokenRefreshBuffer”: 120 # optional, defaults to 120 seconds
} 

For IBM Cloud IAM, use these settings:
     

{
    
“type”: “jwt”, “apiKey”: “your-ibm-api-key”, “tokenEndpoint”: “<https://iam.cloud.ibm.com/identity/token>”, “grantType”: “[urn:ibm:params:oauth:grant-type:apikey](urn:ibm:params:oauth:grant-type:apikey)”, “responseType”: “cloud_iam”
} 

Parameters: 
    
**config** (`dict`[`str`, `str`]) 

TOKEN_REFRESH_BUFFER_SECONDS _ 120_ 


get_bearer() 
    
Get the bearer token, fetching a new one if needed. 

Return type: 
    
`str` | `None` 

openlineage.client.transport.http.create_token_provider(__) 
     

Parameters: 
    
**auth** (`dict`[`str`, `str`]) 

Return type: 
     

openlineage.client.transport.http.get_session() 
     

Return type: 
    
`Session` 

_class _openlineage.client.transport.http.HttpConfig(, _endpoint 'api/v1/lineage'_, _timeout_ , _verify_ , _NOTHING_ , _compression_ , _session_ , _adapter_ , _custom_headers NOTHING_, _retry{'allowed_methods': ['HEAD', 'POST'], 'backoff_factor': 0.3, 'connect': 5, 'read': 5, 'status_forcelist': [500, 502, 503, 504], 'total': 5}_) 
    
Bases: [`Config`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.transport.transport.Config "openlineage.client.transport.transport.Config") 

Parameters: 
    
  * **url** ()
  * **endpoint** ()
  * **timeout** ()
  * **verify** ()
  * **auth** ()
  * **compression** (`Optional`[[`HttpCompression`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.transport.http.HttpCompression "openlineage.client.transport.http.HttpCompression")])
  * **session** (`Optional`[`Session`])
  * **adapter** (`Optional`[`HTTPAdapter`])
  * **custom_headers** (`dict`[`str`, `str`])
  * **retry** (`dict`[`str`, `Any`])






endpoint 


timeout _`float`_ 


verify _`bool`_ 





compression _[`HttpCompression`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.transport.http.HttpCompression "openlineage.client.transport.http.HttpCompression") | `None`_ 


session _`Session` | `None`_ 


adapter _`HTTPAdapter` | `None`_ 


custom_headers _`dict`[`str`, `str`]_ 


retry _`dict`[`str`, `Any`]_ 


_classmethod _from_dict(_params_) 
     

Parameters: 
    
**params** (`dict`[`str`, `Any`]) 

Return type: 
     

_classmethod _from_options(, _options_ , _session_) 
     

Parameters: 
    
  * **url** ()
  * **options** ()
  * **session** (`Session` | `None`)



Return type: 
     

_class _openlineage.client.transport.http.HttpTransport(_config_) 
    
Bases: [`Transport`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.transport.transport.Transport "openlineage.client.transport.transport.Transport") 

Parameters: 
    
**config** () 

_`str` | `None`__ 'http'_ 


config_class 
    
alias of [`HttpConfig`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.transport.http.HttpConfig "openlineage.client.transport.http.HttpConfig") 

(_event_) 
     

Parameters: 
    
**event** ([`RunEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.run.RunEvent "openlineage.client.run.RunEvent") | [`DatasetEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.run.DatasetEvent "openlineage.client.run.DatasetEvent") | [`JobEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.run.JobEvent "openlineage.client.run.JobEvent") | [`RunEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.RunEvent "openlineage.client.generated.base.RunEvent") | [`DatasetEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.DatasetEvent "openlineage.client.generated.base.DatasetEvent") | [`JobEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.JobEvent "openlineage.client.generated.base.JobEvent")) 

Return type: 
    
`Response` 

_property _session _ Session_ 


close(_timeout_) 
    
Closes the transport, waiting for all events to complete until the timeout is reached. 

Params:
    
timeout: Timeout in seconds. Negative value will block until last event is processed, while 0 means it completes immediately. 

Returns: 
     

True if all events were processed before transport was closed,
    
False if some events were not processed. 

Return type: 
    
bool 

Parameters: 
    
**timeout** ()
## openlineage.client.transport.kafka module 

_class _openlineage.client.transport.kafka.KafkaConfig(_config_ , _topic_ , _messageKey_ , _flush_) 
    
Bases: [`Config`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.transport.transport.Config "openlineage.client.transport.transport.Config") 

Parameters: 
    
  * **config** (`dict`[`str`, `str`])
  * **topic** ()
  * **messageKey** (`Optional`[`str`])
  * **flush** ()



config _`dict`[`str`, `str`]_ 


topic 


messageKey _`str` | `None`_ 


flush _`bool`_ 


_classmethod _from_dict(_params_) 
     

Parameters: 
    
**params** (`dict`[`str`, `Any`]) 

Return type: 
    
`TypeVar`(, bound= KafkaConfig) 

openlineage.client.transport.kafka.on_delivery(, ) 
     

Parameters: 
    
  * **err** (KafkaError)
  * **msg** (Message)



Return type: 
    
None 

_class _openlineage.client.transport.kafka.KafkaTransport(_config_) 
    
Bases: [`Transport`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.transport.transport.Transport "openlineage.client.transport.transport.Transport") 

Parameters: 
    
**config** () 

_ str | None_ _ 'kafka'_ 


config_class 
    
alias of [`KafkaConfig`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.transport.kafka.KafkaConfig "openlineage.client.transport.kafka.KafkaConfig") 

(_event_) 
     

Parameters: 
    
**event** (Event) 

Return type: 
    
None 

wait_for_completion(_timeout_) 
    
Block until all events are processed or timeout is reached. 

Params:
    
timeout: Timeout in seconds. -1 means to block until last event is processed, 0 means no timeout. 

Returns: 
    
True if all events were processed, False if some events were not processed. 

Return type: 
    
bool 

Parameters: 
    
**timeout** () 

close(_timeout_) 
    
Closes the transport, waiting for all events to complete until the timeout is reached. 

Params:
    
timeout: Timeout in seconds. Negative value will block until last event is processed, while 0 means it completes immediately. 

Returns: 
     

True if all events were processed before transport was closed,
    
False if some events were not processed. 

Return type: 
    
bool 

Parameters: 
    
**timeout** ()
## openlineage.client.transport.msk_iam module 

_class _openlineage.client.transport.msk_iam.MSKIAMConfig(_config_ , _topic_ , _messageKey_ , _flush_ , _region_ , _aws_profile_ , _role_arn_ , _aws_debug_creds False_) 
    
Bases: [`KafkaConfig`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.transport.kafka.KafkaConfig "openlineage.client.transport.kafka.KafkaConfig") 

Parameters: 
    
  * **config** (`dict`[`str`, `str`])
  * **topic** ()
  * **messageKey** (`Optional`[`str`])
  * **flush** ()
  * **region** (`Optional`[`str`])
  * **aws_profile** (`Optional`[`str`])
  * **role_arn** (`Optional`[`str`])
  * **aws_debug_creds** ()



region _`str` | `None`_ 


aws_profile _`None` | `str`_ 


role_arn _`None` | `str`_ 


aws_debug_creds _`bool`_ 


_class _openlineage.client.transport.msk_iam.MSKIAMTransport(_config_) 
    
Bases: [`KafkaTransport`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.transport.kafka.KafkaTransport "openlineage.client.transport.kafka.KafkaTransport") 

Parameters: 
    
**config** () 

_ str | None_ _ 'msk-iam'_ 


config_class 
    
alias of [`MSKIAMConfig`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.transport.msk_iam.MSKIAMConfig "openlineage.client.transport.msk_iam.MSKIAMConfig")
## openlineage.client.transport.noop module 

_class _openlineage.client.transport.noop.NoopConfig 
    
Bases: [`Config`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.transport.transport.Config "openlineage.client.transport.transport.Config") 

_class _openlineage.client.transport.noop.NoopTransport(_config_) 
    
Bases: [`Transport`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.transport.transport.Transport "openlineage.client.transport.transport.Transport") 

Parameters: 
    
**config** () 

_`str` | `None`__ 'noop'_ 


config_class 
    
alias of [`NoopConfig`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.transport.noop.NoopConfig "openlineage.client.transport.noop.NoopConfig") 

(_event_) 
     

Parameters: 
    
**event** ([`RunEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.run.RunEvent "openlineage.client.run.RunEvent") | [`DatasetEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.run.DatasetEvent "openlineage.client.run.DatasetEvent") | [`JobEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.run.JobEvent "openlineage.client.run.JobEvent") | [`RunEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.RunEvent "openlineage.client.generated.base.RunEvent") | [`DatasetEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.DatasetEvent "openlineage.client.generated.base.DatasetEvent") | [`JobEvent`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.generated.base.JobEvent "openlineage.client.generated.base.JobEvent")) 

Return type: 

## openlineage.client.transport.transport module
Transport interface for OpenLineage events.
To implement a custom Transport, implement both Config and Transport classes. 

Transport implementation requirements:
    
  * Specify class variable config_class that points to the Config class that Transport requires
  * Implement __init__ that accepts the specified Config class instance
  * Implement emit method that accepts OpenLineage events



Config implementation requirements:
    
  * Implement from_dict classmethod to create config from dictionary parameters
  * The config class can have complex attributes, but must be able to instantiate them in from_dict



Transport instantiation:
    
  * TransportFactory instantiates custom transports by looking at the type field in the config
  * The factory uses this type to determine which transport class to instantiate



_class _openlineage.client.transport.transport.Config 
    
Bases: `object` 

_classmethod _from_dict(_params_) 
     

Parameters: 
    
**params** (`dict`[`str`, `Any`]) 

Return type: 
    
`TypeVar`(, bound= Config) 

_class _openlineage.client.transport.transport.Transport 
    
Bases: `object` 

_`str` | `None`__ None_ 


_`str` | `None`__ None_ 


priority 


config_class 
    
alias of [`Config`](https://openlineage.io/docs/1.48.0/client/python/development/api-reference/openlineage.client/#openlineage.client.transport.transport.Config "openlineage.client.transport.transport.Config") 

(_event_) 
     

Parameters: 
    
**event** (Event) 

Return type: 


close(_timeout_) 
    
Closes the transport, waiting for all events to complete until the timeout is reached. 

Params:
    
timeout: Timeout in seconds. Negative value will block until last event is processed, while 0 means it completes immediately. 

Returns: 
     

True if all events were processed before transport was closed,
    
False if some events were not processed. 

Return type: 
    
bool 

Parameters: 
    
**timeout** () 

_class _openlineage.client.transport.transport.TransportFactory 
    
Bases: `object` 

create(_config_) 
     

Parameters: 
    
**config** (`Optional`[`dict`[`str`, `str`]]) 

Return type: 
    
