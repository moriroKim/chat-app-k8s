FROM node:18-alpine

WORKDIR /app

# 패키지 파일 복사 및 설치
COPY package.json package-lock.json ./
RUN npm ci

# 소스 코드 복사
COPY . .

# TypeScript 컴파일
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/index.js"] 