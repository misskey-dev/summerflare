import { decode } from "html-entities"
import { UniversalDetector } from "jschardet/src"
import MIMEType from "whatwg-mimetype"
import { assign, PrioritizedReference } from "./summary/common"

function getCharset(value: string | null): string | null {
  const type = value === null ? null : MIMEType.parse(value)
  return type?.parameters.get("charset") ?? null
}

async function guessCharsetFromBody(body: ReadableStream<any>): Promise<string | null> {
  const detector = new UniversalDetector()
  const decoder = new TextDecoder()
  for await (const chunk of body) {
    detector.feed(decoder.decode(chunk, { stream: true }))
    if (detector.done) {
      break
    }
  }
  detector.close()
  return detector.result?.encoding ?? null
}

export async function normalize(response: Response): Promise<Response> {
  const headers = new Headers(response.headers)
  if (!getCharset(headers.get("content-type"))) {
    const [left, right] = response.body!.tee()
    response = new Response(left, response)
    const result: PrioritizedReference<string | null> = {
      bits: 2, // 0-3
      priority: 0,
      content: null,
    }
    const rewriter = new HTMLRewriter()
    rewriter.on("meta", {
      element(element) {
        const charset = element.getAttribute("charset")
        if (charset) {
          const mimeType = new MIMEType("text/html")
          mimeType.parameters.set("charset", decode(charset))
          assign(result, 3, mimeType.toString())
        }
        const httpEquiv = element.getAttribute("http-equiv")?.toLowerCase()
        if (httpEquiv === "content-type") {
          assign(result, 2, element.getAttribute("content")!)
        }
      },
    })
    const reader = rewriter.transform(new Response(right, response)).body!.getReader()
    while (!(await reader.read()).done);
    if (result.content) {
      headers.set("content-type", result.content)
    }
  }
  if (!headers.has("content-type")) {
    const [left, right] = response.body!.tee()
    response = new Response(left, response)
    const guessed = await guessCharsetFromBody(right)
    if (guessed) {
      headers.set("content-type", `text/html; charset=${guessed}`)
    }
  }
  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  })
}
