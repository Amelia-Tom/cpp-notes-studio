// EXPORTS: READING_EXTRA（「程序阅读 / 程序填空」扩展题库，24 题）

import type { IReadingItem } from './reading';

 /**
 * 每题都经过编译运行校验：
 *  - output 题：程序实际输出 == options[answerIndex]
 *  - blank 题：把 ___ 替换成 answers[0] 后编译运行，输出 == expected
 */
export const READING_EXTRA: IReadingItem[] = [
  // ── 1 级：整型与浮点 ────────────────────────────────────────────
  {
    id: 'rd2-l1-double',
    level: 1,
    title: 'int 除法先算再转 double',
    point: '除号两边都是 int 时先做整除，结果再被转成 double',
    kind: 'output',
    code: `#include <iostream>
using namespace std;

int main() {
    int a = 7;
    double b = a / 2;
    cout << b;
    return 0;
}`,
    options: ['3', '3.5', '4', '3.0'],
    answerIndex: 0,
    explanation:
      'a / 2 的两个操作数都是 int，所以先做整除得 3；然后才把 3 转成 double 存进 b，输出就是 3（double 打印 3 不带小数点）。想得到 3.5 必须写 a / 2.0 或 static_cast<double>(a) / 2，让除法一开始就是浮点运算。',
  },
  {
    id: 'rd2-l1-concat',
    level: 1,
    title: '连续输出不做加法',
    point: '<< 是「依次输出」，不是加法',
    kind: 'output',
    code: `#include <iostream>
using namespace std;

int main() {
    int x = 1, y = 2;
    cout << x << y << x + y;
    return 0;
}`,
    options: ['123', '33', '1 2 3', '122'],
    answerIndex: 0,
    explanation:
      'cout << x 输出 1，cout << y 输出 2，最后 cout << x + y 先算 1 + 2 = 3 再输出。三段紧贴着没有任何分隔符（没有空格、没有 endl），拼起来就是 123。如果中间写 " " 才会变成 1 2 3。',
  },

  // ── 2 级：嵌套循环与数位 ────────────────────────────────────────
  {
    id: 'rd2-l2-nested',
    level: 2,
    title: '内层依赖外层的星号塔',
    point: '内层循环次数随 i 变化；外层每轮末尾还有一次输出',
    kind: 'output',
    code: `#include <iostream>
using namespace std;

int main() {
    for (int i = 0; i < 3; i++) {
        for (int j = 0; j < i; j++) cout << "*";
        cout << i;
    }
    return 0;
}`,
    options: ['0*1**2', '0*1*2', '012', '***012'],
    answerIndex: 0,
    explanation:
      'i = 0：内层 j < 0 一次都不执行，直接输出 0。i = 1：内层跑 1 次输出一个 *，再输出 1，得 *1。i = 2：内层跑 2 次输出 **，再输出 2，得 **2。三段连起来是 0*1**2。数星星个数时别把「再输出 i」也算成一次循环。',
  },
  {
    id: 'rd2-l2-digit',
    level: 2,
    title: '数位拆解统计位数',
    point: 'n /= 10 每次去掉最后一位，直到 0',
    kind: 'output',
    code: `#include <iostream>
using namespace std;

int main() {
    int n = 407, cnt = 0;
    while (n > 0) {
        n /= 10;
        cnt++;
    }
    cout << cnt;
    return 0;
}`,
    options: ['3', '4', '2', '0'],
    answerIndex: 0,
    explanation:
      '407 → 40（cnt = 1）→ 4（cnt = 2）→ 0（cnt = 3），循环条件 n > 0 不成立退出。所以是 3 位。注意 0 本身进不了循环，位数统计要单独特判。选项 4 是「循环看成了 >= 0」或者多算一轮的错。',
  },

  // ── 3 级：字符串 ────────────────────────────────────────────────
  {
    id: 'rd2-l3-string',
    level: 3,
    title: '字符串下标与长度',
    point: 's[1] 是第二个字符；size() 不含结尾的 \\0',
    kind: 'output',
    code: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string s = "hello";
    cout << s[1] << s.size();
    return 0;
}`,
    options: ['e5', 'h5', 'e4', 'ello5'],
    answerIndex: 0,
    explanation:
      '下标从 0 开始：s[0] 是 h、s[1] 是 e。size() 返回字符个数 5（不含结尾的 \'\\0\'）。两段紧贴着输出就是 e5。选项 h5 是误以为下标从 1 开始；e4 是误以为 size() 不含最后一个字符。',
  },

  // ── 4 级：函数传参 ──────────────────────────────────────────────
  {
    id: 'rd2-l4-byvalue',
    level: 4,
    title: '值传递改不了实参',
    point: '形参是实参的副本；想改实参要用引用或指针',
    kind: 'output',
    code: `#include <iostream>
using namespace std;

void add(int x) {
    x = x + 1;
}

int main() {
    int a = 5;
    add(a);
    cout << a;
    return 0;
}`,
    options: ['5', '6', '1', '0'],
    answerIndex: 0,
    explanation:
      'add 的形参 x 是 a 的副本，函数里把 x 改成 6 只改副本，函数结束副本销毁，a 仍然是 5。这就是「值传递」。把签名写成 void add(int &x) 才会真正修改 a，输出变 6。选项 6 正是忽略引用与否的典型错。',
  },

  // ── 5 级：二分 ─────────────────────────────────────────────────
  {
    id: 'rd2-l5-sqrt',
    level: 5,
    title: '二分求平方根的整数部分',
    point: 'ans 记录最后一个满足条件的 m；边界要动到 m±1',
    kind: 'output',
    code: `#include <iostream>
using namespace std;

int main() {
    int l = 1, r = 100, ans = 0;
    while (l <= r) {
        int m = (l + r) / 2;
        if (m * m <= 50) {
            ans = m;
            l = m + 1;
        } else {
            r = m - 1;
        }
    }
    cout << ans;
    return 0;
}`,
    options: ['7', '8', '6', '25'],
    answerIndex: 0,
    explanation:
      '7 × 7 = 49 ≤ 50，8 × 8 = 64 > 50，所以答案是 7。二分过程：m = 50 太大 → r = 49；m = 25 太大 → r = 24；m = 12 → r = 11；m = 6，36 ≤ 50 → ans = 6、l = 7；m = 9 → r = 8；m = 7，49 ≤ 50 → ans = 7、l = 8，此时 l > r 结束。关键点是 ans 只记「满足条件」的值，不满足的绝不能记。',
  },

  // ── 6 级：排序取中位 ────────────────────────────────────────────
  {
    id: 'rd2-l6-median',
    level: 6,
    title: '排序后的中间元素',
    point: 'sort 左闭右开：sort(a, a + n)',
    kind: 'output',
    code: `#include <iostream>
#include <algorithm>
using namespace std;

int main() {
    int a[5] = {9, 3, 7, 1, 5};
    sort(a, a + 5);
    cout << a[2];
    return 0;
}`,
    options: ['5', '7', '3', '9'],
    answerIndex: 0,
    explanation:
      'sort 默认升序，排完是 1 3 5 7 9；a[2] 是第三个元素 5，也就是中位数。注意 sort 的第二个参数是「结束位置的下一个」，写 a + 5 才覆盖 5 个元素，写 a + 4 会漏掉最后一个。',
  },

  // ── 7 级：递推 ─────────────────────────────────────────────────
  {
    id: 'rd2-l7-stairs',
    level: 7,
    title: '爬楼梯方案数',
    point: 'f[i] = f[i-1] + f[i-2]，初值决定整体平移',
    kind: 'output',
    code: `#include <iostream>
using namespace std;

int main() {
    long long f[10] = {1, 1};
    for (int i = 2; i <= 5; i++) {
        f[i] = f[i - 1] + f[i - 2];
    }
    cout << f[5];
    return 0;
}`,
    options: ['8', '5', '13', '6'],
    answerIndex: 0,
    explanation:
      '初值 f[0] = 1、f[1] = 1。递推：f[2] = 2、f[3] = 3、f[4] = 5、f[5] = 8。这其实就是斐波那契，只是下标从 0 开始，5 级台阶 8 种走法。选项 13 是把 f[6] 也算了；选项 5 是 f[4]。',
  },

  // ── 8 级：异或 ─────────────────────────────────────────────────
  {
    id: 'rd2-l8-xor',
    level: 8,
    title: '异或消去成对出现的数',
    point: 'a ^ a = 0，a ^ 0 = a；异或满足交换律',
    kind: 'output',
    code: `#include <iostream>
using namespace std;

int main() {
    int a[5] = {4, 1, 4, 2, 1};
    int x = 0;
    for (int i = 0; i < 5; i++) {
        x ^= a[i];
    }
    cout << x;
    return 0;
}`,
    options: ['2', '4', '1', '0'],
    answerIndex: 0,
    explanation:
      '异或满足交换律和结合律，成对出现的 4、4 与 1、1 会互相抵消成 0，最后剩下的就是只出现一次的 2。这是「找出唯一出现奇数次的数」的标准做法，空间 O(1)。选项 0 是误以为全部抵消。',
  },

  // ── 1 级：程序填空 ─────────────────────────────────────────────
  {
    id: 'rd2b-l1-loop',
    level: 1,
    title: '补全 1 到 n 的循环条件',
    point: 'for 的第二个表达式是「继续循环」的条件',
    kind: 'blank',
    code: `#include <iostream>
using namespace std;

int main() {
    int n = 5, sum = 0;
    for (int i = 1; ___ ; i++) {
        sum += i;
    }
    cout << sum;
    return 0;
}`,
    answers: ['i <= n', 'i<=n'],
    expected: '15',
    explanation:
      '要累加 1 到 n（含 n），循环必须跑 i = 1、2、3、4、5，所以条件写 i <= n。写成 i < n 会少加最后一个 5，得到 10；写成 i <= n + 1 会多加 6，得到 21。填完输出 15 才对。',
  },
  {
    id: 'rd2b-l1-swap',
    level: 1,
    title: '交换两个变量',
    point: 'swap 一步完成交换，别写 a = b; b = a;',
    kind: 'blank',
    code: `#include <iostream>
#include <utility>
using namespace std;

int main() {
    int a = 3, b = 8;
    ___;
    cout << a << " " << b;
    return 0;
}`,
    answers: ['swap(a, b)', 'swap(a,b)', 'swap(b, a)'],
    expected: '8 3',
    explanation:
      'swap(a, b) 会把 a 与 b 的值互换，输出 8 3。手写交换必须先存临时变量：int t = a; a = b; b = t;。若写成 a = b; b = a;，第一句就把 a 覆盖成 8，第二句再赋值还是 8，结果是 8 8。',
  },

  // ── 2 级：程序填空 ─────────────────────────────────────────────
  {
    id: 'rd2b-l2-leap',
    level: 2,
    title: '补全闰年判断条件',
    point: '能被 4 整除且不能被 100 整除，或能被 400 整除',
    kind: 'blank',
    code: `#include <iostream>
using namespace std;

int main() {
    int y = 2024;
    if ( ___ )
        cout << "leap";
    else
        cout << "common";
    return 0;
}`,
    answers: [
      '(y % 4 == 0 && y % 100 != 0) || y % 400 == 0',
      '(y%4==0&&y%100!=0)||y%400==0',
    ],
    expected: 'leap',
    explanation:
      '2024 能被 4 整除、不能被 100 整除，是闰年。完整条件不能写漏：只写 y % 4 == 0 会把 1900 判成闰年（实际不是）；写成 y % 4 == 0 || y % 400 == 0 又会把 2000 之外的 100 的倍数判错。括号也别丢，|| 的优先级低于 &&。',
  },
  {
    id: 'rd2b-l2-max',
    level: 2,
    title: '补全打擂台的比较',
    point: '严格大于才更新，保证并列时保留第一个',
    kind: 'blank',
    code: `#include <iostream>
using namespace std;

int main() {
    int a[4] = {3, 9, 2, 7};
    int mx = a[0];
    for (int i = 1; i < 4; i++) {
        if ( ___ ) mx = a[i];
    }
    cout << mx;
    return 0;
}`,
    answers: ['a[i] > mx', 'a[i]>mx'],
    expected: '9',
    explanation:
      '打擂台：mx 先放第一个元素，之后每个元素跟 mx 比，比它大就换掉。填 a[i] > mx 得到 9。填反向 mx > a[i] 会一直保留 3；填 a[i] >= mx 数值结果一样，但并列时会保留最后一个，遇到「求最大值位置」的题就会错位。',
  },

  // ── 3 级：程序填空 ─────────────────────────────────────────────
  {
    id: 'rd2b-l3-reverse',
    level: 3,
    title: '补全逆序输出的终止条件',
    point: '下标从 n-1 减到 0，写成 i >= 0',
    kind: 'blank',
    code: `#include <iostream>
using namespace std;

int main() {
    int a[5] = {1, 2, 3, 4, 5};
    for (int i = 4; ___ ; i--) {
        cout << a[i];
    }
    return 0;
}`,
    answers: ['i >= 0', 'i>=0'],
    expected: '54321',
    explanation:
      'i 从 4 开始递减，要取到 a[0] 为止，所以条件写 i >= 0，输出 54321。写成 i > 0 会漏掉 a[0]，得到 5432；下标类型若写成 unsigned 还要小心 i-- 到 0 之后回绕成极大值，所以逆序循环的下标建议用 int。',
  },
  {
    id: 'rd2b-l3-chardigit',
    level: 3,
    title: '补全字符转数字',
    point: '数字字符的 ASCII 是连续的，减 \'0\' 就得到数值',
    kind: 'blank',
    code: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string s = "2026";
    int num = 0;
    for (int i = 0; i < (int)s.size(); i++) {
        num = num * 10 + ( ___ );
    }
    cout << num;
    return 0;
}`,
    answers: ["s[i] - '0'", 's[i]-\'0\''],
    expected: '2026',
    explanation:
      '字符 \'0\' 的 ASCII 是 48，\'1\' 是 49，依次连续，所以 s[i] - \'0\' 正好得到 0–9 的数字值。每轮 num * 10 把已有数字左移一位，再加新的一位，最终拼出 2026。直接写 s[i] 会按 ASCII 累加出错误的数。',
  },

  // ── 4 级：程序填空 ─────────────────────────────────────────────
  {
    id: 'rd2b-l4-fact',
    level: 4,
    title: '补全阶乘的递归式',
    point: 'n! = n × (n-1)!，基准是 n <= 1 返回 1',
    kind: 'blank',
    code: `#include <iostream>
using namespace std;

int f(int n) {
    if (n <= 1) return 1;
    return ___ ;
}

int main() {
    cout << f(5);
    return 0;
}`,
    answers: ['n * f(n - 1)', 'n*f(n-1)'],
    expected: '120',
    explanation:
      '递归式必须是 n * f(n - 1)：把问题缩小到 (n-1)! 再乘回 n。填 f(n - 1) 会丢掉乘以 n，结果恒为 1；填 f(n) 会无限递归爆栈。5! = 120。',
  },
  {
    id: 'rd2b-l4-diag',
    level: 4,
    title: '补全主对角线判断',
    point: '主对角线是行下标等于列下标',
    kind: 'blank',
    code: `#include <iostream>
using namespace std;

int main() {
    int a[3][3] = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};
    int s = 0;
    for (int i = 0; i < 3; i++) {
        for (int j = 0; j < 3; j++) {
            if ( ___ ) s += a[i][j];
        }
    }
    cout << s;
    return 0;
}`,
    answers: ['i == j', 'i==j'],
    expected: '15',
    explanation:
      '主对角线元素是 a[0][0]、a[1][1]、a[2][2]，条件就是 i == j，和是 1 + 5 + 9 = 15。副对角线要写 i + j == n - 1；若写 i <= j 会变成上三角和，得到 26。',
  },

  // ── 5 级：程序填空 ─────────────────────────────────────────────
  {
    id: 'rd2b-l5-bubble',
    level: 5,
    title: '补全冒泡的相邻比较边界',
    point: '第 i 轮之后末尾 i 个已就位，所以内层到 n-1-i',
    kind: 'blank',
    code: `#include <iostream>
#include <utility>
using namespace std;

int main() {
    int a[5] = {5, 1, 4, 2, 3};
    for (int i = 0; i < 4; i++) {
        for (int j = 0; j < ___ ; j++) {
            if (a[j] > a[j + 1]) swap(a[j], a[j + 1]);
        }
    }
    for (int i = 0; i < 5; i++) cout << a[i];
    return 0;
}`,
    answers: ['4 - i', 'n - 1 - i', '4-i'],
    expected: '12345',
    explanation:
      '比较的是 a[j] 与 a[j + 1]，所以 j 最大只能到 n - 2；再减去已经就位的 i 个，内层条件就是 j < n - 1 - i，本题 n = 5 即 j < 4 - i。写 j < 4 虽然也能排好（多比较几轮），写 j <= 4 - i 会访问 a[5] 越界，这是最常见的错误。',
  },
  {
    id: 'rd2b-l5-prefix',
    level: 5,
    title: '补全前缀和递推',
    point: 'pre[i] = pre[i-1] + a[i-1]，注意下标错开一位',
    kind: 'blank',
    code: `#include <iostream>
using namespace std;

int main() {
    int a[4] = {3, 1, 4, 2};
    int pre[5] = {0};
    for (int i = 1; i <= 4; i++) {
        pre[i] = ___ ;
    }
    cout << pre[4] - pre[1];
    return 0;
}`,
    answers: ['pre[i - 1] + a[i - 1]', 'pre[i-1]+a[i-1]'],
    expected: '7',
    explanation:
      'pre[i] 表示前 i 个元素之和，所以等于「前 i-1 个的和」加上「第 i 个元素」，而第 i 个元素在数组里是 a[i-1]。填 pre[i] + a[i] 会自我累加且越界。本题 pre[4] = 10、pre[1] = 3，差 7 正好是 a[1] + a[2] + a[3] = 1 + 4 + 2。',
  },

  // ── 6 级：程序填空 ─────────────────────────────────────────────
  {
    id: 'rd2b-l6-fib',
    level: 6,
    title: '补全递推数组的转移式',
    point: 'f[i] 只依赖前两项；循环从 2 开始',
    kind: 'blank',
    code: `#include <iostream>
using namespace std;

int main() {
    long long f[8] = {0, 1};
    for (int i = 2; i < 8; i++) {
        f[i] = ___ ;
    }
    cout << f[7];
    return 0;
}`,
    answers: ['f[i - 1] + f[i - 2]', 'f[i-1]+f[i-2]'],
    expected: '13',
    explanation:
      '初值 f[0] = 0、f[1] = 1，之后每项是前两项之和：f[2..7] = 1, 2, 3, 5, 8, 13，所以 f[7] = 13。填 f[i] + f[i-1] 会用到还没算的 f[i]（0），结果恒为 0；循环必须从 i = 2 开始，否则会覆盖初值。',
  },
  {
    id: 'rd2b-l6-cmp',
    level: 6,
    title: '补全结构体排序的比较函数',
    point: 'cmp 返回「a 是否应排在 b 前面」；降序用 >',
    kind: 'blank',
    code: `#include <iostream>
#include <algorithm>
#include <string>
using namespace std;

struct P {
    string name;
    int score;
};

bool cmp(const P &a, const P &b) {
    return ___ ;
}

int main() {
    P p[3] = {{"A", 80}, {"B", 95}, {"C", 70}};
    sort(p, p + 3, cmp);
    for (int i = 0; i < 3; i++) cout << p[i].name;
    return 0;
}`,
    answers: ['a.score > b.score', 'a.score>b.score'],
    expected: 'BAC',
    explanation:
      'cmp(a, b) 为真表示 a 应该排在 b 前面。想要分数从高到低，就是「a 分数更大时排在前面」，写 a.score > b.score，排完是 B(95)、A(80)、C(70)，输出 BAC。写 a.score < b.score 会变升序 CAB；返回值用 a.score - b.score 在差值极大时还可能溢出。',
  },

  // ── 7 级：程序填空 ─────────────────────────────────────────────
  {
    id: 'rd2b-l7-knapsack',
    level: 7,
    title: '补全 0/1 背包的转移',
    point: 'dp[c] = max(不装, 装)：装的时候要退回 w[i] 容量',
    kind: 'blank',
    code: `#include <iostream>
#include <algorithm>
using namespace std;

int main() {
    int w[3] = {2, 3, 4};
    int v[3] = {3, 4, 5};
    int dp[7] = {0};
    for (int i = 0; i < 3; i++) {
        for (int c = 6; c >= w[i]; c--) {
            dp[c] = ___ ;
        }
    }
    cout << dp[6];
    return 0;
}`,
    answers: [
      'max(dp[c], dp[c - w[i]] + v[i])',
      'max(dp[c],dp[c-w[i]]+v[i])',
    ],
    expected: '8',
    explanation:
      '对每个容量 c，要么不装第 i 件（dp[c]），要么装（价值 v[i] 加上剩余容量 dp[c - w[i]]）。取两者的较大值。本题容量 6 时最优是装 (2,3) 与 (4,5)，价值 8。注意内层必须倒序：正序会让同一件物品被重复装进去，那就是完全背包了。',
  },

  // ── 8 级：程序填空 ─────────────────────────────────────────────
  {
    id: 'rd2b-l8-bfs',
    level: 8,
    title: '补全 BFS 的取队头',
    point: '队列 FIFO：取头用 front()，弹出用 pop()',
    kind: 'blank',
    code: `#include <iostream>
#include <queue>
#include <vector>
using namespace std;

int main() {
    vector<int> g[5] = {{1}, {2}, {3}, {4}, {}};
    int layer[5] = {-1, -1, -1, -1, -1};
    queue<int> q;
    layer[0] = 0;
    q.push(0);
    while (!q.empty()) {
        int u = ___ ;
        q.pop();
        for (int v : g[u]) {
            if (layer[v] == -1) {
                layer[v] = layer[u] + 1;
                q.push(v);
            }
        }
    }
    cout << layer[4];
    return 0;
}`,
    answers: ['q.front()', 'q.front() ', 'front()'],
    expected: '4',
    explanation:
      'BFS 的套路是「取队头 → 弹出 → 扩展未访问的邻居」。取队头是 q.front()，紧接着 q.pop() 把它删掉，两者不能颠倒，也不能用 q.back()（那是栈的行为）。本题是一条链 0→1→2→3→4，逐层推进得 layer[4] = 4。',
  },
];
