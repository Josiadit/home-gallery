const esbuild = require('esbuild');
const args = process.argv.splice(2)
const watch = args.indexOf('--watch') >= 0

const targets = [
  {
    entryPoints: ['./src/App.ts'],
    bundle: true,
    minify: !watch,
    sourcemap: true,
    platform: 'browser',
    target: 'es2020',
    outdir: 'dist'
  },
  {
    entryPoints: ['./src/remote-console.js'],
    bundle: true,
    minify: !watch,
    sourcemap: true,
    platform: 'browser',
    target: 'es2015',
    outdir: 'dist'
  }
]

const catchError = e => {
  console.error(`Build faild due ${e}`, e)
  process.exit(1)
}

if (watch) {
  // Use context() for watch mode in esbuild >= 0.13
  Promise.all(targets.map(async target => {
    const ctx = await esbuild.context(target)
    return ctx.watch()
  })).catch(catchError)
} else {
  // Use build() for one-off builds
  Promise.all(targets.map(target => esbuild.build(target))).catch(catchError)
}
