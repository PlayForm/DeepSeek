Back to top
Note
[Go to the end](https://scikit-image.org/docs/stable/auto_examples/edges/plot_skeleton.html#sphx-glr-download-auto-examples-edges-plot-skeleton-py) to download the full example code or to run this example in your browser via Binder.
# Skeletonize[#](https://scikit-image.org/docs/stable/auto_examples/edges/plot_skeleton.html#skeletonize "Link to this heading")
Skeletonization reduces binary objects to 1 pixel wide representations. This can be useful for feature extraction, and/or representing an object’s topology.
`skeletonize` works by making successive passes of the image. On each pass, border pixels are identified and removed on the condition that they do not break the connectivity of the corresponding object.

```
fromskimage.morphologyimport [skeletonize](https://scikit-image.org/docs/stable/api/skimage.morphology.html#skimage.morphology.skeletonize "skimage.morphology.skeletonize")
fromskimageimport data
importmatplotlib.pyplotasplt
fromskimage.utilimport [invert](https://scikit-image.org/docs/stable/api/skimage.util.html#skimage.util.invert "skimage.util.invert")

# Invert the horse image
[image](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray "numpy.ndarray") = [invert](https://scikit-image.org/docs/stable/api/skimage.util.html#skimage.util.invert "skimage.util.invert")([data.horse](https://scikit-image.org/docs/stable/api/skimage.data.html#skimage.data.horse "skimage.data.horse")())

# perform skeletonization
[skeleton](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray "numpy.ndarray") = [skeletonize](https://scikit-image.org/docs/stable/api/skimage.morphology.html#skimage.morphology.skeletonize "skimage.morphology.skeletonize")([image](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray "numpy.ndarray"))

# display results
[fig](https://matplotlib.org/stable/api/_as_gen/matplotlib.figure.Figure.html#matplotlib.figure.Figure "matplotlib.figure.Figure"), [axes](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray "numpy.ndarray") = [plt.subplots](https://matplotlib.org/stable/api/_as_gen/matplotlib.pyplot.subplots.html#matplotlib.pyplot.subplots "matplotlib.pyplot.subplots")(nrows=1, ncols=2, figsize=(8, 4), sharex=True, sharey=True)

 = [axes](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray "numpy.ndarray").ravel()

[0].imshow([image](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray "numpy.ndarray"), cmap=[plt.cm.gray](https://matplotlib.org/stable/api/_as_gen/matplotlib.colors.LinearSegmentedColormap.html#matplotlib.colors.LinearSegmentedColormap "matplotlib.colors.LinearSegmentedColormap"))
[0].axis('off')
[0].set_title('original', fontsize=20)

[1].imshow([skeleton](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray "numpy.ndarray"), cmap=[plt.cm.gray](https://matplotlib.org/stable/api/_as_gen/matplotlib.colors.LinearSegmentedColormap.html#matplotlib.colors.LinearSegmentedColormap "matplotlib.colors.LinearSegmentedColormap"))
[1].axis('off')
[1].set_title('skeleton', fontsize=20)

[fig.tight_layout](https://matplotlib.org/stable/api/_as_gen/matplotlib.figure.Figure.tight_layout.html#matplotlib.figure.Figure.tight_layout "matplotlib.figure.Figure.tight_layout")()
[plt.show](https://matplotlib.org/stable/api/_as_gen/matplotlib.pyplot.show.html#matplotlib.pyplot.show "matplotlib.pyplot.show")()

```
Copy to clipboard
**Zhang’s method vs Lee’s method**
`skeletonize` [[Zha84]](https://scikit-image.org/docs/stable/auto_examples/edges/plot_skeleton.html#zha84) works by making successive passes of the image, removing pixels on object borders. This continues until no more pixels can be removed. The image is correlated with a mask that assigns each pixel a number in the range [0…255] corresponding to each possible pattern of its 8 neighboring pixels. A look up table is then used to assign the pixels a value of 0, 1, 2 or 3, which are selectively removed during the iterations.
`skeletonize(..., method='lee')` [[Lee94]](https://scikit-image.org/docs/stable/auto_examples/edges/plot_skeleton.html#lee94) uses an octree data structure to examine a 3x3x3 neighborhood of a pixel. The algorithm proceeds by iteratively sweeping over the image, and removing pixels at each iteration until the image stops changing. Each iteration consists of two steps: first, a list of candidates for removal is assembled; then pixels from this list are rechecked sequentially, to better preserve connectivity of the image.
Note that Lee’s method [[Lee94]](https://scikit-image.org/docs/stable/auto_examples/edges/plot_skeleton.html#lee94) is designed to be used on 3-D images, and is selected automatically for those. For illustrative purposes, we apply this algorithm to a 2-D image.
A fast parallel algorithm for thinning digital patterns, T. Y. Zhang and C. Y. Suen, Communications of the ACM, March 1984, Volume 27, Number 3.
[Lee94]
T.-C. Lee, R.L. Kashyap and C.-N. Chu, Building skeleton models via 3-D medial surface/axis thinning algorithms. Computer Vision, Graphics, and Image Processing, 56(6):462-478, 1994.

```
importmatplotlib.pyplotasplt
fromskimage.morphologyimport [skeletonize](https://scikit-image.org/docs/stable/api/skimage.morphology.html#skimage.morphology.skeletonize "skimage.morphology.skeletonize")

[blobs](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray "numpy.ndarray") = [data.binary_blobs](https://scikit-image.org/docs/stable/api/skimage.data.html#skimage.data.binary_blobs "skimage.data.binary_blobs")(200, blob_size_fraction=0.2, volume_fraction=0.35, rng=1)

[skeleton](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray "numpy.ndarray") = [skeletonize](https://scikit-image.org/docs/stable/api/skimage.morphology.html#skimage.morphology.skeletonize "skimage.morphology.skeletonize")([blobs](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray "numpy.ndarray"))
[skeleton_lee](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray "numpy.ndarray") = [skeletonize](https://scikit-image.org/docs/stable/api/skimage.morphology.html#skimage.morphology.skeletonize "skimage.morphology.skeletonize")([blobs](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray "numpy.ndarray"), method='lee')

[fig](https://matplotlib.org/stable/api/_as_gen/matplotlib.figure.Figure.html#matplotlib.figure.Figure "matplotlib.figure.Figure"), [axes](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray "numpy.ndarray") = [plt.subplots](https://matplotlib.org/stable/api/_as_gen/matplotlib.pyplot.subplots.html#matplotlib.pyplot.subplots "matplotlib.pyplot.subplots")(1, 3, figsize=(8, 4), sharex=True, sharey=True)
 = [axes](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray "numpy.ndarray").ravel()

[0].imshow([blobs](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray "numpy.ndarray"), cmap=[plt.cm.gray](https://matplotlib.org/stable/api/_as_gen/matplotlib.colors.LinearSegmentedColormap.html#matplotlib.colors.LinearSegmentedColormap "matplotlib.colors.LinearSegmentedColormap"))
[0].set_title('original')
[0].axis('off')

[1].imshow([skeleton](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray "numpy.ndarray"), cmap=[plt.cm.gray](https://matplotlib.org/stable/api/_as_gen/matplotlib.colors.LinearSegmentedColormap.html#matplotlib.colors.LinearSegmentedColormap "matplotlib.colors.LinearSegmentedColormap"))
[1].set_title('skeletonize')
[1].axis('off')

[2].imshow([skeleton_lee](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray "numpy.ndarray"), cmap=[plt.cm.gray](https://matplotlib.org/stable/api/_as_gen/matplotlib.colors.LinearSegmentedColormap.html#matplotlib.colors.LinearSegmentedColormap "matplotlib.colors.LinearSegmentedColormap"))
[2].set_title('skeletonize (Lee 94)')
[2].axis('off')

[fig.tight_layout](https://matplotlib.org/stable/api/_as_gen/matplotlib.figure.Figure.tight_layout.html#matplotlib.figure.Figure.tight_layout "matplotlib.figure.Figure.tight_layout")()
[plt.show](https://matplotlib.org/stable/api/_as_gen/matplotlib.pyplot.show.html#matplotlib.pyplot.show "matplotlib.pyplot.show")()

```
Copy to clipboard
**Medial axis skeletonization**
The medial axis of an object is the set of all points having more than one closest point on the object’s boundary. It is often called the _topological skeleton_ , because it is a 1-pixel wide skeleton of the object, with the same connectivity as the original object.
Here, we use the medial axis transform to compute the width of the foreground objects. As the function `medial_axis` returns the distance transform in addition to the medial axis (with the keyword argument `return_distance=True`), it is possible to compute the distance to the background for all points of the medial axis with this function. This gives an estimate of the local width of the objects.
For a skeleton with fewer branches, `skeletonize` should be preferred.

```
fromskimage.morphologyimport [medial_axis](https://scikit-image.org/docs/stable/api/skimage.morphology.html#skimage.morphology.medial_axis "skimage.morphology.medial_axis"), [skeletonize](https://scikit-image.org/docs/stable/api/skimage.morphology.html#skimage.morphology.skeletonize "skimage.morphology.skeletonize")

# Generate the data
[blobs](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray "numpy.ndarray") = [data.binary_blobs](https://scikit-image.org/docs/stable/api/skimage.data.html#skimage.data.binary_blobs "skimage.data.binary_blobs")(200, blob_size_fraction=0.2, volume_fraction=0.35, rng=1)

# Compute the medial axis (skeleton) and the distance transform
[skel](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray "numpy.ndarray"), [distance](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray "numpy.ndarray") = [medial_axis](https://scikit-image.org/docs/stable/api/skimage.morphology.html#skimage.morphology.medial_axis "skimage.morphology.medial_axis")([blobs](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray "numpy.ndarray"), return_distance=True)

# Compare with other skeletonization algorithms
[skeleton](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray "numpy.ndarray") = [skeletonize](https://scikit-image.org/docs/stable/api/skimage.morphology.html#skimage.morphology.skeletonize "skimage.morphology.skeletonize")([blobs](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray "numpy.ndarray"))
[skeleton_lee](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray "numpy.ndarray") = [skeletonize](https://scikit-image.org/docs/stable/api/skimage.morphology.html#skimage.morphology.skeletonize "skimage.morphology.skeletonize")([blobs](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray "numpy.ndarray"), method='lee')

# Distance to the background for pixels of the skeleton
[dist_on_skel](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray "numpy.ndarray") = [distance](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray "numpy.ndarray") * [skel](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray "numpy.ndarray")

[fig](https://matplotlib.org/stable/api/_as_gen/matplotlib.figure.Figure.html#matplotlib.figure.Figure "matplotlib.figure.Figure"), [axes](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray "numpy.ndarray") = [plt.subplots](https://matplotlib.org/stable/api/_as_gen/matplotlib.pyplot.subplots.html#matplotlib.pyplot.subplots "matplotlib.pyplot.subplots")(2, 2, figsize=(8, 8), sharex=True, sharey=True)
 = [axes](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray "numpy.ndarray").ravel()

[0].imshow([blobs](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray "numpy.ndarray"), cmap=[plt.cm.gray](https://matplotlib.org/stable/api/_as_gen/matplotlib.colors.LinearSegmentedColormap.html#matplotlib.colors.LinearSegmentedColormap "matplotlib.colors.LinearSegmentedColormap"))
[0].set_title('original')
[0].axis('off')

[1].imshow([dist_on_skel](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray "numpy.ndarray"), cmap='magma')
[1].contour([blobs](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray "numpy.ndarray"), [0.5], colors='w')
[1].set_title('medial_axis')
[1].axis('off')

[2].imshow([skeleton](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray "numpy.ndarray"), cmap=[plt.cm.gray](https://matplotlib.org/stable/api/_as_gen/matplotlib.colors.LinearSegmentedColormap.html#matplotlib.colors.LinearSegmentedColormap "matplotlib.colors.LinearSegmentedColormap"))
[2].set_title('skeletonize')
[2].axis('off')

[3].imshow([skeleton_lee](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray "numpy.ndarray"), cmap=[plt.cm.gray](https://matplotlib.org/stable/api/_as_gen/matplotlib.colors.LinearSegmentedColormap.html#matplotlib.colors.LinearSegmentedColormap "matplotlib.colors.LinearSegmentedColormap"))
[3].set_title("skeletonize (Lee 94)")
[3].axis('off')

[fig.tight_layout](https://matplotlib.org/stable/api/_as_gen/matplotlib.figure.Figure.tight_layout.html#matplotlib.figure.Figure.tight_layout "matplotlib.figure.Figure.tight_layout")()
[plt.show](https://matplotlib.org/stable/api/_as_gen/matplotlib.pyplot.show.html#matplotlib.pyplot.show "matplotlib.pyplot.show")()

```
Copy to clipboard
**Morphological thinning**
Morphological thinning, implemented in the `thin` function, works on the same principle as `skeletonize`: remove pixels from the borders at each iteration until none can be removed without altering the connectivity. The different rules of removal can speed up skeletonization and result in different final skeletons.
The `thin` function also takes an optional `max_num_iter` keyword argument to limit the number of thinning iterations, and thus produce a relatively thicker skeleton.

```
fromskimage.morphologyimport [skeletonize](https://scikit-image.org/docs/stable/api/skimage.morphology.html#skimage.morphology.skeletonize "skimage.morphology.skeletonize"), [thin](https://scikit-image.org/docs/stable/api/skimage.morphology.html#skimage.morphology.thin "skimage.morphology.thin")

[skeleton](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray "numpy.ndarray") = [skeletonize](https://scikit-image.org/docs/stable/api/skimage.morphology.html#skimage.morphology.skeletonize "skimage.morphology.skeletonize")([image](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray "numpy.ndarray"))
[thinned](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray "numpy.ndarray") = [thin](https://scikit-image.org/docs/stable/api/skimage.morphology.html#skimage.morphology.thin "skimage.morphology.thin")([image](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray "numpy.ndarray"))
[thinned_partial](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray "numpy.ndarray") = [thin](https://scikit-image.org/docs/stable/api/skimage.morphology.html#skimage.morphology.thin "skimage.morphology.thin")([image](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray "numpy.ndarray"), max_num_iter=25)

[fig](https://matplotlib.org/stable/api/_as_gen/matplotlib.figure.Figure.html#matplotlib.figure.Figure "matplotlib.figure.Figure"), [axes](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray "numpy.ndarray") = [plt.subplots](https://matplotlib.org/stable/api/_as_gen/matplotlib.pyplot.subplots.html#matplotlib.pyplot.subplots "matplotlib.pyplot.subplots")(2, 2, figsize=(8, 8), sharex=True, sharey=True)
 = [axes](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray "numpy.ndarray").ravel()

[0].imshow([image](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray "numpy.ndarray"), cmap=[plt.cm.gray](https://matplotlib.org/stable/api/_as_gen/matplotlib.colors.LinearSegmentedColormap.html#matplotlib.colors.LinearSegmentedColormap "matplotlib.colors.LinearSegmentedColormap"))
[0].set_title('original')
[0].axis('off')

[1].imshow([skeleton](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray "numpy.ndarray"), cmap=[plt.cm.gray](https://matplotlib.org/stable/api/_as_gen/matplotlib.colors.LinearSegmentedColormap.html#matplotlib.colors.LinearSegmentedColormap "matplotlib.colors.LinearSegmentedColormap"))
[1].set_title('skeleton')
[1].axis('off')

[2].imshow([thinned](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray "numpy.ndarray"), cmap=[plt.cm.gray](https://matplotlib.org/stable/api/_as_gen/matplotlib.colors.LinearSegmentedColormap.html#matplotlib.colors.LinearSegmentedColormap "matplotlib.colors.LinearSegmentedColormap"))
[2].set_title('thinned')
[2].axis('off')

[3].imshow([thinned_partial](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray "numpy.ndarray"), cmap=[plt.cm.gray](https://matplotlib.org/stable/api/_as_gen/matplotlib.colors.LinearSegmentedColormap.html#matplotlib.colors.LinearSegmentedColormap "matplotlib.colors.LinearSegmentedColormap"))
[3].set_title('partially thinned')
[3].axis('off')

[fig.tight_layout](https://matplotlib.org/stable/api/_as_gen/matplotlib.figure.Figure.tight_layout.html#matplotlib.figure.Figure.tight_layout "matplotlib.figure.Figure.tight_layout")()
[plt.show](https://matplotlib.org/stable/api/_as_gen/matplotlib.pyplot.show.html#matplotlib.pyplot.show "matplotlib.pyplot.show")()

```
Copy to clipboard
**Total running time of the script:** (0 minutes 1.397 seconds)
[`Download Jupyter notebook: plot_skeleton.ipynb`](https://scikit-image.org/docs/stable/_downloads/2763f34da4b712ae70cd9a352f2399ea/plot_skeleton.ipynb)
[`Download Python source code: plot_skeleton.py`](https://scikit-image.org/docs/stable/_downloads/acc64afc58dd7a1f46c04f30a38229d9/plot_skeleton.py)
[`Download zipped: plot_skeleton.zip`](https://scikit-image.org/docs/stable/_downloads/deb7b62e66096d53b9a5c78433ffae6b/plot_skeleton.zip)
[Gallery generated by Sphinx-Gallery](https://sphinx-gallery.github.io)
### This Page


