# 🏔️ 강남구 고도 지도 (Gangnam-gu Elevation Map)

강남구의 지형과 고도를 시각적으로 확인할 수 있는 인터랙티브 웹 지도입니다.

## 🌐 Live Demo

👉 **[https://guzuseth.github.io/gangnam-elevation-map/](https://guzuseth.github.io/gangnam-elevation-map/)**

## ✨ Features

- **등고선 지형도** (OpenTopoMap) — 등고선이 표시된 상세 지형
- **음영기복 (Hillshade)** — SRTM 데이터 기반 3D 느낌의 지형 표현
- **위성 지도** — Esri 위성 이미지 레이어
- **클릭 고도 조회** — 지도 아무 곳이나 클릭하면 해당 지점의 고도(m) 표시
- **주요 언덕 마커** — 대모산, 구룡산, 매봉산 등 강남구 주요 고지대 표시
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

## 📐 강남구 주요 고지대

| 이름 | 고도 | 위치 |
|------|------|------|
| 구룡산 | 306m | 개포동 |
| 대모산 | 293m | 수서동 |
| 매봉산 | 101m | 도곡동 |
| 세곡동 구릉 | ~120m | 세곡동 |
| 일원동 구릉 | ~80m | 일원동 |

## 📄 License

MIT License — 자유롭게 사용하세요.
