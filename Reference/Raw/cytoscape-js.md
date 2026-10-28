# Cytoscape.js

Graph theory (network) library for visualisation and analysis

- [![GitHub repo](https://img.shields.io/badge/Repo-GitHub-yellow.svg)](https://github.com/cytoscape/cytoscape.js)
- [![News and tutorials](https://img.shields.io/badge/News%20%26%20tutorials-Blog-yellow.svg)](https://blog.js.cytoscape.org)
- [![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://raw.githubusercontent.com/cytoscape/cytoscape.js/master/LICENSE)
- [![npm](https://img.shields.io/npm/v/cytoscape.svg)](https://www.npmjs.com/package/cytoscape)
- [![DOI](https://zenodo.org/badge/2255947.svg)](https://zenodo.org/badge/latestdoi/2255947)
- [![npm installs](https://img.shields.io/npm/dm/cytoscape.svg?label=npm%20installs)](https://www.npmjs.com/package/cytoscape)
- [![Automated tests](https://github.com/cytoscape/cytoscape.js/actions/workflows/tests.yml/badge.svg)](https://github.com/cytoscape/cytoscape.js/actions/workflows/tests.yml)
- [![Extensions](https://img.shields.io/badge/Extensions-70-brightgreen.svg)](#extensions)
- [![Cloudflare](https://img.shields.io/badge/Powered%20by-Cloudflare-orange.svg)](https://cloudflare.com)

Created at the [University of Toronto](https://utoronto.ca) and published in [Oxford Bioinformatics](#introduction/citation) ([2016](https://academic.oup.com/bioinformatics/article/32/2/309/1744007), [2023](https://academic.oup.com/bioinformatics/article/39/1/btad031/6988031)).

Authored by: [Max Franz](https://github.com/maxkfranz), [Christian Lopes](https://github.com/chrtannus), [Dylan Fong](https://github.com/d2fong), [Mike Kucera](https://github.com/mikekucera), …, [Gary Bader](https://baderlab.org)

# Demos [](#demos)

- [](demos/fcose-gene)
- [FCOSE gene-gene graph](https://github.com/cytoscape/cytoscape.js/tree/master/documentation/demos/fcose-gene)
- [](demos/tokyo-railways)
- [Tokyo railways](https://github.com/cytoscape/cytoscape.js/tree/master/documentation/demos/tokyo-railways)
- [](http://wineandcheesemap.com)
- [Wine & cheese](https://github.com/cytoscape/wineandcheesemap)
- [](https://PathwayCommons.github.io/cytoscape-sbgn-stylesheet)
- [SBGN stylesheet](https://github.com/PathwayCommons/cytoscape-sbgn-stylesheet)
- [](https://cytoscape.github.io/cytoscape.js-popper)
- [Popper.js extension](https://github.com/cytoscape/cytoscape.js-popper)
- [](https://cytoscape.github.io/cytoscape.js-popper/demo-tippy.html)
- [Popper.js extension & Tippy.js tooltips](https://github.com/cytoscape/cytoscape.js-popper)
- [](https://cytoscape.github.io/cytoscape.js-automove)
- [Automove extension](https://github.com/cytoscape/cytoscape.js-automove)
- [](https://cytoscape.github.io/cytoscape.js-cxtmenu)
- [Cxtmenu extension](https://github.com/cytoscape/cytoscape.js-cxtmenu)
- [](https://cytoscape.org/cytoscape.js-edgehandles/demo-snap.html)
- [Edgehandles extension](https://github.com/cytoscape/cytoscape.js-edgehandles)
- [](https://cytoscape.github.io/cytoscape.js-compound-drag-and-drop)
- [Compound drag-and-drop extension](https://github.com/cytoscape/cytoscape.js-compound-drag-and-drop)
- [](demos/circle-layout)
- [Circle layout](https://github.com/cytoscape/cytoscape.js/tree/master/documentation/demos/circle-layout)
- [](demos/concentric-layout)
- [Concentric layout](https://github.com/cytoscape/cytoscape.js/tree/master/documentation/demos/concentric-layout)
- [](https://ivis-at-bilkent.github.io/cytoscape.js-avsdf/demo.html)
- [AVSDF layout](https://github.com/iVis-at-Bilkent/cytoscape.js-avsdf)
- [](https://ivis-at-bilkent.github.io/cytoscape.js-cise/demo/demo.html)
- [CiSE layout](https://github.com/iVis-at-Bilkent/cytoscape.js-cise)
- [](demos/grid-layout)
- [Grid layout](https://github.com/cytoscape/cytoscape.js/tree/master/documentation/demos/grid-layout)
- [](demos/cose-layout)
- [CoSE layout](https://github.com/cytoscape/cytoscape.js/tree/master/documentation/demos/cose-layout)
- [](https://cytoscape.github.io/cytoscape.js-cose-bilkent)
- [CoSE Bilkent layout](https://github.com/cytoscape/cytoscape.js-cose-bilkent)
- [](https://cytoscape.github.io/cytoscape.js-cose-bilkent/demo-compound.html)
- [CoSE Bilkent layout (compound)](https://github.com/cytoscape/cytoscape.js-cose-bilkent)
- [](https://ivis-at-bilkent.github.io/cytoscape.js-fcose/demo/demo.html)
- [fCoSE layout](https://github.com/iVis-at-Bilkent/cytoscape.js-fcose)
- [](https://ivis-at-bilkent.github.io/cytoscape.js-fcose/demo/demo-compound.html)
- [fCoSE layout (compound)](https://github.com/iVis-at-Bilkent/cytoscape.js-fcose)
- [](https://ivis-at-bilkent.github.io/cytoscape.js-fcose/demo/demo-constraint.html)
- [fCoSE layout (constraint)](https://github.com/iVis-at-Bilkent/cytoscape.js-fcose)
- [](https://cytoscape.github.io/cytoscape.js-cola)
- [Cola layout](https://github.com/cytoscape/cytoscape.js-cola)
- [](https://cytoscape.github.io/cytoscape.js-cola/demo-compound.html)
- [Cola layout (compound)](https://github.com/cytoscape/cytoscape.js-cola)
- [](https://cytoscape.github.io/cytoscape.js-elk/?demo=layered)
- [ELK layout](https://github.com/cytoscape/cytoscape.js-elk)
- [](https://cytoscape.github.io/cytoscape.js-dagre)
- [Dagre layout](https://github.com/cytoscape/cytoscape.js-dagre)
- [](https://cytoscape.github.io/cytoscape.js-klay)
- [Klay layout](https://github.com/cytoscape/cytoscape.js-klay)
- [](demos/images-breadthfirst-layout)
- [Breadthfirst layout & images](https://github.com/cytoscape/cytoscape.js/tree/master/documentation/demos/images-breadthfirst-layout)
- [](demos/animated-bfs)
- [Animated BFS](https://github.com/cytoscape/cytoscape.js/tree/master/documentation/demos/animated-bfs)
- [](demos/node-types)
- [Node types](https://github.com/cytoscape/cytoscape.js/tree/master/documentation/demos/node-types)
- [](demos/edge-types)
- [Edge types](https://github.com/cytoscape/cytoscape.js/tree/master/documentation/demos/edge-types)
- [](demos/radius-types)
- [Radius types](https://github.com/cytoscape/cytoscape.js/tree/master/documentation/demos/radius-types)
- [](demos/edge-arrows)
- [Edge arrow types](https://github.com/cytoscape/cytoscape.js/tree/master/documentation/demos/edge-arrows)
- [](demos/labels)
- [Labels](https://github.com/cytoscape/cytoscape.js/tree/master/documentation/demos/labels)
- [](demos/compound-nodes)
- [Compound nodes](https://github.com/cytoscape/cytoscape.js/tree/master/documentation/demos/compound-nodes)
- [](demos/linkout-example)
- [Linkout example](https://github.com/cytoscape/cytoscape.js/tree/master/documentation/demos/linkout-example)

# Introduction [](#introduction)

## Factsheet [](#introduction/factsheet)

- A fully featured graph library written in pure JS
- Permissive open source license (MIT) for the core Cytoscape.js library and all first-party extensions
- Used in commercial projects and open-source projects in production
- Designed for users first, for both frontfacing app usecases *and* developer usecases
- Highly optimised
- No external dependencies
- Compatible with
  - All modern browsers
  - Legacy browsers with ES5 and canvas support
    - ES5 and canvas support are required, and feature detection is used for optional performance enhancements.
    - Browsers circa 2012 support ES5 fully: IE10, Chrome 23, Firefox 21, Safari 6 ([caniuse](https://caniuse.com/#feat=es5))
    - Browsers with partial but sufficient ES5 support also work, such as IE9 and Firefox 4.
    - The documentation and examples are not optimised for old browsers, although the library itself is. Some demos may not work in old browsers in order to keep the demo code simple.
  - Module systems
    - ES modules
    - UMD
      - CommonJS/Node.js
      - Globals
      - AMD/Require.js
  - Package managers
    - npm
    - yarn
    - bower
    - jspm
- Supports the [R language](https://www.r-project.org/) via [RCyjs](http://www.bioconductor.org/packages/release/bioc/html/RCyjs.html)
- Supports rendering images of graphs on Node.js with [Cytosnap](https://github.com/cytoscape/cytosnap)
- Has a large suite of tests that can be run in the browser or the terminal
- Documentation includes live code examples, doubling as an interactive requirements specification; example graphs may also be freely modified in your browser’s JS console
- Fully serialisable and deserialisable via JSON
- Uses layouts for automatically or manually positioning nodes
- Supports selectors for terse filtering and graph querying
- Uses stylesheets to separate presentation from data in a rendering agnostic manner
- Abstracted and unified touch events on top of a familiar event model
- Builtin support for standard gestures on both desktop and touch
- Chainable for convenience
- Supports functional programming patterns
- Supports set theory operations
- Includes graph theory algorithms, from BFS to PageRank
- Animatable graph elements and viewport
- Fully extendable (and extensions can be autoscaffolded for you)
- Well maintained
  - Weekly patch release cadence
  - Monthly feature release cadence
- Listed by [Zenodo](https://doi.org/10.5281/zenodo.831800) for per-version DOIs

## Who uses Cytoscape.js [](#introduction/who-uses-cytoscape.js)

### Big-name tech

- [Amazon](http://amazon.com)
- [Apache Software Foundation](https://apache.org)
- [Cisco](https://www.cisco.com)
- [Elastic](https://www.elastic.co/)
- [Fujitsu](https://www.fujitsu.com)
- [GitHub](https://github.com)
- [Google](https://google.com)
- [Hewlett Packard Enterprise](https://www.hpe.com)
- [IBM](https://www.ibm.com)
- [Linux Foundation](https://www.linuxfoundation.org)
- [Meta](https://meta.com)
- [Microsoft](https://microsoft.com)
- [MongoDB](https://www.mongodb.com)
- [Puppet](https://puppet.com)
- [RedHat](https://www.redhat.com)
- [Tencent](https://www.tencent.com/en-us/)
- [Uber](https://uber.com)

### Government

- [DARPA](http://www.darpa.mil)
- [GCHQ](https://www.gchq.gov.uk/)
- [NHS](https://www.nhs.uk)
- [NOAA](https://www.noaa.gov)
- [NSA](https://www.nsa.gov/)

### Research resources

- [APID](http://cicblade.dep.usal.es:8080/APID/init.action)
- [AraQTL](https://www.bioinformatics.nl/AraQTL/)
- [Arches](https://www.archesproject.org)
- [BioCyc](http://biocyc.org/)
- [BioGRID](http://thebiogrid.org/)
- [BioPlex](https://bioplex.hms.harvard.edu/)
- [cBioPortal](https://www.cbioportal.org)
- [ConsensusPathDB](http://cpdb.molgen.mpg.de/)
- [dSysMap](https://dsysmap.irbbarcelona.org)
- [Elsevier](https://www.elsevier.com)
- [EnrichmentMap](https://enrichmentmap.org)
- [Ensembl](https://www.ensembl.org)
- [FlyBase](https://flybase.org/)
- [Galaxy](https://galaxyproject.org)
- [GeneMANIA](http://genemania.org)
- [GraphSpace](http://graphspace.org)
- [Intermine](http://intermine.org/)
- [MetagenomeScope](https://marbl.github.io/MetagenomeScope/)
- [NDEx](http://www.ndexbio.org/)
- [Newt](https://newteditor.org/)
- [OpenBio](https://www.openbio.eu)
- [Pathway Commons](http://www.pathwaycommons.org)
- [PINet](http://pinet.tsl.ac.uk)
- [Plotly (Dash)](https://plotly.com)
- [QuantStack (Jupyter)](https://quantstack.net)
- [STOCKS](https://gbcs.embl.de/portal/tiki-index.php?page=STOCKS)
- [SynBioHub](https://synbiohub.org)
- [The Gene Ontology Consortium](http://geneontology.org)
- [WormBase](https://wormbase.org/)

### Research & non-profits

- [Aalto University](https://www.aalto.fi/)
- [Albert Ludwig University of Freiburg](https://uni-freiburg.de/en/)
- [Barcelona Supercomputing Center](https://www.bsc.es)
- [BBC](https://www.bbc.com)
- [Ben-Gurion University of the Negev](http://bgu.ac.il/)
- [Berkeley Lab](https://www.lbl.gov)
- [Broad Institute](https://www.broadinstitute.org)
- [Carnegie Mellon](https://www.cmu.edu)
- [Earlham Institute](https://www.earlham.ac.uk)
- [École Polytechnique Fédérale de Lausanne (EPFL)](https://www.epfl.ch)
- [Erasmus Medical Center](https://www.erasmusmc.nl/)
- [European Molecular Biology Laboratory (EMBL)](https://www.embl.org/)
- [FAIRplus](https://fairplus-project.eu)
- [Georgia Institute of Technology](https://www.gatech.edu)
- [Getty](https://www.getty.edu)
- [Harvard University](https://www.harvard.edu)
- [HOPR](https://hoprnet.org)
- [Howard Hughes Medical Institute](https://www.hhmi.org/)
- [Idaho National Laboratory](https://inl.gov)
- [Indiana University](https://www.iu.edu)
- [INRAe](https://www.inrae.fr)
- [Institut Curie](https://institut-curie.org)
- [Institute for Systems Biology](https://isbscience.org)
- [IntAct](https://ebi.ac.uk/intact)
- [International Rice Research Institute](https://www.irri.org)
- [Johns Hopkins University](https://www.jhu.edu)
- [Lerner Research Institute, Cleveland Clinic](https://www.lerner.ccf.org)
- [Maastricht University](https://www.maastrichtuniversity.nl)
- [Max Plank Institute](https://mpg.de)
- [Nanyang Technological University](https://www.ntu.edu.sg)
- [Network of European Bioimage Analysts](http://eubias.org/NEUBIAS)
- [NHS](https://www.nhs.uk)
- [Norwich Research Park](https://www.norwichresearchpark.com)
- [Observational Health Data Sciences and Informatics (OHDSI)](http://www.ohdsi.org/)
- [Open Ownership](https://www.openownership.org/)
- [Oregon Health and Science University](https://www.ohsu.edu)
- [Paris Sciences et Lettres University](https://psl.eu/en)
- [Penn State University](https://www.psu.edu)
- [Reactome](https://reactome.org)
- [Research Institute for Fragrance Materials](https://www.rifm.org)
- [Sanger Institute](http://www.sanger.ac.uk/)
- [Spanish National Bioinformatics Institute](https://inb-elixir.es/)
- [SRI International](https://www.sri.com)
- [Stanford University](https://www.stanford.edu)
- [The Foundation for Research and Technology – Hellas](https://www.forth.gr)
- [The Molecular Science Software Institute](http://molssi.org/)
- [Tsinghua University](https://www.tsinghua.edu.cn)
- [UNIST](https://www.unist.ac.kr)
- [Università degli Studi di Milano - Bicocca](https://www.unimib.it)
- [University of Alabama](https://www.ua.edu)
- [University of Barcelona](https://www.ub.edu)
- [University of California, Berkeley](https://www.berkeley.edu)
- [University of California, San Diego](http://www.ucsd.edu)
- [University of California, San Francisco](https://www.ucsf.edu)
- [University of Cambridge](http://www.cam.ac.uk/)
- [University of Electronic Science and Technology of China](http://en.uestc.edu.cn/)
- [University of Heidelberg](https://www.uni-heidelberg.de)
- [University of Helsinki](https://www.helsinki.fi)
- [University of Jyväskylä](https://www.jyu.fi)
- [University of Leipzig](http://uni-leipzig.de)
- [University of Mannheim](https://www.uni-mannheim.de/en/)
- [University of Maryland](https://umd.edu/)
- [University of Toronto](https://utoronto.ca)
- [University of Utah](https://www.utah.edu)
- [Vanderbilt University](https://www.vanderbilt.edu)
- [Virginia Tech](http://www.vt.edu)
- [Wageningen University and Research](https://www.wur.nl)
- [World Monuments Fund](https://www.wmf.org)

### Libraries

- [Mermaid](https://mermaid.js.org)

### Apps & services

- [Apache AGE](https://age.apache.org)
- [AppZen](https://www.appzen.com/)
- [Apromore](https://apromore.com)
- [Aras](https://www.aras.com/en)
- [ArcadeDB](https://arcadedb.com/)
- [Athenz](https://www.athenz.io)
- [AWS Perspective](https://github.com/awslabs/aws-perspective)
- [Azure Bicep](https://docs.microsoft.com/en-us/azure/azure-resource-manager/bicep/overview)
- [Bell Media](https://www.bellmedia.ca/)
- [BeneficialOwnership](https://www.beneficialownership.co.uk)
- [BlueSailCRM](https://www.bluesailcrm.com)
- [Budō Lineage Tree, The](https://budotree.judoc.org)
- [BugBug](https://bugbug.io)
- [Cadence](https://cadenceworkflow.io)
- [CanSyL](https://crossbar.kansil.org)
- [Chaos Mesh](https://chaos-mesh.org)
- [Classcraft](https://www.classcraft.com)
- [CompanyTracker](https://www.companytracker.be)
- [CyberSift](https://www.cybersift.io)
- [Cylc](https://cylc.github.io)
- [Dendron](https://www.dendron.so)
- [DGB Technologies](https://www.dgbtek.com)
- [Dockflow](https://dockflow.com)
- [DroneDeploy](https://www.dronedeploy.com)
- [DynaLearn](https://dynalearn.nl)
- [Flowchart.fun](https://flowchart.fun/)
- [Foxglove](https://foxglove.dev)
- [Ganister](https://www.ganister.eu)
- [Global CTO Forum](https://globalctoforum.org)
- [Graphlytic](https://graphlytic.biz)
- [GraphWalker](http://graphwalker.github.io)
- [GREZI](https://grezi.fr)
- [HackerTarget](https://hackertarget.com)
- [HanziGraph](https://hanzigraph.com/)
- [How-4](https://www.how-4.com)
- [ICSI Haystack Panopticon, The](https://haystack.mobi/panopticon/)
- [InfoTrack](https://www.infotrack.com.au)
- [Intercax](https://intercax.com)
- [InterpretML](https://interpret.ml)
- [IPFS](https://ipfs.io) & [libp2p](https://libp2p.io/)
- [Jiva.ai](https://www.jiva.ai)
- [JsDelivr](https://www.jsdelivr.com)
- [Juggl](https://juggl.io)
- [Kanji Map, The](https://thekanjimap.com)
- [Kausal Paths](https://kausal.tech)
- [Kiali](https://kiali.io)
- [Kibana](https://www.elastic.co/kibana)
- [KPN](https://www.kpn.com)
- [KuKaKo](https://github.com/OSC-JYU/KuKaKo)
- [Layer5](https://layer5.io)
- [LearnAwesome](https://learnawesome.org)
- [LudoMentrix](https://www.ludomentrix.nl/en-GB/)
- [Machine2Learn](https://machine2learn.com)
- [Manifold Finance](https://www.manifoldfinance.com)
- [Mars](https://docs.pymars.org/en/latest/)
- [Meshery](https://meshery.io)
- [Musicalized](https://en.wesound.academy)
- [Network Weathermap](https://github.com/6illes/weathermap)
- [New Relic](https://newrelic.com)
- [nFlows](https://www.nflows.com)
- [NodeLand](https://nodeland.io/)
- [Nx](https://nx.dev)
- [Obsidian](https://obsidian.md)
- [Onepanel](https://www.onepanel.ai)
- [OpenDialog](https://opendialog.ai)
- [Orchidex](https://orchidex.org)
- [Panaya](https://www.panaya.com)
- [Pinpoint](https://pinpoint-apm.gitbook.io/pinpoint/)
- [RecallGraph](https://recallgraph.tech)
- [Roam](https://roamresearch.com)
- [Signifyd](https://www.signifyd.com)
- [SQL Frames](https://sqlframes.com)
- [Steemit](https://steemit.com)
- [stixview](https://github.com/traut/stixview)
- [T-Rank](https://trank.no)
- [TangleGuard](https://tangleguard.com/)
- [ThreatConnect](https://threatconnect.com)
- [ThreatCrowd](https://www.threatcrowd.org)
- [TopoViewer](https://github.com/asadarafat/topoViewer)
- [Underlay](https://www.underlay.org)
- [VAC](https://vac.dev)
- [wanderer.ai](https://wanderer.ai)
- [Wisecube AI](https://www.wisecube.ai/orpheus/)
- [Yaveon](https://www.yaveon.com/en/)
- [Zubir Said Knowledge Graph](https://zubirsaid.sg)

### Let us know

[Let us know that you’re using Cytoscape.js.](https://github.com/cytoscape/cytoscape.js/issues/914)

## About [](#introduction/about)

Cytoscape.js is an open-source [graph theory](http://en.wikipedia.org/wiki/Graph_theory) (a.k.a. network) library written in JS. You can use Cytoscape.js for graph analysis and visualisation.

Cytoscape.js allows you to easily display and manipulate rich, interactive graphs. Because Cytoscape.js allows the user to interact with the graph and the library allows the client to hook into user events, Cytoscape.js is easily integrated into your app, especially since Cytoscape.js supports both desktop browsers, like Chrome, and mobile browsers, like on the iPad. Cytoscape.js includes all the gestures you would expect out-of-the-box, including pinch-to-zoom, box selection, panning, et cetera.

Cytoscape.js also has graph analysis in mind: The library contains many useful functions in graph theory. You can use Cytoscape.js headlessly on Node.js to do graph analysis in the terminal or on a web server.

Cytoscape.js is an open-source project, and anyone is free to contribute. For more information, refer to the [GitHub README](https://github.com/cytoscape/cytoscape.js).

The library was created at the [Donnelly Centre](http://thedonnellycentre.utoronto.ca) at the [University of Toronto](http://www.utoronto.ca/). It is the successor of [Cytoscape Web](http://cytoscapeweb.cytoscape.org/).

## Packages [](#introduction/packages)

- npm : `npm install cytoscape`
- yarn : `yarn install cytoscape`
- bower : `bower install cytoscape`
- jspm : `jspm install npm:cytoscape`

## Releases [](#introduction/releases)

- 3.34
  - [3.34.4](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.34.4+is%3Aclosed)
  - [3.34.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.34.3+is%3Aclosed)
  - [3.34.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.34.2+is%3Aclosed)
  - [3.34.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.34.1+is%3Aclosed)
  - [3.34.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.34.0+is%3Aclosed)
- 3.33
  - [3.33.4](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.33.4+is%3Aclosed)
  - [3.33.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.33.3+is%3Aclosed)
  - [3.33.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.33.2+is%3Aclosed)
  - [3.33.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.33.1+is%3Aclosed)
  - [3.33.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.33.0+is%3Aclosed)
- 3.32
  - [3.32.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.32.2+is%3Aclosed)
  - [3.32.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.32.1+is%3Aclosed)
  - [3.32.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.32.0+is%3Aclosed)
- 3.31
  - [3.31.4](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.31.4+is%3Aclosed)
  - [3.31.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.31.3+is%3Aclosed)
  - [3.31.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.31.2+is%3Aclosed)
  - [3.31.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.31.1+is%3Aclosed)
  - [3.31.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.31.0+is%3Aclosed)
- 3.30
  - [3.30.4](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.30.4+is%3Aclosed)
  - [3.30.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.30.3+is%3Aclosed)
  - [3.30.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.30.2+is%3Aclosed)
  - [3.30.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.30.1+is%3Aclosed)
  - [3.30.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.30.0+is%3Aclosed)
- 3.29
  - [3.29.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.29.3+is%3Aclosed)
  - [3.29.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.29.2+is%3Aclosed)
  - [3.29.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.29.1+is%3Aclosed)
  - [3.29.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.29.0+is%3Aclosed)
- 3.28
  - [3.28.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.28.1+is%3Aclosed)
  - [3.28.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.28.0+is%3Aclosed)
- 3.27
  - [3.27.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.27.2+is%3Aclosed)
  - [3.27.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.27.1+is%3Aclosed)
  - [3.27.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.27.0+is%3Aclosed)
- 3.26
  - [3.26.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.26.2+is%3Aclosed)
  - [3.26.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.26.1+is%3Aclosed)
  - [3.26.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.26.0+is%3Aclosed)
- 3.25
  - [3.25.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.25.2+is%3Aclosed)
  - [3.25.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.25.1+is%3Aclosed)
  - [3.25.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.25.0+is%3Aclosed)
- 3.24
  - [3.24.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.24.1+is%3Aclosed)
  - [3.24.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.24.0+is%3Aclosed)
- 3.23
  - [3.23.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.23.1+is%3Aclosed)
  - [3.23.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.23.0+is%3Aclosed)
- 3.22
  - [3.22.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.22.1+is%3Aclosed)
  - [3.22.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.22.0+is%3Aclosed)
- 3.21
  - [3.21.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.21.3+is%3Aclosed)
  - [3.21.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.21.2+is%3Aclosed)
  - [3.21.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.21.1+is%3Aclosed)
  - [3.21.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.21.0+is%3Aclosed)
- 3.20
  - [3.20.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.20.3+is%3Aclosed)
  - [3.20.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.20.2+is%3Aclosed)
  - [3.20.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.20.1+is%3Aclosed)
  - [3.20.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.20.0+is%3Aclosed)
- 3.19
  - [3.19.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.19.1+is%3Aclosed)
  - [3.19.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.19.0+is%3Aclosed)
- 3.18
  - [3.18.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.18.2+is%3Aclosed)
  - [3.18.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.18.1+is%3Aclosed)
  - [3.18.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.18.0+is%3Aclosed)
- 3.17
  - [3.17.4](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.17.4+is%3Aclosed)
  - [3.17.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.17.3+is%3Aclosed)
  - [3.17.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.17.2+is%3Aclosed)
  - [3.17.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.17.1+is%3Aclosed)
  - [3.17.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.17.0+is%3Aclosed)
- 3.16
  - [3.16.5](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.16.5+is%3Aclosed)
  - [3.16.4](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.16.4+is%3Aclosed)
  - [3.16.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.16.3+is%3Aclosed)
  - [3.16.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.16.2+is%3Aclosed)
  - [3.16.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.16.1+is%3Aclosed)
  - [3.16.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.16.0+is%3Aclosed)
- 3.15
  - [3.15.5](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.15.5+is%3Aclosed)
  - [3.15.4](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.15.4+is%3Aclosed)
  - [3.15.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.15.3+is%3Aclosed)
  - [3.15.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.15.2+is%3Aclosed)
  - [3.15.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.15.1+is%3Aclosed)
  - [3.15.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.15.0+is%3Aclosed)
- 3.14
  - [3.14.4](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.14.4+is%3Aclosed)
  - [3.14.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.14.3+is%3Aclosed)
  - [3.14.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.14.2+is%3Aclosed)
  - [3.14.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.14.1+is%3Aclosed)
  - [3.14.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.14.0+is%3Aclosed)
- 3.13
  - [3.13.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.13.3+is%3Aclosed)
  - [3.13.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.13.2+is%3Aclosed)
  - [3.13.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.13.1+is%3Aclosed)
  - [3.13.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.13.0+is%3Aclosed)
- 3.12
  - [3.12.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.12.3+is%3Aclosed)
  - [3.12.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.12.2+is%3Aclosed)
  - [3.12.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.12.1+is%3Aclosed)
  - [3.12.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.12.0+is%3Aclosed)
- 3.11
  - [3.11.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.11.2+is%3Aclosed)
  - [3.11.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.11.1+is%3Aclosed)
  - [3.11.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.11.0+is%3Aclosed)
- 3.10
  - [3.10.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.10.2+is%3Aclosed)
  - [3.10.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.10.1+is%3Aclosed)
  - [3.10.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.10.0+is%3Aclosed)
- 3.9
  - [3.9.4](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.9.4+is%3Aclosed)
  - [3.9.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.9.3+is%3Aclosed)
  - [3.9.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.9.2+is%3Aclosed)
  - [3.9.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.9.1+is%3Aclosed)
  - [3.9.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.9.0+is%3Aclosed)
- 3.8
  - [3.8.5](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.8.5+is%3Aclosed)
  - [3.8.4](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.8.4+is%3Aclosed)
  - [3.8.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.8.3+is%3Aclosed)
  - [3.8.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.8.2+is%3Aclosed)
  - [3.8.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.8.1+is%3Aclosed)
  - [3.8.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.8.0+is%3Aclosed)
- 3.7
  - [3.7.6](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.7.6+is%3Aclosed)
  - [3.7.5](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.7.5+is%3Aclosed)
  - [3.7.4](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.7.4+is%3Aclosed)
  - [3.7.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.7.3+is%3Aclosed)
  - [3.7.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.7.2+is%3Aclosed)
  - [3.7.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.7.1+is%3Aclosed)
  - [3.7.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.7.0+is%3Aclosed)
- 3.6
  - [3.6.6](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.6.6+is%3Aclosed)
  - [3.6.5](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.6.5+is%3Aclosed)
  - [3.6.4](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.6.4+is%3Aclosed)
  - [3.6.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.6.3+is%3Aclosed)
  - [3.6.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.6.2+is%3Aclosed)
  - [3.6.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.6.1+is%3Aclosed)
  - [3.6.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.6.0+is%3Aclosed)
- 3.5
  - [3.5.9](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.5.9+is%3Aclosed)
  - [3.5.8](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.5.8+is%3Aclosed)
  - [3.5.7](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.5.7+is%3Aclosed)
  - [3.5.6](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.5.6+is%3Aclosed)
  - [3.5.5](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.5.5+is%3Aclosed)
  - [3.5.4](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.5.4+is%3Aclosed)
  - [3.5.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.5.3+is%3Aclosed)
  - [3.5.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.5.2+is%3Aclosed)
  - [3.5.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.5.1+is%3Aclosed)
  - [3.5.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.5.0+is%3Aclosed)
- 3.4
  - [3.4.9](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.4.9+is%3Aclosed)
  - [3.4.8](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.4.8+is%3Aclosed)
  - [3.4.7](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.4.7+is%3Aclosed)
  - [3.4.6](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.4.6+is%3Aclosed)
  - [3.4.5](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.4.5+is%3Aclosed)
  - [3.4.4](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.4.4+is%3Aclosed)
  - [3.4.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.4.3+is%3Aclosed)
  - [3.4.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.4.2+is%3Aclosed)
  - [3.4.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.4.1+is%3Aclosed)
  - [3.4.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.4.0+is%3Aclosed)
- 3.3
  - [3.3.6](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.3.6+is%3Aclosed)
  - [3.3.5](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.3.5+is%3Aclosed)
  - [3.3.4](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.3.4+is%3Aclosed)
  - [3.3.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.3.3+is%3Aclosed)
  - [3.3.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.3.2+is%3Aclosed)
  - [3.3.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.3.1+is%3Aclosed)
  - [3.3.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.3.0+is%3Aclosed)
- 3.2
  - [3.2.22](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.2.22+is%3Aclosed)
  - [3.2.21](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.2.21+is%3Aclosed)
  - [3.2.20](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.2.20+is%3Aclosed)
  - [3.2.19](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.2.19+is%3Aclosed)
  - [3.2.18](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.2.18+is%3Aclosed)
  - [3.2.17](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.2.17+is%3Aclosed)
  - [3.2.16](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.2.16+is%3Aclosed)
  - [3.2.15](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.2.15+is%3Aclosed)
  - [3.2.14](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.2.14+is%3Aclosed)
  - [3.2.13](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.2.13+is%3Aclosed)
  - [3.2.12](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.2.12+is%3Aclosed)
  - [3.2.11](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.2.11+is%3Aclosed)
  - [3.2.10](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.2.10+is%3Aclosed)
  - [3.2.9](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.2.9+is%3Aclosed)
  - [3.2.8](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.2.8+is%3Aclosed)
  - [3.2.7](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.2.7+is%3Aclosed)
  - [3.2.6](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.2.6+is%3Aclosed)
  - [3.2.5](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.2.5+is%3Aclosed)
  - [3.2.4](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.2.4+is%3Aclosed)
  - [3.2.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.2.3+is%3Aclosed)
  - [3.2.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.2.2+is%3Aclosed)
  - [3.2.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.2.1+is%3Aclosed)
  - [3.2.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.2.0+is%3Aclosed)
- 3.1
  - [3.1.5](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.1.5+is%3Aclosed)
  - [3.1.4](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.1.4+is%3Aclosed)
  - [3.1.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.1.3+is%3Aclosed)
  - [3.1.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.1.2+is%3Aclosed)
  - [3.1.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.1.1+is%3Aclosed)
  - [3.1.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.1.0+is%3Aclosed)
- 3.0
  - [3.0.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.0.1+is%3Aclosed)
  - [3.0.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.0.0+is%3Aclosed)
- 2.7
  - [2.7.29](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.29+is%3Aclosed)
  - [2.7.28](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.28+is%3Aclosed)
  - [2.7.27](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.27+is%3Aclosed)
  - [2.7.26](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.26+is%3Aclosed)
  - [2.7.25](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.25+is%3Aclosed)
  - [2.7.24](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.24+is%3Aclosed)
  - [2.7.23](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.23+is%3Aclosed)
  - [2.7.22](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.22+is%3Aclosed)
  - [2.7.21](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.21+is%3Aclosed)
  - [2.7.20](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.20+is%3Aclosed)
  - [2.7.19](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.19+is%3Aclosed)
  - [2.7.18](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.18+is%3Aclosed)
  - [2.7.17](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.17+is%3Aclosed)
  - [2.7.16](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.16+is%3Aclosed)
  - [2.7.15](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.15+is%3Aclosed)
  - [2.7.14](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.14+is%3Aclosed)
  - [2.7.13](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.13+is%3Aclosed)
  - [2.7.12](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.12+is%3Aclosed)
  - [2.7.11](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.11+is%3Aclosed)
  - [2.7.10](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.10+is%3Aclosed)
  - [2.7.9](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.9+is%3Aclosed)
  - [2.7.8](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.8+is%3Aclosed)
  - [2.7.7](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.7+is%3Aclosed)
  - [2.7.6](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.6+is%3Aclosed)
  - [2.7.5](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.5+is%3Aclosed)
  - [2.7.4](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.4+is%3Aclosed)
  - [2.7.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.3+is%3Aclosed)
  - [2.7.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.2+is%3Aclosed)
  - [2.7.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.1+is%3Aclosed)
  - [2.7.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.0+is%3Aclosed)
- 2.6
  - [2.6.12](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.6.12+is%3Aclosed)
  - [2.6.11](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.6.11+is%3Aclosed)
  - [2.6.10](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.6.10+is%3Aclosed)
  - [2.6.9](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.6.9+is%3Aclosed)
  - [2.6.8](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.6.8+is%3Aclosed)
  - [2.6.7](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.6.7+is%3Aclosed)
  - [2.6.6](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.6.6+is%3Aclosed)
  - [2.6.5](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.6.5+is%3Aclosed)
  - [2.6.4](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.6.4+is%3Aclosed)
  - [2.6.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.6.3+is%3Aclosed)
  - [2.6.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.6.2+is%3Aclosed)
  - [2.6.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.6.1+is%3Aclosed)
  - [2.6.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.6.0+is%3Aclosed)
- 2.5
  - [2.5.5](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.5.5+is%3Aclosed)
  - [2.5.4](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.5.4+is%3Aclosed)
  - [2.5.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.5.3+is%3Aclosed)
  - [2.5.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.5.2+is%3Aclosed)
  - [2.5.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.5.1+is%3Aclosed)
  - [2.5.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.5.0+is%3Aclosed)
- 2.4
  - [2.4.9](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.4.9+is%3Aclosed)
  - [2.4.8](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.4.8+is%3Aclosed)
  - [2.4.7](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.4.7+is%3Aclosed)
  - [2.4.6](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.4.6+is%3Aclosed)
  - [2.4.5](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.4.5+is%3Aclosed)
  - [2.4.4](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.4.4+is%3Aclosed)
  - [2.4.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.4.3+is%3Aclosed)
  - [2.4.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.4.2+is%3Aclosed)
  - [2.4.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.4.1+is%3Aclosed)
  - [2.4.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.4.0+is%3Aclosed)
- 2.3
  - [2.3.16](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.3.16+is%3Aclosed)
  - [2.3.15](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.3.15+is%3Aclosed)
  - [2.3.14](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.3.14+is%3Aclosed)
  - [2.3.13](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.3.13+is%3Aclosed)
  - [2.3.11](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.3.11+is%3Aclosed)
  - [2.3.10](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.3.10+is%3Aclosed)
  - [2.3.9](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.3.9+is%3Aclosed)
  - [2.3.8](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.3.8+is%3Aclosed)
  - [2.3.7](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.3.7+is%3Aclosed)
  - [2.3.6](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.3.6+is%3Aclosed)
  - [2.3.5](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.3.5+is%3Aclosed)
  - [2.3.4](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.3.4+is%3Aclosed)
  - [2.3.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.3.3+is%3Aclosed)
  - [2.3.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.3.1+is%3Aclosed)
  - [2.3.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.3.0+is%3Aclosed)
- 2.2
  - [2.2.14](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.2.14+is%3Aclosed)
  - [2.2.13](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.2.13+is%3Aclosed)
  - [2.2.12](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.2.12+is%3Aclosed)
  - [2.2.11](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.2.11+is%3Aclosed)
  - [2.2.10](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.2.10+is%3Aclosed)
  - [2.2.9](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.2.9+is%3Aclosed)
  - [2.2.8](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.2.8+is%3Aclosed)
  - [2.2.7](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.2.7+is%3Aclosed)
  - [2.2.6](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.2.6+is%3Aclosed)
  - [2.2.5](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.2.5+is%3Aclosed)
  - [2.2.4](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.2.4+is%3Aclosed)
  - [2.2.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.2.3+is%3Aclosed)
  - [2.2.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.2.2+is%3Aclosed)
  - [2.2.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.2.1+is%3Aclosed)
  - [2.2.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.2.0+is%3Aclosed)
- 2.1
  - [2.1.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.1.1+is%3Aclosed)
  - [2.1.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.1.0+is%3Aclosed)
- 2.0
  - [2.0.5](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.0.5+is%3Aclosed)
  - [2.0.4](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.0.4+is%3Aclosed)
  - [2.0.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.0.3+is%3Aclosed)
  - [2.0.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.0.2+is%3Aclosed)
  - [2.0.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.0.1+is%3Aclosed)
  - [2.0.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.0.0+is%3Aclosed)

## Citation [](#introduction/citation)

To cite Cytoscape.js in a paper, please cite the Oxford Bioinformatics issue:

*Cytoscape.js: a graph theory library for visualisation and analysis*

Franz M, Lopes CT, Huck G, Dong Y, Sumer O, Bader GD

[Bioinformatics (2016) 32 (2): 309-311 first published online September 28, 2015 doi:10.1093/bioinformatics/btv557](http://bioinformatics.oxfordjournals.org/content/32/2/309) ([PDF](http://bioinformatics.oxfordjournals.org/content/32/2/309.full.pdf))

- [PubMed abstract for the original 2016 article](http://www.ncbi.nlm.nih.gov/pubmed/26415722)
- [PubMed abstract for the 2023 update article](https://pubmed.ncbi.nlm.nih.gov/36645249)

## Funding [](#introduction/funding)

Funding for Cytoscape.js and Cytoscape is provided by NRNB (U.S. National Institutes of Health, National Center for Research Resources grant numbers P41 RR031228 and GM103504) and by NIH grants 2R01GM070743 and 1U41HG006623. The following organizations help develop Cytoscape:

[ISB](http://www.systemsbiology.org) \| [UCSD](http://www.ucsd.edu) \| [MSKCC](http://cbio.mskcc.org) \| [Pasteur](http://www.pasteur.fr) \| [Agilent](http://www.agilent.com/) \| [UCSF](http://www.ucsf.edu/) \| [Unilever](http://www.unilever.com) \| [Toronto](http://www.utoronto.ca) \| [NCIBI](http://portal.ncibi.org/gateway/index.html) \| [NRNB](http://nrnb.org)

# Notation [](#notation)

## Graph model [](#notation/graph-model)

Cytoscape.js supports many different graph theory usecases. It supports directed graphs, undirected graphs, mixed graphs, loops, multigraphs, compound graphs (a type of hypergraph), and so on.

We are regularly making additions and enhancements to the library, and we gladly accept [feature requests](https://github.com/cytoscape/cytoscape.js/issues/new) and [pull requests](https://github.com/cytoscape/cytoscape.js/blob/master/CONTRIBUTING.md).

## Architecture & API [](#notation/architecture-amp-api)

There are two components in the architecture that a programmer must be concerned with in order to use Cytoscape.js, the core (i.e. a graph instance) and the collection. In Cytoscape.js, the core is a programmer’s main entry point into the library. From the core, a programmer can run layouts, alter the viewport, and perform other operations on the graph as a whole.

The core provides several functions to access elements in the graph. Each of these functions returns a collection, a set of elements in the graph. Functions are available on collections that allow the programmer to filter the collection, perform operations on the collection, traverse the graph about the collection, get data about elements in the collection, and so on.

Note that a collection is immutable by default, meaning that the set of elements within a collection can not be changed. The API returns a new collection with different elements when necessary, instead of mutating the existing collection. This allows the programmer to safely use set theory operations on collections, use collections functionally, and so on. Note that because a collection is just a list of elements, it is relatively inexpensive to create new collections.

For very performance intensive code, a collection can be treated as mutable with [`eles.merge()`](#eles.merge) and [`eles.unmerge()`](#eles.unmerge). Most apps should never need these functions.

## Functions [](#notation/functions)

There are several types that different functions can be executed on, and the variable names used to denote these types in the documentation are outlined below:

| Shorthand | Works on                                               |
|-----------|--------------------------------------------------------|
| `cy`      | the core                                               |
| `eles`    | a collection of one or more elements (nodes and edges) |
| `ele`     | a collection of a single element (node or edge)        |
| `nodes`   | a collection of one or more nodes                      |
| `node`    | a collection of a single node                          |
| `edges`   | a collection of one or more edges                      |
| `edge`    | a collection of a single edge                          |
| `layout`  | a layout                                               |
| `ani `    | an animation                                           |

By default, a function returns a reference back to the calling object to allow for chaining (e.g. `obj.fn1().fn2().fn3()`). Unless otherwise indicated in this documentation, a function is chainable in this manner unless a different return value is specified. This applies both to the core and to collections.

For functions that return a value, note that calling a singular — `ele`, `node`, or `edge` — function on a collection of more than one element will return the expected value for only the first element.

## Object ownership [](#notation/object-ownership)

When passing objects to Cytoscape.js for creating elements, animations, layouts, etc., the objects are considered owned by Cytoscape. Objects like elements have several levels to them, and doing deep copies of those objects every time they are passed to Cytoscape creates additional expense. When desired, the programmer can copy objects manually before passing them to Cytoscape. However, copying is not necessary for most programmers most of the time.

## Gestures [](#notation/gestures)

Cytoscape.js supports several gestures:

- Grab and drag background to pan : touch & desktop
- Pinch to zoom : touch & desktop (with supported trackpad)
- Mouse wheel to zoom : desktop
- Two finger trackpad up or down to zoom : desktop
- Tap to select : touch & desktop
- Tap background to unselect : desktop
- Taphold background to unselect : desktop & touch
- Multiple selection via modifier key (shift, command, control, alt) + tap : desktop
- Box selection : touch (three finger swipe) & desktop (modifier key + mousedown then drag)
- Grab and drag nodes : touch & desktop

All gesture actions can be controlled by the programmer, toggling them on or off whenever needed.

## Position [](#notation/position)

A node’s position refers to the centre point of its body.

There is an important distinction to make for position: A position may be a *model* position or a *rendered* position.

A model position — as its name suggests — is the position stored in the model for an element. An element’s model position remains constant, despite changes to zoom and pan. Numeric style property values are specified in model co-ordinates, e.g. a node with width 20px will be 20 pixels wide at zoom 1.

A rendered position is an on-screen location relative to the viewport. For example, a rendered position of `{ x: 100, y: 100 }` specifies a point 100 pixels to the right and 100 pixels down from the top-left corner of the viewport. The model position and rendered position are the same at zoom 1 and pan (0, 0).

An element’s rendered position naturally changes as zoom and pan changes, because the element’s on-screen position in the viewport changes as zooming and panning are applied. Panning is always measured in rendered coordinates.

In this documentation, “position” refers to model position unless otherwise stated.

A node’s position can be set manually, or it can be set automatically using a [layout](#layouts). Because the positions of two nodes influence the lengths of the edges in between them, a layout effectively sets edge lengths.

## Elements JSON [](#notation/elements-json)

Examples are given that outline format of the elements JSON used to load elements into Cytoscape.js:

    cytoscape({

      container: document.getElementById('cy'),

      elements: [ // flat array of nodes and edges
        { // node n1
          group: 'nodes', // 'nodes' for a node, 'edges' for an edge
          // NB the group field can be automatically inferred for you but specifying it
          // gives you nice debug messages if you mis-init elements


          data: { // element data (put json serialisable dev data here)
            id: 'n1', // mandatory (string) id for each element, assigned automatically on undefined
            parent: 'nparent', // indicates the compound node parent id; not defined => no parent
            // (`parent` can be effectively changed by `eles.move()`)
          },

          // scratchpad data (usually temp or nonserialisable data)
          scratch: {
            _foo: 'bar' // app fields prefixed by underscore; extension fields unprefixed
          },

          position: { // the model position of the node (optional on init, mandatory after)
            x: 100,
            y: 100
          },

          selected: false, // whether the element is selected (default false)

          selectable: true, // whether the selection state is mutable (default true)

          locked: false, // when locked a node's position is immutable (default false)

          grabbable: true, // whether the node can be grabbed and moved by the user

          pannable: false, // whether dragging the node causes panning instead of grabbing

          classes: ['foo', 'bar'], // an array (or a space separated string) of class names that the element has

          // DO NOT USE THE `style` FIELD UNLESS ABSOLUTELY NECESSARY
          // USE THE STYLESHEET INSTEAD
          style: { // style property overrides 
            'background-color': 'red'
          }
        },

        { // node n2
          data: { id: 'n2' },
          renderedPosition: { x: 200, y: 200 } // can alternatively specify position in rendered on-screen pixels
        },

        { // node n3
          data: { id: 'n3', parent: 'nparent' },
          position: { x: 123, y: 234 }
        },

        { // node nparent
          data: { id: 'nparent' }
        },

        { // edge e1
          data: {
            id: 'e1',
            // inferred as an edge because `source` and `target` are specified:
            source: 'n1', // the source node id (edge comes from this node)
            target: 'n2'  // the target node id (edge goes to this node)
            // (`source` and `target` can be effectively changed by `eles.move()`)
          },

          pannable: true // whether dragging on the edge causes panning
        }
      ],

      layout: {
        name: 'preset'
      },

      // so we can see the ids
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(id)'
          }
        }
      ]

    });

The elements JSON may alternatively be in the following format, keyed by group:

    cytoscape({
      container: document.getElementById('cy'),

      elements: {
        nodes: [
          {
            data: { id: 'a' }
          },

          {
            data: { id: 'b' }
          }
        ],
        edges: [
          {
            data: { id: 'ab', source: 'a', target: 'b' }
          }
        ]
      },

      layout: {
        name: 'grid',
        rows: 1
      },

      // so we can see the ids
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(id)'
          }
        }
      ]
    });

## Compound nodes [](#notation/compound-nodes)

Compound nodes are an addition to the traditional graph model. A compound node contains a number of child nodes, similar to how a HTML DOM element can contain a number of child elements.

Compound nodes are specified via the `parent` field in a nodes’s `data`. Similar to the `source` and `target` fields of edges, the `parent` field is normally immutable: A node’s parent can be specified when the node is added to the graph, and after that point, this parent-child relationship is immutable via `ele.data()`. However, you can move child nodes via [`eles.move()`](#collection/graph-manipulation/eles.move).

A compound parent node does not have independent dimensions (position and size), as those values are automatically inferred by the positions and dimensions of the descendant nodes.

As far as the API is concerned, compound nodes are treated just like regular nodes — except in [explicitly compound functions](#collection/compound-nodes) like `node.parent()`. This means that traditional graph theory functions like `eles.dijkstra()` and `eles.neighborhood()` do not make special allowances for compound nodes, so you may need to make different calls to the API depending on your usecase.

For instance:

    var a = cy.$('#a'); // assume a compound node

    // the neighbourhood of `a` contains directly connected elements
    var directlyConnected = a.neighborhood();

    // you may want everything connected to its descendants instead
    // because the descendants "belong" to `a`
    var indirectlyConnected = a.add( a.descendants() ).neighborhood();

# Getting started [](#getting-started)

This section will familiarise you with the basic steps necessary to start using Cytoscape.js.

## Including Cytoscape.js [](#getting-started/including-cytoscape.js)

If you are using a simple HTML environment (without a build system), then source Cytoscape.js in a `<script>` tag or [`import`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) it as an [ES6](https://www.w3schools.com/js/js_es6.asp) module, e.g.:

    <script src="cytoscape.min.js"></script>

or

    <script type="module">
    import cytoscape from "./cytoscape.esm.min.js";
    </script>

To use Cytoscape.js from a Content Delivery Network ([CDN](https://en.wikipedia.org/wiki/Content_delivery_network)), use one of the following [CDN](https://en.wikipedia.org/wiki/Content_delivery_network) s:

- [CDNJS](https://cdnjs.com/libraries/cytoscape)
- [jsDelivr](https://www.jsdelivr.com/package/npm/cytoscape?path=dist)
- [Unpkg](https://unpkg.com/cytoscape/dist/)

Please do not hotlink to copies of Cytoscape.js from the documentation — they’re just for the demos.

The available files are available under [`cytoscape/dist/`](https://github.com/cytoscape/cytoscape.js/tree/master/dist) in the `npm` package:

| Build File | Minified | Module System | Description |
|----|----|----|----|
| `cytoscape.min.js` | yes | [UMD](https://github.com/umdjs/umd) (Universal Module Definition) | For use with globals or `require()`. |
| `cytoscape.umd.js` | no | [UMD](https://github.com/umdjs/umd) | For debugging with globals or `require()`. |
| `cytoscape.esm.min.mjs` | yes | [ESM](https://nodejs.org/api/esm.html#introduction) (ECMAScript, uses `import` / `export`) | For use with modern `import`/`export`, i.e. `import cytoscape from 'cytoscape'`. |
| `cytoscape.cjs.js` | no | [CJS](https://nodejs.org/api/modules.html#modules-commonjs-modules) (CommonJS, used by [Node.js](https://en.wikipedia.org/wiki/Node.js)) | Intended to be consumed automatically by [Node.js](https://en.wikipedia.org/wiki/Node.js) or a bundler like [Webpack](https://webpack.js.org/) via `require('cytoscape')`. |
| `cytoscape.esm.mjs` | no | [ESM](https://nodejs.org/api/esm.html#introduction) | Intended to be consumed automatically by [Node.js](https://en.wikipedia.org/wiki/Node.js) or a bundler like [Webpack](https://webpack.js.org/) via `import cytoscape from 'cytoscape'`. This file may alternatively be used for manually debugging ESM builds or pages that use ESM. |

Note that Cytoscape.js uses the dimensions of your HTML DOM element container for layouts and rendering at initialisation. Thus, it is very important to place your CSS stylesheets in the `<head>` before any Cytoscape.js-related code. Otherwise, dimensions may be sporadically reported incorrectly, resulting in undesired behaviour.

Your stylesheet may include something like this (assuming a DOM element with ID `cy` is used as the container):

    #cy {
      width: 300px;
      height: 300px;
      display: block;
    }

To install Cytoscape.js via npm:

    npm install cytoscape

To use Cytoscape.js in an [ESM](https://nodejs.org/api/esm.html#introduction) environment with npm (e.g. [Webpack](https://webpack.js.org/) or [Node.js](https://en.wikipedia.org/wiki/Node.js) with the [`esm`](https://www.npmjs.com/package/esm) package):

    import cytoscape from 'cytoscape';

Note that the following will not work, as you must use the default export:

    import * as cytoscape from 'cytoscape'; // won't work

To use Cytoscape.js in a CommonJS environment like Node.js:

    var cytoscape = require('cytoscape');

To use Cytoscape.js with [AMD](https://en.wikipedia.org/wiki/Asynchronous_module_definition)/[Require.js](https://requirejs.org/):

    require(['cytoscape'], function(cytoscape){
      // ...
    });

To install Cytoscape.js via Bower:

    bower install cytoscape

To install Cytoscape.js via Meteor/Atmosphere:

    npm install cytoscape

Cytoscape.js supports environments with ES5 or newer, as it is transpiled by Babel and it uses only basic features of the standard library. Feature detection is used for optional features that improve performance. However, a future version of Cytoscape.js may require a more up-to-date version of the standard library. You may want to use [`core-js`](https://github.com/zloirock/core-js) if you want to support old browsers in future.

## Initialisation [](#getting-started/initialisation)

An instance of Cytoscape.js corresponds to a graph. You can create an instance as follows:

    var cy = cytoscape({
      container: document.getElementById('cy') // container to render in
    });

You can pass a jQuery instance as the `container` for convenience:

    var cy = cytoscape({
      container: $('#cy')
    });

If you are running Cytoscape.js in [Node.js](https://en.wikipedia.org/wiki/Node.js) or otherwise running it headlessly, you will not specify the `container` option. In implicitly headless environments like [Node.js](https://en.wikipedia.org/wiki/Node.js), an instance is automatically headless. To explicitly run a headless instance (e.g. in the browser) you can specify `options.headless` as `true`.

## Specifying basic options [](#getting-started/specifying-basic-options)

For visualisation, the `container`, [`elements`](#notation/elements-json), [`style`](#style), and [`layout`](#layouts) options usually should be set:

    var cy = cytoscape({

      container: document.getElementById('cy'), // container to render in

      elements: [ // list of graph elements to start with
        { // node a
          data: { id: 'a' }
        },
        { // node b
          data: { id: 'b' }
        },
        { // edge ab
          data: { id: 'ab', source: 'a', target: 'b' }
        }
      ],

      style: [ // the stylesheet for the graph
        {
          selector: 'node',
          style: {
            'background-color': '#666',
            'label': 'data(id)'
          }
        },

        {
          selector: 'edge',
          style: {
            'width': 3,
            'line-color': '#ccc',
            'target-arrow-color': '#ccc',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier'
          }
        }
      ],

      layout: {
        name: 'grid',
        rows: 1
      }

    });

## Next steps [](#getting-started/next-steps)

Now that you have a core (graph) instance with basic options, explore the [core API](#core). It’s your entry point to all the features in Cytoscape.js.

If you have code questions about Cytoscape.js, please feel free to [post your question to Stackoverflow](http://stackoverflow.com/questions/ask?tags=cytoscape.js).

# Core [](#core)

The core object is your interface to a graph. It is your entry point to Cytoscape.js: All of the library’s features are accessed through this object.

## Initialisation [](#core/initialisation)

### Initialisation

A graph can be created as follows:

    var cy = cytoscape({ /* options */ });

You can initialise the core without any options. If you want to use Cytoscape as a visualisation, then a `container` DOM element is required, e.g.:

    var cy = cytoscape({
      container: document.getElementById('cy')
    });

Note that in order to guarantee custom font usage (WOFF/WOFF2), the fonts in question must be loaded before Cytoscape is initialised.

Note that Cytoscape.js will print warning messages to the console to help programmers avoid mistakes. If you want to disable these messages, call `cytoscape.warnings(false)` to turn warnings off completely. You can turn them back on with `cytoscape.warnings(true)`, and you can get the current state with `cytoscape.warnings()`. It is recommended that you leave warnings enabled at least for development builds of your app.

The following sections go over the options in more detail.

### Initialisation options

An instance of Cytoscape.js has a number of options that can be set on initialisation. They are outlined below with their default values.

Note that everything is optional. By default, you get an empty graph with the default stylesheet. Environments outside the browser (e.g. Node.js) are automatically set as headless for convenience.

    var cy = cytoscape({
      // very commonly used options
      container: undefined,
      elements: [ /* ... */ ],
      style: [ /* ... */ ],
      layout: { name: 'grid' /* , ... */ },
      data: { /* ... */ },

      // initial viewport state:
      zoom: 1,
      pan: { x: 0, y: 0 },

      // interaction options:
      minZoom: 1e-50,
      maxZoom: 1e50,
      zoomingEnabled: true,
      userZoomingEnabled: true,
      panningEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: true,
      selectionType: 'single',
      touchTapThreshold: 8,
      desktopTapThreshold: 4,
      autolock: false,
      autoungrabify: false,
      autounselectify: false,
      multiClickDebounceTime: 250,

      // rendering options:
      headless: false,
      styleEnabled: true,
      hideEdgesOnViewport: false,
      textureOnViewport: false,
      motionBlur: false,
      motionBlurOpacity: 0.2,
      wheelSensitivity: 1,
      pixelRatio: 'auto'
    });

### Very commonly used options

**`container`** : A HTML DOM element in which the graph should be rendered. This is unspecified if Cytoscape.js is run headlessly. The container is expected to be an empty div with its own width and height set by the page’s styles; the visualisation owns the div’s contents.

**`elements`** : An array of [elements specified as plain objects](#notation/elements-json). For convenience, this option can alternatively be specified as a promise that resolves to the elements JSON.

**`style`** : The [stylesheet](#style) used to style the graph. For convenience, this option can alternatively be specified as a promise that resolves to the stylesheet.

**`layout`** : A plain object that specifies layout options. Which layout is initially run is specified by the `name` field. Refer to a [layout’s documentation](#layouts) for the options it supports. If you want to specify your node positions yourself in your elements JSON, you can use the `preset` layout — by default it does not set any positions, leaving your nodes in their current positions (i.e. specified in `options.elements` at initialisation time).

**`data`** : A plain object that contains [graph-level data](#cy.data) (i.e. data that does not belong to any particular node or edge).

### Initial viewport state

**`zoom`** : The initial zoom level of the graph. Make sure to disable viewport manipulation options, such as `fit`, in your layout so that it is not overridden when the layout is applied. You can set **`options.minZoom`** and **`options.maxZoom`** to set restrictions on the zoom level.

**`pan`** : The initial panning position of the graph. Make sure to disable viewport manipulation options, such as `fit`, in your layout so that it is not overridden when the layout is applied.

### Interaction options

**`minZoom`** : A minimum bound on the zoom level of the graph. The viewport can not be scaled smaller than this zoom level.

**`maxZoom`** : A maximum bound on the zoom level of the graph. The viewport can not be scaled larger than this zoom level.

**`zoomingEnabled`** : Whether zooming the graph is enabled, both by user events and programmatically.

**`userZoomingEnabled`** : Whether user events (e.g. mouse wheel, pinch-to-zoom) are allowed to zoom the graph. Programmatic changes to zoom are unaffected by this option.

**`panningEnabled`** : Whether panning the graph is enabled, both by user events and programmatically.

**`userPanningEnabled`** : Whether user events (e.g. dragging the graph background) are allowed to pan the graph. Programmatic changes to pan are unaffected by this option.

**`boxSelectionEnabled`** : Whether box selection (i.e. drag a box overlay around, and release it to select) is enabled. If enabled while panning is also enabled, the user must use a modifier key (shift, alt, control, or command) to use box selection.

**`selectionType`** : A string indicating the selection behaviour from user input. For `'additive'`, a new selection made by the user adds to the set of currently selected elements. For `'single'`, a new selection made by the user becomes the entire set of currently selected elements (i.e. the previous elements are unselected).

**`touchTapThreshold`** & **`desktopTapThreshold`** : A non-negative integer that indicates the maximum allowable distance that a user may move during a tap gesture, on touch devices and desktop devices respectively. This makes tapping easier for users. These values have sane defaults, so it is not advised to change these options unless you have very good reason for doing so. Large values will almost certainly have undesirable consequences.

**`autoungrabify`** : Whether nodes should be ungrabified (not grabbable by user) by default (if `true`, overrides individual node state).

**`autolock`** : Whether nodes should be locked (not draggable at all) by default (if `true`, overrides individual node state).

**`autounselectify`** : Whether nodes should be unselectified (immutable selection state) by default (if `true`, overrides individual element state).

**`multiClickDebounceTime`** : Debouce time in milliseconds to check for `dblclick` event before executing the `oneclick` event

### Rendering options

**`headless`** : A convenience option that initialises the instance to run headlessly. You do not need to set this in environments that are implicitly headless (e.g. Node.js). However, it is handy to set `headless: true` if you want a headless instance in a browser.

**`styleEnabled`** : A boolean that indicates whether styling should be used. For headless (i.e. outside the browser) environments, display is not necessary and so neither is styling necessary — thereby speeding up your code. You can manually enable styling in headless environments if you require it for a special case. Note that it does not make sense to disable style if you plan on rendering the graph. Also note that [`cy.destroy()`](#cy.destroy) must be called to clean up a style-enabled, headless instance.

**`hideEdgesOnViewport`** : A rendering hint that when set to `true` makes the renderer not render edges while the viewport is being manipulated. This makes panning, zooming, dragging, et cetera more responsive for large graphs. This option is now largely moot, as a result of performance enhancements.

**`textureOnViewport`** : A rendering hint that when set to `true` makes the renderer use a texture during panning and zooming instead of drawing the elements, making large graphs more responsive. This option is now largely moot, as a result of performance enhancements.

**`motionBlur`** : A rendering hint that when set to `true` makes the renderer use a motion blur effect to make the transition between frames seem smoother. This can increase the perceived performance for a large graphs. This option is now largely moot, as a result of performance enhancements.

**`motionBlurOpacity`** : When `motionBlur: true`, this value controls the opacity of motion blur frames. Higher values make the motion blur effect more pronounced. This option is now largely moot, as a result of performance enhancements.

**`wheelSensitivity`** : Changes the scroll wheel sensitivity when zooming. This is a multiplicative modifier. So, a value between 0 and 1 reduces the sensitivity (zooms slower), and a value greater than 1 increases the sensitivity (zooms faster). This option is set to a sane value that works well for mainstream mice (Apple, Logitech, Microsoft) on Linux, Mac, and Windows. If the default value seems too fast or too slow on your particular system, you may have non-default mouse settings in your OS or a niche mouse. You should not change this value unless your app is meant to work only on specific hardware. Otherwise, you risk making zooming too slow or too fast for most users.

**`pixelRatio`** : Overrides the screen pixel ratio with a manually set value (`1.0` recommended, if set). This can be used to increase performance on high density displays by reducing the effective area that needs to be rendered, though this is much less necessary on more recent browser releases. If you want to use the hardware’s actual pixel ratio, you can set `pixelRatio: 'auto'` (default).

## Graph manipulation [](#core/graph-manipulation)

cy.add() [](#cy.add)        

Add elements to the graph and return them.

cy.add( , eleObj )

Add a specified element to the graph.

- [eleObj](#notation/elements-json)

  A plain object that specifies the element.

cy.add( , eleObjs )

Add the specified elements to the graph.

- [eleObjs](#notation/elements-json)

  An array of elements specified by plain objects.

cy.add( , eles )

Add the specified elements to the graph.

- [eles](#collection)

  A collection of elements.

### Details

If plain element objects are used, then [the same format used at initialisation](#core/initialisation) must be followed.

If a collection of existing elements is specified to a different core instance, then copies of those elements are added, which allows for elements to be effectively transferred between instances of Cytoscape.js.

### Examples

Add a node from a plain object.

    cy.add({
        group: 'nodes',
        data: { weight: 75 },
        position: { x: 200, y: 200 }
    });

Add nodes and edges to the graph as plain objects:

    // can use reference to eles later
    var eles = cy.add([
      { group: 'nodes', data: { id: 'n0' }, position: { x: 100, y: 100 } },
      { group: 'nodes', data: { id: 'n1' }, position: { x: 200, y: 200 } },
      { group: 'edges', data: { id: 'e0', source: 'n0', target: 'n1' } }
    ]);

cy.remove() [](#cy.remove)      

Remove elements from the graph and return them.

cy.remove( , eles )

Remove the specified elements.

- [eles](#collection)

  A collection of elements to remove.

cy.remove( , selector )

Remove elements in the graph matching the specified selector.

- [selector](#selectors)

  Elements matching this selector are removed.

### Details

Note that removing a node necessarily removes its connected edges.

Though the elements specified to this function are removed from the graph, they may still exist in memory. However, almost all functions will not work on removed elements. For example, the `eles.neighborhood()` function will fail for a removed element: An element outside of the context of the graph can not have a neighbourhood defined. A removed element exists only so you can restore it back to the originating core instance or to a new instance.

### Examples

Remove an element:

    var j = cy.$('#j');
    cy.remove( j );

Remove a collection:

    var collection = cy.elements('node[weight > 50]');
    cy.remove( collection );

Remove elements matching a selector:

    cy.remove('node[weight > 50]'); // remove nodes with weight greater than 50

cy.collection() [](#cy.collection)      

Return a new collection, empty or with new elements in a removed state.

cy.collection()

Get an empty collection.

cy.collection( , eleObjs, options )

Create a collection with new elements in a removed state.

- [eleObjs](#notation/elements-json)

  Elements to be created

- options

  The options for the collection

  - removed

    A truthy value that sets whether the elements are in the removed state (true) or added to the graph (false, default).

### Details

This function is useful for building up collections.

### Examples

Keep a collection of nodes that have been clicked:

    var collection = cy.collection();
    cy.nodes().on('click', function(e){
      var clickedNode = e.target;

      collection = collection.union(clickedNode);
    });

Create a collection of new nodes that have not been added to the graph:

    var removedCollection = cy.collection([{ data: { id: 'a' } }, { data: { id: 'b' } }], { removed: true });

    removedCollection.forEach(element => {
      console.log(element.removed()); // true
    };

cy.getElementById() [](#cy.getElementById)       Aliases: `cy.$id()`,

Get an element from its ID in a very performant way.

cy.getElementById( , id )

- id

  The ID of the element to get.

### Examples

    cy.getElementById('j');

Using the shorter alias:

    cy.$id('j');

cy.\$() et al [](#cy.$)              

Get elements in the graph matching a selector or a filter function.

cy.\$( , selector )

Get elements in the graph matching the specified selector.

- [selector](#selectors)

  The selector the elements should match.

cy.elements( , selector )

Get elements in the graph matching the specified selector.

- [selector](#selectors)

  The selector the elements should match.

cy.nodes( , selector )

Get nodes in the graph matching the specified selector.

- [selector](#selectors)

  The selector the nodes should match.

cy.edges( , selector )

Get edges in the graph matching the specified selector.

- [selector](#selectors)

  The selector the edges should match.

cy.filter( , selector )

Get elements in the graph matching the specified selector.

- [selector](#selectors)

  The selector the elements should match.

cy.filter( , function(ele, i, eles) )

Get elements in the graph matching the specified filter function.

- function(ele, i, eles)

  The filter function that returns true for elements that should be returned.

  - [ele](#collection)

    The current element under consideration for filtering.

  - i

    The counter used for iteration over the elements in the graph.

  - [eles](#collection)

    The collection of elements being filtered

### Details

If no elements in the graph match the selector, an empty [collection](#collection) is returned.

The function `cy.$()` acts as an alias to `cy.filter()`: It lets you type less characters. It is analogous to the jQuery `$` alias used to search the document

### Examples

Get nodes with weight greater than 50:

    cy.nodes('[weight > 50]');

Get edges with source node `n0`:

    cy.edges('[source = "j"]');

Get all nodes and edges with weight greater than 50:

    cy.elements('[weight > 50]');
    cy.filter('[weight > 50]'); // works the same as the above line

Get nodes with weight greater than 50 with a filter function:

    cy.filter(function(element, i){
      return element.isNode() && element.data('weight') > 50;
    });

cy.batch() et al [](#cy.batch)        

Allow for manipulation of elements without triggering multiple style calculations or multiple redraws.

cy.batch( , function() )

- function()

  A callback within which you can make batch updates to elements.

cy.startBatch()

Starts batching manually (useful for asynchronous cases).

cy.endBatch()

Ends batching manually (useful for asynchronous cases).

### Details

Do not add batching to your app unless you have identified an applicable performance bottleneck. There are restrictions on what kind of code you can run in a batch.

Normally, when you modify elements, each modification can trigger a style calculation and a redraw — depending on timing for a redraw. For example, the following will cause two style calculations and at least one draw:

    cy.$('#j')
      .data('weight', '70')   // style update
      .addClass('funny')      // style update AGAIN
      .removeClass('serious') // style update YET AGAIN

      // at least 1 redraw here
      // possibly 3 total depending on speed of above operations
      // (for one ele almost certainly 1 redraw, but consider many eles)
    ;

This is not a problem for a handful of operations on a handful of elements, but for many operations on many elements you end up with redundant style calculations and probably redundant redraws. In the worst case, you have `eles.length * numOps` style updates and redraws — and both style updates and redraws can be expensive. In the worst case when using `cy.batch()`, you limit the style updates to `eles.length` and you limit the redraws to just one.

Thus, this function is useful for making many changes to elements at once. When the specified callback function is complete, only elements that require it have their style updated and the renderer makes at most a single redraw.

This makes for very efficient modifications to elements, but it has some caveats inside a batch:

- You can not reliably read element style or dimensions (it may have changed, or computed values may be out of date).
- You probably do not want to use `eles.style()` et cetera because they force a style bypass rather than a recalculation.
- You can not apply any style-dependent operation within the batch if you have already modified style within the same batch. Common style-dependent operations include:
  - Layout: `cy.layout()`, `eles.layout()`, etc.
  - Reading style: `ele.style()`, `ele.numericStyle()`, etc.
  - Reading dimensions: `ele.midpoint()`, `ele.boundingBox()`, etc.
  - Animation: `ele.animation()`, `cy.animate()`, etc.
  - And so on…

A batch should correspond to a single visual operation. Usually a batch should contain calls only to the following functions:

- Modifying state: `eles.data()`, `eles.scratch()`, `eles.addClass()`, `eles.removeClass()`, etc.
- Building collections: `eles.union()`, `eles.difference()`, `eles.intersection()`, etc.
- Comparison: `eles.same()`, `eles.some()`, etc.
- Iteration: `eles.forEach()`, `eles.empty()`, etc.
- Traversal: `node.outgoers()`, `eles.bfs()`, etc.
- Algorithms: `eles.dijkstra()`, `eles.degreeCentrality()`, etc.

### Examples

Synchronous style:

    cy.batch(function(){
      cy.$('#j')
        .data('weight', '70')
        .addClass('funny')
        .removeClass('serious')
      ;
    });

Asynchronous style:

    cy.startBatch();

    cy.$('#j')
      .data('weight', '70')
      .addClass('funny')
      .removeClass('serious')
    ;

    cy.endBatch();

cy.mount() [](#cy.mount)    

Attaches the instance to the specified container for visualisation.

cy.mount( , container )

- container

  A HTML DOM element in which the graph should be rendered.

### Details

If the core instance is headless prior to calling `cy.mount()`, then the instance will no longer be headless and the visualisation will be shown in the specified container. If the core instance is non-headless prior to calling `cy.mount()`, then the visualisation is swapped from the prior container to the specified container.

cy.unmount() [](#cy.unmount)  

Remove the instance from its current container.

### Details

This function sets the instance to be headless after unmounting from the current container.

cy.destroy() [](#cy.destroy)  

A convenience function to explicitly destroy the instance.

### Details

The `cy.destroy()` function is not necessary but can be convenient in some cases. It cleans up references and rendering loops such that the memory used by an instance can be garbage collected.

If you remove the container DOM element from the page, then the instance is cleaned up automatically. Similarly, calling `cy.destroy()` does this cleanup and removes all the container’s children from the page.

When running Cytoscape.js headlessly, using `cy.destroy()` is necessary only if you’ve explicitly enabled style functionality.

To drop the memory used by an instance, it is necessary to drop all of your own references to that instance so it can be garbage collected.

cy.destroyed() [](#cy.destroyed)  

Get whether the instance of Cytoscape.js has been destroyed or not.

## Data [](#core/data)

cy.data() [](#cy.data)             Aliases: `cy.attr()`,

Read and write developer-defined data associated with the graph.

cy.data()

Get the entire data object.

cy.data( , name )

Get a particular data field.

- name

  The name of the field to get.

cy.data( , name, value )

Set a particular data field.

- name

  The name of the field to set.

- value

  The value to set for the field.

cy.data( , obj )

Update multiple data fields at once via an object.

- obj

  The object containing name-value pairs to update data fields.

cy.removeData() [](#cy.removeData)         Aliases: `cy.removeAttr()`,

Remove developer-defined data associated with the elements.

cy.removeData()

Removes all mutable data fields for the elements.

cy.removeData( , names )

Removes the specified mutable data fields for the elements.

- names

  A space-separated list of fields to delete.

cy.scratch() [](#cy.scratch)         [Extension](#extensions) function: This function is intended for use in extensions.

Set or get scratchpad data, where temporary or non-JSON data can be stored. App-level scratchpad data should use namespaces prefixed with underscore, like `'_foo'`. This is analogous to the more common [`ele.scratch()`](#ele.scratch) but for graph global data.

cy.scratch()

Get the entire scratchpad object for the core.

cy.scratch( , namespace )

Get the scratchpad at a particular namespace.

- namespace

  A namespace string.

cy.scratch( , namespace, value )

Set the scratchpad at a particular namespace.

- namespace

  A namespace string.

- value

  The value to set at the specified namespace.

cy.removeScratch() [](#cy.removeScratch)     [Extension](#extensions) function: This function is intended for use in extensions.

Remove scratchpad data. You should remove scratchpad data only at your own namespaces. This is analogous to the more common [`ele.removeScratch()`](#ele.removeScratch) but for graph global data.

cy.removeScratch( , namespace )

Remove the scratchpad data at a particular namespace.

- namespace

  A namespace string.

Note that `ele.removeScratch()` sets the scratchpad object for the specified namespace to `undefined`. This allows you to use meaningful `null` values.

## Events [](#core/events)

cy.on() [](#cy.on)           Aliases: `cy.bind()`, `cy.listen()`, `cy.addListener()`,

Listen to events that occur on the core.

cy.on( , events \[, selector\], function(event) )

- [events](#events)

  A space separated list of event names.

- [selector](#selectors) \[optional\]

  A selector to specify elements for which the handler runs.

- function(event)

  The handler function that is called when one of the specified events occurs.

  - [event](#events)

    The event object.

### Examples

Listen to events that bubble up from elements matching the specified `node` selector:

    cy.on('tap', 'node', function(evt){
      var node = evt.target;
      console.log( 'tapped ' + node.id() );
    });

Listen to all tap events that the core receives:

    cy.on('tap', function(event){
      // target holds a reference to the originator
      // of the event (core or element)
      var evtTarget = event.target;

      if( evtTarget === cy ){
        console.log('tap on background');
      } else {
        console.log('tap on some element');
      }
    });

cy.promiseOn() [](#cy.promiseOn)       Aliases: `cy.pon()`,

Get a promise that is resolved when the core emits the first of any of the specified events.

cy.promiseOn( , events \[, selector\] )

- [events](#events)

  A space separated list of event names.

- [selector](#selectors) \[optional\]

  A selector to specify elements for which the handler runs.

### Examples

    cy.pon('tap').then(function( event ){
      console.log('tap promise fulfilled');
    });

cy.one() [](#cy.one)    

Listen to events that occur on the core, and run the handler only once.

cy.one( , events \[, selector\], function(event) )

- [events](#events)

  A space separated list of event names.

- [selector](#selectors) \[optional\]

  A selector to specify elements for which the handler runs.

- function(event)

  The handler function that is called when one of the specified events occurs.

  - [event](#events)

    The event object.

### Examples

    cy.one('tap', 'node', function(){
      console.log('tap!');
    });

    cy.$('node').eq(0).trigger('tap'); // tap!
    cy.$('node').eq(1).trigger('tap'); // nothing b/c already tapped

cy.removeListener() [](#cy.removeListener)           Aliases: `cy.off()`, `cy.unbind()`, `cy.unlisten()`,

Remove event handlers on the core.

cy.removeListener( , events \[, selector\] \[, handler\] )

- [events](#events)

  A space separated list of event names.

- [selector](#selectors) \[optional\]

  The same selector used to listen to the events.

- handler \[optional\]

  A reference to the handler function to remove.

### Examples

For all handlers:

    cy.on('tap', function(){ /* ... */ });

    // remove all tap listener handlers, including the one above
    cy.removeListener('tap');

For a particular handler:

    var handler = function(){
      console.log('called handler');
    };
    cy.on('tap', handler);

    var otherHandler = function(){
      console.log('called other handler');
    };
    cy.on('tap', otherHandler);

    // just remove handler
    cy.removeListener('tap', handler);

cy.removeAllListeners() [](#cy.removeAllListeners)  

Remove all event handlers on the core.

cy.emit() [](#cy.emit)       Aliases: `cy.trigger()`,

Emit one or more events.

cy.emit( , events \[, extraParams\] )

- [events](#events)

  A list of event names to emit (either a space-separated string or an array)

- extraParams \[optional\]

  An array of additional parameters to pass to the handler.

### Examples

    cy.on('tap', function(evt, f, b){
      console.log('tap', f, b);
    });

    cy.emit('tap', ['foo', 'bar']);

cy.ready() [](#cy.ready)    

Run a callback as soon as the graph becomes ready (i.e. intitial data loaded and initial layout completed). If the graph is already ready, then the callback is called immediately. If data is loaded synchronously and the layout used is discrete/synchronous/unanimated/unspecified, then you don’t need `cy.ready()`.

cy.ready( , function(event) )

- function(event)

  The callback run as soon as the graph is ready.

  - [event](#events)

    The `ready` event.

## Viewport manipulation [](#core/viewport-manipulation)

cy.container() [](#cy.container)  

Get the HTML DOM element in which the graph is visualised. A null value is returned if the instance is headless.

cy.center() [](#cy.center)         Aliases: `cy.centre()`,

Pan the graph to the centre of a collection.

cy.center()

Centre on all elements in the graph.

cy.center( , eles )

Centre on the specified elements.

- [eles](#collection)

  The collection to centre upon.

### Details

If no collection is specified, then the graph is centred on all nodes and edges in the graph.

### Examples

Centre the graph on node `j`:

    var j = cy.$('#j');
    cy.center( j );

cy.fit() [](#cy.fit)      

Pan and zooms the graph to fit to a collection.

cy.fit()

Fit to all elements in the graph.

cy.fit( \[, eles\] \[, padding\] )

Fit to the specified elements.

- [eles](#collection) \[optional\]

  The collection to fit to.

- padding \[optional\]

  An amount of padding (in rendered pixels) to have around the graph (default `0`).

### Details

If no collection is specified, then the graph is fit to all nodes and edges in the graph.

### Examples

Fit the graph on nodes `j` and `e`:

    cy.fit( cy.$('#j, #e') );

cy.reset() [](#cy.reset)    

Reset the graph to the default zoom level and panning position.

cy.reset()

Resets the zoom and pan.

### Details

This resets the viewport to the origin (0, 0) at zoom level 1.

### Examples

    setTimeout( function(){
      cy.pan({ x: 50, y: -100 });
    }, 1000 );

    setTimeout( function(){
      cy.zoom( 2 );
    }, 2000 );

    setTimeout( function(){
      cy.reset();
    }, 3000 );

cy.pan() [](#cy.pan)      

Get or set the panning position of the graph.

cy.pan()

Get the current panning position.

cy.pan( , renderedPosition )

Set the current panning position.

- [renderedPosition](#notation/position)

  The rendered position to pan the graph to.

### Details

This function pans the graph viewport origin to the specified rendered pixel position.

### Examples

Pan the graph to (100, 100) rendered pixels.

    cy.pan({
      x: 100,
      y: 100 
    });

    console.log( cy.pan() ); // prints { x: 100, y: 100 }

cy.panBy() [](#cy.panBy)    

Relatively pan the graph by a specified rendered position vector.

cy.panBy( , renderedPosition )

- [renderedPosition](#notation/position)

  The rendered position vector to pan the graph by.

### Details

This function shifts the viewport relatively by the specified position in rendered pixels. That is, specifying a shift of 100 to the right means a translation of 100 on-screen pixels to the right.

### Examples

Pan the graph 100 pixels to the right.

    cy.panBy({
      x: 100,
      y: 0 
    });

cy.panningEnabled() [](#cy.panningEnabled)      

Get or set whether panning is enabled.

cy.panningEnabled()

Get whether panning is enabled.

cy.panningEnabled( , bool )

Set whether panning is enabled.

- bool

  A truthy value enables panning; a falsey value disables it.

### Examples

Enable:

    cy.panningEnabled( true );

Disable:

    cy.panningEnabled( false );

cy.userPanningEnabled() [](#cy.userPanningEnabled)      

Get or set whether panning by user events (e.g. dragging the graph background) is enabled.

cy.userPanningEnabled()

Get whether user panning is enabled.

cy.userPanningEnabled( , bool )

Set whether user panning is enabled.

- bool

  A truthy value enables user panning; a falsey value disables it.

### Examples

Enable:

    cy.userPanningEnabled( true );

Disable:

    cy.userPanningEnabled( false );

cy.zoom() [](#cy.zoom)        

Get or set the zoom level of the graph.

cy.zoom()

Get the zoom level.

cy.zoom( , level )

Set the zoom level.

- level

  The zoom level to set.

cy.zoom( , options )

Set the zoom level.

- options

  The options for zooming.

  - level

    The zoom level to set.

  - [position](#notation/position)

    The position about which to zoom.

  - [renderedPosition](#notation/position)

    The rendered position about which to zoom.

### Details

The zoom level must be a positive number. Zoom levels that are not numbers are ignored; zoom levels that are numbers but outside of the range of valid zoom levels are considered to be the closest, valid zoom level.

When zooming about a point via `cy.zoom( options )`, the options are defined as follows.

For zooming about a rendered position (i.e. a position on-screen):

    cy.zoom({
      level: 2.0, // the zoom level
      renderedPosition: { x: 100, y: 100 }
    });

For zooming about a model position:

    cy.zoom({
      level: 2.0, // the zoom level
      position: { x: 0, y: 0 }
    });

You can zoom about a position or a rendered position but not both. You should specify only one of `options.position` or `options.renderedPosition`.

### Examples

Zoom in to factor 2

    cy.zoom(2);

Zoom in to the minimum zoom factor

    cy.zoom(0); // 0 is outside of the valid range and
                // its closest valid level is the min

Zoom in to the maximum zoom factor

    cy.zoom(1/0); // infinity is outside of the valid range and
                  // its closest valid level is the max

Zoom about a node

    cy.zoom({
      level: 1.5,
      position: cy.getElementById('j').position()
    });

cy.zoomingEnabled() [](#cy.zoomingEnabled)      

Get or set whether zooming is enabled.

cy.zoomingEnabled()

Get whether zooming is enabled.

cy.zoomingEnabled( , bool )

Set whether zooming is enabled.

- bool

  A truthy value enables zooming; a falsey value disables it.

### Examples

Enable:

    cy.zoomingEnabled( true );

Disable:

    cy.zoomingEnabled( false );

cy.userZoomingEnabled() [](#cy.userZoomingEnabled)      

Get or set whether zooming by user events (e.g. mouse wheel, pinch-to-zoom) is enabled.

cy.userZoomingEnabled()

Get whether user zooming is enabled.

cy.userZoomingEnabled( , bool )

Set whether user zooming is enabled.

- bool

  A truthy value enables user zooming; a falsey value disables it.

### Examples

Enable:

    cy.userZoomingEnabled( true );

Disable:

    cy.userZoomingEnabled( false );

cy.minZoom() [](#cy.minZoom)      

Get or set the minimum zoom level.

cy.minZoom()

Get the minimum zoom level.

cy.minZoom( , zoom )

Set the minimum zoom level.

- zoom

  The new minimum zoom level to use.

cy.maxZoom() [](#cy.maxZoom)      

Get or set the maximum zoom level.

cy.maxZoom()

Get the maximum zoom level.

cy.maxZoom( , zoom )

Set the maximum zoom level.

- zoom

  The new maximum zoom level to use.

cy.viewport() [](#cy.viewport)    

Set the viewport state (pan & zoom) in one call.

cy.viewport( , options )

- options

  The viewport options.

  - zoom

    The zoom level to set.

  - [pan](#notation/position)

    The pan to set (a rendered position).

### Examples

    cy.viewport({
      zoom: 2,
      pan: { x: 100, y: 100 }
    });

cy.boxSelectionEnabled() [](#cy.boxSelectionEnabled)      

Get or set whether box selection is enabled. If enabled along with panning, the user must hold down one of shift, control, alt, or command to initiate box selection.

cy.boxSelectionEnabled()

Get whether box selection is enabled.

cy.boxSelectionEnabled( , bool )

Set whether box selection is enabled.

- bool

  A truthy value enables box selection; a falsey value disables it.

### Examples

Enable:

    cy.boxSelectionEnabled( true );

Disable:

    cy.boxSelectionEnabled( false );

cy.selectionType() [](#cy.selectionType)      

Get or set the selection type. The `'single'` selection type is the default, tapping an element selects that element and deselects the previous elements. The `'additive' selection type toggles the selection state of an element when tapped.`

cy.selectionType()

Get the selection type string.

cy.selectionType( , type )

Set the selection type.

- type

  The selection type string; one of `'single'` (default) or `'additive'`.

cy.width() [](#cy.width)  

Get the on-screen width of the viewport in pixels.

cy.height() [](#cy.height)  

Get the on-screen height of the viewport in pixels.

cy.extent() [](#cy.extent)  

Get the extent of the viewport, a bounding box in model co-ordinates that lets you know what model positions are visible in the viewport.

### Details

This function returns a plain object bounding box with format `{ x1, y1, x2, y2, w, h }`.

cy.renderedExtent() [](#cy.renderedExtent)  

Get the width and height of the viewport canvas in [rendered (on-screen) points](#notation/position).

### Details

This function returns a plain object bounding box with format `{ x1, y1, x2, y2, w, h }`.

cy.autolock() [](#cy.autolock)      

Get or set whether nodes are automatically locked (i.e. if `true`, nodes are locked despite their individual state).

cy.autolock()

Get whether autolocking is enabled.

cy.autolock( , bool )

Set whether autolocking is enabled.

- bool

  A truthy value enables autolocking; a falsey value disables it.

### Examples

Enable:

    cy.autolock( true );

Disable:

    cy.autolock( false );

cy.autoungrabify() [](#cy.autoungrabify)      

Get or set whether nodes are automatically ungrabified (i.e. if `true`, nodes are ungrabbable despite their individual state).

cy.autoungrabify()

Get whether autoungrabifying is enabled.

cy.autoungrabify( , bool )

Set whether autoungrabifying is enabled.

- bool

  A truthy value enables autoungrabbifying; a falsey value disables it.

### Examples

Enable:

    cy.autoungrabify( true );

Disable:

    cy.autoungrabify( false );

cy.autounselectify() [](#cy.autounselectify)      

Get or set whether nodes are automatically unselectified (i.e. if `true`, nodes are unselectable despite their individual state).

cy.autounselectify()

Get whether autounselectifying is enabled.

cy.autounselectify( , bool )

Set whether autounselectifying is enabled.

- bool

  A truthy value enables autounselectifying; a falsey value disables it.

### Examples

Enable:

    cy.autounselectify( true );

Disable:

    cy.autounselectify( false );

cy.resize() [](#cy.resize)     Aliases: `cy.invalidateDimensions()`,

Force the renderer to recalculate the viewport bounds.

### Details

If your code resizes the graph’s dimensions or position (i.e. by changing the style of the HTML DOM element that holds the graph, or by changing the DOM element’s position in the DOM tree), you will want to call `cy.resize()` to have the graph resize and redraw itself.

If tapping in the graph is offset rather than at the correct position, then a call to `cy.resize()` is necessary. Tapping can also become offset if the container element is not empty; the container is expected to be empty so the visualisation can use it.

Cytoscape.js can not automatically monitor the bounding box of the viewport, as querying the DOM for those dimensions can be expensive. Although `cy.resize()` is automatically called for you on the `window`‘s `resize` event, there is no `resize` or `style` event for arbitrary DOM elements.

## Animation [](#core/animation)

cy.animated() [](#cy.animated)  

Get whether the viewport is currently being animated.

cy.animate() [](#cy.animate)    

Animate the viewport.

cy.animate( , options )

- options

  An object containing the details of the animation.

  - zoom

    A zoom level (number) or a zoom configuration object to which the graph will be animated.

    - level

      The zoom level to use.

    - [position](#notation/position)

      The position about which zooming occurs. This automatically modifies the pan such that the specified model position remains at the same position in the viewport extent during zooming.

    - [renderedPosition](#notation/position)

      The rendered position about which zooming occurs, as an alternative to using the model position. This automatically modifies the pan such that the model position, corresponding to the rendered position at the start of the animation, remains at the same position in the viewport extent during zooming.

  - [pan](#notation/position)

    A panning position to which the graph will be animated.

  - [panBy](#notation/position)

    A relative panning position to which the graph will be animated.

  - fit

    An object containing fitting options from which the graph will be animated.

    - [eles](#collection)

      Elements or a selector to which the viewport will be fitted.

    - padding

      Padding to use with the fitting (default `0`).

  - center

    An object containing centring options from which the graph will be animated.

    - [eles](#collection)

      Elements or a selector to which the viewport will be centred.

  - duration

    The duration of the animation in milliseconds.

  - queue

    A boolean indicating whether to queue the animation (default `true`). Queued animations on the core run in order until the queue is empty.

  - [easing](#style/transition-animation)

    A [`transition-timing-function`](#style/transition-animation) easing style string that shapes the animation progress curve.

  - complete

    A function to call when the animation is done.

  - step

    A function to call each time the animation steps.

### Examples

Manual pan and zoom:

    cy.animate({
      pan: { x: 100, y: 100 },
      zoom: 2
    }, {
      duration: 1000
    });

Fit to elements:

    var j = cy.$('#j');

    cy.animate({
      fit: {
        eles: j,
        padding: 20
      }
    }, {
      duration: 1000
    });

cy.animation() [](#cy.animation)    

Get an [animation](#animations) of the viewport.

cy.animation( , options )

- options

  An object containing the details of the animation.

  - zoom

    A zoom level (number) or a zoom configuration object to which the graph will be animated.

    - level

      The zoom level to use.

    - [position](#notation/position)

      The position about which zooming occurs. This automatically modifies the pan such that the specified model position remains at the same position in the viewport extent during zooming.

    - [renderedPosition](#notation/position)

      The rendered position about which zooming occurs, as an alternative to using the model position. This automatically modifies the pan such that the model position, corresponding to the rendered position at the start of the animation, remains at the same position in the viewport extent during zooming.

  - [pan](#notation/position)

    A panning position to which the graph will be animated.

  - [panBy](#notation/position)

    A relative panning position to which the graph will be animated.

  - fit

    An object containing fitting options from which the graph will be animated.

    - [eles](#collection)

      Elements or a selector to which the viewport will be fitted.

    - padding

      Padding to use with the fitting (default `0`).

  - center

    An object containing centring options from which the graph will be animated.

    - [eles](#collection)

      Elements or a selector to which the viewport will be centred.

  - duration

    The duration of the animation in milliseconds.

  - [easing](#style/transition-animation)

    A [`transition-timing-function`](#style/transition-animation) easing style string that shapes the animation progress curve.

  - complete

    A function to call when the animation is done.

  - step

    A function to call each time the animation steps.

cy.delay() [](#cy.delay)    

Add a delay between queued animations for the viewport.

cy.delay( , duration, complete )

- duration

  How long the delay should be in milliseconds.

- complete

  A function to call when the delay is complete.

### Examples

    cy
      .animate({
        fit: { eles: '#j' }
      })

      .delay(1000)

      .animate({
        fit: { eles: '#e' }
      })
    ;

cy.delayAnimation() [](#cy.delayAnimation)    

Get a delay [animation](#animations) of the viewport.

cy.delayAnimation( , duration )

- duration

  How long the delay should be in milliseconds.

cy.stop() [](#cy.stop)    

Stop all viewport animations that are currently running.

cy.stop( , clearQueue, jumpToEnd )

- clearQueue

  A boolean (default `false`), indicating whether the queue of animations should be emptied.

- jumpToEnd

  A boolean (default `false`), indicating whether the currently-running animations should jump to their ends rather than just stopping midway.

### Examples

    cy.animate({
      fit: { eles: '#j' }
    }, { duration: 2000 });

    // stop in the middle
    setTimeout(function(){
      cy.stop();
    }, 1000);

cy.clearQueue() [](#cy.clearQueue)  

Remove all queued animations for the viewport.

## Layout [](#core/layout)

cy.layout() [](#cy.layout)         Aliases: `cy.createLayout()`, `cy.makeLayout()`,

Get a new layout, which can be used to algorithmically position the nodes in the graph.

cy.layout( , options )

- options

  The layout options.

You must specify `options.name` with the name of the layout you wish to use.

This function creates and returns a [layout object](#layouts). You may want to keep a reference to the layout for more advanced usecases, such as running multiple layouts simultaneously.

Note that you must call [`layout.run()`](#layouts/layout-manipulation/layout.run) in order for it to affect the graph.

The layout includes all elements in the graph at the moment `cy.layout()` is called, as `cy.layout()` is equivalent to `cy.elements().layout()`. You can use [`eles.layout()`](#collection/layout/eles.layout) to run a layout on a subset of the elements in the graph.

### Examples

    var layout = cy.layout({
      name: 'random'
    });

    layout.run();

## Style [](#core/style)

cy.style() [](#cy.style)      

Get the entry point to modify the visual style of the graph after initialisation.

cy.style()

Get the current style object.

cy.style( , stylesheet )

Assign a new stylesheet to replace the existing one.

- [stylesheet](#style)

  Either a `cytoscape.stylesheet()` object, a string stylesheet, or a JSON stylesheet (the same formats accepted for [`options.style`](#style) at initialisation).

### Details

You can use this function to gain access to the visual style (stylesheet) after initialisation. This is useful if you need to change the entire stylesheet at runtime.

Set a new style by reference:

    // here a string stylesheet is used, but you could also use json or a cytoscape.stylesheet() object
    var stringStylesheet = 'node { background-color: cyan; }';
    cy.style( stringStylesheet );

Set an entirely new style to the graph, specifying [selectors](#selectors) and [style properties](#style) via function calls:

    cy.style()
      .resetToDefault() // start a fresh default stylesheet

      // and then define new styles
      .selector('node')
          .style('background-color', 'magenta')

      // ...

      .update() // indicate the end of your new stylesheet so that it can be updated on elements
    ;

Set a completely new stylesheet (without the default stylesheet as a base):

    cy.style()
      .clear() // start a fresh stylesheet without even the default stylesheet

      // define all basic styles for node
      .selector('node')
        .style('background-color', 'magenta')

      // define all basic styles for edge
      .selector('edge')
          .style({
          'width': 3,
          'line-color': 'yellow'
        })

      // ...

      .update() // indicate the end of your new stylesheet so that it can be updated on elements
    ;

Add to the existing stylesheet using selectors:

    cy.style()
      .selector('node')
        .style({
          'background-color': 'yellow'
        })

      .update() // indicate the end of your new stylesheet so that it can be updated on elements
    ;

Add to the existing stylesheet by appending a string:

    cy.style()
      .append('node { background-color: yellow; }')
      .update();

Set the style from plain JSON:

    cy.style()
      .fromJson([
        {
          selector: 'node',
          style: {
            'background-color': 'red'
          }
        }

        // , ...
      ])

      .update() // indicate the end of your new stylesheet so that it can be updated on elements
    ;

Set the style from a style string (that you would probably pull from a file on your server):

    cy.style()
      .fromString('node { background-color: blue; }')

      .update() // update the elements in the graph with the new style
    ;

Get the current style as JSON:

    var styleJson = cy.style().json();
    var serializedJson = JSON.stringify( styleJson );

## Export [](#core/export)

cy.png() [](#cy.png)    

Export the current graph view as a PNG image.

cy.png( , options )

- options

  The export options.

  - output

    Whether the output should be `'base64uri'` (default), `'base64'`, `'blob'`, or `'blob-promise'` (a promise that resolves to the blob is returned).

  - bg

    The background colour of the image (transparent by default).

  - full

    Whether to export the current viewport view (`false`, default) or the entire graph (`true`).

  - scale

    This value specifies a positive number that scales the size of the resultant image.

  - maxWidth

    Specifies the scale automatically in combination with `maxHeight` such that the resultant image is no wider than `maxWidth`.

  - maxHeight

    Specifies the scale automatically in combination with `maxWidth` such that the resultant image is no taller than `maxHeight`.

### Details

This function exports the currently-rendered graph as an image, so you may not call this function on a headless instance. By default, the export takes into account the current screen pixel density so that the image is of the same quality of the screen. If the `maxWidth` or `maxHeight` options are specified, then the screen pixel density is ignored so that the image can fit in the specified dimensions.

Specifying `output:'blob-promise'` is the only way to make this function non-blocking. Other outputs may hang the browser until finished, especially for a large image.

### Examples

    var png64 = cy.png();

    // put the png data in an img tag
    document.querySelector('#png-eg').setAttribute('src', png64);

Example image tag:

cy.jpg() [](#cy.jpg)       Aliases: `cy.jpeg()`,

Export the current graph view as a JPG image.

cy.jpg( , options )

- options

  The export options.

  - output

    Whether the output should be `'base64uri'` (default), `'base64'`, `'blob'`, or `'blob-promise'` (a promise that resolves to the blob is returned).

  - bg

    The background colour of the image (white by default).

  - full

    Whether to export the current viewport view (`false`, default) or the entire graph (`true`).

  - scale

    This value specifies a positive number that scales the size of the resultant image.

  - maxWidth

    Specifies the scale automatically in combination with `maxHeight` such that the resultant image is no wider than `maxWidth`.

  - maxHeight

    Specifies the scale automatically in combination with `maxWidth` such that the resultant image is no taller than `maxHeight`.

  - quality

    Specifies the quality of the image from `0` (low quality, low filesize) to `1` (high quality, high filesize). If not set, the browser’s default quality value is used.

### Details

This function exports the currently-rendered graph as an image, so you may not call this function on a headless instance. By default, the export takes into account the current screen pixel density so that the image is of the same quality of the screen. If the `maxWidth` or `maxHeight` options are specified, then the screen pixel density is ignored so that the image can fit in the specified dimensions.

Specifying `output:'blob-promise'` is the only way to make this function non-blocking. Other outputs may hang the browser until finished, especially for a large image.

The JPEG format is lossy, whereas PNG is not. This means that `cy.jpg()` is useful for cases where filesize is more important than pixel-perfect images. JPEG compression will make your images (especially edge lines) blurry and distorted.

### Examples

    var jpg64 = cy.jpg();

    // put the png data in an img tag
    document.querySelector('#jpg-eg').setAttribute('src', jpg64);

Example image tag:

cy.json() [](#cy.json)      

Import or export the graph in the same JSON format used at initialisation.

cy.json( , flatEles )

Export the graph as JSON.

- flatEles

  Whether the resulant JSON should include the elements as a flat array (`true`) or as two keyed arrays by group (`false`, default).

cy.json( , cyJson )

Import the graph as JSON, updating only the fields specified.

- [cyJson](#core/initialisation)

  The object with the fields corresponding to the states that should be changed.

### Details

This function returns the same object that is used for [initialisation](#core/initialisation). You will find this function useful if you would like to save the entire state of the graph, either for your own purposes or for future restoration of that graph state.

This function can also be used to set graph state as in `cy.json( cyJson )`, where each field in `cyJson` is to be mutated in the graph. For each field defined in `cyJson`, `cy` is updated to match with the corresponding events emitted. This allows for declarative changes on the graph to be made.

For `cy.json( cyJson )`, all mutable [initialisation options](#core/initialisation) are supported.

When setting `cy.json({ elements: ... })`

- the included elements are mutated as specified (i.e. as they would be by [`ele.json( eleJson )`](#collection/data/ele.json)),
- the included elements not in the graph are added, and
- the not included elements are removed from the graph.

Note that updating the Graph elements using `cy.json()` requires all elements to have an ID attribute. Elements that do not have an ID will be ignored.

When setting `cy.json({ style: ... })`

- the entire stylesheet is replaced, and
- the style is recalculated for each element.

Updating the stylesheet is expensive. Similarly, it can potentially be expensive to update the existing elements for large graphs — as each element needs to be considered, and potentially each field per element. For elements, a much cheaper option is to selectively call `ele.json(...)` with only the fields that need to be updated.

### Examples

    console.log( cy.json() );

    cy.json({
      zoom: 2
    });

# Collection [](#collection)

A collection contains a set of nodes and edges, the set typically being immutable. Calling a function applies the function to all elements in the collection. When reading values from a collection, [`eles.data()`](#collection/data/eles.data) for example, the value of the first element in the collection is returned. For example:

    var weight = cy.nodes().data("weight");

    console.log( cy.nodes()[0].data("weight") + ' == ' + weight ); // weight is the first ele's weight

You can ensure that you’re reading from the element you want by using a [selector](#selectors) to narrow down the collection to one element (i.e. `eles.size() === 1`) or the [`eles.eq()`](#collection/iteration/eles.eq) function.

Note that a collection is immutable by default, meaning that the set of elements within a collection can not be changed. The API returns a new collection with different elements when necessary, instead of mutating the existing collection. This allows the programmer to safely use set theory operations on collections, use collections functionally, and so on. Note that because a collection is just a list of elements, it is relatively inexpensive to create new collections.

Also note that collections are iterable for modern browsers which support the [iteration protocols](https://exploringjs.com/es6/ch_iteration.html). This enables the use of features such as the spread operator, for-of loops, and destructuring.

While collections may be accessed similarly to arrays via indices, they may also be used like sets [for formation](#collection/building--filtering) (e.g. `eles1.union(eles2)`) and [for membership testing](#collection/comparison) (e.g. `eles.has(node)`).

## Graph manipulation [](#collection/graph-manipulation)

ele.cy() [](#ele.cy)  

Get the core instance that owns the element.

eles.remove() [](#eles.remove)  

Remove the elements from the graph, and return all elements removed by this call.

### Details

This function removes the calling elements from the graph. The elements are not deleted — they still exist in memory — but they are no longer in the graph.

A removed element just exists to be added back to its originating core instance or some other core instance. It does not make sense to call functions, other than `eles.restore()`, on a removed element. A removed element merely exists in this limbo state so you can later add it back to some core instance.

### Examples

Remove selected elements:

    cy.$(':selected').remove();

ele.removed() [](#ele.removed)  

Get whether the element has been removed from the graph.

ele.inside() [](#ele.inside)  

Get whether the element is inside the graph (i.e. not removed).

eles.restore() [](#eles.restore)  

Put removed elements back into the graph.

### Details

This function puts back elements in the graph that have been removed. It will do nothing if the elements are already in the graph.

An element can not be restored if its ID is the same as an element already in the graph. You should specify an alternative ID for the element you want to add in that case.

### Examples

    // remove selected elements
    var eles = cy.$(':selected').remove();

    // ... then some time later put them back
    eles.restore();

eles.clone() [](#eles.clone)     Aliases: `eles.copy()`,

Get a new collection containing clones (i.e. copies) of the elements in the calling collection.

eles.move() et al [](#eles.move)      

Move the elements with respect to graph topology (i.e. new `source`, `target`, or `parent`).

edges.move( , location )

Change the source, target, or both source and target.

- location

  Where the edges are moved. You can specify a new source, a new target, or both.

  - source

    The ID of the new source node.

  - target

    The ID of the new target node.

nodes.move( , location )

Change the parent.

- location

  Where the nodes are moved.

  - parent

    The ID of the new parent node (use `null` for no parent).

### Details

This function moves the elements in-place, so no `remove` or `add` events are generated. A `move` event is emitted on the moved elements.

### Examples

Move an edge:

    var ej = cy.$('#ej');

    ej = ej.move({
      target: 'g'
    });

## Events [](#collection/events)

eles.on() [](#eles.on)           Aliases: `eles.bind()`, `eles.listen()`, `eles.addListener()`,

Listen to events that occur on the elements.

eles.on( , events \[, selector\], function(event) )

- [events](#events)

  A space separated list of event names.

- [selector](#selectors) \[optional\]

  A delegate selector to specify child elements for which the handler runs.

- function(event)

  The handler function that is called when one of the specified events occurs.

  - [event](#events)

    The event object.

### Details

Events are bound only to the currently existing elements; they must exist at the time your code makes the call to `eles.on()`. Alternatively, use core event handlers (`cy.on()`) to attach event handlers.

### Examples

    cy.$('#j').on('tap', function(evt){
      console.log( 'tap ' + evt.target.id() );
    });

eles.promiseOn() [](#eles.promiseOn)       Aliases: `eles.pon()`,

Get a promise that is resolved the first time any of the elements emit any of the specified events.

eles.promiseOn( , events \[, selector\] )

- [events](#events)

  A space separated list of event names.

- [selector](#selectors) \[optional\]

  A selector to specify elements for which the handler is emitted.

### Examples

    cy.$('#j').pon('tap').then(function( event ){
      console.log('tap promise fulfilled');
    });

eles.one() [](#eles.one)    

Add a listener that is called once per event per element.

eles.one( , events \[, selector\], function(event) )

- [events](#events)

  A space separated list of event names.

- [selector](#selectors) \[optional\]

  A delegate selector to specify child elements for which the handler runs.

- function(event)

  The handler function that is called when one of the specified events occurs.

  - [event](#events)

    The event object.

### Details

For each event specified to this function, the handler function is triggered once per element. This is useful for one-off events that occur on each element in the calling collection once.

This function is a bit more complicated for compound nodes where a delegate selector has been specified: Note that the handler is called once per element in the *calling collection*, and the handler is triggered by matching descendant elements.

### Examples

    cy.$('node').one('tap', function(e){
      var ele = e.target;
      console.log('tapped ' + ele.id());
    });

eles.once() [](#eles.once)    

Add a listener that is called once per event per collection.

eles.once( , events \[, selector\], function(event) )

- [events](#events)

  A space separated list of event names.

- [selector](#selectors) \[optional\]

  A delegate selector to specify child elements for which the handler runs.

- function(event)

  The handler function that is called when one of the specified events occurs.

  - [event](#events)

    The event object.

### Details

For each event specified to this function, the handler function is triggered once. This is useful for one-off events that occur on just one element in the calling collection.

### Examples

    cy.nodes().once('click', function(e){
      var ele = e.target;
      console.log('clicked ' + ele.id());
    });

eles.removeListener() [](#eles.removeListener)           Aliases: `eles.off()`, `eles.unbind()`, `eles.unlisten()`,

Remove one or more listeners on the elements.

eles.removeListener( , events \[, selector\] \[, handler\] )

- [events](#events)

  A space separated list of event names.

- [selector](#selectors) \[optional\]

  The same delegate selector used to listen to the events.

- handler \[optional\]

  A reference to the handler function to remove.

### Examples

    var j = cy.$('#j');
    var handler = function(){ console.log('tap') };

    // listen
    j.on('tap', handler);

    // listen with some other handler
    j.on('tap', function(){
      console.log('some other handler');
    });

    j.emit('tap'); // 'tap' & 'some other handler'

    // remove the renferenced listener handler
    j.removeListener('tap', handler);

    j.emit('tap'); // some other handler

    // remove all tap listener handlers (including unnamed handler)
    j.removeListener('tap');

eles.removeAllListeners() [](#eles.removeAllListeners)  

Remove all event handlers on the elements.

eles.emit() [](#eles.emit)       Aliases: `eles.trigger()`,

Emit events on the elements.

eles.emit( , events \[, extraParams\] )

- [events](#events)

  A list of event names to emit (either a space-separated string or an array)

- extraParams \[optional\]

  An array of additional parameters to pass to the handler.

### Examples

    var j = cy.$('#j');

    j.on('tap', function(){
      console.log('tap!!');
    });

    j.emit('tap'); // tap!!

## Data [](#collection/data)

eles.data() et al [](#eles.data)             Aliases: `eles.attr()`,

Read and write developer-defined data associated with the elements.

ele.data()

Get the entire data object.

ele.data( , name )

Get a particular data field for the element.

- name

  The name of the field to get.

ele.data( , name, value )

Set a particular data field for the element.

- name

  The name of the field to set.

- value

  The value to set for the field.

ele.data( , obj )

Update multiple data fields at once via an object.

- obj

  The object containing name-value pairs to update data fields.

### Details

Only JSON-serialisable data may be put in `ele.data()`. For temporary data or non-serialisable data, use [`ele.scratch()`](#ele.scratch).

The following fields are normally immutable:

- `id` : The `id` field is used to uniquely identify an element in the graph.
- `source` & `target` : These fields define an edge’s relationship to nodes, and this relationship can not be changed after creation.
- `parent` : The `parent` field defines the parent (compound) node.

In order to modify those fields, which alter graph topology, you must use [`ele.move()`](#ele.move).

### Examples

    var j = cy.$('#j');

    // set the weight field in data
    j.data('weight', 60);

    // set several fields at once
    j.data({
      name: 'Jerry Jerry Dingleberry',
      height: 176
    });

    var weight = j.data('weight');

eles.removeData() [](#eles.removeData)         Aliases: `eles.removeAttr()`,

Remove developer-defined data associated with the elements.

eles.removeData()

Removes all mutable data fields for the elements.

eles.removeData( , names )

Removes the specified mutable data fields for the elements.

- names

  A space-separated list of fields to delete.

### Details

Using `ele.removeData()` sets the specified fields to `undefined`. This allows you to use a meaningful `null` value in your element data.

The following data fields are normally immutable, and so they can not be removed:

- `id` : The `id` field is used to uniquely identify an element in the graph.
- `source` & `target` : These fields define an edge’s relationship to nodes, and this relationship can not be changed after creation.
- `parent` : The `parent` field defines the parent (compound) node.

To modify the topology of the graph without adding or removing elements, you must use [`ele.move()`](#ele.move). Even so, only `parent` may be removed by `ele.move()`. An edge always requires a valid source and target.

ele.scratch() [](#ele.scratch)         [Extension](#extensions) function: This function is intended for use in extensions.

Set or get scratchpad data, where temporary or non-JSON data can be stored. App-level scratchpad data should use namespaces prefixed with underscore, like `'_foo'`.

ele.scratch()

Get the entire scratchpad object for the element.

ele.scratch( , namespace )

Get the scratchpad at a particular namespace.

- namespace

  A namespace string.

ele.scratch( , namespace, value )

Set the scratchpad at a particular namespace.

- namespace

  A namespace string.

- value

  The value to set at the specified namespace.

### Details

This function is useful for storing temporary, possibly non-JSON data. Extensions — like layouts, renderers, and so on — use `ele.scratch()` namespaced on their registered name. For example, an extension named `foo` would use the namespace `'foo'`.

If you want to use this function for your own app-level data, you can prefix the namespaces you use by underscore to avoid collisions with extensions. For example, using `ele.scratch('_foo')` in your app will avoid collisions with an extension named `foo`.

This function is useful for associating non-JSON data to an element. Whereas data stored via `ele.data()` is included by `ele.json()`, data stored by `ele.scratch()` is not. This makes it easy to temporarily store unserialisable data.

### Examples

    var j = cy.$('#j');

    // entire scratchpad:
    // be careful, since you could clobber over someone else's namespace or forget to use one at all!
    var fooScratch = j.scratch()._foo = {}; 
    // ... now you can modify fooScratch all you want

    // set namespaced scratchpad to ele:
    // safer, recommended
    var fooScratch = j.scratch('_foo', {});
    // ... now you can modify fooScratch all you want

    // get namespaced scratchpad from ele (assumes set before)
    var fooScratch = j.scratch('_foo');
    // ... now you can modify fooScratch all you want

ele.removeScratch() [](#ele.removeScratch)     [Extension](#extensions) function: This function is intended for use in extensions.

Remove scratchpad data. You should remove scratchpad data only at your own namespaces.

ele.removeScratch( , namespace )

Remove the scratchpad data at a particular namespace.

- namespace

  A namespace string.

ele.id() [](#ele.id)  

A shortcut to get the ID of an element.

ele.json() [](#ele.json)      

Get or mutate the element’s plain JavaScript object representation.

ele.json()

Get the element’s JSON.

ele.json( , eleJson )

Mutate the element’s state as specified.

- [eleJson](#notation/elements-json)

  For each field in the object, the element’s state is mutated as specified.

### Details

This function returns the [plain JSON representation](#notation/elements-json) of the element, the same format which is used at initialisation, in [`cy.add()`](#core/graph-manipulation/cy.add), etc.

This function can also be used to set the element’s state using the [plain JSON representation](#notation/elements-json) of the element. Each field specified in `ele.json( eleJson )` is diffed against the element’s current state, the element is mutated accordingly, and the appropriate events are emitted. This can be used to declaratively modify elements.

Note that it is much faster to simply specify the diff-patch objects to `ele.json()`, e.g. `ele.json({ data: { foo: 'bar' } })` only updates `foo` in `data`. This avoids the cost of diffs on unchanged fields, which is useful when making many calls to `ele.json()` for larger graphs.

### Examples

Print the JSON for an element:

    console.log( cy.$('#j').json() );

Make an element selected:

    cy.$('#j').json({ selected: true });

eles.jsons() [](#eles.jsons)  

Get an array of the plain JavaScript object representation of all elements in the collection.

### Details

This function returns the [plain JSON representation](#notation/elements-json) of all elements in the collection, the same format which is used at initialisation, in [`cy.add()`](#core/graph-manipulation/cy.add), etc.

### Examples

    console.log( cy.elements().jsons() );

ele.group() [](#ele.group)  

Get the group string that defines the type of the element.

### Details

The group strings are `'nodes'` for nodes and `'edges'` for edges. In general, you should be using `ele.isEdge()` and `ele.isNode()` instead of `ele.group()`.

ele.isNode() [](#ele.isNode)  

Get whether the element is a node.

ele.isEdge() [](#ele.isEdge)  

Get whether the element is an edge.

edge.isLoop() [](#edge.isLoop)  

Get whether the edge is a loop (i.e. same source and target).

edge.isSimple() [](#edge.isSimple)  

Get whether the edge is simple (i.e. different source and target).

## Metadata [](#collection/metadata)

node.degree() et al [](#node.degree)                       node.degree( , includeLoops )

Get the degree of a node.

- includeLoops

  A boolean, indicating whether loops are to be included in degree calculations.

node.indegree( , includeLoops )

Get the indegree of a node.

- includeLoops

  A boolean, indicating whether loops are to be included in degree calculations.

node.outdegree( , includeLoops )

Get the outdegree of a node.

- includeLoops

  A boolean, indicating whether loops are to be included in degree calculations.

nodes.totalDegree( , includeLoops )

Get the total degree of a collection of nodes.

- includeLoops

  A boolean, indicating whether loops are to be included in degree calculations.

nodes.minDegree( , includeLoops )

Get the minimum degree of the nodes in the collection.

- includeLoops

  A boolean, indicating whether loops are to be included in degree calculations.

nodes.maxDegree( , includeLoops )

Get the maximum degree of the nodes in the collection.

- includeLoops

  A boolean, indicating whether loops are to be included in degree calculations.

nodes.minIndegree( , includeLoops )

Get the minimum indegree of the nodes in the collection.

- includeLoops

  A boolean, indicating whether loops are to be included in degree calculations.

nodes.maxIndegree( , includeLoops )

Get the maximum indegree of the nodes in the collection.

- includeLoops

  A boolean, indicating whether loops are to be included in degree calculations.

nodes.minOutdegree( , includeLoops )

Get the minimum outdegree of the nodes in the collection.

- includeLoops

  A boolean, indicating whether loops are to be included in degree calculations.

nodes.maxOutdegree( , includeLoops )

Get the maximum outdegree of the nodes in the collection.

- includeLoops

  A boolean, indicating whether loops are to be included in degree calculations.

### Details

*Degree* : For a node, the degree is the number of edge connections it has. Each time a node is referenced as `source` or `target` of an edge in the graph, that counts as an edge connection.

*Indegree* : For a node, the indegree is the number of incoming edge connections it has. Each time a node is referred to as `target` of an edge in the graph, that counts as an incoming edge connection.

*Outdegree* : For a node, the outdegree is the number of outgoing edge connections it has. Each time a node is referred to as `source` of an edge in the graph, that counts as an outgoing edge connection.

*Total degree* : For a set of nodes, the total degree is the total number of edge connections to nodes in the set.

## Position & dimensions [](#collection/position--dimensions)

node.position() [](#node.position)               Aliases: `node.modelPosition()`, `node.point()`,

Get or set the [model position](#notation/position) of a node.

node.position()

Get the entire position object.

node.position( , dimension )

Get the value of a specified position dimension.

- dimension

  The position dimension to get.

node.position( , dimension, value )

Set the value of a specified position dimension.

- dimension

  The position dimension to set.

- value

  The value to set to the dimension.

node.position( , pos )

Set the position using name-value pairs in the specified object.

- [pos](#notation/position)

  An object specifying name-value pairs representing dimensions to set.

### Details

A [position](#notation/position) has two fields, `x` and `y`, that can take on numerical values.

### Examples

    // get x for j
    var x = cy.$('#j').position('x');

    // get the whole position for e
    var pos = cy.$('#e').position();

    // set y for j
    cy.$('#j').position('y', 100);

    // set multiple
    cy.$('#e').position({
      x: 123,
      y: 200
    });

nodes.shift() [](#nodes.shift)      

Shift the positions of the nodes by a given [model position](#notation/position) vector.

nodes.shift( , dimension, value )

Shift the nodes by one of `'x'` or `'y'`.

- dimension

  The position dimension to shift.

- value

  The value to shift the dimension.

nodes.shift( , pos )

Shift the nodes by a position vector.

- [pos](#notation/position)

  An object specifying name-value pairs representing dimensions to shift.

### Examples

    cy.$('#j').shift({ x: 10, y: 20 });

nodes.positions() [](#nodes.positions)           Aliases: `nodes.modelPositions()`, `nodes.points()`,

Set the [model positions](#notation/position) of several nodes with a function.

nodes.positions( , function(ele, i) )

Set the positions via a function.

- function(ele, i)

  A callback function that returns the position to set for each element.

  - [ele](#collection)

    The element being iterated over for which the function should return a position to set.

  - i

    The index of the element when iterating over the elements in the collection.

nodes.positions( , pos )

Set positions for all nodes based on a single position object.

- [pos](#notation/position)

  An object specifying name-value pairs representing dimensions to set.

### Examples

    cy.nodes().positions(function( node, i ){
      return {
        x: i * 100,
        y: 100
      };
    });

node.renderedPosition() [](#node.renderedPosition)             Aliases: `node.renderedPoint()`,

Get or set the [rendered (on-screen) position](#notation/position) of a node.

node.renderedPosition()

Get the entire rendered position object.

node.renderedPosition( , dimension )

Get the value of a specified rendered position dimension.

- dimension

  The position dimension to get.

node.renderedPosition( , dimension, value )

Set the value of a specified rendered position dimension.

- dimension

  The position dimension to set.

- value

  The value to set to the dimension.

node.renderedPosition( , pos )

Set the rendered position using name-value pairs in the specified object.

- [pos](#notation/position)

  An object specifying name-value pairs representing dimensions to set.

node.relativePosition() [](#node.relativePosition)             Aliases: `node.relativePoint()`,

Get or set the [model position](#notation/position) of a node, relative to its compound parent.

node.relativePosition()

Get the entire relative position object.

node.relativePosition( , dimension )

Get the value of a specified relative position dimension.

- dimension

  The position dimension to get.

node.relativePosition( , dimension, value )

Set the value of a specified relative position dimension.

- dimension

  The position dimension to set.

- value

  The value to set to the dimension.

node.relativePosition( , pos )

Set the relative position using name-value pairs in the specified object.

- [pos](#notation/position)

  An object specifying name-value pairs representing dimensions to set.

ele.width() et al [](#ele.width)          

Get the width of the element. The raw width of the element is returned, independent of whether the element is visibile.

ele.width()

Get the width of the element in [model dimensions](#notation/position).

ele.outerWidth()

Get the outer width of the element in [model dimensions](#notation/position) (includes width, padding, & border).

ele.renderedWidth()

Get the width of the element in [rendered dimensions](#notation/position).

ele.renderedOuterWidth()

Get the outer width of the element in [rendered dimensions](#notation/position) (includes width, padding, & border) in rendered dimensions.

ele.height() et al [](#ele.height)          

Get the height of the element. The raw height of the element is returned, independent of whether the element is visibile.

ele.height()

Get the height of the element in [model dimensions](#notation/position).

ele.outerHeight()

Get the outer height of the element in [model dimensions](#notation/position) (includes height, padding, & border).

ele.renderedHeight()

Get the height of the element in [rendered dimensions](#notation/position).

ele.renderedOuterHeight()

Get the outer height of the element in [rendered dimensions](#notation/position) (includes height, padding, & border) in rendered dimensions.

eles.boundingBox() [](#eles.boundingBox)         Aliases: `eles.boundingbox()`, `eles.bb()`,

Get the bounding box of the elements (in [model co-ordinates](#notation/position)).

eles.boundingBox( , options )

Get the bounding box of the elements in [model co-ordinates](#notation/position).

- options

  An object containing options for the function.

  - includeNodes

    A boolean indicating whether to include nodes in the bounding box (default `true`).

  - includeEdges

    A boolean indicating whether to include edges in the bounding box (default `true`).

  - includeLabels

    A boolean indicating whether to include labels overall in the bounding box (default `true`). This option overrides all other label options if `false`.

  - includeMainLabels

    A boolean indicating whether to include main (node or edge) `label` s in the bounding box (default `true`).

  - includeSourceLabels

    A boolean indicating whether to include (edge) `source-label` s in the bounding box (default `true`).

  - includeTargetLabels

    A boolean indicating whether to include (edge) `target-label` s in the bounding box (default `true`).

  - includeOverlays

    A boolean indicating whether to include overlays (such as the one which appears when a node is clicked) in the bounding box (default `true`).

  - includeUnderlays

    A boolean indicating whether to include underlays (configurable in node or edge style) in the bounding box (default `true`).

### Details

This function returns a plain object with the fields `x1`, `x2`, `y1`, `y2`, `w`, and `h` defined.

An element that does not take up space (e.g. `display: none`) has a bounding box of zero `w` and `h`. The `x1`, `x2`, `y1`, and `y2` values will have no meaning for those zero-area elements. To get the position of a `display: none` node, use [`node.position()`](#node.position) instead.

Note that the `includeOverlays` option necessarily includes the dimensions of the body of the element. So using `includeOverlays: true` with `includeNodes: false`, for example, does not make sense. The case where the `includeOverlays` option is only useful in getting the non-overlay dimensions of an element, e.g. `{ includeOverlays: false, includeNodes: true }`. The same applies to the `includeUnderlays` option.

eles.renderedBoundingBox() [](#eles.renderedBoundingBox)       Aliases: `eles.renderedBoundingbox()`,

Get the [rendered](#notation/position) bounding box of the elements.

eles.renderedBoundingBox( , options )

Get the bounding box of the elements in rendered co-ordinates.

- options

  An object containing options for the function.

  - includeNodes

    A boolean indicating whether to include nodes in the bounding box (default `true`).

  - includeEdges

    A boolean indicating whether to include edges in the bounding box (default `true`).

  - includeLabels

    A boolean indicating whether to include labels overall in the bounding box (default `true`). This option overrides all other label options if `false`.

  - includeMainLabels

    A boolean indicating whether to include main (node or edge) `label` s in the bounding box (default `true`).

  - includeSourceLabels

    A boolean indicating whether to include (edge) `source-label` s in the bounding box (default `true`).

  - includeTargetLabels

    A boolean indicating whether to include (edge) `target-label` s in the bounding box (default `true`).

  - includeOverlays

    A boolean indicating whether to include overlays (such as the one which appears when a node is clicked) in the bounding box (default `true`).

  - includeUnderlays

    A boolean indicating whether to include underlays (configurable in node or edge style) in the bounding box (default `true`).

### Details

This function returns a plain object with the fields `x1`, `x2`, `y1`, `y2`, `w`, and `h` defined.

An element that does not take up space (e.g. `display: none`) has a bounding box of zero `w` and `h`. The `x1`, `x2`, `y1`, and `y2` values will have no meaning for those zero-area elements. To get the position of a `display: none` node, use [`node.position()`](#node.position) instead.

Note that the `includeOverlays` option necessarily includes the dimensions of the body of the element. So using `includeOverlays: true` with `includeNodes: false`, for example, does not make sense. The case where the `includeOverlays` option is only useful in getting the non-overlay dimensions of an element, e.g. `{ includeOverlays: false, includeNodes: true }`. The same applies to the `includeUnderlays` option.

node.grabbed() [](#node.grabbed)  

Get whether a node is currently grabbed, meaning the user has hold of the node.

node.grabbable() [](#node.grabbable)  

Get whether the user can grab a node.

nodes.grabify() [](#nodes.grabify)  

Allow the user to grab the nodes.

### Examples

    cy.$('#j').grabify();

nodes.ungrabify() [](#nodes.ungrabify)  

Disallow the user to grab the nodes.

### Examples

    cy.$('#j').ungrabify();

node.locked() [](#node.locked)  

Get whether a node is locked, meaning that its position can not be changed.

nodes.lock() [](#nodes.lock)  

Lock the nodes such that their positions can not be changed.

### Examples

    cy.$('#j').lock();

nodes.unlock() [](#nodes.unlock)  

Unlock the nodes such that their positions can be changed.

### Examples

    cy.$('#j').unlock();

ele.active() [](#ele.active)  

Gets whether the element is active (e.g. on user tap, grab, etc).

ele.pannable() [](#ele.pannable)  

Gets whether the element allows passthrough panning.

### Description

A pannable element allows passthrough panning: The user can pan the graph when dragging on the element. Thus, a pannable element is necessarily ungrabbable.

By default, an edge is pannable and a node is not pannable.

eles.panify() [](#eles.panify)  

Enables passthrough panning on the elements.

### Examples

    cy.$('#j').panify();

eles.unpanify() [](#eles.unpanify)  

Disables passthrough panning on the elements.

### Examples

    cy.$('#j').unpanify();

## Edge points [](#collection/edge-points)

edge.controlPoints() et al [](#edge.controlPoints)      

Get an array of control point positions for a [`curve-style: bezier`](#style/bezier-edges) or [`curve-style: unbundled-bezier`](#style/unbundled-bezier-edges) edge.

edge.controlPoints()

Get the control points in [model co-ordinates](#notation/position).

edge.renderedControlPoints()

Get the control points in [rendered co-ordinates](#notation/position).

### Details

Each bezier edge consists of one or more quadratic bezier curves.

A [quadratic bezier curve](https://en.wikipedia.org/wiki/B%C3%A9zier_curve#Quadratic_B%C3%A9zier_curves) is specified by three points. Those points include the start point (P0), the centre control point (P1), and the end point (P2). Traditionally, all three points are called “control points”, but only the centre control point (P1) is referred to as the “control point” within this documentation for brevity and clarity. This function returns the centre control point, as other points are available by functions like `edge.targetEndpoint()`.

The number of returned points for each curve style is as follows:

- `curve-style: bezier` (simple edge) : 1 point for a single quadratic bezier
- `curve-style: bezier` (loop) : 2 points for two quadratic beziers
- `curve-style: unbundled-bezier` : n points for n quadratic beziers, as the number of control points is defined by [`control-point-distances` and `control-point-weights`](#style/unbundled-bezier-edges)

Notes:

- While the control points may be specified relatively in the CSS, this function returns the absolute [model positions](#notation/position) of the control points. The points are specified in the order of source-to-target direction.
- This function works for bundled beziers, but it is not applicable to the middle, straight-line edge in the bundle.
- For an unbundled bezier edge, the point that joins two successive bezier curves in the series is given by the midpoint (mean) of the two control points. That join point specifies P2 for the first bezier, and it specifies P0 for the second bezier.

edge.segmentPoints() et al [](#edge.segmentPoints)      

Get an array of segment point positions (i.e. bend points) for a [`curve-style: segments`](#style/segments-edges) edge.

edge.segmentPoints()

Get the segment points in [model co-ordinates](#notation/position).

edge.renderedSegmentPoints()

Get the segment points in [rendered co-ordinates](#notation/position).

### Details

While the segment points may be specified relatively in the stylesheet, this function returns the absolute [model positions](#notation/position) of the segment points. The points are specified in the order of source-to-target direction.

edge.sourceEndpoint() et al [](#edge.sourceEndpoint)      

Get the position of where the edge ends, towards the source node.

edge.sourceEndpoint()

Get the source endpoint in [model co-ordinates](#notation/position).

edge.renderedSourceEndpoint()

Get the target endpoint in [rendered co-ordinates](#notation/position).

edge.targetEndpoint() et al [](#edge.targetEndpoint)      

Get the position of where the edge ends, towards the target node.

edge.targetEndpoint()

Get the target endpoint in [model co-ordinates](#notation/position).

edge.renderedTargetEndpoint()

Get the target endpoint in [rendered co-ordinates](#notation/position).

edge.midpoint() et al [](#edge.midpoint)      

Get the position of the midpoint of the edge.

edge.midpoint()

Get the midpoint in [model co-ordinates](#notation/position).

edge.renderedMidpoint()

Get the midpoint in [rendered co-ordinates](#notation/position).

### Details

The midpoint is, by default, where the edge’s label is centred. It is also the position towards which mid arrows point.

For [`curve-style: unbundled-bezier`](#style/unbundled-bezier-edges) edges, the midpoint is the middle extremum if the number of control points is odd. For an even number of control points, the midpoint is where the two middle-most control points meet. This is the middle inflection point for bilaterally symmetric or skew symmetric edges, for example.

For [`curve-style: segments`](#style/segments-edges) edges, the midpoint is the middle segment point if the number of segment points is odd. For an even number of segment points, the overall midpoint is the midpoint of the middle-most line segment (i.e. the mean of the middle two segment points).

## Layout [](#collection/layout)

eles.layout() [](#eles.layout)         Aliases: `eles.createLayout()`, `eles.makeLayout()`,

Get a new layout, which can be used to algorithmically position the nodes in the collection.

eles.layout( , options )

- options

  The layout options.

This function is useful for running a layout on a subset of the elements in the graph, perhaps in parallel to other layouts.

You must specify `options.name` with the name of the layout you wish to use.

This function creates and returns a [layout object](#layouts). You may want to keep a reference to the layout for more advanced usecases, such as running multiple layouts simultaneously.

Note that you must call [`layout.run()`](#layouts/layout-manipulation/layout.run) in order for it to affect the graph.

### Examples

Assign random positions to all nodes:

    var layout = cy.elements().layout({
      name: 'random'
    });

    layout.run();

Apply a circle layout to only the shown elements:

    var layout = cy.elements().not(':invisible, :transparent').layout({
      name: 'circle'
    });

    layout.run();

nodes.layoutPositions() [](#nodes.layoutPositions)     [Extension](#extensions) function: This function is intended for use in extensions.

Position the nodes for a discrete/synchronous layout.

nodes.layoutPositions( , layout, options, function(ele, i) )

- layout

  The layout.

- options

  The layout options object.

- function(ele, i)

  A function that returns the new position for the specified node.

  - [ele](#collection)

    The node being iterated over for which the function should return a position to set.

  - i

    The index of the current node while iterating over the nodes in the layout.

This function is intended to be used only by layout extensions. Your app should not call this function directly.

This function is called by discrete (synchronous) layouts to update the graph with new node positions.

A discrete layout is only responsible for calculating new node positions. Setting these positions and performing animations, modifying the viewport, changing zoom level, etc. are handled by `layoutPositions()` — which is called by each layout at the end of its `run()` method.

The `options` object is passed to `layoutPositions()` when called by a layout extension and consists of many of the common properties shared between layouts:

    var options = {
      animate: false, // whether to animate changes to the layout
      animationDuration: 500, // duration of animation in ms, if enabled
      animationEasing: undefined, // easing of animation, if enabled
      animateFilter: function ( node, i ){ return true; }, // a function that determines whether the node should be animated.
        // All nodes animated by default for `animate:true`.  Non-animated nodes are positioned immediately when the layout starts.
      eles: someCollection, // collection of elements involved in the layout; set by cy.layout() or eles.layout()
      fit: true, // whether to fit the viewport to the graph
      padding: 30, // padding to leave between graph and viewport
      pan: undefined, // pan the graph to the provided position, given as { x, y }
      ready: undefined, // callback for the layoutready event
      stop: undefined, // callback for the layoutstop event
      spacingFactor: 1, // a positive value which adjusts spacing between nodes (>1 means greater than usual spacing)
      transform: function (node, position ){ return position; } // transform a given node position. Useful for changing flow direction in discrete layouts
      zoom: undefined // zoom level as a positive number to set after animation
    }

Note that if `fit` is true, it will override any values provided in `pan` or `zoom`.

node.layoutDimensions() [](#node.layoutDimensions)     [Extension](#extensions) function: This function is intended for use in extensions.

Get the node width and height. This function is intended for use in layout positioning to do overlap detection.

node.layoutDimensions( , options )

- options

  The layout options object.

This function is used to retrieve the width and height of the bounding box of a node. The way the width and height are calculated is affected by the `options` object.

This function returns an object containing the width and height of the calculated bounding box under the `w` and `h` keys respectively. It can be used as a direct replacement for the `boundingBox()` function assuming only `w` and `h` values are needed.

    var options = {
      nodeDimensionsIncludeLabels: true // boolean which changes whether label dimensions are included when calculating node dimensions, default true
    };

    var dims = cy.nodes().first().layoutDimensions( options );

## Selection [](#collection/selection)

ele.selected() [](#ele.selected)  

Get whether the element is selected.

eles.select() [](#eles.select)  

Make the elements selected. Elements outside the collection are not affected.

### Examples

    cy.$('#j').select();

eles.unselect() [](#eles.unselect)     Aliases: `eles.deselect()`,

Make the elements not selected. Elements outside the collection are not affected.

### Examples

    cy.$('#j').unselect();

ele.selectable() [](#ele.selectable)  

Get whether the element’s selection state is mutable.

eles.selectify() [](#eles.selectify)  

Make the selection states of the elements mutable.

### Examples

    cy.$('#j').selectify();

eles.unselectify() [](#eles.unselectify)  

Make the selection states of the elements immutable.

### Examples

    cy.$('#j').unselectify();

## Style [](#collection/style)

eles.addClass() [](#eles.addClass)    

Add classes to elements. The classes should be specified in the [stylesheet](#style) in order to have an effect on the rendered style of the elements.

eles.addClass( , classes )

- classes

  An array (or a space-separated string) of class names to add to the elements.

### Examples

    cy.$('#j, #e').addClass('foo');

eles.removeClass() [](#eles.removeClass)    

Remove classes from elements. The classes should be specified in the [stylesheet](#style) in order to have an effect on the rendered style of the elements.

eles.removeClass( , classes )

- classes

  An array (or a space-separated string) of class names to remove from the elements.

### Examples

    cy.$('#j, #e').removeClass('foo');

eles.toggleClass() [](#eles.toggleClass)    

Toggle whether the elements have the specified classes. The classes should be specified in the [stylesheet](#style) in order to have an effect on the rendered style of the elements.

eles.toggleClass( , classes \[, toggle\] )

- classes

  An array (or a space-separated string) of class names to toggle on the elements.

- toggle \[optional\]

  Instead of automatically toggling, adds the classes on truthy values or removes them on falsey values.

### Examples

Toggle:

    cy.$('#j, #e').toggleClass('foo');

Toggle on:

    cy.$('#j, #e').toggleClass('foo', true);

Toggle off:

    cy.$('#j, #e').toggleClass('foo', false);

eles.classes() et al [](#eles.classes)           Aliases: `eles.className()`, `eles.classNames()`,

Get or replace the current list of classes on the elements with the specified list.

ele.classes()

Get the list of classes as an array for the element.

eles.classes( , classes )

Replace the list of classes for all elements in the collection.

- classes

  An array (or a space-separated string) of class names that replaces the current class list.

### Examples

Remove all classes:

    cy.nodes().classes([]); // array
    cy.nodes().classes(''); // space-separated string

Replace classes:

    cy.nodes().classes(['foo']); // array
    cy.nodes().classes('foo'); // space-separated string

eles.flashClass() [](#eles.flashClass)    

Add classes to the elements, and then remove the classes after a specified duration.

eles.flashClass( , classes \[, duration\] )

- classes

  An array (or a space-separated string) of class names to flash on the elements.

- duration \[optional\]

  The duration in milliseconds that the classes should be added on the elements. After the duration, the classes are removed.

### Examples

    cy.$('#j, #e').flashClass('foo', 1000);

ele.hasClass() [](#ele.hasClass)    

Get whether an element has a particular class.

ele.hasClass( , className )

- className

  The name of the class to test for.

### Examples

    console.log( 'j has class `foo` : '  + cy.$('#j').hasClass('foo') );

eles.style() et al [](#eles.style)                 Aliases: `eles.css()`,

Get or override the style of the element.

ele.style()

Get a name-value pair object containing visual style properties and their values for the element.

ele.style( , name )

Get a particular style property value.

- name

  The name of the visual style property to get.

eles.style( , name, value )

Set a particular style property value.

- name

  The name of the visual style property to set.

- value

  The value of the visual style property to set.

eles.style( , obj )

Set several particular style property values.

- obj

  An object of style property name-value pairs to set.

eles.removeStyle()

Remove all style overrides.

eles.removeStyle( , names )

Remove specific style overrides.

- names

  A space-separated list of property names to remove overrides.

### Details

You should use this function very sparingly for setting:

- There are very few valid usecases for setting with `ele.style()`.
- It *overrides* the style of an element, despite the state and classes that it has.
- In general, it’s much better to specify a better stylesheet at initialisation that reflects your application state rather than programmatically modifying style.
- You can not serialise or deserialise overridden style via `ele.json()`.

Only [defined visual style properties](#style) are supported.

If you would like to remove a particular overridden style property, you can set `null` or `''` (the empty string) to it.

ele.numericStyle() [](#ele.numericStyle)    

Get the numeric value of a style property in preferred units that can be used for calculations.

ele.numericStyle( , name )

- name

  The name of the style property to get.

### Details

- Sizes (e.g. `width`) are in [model](#notation/position) pixels.
- Times (e.g. `transition-duration`) are in milliseconds.
- Angles (e.g. `text-rotation`) are in radians.
- Plain numbers (e.g. `opacity`) are unitless.
- Colours (e.g. `background-color`) are in `[r, g, b]` arrays with values on \[0, 255\].
- Lists of numbers (e.g. `edge-distances`) are in arrays.
- Percents range on \[0, 1\] so that they are useful for calculations.
- Some properties can not have preferred units defined, like `background-position-x` — it could be in `px` or `%`, for instance. A property like this is returned in the units as specified in the element’s style (e.g. the stylesheet). In this case, the units can be returned explicitly via `ele.numericStyleUnits()`.
- Values that can not be expressed as numbers (e.g. `label`) are returned as a string.

### Examples

`node.numericStyle('width')` would return `30` for a 30px wide node, even if the node was specified as `width: 3em`.

ele.numericStyleUnits() [](#ele.numericStyleUnits)    

Get the units that `ele.numericStyle()` is expressed in, for a particular property.

ele.numericStyleUnits( , name )

- name

  The name of the style property to get.

ele.visible() et al [](#ele.visible)      

Get whether the element is [visible](#style/visibility) (i.e. `display: element` and `visibility: visible`).

ele.visible()

Get whether the element is visible.

ele.hidden()

Get whether the element is hidden.

ele.effectiveOpacity() [](#ele.effectiveOpacity)  

Get the effective opacity of the element (i.e. on-screen opacity), which takes into consideration parent node opacity.

ele.transparent() [](#ele.transparent)  

Get whether the element’s effective opacity is completely transparent, which takes into consideration parent node opacity.

## Animation [](#collection/animation)

ele.animated() [](#ele.animated)  

Get whether the element is currently being animated.

eles.animate() [](#eles.animate)    

Animate the elements.

eles.animate( , options )

- options

  An object containing the details of the animation.

  - [position](#notation/position)

    A position to which the elements will be animated.

  - [renderedPosition](#notation/position)

    A rendered position to which the elements will be animated.

  - [style](#style)

    An object containing name-value pairs of style properties to animate.

  - duration

    The duration of the animation in milliseconds.

  - queue

    A boolean indicating whether to queue the animation (default `true`).

  - [easing](#style/transition-animation)

    A [`transition-timing-function`](#style/transition-animation) easing style string that shapes the animation progress curve.

  - complete

    A function to call when the animation is done.

  - step

    A function to call each time the animation steps.

### Details

Note that you can specify only one of `position` and `renderedPosition`: You can not animate to two positions at once.

### Examples

    cy.nodes().animate({
      position: { x: 100, y: 100 },
      style: { backgroundColor: 'red' }
    }, {
      duration: 1000
    });

    console.log('Animating nodes...');

ele.animation() [](#ele.animation)    

Get an [animation](#animations) for the element.

ele.animation( , options )

- options

  An object containing the details of the animation.

  - [position](#notation/position)

    A position to which the elements will be animated.

  - [renderedPosition](#notation/position)

    A rendered position to which the elements will be animated.

  - [style](#style)

    An object containing name-value pairs of style properties to animate.

  - duration

    The duration of the animation in milliseconds.

  - [easing](#style/transition-animation)

    A [`transition-timing-function`](#style/transition-animation) easing style string that shapes the animation progress curve.

  - complete

    A function to call when the animation is done.

  - step

    A function to call each time the animation steps.

eles.delay() [](#eles.delay)    

Add a delay between queued animations for the elements.

eles.delay( , duration, complete )

- duration

  How long the delay should be in milliseconds.

- complete

  A function to call when the delay is complete.

### Examples

    cy.nodes()
      .animate({
          style: { 'background-color': 'blue' }
        }, {
          duration: 1000
        })

      .delay( 1000 )

      .animate({
        style: { 'background-color': 'yellow' }
      })
    ;

    console.log('Animating nodes...');

ele.delayAnimation() [](#ele.delayAnimation)    

Get a delay [animation](#animations) for the element.

ele.delayAnimation( , duration )

- duration

  How long the delay should be in milliseconds.

eles.stop() [](#eles.stop)    

Stop all animations that are currently running.

eles.stop( , clearQueue, jumpToEnd )

- clearQueue

  A boolean, indicating whether the queue of animations should be emptied.

- jumpToEnd

  A boolean, indicating whether the currently-running animations should jump to their ends rather than just stopping midway.

### Examples

    cy.nodes().animate({
      style: { 'background-color': 'cyan' }
    }, {
      duration: 5000,
      complete: function(){
        console.log('Animation complete');
      }
    });

    console.log('Animating nodes...');

    setTimeout(function(){
      console.log('Stopping nodes animation');
      cy.nodes().stop();
    }, 2500);

eles.clearQueue() [](#eles.clearQueue)  

Remove all queued animations for the elements.

## Comparison [](#collection/comparison)

eles.same() [](#eles.same)    

Determine whether this collection contains exactly the same elements as another collection.

eles.same( , eles )

- [eles](#collection)

  The other elements to compare to.

### Examples

    var heavies = cy.$('node[weight > 60]');
    var guys = cy.$('#j, #g, #k');

    console.log( 'same ? ' + heavies.same(guys) );

eles.anySame() [](#eles.anySame)    

Determine whether this collection contains any of the same elements as another collection.

eles.anySame( , eles )

- [eles](#collection)

  The other elements to compare to.

### Examples

    var j = cy.$('#j');
    var guys = cy.$('#j, #g, #k');

    console.log( 'any same ? ' + j.anySame(guys) );

eles.contains() [](#eles.contains)       Aliases: `eles.has()`,

Determine whether this collection contains all of the elements of another collection.

eles.contains( , eles )

- [eles](#collection)

  The other elements to compare to.

### Examples

    cy.$('#j, #e').contains( cy.$('#j') ); // true

eles.allAreNeighbors() [](#eles.allAreNeighbors)       Aliases: `eles.allAreNeighbours()`,

Determine whether all elements in the specified collection are in the neighbourhood of the calling collection.

eles.allAreNeighbors( , eles )

- [eles](#collection)

  The other elements to compare to.

### Examples

    var j = cy.$('#j');
    var gAndK = cy.$('#g, #k');

    console.log( 'all neighbours ? ' + j.allAreNeighbors(gAndK) );

eles.is() [](#eles.is)    

Determine whether any element in this collection matches a selector.

eles.is( , selector )

- [selector](#selectors)

  The selector to match against.

### Examples

    var j = cy.$('#j');

    console.log( 'j has weight > 50 ? ' + j.is('[weight > 50]') );

eles.allAre() [](#eles.allAre)    

Determine whether all elements in the collection match a selector.

eles.allAre( , selector )

- [selector](#selectors)

  The selector to match against.

### Examples

    var jAndE = cy.$('#j, #e');

    console.log( 'j and e all have weight > 50 ? ' + jAndE.allAre('[weight > 50]') );

eles.some() [](#eles.some)    

Determine whether any element in this collection satisfies the specified test function.

eles.some( , function(ele, i, eles) \[, thisArg\] )

- function(ele, i, eles)

  The test function that returns truthy values for elements that satisfy the test and falsey values for elements that do not satisfy the test.

  - [ele](#collection)

    The current element.

  - i

    The index of the current element.

  - [eles](#collection)

    The collection of elements being tested.

- thisArg \[optional\]

  The value for `this` within the test function.

### Examples

    var jAndE = cy.$('#j, #e');
    var someHeavierThan50 = jAndE.some(function( ele ){
      return ele.data('weight') > 50;
    });

    console.log( 'some heavier than 50 ? ' + someHeavierThan50 );

eles.every() [](#eles.every)    

Determine whether all elements in this collection satisfy the specified test function.

eles.every( , function(ele, i, eles) \[, thisArg\] )

- function(ele, i, eles)

  The test function that returns truthy values for elements that satisfy the test and falsey values for elements that do not satisfy the test.

  - [ele](#collection)

    The current element.

  - i

    The index of the current element.

  - [eles](#collection)

    The collection of elements being tested.

- thisArg \[optional\]

  The value for `this` within the test function.

### Examples

    var jAndE = cy.$('#j, #e');
    var everyHeavierThan50 = jAndE.every(function( ele ){
      return ele.data('weight') > 50;
    });

    console.log( 'every heavier than 50 ? ' + everyHeavierThan50 );

## Iteration [](#collection/iteration)

eles.size() [](#eles.size)  

Get the number of elements in the collection.

### Details

Note that as an alternative, you may read `eles.length` instead of `eles.size()`. The two are interchangeable.

eles.empty() et al [](#eles.empty)      

Get whether the collection is empty, meaning it has no elements.

eles.empty()

Get whether the collection is empty.

eles.nonempty()

Get whether the collection is nonempty.

eles.forEach() [](#eles.forEach)       Aliases: `eles.each()`,

Iterate over the elements in the collection.

eles.forEach( , function(ele, i, eles) \[, thisArg\] )

- function(ele, i, eles)

  The function executed each iteration.

  - [ele](#collection)

    The current element.

  - i

    The index of the current element.

  - [eles](#collection)

    The collection of elements being iterated.

- thisArg \[optional\]

  The value for `this` within the iterating function.

### Details

This function behaves like `Array.prototype.forEach()` with minor changes for convenience:

- You can exit the iteration early by returning `false` in the iterating function. The `Array.prototype.forEach()` implementation does not support this, but it is included anyway on account of its utility.

### Examples

    // print all the ids of the nodes in the graph
    cy.nodes().forEach(function( ele ){
     console.log( ele.id() );
    });

eles.eq() et al [](#eles.eq)        

Get an element at a particular index in the collection.

eles.eq( , index )

- index

  The index of the element to get.

eles.first()

Get the first element in the collection.

eles.last()

Get the last element in the collection.

### Details

You may use `eles[i]` in place of `eles.eq(i)` as a more performant alternative.

eles.slice() [](#eles.slice)    

Get a subset of the elements in the collection based on specified indices.

eles.slice( \[, start\] \[, end\] )

- start \[optional\]

  An integer that specifies where to start the selection. The first element has an index of 0. Use negative numbers to select from the end of an array.

- end \[optional\]

  An integer that specifies where to end the selection. If omitted, all elements from the start position and to the end of the array will be selected. Use negative numbers to select from the end of an array.

eles.toArray() [](#eles.toArray)  

Get the collection as an array, maintaining the order of the elements.

## Building & filtering [](#collection/building--filtering)

eles.getElementById() [](#eles.getElementById)       Aliases: `eles.$id()`,

Get an element in the collection from its ID in a very performant way.

eles.getElementById( , id )

- id

  The ID of the element to get.

eles.union() [](#eles.union)                 Aliases: `eles.add()`, `eles.or()`, `eles['u']()`, `eles['+']()`, `eles['|']()`,

Get a new collection, resulting from adding the collection with another one

eles.union( , eles )

- [eles](#collection)

  The elements to add.

eles.union( , selector )

- [selector](#selectors)

  Elements in the graph matching this selector are added.

### Examples

With a collection:

    var j = cy.$('#j');
    var e = cy.$('#e');

    j.union(e);

With a selector:

    cy.$('#j').union('#e');

eles.difference() [](#eles.difference)                   Aliases: `eles.not()`, `eles.subtract()`, `eles.relativeComplement()`, `eles['\\']()`, `eles['!']()`, `eles['-']()`,

Get a new collection, resulting from the collection without some specified elements.

eles.difference( , eles )

- [eles](#collection)

  The elements that will not be in the resultant collection.

eles.difference( , selector )

- [selector](#selectors)

  Elements from the calling collection matching this selector will not be in the resultant collection.

### Examples

With a collection:

    var j = cy.$('#j');
    var nodes = cy.nodes();

    nodes.difference(j);

With a selector:

    cy.nodes().difference('#j');

eles.absoluteComplement() [](#eles.absoluteComplement)       Aliases: `eles.abscomp()`, `eles.complement()`,

Get all elements in the graph that are not in the calling collection.

### Examples

    cy.$('#j').absoluteComplement();

eles.intersection() [](#eles.intersection)                 Aliases: `eles.intersect()`, `eles.and()`, `eles['n']()`, `eles['&']()`, `eles['.']()`,

Get the elements in both this collection and another specified collection.

eles.intersection( , eles )

- [eles](#collection)

  The elements to intersect with.

eles.intersection( , selector )

- [selector](#selectors)

  A selector representing the elements to intersect with. All elements in the graph matching the selector are used as the passed collection.

### Examples

    var jNhd = cy.$('#j').neighborhood();
    var eNhd = cy.$('#e').neighborhood();

    jNhd.intersection( eNhd );

eles.symmetricDifference() [](#eles.symmetricDifference)                 Aliases: `eles.symdiff()`, `eles.xor()`, `eles['^']()`, `eles['(+)']()`, `eles['(-)']()`,

Get the elements that are in the calling collection or the passed collection but not in both.

eles.symmetricDifference( , eles )

- [eles](#collection)

  The elements to apply the symmetric difference with.

eles.symmetricDifference( , selector )

- [selector](#selectors)

  A selector representing the elements to apply the symmetric difference with. All elements in the graph matching the selector are used as the passed collection.

### Examples

    cy.$('#j, #e, #k').symdiff('#j, #g');

eles.diff() [](#eles.diff)      

Perform a traditional left/right diff on the two collections.

eles.diff( , eles )

- [eles](#collection)

  The elements on the right side of the diff.

eles.diff( , selector )

- [selector](#selectors)

  A selector representing the elements on the right side of the diff. All elements in the graph matching the selector are used as the passed collection.

### Details

This function returns a plain object of the form `{ left, right, both }` where

- `left` is the set of elements only in the calling (i.e. left) collection,
- `right` is the set of elements only in the passed (i.e. right) collection, and
- `both` is the set of elements in both collections.

### Examples

    var diff = cy.$('#j, #e, #k').diff('#j, #g');
    var getNodeId = function( n ){ return n.id() };

    console.log( 'left: ' + diff.left.map( getNodeId ).join(', ') );
    console.log( 'right: ' + diff.right.map( getNodeId ).join(', ') );
    console.log( 'both: ' + diff.both.map( getNodeId ).join(', ') );

eles.merge() [](#eles.merge)      

Perform a in-place merge of the given elements into the calling collection.

eles.merge( , eles )

- [eles](#collection)

  The elements to merge in-place.

eles.merge( , selector )

- [selector](#selectors)

  A selector representing the elements to merge. All elements in the graph matching the selector are used as the passed collection.

### Details

This function modifies the calling collection instead of returning a new one. Use of this function should be considered for performance in some cases, but otherwise should be avoided. Consider using `eles.union()` instead.

Use this function only on new collections that you create yourself, using `cy.collection()`. This ensures that you do not unintentionally modify another collection.

### Examples

With a collection:

    var col = cy.collection(); // new, empty collection
    var j = cy.$('#j');
    var e = cy.$('#e');

    col.merge( j ).merge( e );

With a selector:

    var col = cy.collection(); // new, empty collection

    col.merge('#j').merge('#e');

eles.unmerge() [](#eles.unmerge)      

Perform an in-place operation on the calling collection to remove the given elements.

eles.unmerge( , eles )

- [eles](#collection)

  The elements to remove in-place.

eles.unmerge( , selector )

- [selector](#selectors)

  A selector representing the elements to remove. All elements in the graph matching the selector are used as the passed collection.

### Details

This function modifies the calling collection instead of returning a new one. Use of this function should be considered for performance in some cases, but otherwise should be avoided. Consider using `eles.filter()` or `eles.remove()` instead.

Use this function only on new collections that you create yourself, using `cy.collection()`. This ensures that you do not unintentionally modify another collection.

### Examples

With a collection:

    var col = cy.collection(); // new, empty collection
    var e = cy.$('#e');

    col.merge( cy.nodes() );

    col.unmerge( e );

With a selector:

    var col = cy.collection(); // new, empty collection

    col.merge( cy.nodes() );

    col.unmerge('#e');

eles.filter() et al [](#eles.filter)          

Get a new collection containing elements that are accepted by the specified filter function or selector.

eles.filter( , function(ele, i, eles) \[, thisArg\] )

- function(ele, i, eles)

  The filter function that returns truthy values for elements to include and falsey values for elements to exclude.

  - [ele](#collection)

    The current element.

  - i

    The index of the current element.

  - [eles](#collection)

    The collection of elements being filtered.

- thisArg \[optional\]

  The value for `this` within the iterating function.

eles.filter( , selector )

Get the elements that match the specified selector.

- [selector](#selectors)

  The selector to match against.

eles.nodes( , selector )

Get the nodes that match the specified selector.

- [selector](#selectors)

  The selector to match against.

eles.edges( , selector )

Get the edges that match the specified selector.

- [selector](#selectors)

  The selector to match against.

### Examples

With a selector:

    cy.nodes().filter('[weight > 50]');

With a function:

    cy.nodes().filter(function( ele ){
      return ele.data('weight') > 50;
    });

eles.sort() [](#eles.sort)    

Get a new collection containing the elements sorted by the specified comparison function.

eles.sort( , function(ele1, ele2) )

- function(ele1, ele2)

  The sorting comparison function that returns a negative number for `ele1` before `ele2`, 0 for `ele1` same as `ele2`, or a positive number for `ele1` after `ele2`.

### Examples

Get collection of nodes in order of increasing weight:

    var nodes = cy.nodes().sort(function( a, b ){
      return a.data('weight') - b.data('weight');
    });

    // show order via animations
    var duration = 1000;
    nodes.removeStyle().forEach(function( node, i ){
      node.delay( i * duration ).animate({
        style: {
          'border-width': 4,
          'border-color': 'green'
        }
      }, { duration: duration });
    });

    console.log('Animating nodes to show sorted order');

eles.map() [](#eles.map)    

Get an array containing values mapped from the collection.

eles.map( , function(ele, i, eles) \[, thisArg\] )

- function(ele, i, eles)

  The function that returns the mapped value for each element.

  - [ele](#collection)

    The current element.

  - i

    The index of the current element.

  - [eles](#collection)

    The collection of elements being mapped.

- thisArg \[optional\]

  The value for `this` within the iterating function.

### Examples

Get an array of node weights:

    var weights = cy.nodes().map(function( ele ){
      return ele.data('weight');
    });

    console.log(weights);

eles.reduce() [](#eles.reduce)    

Reduce a single value by applying a function against an accumulator and each value of the collection.

eles.reduce( , function(prevVal, ele, i, eles) )

- function(prevVal, ele, i, eles)

  The function that returns the accumulated value given the previous value and the current element.

  - prevVal

    The value accumulated from previous elements.

  - [ele](#collection)

    The current element.

  - i

    The index of the current element.

  - [eles](#collection)

    The collection of elements being reduced.

### Examples

Join the node IDs into a comma-separated string:

    var initialValue = null;
    var fn = function( prevVal, ele, i, eles ){
      if( prevVal ){
        return prevVal + ',' + ele.id();
      } else {
        return ele.id();
      }
    };
    var ids = cy.nodes().reduce( fn, initialValue );

    console.log( ids );

eles.min() [](#eles.min)    

Find a minimum value in a collection.

eles.min( , function(ele, i, eles) \[, thisArg\] )

- function(ele, i, eles)

  The function that returns the value to compare for each element.

  - [ele](#collection)

    The current element.

  - i

    The index of the current element.

  - [eles](#collection)

    The collection of elements being searched.

- thisArg \[optional\]

  The value for `this` within the iterating function.

### Details

This function returns an object with the following fields:

- `value` : The minimum value found.
- `ele` : The element that corresponds to the minimum value.

### Examples

Find the node with the minimum weight:

    var min = cy.nodes().min(function(){
      return this.data('weight');
    });

    console.log( 'min val: ' + min.value + ' for element ' + min.ele.id() );

eles.max() [](#eles.max)    

Find a maximum value and the corresponding element.

eles.max( , function(ele, i, eles) \[, thisArg\] )

- function(ele, i, eles)

  The function that returns the value to compare for each element.

  - [ele](#collection)

    The current element.

  - i

    The index of the current element.

  - [eles](#collection)

    The collection of elements being searched.

- thisArg \[optional\]

  The value for `this` within the iterating function.

### Details

This function returns an object with the following fields:

- `value` : The maximum value found.
- `ele` : The element that corresponds to the maximum value.

### Examples

Find the node with the maximum weight:

    var max = cy.nodes().max(function(){
      return this.data('weight');
    });

    console.log( 'max val: ' + max.value + ' for element ' + max.ele.id() );

## Traversing [](#collection/traversing)

eles.neighborhood() et al [](#eles.neighborhood)        

Get the neighbourhood of the elements.

eles.neighborhood( \[, selector\] ) Aliases: eles.neighbourhood(),

Get the open neighbourhood of the elements.

- [selector](#selectors) \[optional\]

  An optional selector that is used to filter the resultant collection.

eles.openNeighborhood( \[, selector\] ) Aliases: eles.openNeighbourhood(),

Get the open neighbourhood of the elements.

- [selector](#selectors) \[optional\]

  An optional selector that is used to filter the resultant collection.

eles.closedNeighborhood( \[, selector\] ) Aliases: eles.closedNeighbourhood(),

Get the closed neighbourhood of the elements.

- [selector](#selectors) \[optional\]

  An optional selector that is used to filter the resultant collection.

### Details

The neighbourhood returned by this function is a bit different than the traditional definition of a “neighbourhood”: This returned neighbourhood includes the edges connecting the collection to the neighbourhood. This gives you more flexibility.

An **open neighbourhood** is one that **does not** include the original set of elements. If unspecified, a neighbourhood is open by default.

A **closed neighbourhood** is one that **does** include the original set of elements.

### Examples

    cy.$('#j').neighborhood();

eles.components() et al [](#eles.components)        

Get the connected components.

eles.components()

Get the connected components, considering only the elements in the calling collection. An array of collections is returned, with each collection representing a component.

eles.componentsOf( , root )

Get the connected components to which the passed elements belong. The components consider only the subgraph made by the elements in the calling collection. An array of collections is returned, with each collection representing a component.

- [root](#collection)

  The components that contain these elements are returned.

ele.component()

Get the connected component for the calling element. The component considers all elements in the graph.

nodes.edgesWith() [](#nodes.edgesWith)      

Get the edges connecting the collection to another collection. Direction of the edges does not matter.

nodes.edgesWith( , eles )

- [eles](#collection)

  The other collection.

nodes.edgesWith( , selector )

- [selector](#selectors)

  The other collection, specified as a selector which is matched against all elements in the graph.

### Examples

    var j = cy.$('#j');
    var e = cy.$('#e');

    j.edgesWith(e);

nodes.edgesTo() [](#nodes.edgesTo)      

Get the edges coming from the collection (i.e. the source) going to another collection (i.e. the target).

nodes.edgesTo( , eles )

- [eles](#collection)

  The other collection.

nodes.edgesTo( , selector )

- [selector](#selectors)

  The other collection, specified as a selector which is matched against all elements in the graph.

### Examples

    var j = cy.$('#j');
    var e = cy.$('#e');

    j.edgesTo(e);

edges.connectedNodes() [](#edges.connectedNodes)    

Get the nodes connected to the edges in the collection.

edges.connectedNodes( \[, selector\] )

- [selector](#selectors) \[optional\]

  An optional selector that is used to filter the resultant collection.

### Examples

    var je = cy.$('#je');

    je.connectedNodes();

nodes.connectedEdges() [](#nodes.connectedEdges)    

Get the edges connected to the nodes in the collection.

nodes.connectedEdges( \[, selector\] )

- [selector](#selectors) \[optional\]

  An optional selector that is used to filter the resultant collection.

### Examples

    var j = cy.$('#j');

    j.connectedEdges();

edge.source() [](#edge.source)    

Get source node of this edge.

edge.source( \[, selector\] )

- [selector](#selectors) \[optional\]

  An optional selector that is used to filter the resultant collection.

### Examples

    var je = cy.$('#je');

    je.source();

edges.sources() [](#edges.sources)    

Get source nodes connected to the edges in the collection.

edges.sources( \[, selector\] )

- [selector](#selectors) \[optional\]

  An optional selector that is used to filter the resultant collection.

### Examples

    var edges = cy.$('#je, #kg');

    edges.sources();

edge.target() [](#edge.target)    

Get target node of this edge.

edge.target( \[, selector\] )

- [selector](#selectors) \[optional\]

  An optional selector that is used to filter the resultant collection.

### Examples

    var je = cy.$('#je');

    je.target();

edges.targets() [](#edges.targets)    

Get target nodes connected to the edges in the collection.

edges.targets( \[, selector\] )

- [selector](#selectors) \[optional\]

  An optional selector that is used to filter the resultant collection.

### Examples

    var edges = cy.$('#je, #kg');

    edges.targets();

edges.parallelEdges() [](#edges.parallelEdges)    

Get edges parallel to those in the collection.

edges.parallelEdges( \[, selector\] )

- [selector](#selectors) \[optional\]

  An optional selector that is used to filter the resultant collection.

### Details

Two edges are said to be parallel if they connect the same two nodes. Any two parallel edges may connect nodes in the same direction, in which case the edges share the same source and target. They may alternatively connect nodes in the opposite direction, in which case the source and target are reversed in the second edge.

### Examples

    cy.$('#je').parallelEdges();

edges.codirectedEdges() [](#edges.codirectedEdges)    

Get edges codirected to those in the collection.

edges.codirectedEdges( \[, selector\] )

- [selector](#selectors) \[optional\]

  An optional selector that is used to filter the resultant collection.

### Details

Two edges are said to be codirected if they connect the same two nodes in the same direction: The edges have the same source and target.

### Examples

    cy.$('#je').codirectedEdges(); // only self in this case

nodes.roots() [](#nodes.roots)    

From the set of calling nodes, get the nodes which are roots (i.e. no incoming edges, as in a directed acyclic graph).

nodes.roots( \[, selector\] )

- [selector](#selectors) \[optional\]

  An optional selector that is used to filter the resultant collection.

nodes.leaves() [](#nodes.leaves)    

From the set of calling nodes, get the nodes which are leaves (i.e. no outgoing edges, as in a directed acyclic graph).

nodes.leaves( \[, selector\] )

- [selector](#selectors) \[optional\]

  An optional selector that is used to filter the resultant collection.

nodes.outgoers() [](#nodes.outgoers)    

Get edges (and their targets) coming out of the nodes in the collection.

nodes.outgoers( \[, selector\] )

- [selector](#selectors) \[optional\]

  An optional selector that is used to filter the resultant collection.

### Examples

Get outgoers of `j`:

    cy.$('#j').outgoers();

nodes.successors() [](#nodes.successors)    

Recursively get edges (and their targets) coming out of the nodes in the collection (i.e. the outgoers, the outgoers’ outgoers, …).

nodes.successors( \[, selector\] )

- [selector](#selectors) \[optional\]

  An optional selector that is used to filter the resultant collection.

### Examples

Get successors of `j`:

    cy.$('#j').successors();

nodes.incomers() [](#nodes.incomers)    

Get edges (and their sources) coming into the nodes in the collection.

nodes.incomers( \[, selector\] )

- [selector](#selectors) \[optional\]

  An optional selector that is used to filter the resultant collection.

### Examples

Get incomers of `j`:

    cy.$('#j').incomers();

nodes.predecessors() [](#nodes.predecessors)    

Recursively get edges (and their sources) coming into the nodes in the collection (i.e. the incomers, the incomers’ incomers, …).

nodes.predecessors( \[, selector\] )

- [selector](#selectors) \[optional\]

  An optional selector that is used to filter the resultant collection.

### Examples

Get predecessors of `j`:

    cy.$('#j').predecessors();

## Search [](#collection/search)

eles.breadthFirstSearch() [](#eles.breadthFirstSearch)       Aliases: `eles.bfs()`,

Perform a [breadth-first search](https://en.wikipedia.org/wiki/Breadth-first_search) within the elements in the collection.

eles.breadthFirstSearch( , options )

- options
  - [root](#collection)

    The root nodes (selector or collection) to start the search from.

  - visit: function(v, e, u, i, depth) \[optional\]

    A handler function that is called when a node is visited in the search. The handler returns `true` when it finds the desired node, and it returns `false` to cancel the search.

    - v

      The current node.

    - e

      The edge connecting the previous node to the current node.

    - u

      The previous node.

    - i

      The index indicating this node is the ith visited node.

    - depth

      How many edge hops away this node is from the root nodes.

  - directed \[optional\]

    A boolean indicating whether the algorithm should only go along edges from source to target (default `false`).

### Details

Note that this function performs a breadth-first search on only the subset of the graph in the calling collection.

This function returns an object that contains two collections (`{ path: eles, found: node }`), the node found by the search and the path of the search:

- If no node was found, then `found` is empty.
- If your handler function returns `false`, then the only the path up to that point is returned.
- The path returned includes edges such that if `path[i]` is a node, then `path[i - 1]` is the edge used to get to that node.

### Examples

    var bfs = cy.elements().bfs({
      roots: '#e',
      visit: function(v, e, u, i, depth){
        console.log( 'visit ' + v.id() );

        // example of finding desired node
        if( v.data('weight') > 70 ){
          return true;
        }

        // example of exiting search early
        if( v.data('weight') < 0 ){
          return false;
        }
      },
      directed: false
    });

    var path = bfs.path; // path to found node
    var found = bfs.found; // found node

    // select the path
    path.select();

eles.depthFirstSearch() [](#eles.depthFirstSearch)       Aliases: `eles.dfs()`,

Perform a [depth-first search](https://en.wikipedia.org/wiki/Depth-first_search) within the elements in the collection.

eles.depthFirstSearch( , options )

- options
  - [root](#collection)

    The root nodes (selector or collection) to start the search from.

  - visit: function(v, e, u, i, depth) \[optional\]

    A handler function that is called when a node is visited in the search. The handler returns `true` when it finds the desired node, and it returns `false` to cancel the search.

    - v

      The current node.

    - e

      The edge connecting the previous node to the current node.

    - u

      The previous node.

    - i

      The index indicating this node is the ith visited node.

    - depth

      How many edge hops away this node is from the root nodes.

  - directed \[optional\]

    A boolean indicating whether the algorithm should only go along edges from source to target (default `false`).

### Details

Note that this function performs a depth-first search on only the subset of the graph in the calling collection.

This function returns an object that contains two collections (`{ path: eles, found: node }`), the node found by the search and the path of the search:

- If no node was found, then `found` is empty.
- If your handler function returns `false`, then the only the path up to that point is returned.
- The path returned includes edges such that if `path[i]` is a node, then `path[i - 1]` is the edge used to get to that node.

### Examples

    var dfs = cy.elements().dfs({
      roots: '#e',
      visit: function(v, e, u, i, depth){
        console.log( 'visit ' + v.id() );

        // example of finding desired node
        if( v.data('weight') > 70 ){
          return true;
        }

        // example of exiting search early
        if( v.data('weight') < 0 ){
          return false;
        }
      },
      directed: false
    });

    var path = dfs.path; // path to found node
    var found = dfs.found; // found node

    // select the path
    path.select();

eles.dijkstra() [](#eles.dijkstra)    

Perform [Dijkstra’s](https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm) algorithm on the elements in the collection. This finds the shortest paths to all other nodes in the collection from the root node.

eles.dijkstra( , options )

- options
  - [root](#collection)

    The root node (selector or collection) where the algorithm starts.

  - weight: function(edge) \[optional\]

    A function that returns the positive numeric weight for the edge. The weight indicates the cost of going from one node to another node.

  - directed \[optional\]

    A boolean indicating whether the algorithm should only go along edges from source to target (default `false`).

### Details

Note that this function performs Dijkstra’s algorithm on only the subset of the graph in the calling collection.

This function returns an object of the following form:

    {
      distanceTo: function( node ){ /* impl */ }
      pathTo: function( node ){ /* impl */ }
    }

`distanceTo(node)` returns the distance from the source node to `node`, and `pathTo(node)` returns a collection containing the shortest path from the source node to `node`. The path starts with the source node and includes the edges between the nodes in the path such that if `pathTo(node)[i]` is an edge, then `pathTo(node)[i-1]` is the previous node in the path and `pathTo(node)[i+1]` is the next node in the path.

If no weight function is defined, a constant weight of 1 is used for each edge.

### Examples

    var dijkstra = cy.elements().dijkstra('#e', function(edge){
      return edge.data('weight');
    });

    var pathToJ = dijkstra.pathTo( cy.$('#j') );
    var distToJ = dijkstra.distanceTo( cy.$('#j') );

eles.aStar() [](#eles.aStar)    

Perform the [A\*](https://en.wikipedia.org/wiki/A*_search_algorithm) search algorithm on the elements in the collection. This finds the shortest path from the root node to the goal node.

eles.aStar( , options )

- options
  - [root](#collection)

    The root node (selector or collection) where the search starts.

  - goal

    The goal node (selector or collection) where the search ends.

  - weight: function(edge) \[optional\]

    A function that returns the positive numeric weight for the edge. The weight indicates the cost of going from one node to another node.

  - heuristic: function(node) \[optional\]

    A function that returns an estimation (cannot be overestimation) on the shortest distance from the current node to the goal.

  - directed \[optional\]

    A boolean indicating whether the algorithm should only go along edges from source to target (default `false`).

### Details

Note that this function performs A\* search on only the subset of the graph in the calling collection.

This function returns an object of the following form:

    {
      found, /* true or false */
      distance, /* Distance of the shortest path, if found */
      path /* Ordered collection of elements in the shortest path, if found */
    }

Regarding optional options:

- If no weight function is defined, a constant weight of 1 is used for each edge.
- If no heuristic function is provided, a constant null function will be used, turning this into the same behaviour as Dijkstra’s algorithm. The heuristic should be monotonic (also called consistent) in addition to being ‘admissible’.

### Examples

    var aStar = cy.elements().aStar({ root: "#j", goal: "#e" });

    aStar.path.select();

eles.floydWarshall() [](#eles.floydWarshall)    

Perform the [Floyd-Warshall](https://en.wikipedia.org/wiki/Floyd%E2%80%93Warshall_algorithm) search algorithm on the elements in the collection. This finds the shortest path between all pairs of nodes.

eles.floydWarshall( , options )

- options
  - weight: function(edge) \[optional\]

    A function that returns the numeric weight for the edge. The weight indicates the cost of going from one node to another node. The weight may be positive or negative, but no negative cycles are allowed.

  - directed \[optional\]

    A boolean indicating whether the algorithm should only go along edges from source to target (default `false`).

### Details

This function returns an object of the following form:

    {
      /* function that computes the shortest path between 2 nodes 
      (either objects or selector strings) */
      path: function( fromNode, toNode ){ /* impl */ }, 

      /* function that computes the shortest distance between 2 nodes 
      (either objects or selector strings) */
      distance: function( fromNode, toNode ){ /* impl */ }
    }

If no weight function is defined, a constant weight of 1 is used for each edge.

### Examples

    var fw = cy.elements().floydWarshall();

    fw.path('#k', '#g').select();

eles.bellmanFord() [](#eles.bellmanFord)    

Perform the [Bellman-Ford](https://en.wikipedia.org/wiki/Bellman%E2%80%93Ford_algorithm) search algorithm on the elements in the collection. This finds the shortest path from the starting node to all other nodes in the collection.

eles.bellmanFord( , options )

- options
  - [root](#collection)

    The root node (selector or collection) where the search starts.

  - weight: function(edge) \[optional\]

    A function that returns the numeric weight for the edge. The weight indicates the cost of going from one node to another node. The weight may be positive or negative.

  - directed \[optional\]

    A boolean indicating whether the algorithm should only go along edges from source to target (default `false`).

### Details

This function returns an object of the following form:

    {
      /* function that computes the shortest path from root node to the argument node
      (either objects or selector string) */
      pathTo: function(node){ /* impl */ }, 

      /* function that computes the shortest distance from root node to argument node
      (either objects or selector string) */
      distanceTo: function(node){ /* impl */ }, 

      /* true/false. If true, pathTo and distanceTo will be undefined */
      hasNegativeWeightCycle,

      /* Array of collections corresponding to the negative weight cycles found
      (only populated if the findNegativeWeightCycles option is set to true) */
      negativeWeightCycles
    }

If no weight function is defined, a constant weight of 1 is used for each edge.

The Bellman-Ford algorithm is good at detecting negative weight cycles, but it can not return path or distance results if it finds them.

### Examples

    var bf = cy.elements().bellmanFord({ root: "#j" });

    bf.pathTo('#g').select();

eles.hierholzer() [](#eles.hierholzer)    

Perform the [Hierholzer](https://en.wikipedia.org/wiki/Eulerian_path#Hierholzer's_algorithm) search algorithm on the elements in the collection. This finds Eulerian trails and circuits.

eles.hierholzer( , options )

- options
  - [root](#collection) \[optional\]

    The root node (selector or collection) where the search starts.

  - directed \[optional\]

    A boolean indicating whether the algorithm should only go along edges from source to target (default `false`).

### Details

Note that this function performs Hierholzer’s algorithm on only the subset of the graph in the calling collection.

This function returns an object of the following form:

    {
      found, /* true or false */
      trail /* Ordered collection of elements in the Eulerian trail or cycle, if found */
    }

Regarding optional options:

- If no root node is provided, the first node in the collection will be taken as the starting node in the algorithm.
- The graph is assumed to be undirected unless specified otherwise.

### Examples

    var hierholzer = cy.elements().hierholzer({ root: "#k", directed: true });

    hierholzer.trail.select();

## Spanning [](#collection/spanning)

eles.kruskal() [](#eles.kruskal)    

Perform [Kruskal’s](https://en.wikipedia.org/wiki/Kruskal%27s_algorithm) algorithm on the elements in the collection, returning the minimum spanning tree, assuming undirected edges.

eles.kruskal( \[, function(edge)\] )

- function(edge) \[optional\]

  A function that returns the positive numeric weight for the edge.

### Details

Note that this function runs Kruskal’s algorithm on the subset of the graph in the calling collection.

### Examples

    cy.elements().kruskal();

## Cut [](#collection/cut)

eles.kargerStein() [](#eles.kargerStein)  

Finds the minimum cut in a graph using the [Karger-Stein](https://en.wikipedia.org/wiki/Karger%27s_algorithm#Karger.E2.80.93Stein_algorithm) algorithm. The optimal result is found with a high probability, but without guarantee.

### Details

This function returns an object of the following form:

    {
      /* Collection of edges that are in the cut */
      cut,

      /* Array of collections corresponding to the components
      containing each disjoint subset of nodes defined by the cut */
      components
    }

### Examples

    var ks = cy.elements().kargerStein();

    ks.cut.select();

eles.hopcroftTarjanBiconnected() [](#eles.hopcroftTarjanBiconnected)         Aliases: `eles.hopcroftTarjanBiconnectedComponents()`, `eles.htb()`, `eles.htbc()`,

Finds the [biconnected components](https://en.wikipedia.org/wiki/Biconnected_component) in an undirected graph, as well as their respective cut vertices, using an algorithm due to Hopcroft and Tarjan.

### Details

Note that this function identifies biconnected components and cut vertices only within the subset of the graph in the calling collection.

This function returns an object of the following form:

    {
      cut, /* Collection of nodes identified as cut vertices */
      components /* An array of collections corresponding to each biconnected component */
    }

### Examples

    var ht = cy.elements().htbc();

    ht.components[0].select();

eles.tarjanStronglyConnected() [](#eles.tarjanStronglyConnected)         Aliases: `eles.tarjanStronglyConnectedComponents()`, `eles.tsc()`, `eles.tscc()`,

Finds the [strongly connected components](https://en.wikipedia.org/wiki/Strongly_connected_component) of a directed graph using Tarjan’s algorithm.

### Details

Note that this function identifies strongly connected components only within the subset of the graph in the calling collection.

This function returns an object of the following form:

    {
      cut, /* Collection of edges which adjoin pairs of strongly connected components */
      components /* Array of collections corresponding to each strongly connected component */
    }

### Examples

    var tsc = cy.elements().tarjanStronglyConnected();

    tsc.components[0].select();

## Centrality [](#collection/centrality)

eles.degreeCentrality() [](#eles.degreeCentrality)       Aliases: `eles.dc()`,

Considering only the elements in the calling collection, calculate the [degree centrality](https://en.wikipedia.org/wiki/Centrality#Degree_centrality) of the specified root node.

eles.degreeCentrality( , options )

- options
  - [root](#collection)

    The root node (selector or collection) for which the centrality calculation is made.

  - weight: function(edge) \[optional\]

    A function that returns the positive weight for the edge. The weight indicates the importance of the edge, with a high value representing high importance.

  - alpha \[optional\]

    The alpha value for the centrality calculation, ranging on \[0, 1\]. With value 0 (default), disregards edge weights and solely uses number of edges in the centrality calculation. With value 1, disregards number of edges and solely uses the edge weights in the centrality calculation.

  - directed \[optional\]

    A boolean indicating whether the directed indegree and outdegree centrality is calculated (`true`) or whether the undirected centrality is calculated (`false`, default).

### Details

For `options.directed: false`, this function returns an object of the following form:

    {
      degree /* the degree centrality of the root node */
    }

For `options.directed: true`, this function returns an object of the following form:

    {
      indegree, /* the indegree centrality of the root node */
      outdegree /* the outdegree centrality of the root node */
    }

### Examples

    console.log( 'dc of j: ' + cy.$().dc({ root: '#j' }).degree );

eles.degreeCentralityNormalized() [](#eles.degreeCentralityNormalized)         Aliases: `eles.dcn()`, `eles.degreeCentralityNormalised()`,

Considering only the elements in the calling collection, calculate the normalised [degree centrality](https://en.wikipedia.org/wiki/Centrality#Degree_centrality) of the nodes.

eles.degreeCentralityNormalized( , options )

- options
  - weight: function(edge) \[optional\]

    A function that returns the positive weight for the edge. The weight indicates the importance of the edge, with a high value representing high importance.

  - alpha \[optional\]

    The alpha value for the centrality calculation, ranging on \[0, 1\]. With value 0 (default), disregards edge weights and solely uses number of edges in the centrality calculation. With value 1, disregards number of edges and solely uses the edge weights in the centrality calculation.

  - directed \[optional\]

    A boolean indicating whether the directed indegree and outdegree centrality is calculated (`true`) or whether the undirected centrality is calculated (`false`, default).

### Details

For `options.directed: false`, this function returns an object of the following form:

    {
      /* the normalised degree centrality of the specified node */
      degree: function( node ){ /* impl */ }
    }

For `options.directed: true`, this function returns an object of the following form:

    {
      /* the normalised indegree centrality of the specified node */
      indegree: function( node ){ /* impl */ },

      /* the normalised outdegree centrality of the specified node */ 
      outdegree: function( node ){ /* impl */ }
    }

### Examples

    var dcn = cy.$().dcn();
    console.log( 'dcn of j: ' + dcn.degree('#j') );

eles.closenessCentrality() [](#eles.closenessCentrality)       Aliases: `eles.cc()`,

Considering only the elements in the calling collection, calculate the [closeness centrality](https://en.wikipedia.org/wiki/Closeness_centrality) of the specified root node.

eles.closenessCentrality( , options )

- options
  - [root](#collection)

    The root node (selector or collection) for which the centrality calculation is made.

  - weight: function(edge) \[optional\]

    A function that returns the positive weight for the edge. The weight indicates the importance of the edge, with a high value representing high importance.

  - directed \[optional\]

    A boolean indicating whether the algorithm operates on edges in a directed manner from source to target (`true`) or whether the algorithm operates in an undirected manner (`false`, default).

  - harmonic \[optional\]

    A boolean indicating whether the algorithm calculates the harmonic mean (`true`, default) or the arithmetic mean (`false`) of distances. The harmonic mean is very useful for graphs that are not strongly connected.

### Details

This function directly returns the numerical closeness centrality value for the specified root node.

### Examples

    console.log( 'cc of j: ' + cy.$().cc({ root: '#j' }) );

eles.closenessCentralityNormalized() [](#eles.closenessCentralityNormalized)         Aliases: `eles.ccn()`, `eles.closenessCentralityNormalised()`,

Considering only the elements in the calling collection, calculate the [closeness centrality](https://en.wikipedia.org/wiki/Closeness_centrality) of the nodes.

eles.closenessCentralityNormalized( , options )

- options
  - weight: function(edge) \[optional\]

    A function that returns the positive weight for the edge. The weight indicates the importance of the edge, with a high value representing high importance.

  - directed \[optional\]

    A boolean indicating whether the algorithm operates on edges in a directed manner from source to target (`true`) or whether the algorithm operates in an undirected manner (`false`, default).

  - harmonic \[optional\]

    A boolean indicating whether the algorithm calculates the harmonic mean (`true`, default) or the arithmetic mean (`false`) of distances. The harmonic mean is very useful for graphs that are not strongly connected.

### Details

This function returns an object of the form:

    {
      /* returns the normalised closeness centrality of the specified node */
      closeness: function( node ){ /* impl */ }
    }

### Examples

    var ccn = cy.$().ccn();
    console.log( 'ccn of j: ' + ccn.closeness('#j') );

eles.betweennessCentrality() [](#eles.betweennessCentrality)       Aliases: `eles.bc()`,

Considering only the elements in the calling collection, calculate the [betweenness centrality](https://en.wikipedia.org/wiki/Betweenness_centrality) of the nodes.

eles.betweennessCentrality( , options )

- options
  - weight: function(edge) \[optional\]

    A function that returns the positive weight for the edge. The weight indicates the importance of the edge, with a high value representing high importance.

  - directed \[optional\]

    A boolean indicating whether the algorithm operates on edges in a directed manner from source to target (`true`) or whether the algorithm operates in an undirected manner (`false`, default).

### Details

This function returns an object of the form:

    {
      /* returns the betweenness centrality of the specified node */
      betweenness: function( node ){ /* impl */ },

      /* returns the normalised betweenness centrality of the specified node */
      betweennessNormalized: function( node ){ /* impl */ }
      /* alias : betweennessNormalised() */
    }

### Examples

    var bc = cy.$().bc();
    console.log( 'bc of j: ' + bc.betweenness('#j') );

eles.pageRank() [](#eles.pageRank)    

Rank the nodes in the collection using the [Page Rank](https://en.wikipedia.org/wiki/PageRank) algorithm.

eles.pageRank( , options )

- options
  - dampingFactor \[optional\]

    The [damping factor](https://en.wikipedia.org/wiki/PageRank#Damping_factor), affecting how long the algorithm goes along the topology of the graph (default `0.8`).

  - precision \[optional\]

    Numeric parameter that represents the required precision (default `0.000001`). The algorithm stops when the difference between iterations is this value or less.

  - iterations \[optional\]

    Maximum number of iterations to perform (default `200`).

### Details

This function returns an object of the following form:

    {
      /* function that computes the rank of a given node (either object or selector string) */
      rank: function( node ){ /* impl */ } 
    }

### Examples

    var pr = cy.elements().pageRank();

    console.log('g rank: ' + pr.rank('#g'));

## Clustering [](#collection/clustering)

eles.markovClustering() [](#eles.markovClustering)       Aliases: `eles.mcl()`,

Considering only the elements in the calling collection, run the [Markov cluster algorithm](https://micans.org/mcl/) of the nodes.

eles.markovClustering( , options )

- options
  - attributes: \[ function(edge) ... \]

    An array of attribute functions, each of which returns a numeric attribute value for the specified edge. Attributes are used to cluster the nodes; i.e. the attributes of an edge indicate similarity between its nodes.

  - expandFactor \[optional\]

    A number that affects time of computation and cluster granularity to some extent: `M * M` (default `2`)

  - inflateFactor \[optional\]

    A number that affects cluster granularity (the greater the value, the more clusters): `M(i,j) / E(j)` (default `2`)

  - multFactor \[optional\]

    Optional number of self loops for each node. Use a neutral value to improve cluster computations (default `1`).

  - maxIterations \[optional\]

    Maximum number of iterations of the MCL algorithm in a single run (default `20`).

### Details

Note that this function performs Markov clustering on only the subset of the graph in the calling collection. Markov clustering uses the topology of the graph and the specified edge attributes to determine clusters.

This function returns an array, containing collections. Each collection in the array is a cluster found by the Markov clustering algorithm.

### Examples

    var clusters = cy.elements().markovClustering({
      attributes: [
        function( edge ){ return edge.data('closeness'); }
      ]
    });

nodes.kMeans() [](#nodes.kMeans)    

Considering only the nodes in the calling collection, calculate the [k-means clustering](https://en.wikipedia.org/wiki/K-means_clustering) of the nodes.

nodes.kMeans( , options )

- options
  - attributes: \[ function( node ) ... \]

    An array of attribute functions, each of which returns a numeric attribute value for the specified node. Attributes are used to cluster the nodes; i.e. two nodes with similar attributes tend to be in the same cluster. Each attribute may have to be normalised in order for the chosen distance metric to make sense. Attributes must be specified unless a custom `distance: function( nodeP, nodeQ )` is specified.

  - k

    The number of clusters to return.

  - distance

    The distance classifier used to compare attribute vectors. It is optional if attributes are specified. It may take on one of several values:

    - 'euclidean'

      [Euclidean distance](https://en.wikipedia.org/wiki/Euclidean_distance) (default)

    - 'squaredEuclidean'

      [Squared Euclidean distance](https://en.wikipedia.org/wiki/Euclidean_distance#Squared_Euclidean_distance)

    - 'manhattan'

      [Manhattan distance](https://en.wikipedia.org/wiki/Taxicab_geometry)

    - 'max'

      [Max distance](https://en.wikipedia.org/wiki/Uniform_norm)

    - function( length, getPAt, getQAt\[, nodeP, nodeQ\] )

      A custom function that returns the distance between attribute vectors `p` and `q`.

      - length

        The length of the vectors.

      - getPAt(i)

        A function that returns the ith value of the `p` vector.

      - getQAt(i)

        A function that returns the ith value of the `q` vector.

  - maxIterations \[optional\]

    The maximum number of iterations of the algorithm to run (default `10`).

  - sensitivityThreshold \[optional\]

    The coefficients difference threshold used to determine whether the algorithm has converged (default `0.001`).

### Details

Note that this function performs k-means clustering on only the subset of the graph in the calling collection. K-means does not normally take into consideration the topology of the graph.

This function returns an array, containing collections. Each collection in the array is a cluster found by the algorithm.

One of the major differences between the k-means and k-medoids algorithms is the manner in which the cluster centres are initialized. In k-means, the cluster centres (centroids) are vectors with elements initialised to random values within each dimension’s range. In k-medoids, the cluster centres (medoids) are random nodes from the data set.

The other is that the k-means algorithm determines new cluster centres by taking the average of all the nodes within that cluster, whereas k-medoids selects the node with the lowest configuration cost as the new cluster centre.

### Examples

    var clusters = cy.elements().kMeans({
      k: 2,
      attributes: [
        function( node ){ return edge.data('weight'); }
      ]
    });

nodes.kMedoids() [](#nodes.kMedoids)    

Considering only the nodes in the calling collection, calculate the [k-medoids clustering](https://en.wikipedia.org/wiki/K-medoids) of the nodes.

nodes.kMedoids( , options )

- options
  - attributes: \[ function( node ) ... \]

    An array of attribute functions, each of which returns a numeric attribute value for the specified node. Attributes are used to cluster the nodes; i.e. two nodes with similar attributes tend to be in the same cluster. Each attribute may have to be normalised in order for the chosen distance metric to make sense. Attributes must be specified unless a custom `distance: function( nodeP, nodeQ )` is specified.

  - k

    The number of clusters to return.

  - distance

    The distance classifier used to compare attribute vectors. It is optional if attributes are specified. It may take on one of several values:

    - 'euclidean'

      [Euclidean distance](https://en.wikipedia.org/wiki/Euclidean_distance) (default)

    - 'squaredEuclidean'

      [Squared Euclidean distance](https://en.wikipedia.org/wiki/Euclidean_distance#Squared_Euclidean_distance)

    - 'manhattan'

      [Manhattan distance](https://en.wikipedia.org/wiki/Taxicab_geometry)

    - 'max'

      [Max distance](https://en.wikipedia.org/wiki/Uniform_norm)

    - function( length, getPAt, getQAt\[, nodeP, nodeQ\] )

      A custom function that returns the distance between attribute vectors `p` and `q`.

      - length

        The length of the vectors.

      - getPAt(i)

        A function that returns the ith value of the `p` vector.

      - getQAt(i)

        A function that returns the ith value of the `q` vector.

      - nodeP \[optional\]

        An optionally-used reference to the node associated with the `p` attribute vector. It is useful for affecting the weights with information outside of the attributes, such as connectivity.

      - nodeQ \[optional\]

        An optionally-used reference to the node associated with the `q` attribute vector. It is useful for affecting the weights with information outside of the attributes, such as connectivity.

    - function( nodeP, nodeQ )

      A custom function that returns the distance between `nodeP` and `nodeQ`. This allows for specifying the distance matrix directly, forgoing attributes.

  - maxIterations \[optional\]

    The maximum number of iterations of the algorithm to run (default `10`).

### Details

Note that this function performs k-mediods clustering on only the subset of the graph in the calling collection. K-medoids does not normally take into consideration topology.

This function returns an array, containing collections. Each collection in the array is a cluster found by the algorithm.

One of the major differences between the k-means and k-medoids algorithms is the manner in which the cluster centres are initialized. In k-means, the cluster centres (centroids) are vectors with elements initialised to random values within each dimension’s range. In k-medoids, the cluster centres (medoids) are random nodes from the data set.

The other is that the k-means algorithm determines new cluster centres by taking the average of all the nodes within that cluster, whereas k-medoids selects the node with the lowest configuration cost as the new cluster centre.

### Examples

    var clusters = cy.elements().kMediods({
      k: 2,
      attributes: [
        function( node ){ return edge.data('weight'); }
      ]
    });

nodes.fuzzyCMeans() [](#nodes.fuzzyCMeans)       Aliases: `nodes.fcm()`,

Considering only the elements in the calling collection, calculate the [fuzzy c-means clustering](https://en.wikipedia.org/wiki/Fuzzy_clustering#Fuzzy_C-means_clustering) of the nodes.

nodes.fuzzyCMeans( , options )

- options
  - attributes: \[ function( node ) ... \]

    An array of attribute functions, each of which returns a numeric attribute value for the specified node. Attributes are used to cluster the nodes; i.e. two nodes with similar attributes tend to be in the same cluster. Each attribute may have to be normalised in order for the chosen distance metric to make sense. Attributes must be specified unless a custom `distance: function( nodeP, nodeQ )` is specified.

  - k

    The number of clusters to return.

  - distance

    The distance classifier used to compare attribute vectors. It is optional if attributes are specified. It may take on one of several values:

    - 'euclidean'

      [Euclidean distance](https://en.wikipedia.org/wiki/Euclidean_distance) (default)

    - 'squaredEuclidean'

      [Squared Euclidean distance](https://en.wikipedia.org/wiki/Euclidean_distance#Squared_Euclidean_distance)

    - 'manhattan'

      [Manhattan distance](https://en.wikipedia.org/wiki/Taxicab_geometry)

    - 'max'

      [Max distance](https://en.wikipedia.org/wiki/Uniform_norm)

    - function( length, getPAt, getQAt\[, nodeP, nodeQ\] )

      A custom function that returns the distance between attribute vectors `p` and `q`.

      - length

        The length of the vectors.

      - getPAt(i)

        A function that returns the ith value of the `p` vector.

      - getQAt(i)

        A function that returns the ith value of the `q` vector.

  - maxIterations \[optional\]

    The maximum number of iterations of the algorithm to run (default `10`).

  - sensitivityThreshold \[optional\]

    The coefficient difference threshold used to determine whether the algorithm has converged (default `0.001`).

### Details

Note that this function performs fuzzy c-means clustering on only the subset of the graph in the calling collection.

This function returns an object of the following format:

    {
      // The resultant clusters
      clusters: [ /* cluster0, cluster1, ... */ ],

      // A two-dimensional array containing a partition matrix
      // degreeOfMembership[i][j] indicates the degree to which nodes[i] belongs to clusters[j]
      degreeOfMembership: [ /* row0, row1, ... */ ]
    }

### Examples

    var clusters = cy.elements().fuzzyCMeans({
      k: 2,
      attributes: [
        function( node ){ return edge.data('weight'); }
      ]
    });

nodes.hierarchicalClustering() [](#nodes.hierarchicalClustering)       Aliases: `nodes.hca()`,

Considering only the elements in the calling collection, calculate the agglomerative [hierarchical clustering](https://en.wikipedia.org/wiki/Hierarchical_clustering) of the nodes.

nodes.hierarchicalClustering( , options )

- options
  - attributes: \[ function( node ) ... \]

    An array of attribute functions, each of which returns a numeric attribute value for the specified node. Attributes are used to cluster the nodes; i.e. two nodes with similar attributes tend to be in the same cluster. Each attribute may have to be normalised in order for the chosen distance metric to make sense. Attributes must be specified unless a custom `distance: function( nodeP, nodeQ )` is specified.

  - distance

    The distance classifier used to compare attribute vectors. It is optional if attributes are specified. It may take on one of several values:

    - 'euclidean'

      [Euclidean distance](https://en.wikipedia.org/wiki/Euclidean_distance) (default)

    - 'squaredEuclidean'

      [Squared Euclidean distance](https://en.wikipedia.org/wiki/Euclidean_distance#Squared_Euclidean_distance)

    - 'manhattan'

      [Manhattan distance](https://en.wikipedia.org/wiki/Taxicab_geometry)

    - 'max'

      [Max distance](https://en.wikipedia.org/wiki/Uniform_norm)

    - function( length, getPAt, getQAt\[, nodeP, nodeQ\] )

      A custom function that returns the distance between attribute vectors `p` and `q`.

      - length

        The length of the vectors.

      - getPAt(i)

        A function that returns the ith value of the `p` vector.

      - getQAt(i)

        A function that returns the ith value of the `q` vector.

      - nodeP \[optional\]

        An optionally-used reference to the node associated with the `p` attribute vector. It is useful for affecting the weights with information outside of the attributes, such as connectivity.

      - nodeQ \[optional\]

        An optionally-used reference to the node associated with the `q` attribute vector. It is useful for affecting the weights with information outside of the attributes, such as connectivity.

    - function( nodeP, nodeQ )

      A custom function that returns the distance between `nodeP` and `nodeQ`. This allows for specifying the distance matrix directly, forgoing attributes.

  - linkage \[optional\]

    The [linkage criterion](https://en.wikipedia.org/wiki/Hierarchical_clustering#Linkage_criteria) for measuring the distance between two clusters; may be one of `'mean'`, `'min'` (a.k.a. `'single'`, default), `'max'` (a.k.a. `'complete'`).

  - mode

    The mode of the algorithm. For `'threshold'` (default), clusters are merged until they are at least the specified distance apart. For `'dendrogram'`, the clusters are recursively merged using the branches in a [dendrogram](https://en.wikipedia.org/wiki/Dendrogram) (tree) structure beyond a specified depth.

  - threshold

    In `mode: 'threshold'`, distance threshold for stopping the algorithm. All pairs of the returned clusters are at least `threshold` distance apart. Without specifying this value for `mode: 'threshold'`, all clusters will eventually be merged into a single cluster.

  - dendrogramDepth

    In `mode: 'dendrogram'`, the depth beyond which branches are merged in the tree. For example, a value of 0 (default) results in all branches being merged into a single cluster.

  - addDendrogram \[optional\]

    In `mode: 'dendrogram'`, whether to add nodes and edges to the graph for the dendrogram (default `false`). This is not necessary to run the algorithm, but it is useful for visualising the results.

### Details

Note that this function performs hierarchical clustering on only the subset of the graph in the calling collection. Hierarchical clustering does not normally take into account the topology of the graph.

This function returns an array, containing collections. Each collection in the array is a cluster found by the algorithm.

### Examples

    var clusters = cy.elements().hca({
      mode: 'threshold',
      threshold: 25,
      attributes: [
        function( node ){ return node.data('weight'); }
      ]
    });

nodes.affinityPropagation() [](#nodes.affinityPropagation)       Aliases: `nodes.ap()`,

Considering only the elements in the calling collection, calculate the [affinity propagation clustering](https://en.wikipedia.org/wiki/Affinity_propagation) of the nodes.

nodes.affinityPropagation( , options )

- options
  - attributes: \[ function( node ) ... \]

    An array of attribute functions, each of which returns a numeric attribute value for the specified node. Attributes are used to cluster the nodes; i.e. two nodes with similar attributes tend to be in the same cluster. Each attribute may have to be normalised in order for the chosen distance metric to make sense. Attributes must be specified unless a custom `distance: function( nodeP, nodeQ )` is specified.

  - distance

    The distance classifier used to compare attribute vectors. It is optional if attributes are specified. It may take on one of several values:

    - 'euclidean'

      [Euclidean distance](https://en.wikipedia.org/wiki/Euclidean_distance) (default)

    - 'squaredEuclidean'

      [Squared Euclidean distance](https://en.wikipedia.org/wiki/Euclidean_distance#Squared_Euclidean_distance)

    - 'manhattan'

      [Manhattan distance](https://en.wikipedia.org/wiki/Taxicab_geometry)

    - 'max'

      [Max distance](https://en.wikipedia.org/wiki/Uniform_norm)

    - function( length, getPAt, getQAt\[, nodeP, nodeQ\] )

      A custom function that returns the distance between attribute vectors `p` and `q`.

      - length

        The length of the vectors.

      - getPAt(i)

        A function that returns the ith value of the `p` vector.

      - getQAt(i)

        A function that returns the ith value of the `q` vector.

      - nodeP \[optional\]

        An optionally-used reference to the node associated with the `p` attribute vector. It is useful for affecting the weights with information outside of the attributes, such as connectivity.

      - nodeQ \[optional\]

        An optionally-used reference to the node associated with the `q` attribute vector. It is useful for affecting the weights with information outside of the attributes, such as connectivity.

    - function( nodeP, nodeQ )

      A custom function that returns the distance between `nodeP` and `nodeQ`. This allows for specifying the distance matrix directly, forgoing attributes.

  - preference \[optional\]

    The metric used to determine the suitability of a data point (i.e. node attribute vector) to serve as an exemplar. It may take on one of several special values, which are determined from the similarity matrix (i.e. the negative distance matrix). Or a manual, numeric value may be used (generally of the opposite sign of your distance values). The special values include:

    - 'median'

      Use the median value of the similarity matrix (default).

    - 'mean'

      Use the mean value of the similarity matrix.

    - 'min'

      Use the minimum value of the similarity matrix.

    - 'max'

      Use the maximum value of the similarity matrix.

  - damping \[optional\]

    A damping factor on \[0.5, 1) (default `0.8`).

  - minIterations \[optional\]

    The minimum number of iteraions the algorithm will run before stopping (default `100`).

  - maxIterations \[optional\]

    The maximum number of iteraions the algorithm will run before stopping (default `1000`).

### Details

Note that this function performs affinity propagation clustering on only the subset of the graph in the calling collection. Affinity propagation does not normally take into account the topology of the graph.

This function returns an array, containing collections. Each collection in the array is a cluster found by the algorithm.

### Examples

    var clusters = cy.elements().ap({
      attributes: [
        function( node ){ return node.data('weight'); }
      ]
    });

## Compound nodes [](#collection/compound-nodes)

These functions apply to [compound graphs](#notation/compound-nodes).

node.isParent() [](#node.isParent)  

Get whether the node is a compound parent (i.e. a node containing one or more child nodes)

node.isChildless() [](#node.isChildless)  

Get whether the node is childless (i.e. a node with no child nodes)

node.isChild() [](#node.isChild)  

Get whether the node is a compound child (i.e. contained within a node)

node.isOrphan() [](#node.isOrphan)  

Get whether the node is an orphan (i.e. a node with no parent)

nodes.parent() [](#nodes.parent)    

Get the compound parent node of each node in the collection.

nodes.parent( \[, selector\] )

- [selector](#selectors) \[optional\]

  A selector used to filter the resultant collection.

nodes.ancestors() [](#nodes.ancestors)       Aliases: `nodes.parents()`,

Get all compound ancestor nodes (i.e. parents, parents’ parents, etc.) of each node in the collection.

nodes.ancestors( \[, selector\] )

- [selector](#selectors) \[optional\]

  A selector used to filter the resultant collection.

nodes.commonAncestors() [](#nodes.commonAncestors)    

Get all compound ancestors common to all the nodes in the collection, starting with the closest and getting progressively farther.

nodes.commonAncestors( \[, selector\] )

- [selector](#selectors) \[optional\]

  A selector used to filter the resultant collection.

### Details

You can get the closest common ancestor via `nodes.commonAncestors().first()` and the farthest via `nodes.commonAncestors().last()`, because the common ancestors are in descending order of closeness.

nodes.orphans() [](#nodes.orphans)    

Get all orphan (i.e. has no compound parent) nodes in the calling collection.

nodes.orphans( \[, selector\] )

- [selector](#selectors) \[optional\]

  A selector used to filter the resultant collection.

nodes.nonorphans() [](#nodes.nonorphans)    

Get all nonorphan (i.e. has a compound parent) nodes in the calling collection.

nodes.nonorphans( \[, selector\] )

- [selector](#selectors) \[optional\]

  A selector used to filter the resultant collection.

nodes.children() [](#nodes.children)    

Get all compound child (i.e. direct descendant) nodes of each node in the collection.

nodes.children( \[, selector\] )

- [selector](#selectors) \[optional\]

  A selector used to filter the resultant collection.

nodes.descendants() [](#nodes.descendants)    

Get all compound descendant (i.e. children, children’s children, etc.) nodes of each node in the collection.

nodes.descendants( \[, selector\] )

- [selector](#selectors) \[optional\]

  A selector used to filter the resultant collection.

nodes.siblings() [](#nodes.siblings)    

Get all sibling (i.e. same compound parent) nodes of each node in the collection.

nodes.siblings( \[, selector\] )

- [selector](#selectors) \[optional\]

  A selector used to filter the resultant collection.

# Selectors [](#selectors)

## Notes & caveats [](#selectors/notes-amp-caveats)

A selector functions similar to a CSS selector on DOM elements, but selectors in Cytoscape.js instead work on collections of graph elements. Note that wherever a selector may be specified as the argument to a function, a [`eles.filter()`](#collection/building--filtering/eles.filter)-style filter function may be used in place of the selector. For example:

    cy.$('#j').neighborhood(function( ele ){
      return ele.isEdge();
    });

The selectors can be combined together to make powerful queries in Cytoscape.js, for example:

    // get all nodes with weight more than 50 and height strictly less than 180
    cy.elements("node[weight >= 50][height < 180]");

Selectors can be joined together (effectively creating a logical OR) with commas:

    // get node j and the edges coming out from it
    cy.elements('node#j, edge[source = "j"]');

It is important to note that strings need to be enclosed by quotation marks:

    //cy.filter('node[name = Jerry]'); // this doesn't work
    cy.filter('node[name = "Jerry"]'); // but this does

Note that some characters need to be escaped for IDs, field names, and so on:

    cy.filter('#some\\$funky\\@id');

Some examples of these characters include `( ^ $ \ / ( ) | ? + * [ ] { } , . )`. Try to avoid using non-alpha-numeric characters for field names and IDs to keep things simple. If you must use special characters for IDs, use a data selector rather than an ID selector:

    cy.filter('[id = "some$funky@id"]');

Selectors can access array elements and object properties with the dot-notation:

    // get node with first element of array labels = "Person"
    cy.elements('node[labels.0 = "Person"]'); // labels: ["Person"]
    // get node with nested object property first = "Jerry"
    cy.elements('node[name.first = "Jerry"]'); // { name: { first: "Jerry", last: "Foo" } }

## Group, class, & ID [](#selectors/group-class-amp-id)

**`node`, `edge`, or `*` (group selector)** Matches elements based on group (`node` for nodes, `edge` for edges, `*` for all).

**`.className`** Matches elements that have the specified class (e.g. use `.foo` for a class named “foo”).

**`#id`** Matches element with the matching ID (e.g. `#foo` is the same as `[id = 'foo']`)

## Data [](#selectors/data)

**`[name]`** Matches elements if they have the specified data attribute defined, i.e. not `undefined` (e.g. `[foo]` for an attribute named “foo”). Here, `null` is considered a defined value.

**`[^name]`** Matches elements if the specified data attribute is not defined, i.e. `undefined` (e.g `[^foo]`). Here, `null` is considered a defined value.

**`[?name]`** Matches elements if the specified data attribute is a [truthy](http://javascriptweblog.wordpress.com/2011/02/07/truth-equality-and-javascript/) value (e.g. `[?foo]`).

**`[!name]`** Matches elements if the specified data attribute is a [falsey](http://javascriptweblog.wordpress.com/2011/02/07/truth-equality-and-javascript/) value (e.g. `[!foo]`).

**`[name = value]`** Matches elements if their data attribute matches a specified value (e.g. `[foo = 'bar']` or `[num = 2]`).

**`[name != value]`** Matches elements if their data attribute doesn’t match a specified value (e.g. `[foo != 'bar']` or `[num != 2]`).

**`[name > value]`** Matches elements if their data attribute is greater than a specified value (e.g. `[foo > 'bar']` or `[num > 2]`).

**`[name >= value]`** Matches elements if their data attribute is greater than or equal to a specified value (e.g. `[foo >= 'bar']` or `[num >= 2]`).

**`[name < value]`** Matches elements if their data attribute is less than a specified value (e.g. `[foo < 'bar']` or `[num < 2]`).

**`[name <= value]`** Matches elements if their data attribute is less than or equal to a specified value (e.g. `[foo <= 'bar']` or `[num <= 2]`).

**`[name *= value]`** Matches elements if their data attribute contains the specified value as a substring (e.g. `[foo *= 'bar']`).

**`[name ^= value]`** Matches elements if their data attribute starts with the specified value (e.g. `[foo ^= 'bar']`).

**`[name $= value]`** Matches elements if their data attribute ends with the specified value (e.g. `[foo $= 'bar']`).

**`[name.0 = value]`** Matches elements if their data attribute is an array and the element at the defined index matches a specified value (e.g. `[foo.0 = 'bar']`).

**`[name.property = value]`** Matches elements if their data attribute is an object and the property with the defined name matches a specified value (e.g. `[foo.bar = 'baz']`).

**`@` (data attribute operator modifier)** Prepended to an operator so that it is case insensitive (e.g. `[foo @$= 'ar']`, `[foo @>= 'a']`, `[foo @= 'bar']`)

**`!` (data attribute operator modifier)** Prepended to an operator so that it is negated (e.g. `[foo !$= 'ar']`, `[foo !>= 'a']`)

**`[[]]` (metadata brackets)** Use double square brackets in place of square ones to match against metadata instead of data (e.g. `[[degree > 2]]` matches elements of degree greater than 2). The properties that are supported include `degree`, `indegree`, and `outdegree`.

## Compound nodes [](#selectors/compound-nodes)

**`>` (child selector)** Matches direct child nodes of the parent node (e.g. `node > node`).

**` ` (descendant selector)** Matches descendant nodes of the parent node (e.g. `node node`).

**`$` (subject selector)** Sets the subject of the selector (e.g. `$node > node` to select the parent nodes instead of the children).

## State [](#selectors/state)

**Animation**

- **`:animated`** : Matches elements that are currently being animated.
- **`:unanimated`** : Matches elements that are not currently being animated.

**Selection**

- **`:selected`** : Matches selected elements.
- **`:unselected`** : Matches elements that aren’t selected.
- **`:selectable`** : Matches elements that are selectable.
- **`:unselectable`** : Matches elements that aren’t selectable.

**Locking**

- **`:locked`** : Matches locked elements.
- **`:unlocked`** : Matches elements that aren’t locked.

**Style**

- **`:visible`** : Matches elements that are visible (i.e. `display: element` and `visibility: visible`).
- **`:hidden`** : Matches elements that are hidden (i.e. `display: none` or `visibility: hidden`).
- **`:transparent`** : Matches elements that are transparent (i.e. `opacity: 0` for self or parents).
- **`:backgrounding`** : Matches an element if its background image is currently loading.
- **`:nonbackgrounding`** : Matches an element if its background image not currently loading; i.e. there is no image or the image is already loaded).

**User interaction:**

- **`:grabbed`** : Matches elements that are being grabbed by the user.
- **`:free`** : Matches elements that are not currently being grabbed by the user.
- **`:grabbable`** : Matches elements that are grabbable by the user.
- **`:ungrabbable`** : Matches elements that are not grabbable by the user.
- **`:active`** : Matches elements that are active (i.e. user interaction, similar to `:active` in CSS).
- **`:inactive`** : Matches elements that are inactive (i.e. no user interaction).
- **`:touch`** : Matches elements when displayed in a touch-based enviroment (e.g. on a tablet).

**In or out of graph**

- **`:removed`** : Matches elements that have been removed from the graph.
- **`:inside`** : Matches elements that have are in the graph (they are not removed).

**Compound nodes**

- **`:parent`** : Matches parent nodes (they have one or more child nodes).
- **`:childless`** : Matches childless nodes (they have zero child nodes).
- **`:child`** or **`:nonorphan`**: Matches child nodes (they each have a parent).
- **`:orphan`** : Matches orphan nodes (they each have no parent).
- **`:compound`** : Matches parent nodes. Also matches edges connected to parent nodes (they each have at least one parent node among source and target).

**Edges**

- **`:loop`** : Matches loop edges (same source as target).
- **`:simple`** : Matches simple edges (i.e. as would be in a *simple* graph, different source as target).

# Style [](#style)

Style in Cytoscape.js follows CSS conventions as closely as possible. In most cases, a property has the same name and behaviour as its corresponding CSS namesake. However, the properties in CSS are not sufficient to specify the style of some parts of the graph. In that case, additional properties are introduced that are unique to Cytoscape.js.

For simplicity and ease of use, [specificity rules](http://www.w3.org/TR/css3-selectors/#specificity) are completely ignored in stylesheets. For a given style property for a given element, the last matching selector wins.

## Format [](#style/format)

The style specified at [initialisation](#core/initialisation) can be in a function format, in a plain JSON format, or in a string format — the plain JSON format and string formats being more useful if you want to pull down the style from the server.

### String format

Note that the trailing semicolons for each property, except for the last, are mandatory. Parsing will certainly fail without them.

An example style file:

    /* comments may be entered like this */
    node {
      background-color: green;
    }

At initialisation:

    cytoscape({
      container: document.getElementById('cy'),

      // ...

      style: 'node { background-color: green; }' // probably previously loaded via ajax rather than hardcoded

      // , ...
    });

### Plain JSON format

    cytoscape({
      container: document.getElementById('cy'),

      // ...

      style: [
        {
          selector: 'node',
          style: {
            'background-color': 'red'
          }
        }

        // , ...
      ]

      // , ...
    });

### Function format

    cytoscape({
      container: document.getElementById('cy'),

      // ...

      style: cytoscape.stylesheet()
        .selector('node')
          .style({
            'background-color': 'blue'
          })

          // ...


      // , ...
    });

You may alternatively use `css` in place of `style`, e.g. `.selector( ... ).css( ... )` or `{ selector: ..., css: ... }`.

### Function values

In the JSON or function stylesheet formats, it is possible to specify a function as the value for a style property. In this manner, the style value can be specified via a function on a per-element basis.

Using a function as a style property value may be convenient in certain cases. However, it may not be a performant option. Thus, it may be worthwhile to use caching if possible, such as by using the lodash [`_.memoize()`](https://lodash.com/docs#memoize) function.

Note that if using functions as style values, it will not be possible to serialise and deserialise your stylesheet to JSON proper.

The function should not read any other style values, nor should it mutate state for elements or for the graph. Generally, it should depend only on reading `ele.data()`, `ele.scratch()`, `cy.data()`, or `cy.scratch()`.

Example:

    cytoscape({
      container: document.getElementById('cy'),

      // ...

      style: cytoscape.stylesheet()
        .selector('node')
          .style({
            'background-color': function( ele ){ return ele.data('bg') }

            // which works the same as

            // 'background-color': 'data(bg)'
          })

          // ...


      // , ...
    });

## Property types [](#style/property-types)

- Colours may be specified by name (e.g. `red`), hex (e.g. `#ff0000` or `#f00`), RGB (e.g. `rgb(255, 0, 0)`), or HSL (e.g. `hsl(0, 100%, 50%)`).
- Values requiring a number, such as a length, can be specified in pixel values (e.g. `24px`), unitless values that are implicitly in pixels (e.g. `24`), or em values (e.g. `2em`). Sizes are specified in [model co-ordinates](#notation/position), so on-screen (rendered) sizes are as specified at zoom 1.
- Opacity values are specified as numbers ranging on `0 <= opacity <= 1` (e.g `0.5`).
- Time is measured in units of ms or s (e.g. `250ms`).
- Angles are measured in radians (e.g. `3.14rad`) or degrees (e.g. `180deg`), clockwise.
- Properties that specify a list of values may be formatted in one of the following formats:
  - A space-separated string (e.g. `'red rgb(0,255,0) blue'`)
    - Note that for lists of colours, this means that you can not use spaces within `rgb()` or `hsl()`.
    - This is the only format possible in string stylesheets (usually an external file).
  - A JS array (e.g. `['red', 'rgb(0, 255, 0)', 'blue']`)
    - This format may be used in the chained function stylesheets and in JSON stylesheets.

## Mappers [](#style/mappers)

In addition to specifying the value of a property outright, the developer may also use a mapper to dynamically specify the property value.

If a mapping is defined, either define the mapped data for all elements or use selectors to limit the mapping to elements that have the mapped data defined. For example, the selector `[foo]` will apply only to elements with the data field `foo` defined.

- **`data()`** specifies a direct mapping to an element’s data field. For example, `data(descr)` would map a property to the value in an element’s `descr` field in its data (i.e. `ele.data("descr")`). This is useful for mapping to properties like label text (the `label` property).
- **`mapData()`** specifies a linear mapping to an element’s data field. For example, `mapData(weight, 0, 100, blue, red)` maps an element’s weight to colours between blue and red for weights between 0 and 100. An element with `ele.data("weight") === 0` would be mapped to blue, for instance. Elements whose values fall outside of the specified range are mapped to the extremity values. In the previous example, an element with `ele.data("weight") === -1` would be mapped to blue.
- **`function( ele ){ ... }`** A function may be passed as the value of a style property. The function has a single `ele` argument which specifies the element for which the style property value is being calculated.
  - **Do** specify a valid value for the corresponding style property for all elements that its corresponding selector block applies.
  - **Do** use pure functions that depend on only
    - `ele.data()`,
    - `ele.scratch()`, or
    - basic state that could alternatively be represented with selectors (e.g. `ele.selected()` is OK because there’s a `:selected` selector).
  - **Do not** mutate the graph state for `cy` or for any `ele` inside your mapper function.
  - **Do not** create cyclic dependencies (i.e. one style property reads the value of another style property). Your style function should not call functions like `ele.style()` or `ele.numericStyle()`.
  - **Do not** use functions if you can use built-in mappers and selectors to express the same thing. If you use a function, you lose built-in style performance enhancements and you’ll have to optimise and cache the function yourself.

## Node body [](#style/node-body)

Shape:

- **`width`** : The width of the node’s body.
- **`height`** : The height of the node’s body.
- **`shape`** : The shape of the node’s body. Note that each shape fits within the specified `width` and `height`, and so you may have to adjust `width` and `height` if you desire an equilateral shape (i.e. `width !== height` for several equilateral shapes). Only `*rectangle` shapes are supported by compounds, because the dimensions of a compound are defined by the bounding box of the children. The following values are accepted:
  - `ellipse`
  - `triangle`
  - `round-triangle`
  - `rectangle`
  - `round-rectangle`
  - `bottom-round-rectangle`
  - `cut-rectangle`
  - `barrel`
  - `rhomboid`
  - `right-rhomboid`
  - `diamond`
  - `round-diamond`
  - `pentagon`
  - `round-pentagon`
  - `hexagon`
  - `round-hexagon`
  - `concave-hexagon`
  - `heptagon`
  - `round-heptagon`
  - `octagon`
  - `round-octagon`
  - `star`
  - `tag`
  - `round-tag`
  - `vee`
  - `polygon` (custom polygon specified via `shape-polygon-points`).
- **`shape-polygon-points`** : An array (or a space-separated string) of numbers ranging on \[-1, 1\], representing alternating x and y values (i.e. `x1 y1 x2 y2, x3 y3 ...`). This represents the points in the polygon for the node’s shape. The bounding box of the node is given by (-1, -1), (1, -1), (1, 1), (-1, 1). The node’s position is the origin (0, 0).
- **`corner-radius`** : The corner radius for `round-` shapes and the `cut-rectangle`, in px or em.
  - **WARNING** If you are using corner radius for a parent node (see [compound nodes](#notation/compound-nodes)), you can have children nodes going outside their parent, e.g. node **E** in [compound demo](demos/compound-nodes).
    - In order to fix this issue, you can play with the `padding` of the parent node. Having the same value for `padding` and `corner-radius` is always safe, e.g. node **B** in [compound demo](demos/compound-nodes).

Background:

- **`background-color`** : The colour of the node’s body.
- **`background-blacken`** : Blackens the node’s body for values from 0 to 1; whitens the node’s body for values from 0 to -1.
- **`background-opacity`** : The opacity level of the node’s background colour.
- **`background-fill`** : The filling style of the node’s body; may be `solid` (default), `linear-gradient`, or `radial-gradient`.

Gradient:

- **`background-gradient-stop-colors`** : The colours of the background gradient stops (e.g. `cyan magenta yellow`).
- **`background-gradient-stop-positions`** : The positions of the background gradient stops (e.g. `0% 50% 100%`). If not specified or invalid, the stops will divide equally.
- **`background-gradient-direction`** : For `background-fill: linear-gradient`, this property defines the direction of the background gradient. The following values are accepted:
  - `to-bottom` (default)
  - `to-top`
  - `to-left`
  - `to-right`
  - `to-bottom-right`
  - `to-bottom-left`
  - `to-top-right`
  - `to-top-left`

Border:

- **`border-width`** : The size of the node’s border.
- **`border-style`** : The style of the node’s border; may be `solid`, `dotted`, `dashed`, or `double`.
- **`border-cap`** : The cap style of the node’s border; may be `butt`, `round` or `square`.
- **`border-join`** : The join style of the node’s border; may be `miter`, `bevel` or `round`.
- **`border-dash-pattern`** : The `dashed` line pattern which specifies alternating lengths of lines and gaps. (e.g. `[6, 3]`).
- **`border-dash-offset`** : The `dashed` line offset (e.g. `24`). It is useful for creating edge animations.
- **`border-position`** : The position of the node’s border; may be `center`, `inside`, `outside`.
- **`border-color`** : The colour of the node’s border.
- **`border-opacity`** : The opacity of the node’s border.

Outline:

- **`outline-width`** : The size of the node’s outline.
- **`outline-style`** : The style of the node’s outline; may be `solid`, `dotted`, `dashed`, or `double`.
- **`outline-color`** : The colour of the node’s outline.
- **`outline-opacity`** : The opacity of the node’s outline.
- **`outline-offset`** : The offset of the node’s outline.

Padding:

A padding defines an addition to a node’s dimension. For example, `padding` adds to a node’s outer (i.e. total) width and height. This can be used to add spacing between a compound node parent and its children.

- **`padding`** : The amount of padding around all sides of the node. Either percentage or pixel value can be specified. For example, both `50%` and `50px` are acceptable values. By default, percentage padding is calculated as a percentage of node width.
- **`padding-relative-to`** : Determines how padding is calculated if and only if the percentage unit is used. Accepts one of the keywords specified below.
  - **`width`** : calculate padding as a percentage the node width.
  - **`height`** : calculate padding as a percentage of the node height.
  - **`average`** : calculate padding as a percentage of the average of the node width and height.
  - **`min`** : calculate padding as a percentage of the minimum of the node width and height.
  - **`max`** : calculate padding as a percentage of the maximum of the node width and height.

Compound parent sizing:

- **`compound-sizing-wrt-labels`** : Whether to include labels of descendants in sizing a compound node; may be `include` or `exclude`.
- **`min-width`** : Specifies the minimum (inner) width of the node’s body for a compound parent node (e.g. `400px`). If the biases for `min-width` do not add up to 100%, then the biases are normalised to a total of 100%.
- **`min-width-bias-left`** : When a compound node is enlarged by its `min-width`, this value specifies the percent of the extra width put on the left side of the node (e.g. `50%`).
- **`min-width-bias-right`** : When a compound node is enlarged by its `min-width`, this value specifies the percent of the extra width put on the right side of the node (e.g. `50%`).
- **`min-height`** : Specifies the minimum (inner) height of the node’s body for a compound parent node (e.g. `400px`). If the biases for `min-height` do not add up to 100%, then the biases are normalised to a total of 100%.
- **`min-height-bias-top`** : When a compound node is enlarged by its `min-height`, this value specifies the percent of the extra width put on the top side of the node (e.g. `50%`).
- **`min-height-bias-bottom`** : When a compound node is enlarged by its `min-height`, this value specifies the percent of the extra width put on the bottom side of the node (e.g. `50%`).

## Background image [](#style/background-image)

A background image may be applied to a node’s body. The following properties support multiple values (space separated or array) with associated indices.

- **`background-image`** : The URL that points to the image that should be used as the node’s background. PNG, JPG, and SVG are supported formats.
  - You may use a [data URI](https://en.wikipedia.org/wiki/Data_URI_scheme) to use embedded images, thereby saving a HTTP request.

  - You can specify multiple background images by separating each image with a space (space delimited format), but if using a non-string stylesheet, then using arrays are preferred.
    - The images will be applied to the node’s body in the order given, layering one on top of each other.
    - When specifying properties for multiple images, if the property for a given image is not provided, then the default value is used as fallback.

  - To put an image outside of the bounds of a node’s body, it is necessary to specify `background-clip: none` and `bounds-expansion: n` for images that go `n` pixels beyond the bounding box of the node. Note that values of `n` should be relatively small for performance.

  - To control the drawing order of background images (e.g overlay background images over borders), it is necessary to specify `background-image-containment: over` (default `inside`).

  - SVG image considerations:

    - Always include this XML header in each SVG image:


        <?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg>

    - Use [encodeURIComponent](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent) on SVG data URIs.


        var data = 'data:image/svg+xml;utf8,' + encodeURIComponent(svgFile);

    - Do not use base 64 encoding for SVG within a data URI.

    - Web fonts (e.g. WOFF, WOFF2) may not work within SVG `<text>` elements in some browsers. For best cross-browser compatibility, use native SVG versions of your icons — usually defined as `<path>` elements.

    - If you memoize function mappers to generate SVGs procedurally, you may want to have your function return an object like `{ svg, width, height }`. This allows you to use the dimensions of the image for other style properties, like node width and height. E.g.:

          var makeSvg = memoize(function(ele){
              // impl...

              return { svg: s, width: w, height: h };
          });
          //
          // ...
          //
          // init stylesheet
          var options = {
              style: [
                {
                  selector: 'node',
                  style: {
                    'background-image': function(ele){ return makeSvg(ele).svg; },
                    'width': function(ele){ return makeSvg(ele).width; },
                    'height': function(ele){ return makeSvg(ele).height; }
                  }
                }
              ]
          };

    - Using the `viewbox` attribute in SVG images may cause rendering problems in Firefox.

    - SVG images may not work consistently in Internet Explorer.

    - The [`cytoscape-sbgn-stylesheet`](https://github.com/PathwayCommons/cytoscape-sbgn-stylesheet) package serves as a good example for the use of SVG images in a stylesheet. That stylesheet [creates decorations](https://pathwaycommons.github.io/cytoscape-sbgn-stylesheet/) on nodes in line with the [SBGN standard](https://sbgn.github.io).
- **`background-image-crossorigin`**: All images are loaded with a [`crossorigin`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attr-crossorigin) attribute which may be `anonymous` or `use-credentials` or `null`. These values should be passed as a string (enclosed withing single or double quotes). The default is set to `anonymous`.
- **`background-image-opacity`** : The opacity of the background image.
- **`background-image-smoothing`** : Determines whether background image is smoothed (`yes`, default) or not (`no`). This is only a hint, and the browser may or may not respect the value set for this property.
- **`background-image-containment`** : Determines whether background image is within (`inside`, default) or over top of the node(`over`).
- **`background-width`** : Specifies the width of the image. A percent value (e.g. `50%`) may be used to set the image width relative to the node width. If used in combination with `background-fit`, then this value overrides the width of the image in calculating the fitting — thereby overriding the aspect ratio. The `auto` value is used by default, which uses the width of the image.
- **`background-height`** : Specifies the height of the image. A percent value (e.g. `50%`) may be used to set the image height relative to the node height. If used in combination with `background-fit`, then this value overrides the height of the image in calculating the fitting — thereby overriding the aspect ratio. The `auto` value is used by default, which uses the height of the image.
- **`background-fit`** : How the background image is fit to the node; may be `none` for original size, `contain` to fit inside node, or `cover` to cover the node.
- **`background-repeat`** : Whether to repeat the background image; may be `no-repeat`, `repeat-x`, `repeat-y`, or `repeat`.
- **`background-position-x`** : The x position of the background image, measured in percent (e.g. `50%`) or pixels (e.g. `10px`).
- **`background-position-y`** : The y position of the background image, measured in percent (e.g. `50%`) or pixels (e.g. `10px`).
- **`background-offset-x`** : The x offset of the background image, measured in percent (e.g. `50%`) or pixels (e.g. `10px`).
- **`background-offset-y`** : The y offset of the background image, measured in percent (e.g. `50%`) or pixels (e.g. `10px`).
- **`background-width-relative-to`** : Changes whether the width is calculated relative to the width of the node or the width in addition to the padding; may be `inner` or `include-padding`. If not specified, `include-padding` is used by default.
- **`background-height-relative-to`** : Changes whether the height is calculated relative to the height of the node or the height in addition to the padding; may be `inner` or `include-padding`. If not specified, `include-padding` is used by default.
- **`background-clip`** : How background image clipping is handled; may be `node` for clipped to node shape or `none` for no clipping.

The following properties apply to all images of a node:

- **`bounds-expansion`** : Specifies a padding size (e.g. `20px`) that expands the bounding box of the node in all directions. This allows for images to be drawn outside of the normal bounding box of the node when `background-clip` is `none`. This is useful for small decorations just outside of the node. `bounds-expansions` accepts 1 value (for all directions), 2 values, (`[topAndBottom, leftAndRight]`) or 4 values (`[top, right, bottom, left]`).

The following is an example of valid background image styling using JSON. The example images are taken from Wikimedia Commons with the Creative Commons license.

    {
      'background-image': [
        'https://upload.wikimedia.org/wikipedia/commons/b/b4/High_above_the_Cloud_the_Sun_Stays_the_Same.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Pigeon_silhouette_4874.svg/1000px-Pigeon_silhouette_4874.svg.png'
      ],
      'background-fit': 'cover cover',
      'background-image-opacity': 0.5
    }

## Pie chart background [](#style/pie-chart-background)

These properties allow you to create pie chart (or ring chart) backgrounds on nodes ([demo](demos/pie-style)). Note that 16 slices maximum are supported per node, so in the properties `1 <= i <= 16`. Of course, you must specify a numerical value for each property in place of `i`. Each nonzero sized slice is placed in order of `i`, starting from the 12 o’clock position and working clockwise. The start angle may be shifted from the 12 o’clock position, if needed.

You may find it useful to reserve a number to a particular colour for all nodes in your stylesheet. Then you can specify values for `pie-i-background-size` accordingly for each node via a [mapper](#style/mappers). This would allow you to create consistently coloured pie charts in each node of the graph based on element data.

- **`pie-size`** : The diameter of the pie, measured as a percent of node size (e.g. `100%`) or an absolute length (e.g. `25px`).
- **`pie-start-angle`** : The start angle of the pie, measured as an angle starting at the 12 o’clock position and going clockwise (e.g. `90deg` is 3 o’clock). The default is to start at 12 o’clock (`0deg`, `0rad`).
- **`pie-hole`** : The diameter of the hole in the centre of the pie, measured as a percent of node size (e.g. `100%`) or an absolute length (e.g. `25px`). This effectively converts the pie chart into a ring chart (default disabled, `0`).
- **`pie-i-background-color`** : The colour of the node’s ith pie chart slice.
- **`pie-i-background-size`** : The size of the node’s ith pie chart slice, measured in percent (e.g. `25%`).
- **`pie-i-background-opacity`** : The opacity of the node’s ith pie chart slice.

## Stripe chart background [](#style/stripe-chart-background)

These properties allow you to create stripe chart backgrounds on nodes ([demo](demos/stripe-style)). Note that 16 stripes maximum are supported per node, so in the properties `1 <= i <= 16`. Of course, you must specify a numerical value for each property in place of `i`. Each nonzero sized stripe is placed in order of `i`, starting from the left and going rightwards for vertical stripes (`stripe-direction: vertical`) or starting from the top and going downwards for horizontal stripes (`stripe-direction: horizontal`).

You may find it useful to reserve a number to a particular colour for all nodes in your stylesheet. Then you can specify values for `stripe-i-background-size` accordingly for each node via a [mapper](#style/mappers). This would allow you to create consistently coloured pie charts in each node of the graph based on element data.

- **`stripe-size`** : The diameter of the stripes, measured as a percent of node size (e.g. `100%`) or an absolute length (e.g. `25px`).
- **`stripe-direction`** : The direction of the stripes, either `vertical` stripes or `horizontal` stripes. Vertical stripes are stacked from left to right, and horizontal stripes are stacked from top to bottom.
- **`stripe-i-background-color`** : The colour of the node’s ith stripe.
- **`stripe-i-background-size`** : The size of the node’s ith stripe, measured in percent (e.g. `25%`).
- **`stripe-i-background-opacity`** : The opacity of the node’s ith stripe.

## Edge line [](#style/edge-line)

These properties affect the styling of an edge’s line:

- **`width`** : The width of an edge’s line.
- **`curve-style`** : The curving method used to separate two or more edges between two nodes ([demo](demos/edge-types)); may be [`haystack`](#style/haystack-edges) (default, very fast, bundled straight edges for which loops and compounds are unsupported), [`straight`](#style/straight-edges) (straight edges with all arrows supported), [`straight-triangle`](#style/straight-triangle-edges) (straight triangle edges), [`bezier`](#style/bezier-edges) (bundled curved edges), [`unbundled-bezier`](#style/unbundled-bezier-edges) (curved edges for use with manual control points), [`segments`](#style/segments-edges) (a series of straight lines), [`round-segments`](#style/round-segments-edges) (a series of straight lines with rounded corners), [`taxi`](#style/taxi-edges) (right-angled lines, hierarchically bundled), [`round-taxi`](#style/round-taxi-edges) (right-angled lines, hierarchically bundled, with rounded corners). Note that `haystack` edges work best with `ellipse`, `rectangle`, or similar nodes. Smaller node shapes, like `triangle`, will not be as aesthetically pleasing. Also note that edge endpoint arrows are unsupported for `haystack` edges.
- **`line-color`** : The colour of the edge’s line.
- **`line-style`** : The style of the edge’s line; may be `solid`, `dotted`, or `dashed`.
- **`line-cap`** : The cap style of the edge’s line; may be `butt` (default), `round`, or `square`. The cap may or may not be visible, depending on the shape of the node and the relative size of the node and edge. Caps other than `butt` extend beyond the specified endpoint of the edge.
- **`line-outline-width`** : The width of the edge’s outline.
- **`line-outline-color`** : The colour of the edge’s outline.
- **`line-opacity`** : The opacity of the edge’s line, outline and arrow. Useful if you wish to have a separate opacity for the edge label versus the edge line. Note that the opacity value of the edge element affects the effective opacity of its line and label subcomponents.
- **`line-fill`** : The filling style of the edge’s line; may be `solid` (default), `linear-gradient` (source to target), or `radial-gradient` (midpoint outwards).
- **`line-dash-pattern`** : The `dashed` line pattern which specifies alternating lengths of lines and gaps. (e.g. `[6, 3]`).
- **`line-dash-offset`** : The `dashed` line offset (e.g. `24`). It is useful for creating edge animations.
- **`box-selection`** : Determines whether events should be triggered on an edge during box selection:
  - `contain` (default): the entire edge must be fully inside the selection box to trigger the event.
  - `overlap`: either endpoint (source or target node) or any part of the edge’s line or curve overlaps the selection box.
  - `none`: the edge is excluded from box selection and events are not triggered.

## Gradient [](#style/gradient)

- **`line-gradient-stop-colors`** : The colours of the gradient stops (e.g. `cyan magenta yellow`).
- **`line-gradient-stop-positions`** : The positions of the gradient stops (e.g. `0% 50% 100%`). If not specified (or invalid), the stops will divide equally.

## Bezier edges [](#style/bezier-edges)

For automatic, bundled bezier edges (`curve-style: bezier`, [demo](demos/edge-types)):

A bezier edge is bundled with all other parallel bezier edges. Each bezier edge is a [quadratic bezier curve](https://en.wikipedia.org/wiki/B%C3%A9zier_curve#Quadratic_B%C3%A9zier_curves), separated from the others by varying the curvature. If there is an odd number of parallel edges in a bundle, then the centre edge is drawn as a straight line.

- **`control-point-step-size`** : Along the line perpendicular from source to target, this value specifies the distance between successive bezier edges.
- **`control-point-distance`** : A single value that overrides `control-point-step-size` with a manual value. Because it overrides the step size, bezier edges with the same value will overlap. Thus, it’s best to use this as a one-off value for particular edges if need be.
- **`control-point-weight`** : A single value that weights control points along the line from source to target. The value usually ranges on \[0, 1\], with 0 towards the source node and 1 towards the target node — but larger or smaller values can also be used.
- **`edge-distances`** :
  - With value `intersection` (default), the line from source to target for `segment-weights` is from the outside of the source node’s shape to the outside of the target node’s shape.
  - With value `node-position`, the line is from the source position to the target position.
  - The `node-position` option makes calculating edge points easier — but it should be used carefully because you can create invalid points that `intersection` would have automatically corrected.
  - With value `endpoints`, the line is from the manually-specified source endpoint (via `source-endpoint`) to the manually-specified target endpoint (via `target-endpoint`).
    - A manual endpoint may be specified with a position, e.g. `source-endpoint: 20 10`.
    - A manual endpoint may be alternatively specified with an angle, e.g. `target-endpoint: 90deg`.

## Loop edges [](#style/loop-edges)

For loops (i.e. same source and target, [demo](demos/edge-types)):

A loop is normally drawn as a pair of [quadratic bezier curves](https://en.wikipedia.org/wiki/B%C3%A9zier_curve#Quadratic_B%C3%A9zier_curves), one bezier going away from the node and the second bezier going back towards the node.

- **`loop-direction`** : Determines the angle that loops extend from the node in cases when the source and target node of an edge is the same. The angle is specified from the 12 o’clock position and it progresses clockwise for increasing positive values. The default is `-45deg` (extending to the upper left).
- **`loop-sweep`** : Determines the angle between the leaving and returning edges in loops. Positive values result in clockwise looping and negative values result in counter-clockwise looping. Default is `-90deg`.

Note that loops may only be `bezier` or `unbundled-bezier` for their `curve-style`.

## Unbundled bezier edges [](#style/unbundled-bezier-edges)

For bezier edges with manual control points (`curve-style: unbundled-bezier`, [demo](demos/edge-types)):

An unbundled bezier edge is made of a series of one or more [quadratic bezier curves](https://en.wikipedia.org/wiki/B%C3%A9zier_curve#Quadratic_B%C3%A9zier_curves) — one control point per curve. The control points of unbundled bezier curves are specified manually, using a co-ordinate system relative to the source and target node. This maintains the overall curve shape regardless of the positions of the connected nodes.

A quadratic bezier curve is specified by three points. Those points include the start point (P0), the centre control point (P1), and the end point (P2). Traditionally, all three points are called “control points”, but only the centre control point (P1) is referred to as the “control point” within this documentation for brevity and clarity.

The start point (P0) for the first quadratic bezier curve in the series is specified by `source-endpoint`. The end point (P2) for the last quadratic bezier curve in the series is specified by `target-endpoint`.

When two or more control points are specified for an unbundled bezier edge, each adjacent pair of bezier curves is joined at the midpoint of the two control points. In other words, the start point (P0) and end point (P2) for a quadratic bezier curve in the middle of the series are set implicitly. This makes most curves join smoothly.

- **`control-point-distances`** : A series of values that specify for each control point the distance perpendicular to a line formed from source to target, e.g. `-20 20 -20`.
- **`control-point-weights`** : A series of values that weights control points along a line from source to target, e.g. `0.25 0.5 0.75`. A value usually ranges on \[0, 1\], with 0 towards the source node and 1 towards the target node — but larger or smaller values can also be used.
- **`edge-distances`** :
  - With value `intersection` (default), the line from source to target for `segment-weights` is from the outside of the source node’s shape to the outside of the target node’s shape.
  - With value `node-position`, the line is from the source position to the target position.
  - The `node-position` option makes calculating edge points easier — but it should be used carefully because you can create invalid points that `intersection` would have automatically corrected.
  - With value `endpoints`, the line is from the manually-specified source endpoint (via `source-endpoint`) to the manually-specified target endpoint (via `target-endpoint`).
    - A manual endpoint may be specified with a position, e.g. `source-endpoint: 20 10`.
    - A manual endpoint may be alternatively specified with an angle, e.g. `target-endpoint: 90deg`.

## Haystack edges [](#style/haystack-edges)

For fast, straight line edges (`curve-style: haystack`, [demo](demos/edge-types)):

Haystack edges are a more performant replacement for plain, straight line edges. A haystack edge is drawn as a straight line from the source node to the target node, randomly placed along some angle from each node’s centre. In this manner, many parallel haystack edges make a tight bundle, especially when semitransparent. This makes haystack edges an effective way to visualise graphs with a high number of parallel edges.

Loop edges and compound parent nodes are not supported by haystack edges. Also note that source and target arrows are not supported for haystack edges, as the arrows would be behind the node body. Mid arrows, however, are supported.

- **`haystack-radius`** : A value between 0 and 1 inclusive that indicates the relative radius used to position haystack edges on their connected nodes. The outside of the node is at 1, and the centre of the node is at 0. For simple graphs, a radius of 0 makes sense.

## Segments edges [](#style/segments-edges)

For edges made of several straight lines (`curve-style: segments`, [demo](demos/edge-types)):

A segment edge is made of a series of one or more straight lines, using a co-ordinate system relative to the source and target nodes. This maintains the overall line pattern regardless of the orientation of the positions of the source and target nodes.

- **`segment-distances`** : A series of values that specify for each segment point the distance perpendicular to a line formed from source to target, e.g. `-20 20 -20`.
- **`segment-weights`** : A series of values that weights segment points along a line from source to target, e.g. `0.25 0.5 0.75`. A value usually ranges on \[0, 1\], with 0 towards the source node and 1 towards the target node — but larger or smaller values can also be used.
- **`edge-distances`** :
  - With value `intersection` (default), the line from source to target for `segment-weights` is from the outside of the source node’s shape to the outside of the target node’s shape.
  - With value `node-position`, the line is from the source position to the target position.
  - The `node-position` option makes calculating edge points easier — but it should be used carefully because you can create invalid points that `intersection` would have automatically corrected.
  - With value `endpoints`, the line is from the manually-specified source endpoint (via `source-endpoint`) to the manually-specified target endpoint (via `target-endpoint`).
    - A manual endpoint may be specified with a position, e.g. `source-endpoint: 20 10`.
    - A manual endpoint may be alternatively specified with an angle, e.g. `target-endpoint: 90deg`.

## Round segments edges [](#style/round-segments-edges)

For rounded edges made of several straight lines (`curve-style: round-segments`, [demo](demos/edge-types)):

A round segment edge type is made of a series of one or more straight lines, joined together by a round corner, using a co-ordinate system relative to the source and target nodes. This maintains the overall line pattern regardless of the orientation of the positions of the source and target nodes.

- **`segment-distances`** : A series of values that specify for each segment point the distance perpendicular to a line formed from source to target, e.g. `-20 20 -20`.
- **`segment-weights`** : A series of values that weights segment points along a line from source to target, e.g. `0.25 0.5 0.75`. A value usually ranges on \[0, 1\], with 0 towards the source node and 1 towards the target node — but larger or smaller values can also be used.
- **`segment-radii`** : A series of values that provide the radii of the different points positioned by `segment-distances` and `segment-weights`, e.g. `15 0 5`. If less radii are provided tha points have been defined, the last provided radius will be used for all the missing radius. If a single radius is provided, it will therefore be applied to all the segment’s points.
- **`radius-type`** : Defines where `segment-radii` are applied (see [demo](demos/radius-types)), which is particularly relevant when the corner angle is acute. You can provide multiple values to define the radius type for each provided radius. Values can be:
  - `arc-radius`: **Default strategy**: The `radius` property is applied to the corner arc, which will be placed further away from the control point if the arc doesn’t fit in an acute angle.
  - `influence-radius`: The radius property is applied to the control point sphere of influence. The arcs for a given control point will all start and end at `radius` distance from the `control-points`.
- **`edge-distances`** :
  - With value `intersection` (default), the line from source to target for `segment-weights` is from the outside of the source node’s shape to the outside of the target node’s shape.
  - With value `node-position`, the line is from the source position to the target position.
  - The `node-position` option makes calculating edge points easier — but it should be used carefully because you can create invalid points that `intersection` would have automatically corrected.
  - With value `endpoints`, the line is from the manually-specified source endpoint (via `source-endpoint`) to the manually-specified target endpoint (via `target-endpoint`).
    - A manual endpoint may be specified with a position, e.g. `source-endpoint: 20 10`.
    - A manual endpoint may be alternatively specified with an angle, e.g. `target-endpoint: 90deg`.

## Straight edges [](#style/straight-edges)

For straight line edges (`curve-style: straight`, [demo](demos/edge-types)):

A straight edge (`curve-style: straight`) is drawn as a single straight line from the outside of the source node shape to the outside of the target node shape. Endpoint and midpoint arrows are supported on straight edges. Straight edges are not generally suitable for multigraphs.

## Straight triangle edges [](#style/straight-triangle-edges)

For straight triangle edges (`curve-style: straight-triangle`, [demo](demos/edge-types)):

A straight triangle edge (`curve-style: straight-triangle`) is drawn as a single straight isosceles triangle in the direction from the source to the target, with a triangle base at the source and a triangle apex (a point) at the target.

The `width` property defines width of the triangle base. The `line-style`, `line-cap`, `line-dash-pattern`, and `line-dash-offset` properties are not supported.

## Taxi edges [](#style/taxi-edges)

For hierarchical, bundled edges (`curve-style: taxi`, [demo](demos/edge-types)):

A taxi edge (`curve-style: taxi`) is drawn as a series of right-angled lines (i.e. in [taxicab geometry](https://en.wikipedia.org/wiki/Taxicab_geometry)). The edge has a primary direction along either the x-axis or y-axis, which can be used to bundle edges in a hierarchy. That is, taxi edges are appropriate for trees and DAGs that are laid out in a hierarchical manner.

A taxi edge has at most two visible turns: Starting from the source node, the edge goes in the primary direction for the specified distance. The edge then turns, going towards the target along the secondary axis. The first turn can be specified in order to bundle the edges of outgoing nodes. The second turn is implicit, based on the first turn, going the remaining distance along the main axis.

When a taxi edge would be impossible to draw along the regular turning plan — i.e. one or more turns is too close the source or target — it is re-routed. The re-routing is carried out on a best-effort basis: Re-routing prioritises the specified direction for bundling over the specified turn distance. A `downward` edge, for example, will avoid going in the upward direction where possible. In practice, re-routing should not take place for graphs that are well laid out.

Only `outside-to-node` endpoints are supported for a taxi edge, i.e. `source-endpoint: outside-to-node` and `target-endpoint: outside-to-node`.

- **`taxi-direction`** : The main direction of the edge, the direction starting out from the source node; may be one of:
  - `auto` : Automatically use `vertical` or `horizontal`, based on whether the vertical or horizontal distance is largest.
  - `vertical` : Automatically use `downward` or `upward`, based on the vertical direction from source to target.
  - `downward` : Bundle outgoers downwards.
  - `upward` : Bundle outgoers upwards.
  - `horizontal` : Automatically use `righward` or `leftward`, based on the horizontal direction from source to target.
  - `rightward` : Bundle outgoers righwards.
  - `leftward` : Bundle outgoers leftwards.
- **`taxi-turn`** : The distance along the primary axis where the first turn is applied.
  - This value may be an absolute distance (e.g. `20px`) or it may be a relative distance between the source and target (e.g. `50%`).
  - A negative value may be specified to indicate a distance in the oppostite, target to source direction (e.g. `-20px`).
  - Note that bundling may not work with an explicit direction (`upward`, `downward`, `leftward`, or `rightward`) in tandem with a turn distance specified in percent units.
- **`taxi-turn-min-distance`** : The minimum distance along the primary axis that is maintained between the nodes and the turns.
  - This value only takes on absolute values (e.g. `5px`).
  - This property makes the taxi edge be re-routed when the turns would be otherwise too close to the source or target. As such, it also helps to avoid turns overlapping edge endpoint arrows.
- **`edge-distances`** : With value `intersection` (default), the distances (`taxi-turn` and `taxi-turn-min-distance`) are considered from the outside of the source’s bounds to the outside of the target’s bounds. With value `node-position`, the distances are considered from the source position to the target position. The `node-position` option makes calculating edge points easier — but it should be used carefully because you can create invalid points that `intersection` would have automatically corrected.

## Round taxi edges [](#style/round-taxi-edges)

Apply the round style to Taxi edges (`curve-style: round-taxi`, [demo](demos/edge-types)):

For hierarchical, bundled edges (`curve-style: taxi`, [demo](demos/edge-types)):

A round taxi edge (`curve-style: round-taxi`) is drawn as a series of right-angled lines, with rounded corners (i.e. in [taxicab geometry](https://en.wikipedia.org/wiki/Taxicab_geometry)). The edge has a primary direction along either the x-axis or y-axis, which can be used to bundle edges in a hierarchy. That is, taxi edges are appropriate for trees and DAGs that are laid out in a hierarchical manner.

A round taxi edge has at most two visible turns: Starting from the source node, the edge goes in the primary direction for the specified distance. The edge then turns, going towards the target along the secondary axis. The first turn can be specified in order to bundle the edges of outgoing nodes. The second turn is implicit, based on the first turn, going the remaining distance along the main axis.

When a taxi edge would be impossible to draw along the regular turning plan — i.e. one or more turns is too close the source or target — it is re-routed. The re-routing is carried out on a best-effort basis: Re-routing prioritises the specified direction for bundling over the specified turn distance. A `downward` edge, for example, will avoid going in the upward direction where possible. In practice, re-routing should not take place for graphs that are well laid out.

Only `outside-to-node` endpoints are supported for a taxi edge, i.e. `source-endpoint: outside-to-node` and `target-endpoint: outside-to-node`.

- **`taxi-direction`** : The main direction of the edge, the direction starting out from the source node; may be one of:
  - `auto` : Automatically use `vertical` or `horizontal`, based on whether the vertical or horizontal distance is largest.
  - `vertical` : Automatically use `downward` or `upward`, based on the vertical direction from source to target.
  - `downward` : Bundle outgoers downwards.
  - `upward` : Bundle outgoers upwards.
  - `horizontal` : Automatically use `righward` or `leftward`, based on the horizontal direction from source to target.
  - `rightward` : Bundle outgoers righwards.
  - `leftward` : Bundle outgoers leftwards.
- **`taxi-radius`** : The radius of the rounded corners of the edge.
- **`radius-type`** : Defines where `taxi-radius` is applied (see [demo](demos/radius-types)), which is particularly relevant when the corner angle is acute. Values can be:
  - `arc-radius`: **Default strategy**: The `radius` property is applied to the corner arc, which will be placed further away from the control point if the arc doesn’t fit in an acute angle.
  - `influence-radius`: The radius property is applied to the control point sphere of influence. The arcs for a given control point will all start and end at `radius` distance from the `control-points`.
- **`taxi-turn`** : The distance along the primary axis where the first turn is applied.
  - This value may be an absolute distance (e.g. `20px`) or it may be a relative distance between the source and target (e.g. `50%`).
  - A negative value may be specified to indicate a distance in the oppostite, target to source direction (e.g. `-20px`).
  - Note that bundling may not work with an explicit direction (`upward`, `downward`, `leftward`, or `rightward`) in tandem with a turn distance specified in percent units.
- **`taxi-turn-min-distance`** : The minimum distance along the primary axis that is maintained between the nodes and the turns.
  - This value only takes on absolute values (e.g. `5px`).
  - This property makes the taxi edge be re-routed when the turns would be otherwise too close to the source or target. As such, it also helps to avoid turns overlapping edge endpoint arrows.
- **`edge-distances`** : With value `intersection` (default), the distances (`taxi-turn` and `taxi-turn-min-distance`) are considered from the outside of the source’s bounds to the outside of the target’s bounds. With value `node-position`, the distances are considered from the source position to the target position. The `node-position` option makes calculating edge points easier — but it should be used carefully because you can create invalid points that `intersection` would have automatically corrected.

## Edge arrow [](#style/edge-arrow)

- **`<pos>-arrow-color`** : The colour of the edge’s source arrow.
- **`<pos>-arrow-shape`** : The shape of the edge’s source arrow ([demo](demos/edge-arrows)); may be one of:
  - `triangle`
  - `triangle-tee`
  - `circle-triangle`
  - `triangle-cross`
  - `triangle-backcurve`
  - `vee`
  - `tee`
  - `square`
  - `circle`
  - `diamond`
  - `chevron`
  - `none`
- **`<pos>-arrow-fill`** : The fill state of the edge’s source arrow; may be `filled` or `hollow`.
- **`<pos>-arrow-width`** : The width of the edge’s source arrow shape; may be `match-line`, a number (pixel), or a string with units (`px` \| `%` \| `em`). The `%` unit is based on the edge `width`.
- **`arrow-scale`** : Scaling for the arrow size; may be any number \>= 0.

For each edge arrow property above, replace `<pos>` with one of

- `source` : Pointing towards the source node, at the end of the edge.
- `mid-source` : Pointing towards the source node, at the middle of the edge.
- `target` : Pointing towards the target node, at the end of the edge.
- `mid-target`: Pointing towards the target node, at the middle of the edge.

Only mid arrows are supported on haystack edges.

## Edge endpoints [](#style/edge-endpoints)

`source-endpoint` & `target-endpoint` : Specifies the endpoint of the source side of the edge and the target side of the edge, respectively. There are several options for how those properties can be set:

- A special, named value may be used.
  - `outside-to-node` (default) indicates that the edge should be placed automatically to point towards the node’s position and be placed on the outside of the node’s shape.
  - `outside-to-node-or-label` uses the same rules as `outside-to-node` with the added rule that if the node’s label would intersect the edge before the node’s body, then the edge points to that intersection point. This avoids overlap of edges with node labels.
  - `inside-to-node` indicates the edge should go all the way inside the node and point directly on the node’s position. This is the same as specifying `0 0`.
  - `outside-to-line` indicates the edge endpoint should be placed outside the node’s shape where it would intersect the imaginary line from the source position to the target position. This value is useful for automatically avoiding invalid cases for bezier edges, especially with compound nodes.
  - `outside-to-line-or-label` uses the same rules as `outside-to-line` with the added rule that if the node’s label would intersect the imaginary line before the node’s body, then the edge points to that intersection point. This avoids overlap of edges with node labels.
- Two numbers may specify the endpoint. The numbers indicate a position relative to the node’s position. The numbers can be specified as percent values (e.g. `50%`, which are relative to the node’s width and height respectively) or as absolute distances (e.g. `100px` or `2em`).
- A single angle value (e.g. `90deg` or `1.57rad`) may specify that the endpoint should be placed on the node’s border at the specified angle. The angle starts at 12 o’clock and progresses clockwise.

The endpoints for edges can be shifted away from the source and target node:

- **`source-distance-from-node`** : A value that shifts the edge away from the source node (default `0px`).
- **`target-distance-from-node`** : A value that shifts the edge away from the target node (default `0px`).

Endpoint modification is not supported for `curve-style: haystack` edges for performance reasons.

## Visibility [](#style/visibility)

- **`display`** : Whether to display the element; may be `element` for displayed or `none` for not displayed.
  - A `display: none` element does not take up space.
    - A `display: none` bundled bezier edge does not take up space in its bundle.
    - A `display: none` node hides its connected edges.
    - A `display: none` node is considered a point rather than an area in layouts, affecting things like overlap avoidance.
    - A `display: none` element is not taken into consideration for viewport fitting.
  - A `display: none` element is not interactive.
- **`visibility`** : Whether the element is visible; may be `visible` or `hidden`.
  - A `visibility: hidden` element does take up space.
    - A `visibility: hidden` bundled bezier edge does take up space in its bundle.
    - A `visibility: hidden` node does not hide its connected edges.
    - A `visibility: hidden` element is considered normally by layouts.
    - A `visibility: hidden` element is taken into consideration for viewport fitting.
  - A `visibility: hidden` element is not interactive.
- **`opacity`** : The opacity of the element, ranging from 0 to 1. Note that the opacity of a compound node parent affects the effective opacity of its children.
  - An `opacity: 0` element does take up space.
    - An `opacity: 0` bundled bezier edge does take up space in its bundle.
    - An `opacity: 0` node does not hide its connected edges.
    - An `opacity: 0` element is considered normally by layouts.
    - An `opacity: 0` element is taken into consideration for viewport fitting.
  - An `opacity: 0` element is interactive.
- **`z-index`** : A numeric value that affects the relative draw order of elements. In general, an element with a higher `z-index` will be drawn on top of an element with a lower `z-index`.
  - Note that edges are under nodes despite `z-index`, except when necessary for compound nodes.
  - Note that unlike CSS proper, the `z-index` is a floating point value.
  - Also unlike CSS proper, a negative value does not have special behaviour. The element is layered according to `z-compound-depth` and `z-index-compare`, while `z-index` only sorts an element within a layer.

Elements are drawn in a specific order based on compound depth (low to high), the element type (typically nodes above edges), and z-index (low to high). These styles affect the ordering:

- **`z-compound-depth`** : May be `bottom`, `orphan`, `auto` (default), or `top`. The first drawn is `bottom`, the second is `orphan`, which is the same depth as the root of the compound graph, followed by the default of `auto` which draws in depth order from root to leaves of the compound graph. The last drawn is `top`. It does not usually make sense to set this value for non-compound graphs.
- **`z-index-compare`**: May be `auto` (default) or `manual`. The `auto` setting draws edges under nodes, whereas `manual` ignores this convention and draws solely based on the `z-index` value.
- **`z-index`** : An integer value that affects the relative draw order of elements. In general, an element with a higher `z-index` will be drawn on top of an element with a lower `z-index` within the same depth.

## Labels [](#style/labels)

Label text:

- **`label`** : The text to display for an element’s label ([demo](demos/labels)).
- **`source-label`** : The text to display for an edge’s source label.
- **`target-label`** : The text to display for an edge’s target label.

Basic font styling:

- **`color`** : The colour of the element’s label.
- **`text-opacity`** : The opacity of the label text, including its outline.
- **`font-family`** : A [comma-separated list of font names](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family) to use on the label text.
- **`font-size`** : The size of the label text.
- **`font-style`** : A [CSS font style](https://developer.mozilla.org/en-US/docs/Web/CSS/font-style) to be applied to the label text.
- **`font-weight`** : A [CSS font weight](https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight) to be applied to the label text.
- **`text-transform`** : A transformation to apply to the label text; may be `none`, `uppercase`, or `lowercase`.

Wrapping text:

- **`text-wrap`** : A wrapping style to apply to the label text; may be `none` for no wrapping (including manual newlines: `\n`), `wrap` for manual and/or autowrapping, or `ellipsis` to truncate the string and append ‘…’ based on `text-max-width`. Note that with `wrap`, text will always wrap on newlines (`\n`) and text may wrap on any breakable whitespace character — including [zero-width spaces](https://en.wikipedia.org/wiki/Zero-width_space) (`\u200b`).
- **`text-max-width`** : The maximum width for wrapped text, applied when `text-wrap` is set to `wrap` or `ellipsis`. For only manual newlines (i.e. `\n`), set a very large value like `1000px` such that only your newline characters would apply.
- **`text-overflow-wrap`** : The characters that may be used for possible wrapping locations when a line overflows `text-max-width`; may be `whitespace` (default) or `anywhere`. Note that `anywhere` is suited to [CJK](https://en.wikipedia.org/wiki/CJK_characters), where the characters are in a grid and no whitespace exists. Using `anywhere` with text in the Latin alphabet, for example, will split words at arbitrary locations.
- **`text-justification`** : The justification of multiline (wrapped) labels; may be `left`, `center`, `right`, or `auto` (default). The `auto` value makes it so that a node’s label is justified along the node — e.g. a label on the right side of a node is left justified.
- **`line-height`** : The line height of multiline text, as a relative, unitless value. It specifies the vertical spacing between each line. With value `1` (default), the lines are stacked directly on top of one another with no additional whitespace between them. With value `2`, for example, there is whitespace between each line equal to the visible height of a line of text.

Node label alignment:

- **`text-halign`** : The horizontal alignment of a node’s label; may have value `left`, `left-inside`, `center`, `right`, or `right-inside`.
- **`text-valign`** : The vertical alignment of a node’s label; may have value `top`, `top-inside`, `center`, `bottom`, or `bottom-inside`.

Edge label alignment:

- **`source-text-offset`** : For the source label of an edge, how far from the source node the label should be placed.
- **`target-text-offset`** : For the target label of an edge, how far from the target node the label should be placed.

Margins:

- **`text-margin-x`** : A margin that shifts the label along the x-axis.
- **`text-margin-y`** : A margin that shifts the label along the y-axis.
- **`source-text-margin-x`** : (For the source label of an edge.)
- **`source-text-margin-y`** : (For the source label of an edge.)
- **`target-text-margin-x`** : (For the target label of an edge.)
- **`target-text-margin-y`** : (For the target label of an edge.)

Rotating text:

- **`text-rotation`** : A rotation angle that is applied to the label.
- Rotations are clockwise.
- For edges, the special value `autorotate` can be used to align the label to the edge.
- For nodes, the label is rotated along its anchor point on the node, so a label margin may help for some usecases.
- The special value `none` can be used to denote `0deg`.
- Rotations works best with left-to-right text.
- **`source-text-rotation`** : (For the source label of an edge.)
- **`target-text-rotation`** : (For the target label of an edge.)

Outline:

- **`text-outline-color`** : The colour of the outline around the element’s label text.
- **`text-outline-opacity`** : The opacity of the outline on label text.
- **`text-outline-width`** : The size of the outline on label text.

Background:

- **`text-background-color`** : A colour to apply on the text background.
- **`text-background-opacity`** : The opacity of the label background; the background is disabled for `0` (default value).
- **`text-background-shape`** : The shape to use for the label background, can be `rectangle`, `round-rectangle`, or `circle`. The `circle` option is primarily a visual-only style for compact or short labels; however, the actual bounding box remains rectangular, especially for longer text. The `text-background-padding` property can be applied to expand the visual radius of the circular background.
- **`text-background-padding`** : A padding on the background of the label (e.g `5px`); zero padding is used by default.

Border:

- **`text-border-opacity`** : The width of the border around the label; the border is disabled for `0` (default value).
- **`text-border-width`** : The width of the border around the label.
- **`text-border-style`** : The style of the border around the label; may be `solid`, `dotted`, `dashed`, or `double`.
- **`text-border-color`** : The colour of the border around the label.

Interactivity:

- **`min-zoomed-font-size`** : If zooming makes the effective font size of the label smaller than this, then no label is shown. Note that because of performance optimisations, the label may be shown at font sizes slightly smaller than this value. This effect is more pronounced at larger screen pixel ratios. However, it is guaranteed that the label will be shown at sizes equal to or greater than the value specified.
- **`text-events`** : Whether events should occur on an element if the label receives an event; may be `yes` or `no`. You may want a style applied to the text on `:active` so you know the text is activatable.
- **`box-selection`** : Whether events should be triggered on an element when its label is partially or fully selected via box selection; may be `contain` (default, completely inside the box), `overlap` (overlaps with the box), or `none` (box selection disabled). You may want a style applied to the text on `:active` so you know the text is activatable. This setting takes effect on node label only if `text-events=yes`.

## Events [](#style/events)

- **`events`** : Whether events should occur on an element (e.g. `tap`, `mouseover`, etc.); may be `yes` or `no`. For `no`, the element receives no events and events simply pass through to the core/viewport. The `events` property is per-element, so the value of a compound parent does not affect its children.

- **`text-events`** : Whether events should occur on an element if the label receives an event; may be `yes` or `no`. You may want a style applied to the text on `:active` so you know the text is activatable.

- **`box-selection`** : Whether events should be triggered on a node element when its label is partially or fully selected via box selection rectangle (e.g., when the user drags a selection box).

  - `contain` (default): The element is selected only if it is entirely within the selection box.
  - `overlap`: The element is selected if any part of it overlaps with the selection box.
  - `none`: The element is excluded from box selection.

  You may want a style applied to the text on `:active` so you know the text is activatable. This setting takes effect on node label only if `text-events=yes`.

## Overlay [](#style/overlay)

These properties allow for the creation of overlays on top of nodes or edges, and are often used in the `:active` state.

- **`overlay-color`** : The colour of the overlay.
- **`overlay-padding`** : The area outside of the element within which the overlay is shown.
- **`overlay-opacity`** : The opacity of the overlay.
- **`overlay-shape`** : The shape of the node overlay; may be `round-rectangle` (default), `ellipse`. Doesn’t apply to edges.

## Underlay [](#style/underlay)

These properties allow for the creation of underlays behind nodes or edges, and are often used in a highlighted state.

- **`underlay-color`** : The colour of the underlay.
- **`underlay-padding`** : The area outside of the element within which the underlay is shown.
- **`underlay-opacity`** : The opacity of the underlay.
- **`underlay-shape`** : The shape of the node underlay; may be `round-rectangle` (default), `ellipse`. Doesn’t apply to edges.

## Ghost [](#style/ghost)

The ghost properties allow for creating a ghosting effect, a semitransparent duplicate of the element drawn at an offset.

- **`ghost`** : Whether to use the ghost effect; may be `yes` or `no`.
- **`ghost-offset-x`** : The horizontal offset used to position the ghost effect.
- **`ghost-offset-y`** : The vertical offset used to position the ghost effect.
- **`ghost-opacity`** : The opacity of the ghost effect.

## Transition animation [](#style/transition-animation)

- **`transition-property`** : A space-separated list of style properties to animate in this state.
- **`transition-duration`** : The length of the transition (e.g. `0.5s`).
- **`transition-delay`** : The length of the delay before the transition occurs (e.g. `250ms`).
- **`transition-timing-function`** : An easing function that controls the animation progress curve; may be one of the following values. A [visualisation](http://easings.net/) of easings serves as a reference.
  - `linear` (default),
  - `spring( tension, friction )`
  - `cubic-bezier( x1, y1, x2, y2 )` (a [demo](http://cubic-bezier.com) has details for parameter values),
  - `ease`,
  - `ease-in`,
  - `ease-out`,
  - `ease-in-out`,
  - `ease-in-sine`,
  - `ease-out-sine`,
  - `ease-in-out-sine`,
  - `ease-in-quad`,
  - `ease-out-quad`,
  - `ease-in-out-quad`,
  - `ease-in-cubic`,
  - `ease-out-cubic`,
  - `ease-in-out-cubic`,
  - `ease-in-quart`,
  - `ease-out-quart`,
  - `ease-in-out-quart`,
  - `ease-in-quint`,
  - `ease-out-quint`,
  - `ease-in-out-quint`,
  - `ease-in-expo`,
  - `ease-out-expo`,
  - `ease-in-out-expo`,
  - `ease-in-circ`,
  - `ease-out-circ`,
  - `ease-in-out-circ`.

## Core [](#style/core)

These properties affect UI global to the graph, and apply only to the core. You can use the special `core` selector string to set these properties.

Indicator:

- **`active-bg-color`** : The colour of the indicator shown when the background is grabbed by the user.
- **`active-bg-opacity`** : The opacity of the active background indicator.
- **`active-bg-size`** : The size of the active background indicator.

Selection box:

- **`selection-box-color`** : The background colour of the selection box used for drag selection.
- **`selection-box-border-color`** : The colour of the border on the selection box.
- **`selection-box-border-width`** : The size of the border on the selection box.
- **`selection-box-opacity`** : The opacity of the selection box.

Texture during viewport gestures:

- **`outside-texture-bg-color`** : The colour of the area outside the viewport texture when `initOptions.textureOnViewport === true`.
- **`outside-texture-bg-opacity`** : The opacity of the area outside the viewport texture.

# Events [](#events)

## Event object [](#events/event-object)

Events passed to handler callbacks are similar to [jQuery event objects](http://api.jquery.com/category/events/event-object/) and [React synthetic events](https://reactjs.org/docs/events.html) in that they wrap native event objects, mimicking their API.

Fields:

- `cy` : a reference to the corresponding core instance
- `target` : indicates the element or core that first caused the event
- `type` : the event type string (e.g. `"tap"`)
- `namespace` : the event namespace string (e.g. `"foo"` for `"tap.foo"`)
- `timeStamp` : Unix epoch time of event in milliseconds

Fields for only user input device events:

- `position` : indicates the model position of the event
- `renderedPosition` : indicates the rendered position of the event
- `originalEvent` : the original user input device event object

Fields for only layout events:

- `layout` : indicates the corresponding layout that triggered the event (useful if running multiple layouts simultaneously)

## Event bubbling [](#events/event-bubbling)

All events that occur on elements get bubbled up to [compound parents](#notation/compound-nodes) and then to the core. You must take this into consideration when listening to the core so you can differentiate between events that happened on the background and ones that happened on elements. Use the `eventObj.target` field, which indicates the originator of the event (i.e. `eventObj.target === cy || eventObj.target === someEle`).

## User input device events [](#events/user-input-device-events)

These are normal browser events that you can listen to via Cytoscape.js. You can listen to these events on the core and on collections.

- `mousedown` : when the mouse button is pressed
- `mouseup` : when the mouse button is released
- `click` : after `mousedown` then `mouseup`
- `mouseover` : when the cursor is put on top of the target
- `mouseout` : when the cursor is moved off of the target
- `mousemove` : when the cursor is moved somewhere on top of the target
- `touchstart` : when one or more fingers starts to touch the screen
- `touchmove` : when one or more fingers are moved on the screen
- `touchend` : when one or more fingers are removed from the screen

There are also some higher level events that you can use so you don’t have to listen to different events for mouse-input devices and for touch devices.

- `tapstart` or `vmousedown` : normalised tap start event (either `mousedown` or `touchstart`)
- `tapdrag` or `vmousemove` : normalised move event (either `touchmove` or `mousemove`)
- `tapdragover` : normalised over element event (either `touchmove` or `mousemove`/`mouseover`)
- `tapdragout` : normalised off of element event (either `touchmove` or `mousemove`/`mouseout`)
- `tapend` or `vmouseup` : normalised tap end event (either `mouseup` or `touchend`)
- `tap` or `vclick` : normalised tap event (either `click`, or `touchstart` followed by `touchend` without `touchmove`)
- `onetap` or `voneclick` or `oneclick` : normalised tap event (triggers after a given debouce time to first check for `dblclick` event - `multiClickDebounceTime`: set to 250ms by default)
- `dbltap` or `vdblclick` or `dblclick` : normalised double tap event (either two subsequent `click`, or two subsequent `touchstart` followed by `touchend` without `touchmove`)
- `taphold` : normalised tap hold event
- `cxttapstart` : normalised right-click mousedown or two-finger `tapstart`
- `cxttapend` : normalised right-click `mouseup` or two-finger `tapend`
- `cxttap` : normalised right-click or two-finger `tap`
- `cxtdrag` : normalised mousemove or two-finger drag after `cxttapstart` but before `cxttapend`
- `cxtdragover` : when going over a node via `cxtdrag`
- `cxtdragout` : when going off a node via `cxtdrag`
- `boxstart` : when starting box selection
- `boxend` : when ending box selection
- `boxselect` : triggered on elements when selected by box selection
- `box` : triggered on elements when inside the box on `boxend`

## Collection events [](#events/collection-events)

These events are custom to Cytoscape.js. You can listen to these events for collections.

- `add` : when an element is added to the graph
- `remove` : when an element is removed from the graph
- `move` : when an element is moved w.r.t. topology
  - nodes: when the compound `parent` is changed
  - edges: when the `source` or `target` is changed
- `select` : when an element is selected
- `unselect` : when an element is unselected
- `tapselect` : when an element is selected by a tap gesture
- `tapunselect` : when an element is unselected by a tap elsewhere
- `boxselect` : triggered on elements when selected by box selection
- `box` : triggered on elements when inside the box on `boxend`
- `lock` : when an element is locked
- `unlock` : when an element is unlocked
- `grabon` : when an element is grabbed directly (including only the one node directly under the cursor or the user’s finger)
- `grab` : when an element is grabbed (including all elements that would be dragged)
- `drag` : when an element is grabbed and then moved
- `free` : when an element is freed (i.e. let go from being grabbed)
- `freeon` : when an element is freed directly (including only the one node directly under the cursor or the user’s finger)
- `dragfree` : when an element is freed after being dragged (i.e. `grab` then `drag` then `free`)
- `dragfreeon` : when an element is freed after being dragged directly (i.e. `grabon`, `drag`, `freeon`)
- `position` : when an element changes position
- `data` : when an element’s data is changed
- `scratch` : when an element’s scratchpad data is changed
- `style` : when an element’s style is changed
- `background` : when a node’s background image is loaded

## Graph events [](#events/graph-events)

These events are custom to Cytoscape.js, and they occur on the core.

- `layoutstart` : when a layout starts running
- `layoutready` : when a layout has set initial positions for all the nodes (but perhaps not final positions)
- `layoutstop` : when a layout has finished running completely or otherwise stopped running
- `ready` : when a new instance of Cytoscape.js is ready to be interacted with
- `destroy` : when the instance of Cytoscape.js was explicitly destroyed by calling `.destroy()`.
- `render` : when the viewport is (re)rendered
- `pan` : when the viewport is panned
- `dragpan` : when the viewport is panned via dragging
- `zoom` : when the viewport is zoomed
- `pinchzoom` : when the viewport is zoomed via pinch gesture. This event is only supported for browsers which support the [gesturechange event](https://developer.mozilla.org/en-US/docs/Web/API/Element/gesturechange_event) or [touch events](https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent). Other browsers will fire the `scrollzoom` event.
- `scrollzoom` : when the viewport is zoomed via the scroll wheel
- `viewport` : when the viewport is changed (i.e. from a `pan`, a `zoom`, or from both when zooming about a point – e.g. pinch-to-zoom)
- `resize` : when the viewport is resized (usually by calling `cy.resize()`, a `window` resize, or toggling a class on the Cytoscape.js div)

# Layouts [](#layouts)

The function of a layout is to set the positions on the nodes in the graph. Layouts are [extensions](#extensions/layouts) of Cytoscape.js such that it is possible for anyone to write a layout without modifying the library itself.

Several layouts are included with Cytoscape.js by default, and their options are described in the sections that follow with the default values specified. Note that you must set `options.name` to the name of the layout to specify which one you want to run.

Each layout has its own algorithm for setting the position for each node. This algorithm influences the overall shape of the graph and the lengths of the edges. A layout’s algorithm can be customised by setting its options. Therefore, edge lengths can be controlled by setting the layout options appropriately.

For force-directed (physics) layouts, there is generally an option to set a weight to each edge to affect the relative edge lengths. Edge length can also be affected by options like spacing factors, angles, and overlap avoidance. Setting edge length depends on the particular layout, and some layouts will allow for more precise edge lengths than others.

A layout runs on the subgraph that you specify. All elements in the graph are used for [`cy.layout()`](#cy.layout). The specified subset of elements is used for [`eles.layout()`](#eles.layout). In either case, the state of each element does not affect whether the element is considered in the layout. For example, an [invisible node](#style/visibility) is repositioned by a layout if the node is included in the layout’s set of elements. You may use `eles.layout()` to address complex use-cases, like running a different layout on each component.

When running a headless instance, you may need to specify the `boundingBox` in order to indicate to the layout the area in which it can place nodes. In a rendered instance, the bounds may be inferred by the size of the HTML DOM element `container`.

Refer to [the blog for an in-depth layout tutorial](https://blog.js.cytoscape.org/2020/05/11/layouts).

## null [](#layouts/null)

The `null` layout puts all nodes at (0, 0). It’s useful for debugging purposes.

### Options

    let options = {
      name: 'null',

      ready: function(){}, // on layoutready
      stop: function(){} // on layoutstop
    };

    cy.layout( options );

## random [](#layouts/random)

The `random` layout puts nodes in random positions within the viewport.

### Options

    let options = {
      name: 'random',

      fit: true, // whether to fit to viewport
      padding: 30, // fit padding
      boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
      animate: false, // whether to transition the node positions
      animationDuration: 500, // duration of animation in ms if enabled
      animationEasing: undefined, // easing of animation if enabled
      animateFilter: function ( node, i ){ return true; }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
      ready: undefined, // callback on layoutready
      stop: undefined, // callback on layoutstop
      transform: function (node, position ){ return position; } // transform a given node position. Useful for changing flow direction in discrete layouts 
    };

    cy.layout( options );

## preset [](#layouts/preset)

The `preset` layout puts nodes in the positions you specify manually.

### Options

    let options = {
      name: 'preset',

      positions: undefined, // map of (node id) => (position obj); or function(node){ return somPos; }
      zoom: undefined, // the zoom level to set (prob want fit = false if set)
      pan: undefined, // the pan level to set (prob want fit = false if set)
      fit: true, // whether to fit to viewport
      padding: 30, // padding on fit
      spacingFactor: undefined, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
      animate: false, // whether to transition the node positions
      animationDuration: 500, // duration of animation in ms if enabled
      animationEasing: undefined, // easing of animation if enabled
      animateFilter: function ( node, i ){ return true; }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
      ready: undefined, // callback on layoutready
      stop: undefined, // callback on layoutstop
      transform: function (node, position ){ return position; } // transform a given node position. Useful for changing flow direction in discrete layouts
    };

    cy.layout( options );

## grid [](#layouts/grid)

The `grid` layout puts nodes in a well-spaced grid.

### Options

    let options = {
      name: 'grid',

      fit: true, // whether to fit the viewport to the graph
      padding: 30, // padding used on fit
      boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
      avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
      avoidOverlapPadding: 10, // extra spacing around nodes when avoidOverlap: true
      nodeDimensionsIncludeLabels: false, // Excludes the label when calculating node bounding boxes for the layout algorithm
      spacingFactor: undefined, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
      condense: false, // uses all available space on false, uses minimal space on true
      rows: undefined, // force num of rows in the grid
      cols: undefined, // force num of columns in the grid
      position: function( node ){}, // returns { row, col } for element
      sort: undefined, // a sorting function to order the nodes; e.g. function(a, b){ return a.data('weight') - b.data('weight') }
      animate: false, // whether to transition the node positions
      animationDuration: 500, // duration of animation in ms if enabled
      animationEasing: undefined, // easing of animation if enabled
      animateFilter: function ( node, i ){ return true; }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
      ready: undefined, // callback on layoutready
      stop: undefined, // callback on layoutstop
      transform: function (node, position ){ return position; } // transform a given node position. Useful for changing flow direction in discrete layouts 
    };

    cy.layout( options );

## circle [](#layouts/circle)

The `circle` layout puts nodes in a circle.

### Options

    let options = {
      name: 'circle',

      fit: true, // whether to fit the viewport to the graph
      padding: 30, // the padding on fit
      boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
      avoidOverlap: true, // prevents node overlap, may overflow boundingBox and radius if not enough space
      nodeDimensionsIncludeLabels: false, // Excludes the label when calculating node bounding boxes for the layout algorithm
      spacingFactor: undefined, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
      radius: undefined, // the radius of the circle
      startAngle: 3 / 2 * Math.PI, // where nodes start in radians
      sweep: undefined, // how many radians should be between the first and last node (defaults to full circle)
      clockwise: true, // whether the layout should go clockwise (true) or counterclockwise/anticlockwise (false)
      sort: undefined, // a sorting function to order the nodes; e.g. function(a, b){ return a.data('weight') - b.data('weight') }
      animate: false, // whether to transition the node positions
      animationDuration: 500, // duration of animation in ms if enabled
      animationEasing: undefined, // easing of animation if enabled
      animateFilter: function ( node, i ){ return true; }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
      ready: undefined, // callback on layoutready
      stop: undefined, // callback on layoutstop
      transform: function (node, position ){ return position; } // transform a given node position. Useful for changing flow direction in discrete layouts 

    };

    cy.layout( options );

## concentric [](#layouts/concentric)

The `concentric` layout positions nodes in concentric circles, based on a metric that you specify to segregate the nodes into levels. This layout sets the `concentric` value in [`ele.scratch()`](#ele.scratch).

### Options

    let options = {
      name: 'concentric',

      fit: true, // whether to fit the viewport to the graph
      padding: 30, // the padding on fit
      startAngle: 3 / 2 * Math.PI, // where nodes start in radians
      sweep: undefined, // how many radians should be between the first and last node (defaults to full circle)
      clockwise: true, // whether the layout should go clockwise (true) or counterclockwise/anticlockwise (false)
      equidistant: false, // whether levels have an equal radial distance betwen them, may cause bounding box overflow
      minNodeSpacing: 10, // min spacing between outside of nodes (used for radius adjustment)
      boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
      avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
      nodeDimensionsIncludeLabels: false, // Excludes the label when calculating node bounding boxes for the layout algorithm
      height: undefined, // height of layout area (overrides container height)
      width: undefined, // width of layout area (overrides container width)
      spacingFactor: undefined, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
      concentric: function( node ){ // returns numeric value for each node, placing higher nodes in levels towards the centre
      return node.degree();
      },
      levelWidth: function( nodes ){ // the variation of concentric values in each level
      return nodes.maxDegree() / 4;
      },
      animate: false, // whether to transition the node positions
      animationDuration: 500, // duration of animation in ms if enabled
      animationEasing: undefined, // easing of animation if enabled
      animateFilter: function ( node, i ){ return true; }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
      ready: undefined, // callback on layoutready
      stop: undefined, // callback on layoutstop
      transform: function (node, position ){ return position; } // transform a given node position. Useful for changing flow direction in discrete layouts
    };

    cy.layout( options );

## breadthfirst [](#layouts/breadthfirst)

The `breadthfirst` layout puts nodes in a hierarchy, based on a breadthfirst traversal of the graph. It is best suited to trees and forests in its default downward direction, and it is best suited to DAGs in its circle mode.

### Options

    let options = {
      name: 'breadthfirst',

      fit: true, // whether to fit the viewport to the graph
      directed: false, // whether the tree is directed downwards (or edges can point in any direction if false)
      direction: 'downward', // determines the direction in which the tree structure is drawn.  The possible values are 'downward', 'upward', 'rightward', or 'leftward'.
      padding: 30, // padding on fit
      circle: false, // put depths in concentric circles if true, put depths top down if false
      grid: false, // whether to create an even grid into which the DAG is placed (circle:false only)
      spacingFactor: 1.75, // positive spacing factor, larger => more space between nodes (N.B. n/a if causes overlap)
      boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
      avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
      nodeDimensionsIncludeLabels: false, // Excludes the label when calculating node bounding boxes for the layout algorithm
      roots: undefined, // the roots of the trees
      depthSort: undefined, // a sorting function to order nodes at equal depth. e.g. function(a, b){ return a.data('weight') - b.data('weight') }
      animate: false, // whether to transition the node positions
      animationDuration: 500, // duration of animation in ms if enabled
      animationEasing: undefined, // easing of animation if enabled,
      animateFilter: function ( node, i ){ return true; }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
      ready: undefined, // callback on layoutready
      stop: undefined, // callback on layoutstop
      transform: function (node, position ){ return position; } // transform a given node position. Useful for changing flow direction in discrete layouts
    };

    cy.layout( options );

## cose [](#layouts/cose)

The `cose` (Compound Spring Embedder) layout uses a physics simulation to lay out graphs. It works well with noncompound graphs and it has additional logic to support compound graphs well.

It was implemented by [Gerardo Huck](https://www.linkedin.com/in/gerardohuck) as part of Google Summer of Code 2013 (Mentors: Max Franz, Christian Lopes, Anders Riutta, Ugur Dogrusoz).

Based on the article [“A layout algorithm for undirected compound graphs”](http://dl.acm.org/citation.cfm?id=1498047&CFID=429377863&CFTOKEN=94691144) by Ugur Dogrusoz, Erhan Giral, Ahmet Cetintas, Ali Civril and Emek Demir.

The `cose` layout is very fast and produces good results. The [`cose-bilkent`](https://github.com/cytoscape/cytoscape.js-cose-bilkent) extension is an evolution of the algorithm that is more computationally expensive but produces near-perfect results.

### Options

    let options = {
      name: 'cose',

      // Called on `layoutready`
      ready: function(){},

      // Called on `layoutstop`
      stop: function(){},

      // Whether to animate while running the layout
      // true : Animate continuously as the layout is running
      // false : Just show the end result
      // 'end' : Animate with the end result, from the initial positions to the end positions
      animate: true,

      // Easing of the animation for animate:'end'
      animationEasing: undefined,

      // The duration of the animation for animate:'end'
      animationDuration: undefined,

      // A function that determines whether the node should be animated
      // All nodes animated by default on animate enabled
      // Non-animated nodes are positioned immediately when the layout starts
      animateFilter: function ( node, i ){ return true; },


      // The layout animates only after this many milliseconds for animate:true
      // (prevents flashing on fast runs)
      animationThreshold: 250,

      // Number of iterations between consecutive screen positions update
      refresh: 20,

      // Whether to fit the network view after when done
      fit: true,

      // Padding on fit
      padding: 30,

      // Constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
      boundingBox: undefined,

      // Excludes the label when calculating node bounding boxes for the layout algorithm
      nodeDimensionsIncludeLabels: false,

      // Randomize the initial positions of the nodes (true) or use existing positions (false)
      randomize: false,

      // Extra spacing between components in non-compound graphs
      componentSpacing: 40,

      // Node repulsion (non overlapping) multiplier
      nodeRepulsion: function( node ){ return 2048; },

      // Node repulsion (overlapping) multiplier
      nodeOverlap: 4,

      // Ideal edge (non nested) length
      idealEdgeLength: function( edge ){ return 32; },

      // Divisor to compute edge forces
      edgeElasticity: function( edge ){ return 32; },

      // Nesting factor (multiplier) to compute ideal edge length for nested edges
      nestingFactor: 1.2,

      // Gravity force (constant)
      gravity: 1,

      // Maximum number of iterations to perform
      numIter: 1000,

      // Initial temperature (maximum node displacement)
      initialTemp: 1000,

      // Cooling factor (how the temperature is reduced between consecutive iterations
      coolingFactor: 0.99,

      // Lower temperature threshold (below this point the layout will end)
      minTemp: 1.0
    };

    cy.layout( options );

## Layout manipulation [](#layouts/layout-manipulation)

Layouts have a set of functions available to them, which allow for more complex behaviour than the primary run-one-layout-at-a-time usecase. A new, developer accessible layout can be made via [`cy.layout()`](#core/visuals/cy.layout).

layout.run() [](#layout.run)     Aliases: `layout.start()`,

Start running the layout.

### Details

If the layout is asynchronous (i.e. continuous), then calling `layout.run()` simply starts the layout. Synchronous (i.e. discrete) layouts finish before `layout.run()` returns. Whenever the layout is started, the `layoutstart` event is emitted.

The layout will emit the `layoutstop` event when it has finished or has been otherwise stopped (e.g. by calling `layout.stop()`). The developer can listen to `layoutstop` using [`layout.on()`](#layouts/layout-events/layout.on) or setting the layout options appropriately with a callback.

### Examples

    var layout = cy.layout({ name: 'random' });

    layout.run();

layout.stop() [](#layout.stop)  

Stop running the (asynchronous/discrete) layout.

### Details

Calling `layout.stop()` stops an asynchronous (continuous) layout. It’s useful if you want to prematurely stop a running layout.

### Examples

    var layout = cy.layout({ name: 'cose' });

    layout.run();

    // some time later...
    setTimeout(function(){
      layout.stop();
    }, 100);

## Layout events [](#layouts/layout-events)

layout.on() [](#layout.on)           Aliases: `layout.bind()`, `layout.listen()`, `layout.addListener()`,

Listen to events that are emitted by the layout.

layout.on( , events \[, data\], function(event) )

- [events](#events)

  A space separated list of event names.

- data \[optional\]

  A plain object which is passed to the handler in the event object argument.

- function(event)

  The handler function that is called when one of the specified events occurs.

  - [event](#events)

    The event object.

layout.promiseOn() [](#layout.promiseOn)       Aliases: `layout.pon()`,

Get a promise that is resolved when the layout emits the first of any of the specified events.

layout.promiseOn( , events )

- [events](#events)

  A space separated list of event names.

### Examples

    var layout = cy.layout({ name: 'random' });

    layout.pon('layoutstop').then(function( event ){
      console.log('layoutstop promise fulfilled');
    });

    layout.run();

layout.one() [](#layout.one)    

Listen to events that are emitted by the layout, and run the handler only once.

layout.one( , events \[, data\], function(event) )

- [events](#events)

  A space separated list of event names.

- data \[optional\]

  A plain object which is passed to the handler in the event object argument.

- function(event)

  The handler function that is called when one of the specified events occurs.

  - [event](#events)

    The event object.

layout.removeListener() [](#layout.removeListener)           Aliases: `layout.off()`, `layout.unbind()`, `layout.unlisten()`,

Remove event handlers on the layout.

layout.removeListener( , events \[, handler\] )

- [events](#events)

  A space separated list of event names.

- handler \[optional\]

  A reference to the handler function to remove.

layout.removeAllListeners() [](#layout.removeAllListeners)  

Remove all event handlers on the layout.

layout.emit() [](#layout.emit)       Aliases: `layout.trigger()`,

Emit one or more events on the layout.

layout.emit( , events \[, extraParams\] )

- [events](#events)

  A list of event names to emit (either a space-separated string or an array).

- extraParams \[optional\]

  An array of additional parameters to pass to the handler.

# Animations [](#animations)

An animation represents a visible change in state over a duration of time for a single element. Animations can be generated via [`cy.animation()`](#cy.animation) (for animations on the viewport) and [`ele.animation()`](#ele.animation) (for animations on graph elements).

## Animation manipulation [](#animations/animation-manipulation)

ani.play() [](#ani.play)     Aliases: `ani.run()`,

Requests that the animation be played, starting on the next frame. If the animation is complete, it restarts from the beginning.

### Examples

    var jAni = cy.$('#j').animation({
      style: {
        'background-color': 'red',
        'width': 75
      },
      duration: 1000
    });

    jAni.play();

ani.playing() [](#ani.playing)     Aliases: `ani.running()`,

Get whether the animation is currently playing.

ani.progress() et al [](#ani.progress)              

Get or set how far along the animation has progressed.

ani.progress()

Get the progress of the animation in percent.

ani.progress( , progress )

Set the progress of the animation in percent.

- progress

  The progress in percent (i.e. between 0 and 1 inclusive) to set to the animation.

ani.time()

Get the progress of the animation in milliseconds.

ani.time( , time )

Set the progress of the animation in milliseconds.

- time

  The progress in milliseconds (i.e. between 0 and the duration inclusive) to set to the animation.

ani.rewind()

Rewind the animation to the beginning.

ani.fastforward()

Fastforward the animation to the end.

### Examples

    var jAni = cy.$('#j').animation({
      style: {
        'background-color': 'red',
        'width': 75
      },
      duration: 1000
    });

    // set animation to 50% and then play
    jAni.progress(0.5).play();

ani.pause() [](#ani.pause)  

Pause the animation, maintaining the current progress.

### Examples

    var j = cy.$('#j');
    var jAni = j.animation({
      style: {
        'background-color': 'red',
        'width': 75
      },
      duration: 1000
    });

    jAni.play();

    // pause about midway
    setTimeout(function(){
      jAni.pause();
    }, 500);

ani.stop() [](#ani.stop)  

Stop the animation, maintaining the current progress and removing the animation from any associated queues.

### Details

This function is useful in situations where you don’t want to run an animation any more. Calling `ani.stop()` is analogous to calling `ele.stop()` in that the animation is no longer queued.

Calling `ani.stop()` makes animation frames faster by reducing the number of animations to check per element per frame. You should call `ani.stop()` when you want to clean up an animation, especially in situations with many animations. You can still reuse a stopped animation, but an animation that has not been stopped can not be garbage collected unless its associated target (i.e. element or core instance) is garbage collected as well.

### Examples

    var j = cy.$('#j');
    var jAni = j.animation({
      style: {
        'background-color': 'red',
        'width': 75
      },
      duration: 1000
    });

    jAni.play();

    // stop about midway
    setTimeout(function(){
      jAni.stop();
    }, 500);

ani.completed() [](#ani.completed)     Aliases: `ani.complete()`,

Get whether the animation has progressed to the end.

ani.apply() [](#ani.apply)  

Apply the animation at its current progress.

### Details

This function allows you to step directly to a particular progress of the animation while it’s paused.

### Examples

    var jAni = cy.$('#j').animation({
      style: {
        'background-color': 'red',
        'width': 75
      },
      duration: 1000
    });

    jAni.progress(0.5).apply();

ani.applying() [](#ani.applying)  

Get whether the animation is currently applying.

ani.reverse() [](#ani.reverse)  

Reverse the animation such that its starting conditions and ending conditions are reversed.

### Examples

    var jAni = cy.$('#j').animation({
      style: {
        'background-color': 'red',
        'width': 75
      },
      duration: 1000
    });

    jAni
      .play() // start
      .promise('completed').then(function(){ // on next completed
        jAni
          .reverse() // switch animation direction
          .rewind() // optional but makes intent clear
          .play() // start again
        ;
      })
    ;

ani.promise() [](#ani.promise)      

Get a promise that is fulfilled with the specified animation event.

ani.promise()

Get a promise that is fulfilled with the next `completed` event.

ani.promise( , animationEvent )

Get a promise that is fulfilled with the specified animation event.

- animationEvent

  A string for the event name; `completed` or `complete` for completing the animation or `frame` for the next frame of the animation.

### Examples

When `ani.apply()` has updated the element style:

    var jAni = cy.$('#j').animation({
      style: {
        'background-color': 'red',
        'width': 75
      },
      duration: 1000
    });

    jAni.progress(0.5).apply().promise('frame').then(function(){
      console.log('j has now has its style at 50% of the animation');
    });

When `ani.play()` is done:

    var jAni = cy.$('#j').animation({
      style: {
        height: 60
      },
      duration: 1000
    });

    jAni.play().promise().then(function(){
      console.log('animation done');
    });

# Extensions [](#extensions)

You can use an extension (e.g. `cy-ext`) as follows with `cytoscape.use()`:

    cytoscape.use( require('cy-ext') );

Using `import`, the above example would be:

    import ext from 'cy-ext';

    cytoscape.use( ext );

The extensions below are a curated list. To add your extension, [please submit a request](https://github.com/cytoscape/cytoscape.js/issues/new?labels=documentation&title=List%20extension%20:%20%3Cyour%20extension%20name%3E&body=Please%20enter%20your%20Github%20URL%20and%20a%20one-line%20description) that includes your extension’s URL and a one line description.

denotes a first-party extension, one that is maintained by groups associated with the Cytoscape Consortium.

denotes a third-party extension, one that is maintained by outside developers.

## UI extensions [](#extensions/ui-extensions)

-  [`anywhere-panning`](https://github.com/lambdalisue/cytoscape-anywhere-panning) : Allow panning when dragging on nodes or edges.
-  [`automove`](https://github.com/cytoscape/cytoscape.js-automove) : Automatically update node positions based on specified rules (e.g. synching node movements, constraining movements, etc.)
-  [`autopan-on-drag`](https://github.com/iVis-at-Bilkent/cytoscape.js-autopan-on-drag) : Automatically pan the viewport when nodes are dragged outside of the viewport bounds.
-  [`blink`](https://github.com/simCecca/cytoscape-blink) : Make elements blink.
-  [`bubblesets`](https://github.com/sgratzl/cytoscape.js-bubblesets) : Visually group a set of elements via a [bubble set](https://ieeexplore.ieee.org/document/5290706).
-  [`canvas`](https://github.com/classcraft/cytoscape.js-canvas) : An extension to create a canvas over or under a Cytoscape graph. Useful for customizing nodes/edges, drawing backgrounds, etc.
-  [`cerebralweb`](https://github.com/silviafrias/cerebral-web) : Enable fast and interactive visualisation of molecular interaction networks stratified based on subcellular localisation or other custom annotation.
-  [`compound-drag-and-drop`](https://github.com/cytoscape/cytoscape.js-compound-drag-and-drop) : Compound node drag-and-drop UI for adding and removing children
-  [`context-menus`](https://github.com/iVis-at-Bilkent/cytoscape.js-context-menus) : A traditional right click menu
-  [`cxtmenu`](https://github.com/cytoscape/cytoscape.js-cxtmenu) : A circular context menu that allows for one-swipe commands on the graph.
-  [`dom-node`](https://github.com/mwri/cytoscape-dom-node) : Use an HTML element as a node’s body.
-  [`edge-editing`](https://github.com/iVis-at-Bilkent/cytoscape.js-edge-editing) : UI for editing edge bends (segment edges and bezier edges)
-  [`edge-editation`](https://github.com/frankiex/cytoscape.js-edge-editation) : Adds handles to nodes and allows creation of different types of edges
-  [`edge-connections`](https://github.com/jri/cytoscape-edge-connections) : Allows edges to visually connect other edges, according to the Associative Model of Data.
-  [`edgehandles`](https://github.com/cytoscape/cytoscape.js-edgehandles) : UI for connecting nodes with edges.
-  [`even-parent`](https://github.com/mo0om/cytoscape-even-parent) : Layout which resizes children to fit under parent no matter how many there are.
-  [`expand-collapse`](https://github.com/iVis-at-Bilkent/cytoscape.js-expand-collapse) : Provides an API for expanding and collapsing compound parent nodes
-  [`grid-guide`](https://github.com/iVis-at-Bilkent/cytoscape.js-grid-guide) : Adds grid and snapping functionality to Cytoscape graphs
-  [`html`](https://github.com/BradyDouthit/cytoscape-html) : Allows for nodes to be rendered via HTML.
-  [`lasso`](https://github.com/zakjan/cytoscape-lasso) : Lasso selection UI
-  [`layers`](https://github.com/sgratzl/cytoscape.js-layers) : Simplifies the creation and management of additional layers in SVG, HTML, or Canvas format with additional utilities to render elements per node or edge.
-  [`leaf`](https://github.com/cytoscape/cytoscape.js-leaflet) : Allow for Leaflet maps to be shown underneath Cytoscape visualisations.
-  [`mapbox-gl`](https://github.com/zakjan/cytoscape-mapbox-gl) : Display a Cytoscape graph on top of a Mapbox GL map.
-  [`navigator`](https://github.com/cytoscape/cytoscape.js-navigator) : A bird’s eye view widget of the graph.
-  [`no-overlap`](https://mo0om.github.io/cytoscape-no-overlap) : Prevents nodes from overlapping on drag.
-  [`node-html-label`](https://github.com/kaluginserg/cytoscape-node-html-label) : Allows HTML to be specified as the labels for nodes.
-  [`node-edge-html-label`](https://github.com/laikmokashi/cytoscape-node-edge-html-label) : Allows HTML to be specified as the labels for nodes and edges.
-  [`node-resize`](https://github.com/iVis-at-Bilkent/cytoscape.js-node-resize) : A highly customisable node resizing extension with a traditional UI.
-  [`node-resizer`](https://github.com/gxara/cytoscape-js-node-resizer) : A node resizing extension with zero dependencies.
-  [`noderesize`](https://github.com/curupaco/cytoscape.js-noderesize) : A minimalistic node resize control.
-  [`overlays`](https://github.com/sgratzl/cytoscape.js-overlays) : Overlays that shows bars, histograms, sparklines, binary sparklines, symbols (categorical data), or boxplots next to nodes.
-  [`panzoom`](https://github.com/cytoscape/cytoscape.js-panzoom) : A panzoom UI widget.
-  [`popper`](https://github.com/cytoscape/cytoscape.js-popper) : A wrapper for [Popper.js](https://popper.js.org/) that lets you position divs relative to Cytoscape elements (can be used with [Tippy.js](https://atomiks.github.io/tippyjs/) to create tooltips).
-  [`qtip`](https://github.com/cytoscape/cytoscape.js-qtip) : A wrapper that lets you use qTips on graph elements or the graph background.
-  [`snap-to-grid`](https://github.com/guimeira/cytoscape-snap-to-grid) : Adds snap-to-grid and gridlines to Cytoscape.js graphs.
-  [`supportimages`](https://github.com/jhonatandarosa/cytoscape.js-supportimages) : Support images on Cytoscape.js.
-  [`toolbar`](https://github.com/bdparrish/cytoscape.js-toolbar) : Allow a user to create a custom toolbar to add next to a Cytoscape core instance.

## Layout extensions [](#extensions/layout-extensions)

-  [`cola`](https://github.com/cytoscape/cytoscape.js-cola) : The Cola.js physics simulation (force-directed) layout. Cola makes beautiful layout results, it animates very smoothly, and it has great options for controlling the layout. It is focussed on giving aesthetically pleasing results for relatively small graphs.
-  [`avsdf`](https://github.com/iVis-at-Bilkent/cytoscape.js-avsdf) : The AVSDF layout. It organises nodes in a circle and tries to minimise edge crossings as much as possible.
-  [`cise`](https://github.com/iVis-at-Bilkent/cytoscape.js-cise) : The CiSE layout creates circular clusters and uses a physics simulation (force-directed algorithm) to create distance between the clusters.
-  [`cose-bilkent`](https://github.com/cytoscape/cytoscape.js-cose-bilkent) : The CoSE layout by Bilkent with enhanced compound node placement. CoSE Bilkent is a physics simulation (force-directed) layout that gives near-perfect end results. However, it’s more expensive than both `cose` and `fcose`.
-  [`cosep`](https://github.com/iVis-at-Bilkent/cytoscape.js-cosep) : Compound Spring Embedder with Ports (CoSEP) is a force-directed layout algorithm based on the CoSE (Compound Spring Embedder) to support port constraints on compound graphs.
-  [`cosmos-over-cytoscape`](https://github.com/simCecca/cosmosOverCytoscape) : A physics simulation layout that makes use of parallelism on the GPU to support large graphs.
-  [`d3-force`](https://github.com/shichuanpo/cytoscape.js-d3-force) : The D3 force layout. It uses a basic physics simulation (force-directed) algorithm that generates good results for small, simple graphs.
-  [`dagre`](https://github.com/cytoscape/cytoscape.js-dagre) : The Dagre layout for DAGs and trees. It organises the graph in a hierarchy.
-  [`elk`](https://github.com/cytoscape/cytoscape.js-elk) : [ELK](https://github.com/OpenKieler/elkjs) layout algorithm adapter for Cytoscape.js. It contains several layout algorithms.
-  [`euler`](https://github.com/cytoscape/cytoscape.js-euler) : Euler is a fast, small file-size, high-quality force-directed (physics simulation) layout. It is good for non-compound graphs, and it has basic support for compound graphs.
-  [`fcose`](https://github.com/iVis-at-Bilkent/cytoscape.js-fcose) : The fCoSE layout is a faster version of the CoSE-Bilkent layout. It supports compound and non-compound graphs, giving top-tier end results and high performance for a force-directed layout. In addition, fCoSE supports user-specified constraints of the following types on nodes: fixed position, alignment and relative placement. If you want to use a force-directed layout, fCoSE should be the first layout you try.
-  [`klay`](https://github.com/cytoscape/cytoscape.js-klay) : Klay is a layout that works well for most types of graphs. It gives good results for ordinary graphs, and it handles DAGs and compound graphs very nicely.
-  [`ngraph.forcelayout`](https://github.com/Nickolasmv/cytoscape-ngraph.forcelayout) : A physics simulation layout that works particularly well on planar graphs. It is relatively fast.
-  [`polywas`](https://github.com/monprin/polywas) : A layout for GWAS (genome-wide association study) data illustrating inter-locus relationships.
-  [`spread`](https://github.com/cytoscape/cytoscape.js-spread) : The Spread physics simulation (force-directed) layout tries to use all the viewport space, but it can be configured to produce a tighter result. It uses the CoSE algorithm initially, and it uses Gansner and North for the spread phase.
-  [`springy`](https://github.com/cytoscape/cytoscape.js-springy) : The Springy physics simulation layout. It’s a basic physics (force-directed) layout.
-  [`tidytree`](https://github.com/chuckzel/cytoscape-tidytree) : A layout specifically for trees that allows for a non-layered layout.

## API extensions [](#extensions/api-extensions)

-  [`all-paths`](https://github.com/daniel-dx/cytoscape-all-paths) : Gets all longest, directed paths.
-  [`clipboard`](https://github.com/iVis-at-Bilkent/cytoscape.js-clipboard) : Adds copy-paste utilities to Cytoscape.js.
-  [`dblclick`](https://github.com/lambdalisue/cytoscape-dblclick) : Adds a `dblclick` event to Cytoscape.js.
-  [`graphml`](https://github.com/iVis-at-Bilkent/cytoscape.js-graphml) : Adds GraphML import and export functionality to Cytoscape.js.
-  [`layout-utilities`](https://github.com/iVis-at-Bilkent/cytoscape.js-layout-utilities) : Provides miscellenaous layout utilities in order to manage the placement of nodes or components without layout information.
-  [`pdf-export`](https://github.com/cytoscape/cytoscape.js-pdf-export) : PDF exporter.
-  [`undo-redo`](https://github.com/iVis-at-Bilkent/cytoscape.js-undo-redo) : Adds undo-redo APIs to Cytoscape.js.
-  [`view-utilities`](https://github.com/iVis-at-Bilkent/cytoscape.js-view-utilities) : Adds search and highlight APIs to Cytoscape.js.

## Utility packages [](#extensions/utility-packages)

-  [`Cytoscape.js Schema`](https://github.com/AZaitzeff/cytoscape_js_schema) : A JSON Schema for the Cytoscape.js JSON graph format.
-  [`cytosnap`](https://github.com/cytoscape/cytosnap) : A Node.js package that renders images of Cytoscape.js graphs on the server using Puppeteer.
-  [`Cyjs.NET`](https://fslab.org/Cyjs.NET/) : An interface for Cytoscape.js in F#.
-  [`ngx-cytoscape`](https://github.com/calvinvette/ngx-cytoscape) : An Angular 5+ component for Cytoscape.js.
-  [`react-cytoscapejs`](https://github.com/plotly/react-cytoscapejs) : A [React](https://reactjs.org) component for Cytoscape.js network visualisations.
-  [`cytoscape-react`](https://github.com/mwri/cytoscape-react) : Create `<Node>`s and `<Edge>s` specified with JSX.
-  [`sif.js`](https://github.com/jmvillaveces/sif.js) : A javascript library to parse simple interaction file (SIF) files.
-  [`sbgn-stylesheet`](https://github.com/PathwayCommons/cytoscape-sbgn-stylesheet) : A stylesheet preset for [SBGN](https://sbgn.github.io/sbgn/).
-  [`sbgnml-to-cytoscape`](https://github.com/PathwayCommons/sbgnml-to-cytoscape) : Converts XML-based [SBGN](https://sbgn.github.io/sbgn/) files to Cytoscape.js JSON.
-  [`vue-cytoscape`](https://www.npmjs.com/package/vue-cytoscape) : A [Vue](https://vuejs.org) component for Cytoscape.js.
-  [`cytoscape-pptx`](https://github.com/Hoogkamer/cytoscape-pptx) : Export a Cytoscape.js graph into a Powerpoint slide.

## Registration [](#extensions/registration)

To register an extension, make the following call: `cytoscape( type, name, extension );`

The value of `type` can take on the following values:

- `'core'` : The extension adds a core function.
- `'collection'` : The extension adds a collection function.
- `'layout'` : The extension registers a layout prototype.

The `name` argument indicates the name of the extension, e.g.: the following code registers `eles.fooBar()`:

    cytoscape('collection', 'fooBar', function(){
      return 'baz';
    });`

## Project setup [](#extensions/project-setup)

1.  Create a repository on GitHub for your extension’s code

2.  Use [rollup-starter-lib](https://github.com/rollup/rollup-starter-lib) to create the project’s scaffolding. Alternatively, manually generate the project configuration files with your favourite bundler.

3.  Use [Babel](https://babeljs.io) if you want to support older browsers with your extension. The `rollup-starter-lib` repo has an example in the [`babel` branch](https://github.com/rollup/rollup-starter-lib/tree/babel).

4.  The default export of your extension should be a registration function, e.g.:

        export default function register(cytoscape){
          cytoscape('collection', 'fooBar', fooBarFunction);
        }

5.  You may want to support automatic registration for consumers who use traditional `<script>` tags to use your extension, i.e.:

        if(typeof window.cytoscape !== 'undefined'){
          register(window.cytoscape);
        }

6.  Document your extension’s API in a `README.md` file in the root directory of your respository.

7.  [Publish your extension to npm](https://docs.npmjs.com/cli/publish).

8.  [Submit a request](https://github.com/cytoscape/cytoscape.js/issues/new?labels=documentation&title=List%20extension%20:%20%3Cyour%20extension%20name%3E&body=Please%20enter%20your%20Github%20URL%20and%20a%20one-line%20description) to have your extension listed in the documentation.

## Layout prototype [](#extensions/layout-prototype)

- `constructor(options)` : Create the layout
  - `options` : The layout options, special fields include:
    - `options.cy` : The Cytoscape graph
    - `options.eles` : The collection of elements passed to the layout
- `run()` : Run the layout
  - `run()` calls `eles.layoutPositions()` to set the final layout positions, if the layout is discrete.
  - `run()` starts the async layout, if the layout is continuous (e.g. a force-directed layout, which runs over several layout iterations).
  - A continuous layout may use a [worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) for layout calculations or it may run several layout iterations per call of [`requestAnimationFrame()`](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame).
  - Each visible iteration of a continuous layout may set [`nodes.positions()`](#nodes.positions).
- `stop()` : Stop the layout
  - This function is specified only for continuous layouts.

# Performance [](#performance)

## Background [](#performance/background)

You may notice that performance starts to degrade on graphs with large numbers of elements. This happens for several reasons:

- Performance is a function of graph size, so performance decreases as the number of elements increases.
- The rich visual styles that Cytoscape.js supports can be expensive. Only drawing circles and straight lines is cheap, but drawing complex graphs is less so.
- Edges are particularly expensive to render. Multigraphs become even more expensive with the need for bezier curve edges.
- The performance of rendering a (bitmap) canvas is a function of the area that it needs to render. As such, an increased pixel ratio (as in high density displays, like on the iPad) can decrease rendering performance.

## Optimisations [](#performance/optimisations)

You can get much better performance out of Cytoscape.js by tuning your options, in descending order of significance:

- **Use `cy.getElementById()`** : The [`cy.getElementById('foo')`](#cy.getElementById) function is the fastest way to get an element by ID. You can use `cy.$id('foo')` to type less. Searching by selector generally means you have to check each element in the collection, whereas getting by ID is much faster as a lookup table is used. The single ID selector (e.g. `cy.$('#foo')`) is optimised to also use the lookup table, but it does have the added cost of parsing.
- **Batch element modifications** : Use [`cy.batch()`](#core/graph-manipulation/cy.batch) to modify many elements at once.
- **Animations** : You will get better performance without animations. If using animations anyway:
  - [`eles.flashClass()`](#collection/style/eles.flashClass) is a cheaper alternative than a smooth animation.
  - Try to limit the number of concurrent animating elements.
  - When using transition animations in the style, make sure `transition-property` is defined only for states that you want to animate. If you have `transition-property` defined in a default state, the animation will try to run more often than if you limit it to particular states you actually want to animate.
- **Function style property values** : While convenient, function style property values can be expensive. Thus, it may be worthwhile to use caching if possible, such as by using the lodash [`_.memoize()`](https://lodash.com/docs#memoize) function. If your style property value is a simple passthrough or linear mapping, consider using `data()` or `mapData()` instead.
- **Labels** : Drawing labels is expensive.
  - If you can go without them or show them on tap/mouseover, you’ll get better performance.
  - Consider not having labels for edges.
  - Consider setting `min-zoomed-font-size` in your style so that when labels are small — and hard to read anyway — they are not rendered. When the labels are at least the size you set (i.e. the user zooms in), they will be visible.
  - Background and outlines increase the expense of rendering labels.
- **Simplify edge style** : Drawing edges can be expensive.
  - Set your edges `curve-style` to `haystack` in your stylesheet. Haystack edges are straight lines, which are much less expensive to render than `bezier` edges. This is the default edge style.
  - Use solid edges. Dotted and dashed edges are much more expensive to draw, so you will get increased performance by not using them.
  - Edge arrows are expensive to render, so consider not using them if they do not have any semantic meaning in your graph.
  - Opaque edges with arrows are more than twice as fast as semitransparent edges with arrows.
- **Simplify node style** : Certain styles for nodes can be expensive.
  - Background images are very expensive in certain cases. The most performant background images are non-repeating (`background-repeat: no-repeat`) and non-clipped (`background-clip: none`). For simple node shapes like squares or circles, you can use `background-fit` for scaling and preclip your images to simulate software clipping (e.g. with [Image Magick](https://imagemagick.org) so it’s automated). In lieu of preclipping, you could make clever use of PNGs with transparent backgrounds.
  - Node borders can be slightly expensive, so you can experiment with removing them to see if it makes a noticeable difference for your use case.
- **Avoid compound and edge selectors** : Compound selectors (e.g. `$node node`) and edge selectors (e.g. `$node -> node`) can be expensive because traversals are necessary.
- **Set a lower pixel ratio** : Because it is more expensive to render more pixels, you can set `pixelRatio` to `1` [in the initialisation options](#init-opts/pixelRatio) to increase performance for large graphs on high density displays. However, this makes the rendering less crisp.
- **Compound nodes** : [Compound nodes](#notation/compound-nodes) make style calculations and rendering more expensive. If your graph does not require compound nodes, you can improve performance by not using compound parent nodes.
- **Hide edges during interactivity** : Set `hideEdgesOnViewport` to `true` in your [initialisation options](#core/initialisation). This can make interactivity less expensive for very large graphs by hiding edges during pan, mouse wheel zoom, pinch-to-zoom, and node drag actions. This option makes a difference on only very, very large graphs.
- **Recycle large instances** : Large instances can use a lot of memory, mostly due to canvas use. Recyling an instance will help to keep your memory usage lower than calling `cy.destroy()`, because you won’t grow the heap as much and you won’t invoke the garbage collector as much.
- **Avoid many node overlays** : Overlays can not be cached. Limit the number of simultaneous nodes that have `overlay-opacity` with a non-zero value. The default stylesheet uses the overlay style only on the active element, which can only ever be one element at a time.
- **Use textured zoom & pan** : Set `textureOnViewport` to `true` in your [initialisation options](#core/initialisation). Rather than rerendering the entire scene, this makes a texture cache of the viewport at the start of pan and zoom operations, and manipulates that instead. Makes panning and zooming smoother for very large graphs. This option makes a difference on only very, very large graphs. The renderer has support for more general texture caching, and so `textureOnViewport` is only useful if you really need the absolute cheapest option.

<!--
## Source links

- [https://github.com/cytoscape/cytoscape.js](https://github.com/cytoscape/cytoscape.js)
- [https://blog.js.cytoscape.org](https://blog.js.cytoscape.org)
- [https://raw.githubusercontent.com/cytoscape/cytoscape.js/master/LICENSE](https://raw.githubusercontent.com/cytoscape/cytoscape.js/master/LICENSE)
- [https://www.npmjs.com/package/cytoscape](https://www.npmjs.com/package/cytoscape)
- [https://zenodo.org/badge/latestdoi/2255947](https://zenodo.org/badge/latestdoi/2255947)
- [https://github.com/cytoscape/cytoscape.js/actions/workflows/tests.yml](https://github.com/cytoscape/cytoscape.js/actions/workflows/tests.yml)
- [https://cloudflare.com](https://cloudflare.com)
- [University of Toronto](https://utoronto.ca)
- [2016](https://academic.oup.com/bioinformatics/article/32/2/309/1744007)
- [2023](https://academic.oup.com/bioinformatics/article/39/1/btad031/6988031)
- [Max Franz](https://github.com/maxkfranz)
- [Christian Lopes](https://github.com/chrtannus)
- [Dylan Fong](https://github.com/d2fong)
- [Mike Kucera](https://github.com/mikekucera)
- [Gary Bader](https://baderlab.org)
- [demos/fcose-gene](demos/fcose-gene)
- [FCOSE gene-gene graph](https://github.com/cytoscape/cytoscape.js/tree/master/documentation/demos/fcose-gene)
- [demos/tokyo-railways](demos/tokyo-railways)
- [Tokyo railways](https://github.com/cytoscape/cytoscape.js/tree/master/documentation/demos/tokyo-railways)
- [http://wineandcheesemap.com](http://wineandcheesemap.com)
- [Wine & cheese](https://github.com/cytoscape/wineandcheesemap)
- [https://PathwayCommons.github.io/cytoscape-sbgn-stylesheet](https://PathwayCommons.github.io/cytoscape-sbgn-stylesheet)
- [SBGN stylesheet](https://github.com/PathwayCommons/cytoscape-sbgn-stylesheet)
- [https://cytoscape.github.io/cytoscape.js-popper](https://cytoscape.github.io/cytoscape.js-popper)
- [Popper.js extension](https://github.com/cytoscape/cytoscape.js-popper)
- [https://cytoscape.github.io/cytoscape.js-popper/demo-tippy.html](https://cytoscape.github.io/cytoscape.js-popper/demo-tippy.html)
- [https://cytoscape.github.io/cytoscape.js-automove](https://cytoscape.github.io/cytoscape.js-automove)
- [Automove extension](https://github.com/cytoscape/cytoscape.js-automove)
- [https://cytoscape.github.io/cytoscape.js-cxtmenu](https://cytoscape.github.io/cytoscape.js-cxtmenu)
- [Cxtmenu extension](https://github.com/cytoscape/cytoscape.js-cxtmenu)
- [https://cytoscape.org/cytoscape.js-edgehandles/demo-snap.html](https://cytoscape.org/cytoscape.js-edgehandles/demo-snap.html)
- [Edgehandles extension](https://github.com/cytoscape/cytoscape.js-edgehandles)
- [https://cytoscape.github.io/cytoscape.js-compound-drag-and-drop](https://cytoscape.github.io/cytoscape.js-compound-drag-and-drop)
- [Compound drag-and-drop extension](https://github.com/cytoscape/cytoscape.js-compound-drag-and-drop)
- [demos/circle-layout](demos/circle-layout)
- [Circle layout](https://github.com/cytoscape/cytoscape.js/tree/master/documentation/demos/circle-layout)
- [demos/concentric-layout](demos/concentric-layout)
- [Concentric layout](https://github.com/cytoscape/cytoscape.js/tree/master/documentation/demos/concentric-layout)
- [https://ivis-at-bilkent.github.io/cytoscape.js-avsdf/demo.html](https://ivis-at-bilkent.github.io/cytoscape.js-avsdf/demo.html)
- [AVSDF layout](https://github.com/iVis-at-Bilkent/cytoscape.js-avsdf)
- [https://ivis-at-bilkent.github.io/cytoscape.js-cise/demo/demo.html](https://ivis-at-bilkent.github.io/cytoscape.js-cise/demo/demo.html)
- [CiSE layout](https://github.com/iVis-at-Bilkent/cytoscape.js-cise)
- [demos/grid-layout](demos/grid-layout)
- [Grid layout](https://github.com/cytoscape/cytoscape.js/tree/master/documentation/demos/grid-layout)
- [demos/cose-layout](demos/cose-layout)
- [CoSE layout](https://github.com/cytoscape/cytoscape.js/tree/master/documentation/demos/cose-layout)
- [https://cytoscape.github.io/cytoscape.js-cose-bilkent](https://cytoscape.github.io/cytoscape.js-cose-bilkent)
- [CoSE Bilkent layout](https://github.com/cytoscape/cytoscape.js-cose-bilkent)
- [https://cytoscape.github.io/cytoscape.js-cose-bilkent/demo-compound.html](https://cytoscape.github.io/cytoscape.js-cose-bilkent/demo-compound.html)
- [https://ivis-at-bilkent.github.io/cytoscape.js-fcose/demo/demo.html](https://ivis-at-bilkent.github.io/cytoscape.js-fcose/demo/demo.html)
- [fCoSE layout](https://github.com/iVis-at-Bilkent/cytoscape.js-fcose)
- [https://ivis-at-bilkent.github.io/cytoscape.js-fcose/demo/demo-compound.html](https://ivis-at-bilkent.github.io/cytoscape.js-fcose/demo/demo-compound.html)
- [https://ivis-at-bilkent.github.io/cytoscape.js-fcose/demo/demo-constraint.html](https://ivis-at-bilkent.github.io/cytoscape.js-fcose/demo/demo-constraint.html)
- [https://cytoscape.github.io/cytoscape.js-cola](https://cytoscape.github.io/cytoscape.js-cola)
- [Cola layout](https://github.com/cytoscape/cytoscape.js-cola)
- [https://cytoscape.github.io/cytoscape.js-cola/demo-compound.html](https://cytoscape.github.io/cytoscape.js-cola/demo-compound.html)
- [https://cytoscape.github.io/cytoscape.js-elk/?demo=layered](https://cytoscape.github.io/cytoscape.js-elk/?demo=layered)
- [ELK layout](https://github.com/cytoscape/cytoscape.js-elk)
- [https://cytoscape.github.io/cytoscape.js-dagre](https://cytoscape.github.io/cytoscape.js-dagre)
- [Dagre layout](https://github.com/cytoscape/cytoscape.js-dagre)
- [https://cytoscape.github.io/cytoscape.js-klay](https://cytoscape.github.io/cytoscape.js-klay)
- [Klay layout](https://github.com/cytoscape/cytoscape.js-klay)
- [demos/images-breadthfirst-layout](demos/images-breadthfirst-layout)
- [Breadthfirst layout & images](https://github.com/cytoscape/cytoscape.js/tree/master/documentation/demos/images-breadthfirst-layout)
- [demos/animated-bfs](demos/animated-bfs)
- [Animated BFS](https://github.com/cytoscape/cytoscape.js/tree/master/documentation/demos/animated-bfs)
- [demos/node-types](demos/node-types)
- [Node types](https://github.com/cytoscape/cytoscape.js/tree/master/documentation/demos/node-types)
- [demos/edge-types](demos/edge-types)
- [Edge types](https://github.com/cytoscape/cytoscape.js/tree/master/documentation/demos/edge-types)
- [demos/radius-types](demos/radius-types)
- [Radius types](https://github.com/cytoscape/cytoscape.js/tree/master/documentation/demos/radius-types)
- [demos/edge-arrows](demos/edge-arrows)
- [Edge arrow types](https://github.com/cytoscape/cytoscape.js/tree/master/documentation/demos/edge-arrows)
- [demos/labels](demos/labels)
- [Labels](https://github.com/cytoscape/cytoscape.js/tree/master/documentation/demos/labels)
- [demos/compound-nodes](demos/compound-nodes)
- [Compound nodes](https://github.com/cytoscape/cytoscape.js/tree/master/documentation/demos/compound-nodes)
- [demos/linkout-example](demos/linkout-example)
- [Linkout example](https://github.com/cytoscape/cytoscape.js/tree/master/documentation/demos/linkout-example)
- [caniuse](https://caniuse.com/#feat=es5)
- [R language](https://www.r-project.org/)
- [RCyjs](http://www.bioconductor.org/packages/release/bioc/html/RCyjs.html)
- [Cytosnap](https://github.com/cytoscape/cytosnap)
- [Zenodo](https://doi.org/10.5281/zenodo.831800)
- [Amazon](http://amazon.com)
- [Apache Software Foundation](https://apache.org)
- [Cisco](https://www.cisco.com)
- [Elastic](https://www.elastic.co/)
- [Fujitsu](https://www.fujitsu.com)
- [GitHub](https://github.com)
- [Google](https://google.com)
- [Hewlett Packard Enterprise](https://www.hpe.com)
- [IBM](https://www.ibm.com)
- [Linux Foundation](https://www.linuxfoundation.org)
- [Meta](https://meta.com)
- [Microsoft](https://microsoft.com)
- [MongoDB](https://www.mongodb.com)
- [Puppet](https://puppet.com)
- [RedHat](https://www.redhat.com)
- [Tencent](https://www.tencent.com/en-us/)
- [Uber](https://uber.com)
- [DARPA](http://www.darpa.mil)
- [GCHQ](https://www.gchq.gov.uk/)
- [NHS](https://www.nhs.uk)
- [NOAA](https://www.noaa.gov)
- [NSA](https://www.nsa.gov/)
- [APID](http://cicblade.dep.usal.es:8080/APID/init.action)
- [AraQTL](https://www.bioinformatics.nl/AraQTL/)
- [Arches](https://www.archesproject.org)
- [BioCyc](http://biocyc.org/)
- [BioGRID](http://thebiogrid.org/)
- [BioPlex](https://bioplex.hms.harvard.edu/)
- [cBioPortal](https://www.cbioportal.org)
- [ConsensusPathDB](http://cpdb.molgen.mpg.de/)
- [dSysMap](https://dsysmap.irbbarcelona.org)
- [Elsevier](https://www.elsevier.com)
- [EnrichmentMap](https://enrichmentmap.org)
- [Ensembl](https://www.ensembl.org)
- [FlyBase](https://flybase.org/)
- [Galaxy](https://galaxyproject.org)
- [GeneMANIA](http://genemania.org)
- [GraphSpace](http://graphspace.org)
- [Intermine](http://intermine.org/)
- [MetagenomeScope](https://marbl.github.io/MetagenomeScope/)
- [NDEx](http://www.ndexbio.org/)
- [Newt](https://newteditor.org/)
- [OpenBio](https://www.openbio.eu)
- [Pathway Commons](http://www.pathwaycommons.org)
- [PINet](http://pinet.tsl.ac.uk)
- [Plotly (Dash)](https://plotly.com)
- [QuantStack (Jupyter)](https://quantstack.net)
- [STOCKS](https://gbcs.embl.de/portal/tiki-index.php?page=STOCKS)
- [SynBioHub](https://synbiohub.org)
- [The Gene Ontology Consortium](http://geneontology.org)
- [WormBase](https://wormbase.org/)
- [Aalto University](https://www.aalto.fi/)
- [Albert Ludwig University of Freiburg](https://uni-freiburg.de/en/)
- [Barcelona Supercomputing Center](https://www.bsc.es)
- [BBC](https://www.bbc.com)
- [Ben-Gurion University of the Negev](http://bgu.ac.il/)
- [Berkeley Lab](https://www.lbl.gov)
- [Broad Institute](https://www.broadinstitute.org)
- [Carnegie Mellon](https://www.cmu.edu)
- [Earlham Institute](https://www.earlham.ac.uk)
- [École Polytechnique Fédérale de Lausanne (EPFL)](https://www.epfl.ch)
- [Erasmus Medical Center](https://www.erasmusmc.nl/)
- [European Molecular Biology Laboratory (EMBL)](https://www.embl.org/)
- [FAIRplus](https://fairplus-project.eu)
- [Georgia Institute of Technology](https://www.gatech.edu)
- [Getty](https://www.getty.edu)
- [Harvard University](https://www.harvard.edu)
- [HOPR](https://hoprnet.org)
- [Howard Hughes Medical Institute](https://www.hhmi.org/)
- [Idaho National Laboratory](https://inl.gov)
- [Indiana University](https://www.iu.edu)
- [INRAe](https://www.inrae.fr)
- [Institut Curie](https://institut-curie.org)
- [Institute for Systems Biology](https://isbscience.org)
- [IntAct](https://ebi.ac.uk/intact)
- [International Rice Research Institute](https://www.irri.org)
- [Johns Hopkins University](https://www.jhu.edu)
- [Lerner Research Institute, Cleveland Clinic](https://www.lerner.ccf.org)
- [Maastricht University](https://www.maastrichtuniversity.nl)
- [Max Plank Institute](https://mpg.de)
- [Nanyang Technological University](https://www.ntu.edu.sg)
- [Network of European Bioimage Analysts](http://eubias.org/NEUBIAS)
- [Norwich Research Park](https://www.norwichresearchpark.com)
- [Observational Health Data Sciences and Informatics (OHDSI)](http://www.ohdsi.org/)
- [Open Ownership](https://www.openownership.org/)
- [Oregon Health and Science University](https://www.ohsu.edu)
- [Paris Sciences et Lettres University](https://psl.eu/en)
- [Penn State University](https://www.psu.edu)
- [Reactome](https://reactome.org)
- [Research Institute for Fragrance Materials](https://www.rifm.org)
- [Sanger Institute](http://www.sanger.ac.uk/)
- [Spanish National Bioinformatics Institute](https://inb-elixir.es/)
- [SRI International](https://www.sri.com)
- [Stanford University](https://www.stanford.edu)
- [The Foundation for Research and Technology – Hellas](https://www.forth.gr)
- [The Molecular Science Software Institute](http://molssi.org/)
- [Tsinghua University](https://www.tsinghua.edu.cn)
- [UNIST](https://www.unist.ac.kr)
- [Università degli Studi di Milano - Bicocca](https://www.unimib.it)
- [University of Alabama](https://www.ua.edu)
- [University of Barcelona](https://www.ub.edu)
- [University of California, Berkeley](https://www.berkeley.edu)
- [University of California, San Diego](http://www.ucsd.edu)
- [University of California, San Francisco](https://www.ucsf.edu)
- [University of Cambridge](http://www.cam.ac.uk/)
- [University of Electronic Science and Technology of China](http://en.uestc.edu.cn/)
- [University of Heidelberg](https://www.uni-heidelberg.de)
- [University of Helsinki](https://www.helsinki.fi)
- [University of Jyväskylä](https://www.jyu.fi)
- [University of Leipzig](http://uni-leipzig.de)
- [University of Mannheim](https://www.uni-mannheim.de/en/)
- [University of Maryland](https://umd.edu/)
- [University of Utah](https://www.utah.edu)
- [Vanderbilt University](https://www.vanderbilt.edu)
- [Virginia Tech](http://www.vt.edu)
- [Wageningen University and Research](https://www.wur.nl)
- [World Monuments Fund](https://www.wmf.org)
- [Mermaid](https://mermaid.js.org)
- [Apache AGE](https://age.apache.org)
- [AppZen](https://www.appzen.com/)
- [Apromore](https://apromore.com)
- [Aras](https://www.aras.com/en)
- [ArcadeDB](https://arcadedb.com/)
- [Athenz](https://www.athenz.io)
- [AWS Perspective](https://github.com/awslabs/aws-perspective)
- [Azure Bicep](https://docs.microsoft.com/en-us/azure/azure-resource-manager/bicep/overview)
- [Bell Media](https://www.bellmedia.ca/)
- [BeneficialOwnership](https://www.beneficialownership.co.uk)
- [BlueSailCRM](https://www.bluesailcrm.com)
- [Budō Lineage Tree, The](https://budotree.judoc.org)
- [BugBug](https://bugbug.io)
- [Cadence](https://cadenceworkflow.io)
- [CanSyL](https://crossbar.kansil.org)
- [Chaos Mesh](https://chaos-mesh.org)
- [Classcraft](https://www.classcraft.com)
- [CompanyTracker](https://www.companytracker.be)
- [CyberSift](https://www.cybersift.io)
- [Cylc](https://cylc.github.io)
- [Dendron](https://www.dendron.so)
- [DGB Technologies](https://www.dgbtek.com)
- [Dockflow](https://dockflow.com)
- [DroneDeploy](https://www.dronedeploy.com)
- [DynaLearn](https://dynalearn.nl)
- [Flowchart.fun](https://flowchart.fun/)
- [Foxglove](https://foxglove.dev)
- [Ganister](https://www.ganister.eu)
- [Global CTO Forum](https://globalctoforum.org)
- [Graphlytic](https://graphlytic.biz)
- [GraphWalker](http://graphwalker.github.io)
- [GREZI](https://grezi.fr)
- [HackerTarget](https://hackertarget.com)
- [HanziGraph](https://hanzigraph.com/)
- [How-4](https://www.how-4.com)
- [ICSI Haystack Panopticon, The](https://haystack.mobi/panopticon/)
- [InfoTrack](https://www.infotrack.com.au)
- [Intercax](https://intercax.com)
- [InterpretML](https://interpret.ml)
- [IPFS](https://ipfs.io)
- [libp2p](https://libp2p.io/)
- [Jiva.ai](https://www.jiva.ai)
- [JsDelivr](https://www.jsdelivr.com)
- [Juggl](https://juggl.io)
- [Kanji Map, The](https://thekanjimap.com)
- [Kausal Paths](https://kausal.tech)
- [Kiali](https://kiali.io)
- [Kibana](https://www.elastic.co/kibana)
- [KPN](https://www.kpn.com)
- [KuKaKo](https://github.com/OSC-JYU/KuKaKo)
- [Layer5](https://layer5.io)
- [LearnAwesome](https://learnawesome.org)
- [LudoMentrix](https://www.ludomentrix.nl/en-GB/)
- [Machine2Learn](https://machine2learn.com)
- [Manifold Finance](https://www.manifoldfinance.com)
- [Mars](https://docs.pymars.org/en/latest/)
- [Meshery](https://meshery.io)
- [Musicalized](https://en.wesound.academy)
- [Network Weathermap](https://github.com/6illes/weathermap)
- [New Relic](https://newrelic.com)
- [nFlows](https://www.nflows.com)
- [NodeLand](https://nodeland.io/)
- [Nx](https://nx.dev)
- [Obsidian](https://obsidian.md)
- [Onepanel](https://www.onepanel.ai)
- [OpenDialog](https://opendialog.ai)
- [Orchidex](https://orchidex.org)
- [Panaya](https://www.panaya.com)
- [Pinpoint](https://pinpoint-apm.gitbook.io/pinpoint/)
- [RecallGraph](https://recallgraph.tech)
- [Roam](https://roamresearch.com)
- [Signifyd](https://www.signifyd.com)
- [SQL Frames](https://sqlframes.com)
- [Steemit](https://steemit.com)
- [stixview](https://github.com/traut/stixview)
- [T-Rank](https://trank.no)
- [TangleGuard](https://tangleguard.com/)
- [ThreatConnect](https://threatconnect.com)
- [ThreatCrowd](https://www.threatcrowd.org)
- [TopoViewer](https://github.com/asadarafat/topoViewer)
- [Underlay](https://www.underlay.org)
- [VAC](https://vac.dev)
- [wanderer.ai](https://wanderer.ai)
- [Wisecube AI](https://www.wisecube.ai/orpheus/)
- [Yaveon](https://www.yaveon.com/en/)
- [Zubir Said Knowledge Graph](https://zubirsaid.sg)
- [Let us know that you’re using Cytoscape.js.](https://github.com/cytoscape/cytoscape.js/issues/914)
- [graph theory](http://en.wikipedia.org/wiki/Graph_theory)
- [Donnelly Centre](http://thedonnellycentre.utoronto.ca)
- [University of Toronto](http://www.utoronto.ca/)
- [Cytoscape Web](http://cytoscapeweb.cytoscape.org/)
- [3.34.4](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.34.4+is%3Aclosed)
- [3.34.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.34.3+is%3Aclosed)
- [3.34.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.34.2+is%3Aclosed)
- [3.34.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.34.1+is%3Aclosed)
- [3.34.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.34.0+is%3Aclosed)
- [3.33.4](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.33.4+is%3Aclosed)
- [3.33.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.33.3+is%3Aclosed)
- [3.33.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.33.2+is%3Aclosed)
- [3.33.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.33.1+is%3Aclosed)
- [3.33.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.33.0+is%3Aclosed)
- [3.32.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.32.2+is%3Aclosed)
- [3.32.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.32.1+is%3Aclosed)
- [3.32.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.32.0+is%3Aclosed)
- [3.31.4](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.31.4+is%3Aclosed)
- [3.31.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.31.3+is%3Aclosed)
- [3.31.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.31.2+is%3Aclosed)
- [3.31.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.31.1+is%3Aclosed)
- [3.31.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.31.0+is%3Aclosed)
- [3.30.4](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.30.4+is%3Aclosed)
- [3.30.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.30.3+is%3Aclosed)
- [3.30.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.30.2+is%3Aclosed)
- [3.30.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.30.1+is%3Aclosed)
- [3.30.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.30.0+is%3Aclosed)
- [3.29.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.29.3+is%3Aclosed)
- [3.29.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.29.2+is%3Aclosed)
- [3.29.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.29.1+is%3Aclosed)
- [3.29.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.29.0+is%3Aclosed)
- [3.28.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.28.1+is%3Aclosed)
- [3.28.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.28.0+is%3Aclosed)
- [3.27.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.27.2+is%3Aclosed)
- [3.27.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.27.1+is%3Aclosed)
- [3.27.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.27.0+is%3Aclosed)
- [3.26.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.26.2+is%3Aclosed)
- [3.26.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.26.1+is%3Aclosed)
- [3.26.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.26.0+is%3Aclosed)
- [3.25.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.25.2+is%3Aclosed)
- [3.25.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.25.1+is%3Aclosed)
- [3.25.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.25.0+is%3Aclosed)
- [3.24.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.24.1+is%3Aclosed)
- [3.24.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.24.0+is%3Aclosed)
- [3.23.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.23.1+is%3Aclosed)
- [3.23.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.23.0+is%3Aclosed)
- [3.22.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.22.1+is%3Aclosed)
- [3.22.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.22.0+is%3Aclosed)
- [3.21.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.21.3+is%3Aclosed)
- [3.21.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.21.2+is%3Aclosed)
- [3.21.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.21.1+is%3Aclosed)
- [3.21.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.21.0+is%3Aclosed)
- [3.20.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.20.3+is%3Aclosed)
- [3.20.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.20.2+is%3Aclosed)
- [3.20.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.20.1+is%3Aclosed)
- [3.20.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.20.0+is%3Aclosed)
- [3.19.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.19.1+is%3Aclosed)
- [3.19.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.19.0+is%3Aclosed)
- [3.18.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.18.2+is%3Aclosed)
- [3.18.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.18.1+is%3Aclosed)
- [3.18.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.18.0+is%3Aclosed)
- [3.17.4](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.17.4+is%3Aclosed)
- [3.17.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.17.3+is%3Aclosed)
- [3.17.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.17.2+is%3Aclosed)
- [3.17.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.17.1+is%3Aclosed)
- [3.17.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.17.0+is%3Aclosed)
- [3.16.5](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.16.5+is%3Aclosed)
- [3.16.4](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.16.4+is%3Aclosed)
- [3.16.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.16.3+is%3Aclosed)
- [3.16.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.16.2+is%3Aclosed)
- [3.16.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.16.1+is%3Aclosed)
- [3.16.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.16.0+is%3Aclosed)
- [3.15.5](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.15.5+is%3Aclosed)
- [3.15.4](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.15.4+is%3Aclosed)
- [3.15.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.15.3+is%3Aclosed)
- [3.15.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.15.2+is%3Aclosed)
- [3.15.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.15.1+is%3Aclosed)
- [3.15.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.15.0+is%3Aclosed)
- [3.14.4](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.14.4+is%3Aclosed)
- [3.14.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.14.3+is%3Aclosed)
- [3.14.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.14.2+is%3Aclosed)
- [3.14.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.14.1+is%3Aclosed)
- [3.14.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.14.0+is%3Aclosed)
- [3.13.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.13.3+is%3Aclosed)
- [3.13.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.13.2+is%3Aclosed)
- [3.13.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.13.1+is%3Aclosed)
- [3.13.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.13.0+is%3Aclosed)
- [3.12.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.12.3+is%3Aclosed)
- [3.12.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.12.2+is%3Aclosed)
- [3.12.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.12.1+is%3Aclosed)
- [3.12.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.12.0+is%3Aclosed)
- [3.11.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.11.2+is%3Aclosed)
- [3.11.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.11.1+is%3Aclosed)
- [3.11.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.11.0+is%3Aclosed)
- [3.10.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.10.2+is%3Aclosed)
- [3.10.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.10.1+is%3Aclosed)
- [3.10.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.10.0+is%3Aclosed)
- [3.9.4](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.9.4+is%3Aclosed)
- [3.9.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.9.3+is%3Aclosed)
- [3.9.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.9.2+is%3Aclosed)
- [3.9.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.9.1+is%3Aclosed)
- [3.9.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.9.0+is%3Aclosed)
- [3.8.5](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.8.5+is%3Aclosed)
- [3.8.4](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.8.4+is%3Aclosed)
- [3.8.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.8.3+is%3Aclosed)
- [3.8.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.8.2+is%3Aclosed)
- [3.8.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.8.1+is%3Aclosed)
- [3.8.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.8.0+is%3Aclosed)
- [3.7.6](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.7.6+is%3Aclosed)
- [3.7.5](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.7.5+is%3Aclosed)
- [3.7.4](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.7.4+is%3Aclosed)
- [3.7.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.7.3+is%3Aclosed)
- [3.7.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.7.2+is%3Aclosed)
- [3.7.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.7.1+is%3Aclosed)
- [3.7.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.7.0+is%3Aclosed)
- [3.6.6](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.6.6+is%3Aclosed)
- [3.6.5](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.6.5+is%3Aclosed)
- [3.6.4](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.6.4+is%3Aclosed)
- [3.6.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.6.3+is%3Aclosed)
- [3.6.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.6.2+is%3Aclosed)
- [3.6.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.6.1+is%3Aclosed)
- [3.6.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.6.0+is%3Aclosed)
- [3.5.9](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.5.9+is%3Aclosed)
- [3.5.8](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.5.8+is%3Aclosed)
- [3.5.7](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.5.7+is%3Aclosed)
- [3.5.6](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.5.6+is%3Aclosed)
- [3.5.5](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.5.5+is%3Aclosed)
- [3.5.4](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.5.4+is%3Aclosed)
- [3.5.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.5.3+is%3Aclosed)
- [3.5.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.5.2+is%3Aclosed)
- [3.5.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.5.1+is%3Aclosed)
- [3.5.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.5.0+is%3Aclosed)
- [3.4.9](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.4.9+is%3Aclosed)
- [3.4.8](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.4.8+is%3Aclosed)
- [3.4.7](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.4.7+is%3Aclosed)
- [3.4.6](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.4.6+is%3Aclosed)
- [3.4.5](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.4.5+is%3Aclosed)
- [3.4.4](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.4.4+is%3Aclosed)
- [3.4.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.4.3+is%3Aclosed)
- [3.4.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.4.2+is%3Aclosed)
- [3.4.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.4.1+is%3Aclosed)
- [3.4.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.4.0+is%3Aclosed)
- [3.3.6](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.3.6+is%3Aclosed)
- [3.3.5](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.3.5+is%3Aclosed)
- [3.3.4](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.3.4+is%3Aclosed)
- [3.3.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.3.3+is%3Aclosed)
- [3.3.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.3.2+is%3Aclosed)
- [3.3.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.3.1+is%3Aclosed)
- [3.3.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.3.0+is%3Aclosed)
- [3.2.22](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.2.22+is%3Aclosed)
- [3.2.21](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.2.21+is%3Aclosed)
- [3.2.20](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.2.20+is%3Aclosed)
- [3.2.19](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.2.19+is%3Aclosed)
- [3.2.18](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.2.18+is%3Aclosed)
- [3.2.17](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.2.17+is%3Aclosed)
- [3.2.16](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.2.16+is%3Aclosed)
- [3.2.15](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.2.15+is%3Aclosed)
- [3.2.14](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.2.14+is%3Aclosed)
- [3.2.13](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.2.13+is%3Aclosed)
- [3.2.12](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.2.12+is%3Aclosed)
- [3.2.11](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.2.11+is%3Aclosed)
- [3.2.10](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.2.10+is%3Aclosed)
- [3.2.9](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.2.9+is%3Aclosed)
- [3.2.8](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.2.8+is%3Aclosed)
- [3.2.7](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.2.7+is%3Aclosed)
- [3.2.6](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.2.6+is%3Aclosed)
- [3.2.5](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.2.5+is%3Aclosed)
- [3.2.4](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.2.4+is%3Aclosed)
- [3.2.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.2.3+is%3Aclosed)
- [3.2.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.2.2+is%3Aclosed)
- [3.2.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.2.1+is%3Aclosed)
- [3.2.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.2.0+is%3Aclosed)
- [3.1.5](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.1.5+is%3Aclosed)
- [3.1.4](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.1.4+is%3Aclosed)
- [3.1.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.1.3+is%3Aclosed)
- [3.1.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.1.2+is%3Aclosed)
- [3.1.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.1.1+is%3Aclosed)
- [3.1.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.1.0+is%3Aclosed)
- [3.0.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.0.1+is%3Aclosed)
- [3.0.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A3.0.0+is%3Aclosed)
- [2.7.29](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.29+is%3Aclosed)
- [2.7.28](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.28+is%3Aclosed)
- [2.7.27](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.27+is%3Aclosed)
- [2.7.26](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.26+is%3Aclosed)
- [2.7.25](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.25+is%3Aclosed)
- [2.7.24](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.24+is%3Aclosed)
- [2.7.23](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.23+is%3Aclosed)
- [2.7.22](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.22+is%3Aclosed)
- [2.7.21](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.21+is%3Aclosed)
- [2.7.20](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.20+is%3Aclosed)
- [2.7.19](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.19+is%3Aclosed)
- [2.7.18](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.18+is%3Aclosed)
- [2.7.17](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.17+is%3Aclosed)
- [2.7.16](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.16+is%3Aclosed)
- [2.7.15](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.15+is%3Aclosed)
- [2.7.14](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.14+is%3Aclosed)
- [2.7.13](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.13+is%3Aclosed)
- [2.7.12](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.12+is%3Aclosed)
- [2.7.11](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.11+is%3Aclosed)
- [2.7.10](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.10+is%3Aclosed)
- [2.7.9](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.9+is%3Aclosed)
- [2.7.8](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.8+is%3Aclosed)
- [2.7.7](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.7+is%3Aclosed)
- [2.7.6](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.6+is%3Aclosed)
- [2.7.5](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.5+is%3Aclosed)
- [2.7.4](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.4+is%3Aclosed)
- [2.7.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.3+is%3Aclosed)
- [2.7.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.2+is%3Aclosed)
- [2.7.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.1+is%3Aclosed)
- [2.7.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.7.0+is%3Aclosed)
- [2.6.12](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.6.12+is%3Aclosed)
- [2.6.11](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.6.11+is%3Aclosed)
- [2.6.10](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.6.10+is%3Aclosed)
- [2.6.9](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.6.9+is%3Aclosed)
- [2.6.8](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.6.8+is%3Aclosed)
- [2.6.7](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.6.7+is%3Aclosed)
- [2.6.6](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.6.6+is%3Aclosed)
- [2.6.5](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.6.5+is%3Aclosed)
- [2.6.4](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.6.4+is%3Aclosed)
- [2.6.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.6.3+is%3Aclosed)
- [2.6.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.6.2+is%3Aclosed)
- [2.6.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.6.1+is%3Aclosed)
- [2.6.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.6.0+is%3Aclosed)
- [2.5.5](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.5.5+is%3Aclosed)
- [2.5.4](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.5.4+is%3Aclosed)
- [2.5.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.5.3+is%3Aclosed)
- [2.5.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.5.2+is%3Aclosed)
- [2.5.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.5.1+is%3Aclosed)
- [2.5.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.5.0+is%3Aclosed)
- [2.4.9](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.4.9+is%3Aclosed)
- [2.4.8](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.4.8+is%3Aclosed)
- [2.4.7](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.4.7+is%3Aclosed)
- [2.4.6](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.4.6+is%3Aclosed)
- [2.4.5](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.4.5+is%3Aclosed)
- [2.4.4](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.4.4+is%3Aclosed)
- [2.4.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.4.3+is%3Aclosed)
- [2.4.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.4.2+is%3Aclosed)
- [2.4.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.4.1+is%3Aclosed)
- [2.4.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.4.0+is%3Aclosed)
- [2.3.16](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.3.16+is%3Aclosed)
- [2.3.15](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.3.15+is%3Aclosed)
- [2.3.14](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.3.14+is%3Aclosed)
- [2.3.13](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.3.13+is%3Aclosed)
- [2.3.11](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.3.11+is%3Aclosed)
- [2.3.10](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.3.10+is%3Aclosed)
- [2.3.9](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.3.9+is%3Aclosed)
- [2.3.8](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.3.8+is%3Aclosed)
- [2.3.7](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.3.7+is%3Aclosed)
- [2.3.6](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.3.6+is%3Aclosed)
- [2.3.5](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.3.5+is%3Aclosed)
- [2.3.4](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.3.4+is%3Aclosed)
- [2.3.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.3.3+is%3Aclosed)
- [2.3.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.3.1+is%3Aclosed)
- [2.3.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.3.0+is%3Aclosed)
- [2.2.14](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.2.14+is%3Aclosed)
- [2.2.13](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.2.13+is%3Aclosed)
- [2.2.12](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.2.12+is%3Aclosed)
- [2.2.11](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.2.11+is%3Aclosed)
- [2.2.10](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.2.10+is%3Aclosed)
- [2.2.9](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.2.9+is%3Aclosed)
- [2.2.8](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.2.8+is%3Aclosed)
- [2.2.7](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.2.7+is%3Aclosed)
- [2.2.6](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.2.6+is%3Aclosed)
- [2.2.5](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.2.5+is%3Aclosed)
- [2.2.4](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.2.4+is%3Aclosed)
- [2.2.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.2.3+is%3Aclosed)
- [2.2.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.2.2+is%3Aclosed)
- [2.2.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.2.1+is%3Aclosed)
- [2.2.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.2.0+is%3Aclosed)
- [2.1.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.1.1+is%3Aclosed)
- [2.1.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.1.0+is%3Aclosed)
- [2.0.5](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.0.5+is%3Aclosed)
- [2.0.4](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.0.4+is%3Aclosed)
- [2.0.3](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.0.3+is%3Aclosed)
- [2.0.2](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.0.2+is%3Aclosed)
- [2.0.1](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.0.1+is%3Aclosed)
- [2.0.0](https://github.com/cytoscape/cytoscape.js/issues?q=milestone%3A2.0.0+is%3Aclosed)
- [Bioinformatics (2016) 32 (2): 309-311 first published online September 28, 2015 doi:10.1093/bioinfor](http://bioinformatics.oxfordjournals.org/content/32/2/309)
- [PDF](http://bioinformatics.oxfordjournals.org/content/32/2/309.full.pdf)
- [PubMed abstract for the original 2016 article](http://www.ncbi.nlm.nih.gov/pubmed/26415722)
- [PubMed abstract for the 2023 update article](https://pubmed.ncbi.nlm.nih.gov/36645249)
- [ISB](http://www.systemsbiology.org)
- [MSKCC](http://cbio.mskcc.org)
- [Pasteur](http://www.pasteur.fr)
- [Agilent](http://www.agilent.com/)
- [UCSF](http://www.ucsf.edu/)
- [Unilever](http://www.unilever.com)
- [Toronto](http://www.utoronto.ca)
- [NCIBI](http://portal.ncibi.org/gateway/index.html)
- [NRNB](http://nrnb.org)
- [feature requests](https://github.com/cytoscape/cytoscape.js/issues/new)
- [pull requests](https://github.com/cytoscape/cytoscape.js/blob/master/CONTRIBUTING.md)
- [import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import)
- [ES6](https://www.w3schools.com/js/js_es6.asp)
- [CDN](https://en.wikipedia.org/wiki/Content_delivery_network)
- [CDNJS](https://cdnjs.com/libraries/cytoscape)
- [jsDelivr](https://www.jsdelivr.com/package/npm/cytoscape?path=dist)
- [Unpkg](https://unpkg.com/cytoscape/dist/)
- [cytoscape/dist/](https://github.com/cytoscape/cytoscape.js/tree/master/dist)
- [UMD](https://github.com/umdjs/umd)
- [ESM](https://nodejs.org/api/esm.html#introduction)
- [CJS](https://nodejs.org/api/modules.html#modules-commonjs-modules)
- [Node.js](https://en.wikipedia.org/wiki/Node.js)
- [Webpack](https://webpack.js.org/)
- [esm](https://www.npmjs.com/package/esm)
- [AMD](https://en.wikipedia.org/wiki/Asynchronous_module_definition)
- [Require.js](https://requirejs.org/)
- [core-js](https://github.com/zloirock/core-js)
- [post your question to Stackoverflow](http://stackoverflow.com/questions/ask?tags=cytoscape.js)
- [iteration protocols](https://exploringjs.com/es6/ch_iteration.html)
- [quadratic bezier curve](https://en.wikipedia.org/wiki/B%C3%A9zier_curve#Quadratic_B%C3%A9zier_curves)
- [breadth-first search](https://en.wikipedia.org/wiki/Breadth-first_search)
- [depth-first search](https://en.wikipedia.org/wiki/Depth-first_search)
- [Dijkstra’s](https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm)
- [A*](https://en.wikipedia.org/wiki/A*_search_algorithm)
- [Floyd-Warshall](https://en.wikipedia.org/wiki/Floyd%E2%80%93Warshall_algorithm)
- [Bellman-Ford](https://en.wikipedia.org/wiki/Bellman%E2%80%93Ford_algorithm)
- [Hierholzer](https://en.wikipedia.org/wiki/Eulerian_path#Hierholzer's_algorithm)
- [Kruskal’s](https://en.wikipedia.org/wiki/Kruskal%27s_algorithm)
- [Karger-Stein](https://en.wikipedia.org/wiki/Karger%27s_algorithm#Karger.E2.80.93Stein_algorithm)
- [biconnected components](https://en.wikipedia.org/wiki/Biconnected_component)
- [strongly connected components](https://en.wikipedia.org/wiki/Strongly_connected_component)
- [degree centrality](https://en.wikipedia.org/wiki/Centrality#Degree_centrality)
- [closeness centrality](https://en.wikipedia.org/wiki/Closeness_centrality)
- [betweenness centrality](https://en.wikipedia.org/wiki/Betweenness_centrality)
- [Page Rank](https://en.wikipedia.org/wiki/PageRank)
- [damping factor](https://en.wikipedia.org/wiki/PageRank#Damping_factor)
- [Markov cluster algorithm](https://micans.org/mcl/)
- [k-means clustering](https://en.wikipedia.org/wiki/K-means_clustering)
- [Euclidean distance](https://en.wikipedia.org/wiki/Euclidean_distance)
- [Squared Euclidean distance](https://en.wikipedia.org/wiki/Euclidean_distance#Squared_Euclidean_distance)
- [Manhattan distance](https://en.wikipedia.org/wiki/Taxicab_geometry)
- [Max distance](https://en.wikipedia.org/wiki/Uniform_norm)
- [k-medoids clustering](https://en.wikipedia.org/wiki/K-medoids)
- [fuzzy c-means clustering](https://en.wikipedia.org/wiki/Fuzzy_clustering#Fuzzy_C-means_clustering)
- [hierarchical clustering](https://en.wikipedia.org/wiki/Hierarchical_clustering)
- [linkage criterion](https://en.wikipedia.org/wiki/Hierarchical_clustering#Linkage_criteria)
- [dendrogram](https://en.wikipedia.org/wiki/Dendrogram)
- [affinity propagation clustering](https://en.wikipedia.org/wiki/Affinity_propagation)
- [truthy](http://javascriptweblog.wordpress.com/2011/02/07/truth-equality-and-javascript/)
- [specificity rules](http://www.w3.org/TR/css3-selectors/#specificity)
- [_.memoize()](https://lodash.com/docs#memoize)
- [data URI](https://en.wikipedia.org/wiki/Data_URI_scheme)
- [encodeURIComponent](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent)
- [creates decorations](https://pathwaycommons.github.io/cytoscape-sbgn-stylesheet/)
- [SBGN standard](https://sbgn.github.io)
- [crossorigin](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attr-crossorigin)
- [demo](demos/pie-style)
- [demo](demos/stripe-style)
- [comma-separated list of font names](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family)
- [CSS font style](https://developer.mozilla.org/en-US/docs/Web/CSS/font-style)
- [CSS font weight](https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight)
- [zero-width spaces](https://en.wikipedia.org/wiki/Zero-width_space)
- [CJK](https://en.wikipedia.org/wiki/CJK_characters)
- [visualisation](http://easings.net/)
- [demo](http://cubic-bezier.com)
- [jQuery event objects](http://api.jquery.com/category/events/event-object/)
- [React synthetic events](https://reactjs.org/docs/events.html)
- [gesturechange event](https://developer.mozilla.org/en-US/docs/Web/API/Element/gesturechange_event)
- [touch events](https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent)
- [the blog for an in-depth layout tutorial](https://blog.js.cytoscape.org/2020/05/11/layouts)
- [Gerardo Huck](https://www.linkedin.com/in/gerardohuck)
- [“A layout algorithm for undirected compound graphs”](http://dl.acm.org/citation.cfm?id=1498047&CFID=429377863&CFTOKEN=94691144)
- [please submit a request](https://github.com/cytoscape/cytoscape.js/issues/new?labels=documentation&title=List%20extension%20:%20%3Cyour%20extension%20name%3E&body=Please%20enter%20your%20Github%20URL%20and%20a%20one-line%20description)
- [anywhere-panning](https://github.com/lambdalisue/cytoscape-anywhere-panning)
- [autopan-on-drag](https://github.com/iVis-at-Bilkent/cytoscape.js-autopan-on-drag)
- [blink](https://github.com/simCecca/cytoscape-blink)
- [bubblesets](https://github.com/sgratzl/cytoscape.js-bubblesets)
- [bubble set](https://ieeexplore.ieee.org/document/5290706)
- [canvas](https://github.com/classcraft/cytoscape.js-canvas)
- [cerebralweb](https://github.com/silviafrias/cerebral-web)
- [context-menus](https://github.com/iVis-at-Bilkent/cytoscape.js-context-menus)
- [dom-node](https://github.com/mwri/cytoscape-dom-node)
- [edge-editing](https://github.com/iVis-at-Bilkent/cytoscape.js-edge-editing)
- [edge-editation](https://github.com/frankiex/cytoscape.js-edge-editation)
- [edge-connections](https://github.com/jri/cytoscape-edge-connections)
- [even-parent](https://github.com/mo0om/cytoscape-even-parent)
- [expand-collapse](https://github.com/iVis-at-Bilkent/cytoscape.js-expand-collapse)
- [grid-guide](https://github.com/iVis-at-Bilkent/cytoscape.js-grid-guide)
- [html](https://github.com/BradyDouthit/cytoscape-html)
- [lasso](https://github.com/zakjan/cytoscape-lasso)
- [layers](https://github.com/sgratzl/cytoscape.js-layers)
- [leaf](https://github.com/cytoscape/cytoscape.js-leaflet)
- [mapbox-gl](https://github.com/zakjan/cytoscape-mapbox-gl)
- [navigator](https://github.com/cytoscape/cytoscape.js-navigator)
- [no-overlap](https://mo0om.github.io/cytoscape-no-overlap)
- [node-html-label](https://github.com/kaluginserg/cytoscape-node-html-label)
- [node-edge-html-label](https://github.com/laikmokashi/cytoscape-node-edge-html-label)
- [node-resize](https://github.com/iVis-at-Bilkent/cytoscape.js-node-resize)
- [node-resizer](https://github.com/gxara/cytoscape-js-node-resizer)
- [noderesize](https://github.com/curupaco/cytoscape.js-noderesize)
- [overlays](https://github.com/sgratzl/cytoscape.js-overlays)
- [panzoom](https://github.com/cytoscape/cytoscape.js-panzoom)
- [Popper.js](https://popper.js.org/)
- [Tippy.js](https://atomiks.github.io/tippyjs/)
- [qtip](https://github.com/cytoscape/cytoscape.js-qtip)
- [snap-to-grid](https://github.com/guimeira/cytoscape-snap-to-grid)
- [supportimages](https://github.com/jhonatandarosa/cytoscape.js-supportimages)
- [toolbar](https://github.com/bdparrish/cytoscape.js-toolbar)
- [cosep](https://github.com/iVis-at-Bilkent/cytoscape.js-cosep)
- [cosmos-over-cytoscape](https://github.com/simCecca/cosmosOverCytoscape)
- [d3-force](https://github.com/shichuanpo/cytoscape.js-d3-force)
- [ELK](https://github.com/OpenKieler/elkjs)
- [euler](https://github.com/cytoscape/cytoscape.js-euler)
- [ngraph.forcelayout](https://github.com/Nickolasmv/cytoscape-ngraph.forcelayout)
- [polywas](https://github.com/monprin/polywas)
- [spread](https://github.com/cytoscape/cytoscape.js-spread)
- [springy](https://github.com/cytoscape/cytoscape.js-springy)
- [tidytree](https://github.com/chuckzel/cytoscape-tidytree)
- [all-paths](https://github.com/daniel-dx/cytoscape-all-paths)
- [clipboard](https://github.com/iVis-at-Bilkent/cytoscape.js-clipboard)
- [dblclick](https://github.com/lambdalisue/cytoscape-dblclick)
- [graphml](https://github.com/iVis-at-Bilkent/cytoscape.js-graphml)
- [layout-utilities](https://github.com/iVis-at-Bilkent/cytoscape.js-layout-utilities)
- [pdf-export](https://github.com/cytoscape/cytoscape.js-pdf-export)
- [undo-redo](https://github.com/iVis-at-Bilkent/cytoscape.js-undo-redo)
- [view-utilities](https://github.com/iVis-at-Bilkent/cytoscape.js-view-utilities)
- [Cytoscape.js Schema](https://github.com/AZaitzeff/cytoscape_js_schema)
- [Cyjs.NET](https://fslab.org/Cyjs.NET/)
- [ngx-cytoscape](https://github.com/calvinvette/ngx-cytoscape)
- [react-cytoscapejs](https://github.com/plotly/react-cytoscapejs)
- [React](https://reactjs.org)
- [cytoscape-react](https://github.com/mwri/cytoscape-react)
- [sif.js](https://github.com/jmvillaveces/sif.js)
- [SBGN](https://sbgn.github.io/sbgn/)
- [sbgnml-to-cytoscape](https://github.com/PathwayCommons/sbgnml-to-cytoscape)
- [vue-cytoscape](https://www.npmjs.com/package/vue-cytoscape)
- [Vue](https://vuejs.org)
- [cytoscape-pptx](https://github.com/Hoogkamer/cytoscape-pptx)
- [rollup-starter-lib](https://github.com/rollup/rollup-starter-lib)
- [Babel](https://babeljs.io)
- [babel branch](https://github.com/rollup/rollup-starter-lib/tree/babel)
- [Publish your extension to npm](https://docs.npmjs.com/cli/publish)
- [worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)
- [requestAnimationFrame()](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)
- [Image Magick](https://imagemagick.org)
-->
