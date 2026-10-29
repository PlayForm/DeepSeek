#  Use case for WebSocket communications
Copy link
Copy link
Open
[Use case for WebSocket communications](https://github.com/WICG/local-network-access/issues/16#top)#16
Copy link
opened [on Jun 5, 2025](https://github.com/WICG/local-network-access/issues/16#issue-3121953394)
Last edited by tresf
Issue body actions
Per lengthy discussion [#4](https://github.com/WICG/local-network-access/issues/4), I wanted to open a dedicated thread about WebSocket communications.
Some technologies directly impacted by this proposal (to name a few)
  * QZ Tray (I'm the author of this)
  * PrintNode
  * Cricut Design Space
  * JSPrintManager
  * obs-websocket


### Just click "OK"
Understanding that this change may effectively be as simple as [clicking "OK" to a pop-up](https://github.com/explainers-by-googlers/local-network-access/issues/4#issuecomment-2945162871), I am asking for a mechanism (such as the PNA server-side opt-in) that allows some form of suppression to this pop-up that doesn't involve side-loading an [enterprise policy](https://chromeenterprise.google/policies/) for any and all browsers enforcing this requirement.
In regards to the QZ Tray example above, [we already make our users click OK](https://www.reddit.com/r/qztray/comments/wrfzlo/remember_this_decision_checkbox_disables_yes/) so this is a pop-up to see a pop-up. 😅
**Edit:** Maybe this is more of a gentle ask to provide end-user policies? This isn't the first browser policy we've battled, but a mechanism to pre-allow on the client-end would be a welcome-change.
  * [Provide a mechanism for whitelisting #38](https://github.com/WICG/local-network-access/issues/38)


### How to supply "targetAddressSpace" to WebSocket connection?
For any of the WebSocket services running on `localhost`, [no changes are needed](https://github.com/explainers-by-googlers/local-network-access/issues/4#issuecomment-2937728361), however for public DNS addresses that point to local addresses, this will be a new requirement. The [specification explains how this is provided to `fetch()`](https://github.com/explainers-by-googlers/local-network-access?tab=readme-ov-file#local-network-requests), but how will it be provided to `WebSocket`?
Thanks for reading as well as providing a place to discuss this.
  1. Collaborator
More actions
> Understanding that this change may effectively be as simple as [#4 (comment)](https://github.com/WICG/local-network-access/issues/4#issuecomment-2945162871), I am asking for a mechanism (such as the PNA server-side opt-in) that allows some form of suppression to this pop-up that doesn't involve side-loading an [enterprise policy](https://chromeenterprise.google/policies/) for any and all browsers enforcing this requirement.
> In regards to the QZ Tray example above, [we already make our users click OK](https://www.reddit.com/r/qztray/comments/wrfzlo/remember_this_decision_checkbox_disables_yes/) so this is a pop-up to see a pop-up. 😅
It sounds like you are already doing the right thing by explaining to your users what is happening to give them context, which should help them have context to understand the new permission prompt when it pops up.
Unfortunately we ultimately cannot distinguish abuse from legitimate, which is why we will show a permission prompt to the user.
> Edit: Maybe this is more of a gentle ask to provide end-user policies? This isn't the first browser policy we've battled, but a mechanism to pre-allow on the client-end would be a welcome-change.
I'm not sure exactly what you mean by "end-user policies" -- could you elaborate?
> How to supply "targetAddressSpace" to WebSocket connection? For any of the WebSocket services running on localhost, [#4 (comment)](https://github.com/WICG/local-network-access/issues/4#issuecomment-2937728361), however for public DNS addresses that point to local addresses, this will be a new requirement. The [specification explains how this is provided to fetch()](https://github.com/explainers-by-googlers/local-network-access?tab=readme-ov-file#local-network-requests), but how will it be provided to WebSocket?
I think this is a reasonable feature request (since WebSocket set-up should really be Fetch under the hood, at least from the spec), and we can investigate whether something similar could be added to WebSocket creation to flag connections to otherwise public DNS names as being destined to the local network. In Chromium, we haven't yet started implementing the WebSocket integration so the LNA permission is not yet applied to it even with the feature flag enabled.
  2. Last edited by tresf
Author
More actions
> Unfortunately we ultimately cannot distinguish abuse from legitimate, which is why we will show a permission prompt to the user.
Perhaps I still do not fully understand the scope of the abuse and how we got here, so please accept my apologies if I'm minimizing anything here, but....
What abuse?
     * Use-case: Someone's trying to hack my router/printer/localhost app/etc: PNA fixes this by requiring the server to explicitly allow this.
     * Use-case: Facebook is doing shady stuff with preflight headers. I'm still trying to digest this one, but what confused me the most about the article is how they're able to obtain this to a secure server? I personally feel that "trusted is trusted" but I don't think I understand how this is technically feasible through a secure server. For insecure servers, this feels like a backpedal after allowing the insecure comms to begin with -- but (the popup) is what I'd consider a "reasonable trade-off". For secure servers, I don't understand how they're doing it at all to local reasources, perhaps someone can elaborate?
> I'm not sure exactly what you mean by "end-user policies" -- could you elaborate?
Hmm... I hope I'm not getting too off-topic, but the idea of browsers embracing policies for non-enterprise users. macOS offers a good start for this on the OS-level where they raise "Hey can app ABC do this?" or more specifically "Hey can QZ Tray modify other apps on this computer" but macOS will fail the entire install if "No" is clicked, so it's compulsory. Worse, in Windows, apps can go hog wild on 3rd party applications without any prompt or warning. If these 3rd party changes were sanctioned in some form of "app friendly" gatekeeper process, it could be a solution to influence a browser's behavior by explicit permission. Some examples:
     * URI whitelisting in Chromium:`qz:launch` will start our app:
       * Chromium won't launch the app until a pop-up is clicked. They must click a checkbox to remember this. Chrome offers the suppression the pop-up through `chrome://policy`, `URLAllowlist: ["qz://*"]`. Setting this programmatically is only possible through the "misuse" of enterprise policies during installation to achieve this level of integration. (This specific policy [has been broken on Windows for some time](https://github.com/qzind/tray/issues/1277) and I've been too lazy to file a bug report so if I get attacked for admitting this, I'll probably just remove it)
     * Cert whitelisting in Firefox: we want it to use system-installed certificates:
       * Firefox by default ships with it's own certificate store but this breaks any "non-CA-Trusted" HTTPS certificates that were installed system-wide. Firefox allows changing this behavior through `security.enterprise_roots.enabled`, but users can't easily remove this once it's been set and an app has to misuse enterprise policies to achieve this level of integration. (From my understanding many WebSocket apps use this technique for side-loading SSL support... but it's still frowned upon)
     * [Insert example here for LNA popup suppression once policy is established]
(I'd even go as far to say ISVs could be vetted/signing before using this process -- much like how the OSs require vetting/signing to establish a trust to even install the app to begin with. I'm not sure what the design would look like, but it's something that would embrace responsibility and cooperation with the ISVs).
These are three examples, but as browsers try to be more responsible over default settings, I feel the need for non-enterprise policies will only grow with time. Hopefully I'm not ostracised much for tossing these out into a public space. 😅
  3. Last edited by g-ortuno
Contributor
More actions
[This article](https://localmess.github.io/) from the researchers has a lot of information. The relevant part (edited for conciseness):
    1. The user opens the native Facebook or Instagram app, which eventually is sent to the background and creates a background service to listen for incoming traffic on a TCP port (12387 or 12388) and a UDP port (the first unoccupied port in 12580-12585).
    2. The user opens their browser and visits a website integrating the Meta Pixel.
    3. The Meta Pixel script sends [data] to the native Instagram or Facebook app via WebRTC (STUN) SDP Munging [to the ports from 1.].
  4. Last edited by tresf
Author
More actions
> [This article](https://localmess.github.io/) from the researchers has a lot of information. The relevant part (edited for conciseness):
>     1. The user opens the native Facebook or Instagram app, which eventually is sent to the background and creates a background service to listen for incoming traffic on a TCP port (12387 or 12388) and a UDP port (the first unoccupied port in 12580-12585).
>     2. The user opens their browser and visits a website integrating the Meta Pixel.
>     3. The Meta Pixel script sends [data] to the native Instagram or Facebook app via WebRTC (STUN) SDP Munging [to the ports from 1.].
Yeah that's the article I tried to understand but nothing about your reply really answers the "How are they using HTTPS?" question... Here's a snippet...
> [...] the Yandex Metrica script transmits data via HTTPS to local ports 29010 and 30103. This design choice obfuscates the data exfiltration process, thereby complicating conventional detection mechanisms.
I'm still unsure how an app can communicate using HTTPS without some certificate trickery... and in that case, I still say the issue isn't the local-traffic, it's the fact that CAs are issuing certs to spyware (or if it's not CA-issued, that this app is using a MITM), which I'm trying to understand why LNA believe it has onus over....
So... if instead LNA DOESN'T show the pop-up for trusted, local, secure connections, the pop-up would only show for those using HTTP, which would (IMO) significantly reduce the impact to end-users when this popup is rolled out.
  5. Collaborator
More actions
I think it might help clarify things to split this into two pieces.
First, _any_ request from a public site that connects to a local or loopback IP address will trigger the LNA permission prompt. This is based on the _resolved_ IP address after trying to make the connection. Being able to get the LNA permission is additionally gated on the site being a secure context (i.e., served over HTTPS).
Second, because sites that need the LNA permission _must_ be HTTPS, but local network requests are often to devices where it is currently difficult to get working HTTPS and if accessed over HTTP they would ordinarily be blocked as mixed content, the LNA permission _additionally_ relaxes the mixed content blocking logic to allow certain local network requests through.
So for your WebSocket use case there are four examples I can work through:
    1. If the public website connecting to the local QZTray software does it using the URL `ws://127.0.0.1:8080/...`, this would _not_ count as mixed content (as `localhost` is considered a secure context) but _would_ trigger the LNA permission prompt.
    2. If the public website connecting to the local QZTray software does it using the URL `ws://192.168.0.10:8080/...` (where `192.168.0.10` is the internal IP address of the machine running the software), this would be automatically exempted from mixed content checks (because the hostname is an internal IP address), and would trigger the LNA permission prompt.
    3. If the public website connecting to the local QZTray software does it using the URL `ws://internal.example.com:8080/...` (where `internal.example.com` resolves to either `127.0.0.1` or `192.168.0.10`), this would be blocked as mixed content (because the mixed content checker triggers _before_ hostname resolution)
    4. If the public website connecting to the QZTray software does it using the URL `wss://internal.example.com:8080/...` (where `internal.example.com` resolves to either `127.0.0.1` or `192.168.0.10` **and** that machine has a trusted HTTPS certificate), this would not count as mixed content but _would_ trigger the LNA permission prompt.
If we were able to add something akin to the `targetAddressSpace` fetch() option but for WebSockets, that would be useful for Example 3 above -- it would allow the public website to "pre-declare" that the hostname would resolve to a local address, allowing the mixed content checker to exempt the request. It would have no effect in the other three cases.
  6. Last edited by tresf
Author
More actions
> It would have no effect in the other three cases.
Oh... That certainly simplifies it, then. I was under the impression 4 would require it too. However, I still feel that in the use-case of 3, it's not something a web developer can predict though. I suppose MOST use-cases it can be assumed, but for on-prem, local-local I still see ambiguity in implementation (same for public-public) since there's really no way for a connection library to know the infrastructure in advance, meaning the (hypothetical WebSocket) `targetAddressSpace` flag must be available as a toggle to implementing libraries... However I think library maintainers will prefer the pop-up to a failed connection which means most "usually local" connections will likely provided this flag blindly, all the time.
  7. More actions
What is make use of is

```
--unsafely-treat-insecure-origin-as-secure=http://0.0.0.0:44818,ws://0.0.0.0:44818,http://0.0.0.0:8080,ws://0.0.0.0:8080

```

  8. More actions
Of course, this can be gotten around altogether by using an extension.
  9. More actions
Let's say you have control over both localhost networking and the code in an arbitrary Web page.
Create a WebRTC Data Channel connection in each cross-origin script. Exchange SDP by any means (there are several ways to do this - without any prompting), then you have peer-to-peer communications on the same machine, across any Web origins, and across Web/OS, with `ArrayBuffer`s to and fro. That's without using any extensions.
There's other ways to get around this entirely, too.
  10. Collaborator
More actions
FYI we have LNA integrated with websockets behind a flag now, if people want to start playing with it.
Min version in chrome: 142.0.7395.0
And you'll need to go to chrome://flags and enable both #local-network-access-check (to the Blocking setting) and #local-network-access-check-websockets
No schedule for release yet.
  11. Last edited by tresf
Author
More actions
Tested on Canary; works as described.
I still find this to be terribly sad, especially considering this is a `localhost` --> `localhost` connection a `wss://` (trusted) connection where the SSL cert is ONLY bound to `localhost` (so the "any device on your local network" portion is not accurate), but all requests to offer a way to suppress this seem to take a back seat, forcing apps to abuse the enterprise policies to circumvent this unnecessary pop-up, quoting the original report:
> Understanding that this change may effectively be as simple as [#4 (comment)](https://github.com/WICG/local-network-access/issues/4#issuecomment-2945162871), I am asking for a mechanism (such as the PNA server-side opt-in) that allows some form of suppression to this pop-up that doesn't involve side-loading an [enterprise policy](https://chromeenterprise.google/policies/) for any and all browsers enforcing this requirement.
  12. Last edited by tresf
Author
More actions
> [...] forcing apps to abuse the enterprise policies to circumvent this unnecessary pop-up [...]
[@hubertchao](https://github.com/hubertchao) can you offer up any details on what the enterprise policy will look like for this? I don't yet see any specific mention of WebSockets at <https://chromeenterprise.google/policies/>.
**Edit:** or is the policy the same and simply protocol agnostic?
  13. Last edited by tresf
Author
More actions
> > [...] forcing apps to abuse the enterprise policies to circumvent this unnecessary pop-up [...]
> [@hubertchao](https://github.com/hubertchao) can you offer up any details on what the enterprise policy will look like for this? I don't yet see any specific mention of WebSockets at <https://chromeenterprise.google/policies/>.
> **Edit:** or is the policy the same and simply protocol agnostic?
Oh wait, this doesn't help at all because every site on the internet needs to be in that listing... Can there be a new policy to whitelist the destination address?
  14. Collaborator
More actions
> > [...] forcing apps to abuse the enterprise policies to circumvent this unnecessary pop-up [...]
> [@hubertchao](https://github.com/hubertchao) can you offer up any details on what the enterprise policy will look like for this? I don't yet see any mention of it in <https://chromeenterprise.google/policies/>.
Haven't thought about it yet.
I was hoping that <https://chromeenterprise.google/policies/#LocalNetworkAccessAllowedForUrls> would work for ws/wss urls, but I just looked and this
<https://chromeenterprise.google/policies/url-patterns/>
makes me think it might not work.
(maybe the documentation is out of date?)
  15. Last edited by tresf
Author
More actions
> makes me think it might not work. (maybe the documentation is out of date?)
No, we're just thinking about it backwards. It's a URL (e.g. website) we're whitelisting, so this policy is only helpful for organizations that would use a plugin on a known pre-defined domain(s).
It appears there's no way to specify the destination address in a white-list, meaning this popup will occur for every website, everywhere unless the setting is completely disabled (which is what some apps will do, sadly). Granularity around the destination address would be nice, so I could specify that `wss://localhost:MY_PORT` is expected, e.g. something like `LocalNetworkAccessAllowedForDestination="wss://localhost:MY_PORT"`, etc)
  16. ###  27 remaining items
Load more
  17. Collaborator
More actions
> [@hubertchao](https://github.com/hubertchao). Interestingly, it [now changes the address bar to say `insecure`](https://github.com/user-attachments/assets/c0f8a7c4-b1f9-4360-ac03-677cbb547ffa). Is this intended? This does NOT occur for localhost.
Yes, that is intended. It doesn't occur for localhost because localhost is considered to be "potentially trustworthy" (see <https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Secure_Contexts#potentially_trustworthy_origins>) and therefore doesn't trigger the `insecure` chip on the address bar
(of note, previously anything connecting to `ws://` would've been served from an http origin to not run afowl of mixed content checks, and would have also displayed the `insecure` chip)
  18. Last edited by tresf
Author
More actions
> (of note, previously anything connecting to ws:// would've been served from an http origin to not run afowl of mixed content checks, and would have also displayed the insecure chip)
Yeah, just some odd context there because most users associate that with the origin.
> see <https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Secure_Contexts#potentially_trustworthy_origins>
Thanks for the link. Does this mean that APIs requiring a secure context break when this connection occurs? If so, ouch.
> [...] additionally relaxes the mixed content blocking logic to allow certain local network requests through.
Quoting this again because I don't think "relax" is a word I'd use when this "insecure" notice appears in the URL. This will likely kill any adoption of this tech outside of localhost or SSL. Related [#83](https://github.com/WICG/local-network-access/issues/83)
**Edit:** Note the current workaround to this is to visit every workstation and enable "Treat insecure origins as secure" and add the IP Address. Most organizations will likely prefer the old "manual" procedure over this new "insecure" indicator. ... and if website features start to break, they'll have no choice in the matter.
  19. Collaborator
More actions
Mixed content has been completely blocked by default in browsers for a while now, so allowing this to go through at all is a relaxation of that security restriction.
This should be a no-op for you, right? If you are using insecure websocket connections today you already have to be on an http:// page, which will be marked as Insecure.
  20. Last edited by tresf
Author
More actions
> Mixed content has been completely blocked by default in browsers for a while now, so allowing this to go through at all is a relaxation of that security restriction.
Agreed.
> This should be a no-op for you, right? If you are using insecure websocket connections today you already have to be on an http:// page, which will be marked as Insecure.
Sorta... HTTPS is usable with a workaround requoting:
> the current workaround to this is to visit every workstation and enable "Treat insecure origins as secure" and add the IP Address. Most organizations will likely prefer the old "manual" procedure over this new "insecure" indicator. ... and if website features start to break, they'll have no choice in the matter.
.. this does NOT trigger the red "insecure" origin warning and also does NOT downgrade any components from working due to breaking the "secure" context.
  21. Author
More actions
Today's the day that [Chrome 147 is expected](https://chromiumdash.appspot.com/schedule) to be released with WebSockets being blocked by default. Firefox is targeting [151](https://github.com/mozilla/policy-templates/issues/1259#issuecomment-4194607529).
  22. Author
More actions
.. wait, or is it? <https://chromereleases.googleblog.com/> says only Chrome Beta on Android receives 147 today. Can I get some clarification from the Chrome team on this?
  23. Last edited by hubertchao
Collaborator
More actions
147 is already rolling out slowly in early stable on Android (and other platforms).
<https://chromereleases.googleblog.com/2026/04/chrome-for-android-update.html> <https://chromereleases.googleblog.com/2026/04/early-stable-update-for-desktop.html>
I don't know why they also chose to update beta channel with another 147 release on android.
  24. Last edited by tresf
Author
More actions
> 147 is already rolling out slowly in early stable on Android (and other platforms).
Thanks! I think the "early stable" terminology here is slightly confusing, since the [chart linked](https://github.com/user-attachments/assets/26f60ab3-b1b3-4f91-832b-74f665628bdb) uses this same exact term for the March 25 release.
Anyway... I checked again and the update came through. I can confirm WebSockets to LAN/localhost are now ~~blocked~~ prompt by default.
  25. Collaborator
More actions
> > 147 is already rolling out slowly in early stable on Android (and other platforms).
> Thanks! I think the "early stable" terminology here is slightly confusing, since the [chart linked](https://github.com/user-attachments/assets/26f60ab3-b1b3-4f91-832b-74f665628bdb) uses this same exact term for the March 25 release.
That's because there's more than one release for each channel. e.g the March 25th desktop early stable release.
<https://chromereleases.googleblog.com/2026/03/early-stable-update-for-desktop_25.html>
Early stable is a bit different in that its just a stable channel release that is only pushed out to a small percentage of users.
[This](https://chromiumdash.appspot.com/releases?platform=Android) has a lot more detail (and you can select different platforms).
  26. More actions
Adding my voice to those requesting targetAddressSpace support for websockets. I run an OBS remote control (using the obs-websocket), and it is intended to be able to be used from a phone/tablet/laptop on the LAN. As a workaround, users need to identify the streaming host by IP address (and strictly a LAN IP, not a globally-addressible one) rather than hostname, due solely to the inability of the site to identify the request as a LAN one.
  27. Collaborator
More actions
> Adding my voice to those requesting targetAddressSpace support for websockets. I run an OBS remote control (using the obs-websocket), and it is intended to be able to be used from a phone/tablet/laptop on the LAN. As a workaround, users need to identify the streaming host by IP address (and strictly a LAN IP, not a globally-addressible one) rather than hostname, due solely to the inability of the site to identify the request as a LAN one.
Currently are you able to use the secure context exemption origin trial? <https://developer.chrome.com/origintrials/#/view_trial/3826370833404657665>
We are scoping out how we might be able to add this to WebSockets. For Chromium, I've filed a tracking bug at crbug.com/517413738.
  28. More actions
> Currently are you able to use the secure context exemption origin trial? <https://developer.chrome.com/origintrials/#/view_trial/3826370833404657665>
I did consider signing up for the trial, but since it's explicitly for a very limited time, it didn't seem like a good use of time and effort; it only kicks the can down the road a few months. For the time being, I have told my users that they need to use IP addresses, which is an annoying limitation but no worse than requiring them to participate in the trial.
  29. Last edited by tresf
Author
More actions
> I did consider signing up for the trial, but since it's explicitly for a very limited time, it didn't seem like a good use of time and effort;
Same. I've told zero users to use this origin trial method for the same timebomb reasons. Fortunately for our users, they have the luxury of switching to HTTPS (which was previously blocked by mixed content restrictions). I did not expect it, but I think about 25% of our support issues have been websites that were running from insecure origins, it was a complete oversight on our part. We were so worried about the people clicking "block" on the pop-ups, we completely failed to serve and explain to the users using insecure contexts. Our API actually is still hard-coded to use `insecure <--> insecure` but now the script is flipped and `secure <---> insecure` and `insecure <--> secure` are the norm now since Chrome 147, but we're hesitant to change it internally until the rest of the browsers catch up (or we add a bunch of browser detection logic to do the same)
  30. Collaborator
More actions
Yeah that makes sense with use cases like yours where your users are individually deploying an instance (and thus would have to set up the OT themselves). Hopefully we can get the targetAddressSpace option added to WebSockets.
  31. Last edited by tresf
Author
More actions
> Yeah that makes sense with use cases like yours where your users are individually deploying an instance (and thus would have to set up the OT themselves). Hopefully we can get the targetAddressSpace option added to WebSockets.
Yeah we have a mixed bag of enterprise and non-enterprise. For example, Amazon Seller -- despite its name -- is our widest single-vendor user base and they're predominantly SMB/home users, so having them reset the permissions was usually sufficient... but there was a surprisingly large amount of users that had side-stepped the old mixed-origin restrictions that got bit by this change that we just failed to recognize and our API is still plagued by this assumption as well.
The enterprise customers tend to have control over both the policies as well as the Chrome version. They also read their emails closely to understand the change since they're the first-party customer.


[Sign up for free](https://github.com/signup?return_to=https://github.com/WICG/local-network-access/issues/16)**to join this conversation on GitHub.** Already have an account? [Sign in to comment](https://github.com/login?return_to=https://github.com/WICG/local-network-access/issues/16)
## Metadata
### Assignees
No one assigned
### Labels
No labels
No labels
No type
### Projects
No projects
### Milestone
No milestone
### Relationships
None yet
### Development
No branches or pull requests
### Participants
  * Open in GitHub Copilot app


You can’t perform that action at this time. 
