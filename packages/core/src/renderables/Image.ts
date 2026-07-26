import { Renderable, type RenderableOptions } from "../Renderable.js"
import type { OptimizedBuffer } from "../buffer.js"
import { pngDataUriBase64, type NativeImageProtocol } from "../lib/native-image.js"
import type { RenderContext } from "../types.js"

export interface ImageOptions extends RenderableOptions<ImageRenderable> {
  source: string
  protocol?: NativeImageProtocol
}

export class ImageRenderable extends Renderable {
  private _source: string
  private _protocol: NativeImageProtocol
  private _base64: string

  constructor(ctx: RenderContext, options: ImageOptions) {
    super(ctx, options)
    this._source = options.source
    this._protocol = options.protocol ?? "iterm"
    this._base64 = pngDataUriBase64(options.source)
  }

  get source(): string {
    return this._source
  }

  set source(value: string) {
    if (value === this._source) return
    this._base64 = pngDataUriBase64(value)
    this._source = value
    this.requestRender()
  }

  get protocol(): NativeImageProtocol {
    return this._protocol
  }

  set protocol(value: NativeImageProtocol) {
    if (value === this._protocol) return
    this._protocol = value
    this.requestRender()
  }

  protected renderSelf(_buffer: OptimizedBuffer): void {
    if (!this.visible || this.isDestroyed || this.width < 1 || this.height < 1) return
    this._ctx.registerNativeImage?.({
      protocol: this._protocol,
      base64: this._base64,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    })
  }
}
