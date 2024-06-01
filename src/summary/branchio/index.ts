import { requestInit } from "../../config"
import Context from "../../context"
import { normalize } from "../../encoding"
import general from "../general"

export default async function branchio(context: Context) {
  context.url.searchParams.append("$web_only", "true")
  const response = (await fetch(context.url, requestInit(context.request))) as any as Response
  context.url = new URL(response.url)
  const rewriter = (context.html = new HTMLRewriter())
  const summarized = general(context)
  const reader = (rewriter.transform(await normalize(response)).body as ReadableStream<Uint8Array>).getReader()
  while (!(await reader.read()).done);
  const result = await summarized
  if (result === null) {
    return null
  }
  const url = new URL(result.url)
  const searchParams = new URLSearchParams(url.searchParams)
  for (const [key] of url.searchParams) {
    if (key.startsWith("_branch_")) {
      searchParams.delete(key)
    }
  }
  url.search = searchParams.toString()
  result.url = url.href
  return result
}
