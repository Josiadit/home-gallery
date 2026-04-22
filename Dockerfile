FROM alpine AS structure-extractor
WORKDIR /src

# 1. Wir kopieren ALLES kurz hierher (keine Sorge, das landet nicht im End-Image)
COPY . .

# 2. Wir suchen alle package.jsons und kopieren sie mit Pfad nach /output
RUN mkdir -p /output && \
    find . -name "package.json" -exec cp --parents {} /output/ \; && \
    find . -name "pnpm-lock.yaml" -exec cp --parents {} /output/ \; 2>/dev/null || true && \
    find . -name ".npmrc" -exec cp --parents {} /output/ \; 2>/dev/null || true
#
# Image builder
FROM node:24-alpine AS builder
ARG TARGETPLATFORM
ARG NO_SHARP

WORKDIR /build

COPY --from=structure-extractor /output ./

COPY scripts ./scripts/

# Disable dependencies BEFORE npm install to avoid compiling large native modules
RUN node scripts/disable-dependency.js api-server && \
  if [[ -n "$NO_SHARP" || "$TARGETPLATFORM" == "linux/arm/v6" || "$TARGETPLATFORM" == "linux/arm/v7" || "$TARGETPLATFORM" == "linux/arm64" ]]; then \
    node scripts/disable-dependency.js --prefix=packages/extractor sharp ; \
  fi

# Install dependencies with npm
RUN npm install --no-audit --loglevel verbose

COPY .npmrc *.json *.yaml *.js *.md *.yml LICENSE ./
COPY e2e ./e2e/
COPY packages ./packages/

RUN npm install --no-audit --loglevel verbose

RUN npm run build

RUN node scripts/bundle.js --bundle-file=bundle-docker.yml --no-compression && \
  mkdir -p app && tar -xf dist/latest/home-gallery-*.tar.gz -C app

# Final image
FROM node:24-alpine
LABEL org.opencontainers.image.authors="github@josia.eu"
LABEL org.opencontainers.image.url="https://home-gallery.org"
LABEL org.opencontainers.image.documentation="https://docs.home-gallery.org"
LABEL org.opencontainers.image.source="https://github.com/josiadit/home-gallery"

RUN apk add --no-cache \
  ffmpeg \
  vips-tools \
  perl

COPY --from=builder /build/app /app

VOLUME [ "/data" ]

WORKDIR /data

ENV HOME=/data
ENV GALLERY_BASE_DIR=/data
ENV GALLERY_CONFIG_DIR=/data/config
ENV GALLERY_CACHE_DIR=/data
ENV GALLERY_CONFIG=/data/config/gallery.config.yml
ENV GALLERY_OPEN_BROWSER=false
ENV GALLERY_USE_NATIVE=ffprobe,ffmpeg
# Use polling for safety of possible network mounts. Try 0 to use inotify via fs.watch
ENV GALLERY_WATCH_POLL_INTERVAL=300

EXPOSE 3000

ENTRYPOINT [ "node", "/app/gallery.js" ]
