import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { GESP_LEVELS, QUESTIONS, STAGES, TOPICS } from '@/data';
import useProgress from '@/hooks/useProgress';
import { resetProgress } from '@/lib/store';
import { resetSelfTalk, selfTalkWeight, SELF_TALK_LEVELS, useSelfTalk } from '@/lib/selfTalk';
import { resetExamRecords, useExamRecords } from '@/lib/exam';
import { getReadingTopicId, READING_ITEMS, READING_LEVELS } from '@/data/reading';
import { resetReadingRecords, useReadingRecords } from '@/lib/reading';
import { resetReviewRounds, useReviewRounds } from '@/lib/review';
import { computeActivity, dayKeyOf } from '@/lib/activity';
import { cn } from '@/lib/utils';
import { downloadMarkdown } from '@/lib/markdown';
import { buildWeeklyReportMarkdown } from '@/lib/weekly-report';

interface Dimension {
  key: string;
  label: string;
  topics: string[];
}

const DIMENSIONS: Dimension[] = [
  { key: 'grammar', label: '语法与类型', topics: ['var', 'io', 'expr'] },
  { key: 'flow', label: '流程控制', topics: ['branch', 'loop', 'function'] },
  { key: 'data', label: '数据组织', topics: ['array', 'string', 'struct'] },
  { key: 'algo', label: '算法思维', topics: ['sort-search', 'prefix', 'binary-answer', 'greedy'] },
  { key: 'contest', label: '竞赛能力', topics: ['dp', 'dfs-bfs', 'graph', 'tree', 'number-theory'] },
];

export default function ProgressPage() {
  const progress = useProgress();
  const examRecords = useExamRecords();
  const selfTalk = useSelfTalk();
  const readingRecords = useReadingRecords();
  const reviewRounds = useReviewRounds();
  const recentReview = reviewRounds.slice(0, 5);
  const recentReviewTotal = recentReview.reduce((sum, round) => sum + round.total, 0);
  const recentReviewRate =
    recentReviewTotal > 0
      ? Math.round((recentReview.reduce((sum, round) => sum + round.correct, 0) / recentReviewTotal) * 100)
      : null;
  // 走势条：取最近 10 轮，按时间正序排列（最右是最近一轮）
  const reviewTrend = reviewRounds
    .slice(0, 10)
    .map((round) => ({
      id: round.id,
      rate: round.total > 0 ? Math.round((round.correct / round.total) * 100) : 0,
      title: `${round.label} · ${round.correct}/${round.total}`,
    }))
    .reverse();

  const readingList = Object.values(readingRecords);
  const readingAttempts = readingList.reduce((sum, record) => sum + record.attempts, 0);
  const readingCorrect = readingList.reduce((sum, record) => sum + record.correctCount, 0);
  const readingRate = readingAttempts > 0 ? Math.round((readingCorrect / readingAttempts) * 100) : null;
  const readingTouched = readingList.length;
  const readingWrong = readingList.filter((record) => !record.correct).length;

  const talkList = Object.values(selfTalk)
    .sort((a, b) => b.at - a.at)
    .slice(0, 5)
    .map((record) => ({
      record,
      topic: TOPICS.find((item) => item.id === record.topicId),
      level: SELF_TALK_LEVELS.find((item) => item.level === record.level),
    }))
    .filter((item) => item.topic && item.level);

  const answeredByTopic: Record<string, { total: number; correct: number }> = {};
  progress.records.forEach((record) => {
    Object.entries(record.byTopic ?? {}).forEach(([topicId, stat]) => {
      const current = answeredByTopic[topicId] ?? { total: 0, correct: 0 };
      answeredByTopic[topicId] = {
        total: current.total + stat.total,
        correct: current.correct + stat.correct,
      };
    });
  });

  const radarData = DIMENSIONS.map((dimension) => {
    const topics = dimension.topics.filter((id) => TOPICS.some((topic) => topic.id === id));
    const doneCount = topics.filter((id) => progress.completed.includes(id)).length;
    const completion = topics.length > 0 ? doneCount / topics.length : 0;

    let total = 0;
    let correct = 0;
    topics.forEach((id) => {
      const stat = answeredByTopic[id];
      if (stat) {
        total += stat.total;
        correct += stat.correct;
      }
    });
    const accuracy = total > 0 ? correct / total : 0;

    // 自评维度：讲过「能讲清」得 1 分，卡壳 0.55，只能看懂一半 0.2；一次都没自评按中性 0.5
    const talks = topics.map((id) => selfTalk[id]).filter((item) => item !== undefined);
    const talkFactor = talks.length > 0 ? talks.reduce((sum, item) => sum + selfTalkWeight(item.level), 0) / talks.length : 0.5;
    const score = Math.round(completion * 50 + accuracy * 30 + talkFactor * 20);

    return { dimension: dimension.label, score, fullMark: 100 };
  });

  const totalAnswers = progress.records.reduce((sum, record) => sum + record.total, 0);
  const totalCorrect = progress.records.reduce((sum, record) => sum + record.correct, 0);
  const accuracy = totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : null;

  const stageStats = STAGES.map((stage) => {
    const stageTopics = TOPICS.filter((topic) => topic.stage === stage.id);
    const done = stageTopics.filter((topic) => progress.completed.includes(topic.id)).length;
    return { stage, done, total: stageTopics.length, percent: Math.round((done / stageTopics.length) * 100) };
  });

  const gespStats = GESP_LEVELS.map((level) => {
    const levelTopics = level.topicIds
      .map((id) => TOPICS.find((topic) => topic.id === id))
      .filter((topic): topic is NonNullable<typeof topic> => topic !== undefined);
    const done = levelTopics.filter((topic) => progress.completed.includes(topic.id)).length;
    const percent = levelTopics.length > 0 ? Math.round((done / levelTopics.length) * 100) : 0;
    return { level, done, total: levelTopics.length, percent };
  });

  const weakTopics = TOPICS.map((topic) => {
    const stat = answeredByTopic[topic.id];
    const talk = selfTalk[topic.id];
    const rate = stat && stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : null;
    if (rate === null && !talk) return null;
    if (rate !== null && rate >= 80 && talk?.level === 'solid') return null;
    const talkLabel = talk ? SELF_TALK_LEVELS.find((item) => item.level === talk.level)?.label ?? '' : '';
    const order = talk?.level === 'stuck' ? 0 : talk?.level === 'partial' ? 1 : rate ?? 2;
    return { topic, rate, total: stat?.total ?? 0, talkLabel, order };
  })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => a.order - b.order)
    .slice(0, 3);

  // 学习节奏：把四份记录按自然日归并，算连续天数与最近 14 天练习量
  const activity = computeActivity({
    records: progress.records,
    rounds: reviewRounds,
    reading: readingRecords,
    exams: Object.values(examRecords),
  });
  const activityMax = Math.max(1, ...activity.days.map((day) => day.total + day.reading + day.exams));
  const weekRate = activity.week.total > 0 ? Math.round((activity.week.correct / activity.week.total) * 100) : null;

  // 错题按章节归集：自测从 question.topicId 反查，阅读用 READING_TOPIC 映射
  const mistakeChapterMap: Record<string, { title: string; order: number; self: number; reading: number }> = {};
  progress.mistakes.forEach((entry) => {
    const question = QUESTIONS.find((item) => item.id === entry.questionId);
    const topic = question ? TOPICS.find((item) => item.id === question.topicId) : undefined;
    if (!topic) return;
    const bucket = mistakeChapterMap[topic.id] ?? { title: topic.title, order: topic.order, self: 0, reading: 0 };
    bucket.self += 1;
    mistakeChapterMap[topic.id] = bucket;
  });
  readingList
    .filter((record) => !record.correct)
    .forEach((record) => {
      const topicId = getReadingTopicId(record.itemId);
      const topic = topicId ? TOPICS.find((item) => item.id === topicId) : undefined;
      if (!topic) return;
      const bucket = mistakeChapterMap[topic.id] ?? { title: topic.title, order: topic.order, self: 0, reading: 0 };
      bucket.reading += 1;
      mistakeChapterMap[topic.id] = bucket;
    });
  const mistakeChapters = Object.values(mistakeChapterMap).sort(
    (a, b) => b.self + b.reading - (a.self + a.reading) || a.order - b.order,
  );

  // 本周薄弱点：只看最近 7 天确有作答、且正确率低于 80% 的章节
  const weekTopicStats: Record<string, { total: number; correct: number }> = {};
  const weekKeys = new Set(activity.days.slice(-7).map((day) => day.key));
  progress.records
    .filter((record) => weekKeys.has(dayKeyOf(record.at)))
    .forEach((record) => {
      Object.entries(record.byTopic ?? {}).forEach(([topicId, stat]) => {
        const current = weekTopicStats[topicId] ?? { total: 0, correct: 0 };
        weekTopicStats[topicId] = { total: current.total + stat.total, correct: current.correct + stat.correct };
      });
    });
  const weekWeakChapters = TOPICS.map((topic) => {
    const stat = weekTopicStats[topic.id];
    if (!stat || stat.total === 0) return null;
    const rate = Math.round((stat.correct / stat.total) * 100);
    if (rate >= 80) return null;
    return { title: topic.title, order: topic.order, total: stat.total, correct: stat.correct, rate };
  })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => a.rate - b.rate)
    .slice(0, 3);

  const nextChapter = TOPICS.slice()
    .sort((a, b) => a.order - b.order)
    .find((topic) => !progress.completed.includes(topic.id));

  const handleExportReport = () => {
    const content = buildWeeklyReportMarkdown({
      days: activity.days,
      week: activity.week,
      streak: activity.streak,
      todayActive: activity.todayActive,
      completed: progress.completed.length,
      totalTopics: TOPICS.length,
      mistakes: mistakeChapters,
      weak: weekWeakChapters,
      nextChapter: nextChapter ? { title: nextChapter.title, order: nextChapter.order, minutes: nextChapter.minutes } : undefined,
    });
    const day = new Date().toISOString().slice(0, 10);
    downloadMarkdown(content, `周报-${day}.md`);
    toast.success('已导出本周学习报告');
  };

  const handleReset = () => {
    if (!window.confirm('清空本机的学习进度、练习记录、错题本、重练记录与自讲自评？此操作不可恢复。')) return;
    resetProgress();
    resetSelfTalk();
    resetExamRecords();
    resetReadingRecords();
    resetReviewRounds();
    toast.success('学习记录已清空');
  };

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 md:px-10 md:py-14">
      <header className="border-b border-border pb-5">
        <span className="mono-label">progress</span>
        <h1 className="heading-tight mt-2 text-3xl font-semibold">学习进度</h1>
        <p className="mt-2 text-[15.5px] leading-[1.8] text-muted-foreground">
          数据来自你在本机的学习标记与练习记录。完成度影响能力雷达，练习正确率会一起计入。
        </p>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: '已学知识点', value: `${progress.completed.length}/${TOPICS.length}` },
          { label: '练习次数', value: String(progress.records.length) },
          { label: '平均正确率', value: accuracy === null ? '—' : `${accuracy}%` },
          { label: '待复习错题', value: String(progress.mistakes.length + readingWrong) },
        ].map((item) => (
          <div key={item.label} className="surface rounded-xl p-4">
            <span className="mono-label">{item.label}</span>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 surface rounded-xl p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-3">
            <h2 className="text-base font-semibold tracking-tight">学习节奏</h2>
            <span className="mono-label">last 14 days</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[13px] text-muted-foreground">
            <span>
              最近 7 天：做题 {activity.week.total} 题
              {weekRate !== null && <span className="ml-1.5 text-foreground tabular-nums">{weekRate}%</span>}
              <span className="mx-1.5">·</span>重练 {activity.week.reviewRounds} 组
              <span className="mx-1.5">·</span>阅读 {activity.week.reading} 道
            </span>
            <button
              type="button"
              onClick={handleExportReport}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-[12.5px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Download className="h-3.5 w-3.5" />
              导出本周报告
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-end gap-6">
          <div>
            <p className="text-3xl font-semibold tracking-tight tabular-nums">
              {activity.streak}
              <span className="ml-1 text-[13px] font-normal text-muted-foreground">天</span>
            </p>
            <p className="mt-1 text-[12.5px] text-muted-foreground">
              连续学习
              {!activity.todayActive && activity.streak > 0 && '（今天还没练，做一组就续上）'}
              {!activity.todayActive && activity.streak === 0 && '（今天还没开始）'}
            </p>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex h-16 items-end gap-1.5">
              {activity.days.map((day) => {
                const count = day.total + day.reading + day.exams;
                const today = day.key === activity.today.key;
                return (
                  <div key={day.key} className="group flex h-full flex-1 flex-col items-center justify-end gap-1">
                    <div
                      title={`${day.key}：自测/重练 ${day.total} 题 · 阅读 ${day.reading} 道 · 模拟卷 ${day.exams} 次`}
                      className={cn(
                        'w-full rounded-sm transition-colors',
                        day.empty ? 'bg-border/60' : today ? 'bg-primary' : 'bg-primary/45',
                        day.empty && 'h-[3px]',
                      )}
                      style={day.empty ? undefined : { height: `${Math.max(6, Math.round((count / activityMax) * 56))}px` }}
                    />
                    <span
                      className={cn(
                        'text-[10.5px] tabular-nums',
                        today ? 'text-primary' : 'text-muted-foreground',
                      )}
                    >
                      {day.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <p className="mt-3 text-[12px] leading-5 text-muted-foreground">
          按自然日归并：自测与重练按题目数、阅读按最后一次作答日、模拟卷按最近一次成绩日计入；今天这列会高亮。
        </p>
      </section>

      <section className="mt-10">
        <div className="flex items-baseline justify-between border-b border-border pb-2">
          <h2 className="text-lg font-semibold tracking-tight">阶段推进</h2>
          <span className="mono-label">completion</span>
        </div>
        <div className="mt-5 space-y-4">
          {stageStats.map(({ stage, done, total, percent }) => (
            <div key={stage.id}>
              <div className="flex items-baseline justify-between text-[14.5px]">
                <span className="font-medium">
                  {stage.name}
                  <span className="ml-2 text-[12.5px] text-muted-foreground">{stage.code}</span>
                </span>
                <span className="text-muted-foreground">
                  {done}/{total}
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${percent}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-baseline justify-between border-b border-border pb-2">
          <h2 className="text-lg font-semibold tracking-tight">GESP 级别覆盖</h2>
          <Link to="/gesp" className="text-[13.5px] text-primary hover:underline">
            查看大纲详情 →
          </Link>
        </div>
        <div className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {gespStats.map(({ level, done, total, percent }) => (
            <div key={level.level}>
              <div className="flex items-baseline justify-between text-[14.5px]">
                <span className="font-medium">
                  <span className="mono-label mr-2 normal-case tracking-normal">L{level.level}</span>
                  {level.name}
                </span>
                <span className="text-muted-foreground">
                  {done}/{total}
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${percent}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-baseline justify-between border-b border-border pb-2">
          <h2 className="text-lg font-semibold tracking-tight">GESP 模拟卷成绩</h2>
          <span className="mono-label">best · last</span>
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border border-border">
          <table className="w-full text-[13.5px]">
            <thead className="bg-secondary/60 text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">级别</th>
                <th className="px-3 py-2 text-right font-medium">最好</th>
                <th className="px-3 py-2 text-right font-medium">最近</th>
                <th className="px-3 py-2 text-right font-medium">次数</th>
                <th className="px-3 py-2 text-right font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {GESP_LEVELS.map((level) => {
                const record = examRecords[String(level.level)];
                return (
                  <tr key={level.level} className="border-t border-border">
                    <td className="px-3 py-2">
                      <span className="mono-label mr-2 normal-case tracking-normal">L{level.level}</span>
                      {level.name}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">{record ? `${record.best} 分` : '—'}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{record ? `${record.last} 分` : '—'}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{record ? record.tries : 0}</td>
                    <td className="px-3 py-2 text-right">
                      <Link to={`/practice?level=${level.level}&mode=exam`} className="text-primary hover:underline">
                        {record ? '再测一次' : '去测'}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="surface rounded-xl p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-semibold tracking-tight">能力雷达</h2>
            <span className="mono-label">0—100</span>
          </div>
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="72%">
                <PolarGrid stroke="#D2D2D7" />
                <PolarAngleAxis dataKey="dimension" tick={{ fill: '#6E6E73', fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#86868B', fontSize: 9 }} tickCount={5} axisLine={false} />
                <Radar dataKey="score" stroke="#0071E3" fill="#0071E3" fillOpacity={0.18} strokeWidth={1.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-[12.5px] leading-5 text-muted-foreground">
            完成度占 50 分、正确率占 30 分、自讲自评占 20 分。没自评过的维度按中性 50% 计。
          </p>
        </div>

        <div className="space-y-4">
          <div className="surface rounded-xl p-5">
            <h2 className="text-base font-semibold tracking-tight">优先补的三块</h2>
            {weakTopics.length === 0 ? (
              <p className="mt-2 text-[13.5px] leading-6 text-muted-foreground">
                还没有练习数据。做一组自测后，这里会按正确率列出最需要回看的知识点。
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {weakTopics.map(({ topic, rate, total, talkLabel }) => (
                  <li key={topic.id} className="flex items-center justify-between gap-3 text-[14.5px]">
                    <Link to={`/topics/${topic.id}`} className="min-w-0 truncate hover:text-primary">
                      {topic.title}
                    </Link>
                    <span className="shrink-0 text-[12.5px] text-muted-foreground">
                      {rate === null ? talkLabel : `${rate}% · ${total} 题`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="surface rounded-xl p-5">
            <div className="flex items-baseline justify-between">
              <h2 className="text-base font-semibold tracking-tight">程序阅读</h2>
              <Link to="/reading" className="text-[12.5px] text-primary hover:underline">
                去练 →
              </Link>
            </div>
            {readingAttempts === 0 ? (
              <p className="mt-2 text-[13.5px] leading-6 text-muted-foreground">
                还没做过阅读题。<Link to="/reading" className="text-primary hover:underline">读一段程序猜输出</Link>，答完会自动记进这里和错题本。
              </p>
            ) : (
              <>
                <ul className="mt-3 space-y-2 text-[13.5px]">
                  <li className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">做过的题目</span>
                    <span className="tabular-nums">
                      {readingTouched}/{READING_ITEMS.length}
                    </span>
                  </li>
                  <li className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">累计正确率</span>
                    <span className="tabular-nums">
                      {readingRate}%<span className="ml-2 text-muted-foreground">({readingCorrect}/{readingAttempts})</span>
                    </span>
                  </li>
                  <li className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">待重做错题</span>
                    <span className="tabular-nums">{readingWrong}</span>
                  </li>
                </ul>
                <div className="mt-3 space-y-2 border-t border-border pt-3">
                  {READING_LEVELS.map((level) => {
                    const levelItems = READING_ITEMS.filter((item) => item.level === level);
                    const done = levelItems.filter((item) => readingRecords[item.id] !== undefined).length;
                    const percent = levelItems.length > 0 ? Math.round((done / levelItems.length) * 100) : 0;
                    return (
                      <div key={level} className="flex items-center gap-3">
                        <span className="mono-label w-6 shrink-0 normal-case tracking-normal">L{level}</span>
                        <div className="h-1 flex-1 overflow-hidden rounded-full bg-secondary">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
                        </div>
                        <span className="shrink-0 text-[11.5px] tabular-nums text-muted-foreground">
                          {done}/{levelItems.length}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <div className="surface rounded-xl p-5">
            <h2 className="text-base font-semibold tracking-tight">最近练习</h2>
            {progress.records.length === 0 ? (
              <p className="mt-2 text-[13.5px] text-muted-foreground">
                暂无记录，<Link to="/practice" className="text-primary hover:underline">做一组自测</Link>。
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {progress.records.slice(0, 5).map((record) => (
                  <li key={record.id} className="flex items-center justify-between gap-3 text-[13.5px]">
                    <span className="min-w-0 truncate text-muted-foreground">{record.scopeLabel}</span>
                    <span className="shrink-0 text-foreground">
                      {record.correct}/{record.total}
                      <span className="ml-2 text-muted-foreground">{format(new Date(record.at), 'MM-dd HH:mm')}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="surface rounded-xl p-5">
            <div className="flex items-baseline justify-between">
              <h2 className="text-base font-semibold tracking-tight">错题重练</h2>
              <Link to="/mistakes" className="text-[12.5px] text-primary hover:underline">
                去错题本 →
              </Link>
            </div>
            {reviewRounds.length === 0 ? (
              <p className="mt-2 text-[13.5px] leading-6 text-muted-foreground">
                还没有重练记录。错题本里点「重练这 N 道错题」，每答完一组就会记一条。
              </p>
            ) : (
              <>
                <p className="mt-2 text-[12.5px] text-muted-foreground">
                  最近 {recentReview.length} 轮平均正确率
                  <span className="ml-1.5 font-medium text-foreground tabular-nums">
                    {recentReviewRate === null ? '—' : `${recentReviewRate}%`}
                  </span>
                </p>
                <div className="mt-3">
                  <p className="text-[11.5px] text-muted-foreground">近 {reviewTrend.length} 轮正确率走势</p>
                  <div className="mt-1.5 flex h-8 items-end gap-1">
                    {reviewTrend.map((point) => (
                      <div
                        key={point.id}
                        title={point.title}
                        className="flex-1 rounded-sm bg-primary/70"
                        style={{ height: `${Math.max(4, Math.round((point.rate / 100) * 32))}px` }}
                      />
                    ))}
                  </div>
                </div>
                <ul className="mt-3 space-y-2">
                  {recentReview.map((round) => (
                    <li key={round.id} className="flex items-center justify-between gap-3 text-[13.5px]">
                      <Link
                        to={round.topicId === 'all' ? '/mistakes' : `/mistakes?topic=${round.topicId}`}
                        className="flex min-w-0 items-center gap-2 hover:text-primary"
                      >
                        <span className="shrink-0 rounded border border-border px-1 py-0.5 text-[11px] text-muted-foreground">
                          {round.kind === 'reading' ? '阅读' : '自测'}
                        </span>
                        <span className="min-w-0 truncate text-muted-foreground">{round.label}</span>
                      </Link>
                      <span className="shrink-0 text-foreground tabular-nums">
                        {round.correct}/{round.total}
                        <span className="ml-2 text-muted-foreground">{format(new Date(round.at), 'MM-dd HH:mm')}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div className="surface rounded-xl p-5">
            <h2 className="text-base font-semibold tracking-tight">自讲自评</h2>
            {talkList.length === 0 ? (
              <p className="mt-2 text-[13.5px] leading-6 text-muted-foreground">
                还没有自评记录。打开任意一节点「开启自测模式」，讲完再给自己评一级。
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {talkList.map(({ record, topic, level }) => (
                  <li key={record.topicId} className="flex items-center justify-between gap-3 text-[13.5px]">
                    <Link to={`/topics/${record.topicId}`} className="min-w-0 truncate hover:text-primary">
                      {topic?.title}
                    </Link>
                    <span className="shrink-0 text-muted-foreground">
                      {level?.label}
                      <span className="ml-2">{format(new Date(record.at), 'MM-dd HH:mm')}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-border p-5">
            <p className="text-[12.5px] leading-5 text-muted-foreground">
              当前共 {QUESTIONS.length} 道自测题、{READING_ITEMS.length} 道阅读题、{TOPICS.length} 个知识点。学习记录只保存在这台设备的浏览器里。
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="mt-2 text-[12.5px] text-muted-foreground hover:text-destructive"
            >
              清空学习记录
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
