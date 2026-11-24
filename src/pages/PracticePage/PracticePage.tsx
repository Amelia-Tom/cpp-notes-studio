import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, ChevronRight, PenLine, X } from 'lucide-react';
import type { IQuestion } from '@/data';
import { getStage, getTopic, getTopicGesp, GESP_LEVELS, QUESTIONS, STAGES, TOPICS, type StageId } from '@/data';
import { recordQuiz, type QuizAnswer } from '@/lib/store';
import useProgress from '@/hooks/useProgress';
import { toast } from 'sonner';
import { saveReviewRound } from '@/lib/review';
import { saveExamResult, useExamRecords } from '@/lib/exam';
import PracticeResult from '@/components/PracticeResult';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type Scope = 'all' | StageId;
type Phase = 'setup' | 'running' | 'result';
const normalize = (value: string) => value.trim().replace(/\s+/g, '').toLowerCase();

function isCorrect(question: IQuestion, selected: number | null, input: string): boolean {
  if (question.type === 'choice') return selected === question.answerIndex;
  const accepted = question.answers ?? [];
  return accepted.some((answer) => normalize(answer) === normalize(input));
}

function shuffle<T>(list: T[]): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function PracticePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const progress = useProgress();
  const topicParam = searchParams.get('topic') ?? '';
  const fixedTopic = getTopic(topicParam);
  const levelParam = Number(searchParams.get('level') ?? '');
  const level = Number.isInteger(levelParam) && levelParam >= 1 && levelParam <= 8 ? levelParam : null;
  const levelInfo = GESP_LEVELS.find((item) => item.level === level);
  const levelPool = level ? QUESTIONS.filter((question) => getTopicGesp(question.topicId).includes(level)) : [];
  const LEVEL_SIZE = 10;

  // 错题重练：?from=mistakes[&topic=xxx]，直接把错题本里的自测错题拼成一组
  const reviewMode = searchParams.get('from') === 'mistakes';
  const reviewPool = reviewMode
    ? [...progress.mistakes]
        .sort((a, b) => b.times - a.times || b.lastAt - a.lastAt)
        .map((mistake) => QUESTIONS.find((question) => question.id === mistake.questionId))
        .filter((question): question is IQuestion => question !== undefined)
        .filter((question) => !fixedTopic || question.topicId === fixedTopic.id)
    : [];

  const examMode = searchParams.get('mode') === 'exam' && level !== null;
  const examRecords = useExamRecords();
  const examRecord = level ? examRecords[String(level)] : undefined;
  // 模拟卷用稳定顺序出题：同级别每次题目一致，便于反复刷到稳定分数
  // 题型配比：10 道选择 + 5 道填空（先用完某一题型时用另一题型补足）
  const stable = (list: IQuestion[]) => [...list].sort((a, b) => a.difficulty - b.difficulty || a.id.localeCompare(b.id));
  const examPool = level
    ? [
        ...stable(levelPool.filter((question) => question.type === 'choice')).slice(0, 10),
        ...stable(levelPool.filter((question) => question.type === 'fill')).slice(0, 5),
      ]
    : [];

  const [phase, setPhase] = useState<Phase>(level || reviewMode ? 'running' : 'setup');
  const [scope, setScope] = useState<Scope>('all');
  const [size, setSize] = useState<number | 'all'>(5);
  const [quiz, setQuiz] = useState<IQuestion[]>(() => {
    if (reviewMode) return reviewPool;
    if (examMode) return examPool;
    return level ? shuffle(levelPool).slice(0, Math.min(LEVEL_SIZE, levelPool.length)) : [];
  });
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [input, setInput] = useState('');
  const [checked, setChecked] = useState(false);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [seconds, setSeconds] = useState<number | undefined>(undefined);
  const [typeStats, setTypeStats] = useState<{ label: string; correct: number; total: number }[]>([]);

  const pool = reviewMode
    ? reviewPool
    : fixedTopic
    ? QUESTIONS.filter((question) => question.topicId === fixedTopic.id)
    : level
      ? levelPool
      : scope === 'all'
      ? QUESTIONS
      : QUESTIONS.filter((question) => {
          const topic = TOPICS.find((item) => item.id === question.topicId);
          return topic?.stage === scope;
        });

  const scopeLabel = reviewMode
    ? `错题重练 · ${fixedTopic ? fixedTopic.title : '全部章节'}`
    : fixedTopic
    ? fixedTopic.title
    : level
      ? examMode
        ? `GESP L${level} 模拟卷 · ${levelInfo?.name ?? ''}`
        : `GESP L${level} · ${levelInfo?.name ?? ''}`
      : scope === 'all'
        ? '全部知识点'
        : `${getStage(scope).name} · ${getStage(scope).code}`;

  const start = () => {
    if (reviewMode) {
      setQuiz(reviewPool);
      setAnswers([]);
      setIndex(0);
      setSelected(null);
      setInput('');
      setChecked(false);
      setStartedAt(Date.now());
      setSeconds(undefined);
      setTypeStats([]);
      setPhase('running');
      return;
    }
    const picked = shuffle(pool).slice(0, size === 'all' ? pool.length : Math.min(size, pool.length));
    setQuiz(picked);
    setAnswers([]);
    setIndex(0);
    setSelected(null);
    setInput('');
    setChecked(false);
    setStartedAt(Date.now());
    setSeconds(undefined);
    setTypeStats([]);
    setPhase('running');
  };

  const restart = () => {
    if (reviewMode) {
      // 重练结算后再点「再来一组」：只把还没答对的错题重新拼一组，全清了就回错题本
      const remaining = [...progress.mistakes]
        .sort((a, b) => b.times - a.times || b.lastAt - a.lastAt)
        .map((mistake) => QUESTIONS.find((question) => question.id === mistake.questionId))
        .filter((question): question is IQuestion => question !== undefined)
        .filter((question) => !fixedTopic || question.topicId === fixedTopic.id);
      if (remaining.length === 0) {
        toast.success('这一章的错题都答对了，已全部移出错题本');
        navigate(fixedTopic ? `/mistakes?topic=${fixedTopic.id}` : '/mistakes');
        return;
      }
      setQuiz(remaining);
      setAnswers([]);
      setIndex(0);
      setSelected(null);
      setInput('');
      setChecked(false);
      setStartedAt(Date.now());
      setSeconds(undefined);
      setTypeStats([]);
      setPhase('running');
      return;
    }
    if (level) {
      setQuiz(examMode ? examPool : shuffle(levelPool).slice(0, Math.min(LEVEL_SIZE, levelPool.length)));
      setAnswers([]);
      setIndex(0);
      setSelected(null);
      setInput('');
      setChecked(false);
      setStartedAt(Date.now());
      setSeconds(undefined);
      setTypeStats([]);
      setPhase('running');
      return;
    }
    setPhase('setup');
  };

  const current = quiz[index];
  const currentCorrect = current ? isCorrect(current, selected, input) : false;
  const canSubmit = current ? (current.type === 'choice' ? selected !== null : input.trim().length > 0) : false;

  const submit = () => {
    if (!current || checked || !canSubmit) return;
    setChecked(true);
    setAnswers((prev) => [...prev, { questionId: current.id, topicId: current.topicId, correct: currentCorrect }]);
  };

  const next = () => {
    if (!current) return;
    if (index + 1 < quiz.length) {
      setIndex(index + 1);
      setSelected(null);
      setInput('');
      setChecked(false);
      return;
    }
    const duration = Math.max(0, Math.round((Date.now() - startedAt) / 1000));
    const stats = [
      { label: '单选', correct: 0, total: 0 },
      { label: '填空', correct: 0, total: 0 },
    ];
    answers.forEach((answer) => {
      const question = quiz.find((item) => item.id === answer.questionId);
      if (!question) return;
      const bucket = question.type === 'choice' ? stats[0] : stats[1];
      bucket.total += 1;
      if (answer.correct) bucket.correct += 1;
    });
    const finalStats = stats.filter((item) => item.total > 0);
    recordQuiz(scopeLabel, answers);
    if (reviewMode) {
      saveReviewRound({
        kind: 'practice',
        topicId: fixedTopic?.id ?? 'all',
        label: fixedTopic?.title ?? '全部章节',
        total: answers.length,
        correct: answers.filter((answer) => answer.correct).length,
      });
    }
    if (examMode && level) {
      saveExamResult(level, answers.filter((answer) => answer.correct).length, quiz.length, duration);
    }
    setSeconds(duration);
    setTypeStats(finalStats);
    setPhase('result');
  };

  // 空态只看「这一组有没有题」，不能用 reviewPool（最后一题答对后错题本清空，
  // 结算页还会留在屏幕上，不能被空态顶掉）
  if (reviewMode && quiz.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16 text-center md:px-10">
        <p className="text-[15.5px] text-muted-foreground">
          {fixedTopic ? `「${fixedTopic.title}」这一章` : '错题本里'}暂时没有自测错题可以重练。
        </p>
        <div className="mt-4 flex items-center justify-center gap-4 text-[13.5px]">
          <Link to={fixedTopic ? `/practice?topic=${fixedTopic.id}` : '/practice'} className="text-primary hover:underline">
            做一组新题
          </Link>
          <Link to={fixedTopic ? `/mistakes?topic=${fixedTopic.id}` : '/mistakes'} className="text-muted-foreground hover:text-foreground">
            回错题本
          </Link>
        </div>
      </div>
    );
  }

  if (phase === 'setup') {
    return (
      <div className="mx-auto max-w-3xl px-5 py-10 md:px-10 md:py-14">
        <span className="mono-label">practice</span>
        <h1 className="heading-tight mt-2 text-3xl font-semibold">练习自测</h1>
        <p className="mt-2 text-[15.5px] leading-[1.8] text-muted-foreground">
          选好范围就开始，每题提交后立刻判分并给出解析。答错的题会自动进入错题本。
        </p>

        {fixedTopic && (
          <div className="surface mt-6 flex items-center justify-between rounded-xl p-4">
            <div>
              <span className="mono-label">本节专项</span>
              <p className="mt-1 text-[14.5px] font-medium">{fixedTopic.title}</p>
              <p className="mt-0.5 text-[12.5px] text-muted-foreground">共 {pool.length} 道题</p>
            </div>
            <Link to="/practice" className="text-[13.5px] text-muted-foreground hover:text-primary">
              取消范围
            </Link>
          </div>
        )}

        {!fixedTopic && (
          <div className="mt-8 space-y-6">
            <div>
              <span className="mono-label">范围</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {[{ id: 'all' as Scope, label: '全部' }, ...STAGES.map((item) => ({ id: item.id as Scope, label: `${item.name} ${item.code}` }))].map(
                  (item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setScope(item.id)}
                      className={cn(
                        'rounded-full border px-3.5 py-1.5 text-[13.5px] transition-colors',
                        scope === item.id
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-border bg-card text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {item.label}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div>
              <span className="mono-label">题量</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {[5, 10, 15].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSize(value)}
                    className={cn(
                      'rounded-full border px-3.5 py-1.5 text-[13.5px] transition-colors',
                      size === value
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border bg-card text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {value} 题
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setSize('all')}
                  className={cn(
                    'rounded-full border px-3.5 py-1.5 text-[13.5px] transition-colors',
                    size === 'all'
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border bg-card text-muted-foreground hover:text-foreground',
                  )}
                >
                  全部
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 border-t border-border pt-5">
          <span className="mono-label">按 gesp 级别专项练</span>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {GESP_LEVELS.map((item) => {
              const count = QUESTIONS.filter((question) => getTopicGesp(question.topicId).includes(item.level)).length;
              return (
                <Link
                  key={item.level}
                  to={`/practice?level=${item.level}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[12.5px] text-foreground/80 transition-colors hover:border-primary/40 hover:text-primary"
                >
                  L{item.level} · {item.name}
                  <span className="text-[11px] text-muted-foreground">{count}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-5">
          <p className="text-[13.5px] text-muted-foreground">
            当前可选题 {pool.length} 道，本组将抽取 {size === 'all' ? pool.length : Math.min(size, pool.length)} 道。
          </p>
          <button
            type="button"
            onClick={start}
            disabled={pool.length === 0}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-foreground px-5 py-2.5 text-[14.5px] font-medium text-background transition-opacity hover:opacity-85 disabled:opacity-40"
          >
            <PenLine className="h-3.5 w-3.5" />
            开始答题
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'result') {
    return (
      <div className="mx-auto max-w-3xl px-5 py-10 md:px-10 md:py-14">
        <PracticeResult
          quiz={quiz}
          answers={answers}
          scopeLabel={scopeLabel}
          onRestart={restart}
          seconds={seconds}
          typeStats={typeStats}
        />
      </div>
    );
  }

  if (!current) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center text-sm text-muted-foreground">
        这组题没有内容，返回重新选择范围。
        <button type="button" onClick={restart} className="ml-2 text-primary hover:underline">
          返回
        </button>
      </div>
    );
  }

  const topic = getTopic(current.topicId);

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:px-10 md:py-12">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            if (reviewMode) navigate(fixedTopic ? `/mistakes?topic=${fixedTopic.id}` : '/mistakes');
            else restart();
          }}
          className="inline-flex items-center gap-1.5 text-[13.5px] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          退出本组
        </button>
        <span className="mono-label">
          {index + 1} / {quiz.length}
        </span>
      </div>

      {reviewMode && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-2">
          <span className="text-[13px] text-muted-foreground">
            错题重练 · {fixedTopic ? `${fixedTopic.title} · ` : ''}共 {quiz.length} 题 · 答对即移出错题本
          </span>
          <Link
            to={fixedTopic ? `/mistakes?topic=${fixedTopic.id}` : '/mistakes'}
            className="text-[13px] text-primary hover:underline"
          >
            回错题本 →
          </Link>
        </div>
      )}

      {level && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-2">
          <span className="text-[13px] text-muted-foreground">
            GESP L{level} {examMode ? '模拟卷' : '专项'} · {levelInfo?.name} · 共 {quiz.length} 题
            {examMode && examRecord && ` · 历史最好 ${examRecord.best} 分`}
          </span>
          <Link to="/gesp" className="text-[13px] text-primary hover:underline">
            看本级大纲 →
          </Link>
        </div>
      )}

      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${((index + 1) / quiz.length) * 100}%` }}
        />
      </div>

      <div className="surface mt-6 rounded-xl p-5 md:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mono-label">{current.type === 'choice' ? '单选' : '写出结果'}</span>
          {topic && (
            <Link
              to={`/topics/${topic.id}`}
              className="rounded-full border border-border px-2 py-0.5 text-[12.5px] text-muted-foreground hover:text-primary"
            >
              {topic.title}
            </Link>
          )}
        </div>
        <p className="mt-3 text-[16px] leading-7">{current.prompt}</p>

        {current.type === 'choice' ? (
          <div className="mt-5 space-y-2">
            {current.options?.map((option, optionIndex) => {
              const isPicked = selected === optionIndex;
              const showCorrect = checked && optionIndex === current.answerIndex;
              const showWrong = checked && isPicked && optionIndex !== current.answerIndex;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => !checked && setSelected(optionIndex)}
                  disabled={checked}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg border px-3.5 py-2.5 text-left text-[14.5px] transition-colors',
                    showCorrect && 'border-primary/50 bg-primary/5',
                    showWrong && 'border-destructive/50 bg-destructive/5',
                    !checked && isPicked && 'border-foreground/40 bg-secondary',
                    !checked && !isPicked && 'border-border hover:bg-secondary/60',
                  )}
                >
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[12.5px]"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {String.fromCharCode(65 + optionIndex)}
                  </span>
                  <span className="flex-1">{option}</span>
                  {showCorrect && <Check className="h-3.5 w-3.5 text-primary" />}
                  {showWrong && <X className="h-3.5 w-3.5 text-destructive" />}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-5">
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              disabled={checked}
              placeholder="输入答案，例如：3 或 打印的结果"
              className="max-w-sm"
              style={{ fontFamily: 'var(--font-mono)' }}
            />
            <p className="mt-2 text-[12.5px] text-muted-foreground">判题时忽略空格与大小写。</p>
          </div>
        )}

        {checked && (
          <div className="mt-5 rounded-lg bg-secondary/60 p-3.5">
            <p className={cn('text-[14.5px] font-medium', currentCorrect ? 'text-primary' : 'text-destructive')}>
              {currentCorrect ? '答对了' : '答错了'}
              {!currentCorrect && (
                <span className="ml-2 font-normal text-muted-foreground">
                  正确答案：
                  {current.type === 'choice' ? current.options?.[current.answerIndex ?? 0] : current.answers?.[0]}
                </span>
              )}
            </p>
            <p className="mt-1.5 text-[12.5px] leading-6 text-muted-foreground">{current.explanation}</p>
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-end gap-2">
        {!checked ? (
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-5 py-2.5 text-[14.5px] font-medium text-background transition-opacity hover:opacity-85 disabled:opacity-30"
          >
            提交答案
          </button>
        ) : (
          <button
            type="button"
            onClick={next}
            className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-5 py-2.5 text-[14.5px] font-medium text-background transition-opacity hover:opacity-85"
          >
            {index + 1 < quiz.length ? '下一题' : '查看结果'}
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
