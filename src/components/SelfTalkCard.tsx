// EXPORTS: 默认导出 SelfTalkCard 组件

import { Check, CircleAlert, CircleX } from 'lucide-react';
import { recordSelfTalk, SELF_TALK_LEVELS, useSelfTalk } from '@/lib/selfTalk';
import type { SelfTalkLevel } from '@/lib/selfTalk';
import { cn } from '@/lib/utils';

const ICONS = {
  solid: Check,
  partial: CircleAlert,
  stuck: CircleX,
} as const;

const TONES: Record<SelfTalkLevel, string> = {
  solid: 'border-primary/30 bg-primary/10 text-primary',
  partial: 'border-[#B26A00]/30 bg-[#B26A00]/10 text-[#B26A00]',
  stuck: 'border-destructive/30 bg-destructive/10 text-destructive',
};

function formatAt(at: number): string {
  const date = new Date(at);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getMonth() + 1} 月 ${date.getDate()} 日 ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

interface SelfTalkCardProps {
  topicId: string;
}

export default function SelfTalkCard({ topicId }: SelfTalkCardProps) {
  const records = useSelfTalk();
  const record = records[topicId];
  const current = record ? SELF_TALK_LEVELS.find((item) => item.level === record.level) : undefined;
  const ActiveIcon = record ? ICONS[record.level] : null;

  return (
    <div className="surface rounded-xl p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[14.5px] font-medium">合上注释，试着把这段模板讲一遍</p>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">
            用「隐藏注释」遮住中文提示，讲不出来就说明那一行还没吃透。
          </p>
        </div>
        {record && current && (
          <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[12.5px]', TONES[record.level])}>
            {ActiveIcon && <ActiveIcon className="h-3 w-3" />}
            {current.label}
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {SELF_TALK_LEVELS.map((item) => {
          const Icon = ICONS[item.level];
          const active = record?.level === item.level;
          return (
            <button
              key={item.level}
              type="button"
              onClick={() => recordSelfTalk(topicId, item.level)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13.5px] transition-colors',
                active ? TONES[item.level] : 'border-border text-muted-foreground hover:bg-secondary hover:text-foreground',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>

      {current && (
        <p className="mt-3 rounded-lg bg-secondary/70 px-3 py-2 text-[13px] leading-[1.7] text-foreground/80">
          {current.hint}
          {record && <span className="ml-1 text-muted-foreground">（记录于 {formatAt(record.at)}）</span>}
        </p>
      )}
    </div>
  );
}
