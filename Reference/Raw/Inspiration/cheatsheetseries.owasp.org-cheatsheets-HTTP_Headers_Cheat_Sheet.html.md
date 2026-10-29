# HTTP Security Response Headers Cheat Sheet[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#http-security-response-headers-cheat-sheet "Permanent link")
## Introduction[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#introduction "Permanent link")
HTTP Headers are a great booster for web security with easy implementation. Proper HTTP response headers can help prevent security vulnerabilities like Cross-Site Scripting, Clickjacking, Information disclosure and more.
In this cheat sheet, we will review all security-related HTTP headers, recommended configurations, and reference other sources for complicated headers.
## Security Headers[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#security-headers "Permanent link")
### X-Frame-Options[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#x-frame-options "Permanent link")
The `X-Frame-Options` HTTP response header can be used to indicate whether or not a browser should be allowed to render a page in a `<frame>`, `<iframe>`, `<embed>` or `<object>`. Sites can use this to avoid [clickjacking](https://owasp.org/www-community/attacks/Clickjacking) attacks, by ensuring that their content is not embedded into other sites.
Content Security Policy (CSP) frame-ancestors directive obsoletes X-Frame-Options for supporting browsers ([source](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options)).
X-Frame-Options header is only useful when the HTTP response where it is included has something to interact with (e.g. links, buttons). If the HTTP response is a redirect or an API returning JSON data, X-Frame-Options does not provide any security.
#### Recommendation[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#recommendation "Permanent link")
Use Content Security Policy (CSP) frame-ancestors directive if possible.
Do not allow displaying of the page in a frame.
> `X-Frame-Options: DENY`
### X-XSS-Protection[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#x-xss-protection "Permanent link")
The HTTP `X-XSS-Protection` response header is a feature of Internet Explorer, Chrome, and Safari that stops pages from loading when they detect reflected cross-site scripting (XSS) attacks.
WARNING: Even though this header can protect users of older web browsers that don't yet support CSP, in some cases, this header can create XSS vulnerabilities in otherwise safe websites [source](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection).
#### Recommendation[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#recommendation_1 "Permanent link")
Use a Content Security Policy (CSP) that disables the use of inline JavaScript.
Do not set this header or explicitly turn it off.
> `X-XSS-Protection: 0`
Please see [Mozilla X-XSS-Protection](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection) for details.
### X-Content-Type-Options[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#x-content-type-options "Permanent link")
The `X-Content-Type-Options` response HTTP header is used by the server to indicate to the browsers that the MIME types advertised in the Content-Type headers should be followed and not guessed.
This header is used to block browsers' [MIME type sniffing](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types#mime_sniffing), which can transform non-executable MIME types into executable MIME types ([MIME Confusion Attacks](https://blog.mozilla.org/security/2016/08/26/mitigating-mime-confusion-attacks-in-firefox/)).
#### Recommendation[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#recommendation_2 "Permanent link")
Set the Content-Type header correctly throughout the site.
> `X-Content-Type-Options: nosniff`
### Referrer-Policy[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#referrer-policy "Permanent link")
The `Referrer-Policy` HTTP header controls how much referrer information (sent via the Referer header) should be included with requests.
#### Recommendation[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#recommendation_3 "Permanent link")
Modern browsers default to [`strict-origin-when-cross-origin`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Referrer-Policy#strict-origin-when-cross-origin): same-origin requests include the origin, path, and query string in the `Referer` header; cross-origin requests include only the origin, except HTTPS-to-HTTP requests, which omit the header. Set the header explicitly rather than relying on browser defaults.
> `Referrer-Policy: strict-origin-when-cross-origin`
  * _NOTE:_ For more information on configuring this header please see [Mozilla Referrer-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy).


### Content-Type[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#content-type "Permanent link")
The [`Content-Type`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) representation header is used to indicate the original media type of the resource (before any content encoding is applied for sending). If not set correctly, the resource (e.g. an image) may be interpreted as HTML, making XSS vulnerabilities possible.
Although it is recommended to always set the `Content-Type` header correctly, it would constitute a vulnerability only if the content is intended to be rendered by the client and the resource is untrusted (provided or modified by a user).
#### Recommendation[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#recommendation_4 "Permanent link")
> `Content-Type: text/html; charset=UTF-8`
  * _NOTE:_ the `charset` attribute is necessary to prevent XSS in **HTML** pages
  * _NOTE_ : the `Content-Type` can be any of the possible [MIME types](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types)


### Cache-Control[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#cache-control "Permanent link")
The `Cache-Control` header defines how responses are cached by browsers and intermediate caches.
#### Recommendation[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#recommendation_5 "Permanent link")
  * Use [`no-store`](https://www.rfc-editor.org/rfc/rfc9111.html#section-5.2.2.5) for sensitive responses to prohibit storage in compliant HTTP caches.
  * Use `private` to allow caching only in non-shared (user-specific) caches and to prevent storage in shared caches (note that private caches may still persist the response).
  * Avoid relying on default caching behavior for sensitive or protected content.
  * Be aware that `no-cache` does not prevent caching; it allows caches to store responses. It requires revalidation with the origin server before reuse.


`no-store` does not control every storage mechanism: the [Cache API does not honor HTTP caching headers](https://developer.mozilla.org/en-US/docs/Web/API/Cache). Explicitly exclude sensitive responses from application-managed caches and remove existing sensitive entries; see [Offline Applications](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html#offline-applications).
#### References[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#references "Permanent link")


### Set-Cookie[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#set-cookie "Permanent link")
The [`Set-Cookie`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie) HTTP response header is used to send a cookie from the server to the user agent, so the user agent can send it back to the server later. To send multiple cookies, multiple Set-Cookie headers should be sent in the same response.
This is not a security header per se, but its security attributes are crucial.
#### Recommendation[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#recommendation_6 "Permanent link")
  * Please read [Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#cookies) for a detailed explanation on cookie configuration options.


### Strict-Transport-Security (HSTS)[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#strict-transport-security-hsts "Permanent link")
The HTTP [`Strict-Transport-Security`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security) response header (often abbreviated as HSTS) instructs browsers to only access the website using HTTPS, even if a user attempts to connect over HTTP.
#### Recommendation[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#recommendation_7 "Permanent link")
> `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  * _NOTE_ : Read carefully how this header works before using it. If the HSTS header is misconfigured or if there is a problem with the SSL/TLS certificate being used, legitimate users might be unable to access the website. For example, if the HSTS header is set to a very long duration and the SSL/TLS certificate expires or is revoked, legitimate users might be unable to access the website until the HSTS header duration has expired.


See the [HSTS preload requirements](https://hstspreload.org/) before requesting preload inclusion.
Please check out [HTTP Strict Transport Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Strict_Transport_Security_Cheat_Sheet.html) for more information.
### Expect-CT ❌[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#expect-ct "Permanent link")
The `Expect-CT` header lets sites opt-in to reporting of Certificate Transparency (CT) requirements. Given that mainstream clients now require CT qualification, the only remaining value is reporting such occurrences to the nominated report-uri value in the header. The header is now less about enforcement and more about detection/reporting.
#### Recommendation[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#recommendation_8 "Permanent link")
Do not use it. Mozilla [recommends](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Expect-CT) avoiding it, and removing it from existing code if possible.
### Content-Security-Policy (CSP)[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#content-security-policy-csp "Permanent link")
Content Security Policy (CSP) is a security feature that is used to specify the origin of content that is allowed to be loaded on a website or in a web application. It is an added layer of security that helps to detect and mitigate certain types of attacks, including Cross-Site Scripting (XSS) and data injection attacks. These attacks are used for everything from data theft to site defacement to distribution of malware.
  * _NOTE_ : This header is relevant to be applied in pages which can load and interpret scripts and code, but might be meaningless in the response of a REST API that returns content that is not going to be rendered.


#### Recommendation[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#recommendation_9 "Permanent link")
Content Security Policy is complex to configure and maintain. For an explanation on customization options, please read [Content Security Policy Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
### Access-Control-Allow-Origin[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#access-control-allow-origin "Permanent link")
If you don't use this header, your site is protected by default by the Same Origin Policy (SOP). What this header does is relax this control in specified circumstances.
The `Access-Control-Allow-Origin` is a CORS (cross-origin resource sharing) header. This header indicates whether the response it is related to can be shared with requesting code from the given origin. In other words, if siteA requests a resource from siteB, siteB should indicate in its `Access-Control-Allow-Origin` header that siteA is allowed to fetch that resource, if not, the access is blocked due to Same Origin Policy (SOP).
#### Recommendation[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#recommendation_10 "Permanent link")
If you use it, set specific [origins](https://developer.mozilla.org/en-US/docs/Glossary/Origin) instead of `*`. Check out [Access-Control-Allow-Origin](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin) for details.
> `Access-Control-Allow-Origin: https://yoursite.com`
  * _NOTE_ : The use of '*' might be necessary depending on your needs. For example, for a public API that should be accessible from any origin, it might be necessary to allow '*'.


### Cross-Origin-Opener-Policy (COOP)[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#cross-origin-opener-policy-coop "Permanent link")
The HTTP `Cross-Origin-Opener-Policy` (COOP) response header allows you to ensure a top-level document does not share a browsing context group with cross-origin documents.
This header works together with Cross-Origin-Embedder-Policy (COEP) and Cross-Origin-Resource-Policy (CORP) explained below.
This mechanism protects against attacks like Spectre which can cross the security boundary established by Same Origin Policy (SOP) for resources in the same browsing context group.
As these headers are very related to browsers, it may not make sense to be applied to REST APIs or clients that are not browsers.
#### Recommendation[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#recommendation_11 "Permanent link")
Isolates the browsing context exclusively to same-origin documents.
> `Cross-Origin-Opener-Policy: same-origin`
### Cross-Origin-Embedder-Policy (COEP)[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#cross-origin-embedder-policy-coep "Permanent link")
The HTTP [`Cross-Origin-Embedder-Policy`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Embedder-Policy) (COEP) response header prevents a document from loading any cross-origin resources that don't explicitly grant the document permission (using [CORP](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#cross-origin-resource-policy-corp) or CORS).
  * _NOTE_ : Enabling this will block cross-origin resources not configured correctly from loading.


#### Recommendation[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#recommendation_12 "Permanent link")
A document can only load resources from the same origin, or resources explicitly marked as loadable from another origin.
> `Cross-Origin-Embedder-Policy: require-corp`
  * _NOTE_ : The `crossorigin` attribute requests the resource in CORS mode. The resource server must [permit the request through CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Embedder-Policy#require-corp); the attribute alone does not grant permission:
  * `<img src="https://thirdparty.com/img.png" crossorigin>`


### Cross-Origin-Resource-Policy (CORP)[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#cross-origin-resource-policy-corp "Permanent link")
The [`Cross-Origin-Resource-Policy`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Resource-Policy) (CORP) header allows you to control the set of origins that are empowered to include a resource. It is a robust defense against attacks like [Spectre](https://meltdownattack.com/), as it allows browsers to block a given response before it enters an attacker's process.
#### Recommendation[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#recommendation_13 "Permanent link")
Limit current resource loading to the site and sub-domains only.
> `Cross-Origin-Resource-Policy: same-site`
### Permissions-Policy (formerly Feature-Policy)[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#permissions-policy-formerly-feature-policy "Permanent link")
Permissions-Policy allows you to control which origins can use which browser features, both in the top-level page and in embedded frames. For every feature controlled by Feature Policy, the feature is only enabled in the current document or frame if its origin matches the allowed list of origins. This means that you can configure your site to never allow the camera or microphone to be activated. This prevents that an injection, for example an XSS, enables the camera, the microphone, or other browser feature.
More information: [Permissions-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy)
#### Recommendation[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#recommendation_14 "Permanent link")
Set it and disable all the features that your site does not need or allow them only to the authorized domains:
> `Permissions-Policy: geolocation=(), camera=(), microphone=()`
  * _NOTE_ : This example is disabling geolocation, camera, and microphone for all domains.


### Server[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#server "Permanent link")
The [`Server`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Server) header describes the software used by the origin server that handled the request — that is, the server that generated the response.
This is not a security header, but how it is used is relevant for security.
#### Recommendation[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#recommendation_15 "Permanent link")
Remove this header or set non-informative values.
> `Server: webserver`
  * _NOTE_ : Remember that attackers have other means of fingerprinting the server technology.


### X-Powered-By[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#x-powered-by "Permanent link")
The `X-Powered-By` header describes the technologies used by the webserver. This information exposes the server to attackers. Using the information in this header, attackers can find vulnerabilities easier.
#### Recommendation[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#recommendation_16 "Permanent link")
Remove all `X-Powered-By` headers.
  * _NOTE_ : Remember that attackers have other means of fingerprinting your tech stack.


### X-AspNet-Version[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#x-aspnet-version "Permanent link")
Provides information about the .NET version.
#### Recommendation[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#recommendation_17 "Permanent link")
Disable sending this header. Add the following line in your `web.config` in the `<system.web>` section to remove it.

```
<httpRuntimeenableVersionHeader="false"/>

```

  * _NOTE_ : Remember that attackers have other means of fingerprinting your tech stack.


### X-AspNetMvc-Version[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#x-aspnetmvc-version "Permanent link")
Provides information about the .NET version.
#### Recommendation[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#recommendation_18 "Permanent link")
Disable sending this header. To remove the `X-AspNetMvc-Version` header, add the below line in `Global.asax` file.

```
MvcHandler.DisableMvcResponseHeader = true;

```

  * _NOTE_ : Remember that attackers have other means of fingerprinting your tech stack.


### X-Robots-Tag[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#x-robots-tag "Permanent link")
The HTTP `X-Robots-Tag` response header controls how search engines and other automated crawlers index and display resources such as PDFs, images, and other non-HTML content. It functions similarly to the `<meta name="robots">` tag, but is applied via the HTTP response header, allowing greater flexibility (e.g., for non-HTML files or server-wide rules).

```
X-Robots-Tag: noindex, nofollow

```

  * **Note:** Only compliant crawlers respect these directives, and they must still make an HTTP request to read the headers before deciding how to handle the content.


#### Recommendation[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#recommendation_19 "Permanent link")
Use the `X-Robots-Tag` header to control crawler behavior:
  * For **private or sensitive content** you don’t want indexed:


> `X-Robots-Tag: noindex, nofollow` This prevents compliant search engines from indexing the resource or following links on it.
  * For **public content** you want indexed and discoverable (e.g., documentation, datasets):


> `X-Robots-Tag: index, follow` This allows search engines to index the resource and follow its links.
You can also use other directives such as `noarchive`, `nosnippet`, or `noimageindex` depending on your needs. Server configuration can apply this header selectively — for example, only on specific file types (like PDFs or images).
### X-DNS-Prefetch-Control[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#x-dns-prefetch-control "Permanent link")
The `X-DNS-Prefetch-Control` HTTP response header controls DNS prefetching, a feature by which browsers proactively perform domain name resolution on both links that the user may choose to follow as well as URLs for items referenced by the document, including images, CSS, JavaScript, and so forth.
#### Recommendation[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#recommendation_20 "Permanent link")
The default behavior of browsers is to perform DNS caching which is good for most websites. If you do not control links on your website, you might want to set `off` as a value to disable DNS prefetch to avoid leaking information to those domains.
> `X-DNS-Prefetch-Control: off`
  * _NOTE_ : Do not rely on this functionality for anything production sensitive: it is not standard or fully supported and implementation may vary among browsers.


### Public-Key-Pins (HPKP) ❌[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#public-key-pins-hpkp "Permanent link")
The HTTP `Public-Key-Pins` response header was used to associate a specific cryptographic public key with a web server to mitigate MITM attacks with forged certificates. It was removed from Chromium in 2018 and is unsupported by all modern browsers.
#### Recommendation[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#recommendation_21 "Permanent link")
Do not use. Remove any `Public-Key-Pins` or `Public-Key-Pins-Report-Only` headers from production. Rely on Certificate Transparency (CT) and CAA DNS records, which provide superior compromise detection without the operational brittleness of pinning.
### Secure File Download Headers[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#secure-file-download-headers "Permanent link")
When serving user-provided files, proper HTTP headers should be used to prevent unintended execution in the browser.
  * Use `Content-Disposition: attachment` to force download instead of inline rendering.
  * Use `Content-Type: application/octet-stream` for unknown or binary files.
  * Ensure `X-Content-Type-Options: nosniff` is set to prevent MIME type sniffing.


These headers help reduce risks such as Cross-Site Scripting (XSS) and unintended file execution.
## Adding HTTP Headers in Different Technologies[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#adding-http-headers-in-different-technologies "Permanent link")
### PHP[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#php "Permanent link")
The sample code below sets the `X-Frame-Options` header in PHP.

```
header("X-Frame-Options: DENY");

```

### Apache[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#apache "Permanent link")
Below is an `.htaccess` sample configuration which sets the `X-Frame-Options` header in Apache.
As described in the [Apache documentation](https://httpd.apache.org/docs/2.4/mod/mod_headers.html#header), `Header set` (default `onsuccess`) and `Header always set` operate on separate internal header tables.
In some cases, both header tables may be used, which can result in duplicate headers if the same header is configured in both contexts.
If a header needs to be removed entirely, it should be unset in both contexts (`onsuccess` and `always`).
To avoid duplication and ensure the header is sent on all responses, unset it first and then use `always set`:

```
<IfModule mod_headers.c>
  Header unset X-Frame-Options
  Header always set X-Frame-Options "DENY"
</IfModule>

```

### IIS[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#iis "Permanent link")
Add configurations below to your `Web.config` in IIS to send the `X-Frame-Options` header.

```
<system.webServer>
...
<httpProtocol>
<customHeaders>
<addname="X-Frame-Options"value="DENY"/>
</customHeaders>
</httpProtocol>
...
</system.webServer>

```

### HAProxy[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#haproxy "Permanent link")
Add the line below to your front-end, listen, or backend configurations to send the `X-Frame-Options` header.

```
http-response set-header X-Frame-Options DENY

```

### Nginx[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#nginx "Permanent link")
Below is a sample configuration, it sets the `X-Frame-Options` header in Nginx. Note that without the `always` option, the header will only be sent for certain status codes, as described in [the nginx documentation](https://nginx.org/en/docs/http/ngx_http_headers_module.html#add_header).

```
add_header "X-Frame-Options" "DENY" always;

```

### Express[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#express "Permanent link")
You can use [helmet](https://www.npmjs.com/package/helmet) to setup HTTP headers in Express. The code below is a sample for adding the `X-Frame-Options` header.

```
consthelmet=require('helmet');
constapp=express();
// Sets "X-Frame-Options: SAMEORIGIN"
app.use(
helmet.frameguard({
action:"sameorigin",
})
);

```

## Testing Proper Implementation of Security Headers[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#testing-proper-implementation-of-security-headers "Permanent link")
### Mozilla Observatory[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#mozilla-observatory "Permanent link")
The [Mozilla Observatory](https://observatory.mozilla.org/) is an online tool which helps you to check your website's header status.
### SmartScanner[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#smartscanner "Permanent link")
[SmartScanner](https://www.thesmartscanner.com/) has a dedicated [test profile](https://www.thesmartscanner.com/docs/configuring-security-tests) for testing security of HTTP headers. Online tools usually test the homepage of the given address. But SmartScanner scans the whole website. So, you can make sure all of your web pages have the right HTTP Headers in place.
## References[¶](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#references_1 "Permanent link")
  * [MDN Web Docs: X-Content-Type-Options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options)
  * [MDN Web Docs: Cross-Origin-Opener-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Opener-Policy)
  * [OWASP Secure Headers Project: Response Headers](https://owasp.github.io/www-project-secure-headers/response-headers/)


