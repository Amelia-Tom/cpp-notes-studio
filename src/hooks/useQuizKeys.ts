import { useEffect, useRef } from 'react';

interface IQuizKeyOptions {
  /** 只在答题进行中启用，结算页/setup 页不接管键盘 */
  enabled: boolean;
  /** 当前题的选项数量（填空题为 0），决定 1–4 / A–D 能选到第几个 */
  optionCount?: number;
  /** 是否已经判过题：判过之后数字键不再改答案，Enter 变成「下一题」 */
  submitted: boolean;
  onPick?: (index: number) => void;
  onSubmit?: () => void;
  onNext?: () => void;
}

/**
 * 答题页的键盘快捷键：1–4 / A–D 选选项，Enter 提交、判完再按 Enter 进下一题。
 * 在输入框里打字不拦（填空题的数字照常输入），只拦 Enter。
 */
export function useQuizKeys(options: IQuizKeyOptions) {
  const latest = useRef<IQuizKeyOptions>(options);

  // 每次渲染后同步最新一版回调，避免键位处理器里拿到旧闭包
  useEffect(() => {
    latest.current = options;
  });

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const options = latest.current;
      if (!options.enabled || event.defaultPrevented) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      const tag = target?.tagName ?? '';
      const editing = tag === 'TEXTAREA' || tag === 'SELECT' || Boolean(target?.isContentEditable);
      if (editing) return;

      if (event.key === 'Enter') {
        event.preventDefault();
        if (options.submitted) options.onNext?.();
        else options.onSubmit?.();
        return;
      }

      if (options.submitted) return;
      // 焦点在填空输入框时，数字键属于输入内容，不当作选项
      if (tag === 'INPUT') return;

      const count = options.optionCount ?? 0;
      if (count === 0) return;
      const picked = parseOptionKey(event.key);
      if (picked === null || picked >= count) return;

      event.preventDefault();
      options.onPick?.(picked);
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}

/** '1'–'9' 或 'a'–'d'/'A'–'D' 转成从 0 开始的选项下标，其它键返回 null */
function parseOptionKey(key: string) {
  if (key.length !== 1) return null;
  const code = key.charCodeAt(0);
  if (code >= 49 && code <= 57) return code - 49;
  const lower = key.toLowerCase().charCodeAt(0);
  if (lower >= 97 && lower <= 122) return lower - 97;
  return null;
}
