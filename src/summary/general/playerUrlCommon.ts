import { decode } from "html-entities"
import { assign, toAbsoluteURL } from "../common"
import type { PrioritizedReference } from "../common"

export default function getPlayerUrlCommon(url: URL, html: HTMLRewriter) {
  const result: PrioritizedReference<string | null> = {
    bits: 2, // 0-3
    priority: 0,
    content: null,
  }
  html.on('meta[property="og:video"]', {
    element(element) {
      const content = element.getAttribute("content")
      if (content) {
        assign(result, 3, decode(content))
      }
    },
  })
  html.on('meta[property="og:video:secure_url"]', {
    element(element) {
      const content = element.getAttribute("content")
      if (content) {
        assign(result, 2, decode(content))
      }
    },
  })
  html.on('meta[property="og:video:url"]', {
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
        resolve(result.content ? toAbsoluteURL(result.content, url.href) : null)
      },
    })
  })
}
