import { assign } from "../common";
import type { PrioritizedReference } from "../common";

export default function getSiteName(url: URL, html: HTMLRewriter) {
  const result: PrioritizedReference<string | null> = {
    bits: 2, // 0-3
    priority: 0,
    content: url.hostname,
  };
  html.on('meta[property="og:site_name"]', {
    element(element) {
      const content = element.getAttribute("content");
      if (content) {
        assign(result, 3, content);
      }
    },
  });
  html.on('meta[name="application-name"]', {
    element(element) {
      const content = element.getAttribute("content");
      if (content) {
        assign(result, 2, content);
      }
    },
  });
  return new Promise<string | null>((resolve) => {
    html.onDocument({
      end() {
        resolve(result.content);
      },
    });
  });
}
