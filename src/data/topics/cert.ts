import type { ITopic } from '../types';

export const CERT_TOPICS: ITopic[] = [
  {
    id: 'sort-search',
    stage: 'cert',
    order: 14,
    title: '排序与查找',
    subtitle: '把数据排好队，再快速定位',
    minutes: 35,
    keywords: ['sort', '冒泡', '选择排序', '二分查找', 'lower_bound'],
    summary: '理解三种基础排序的思路，熟练使用 std::sort，掌握有序数组上的二分查找。',
    sections: {
      concept: [
        '排序是把一组数据按大小关系重新排列。冒泡排序每次比较相邻两个元素，把大的往后推；选择排序每次从未排序区间挑出最小值放到前面；插入排序像整理扑克牌，把新牌插进已排好的位置。三者都是 O(n^2)，但插入排序在近乎有序的数据上很快。',
        '实际做题一律用 std::sort：它是经过优化的混合排序，平均 O(n log n)。默认从小到大，要降序传 greater<int>()，要自定义规则传比较函数。',
        '二分查找只能在有序数组上使用。它每次砍掉一半区间，O(log n) 次比较就能定位，10^5 个数据最多 17 次。',
        'lower_bound 返回第一个大于等于 x 的位置，upper_bound 返回第一个大于 x 的位置。两者相减，就是 x 出现的次数——这是统计类题目的常用手法。',
      ],
      analogy: '排序像把一摞乱牌理顺，二分查找像查字典：你不会从第一页翻，而是直接翻到中间，看拼音比目标大还是小，然后只留一半继续翻。',
      syntax: [
        'sort(a, a + n);  对数组升序排序，需要 <algorithm>。',
        'sort(a, a + n, greater<int>());  降序。',
        'sort(v.begin(), v.end());  vector 用迭代器区间。',
        '二分模板：while (l <= r) { mid = (l + r) / 2; ... }  注意边界收缩方向。',
        'lower_bound(a, a + n, x) - a  返回下标，找不到时返回 n。',
        '去重：sort 后 unique(a, a + n) - a 得到不重复元素个数。',
      ],
      pitfalls: [
        { wrong: '对无序数组直接二分', right: '先 sort 再二分', reason: '二分依赖有序性，无序时结果完全随机。' },
        { wrong: 'mid = (l + r) / 2 在 l、r 均为 10^9 时', right: 'mid = l + (r - l) / 2', reason: 'l + r 先溢出成负数，下标直接失效。' },
        { wrong: 'while (l < r) 配 l = mid', right: 'mid 取上整或改用 l = mid + 1', reason: '区间只剩两个元素时 mid 永远等于 l，死循环。' },
        { wrong: '对 vector 用 sort(a, a + n)', right: 'sort(v.begin(), v.end())', reason: 'vector 不是数组，指针区间写法不成立。' },
      ],
      keyPoints: [
        '先排序再处理，是简化问题最常用的第一步。',
        '二分答案与二分查找是两种东西：前者对答案空间二分，后者对数据二分。',
        '能用 sort 就不要手写排序，除非题目明确要求。',
      ],
    },
    template: {
      title: '排序 + 二分查找模板',
      explain: '一份可以直接套用的代码：读入数组、排序、查找目标值第一次出现的位置。',
      code: `#include <iostream>
#include <algorithm>              // sort 与 lower_bound 都在这个头文件
using namespace std;

const int MAXN = 100005;
int a[MAXN];

int main() {
    int n, x;                     // n 是元素个数，x 是要查找的目标
    cin >> n >> x;
    for (int i = 0; i < n; i++) cin >> a[i];  // 读入 n 个数，下标 0 到 n-1

    sort(a, a + n);               // 升序排序，O(n log n)

    int pos = lower_bound(a, a + n, x) - a;  // 第一个 >= x 的位置
    if (pos < n && a[pos] == x) cout << pos << "\\n";  // 找到了
    else cout << -1 << "\\n";     // 没找到

    return 0;
}`,
    },
    examples: [
      {
        id: 'sort-1',
        title: '成绩降序排列',
        difficulty: '入门',
        problem: '输入 n 个成绩，按从高到低输出，相同成绩按原顺序。',
        sample: '输入：4 / 88 96 88 70　　输出：96 88 88 70',
        ideas: ['用 sort 配 greater<int>() 实现降序。', 'sort 不保证稳定，但相同值本身无法区分，这里没有影响。', '输出时控制空格。'],
        code: `#include <iostream>
#include <algorithm>
using namespace std;

const int MAXN = 100005;          // 全局数组一次开够，够放 10^5 个成绩
int a[MAXN];

int main() {
    int n;
    cin >> n;
    for (int i = 0; i < n; i++) cin >> a[i];  // 读入全部成绩

    sort(a, a + n, greater<int>());  // 从大到小
    for (int i = 0; i < n; i++) {
        cout << a[i];
        if (i < n - 1) cout << " ";  // 除最后一个数外都补一个空格
    }
    cout << "\\n";
    return 0;
}`,
        time: 'O(n log n)',
        space: 'O(n)',
        takeaway: 'greater<int>() 是最省事的降序写法，不用自己写比较函数。',
      },
      {
        id: 'sort-2',
        title: '数字出现次数',
        difficulty: '进阶',
        problem: '输入 n 个整数和 q 次询问，每次询问数字 x 出现了几次。',
        sample: '输入：5 2 / 1 2 2 3 2 / 2 3　　输出：3 1',
        ideas: ['排序后用 upper_bound 减 lower_bound。', '差值就是出现次数，复杂度 O(log n)。', '不排序的话每次都要扫一遍，q 大时超时。'],
        code: `#include <iostream>
#include <algorithm>
using namespace std;

const int MAXN = 100005;
int a[MAXN];

int main() {
    int n, q;
    cin >> n >> q;                // n 个数，q 次询问
    for (int i = 0; i < n; i++) cin >> a[i];
    sort(a, a + n);               // 预处理一次

    while (q--) {                 // 循环 q 次，每次处理一个询问
        int x;
        cin >> x;
        int cnt = upper_bound(a, a + n, x) - lower_bound(a, a + n, x);  // upper_bound 减 lower_bound 就是出现次数，全程对数级
        cout << cnt << "\\n";
    }
    return 0;
}`,
        time: 'O(n log n + q log n)',
        space: 'O(n)',
        takeaway: '预处理排序一次，后续每次查询都变成对数级。',
      },
      {
        id: 'sort-3',
        title: '手写二分查找',
        difficulty: '进阶',
        problem: '在有序数组中查找第一个大于等于 x 的位置，找不到输出 n。',
        sample: '输入：5 7 / 1 3 5 9 11　　输出：3',
        ideas: ['答案区间是 [0, n]，用左闭右开写法最不容易错。', 'mid 处小于 x 就放弃左半，否则保留 mid。', '循环结束时 l 就是答案。'],
        code: `#include <iostream>
using namespace std;

const int MAXN = 100005;
int a[MAXN];

int main() {
    int n, x;
    cin >> n >> x;
    for (int i = 0; i < n; i++) cin >> a[i];

    int l = 0, r = n;             // 左闭右开
    while (l < r) {               // 区间里还有元素就继续折半
        int mid = l + (r - l) / 2;  // 防溢出写法
        if (a[mid] < x) l = mid + 1;  // mid 不可能是答案
        else r = mid;             // mid 可能是答案，保留
    }
    cout << l << "\\n";           // l 就是第一个 >= x 的位置
    return 0;
}`,
        time: 'O(log n)',
        space: 'O(1)',
        takeaway: '左闭右开 + 只保留可能含答案的一侧，是二分最稳的写法。',
      },
    ],
    homework: ['输入 n 个数，输出去重后剩下的个数（提示：sort + unique）。', '手写一个冒泡排序，统计交换次数。'],
  },
  {
    id: 'struct',
    stage: 'cert',
    order: 15,
    title: '结构体与自定义排序',
    subtitle: '把几条信息捆成一个人',
    minutes: 30,
    keywords: ['struct', 'cmp', '多关键字排序', '运算符重载'],
    summary: '用结构体打包多个字段，并用比较函数实现按总分、按姓名等多关键字排序。',
    sections: {
      concept: [
        '结构体让你把不同类型的数据打包成一个整体。比如一个学生有姓名、语文、数学、总分，用 struct Student 定义后，一个变量就能装下全部信息。',
        '结构体数组就是一张表：stu[i] 是第 i 行，stu[i].score 是这一行的某个字段。遍历、排序、查找都以「一条记录」为单位，比维护多个平行数组清楚得多。',
        '排序结构体必须告诉 sort 怎么比：写一个 bool cmp(const Student &a, const Student &b) 函数，返回 true 表示 a 应该排在 b 前面。多关键字排序就是在 cmp 里依次比较：先比总分，相同再比语文，还相同再比姓名。',
        '比较函数必须满足严格弱序：不能出现 cmp(a, a) 返回 true 的情况，否则 sort 内部可能越界崩溃。所以相等时一定要返回 false。',
      ],
      analogy: '结构体像一张学生档案卡，正面上写着姓名、班级、各科成绩。排序就是在整理一摞卡片：你可以按总分从高到低摞，总分相同再按学号从小到大摞。',
      syntax: [
        '定义：struct Student { string name; int score; };',
        '使用：Student s; s.name = "Amy"; s.score = 95;',
        '数组：Student stu[100];  stu[0].score 取字段。',
        '比较函数：bool cmp(const Student &a, const Student &b) { return a.score > b.score; }',
        '调用：sort(stu, stu + n, cmp);',
        '重载：在结构体内写 bool operator<(const Student &o) const，之后可直接 sort。',
      ],
      pitfalls: [
        { wrong: 'cmp 里相等时也 return a.score > b.score 之外的分支', right: '相等情况统一 return false', reason: '违反严格弱序，sort 可能访问越界地址，随机崩溃。' },
        { wrong: 'cmp 参数按值传递 Student a', right: 'const Student &a', reason: '每次比较都复制整条记录，数据多时明显变慢。' },
        { wrong: '结构体里定义数组 int a[n]', right: '固定上限或 vector', reason: '结构体内不能用运行期变量定长。' },
      ],
      keyPoints: [
        '多关键字排序：在 cmp 里写成一串 if，最后兜底 return false。',
        '比较函数一律 const 引用传参，既快又不会误改数据。',
        '字段命名用业务含义（total、chinese），不要用 x、y。',
      ],
    },
    template: {
      title: '学生成绩多关键字排序',
      explain: '先按总分降序，总分相同按语文降序，再相同按姓名升序。',
      code: `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

struct Student {                  // 一条学生记录
    string name;
    int chinese;
    int math;
    int total;                    // 总分由两科相加得到，存成字段方便比较
};

bool cmp(const Student &a, const Student &b) {  // 返回 true 表示 a 应该排在 b 前面
    if (a.total != b.total) return a.total > b.total;  // 第一关键字：总分降序
    if (a.chinese != b.chinese) return a.chinese > b.chinese;  // 第二关键字
    return a.name < b.name;       // 第三关键字：姓名升序
}

int main() {
    int n;
    cin >> n;
    Student stu[1005];            // 最多 1000 条记录，开 1005 留余量
    for (int i = 0; i < n; i++) {
        cin >> stu[i].name >> stu[i].chinese >> stu[i].math;  // 依次读入姓名、语文、数学，再手动算出总分
        stu[i].total = stu[i].chinese + stu[i].math;  // 派生字段自己算
    }

    sort(stu, stu + n, cmp);
    for (int i = 0; i < n; i++)
        cout << stu[i].name << " " << stu[i].total << "\\n";
    return 0;
}`,
    },
    examples: [
      {
        id: 'struct-1',
        title: '成绩排名',
        difficulty: '入门',
        problem: '输入 n 名学生的姓名与总分，按总分降序输出姓名与名次（同分同名次）。',
        sample: '输入：3 / Amy 95 / Bob 88 / Cindy 95',
        ideas: ['结构体存姓名与总分。', '排序后遍历，同分则沿用上一个名次。', '名次用变量记录而不是下标，才能处理并列。'],
        code: `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

struct Student { string name; int total; };  // 这条题只需要姓名与总分两个字段

bool cmp(const Student &a, const Student &b) { return a.total > b.total; }  // 比较函数：总分高的排在前面

int main() {
    int n;
    cin >> n;
    Student stu[1005];
    for (int i = 0; i < n; i++) cin >> stu[i].name >> stu[i].total;
    sort(stu, stu + n, cmp);

    int rank = 1;                 // 名次从 1 开始，第一个人的名次就是 1
    for (int i = 0; i < n; i++) {
        if (i > 0 && stu[i].total != stu[i - 1].total) rank = i + 1;  // 分数变了才刷新名次
        cout << stu[i].name << " " << rank << "\\n";
    }
    return 0;
}`,
        time: 'O(n log n)',
        space: 'O(n)',
        takeaway: '并列名次的关键是「只有分数变化时才更新名次」。',
      },
      {
        id: 'struct-2',
        title: '按距离排序点',
        difficulty: '进阶',
        problem: '输入 n 个平面点，按到原点的距离从小到大输出，距离相同按 x 从小到大。',
        sample: '输入：3 / 3 4 / 0 5 / 1 1',
        ideas: ['结构体存 x、y。', '比较距离用 x*x + y*y，避免开根号的浮点误差。', '距离相同再比 x。'],
        code: `#include <iostream>
#include <algorithm>
using namespace std;

struct Point { long long x, y; };  // 坐标可能很大，用 long long 装

long long dist2(const Point &p) { return p.x * p.x + p.y * p.y; }  // 比较平方距离，省掉开根号也避开浮点误差

bool cmp(const Point &a, const Point &b) {
    long long da = dist2(a), db = dist2(b);
    if (da != db) return da < db;  // 第一关键字：距离由小到大
    return a.x < b.x;             // 距离相同再按 x 由小到大
}

int main() {
    int n;
    cin >> n;
    Point p[1005];
    for (int i = 0; i < n; i++) cin >> p[i].x >> p[i].y;
    sort(p, p + n, cmp);
    for (int i = 0; i < n; i++) cout << p[i].x << " " << p[i].y << "\\n";
    return 0;
}`,
        time: 'O(n log n)',
        space: 'O(n)',
        takeaway: '比较大小时尽量用整数运算，能避开浮点误差。',
      },
      {
        id: 'struct-3',
        title: '运算符重载排序',
        difficulty: '挑战',
        problem: '用重载 operator< 的方式，让结构体可以直接 sort，按分数从高到低。',
        sample: '输入：2 / Amy 90 / Bob 95',
        ideas: ['在结构体内部写 bool operator<(const Student &o) const。', '默认 sort 按 < 升序，所以我们把「分数高」定义成更小。', '重载后调用不需要传 cmp。'],
        code: `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

struct Student {
    string name;
    int score;
    bool operator<(const Student &o) const {  // 在结构体内部定义「谁排前面」的规则
        return score > o.score;   // 分数高的定义成更小，sort 升序后就排在前面
    }
};

int main() {
    int n;
    cin >> n;
    Student stu[1005];
    for (int i = 0; i < n; i++) cin >> stu[i].name >> stu[i].score;  // 读入姓名与分数
    sort(stu, stu + n);           // 重载之后直接 sort，不用再传比较函数
    for (int i = 0; i < n; i++) cout << stu[i].name << "\\n";
    return 0;
}`,
        time: 'O(n log n)',
        space: 'O(n)',
        takeaway: '重载 < 适合「这个类型只有一种排序方式」的场景。',
      },
    ],
    homework: ['给结构体加一个「班级」字段，实现先按班级、再按总分排序。', '比较：cmp 与 operator< 两种写法各适合什么场景？'],
  },
  {
    id: 'recursion',
    stage: 'cert',
    order: 16,
    title: '递归与递推',
    subtitle: '自己调用自己，从已知推未知',
    minutes: 35,
    keywords: ['递归', '递推', '终止条件', '斐波那契', '记忆化'],
    summary: '掌握递归三要素与递推思路，理解递归栈与重复计算的代价。',
    sections: {
      concept: [
        '递归是函数直接或间接调用自己。写递归只需要想清三件事：什么时候停（终止条件）、问题怎么变小（递归式）、小问题的结果怎么合并成本问题的答案。',
        '递归调用会在内存里压栈，每次调用都占一层，所以递归深度过大（近万层）会栈溢出。递推则是从最小规模开始，一路算出目标值，只用循环，不占额外栈空间。',
        '很多问题两种写法都行：斐波那契既能递归也能递推；汉诺塔天然适合递归；爬楼梯更适合递推。判断标准是「是否需要回溯过程」。',
        '朴素递归常有大量重复计算，比如 fib(5) 会反复算 fib(3)。把算过的结果存起来（记忆化），复杂度能从指数级降到线性——这是动态规划的入口。',
      ],
      analogy: '递归像俄罗斯套娃：想知道最外层有多大，就打开它问里面那层，一直问到最小那个不能再打开为止，再一层层把答案合起来。递推像搭积木，从最底下一块开始往上搭，每一步都用已经搭好的部分。',
      syntax: [
        '基本结构：返回值 f(参数) { if (终止) return ...; return f(更小的参数) ... }',
        '递归求阶乘：if (n <= 1) return 1; return n * f(n - 1);',
        '递推：for (int i = 2; i <= n; i++) f[i] = f[i-1] + f[i-2];',
        '记忆化：把结果存进数组，进入函数先查表。',
        '深度控制：递归层数超过几千时改用递推或手写栈。',
      ],
      pitfalls: [
        { wrong: '递归函数忘了终止条件', right: '第一行先写 if (边界) return', reason: '无限递归会栈溢出，程序直接崩溃且很难定位。' },
        { wrong: '用朴素递归算 fib(40)', right: '递推或记忆化', reason: '重复计算量指数增长，fib(40) 需要上亿次调用。' },
        { wrong: '在递归里修改全局数组却忘了恢复', right: '回溯后撤销状态', reason: '上一层看到的是被改脏的状态，答案错乱。' },
      ],
      keyPoints: [
        '先写终止条件，再写递归式，最后才想合并。',
        '能递推就别递归，除非需要回溯路径或结构天然是树。',
        '递归参数要体现「问题规模在缩小」，否则一定死循环。',
      ],
    },
    template: {
      title: '斐波那契：递归与递推对比',
      explain: '同一个问题两种写法，直观看出递推的优势。',
      code: `#include <iostream>
using namespace std;

long long memo[100];              // 记忆化数组

long long fibRec(int n) {         // 递归 + 记忆化
    if (n <= 2) return 1;         // 终止条件
    if (memo[n] != 0) return memo[n];  // 算过就直接用
    memo[n] = fibRec(n - 1) + fibRec(n - 2);  // 两个子问题各算一次，结果都存进表里
    return memo[n];
}

int main() {
    int n = 50;
    long long f[100];
    f[1] = f[2] = 1;              // 递推的两个起点
    for (int i = 3; i <= n; i++) f[i] = f[i - 1] + f[i - 2];  // 从第 3 项开始一路推到第 n 项
    cout << f[n] << "\\n";        // 先输出递推结果

    cout << fibRec(n) << "\\n";   // 再输出记忆化递归结果，两者必须一致
    return 0;
}`,
    },
    examples: [
      {
        id: 'rec-1',
        title: '爬楼梯',
        difficulty: '入门',
        problem: '有 n 级台阶，每次只能上 1 级或 2 级，问走到顶有多少种走法（n ≤ 40）。',
        sample: '输入：3　　输出：3',
        ideas: ['最后一步要么从 n-1 上来，要么从 n-2 上来。', '所以 f(n) = f(n-1) + f(n-2)，就是斐波那契。', '边界：1 级有 1 种，2 级有 2 种。'],
        code: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    long long f[45];              // n 最多 40，数组开到 45 足够
    f[1] = 1; f[2] = 2;           // 一级台阶 1 种，两级台阶 2 种
    for (int i = 3; i <= n; i++) f[i] = f[i - 1] + f[i - 2];  // 从第 3 级开始按递推式累加
    cout << f[n] << "\\n";
    return 0;
}`,
        time: 'O(n)',
        space: 'O(n)',
        takeaway: '把「最后一步」想清楚，递推式往往就出来了。',
      },
      {
        id: 'rec-2',
        title: '汉诺塔步数',
        difficulty: '进阶',
        problem: '有 n 个盘子要从 A 柱移到 C 柱，每次只能移动一个且大盘不能压小盘，输出最少步数。',
        sample: '输入：3　　输出：7',
        ideas: ['先把上面 n-1 个移到 B，再把最大的移到 C，最后把 n-1 个移到 C。', '所以 f(n) = 2f(n-1) + 1。', '化简后就是 2^n - 1。'],
        code: `#include <iostream>
using namespace std;

long long hanoi(int n) {
    if (n == 1) return 1;         // 只剩一个盘子，一步就能搬完
    return 2 * hanoi(n - 1) + 1;  // 上面 n-1 个搬两次，最大盘搬一次
}

int main() {
    int n;
    cin >> n;
    cout << hanoi(n) << "\\n";    // 输出最少步数
    return 0;
}`,
        time: 'O(n)',
        space: 'O(n)',
        takeaway: '递归式的推导靠「拆成子问题」，不要试图手算每一层。',
      },
      {
        id: 'rec-3',
        title: '数字反转（递归版）',
        difficulty: '进阶',
        problem: '用递归把一个正整数反转输出，例如 1234 变成 4321。',
        sample: '输入：1234　　输出：4321',
        ideas: ['先输出最后一位，再对去掉最后一位后的数递归。', '终止条件：n 为 0 时返回。', '这样不用存中间结果，递归本身完成了逆序。'],
        code: `#include <iostream>
using namespace std;

void reversePrint(long long n) {
    if (n == 0) return;           // 递归出口
    cout << n % 10;               // 先处理最后一位
    reversePrint(n / 10);         // 再处理剩下的部分
}

int main() {
    long long n;
    cin >> n;
    if (n == 0) cout << 0;        // 特判 0，否则什么都不输出
    else reversePrint(n);         // n 不为 0 就交给递归处理
    cout << "\\n";                // 整行输出结束，最后补换行
    return 0;
}`,
        time: 'O(log n)',
        space: 'O(log n)',
        takeaway: '把「先做哪一步」调换顺序，递归就能改变输出次序。',
      },
    ],
    homework: ['用递推求 n 级台阶、每次可上 1 到 3 级时的走法数。', '思考：为什么朴素递归求 fib(50) 会跑到程序结束都算不完？'],
  },
  {
    id: 'prefix',
    stage: 'cert',
    order: 17,
    title: '前缀和与差分',
    subtitle: '一次预处理，换来成百上千次秒查',
    minutes: 35,
    keywords: ['前缀和', '区间和', '差分', '二维前缀和'],
    summary: '用前缀和把区间求和降到 O(1)，用差分把区间修改降到 O(1)。',
    sections: {
      concept: [
        '前缀和 s[i] 表示前 i 个数的总和，递推关系是 s[i] = s[i-1] + a[i]。有了它，区间 [l, r] 的和就是 s[r] - s[l-1]，一次减法搞定。',
        '如果不做预处理，每次查询都要累加，q 次查询就是 O(nq)。预处理一次 O(n)，之后每次 O(1)，这是最典型的「用空间换时间」。',
        '差分是前缀和的逆运算。对差分数组 d 做前缀和能还原原数组；反过来说，想让原数组 [l, r] 区间全部加 v，只需 d[l] += v、d[r+1] -= v，最后整体做一次前缀和。',
        '二维前缀和解决子矩阵求和：s[i][j] 表示左上角 (1,1) 到 (i,j) 的总和，子矩阵和用容斥公式 s[x2][y2] - s[x1-1][y2] - s[x2][y1-1] + s[x1-1][y1-1]。',
      ],
      analogy: '前缀和像体重秤上的历史记录：你记下每天早晨的累计体重（含衣服），想知道这周吃了多少，只要用今天的累计减上周日的累计。差分像在墙上做记号：想给一段墙刷漆，只在起点写「开始刷」、终点后写「刷完」，最后从头走一遍就知道每处刷了几层。',
      syntax: [
        '一维前缀和：s[i] = s[i-1] + a[i];  区间和 = s[r] - s[l-1];',
        '注意下标：数组从 1 开始存，s[0] = 0，能避开 l = 0 的边界讨论。',
        '差分修改：d[l] += v; d[r+1] -= v;  最后 a[i] = a[i-1] + d[i];',
        '二维前缀和：s[i][j] = s[i-1][j] + s[i][j-1] - s[i-1][j-1] + a[i][j];',
        '数据大时用 long long 存前缀和，10^5 个 10^9 相加会超 int。',
      ],
      pitfalls: [
        { wrong: 's[r] - s[l] 求 [l, r] 的和', right: 's[r] - s[l-1]', reason: 's[l] 里包含 a[l]，减掉会把左端点漏掉。' },
        { wrong: '差分数组只在最后做一次前缀和，却忘了 r+1 越界', right: 'd 数组开到 n + 2', reason: 'r 取到 n 时 r+1 越界写坏内存。' },
        { wrong: '用 int 存 n 个 10^9 的前缀和', right: 'long long', reason: '总和可达 10^14，int 直接溢出。' },
      ],
      keyPoints: [
        '看到「多次区间查询」就想到前缀和，看到「多次区间修改」就想到差分。',
        '统一下标从 1 开始，能省掉大量边界判断。',
        '二维前缀和记不住就画图，容斥的四项来自「加两次减一次」。',
      ],
    },
    template: {
      title: '前缀和 + 差分双模板',
      explain: '左边求区间和，右边做区间加，两套代码结构完全对称。',
      code: `#include <iostream>
using namespace std;

const int MAXN = 100005;
long long a[MAXN], s[MAXN], d[MAXN];  // 前缀和与差分都开 long long，防止累加溢出

int main() {
    int n, q;
    cin >> n >> q;
    for (int i = 1; i <= n; i++) {
        cin >> a[i];
        s[i] = s[i - 1] + a[i];   // 前缀和预处理
    }

    while (q--) {                 // 每次查询 O(1)
        int l, r;
        cin >> l >> r;
        cout << s[r] - s[l - 1] << "\\n";  // 区间和：右端前缀减掉左端前一位
    }

    int m;                        // 接下来是 m 次区间加操作
    cin >> m;                     // m 次区间加
    while (m--) {
        int l, r, v;
        cin >> l >> r >> v;
        d[l] += v;                // 区间起点加上
        d[r + 1] -= v;            // 区间后一位减掉
    }

    long long cur = 0;
    for (int i = 1; i <= n; i++) {
        cur += d[i];              // 差分前缀和还原每个位置的实际增量
        a[i] += cur;              // 把增量叠加回原数组
        cout << a[i] << " ";
    }
    cout << "\\n";
    return 0;
}`,
    },
    examples: [
      {
        id: 'prefix-1',
        title: '区间和查询',
        difficulty: '入门',
        problem: '输入 n 个数和 q 次询问，每次给出 l、r，输出 a[l] 到 a[r] 的和。',
        sample: '输入：5 2 / 1 2 3 4 5 / 1 3 / 2 5　　输出：6 14',
        ideas: ['预处理前缀和。', '每次查询 O(1)。', '下标从 1 开始，s[0] = 0。'],
        code: `#include <iostream>
using namespace std;

const int MAXN = 100005;
long long s[MAXN];

int main() {
    int n, q;
    cin >> n >> q;
    for (int i = 1; i <= n; i++) {
        long long x;
        cin >> x;
        s[i] = s[i - 1] + x;      // 边读边算前缀和，连原数组都不用存
    }
    while (q--) {
        int l, r;
        cin >> l >> r;
        cout << s[r] - s[l - 1] << "\\n";  // 一次减法就得到区间和
    }
    return 0;
}`,
        time: 'O(n + q)',
        space: 'O(n)',
        takeaway: '边读入边算前缀和，连原数组都不用存。',
      },
      {
        id: 'prefix-2',
        title: '区间覆盖次数',
        difficulty: '进阶',
        problem: '数轴上有 m 次区间加 1 操作，问最后每个位置被覆盖了几次。',
        sample: '输入：5 2 / 1 3 / 2 4　　输出：1 2 2 1 0',
        ideas: ['这是差分的标准场景。', '每次操作 d[l]++、d[r+1]--。', '最后从前往后累加得到每个位置的次数。'],
        code: `#include <iostream>
using namespace std;

const int MAXN = 100005;
int d[MAXN];

int main() {
    int n, m;
    cin >> n >> m;
    while (m--) {
        int l, r;
        cin >> l >> r;
        d[l]++;                   // 进入区间
        d[r + 1]--;               // 离开区间
    }
    int cur = 0;                  // 当前累计的覆盖层数
    for (int i = 1; i <= n; i++) {
        cur += d[i];              // 前缀和就是覆盖次数
        cout << cur << (i == n ? "\\n" : " ");  // 最后一个位置后面换行，其余用空格
    }
    return 0;
}`,
        time: 'O(n + m)',
        space: 'O(n)',
        takeaway: '「区间加、单点查」用差分；「单点加、区间查」用前缀和。',
      },
      {
        id: 'prefix-3',
        title: '子矩阵求和',
        difficulty: '挑战',
        problem: '输入一个 n 行 m 列的矩阵，q 次询问某个子矩阵的元素和。',
        sample: '输入：2 2 1 / 1 2 / 3 4 / 1 1 2 2　　输出：10',
        ideas: ['预处理二维前缀和。', '容斥公式：总和减上方减左方，再加回左上角。', '下标从 1 开始避免边界特判。'],
        code: `#include <iostream>
using namespace std;

long long s[1005][1005];          // 二维前缀和，累加值可能很大，用 long long

int main() {
    int n, m, q;
    cin >> n >> m >> q;
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= m; j++) {
            long long x;
            cin >> x;
            s[i][j] = s[i - 1][j] + s[i][j - 1] - s[i - 1][j - 1] + x;  // 容斥：上方 + 左方 - 左上角 + 当前格子
        }

    while (q--) {
        int x1, y1, x2, y2;
        cin >> x1 >> y1 >> x2 >> y2;
        cout << s[x2][y2] - s[x1 - 1][y2] - s[x2][y1 - 1] + s[x1 - 1][y1 - 1] << "\\n";  // 子矩阵和，同样是容斥四项
    }
    return 0;
}`,
        time: 'O(nm + q)',
        space: 'O(nm)',
        takeaway: '二维容斥的关键是「加回来被减了两次的那一块」。',
      },
    ],
    homework: ['用差分实现「区间全部乘以 2」，需要改动什么？', '把子矩阵求和的公式画成四个矩形，自己推一遍。'],
  },
  {
    id: 'binary-answer',
    stage: 'cert',
    order: 18,
    title: '二分答案',
    subtitle: '答案在一个范围里，那就折半逼近',
    minutes: 40,
    keywords: ['二分答案', '单调性', 'check 函数', '最小最大值'],
    summary: '学会识别「答案可二分」的题目，用 check 函数把求解题变成判断题。',
    sections: {
      concept: [
        '二分答案不是对数组二分，而是对答案的可能取值区间二分。前提有两个：答案落在某个范围 [L, R]，并且「答案是否可行」随取值单调变化。',
        '做法是把求解题改写成判断题：写一个 check(x)，返回「当答案是 x 时，条件是否满足」。如果 x 越大越容易满足（或越难满足），就能用二分找到临界点。',
        '题目里出现「最大值最小」「最小值最大」「至少 / 至多多少才能完成」这些字眼，几乎都是二分答案的信号。',
        '边界是这类题的最大杀手：先想清最终要的是「最后一个满足的」还是「第一个满足的」，再决定区间更新方式，最后用样例和极端值各测一次。',
      ],
      analogy: '二分答案像调音量：你不知道多大刚好合适，但你知道「太大」和「太小」的方向。于是先调到中间，听一下，太吵就往小调、太轻就往大调，几次之后就逼近了刚好的那个值。',
      syntax: [
        '整数二分模板：while (l < r) { mid = l + (r - l) / 2; if (check(mid)) r = mid; else l = mid + 1; }',
        '另一种：if (check(mid)) l = mid; else r = mid - 1;  配 mid = l + (r - l + 1) / 2 取上整。',
        'check 函数尽量 O(n)：它会被调用 O(log R) 次。',
        '答案范围：先估下界与上界，宁可开大一点，别开小。',
      ],
      pitfalls: [
        { wrong: 'check 写反了方向', right: '先用手算几个值确认真值分布', reason: '方向错时二分会收敛到错误端点，结果差一位且很难察觉。' },
        { wrong: 'while (l <= r) 配 l = mid', right: '区间只剩两个元素时会死循环', reason: '必须保证每轮至少缩掉一个位置。' },
        { wrong: '把 check 写成 O(n^2)', right: '优化到 O(n) 或用前缀和', reason: 'O(log R × n^2) 往往超时。' },
      ],
      keyPoints: [
        '识别信号：最大值最小、最小值最大、能否在 k 步内完成。',
        '先写暴力 check，确认正确后再套二分。',
        '答案范围宁可宽，不要窄；下标与答案的边界单独测。',
      ],
    },
    template: {
      title: '二分答案骨架',
      explain: '求「最小的可行值」的标准写法：check 为真就往左收，否则往右收。',
      code: `#include <iostream>
using namespace std;

const int MAXN = 100005;
int a[MAXN];
int n, k;

bool check(int x) {               // 判断：以 x 为答案是否可行
    int cnt = 0;                  // 统计满足判定条件的元素个数
    for (int i = 0; i < n; i++) {
        if (a[i] >= x) cnt++;     // 这里替换成题目真实的判定逻辑
    }
    return cnt >= k;              // 至少 k 个满足条件
}

int main() {
    cin >> n >> k;
    for (int i = 0; i < n; i++) cin >> a[i];

    int l = 0, r = 1000000000;    // 答案范围的上下界
    while (l < r) {               // 找最小可行值
        int mid = l + (r - l) / 2;  // 取中点，写成加法避免溢出
        if (check(mid)) r = mid;  // mid 可行，答案在左边（含 mid）
        else l = mid + 1;         // mid 不可行，答案一定在右边
    }
    cout << l << "\\n";           // 循环结束时 l 就是最小的可行值
    return 0;
}`,
    },
    examples: [
      {
        id: 'bin-1',
        title: '整数平方根',
        difficulty: '入门',
        problem: '输入 n，求最大的 x 使 x² ≤ n（n ≤ 2×10^9）。',
        sample: '输入：17　　输出：4',
        ideas: ['答案是 0 到 n 之间的整数，且随 x 增大单调变难满足。', '求「最大可行值」，check 为真时往右收。', '用 long long 比较，避免 x*x 溢出。'],
        code: `#include <iostream>
using namespace std;

int main() {
    long long n;
    cin >> n;

    long long l = 0, r = n;       // 答案范围是 0 到 n
    while (l < r) {
        long long mid = l + (r - l + 1) / 2;  // 求最大可行值时 mid 要取上整
        if (mid * mid <= n) l = mid;  // mid 可行，答案可能更大
        else r = mid - 1;
    }
    cout << l << "\\n";           // l 收敛到最大的 x 使 x² ≤ n
    return 0;
}`,
        time: 'O(log n)',
        space: 'O(1)',
        takeaway: '求最大可行值时 mid 要取上整，配 l = mid 才不会卡住。',
      },
      {
        id: 'bin-2',
        title: '分割数组的最小最大和',
        difficulty: '挑战',
        problem: '把 n 个数分成 k 段连续子数组，使「各段和的最大值」尽量小，输出这个最小值。',
        sample: '输入：5 2 / 7 2 5 10 8　　输出：18',
        ideas: ['答案范围是 [单个元素最大值, 总和]。', 'check(x)：能否在每段和不超过 x 的前提下切成不超过 k 段。', '贪心地尽量多装，段数越少越好，这就是判定。'],
        code: `#include <iostream>
using namespace std;

const int MAXN = 100005;
int a[MAXN];
int n, k;

bool check(long long x) {
    int parts = 1;                // 至少一段
    long long cur = 0;
    for (int i = 0; i < n; i++) {
        if (a[i] > x) return false;  // 单个元素就超限
        if (cur + a[i] <= x) cur += a[i];  // 放得下就并进当前段
        else { parts++; cur = a[i]; }  // 放不下就开新的一段，从当前元素重新计
    }
    return parts <= k;
}

int main() {
    cin >> n >> k;
    long long sum = 0, mx = 0;
    for (int i = 0; i < n; i++) { cin >> a[i]; sum += a[i]; if (a[i] > mx) mx = a[i]; }

    long long l = mx, r = sum;    // 下界是单个元素最大值，上界是总和
    while (l < r) {
        long long mid = l + (r - l) / 2;
        if (check(mid)) r = mid;
        else l = mid + 1;
    }
    cout << l << "\\n";
    return 0;
}`,
        time: 'O(n log sum)',
        space: 'O(n)',
        takeaway: '「最大值最小」的标准套路：二分答案 + 贪心判定。',
      },
      {
        id: 'bin-3',
        title: '砍树取木材',
        difficulty: '挑战',
        problem: '有 n 棵树高度 h[i]，设定一个砍伐高度 H，高于 H 的部分被收集。要收集到至少 m 米，求最大的 H。',
        sample: '输入：4 7 / 20 15 10 17　　输出：15',
        ideas: ['H 越低收集越多，是单调递减的。', 'check(H)：累加每棵树超出部分，判断是否足够。', '求最大可行 H，mid 取上整配 l = mid。'],
        code: `#include <iostream>
using namespace std;

const int MAXN = 100005;
long long h[MAXN];
int n;
long long need;

bool check(long long H) {
    long long got = 0;
    for (int i = 0; i < n; i++) {
        if (h[i] > H) got += h[i] - H;  // 只算高出的部分
        if (got >= need) return true;  // 提前返回，省时间
    }
    return got >= need;
}

int main() {
    cin >> n >> need;
    long long mx = 0;
    for (int i = 0; i < n; i++) { cin >> h[i]; if (h[i] > mx) mx = h[i]; }

    long long l = 0, r = mx;      // 砍伐高度从 0 一直试到最高的树
    while (l < r) {
        long long mid = l + (r - l + 1) / 2;
        if (check(mid)) l = mid;  // 够用说明还能再高一点，往右收
        else r = mid - 1;
    }
    cout << l << "\\n";
    return 0;
}`,
        time: 'O(n log maxH)',
        space: 'O(n)',
        takeaway: 'check 里能提前返回就提前返回，常数优化在二分里会被放大。',
      },
    ],
    homework: ['把「至少 m 米」改成「恰好 m 米」，还能二分吗？为什么？', '自己造一组 n = 10^5 的数据，估算二分的调用次数。'],
  },
  {
    id: 'greedy',
    stage: 'cert',
    order: 19,
    title: '贪心算法',
    subtitle: '每一步都选眼前最好的',
    minutes: 35,
    keywords: ['贪心', '局部最优', '活动安排', '排序', '反例'],
    summary: '理解贪心的适用前提，掌握活动安排、找零、短作业优先三类经典模型，并学会验证贪心是否正确。',
    sections: {
      concept: [
        '贪心在每一步都做出局部最优的选择，并且不再回头修改。它快、好写，但不是万能的——只有当「局部最优能推出全局最优」时才是对的。',
        '验证贪心的常用手段是交换论证：假设存在更优解，把它与贪心解的第一个不同之处交换，证明结果不会变差。做题时更实用的办法是对拍：写一个暴力解，随机测几十组小数据。',
        '经典模型一：活动安排——按结束时间排序，能选就选，得到最多的互不冲突活动。',
        '经典模型二：找零钱——面值成倍数关系时（1、5、10、50）从大到小贪心最优；面值任意时（比如 1、3、4）贪心会错，需要动态规划。',
      ],
      analogy: '贪心像吃自助餐：每盘只夹眼前最想吃的，夹完就走。如果所有菜的分量、口味都独立，这么吃是划算的；但如果吃饱了才发现后面有更贵的菜，就亏了——这就是贪心失效。',
      syntax: [
        '按规则排序：sort(a, a + n, cmp);  贪心的第一步往往是排序。',
        '活动安排：按结束时间升序，记录上一个结束时间，能接就接。',
        '区间覆盖：按起点排序，每次选能延伸到最远的区间。',
        '反例意识：拿到题先问「贪心会不会被局部选择坑掉」。',
      ],
      pitfalls: [
        { wrong: '看到「最多」就直接贪心', right: '先验证或对拍', reason: '贪心只是充分条件之一，很多题的最优解需要 DP。' },
        { wrong: '活动安排按开始时间排序', right: '按结束时间排序', reason: '按开始时间会选到很长的活动，挤掉后面更多短活动。' },
        { wrong: '贪心后忘记处理「无法完成」的情况', right: '结束时检查是否真的达成目标', reason: '贪心可能提前把资源用完，需要输出无解。' },
      ],
      keyPoints: [
        '贪心的第一步几乎总是排序，排序依据就是贪心策略。',
        '能用交换论证自证，就用；不能就用暴力对拍。',
        '题目要求「恰好」而不是「最多/最少」时，谨慎怀疑贪心。',
      ],
    },
    template: {
      title: '活动安排模板',
      explain: '按结束时间排序，能接就接，统计最多能参加几场活动。',
      code: `#include <iostream>
#include <algorithm>
using namespace std;

struct Activity { int start, end; };  // 一条活动记录：开始与结束时间

bool cmp(const Activity &a, const Activity &b) {
    return a.end < b.end;         // 关键：按结束时间排序
}

int main() {
    int n;
    cin >> n;
    Activity act[1005];
    for (int i = 0; i < n; i++) cin >> act[i].start >> act[i].end;
    sort(act, act + n, cmp);      // 按结束时间从小到大排好

    int count = 0, lastEnd = -1;  // lastEnd 记录上一场的结束时间
    for (int i = 0; i < n; i++) {
        if (act[i].start >= lastEnd) {  // 与上一场不冲突
            count++;
            lastEnd = act[i].end;  // 更新结束时间
        }
    }
    cout << count << "\\n";       // 输出最多能参加的活动数
    return 0;
}`,
    },
    examples: [
      {
        id: 'greedy-1',
        title: '最多参加几场活动',
        difficulty: '入门',
        problem: '输入 n 场活动的开始与结束时间，同一时间只能参加一场，求最多参加几场。',
        sample: '输入：3 / 1 3 / 2 4 / 3 5　　输出：2',
        ideas: ['按结束时间升序排序。', '用一个变量记录上一场的结束时间。', '当前活动开始时间不早于它，就选上。'],
        code: `#include <iostream>
#include <algorithm>
using namespace std;

struct Act { int s, e; };         // 字段名缩短，写起来省事
bool cmp(const Act &a, const Act &b) { return a.e < b.e; }  // 结束时间早的活动排在前面

int main() {
    int n;
    cin >> n;
    Act a[1005];
    for (int i = 0; i < n; i++) cin >> a[i].s >> a[i].e;
    sort(a, a + n, cmp);

    int ans = 0, last = -1;       // ans 记录场数，last 记录上一场结束时间
    for (int i = 0; i < n; i++) {
        if (a[i].s >= last) { ans++; last = a[i].e; }  // 不冲突就参加，并把结束时间往后推
    }
    cout << ans << "\\n";
    return 0;
}`,
        time: 'O(n log n)',
        space: 'O(n)',
        takeaway: '按结束时间排序，是活动选择问题唯一正确的贪心依据。',
      },
      {
        id: 'greedy-2',
        title: '硬币找零',
        difficulty: '进阶',
        problem: '有 1、5、10、50 元四种硬币，凑出 n 元，求最少硬币数。',
        sample: '输入：63　　输出：5（50 + 10 + 1 + 1 + 1）',
        ideas: ['面值成倍数关系，贪心可用。', '从大到小尽量多用大面值。', '剩下的零头用 1 元补齐。'],
        code: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int coin[4] = {50, 10, 5, 1};  // 面值从大到小排列，贪心从最大的开始
    int ans = 0;
    for (int i = 0; i < 4; i++) {
        ans += n / coin[i];       // 尽量多用当前面值
        n %= coin[i];             // 剩下的零头留给更小的面值
    }
    cout << ans << "\\n";
    return 0;
}`,
        time: 'O(1)',
        space: 'O(1)',
        takeaway: '面值成倍数时贪心最优，不成倍数时这个写法就是错的。',
      },
      {
        id: 'greedy-3',
        title: '排队接水（短作业优先）',
        difficulty: '挑战',
        problem: 'n 个人排队接水，第 i 人需要 t[i] 分钟，求所有人等待时间总和的最小值。',
        sample: '输入：4 / 4 2 1 3　　输出：10',
        ideas: ['按接水时间从小到大排序。', '第 i 个人等待时间 = 在他前面的人的时间和。', '用累加方式 O(n) 求和，不用双重循环。'],
        code: `#include <iostream>
#include <algorithm>
using namespace std;

int main() {
    int n;
    cin >> n;
    int t[1005];
    for (int i = 0; i < n; i++) cin >> t[i];
    sort(t, t + n);               // 接水时间短的先上，总等待最小

    long long wait = 0, prefix = 0;  // wait 是总等待时间，prefix 是前面所有人的用时之和
    for (int i = 0; i < n; i++) {
        wait += prefix;           // 前面的人用完水，他才能开始
        prefix += t[i];           // 把自己也加进前缀，供后面的人使用
    }
    cout << wait << "\\n";
    return 0;
}`,
        time: 'O(n log n)',
        space: 'O(n)',
        takeaway: '「让短任务先做」是调度问题里最直观也最有效的贪心。',
      },
    ],
    homework: ['构造一组反例，说明「按开始时间最早」选活动会得到更少的场次。', '思考：面值为 1、3、4 时，凑 6 元贪心会得到几个硬币？最优是几个？'],
  },
];
