const MAX_NATIVE_IMAGE_BYTES = 8 * 1024 * 1024

export type NativeImageProtocol = "iterm"

export interface NativeImagePlacement {
  protocol: NativeImageProtocol
  base64: string
  x: number
  y: number
  width: number
  height: number
}

function safeInteger(value: number, name: string): number {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error(`Native image ${name} must be a non-negative integer`)
  return value
}

export function pngDataUriBase64(source: string): string {
  const prefix = "data:image/png;base64,"
  if (!source.startsWith(prefix)) throw new Error("Native images currently require an inline PNG data URI")
  const base64 = source.slice(prefix.length)
  if (
    !base64 ||
    base64.length > Math.ceil((MAX_NATIVE_IMAGE_BYTES * 4) / 3) + 4 ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(base64)
  ) {
    throw new Error("Native image PNG data is invalid or too large")
  }
  return base64
}

export function nativeImageFrame(placements: readonly NativeImagePlacement[]): Uint8Array {
  const chunks: string[] = []
  for (const placement of placements) {
    const x = safeInteger(placement.x, "x")
    const y = safeInteger(placement.y, "y")
    const width = safeInteger(placement.width, "width")
    const height = safeInteger(placement.height, "height")
    if (!width || !height) continue
    if (placement.protocol !== "iterm") throw new Error(`Unsupported native image protocol: ${placement.protocol}`)
    chunks.push(
      `\x1b7\x1b[${y + 1};${x + 1}H\x1b]1337;File=inline=1;width=${width};height=${height};preserveAspectRatio=1:${placement.base64}\x07\x1b8`,
    )
  }
  return new TextEncoder().encode(chunks.join(""))
}
