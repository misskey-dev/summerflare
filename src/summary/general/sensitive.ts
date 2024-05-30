import { assign } from "../common"
import type Context from "../../context"
import type { PrioritizedReference } from "../common"

export default function getSensitive(context: Context) {
  const { promise, resolve, reject } = Promise.withResolvers<boolean>()
  const result: PrioritizedReference<boolean> = {
    bits: 1, // 0-1
    priority: 0,
    content: false,
  }
  context.html.on('.tweet[data-possibly-sensitive="true"]', {
    element() {
      assign(result, 1, true)
    },
  })
  context.html.onDocument({
    end() {
      resolve(result.content)
    },
  })
  return promise
}
