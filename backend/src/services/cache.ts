type Entry<T> = { value: T; expiresAt: number };

export class MemoryCache {
  private entries = new Map<string, Entry<unknown>>();
  constructor(private readonly ttlMs = 30_000) {}

  get<T>(key: string): T | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= Date.now()) {
      this.entries.delete(key);
      return undefined;
    }
    return entry.value as T;
  }
  set<T>(key: string, value: T) {
    this.entries.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }
  clear() {
    this.entries.clear();
  }
}
