import { Link, useSearchParams } from 'react-router-dom';
import { CircleCheck, Code, NotebookPen, RotateCcw, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { getTopic, QUESTIONS } from '@/data';
import useProgress from '@/hooks/useProgress';
import { removeMistake } from '@/lib/store';
import { getReadingTopicId, READING_ITEMS } from '@/data/reading';
import { removeReadingRecord, useReadingRecords } from '@/lib/reading';

export default function MistakesPage() {
  const progress = useProgress();
  const readingRecords = useReadingRecords();
  const [searchParams, setSearchParams] = useSearchParams();
  const topicParam = searchParams.get('topic') ?? '';
  const fixedTopic = getTopic(topicParam);

  const readingWrongAll = Object.values(readingRecords)
    .filter((record) => !record.correct)
    .map((record) => ({ record, item: READING_ITEMS.find((entry) => entry.id === record.itemId) }))
    .filter((entry): entry is NonNullable<typeof entry> => entry.item !== undefined)
    .sort((a, b) => new Date(b.record.lastAt).getTime() - new Date(a.record.lastAt).getTime())
    .map((entry) => ({ ...entry, topic: getTopic(getReadingTopicId(entry.item.id) ?? '') }));

  const readingWrong = fixedTopic
    ? readingWrongAll.filter(({ item }) => getReadingTopicId(item.id) === fixedTopic.id)
    : readingWrongAll;

  const items = progress.mistakes
    .map((entry) => {
      const question = QUESTIONS.find((item) => item.id === entry.questionId);
      return question ? { entry, question, topic: getTopic(question.topicId) } : null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => b.entry.lastAt - a.entry.lastAt);

  /** 按章节聚合，点一下只看该章错题（地图的「重做错题」就落到这种视图） */
  const topicCounts = [
    ...items.map((item) => ({
      id: item.topic?.id ?? '',
      title: item.topic?.title ?? '',
      order: item.topic?.order ?? 0,
    })),
    ...readingWrongAll.map(({ topic }) => ({
      id: topic?.id ?? '',
      title: topic?.title ?? '',
      order: topic?.order ?? 0,
    })),
  ]
    .filter((entry) => entry.id !== '')
    .reduce<{ id: string; title: string; order: number; count: number }[]>((acc, entry) => {
      const found = acc.find((item) => item.id === entry.id);
      if (found) found.count += 1;
      else acc.push({ ...entry, count: 1 });
      return acc;
    }, [])
    .sort((a, b) => b.count - a.count || a.order - b.order);

  const visibleItems = fixedTopic ? items.filter((item) => item.question.topicId === fixedTopic.id) : items;

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
          {fixedTopic ? (
            <>
              只看「{fixedTopic.title}」这一章，自测 {visibleItems.length} 道、程序阅读 {readingWrong.length} 道。
              全部错题共 {items.length + readingWrongAll.length} 道。
            </>
          ) : (
            <>
              自测和程序阅读答错都会自动收进来；同一题再次答对时自动移出。共 {items.length + readingWrongAll.length} 道
              （自测 {items.length} · 阅读 {readingWrong.length}）。
            </>
          )}
        </p>
      </header>

      {(topicCounts.length > 0 || fixedTopic) && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSearchParams({})}
            className={
              fixedTopic
                ? 'rounded-lg border border-border px-3 py-1.5 text-[12.5px] text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground'
                : 'rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-[12.5px] font-medium text-primary'
            }
          >
            全部错题
            <span className="ml-1.5 tabular-nums opacity-70">{items.length + readingWrongAll.length}</span>
          </button>
          {topicCounts.map((entry) => {
            const active = fixedTopic?.id === entry.id;
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => setSearchParams({ topic: entry.id })}
                className={
                  active
                    ? 'inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-[12.5px] font-medium text-primary'
                    : 'rounded-lg border border-border px-3 py-1.5 text-[12.5px] text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground'
                }
              >
                {entry.title}
                <span className="tabular-nums opacity-70">{entry.count}</span>
                {active && <X className="h-3 w-3" />}
              </button>
            );
          })}
        </div>
      )}

      {topicCounts.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-4">
          <Link
            to={`/practice?from=mistakes${fixedTopic ? `&topic=${fixedTopic.id}` : ''}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-[13.5px] font-medium text-background transition-opacity hover:opacity-85"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            重练这 {fixedTopic ? visibleItems.length : items.length} 道自测错题
          </Link>
          <span className="text-[12.5px] text-muted-foreground">按错次从高到低出题，答对自动移出错题本</span>
        </div>
      )}

      {items.length === 0 && readingWrongAll.length === 0 ? (
        <div className="mt-14 flex flex-col items-center gap-3 text-muted-foreground">
          <CircleCheck className="h-9 w-9 text-primary/70" />
          <p className="text-sm">还没有错题，说明你目前的正确率很稳。</p>
          <Link to="/practice" className="text-[14.5px] text-primary hover:underline">
            去做一组自测
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {fixedTopic && visibleItems.length === 0 && readingWrong.length === 0 && (
            <p className="rounded-xl border border-border bg-card px-4 py-6 text-center text-[13.5px] text-muted-foreground">
              这一章暂时没有错题了。可以
              <Link to={`/practice?topic=${fixedTopic.id}`} className="mx-1 text-primary hover:underline">
                再做一组本章自测
              </Link>
              验证一下。
            </p>
          )}
          {visibleItems.map(({ entry, question, topic }) => (
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
            {readingWrong.map(({ record, item, topic }) => (
              <div key={item.id} className="surface rounded-xl p-4 md:p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Code className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="mono-label normal-case tracking-normal">L{item.level}</span>
                  <span className="text-[13.5px]">{item.title}</span>
                  {topic && (
                    <Link
                      to={`/topics/${topic.id}`}
                      className="mono-label normal-case tracking-normal hover:text-primary"
                    >
                      {String(topic.order).padStart(2, '0')} · {topic.title}
                    </Link>
                  )}
                  <span className="ml-auto text-[12.5px] text-muted-foreground">错 {record.attempts - record.correctCount} 次</span>
                </div>
                <p className="mt-2 text-[13px] text-muted-foreground">考点：{item.point}</p>
                {item.kind === 'blank' ? (
                  <p className="mt-1.5 text-[13.5px]">
                    你填的是 <span className="text-destructive">{record.text ?? '（空）'}</span>，标准答案是
                    <span className="text-primary"> {item.answers?.[0]}</span>
                  </p>
                ) : (
                  <p className="mt-1.5 text-[13.5px]">
                    你选了 <span className="text-destructive">{item.options?.[record.choice]}</span>，正确答案是
                    <span className="text-primary"> {item.options?.[item.answerIndex ?? 0]}</span>
                  </p>
                )}
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
