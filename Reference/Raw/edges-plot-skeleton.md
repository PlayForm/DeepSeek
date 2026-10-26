Note

[Go to the end](#sphx-glr-download-auto-examples-edges-plot-skeleton-py) to download the full example code or to run this example in your browser via Binder.

# Skeletonize[\#](#skeletonize)

Skeletonization reduces binary objects to 1 pixel wide representations. This can be useful for feature extraction, and/or representing an object’s topology.

`skeletonize` works by making successive passes of the image. On each pass, border pixels are identified and removed on the condition that they do not break the connectivity of the corresponding object.

from skimage.morphology import [skeletonize](../../api/skimage.morphology.html#skimage.morphology.skeletonize)\
from skimage import data\
import matplotlib.pyplot as plt\
from skimage.util import [invert](../../api/skimage.util.html#skimage.util.invert)\
\
\# Invert the horse image\
[image](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray) = [invert](../../api/skimage.util.html#skimage.util.invert)([data.horse](../../api/skimage.data.html#skimage.data.horse)())\
\
\# perform skeletonization\
[skeleton](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray) = [skeletonize](../../api/skimage.morphology.html#skimage.morphology.skeletonize)([image](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray))\
\
\# display results\
[fig](https://matplotlib.org/stable/api/_as_gen/matplotlib.figure.Figure.html#matplotlib.figure.Figure), [axes](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray) = [plt.subplots](https://matplotlib.org/stable/api/_as_gen/matplotlib.pyplot.subplots.html#matplotlib.pyplot.subplots)(nrows=1, ncols=2, figsize=(8, 4), sharex=True, sharey=True)\
\
[ax](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray) = [axes](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray).ravel()\
\
[ax](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray)\[0\].imshow([image](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray), cmap=[plt.cm.gray](https://matplotlib.org/stable/api/_as_gen/matplotlib.colors.LinearSegmentedColormap.html#matplotlib.colors.LinearSegmentedColormap))\
[ax](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray)\[0\].axis('off')\
[ax](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray)\[0\].set_title('original', fontsize=20)\
\
[ax](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray)\[1\].imshow([skeleton](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray), cmap=[plt.cm.gray](https://matplotlib.org/stable/api/_as_gen/matplotlib.colors.LinearSegmentedColormap.html#matplotlib.colors.LinearSegmentedColormap))\
[ax](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray)\[1\].axis('off')\
[ax](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray)\[1\].set_title('skeleton', fontsize=20)\
\
[fig.tight_layout](https://matplotlib.org/stable/api/_as_gen/matplotlib.figure.Figure.tight_layout.html#matplotlib.figure.Figure.tight_layout)()\
[plt.show](https://matplotlib.org/stable/api/_as_gen/matplotlib.pyplot.show.html#matplotlib.pyplot.show)()\

![original, skeleton](../../_images/sphx_glr_plot_skeleton_001.png)

**Zhang’s method vs Lee’s method**

`skeletonize` [\[Zha84\]](#zha84) works by making successive passes of the image, removing pixels on object borders. This continues until no more pixels can be removed. The image is correlated with a mask that assigns each pixel a number in the range \[0…255\] corresponding to each possible pattern of its 8 neighboring pixels. A look up table is then used to assign the pixels a value of 0, 1, 2 or 3, which are selectively removed during the iterations.

`skeletonize(..., method='lee')` [\[Lee94\]](#lee94) uses an octree data structure to examine a 3x3x3 neighborhood of a pixel. The algorithm proceeds by iteratively sweeping over the image, and removing pixels at each iteration until the image stops changing. Each iteration consists of two steps: first, a list of candidates for removal is assembled; then pixels from this list are rechecked sequentially, to better preserve connectivity of the image.

Note that Lee’s method [\[Lee94\]](#lee94) is designed to be used on 3-D images, and is selected automatically for those. For illustrative purposes, we apply this algorithm to a 2-D image.

\[[Zha84](#id1)\]

A fast parallel algorithm for thinning digital patterns, T. Y. Zhang and C. Y. Suen, Communications of the ACM, March 1984, Volume 27, Number 3.

\[Lee94\] ([1](#id2),[2](#id3))

T.-C. Lee, R.L. Kashyap and C.-N. Chu, Building skeleton models via 3-D medial surface/axis thinning algorithms. Computer Vision, Graphics, and Image Processing, 56(6):462-478, 1994.

import matplotlib.pyplot as plt\
from skimage.morphology import [skeletonize](../../api/skimage.morphology.html#skimage.morphology.skeletonize)\
\
[blobs](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray) = [data.binary_blobs](../../api/skimage.data.html#skimage.data.binary_blobs)(200, blob_size_fraction=0.2, volume_fraction=0.35, rng=1)\
\
[skeleton](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray) = [skeletonize](../../api/skimage.morphology.html#skimage.morphology.skeletonize)([blobs](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray))\
[skeleton_lee](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray) = [skeletonize](../../api/skimage.morphology.html#skimage.morphology.skeletonize)([blobs](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray), method='lee')\
\
[fig](https://matplotlib.org/stable/api/_as_gen/matplotlib.figure.Figure.html#matplotlib.figure.Figure), [axes](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray) = [plt.subplots](https://matplotlib.org/stable/api/_as_gen/matplotlib.pyplot.subplots.html#matplotlib.pyplot.subplots)(1, 3, figsize=(8, 4), sharex=True, sharey=True)\
[ax](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray) = [axes](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray).ravel()\
\
[ax](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray)\[0\].imshow([blobs](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray), cmap=[plt.cm.gray](https://matplotlib.org/stable/api/_as_gen/matplotlib.colors.LinearSegmentedColormap.html#matplotlib.colors.LinearSegmentedColormap))\
[ax](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray)\[0\].set_title('original')\
[ax](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray)\[0\].axis('off')\
\
[ax](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray)\[1\].imshow([skeleton](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray), cmap=[plt.cm.gray](https://matplotlib.org/stable/api/_as_gen/matplotlib.colors.LinearSegmentedColormap.html#matplotlib.colors.LinearSegmentedColormap))\
[ax](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray)\[1\].set_title('skeletonize')\
[ax](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray)\[1\].axis('off')\
\
[ax](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray)\[2\].imshow([skeleton_lee](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray), cmap=[plt.cm.gray](https://matplotlib.org/stable/api/_as_gen/matplotlib.colors.LinearSegmentedColormap.html#matplotlib.colors.LinearSegmentedColormap))\
[ax](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray)\[2\].set_title('skeletonize (Lee 94)')\
[ax](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray)\[2\].axis('off')\
\
[fig.tight_layout](https://matplotlib.org/stable/api/_as_gen/matplotlib.figure.Figure.tight_layout.html#matplotlib.figure.Figure.tight_layout)()\
[plt.show](https://matplotlib.org/stable/api/_as_gen/matplotlib.pyplot.show.html#matplotlib.pyplot.show)()\

![original, skeletonize, skeletonize (Lee 94)](../../_images/sphx_glr_plot_skeleton_002.png)

**Medial axis skeletonization**

The medial axis of an object is the set of all points having more than one closest point on the object’s boundary. It is often called the *topological skeleton*, because it is a 1-pixel wide skeleton of the object, with the same connectivity as the original object.

Here, we use the medial axis transform to compute the width of the foreground objects. As the function `medial_axis` returns the distance transform in addition to the medial axis (with the keyword argument `return_distance=True`), it is possible to compute the distance to the background for all points of the medial axis with this function. This gives an estimate of the local width of the objects.

For a skeleton with fewer branches, `skeletonize` should be preferred.

from skimage.morphology import [medial_axis](../../api/skimage.morphology.html#skimage.morphology.medial_axis), [skeletonize](../../api/skimage.morphology.html#skimage.morphology.skeletonize)\
\
\# Generate the data\
[blobs](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray) = [data.binary_blobs](../../api/skimage.data.html#skimage.data.binary_blobs)(200, blob_size_fraction=0.2, volume_fraction=0.35, rng=1)\
\
\# Compute the medial axis (skeleton) and the distance transform\
[skel](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray), [distance](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray) = [medial_axis](../../api/skimage.morphology.html#skimage.morphology.medial_axis)([blobs](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray), return_distance=True)\
\
\# Compare with other skeletonization algorithms\
[skeleton](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray) = [skeletonize](../../api/skimage.morphology.html#skimage.morphology.skeletonize)([blobs](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray))\
[skeleton_lee](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray) = [skeletonize](../../api/skimage.morphology.html#skimage.morphology.skeletonize)([blobs](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray), method='lee')\
\
\# Distance to the background for pixels of the skeleton\
[dist_on_skel](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray) = [distance](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray) \* [skel](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray)\
\
[fig](https://matplotlib.org/stable/api/_as_gen/matplotlib.figure.Figure.html#matplotlib.figure.Figure), [axes](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray) = [plt.subplots](https://matplotlib.org/stable/api/_as_gen/matplotlib.pyplot.subplots.html#matplotlib.pyplot.subplots)(2, 2, figsize=(8, 8), sharex=True, sharey=True)\
[ax](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray) = [axes](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray).ravel()\
\
[ax](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray)\[0\].imshow([blobs](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray), cmap=[plt.cm.gray](https://matplotlib.org/stable/api/_as_gen/matplotlib.colors.LinearSegmentedColormap.html#matplotlib.colors.LinearSegmentedColormap))\
[ax](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray)\[0\].set_title('original')\
[ax](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray)\[0\].axis('off')\
\
[ax](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray)\[1\].imshow([dist_on_skel](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray), cmap='magma')\
[ax](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray)\[1\].contour([blobs](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray), \[0.5\], colors='w')\
[ax](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray)\[1\].set_title('medial_axis')\
[ax](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray)\[1\].axis('off')\
\
[ax](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray)\[2\].imshow([skeleton](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray), cmap=[plt.cm.gray](https://matplotlib.org/stable/api/_as_gen/matplotlib.colors.LinearSegmentedColormap.html#matplotlib.colors.LinearSegmentedColormap))\
[ax](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray)\[2\].set_title('skeletonize')\
[ax](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray)\[2\].axis('off')\
\
[ax](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray)\[3\].imshow([skeleton_lee](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray), cmap=[plt.cm.gray](https://matplotlib.org/stable/api/_as_gen/matplotlib.colors.LinearSegmentedColormap.html#matplotlib.colors.LinearSegmentedColormap))\
[ax](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray)\[3\].set_title("skeletonize (Lee 94)")\
[ax](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray)\[3\].axis('off')\
\
[fig.tight_layout](https://matplotlib.org/stable/api/_as_gen/matplotlib.figure.Figure.tight_layout.html#matplotlib.figure.Figure.tight_layout)()\
[plt.show](https://matplotlib.org/stable/api/_as_gen/matplotlib.pyplot.show.html#matplotlib.pyplot.show)()\

![original, medial_axis, skeletonize, skeletonize (Lee 94)](../../_images/sphx_glr_plot_skeleton_003.png)

**Morphological thinning**

Morphological thinning, implemented in the `thin` function, works on the same principle as `skeletonize`: remove pixels from the borders at each iteration until none can be removed without altering the connectivity. The different rules of removal can speed up skeletonization and result in different final skeletons.

The `thin` function also takes an optional `max_num_iter` keyword argument to limit the number of thinning iterations, and thus produce a relatively thicker skeleton.

from skimage.morphology import [skeletonize](../../api/skimage.morphology.html#skimage.morphology.skeletonize), [thin](../../api/skimage.morphology.html#skimage.morphology.thin)\
\
[skeleton](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray) = [skeletonize](../../api/skimage.morphology.html#skimage.morphology.skeletonize)([image](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray))\
[thinned](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray) = [thin](../../api/skimage.morphology.html#skimage.morphology.thin)([image](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray))\
[thinned_partial](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray) = [thin](../../api/skimage.morphology.html#skimage.morphology.thin)([image](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray), max_num_iter=25)\
\
[fig](https://matplotlib.org/stable/api/_as_gen/matplotlib.figure.Figure.html#matplotlib.figure.Figure), [axes](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray) = [plt.subplots](https://matplotlib.org/stable/api/_as_gen/matplotlib.pyplot.subplots.html#matplotlib.pyplot.subplots)(2, 2, figsize=(8, 8), sharex=True, sharey=True)\
[ax](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray) = [axes](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray).ravel()\
\
[ax](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray)\[0\].imshow([image](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray), cmap=[plt.cm.gray](https://matplotlib.org/stable/api/_as_gen/matplotlib.colors.LinearSegmentedColormap.html#matplotlib.colors.LinearSegmentedColormap))\
[ax](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray)\[0\].set_title('original')\
[ax](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray)\[0\].axis('off')\
\
[ax](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray)\[1\].imshow([skeleton](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray), cmap=[plt.cm.gray](https://matplotlib.org/stable/api/_as_gen/matplotlib.colors.LinearSegmentedColormap.html#matplotlib.colors.LinearSegmentedColormap))\
[ax](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray)\[1\].set_title('skeleton')\
[ax](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray)\[1\].axis('off')\
\
[ax](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray)\[2\].imshow([thinned](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray), cmap=[plt.cm.gray](https://matplotlib.org/stable/api/_as_gen/matplotlib.colors.LinearSegmentedColormap.html#matplotlib.colors.LinearSegmentedColormap))\
[ax](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray)\[2\].set_title('thinned')\
[ax](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray)\[2\].axis('off')\
\
[ax](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray)\[3\].imshow([thinned_partial](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray), cmap=[plt.cm.gray](https://matplotlib.org/stable/api/_as_gen/matplotlib.colors.LinearSegmentedColormap.html#matplotlib.colors.LinearSegmentedColormap))\
[ax](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray)\[3\].set_title('partially thinned')\
[ax](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray)\[3\].axis('off')\
\
[fig.tight_layout](https://matplotlib.org/stable/api/_as_gen/matplotlib.figure.Figure.tight_layout.html#matplotlib.figure.Figure.tight_layout)()\
[plt.show](https://matplotlib.org/stable/api/_as_gen/matplotlib.pyplot.show.html#matplotlib.pyplot.show)()\

![original, skeleton, thinned, partially thinned](../../_images/sphx_glr_plot_skeleton_004.png)

**Total running time of the script:** (0 minutes 1.397 seconds)

[![Launch binder](../../_images/binder_badge_logo.svg)](https://mybinder.org/v2/gh/scikit-image/scikit-image/v0.26.0?filepath=notebooks/auto_examples/edges/plot_skeleton.ipynb)

[`Download Jupyter notebook: plot_skeleton.ipynb`](../../_downloads/2763f34da4b712ae70cd9a352f2399ea/plot_skeleton.ipynb)

[`Download Python source code: plot_skeleton.py`](../../_downloads/acc64afc58dd7a1f46c04f30a38229d9/plot_skeleton.py)

[`Download zipped: plot_skeleton.zip`](../../_downloads/deb7b62e66096d53b9a5c78433ffae6b/plot_skeleton.zip)

[Gallery generated by Sphinx-Gallery](https://sphinx-gallery.github.io)

### This Page

- [Show Source](../../_sources/auto_examples/edges/plot_skeleton.rst.txt)

<!--
## Source links

- [../../index.html](../../index.html)
- [Examples](../index.html)
- [Edges and lines](index.html)
- [skeletonize](../../api/skimage.morphology.html#skimage.morphology.skeletonize)
- [invert](../../api/skimage.util.html#skimage.util.invert)
- [image](https://numpy.org/doc/stable/reference/generated/numpy.ndarray.html#numpy.ndarray)
- [data . horse](../../api/skimage.data.html#skimage.data.horse)
- [fig](https://matplotlib.org/stable/api/_as_gen/matplotlib.figure.Figure.html#matplotlib.figure.Figure)
- [plt . subplots](https://matplotlib.org/stable/api/_as_gen/matplotlib.pyplot.subplots.html#matplotlib.pyplot.subplots)
- [plt . cm . gray](https://matplotlib.org/stable/api/_as_gen/matplotlib.colors.LinearSegmentedColormap.html#matplotlib.colors.LinearSegmentedColormap)
- [fig . tight_layout](https://matplotlib.org/stable/api/_as_gen/matplotlib.figure.Figure.tight_layout.html#matplotlib.figure.Figure.tight_layout)
- [plt . show](https://matplotlib.org/stable/api/_as_gen/matplotlib.pyplot.show.html#matplotlib.pyplot.show)
- [data . binary_blobs](../../api/skimage.data.html#skimage.data.binary_blobs)
- [medial_axis](../../api/skimage.morphology.html#skimage.morphology.medial_axis)
- [thin](../../api/skimage.morphology.html#skimage.morphology.thin)
- [https://mybinder.org/v2/gh/scikit-image/scikit-image/v0.26.0?filepath=notebooks/auto_examples/edges/plot_skeleton.ipynb](https://mybinder.org/v2/gh/scikit-image/scikit-image/v0.26.0?filepath=notebooks/auto_examples/edges/plot_skeleton.ipynb)
- [Download Jupyter notebook: plot_skeleton.ipynb](../../_downloads/2763f34da4b712ae70cd9a352f2399ea/plot_skeleton.ipynb)
- [Download Python source code: plot_skeleton.py](../../_downloads/acc64afc58dd7a1f46c04f30a38229d9/plot_skeleton.py)
- [Download zipped: plot_skeleton.zip](../../_downloads/deb7b62e66096d53b9a5c78433ffae6b/plot_skeleton.zip)
- [Gallery generated by Sphinx-Gallery](https://sphinx-gallery.github.io)
- [Show Source](../../_sources/auto_examples/edges/plot_skeleton.rst.txt)
- [Sphinx](https://www.sphinx-doc.org/)
- [PyData Sphinx Theme](https://pydata-sphinx-theme.readthedocs.io/en/stable/index.html)
-->
