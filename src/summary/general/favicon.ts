import { decode } from "html-entities"
import { assign, toAbsoluteURL } from "../common"
import type Context from "../../context"
import type { PrioritizedReference } from "../common"

export default function getFavicon(context: Context) {
  const { promise, resolve, reject } = Promise.withResolvers<string>()
  const result: PrioritizedReference<string> = {
    bits: 2, // 0-3
    priority: 0,
    content: "/favicon.ico",
  }
  context.html.on('link[rel="shortcut icon"]', {
    element(element) {
      const content = element.getAttribute("href")
      if (content) {
        assign(result, 3, decode(content))
      }
    },
  })
  context.html.on('link[rel="icon"]', {
    element(element) {
      const content = element.getAttribute("href")
      if (content) {
        assign(result, 2, decode(content))
      }
    },
  })
  context.html.onDocument({
    end() {
      resolve(toAbsoluteURL(result.content, context.url.href))
    },
  })
  return promise
}
