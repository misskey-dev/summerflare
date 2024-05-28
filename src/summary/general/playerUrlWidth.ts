import { assign } from "../common"
import type { PrioritizedReference } from "../common"

export default function getPlayerUrlWidth(url: URL, html: HTMLRewriter) {
  const result: PrioritizedReference<string | null> = {
    bits: 2, // 0-3
    priority: 0,
    content: null,
  }
  html.on('meta[property="twitter:player:width"]', {
    element(element) {
      const content = element.getAttribute("content")
      if (content) {
        assign(result, 3, content)
      }
    },
  })
  html.on('meta[name="twitter:player:width"]', {
    element(element) {
      const content = element.getAttribute("content")
      if (content) {
        assign(result, 2, content)
      }
    },
  })
  html.on('meta[property="og:video:width"]', {
    element(element) {
      const content = element.getAttribute("content")
      if (content) {
        assign(result, 1, content)
      }
    },
  })
  return new Promise<number | null>((resolve) => {
    html.onDocument({
      end() {
        const content = parseInt(result.content!, 10)
        resolve(Number.isNaN(content) ? null : content)
      },
    })
  })
}
