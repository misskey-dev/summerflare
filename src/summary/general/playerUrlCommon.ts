import {
  assign,
  prioritizedReference,
  subAssign,
  toAbsoluteURL,
} from "../common";
import type { PrioritizedReference } from "../common";
import { PlayerReference } from "./player";

export default function getPlayerUrlCommon(
  url: URL,
  html: HTMLRewriter,
  player: PlayerReference,
  priority: number,
) {
  const result = prioritizedReference<string | null>(null);

  html.on('meta[property="og:video"]', {
    element(element) {
      const content = element.getAttribute("content");
      if (content) {
        subAssign(player.urlCommon, priority, result, 3, content);
      }
    },
  });
  html.on('meta[property="og:video:secure_url"]', {
    element(element) {
      const content = element.getAttribute("content");
      if (content) {
        subAssign(player.urlCommon, priority, result, 2, content);
      }
    },
  });
  html.on('meta[property="og:video:url"]', {
    element(element) {
      const content = element.getAttribute("content");
      if (content) {
        subAssign(player.urlCommon, priority, result, 1, content);
      }
    },
  });
}
