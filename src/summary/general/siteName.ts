import { decode } from "html-entities"
import { assign } from "../common"
import type Context from "../../context"
import type { PrioritizedReference } from "../common"

export default function getSiteName(context: Context) {
  const { promise, resolve, reject } = Promise.withResolvers<string | null>()
  const result: PrioritizedReference<string | null> = {
    bits: 2, // 0-3
    priority: 0,
    content: context.url.hostname,
  }
  context.html.on('meta[property="og:site_name"]', {
    element(element) {
      const content = element.getAttribute("content")
      if (content) {
        assign(result, 3, decode(content))
      }
    },
  })
  context.html.on('meta[name="application-name"]', {
    element(element) {
      const content = element.getAttribute("content")
      if (content) {
        assign(result, 2, decode(content))
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
