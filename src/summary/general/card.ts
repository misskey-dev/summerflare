import { decode } from "html-entities"
import { assign } from "../common"
import type { PrioritizedReference } from "../common"

export default function getCard(url: URL, html: HTMLRewriter) {
  const result: PrioritizedReference<string | null> = {
    bits: 2, // 0-3
    priority: 0,
    content: null,
  }
  html.on('meta[name="twitter:card"]', {
    element(element) {
      const content = element.getAttribute("content")
      if (content) {
        assign(result, 2, decode(content))
      }
    },
  })
  html.on('meta[property="twitter:card"]', {
    element(element) {
      const content = element.getAttribute("content")
      if (content) {
        assign(result, 1, decode(content))
      }
    },
  })
  return new Promise<string | null>((resolve) => {
    html.onDocument({
      end() {
        resolve(result.content)
      },
    })
  })
}
