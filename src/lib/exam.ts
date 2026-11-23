// EXPORTS: useExamRecords, saveExamResult, resetExamRecords, type ExamRecord

import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'cpp-notes-studio:exam-v1';

export interface ExamRecord {
  level: number;
  /** 历史最好分数（0–100） */
  best: number;
  bestAt: string;
  /** 最近一次分数 */
  last: number;
  lastAt: string;
  /** 最近一次用时（秒） */
  lastSeconds?: number;
  tries: number;
}

type ExamMap = Record<string, ExamRecord>;

const listeners = new Set<() => void>();

function read(): ExamMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ExamMap;
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

let records: ExamMap = read();

function emit(): void {
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function saveExamResult(level: number, correct: number, total: number, seconds?: number): ExamRecord {
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;
  const now = new Date().toISOString();
  const prev = records[String(level)];
  const next: ExamRecord = {
    level,
    best: Math.max(score, prev?.best ?? 0),
    bestAt: score > (prev?.best ?? 0) ? now : prev?.bestAt ?? now,
    last: score,
    lastAt: now,
    lastSeconds: seconds,
    tries: (prev?.tries ?? 0) + 1,
  };
  records = { ...records, [String(level)]: next };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // 忽略隐私模式下的写入失败
  }
  emit();
  return next;
}

export function resetExamRecords(): void {
  records = {};
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 忽略
  }
  emit();
}

export function useExamRecords(): ExamMap {
  return useSyncExternalStore(subscribe, () => records, () => records);
}
