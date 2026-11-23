// EXPORTS: 默认导出 MapPage 页面（知识点前置关系地图）

import { useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, ClipboardList, CircleDot, Download, Flag, GitBranch, Lock, Minus, Plus, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { getProgress, subscribe, toggleCompleted } from '@/lib/store';
import { MAP_BY_ID, MAP_EDGES, MAP_LEVELS, MAP_NODES, PREREQS, collectChain } from '@/data/map';
import { QUESTIONS } from '@/data';
import type { IMapNode } from '@/data/map';
import type { StageId } from '@/data/types';

const W = 158;
const H = 56;
const GAP_X = 44;
const GAP_Y = 16;
const PAD = 24;
/** 同一层超过这么多节点就折到下一列，避免某层 9 个节点把画布拉成一长条 */
const MAX_ROWS = 5;

const STAGE_TONE: Record<StageId, { label: string; accent: string; tint: string }> = {
  basic: { label: '基础', accent: '#0071E3', tint: 'rgba(0,113,227,0.07)' },
  cert: { label: '考级', accent: '#4C6B8A', tint: 'rgba(76,107,138,0.08)' },
  contest: { label: '竞赛', accent: '#1D1D1F', tint: 'rgba(29,29,31,0.05)' },
};

const QUESTION_TOPIC = new Map(QUESTIONS.map((question) => [question.id, question.topicId]));

/** 把路径导出成可打印/可粘贴的 Markdown 学习计划 */
function buildPlanMarkdown(steps: IMapNode[], completedSet: Set<string>): string {
  const minutes = steps.reduce((sum, node) => sum + node.minutes, 0);
  const doneCount = steps.filter((node) => completedSet.has(node.id)).length;
  const rows = steps.map((node, index) => {
    const done = completedSet.has(node.id) ? '已学' : '待学';
    const gesp = node.gesp.length > 0 ? node.gesp.map((level) => `L${level}`).join('·') : '—';
    const parents = node.prereqs.length > 0 ? node.prereqs.map((id) => MAP_BY_ID[id]?.title).join('、') : '—';
    return `| ${index + 1} | ${node.title} | ${gesp} | ${node.minutes} 分钟 | ${done} | ${parents} |`;
  });

  return [
    `# 通往「${steps[steps.length - 1]?.title ?? ''}」的学习计划`,
    '',
    `共 ${steps.length} 步 · 预计 ${minutes} 分钟 · 已完成 ${doneCount} 步`,
    '',
    '| 顺序 | 章节 | GESP | 时长 | 状态 | 直接前置 |',
    '| --- | --- | --- | --- | --- | --- |',
    ...rows,
    '',
    '> 路径 = 目标章节的所有前置闭包，按拓扑层排序；由 C++ 笔记「知识地图」导出。',
  ].join('\n');
}

const STAGE_FILTERS: { key: 'all' | StageId; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'basic', label: '基础篇' },
  { key: 'cert', label: '考级篇' },
  { key: 'contest', label: '竞赛篇' },
];

interface IPoint {
  x: number;
  y: number;
}

interface ILayout {
  points: Record<string, IPoint>;
  width: number;
  height: number;
}

/** 按层分列：每层不超过 MAX_ROWS 个节点，超出的折到同层的下一列，整体居中摆放 */
function buildLayout(nodes: IMapNode[]): ILayout {
  const columnsByLevel: Record<number, string[][]> = {};
  const countByLevel: Record<number, number> = {};
  nodes.forEach((node) => {
    const level = node.level;
    const index = countByLevel[level] ?? 0;
    countByLevel[level] = index + 1;
    const columnIndex = Math.floor(index / MAX_ROWS);
    columnsByLevel[level] = columnsByLevel[level] ?? [];
    columnsByLevel[level][columnIndex] = columnsByLevel[level][columnIndex] ?? [];
    columnsByLevel[level][columnIndex].push(node.id);
  });

  const points: Record<string, IPoint> = {};
  let cursorX = PAD;
  const levelStartX: Record<number, number> = {};
  Object.keys(columnsByLevel)
    .map(Number)
    .sort((a, b) => a - b)
    .forEach((level) => {
      levelStartX[level] = cursorX;
      cursorX += columnsByLevel[level].length * (W + GAP_X);
    });

  nodes.forEach((node) => {
    const columns = columnsByLevel[node.level];
    const columnIndex = columns.findIndex((column) => column.includes(node.id));
    const column = columns[columnIndex] ?? [];
    const indexInColumn = column.indexOf(node.id);
    const verticalOffset = ((MAX_ROWS - column.length) / 2) * (H + GAP_Y);
    points[node.id] = {
      x: levelStartX[node.level] + columnIndex * (W + GAP_X),
      y: PAD + verticalOffset + indexInColumn * (H + GAP_Y),
    };
  });

  return {
    points,
    width: cursorX - GAP_X + PAD,
    height: PAD * 2 + MAX_ROWS * H + (MAX_ROWS - 1) * GAP_Y,
  };
}

export default function MapPage() {
  const progress = useSyncExternalStore(subscribe, getProgress, getProgress);
  const completed = useMemo(() => new Set(progress.completed), [progress.completed]);
  const [stageFilter, setStageFilter] = useState<'all' | StageId>('all');
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string>('var');
  const [target, setTarget] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const layout = useMemo(() => buildLayout(MAP_NODES), []);
  const chain = useMemo(() => {
    if (!hovered) return null;
    return new Set([hovered, ...collectChain(hovered, 'ancestors'), ...collectChain(hovered, 'descendants')]);
  }, [hovered]);

  const available = useMemo(
    () =>
      MAP_NODES.filter(
        (node) => !completed.has(node.id) && node.prereqs.every((parent) => completed.has(parent)),
      ),
    [completed],
  );

  // 每章错题数：只统计自测题（错题本里来自 questions 的记录）
  const mistakeCounts = useMemo(() => {
    const counts = new Map<string, number>();
    progress.mistakes.forEach((mistake) => {
      const topicId = QUESTION_TOPIC.get(mistake.questionId);
      if (!topicId) return;
      counts.set(topicId, (counts.get(topicId) ?? 0) + mistake.times);
    });
    return counts;
  }, [progress.mistakes]);

  /** 通往目标章节的完整链路：祖先闭包 + 目标本身，按拓扑层排序 */
  const pathSteps = useMemo(() => {
    if (!target) return null;
    const ids = new Set([target, ...collectChain(target, 'ancestors')]);
    return [...ids]
      .map((id) => MAP_BY_ID[id])
      .filter(Boolean)
      .sort((a, b) => a.level - b.level || a.order - b.order);
  }, [target]);

  const pathSet = useMemo(() => (pathSteps ? new Set(pathSteps.map((node) => node.id)) : null), [pathSteps]);
  const pathIndex = useMemo(
    () => (pathSteps ? new Map(pathSteps.map((node, index) => [node.id, index + 1])) : null),
    [pathSteps],
  );
  const pathMinutes = pathSteps?.reduce((sum, node) => sum + node.minutes, 0) ?? 0;
  const pathDone = pathSteps?.filter((node) => completed.has(node.id)).length ?? 0;

  // 错题优先队列：按累计错次排序，并标出是否已学
  const reviewQueue = useMemo(
    () =>
      MAP_NODES.filter((node) => (mistakeCounts.get(node.id) ?? 0) > 0)
        .sort(
          (a, b) =>
            (mistakeCounts.get(b.id) ?? 0) - (mistakeCounts.get(a.id) ?? 0) || a.order - b.order,
        )
        .slice(0, 5),
    [mistakeCounts],
  );


  const recommended = useMemo(() => {
    const pool = available.length > 0 ? available : MAP_NODES.filter((node) => !completed.has(node.id));
    return pool.slice(0, 3);
  }, [available, completed]);

  const selectedNode = MAP_BY_ID[selected] ?? MAP_BY_ID.var;
  const selectedDone = completed.has(selectedNode.id);
  const selectedMistakes = mistakeCounts.get(selectedNode.id) ?? 0;

  const focusNode = (id: string) => {
    setSelected(id);
    const viewport = viewportRef.current;
    const point = layout.points[id];
    if (viewport && point) {
      viewport.scrollTo({ left: Math.max(0, point.x * zoom - 90), behavior: 'smooth' });
    }
  };

  const isDimmed = (node: IMapNode) => {
    if (pathSet) {
      if (!pathSet.has(node.id)) return true;
      return false;
    }
    if (stageFilter !== 'all' && node.stage !== stageFilter) return true;
    if (chain && !chain.has(node.id)) return true;
    return false;
  };

  return (
    <div className="mx-auto max-w-[1180px] px-5 py-10 md:px-10 md:py-14">
      <header className="border-b border-border pb-6">
        <span className="mono-label">knowledge map</span>
        <h1 className="heading-tight mt-2 text-3xl font-semibold">知识地图</h1>
        <p className="mt-3 max-w-3xl text-[15.5px] leading-[1.85] text-muted-foreground">
          35 章按「谁先谁后」的真实依赖排开：横轴越往右，前置链越深。箭头 a → b 表示「a 没弄懂，b 一定卡」，
          不是教材目录顺序。鼠标停在任意节点上，会点亮它的全部前置与后续；选中某章后再点「以这章为目标」，
          图上会按 1→n 编号画出通往它的完整链路。
        </p>
      </header>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: '已学章节', value: `${completed.size} / ${MAP_NODES.length}`, hint: '来自学习进度标记' },
          { label: '现在可以学', value: String(available.length), hint: '前置已全部达成' },
          { label: '依赖连线', value: String(MAP_EDGES.length), hint: `${MAP_LEVELS} 层拓扑深度` },
          { label: '最长链路', value: `${MAP_LEVELS} 层`, hint: '从 env 到 shortest' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card px-4 py-3.5">
            <p className="mono-label">{stat.label}</p>
            <p className="mt-1 text-[22px] font-semibold tabular-nums tracking-tight">{stat.value}</p>
            <p className="mt-0.5 text-[12.5px] text-muted-foreground">{stat.hint}</p>
          </div>
        ))}
      </section>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {STAGE_FILTERS.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => setStageFilter(filter.key)}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-[13px] transition-colors',
                stageFilter === filter.key
                  ? 'border-primary/30 bg-primary/10 font-medium text-primary'
                  : 'border-border text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground',
              )}
            >
              {filter.label}
            </button>
          ))}
          {target && (
            <button
              type="button"
              onClick={() => setTarget(null)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-[12.5px] text-primary"
            >
              <Flag className="h-3 w-3" />
              目标：{MAP_BY_ID[target]?.title}
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border px-1 py-1">
          <button
            type="button"
            onClick={() => setZoom((value) => Math.max(0.6, Number((value - 0.1).toFixed(2))))}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
            aria-label="缩小"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="min-w-[46px] text-center text-[12.5px] tabular-nums text-muted-foreground">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((value) => Math.min(1.3, Number((value + 0.1).toFixed(2))))}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
            aria-label="放大"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <p className="mt-2 text-[12px] text-muted-foreground">
        窄窗口下左右拖动查看完整链路，或点右上「适应宽度」把整图缩进来；点任一节点会把它滚到眼前。
        节点右上角的红色「错 N」是该章在错题本里的累计错题数。
      </p>

      <section className="mt-2 rounded-xl border border-border bg-card">
        <div ref={viewportRef} className="thin-scroll overflow-auto p-2">
          <div
            style={{
              width: layout.width * zoom,
              height: layout.height * zoom,
            }}
          >
            <svg
              width={layout.width}
              height={layout.height}
              viewBox={`0 0 ${layout.width} ${layout.height}`}
              style={{ transform: `scale(${zoom})`, transformOrigin: '0 0' }}
              role="img"
              aria-label="知识点前置关系图"
            >
              <defs>
                <marker id="map-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
                  <path d="M0,0 L8,4 L0,8 z" fill="#C7C7CC" />
                </marker>
                <marker id="map-arrow-accent" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
                  <path d="M0,0 L8,4 L0,8 z" fill="#0071E3" />
                </marker>
              </defs>

              {MAP_EDGES.map((edge) => {
                const from = layout.points[edge.from];
                const to = layout.points[edge.to];
                if (!from || !to) return null;
                const inPath = pathSet ? pathSet.has(edge.from) && pathSet.has(edge.to) : false;
                const active = inPath || (chain ? chain.has(edge.from) && chain.has(edge.to) : false);
                const dimmed = pathSet
                  ? !inPath
                  : (stageFilter !== 'all' && MAP_BY_ID[edge.from]?.stage !== stageFilter) || (chain !== null && !active);
                const x1 = from.x + W;
                const y1 = from.y + H / 2;
                const x2 = to.x;
                const y2 = to.y + H / 2;
                const curve = Math.max(28, (x2 - x1) / 2);
                return (
                  <path
                    key={`${edge.from}-${edge.to}`}
                    d={`M ${x1} ${y1} C ${x1 + curve} ${y1}, ${x2 - curve} ${y2}, ${x2 - 4} ${y2}`}
                    stroke={active ? '#0071E3' : '#D8D8DD'}
                    strokeWidth={active ? 2 : 1.2}
                    fill="none"
                    markerEnd={active ? 'url(#map-arrow-accent)' : 'url(#map-arrow)'}
                    opacity={dimmed ? 0.25 : active ? 1 : 0.85}
                  />
                );
              })}

              {MAP_NODES.map((node) => {
                const point = layout.points[node.id];
                const tone = STAGE_TONE[node.stage];
                const done = completed.has(node.id);
                const canStart = !done && node.prereqs.every((parent) => completed.has(parent));
                const isSelected = selectedNode.id === node.id;
                const dimmed = isDimmed(node);
                const lines = node.shortTitle.split('\n');

                return (
                  <g
                    key={node.id}
                    transform={`translate(${point.x} ${point.y})`}
                    opacity={dimmed ? 0.28 : 1}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHovered(node.id)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => {
                      setSelected(node.id);
                      const viewport = viewportRef.current;
                      const point = layout.points[node.id];
                      if (viewport && point) {
                        viewport.scrollTo({ left: Math.max(0, point.x * zoom - 90), behavior: 'smooth' });
                      }
                    }}
                  >
                    <rect
                      width={W}
                      height={H}
                      rx={11}
                      fill={done ? 'rgba(0,113,227,0.10)' : canStart ? '#FFFFFF' : 'rgba(250,250,250,0.9)'}
                      stroke={isSelected ? '#0071E3' : done ? 'rgba(0,113,227,0.45)' : canStart ? '#0071E3' : '#E3E3E8'}
                      strokeWidth={isSelected ? 2 : canStart ? 1.4 : 1}
                      strokeDasharray={!done && !canStart ? '0' : undefined}
                    />
                    <rect width={4} height={H} rx={2} fill={tone.accent} opacity={done ? 0.9 : 0.35} />
                    {pathIndex?.has(node.id) ? (
                      <g transform="translate(23 16)">
                        <circle r={8.5} fill="#0071E3" />
                        <text y={3.5} fontSize={9.5} fill="#FFFFFF" textAnchor="middle" fontFamily="var(--font-mono)">
                          {pathIndex.get(node.id)}
                        </text>
                      </g>
                    ) : (
                      <text x={16} y={19} fontSize={10.5} fill="#8E8E93" fontFamily="var(--font-mono)">
                        {String(node.order).padStart(2, '0')}
                      </text>
                    )}
                    {(node.gesp.length > 0 || (mistakeCounts.get(node.id) ?? 0) > 0) && (
                      <text x={W - 12} y={19} fontSize={10.5} textAnchor="end" fontFamily="var(--font-mono)">
                        {node.gesp.length > 0 && (
                          <tspan fill="#A1A1A6">{node.gesp.map((level) => `L${level}`).join('·')}</tspan>
                        )}
                        {node.gesp.length > 0 && (mistakeCounts.get(node.id) ?? 0) > 0 && (
                          <tspan fill="#C7C7CC" dx={3}>
                            ·
                          </tspan>
                        )}
                        {(mistakeCounts.get(node.id) ?? 0) > 0 && (
                          <tspan fill="#FF453A" dx={3}>
                            错{Math.min(mistakeCounts.get(node.id) ?? 0, 99)}
                          </tspan>
                        )}
                      </text>
                    )}
                    {lines.map((line, lineIndex) => (
                      <text
                        key={line}
                        x={16}
                        y={lines.length === 1 ? 38 : 32 + lineIndex * 17}
                        fontSize={12.5}
                        fill="#1D1D1F"
                        fontWeight={done || isSelected ? 600 : 500}
                      >
                        {line}
                      </text>
                    ))}
                    {done ? (
                      <g transform={`translate(${W - 20} ${H - 17})`}>
                        <circle r={7} fill="#0071E3" />
                        <path d="M -3 0 L -0.8 2.4 L 3.4 -2.4" stroke="#fff" strokeWidth={1.6} fill="none" />
                      </g>
                    ) : canStart ? (
                      <g transform={`translate(${W - 20} ${H - 17})`}>
                        <circle r={6.5} fill="none" stroke="#0071E3" strokeWidth={1.2} strokeDasharray="2 2" />
                        <circle r={2.2} fill="#0071E3" />
                      </g>
                    ) : (
                      <g transform={`translate(${W - 20} ${H - 17})`} opacity={0.55}>
                        <rect x={-5} y={-2} width={10} height={8} rx={1.5} fill="none" stroke="#8E8E93" />
                        <path d="M -2.5 -2 A 2.5 2.5 0 0 1 2.5 -2" fill="none" stroke="#8E8E93" />
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 border-t border-border px-4 py-2.5 text-[12px] text-muted-foreground">
          {(Object.keys(STAGE_TONE) as StageId[]).map((stage) => (
            <span key={stage} className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: STAGE_TONE[stage].accent }} />
              {STAGE_TONE[stage].label}篇
            </span>
          ))}
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary">
              <Check className="h-3 w-3 text-primary-foreground" />
            </span>
            已学
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CircleDot className="h-3.5 w-3.5 text-primary" />
            可以开始
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" />
            前置未达成
          </span>
          <span className="ml-auto inline-flex items-center gap-1">
            <GitBranch className="h-3.5 w-3.5" />
            {MAP_EDGES.length} 条依赖
          </span>
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <div className="surface rounded-xl p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded border border-border px-1.5 py-0.5 text-[11px] text-muted-foreground">
              {String(selectedNode.order).padStart(2, '0')}
            </span>
            <h2 className="text-[19px] font-semibold tracking-tight">{selectedNode.title}</h2>
            <span
              className="rounded-full px-2 py-0.5 text-[11.5px]"
              style={{ background: STAGE_TONE[selectedNode.stage].tint, color: STAGE_TONE[selectedNode.stage].accent }}
            >
              {STAGE_TONE[selectedNode.stage].label}篇
            </span>
            {selectedNode.gesp.length > 0 && (
              <span className="rounded-full border border-border px-2 py-0.5 text-[11.5px] text-muted-foreground">
                {selectedNode.gesp.map((level) => `GESP ${level} 级`).join(' · ')}
              </span>
            )}
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <p className="mono-label">前置（学它之前先弄懂）</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {selectedNode.prereqs.length === 0 ? (
                  <span className="text-[13px] text-muted-foreground">无，这是全课程的起点。</span>
                ) : (
                  selectedNode.prereqs.map((parent) => {
                    const node = MAP_BY_ID[parent];
                    if (!node) return null;
                    return (
                      <button
                        key={parent}
                        type="button"
                        onClick={() => setSelected(parent)}
                        className={cn(
                          'rounded-lg border px-2.5 py-1 text-[12.5px] transition-colors',
                          completed.has(parent)
                            ? 'border-primary/30 bg-primary/10 text-primary'
                            : 'border-border text-foreground hover:bg-foreground/[0.04]',
                        )}
                      >
                        {completed.has(parent) && <Check className="mr-1 inline h-3 w-3" />}
                        {node.title}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div>
              <p className="mono-label">后续（学完它才能开）</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {selectedNode.dependents.length === 0 ? (
                  <span className="text-[13px] text-muted-foreground">没有直接后继，可以往练习与模拟卷走。</span>
                ) : (
                  selectedNode.dependents.map((child) => (
                    <button
                      key={child}
                      type="button"
                      onClick={() => setSelected(child)}
                      className="rounded-lg border border-border px-2.5 py-1 text-[12.5px] text-foreground transition-colors hover:bg-foreground/[0.04]"
                    >
                      {MAP_BY_ID[child]?.title}
                    </button>
                  ))
                )}
              </div>
            </div>

            {selectedMistakes > 0 && (
              <p className="text-[13px]">
                <span className="text-destructive">本章错题 {selectedMistakes} 道</span>
                <Link to={`/mistakes?topic=${selectedNode.id}`} className="ml-2 text-primary hover:underline">
                  去错题本重做
                </Link>
              </p>
            )}

            <p className="text-[13px] text-muted-foreground">
              预计精读 {selectedNode.minutes} 分钟 · 共 {selectedNode.prereqs.length + selectedNode.dependents.length} 条直接连线 ·
              全链路 {collectChain(selectedNode.id, 'ancestors').size + collectChain(selectedNode.id, 'descendants').size + 1} 个节点
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              to={`/topics/${selectedNode.id}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              去学这一章
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <button
              type="button"
              onClick={() => toggleCompleted(selectedNode.id)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-[13px] transition-colors',
                selectedDone
                  ? 'border-primary/30 bg-primary/10 text-primary'
                  : 'border-border text-foreground hover:bg-foreground/[0.04]',
              )}
            >
              {selectedDone ? <Check className="h-3.5 w-3.5" /> : <CircleDot className="h-3.5 w-3.5" />}
              {selectedDone ? '已学过，取消标记' : '标记为已学'}
            </button>
            <button
              type="button"
              onClick={() => setTarget(target === selectedNode.id ? null : selectedNode.id)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-[13px] transition-colors',
                target === selectedNode.id
                  ? 'border-primary/30 bg-primary/10 text-primary'
                  : 'border-border text-foreground hover:bg-foreground/[0.04]',
              )}
            >
              <Flag className="h-3.5 w-3.5" />
              {target === selectedNode.id ? '取消目标' : '以这章为目标'}
            </button>
          </div>
        </div>

        <div className="surface rounded-xl p-5 md:p-6">
          {target && pathSteps ? (
            <>
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <Flag className="h-4 w-4 shrink-0 text-primary" />
                  <h2 className="truncate text-[16.5px] font-semibold tracking-tight">
                    通往「{MAP_BY_ID[target]?.title}」
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setTarget(null)}
                  className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
                  aria-label="清除学习目标"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="mt-1.5 text-[13px] tabular-nums text-muted-foreground">
                共 {pathSteps.length} 步 · 预计 {pathMinutes} 分钟 · 已完成 {pathDone} 步
              </p>
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-primary transition-[width]"
                  style={{ width: `${Math.round((pathDone / pathSteps.length) * 100)}%` }}
                />
              </div>

              <ol className="thin-scroll mt-3 max-h-[330px] space-y-1 overflow-y-auto pr-1">
                {pathSteps.map((node, index) => {
                  const done = completed.has(node.id);
                  return (
                    <li key={node.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelected(node.id);
                          const viewport = viewportRef.current;
                          const point = layout.points[node.id];
                          if (viewport && point) {
                            viewport.scrollTo({ left: Math.max(0, point.x * zoom - 90), behavior: 'smooth' });
                          }
                        }}
                        className="flex w-full items-start gap-2.5 rounded-lg border border-border px-2.5 py-2 text-left transition-colors hover:bg-foreground/[0.03]"
                      >
                        <span
                          className={cn(
                            'mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10.5px] tabular-nums',
                            done
                              ? 'bg-primary text-primary-foreground'
                              : 'border border-border bg-card text-muted-foreground',
                          )}
                        >
                          {done ? <Check className="h-3 w-3" /> : index + 1}
                        </span>
                        <span className="min-w-0">
                          <span className={cn('block text-[13px] font-medium', done && 'text-muted-foreground')}>
                            {node.title}
                          </span>
                          <span className="mt-0.5 block text-[11.5px] text-muted-foreground">
                            {node.minutes} 分钟
                            {node.id === target ? ' · 目标' : ''}
                            {(mistakeCounts.get(node.id) ?? 0) > 0 ? ` · 错 ${mistakeCounts.get(node.id)}` : ''}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>

              <p className="mt-3 border-t border-border pt-3 text-[12px] leading-[1.7] text-muted-foreground">
                路径 = 目标章节的所有前置闭包，一条不多一条不少。点任一步可直接跳到该章详情；学完记得回来标记「已学」。
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(buildPlanMarkdown(pathSteps, completed));
                      toast.success('学习计划已复制为 Markdown');
                    } catch {
                      toast.error('复制失败，请手动选中步骤');
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[12.5px] transition-colors hover:bg-foreground/[0.04]"
                >
                  <ClipboardList className="h-3.5 w-3.5" />
                  复制计划
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const markdown = buildPlanMarkdown(pathSteps, completed);
                    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const anchor = document.createElement('a');
                    anchor.href = url;
                    anchor.download = `学习计划-${pathSteps[pathSteps.length - 1]?.title ?? 'cpp'}.md`;
                    anchor.click();
                    URL.revokeObjectURL(url);
                    toast.success('已下载 Markdown 学习计划');
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[12.5px] transition-colors hover:bg-foreground/[0.04]"
                >
                  <Download className="h-3.5 w-3.5" />
                  下载 .md
                </button>
              </div>
            </>
          ) : (
            <>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-[16.5px] font-semibold tracking-tight">接下来最值得学的</h2>
          </div>
          <p className="mt-1.5 text-[13px] leading-[1.7] text-muted-foreground">
            只列前置已全部达成的章节，按课程顺序取前三个。
          </p>
          <div className="mt-3 space-y-2">
            {recommended.length === 0 ? (
              <p className="text-[13.5px] text-muted-foreground">35 章都标记为已学了，去练习和模拟卷里检验吧。</p>
            ) : (
              recommended.map((node, index) => (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setSelected(node.id)}
                  className="flex w-full items-start gap-3 rounded-lg border border-border px-3 py-2.5 text-left transition-colors hover:bg-foreground/[0.03]"
                >
                  <span className="mt-0.5 text-[11.5px] tabular-nums text-muted-foreground">
                    {index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13.5px] font-medium">{node.title}</span>
                    <span className="mt-0.5 block text-[12px] text-muted-foreground">
                      前置 {node.prereqs.length === 0 ? '无' : node.prereqs.map((id) => MAP_BY_ID[id]?.title).join('、')} · {node.minutes} 分钟
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>

          <div className="mt-4 border-t border-border pt-3">
            <p className="mono-label">怎么用这张图</p>
            <ul className="mt-1.5 space-y-1.5 text-[12.5px] leading-[1.75] text-muted-foreground">
              <li>· 卡在某章时，先回头确认图上的前置是否都点过「已学」。</li>
              <li>· 顺着箭头一路往右走完，就是一条完整的学习链。</li>
              <li>· 虚线圆点表示前置已齐，是当下最省力的突破口。</li>
            </ul>
          </div>
            </>
          )}
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-baseline justify-between border-b border-border pb-3">
          <h2 className="text-[17px] font-semibold tracking-tight">复习优先队列</h2>
          <span className="mono-label">mistake-first</span>
        </div>
        <p className="mt-2 text-[13px] leading-[1.7] text-muted-foreground">
          按错题本累计错次排序，取前五章。已学却仍错的最该先补，未学的说明新课一上就会踩坑。
        </p>
        {reviewQueue.length === 0 ? (
          <p className="mt-3 text-[13.5px] text-muted-foreground">
            错题本还是空的。去
            <Link to="/practice" className="mx-1 text-primary hover:underline">
              做一组自测
            </Link>
            或
            <Link to="/reading" className="mx-1 text-primary hover:underline">
              读几段程序
            </Link>
            ，错的会自动排到这里。
          </p>
        ) : (
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {reviewQueue.map((node, index) => {
              const count = mistakeCounts.get(node.id) ?? 0;
              const done = completed.has(node.id);
              return (
                <div key={node.id} className="rounded-xl border border-border bg-card p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="mono-label">no.{index + 1}</span>
                    <span className="rounded-full bg-destructive/10 px-1.5 py-0.5 text-[11px] tabular-nums text-destructive">
                      错 {count}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[13.5px] leading-snug font-medium">{node.title}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11.5px] text-muted-foreground">
                    <span className={cn(done ? 'text-primary' : '')}>{done ? '已学' : '未学'}</span>
                    <button
                      type="button"
                      onClick={() => focusNode(node.id)}
                      className="text-primary transition-opacity hover:opacity-70"
                    >
                      看这章
                    </button>
                    <Link
                      to={`/mistakes?topic=${node.id}`}
                      className="text-primary transition-opacity hover:opacity-70"
                    >
                      重做错题
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl border border-border bg-secondary/30 p-5">
        <p className="mono-label">按级别看依赖</p>
        <p className="mt-1.5 text-[13px] leading-[1.75] text-muted-foreground">
          图上只根据「技术依赖」连线：例如 L4 的函数是所有递推、排序、结构体的前提，因此从它向右分叉最密；
          而 L7 的倍增依赖递归与前缀和，不看教材页码。GESP 考纲的级别划分另见
          <Link to="/gesp" className="mx-1 text-primary hover:underline">
            GESP 大纲页
          </Link>
          。
        </p>
        <p className="mt-2 text-[12px] text-muted-foreground">
          共 {MAP_NODES.length} 章、{PREREQS ? MAP_EDGES.length : 0} 条依赖、最深 {MAP_LEVELS} 层。
        </p>
      </section>
    </div>
  );
}
