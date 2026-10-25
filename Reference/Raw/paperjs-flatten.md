# Smoothing, Simplifying & Flattening
Paper.js offers two different ways to smooth a path. 
smooths a path by changing its segment handles without adding or removing segment points. 
`[path.simplify()](https://paperjs.org/reference/path#simplify)` smooths a path by analyzing its array and replacing it with a more optimal set of segments, reducing memory usage and speeding up drawing. 
Smoothing Paths
Paper.js allows you to automatically smooth paths using the function. This function calculates the optimal values for the handles of the path's segment points to create curves that flow smoothly through them. The segments are not moved and the current handle settings of the path's segments are ignored. 
In the following example, we create a rectangle shaped path, create a copy of it and smooth the copy. As you can see, only the handle positions are changed. The segment points remain unchanged. 

```
var path = new Path({
```

```
segments: [[30, 75], [30, 25], [80, 25], [80, 75]],
```

```
strokeColor: 'black',
```

```
closed: true
```

```
});
```

```
// Select the path, so we can see its handles:
```

```
path.fullySelected = true;
```

```
// Create a copy of the path and move it 100pt to the right:
```

```
var copy = path.clone();
```

```
copy.fullySelected = true;
```

```
copy.position.x += 100;
```

```
// Smooth the segments of the copy:
```

```
copy.smooth();
```

Click and drag in the view below to draw a line, when you release the mouse, the path is smoothed using : 
Simplifying Paths
`[path.simplify()](https://paperjs.org/reference/path#simplify)` smooths a path by simplifying it. The path.segments array is analyzed and replaced by a more optimal set of segments, reducing memory usage and speeding up drawing. 
The `[path.simplify()](https://paperjs.org/reference/path#simplify)` function has an optional `tolerance` parameter, which specifies the maximum distance the simplifying algorithm is allowed to deviate from the original path. This value is set to `2.5` by default. Setting it to a lower value, produces a more correct path but with more segment points. Setting it to a higher value leads to a smoother curve and less segment points, but the shape of the path will be more different than the original. 
Flattening Paths
`[path.flatten(error)](https://paperjs.org/reference/path#flatten-error)` converts the curves in a path to straight lines with a maximum specified error. The resulting lines are guaranteed to not be further away than the amount specified by the `error` parameter. 
In the following example, we create a circle shaped path and straighten it using `[path.flatten(20)](https://paperjs.org/reference/path#flatten-error)`: 

```
// Create a circle shaped path at { x: 80, y: 50 }
```

```
// with a radius of 35:
```

```
var path = new Path.Circle({
```

```
center: [80, 50],
```

```
radius: 35
```

```
});
```

```
// Select the path, so we can inspect its segments:
```

```
path.selected = true;
```

```
// Create a copy of the path and move it by 150 points:
```

```
var copy = path.clone();
```

```
copy.position.x += 150;
```

```
// Flatten the copied path, with a maximum error of 4 points:
```

```
copy.flatten(4);
```

