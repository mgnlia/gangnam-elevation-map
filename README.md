# 🚴 서울 오르막 지도 — Seoul Elevation Map

Interactive elevation map of Seoul for cyclists and hikers. Visualize terrain, contour lines, and bike-friendly routes at a glance.

**[→ Live Demo](https://mgnlia.github.io/seoul-elevation-map/)**

## Features

### Terrain
- **3D terrain** — Exaggerated elevation with MapLibre GL terrain
- **Contour lines** — Custom marching-squares renderer with Chaikin curve smoothing, rendered per-tile via `addProtocol`
- **Hypsometric tinting** — GPU `raster-color` shader maps elevation to color gradient
- **Hillshade overlay** — SRTM-based shadow relief (desktop only)

### Cycling
- **Flat route overlays** — Tanchen, Yangjae-cheon, Han River bike paths
- **Slope arrows** — Direction and steepness indicators on roads
- **Caution zones** — Highlighted steep areas (Daemo-san, Guryong-san, etc.)

### Transit
- **175 metro stations** — All Seoul lines (1–9, Sinbundang, Bundang, Gyeongui) with official line colors, rendered as GPU symbol layers

### Controls
- **Desktop** — WASD panning (IME-safe `e.code`), right-click rotate, middle-mouse rotate+tilt
- **Mobile** — Touch gestures, GPS location button
- **Layer panel** — Toggle terrain, contours, stations, routes, slope arrows
- **Contour opacity slider** — Adjustable contour line intensity

## Architecture

Single `index.html` (~1100 lines). No build step, no bundler.

### Contour Rendering Pipeline

Contour lines are generated entirely client-side with zero external libraries:

```
DEM tile (Terrarium PNG from AWS S3)
  → fetch + decode → Float32 elevation grid
  → bilinear interpolation → 512px grid (z13+) or 256px (z10-12)
  → Gaussian blur (separable 1D, 1 pass)
  → marching squares → line segments
  → spatial-hash chaining → continuous polylines
  → Chaikin corner-cutting → smooth curves
  → Canvas 2D render → WebP encode
  → MapLibre raster tile via addProtocol('contour-raster')
```

### Performance Optimizations

| Optimization | Impact |
|---|---|
| DEM LRU cache (96 tiles, pre-decoded Float32) | Avoid re-fetch + re-decode |
| Rendered tile LRU cache (128 tiles) | Pan back = 0ms |
| Flat tile early exit (DEM min/max check) | Skip processing entirely |
| Inflight request dedup | One fetch per DEM tile |
| Separable Gaussian blur | 4.5× faster than 2D kernel |
| Integer spatial hash keys | No string GC pressure |
| Flat Float32Array polylines | Half the memory vs `[x,y][]` |
| Batched Canvas paths | 1 `stroke()` per style vs per-line |
| Adaptive resolution | 256px at z10-12, 512px at z13+ |
| WebP output (quality 0.8) | ~3× smaller than PNG |
| Reusable OffscreenCanvas | No allocation per tile |
| `ImageBitmap.close()` | Explicit GPU memory release |

### Stack

- **[MapLibre GL JS 4.7.1](https://maplibre.org/)** — Map renderer
- **[CARTO Voyager](https://carto.com/basemaps/)** — Base tiles
- **[AWS Terrarium DEM](https://s3.amazonaws.com/elevation-tiles-prod/terrarium/)** — Elevation data
- **[SRTM Hillshading](https://tiles.wmflabs.org/hillshading/)** — Shadow relief tiles
- **[OpenMapTiles Fonts](https://fonts.openmaptiles.org/)** — Glyphs for text layers
- **Service Worker** — Offline tile caching, network-first for app shell

## Usage

```bash
# Just open it
open index.html

# Or serve locally
python3 -m http.server 8080
```

## Performance Profiling

```bash
# Run Lighthouse desktop + mobile perf snapshots
./scripts/perf-benchmark.sh http://127.0.0.1:8080
```

Runtime perf telemetry is exposed in-browser:

```js
window.__seoulMapPerf.metrics
window.__seoulMapPerf.report()
```

Enable full runtime perf instrumentation with `?perf=1`:

```text
http://127.0.0.1:8080/?perf=1
```

## Controls

| Input | Desktop | Mobile |
|---|---|---|
| Pan | Drag / WASD | One finger drag |
| Rotate | Right-click drag | Two finger rotate |
| Tilt | Middle-mouse drag | Two finger tilt |
| Zoom | Scroll wheel | Pinch |
| Location | — | 📍 button |
| Reset view | ↺ button | ↺ button |
| 3D toggle | 🏔️ button | 🏔️ button |

## License

MIT

---

Made with 🚴 for Seoul cyclists.
