import { describe, expect, test } from "bun:test"
import { nativeImageFrame, pngDataUriBase64 } from "./native-image.js"

describe("native image protocol", () => {
  test("emits an iTerm PNG placement at terminal-cell coordinates", () => {
    const frame = new TextDecoder().decode(
      nativeImageFrame([{ protocol: "iterm", base64: "iVBORw0KGgo=", x: 2, y: 3, width: 12, height: 7 }]),
    )

    expect(frame).toBe(
      "\x1b7\x1b[4;3H\x1b]1337;File=inline=1;width=12;height=7;preserveAspectRatio=1:iVBORw0KGgo=\x07\x1b8",
    )
  })

  test("extracts bounded inline PNG data and rejects other media", () => {
    expect(pngDataUriBase64("data:image/png;base64,iVBORw0KGgo=")).toBe("iVBORw0KGgo=")
    expect(() => pngDataUriBase64("data:image/jpeg;base64,iVBORw0KGgo=")).toThrow("inline PNG")
    expect(() => pngDataUriBase64("data:image/png;base64,not base64")).toThrow("invalid")
  })
})
