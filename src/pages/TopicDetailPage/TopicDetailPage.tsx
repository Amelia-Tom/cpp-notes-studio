import { Link, useParams } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useSyncExternalStore } from 'react';
import { ArrowLeft, ArrowRight, Check, EyeOff, PenLine, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { GESP_LEVELS, getStage, getTopic, getTopicGesp, TOPICS } from '@/data';
import useProgress from '@/hooks/useProgress';
import { toggleCompleted } from '@/lib/store';
import CodeCard from '@/components/CodeCard';
import SelfTalkCard from '@/components/SelfTalkCard';
import { setShowComments, showComments, subscribePrefs } from '@/lib/prefs';
import TopicExampleCard from '@/components/TopicExampleCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const SECTION_NAV = [
  { id: 'concept', label: '概念讲解', num: '01' },
  { id: 'syntax', label: '语法要点', num: '02' },
  { id: 'template', label: '代码模板', num: '03' },
  { id: 'pitfalls', label: '易错点', num: '04' },
  { id: 'examples', label: '经典例题', num: '05' },
  { id: 'homework', label: '课后任务', num: '06' },
  { id: 'selftalk', label: '自讲自评', num: '07' },
];

interface SectionProps {
  id: string;
  num: string;
  title: string;
  desc?: string;
  children: ReactNode;
}

function Section({ id, num, title, desc, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-6">
      <div className="flex items-baseline gap-3 border-b border-border pb-2">
        <span className="mono-label">{num}</span>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {desc && <span className="ml-auto hidden text-[12.5px] text-muted-foreground md:block">{desc}</span>}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function TopicDetailPage() {
  const { topicId = '' } = useParams();
  const topic = getTopic(topicId);
  const progress = useProgress();
  const commentsVisible = useSyncExternalStore(subscribePrefs, showComments, showComments);

  if (!topic) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <p className="text-sm text-muted-foreground">这一节不存在，可能链接已经更新。</p>
        <Link to="/topics" className="mt-4 inline-block text-[14.5px] text-primary hover:underline">
          回到知识点列表
        </Link>
      </div>
    );
  }

  const done = progress.completed.includes(topic.id);
  const stage = getStage(topic.stage);
  const prev = TOPICS.find((item) => item.order === topic.order - 1);
  const next = TOPICS.find((item) => item.order === topic.order + 1);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleToggle = () => {
    toggleCompleted(topic.id);
    toast.success(done ? '已取消「已学」标记' : '已标记为学完，进度已更新');
  };

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 md:px-10 md:py-12">
      <Link to="/topics" className="inline-flex items-center gap-1.5 text-[13.5px] text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" />
        知识点
      </Link>

      <header className="mt-4 border-b border-border pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mono-label">
            {stage.code} · section {String(topic.order).padStart(2, '0')}
          </span>
          {getTopicGesp(topic.id).map((level) => (
            <Link
              key={level}
              to="/gesp"
              className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[12.5px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              对应 GESP L{level}
            </Link>
          ))}
          {done && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[12.5px] text-primary">
              <Check className="h-3 w-3" />
              已学
            </span>
          )}
        </div>
        <h1 className="heading-tight mt-2 text-3xl font-semibold md:text-4xl">{topic.title}</h1>
        <p className="mt-2 text-[15.5px] text-muted-foreground">
          {topic.subtitle} · 约 {topic.minutes} 分钟
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {topic.keywords.map((keyword) => (
            <span key={keyword} className="rounded-full border border-border px-2 py-0.5 text-[12.5px] text-muted-foreground">
              {keyword}
            </span>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowComments(!commentsVisible)}
            aria-pressed={!commentsVisible}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13.5px] transition-colors',
              commentsVisible
                ? 'border-border text-muted-foreground hover:bg-secondary hover:text-foreground'
                : 'border-primary/30 bg-primary/10 text-primary',
            )}
          >
            {commentsVisible ? <Sparkles className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            {commentsVisible ? '开启自测模式' : '自测模式已开启'}
          </button>
          <span className="text-[12.5px] text-muted-foreground">
            自测模式会隐藏全部代码注释，用来检验自己能否讲出每一行在做什么。
          </span>
        </div>
      </header>

      {!commentsVisible && (
        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-primary/25 bg-primary/[0.06] px-4 py-3">
          <EyeOff className="h-4 w-4 text-primary" />
          <p className="text-[13.5px] leading-6 text-foreground/80">
            自测模式：代码注释已全部隐藏。先自己讲一遍模板，讲不通的地方再退出模式对照注释。
          </p>
          <button
            type="button"
            onClick={() => setShowComments(true)}
            className="ml-auto rounded-full border border-primary/30 bg-card px-3 py-1 text-[12.5px] text-primary transition-colors hover:bg-primary/10"
          >
            退出自测模式
          </button>
        </div>
      )}

      <div className="mt-8 grid gap-12 lg:grid-cols-[150px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-6 space-y-1">
            {SECTION_NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollTo(item.id)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13.5px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <span style={{ fontFamily: 'var(--font-mono)' }}>{item.num}</span>
                {item.label}
              </button>
            ))}
            <Link
              to={`/practice?topic=${topic.id}`}
              className="mt-3 flex items-center gap-2 rounded-md px-2 py-1.5 text-[13.5px] text-primary hover:bg-primary/5"
            >
              <PenLine className="h-3.5 w-3.5" />
              本节自测
            </Link>
          </div>
        </aside>

        <div className="min-w-0 space-y-10">
          {getTopicGesp(topic.id).length > 0 && (
            <div className="mb-10">
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-2">
                <span className="mono-label">本节的 gesp 考点</span>
                <Link to="/gesp" className="text-[12.5px] text-primary hover:underline">
                  查看八级大纲 →
                </Link>
              </div>
              <div className="mt-4 space-y-3">
                {getTopicGesp(topic.id).map((levelNo) => {
                  const level = GESP_LEVELS.find((item) => item.level === levelNo);
                  if (!level) return null;
                  return (
                    <div key={levelNo} className="rounded-xl border border-border bg-card p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="flex h-6 items-center rounded-md bg-foreground px-1.5 text-[11.5px] font-semibold text-background"
                          style={{ fontFamily: 'var(--font-mono)' }}
                        >
                          L{level.level}
                        </span>
                        <p className="text-[14px] font-medium">{level.name}</p>
                        <span className="text-[12px] text-muted-foreground">建议 {level.duration}</span>
                      </div>
                      <ul className="mt-2.5 grid gap-x-6 gap-y-1 sm:grid-cols-2">
                        {level.contents.map((item) => (
                          <li key={item} className="flex gap-2 text-[13px] leading-[1.7] text-foreground/75">
                            <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-primary/70" />
                            {item}
                          </li>
                        ))}
                      </ul>
                      <p className="mt-2.5 text-[12.5px] leading-[1.7] text-muted-foreground">
                        知识目标：{level.goal}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <Section id="concept" num="01" title="概念讲解">
            <div className="gutter space-y-3 pl-4">
              {topic.sections.concept.map((paragraph, index) => (
                <p key={index} className="text-[16px] leading-[1.9] text-foreground/85">
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="mt-5 rounded-xl bg-secondary/70 p-4">
              <span className="mono-label">生活类比</span>
              <p className="mt-2 text-[15.5px] leading-[1.8] text-foreground/80">{topic.sections.analogy}</p>
            </div>
            <div className="mt-4">
              <span className="mono-label">重难点</span>
              <ul className="mt-2 space-y-1.5">
                {topic.sections.keyPoints.map((point) => (
                  <li key={point} className="flex gap-2 text-[15px] leading-[1.75]">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </Section>

          <Section id="syntax" num="02" title="语法要点">
            <ul className="divide-y divide-border rounded-xl border border-border">
              {topic.sections.syntax.map((item, index) => (
                <li key={index} className="flex gap-3 px-4 py-2.5">
                  <span className="mt-0.5 text-[12.5px] text-muted-foreground/70" style={{ fontFamily: 'var(--font-mono)' }}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span
                    className="text-[13.5px] leading-7 text-foreground/85"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </Section>

          <Section id="template" num="03" title={topic.template.title} desc="逐行注释，可直接运行">
            <p className="mb-3 text-[15px] leading-[1.75] text-muted-foreground">{topic.template.explain}</p>
            <CodeCard code={topic.template.code} title="template.cpp" />
          </Section>

          <Section id="pitfalls" num="04" title="易错点">
            <div className="space-y-3">
              {topic.sections.pitfalls.map((pitfall) => (
                <div key={pitfall.wrong} className="surface rounded-xl p-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <span className="mono-label text-destructive">错误写法</span>
                      <p
                        className="mt-1 rounded-md bg-destructive/10 px-2.5 py-1.5 text-[13.5px] text-foreground/85"
                        style={{ fontFamily: 'var(--font-mono)' }}
                      >
                        {pitfall.wrong}
                      </p>
                    </div>
                    <div>
                      <span className="mono-label text-primary">正确写法</span>
                      <p
                        className="mt-1 rounded-md bg-primary/10 px-2.5 py-1.5 text-[13.5px] text-foreground/85"
                        style={{ fontFamily: 'var(--font-mono)' }}
                      >
                        {pitfall.right}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2.5 text-[13.5px] leading-5 text-muted-foreground">{pitfall.reason}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section id="examples" num="05" title="经典例题" desc={`${topic.examples.length} 道，建议先自己想再看代码`}>
            <div className="space-y-4">
              {topic.examples.map((example, index) => (
                <TopicExampleCard key={example.id} example={example} index={index} />
              ))}
            </div>
          </Section>

          <Section id="homework" num="06" title="课后任务">
            <ul className="space-y-2">
              {topic.homework.map((item, index) => (
                <li key={item} className="flex gap-2 text-[14.5px] leading-6">
                  <span className="text-muted-foreground/70" style={{ fontFamily: 'var(--font-mono)' }}>
                    {index + 1}.
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="surface mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl p-4">
              <div>
                <p className="text-[14.5px] font-medium">{done ? '这一节已标记为学完' : '读完这一节了吗？'}</p>
                <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                  {done ? '可以取消标记，或直接做一组自测巩固。' : '标记后会同步到首页与进度页。'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={done ? 'outline' : 'default'}
                  size="sm"
                  onClick={handleToggle}
                  className={cn('rounded-full', done && 'text-muted-foreground')}
                >
                  <Check className="mr-1 h-3.5 w-3.5" />
                  {done ? '取消已学' : '标记已学'}
                </Button>
                <Link
                  to={`/practice?topic=${topic.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-[13.5px] transition-colors hover:bg-secondary"
                >
                  <PenLine className="h-3.5 w-3.5" />
                  做本节自测
                </Link>
              </div>
            </div>
          </Section>

          <Section id="selftalk" num="07" title="自讲自评" desc="讲得出来，才算真的学会">
            <SelfTalkCard topicId={topic.id} />
          </Section>
        </div>
      </div>

      <nav className="mt-14 grid gap-3 border-t border-border pt-6 md:grid-cols-2">
        {prev ? (
          <Link
            to={`/topics/${prev.id}`}
            className="group rounded-xl border border-border p-4 transition-colors hover:bg-card"
          >
            <span className="mono-label inline-flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" /> 上一节
            </span>
            <p className="mt-1 text-[14.5px] font-medium group-hover:text-primary">{prev.title}</p>
          </Link>
        ) : (
          <div />
        )}
        {next ? (
          <Link
            to={`/topics/${next.id}`}
            className="group rounded-xl border border-border p-4 text-right transition-colors hover:bg-card"
          >
            <span className="mono-label inline-flex items-center gap-1">
              下一节 <ArrowRight className="h-3 w-3" />
            </span>
            <p className="mt-1 text-[14.5px] font-medium group-hover:text-primary">{next.title}</p>
          </Link>
        ) : (
          <div />
        )}
      </nav>
    </div>
  );
}
