// EXPORTS: 默认导出 ReadingPage 页面（程序阅读训练：猜输出 + 程序填空）

import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check, Lightbulb, RotateCcw, Target, X } from 'lucide-react';
import CodeCard from '@/components/CodeCard';
import ReviewClosure from '@/components/ReviewClosure';
import { getReadingTopicId, READING_ITEMS, READING_LEVELS, type IReadingItem } from '@/data/reading';
import { getTopic } from '@/data';
import { cn } from '@/lib/utils';
import { useQuizKeys } from '@/hooks/useQuizKeys';
import { saveReadingAnswer, useReadingRecords } from '@/lib/reading';
import { saveReviewRound } from '@/lib/review';

interface Answer {
  itemId: string;
  /** output 题是选项下标，blank 题为 -1 */
  choice: number;
  correct: boolean;
  /** blank 题提交的原文 */
  text?: string;
}

/** 填空判定：去掉空白、末尾分号，忽略大小写 */
function normalizeBlank(value: string): string {
  return value.replace(/；/g, ';').replace(/;/g, '').replace(/\s+/g, '').toLowerCase();
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

function LevelChips({
  active,
  counts,
  onChange,
}: {
  active: number | 'all';
  counts: Record<string, number>;
  onChange: (level: number | 'all') => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {(['all', ...READING_LEVELS] as const).map((level) => {
        const key = String(level);
        const isActive = active === level;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(level)}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-[13px] transition-colors',
              isActive
                ? 'border-primary/30 bg-primary/10 font-medium text-primary'
                : 'border-border text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground',
            )}
          >
            {level === 'all' ? '全部' : `L${level}`}
            <span className="ml-1.5 tabular-nums opacity-70">{counts[key] ?? 0}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function ReadingPage() {
  const [searchParams] = useSearchParams();
  const history = useReadingRecords();
  const topicParam = searchParams.get('topic') ?? '';
  const fixedTopic = getTopic(topicParam);
  const reviewMode = searchParams.get('from') === 'mistakes';
  const mistakesLink = fixedTopic ? `/mistakes?topic=${fixedTopic.id}` : '/mistakes';

  // 错题重练：进入时把所有未答对的阅读错题冻结成这一组，避免答对后记录更新把队列抽短
  const [reviewIds] = useState<string[]>(() => {
    if (!reviewMode) return [];
    return Object.values(history)
      .filter((record) => !record.correct)
      .filter((record) => !fixedTopic || getReadingTopicId(record.itemId) === fixedTopic.id)
      .sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime())
      .map((record) => record.itemId);
  });

  const [level, setLevel] = useState<number | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'output' | 'blank'>('all');
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [fill, setFill] = useState('');
  const [fillText, setFillText] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [finished, setFinished] = useState(false);
  const [wrongOnly, setWrongOnly] = useState<string[] | null>(reviewMode ? reviewIds : null);

  // 级别计数跟随题型筛选联动，避免「L1 6 题」但筛成填空题只剩 2 题时对不上
  const counts = useMemo(() => {
    const scoped = typeFilter === 'all' ? READING_ITEMS : READING_ITEMS.filter((item) => item.kind === typeFilter);
    const map: Record<string, number> = { all: scoped.length };
    READING_LEVELS.forEach((lv) => {
      map[String(lv)] = scoped.filter((item) => item.level === lv).length;
    });
    return map;
  }, [typeFilter]);

  const queue = useMemo<IReadingItem[]>(() => {
    const byLevel = level === 'all' ? READING_ITEMS : READING_ITEMS.filter((item) => item.level === level);
    return typeFilter === 'all' ? byLevel : byLevel.filter((item) => item.kind === typeFilter);
  }, [level, typeFilter]);

  const typeCounts = useMemo(
    () => ({
      all: READING_ITEMS.length,
      output: READING_ITEMS.filter((item) => item.kind === 'output').length,
      blank: READING_ITEMS.filter((item) => item.kind === 'blank').length,
    }),
    [],
  );

  const answeredCount = answers.filter((answer) => queue.some((item) => item.id === answer.itemId)).length;
  const historyRecords = Object.values(history);
  const historyAttempts = historyRecords.reduce((sum, record) => sum + record.attempts, 0);
  const historyCorrect = historyRecords.reduce((sum, record) => sum + record.correctCount, 0);
  const historyRate = historyAttempts > 0 ? Math.round((historyCorrect / historyAttempts) * 100) : null;

  const correctCount = answers.filter(
    (answer) => answer.correct && queue.some((item) => item.id === answer.itemId),
  ).length;

  const restart = (nextLevel: number | 'all' = level, onlyWrong = false) => {
    if (onlyWrong) {
      const wrong = answers.filter((answer) => !answer.correct).map((answer) => answer.itemId);
      setLevel('all');
      setWrongOnly(wrong);
      setAnswers([]);
      setChoice(null);
      setFill('');
      setFillText(null);
      setIndex(0);
      setFinished(false);
      return;
    }
    setLevel(nextLevel);
    setWrongOnly(null);
    setAnswers([]);
    setChoice(null);
    setFill('');
    setFillText(null);
    setIndex(0);
    setFinished(false);
  };

  const finalQueue = useMemo(
    () => (wrongOnly ? READING_ITEMS.filter((item) => wrongOnly.includes(item.id)) : queue),
    [queue, wrongOnly],
  );
  const display = finalQueue[index];

  const submit = (optionIndex: number) => {
    if (choice !== null || !display) return;
    setChoice(optionIndex);
    const isRight = optionIndex === display.answerIndex;
    setAnswers((prev) => [...prev, { itemId: display.id, choice: optionIndex, correct: isRight }]);
    saveReadingAnswer(display.id, optionIndex, isRight);
  };

  const submitFill = () => {
    if (choice !== null || !display || display.kind !== 'blank') return;
    const raw = fill.trim();
    if (raw.length === 0) return;
    const accepted = (display.answers ?? []).map(normalizeBlank);
    const isRight = accepted.includes(normalizeBlank(raw));
    setChoice(-1);
    setFillText(raw);
    setAnswers((prev) => [...prev, { itemId: display.id, choice: -1, correct: isRight, text: raw }]);
    saveReadingAnswer(display.id, -1, isRight, raw);
  };

  const next = () => {
    if (index + 1 >= finalQueue.length) {
      if (reviewMode) {
        saveReviewRound({
          kind: 'reading',
          topicId: fixedTopic?.id ?? 'all',
          label: fixedTopic?.title ?? '全部章节',
          total: answers.length,
          correct: answers.filter((answer) => answer.correct).length,
        });
      }
      setFinished(true);
      return;
    }
    setIndex(index + 1);
    setChoice(null);
    setFill('');
    setFillText(null);
  };

  useQuizKeys({
    enabled: !finished && Boolean(display),
    optionCount: display && display.kind !== 'blank' ? display.options?.length ?? 0 : 0,
    submitted: choice !== null,
    onPick: (optionIndex) => submit(optionIndex),
    onSubmit: () => {
      if (display?.kind === 'blank') submitFill();
    },
    onNext: next,
  });

  const wrongAnswers = answers.filter((answer) => !answer.correct);
  const isEmpty = finalQueue.length === 0;

  // 结算页按题型拆解正确率：猜输出和填空的失分原因并不相同
  const byKind = useMemo(() => {
    const stat = { output: { total: 0, right: 0 }, blank: { total: 0, right: 0 } };
    answers.forEach((answer) => {
      const kind = READING_ITEMS.find((item) => item.id === answer.itemId)?.kind ?? 'output';
      stat[kind].total += 1;
      if (answer.correct) stat[kind].right += 1;
    });
    return stat;
  }, [answers]);

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 md:px-10 md:py-14">
      <header className="border-b border-border pb-6">
        <span className="mono-label">reading · output &amp; blank</span>
        <h1 className="heading-tight mt-2 text-3xl font-semibold">程序阅读训练</h1>
        <p className="mt-3 max-w-2xl text-[15.5px] leading-[1.8] text-muted-foreground">
          GESP 与 CSP 的选择题里，一大半是「给一段程序，问输出什么」；另有大量程序填空题，考「哪一行/哪个表达式才能让程序得到正确结果」。
          两种题都不靠背，靠能不能跟着程序走一遍。每题按 GESP 级别标注，答完立刻给逐行推演。
        </p>
        <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3 border-t border-border pt-4">
          {[
            { value: String(READING_ITEMS.length), label: '题库总量' },
            { value: '1–8', label: '覆盖级别' },
            { value: answeredCount === 0 ? '—' : `${correctCount}/${answeredCount}`, label: '本轮正确' },
            { value: historyRate === null ? '—' : `${historyRate}%`, label: '累计正确率' },
            { value: `${answeredCount}/${finalQueue.length || 0}`, label: '本轮进度' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-semibold tabular-nums tracking-tight">{stat.value}</p>
              <p className="mono-label mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </header>

      {!finished && reviewMode && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-2">
          <span className="text-[13px] text-muted-foreground">
            阅读错题重练 · {fixedTopic ? `${fixedTopic.title} · ` : ''}共 {finalQueue.length} 题 · 答对即移出错题本
          </span>
          <Link to={mistakesLink} className="text-[13px] text-primary hover:underline">
            回错题本 →
          </Link>
        </div>
      )}

      {!finished && !reviewMode && (
        <div className="mt-6 space-y-4">
          <LevelChips
            active={level}
            counts={counts}
            onChange={(nextLevel) => {
              if (nextLevel === level) return;
              restart(nextLevel);
            }}
          />
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { key: 'all', label: '全部题型' },
                { key: 'output', label: '猜输出' },
                { key: 'blank', label: '程序填空' },
              ] as const
            ).map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => {
                  if (option.key === typeFilter) return;
                  setTypeFilter(option.key);
                  setWrongOnly(null);
                  setAnswers([]);
                  setChoice(null);
                  setFill('');
                  setFillText(null);
                  setIndex(0);
                  setFinished(false);
                }}
                className={cn(
                  'rounded-lg border px-3 py-1.5 text-[13px] transition-colors',
                  typeFilter === option.key
                    ? 'border-primary/30 bg-primary/10 font-medium text-primary'
                    : 'border-border text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground',
                )}
              >
                {option.label}
                <span className="ml-1.5 tabular-nums opacity-70">{typeCounts[option.key]}</span>
              </button>
            ))}
          </div>
          {wrongOnly && (
            <p className="text-[13.5px] text-muted-foreground">
              正在重做上一轮的 {finalQueue.length} 道错题。
              <button type="button" onClick={() => restart('all')} className="ml-1 text-primary hover:underline">
                回到全部题目
              </button>
            </p>
          )}
        </div>
      )}

      {isEmpty && !finished && (reviewMode ? (
        <div className="surface mt-6 rounded-xl p-6 text-center">
          <p className="text-[14.5px] text-muted-foreground">
            {fixedTopic ? `「${fixedTopic.title}」这一章` : '错题本里'}暂时没有阅读错题可以重练。
          </p>
          <div className="mt-3 flex items-center justify-center gap-4 text-[13.5px]">
            <Link to="/reading" className="text-primary hover:underline">
              去做一组阅读题
            </Link>
            <Link to={mistakesLink} className="text-muted-foreground hover:text-foreground">
              回错题本
            </Link>
          </div>
        </div>
      ) : (
        <div className="surface mt-6 rounded-xl p-6 text-center text-[14.5px] text-muted-foreground">
          这个级别暂时没有题目，换一个级别试试。
        </div>
      ))}

      {!isEmpty && !finished && display && (
        <section className="surface mt-4 rounded-xl p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="rounded-md border border-border px-1.5 py-0.5 text-[11.5px] text-muted-foreground">
                L{display.level}
              </span>
              <h2 className="text-lg font-semibold tracking-tight">{display.title}</h2>
            </div>
            <span className="text-[12.5px] tabular-nums text-muted-foreground">
              {index + 1} / {finalQueue.length}
            </span>
          </div>

          <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-500"
              style={{ width: `${((index + (choice === null ? 0 : 1)) / finalQueue.length) * 100}%` }}
            />
          </div>

          <p className="mt-5 text-[14.5px] leading-[1.75] text-muted-foreground">
            {display.kind === 'blank'
              ? `把程序里的 ___ 补全，让程序输出 ${display.expected ?? ''}：`
              : '阅读下面的程序（可以直接按行号跟着走），选出它的输出：'}
          </p>

          <div className="mt-3">
            <CodeCard code={display.code} title="main.cpp" />
          </div>

          {display.kind === 'blank' ? (
            <div className="mt-5">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={fill}
                  onChange={(event) => setFill(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      // 拦下冒泡：全局快捷键也监听 Enter，不 preventDefault 会判两次
                      event.preventDefault();
                      submitFill();
                    }
                  }}
                  disabled={choice !== null}
                  placeholder="填写 ___ 处的内容，例如 i <= n"
                  className="min-w-[240px] flex-1 rounded-lg border border-border bg-card px-3 py-2.5 text-[14.5px] outline-none transition-colors focus:border-primary/40 disabled:opacity-60"
                  style={{ fontFamily: 'var(--font-mono)' }}
                />
                <button
                  type="button"
                  onClick={submitFill}
                  disabled={choice !== null || fill.trim().length === 0}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-[13.5px] font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  提交答案
                </button>
              </div>
              {choice !== null && (
                <p className="mt-2 text-[12.5px] text-muted-foreground">
                  标准写法：
                  <span className="ml-1 text-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                    {display.answers?.[0]}
                  </span>
                  （填对后程序输出 {display.expected}）
                </p>
              )}
            </div>
          ) : (
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {(display.options ?? []).map((option, optionIndex) => {
              const isPicked = choice === optionIndex;
              const isAnswer = optionIndex === display.answerIndex;
              const revealed = choice !== null;
              return (
                <button
                  key={option}
                  type="button"
                  disabled={revealed}
                  onClick={() => submit(optionIndex)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors',
                    !revealed && 'border-border hover:border-primary/40 hover:bg-primary/[0.04]',
                    revealed && isAnswer && 'border-primary/40 bg-primary/10',
                    revealed && isPicked && !isAnswer && 'border-destructive/40 bg-destructive/5',
                    revealed && !isPicked && !isAnswer && 'border-border opacity-60',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-[12px]',
                      revealed && isAnswer
                        ? 'border-primary/40 bg-primary text-primary-foreground'
                        : revealed && isPicked
                          ? 'border-destructive/40 bg-destructive text-background'
                          : 'border-border text-muted-foreground',
                    )}
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {revealed && isAnswer ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : revealed && isPicked ? (
                      <X className="h-3.5 w-3.5" />
                    ) : (
                      OPTION_LETTERS[optionIndex]
                    )}
                  </span>
                  <span className="text-[14.5px]" style={{ fontFamily: 'var(--font-mono)' }}>
                    {option}
                  </span>
                </button>
              );
            })}
          </div>
          )}

          {choice !== null && (
            <div className="mt-5 rounded-xl border border-border bg-secondary/30 p-4 md:p-5">
              <div className="flex items-center gap-2">
                {choice !== null && answers[answers.length - 1]?.correct ? (
                  <>
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-[14.5px] font-medium text-primary">答对了</span>
                  </>
                ) : display.kind === 'blank' ? (
                  <>
                    <X className="h-4 w-4 text-destructive" />
                    <span className="text-[14.5px] font-medium text-destructive">
                      填错了，你写的是「{fillText}」，标准答案是 {display.answers?.[0]}
                    </span>
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 text-destructive" />
                    <span className="text-[14.5px] font-medium text-destructive">
                      选错了，正确答案是 {OPTION_LETTERS[display.answerIndex ?? 0]}（
                      {(display.options ?? [])[display.answerIndex ?? 0]}）
                    </span>
                  </>
                )}
              </div>

              <div className="mt-3 flex items-start gap-2 text-[13.5px] text-muted-foreground">
                <Target className="mt-0.5 h-4 w-4 shrink-0" />
                <span>考点：{display.point}</span>
              </div>

              <div className="mt-3 flex items-start gap-2">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="text-[14.5px] leading-[1.9] text-foreground/90">{display.explanation}</p>
              </div>

              <p className="mt-4 text-right text-[12px] text-muted-foreground">
                <kbd className="mx-0.5 rounded border border-border bg-secondary/70 px-1">Enter</kbd>
                {index + 1 >= finalQueue.length ? '看本轮结果' : '下一题'}
                {display.kind === 'blank' ? '（填空输入框里 Enter 直接判题）' : ''}
              </p>
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={next}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-[13.5px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  {index + 1 >= finalQueue.length ? '看本轮结果' : '下一题'}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {finished && (
        <section className="surface mt-6 rounded-xl p-6">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-xl font-semibold tracking-tight">本轮结果</h2>
            <span className="text-[13px] text-muted-foreground tabular-nums">
              {correctCount} / {answers.length}
            </span>
          </div>

          <p className="mt-3 text-[15px] leading-[1.8] text-muted-foreground">
            {answers.length === 0
              ? '这一轮还没作答。'
              : correctCount === answers.length
                ? reviewMode
                  ? '全对。这一章的阅读错题已经清掉了，可以回错题本看看还剩什么。'
                  : '全对。这个级别的阅读题可以往下一级走了。'
                : `正确率 ${Math.round((correctCount / answers.length) * 100)}%。错题的推演过程值得再读一遍，尤其是循环边界和下标那几处。`}
          </p>

          {(byKind.output.total > 0 || byKind.blank.total > 0) && (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {(
                [
                  { key: 'output', label: '猜输出', stat: byKind.output },
                  { key: 'blank', label: '程序填空', stat: byKind.blank },
                ] as const
              ).map((entry) => (
                <div key={entry.key} className="rounded-lg border border-border px-3 py-2.5">
                  <p className="mono-label">{entry.label}</p>
                  <p className="mt-1 text-[14px] tabular-nums">
                    {entry.stat.total === 0
                      ? '本轮未涉及'
                      : `${entry.stat.right} / ${entry.stat.total} · 正确率 ${Math.round((entry.stat.right / entry.stat.total) * 100)}%`}
                  </p>
                </div>
              ))}
            </div>
          )}

          {wrongAnswers.length > 0 && (
            <div className="mt-5 space-y-2 border-t border-border pt-4">
              <p className="mono-label">错题回顾</p>
              {wrongAnswers.map((answer) => {
                const item = READING_ITEMS.find((entry) => entry.id === answer.itemId);
                if (!item) return null;
                return (
                  <div
                    key={answer.itemId}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2.5"
                  >
                    <span className="text-[13.5px]">
                      <span className="mr-2 rounded border border-border px-1 py-0.5 text-[11px] text-muted-foreground">
                        L{item.level}
                      </span>
                      {item.title}
                    </span>
                    <span className="text-[12.5px] text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                      {item.kind === 'blank'
                        ? `你填 ${answer.text ?? '—'} ／ 标准 ${item.answers?.[0]}`
                        : `你选 ${item.options?.[answer.choice]} ／ 正确 ${item.options?.[item.answerIndex ?? 0]}`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            {wrongAnswers.length > 0 && (
              <button
                type="button"
                onClick={() => restart(level, true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-[13.5px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                只重做本轮错的
              </button>
            )}
            {reviewMode ? (
              <Link
                to={mistakesLink}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-[13.5px] text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
              >
                回错题本
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => restart(level)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-[13.5px] text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                重新做这一轮
              </button>
            )}
          </div>
        </section>
      )}

      {finished && reviewMode && <ReviewClosure topicId={fixedTopic?.id} />}
    </div>
  );
}
