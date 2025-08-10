# SSE Chatbot Monorepo

이 프로젝트는 pnpm과 Turborepo를 사용하여 구성된 모노레포입니다.

## 🏗️ 프로젝트 구조

```
sse-chatbot/
├── apps/
│   ├── server/          # NestJS 백엔드 서버
│   └── client/          # Vite + React + TypeScript 프론트엔드
├── packages/
│   └── shared/          # 공유 타입과 유틸리티
├── package.json          # 루트 패키지 설정
├── pnpm-workspace.yaml  # pnpm 워크스페이스 설정
├── turbo.json           # Turborepo 설정
└── README.md
```

## 🚀 시작하기

### 필수 요구사항

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### 설치

```bash
# 의존성 설치
pnpm install
```

### 개발 서버 실행

```bash
# 모든 앱의 개발 서버 실행
pnpm dev

# 또는 개별적으로 실행
pnpm --filter @sse-chatbot/server dev
pnpm --filter @sse-chatbot/client dev
```

### 빌드

```bash
# 모든 앱 빌드
pnpm build

# 또는 개별적으로 빌드
pnpm --filter @sse-chatbot/server build
pnpm --filter @sse-chatbot/client build
```

### 린팅 및 테스트

```bash
# 린팅
pnpm lint

# 테스트
pnpm test

# 정리
pnpm clean
```

## 📦 패키지 설명

### @sse-chatbot/server
- NestJS 기반 백엔드 서버
- 포트: 3001
- 기본적인 API 엔드포인트 제공

### @sse-chatbot/client
- Vite + React + TypeScript 프론트엔드
- 포트: 5173
- 기본적인 React 앱 구조

### @sse-chatbot/shared
- 공유 타입과 유틸리티
- 서버와 클라이언트 간 공통 코드

## 🔧 사용된 기술

- **패키지 매니저**: pnpm
- **모노레포 도구**: Turborepo
- **백엔드**: NestJS
- **프론트엔드**: React + TypeScript + Vite
- **언어**: TypeScript
