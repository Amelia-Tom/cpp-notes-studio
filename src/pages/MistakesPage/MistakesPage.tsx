import { Link } from 'react-router-dom';
import { CircleCheck, Code, NotebookPen, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { getTopic, QUESTIONS } from '@/data';
import useProgress from '@/hooks/useProgress';
import { removeMistake } from '@/lib/store';
import { READING_ITEMS } from '@/data/reading';
import { removeReadingRecord, useReadingRecords } from '@/lib/reading';

export default function MistakesPage() {
  const progress = useProgress();
  const readingRecords = useReadingRecords();

  const readingWrong = Object.values(readingRecords)
    .filter((record) => !record.correct)
    .map((record) => ({ record, item: READING_ITEMS.find((entry) => entry.id === record.itemId) }))
    .filter((entry): entry is NonNullable<typeof entry> => entry.item !== undefined)
    .sort((a, b) => new Date(b.record.lastAt).getTime() - new Date(a.record.lastAt).getTime());

  const items = progress.mistakes
    .map((entry) => {
      const question = QUESTIONS.find((item) => item.id === entry.questionId);
      return question ? { entry, question, topic: getTopic(question.topicId) } : null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => b.entry.lastAt - a.entry.lastAt);

  const handleRemove = (questionId: string) => {
    removeMistake(questionId);
    toast.success('已从错题本移除');
  };

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 md:px-10 md:py-14">
      <header className="border-b border-border pb-5">
        <span className="mono-label">mistakes</span>
        <h1 className="heading-tight mt-2 text-3xl font-semibold">错题本</h1>
        <p className="mt-2 text-[15.5px] leading-[1.8] text-muted-foreground">
          自测和程序阅读答错都会自动收进来；同一题再次答对时自动移出。共 {items.length + readingWrong.length} 道
          （自测 {items.length} · 阅读 {readingWrong.length}）。
        </p>
      </header>

      {items.length === 0 && readingWrong.length === 0 ? (
        <div className="mt-14 flex flex-col items-center gap-3 text-muted-foreground">
          <CircleCheck className="h-9 w-9 text-primary/70" />
          <p className="text-sm">还没有错题，说明你目前的正确率很稳。</p>
          <Link to="/practice" className="text-[14.5px] text-primary hover:underline">
            去做一组自测
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {items.map(({ entry, question, topic }) => (
            <div key={question.id} className="surface rounded-xl p-4 md:p-5">
              <div className="flex flex-wrap items-center gap-2">
                <NotebookPen className="h-3.5 w-3.5 text-muted-foreground" />
                {topic && (
                  <Link
                    to={`/topics/${topic.id}`}
                    className="mono-label normal-case tracking-normal hover:text-primary"
                  >
                    {String(topic.order).padStart(2, '0')} · {topic.title}
                  </Link>
                )}
                <span className="ml-auto text-[12.5px] text-muted-foreground">错 {entry.times} 次</span>
              </div>

              <p className="mt-2 text-[13.5px] leading-6">{question.prompt}</p>
              <p className="mt-2 text-[13.5px] text-primary">
                正确答案：
                {question.type === 'choice' ? question.options?.[question.answerIndex ?? 0] : question.answers?.[0]}
              </p>
              <p className="mt-1.5 text-[13.5px] leading-5 text-muted-foreground">{question.explanation}</p>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Link
                  to={topic ? `/practice?topic=${topic.id}` : '/practice'}
                  className="text-[13.5px] text-primary hover:underline"
                >
                  做本节同类题
                </Link>
                {topic && (
                  <Link to={`/topics/${topic.id}`} className="text-[13.5px] text-muted-foreground hover:text-foreground">
                    回看知识点
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(question.id)}
                  className="ml-auto inline-flex items-center gap-1 text-[13.5px] text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  移除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {readingWrong.length > 0 && (
        <section className="mt-10">
          <div className="flex items-baseline justify-between border-b border-border pb-2">
            <h2 className="text-lg font-semibold tracking-tight">程序阅读错题</h2>
            <Link to="/reading" className="text-[13.5px] text-primary hover:underline">
              去重做 →
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {readingWrong.map(({ record, item }) => (
              <div key={item.id} className="surface rounded-xl p-4 md:p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Code className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="mono-label normal-case tracking-normal">L{item.level}</span>
                  <span className="text-[13.5px]">{item.title}</span>
                  <span className="ml-auto text-[12.5px] text-muted-foreground">错 {record.attempts - record.correctCount} 次</span>
                </div>
                <p className="mt-2 text-[13px] text-muted-foreground">考点：{item.point}</p>
                <p className="mt-1.5 text-[13.5px]">
                  你选了 <span className="text-destructive">{item.options[record.choice]}</span>，正确答案是
                  <span className="text-primary"> {item.options[item.answerIndex]}</span>
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <Link to="/reading" className="text-[13.5px] text-primary hover:underline">
                    重做这道类型
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      removeReadingRecord(item.id);
                      toast.success('已从错题本移除');
                    }}
                    className="ml-auto inline-flex items-center gap-1 text-[13.5px] text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    移除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
