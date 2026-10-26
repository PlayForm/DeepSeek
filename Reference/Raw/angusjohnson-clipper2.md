# Clipper2


## [Why there haven’t been any updates in the last 6 months](https://github.com/AngusJohnson/Clipper2/discussions/1118)

[](#why-there-havent-been-any-updates-in-the-last-6-months)\

### A Polygon [Clipping](https://en.wikipedia.org/wiki/Clipping_(computer_graphics)), [Offsetting](https://en.wikipedia.org/wiki/Parallel_curve) library (in C++, C# & Delphi)\


[![GitHub Actions C++ status](https://github.com/AngusJohnson/Clipper2/actions/workflows/actions_cpp.yml/badge.svg)](https://github.com/AngusJohnson/Clipper2/actions/workflows/actions_cpp.yml) [![C#](https://github.com/AngusJohnson/Clipper2/actions/workflows/actions_csharp.yml/badge.svg)](https://github.com/AngusJohnson/Clipper2/actions/workflows/actions_csharp.yml) [![License](https://camo.githubusercontent.com/2e59bcdc79f349e3405740ea3f93ffd0e794724c58737e32f9b408455a435883/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f4c6963656e73652d426f6f73745f312e302d6c69676874626c75652e737667)](https://www.boost.org/LICENSE_1_0.txt) [![Nuget](https://camo.githubusercontent.com/896b01c38835b0b0bd909f058eca95e43c98161d577e3d7387d624b815bfb9cd/68747470733a2f2f696d672e736869656c64732e696f2f6e756765742f762f436c6970706572323f636f6c6f723d677265656e)](https://www.nuget.org/packages/Clipper2) [![documentation](https://user-images.githubusercontent.com/5280692/187832279-b2a43890-da80-4888-95fe-793f092be372.svg)](https://www.angusj.com/clipper2/Docs/Overview.htm)

The **Clipper2** library performs **intersection**, **union**, **difference** and **XOR** boolean operations on both simple and complex polygons. It also performs **polygon offsetting**. This is a major update of my original [**Clipper**](https://sourceforge.net/projects/polyclipping/) library that was written about 15 years ago. That library I'm now calling **Clipper1**, and while it still works very well, Clipper2 is just [better](https://www.angusj.com/clipper2/Docs/Changes.htm).

### Compilers


**Clipper2** can be compiled using any one of three supported programming languages: C++, or C#, or Delphi Pascal. The library can also be accessed from other languages by dynamically linking to exported functions in the [C++ compiled Clipper2 library](https://github.com/AngusJohnson/Clipper2/tree/main/DLL). (The C++ compiled code is [measurably](https://www.angusj.com/clipper2/Docs/Changes.htm) faster so, where performance is critical, even C# and Delphi developers may prefer this approach in application development.)

| Lang. | Requirements |
|----|----|
| [**C++:**](https://github.com/AngusJohnson/Clipper2/tree/main/CPP) | Requires C++17, **or** |
| [**C#:**](https://github.com/AngusJohnson/Clipper2/tree/main/CSharp) | The library uses Standard Library 2.0 but the sample code uses .NET6, **or** |
| [**Delphi:**](https://github.com/AngusJohnson/Clipper2/tree/main/Delphi) | Compiles with any version of Delphi from version 7 to current. |

### Documentation


[**Extensive HTML documentation**](https://www.angusj.com/clipper2/Docs/Overview.htm)\
\

### Examples


**Clipping**

**C++**

[Clipper2/CPP/Examples/SimpleClipping/SimpleClipping.cpp](https://github.com/AngusJohnson/Clipper2/blob/fa7add77364eb3877dd1b8caf9b3cbd5486347f6/CPP/Examples/SimpleClipping/SimpleClipping.cpp#L29-L34)

Lines 29 to 34 in fa7add7

|  |  |
|----|----|
|  | // intersect a star and another modestly rotated star |
|  | Paths64 subject, clip, solution; |
|  | subject.push_back({ MakePath({200,100, 20,158, 130,4, 130,196, 20,42}) }); |
|  | clip.push_back({ MakePath({196,126, 8,136, 154,16, 104,200, 38,24}) }); |
|  | solution = Intersect(subject, clip, FillRule::NonZero); |
|  | DisplayAsSvgImage("Intersect Paths", FillRule::NonZero, subject, clip, solution); |

**C#**

[Clipper2/CSharp/Clipper2Lib.Examples/ConsoleDemo/Main.cs](https://github.com/AngusJohnson/Clipper2/blob/fa7add77364eb3877dd1b8caf9b3cbd5486347f6/CSharp/Clipper2Lib.Examples/ConsoleDemo/Main.cs#L112-L116)

Lines 112 to 116 in fa7add7

|  |  |
|----|----|
|  | const FillRule fillrule = FillRule.NonZero; |
|  | Paths64 subject = new() { Clipper.MakePath(new int\[\] { 200, 100, 20, 158, 130, 4, 130, 196, 20, 42 }) }; |
|  | Paths64 clip = new() { Clipper.MakePath(new int\[\] { 196, 126, 8, 136, 154, 16, 104, 200, 38, 24 }) }; |
|  | Paths64 solution = Clipper.Intersect(subject, clip, fillrule); |
|  | DisplayAsSvgImage("Intersect", fillrule, subject, clip, solution); |

**Delphi**

[Clipper2/Delphi/Examples/Example1/Example1.dpr](https://github.com/AngusJohnson/Clipper2/blob/fa7add77364eb3877dd1b8caf9b3cbd5486347f6/Delphi/Examples/Example1/Example1.dpr#L21-L26)

Lines 21 to 26 in fa7add7

|     |                                                                       |
|-----|-----------------------------------------------------------------------|
|     | SetLength(subj, 1);                                                   |
|     | subj\[0\] := MakePathD(\[200,100, 20,158, 130,4, 130,196, 20,42\]);   |
|     | SetLength(clip, 1);                                                   |
|     | clip\[0\] := MakePathD(\[196,126, 8,136, 154,16, 104,200, 38,24\]);   |
|     | solution := Intersect( subj, clip, frNonZero);                        |
|     | DisplayAsSvg('Intersect (nonzero)', frNonZero, subj, clip, solution); |

[![clipperB](https://user-images.githubusercontent.com/5280692/178123810-1719a1f5-25c3-4a9e-b419-e575ff056272.svg)](https://user-images.githubusercontent.com/5280692/178123810-1719a1f5-25c3-4a9e-b419-e575ff056272.svg)

**Inflating (aka Offsetting)**

**C++**

[Clipper2/CPP/Examples/Inflate/Inflate.cpp](https://github.com/AngusJohnson/Clipper2/blob/fa7add77364eb3877dd1b8caf9b3cbd5486347f6/CPP/Examples/Inflate/Inflate.cpp#L36-L47)

Lines 36 to 47 in fa7add7

|  |  |
|----|----|
|  | SvgReader svg_reader("./rabbit.svg"); |
|  | PathsD p = svg_reader.paths; |
|  | PathsD solution(p); |
|  | while (p.size()) |
|  | { |
|  | p = InflatePaths(p, -5, JoinType::Round, EndType::Polygon); |
|  | // SimplifyPaths is not essential but is \*\*highly recommended\*\* |
|  | // because it speeds up the loop by removing tiny artefacts |
|  | p = SimplifyPaths(p, 0.25); |
|  | copy(p.begin(), p.end(), back_inserter(solution)); |
|  | } |
|  | DisplayAsSvgImage("rabbit_offset", FillRule::EvenOdd, nullptr, nullptr, &solution); |

**C#**

[Clipper2/CSharp/Clipper2Lib.Examples/InflateDemo/Main.cs](https://github.com/AngusJohnson/Clipper2/blob/fa7add77364eb3877dd1b8caf9b3cbd5486347f6/CSharp/Clipper2Lib.Examples/InflateDemo/Main.cs#L89-L100)

Lines 89 to 100 in fa7add7

|  |  |
|----|----|
|  | SvgReader sr = new("..\\\\..\\\\..\\\rabbit.svg"); |
|  | PathsD pp = sr.Paths; |
|  | PathsD solution = new (pp); |
|  | while (pp.Count \> 0) |
|  | { |
|  | pp = Clipper.InflatePaths(pp, -5, JoinType.Round, EndType.Polygon); |
|  | // SimplifyPaths - is recommended here as it removes tiny |
|  | // offsetting artefacts and speeds up this while loop |
|  | pp = Clipper.SimplifyPaths(pp, 0.25); |
|  | solution.AddRange(pp); |
|  | } |
|  | DisplaySolutionAsSvg("..\\\\..\\\\..\\\rabbit_inflate.svg", solution); |

**Delphi**

[Clipper2/Delphi/Examples/Example2/Example2.dpr](https://github.com/AngusJohnson/Clipper2/blob/fa7add77364eb3877dd1b8caf9b3cbd5486347f6/Delphi/Examples/Example2/Example2.dpr#L20-L31)

Lines 20 to 31 in fa7add7

|     |                                                                     |
|-----|---------------------------------------------------------------------|
|     | sol := GetPathsFromVerySimpleSVG('rabbit.svg');                     |
|     | sol := SimplifyPaths(sol, 0.25);                                    |
|     | p := sol;                                                           |
|     | while (Length(p) \> 0) do                                           |
|     | begin                                                               |
|     | p := InflatePaths(p, -5, jtRound, etPolygon);                       |
|     | // SimplifyPaths is not essential but is \*\*highly recommended\*\* |
|     | // because it speeds up the loop by removing tiny artefacts         |
|     | p := SimplifyPaths(p, 0.25);                                        |
|     | AppendPaths(sol, p);                                                |
|     | end;                                                                |
|     | DisplayAsSvg('DeflatedRabbit', frEvenOdd, sol, nil, sol, true);     |

[![rabbit](https://private-user-images.githubusercontent.com/5280692/527284042-a0f2f43c-f0a3-45ec-887d-d9ca34256088.svg?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3OTMwMjE3OTAsIm5iZiI6MTc5MzAyMTQ5MCwicGF0aCI6Ii81MjgwNjkyLzUyNzI4NDA0Mi1hMGYyZjQzYy1mMGEzLTQ1ZWMtODg3ZC1kOWNhMzQyNTYwODguc3ZnP1gtQW16LUFsZ29yaXRobT1BV1M0LUhNQUMtU0hBMjU2JlgtQW16LUNyZWRlbnRpYWw9QUtJQVZDT0RZTFNBNTNQUUs0WkElMkYyMDI2MTAyNiUyRnVzLWVhc3QtMSUyRnMzJTJGYXdzNF9yZXF1ZXN0JlgtQW16LURhdGU9MjAyNjEwMjZUMTMzMTMwWiZYLUFtei1FeHBpcmVzPTMwMCZYLUFtei1TaWduYXR1cmU9MGE0MmQyMTFhMDM4Y2YyMWRhNTM2ZmRlNTViY2YzMTVlOWU0OWU3N2NhZjhlYjU2ZWE2NTJhZTM1OTZkMWZiZiZYLUFtei1TaWduZWRIZWFkZXJzPWhvc3QmcmVzcG9uc2UtY29udGVudC10eXBlPWltYWdlJTJGc3ZnJTJCeG1sIn0.xmSYtAWi8mo_v4EpwlPilJDLIvDKyCWLyfq-hnYN0n8)](https://private-user-images.githubusercontent.com/5280692/527284042-a0f2f43c-f0a3-45ec-887d-d9ca34256088.svg?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3OTMwMjE3OTAsIm5iZiI6MTc5MzAyMTQ5MCwicGF0aCI6Ii81MjgwNjkyLzUyNzI4NDA0Mi1hMGYyZjQzYy1mMGEzLTQ1ZWMtODg3ZC1kOWNhMzQyNTYwODguc3ZnP1gtQW16LUFsZ29yaXRobT1BV1M0LUhNQUMtU0hBMjU2JlgtQW16LUNyZWRlbnRpYWw9QUtJQVZDT0RZTFNBNTNQUUs0WkElMkYyMDI2MTAyNiUyRnVzLWVhc3QtMSUyRnMzJTJGYXdzNF9yZXF1ZXN0JlgtQW16LURhdGU9MjAyNjEwMjZUMTMzMTMwWiZYLUFtei1FeHBpcmVzPTMwMCZYLUFtei1TaWduYXR1cmU9MGE0MmQyMTFhMDM4Y2YyMWRhNTM2ZmRlNTViY2YzMTVlOWU0OWU3N2NhZjhlYjU2ZWE2NTJhZTM1OTZkMWZiZiZYLUFtei1TaWduZWRIZWFkZXJzPWhvc3QmcmVzcG9uc2UtY29udGVudC10eXBlPWltYWdlJTJGc3ZnJTJCeG1sIn0.xmSYtAWi8mo_v4EpwlPilJDLIvDKyCWLyfq-hnYN0n8) [![rabbit_offset](https://private-user-images.githubusercontent.com/5280692/526880086-ca05688e-293f-4596-86ab-df529694e778.SVG?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3OTMwMjE3OTAsIm5iZiI6MTc5MzAyMTQ5MCwicGF0aCI6Ii81MjgwNjkyLzUyNjg4MDA4Ni1jYTA1Njg4ZS0yOTNmLTQ1OTYtODZhYi1kZjUyOTY5NGU3NzguU1ZHP1gtQW16LUFsZ29yaXRobT1BV1M0LUhNQUMtU0hBMjU2JlgtQW16LUNyZWRlbnRpYWw9QUtJQVZDT0RZTFNBNTNQUUs0WkElMkYyMDI2MTAyNiUyRnVzLWVhc3QtMSUyRnMzJTJGYXdzNF9yZXF1ZXN0JlgtQW16LURhdGU9MjAyNjEwMjZUMTMzMTMwWiZYLUFtei1FeHBpcmVzPTMwMCZYLUFtei1TaWduYXR1cmU9YjU5YjEzYWUwOTljY2YzNzQ2ZGUwZThkMzA0NzIxNTViNzZjZDAzYjAxYjQwMDk5Yzc1MzgxZDUxODJiZDM0YSZYLUFtei1TaWduZWRIZWFkZXJzPWhvc3QmcmVzcG9uc2UtY29udGVudC10eXBlPWltYWdlJTJGc3ZnJTJCeG1sIn0.blGQ9BWiybsQ0beusLjIX2VnhPwBu8ZsOOLKDIa6cD8)](https://private-user-images.githubusercontent.com/5280692/526880086-ca05688e-293f-4596-86ab-df529694e778.SVG?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3OTMwMjE3OTAsIm5iZiI6MTc5MzAyMTQ5MCwicGF0aCI6Ii81MjgwNjkyLzUyNjg4MDA4Ni1jYTA1Njg4ZS0yOTNmLTQ1OTYtODZhYi1kZjUyOTY5NGU3NzguU1ZHP1gtQW16LUFsZ29yaXRobT1BV1M0LUhNQUMtU0hBMjU2JlgtQW16LUNyZWRlbnRpYWw9QUtJQVZDT0RZTFNBNTNQUUs0WkElMkYyMDI2MTAyNiUyRnVzLWVhc3QtMSUyRnMzJTJGYXdzNF9yZXF1ZXN0JlgtQW16LURhdGU9MjAyNjEwMjZUMTMzMTMwWiZYLUFtei1FeHBpcmVzPTMwMCZYLUFtei1TaWduYXR1cmU9YjU5YjEzYWUwOTljY2YzNzQ2ZGUwZThkMzA0NzIxNTViNzZjZDAzYjAxYjQwMDk5Yzc1MzgxZDUxODJiZDM0YSZYLUFtei1TaWduZWRIZWFkZXJzPWhvc3QmcmVzcG9uc2UtY29udGVudC10eXBlPWltYWdlJTJGc3ZnJTJCeG1sIn0.blGQ9BWiybsQ0beusLjIX2VnhPwBu8ZsOOLKDIa6cD8)

------------------------------------------------------------------------

### Ports to other languages


| lang.          | link                                                  |
|----------------|-------------------------------------------------------|
| **golang**     | <https://github.com/epit3d/goclipper2>                |
| **Haxe**       | <https://github.com/jeremyfa/Clipper2/tree/main/Haxe> |
| **Java**       | <https://github.com/micycle1/Clipper2-java/>          |
| **Kotlin**     | <https://github.com/Monkey-Maestro/clipper2-kotlin>   |
| **Lua**        | <https://github.com/Ark223/Clipper2-Lua>              |
| **Rust**       | <https://github.com/larsbrubaker/clipper2-rust>       |
| **Swift**      | <https://github.com/zyunlongz/clipper2-swift>         |
| **TypeScript** | <https://github.com/countertype/clipper2-ts>          |
| **WASM**       | <https://github.com/ErikSom/Clipper2-WASM/>           |

<!--
## Source links

- / - source: `/`
- Sign in - source: `/login?return_to=https%3A%2F%2Fgithub.com%2FAngusJohnson%2FClipper2`
- [GitHub Copilot Write better code with AI](https://github.com/features/copilot)
- [GitHub Copilot app Direct agents from issue to merge](https://github.com/features/ai/github-app)
- [MCP Registry Integrate external tools](https://github.com/mcp)
- [Actions Automate any workflow](https://github.com/features/actions)
- [Codespaces Instant dev environments](https://github.com/features/codespaces)
- [Issues Plan and track work](https://github.com/features/issues)
- [Code Review Manage code changes](https://github.com/features/code-review)
- [Code Quality Enforce quality at merge](https://github.com/features/code-quality)
- [GitHub Advanced Security Find and fix vulnerabilities](https://github.com/security/advanced-security)
- [Code security Secure your code as you build](https://github.com/security/advanced-security/code-security)
- [Secret protection Stop leaks before they start](https://github.com/security/advanced-security/secret-protection)
- [Why GitHub](https://github.com/why-github)
- [Documentation](https://docs.github.com)
- [Blog](https://github.blog)
- [Changelog](https://github.blog/changelog)
- [Marketplace](https://github.com/marketplace)
- [View all features](https://github.com/features)
- [Enterprises](https://github.com/enterprise)
- [Small and medium teams](https://github.com/team)
- [Startups](https://github.com/enterprise/startups)
- [Nonprofits](https://github.com/solutions/industry/nonprofits)
- [App Modernization](https://github.com/solutions/use-case/app-modernization)
- [DevSecOps](https://github.com/solutions/use-case/devsecops)
- [DevOps](https://github.com/solutions/use-case/devops)
- [CI/CD](https://github.com/solutions/use-case/ci-cd)
- [View all use cases](https://github.com/solutions/use-case)
- [Healthcare](https://github.com/solutions/industry/healthcare)
- [Financial services](https://github.com/solutions/industry/financial-services)
- [Manufacturing](https://github.com/solutions/industry/manufacturing)
- [Government](https://github.com/solutions/industry/government)
- [See all industries](https://github.com/solutions/industry)
- [View all solutions](https://github.com/solutions)
- [AI](https://github.com/resources/articles?topic=ai)
- [Software Development](https://github.com/resources/articles?topic=software-development)
- [DevOps](https://github.com/resources/articles?topic=devops)
- [Security](https://github.com/resources/articles?topic=security)
- [View all topics](https://github.com/resources/articles)
- [Customer stories](https://github.com/customer-stories)
- [Events & webinars](https://github.com/resources/events)
- [Ebooks & reports](https://github.com/resources/whitepapers)
- [Business insights](https://github.com/solutions/executive-insights)
- [GitHub Skills](https://skills.github.com)
- [Customer support](https://support.github.com)
- [Community forum](https://github.com/orgs/community/discussions)
- [Trust center](https://github.com/trust-center)
- [Partners](https://github.com/partners)
- [View all resources](https://github.com/resources)
- [GitHub Sponsors Fund open source developers](https://github.com/open-source/sponsors)
- [Security Lab](https://securitylab.github.com)
- [Maintainer Community](https://maintainers.github.com)
- [GitHub Stars](https://stars.github.com)
- [Archive Program](https://archiveprogram.github.com)
- [Topics](https://github.com/topics)
- [Trending](https://github.com/trending)
- [Collections](https://github.com/collections)
- [Copilot for Business Enterprise-grade AI features](https://github.com/features/copilot/copilot-business)
- [Premium Support Enterprise-grade 24/7 support](https://github.com/enterprise/premium-support)
- [Pricing](https://github.com/pricing)
- Sign up - source: `/signup?ref_cta=Sign+up&ref_loc=header+logged+out&ref_page=%2F%3Cuser-name%3E%2F%3Crepo-name%3E&source=header-repo&source_repo=AngusJohnson%2FClipper2`
- AngusJohnson - source: `/AngusJohnson`
- Clipper2 - source: `/AngusJohnson/Clipper2`
- Issues 22 - source: `/AngusJohnson/Clipper2/issues`
- Pull requests 16 - source: `/AngusJohnson/Clipper2/pulls`
- Discussions - source: `/AngusJohnson/Clipper2/discussions`
- Actions - source: `/AngusJohnson/Clipper2/actions`
- Security and quality - source: `/AngusJohnson/Clipper2/security`
- Insights - source: `/AngusJohnson/Clipper2/pulse`
- Notifications - source: `/login?return_to=%2FAngusJohnson%2FClipper2`
- algorithm - source: `/topics/algorithm`
- boolean-operations - source: `/topics/boolean-operations`
- clipping - source: `/topics/clipping`
- clipping-algorithm - source: `/topics/clipping-algorithm`
- cpp - source: `/topics/cpp`
- csharp - source: `/topics/csharp`
- delphi - source: `/topics/delphi`
- geometry - source: `/topics/geometry`
- inflate - source: `/topics/inflate`
- offsetting - source: `/topics/offsetting`
- pascal - source: `/topics/pascal`
- polygon - source: `/topics/polygon`
- polygon-boolean - source: `/topics/polygon-boolean`
- polygon-clipping - source: `/topics/polygon-clipping`
- polygon-clipping-algorithm - source: `/topics/polygon-clipping-algorithm`
- polygon-intersection - source: `/topics/polygon-intersection`
- polygon-union - source: `/topics/polygon-union`
- Activity - source: `/AngusJohnson/Clipper2/activity`
- 464 forks - source: `/AngusJohnson/Clipper2/forks`
- Report repository - source: `/contact/report-content?content_url=https%3A%2F%2Fgithub.com%2FAngusJohnson%2FClipper2&report=AngusJohnson+%28user%29`
- 1 Branch - source: `/AngusJohnson/Clipper2/branches`
- 25 Tags - source: `/AngusJohnson/Clipper2/tags`
- AngusJohnson - source: `/AngusJohnson/Clipper2/commits?author=AngusJohnson`
- Update README.md - source: `/AngusJohnson/Clipper2/commit/a6e7294703ae329576462f9471b356971f53010d`
- 819 Commits - source: `/AngusJohnson/Clipper2/commits/main/`
- .github/ workflows - source: `/AngusJohnson/Clipper2/tree/main/.github/workflows`
- Updated C# CI to .NET 8.0. - source: `/AngusJohnson/Clipper2/commit/77f5f63244cf955e58f52eb34d52002968b21edf`
- CPP - source: `/AngusJohnson/Clipper2/tree/main/CPP`
- Fix linking to - source: `/AngusJohnson/Clipper2/commit/c324e7bdcb021ada9d74f91da034bc499de5861c`
- [#1080](https://github.com/AngusJohnson/Clipper2/pull/1080)
- CSharp - source: `/AngusJohnson/Clipper2/tree/main/CSharp`
- fix project path for C# tests, add readme on tests ( - source: `/AngusJohnson/Clipper2/commit/642390d0d515cfb645d2ec4d95d218e28be645f4`
- [#1082](https://github.com/AngusJohnson/Clipper2/pull/1082)
- DLL - source: `/AngusJohnson/Clipper2/tree/main/DLL`
- clipper.export.h: added exported Triangulate functions - source: `/AngusJohnson/Clipper2/commit/21ebba05db8894f0c7217ad35ea518080f324946`
- Delphi - source: `/AngusJohnson/Clipper2/tree/main/Delphi`
- Fixed a bug in ClipperBase::FixSelfIntersects ( - source: `/AngusJohnson/Clipper2/commit/4da1564fb1ae69ad14b334a677c0e34a88aa8e7a`
- [#1067](https://github.com/AngusJohnson/Clipper2/issues/1067)
- Tests - source: `/AngusJohnson/Clipper2/tree/main/Tests`
- Tweaks to C++CI tests - source: `/AngusJohnson/Clipper2/commit/aefa104d134eeb228f5031df70cdefb14144bf8b`
- .gitignore - source: `/AngusJohnson/Clipper2/blob/main/.gitignore`
- C# refactored Path64, Paths64, PathD & PathsD to derived List classes - source: `/AngusJohnson/Clipper2/commit/5f34747aca3d7a485fd436daeaac538fb7cfff12`
- .gitmodules - source: `/AngusJohnson/Clipper2/blob/main/.gitmodules`
- Make googletest not be a git submodule, and instead clone it separate… - source: `/AngusJohnson/Clipper2/commit/69e00c6cf9c4afa16e378c7b7aebf453c7d443ba`
- LICENSE - source: `/AngusJohnson/Clipper2/blob/main/LICENSE`
- Initial commit - source: `/AngusJohnson/Clipper2/commit/8ded82c20e83c5aa8f19a9e3dbfd29d6574d3d15`
- README.md - source: `/AngusJohnson/Clipper2/blob/main/README.md`
- [Why there haven’t been any updates in the last 6 months](https://github.com/AngusJohnson/Clipper2/discussions/1118)
- [Clipping](https://en.wikipedia.org/wiki/Clipping_(computer_graphics))
- [Offsetting](https://en.wikipedia.org/wiki/Parallel_curve)
- [https://github.com/AngusJohnson/Clipper2/actions/workflows/actions_cpp.yml](https://github.com/AngusJohnson/Clipper2/actions/workflows/actions_cpp.yml)
- [https://github.com/AngusJohnson/Clipper2/actions/workflows/actions_csharp.yml](https://github.com/AngusJohnson/Clipper2/actions/workflows/actions_csharp.yml)
- [https://www.boost.org/LICENSE_1_0.txt](https://www.boost.org/LICENSE_1_0.txt)
- [https://www.nuget.org/packages/Clipper2](https://www.nuget.org/packages/Clipper2)
- [https://www.angusj.com/clipper2/Docs/Overview.htm](https://www.angusj.com/clipper2/Docs/Overview.htm)
- [Clipper](https://sourceforge.net/projects/polyclipping/)
- [better](https://www.angusj.com/clipper2/Docs/Changes.htm)
- [C++ compiled Clipper2 library](https://github.com/AngusJohnson/Clipper2/tree/main/DLL)
- [C++:](https://github.com/AngusJohnson/Clipper2/tree/main/CPP)
- [C#:](https://github.com/AngusJohnson/Clipper2/tree/main/CSharp)
- [Delphi:](https://github.com/AngusJohnson/Clipper2/tree/main/Delphi)
- [Clipper2/CPP/Examples/SimpleClipping/SimpleClipping.cpp](https://github.com/AngusJohnson/Clipper2/blob/fa7add77364eb3877dd1b8caf9b3cbd5486347f6/CPP/Examples/SimpleClipping/SimpleClipping.cpp#L29-L34)
- fa7add7 - source: `/AngusJohnson/Clipper2/commit/fa7add77364eb3877dd1b8caf9b3cbd5486347f6`
- [Clipper2/CSharp/Clipper2Lib.Examples/ConsoleDemo/Main.cs](https://github.com/AngusJohnson/Clipper2/blob/fa7add77364eb3877dd1b8caf9b3cbd5486347f6/CSharp/Clipper2Lib.Examples/ConsoleDemo/Main.cs#L112-L116)
- [Clipper2/Delphi/Examples/Example1/Example1.dpr](https://github.com/AngusJohnson/Clipper2/blob/fa7add77364eb3877dd1b8caf9b3cbd5486347f6/Delphi/Examples/Example1/Example1.dpr#L21-L26)
- [https://user-images.githubusercontent.com/5280692/178123810-1719a1f5-25c3-4a9e-b419-e575ff056272.svg](https://user-images.githubusercontent.com/5280692/178123810-1719a1f5-25c3-4a9e-b419-e575ff056272.svg)
- [Clipper2/CPP/Examples/Inflate/Inflate.cpp](https://github.com/AngusJohnson/Clipper2/blob/fa7add77364eb3877dd1b8caf9b3cbd5486347f6/CPP/Examples/Inflate/Inflate.cpp#L36-L47)
- [Clipper2/CSharp/Clipper2Lib.Examples/InflateDemo/Main.cs](https://github.com/AngusJohnson/Clipper2/blob/fa7add77364eb3877dd1b8caf9b3cbd5486347f6/CSharp/Clipper2Lib.Examples/InflateDemo/Main.cs#L89-L100)
- [Clipper2/Delphi/Examples/Example2/Example2.dpr](https://github.com/AngusJohnson/Clipper2/blob/fa7add77364eb3877dd1b8caf9b3cbd5486347f6/Delphi/Examples/Example2/Example2.dpr#L20-L31)
- [https://private-user-images.githubusercontent.com/5280692/527284042-a0f2f43c-f0a3-45ec-887d-d9ca34256088.svg?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3OTMwMjE3OTAsIm5iZiI6MTc5MzAyMTQ5MCwicGF0aCI6Ii81MjgwNjkyLzUyNzI4NDA0Mi1hMGYyZjQzYy1mMGEzLTQ1ZWMtODg3ZC1kOWNhMzQyNTYwODguc3ZnP1gtQW16LUFsZ29yaXRobT1BV1M0LUhNQUMtU0hBMjU2JlgtQW16LUNyZWRlbnRpYWw9QUtJQVZDT0RZTFNBNTNQUUs0WkElMkYyMDI2MTAyNiUyRnVzLWVhc3QtMSUyRnMzJTJGYXdzNF9yZXF1ZXN0JlgtQW16LURhdGU9MjAyNjEwMjZUMTMzMTMwWiZYLUFtei1FeHBpcmVzPTMwMCZYLUFtei1TaWduYXR1cmU9MGE0MmQyMTFhMDM4Y2YyMWRhNTM2ZmRlNTViY2YzMTVlOWU0OWU3N2NhZjhlYjU2ZWE2NTJhZTM1OTZkMWZiZiZYLUFtei1TaWduZWRIZWFkZXJzPWhvc3QmcmVzcG9uc2UtY29udGVudC10eXBlPWltYWdlJTJGc3ZnJTJCeG1sIn0.xmSYtAWi8mo_v4EpwlPilJDLIvDKyCWLyfq-hnYN0n8](https://private-user-images.githubusercontent.com/5280692/527284042-a0f2f43c-f0a3-45ec-887d-d9ca34256088.svg?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3OTMwMjE3OTAsIm5iZiI6MTc5MzAyMTQ5MCwicGF0aCI6Ii81MjgwNjkyLzUyNzI4NDA0Mi1hMGYyZjQzYy1mMGEzLTQ1ZWMtODg3ZC1kOWNhMzQyNTYwODguc3ZnP1gtQW16LUFsZ29yaXRobT1BV1M0LUhNQUMtU0hBMjU2JlgtQW16LUNyZWRlbnRpYWw9QUtJQVZDT0RZTFNBNTNQUUs0WkElMkYyMDI2MTAyNiUyRnVzLWVhc3QtMSUyRnMzJTJGYXdzNF9yZXF1ZXN0JlgtQW16LURhdGU9MjAyNjEwMjZUMTMzMTMwWiZYLUFtei1FeHBpcmVzPTMwMCZYLUFtei1TaWduYXR1cmU9MGE0MmQyMTFhMDM4Y2YyMWRhNTM2ZmRlNTViY2YzMTVlOWU0OWU3N2NhZjhlYjU2ZWE2NTJhZTM1OTZkMWZiZiZYLUFtei1TaWduZWRIZWFkZXJzPWhvc3QmcmVzcG9uc2UtY29udGVudC10eXBlPWltYWdlJTJGc3ZnJTJCeG1sIn0.xmSYtAWi8mo_v4EpwlPilJDLIvDKyCWLyfq-hnYN0n8)
- [https://private-user-images.githubusercontent.com/5280692/526880086-ca05688e-293f-4596-86ab-df529694e778.SVG?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3OTMwMjE3OTAsIm5iZiI6MTc5MzAyMTQ5MCwicGF0aCI6Ii81MjgwNjkyLzUyNjg4MDA4Ni1jYTA1Njg4ZS0yOTNmLTQ1OTYtODZhYi1kZjUyOTY5NGU3NzguU1ZHP1gtQW16LUFsZ29yaXRobT1BV1M0LUhNQUMtU0hBMjU2JlgtQW16LUNyZWRlbnRpYWw9QUtJQVZDT0RZTFNBNTNQUUs0WkElMkYyMDI2MTAyNiUyRnVzLWVhc3QtMSUyRnMzJTJGYXdzNF9yZXF1ZXN0JlgtQW16LURhdGU9MjAyNjEwMjZUMTMzMTMwWiZYLUFtei1FeHBpcmVzPTMwMCZYLUFtei1TaWduYXR1cmU9YjU5YjEzYWUwOTljY2YzNzQ2ZGUwZThkMzA0NzIxNTViNzZjZDAzYjAxYjQwMDk5Yzc1MzgxZDUxODJiZDM0YSZYLUFtei1TaWduZWRIZWFkZXJzPWhvc3QmcmVzcG9uc2UtY29udGVudC10eXBlPWltYWdlJTJGc3ZnJTJCeG1sIn0.blGQ9BWiybsQ0beusLjIX2VnhPwBu8ZsOOLKDIa6cD8](https://private-user-images.githubusercontent.com/5280692/526880086-ca05688e-293f-4596-86ab-df529694e778.SVG?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3OTMwMjE3OTAsIm5iZiI6MTc5MzAyMTQ5MCwicGF0aCI6Ii81MjgwNjkyLzUyNjg4MDA4Ni1jYTA1Njg4ZS0yOTNmLTQ1OTYtODZhYi1kZjUyOTY5NGU3NzguU1ZHP1gtQW16LUFsZ29yaXRobT1BV1M0LUhNQUMtU0hBMjU2JlgtQW16LUNyZWRlbnRpYWw9QUtJQVZDT0RZTFNBNTNQUUs0WkElMkYyMDI2MTAyNiUyRnVzLWVhc3QtMSUyRnMzJTJGYXdzNF9yZXF1ZXN0JlgtQW16LURhdGU9MjAyNjEwMjZUMTMzMTMwWiZYLUFtei1FeHBpcmVzPTMwMCZYLUFtei1TaWduYXR1cmU9YjU5YjEzYWUwOTljY2YzNzQ2ZGUwZThkMzA0NzIxNTViNzZjZDAzYjAxYjQwMDk5Yzc1MzgxZDUxODJiZDM0YSZYLUFtei1TaWduZWRIZWFkZXJzPWhvc3QmcmVzcG9uc2UtY29udGVudC10eXBlPWltYWdlJTJGc3ZnJTJCeG1sIn0.blGQ9BWiybsQ0beusLjIX2VnhPwBu8ZsOOLKDIa6cD8)
- [https://github.com/epit3d/goclipper2](https://github.com/epit3d/goclipper2)
- [https://github.com/jeremyfa/Clipper2/tree/main/Haxe](https://github.com/jeremyfa/Clipper2/tree/main/Haxe)
- [https://github.com/micycle1/Clipper2-java/](https://github.com/micycle1/Clipper2-java/)
- [https://github.com/Monkey-Maestro/clipper2-kotlin](https://github.com/Monkey-Maestro/clipper2-kotlin)
- [https://github.com/Ark223/Clipper2-Lua](https://github.com/Ark223/Clipper2-Lua)
- [https://github.com/larsbrubaker/clipper2-rust](https://github.com/larsbrubaker/clipper2-rust)
- [https://github.com/zyunlongz/clipper2-swift](https://github.com/zyunlongz/clipper2-swift)
- [https://github.com/countertype/clipper2-ts](https://github.com/countertype/clipper2-ts)
- [https://github.com/ErikSom/Clipper2-WASM/](https://github.com/ErikSom/Clipper2-WASM/)
- Releases - source: `/AngusJohnson/Clipper2/releases`
- Clipper2 ver. 2.0.1 Latest Dec 19, 2025 - source: `/AngusJohnson/Clipper2/releases/tag/Clipper2_2.0.1`
- Contributors - source: `/AngusJohnson/Clipper2/graphs/contributors`
- /reunanen - source: `/reunanen`
- /philstopford - source: `/philstopford`
- /damiandixon - source: `/damiandixon`
- /SebastianDirks - source: `/SebastianDirks`
- /sethhillbrand - source: `/sethhillbrand`
- /sergey-239 - source: `/sergey-239`
- /DJGosnell - source: `/DJGosnell`
- /JingDict - source: `/JingDict`
- /mmassing - source: `/mmassing`
- /jfriesne - source: `/jfriesne`
- /lederernc - source: `/lederernc`
- /deining - source: `/deining`
- /cwangbh - source: `/cwangbh`
- C++ 37.1% - source: `/AngusJohnson/Clipper2/search?l=c%2B%2B`
- Pascal 33% - source: `/AngusJohnson/Clipper2/search?l=pascal`
- C# 28.6% - source: `/AngusJohnson/Clipper2/search?l=c%23`
- CMake 1.2% - source: `/AngusJohnson/Clipper2/search?l=cmake`
- C 0.1% - source: `/AngusJohnson/Clipper2/search?l=c`
- [https://github.com](https://github.com)
- [Terms](https://docs.github.com/site-policy/github-terms/github-terms-of-service)
- [Privacy](https://docs.github.com/site-policy/privacy-policies/github-privacy-statement)
- [Security](https://github.com/security)
- [Status](https://www.githubstatus.com/)
- [Community](https://github.community/)
- [Docs](https://docs.github.com/)
- [Contact](https://support.github.com?tags=dotcom-footer)
-->
