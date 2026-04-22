import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const copyDir = async (src, dest) => {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        entry.isDirectory()
            ? await copyDir(srcPath, destPath)
            : await fs.copyFile(srcPath, destPath);
    }
};

const readPackage = async (baseDir) => {
    const pkg = await fs.readFile(path.join(baseDir, 'package.json'), 'utf8')
    return JSON.parse(pkg);
}

const parseArgReducer = (options, arg) => {
    if (arg.length <= 2 || !arg.startsWith('--')) {
        return options;
    }
    let [name, value] = arg.substr(2).split('=')
    name = name.replace(/-./g, m => m.substr(1, 1).toUpperCase())
    options[name] = typeof value != 'undefined' ? value : true
    return options;
}

const parseOptions = async () => {
    const rootDir = path.dirname(__dirname);
    const pkg = await readPackage(rootDir)
    const args = process.argv.slice(2)
    const config = args.reduce(parseArgReducer, {
        bundleFile: 'bundle.yml',
        version: pkg.version || '1.0.0'
    });
    return config
}

const run = async() => {
    const { getBundleFiles } = await import('@home-gallery/bundle')
    const options = await parseOptions()

    console.log(`Starting fast-bundle for version ${options.version}...`);

    const bundleResult = await getBundleFiles(options);

    const targetDir = path.join(process.cwd(), 'app');
    await fs.mkdir(targetDir, { recursive: true });

    for (const file of bundleResult.files) {
        const dest = path.join(targetDir, file.relative);
        await fs.mkdir(path.dirname(dest), { recursive: true });
        await fs.copyFile(file.absolute, dest);
        const stats = await fs.stat(file.absolute);
        await fs.chmod(dest, stats.mode);
    }

    console.log(`Successfully bundled into ${targetDir}`);
}

run()
    .then(() => console.log(`Bundling done`))
    .catch(e => {
        console.error(`Bundling failed! ${e}`)
        process.exit(1)
    })