import chalk from 'chalk'

// credits to TJ Holowaychuk <tj@vision-media.ca> from debug package
// for color values and hash algorithm
const colors16Names = [
  'cyan', 'green', 'yellow', 'blue', 'red', 'magenta'
]

const colors256 = [
  20, 21, 26, 27, 32, 33, 38, 39, 40, 41, 42, 43, 44, 45, 56, 57,
  62, 63, 68, 69, 74, 75, 76, 77, 78, 79, 80, 81, 92, 93, 98, 99,
  112, 113, 128, 129, 134, 135, 148, 149, 160, 161, 162, 163, 164, 165, 166, 167,
  168, 169, 170, 171, 172, 173, 178, 179, 184, 185, 196, 197, 198, 199, 200, 201,
  202, 203, 204, 205, 206, 207, 208, 209, 214, 215, 220, 221
]

const moduleHash = module => {
  let hash = 0;

  for (let i = 0; i < module.length; i++) {
    hash = ((hash << 5) - hash) + module.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return Math.abs(hash)
}

const identityFn = v => v

const colorNoneFns = {
  moduleColorFn: () => identityFn,
  durationColorFn: () => '',
  trace: { levelColorFn: identityFn, msgColorFn: identityFn },
  debug: { levelColorFn: identityFn, msgColorFn: identityFn },
  info: { levelColorFn: identityFn, msgColorFn: identityFn },
  warn: { levelColorFn: identityFn, msgColorFn: identityFn },
  error: { levelColorFn: identityFn, msgColorFn: identityFn },
  fatal: { levelColorFn: identityFn, msgColorFn: identityFn },
}

const color16Fns = {
  moduleColorFn: module => {
    const colorName = colors16Names[moduleHash(module) % colors16Names.length]
    return v => chalk[colorName].bold(v)
  },
  durationColorFn: v => chalk.gray(v),
  trace: { levelColorFn: v => chalk.gray(v), msgColorFn: v => chalk.gray(v) },
  debug: { levelColorFn: v => chalk.gray(v), msgColorFn: v => chalk.gray(v) },
  info: { levelColorFn: identityFn, msgColorFn: identityFn },
  warn: { levelColorFn: v => chalk.yellow.bold(v), msgColorFn: v => chalk.yellow(v) },
  error: { levelColorFn: v => chalk.red.bold(v), msgColorFn: v => chalk.red(v) },
  fatal: { levelColorFn: v => chalk.black.bgRed.bold(v), msgColorFn: v => chalk.red(v) }
}

const color256Fns = Object.assign({}, color16Fns, {
  moduleColorFn: module => v => chalk.ansi256(colors256[moduleHash(module) % colors256.length]).bold(v),
})

// In chalk v5, force color support to true by default
// Users can still disable it via environment variables if needed
chalk.level = Math.max(chalk.level || 3, 2)

// Determine color support
const getColorFns = () => {
  const level = chalk.level
  if (level === 0) {
    return colorNoneFns
  } else if (level < 2) {
    return color16Fns
  } else {
    return color256Fns
  }
}

export const colorFns = getColorFns()
