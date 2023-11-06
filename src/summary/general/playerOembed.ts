import { assign } from "../common";
import { PlayerReference } from "./player";
import he from "he";

export default function getPlayerOembed(
  url: URL,
  html: HTMLRewriter,
  player: PlayerReference,
  priority: number,
) {
  html.on('link[type="application/json+oembed"]', {
    async element(element) {
      const oembedInfoUrl = he.decode(
        element.getAttribute("href") ?? "",
      );
      if (!oembedInfoUrl) return;

      console.log("url", oembedInfoUrl);

      const oembedInfo: unknown = await fetch(oembedInfoUrl, {
        cf: {
          cacheTtl: 60 * 60 * 3,
          cacheEverything: true,
        },
      }).then((x) => x.json());

      if (typeof oembedInfo != "object" || oembedInfo == null) return;

      if ("url" in oembedInfo && typeof oembedInfo.url == "string") {
        assign(player.urlGeneral, priority, oembedInfo.url);
      }

      if ("width" in oembedInfo && typeof oembedInfo.width == "number") {
        assign(player.width, priority, oembedInfo.width);
      }

      if ("height" in oembedInfo && typeof oembedInfo.height == "number") {
        assign(player.height, priority, oembedInfo.height);
      }

      if ("html" in oembedInfo && typeof oembedInfo.html == "string") {
        const html = new HTMLRewriter();
        html.on("iframe", {
          element(element) {
            console.log(element.getAttribute("allow"));
            assign(
              player.allow,
              priority,
              element.getAttribute("allow")?.replace(/^\s*|\s*$/g, "").split(
                /\s*;\s*/,
              ) ?? [],
            );
          },
        });

        const reader = html.transform(
          new Response(oembedInfo.html, {
            headers: { "Content-Type": "text/html" },
          }),
        ).body?.getReader();

        while (reader != null && !(await reader.read()).done);
      }
    },
  });
}
