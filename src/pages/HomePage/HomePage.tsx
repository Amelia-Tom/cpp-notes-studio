import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Code, FileCode2, Network, PenLine } from 'lucide-react';
import useProgress from '@/hooks/useProgress';
import { QUESTIONS, STAGES, TOPICS } from '@/data';
import { READING_ITEMS } from '@/data/reading';
import { SELF_TALK_LEVELS, useSelfTalk } from '@/lib/selfTalk';
import { cn } from '@/lib/utils';
import CodeCard from '@/components/CodeCard';

const HERO_CODE = `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;                    // 读入 n

    long long sum = 0;           // 累加器从 0 开始
    for (int i = 1; i <= n; i++) {
        sum += i;                // 把 1 到 n 逐个加进去
    }

    cout << sum << '\\n';       // 输出总和
    return 0;
}`;

export default function HomePage() {
  const progress = useProgress();
  const done = progress.completed.length;
  const nextTopic = TOPICS.find((topic) => !progress.completed.includes(topic.id)) ?? TOPICS[0];
  const selfTalk = useSelfTalk();
  // 首页优先推「上次自评没过关」的节，没有才按顺序推下一节
  const reviewTopic = TOPICS.map((topic) => ({ topic, record: selfTalk[topic.id] }))
    .filter((item) => item.record && item.record.level !== 'solid')
    .sort((a, b) => {
      const aRank = a.record?.level === 'stuck' ? 0 : 1;
      const bRank = b.record?.level === 'stuck' ? 0 : 1;
      return aRank - bRank || (b.record?.at ?? 0) - (a.record?.at ?? 0);
    })[0];
  const exampleCount = TOPICS.reduce((sum, topic) => sum + topic.examples.length, 0);
  const totalAnswers = progress.records.reduce((sum, record) => sum + record.total, 0);
  const totalCorrect = progress.records.reduce((sum, record) => sum + record.correct, 0);
  const accuracy = totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : null;

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 md:px-10 md:py-14">
      <section className="grid items-center gap-10 md:grid-cols-[1.05fr_1fr]">
        <div>
          <span className="mono-label">cpp notes · for young coders</span>
          <h1 className="heading-tight mt-3 text-4xl font-semibold md:text-[44px]">
            把 C++ 学成
            <br />
            一套自己的笔记
          </h1>
          <p className="mt-5 max-w-md text-[16px] leading-7 text-muted-foreground">
            从变量与循环，一路走到动态规划与图论。每个知识点都配逐行注释的代码模板、经典例题与即时自测，
            学完立刻验证自己到底会不会。
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to={`/topics/${reviewTopic ? reviewTopic.topic.id : nextTopic.id}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-5 py-2.5 text-[14.5px] font-medium text-background transition-opacity hover:opacity-85"
            >
              {reviewTopic ? '先复习卡壳那节' : '继续学习'}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/practice"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-5 py-2.5 text-[14.5px] font-medium transition-colors hover:bg-secondary"
            >
              <PenLine className="h-3.5 w-3.5" />
              做一组自测
            </Link>
            <Link
              to="/reading"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-5 py-2.5 text-[14.5px] font-medium transition-colors hover:bg-secondary"
            >
              <Code className="h-3.5 w-3.5" />
              读程序 · 写结果
            </Link>
            <Link
              to="/map"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-5 py-2.5 text-[14.5px] font-medium transition-colors hover:bg-secondary"
            >
              <Network className="h-3.5 w-3.5" />
              知识地图
            </Link>
          </div>

          <div className="mt-9 flex flex-wrap gap-x-8 gap-y-4 border-t border-border pt-5">
            {[
              { value: TOPICS.length, label: '知识点' },
              { value: exampleCount, label: '经典例题' },
              { value: QUESTIONS.length, label: '自测题' },
              { value: READING_ITEMS.length, label: '阅读题' },
              { value: done, label: '已学' },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-2xl font-semibold tracking-tight tabular-nums">{item.value}</p>
                <p className="mono-label mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <CodeCard code={HERO_CODE} title="sum.cpp" className="w-full" />
      </section>

      <section className="mt-16">
        <div className="flex items-baseline justify-between border-b border-border pb-3">
          <h2 className="text-lg font-semibold tracking-tight">三个阶段</h2>
          <span className="mono-label">basic → csp-j → csp-s</span>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {STAGES.map((stage) => {
            const stageTopics = TOPICS.filter((topic) => topic.stage === stage.id);
            const stageDone = stageTopics.filter((topic) => progress.completed.includes(topic.id)).length;
            const percent = Math.round((stageDone / stageTopics.length) * 100);
            return (
              <Link
                key={stage.id}
                to={`/topics?stage=${stage.id}`}
                className="surface group rounded-xl p-5 transition-colors hover:border-primary/40"
              >
                <div className="flex items-center justify-between">
                  <span className="mono-label">{stage.code}</span>
                  <span className="text-[13.5px] text-muted-foreground">
                    {stageDone}/{stageTopics.length}
                  </span>
                </div>
                <p className="mt-2 text-base font-semibold tracking-tight">{stage.name}</p>
                <p className="mt-2 min-h-16 text-[15px] leading-[1.75] text-muted-foreground">{stage.description}</p>
                <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-[width]"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-12 grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <div className="surface rounded-xl p-6">
          <span className="mono-label">
            {reviewTopic ? `review · ${String(reviewTopic.topic.order).padStart(2, '0')}` : `next up · ${String(nextTopic.order).padStart(2, '0')}`}
          </span>
          {reviewTopic ? (
            <>
              <h3 className="mt-2 flex flex-wrap items-center gap-2 text-xl font-semibold tracking-tight">
                {reviewTopic.topic.title}
                <span
                  className={cn(
                    'rounded-full border px-2 py-0.5 text-[12.5px] font-normal',
                    reviewTopic.record?.level === 'stuck'
                      ? 'border-destructive/30 bg-destructive/10 text-destructive'
                      : 'border-[#B26A00]/30 bg-[#B26A00]/10 text-[#B26A00]',
                  )}
                >
                  {SELF_TALK_LEVELS.find((item) => item.level === reviewTopic.record?.level)?.label}
                </span>
              </h3>
              <p className="mt-2 text-[15px] leading-[1.75] text-muted-foreground">
                上次自讲没过关，说明模板里还有几行讲不出来。开启自测模式，遮住注释再讲一遍。
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-[13.5px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {reviewTopic.topic.minutes} 分钟重看
                </span>
                <span className="inline-flex items-center gap-1">
                  <FileCode2 className="h-3.5 w-3.5" />
                  {reviewTopic.topic.examples.length} 道例题
                </span>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-4 text-[14.5px]">
                <Link
                  to={`/topics/${reviewTopic.topic.id}`}
                  className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
                >
                  回去讲一遍
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link to={`/topics/${nextTopic.id}`} className="text-muted-foreground hover:text-foreground">
                  或先学下一节：{nextTopic.title}
                </Link>
              </div>
            </>
          ) : (
            <>
              <h3 className="mt-2 text-xl font-semibold tracking-tight">{nextTopic.title}</h3>
              <p className="mt-2 text-[15px] leading-[1.75] text-muted-foreground">{nextTopic.summary}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-[13.5px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {nextTopic.minutes} 分钟精读
                </span>
                <span className="inline-flex items-center gap-1">
                  <FileCode2 className="h-3.5 w-3.5" />
                  {nextTopic.examples.length} 道例题
                </span>
              </div>
              <Link
                to={`/topics/${nextTopic.id}`}
                className="mt-5 inline-flex items-center gap-1.5 text-[14.5px] font-medium text-primary hover:underline"
              >
                打开这一节
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </>
          )}
        </div>

        <div className="surface rounded-xl p-6">
          <span className="mono-label">your progress</span>
          <p className="mt-3 text-3xl font-semibold tracking-tight">
            {done}
            <span className="text-base font-normal text-muted-foreground"> / {TOPICS.length}</span>
          </p>
          <p className="mt-1 text-[14.5px] text-muted-foreground">
            {accuracy === null ? '还没有练习记录，先做一组自测看看水平。' : `练习平均正确率 ${accuracy}%。`}
          </p>
          <div className="mt-5 space-y-1.5 text-[14.5px]">
            <div className="flex justify-between">
              <span className="text-muted-foreground">错题本</span>
              <span>{progress.mistakes.length} 题</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">练习次数</span>
              <span>{progress.records.length} 次</span>
            </div>
          </div>
          <div className="mt-5 flex gap-4 text-[14.5px]">
            <Link to="/mistakes" className="text-primary hover:underline">
              看错题
            </Link>
            <Link to="/progress" className="text-primary hover:underline">
              看进度
            </Link>
          </div>
          <p className="mt-6 text-[12.5px] leading-5 text-muted-foreground">
            学习记录只保存在当前浏览器，换设备不会同步。
          </p>
        </div>
      </section>
    </div>
  );
}
