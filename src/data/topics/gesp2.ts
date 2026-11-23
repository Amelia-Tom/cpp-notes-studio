// EXPORTS: GESP2_TOPICS（进制与位运算、二维数组、递推）

import type { ITopic } from '../types';

/** GESP 三级：进制、补码与位运算 */
const baseBit: ITopic = {
  id: 'base-bit',
  stage: 'basic',
  order: 8,
  title: '进制、补码与位运算',
  subtitle: '把数字拆成一个个开关',
  minutes: 35,
  keywords: ['二进制', '十六进制', '补码', '位与', '异或', 'lowbit', 'bitset'],
  summary: '位权展开、进制的四种互转、补码表示、六个位运算符与七个常用技巧，全部配可运行代码。',
  sections: {
    concept: [
      '任何一个 r 进制数都可以按位权展开：从右往左第 k 位（k 从 0 开始）的权值是 r^k。所以二进制 1011 = 1×8 + 0×4 + 1×2 + 1×1 = 11。理解了位权，进制转换就不再是背口诀，而是「按权相加」和「不断除取余」两个动作。',
      '十进制转二进制用「除 2 取余、逆序排列」；二进制转十六进制用「四位一组」——因为 16 = 2⁴，每四位二进制正好对应一位十六进制，1011 就是 B。八进制同理是三位一组。反过来，十六进制转二进制把每一位展开成四位即可。C++ 里可以直接写二进制字面量 0b1011、八进制 011、十六进制 0x1F。',
      '计算机用补码存有符号整数。规则是：正数的补码等于原码；负数的补码等于「该位宽下的 2ⁿ 减 |x|」，等价于「原码取反再加一」。8 位下 -1 的补码是 1111 1111。补码的好处是减法和加法共用一套电路，而且 0 只有一种表示。',
      '补码带来的一个现象是溢出回绕：int 是 32 位，最大值 2147483647 再加 1 会变成 -2147483648。这不是 bug，而是补码环形结构的必然结果。所以累加、乘法的中间结果要估算量级，必要时提前用 long long。',
      '六个位运算符：&（与，两位都是 1 才得 1）、|（或，有一位是 1 就得 1）、^（异或，不同得 1）、~（按位取反）、<<（左移，右边补 0，等价乘以 2^k）、>>（右移，等价除以 2^k 并向负无穷取整）。它们都是逐位并行计算，比循环快得多。',
      '常用技巧很有用：判断奇偶 x & 1；取第 k 位 (x >> k) & 1；把第 k 位置 1 用 x | (1 << k)；清 0 用 x & ~(1 << k)；翻转用 x ^ (1 << k)；取最低位的 1 用 x & -x（lowbit，树状数组要用）；交换两个数可以 a ^= b, b ^= a, a ^= b。',
      '两个易错点：一是优先级，<< 和 >> 低于加减、高于关系运算，写 a & 1 == 0 会被解析成 a & (1 == 0)；二是 1 << 31 在 int 下溢出成负数，需要 64 位时一定写 1LL << k。另外对负数右移，标准保证是算术右移（向负无穷取整），不是简单的「去掉最低位」。',
    ],
    analogy:
      '把一个整数想成一排开关：32 个开关从左到右排开，每个开关只有开（1）和关（0）。位运算就是对这一排开关同时下手——与是「两个都开才亮」，或是「一个开就亮」，异或是「不一样才亮」。',
    keyPoints: [
      '位权展开是进制转换的根：第 k 位权值是 r^k。',
      '二进制 ↔ 十六进制靠四位一组，二进制 ↔ 八进制靠三位一组。',
      '负数补码 = 2ⁿ − |x|，所以 -1 在任意位宽下都是全 1。',
      'x & -x 取出最低位的 1，是树状数组等结构的基石。',
      '1 << 31 会溢出，需要 64 位时写 1LL << k。',
    ],
    syntax: [
      'cout << 0b1011 << " " << 011 << " " << 0x1F; —— 二、八、十六进制字面量的写法。',
      'cout << hex << 255; 输出 ff；cout << oct << 8; 输出 10；用 dec 恢复十进制。',
      'bitset<8>(n) 可直接按位打印或用 .count() 数 1 的个数，调试位运算极其方便。',
      'x & 1 判断奇偶；x >> k & 1 取第 k 位；x | (1 << k) 置 1；x & ~(1 << k) 清 0。',
      'x & -x 取 lowbit；__builtin_popcount(x) 数 1，__builtin_ctz(x) 数末尾 0 的个数。',
      'x << k 等价 x * 2^k；x >> k 等价 x / 2^k 且向下取整（负数会往更小的方向走）。',
      '交换：a ^= b; b ^= a; a ^= b; —— 不需要额外变量，但可读性差，平时仍建议用临时变量。',
    ],
    pitfalls: [
      {
        wrong: 'int mask = 1 << 31;  // 想表示第 31 位',
        right: 'long long mask = 1LL << 31;',
        reason: '1 是 int 型，左移 31 位结果溢出成负数（-2147483648），后续运算全部错乱。',
      },
      {
        wrong: 'if (a & 1 == 0)  // 想判断偶数',
        right: 'if ((a & 1) == 0)',
        reason: '== 的优先级高于 &，实际被解析成 a & (1 == 0)，也就是 a & 0，永远为假。',
      },
      {
        wrong: 'cout << (x >> 3) 当作向下取整除法',
        right: '负数场景用 floor((double)x / 8) 或直接写 x / 8',
        reason: '对负数右移是向负无穷取整，-9 >> 3 得到 -2，而 -9 / 8 在 C++ 里是 -1，两者不同。',
      },
    ],
  },
  template: {
      title: 'bits.cpp',
      explain: '演示位运算的四个高频用途：统计 1 的个数、打印二进制、取 lowbit、区间异或（用前缀异或）。',
      code: `#include <iostream>              // 输入输出
#include <bitset>                // bitset 用来直观打印二进制
using namespace std;

int countOne(int x) {            // 统计二进制里 1 的个数
    int cnt = 0;
    while (x > 0) {
        x &= x - 1;              // 每次抹掉最低位的 1，循环次数等于 1 的个数
        cnt++;
    }
    return cnt;
}

int main() {
    int n = 46;                             // 二进制是 101110
    cout << countOne(n) << endl;            // 4 个 1
    cout << bitset<8>(n) << endl;           // 打印 00101110，方便肉眼核对
    cout << (n & -n) << endl;               // lowbit：取出最低位的 1，得 2

    int pos = 3;                            // 取第 3 位（从 0 开始数）
    cout << ((n >> pos) & 1) << endl;       // 101110 的第 3 位是 1
    cout << (n | (1 << pos)) << endl;       // 把第 3 位置 1（本来就是 1）
    cout << (n & ~(1 << pos)) << endl;      // 把第 3 位清 0，得到 38
    return 0;
}`,
  },
  examples: [
      {
        id: 'base-bit-1',
        title: '十进制转任意进制',
        difficulty: '入门',
        problem: '读入整数 n（0 ≤ n ≤ 10⁹）与进制 r（2 ≤ r ≤ 16），输出 n 在 r 进制下的表示，10 以上用大写字母 A–F。',
        sample: '输入：255 16\n输出：FF',
        ideas: [
          '不断取余得到最低位，再整除 r 缩小问题。',
          '余数 0–15 要映射成字符 0–9 与 A–F。',
          '得到的字符是逆序的，需要倒着输出或翻转。',
        ],
        code: `#include <iostream>
#include <string>
using namespace std;

int main() {
    long long n, r;
    cin >> n >> r;
    if (n == 0) {                  // 0 要特判，否则循环一次都不进
        cout << 0 << endl;
        return 0;
    }
    string s = "";
    while (n > 0) {
        int rem = n % r;                             // 取最低位
        if (rem < 10) s += char('0' + rem);          // 0-9 直接转字符
        else s += char('A' + rem - 10);              // 10-15 映射成 A-F
        n /= r;                                      // 去掉最低位
    }
    for (int i = (int)s.size() - 1; i >= 0; i--) cout << s[i];  // 逆序输出
    cout << endl;
    return 0;
}`,
        time: 'O(log_r n)',
        space: 'O(log_r n)',
        takeaway: '进制转换就是「取余、整除」两步循环，余数从低位到高位产出，最后要倒着读。',
      },
      {
        id: 'base-bit-2',
        title: '只出现一次的数',
        difficulty: '进阶',
        problem: '有 2n+1 个整数，其中 n 个数各出现两次，只有一个数出现一次，求出这个数。要求只用一个额外变量。',
        sample: '输入：5\n4 1 2 1 2\n输出：4',
        ideas: [
          '异或的性质：a ^ a = 0，a ^ 0 = a，且满足结合律与交换律。',
          '把全部数异或起来，成对的数互相抵消，剩下的就是答案。',
          '不需要开数组，边读边异或即可，额外空间 O(1)。',
        ],
        code: `#include <iostream>
using namespace std;

int main() {
    int n, x, ans = 0;             // ans 的初值必须是 0，因为 0 ^ a = a
    cin >> n;
    for (int i = 1; i <= 2 * n + 1; i++) {
        cin >> x;                  // 边读边处理，不存数组
        ans ^= x;                  // 成对的数会被抵消成 0
    }
    cout << ans << endl;
    return 0;
}`,
        time: 'O(n)',
        space: 'O(1)',
        takeaway: '异或是最强的「消除重复」工具：相同抵消、不同保留，还能省掉整个数组。',
      },
      {
        id: 'base-bit-3',
        title: '子集枚举',
        difficulty: '挑战',
        problem: '给定 n（n ≤ 20）个整数，问有多少个非空子集的元素和恰好为 s。',
        sample: '输入：3 5\n1 2 3\n输出：2',
        ideas: [
          'n ≤ 20 时子集总数 2²⁰ ≈ 10⁶，可以用一个整数的二进制位表示「选不选」。',
          '枚举 mask 从 1 到 2ⁿ − 1，第 i 位为 1 表示选第 i 个数。',
          '统计和时用 (mask >> i) & 1 判断该位，累加对应数值。',
        ],
        code: `#include <iostream>
using namespace std;

int a[25];

int main() {
    int n, s;
    cin >> n >> s;
    for (int i = 0; i < n; i++) cin >> a[i];

    int ans = 0;
    for (int mask = 1; mask < (1 << n); mask++) {   // 枚举每个子集
        long long sum = 0;
        for (int i = 0; i < n; i++) {
            if ((mask >> i) & 1) sum += a[i];       // 第 i 位为 1 就选它
        }
        if (sum == s) ans++;
    }
    cout << ans << endl;
    return 0;
}`,
        time: 'O(2ⁿ · n)',
        space: 'O(n)',
        takeaway: '「选或不选」的组合问题，用一个整数的二进制位就能完整表达，这就是状态压缩的起点。',
      },
    ],
    homework: [
      '手算并上机验证：二进制 1101 的十进制值、十六进制 0x2F 的十进制值、十进制 100 的二进制表示。',
      '写程序读入一个整数，输出它的二进制中 1 的个数、最低位 1 的位置（从 0 开始）。',
      '解释为什么 8 位下 -1 的补码是 1111 1111，并说明「取反加一」的推导过程。',
      '用位运算实现「不借助临时变量交换两个整数」，并说明它相比临时变量法的优缺点。',
    ],
  gesp: [3],
};

/** GESP 四级：二维数组与多维数组 */
const matrix: ITopic = {
  id: 'matrix',
  stage: 'cert',
  order: 10,
  title: '二维数组与矩阵',
  subtitle: '把表格装进内存',
  minutes: 30,
  keywords: ['二维数组', '行优先', '矩阵乘法', '二维前缀和', '边界', '栈空间'],
  summary: '二维数组的内存布局、初始化方式、遍历与边界处理，矩阵加法、乘法与二维前缀和。',
  sections: {
    concept: [
      '二维数组逻辑上是一张表格，物理上仍是一段连续内存。C++ 采用「行优先」存储：a[0][0]、a[0][1] … a[0][m-1]、a[1][0] … 依次排开。这解释了两件事：一是同一行的元素地址相邻，二是按行遍历比按列遍历更快，因为缓存命中率高。',
      '声明 int a[3][4] 得到 3 行 4 列，下标范围是 0..2 与 0..3。写成 int a[3][4] = {{1,2,3,4},{5,6,7,8},{9,10,11,12}} 可以整体初始化；只写 = {0} 会把所有元素清零。全局数组默认全 0，局部数组不初始化就是随机值，这一点必须记死。',
      '二维数组可以理解成「数组的数组」：a[i] 本身是一个长度 4 的一维数组。所以把一维数组作为函数参数时写 int f(int a[], int n)，二维数组传参则必须写 int f(int a[][4], int n)，第二维长度不能省，因为编译器要靠它计算 a[i][j] 的偏移量。',
      '矩阵运算是最直接的应用。矩阵加法要求行列数相同，对应位置相加；矩阵乘法 A(m×k) × B(k×n) 得到 C(m×n)，其中 C[i][j] = Σ A[i][t] * B[t][j]，三重循环要走对顺序。乘法中最容易错的是把内层下标写混，以及忘记结果要先清零。',
      '二维前缀和把「求子矩阵和」从 O(面积) 降到 O(1)：pre[i][j] = pre[i-1][j] + pre[i][j-1] - pre[i-1][j-1] + a[i][j]，查询 (x1,y1) 到 (x2,y2) 时用 pre[x2][y2] - pre[x1-1][y2] - pre[x2][y1-1] + pre[x1-1][y1-1]。公式里那个「减了两次要加回来」的部分，是容斥思想。',
      '规模提醒：int a[1000][1000] 占约 4 MB，放在函数内部（栈）通常只有 1–8 MB 可用，很容易爆栈；放成全局变量（数据段）就能撑到几百 MB。所以比赛里大数组一律写在 main 外面。',
    ],
    analogy:
      '电影院座位表：每行每列都有编号，找第 3 排第 5 座要先走到第 3 排，再沿着这一排数到第 5 个——这正是「行优先」的寻址过程。',
    keyPoints: [
      '二维数组行优先连续存储，按行遍历更快。',
      '全局数组自动清零，局部数组不初始化是随机值。',
      '二维数组传参必须写第二维长度：int f(int a[][4])。',
      '矩阵乘法 C[i][j] = Σ A[i][t] * B[t][j]，结果要先清零。',
      '大数组放全局，避免栈溢出。',
    ],
    syntax: [
      'int a[3][4]; 声明 3 行 4 列；a[1][2] 访问第 2 行第 3 列。',
      'int a[3][4] = {{1,2,3,4},{5,6,7,8},{9,10,11,12}}; 逐行初始化。',
      'memset(a, 0, sizeof(a)); 把整个数组清零（比循环快，但要 #include <cstring>）。',
      'for (int i = 0; i < n; i++) for (int j = 0; j < m; j++) —— 标准双重遍历。',
      'a[i][j] 与 *(a[i] + j) 等价；&a[0][0] 是整块内存的起始地址。',
      '二维前缀和：pre[i][j] = pre[i-1][j] + pre[i][j-1] - pre[i-1][j-1] + a[i][j]。',
      'sizeof(a) 得到整块字节数，sizeof(a[0]) 是一行的字节数。',
    ],
    pitfalls: [
      {
        wrong: 'int a[1000][1000]; 写在 main 里面',
        right: '把大数组写到 main 外面（全局）',
        reason: '1000×1000 的 int 约占 4 MB，超过默认栈空间，运行时会直接崩溃（段错误），编译器不会提前提醒。',
      },
      {
        wrong: 'void f(int a[][], int n)',
        right: 'void f(int a[][4], int n)',
        reason: '编译器需要第二维长度才能算出 a[i][j] 的地址，省略第二维会编译失败。',
      },
      {
        wrong: '矩阵乘法时忘记把 c[i][j] 清零就直接 +=',
        right: '先 c[i][j] = 0; 再累加',
        reason: '局部数组初值是随机数，直接累加会得到完全错误的结果，这类错误在样例上未必暴露。',
      },
    ],
  },
  template: {
      title: 'matrix.cpp',
      explain: '读入两个矩阵并做乘法，同时演示边界、清零与遍历顺序。',
      code: `#include <iostream>              // 输入输出
using namespace std;

const int MAXN = 105;            // 全局常量，方便改规模
int a[MAXN][MAXN], b[MAXN][MAXN], c[MAXN][MAXN];  // 全局数组自动清零

int main() {
    int n, m, k;
    cin >> n >> m >> k;          // A 是 n×m，B 是 m×k，结果 n×k

    for (int i = 0; i < n; i++)
        for (int j = 0; j < m; j++)
            cin >> a[i][j];      // 按行读入 A

    for (int i = 0; i < m; i++)
        for (int j = 0; j < k; j++)
            cin >> b[i][j];      // 按行读入 B

    for (int i = 0; i < n; i++) {
        for (int j = 0; j < k; j++) {
            c[i][j] = 0;             // 必须清零，否则会累加随机值
            for (int t = 0; t < m; t++)
                c[i][j] += a[i][t] * b[t][j];  // 逐项乘积再求和
        }
    }

    for (int i = 0; i < n; i++) {
        for (int j = 0; j < k; j++) {
            cout << c[i][j];
            if (j < k - 1) cout << " ";        // 行末不多打空格
        }
        cout << endl;                          // 每行结束换行
    }
    return 0;
}`,
  },
  examples: [
      {
        id: 'matrix-1',
        title: '矩阵转置',
        difficulty: '入门',
        problem: '读入 n 行 m 列的矩阵，输出它的转置（m 行 n 列）。',
        sample: '输入：2 3\n1 2 3\n4 5 6\n输出：\n1 4\n2 5\n3 6',
        ideas: [
          '转置就是交换行列下标：新矩阵 b[j][i] = a[i][j]。',
          '输出时外层循环走列、内层走行，也可以直接按 b 输出。',
          '注意行列数要互换，输出循环边界不要沿用原矩阵的。',
        ],
        code: `#include <iostream>
using namespace std;

int a[105][105];

int main() {
    int n, m;
    cin >> n >> m;
    for (int i = 0; i < n; i++)
        for (int j = 0; j < m; j++)
            cin >> a[i][j];

    for (int j = 0; j < m; j++) {          // 外层走原矩阵的列
        for (int i = 0; i < n; i++) {      // 内层走原矩阵的行
            cout << a[i][j];
            if (i < n - 1) cout << " ";
        }
        cout << endl;
    }
    return 0;
}`,
        time: 'O(nm)',
        space: 'O(nm)',
        takeaway: '转置不需要新数组，把输出循环的行列顺序换过来就完成了。',
      },
      {
        id: 'matrix-2',
        title: '子矩阵求和（前缀和版）',
        difficulty: '进阶',
        problem: '给定 n×m 的矩阵，回答 q 次询问：求左上角 (x1,y1) 到右下角 (x2,y2) 的子矩阵元素和。n,m ≤ 1000，q ≤ 10⁵。',
        sample: '输入：3 3 2\n1 2 3\n4 5 6\n7 8 9\n1 1 2 2\n2 2 3 3\n输出：12 28',
        ideas: [
          '每次暴力求和是 O(面积 × q)，一定会超时。',
          '预处理二维前缀和，把「求一块矩形和」变成 O(1) 的四个前缀值加减。',
          '注意公式里的容斥：减了两块之后，左上角那块要加回来。',
        ],
        code: `#include <iostream>
using namespace std;

const int MAXN = 1005;
long long pre[MAXN][MAXN];       // 和可能很大，用 long long

int main() {
    int n, m, q;
    cin >> n >> m >> q;
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= m; j++) {
            long long x;
            cin >> x;
            pre[i][j] = pre[i - 1][j] + pre[i][j - 1] - pre[i - 1][j - 1] + x;  // 容斥构造
        }
    }
    while (q--) {
        int x1, y1, x2, y2;
        cin >> x1 >> y1 >> x2 >> y2;
        cout << pre[x2][y2] - pre[x1 - 1][y2] - pre[x2][y1 - 1] + pre[x1 - 1][y1 - 1] << endl;
    }
    return 0;
}`,
        time: 'O(nm + q)',
        space: 'O(nm)',
        takeaway: '二维前缀和的核心是容斥公式，多减的那块必须加回来，否则答案总是偏小。',
      },
      {
        id: 'matrix-3',
        title: '杨辉三角',
        difficulty: '入门',
        problem: '输出杨辉三角的前 n 行（n ≤ 20），每行数字之间用一个空格分隔。',
        sample: '输入：5\n输出：\n1\n1 1\n1 2 1\n1 3 3 1\n1 4 6 4 1',
        ideas: [
          '每行首尾都是 1，中间的元素等于上一行相邻两数之和：a[i][j] = a[i-1][j-1] + a[i-1][j]。',
          '用二维数组按行递推，注意 j 从 1 开始、到 i 结束。',
          '这其实是组合数 C(i,j) 的递推表，八级的组合计数会再用到。',
        ],
        code: `#include <iostream>
using namespace std;

long long a[25][25];

int main() {
    int n;
    cin >> n;
    for (int i = 1; i <= n; i++) {
        a[i][1] = a[i][i] = 1;               // 每行首尾为 1
        for (int j = 2; j < i; j++) {
            a[i][j] = a[i - 1][j - 1] + a[i - 1][j];  // 上一行相邻两数相加
        }
    }
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= i; j++) {
            cout << a[i][j];
            if (j < i) cout << " ";
        }
        cout << endl;
    }
    return 0;
}`,
        time: 'O(n²)',
        space: 'O(n²)',
        takeaway: '杨辉三角是组合数的递推表，理解了它，排列组合的编程实现就有抓手了。',
      },
    ],
    homework: [
      '写程序读入 n×m 矩阵，输出每一行的和与每一列的和。',
      '用二维前缀和完成「求最大子矩阵和」的朴素版本（枚举所有子矩阵的四个边界）。',
      '解释为什么 1000×1000 的局部数组会崩溃，而同样规模的全局数组不会。',
      '把杨辉三角改成只用两个一维数组滚动计算，说明这样做省下了什么。',
    ],
  gesp: [4],
};

/** GESP 四级：递推算法 */
const recurrence: ITopic = {
  id: 'recurrence',
  stage: 'cert',
  order: 13,
  title: '递推：从已知推到未知',
  subtitle: '把大问题拆成一串小台阶',
  minutes: 30,
  keywords: ['递推式', '初始值', '斐波那契', '爬台阶', '滚动变量', '取模'],
  summary: '递推的三要素、常见递推模型（斐波那契、爬台阶、错排）、滚动变量与取模写法。',
  sections: {
    concept: [
      '递推是「用前面的已知项算出后面的项」。它和递归解决的是同一类问题，但方向相反：递归从上往下拆，递推从下往上填表。递推的实现几乎总是循环，因此没有函数调用开销，也不会栈溢出。',
      '写递推必须先说清三要素：初始值（前几项是多少）、递推式（第 n 项如何由前几项算出）、边界（推到第几项为止）。缺一个都会得到错误答案。比如斐波那契：f[1]=1, f[2]=1, f[n]=f[n-1]+f[n-2]，推到 n 为止。',
      '识别递推式的方法是把「最后一步」想清楚。爬楼梯问题：每次走 1 级或 2 级，走到第 n 级的方法数等于「最后走 1 级」加上「最后走 2 级」，即 f[n] = f[n-1] + f[n-2]，初始 f[1]=1、f[2]=2。几乎所有递推题都能用这个句式推出来：分类讨论最后一步的所有可能，再把每类的方案数加起来。',
      '很多时候递推只需要保留最近几项，这时用几个变量滚动即可，把空间从 O(n) 压到 O(1)：算斐波那契时维护 prev、cur、next 三个变量，每轮更新一次。这种「滚动变量」的思路，就是后面动态规划「滚动数组」的雏形。',
      '答案很大时要取模。加法与乘法在取模下是封闭的：(a + b) % m 与 (a * b) % m 都可以边算边取模，不会影响最终结果。但减法要注意补正：(a - b) % m 可能为负，写 (a - b % m + m) % m 更安全。',
      '递推不只出现在数列题里。错排问题 D[n] = (n-1)(D[n-1] + D[n-2])、卡特兰数、组合数 C(n,m) = C(n-1,m-1) + C(n-1,m)（杨辉三角）、甚至走格子的路径计数，本质都是递推。把「最后一步」想清楚，递推式就会自己浮出来。',
    ],
    analogy:
      '爬楼梯：站在第 n 级台阶上，回想「我最后一步是从第 n-1 级迈上来的，还是从第 n-2 级跨上来的」。把这两种可能的走法数加起来，就是到达第 n 级的总走法。',
    keyPoints: [
      '递推三要素：初始值、递推式、边界，缺一不可。',
      '找递推式的通用方法：分类讨论最后一步的所有可能。',
      '只需要最近几项时用滚动变量，空间 O(1)。',
      '加法与乘法可以边算边取模，减法要补正。',
    ],
    syntax: [
      'long long f[100] = {0, 1, 1}; 前两项直接给初值，其余自动为 0。',
      'for (int i = 3; i <= n; i++) f[i] = (f[i-1] + f[i-2]) % MOD; 标准递推循环。',
      '滚动写法：long long a = 1, b = 1, c; for (...) { c = (a + b) % MOD; a = b; b = c; }',
      '取模常量写成 const long long MOD = 1e9 + 7;（注意 1e9 是 double，用 1000000007LL 更稳）。',
      '减法取模：(a - b % MOD + MOD) % MOD，避免出现负数。',
      '结果特别大时用 long long；超过 9.2×10¹⁸ 就必须取模，不能硬算。',
    ],
    pitfalls: [
      {
        wrong: 'for (int i = 1; i <= n; i++) f[i] = f[i-1] + f[i-2];  // 从 i=1 开始',
        right: '从 i = 3 开始循环，前两项先赋初值',
        reason: 'i=1 时会访问 f[-1]，越界读取垃圾值，答案会莫名其妙地错，而样例小数据未必暴露。',
      },
      {
        wrong: 'f[i] = (f[i-1] + f[i-2]) 直接算到第 90 项',
        right: '需要大项时取模，或改用高精度',
        reason: '斐波那契第 93 项就超过 long long 上限，会溢出成负数，后续全错。',
      },
      {
        wrong: '写 (a - b) % MOD 后直接输出',
        right: '写 ((a - b) % MOD + MOD) % MOD',
        reason: 'C++ 的 % 对负数返回负余数，答案会变成负数，评测判错。',
      },
    ],
  },
  template: {
      title: 'recur.cpp',
      explain: '一份代码演示两个模型：斐波那契（滚动变量）与爬楼梯（数组 + 取模）。',
      code: `#include <iostream>              // 输入输出
using namespace std;

const long long MOD = 1000000007LL;   // 取模常量，写成 LL 防止溢出

int main() {
    int n;
    cin >> n;

    // 模型一：斐波那契，只需要最近两项，用滚动变量
    long long a = 1, b = 1;              // f[1] = 1, f[2] = 1
    for (int i = 3; i <= n; i++) {
        long long c = (a + b) % MOD;     // 第 i 项
        a = b;                           // 整体往前挪一位
        b = c;
    }
    cout << (n <= 2 ? 1 : b) << endl;    // 前两项单独处理

    // 模型二：爬楼梯，每次 1 级或 2 级，用数组保存每级方案数
    long long f[1005] = {0};
    f[1] = 1;                            // 到第 1 级只有 1 种走法
    f[2] = 2;                            // 到第 2 级：1+1 或直接 2
    for (int i = 3; i <= n; i++) {
        f[i] = (f[i - 1] + f[i - 2]) % MOD;   // 最后一步走 1 级 + 走 2 级
    }
    cout << f[n] << endl;
    return 0;
}`,
  },
  examples: [
      {
        id: 'recur-1',
        title: '数楼梯',
        difficulty: '入门',
        problem: '楼梯有 n 级（n ≤ 50），每次可以走 1 级或 2 级，问走到顶有多少种走法。',
        sample: '输入：5\n输出：8',
        ideas: [
          '按「最后一步」分类：最后走 1 级，则前面有 f[n-1] 种；最后走 2 级，则前面有 f[n-2] 种。',
          '初始 f[1] = 1、f[2] = 2，从 3 推到 n。',
          'n ≤ 50 时答案约 2×10¹⁰，需要 long long。',
        ],
        code: `#include <iostream>
using namespace std;

long long f[55];

int main() {
    int n;
    cin >> n;
    f[1] = 1;                       // 只有 1 级：一种走法
    f[2] = 2;                       // 2 级：1+1 或 2
    for (int i = 3; i <= n; i++) {
        f[i] = f[i - 1] + f[i - 2]; // 最后一步 1 级 + 最后一步 2 级
    }
    cout << f[n] << endl;
    return 0;
}`,
        time: 'O(n)',
        space: 'O(n)',
        takeaway: '分类讨论最后一步，是推导一切递推式最可靠的入口。',
      },
      {
        id: 'recur-2',
        title: '数字三角形',
        difficulty: '进阶',
        problem: '给定一个 n 层的数字三角形（n ≤ 100，数字 ≤ 100），从顶部出发，每步只能走向正下方或右下方，求走到最底层的一条路径上数字之和的最大值。',
        sample: '输入：4\n1\n2 3\n4 5 6\n7 8 9 10\n输出：20',
        ideas: [
          '定义 f[i][j] 为「从顶部走到 (i,j) 的最大和」。',
          '到达 (i,j) 只能来自左上 (i-1,j-1) 或正上 (i-1,j)，取两者较大值再加当前数字。',
          '边界：每行第一个只能来自正上，最后一个只能来自左上。',
        ],
        code: `#include <iostream>
using namespace std;

int a[105][105], f[105][105];

int main() {
    int n;
    cin >> n;
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= i; j++)
            cin >> a[i][j];

    f[1][1] = a[1][1];                       // 起点就是顶部的数
    for (int i = 2; i <= n; i++) {
        for (int j = 1; j <= i; j++) {
            if (j == 1) f[i][j] = f[i - 1][j] + a[i][j];              // 最左只能正上
            else if (j == i) f[i][j] = f[i - 1][j - 1] + a[i][j];     // 最右只能左上
            else f[i][j] = max(f[i - 1][j - 1], f[i - 1][j]) + a[i][j]; // 中间取较大
        }
    }

    int ans = 0;
    for (int j = 1; j <= n; j++) ans = max(ans, f[n][j]);  // 底层取最大
    cout << ans << endl;
    return 0;
}`,
        time: 'O(n²)',
        space: 'O(n²)',
        takeaway: '二维递推就是动态规划的雏形：定义好「到某点的最优值」，转移就自然出现了。',
      },
      {
        id: 'recur-3',
        title: '组合数取模',
        difficulty: '挑战',
        problem: '求 C(n, m) mod 1000000007，其中 n ≤ 2000。',
        sample: '输入：5 2\n输出：10',
        ideas: [
          '组合数满足递推 C(n,m) = C(n-1,m-1) + C(n-1,m)，与杨辉三角同一关系。',
          '按行从上往下推，只需保留上一行，或用二维数组直接填。',
          '每一步都取模，避免溢出。',
        ],
        code: `#include <iostream>
using namespace std;

const long long MOD = 1000000007LL;
long long c[2005][2005];

int main() {
    int n, m;
    cin >> n >> m;
    for (int i = 0; i <= n; i++) {
        c[i][0] = c[i][i] = 1;                       // C(i,0)=C(i,i)=1
        for (int j = 1; j < i; j++) {
            c[i][j] = (c[i - 1][j - 1] + c[i - 1][j]) % MOD;  // 递推 + 取模
        }
    }
    cout << c[n][m] << endl;
    return 0;
}`,
        time: 'O(n²)',
        space: 'O(n²)',
        takeaway: '组合数的递推与杨辉三角是同一个东西，八级的计数题常从这里出发。',
      },
    ],
    homework: [
      '推导「有 n 级台阶，每次可走 1、2、3 级」的递推式，写出初值并编程验证前 10 项。',
      '用滚动变量改写数字三角形的空间，看看能否把 O(n²) 降到 O(n)。',
      '解释为什么递推的答案要取模，以及在哪些位置上取模可以让结果不变。',
      '查一查错排问题 D[n] = (n-1)(D[n-1] + D[n-2]) 的推导过程，并写出前 6 项。',
    ],
  gesp: [4],
};

export const GESP2_TOPICS: ITopic[] = [baseBit, matrix, recurrence];
