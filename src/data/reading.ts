// EXPORTS: IReadingItem, ReadingKind, READING_ITEMS, READING_LEVELS

import { READING_EXTRA } from './reading-extra';


/**
 * 「程序阅读 · 猜输出」题：给一段能跑的代码，问输出。
 * 这是 GESP / CSP 选择题里占比最高的一类，考的是「跟着程序走一遍」的能力，
 * 而不是背语法。所以每题的 explanation 必须写清逐行推演过程。
 */
export type ReadingKind = 'output' | 'blank';

export interface IReadingItem {
  id: string;
  /** 对应 GESP 级别 1–8 */
  level: number;
  title: string;
  /** 一句话考点，做题前不显示，判题后才揭示 */
  point: string;
  /** output = 猜输出（选择题）；blank = 程序填空（输入答案） */
  kind: ReadingKind;
  /** output 题是完整程序；blank 题含一个 ___ 占位 */
  code: string;
  /** output 题的四个选项 */
  options?: string[];
  /** output 题的正确选项下标 */
  answerIndex?: number;
  /** blank 题的可接受写法，第一个用于编译自检 */
  answers?: string[];
  /** blank 题填对之后程序应输出的内容，用于自检 */
  expected?: string;
  /** 逐行推演：为什么是这个答案，其他选项错在哪 */
  explanation: string;
}

export const READING_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8];

const BASE_ITEMS: IReadingItem[] = [
  // ── 1 级：整数运算与输出 ──────────────────────────────────────────
  {
    id: 'rd-l1-div',
    level: 1,
    title: '整除、取余与乘法',
    point: '整数除法向下取整、% 取余、以及输出顺序',
    kind: 'output',
    code: `#include <iostream>
using namespace std;

int main() {
    int a = 7, b = 3;
    cout << a / b << " " << a % b << " " << a * b << endl;
    return 0;
}`,
    options: ['2 1 21', '2.33 1 21', '3 1 21', '2 3 21'],
    answerIndex: 0,
    explanation:
      'a、b 都是 int，所以 a / b 是整除：7 / 3 只保留商的整数部分 2（不是四舍五入，直接丢弃小数）。a % b 是余数 7 - 2 * 3 = 1。a * b = 21。三个表达式之间用空格分开，endl 换行。选项 2.33 是把它当成了浮点除法——只有当 a、b 里有 double 时才会得到 2.333…；选项 3 是误做了四舍五入。',
  },
  {
    id: 'rd-l1-assign',
    level: 1,
    title: '自增与赋值顺序',
    point: 'x++ 先用后加；赋值表达式从右往左算',
    kind: 'output',
    code: `#include <iostream>
using namespace std;

int main() {
    int x = 5;
    int y = x++;
    x = x + 2;
    cout << x << " " << y;
    return 0;
}`,
    options: ['5 7', '7 5', '7 6', '8 5'],
    answerIndex: 3,
    explanation:
      '第一行 x = 5。第二行 int y = x++; 是后缀自增：先把当前值 5 赋给 y，再把 x 加 1，所以 y = 5、x = 6。第三行 x = x + 2，x 已经是 6，加 2 得 8。因此输出 8 5。若写成 int y = ++x，则先加后赋值，y 会等于 6、x 也是 6，最终输出 8 6——这是最容易混的一对。选项 5 7 是「以为自增先发生、但 x 加 2 时又用回了初值」的错算。',
  },

  // ── 2 级：分支与累加 ─────────────────────────────────────────────
  {
    id: 'rd-l2-if',
    level: 2,
    title: '多分支只走一条',
    point: 'if / else if 从上往下匹配，命中后整条链结束',
    kind: 'output',
    code: `#include <iostream>
using namespace std;

int main() {
    int score = 78;
    if (score >= 90) cout << "A";
    else if (score >= 75) cout << "B";
    else if (score >= 60) cout << "C";
    else cout << "D";
    return 0;
}`,
    options: ['A', 'B', 'C', 'B C'],
    answerIndex: 1,
    explanation:
      '78 >= 90 不成立，跳到 else if (78 >= 75)，成立，输出 B，然后整条 if-else 链直接结束——后面的 score >= 60 根本不会再判断。所以不可能同时输出 B 和 C。这类题唯一的坑就是误以为「每个条件都会被检查」。',
  },
  {
    id: 'rd-l2-loop',
    level: 2,
    title: '循环里的平方累加',
    point: 'for 的循环次数与累加变量初值',
    kind: 'output',
    code: `#include <iostream>
using namespace std;

int main() {
    int s = 0;
    for (int i = 1; i <= 5; i++) {
        s += i * i;
    }
    cout << s;
    return 0;
}`,
    options: ['30', '55', '15', '36'],
    answerIndex: 1,
    explanation:
      'i 依次为 1、2、3、4、5，累加 1 + 4 + 9 + 16 + 25。手算：1 + 4 = 5，+ 9 = 14，+ 16 = 30，+ 25 = 55。选项 30 是只加到 i = 4 的结果（把 <= 看成 <）；选项 15 是 1 + 2 + 3 + 4 + 5 的和；选项 36 把 i * i 算成了 i * 6 之类。',
  },

  // ── 3 级：数组与字符 ────────────────────────────────────────────
  {
    id: 'rd-l3-array',
    level: 3,
    title: '隔一个取一个',
    point: '数组下标从 0 开始、循环步长为 -2',
    kind: 'output',
    code: `#include <iostream>
using namespace std;

int main() {
    int a[5] = {3, 1, 4, 1, 5};
    for (int i = 4; i >= 0; i -= 2) {
        cout << a[i];
    }
    return 0;
}`,
    options: ['513', '514', '543', '354'],
    answerIndex: 2,
    explanation:
      'i 从 4 开始，每次减 2，依次取 4、2、0（再减 2 得 -2，循环条件 i >= 0 不成立而退出）。a[4] = 5、a[2] = 4、a[0] = 3，拼起来是 543。选项 514 是把 a[1] 也取了（步长看成了 -1 的一部分）；选项 513 是从尾部顺序取前三个。',
  },
  {
    id: 'rd-l3-char',
    level: 3,
    title: 'char 与 ASCII 值',
    point: '字符加整数自动转成 int，强转回 char 才是字母',
    kind: 'output',
    code: `#include <iostream>
using namespace std;

int main() {
    char c = 'A';
    cout << (char)(c + 2) << c + 2;
    return 0;
}`,
    options: ['C67', 'C67C', 'A67', '65 67'],
    answerIndex: 0,
    explanation:
      '\'A\' 的 ASCII 是 65。c + 2 = 67，是 int；强转 (char)67 得到字符 \'C\'，所以第一个输出是 C。第二段 c + 2 没有强转，仍然是 int 67，直接按数字输出 67。两段连在一起就是 C67。坑点：字符串输出 "c+2" 会得到 C，数字输出 c+2 会得到 67，一定要分清哪一半被强转了。',
  },

  // ── 4 级：函数与二维数组 ────────────────────────────────────────
  {
    id: 'rd-l4-func',
    level: 4,
    title: '两次调用阶乘函数',
    point: '递归的基准条件与返回值叠加',
    kind: 'output',
    code: `#include <iostream>
using namespace std;

int f(int n) {
    if (n <= 1) return 1;
    return n * f(n - 1);
}

int main() {
    cout << f(4) + f(2);
    return 0;
}`,
    options: ['24', '26', '10', '30'],
    answerIndex: 1,
    explanation:
      'f(4) = 4 * 3 * 2 * 1 = 24；f(2) = 2 * 1 = 2。基准条件 n <= 1 返回 1，所以 f(1) = 1 也是 1。相加得 26。选项 24 漏掉了 f(2)；选项 30 是 f(4) + 6 之类的算错；选项 10 把乘当成了加。',
  },
  {
    id: 'rd-l4-matrix',
    level: 4,
    title: '下三角元素求和',
    point: '双重循环里内层上界跟着外层走',
    kind: 'output',
    code: `#include <iostream>
using namespace std;

int main() {
    int a[3][3] = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};
    int s = 0;
    for (int i = 0; i < 3; i++) {
        for (int j = 0; j <= i; j++) {
            s += a[i][j];
        }
    }
    cout << s;
    return 0;
}`,
    options: ['45', '34', '26', '30'],
    answerIndex: 1,
    explanation:
      'j <= i 说明第 i 行只加前 i + 1 个元素：i = 0 加 a[0][0] = 1；i = 1 加 a[1][0] + a[1][1] = 4 + 5 = 9；i = 2 加 a[2][0] + a[2][1] + a[2][2] = 7 + 8 + 9 = 24。合计 1 + 9 + 24 = 34。选项 45 是全部九个数的和；选项 26 误算成上三角。',
  },

  // ── 5 级：递推、排序、二分 ──────────────────────────────────────
  {
    id: 'rd-l5-fib',
    level: 5,
    title: '递推数列第 7 项',
    point: '数组递推的初值下标与循环终点',
    kind: 'output',
    code: `#include <iostream>
using namespace std;

int main() {
    long long f[10] = {0, 1};
    for (int i = 2; i < 8; i++) {
        f[i] = f[i - 1] + f[i - 2];
    }
    cout << f[7];
    return 0;
}`,
    options: ['13', '21', '8', '34'],
    answerIndex: 0,
    explanation:
      '初值 f[0] = 0、f[1] = 1，其余自动为 0。递推得 f[2] = 1、f[3] = 2、f[4] = 3、f[5] = 5、f[6] = 8、f[7] = 13。循环条件是 i < 8，最后算到 f[7]，正好是所求。选项 21 是把 f[8] 也算了（把 < 看成 <=）；选项 8 是 f[6]。',
  },
  {
    id: 'rd-l5-bubble',
    level: 5,
    title: '冒泡排序后的中间元素',
    point: '相邻交换把大数推到末尾，循环边界 4 - i',
    kind: 'output',
    code: `#include <iostream>
using namespace std;

int main() {
    int a[5] = {5, 2, 4, 1, 3};
    for (int i = 0; i < 4; i++) {
        for (int j = 0; j < 4 - i; j++) {
            if (a[j] > a[j + 1]) swap(a[j], a[j + 1]);
        }
    }
    cout << a[2];
    return 0;
}`,
    options: ['2', '3', '4', '1'],
    answerIndex: 1,
    explanation:
      '这是升序冒泡：每轮把当前未排序部分的最大值换到末尾。排完数组是 1 2 3 4 5，a[2] 是第三个数 3。若不想完整模拟，也可以只看「排完是升序」这一点直接定位。选项 2 对应 a[1]，选项 4 对应 a[3]，都是下标数错。',
  },
  {
    id: 'rd-l5-bsearch',
    level: 5,
    title: '二分找 7 需要几次',
    point: 'mid 取整方向决定下一次区间',
    kind: 'output',
    code: `#include <iostream>
using namespace std;

int main() {
    int a[8] = {1, 2, 3, 4, 5, 6, 7, 8};
    int l = 0, r = 7, cnt = 0;
    while (l <= r) {
        int m = (l + r) / 2;
        cnt++;
        if (a[m] == 7) break;
        if (a[m] < 7) l = m + 1;
        else r = m - 1;
    }
    cout << cnt;
    return 0;
}`,
    options: ['2', '3', '4', '7'],
    answerIndex: 1,
    explanation:
      '第一轮 l = 0、r = 7，m = 3，a[3] = 4 < 7，所以 l = 4，cnt = 1。第二轮 l = 4、r = 7，m = 5，a[5] = 6 < 7，所以 l = 6，cnt = 2。第三轮 l = 6、r = 7，m = 6，a[6] = 7，命中 break，cnt = 3。注意 mid 是向下取整，所以 (0 + 7) / 2 = 3 而不是 4。',
  },

  // ── 6 级：前缀和、结构体、递归 ──────────────────────────────────
  {
    id: 'rd-l6-prefix',
    level: 6,
    title: '前缀和求区间和',
    point: 'pre[i] 表示前 i 个元素之和，区间用 pre[r] - pre[l-1]',
    kind: 'output',
    code: `#include <iostream>
using namespace std;

int main() {
    int a[6] = {2, 5, 1, 4, 3, 6};
    int pre[7] = {0};
    for (int i = 1; i <= 6; i++) {
        pre[i] = pre[i - 1] + a[i - 1];
    }
    cout << pre[5] - pre[1];
    return 0;
}`,
    options: ['13', '15', '11', '18'],
    answerIndex: 0,
    explanation:
      'pre[1] = 2、pre[2] = 7、pre[3] = 8、pre[4] = 12、pre[5] = 15。pre[5] - pre[1] = 13，正好是 a[1] + a[2] + a[3] + a[4] = 5 + 1 + 4 + 3 = 13。这里的下标关系是本题唯一的坑：pre 从 1 开始、a 从 0 开始，pre[i] 存的是 a[0..i-1]。选项 15 忘了减 pre[1]。',
  },
  {
    id: 'rd-l6-struct',
    level: 6,
    title: '结构体数组里找最高分',
    point: '整条记录赋值，同分不替换（严格大于）',
    kind: 'output',
    code: `#include <iostream>
#include <string>
using namespace std;

struct P {
    string name;
    int score;
};

int main() {
    P p[3] = {{"A", 80}, {"B", 95}, {"C", 80}};
    P best = p[0];
    for (int i = 1; i < 3; i++) {
        if (p[i].score > best.score) best = p[i];
    }
    cout << best.name << " " << best.score;
    return 0;
}`,
    options: ['B 95', 'A 80', 'C 80', 'A 80 C 80'],
    answerIndex: 0,
    explanation:
      'best 初值是第 0 条 A/80。i = 1 时 95 > 80，整条记录被替换成 B/95；i = 2 时 80 > 95 不成立，不做替换。所以输出 B 95。注意两个细节：一是必须整条记录替换（best = p[i]），只改分数会错配名字；二是用 > 而不是 >=，否则并列时会保留最后一个人。',
  },
  {
    id: 'rd-l6-hanoi',
    level: 6,
    title: '汉诺塔步数递归',
    point: 'h(n) = 2 * h(n-1) + 1 的展开',
    kind: 'output',
    code: `#include <iostream>
using namespace std;

int h(int n) {
    if (n == 1) return 1;
    return 2 * h(n - 1) + 1;
}

int main() {
    cout << h(5);
    return 0;
}`,
    options: ['16', '31', '32', '15'],
    answerIndex: 1,
    explanation:
      '逐层展开：h(1) = 1，h(2) = 2 * 1 + 1 = 3，h(3) = 7，h(4) = 15，h(5) = 31。规律是 2^n - 1，n = 5 时为 31。选项 32 是 2^5 忘了减 1；选项 16 是 2^4；选项 15 是 h(4)。',
  },

  // ── 7 级：动态规划 ─────────────────────────────────────────────
  {
    id: 'rd-l7-lis',
    level: 7,
    title: '最长上升子序列长度',
    point: 'f[i] 以 i 结尾的最长上升子序列；内层只往前看',
    kind: 'output',
    code: `#include <iostream>
#include <algorithm>
using namespace std;

int main() {
    int a[6] = {3, 1, 4, 1, 5, 2};
    int f[6] = {1, 1, 1, 1, 1, 1};
    for (int i = 1; i < 6; i++) {
        for (int j = 0; j < i; j++) {
            if (a[j] < a[i]) f[i] = max(f[i], f[j] + 1);
        }
    }
    cout << *max_element(f, f + 6);
    return 0;
}`,
    options: ['3', '4', '5', '6'],
    answerIndex: 0,
    explanation:
      '逐个推 f：i = 0 →1；i = 1（a = 1）前面没有更小的 →1；i = 2（a = 4）可取 3 或 1 →2；i = 3（a = 1）→1；i = 4（a = 5）前面 3、1、4、1 都更小，最好的是 f[2] = 2 →3；i = 5（a = 2）只有 1 比它小 →2。最大值 3，对应子序列 1 4 5。选项 4 常用错误的「连续上升段」思路；选项 6 是数组长度。',
  },
  {
    id: 'rd-l7-knapsack',
    level: 7,
    title: '0/1 背包结果',
    point: '一维背包必须倒序枚举容量',
    kind: 'output',
    code: `#include <iostream>
#include <algorithm>
using namespace std;

int main() {
    int w[3] = {2, 3, 4};
    int v[3] = {3, 4, 5};
    int dp[7] = {0};
    for (int i = 0; i < 3; i++) {
        for (int c = 6; c >= w[i]; c--) {
            dp[c] = max(dp[c], dp[c - w[i]] + v[i]);
        }
    }
    cout << dp[6];
    return 0;
}`,
    options: ['7', '8', '9', '12'],
    answerIndex: 1,
    explanation:
      '容量 6 的可行组合：装 (2,3) 与 (4,5) → 重量 6、价值 3 + 5 = 8；装 (2,3) 与 (3,4) → 重量 5、价值 7（还剩 1 装不下任何物品）；装 (3,4) 与 (4,5) → 重量 7 超重。所以最优是 8。这里真正要记的是内层 c 必须从 6 倒着减：一维 dp 里正序枚举会让同一件物品被重复加入（完全背包的错误写法），倒序才能保证 dp[c - w[i]] 还是「上一轮」的值。',
  },

  // ── 8 级：图论 ─────────────────────────────────────────────────
  {
    id: 'rd-l8-floyd',
    level: 8,
    title: 'Floyd 求 0 到 4 最短路',
    point: '三重循环 k 在最外层；INF 相加不能溢出',
    kind: 'output',
    code: `#include <iostream>
#include <algorithm>
using namespace std;

int main() {
    const int INF = 1000000;
    int g[5][5] = {
        {0, 2, 5, INF, INF},
        {INF, 0, 1, 4, INF},
        {INF, INF, 0, 1, INF},
        {INF, INF, INF, 0, 3},
        {INF, INF, INF, INF, 0},
    };
    for (int k = 0; k < 5; k++)
        for (int i = 0; i < 5; i++)
            for (int j = 0; j < 5; j++)
                g[i][j] = min(g[i][j], g[i][k] + g[k][j]);
    cout << g[0][4];
    return 0;
}`,
    options: ['7', '9', '6', '1000000'],
    answerIndex: 0,
    explanation:
      '邻接矩阵给出的边是 0→1 权 2、0→2 权 5、1→2 权 1、1→3 权 4、2→3 权 1、3→4 权 3。走 0→1→2→3→4 权 2 + 1 + 1 + 3 = 7；走 0→2→3→4 权 5 + 1 + 3 = 9。Floyd 会把 7 更新到 g[0][4]，所以输出 7。k 必须在最外层，否则中间点组合不全；INF 取 1000000 而不是 INT_MAX 就是为了避免 INF + INF 溢出。',
  },
  {
    id: 'rd-l8-bfs',
    level: 8,
    title: 'BFS 求无权图最短步数',
    point: 'BFS 按层扩展，第一次到达即最短',
    kind: 'output',
    code: `#include <iostream>
#include <queue>
#include <vector>
using namespace std;

int main() {
    vector<int> g[6] = {{1, 2}, {0, 3}, {0, 3}, {1, 2, 4}, {3, 5}, {4}};
    int dist[6];
    for (int i = 0; i < 6; i++) dist[i] = -1;
    queue<int> q;
    dist[0] = 0;
    q.push(0);
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        for (int v : g[u]) {
            if (dist[v] == -1) {
                dist[v] = dist[u] + 1;
                q.push(v);
            }
        }
    }
    cout << dist[5];
    return 0;
}`,
    options: ['2', '3', '4', '-1'],
    answerIndex: 2,
    explanation:
      '按层推：dist[0] = 0。第一层是 0 的邻居 1、2，dist 都为 1。第二层从 1 出发，它的邻居 0（已访问）、3（未访问）→ dist[3] = 2；2 的邻居 0、3 都已访问。第三层从 3 出发，邻居 4 → dist[4] = 3。第四层从 4 出发，邻居 5 → dist[5] = 4。因此输出 4。BFS 的关键性质是「第一次到达就是最短」，因为队列严格按层出队；换成 DFS 时第一次到达的路径不一定最短。',
  },
  {
    id: 'rd-l8-bitmask',
    level: 8,
    title: '位运算枚举子集',
    point: 'n 个元素的子集共 2^n 个；(mask >> i) & 1 判位',
    kind: 'output',
    code: `#include <iostream>
using namespace std;

int main() {
    int a[3] = {1, 2, 4};
    int cnt = 0;
    for (int mask = 0; mask < (1 << 3); mask++) {
        int sum = 0;
        for (int i = 0; i < 3; i++) {
            if ((mask >> i) & 1) sum += a[i];
        }
        if (sum == 6) cnt++;
    }
    cout << cnt;
    return 0;
}`,
    options: ['1', '2', '3', '4'],
    answerIndex: 0,
    explanation:
      'a = {1, 2, 4}，mask 从 000 枚举到 111 共 8 个子集。逐个算和：000 → 0；001 → 1；010 → 2；011 → 3；100 → 4；101 → 5；110 → 6（{2, 4}）；111 → 7（{1, 2, 4}）。等于 6 的只有 110 一个，所以 cnt = 1。注意 (mask >> i) & 1 读的是第 i 位，对应 a[i]；若把判定改成 sum >= 6，答案会变成 2（110 与 111 都满足）。',
  },
];

// 扩展题库单独存放，避免单文件过长
export const READING_ITEMS: IReadingItem[] = [...BASE_ITEMS, ...READING_EXTRA];
