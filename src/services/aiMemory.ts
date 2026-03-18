type MemoryEntry = {
  prompt: string;
  createdAt: number;
};

type MemoryState = {
  entries: MemoryEntry[];
};

const MEMORY_TTL_MS = 30 * 60 * 1000;
const MAX_ENTRIES = 5;

const memory = new Map<string, MemoryState>();

function prune(entries: MemoryEntry[]) {
  const cutoff = Date.now() - MEMORY_TTL_MS;
  const fresh = entries.filter((e) => e.createdAt >= cutoff);
  return fresh.slice(-MAX_ENTRIES);
}

export function getMemory(userId: string) {
  const state = memory.get(userId);
  if (!state) return [] as MemoryEntry[];

  const pruned = prune(state.entries);
  memory.set(userId, { entries: pruned });
  return pruned;
}

export function appendMemory(userId: string, prompt: string) {
  const state = memory.get(userId) ?? { entries: [] };
  const pruned = prune(state.entries);
  pruned.push({ prompt, createdAt: Date.now() });
  memory.set(userId, { entries: pruned.slice(-MAX_ENTRIES) });
}
