# Server setup and recovery

This file covers how the local Crawl4AI server is started, verified, and repaired.

Every command here is safe to re-run, and none of them touches the token unless you regenerate it.

## The installed state (verified 2026-10-22)

| Item           | Value                                                                                    |
| -------------- | ---------------------------------------------------------------------------------------- |
| Container name | `crawl4ai`                                                                               |
| Image          | `unclecode/crawl4ai:latest`, 10.8 GB on disk                                             |
| Server version | `0.9.5` (reported by `/health`)                                                          |
| Bind address   | `127.0.0.1:11235` (loopback only)                                                        |
| Restart policy | `unless-stopped`                                                                         |
| Shared memory  | `1g`                                                                                     |
| Auth           | `Authorization: Bearer <token>` on every route but `/health`                             |
| Token file     | `${DSH_HOME}/secrets/crawl4ai.token`, mode `600`                                         |
| Env file       | `${DSH_HOME}/secrets/crawl4ai.env`, mode `600` (for `--env-file`)                        |
| curl config    | `${DSH_HOME}/secrets/crawl4ai.curlrc`, mode `600` (header, no token on the command line) |
| Scripts        | `${DSH_HOME}/skills/crawl4ai/scripts/read_url.py` and `crawl_site.py`                    |

Verify the state:

```bash
docker ps --filter name=crawl4ai --format '{{.Status}}\t{{.Ports}}'
curl -s http://127.0.0.1:11235/health
```

Expect `Up ... 127.0.0.1:11235->11235/tcp` and `{"status":"ok","timestamp":...,"version":"0.9.5"}`.

## First setup from nothing

1. **The secret files.**

    Create the three secret files.

    The token is made once and never printed:

    ```bash
    mkdir -p ${DSH_HOME}/secrets && chmod 700 ${DSH_HOME}/secrets
    openssl rand -hex 32 > ${DSH_HOME}/secrets/crawl4ai.token
    chmod 600 ${DSH_HOME}/secrets/crawl4ai.token
    printf 'CRAWL4AI_API_TOKEN=%s\n' "$(cat ${DSH_HOME}/secrets/crawl4ai.token)" \
    	> ${DSH_HOME}/secrets/crawl4ai.env
    printf 'header = "Authorization: Bearer %s"\n' "$(cat ${DSH_HOME}/secrets/crawl4ai.token)" \
    	> ${DSH_HOME}/secrets/crawl4ai.curlrc
    chmod 600 ${DSH_HOME}/secrets/crawl4ai.env ${DSH_HOME}/secrets/crawl4ai.curlrc
    ```

2. **The container.**

    Start the container.

    The token arrives through `--env-file`, so it never appears in the command, the shell history,
    or `ps`:

    ```bash
    docker run -d --name crawl4ai --restart unless-stopped \
    	-p 127.0.0.1:11235:11235 \
    	--shm-size=1g \
    	--env-file ${DSH_HOME}/secrets/crawl4ai.env \
    	unclecode/crawl4ai:latest
    ```

3. **The health gate.**

    Wait for health, then verify the scripts:

    ```bash
    until curl -sf http://127.0.0.1:11235/health > /dev/null; do sleep 1; done
    ${DSH_HOME}/skills/crawl4ai/scripts/read_url.py https://example.com --max-chars 0
    ```

The image is 10.8 GB on disk, and the first pull takes minutes.

Later starts take seconds because the browser is baked into the image.

## Lifecycle commands

| Goal                     | Command                                                         |
| ------------------------ | --------------------------------------------------------------- |
| Stop                     | `docker stop crawl4ai`                                          |
| Start again              | `docker start crawl4ai`                                         |
| Restart                  | `docker restart crawl4ai`                                       |
| Follow logs              | `docker logs -f --tail 100 crawl4ai`                            |
| Health as Docker sees it | `docker inspect crawl4ai --format '{{.State.Health.Status}}'`   |
| Upgrade to latest        | `docker rm -f crawl4ai` then re-run the start command           |
| Remove completely        | `docker rm -f crawl4ai && docker rmi unclecode/crawl4ai:latest` |

An upgrade keeps the token, because the token lives in the file and not in the image.

## Rotating the token

Regenerating the token requires a new container, because the environment variable is fixed at
creation:

```bash
openssl rand -hex 32 > ${DSH_HOME}/secrets/crawl4ai.token
chmod 600 ${DSH_HOME}/secrets/crawl4ai.token
printf 'CRAWL4AI_API_TOKEN=%s\n' "$(cat ${DSH_HOME}/secrets/crawl4ai.token)" \
	> ${DSH_HOME}/secrets/crawl4ai.env
printf 'header = "Authorization: Bearer %s"\n' "$(cat ${DSH_HOME}/secrets/crawl4ai.token)" \
	> ${DSH_HOME}/secrets/crawl4ai.curlrc
chmod 600 ${DSH_HOME}/secrets/crawl4ai.env ${DSH_HOME}/secrets/crawl4ai.curlrc
docker rm -f crawl4ai
# then re-run the start command from "First setup"
```

The scripts read the token file on every call, so no code change is needed.

## Private targets

The server carries its own SSRF filter.

A loopback or private URL is refused with HTTP 400
`{"detail":"URL blocked (SSRF protection): URL blocked"}`, no matter what the client asks for.

`--allow-private` on the scripts lifts only their own guard, which covers the content-type probe and
the document downloads, and it cannot make the server crawl a private HTML page.

Verified 2026-10-22.

## Network egress

This machine routes all traffic through Cloudflare WARP, so the public egress of the container is a
Cloudflare address, not the local ISP address (verified 2026-10-22: host and container both exited
via `104.28.214.53`).

Verify it:

```bash
curl -sS -m 15 https://api.ipify.org
echo
docker exec crawl4ai python -c "import urllib.request; print(urllib.request.urlopen('https://api.ipify.org', timeout=20).read().decode())"
```

Both lines print the same address, which means that the container inherits the egress of the host.

Some sites therefore treat WARP egress as VPN traffic and answer with a challenge or a 403.

When a crawl returns a challenge page, toggle WARP off and retry before you blame the scripts.

The repeated `WebSocket /monitor/ws 403` lines in `docker logs` are not network faults.

They are the auth gate rejecting a browser tab on the playground or monitor page, which connects
without the bearer token.

They appear only while such a tab is open, and they are harmless.

## Troubleshooting

| Symptom                           | Cause                                     | Fix                                                         |
| --------------------------------- | ----------------------------------------- | ----------------------------------------------------------- |
| Script exit 7, connection refused | Container stopped or never started        | `docker start crawl4ai`                                     |
| Script exit 7, HTTP 401           | Token file and container disagree         | Rotate: recreate the container with the file's token        |
| `/health` 200 but crawls time out | Browser pool exhausted or a stuck page    | `docker restart crawl4ai`                                   |
| Script exit 3, `SSRF protection`  | Private target and the server's own guard | Not bypassable; crawl a public URL instead                  |
| `docker run` fails on port 11235  | Another process holds the port            | `lsof -nP -iTCP:11235 -sTCP:LISTEN`                         |
| Container exits immediately       | Missing `--shm-size`; Chromium OOM        | Recreate with `--shm-size=1g`                               |
| Crawls return empty Markdown      | SPA not rendered yet, or bot challenge    | Scripts retry once; then `--filter raw`, `--scan-full-page` |
| `docker ps` shows `(unhealthy)`   | Healthcheck failing during startup        | Wait 30 s; if it persists, `docker logs crawl4ai`           |

## Drifting facts

The image tag `latest` moves.

The version `0.9.5` and the endpoint list in `api-reference.md` were verified on 2026-10-22 against
this container.

After an upgrade, re-verify with:

```bash
curl -s http://127.0.0.1:11235/health | jq -r .version
curl -sS -K ${DSH_HOME}/secrets/crawl4ai.curlrc \
	http://127.0.0.1:11235/openapi.json | jq -r '.paths | keys[]'
```
