# Browser
**Status:**
**type:** `browser`
**Description:** The web browser in which the application represented by the resource is running. The `browser.*` attributes MUST be used only for resources that represent applications running in a web browser (regardless of whether running on a mobile or desktop device).
Warning
This entity definition contains attributes without a role. Stable Entities MUST NOT have attributes without a defined role.
**Attributes:**  
| Role  | Key  | Stability  | Value Type  | Description  | Example Values  |  
| --- | --- | --- | --- | --- | --- |  
| Other  | `Recommended`  | string[]  | Array of brand name and version separated by a space [1]  | `[" Not A;Brand 99", "Chromium 99", "Chrome 99"]`  |  
| Other  | `Recommended`  | string  | Preferred language of the user using the browser [2]  |  `en`; `en-US`; `fr`; `fr-FR`  |  
| Other  | `Recommended`  | boolean  | A boolean that is true if the browser is running on a mobile device [3]  |  
| Other  | `Recommended`  | string  | The platform on which the browser is running [4]  |  `Windows`; `macOS`; `Android`  |  
| Other  | `Recommended`  | string  | Full user-agent string provided by the browser [5]  | `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36`  |  
**[1]`browser.brands` :** This value is intended to be taken from the [UA client hints API](https://wicg.github.io/ua-client-hints/#interface) (`navigator.userAgentData.brands`).
**[2]`browser.language` :** This value is intended to be taken from the Navigator API `navigator.language`.
**[3]`browser.mobile` :** This value is intended to be taken from the [UA client hints API](https://wicg.github.io/ua-client-hints/#interface) (`navigator.userAgentData.mobile`). If unavailable, this attribute SHOULD be left unset.
**[4]`browser.platform` :** This value is intended to be taken from the [UA client hints API](https://wicg.github.io/ua-client-hints/#interface) (`navigator.userAgentData.platform`). If unavailable, the legacy `navigator.platform` API SHOULD NOT be used instead and this attribute SHOULD be left unset in order for the values to be consistent. The list of possible values is defined in the [W3C User-Agent Client Hints specification](https://wicg.github.io/ua-client-hints/#sec-ch-ua-platform). Note that some (but not all) of these values can overlap with values in the [`os.type` and `os.name` attributes](https://opentelemetry.io/docs/specs/semconv/resource/os/). However, for consistency, the values in the `browser.platform` attribute should capture the exact value that the user agent provides.
**[5]`user_agent.original` :** To retrieve the value, the legacy `navigator.userAgent` API can be used.
All of these attributes can be provided by the user agent itself in the form of an HTTP header (e.g. Sec-CH-UA, Sec-CH-Platform, User-Agent). However, the headers could be removed by proxy servers, and are tied to calls from individual clients. In order to support batching through services like the Collector and to prevent loss of data (e.g. due to proxy servers removing headers), these attributes should be used when possible.
**type:** `browser.document`
**Status:**
**type:** `browser.document`
**Description:** The web page document loaded in the browser.
**Attributes:**  
| Role  | Key  | Stability  | Value Type  | Description  | Example Values  |  
| --- | --- | --- | --- | --- | --- |  
| Identity  | [`browser.document.url.full`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/browser/)  | `Recommended`  | string  | Absolute URL of the current browser document according to [RFC3986](https://www.rfc-editor.org/rfc/rfc3986).  | `https://www.example.com/search?q=OpenTelemetry#SemConv`  |  
## Feedback
Was this page helpful?
Yes No
Thank you. Your feedback is appreciated!
Please let us know [how we can improve this page](https://github.com/open-telemetry/opentelemetry.io/issues/new?template=PAGE_FEEDBACK.yml&title=\[Page+feedback\]%3A+ADD+A+SUMMARY+OF+YOUR+FEEDBACK+HERE). Your feedback is appreciated!
