[↑ Jump to Table of Contents](https://wicg.github.io/local-network-access/#toc)[→ Pop Out Sidebar](https://wicg.github.io/local-network-access/#toc) light dark auto
# Local Network Access
[Draft Community Group Report](https://www.w3.org/standards/types/#CG-DRAFT), 7 August 2026
More details about this document 

This version: 
     <https://wicg.github.io/local-network-access/> 

Issue Tracking: 
     [Inline In Spec](https://wicg.github.io/local-network-access/#issues-index) 

Editors: 
     Chris Thompson ([Google](https://google.com)) 
[Copyright](https://www.w3.org/policies/#copyright) © 2026 [World Wide Web Consortium](https://www.w3.org/). W3C® [liability](https://www.w3.org/policies/#Legal_Disclaimer), [trademark](https://www.w3.org/policies/#W3C_Trademarks) and [permissive document license](https://www.w3.org/copyright/software-license/ "W3C Software and Document License") rules apply. 
## Abstract
Restrict access to the users' local network with a new permission
## Status of this document
##  1. Introduction
_This section is not normative._
Although [[RFC1918]](https://wicg.github.io/local-network-access/#biblio-rfc1918 "Address Allocation for Private Internets") has specified a distinction between "private" and "public" internet addresses for over two decades, user agents haven’t made much progress at segregating the one from the other. Websites on the public internet can make requests to local devices and servers, which enable a number of malicious behaviors, including attacks on users' routers like those documented in [[DRIVE-BY-PHARMING]](https://wicg.github.io/local-network-access/#biblio-drive-by-pharming "Drive-By Pharming"), [[SOHO-PHARMING]](https://wicg.github.io/local-network-access/#biblio-soho-pharming "SOHO Pharming") and [[CSRF-EXPLOIT-KIT]](https://wicg.github.io/local-network-access/#biblio-csrf-exploit-kit "An Exploit Kit dedicated to CSRF Pharming").
Local Network Access aims to prevent these undesired requests to insecure devices on the local network. This is achieved by deprecating direct access to local IP addresses from public websites, and instead requiring that the user grants permission to the initiating website to make connections to their local network.
Note: This proposal builds on top of Chrome’s previously paused [[PRIVATE-NETWORK-ACCESS]](https://wicg.github.io/local-network-access/#biblio-private-network-access "Private Network Access") work but differs by gating access on a permission rather than via preflight requests.
###  1.1. Goals
The overarching goal is to prevent the user agent from inadvertently enabling attacks on devices running on a user’s local intranet, or services running on the user’s machine directly. For example, we wish to mitigate attacks on:
  * Users' routers, as outlined in [[SOHO-PHARMING]](https://wicg.github.io/local-network-access/#biblio-soho-pharming "SOHO Pharming"). Note that status quo CORS protections don’t protect against the kinds of attacks discussed here as they rely only on [CORS-safelisted methods](https://fetch.spec.whatwg.org/#cors-safelisted-method) and [CORS-safelisted request-headers](https://fetch.spec.whatwg.org/#cors-safelisted-request-header). No CORS preflight is triggered, and the attacker doesn’t care about reading the response, as the request itself is the CSRF attack.
  * Software running a web interface on a user’s loopback address. For better or worse, this is becoming a common deployment mechanism for all manner of applications, and often assumes protections that simply don’t exist (see [[AVASTIUM]](https://wicg.github.io/local-network-access/#biblio-avastium "Avast: A web-accessible RPC endpoint can launch 'SafeZone' \(also called Avastium\), a Chromium fork with critical security checks removed.") and [[TREND-MICRO]](https://wicg.github.io/local-network-access/#biblio-trend-micro "TrendMicro node.js HTTP server listening on localhost can execute commands") for recent examples).


There should be a well-lit path to allow these requests when the user is both expecting and explicitly allowing the local network access requests to occur. For example, a user logged in to [plex.tv](https://plex.tv) may want to allow the site to connect to their local media server to directly load media content over the local network instead of routing through remote servers. See [§ 1.3 Examples](https://wicg.github.io/local-network-access/#examples) below for more examples.
###  1.2. Non-goals
This spec does not attempt to make it easier to use HTTPS connections on local network devices. While this would be a useful goal, solving this problem is out of scope for this specification
###  1.3. Examples
####  1.3.1. User granting permission
Alice is at home on her laptop browsing the internet. She has a printer on her local network built by Acme Printing Company that is running a simple HTTP server. Alice is having a problem with the printer not properly functioning. 
Alice goes to Acme Printing Company’s web site to help diagnose the problem. Acme Printing Company’s web site tells Alice that it can connect to the printer to look at the diagnostic output of the printer. Alice’s browser asks Alice to allow https://support.acmeprintingcompany.com to connect to local devices on her network. Alice grants permission for https://support.acmeprintingcompany.com to connect to local devices on her network, and https://support.acmeprintingcompany.com connects to her local printer’s diagnostic output, and tells Alice that a part is malfunctioning on the printer and needs to be replaced.
####  1.3.2. User denying permission
Alice continues browsing online to find the best price for the replacement part on her printer. While looking at a general tech support forum, she suddenly gets a permission request in her browser for https://printersupport.evil.com to connect to local devices on her local network. Being suspicious of why https://printersupport.evil.com would need to connect to local devices, she denies the permission request. 
####  1.3.3. New device configuration
Instead of replacing the part on the printer, Alice decides instead to buy a new printer from Beta Manufacturing. Upon plugging in the printer and connecting it to her local network, Alice follows the instructions and goes to https://setup.betaprinters.com on her laptop. Upon opening the site, she sees a button that will help her set up the printer defaults. Hitting the button, she gets a permission prompt asking for permission for https://setup.betaprinters.com to connect to her local devices, which she accepts. 
####  1.3.4. App-based sign in
Alice uses their personal device for a limited set of tasks at work. Their employer doesn’t require device management for these basic tasks, but they do require an authentication app to be installed, which provides a strong credential and a limited set of device context. When attempting to access a work site, Alice is redirected to their corporate single sign on service, login.myco.com, and is asked to sign in using the app. The website makes a fetch request to http://localhost:45678, the address used by the local app. Alice sees a prompt asking for permission for https://login.myco.com to connect with a local device, which they accept. The app is invoked, and Alice is asked to authenticate to the app using her device unlock. 
##  2. Framework
###  2.1. IP Address Space
Define as follows:

```
enum IPAddressSpace { "public", "local", "loopback" };

```

Every IP address belongs to an IP address space, which can be one of three different values:
  1. loopback: Includes loopback addresses, which are only accessible on the local host. In other words, addresses whose target differs for every device.
  2. local: contains addresses that have meaning only within the current network. In other words, addresses whose target differs based on network position.
  3. public: contains all other addresses. In other words, addresses whose target is the same for all devices globally on the IP network.


For convenience, we additionally define the following terms:
  1. A loopback address is an IP address whose [IP address space](https://wicg.github.io/local-network-access/#ip-address-space) is [loopback](https://wicg.github.io/local-network-access/#ip-address-space-loopback).
  2. A local address is an IP address whose [IP address space](https://wicg.github.io/local-network-access/#ip-address-space) is [local](https://wicg.github.io/local-network-access/#ip-address-space-local).
  3. A public address is an IP address whose [IP address space](https://wicg.github.io/local-network-access/#ip-address-space) is [public](https://wicg.github.io/local-network-access/#ip-address-space-public).


An [IP address space](https://wicg.github.io/local-network-access/#ip-address-space) lhs is less public than an [IP address space](https://wicg.github.io/local-network-access/#ip-address-space) rhs if any of the following conditions holds true:
  1. lhs is [loopback](https://wicg.github.io/local-network-access/#ip-address-space-loopback) and rhs is either [local](https://wicg.github.io/local-network-access/#ip-address-space-local) or [public](https://wicg.github.io/local-network-access/#ip-address-space-public).
  2. lhs is [local](https://wicg.github.io/local-network-access/#ip-address-space-local) and rhs is [public](https://wicg.github.io/local-network-access/#ip-address-space-public).


To determine the IP address space of an IP address address, run the following steps:
  1. If address belongs to the `::ffff:0:0/96` "IPv4-mapped Address" address block, then replace address with its embedded IPv4 address.
  2. For each row in the [Non-public IP address blocks](https://wicg.github.io/local-network-access/#non-public-ip-address-blocks) table:
    1. If address belongs to row’s address block, return row’s address space.
  3. Return [public](https://wicg.github.io/local-network-access/#ip-address-space-public).

  
Non-public IP address blocks  
| Address block   | Name   | Reference   | Address space   |  
| --- | --- | --- | --- |  
|  `127.0.0.0/8`  | IPv4 Loopback   |  
|  `10.0.0.0/8`  | Private Use   |  
|  `100.64.0.0/10`  | Carrier-Grade NAT   |  
|  `172.16.0.0/12`  | Private Use   |  
|  `192.168.0.0/16`  | Private Use   |  
|  `198.18.0.0/15`  | Benchmarking   |  
|  `169.254.0.0/16`  | Link Local   |  
|  `::1/128`  | IPv6 Loopback   |  
|  `fc00::/7`  | Unique Local   |  
|  `fe80::/10`  | Link-Local Unicast   |  
|  `fec0::/10`  | Site-Local Unicast   |  
|  `0.0.0.0/32`  | IPv4 null IP address   |  
|  `0.0.0.0/8`  | IPv4 null IP addresses   |  
|  `::/128`  | IPv6 unspecified address   |  
|  `2001:db8::/32`  | IPv6 documentation addresses   |  
|  `3fff::/20`  | IPv6 documentation addresses   |  
|  `::ffff:0:0/96`  | IPv4-mapped   | see mapped IPv4 address   |  
User Agents MAY allow certain IP address blocks' [address space](https://wicg.github.io/local-network-access/#ip-address-space) to be overridden through administrator or user configuration. This could prove useful to protect e.g. IPv6 intranets where most IP addresses are considered [public](https://wicg.github.io/local-network-access/#ip-address-space-public) per the algorithm above, by instead configuring user agents to treat the intranet as [local](https://wicg.github.io/local-network-access/#ip-address-space-local).
Note: Link-local IP addresses such as `169.254.0.0/16` are considered [local](https://wicg.github.io/local-network-access/#ip-address-space-local), since such addresses can identify the same target for all devices on a network link. A previous version of this specification considered them to be [loopback](https://wicg.github.io/local-network-access/#ip-address-space-loopback) instead.
Note: The contents of each [IP address space](https://wicg.github.io/local-network-access/#ip-address-space) were at one point determined in accordance with the IANA Special-Purpose Address Registries ([[IPV4-REGISTRY]](https://wicg.github.io/local-network-access/#biblio-ipv4-registry "IANA IPv4 Special-Purpose Address Registry") and [[IPV6-REGISTRY]](https://wicg.github.io/local-network-access/#biblio-ipv6-registry "IANA IPv6 Special-Purpose Address Registry")) and the `Globally Reachable` bit defined therein. This turned out to be an inaccurate signal for our uses, as described in [wicg/private-network-access issue #50](https://github.com/wicg/private-network-access/issues/50).
Note: [[PRIVATE-NETWORK-ACCESS]](https://wicg.github.io/local-network-access/#biblio-private-network-access "Private Network Access") used the address spaces public, private, and local. This specification renames the address spaces to public, local, and loopback, respectively.
Note: [[FETCH]](https://wicg.github.io/local-network-access/#biblio-fetch "Fetch Standard") plans to specify that requests to the null IP address will be treated as a network error. We map both the IPv4 null IP address space and the IPv6 unspecified address to [loopback](https://wicg.github.io/local-network-access/#ip-address-space-loopback) as some systems can still route them back to the local host machine (and `0.0.0.0/8` can refer to "specified hosts on this network", so is mapped to [local](https://wicg.github.io/local-network-access/#ip-address-space-local)) per [[RFC5735]](https://wicg.github.io/local-network-access/#biblio-rfc5735 "Special Use IPv4 Addresses"). Once the changes to Fetch have been made and adopted, we will no longer need to handle them in this specification.
###  2.2. Local Network Request
A [request](https://fetch.spec.whatwg.org/#concept-request) (request) is a local network request if request’s [current url](https://fetch.spec.whatwg.org/#concept-request-current-url)’s maps to an IP address whose [IP address space](https://wicg.github.io/local-network-access/#ip-address-space) is [less public](https://wicg.github.io/local-network-access/#ip-address-space-less-public) than request’s [policy container](https://fetch.spec.whatwg.org/#concept-request-policy-container)’s [IP address space](https://wicg.github.io/local-network-access/#policy-container-ip-address-space).
The classification of IP addresses into two broad [address spaces](https://wicg.github.io/local-network-access/#ip-address-space) is an imperfect and theoretically-unsound approach. It is a proxy used to determine whether two network endpoints should be allowed to communicate freely or not, in other words whether endpoint A is reachable from endpoint B without pivoting through the user agent on endpoint C.
This approach has some flaws:
  * false positives: an intranet server with a [public address](https://wicg.github.io/local-network-access/#public-address) might not be able to directy issue requests to another server on the same intranet with a [local address](https://wicg.github.io/local-network-access/#local-address).
  * false negatives: a client connected to two different [local](https://wicg.github.io/local-network-access/#ip-address-space-local) networks, say a home network and a VPN, might allow a website served from the VPN to access devices on the home network. See also the issue below.


Even so, this specification aims to offer a pragmatic solution to a security issue that broadly affects most users of the Web whose network configurations are not so complex.
Requests originating from the [loopback address](https://wicg.github.io/local-network-access/#loopback-address) should not be considered [local network requests](https://wicg.github.io/local-network-access/#local-network-request), and should not be subject to local network access checks, since any software running on the user’s device is already in the most privileged vantage point on the user’s network.
The definition of [local network requests](https://wicg.github.io/local-network-access/#local-network-request) could be expanded to cover all cross-origin requests for which the [current url](https://fetch.spec.whatwg.org/#concept-request-current-url)’s maps to an IP address whose [IP address space](https://wicg.github.io/local-network-access/#ip-address-space) is not [public](https://wicg.github.io/local-network-access/#ip-address-space-public). This would prevent a malicious server on the local network from attacking other servers, including servers on `localhost`. See [wicg/private-network-access issue #39](https://github.com/wicg/private-network-access/issues/39).
NOTE: Currently, Chromium only implements Local Network Access restrictions for [public](https://wicg.github.io/local-network-access/#ip-address-space-public) to [local](https://wicg.github.io/local-network-access/#ip-address-space-local) or [loopback](https://wicg.github.io/local-network-access/#ip-address-space-loopback) requests, and does not enforce the permission for cross-origin [local](https://wicg.github.io/local-network-access/#ip-address-space-local) requests. This restriction can be shipped as an incremental improvement in future implementations.
NOTE: Because local names and addresses are not meaningful outside the bounds of the network, implementers might want to use a different permission prompt for the cross-origin [local](https://wicg.github.io/local-network-access/#ip-address-space-local) case than for the [public](https://wicg.github.io/local-network-access/#ip-address-space-public) to [local](https://wicg.github.io/local-network-access/#ip-address-space-local) case. Additionally, implementers might want to scope these permission grants to the specific network or to the current browsing session only.
NOTE: Some [local network requests](https://wicg.github.io/local-network-access/#local-network-request) are more challenging to secure than others. See [§ 4.4 Rollout Difficulties](https://wicg.github.io/local-network-access/#rollout-difficulties) for more details.
###  2.3. Local Network Request Permission Prompt
A local network access permission prompt is introduced to allow for users to approve of [local network requests](https://wicg.github.io/local-network-access/#local-network-request) from public websites to local network servers.
When a [local network request](https://wicg.github.io/local-network-access/#local-network-request) is detected, a prompt is shown to the user asking for permission to access the local network. If the user decides to grant the permission, then the fetch continues. If not, it fails.
The exact scope of the permission is implementation-defined. The permission may be as coarse-grained as allowing a specific origin to send [local network requests](https://wicg.github.io/local-network-access/#local-network-request) to any endpoint on the local network, or may be more fine-grained to only allow specific origins to communicate with specific endpoints on the local network. A user agent may persist this decision to reduce permission fatigue.
###  2.4. Secure Context Restriction
The capability to make local network requests is a [powerful feature](https://w3c.github.io/permissions/#dfn-powerful-feature) and must only be allowed from [secure contexts](https://html.spec.whatwg.org/multipage/webappapis.html#secure-context).
To be able to apply LNA checks to all cross-origin [local](https://wicg.github.io/local-network-access/#ip-address-space-local) requests in the future (see Issue above), Chromium plans to exempt local servers that likely cannot currently get publicly trusted HTTPS certificates from this requirement (e.g., servers on `.local` and private IP literals). See [§ 4.4 Rollout Difficulties](https://wicg.github.io/local-network-access/#rollout-difficulties) for more discussion, and also see [wicg/private-network-access issue #96](https://github.com/wicg/private-network-access/issues/96).
###  2.5. Mixed Content
Many local network servers do not run HTTPS, as it has proven difficult (and sometimes even impossible) to migrate local network servers away from HTTP. This is problematic as the [secure context](https://html.spec.whatwg.org/multipage/webappapis.html#secure-context) restriction, combined with mixed content checks, would block many [local network requests](https://wicg.github.io/local-network-access/#local-network-request) even if the user would give permission for the request to occur.
One solution to this problem is to bypass mixed content checks in situations where the request is known to be a [local network request](https://wicg.github.io/local-network-access/#local-network-request). This is known in a few situations:
  * When the hostname of the request target is an IP literal identified as [local](https://wicg.github.io/local-network-access/#ip-address-space-local) in the [Non-public IP address blocks" table](https://wicg.github.io/local-network-access/#non-public-ip-address-blocks) (e.g., an [[RFC1918]](https://wicg.github.io/local-network-access/#biblio-rfc1918 "Address Allocation for Private Internets") IP literal)
  * When the hostname of the request is a .local domain (RFC 6762)


There may be situations in which neither of the above situations is true, and yet the site wants to identify a request as being a [local network request](https://wicg.github.io/local-network-access/#local-network-request). This can be mitigated by adding a new parameter to the `fetch()` options bag:

```
fetch("http://router.local/ping", {
  targetAddressSpace: "local",
});

```

This instructs the browser to allow the fetch to bypass mixed-content checks even though the scheme is non-secure and potentially obtain a connection to the target server. The new `fetch()` API is backward-compatible.
Note that this feature cannot be abused to bypass mixed content in general. If the resolved remote IP address does not belong to the IP address space specified as the targetAddressSpace option value, then the request will fail. If it does belong, then the permission can be checked to allow or fail the request.
###  2.6. Permissions
This document defines the following [default powerful features](https://w3c.github.io/permissions/#dfn-default-powerful-feature) which are [policy-controlled features](https://w3c.github.io/webappsec-permissions-policy/#policy-controlled-feature) with a [default allowlist](https://w3c.github.io/webappsec-permissions-policy/#policy-controlled-feature-default-allowlist) of ['self'](https://w3c.github.io/webappsec-permissions-policy/#default-allowlist-self):
  * `"local-network"`, which controls the ability to make [local network requests](https://wicg.github.io/local-network-access/#local-network-request) to a [local address](https://wicg.github.io/local-network-access/#local-address).
  * `"loopback-network"`, which controls the ability make [local network requests](https://wicg.github.io/local-network-access/#local-network-request) to a [loopback address](https://wicg.github.io/local-network-access/#loopback-address).


NOTE: Previously, this was specified as a single [default powerful feature](https://w3c.github.io/permissions/#dfn-default-powerful-feature) that covered both local and loopback cases, `"local-network-access"`. Chromium still supports this as an alias for the new fine-grained permission names, and for use as a [policy-controlled feature](https://w3c.github.io/webappsec-permissions-policy/#policy-controlled-feature) name.
##  3. Integrations
_This section is non-normative._
This document proposes a number of modifications to other specifications in order to implement the protections outlined above. These integrations are outlined here for clarity, but the external documents are the normative references.
###  3.1. Integration with Fetch
This document proposes a few changes to [[FETCH]](https://wicg.github.io/local-network-access/#biblio-fetch "Fetch Standard"), with the following implication: [local network requests](https://wicg.github.io/local-network-access/#local-network-request) are only allowed if their [client](https://fetch.spec.whatwg.org/#concept-request-client) is a [secure context](https://html.spec.whatwg.org/multipage/webappapis.html#secure-context) **and** permission is granted by the user. If the request would have been blocked as mixed content, it can be allowed as long as the website states its intention to access the local network, and users give permission.
Note: This includes navigations. These can indeed be used to trigger CSRF attacks, albeit with less subtlety than with subresource requests.
Chromium only applies LNA restrictions to iframe navigations currently. It may be worth expanding this to include main-frame navigations (especially popup windows which can be controlled by their opener).
Note: [[FETCH]](https://wicg.github.io/local-network-access/#biblio-fetch "Fetch Standard") does not yet integrate the details of DNS resolution into the [Fetch](https://fetch.spec.whatwg.org/#concept-fetch) algorithm, though it does define an [obtain a connection](https://fetch.spec.whatwg.org/#concept-connection-obtain) algorithm which is enough for this specification. Local Network Access checks are applied to the newly-obtained connection. Given complexities such as Happy Eyeballs ([[RFC6555]](https://wicg.github.io/local-network-access/#biblio-rfc6555 "Happy Eyeballs: Success with Dual-Stack Hosts"), [[RFC8305]](https://wicg.github.io/local-network-access/#biblio-rfc8305 "Happy Eyeballs Version 2: Better Connectivity Using Concurrency")), these checks might pass or fail non-deterministically for hosts with multiple IP addresses that straddle IP address space boundaries.
####  3.1.1. Fetching
NOTE: Connection management in [[FETCH]](https://wicg.github.io/local-network-access/#biblio-fetch "Fetch Standard") is intentionally a bit vague, so some of the below is explained via notes to implementers. This section lays out that implementers perform local network access checks after obtaining the connection but before continuing to perform the fetch using that connection.
To address [wicg/local-network-access issue #103](https://github.com/wicg/local-network-access/issues/103) we will need to instead integrate into Step 4.6 of [obtain a connection](https://fetch.spec.whatwg.org/#concept-connection-obtain) to perform checks after resolving the origin but before the actual connection is created.
Update [[FETCH]](https://wicg.github.io/local-network-access/#biblio-fetch "Fetch Standard") as follows:
  1. [Connection](https://fetch.spec.whatwg.org/#concept-connection) objects are given a new IP address property, whose value is null or an [IP address](https://url.spec.whatwg.org/#ip-address), initially null.
  2. Add a new step to the [create a connection](https://fetch.spec.whatwg.org/#create-a-connection) algorithm immediately after establishing the new connection (between Steps 2 and 3).
    1. If host is an [IP address](https://url.spec.whatwg.org/#ip-address), then set connection’s [IP address](https://wicg.github.io/local-network-access/#connection-ip-address) to host.
  3. [Request](https://fetch.spec.whatwg.org/#concept-request) objects are given a new target IP address space property, initially null.
  4. [Response](https://fetch.spec.whatwg.org/#concept-response) objects are given a new IP address property, whose value is null or an [IP address](https://url.spec.whatwg.org/#ip-address), initially null.
  5. Define a new Local Network Access check algorithm. Given a [request](https://fetch.spec.whatwg.org/#concept-request) request and an [IP address](https://url.spec.whatwg.org/#ip-address) address:
NOTE: This algorithm takes an [IP address](https://url.spec.whatwg.org/#ip-address) so that it can be called from either [HTTP-network fetch](https://fetch.spec.whatwg.org/#concept-http-network-fetch) (where we have a [connection](https://fetch.spec.whatwg.org/#concept-connection)) or [HTTP-network-or-cache fetch](https://fetch.spec.whatwg.org/#concept-http-network-or-cache-fetch) (where we have a stored [response](https://fetch.spec.whatwg.org/#concept-response) with a saved [IP address](https://url.spec.whatwg.org/#ip-address)). This intentionally re-computes the IP address space each time as the mapping can be dynamically updated by the user agent.
    1. Let addressSpace be the result of running the [determine the IP address space](https://wicg.github.io/local-network-access/#determine-the-ip-address-space) algorithm on address.
    2. If request’s [origin](https://fetch.spec.whatwg.org/#concept-request-origin) is a [potentially trustworthy origin](https://w3c.github.io/webappsec-secure-contexts/#potentially-trustworthy-origin) and request’s [current URL](https://fetch.spec.whatwg.org/#concept-request-current-url)’s [origin](https://fetch.spec.whatwg.org/#concept-request-origin) is [same origin](https://html.spec.whatwg.org/multipage/browsers.html#same-origin) with request’s [origin](https://fetch.spec.whatwg.org/#concept-request-origin), then return null.
    3. If request’s [policy container](https://fetch.spec.whatwg.org/#concept-request-policy-container) is null, then return null.
NOTE: If request’s [policy container](https://fetch.spec.whatwg.org/#concept-request-policy-container) is null, then LNA checks do not apply to request. Users of the [fetch](https://fetch.spec.whatwg.org/#concept-fetch) algorithm have to take care to either set request’s [client](https://fetch.spec.whatwg.org/#concept-request-client) to an [environment settings object](https://html.spec.whatwg.org/multipage/webappapis.html#environment-settings-object) with a non-null [policy container](https://html.spec.whatwg.org/multipage/webappapis.html#concept-settings-object-policy-container) and let [fetch](https://fetch.spec.whatwg.org/#concept-fetch) initialize request’s [policy container](https://fetch.spec.whatwg.org/#concept-request-policy-container) accordingly, or to directly set request’s [policy container](https://fetch.spec.whatwg.org/#concept-request-policy-container) to a non-null value.
    4. If request’s [target IP address space](https://wicg.github.io/local-network-access/#request-target-ip-address-space) is not null:
      1. [Assert](https://infra.spec.whatwg.org/#assert): request’s [target IP address space](https://wicg.github.io/local-network-access/#request-target-ip-address-space) is not [public](https://wicg.github.io/local-network-access/#ip-address-space-public).
      2. If addressSpace is not equal to then request’s [target IP address space](https://wicg.github.io/local-network-access/#request-target-ip-address-space), then return a [network error](https://fetch.spec.whatwg.org/#concept-network-error).
      3. Return null.
    5. If addressSpace is [less public](https://wicg.github.io/local-network-access/#ip-address-space-less-public) than request’s [policy container](https://fetch.spec.whatwg.org/#concept-request-policy-container)’s [IP address space](https://wicg.github.io/local-network-access/#policy-container-ip-address-space):
      1. Let error be a [network error](https://fetch.spec.whatwg.org/#concept-network-error).
      2. If request’s [client](https://fetch.spec.whatwg.org/#concept-request-client) is not a [secure context](https://html.spec.whatwg.org/multipage/webappapis.html#secure-context) (including if it is null), then return error.
      3. Set error’s [IP address](https://wicg.github.io/local-network-access/#response-ip-address) property to address.
      4. Let permissionName be "local-network" if addressSpace is [local](https://wicg.github.io/local-network-access/#ip-address-space-local), or "loopback-network" if addressSpace is [loopback](https://wicg.github.io/local-network-access/#ip-address-space-loopback).
      5. Let settingsObject be request’s [client](https://fetch.spec.whatwg.org/#concept-request-client).
      6. Let global be settingsObject’s [global object](https://html.spec.whatwg.org/multipage/webappapis.html#concept-settings-object-global).
      7. Let document be global’s [associated Document](https://html.spec.whatwg.org/multipage/webappapis.html#concept-document-window).
      8. If document is null, then return error.
NOTE: This step will cause local network requests from Service Workers to fail, as Service Workers do not always have an associated Document. Future versions of this specification need to define how to handle Workers, particularly since Permissions Policy is not yet supported in Workers. See [w3c/webappsec-permissions-policy#207](https://github.com/w3c/webappsec-permissions-policy/issues/207).
Define local network access behavior for Service Workers.
      9. If document is not [allowed to use](https://html.spec.whatwg.org/multipage/iframe-embed-object.html#allowed-to-use) permissionName, then return error.
      10. Let permissionState be the result of [getting the current permission state](https://w3c.github.io/permissions/#dfn-getting-the-current-permission-state) given permissionName and global.
      11. If permissionState is [denied](https://w3c.github.io/permissions/#dfn-denied), then return error.
      12. If permissionState is [granted](https://w3c.github.io/permissions/#dfn-granted), then return null.
      13. [Prompt the user to choose](https://w3c.github.io/permissions/#dfn-prompt-the-user-to-choose) whether to grant permissionName for global:
        1. If the user grants permission, then return null.
        2. If the user denies permission, then return error.
    6. Return null.
  6. The [fetch](https://fetch.spec.whatwg.org/#concept-fetch) algorithm is amended to add 2 new steps right after request’s [policy container](https://fetch.spec.whatwg.org/#concept-request-policy-container) is set:
    1. If request’s [target IP address space](https://wicg.github.io/local-network-access/#request-target-ip-address-space) is null:
      1. If request’s [URL](https://fetch.spec.whatwg.org/#concept-request-url)’s [host](https://url.spec.whatwg.org/#concept-url-host) _host_ is an [IP address](https://url.spec.whatwg.org/#ip-address) and the result of running the [determine the IP address space](https://wicg.github.io/local-network-access/#determine-the-ip-address-space) algorithm on _host_ is [local](https://wicg.github.io/local-network-access/#ip-address-space-local), then set _request_ ’s [target IP address space](https://wicg.github.io/local-network-access/#request-target-ip-address-space) to [local](https://wicg.github.io/local-network-access/#ip-address-space-local).
      2. If request’s [URL](https://fetch.spec.whatwg.org/#concept-request-url)’s [host](https://url.spec.whatwg.org/#concept-url-host)’s [public suffix](https://url.spec.whatwg.org/#host-public-suffix) is `"local"`, then set request’s [target IP address space](https://wicg.github.io/local-network-access/#request-target-ip-address-space) to [local](https://wicg.github.io/local-network-access/#ip-address-space-local).
NOTE: We could also set the target IP address space to [local](https://wicg.github.io/local-network-access/#ip-address-space-local) if the request’s URL’s host is “localhost” or “127.0.0.1” (because of [[LET-LOCALHOST-BE-LOCALHOST]](https://wicg.github.io/local-network-access/#biblio-let-localhost-be-localhost "Let 'localhost' be localhost.")), but we do not need special handling for the loopback case as it is already considered to be potentially trustworthy and won’t trigger mixed content checks.
NOTE: We don’t set the target IP address space here if it was already non-null in order to prefer the explicit targetAddressSpace if set by the fetch() API.
  7. The [HTTP-network fetch](https://fetch.spec.whatwg.org/#concept-http-network-fetch) algorithm is amended to add 3 new steps right after checking that the newly-obtained connection is not failure:
    1. Set response’s [IP address](https://wicg.github.io/local-network-access/#response-ip-address) to connection’s [IP address](https://wicg.github.io/local-network-access/#connection-ip-address).
    2. Let localNetworkAccessCheckResult be the result of running [Local Network Access check](https://wicg.github.io/local-network-access/#local-network-access-check) for fetchParams’ [request](https://fetch.spec.whatwg.org/#concept-request) and connection’s [IP address](https://wicg.github.io/local-network-access/#connection-ip-address).
    3. If localNetworkAccessCheckResult is a [network error](https://fetch.spec.whatwg.org/#concept-network-error), then return localNetworkAccessCheckResult.
  8. The [HTTP-network-or-cache fetch](https://fetch.spec.whatwg.org/#concept-http-network-or-cache-fetch) algorithm is amended to add a new step right after Step 9:
    1. If response is not null:
      1. Let localNetworkAccessCheckResult be the result of running [Local Network Access check](https://wicg.github.io/local-network-access/#local-network-access-check) for request and response’s [IP address](https://wicg.github.io/local-network-access/#response-ip-address).
      2. If localNetworkAccessCheckResult is a [network error](https://fetch.spec.whatwg.org/#concept-network-error), then return localNetworkAccessCheckResult.


NOTE: The requirement that local network requests be made from secure contexts means that any insecure request will be blocked as mixed content unless we can know ahead of time that the request can be considered a local network request. By setting the target IP address space property (see Step 6i and 6ii above), we only need to make a small change to Mixed Content -- see [§ 3.2 Integration with Mixed Content](https://wicg.github.io/local-network-access/#integration-with-mixed-content).
####  3.1.2. Fetch API
The Fetch API needs to be adjusted as well.
  * Append an optional [entry](https://infra.spec.whatwg.org/#map-entry) to , whose [key](https://infra.spec.whatwg.org/#map-key) is targetAddressSpace, and [value](https://infra.spec.whatwg.org/#map-value) is a .

```
partial dictionary [RequestInit](https://fetch.spec.whatwg.org/#requestinit) {
  [IPAddressSpace](https://wicg.github.io/local-network-access/#enumdef-ipaddressspace) targetAddressSpace;
};

```

  * Define a new targetAddressSpace representing the above in [request](https://fetch.spec.whatwg.org/#concept-request).

```
partial interface [Request](https://fetch.spec.whatwg.org/#request) {
  readonly attribute [IPAddressSpace](https://wicg.github.io/local-network-access/#enumdef-ipaddressspace) targetAddressSpace;
};

```

  * The [`new Request(input, init)`](https://fetch.spec.whatwg.org/#dom-request) is appended with the following step right before setting [this](https://webidl.spec.whatwg.org/#this)’s [request](https://fetch.spec.whatwg.org/#concept-request) to request:
    1. If init[""] [exists](https://infra.spec.whatwg.org/#map-exists), then switch on init[""]: 

public 
    Do nothing.  

local 
    Set request’s targetAddressSpace to [local](https://wicg.github.io/local-network-access/#ip-address-space-local). 


###  3.2. Integration with Mixed Content
The [Should fetching request be blocked as mixed content?](https://w3c.github.io/webappsec-mixed-content/#should-block-fetch) is amended to add the following condition to one of the **allowed** conditions:
  1. request’s [origin](https://fetch.spec.whatwg.org/#concept-request-origin) is not a [potentially trustworthy origin](https://w3c.github.io/webappsec-secure-contexts/#potentially-trustworthy-origin), and request’s [target IP address space](https://wicg.github.io/local-network-access/#request-target-ip-address-space) is [local](https://wicg.github.io/local-network-access/#ip-address-space-local).


The "[Upgrade request to an a priori authenticated URL as mixed content, if appropriate](https://w3c.github.io/webappsec-mixed-content/level2.html#upgrade-algorithm)" algorithm is amended to add the following condition as an exception from upgrading in step 1:
  1. request’s[target IP address space](https://wicg.github.io/local-network-access/#request-target-ip-address-space) is [local](https://wicg.github.io/local-network-access/#ip-address-space-local)


###  3.3. Integration with WebSockets
WebSockets connections should be subject to the same local network access permission requirements. [WebSocket opening handshake](https://websockets.spec.whatwg.org/#websocket-opening-handshake) directly applies [fetch](https://fetch.spec.whatwg.org/#concept-fetch) in step 11, and so no modification to the WebSocket specification is required beyond the fetch change proposed above.
One minor difference between the Fetch API and the WebSockets API is that WebSockets does not have an equivalent to fetch’s `RequestInit`, and so there is no place to put in a `targetAddressSpace` option to bypass mixed content checks for ws:// urls.
###  3.4. Integration with WebTransport
WebTransport connections should be subject to the same local network access permission requirements.
No modification to the WebTransport spec will be required. In the WebTransport spec, [obtaining a WebTransport connection](https://www.w3.org/TR/webtransport/#obtain-a-webtransport-connection) references the Fetch spec for obtaining a connection in step 6, which is being modified in [§ 3.1.1 Fetching](https://wicg.github.io/local-network-access/#fetching)
###  3.5. Integration with HTML
To support the checks in [[FETCH]](https://wicg.github.io/local-network-access/#biblio-fetch "Fetch Standard"), user agents must remember the source IP address space of contexts in which network requests are made. To this effect, the [[HTML]](https://wicg.github.io/local-network-access/#biblio-html "HTML Standard") specification is patched as follows:
  1. A new IP address space  property is added to the [policy container](https://html.spec.whatwg.org/multipage/browsers.html#policy-container) [struct](https://infra.spec.whatwg.org/#struct).
    1. It is initially public.
  2. An additional step is added to the [clone a policy container](https://html.spec.whatwg.org/multipage/browsers.html#clone-a-policy-container) algorithm:
    1. Set clone’s [IP address space](https://wicg.github.io/local-network-access/#policy-container-ip-address-space) to the policyContainer’s [IP address space](https://wicg.github.io/local-network-access/#policy-container-ip-address-space).
  3. An additional step is added to the [create a policy container from a fetch response](https://html.spec.whatwg.org/multipage/browsers.html#creating-a-policy-container-from-a-fetch-response) algorithm:
    1. Set result’s [IP address space](https://wicg.github.io/local-network-access/#policy-container-ip-address-space) the result of running the [determine the IP address space](https://wicg.github.io/local-network-access/#determine-the-ip-address-space) algorithm on response’s [IP address](https://wicg.github.io/local-network-access/#response-ip-address).


Assuming that `example.com` resolves to a [public address](https://wicg.github.io/local-network-access/#public-address) (say, `123.123.123.123`), then the created when navigating to `https://example.com/document.html` will have its [policy container](https://html.spec.whatwg.org/multipage/dom.html#concept-document-policy-container)’s [IP address space](https://wicg.github.io/local-network-access/#policy-container-ip-address-space) property set to [public](https://wicg.github.io/local-network-access/#ip-address-space-public). 
If this then embeds an `about:srcdoc` iframe, then the child frame’s will have its [policy container](https://html.spec.whatwg.org/multipage/dom.html#concept-document-policy-container)’s [IP address space](https://wicg.github.io/local-network-access/#policy-container-ip-address-space) property set to [public](https://wicg.github.io/local-network-access/#ip-address-space-public).
If, on the other hand, `example.com` resolved to a [local address](https://wicg.github.io/local-network-access/#local-address) (say, `127.0.0.1`), then the created when navigating to `https://example.com/document.html` will have its [policy container](https://html.spec.whatwg.org/multipage/dom.html#concept-document-policy-container)’s [IP address space](https://wicg.github.io/local-network-access/#policy-container-ip-address-space) property set to [local](https://wicg.github.io/local-network-access/#ip-address-space-local).
TODO: Also update the reference to Private Network Access in [HTML § 7.1.4 Cross-origin embedder policies](https://html.spec.whatwg.org/multipage/browsers.html#coep).
###  3.6. Integration with Workers
_This section is non-normative._
Given that already has a [policy container](https://html.spec.whatwg.org/multipage/workers.html#concept-workerglobalscope-policy-container) field populated using the [create a policy container from a fetch response](https://html.spec.whatwg.org/multipage/browsers.html#creating-a-policy-container-from-a-fetch-response) algorithm, the avove integrations with Fetch and HTML apply just as well to worker contexts as to documents.
Assuming that `example.com` resolves to a [public address](https://wicg.github.io/local-network-access/#public-address) (say, `123.123.123.123`), then a created by fetching a script from `https://example.com/worker.js` will have its [policy container](https://html.spec.whatwg.org/multipage/workers.html#concept-workerglobalscope-policy-container)’s [IP address space](https://wicg.github.io/local-network-access/#policy-container-ip-address-space) property set to [public](https://wicg.github.io/local-network-access/#ip-address-space-public). 
Any fetch [request](https://fetch.spec.whatwg.org/#concept-request) initiated by this worker that [obtains a connection](https://fetch.spec.whatwg.org/#concept-connection-obtain) to an IP address in the [local](https://wicg.github.io/local-network-access/#ip-address-space-local) or [loopback](https://wicg.github.io/local-network-access/#ip-address-space-loopback) [address spaces](https://wicg.github.io/local-network-access/#ip-address-space) would then be a [local network request](https://wicg.github.io/local-network-access/#local-network-request).
Chromium’s implementation currently applies the LNA permission for service worker-initiated fetches based on the worker’s script origin (since there may not be an active document around when the service worker is executing). It may be better for this to be based on the partitioned storage key of the worker, and it would also be good if permissions policy supported service workers.
The [Service Worker](https://w3c.github.io/ServiceWorker/#dfn-service-worker) [soft update](https://w3c.github.io/ServiceWorker/#soft-update) algorithm unfortunately sets a [request client](https://fetch.spec.whatwg.org/#concept-request-client) of "null" when [fetching](https://fetch.spec.whatwg.org/#concept-fetch) an updated script. This causes all sorts of issues, and interferes with the local network access check algorithm laid out above. Indeed, there is no [request client](https://fetch.spec.whatwg.org/#concept-request-client) from which to copy the [policy container](https://fetch.spec.whatwg.org/#concept-request-policy-container) during [fetch](https://fetch.spec.whatwg.org/#concept-fetch). See [wicg/private-network-access issue #83](https://github.com/wicg/private-network-access/issues/83).
##  4. Implementation considerations
###  4.1. File URLs
It isn’t entirely clear how file URLs fit into the public/local scheme outlined above. It would be nice to prevent folks from harming themselves by opening a malicious HTML file locally, on the one hand, but on the other, code running locally is somewhat outside of any coherent threat model.
For the moment, let’s err on the side of treating file URLs as local, as they seem to be just as much a part of the local system as anything else on a loopback address.
Re-evaluate this after implementation experience.
###  4.2. Proxies
In the current implementation of this specification in Chromium, proxies influence the address space of resources they proxy. Specifically, resources fetched via proxies are considered to have been fetched from the proxy’s IP address itself.
If a [Document](https://dom.spec.whatwg.org/#concept-document) served by foo.example on a public address is fetched by the user agent via a proxy on a local address, then the [Document](https://dom.spec.whatwg.org/#concept-document)’s [policy container](https://html.spec.whatwg.org/multipage/browsers.html#policy-container)’s [IP address space](https://wicg.github.io/local-network-access/#ip-address-space) is set to local.
The [Document](https://dom.spec.whatwg.org/#concept-document) will in turn be allowed to make requests to other local addresses accessible to the browser.
This can allow a website to learn that it was proxied by observing that it is allowed to make requests to local addresses, which is a privacy information leak. While this requires correctly guessing the URL of a resource on the local network, a single correct guess is sufficient.
This is expected to be relatively rare and not warrant more mitigations. After all, in the status quo all websites can make requests to all IP addresses with no restrictions whatsoever.
It would be interesting to explore a mechanism by which proxies could tell the browser "please treat this resource as public/local anyway", thereby passing on some information about the IP address behind the proxy.
###  4.3. HTTP Cache
Responses from the HTTP cache are subject to the Local Network Access check, as specified in [§ 3.1 Integration with Fetch](https://wicg.github.io/local-network-access/#integration-with-fetch) above. Below are some additional details about how to how those checks work in practice (with some examples) depending on which kind of resource is loaded from cache.
####  4.3.1. Main resources
A [document](https://dom.spec.whatwg.org/#concept-document) constructed from a cached [response](https://fetch.spec.whatwg.org/#concept-response) remembers the IP address from which the [response](https://fetch.spec.whatwg.org/#concept-response) was initially loaded. The IP address space of the [document](https://dom.spec.whatwg.org/#concept-document) is derived anew from the IP address.
In the common case, this entails that the [document](https://dom.spec.whatwg.org/#concept-document)’s [policy container](https://html.spec.whatwg.org/multipage/browsers.html#policy-container)’s IP address space is restored unmodified. However in the event that the user agent’s configuration has changed, the derived IP address space might be different.
The user agent navigates to http://foo.example/, loads the main resource from 1.2.3.4, caches it, then sets the resulting [document](https://dom.spec.whatwg.org/#concept-document)’s [policy container](https://html.spec.whatwg.org/multipage/browsers.html#policy-container)’s IP address space to public. 
The user agent then restarts, and a new configuration is applied specifying that 1.2.3.4 should be classified as a local address instead.
The user agent navigates to http://foo.example/ once more and loads the main resource from the HTTP cache. The resulting [document](https://dom.spec.whatwg.org/#concept-document)’s [policy container](https://html.spec.whatwg.org/multipage/browsers.html#policy-container)’s IP address space is now set to local.
####  4.3.2. Subresources
As with main resources, a subresource constructed from a cached response remembers the IP address from which the response was initially loaded. The IP address space of the response is derived anew from the IP address.
In the common case, this entails that the response’s IP address space is restored unmodified. However, in the event that the user agent’s configuration has changed, the derived IP address space might be different.
When a subresource request is blocked by LNA checks (i.e., the permission was denied), there is no resource response cached. If the permission is later reset or granted, the subresource request will go to the network.
Previously allowed subresource load 
The user agent navigates to https://foo.example, which is loaded from 1.2.3.4 (which has an IP address space of `public`). The document triggers a subresource request for http://bar.local/image.jpg, which when a connection is created has an IP address of 10.0.1.1 (which has an IP address space of `local`). This triggers a permission prompt, granting the Local Network Access permission to https://foo.example, and then the subresource is loaded and added to the user agent’s cache.
The user agent resets the permission for https://foo.example.
The user agent navigates to https://foo.example once more, which once again triggers a subresource request for http://bar.local/image.jpeg. This resource is in the user agent’s cache, with a cached response IP address of 10.0.1.1. This again triggers a permission prompt, which if granted will finish loading the resource from the user agent’s cache.
Previously blocked subresource load 
The user agent navigates to https://foo.example, which is loaded from 1.2.3.4 (which has an IP address space of `public`). The document triggers a subresource request for http://bar.local/image.jpg, which when a connection is created has an IP address of 10.0.1.1 (which has an IP address space of `local`). This triggers a permission prompt, denying the Local Network Access permission to https://foo.example. The subresource request is blocked and no resource is added to the user agent’s cache.
The user agent resets the permission for https://foo.example.
The user agent navigates to https://foo.example once more, which once again triggers a subresource request for http://bar.local/image.jpeg. This resource is not in the user agent’s cache, so goes through HTTP network fetch and triggers the permission prompt.
See [§ 5.6 HTTP cache](https://wicg.github.io/local-network-access/#security-http-cache) for a discussion of security implications.
###  4.4. Rollout Difficulties
Local Network Access essentially deprecates direct access to the local network in favor of more secure user-agent-mediated alternatives. Web deprecations are hard. Chromium previously encountered many stumbling blocks on the way to shipping parts of [[PRIVATE-NETWORK-ACCESS]](https://wicg.github.io/local-network-access/#biblio-private-network-access "Private Network Access") (the predecessor to this specification).
In particular, shipping restrictions on fetches from [non-secure contexts](https://html.spec.whatwg.org/multipage/webappapis.html#non-secure-context) in the local IP address space to services on `localhost` have proven particularly difficult, for a lower payoff. Indeed, exploiting such fetches requires attackers to already have a foothold in the private network, which substantially raises attack difficulty. As a result, Chromium is exempting these fetches from restrictions temporarily, choosing to focus on fetches from the public IP address space. See [§ 5.5 Local network attackers](https://wicg.github.io/local-network-access/#local-network-attackers) for a discussion of security implications.
##  5. Security and Privacy Considerations
###  5.1. User Mediation
The proposal in this document only ensures that the user consents to access from the public internet. This proposal does not allow for devices to explicitly approve for connections from the public internet.
An alternative model where devices had to explicitly approve for connections from the public internet was attempted in [[PRIVATE-NETWORK-ACCESS]](https://wicg.github.io/local-network-access/#biblio-private-network-access "Private Network Access"), but ran into [rollout difficulties](https://developer.chrome.com/blog/pna-on-hold).
Requiring user mediation, regardless of whether the target endpoint opts in to the connection, also helps mitigate privacy issues such as the ["Local Mess"](https://localmess.github.io) tracking method where the local endpoint and the remote website are colluding to link user identities.
###  5.2. DNS rebinding
The mitigation described here operates upon the IP address which the user agent actually connects to when loading a particular resource. This check MUST be performed for each new connection made, as DNS rebinding attacks may otherwise trick the user agent into revealing information it shouldn’t.
DNS rebinding attacks also mean that local network access checks MUST apply to all `public` to `local` requests (that is, we cannot simplify the algorithm to be “any cross-origin request to a `local` endpoint”, as this would open a risk of a user navigation to a.example, then moving networks or having DNS change to make a.example point to a local address).
###  5.3. Scope of Mitigation
The proposal in this document merely mitigates attacks against local web services, it cannot fully solve them. For example, a router’s web-based administration interface must be designed and implemented to defend against CSRF on its own, and should not rely on a UA that behaves as specified in this document. The mitigation this document specifies is necessary given the reality of local web service implementation quality today, but vendors should not consider themselves absolved of responsibility, even if all UAs implement this mitigation.
###  5.4. Cross-network confusion
Most local networks cannot communicate with each other, yet they are all treated by this specification as belonging to the local IP address space. Going further, local addresses have meaning only on the local network where they are used. The same IP address might refer to entirely different devices in two different networks. A user granting permission for a.example to make local network requests could then move to a different network, and then a.example would continue to be able to make local network requests.
This opens the door to cross-network attacks:
  * A user connects to two different local networks: a home Wi-Fi network and a corporate VPN. Their smart fridge has been hacked. They open their smart fridge’s web interface, which then performs CSRF attacks against corporate websites accessible via the VPN.
  * A user connects to a malicious internet cafe Wi-Fi, which requires users to keep a captive portal page open. They close their laptop, go home, open up their laptop again. The captive portal page (either still open or reloaded from cache as the user agent restores its previous state) performs CSRF
  * attacks against the user’s home devices.
  * A user connects to a malicious internet cafe Wi-Fi, whose captive portal website caches a malicious script from http://router.example/popular-library.js (the cafe network administrator operates a malicious DNS server) with a very long expiry. The user powers their computer off, goes home, boots up their computer again and visits their router’s administration interface at http://router.example, which embeds /popular-library.js. The malicious script is loaded in the administration interface’s first-party context.


None of these attacks are novel - they are just examples of the limitations of this specification.
Potential mitigations would require noticing network changes and clearing state specific to the previous network. Doing so in a fully general manner is likely to be impossible short of clearing all state. Maybe a practical compromise can be reached. See [wicg/private-network-access issue #28](https://github.com/wicg/private-network-access/issues/28).
An alternative approach might be to scope the permission grant to an identifier that distinguishes different networks.
###  5.5. Local network attackers
Until local network access checks are applied to all cross-origin requests to the `local` address space, it is possible for a malicious server on the local network to (1) attack other servers on the local network, and (2) attack services running on `localhost` on a user’s machine. (1) is already possible without needing to abuse the user’s browser, but (2) remains a concern. For example, a captive portal might be able to redirect the user to a malicious page that tries to probe and attack vulnerable `localhost` services running on the user’s machine. (See also [wicg/private-network-access issue #39](https://github.com/wicg/private-network-access/issues/39).)
We see public websites on the drive-by web as a more urgent security (and privacy) risk and see an incremental rollout of these protections as valuable progress, despite the lingering risk from local network attackers.
###  5.6. HTTP cache
####  5.6.1. Applying checks to subresources
Cached subresources are protected by this specification, as the HTTP cache remembers the source IP address which can be used in the Local Network Access check algorithm during [HTTP-network-or-cache fetch](https://fetch.spec.whatwg.org/#concept-http-network-or-cache-fetch).
Without this check, a malicious public website might be able to determine whether a user has visited particular private websites in the past.
Due to HTTP cache partitioning, a subresource can only be loaded from cache by malicious attackers who manage to replicate the [network partition key](https://fetch.spec.whatwg.org/#network-partition-key) of the cache entry. One way an attacker could achieve this is by manipulating DNS (see also [§ 5.2 DNS rebinding](https://wicg.github.io/local-network-access/#dns-rebinding) in order to impersonate the top-level site that initially embedded the cached resource.
The user agent navigates to http://router.example, which is served from 192.168.1.1. The website embeds a logo from http://router.example/$BRAND-logo.png, which is cached.
A malicious attacker then re-binds router.example to an attacker-controlled public IP address, and somehow tricks the user into visiting http://router.example again. The malicious website attempts to embed the logo, and monitors whether the load is successful. If so, the attacker has determined the brand of the user’s router.
####  5.6.2. HTTP cache poisoning
While this specification aims to protect local network servers from receiving requests from public websites, DNS rebinding can be used to carry out a similar attack through cache poisoning of unauthenticated resources.
Attackers masquerading as http://router.com can cache a malicious script at http://router.com/totally-legit.js. Later on, when the user navigates to http://router.com/, the page might request the poisoned script and execute attacker code in a [less public](https://wicg.github.io/local-network-access/#ip-address-space-less-public) [IP address space](https://wicg.github.io/local-network-access/#ip-address-space).
This attack is partially mitigated by cache partitioning, which makes it so that the attacker must navigate a top-level browsing context to http://router.com/ before caching resources, which lacks subtlety. It is also not specific to Local Network Access, rather being a symptom of plaintext HTTP’s lack of authentication and integrity protection.
##  6. Acknowledgements
Many thanks for valuable feedback and advice from Titouan Rigoudy, Jonathan Hao, and Yifan Luo who worked on the original Private Network Access proposals and specification, and generously discussed their work and helped brainstorm paths forward.
## Conformance
### Document conventions
Conformance requirements are expressed with a combination of descriptive assertions and RFC 2119 terminology. The key words “MUST”, “MUST NOT”, “REQUIRED”, “SHALL”, “SHALL NOT”, “SHOULD”, “SHOULD NOT”, “RECOMMENDED”, “MAY”, and “OPTIONAL” in the normative parts of this document are to be interpreted as described in RFC 2119. However, for readability, these words do not appear in all uppercase letters in this specification. 
All of the text of this specification is normative except sections explicitly marked as non-normative, examples, and notes. [[RFC2119]](https://wicg.github.io/local-network-access/#biblio-rfc2119 "Key words for use in RFCs to Indicate Requirement Levels")
Examples in this specification are introduced with the words “for example” or are set apart from the normative text with `class="example"`, like this: 
This is an example of an informative example. 
Informative notes begin with the word “Note” and are set apart from the normative text with `class="note"`, like this: 
Note, this is an informative note.
Tests
Tests relating to the content of this specification may be documented in “Tests” blocks like this one. Any such block is non-normative.
## Index
### Terms defined by this specification
  * [address space](https://wicg.github.io/local-network-access/#ip-address-space), in § 2.1
  * [determine the IP address space](https://wicg.github.io/local-network-access/#determine-the-ip-address-space), in § 2.1
  * IP address 
    * [dfn for connection](https://wicg.github.io/local-network-access/#connection-ip-address), in § 3.1.1
    * [dfn for response](https://wicg.github.io/local-network-access/#response-ip-address), in § 3.1.1
  * IP address space 
    * [definition of](https://wicg.github.io/local-network-access/#ip-address-space), in § 2.1
    * [dfn for policy container](https://wicg.github.io/local-network-access/#policy-container-ip-address-space), in § 3.5
  * [IPAddressSpace](https://wicg.github.io/local-network-access/#enumdef-ipaddressspace), in § 2.1
  * [less public](https://wicg.github.io/local-network-access/#ip-address-space-less-public), in § 2.1
  * ["local"](https://wicg.github.io/local-network-access/#dom-ipaddressspace-local), in § 2.1
  * [local](https://wicg.github.io/local-network-access/#ip-address-space-local), in § 2.1
  * [local address](https://wicg.github.io/local-network-access/#local-address), in § 2.1
  * ["local-network"](https://wicg.github.io/local-network-access/#permissiondef-local-network), in § 2.6
  * ["local-network-access"](https://wicg.github.io/local-network-access/#permissiondef-local-network-access), in § 2.6
  * [Local Network Access check](https://wicg.github.io/local-network-access/#local-network-access-check), in § 3.1.1
  * [local network request](https://wicg.github.io/local-network-access/#local-network-request), in § 2.2
  * ["loopback"](https://wicg.github.io/local-network-access/#dom-ipaddressspace-loopback), in § 2.1
  * [loopback](https://wicg.github.io/local-network-access/#ip-address-space-loopback), in § 2.1
  * [loopback address](https://wicg.github.io/local-network-access/#loopback-address), in § 2.1
  * ["loopback-network"](https://wicg.github.io/local-network-access/#permissiondef-loopback-network), in § 2.6
  * ["public"](https://wicg.github.io/local-network-access/#dom-ipaddressspace-public), in § 2.1
  * [public](https://wicg.github.io/local-network-access/#ip-address-space-public), in § 2.1
  * [public address](https://wicg.github.io/local-network-access/#public-address), in § 2.1
  * targetAddressSpace 
    * [attribute for Request](https://wicg.github.io/local-network-access/#dom-request-targetaddressspace), in § 3.1.2
    * [definition of](https://wicg.github.io/local-network-access/#targetaddressspace), in § 3.1.2
    * [dict-member for RequestInit](https://wicg.github.io/local-network-access/#dom-requestinit-targetaddressspace), in § 3.1.2
  * [target IP address space](https://wicg.github.io/local-network-access/#request-target-ip-address-space), in § 3.1.1


### Terms defined by reference
  * [DOM] defines the following terms: 
    * Document
    * document
  * [FETCH] defines the following terms: 
    * Request
    * Request(input, init)
    * RequestInfo
    * RequestInit
    * client
    * connection
    * CORS-safelisted method
    * CORS-safelisted request-header
    * create a connection
    * current URL
    * fetch
    * HTTP-network fetch
    * HTTP-network-or-cache fetch
    * network error
    * network partition key
    * obtain a connection
    * origin
    * policy container
    * request
    * response
  * [HTML] defines the following terms: 
    * WorkerGlobalScope
    * allowed to use
    * associated Document
    * clone a policy container
    * creating a policy container from a fetch response
    * environment settings object
    * global object
    * non-secure context
    * policy container
    * policy container (for Document)
    * policy container (for WorkerGlobalScope)
    * policy container (for environment settings object)
    * same origin
    * secure context
  * [INFRA] defines the following terms: 
    * assert
    * entry
    * exist
    * struct
    * value
  * [MIXED-CONTENT] defines the following terms: 
    * Should fetching request be blocked as mixed content?
  * [PERMISSIONS] defines the following terms: 
    * default powerful feature
    * denied
    * getting the current permission state
    * granted
    * powerful feature
    * prompt the user to choose
  * [PERMISSIONS-POLICY-1] defines the following terms: 
    * 'self'
    * default allowlist
    * policy-controlled feature
  * [SECURE-CONTEXTS] defines the following terms: 
    * potentially trustworthy origin
  * [URL] defines the following terms: 
    * host (for URL)
    * host (for url)
    * IP address
    * public suffix
  * [WEBIDL] defines the following terms: 
    * this
  * [WEBSOCKET] defines the following terms: 
    * WebSocket opening handshake


## References
### Normative References 

[DOM] 
    Anne van Kesteren. [DOM Standard](https://dom.spec.whatwg.org/). Living Standard. URL: <https://dom.spec.whatwg.org/> 

[FETCH] 
    Anne van Kesteren. [Fetch Standard](https://fetch.spec.whatwg.org/). Living Standard. URL: <https://fetch.spec.whatwg.org/> 

[HTML] 
    Anne van Kesteren; et al. [HTML Standard](https://html.spec.whatwg.org/multipage/). Living Standard. URL: <https://html.spec.whatwg.org/multipage/> 

[INFRA] 
    Anne van Kesteren; Domenic Denicola. [Infra Standard](https://infra.spec.whatwg.org/). Living Standard. URL: <https://infra.spec.whatwg.org/> 

[MIXED-CONTENT] 
    Emily Stark; Mike West; Carlos IbarraLopez. [Mixed Content](https://w3c.github.io/webappsec-mixed-content/). URL: <https://w3c.github.io/webappsec-mixed-content/> 

[PERMISSIONS] 
    Marcos Caceres; Mike Taylor. [Permissions](https://w3c.github.io/permissions/). URL: <https://w3c.github.io/permissions/> 

[PERMISSIONS-POLICY-1] 
    Ian Clelland. [Permissions Policy](https://w3c.github.io/webappsec-permissions-policy/). URL: <https://w3c.github.io/webappsec-permissions-policy/> 

[RFC2119] 
    S. Bradner. [Key words for use in RFCs to Indicate Requirement Levels](https://datatracker.ietf.org/doc/html/rfc2119). March 1997. Best Current Practice. URL: <https://datatracker.ietf.org/doc/html/rfc2119> 

[SECURE-CONTEXTS] 
    Mike West. [Secure Contexts](https://w3c.github.io/webappsec-secure-contexts/). URL: <https://w3c.github.io/webappsec-secure-contexts/> 

[URL] 
    Anne van Kesteren. [URL Standard](https://url.spec.whatwg.org/). Living Standard. URL: <https://url.spec.whatwg.org/> 

[WEBIDL] 
    Edgar Chen; Timothy Gu. [Web IDL Standard](https://webidl.spec.whatwg.org/). Living Standard. URL: <https://webidl.spec.whatwg.org/>
### Non-Normative References 

[AVASTIUM] 
     [Avast: A web-accessible RPC endpoint can launch 'SafeZone' (also called Avastium), a Chromium fork with critical security checks removed.](https://bugs.chromium.org/p/project-zero/issues/detail?id=679). URL: <https://bugs.chromium.org/p/project-zero/issues/detail?id=679> 

[CSRF-EXPLOIT-KIT] 
    Kafeine. [An Exploit Kit dedicated to CSRF Pharming](http://malware.dontneedcoffee.com/2015/05/an-exploit-kit-dedicated-to-csrf.html). URL: <http://malware.dontneedcoffee.com/2015/05/an-exploit-kit-dedicated-to-csrf.html> 

[DRIVE-BY-PHARMING] 
    Sid Stamm; Zulfikar Ramzan; Markus Jakobsson. [Drive-By Pharming](https://link.springer.com/chapter/10.1007/978-3-540-77048-0_38). URL: <https://link.springer.com/chapter/10.1007/978-3-540-77048-0_38> 

[IPV4-REGISTRY] 
     [IANA IPv4 Special-Purpose Address Registry](https://www.iana.org/assignments/iana-ipv4-special-registry/iana-ipv4-special-registry.xhtml). URL: <https://www.iana.org/assignments/iana-ipv4-special-registry/iana-ipv4-special-registry.xhtml> 

[IPV6-REGISTRY] 
     [IANA IPv6 Special-Purpose Address Registry](https://www.iana.org/assignments/iana-ipv6-special-registry/iana-ipv6-special-registry.xhtml). URL: <https://www.iana.org/assignments/iana-ipv6-special-registry/iana-ipv6-special-registry.xhtml> 

[LET-LOCALHOST-BE-LOCALHOST] 
     [Let 'localhost' be localhost.](https://datatracker.ietf.org/doc/html/draft-ietf-dnsop-let-localhost-be-localhost). URL: <https://datatracker.ietf.org/doc/html/draft-ietf-dnsop-let-localhost-be-localhost> 

[PRIVATE-NETWORK-ACCESS] 
     [Private Network Access](https://wicg.github.io/private-network-access/). Draft Community Group Report. URL: <https://wicg.github.io/private-network-access/> 

[RFC1122] 
    R. Braden, Ed.. [Requirements for Internet Hosts - Communication Layers](https://www.rfc-editor.org/info/rfc1122/). October 1989. Internet Standard. URL: <https://www.rfc-editor.org/info/rfc1122/> 

[RFC1884] 
    R. Hinden, Ed.; S. Deering, Ed.. [IP Version 6 Addressing Architecture](https://www.rfc-editor.org/info/rfc1884/). December 1995. Historic. URL: <https://www.rfc-editor.org/info/rfc1884/> 

[RFC1918] 
    Y. Rekhter; et al. [Address Allocation for Private Internets](https://www.rfc-editor.org/info/rfc1918/). February 1996. Best Current Practice. URL: <https://www.rfc-editor.org/info/rfc1918/> 

[RFC2544] 
    S. Bradner; J. McQuaid. [Benchmarking Methodology for Network Interconnect Devices](https://www.rfc-editor.org/info/rfc2544/). March 1999. Informational. URL: <https://www.rfc-editor.org/info/rfc2544/> 

[RFC3513] 
    R. Hinden; S. Deering. [Internet Protocol Version 6 (IPv6) Addressing Architecture](https://www.rfc-editor.org/info/rfc3513/). April 2003. Proposed Standard. URL: <https://www.rfc-editor.org/info/rfc3513/> 

[RFC3849] 
    G. Huston; A. Lord; P. Smith. [IPv6 Address Prefix Reserved for Documentation](https://www.rfc-editor.org/info/rfc3849/). July 2004. Informational. URL: <https://www.rfc-editor.org/info/rfc3849/> 

[RFC3927] 
    S. Cheshire; B. Aboba; E. Guttman. [Dynamic Configuration of IPv4 Link-Local Addresses](https://www.rfc-editor.org/info/rfc3927/). May 2005. Proposed Standard. URL: <https://www.rfc-editor.org/info/rfc3927/> 

[RFC4193] 
    R. Hinden; B. Haberman. [Unique Local IPv6 Unicast Addresses](https://www.rfc-editor.org/info/rfc4193/). October 2005. Proposed Standard. URL: <https://www.rfc-editor.org/info/rfc4193/> 

[RFC4291] 
    R. Hinden; S. Deering. [IP Version 6 Addressing Architecture](https://www.rfc-editor.org/info/rfc4291/). February 2006. Draft Standard. URL: <https://www.rfc-editor.org/info/rfc4291/> 

[RFC5735] 
    M. Cotton; L. Vegoda. [Special Use IPv4 Addresses](https://www.rfc-editor.org/info/rfc5735/). January 2010. Best Current Practice. URL: <https://www.rfc-editor.org/info/rfc5735/> 

[RFC6555] 
    D. Wing; A. Yourtchenko. [Happy Eyeballs: Success with Dual-Stack Hosts](https://www.rfc-editor.org/info/rfc6555/). April 2012. Proposed Standard. URL: <https://www.rfc-editor.org/info/rfc6555/> 

[RFC6598] 
    J. Weil; et al. [IANA-Reserved IPv4 Prefix for Shared Address Space](https://www.rfc-editor.org/info/rfc6598/). April 2012. Best Current Practice. URL: <https://www.rfc-editor.org/info/rfc6598/> 

[RFC8305] 
    D. Schinazi; T. Pauly. [Happy Eyeballs Version 2: Better Connectivity Using Concurrency](https://www.rfc-editor.org/info/rfc8305/). December 2017. Proposed Standard. URL: <https://www.rfc-editor.org/info/rfc8305/> 

[RFC9637] 
    G. Huston; N. Buraglio. [Expanding the IPv6 Documentation Space](https://www.rfc-editor.org/info/rfc9637/). August 2024. Informational. URL: <https://www.rfc-editor.org/info/rfc9637/> 

[SOHO-PHARMING] 
    Team Cymru. [SOHO Pharming](https://331.cybersec.fun/TeamCymruSOHOPharming.pdf). URL: <https://331.cybersec.fun/TeamCymruSOHOPharming.pdf> 

[TREND-MICRO] 
     [TrendMicro node.js HTTP server listening on localhost can execute commands](https://bugs.chromium.org/p/project-zero/issues/detail?id=693). URL: <https://bugs.chromium.org/p/project-zero/issues/detail?id=693>
## IDL Index

```
enum [IPAddressSpace](https://wicg.github.io/local-network-access/#enumdef-ipaddressspace) { ["public"](https://wicg.github.io/local-network-access/#dom-ipaddressspace-public), ["local"](https://wicg.github.io/local-network-access/#dom-ipaddressspace-local), ["loopback"](https://wicg.github.io/local-network-access/#dom-ipaddressspace-loopback) };

partial dictionary [RequestInit](https://fetch.spec.whatwg.org/#requestinit) {
  [IPAddressSpace](https://wicg.github.io/local-network-access/#enumdef-ipaddressspace) [targetAddressSpace](https://wicg.github.io/local-network-access/#dom-requestinit-targetaddressspace);
};

partial interface [Request](https://fetch.spec.whatwg.org/#request) {
  readonly attribute [IPAddressSpace](https://wicg.github.io/local-network-access/#enumdef-ipaddressspace) [targetAddressSpace](https://wicg.github.io/local-network-access/#dom-request-targetaddressspace);
};


```

## Issues Index
The definition of [local network requests](https://wicg.github.io/local-network-access/#local-network-request) could be expanded to cover all cross-origin requests for which the [current url](https://fetch.spec.whatwg.org/#concept-request-current-url)’s maps to an IP address whose [IP address space](https://wicg.github.io/local-network-access/#ip-address-space) is not [public](https://wicg.github.io/local-network-access/#ip-address-space-public). This would prevent a malicious server on the local network from attacking other servers, including servers on `localhost`. See [wicg/private-network-access issue #39](https://github.com/wicg/private-network-access/issues/39). [↵](https://wicg.github.io/local-network-access/#issue-57b72255 "Jump to section")
To be able to apply LNA checks to all cross-origin [local](https://wicg.github.io/local-network-access/#ip-address-space-local) requests in the future (see Issue above), Chromium plans to exempt local servers that likely cannot currently get publicly trusted HTTPS certificates from this requirement (e.g., servers on `.local` and private IP literals). See [§ 4.4 Rollout Difficulties](https://wicg.github.io/local-network-access/#rollout-difficulties) for more discussion, and also see [wicg/private-network-access issue #96](https://github.com/wicg/private-network-access/issues/96). [↵](https://wicg.github.io/local-network-access/#issue-ad33f503 "Jump to section")
Chromium only applies LNA restrictions to iframe navigations currently. It may be worth expanding this to include main-frame navigations (especially popup windows which can be controlled by their opener). [↵](https://wicg.github.io/local-network-access/#issue-0daaba5a "Jump to section")
To address [wicg/local-network-access issue #103](https://github.com/wicg/local-network-access/issues/103) we will need to instead integrate into Step 4.6 of [obtain a connection](https://fetch.spec.whatwg.org/#concept-connection-obtain) to perform checks after resolving the origin but before the actual connection is created. [↵](https://wicg.github.io/local-network-access/#issue-879e23d2 "Jump to section")
Define local network access behavior for Service Workers. [↵](https://wicg.github.io/local-network-access/#issue-fa78d5be "Jump to section")
Chromium’s implementation currently applies the LNA permission for service worker-initiated fetches based on the worker’s script origin (since there may not be an active document around when the service worker is executing). It may be better for this to be based on the partitioned storage key of the worker, and it would also be good if permissions policy supported service workers. [↵](https://wicg.github.io/local-network-access/#issue-5e5ce7ba "Jump to section")
The [Service Worker](https://w3c.github.io/ServiceWorker/#dfn-service-worker) [soft update](https://w3c.github.io/ServiceWorker/#soft-update) algorithm unfortunately sets a [request client](https://fetch.spec.whatwg.org/#concept-request-client) of "null" when [fetching](https://fetch.spec.whatwg.org/#concept-fetch) an updated script. This causes all sorts of issues, and interferes with the local network access check algorithm laid out above. Indeed, there is no [request client](https://fetch.spec.whatwg.org/#concept-request-client) from which to copy the [policy container](https://fetch.spec.whatwg.org/#concept-request-policy-container) during [fetch](https://fetch.spec.whatwg.org/#concept-fetch). See [wicg/private-network-access issue #83](https://github.com/wicg/private-network-access/issues/83). [↵](https://wicg.github.io/local-network-access/#issue-f8588a8c "Jump to section")
Re-evaluate this after implementation experience. [↵](https://wicg.github.io/local-network-access/#issue-339df313 "Jump to section")
Potential mitigations would require noticing network changes and clearing state specific to the previous network. Doing so in a fully general manner is likely to be impossible short of clearing all state. Maybe a practical compromise can be reached. See [wicg/private-network-access issue #28](https://github.com/wicg/private-network-access/issues/28). [↵](https://wicg.github.io/local-network-access/#issue-07dc866e "Jump to section")
  *[W3C]: World Wide Web Consortium
