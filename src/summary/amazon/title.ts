import { decode } from "html-entities";
import clip from "summaly/built/utils/clip";
import { BufferedTextHandler, assign } from "../common";
import type { PrioritizedReference } from "../common";

export default function getTitle(url: URL, html: HTMLRewriter) {
  const result: PrioritizedReference<string | null> = {
    bits: 3, // 0-7
    priority: 0,
    content: null,
  };
  html.on(
    "#title",
    new BufferedTextHandler((text) => {
      assign(result, 7, decode(text));
    })
  );
  html.on('meta[property="og:title"]', {
    element(element) {
      const content = element.getAttribute("content");
      if (content) {
        assign(result, 3, content);
      }
    },
  });
  html.on('meta[name="twitter:title"]', {
    element(element) {
      const content = element.getAttribute("content");
      if (content) {
        assign(result, 2, content);
      }
    },
  });
  html.on(
    "title",
    new BufferedTextHandler((text) => {
      assign(result, 1, decode(text));
    })
  );
  return new Promise<string | null>((resolve) => {
    html.onDocument({
      end() {
        resolve(result.content && clip(result.content, 100));
      },
    });
  });
}
