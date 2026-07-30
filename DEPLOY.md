# Deploying Username Finder on UGNAS (Docker)

This guide walks through running **Username Finder** on a UGREEN NAS (UGNAS)
using the built-in Docker GUI. Two options are covered:

1. **Build on the NAS** (recommended — no external image registry needed)
2. **Build elsewhere, push to a registry, pull on the NAS** (faster redeploy)

Either way, the app runs at `http://<your-NAS-ip>:3000` once deployed.

---

## What you need

- A UGREEN NAS running UGNAS with Docker enabled (UGREEN OS ≥ 2.0
  ships Docker + Docker Compose)
- ~500 MB free RAM for the container
- ~200 MB free disk for the image
- Internet access on the NAS during the first build (to download the
  `node:20-slim` base image + npm packages)

---

## Option 1: Build on the NAS (easiest)

### Step 1 — Get the files onto your NAS

Copy these **three files** to a folder on your NAS, e.g. `/share/docker/username-finder/`:

- `Dockerfile`
- `docker-compose.yml`
- `.dockerignore`

Plus the **entire app source** (everything except `node_modules/`, `.next/`,
`db/`, and `*.log` files — the `.dockerignore` handles excluding them
automatically, so you can copy the whole project folder).

You can do this via:
- **File Station** (UGNAS web UI) — drag-and-drop the folder
- **SMB/Samba** — mount `\\<nas-ip>\share` and copy the folder there
- **SCP/rsync** — `scp -r . root@<nas-ip>:/share/docker/username-finder/`

### Step 2 — Open the Docker GUI

In UGNAS, open **Docker** → **Compose** (sometimes under "Container
Station" or "Container Manager" depending on UGNAS version).

### Step 3 — Create a new compose project

1. Click **+ Create** (or **New Project**)
2. **Name**: `username-finder`
3. **Path**: point it at the folder you created in Step 1 (the one
   containing `docker-compose.yml`)
4. UGNAS will show the compose file contents — review and click **Deploy**
   (or **Create & Start**)

### Step 4 — Wait for the build

The first build takes **3–8 minutes** depending on your NAS CPU. UGNAS
shows build logs in real-time. You'll see:
- `deps` stage: `bun install` downloading packages
- `builder` stage: `next build` compiling the app
- `runner` stage: copying the final ~150 MB image

Subsequent deploys skip the build if nothing changed (Docker layer cache).

### Step 5 — Open the app

Once the container shows **Running** (green dot), open:

```
http://<your-NAS-ip>:3000
```

That's it. The app is now running.

---

## Option 2: Prebuilt image (faster redeploy)

If you don't want the NAS to build (slow ARM CPUs, offline NAS, etc.),
build once on a fast machine and push to a registry.

### Build & push (on your dev machine)

```bash
# Tag for your registry (GitHub Container Registry shown — also works
# with Docker Hub, Quay, private registries)
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t ghcr.io/your-username/username-finder:latest \
  --push .
```

> **Why both platforms?** UGNAS runs on both Intel (amd64) and ARM
> (arm64) NAS models. Building both ensures the image works regardless
> of which UGREEN NAS you deploy to.

### Edit docker-compose.yml on the NAS

Open `docker-compose.yml` and change the image source:

```yaml
services:
  username-finder:
    # Comment out the build: block:
    # build:
    #   context: .
    #   dockerfile: Dockerfile

    # Uncomment and set your image:
    image: ghcr.io/your-username/username-finder:latest
    container_name: username-finder
    restart: unless-stopped
    # ... rest stays the same
```

Then deploy via the UGNAS Docker GUI as in Option 1, Step 3.

---

## Changing the port

If port 3000 is already in use on your NAS (e.g. by another app),
edit the `ports:` line in `docker-compose.yml`:

```yaml
    ports:
      - "8081:3000"   # left = host port, right = container port (don't change)
```

Then in UGNAS Docker GUI: select the project → **Stop** → **Deploy**
again. The app will be at `http://<nas-ip>:8081`.

---

## Updating to a new version

1. Replace the source files on the NAS (or pull the new image if using
   Option 2)
2. In UGNAS Docker GUI: select the `username-finder` project →
   **Stop** → **Build & Deploy** (or just **Deploy** if using a pulled image)

The container preserves no state, so updates are safe — the only thing
that resets is the in-memory cache (5-minute TTL anyway).

---

## Viewing logs

In UGNAS Docker GUI: select the container → **Logs** tab.

Or via SSH:
```bash
docker logs -f username-finder
```

---

## Stopping / removing

In UGNAS Docker GUI: select the project → **Stop**, then **Delete** if
you want to remove it entirely. The image stays cached unless you
explicitly remove it under **Images**.

Via SSH:
```bash
cd /share/docker/username-finder
docker compose down          # stop & remove container
docker compose down --rmi local   # also remove the built image
```

---

## Troubleshooting

### Build fails with "next: not found"

The `bun install` step didn't complete. Check your NAS has internet
access during build, and that `bun.lock` is present in the source folder.

### Container starts but page won't load

- Check the container is healthy (green dot, not yellow/red)
- Check the port isn't firewalled on your NAS
- Check logs: `docker logs username-finder` — look for `Ready on
  http://0.0.0.0:3000`

### Many platforms show "Blocked"

This is expected — Instagram, Reddit, Hacker News etc. rate-limit
server IPs. The cache (5-min TTL) prevents repeat-probe amplification.
For better results, wait a few minutes between searches of different
usernames.

### Out of memory (OOM) during build

The `next build` step is memory-intensive. If your NAS has < 2 GB RAM,
add swap or use **Option 2** (prebuilt image) to avoid building on the NAS.

---

## Files reference

| File | Purpose |
|---|---|
| `Dockerfile` | Multi-stage build recipe — produces the runtime image |
| `.dockerignore` | Excludes `node_modules`, `.next`, logs etc. from the build context |
| `docker-compose.yml` | The file UGNAS Docker GUI imports — defines port, restart policy, health check, resource limits |
| `.env.example` | Documents available env vars (the app runs fine with none set) |
