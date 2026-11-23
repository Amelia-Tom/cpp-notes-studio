// EXPORTS: useReadingRecords, saveReadingAnswer, removeReadingRecord, resetReadingRecords, type ReadingRecord

import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'cpp-notes-studio:reading-v1';

/** 每道阅读题只保留一条聚合记录：最近一次选择、累计对错次数 */
export interface ReadingRecord {
  itemId: string;
  /** 最近一次选的选项下标 */
  choice: number;
  /** 最近一次是否答对 */
  correct: boolean;
  /** 填空题最近一次提交的原文（选择题不记录） */
  text?: string;
  /** 累计作答次数 */
  attempts: number;
  /** 累计答对次数 */
  correctCount: number;
  lastAt: string;
}

type ReadingMap = Record<string, ReadingRecord>;

const listeners = new Set<() => void>();

function read(): ReadingMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ReadingMap;
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

let records: ReadingMap = read();

function emit(): void {
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function saveReadingAnswer(itemId: string, choice: number, correct: boolean, text?: string): void {
  const prev = records[itemId];
  records = {
    ...records,
    [itemId]: {
      itemId,
      choice,
      correct,
      text,
      attempts: (prev?.attempts ?? 0) + 1,
      correctCount: (prev?.correctCount ?? 0) + (correct ? 1 : 0),
      lastAt: new Date().toISOString(),
    },
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // 忽略隐私模式下的写入失败
  }
  emit();
}

export function removeReadingRecord(itemId: string): void {
  const next = { ...records };
  delete next[itemId];
  records = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // 忽略
  }
  emit();
}

export function resetReadingRecords(): void {
  records = {};
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 忽略
  }
  emit();
}

export function useReadingRecords(): ReadingMap {
  return useSyncExternalStore(subscribe, () => records, () => records);
}
