// EXPORTS: 默认导出 ReviewClosure 组件（重练结算后的收尾卡：本章错题是否清空、下一章学什么）

import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, CircleAlert, Map as MapIcon } from 'lucide-react';
import { QUESTIONS, getTopic } from '@/data';
import { getReadingTopicId } from '@/data/reading';
import { MAP_BY_ID, getDependents } from '@/data/map';
import useProgress from '@/hooks/useProgress';
import { useReadingRecords } from '@/lib/reading';

interface ReviewClosureProps {
  /** 本轮限定的章节；不传表示「全部章节」 */
  topicId?: string;
}

export default function ReviewClosure({ topicId }: ReviewClosureProps) {
  const progress = useProgress();
  const readingRecords = useReadingRecords();
  const completed = new Set(progress.completed);
  const topic = topicId ? getTopic(topicId) : undefined;

  const wrongPractice = progress.mistakes.filter((mistake) => {
    const question = QUESTIONS.find((item) => item.id === mistake.questionId);
    return question && (!topicId || question.topicId === topicId);
  });
  const wrongReading = Object.values(readingRecords).filter(
    (record) => !record.correct && (!topicId || getReadingTopicId(record.itemId) === topicId),
  );
  const remaining = wrongPractice.length + wrongReading.length;

  if (!topicId) {
    return (
      <div className="surface mt-6 rounded-xl p-5">
        <p className="text-[13px] text-muted-foreground">
          {remaining === 0 ? '错题本已经清空，接下来可以去做新题或阅读题保持手感。' : `全部错题还剩 ${remaining} 道没收，建议先继续重练。`}
        </p>
        <div className="mt-2 flex flex-wrap gap-4 text-[13px]">
          <Link to="/mistakes" className="text-primary hover:underline">
            回错题本
          </Link>
          <Link to="/practice" className="text-muted-foreground hover:text-foreground">
            做一组新题
          </Link>
          <Link to="/reading" className="text-muted-foreground hover:text-foreground">
            去做阅读题
          </Link>
        </div>
      </div>
    );
  }

  if (remaining > 0) {
    const parts = [
      wrongPractice.length > 0 ? `自测 ${wrongPractice.length}` : '',
      wrongReading.length > 0 ? `阅读 ${wrongReading.length}` : '',
    ].filter(Boolean);
    return (
      <div className="surface mt-6 rounded-xl p-5">
        <div className="flex items-center gap-2">
          <CircleAlert className="h-4 w-4 text-foreground/60" />
          <p className="text-[14px] font-medium">
            本章还剩 {remaining} 道错题（{parts.join(' · ')}）
          </p>
        </div>
        <p className="mt-1.5 text-[13px] leading-6 text-muted-foreground">
          先把这 {remaining} 道清掉再往前走，比急着学下一章更划算。
        </p>
        <div className="mt-2 flex flex-wrap gap-4 text-[13px]">
          <Link to={`/mistakes?topic=${topicId}`} className="text-primary hover:underline">
            回错题本继续清
          </Link>
          {wrongPractice.length > 0 && (
            <Link to={`/practice?from=mistakes&topic=${topicId}`} className="text-muted-foreground hover:text-foreground">
              再练自测错题
            </Link>
          )}
          {wrongReading.length > 0 && (
            <Link to={`/reading?from=mistakes&topic=${topicId}`} className="text-muted-foreground hover:text-foreground">
              再练阅读错题
            </Link>
          )}
        </div>
      </div>
    );
  }

  // 直接后续章里，挑「未完成前置最少」的，其次按拓扑层与顺序
  const candidates = getDependents(topicId)
    .map((node) => ({
      node,
      unmet: node.prereqs.filter((id) => id !== topicId && !completed.has(id)),
    }))
    .sort(
      (a, b) => a.unmet.length - b.unmet.length || a.node.level - b.node.level || a.node.order - b.node.order,
    );
  const next = candidates[0];

  return (
    <div className="surface mt-6 rounded-xl p-5">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-primary" />
        <p className="text-[14px] font-medium">「{topic?.title ?? topicId}」的错题已清空</p>
      </div>

      {next ? (
        <>
          <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
            按依赖关系，下一章建议学
            <Link to={`/topics/${next.node.id}`} className="mx-1 font-medium text-foreground hover:text-primary">
              {next.node.title}
            </Link>
            {next.node.gesp.length > 0 && `（GESP L${next.node.gesp[0]}`}
            {next.node.gesp.length > 0 && ` · ${next.node.minutes} 分钟）`}
            {next.node.gesp.length === 0 && `（约 ${next.node.minutes} 分钟）`}
            {next.unmet.length === 0 ? '，它的前置都已完成。' : `；还剩 ${next.unmet.length} 章前置没学：${next.unmet.map((id) => MAP_BY_ID[id]?.title ?? id).join('、')}。`}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Link
              to={`/topics/${next.node.id}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-[13px] font-medium text-background transition-opacity hover:opacity-85"
            >
              去学这一章
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to={`/map?target=${next.node.id}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
            >
              <MapIcon className="h-3.5 w-3.5" />
              看它在知识地图上的位置
            </Link>
          </div>
          <p className="mt-2 text-[12px] text-muted-foreground">
            以这章为目标，地图会把整条前置链按 1→n 编号铺开，并算出预计时长。
          </p>
        </>
      ) : (
        <>
          <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
            这已经是知识链路的一个末端，没有直接后续章。去地图上挑一个还没学的方向继续。
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              to="/map"
              className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-[13px] font-medium text-background transition-opacity hover:opacity-85"
            >
              <MapIcon className="h-3.5 w-3.5" />
              打开知识地图
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
