# [How can I allow Mixed contents (http with https) using content-security-policy meta tag?](https://stackoverflow.com/questions/37043719/how-can-i-allow-mixed-contents-http-with-https-using-content-security-policy-m)
Asked 10 years, 5 months ago
Modified [3 years, 4 months ago](https://stackoverflow.com/questions/37043719/how-can-i-allow-mixed-contents-http-with-https-using-content-security-policy-m?lastactivity "2023-06-14 07:37:10Z")
Viewed 75k times 
This question shows research effort; it is useful and clear
34 
This question does not show any research effort; it is unclear or not useful
Save this question.
Show activity on this post.
I'm forcing `https` to access my website, but some of the contents must be loaded over `http` (for example video contents can not be over https), but the browsers block the request because of `mixed-contents` policy.
After hours of searching I found that I can use **Content-Security-Policy** but I have no idea how to allow mixed contents with it.

```
<meta http-equiv="Content-Security-Policy" content="????">

```



[Share](https://stackoverflow.com/q/37043719)
Share a link to this question
Copy link[CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/ "The current license for this post: CC BY-SA 3.0")
Short permalink to this question
[Improve this question](https://stackoverflow.com/posts/37043719/edit)
Follow 
Follow this question to receive notifications
asked May 5, 2016 at 6:19
[Mustafa Dwaikat](https://stackoverflow.com/users/mustafa-dwaikat)
3,672
1
  * I have the same problem. I think it's not an issue to provide a way of enabling mixed content server side. The developer can then do checksums on the loaded data to figure out if the content hasn't been tampered with. Just like for example Debian packages are downloaded via HTTP and then checksumed, I don't understand why my CDN has to be HTTPS. The programmer (sometimes) knows what he's doing.
2020-11-22 12:16:35 +00:00
[ Nov 22, 2020 at 12:16 ](https://stackoverflow.com/questions/37043719/how-can-i-allow-mixed-contents-http-with-https-using-content-security-policy-m#comment114834932_37043719)


##  3 Answers 3
Sorted by:  [ Reset to default ](https://stackoverflow.com/questions/37043719/how-can-i-allow-mixed-contents-http-with-https-using-content-security-policy-m?answertab=scoredesc#tab-top)
Highest score (default)  Trending (recent votes count more)  Date modified (newest first)  Date created (oldest first) 
This answer is useful
32 
This answer is not useful
Save this answer.
Loading when this answer was accepted…
Show activity on this post.
You can't.
CSP is there to restrict content on your website, not to loosen browser restrictions.
Secure https sites given users certain guarantees and it's not really fair to then allow http content to be loaded over it (hence the mixed content warnings) and really not fair if you could hide these warnings without your users consent.
You can use CSP for a couple of things to aid a migration to https, for example:
  1. You can use it to automatically upgrade http request to https (though browser support isn't universal). This helps in case you missed changing a http link to https equivalent. However this assumes the resource can be loaded over https and sounds like you cannot load them over https so that's not an option.
  2. You can also use CSP to help you identify any http resources on you site you missed by reporting back a message to a service you can monitor to say a http resource was attempted to be loaded. This allows you identify and fix the http links to https so you don't have to depend on above automatic upgrade.


But neither is what you are really looking for.
[Share](https://stackoverflow.com/a/37080972)
Share a link to this answer
Copy link[CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/ "The current license for this post: CC BY-SA 3.0")
Short permalink to this answer
Follow 
Follow this answer to receive notifications
[edited May 8, 2016 at 9:32](https://stackoverflow.com/posts/37080972/revisions "show all edits to this post")
answered May 6, 2016 at 20:32
[Barry Pollard](https://stackoverflow.com/users/barry-pollard)
47.3k
## 2 Comments
Add a comment
Harry Moreno
[Harry Moreno](https://stackoverflow.com/users/harry-moreno) [Mar 9, 2017 at 19:07](https://stackoverflow.com/questions/37043719/how-can-i-allow-mixed-contents-http-with-https-using-content-security-policy-m#comment72529054_37080972)
can the security be loosened via the origin response header? I was looking into the meta tag as it sounded easier to add. 
2017-03-09T19:07:06.243Z+00:00
Reply
  * Copy link


Barry Pollard
[Barry Pollard](https://stackoverflow.com/users/barry-pollard) [Mar 9, 2017 at 19:21](https://stackoverflow.com/questions/37043719/how-can-i-allow-mixed-contents-http-with-https-using-content-security-policy-m#comment72529596_37080972)
No. It's only used to tighten security policy - not loosen it. As mentioned in my answer. 
2017-03-09T19:21:44.077Z+00:00
Reply
  * Copy link


This answer is useful
14 
This answer is not useful
Save this answer.
Loading when this answer was accepted…
Show activity on this post.
You shouldn't... but you CAN, the feature is demonstrated [here](https://googlechrome.github.io/samples/csp-upgrade-insecure-requests/index.html) an HTTP PNG image converted on-the-fly to HTTPS.

```
<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">

```

There's also a new permissions API, [described here](http://updates.html5rocks.com/2015/04/permissions-api-for-the-web), that allows a Web server to check the user's permissions for features like geolocation, push, notification and Web MIDI.
[Share](https://stackoverflow.com/a/45842420)
Share a link to this answer
Copy link[CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/ "The current license for this post: CC BY-SA 3.0")
Short permalink to this answer
Follow 
Follow this answer to receive notifications
answered Aug 23, 2017 at 14:23
[nodws](https://stackoverflow.com/users/nodws)
1,125
## 7 Comments
Add a comment
PK-1825
I have added this in header section of master page but it wont help, is there any IIS Configuration that I supposed to do? coz I heard that chrome wont allow us to convert from HTTP file to HTTPS 
2019-05-28T11:02:12.893Z+00:00
Reply
  * Copy link


Green
I don't think it will help in your case, this solution assumes that you already have a valid secured URL with 'https', then this tag will help the browser to automatically call those ulrs will 'https' instead of 'http' without your need to manually change it in your page code, while if you don't have that secured URL, I believe you can this method. 
2019-11-20T16:39:39.923Z+00:00
Reply
  * Copy link


lucifer63
[lucifer63](https://stackoverflow.com/users/lucifer63) [Dec 14, 2020 at 16:24](https://stackoverflow.com/questions/37043719/how-can-i-allow-mixed-contents-http-with-https-using-content-security-policy-m#comment115430324_45842420)
Huge -1, cuz upgrade-insecure-requests has nothing to do with allowing mixed content, it just changes request scheme to https, and that's what happening in the attached example, not "conversion on-the-fly to HTTPS" 
2020-12-14T16:24:55.68Z+00:00
Reply
  * Copy link


nodws
Irrelevant,OP wanted to know HOW to use the meta tag 
2020-12-15T15:15:17.067Z+00:00
Reply
  * Copy link


stt
no, the question he asked was "How can I allow Mixed contents". that meta tag doesn't allow it. 
2021-07-01T14:12:30.663Z+00:00
Reply
  * Copy link


Add a comment
This answer is useful
This answer is not useful
Save this answer.
Loading when this answer was accepted…
Show activity on this post.
Although you cannot allow mixed content in the browser, you may be able to wrap the endpoint in a local endpoint that's served over HTTPS. Thus, HTTP/HTTPS mixing occurs backend-to-backend, which is allowed and should be safe enough. The wrapper endpoint could look like this in PHP:

```
<?php
    $endp = !isset($_GET['endp']) ? '' : $_GET['endp'];
    if ($endp === 'doit') {
        header('Content-Type: application/json');
        echo file_get_contents('http://problematic-server/doit');
    } else {
        echo '{"err":"unsupported-endpoint"}';
    }
// Don't close php tag to avoid unwanted whitespace in response.

```

In your case with video content, it may not be possible, though.
[Share](https://stackoverflow.com/a/76471143)
Share a link to this answer
Copy link[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/ "The current license for this post: CC BY-SA 4.0")
Short permalink to this answer
Follow 
Follow this answer to receive notifications
answered Jun 14, 2023 at 7:37
[digory doo](https://stackoverflow.com/users/digory-doo)
2,357
## 1 Comment
Add a comment
Freedom_Ben
[Freedom_Ben](https://stackoverflow.com/users/2062384/freedom-ben) [Jun 21, 2023 at 17:17](https://stackoverflow.com/questions/37043719/how-can-i-allow-mixed-contents-http-with-https-using-content-security-policy-m#comment134928295_76471143)
This is a clever solution, but does mean increased traffic on your server, and if you don't control `problematic-server` then you open up a number of new potential attack surfaces. Just something to be aware of before using this solution 
2023-06-21T17:17:25.54Z+00:00
Reply
  * Copy link


Start asking to get answers
Find the answer to your question by asking.
[Ask question](https://stackoverflow.com/questions/ask)
Explore related questions


See similar questions with these tags.
