import { UniversalDetector } from "jschardet/src"
import MIMEType from "whatwg-mimetype"

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
    const rewriter = new HTMLRewriter()
    rewriter.on("meta", {
      element(element) {
        const httpEquiv = element.getAttribute("http-equiv")?.toLowerCase()
        if (httpEquiv === "content-type") {
          headers.set(httpEquiv, element.getAttribute("content")!)
        }
      },
    })
    const reader = rewriter.transform(new Response(right, response)).body!.getReader()
    while (!(await reader.read()).done);
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
