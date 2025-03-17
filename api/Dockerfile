
# Build
FROM golang:1.23-bookworm as builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o /app/bin/api .

# Release
FROM debian:bookworm
WORKDIR /
RUN apt-get update && apt-get install -y ca-certificates
COPY --from=builder /app/bin/api /usr/bin/api
CMD ["sh", "-c", "/usr/bin/api"]