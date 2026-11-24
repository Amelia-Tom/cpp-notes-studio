// EXPORTS: buildTopicMarkdown

/**
 * 把一整个章节导出成一份 Markdown 笔记：
 * 概念 → 类比 → 语法 → 模板 → 易错点 → 关键点 → 例题 → 自测题 → 答案 → 作业。
 * 自测题的答案统一放在文末，这样整份笔记可以直接当「练习卷 + 对照答案」用；
 * 带 YAML front matter，丢进 Obsidian 打开就是一条按 GESP 级别打了标签的笔记。
 */

import type { IQuestion, ITopic } from '@/data/types';
import { fence, stamp } from './markdown';

/** sections.syntax 里既有单行写法也有多行小例子，多于一行就换成代码块，读起来才不乱 */
function syntaxBlock(text: string): string {
  const trimmed = text.trim();
  return trimmed.includes('\n') ? fence(trimmed) : `- \`${trimmed}\``;
}

export function buildTopicMarkdown(
  topic: ITopic,
  questions: IQuestion[],
  options: { gesp?: number[]; prevTitle?: string; nextTitle?: string; now?: Date } = {},
): string {
  const now = options.now ?? new Date();
  const gesp = options.gesp ?? topic.gesp ?? [];
  const lines: string[] = [];

  lines.push('---');
  lines.push(`title: "${String(topic.order).padStart(2, '0')} · ${topic.title}"`);
  lines.push(`exported: ${stamp(now)}`);
  lines.push(`minutes: ${topic.minutes}`);
  lines.push('tags:');
  lines.push('  - cpp');
  if (gesp.length) lines.push(`  - gesp${gesp[0]}`);
  lines.push(`  - ${topic.id}`);
  lines.push('---');
  lines.push('');
  lines.push(`# ${String(topic.order).padStart(2, '0')} · ${topic.title}`);
  lines.push('');
  lines.push(`> ${topic.summary}`);
  lines.push('>');
  lines.push(
    `> 副标题：${topic.subtitle} ｜ 精读约 ${topic.minutes} 分钟${gesp.length ? ` ｜ 对应 GESP ${gesp.map((level) => `L${level}`).join('、')}` : ''}`,
  );
  if (options.prevTitle) lines.push(`> 上一节：${options.prevTitle}${options.nextTitle ? ` ｜ 下一节：${options.nextTitle}` : ''}`);
  if (topic.keywords.length) lines.push(`> 关键词：${topic.keywords.join(' · ')}`);
  lines.push('');

  lines.push('## 01 概念讲解');
  lines.push('');
  lines.push(topic.sections.concept.join('\n\n'));
  lines.push('');

  lines.push('## 02 生活类比');
  lines.push('');
  lines.push(`> ${topic.sections.analogy.trim()}`);
  lines.push('');

  lines.push('## 03 语法要点');
  lines.push('');
  for (const item of topic.sections.syntax) {
    lines.push(syntaxBlock(item));
    lines.push('');
  }

  lines.push('## 04 代码模板');
  lines.push('');
  lines.push(`**${topic.template.title}**`);
  lines.push('');
  lines.push(fence(topic.template.code));
  lines.push('');
  lines.push(topic.template.explain.trim());
  lines.push('');

  lines.push('## 05 易错点');
  lines.push('');
  topic.sections.pitfalls.forEach((pitfall, index) => {
    lines.push(`### 坑 ${index + 1}`);
    lines.push('');
    lines.push(`- ❌ 常见错法：\`${pitfall.wrong.trim()}\``);
    lines.push(`- ✅ 正确写法：\`${pitfall.right.trim()}\``);
    lines.push(`- 为什么：${pitfall.reason.trim()}`);
    lines.push('');
  });

  lines.push('## 06 关键点');
  lines.push('');
  topic.sections.keyPoints.forEach((point, index) => {
    lines.push(`${index + 1}. ${point}`);
  });
  lines.push('');

  if (topic.examples.length) {
    lines.push('## 07 例题');
    lines.push('');
    topic.examples.forEach((example, index) => {
      lines.push(`### 例 ${index + 1} · ${example.title}（${example.difficulty}）`);
      lines.push('');
      lines.push(`**题目**：${example.problem.trim()}`);
      lines.push('');
      if (example.sample.trim()) {
        lines.push('```text');
        lines.push(example.sample.trim());
        lines.push('```');
        lines.push('');
      }
      lines.push('**思路**：');
      lines.push('');
      example.ideas.forEach((idea, step) => {
        lines.push(`${step + 1}. ${idea}`);
      });
      lines.push('');
      lines.push(fence(example.code));
      lines.push('');
      lines.push(
        `复杂度：时间 \`${example.time}\` ｜ 空间 \`${example.space}\` ｜ 一句话记住：**${example.takeaway}**`,
      );
      lines.push('');
    });
  }

  if (questions.length) {
    lines.push(`## 08 本章自测（${questions.length} 道）`);
    lines.push('');
    lines.push('> 答案与解析统一放在文末，先自己做一遍再对照。');
    lines.push('');
    questions.forEach((question, index) => {
      lines.push(`### 第 ${index + 1} 题 · 难度 ${question.difficulty}`);
      lines.push('');
      lines.push(`${question.prompt}`);
      lines.push('');
      if (question.type === 'choice' && question.options?.length) {
        const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
        question.options.forEach((option, optionIndex) => {
          lines.push(`- ${letters[optionIndex] ?? optionIndex + 1}. ${option}`);
        });
        lines.push('');
      } else {
        lines.push('_（填空题：自己写答案）_');
        lines.push('');
      }
    });

    lines.push('## 09 答案与解析');
    lines.push('');
    questions.forEach((question, index) => {
      const answer =
        question.type === 'choice'
          ? `${['A', 'B', 'C', 'D', 'E', 'F'][question.answerIndex ?? 0] ?? ''}. ${question.options?.[question.answerIndex ?? 0] ?? ''}`
          : (question.answers?.[0] ?? '');
      lines.push(`**第 ${index + 1} 题**：${answer}`);
      lines.push('');
      lines.push(`> ${question.explanation}`);
      lines.push('');
    });
  }

  if (topic.homework.length) {
    lines.push('## 10 作业');
    lines.push('');
    topic.homework.forEach((task, index) => {
      lines.push(`- [ ] ${index + 1}. ${task}`);
    });
    lines.push('');
  }

  return `${lines.join('\n').trimEnd()}\n`;
}
