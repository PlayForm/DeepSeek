[ All articles ](https://blog.openreplay.com/)
# Chrome's Local Network Access (LNA) Permission Explained
Chrome Local Network Access permission gates public sites from reaching local devices. See what triggers the LNA prompt and how to handle it in your web app.
[OpenReplay Team](https://blog.openreplay.com/authors/openreplay-team)
Mar 8, 2026 · 4 min read 
You’re testing a web app that talks to a local API, a dev server running on port 3000, or a hardware device on your network. Chrome suddenly shows a dialog: _“[Site] wants to look for and connect to any device on your local network.”_ You weren’t expecting it. Here’s exactly what’s happening and why.
## Key Takeaways
  * Chrome 142 **enforces** Local Network Access (LNA), a permission prompt that blocks public websites from silently reaching devices on your local network.
  * Requests from a **public origin to a local or loopback address** require explicit user consent.
  * LNA replaces the earlier Private Network Access (PNA) approach, which relied on impractical server-side CORS preflights on local devices.
  * Developers must serve pages over HTTPS, handle permission denials gracefully, and use Permissions Policy to delegate access to iframes.
  * Earlier Chrome versions exposed this behavior behind `chrome://flags/#local-network-access-check` during testing.


## What Is Chrome’s Local Network Access Permission?
Chrome’s Local Network Access (LNA) is a browser security change that prevents public websites from silently making requests to devices on your local network. Starting with Chrome 142, the browser gates these requests behind an explicit user permission prompt.
Before LNA, any website you visited could use your browser as a proxy to quietly probe your router, printer, local API, or any other device on your network — without you knowing. That’s a real attack vector. A malicious site could exploit it to perform [cross-site request forgery (CSRF)](https://owasp.org/www-community/attacks/csrf) against vulnerable local devices or fingerprint your network topology.
LNA closes that gap by requiring user consent first.
This replaces an earlier attempt called [Private Network Access (PNA)](https://developer.chrome.com/blog/private-network-access-update), which relied on server-side CORS preflights and required local devices to explicitly opt in. That approach stalled because updating firmware on millions of routers and IoT devices is impractical. LNA shifts the responsibility to websites instead, which are far easier to update.
For more background, see the official Chrome security update on [Local Network Access restrictions](https://developer.chrome.com/blog/local-network-access/).
## What Triggers the Chrome Local Network Access Permission Prompt?
The prompt appears when a page served from a **public origin** tries to reach a **local or loopback destination**. Chrome defines three address spaces:  
| Address Space  | Examples  |  
| --- | --- |  
| **Loopback**  |  `127.0.0.0/8`, `::1`  |  
| **Local**  |  `192.168.x.x`, `10.x.x.x`, `172.16.0.0–172.31.255.255`, `.local` domains, `fc00::/7`  |  
| **Public**  | Everything else  |  
Any request crossing from public → local or public → loopback triggers LNA. Common developer scenarios that hit this:
  * A hosted web app calling `http://192.168.1.1/api`
  * A cloud dashboard connecting to a locally running agent on `localhost:8080`
  * A device setup page (served from a manufacturer’s public site) communicating with hardware on your LAN
  * A ZTNA or VPN solution routing traffic through IPv6 ranges Chrome classifies as local (like `fc00::/7`)


## Key Constraints Developers Need to Know
**Secure contexts only.** The LNA permission can only be requested from HTTPS pages. However, since local devices often can’t serve HTTPS, Chrome may relax mixed-content restrictions for clearly local targets after permission is granted, since many devices only expose HTTP endpoints.
Copy

```
// Chrome knows this is local — mixed content check exempted
fetch("http://192.168.0.1/ping");

// Chrome knows this is local via annotation
fetch("http://mydevice.example.com/ping", { targetAddressSpace: "local" });

// Chrome does NOT know this is local until DNS resolves — not exempted
fetch("http://example.com/ping");
```

**Workers need special handling.** Service Workers and Shared Workers require the parent origin to have already been granted the LNA permission before they can make local network requests. There’s no way for a worker to trigger the prompt directly.
**Iframes require delegation.** Embedded frames need explicit permission delegation via [Permissions Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Permissions_Policy) (`local-network-access`) to make local network requests.
**WebTransport and WebRTC** are not yet covered by LNA gating — support is expected in future Chrome releases. WebSocket connections to local addresses follow the same local network access restrictions as other network requests.
## Why This Matters More Than It Looks
The Chrome local network security change aligns the browser with what iOS, Android, and macOS have done for years at the OS level. Apps on those platforms already ask for local network access. Chrome is catching up.
For developers accessing local devices from the browser — whether that’s a dev server, a hardware interface, or a local agent — the practical impact is clear: your app now needs to trigger the permission prompt intentionally, handle the case where a user denies it, and ensure requests originate from a secure context.
## Conclusion
Chrome’s Local Network Access permission is a meaningful shift in how browsers handle the boundary between the public web and your private network. For end users, it closes a long-standing blind spot. For developers, it introduces a new requirement: any public-origin page that reaches into local address space must now account for an explicit permission gate.
The adjustment is straightforward. Serve your pages over HTTPS, anticipate permission denials in your UI, delegate access to iframes via Permissions Policy, and test early. Use `chrome://flags/#local-network-access-check` set to “Enabled (Blocking)” to see exactly what Chrome 142 users will experience. The sooner you adapt, the fewer surprises your users will face.
## FAQs
Does LNA affect localhost requests during local development?
If you are serving your app from localhost and making requests to localhost, both endpoints are in the loopback address space. Chrome does not trigger the LNA prompt for same-space requests. The prompt only appears when a public origin tries to reach a local or loopback destination. Local-to-local development workflows remain unaffected.
What happens if a user denies the LNA permission?
The local network request is blocked and the fetch call rejects with a network error. Your app should catch this failure and display a meaningful message explaining that local network access is required. Users can later change the permission through Chrome site settings if they reconsider.
Can I bypass the LNA prompt with enterprise policies?
Yes. Chrome provides enterprise policies that administrators can use to allowlist specific origins or disable the LNA check entirely across managed devices. This is useful for internal tools and kiosk setups where the permission prompt would disrupt workflows.
Does LNA apply to requests made from browser extensions?
Browser extensions operate under a different security model and are not subject to the LNA permission prompt. Extensions with appropriate host permissions can still make requests to local network addresses without triggering the dialog. Only regular web page contexts are gated by LNA.
## Understand every bug
Uncover frustrations, understand bugs and fix slowdowns like never before with **OpenReplay** — self-hosted, with full data ownership.
[ Star on GitHub ](https://github.com/openreplay/openreplay)
### More from the blog
[ Dec 18, 2020, 4 min read  An Easy Guide to Testing React Hooks  ](https://blog.openreplay.com/an-easy-guide-to-testing-react-hooks/) [ Dec 14, 2020, 4 min read  How to Use Props to Pass Data to Child Components in React.js  ](https://blog.openreplay.com/how-to-use-props-to-pass-data-to-child-components-in-react-js/) [ Dec 10, 2020, 6 min read  How to Make HTTP Requests with Axios  ](https://blog.openreplay.com/how-to-make-http-requests-with-axios/)
We use cookies to improve your experience. By using our site, you accept [cookies](https://openreplay.com/legal/privacy).
Accept
