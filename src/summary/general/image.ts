import { decode } from "html-entities"
import { assign, toAbsoluteURL } from "../common"
import type Context from "../../context"
import type { PrioritizedReference } from "../common"

export default function getImage(context: Context) {
  const { promise, resolve, reject } = Promise.withResolvers<string | null>()
  const result: PrioritizedReference<string | null> = {
    bits: 3, // 0-7
    priority: 0,
    content: null,
  }
  context.html.on('meta[property="og:image"]', {
    element(element) {
      const content = element.getAttribute("content")
      if (content) {
        assign(result, 7, decode(content))
      }
    },
  })
  context.html.on('meta[name="twitter:image"]', {
    element(element) {
      const content = element.getAttribute("content")
      if (content) {
        assign(result, 6, decode(content))
      }
    },
  })
  context.html.on('link[rel="image_src"]', {
    element(element) {
      const content = element.getAttribute("href")
      if (content) {
        assign(result, 5, decode(content))
      }
    },
  })
  context.html.on('link[rel="apple-touch-icon"]', {
    element(element) {
      const content = element.getAttribute("href")
      if (content) {
        assign(result, 4, decode(content))
      }
    },
  })
  context.html.on('link[rel="apple-touch-icon image_src"]', {
    element(element) {
      const content = element.getAttribute("href")
      if (content) {
        assign(result, 3, decode(content))
      }
    },
  })
  context.html.onDocument({
    end() {
      resolve(result.content ? toAbsoluteURL(result.content, context.url.href) : null)
    },
  })
  return promise
}
