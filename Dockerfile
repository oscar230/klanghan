# Stage 1: Build the Go API
FROM golang:1.23-alpine as go-builder
WORKDIR /app/api
COPY api/go.mod api/go.sum ./
RUN go mod download
COPY api/ .
RUN go build -o /api .

# Stage 2: Build the SvelteKit app
FROM node:lts-alpine as node-builder
WORKDIR /app/web
COPY web/package.json web/package-lock.json ./
RUN npm install
COPY web/ .
RUN npm run build

# Stage 3: Final image to combine Go API and SvelteKit
FROM alpine:latest
RUN apk --no-cache add ca-certificates nginx

COPY --from=go-builder /api /usr/local/bin/api
COPY --from=node-builder /app/web/build /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 5200
EXPOSE 5201

# Start both Go API and Nginx to serve the SvelteKit app
CMD ["/bin/sh", "-c", "/usr/local/bin/api & nginx -g 'daemon off;'"]