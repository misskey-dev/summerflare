// due to the bug in the Cloudflare Workers runtime, we have to use @zxing/text-encoding instead of the built-in TextEncoder/TextDecoder.
import { encodingIndexes } from "@zxing/text-encoding/esm/encoding-indexes";
(globalThis as any).TextEncodingIndexes = { encodingIndexes };

import { TextDecoder, TextEncoder } from "@zxing/text-encoding";
import MIMEType from "whatwg-mimetype";

function getCharsetFromHeader(response: Response): string | null {
  const contentType = response.headers.get("Content-Type");
  if (contentType === null) {
    return null;
  }
  try {
    const mimeType = new MIMEType(contentType);
    return mimeType.parameters.get("charset") ?? null;
  } catch {
    return null;
  }
}

async function getCharsetFromBody(response: Response): Promise<string | null> {
  let charset: string | null = null;
  const rewriter = new HTMLRewriter();
  rewriter.on("meta", {
    element(element) {
      const httpEquiv = element.getAttribute("http-equiv");
      if (
        charset === null &&
        httpEquiv !== null &&
        httpEquiv.toLowerCase() === "content-type"
      ) {
        const content = element.getAttribute("content");
        if (content !== null) {
          try {
            const mimeType = new MIMEType(content);
            charset = mimeType.parameters.get("charset") ?? null;
          } catch {}
        }
      }
      const charsetAttr = element.getAttribute("charset");
      if (charsetAttr !== null) {
        charset = charsetAttr;
      }
    },
  });
  const reader = rewriter.transform(response).body!.getReader();
  while (!(await reader.read()).done);
  return charset;
}

export async function getNormalizer(
  response: Response
): Promise<TransformStream<Uint8Array, Uint8Array>> {
  const charset =
    getCharsetFromHeader(response) ?? (await getCharsetFromBody(response));
  if (charset === null || charset.toLowerCase() === "utf-8") {
    return new TransformStream();
  }
  const decoder = new TextDecoder(charset, { fatal: true, ignoreBOM: true });
  const encoder = new TextEncoder();
  const transform = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      controller.enqueue(
        encoder.encode(decoder.decode(chunk, { stream: true }))
      );
    },
  });
  return transform;
}
