# EventSource
Baseline 
Widely available
*
This feature is well established and works across many devices and browser versions. It’s been available across browsers since January 2020.
* Some parts of this feature may have varying levels of support. 
  * [ See full compatibility ](https://developer.mozilla.org/en-US/docs/Web/API/EventSource#browser_compatibility)


**Note:** This feature is available in [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API).
The **`EventSource`**interface is web content's interface to[server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events).
An `EventSource` instance opens a persistent connection to an [HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP) server, which sends [events](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Events) in `text/event-stream` format. The connection remains open until closed by calling [`EventSource.close()`](https://developer.mozilla.org/en-US/docs/Web/API/EventSource/close).
[ EventTarget  ](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget)[ EventSource  ](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)
Once the connection is opened, incoming messages from the server are delivered to your code in the form of events. If there is an event field in the incoming message, the triggered event is the same as the event field value. If no event field is present, then a generic [`message`](https://developer.mozilla.org/en-US/docs/Web/API/EventSource/message_event "message") event is fired.
Unlike [WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API), server-sent events are unidirectional; that is, data messages are delivered in one direction, from the server to the client (such as a user's web browser). That makes them an excellent choice when there's no need to send data from the client to the server in message form. For example, `EventSource` is a useful approach for handling things like social media status updates, news feeds, or delivering data into a [client-side storage](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_APIs/Client-side_storage) mechanism like [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) or [web storage](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API).
**Warning:** When **not used over HTTP/2** , SSE suffers from a limitation to the maximum number of open connections, which can be specially painful when opening various tabs as the limit is _per browser_ and set to a very low number (6). The issue has been marked as "Won't fix" in [Chrome](https://crbug.com/275955 "External link \(opens in new tab\)") and [Firefox](https://bugzil.la/906896 "External link \(opens in new tab\)"). This limit is per browser + domain, so that means that you can open 6 SSE connections across all of the tabs to `www.example1.com` and another 6 SSE connections to `www.example2.com`. (from [Stack Overflow](https://stackoverflow.com/questions/5195452/websockets-vs-server-sent-events-eventsource/5326159 "External link \(opens in new tab\)")). When using HTTP/2, the maximum number of simultaneous _HTTP streams_ is negotiated between the server and the client (defaults to 100).
##  [Constructor](https://developer.mozilla.org/en-US/docs/Web/API/EventSource#constructor)     
Creates a new `EventSource` to handle receiving server-sent events from a specified URL, optionally in credentials mode.
##  [Instance properties](https://developer.mozilla.org/en-US/docs/Web/API/EventSource#instance_properties)
_This interface also inherits properties from its parent,[`EventTarget`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget)._ 

[`EventSource.readyState`](https://developer.mozilla.org/en-US/docs/Web/API/EventSource/readyState) Read only 
    
A number representing the state of the connection. Possible values are `CONNECTING` (`0`), `OPEN` (`1`), or `CLOSED` (`2`). 

[`EventSource.url`](https://developer.mozilla.org/en-US/docs/Web/API/EventSource/url) Read only 
    
A string representing the URL of the source. 

[`EventSource.withCredentials`](https://developer.mozilla.org/en-US/docs/Web/API/EventSource/withCredentials) Read only 
    
A boolean value indicating whether the `EventSource` object was instantiated with cross-origin ([CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)) credentials set (`true`), or not (`false`, the default).
##  [Instance methods](https://developer.mozilla.org/en-US/docs/Web/API/EventSource#instance_methods)
_This interface also inherits methods from its parent,[`EventTarget`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget)._ 

[`EventSource.close()`](https://developer.mozilla.org/en-US/docs/Web/API/EventSource/close)
    
Closes the connection, if any, and sets the `readyState` attribute to `CLOSED`. If the connection is already closed, the method does nothing.     
Fired when a connection to an event source failed to open.     
Fired when data is received from an event source.     
Fired when a connection to an event source has opened.
Additionally, the event source itself may send messages with an event field, which will create ad hoc events keyed to that value.
##  [Examples](https://developer.mozilla.org/en-US/docs/Web/API/EventSource#examples)
In this basic example, an `EventSource` is created to receive unnamed events from the server; a page with the name `sse.php` is responsible for generating the events.
Each received event causes our `EventSource` object's `onmessage` event handler to be run. It, in turn, creates a new [`<li>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/li) element and writes the message's data into it, then appends the new element to the list element already in the document.
**Note:** You can find a full example on GitHub — see [Simple SSE demo using PHP](https://github.com/mdn/dom-examples/tree/main/server-sent-events "External link \(opens in new tab\)").
To listen to named events, you'll require a listener for each type of event sent.
##  [Specifications](https://developer.mozilla.org/en-US/docs/Web/API/EventSource#specifications)  
|  Specification   |  
| --- |  
| [HTML# the-eventsource-interface](https://html.spec.whatwg.org/multipage/server-sent-events.html#the-eventsource-interface)  |  
##  [Browser compatibility](https://developer.mozilla.org/en-US/docs/Web/API/EventSource#browser_compatibility)
##  [See also](https://developer.mozilla.org/en-US/docs/Web/API/EventSource#see_also)
  * [Server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
  * [Using server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)


##  Help improve MDN 
[Learn how to contribute](https://developer.mozilla.org/en-US/docs/MDN/Community/Getting_started)
This page was last modified on Mar 13, 2025 by [MDN contributors](https://developer.mozilla.org/en-US/docs/Web/API/EventSource/contributors.txt). 
[View this page on GitHub](https://github.com/mdn/content/blob/main/files/en-us/web/api/eventsource/index.md?plain=1 "Folder: en-us/web/api/eventsource \(Opens in a new tab\)") • [Report a problem with this content](https://github.com/mdn/content/issues/new?template=page-report.yml&mdn-url=https%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FAPI%2FEventSource&metadata=%3C%21--+Do+not+make+changes+below+this+line+--%3E%0A%3Cdetails%3E%0A%3Csummary%3EPage+report+details%3C%2Fsummary%3E%0A%0A*+Folder%3A+%60en-us%2Fweb%2Fapi%2Feventsource%60%0A*+MDN+URL%3A+https%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FAPI%2FEventSource%0A*+GitHub+URL%3A+https%3A%2F%2Fgithub.com%2Fmdn%2Fcontent%2Fblob%2Fmain%2Ffiles%2Fen-us%2Fweb%2Fapi%2Feventsource%2Findex.md%0A*+Last+commit%3A+https%3A%2F%2Fgithub.com%2Fmdn%2Fcontent%2Fcommit%2F4d929bb0a021c7130d5a71a4bf505bcb8070378d%0A*+Document+last+modified%3A+2025-03-13T12%3A48%3A23.000Z%0A%0A%3C%2Fdetails%3E "This will take you to GitHub to file a new issue.")
