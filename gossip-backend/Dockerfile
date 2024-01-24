FROM golang:1.21-alpine AS builder

WORKDIR /app/gossip-backend

COPY go.mod go.sum main.go ./

COPY . .

RUN go build -o main

FROM golang:1.21-alpine

WORKDIR /app

COPY --from=builder /app/gossip-backend/main .

CMD ["./main"]

EXPOSE 8080
