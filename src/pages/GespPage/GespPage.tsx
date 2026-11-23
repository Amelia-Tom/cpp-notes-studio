// EXPORTS: 默认导出 GespPage 页面

import { Link } from 'react-router-dom';
import { ArrowRight, Check, GraduationCap, Star } from 'lucide-react';
import { GESP_LEVELS, QUESTIONS, TOPICS } from '@/data';
import useProgress from '@/hooks/useProgress';
import { useExamRecords } from '@/lib/exam';
import { cn } from '@/lib/utils';

export default function GespPage() {
  const progress = useProgress();
  const examRecords = useExamRecords();

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 md:px-10 md:py-14">
      <header className="border-b border-border pb-6">
        <span className="mono-label">gesp · c++ 1–8</span>
        <h1 className="heading-tight mt-2 text-3xl font-semibold">GESP 八级大纲对照</h1>
        <p className="mt-3 max-w-2xl text-[15.5px] leading-[1.8] text-muted-foreground">
          按 CCF 编程能力等级认证 C++ 认证标准整理，每一级列出官方知识内容、知识目标，以及本笔记里对应的章节。
          先把本级章节读完、自测做对，再往下一级走。
        </p>
        <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3 border-t border-border pt-4">
          {[
            { value: '8', label: '认证级别' },
            { value: String(TOPICS.length), label: '对应章节' },
            { value: String(QUESTIONS.length), label: '自测题' },
            { value: `${progress.completed.length}/${TOPICS.length}`, label: '已学章节' },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-2xl font-semibold tabular-nums tracking-tight">{item.value}</p>
              <p className="mono-label mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      </header>

      <div className="mt-8 space-y-4">
        {GESP_LEVELS.map((level) => {
          const topics = level.topicIds
            .map((id) => TOPICS.find((topic) => topic.id === id))
            .filter((topic): topic is NonNullable<typeof topic> => topic !== undefined);
          const done = topics.filter((topic) => progress.completed.includes(topic.id)).length;
          const questionCount = QUESTIONS.filter((question) => level.topicIds.includes(question.topicId)).length;
          const exam = examRecords[String(level.level)];
          const percent = topics.length > 0 ? Math.round((done / topics.length) * 100) : 0;

          return (
            <section key={level.level} className="surface rounded-xl p-5 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-foreground text-[13.5px] font-semibold text-background"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    L{level.level}
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight">{level.name}</h2>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[12.5px] text-muted-foreground">
                      <span className="inline-flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            className={cn('h-3 w-3', index < level.stars ? 'fill-primary text-primary' : 'text-border')}
                          />
                        ))}
                      </span>
                      <span>·</span>
                      <span>建议 {level.duration}</span>
                      <span>·</span>
                      <span>
                        {topics.length} 章 · 已学 {done}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex w-32 items-center gap-2">
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${percent}%` }} />
                  </div>
                  <span className="w-9 text-right text-[12.5px] tabular-nums text-muted-foreground">{percent}%</span>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-[1.15fr_1fr]">
                <div>
                  <span className="mono-label">官方知识内容</span>
                  <ul className="mt-2 space-y-1.5">
                    {level.contents.map((item) => (
                      <li key={item} className="flex gap-2 text-[14px] leading-[1.75] text-foreground/85">
                        <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-primary/70" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-3">
                  <div className="rounded-lg bg-secondary/70 p-3">
                    <span className="mono-label">知识目标</span>
                    <p className="mt-1.5 text-[13.5px] leading-[1.75] text-foreground/80">{level.goal}</p>
                  </div>
                  <div className="rounded-lg border border-[#B26A00]/20 bg-[#B26A00]/[0.06] p-3">
                    <span className="mono-label text-[#B26A00]">易错提醒</span>
                    <p className="mt-1.5 text-[13.5px] leading-[1.75] text-foreground/80">{level.warning}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
                <span className="mono-label">本笔记对应章节</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {exam && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11.5px] text-primary">
                      模拟卷最好 {exam.best} 分 · 已测 {exam.tries} 次
                    </span>
                  )}
                  <Link
                    to={`/practice?level=${level.level}&mode=exam`}
                    className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-[12.5px] font-medium transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    开模拟卷
                  </Link>
                  <Link
                    to={`/practice?level=${level.level}`}
                    className="inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-1.5 text-[12.5px] font-medium text-background transition-opacity hover:opacity-85"
                  >
                    本级专项
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {topics.map((topic) => {
                  const learned = progress.completed.includes(topic.id);
                  return (
                    <Link
                      key={topic.id}
                      to={`/topics/${topic.id}`}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[13px] transition-colors',
                        learned
                          ? 'border-primary/30 bg-primary/10 text-primary'
                          : 'border-border text-foreground/80 hover:bg-secondary',
                      )}
                    >
                      {learned && <Check className="h-3 w-3" />}
                      {topic.title}
                      <span className="text-[11.5px] text-muted-foreground">
                        {String(topic.order).padStart(2, '0')}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <footer className="mt-10 rounded-xl border border-border p-5">
        <div className="flex items-start gap-3">
          <GraduationCap className="mt-0.5 h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-[14.5px] font-medium">怎么用这张表</p>
            <p className="mt-1.5 text-[13.5px] leading-[1.75] text-muted-foreground">
              先把某一级的官方知识内容逐条对照，能在本笔记里找到对应章节就点进去读；找不到就先补那一章。
              每章读完做「自讲自评」，再做本节自测，两项都过关再进下一级。
            </p>
            <Link
              to="/topics"
              className="mt-3 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-primary hover:underline"
            >
              按顺序看全部章节
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
