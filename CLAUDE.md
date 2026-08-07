# 오호라 콘텐츠 성과 대시보드

## 프로젝트 구조

- **프론트엔드**: `src/App.jsx` (React/Vite)
- **배포 URL**: https://ohora-dashboard.vercel.app
- **GAS 소스**: `apps-script/Code.gs`
- **GAS 배포 URL**: `https://script.google.com/macros/s/AKfycbxBQQ2gFVTbK9Kv4mZGi5TzNSCshjPHNxkDy7u3eF3IYEnOp9rzGdgp_ut5iJqZc6mZ/exec`

## Google Sheets 연결

```
메인 SS_ID:         1r1yUxPxvyvZILVhUI0YRamK3Ue0GAHERkerbY5uczLk
KR 콘텐츠 시트:     KR_게시물
US 콘텐츠 시트:     US_게시물
KR 판매 SS_ID:      1J5Z0aIP9Tz98hmyhlRbHLhVfqn2CzIAa95EDJgX-5aM  (탭: 자사몰, 올리브영)
US 판매 SS_ID:      1YAIfB_6DbQq-ikDi5zZP6hNsgTCxluSXe3dOnl3g7yA  (탭: 2025 RAW US)
판매 시트:          [import] APEX
일별 계정 시트:     계정_일별
```

## 시트 컬럼 구조 (KR_게시물)

제품 관련 컬럼은 **영어 헤더**, productColStart=48 (AV열)부터 스캔:
- `product type` → 값: `strengthener` / `strip` / `presson`
- `product code` → 값: PC-NS-021, PD-230 등
- `product name` → 값: 제품명 (한/영)

## 제품 카테고리 매핑

GAS `CAT_MAP`과 프론트 `PTYPE_TO_KEY` 항상 동기화 유지:

| 시트 값 | 내부 키 | 표시 라벨 |
|--------|--------|---------|
| strengthener, 강화제, Hardener | hardener | 강화제 |
| strip, 젤스트립, Gel Strip | gelStrip | 젤스트립 |
| presson, 프레스온, Press On, 리얼젤팁 | gelPressOn | 젤프레스온 |
| 기타 케어류, Other Care | otherCare | 기타케어류 |

## 로컬스토리지 캐시 키

```
dash2-gas-url-v4          GAS URL
dash2-all-contents-v4     전체 콘텐츠 (KR/US)
dash2-feed-contents-v4    피드 콘텐츠
dash2-weeks-v4            주간 메타
dash2-account-metrics-v4  계정 지표
dash2-daily-metrics-v4    일별 지표
```

캐시 전체 삭제 (브라우저 콘솔):
```javascript
['dash2-all-contents-v4','dash2-feed-contents-v4','dash2-weeks-v4','dash2-account-metrics-v4','dash2-daily-metrics-v4'].forEach(k=>localStorage.removeItem(k))
```

## GAS 배포 절차

Code.gs 수정 후:
1. GAS 에디터 → 배포 → 배포 관리 → 새 버전으로 배포
2. `{GAS_URL}?type=refreshSales` 한 번 실행 (판매 캐시 재구축)
3. 대시보드에서 캐시 삭제 후 새로고침

## 주요 기능 & 로직

### 판매전환 등급
```
headlineLiftWO(item) → salesProd.d7 우선, 없으면 salesCat.d7
liftPct(pw) → (게시 후 - 게시 전) / 게시 전 * 100
liftGrade(pct) → S/A/B/C/D 등급 + 색상
```

### 판매전환 기간 기본값
`salesWin` 기본값: `'d3'` (3일) — App.jsx line ~259

### GAS 캐싱
PropertiesService로 판매 맵 캐싱 (12시간 TTL, 490KB 청크 분할)
- `?type=refreshSales` → 강제 재구축
- `?type=debugCache` → 캐시 상태 확인

## 미결 이슈

- **일별 판매량 0**: KR 판매 데이터 연동 미완성, GAS refreshSales 후 확인 필요
- **US 데이터**: 캐싱 적용 후 안정화 예정
