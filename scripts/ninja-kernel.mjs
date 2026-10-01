const assets = {
  'win32-x64': 'ninja-windows-amd64.exe',
  'win32-ia32': 'ninja-windows-386.exe',
  'win32-arm64': 'ninja-windows-arm64.exe',
  'darwin-x64': 'ninja-darwin-amd64',
  'darwin-arm64': 'ninja-darwin-arm64',
  'linux-x64': 'ninja-linux-amd64',
  'linux-arm64': 'ninja-linux-arm64',
  'linux-arm': 'ninja-linux-armv7',
}

export function ninjaKernel(platform, arch, host) {
  const asset = assets[`${platform}-${arch}`]
  if (!asset) throw new Error(`No Ninja kernel for ${platform}-${arch}`)
  return {
    name: 'verge-mihomo',
    targetFile: `verge-mihomo-${host}${platform === 'win32' ? '.exe' : ''}`,
    exeFile: asset,
    zipFile: `${asset}.bin`,
    downloadURL: `https://github.com/kachetong1314/mihomo-ninja/releases/latest/download/${asset}`,
  }
}
