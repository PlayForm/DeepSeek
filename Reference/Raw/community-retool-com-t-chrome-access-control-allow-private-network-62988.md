#  [ Chrome Access-Control-Allow-Private-Network ](https://community.retool.com/t/chrome-access-control-allow-private-network/62988)
[💬 App Building](https://community.retool.com/c/app-building/5)
You have selected **0** posts.
[ select all ](https://community.retool.com/t/chrome-access-control-allow-private-network/62988)
[ cancel selecting ](https://community.retool.com/t/chrome-access-control-allow-private-network/62988)
1.0k views  6 links 
[ taekmin.lee ](https://community.retool.com/u/taekmin.lee)
[ Nov 2025 ](https://community.retool.com/t/chrome-access-control-allow-private-network/62988 "Post date")
I'm experiencing CORS issues with axios inside Custom Components after updating to Chrome 142. Setting Access-Control-Allow-Private-Network to disabled resolves it, but is there a way to fix this without disabling it?
1.0k views  6 links 
[ Ollie_Clyde ](https://community.retool.com/u/ollie_clyde)
[ Nov 2025 ](https://community.retool.com/t/chrome-access-control-allow-private-network/62988/2 "Post date")
Thank you for flagging this.
This appears to be due to the [local network access restrictions](https://cr-status.appspot.com/feature/5152728072060928?gate=5150690177187840) that they have rolled out in the most recent 149 chrome release. It looks like there is a clearer breakdown of what this means and how to work around it [here](https://docs.google.com/document/d/1QQkqehw8umtAgz5z0um7THx-aoU251p705FbIQjDuGs/edit?tab=t.0#heading=h.gx2opjhp43r).
It says that the user should be given a permission prompt - is that happening here? Otherwise setting the Access-Control-Allow-Private-Network in your Chrome settings seems to be the fix here.
For Chrome enterprise users there does seem to be a cleaner option where you can add url allow lists for local network requests.
11 days later 
[ christophrico ](https://community.retool.com/u/christophrico)
[ Nov 2025 ](https://community.retool.com/t/chrome-access-control-allow-private-network/62988/3 "Post date")
Hey Ollie! Thanks for sharing the workarounds. Does Retool have plans to allow local network access from inside the sandbox? I have a handful of apps that call local resources (printers, camera, etc.), that don’t work because Chrome blocks the local network requests before they make it out of the browser.
I can get by for now by having users use Firefox, but Chrome would be preferable for sure.
2 months later 
[ Jan 5 ](https://community.retool.com/t/chrome-access-control-allow-private-network/62988/4 "Post date")
Thanks for reaching out, [@christophrico](https://community.retool.com/u/christophrico). I'm not sure this is something that Retool itself can control. To Ollie's point, though, do you see a prompt for the user to grant permission? I wonder if it's being suppressed within the custom component's iframe.
It's also worth nothing that Mozilla has publicly [committed](https://groups.google.com/a/mozilla.org/g/dev-platform/c/B8oN3ARp_j0/m/rWKXmnj4AAAJ) to implementing a similar restriction, though there haven't been any updates in a while.
[ christophrico ](https://community.retool.com/u/christophrico)
[ Jan 5 ](https://community.retool.com/t/chrome-access-control-allow-private-network/62988/5 "Post date")
Hey [@Darren](https://community.retool.com/u/darren) , the prompt for the user to grant permission appears, and the user can grant permission. It seems as though the fetch request never makes it out of the browser (for both custom components or plain ol’ JS script blocks in Retool).
This is the info Chrome gives when I dig into it. It appears that even when the user grants private network access to Retool, because Retool runs in a sandbox and has origin null, Chrome blocks the fetch from making it out of the browser to the local machine.
Here’s what Chrome says: The error "Access to fetch... from origin 'null' has been blocked by CORS policy: Request had a target IP address space of `unknown` yet the resource is in address space `loopback`" means your web page, loaded from a local file (`file:///`) and thus having a `null` origin, is trying to access a local server (`127.0.0.1`) which is blocked by browser security (CORS and Private Network Access). The best fix is to serve your frontend web page from a local web server (e.g., `http://localhost:8000`) during development. Alternatively, configure your backend to explicitly allow `null` origin and `Access-Control-Allow-Private-Network: true` headers, but this is less secure.
[ christophrico ](https://community.retool.com/u/christophrico)
[ Jan 5 ](https://community.retool.com/t/chrome-access-control-allow-private-network/62988/6 "Post date")
The LNA adoption guide here has instructions on how to allow iFrames to make local network requests. In short, just needs the tag allow=”local-network-access”. I’m not sure if this is something Retool could add as a flag or not. If so, it would be really, really appreciated.
[ Jan 5 ](https://community.retool.com/t/chrome-access-control-allow-private-network/62988/7 "Post date")
I was just looking at something similar. As you probably guessed, custom components are indeed rendered within an `iframe` and it's not currently possible to add specific policies to its `allow` property. There is some precedent for adding new default policies, but this one should probably be considered optional. I'll talk to the rest of the team about options and give you an update as soon as I can!
[ christophrico ](https://community.retool.com/u/christophrico)
[ Jan 5 ](https://community.retool.com/t/chrome-access-control-allow-private-network/62988/8 "Post date")
Of course! I understand it’s not something to be done lightly. Thank you for checking in on it!
Calling local resources from javascript scripts within a standard code block ( i.e., not from within a custom component) also seems to be blocked in a similar way. Any chance of enabling those as well, or is that out of reach?
[ Jan 5 ](https://community.retool.com/t/chrome-access-control-allow-private-network/62988/9 "Post date")
I think it's less likely, but I can follow up on that at the same time. We used to support full customization of the sandboxed execution environment on self-hosted instances, but deprecated the corresponding [environment variable](https://docs.retool.com/self-hosted/reference/environment-variables#property-CUSTOM_RETOOL_SANDBOX_RESTRICTIONS) when upgrading the runtime. It's still possible to make certain modifications to the way [embedded content](https://docs.retool.com/self-hosted/guides/origin-sandbox) is executed, though.
Reply
###  Related topics   
|  Topic   |  Replies   |  Views   |  Activity   |  
| --- | --- | --- | --- |  
|  [How to get browser-side query to run?](https://community.retool.com/t/how-to-get-browser-side-query-to-run/49218)  |  
|  [CORS Issue when trying to call Workflow through retool on webpage?](https://community.retool.com/t/cors-issue-when-trying-to-call-workflow-through-retool-on-webpage/22856) [💬 App Building](https://community.retool.com/c/app-building/5)  |  2.5k  |  
|  [Missing `allow-same-origin` in iFrame’s in 3.22.6](https://community.retool.com/t/missing-allow-same-origin-in-iframes-in-3-22-6/30978) [💬 Self Hosted Retool](https://community.retool.com/c/on-prem/16)  |  1.6k  |  
|  [Does retool modify the chrome object? Cannot access chrome.runtime](https://community.retool.com/t/does-retool-modify-the-chrome-object-cannot-access-chrome-runtime/54153)  |  
|  [How to test Retool Embed on a test/staging env hosted on a URL different from production?](https://community.retool.com/t/how-to-test-retool-embed-on-a-test-staging-env-hosted-on-a-url-different-from-production/49421) [💬 External Apps](https://community.retool.com/c/external-apps/26)  |  
[ Powered by Discourse ](https://discourse.org/powered-by)
Invalid date  Invalid date 
