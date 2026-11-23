import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, CircleAlert, CircleX, Clock, Search, SearchX } from 'lucide-react';
import { STAGES, TOPICS, getStage, getTopicGesp, getTopicText, type StageId } from '@/data';
import useProgress from '@/hooks/useProgress';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { SELF_TALK_LEVELS, useSelfTalk } from '@/lib/selfTalk';

type StageFilter = 'all' | StageId;

export default function TopicsPage() {
  const progress = useProgress();
  const [searchParams] = useSearchParams();
  const initialStage = searchParams.get('stage');
  const [stage, setStage] = useState<StageFilter>(
    initialStage === 'basic' || initialStage === 'cert' || initialStage === 'contest' ? initialStage : 'all',
  );
  const [keyword, setKeyword] = useState('');
  const [onlyReview, setOnlyReview] = useState(false);
  const selfTalk = useSelfTalk();

  const list = useMemo(() => {
    const text = keyword.trim().toLowerCase();
    return TOPICS.filter((topic) => (stage === 'all' ? true : topic.stage === stage))
      .filter((topic) =>
        onlyReview
          ? selfTalk[topic.id]?.level === 'stuck' || selfTalk[topic.id]?.level === 'partial'
          : true,
      )
      .filter((topic) => (text ? getTopicText(topic).includes(text) : true));
  }, [stage, keyword, onlyReview, selfTalk]);

  const filters: { id: StageFilter; label: string }[] = [
    { id: 'all', label: '全部' },
    ...STAGES.map((item) => ({ id: item.id as StageFilter, label: item.name })),
  ];

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 md:px-10 md:py-14">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
        <div>
          <span className="mono-label">curriculum</span>
          <h1 className="heading-tight mt-2 text-3xl font-semibold">知识点</h1>
          <p className="mt-2 text-[14.5px] text-muted-foreground">
            共 {TOPICS.length} 节，按顺序学最稳；亦可按阶段筛选。
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索知识点、关键字"
            className="pl-9"
          />
        </div>
      </header>

      <div className="mt-5 flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setStage(item.id)}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-[13.5px] transition-colors',
              stage === item.id
                ? 'border-foreground bg-foreground text-background'
                : 'border-border bg-card text-muted-foreground hover:text-foreground',
            )}
          >
            {item.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setOnlyReview((value) => !value)}
          className={cn(
            'rounded-full border px-3.5 py-1.5 text-[13.5px] transition-colors',
            onlyReview
              ? 'border-[#B26A00]/40 bg-[#B26A00]/10 text-[#B26A00]'
              : 'border-dashed border-border bg-card text-muted-foreground hover:text-foreground',
          )}
          aria-pressed={onlyReview}
        >
          只看待复习
        </button>
      </div>

      <div className="mt-8 divide-y divide-border border-y border-border">
        {list.map((topic) => {
          const done = progress.completed.includes(topic.id);
          const talk = selfTalk[topic.id];
          const talkLabel = talk ? SELF_TALK_LEVELS.find((item) => item.level === talk.level)?.label : '';
          return (
            <Link
              key={topic.id}
              to={`/topics/${topic.id}`}
              className="group flex items-start gap-4 py-4 transition-colors hover:bg-card/70 md:gap-6"
            >
              <span
                className="mt-1 w-7 shrink-0 text-[14.5px] text-muted-foreground/70"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {String(topic.order).padStart(2, '0')}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[16px] font-medium tracking-tight group-hover:text-primary">{topic.title}</p>
                  <span className="mono-label rounded-full border border-border px-2 py-0.5 normal-case tracking-normal">
                    {getStage(topic.stage).code}
                  </span>
                  {getTopicGesp(topic.id).length > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-foreground/[0.06] px-2 py-0.5 text-[11.5px] text-foreground/70">
                      GESP {getTopicGesp(topic.id).map((level) => `L${level}`).join('·')}
                    </span>
                  )}
                  {done && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[12.5px] text-primary">
                      <Check className="h-3 w-3" />
                      已学
                    </span>
                  )}
                  {talk && (
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[12.5px]',
                        talk.level === 'solid' && 'border-primary/30 bg-primary/10 text-primary',
                        talk.level === 'partial' && 'border-[#B26A00]/30 bg-[#B26A00]/10 text-[#B26A00]',
                        talk.level === 'stuck' && 'border-destructive/30 bg-destructive/10 text-destructive',
                      )}
                    >
                      {talk.level === 'solid' && <Check className="h-3 w-3" />}
                      {talk.level === 'partial' && <CircleAlert className="h-3 w-3" />}
                      {talk.level === 'stuck' && <CircleX className="h-3 w-3" />}
                      {talkLabel}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[15px] leading-[1.75] text-muted-foreground">{topic.subtitle}</p>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[12.5px] text-muted-foreground/80">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {topic.minutes} 分钟
                  </span>
                  <span>{topic.examples.length} 道例题</span>
                  <span>{topic.keywords.slice(0, 3).join(' / ')}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {list.length === 0 && (
        <div className="mt-12 flex flex-col items-center gap-3 text-muted-foreground">
          <SearchX className="h-8 w-8" />
          <p className="text-sm">
            {onlyReview ? '还没有需要复习的知识点，说明自评都过关了。' : '没有找到匹配的知识点，换个关键字试试。'}
          </p>
        </div>
      )}
    </div>
  );
}
