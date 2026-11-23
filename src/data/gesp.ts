// EXPORTS: GESP_LEVELS, TOPIC_GESP, getTopicGesp, getLevelsOfTopic, GERSP 级别常量

export interface IGespLevel {
  level: number;
  /** 官方级别名称 */
  name: string;
  /** 难度星级，用于展示 */
  stars: number;
  /** 建议投入的备考周期 */
  duration: string;
  /** 官方知识内容（按 CCF GESP C++ 认证标准整理） */
  contents: string[];
  /** 官方知识目标 */
  goal: string;
  /** 本笔记对应的章节 id */
  topicIds: string[];
  /** 这一级最容易失分的地方，给孩子的提醒 */
  warning: string;
}

/** 本笔记中各章节对应的 GESP 级别（一个章节可能覆盖多级） */
export const TOPIC_GESP: Record<string, number[]> = {
  env: [1],
  var: [1],
  io: [1],
  expr: [1, 2],
  cast: [2],
  branch: [1, 2],
  loop: [1, 2],
  'base-bit': [3],
  array: [3],
  matrix: [4],
  string: [3],
  function: [4],
  recurrence: [4],
  'sort-search': [4, 5],
  struct: [4],
  recursion: [5],
  prefix: [5],
  'binary-answer': [5],
  'stack-queue': [6],
  hash: [7],
  combinatorics: [8],
  shortest: [8],
  doubling: [8],
  'file-io': [4],
  bigint: [5],
  'linked-list': [5],
  'divide-conquer': [5],
  object: [6],
  'math-lib': [7],
  greedy: [5],
  dp: [6, 7],
  'dfs-bfs': [6, 7],
  graph: [7, 8],
  tree: [6, 7],
  'number-theory': [5, 8],
};

export const GESP_LEVELS: IGespLevel[] = [
  {
    level: 1,
    name: '顺序、分支与循环入门',
    stars: 1,
    duration: '2–3 周',
    contents: [
      '计算机基础与编程环境、计算机历史',
      '变量的定义与使用',
      '基本数据类型：整型 int / long long、浮点型 float / double、字符型 char、布尔型 bool',
      '控制语句结构：顺序、选择、循环',
      '基本运算：算术运算、关系运算、逻辑运算',
      '输入输出语句：cin / cout / scanf / printf',
      '标识符、关键字、常量、表达式、注释与调试',
    ],
    goal: '掌握顺序、循环、分支的简单程序结构，能使用集成开发环境编程与调试，完成单一功能的程序设计。',
    topicIds: ['env', 'var', 'io', 'expr', 'branch', 'loop'],
    warning: '一级失分多半不在算法，而在读题与输入输出格式：多组数据、整数除法、浮点保留位数。',
  },
  {
    level: 2,
    name: '类型转换与多层结构',
    stars: 2,
    duration: '3–4 周',
    contents: [
      '计算机的存储与网络基础、程序设计语言的特点',
      '流程图的概念与描述',
      'ASCII 编码与字符、数字的互转',
      '数据类型的转换（隐式转换、强制类型转换）',
      '多层分支与多层循环（嵌套结构）',
      '常用数学函数：abs、sqrt、max、min（以及 floor、ceil、round）',
    ],
    goal: '掌握程序设计的基本方法，能使用简单数学函数，独立完成包含分支、循环嵌套的综合案例。',
    topicIds: ['expr', 'cast', 'branch', 'loop'],
    warning: 'double 与 int 混算、浮点相等比较、整数除法截断，是二级客观题的高频陷阱。',
  },
  {
    level: 3,
    name: '编码、位运算与数组',
    stars: 2,
    duration: '3–5 周',
    contents: [
      '数据编码：原码、反码、补码',
      '进制转换：二进制、八进制、十进制、十六进制',
      '位运算：与 &、或 |、非 ~、异或 ^、左移 <<、右移 >>',
      '算法的概念与描述：自然语言、流程图、伪代码',
      '一维数组的基本应用',
      '字符串及其常用函数',
      '算法：枚举法、模拟法',
    ],
    goal: '掌握数据编码、进制转换、位运算，掌握一维数组与字符串，能用模拟法、枚举法解决对应算法问题。',
    topicIds: ['base-bit', 'array', 'string'],
    warning: '补码下 -1 全 1、1<<31 溢出、负数右移，是三级判断题的常客。',
  },
  {
    level: 4,
    name: '函数、结构体与排序',
    stars: 3,
    duration: '1–2 个月',
    contents: [
      '函数的定义与调用、形参与实参、作用域',
      '指针类型的概念与基本应用',
      '参数传递：值传递、引用传递、指针传递',
      '结构体的定义与使用',
      '二维数组与多维数组的基本应用',
      '算法：递推',
      '排序概念与稳定性，冒泡、插入、选择排序',
      '简单算法复杂度估算（含多项式、指数）',
      '文件重定向、文件读写操作、异常处理',
    ],
    goal: '掌握函数定义调用与参数传递，掌握二维数组与排序算法，能用递推解决相关问题，会文件读写。',
    topicIds: ['function', 'matrix', 'struct', 'recurrence', 'sort-search', 'file-io'],
    warning: '值传递改不了实参、数组下标越界、排序稳定性判断，是四级最容易丢分的地方。',
  },
  {
    level: 5,
    name: '数论、递归与二分贪心',
    stars: 3,
    duration: '1.5–2.5 个月',
    contents: [
      '初等数论：素数与合数、gcd 与 lcm、同余与模运算、约数与倍数、质因数分解、奇偶性',
      '数组模拟高精度加减乘除',
      '单链表、双链表、循环链表',
      '辗转相除法（欧几里得算法）',
      '素数表的埃氏筛法与线性筛法',
      '唯一分解定理',
      '二分查找 / 二分答案',
      '贪心算法',
      '分治算法：归并排序、快速排序',
      '递归',
      '算法复杂度估算（含对数）',
    ],
    goal: '掌握初等数论与线性表，理解二分、分治、贪心的思想，能完成指定功能的程序；C++ 掌握高精度运算。',
    topicIds: ['number-theory', 'recursion', 'binary-answer', 'greedy', 'prefix', 'sort-search', 'bigint', 'linked-list', 'divide-conquer'],
    warning: 'lcm 先乘后除会溢出、二分边界写错导致死循环、贪心不会证明，是五级的三大坑。',
  },
  {
    level: 6,
    name: '树、搜索与动态规划入门',
    stars: 4,
    duration: '2–3 个月',
    contents: [
      '树的定义、构造与遍历',
      '哈夫曼树、完全二叉树、二叉排序树',
      '哈夫曼编码、格雷编码',
      '深度优先搜索 DFS、广度优先搜索 BFS',
      '二叉树的搜索算法',
      '简单动态规划：一维 DP、简单背包问题',
      '面向对象的思想、类的创建',
      '栈、队列、循环队列',
    ],
    goal: '掌握树的基础知识，能分辨不同树并按不同搜索算法遍历，掌握简单线性 DP 与简单背包问题。',
    topicIds: ['tree', 'dfs-bfs', 'dp', 'stack-queue', 'object'],
    warning: 'DFS 忘记回溯、BFS 忘记判重、DP 边界与初始化写错，是六级编程题的主要失分点。',
  },
  {
    level: 7,
    name: '复杂 DP、图与哈希',
    stars: 4,
    duration: '3–4 个月',
    contents: [
      '数学库常用函数：sin/cos 等三角函数、log10/log2、exp',
      '复杂动态规划：二维 DP、区间 DP、LIS、LCS、最值优化',
      '用滚动数组降低 DP 空间复杂度',
      '图的定义、种类、结点的度',
      '图的存储与 DFS / BFS 遍历、泛洪算法 flood fill',
      '哈希表的概念与应用',
    ],
    goal: '掌握常用数学库函数与复杂动态规划，理解滚动数组优化，掌握图的定义与遍历、泛洪算法与哈希表。',
    topicIds: ['dp', 'graph', 'dfs-bfs', 'tree', 'hash', 'math-lib'],
    warning: '区间 DP 的枚举顺序、LIS 的 O(n log n) 做法、图遍历的判重，是七级区分度所在。',
  },
  {
    level: 8,
    name: '计数、倍增与图论算法',
    stars: 5,
    duration: '4 个月以上',
    contents: [
      '计数原理：加法原理、乘法原理',
      '排列与组合、杨辉三角',
      '倍增法',
      '代数与平面几何（初中数学部分）',
      '图论算法：最小生成树（Kruskal、Prim）、单源最短路（Dijkstra）、Floyd',
      '较复杂算法的时间与空间效率分析',
      '算法优化：用数学公式替代循环等',
    ],
    goal: '掌握计数原理与排列组合，理解杨辉三角与组合的关系，掌握 MST 与最短路算法，能分析并优化复杂度。',
    topicIds: ['graph', 'number-theory', 'dp', 'combinatorics', 'shortest', 'doubling'],
    warning: '计数题漏算重复、Kruskal 与 Prim 的适用场景、Dijkstra 不能处理负权边，是八级判断题的常考点。',
  },
];

/** 取某章节覆盖的 GESP 级别，未登记时返回空数组 */
export function getTopicGesp(topicId: string): number[] {
  return TOPIC_GESP[topicId] ?? [];
}

/** 取某级别下的章节 id（官方级别清单里已列出的） */
export function getLevelsOfTopic(topicIds: string[]): number[] {
  const levels = new Set<number>();
  topicIds.forEach((id) => {
    (TOPIC_GESP[id] ?? []).forEach((level) => levels.add(level));
  });
  return Array.from(levels).sort((a, b) => a - b);
}
