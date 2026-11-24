// EXPORTS: buildWeeklyReportMarkdown

/**
 * 学习周报导出：把进度页已经算好的东西排成一份 Markdown。
 * 结构固定为「概览 → 每日明细表 → 本周薄弱点 → 待复习错题（按章节） → 下周建议 → 课程进度」，
 * 目标是家长/老师能一眼看完，学生照着「下周建议」就能直接开练。
 * 只做排版，不读任何 store，数据由页面传进来。
 */

import type { IActivityDay } from './activity';
import { stamp } from './markdown';

export interface IWeeklyChapter {
  title: string;
  order: number;
}

export interface IWeeklyWeakChapter extends IWeeklyChapter {
  total: number;
  correct: number;
}

export interface IWeeklyMistakeChapter extends IWeeklyChapter {
  self: number;
  reading: number;
}

export interface IWeeklyReportInput {
  now?: Date;
  days: IActivityDay[];
  week: { total: number; correct: number; reviewRounds: number; reading: number; exams: number; activeDays: number };
  streak: number;
  todayActive: boolean;
  completed: number;
  totalTopics: number;
  mistakes: IWeeklyMistakeChapter[];
  weak: IWeeklyWeakChapter[];
  nextChapter?: { title: string; order: number; minutes: number };
}

function chapterLabel(chapter: IWeeklyChapter): string {
  return `${String(chapter.order).padStart(2, '0')} · ${chapter.title}`;
}

export function buildWeeklyReportMarkdown(input: IWeeklyReportInput): string {
  const now = input.now ?? new Date();
  const days = input.days.slice(-7);
  const fallbackDate = `${now.getMonth() + 1}/${now.getDate()}`;
  const rangeStart = days[0]?.label ?? fallbackDate;
  const rangeEnd = days[days.length - 1]?.label ?? fallbackDate;
  const weekRate = input.week.total > 0 ? Math.round((input.week.correct / input.week.total) * 100) : null;
  const totalMistakes = input.mistakes.reduce((sum, chapter) => sum + chapter.self + chapter.reading, 0);
  const lines: string[] = [];

  lines.push('---');
  lines.push(`title: "学习周报 · ${rangeStart}–${rangeEnd}"`);
  lines.push(`exported: ${stamp(now)}`);
  lines.push('tags:');
  lines.push('  - cpp');
  lines.push('  - gesp');
  lines.push('  - 周报');
  lines.push('---');
  lines.push('');
  lines.push(`# 学习周报 · ${rangeStart}–${rangeEnd}`);
  lines.push('');
  lines.push(
    `> 本周活跃 ${input.week.activeDays} 天 ｜ 做题 ${input.week.total} 题${weekRate !== null ? `（正确率 ${weekRate}%）` : ''} ｜ 重练 ${input.week.reviewRounds} 组 ｜ 阅读 ${input.week.reading} 道 ｜ 模拟卷 ${input.week.exams} 次`,
  );
  lines.push(`> 连续学习 ${input.streak} 天${input.todayActive ? '（今天已练）' : '（今天还没练）'} ｜ 已学 ${input.completed}/${input.totalTopics} 节`);
  lines.push('');

  lines.push('## 每日明细');
  lines.push('');
  lines.push('| 日期 | 做题 | 正确率 | 重练 | 阅读 | 模拟卷 |');
  lines.push('| --- | ---: | ---: | ---: | ---: | ---: |');
  days.forEach((day) => {
    const rate = day.total > 0 ? `${Math.round((day.correct / day.total) * 100)}%` : '—';
    lines.push(
      `| ${day.label}${day.empty ? '（未练）' : ''} | ${day.total || '—'} | ${rate} | ${day.reviewRounds || '—'} | ${day.reading || '—'} | ${day.exams || '—'} |`,
    );
  });
  lines.push('');

  lines.push('## 本周薄弱点');
  lines.push('');
  if (input.weak.length === 0) {
    lines.push(
      input.week.total === 0
        ? '本周还没有练习记录，先用一组自测热个身，下一份周报才有对比。'
        : '本周没有低于 80% 正确率的章节，保持这个节奏。',
    );
  } else {
    lines.push('| 章节 | 正确率 | 做题 |');
    lines.push('| --- | ---: | ---: |');
    input.weak.forEach((chapter) => {
      const rate = chapter.total > 0 ? `${Math.round((chapter.correct / chapter.total) * 100)}%` : '—';
      lines.push(`| ${chapterLabel(chapter)} | ${rate} | ${chapter.total} |`);
    });
  }
  lines.push('');

  lines.push('## 待复习错题');
  lines.push('');
  if (input.mistakes.length === 0) {
    lines.push('错题本已经清空，这一周没有遗留错题。');
  } else {
    lines.push(`共 ${totalMistakes} 道，按章节分布：`);
    lines.push('');
    input.mistakes.forEach((chapter) => {
      const parts = [`自测 ${chapter.self}`];
      if (chapter.reading > 0) parts.push(`阅读 ${chapter.reading}`);
      lines.push(`- ${chapterLabel(chapter)}：${parts.join(' · ')}`);
    });
  }
  lines.push('');

  lines.push('## 下周建议');
  lines.push('');
  let index = 0;
  input.weak.slice(0, 2).forEach((chapter) => {
    index += 1;
    lines.push(`${index}. 先把「${chapter.title}」的错题重练完（当前正确率 ${chapter.total > 0 ? Math.round((chapter.correct / chapter.total) * 100) : 0}%）。`);
  });
  const topMistake = input.mistakes.slice().sort((a, b) => b.self + b.reading - (a.self + a.reading))[0];
  // 已经在上一条建议里点过名的章节不再重复提示，免得同一章占两条
  const weakTitles = new Set(input.weak.slice(0, 2).map((chapter) => chapter.title));
  if (topMistake && topMistake.self + topMistake.reading > 0 && !weakTitles.has(topMistake.title)) {
    index += 1;
    lines.push(`${index}. 清掉「${topMistake.title}」剩下的 ${topMistake.self + topMistake.reading} 道错题，答对一次就会自动出本。`);
  }
  if (input.nextChapter) {
    index += 1;
    lines.push(
      `${index}. 学下一节「${chapterLabel(input.nextChapter)}」（约 ${input.nextChapter.minutes} 分钟），学完做一组本章自测。`,
    );
  }
  if (index === 0) lines.push('本周状态很稳，按顺序继续往下学即可。');
  lines.push('');

  lines.push('## 课程进度');
  lines.push('');
  lines.push(`已学 ${input.completed}/${input.totalTopics} 节（${Math.round((input.completed / Math.max(1, input.totalTopics)) * 100)}%）。`);
  lines.push('');

  return lines.join('\n').trimEnd() + '\n';
}
