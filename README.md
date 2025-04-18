# Home Gallery

Forked from xemle's home-gallery. Most of the work was done by him.
[Home-Gallery.org](https://home-gallery.org)

[MIT License](https://en.wikipedia.org/wiki/MIT_License)

## Links

[Docker image](https://hub.docker.com/r/josiadit/home-gallery)

## Quickstart

Following steps need to be performed to use HomeGallery

* **Download** the gallery software as prebuilt binary or docker image
* **Init the configuration** with media sources like `~/Pictures`
* **Start the server** on [localhost:3000](http://localhost:3000)

```
curl -sL https://dl.home-gallery.org/dist/latest/home-gallery-latest-linux-x64 -o gallery
chmod 755 gallery
./gallery init --source ~/Pictures
./gallery run server
```

and open [localhost:3000](http://localhost:3000) in your browser. Run `./gallery -h` for
further help of the CLI.

See [dl.home-gallery.org/dist](https://dl.home-gallery.org/dist) for further binaries.
Eg. latest binaries for [Linux](https://dl.home-gallery.org/dist/latest/home-gallery-latest-linux-x64),
[Mac](https://dl.home-gallery.org/dist/latest/home-gallery-latest-darwin-x64)
or [Windows](https://dl.home-gallery.org/dist/latest/home-gallery-latest-win-x64).

The configuration `gallery.config.yml` can be found in the current directory for
fine tuning.
See [install section](https://docs.home-gallery.org/install/index.html) in the documentation
for further information.

### Quickstart using Docker

```
mkdir -p data
alias gallery="docker run -ti --rm \
  -v $(pwd)/data:/data \
  -v $HOME/Pictures:/data/Pictures \
  -u $(id -u):$(id -g) \
  -p 3000:3000 xemle/home-gallery"
gallery init --source /data/Pictures
gallery run server
```

and open [localhost:3000](http://localhost:3000) in your browser. Run `gallery -h` for
further help of the CLI.

The gallery configuration can be found in `./data/config/gallery.config.yml` for fine tuning.

Want to use docker compose? See [install](https://docs.home-gallery.org/install/index.html)
section in the documentation for further information.

## Features

- Endless photo stream via virtual scrolling
- Video transcoding
- Reverse image lookup (similar image search). If you have one sunset image, you can easily find other sunset photos in your archive without manual tagging
- Face detection and search by similar faces
- Expressive query language with and, or, not operands
- GEO location reverse lookups
- Simple mobile app through [PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps) support
- Tagging, single and multi selection
- Support of read only and offline media sources. Once the preview files are generated and their meta data are extracted, the original sources are not touched and required any more. So media from offline disk need to be extracted only once and the disk can stay offline on next runs
- Media are identified by their content. Duplicated media (identical files byte-by-byte) are only processed once. Renaming is supported without recalculating previews etc.
- Fast file changes detection such as add, removes, renames or moves
- Static web gallery site export
- Meta data export to XMP sidecar files
- Stream photos and videos to Chromcast enabled TV devices
- Runs on SoC such Raspberry PI

## Limits

The complete "database" is loaded into the browser. My 100.000 media are about
100 MB plain JSON and 12 MB compressed JSON. The performance is quite good on
current mobile device. A user reported a successful setup with over 400.000
media files. Further feedback is welcome.

# External Services and Privacy

Following services are called:

For geo reverse lookups (geo coordinates to address), HomeGallery
queries the [Nominatim Service](https://nominatim.openstreetmap.org/reverse)
from [OpenStreetMap](https://openstreetmap.org). Only geo coordinates
are transmitted.

For reverse image lookups (similar image search), object detection and face
recognition, this program uses the
the public API from xemle's Home Gallery `api.home-gallery.org`. This public API supports
low powered devices such as the SoC Raspberry PI and all preview images are
send to this public API by default. No images or privacy data are kept.

The API can be configured and ran also locally or as Docker container.
See [installation](https://docs.home-gallery.org/api-server) section for usage.

## Customized Environments

HomeGallery runs on the JavaScript runtime [NodeJS](https://nodejs.org) which
is supported by various platforms such as Linux (also Raspberry PIs), Mac and Windows.

For most cases a customized environment should be sufficient with

* [node](https://nodejs.org) version 20 LTS (or 18 old LTS)
* perl (Linux)

### Setup

```
# Clone or download the repo from GitHub
git clone https://github.com/xemle/home-gallery.git
cd home-gallery
# Install required packages
npm install
# Build required modules
npm run build
```

In some corner cases you might also need essential build tools to compile library
bindings.

* make
* g++
* python

## Development recipes

### Build

HomeGallery uses npm workspaces with multi
packages. Common npm scripts are `clean`, `build`, `test`.

To run only a subset of packages you can use pnpm's
filter feature, e.g build only module `export-static` and `database`:

```
npx pnpm -r --filter './*/{export-static,database}' build
```

### Unit Test

Run unit tests from specific packages (via pnpm)

```
npx pnpm -r --filter './*/{query,events}' test
```

### End-To-End Test

Run specific e2e tests (via [Gauge](https://gauge.org))

```
git clone https://github.com/xemle/home-gallery-e2e-data.git data
npm run test:e2e -- --tags dev
```

`home-gallery-e2e-data` contains test files using [Git LFS](https://git-lfs.github.com).

The e2e test output data are stored in `/tmp/gallery-e2e` directory. The latest test run is symlinked into the directory `latest-e2e-test` within the HomeGallery working directory. Check the `cli.log` and `e2e.log` ([ndjson](http://ndjson.org) format) in each test directory.

### Bundle

Create local binary bundle from a feature branch

```
node scripts/bundle.js --version=1.3 --snapshot=-feature-test --filter=linux-x64 --no-before --no-run
```

Create local native bundle which excludes binaries via npm like sharp, ffmpeg and ffprobe. It should contain only js code which should run everywhere. It requires external binaries vipsthumbnail, ffmpeg and ffprobe in the `PATH` environment to work properly.

```
node scripts/bundle.js --version=1.3 --snapshot=-feature-test --filter=linux-native --no-before --no-run
```

### Development Reset

To reset the current development state and start fresh on any very strange error behavior, you might run:

```
rm -rf package-lock.json node_modules e2e/node_modules packages/*/node_modules
npm install && npm run clean && npm run build
```