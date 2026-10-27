# API reference

This file records the HTTP contract of the server, as verified against v0.9.5 on
2026-10-22.

Use this file when a script cannot express what you need.

Otherwise call `read_url.py` or `crawl_site.py`.

## Authentication

Every route except `/health` requires the token:

```text
Authorization: Bearer <contents of ${DSH_HOME}/secrets/crawl4ai.token>
Content-Type: application/json
```

A missing or wrong token answers `401` with a short JSON body.

`/health` is open so that a monitor can probe liveness without the secret.

## Endpoint inventory

| Method | Path              | Purpose                                       |
| ------ | ----------------- | --------------------------------------------- |
| GET    | `/`               | Server root, version banner                   |
| GET    | `/health`         | Liveness and version; no auth                 |
| GET    | `/metrics`        | Prometheus-style counters                     |
| POST   | `/md`             | One URL to Markdown with a filter             |
| POST   | `/crawl`          | One or more URLs, full result objects         |
| POST   | `/crawl/stream`   | Same, streamed per URL                        |
| POST   | `/crawl/job`      | Async crawl job; poll `/crawl/job/{task_id}`  |
| POST   | `/html`           | Rendered DOM as HTML                          |
| POST   | `/screenshot`     | PNG of the rendered page                      |
| POST   | `/pdf`            | PDF of the rendered page                      |
| POST   | `/execute_js`     | Run JavaScript against a page                 |
| GET    | `/artifacts/{id}` | Download an artifact produced by a job        |
| POST   | `/llm/job`        | Async LLM extraction; needs a provider key    |
| GET    | `/llm/{url}`      | Synchronous LLM extraction                    |
| GET    | `/ask`            | Crawl4AI's own library context, BM25 filtered |
| GET    | `/schema`         | Live `BrowserConfig` and `CrawlerRunConfig`   |
| GET    | `/hooks/info`     | Hook types the server accepts                 |
| GET    | `/monitor/*`      | Requests, browsers, stats, logs               |
| POST   | `/token`          | Token handling helper                         |
| POST   | `/config/dump`    | Effective server config                       |

Verify the inventory against the running server, because an image upgrade can add or
move routes:

```bash
curl -sS -K ${DSH_HOME}/secrets/crawl4ai.curlrc \
  http://127.0.0.1:11235/openapi.json | jq -r '.paths | keys[]'
```

## POST /md

This is the simple path: one URL in, one Markdown string out.

```json
{ "url": "https://example.com", "f": "fit", "q": null, "c": "0" }
```

| Field         | Type   | Meaning                                                    |
| ------------- | ------ | ---------------------------------------------------------- |
| `url`         | string | Absolute http or https URL (required)                      |
| `f`           | enum   | `fit` (default), `raw`, `bm25`, `llm`                      |
| `q`           | string | Query for the `bm25` and `llm` filters                     |
| `c`           | string | Cache-bust revision counter; bump it to force a fresh read |
| `provider`    | string | LLM provider override, `llm` filter only                   |
| `temperature` | number | LLM temperature, `llm` filter only                         |

Response:

```json
{
  "url": "...",
  "filter": "fit",
  "query": null,
  "cache": "0",
  "markdown": "# Title\n\nbody",
  "success": true
}
```

`markdown` is a plain string.

It can be empty when the page rendered nothing, and the server still reports
`success: true`, so check the length.

The `llm` filter needs an LLM provider key inside the container.

This installation has none, so the filter returns `success: true` with an empty body
instead of an error (verified 2026-10-22: `markdown` was `"\n"`).

Do not reach for it, and do not read an empty `llm` result as an empty page.

## POST /crawl

This is the rich path: a URL list in, full result objects out.

```json
{
  "urls": ["https://example.com"],
  "browser_config": { "headless": true },
  "crawler_config": {
    "cache_mode": "BYPASS",
    "page_timeout": 90000,
    "word_count_threshold": 10,
    "wait_for": "css:main",
    "css_selector": "article",
    "js_code": "window.scrollTo(0, document.body.scrollHeight)",
    "scan_full_page": true,
    "markdown_generator": {
      "type": "DefaultMarkdownGenerator",
      "params": {
        "content_filter": {
          "type": "PruningContentFilter",
          "params": { "threshold": 0.48 }
        }
      }
    }
  }
}
```

`urls` accepts up to 100 entries.

`crawler_config` is a `CrawlerRunConfig` dict, and the keys above are the ones verified
to work on this version.

Response, per URL:

| Key                       | Meaning                                                                                              |
| ------------------------- | ---------------------------------------------------------------------------------------------------- |
| `results[]`               | One object per URL                                                                                   |
| `results[].url`           | Final URL after redirects                                                                            |
| `results[].success`       | Crawl succeeded                                                                                      |
| `results[].status_code`   | HTTP status the browser saw                                                                          |
| `results[].markdown`      | Object: `raw_markdown`, `fit_markdown`, `markdown_with_citations`, `references_markdown`, `fit_html` |
| `results[].metadata`      | `title`, `description`, `keywords`, `author`                                                         |
| `results[].links`         | `internal` and `external` lists of link objects, each `{"href": ..., "text": ...}`                   |
| `results[].media`         | Images, videos, audio                                                                                |
| `results[].html`          | Rendered DOM                                                                                         |
| `results[].error_message` | Present when `success` is false                                                                      |

`fit_markdown` is populated only when `markdown_generator` carries a content filter, as
above.

Without it the field is empty and `raw_markdown` is the text.

`read_url.py` always requests both.

A single page can produce a 600-750 KB response because `html`, `links`, and `media`
ride along (verified 2026-10-22: 642,829 bytes for `react.dev/learn`, 750,103 for a
filtered crawl of the same page).

Extract the Markdown field, and never print the whole body.

## Filters

| Filter | Server work                                    | Best for                              |
| ------ | ---------------------------------------------- | ------------------------------------- |
| `fit`  | Readability pruning via `PruningContentFilter` | Articles, docs, blogs                 |
| `raw`  | Full DOM to Markdown, nothing pruned           | Code blocks, tables, nav that matters |
| `bm25` | BM25 ranking against `q`                       | Narrowing a long page to paragraphs   |
| `llm`  | LLM summarization against `q`                  | Not usable here (no provider key)     |

`fit` and `bm25` can return an empty string on a single-page app whose render raced the
extraction.

The behavior is intermittent, not deterministic: a retry once with a bumped `c` counter
usually succeeds.

Both scripts do that retry.

## Cache modes

| Value        | Behavior                                       |
| ------------ | ---------------------------------------------- |
| `BYPASS`     | Fetch fresh, ignore and do not write the cache |
| `ENABLED`    | Use the cache when present, write when absent  |
| `DISABLED`   | Neither read nor write the cache               |
| `READ_ONLY`  | Read the cache, never write                    |
| `WRITE_ONLY` | Write the cache, never read                    |

`read_url.py` defaults to `BYPASS`, because a stale page silently answers the wrong
question.

`crawl_site.py` defaults to `ENABLED`, because a bulk crawl should not refetch what it
already has.

## Error shapes

| Status | Body                                              | Meaning                                                        |
| ------ | ------------------------------------------------- | -------------------------------------------------------------- |
| 401    | short JSON detail                                 | Missing or wrong bearer token                                  |
| 400    | `{"detail":"URL blocked (SSRF protection): ..."}` | The server refuses private targets, even for `--allow-private` |
| 422    | FastAPI validation error with a `detail` list     | Bad payload shape                                              |
| 502    | JSON whose detail carries a Playwright traceback  | `/md` could not navigate the page                              |

The same document problem has two different shapes, and that difference matters when
you read the exit codes.

`POST /md` with a document URL answers **HTTP 502**, and its detail carries the
Playwright error `Page.goto: Download is starting` (verified 2026-10-22).

`POST /crawl` with the same URL answers **HTTP 200** with `results[0].success: false`
and `error_message` set to the same Playwright text (verified 2026-10-22).

Both shapes mean the same thing: a document URL cannot be crawled as a page.

Route it to anydoc instead, which `read_url.py` does automatically.

## Calling the API by hand

Use this route only for something the scripts cannot do, such as a multi-URL crawl.

The token stays out of the command line because it lives in a curl config file:

```bash
curl -sS -K ${DSH_HOME}/secrets/crawl4ai.curlrc \
  -H 'Content-Type: application/json' \
  -d '{"urls":["https://example.com"],"crawler_config":{"cache_mode":"BYPASS"}}' \
  http://127.0.0.1:11235/crawl \
  | jq -r '.results[] | "\(.url)\t\(.success)\t\(.markdown.raw_markdown | length)"'
```

`${DSH_HOME}/secrets/crawl4ai.curlrc` holds one line,
`header = "Authorization: Bearer <token>"`, and is mode `600`.

The token never appears in the command, the shell history, or the process list.
