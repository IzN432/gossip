# https://blog.kronis.dev/tutorials/how-to-use-nginx-to-proxy-your-front-end-and-back-end

# STAGE 1 BUILD

FROM node:20-alpine AS frontend-builder

WORKDIR /app/gossip-frontend

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# STAGE 2: NGINX

FROM nginx:1.25-alpine

WORKDIR /usr/share/nginx/html

RUN mkdir /etc/nginx/logs

COPY nginx.conf /etc/nginx/nginx.conf

COPY --from=frontend-builder /app/gossip-frontend/build /usr/share/nginx/html/

HEALTHCHECK --interval=20s --timeout=20s --retries=3 --start-period=120s CMD curl --fail http://127.0.0.1:80 | grep "Welcome to my app!" || exit 1"
