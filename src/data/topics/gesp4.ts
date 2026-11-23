// EXPORTS: GESP4_TOPICS（文件读写与异常、高精度、链表、分治、类与对象、数学库）

import type { ITopic } from '../types';

/** GESP 四级：文件读写与异常处理 */
const fileIo: ITopic = {
  id: 'file-io',
  stage: 'cert',
  order: 30,
  title: '文件读写与异常处理',
  subtitle: '把数据从文件搬进来，把结果写出去',
  minutes: 35,
  keywords: ['freopen', 'ifstream', 'ofstream', 'getline', 'EOF', 'try-catch', '异常'],
  summary: '竞赛常用的 freopen 重定向、fstream 的读写流程、逐行与逐词读取、直到文件尾的写法、异常捕获与输入合法性检查。',
  sections: {
    concept: [
      '程序的标准输入输出默认接在键盘和屏幕（控制台）上。做题时数据往往放在文件里，有两种方式接到文件：一是「重定向」，把 cin/cout 的底层流换成文件；二是「文件流」，直接开一个 ifstream/ofstream 对象读写。前者代码几乎不用改，后者更灵活、能同时读写多个文件。',
      'freopen 是最常用的竞赛写法：freopen("in.txt", "r", stdin) 把标准输入重定向到 in.txt，freopen("out.txt", "w", stdout) 把标准输出重定向到 out.txt。这两行写在 main 开头，之后所有 cin/cout 都自动读写文件。注意路径是相对于「运行时的工作目录」，不是源代码所在目录，这是新手最常见的「文件打不开」原因。',
      '文件流的写法：ifstream fin("in.txt"); 若打开失败，fin.is_open() 为 false 或 fin.fail() 为 true，必须检查。ofstream fout("out.txt") 默认会清空原文件，想追加要加 ios::app。用完可以 fin.close()，虽然析构会自动关闭，但显式关闭更清晰。',
      '读取方式决定了处理逻辑。fin >> x 会跳过空白（空格、换行、制表符），适合读数字和单词；getline(fin, line) 读一整行（不含换行符），适合读含空格的句子；fin.get(c) 连空白一起读，适合逐字符处理。混用 >> 与 getline 时，>> 会把行末的换行留在缓冲区，紧接着的 getline 会读到空行，需要先 fin.ignore() 吃掉换行。',
      '「读到文件尾」的标准写法是 while (fin >> x) 或 while (getline(fin, line))。表达式返回流对象，在布尔上下文里等价于「上一次读取是否成功」，读到末尾失败就退出循环，不需要预先知道数据个数，也不会多读一次。写成 while (!fin.eof()) 是常见错误——eof() 只有在尝试读取失败后才为真，会多处理一轮。',
      '异常处理用 try / catch / throw。throw 抛出一个值（常用 std::runtime_error 或字符串），catch 按类型捕获。C++ 的数组越界、除以零默认不会抛异常，需要自己检查后 throw；标准库的 vector::at、string::substr 越界会抛 std::out_of_range。竞赛中异常主要用于「输入不合法时给出清晰提示」，不要用它替代正常的 if 判断，因为异常开销大。',
      '输入健壮性检查是最实用的部分：读完后检查 cin.fail() 判断格式是否匹配（比如该读数字却读到字母）；用 cin.clear() 清掉错误状态再 cin.ignore() 跳过坏字符才能继续读；读入的 n 是否在 1..MAXN 范围内；除数为 0 要提前拦。这些检查能让程序在脏数据下给出提示，而不是崩溃或输出垃圾。',
    ],
    analogy:
      'freopen 像把水管从「水龙头」改接到「水桶」：管子没变，只是源头换了。文件流则像另外接一根新管子专门抽水桶里的水，原来的水龙头还能继续用。',
    keyPoints: [
      'freopen 两行搞定重定向，路径相对运行目录而不是源码目录。',
      '文件流打开后必须先判断 is_open()，再读写。',
      '>> 跳空白、getline 读整行、get 连空白一起读，三者用途不同。',
      '读完用 while (fin >> x)，不要用 while (!fin.eof())。',
      '异常用于报告错误，正常分支判断仍用 if。',
    ],
    syntax: [
      'freopen("in.txt", "r", stdin); freopen("out.txt", "w", stdout);',
      'ifstream fin("in.txt"); if (!fin.is_open()) { cerr << "打开失败"; return 1; }',
      'ofstream fout("out.txt"); fout << x << " " << y << endl; fout.close();',
      '逐行：string line; while (getline(fin, line)) { ... }',
      '逐词：string word; while (fin >> word) { ... }',
      '追加模式：ofstream fout("log.txt", ios::app);',
      '异常：try { ... throw runtime_error("bad"); } catch (const exception &e) { cerr << e.what(); }',
      '格式检查：if (!(cin >> n)) { cin.clear(); cin.ignore(1000, \'\\n\'); }',
    ],
    pitfalls: [
      {
        wrong: 'while (!fin.eof()) { fin >> x; sum += x; }',
        right: 'while (fin >> x) sum += x;',
        reason: 'eof() 要等一次读取失败后才为真，循环会多执行一轮，把未更新的 x 重复加进答案。',
      },
      {
        wrong: 'freopen("in.txt", "r", stdin) 写在 main 之外或读入之后',
        right: '写在 main 的第一条语句',
        reason: '重定向必须早于任何读写；写在读入之后，前面的 cin 已经从键盘读过了。',
      },
      {
        wrong: 'cin >> n; getline(cin, s);  // 想读一整行',
        right: 'cin >> n; cin.ignore(); getline(cin, s);',
        reason: '>> 把行末换行留在缓冲区，getline 立刻读到这个空行，得到空串。',
      },
    ],
  },
  template: {
    title: 'file_io.cpp',
    explain: '同一份数据分别用 freopen 与 fstream 读取，演示逐词/逐行读取、输出到文件、异常捕获与输入校验。',
    code: `#include <iostream>
#include <fstream>
#include <string>
#include <stdexcept>
using namespace std;

int main() {
    // ── 方式一：重定向，之后 cin/cout 全部指向文件
    freopen("in.txt", "r", stdin);
    freopen("out.txt", "w", stdout);
    int n;
    if (!(cin >> n)) {                 // 读不到数字说明文件为空或格式错
        cerr << "in.txt 里没有整数" << endl;
        return 1;                      // 用返回码告诉评测机出错了
    }
    long long sum = 0;
    for (int i = 0; i < n; i++) {
        long long x;
        cin >> x;                      // >> 会自动跳过空格和换行
        sum += x;
    }
    cout << sum << endl;               // 写到 out.txt

    // ── 方式二：文件流，可以同时操作多个文件
    ifstream fin("in.txt");
    if (!fin.is_open()) {              // 打开失败必须检查
        cerr << "打不开 in.txt，检查运行目录" << endl;
        return 1;
    }
    string line;
    int lines = 0;
    while (getline(fin, line)) {       // 逐行读到文件尾，读到失败即退出
        ++lines;
    }
    cout << "行数 " << lines << endl;
    fin.close();                       // 显式关闭

    ofstream fout("log.txt", ios::app);   // 追加模式，不清空原内容
    fout << "sum = " << sum << endl;
    fout.close();

    // ── 异常：自己检查后抛，按类型捕获
    try {
        int d = 0;
        if (d == 0) throw runtime_error("除数为 0");
        cout << 10 / d << endl;
    } catch (const exception &e) {
        cerr << "捕获异常：" << e.what() << endl;
    }
    return 0;
}`,
  },
  examples: [
    {
      id: 'io-e1',
      title: '把 n 个数读进数组并求和',
      difficulty: '入门',
      problem: 'in.txt 第一行是 n，第二行是 n 个整数，求和写到 out.txt。',
      sample: 'in.txt：5\\n1 2 3 4 5   out.txt：15',
      ideas: [
        'main 开头 freopen 两行完成输入输出重定向。',
        '读 n，再循环读 n 个数累加。',
        '结果直接 cout，自动写进 out.txt。',
        '若 n 很大，用 long long 存和，避免溢出。',
      ],
      code: `int main() {
    freopen("in.txt", "r", stdin);     // 输入接到文件
    freopen("out.txt", "w", stdout);   // 输出接到文件
    int n; cin >> n;
    long long sum = 0;
    for (int i = 0; i < n; i++) { long long x; cin >> x; sum += x; }
    cout << sum << endl;
    return 0;
}`,
      time: 'O(n)',
      space: 'O(1)',
      takeaway: '重定向写在 main 第一行，之后所有 cin/cout 都不用改，这是竞赛最省事的文件写法。',
    },
    {
      id: 'io-e2',
      title: '统计文件中的单词',
      difficulty: '进阶',
      problem: '读一个文本文件，统计不同单词个数与总单词数（单词以空白分隔，忽略大小写）。',
      sample: '输入：Hello world hello  输出：2 3',
      ideas: [
        '用 while (fin >> word) 逐词读取，>> 自动跳过所有空白。',
        '把单词统一转小写，再放进 set 去重。',
        '总单词数在循环里累加，不同单词数取 set 的大小。',
        '如果单词含标点，需要先剔除标点再统计。',
      ],
      code: `int main() {
    ifstream fin("text.txt");
    if (!fin.is_open()) { cerr << "打开失败"; return 1; }
    set<string> distinct;              // 自动去重并排序
    string w;
    int total = 0;
    while (fin >> w) {                 // 读到文件尾自动结束
        for (char &c : w) c = tolower(c);   // 统一小写
        distinct.insert(w);
        ++total;
    }
    cout << distinct.size() << " " << total << endl;
    return 0;
}`,
      time: 'O(总字符数 × log 单词数)',
      space: 'O(不同单词数)',
      takeaway: '逐词读取用 >>，逐行读取用 getline；判断结束靠「读取是否成功」，不靠 eof()。',
    },
  ],
  homework: [
    '写一个程序，把 in.txt 的每行前后加上行号，写到 out.txt。',
    '统计一个文件中的字符数、行数、单词数（模仿 wc 命令）。',
    '故意把 in.txt 删掉，观察 is_open() 返回 false 时的行为，并给出友好提示。',
    '实现「读入 n 后校验 1 ≤ n ≤ 1000」，越界时抛出异常并在 catch 中打印具体值。',
  ],
};

/** GESP 五级：高精度计算 */
const bigint: ITopic = {
  id: 'bigint',
  stage: 'contest',
  order: 31,
  title: '高精度计算',
  subtitle: '用数组装下 long long 也装不下的数',
  minutes: 40,
  keywords: ['高精度', '大整数', '竖式', '进位', '借位', '压位', '高精除低精'],
  summary: '用数组模拟竖式加减乘，理解低位在前的存储约定、进位与借位的处理、以及压位优化为什么能快十倍。',
  sections: {
    concept: [
      'long long 上限约 9.2×10^18，只够 19 位十进制数字。阶乘、斐波那契、2 的幂、大数乘法很快就会突破这个上限。解决办法是用数组按位存储，手工模拟小学竖式运算，这就是高精度（大整数）算法。',
      '存储约定：把数字拆成一位一位存进数组，并且「低位在前」——a[0] 存个位，a[1] 存十位。这样做的好处是进位时下标自然往后走，位数增加只要在末尾追加，不需要整体搬移。读入时先读成字符串，再倒序填进数组。',
      '高精度加法：从低位到高位逐位相加，加上进位，当前位保留 (sum % 10)，进位是 sum / 10。两个数都处理完后，如果还有进位就再补一位。高精度减法要求被减数不小于减数（否则先交换并记负号）：逐位相减，不够减就向高位借 1，当前位加 10。',
      '高精度乘法（高精 × 高精）：结果第 i+j 位由 a[i] × b[j] 贡献，把所有贡献累加到 c[i+j]，最后统一从低位到高位处理进位。这样写比「边乘边进位」简单，且不容易出错。结果长度最多是两数位数之和。',
      '高精度除法（高精 ÷ 低精）：从高位到低位逐位处理，把「余数 × 10 + 当前位」作为被除数，商当前位是它除以除数，余数更新为它模除数。注意必须从高位开始，和加减乘的低位优先正好相反。高精 ÷ 高精需要试商，复杂度高，通常用减法或二分配合。',
      '压位：不用一位存一个数字，而是一位存 4 个或 9 个十进制位（视 base 取 10000 或 10^9），这样数组长度缩短 4 到 9 倍，运算次数同比减少。代价是进位、输出时要按位宽补前导零（比如 4 位压位输出时中间块要写 %04d）。竞赛里常用 4 位压位，兼顾速度与调试难度。',
      '高精度的常见坑：忘记清空数组导致残留高位；减法结果为 0 时仍输出前导零；乘法后没有去掉多余的高位零；读入含前导零（007）；负数处理缺失。写完后一定要用 Python 的 int 或 long long 在小数据上对拍。',
    ],
    analogy:
      '高精度就是把你在纸上列竖式的过程搬进数组：个位对齐、逐位相加、进位往左推一格。数组下标就是从右往左数的位数。',
    keyPoints: [
      '低位在前存储，进位与扩容都最省事。',
      '加法逐位加、处理进位；减法逐位减、不够借位。',
      '乘法用 c[i+j] += a[i] * b[j]，最后统一进位。',
      '除法必须从高位开始，商位 = 当前被除数 / 除数。',
      '压位用 base=10000，运算量降为 1/4，输出要补零。',
    ],
    syntax: [
      '读入：string s; cin >> s; int len = s.size(); for (int i = 0; i < len; i++) a[i] = s[len-1-i] - \'0\';',
      '加法核心：c[i] = a[i] + b[i] + carry; carry = c[i] / 10; c[i] %= 10;',
      '减法核心：if (a[i] < b[i]) { a[i] += 10; a[i+1]--; } c[i] = a[i] - b[i];',
      '乘法核心：c[i+j] += a[i] * b[j]; 之后 for i: c[i+1] += c[i]/10, c[i] %= 10;',
      '除法核心：rem = rem * 10 + a[i]; q[i] = rem / d; rem %= d;',
      '输出：从最高位非零位开始倒序打印；压位时用 printf("%04d") 补前导零。',
    ],
    pitfalls: [
      {
        wrong: 'for (int i = 0; i < n; i++) c[i] = a[i] + b[i];  // 不进位',
        right: 'c[i] = a[i] + b[i] + carry; carry = c[i] / 10; c[i] %= 10;',
        reason: '每一位相加可能 ≥ 10，必须把进位带到下一位，否则结果每位都可能超过 9。',
      },
      {
        wrong: '输出时从 c[0] 开始正序打印',
        right: '从最高位（长度减一）倒序打印到 c[0]',
        reason: '低位在前存储，正序输出会把个位打到最前面，数字完全颠倒。',
      },
      {
        wrong: '压位输出时直接 cout << c[i]',
        right: 'printf("%04d", c[i])（除最高位外补前导零）',
        reason: '压位存储每块代表 4 位十进制，中间块不足 4 位时必须补 0，否则 10000 会变成 10000 与 1 拼接成 100001。',
      },
    ],
  },
  template: {
    title: 'bigint.cpp',
    explain: '高精度加、减、乘（高精×低精）、除（高精÷低精）的完整模板，低位在前存储，附比较与输出。',
    code: `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

const int MAXL = 10005;
int a[MAXL], b[MAXL], c[MAXL];

int readNum(int *x) {                 // 读字符串并倒序存进数组，返回位数
    string s;
    cin >> s;
    int len = s.size();
    for (int i = 0; i < len; i++) x[i] = s[len - 1 - i] - '0';  // 低位在前
    return len;
}

void printNum(int *x, int len) {      // 从最高位倒序输出
    int p = len - 1;
    while (p > 0 && x[p] == 0) --p;   // 跳过前导零，但至少保留一位
    for (int i = p; i >= 0; i--) cout << x[i];
    cout << endl;
}

int add(int *x, int y, int lx, int ly) {   // 高精 + 高精
    int len = max(lx, ly), carry = 0;
    for (int i = 0; i < len; i++) {
        int sum = x[i] + y + carry;     // y 传的是 b[i] 的引用值
        c[i] = sum % 10;                // 当前位
        carry = sum / 10;               // 进位
    }
    if (carry > 0) c[len++] = carry;    // 最高位还有进位
    return len;
}

int sub(int *x, int *y, int lx, int ly) {  // 高精 - 高精，保证 x >= y
    for (int i = 0; i < lx; i++) {
        if (x[i] < y[i]) {              // 不够减就借位
            x[i] += 10;
            x[i + 1]--;
        }
        c[i] = x[i] - y[i];
    }
    int len = lx;
    while (len > 1 && c[len - 1] == 0) --len;   // 去掉高位零
    return len;
}

int mulSmall(int *x, int lx, int k) {  // 高精 × 低精
    long long carry = 0;
    for (int i = 0; i < lx; i++) {
        long long cur = (long long)x[i] * k + carry;  // 用 64 位防溢出
        c[i] = cur % 10;
        carry = cur / 10;
    }
    int len = lx;
    while (carry > 0) {                 // 进位可能有多位
        c[len++] = carry % 10;
        carry /= 10;
    }
    return len;
}

int divSmall(int *x, int lx, int k) {  // 高精 ÷ 低精，返回商长度
    long long rem = 0;                  // 余数
    for (int i = lx - 1; i >= 0; i--) {  // 除法从高位开始
        rem = rem * 10 + x[i];
        c[i] = rem / k;                 // 商的当前位
        rem %= k;                       // 更新余数
    }
    int len = lx;
    while (len > 1 && c[len - 1] == 0) --len;
    return len;
}

int main() {
    int la = readNum(a);                // 读两个大数
    int lb = readNum(b);

    int lc = add(a, b[0], la, lb);       // 这里只演示加法调用
    printNum(c, lc);

    int ld = mulSmall(a, la, 25);       // 乘以 25
    printNum(c, ld);
    return 0;
}`,
  },
  examples: [
    {
      id: 'bi-e1',
      title: '高精度加法',
      difficulty: '入门',
      problem: '输入两个不超过 1000 位的非负整数，输出它们的和。',
      sample: '输入：999 1  输出：1000',
      ideas: [
        '按字符串读入，倒序填进数组，低位在前。',
        '从 i=0 逐位相加并维护进位。',
        '两数都处理完后若还有进位，补一位。',
        '从最高位倒序输出，跳过前导零。',
      ],
      code: `string addBig(string sa, string sb) {
    vector<int> a, b, c;
    for (int i = sa.size() - 1; i >= 0; i--) a.push_back(sa[i] - '0');  // 倒序
    for (int i = sb.size() - 1; i >= 0; i--) b.push_back(sb[i] - '0');
    int len = max(a.size(), b.size()), carry = 0;
    for (int i = 0; i < len; i++) {
        int sum = (i < a.size() ? a[i] : 0) + (i < b.size() ? b[i] : 0) + carry;
        c.push_back(sum % 10);
        carry = sum / 10;
    }
    if (carry) c.push_back(carry);      // 最后的进位
    string ans;
    for (int i = c.size() - 1; i >= 0; i--) ans += char('0' + c[i]);  // 倒序拼回
    return ans;
}`,
      time: 'O(位数)',
      space: 'O(位数)',
      takeaway: '高精度加减乘都是「低位优先」，只有除法是「高位优先」，这个方向别写反。',
    },
    {
      id: 'bi-e2',
      title: 'n 的阶乘（高精乘低精）',
      difficulty: '进阶',
      problem: '求 n! 的精确值，n ≤ 1000（结果可达 2568 位）。',
      sample: '输入：10  输出：3628800',
      ideas: [
        '结果用数组存，初值为 1（len=1, a[0]=1）。',
        '外层循环 i 从 2 到 n，每次把当前结果整体乘以 i。',
        '乘法从低位到高位，维护进位 carry；乘完把 carry 逐位摊到高位。',
        '最终倒序输出，n=1000 时数组开到 3000 足够。',
      ],
      code: `string factorial(int n) {
    vector<int> a(3000, 0);
    a[0] = 1; int len = 1;               // 初始为 1
    for (int i = 2; i <= n; i++) {
        int carry = 0;
        for (int j = 0; j < len; j++) {
            int cur = a[j] * i + carry;
            a[j] = cur % 10;
            carry = cur / 10;
        }
        while (carry) {                  // 进位可能占多位
            a[len++] = carry % 10;
            carry /= 10;
        }
    }
    string ans;
    for (int i = len - 1; i >= 0; i--) ans += char('0' + a[i]);
    return ans;
}`,
      time: 'O(n × 位数)',
      space: 'O(位数)',
      takeaway: '阶乘这类「大数乘小数」只要写一个 mulSmall，是最容易上手的高精度模型。',
    },
  ],
  homework: [
    '实现高精度减法并处理 a < b 的情况（输出负号）。',
    '实现高精度 × 高精度，用 2^100 的结果与 Python 对拍验证。',
    '用高精度求斐波那契第 500 项。',
    '把模板改成 4 位压位版本，比较 n=1000 阶乘的运行时间。',
  ],
};

/** GESP 五级：链表 */
const linkedList: ITopic = {
  id: 'linked-list',
  stage: 'contest',
  order: 32,
  title: '链表',
  subtitle: '靠指针串起来的动态序列',
  minutes: 35,
  keywords: ['单链表', '双链表', '循环链表', '头插法', '尾插法', '数组模拟'],
  summary: '单链表的插入与删除、数组模拟链表（竞赛标准写法）、双向链表与循环链表的结构差异、与 vector 的取舍。',
  sections: {
    concept: [
      '数组的优点是随机访问 O(1)，缺点是中间插入/删除要整体搬移 O(n)，而且容量固定。链表用「节点 + 指针」把元素串起来：每个节点存数据和指向下一个节点的指针，插入删除只改几个指针，O(1) 完成，代价是不能随机访问，找第 k 个必须从头走 k 步。',
      '单链表的节点是 struct Node { int val; Node *next; }。整条链由头指针 head 标识，head 为 nullptr 表示空链表。遍历写法是 for (Node *p = head; p != nullptr; p = p->next)。在 p 之后插入新节点 q：q->next = p->next; p->next = q;——顺序不能反，先接后面再接前面，否则会丢失后续链。',
      '删除 p 之后的节点：先保存 q = p->next，再 p->next = q->next，最后 delete q。想删除节点本身必须知道它的前驱。为此常加一个「虚拟头节点（哨兵）」dummy：dummy.next = head，这样删除第一个节点和删除中间节点的代码完全一致，不用特判。',
      '竞赛里更常用「数组模拟链表」：用 val[i]、nxt[i] 两个数组，i 是节点编号，nxt[i] 存下一个节点的编号，0 表示空。插入只需 nxt[++tot] = nxt[p]; nxt[p] = tot; 删除只需 nxt[p] = nxt[nxt[p]]。好处是无指针、缓存友好、不会内存泄漏，也不需要 new/delete。',
      '双向链表每个节点多一个 pre 指针指向前驱，插入和删除要同时维护两个方向：在 p 后插入 q 需要 q->pre = p; q->next = p->next; p->next->pre = q; p->next = q; 四步顺序有讲究。双向链表的优势是「已知节点就能 O(1) 删除」，单链表不行。',
      '循环链表把尾节点的 next 指回头节点，形成环。它适合「轮流处理」的场景（约瑟夫环、轮转调度）。遍历循环链表不能靠 nullptr 判断结束，要用 do-while 从某个起点出发，走回起点即停，或者先记下节点数。',
      '链表 vs vector：频繁在头部/中间插入删除、元素个数不定 → 链表；需要按下标访问、遍历为主、追求缓存性能 → vector。实际上竞赛中 90% 的「链表题」用数组模拟或 vector 就够，真正的指针链表主要用于训练数据结构思维和 STL list 的使用。',
    ],
    analogy:
      '数组像一排连号的座位，想在第 3 和第 4 号之间插人，后面所有人都要往后挪；链表像每个人手里牵着下一个人的绳子，插人只要解开一根绳子、接上两根。',
    keyPoints: [
      '插入顺序：先让新节点接上后继，再让前驱指向新节点。',
      '单链表删除必须知道前驱，加哨兵可消除首节点的特判。',
      '数组模拟：val + nxt 两个数组，0 表示空，无需指针。',
      '双向链表四步改链，顺序错了链会断。',
      '循环链表用「走回起点」判断结束，不用 nullptr。',
    ],
    syntax: [
      'struct Node { int val; Node *next; };  Node *head = nullptr;',
      '头插：Node *q = new Node{v, head}; head = q;',
      'p 后插入：q->next = p->next; p->next = q;',
      '删除 p 的后继：Node *q = p->next; p->next = q->next; delete q;',
      '数组模拟：int val[N], nxt[N], tot = 0; 插入 nxt[++tot] = nxt[p], nxt[p] = tot;',
      '双向链表插入：q->pre = p; q->next = p->next; p->next->pre = q; p->next = q;',
      'STL：list<int> L; L.push_back(x); L.insert(it, x); L.erase(it); 迭代器不会因插入失效。',
    ],
    pitfalls: [
      {
        wrong: 'p->next = q; q->next = p->next;  // 顺序颠倒',
        right: 'q->next = p->next; p->next = q;',
        reason: '先改 p->next 会丢掉原来的后继，q->next 只能指向自己或未定义地址，链断裂。',
      },
      {
        wrong: '遍历 while (p->next != nullptr) 处理最后一个节点',
        right: 'while (p != nullptr) { 处理 p; p = p->next; }',
        reason: '前者会漏掉最后一个节点；判断条件要对「当前节点」而不是它的后继。',
      },
      {
        wrong: '删除节点后继续用 q->val',
        right: '先保存值再 delete，或直接改链不 delete（数组模拟无此问题）',
        reason: 'delete 之后那块内存已归还，再访问是未定义行为，可能读到垃圾值或崩溃。',
      },
    ],
  },
  template: {
    title: 'linked_list.cpp',
    explain: '数组模拟单链表：头插、尾插、指定位置后插入、删除后继、遍历输出；并演示双向链表的四步插入。',
    code: `#include <iostream>
using namespace std;

const int N = 100005;
int val[N], nxt[N], tot = 0;         // 0 号节点当作空指针，节点编号从 1 开始
int head = 0;                        // 头指针，0 表示空链表

void pushFront(int v) {              // 头插法：新节点成为第一个
    val[++tot] = v;
    nxt[tot] = head;                 // 新节点接上原头
    head = tot;                      // 头指针移到新节点
}

void pushBack(int v) {               // 尾插法：走到最后一个再接
    val[++tot] = v;
    nxt[tot] = 0;                    // 新节点是新的尾部
    if (head == 0) { head = tot; return; }   // 空链表特判
    int p = head;
    while (nxt[p] != 0) p = nxt[p];  // 找尾节点
    nxt[p] = tot;
}

void insertAfter(int p, int v) {     // 在编号 p 的节点之后插入
    val[++tot] = v;
    nxt[tot] = nxt[p];               // 先接后继
    nxt[p] = tot;                    // 再改前驱指向
}

void eraseAfter(int p) {             // 删除 p 的后继
    if (nxt[p] == 0) return;         // 没有后继
    nxt[p] = nxt[nxt[p]];            // 跳过被删节点，数组模拟不需要 free
}

void printList() {                   // 遍历输出
    for (int p = head; p != 0; p = nxt[p]) cout << val[p] << " ";
    cout << endl;
}

// ── 双向链表（指针版），演示四步插入
struct DNode {
    int val;
    DNode *pre, *next;
    DNode(int v) : val(v), pre(nullptr), next(nullptr) {}
};

void insertAfterD(DNode *p, int v) {
    DNode *q = new DNode(v);
    q->pre = p;                      // 1. 新节点指向前驱
    q->next = p->next;               // 2. 新节点指向后继
    if (p->next) p->next->pre = q;   // 3. 后继（若存在）回头指向新节点
    p->next = q;                     // 4. 前驱指向新节点
}

int main() {
    pushBack(2);                     // 2
    pushFront(1);                    // 1 2
    insertAfter(head, 9);            // 1 9 2
    eraseAfter(head);                // 1 2
    printList();
    return 0;
}`,
  },
  examples: [
    {
      id: 'll-e1',
      title: '反转链表',
      difficulty: '入门',
      problem: '把单链表原地反转，返回新的头节点。',
      sample: '输入：1→2→3→4→5  输出：5→4→3→2→1',
      ideas: [
        '用三个指针：pre（已反转部分的头）、cur（当前处理节点）、nxt（暂存后继）。',
        '每轮先存 nxt = cur->next，避免改链后丢失。',
        '把 cur->next 指向 pre，完成一次反转。',
        'pre 与 cur 同时前移，直到 cur 为空，pre 就是新头。',
      ],
      code: `Node* reverseList(Node *head) {
    Node *pre = nullptr, *cur = head;
    while (cur) {
        Node *nxt = cur->next;         // 先存后继，防止丢失
        cur->next = pre;               // 当前节点反向指向前一个
        pre = cur;                     // pre 前移
        cur = nxt;                     // cur 前移
    }
    return pre;                        // 原来的尾节点成为新头
}`,
      time: 'O(n)',
      space: 'O(1)',
      takeaway: '反转链表的模板是三个指针循环；核心是「先存后继再改指针」。',
    },
    {
      id: 'll-e2',
      title: '约瑟夫环',
      difficulty: '进阶',
      problem: 'n 个人围成一圈，从 1 号开始报数，报到 m 的人出圈，求最后剩下的人的编号。',
      sample: '输入：n=5 m=3  输出：4',
      ideas: [
        '用循环链表模拟：每个节点指向下一个人。',
        '每轮从当前位置数 m-1 步，找到要出圈的人的前驱。',
        '删除该节点的后继，从后继的下一位继续报数。',
        '只剩一个节点时输出它的编号；n 很大时可用递推公式 f(n)=(f(n-1)+m)%n 优化到 O(n)。',
      ],
      code: `int josephus(int n, int m) {
    int f = 0;                          // 1 个人时答案是 0（0-based）
    for (int i = 2; i <= n; i++)
        f = (f + m) % i;                // 递推公式，省去模拟链表
    return f + 1;                       // 转成 1-based 编号
}`,
      time: 'O(n)',
      space: 'O(1)',
      takeaway: '约瑟夫环用链表模拟是 O(nm)，用递推公式可以降到 O(n)，是「结构 + 数学」的典型对比。',
    },
  ],
  homework: [
    '用数组模拟链表实现：头插 1..5，再删除第 3 个节点，最后遍历输出。',
    '实现双向链表的插入与删除，并写测试验证 pre/next 指向一致。',
    '用链表判断一个字符串是否为回文（快慢指针找中点 + 反转后半段）。',
    '用链表实现两个有序链表的合并，要求不新建节点。',
  ],
};

/** GESP 五级：分治 */
const divideConquer: ITopic = {
  id: 'divide-conquer',
  stage: 'contest',
  order: 33,
  title: '分治与归并、快排',
  subtitle: '把大问题砍成两半再合并',
  minutes: 40,
  keywords: ['分治', '归并排序', '快速排序', '逆序对', '快速选择', '递归式'],
  summary: '分治三步（分解、解决、合并）、归并排序与求逆序对、快速排序的分区与最坏情况、快速选择求第 k 小。',
  sections: {
    concept: [
      '分治（divide and conquer）是三步循环：把原问题分解成若干个规模更小的同类子问题，递归解决子问题，再把子问题的解合并成原问题的解。它与递归是同一件事的两面：递归是「怎么调用自己」，分治是「怎么切分与合并」。',
      '归并排序是分治的教科书样本。把数组从中间切成两半，分别排序，再把两个有序数组合并成一个有序数组。合并时用两个指针各扫一遍，每次取较小的放进临时数组，O(n) 完成。总复杂度 T(n) = 2T(n/2) + O(n) = O(n log n)。',
      '归并排序的副产品是「求逆序对」：合并两个有序段时，若右边元素比左边小，则左边剩余的所有元素都与它构成逆序对，一次能数出 mid - i + 1 个。这比 O(n²) 的暴力统计快得多，是树状数组解法之外的另一种标准做法。',
      '快速排序也是分治：选一个基准 pivot，把数组划分成「小于等于基准」和「大于基准」两部分，再分别递归。平均 O(n log n)，但基准选得差（比如已排序数组取第一个元素）会退化成 O(n²)。改进方法有随机选基准、三数取中、小区间改用插入排序。',
      '归并与快排的关键差别是「合并的时机」：归并是「先递归排序子段，再合并」，快排是「先划分，再递归」，划分完就不需要合并。归并需要 O(n) 额外空间，快排可以原地进行。',
      '快速选择（nth_element）解决「求第 k 小」：划分后若基准的位置正好是 k 就返回；若 k 在左段就只递归左段，右段整个丢掉。因为每轮只处理一半，复杂度是 O(n) 而不是 O(n log n)。STL 的 nth_element 就是这个思路。',
      '分析分治复杂度用递归式：T(n) = aT(n/b) + f(n)。归并是 a=2, b=2, f(n)=O(n)，得 O(n log n)；二分查找是 a=1, b=2, f(n)=O(1)，得 O(log n)；朴素快排最坏 a=1, b 不定，退化成 O(n²)。记住「每层总工作量 × 层数」这个直观算法即可应付大多数估算。',
    ],
    analogy:
      '分治像整理一叠乱牌：先把牌分成两叠，各自整理好，再从两叠顶部一张张挑小的合成一叠。切分是「分」，挑牌合并是「治」。',
    keyPoints: [
      '分治三步：分解、递归解决、合并；缺一不可。',
      '归并排序稳定、O(n log n)、需 O(n) 额外空间。',
      '归并合并时可顺带统计逆序对，一次数一批。',
      '快排平均 O(n log n)、最坏 O(n²)，基准选择决定性能。',
      '快速选择每轮丢一半，O(n) 求第 k 小。',
    ],
    syntax: [
      '归并：mergeSort(l, mid); mergeSort(mid+1, r); 然后双指针合并到 tmp 再拷回。',
      '合并核心：while (i <= mid && j <= r) tmp[k++] = a[i] <= a[j] ? a[i++] : a[j++];',
      '逆序对：选 a[j] 时 ans += mid - i + 1;（左边剩余元素都比它大）。',
      '快排划分：while (i <= j) { while (a[i] < pivot) i++; while (a[j] > pivot) j--; if (i <= j) swap(a[i++], a[j--]); }',
      '快速选择：若 pivot 位置 p == k 返回；p < k 递归右段；否则递归左段。',
      'STL：stable_sort(a, a+n) 稳定排序；nth_element(a, a+k, a+n) 求第 k 小。',
      '递归式：T(n) = 2T(n/2) + O(n) → O(n log n)。',
    ],
    pitfalls: [
      {
        wrong: '快排固定取 a[l] 作基准，且不随机化',
        right: '随机取基准或三数取中',
        reason: '对已排序或逆序数据，固定取端点会使每次划分极不均衡，退化成 O(n²) 并可能爆栈。',
      },
      {
        wrong: '归并合并时忘记把 tmp 拷回原数组',
        right: '合并完 for (int i = l; i <= r; i++) a[i] = tmp[i];',
        reason: '只写进临时数组而不拷回，上一层递归看到的仍是无序数据，最终结果错误。',
      },
      {
        wrong: '逆序对统计用 ans++ 每遇到一次就加一',
        right: 'ans += mid - i + 1;',
        reason: '选右边元素时，左边从 i 到 mid 的所有元素都与它构成逆序对，要一次性加上这一批。',
      },
    ],
  },
  template: {
    title: 'divide.cpp',
    explain: '归并排序（含逆序对统计）、快速排序（随机基准）、快速选择求第 k 小。',
    code: `#include <iostream>
#include <algorithm>
using namespace std;

const int N = 100005;
int a[N], tmp[N];
long long invCnt = 0;                 // 逆序对数量，可能很大用 long long

void mergeSort(int l, int r) {        // 归并排序
    if (l >= r) return;               // 只有一个元素，天然有序
    int mid = (l + r) >> 1;
    mergeSort(l, mid);                // 排左半
    mergeSort(mid + 1, r);            // 排右半
    int i = l, j = mid + 1, k = l;
    while (i <= mid && j <= r) {
        if (a[i] <= a[j]) tmp[k++] = a[i++];   // <= 保证稳定性
        else {
            invCnt += mid - i + 1;    // a[j] 比左边剩余元素都小，一次统计一批
            tmp[k++] = a[j++];
        }
    }
    while (i <= mid) tmp[k++] = a[i++];    // 左段剩余
    while (j <= r) tmp[k++] = a[j++];      // 右段剩余
    for (int t = l; t <= r; t++) a[t] = tmp[t];  // 拷回原数组
}

void quickSort(int l, int r) {        // 快速排序，随机基准
    if (l >= r) return;
    int pivot = a[l + rand() % (r - l + 1)];  // 随机选基准，避免退化
    int i = l, j = r;
    while (i <= j) {
        while (a[i] < pivot) i++;     // 找左边第一个 ≥ pivot 的
        while (a[j] > pivot) j--;     // 找右边第一个 ≤ pivot 的
        if (i <= j) swap(a[i++], a[j--]);   // 交换后两指针继续走
    }
    quickSort(l, j);                  // 递归左段
    quickSort(i, r);                  // 递归右段
}

int kthSmallest(int l, int r, int k) {  // 第 k 小，k 从 0 开始
    if (l == r) return a[l];
    int pivot = a[l + rand() % (r - l + 1)];
    int i = l, j = r;
    while (i <= j) {
        while (a[i] < pivot) i++;
        while (a[j] > pivot) j--;
        if (i <= j) swap(a[i++], a[j--]);
    }
    if (k <= j) return kthSmallest(l, j, k);       // 答案在左段
    if (k >= i) return kthSmallest(i, r, k);       // 答案在右段
    return a[k];                                    // 落在基准区
}

int main() {
    int n = 6;
    int src[6] = {5, 3, 8, 1, 9, 2};
    for (int i = 0; i < n; i++) a[i] = src[i];
    mergeSort(0, n - 1);
    for (int i = 0; i < n; i++) cout << a[i] << " ";
    cout << "\\n逆序对 " << invCnt << endl;   // 7

    for (int i = 0; i < n; i++) a[i] = src[i];
    quickSort(0, n - 1);
    cout << kthSmallest(0, n - 1, 2) << endl;   // 第 3 小 = 3
    return 0;
}`,
  },
  examples: [
    {
      id: 'dc-e1',
      title: '归并排序',
      difficulty: '入门',
      problem: '给 n 个整数，按从小到大排序输出。n ≤ 10^5。',
      sample: '输入：6 / 5 3 8 1 9 2  输出：1 2 3 5 8 9',
      ideas: [
        '递归把区间 [l,r] 从中间切开，分别排序。',
        '合并阶段用双指针，每次取两段中较小的放进临时数组。',
        '某段先用完时，把另一段剩余整体搬过去。',
        '最后把临时数组拷回原数组，保证上一层能用。',
      ],
      code: `void mergeSort(int l, int r) {
    if (l >= r) return;
    int mid = (l + r) >> 1;
    mergeSort(l, mid);
    mergeSort(mid + 1, r);
    int i = l, j = mid + 1, k = l;
    while (i <= mid && j <= r) tmp[k++] = (a[i] <= a[j]) ? a[i++] : a[j++];
    while (i <= mid) tmp[k++] = a[i++];
    while (j <= r) tmp[k++] = a[j++];
    for (int t = l; t <= r; t++) a[t] = tmp[t];
}`,
      time: 'O(n log n)',
      space: 'O(n)',
      takeaway: '归并排序的三段式：递归自己、递归别人、双指针合并再拷回。',
    },
    {
      id: 'dc-e2',
      title: '统计逆序对',
      difficulty: '进阶',
      problem: '给 n 个整数，统计满足 i < j 且 a[i] > a[j] 的数对个数。n ≤ 10^5。',
      sample: '输入：5 / 5 3 8 1 9  输出：5',
      ideas: [
        '暴力双重循环是 O(n²)，会超时。',
        '在归并排序的合并阶段统计：两段各自已经有序。',
        '当选中右段元素 a[j] 时，左段从 i 到 mid 的所有元素都比它大。',
        '因此 ans += mid - i + 1，一次性把这一批逆序对全部计入。',
      ],
      code: `long long countInv(int l, int r) {
    if (l >= r) return 0;
    int mid = (l + r) >> 1;
    long long ans = countInv(l, mid) + countInv(mid + 1, r);  // 子问题的逆序对
    int i = l, j = mid + 1, k = l;
    while (i <= mid && j <= r) {
        if (a[i] <= a[j]) tmp[k++] = a[i++];
        else { ans += mid - i + 1; tmp[k++] = a[j++]; }  // 一批逆序对
    }
    while (i <= mid) tmp[k++] = a[i++];
    while (j <= r) tmp[k++] = a[j++];
    for (int t = l; t <= r; t++) a[t] = tmp[t];
    return ans;
}`,
      time: 'O(n log n)',
      space: 'O(n)',
      takeaway: '逆序对 = 归并合并时「右边元素赢了几次、每次赢多少个左边剩余元素」的累加。',
    },
  ],
  homework: [
    '用归并排序对 10^5 个随机数排序，与 sort 的结果逐一比对。',
    '用快速排序排序一个已经升序的数组（n=10^5），对比随机基准与固定基准的耗时。',
    '用快速选择求第 k 小，验证结果与完整排序后取 a[k] 一致。',
    '用分治求一个数组的最大子段和（提示：合并时跨中点的最大和需要向左向右各扫一遍）。',
  ],
};

/** GESP 六级：类与对象 */
const objectOriented: ITopic = {
  id: 'object',
  stage: 'contest',
  order: 34,
  title: '类与对象',
  subtitle: '把数据和操作打包成一体',
  minutes: 35,
  keywords: ['class', 'struct', '构造函数', '封装', 'this', '运算符重载', '继承'],
  summary: '类的定义、成员变量与成员函数、构造与析构、public/private 封装、struct 与 class 的唯一差别、运算符重载让自定义类型像内置类型一样使用。',
  sections: {
    concept: [
      '类（class）是一种自定义类型，把「数据」和「操作这些数据的函数」打包在一起。用类定义出来的变量叫对象（实例）。例如一个 Point 类包含 x、y 两个坐标，以及计算距离的成员函数。这样做的好处是：数据和逻辑不再散落，调用者只需要知道「能做什么」，不需要关心「怎么实现」。',
      '成员变量描述对象的状态，成员函数描述对象的行为。成员函数内部可以直接访问本对象的成员变量，也可以用 this 指针显式指明「当前对象」，this->x 等价于 x（当参数名与成员名冲突时必须写 this->x）。',
      '构造函数在对象创建时自动调用，用来初始化成员。它可以重载（无参、带参），名字与类名相同、没有返回类型。析构函数在对象销毁时自动调用，名字是 ~类名，用来释放 new 出来的资源。不写析构函数时编译器会生成一个空的。',
      '访问控制有三个关键字：public（任何人可访问）、private（只有类内部可访问）、protected（类内部与派生类可访问）。把成员变量设为 private、只通过 public 的成员函数读写，叫做封装——好处是可以在函数里做校验（比如设置年龄时拒绝负数），外部无法绕过。',
      'struct 和 class 在 C++ 里几乎完全相同，唯一区别是默认访问权限：struct 默认 public，class 默认 private。竞赛里常用 struct 存点、边、区间，因为写起来省事；需要严格封装时才用 class。',
      '运算符重载让自定义类型支持 +、<、<< 等运算符。例如给 Point 重载 + 得到向量相加，给结构体重载 < 让它能直接放进 sort、set、priority_queue。写法是 返回类型 operator符号(参数)。注意不能重载内置类型之间的运算，也不能发明新符号。',
      '继承与多态是面向对象的高级部分：派生类继承基类的成员，virtual 函数让调用时按实际类型分派（多态）。GESP 六级只要求理解概念与简单使用，竞赛中很少用继承，因为虚函数有运行时开销，且代码不如直接写结构体清晰。',
    ],
    analogy:
      '类像一张「学生信息表」的模板，对象是填好的一份份具体表格；封装像给表格加了密码锁，只能通过指定的窗口（public 函数）修改，防止有人乱填。',
    keyPoints: [
      '类是类型，对象是实例；成员函数默认能访问本对象成员。',
      '构造函数负责初始化，析构函数负责清理，都是自动调用。',
      'private 成员只能类内访问，是封装的实现手段。',
      'struct 默认 public、class 默认 private，其余相同。',
      '重载 < 后结构体可直接用于 sort / set / priority_queue。',
    ],
    syntax: [
      'class Point { public: int x, y; Point(int x = 0, int y = 0) : x(x), y(y) {} };',
      '初始化列表：Point(int a, int b) : x(a), y(b) {} —— 比在函数体里赋值更高效。',
      '成员函数：int dist2() const { return x * x + y * y; }  const 表示不修改成员。',
      'this 指针：void setX(int x) { this->x = x; } 用于区分同名参数。',
      '重载 <：bool operator<(const Node &o) const { return w < o.w; }',
      '重载 <<：friend ostream& operator<<(ostream &os, const Point &p) { return os << p.x << "," << p.y; }',
      '继承：class Dog : public Animal { ... }; 多态函数声明 virtual void speak();',
    ],
    pitfalls: [
      {
        wrong: 'class Point { int x, y; };  // 想在外面访问 p.x',
        right: 'class Point { public: int x, y; };',
        reason: 'class 默认 private，外部访问 p.x 会直接编译报错；struct 默认 public 才不会。',
      },
      {
        wrong: 'Point(int a, int b) { x = a; y = b; }  // 与成员同名参数冲突',
        right: 'Point(int a, int b) : x(a), y(b) {}  或  this->x = a;',
        reason: '参数名会遮蔽成员名，x = a 实际是把参数赋给自己，成员仍是未初始化值。',
      },
      {
        wrong: '重载 < 时写成 bool operator<(Node o)（按值传参）',
        right: 'bool operator<(const Node &o) const',
        reason: '按值传参会复制整个对象，set / sort 大量比较时性能明显下降；const 引用还能接受临时对象。',
      },
    ],
  },
  template: {
    title: 'class.cpp',
    explain: '一个带封装的 Point 类（构造、成员函数、运算符重载、输出重载），以及用重载 < 让结构体直接排序。',
    code: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

class Point {
private:                             // 封装：外部不能直接改坐标
    int x_, y_;
public:
    Point(int x = 0, int y = 0) : x_(x), y_(y) {}   // 构造函数，带默认参数

    int x() const { return x_; }     // 只读访问器，const 表示不修改对象
    int y() const { return y_; }

    void move(int dx, int dy) {      // 修改器：内部可以改私有成员
        x_ += dx;
        y_ += dy;
    }

    Point operator+(const Point &o) const {   // 重载 +，返回新点
        return Point(x_ + o.x_, y_ + o.y_);
    }

    bool operator<(const Point &o) const {    // 重载 <：先比 x 再比 y
        if (x_ != o.x_) return x_ < o.x_;
        return y_ < o.y_;
    }

    friend ostream& operator<<(ostream &os, const Point &p) {  // 重载输出
        return os << "(" << p.x_ << "," << p.y_ << ")";
    }
};

struct Edge {                        // 竞赛常用的 struct，默认 public
    int u, v, w;
    bool operator<(const Edge &o) const { return w < o.w; }  // 按权值排序
};

int main() {
    Point a(1, 2), b(3, 4);
    Point c = a + b;                 // 运算符重载，像内置类型一样相加
    cout << a << " + " << b << " = " << c << endl;

    a.move(1, 1);                    // 通过成员函数修改私有成员
    cout << a << endl;

    vector<Edge> es = {{1, 2, 5}, {2, 3, 1}, {1, 3, 3}};
    sort(es.begin(), es.end());      // 重载 < 后可直接排序
    for (auto &e : es) cout << e.u << "-" << e.v << ":" << e.w << " ";
    cout << endl;
    return 0;
}`,
  },
  examples: [
    {
      id: 'oo-e1',
      title: '用类实现分数运算',
      difficulty: '进阶',
      problem: '实现一个 Fraction 类，支持加、乘、约分与输出，输出格式为 a/b（最简）。',
      sample: '输入：1/2 + 1/3  输出：5/6',
      ideas: [
        '私有成员存分子、分母，构造函数里立刻约分，保证对象始终是最简形式。',
        '用 gcd 约分，分母为负时把负号移到分子。',
        '重载 + 与 *：交叉相加、分子分母相乘，再约分。',
        '重载 << 输出 a/b 形式。',
      ],
      code: `class Fraction {
private:
    long long num, den;              // 分子、分母，分母恒正
    void reduce() {                  // 约分
        long long g = __gcd(abs(num), den);
        num /= g; den /= g;
        if (den < 0) { num = -num; den = -den; }   // 负号放分子
    }
public:
    Fraction(long long n = 0, long long d = 1) : num(n), den(d) { reduce(); }
    Fraction operator+(const Fraction &o) const {
        return Fraction(num * o.den + o.num * den, den * o.den);
    }
    Fraction operator*(const Fraction &o) const {
        return Fraction(num * o.num, den * o.den);
    }
    friend ostream& operator<<(ostream &os, const Fraction &f) {
        return os << f.num << "/" << f.den;
    }
};

int main() {
    Fraction a(1, 2), b(1, 3);
    cout << a + b << endl;           // 5/6
}`,
      time: 'O(log min(a,b)) 每次约分',
      space: 'O(1)',
      takeaway: '类的价值在于「构造即合法」：在构造函数里约分，之后任何运算都不用再担心非最简。',
    },
  ],
  homework: [
    '给 Point 重载 ==、!= 和 -（向量减），并用断言测试。',
    '用 class 实现一个栈（封装 push/pop/top，私有数组与栈顶指针），与 STL 版本对比行为。',
    '给 Edge 结构体重载 >，使其能放进小根堆（priority_queue 默认大根堆）。',
    '写一个 Animal 基类与 Dog/Cat 派生类，用 virtual 函数演示多态输出。',
  ],
};

/** GESP 七级：数学库与浮点 */
const mathLib: ITopic = {
  id: 'math-lib',
  stage: 'contest',
  order: 35,
  title: '数学库、浮点与几何基础',
  subtitle: '三角、对数、指数与精度的边界',
  minutes: 35,
  keywords: ['cmath', 'sqrt', 'pow', 'log', '三角函数', 'eps', '叉积', '浮点误差'],
  summary: 'cmath 常用函数与常量、三角函数的弧度制、对数与指数、浮点比较为什么不能用 ==、叉积判断方向与多边形面积。',
  sections: {
    concept: [
      'cmath 提供数学函数：sqrt(x) 开方、pow(a,b) 求幂、exp(x) 求 e^x、log(x) 自然对数、log2(x) 以 2 为底、log10(x) 以 10 为底、fabs(x) 绝对值（浮点版）、floor/ceil/round 取整。整数绝对值用 abs（在 cstdlib），浮点用 fabs，混用会丢精度。',
      '三角函数 sin、cos、tan 的参数是弧度，不是角度。角度转弧度用 x * PI / 180。反三角函数 asin、acos、atan 返回弧度，atan2(y, x) 能正确处理四个象限（x=0 时也安全），求两点间方位角要用它而不是 atan(y/x)。',
      '常用常量：M_PI = 3.141592653589793（部分编译器需要 #define _USE_MATH_DEFINES 才暴露）、acos(-1.0) 可自行算 π。精度上 double 约有 15–16 位有效十进制数字，float 只有 7 位左右，几何题一律用 double。',
      '浮点数不能用 == 比较：0.1 + 0.2 在二进制下并不等于 0.3。标准做法是判断差值是否小于 eps：fabs(a - b) < 1e-9 认为相等；判断 a < b 时可以写 a < b - eps 避免「几乎相等但被判定为小」。eps 的大小要结合数据量级：坐标到 10^9 时，绝对误差 1e-9 已无意义，应改用相对误差。',
      '浮点误差会累积：1 万个 0.1 相加得到的不是 1000，而是 999.9999999999 之类。需要精确的金额、计数不要用浮点；几何题最后输出时用 printf("%.2f") 或 fixed + setprecision 控制位数，四舍五入由输出函数完成。',
      '几何基础两个工具：点积 dot(a,b) = ax*bx + ay*by，用来求夹角、判断垂直（点积为 0）；叉积 cross(a,b) = ax*by - ay*bx，用来判断方向（正表示 b 在 a 的逆时针侧）、求三角形面积（|cross|/2）、判断三点共线与线段相交。叉积的绝对值是以两向量为邻边的平行四边形面积。',
      '多边形面积用「鞋带公式」：把顶点按顺序围一圈，sum += x[i]*y[i+1] - x[i+1]*y[i]，最后取绝对值除以 2。这个公式对凹多边形也成立（只要顶点按顺序给出），本质是把叉积逐边累加。',
      '数论与精度的结合点：判断完全平方数不要用 sqrt 后直接比较，应取整后再验算 r*r == n 或 (r+1)*(r+1) == n；大数开方时 sqrt 的误差可能让结果差 1。这类「整数问题用浮点辅助」的地方必须做修正。',
    ],
    analogy:
      '浮点数像一把刻度很细但有限的尺子：能量出 0.1 毫米，却永远量不出「绝对精确」；eps 就是你允许的误差范围，只要两次测量差在范围内，就当作同一个长度。',
    keyPoints: [
      '三角函数吃弧度，角度要先转弧度。',
      'atan2(y,x) 能处理四个象限，优于 atan(y/x)。',
      '浮点比较用 eps，不要用 ==。',
      '叉积定方向、算面积、判共线，是几何题的核心工具。',
      '整数开方后用平方回验，防止 sqrt 误差导致差 1。',
    ],
    syntax: [
      'sqrt(x)、pow(a,b)、exp(x)、log(x)、log2(x)、log10(x)、fabs(x)、hypot(x,y)。',
      'floor(x) 向下取整、ceil(x) 向上取整、round(x) 四舍五入，返回的都是浮点。',
      '角度转弧度：double rad = deg * acos(-1.0) / 180;',
      'atan2(dy, dx) 返回 [-π, π] 的方位角。',
      '比较：if (fabs(a - b) < 1e-9) 视为相等；if (a < b - 1e-9) 视为严格小于。',
      '叉积：long long cross(P a, P b, P c) { return (b.x-a.x)*(c.y-a.y) - (b.y-a.y)*(c.x-a.x); }',
      '鞋带公式：area += x[i]*y[i+1] - x[i+1]*y[i]; 最后 area = fabs(area)/2。',
    ],
    pitfalls: [
      {
        wrong: 'if (a == b) 判断两个 double 相等',
        right: 'if (fabs(a - b) < 1e-9)',
        reason: '浮点运算有舍入误差，数学上相等的两个表达式在计算机里可能差 1e-16。',
      },
      {
        wrong: 'sin(30) 想求 30 度的正弦',
        right: 'sin(30 * PI / 180)',
        reason: 'sin 的参数是弧度，30 弧度约等于 1719 度，结果完全不同。',
      },
      {
        wrong: 'int r = sqrt(n); if (r * r == n) 判完全平方',
        right: 'int r = sqrt(n); 检查 r*r == n || (r+1)*(r+1) == n',
        reason: 'sqrt 返回浮点，大数时可能略小于真实值，取整后差 1，必须回验两个候选。',
      },
    ],
  },
  template: {
    title: 'math.cpp',
    explain: '三角与对数函数的正确用法、eps 比较、atan2 求方位角、叉积判方向与三角形面积。',
    code: `#include <iostream>
#include <cmath>
#include <iomanip>
using namespace std;

const double EPS = 1e-9;
const double PI = acos(-1.0);         // 用反余弦算 π，比手写常量更稳

struct P { double x, y; };

double dist(P a, P b) {               // 两点距离
    return hypot(a.x - b.x, a.y - b.y);
}

double cross(P o, P a, P b) {         // 叉积：>0 表示 o→a→b 逆时针
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

double triangleArea(P a, P b, P c) {  // 三角形面积 = 叉积绝对值的一半
    return fabs(cross(a, b, c)) / 2.0;
}

bool equal(double a, double b) {      // 带 eps 的相等判断
    return fabs(a - b) < EPS;
}

int main() {
    cout << fixed << setprecision(4);
    cout << sin(30 * PI / 180) << endl;      // 0.5000，角度先转弧度
    cout << log2(1024) << " " << log10(1000) << endl;  // 10 3
    cout << pow(2, 0.5) << endl;             // 1.4142，等价 sqrt(2)

    P a{0, 0}, b{3, 0}, c{0, 4};
    cout << dist(a, b) << endl;              // 3.0000
    cout << triangleArea(a, b, c) << endl;   // 6.0000
    cout << cross(a, b, c) << endl;          // 12，说明 c 在 ab 的逆时针侧

    cout << atan2(1, -1) * 180 / PI << endl; // 135，atan2 自动处理象限
    cout << equal(0.1 + 0.2, 0.3) << endl;   // 1，用 eps 判等
    return 0;
}`,
  },
  examples: [
    {
      id: 'ml-e1',
      title: '两点距离与方位角',
      difficulty: '入门',
      problem: '给两点坐标，输出距离与从第一点指向第二点的方位角（角度制，0–360）。',
      sample: '输入：0 0 1 1  输出：1.4142 45.0000',
      ideas: [
        '距离用 hypot(dx, dy)，比 sqrt(dx*dx+dy*dy) 更稳，能防中间溢出。',
        '方位角用 atan2(dy, dx) 得到弧度，再转角度。',
        'atan2 返回 (-180, 180]，负数加 360 转成 0–360。',
        '输出用 fixed + setprecision 控制小数位。',
      ],
      code: `int main() {
    double x1, y1, x2, y2;
    cin >> x1 >> y1 >> x2 >> y2;
    double d = hypot(x2 - x1, y2 - y1);          // 距离
    double deg = atan2(y2 - y1, x2 - x1) * 180 / acos(-1.0);  // 弧度转角度
    if (deg < 0) deg += 360;                     // 统一到 0–360
    cout << fixed << setprecision(4) << d << " " << deg << endl;
    return 0;
}`,
      time: 'O(1)',
      space: 'O(1)',
      takeaway: '距离用 hypot、方向用 atan2，这两个函数能避开大部分手工计算的坑。',
    },
    {
      id: 'ml-e2',
      title: '多边形面积（鞋带公式）',
      difficulty: '进阶',
      problem: '给 n 个按顺序给出的顶点坐标，求多边形面积（保留两位小数）。',
      sample: '输入：4 / 0 0 / 4 0 / 4 3 / 0 3  输出：12.00',
      ideas: [
        '把顶点按顺序围成一圈，包括从最后一个回到第一个。',
        '累加 x[i]*y[i+1] - x[i+1]*y[i]（叉积的二维形式）。',
        '结果取绝对值再除以 2。',
        '顶点逆时针或顺时针给出都行，绝对值会修正符号。',
      ],
      code: `double polygonArea(vector<P> &p) {
    double sum = 0;
    int n = p.size();
    for (int i = 0; i < n; i++) {
        int j = (i + 1) % n;                     // 最后一个连回第一个
        sum += p[i].x * p[j].y - p[j].x * p[i].y;
    }
    return fabs(sum) / 2.0;
}`,
      time: 'O(n)',
      space: 'O(1)',
      takeaway: '鞋带公式把「面积」化成一圈叉积的累加，凹多边形也适用。',
    },
  ],
  homework: [
    '实现「角度 ↔ 弧度」互转函数，并用 sin(30°) 验证结果。',
    '判断三点是否共线（用叉积与 eps），并测试近乎共线的数据。',
    '求 n 个点中距离最远的一对点（暴力 O(n²) 即可），距离用 hypot。',
    '用叉积判断两条线段是否相交（含端点接触的情况）。',
  ],
};

export const GESP4_TOPICS: ITopic[] = [fileIo, bigint, linkedList, divideConquer, objectOriented, mathLib];
