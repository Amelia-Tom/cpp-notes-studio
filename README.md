# C++ 笔记 · 少儿编程（GESP 1–8 级）

面向少儿编程 / 信息学入门的 C++ 学习笔记 Web 应用。按 CCF **GESP C++ 1–8 级**认证标准组织内容，覆盖「读教材 → 自讲自评 → 做专项 → 开模拟卷 → 错题复盘 → 看进度」的完整闭环。

## 功能

- **35 章教材级知识点**：每章含概念讲解、生活类比、语法要点、3 条易错对照（错写法 / 正确写法 / 原因）、逐行注释代码模板、例题（思路·代码·时空复杂度·一句话收获）、课后任务。
- **GESP 八级大纲页**（`/gesp`）：每级官方知识内容、知识目标、易错提醒、对应章节、本级覆盖率，一键跳章节或开练。
- **代码高亮 + 注释开关**：highlight.js（Xcode Light 配色）、行号、C++17 标签、一键复制；可隐藏全部行尾注释进入「自测模式」。
- **自讲自评**：三档自评（讲得清 / 有几处卡壳 / 只看懂一半），计入能力雷达。
- **练习与模拟卷**：按章节、按阶段、按 GESP 级别专项练习；每级模拟卷固定 15 题（10 选择 + 5 填空），计时、按题型统计正确率、记录历史最好成绩。
- **错题本 / 进度页**：错题自动归集；完成度、正确率、自评合成能力雷达；GESP 级别覆盖与模拟卷成绩表。

## 技术栈

React 19 + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui + lucide-react + recharts，数据全部本地存储（localStorage），无后端。

## 本地运行

```bash
npm install
npm run dev        # 默认 21473 端口
npm run build
npm run lint       # tsc + eslint
```

## 数据与目录

- `src/data/topics/`：章节内容（`basic` / `cert` / `contest` / `gesp1`–`gesp4`）
- `src/data/gesp.ts`：GESP 八级大纲与章节映射
- `src/data/questions.ts`：自测题 129 道（单选 / 填空）
- `src/pages/`：首页、知识点列表、章节详情、练习、错题本、进度、GESP 大纲

## 存储键

`cpp-notes-studio:progress-v1`（进度/错题/练习记录）、`cpp-notes-studio:prefs-v1`（注释开关）、`cpp-notes-studio:selftalk-v1`（自讲自评）、`cpp-notes-studio:exam-v1`（模拟卷成绩）。

## 说明

内容按 GESP 官方知识体系整理并做了教学化扩写，仅用于学习与教学参考；考纲以 CCF 官方发布为准。
