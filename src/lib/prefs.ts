// EXPORTS: useShowComments, setShowComments, showComments

const STORAGE_KEY = 'cpp-notes-studio:prefs-v1';

interface Prefs {
  showComments: boolean;
}

const listeners = new Set<() => void>();

function readPrefs(): Prefs {
  if (typeof window === 'undefined') return { showComments: true };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { showComments: true };
    const parsed = JSON.parse(raw) as Partial<Prefs>;
    return { showComments: parsed.showComments !== false };
  } catch {
    return { showComments: true };
  }
}

let prefs: Prefs = readPrefs();

export function showComments(): boolean {
  return prefs.showComments;
}

export function setShowComments(next: boolean): void {
  prefs = { ...prefs, showComments: next };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // 忽略隐私模式下的写入失败
  }
  listeners.forEach((fn) => fn());
}

export function subscribePrefs(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
