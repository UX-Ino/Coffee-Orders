# 팀 커피 주문 웹앱

Next.js 14(App Router) + TypeScript + Tailwind 기반의 팀 커피 주문 관리 페이지. `spec/`의 요구사항, 설계, 작업 문서를 기준으로 구성되었습니다.

## 빠른 시작

1) 의존성 설치: `npm install`
2) 환경변수 설정: `.env.example`를 복사해 `.env.local` 작성
3) 개발 서버: `npm run dev` (http://localhost:3000)

빌드: `npm run build` · 실행: `npm start` · 린트: `npm run lint`

## 폴더 구조
- `app/`: 페이지(App Router) — `page.tsx`, `order/[brand]/page.tsx`, `status/page.tsx`
- `components/`: UI 컴포넌트 — BrandSelector, MenuGrid, OrderForm, PassOption, OrderStatus, TeamSettings
- `lib/`: Notion 서비스 스텁(`lib/notion/service.ts`), 상태관리(`lib/state/OrderContext.tsx`)
- `types/`: Menu, Order 등 타입 정의
- `scripts/`: CSV → Notion 마이그레이션 스크립트(스텁)
- `spec/`: 요구사항/설계/작업 문서

## Notion 연동
- `.env.local`에 `NOTION_TOKEN`, `NOTION_MENU_DB_ID`, `NOTION_ORDER_DB_ID` 설정
- `lib/notion/service.ts`에 API 메서드 구현 필요
- 초기 데이터: 루트의 `커피데이터.csv`를 `scripts/migrate:csv`로 마이그레이션(스텁)

## 테스트
- `tests/`에 테스트 추가(Jest/Vitest 권장). `npm test` 스크립트 추가 후 실행.

자세한 요구사항과 컴포넌트 설계는 `spec/` 폴더를 참고하세요.
# Coffee-Orders
