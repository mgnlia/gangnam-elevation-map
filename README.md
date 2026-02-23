# 🏔️ 서울 고도 지도 (Seoul Elevation Map)

서울 전역의 지형과 고도를 시각적으로 확인할 수 있는 인터랙티브 웹 지도입니다.

## 🌐 Live Demo

👉 **[https://guzuseth.github.io/seoul-elevation-map/](https://guzuseth.github.io/seoul-elevation-map/)**

## ✨ Features

- **등고선 지형도** (OpenTopoMap) — 등고선이 표시된 상세 지형
- **음영기복 (Hillshade)** — SRTM 데이터 기반 3D 느낌의 지형 표현
- **위성 지도** — Esri 위성 이미지 레이어
- **클릭 고도 조회** — 지도 아무 곳이나 클릭하면 해당 지점의 고도(m) 표시
- **주요 언덕 마커** — 북한산, 관악산, 도봉산 등 서울 주요 고지대 표시
- **레이어 전환** — 등고선/일반/위성 지도 + 음영기복 오버레이 토글

## 🗺️ Data Sources

- [OpenTopoMap](https://opentopomap.org/) — 등고선 타일
- [OpenStreetMap](https://www.openstreetmap.org/) — 기본 지도
- [Esri World Imagery](https://www.arcgis.com/) — 위성 이미지
- [SRTM Hillshading](https://tiles.wmflabs.org/hillshading/) — 음영기복
- [Open-Elevation API](https://open-elevation.com/) — 클릭 고도 조회

## 🚀 Usage

정적 HTML 파일 하나로 동작합니다. 서버 불필요.

```bash
# 로컬에서 열기
open index.html

# 또는 간단한 서버
python3 -m http.server 8080
```

## 📐 서울 주요 고지대

| 이름 | 고도 | 위치 |
|------|------|------|
| 북한산 | 836m | 북한산국립공원 |
| 관악산 | 632m | 관악구 |
| 도봉산 | 740m | 도봉구 |
| 수락산 | 640m | 노원구 |
| 인왕산 | 338m | 종로구 |
| 남산 | 262m | 중구 |
| 아차산 | 287m | 광진구 |

## 📄 License

MIT License — 자유롭게 사용하세요.
