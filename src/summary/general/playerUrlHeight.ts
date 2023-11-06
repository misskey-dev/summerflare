import { assign, prioritizedReference, subAssign } from "../common";
import type { PrioritizedReference } from "../common";
import { PlayerReference } from "./player";

export default function getPlayerUrlHeight(
  url: URL,
  html: HTMLRewriter,
  player: PlayerReference,
  priority: number,
) {
  const result = prioritizedReference<number | null>(null);

  html.on('meta[property="twitter:player:height"]', {
    element(element) {
      const content = element.getAttribute("content");
      if (content) {
        subAssign(player.height, priority, result, 3, parseInt(content));
      }
    },
  });
  html.on('meta[name="twitter:player:height"]', {
    element(element) {
      const content = element.getAttribute("content");
      if (content) {
        subAssign(player.height, priority, result, 2, parseInt(content));
      }
    },
  });
  html.on('meta[property="og:video:height"]', {
    element(element) {
      const content = element.getAttribute("content");
      if (content) {
        subAssign(player.height, priority, result, 1, parseInt(content));
      }
    },
  });
}
