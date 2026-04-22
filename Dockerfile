# Builder stage: compile and bundle the application
FROM node:24-alpine AS builder
ARG TARGETPLATFORM
ARG NO_SHARP

WORKDIR /build

# Install pnpm globally for faster, more efficient dependency management
RUN npm install -g pnpm

# Copy dependency files FIRST for better layer caching
# If these haven't changed, Docker can reuse the cached layer
COPY package.json ./

# Copy package.json files from all workspace packages (needed for pnpm workspace resolution)
COPY packages/*/package.json packages/*/

# Copy scripts early (needed for disable-dependency.js)
COPY scripts ./scripts/

# Disable native modules that may fail on certain platforms BEFORE install
RUN node scripts/disable-dependency.js api-server && \
  if [[ -n "$NO_SHARP" || "$TARGETPLATFORM" == "linux/arm/v6" || "$TARGETPLATFORM" == "linux/arm/v7" || "$TARGETPLATFORM" == "linux/arm64" ]]; then \
    node scripts/disable-dependency.js --prefix=packages/extractor sharp ; \
  fi

# Install dependencies with pnpm (faster, more deterministic)
RUN pnpm install --frozen-lockfile

# Copy remaining source files and configuration
COPY tsconfig.base.json bundle-docker.yml gallery.js gallery.config-example.yml README.md LICENSE ./
COPY e2e ./e2e/
COPY packages ./packages/

# Build the project
RUN pnpm run build

# Bundle without compression (creates .tar instead of .tar.gz for faster builds)
RUN node scripts/bundle.js --bundle-file=bundle-docker.yml --no-compression && \
  mkdir -p /build/app && \
  tar -xf dist/latest/home-gallery-*.tar -C /build/app --strip-components=1

# Final runtime image - minimal and optimized
FROM node:24-alpine
LABEL org.opencontainers.image.authors="github@josia.eu"
LABEL org.opencontainers.image.url="https://home-gallery.org"
LABEL org.opencontainers.image.documentation="https://docs.home-gallery.org"
LABEL org.opencontainers.image.source="https://github.com/josiadit/home-gallery"

# Install runtime dependencies only
RUN apk add --no-cache \
  ffmpeg \
  vips-tools \
  perl

# Copy only the bundled app from builder stage
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
ENV GALLERY_WATCH_POLL_INTERVAL=300

EXPOSE 3000

ENTRYPOINT [ "node", "/app/gallery.js" ]
