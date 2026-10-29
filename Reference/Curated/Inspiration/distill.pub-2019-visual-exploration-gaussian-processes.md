# A Visual Exploration of Gaussian Processes

How to turn a collection of small building blocks into a versatile tool for solving regression
problems.

> Math lost in conversion

> Truncated at the fetch cap; the tail is not captured.

_(Fetch log records 38,646 characters, near the 40,000-character cap; the body ends at the citation
section, but inline equation glyphs throughout the text are missing, so the document is treated as
truncated.)_

### Authors

[Jochen Görtler](http://www.jgoertler.com) -
[University of Konstanz](https://www.cgmi.uni-konstanz.de)
[Rebecca Kehlbeck](https://www.cgmi.uni-konstanz.de) -
[University of Konstanz](https://www.cgmi.uni-konstanz.de)
[Oliver Deussen](https://www.cgmi.uni-konstanz.de/en/persons/prof-dr-oliver-deussen/) -
[University of Konstanz](https://www.cgmi.uni-konstanz.de)

### Published

April 2, 2019

### DOI

[10.23915/distill.00017](https://doi.org/10.23915/distill.00017)

Even if you have spent some time reading about machine learning, chances are that you have never
heard of Gaussian processes. And if you have, rehearsing the basics is always a good way to refresh
your memory. With this blog post we want to give an introduction to Gaussian processes and make the
mathematical intuition behind them more approachable.

Gaussian processes are a powerful tool in the machine learning toolbox. They allow us to make
predictions about our data by incorporating prior knowledge. Their most obvious area of application
is _fitting_ a function to the data. This is called regression and is used, for example, in robotics
or time series forecasting. But Gaussian processes are not limited to regression - they can also be
extended to classification and clustering tasks. For a given set of training points, there are
potentially infinitely many functions that fit the data. Gaussian processes offer an elegant
solution to this problem by assigning a probability to each of these functions. The mean of this
probability distribution then represents the most probable characterization of the data.
Furthermore, using a probabilistic approach allows us to incorporate the confidence of the
prediction into the regression result.

We will first explore the mathematical foundation that Gaussian processes are built on - we invite
you to follow along using the interactive figures and hands-on examples. They help to explain the
impact of individual components, and show the flexibility of Gaussian processes. After following
this article we hope that you will have a visual intuition on how Gaussian processes work and how
you can configure them for different types of data.

## Multivariate Gaussian distributions

Before we can explore Gaussian processes, we need to understand the mathematical concepts they are
based on. As the name suggests, the Gaussian distribution (which is often also referred to as
_normal_ distribution) is the basic building block of Gaussian processes. In particular, we are
interested in the multivariate case of this distribution, where each random variable is distributed
normally and their joint distribution is also Gaussian. The multivariate Gaussian distribution is
defined by a mean vector and a covariance matrix. You can see an interactive example of such
distributions in
[the figure below](https://distill.pub/2019/visual-exploration-gaussian-processes/#Multivariate).

The mean vector describes the expected value of the distribution. Each of its components describes
the mean of the corresponding dimension. _(symbol lost)_ models the variance along each dimension
and determines how the different random variables are correlated. The covariance matrix is always
symmetric and positive semi-definite. The diagonal of _(symbol lost)_ consists of the variance of
the -th random variable. And the off-diagonal elements describe the correlation between the -th and
-th random variable.

$$X = \begin{bmatrix}x_1\\x_2\end{bmatrix} \sim (\mu, \Sigma)$$

_(reconstructed from the flattened capture)_

We say _(symbol lost)_ follows a normal distribution. The covariance matrix describes the shape of
the distribution. It is defined in terms of the expected value:

$$\Sigma = (,= E(-(-$$

_(reconstructed from the flattened capture; the LaTeX body was destroyed by the converter)_

Visually, the distribution is centered around the mean and the covariance matrix defines its shape.
The [following figure](https://distill.pub/2019/visual-exploration-gaussian-processes/#Multivariate)
shows the influence of these parameters on a two-dimensional Gaussian distribution. The variances
for each random variable are on the diagonal of the covariance matrix, while the other values show
the covariance between them.

_Covariance matrix (Σ): By dragging the handles you can adjust the variance along each dimension, as
well as the correlation between the two random variables. Violet values show a high probability
inside the distribution._

Gaussian distributions are widely used to model the real world. For example, we can employ them to
describe errors of measurements or phenomena under the assumptions of the _central limit theorem_.
One of the implications of this theorem is that a collection of independent, identically distributed
random variables with finite variance have a mean that is distributed normally. A good introduction
to the central limit theorem is given by
[this video](https://www.khanacademy.org/math/ap-statistics/sampling-distribution-ap/sampling-distribution-mean/v/central-limit-theorem)
from [Khan Academy](https://www.khanacademy.org). In the next section we will take a closer look at
how to manipulate Gaussian distributions and extract useful information from them.

### Marginalization and Conditioning

Gaussian distributions have the nice algebraic property of being closed under conditioning and
marginalization. Being closed under conditioning and marginalization means that the resulting
distributions from these operations are also Gaussian, which makes many problems in statistics and
machine learning tractable. In the following we will take a closer look at both of these operations,
as they are the foundation for Gaussian processes.

_Marginalization_ and _conditioning_ both work on subsets of the original distribution and we will
use the following notation:

$$= \sim (\mu, \Sigma = ,$$

_(reconstructed from the flattened capture)_

With and representing subsets of original random variables.

Through _marginalization_ we can extract partial information from multivariate probability
distributions. In particular, given a normal probability distribution over vectors of random
variables and , we can determine their marginalized probability distributions in the following way:

$$\sim (, \sim (,$$

_(reconstructed from the flattened capture)_

The interpretation of this equation is that each partition and only depends on its corresponding
entries in and. To marginalize out a random variable from a Gaussian distribution we can simply drop
the variables from and.

$$(x = (x, ydy = (x \mid y (y dy$$

_(reconstructed from the flattened capture)_

The way to interpret this equation is that if we are interested in the probability density of , we
need to consider all possible outcomes of that can jointly lead to the result. The corresponding
[Wikipedia article](https://en.wikipedia.org/wiki/Marginal_distribution) has a good description of
the marginal distribution, including several examples.

Another important operation for Gaussian processes is _conditioning_. It is used to determine the
probability of one variable depending on another variable. Similar to marginalization, this
operation is also closed and yields a modified Gaussian distribution. This operation is the
cornerstone of Gaussian processes since it allows Bayesian inference, which we will talk about in
the
[next section](https://distill.pub/2019/visual-exploration-gaussian-processes/#GaussianProcesses).
Conditioning is defined by:

$$\sim (+(Y-, - \sim (+(X-, -$$

_(reconstructed from the flattened capture)_

Note that the new mean only depends on the conditioned variable, while the covariance matrix is
independent from this variable.

Now that we have worked through the necessary equations, we will think about how we can understand
the two operations visually. While marginalization and conditioning can be applied to multivariate
distributions of many dimensions, it makes sense to consider the two-dimensional case as shown in
the
[following figure](https://distill.pub/2019/visual-exploration-gaussian-processes/#MarginalizationConditioning).
Marginalization can be seen as integrating along one of the dimensions of the Gaussian distribution,
which is in line with the general definition of the marginal distribution. Conditioning also has a
nice geometric interpretation - we can imagine it as making a cut through the multivariate
distribution, yielding a new Gaussian distribution with fewer dimensions.

#### Marginalization (Y)

#### Conditioning (X = 1.2)

_A bivariate normal distribution in the center. On the left you can see the result of marginalizing
this distribution for Y, akin to integrating along the X axis. On the right you can see the
distribution conditioned on a given X, which is similar to a cut through the original distribution.
The Gaussian distribution and the conditioned variable can be changed by dragging the handles._

## Gaussian Processes

Now that we have recalled some of the basic properties of multivariate Gaussian distributions, we
will combine them together to define Gaussian processes, and show how they can be used to tackle
regression problems.

First, we will move from the continuous view to the discrete representation of a function: rather
than finding an implicit function, we are interested in predicting the function values at concrete
points, which we call _test points_. So how do we derive this functional view from the multivariate
normal distributions that we have considered so far? Stochastic processes, such as Gaussian
processes, are essentially a set of random variables. In addition, each of these random variables
has a corresponding index. We will use this index to refer to the -th dimension of our -dimensional
multivariate distributions. The
[following figure](https://distill.pub/2019/visual-exploration-gaussian-processes/#DimensionSwap)
shows an example of this for two dimensions.

Here, we have a two-dimensional normal distribution. Each dimension is assigned an index. You can
drag the handles to see how a particular sample (left) corresponds to functional values (right).
This representation also allows us to understand the connection between the covariance and the
resulting values: the underlying Gaussian distribution has a positive covariance between and - this
means that will increases as gets larger and vice versa. You can also drag the handles in the figure
to the right and observe the probability of such a configuration in the figure to the left.

Now, the goal of Gaussian processes is to learn this underlying distribution from _training data_.
Respective to the test data, we will denote the training data as. As we have mentioned before, the
key idea of Gaussian processes is to model the underlying distribution of together with as a
multivariate normal distribution. That means that the joint probability distribution spans the space
of possible function values for the function that we want to predict. Please note that this joint
distribution of test and training data has dimensions.

In order to perform regression on the training data, we will treat this problem as _Bayesian
inference_. The essential idea of Bayesian inference is to update the current hypothesis as new
information becomes available. In the case of Gaussian processes, this information is the training
data. Thus, we are interested in the conditional probability. Finally, we recall that Gaussian
distributions are closed under conditioning - so is also distributed normally.

Now that we have the basic framework of Gaussian processes together, there is only one thing
missing: how do we set up this distribution and define the mean and the covariance matrix? The
covariance matrix is determined by its _covariance function_, which is often also called the
_kernel_ of the Gaussian process. We will talk about this in detail in the next section. But before
we come to this, let us reflect on how we can use multivariate Gaussian distributions to estimate
function values. The
[following figure](https://distill.pub/2019/visual-exploration-gaussian-processes/#PriorFigure)
shows an example of this using ten test points at which we want to predict our function.

_We are interested in predicting the function values for 10 different x values from without knowing
about training points. The covariance matrix is created by pairwise evaluation of the kernel
function resulting in a 10-dimensional distribution. Sampling from this distribution results in a
10-dimensional vector where each entry represents one function value._

In Gaussian processes we treat each test point as a random variable. A multivariate Gaussian
distribution has the same number of dimensions as the number of random variables. Since we want to
predict the function values at test points, the corresponding multivariate Gaussian distribution is
also -dimensional. Making a prediction using a Gaussian process ultimately boils down to drawing
samples from this distribution. We then interpret the -th component of the resulting vector as the
function value corresponding to the -th test point.

### Kernels

Recall that in order to set up our distribution, we need to define and. In Gaussian processes it is
often assumed that , which simplifies the necessary equations for conditioning. We can always assume
such a distribution, even if , and add back to the resulting function values after the prediction
step. This process is also called _centering_ of the data. So configuring is straight forward - it
gets more interesting when we look at the other parameter of the distribution.

The clever step of Gaussian processes is how we set up the covariance matrix. The covariance matrix
will not only describe the shape of our distribution, but ultimately determines the characteristics
of the function that we want to predict. We generate the covariance matrix by evaluating the kernel,
which is often also called _covariance function_, pairwise on all the points. The kernel receives
two points as an input and returns a similarity measure between those points in the form of a
scalar:

$$k: \times \to ,=(X,=k(t,$$

_(reconstructed from the flattened capture)_

We evaluate this function for each pairwise combination of the test points to retrieve the
covariance matrix. This step is also depicted in the
[figure above](https://distill.pub/2019/visual-exploration-gaussian-processes/#PriorFigure). In
order to get a better intuition for the role of the kernel, let's think about what the entries in
the covariance matrix describe. The entry describes how much influence the -th and -th point have on
each other. This follows from the definition of the multivariate Gaussian distribution, which states
that defines the correlation between the -th and the -th random variable. Since the kernel describes
the similarity between the values of our function, it controls the possible shape that a fitted
function can adopt. Note that when we choose a kernel, we need to make sure that the resulting
matrix adheres to the properties of a covariance matrix.

Kernels are widely used in machine learning, for example in _support vector machines_. The reason
for this is that they allow similarity measures that go far beyond the standard euclidean distance
(-distance). Many of these kernels conceptually embed the input points into a higher dimensional
space in which they then measure the similarity. If the kernel follows Mercer's theorem it can be
used to define a Hilbert space. More information on this can be found on
[Wikipedia](https://en.wikipedia.org/wiki/Kernel_method). The
[following figure](https://distill.pub/2019/visual-exploration-gaussian-processes/#MultipleKernels)
shows examples of some common kernels for Gaussian processes. For each kernel, the covariance matrix
has been created from linearly-spaced values ranging from. Each entry in the matrix shows the
covariance between points in the range of.

#### RBF Kernel

$$\sigma^2 \exp \left( - \frac{||t-t'||^2}{2 l^2} \right)$$

#### Periodic

$$\sigma^2 \exp \left( - \frac{2 \sin^2(\pi |t-t'| / p)}{l^2} \right)$$

#### Linear

$$\sigma_b^2 + \sigma^2 (t - c)(t' - c)$$

_This figure shows various kernels that can be used with Gaussian processes. Each kernel has
different parameters, which can be changed by adjusting the according sliders. When grabbing a
slider, information on how the current parameter influences the kernel will be shown on the right._

Kernels can be separated into _stationary_ and _non-stationary_ kernels. _Stationary_ kernels, such
as the RBF kernel or the periodic kernel, are functions invariant to translations, and the
covariance of two points is only dependent on their relative position. _Non-stationary_ kernels,
such as the linear kernel, do not have this constraint and depend on an absolute location. The
stationary nature of the RBF kernel can be observed in the banding around the diagonal of its
covariance matrix (as shown in
[this figure](https://distill.pub/2019/visual-exploration-gaussian-processes/#MultipleKernels)).
Increasing the length parameter increases the banding, as points further away from each other become
more correlated. For the periodic kernel, we have an additional parameter that determines the
periodicity, which controls the distance between each repetition of the function. In contrast, the
parameter of the linear kernel allows us to change the point on which all functions hinge.

There are many more kernels that can describe different classes of functions, which can be used to
model the desired shape of the function. A good overview of different kernels is given by Duvenaud.
It is also possible to combine several kernels - but we will get to this later.

### Prior Distribution

We will now shift our focus back to the original task of regression. As we have mentioned earlier,
Gaussian processes define a probability distribution over possible functions. In
[this figure above](https://distill.pub/2019/visual-exploration-gaussian-processes/#DimensionSwap),
we show this connection: each sample of our multivariate normal distribution represents one
realization of our function values. Because this distribution is a multivariate Gaussian
distribution, the distribution of functions is normal. Recall that we usually assume. For now, let's
consider the case where we have not yet observed any training data. In the context of Bayesian
inference, this is called the _prior_ distribution.

If we have not yet observed any training examples, this distribution revolves around , according to
our original assumption. The prior distribution will have the same dimensionality as the number of
test points. We will use the kernel to set up the covariance matrix, which has the dimensions.

In the previous section we have looked at examples of different kernels. The kernel is used to
define the entries of the covariance matrix. Consequently, the covariance matrix determines which
type of functions from the space of all possible functions are more probable. As the prior
distribution does not yet contain any additional information, it is perfect to visualize the
influence of the kernel on the distribution of functions. The
[following figure](https://distill.pub/2019/visual-exploration-gaussian-processes/#Prior) shows
samples of potential functions from prior distributions that were created using different kernels.

_Clicking on the graph results in continuous samples drawn from a Gaussian process using the
selected kernel. After each draw, the previous sample fades into the background. Over time, it is
possible to see that functions are distributed normally around the mean µ._

Adjusting the parameters allows you to control the shape of the resulting functions. This also
varies the confidence of the prediction. When decreasing the variance, a common parameter for all
kernels, sampled functions are more concentrated around the mean. For the _Linear_ kernel, setting
the variance results in a set of functions constrained to perfectly intersect the offset point. If
we set we can model uncertainty, resulting in functions that pass close to.

### Posterior Distribution

So what happens if we observe training data? Let's get back to the model of Bayesian inference,
which states that we can incorporate this additional information into our model, yielding the
_posterior_ distribution. We will now take a closer look at how to do this for Gaussian processes.

First, we form the joint distribution between the test points and the training points. The result is
a multivariate Gaussian distribution with dimensions. As you can see in the
[figure below](https://distill.pub/2019/visual-exploration-gaussian-processes/#PosteriorFigure), we
concatenate the training and the test points to compute the corresponding covariance matrix.

For the next step we need one operation on Gaussian distributions that we have defined earlier.
Using _conditioning_ we can find from. The dimensions of this new distribution matches the number of
test points and the distribution is also normal. It is important to note that conditioning leads to
derived versions of the mean and the standard deviation: X∣Y∼(,. More details can be found in the
[related section](https://distill.pub/2019/visual-exploration-gaussian-processes/#MargCond) on
conditioning multivariate Gaussian distributions. The intuition behind this step is that the
training points constrain the set of functions to those that pass through the training points.

_Adding training points changes the number of dimensions of the multivariate Gaussian distribution.
The covariance matrix is created by pairwise evaluation of the kernel function resulting in a
12-dimensional distribution. Through conditioning we obtain the distribution that describes the
prediction of the function values for the given x values._

As mentioned before, the conditional distribution forces the set of functions to precisely pass
through each training point. In many cases this can lead to fitted functions that are unnecessarily
complex. Also, up until now, we have considered the training points to be perfect measurements. But
in real-world scenarios this is an unrealistic assumption, since most of our data is afflicted with
measurement errors or uncertainty. Gaussian processes offer a simple solution to this problem by
modeling the error of the measurements. For this, we need to add an error term ϵ∼(0, to each of our
training points:

We do this by slightly modifying the setup of the joint distribution:

$$= \sim (0, \Sigma = , + I$$

_(reconstructed from the flattened capture)_

Again, we can use conditioning to derive the predictive distribution. In this formulation, is an
additional parameter of our model.

Analogous to the prior distribution, we could obtain a prediction for our function values by
sampling from this distribution. But, since sampling involves randomness, the resulting fit to the
data would not be deterministic and our prediction could end up being an outlier. In order to make a
more meaningful prediction we can use the other basic operation of Gaussian distributions.

Through the _marginalization_ of each random variable, we can extract the respective mean function
value and standard deviation for the -th test point. In contrast to the prior distribution, where we
set the mean to , the result of conditioning the joint distribution of test and training data will
most likely have a non-zero mean. Extracting and does not only lead to a more meaningful prediction,
it also allows us to make a statement about the confidence of the prediction.

The [following figure](https://distill.pub/2019/visual-exploration-gaussian-processes/#Posterior)
shows an example of the conditional distribution. At first, no training points have been observed.
Accordingly, the mean prediction remains at and the standard deviation is the same for each test
point. By hovering over the covariance matrix you can see the influence of each point on the current
test point. As long as no training points have been observed, the influence of neighboring points is
limited locally.

The training points can be activated by clicking on them, which leads to a constrained distribution.
This change is reflected in the entries of the covariance matrix, and leads to an adjustment of the
mean and the standard deviation of the predicted function. As we would expect, the uncertainty of
the prediction is small in regions close to the training data and grows as we move further away from
those points.

_Without any activated training data, this figure shows the prior distribution of a Gaussian process
with a RBF kernel. When hovering over the covariance matrix, the opacity of the gradient shows the
influence of a function value on its neighbours. The distribution changes when we observe training
data. Individual points can be activated by clicking on them. The Gaussian process is then
constrained to make functions, that intersect these data points, more probable. The best explanation
of the training data is given by the updated mean function._

In the constrained covariance matrix, we can see that the correlation of neighbouring points is
affected by the training data. If a predicted point lies on the training data, there is no
correlation with other points. Therefore, the function must pass directly through it. Predicted
values further away are also affected by the training data - proportional to their distance.

### Combining different kernels

As described earlier, the power of Gaussian processes lies in the choice of the kernel function.
This property allows experts to introduce domain knowledge into the process and lends Gaussian
processes their flexibility to capture trends in the training data. For example, by choosing a
suitable bandwidth for the RBF kernel, we can control how smooth the resulting function will be.

A big benefit that kernels provide is that they can be combined together, resulting in a more
specialized kernel. The decision which kernel to use is highly dependent on prior knowledge about
the data, e.g. if certain characteristics are expected. Examples for this would be stationary
nature, or global trends and patterns. As introduced in the
[section on kernels](https://distill.pub/2019/visual-exploration-gaussian-processes/#Kernels),
stationary means that a kernel is translation invariant and therefore not dependent on the index.
This also means that we cannot model global trends using a strictly stationary kernel. Remember that
the covariance matrix of Gaussian processes has to be positive semi-definite. When choosing the
optimal kernel combinations, all methods that preserve this property are allowed. The most common
kernel combinations would be addition and multiplication.

Let's consider two kernels, a linear kernel and a periodic kernel, for example. This is how we would
multiply the two:

$$(t,=(t, \cdot (t,$$

_(reconstructed from the flattened capture)_

However, combinations are not limited to the above example, and there are more possibilities such as
concatenation or composition with a function. To show the impact of a kernel combination and how it
might retain qualitative features of the individual kernels, take a look at the
[figure below](https://distill.pub/2019/visual-exploration-gaussian-processes/#KernelCombinationsStatic).
If we add a periodic and a linear kernel, the global trend of the linear kernel is incorporated into
the combined kernel. The result is a periodic function that follows a linear trend. When combining
the same kernels through multiplication instead, the result is a periodic function with a linearly
growing amplitude away from linear kernel parameter.

_If we draw samples from a combined linear and periodic kernel, we can observe the different
retained characteristics in the new sample. Addition results in a periodic function with a global
trend, while the multiplication increases the periodic amplitude outwards._

Knowing more about how kernel combinations influence the shape of the resulting distribution, we can
move on to a more complex example. In the
[figure below](https://distill.pub/2019/visual-exploration-gaussian-processes/#KernelCombinations),
the observed training data has an ascending trend with a periodic deviation. Using only a linear
kernel, we can mimic a normal linear regression of the points. At first glance, the RBF kernel
accurately approximates the points. But since the RBF kernel is stationary it will always return to
in regions further away from observed training data. This decreases the accuracy for predictions
that reach further into the past or the future. An improved model can be created by combining the
individual kernels through addition, which maintains both the periodic nature and the global
ascending trend of the data. This procedure can be used, for example, in the analysis of weather
data.

_Using the checkboxes, different kernels can be combined to form a new Gaussian process. Only by
using a combination of kernels, it is possible to capture the characteristics of more complex
training data._

As discussed in the
[section about GPs](https://distill.pub/2019/visual-exploration-gaussian-processes/#GaussianProcesses),
a Gaussian process can model uncertain observations. This can be seen when only selecting the linear
kernel, as it allows us to perform linear regression even if more than two points have been
observed, and not all functions have to pass directly through the observed training data.

## Conclusion

With this article, you should have obtained an overview of Gaussian processes, and developed a
deeper understanding on how they work. As we have seen, Gaussian processes offer a flexible
framework for regression and several extensions exist that make them even more versatile.

For instance, sometimes it might not be possible to describe the kernel in simple terms. To overcome
this challenge, learning specialized kernel functions from the underlying data, for example by using
deep learning, is an area of ongoing research. Furthermore, links between Bayesian inference,
Gaussian processes and deep learning have been described in several papers. Even though we mostly
talk about Gaussian processes in the context of regression, they can be adapted for different
purposes, e.g. _model-peeling_ and hypothesis testing. By comparing different kernels on the
dataset, domain experts can introduce additional knowledge through appropriate combination and
parameterization of the kernel.

If we have sparked your interest, we have compiled a list of further
[blog posts](https://distill.pub/2019/visual-exploration-gaussian-processes/#FurtherReading) on the
topic of Gaussian processes. In addition, we have linked two
[Python notebooks](https://distill.pub/2019/visual-exploration-gaussian-processes/#FurtherReading)
that will give you some hands-on experience and help you to get started right away.

### Acknowledgments

We are very grateful to Carla Avolio and Marc Spicker for their feedback on the manuscript. In
addition, we want to thank Jonas Körner for helping with the implementation of the figure explaining
the multivariate Gaussian distribution. Furthermore, we would like to thank the German Research
Foundation (DFG) for financial support within project
[A01](http://www.sfbtrr161.de/research/project_a01/index.html) of the
[SFB-TRR 161](http://www.sfbtrr161.de) and within the
[Research Unit FOR 2111](https://typo.uni-konstanz.de/questionsInterfaces/) with grant number
DFG-431/16.

### Discussion and Review

[Review 1 - Anonymous](https://github.com/distillpub/post--visual-exploration-gaussian-processes/issues/1)
[Review 2 - Anonymous](https://github.com/distillpub/post--visual-exploration-gaussian-processes/issues/3)
[Review 3 - Austin Huang](https://github.com/distillpub/post--visual-exploration-gaussian-processes/issues/4)

### Further Reading

The following blog posts offer more interactive visualizations and further reading material on the
topic of Gaussian processes:

- [Interactive visualization of Gaussian processes](http://www.infinitecuriosity.org/vizgp/) by ST
  John that joins together the different concepts introduced throughout this article.
- [Gaussian process regression demo](http://www.tmpl.fi/gp/) by Tomi Peltola
- [Gaussian Processes for Dummies](http://katbailey.github.io/post/gaussian-processes-for-dummies/)
  by Katherine Bailey
- [Intuition behind Gaussian Processes](https://blog.sigopt.com/posts/intuition-behind-gaussian-processes)
  by Mike McCourt
- [Fitting Gaussian Process Models in Python](https://blog.dominodatalab.com/fitting-gaussian-process-models-python/)
  by Chris Fonnesbeck
- [A Practical Guide to Gaussian Processes](https://tinyurl.com/guide2gp) by Marc Peter Deisenroth,
  Yicheng Luo, and Mark van der Wilk: heuristics for initializing and optimizing Gaussian processes

If you want more of a hands-on experience, there are also many Python notebooks available:

- [Fitting Gaussian Process Models in Python](https://blog.dominodatalab.com/fitting-gaussian-process-models-python/)
  by Chris Fonnesbeck
- [Gaussian process lecture](http://nbviewer.jupyter.org/github/adamian/adamian.github.io/blob/master/talks/Brown2016.ipynb/)
  by Andreas Damianou

### Footnotes

1. One of the implications of this theorem is that a collection of independent, identically
   distributed random variables with finite variance have a mean that is distributed normally. A
   good introduction to the central limit theorem is given by
   [this video](https://www.khanacademy.org/math/ap-statistics/sampling-distribution-ap/sampling-distribution-mean/v/central-limit-theorem)
   from [Khan Academy](https://www.khanacademy.org).
   [[↩]](https://distill.pub/2019/visual-exploration-gaussian-processes/#d-footnote-1)
2. The corresponding [Wikipedia article](https://en.wikipedia.org/wiki/Marginal_distribution) has a
   good description of the marginal distribution, including several examples.
   [[↩]](https://distill.pub/2019/visual-exploration-gaussian-processes/#d-footnote-2)
3. If the kernel follows Mercer's theorem it can be used to define a Hilbert space. More information
   on this can be found on
   [Wikipedia](https://en.wikipedia.org/wiki/Kernel_method).[[↩]](https://distill.pub/2019/visual-exploration-gaussian-processes/#d-footnote-3)

### References

1. Gaussian Processes in Machine Learning
   [[PDF]](http://www.gaussianprocess.org/gpml/chapters/RW.pdf)Rasmussen, C.E., 2004. Advanced
   Lectures on Machine Learning, pp. 63--71. Springer Berlin Heidelberg.
   [DOI: 10.1007/978-3-540-28650-9_4](https://doi.org/10.1007/978-3-540-28650-9_4)
2. Gaussian Processes for Object Categorization
   [[link]](https://doi.org/10.1007/s11263-009-0268-3)Kapoor, A., Grauman, K., Urtasun, R. and
   Darrell, T., 2010. International Journal of Computer Vision, Vol 88(2), pp. 169--188.
   [DOI: 10.1007/s11263-009-0268-3](https://doi.org/10.1007/s11263-009-0268-3)
3. Clustering Based on Gaussian Processes
   [[PDF]](http://staging.csml.ucl.ac.uk/archive/talks/41e4e55330421a6e230d0ea2b89440ea/Paper_16.pdf)Kim,
   H. and Lee, J., 2007. Neural Computation, Vol 19(11), pp. 3088--3107. MIT Press - Journals.
   [DOI: 10.1162/neco.2007.19.11.3088](https://doi.org/10.1162/neco.2007.19.11.3088)
4. Covariance matrix (Encyclopedia of Mathematics) 1994. Springer Science+Business Media B.V. /
   Kluwer Academic Publishers.
5. The Nature of Statistical Learning Theory Vapnik, V.N., 2000. Springer New York.
   [DOI: 10.1007/978-1-4757-3264-1](https://doi.org/10.1007/978-1-4757-3264-1)
6. Automatic model construction with Gaussian processes
   [[link]](https://www.cs.toronto.edu/~duvenaud/cookbook/)Duvenaud, D., 2014. University of
   Cambridge. PhD Thesis.
7. Information theory, inference and learning algorithms MacKay, D.J., 2003. Cambridge University
   Press.
8. Using Deep Belief Nets to Learn Covariance Kernels for Gaussian Processes
   [[PDF]](http://papers.nips.cc/paper/3211-using-deep-belief-nets-to-learn-covariance-kernels-for-gaussian-processes.pdf)Hinton,
   G.E. and Salakhutdinov, R.R., 2008. Advances in Neural Information Processing Systems 20, pp.
   1249--1256. Curran Associates, Inc.
9. Deep Kernel Learning [[PDF]](http://proceedings.mlr.press/v51/wilson16.pdf)Wilson, A.G., Hu, Z.,
   Salakhutdinov, R. and Xing, E.P., 2016. Proceedings of the 19th International Conference on
   Artificial Intelligence and Statistics, Vol 51, pp. 370--378.
10. Deep Neural Networks as Gaussian Processes [[PDF]](https://arxiv.org/pdf/1711.00165v3.pdf)Lee,
    J., Sohl-Dickstein, J., Pennington, J., Novak, R., Schoenholz, S. and Bahri, Y., 2018.
    International Conference on Learning Representations.
11. Deep Gaussian Processes [[PDF]](http://proceedings.mlr.press/v31/damianou13a.pdf)Damianou, A.
    and Lawrence, N., 2013. Proceedings of the Sixteenth International Conference on Artificial
    Intelligence and Statistics, Vol 31, pp. 207--215. PMLR.

### Updates and Corrections

If you see mistakes or want to suggest changes, please
[create an issue on GitHub](https://github.com/distillpub/post--visual-exploration-gaussian-processes/issues/new).

### Reuse

Diagrams and text are licensed under Creative Commons Attribution
[CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/) with the
[source available on GitHub](https://github.com/distillpub/post--visual-exploration-gaussian-processes),
unless noted otherwise. The figures that have been reused from other sources don't fall under this
license and can be recognized by a note in their caption: "Figure from ...".

### Citation

For attribution in academic contexts, please cite this work as

```text
Görtler, et al., "A Visual Exploration of Gaussian Processes", Distill, 2019.
```

BibTeX citation

```bibtex
@article{görtler2019a,
  author = {Görtler, Jochen and Kehlbeck, Rebecca and Deussen, Oliver},
  title = {A Visual Exploration of Gaussian Processes},
  journal = {Distill},
  year = {2019},
  note = {https://distill.pub/2019/visual-exploration-gaussian-processes},
  doi = {10.23915/distill.00017}
}
```
