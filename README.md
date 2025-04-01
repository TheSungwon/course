-

# 강의 관리 플랫폼

온라인 강의와 수업을 관리하기 위해 Next.js로 구축된 현대적인 웹 애플리케이션입니다.

## 🚀 기능

- 사용자 인증 및 관리 (Clerk 사용)
- 강의 및 수업 관리
- 구매 추적 시스템
- 관리자 대시보드
- PostgreSQL과 데이터베이스 통합
- Tailwind CSS로 반응형 UI
- 사용자 이벤트를 위한 웹훅 통합

## 🛠️ 기술 스택

- **프론트엔드**: Next.js, TypeScript, Tailwind CSS
- **인증**: Clerk
- **데이터베이스**: PostgreSQL, Drizzle ORM
- **UI 컴포넌트**: shadcn/ui
- **스타일링**: Tailwind CSS (New York 스타일 프리셋 사용)
- **아이콘**: Lucide 아이콘

## 📋 필수 조건

- Node.js (최신 LTS 버전 권장)
- PostgreSQL 데이터베이스
- 인증을 위한 Clerk 계정
- 환경 변수 설정이 올바르게 되어 있어야 합니다.

## 🔧 필요한 환경 변수

```env
# 데이터베이스 설정
DB_PASSWORD=          # PostgreSQL 데이터베이스 비밀번호
DB_USER=              # PostgreSQL 데이터베이스 사용자
DB_NAME=              # PostgreSQL 데이터베이스 이름
DB_HOST=              # PostgreSQL 데이터베이스 호스트

# Clerk 인증
CLERK_SECRET_KEY=     # Clerk 대시보드에서 가져온 비밀 키
CLERK_WEBHOOK_SECRET= # Clerk 대시보드에서 가져온 웹훅 비밀 키

# Clerk 공개 변수
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=   # Clerk 대시보드에서 가져온 공개 키
NEXT_PUBLIC_CLERK_SIGN_IN_URL=       # 로그인 URL (기본값: /sign-in)
NEXT_PUBLIC_CLERK_SIGN_UP_URL=       # 가입 URL (기본값: /sign-up)

# Stripe 설정
STRIPE_SECRET_KEY=                    # Stripe 비밀 키
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=   # Stripe 공개 키
STRIPE_WEBHOOK_SECRET=                # Stripe 웹훅 비밀 키

# Stripe 쿠폰 ID
STRIPE_PPP_50_COUPON_ID=             # Stripe 50% 할인 쿠폰 ID
STRIPE_PPP_40_COUPON_ID=             # Stripe 40% 할인 쿠폰 ID
STRIPE_PPP_30_COUPON_ID=             # Stripe 30% 할인 쿠폰 ID
STRIPE_PPP_20_COUPON_ID=             # Stripe 20% 할인 쿠폰 ID

# 애플리케이션 URL
NEXT_PUBLIC_SERVER_URL=               # 서버 URL (기본값: http://localhost:3000)

```

## 🚀 시작하기

### 리포지토리 클론하기

```bash
git clone <repository-url>
```

### 의존성 설치하기

```bash
npm install
# 또는
yarn install
# 또는
pnpm install
```

### 환경 변수 설정하기

`.env.example` 파일을 `.env.local`로 복사한 후

모든 필요한 환경 변수를 입력합니다.

### 데이터베이스 마이그레이션 실행하기

```bash
npm run db:migrate
# 또는
yarn db:migrate
```

### 개발 서버 시작하기

```bash
npm run dev
# 또는
yarn dev
# 또는
pnpm dev
```

브라우저에서 `http://localhost:3000`을 열어 애플리케이션을 확인할 수 있습니다.

## 📁 프로젝트 구조

```
src/
├── app/              # Next.js 앱 라우터 페이지
├── components/       # 재사용 가능한 UI 컴포넌트
├── drizzle/          # 데이터베이스 스키마 및 설정
├── features/         # 기능 기반 코드 조직
├── lib/              # 유틸리티 함수 및 공통 로직
└── services/         # 외부 서비스 통합
```

## 🔄 데이터베이스 관리

이 프로젝트는 PostgreSQL과 Drizzle ORM을 사용합니다.

마이그레이션 파일은 `src/drizzle/migrations`에 위치합니다.

스키마 정의는 `src/drizzle/schema`에서 확인할 수 있습니다.

## 🛡️ 보안

- 인증은 Clerk를 통해 처리됩니다.
- Clerk 이벤트에 대한 웹훅 검증은 안전하게 처리됩니다.
- 데이터베이스 자격 증명은 환경 변수로 관리됩니다.
- Drizzle ORM을 사용하여 타입 안전한 데이터베이스 작업을 수행합니다.

## 🧪 개발

- TypeScript를 사용하여 타입 안전성을 보장합니다.
- 최신 Next.js 13+ 규칙을 따릅니다.
- 서버 사이드 렌더링 및 API 라우트를 구현합니다.
- 성능 최적화를 위한 캐싱 메커니즘을 포함합니다.

## 📚 추가 리소스

- [Next.js 문서](https://nextjs.org/docs)
- [Clerk 문서](https://clerk.dev/docs)
- [Drizzle ORM 문서](https://orm.drizzle.team)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)

## 🤝 기여하기

1. 리포지토리를 포크합니다.
2. 기능 브랜치를 생성합니다. (`git checkout -b feature/AmazingFeature`)
3. 변경 사항을 커밋합니다. (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치를 푸시합니다. (`git push origin feature/AmazingFeature`)
5. 풀 리퀘스트를 엽니다.

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 제공됩니다. 자세한 내용은 LICENSE 파일을 참조하세요.

---

이 `README.md` 파일은 프로젝트에 대한 종합적인 개요를 제공합니다:

- 기능 및 기술 스택
- 설정 방법
- 프로젝트 구조
- 개발 지침
- 보안 고려사항
- 기여 지침

---
