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

const locales = Intl.Segmenter.supportedLocalesOf(["af", "agq", "ak", "am", "ar", "ars", "as", "asa", "ast", "az", "bas", "be", "bem", "bez", "bg", "bgc", "bho", "blo", "bm", "bn", "bo", "br", "brx", "bs", "ca", "ccp", "ce", "ceb", "cgg", "chr", "ckb", "cs", "csw", "cv", "cy", "da", "dav", "de", "dje", "doi", "dsb", "dua", "dyo", "dz", "ebu", "ee", "el", "en", "eo", "es", "et", "eu", "ewo", "fa", "ff", "fi", "fil", "fo", "fr", "fur", "fy", "ga", "gd", "gl", "gsw", "gu", "guz", "gv", "ha", "haw", "he", "hi", "hr", "hsb", "hu", "hy", "ia", "id", "ie", "ig", "ii", "is", "it", "ja", "jgo", "jmc", "jv", "ka", "kab", "kam", "kde", "kea", "kgp", "khq", "ki", "kk", "kkj", "kl", "kln", "km", "kn", "ko", "kok", "ks", "ksb", "ksf", "ksh", "ku", "kw", "kxv", "ky", "lag", "lb", "lg", "lij", "lkt", "lmo", "ln", "lo", "lrc", "lt", "lu", "luo", "luy", "lv", "mai", "mas", "mer", "mfe", "mg", "mgh", "mgo", "mi", "mk", "ml", "mn", "mni", "mr", "ms", "mt", "mua", "my", "mzn", "naq", "nb", "nd", "nds", "ne", "nl", "nmg", "nn", "nnh", "no", "nqo", "nus", "nyn", "oc", "om", "or", "os", "pa", "pcm", "pl", "prg", "ps", "pt", "qu", "raj", "rm", "rn", "ro", "rof", "ru", "rw", "rwk", "sa", "sah", "saq", "sat", "sbp", "sc", "sd", "se", "seh", "ses", "sg", "shi", "si", "sk", "sl", "smn", "sn", "so", "sq", "sr", "su", "sv", "sw", "syr", "szl", "ta", "te", "teo", "tg", "th", "ti", "tk", "to", "tok", "tr", "tt", "twq", "tzm", "ug", "uk", "ur", "uz", "vai", "vec", "vi", "vmw", "vun", "wae", "wo", "xh", "xnr", "xog", "yav", "yi", "yo", "yrl", "yue", "za", "zgh", "zh", "zu"])
const segmenter = new Intl.Segmenter(locales, { granularity: "word", localeMatcher: "best fit" })
const ellipsis = "…"

export function clip(text: string, length: number) {
  const segments = segmenter.segment(text)
  let result = ""
  for (const segment of segments) {
    if (result.length + segment.segment.length > length - ellipsis.length) {
      result += ellipsis
      break
    }
    result += segment.segment
  }
  return result
}

export class BufferedTextHandler {
  private buffer = ""

  constructor(private readonly callback: (text: string) => void) {}

  text(text: Text) {
    this.callback((this.buffer += text.text))
  }
}
