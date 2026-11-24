// EXPORTS: IReviewRound, saveReviewRound, useReviewRounds, resetReviewRounds, type ReviewKind

import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'cpp-notes-studio:review-v1';
/** 只留最近 30 轮，够看趋势又不至于把存储撑大 */
const LIMIT = 30;

export type ReviewKind = 'practice' | 'reading';

/** 一轮错题重练的成绩：从错题本拼出的那组题答完就记一条 */
export interface IReviewRound {
  id: string;
  kind: ReviewKind;
  /** 限定的章节 id；'all' = 不限章节 */
  topicId: string;
  /** 展示用的范围名（章节标题或「全部章节」） */
  label: string;
  total: number;
  correct: number;
  at: number;
}

const listeners = new Set<() => void>();

function read(): IReviewRound[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as IReviewRound[];
    return Array.isArray(parsed) ? parsed.filter((round) => round && typeof round.id === 'string') : [];
  } catch {
    return [];
  }
}

let rounds: IReviewRound[] = read();

function emit() {
  listeners.forEach((listener) => listener());
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rounds));
  } catch {
    // 存储写满或隐私模式下忽略，不影响当前会话
  }
  emit();
}

export function saveReviewRound(round: Omit<IReviewRound, 'id' | 'at'> & { at?: number }): void {
  const entry: IReviewRound = {
    ...round,
    id: `r${Date.now()}`,
    at: round.at ?? Date.now(),
  };
  rounds = [entry, ...rounds].slice(0, LIMIT);
  persist();
}

export function resetReviewRounds(): void {
  rounds = [];
  persist();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): IReviewRound[] {
  return rounds;
}

export function useReviewRounds(): IReviewRound[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
