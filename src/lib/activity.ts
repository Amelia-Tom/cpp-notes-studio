// EXPORTS: computeActivity, IActivityDay, IActivitySummary

/**
 * 学习节奏统计：把四份本地记录（自测练习、错题重练、程序阅读、模拟卷）
 * 按「自然日」归并成一条时间线，用来算连续学习天数和最近 14 天的练习量。
 *
 * 只做纯计算，不读写 localStorage，页面把各 store 的数据灌进来即可；
 * 这样清空记录、换设备都不会影响口径，也方便以后加「本周报告」导出。
 *
 * 口径说明：
 * - 自测：一次练习记录（records）里的 total / correct 累加到当天（重练产生的记录也算在这里）；
 * - 重练：只累加「组数」，题目数不重复计算；
 * - 阅读：只按「最后一次作答时间」归属，所以是「那天碰过这道题」，不是逐次精确统计；
 * - 模拟卷：只有最近一次/最好成绩的时间戳，按 lastAt 归属。
 * 这些口径都写在卡片下方的说明里，避免误读成精确的每日题量。
 */

import type { IQuizRecord } from './store';

export interface IActivityDay {
  /** YYYY-MM-DD（本地时区） */
  key: string;
  /** 显示用的日号，如 11/24 */
  label: string;
  /** 自测 + 重练的题目数 */
  total: number;
  correct: number;
  /** 重练轮数 */
  reviewRounds: number;
  /** 当天碰过的阅读题数 */
  reading: number;
  /** 当天做过的模拟卷数 */
  exams: number;
  /** 当天任意一项活动都没有 */
  empty: boolean;
}

export interface IActivitySummary {
  /** 最近 14 天，按时间正序 */
  days: IActivityDay[];
  /** 连续学习天数：从今天（今天没练则从昨天）往回数 */
  streak: number;
  /** 今天是否已有记录 */
  todayActive: boolean;
  today: IActivityDay;
  /** 最近 7 天汇总 */
  week: { total: number; correct: number; reviewRounds: number; reading: number; exams: number; activeDays: number };
}

const DAY_MS = 24 * 60 * 60 * 1000;

function dayKey(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function dayLabel(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function computeActivity(input: {
  records: IQuizRecord[];
  rounds: { at: number; total: number; correct: number }[];
  reading: Record<string, { lastAt: string }>;
  exams: { lastAt?: string; bestAt?: string }[];
  days?: number;
  now?: Date;
}): IActivitySummary {
  const span = input.days ?? 14;
  const now = input.now ?? new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const buckets = new Map<string, IActivityDay>();
  for (let offset = span - 1; offset >= 0; offset -= 1) {
    const date = new Date(start.getTime() - offset * DAY_MS);
    const key = dayKey(date);
    buckets.set(key, {
      key,
      label: dayLabel(date),
      total: 0,
      correct: 0,
      reviewRounds: 0,
      reading: 0,
      exams: 0,
      empty: true,
    });
  }

  const touch = (timestamp: number | string | undefined): IActivityDay | undefined => {
    if (timestamp === undefined) return undefined;
    const date = typeof timestamp === 'number' ? new Date(timestamp) : new Date(timestamp);
    if (Number.isNaN(date.getTime())) return undefined;
    return buckets.get(dayKey(date));
  };

  for (const record of input.records) {
    const bucket = touch(record.at);
    if (!bucket) continue;
    bucket.total += record.total;
    bucket.correct += record.correct;
  }

  // 重练轮次同时也会写一条练习记录，题目数已经算在 records 里；
  // 这里只累加「组数」，避免同一批题被算两遍。
  for (const round of input.rounds) {
    const bucket = touch(round.at);
    if (!bucket) continue;
    bucket.reviewRounds += 1;
  }

  for (const record of Object.values(input.reading)) {
    const bucket = touch(record.lastAt);
    if (bucket) bucket.reading += 1;
  }

  for (const exam of input.exams) {
    const bucket = touch(exam.lastAt) ?? touch(exam.bestAt);
    if (bucket) bucket.exams += 1;
  }

  const days = [...buckets.values()];
  for (const day of days) {
    day.empty = day.total === 0 && day.reading === 0 && day.exams === 0 && day.reviewRounds === 0;
  }

  const today = days[days.length - 1];
  const todayActive = !today.empty;

  // 连续天数：今天有记录就从今天开始数；今天没练则从昨天开始数（保留「昨天为止的连续」）
  let streak = 0;
  let cursor = todayActive ? days.length - 1 : days.length - 2;
  while (cursor >= 0 && !days[cursor].empty) {
    streak += 1;
    cursor -= 1;
  }

  const weekDays = days.slice(-7);
  const week = weekDays.reduce(
    (acc, day) => {
      acc.total += day.total;
      acc.correct += day.correct;
      acc.reviewRounds += day.reviewRounds;
      acc.reading += day.reading;
      acc.exams += day.exams;
      if (!day.empty) acc.activeDays += 1;
      return acc;
    },
    { total: 0, correct: 0, reviewRounds: 0, reading: 0, exams: 0, activeDays: 0 },
  );

  return { days, streak, todayActive, today, week };
}
