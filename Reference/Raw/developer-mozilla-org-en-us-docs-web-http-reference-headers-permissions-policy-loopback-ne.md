# Permissions-Policy: loopback-network directive
**Experimental:** **This is an[experimental technology](https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Experimental_deprecated_obsolete#experimental)**Check the [Browser compatibility table](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Permissions-Policy/loopback-network#browser_compatibility) carefully before using this in production.
The HTTP [`Permissions-Policy`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Permissions-Policy) header `loopback-network` directive controls whether the current document is allowed to make network requests to loopback addresses.
A loopback address is only accessible on the local host; its target will differ on every device. For example, `127.0.0.1`, which is generally known as `localhost`.
Specifically, where a defined policy blocks use of this feature, requests to loopback addresses will always fail.
See [Local Network Access](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Local_network_access) for more details.     
A list of origins for which permission is granted to use the feature. See [`Permissions-Policy` > Syntax](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Permissions-Policy#syntax) for more details.
##  [Default policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Permissions-Policy/loopback-network#default_policy)
The default allowlist for `loopback-network` is `self`. The top-level browsing context and same-origin iframes are allowed access to the `loopback-network` feature by default.
##  [Examples](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Permissions-Policy/loopback-network#examples)
###  [Basic usage](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Permissions-Policy/loopback-network#basic_usage)
SecureCorp Inc. wants to disallow `loopback-network` within all cross-origin iframes except those whose origin is `https://example.com`. It can do so by delivering the following HTTP response header to define a Permissions Policy:
SecureCorp Inc. must also include an [allow](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe#attributes) attribute on each `<iframe>` element where `loopback-network` is to be allowed:
**Note:** Specifying the `Permissions-Policy` header in this manner disallows `loopback-network` for other origins, even if they are allowed by the `<iframe>` `allow` attribute.
###  [Using the default policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Permissions-Policy/loopback-network#using_the_default_policy)
If an allowlist for `loopback-network` is not defined by a `Permissions-Policy` response header, user agents will apply the default allowlist `self`. In this mode, `loopback-network` is automatically allowed in the top-level browsing context and same-origin iframes, but not in cross-origin iframes.
To allow `loopback-network` in a cross-origin iframe, include an [allow](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe#attributes) attribute on the `<iframe>` element:
##  [Specifications](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Permissions-Policy/loopback-network#specifications)  
|  Specification   |  
| --- |  
| [Local Network Access# permissiondef-loopback-network](https://wicg.github.io/local-network-access/#permissiondef-loopback-network)  |  
##  [Browser compatibility](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Permissions-Policy/loopback-network#browser_compatibility)
##  [See also](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Permissions-Policy/loopback-network#see_also)
  * [Local Network Access](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Local_network_access)
  * [`Permissions-Policy`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Permissions-Policy) header
  * [Permissions Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Permissions_Policy)


##  Help improve MDN 
[Learn how to contribute](https://developer.mozilla.org/en-US/docs/MDN/Community/Getting_started)
This page was last modified on Jun 8, 2026 by [MDN contributors](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Permissions-Policy/loopback-network/contributors.txt). 
[View this page on GitHub](https://github.com/mdn/content/blob/main/files/en-us/web/http/reference/headers/permissions-policy/loopback-network/index.md?plain=1 "Folder: en-us/web/http/reference/headers/permissions-policy/loopback-network \(Opens in a new tab\)") • [Report a problem with this content](https://github.com/mdn/content/issues/new?template=page-report.yml&mdn-url=https%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FHTTP%2FReference%2FHeaders%2FPermissions-Policy%2Floopback-network&metadata=%3C%21--+Do+not+make+changes+below+this+line+--%3E%0A%3Cdetails%3E%0A%3Csummary%3EPage+report+details%3C%2Fsummary%3E%0A%0A*+Folder%3A+%60en-us%2Fweb%2Fhttp%2Freference%2Fheaders%2Fpermissions-policy%2Floopback-network%60%0A*+MDN+URL%3A+https%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FHTTP%2FReference%2FHeaders%2FPermissions-Policy%2Floopback-network%0A*+GitHub+URL%3A+https%3A%2F%2Fgithub.com%2Fmdn%2Fcontent%2Fblob%2Fmain%2Ffiles%2Fen-us%2Fweb%2Fhttp%2Freference%2Fheaders%2Fpermissions-policy%2Floopback-network%2Findex.md%0A*+Last+commit%3A+https%3A%2F%2Fgithub.com%2Fmdn%2Fcontent%2Fcommit%2F75016e5d37ecff3b11de4c2ef6665178f654797e%0A*+Document+last+modified%3A+2026-06-08T12%3A44%3A07.000Z%0A%0A%3C%2Fdetails%3E "This will take you to GitHub to file a new issue.")
