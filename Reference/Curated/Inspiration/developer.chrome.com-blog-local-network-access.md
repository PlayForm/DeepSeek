# New permission prompt for Local Network Access

Chris Thompson - Published: June 9, 2025

Chrome is adding a new permission prompt for sites that make connections to a user's local network as part of the [Local Network Access specification](https://wicg.github.io/local-network-access/). The aim is to protect users from cross-site request forgery (CSRF) attacks targeting routers and other devices on private networks, and to reduce the ability of sites to use these requests to fingerprint the user's local network.

To understand how this change impacts the web ecosystem, the Chrome team is looking for feedback from developers who build web applications that rely on making connections to a user's local network or to software running locally on the user's machine. From Chrome 138, you can opt-in to these new restrictions by going to `chrome://flags/#local-network-access-check` and setting the flag to "Enabled (Blocking)".

## What is Local Network Access?

[Local Network Access](https://github.com/WICG/local-network-access) restricts the ability of websites to send requests to servers on a user's local network (including servers running locally on the user's machine), requiring the user grant the site permission before such requests can be made. The ability to request this permission is restricted to secure contexts.

_Example of Chrome's Local Network Access permission prompt._

Many other platforms, such as [Android](https://developer.android.com/privacy-and-security/local-network-permission), [iOS](https://support.apple.com/en-us/102229), and [MacOS](https://support.apple.com/guide/mac-help/control-access-to-your-local-network-on-mac-mchla4f49138/mac) have a local network access permission. For example, you may have granted this permission to access the local network to the Google Home app when setting up new Google TV and Chromecast devices.

## What kinds of requests are affected?

For the first milestone of Local Network Access, we consider a "local network request" to be any request _from_ the public network _to_ a local network or loopback destination.

A _local network_ is any destination that resolves to addresses reserved for local use. For example, private IPv4 addresses specified in Section 3 of [RFC1918](https://tools.ietf.org/html/rfc1918) (e.g., `192.168.0.0/16`), the IPv4 "link-local" prefix (`169.254.0.0/16`) defined in [RFC3927](https://tools.ietf.org/html/rfc3927), the IPv6 "Unique Local Address" prefix (`fc00::/7`) defined in Section 3 of [RFC4193](https://tools.ietf.org/html/rfc4193), the IPv6 "link-local" prefix (`fe80::/10`) defined in section 2.5.6 of [RFC4291](https://tools.ietf.org/html/rfc4291), or an IPv4-mapped IPv6 address (`::ffff:0:0/96`) where the mapped IPv4 address is itself local.

_Loopback_ is any destination that resolves to the local machine (i.e., "loopback" interface), such as the IPv4 loopback prefix (`127.0.0.0/8`) defined in section 3.2.1.3 of [RFC1122](https://tools.ietf.org/html/rfc1122), or the IPv6 loopback (`::1/128`) defined in section 2.5.3 of [RFC4291](https://tools.ietf.org/html/rfc4291).

For a full mapping of IP addresses to address spaces, see the [table in the Local Network Access specification](https://wicg.github.io/local-network-access/#non-public-ip-address-blocks).

A _public network_ is any other destination.

Because the local network access permission is restricted to secure contexts, and it can be difficult to migrate local network devices to HTTPS, the permission-gated local network requests will now be exempted from mixed content checks _if_ Chrome knows that the requests will be going to the local network before resolving the destination. Chrome knows a request is going to the local network if:

* The request hostname is a private IP literal (e.g., `192.168.0.1`).
* The request hostname is a `.local` domain.
* The `fetch()` call is annotated with the option `targetAddressSpace: "local".`

```js
// Example 1: Private IP literal is exempt from mixed content.
fetch("http://192.168.0.1/ping");

// Example 2: `.local` domain is exempt from mixed content.
fetch("http://router.local/ping");

// Example 3: Public domain is not exempt from mixed content,
// even if it resolves to a local network address.
fetch("http://example.com/ping");

// Example 4: Adding the `targetAddressSpace` option flags that
// the request will go to the local network, and is thus exempt
// from mixed content.
fetch("http://example.com/ping",{
  targetAddressSpace:"local",
});
```

## What's changing in Chrome

### Chrome 138

Our initial version of Local Network Access is ready for opt-in testing in Chrome 138. Users can enable the new permission prompt by setting `chrome://flags#local-network-access-check` to "Enabled (Blocking)". This supports triggering the Local Network Access permission prompt for requests initiated using the JavaScript `fetch()` API, subresource loading, and subframe navigation.

A demo site is available at <https://lna-testing.notyetsecure.com/> for triggering different forms of local network requests.

#### Known issues and limitations

* WebSockets ([crbug.com/421156866](https://crbug.com/421156866)), WebTransport ([crbug.com/421216834](https://crbug.com/421216834)), and WebRTC ([crbug.com/421223919](https://crbug.com/421223919)) connections to the local network are not yet gated on the LNA permission.
* Local network requests from Service Workers and Shared Workers require that the worker's origin has previously been granted the Local Network Access permission.
  * If your application makes local network requests from a service worker, you will need to separately trigger a local network request from your application in order to trigger the permission prompt. (We are working on a way for workers to trigger the permission prompt if there is an active document available - see [crbug.com/404887282](https://crbug.com/404887282).)

### Chrome 139 and beyond

Our intent is to ship Local Network Access as soon as possible. Recognizing that some sites may need additional time to be updated with Local Network Access annotations, we will add an Origin Trial to let sites temporarily opt-out of the secure contexts requirement before we ship Local Network Access by default. This should provide a clearer migration path for developers, especially if you rely on accessing local network resources over HTTP (as these requests would be blocked as mixed content if requested from an HTTPS page in browsers that don't yet support the Local Network Access mixed content exemption).

We will also be adding a Chrome enterprise policy for controlling which sites can and cannot make local network requests (pre-granting or pre-denying the permission to those sites). This will allow managed Chrome installations, such as those in corporate settings, to avoid showing the warning for known intended use cases, or to further lock down and prevent sites from being able to request the permission at all.

We plan to continue integrating the Local Network Access permission with different features that can send requests to the local network. For example, we plan to ship Local Network Access for WebSockets, WebTransport, and WebRTC connections soon.

We will share more information as we get closer to being able to fully launch Local Network Access in Chrome.

## Feedback wanted

Previous feedback on Private Network Access development was incredibly valuable in guiding us to our new Local Network Access permission approach. We would like to once again thank everyone who has been involved over years.

If you develop or are a user of a website that relies on making connections to the user's local network or software running locally on the user's machine, the Chrome team is interested in your feedback and use cases. There are two things you can do to help:

* Go to `chrome://flags#local-network-access-check`, set the flag to "Enabled (Blocking)", and see if your website correctly triggers the new permission prompt (and works as expected after you grant the permission).
* If you encounter any issues or have feedback, [file an issue at the Chromium Issue Tracker](https://issues.chromium.org/u/1/issues/new?component=1456234&template=0) or on our [LNA specification GitHub repository](https://github.com/WICG/local-network-access/issues/new). Chrome would love to hear from you.

Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.

Last updated 2025-06-09 UTC.
