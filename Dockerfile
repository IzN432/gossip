# STAGE 1 FRONTEND

FROM node:20 AS frontend-builder

WORKDIR /app/gossip-frontend

COPY gossip-frontend/package*.json ./

RUN npm install

COPY gossip-frontend .

RUN npm run build

# STAGE 2 BACKEND

FROM golang:1.21 AS backend-builder

WORKDIR /app/gossip

COPY go.mod go.sum main.go ./

COPY gossip-backend ./gossip-backend

RUN go build -o main

# STAGE 3: FINAL IMAGE

FROM golang:1.21

WORKDIR /app

COPY --from=backend-builder /app/gossip/main .

COPY --from=frontend-builder /app/gossip-frontend/build ./gossip-frontend/build

EXPOSE 8080

CMD ["./main"]