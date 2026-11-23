// EXPORTS: PREREQS, MAP_EDGES, MAP_NODES, MAP_BY_ID, getPrereqs, getDependents, MAP_LEVELS

import { TOPICS } from './index';
import type { StageId } from './types';

/**
 * 知识地图的「前置关系」——只写真正构成依赖的边，不写「顺序建议」。
 * 一条 a → b 表示：没弄懂 a，学 b 会卡住（不是「教材排在这里」）。
 * 所有 id 都对应 src/data/topics 里的真实章节。
 */
export const PREREQS: Record<string, string[]> = {
  env: [],
  var: ['env'],
  io: ['var'],
  expr: ['var'],
  cast: ['var', 'expr'],
  branch: ['expr'],
  loop: ['branch'],
  'base-bit': ['cast', 'expr'],
  array: ['loop', 'var'],
  matrix: ['array', 'loop'],
  string: ['array', 'loop'],
  function: ['loop'],
  recurrence: ['function', 'array'],
  'sort-search': ['array', 'function'],
  struct: ['sort-search', 'array'],
  recursion: ['function'],
  prefix: ['array', 'loop'],
  'binary-answer': ['sort-search', 'function'],
  greedy: ['sort-search', 'struct'],
  dp: ['recurrence', 'recursion'],
  'dfs-bfs': ['recursion', 'stack-queue'],
  graph: ['stack-queue', 'array'],
  tree: ['recursion', 'stack-queue'],
  'number-theory': ['loop', 'function'],
  'stack-queue': ['array', 'struct'],
  hash: ['string', 'array'],
  combinatorics: ['recursion', 'number-theory'],
  shortest: ['graph', 'greedy'],
  doubling: ['recursion', 'prefix'],
  'file-io': ['string', 'function'],
  bigint: ['string', 'array'],
  'linked-list': ['struct', 'recursion'],
  'divide-conquer': ['recursion', 'sort-search'],
  object: ['struct', 'function'],
  'math-lib': ['cast', 'function'],
};

export interface IMapEdge {
  from: string;
  to: string;
}

export interface IMapNode {
  id: string;
  title: string;
  shortTitle: string;
  order: number;
  stage: StageId;
  gesp: number[];
  minutes: number;
  /** 拓扑深度（最长前置链），决定列位置 */
  level: number;
  /** 同列内的行号 */
  row: number;
  prereqs: string[];
  dependents: string[];
}

const TOPIC_BY_ID = new Map(TOPICS.map((topic) => [topic.id, topic]));

/** 按最长前置链算层级，顺便校验数据没有环 */
function computeLevels(ids: string[]): Record<string, number> {
  const level: Record<string, number> = {};
  const visiting = new Set<string>();

  const resolve = (id: string): number => {
    if (level[id] !== undefined) return level[id];
    if (visiting.has(id)) {
      // 理论不该出现：防御性返回 0，避免栈溢出把整页拖死
      return 0;
    }
    visiting.add(id);
    const parents = (PREREQS[id] ?? []).filter((parent) => TOPIC_BY_ID.has(parent));
    const base = parents.length === 0 ? 0 : Math.max(...parents.map((parent) => resolve(parent) + 1));
    visiting.delete(id);
    level[id] = base;
    return base;
  };

  ids.forEach(resolve);
  return level;
}

const topicIds = TOPICS.map((topic) => topic.id);
const levels = computeLevels(topicIds);

/** 标题过长时折成两行，SVG 里好排版 */
function splitTitle(title: string): string {
  if (title.length <= 11) return title;
  let cut = 11;
  const breakChars = ['、', '，', '与', '：', ' '];
  const found = breakChars
    .map((char) => title.lastIndexOf(char, 11))
    .filter((index) => index > 5)
    .sort((a, b) => b - a)[0];
  if (found) cut = found + 1;
  const first = title.slice(0, cut);
  const second = title.slice(cut);
  return second.length === 0 ? first : `${first}\n${second}`;
}

export const MAP_LEVELS = Math.max(...Object.values(levels)) + 1;

export const MAP_NODES: IMapNode[] = (() => {
  const rowsByLevel: Record<number, number> = {};
  return [...TOPICS]
    .sort((a, b) => a.order - b.order)
    .map((topic) => {
      const level = levels[topic.id] ?? 0;
      const row = rowsByLevel[level] ?? 0;
      rowsByLevel[level] = row + 1;
      const dependents = topicIds.filter((candidate) => (PREREQS[candidate] ?? []).includes(topic.id));
      return {
        id: topic.id,
        title: topic.title,
        shortTitle: splitTitle(topic.title),
        order: topic.order,
        stage: topic.stage,
        gesp: topic.gesp ?? [],
        minutes: topic.minutes,
        level,
        row,
        prereqs: PREREQS[topic.id] ?? [],
        dependents,
      };
    });
})();

export const MAP_BY_ID: Record<string, IMapNode> = Object.fromEntries(
  MAP_NODES.map((node) => [node.id, node]),
);

export const MAP_EDGES: IMapEdge[] = MAP_NODES.flatMap((node) =>
  node.prereqs.filter((parent) => MAP_BY_ID[parent]).map((parent) => ({ from: parent, to: node.id })),
);

export function getPrereqs(topicId: string): IMapNode[] {
  return (MAP_BY_ID[topicId]?.prereqs ?? []).map((id) => MAP_BY_ID[id]).filter(Boolean);
}

export function getDependents(topicId: string): IMapNode[] {
  return (MAP_BY_ID[topicId]?.dependents ?? []).map((id) => MAP_BY_ID[id]).filter(Boolean);
}

/** 收集某节点全部祖先 / 后代，用于 hover 高亮整条链路 */
export function collectChain(topicId: string, direction: 'ancestors' | 'descendants'): Set<string> {
  const result = new Set<string>();
  const walk = (id: string) => {
    const next = direction === 'ancestors' ? (MAP_BY_ID[id]?.prereqs ?? []) : (MAP_BY_ID[id]?.dependents ?? []);
    next.forEach((candidate) => {
      if (!MAP_BY_ID[candidate] || result.has(candidate)) return;
      result.add(candidate);
      walk(candidate);
    });
  };
  walk(topicId);
  return result;
}
