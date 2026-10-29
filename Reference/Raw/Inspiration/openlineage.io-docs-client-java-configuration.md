[Skip to main content](https://openlineage.io/docs/client/java/configuration/#__docusaurus_skipToContent_fallback)
Version: 1.54.0
On this page
We recommend configuring the client with an `openlineage.yml` file that contains all the details of how to connect to your OpenLineage backend.
See [example configurations.](https://openlineage.io/docs/client/java/configuration/#transports)
You can make this file available to the client in three ways (the list also presents precedence of the configuration):
  1. Set an `OPENLINEAGE_CONFIG` environment variable to a file path: `OPENLINEAGE_CONFIG=path/to/openlineage.yml`.
  2. Place an `openlineage.yml` in the user's current working directory.
  3. Place an `openlineage.yml` under `.openlineage/` in the user's home directory (`~/.openlineage/openlineage.yml`).


## Environment Variables[​](https://openlineage.io/docs/client/java/configuration/#environment-variables "Direct link to Environment Variables")
The following environment variables are available:  
| Name  | Description  | Since  |  
| --- | --- | --- |  
| OPENLINEAGE_CONFIG  | The path to the YAML configuration file. Example: `path/to/openlineage.yml`  |  
| OPENLINEAGE_DISABLED  | When `true`, OpenLineage will not emit events.  | 0.9.0  |  
You can also configure the client with dynamic environment variables.
The OpenLineage client supports configuration through dynamic environment variables.
### Configuring OpenLineage Client via Dynamic Environment Variables[​](https://openlineage.io/docs/client/java/configuration/#configuring-openlineage-client-via-dynamic-environment-variables "Direct link to Configuring OpenLineage Client via Dynamic Environment Variables")
These environment variables must begin with `OPENLINEAGE__`, followed by sections of the configuration separated by a double underscore `__`. All values in the environment variables are automatically converted to lowercase, and variable names using snake_case (single underscore) are converted into camelCase within the final configuration.
#### Key Features[​](https://openlineage.io/docs/client/java/configuration/#key-features "Direct link to Key Features")
  1. Prefix Requirement: All environment variables must begin with `OPENLINEAGE__`.
  2. Sections Separation: Configuration sections are separated using double underscores `__` to form the hierarchy.
  3. Lowercase Conversion: Environment variable values are automatically converted to lowercase.
  4. CamelCase Conversion: Any environment variable name using single underscore `_` will be converted to camelCase in the final configuration.
  5. JSON String Support: You can pass a JSON string at any level of the configuration hierarchy, which will be merged into the final configuration structure.
  6. Hyphen Restriction: You cannot use `-` in environment variable names. If a name strictly requires a hyphen, use a JSON string as the value of the environment variable.
  7. Precedence Rules:


  * Top-level keys have precedence and will not be overwritten by more nested entries.
  * For example, `OPENLINEAGE__TRANSPORT='{..}'` will not have its keys overwritten by `OPENLINEAGE__TRANSPORT__AUTH__KEY='key'`.


#### Examples[​](https://openlineage.io/docs/client/java/configuration/#examples "Direct link to Examples")
  * Basic Example
  * Composite Example
  * Precedence Example
  * Spark Example
  * Namespace Resolvers Example


Setting following environment variables:

```


OPENLINEAGE__TRANSPORT__TYPE=http




OPENLINEAGE__TRANSPORT__URL=http://localhost:5050




OPENLINEAGE__TRANSPORT__ENDPOINT=/api/v1/lineage




OPENLINEAGE__TRANSPORT__AUTH__TYPE=api_key




OPENLINEAGE__TRANSPORT__AUTH__API_KEY=random_token




OPENLINEAGE__TRANSPORT__COMPRESSION=gzip


```

is equivalent to passing following YAML configuration:

```


transport:




type: http




url: http://localhost:5050




endpoint: api/v1/lineage




auth:




type: api_key




apiKey: random_token




compression: gzip


```

Setting following environment variables:

```


OPENLINEAGE__TRANSPORT__TYPE=composite




OPENLINEAGE__TRANSPORT__TRANSPORTS__FIRST__TYPE=http




OPENLINEAGE__TRANSPORT__TRANSPORTS__FIRST__URL=http://localhost:5050




OPENLINEAGE__TRANSPORT__TRANSPORTS__FIRST__ENDPOINT=/api/v1/lineage




OPENLINEAGE__TRANSPORT__TRANSPORTS__FIRST__AUTH__TYPE=api_key




OPENLINEAGE__TRANSPORT__TRANSPORTS__FIRST__AUTH__API_KEY=random_token




OPENLINEAGE__TRANSPORT__TRANSPORTS__FIRST__AUTH__COMPRESSION=gzip




OPENLINEAGE__TRANSPORT__TRANSPORTS__SECOND__TYPE=console


```

is equivalent to passing following YAML configuration:

```


transport:




type: composite




transports:




first:




type: http




url: http://localhost:5050




endpoint: api/v1/lineage




auth:




type: api_key




apiKey: random_token




compression: gzip




second:




type: console


```

Setting following environment variables:

```


OPENLINEAGE__TRANSPORT='{"type":"console"}'




OPENLINEAGE__TRANSPORT__TYPE=http


```

is equivalent to passing following YAML configuration:

```


transport:




type: console


```

Setting following environment variables:

```


OPENLINEAGE__TRANSPORT__TYPE=kafka




OPENLINEAGE__TRANSPORT__TOPIC_NAME=test




OPENLINEAGE__TRANSPORT__MESSAGE_KEY=explicit-key




OPENLINEAGE__TRANSPORT__PROPERTIES='{"key.serializer": "org.apache.kafka.common.serialization.StringSerializer"}'


```

is equivalent to passing following YAML configuration:

```


transport:




type: kafka




topicName: test




messageKey: explicit-key




properties:




key.serializer: org.apache.kafka.common.serialization.StringSerializer


```

Please note that you can't use environment variables to set Spark properties, as they are not part of the configuration hierarchy. Following environment variable:

```


OPENLINEAGE__TRANSPORT__PROPERTIES__KEY__SERIALIZER="org.apache.kafka.common.serialization.StringSerializer"


```

would be equivalent to below YAML structure:

```


transport:




properties:





serializer: org.apache.kafka.common.serialization.StringSerializer


```

which is not a valid configuration for Spark.
Setting following environment variables:

```


OPENLINEAGE__DATASET__NAMESPACE_RESOLVERS__RESOLVED_NAME__TYPE=hostList




OPENLINEAGE__DATASET__NAMESPACE_RESOLVERS__RESOLVED_NAME__HOSTS='["kafka-prod13.company.com", "kafka-prod15.company.com"]'




OPENLINEAGE__DATASET__NAMESPACE_RESOLVERS__RESOLVED_NAME__SCHEMA=kafka


```

is equivalent to passing following YAML configuration:

```


dataset:




namespaceResolvers:




resolvedName:




type: hostList




hosts:




- kafka-prod13.company.com




- kafka-prod15.company.com




schema: kafka


```

## Facets Configuration[​](https://openlineage.io/docs/client/java/configuration/#facets-configuration "Direct link to Facets Configuration")
In YAML configuration file you can also disable facets to filter them out from the OpenLineage event.
_YAML Configuration_

```


transport:




type: console




facets:




spark_unknown:




disabled:true




"spark.logicalPlan":




disabled:true


```

### Deprecated and removed syntax[​](https://openlineage.io/docs/client/java/configuration/#deprecated-and-removed-syntax "Direct link to Deprecated and removed syntax")
The following syntax was deprecated and got removed:

```


facets:




disabled:




- spark_unknown




- spark.logicalPlan


```

Please be aware that this syntax is not working anymore.
## Transports[​](https://openlineage.io/docs/client/java/configuration/#transports "Direct link to Transports")
**Tip:** See current list of [all supported transports](https://github.com/OpenLineage/OpenLineage/tree/main/client/java/src/main/java/io/openlineage/client/transports).
Allows sending events to HTTP endpoint, using [ApacheHTTPClient](https://hc.apache.org/index.html).
#### Configuration[​](https://openlineage.io/docs/client/java/configuration/#configuration "Direct link to Configuration")
  * `type` - string, must be `"http"`. Required.
  * `url` - string, base url for HTTP requests. Required. A `unix://` url (e.g. `unix:///var/run/some.socket`) sends events over a Unix Domain Socket instead of TCP (**requires Java 16 or later**) — see [Unix Domain Socket](https://openlineage.io/docs/client/java/configuration/#unix-domain-socket) below.
  * `endpoint` - string specifying the endpoint to which events are sent, appended to `url`. Optional, default: `/api/v1/lineage`.
  * `urlParams` - dictionary specifying query parameters send in HTTP requests. Optional.
  * `timeoutInMillis` - integer specifying timeout (in milliseconds) value used while connecting to server. Optional, default: `5000`.
  * `auth` - dictionary specifying authentication options. Optional, by default no authorization is used. If set, requires the `type` property. 
    * `type` - string specifying value for one of the out-of-the-box available authentication methods (`api_key`, `jwt` or `oauth2`), or the fully qualified class name of your TokenProvider. Required if `auth` is provided.
    * Configuration options for `api_key` authentication: 
      * `apiKey` - string setting the Authentication HTTP header as the Bearer. Required if `type` is `api_key`.
    * Configuration options for `jwt` authentication are documented in the [JWT Token Provider](https://openlineage.io/docs/client/java/configuration/#jwt-token-provider) section.
    * Configuration options for `oauth2` authentication are documented in the [OAuth2 Token Provider](https://openlineage.io/docs/client/java/configuration/#oauth2-token-provider) section.
  * `headers` - dictionary specifying HTTP request headers. Optional.
  * `compression` - string, name of algorithm used by HTTP client to compress request body. Optional, default value `null`, allowed values: `gzip`. Added in v1.13.0.
  * `proxy` - dictionary specifying outbound proxy settings. Optional. When omitted, JVM system properties (`-Dhttps.proxyHost` / `-Dhttps.proxyPort`) and the `HTTPS_PROXY` environment variable are honoured automatically — see [Proxy](https://openlineage.io/docs/client/java/configuration/#proxy) below. 
    * `host` - string, proxy host name or IP address. Required if `proxy` is set.
    * `port` - integer, proxy port. Optional, default: `8080`.
    * `nonProxyHosts` - string, comma-separated list of host patterns that bypass the proxy (e.g. `"localhost,*.internal"`). Optional.


#### Behavior[​](https://openlineage.io/docs/client/java/configuration/#behavior "Direct link to Behavior")
Events are serialized to JSON, and then are send as HTTP POST request with `Content-Type: application/json`.
#### Unix Domain Socket[​](https://openlineage.io/docs/client/java/configuration/#unix-domain-socket "Direct link to Unix Domain Socket")
Requires Java 16 or later
Unix Domain Socket support uses the JDK-native UDS APIs introduced in Java 16 ([JEP 380](https://openjdk.org/jeps/380)). It is available only when running on **Java 16 or later**. On an older JVM, configuring a `unix://` url fails fast with a clear error, while `http(s)://` urls keep working on every supported Java version.
When `url` uses the `unix://` scheme, the transport sends events over a Unix Domain Socket instead of a TCP connection. This is useful when the collector is reachable only through a local socket — for example a sidecar or daemon exposing an HTTP endpoint over a socket on a Kubernetes node.
The path component of the URL is the socket path (`unix:///var/run/some.socket` → `/var/run/some.socket`). The request is issued against a placeholder `http://localhost/<endpoint>` and tunneled over the socket, so `endpoint`, `headers`, `auth`, `compression`, `urlParams` and `timeoutInMillis` behave exactly as they do for a regular `http(s)` url. TLS is not applied over the local socket.
Because it builds on the JDK-native UDS support, this feature needs no extra dependencies.
#### Proxy[​](https://openlineage.io/docs/client/java/configuration/#proxy "Direct link to Proxy")
The HTTP transport automatically honours the standard JVM proxy system properties when no explicit `proxy` config is set:  
| Property  | Example  |  
| --- | --- |  
| `-Dhttps.proxyHost=squid.internal`  | Proxy host for HTTPS connections  |  
| `-Dhttps.proxyPort=3128`  | Proxy port  |  
| `-Dhttp.proxyHost=squid.internal`  | Proxy host for HTTP connections  |  
| `-Dhttp.proxyPort=3128`  | Proxy port  |  
| `-Dhttp.nonProxyHosts=localhost|*.internal`  | Pipe-separated bypass list  |  
For Spark, set these on both driver and executors via `spark.driver.extraJavaOptions` and `spark.executor.extraJavaOptions`.
If you need to override the proxy per-transport (e.g. when the JVM-wide setting points elsewhere), use the explicit `proxy` config block instead:

```


transport:




type: http




url: https://lineage-endpoint




proxy:




host: squid.internal




port:3128


```

#### Examples[​](https://openlineage.io/docs/client/java/configuration/#examples "Direct link to Examples")
  * Yaml Config
  * Spark Config
  * Flink Config
  * Java Code


Anonymous connection:

```


transport:




type: http




url: http://localhost:5000


```

Unix Domain Socket connection:

```


transport:




type: http




url: unix:///var/run/some.socket




endpoint: /api/v1/lineage


```

With authorization:

```


transport:




type: http




url: http://localhost:5000




auth:




type: api_key




api_key: f38d2189-c603-4b46-bdea-e573a3b5a7d5


```

Full example:

```


transport:




type: http




url: http://localhost:5000




endpoint: /api/v1/lineage




urlParams:




param0: value0




param1: value1




timeoutInMillis:5000




auth:




type: api_key




api_key: f38d2189-c603-4b46-bdea-e573a3b5a7d5




headers:




X-Some-Extra-Header: abc




compression: gzip


```

With proxy:

```


transport:




type: http




url: https://lineage-endpoint




proxy:




host: squid.internal




port:3128


```

Anonymous connection:

```


spark.openlineage.transport.type=http




spark.openlineage.transport.url=http://localhost:5000


```

Unix Domain Socket connection:

```


spark.openlineage.transport.type=http




spark.openlineage.transport.url=unix:///var/run/some.socket




spark.openlineage.transport.endpoint=/api/v1/lineage


```

With authorization:

```


spark.openlineage.transport.type=http




spark.openlineage.transport.url=http://localhost:5000




spark.openlineage.transport.auth.type=api_key




spark.openlineage.transport.auth.apiKey=f38d2189-c603-4b46-bdea-e573a3b5a7d5


```

Full example:

```


spark.openlineage.transport.type=http




spark.openlineage.transport.url=http://localhost:5000




spark.openlineage.transport.endpoint=/api/v1/lineage




spark.openlineage.transport.urlParams.param0=value0




spark.openlineage.transport.urlParams.param1=value1




spark.openlineage.transport.timeoutInMillis=5000




spark.openlineage.transport.auth.type=api_key




spark.openlineage.transport.auth.apiKey=f38d2189-c603-4b46-bdea-e573a3b5a7d5




spark.openlineage.transport.headers.X-Some-Extra-Header=abc




spark.openlineage.transport.compression=gzip


```

With SSL context:

```


spark.openlineage.transport.sslContext.storePassword=...




spark.openlineage.transport.sslContext.keyPassword=...




spark.openlineage.transport.sslContext.keyStoreType=...




spark.openlineage.transport.sslContext.keyStorePath=...


```

where the config contains location of the keystore file, keystore password and its type. It should also contain key password.
With proxy:

```


spark.openlineage.transport.type=http




spark.openlineage.transport.url=https://lineage-endpoint




spark.openlineage.transport.proxy.host=squid.internal




spark.openlineage.transport.proxy.port=3128


```

Or, using JVM system properties (no config change needed):

```


spark.driver.extraJavaOptions=-Dhttps.proxyHost=squid.internal -Dhttps.proxyPort=3128




spark.executor.extraJavaOptions=-Dhttps.proxyHost=squid.internal -Dhttps.proxyPort=3128


```

URL parsing within Spark integration
You can supply http parameters using values in url, the parsed `spark.openlineage.*` properties are located in url as follows:
`{transport.url}/{transport.endpoint}/namespaces/{namespace}/jobs/{parentJobName}/runs/{parentRunId}?app_name={appName}&api_key={transport.apiKey}&timeout={transport.timeout}&xxx={transport.urlParams.xxx}`
example:
`http://localhost:5000/api/v1/namespaces/ns_name/jobs/job_name/runs/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx?app_name=app&api_key=abc&timeout=5000&xxx=xxx`
Anonymous connection:

```


spark.openlineage.transport.type=http




spark.openlineage.transport.url=http://localhost:5000


```

With authorization:

```


openlineage.transport.type=http




openlineage.transport.url=http://localhost:5000




openlineage.transport.auth.type=api_key




openlineage.transport.auth.apiKey=f38d2189-c603-4b46-bdea-e573a3b5a7d5


```

Full example:

```


openlineage.transport.type=http




openlineage.transport.url=http://localhost:5000




openlineage.transport.endpoint=/api/v1/lineage




openlineage.transport.urlParams.param0=value0




openlineage.transport.urlParams.param1=value1




openlineage.transport.timeoutInMillis=5000




openlineage.transport.auth.type=api_key




openlineage.transport.auth.apiKey=f38d2189-c603-4b46-bdea-e573a3b5a7d5




openlineage.transport.headers.X-Some-Extra-Header=abc




openlineage.transport.compression=gzip


```

With SSL context:

```


openlineage.transport.sslContext.storePassword=...




openlineage.transport.sslContext.keyPassword=...




openlineage.transport.sslContext.keyStoreType=...




openlineage.transport.sslContext.keyStorePath=...


```

where the config contains location of the keystore file, keystore password and its type. It should also contain key password.
With proxy:

```


openlineage.transport.type=http




openlineage.transport.url=https://lineage-endpoint




openlineage.transport.proxy.host=squid.internal




openlineage.transport.proxy.port=3128


```

Anonymous connection:

```


importio.openlineage.client.OpenLineageClient;




importio.openlineage.client.transports.HttpConfig;




importio.openlineage.client.transports.HttpTransport;





HttpConfig httpConfig =newHttpConfig();




httpConfig.setUrl("http://localhost:5000");





OpenLineageClient client =OpenLineageClient.builder()




.transport(




newHttpTransport(httpConfig))




.build();


```

With authorization:

```


importio.openlineage.client.OpenLineageClient;




importio.openlineage.client.transports.ApiKeyTokenProvider;




importio.openlineage.client.transports.HttpConfig;




importio.openlineage.client.transports.HttpTransport;





ApiKeyTokenProvider apiKeyTokenProvider =newApiKeyTokenProvider();




apiKeyTokenProvider.setApiKey("f38d2189-c603-4b46-bdea-e573a3b5a7d5");





HttpConfig httpConfig =newHttpConfig();




httpConfig.setUrl("http://localhost:5000");




httpConfig.setAuth(apiKeyTokenProvider);





OpenLineageClient client =OpenLineageClient.builder()




.transport(




newHttpTransport(httpConfig))




.build();


```

Full example:

```


importjava.util.Map;





importio.openlineage.client.OpenLineageClient;




importio.openlineage.client.transports.ApiKeyTokenProvider;




importio.openlineage.client.transports.HttpConfig;




importio.openlineage.client.transports.HttpTransport;





MapString,String queryParams =Map.of(




"param0","value0",




"param1","value1"






MapString,String headers =Map.of(




"X-Some-Extra-Header","abc"






ApiKeyTokenProvider apiKeyTokenProvider =newApiKeyTokenProvider();




apiKeyTokenProvider.setApiKey("f38d2189-c603-4b46-bdea-e573a3b5a7d5");





HttpConfig httpConfig =newHttpConfig();




httpConfig.setUrl("http://localhost:5000");




httpConfig.setEndpoint("/api/v1/lineage");




httpConfig.setUrlParams(queryParams);




httpConfig.setAuth(apiKeyTokenProvider);




httpConfig.setTimeoutInMillis(5000);




httpConfig.setHeaders(headers);




httpConfig.setCompression(HttpConfig.Compression.GZIP);





OpenLineageClient client =OpenLineageClient.builder()




.transport(




newHttpTransport(httpConfig))




.build();


```

With SSL Context:

```


 httpConfig.setSslContextConfig(newHttpSslContextConfig(keyStorePassword, keyPassword, keyStoreType, keyStoreFileName));


```

where the config contains location of the keystore file, keystore password and its type. It should also contain key password.
With proxy:

```


importjava.net.URI;





importio.openlineage.client.OpenLineageClient;




importio.openlineage.client.transports.HttpConfig;




importio.openlineage.client.transports.HttpProxyConfig;




importio.openlineage.client.transports.HttpTransport;





HttpProxyConfig proxyConfig =newHttpProxyConfig();




proxyConfig.setHost("squid.internal");




proxyConfig.setPort(3128);





HttpConfig httpConfig =newHttpConfig();




httpConfig.setUrl(URI.create("https://lineage-endpoint"));




httpConfig.setProxyConfig(proxyConfig);





OpenLineageClient client =OpenLineageClient.builder()




.transport(newHttpTransport(httpConfig))




.build();


```

#### JWT Token Provider[​](https://openlineage.io/docs/client/java/configuration/#jwt-token-provider "Direct link to JWT Token Provider")
The `JwtTokenProvider` is an authentication provider that exchanges an API key for a JWT token via a POST endpoint. This is useful for services that require OAuth-style authentication where you need to obtain a token before making API requests.
##### Configuration[​](https://openlineage.io/docs/client/java/configuration/#configuration-1 "Direct link to Configuration")
When using JWT authentication with HTTP transport, configure the `auth` section as follows:
  * `type` - string, must be `"jwt"`. Required.
  * `apiKey` - string, the API key used to obtain the JWT token. Required.
  * `tokenEndpoint` - string, the URL endpoint for token generation. Required.
  * `tokenFields` - array of strings, JSON field names to search for the token in the response. The provider tries each field in order. Optional, default: `["token", "access_token"]`.
  * `expiresInField` - string, JSON field name containing the token expiration time in seconds. Optional, default: `"expires_in"`.
  * `grantType` - string, OAuth grant type parameter sent in the token request. Optional, default: `"urn:ietf:params:oauth:grant-type:jwt-bearer"`.
  * `responseType` - string, OAuth response type parameter sent in the token request. Optional, default: `"token"`.
  * `tokenRefreshBuffer` - integer, number of seconds before token expiry to trigger a refresh. Optional, default: `120`.


##### Behavior[​](https://openlineage.io/docs/client/java/configuration/#behavior-1 "Direct link to Behavior")
  * The provider sends a POST request with URL-encoded form data containing the API key and OAuth parameters.
  * The response is expected to be JSON containing the JWT token and optionally an expiration time.
  * Tokens are cached and automatically refreshed before expiration (default: 120 seconds before expiry, configurable via `tokenRefreshBuffer`).
  * If no expiration is provided in the response, the provider attempts to extract it from the JWT payload's `exp` claim.
  * The provider supports multiple JSON field names for the token, trying each in order until a match is found.
  * Field matching is case-insensitive and handles both snake_case and camelCase variations (e.g., `expires_in` matches `expiresIn`).


##### Examples[​](https://openlineage.io/docs/client/java/configuration/#examples-1 "Direct link to Examples")
  * Yaml Config
  * Spark Config
  * Flink Config
  * Java Code


Standard OAuth configuration:

```


transport:




type: http




url: https://api.example.com




auth:




type: jwt




apiKey: your-api-key




tokenEndpoint: https://auth.example.com/token


```

With custom field names:

```


transport:




type: http




url: https://api.example.com




auth:




type: jwt




apiKey: your-api-key




tokenEndpoint: https://auth.example.com/token




tokenFields:["access_token","token"]




expiresInField: expires_in


```

IBM Cloud IAM configuration:

```


transport:




type: http




url: https://api.example.com




auth:




type: jwt




apiKey: your-ibm-api-key




tokenEndpoint: https://iam.cloud.ibm.com/identity/token




grantType: urn:ibm:params:oauth:grant-type:apikey




responseType: cloud_iam


```

Standard OAuth configuration:

```


spark.openlineage.transport.type=http




spark.openlineage.transport.url=https://api.example.com




spark.openlineage.transport.auth.type=jwt




spark.openlineage.transport.auth.apiKey=your-api-key




spark.openlineage.transport.auth.tokenEndpoint=https://auth.example.com/token


```

IBM Cloud IAM configuration:

```


spark.openlineage.transport.type=http




spark.openlineage.transport.url=https://api.example.com




spark.openlineage.transport.auth.type=jwt




spark.openlineage.transport.auth.apiKey=your-ibm-api-key




spark.openlineage.transport.auth.tokenEndpoint=https://iam.cloud.ibm.com/identity/token




spark.openlineage.transport.auth.grantType=urn:ibm:params:oauth:grant-type:apikey




spark.openlineage.transport.auth.responseType=cloud_iam


```

Standard OAuth configuration:

```


openlineage.transport.type=http




openlineage.transport.url=https://api.example.com




openlineage.transport.auth.type=jwt




openlineage.transport.auth.apiKey=your-api-key




openlineage.transport.auth.tokenEndpoint=https://auth.example.com/token


```

IBM Cloud IAM configuration:

```


openlineage.transport.type=http




openlineage.transport.url=https://api.example.com




openlineage.transport.auth.type=jwt




openlineage.transport.auth.apiKey=your-ibm-api-key




openlineage.transport.auth.tokenEndpoint=https://iam.cloud.ibm.com/identity/token




openlineage.transport.auth.grantType=urn:ibm:params:oauth:grant-type:apikey




openlineage.transport.auth.responseType=cloud_iam


```

Standard OAuth configuration:

```


importio.openlineage.client.OpenLineageClient;




importio.openlineage.client.transports.HttpConfig;




importio.openlineage.client.transports.HttpTransport;




importio.openlineage.client.transports.JwtTokenProvider;





JwtTokenProvider jwtTokenProvider =newJwtTokenProvider();




jwtTokenProvider.setApiKey("your-api-key");




jwtTokenProvider.setTokenEndpoint(URI.create("https://auth.example.com/token"));





HttpConfig httpConfig =newHttpConfig();




httpConfig.setUrl(URI.create("https://api.example.com"));




httpConfig.setAuth(jwtTokenProvider);





OpenLineageClient client =OpenLineageClient.builder()




.transport(newHttpTransport(httpConfig))




.build();


```

IBM Cloud IAM configuration:

```


importio.openlineage.client.OpenLineageClient;




importio.openlineage.client.transports.HttpConfig;




importio.openlineage.client.transports.HttpTransport;




importio.openlineage.client.transports.JwtTokenProvider;





JwtTokenProvider jwtTokenProvider =newJwtTokenProvider();




jwtTokenProvider.setApiKey("your-ibm-api-key");




jwtTokenProvider.setTokenEndpoint(URI.create("https://iam.cloud.ibm.com/identity/token"));




jwtTokenProvider.setGrantType("urn:ibm:params:oauth:grant-type:apikey");




jwtTokenProvider.setResponseType("cloud_iam");





HttpConfig httpConfig =newHttpConfig();




httpConfig.setUrl(URI.create("https://api.example.com"));




httpConfig.setAuth(jwtTokenProvider);





OpenLineageClient client =OpenLineageClient.builder()




.transport(newHttpTransport(httpConfig))




.build();


```

#### OAuth2 Token Provider[​](https://openlineage.io/docs/client/java/configuration/#oauth2-token-provider "Direct link to OAuth2 Token Provider")
The `OAuth2ClientCredentialsTokenProvider` obtains an access token with the OAuth 2.0 client credentials grant ([RFC 6749, section 4.4](https://datatracker.ietf.org/doc/html/rfc6749#section-4.4)). Use it when the OpenLineage backend is protected by an OAuth 2.0 authorization server that issues short-lived access tokens to a client ID and client secret.
##### Configuration[​](https://openlineage.io/docs/client/java/configuration/#configuration-2 "Direct link to Configuration")
When using OAuth2 client credentials authentication with HTTP transport, configure the `auth` section as follows:
  * `type` - string, must be `"oauth2"`. Required.
  * `clientId` - string, the OAuth 2.0 client ID. Required.
  * `clientSecret` - string, the OAuth 2.0 client secret. Required.
  * `tokenEndpoint` - string, the URL of the token endpoint. Required.
  * `scope` - string, space separated scopes to request. Optional.
  * `clientAuthMethod` - string, how the client credentials are sent to the token endpoint: `"client_secret_basic"` (HTTP Basic `Authorization` header, with the credentials form-urlencoded as required by [RFC 6749, section 2.3.1](https://datatracker.ietf.org/doc/html/rfc6749#section-2.3.1)) or `"client_secret_post"` (request body). Optional, default: `"client_secret_basic"`.
  * `tokenFields` - array of strings, JSON field names to search for the token in the response. Optional, default: `["access_token"]`.
  * `expiresInField` - string, JSON field name containing the token expiration time in seconds. Optional, default: `"expires_in"`.
  * `tokenRefreshBuffer` - integer, number of seconds before token expiry to trigger a refresh. Optional, default: `120`.


##### Behavior[​](https://openlineage.io/docs/client/java/configuration/#behavior-2 "Direct link to Behavior")
  * The provider sends a POST request with URL-encoded form data containing `grant_type=client_credentials` and, if configured, `scope`.
  * Tokens are cached and automatically refreshed before expiration (default: 120 seconds before expiry, configurable via `tokenRefreshBuffer`). The client credentials grant does not issue refresh tokens, so every refresh is a new token request.
  * If no expiration is provided in the response, the provider attempts to extract it from the JWT payload's `exp` claim.
  * The provider supports multiple JSON field names for the token, trying each in order until a match is found.
  * Field matching is case-insensitive and handles both snake_case and camelCase variations (e.g., `expires_in` matches `expiresIn`).
  * If the response contains neither an expiry field nor a JWT `exp` claim, the token cannot be cached and a new one is requested for every event. A warning is logged when this happens.


##### Examples[​](https://openlineage.io/docs/client/java/configuration/#examples-2 "Direct link to Examples")
  * Yaml Config
  * Spark Config
  * Flink Config
  * Java Code



```


transport:




type: http




url: https://api.example.com




auth:




type: oauth2




clientId: your-client-id




clientSecret: your-client-secret




tokenEndpoint: https://auth.example.com/token


```

With the client credentials sent in the request body and a scope:

```


transport:




type: http




url: https://api.example.com




auth:




type: oauth2




clientId: your-client-id




clientSecret: your-client-secret




tokenEndpoint: https://auth.example.com/token




clientAuthMethod: client_secret_post




scope: openid


```


```


spark.openlineage.transport.type=http




spark.openlineage.transport.url=https://api.example.com




spark.openlineage.transport.auth.type=oauth2




spark.openlineage.transport.auth.clientId=your-client-id




spark.openlineage.transport.auth.clientSecret=your-client-secret




spark.openlineage.transport.auth.tokenEndpoint=https://auth.example.com/token


```


```


openlineage.transport.type=http




openlineage.transport.url=https://api.example.com




openlineage.transport.auth.type=oauth2




openlineage.transport.auth.clientId=your-client-id




openlineage.transport.auth.clientSecret=your-client-secret




openlineage.transport.auth.tokenEndpoint=https://auth.example.com/token


```


```


importio.openlineage.client.OpenLineageClient;




importio.openlineage.client.transports.HttpConfig;




importio.openlineage.client.transports.HttpTransport;




importio.openlineage.client.transports.OAuth2ClientCredentialsTokenProvider;





OAuth2ClientCredentialsTokenProvider tokenProvider =




newOAuth2ClientCredentialsTokenProvider(




"your-client-id",




"your-client-secret",




URI.create("https://auth.example.com/token"));





HttpConfig httpConfig =newHttpConfig();




httpConfig.setUrl(URI.create("https://api.example.com"));




httpConfig.setAuth(tokenProvider);





OpenLineageClient client =OpenLineageClient.builder()




.transport(newHttpTransport(httpConfig))




.build();


```

If a transport type is set to `kafka`, then the below parameters would be read and used when building KafkaProducer. This transport requires the artifact `org.apache.kafka:kafka-clients:3.1.0` (or compatible) on your classpath.
#### Configuration[​](https://openlineage.io/docs/client/java/configuration/#configuration-3 "Direct link to Configuration")
  * `type` - string, must be `"kafka"`. Required.
  * `topicName` - string specifying the topic on what events will be sent. Required.
  * `properties` - a dictionary containing a Kafka producer config as in [Kafka producer config](http://kafka.apache.org/0100/documentation.html#producerconfigs). Required.
  * `localServerId` - **deprecated** , renamed to `messageKey` since v1.13.0.
  * `messageKey` - string, key for all Kafka messages produced by transport. Optional, default value described below. Added in v1.13.0.
Default values for `messageKey` are:
    * `run:{rootJob.namespace}/{rootJob.name}` - for RunEvent with parent facet containing link to `root` job
    * `run:{parentJob.namespace}/{parentJob.name}` - for RunEvent with parent facet
    * `run:{job.namespace}/{job.name}` - for RunEvent
    * `job:{job.namespace}/{job.name}` - for JobEvent
    * `dataset:{dataset.namespace}/{dataset.name}` - for DatasetEvent


#### Behavior[​](https://openlineage.io/docs/client/java/configuration/#behavior-3 "Direct link to Behavior")
Events are serialized to JSON, and then dispatched to the Kafka topic.
#### Notes[​](https://openlineage.io/docs/client/java/configuration/#notes "Direct link to Notes")
It is recommended to provide `messageKey` if Job hierarchy is used. It can be any string, but it should be the same for all jobs in hierarchy, like `Airflow task -> Spark application -> Spark task runs`.
#### Examples[​](https://openlineage.io/docs/client/java/configuration/#examples-3 "Direct link to Examples")
  * Yaml Config
  * Spark Config
  * Flink Config
  * Java Code



```


transport:




type: kafka




topicName: openlineage.events




properties:




bootstrap.servers: localhost:9092,another.host:9092




acks: all




retries:3




key.serializer: org.apache.kafka.common.serialization.StringSerializer




value.serializer: org.apache.kafka.common.serialization.StringSerializer




messageKey: some-value


```


```


spark.openlineage.transport.type=kafka




spark.openlineage.transport.topicName=openlineage.events




spark.openlineage.transport.properties.bootstrap.servers=localhost:9092,another.host:9092




spark.openlineage.transport.properties.acks=all




spark.openlineage.transport.properties.retries=3




spark.openlineage.transport.properties.key.serializer=org.apache.kafka.common.serialization.StringSerializer




spark.openlineage.transport.properties.value.serializer=org.apache.kafka.common.serialization.StringSerializer




spark.openlineage.transport.messageKey=some-value


```


```


openlineage.transport.type=kafka




openlineage.transport.topicName=openlineage.events




openlineage.transport.properties.bootstrap.servers=localhost:9092,another.host:9092




openlineage.transport.properties.acks=all




openlineage.transport.properties.retries=3




openlineage.transport.properties.key.serializer=org.apache.kafka.common.serialization.StringSerializer




openlineage.transport.properties.value.serializer=org.apache.kafka.common.serialization.StringSerializer




openlineage.transport.messageKey=some-value


```


```


importjava.util.Properties;





importio.openlineage.client.OpenLineageClient;




importio.openlineage.client.transports.KafkaConfig;




importio.openlineage.client.transports.KafkaTransport;





Properties kafkaProperties =newProperties();




kafkaProperties.setProperty("bootstrap.servers","localhost:9092,another.host:9092");




kafkaProperties.setProperty("acks","all");




kafkaProperties.setProperty("retries","3");




kafkaProperties.setProperty("key.serializer","org.apache.kafka.common.serialization.StringSerializer");




kafkaProperties.setProperty("value.serializer","org.apache.kafka.common.serialization.StringSerializer");





KafkaConfig kafkaConfig =newKafkaConfig();




KafkaConfig.setTopicName("openlineage.events");




KafkaConfig.setProperties(kafkaProperties);




KafkaConfig.setMessageKey("some-key");





OpenLineageClient client =OpenLineageClient.builder()




.transport(




newKafkaTransport(httpConfig))




.build();


```

_Notes_ : It is recommended to provide `messageKey` if Job hierarchy is used. It can be any string, but it should be the same for all jobs in hierarchy, like `Airflow task -> Spark application`.
Default values are:
  * `run:{rootJob.namespace}/{rootJob.name}` - for RunEvent with parent facet containing link to `root` job
  * `run:{parentJob.namespace}/{parentJob.name}/{parentRun.id}` - for RunEvent with parent facet
  * `run:{job.namespace}/{job.name}/{run.id}` - for RunEvent
  * `job:{job.namespace}/{job.name}` - for JobEvent
  * `dataset:{dataset.namespace}/{dataset.name}` - for DatasetEvent


This straightforward transport emits OpenLineage events directly to the console through a logger. No additional configuration is required.
#### Behavior[​](https://openlineage.io/docs/client/java/configuration/#behavior-4 "Direct link to Behavior")
Events are serialized to JSON. Then each event is logged with `INFO` level to logger with name `ConsoleTransport`.
#### Notes[​](https://openlineage.io/docs/client/java/configuration/#notes-1 "Direct link to Notes")
Be cautious when using the `DEBUG` log level, as it might result in double-logging due to the `OpenLineageClient` also logging.
#### Configuration[​](https://openlineage.io/docs/client/java/configuration/#configuration-4 "Direct link to Configuration")
  * `type` - string, must be `"console"`. Required.


#### Examples[​](https://openlineage.io/docs/client/java/configuration/#examples-4 "Direct link to Examples")
  * Yaml Config
  * Spark Config
  * Flink Config
  * Java Code



```


transport:




type: console


```


```


spark.openlineage.transport.type=console


```


```


openlineage.transport.type=console


```


```


importjava.util.Properties;





importio.openlineage.client.OpenLineageClient;




importio.openlineage.client.transports.ConsoleTransport;





OpenLineageClient client =OpenLineageClient.builder()




.transport(




newConsoleTransport())




.build();


```

Designed mainly for integration testing, the `FileTransport` emits OpenLineage events to a given file.
#### Configuration[​](https://openlineage.io/docs/client/java/configuration/#configuration-5 "Direct link to Configuration")
  * `type` - string, must be `"file"`. Required.
  * `location` - string specifying the path of the file. Required.


#### Behavior[​](https://openlineage.io/docs/client/java/configuration/#behavior-5 "Direct link to Behavior")
  * If the target file is absent, it's created.
  * Events are serialized to JSON, and then appended to a file, separated by newlines.
  * Intrinsic newline characters within the event JSON are eliminated to ensure one-line events.


#### Notes for Yarn/Kubernetes[​](https://openlineage.io/docs/client/java/configuration/#notes-for-yarnkubernetes "Direct link to Notes for Yarn/Kubernetes")
This transport type is pretty useless on Spark/Flink applications deployed to Yarn or Kubernetes cluster:
  * Each executor will write file to a local filesystem of Yarn container/K8s pod. So resulting file will be removed when such container/pod is destroyed.
  * Kubernetes persistent volumes are not destroyed after pod removal. But all the executors will write to the same network disk in parallel, producing a broken file.


#### Examples[​](https://openlineage.io/docs/client/java/configuration/#examples-5 "Direct link to Examples")
  * Yaml Config
  * Spark Config
  * Flink Config
  * Java Code



```


transport:




type: file




location: /path/to/your/file


```


```


spark.openlineage.transport.type=file




spark.openlineage.transport.location=/path/to/your/filext


```


```


openlineage.transport.type=file




openlineage.transport.location=/path/to/your/file


```


```


importjava.util.Properties;





importio.openlineage.client.OpenLineageClient;




importio.openlineage.client.transports.FileConfig;




importio.openlineage.client.transports.FileTransport;





FileConfig fileConfig =newFileConfig("/path/to/your/file");





OpenLineageClient client =OpenLineageClient.builder()




.transport(




newFileTransport(fileConfig))




.build();


```

The `CompositeTransport` is designed to combine multiple transports, allowing event emission to several destinations. This is useful when events need to be sent to multiple targets, such as a logging system and an API endpoint. The events are delivered sequentially - one after another in a defined order.
#### Configuration[​](https://openlineage.io/docs/client/java/configuration/#configuration-6 "Direct link to Configuration")
  * `type` - string, must be "composite". Required.
  * `transports` - a list or a map of transport configurations. Required.
  * `continueOnFailure` - boolean flag, determines if the process should continue even when one of the transports fails. Default is `true`.
  * `withThreadPool` - boolean flag, determines if a thread pool for parallel event emission should be kept between event emissions. Default is `true`.


#### Behavior[​](https://openlineage.io/docs/client/java/configuration/#behavior-6 "Direct link to Behavior")
  * The configured transports will be initialized and used in sequence (sorted by transport name) to emit OpenLineage events.
  * If `continueOnFailure` is set to `false`, a failure in one transport will stop the event emission process, and an exception will be raised.
  * If `continueOnFailure` is `true`, the failure will be logged, but the remaining transports will still attempt to send the event.


#### Notes for Multiple Transports[​](https://openlineage.io/docs/client/java/configuration/#notes-for-multiple-transports "Direct link to Notes for Multiple Transports")
The composite transport can be used with any OpenLineage transport (e.g. `HttpTransport`, `KafkaTransport`, etc). Ideal for scenarios where OpenLineage events need to reach multiple destinations for redundancy or different types of processing.
The `transports` configuration can be provided in two formats:
  1. A list of transport configurations, where each transport may optionally include a `name` field.
  2. A map of transport configurations, where the key acts as the name for each transport. The map format is particularly useful for configurations set via environment variables or Java properties, providing a more convenient and flexible setup.


##### Why are transport names used?[​](https://openlineage.io/docs/client/java/configuration/#why-are-transport-names-used "Direct link to Why are transport names used?")
Transport names are not required for basic functionality. Their primary purpose is to enable configuration of composite transports via environment variables, which is only supported when names are defined.
#### Examples[​](https://openlineage.io/docs/client/java/configuration/#examples-6 "Direct link to Examples")
  * Yaml Config (List)
  * Yaml Config (Map)
  * Spark Config
  * Flink Config
  * Java Code



```


transport:




type: composite




continueOnFailure:true




transports:




-type: http




url: http://example.com/api




name: my_http




-type: kafka




topicName: openlineage.events




properties:




bootstrap.servers: localhost:9092,another.host:9092




acks: all




retries:3




key.serializer: org.apache.kafka.common.serialization.StringSerializer




value.serializer: org.apache.kafka.common.serialization.StringSerializer




messageKey: some-value




continueOnFailure:true


```


```


transport:




type: composite




continueOnFailure:true




transports:




my_http:




type: http




url: http://example.com/api




name: my_http




my_kafka:




type: kafka




topicName: openlineage.events




properties:




bootstrap.servers: localhost:9092,another.host:9092




acks: all




retries:3




key.serializer: org.apache.kafka.common.serialization.StringSerializer




value.serializer: org.apache.kafka.common.serialization.StringSerializer




messageKey: some-value




continueOnFailure:true


```


```


spark.openlineage.transport.type=composite




spark.openlineage.transport.continueOnFailure=true




spark.openlineage.transport.transports.my_http.type=http




spark.openlineage.transport.transports.my_http.url=http://example.com/api




spark.openlineage.transport.transports.my_kafka.type=kafka




spark.openlineage.transport.transports.my_kafka.topicName=openlineage.events




spark.openlineage.transport.transports.my_kafka.properties.bootstrap.servers=localhost:9092,another.host:9092




spark.openlineage.transport.transports.my_kafka.properties.acks=all




spark.openlineage.transport.transports.my_kafka.properties.retries=3




spark.openlineage.transport.transports.my_kafka.properties.key.serializer=org.apache.kafka.common.serialization.StringSerializer




spark.openlineage.transport.transports.my_kafka.properties.value.serializer=org.apache.kafka.common.serialization.StringSerializer


```


```


openlineage.transport.type=composite




openlineage.transport.continueOnFailure=true




openlineage.transport.transports.my_http.type=http




openlineage.transport.transports.my_http.url=http://example.com/api




openlineage.transport.transports.my_kafka.type=kafka




openlineage.transport.transports.my_kafka.topicName=openlineage.events




openlineage.transport.transports.my_kafka.properties.bootstrap.servers=localhost:9092,another.host:9092




openlineage.transport.transports.my_kafka.properties.acks=all




openlineage.transport.transports.my_kafka.properties.retries=3




openlineage.transport.transports.my_kafka.properties.key.serializer=org.apache.kafka.common.serialization.StringSerializer




openlineage.transport.transports.my_kafka.properties.value.serializer=org.apache.kafka.common.serialization.StringSerializer


```


```


importjava.util.Arrays;




importio.openlineage.client.OpenLineageClient;




importio.openlineage.client.transports.CompositeConfig;




importio.openlineage.client.transports.HttpConfig;




importio.openlineage.client.transports.HttpTransport;




importio.openlineage.client.transports.KafkaConfig;




importio.openlineage.client.transports.KafkaTransport;





HttpConfig httpConfig =newHttpConfig();




httpConfig.setUrl("http://example.com/api");




KafkaConfig kafkaConfig =newKafkaConfig();




KafkaConfig.setTopicName("openlineage.events");




KafkaConfig.setMessageKey("some-key");





CompositeConfig compositeConfig =newCompositeConfig(Arrays.asList(




newHttpTransport(httpConfig),




newKafkaTransport(kafkaConfig)




),true);





OpenLineageClient client =OpenLineageClient.builder()




.transport(




newCompositeTransport(compositeConfig))




.build();


```

The `TransformTransport` is designed to enable event manipulation before emitting the event. Together with `CompositeTransport`, it can be used to send different events into multiple backends.
#### Configuration[​](https://openlineage.io/docs/client/java/configuration/#configuration-7 "Direct link to Configuration")
  * `type` - string, must be "transform". Required.
  * `transformerClass` - class name of the event transformer. Class has to implement `io.openlineage.client.transports.transform.EventTransformer` interface and provide public no-arg constructor. Class needs to be available on the classpath. Required.
  * `transformerProperties` - Extra properties that can be passed into `transformerClass` based on the configuration. Optional.
  * `transport` - Transport configuration to emit modified events. Required.


#### Behavior[​](https://openlineage.io/docs/client/java/configuration/#behavior-7 "Direct link to Behavior")
  * The configured `transformerClass` will be used to alter events before the emission.
  * Modified events will be passed into the configured `transport` for further processing.
  * In case of returning `null`, the event will be skipped.


####  `EventTransformer` interface[​](https://openlineage.io/docs/client/java/configuration/#eventtransformer-interface "Direct link to eventtransformer-interface")

```


publicclassCustomEventTransformerimplementsEventTransformer{




@Override




publicvoidinitialize(MapString,String properties){...}





@Override




publicRunEventtransform(RunEvent event){...}





@Override




publicDatasetEventtransform(DatasetEvent event){..}





@Override




publicJobEventtransform(JobEvent event){...}



```

#### Examples[​](https://openlineage.io/docs/client/java/configuration/#examples-7 "Direct link to Examples")
  * Yaml Config
  * Spark Config
  * Flink Config
  * Java Code



```


transport:




type: transform




transformerClass: io.openlineage.CustomEventTransformer




transformerProperties:




key1: value1




key2: value2




transport:




type: http




url: http://example.com/api




name: my_http


```


```


spark.openlineage.transport.type=transform




spark.openlineage.transport.transformerClass=io.openlineage.CustomEventTransformer




spark.openlineage.transport.transformerProperties.key1=value1




spark.openlineage.transport.transformerProperties.key2=value2




spark.openlineage.transport.transport.type=http




spark.openlineage.transport.transport.url=http://example.com/api


```


```


openlineage.transport.type=transform




openlineage.transport.transformerClass=io.openlineage.CustomEventTransformer




openlineage.transport.transformerProperties.key1=value1




openlineage.transport.transformerProperties.key2=value2




openlineage.transport.transport.type=http




openlineage.transport.transport.url=http://example.com/api


```


```


importjava.util.Arrays;




importio.openlineage.client.OpenLineageClient;




importio.openlineage.client.transports.TransformConfig;




importio.openlineage.client.transports.HttpConfig;




importio.openlineage.client.transports.HttpTransport;





HttpConfig httpConfig =newHttpConfig();




httpConfig.setUrl(URI.create("http://example.com/api"));





TransformConfig transformConfig =newTransformConfig();




transformConfig.setTransformerClass(CustomEventTransformer.class.getName());




transformConfig.setTransport(httpConfig);





OpenLineageClient client =OpenLineageClient




.builder()




.transport(newTransformTransport(transformConfig))




.build();


```

To use this transport in your project, you need to include `io.openlineage:transports-gcplineage` artifact in your build configuration. This is particularly important for environments like `Spark`, where this transport must be on the classpath for lineage events to be emitted correctly.
#### Configuration[​](https://openlineage.io/docs/client/java/configuration/#configuration-8 "Direct link to Configuration")
  * `type` - string, must be `"gcplineage"`. Required.
  * `endpoint` - string, specifies the endpoint to which events are sent, default value is `datalineage.googleapis.com:443`. Optional.
  * `projectId` - string, the project quota identifier. If not provided, it is determined based on user credentials. Optional.
  * `location` - string, [Dataplex location](https://cloud.google.com/dataplex/docs/locations). Optional, default: `"us"`.
  * `credentialsFile` - string, path to the [Service Account credentials JSON file](https://developers.google.com/workspace/guides/create-credentials#create_credentials_for_a_service_account). Optional, if not provided [Application Default Credentials](https://cloud.google.com/docs/authentication/application-default-credentials) are used
  * `mode` - enum that specifies the type of client used for publishing OpenLineage events to GCP Lineage service. Possible values: `sync` (synchronous) or `async` (asynchronous). Optional, default: `async`.


#### Behavior[​](https://openlineage.io/docs/client/java/configuration/#behavior-8 "Direct link to Behavior")
  * Events are serialized to JSON, included as part of a `gRPC` request, and then dispatched to the `GCP Lineage service` endpoint.
  * Depending on the `mode` chosen, requests are sent using either a synchronous or asynchronous client.


#### Examples[​](https://openlineage.io/docs/client/java/configuration/#examples-8 "Direct link to Examples")
  * Yaml Config
  * Spark Config
  * Flink Config
  * Java Code



```


transport:




type: gcplineage




projectId: your_gcp_project_id




location: us




mode: sync




credentialsFile: path/to/credentials.json


```


```


spark.openlineage.transport.type=gcplineage




spark.openlineage.transport.projectId=your_gcp_project_id




spark.openlineage.transport.location=us




spark.openlineage.transport.mode=sync




spark.openlineage.transport.credentialsFile=path/to/credentials.json


```


```


openlineage.transport.type=gcplineage




openlineage.transport.projectId=your_gcp_project_id




openlineage.transport.location=us




openlineage.transport.mode=sync




openlineage.transport.credentialsFile=path/to/credentials.json


```


```


importio.openlineage.client.OpenLineageClient;




importio.openlineage.client.transports.gcplineage.GcpLineageTransportConfig;




importio.openlineage.client.transports.dataplex.GcpLineageTransport;






GcpLineageTransportConfig gcplineageConfig =newGcpLineageTransportConfig();





gcplineageConfig.setProjectId("your_gcp_project_id");




gcplineageConfig.setLocation("your_gcp_location");




gcplineageConfig.setMode(MODE.SYNC);




gcplineageConfig.setCredentialsFile("path/to/credentials.json");





OpenLineageClient client =OpenLineageClient.builder()




.transport(




newGcpLineageTransport(gcplineageConfig))




.build();


```

###  [Google Cloud Storage](https://github.com/OpenLineage/OpenLineage/blob/main/client/java/transports-gcs/src/main/java/io/openlineage/client/transports/gcs/GcsTransport.java)[​](https://openlineage.io/docs/client/java/configuration/#google-cloud-storage "Direct link to google-cloud-storage")
To use this transport in your project, you need to include `io.openlineage:transports-gcs` artifact in your build configuration. This is particularly important for environments like `Spark`, where this transport must be on the classpath for lineage events to be emitted correctly.
#### Configuration[​](https://openlineage.io/docs/client/java/configuration/#configuration-9 "Direct link to Configuration")
  * `type` - string, must be `"gcs"`. Required.
  * `projectId` - string, the project quota identifier. Required.
  * `credentialsFile` - string, path to the [Service Account credentials JSON file](https://developers.google.com/workspace/guides/create-credentials#create_credentials_for_a_service_account). Optional, if not provided [Application Default Credentials](https://cloud.google.com/docs/authentication/application-default-credentials) are used
  * `bucketName` - string, the GCS bucket name. Required
  * `fileNamePrefix` - string, prefix for the event file names. Optional.


#### Behavior[​](https://openlineage.io/docs/client/java/configuration/#behavior-9 "Direct link to Behavior")
  * Events are serialized to JSON and stored in the specified GCS bucket.
  * Each event file is named based on its `eventTime`, converted to epoch milliseconds, with an optional prefix if configured.
  * Two constructors are available: one accepting both `Storage` and `GcsTransportConfig` and another solely accepting `GcsTransportConfig`.


#### Examples[​](https://openlineage.io/docs/client/java/configuration/#examples-9 "Direct link to Examples")
  * Yaml Config
  * Spark Config
  * Flink Config
  * Java Code



```


transport:




type: gcs




bucketName: my-gcs-bucket




fileNamePrefix: /file/name/prefix/




credentialsFile: path/to/credentials.json


```


```


spark.openlineage.transport.type=gcs




spark.openlineage.transport.bucketName=my-gcs-bucket




spark.openlineage.transport.credentialsFile=path/to/credentials.json




spark.openlineage.transport.credentialsFile=file/name/prefix/


```


```


openlineage.transport.type=gcs




openlineage.transport.bucketName=my-gcs-bucket




openlineage.transport.credentialsFile=path/to/credentials.json




openlineage.transport.credentialsFile=file/name/prefix/


```


```


importio.openlineage.client.OpenLineageClient;




importio.openlineage.client.transports.gcs.GcsTransportConfig;




importio.openlineage.client.transports.dataplex.GcsTransport;






DataplexConfig gcsConfig =newGcsTransportConfig();





gcsConfig.setBucketName("my-bucket-name");




gcsConfig.setFileNamePrefix("/file/name/prefix/");




gcsConfig.setCredentialsFile("path/to/credentials.json");





OpenLineageClient client =OpenLineageClient.builder()




.transport(




newGcsTransport(dataplexConfig))




.build();


```

###  [DataZone Transport](https://github.com/OpenLineage/OpenLineage/blob/main/client/java/transports-datazone/src/main/java/io/openlineage/client/transports/datazone/AmazonDataZoneTransport.java)[​](https://openlineage.io/docs/client/java/configuration/#datazone-transport "Direct link to datazone-transport")
To use this transport in your project, you need to include `io.openlineage:transports-datazone` artifact in your build configuration. This is particularly important for environments like `Spark`, where this transport must be on the classpath for lineage events to be emitted correctly.
#### Configuration[​](https://openlineage.io/docs/client/java/configuration/#configuration-10 "Direct link to Configuration")
  * `type` - string, must be `"amazon_datazone_api"`. Required.
  * `domainId` - string, specifies the DataZone / SageMaker Unified Studio domain id. The lineage events will be then sent to the following domain. Required.
  * `region` - string. When provided, the DataZone client will be configured to use this specific region. If endpointOverride is also provided, this value is not used. Optional, default: None (uses AWS SDK default region resolution).
  * `endpointOverride` - string, overrides the default HTTP endpoint for Amazon DataZone client. Default value will be set by AWS SDK to [following endpoints](https://docs.aws.amazon.com/general/latest/gr/datazone.html#datazone_region) based on the region. Optional, default: None


#### Behavior[​](https://openlineage.io/docs/client/java/configuration/#behavior-10 "Direct link to Behavior")
  * Events are serialized to JSON, and then dispatched to the `DataZone` / `SageMaker Unified Studio` endpoint.


#### Examples[​](https://openlineage.io/docs/client/java/configuration/#examples-10 "Direct link to Examples")
  * Yaml Config
  * Spark Config
  * Flink Config
  * Java Code



```


transport:




type: amazon_datazone_api




domainId: dzd-domain-id


```


```


spark.openlineage.transport.type=amazon_datazone_api




spark.openlineage.transport.domainId=dzd-domain-id


```


```


openlineage.transport.type=amazon_datazone_api




openlineage.transport.domainId=dzd-domain-id


```


```


importio.openlineage.client.OpenLineageClient;




importio.openlineage.client.transports.datazone.AmazonDataZoneTransportConfig;




importio.openlineage.client.transports.datazone.AmazonDataZoneTransport;





AmazonDataZoneTransportConfig datazoneConfig =newAmazonDataZoneTransportConfig();





datazoneConfig.setDomainId("dzd-domain-id");





OpenLineageClient client =OpenLineageClient.builder()




.transport(




newAmazonDataZoneTransport(datazoneConfig))




.build();


```

To use this transport in your project, you need to include the following dependency in your build configuration. This is particularly important for environments like `Spark`, where this transport must be on the classpath for lineage events to be emitted correctly.
#### Maven[​](https://openlineage.io/docs/client/java/configuration/#maven "Direct link to Maven")

```



dependency




groupIdio.openlineage</groupId




artifactIdtransports-s3</artifactId




version1.54.0</version




</dependency


```

#### Configuration[​](https://openlineage.io/docs/client/java/configuration/#configuration "Direct link to Configuration")
  * `type` - string, must be `"s3"`. Required.
  * `endpoint` - string, the endpoint for S3 compliant service like MinIO, Ceph, etc. Optional
  * `bucketName` - string, the S3 bucket name. Required
  * `fileNamePrefix` - string, prefix for the event file names. It is separated from the timestamp with underscore. It can include path and file name prefix. Optional.


##### Credentials[​](https://openlineage.io/docs/client/java/configuration/#credentials "Direct link to Credentials")
To authenticate, the transport uses the [default credentials provider chain](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/credentials-chain.html). The possible authentication methods include:
  * Java system properties
  * Environment variables
  * Shared credentials config file (by default `~/.aws/config`)
  * EC2 instance credentials (convenient in EMR and Glue)
  * and other


Refer to the documentation for details.
#### Behavior[​](https://openlineage.io/docs/client/java/configuration/#behavior "Direct link to Behavior")
  * Events are serialized to JSON and stored in the specified S3 bucket.
  * Each event file is named based on its `eventTime`, converted to epoch milliseconds, with an optional prefix if configured.


#### Examples[​](https://openlineage.io/docs/client/java/configuration/#examples "Direct link to Examples")
  * Yaml Config
  * Spark Config
  * Flink Config
  * Java Code



```


transport:




type: s3




endpoint: https://my-minio.example.com




bucketName: events




fileNamePrefix: my/service/events/event


```


```


spark.openlineage.transport.type=s3




spark.openlineage.transport.endpoint=https://my-minio.example.com




spark.openlineage.transport.bucketName=events




spark.openlineage.transport.fileNamePrefix=my/service/events/event


```


```


openlineage.transport.type=s3




openlineage.transport.endpoint=https://my-minio.example.com




openlineage.transport.bucketName=events




openlineage.transport.fileNamePrefix=my/service/events/event


```


```


importio.openlineage.client.OpenLineageClient;




importio.openlineage.client.transports.s3.S3TransportConfig;




importio.openlineage.client.transports.s3.S3Transport;






S3TransportConfig s3Config =newS3TransportConfig();





s3Config.setEndpoint("https://my-minio.example.com");




s3Config.setBucketName("events");




s3Config.setFileNamePrefix("my/service/events/event");





OpenLineageClient client =OpenLineageClient.builder()




.transport(newS3Transport(s3Config))




.build();


```

### Error Handling via Transport[​](https://openlineage.io/docs/client/java/configuration/#error-handling-via-transport "Direct link to Error Handling via Transport")

```


// Connect to http://localhost:5000




OpenLineageClient client =OpenLineageClient.builder()




.transport(




HttpTransport.builder()




.uri("http://localhost:5000")




.apiKey("f38d2189-c603-4b46-bdea-e573a3b5a7d5")




.build())




.registerErrorHandler(newEmitErrorHandler(){




@Override




publicvoidhandleError(Throwable throwable){




// Handle emit error here





}).build();


```

### Defining Your Own Transport[​](https://openlineage.io/docs/client/java/configuration/#defining-your-own-transport "Direct link to Defining Your Own Transport")

```


OpenLineageClient client =OpenLineageClient.builder()




.transport(




newMyTransport(){




@Override




publicvoidemit(OpenLineage.RunEvent runEvent){




// Add emit logic here





}).build();


```

## Circuit Breakers[​](https://openlineage.io/docs/client/java/configuration/#circuit-breakers "Direct link to Circuit Breakers")
info
This feature is available in OpenLineage versions >= 1.9.0.
To prevent from over-instrumentation OpenLineage integration provides a circuit breaker mechanism that stops OpenLineage from creating, serializing and sending OpenLineage events.
### Timeout only Circuit Breaker[​](https://openlineage.io/docs/client/java/configuration/#timeout-only-circuit-breaker "Direct link to Timeout only Circuit Breaker")
Circuit breaker which closes after a given timeout. It is useful to control the time spent on OpenLineage. Please note that other circuit breakers support timeout as well, but this one is the simplest to fit the scenarios when only timeout is needed.
  * Yaml Config
  * Spark Config
  * Flink Config



```


circuitBreaker:




type: timeout




timeoutInSeconds:90


```
  
| Parameter  | Definition  | Example  |  
| --- | --- | --- |  
| spark.openlineage.circuitBreaker.type  | Circuit breaker type selected  | timeout  |  
| spark.openlineage.circuitBreaker.timeoutInSeconds  | Timeout for OpenLineage execution  | 90  |  
| Parameter  | Definition  | Example  |  
| --- | --- | --- |  
| openlineage.circuitBreaker.type  | Circuit breaker type selected  | timeout  |  
| openlineage.circuitBreaker.timeoutInSeconds  | Timeout for OpenLineage execution  | 90  |  
### Simple Memory Circuit Breaker[​](https://openlineage.io/docs/client/java/configuration/#simple-memory-circuit-breaker "Direct link to Simple Memory Circuit Breaker")
This circuit breaker provides a straightforward protective mechanism by monitoring a single metric: the amount of free memory in the JVM. It is a lightweight option ideal for preventing `OutOfMemoryError` conditions when memory usage is the primary concern.
**Triggering Logic**
The circuit starts in a **closed** (operational) state, allowing OpenLineage events to be collected. It will **open** (trip and temporarily disable OpenLineage) if the percentage of free JVM heap memory drops **below** the configured `memoryThreshold`, which is the only condition it checks.
  * Yaml Config
  * Spark Config
  * Flink Config



```


circuitBreaker:




type: simpleMemory




memoryThreshold:20




circuitCheckIntervalInMillis:1000




timeoutInSeconds:90


```
  
| Parameter  | Definition  | Example  |  
| --- | --- | --- |  
| spark.openlineage.circuitBreaker.type  | Must be set to `simpleMemory` to enable this circuit breaker.  | simpleMemory  |  
| spark.openlineage.circuitBreaker.memoryThreshold  | The minimum percentage of **free** heap memory required. If free memory drops below this value, the circuit will open. Default `20`.  | 20  |  
| spark.openlineage.circuitBreaker.circuitCheckIntervalInMillis  | The frequency, in milliseconds, at which the free memory is checked. Default `1000`.  | 1000  |  
| spark.openlineage.circuitBreaker.timeoutInSeconds  | (Optional) A timeout for any single OpenLineage operation. This applies independently of the memory check. (Since v1.13)  | 90  |  
| Parameter  | Definition  | Example  |  
| --- | --- | --- |  
| openlineage.circuitBreaker.type  | Must be set to `simpleMemory` to enable this circuit breaker.  | simpleMemory  |  
| openlineage.circuitBreaker.memoryThreshold  | The minimum percentage of **free** heap memory required. If free memory drops below this value, the circuit will open. Default `20`.  | 20  |  
| openlineage.circuitBreaker.circuitCheckIntervalInMillis  | The frequency, in milliseconds, at which the free memory is checked. Default `1000`.  | 1000  |  
| openlineage.circuitBreaker.timeoutInSeconds  | (Optional) A timeout for any single OpenLineage operation. This applies independently of the memory check. (Since v1.13)  | 90  |  
### Java Runtime Circuit Breaker[​](https://openlineage.io/docs/client/java/configuration/#java-runtime-circuit-breaker "Direct link to Java Runtime Circuit Breaker")
This circuit breaker provides a sophisticated health check by monitoring two key indicators of JVM health: free memory and garbage collection (GC) overhead. It is designed to disable OpenLineage only when the application is both low on memory and actively struggling to reclaim it.
**Triggering Logic**
The circuit starts in a closed (operational) state. It will open (trip and temporarily disable OpenLineage) only when both of the following conditions are met during a single check:
  1. The percentage of free JVM heap memory drops **below** the configured `memoryThreshold`.
  2. The percentage of CPU time spent on Garbage Collection since the last check rises **above** the configured `gcCpuThreshold`.


Because both conditions must be true, it allows the application to handle temporary dips in free memory as long as the GC process is not overwhelmed.
**Note on Initial State** : The GC overhead is calculated as a percentage of time between checks. On the very first check after the application starts, this metric is not yet available. Therefore, the circuit will remain **closed** (enabled) for the first event, which begins the monitoring cycle.
  * Yaml Config
  * Spark Config
  * Flink Config



```


circuitBreaker:




type: javaRuntime




memoryThreshold:20




gcCpuThreshold:10




circuitCheckIntervalInMillis:1000




timeoutInSeconds:90


```
  
| Parameter  | Definition  | Example  |  
| --- | --- | --- |  
| spark.openlineage.circuitBreaker.type  | Must be set to `javaRuntime` to enable this specific circuit breaker.  | javaRuntime  |  
| spark.openlineage.circuitBreaker.memoryThreshold  | The minimum percentage of free heap memory required. The circuit may open if **free** memory drops below this value. Default `20`.  | 20  |  
| spark.openlineage.circuitBreaker.gcCpuThreshold  | The maximum allowed percentage of CPU time spent on Garbage Collection. The circuit may open if GC time exceeds this value. Default `10`.  | 10  |  
| spark.openlineage.circuitBreaker.circuitCheckIntervalInMillis  | The frequency, in milliseconds, at which the memory and GC thresholds are checked. Default `1000`.  | 1000  |  
| spark.openlineage.circuitBreaker.timeoutInSeconds  | (Optional) A timeout for any single OpenLineage operation. If an emit action takes longer than this, it is terminated. (Since v1.13)  | 90  |  
| Parameter  | Definition  | Example  |  
| --- | --- | --- |  
| openlineage.circuitBreaker.type  | Must be set to `javaRuntime` to enable this specific circuit breaker.  | javaRuntime  |  
| openlineage.circuitBreaker.memoryThreshold  | The minimum percentage of free heap memory required. The circuit may open if **free** memory drops below this value. Default `20`.  | 20  |  
| openlineage.circuitBreaker.gcCpuThreshold  | The maximum allowed percentage of CPU time spent on Garbage Collection. The circuit may open if GC time exceeds this value. Default `10`.  | 10  |  
| openlineage.circuitBreaker.circuitCheckIntervalInMillis  | The frequency, in milliseconds, at which the memory and GC thresholds are checked. Default `1000`.  | 1000  |  
| openlineage.circuitBreaker.timeoutInSeconds  | (Optional) A timeout for any single OpenLineage operation. If an emit action takes longer than this, it is terminated. (Since v1.13)  | 90  |  
### Custom Circuit Breaker[​](https://openlineage.io/docs/client/java/configuration/#custom-circuit-breaker "Direct link to Custom Circuit Breaker")
List of available circuit breakers can be extended with custom one loaded via ServiceLoader with own implementation of `io.openlineage.client.circuitBreaker.CircuitBreakerBuilder`.
### Task Queue based Async CircuitBreaker[​](https://openlineage.io/docs/client/java/configuration/#task-queue-based-async-circuitbreaker "Direct link to Task Queue based Async CircuitBreaker")
High-volume Spark applications can generate an excessive number of events, which can overwhelm the connector and negatively impact the application by choking the shared listener bus.
The `TaskQueueCircuitBreaker` is designed to mitigate this issue. It manages event processing by adding each task to a bounded queue and handling them asynchronously. To attempt to preserve event order, it waits a configurable amount of time for a task to complete. For critical situations, a `close()` method allows for abandoning all pending tasks to immediately unblock the listener bus.
  * Yaml Config
  * Spark Config
  * Flink Config



```


circuitBreaker:




type: asyncTaskQueue




threadCount:2




queueSize:10




blockingTimeInSeconds:1




shutdownTimeoutSeconds:60


```
  
| Parameter  | Definition  | Example  |  
| --- | --- | --- |  
| spark.openlineage.circuitBreaker.type  | Must be set to `asyncTaskQueue` to enable this circuit breaker.  | asyncTaskQueue  |  
| spark.openlineage.circuitBreaker.threadCount  | The number of dedicated threads in the fixed-size pool used for processing events. Default `2`.  | 2  |  
| spark.openlineage.circuitBreaker.queueSize  | The maximum number of events that can be held in the queue awaiting processing. New events are rejected if the queue is full. Default `10`.  | 10  |  
| spark.openlineage.circuitBreaker.blockingTimeInSeconds  | Initial blocking time of async call, can be used to improve event ordering. Default `1`.  | 1  |  
| spark.openlineage.circuitBreaker.shutdownTimeoutSeconds  | The maximum time the system will wait for the queue to drain during a graceful shutdown before abandoning any remaining tasks. Default `60`.  | 60  |  
| Parameter  | Definition  | Example  |  
| --- | --- | --- |  
| openlineage.circuitBreaker.type  | Must be set to `asyncTaskQueue` to enable this circuit breaker.  | asyncTaskQueue  |  
| openlineage.circuitBreaker.threadCount  | The number of dedicated threads in the fixed-size pool used for processing events. Default `2`.  | 2  |  
| openlineage.circuitBreaker.queueSize  | The maximum number of events that can be held in the queue awaiting processing. New events are rejected if the queue is full. Default `10`.  | 10  |  
| openlineage.circuitBreaker.blockingTimeInSeconds  | Initial blocking time of async call, can be used to improve event ordering. Default `1`.  | 1  |  
| openlineage.circuitBreaker.shutdownTimeoutSeconds  | The maximum time the system will wait for the queue to drain during a graceful shutdown before abandoning any remaining tasks. Default `60`.  | 60  |  
## Metrics[​](https://openlineage.io/docs/client/java/configuration/#metrics "Direct link to Metrics")
info
This feature is available in OpenLineage 1.11 and above
To ease the operational experience of using the OpenLineage integrations, this document details the metrics collected by the Java client and the configuration settings for various metric backends.
### Metrics collected by Java Client[​](https://openlineage.io/docs/client/java/configuration/#metrics-collected-by-java-client "Direct link to Metrics collected by Java Client")
The following table outlines the metrics collected by the OpenLineage Java client, which help in monitoring the integration's performance:  
| Metric  | Definition  | Type  |  
| --- | --- | --- |  
| `openlineage.emit.start`  | Number of events the integration started to send  | Counter  |  
| `openlineage.emit.complete`  | Number of events the integration completed sending  | Counter  |  
| `openlineage.emit.time`  | Time spent on emitting events  | Timer  |  
| `openlineage.circuitbreaker.engaged`  | Status of the Circuit Breaker (engaged or not)  | Gauge  |  
## Metric Backends[​](https://openlineage.io/docs/client/java/configuration/#metric-backends "Direct link to Metric Backends")
OpenLineage uses [Micrometer](https://micrometer.io) for metrics collection, similar to how SLF4J operates for logging. Micrometer provides a facade over different metric backends, allowing metrics to be dispatched to various destinations.
### Configuring Metric Backends[​](https://openlineage.io/docs/client/java/configuration/#configuring-metric-backends "Direct link to Configuring Metric Backends")
Below are the available backends and potential configurations using Micrometer's facilities.
### StatsD[​](https://openlineage.io/docs/client/java/configuration/#statsd "Direct link to StatsD")
Full configuration options for StatsD can be found in the [Micrometer's StatsDConfig implementation](https://github.com/micrometer-metrics/micrometer/blob/main/implementations/micrometer-registry-statsd/src/main/java/io/micrometer/statsd/StatsdConfig.java).
  * Yaml Config
  * Spark Config
  * Flink Config



```


metrics:




type: statsd




flavor: datadog




host: localhost




port:8125


```
  
| Parameter  | Definition  | Example  |  
| --- | --- | --- |  
| spark.openlineage.metrics.type  | Metrics type selected  | statsd  |  
| spark.openlineage.metrics.flavor  | Flavor of StatsD configuration  | datadog  |  
| spark.openlineage.metrics.host  | Host that receives StatsD metrics  | localhost  |  
| spark.openlineage.metrics.port  | Port that receives StatsD metrics  | 8125  |  
| Parameter  | Definition  | Example  |  
| --- | --- | --- |  
| openlineage.metrics.type  | Metrics type selected  | statsd  |  
| openlineage.metrics.flavor  | Flavor of StatsD configuration  | datadog  |  
| openlineage.metrics.host  | Host that receives StatsD metrics  | localhost  |  
| openlineage.metrics.port  | Port that receives StatsD metrics  | 8125  |  
## Dataset Namespace Resolver[​](https://openlineage.io/docs/client/java/configuration/#dataset-namespace-resolver "Direct link to Dataset Namespace Resolver")
info
This feature is available in OpenLineage 1.17 and above
Oftentimes host addresses are used to access data and a single dataset can be accessed via different addresses. For example, a Kafka topic can be accessed by a list of kafka bootstrap servers or any server from the list. In general, a problem can be solved by adding mechanism which resolves host addresses into logical identifier understood within the organisation. This applies for all clusters like Kafka or Cassandra which should be identified regardless of current list of hosts they contain. This also applies for JDBC urls where a physical address of database can change over time.
### Host List Resolver[​](https://openlineage.io/docs/client/java/configuration/#host-list-resolver "Direct link to Host List Resolver")
Host List Resolver given a list of hosts, replaces host name within the dataset namespace into the resolved value defined.
  * Yaml Config
  * Spark Config
  * Flink Config



```


dataset:




namespaceResolvers:




resolved-name:




type: hostList




hosts:['kafka-prod13.company.com','kafka-prod15.company.com']




schema:"kafka"


```
  
| Parameter  | Definition  | Example  |  
| --- | --- | --- |  
| spark.openlineage.dataset.namespaceResolvers.resolved-name.type  | Resolver type  | hostList  |  
| spark.openlineage.dataset.namespaceResolvers.resolved-name.hosts  | List of hosts  | `['kafka-prod13.company.com', 'kafka-prod15.company.com']`  |  
| spark.openlineage.dataset.namespaceResolvers.resolved-name.schema  | Optional schema to be specified. Resolver will be only applied if schema matches the configure one.  | `kafka`  |  
| Parameter  | Definition  | Example  |  
| --- | --- | --- |  
| openlineage.dataset.namespaceResolvers.resolved-name.type  | Resolver type  | hostList  |  
| openlineage.dataset.namespaceResolvers.resolved-name.hosts  | List of hosts  | `['kafka-prod13.company.com', 'kafka-prod15.company.com']`  |  
| openlineage.dataset.namespaceResolvers.resolved-name.schema  | Optional schema to be specified. Resolver will be only applied if schema matches the configure one.  | `kafka`  |  
### Pattern Namespace Resolver[​](https://openlineage.io/docs/client/java/configuration/#pattern-namespace-resolver "Direct link to Pattern Namespace Resolver")
Java regex pattern is used to identify a host. Substrings matching a pattern will be replaced with resolved name.
  * Yaml Config
  * Spark Config
  * Flink Config



```


dataset:




namespaceResolvers:




resolved-name:




type: pattern




# 'cassandra-prod7.company.com', 'cassandra-prod8.company.com'




regex:'cassandra-prod(\d)+\.company\.com'




schema:"cassandra"


```
  
| Parameter  | Definition  | Example  |  
| --- | --- | --- |  
| spark.openlineage.dataset.namespaceResolvers.resolved-name.type  | Resolver type  | pattern  |  
| spark.openlineage.dataset.namespaceResolvers.resolved-name.hosts  | Regex pattern to find and replace  | `cassandra-prod(\d)+\.company\.com`  |  
| spark.openlineage.dataset.namespaceResolvers.resolved-name.schema  | Optional schema to be specified. Resolver will be only applied if schema matches the configure one.  | `kafka`  |  
| Parameter  | Definition  | Example  |  
| --- | --- | --- |  
| openlineage.dataset.namespaceResolvers.resolved-name.type  | Resolver type  | pattern  |  
| openlineage.dataset.namespaceResolvers.resolved-name.hosts  | Regex pattern to find and replace  | `cassandra-prod(\d)+\.company\.com`  |  
| openlineage.dataset.namespaceResolvers.resolved-name.schema  | Optional schema to be specified. Resolver will be only applied if schema matches the configure one.  | `kafka`  |  
### Pattern Group Namespace Resolver[​](https://openlineage.io/docs/client/java/configuration/#pattern-group-namespace-resolver "Direct link to Pattern Group Namespace Resolver")
For this resolver, Java regex pattern is used to identify a host. However, instead of configured resolved name, a `matchingGroup` is used a resolved name. This can be useful when having several clusters made from hosts with a well-defined host naming convention.
  * Yaml Config
  * Spark Config
  * Flink Config



```


dataset:




namespaceResolvers:




test-pattern:




type: patternGroup




# 'cassandra-test-7.company.com', 'cassandra-test-8.company.com', 'kafka-test-7.company.com', 'kafka-test-8.company.com'




regex:'(?<cluster>[a-zA-Z-]+)-(\d)+\.company\.com:[\d]*'




matchingGroup:"cluster"




schema:"cassandra"


```
  
| Parameter  | Definition  | Example  |  
| --- | --- | --- |  
| spark.openlineage.dataset.namespaceResolvers.pattern-group-resolver.type  | Resolver type  | patternGroup  |  
| spark.openlineage.dataset.namespaceResolvers.pattern-group-resolver.regex  | Regex pattern to find and replace  | `(?<cluster>[a-zA-Z-]+)-(\d)+\.company\.com:[\d]*`  |  
| spark.openlineage.dataset.namespaceResolvers.pattern-group-resolver.matchingGroup  | Matching group named within the regex  | `cluster`  |  
| spark.openlineage.dataset.namespaceResolvers.pattern-group-resolver.schema  | Optional schema to be specified. Resolver will be only applied if schema matches the configure one.  | `kafka`  |  
| Parameter  | Definition  | Example  |  
| --- | --- | --- |  
| openlineage.dataset.namespaceResolvers.pattern-group-resolver.type  | Resolver type  | patternGroup  |  
| openlineage.dataset.namespaceResolvers.pattern-group-resolver.regex  | Regex pattern to find and replace  | `(?<cluster>[a-zA-Z-]+)-(\d)+\.company\.com`  |  
| openlineage.dataset.namespaceResolvers.pattern-group-resolver.matchingGroup  | Matching group named within the regex  | `cluster`  |  
| openlineage.dataset.namespaceResolvers.pattern-group-resolver.schema  | Optional schema to be specified. Resolver will be only applied if schema matches the configure one.  | `kafka`  |  
### Custom Resolver[​](https://openlineage.io/docs/client/java/configuration/#custom-resolver "Direct link to Custom Resolver")
Custom resolver can be added by implementing:
  * `io.openlineage.client.dataset.namespaceResolver.DatasetNamespaceResolver`
  * `io.openlineage.client.dataset.namespaceResolver.DatasetNamespaceResolverBuilder`
  * `io.openlineage.client.dataset.namespaceResolver.DatasetNamespaceResolverConfig`


Config class can be used to pass any namespace resolver parameters through standard configuration mechanism (Spark & Flink configuration or `openlineage.yml` file provided). Standard `ServiceLoader` approach is used to load and initiate custom classes.
## Tags[​](https://openlineage.io/docs/client/java/configuration/#tags "Direct link to Tags")
You can specify tags for Runs and Jobs using the following syntax: Tags added by run will be added as TagsRunFacet, while tags added by jobs will be added as TagsJobFacet.

```



tags:




-"key:value"




-"label"




-"key:value:source"




jobs:




tags:[




"key:value",




"label",




"key:value:source"



```

## Dataset Name Normalization[​](https://openlineage.io/docs/client/java/configuration/#dataset-name-normalization "Direct link to Dataset Name Normalization")
Sometimes, an object storage path used by a job to read or write data does not represent a proper dataset name. To address this, a **dataset name trimmer** can be applied to trim trailing name segments that are not part of the actual dataset name.
### How It Works[​](https://openlineage.io/docs/client/java/configuration/#how-it-works "Direct link to How It Works")
  * The **trimmed dataset name** becomes the dataset name.
  * The **full, non-trimmed dataset name** is stored in the **subset definition facet** as a `LocationSubsetCondition`.


### Why It Matters[​](https://openlineage.io/docs/client/java/configuration/#why-it-matters "Direct link to Why It Matters")
This approach is especially useful for input datasets, where multiple paths may point to the same directory.
  * The **subset definition facet** captures all directories read.
  * This reduces the size of OpenLineage events by avoiding duplication, since otherwise each directory would be treated as a separate dataset.


### Reducing Datasets in Java Client[​](https://openlineage.io/docs/client/java/configuration/#reducing-datasets-in-java-client "Direct link to Reducing Datasets in Java Client")
Datasets are reduced only if:
  1. Their names are trimmed to the same dataset name.
  2. They share identical facets.


By the default, OpenLineage Java client comes with the following trimmers:
  * `io.openlineage.client.dataset.partition.trimmer.DateTrimmer`
  * `io.openlineage.client.dataset.partition.trimmer.KeyValueTrimmer`
  * `io.openlineage.client.dataset.partition.trimmer.MultiDirTrimmer`
  * `io.openlineage.client.dataset.partition.trimmer.YearMonthTrimmer`


The list of the trimmers can be managed by `disabledTrimmers` and `extraTrimmers` configuration parameters.
In most cases, trimmers work on the last directory segment of the dataset name. The trimming process runs iteratively, applying trimmers repeatedly until no additional segments can be removed.
### Trimmers Configuration[​](https://openlineage.io/docs/client/java/configuration/#trimmers-configuration "Direct link to Trimmers Configuration")
  * Yaml Config
  * Spark Config
  * Flink Config



```


dataset:




disabledTrimmers: io.openlineage.client.dataset.partition.trimmer.DateTrimmer




extraTrimmers: org.company.CustomTrimmer


```
  
| Parameter  | Definition  | Example  |  
| --- | --- | --- |  
| spark.openlineage.dataset.disabledTrimmers  | Semicolon separated list of trimmer classes  | `io.openlineage.client.dataset.partition.trimmer.DateTrimmer`  |  
| spark.openlineage.dataset.extraTrimmers  | Semicolon separated list of trimmer classes  | `org.company.CustomTrimmer`  |  
| Parameter  | Definition  | Example  |  
| --- | --- | --- |  
| openlineage.dataset.disabledTrimmers  | Semicolon separated list of trimmer classes  | `io.openlineage.client.dataset.partition.trimmer.DateTrimmer`  |  
| openlineage.dataset.extraTrimmers  | Semicolon separated list of trimmer classes  | `org.company.CustomTrimmer`  |  
### Out of the box trimmers[​](https://openlineage.io/docs/client/java/configuration/#out-of-the-box-trimmers "Direct link to Out of the box trimmers")
#### DateTrimmer[​](https://openlineage.io/docs/client/java/configuration/#datetrimmer "Direct link to DateTrimmer")
Remove a trailing date partition. It checks if the last part of the dataset name contains a valid and recognized date pattern. Then it checks if the other characters in the directory are only numeric and non-numeric `T` and `Z` characters. This behaviour assures agility to detect dates beyond the common formats configured in the trimmer.
  * `.../20250901/` → trims `/20250901/`
  * `.../2025-09-01/` → trims `/2025-09-01/`
  * `.../20250722T901Z/` → trims `/20250722T901Z/` as it contains a valid date pattern with extra digits and non-numeric `T` and `Z` characters only.
  * `.../2025-25-01/` → trims nothing as it is not a valid date
  * `.../dt=2025-09-01/` → may be handled by KeyValueTrimmer


#### KeyValueTrimmer[​](https://openlineage.io/docs/client/java/configuration/#keyvaluetrimmer "Direct link to KeyValueTrimmer")
Remove last part of the dataset name if it follows `key=value` pattern.
  * `.../dt=2025-09-01/` → trims `/dt=2025-09-01/`
  * `.../hour=05/` → trims `/hour=05/`


#### MultiDirDateTrimmer[​](https://openlineage.io/docs/client/java/configuration/#multidirdatetrimmer "Direct link to MultiDirDateTrimmer")
Trims multiple directories at once if they are valid date or year month.
  * `.../2025/09/01/` → trims `/2025/09/01/`
  * `.../2025/09/` → trims `/2025/09/`


#### YearMonthTrimmer[​](https://openlineage.io/docs/client/java/configuration/#yearmonthtrimmer "Direct link to YearMonthTrimmer")
Trims trailing directory if it is a valid year and month.
  * `.../202509/` → trims `/2025/09/`
  * `.../202533/` → trims nothing
  * `.../2025-09/` → trims `/2025-09/`


  * [Environment Variables](https://openlineage.io/docs/client/java/configuration/#environment-variables)
    * [Configuring OpenLineage Client via Dynamic Environment Variables](https://openlineage.io/docs/client/java/configuration/#configuring-openlineage-client-via-dynamic-environment-variables)
  * [Facets Configuration](https://openlineage.io/docs/client/java/configuration/#facets-configuration)
    * [Deprecated and removed syntax](https://openlineage.io/docs/client/java/configuration/#deprecated-and-removed-syntax)
  * [Transports](https://openlineage.io/docs/client/java/configuration/#transports)
    * [Google Cloud Storage](https://openlineage.io/docs/client/java/configuration/#google-cloud-storage)
    * [Error Handling via Transport](https://openlineage.io/docs/client/java/configuration/#error-handling-via-transport)
    * [Defining Your Own Transport](https://openlineage.io/docs/client/java/configuration/#defining-your-own-transport)
  * [Circuit Breakers](https://openlineage.io/docs/client/java/configuration/#circuit-breakers)
    * [Timeout only Circuit Breaker](https://openlineage.io/docs/client/java/configuration/#timeout-only-circuit-breaker)
    * [Simple Memory Circuit Breaker](https://openlineage.io/docs/client/java/configuration/#simple-memory-circuit-breaker)
    * [Java Runtime Circuit Breaker](https://openlineage.io/docs/client/java/configuration/#java-runtime-circuit-breaker)
    * [Custom Circuit Breaker](https://openlineage.io/docs/client/java/configuration/#custom-circuit-breaker)
    * [Task Queue based Async CircuitBreaker](https://openlineage.io/docs/client/java/configuration/#task-queue-based-async-circuitbreaker)
  * [Metrics](https://openlineage.io/docs/client/java/configuration/#metrics)
    * [Metrics collected by Java Client](https://openlineage.io/docs/client/java/configuration/#metrics-collected-by-java-client)
  * [Metric Backends](https://openlineage.io/docs/client/java/configuration/#metric-backends)
    * [Configuring Metric Backends](https://openlineage.io/docs/client/java/configuration/#configuring-metric-backends)
  * [Dataset Namespace Resolver](https://openlineage.io/docs/client/java/configuration/#dataset-namespace-resolver)
    * [Pattern Namespace Resolver](https://openlineage.io/docs/client/java/configuration/#pattern-namespace-resolver)
    * [Pattern Group Namespace Resolver](https://openlineage.io/docs/client/java/configuration/#pattern-group-namespace-resolver)
  * [Dataset Name Normalization](https://openlineage.io/docs/client/java/configuration/#dataset-name-normalization)
    * [Reducing Datasets in Java Client](https://openlineage.io/docs/client/java/configuration/#reducing-datasets-in-java-client)
    * [Trimmers Configuration](https://openlineage.io/docs/client/java/configuration/#trimmers-configuration)
    * [Out of the box trimmers](https://openlineage.io/docs/client/java/configuration/#out-of-the-box-trimmers)


