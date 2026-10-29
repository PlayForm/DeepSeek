##  Explain a document match result  Generally available
Ask AI 
  * [ Copy as Markdown ](https://www.elastic.co/docs/api/doc/elasticsearch-serverless/operation/operation-explain)


POST  /{index}/_explain/{id} 
**All methods and paths for this operation:**
GET /{index}/_explain/{id}
POST /{index}/_explain/{id}
Get information about why a specific document matches, or doesn't match, a query. It computes a score explanation for a query and a specific document.
###  Required authorization 
  * Index privileges: `read`


####  Path parameters 
  * string Required
Index names that are used to limit the request. Only a single index name can be provided to this parameter.
  * string Required
The document identifier.


####  Query parameters 
  * analyzer  string
The analyzer to use for the query string. This parameter can be used only when the `q` query string parameter is specified.
  * analyze_wildcard  boolean
If `true`, wildcard and prefix queries are analyzed. This parameter can be used only when the `q` query string parameter is specified.
Default value is `false`.
  * default_operator  string
The default operator for query string query: `and` or `or`. This parameter can be used only when the `q` query string parameter is specified.
Default value is `or`.
  * string
The field to use as default where no field prefix is given in the query string. This parameter can be used only when the `q` query string parameter is specified.
  * lenient  boolean
If `true`, format-based query failures (such as providing text to a numeric field) in the query string will be ignored. This parameter can be used only when the `q` query string parameter is specified.
Default value is `false`.
  * preference  string
The node or shard the operation should be performed on. It is random by default.
  * routing  string | array[string]
A custom value used to route operations to a specific shard. Not allowed when `index.slice.enabled` is `true` for the target index; use `_slice` instead.
  * _source  boolean | string | array[string]
`True` or `false` to return the `_source` field or not or a list of fields to return.
  * _source_excludes  string | array[string]
A comma-separated list of source fields to exclude from the response. You can also use this parameter to exclude fields from the subset specified in `_source_includes` query parameter. If the `_source` parameter is `false`, this parameter is ignored.
  * _source_includes  string | array[string]
A comma-separated list of source fields to include in the response. If this parameter is specified, only these source fields are returned. You can exclude fields from this subset using the `_source_excludes` query parameter. If the `_source` parameter is `false`, this parameter is ignored.
  * stored_fields  string | array[string]
A comma-separated list of stored fields to return in the response.
  * string
The query in the Lucene query string syntax.


#### 
  * object
Defines the search definition using the Query DSL.


###  Responses 
  * application/json
Hide response attributes Show response attributes object
    * string Required
    * string Required
    * matched  boolean Required
    * explanation  object
Hide explanation attributes Show explanation attributes object
      * description  string Required
      * details  array[object]
      * number Required
    * object
Hide get attributes Show get attributes object
      * object
Hide fields attribute Show fields attribute object
        * object Additional properties
      * boolean Required
      * _seq_no  number
      * _primary_term  number
      * _routing  string | array[string]
      * _source  object


