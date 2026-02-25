# Performance Benchmark

## Target Budgets

| Metric | Desktop Target | Mobile Target |
| --- | --- | --- |
| Initial interactive (`startupMs`) | < 2000 ms | < 3500 ms |
| Contour tile processing average (`contourTileAvgMs`) | < 40 ms | < 90 ms |
| Pan FPS average (`panFpsAvg`) | > 50 | > 35 |
| Lighthouse performance score | >= 95 | >= 88 |
| Lighthouse interactive (`TTI`) | <= 1800 ms | <= 4300 ms |
| Lighthouse total blocking time (`TBT`) | <= 50 ms | <= 160 ms |

## Quick Run

1. Start local server:
```bash
python3 -m http.server 8080
```
2. Run Lighthouse benchmark:
```bash
./scripts/perf-benchmark.sh http://127.0.0.1:8080
```
3. In browser console, inspect app runtime metrics:
```js
window.__seoulMapPerf.metrics
window.__seoulMapPerf.report()
```
4. For detailed runtime telemetry, open:
```text
http://127.0.0.1:8080/?perf=1
```

## Manual Runtime Scenario

1. Load map and wait for first render.
2. Pan rapidly for 10 seconds at zoom 13-15.
3. Toggle contours, routes, and slope overlays on/off.
4. Check:
   - `startupMs`
   - `contourTileAvgMs`
   - `panFpsAvg`
   - `cacheHitRate`
   - `memoryUsedMb`

## Report Gate

A run is considered pass only if all three primary budgets pass:

- `startupMs`
- `contourTileAvgMs`
- `panFpsAvg`
