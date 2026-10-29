##  Run a search  Generally available
Ask AI 
  * [ Copy as Markdown ](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-search)


POST  /{index}/_search 
**All methods and paths for this operation:**
GET /_search
POST /_search
GET /{index}/_search
POST /{index}/_search
Get search hits that match the query defined in the request. You can provide search queries using the `q` query string parameter or the request body. If both are specified, only the query parameter is used.
If the Elasticsearch security features are enabled, you must have the read index privilege for the target data stream, index, or alias. For cross-cluster search, refer to the documentation about configuring CCS privileges. To search a point in time (PIT) for an alias, you must have the `read` index privilege for the alias's data streams or indices.
**Search slicing**
When paging through a large number of documents, it can be helpful to split the search into multiple slices to consume them independently with the `slice` and `pit` properties. By default the splitting is done first on the shards, then locally on each shard.
For instance if the number of shards is equal to 2 and you request 4 slices, the slices 0 and 2 are assigned to the first shard and the slices 1 and 3 are assigned to the second shard.
IMPORTANT: The same point-in-time ID should be used for all slices. If different PIT IDs are used, slices can overlap and miss documents. This situation can occur because, by default, the splitting criterion is based on Lucene document IDs, which are not stable across changes to the index.
###  Required authorization 
  * Index privileges: `read`


[ About adding remote clusters ](https://www.elastic.co/docs/deploy-manage/remote-clusters/remote-clusters-cert#remote-clusters-privileges-ccs "About adding remote clusters")
####  Path parameters 
  * string | array[string] Required
A comma-separated list of data streams, indices, and aliases to search. It supports wildcards (`*`). To search all data streams and indices, omit this parameter or use `*` or `_all`.


####  Query parameters 
  * allow_no_indices  boolean
A setting that does two separate checks on the index expression. If `false`, the request returns an error (1) if any wildcard expression (including `_all` and `*`) resolves to zero matching indices or (2) if the complete set of resolved indices, aliases or data streams is empty after all expressions are evaluated. If `true`, index expressions that resolve to no indices are allowed and the request returns an empty result.
Default value is `true`.
  * allow_partial_search_results  boolean
If `true` and there are shard request timeouts or shard failures, the request returns partial results. If `false`, it returns an error with no partial results.
To override the default behavior, you can set the `search.default_allow_partial_results` cluster setting to `false`.
Default value is `true`.
  * analyzer  string
The analyzer to use for the query string. This parameter can be used only when the `q` query string parameter is specified.
  * analyze_wildcard  boolean
If `true`, wildcard and prefix queries are analyzed. This parameter can be used only when the `q` query string parameter is specified.
Default value is `false`.
  * batched_reduce_size  number
The number of shard results that should be reduced at once on the coordinating node. If the potential number of shards in the request can be large, this value should be used as a protection mechanism to reduce the memory overhead per search request.
Default value is `512`.
  * ccs_minimize_roundtrips  boolean
If `true`, network round-trips between the coordinating node and the remote clusters are minimized when running cross-cluster search (CCS) requests.
Default value is `true`.
  * default_operator  string
The default operator for the query string query: `and` or `or`. This parameter can be used only when the `q` query string parameter is specified.
Default value is `or`.
  * string
The field to use as a default when no field prefix is given in the query string. This parameter can be used only when the `q` query string parameter is specified.
  * docvalue_fields  string | array[string]
A comma-separated list of fields to return as the docvalue representation of a field for each hit.
  * expand_wildcards 
The type of index that wildcard patterns can match. If the request can target data streams, this argument determines whether wildcard expressions match hidden data streams. It supports comma-separated values such as `open,hidden`.
Supported values include:
    * `all`: Match any data stream or index, including hidden ones.
    * `open`: Match open, non-hidden indices. Also matches any non-hidden data stream.
    * `closed`: Match closed, non-hidden indices. Also matches any non-hidden data stream. Data streams cannot be closed.
    * `hidden`: Match hidden data streams and hidden indices. Must be combined with `open`, `closed`, or `both`.
    * `none`: Wildcard expressions are not accepted.
Default value is `open`.
  * explain  boolean
If `true`, the request returns detailed information about score computation as part of a hit.
Default value is `false`.
  * ignore_throttled  boolean Deprecated
If `true`, concrete, expanded or aliased indices will be ignored when frozen.
Default value is `true`.
  * ignore_unavailable  boolean
If `false`, the request returns an error if it targets a concrete (non-wildcarded) index, alias, or data stream that is missing, closed, or otherwise unavailable. If `true`, unavailable concrete targets are silently ignored.
Default value is `false`.
  * include_named_queries_score  boolean
If `true`, the response includes the score contribution from any named queries.
This functionality reruns each named query on every hit in a search response. Typically, this adds a small overhead to a request. However, using computationally expensive named queries on a large number of hits may add significant overhead.
Default value is `false`.
  * lenient  boolean
If `true`, format-based query failures (such as providing text to a numeric field) in the query string will be ignored. This parameter can be used only when the `q` query string parameter is specified.
Default value is `false`.
  * max_concurrent_shard_requests  number
The number of concurrent shard requests per node that the search runs concurrently. This value should be used to limit the impact of the search on the cluster in order to limit the number of concurrent shard requests.
Default value is `5`.
  * preference  string
The nodes and shards used for the search. By default, Elasticsearch selects from eligible nodes and shards using adaptive replica selection, accounting for allocation awareness. Valid values are:
    * `_only_local` to run the search only on shards on the local node.
    * `_local` to, if possible, run the search on shards on the local node, or if not, select shards using the default method.
    * `_only_nodes:<node-id>,<node-id>` to run the search on only the specified nodes IDs. If suitable shards exist on more than one selected node, use shards on those nodes using the default method. If none of the specified nodes are available, select shards from any available node using the default method.
    * `_prefer_nodes:<node-id>,<node-id>` to if possible, run the search on the specified nodes IDs. If not, select shards using the default method.
    * `_shards:<shard>,<shard>` to run the search only on the specified shards. You can combine this value with other `preference` values. However, the `_shards` value must come first. For example: `_shards:2,3|_local`.
    * `<custom-string>` (any string that does not start with `_`) to route searches with the same `<custom-string>` to the same shards in the same order.
  * pre_filter_shard_size  number
A threshold that enforces a pre-filter roundtrip to prefilter search shards based on query rewriting if the number of shards the search request expands to exceeds the threshold. This filter roundtrip can limit the number of shards significantly if for instance a shard can not match any documents based on its rewrite method (if date filters are mandatory to match but the shard bounds and the query are disjoint). When unspecified, the pre-filter phase is executed if any of these conditions is met:
    * The request targets more than 128 shards.
    * The request targets one or more read-only index.
    * The primary sort of the query targets an indexed field.
  * request_cache  boolean
If `true`, the caching of search results is enabled for requests where `size` is `0`. It defaults to index level settings.
  * routing  string | array[string]
A custom value that is used to route operations to a specific shard. Not allowed when `index.slice.enabled` is `true` for the target index; use `_slice` instead.
  * string
The period to retain the search context for scrolling. By default, this value cannot exceed `1d` (24 hours). You can change this limit by using the `search.max_keep_alive` cluster-level setting.
  * search_type  string
Indicates how distributed term frequencies are calculated for relevance scoring.
Supported values include:
    * `query_then_fetch`: Documents are scored using local term and document frequencies for the shard. This is usually faster but less accurate.
    * `dfs_query_then_fetch`: Documents are scored using global term and document frequencies across all shards. This is usually slower but more accurate.
Values are `query_then_fetch` or `dfs_query_then_fetch`.
  * array[string] | string
Specific `tag` of the request for logging and statistical purposes.
  * stored_fields  string | array[string]
A comma-separated list of stored fields to return as part of a hit. If no fields are specified, no stored fields are included in the response. If this field is specified, the `_source` parameter defaults to `false`. You can pass `_source: true` to return both source fields and stored fields in the search response.
  * suggest_field  string
The field to use for suggestions.
  * suggest_mode  string
The suggest mode. This parameter can be used only when the `suggest_field` and `suggest_text` query string parameters are specified.
Supported values include:
    * `missing`: Only generate suggestions for terms that are not in the shard.
    * `popular`: Only suggest terms that occur in more docs on the shard than the original term.
    * `always`: Suggest any matching suggestions based on terms in the suggest text.
Default value is `missing`.
  * suggest_size  number
The number of suggestions to return. This parameter can be used only when the `suggest_field` and `suggest_text` query string parameters are specified.
  * suggest_text  string
The source text for which the suggestions should be returned. This parameter can be used only when the `suggest_field` and `suggest_text` query string parameters are specified.
  * terminate_after  number
The maximum number of documents to collect for each shard. If a query reaches this limit, Elasticsearch terminates the query early. Elasticsearch collects documents before sorting.
IMPORTANT: Use with caution. Elasticsearch applies this parameter to each shard handling the request. When possible, let Elasticsearch perform early termination automatically. Avoid specifying this parameter for requests that target data streams with backing indices across multiple data tiers. If set to `0` (default), the query does not terminate early.
Default value is `0`.
  * timeout  string
The period of time to wait for a response from each shard. If no response is received before the timeout expires, the request fails and returns an error. It defaults to no timeout.
  * track_total_hits 
The number of hits matching the query to count accurately. If `true`, the exact number of hits is returned at the cost of some performance. If `false`, the response does not include the total number of hits matching the query.
Default value is `10000`.
  * track_scores  boolean
If `true`, the request calculates and returns document scores, even if the scores are not used for sorting.
Default value is `false`.
  * typed_keys  boolean
If `true`, aggregation and suggester names are be prefixed by their respective types in the response.
Default value is `false`.
  * rest_total_hits_as_int  boolean
Indicates whether `hits.total` should be rendered as an integer or an object in the rest search response.
Default value is `false`.
  * version  boolean
If `true`, the request returns the document version as part of a hit.
Default value is `false`.
  * _source 
The source fields that are returned for matching documents. These fields are returned in the `hits._source` property of the search response. Valid values are:
    * `true` to return the entire document source.
    * `false` to not return the document source.
    * `<string>` to return the source fields that are specified as a comma-separated list that supports wildcard (`*`) patterns.
Default value is `true`.
  * _source_excludes  string | array[string]
A comma-separated list of source fields to exclude from the response. You can also use this parameter to exclude fields from the subset specified in `_source_includes` query parameter. If the `_source` parameter is `false`, this parameter is ignored.
  * _source_exclude_vectors  boolean
Whether vectors should be excluded from _source
Default value is `false`.
  * _source_includes  string | array[string]
A comma-separated list of source fields to include in the response. If this parameter is specified, only these source fields are returned. You can exclude fields from this subset using the `_source_excludes` query parameter. If the `_source` parameter is `false`, this parameter is ignored.
  * seq_no_primary_term  boolean
If `true`, the request returns the sequence number and primary term of the last modification of each hit.
  * string
A query in the Lucene query string syntax. Query parameter searches do not support the full Elasticsearch Query DSL but are handy for testing.
IMPORTANT: This parameter overrides the query parameter in the request body. If both parameters are specified, documents matching the query request body parameter are not returned.
  * number
The number of hits to return. By default, you cannot page through more than 10,000 hits using the `from` and `size` parameters. To page through more hits, use the `search_after` parameter.
Default value is `10`.
  * number
The starting document offset, which must be non-negative. By default, you cannot page through more than 10,000 hits using the `from` and `size` parameters. To page through more hits, use the `search_after` parameter.
Default value is `0`.
  * string | array[string]
A comma-separated list of `<field>:<direction>` pairs.


#### 
  * aggregations  object
Defines the aggregations that are run as part of the search request.
  * collapse  object
Collapses search results the values of the specified field.
  * explain  boolean
If `true`, the request returns detailed information about score computation as part of a hit.
Default value is `false`.
  * object
Configuration of search extensions defined by Elasticsearch plugins.
Hide ext attribute Show ext attribute object
    * object Additional properties
  * number
The starting document offset, which must be non-negative. By default, you cannot page through more than 10,000 hits using the `from` and `size` parameters. To page through more hits, use the `search_after` parameter.
Default value is `0`.
  * highlight  object
Specifies the highlighter to use for retrieving highlighted snippets from one or more fields in your search results.
Hide highlight attributes Show highlight attributes object
    * string
Supported values include:
      * `plain`: The `plain` highlighter uses the standard Lucene highlighter
      * `fvh`: The fvh highlighter uses the Lucene Fast Vector highlighter.
      * `unified`: The unified highlighter uses the Lucene Unified Highlighter.
Values are `plain`, `fvh`, or `unified`.
    * boundary_chars  string
A string that contains each boundary character.
Default value is `.,!? \t\n`.
    * boundary_max_scan  number
How far to scan for boundary characters.
Default value is `20`.
    * boundary_scanner  string
Specifies how to break the highlighted fragments: chars, sentence, or word. Only valid for the unified and fvh highlighters. Defaults to `sentence` for the `unified` highlighter. Defaults to `chars` for the `fvh` highlighter.
Supported values include:
      * `chars`: Use the characters specified by `boundary_chars` as highlighting boundaries. The `boundary_max_scan` setting controls how far to scan for boundary characters. Only valid for the `fvh` highlighter.
      * `sentence`: Break highlighted fragments at the next sentence boundary, as determined by Java’s `BreakIterator`. You can specify the locale to use with `boundary_scanner_locale`. When used with the `unified` highlighter, the `sentence` scanner splits sentences bigger than `fragment_size` at the first word boundary next to fragment_size. You can set `fragment_size` to `0` to never split any sentence.
      * `word`: Break highlighted fragments at the next word boundary, as determined by Java’s `BreakIterator`. You can specify the locale to use with `boundary_scanner_locale`.
Values are `chars`, `sentence`, or `word`.
    * boundary_scanner_locale  string
Controls which locale is used to search for sentence and word boundaries. This parameter takes a form of a language tag, for example: `"en-US"`, `"fr-FR"`, `"ja-JP"`.
Default value is `Locale.ROOT`.
    * force_source  boolean Deprecated
    * fragmenter  string
Specifies how text should be broken up in highlight snippets: `simple` or `span`. Only valid for the `plain` highlighter.
Values are `simple` or `span`.
    * fragment_size  number
The size of the highlighted fragment in characters.
Default value is `100`.
    * highlight_filter  boolean
    * highlight_query  object
Highlight matches for a query other than the search query. This is especially useful if you use a rescore query because those are not taken into account by highlighting by default.
    * max_fragment_length  number
    * max_analyzed_offset  number
If set to a non-negative value, highlighting stops at this defined maximum limit. The rest of the text is not processed, thus not highlighted and no error is returned The `max_analyzed_offset` query setting does not override the `index.highlight.max_analyzed_offset` setting, which prevails when it’s set to lower value than the query setting.
    * no_match_size  number
The amount of text you want to return from the beginning of the field if there are no matching fragments to highlight.
Default value is `0`.
    * number_of_fragments  number
The maximum number of fragments to return. If the number of fragments is set to `0`, no fragments are returned. Instead, the entire field contents are highlighted and returned. This can be handy when you need to highlight short texts such as a title or address, but fragmentation is not required. If `number_of_fragments` is `0`, `fragment_size` is ignored.
Default value is `5`.
    * options  object
Hide options attribute Show options attribute object
      * object Additional properties
    * string
Sorts highlighted fragments by score when set to `score`. By default, fragments will be output in the order they appear in the field (order: `none`). Setting this option to `score` will output the most relevant fragments first. Each highlighter applies its own logic to compute relevancy scores.
Value is `score`.
    * phrase_limit  number
Controls the number of matching phrases in a document that are considered. Prevents the `fvh` highlighter from analyzing too many phrases and consuming too much memory. When using `matched_fields`, `phrase_limit` phrases per matched field are considered. Raising the limit increases query time and consumes more memory. Only supported by the `fvh` highlighter.
Default value is `256`.
    * post_tags  array[string]
Use in conjunction with `pre_tags` to define the HTML tags to use for the highlighted text. By default, highlighted text is wrapped in `<em>` and `</em>` tags.
    * pre_tags  array[string]
Use in conjunction with `post_tags` to define the HTML tags to use for the highlighted text. By default, highlighted text is wrapped in `<em>` and `</em>` tags.
    * require_field_match  boolean
By default, only fields that contains a query match are highlighted. Set to `false` to highlight all fields.
Default value is `true`.
    * tags_schema  string
Set to `styled` to use the built-in tag schema.
Value is `styled`.
    * encoder  string
Values are `default` or `html`.
    * object | array[object] Required
  * track_total_hits  boolean | number
Number of hits matching the query to count accurately. If `true`, the exact number of hits is returned at the cost of some performance. If `false`, the response does not include the total number of hits matching the query.
  * indices_boost  array[object]
Boost the `_score` of documents from specified indices. The boost value is the factor by which scores are multiplied. A boost value greater than `1.0` increases the score. A boost value between `0` and `1.0` decreases the score.
Hide indices_boost attribute Show indices_boost attribute object
    * number Additional properties
  * docvalue_fields  array[object]
An array of wildcard (`*`) field patterns. The request returns doc values for field names matching these patterns in the `hits.fields` property of the response.
Hide docvalue_fields attributes Show docvalue_fields attributes object
A reference to a field with formatting instructions on how to return the value
    * string Required
A wildcard pattern. The request returns values for field names matching this pattern.
    * string
The format in which the values are returned.
    * include_unmapped  boolean
  * object | array[object] Generally available; Added in 8.4.0
The approximate kNN search to run.
Hide attributes Show attributes
    * string Required
The name of the vector field to search against
    * query_vector  array[number]
The query vector
    * query_vector_builder  object
The query vector builder. You must provide a query_vector_builder or query_vector, but not both.
Hide query_vector_builder attributes Show query_vector_builder attributes object
      * embedding  object
Hide embedding attribute Show embedding attribute object
        * inference_id  string
      * text_embedding  object
Hide text_embedding attributes Show text_embedding attributes object
        * model_id  string
Model ID is required for all dense_vector fields but may be inferred for semantic_text fields
        * model_text  string Required
The text to be converted into a vector by the specified model
      * object Generally available; Added in 9.4.0
Lookup a vector from an existing document. Must reference a dense_vector field and a single value.
Hide lookup attributes Show lookup attributes object
        * string Required
The ID of the document to fetch the vector from
        * string Required
The name of the index to fetch the document from
        * string Required
The name of the field containing the vector
        * routing  string
The routing value to use when fetching the document
    * number
The final number of nearest neighbors to return as top hits
    * num_candidates  number
The number of nearest neighbor candidates to consider per shard
    * visit_percentage  number Generally available; Added in 9.2.0
The percentage of vectors to explore per shard while doing knn search with bbq_disk
    * number
Boost value to apply to kNN scores
    * object | array[object]
Filters for the kNN search query
An Elasticsearch Query DSL (Domain Specific Language) object that defines a query.
An Elasticsearch Query DSL (Domain Specific Language) object that defines a query.
An Elasticsearch Query DSL (Domain Specific Language) object that defines a query.
An Elasticsearch Query DSL (Domain Specific Language) object that defines a query.
    * similarity  number
The minimum similarity for a vector to be considered a match
    * inner_hits  object
If defined, each search hit will contain inner hits.
Hide inner_hits attributes Show inner_hits attributes object
      * string
The name for the particular inner hit definition in the response. Useful when a search request contains multiple inner hits.
      * number
The maximum number of hits to return per `inner_hits`.
Default value is `3`.
      * number
Inner hit starting document offset.
Default value is `0`.
      * collapse  object
      * docvalue_fields  array[object]
A reference to a field with formatting instructions on how to return the value
Hide docvalue_fields attributes Show docvalue_fields attributes object
A reference to a field with formatting instructions on how to return the value
        *         * string
The format in which the values are returned.
        * include_unmapped  boolean
      * explain  boolean
      * highlight  object
      * ignore_unmapped  boolean
      * script_fields  object
Hide script_fields attribute Show script_fields attribute object
        * object Additional properties
Hide * attribute Show * attribute object
          * ignore_failure  boolean
      * seq_no_primary_term  boolean
      * array[string]
Path to field or array of paths. Some API's support wildcards in the path to select multiple fields.
      * array[object]
A reference to a field with formatting instructions on how to return the value
Hide fields attributes Show fields attributes object
A reference to a field with formatting instructions on how to return the value
        *         * string
The format in which the values are returned.
        * include_unmapped  boolean
      * array[string | object]
      * _source  boolean | object
      * stored_fields  string | array[string]
Path to field or array of paths. Some API's support wildcards in the path to select multiple fields.
Path to field or array of paths. Some API's support wildcards in the path to select multiple fields.
      * track_scores  boolean
Default value is `false`.
      * version  boolean
    * rescore_vector  object Generally available; Added in 8.18.0
Apply oversampling and rescoring to quantized vectors
Hide rescore_vector attribute Show rescore_vector attribute object
      * oversample  number Required
Applies the specified oversample factor to k on the approximate kNN search
    * string
Hide attributes Show attributes object
    * string Required
The name of the vector field to search against
    * query_vector  array[number]
The query vector
    * query_vector_builder  object
The query vector builder. You must provide a query_vector_builder or query_vector, but not both.
Hide query_vector_builder attributes Show query_vector_builder attributes object
      * embedding  object
      * text_embedding  object
      * object Generally available; Added in 9.4.0
Lookup a vector from an existing document. Must reference a dense_vector field and a single value.
    * number
The final number of nearest neighbors to return as top hits
    * num_candidates  number
The number of nearest neighbor candidates to consider per shard
    * visit_percentage  number Generally available; Added in 9.2.0
The percentage of vectors to explore per shard while doing knn search with bbq_disk
    * number
Boost value to apply to kNN scores
    * object | array[object]
Filters for the kNN search query
An Elasticsearch Query DSL (Domain Specific Language) object that defines a query.
An Elasticsearch Query DSL (Domain Specific Language) object that defines a query.
An Elasticsearch Query DSL (Domain Specific Language) object that defines a query.
An Elasticsearch Query DSL (Domain Specific Language) object that defines a query.
    * similarity  number
The minimum similarity for a vector to be considered a match
    * inner_hits  object
If defined, each search hit will contain inner hits.
Hide inner_hits attributes Show inner_hits attributes object
      * string
The name for the particular inner hit definition in the response. Useful when a search request contains multiple inner hits.
      * number
The maximum number of hits to return per `inner_hits`.
Default value is `3`.
      * number
Inner hit starting document offset.
Default value is `0`.
      * collapse  object
      * docvalue_fields  array[object]
A reference to a field with formatting instructions on how to return the value
A reference to a field with formatting instructions on how to return the value
A reference to a field with formatting instructions on how to return the value
      * explain  boolean
      * ignore_unmapped  boolean
      * script_fields  object
Hide script_fields attribute Show script_fields attribute object
        * object Additional properties
      * seq_no_primary_term  boolean
      * array[string]
Path to field or array of paths. Some API's support wildcards in the path to select multiple fields.
      * array[object]
A reference to a field with formatting instructions on how to return the value
A reference to a field with formatting instructions on how to return the value
A reference to a field with formatting instructions on how to return the value
      * _source 
      * stored_fields 
      * track_scores  boolean
Default value is `false`.
      * version  boolean
    * rescore_vector  object Generally available; Added in 8.18.0
Apply oversampling and rescoring to quantized vectors
Hide rescore_vector attribute Show rescore_vector attribute object
      * oversample  number Required
Applies the specified oversample factor to k on the approximate kNN search
    * string
  * object Generally available; Added in 8.8.0
The Reciprocal Rank Fusion (RRF) to use.
Hide rank attribute Show rank attribute object
    * object
The reciprocal rank fusion parameters
Hide rrf attributes Show rrf attributes object
      * rank_constant  number
How much influence documents in individual result sets per query have over the final ranked result set
      * rank_window_size  number
Size of the individual result sets per query
  * min_score  number
The minimum `_score` for matching documents. Documents with a lower `_score` are not included in search results and results collected by aggregations.
  * post_filter  object
Use the `post_filter` parameter to filter search results. The search hits are filtered after the aggregations are calculated. A post filter has no impact on the aggregation results.
  * profile  boolean
Set to `true` to return detailed timing information about the execution of individual components in a search request. NOTE: This is a debugging tool and adds significant overhead to search execution.
Default value is `false`.
  * object
The search definition using the Query DSL.
  * rescore  object | array[object]
Can be used to improve precision by reordering just the top (for example 100 - 500) documents returned by the `query` and `post_filter` phases.
Hide attributes Show attributes
    * window_size  number
    * object
Hide query attributes Show query attributes object
      * rescore_query  object Required
The query to use for rescoring. This query is only run on the Top-K results returned by the `query` and `post_filter` phases.
      * query_weight  number
Relative importance of the original query versus the rescore query.
Default value is `1`.
      * rescore_query_weight  number
Relative importance of the rescore query versus the original query.
Default value is `1`.
      * score_mode  string
Determines how scores are combined.
Supported values include:
        * `avg`: Average the original score and the rescore query score.
        * `max`: Take the max of original score and the rescore query score.
        * `min`: Take the min of the original score and the rescore query score.
        * `multiply`: Multiply the original score by the rescore query score. Useful for `function` query rescores.
        * `total`: Add the original score and the rescore query score.
Values are `avg`, `max`, `min`, `multiply`, or `total`.
    * learning_to_rank  object
Hide learning_to_rank attributes Show learning_to_rank attributes object
      * model_id  string Required
The unique identifier of the trained model uploaded to Elasticsearch
      * object
Named parameters to be passed to the query templates used for feature
Hide params attribute Show params attribute object
        * object Additional properties
    * object
Hide script attribute Show script attribute object
      * object Required
Hide attributes Show attributes object
    * window_size  number
    * object
Hide query attributes Show query attributes object
      * query_weight  number
Relative importance of the original query versus the rescore query.
Default value is `1`.
      * rescore_query_weight  number
Relative importance of the rescore query versus the original query.
Default value is `1`.
    * learning_to_rank  object
Hide learning_to_rank attributes Show learning_to_rank attributes object
      * model_id  string Required
The unique identifier of the trained model uploaded to Elasticsearch
      * object
Named parameters to be passed to the query templates used for feature
    * object
  * retriever  object Generally available; Added in 8.14.0
A retriever is a specification to describe top documents returned from a search. A retriever replaces other elements of the search API that also return top documents such as `query` and `knn`.
Hide retriever attributes Show retriever attributes object
    * standard  object
A retriever that replaces the functionality of a traditional query.
Hide standard attributes Show standard attributes object
      * object | array[object]
Query to filter the documents that can match.
An Elasticsearch Query DSL (Domain Specific Language) object that defines a query.
An Elasticsearch Query DSL (Domain Specific Language) object that defines a query.
      * min_score  number
Minimum _score for matching documents. Documents with a lower _score are not included in the top documents.
      * string
Retriever name.
      * object
Defines a query to retrieve a set of top documents.
      * search_after  array[number | string | boolean | null]
Defines a search after object parameter used for pagination.
      * terminate_after  number
Maximum number of documents to collect for each shard.
      * collapse  object
Collapses the top documents by a specified key into a single top document per key.
    * object
A retriever that replaces the functionality of a knn search.
Hide knn attributes Show knn attributes object
      * object | array[object]
Query to filter the documents that can match.
An Elasticsearch Query DSL (Domain Specific Language) object that defines a query.
An Elasticsearch Query DSL (Domain Specific Language) object that defines a query.
      * min_score  number
Minimum _score for matching documents. Documents with a lower _score are not included in the top documents.
      * string
Retriever name.
      * string Required
The name of the vector field to search against.
      * query_vector  array[number]
Query vector. Must have the same number of dimensions as the vector field you are searching against. You must provide a query_vector_builder or query_vector, but not both.
      * query_vector_builder  object
Defines a model to build a query vector.
      * number Required
Number of nearest neighbors to return as top hits.
      * num_candidates  number
Number of nearest neighbor candidates to consider per shard.
      * visit_percentage  number Generally available; Added in 9.2.0
The percentage of vectors to explore per shard while doing knn search with bbq_disk
      * similarity  number
The minimum similarity required for a document to be considered a match.
      * rescore_vector  object Generally available; Added in 8.18.0
Apply oversampling and rescoring to quantized vectors
    * object
A retriever that produces top documents from reciprocal rank fusion (RRF).
Hide rrf attributes Show rrf attributes object
      * object | array[object]
Query to filter the documents that can match.
An Elasticsearch Query DSL (Domain Specific Language) object that defines a query.
An Elasticsearch Query DSL (Domain Specific Language) object that defines a query.
      * min_score  number
Minimum _score for matching documents. Documents with a lower _score are not included in the top documents.
      * string
Retriever name.
      * retrievers  array[object] Required
A list of child retrievers to specify which sets of returned top documents will have the RRF formula applied to them. Each retriever can optionally include a weight parameter.
      * rank_constant  number
This value determines how much influence documents in individual result sets per query have over the final ranked result set.
      * rank_window_size  number
This value determines the size of the individual result sets per query.
      * string
      * array[string]
    * text_similarity_reranker  object
A retriever that reranks the top documents based on a reranking model using the InferenceAPI
Hide text_similarity_reranker attributes Show text_similarity_reranker attributes object
      * object | array[object]
Query to filter the documents that can match.
An Elasticsearch Query DSL (Domain Specific Language) object that defines a query.
An Elasticsearch Query DSL (Domain Specific Language) object that defines a query.
      * min_score  number
Minimum _score for matching documents. Documents with a lower _score are not included in the top documents.
      * string
Retriever name.
      * retriever  object Required
The nested retriever which will produce the first-level results, that will later be used for reranking.
      * rank_window_size  number
This value determines how many documents we will consider from the nested retriever.
      * inference_id  string
Unique identifier of the inference endpoint created using the inference API.
      * inference_text  string Required
The text snippet used as the basis for similarity comparison.
      * string Required
The document field to be used for text similarity comparisons. This field should contain the text that will be evaluated against the inference_text.
      * chunk_rescorer  object Generally available; Added in 9.2.0
Whether to rescore on only the best matching chunks.
    * object
A retriever that replaces the functionality of a rule query.
Hide rule attributes Show rule attributes object
      * object | array[object]
Query to filter the documents that can match.
An Elasticsearch Query DSL (Domain Specific Language) object that defines a query.
An Elasticsearch Query DSL (Domain Specific Language) object that defines a query.
      * min_score  number
Minimum _score for matching documents. Documents with a lower _score are not included in the top documents.
      * string
Retriever name.
      * ruleset_ids  string | array[string] Required
The ruleset IDs containing the rules this retriever is evaluating against.
      * match_criteria  object Required
The match criteria that will determine if a rule in the provided rulesets should be applied.
      * retriever  object Required
The retriever whose results rules should be applied to.
      * rank_window_size  number
This value determines the size of the individual result set.
    * rescorer  object
A retriever that re-scores only the results produced by its child retriever.
Hide rescorer attributes Show rescorer attributes object
      * object | array[object]
Query to filter the documents that can match.
An Elasticsearch Query DSL (Domain Specific Language) object that defines a query.
An Elasticsearch Query DSL (Domain Specific Language) object that defines a query.
      * min_score  number
Minimum _score for matching documents. Documents with a lower _score are not included in the top documents.
      * string
Retriever name.
      * retriever  object Required
Inner retriever.
      * rescore  array[object]
    * object
A retriever that supports the combination of different retrievers through a weighted linear combination.
Hide linear attributes Show linear attributes object
      * object | array[object]
Query to filter the documents that can match.
An Elasticsearch Query DSL (Domain Specific Language) object that defines a query.
An Elasticsearch Query DSL (Domain Specific Language) object that defines a query.
      * min_score  number
Minimum _score for matching documents. Documents with a lower _score are not included in the top documents.
      * string
Retriever name.
      * retrievers  array[object]
Inner retrievers.
      * rank_window_size  number
      * string
      * array[string]
      * normalizer  string
Values are `none`, `minmax`, or `l2_norm`.
    * object
A pinned retriever applies pinned documents to the underlying retriever. This retriever will rewrite to a PinnedQueryBuilder.
Hide pinned attributes Show pinned attributes object
      * object | array[object]
Query to filter the documents that can match.
An Elasticsearch Query DSL (Domain Specific Language) object that defines a query.
An Elasticsearch Query DSL (Domain Specific Language) object that defines a query.
      * min_score  number
Minimum _score for matching documents. Documents with a lower _score are not included in the top documents.
      * string
Retriever name.
      * retriever  object Required
Inner retriever.
      * array[string]
      * array[object]
      * rank_window_size  number
    * diversify  object
A retriever that diversifies the results from its child retriever.
Hide diversify attributes Show diversify attributes object
      * object | array[object]
Query to filter the documents that can match.
An Elasticsearch Query DSL (Domain Specific Language) object that defines a query.
An Elasticsearch Query DSL (Domain Specific Language) object that defines a query.
      * min_score  number
Minimum _score for matching documents. Documents with a lower _score are not included in the top documents.
      * string
Retriever name.
      * string Required
The diversification strategy to apply.
Value is `mmr`.
      * string Required
The document field on which to diversify results on.
      * retriever  object Required
The nested retriever whose results will be diversified.
      * number
The number of top documents to return after diversification.
      * rank_window_size  number
The number of top documents from the nested retriever to consider for diversification.
      * query_vector  array[number]
The query vector used for diversification.
      * query_vector_builder  object
a dense vector query vector builder to use instead of a static query_vector
      * number
Controls the trade-off between relevance and diversity for MMR. A value of 0.0 focuses solely on diversity, while a value of 1.0 focuses solely on relevance. Required for MMR
  * script_fields  object
Retrieve a script evaluation (based on different fields) for each hit.
Hide script_fields attribute Show script_fields attribute object
    * object Additional properties
Hide * attributes Show * attributes object
      * object Required
Hide script attributes Show script attributes object
        * string | object
The script source.
        * string
The `id` for a stored script.
        * object
Specifies any named parameters that are passed into the script as variables. Use parameters instead of hard-coded values to decrease compile time.
Hide params attribute Show params attribute object
          * object Additional properties
        * string
Specifies the language the script is written in.
Supported values include:
          * `painless`: Painless scripting language, purpose-built for Elasticsearch.
          * `expression`: Lucene’s expressions language, compiles a JavaScript expression to bytecode.
          * `mustache`: Mustache templated, used for templates.
          * `java`: Expert Java API
Values are `painless`, `expression`, `mustache`, or `java`.
        * options  object
Hide options attribute Show options attribute object
          * string Additional properties
      * ignore_failure  boolean
  * search_after  array[number | string | boolean | null]
Used to retrieve the next page of hits using a set of sort values from the previous page.
  * number
The number of hits to return, which must not be negative. By default, you cannot page through more than 10,000 hits using the `from` and `size` parameters. To page through more hits, use the `search_after` property.
Default value is `10`.
  * object
Split a scrolled search into multiple slices that can be consumed independently.
Hide slice attributes Show slice attributes object
    * string
Path to field or array of paths. Some API's support wildcards in the path to select multiple fields.
    * string Required
    * number Required
  * string | object | array[string | object]
A comma-separated list of : pairs.
Path to field or array of paths. Some API's support wildcards in the path to select multiple fields.
Hide attributes Show attributes
    * object
    * object
    * _geo_distance  object
Hide _geo_distance attribute Show _geo_distance attribute object
      * ignore_unmapped  boolean
    * _script  object
  * _source  boolean | object
The source fields that are returned for matching documents. These fields are returned in the `hits._source` property of the search response. If the `stored_fields` property is specified, the `_source` property defaults to `false`. Otherwise, it defaults to `true`.
Hide attributes Show attributes
    * exclude_vectors  boolean
If `true`, vector fields are excluded from the returned source.
This option takes precedence over `includes`: any vector field will remain excluded even if it matches an `includes` rule.
    * excludes  string | array[string]
A list of fields to exclude from the returned source.
Path to field or array of paths. Some API's support wildcards in the path to select multiple fields.
Path to field or array of paths. Some API's support wildcards in the path to select multiple fields.
    * includes  string | array[string]
A list of fields to include in the returned source.
Path to field or array of paths. Some API's support wildcards in the path to select multiple fields.
Path to field or array of paths. Some API's support wildcards in the path to select multiple fields.
  * array[object]
An array of wildcard (`*`) field patterns. The request returns values for field names matching these patterns in the `hits.fields` property of the response.
Hide fields attributes Show fields attributes object
A reference to a field with formatting instructions on how to return the value
    * string Required
A wildcard pattern. The request returns values for field names matching this pattern.
    * string
The format in which the values are returned.
    * include_unmapped  boolean
  * suggest  object
Defines a suggester that provides similar looking terms based on a provided text.
Hide suggest attribute Show suggest attribute object
    * string
Global suggest text, to avoid repetition when the same text is used in several suggesters
  * terminate_after  number
The maximum number of documents to collect for each shard. If a query reaches this limit, Elasticsearch terminates the query early. Elasticsearch collects documents before sorting.
IMPORTANT: Use with caution. Elasticsearch applies this property to each shard handling the request. When possible, let Elasticsearch perform early termination automatically. Avoid specifying this property for requests that target data streams with backing indices across multiple data tiers.
If set to `0` (default), the query does not terminate early.
Default value is `0`.
  * timeout  string
The period of time to wait for a response from each shard. If no response is received before the timeout expires, the request fails and returns an error. Defaults to no timeout.
  * track_scores  boolean
If `true`, calculate and return document scores, even if the scores are not used for sorting.
Default value is `false`.
  * version  boolean
If `true`, the request returns the document version as part of a hit.
Default value is `false`.
  * seq_no_primary_term  boolean
If `true`, the request returns sequence number and primary term of the last modification of each hit.
  * stored_fields  string | array[string]
A comma-separated list of stored fields to return as part of a hit. If no fields are specified, no stored fields are included in the response. If this field is specified, the `_source` property defaults to `false`. You can pass `_source: true` to return both source fields and stored fields in the search response.
Path to field or array of paths. Some API's support wildcards in the path to select multiple fields.
Path to field or array of paths. Some API's support wildcards in the path to select multiple fields.
  * object
Limit the search to a point in time (PIT). If you provide a PIT, you cannot specify an `<index>` in the request path.
Hide pit attributes Show pit attributes object
    * string Required
    * keep_alive  string
A duration. Units can be `nanos`, `micros`, `ms` (milliseconds), `s` (seconds), `m` (minutes), `h` (hours) and `d` (days). Also accepts "0" without a unit and "-1" to indicate an unspecified value.
  * runtime_mappings  object
One or more runtime fields in the search request. These fields take precedence over mapped fields with the same name.
Hide runtime_mappings attribute Show runtime_mappings attribute object
    * object Additional properties
Hide * attributes Show * attributes object
      * object
For type `composite`
Hide fields attribute Show fields attribute object
        * object Additional properties
Hide * attribute Show * attribute object
          * string Required
Values are `boolean`, `composite`, `date`, `double`, `geo_point`, `geo_shape`, `ip`, `keyword`, `long`, or `lookup`.
Show more
      * fetch_fields  array[object]
For type `lookup`
Hide fetch_fields attributes Show fetch_fields attributes object
        * string Required
Path to field or array of paths. Some API's support wildcards in the path to select multiple fields.
        * string
      * string
A custom format for `date` type runtime fields.
      * input_field  string
For type `lookup`
      * target_field  string
For type `lookup`
      * target_index  string
For type `lookup`
      * object
Painless script executed at query time.
Hide script attributes Show script attributes object
        * source 
        * string
The `id` for a stored script.
        * object
Specifies any named parameters that are passed into the script as variables. Use parameters instead of hard-coded values to decrease compile time.
Hide params attribute Show params attribute object
          * object Additional properties
        * options  object
Hide options attribute Show options attribute object
          * string Additional properties
      * on_script_error  string
Values are `fail` or `continue`.
      * string Required
Field type, which can be: `boolean`, `composite`, `date`, `double`, `geo_point`, `ip`,`keyword`, `long`, or `lookup`.
Values are `boolean`, `composite`, `date`, `double`, `geo_point`, `geo_shape`, `ip`, `keyword`, `long`, or `lookup`.
  * array[string]
The stats groups to associate with the search. Each group maintains a statistics aggregation for its associated searches. You can retrieve these stats using the indices stats API.


###  Responses 
  * application/json
Hide response attributes Show response attributes object
    * number Required
The number of milliseconds it took Elasticsearch to run the request. This value is calculated by measuring the time elapsed between receipt of a request on the coordinating node and the time at which the coordinating node is ready to send the response. It includes:
      * Communication time between the coordinating node and data nodes
      * Time the request spends in the search thread pool, queued for execution
      * Actual run time
It does not include:
      * Time needed to send the request to Elasticsearch
      * Time needed to serialize the JSON response
      * Time needed to send the response to a client
    * timed_out  boolean Required
If `true`, the request timed out before completion; returned results may be partial or empty.
    * _shards  object Required
A count of shards used for the request.
Hide _shards attributes Show _shards attributes object
      * number Required
The number of shards the operation or search attempted to run on but failed.
      * successful  number Required
The number of shards the operation or search succeeded on.
      * number Required
The number of shards the operation or search will run on overall.
      * failures  array[object]
Hide failures attributes Show failures attributes object
        * string
        * string
        * object Required
Cause and details about a request failure. This class defines the properties common to all error types. Additional details are also provided, that depend on the error type.
        * number
        * string
        * primary  boolean
      * skipped  number
    * object Required
The returned documents and metadata.
Hide hits attributes Show hits attributes object
      * object | number
Total hit count information, present only if `track_total_hits` wasn't `false` in the search request.
Hide attributes Show attributes
        * relation  string Required
Supported values include:
          * `eq`: Accurate
          * `gte`: Lower bound, including returned events or sequences
Values are `eq` or `gte`.
        * number Required
      * array[object] Required
Hide hits attributes Show hits attributes object
        * string Required
        * string
        * number | string | null
        * _explanation  object
        * object
Hide fields attribute Show fields attribute object
          * object Additional properties
        * highlight  object
Hide highlight attribute Show highlight attribute object
          * array[string] Additional properties
        * inner_hits  object
Hide inner_hits attribute Show inner_hits attribute object
          * object Additional properties
        * matched_queries  array[string] | object
        * _nested  object
        * _ignored  array[string]
        * ignored_field_values  object
Hide ignored_field_values attribute Show ignored_field_values attribute object
          * array[object] Additional properties
        * string
        * string
        * _routing  string
        * _source  object
        * number
        * _seq_no  number
        * _primary_term  number
        * _version  number
        * array[number | string | boolean | null]
A field value.
      * max_score  number | string | null
    * aggregations  object
    * _clusters  object
Hide _clusters attributes Show _clusters attributes object
      * skipped  number Required
      * successful  number Required
      * number Required
      * running  number Required
      * partial  number Required
      * number Required
      * details  object
Hide details attribute Show details attribute object
        * object Additional properties
Hide * attributes Show * attributes object
          * string Required
Values are `running`, `successful`, `partial`, `skipped`, or `failed`.
          * indices  string Required
          * timed_out  boolean Required
          * _shards  object
          * failures  array[object]
    * object
Hide fields attribute Show fields attribute object
      * object Additional properties
    * max_score  number
    * num_reduce_phases  number
    * profile  object
Hide profile attributes Show profile attributes object
      * array[object] Required
Hide shards attributes Show shards attributes object
        * aggregations  array[object] Required
        * cluster  string Required
        * object
        * object
        * string Required
        * string Required
        * node_id  string Required
        * searches  array[object] Required
        * shard_id  number Required
      * request  object
When profiling is enabled, the original query source and target indices from the coordinating request.
Hide request attributes Show request attributes object
        * object
Original query source from the search request (`SearchSourceBuilder` as JSON).
        * indices  array[string]
Target index expressions from the request (before index resolution).
    * string
An updated identifier for the point-in-time that was searched.
IMPORTANT: Each search request against a PIT returns in its response a `pit_id` field which may be different from the identifier you originally supplied. Always use the most recently-received PIT identifier for the next request. If you make concurrent search requests against the same PIT, Elasticsearch can return several different `pit_id` values in its responses. In that case, use any of these values for later requests, preferring more recently-received values whenever possible.
    * _scroll_id  string
The identifier for the search and its search context. You can use this scroll ID with the scroll API to retrieve the next batch of search results for the request. This property is returned only if the `scroll` query parameter is specified in the request.
    * suggest  object
Hide suggest attribute Show suggest attribute object
      * array[object] Additional properties
Hide attributes Show attributes
        * number Required
        * number Required
        * string Required
        * options 
Hide attributes Show attributes
        * number Required
        * number Required
        * string Required
        * options 
Hide attributes Show attributes
        * number Required
        * number Required
        * string Required
        * options 
    * terminated_early  boolean


