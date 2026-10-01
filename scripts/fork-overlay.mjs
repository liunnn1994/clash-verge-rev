import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(process.argv[2] || '.')
const repository = 'liunnn1994/clash-verge-rev'
const publicKey =
  'dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXk6IDNGREZEQzQ3M0Q2OUI0ODcKUldTSHRHazlSOXpmUDV0ei9DVTB5dTNKVW5SZ01UR2dUK3V0dDE0U2ZyakhsMG9uY0NxQXh0TFkK'

function patch(file, pattern, replacement) {
  const path = resolve(root, file)
  const source = readFileSync(path, 'utf8')
  const matches = source.match(
    new RegExp(pattern.source, pattern.flags + (pattern.global ? '' : 'g')),
  )
  if (matches?.length !== 1) {
    throw new Error(
      `Upstream structure changed in ${file}; review the fork overlay`,
    )
  }
  writeFileSync(path, source.replace(pattern, replacement))
}

patch(
  'scripts/prebuild.mjs',
  /function clashMeta\(\) \{[\s\S]*?\n\}/,
  'function clashMeta() {\n  return ninjaKernel(platform, arch, SIDECAR_HOST)\n}',
)
patch(
  'scripts/prebuild.mjs',
  /import \{ resolveServiceRelease \}/,
  "import { ninjaKernel } from './ninja-kernel.mjs'\nimport { resolveServiceRelease }",
)
patch(
  'scripts/prebuild.mjs',
  / {4}\} else \{\n {6}const readStream = fs.createReadStream\(tempZip\)/,
  `    } else if (zipFile.endsWith('.bin')) {
      await fsp.rename(tempZip, sidecarPath)
      if (platform !== 'win32') await fsp.chmod(sidecarPath, 0o755)
    } else {
      const readStream = fs.createReadStream(tempZip)`,
)
patch(
  'src-tauri/src/utils/network.rs',
  /HeaderValue::from_str\(&format!\("clash-verge\/v\{\}", env!\("CARGO_PKG_VERSION"\)\)\)\?/,
  'HeaderValue::from_str("clash-ninja")?',
)

for (const file of [
  'src-tauri/tauri.conf.json',
  'src-tauri/webview2.x64.json',
  'src-tauri/webview2.x86.json',
  'src-tauri/webview2.arm64.json',
]) {
  patch(file, /"pubkey": "[^"]+"/, `"pubkey": "${publicKey}"`)
  const path = resolve(root, file)
  const source = readFileSync(path, 'utf8')
  if (
    !source.includes(
      'github.com/clash-verge-rev/clash-verge-rev/releases/download/updater/',
    )
  ) {
    throw new Error(
      `Upstream updater endpoints changed in ${file}; review the fork overlay`,
    )
  }
  writeFileSync(
    path,
    source.replaceAll(
      'github.com/clash-verge-rev/clash-verge-rev/releases/download/updater/',
      `github.com/${repository}/releases/download/updater/`,
    ),
  )
}

for (const file of [
  'scripts/updater.mjs',
  'scripts/updater-fixed-webview2.mjs',
]) {
  patch(
    file,
    /const \{ name, browser_download_url \} = asset/,
    'const { name } = asset\n      const browser_download_url = `${asset.browser_download_url}?asset=${asset.id}`',
  )
}
