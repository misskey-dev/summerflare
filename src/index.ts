import { Hono } from "hono";
import summary from "./summary";

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

app.get("/url", async (context) => {
  let url: URL;
  try {
    url = new URL(context.req.query("url")!);
  } catch (e) {
    return context.json({ error: "Invalid URL" }, 400);
  }
  const response = await fetch(url);
  const rewriter = new HTMLRewriter();
  const summarized = summary(url, rewriter);
  const reader = rewriter.transform(response).body!.getReader();
  while (!(await reader.read()).done);
  return context.json(await summarized);
});

export default app;
