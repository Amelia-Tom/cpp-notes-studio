import { Link } from 'react-router-dom';
import { Check, RotateCcw, X } from 'lucide-react';
import type { IQuestion } from '@/data';
import type { QuizAnswer } from '@/lib/store';
import { getTopic } from '@/data';

interface TypeStat {
  label: string;
  correct: number;
  total: number;
}

interface PracticeResultProps {
  quiz: IQuestion[];
  answers: QuizAnswer[];
  scopeLabel: string;
  onRestart: () => void;
  seconds?: number;
  typeStats?: TypeStat[];
}

export default function PracticeResult({ quiz, answers, scopeLabel, onRestart, seconds, typeStats }: PracticeResultProps) {
  const duration = seconds !== undefined ? `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}` : null;
  const total = quiz.length;
  const correct = answers.filter((answer) => answer.correct).length;
  const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
  const wrong = quiz.filter((question) => !answers.find((answer) => answer.questionId === question.id && answer.correct));

  const verdict = percent >= 90 ? '很稳，可以往前推进了' : percent >= 70 ? '基本掌握，错题再看一遍' : '先回到知识点补一补';

  return (
    <div className="space-y-8">
      <div className="surface rounded-xl p-6 text-center">
        <span className="mono-label">{scopeLabel}</span>
        <p className="mt-3 text-5xl font-semibold tracking-tight">{percent}<span className="text-xl">分</span></p>
        <p className="mt-2 text-[14.5px] text-muted-foreground">
          答对 {correct} / {total} 题
          {duration && ` · 用时 ${duration}`} · {verdict}
        </p>
        {typeStats && typeStats.length > 0 && (
          <div className="mx-auto mt-4 flex max-w-md flex-wrap justify-center gap-x-5 gap-y-1.5 text-[13px] text-muted-foreground">
            {typeStats.map((item) => (
              <span key={item.label}>
                {item.label}
                <span className="ml-1.5 tabular-nums">
                  {item.correct}/{item.total}
                </span>
                <span className="ml-1.5 text-foreground/45 tabular-nums">
                  {item.total > 0 ? `${Math.round((item.correct / item.total) * 100)}%` : '—'}
                </span>
              </span>
            ))}
          </div>
        )}
        <div className="mx-auto mt-6 flex max-w-xs items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/65">
            <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
          </div>
          <span className="text-[12.5px] text-muted-foreground">{percent}%</span>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={onRestart}
            className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-[13.5px] font-medium text-background hover:opacity-85"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            再来一组
          </button>
          <Link
            to="/mistakes"
            className="inline-flex items-center gap-1.5 rounded-full glass-chip px-4 py-2 text-[13.5px] hover:bg-white/65"
          >
            去错题本
          </Link>
          <Link
            to="/progress"
            className="inline-flex items-center gap-1.5 rounded-full glass-chip px-4 py-2 text-[13.5px] hover:bg-white/65"
          >
            看学习进度
          </Link>
        </div>
      </div>

      {wrong.length > 0 ? (
        <div>
          <div className="flex items-baseline justify-between border-b border-border pb-2">
            <h2 className="text-base font-semibold tracking-tight">需要回看的题</h2>
            <span className="mono-label">{wrong.length} 题</span>
          </div>
          <div className="mt-4 space-y-3">
            {wrong.map((question) => {
              const topic = getTopic(question.topicId);
              return (
                <div key={question.id} className="surface rounded-xl p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <X className="h-3.5 w-3.5 text-destructive" />
                    <span className="mono-label normal-case tracking-normal">
                      {topic ? topic.title : question.topicId}
                    </span>
                  </div>
                  <p className="mt-2 text-[14.5px] leading-6">{question.prompt}</p>
                  <p className="mt-2 text-[13.5px] text-primary">
                    正确答案：
                    {question.type === 'choice' ? question.options?.[question.answerIndex ?? 0] : question.answers?.[0]}
                  </p>
                  <p className="mt-1.5 text-[13.5px] leading-5 text-muted-foreground">{question.explanation}</p>
                  {topic && (
                    <Link
                      to={`/topics/${topic.id}`}
                      className="mt-2 inline-block text-[13.5px] text-muted-foreground hover:text-primary"
                    >
                      回到知识点
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2 surface py-10 text-[14.5px] text-muted-foreground">
          <Check className="h-4 w-4 text-primary" />
          全部答对，这组题可以放下了。
        </div>
      )}
    </div>
  );
}
