# 빌드 스테이지
FROM node:18-alpine as build

WORKDIR /app

# 패키지 파일 복사 및 설치
COPY package*.json ./
RUN npm install

# 소스 코드 복사
COPY . .

# VITE_API_URL을 빈 문자열로 설정
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

# 빌드
RUN npm run build

# 실행 스테이지
FROM nginx:alpine

# 빌드된 파일 복사
COPY --from=build /app/dist /usr/share/nginx/html

# nginx 설정 파일 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 