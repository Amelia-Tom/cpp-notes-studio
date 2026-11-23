// EXPORTS: StageId, STAGES, TOPICS, QUESTIONS, getTopic, getStage, getQuestionsByTopic, getTopicText

import type { IQuestion, ITopic, StageId } from './types';
import { BASIC_TOPICS } from './topics/basic';
import { CERT_TOPICS } from './topics/cert';
import { CONTEST_TOPICS } from './topics/contest';
import { GESP1_TOPICS } from './topics/gesp1';
import { GESP2_TOPICS } from './topics/gesp2';
import { GESP3_TOPICS } from './topics/gesp3';
import { GESP4_TOPICS } from './topics/gesp4';
import { QUESTIONS } from './questions';

export type { IQuestion, ITopic, StageId } from './types';
export { GESP_LEVELS, TOPIC_GESP, getTopicGesp, getLevelsOfTopic } from './gesp';
export type { IGespLevel } from './gesp';
export { QUESTIONS } from './questions';

export interface IStageMeta {
  id: StageId;
  name: string;
  code: string;
  description: string;
  /** 该阶段的预计知识点数 */
  count: number;
}

export const TOPICS: ITopic[] = [...BASIC_TOPICS, ...CERT_TOPICS, ...CONTEST_TOPICS, ...GESP1_TOPICS, ...GESP2_TOPICS, ...GESP3_TOPICS, ...GESP4_TOPICS].sort(
  (a, b) => a.order - b.order,
);

export const STAGES: IStageMeta[] = [
  {
    id: 'basic',
    name: '基础篇',
    code: 'BASIC',
    description: '计算机基础、变量、运算、分支循环、类型转换、进制与位运算、数组与字符串，覆盖 GESP 1–3 级。',
    count: TOPICS.filter((topic) => topic.stage === 'basic').length,
  },
  {
    id: 'cert',
    name: '考级篇',
    code: 'CSP-J',
    description: '函数、二维数组与矩阵、结构体、递推、排序查找、前缀和、二分与贪心，覆盖 GESP 4–5 级。',
    count: TOPICS.filter((topic) => topic.stage === 'cert').length,
  },
  {
    id: 'contest',
    name: '竞赛篇',
    code: 'CSP-S',
    description: '递归分治、动态规划、搜索、树、图论与数论，覆盖 GESP 5–8 级与 CSP-J/S。',
    count: TOPICS.filter((topic) => topic.stage === 'contest').length,
  },
];


export function getTopic(topicId: string): ITopic | undefined {
  return TOPICS.find((topic) => topic.id === topicId);
}

export function getStage(stageId: StageId): IStageMeta {
  return STAGES.find((stage) => stage.id === stageId) ?? STAGES[0];
}

export function getQuestionsByTopic(topicId: string): IQuestion[] {
  return QUESTIONS.filter((question) => question.topicId === topicId);
}

/** 把知识点内容拼成纯文本，供搜索使用 */
export function getTopicText(topic: ITopic): string {
  return [
    topic.title,
    topic.subtitle,
    topic.summary,
    ...topic.keywords,
    ...topic.sections.concept,
    topic.sections.analogy,
    ...topic.sections.syntax,
    ...topic.sections.keyPoints,
  ]
    .join(' ')
    .toLowerCase();
}
