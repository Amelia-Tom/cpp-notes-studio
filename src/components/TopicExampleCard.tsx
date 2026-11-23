import type { ITopicExample } from '@/data/types';
import CodeCard from '@/components/CodeCard';

interface TopicExampleCardProps {
  example: ITopicExample;
  index: number;
}

export default function TopicExampleCard({ example, index }: TopicExampleCardProps) {
  return (
    <article className="surface rounded-xl p-5 md:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mono-label">example {String(index + 1).padStart(2, '0')}</span>
        <span className="rounded-full border border-border px-2 py-0.5 text-[12.5px] text-muted-foreground">
          {example.difficulty}
        </span>
      </div>

      <h4 className="mt-2 text-[17.5px] font-semibold tracking-tight">{example.title}</h4>
      <p className="mt-2 text-[15.5px] leading-[1.8] text-muted-foreground">{example.problem}</p>

      <p
        className="mt-3 rounded-lg bg-secondary/70 px-3 py-2 text-[14px] text-muted-foreground"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {example.sample}
      </p>

      <div className="mt-4">
        <span className="mono-label">思路</span>
        <ol className="mt-2 space-y-1.5">
          {example.ideas.map((idea, ideaIndex) => (
            <li key={ideaIndex} className="flex gap-2 text-[15px] leading-[1.75]">
              <span className="w-4 shrink-0 text-right text-muted-foreground/70" style={{ fontFamily: 'var(--font-mono)' }}>
                {ideaIndex + 1}
              </span>
              <span>{idea}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-4">
        <CodeCard code={example.code} title={`example-${index + 1}.cpp`} compact />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">时间 {example.time}</span>
        <span className="rounded-full bg-secondary px-2 py-0.5">空间 {example.space}</span>
        <span className="leading-5">记住：{example.takeaway}</span>
      </div>
    </article>
  );
}
