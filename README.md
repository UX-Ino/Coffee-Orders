# 팀 커피 주문 웹앱

Next.js 14(App Router) + TypeScript + Tailwind 기반의 팀 커피 주문 관리 페이지입니다. `spec/`의 요구사항·설계·작업 문서를 기준으로 구현합니다.

## 핵심 기능
- 브랜드 선택: 우지커피(`oozy`), 카페게이트(`gate`)
- 메뉴 조회: 루트의 `passorder_fullmenu.json`에서 브랜드별 메뉴 제공 (`/api/menu/[brand]`)
- 주문/패스 관리: 팀원 주문 상태를 클라이언트 상태로 관리
- Notion 동기화: 주문을 Notion 데이터베이스로 업서트(`/api/sync/orders`)

## 빠른 시작
사전 요구사항: Node.js 18 이상, npm

1) 의존성 설치: `npm install`
2) 환경변수 설정: 프로젝트 루트에 `.env.local` 작성(아래 예시 참고)
3) 개발 서버 실행: `npm run dev` → http://localhost:3000

추가 스크립트
- 빌드: `npm run build`
- 프로덕션 실행: `npm start`
- 린트: `npm run lint`
- 타입 검사: `npm run typecheck`
- CSV → Notion 마이그레이션(플레이스홀더): `npm run migrate:csv`

### 환경 변수(.env.local 예시)
```
# Notion API
NOTION_TOKEN=secret_...
NOTION_ORDER_DB_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 아래 항목은 선택(프로퍼티명이 다를 때 재정의)
NOTION_PROP_CUSTOMER_NAME=customer_name
NOTION_PROP_MENU_NAME=menu_name
NOTION_PROP_BRAND=brand
NOTION_PROP_STATUS=status
NOTION_PROP_ORDER_DATE=order_date
```

설정 확인: `GET /api/health/notion` 호출 시 토큰/DB 설정 상태를 반환합니다.

## 데이터 및 스크립트
- `passorder_fullmenu.json`: 메뉴 API의 데이터 소스입니다. 브랜드 값은 "우지커피", "카페게이트"를 사용합니다.
- `passorder_fullmenu.csv`: 동일 데이터의 CSV 버전(참고 용도)
- `scrape-passorder.mjs`: 메뉴 스크래핑 유틸(필요 시 재생성)
- `커피데이터.csv`: 예시 주문 데이터. `scripts/migrate-csv-to-notion.ts`에서 읽어 Notion으로 업서트하는 스텁입니다.

## API 개요
- `GET /api/menu/[brand]`: `brand`는 `oozy` 또는 `gate`. `passorder_fullmenu.json`에서 해당 브랜드 메뉴를 반환
- `POST /api/sync/orders`: 본문에 `orders` 배열과 선택적 `date(YYYY-MM-DD)`를 전달하면 Notion에 업서트
- `GET /api/health/notion`: Notion 연결 및 환경변수 상태 확인

## 폴더 구조
- `app/`: App Router 페이지 및 API 라우트
  - `page.tsx`, `status/page.tsx`
  - `api/menu/[brand]/route.ts`, `api/sync/orders/route.ts`, `api/health/notion/route.ts`
- `components/`: UI 컴포넌트(BrandSelector, MenuGrid, OrderForm, PassOption, OrderStatus, TeamSettings 등)
- `lib/`: 공용 라이브러리
  - `notion/service.ts`: 주문 업서트·조회·삭제 로직
  - `state/OrderContext.tsx`: 클라이언트 상태 관리
  - `config/menu.ts`: 메뉴 관련 설정
- `scripts/`: 마이그레이션 스크립트(`migrate-csv-to-notion.ts`)
- `spec/`: 요구사항/설계/작업 문서
- `tests/`: 테스트(현재 템플릿/가이드만 존재)

## 테스트
- 권장: 유닛(Jest 또는 Vitest), E2E(Playwright)
- 현재 `npm test` 스크립트는 정의되어 있지 않습니다. 프레임워크 선택 후 `"test"` 스크립트를 추가해 사용해 주세요.
- 목표: 파서/가격/주문 로직 유닛 테스트, 빈 행/이상치 CSV 행 등 엣지 케이스 포함(커버리지 ≥80%)

## 코딩 스타일
- 포맷터: Prettier(`.prettierrc`), 린터: ESLint(`.eslintrc.json`)
- TypeScript/Next.js 규칙 준수, 2칸 들여쓰기, ~100자 내 줄바꿈 권장
- 파일/컴포넌트: Next.js 관례(App Router) 및 타입 명명(PascalCase 타입, 함수/변수는 camelCase)

## 커밋/PR 가이드
- 커밋: Conventional Commits 사용(예: `feat: add order sync api`)
- PR: 단일 주제, 요약/근거/테스트 계획 포함, 이슈 링크
- 체크리스트: 테스트/문서 업데이트, 브레이킹 체인지 시 마이그레이션 노트 포함

## 보안/구성
- 비밀 키는 절대 커밋하지 않습니다. `.env.local` 사용 및 `.env.example` 제공 권장
- 대용량 데이터는 `data/`에 저장하고 경로 참조(필요 시 Git LFS 고려)

## 현재 상태 및 다음 단계
- Notion 연동은 동작하지만, 프로퍼티명은 환경변수로 재정의 가능합니다.
- `scripts/migrate-csv-to-notion.ts`는 플레이스홀더입니다. 실제 마이그레이션 로직은 보완이 필요합니다.
- 테스트 프레임워크 도입 및 `npm test` 추가가 필요합니다.

자세한 요구사항과 컴포넌트 설계는 `spec/` 폴더를 참고하세요.
