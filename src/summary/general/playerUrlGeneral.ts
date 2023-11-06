import {
  assign,
  prioritizedReference,
  subAssign,
  toAbsoluteURL,
} from "../common";
import type { PrioritizedReference } from "../common";
import { PlayerReference } from "./player";

export default function getPlayerUrlGeneral(
  url: URL,
  html: HTMLRewriter,
  player: PlayerReference,
  priority: number,
) {
  const result = prioritizedReference<string | null>(null);

  html.on('meta[property="twitter:player"]', {
    element(element) {
      const content = element.getAttribute("content");
      if (content) {
        subAssign(player.urlGeneral, priority, result, 2, content);
      }
    },
  });
  html.on('meta[name="twitter:player"]', {
    element(element) {
      const content = element.getAttribute("content");
      if (content) {
        subAssign(player.urlGeneral, priority, result, 1, content);
      }
    },
  });
}
