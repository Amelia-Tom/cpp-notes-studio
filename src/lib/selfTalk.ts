// EXPORTS: SELF_TALK_LEVELS, useSelfTalk, recordSelfTalk, resetSelfTalk, selfTalkWeight

import { useSyncExternalStore } from 'react';

export type SelfTalkLevel = 'solid' | 'partial' | 'stuck';

export interface SelfTalkRecord {
  topicId: string;
  level: SelfTalkLevel;
  at: number;
}

const STORAGE_KEY = 'cpp-notes-studio:selftalk-v1';

export const SELF_TALK_LEVELS: { level: SelfTalkLevel; label: string; hint: string }[] = [
  { level: 'solid', label: '能讲清每行', hint: '这一节可以过了，直接做自测验证一下。' },
  { level: 'partial', label: '有几处卡壳', hint: '回到卡住的那一行，把注释遮住再读一遍。' },
  { level: 'stuck', label: '只能看懂一半', hint: '建议先重看概念讲解和生活类比，再回来讲。' },
];

type Records = Record<string, SelfTalkRecord>;

/** 自评折算成 0—1 的完成度权重，用于能力雷达 */
export const SELF_TALK_WEIGHT: Record<SelfTalkLevel, number> = {
  solid: 1,
  partial: 0.55,
  stuck: 0.2,
};

export function selfTalkWeight(level: SelfTalkLevel): number {
  return SELF_TALK_WEIGHT[level];
}

function read(): Records {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Records;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

let records: Records = read();
const listeners = new Set<() => void>();

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function getSnapshot(): Records {
  return records;
}

export function recordSelfTalk(topicId: string, level: SelfTalkLevel): void {
  records = { ...records, [topicId]: { topicId, level, at: Date.now() } };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // 隐私模式下写入失败可以忽略，页面内状态仍然生效
  }
  listeners.forEach((fn) => fn());
}

export function resetSelfTalk(): void {
  records = {};
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 忽略
  }
  listeners.forEach((fn) => fn());
}

export function useSelfTalk(): Records {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
