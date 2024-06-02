export interface Summary {
  title: string | null
  description: string | null
  thumbnail: string | null
  player: ValidPlayer | NullPlayer
  sensitive: boolean
  large: boolean
  icon: string | null
  sitename: string | null
  url: string
}

export interface ValidPlayer {
  url: string
  width: number
  height: number
  allow: string[]
}

export interface NullPlayer {
  url: null
  width: null
  height: null
  allow: []
}

export interface PrioritizedReference<T> {
  bits: number
  priority: number
  content: T
}

export function assign<T>(target: PrioritizedReference<T>, priority: PrioritizedReference<T>["priority"], content: PrioritizedReference<T>["content"]): void {
  if (target.priority <= priority) {
    target.priority = priority
    target.content = content
  }
}

export function toAbsoluteURL(url: string, base: string) {
  if (/^https?:\/\//.test(url)) {
    return url
  } else {
    return new URL(url, base).href
  }
}

export function cleanupTitle(title: string, siteName: string) {
  if (title.endsWith(siteName)) {
    return title
      .slice(0, -siteName.length)
      .trim()
      .replace(/[\-\|:·・]+$/, "")
      .trim()
  }
  return title
}

const grapheme = new Intl.Segmenter()
const word = new Intl.Segmenter([], { granularity: "word" })
const ellipsis = "…"
const ellipsisLength = Array.from(grapheme.segment(ellipsis)).length

export function clip(text: string, length: number) {
  const graphemes = Array.from(grapheme.segment(text))
  if (graphemes.length <= length) {
    return text
  }
  const last = graphemes.at(length - ellipsisLength)!
  const words = Array.from(word.segment(text))
  let count = 0
  for (let i = 0; i < words.length; i++) {
    if (words[i].index === last.index) {
      break
    }
    if (words[i].index > last.index) {
      count--
      break
    }
    count++
  }
  return (
    words
      .slice(0, count)
      .map((g) => g.segment)
      .join("") + ellipsis
  )
}

if (import.meta.vitest) {
  const { describe, expect, test } = await import("vitest")
  describe(clip.name, () => {
    test("Japanese", () => {
      expect(clip("吾輩は猫である。名前はまだない。", 1)).toBe("…")
      expect(clip("吾輩は猫である。名前はまだない。", 2)).toBe("…") // 吾輩 is a single word in Japanese, so it should be clipped entirely.
      expect(clip("吾輩は猫である。名前はまだない。", 3)).toBe("吾輩…")
      expect(clip("吾輩は猫である。名前はまだない。", 4)).toBe("吾輩は…")
    })
  })
}

export class BufferedTextHandler {
  private buffer = ""

  constructor(private readonly callback: (text: string) => void) {}

  text(text: Text) {
    this.callback((this.buffer += text.text))
  }
}
