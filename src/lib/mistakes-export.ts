// EXPORTS: buildMistakesMarkdown

/**
 * 把错题本导成一份 Markdown：
 * - 文件头带 YAML front matter（tags 里有 cpp/gesp/mistakes），直接丢进 Obsidian 就是一条笔记；
 * - 先按章节分二级标题，章节内再分「自测」「程序阅读」两类；
 * - 每题都保留题干、选项、正确答案、解析（阅读题还有你当时填/选了什么），
 *   这样离线打印或复习时不用再回站上翻。
 * 不依赖 React，纯函数，方便日后加别处导出（比如整章笔记）。
 */

import { fence, stamp } from './markdown';

export interface IExportSelfQuestion {
  entry: { times: number };
  question: {
    id: string;
    prompt: string;
    type: 'choice' | 'fill';
    options?: string[];
    answerIndex?: number;
    answers?: string[];
    explanation: string;
  };
  topic?: { id: string; title: string; order: number };
}

export interface IExportReadingItem {
  record: { choice?: number; text?: string; attempts: number; correctCount: number };
  item: {
    id: string;
    level: number;
    title: string;
    point: string;
    kind: 'output' | 'blank';
    code: string;
    options?: string[];
    answerIndex?: number;
    answers?: string[];
    explanation: string;
  };
  topic?: { id: string; title: string; order: number };
}

function chapterKey(entry: { topic?: { id: string; order: number } }): string {
  return entry.topic?.id ?? '';
}

function chapterHeading(topic?: { title: string; order: number }): string {
  if (!topic) return '未归类章节';
  return `${String(topic.order).padStart(2, '0')} · ${topic.title}`;
}

export function buildMistakesMarkdown(
  selfItems: IExportSelfQuestion[],
  readingItems: IExportReadingItem[],
  options: { scopeTitle?: string; now?: Date } = {},
): string {
  const now = options.now ?? new Date();
  const total = selfItems.length + readingItems.length;
  const scope = options.scopeTitle ? `（只看「${options.scopeTitle}」）` : '';

  const lines: string[] = [];
  lines.push('---');
  lines.push('title: C++ 笔记 · 错题本');
  lines.push(`exported: ${stamp(now)}`);
  lines.push(`total: ${total}`);
  lines.push('tags:');
  lines.push('  - cpp');
  lines.push('  - gesp');
  lines.push('  - mistakes');
  lines.push('---');
  lines.push('');
  lines.push(`# C++ 笔记 · 错题本${scope}`);
  lines.push('');
  lines.push(`> 导出于 ${stamp(now)}，共 ${total} 道（自测 ${selfItems.length} · 程序阅读 ${readingItems.length}）。`);
  lines.push('> 答对一次就会自动移出错题本，所以这份清单里都是「还没过关」的题。');
  lines.push('');

  // 按章节聚合：章节顺序用 order 升序，未知章节放最后
  const grouped = new Map<string, { heading: string; order: number; self: IExportSelfQuestion[]; reading: IExportReadingItem[] }>();
  for (const item of selfItems) {
    const key = chapterKey(item);
    const bucket = grouped.get(key) ?? {
      heading: chapterHeading(item.topic),
      order: item.topic?.order ?? 999,
      self: [],
      reading: [],
    };
    bucket.self.push(item);
    grouped.set(key, bucket);
  }
  for (const item of readingItems) {
    const key = chapterKey(item);
    const bucket = grouped.get(key) ?? {
      heading: chapterHeading(item.topic),
      order: item.topic?.order ?? 999,
      self: [],
      reading: [],
    };
    bucket.reading.push(item);
    grouped.set(key, bucket);
  }

  const buckets = [...grouped.values()].sort((a, b) => a.order - b.order);

  for (const bucket of buckets) {
    const count = bucket.self.length + bucket.reading.length;
    lines.push(`## ${bucket.heading}（${count} 道）`);
    lines.push('');

    for (const { entry, question } of bucket.self) {
      lines.push(`### 自测 · 错 ${entry.times} 次`);
      lines.push('');
      lines.push(`**题目**：${question.prompt}`);
      lines.push('');
      if (question.type === 'choice' && question.options?.length) {
        const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
        question.options.forEach((option, index) => {
          const mark = index === (question.answerIndex ?? 0) ? ' ✅' : '';
          lines.push(`- ${letters[index] ?? index + 1}. ${option}${mark}`);
        });
        lines.push('');
      }
      const answer =
        question.type === 'choice' ? (question.options?.[question.answerIndex ?? 0] ?? '') : (question.answers?.[0] ?? '');
      lines.push(`**正确答案**：${answer}`);
      lines.push('');
      lines.push(`**解析**：${question.explanation}`);
      lines.push('');
    }

    for (const { record, item } of bucket.reading) {
      const wrongTimes = record.attempts - record.correctCount;
      lines.push(`### 程序阅读 · L${item.level} · ${item.title}（错 ${wrongTimes} 次）`);
      lines.push('');
      lines.push(`**考点**：${item.point}`);
      lines.push('');
      lines.push(fence(item.code));
      lines.push('');
      if (item.kind === 'blank') {
        lines.push(`**你填的**：${record.text ? `\`${record.text}\`` : '（空）'} ｜ **标准答案**：\`${item.answers?.[0] ?? ''}\``);
      } else {
        lines.push(
          `**你选的**：${item.options?.[record.choice ?? 0] ?? '（未作答）'} ｜ **正确答案**：${item.options?.[item.answerIndex ?? 0] ?? ''}`,
        );
      }
      lines.push('');
      lines.push(`**解析**：${item.explanation}`);
      lines.push('');
    }
  }

  if (total === 0) {
    lines.push('这一范围下暂时没有错题。');
    lines.push('');
  }

  return `${lines.join('\n').trimEnd()}\n`;
}
