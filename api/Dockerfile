
# Build
FROM golang:1.23-bookworm as builder
WORKDIR /app/api
COPY api/go.mod api/go.sum ./
RUN go mod download
COPY api/ .
RUN go build -o /app/api/bin/api .

# Release
FROM debian:bookworm
WORKDIR /
COPY --from=builder /app/api/bin/api /usr/bin/api
CMD ["sh", "-c", "/var/api/api"]