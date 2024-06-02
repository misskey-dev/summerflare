import { decode } from "html-entities"
import { assign } from "../common"
import type Context from "../../context"
import type { PrioritizedReference } from "../common"

export default function getDescription(context: Context) {
  const { promise, resolve, reject } = Promise.withResolvers<string | null>()
  const result: PrioritizedReference<string | null> = {
    bits: 2, // 0-3
    priority: 0,
    content: null,
  }
  context.html.on('meta[property="og:description"]', {
    element(element) {
      const content = element.getAttribute("content")
      if (content) {
        assign(result, 3, decode(content))
      }
    },
  })
  context.html.on('meta[name="twitter:description"]', {
    element(element) {
      const content = element.getAttribute("content")
      if (content) {
        assign(result, 2, decode(content))
      }
    },
  })
  context.html.on('meta[name="description"]', {
    element(element) {
      const content = element.getAttribute("content")
      if (content) {
        assign(result, 1, decode(content))
      }
    },
  })
  context.html.onDocument({
    end() {
      resolve(result.content?.trim() || null)
    },
  })
  return promise
}
