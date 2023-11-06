export interface PrioritizedReference<T> {
  bits: number;
  priority: number;
  content: T;
}

export function prioritizedReference<T>(
  content: T,
  bits = 2,
): PrioritizedReference<T> {
  return {
    bits,
    priority: 0,
    content,
  };
}

export function assign<T>(
  target: PrioritizedReference<T>,
  priority: PrioritizedReference<T>["priority"],
  content: PrioritizedReference<T>["content"],
): void {
  if (target.priority <= priority) {
    target.priority = priority;
    target.content = content;
  }
}

export function subAssign<T>(
  parent: PrioritizedReference<T>,
  parentPriority: PrioritizedReference<T>["priority"],
  target: PrioritizedReference<T>,
  priority: PrioritizedReference<T>["priority"],
  content: PrioritizedReference<T>["content"],
): void {
  if (target.priority <= priority) {
    target.priority = priority;
    target.content = content;
    parent.priority = parentPriority;
    parent.content = content;
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
    this.callback(this.buffer += text.text);
  }
}
