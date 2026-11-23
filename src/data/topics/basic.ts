import type { ITopic } from '../types';

export const BASIC_TOPICS: ITopic[] = [
  {
    id: 'var',
    stage: 'basic',
    order: 2,
    title: '变量与数据类型',
    subtitle: '给数据准备一个合适的盒子',
    minutes: 25,
    keywords: ['int', 'double', 'long long', 'char', 'bool', '溢出'],
    summary: '认识 C++ 的基本类型，学会按数据范围选类型，避开溢出与未初始化两个大坑。',
    sections: {
      concept: [
        '变量是内存里的一块空间，名字是你给它贴的标签。类型决定这块空间有多大、能装什么样的数据：int 装整数，double 装小数，char 装单个字符，bool 只装真假。',
        'C++ 要求先声明再使用。声明时写「类型 名字」，例如 int score; 这只是开好了盒子，里面还是上一次留下的随机值，所以声明后要立刻赋值，这叫初始化。',
        '常见范围要记牢：int 大约到 21 亿（2×10^9），long long 到 9×10^18，超出范围会发生溢出——数值悄悄变成负数，程序不会报错，这是最难查的一类错误。',
        '名字只能用字母、数字、下划线，且不能以数字开头，也不能和关键字重名。教学与比赛中建议用有意义的名字：sum、cnt、maxScore，而不是 a、b、c。',
      ],
      analogy: '变量像储物柜：类型是柜子的尺寸，int 是小格子，long long 是大柜子，double 是能放小数的特殊柜子。你把东西塞进太小的格子，东西会被挤坏（溢出）；柜子空了没清理，里面可能还留着上一位用户的杂物（未初始化）。',
      syntax: [
        '声明并初始化：int a = 5;  double pi = 3.14159;  char c = \'A\';  bool ok = true;',
        '一次声明多个：int x = 1, y = 2; 但更推荐分开写，方便阅读与排查。',
        '常量：const int MAXN = 100000; 之后不能修改，避免魔法数字。',
        '类型范围：int 约 ±2.1×10^9；long long 约 ±9.2×10^18；double 有效数字约 15 位。',
        '类型转换：整数与小数混合运算会自动提升为 double；把 double 赋给 int 会直接丢掉小数部分。',
        '字符与整数：char 本质是 0~127 的编码，\'A\' 是 65，\'a\' 是 97，\'0\' 是 48，可以互相转换。',
      ],
      pitfalls: [
        { wrong: 'int sum; 直接 sum = sum + 5;', right: 'int sum = 0;', reason: '未初始化时 sum 里是随机值，累加结果完全不可预测。' },
        { wrong: 'int n = 100000; int ans = n * n;', right: 'long long ans = 1LL * n * n;', reason: 'n*n 先按 int 计算，10^10 已经溢出，再赋给 long long 也救不回来。' },
        { wrong: 'if (a = 0) { ... }', right: 'if (a == 0) { ... }', reason: '一个等号是赋值，会把 a 改成 0，条件恒为假。' },
        { wrong: 'int avg = (a + b) / 2; 想得到 3.5', right: 'double avg = (a + b) / 2.0;', reason: '两个整数相除会向下取整，小数部分直接丢弃。' },
      ],
      keyPoints: [
        '看到题目数据上限到 10^9 以上，累加与乘积一律用 long long。',
        '声明即初始化，尤其是累加器、计数器、最大值，一律从 0 或 -1 起步。',
        '小数参与运算时至少让一个操作数是 double，避免整数除法偷走小数。',
      ],
    },
    template: {
      title: '三种典型类型的定义与输出',
      explain: '这段模板演示了整型、浮点、字符三种最常用的定义方式，以及输出时如何控制小数位数。',
      code: `#include <iostream>               // 引入输入输出库
#include <iomanip>                // 引入 setprecision，用来控制小数位
using namespace std;              // 省略 std:: 前缀

int main() {                      // 程序入口，一切从这里开始
    int students = 42;            // 整数：用 int 装人数
    long long total = 1234567890LL;  // 大整数：LL 后缀表示这是 long long 字面量
    double average = 3.5;         // 小数：double 精度足够日常计算
    char grade = 'A';             // 单个字符：必须用单引号
    bool pass = true;             // 真假值：true / false

    cout << "students = " << students << endl;  // 直接输出整数
    cout << "total = " << total << endl;  // 输出大整数
    cout << fixed << setprecision(2);  // 之后的小数固定保留 2 位
    cout << "average = " << average << endl;  // 输出 3.50
    cout << "grade = " << grade << endl;  // 输出 A
    cout << "pass = " << pass << endl;  // 输出 1（true 打印为 1）

    return 0;                     // 返回 0 表示程序正常结束
}`,
    },
    examples: [
      {
        id: 'var-1',
        title: '圆的面积',
        difficulty: '入门',
        problem: '输入一个整数半径 r，输出圆的面积，保留两位小数。',
        sample: '输入：3　　输出：28.27',
        ideas: [
          '面积公式是 π × r × r，π 取 3.14159。',
          'r 是整数，但计算时必须让结果是小数，所以把 π 写成 3.14159 即可让整个表达式变成 double。',
          '输出前用 fixed << setprecision(2) 固定两位小数。',
        ],
        code: `#include <iostream>
#include <iomanip>                // setprecision 需要 <iomanip>
using namespace std;

int main() {
    int r;                        // 半径按题意是整数
    cin >> r;
    double area = 3.14159 * r * r;  // 3.14159 是小数，整个乘法自动按 double 算
    cout << fixed << setprecision(2) << area << endl;  // fixed + setprecision(2)：固定保留两位小数
    return 0;                     // 结束
}`,
        time: 'O(1)',
        space: 'O(1)',
        takeaway: '整数参与小数运算时，只要表达式里出现小数，结果就是小数。',
      },
      {
        id: 'var-2',
        title: '交换两个数',
        difficulty: '入门',
        problem: '输入两个整数 a、b（可能达到 10^9），交换后输出。',
        sample: '输入：3 5　　输出：5 3',
        ideas: [
          '交换需要一个临时变量 t，否则先覆盖 a 就丢掉了原值。',
          't = a; a = b; b = t; 三步走，顺序不能乱。',
          '数值可能很大，用 long long 更稳妥。',
        ],
        code: `#include <iostream>
using namespace std;

int main() {
    long long a, b;               // 数据范围可能到 10^9，用 long long 更安全
    cin >> a >> b;                // 一次读入两个数

    long long t = a;              // 先把 a 存进临时变量，防止被覆盖
    a = b;                        // 把 b 的值放进 a
    b = t;                        // 把暂存的原 a 放进 b

    cout << a << " " << b << endl;  // 用空格分隔输出
    return 0;                     // 结束
}`,
        time: 'O(1)',
        space: 'O(1)',
        takeaway: '凡是「先改谁就丢掉谁」的场景，都要先备份。',
      },
      {
        id: 'var-3',
        title: '字符与编码',
        difficulty: '入门',
        problem: '输入一个大写字母，输出它的小写形式以及对应的 ASCII 码。',
        sample: '输入：C　　输出：c 67',
        ideas: [
          '大写字母与小写字母的编码相差 32，所以加上 32 就变成小写。',
          '把它强制转成 int 就能输出编码。',
          'char 参与算术运算时会自动当作整数处理。',
        ],
        code: `#include <iostream>
using namespace std;

int main() {
    char c;                       // 读一个大写字母
    cin >> c;                     // cin 读字符时会自动跳过空白，不用担心换行

    char lower = c + 32;          // char 与整数相加，得到对应的编码
    cout << lower << " " << int(c) << endl;  // int(c) 强制转换后输出 ASCII 码
    return 0;                     // 结束
}`,
        time: 'O(1)',
        space: 'O(1)',
        takeaway: 'char 就是小整数，字母的加减本质是编码的加减。',
      },
    ],
    homework: ['输入两个数，输出它们的和、差、积、商（商保留三位小数）。', '想一想：如果把 int 换成 short，能存下 40000 吗？为什么？'],
  },
  {
    id: 'io',
    stage: 'basic',
    order: 3,
    title: '输入输出与格式控制',
    subtitle: '把数据读进来，把结果写整齐',
    minutes: 20,
    keywords: ['cin', 'cout', 'scanf', 'printf', 'setprecision', 'getline'],
    summary: '掌握 cin/cout 与 scanf/printf 两套写法，搞定读整行、保留小数、对齐输出这三种高频格式要求。',
    sections: {
      concept: [
        'cin >> 会跳过回车、空格、制表符，只把有效数据读进变量，所以连续读多个数非常方便。代价是它读不了带空格的整行文本。',
        'cout << 把内容依次送进输出流，endl 会换行并刷新缓冲区。数据量大时用 "\\n" 代替 endl 更快，因为 endl 每次都强制刷新。',
        'C 风格的 scanf / printf 需要写格式符：%d 整数、%lld 长整数、%c 字符、%s 字符串、%.2f 两位小数。它比 cin 快，但类型写错会读出错误的值且不报错。',
        '读一整行要用 getline(cin, s)。注意：如果前面用 cin >> 读过数字，缓冲区里还留着一个回车，要先 cin.ignore() 吃掉它，否则 getline 读到的会是空行。',
      ],
      analogy: '输入输出像收发快递：cin 是快递员，按单子上的地址（变量）把包裹塞进去；cout 是打包台，按你要的顺序把东西装进箱子。scanf/printf 更像自己填运单，快，但写错编号就会寄错地方。',
      syntax: [
        '读入：cin >> a >> b;  等价于先读 a 再读 b，空格与回车自动跳过。',
        '输出：cout << a << " " << b << "\\n"; 用引号包住空格与换行。',
        '保留小数：cout << fixed << setprecision(2) << x;  需要 <iomanip>。',
        'C 风格：scanf("%d %lld", &n, &m); printf("%.2f\\n", ans);',
        '整行读取：getline(cin, line);  读之前若有残留回车，先 cin.ignore()。',
        '加速：在 main 开头写 ios::sync_with_stdio(false); cin.tie(0); 读入上百万数据时能快一倍以上。',
      ],
      pitfalls: [
        { wrong: 'scanf("%d", n);', right: 'scanf("%d", &n);', reason: 'scanf 需要变量地址，漏掉 & 会写到非法内存，程序直接崩溃。' },
        { wrong: 'cin >> name; 想读「Li Ming」', right: 'getline(cin, name);', reason: 'cin >> 遇到空格就停，只能读到 Li。' },
        { wrong: '用 cout 输出 1.23456，题目要求 1.23', right: 'cout << fixed << setprecision(2);', reason: '默认输出会保留有效数字，不按小数位数截断。' },
        { wrong: '同一程序里混用 cin 与 scanf', right: '统一用其中一套', reason: '两套缓冲不同步，可能导致读入顺序错乱。' },
      ],
      keyPoints: [
        '按题目样例逐字对齐输出：空格、换行、小数位，一处不对就判错。',
        '读字符串前先判断是否包含空格，包含就用 getline。',
        '数据量过万就加读入加速，这是最便宜的提速手段。',
      ],
    },
    template: {
      title: '标准输入输出与格式控制',
      explain: '一个能应付大多数题目的输入输出骨架：加速读入、读多个数、按格式输出。',
      code: `#include <iostream>
#include <iomanip>                // setprecision 在这里
using namespace std;

int main() {
    ios::sync_with_stdio(false);  // 关闭 C 与 C++ 流的同步，读入更快
    cin.tie(0);                   // 解除 cin 与 cout 的绑定

    int a, b;                     // 先声明两个变量，再读入
    cin >> a >> b;                // 一次读两个整数，空格或回车分隔

    cout << a + b << "\\n";       // 用 \\n 换行，比 endl 快
    cout << fixed << setprecision(3);  // 之后所有小数保留 3 位
    cout << (a + b) / 3.0 << "\\n";  // 3.0 保证是小数除法
    return 0;                     // 结束
}`,
    },
    examples: [
      {
        id: 'io-1',
        title: '三个数的平均值',
        difficulty: '入门',
        problem: '输入三个整数，输出它们的平均值，保留两位小数。',
        sample: '输入：80 90 100　　输出：90.00',
        ideas: ['先把三个数读进来。', '求和后除以 3.0，保证结果是小数。', '输出前固定两位小数。'],
        code: `#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    int a, b, c;
    cin >> a >> b >> c;           // 一次读入三个整数

    double avg = (a + b + c) / 3.0;  // 除以 3.0 而不是 3
    cout << fixed << setprecision(2) << avg << endl;  // fixed 之后的输出都按两位小数
    return 0;                     // 结束
}`,
        time: 'O(1)',
        space: 'O(1)',
        takeaway: '整数除法会截断，想要小数就把除数写成小数。',
      },
      {
        id: 'io-2',
        title: '读入带空格的姓名',
        difficulty: '入门',
        problem: '第一行输入一个年龄，第二行输入姓名（可能包含空格），输出「姓名 + 年龄」。',
        sample: '输入：12 / Li Ming　　输出：Li Ming 12',
        ideas: ['cin >> age 之后缓冲区留下回车。', '用 cin.ignore() 吃掉这个回车。', '再用 getline 读整行。'],
        code: `#include <iostream>
#include <string>                 // getline 与 string 都来自这个头文件
using namespace std;

int main() {
    int age;
    cin >> age;                   // 读完数字，缓冲区里还剩一个换行符
    cin.ignore();                 // 吃掉这个换行，否则 getline 会读到空行

    string name;                  // string 能存下带空格的整行文本
    getline(cin, name);           // 读入整行，包含空格
    cout << name << " " << age << endl;  // 先输姓名再输年龄
    return 0;                     // 结束
}`,
        time: 'O(n)',
        space: 'O(n)',
        takeaway: 'cin 与 getline 混用时，先 ignore 掉残留的换行。',
      },
      {
        id: 'io-3',
        title: '对齐输出成绩表',
        difficulty: '入门',
        problem: '输入三名学生的姓名与成绩，按「姓名占 8 列、成绩保留 1 位小数」的格式输出三行。',
        sample: '输入：Amy 88.5 / Bob 92 / Cindy 79.25',
        ideas: ['用 setw(8) 控制列宽。', 'setw 只对下一次输出有效，每次都要写。', '小数统一保留 1 位。'],
        code: `#include <iostream>
#include <iomanip>
#include <string>
using namespace std;

int main() {
    for (int i = 0; i < 3; i++) {  // 固定读三行，人数在题里写死
        string name;
        double score;
        cin >> name >> score;     // 姓名没有空格，可以直接用 cin
        cout << left << setw(8) << name;  // 左对齐，占 8 列
        cout << fixed << setprecision(1) << score << "\\n";  // 成绩保留一位小数
    }
    return 0;                     // 结束
}`,
        time: 'O(1)',
        space: 'O(1)',
        takeaway: 'setw 是一次性的，循环里每次输出都要重新设置。',
      },
    ],
    homework: ['输入一个整数，分别输出它的十进制、八进制、十六进制形式。', '试着删掉 cin.ignore()，观察 getline 读到了什么。'],
  },
  {
    id: 'expr',
    stage: 'basic',
    order: 4,
    title: '运算符与表达式',
    subtitle: '先算谁后算谁，必须心里有数',
    minutes: 25,
    keywords: ['优先级', '取模', '整除', '逻辑运算', '位运算', '三目'],
    summary: '理解算术、比较、逻辑、位运算四类运算符，掌握优先级与整除取模这两个最容易出错的地方。',
    sections: {
      concept: [
        '算术运算里，整数相除是整除：7 / 2 得 3 而不是 3.5。取模 a % b 得到余数，它和整除是一对搭档：a = (a / b) * b + a % b。',
        '比较运算的结果是 bool，只有真假两种。逻辑运算 && 表示「并且」，|| 表示「或者」，! 表示「取反」。它们有短路特性：&& 左边为假时右边不再计算，|| 左边为真时右边不再计算。',
        '优先级从高到低大致是：括号 > 单目（! ++ --）> 乘除取模 > 加减 > 比较 > 逻辑与 > 逻辑或 > 赋值。拿不准就加括号，这是最省事的做法。',
        '位运算直接操作二进制：a & b 按位与，a | b 按位或，a ^ b 异或，a << k 左移 k 位（等价乘 2^k），a >> k 右移（等价整除 2^k）。判断奇偶可以用 a & 1，比 a % 2 更快。',
      ],
      analogy: '表达式像做菜的顺序：括号是「先处理这盘」，乘除是「先切的菜」，加减是「最后下锅」。你如果按从左到右乱来，端出来的味道（结果）就不对。',
      syntax: [
        '整除与取模：int q = 17 / 5;  // 3　　int r = 17 % 5;  // 2',
        '自增：i++ 先用后加，++i 先加后用。单独作为一条语句时两者等价。',
        '三目运算：int m = a > b ? a : b;  等价于 if-else 取值。',
        '逻辑短路：if (n != 0 && sum / n > 5) 前一半为假时不会除以 0。',
        '位运算：n << 1 等于 n * 2；n >> 1 等于 n / 2（向下取整）。',
        '判断奇偶：if (n & 1) 表示 n 是奇数。',
      ],
      pitfalls: [
        { wrong: 'int mid = (l + r) / 2 在 l、r 都接近 10^9 时溢出', right: 'int mid = l + (r - l) / 2;', reason: 'l + r 先溢出，加法顺序先改掉才能安全。' },
        { wrong: 'if (a > 1 && b / a > 2) 中 a 为 0', right: 'if (a > 0 && b / a > 2)', reason: '短路只能挡住它左边已经判断过的条件，条件写错了照样崩。' },
        { wrong: 'if (1e-8 == 0.1 + 0.2 - 0.3)', right: 'if (fabs(x) < 1e-8)', reason: '浮点数有精度误差，不能直接用 == 比较。' },
        { wrong: 'cout << a + b << a > b ? "大" : "小";', right: 'cout << (a > b ? "大" : "小");', reason: '<< 优先级高于三目，不加括号会先输出再判断。' },
      ],
      keyPoints: [
        '整除与取模是算法题的地基：数位拆分、时间换算、循环队列都靠它们。',
        '涉及大数相加相乘，先把其中一个转成 long long（乘 1LL）再算。',
        '浮点比较永远用「差值小于 1e-8」，不要用 ==。',
      ],
    },
    template: {
      title: '整除、取模与位运算',
      explain: '演示三个最常用的技巧：秒数换算、判断奇偶、快速乘 2 的幂。',
      code: `#include <iostream>
using namespace std;

int main() {
    int total = 3725;             // 总秒数

    int hour = total / 3600;      // 整除得到小时
    int minute = total % 3600 / 60;  // 去掉小时后，剩下的秒再整除 60
    int second = total % 60;      // 直接对 60 取模得到秒

    cout << hour << ":" << minute << ":" << second << endl;  // 按 时:分:秒 的顺序拼起来输出

    int n = 7;                    // 用 7 试一下位运算的效果
    cout << (n & 1) << endl;      // 1 表示奇数，0 表示偶数
    cout << (n << 3) << endl;     // 左移 3 位等于乘 8，输出 56

    return 0;                     // 结束
}`,
    },
    examples: [
      {
        id: 'expr-1',
        title: '秒数换时间',
        difficulty: '入门',
        problem: '输入一个不超过 86400 的秒数，输出「时:分:秒」。',
        sample: '输入：3725　　输出：1:2:5',
        ideas: ['小时 = 总秒 / 3600。', '分钟 = 去掉小时后剩余的秒 / 60，即总秒 % 3600 / 60。', '秒 = 总秒 % 60。'],
        code: `#include <iostream>
using namespace std;

int main() {
    int s;                        // 读入总秒数
    cin >> s;
    cout << s / 3600 << ":" << s % 3600 / 60 << ":" << s % 60 << endl;  // 三个表达式依次算出时 / 分 / 秒，注意先取模再除
    return 0;                     // 结束
}`,
        time: 'O(1)',
        space: 'O(1)',
        takeaway: '从大到小逐级整除取模，是单位换算的通用套路。',
      },
      {
        id: 'expr-2',
        title: '判断能否组成三角形',
        difficulty: '入门',
        problem: '输入三个正整数，判断能否组成三角形。',
        sample: '输入：3 4 5　　输出：yes',
        ideas: ['任意两边之和大于第三边。', '为避免分类讨论，先排序，只需判断最小的两边之和大于最大边。'],
        code: `#include <iostream>
#include <algorithm>              // sort 定义在 <algorithm> 里
using namespace std;

int main() {
    int a[3];                     // 三条边先装进数组
    cin >> a[0] >> a[1] >> a[2];  // 逐个读入三个整数
    sort(a, a + 3);               // 从小到大排序
    if (a[0] + a[1] > a[2]) cout << "yes\\n";  // 只需检查一次
    else cout << "no\\n";         // 不满足两边之和大于第三边就是 no
    return 0;                     // 结束
}`,
        time: 'O(1)',
        space: 'O(1)',
        takeaway: '排序能把「三种情况」压缩成「一种情况」。',
      },
      {
        id: 'expr-3',
        title: '判断是不是 2 的幂',
        difficulty: '进阶',
        problem: '输入一个正整数 n，判断它是不是 2 的整数次幂。',
        sample: '输入：16　　输出：yes',
        ideas: ['2 的幂的二进制里只有一位是 1。', 'n & (n - 1) 会把这唯一的 1 消掉，结果为 0 就是 2 的幂。', '注意 n 必须大于 0。'],
        code: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    if (n > 0 && (n & (n - 1)) == 0) cout << "yes\\n";  // 先保证 n > 0：2 的幂二进制里只有一个 1，减一后按位与必为 0
    else cout << "no\\n";         // 其余情况都不是
    return 0;                     // 结束
}`,
        time: 'O(1)',
        space: 'O(1)',
        takeaway: '位运算常能把「循环判断」变成「一次判断」。',
      },
    ],
    homework: ['输入一个三位数，输出它的百位、十位、个位。', '自己验证：为什么 n & (n-1) 能消掉最低位的 1？'],
  },
  {
    id: 'branch',
    stage: 'basic',
    order: 6,
    title: '分支结构',
    subtitle: '让程序学会分情况办事',
    minutes: 25,
    keywords: ['if', 'else if', 'switch', '嵌套', '边界'],
    summary: '用 if / else if / switch 处理多分支，学会把条件按顺序、按边界排清楚。',
    sections: {
      concept: [
        'if 后面括号里是条件，条件为真就执行大括号里的语句。只有一条语句时大括号可以省略，但建议永远写上，避免后续加代码时踩坑。',
        '多个互斥条件用 else if 串起来，程序从上往下判断，命中一个就不再往下走。所以顺序很重要：范围判断要从窄到宽，或者用明确的区间条件。',
        'switch 适合「按几个固定值分情况」的场景，比如月份、运算符、等级。每个 case 末尾要写 break，否则会继续执行下一个分支（这叫穿透，偶尔是特性，多数是 bug）。',
        '嵌套分支不要超过三层。层数一多就该抽象成函数或用查表法，否则条件之间会互相纠缠，自己都读不懂。',
      ],
      analogy: '分支像快递分拣线：包裹先过第一道闸机（if），符合条件就走 A 通道，不符合就滑到下一道闸机（else if），最后都不匹配就进兜底的 else 通道。闸机的顺序排错了，包裹就会走错通道。',
      syntax: [
        '基本形式：if (条件) { ... } else if (条件) { ... } else { ... }',
        'switch：switch (x) { case 1: ... break; default: ... }',
        '三目运算适合取值：string s = score >= 60 ? "pass" : "fail";',
        '条件里可以组合：if (a > 0 && b > 0) 表示两个都成立。',
        '注意范围：判断 60 <= s <= 100 必须写成 s >= 60 && s <= 100，不能连写。',
      ],
      pitfalls: [
        { wrong: 'if (60 <= score <= 100)', right: 'if (score >= 60 && score <= 100)', reason: 'C++ 会先算 60 <= score 得到 0 或 1，再和 100 比较，条件几乎恒真。' },
        { wrong: 'switch 里漏写 break', right: '每个 case 结尾写 break', reason: '不写会穿透到下一个 case，多执行一段本不该执行的逻辑。' },
        { wrong: 'if (a > 0) if (b > 0) ... else ...', right: '用大括号明确配对的 else', reason: 'else 永远匹配最近的 if，缩进好看不代表逻辑正确。' },
      ],
      keyPoints: [
        '判断区间时先想清边界：是 >= 还是 >，差一个等号就是两种答案。',
        '多分支顺序按「范围从窄到宽」或者「互斥条件」排列。',
        '能用查表（数组）解决的分类，不要堆十几层 if。',
      ],
    },
    template: {
      title: '成绩等级判定',
      explain: '典型的多分支结构：条件从上到下按分数段排列，命中即停。',
      code: `#include <iostream>
using namespace std;

int main() {
    int score;
    cin >> score;

    if (score < 0 || score > 100) {  // 先挡掉非法输入
        cout << "invalid\\n";
    } else if (score >= 90) {     // 从高到低判断，命中就结束
        cout << "A\\n";
    } else if (score >= 80) {     // 80~89 分落到这里，不用再写上限
        cout << "B\\n";
    } else if (score >= 60) {     // 60~79 分是 C
        cout << "C\\n";
    } else {                      // 兜底：不及格
        cout << "D\\n";
    }
    return 0;                     // 结束
}`,
    },
    examples: [
      {
        id: 'branch-1',
        title: '三角形类型',
        difficulty: '入门',
        problem: '输入三个整数边长，判断是等边、等腰、普通三角形，或者不能组成三角形。',
        sample: '输入：3 3 5　　输出：isosceles',
        ideas: ['先排序，然后判断两边之和是否大于第三边。', '不能组成三角形直接输出。', '再看是否有两边相等，最后判断三边相等。'],
        code: `#include <iostream>
#include <algorithm>
using namespace std;

int main() {
    int a[3];
    cin >> a[0] >> a[1] >> a[2];
    sort(a, a + 3);               // 排序后最小的两条边排在最前

    if (a[0] + a[1] <= a[2]) {    // 构不成三角形，先返回
        cout << "none\\n";
        return 0;                 // 提前结束，后面的判断就不用套 else
    }
    if (a[0] == a[2]) cout << "equilateral\\n";  // 首尾相等说明三边都相等
    else if (a[0] == a[1] || a[1] == a[2]) cout << "isosceles\\n";  // 任意两边相等即等腰
    else cout << "scalene\\n";    // 都不满足就是普通三角形
    return 0;                     // 结束
}`,
        time: 'O(1)',
        space: 'O(1)',
        takeaway: '提前 return 能砍掉一层嵌套，代码立刻变清爽。',
      },
      {
        id: 'branch-2',
        title: '月份天数',
        difficulty: '入门',
        problem: '输入年份和月份，输出这个月有多少天。',
        sample: '输入：2024 2　　输出：29',
        ideas: ['1、3、5、7、8、10、12 月是 31 天。', '4、6、9、11 月是 30 天。', '2 月看闰年：能被 4 整除且不能被 100 整除，或者能被 400 整除。'],
        code: `#include <iostream>
using namespace std;

int main() {
    int year, month;
    cin >> year >> month;

    bool leap = (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);  // 闰年：能被 4 整除且不能被 100 整除，或能被 400 整除

    if (month == 2) cout << (leap ? 29 : 28) << "\\n";  // 二月按闰年给 29 或 28
    else if (month == 4 || month == 6 || month == 9 || month == 11) cout << 30 << "\\n";  // 4、6、9、11 月是 30 天
    else cout << 31 << "\\n";     // 剩下的月份都是 31 天
    return 0;                     // 结束
}`,
        time: 'O(1)',
        space: 'O(1)',
        takeaway: '闰年判断是「且」与「或」组合的经典例子。',
      },
      {
        id: 'branch-3',
        title: '简单计算器',
        difficulty: '进阶',
        problem: '输入两个整数和一个运算符（+ - * /），输出运算结果，除法保留两位小数。',
        sample: '输入：7 2 /　　输出：3.50',
        ideas: ['用 char 读运算符。', 'switch 按四种情况分支。', '除数为 0 要单独处理。'],
        code: `#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    long long a, b;
    char op;
    cin >> a >> op >> b;          // 读入 数 运算符 数

    switch (op) {
        case '+': cout << a + b << "\\n"; break;  // 每个 case 结尾必须 break，否则会穿透到下一个分支
        case '-': cout << a - b << "\\n"; break;
        case '*': cout << a * b << "\\n"; break;
        case '/':
            if (b == 0) cout << "error\\n";  // 除零必须挡
            else cout << fixed << setprecision(2) << 1.0 * a / b << "\\n";  // 1.0 让结果变成小数除法，再保留两位小数
            break;
        default: cout << "unknown\\n";  // 其它运算符兜底
    }
    return 0;                     // 结束
}`,
        time: 'O(1)',
        space: 'O(1)',
        takeaway: 'switch 适合固定值分类，但每个分支都要考虑边界。',
      },
    ],
    homework: ['输入一个年份，输出是不是闰年（用 if 而不是三目）。', '把成绩等级改成 switch 版本，体会它和 if 的适用差异。'],
  },
  {
    id: 'loop',
    stage: 'basic',
    order: 7,
    title: '循环结构',
    subtitle: '重复的事交给计算机',
    minutes: 30,
    keywords: ['for', 'while', 'break', 'continue', '嵌套', '时间复杂度'],
    summary: '掌握 for / while 的三种写法，学会用循环做累加、枚举、找素数，并建立时间复杂度直觉。',
    sections: {
      concept: [
        '循环有三个要素：从哪开始（初值）、什么时候继续（条件）、每轮怎么变（迭代）。三者缺一，循环就会跑飞或一次都不跑。',
        'for 适合次数已知的循环，while 适合次数未知、依赖条件变化的循环，do-while 至少执行一次。绝大多数枚举、累加题用 for 就够了。',
        'break 立刻结束整个循环，continue 跳过本轮剩余语句直接进入下一轮。它们只能跳出最内层一层循环，多层循环要配合标记或者封装成函数。',
        '两层循环意味着「每个 i 都把所有 j 走一遍」，总次数是两层之积。看到 O(n^2) 就要警惕：n 到 10^5 时是 10^10 次，一定超时。',
      ],
      analogy: '循环像操场跑圈：初值是你站在第几圈，条件是跑几圈，迭代是每跑完一圈计数器加一。忘写迭代，就等于一直站在起跑线不动——死循环。',
      syntax: [
        'for (int i = 0; i < n; i++) { ... }  从 0 到 n-1，共 n 次。',
        'while (n > 0) { ... n /= 10; }  次数未知时使用。',
        'do { ... } while (条件);  先执行一次再判断。',
        'break 跳出循环：if (a[i] == x) { pos = i; break; }',
        'continue 跳过本轮：if (a[i] < 0) continue;',
        '范围 for：for (int x : a) sum += x;  C++11 起可用。',
      ],
      pitfalls: [
        { wrong: 'for (int i = 0; i <= n; i++) 处理 n 个元素', right: 'for (int i = 0; i < n; i++)', reason: '<= 会多跑一次，访问 a[n] 越界。' },
        { wrong: 'while (n > 0) { sum += n; }', right: 'while (n > 0) { sum += n; n--; }', reason: '条件里的变量不变化，循环永远不会结束。' },
        { wrong: '在循环里反复写 s.size() 或 strlen', right: '循环前存进变量', reason: '某些实现每次都会重算长度，白白多一层开销。' },
        { wrong: '用 int i 遍历到 10^9 以上', right: '用 long long i', reason: 'int 装不下会溢出成负数，循环直接失控。' },
      ],
      keyPoints: [
        '写循环前先确定「循环不变量」：每轮开始时什么是已知成立的。',
        '边界一律用半开区间 [0, n)，比闭区间更不容易多一次。',
        '估算次数：n ≤ 10^5 时只能 O(n log n)，n ≤ 10^3 时 O(n^2) 可行。',
      ],
    },
    template: {
      title: '累加、最值与素数判断',
      explain: '三种最常见的循环用法放在一个模板里，值得整体背下来。',
      code: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;

    long long sum = 0;            // 累加器必须初始化
    int mx = -1;                  // 最大值初值要比所有可能值小

    for (int i = 1; i <= n; i++) {  // 从 1 到 n，共 n 次
        sum += i;                 // 累加
        if (i > mx) mx = i;       // 边循环边更新最值
    }
    cout << sum << " " << mx << "\\n";

    bool prime = n >= 2;          // 1 和 0 不是素数
    for (int d = 2; d * d <= n; d++) {  // 试除到平方根就够了
        if (n % d == 0) { prime = false; break; }  // 找到一个约数就能提前结束
    }
    cout << (prime ? "prime" : "not prime") << "\\n";  // 三目运算按真假选文案
    return 0;                     // 结束
}`,
    },
    examples: [
      {
        id: 'loop-1',
        title: '求阶乘的末尾',
        difficulty: '入门',
        problem: '输入 n（n ≤ 12），输出 n! 的值。',
        sample: '输入：5　　输出：120',
        ideas: ['阶乘从 1 累乘到 n。', '累乘器初始值是 1，不能是 0。', '12! 约 4.79×10^8，用 long long 更安全。'],
        code: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;                     // 读入 n
    long long fact = 1;           // 乘法单位元是 1
    for (int i = 1; i <= n; i++) fact *= i;  // 从 1 一直累乘到 n
    cout << fact << "\\n";        // 输出阶乘值
    return 0;                     // 结束
}`,
        time: 'O(n)',
        space: 'O(1)',
        takeaway: '累加初值 0，累乘初值 1，这是最容易记混的一对。',
      },
      {
        id: 'loop-2',
        title: '统计各位数字之和',
        difficulty: '入门',
        problem: '输入一个正整数 n（不超过 10^18），输出它各位数字之和。',
        sample: '输入：2024　　输出：8',
        ideas: ['每次用 n % 10 取最后一位。', '累加后 n /= 10 去掉最后一位。', '直到 n 变成 0 为止。'],
        code: `#include <iostream>
using namespace std;

int main() {
    long long n;                  // n 可能到 10^18，必须用 long long
    cin >> n;
    int sum = 0;                  // 数字之和最多 9 × 19，int 完全够用
    while (n > 0) {               // 次数未知，用 while
        sum += n % 10;            // 取个位
        n /= 10;                  // 去掉个位
    }
    cout << sum << "\\n";         // 输出各位数字之和
    return 0;                     // 结束
}`,
        time: 'O(log n)',
        space: 'O(1)',
        takeaway: '「% 10 取位，/ 10 移位」是处理整数的万能拆位法。',
      },
      {
        id: 'loop-3',
        title: '打印数字三角',
        difficulty: '进阶',
        problem: '输入 n，打印一个 n 行的左对齐数字三角，第 i 行输出 i 个 i。',
        sample: '输入：3　　输出：1 / 22 / 333',
        ideas: ['外层循环控制行号 i。', '内层循环控制这一行打印几个字符。', '内层结束后换行。'],
        code: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    for (int i = 1; i <= n; i++) {  // 第 i 行
        for (int j = 1; j <= i; j++) {  // 这一行打 i 个
            cout << i;            // 这一行重复打印数字 i
        }
        cout << "\\n";            // 每行结束换行
    }
    return 0;                     // 结束
}`,
        time: 'O(n^2)',
        space: 'O(1)',
        takeaway: '嵌套循环里，外层管行，内层管列，换行永远在内层之外。',
      },
    ],
    homework: ['输入 n，输出 1 到 n 中所有素数。', '用 while 重写阶乘题，体会两种循环的等价性。'],
  },
  {
    id: 'array',
    stage: 'basic',
    order: 9,
    title: '一维数组与二维数组',
    subtitle: '把一堆同类型数据排好队',
    minutes: 30,
    keywords: ['数组', '下标', '越界', '二维数组', '桶计数'],
    summary: '学会声明、遍历、求最值、做桶计数，并把「越界」和「不能整体赋值」两个坑记牢。',
    sections: {
      concept: [
        '数组是一段连续的内存，用同一个名字加不同下标访问。下标从 0 开始，长度为 n 的数组合法下标是 0 到 n-1，访问 a[n] 就是越界。',
        '数组声明时长度必须是编译期常量。想按输入的 n 决定长度，用全局数组开够上限，或者用 vector。比赛里常见写法是 const int MAXN = 100005; int a[MAXN];',
        '二维数组可以理解成「表格」，a[i][j] 是第 i 行第 j 列。常见用途是矩阵、棋盘、地图，注意行列的大小都要开够。',
        '桶计数是数组最实用的技巧之一：把数值当作下标，a[x]++ 记录 x 出现的次数。统计分数段、字母频率都用它，一次遍历就够。',
      ],
      analogy: '数组像一排编号储物柜：柜子连续排开，编号从 0 开始。你说「第 5 号柜」，管理员不会去数，直接走到位置。但如果编号超出这排柜子的范围，他就会撞墙——越界。',
      syntax: [
        '声明：int a[10];  int b[3][4];  const int MAXN = 100005; int c[MAXN];',
        '初始化：int a[5] = {0};  全部置 0；int b[3] = {1, 2}; 其余补 0。',
        '遍历：for (int i = 0; i < n; i++) cout << a[i];',
        '求最值：把 mx 初始化成 a[0]，再从 1 开始比较。',
        '二维遍历：外层 i 行，内层 j 列，两层都从 0 开始。',
        '长度：sizeof(a) / sizeof(a[0]) 只对真正的数组有效，传进函数后就失效。',
      ],
      pitfalls: [
        { wrong: 'int a[n]; 用变量 n 当长度', right: 'const int MAXN; int a[MAXN]; 或 vector<int> a(n);', reason: '标准 C++ 不允许变长数组，部分编译器能过但换环境就编译失败。' },
        { wrong: 'a = b; 想整体复制数组', right: 'for 循环逐个复制，或用 memcpy', reason: '数组名是地址常量，不能整体赋值。' },
        { wrong: 'for (int i = 1; i <= n; i++) 处理 a[0..n-1]', right: 'for (int i = 0; i < n; i++)', reason: '下标与元素个数错位，既漏掉 a[0] 又越界访问 a[n]。' },
        { wrong: '局部数组 int a[100000] 直接声明', right: '放到全局，或缩小规模', reason: '局部数组在栈上，开太大直接爆栈崩溃。' },
      ],
      keyPoints: [
        '下标区间 [0, n) 是统一约定，别混用 1 开始。',
        '大数组一律开在全局，局部大数组容易爆栈。',
        '桶计数把「查找次数」变成「一次下标访问」，是 O(n) 优化利器。',
      ],
    },
    template: {
      title: '读入数组并求最大最小值',
      explain: '标准流程：先读 n，再读 n 个数，遍历时同步维护最值。',
      code: `#include <iostream>
using namespace std;

const int MAXN = 100005;          // 全局开够上限，避免爆栈
int a[MAXN];                      // 全局数组自动清零，也不会爆栈

int main() {
    int n;
    cin >> n;
    for (int i = 0; i < n; i++) cin >> a[i];  // 下标 0 到 n-1

    int mx = a[0], mn = a[0];     // 用第一个元素当初值
    long long sum = 0;            // 总和可能超过 int 范围
    for (int i = 1; i < n; i++) {  // 从第二个开始比较
        if (a[i] > mx) mx = a[i];  // 遇到更大的就更新最大值
        if (a[i] < mn) mn = a[i];  // 遇到更小的就更新最小值
    }
    for (int i = 0; i < n; i++) sum += a[i];  // 单独一轮求总和

    cout << mx << " " << mn << " " << sum << "\\n";  // 按题意用空格分隔输出
    return 0;                     // 结束
}`,
    },
    examples: [
      {
        id: 'array-1',
        title: '最大值与它的位置',
        difficulty: '入门',
        problem: '输入 n 个整数，输出最大值以及它第一次出现的位置（从 1 开始编号）。',
        sample: '输入：5 / 3 9 2 9 1　　输出：9 2',
        ideas: ['位置用 1 开始，循环变量本身是 0 开始，记录时加 1。', '用 > 而不是 >=，保证记录第一次出现的位置。'],
        code: `#include <iostream>
using namespace std;

const int MAXN = 100005;
int a[MAXN];

int main() {
    int n;
    cin >> n;
    for (int i = 0; i < n; i++) cin >> a[i];

    int mx = a[0], pos = 1;       // 初值取第一个元素，位置从 1 开始编号
    for (int i = 1; i < n; i++) {
        if (a[i] > mx) {          // 严格大于，遇到相同值不更新
            mx = a[i];            // 同步更新最大值本身
            pos = i + 1;          // 题目要 1 基编号
        }
    }
    cout << mx << " " << pos << "\\n";
    return 0;                     // 结束
}`,
        time: 'O(n)',
        space: 'O(n)',
        takeaway: '要「第一次出现」就用 >，要「最后一次」就用 >=。',
      },
      {
        id: 'array-2',
        title: '数组逆序',
        difficulty: '入门',
        problem: '输入 n 个整数，按相反顺序输出。',
        sample: '输入：4 / 1 2 3 4　　输出：4 3 2 1',
        ideas: ['从 n-1 开始倒着遍历。', '输出时注意空格只在数之间，末尾不要多空格。'],
        code: `#include <iostream>
using namespace std;

const int MAXN = 100005;
int a[MAXN];

int main() {
    int n;
    cin >> n;
    for (int i = 0; i < n; i++) cin >> a[i];

    for (int i = n - 1; i >= 0; i--) {  // 倒着走
        cout << a[i];
        if (i > 0) cout << " ";   // 最后一个数后面不加空格
    }
    cout << "\\n";                // 整行输出结束，最后补一个换行
    return 0;                     // 结束
}`,
        time: 'O(n)',
        space: 'O(n)',
        takeaway: '输出格式里的空格位置，是最容易被判错又最难自查的细节。',
      },
      {
        id: 'array-3',
        title: '统计分数段',
        difficulty: '进阶',
        problem: '输入 n 个 0 到 100 的分数，输出每个十段（90-100、80-89 …）的人数。',
        sample: '输入：5 / 95 82 77 100 60',
        ideas: ['分数范围很小，适合桶计数。', '用 score / 10 当成桶下标。', '100 分单独归到第 10 个桶。'],
        code: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int bucket[11] = {0};         // 0 到 10 共 11 个桶

    for (int i = 0; i < n; i++) {  // 逐个读入分数
        int score;
        cin >> score;
        bucket[score / 10]++;     // 100 分落在 bucket[10]
    }

    for (int i = 10; i >= 0; i--) {  // 从高分段往低分段输出
        if (bucket[i] > 0) cout << i * 10 << "s: " << bucket[i] << "\\n";  // 只打印有人的分数段
    }
    return 0;                     // 结束
}`,
        time: 'O(n)',
        space: 'O(1)',
        takeaway: '值域小的时候，桶计数能把排序问题变成计数问题。',
      },
    ],
    homework: ['输入 n 个数，输出其中第二大的数（要求只遍历一遍）。', '用二维数组打印一个 n 行的杨辉三角。'],
  },
  {
    id: 'string',
    stage: 'basic',
    order: 11,
    title: '字符串处理',
    subtitle: '逐字符读懂一段文字',
    minutes: 30,
    keywords: ['std::string', 'getline', 'substr', 'find', '字符判断', '回文'],
    summary: '掌握 std::string 的常用操作，学会遍历字符做统计、判断回文、切分单词。',
    sections: {
      concept: [
        'std::string 是 C++ 提供的字符串类型，可以像数组一样用 s[i] 访问每个字符，用 s.size() 得到长度。它比 char 数组安全，会自动管理内存。',
        '下标同样从 0 开始，最后一个字符是 s[s.size() - 1]。注意 size() 返回无符号类型，s.size() - 1 在空串时会绕回一个极大值，判断空串要单独处理。',
        '常用操作：s.substr(起点, 长度) 取子串，s.find("abc") 找子串位置（找不到返回 string::npos），s += "x" 追加，s.append() 同理。',
        '字符级判断用 <cctype> 里的函数：isalpha 字母、isdigit 数字、isspace 空白、isupper 大写、islower 小写、toupper 转大写、tolower 转小写。它们比手写比较更清楚。',
      ],
      analogy: '字符串像一串珠子，每颗珠子是一个字符。s[i] 是拿起第 i 颗，substr 是剪下连续一段，find 是从头找有没有某一小串珠子连在一起。',
      syntax: [
        '声明与读入：string s; cin >> s;  带空格用 getline(cin, s);',
        '长度与下标：s.size() 或 s.length()；s[0] 是首字符。',
        '子串：s.substr(2, 3)  从下标 2 开始取 3 个字符。',
        '查找：if (s.find("ab") != string::npos) 表示存在。',
        '拼接：string t = s + "!";  s += "!";',
        '数字互转：stoi(s) 转 int，stoll(s) 转 long long，to_string(x) 数字转字符串。',
      ],
      pitfalls: [
        { wrong: '用 cin >> s 读「hello world」', right: 'getline(cin, s)', reason: 'cin 只读到空格前，后半句被留到下一次读入。' },
        { wrong: 'for (int i = 0; i < s.size() - 1; i++) 遍历空串', right: 'if (s.empty()) return;', reason: 'size() 是无符号数，空串减 1 会变成巨大的值，循环失控。' },
        { wrong: '把中文字符串按 s[i] 逐字处理', right: '按 UTF-8 或整体处理', reason: '一个汉字占多个字节，逐字节会把字拆碎。' },
        { wrong: 's.substr(n, 5) 当 n 等于长度时', right: '先判断 n < s.size()', reason: '起点越界会抛出异常，直接终止程序。' },
      ],
      keyPoints: [
        '读入前先判断是否含空格，含空格必须 getline。',
        '遍历字符统计时，一次循环里用 if 链或桶数组分类，别写三遍循环。',
        '比较两串是否回文，用双指针从两端向中间收。',
      ],
    },
    template: {
      title: '统计字符串中的字符类别',
      explain: '一个通用骨架：读整行，逐字符分类计数，最后按格式输出。',
      code: `#include <iostream>
#include <string>
#include <cctype>                 // isalpha / isdigit / isspace
using namespace std;

int main() {
    string line;
    getline(cin, line);           // 读入整行，包含空格

    int letters = 0, digits = 0, spaces = 0, others = 0;  // 四类计数器一起初始化
    for (char c : line) {         // 范围 for，逐个取出字符
        if (isalpha(c)) letters++;  // 字母
        else if (isdigit(c)) digits++;  // 数字
        else if (isspace(c)) spaces++;  // 空格与制表符
        else others++;            // 其它符号
    }

    cout << letters << " " << digits << " " << spaces << " " << others << "\\n";  // 按题目要求的顺序输出四个数
    return 0;                     // 结束
}`,
    },
    examples: [
      {
        id: 'string-1',
        title: '判断回文串',
        difficulty: '入门',
        problem: '输入一个不含空格的字符串，判断它是否正着读反着读都一样。',
        sample: '输入：level　　输出：yes',
        ideas: ['双指针：i 从前往后，j 从后往前。', '每次比较 s[i] 与 s[j]，不同立刻判否。', 'i >= j 时说明全部对称。'],
        code: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string s;
    cin >> s;

    bool ok = true;               // 先假设是回文
    int i = 0, j = (int)s.size() - 1;  // 注意转 int，避免无符号下溢
    while (i < j) {
        if (s[i] != s[j]) { ok = false; break; }  // 两端字符不同，立刻判否并跳出
        i++; j--;                 // 两端同时向中间收
    }
    cout << (ok ? "yes" : "no") << "\\n";  // 用三目输出结论
    return 0;                     // 结束
}`,
        time: 'O(n)',
        space: 'O(1)',
        takeaway: '双指针能把「两两比较」的 O(n^2) 降成 O(n)。',
      },
      {
        id: 'string-2',
        title: '统计单词个数',
        difficulty: '进阶',
        problem: '输入一行英文句子，统计其中单词个数（单词之间可能有多个空格）。',
        sample: '输入：I  love   cpp　　输出：3',
        ideas: ['连续非空格字符组成一个单词。', '当前字符非空格且前一个字符是空格或开头，就是一个新单词。', '结尾是字母也要算进去，因为计数发生在单词开头。'],
        code: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string s;
    getline(cin, s);              // 整行读入，空格全部保留

    int count = 0;                // 单词计数器
    for (int i = 0; i < (int)s.size(); i++) {
        bool start = (s[i] != ' ') && (i == 0 || s[i - 1] == ' ');  // 单词开头
        if (start) count++;       // 只在单词开头加一
    }
    cout << count << "\\n";       // 输出单词个数
    return 0;                     // 结束
}`,
        time: 'O(n)',
        space: 'O(1)',
        takeaway: '判断「开头」比判断「结尾」好写，因为不用处理字符串结束。',
      },
      {
        id: 'string-3',
        title: '凯撒密码',
        difficulty: '进阶',
        problem: '输入一个只含字母的字符串和一个整数 k，把每个字母向后移动 k 位（z 之后回到 a）。',
        sample: '输入：abc 2　　输出：cde',
        ideas: ['字母在编码上是连续的。', '先转成 0 到 25 的相对位置，加 k 后对 26 取模，再转回字母。', '大小写要分别处理，保持原样。'],
        code: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string s;
    int k;
    cin >> s >> k;                // 先读原文再读位移量

    for (char &c : s) {           // 引用遍历，直接改原串
        if (c >= 'a' && c <= 'z') c = 'a' + (c - 'a' + k) % 26;  // 小写：先减 a 得到 0~25，加 k 取模再还原
        else if (c >= 'A' && c <= 'Z') c = 'A' + (c - 'A' + k) % 26;  // 大写同理，基准换成 A
    }
    cout << s << "\\n";           // 输出加密后的整串
    return 0;                     // 结束
}`,
        time: 'O(n)',
        space: 'O(1)',
        takeaway: '环形位移的通用写法是「减去起点、取模、加回起点」。',
      },
    ],
    homework: ['输入一个字符串，输出反转后的结果（不许用 reverse）。', '统计一行文字里出现次数最多的字母。'],
  },
  {
    id: 'function',
    stage: 'basic',
    order: 12,
    title: '函数与作用域',
    subtitle: '把逻辑打包，反复使用',
    minutes: 25,
    keywords: ['函数', '返回值', '引用传参', '作用域', '重载'],
    summary: '学会封装函数、正确传参（值传递与引用传递）、管理作用域，为递归和模块化打基础。',
    sections: {
      concept: [
        '函数把一段逻辑命名打包，调用时只需写名字和参数。它让主流程变短，也让同一段逻辑可以反复使用、单独测试。',
        '参数传递分两种：值传递会复制一份副本，函数里怎么改都不影响外面；引用传递（类型后面加 &）直接操作原变量，改了就生效。想通过参数把结果带出来，就用引用。',
        '函数要先声明后使用。定义写在 main 之前最省事；如果写在 main 之后，就在前面写一行原型声明，告诉编译器「这个函数存在，参数和返回类型是这样」。',
        '作用域指变量能生效的范围。在函数里声明的变量出了函数就消失；全局变量整个程序都能用，但滥用会让程序难以排查问题。同名时局部变量会遮盖全局变量。',
      ],
      analogy: '函数像外卖套餐：你报套餐名（函数名）和口味要求（参数），后厨按流程做好（函数体），最后把餐递出来（返回值）。引用传参相当于你把自家饭盒递进去，厨师直接往你的饭盒里装。',
      syntax: [
        '返回值：int add(int a, int b) { return a + b; }',
        '无返回值：void printLine(int n) { ... }',
        '引用传参：void swap(int &a, int &b) { ... } 能真正交换。',
        '数组传参：void fill(int a[], int n)，数组会退化成指针，长度要单独传。',
        '函数原型：int add(int, int); 写在 main 前面，定义放后面。',
        '重载：同名函数参数类型不同即可共存，例如 int max(int,int) 与 double max(double,double)。',
      ],
      pitfalls: [
        { wrong: 'int f(int x) { x + 1; }', right: 'int f(int x) { return x + 1; }', reason: '漏写 return，函数返回的是随机值，编译器只给警告。' },
        { wrong: 'void change(int x) { x = 5; } 想改外面的值', right: 'void change(int &x) { x = 5; }', reason: '值传递改的是副本，外面完全不受影响。' },
        { wrong: '把数组长度也当成函数内部可得', right: '把 n 一起传进去', reason: '数组作参数会退化成指针，函数里算不出原本的元素个数。' },
        { wrong: '递归函数没写终止条件', right: '先写 if (边界) return ...', reason: '无限递归会栈溢出，程序直接崩溃。' },
      ],
      keyPoints: [
        '一个函数只做一件事，名字要能说明它做什么。',
        '需要带回结果时优先用返回值，需要带回多个结果时才用引用。',
        '递归的三件套：终止条件、规模缩小、结果合并。',
      ],
    },
    template: {
      title: '素数判断与最大公约数',
      explain: '两个高频小函数，演示返回值与引用传参两种写法。',
      code: `#include <iostream>
using namespace std;

bool isPrime(int n) {             // 返回 bool：只判断真假
    if (n < 2) return false;      // 边界先处理
    for (int d = 2; d * d <= n; d++) {  // 试除到 √n 就够了，再往后是重复判断
        if (n % d == 0) return false;
    }
    return true;                  // 没找到任何约数就是素数
}

long long gcd(long long a, long long b) {  // 辗转相除，返回公约数
    while (b != 0) {
        long long t = a % b;      // 余数
        a = b;                    // 用较小数继续
        b = t;
    }
    return a;                     // b 变成 0 时，a 就是最大公约数
}

void swapValue(int &a, int &b) {  // 引用传参：真交换
    int t = a; a = b; b = t;      // 借一个临时变量完成交换，缺了它就会丢值
}

int main() {
    int n = 12;
    cout << isPrime(n) << " " << gcd(24, 36) << "\\n";  // 两个函数依次调用，结果用空格隔开
    int x = 1, y = 2;
    swapValue(x, y);              // 外面的 x、y 真的变了
    cout << x << " " << y << "\\n";
    return 0;                     // 结束
}`,
    },
    examples: [
      {
        id: 'function-1',
        title: '区间内的素数个数',
        difficulty: '入门',
        problem: '输入 L 和 R（L ≤ R ≤ 10000），输出区间内素数的个数。',
        sample: '输入：10 20　　输出：4',
        ideas: ['复用 isPrime 函数。', '主函数只负责循环与计数，判断逻辑交给函数。', '边界含 L 和 R，循环用 <=。'],
        code: `#include <iostream>
using namespace std;

bool isPrime(int n) {
    if (n < 2) return false;      // 0 和 1 都不是素数
    for (int d = 2; d * d <= n; d++)
        if (n % d == 0) return false;
    return true;
}

int main() {
    int l, r;                     // 区间的左右端点
    cin >> l >> r;
    int cnt = 0;
    for (int i = l; i <= r; i++) if (isPrime(i)) cnt++;  // 含两端，逐个判断
    cout << cnt << "\\n";         // 输出素数的个数
    return 0;                     // 结束
}`,
        time: 'O((R-L)√R)',
        space: 'O(1)',
        takeaway: '主流程只写业务，细节藏进函数，代码立刻变短。',
      },
      {
        id: 'function-2',
        title: '用引用传参求平均值',
        difficulty: '进阶',
        problem: '输入 n 个整数，写一个函数同时算出总和与平均值。',
        sample: '输入：3 / 4 5 6　　输出：15 5.00',
        ideas: ['两个结果无法用一个 return 带回。', '总和用 long long 引用，平均值用 double 引用。', '函数返回值设为 void。'],
        code: `#include <iostream>
#include <iomanip>
using namespace std;

void stats(int a[], int n, long long &sum, double &avg) {  // 数组退化成指针，长度要单独传；两个 & 参数负责把结果带出去
    sum = 0;                      // 引用参数先清零，否则会带上随机值
    for (int i = 0; i < n; i++) sum += a[i];
    avg = 1.0 * sum / n;          // 1.0 保证小数除法
}

int main() {
    int n, a[10000];              // 题目规模不大，开 10000 够用
    cin >> n;
    for (int i = 0; i < n; i++) cin >> a[i];

    long long sum; double avg;
    stats(a, n, sum, avg);        // 引用参数把两个结果带出来
    cout << sum << " " << fixed << setprecision(2) << avg << "\\n";  // 总和与平均值一起输出
    return 0;                     // 结束
}`,
        time: 'O(n)',
        space: 'O(1)',
        takeaway: '一个函数要带回多个结果时，用引用参数最自然。',
      },
      {
        id: 'function-3',
        title: '递归求阶乘',
        difficulty: '挑战',
        problem: '用递归函数计算 n!（n ≤ 20）。',
        sample: '输入：5　　输出：2432902008176640000（20!）',
        ideas: ['终止条件：n 为 0 或 1 时返回 1。', '规模缩小：n! = n × (n-1)!。', '20! 超出 int，用 long long。'],
        code: `#include <iostream>
using namespace std;

long long fact(int n) {
    if (n <= 1) return 1;         // 终止条件必须写在最前面
    return 1LL * n * fact(n - 1);  // 规模缩小，再合并结果
}

int main() {
    int n;
    cin >> n;
    cout << fact(n) << "\\n";     // 从 fact(n) 开始一路递归到 1
    return 0;                     // 结束
}`,
        time: 'O(n)',
        space: 'O(n)（递归栈）',
        takeaway: '递归就是「终止条件 + 规模缩小」，缺一不可。',
      },
    ],
    homework: ['写一个函数判断闰年，并在 main 里打印 2000 到 2100 年的所有闰年。', '把前面的回文题封装成 bool isPalindrome(string s)。'],
  },
];
