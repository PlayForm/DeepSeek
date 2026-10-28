# Autonomous framework for long-running agents
Agents are good at staying busy. Leave one alone overnight and it drifts off the goal, calls things done that aren't, and hands you 200 commits with no story behind them. Ouroboros is an attempt to make long runs work. A charter guides Claude Code, Codex or Pi through a loop that runs for hours: one agent makes a change, another checks it against the charter and reverts it if it doesn't hold up, and a third writes down what happened. In the morning you get a branch you can read and a report on what's worth merging. Research example coming soon →
actor2:33iteration3actor · command2:33 Iteration
Elapsed
    40 min Criteria met
Commits kept
Last verdict
    kept
Time40 min elapsed · 20 min left of 1 h
Usageof the usage budget, `max_usage`
Done3 of 4 done criteria met
Right now · The actor is doing the work · iteration 3
Building an expectimax bot and benchmarking it on the 20 seeded games.
**Running a command** for 1:22: `uv run pytest -q`
This page doubles as a demo of the Ouroboros interface. It’s what a run looks like while it’s working and after it finishes, giving the operator a clear view of what happened and what is happening along the way.
## Progress toward done
5 of 5 met · the discipline of a run; these rules win over every other rule
  * met
**Follow the charter.** The critic grades every change against your goal, your constraints and your quality bar. A change that fails is reverted. No agent can edit the charter.
  * met
**Prove every claim.** The critic refuses a claim that the diff and the tests do not support, and a claim of “done” most of all.
  * met
**Report as it goes.** Every iteration writes a record of what changed and why. The run page stays current, a digest goes to your phone, and `ouroboros report` gives the full account.

Show 2 moreShow less
  * met
**Do work, not motion.** One bounded unit per iteration, done to the end. No change, no commit. Two counters catch a loop that is busy but ships nothing.
  * met
**Never block, never stop early.** The critic answers the actor’s questions from your question policy. A usage limit switches to a fallback harness: Claude Code, Codex or Pi. Only a stop condition that you set ends a run.


## Open problems
  * open
**Native parallelisation.** One actor works per iteration. Several actors on separate worktrees in one run, with the critic judging each and one scribe merging their records, is not built yet.
  * open
**Multi-agent collaboration.** A Flywheel graph has one writer. Several runs, or a run and a person, on one graph need a files run on its branch whose records the merge imports. That importer is not built yet.
  * open
**Runtime edits.** The charter is read again before each iteration, so you can steer a live run. The config, models, stop limits and the timer still need a restart.

Show 3 moreShow less
  * open
**Other multi-agent architectures.** Actor → critic → scribe is the default. Planner and worker trees, harnesses that take turns, and custom pipelines do not ship as presets yet.
  * open
**Other memory systems.** Memory is a Flywheel graph through Governor, or the same model as markdown files. Other stores would go behind the same `ouroboros mem` verbs.
  * open
**The agent keeps busy but ships nothing.** Watched, not solved: two mechanical counters name the loop and change the model. See 4.3.


The roadmap, written the way a run page writes its frontier: open claims about what Ouroboros does not do yet.
## Memory graph
Memory is how a run explains itself, to the next iteration and to you. Records are append-only. Each one says what it changes. State is a set of claims that cite records, and only a fold writes state. The next actor reads the state and the records not folded yet.
true now (met)openrecord of an iterationclick a node to read it
Fit graphShow namesNode titles (131)
  * 2048 bot — Ouroboros memory
  * Ouroboros run: 2048 bot — operator directive
  * B0 baseline: 4 of 5 engine checks pass, spawn odds off
  * B0 met: spawn odds 90/10 over 1e6 draws
  * R0 bench calibrated: random and greedy repeat exactly by seed
  * R0 met: two machines agree on every seeded score
  * B1 started: random and greedy bots on the board API
  * ADR-003: one move interface before any search
  * Row move tables land (ADR-004); greedy at 50 games
  * Corner bot at 100 games: median 2,304
  * Loss count: greedy loses 100 of 100 before 2048
  * Greedy scores fall past 12 tiles on the board
  * Expectimax depth 1 on the shared interface: median 5,120
  * tools/search.py lands (packed boards, 14 tests)
  * Heuristics ADR-005 lands; two weight sets compared
  * Depth 2 smoke: both weight sets finish 20 games
  * Depth 2 reaches 2048 in 11 of 20 games
  * Depth 2 filmed beside corner and greedy; films agree
  * Dead end: depth 3 without a cutoff runs out of time
  * Depth 3 with a 1e-4 cutoff launched
  * V1: tools/board_film.py films a game from its seed
  * Depth by empty cells: 0 to 3, retimed to fit 5 minutes
  * R0 v2: a bot must move at least once per game
  * Adaptive depth reaches 2048 in 14 of 20 games
  * Dead end: snake weights lose every game past 1024
  * Endgame screen: corner weights after 1024 launched
  * Dead end: corner weights after 1024 at 50 games
  * Endgame screen: blended weights launched
  * Dead end: blended weights at 50 games
  * Endgame screen: search.py --cache at 20 games
  * Dead end: --cache with snake weights at 50 games
  * Diagnostic: snake weights spoil the endgame at depth 2
  * Profile: the heuristic is 70% of depth-2 search time
  * Packed-board move bench: 0.4 µs a move
  * Depth 2 timed: 3.1 ms a move on one core
  * Heuristic cache launched (ADR-007)
  * Dead end: a 64k-entry heuristic cache thrashes
  * Per-game cost: depth 2 takes 41 s on one core
  * Bench runs 8 games at once; seeds stay apart
  * R0 v3: parallel runs match serial runs score for score
  * Corner count: big tile stays put in 17 of 20 games
  * Corner loss costs a median 1,800 points
  * Depth 3 on 20 games: 4096 in 3
  * Endgame profile: 80% of search time is past 2048
  * Diagnostic: 4096 games keep the 2nd tile beside the corner
  * Depth 1 against greedy at equal wall time
  * Report draft: median and spread per bot
  * Report boards drawn from the seed log
  * Film playback set to 4 moves a second
  * Game over now checked after every spawn
  * Engine takes the board size as a parameter (ADR-008)
  * 5×5 move tables: 9.8 MB, too big to ship
  * Blocker tile sketch: fixed cells in the engine
  * Move budget: greedy beats expectimax at 200 moves
  * Proposal: a per-seed score table in the report
  * Dead end: depth 3 at 5×5 runs past 10 minutes
  * Depth 3 with cached heuristic: 4096 in 5 of 20
  * Dead end: cache shared across games leaks scores
  * R0 v4: caches reset between games
  * Expectimax reaches 2048 in 16 of 20 games
  * Weights retuned on 50 seeds held out from the bench
  * Held-out seeds agree with the bench within 3%
  * Corner bot rerun: still stalls in 9 of 20 games
  * S2 check: depth 2 takes 2.4 ms a move with the cache
  * Depth 1 move: 0.3 ms, under 1 ms
  * Report v2 lands with a film linked per seed
  * Diagnostic: 5×5 games run 3× as many moves
  * B0. A correct game engine
  * B1. Baselines: random, greedy and corner bots
  * E1. Compute per game
  * H1. Keeps the big tile in its corner
  * R0. The benchmark is seeded and repeatable
  * R1. The report
  * S1. Faster than greedy at equal score
  * S2. A move in under 1 ms
  * U1. Expectimax reaches 2048 in most games
  * U2. Reaches 4096
  * U3. Plays a 5×5 board
  * U4. Plays with blocker tiles
  * U5. Plays to a move budget
  * U6. One bot for every variant
  * U7. Reaches 8192
  * V1. The owner can watch the games
  * One move interface for every bot (ADR-003)
  * The corner bot stalls once its corner fills
  * The three baselines share one board API
  * Greedy's score falls once 12 tiles are on the board
  * Row move tables, 65,536 entries (ADR-004)
  * Monotonicity and empty-cell heuristics (ADR-005)
  * Search depth chosen by empty cells (ADR-006)
  * Building the move tables takes about 40 s
  * tools/loss_count.py counts losses per 100 games
  * tools/board_film.py films a game
  * The bench counts a timeout as a loss, not a crash
  * Boards print as text, so reports can show them
  * Merges on a full 5-tile row are not tested
  * Spawn odds match the original 90/10
  * A board with one empty cell is never searched past depth 1
  * A bot that never moves gets an empty pass
  * Two seeds share a spawn stream after a reset
  * Proposal (not applied): report the 10th-percentile score
  * Heuristics fall into families one weight set cannot blend
  * tools/replay.py replays a game from its seed
  * The median score swings below 50 games per seed
  * Snake weights spoil the endgame
  * tools/search.py runs expectimax on packed boards
  * search.py --cache memoises transpositions
  * Depth 3 does not fit the 5-minute bench budget
  * Bench time includes the move-table warm-up
  * Depth 2 needs a chance-node cutoff below 1e-4
  * Depth 3 reaches 4096 in 5 of 20 games
  * 4096 needs the second-largest tile beside the corner
  * Endgame search spends 80% of its time past 2048
  * Packed-board moves take 0.4 µs
  * Expectimax depth 2 takes 3.1 ms a move
  * The heuristic is 70% of search time
  * A cached heuristic halves search time
  * A depth-2 game takes 41 s on one core
  * Games run in parallel without sharing seeds
  * The corner holds the big tile in 17 of 20 depth-2 games
  * Losing the corner costs a median 1,800 points
  * The report shows each bot's median and spread
  * Report boards render from the seed log
  * Proposal (not applied): a per-seed score table
  * The engine takes the board size as a parameter (ADR-008)
  * Move tables for 5-cell rows take 9.8 MB
  * A blocker tile neither moves nor merges
  * Greedy wins a 200-move budget over expectimax
  * Depth 1 beats greedy at equal time
  * Films play back at 4 moves a second
  * Game over is detected after every spawn


### On Flywheel, through Governor
The memory is a graph in [Flywheel](https://docs.flywheel.paradigma.inc), the research graph from Paradigma. `flywheel repo:init` makes a **local Flywheel repository** at the checkout, in `.flywheel/`. It keeps the graph and its whole commit history on your machine, and `flywheel repo:push` and `repo:pull` sync it with a hosted Flywheel repository. [Governor](https://github.com/theo-kirby/governor) adds the record and state conventions, a small CLI, and the hub view of the graph. Every memory write is a Flywheel commit.
### Or as files, in git
A repo without a Flywheel repository keeps the same model as markdown under `.ouroboros/graph/`, committed with the code on the run branch. Each node is one file with canonical frontmatter and a uuid. That way, a later import into a Flywheel repository can run twice without duplicating anything. `memory: auto` picks Flywheel when `.flywheel/db.sqlite` and `governor` are there, and files if not.
Agents never learn which store they have. They see one command: `ouroboros mem orient | show | record | fold | check | render`. Both stores enforce the same rules, G1 to G7.
## Findings
### 4.1 The roles  
| Role  | What it does  | Verbs  |  
| --- | --- | --- |  
| **Actor**  | Picks one unit of work from the critic’s message. Does it to the end, tests it, and reports it.  |  `orient` `show`  |  
| **Critic**  | One read-only call after every actor turn. Grades the change against your quality bar, answers questions as you would, refuses false “done”, names loops, and writes the next prompt. A rejected change is reverted.  |  `orient` `show` `check`  |  
| **Scribe**  | Records the unit in memory (a rejected one as a dead end), folds the memory when a fold is due, and keeps the run’s page up to date.  |  `record` `fold` `render`  |  
The actor reads, the critic reads and checks, the scribe writes. No agent can edit the charter.
This is the default. Other multi-agent architectures are easy to support: make your own, or start from [the ones we have tried](https://github.com/theo-kirby/ouroboros/blob/main/DESIGN.md#10-roles).
### 4.2 The charter
The charter is the contract for the run. It lives in `.ouroboros/goal.md`. `ouroboros design` writes it with you, in an interview. The critic picks each next step from it, and grades each change against it. While you are away, the charter speaks for you.

```
# Goal: <name>
## Mission            one paragraph: what and why, priorities in order
## Done criteria      - [ ] claims about the world, not tasks
## Horizon ladder     short-term, medium-term, long-term
## Constraints        never do X; always keep Y green
## Question policy    how to decide for me: "prefer the reversible option"
## Quality bar        what the critic grades against
```

### 4.3 Motion is not progress
A loop that keeps working can ship nothing: records about records, audits of audits, plans that restate the last plan. All of these write files, so a diff looks like progress. One real run is the worked example: Iterations
    201 Lines changed
    22,437 Records written
    128 Frontier moved
     1node
So Ouroboros counts two things that an agent cannot argue with, because an agent asked “are you looping?” always finds a reason why this time is different.  
| Counter  | Counts iterations that  | Fires at  |  
| --- | --- | --- |  
| `no_product`  | changed only memory files, not the product  | 8  |  
| `no_frontier`  | left the frontier unchanged  | 30  |  
Step 1: name the loop in the next prompt. Step 2: change the model. There is no step 3. A loop is a thing to break out of, not a thing to die of.
### 4.4 What the first night taught  
| Observed  | Change  |  
| --- | --- |  
| A session limit was not seen as temporary. 63 of 90 iterations were empty commits and pointless verdicts on 0-byte patches.  | Limits are classified. The reset time is parsed, and the role falls back to another harness instead of waiting.  |  
| At iteration 50, the overseer rejected “done” with “0 of 3” when all three had shipped. It counted boxes in a static file.  | Done criteria became gaps in memory. The critic judges against the memory, not against ticked boxes.  |  
| The merged branch had 173 commits; 132 were empty.  | No change, no commit.  |  
## Timeline
A real run: **2048 bot** , 17 Oct 2026. The charter: build a correct 2048 game and a bot that plays it, then make the bot better, one change at a time, with every claim a number from a seeded benchmark. 4 iterations in 29 minutes; all 4 done criteria met; 0 reverts. Each row is a claim that the critic checked against the diff.
5 min10 min[#1 · kept — Built the 2048 game engine with 51 rule tests. 1](https://borris.dev/#it-1)[#2 · kept — Added the seeded bench command and two baseline bots. 2](https://borris.dev/#it-2)[#3 · done — Added a depth-2 expectimax bot: 2048 in 14 of 20 games. 3](https://borris.dev/#it-3)[#4 · kept — Bit-packed boards: 3× faster; depth 3 gets median 40920. 4](https://borris.dev/#it-4)
actorcriticscribekeptheld backrevertedmemory folded
  * 4keptAdded bit-packed boards with 65536-row move tables; the bot got 3× faster, and depth 3 now gets median 40920 in 173 s. folded13 min 

Critic
    The packed boards and move tables are correct and tested, depth 3 is benched honestly, and the medium-term rung “search deeper” is done. 

Next
    Tuning the heuristic weights against the seeded benchmark. 

Record
    `r-0005`
  * 3doneAdded a depth-2 expectimax bot. It reaches 2048 in 14 of 20 seeded games in 21 s, with 9 new tests.9 min 

Critic
    14 of 20 closes the last done criterion. The diff, the tests and the CSV row support the claims. 

Next
    Speeding up moves with lookup tables, so that a depth-3 search fits in 5 minutes. 

Record
    `r-0004`
  * 2keptAdded the seeded bench command, random and greedy baseline bots, and bench.csv with their first two rows.2 min 

Critic
    The bench command, the seeded repeatability, the CSV rows and the two bots all match the diff, and the tests are green. 

Next
    Building an expectimax bot and benchmarking it on the 20 seeded games. 

Record
    `r-0003`
  * 1keptBuilt the 2048 game engine with 51 rule tests. folded4 min 

Critic
    The engine and its 51 rule tests match the first done criterion. The diff supports the claims. 

Next
    Building the seeded benchmark command, with two baseline bots. 

Record
    `r-0002`


The run continued after the critic accepted “done”: the charter’s horizon ladder still had rungs. Done is a verdict, not a stop condition.
## Install and run
You need Python 3.12+, `uv`, and at least one agent CLI that is logged in: `claude`, `codex` or `pi`. To outlive the terminal, a run needs one of tmux, tern, or a systemd user session (`launcher:` in the config).
InstallCopy

```
git clone https://github.com/theo-kirby/ouroboros.git
cd ouroboros
uv tool install --editable .
ouroboros skills install --user
```

In the repo you want worked onCopy

```
ouroboros init            # config and charter template
ouroboros design          # write the charter with an agent
ouroboros run --for 8h    # start the loop
ouroboros top             # watch it
ouroboros view            # open the run's page
ouroboros stop            # stop early if you must
ouroboros report          # read what happened
```

Optional: memory in a Flywheel repositoryCopy

```
npm install -g @paradigma-inc/flywheel   # the Flywheel CLI
flywheel repo:init                       # a local Flywheel repository in .flywheel/
governor init --title "My project"       # Governor: github.com/theo-kirby/governor
```

Keep `.flywheel/` and `.governor/` out of git. Without them, the run keeps its memory as files. Start with a clean working tree. Read the report and the run branch before you merge. Every run keeps a live page like this one at `.ouroboros/runs/<run>/view/index.html`; `ouroboros view --host 0.0.0.0` lets a phone open it. `ouroboros watch` pushes alerts and a digest every 4 hours to your phone.
[Read the source and the design ↗](https://github.com/theo-kirby/ouroboros)
