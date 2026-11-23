// EXPORTS: IProgress, IQuizRecord, IMistakeEntry, getProgress, subscribe, markCompleted, unmarkCompleted, toggleCompleted, recordQuiz, removeMistake, resetProgress

const NS = 'cpp-notes-studio';
const KEY = 'progress-v1';

export interface IMistakeEntry {
  questionId: string;
  times: number;
  lastAt: number;
}

export interface ITopicStat {
  total: number;
  correct: number;
}

export interface IQuizRecord {
  id: string;
  scopeLabel: string;
  at: number;
  total: number;
  correct: number;
  /** 按知识点归因的答题统计，用于能力雷达 */
  byTopic: Record<string, ITopicStat>;
}

export interface IProgress {
  /** 标记为「已学」的知识点 id */
  completed: string[];
  mistakes: IMistakeEntry[];
  records: IQuizRecord[];
}

const EMPTY: IProgress = { completed: [], mistakes: [], records: [] };

function read(): IProgress {
  try {
    const raw = localStorage.getItem(`${NS}:${KEY}`);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<IProgress>;
    return {
      completed: parsed.completed ?? [],
      mistakes: parsed.mistakes ?? [],
      records: (parsed.records ?? []).map((record) => ({ ...record, byTopic: record.byTopic ?? {} })),
    };
  } catch {
    return EMPTY;
  }
}

let state: IProgress = read();
const listeners = new Set<() => void>();

export function getProgress(): IProgress {
  return state;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function commit(next: IProgress) {
  state = next;
  try {
    localStorage.setItem(`${NS}:${KEY}`, JSON.stringify(next));
  } catch {
    // 隐私模式下写入失败时，本次会话内仍然可用
  }
  listeners.forEach((listener) => listener());
}

export function markCompleted(topicId: string) {
  if (state.completed.includes(topicId)) return;
  commit({ ...state, completed: [...state.completed, topicId] });
}

export function unmarkCompleted(topicId: string) {
  commit({ ...state, completed: state.completed.filter((id) => id !== topicId) });
}

export function toggleCompleted(topicId: string) {
  if (state.completed.includes(topicId)) unmarkCompleted(topicId);
  else markCompleted(topicId);
}

export function removeMistake(questionId: string) {
  commit({ ...state, mistakes: state.mistakes.filter((item) => item.questionId !== questionId) });
}

export interface QuizAnswer {
  questionId: string;
  topicId: string;
  correct: boolean;
}

export function recordQuiz(scopeLabel: string, answers: QuizAnswer[]) {
  const now = Date.now();
  const total = answers.length;
  const correct = answers.filter((item) => item.correct).length;

  const wrongIds = answers.filter((item) => !item.correct).map((item) => item.questionId);
  const rightIds = answers.filter((item) => item.correct).map((item) => item.questionId);

  let mistakes = state.mistakes.filter((item) => !rightIds.includes(item.questionId));
  wrongIds.forEach((questionId) => {
    const existing = state.mistakes.find((item) => item.questionId === questionId);
    mistakes = [
      ...mistakes.filter((item) => item.questionId !== questionId),
      { questionId, times: (existing?.times ?? 0) + 1, lastAt: now },
    ];
  });

  const byTopic: Record<string, ITopicStat> = {};
  answers.forEach((answer) => {
    const stat = byTopic[answer.topicId] ?? { total: 0, correct: 0 };
    stat.total += 1;
    if (answer.correct) stat.correct += 1;
    byTopic[answer.topicId] = stat;
  });

  const record: IQuizRecord = {
    id: `s${now}`,
    scopeLabel,
    at: now,
    total,
    correct,
    byTopic,
  };

  commit({
    ...state,
    mistakes,
    records: [record, ...state.records].slice(0, 30),
  });
}

export function resetProgress() {
  commit({ completed: [], mistakes: [], records: [] });
}
