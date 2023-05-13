export interface PrioritizedReference<T> {
  bits: number;
  priority: number;
  content: T;
}

export function assign<T>(
  target: PrioritizedReference<T>,
  priority: PrioritizedReference<T>["priority"],
  content: PrioritizedReference<T>["content"]
): void {
  if (target.priority <= priority) {
    target.priority = priority;
    target.content = content;
  }
}

export function toAbsoluteURL(url: string, base: string) {
  if (/^https?:\/\//.test(url)) {
    return url;
  } else {
    return new URL(url, base).href;
  }
}

export class BufferedTextHandler {
  private buffer = "";

  constructor(private readonly callback: (text: string) => void) {}

  text(text: Text) {
    this.callback((this.buffer += text.text));
  }
}
