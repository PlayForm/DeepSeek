**WARNING** : Deprecated in 7.15.0. 
The Java REST Client is deprecated in favor of the [Java API Client](https://www.elastic.co/guide/en/elasticsearch/client/java-api-client/current/index.html). 
[« Ranking Evaluation API](https://www.elastic.co/guide/en/elasticsearch/client/java-rest/current/java-rest-high-rank-eval.html)
›[Java REST Client [7.17]](https://www.elastic.co/guide/en/elasticsearch/client/java-rest/current/index.html) ›[Java High Level REST Client](https://www.elastic.co/guide/en/elasticsearch/client/java-rest/current/java-rest-high.html) ›
#  Explain API
[edit](https://github.com/elastic/elasticsearch/edit/7.17/docs/java-rest/high-level/search/explain.asciidoc "Edit this page on GitHub")
**IMPORTANT** : This documentation is no longer updated. Refer to [Elastic's version policy](https://www.elastic.co/support/eol) and the [latest documentation](https://www.elastic.co/docs). 
##  Explain API
The explain api computes a score explanation for a query and a specific document. This can give useful feedback whether a document matches or didn’t match a specific query.
##  Explain Request
An `ExplainRequest` expects an `index` and an `id` to specify a certain document, and a query represented by `QueryBuilder` to run against it (the way of [building queries](https://www.elastic.co/guide/en/elasticsearch/client/java-rest/current/java-rest-high-query-builders.html "Building Queries")).

```
ExplainRequest request =newExplainRequest("contributors","1");
request.query(QueryBuilders.termQuery("user","tanguy"));
```

###  Optional arguments

```
request.routing("routing");
```
  
|  Set a routing parameter  |  
| --- |  

```
request.preference("_local");
```
  
|  Use the preference parameter e.g. to execute the search to prefer local shards. The default is to randomize across shards.  |  
| --- |  

```
request.fetchSourceContext(newFetchSourceContext(true,newString[]{"user"},null));
```
  
|  Set to true to retrieve the _source of the document explained. You can also retrieve part of the document by using _source_include & _source_exclude (see [Get API](https://www.elastic.co/guide/en/elasticsearch/client/java-rest/current/java-rest-high-document-get.html#java-rest-high-document-get-request-optional-arguments "Optional arguments") for more details)  |  
| --- |  

```
request.storedFields(newString[]{"user"});
```
  
|  Allows to control which stored fields to return as part of the document explained (requires the field to be stored separately in the mappings).  |  
| --- |  
##  Synchronous Execution
The `explain` method executes the request synchronously:

```
ExplainResponse response = client.explain(request,RequestOptions.DEFAULT);
```

##  Asynchronous Execution
The `explainAsync` method executes the request asynchronously, calling the provided `ActionListener` when the response is ready:

```
client.explainAsync(request,RequestOptions.DEFAULT, listener);
```
  
|  The `ExplainRequest` to execute and the `ActionListener` to use when the execution completes.  |  
| --- |  
The asynchronous method does not block and returns immediately. Once the request completes, the `ActionListener` is called back using the `onResponse` method if the execution successfully completed or using the `onFailure` method if it failed.
A typical listener for `ExplainResponse` is constructed as follows:

```
ActionListenerExplainResponse listener =newActionListenerExplainResponse>(){@Overridepublicvoid onResponse(ExplainResponse explainResponse){}@Overridepublicvoid onFailure(Exception e){}};
```
  
|  Called when the execution is successfully completed.  |  
| --- |  
|  Called when the whole `ExplainRequest` fails.  |  
##  ExplainResponse
The `ExplainResponse` contains the following information:

```
String index = response.getIndex();String id = response.getId();boolean exists = response.isExists();boolean match = response.isMatch();boolean hasExplanation = response.hasExplanation();Explanation explanation = response.getExplanation();GetResult getResult = response.getGetResult();
```
  
|  The index name of the explained document.  |  
| --- |  
|  The id of the explained document.  |  
|  Indicates whether or not the explained document exists.  |  
|  Indicates whether or not there is a match between the explained document and the provided query (the `match` is retrieved from the lucene `Explanation` behind the scenes if the lucene `Explanation` models a match, it returns `true`, otherwise it returns `false`).  |  
|  Indicates whether or not there exists a lucene `Explanation` for this request.  |  
|  Get the lucene `Explanation` object if there exists.  |  
|  Get the `GetResult` object if the `_source` or the stored fields are retrieved.  |  
The `GetResult` contains two maps internally to store the fetched `_source` and stored fields. You can use the following methods to get them:

```
MapString,Object source = getResult.getSource();MapString,DocumentField fields = getResult.getFields();
```
  
|  Retrieve the `_source` as a map.  |  
| --- |  
|  Retrieve the specified stored fields as a map.  |  
[« Ranking Evaluation API](https://www.elastic.co/guide/en/elasticsearch/client/java-rest/current/java-rest-high-rank-eval.html)
