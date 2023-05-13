import { decode } from "html-entities";
import clip from "summaly/built/utils/clip";
import { BufferedTextHandler, assign } from "../common";
import type { PrioritizedReference } from "../common";

export default function getDescription(url: URL, html: HTMLRewriter) {
  const result: PrioritizedReference<string | null> = {
    bits: 3, // 0-7
    priority: 0,
    content: null,
  };
  html.on(
    "#productDescription",
    new BufferedTextHandler((text) => {
      assign(result, 7, decode(text));
    })
  );
  html.on('meta[property="og:description"]', {
    element(element) {
      const content = element.getAttribute("content");
      if (content) {
        assign(result, 3, content);
      }
    },
  });
  html.on('meta[name="twitter:description"]', {
    element(element) {
      const content = element.getAttribute("content");
      if (content) {
        assign(result, 2, content);
      }
    },
  });
  html.on('meta[name="description"]', {
    element(element) {
      const content = element.getAttribute("content");
      if (content) {
        assign(result, 1, content);
      }
    },
  });
  return new Promise<string | null>((resolve) => {
    html.onDocument({
      end() {
        resolve(result.content && clip(result.content, 300));
      },
    });
  });
}
