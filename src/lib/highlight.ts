// EXPORTS: highlightCppLines, stripLineComments

import hljs from 'highlight.js/lib/core';
import cpp from 'highlight.js/lib/languages/cpp';

hljs.registerLanguage('cpp', cpp);

/**
 * 把一段 C++ 源码高亮后按行返回，每行是已经转义过的 HTML 片段。
 * 行数严格按 \n 切分，保证行号槽与代码一一对应。
 */
export function highlightCppLines(code: string): string[] {
  const trimmed = code.replace(/\n+$/, '');
  const html = hljs.highlight(trimmed, { language: 'cpp', ignoreIllegals: true }).value;
  return html.split('\n');
}

/**
 * 逐行去掉行尾的 // 注释，用于「隐藏注释」自测模式。
 * 会跳过字符串字面量里的 //，并裁掉注释前的对齐空格。
 */
export function stripLineComments(code: string): string {
  return code
    .split('\n')
    .map((line) => {
      let inString = false;
      let inChar = false;
      for (let i = 0; i < line.length; i += 1) {
        const ch = line[i];
        const prev = i > 0 ? line[i - 1] : '';
        if (prev === '\\') continue;
        if (ch === '"' && !inChar) inString = !inString;
        else if (ch === "'" && !inString) inChar = !inChar;
        else if (!inString && !inChar && ch === '/' && line[i + 1] === '/') {
          return line.slice(0, i).replace(/\s+$/, '');
        }
      }
      return line;
    })
    .join('\n');
}
