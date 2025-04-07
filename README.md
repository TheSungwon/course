# 강의 관리 플랫폼

온라인 강의와 수업을 관리하기 위한 현대적인 웹 애플리케이션입니다.

## 📋 시작하기 전에

이 프로젝트를 실행하기 위해서는 다음이 필요합니다:

1. Node.js (v18 이상 권장)
2. PostgreSQL 데이터베이스
3. Clerk 계정 (인증 서비스)
4. Stripe 계정 (결제 서비스)

## 🚀 빠른 시작 가이드

### 1. 프로젝트 클론 및 설치

```bash
# 1. 프로젝트 클론
git clone <repository-url>

# 2. 프로젝트 디렉토리로 이동
cd <project-directory>

# 3. 의존성 설치
npm install
```

### 2. 환경 변수 설정

1. `.env.example` 파일을 `.env`로 복사합니다:

```bash
cp .env.example .env
```

2. `.env` 파일을 열어 다음 정보를 입력합니다:

```env
# 데이터베이스 설정
DB_PASSWORD=your_db_password
DB_USER=your_db_user
DB_NAME=your_db_name
DB_HOST=localhost

# Clerk 설정 (https://dashboard.clerk.dev에서 가져오기)
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

# Stripe 설정 (https://dashboard.stripe.com에서 가져오기)
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### 3. 데이터베이스 설정

1. PostgreSQL이 설치되어 있는지 확인합니다.
2. 다음 명령어로 데이터베이스를 생성합니다:

```bash
createdb your_db_name
```

3. 데이터베이스 마이그레이션을 실행합니다:

```bash
npm run db:migrate
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속하여 애플리케이션을 확인할 수 있습니다.

## 🛠️ 주요 기능

- 🔐 사용자 인증 및 관리
- 📚 강의 및 수업 관리
- 💳 결제 시스템
- 📊 관리자 대시보드
- 🔄 실시간 업데이트

## 📁 프로젝트 구조

```
src/
├── app/          # 페이지 및 라우팅
├── components/   # UI 컴포넌트
├── lib/         # 유틸리티 함수
├── services/    # 외부 서비스 통합
└── features/    # 비즈니스 로직
```

## 🔧 개발 가이드

### 개발 서버 실행

```bash
npm run dev
```

### 프로덕션 빌드

```bash
npm run build
npm start
```

### 테스트 실행

```bash
npm test
```

## 📚 기술 스택

- **프론트엔드**: Next.js, TypeScript, Tailwind CSS
- **인증**: Clerk
- **데이터베이스**: PostgreSQL, Drizzle ORM
- **UI**: shadcn/ui
- **결제**: Stripe

## 🤝 기여하기

1. 이슈를 생성하거나 기존 이슈를 확인합니다.
2. 새로운 브랜치를 생성합니다: `git checkout -b feature/your-feature`
3. 변경사항을 커밋합니다: `git commit -m 'Add your feature'`
4. 브랜치를 푸시합니다: `git push origin feature/your-feature`
5. Pull Request를 생성합니다.

## 📞 도움말

문제가 발생하면 다음을 확인해주세요:

1. 모든 환경 변수가 올바르게 설정되어 있는지
2. 데이터베이스가 실행 중인지
3. 필요한 서비스(Clerk, Stripe)가 올바르게 설정되어 있는지

추가적인 도움이 필요하면 이슈를 생성해주세요.

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 제공됩니다.
