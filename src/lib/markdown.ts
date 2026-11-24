// EXPORTS: downloadMarkdown, fence, stamp, slugify

/**
 * Markdown 导出的公共件：错题本导出和章节笔记导出都要用同一套
 * 「本地下载 + 代码块包裹 + 时间戳」逻辑，免得两边各写一份、格式还不一致。
 */

/** 触发一次本地下载 */
export function downloadMarkdown(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  // 立刻 revoke 会让部分浏览器的下载中断，等一拍再释放
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** 用四个反引号包代码块，题目代码里本身含 ``` 时不会截断 */
export function fence(code: string, lang = 'cpp'): string {
  return ['````' + lang, code.trimEnd(), '````'].join('\n');
}

/** 导出时间戳，用来写进 front matter 与正文 */
export function stamp(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(
    date.getMinutes(),
  )}`;
}

/** 文件名里只用安全字符：章节 id / 标签一律过一遍 */
export function slugify(text: string): string {
  return text
    .trim()
    .replace(/[^\w\u4e00-\u9fa5-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
