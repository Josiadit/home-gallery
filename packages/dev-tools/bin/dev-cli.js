#!/usr/bin/env node

import esbuild from 'esbuild'
import { glob } from 'glob'

const args = process.argv.splice(2)
const command = args.shift()

if (command == 'build') {
  build(args).catch(handleError)
}


async function build(args) {
  const watch = args.indexOf('--watch') >= 0

  const files = await glob('./src/**/*.{ts,js}', {
    ignore: {
      ignored: p => p.name.match(/test/) || p.name.match(/\.ne$/)
    }
  })

  const targets = [
    {
      entryPoints: files,
      sourcemap: true,
      platform: 'node',
      target: 'es2022',
      format: 'esm',
      outdir: 'dist'
    }
  ]

  if (watch) {
    // Use context() for watch mode in esbuild >= 0.13
    return Promise.all(targets.map(async target => {
      const ctx = await esbuild.context(target)
      return ctx.watch()
    }))
      .catch(cause => { throw new Error(`Build failed: ${cause}`, {cause}) })
  } else {
    // Use build() for one-off builds
    return Promise.all(targets.map(target => esbuild.build(target)))
      .catch(cause => { throw new Error(`Build failed: ${cause}`, {cause}) })
  }
}

function handleError(err) {
  console.log(`dev failed: ${err}`);
  process.exit(1)
}