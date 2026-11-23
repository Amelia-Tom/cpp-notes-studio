// EXPORTS: 默认导出 CodeCard 组件

import { useMemo, useState, useSyncExternalStore } from 'react';
import { Check, Copy, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { highlightCppLines, stripLineComments } from '@/lib/highlight';
import { setShowComments, showComments, subscribePrefs } from '@/lib/prefs';

interface CodeCardProps {
  code: string;
  title?: string;
  /** 小尺寸用于例题内嵌 */
  compact?: boolean;
  className?: string;
}

export default function CodeCard({ code, title = 'main.cpp', compact = false, className }: CodeCardProps) {
  const [copied, setCopied] = useState(false);
  const commentsVisible = useSyncExternalStore(subscribePrefs, showComments, showComments);
  const hasComments = useMemo(() => code.includes('//'), [code]);

  const hasBlank = useMemo(() => code.includes('___'), [code]);

  const lines = useMemo(() => {
    const rendered = highlightCppLines(commentsVisible ? code : stripLineComments(code));
    if (!hasBlank) return rendered;
    // 程序填空题：把占位符做成醒目高亮，便于一眼看到要补的位置
    return rendered.map((line) => line.replace(/___/g, '<span class="blank-slot">___</span>'));
  }, [code, commentsVisible, hasBlank]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('代码已复制');
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error('复制失败，请手动选中代码');
    }
  };

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-border bg-card shadow-[0_1px_1px_rgba(0,0,0,0.03),0_18px_40px_-28px_rgba(0,0,0,0.35)]',
        className,
      )}
    >
      <div className={cn('flex items-center gap-3 border-b border-border bg-secondary/50 px-4', compact ? 'py-2' : 'py-2.5')}>
        <div className="flex items-center gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
        </div>
        <span
          className={cn('truncate text-muted-foreground', compact ? 'text-[12.5px]' : 'text-[14px]')}
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {title}
        </span>
        <span className="shrink-0 rounded-full border border-border px-1.5 py-0.5 text-[11.5px] text-muted-foreground">
          C++17
        </span>
        <div className="ml-auto flex shrink-0 items-center gap-1">
          {hasComments && (
            <button
              type="button"
              onClick={() => setShowComments(!commentsVisible)}
              className={cn(
                'inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12.5px] transition-colors hover:bg-foreground/5',
                commentsVisible ? 'text-muted-foreground hover:text-foreground' : 'border border-primary/30 bg-primary/10 text-primary',
              )}
              aria-pressed={!commentsVisible}
              title={commentsVisible ? '隐藏注释，用来检验自己是否真的看懂' : '恢复显示逐行注释'}
            >
              {commentsVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {commentsVisible ? '隐藏注释' : '显示注释'}
            </button>
          )}
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12.5px] text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
            aria-label="复制代码"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? '已复制' : '复制'}
          </button>
        </div>
      </div>

      <div className={cn('thin-scroll overflow-x-auto', compact ? 'py-2' : 'py-3')}>
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, index) => (
              <tr key={index} className="group align-top">
                <td
                  className={cn(
                    'w-9 select-none border-r border-border/60 bg-secondary/25 pr-2 text-right tabular-nums text-muted-foreground/50',
                    compact ? 'text-[11px] leading-[1.95]' : 'text-[11.5px] leading-[1.95]',
                  )}
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {index + 1}
                </td>
                <td
                  data-compact={compact ? 'true' : 'false'}
                  className="code-area whitespace-pre pl-3 pr-4 group-hover:bg-foreground/[0.02]"
                  style={{ fontFamily: 'var(--font-mono)' }}
                  dangerouslySetInnerHTML={{ __html: line.length > 0 ? line : ' ' }}
                />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
