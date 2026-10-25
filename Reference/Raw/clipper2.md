[**1** Branch](https://github.com/AngusJohnson/Clipper2/branches)[](https://github.com/AngusJohnson/Clipper2/tags)
Go to file
Open more actions menu
success
Oct 17, 2026
[a6e7294](https://github.com/AngusJohnson/Clipper2/commit/a6e7294703ae329576462f9471b356971f53010d) · Oct 17, 2026
[819 Commits](https://github.com/AngusJohnson/Clipper2/commits/main/)
Open commit details
819 Commits  
| Name  | Name  | Last commit message  | Last commit date  |  
| --- | --- | --- | --- |  
| [.github/workflows](https://github.com/AngusJohnson/Clipper2/tree/main/.github/workflows "This path skips through empty directories")  | [.github/workflows](https://github.com/AngusJohnson/Clipper2/tree/main/.github/workflows "This path skips through empty directories")  | [Updated C# CI to .NET 8.0.](https://github.com/AngusJohnson/Clipper2/commit/77f5f63244cf955e58f52eb34d52002968b21edf "Updated C# CI to .NET 8.0.")  | Feb 22, 2026  |  
|  [Fix linking to](https://github.com/AngusJohnson/Clipper2/commit/c324e7bdcb021ada9d74f91da034bc499de5861c "Fix linking to `m.lib` on Windows \(#1080\)

We separate configuring warnings and linking to the math library. This way, it works for clang on Windows when using Microsoft's standard library.") [on Windows (](https://github.com/AngusJohnson/Clipper2/commit/c324e7bdcb021ada9d74f91da034bc499de5861c "Fix linking to `m.lib` on Windows \(#1080\)

We separate configuring warnings and linking to the math library. This way, it works for clang on Windows when using Microsoft's standard library.")[#1080](https://github.com/AngusJohnson/Clipper2/pull/1080)[)](https://github.com/AngusJohnson/Clipper2/commit/c324e7bdcb021ada9d74f91da034bc499de5861c "Fix linking to `m.lib` on Windows \(#1080\)

We separate configuring warnings and linking to the math library. This way, it works for clang on Windows when using Microsoft's standard library.")  | Mar 20, 2026  |  
|   |   |  [fix project path for C# tests, add readme on tests (](https://github.com/AngusJohnson/Clipper2/commit/642390d0d515cfb645d2ec4d95d218e28be645f4 "fix project path for C# tests, add readme on tests \(#1082\)")[#1082](https://github.com/AngusJohnson/Clipper2/pull/1082)[)](https://github.com/AngusJohnson/Clipper2/commit/642390d0d515cfb645d2ec4d95d218e28be645f4 "fix project path for C# tests, add readme on tests \(#1082\)")  | Mar 20, 2026  |  
| [clipper.export.h: added exported Triangulate functions](https://github.com/AngusJohnson/Clipper2/commit/21ebba05db8894f0c7217ad35ea518080f324946 "clipper.export.h: added exported Triangulate functions
plus significant update to DLL test applications")  | Dec 19, 2025  |  
|   |   |  [Fixed a bug in ClipperBase::FixSelfIntersects (](https://github.com/AngusJohnson/Clipper2/commit/4da1564fb1ae69ad14b334a677c0e34a88aa8e7a "Fixed a  bug in ClipperBase::FixSelfIntersects \(#1067\)
Fixed a bug in Clipper.pas \(Delphi only\) re. left to right evaluation of if statements \(#1061\)
Replaced throw statements with DoError function. \(C++ only; #1068\)")[#1067](https://github.com/AngusJohnson/Clipper2/issues/1067)[)](https://github.com/AngusJohnson/Clipper2/commit/4da1564fb1ae69ad14b334a677c0e34a88aa8e7a "Fixed a  bug in ClipperBase::FixSelfIntersects \(#1067\)
Fixed a bug in Clipper.pas \(Delphi only\) re. left to right evaluation of if statements \(#1061\)
Replaced throw statements with DoError function. \(C++ only; #1068\)")  | Feb 22, 2026  |  
|   |   |   | Feb 6, 2023  |  
|   |   | [C# refactored Path64, Paths64, PathD & PathsD to derived List classes](https://github.com/AngusJohnson/Clipper2/commit/5f34747aca3d7a485fd436daeaac538fb7cfff12 "C# refactored Path64, Paths64, PathD & PathsD to derived List classes
Updated framework to .NET5.0")  | Sep 16, 2022  |  
|   |   | [Make googletest not be a git submodule, and instead clone it separate…](https://github.com/AngusJohnson/Clipper2/commit/69e00c6cf9c4afa16e378c7b7aebf453c7d443ba "Make googletest not be a git submodule, and instead clone it separately in the CI script \(#745\)")  | Dec 9, 2023  |  
|   |   |   | Feb 23, 2022  |  
|   |   |   | Oct 17, 2026  |  
| View all files |  
# Clipper2
## [Why there haven’t been any updates in the last 6 months](https://github.com/AngusJohnson/Clipper2/discussions/1118)
### A Polygon [Clipping](https://en.wikipedia.org/wiki/Clipping_\(computer_graphics\)), [Offsetting](https://en.wikipedia.org/wiki/Parallel_curve) library (in C++, C# & Delphi) 
The **Clipper2** library performs **intersection** , **union** , **difference** and **XOR** boolean operations on both simple and complex polygons. It also performs **polygon offsetting**. This is a major update of my original [**Clipper**](https://sourceforge.net/projects/polyclipping/) library that was written about 15 years ago. That library I'm now calling **Clipper1** , and while it still works very well, Clipper2 is just [better](https://www.angusj.com/clipper2/Docs/Changes.htm).
### Compilers
**Clipper2** can be compiled using any one of three supported programming languages: C++, or C#, or Delphi Pascal. The library can also be accessed from other languages by dynamically linking to exported functions in the [C++ compiled Clipper2 library](https://github.com/AngusJohnson/Clipper2/tree/main/DLL). (The C++ compiled code is [measurably](https://www.angusj.com/clipper2/Docs/Changes.htm) faster so, where performance is critical, even C# and Delphi developers may prefer this approach in application development.)  
| Lang.  | Requirements  |  
| --- | --- |  
| Requires C++17, **or**  |  
| The library uses Standard Library 2.0 but the sample code uses .NET6, **or**  |  
| Compiles with any version of Delphi from version 7 to current.  |  
### Documentation
[**Extensive HTML documentation**](https://www.angusj.com/clipper2/Docs/Overview.htm)
### Examples
**Clipping**
**C++**
[Clipper2/CPP/Examples/SimpleClipping/SimpleClipping.cpp](https://github.com/AngusJohnson/Clipper2/blob/fa7add77364eb3877dd1b8caf9b3cbd5486347f6/CPP/Examples/SimpleClipping/SimpleClipping.cpp#L29-L34)
Lines 29 to 34 in [fa7add7](https://github.com/AngusJohnson/Clipper2/commit/fa7add77364eb3877dd1b8caf9b3cbd5486347f6)  
|  // intersect a star and another modestly rotated star  |  
| --- |  
|  Paths64 subject, clip, solution;   |  
|  subject.push_back({ MakePath({200,100, 20,158, 130,4, 130,196, 20,42}) });   |  
|  clip.push_back({ MakePath({196,126, 8,136, 154,16, 104,200, 38,24}) });   |  
|  solution = Intersect(subject, clip, FillRule::NonZero);   |  
|  DisplayAsSvgImage("Intersect Paths", FillRule::NonZero, subject, clip, solution);   |  
**C#**
[Clipper2/CSharp/Clipper2Lib.Examples/ConsoleDemo/Main.cs](https://github.com/AngusJohnson/Clipper2/blob/fa7add77364eb3877dd1b8caf9b3cbd5486347f6/CSharp/Clipper2Lib.Examples/ConsoleDemo/Main.cs#L112-L116)
Lines 112 to 116 in [fa7add7](https://github.com/AngusJohnson/Clipper2/commit/fa7add77364eb3877dd1b8caf9b3cbd5486347f6)  
|  const FillRule fillrule = FillRule.NonZero;  |  
| --- |  
|  Paths64 subject = new() { Clipper.MakePath(new int[] { 200, 100, 20, 158, 130, 4, 130, 196, 20, 42 }) };  |  
|  Paths64 clip = new() { Clipper.MakePath(new int[] { 196, 126, 8, 136, 154, 16, 104, 200, 38, 24 }) };  |  
|  Paths64 solution = Clipper.Intersect(subject, clip, fillrule);  |  
|  DisplayAsSvgImage("Intersect", fillrule, subject, clip, solution);  |  
**Delphi**
[Clipper2/Delphi/Examples/Example1/Example1.dpr](https://github.com/AngusJohnson/Clipper2/blob/fa7add77364eb3877dd1b8caf9b3cbd5486347f6/Delphi/Examples/Example1/Example1.dpr#L21-L26)
Lines 21 to 26 in [fa7add7](https://github.com/AngusJohnson/Clipper2/commit/fa7add77364eb3877dd1b8caf9b3cbd5486347f6)  
|  SetLength(subj, 1);   |  
| --- |  
|  subj[0] := MakePathD([200,100, 20,158, 130,4, 130,196, 20,42]);   |  
|  SetLength(clip, 1);   |  
|  clip[0] := MakePathD([196,126, 8,136, 154,16, 104,200, 38,24]);   |  
|  solution := Intersect( subj, clip, frNonZero);   |  
|  DisplayAsSvg('Intersect (nonzero)', frNonZero, subj, clip, solution);   |  
**Inflating (aka Offsetting)**
**C++**
[Clipper2/CPP/Examples/Inflate/Inflate.cpp](https://github.com/AngusJohnson/Clipper2/blob/fa7add77364eb3877dd1b8caf9b3cbd5486347f6/CPP/Examples/Inflate/Inflate.cpp#L36-L47)
Lines 36 to 47 in [fa7add7](https://github.com/AngusJohnson/Clipper2/commit/fa7add77364eb3877dd1b8caf9b3cbd5486347f6)  
|  SvgReader svg_reader("./rabbit.svg");   |  
| --- |  
|  PathsD p = svg_reader.paths;   |  
|  PathsD solution(p);   |  
|  while (p.size())   |  
|  p = InflatePaths(p, -5, JoinType::Round, EndType::Polygon);   |  
|  // SimplifyPaths is not essential but is **highly recommended**  |  
|  // because it speeds up the loop by removing tiny artefacts  |  
|  p = SimplifyPaths(p, 0.25);   |  
|  copy(p.begin(), p.end(), back_inserter(solution));   |  
|  DisplayAsSvgImage("rabbit_offset", FillRule::EvenOdd, nullptr, nullptr, &solution);   |  
**C#**
[Clipper2/CSharp/Clipper2Lib.Examples/InflateDemo/Main.cs](https://github.com/AngusJohnson/Clipper2/blob/fa7add77364eb3877dd1b8caf9b3cbd5486347f6/CSharp/Clipper2Lib.Examples/InflateDemo/Main.cs#L89-L100)
Lines 89 to 100 in [fa7add7](https://github.com/AngusJohnson/Clipper2/commit/fa7add77364eb3877dd1b8caf9b3cbd5486347f6)  
|  SvgReader sr = new("..\\\..\\\..\\\rabbit.svg");  |  
| --- |  
|  PathsD pp = sr.Paths;  |  
|  PathsD solution = new (pp);  |  
|  while (pp.Count 0)  |  
|  pp = Clipper.InflatePaths(pp, -5, JoinType.Round, EndType.Polygon);  |  
|  // SimplifyPaths - is recommended here as it removes tiny   |  
|  // offsetting artefacts and speeds up this while loop  |  
|  pp = Clipper.SimplifyPaths(pp, 0.25);  |  
|  solution.AddRange(pp);  |  
|  DisplaySolutionAsSvg("..\\\..\\\..\\\rabbit_inflate.svg", solution);  |  
**Delphi**
[Clipper2/Delphi/Examples/Example2/Example2.dpr](https://github.com/AngusJohnson/Clipper2/blob/fa7add77364eb3877dd1b8caf9b3cbd5486347f6/Delphi/Examples/Example2/Example2.dpr#L20-L31)
Lines 20 to 31 in [fa7add7](https://github.com/AngusJohnson/Clipper2/commit/fa7add77364eb3877dd1b8caf9b3cbd5486347f6)  
|  sol := GetPathsFromVerySimpleSVG('rabbit.svg');   |  
| --- |  
|  sol := SimplifyPaths(sol, 0.25);   |  
|  p := sol;   |  
|  while (Length(p) > 0) do  |  
|  begin  |  
|  p := InflatePaths(p, -5, jtRound, etPolygon);   |  
|  // SimplifyPaths is not essential but is **highly recommended**  |  
|  // because it speeds up the loop by removing tiny artefacts  |  
|  p := SimplifyPaths(p, 0.25);   |  
|  AppendPaths(sol, p);   |  
|  DisplayAsSvg('DeflatedRabbit', frEvenOdd, sol, nil, sol, true);   |  
### Ports to other languages  
| lang.  | link  |  
| --- | --- |  
| **golang**  | <https://github.com/epit3d/goclipper2>  |  
| **Haxe**  | <https://github.com/jeremyfa/Clipper2/tree/main/Haxe>  |  
| **Java**  | <https://github.com/micycle1/Clipper2-java/>  |  
| **Kotlin**  | <https://github.com/Monkey-Maestro/clipper2-kotlin>  |  
| **Lua**  | <https://github.com/Ark223/Clipper2-Lua>  |  
| **Rust**  | <https://github.com/larsbrubaker/clipper2-rust>  |  
| **Swift**  | <https://github.com/zyunlongz/clipper2-swift>  |  
| **TypeScript**  | <https://github.com/countertype/clipper2-ts>  |  
| **WASM**  | <https://github.com/ErikSom/Clipper2-WASM/>  |  
## About
Polygon Clipping, Offsetting & Triangulation in C++, C# and Delphi
[algorithm](https://github.com/topics/algorithm)[boolean-operations](https://github.com/topics/boolean-operations)[clipping](https://github.com/topics/clipping)[clipping-algorithm](https://github.com/topics/clipping-algorithm)[cpp](https://github.com/topics/cpp)[csharp](https://github.com/topics/csharp)[delphi](https://github.com/topics/delphi)[geometry](https://github.com/topics/geometry)[inflate](https://github.com/topics/inflate)[offsetting](https://github.com/topics/offsetting)[pascal](https://github.com/topics/pascal)[polygon](https://github.com/topics/polygon)[polygon-boolean](https://github.com/topics/polygon-boolean)[polygon-clipping](https://github.com/topics/polygon-clipping)[polygon-clipping-algorithm](https://github.com/topics/polygon-clipping-algorithm)[polygon-intersection](https://github.com/topics/polygon-intersection)[polygon-union](https://github.com/topics/polygon-union)
**2.5k** stars
**59** watching
[ forks](https://github.com/AngusJohnson/Clipper2/forks)
## 
[ Clipper2 ver. 2.0.1Latest Dec 19, 2025 ](https://github.com/AngusJohnson/Clipper2/releases/tag/Clipper2_2.0.1)
## 
## Languages
  * [C++37.1%](https://github.com/AngusJohnson/Clipper2/search?l=c%2B%2B)
  * [Pascal33%](https://github.com/AngusJohnson/Clipper2/search?l=pascal)
  * [C#28.6%](https://github.com/AngusJohnson/Clipper2/search?l=c%23)
  * [CMake1.2%](https://github.com/AngusJohnson/Clipper2/search?l=cmake)
  * [C0.1%](https://github.com/AngusJohnson/Clipper2/search?l=c)


You can’t perform that action at this time. 
