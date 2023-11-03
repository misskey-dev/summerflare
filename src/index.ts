import { Hono } from "hono";
import summary from "./summary";
import { getNormalizer } from "./encoding";

export interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
  //
  // Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
  // MY_SERVICE: Fetcher;
}

const app = new Hono<Env>();

app.onError((error, context) => {
  console.error(error);
  return context.json({ error: error.message, stack: error.stack }, 500);
});

app.get("/url", async (context) => {
  let url: URL;
  try {
    url = new URL(context.req.query("url")!);
  } catch (e) {
    return context.json({ error: "Invalid URL" }, 400);
  }
  const response = await fetch(url);
  url = new URL(response.url);
  const [left, right] = response.body!.tee();
  const normalizer = await getNormalizer(new Response(left, response));
  const rewriter = new HTMLRewriter();
  const summarized = summary(url, rewriter);
  const reader = rewriter
    .transform(new Response(right.pipeThrough(normalizer), response))
    .body!.getReader();
  while (!(await reader.read()).done);
  return context.json(await summarized);
});

export default app;
