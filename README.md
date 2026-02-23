# 🏔️ 서울 고도 지도 (Seoul Elevation Map)

서울 지역의 지형과 고도를 시각적으로 확인할 수 있는 인터랙티브 웹 지도입니다. 자전거 라이딩, 등산, 도시 탐험에 유용합니다.

## 🌐 Live Demo

👉 **[https://mgnlia.github.io/seoul-elevation-map/](https://mgnlia.github.io/seoul-elevation-map/)**

## ✨ Features

### 🗺️ 지도 레이어
- **3D 지형** — 고도 데이터 기반 3D 지형 표현
- **등고선** — 5m~50m 간격 상세 등고선 (투명도 조절 가능)
- **등고선 사이 색칠** — 고도대별 측색으로 지형 한눈에 보기
- **음영기복 (Hillshade)** — SRTM 데이터 기반 그림자 효과 (PC)

### 🚴 자전거 특화 기능
- **추천 자전거 경로** — 탄천/양재천/한강 자전거길 등 평지 위주 경로
- **오륧막 방향 표시** — 화살표로 오륧막 방향과 경사도 표시
- **주의 구간** — 대모산, 구룡산 등 오륧막 주의 지역 하이라이트
- **경사도별 표시** — › / ›› / ››› 로 완만/중간/급경사 구분

### 🚇 편의 기능
- **지하철 역 표시** — 강남구 주요 역 위치 마커
- **로컬 맥시멈 하이라이트** — 언덕 정상부 연한 글로우 표시
- **현재 위치** — GPS 기반 내 위치 표시

### 🎮 Minecraft 모드
- **3D 복셀 지형** — 마인크래프트 스타일 3D 지도
- **1인칭 탐험** — WASD 이동, 마우스 시점
- **모바일 조작** — 조이스틱 + 점프 버튼 지원

## 🗺️ Data Sources

- [OpenTopoMap](https://opentopomap.org/) — 등고선 타일
- [OpenStreetMap](https://www.openstreetmap.org/) — 기본 지도
- [Esri World Imagery](https://www.arcgis.com/) — 위성 이미지
- [SRTM Hillshading](https://tiles.wmflabs.org/hillshading/) — 음영기복
- [Terrarium DEM](https://s3.amazonaws.com/elevation-tiles-prod/terrarium/) — 고도 데이터

## 🚀 Usage

정적 HTML 파일 하나로 동작합니다. 서버 불필요.

```bash
# 로컬에서 열기
open index.html

# 또는 간단한 서버
python3 -m http.server 8080
```

## 📐 주요 고지대

| 이름 | 고도 | 위치 | 특징 |
|------|------|------|------|
| 북한산 | 836m | 북한산국립공원 | 서울 최고봉 |
| 도봉산 | 740m | 도봉구 | 암벽 등산 명소 |
| 관악산 | 632m | 관악구 | 서울대 후문 |
| 수락산 | 640m | 노원구 | 봉화대 유적 |
| 인왕산 | 338m | 종로구 | 도심 속 산 |
| 구룡산 | 306m | 개포동 | 강남구 최고봉 |
| 대모산 | 293m | 수서동 | 대모산입구역 인근 |
| 아차산 | 287m | 광진구 | 아차산역 인근 |
| 남산 | 262m | 중구 | N서울타워 |
| 매봉산 | 101m | 도곡동 | 강남구 내 언덕 |

## 🎮 조작법

### PC
- **이동** — 마우스 드래그
- **회전/기울이기** — 두 손가락 또는 Shift + 드래그
- **3D/2D 전환** — 🏔️ 버튼
- **레이어 토글** — 🗺️ 버튼

### 모바일
- **이동** — 한 손가락 드래그
- **회전/기울이기** — 두 손가락
- **내 위치** — 📍 버튼

### Minecraft 모드
- **PC** — WASD: 이동, 마우스: 시점, Space: 점프, Q/E: 높이
- **모바일** — 왼쪽 조이스틱: 이동, 오른쪽: 시점, JUMP: 점프

## 📱 성능 최적화

- 모바일: 30fps 캡, 1x 타일, 힐셰이드 제거
- PC: 고해상도 타일, hillshade 오버레이
- 줌 레벨별 레이어 로딩
- 마커 줌컬링 (줌아웃 시 숨김)

## 📄 License

MIT License — 자유롭게 사용하세요.

---

Made with 🚴 for Seoul cyclists and hikers.
