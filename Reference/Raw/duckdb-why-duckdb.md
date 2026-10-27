Why DuckDB There are many database management systems (DBMS) out there. But there is
[no one-size-fits-all database system](https://blobs.duckdb.org/papers/stonebraker-centintemel-one-size-fits-all-icde-2015.pdf)⁠.
All take different trade-offs to better adjust to specific use cases. DuckDB is no different. Here,
we try to explain what goals DuckDB has and why and how we try to achieve those goals through
technical means. To start with, DuckDB is a
[relational (table-oriented) DBMS](https://en.wikipedia.org/wiki/Relational_database) that supports
the [Structured Query Language (SQL)](https://en.wikipedia.org/wiki/SQL)⁠.

## [Key Characteristics of DuckDB](https://duckdb.org/why_duckdb#key-characteristics-of-duckdb)

SQLite is the [world's most widely deployed DBMS](https://www.sqlite.org/mostdeployed.html)⁠.
Simplicity in installation, and embedded in-process operation are central to its success. DuckDB
adopted the ideas of simplicity and in-process operation – but later stepped out of the realm of
in-process operations through the [Quack protocol](https://duckdb.org/quack/). DuckDB has **no
external dependencies** , neither for compilation nor during run-time. This greatly simplifies
deployment and integration in other build processes. To build DuckDB, all that is required is a
working C++17 compiler. For DuckDB, there is no DBMS server software to install, update and
maintain. By default, DuckDB does not run as a separate process but is completely **embedded within
a host process**. For the analytical use cases that DuckDB targets, this has the additional
advantage of **high-speed data transfer** to and from the database. In some cases, DuckDB can
process foreign data without copying. For example, the DuckDB Python package can run queries
directly on Pandas data without ever importing or copying any data. Thanks to having no
dependencies, DuckDB is extremely portable. It can be compiled for all major operating systems
(Linux, macOS, Windows) and CPU architectures (x86, ARM). It can be deployed from small,
resource-constrained edge devices to large multi-terabyte memory servers with 100+ CPU cores. Using
[DuckDB-Wasm](https://duckdb.org/docs/2.0/clients/wasm/overview.html), DuckDB can also run in web
browsers and even on mobile phones. DuckDB provides
[APIs for C, C++, Go, Python, R, Rust, Java, Node.js and other languages](https://duckdb.org/docs/2.0/clients/overview.html).

### [Feature-Rich](https://duckdb.org/why_duckdb#feature-rich)

DuckDB provides serious data management features. There is extensive support for **complex queries**
in SQL with a large function library, window functions, etc. DuckDB provides **transactional
guarantees** (ACID properties) through our custom, bulk-optimized
[Multi-Version Concurrency Control (MVCC)](https://en.wikipedia.org/wiki/Multiversion_concurrency_control)⁠.
Data can be stored in DuckDB's native format, a **single-file database** or in one of the supported
[lakehouse formats](https://duckdb.org/docs/2.0/lakehouse_formats.html). DuckDB's native format
supports secondary indexes to speed up queries trying to find a single table entry, while lakehouse
formats, including the [DuckLake format](https://ducklake.select/) can scale up to petabytes of
data. DuckDB is deeply integrated into Python and R for efficient interactive data analysis. DuckDB
is designed to support **analytical query workloads** , also known as
[online analytical processing (OLAP)](https://en.wikipedia.org/wiki/Online_analytical_processing)⁠.
These workloads are characterized by complex, relatively long-running queries that process
significant portions of the stored dataset, for example aggregations over entire tables or joins
between several large tables. Changes to the data are expected to be rather large-scale as well,
with several rows being appended, or large portions of tables being changed or added at the same
time. To efficiently support this workload, it is critical to reduce the amount of CPU cycles that
are expended per individual value. The state of the art in data management to achieve this are
either
[vectorized or just-in-time query execution engines](https://www.vldb.org/pvldb/vol11/p2209-kersten.pdf)⁠.
DuckDB uses a **columnar-vectorized query execution engine** , where queries are still interpreted,
but a large batch of values (a "vector") are processed in one operation. This greatly reduces
overhead present in traditional systems such as PostgreSQL, MySQL or SQLite which process each row
sequentially. Vectorized query execution leads to far better performance in OLAP queries.

### [Extensible](https://duckdb.org/why_duckdb#extensible)

DuckDB offers a
[flexible extension mechanism](https://duckdb.org/docs/2.0/core_extensions/overview.html) that
allows defining new data types, functions, file formats and new SQL syntax. In fact, many of
DuckDB's key features, such as support for the
[Parquet file format](https://duckdb.org/docs/2.0/data/parquet/overview.html),
[JSON](https://duckdb.org/docs/2.0/data/json/overview.html),
[time zones](https://duckdb.org/docs/2.0/core_extensions/icu.html), and support for the
[HTTP(S) and S3 protocols](https://duckdb.org/docs/2.0/core_extensions/httpfs/overview.html) are
implemented as extensions. Extensions also
[work in DuckDB Wasm](https://duckdb.org/2023/12/18/duckdb-extensions-in-wasm.html). User
contributions are available as [community extensions](https://duckdb.org/community_extensions/).
DuckDB's development started while the main developers were public servants in the Netherlands. We
see it as our responsibility and duty to society to make the results of our work freely available to
anyone in the Netherlands or elsewhere. This is why DuckDB is released under the very permissive
[MIT License](https://en.wikipedia.org/wiki/MIT_License) and the project's intellectual property is
held by the [DuckDB Foundation](https://duckdb.foundation/)⁠. We invite contributions from anyone
provided they adhere to our [Code of Conduct](https://duckdb.org/code_of_conduct.html).

### [Thoroughly Tested](https://duckdb.org/why_duckdb#thoroughly-tested)

While DuckDB was originally created by a research group, it was never intended to be a research
prototype. Instead, it was intended to become a stable and mature database system. To facilitate
this stability, DuckDB is intensively tested using
[Continuous Integration](https://github.com/duckdb/duckdb/actions)⁠. DuckDB's test suite currently
contains millions of queries, and includes queries adapted from the test suites of SQLite,
PostgreSQL, and MonetDB. Tests are repeated on a wide variety of platforms and compilers. Every pull
request is checked against the full test setup and only merged if it passes. In addition to this
test suite, we run various tests that stress DuckDB under heavy loads. We run the
[TPC-H](https://duckdb.org/docs/2.0/core_extensions/tpch.html) and
[TPC-DS](https://duckdb.org/docs/2.0/core_extensions/tpcds.html) benchmarks, and run various tests
where DuckDB is used by many clients in parallel.

## [Peer-Reviewed Papers and Thesis Works](https://duckdb.org/why_duckdb#peer-reviewed-papers-and-thesis-works)

- [Runtime-Extensible Parsers](https://duckdb.org/library/runtime-extensible-parsers/) (CIDR 2025)
- [Robust External Hash Aggregation in the Solid State Age](https://duckdb.org/library/robust-external-hash-aggregation/)
  (ICDE 2024)
- [These Rows Are Made for Sorting and That's Just What We'll Do](https://duckdb.org/library/sorting/)
  (ICDE 2023)
- [Join Order Optimization with (Almost) No Statistics](https://duckdb.org/library/join-order-optimization-with-almost-no-statistics/)
  (Master thesis, 2022)
- [DuckDB-Wasm: Fast Analytical Processing for the Web](https://duckdb.org/library/duckdb-wasm/)
  (VLDB 2022 demo)
- [Data Management for Data Science - Towards Embedded Analytics](https://duckdb.org/library/embedded-analytics/)
  (CIDR 2020)
- [DuckDB: An Embeddable Analytical Database](https://duckdb.org/library/duckdb-sigmod-demo/)
  (SIGMOD 2019 demo)

## [Projects Built with/for DuckDB](https://duckdb.org/why_duckdb#projects-built-withfor-duckdb)

To learn about projects using DuckDB, visit the
[Awesome DuckDB repository](https://github.com/davidgasquez/awesome-duckdb)⁠.

## [Standing on the Shoulders of Giants](https://duckdb.org/why_duckdb#standing-on-the-shoulders-of-giants)

DuckDB uses some components from various open-source projects and draws inspiration from scientific
publications. We are very grateful for this. Here is an overview:

- **Execution engine:** The vectorized execution engine is inspired by the paper
  [MonetDB/X100: Hyper-Pipelining Query Execution](https://cidrdb.org/cidr2005/papers/P19.pdf) by
  Peter Boncz, Marcin Zukowski and Niels Nes. MonetDB/X100 later became the
  [Vectorwise (Actian Vector) database system](https://ir.cwi.nl/pub/19958/19958B.pdf)⁠.
- **Optimizer:** DuckDB's optimizer draws inspiration from the papers
  [Dynamic Programming Strikes Back](https://15721.courses.cs.cmu.edu/spring2020/papers/20-optimizer2/p539-moerkotte.pdf)
  by Guido Moerkotte and Thomas Neumann,
  [Unnesting Arbitrary Queries](https://btw-2015.informatik.uni-hamburg.de/res/proceedings/Hauptband/Wiss/Neumann-Unnesting_Arbitrary_Querie.pdf)
  by Thomas Neumann and Alfons Kemper, and
  [Improving Unnesting of Complex Queries](https://15799.courses.cs.cmu.edu/spring2025/papers/11-unnesting/neumann-btw2025.pdf)
  by Thomas Neumann.
- **Parallelism:** DuckDB uses Morsel-driven parallelism, inspired by the paper
  [Morsel-Driven Parallelism](https://db.in.tum.de/~leis/papers/morsels.pdf) by Viktor Leis, Peter
  Boncz, Alfons Kemper and Thomas Neumann.
- **Concurrency control:** Our MVCC implementation is inspired by the paper
  [Fast Serializable Multi-Version Concurrency Control for Main-Memory Database Systems](https://db.in.tum.de/~muehlbau/papers/mvcc.pdf)
  by Thomas Neumann, Tobias Mühlbauer and Alfons Kemper.
- **Secondary indexes:** DuckDB has support for secondary indexes based on the paper
  [The Adaptive Radix Tree: ARTful Indexing for Main-Memory Databases](https://db.in.tum.de/~leis/papers/ART.pdf)
  by Viktor Leis, Alfons Kemper and Thomas Neumann.
- **SQL window functions:** DuckDB's window functions implementation uses Segment Tree Aggregation
  as described in the paper
  [Efficient Processing of Window Functions in Analytical SQL Queries](https://www.vldb.org/pvldb/vol8/p1058-leis.pdf)
  by Viktor Leis, Kan Kundhikanjana, Alfons Kemper and Thomas Neumann.
- **SQL inequality joins:** DuckDB's inequality join implementation uses the IEJoin algorithm as
  described in the paper
  [Lightning Fast and Space Efficient Inequality Joins](https://vldb.org/pvldb/vol8/p2074-khayyat.pdf)
  by Zuhair Khayyat, William Lucia, Meghna Singh, Mourad Ouzzani, Paolo Papotti, Jorge-Arnulfo
  Quiané-Ruiz, Nan Tang and Panos Kalnis.
- **Compression of floating-point values:** DuckDB supports multiple algorithms for compressing
  floating-point values:
    - [Chimp](https://duckdb.org/library/fp-compression/) by Panagiotis Liakos, Katia
      Papakonstantinopoulou and Yannis Kotidis
    - [Patas](https://github.com/duckdb/duckdb/pull/5044)⁠, an in-house development
    - [ALP (adaptive lossless floating-point compression)](https://duckdb.org/library/alp/) by Azim
      Afroozeh, Leonard Kuffo and Peter Boncz, who also
      [contributed their implementation](https://github.com/duckdb/duckdb/pull/9635)
- **SQL Parser:** Since version 2.0, DuckDB uses its own
  [PEG-based parser](https://duckdb.org/docs/2.0/sql/peg_parser.html), described in the paper
  [Runtime-Extensible Parsers](https://duckdb.org/library/runtime-extensible-parsers/) by Hannes
  Mühleisen and Mark Raasveldt. Earlier versions used the PostgreSQL parser that was
  [repackaged as a stand-alone library](https://github.com/lfittl/libpg_query)⁠, with the
  translation to our own parse tree inspired by [Peloton](https://db.cs.cmu.edu/peloton/)⁠.
- **Shell:** We use the [SQLite shell](https://sqlite.org/cli.html) to work with DuckDB.
- **Regular expressions:** DuckDB uses Google's regular expression engine.
- **String formatting:** DuckDB uses the string formatting library.
- **UTF-8 handling:** DuckDB uses the [utf8proc](https://juliastrings.github.io/utf8proc/) library
  to check and normalize UTF8.
- **Time zones:** DuckDB's [`icu` extension](https://duckdb.org/docs/2.0/core_extensions/icu.html)
  uses time zone data built from the [IANA time zone database](https://www.iana.org/time-zones)⁠.
  Earlier versions used the library for collation, time zone, and calendar support.
- **Test framework:** DuckDB uses the [Catch2](https://github.com/catchorg/Catch2) unit test
  framework.
- **Test cases:** We use the
  [SQL Logic Tests from SQLite](https://www.sqlite.org/sqllogictest/doc/trunk/about.wiki) to test
  DuckDB.
- **Result validation:** [Manuel Rigger](https://www.manuelrigger.at) used his excellent
  [SQLancer](https://github.com/sqlancer/sqlancer) tool to verify DuckDB result correctness.
- **Query fuzzing:** We use [SQLsmith](https://github.com/anse1/sqlsmith) via the
  [`sqlsmith` extension](https://duckdb.org/docs/2.0/core_extensions/sqlsmith.html) to generate
  random queries for additional testing.
- **JSON parser:** We use [yyjson](https://github.com/ibireme/yyjson)⁠, a high performance JSON
  library written in ANSI C, to parse JSON in DuckDB's
  [JSON Extension](https://duckdb.org/docs/2.0/data/json/overview.html).
- **`USING KEY`in recursive CTEs:** An innovative idea from the University of Tübingen, which allows
  treating intermediate results in recursive common table expressions as keyed dictionaries, leading
  to significant improvements in performance and memory usage. See the paper
  [“How DuckDB is `USING KEY` to Unlock Recursive Query Performance”](https://duckdb.org/library/bamberg-using-key-sigmod/).
