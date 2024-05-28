import { assign, toAbsoluteURL } from "../common"
import type { PrioritizedReference } from "../common"

export default function getPlayerUrlGeneral(url: URL, html: HTMLRewriter) {
  const result: PrioritizedReference<string | null> = {
    bits: 2, // 0-3
    priority: 0,
    content: null,
  }
  html.on('meta[property="twitter:player"]', {
    element(element) {
      const content = element.getAttribute("content")
      if (content) {
        assign(result, 3, content)
      }
    },
  })
  html.on('meta[name="twitter:player"]', {
    element(element) {
      const content = element.getAttribute("content")
      if (content) {
        assign(result, 2, content)
      }
    },
  })
  return new Promise<string | null>((resolve) => {
    html.onDocument({
      end() {
        resolve(result.content ? toAbsoluteURL(result.content, url.href) : null)
      },
    })
  })
}
