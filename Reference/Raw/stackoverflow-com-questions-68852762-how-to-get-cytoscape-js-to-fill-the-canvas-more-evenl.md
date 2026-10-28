# [How to get cytoscape.js to fill the canvas more evenly?](https://stackoverflow.com/questions/68852762/how-to-get-cytoscape-js-to-fill-the-canvas-more-evenly)
Asked 5 years, 2 months ago
Modified [5 years, 2 months ago](https://stackoverflow.com/questions/68852762/how-to-get-cytoscape-js-to-fill-the-canvas-more-evenly?lastactivity "2021-08-19 18:10:32Z")
Viewed 314 times 
This question shows research effort; it is useful and clear
This question does not show any research effort; it is unclear or not useful
Save this question.
Show activity on this post.
Cytoscape.js + cose-bilkent creates nice graphs most of the time. However, sometimes the graph is indecipherable, because nodes are laid out horizontally:
Our app has a rectangular space for the graph and I would like to use more of the available space so that the nodes would be as big as possible. In other words, the example graph should use more also vertical space. Is there a way to achieve this?
My settings:

```
  name: "cose-bilkent",
  animate: false,
  idealEdgeLength: 50,
  quality: "proof",
  randomize: true,
  nodeDimensionsIncludeLabels: false,
  nodeRepulsion: 8000,
  edgeElasticity: 0.45,
  nestingFactor: 0.1,
  numIter: 100000,
  gravity: 0.25,
  tile: true

```



[Share](https://stackoverflow.com/q/68852762)
Share a link to this question
Copy link[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/ "The current license for this post: CC BY-SA 4.0")
Short permalink to this question
[Improve this question](https://stackoverflow.com/posts/68852762/edit)
Follow 
Follow this question to receive notifications
asked Aug 19, 2021 at 18:10
[tputkonen](https://stackoverflow.com/users/tputkonen)
5,807
9
  * try fcose [github.com/iVis-at-Bilkent/cytoscape.js-fcose](https://github.com/iVis-at-Bilkent/cytoscape.js-fcose) it also lets you put some constraints
canbax
– [canbax](https://stackoverflow.com/users/canbax "3,958 reputation")
2021-08-20 07:17:08 +00:00
[ Aug 20, 2021 at 7:17 ](https://stackoverflow.com/questions/68852762/how-to-get-cytoscape-js-to-fill-the-canvas-more-evenly#comment121692991_68852762)
  * @canbax Thanks you, I installed fcose - I looked into it a couple of years ago but it has been greatly updated since then. However, I couldn't figure out how to fix my issue with the constraints provided? Since I have no understanding what the generated graph will look like, I find it difficult to add constraints to individual nodes.
tputkonen
– [tputkonen](https://stackoverflow.com/users/tputkonen "5,807 reputation")
2021-08-21 05:02:16 +00:00
[ Aug 21, 2021 at 5:02 ](https://stackoverflow.com/questions/68852762/how-to-get-cytoscape-js-to-fill-the-canvas-more-evenly#comment121713836_68852762)
  * actually to use more available space, instead of constraints, you can use `packComponents` options. To use that option, you should also register [github.com/iVis-at-Bilkent/cytoscape.js-layout-utilities](https://github.com/iVis-at-Bilkent/cytoscape.js-layout-utilities)
canbax
– [canbax](https://stackoverflow.com/users/canbax "3,958 reputation")
2021-08-21 08:35:21 +00:00
[ Aug 21, 2021 at 8:35 ](https://stackoverflow.com/questions/68852762/how-to-get-cytoscape-js-to-fill-the-canvas-more-evenly#comment121715728_68852762)
  * @canbax I used it already with cose, by calling it separately. Great that it can now be used directly with fcose. However, I've understood it only helps to bring disconnected "islands" closer together? I just did a quick test and didn't see it fix my issue.
tputkonen
– [tputkonen](https://stackoverflow.com/users/tputkonen "5,807 reputation")
2021-08-21 12:54:19 +00:00
[ Aug 21, 2021 at 12:54 ](https://stackoverflow.com/questions/68852762/how-to-get-cytoscape-js-to-fill-the-canvas-more-evenly#comment121718705_68852762)
  * yes you are right the "islands" are called connected components in the literature. Do you "fit" the graph after layout? fcose has an option to fit the graph to the canvas.
canbax
– [canbax](https://stackoverflow.com/users/canbax "3,958 reputation")
2021-08-22 16:10:05 +00:00
[ Aug 22, 2021 at 16:10 ](https://stackoverflow.com/questions/68852762/how-to-get-cytoscape-js-to-fill-the-canvas-more-evenly#comment121736805_68852762)


[ Show **4** more comments ](https://stackoverflow.com/questions/68852762/how-to-get-cytoscape-js-to-fill-the-canvas-more-evenly "Expand to show all comments on this post")
Related questions
[ Cytoscape.js, graph is not displayed with correct settings ](https://stackoverflow.com/questions/28047826/cytoscape-js-graph-is-not-displayed-with-correct-settings?rq=4)
[ Padding between nodes in cytoscape.js ](https://stackoverflow.com/questions/28060239/padding-between-nodes-in-cytoscape-js?rq=4)
[ How to make the "breadthfirst" layout more compact ](https://stackoverflow.com/questions/29188971/how-to-make-the-breadthfirst-layout-more-compact?rq=4)
Related questions
[ Cytoscape.js, graph is not displayed with correct settings ](https://stackoverflow.com/questions/28047826/cytoscape-js-graph-is-not-displayed-with-correct-settings?rq=4)
[ Padding between nodes in cytoscape.js ](https://stackoverflow.com/questions/28060239/padding-between-nodes-in-cytoscape-js?rq=4)
[ How to make the "breadthfirst" layout more compact ](https://stackoverflow.com/questions/29188971/how-to-make-the-breadthfirst-layout-more-compact?rq=4)
[ cytoscape.js : blurry lables when zooming out ](https://stackoverflow.com/questions/33914859/cytoscape-js-blurry-lables-when-zooming-out?rq=4)
[ Cytoscape zoom alignment ](https://stackoverflow.com/questions/39060570/cytoscape-zoom-alignment?rq=4)
[ Make a graph with cytoscape without overlaps ](https://stackoverflow.com/questions/42788410/make-a-graph-with-cytoscape-without-overlaps?rq=4)
[ Make Cytoscape.js container just wide enough and just long enough ](https://stackoverflow.com/questions/49703616/make-cytoscape-js-container-just-wide-enough-and-just-long-enough?rq=4)
[ Cytoscape height canvas fixed to 0 ](https://stackoverflow.com/questions/51495143/cytoscape-height-canvas-fixed-to-0?rq=4)
[ How to create layers with cytoscape concentric layout ](https://stackoverflow.com/questions/59077386/how-to-create-layers-with-cytoscape-concentric-layout?rq=4)
[ Cystoscape is out of canvas border ](https://stackoverflow.com/questions/61204319/cystoscape-is-out-of-canvas-border?rq=4)
Load 7 more related questions  Show fewer related questions 
Sorted by:  [ Reset to default ](https://stackoverflow.com/questions/68852762/how-to-get-cytoscape-js-to-fill-the-canvas-more-evenly?answertab=scoredesc#tab-top)
Highest score (default)  Trending (recent votes count more)  Date modified (newest first)  Date created (oldest first) 
##  Know someone who can answer? Share a link to this [question](https://stackoverflow.com/questions/68852762/how-to-get-cytoscape-js-to-fill-the-canvas-more-evenly) via email, [Twitter](https://twitter.com/share?url=https%3a%2f%2fstackoverflow.com%2fq%2f68852762%3fstw%3d2), or [Facebook](https://www.facebook.com/sharer.php?u=https%3a%2f%2fstackoverflow.com%2fq%2f68852762%3fsfb%3d2). 
Start asking to get answers
Find the answer to your question by asking.
[Ask question](https://stackoverflow.com/questions/ask)
Explore related questions


See similar questions with these tags.
## We care about your privacy
We and our 265 partners store and access personal data, like browsing data or unique identifiers, on your device. Selecting Accept all enables tracking technologies to support the purposes shown under we and our partners process data to provide. Selecting Necessary cookies only or withdrawing your consent will disable them. If trackers are disabled, some content and ads you see may not be as relevant to you. You can resurface this menu to change your choices or withdraw consent at any time by clicking the Customize settings link on the bottom of the webpage. Your choices will have effect within our Website. For more details, refer to our Privacy Policy.[Cookie policy](https://policies.stackoverflow.co/stack-overflow/cookie-policy/)
### We and our partners perform the following based on your settings:
Use precise geolocation data. Actively scan device characteristics for identification. Understand audiences through statistics or combinations of data from different sources. Store and/or access information on a device. Develop and improve services. Create profiles to personalise content. Use limited data to select advertising. Measure content performance. Measure advertising performance. Use limited data to select content. Create profiles for personalised advertising. Use profiles to select personalised advertising. Use profiles to select personalised content. [ List of partners (vendors) ](https://stackoverflow.com/questions/68852762/how-to-get-cytoscape-js-to-fill-the-canvas-more-evenly)
#### Declaration
  * Use precise geolocation data
  * Actively scan device characteristics for identification
  * Understand audiences through statistics or combinations of data from different sources
  * Store and/or access information on a device
  * Create profiles to personalise content
  * Develop and improve services
  * Use limited data to select advertising
  * Measure content performance
  * Use limited data to select content
  * Measure advertising performance
  * Create profiles for personalised advertising
  * Use profiles to select personalised advertising
  * Use profiles to select personalised content
  * Personalised advertising and content, advertising and content measurement, and audience research


Accept all Necessary cookies only
Customize settings
