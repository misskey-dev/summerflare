import { decode } from "html-entities"
import { assign, toAbsoluteURL } from "../common"
import type { PrioritizedReference } from "../common"

export default function getFavicon(url: URL, html: HTMLRewriter) {
  const result: PrioritizedReference<string> = {
    bits: 2, // 0-3
    priority: 0,
    content: "/favicon.ico",
  }
  html.on('link[rel="shortcut icon"]', {
    element(element) {
      const content = element.getAttribute("href")
      if (content) {
        assign(result, 3, decode(content))
      }
    },
  })
  html.on('link[rel="icon"]', {
    element(element) {
      const content = element.getAttribute("href")
      if (content) {
        assign(result, 2, decode(content))
      }
    },
  })
  return new Promise<string>((resolve) => {
    html.onDocument({
      end() {
        resolve(toAbsoluteURL(result.content, url.href))
      },
    })
  })
}
