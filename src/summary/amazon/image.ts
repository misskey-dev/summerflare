import { decode } from "html-entities"
import { assign, toAbsoluteURL } from "../common"
import type { PrioritizedReference } from "../common"

export default function getImage(url: URL, html: HTMLRewriter) {
  const result: PrioritizedReference<string | null> = {
    bits: 4, // 0-15
    priority: 0,
    content: null,
  }
  html.on("#landingImage", {
    element(element) {
      const content = element.getAttribute("src")
      if (content) {
        assign(result, 15, decode(content))
      }
    },
  })
  html.on('meta[property="og:image"]', {
    element(element) {
      const content = element.getAttribute("content")
      if (content) {
        assign(result, 7, decode(content))
      }
    },
  })
  html.on('meta[name="twitter:image"]', {
    element(element) {
      const content = element.getAttribute("content")
      if (content) {
        assign(result, 6, decode(content))
      }
    },
  })
  html.on('link[rel="image_src"]', {
    element(element) {
      const content = element.getAttribute("href")
      if (content) {
        assign(result, 5, decode(content))
      }
    },
  })
  html.on('link[rel="apple-touch-icon"]', {
    element(element) {
      const content = element.getAttribute("href")
      if (content) {
        assign(result, 4, decode(content))
      }
    },
  })
  html.on('link[rel="apple-touch-icon image_src"]', {
    element(element) {
      const content = element.getAttribute("href")
      if (content) {
        assign(result, 3, decode(content))
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
