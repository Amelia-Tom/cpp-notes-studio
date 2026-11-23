# C++ 笔记 · 少儿编程（GESP 1–8 级）

在线访问：<https://amelia-tom.github.io/cpp-notes-studio/>

> 当前线上版本由 `gh-pages` 分支静态部署；`main` 分支只放源码。仓库内的 `.github/workflows/deploy.yml` 会在推送后自动构建并发布（需给令牌 `workflow` 权限后启用）。

面向少儿编程 / 信息学入门的 C++ 学习笔记 Web 应用。按 CCF **GESP C++ 1–8 级**认证标准组织内容，覆盖「读教材 → 自讲自评 → 做专项 → 开模拟卷 → 错题复盘 → 看进度」的完整闭环。

## 功能

- **35 章教材级知识点**：每章含概念讲解、生活类比、语法要点、3 条易错对照（错写法 / 正确写法 / 原因）、逐行注释代码模板、例题（思路·代码·时空复杂度·一句话收获）、课后任务。
- **知识地图**（`/map`）：35 章按真实技术依赖连成 DAG（61 条边、11 层拓扑深度），悬停点亮整条前置/后续链，点开节点看前后关系，支持阶段筛选、缩放、标记已学，并按「前置已达成」推荐下一步。
- **GESP 八级大纲页**（`/gesp`）：每级官方知识内容、知识目标、易错提醒、对应章节、本级覆盖率，一键跳章节或开练。
- **代码高亮 + 注释开关**：highlight.js（Xcode Light 配色）、行号、C++17 标签、一键复制；可隐藏全部行尾注释进入「自测模式」。
- **自讲自评**：三档自评（讲得清 / 有几处卡壳 / 只看懂一半），计入能力雷达。
- **练习与模拟卷**：按章节、按阶段、按 GESP 级别专项练习；每级模拟卷固定 15 题（10 选择 + 5 填空），计时、按题型统计正确率、记录历史最好成绩。
- **程序阅读**（`/reading`）：43 道按 GESP 1–8 级分级的题，分「猜输出」29 道与「程序填空」14 道两类，每题都经过 g++ 编译运行校验；支持按级别 + 题型筛选、只重做错题，答完立刻给逐行推演与考点。
- **错题本 / 进度页**：自测错题与程序阅读错题统一归集，可单条移除；进度页含完成度、能力雷达、GESP 级别覆盖、模拟卷成绩表，以及程序阅读的 8 级覆盖进度与累计正确率。

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
- `src/data/map.ts`：知识地图的前置关系、拓扑分层与链路查询
- `src/data/questions.ts`：自测题 129 道（单选 / 填空）
- `src/pages/`：首页、知识点列表、章节详情、练习、错题本、进度、GESP 大纲

## 存储键

`cpp-notes-studio:progress-v1`（进度/错题/练习记录）、`cpp-notes-studio:prefs-v1`（注释开关）、`cpp-notes-studio:selftalk-v1`（自讲自评）、`cpp-notes-studio:exam-v1`（模拟卷成绩）。

## 说明

内容按 GESP 官方知识体系整理并做了教学化扩写，仅用于学习与教学参考；考纲以 CCF 官方发布为准。
