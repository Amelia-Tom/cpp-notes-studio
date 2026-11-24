// EXPORTS: buildTopicMarkdown, buildTopicsBundleMarkdown

/**
 * 章节 Markdown 导出：
 * - `buildTopicMarkdown` 导单章（带 front matter，可以直接当一条 Obsidian 笔记/练习卷）；
 * - `buildTopicsBundleMarkdown` 导多章合集（当前筛选结果，例如某一整个阶段），
 *   不带 front matter，先给一份目录，再把每章降一级标题拼在一起，适合打印整本讲义。
 * 两者共用同一套正文渲染，保证单章导出和合集里的内容一字不差。
 */

import type { IQuestion, ITopic } from '@/data/types';
import { fence, stamp } from './markdown';

export interface ITopicExportOptions {
  gesp?: number[];
  prevTitle?: string;
  nextTitle?: string;
  now?: Date;
  /** 标题起始级别：单章 1，合集里 2（合集自己占一级标题） */
  headingBase?: 1 | 2;
  includeFrontMatter?: boolean;
}

export interface IBundleTopic {
  topic: ITopic;
  questions: IQuestion[];
}

/** sections.syntax 里既有单行写法也有多行小例子，多于一行就换成代码块，读起来才不乱 */
function syntaxBlock(text: string): string {
  const trimmed = text.trim();
  return trimmed.includes('\n') ? fence(trimmed) : `- \`${trimmed}\``;
}

function letterAt(index: number): string {
  return ['A', 'B', 'C', 'D', 'E', 'F'][index] ?? String(index + 1);
}

/** 单章正文：不带标题级别以外的差异，单章导出与合集导出都走这里 */
function renderTopicBody(topic: ITopic, questions: IQuestion[], headingBase: 1 | 2): string[] {
  const h2 = '#'.repeat(headingBase + 1);
  const h3 = '#'.repeat(headingBase + 2);
  const lines: string[] = [];

  lines.push(`${h2} 01 概念讲解`);
  lines.push('');
  lines.push(topic.sections.concept.join('\n\n'));
  lines.push('');

  lines.push(`${h2} 02 生活类比`);
  lines.push('');
  lines.push(`> ${topic.sections.analogy.trim()}`);
  lines.push('');

  lines.push(`${h2} 03 语法要点`);
  lines.push('');
  for (const item of topic.sections.syntax) {
    lines.push(syntaxBlock(item));
    lines.push('');
  }

  lines.push(`${h2} 04 代码模板`);
  lines.push('');
  lines.push(`**${topic.template.title}**`);
  lines.push('');
  lines.push(fence(topic.template.code));
  lines.push('');
  lines.push(topic.template.explain.trim());
  lines.push('');

  lines.push(`${h2} 05 易错点`);
  lines.push('');
  topic.sections.pitfalls.forEach((pitfall, index) => {
    lines.push(`${h3} 坑 ${index + 1}`);
    lines.push('');
    lines.push(`- ❌ 常见错法：\`${pitfall.wrong.trim()}\``);
    lines.push(`- ✅ 正确写法：\`${pitfall.right.trim()}\``);
    lines.push(`- 为什么：${pitfall.reason.trim()}`);
    lines.push('');
  });

  lines.push(`${h2} 06 关键点`);
  lines.push('');
  topic.sections.keyPoints.forEach((point, index) => {
    lines.push(`${index + 1}. ${point}`);
  });
  lines.push('');

  if (topic.examples.length) {
    lines.push(`${h2} 07 例题`);
    lines.push('');
    topic.examples.forEach((example, index) => {
      lines.push(`${h3} 例 ${index + 1} · ${example.title}（${example.difficulty}）`);
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
      lines.push(`复杂度：时间 \`${example.time}\` ｜ 空间 \`${example.space}\` ｜ 一句话记住：**${example.takeaway}**`);
      lines.push('');
    });
  }

  if (questions.length) {
    lines.push(`${h2} 08 本章自测（${questions.length} 道）`);
    lines.push('');
    lines.push('> 答案与解析统一放在本章末尾，先自己做一遍再对照。');
    lines.push('');
    questions.forEach((question, index) => {
      lines.push(`${h3} 第 ${index + 1} 题 · 难度 ${question.difficulty}`);
      lines.push('');
      lines.push(question.prompt);
      lines.push('');
      if (question.type === 'choice' && question.options?.length) {
        question.options.forEach((option, optionIndex) => {
          lines.push(`- ${letterAt(optionIndex)}. ${option}`);
        });
        lines.push('');
      } else {
        lines.push('_（填空题：自己写答案）_');
        lines.push('');
      }
    });

    lines.push(`${h2} 09 答案与解析`);
    lines.push('');
    questions.forEach((question, index) => {
      const answer =
        question.type === 'choice'
          ? `${letterAt(question.answerIndex ?? 0)}. ${question.options?.[question.answerIndex ?? 0] ?? ''}`
          : (question.answers?.[0] ?? '');
      lines.push(`**第 ${index + 1} 题**：${answer}`);
      lines.push('');
      lines.push(`> ${question.explanation}`);
      lines.push('');
    });
  }

  if (topic.homework.length) {
    lines.push(`${h2} 10 作业`);
    lines.push('');
    topic.homework.forEach((task, index) => {
      lines.push(`- [ ] ${index + 1}. ${task}`);
    });
    lines.push('');
  }

  return lines;
}

export function buildTopicMarkdown(topic: ITopic, questions: IQuestion[], options: ITopicExportOptions = {}): string {
  const now = options.now ?? new Date();
  const headingBase = options.headingBase ?? 1;
  const includeFrontMatter = options.includeFrontMatter ?? headingBase === 1;
  const gesp = options.gesp ?? topic.gesp ?? [];
  const h1 = '#'.repeat(headingBase);
  const lines: string[] = [];

  if (includeFrontMatter) {
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
  }

  lines.push(`${h1} ${String(topic.order).padStart(2, '0')} · ${topic.title}`);
  lines.push('');
  lines.push(`> ${topic.summary}`);
  lines.push('>');
  const meta = [
    `副标题：${topic.subtitle}`,
    `精读约 ${topic.minutes} 分钟`,
    gesp.length ? `对应 GESP ${gesp.map((level) => `L${level}`).join('、')}` : '',
  ].filter(Boolean);
  lines.push(`> ${meta.join(' ｜ ')}`);
  if (options.prevTitle) {
    lines.push(`> 上一节：${options.prevTitle}${options.nextTitle ? ` ｜ 下一节：${options.nextTitle}` : ''}`);
  }
  if (topic.keywords.length) lines.push(`> 关键词：${topic.keywords.join(' · ')}`);
  lines.push('');
  lines.push(...renderTopicBody(topic, questions, headingBase));

  return lines.join('\n').trimEnd() + '\n';
}

export interface IBundleExportOptions {
  /** 这份合集覆盖的范围，用于标题与说明，如「基础篇 · 11 节」 */
  scopeLabel?: string;
  gesp?: (topic: ITopic) => number[];
  now?: Date;
}

export function buildTopicsBundleMarkdown(entries: IBundleTopic[], options: IBundleExportOptions = {}): string {
  const now = options.now ?? new Date();
  const totalMinutes = entries.reduce((sum, entry) => sum + entry.topic.minutes, 0);
  const totalQuestions = entries.reduce((sum, entry) => sum + entry.questions.length, 0);
  const scope = options.scopeLabel ?? `全部 ${entries.length} 节`;
  const lines: string[] = [];

  lines.push('---');
  lines.push(`title: "${scope} · 讲义合集"`);
  lines.push(`exported: ${stamp(now)}`);
  lines.push(`topics: ${entries.length}`);
  lines.push('tags:');
  lines.push('  - cpp');
  lines.push('  - gesp');
  lines.push('  - 讲义');
  lines.push('---');
  lines.push('');
  lines.push(`# ${scope} · 讲义合集`);
  lines.push('');
  lines.push(
    `> 导出于 ${stamp(now)}：共 ${entries.length} 节、精读约 ${totalMinutes} 分钟、${totalQuestions} 道自测题。每节末尾都附答案与解析，可整本打印当讲义。`,
  );
  lines.push('');

  lines.push('## 目录');
  lines.push('');
  entries.forEach(({ topic }) => {
    const gesp = options.gesp?.(topic) ?? topic.gesp ?? [];
    lines.push(
      `- ${String(topic.order).padStart(2, '0')} · ${topic.title}（约 ${topic.minutes} 分钟${gesp.length ? `，GESP ${gesp.map((level) => `L${level}`).join('/')}` : ''}）`,
    );
  });
  lines.push('');
  lines.push('---');
  lines.push('');

  entries.forEach(({ topic, questions }, index) => {
    lines.push(buildTopicMarkdown(topic, questions, {
      headingBase: 2,
      includeFrontMatter: false,
      now,
      gesp: options.gesp?.(topic) ?? topic.gesp,
    }).trimEnd());
    if (index !== entries.length - 1) {
      lines.push('');
      lines.push('---');
      lines.push('');
    }
  });

  return lines.join('\n').trimEnd() + '\n';
}
