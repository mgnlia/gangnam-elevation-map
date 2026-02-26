# 🚴 서울 오르막 지도 — Seoul Elevation Map

Interactive elevation map of Seoul for cyclists and hikers. Visualize terrain, contour lines, and bike-friendly routes at a glance.

**[→ Live Demo](https://mgnlia.github.io/seoul-elevation-map/)**

## Features

### Terrain
- **3D terrain** — Exaggerated elevation with MapLibre GL terrain
- **3D buildings** — OpenFreeMap extruded building footprints (toggleable, hidden by default)
- **Contour lines** — Vector contour lines via `maplibre-contour`, with minor/major intervals and elevation labels
- **Hypsometric tinting** — GPU-side `raster-color` shader for elevation-based color gradient

### Cycling
- **Flat route overlays** — Tanchen, Yangjae-cheon, Han River bike paths
- **Slope arrows** — Direction and steepness indicators on roads
- **Caution zones** — Highlighted steep areas (Daemo-san, Guryong-san, etc.)

### Transit
- **175 metro stations** — Lines 1–9, Sinbundang, Bundang, Gyeongui — with official line colors, rendered as GPU symbol layers

### Controls
- **Desktop** — WASD panning (IME-safe `e.code`), Space/Shift to ascend/descend zoom, right-click drag to rotate, middle-mouse drag to rotate + tilt
- **Mobile** — Touch gestures, GPS location button
- **Layer panel** — Toggle terrain, 3D buildings, contours, stations, routes, slope arrows
- **Contour opacity slider** — Adjustable contour line intensity

## Stack

| Library | Purpose |
|---|---|
| [MapLibre GL JS 4.7.1](https://maplibre.org/) | Map renderer + GPU terrain/tiling |
| [maplibre-contour 0.0.7](https://github.com/onthegomap/maplibre-contour) | Vector contour line generation from DEM |
| [CARTO Voyager](https://carto.com/basemaps/) | Base map tiles |
| [OpenFreeMap](https://openfreemap.org/) | 3D building footprints |
| [AWS Terrarium DEM](https://s3.amazonaws.com/elevation-tiles-prod/terrarium/) | Elevation tiles (Terrarium encoding) |
| [OpenMapTiles Fonts](https://fonts.openmaptiles.org/) | Glyphs for contour labels and station names |
| Service Worker | Offline tile caching, network-first for app shell |
| GA4 | Anonymous usage analytics |

## Architecture

Single `index.html` (~1100 lines). No build step, no bundler.

### Contour Rendering

Contour lines are vector tiles generated client-side by `maplibre-contour`:

```
DEM tiles (Terrarium PNG, AWS S3)
  → DemSource (maplibre-contour, maxzoom 13, worker thread)
  → Vector MVT via custom protocol handler
  → MapLibre symbol/line layers (contour-lines, contour-lines-major, contour-labels)
```

Zoom-dependent intervals:

| Zoom | Minor | Major |
|------|-------|-------|
| 11 | — | 50 m |
| 12 | 20 m | 100 m |
| 13–15 | 10 m | 50 m |

### Performance Notes

- Protocol handler registered before `map = new Map(...)` (required for MapLibre GL 4.x)
- Terrain DEM source added before `elev-color` source in `map.on('load')` to avoid silent protocol failures
- `raster-color` / `raster-color-range` wrapped in `try/catch` (MapLibre GL 4.7.1 validation throws but is non-fatal)
- Service Worker: `CACHE_NAME = 'seoul-elevation-map-v13'`, network-first for `index.html`

## Usage

```bash
# Open directly in browser
open index.html

# Or serve locally
python3 -m http.server 8080
```

## Performance Profiling

Runtime perf telemetry is exposed in-browser:

```js
window.__seoulMapPerf.metrics
window.__seoulMapPerf.report()
```

Enable full runtime perf instrumentation with `?perf=1`:

```
http://127.0.0.1:8080/?perf=1
```

## Controls

| Input | Desktop | Mobile |
|---|---|---|
| Pan | Drag / WASD | One-finger drag |
| Ascend / Descend | Space / Shift | — |
| Rotate | Right-click drag | Two-finger rotate |
| Tilt | Middle-mouse drag | Two-finger tilt |
| Zoom | Scroll wheel | Pinch |
| Location | — | 📍 button |
| Reset view | ↺ button | ↺ button |
| 3D toggle | 🏔️ button | 🏔️ button |
| Layers | 🗺️ button | 🗺️ button |
| Legend | 📋 button | 📋 button |

## License

MIT

---

Made with 🚴 for Seoul cyclists.
