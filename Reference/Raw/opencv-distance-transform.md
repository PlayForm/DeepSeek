| OpenCV 4.13.0 Open Source Computer Vision                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [•All](<javascript:void(0)>)[ Classes](<javascript:void(0)>)[ Namespaces](<javascript:void(0)>)[ Files](<javascript:void(0)>)[ Functions](<javascript:void(0)>)[ Variables](<javascript:void(0)>)[ Typedefs](<javascript:void(0)>)[ Enumerations](<javascript:void(0)>)[ Enumerator](<javascript:void(0)>)[ Properties](<javascript:void(0)>)[ Friends](<javascript:void(0)>)[ Macros](<javascript:void(0)>)[ Modules](<javascript:void(0)>)[ Pages](<javascript:void(0)>) |
| Loading...                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Searching...                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| No Matches                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |

- [Image Processing (imgproc module)](https://docs.opencv.org/4.13.0/d7/da8/tutorial_table_of_content_imgproc.html)

Image Segmentation with Distance Transform and Watershed Algorithm

### Table of Contents

- [Explanation / Result](https://docs.opencv.org/4.13.0/d2/dbd/tutorial_distance_transform.html#autotoc_md662)

**Prev Tutorial:**
[Point Polygon Test](https://docs.opencv.org/4.13.0/dc/d48/tutorial_point_polygon_test.html) **Next
Tutorial:**
[Out-of-focus Deblur Filter](https://docs.opencv.org/4.13.0/de/d3c/tutorial_out_of_focus_deblur_filter.html)

| Original author | Theodore Tsesmelis |
| --------------- | ------------------ |
| Compatibility   | OpenCV >= 3.0      |

# Goal

In this tutorial you will learn how to:

- Use the OpenCV function
  [cv::filter2D](https://docs.opencv.org/4.13.0/d4/d86/group__imgproc__filter.html#ga27c049795ce870216ddfb366086b5a04)
  in order to perform some laplacian filtering for image sharpening
- Use the OpenCV function
  [cv::distanceTransform](https://docs.opencv.org/4.13.0/d7/d1b/group__imgproc__misc.html#ga8a0b7fdfcb7a13dde018988ba3a43042)
  in order to obtain the derived representation of a binary image, where the value of each pixel is
  replaced by its distance to the nearest background pixel
- Use the OpenCV function
  [cv::watershed](https://docs.opencv.org/4.13.0/d3/d47/group__imgproc__segmentation.html#ga3267243e4d3f95165d55a618c65ac6e1)
  in order to isolate objects in the image from the background

# Theory

# CodeC++JavaPython

C++ This tutorial code's is shown lines below. You can also download it from
[here](https://github.com/opencv/opencv/tree/4.x/samples/cpp/tutorial_code/ImgTrans/imageSegmentation.cpp).
#include
<[opencv2/core.hpp](https://docs.opencv.org/4.13.0/d0/d9c/core_2include_2opencv2_2core_8hpp.html)>
#include
<[opencv2/imgproc.hpp](https://docs.opencv.org/4.13.0/d1/d4f/imgproc_2include_2opencv2_2imgproc_8hpp.html)>
#include <[opencv2/highgui.hpp](https://docs.opencv.org/4.13.0/d4/dd5/highgui_8hpp.html)> #include
<iostream> using namespace [std](https://docs.opencv.org/4.13.0/d8/dcc/namespacestd.html); using
namespace [cv](https://docs.opencv.org/4.13.0/d2/d75/namespacecv.html); int
[main](https://docs.opencv.org/4.13.0/dc/d89/highgui__qt_8cpp.html#a0ddf1224851353fc92bfbff6f499fa97)(int
argc, char *argv[]) { // Load the image
[CommandLineParser](https://docs.opencv.org/4.13.0/d0/d2e/classcv_1_1CommandLineParser.html) parser(
argc, argv, "{@input | cards.png | input image}" );
[Mat](https://docs.opencv.org/4.13.0/d3/d63/classcv_1_1Mat.html) src = imread( samples::findFile(
parser.get<[String](https://docs.opencv.org/4.13.0/dc/d84/group__core__basic.html#ga1f6634802eeadfd7245bc75cf3e216c2)>(
"@input" ) ) ); if(
src.[empty](https://docs.opencv.org/4.13.0/d3/d63/classcv_1_1Mat.html#abbec3525a852e77998aba034813fded4)()
) cout << "Could not open or find the image!\n" << endl; cout << "Usage: " << argv[0] << "
<Input image>" << endl; return -1; // Show the source image imshow("Source Image", src); // Change
the background from white to black, since that will help later to extract // better results during
the use of Distance Transform [Mat](https://docs.opencv.org/4.13.0/d3/d63/classcv_1_1Mat.html) mask;
inRange(src, [Scalar](https://docs.opencv.org/4.13.0/d1/da0/classcv_1_1Scalar__.html)(255, 255,
255), [Scalar](https://docs.opencv.org/4.13.0/d1/da0/classcv_1_1Scalar__.html)(255, 255, 255),
mask);
src.[setTo](https://docs.opencv.org/4.13.0/d3/d63/classcv_1_1Mat.html#a030678ffd9ca6e12127b3fd1337bf6e2)([Scalar](https://docs.opencv.org/4.13.0/d1/da0/classcv_1_1Scalar__.html)(0,
0, 0), mask); // Show output image imshow("Black Background Image", src); // Create a kernel that we
will use to sharpen our image [Mat](https://docs.opencv.org/4.13.0/d3/d63/classcv_1_1Mat.html)
kernel = ([Mat_<float>](https://docs.opencv.org/4.13.0/df/dfc/classcv_1_1Mat__.html)(3,3) << 1, 1,
1, 1, -8, 1, 1, 1, 1); // an approximation of second derivative, a quite strong kernel // do the
laplacian filtering as it is // well, we need to convert everything in something more deeper then
CV_8U // because the kernel has some negative values, // and we can expect in general to have a
Laplacian image with negative values // BUT a 8bits unsigned int (the one we are working with) can
contain values from 0 to 255 // so the possible negative number will be truncated
[Mat](https://docs.opencv.org/4.13.0/d3/d63/classcv_1_1Mat.html) imgLaplacian; filter2D(src,
imgLaplacian,
[CV_32F](https://docs.opencv.org/4.13.0/d1/d1b/group__core__hal__interface.html#ga4a3def5d72b74bed31f5f8ab7676099c),
kernel); [Mat](https://docs.opencv.org/4.13.0/d3/d63/classcv_1_1Mat.html) sharp;
src.[convertTo](https://docs.opencv.org/4.13.0/d3/d63/classcv_1_1Mat.html#adf88c60c5b4980e05bb556080916978b)(sharp,
[CV_32F](https://docs.opencv.org/4.13.0/d1/d1b/group__core__hal__interface.html#ga4a3def5d72b74bed31f5f8ab7676099c));
[Mat](https://docs.opencv.org/4.13.0/d3/d63/classcv_1_1Mat.html) imgResult = sharp - imgLaplacian;
// convert back to 8bits gray scale
imgResult.[convertTo](https://docs.opencv.org/4.13.0/d3/d63/classcv_1_1Mat.html#adf88c60c5b4980e05bb556080916978b)(imgResult,
[CV_8UC3](https://docs.opencv.org/4.13.0/d1/d1b/group__core__hal__interface.html#ga88c4cd9de76f678f33928ef1e3f96047));
imgLaplacian.convertTo(imgLaplacian,
[CV_8UC3](https://docs.opencv.org/4.13.0/d1/d1b/group__core__hal__interface.html#ga88c4cd9de76f678f33928ef1e3f96047));
// imshow( "Laplace Filtered Image", imgLaplacian ); imshow( "New Sharped Image", imgResult ); //
Create binary image from source image cvtColor(imgResult, bw, COLOR_BGR2GRAY); threshold(bw, bw, 40,
255, THRESH_BINARY | THRESH_OTSU); imshow("Binary Image", bw); // Perform the distance transform
algorithm [Mat](https://docs.opencv.org/4.13.0/d3/d63/classcv_1_1Mat.html) dist;
distanceTransform(bw, dist, DIST_L2, 3); // Normalize the distance image for range = {0.0, 1.0} //
so we can visualize and threshold it normalize(dist, dist, 0, 1.0, NORM_MINMAX); imshow("Distance
Transform Image", dist); // Threshold to obtain the peaks // This will be the markers for the
foreground objects threshold(dist, dist, 0.4, 1.0, THRESH_BINARY); // Dilate a bit the dist image
[Mat](https://docs.opencv.org/4.13.0/d3/d63/classcv_1_1Mat.html) kernel1 = Mat::ones(3, 3,
[CV_8U](https://docs.opencv.org/4.13.0/d1/d1b/group__core__hal__interface.html#ga32b18d904ee2b1731a9416a8eef67d06));
dilate(dist, dist, kernel1); imshow("Peaks", dist); // Create the CV_8U version of the distance
image // It is needed for findContours()
[Mat](https://docs.opencv.org/4.13.0/d3/d63/classcv_1_1Mat.html) dist_8u;
dist.[convertTo](https://docs.opencv.org/4.13.0/d3/d63/classcv_1_1Mat.html#adf88c60c5b4980e05bb556080916978b)(dist_8u,
[CV_8U](https://docs.opencv.org/4.13.0/d1/d1b/group__core__hal__interface.html#ga32b18d904ee2b1731a9416a8eef67d06));
// Find total markers vector<vector<Point> > contours; findContours(dist_8u, contours,
RETR_EXTERNAL, CHAIN_APPROX_SIMPLE); // Create the marker image for the watershed algorithm
[Mat](https://docs.opencv.org/4.13.0/d3/d63/classcv_1_1Mat.html) markers =
Mat::zeros(dist.[size](https://docs.opencv.org/4.13.0/d3/d63/classcv_1_1Mat.html#a146f8e8dda07d1365a575ab83d9828d1)(),
[CV_32S](https://docs.opencv.org/4.13.0/d1/d1b/group__core__hal__interface.html#ga4067910fc388075c3ea3aa14393e83b9));
// Draw the foreground markers for (size_t i = 0; i < contours.size(); i++) drawContours(markers,
contours, static_cast<int(i),
[Scalar](https://docs.opencv.org/4.13.0/d1/da0/classcv_1_1Scalar__.html)(static_cast<int(i)+1), -1);
// Draw the background marker circle(markers,
[Point](https://docs.opencv.org/4.13.0/db/d4e/classcv_1_1Point__.html)(5,5), 3,
[Scalar](https://docs.opencv.org/4.13.0/d1/da0/classcv_1_1Scalar__.html)(255), -1);
[Mat](https://docs.opencv.org/4.13.0/d3/d63/classcv_1_1Mat.html) markers8u;
markers.[convertTo](https://docs.opencv.org/4.13.0/d3/d63/classcv_1_1Mat.html#adf88c60c5b4980e05bb556080916978b)(markers8u,
[CV_8U](https://docs.opencv.org/4.13.0/d1/d1b/group__core__hal__interface.html#ga32b18d904ee2b1731a9416a8eef67d06),
10); imshow("Markers", markers8u); // Perform the watershed algorithm watershed(imgResult, markers);
[Mat](https://docs.opencv.org/4.13.0/d3/d63/classcv_1_1Mat.html) mark;
markers.[convertTo](https://docs.opencv.org/4.13.0/d3/d63/classcv_1_1Mat.html#adf88c60c5b4980e05bb556080916978b)(mark,
[CV_8U](https://docs.opencv.org/4.13.0/d1/d1b/group__core__hal__interface.html#ga32b18d904ee2b1731a9416a8eef67d06));
bitwise_not(mark, mark); // imshow("Markers_v2", mark); // uncomment this if you want to see how the
mark // image looks like at that point // Generate random colors vector<Vec3b> colors; for (size_t i
= 0; i < contours.size(); i++) int b =
theRNG().[uniform](https://docs.opencv.org/4.13.0/d1/dd6/classcv_1_1RNG.html#acde197860cea91e5aa896be8719457ae)(0,
256); int g =
theRNG().[uniform](https://docs.opencv.org/4.13.0/d1/dd6/classcv_1_1RNG.html#acde197860cea91e5aa896be8719457ae)(0,
256); int r =
theRNG().[uniform](https://docs.opencv.org/4.13.0/d1/dd6/classcv_1_1RNG.html#acde197860cea91e5aa896be8719457ae)(0,
256);
colors.push_back([Vec3b](https://docs.opencv.org/4.13.0/d6/dcf/classcv_1_1Vec.html)(([uchar](https://docs.opencv.org/4.13.0/d1/d1b/group__core__hal__interface.html#ga65f85814a8290f9797005d3b28e7e5fc))b,
([uchar](https://docs.opencv.org/4.13.0/d1/d1b/group__core__hal__interface.html#ga65f85814a8290f9797005d3b28e7e5fc))g,
([uchar](https://docs.opencv.org/4.13.0/d1/d1b/group__core__hal__interface.html#ga65f85814a8290f9797005d3b28e7e5fc))r));
// Create the result image [Mat](https://docs.opencv.org/4.13.0/d3/d63/classcv_1_1Mat.html) dst =
Mat::zeros(markers.[size](https://docs.opencv.org/4.13.0/d3/d63/classcv_1_1Mat.html#a146f8e8dda07d1365a575ab83d9828d1)(),
[CV_8UC3](https://docs.opencv.org/4.13.0/d1/d1b/group__core__hal__interface.html#ga88c4cd9de76f678f33928ef1e3f96047));
// Fill labeled objects with random colors for (int i = 0; i <
markers.[rows](https://docs.opencv.org/4.13.0/d3/d63/classcv_1_1Mat.html#abed816466c45234254d25bc59c31245e);
i++) for (int j = 0; j <
markers.[cols](https://docs.opencv.org/4.13.0/d3/d63/classcv_1_1Mat.html#aa3e5a47585c9ef6a0842556739155e3e);
j++) int index =
markers.[at](https://docs.opencv.org/4.13.0/d3/d63/classcv_1_1Mat.html#aa10d804e90b51d4157b5c26e12c5d2df)<int>(i,j);
if (index > 0 && index <= static_cast<int(contours.size()))
dst.[at](https://docs.opencv.org/4.13.0/d3/d63/classcv_1_1Mat.html#aa10d804e90b51d4157b5c26e12c5d2df)<[Vec3b](https://docs.opencv.org/4.13.0/d6/dcf/classcv_1_1Vec.html)>(i,j)
= colors[index-1]; // Visualize the final image
[imshow](https://docs.opencv.org/4.13.0/d7/dfc/group__highgui.html#ga453d42fe4cb60e5723281a89973ee563)("Final
Result", dst); return 0; }
[cv::CommandLineParser](https://docs.opencv.org/4.13.0/d0/d2e/classcv_1_1CommandLineParser.html)
Designed for command line parsing. **Definition** utility.hpp:890 Template matrix class derived from
Mat. **Definition** mat.hpp:2296 n-dimensional dense array class **Definition** mat.hpp:840 Mat &
setTo(InputArray value, InputArray mask=noArray()) Sets all or some of the array elements to the
specified value. MatSize size **Definition** mat.hpp:2226 _Tp & at(int i0=0) Returns a reference to
the specified array element. int cols **Definition** mat.hpp:2204 bool empty() const Returns true if
the array has no elements. int rows the number of rows and columns or (-1, -1) when the matrix has
more than 2 dimensions **Definition** mat.hpp:2204 void convertTo(OutputArray m, int rtype, double
alpha=1, double beta=0) const Converts an array to another data type with optional scaling.
[cv::Point\_< int >](https://docs.opencv.org/4.13.0/db/d4e/classcv_1_1Point__.html) int uniform(int
a, int b) returns uniformly distributed integer random number from [a,b) range
[cv::Scalar\_< double >](https://docs.opencv.org/4.13.0/d1/da0/classcv_1_1Scalar__.html) Template
class for short numerical vectors, a partial case of Matx. **Definition** matx.hpp:369 std::string
String **Definition** cvstd.hpp:151 #define CV_8U **Definition** interface.h:73 #define CV_32S
**Definition** interface.h:77 #define CV_32F **Definition** interface.h:78 unsigned char uchar
**Definition** interface.h:51 #define CV_8UC3 **Definition** interface.h:90 void imshow(const String
&winname, InputArray mat) Displays an image in the specified window. int waitKey(int delay=0) Waits
for a pressed key. int main(int argc, char \*argv[]) **Definition** highgui_qt.cpp:3 **Definition**
core.hpp:107 STL namespace. Java This tutorial code's is shown lines below. You can also download it
from
[here](https://github.com/opencv/opencv/tree/4.x/samples/java/tutorial_code/ImgTrans/distance_transformation/ImageSegmentationDemo.java)
import java.util.ArrayList; import java.util.List; import java.util.Random; import
org.opencv.core.Core; import org.opencv.core.CvType; import org.opencv.core.Mat; import
org.opencv.core.MatOfPoint; import org.opencv.core.Point; import org.opencv.core.Scalar; import
org.opencv.highgui.HighGui; import org.opencv.imgcodecs.Imgcodecs; import
org.opencv.imgproc.Imgproc; class ImageSegmentation { public void run(String[] args) { // Load the
image String filename = args.length > 0 ? args[0] : "../data/cards.png"; Mat srcOriginal =
Imgcodecs.imread(filename); if (srcOriginal.empty()) { System.err.println("Cannot read image: " +
filename); System.exit(0); // Show source image HighGui.imshow("Source Image", srcOriginal); //
Change the background from white to black, since that will help later to // extract // better
results during the use of Distance Transform Mat src = srcOriginal.clone(); byte[] srcData = new
byte[(int) (src.total() * src.channels())]; src.get(0, 0, srcData); for (int i = 0; i < src.rows();
i++) { for (int j = 0; j < src.cols(); j++) { if (srcData[(i * src.cols() + j) * 3] == (byte) 255 &&
srcData[(i * src.cols() + j) * 3 + 1] == (byte) 255 && srcData[(i * src.cols() + j) * 3 + 2] ==
(byte) 255) { srcData[(i * src.cols() + j) * 3] = 0; srcData[(i * src.cols() + j) * 3 + 1] = 0;
srcData[(i * src.cols() + j) * 3 + 2] = 0; src.put(0, 0, srcData); // Show output image
HighGui.imshow("Black Background Image", src); // Create a kernel that we will use to sharpen our
image Mat kernel = new Mat(3, 3, CvType.CV_32F); // an approximation of second derivative, a quite
strong kernel float[] kernelData = new float[(int) (kernel.total() * kernel.channels())];
kernelData[0] = 1; kernelData[1] = 1; kernelData[2] = 1; kernelData[3] = 1; kernelData[4] = -8;
kernelData[5] = 1; kernelData[6] = 1; kernelData[7] = 1; kernelData[8] = 1; kernel.put(0, 0,
kernelData); // do the laplacian filtering as it is // well, we need to convert everything in
something more deeper then CV_8U // because the kernel has some negative values, // and we can
expect in general to have a Laplacian image with negative values // BUT a 8bits unsigned int (the
one we are working with) can contain values // from 0 to 255 // so the possible negative number will
be truncated Mat imgLaplacian = new Mat(); Imgproc.filter2D(src, imgLaplacian, CvType.CV_32F,
kernel); Mat sharp = new Mat(); src.convertTo(sharp, CvType.CV_32F); Mat imgResult = new Mat();
Core.subtract(sharp, imgLaplacian, imgResult); // convert back to 8bits gray scale
imgResult.convertTo(imgResult, CvType.CV_8UC3); imgLaplacian.convertTo(imgLaplacian,
CvType.CV_8UC3); // imshow( "Laplace Filtered Image", imgLaplacian ); HighGui.imshow("New Sharped
Image", imgResult); // Create binary image from source image Mat bw = new Mat();
Imgproc.cvtColor(imgResult, bw, Imgproc.COLOR_BGR2GRAY); Imgproc.threshold(bw, bw, 40, 255,
Imgproc.THRESH_BINARY | Imgproc.THRESH_OTSU); HighGui.imshow("Binary Image", bw); // Perform the
distance transform algorithm Mat dist = new Mat(); Imgproc.distanceTransform(bw, dist,
Imgproc.DIST_L2, 3); // Normalize the distance image for range = {0.0, 1.0} // so we can visualize
and threshold it Core.normalize(dist, dist, 0.0, 1.0, Core.NORM_MINMAX); Mat distDisplayScaled = new
Mat(); Core.multiply(dist, new
[Scalar](https://docs.opencv.org/4.13.0/dc/d84/group__core__basic.html#ga599fe92e910c027be274233eccad7beb)(255),
distDisplayScaled); Mat distDisplay = new Mat(); distDisplayScaled.convertTo(distDisplay,
CvType.CV_8U); HighGui.imshow("Distance Transform Image", distDisplay); // Threshold to obtain the
peaks // This will be the markers for the foreground objects Imgproc.threshold(dist, dist, 0.4, 1.0,
Imgproc.THRESH_BINARY); // Dilate a bit the dist image Mat kernel1 = Mat.ones(3, 3, CvType.CV_8U);
Imgproc.dilate(dist, dist, kernel1); Mat distDisplay2 = new Mat(); dist.convertTo(distDisplay2,
CvType.CV_8U); Core.multiply(distDisplay2, new
[Scalar](https://docs.opencv.org/4.13.0/dc/d84/group__core__basic.html#ga599fe92e910c027be274233eccad7beb)(255),
distDisplay2); HighGui.imshow("Peaks", distDisplay2); // Create the CV_8U version of the distance
image // It is needed for findContours() Mat dist_8u = new Mat(); dist.convertTo(dist_8u,
CvType.CV_8U); // Find total markers List<MatOfPoint> contours = new ArrayList<>(); Mat hierarchy =
new Mat(); Imgproc.findContours(dist_8u, contours, hierarchy, Imgproc.RETR_EXTERNAL,
Imgproc.CHAIN_APPROX_SIMPLE); // Create the marker image for the watershed algorithm Mat markers =
Mat.zeros(dist.size(), CvType.CV_32S); // Draw the foreground markers for (int i = 0; i <
contours.size(); i++) { Imgproc.drawContours(markers, contours, i, new
[Scalar](https://docs.opencv.org/4.13.0/dc/d84/group__core__basic.html#ga599fe92e910c027be274233eccad7beb)(i +
1), -1); // Draw the background marker Mat markersScaled = new Mat();
markers.convertTo(markersScaled, CvType.CV_32F); Core.normalize(markersScaled, markersScaled, 0.0,
255.0, Core.NORM_MINMAX); Imgproc.circle(markersScaled, new
[Point](https://docs.opencv.org/4.13.0/dc/d84/group__core__basic.html#ga1e83eafb2d26b3c93f09e8338bcab192)(5,
5), 3, new
[Scalar](https://docs.opencv.org/4.13.0/dc/d84/group__core__basic.html#ga599fe92e910c027be274233eccad7beb)(255,
255, 255), -1); Mat markersDisplay = new Mat(); markersScaled.convertTo(markersDisplay,
CvType.CV_8U); HighGui.imshow("Markers", markersDisplay); Imgproc.circle(markers, new
[Point](https://docs.opencv.org/4.13.0/dc/d84/group__core__basic.html#ga1e83eafb2d26b3c93f09e8338bcab192)(5,
5), 3, new
[Scalar](https://docs.opencv.org/4.13.0/dc/d84/group__core__basic.html#ga599fe92e910c027be274233eccad7beb)(255,
255, 255), -1); // Perform the watershed algorithm Imgproc.watershed(imgResult, markers); Mat mark =
Mat.zeros(markers.size(), CvType.CV_8U); markers.convertTo(mark, CvType.CV_8UC1);
Core.bitwise_not(mark, mark); // imshow("Markers_v2", mark); // uncomment this if you want to see
how the mark // image looks like at that point // Generate random colors Random rng = new
Random(12345); List<Scalar> colors = new ArrayList<>(contours.size()); for (int i = 0; i <
contours.size(); i++) { int b = rng.nextInt(256); int g = rng.nextInt(256); int r =
rng.nextInt(256); colors.add(new
[Scalar](https://docs.opencv.org/4.13.0/dc/d84/group__core__basic.html#ga599fe92e910c027be274233eccad7beb)(b,
g, r)); // Create the result image Mat dst = Mat.zeros(markers.size(), CvType.CV_8UC3); byte[]
dstData = new byte[(int) (dst.total() * dst.channels())]; dst.get(0, 0, dstData); // Fill labeled
objects with random colors int[] markersData = new int[(int) (markers.total() *
markers.channels())]; markers.get(0, 0, markersData); for (int i = 0; i < markers.rows(); i++) { for
(int j = 0; j < markers.cols(); j++) { int
[index](https://docs.opencv.org/4.13.0/d9/db7/group__datasets__gr.html#gga82775e152f8a74c5fe06f5a7343e0233a9dfc90ef6dc3ba62850d76cc3534572c)
= markersData[i * markers.cols() + j]; if (index > 0 && index <= contours.size()) { dstData[(i *
dst.cols() + j) * 3 + 0] = (byte) colors.get(index - 1).val[0]; dstData[(i * dst.cols() + j) * 3 +
1] = (byte) colors.get(index - 1).val[1]; dstData[(i * dst.cols() + j) * 3 + 2] = (byte)
colors.get(index - 1).val[2]; } else { dstData[(i * dst.cols() + j) * 3 + 0] = 0; dstData[(i *
dst.cols() + j) * 3 + 1] = 0; dstData[(i * dst.cols() + j) * 3 + 2] = 0; dst.put(0, 0, dstData); //
Visualize the final image HighGui.imshow("Final Result", dst); HighGui.waitKey(); System.exit(0); }
public class ImageSegmentationDemo { public static void
[main](https://docs.opencv.org/4.13.0/dc/d89/highgui__qt_8cpp.html#a0ddf1224851353fc92bfbff6f499fa97)(String[]
args) { // Load the native OpenCV library System.loadLibrary(Core.NATIVE_LIBRARY_NAME); new
ImageSegmentation().run(args); } Point2i Point **Definition** types.hpp:209 Scalar_< double > Scalar
**Definition** types.hpp:709 @ index **Definition** gr_skig.hpp:77 Python This tutorial code's is
shown lines below. You can also download it from
[here](https://github.com/opencv/opencv/tree/4.x/samples/python/tutorial_code/ImgTrans/distance_transformation/imageSegmentation.py)
from **future** import print_function import cv2 as cv import numpy as np import argparse import
random as rng rng.seed(12345) parser = argparse.ArgumentParser(description='Code for Image
Segmentation with Distance Transform and Watershed Algorithm.\
Sample code showing how to segment overlapping objects using Laplacian filtering, \
in addition to Watershed and Distance Transformation') parser.add_argument('--input', help='Path to
input image.', default='cards.png') args = parser.parse_args() src =
[cv.imread](https://docs.opencv.org/4.13.0/d4/da8/group__imgcodecs.html#gaffb68fce322c6e52841d7d9357b9ad2d)([cv.samples.findFile](https://docs.opencv.org/4.13.0/d6/dba/group__core__utils__samples.html#ga3a33b00033b46c698ff6340d95569c13)(args.input))
if src is None: print('Could not open or find the image:', args.input) exit(0)

# Show source image

[cv.imshow](https://docs.opencv.org/4.13.0/d7/dfc/group__highgui.html#ga453d42fe4cb60e5723281a89973ee563)('Source
Image', src) src[np.all(src == 255, axis=2)] = 0

# Show output image

[cv.imshow](https://docs.opencv.org/4.13.0/d7/dfc/group__highgui.html#ga453d42fe4cb60e5723281a89973ee563)('Black Background Image', src)
kernel = np.array([[1, 1, 1], [1, -8, 1], [1, 1, 1]], dtype=np.float32)

# do the laplacian filtering as it is

# well, we need to convert everything in something more deeper then CV_8U

# because the kernel has some negative values,

# and we can expect in general to have a Laplacian image with negative values

# BUT a 8bits unsigned int (the one we are working with) can contain values from 0 to 255

# so the possible negative number will be truncated

imgLaplacian =
[cv.filter2D](https://docs.opencv.org/4.13.0/d4/d86/group__imgproc__filter.html#ga27c049795ce870216ddfb366086b5a04)(src,
cv.CV_32F, kernel) sharp = np.float32(src) imgResult = sharp - imgLaplacian

# convert back to 8bits gray scale

imgResult = np.clip(imgResult, 0, 255) imgResult = imgResult.astype('uint8') imgLaplacian =
np.clip(imgLaplacian, 0, 255) imgLaplacian = np.uint8(imgLaplacian) #cv.imshow('Laplace Filtered
Image', imgLaplacian)
[cv.imshow](https://docs.opencv.org/4.13.0/d7/dfc/group__highgui.html#ga453d42fe4cb60e5723281a89973ee563)('New
Sharped Image', imgResult) bw =
[cv.cvtColor](https://docs.opencv.org/4.13.0/d8/d01/group__imgproc__color__conversions.html#gaf86c09fe702ed037c03c2bc603ceab14)(imgResult,
cv.COLOR_BGR2GRAY) _, bw =
[cv.threshold](https://docs.opencv.org/4.13.0/d7/d1b/group__imgproc__misc.html#gae8a4a146d1ca78c626a53577199e9c57)(bw,
40, 255, cv.THRESH_BINARY | cv.THRESH_OTSU)
[cv.imshow](https://docs.opencv.org/4.13.0/d7/dfc/group__highgui.html#ga453d42fe4cb60e5723281a89973ee563)('Binary
Image', bw) dist =
[cv.distanceTransform](https://docs.opencv.org/4.13.0/d7/d1b/group__imgproc__misc.html#ga8a0b7fdfcb7a13dde018988ba3a43042)(bw,
cv.DIST_L2, 3)

# Normalize the distance image for range = {0.0, 1.0}

# so we can visualize and threshold it

[cv.normalize](https://docs.opencv.org/4.13.0/d2/de8/group__core__array.html#ga87eef7ee3970f86906d69a92cbf064bd)(dist,
dist, 0, 1.0, cv.NORM_MINMAX)
[cv.imshow](https://docs.opencv.org/4.13.0/d7/dfc/group__highgui.html#ga453d42fe4cb60e5723281a89973ee563)('Distance
Transform Image', dist) _, dist =
[cv.threshold](https://docs.opencv.org/4.13.0/d7/d1b/group__imgproc__misc.html#gae8a4a146d1ca78c626a53577199e9c57)(dist,
0.4, 1.0, cv.THRESH_BINARY)

# Dilate a bit the dist image

kernel1 = np.ones((3,3), dtype=np.uint8) dist =
[cv.dilate](https://docs.opencv.org/4.13.0/d4/d86/group__imgproc__filter.html#ga4ff0f3318642c4f469d0e11f242f3b6c)(dist,
kernel1)
[cv.imshow](https://docs.opencv.org/4.13.0/d7/dfc/group__highgui.html#ga453d42fe4cb60e5723281a89973ee563)('Peaks',
dist) dist_8u = dist.astype('uint8')

# Find total markers

contours, _ =
[cv.findContours](https://docs.opencv.org/4.13.0/d3/dc0/group__imgproc__shape.html#gadf1ad6a0b82947fa1fe3c3d497f260e0)(dist_8u,
cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

# Create the marker image for the watershed algorithm

markers = np.zeros(dist.shape, dtype=np.int32)

# Draw the foreground markers

for i in range(len(contours)):
[cv.drawContours](https://docs.opencv.org/4.13.0/d6/d6e/group__imgproc__draw.html#ga746c0625f1781f1ffc9056259103edbc)(markers,
contours, i, (i+1), -1)

# Draw the background marker

[cv.circle](https://docs.opencv.org/4.13.0/d6/d6e/group__imgproc__draw.html#gaf10604b069374903dbd0f0488cb43670)(markers,
(5,5), 3, (255,255,255), -1) markers_8u = (markers * 10).astype('uint8')
[cv.imshow](https://docs.opencv.org/4.13.0/d7/dfc/group__highgui.html#ga453d42fe4cb60e5723281a89973ee563)('Markers',
markers_8u)
[cv.watershed](https://docs.opencv.org/4.13.0/d3/d47/group__imgproc__segmentation.html#ga3267243e4d3f95165d55a618c65ac6e1)(imgResult,
markers) #mark = np.zeros(markers.shape, dtype=np.uint8) mark = markers.astype('uint8') mark =
[cv.bitwise_not](https://docs.opencv.org/4.13.0/d2/de8/group__core__array.html#ga0002cf8b418479f4cb49a75442baee2f)(mark)

# uncomment this if you want to see how the mark

# image looks like at that point

#cv.imshow('Markers_v2', mark)

# Generate random colors

colors = [] for contour in contours: colors.append((rng.randint(0,256), rng.randint(0,256),
rng.randint(0,256)))

# Create the result image

dst = np.zeros((markers.shape[0], markers.shape[1], 3), dtype=np.uint8)

# Fill labeled objects with random colors

for i in range(markers.shape[0]): for j in range(markers.shape[1]): index = markers[i,j] if index >
0 and index <= len(contours): dst[i,j,:] = colors[index-1]

# Visualize the final image

[cv.imshow](https://docs.opencv.org/4.13.0/d7/dfc/group__highgui.html#ga453d42fe4cb60e5723281a89973ee563)('Final
Result', dst) void bitwise_not(InputArray src, OutputArray dst, InputArray mask=noArray()) Inverts
every bit of an array. void normalize(InputArray src, InputOutputArray dst, double alpha=1, double
beta=0, int norm_type=NORM_L2, int dtype=-1, InputArray mask=noArray()) Normalizes the norm or value
range of an array.
[cv::samples::findFile](https://docs.opencv.org/4.13.0/d6/dba/group__core__utils__samples.html#ga3a33b00033b46c698ff6340d95569c13)
cv::String findFile(const cv::String &relative_path, bool required=true, bool silentMode=false) Try
to find requested data file. Mat imread(const String &filename, int flags=IMREAD_COLOR_BGR) Loads an
image from a file. void cvtColor(InputArray src, OutputArray dst, int code, int dstCn=0,
AlgorithmHint hint=cv::ALGO_HINT_DEFAULT) Converts an image from one color space to another. void
drawContours(InputOutputArray image, InputArrayOfArrays contours, int contourIdx, const Scalar
&color, int thickness=1, int lineType=LINE_8, InputArray hierarchy=noArray(), int maxLevel=INT_MAX,
Point offset=Point()) Draws contours outlines or filled contours. void circle(InputOutputArray img,
Point center, int radius, const Scalar &color, int thickness=1, int lineType=LINE_8, int shift=0)
Draws a circle. void filter2D(InputArray src, OutputArray dst, int ddepth, InputArray kernel, Point
anchor=Point(-1,-1), double delta=0, int borderType=BORDER_DEFAULT) Convolves an image with the
kernel. void dilate(InputArray src, OutputArray dst, InputArray kernel, Point anchor=Point(-1,-1),
int iterations=1, int borderType=BORDER_CONSTANT, const Scalar
&borderValue=morphologyDefaultBorderValue()) Dilates an image by using a specific structuring
element.
[cv::distanceTransform](https://docs.opencv.org/4.13.0/d7/d1b/group__imgproc__misc.html#ga8a0b7fdfcb7a13dde018988ba3a43042)
void distanceTransform(InputArray src, OutputArray dst, OutputArray labels, int distanceType, int
maskSize, int labelType=DIST_LABEL_CCOMP) Calculates the distance to the closest zero pixel for each
pixel of the source image. double threshold(InputArray src, OutputArray dst, double thresh, double
maxval, int type) Applies a fixed-level threshold to each array element. void watershed(InputArray
image, InputOutputArray markers) Performs a marker-based image segmentation using the watershed
algorithm. void findContours(InputArray image, OutputArrayOfArrays contours, OutputArray hierarchy,
int mode, int method, Point offset=Point()) Finds contours in a binary image.

# Explanation / ResultC++JavaPython

- Load the source image and check if it is loaded without any problem, then show it:

C++ // Load the image
[CommandLineParser](https://docs.opencv.org/4.13.0/d0/d2e/classcv_1_1CommandLineParser.html) parser(
argc, argv, "{@input | cards.png | input image}" );
[Mat](https://docs.opencv.org/4.13.0/d3/d63/classcv_1_1Mat.html) src =
[imread](https://docs.opencv.org/4.13.0/d4/da8/group__imgcodecs.html#gaffb68fce322c6e52841d7d9357b9ad2d)(
samples::findFile(
parser.get<[String](https://docs.opencv.org/4.13.0/dc/d84/group__core__basic.html#ga1f6634802eeadfd7245bc75cf3e216c2)>(
"@input" ) ) ); if(
src.[empty](https://docs.opencv.org/4.13.0/d3/d63/classcv_1_1Mat.html#abbec3525a852e77998aba034813fded4)()
) cout << "Could not open or find the image!\n" << endl; cout << "Usage: " << argv[0] << "
<Input image>" << endl; return -1; // Show the source image
[imshow](https://docs.opencv.org/4.13.0/d7/dfc/group__highgui.html#ga453d42fe4cb60e5723281a89973ee563)("Source
Image", src); Java // Load the image
[String](https://docs.opencv.org/4.13.0/dc/d84/group__core__basic.html#ga1f6634802eeadfd7245bc75cf3e216c2)
filename = args.length > 0 ? args[0] : "../data/cards.png"; Mat srcOriginal =
Imgcodecs.imread(filename); if (srcOriginal.empty()) { System.err.println("Cannot read image: " +
filename); System.exit(0); // Show source image HighGui.imshow("Source Image", srcOriginal); Python
parser = argparse.ArgumentParser(description='Code for Image Segmentation with Distance Transform
and Watershed Algorithm.\
Sample code showing how to segment overlapping objects using Laplacian filtering, \
in addition to Watershed and Distance Transformation') parser.add_argument('--input', help='Path to
input image.', default='cards.png') args = parser.parse_args() src =
[cv.imread](https://docs.opencv.org/4.13.0/d4/da8/group__imgcodecs.html#gaffb68fce322c6e52841d7d9357b9ad2d)([cv.samples.findFile](https://docs.opencv.org/4.13.0/d6/dba/group__core__utils__samples.html#ga3a33b00033b46c698ff6340d95569c13)(args.input))
if src is None: print('Could not open or find the image:', args.input) exit(0)

# Show source image

[cv.imshow](https://docs.opencv.org/4.13.0/d7/dfc/group__highgui.html#ga453d42fe4cb60e5723281a89973ee563)('Source
Image', src)

- Then if we have an image with a white background, it is good to transform it to black. This will
  help us to discriminate the foreground objects easier when we will apply the Distance Transform:

C++ // Change the background from white to black, since that will help later to extract // better
results during the use of Distance Transform
[inRange](https://docs.opencv.org/4.13.0/d2/de8/group__core__array.html#ga48af0ab51e36436c5d04340e036ce981)(src,
[Scalar](https://docs.opencv.org/4.13.0/d1/da0/classcv_1_1Scalar__.html)(255, 255, 255),
[Scalar](https://docs.opencv.org/4.13.0/d1/da0/classcv_1_1Scalar__.html)(255, 255, 255), mask);
src.[setTo](https://docs.opencv.org/4.13.0/d3/d63/classcv_1_1Mat.html#a030678ffd9ca6e12127b3fd1337bf6e2)([Scalar](https://docs.opencv.org/4.13.0/d1/da0/classcv_1_1Scalar__.html)(0,
0, 0), mask); // Show output image
[imshow](https://docs.opencv.org/4.13.0/d7/dfc/group__highgui.html#ga453d42fe4cb60e5723281a89973ee563)("Black
Background Image", src); Java // Change the background from white to black, since that will help
later to // extract // better results during the use of Distance Transform Mat src =
srcOriginal.clone(); byte[] srcData = new byte[(int) (src.total() * src.channels())]; src.get(0, 0,
srcData); for (int i = 0; i < src.rows(); i++) { for (int j = 0; j < src.cols(); j++) { if
(srcData[(i * src.cols() + j) * 3] == (byte) 255 && srcData[(i * src.cols() + j) * 3 + 1] == (byte)
255 && srcData[(i * src.cols() + j) * 3 + 2] == (byte) 255) { srcData[(i * src.cols() + j) * 3] = 0;
srcData[(i * src.cols() + j) * 3 + 1] = 0; srcData[(i * src.cols() + j) * 3 + 2] = 0; src.put(0, 0,
srcData); // Show output image HighGui.imshow("Black Background Image", src); Python src[np.all(src
== 255, axis=2)] = 0

# Show output image

[cv.imshow](https://docs.opencv.org/4.13.0/d7/dfc/group__highgui.html#ga453d42fe4cb60e5723281a89973ee563)('Black
Background Image', src)

- Afterwards we will sharpen our image in order to acute the edges of the foreground objects. We
  will apply a laplacian filter with a quite strong filter (an approximation of second derivative):

C++
// Create a kernel that we will use to sharpen our image
[Mat](https://docs.opencv.org/4.13.0/d3/d63/classcv_1_1Mat.html) kernel = ([Mat_<float>](https://docs.opencv.org/4.13.0/df/dfc/classcv_1_1Mat__.html)(3,3) <<
1, 1, 1,
1, -8, 1,
1, 1, 1); // an approximation of second derivative, a quite strong kernel
// do the laplacian filtering as it is
// well, we need to convert everything in something more deeper then CV_8U
// because the kernel has some negative values,
// and we can expect in general to have a Laplacian image with negative values
// BUT a 8bits unsigned int (the one we are working with) can contain values from 0 to 255
// so the possible negative number will be truncated
[Mat](https://docs.opencv.org/4.13.0/d3/d63/classcv_1_1Mat.html) imgLaplacian;
[filter2D](https://docs.opencv.org/4.13.0/d4/d86/group__imgproc__filter.html#ga27c049795ce870216ddfb366086b5a04)(src, imgLaplacian, [CV_32F](https://docs.opencv.org/4.13.0/d1/d1b/group__core__hal__interface.html#ga4a3def5d72b74bed31f5f8ab7676099c), kernel);
[Mat](https://docs.opencv.org/4.13.0/d3/d63/classcv_1_1Mat.html) sharp;
src.[convertTo](https://docs.opencv.org/4.13.0/d3/d63/classcv_1_1Mat.html#adf88c60c5b4980e05bb556080916978b)(sharp, [CV_32F](https://docs.opencv.org/4.13.0/d1/d1b/group__core__hal__interface.html#ga4a3def5d72b74bed31f5f8ab7676099c));
[Mat](https://docs.opencv.org/4.13.0/d3/d63/classcv_1_1Mat.html) imgResult = sharp - imgLaplacian;
// convert back to 8bits gray scale
imgResult.[convertTo](https://docs.opencv.org/4.13.0/d3/d63/classcv_1_1Mat.html#adf88c60c5b4980e05bb556080916978b)(imgResult, [CV_8UC3](https://docs.opencv.org/4.13.0/d1/d1b/group__core__hal__interface.html#ga88c4cd9de76f678f33928ef1e3f96047));
imgLaplacian.convertTo(imgLaplacian, [CV_8UC3](https://docs.opencv.org/4.13.0/d1/d1b/group__core__hal__interface.html#ga88c4cd9de76f678f33928ef1e3f96047));
// imshow( "Laplace Filtered Image", imgLaplacian );
[imshow](https://docs.opencv.org/4.13.0/d7/dfc/group__highgui.html#ga453d42fe4cb60e5723281a89973ee563)( "New Sharped Image", imgResult );
Java
// Create a kernel that we will use to sharpen our image
Mat kernel = new Mat(3, 3, CvType.CV_32F);
// an approximation of second derivative, a quite strong kernel
float[] kernelData = new float[(int) (kernel.total() * kernel.channels())];
kernelData[0] = 1; kernelData[1] = 1; kernelData[2] = 1;
kernelData[3] = 1; kernelData[4] = -8; kernelData[5] = 1;
kernelData[6] = 1; kernelData[7] = 1; kernelData[8] = 1;
kernel.put(0, 0, kernelData);
// do the laplacian filtering as it is
// well, we need to convert everything in something more deeper then CV_8U
// because the kernel has some negative values,
// and we can expect in general to have a Laplacian image with negative values
// BUT a 8bits unsigned int (the one we are working with) can contain values
// from 0 to 255
// so the possible negative number will be truncated
Mat imgLaplacian = new Mat();
Imgproc.filter2D(src, imgLaplacian, CvType.CV_32F, kernel);
Mat sharp = new Mat();
src.convertTo(sharp, CvType.CV_32F);
Mat imgResult = new Mat();
Core.subtract(sharp, imgLaplacian, imgResult);
// convert back to 8bits gray scale
imgResult.convertTo(imgResult, CvType.CV_8UC3);
imgLaplacian.convertTo(imgLaplacian, CvType.CV_8UC3);
// imshow( "Laplace Filtered Image", imgLaplacian );
HighGui.imshow("New Sharped Image", imgResult);
Python
kernel = np.array([[1, 1, 1], [1, -8, 1], [1, 1, 1]], dtype=np.float32)

# do the laplacian filtering as it is

# well, we need to convert everything in something more deeper then CV_8U

# because the kernel has some negative values,

# and we can expect in general to have a Laplacian image with negative values

# BUT a 8bits unsigned int (the one we are working with) can contain values from 0 to 255

# so the possible negative number will be truncated

imgLaplacian =
[cv.filter2D](https://docs.opencv.org/4.13.0/d4/d86/group__imgproc__filter.html#ga27c049795ce870216ddfb366086b5a04)(src,
cv.CV_32F, kernel) sharp = np.float32(src) imgResult = sharp - imgLaplacian

# convert back to 8bits gray scale

imgResult = np.clip(imgResult, 0, 255) imgResult = imgResult.astype('uint8') imgLaplacian =
np.clip(imgLaplacian, 0, 255) imgLaplacian = np.uint8(imgLaplacian) #cv.imshow('Laplace Filtered
Image', imgLaplacian)
[cv.imshow](https://docs.opencv.org/4.13.0/d7/dfc/group__highgui.html#ga453d42fe4cb60e5723281a89973ee563)('New
Sharped Image', imgResult)

- Now we transform our new sharpened source image to a grayscale and a binary one, respectively:

C++ // Create binary image from source image
[cvtColor](https://docs.opencv.org/4.13.0/d8/d01/group__imgproc__color__conversions.html#gaf86c09fe702ed037c03c2bc603ceab14)(imgResult,
bw, COLOR_BGR2GRAY);
[threshold](https://docs.opencv.org/4.13.0/d7/d1b/group__imgproc__misc.html#gae8a4a146d1ca78c626a53577199e9c57)(bw,
bw, 40, 255, THRESH_BINARY | THRESH_OTSU);
[imshow](https://docs.opencv.org/4.13.0/d7/dfc/group__highgui.html#ga453d42fe4cb60e5723281a89973ee563)("Binary
Image", bw); Java // Create binary image from source image Mat bw = new Mat();
Imgproc.cvtColor(imgResult, bw, Imgproc.COLOR_BGR2GRAY); Imgproc.threshold(bw, bw, 40, 255,
Imgproc.THRESH_BINARY | Imgproc.THRESH_OTSU); HighGui.imshow("Binary Image", bw); Python bw =
[cv.cvtColor](https://docs.opencv.org/4.13.0/d8/d01/group__imgproc__color__conversions.html#gaf86c09fe702ed037c03c2bc603ceab14)(imgResult,
cv.COLOR_BGR2GRAY) _, bw =
[cv.threshold](https://docs.opencv.org/4.13.0/d7/d1b/group__imgproc__misc.html#gae8a4a146d1ca78c626a53577199e9c57)(bw,
40, 255, cv.THRESH_BINARY | cv.THRESH_OTSU)
[cv.imshow](https://docs.opencv.org/4.13.0/d7/dfc/group__highgui.html#ga453d42fe4cb60e5723281a89973ee563)('Binary
Image', bw)

- We are ready now to apply the Distance Transform on the binary image. Moreover, we normalize the
  output image in order to be able visualize and threshold the result:

C++ // Perform the distance transform algorithm
[Mat](https://docs.opencv.org/4.13.0/d3/d63/classcv_1_1Mat.html) dist;
[distanceTransform](https://docs.opencv.org/4.13.0/d7/d1b/group__imgproc__misc.html#ga8a0b7fdfcb7a13dde018988ba3a43042)(bw,
dist, DIST_L2, 3); // Normalize the distance image for range = {0.0, 1.0} // so we can visualize and
threshold it
[normalize](https://docs.opencv.org/4.13.0/d2/de8/group__core__array.html#ga87eef7ee3970f86906d69a92cbf064bd)(dist,
dist, 0, 1.0, NORM_MINMAX);
[imshow](https://docs.opencv.org/4.13.0/d7/dfc/group__highgui.html#ga453d42fe4cb60e5723281a89973ee563)("Distance
Transform Image", dist); Java // Perform the distance transform algorithm Mat dist = new Mat();
Imgproc.distanceTransform(bw, dist, Imgproc.DIST_L2, 3); // Normalize the distance image for range =
{0.0, 1.0} // so we can visualize and threshold it Core.normalize(dist, dist, 0.0, 1.0,
Core.NORM_MINMAX); Mat distDisplayScaled = new Mat(); Core.multiply(dist, new
[Scalar](https://docs.opencv.org/4.13.0/dc/d84/group__core__basic.html#ga599fe92e910c027be274233eccad7beb)(255),
distDisplayScaled); Mat distDisplay = new Mat(); distDisplayScaled.convertTo(distDisplay,
CvType.CV_8U); HighGui.imshow("Distance Transform Image", distDisplay); Python dist =
[cv.distanceTransform](https://docs.opencv.org/4.13.0/d7/d1b/group__imgproc__misc.html#ga8a0b7fdfcb7a13dde018988ba3a43042)(bw,
cv.DIST_L2, 3)

# Normalize the distance image for range = {0.0, 1.0}

# so we can visualize and threshold it

[cv.normalize](https://docs.opencv.org/4.13.0/d2/de8/group__core__array.html#ga87eef7ee3970f86906d69a92cbf064bd)(dist,
dist, 0, 1.0, cv.NORM_MINMAX)
[cv.imshow](https://docs.opencv.org/4.13.0/d7/dfc/group__highgui.html#ga453d42fe4cb60e5723281a89973ee563)('Distance
Transform Image', dist)

- We threshold the _dist_ image and then perform some morphology operation (i.e. dilation) in order
  to extract the peaks from the above image:

C++ // Threshold to obtain the peaks // This will be the markers for the foreground objects
[threshold](https://docs.opencv.org/4.13.0/d7/d1b/group__imgproc__misc.html#gae8a4a146d1ca78c626a53577199e9c57)(dist,
dist, 0.4, 1.0, THRESH_BINARY); // Dilate a bit the dist image
[Mat](https://docs.opencv.org/4.13.0/d3/d63/classcv_1_1Mat.html) kernel1 = Mat::ones(3, 3,
[CV_8U](https://docs.opencv.org/4.13.0/d1/d1b/group__core__hal__interface.html#ga32b18d904ee2b1731a9416a8eef67d06));
[dilate](https://docs.opencv.org/4.13.0/d4/d86/group__imgproc__filter.html#ga4ff0f3318642c4f469d0e11f242f3b6c)(dist,
dist, kernel1);
[imshow](https://docs.opencv.org/4.13.0/d7/dfc/group__highgui.html#ga453d42fe4cb60e5723281a89973ee563)("Peaks",
dist); Java // Threshold to obtain the peaks // This will be the markers for the foreground objects
Imgproc.threshold(dist, dist, 0.4, 1.0, Imgproc.THRESH_BINARY); // Dilate a bit the dist image Mat
kernel1 = Mat.ones(3, 3, CvType.CV_8U); Imgproc.dilate(dist, dist, kernel1); Mat distDisplay2 = new
Mat(); dist.convertTo(distDisplay2, CvType.CV_8U); Core.multiply(distDisplay2, new
[Scalar](https://docs.opencv.org/4.13.0/dc/d84/group__core__basic.html#ga599fe92e910c027be274233eccad7beb)(255),
distDisplay2); HighGui.imshow("Peaks", distDisplay2); Python _, dist =
[cv.threshold](https://docs.opencv.org/4.13.0/d7/d1b/group__imgproc__misc.html#gae8a4a146d1ca78c626a53577199e9c57)(dist,
0.4, 1.0, cv.THRESH_BINARY)

# Dilate a bit the dist image

kernel1 = np.ones((3,3), dtype=np.uint8) dist =
[cv.dilate](https://docs.opencv.org/4.13.0/d4/d86/group__imgproc__filter.html#ga4ff0f3318642c4f469d0e11f242f3b6c)(dist,
kernel1)
[cv.imshow](https://docs.opencv.org/4.13.0/d7/dfc/group__highgui.html#ga453d42fe4cb60e5723281a89973ee563)('Peaks',
dist)

- From each blob then we create a seed/marker for the watershed algorithm with the help of the
  [cv::findContours](https://docs.opencv.org/4.13.0/d3/dc0/group__imgproc__shape.html#gadf1ad6a0b82947fa1fe3c3d497f260e0)
  function:

C++ // Create the CV_8U version of the distance image // It is needed for findContours()
[Mat](https://docs.opencv.org/4.13.0/d3/d63/classcv_1_1Mat.html) dist_8u;
dist.[convertTo](https://docs.opencv.org/4.13.0/d3/d63/classcv_1_1Mat.html#adf88c60c5b4980e05bb556080916978b)(dist_8u,
[CV_8U](https://docs.opencv.org/4.13.0/d1/d1b/group__core__hal__interface.html#ga32b18d904ee2b1731a9416a8eef67d06));
// Find total markers vector<vector<Point> > contours;
[findContours](https://docs.opencv.org/4.13.0/d3/dc0/group__imgproc__shape.html#gadf1ad6a0b82947fa1fe3c3d497f260e0)(dist_8u,
contours, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE); // Create the marker image for the watershed
algorithm [Mat](https://docs.opencv.org/4.13.0/d3/d63/classcv_1_1Mat.html) markers =
Mat::zeros(dist.[size](https://docs.opencv.org/4.13.0/d3/d63/classcv_1_1Mat.html#a146f8e8dda07d1365a575ab83d9828d1)(),
[CV_32S](https://docs.opencv.org/4.13.0/d1/d1b/group__core__hal__interface.html#ga4067910fc388075c3ea3aa14393e83b9));
// Draw the foreground markers for (size_t i = 0; i < contours.size(); i++)
[drawContours](https://docs.opencv.org/4.13.0/d6/d6e/group__imgproc__draw.html#ga746c0625f1781f1ffc9056259103edbc)(markers,
contours, static_cast<int(i),
[Scalar](https://docs.opencv.org/4.13.0/d1/da0/classcv_1_1Scalar__.html)(static_cast<int(i)+1), -1);
// Draw the background marker
[circle](https://docs.opencv.org/4.13.0/d9/db7/group__datasets__gr.html#gga610754124ced68d1f05760b5948fbb76a6f0d8b2d9e3e947b2a5c1eff9e81ee95)(markers,
[Point](https://docs.opencv.org/4.13.0/db/d4e/classcv_1_1Point__.html)(5,5), 3,
[Scalar](https://docs.opencv.org/4.13.0/d1/da0/classcv_1_1Scalar__.html)(255), -1);
[Mat](https://docs.opencv.org/4.13.0/d3/d63/classcv_1_1Mat.html) markers8u;
markers.[convertTo](https://docs.opencv.org/4.13.0/d3/d63/classcv_1_1Mat.html#adf88c60c5b4980e05bb556080916978b)(markers8u,
[CV_8U](https://docs.opencv.org/4.13.0/d1/d1b/group__core__hal__interface.html#ga32b18d904ee2b1731a9416a8eef67d06),
10);
[imshow](https://docs.opencv.org/4.13.0/d7/dfc/group__highgui.html#ga453d42fe4cb60e5723281a89973ee563)("Markers",
markers8u); Java // Create the CV_8U version of the distance image // It is needed for
findContours() Mat dist_8u = new Mat(); dist.convertTo(dist_8u, CvType.CV_8U); // Find total markers
List<MatOfPoint> contours = new ArrayList<>(); Mat hierarchy = new Mat();
Imgproc.findContours(dist_8u, contours, hierarchy, Imgproc.RETR_EXTERNAL,
Imgproc.CHAIN_APPROX_SIMPLE); // Create the marker image for the watershed algorithm Mat markers =
Mat.zeros(dist.size(), CvType.CV_32S); // Draw the foreground markers for (int i = 0; i <
contours.size(); i++) { Imgproc.drawContours(markers, contours, i, new
[Scalar](https://docs.opencv.org/4.13.0/dc/d84/group__core__basic.html#ga599fe92e910c027be274233eccad7beb)(i +
1), -1); // Draw the background marker Mat markersScaled = new Mat();
markers.convertTo(markersScaled, CvType.CV_32F); Core.normalize(markersScaled, markersScaled, 0.0,
255.0, Core.NORM_MINMAX); Imgproc.circle(markersScaled, new
[Point](https://docs.opencv.org/4.13.0/dc/d84/group__core__basic.html#ga1e83eafb2d26b3c93f09e8338bcab192)(5,
5), 3, new
[Scalar](https://docs.opencv.org/4.13.0/dc/d84/group__core__basic.html#ga599fe92e910c027be274233eccad7beb)(255,
255, 255), -1); Mat markersDisplay = new Mat(); markersScaled.convertTo(markersDisplay,
CvType.CV_8U); HighGui.imshow("Markers", markersDisplay); Imgproc.circle(markers, new
[Point](https://docs.opencv.org/4.13.0/dc/d84/group__core__basic.html#ga1e83eafb2d26b3c93f09e8338bcab192)(5,
5), 3, new
[Scalar](https://docs.opencv.org/4.13.0/dc/d84/group__core__basic.html#ga599fe92e910c027be274233eccad7beb)(255,
255, 255), -1); Python dist_8u = dist.astype('uint8')

# Find total markers

contours, _ =
[cv.findContours](https://docs.opencv.org/4.13.0/d3/dc0/group__imgproc__shape.html#gadf1ad6a0b82947fa1fe3c3d497f260e0)(dist_8u,
cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

# Create the marker image for the watershed algorithm

markers = np.zeros(dist.shape, dtype=np.int32)

# Draw the foreground markers

for i in range(len(contours)):
[cv.drawContours](https://docs.opencv.org/4.13.0/d6/d6e/group__imgproc__draw.html#ga746c0625f1781f1ffc9056259103edbc)(markers,
contours, i, (i+1), -1)

# Draw the background marker

[cv.circle](https://docs.opencv.org/4.13.0/d6/d6e/group__imgproc__draw.html#gaf10604b069374903dbd0f0488cb43670)(markers,
(5,5), 3, (255,255,255), -1) markers_8u = (markers * 10).astype('uint8')
[cv.imshow](https://docs.opencv.org/4.13.0/d7/dfc/group__highgui.html#ga453d42fe4cb60e5723281a89973ee563)('Markers',
markers_8u)

- Finally, we can apply the watershed algorithm, and visualize the result:

C++ // Perform the watershed algorithm [watershed](https://docs.opencv.org/4.13.0/d3/d47/group__imgproc__segmentation.html#ga3267243e4d3f95165d55a618c65ac6e1)(imgResult,
markers); [Mat](https://docs.opencv.org/4.13.0/d3/d63/classcv_1_1Mat.html) mark; markers.[convertTo](https://docs.opencv.org/4.13.0/d3/d63/classcv_1_1Mat.html#adf88c60c5b4980e05bb556080916978b)(mark,
[CV_8U](https://docs.opencv.org/4.13.0/d1/d1b/group__core__hal__interface.html#ga32b18d904ee2b1731a9416a8eef67d06));
[bitwise_not](https://docs.opencv.org/4.13.0/d2/de8/group__core__array.html#ga0002cf8b418479f4cb49a75442baee2f)(mark,
mark); // imshow("Markers_v2", mark); // uncomment this if you want to see how the mark // image
looks like at that point // Generate random colors vector<Vec3b> colors; for (size_t i = 0; i <
contours.size(); i++) int b = [theRNG](https://docs.opencv.org/4.13.0/d2/de8/group__core__array.html#ga3161a635d36203f92adadec67b29c2a3)().[uniform](https://docs.opencv.org/4.13.0/d1/dd6/classcv_1_1RNG.html#acde197860cea91e5aa896be8719457ae)(0,
256); int g = [theRNG](https://docs.opencv.org/4.13.0/d2/de8/group__core__array.html#ga3161a635d36203f92adadec67b29c2a3)().[uniform](https://docs.opencv.org/4.13.0/d1/dd6/classcv_1_1RNG.html#acde197860cea91e5aa896be8719457ae)(0,
256); int r = [theRNG](https://docs.opencv.org/4.13.0/d2/de8/group__core__array.html#ga3161a635d36203f92adadec67b29c2a3)().[uniform](https://docs.opencv.org/4.13.0/d1/dd6/classcv_1_1RNG.html#acde197860cea91e5aa896be8719457ae)(0,
256); colors.push_back([Vec3b](https://docs.opencv.org/4.13.0/d6/dcf/classcv_1_1Vec.html)(([uchar](https://docs.opencv.org/4.13.0/d1/d1b/group__core__hal__interface.html#ga65f85814a8290f9797005d3b28e7e5fc))b,
([uchar](https://docs.opencv.org/4.13.0/d1/d1b/group__core__hal__interface.html#ga65f85814a8290f9797005d3b28e7e5fc))g,
([uchar](https://docs.opencv.org/4.13.0/d1/d1b/group__core__hal__interface.html#ga65f85814a8290f9797005d3b28e7e5fc))r));
// Create the result image [Mat](https://docs.opencv.org/4.13.0/d3/d63/classcv_1_1Mat.html) dst =
Mat::zeros(markers.[size](https://docs.opencv.org/4.13.0/d3/d63/classcv_1_1Mat.html#a146f8e8dda07d1365a575ab83d9828d1)(),
[CV_8UC3](https://docs.opencv.org/4.13.0/d1/d1b/group__core__hal__interface.html#ga88c4cd9de76f678f33928ef1e3f96047));
// Fill labeled objects with random colors for (int i = 0; i < markers.[rows](https://docs.opencv.org/4.13.0/d3/d63/classcv_1_1Mat.html#abed816466c45234254d25bc59c31245e);
i++) for (int j = 0; j < markers.[cols](https://docs.opencv.org/4.13.0/d3/d63/classcv_1_1Mat.html#aa3e5a47585c9ef6a0842556739155e3e);
j++) int [index](https://docs.opencv.org/4.13.0/d9/db7/group__datasets__gr.html#gga82775e152f8a74c5fe06f5a7343e0233a9dfc90ef6dc3ba62850d76cc3534572c)
=

markers.[at](https://docs.opencv.org/4.13.0/d3/d63/classcv_1_1Mat.html#aa10d804e90b51d4157b5c26e12c5d2df)<int>(i,j);
if (index > 0 && index <= static_cast<int(contours.size()))
dst.[at](https://docs.opencv.org/4.13.0/d3/d63/classcv_1_1Mat.html#aa10d804e90b51d4157b5c26e12c5d2df)<[Vec3b](https://docs.opencv.org/4.13.0/d6/dcf/classcv_1_1Vec.html)>(i,j)
= colors[index-1]; // Visualize the final image
[imshow](https://docs.opencv.org/4.13.0/d7/dfc/group__highgui.html#ga453d42fe4cb60e5723281a89973ee563)("Final
Result", dst); Java // Perform the watershed algorithm Imgproc.watershed(imgResult, markers); Mat
mark = Mat.zeros(markers.size(), CvType.CV_8U); markers.convertTo(mark, CvType.CV_8UC1);
Core.bitwise_not(mark, mark); // imshow("Markers_v2", mark); // uncomment this if you want to see
how the mark // image looks like at that point // Generate random colors Random rng = new
Random(12345); List<Scalar> colors = new ArrayList<>(contours.size()); for (int i = 0; i <
contours.size(); i++) { int b = rng.nextInt(256); int g = rng.nextInt(256); int r =
rng.nextInt(256); colors.add(new
[Scalar](https://docs.opencv.org/4.13.0/dc/d84/group__core__basic.html#ga599fe92e910c027be274233eccad7beb)(b,
g, r)); // Create the result image Mat dst = Mat.zeros(markers.size(), CvType.CV_8UC3); byte[]
dstData = new byte[(int) (dst.total() * dst.channels())]; dst.get(0, 0, dstData); // Fill labeled
objects with random colors int[] markersData = new int[(int) (markers.total() *
markers.channels())]; markers.get(0, 0, markersData); for (int i = 0; i < markers.rows(); i++) { for
(int j = 0; j < markers.cols(); j++) { int
[index](https://docs.opencv.org/4.13.0/d9/db7/group__datasets__gr.html#gga82775e152f8a74c5fe06f5a7343e0233a9dfc90ef6dc3ba62850d76cc3534572c)
= markersData[i * markers.cols() + j]; if (index > 0 && index <= contours.size()) { dstData[(i *
dst.cols() + j) * 3 + 0] = (byte) colors.get(index - 1).val[0]; dstData[(i * dst.cols() + j) * 3 +
1] = (byte) colors.get(index - 1).val[1]; dstData[(i * dst.cols() + j) * 3 + 2] = (byte)
colors.get(index - 1).val[2]; } else { dstData[(i * dst.cols() + j) * 3 + 0] = 0; dstData[(i *
dst.cols() + j) * 3 + 1] = 0; dstData[(i * dst.cols() + j) * 3 + 2] = 0; dst.put(0, 0, dstData); //
Visualize the final image HighGui.imshow("Final Result", dst); Python
[cv.watershed](https://docs.opencv.org/4.13.0/d3/d47/group__imgproc__segmentation.html#ga3267243e4d3f95165d55a618c65ac6e1)(imgResult,
markers) #mark = np.zeros(markers.shape, dtype=np.uint8) mark = markers.astype('uint8') mark =
[cv.bitwise_not](https://docs.opencv.org/4.13.0/d2/de8/group__core__array.html#ga0002cf8b418479f4cb49a75442baee2f)(mark)

# uncomment this if you want to see how the mark

# image looks like at that point

#cv.imshow('Markers_v2', mark)

# Generate random colors

colors = [] for contour in contours: colors.append((rng.randint(0,256), rng.randint(0,256),
rng.randint(0,256)))

# Create the result image

dst = np.zeros((markers.shape[0], markers.shape[1], 3), dtype=np.uint8)

# Fill labeled objects with random colors

for i in range(markers.shape[0]): for j in range(markers.shape[1]): index = markers[i,j] if index >
0 and index <= len(contours): dst[i,j,:] = colors[index-1]

# Visualize the final image

[cv.imshow](https://docs.opencv.org/4.13.0/d7/dfc/group__highgui.html#ga453d42fe4cb60e5723281a89973ee563)('Final
Result', dst) Generated on Wed Dec 31 2025 07:26:21 for OpenCV by 1.12.0
