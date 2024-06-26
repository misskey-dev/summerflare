import { decode } from "html-entities"
import { assign } from "../common"
import type Context from "../../context"
import type { PrioritizedReference } from "../common"

export default function getPlayerUrlWidth(context: Context) {
  const { promise, resolve, reject } = Promise.withResolvers<number | null>()
  const result: PrioritizedReference<string | null> = {
    bits: 2, // 0-3
    priority: 0,
    content: null,
  }
  context.html.on('meta[property="twitter:player:width"]', {
    element(element) {
      const content = element.getAttribute("content")
      if (content) {
        assign(result, 3, decode(content))
      }
    },
  })
  context.html.on('meta[name="twitter:player:width"]', {
    element(element) {
      const content = element.getAttribute("content")
      if (content) {
        assign(result, 2, decode(content))
      }
    },
  })
  context.html.on('meta[property="og:video:width"]', {
    element(element) {
      const content = element.getAttribute("content")
      if (content) {
        assign(result, 1, decode(content))
      }
    },
  })
  context.html.onDocument({
    end() {
      const content = parseInt(result.content!, 10)
      resolve(Number.isNaN(content) ? null : content)
    },
  })
  return promise
}
