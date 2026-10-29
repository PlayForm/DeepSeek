›[Elasticsearch Guide [8.19]](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/index.html) › ›
#  Search API
[edit](https://github.com/elastic/elasticsearch/edit/8.19/docs/reference/search/search.asciidoc "Edit this page on GitHub")
**IMPORTANT** : This documentation is no longer updated. Refer to [Elastic's version policy](https://www.elastic.co/support/eol) and the [latest documentation](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-search). 
##  Search API
**New API reference**
For the most up-to-date API details, refer to [Search APIs](https://www.elastic.co/docs/api/doc/elasticsearch/v8/group/endpoint-search).
Returns search hits that match the query defined in the request.

```
resp = client.search(
    index="my-index-000001",)print(resp)
```


```
response = client.search(
  index:'my-index-000001')
puts response
```


```
res, err := es.Search(
	es.Search.WithIndex("my-index-000001"),
	es.Search.WithPretty(),)
fmt.Println(res, err)
```


```
const response =await client.search({
  index:"my-index-000001",});
console.log(response);
```


```
GET/my-index-000001/_search
```

Console PHP Python Ruby Go JavaScript
##  Request
`GET /<target>/_search`
`GET /_search`
`POST /<target>/_search`
`POST /_search`
##  Prerequisites
  * If the Elasticsearch security features are enabled, you must have the `read` [index privilege](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/security-privileges.html#privileges-list-indices "Indices privileges") for the target data stream, index, or alias. For cross-cluster search, see [Configure privileges for cross-cluster search](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/remote-clusters-cert.html#remote-clusters-privileges-ccs "Configure privileges for cross-cluster search").
To search a [point in time (PIT)](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/point-in-time-api.html "Point in time API") for an alias, you must have the `read` index privilege for the alias’s data streams or indices.


##  Description
Allows you to execute a search query and get back search hits that match the query. You can provide search queries using the [`q` query string parameter](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/search-search.html#search-api-query-params-q) or [request body](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/search-search.html#search-search-api-request-body "Request body").
##  Path parameters 

`<target>` 
     (Optional, string) Comma-separated list of data streams, indices, and aliases to search. Supports wildcards (`*`). To search all data streams and indices, omit this parameter or use `*` or `_all`. 
##  Query parameters
Several options for this API can be specified using a query parameter or a request body parameter. If both parameters are specified, only the query parameter is used. 

`allow_no_indices` 
    
(Optional, Boolean) If `false`, the request returns an error if any wildcard expression, [index alias](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/aliases.html "Aliases"), or `_all` value targets only missing or closed indices. This behavior applies even if the request targets other open indices. For example, a request targeting `foo*,bar*` returns an error if an index starts with `foo` but no index starts with `bar`. 
Defaults to `true`. 

`allow_partial_search_results` 
    
(Optional, Boolean) If `true`, returns partial results if there are shard request timeouts or [shard failures](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/docs-replication.html#shard-failures "Shard failures"). If `false`, returns an error with no partial results. Defaults to `true`. 
To override the default for this field, set the `search.default_allow_partial_results` cluster setting to `false`. 

`analyzer` 
    
(Optional, string) Analyzer to use for the query string. 
This parameter can only be used when the `q` query string parameter is specified. 

`analyze_wildcard` 
    
(Optional, Boolean) If `true`, wildcard and prefix queries are analyzed. Defaults to `false`. 
This parameter can only be used when the `q` query string parameter is specified. 

`batched_reduce_size` 
     (Optional, integer) The number of shard results that should be reduced at once on the coordinating node. This value should be used as a protection mechanism to reduce the memory overhead per search request if the potential number of shards in the request can be large. Defaults to `512`.  

`ccs_minimize_roundtrips` 
     (Optional, Boolean) If `true`, network round-trips between the coordinating node and the remote clusters are minimized when executing cross-cluster search (CCS) requests. See [How cross-cluster search handles network delays](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/modules-cross-cluster-search.html#ccs-network-delays "How cross-cluster search handles network delays"). Defaults to `true`.  

`default_operator` 
    
(Optional, string) The default operator for query string query: AND or OR. Defaults to `OR`. 
This parameter can only be used when the `q` query string parameter is specified.     
(Optional, string) Field to use as default where no field prefix is given in the query string. 
This parameter can only be used when the `q` query string parameter is specified. 

`docvalue_fields` 
     (Optional, string) A comma-separated list of fields to return as the docvalue representation of a field for each hit. See [Doc value fields](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/search-fields.html#docvalue-fields "Doc value fields").  

`expand_wildcards` 
    
(Optional, string) Type of index that wildcard patterns can match. If the request can target data streams, this argument determines whether wildcard expressions match hidden data streams. Supports comma-separated values, such as `open,hidden`. Valid values are:      Match any data stream or index, including [hidden](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/api-conventions.html#multi-hidden "Hidden data streams and indices") ones.  


     Match open, non-hidden indices. Also matches any non-hidden data stream.  

`closed` 
     Match closed, non-hidden indices. Also matches any non-hidden data stream. Data streams cannot be closed.  

`hidden` 
     Match hidden data streams and hidden indices. Must be combined with `open`, `closed`, or both.  


     Wildcard patterns are not accepted. 
Defaults to `open`. 

`explain` 
     (Optional, Boolean) If `true`, returns detailed information about score computation as part of a hit. Defaults to `false`.  


    
(Optional, integer) Starting document offset. Needs to be non-negative and defaults to `0`. 
By default, you cannot page through more than 10,000 hits using the `from` and `size` parameters. To page through more hits, use the [`search_after`](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/paginate-search-results.html#search-after "Search after") parameter. 

`ignore_throttled` 
    
(Optional, Boolean) If `true`, concrete, expanded or aliased indices are ignored when frozen. Defaults to `true`. 
[7.16.0]  Deprecated in 7.16.0.  

`include_named_queries_score` 
     (Optional, Boolean) If `true`, includes the score contribution from any named queries. This functionality reruns each named query on every hit in a search response. Typically, this adds a small overhead to a request. However, using computationally expensive named queries on a large number of hits may add significant overhead. Defaults to `false`.  

`ignore_unavailable` 
     (Optional, Boolean) If `false`, the request returns an error if it targets a missing or closed index. Defaults to `false`.  

`lenient` 
    
(Optional, Boolean) If `true`, format-based query failures (such as providing text to a numeric field) in the query string will be ignored. Defaults to `false`. 
This parameter can only be used when the `q` query string parameter is specified. 

`max_concurrent_shard_requests` 
     (Optional, integer) Defines the number of concurrent shard requests per node this search executes concurrently. This value should be used to limit the impact of the search on the cluster in order to limit the number of concurrent shard requests. Defaults to `5`.  

`pre_filter_shard_size` 
    
(Optional, integer) Defines a threshold that enforces a pre-filter roundtrip to prefilter search shards based on query rewriting if the number of shards the search request expands to exceeds the threshold. This filter roundtrip can limit the number of shards significantly if for instance a shard can not match any documents based on its rewrite method ie. if date filters are mandatory to match but the shard bounds and the query are disjoint. When unspecified, the pre-filter phase is executed if any of these conditions is met: 
  * The request targets more than `128` shards. 
  * The request targets one or more read-only index. 
  * The primary sort of the query targets an indexed field. 



`preference` 
    
(Optional, string) Nodes and shards used for the search. By default, Elasticsearch selects from eligible nodes and shards using [adaptive replica selection](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/search-shard-routing.html#search-adaptive-replica "Adaptive replica selection"), accounting for [allocation awareness](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/shard-allocation-awareness.html "Shard allocation awareness"). 
Valid values for `preference` 

`_only_local` 
     Run the search only on shards on the local node.  

`_local` 
     If possible, run the search on shards on the local node. If not, select shards using the default method.  

`_only_nodes:<node-id>,<node-id>` 
     Run the search on only the specified nodes IDs. If suitable shards exist on more than one selected node, use shards on those nodes using the default method. If none of the specified nodes are available, select shards from any available node using the default method.  

`_prefer_nodes:<node-id>,<node-id>` 
     If possible, run the search on the specified nodes IDs. If not, select shards using the default method.  

`_shards:<shard>,<shard>` 
     Run the search only on the specified shards. You can combine this value with other `preference` values. However, the `_shards` value must come first. For example: `_shards:2,3|_local`.  

`<custom-string>` 
     Any string that does not start with `_`. If the cluster state and selected shards do not change, searches using the same `<custom-string>` value are routed to the same shards in the same order.      
(Optional, string) Query in the Lucene query string syntax. 
You can use the `q` parameter to run a query parameter search. Query parameter searches do not support the full Elasticsearch [Query DSL](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/query-dsl.html "Query DSL") but are handy for testing.
The `q` parameter overrides the [`query`](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/search-search.html#request-body-search-query) parameter in the request body. If both parameters are specified, documents matching the `query` request body parameter are not returned. 

`request_cache` 
     (Optional, Boolean) If `true`, the caching of search results is enabled for requests where `size` is `0`. See [_The shard request cache_](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/shard-request-cache.html "The shard request cache"). Defaults to index level settings.  

`rest_total_hits_as_int` 
     (Optional, Boolean) Indicates whether hits.total should be rendered as an integer or an object in the rest search response. Defaults to `false`.  

`routing` 
     (Optional, string) Custom value used to route operations to a specific shard.  

`scroll` 
    
(Optional, [time value](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/api-conventions.html#time-units "Time units")) Period to retain the [search context](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/paginate-search-results.html#scroll-search-context "Keeping the search context alive") for scrolling. See [Scroll search results](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/paginate-search-results.html#scroll-search-results "Scroll search results"). 
By default, this value cannot exceed `1d` (24 hours). You can change this limit using the `search.max_keep_alive` cluster-level setting. 

`search_type` 
    
(Optional, string) How [distributed term frequencies](https://en.wikipedia.org/wiki/Tf%E2%80%93idf) are calculated for [relevance scoring](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/query-filter-context.html#relevance-scores "Relevance scores"). 
Valid values for `search_type` 

`query_then_fetch` 
     (Default) Distributed term frequencies are calculated locally for each shard running the search. We recommend this option for faster searches with potentially less accurate scoring.  

`dfs_query_then_fetch` 
     Distributed term frequencies are calculated globally, using information gathered from all shards running the search. While this option increases the accuracy of scoring, it adds a round-trip to each shard, which can result in slower searches.  

`seq_no_primary_term` 
     (Optional, Boolean) If `true`, returns sequence number and primary term of the last modification of each hit. See [Optimistic concurrency control](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/optimistic-concurrency-control.html "Optimistic concurrency control").  


    
(Optional, integer) Defines the number of hits to return. Defaults to `10`. 
By default, you cannot page through more than 10,000 hits using the `from` and `size` parameters. To page through more hits, use the [`search_after`](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/paginate-search-results.html#search-after "Search after") parameter. 


     (Optional, string) A comma-separated list of <field>:<direction> pairs.  

`_source` 
    
(Optional) Indicates which [source fields](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/mapping-source-field.html "_source field") are returned for matching documents. These fields are returned in the `hits._source` property of the search response. Defaults to `true`. See [source filtering](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/search-fields.html#source-filtering "The _source option"). 
Valid values for `_source` 


     (Boolean) The entire document source is returned.  

`false` 
     (Boolean) The document source is not returned.  

`<string>` 
     (string) Comma-separated list of source fields to return. Wildcard (`*`) patterns are supported.  

`_source_excludes` 
    
(Optional, string) A comma-separated list of [source fields](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/mapping-source-field.html "_source field") to exclude from the response. 
You can also use this parameter to exclude fields from the subset specified in `_source_includes` query parameter.
If the `_source` parameter is `false`, this parameter is ignored. 

`_source_includes` 
    
(Optional, string) A comma-separated list of [source fields](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/mapping-source-field.html "_source field") to include in the response. 
If this parameter is specified, only these source fields are returned. You can exclude fields from this subset using the `_source_excludes` query parameter.
If the `_source` parameter is `false`, this parameter is ignored. 

`stats` 
     (Optional, string) Specific `tag` of the request for logging and statistical purposes.  

`stored_fields` 
    
(Optional, string) A comma-separated list of stored fields to return as part of a hit. If no fields are specified, no stored fields are included in the response. See [Stored fields](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/search-fields.html#stored-fields "Stored fields"). 
If this field is specified, the `_source` parameter defaults to `false`. You can pass `_source: true` to return both source fields and stored fields in the search response. 

`suggest_field` 
     (Optional, string) Specifies which field to use for suggestions.  

`suggest_mode` 
    
(Optional, string) Specifies the [suggest mode](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/search-suggesters.html "Suggesters"). Defaults to `missing`. Available options: 
  * `always`
  * `missing`
  * `popular`


This parameter can only be used when the `suggest_field` and `suggest_text` query string parameters are specified. 

`suggest_size` 
    
(Optional, integer) Number of [suggestions](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/search-suggesters.html "Suggesters") to return. 
This parameter can only be used when the `suggest_field` and `suggest_text` query string parameters are specified. 

`suggest_text` 
    
(Optional, string) The source text for which the suggestions should be returned. 
This parameter can only be used when the `suggest_field` query string parameter is specified. 

`terminate_after` 
    
(Optional, integer) Maximum number of documents to collect for each shard. If a query reaches this limit, Elasticsearch terminates the query early. Elasticsearch collects documents before sorting. 
Use with caution. Elasticsearch applies this parameter to each shard handling the request. When possible, let Elasticsearch perform early termination automatically. Avoid specifying this parameter for requests that target data streams with backing indices across multiple data tiers.
Defaults to `0`, which does not terminate query execution early. 

`timeout` 
     (Optional, [time units](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/api-conventions.html#time-units "Time units")) Specifies the period of time to wait for a response from each shard. If no response is received before the timeout expires, the request fails and returns an error. Defaults to no timeout.  

`track_scores` 
     (Optional, Boolean) If `true`, calculate and return document scores, even if the scores are not used for sorting. Defaults to `false`.  

`track_total_hits` 
    
(Optional, integer or Boolean) Number of hits matching the query to count accurately. Defaults to `10000`. 
If `true`, the exact number of hits is returned at the cost of some performance. If `false`, the response does not include the total number of hits matching the query. 

`typed_keys` 
     (Optional, Boolean) If `true`, aggregation and suggester names are prefixed by their respective types in the response. Defaults to `false`.  

`version` 
     (Optional, Boolean) If `true`, returns document version as part of a hit. Defaults to `false`. 
##  Request body 

`docvalue_fields` 
    
(Optional, array of strings and objects) Array of field patterns. The request returns values for field names matching these patterns in the `hits.fields` property of the response. 
You can specify items in the array as a string or object. See [Doc value fields](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/search-fields.html#docvalue-fields "Doc value fields").
Properties of `docvalue_fields` objects 

`field` 
     (Required, string) Wildcard pattern. The request returns doc values for field names matching this pattern.  

`format` 
    
(Optional, string) Format in which the doc values are returned. 
For [date fields](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/date.html "Date field type"), you can specify a date [date `format`](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/mapping-date-format.html "format"). For [numeric fields](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/number.html "Numeric field types") fields, you can specify a [DecimalFormat pattern](https://docs.oracle.com/javase/8/docs/api/java/text/DecimalFormat.html).
For other field data types, this parameter is not supported. 

`fields` 
    
(Optional, array of strings and objects) Array of field patterns. The request returns values for field names matching these patterns in the `hits.fields` property of the response. 
You can specify items in the array as a string or object. See [the `fields` option](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/search-fields.html#search-fields-param "The fields option").
Properties of `fields` objects 

`field` 
     (Required, string) Field to return. Supports wildcards (`*`).  

`format` 
    
(Optional, string) Format for date and geospatial fields. Other field data types do not support this parameter. 
[`date`](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/date.html "Date field type") and [`date_nanos`](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/date_nanos.html "Date nanoseconds field type") fields accept a [date format](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/mapping-date-format.html "format"). [`geo_point`](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/geo-point.html "Geopoint field type") and [`geo_shape`](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/geo-shape.html "Geoshape field type") fields accept: 

`geojson` (default)  


`mvt(<spec>)` 
    
Binary [Mapbox vector tile](https://docs.mapbox.com/vector-tiles/specification). The API returns the tile as a base64-encoded string. The `<spec>` has the format `<zoom>/<x>/<y>` with two optional suffixes: `@<extent>` and/or `:<buffer>`. For example, `2/0/1` or `2/0/1@4096:5`. 
`mvt` parameters 

`<zoom>` 
     (Required, integer) Zoom level for the tile. Accepts `0`-`29`.       (Required, integer) X coordinate for the tile.       (Required, integer) Y coordinate for the tile.  

`<extent>` 
     (Optional, integer) Size, in pixels, of a side of the tile. Vector tiles are square with equal sides. Defaults to `4096`.  

`<buffer>` 
     (Optional, integer) Size, in pixels, of a clipping buffer outside the tile. This allows renderers to avoid outline artifacts from geometries that extend past the extent of the tile. Defaults to `5`.  

`stored_fields` 
    
(Optional, string) A comma-separated list of stored fields to return as part of a hit. If no fields are specified, no stored fields are included in the response. See [Stored fields](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/search-fields.html#stored-fields "Stored fields"). 
If this option is specified, the `_source` parameter defaults to `false`. You can pass `_source: true` to return both source fields and stored fields in the search response. 

`explain` 
     (Optional, Boolean) If `true`, returns detailed information about score computation as part of a hit. Defaults to `false`.  


    
(Optional, integer) Starting document offset. Needs to be non-negative and defaults to `0`. 
By default, you cannot page through more than 10,000 hits using the `from` and `size` parameters. To page through more hits, use the [`search_after`](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/paginate-search-results.html#search-after "Search after") parameter. 

`indices_boost` 
    
(Optional, array of objects) Boosts the [`_score`](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/query-filter-context.html#relevance-scores "Relevance scores") of documents from specified indices. 
Properties of `indices_boost` objects 

`<index>: <boost-value>` 
    
(Required, float) `<index>` is the name of the index or index alias. Wildcard (`*`) expressions are supported. 
`<boost-value>` is the factor by which scores are multiplied.
A boost value greater than `1.0` increases the score. A boost value between `0` and `1.0` decreases the score.     
(Optional, object or array of objects) Defines the [kNN](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/knn-search.html#approximate-knn "Approximate kNN") query to run. 
Properties of `knn` object 

`field` 
     (Required, string) The name of the vector field to search against. Must be a [`dense_vector` field with indexing enabled](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/dense-vector.html#index-vectors-knn-search "Index vectors for kNN search").  

`filter` 
     (Optional, [Query DSL object](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/query-dsl.html "Query DSL")) Query to filter the documents that can match. The kNN search will return the top `k` documents that also match this filter. The value can be a single query or a list of queries. If `filter` is not provided, all documents are allowed to match.       (Optional, integer) Number of nearest neighbors to return as top hits. This value must be less than or equal to `num_candidates`. Defaults to `size`.  

`num_candidates` 
     (Optional, integer) The number of nearest neighbor candidates to consider per shard. Needs to be greater than `k`, or `size` if `k` is omitted, and cannot exceed 10,000. Elasticsearch collects `num_candidates` results from each shard, then merges them to find the top `k` results. Increasing `num_candidates` tends to improve the accuracy of the final `k` results. Defaults to `Math.min(1.5 * k, 10_000)`.  

`query_vector` 
     (Optional, array of floats) Query vector. Must have the same number of dimensions as the vector field you are searching against. Must be either an array of floats or a hex-encoded byte vector.  

`query_vector_builder` 
     (Optional, object) A configuration object indicating how to build a query_vector before executing the request. You must provide a `query_vector_builder` or `query_vector`, but not both. Refer to [Perform semantic search](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/knn-search.html#knn-semantic-search "Perform semantic search") to learn more.  

`similarity` 
    
(Optional, float) The minimum similarity required for a document to be considered a match. The similarity value calculated relates to the raw [`similarity`](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/dense-vector.html#dense-vector-similarity) used. Not the document score. The matched documents are then scored according to [`similarity`](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/dense-vector.html#dense-vector-similarity) and the provided `boost` is applied. 
The `similarity` parameter is the direct vector similarity calculation.
  * `l2_norm`: also known as Euclidean, will include documents where the vector is within the `dims` dimensional hypersphere with radius `similarity` with origin at `query_vector`. 
  * `cosine`, `dot_product`, and `max_inner_product`: Only return vectors where the cosine similarity or dot-product are at least the provided `similarity`. 


Read more here: [knn similarity search](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/knn-search.html#knn-similarity-search "Search kNN with expected similarity") 

`rescore_vector` 
    
(Optional, object) Functionality in  [preview]  This functionality is in technical preview and may be changed or removed in a future release. Elastic will work to fix any issues, but features in technical preview are not subject to the support SLA of official GA features.  . Apply oversampling and rescoring to quantized vectors.
Rescoring only makes sense for quantized vectors; when [quantization](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/dense-vector.html#dense-vector-quantization "Automatically quantize vectors for kNN search") is not used, the original vectors are used for scoring. Rescore option will be ignored for non-quantized `dense_vector` fields. 

`oversample` 
    
(Required, float) 
Applies the specified oversample factor to `k` on the approximate kNN search. The approximate kNN search will:
  * Retrieve `num_candidates` candidates per shard. 
  * From these candidates, the top `k * oversample` candidates per shard will be rescored using the original vectors. 
  * The top `k` rescored candidates will be returned. 


See [oversampling and rescoring quantized vectors](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/knn-search.html#dense-vector-knn-search-rescoring "Oversampling and rescoring for quantized vectors") for details. 

`min_score` 
     (Optional, float) Minimum [`_score`](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/query-filter-context.html#relevance-scores "Relevance scores") for matching documents. Documents with a lower `_score` are not included in the search results.      
(Optional, object) Limits the search to a [point in time (PIT)](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/point-in-time-api.html "Point in time API"). If you provide a `pit`, you cannot specify a `<target>` in the request path. 
Properties of `pit`      (Required*, string) ID for the PIT to search. If you provide a `pit` object, this parameter is required.  

`keep_alive` 
     (Optional, [time value](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/api-conventions.html#time-units "Time units")) Period of time used to extend the life of the PIT.  

`query` 
     (Optional, [query object](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/query-dsl.html "Query DSL")) Defines the search definition using the [Query DSL](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/query-dsl.html "Query DSL").  

`retriever` 
     [preview]  This functionality is in technical preview and may be changed or removed in a future release. Elastic will work to fix any issues, but features in technical preview are not subject to the support SLA of official GA features.  (Optional, [retriever object](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/retriever.html "Retriever")) Defines a top-level retriever to specify a desired set of top documents instead of a standard query or knn search.  

`runtime_mappings` 
    
(Optional, object of objects) Defines one or more [runtime fields](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/runtime-search-request.html "Define runtime fields in a search request") in the search request. These fields take precedence over mapped fields with the same name. 
Properties of `runtime_mappings` objects 

`<field-name>` 
    
(Required, object) Configuration for the runtime field. The key is the field name. 
Properties of `<field-name>` 


    
(Required, string) [Field type](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/mapping-types.html "Field data types"), which can be any of the following: 
  * `boolean`
  * `composite`
  * `date`
  * `double`
  * `geo_point`
  * `keyword`
  * `long`



`script` 
    
(Optional, string) [Painless script](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/modules-scripting-using.html "How to write scripts") executed at query time. The script has access to the entire context of a document, including the original `_source` and any mapped fields plus their values. 
This script must include `emit` to return calculated values. For example:

```
"script":"emit(doc['@timestamp'].value.dayOfWeekEnum.toString())"
```


`seq_no_primary_term` 
     (Optional, Boolean) If `true`, returns sequence number and primary term of the last modification of each hit. See [Optimistic concurrency control](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/optimistic-concurrency-control.html "Optimistic concurrency control").  


    
(Optional, integer) The number of hits to return. Needs to be non-negative and defaults to `10`. 
By default, you cannot page through more than 10,000 hits using the `from` and `size` parameters. To page through more hits, use the [`search_after`](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/paginate-search-results.html#search-after "Search after") parameter. 

`_source` 
    
(Optional) Indicates which [source fields](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/mapping-source-field.html "_source field") are returned for matching documents. These fields are returned in the `hits._source` property of the search response. Defaults to `true`. See [source filtering](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/search-fields.html#source-filtering "The _source option"). 
Valid values for `_source` 


     (Boolean) The entire document source is returned.  

`false` 
     (Boolean) The document source is not returned.  

`<wildcard_pattern>` 
     (string or array of strings) Wildcard (`*`) pattern or array of patterns containing source fields to return.  

`<object>` 
    
(object) Object containing a list of source fields to include or exclude. 
Properties for `<object>` 

`excludes` 
    
(string or array of strings) Wildcard (`*`) pattern or array of patterns containing source fields to exclude from the response. 
You can also use this property to exclude fields from the subset specified in `includes` property. 

`includes` 
    
(string or array of strings) Wildcard (`*`) pattern or array of patterns containing source fields to return. 
If this property is specified, only these source fields are returned. You can exclude fields from this subset using the `excludes` property. 

`stats` 
     (Optional, array of strings) Stats groups to associate with the search. Each group maintains a statistics aggregation for its associated searches. You can retrieve these stats using the [indices stats API](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/indices-stats.html "Index stats API").  

`terminate_after` 
    
(Optional, integer) Maximum number of documents to collect for each shard. If a query reaches this limit, Elasticsearch terminates the query early. Elasticsearch collects documents before sorting. 
Use with caution. Elasticsearch applies this parameter to each shard handling the request. When possible, let Elasticsearch perform early termination automatically. Avoid specifying this parameter for requests that target data streams with backing indices across multiple data tiers.
Defaults to `0`, which does not terminate query execution early. 

`timeout` 
     (Optional, [time units](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/api-conventions.html#time-units "Time units")) Specifies the period of time to wait for a response from each shard. If no response is received before the timeout expires, the request fails and returns an error. Defaults to no timeout.  

`version` 
     (Optional, Boolean) If `true`, returns document version as part of a hit. Defaults to `false`. 
##  Response body 

`_scroll_id` 
    
(string) Identifier for the search and its [search context](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/paginate-search-results.html#scroll-search-context "Keeping the search context alive"). 
You can use this scroll ID with the [scroll API](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/scroll-api.html "Scroll API") to retrieve the next batch of search results for the request. See [Scroll search results](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/paginate-search-results.html#scroll-search-results "Scroll search results").
This parameter is only returned if the [`scroll` query parameter](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/search-search.html#search-api-scroll-query-param) is specified in the request. 


    
(integer) Milliseconds it took Elasticsearch to execute the request.
This value is calculated by measuring the time elapsed between receipt of a request on the coordinating node and the time at which the coordinating node is ready to send the response.
Took time includes:
  * Communication time between the coordinating node and data nodes 
  * Time the request spends in the `search` [thread pool](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/modules-threadpool.html "Thread pools"), queued for execution 
  * Actual execution time 


Took time does include:
  * Time needed to send the request to Elasticsearch 
  * Time needed to serialize the JSON response 
  * Time needed to send the response to a client 



`timed_out` 
     (Boolean) If `true`, the request timed out before completion; returned results may be partial or empty.  

`_shards` 
    
(object) Contains a count of shards used for the request. 
Properties of `_shards` 

`total` 
     (integer) Total number of shards that require querying, including unallocated shards.  

`successful` 
     (integer) Number of shards that executed the request successfully.  

`skipped` 
     (integer) Number of shards that skipped the request because a lightweight check helped realize that no documents could possibly match on this shard. This typically happens when a search request includes a range filter and the shard only has values that fall outside of that range.  

`failed` 
     (integer) Number of shards that failed to execute the request. Note that shards that are not allocated will be considered neither successful nor failed. Having `failed+successful` less than `total` is thus an indication that some of the shards were not allocated.  


    
(object) Contains returned documents and metadata. 
Properties of `hits` 

`total` 
    
(object) Metadata about the number of matching documents. 
Properties of `total` 

`value` 
     (integer) Total number of matching documents.  

`relation` 
    
(string) Indicates whether the number of matching documents in the `value` parameter is accurate or a lower bound. 
Values of `relation`:      Accurate       Lower bound  

`max_score` 
    
(float) Highest returned [document `_score`](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/search-search.html#search-api-response-body-score). 
This value is `null` for requests that do not sort by `_score`. 


    
(array of objects) Array of returned document objects. 
Properties of `hits` objects 

`_index` 
     (string) Name of the index containing the returned document.       (string) Unique identifier for the returned document. This ID is only unique within the returned index.  

`_score` 
     (float) Positive 32-bit floating point number used to determine the relevance of the returned document.  

`_source` 
    
(object) Original JSON body passed for the document at index time. 
You can use the `_source` parameter to exclude this property from the response or specify which source fields to return. 

`fields` 
    
(object) Contains field values for the documents. These fields must be specified in the request using one or more of the following request parameters:


This property is returned only if one or more of these parameters are set.
Properties of `fields` 

`<field>` 
     (array) Key is the field name. Value is the value for the field. 
##  Examples

```
resp = client.search(
    index="my-index-000001",
    from_="40",
    size="20",
    query={"term":{"user.id":"kimchy"}},)print(resp)
```


```
response = client.search(
  index:'my-index-000001',
  from:40,
  size:20,
  body:{
    query:{
      term:{'user.id'=>'kimchy'}}})
puts response
```


```
const response =await client.search({
  index:"my-index-000001",from:40,
  size:20,
  query:{
    term:{"user.id":"kimchy",},},});
console.log(response);
```


```
GET/my-index-000001/_search?from=40size=20{"query":{"term":{"user.id":"kimchy"}}}
```

Console PHP Python Ruby Go JavaScript
The API returns the following response:

```
{"took":5,"timed_out":false,"_shards":{"total":1,"successful":1,"skipped":0,"failed":0},"hits":{"total":{"value":20,"relation":"eq"},"max_score":1.3862942,"hits":[{"_index":"my-index-000001","_id":"0","_score":1.3862942,"_source":{"@timestamp":"2099-11-15T14:12:12","http":{"request":{"method":"get"},"response":{"status_code":200,"bytes":1070000},"version":"1.1"},"source":{"ip":"127.0.0.1"},"message":"GET /search HTTP/1.1 200 1070000","user":{"id":"kimchy"}}},...]}}
```

