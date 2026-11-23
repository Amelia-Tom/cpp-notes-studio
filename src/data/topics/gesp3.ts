// EXPORTS: GESP3_TOPICS（栈与队列、哈希表、排列组合、最短路与最小生成树、倍增与快速幂）

import type { ITopic } from '../types';

/** GESP 六级：栈与队列 */
const stackQueue: ITopic = {
  id: 'stack-queue',
  stage: 'contest',
  order: 25,
  title: '栈与队列',
  subtitle: '先进后出与先进先出的两种容器',
  minutes: 40,
  keywords: ['栈', '队列', '循环队列', '单调栈', '括号匹配', 'BFS', '滑动窗口'],
  summary: '用数组手写栈和队列，理解循环队列的下标回绕，掌握单调栈与滑动窗口两类高频模型。',
  sections: {
    concept: [
      '栈（stack）是只允许在一端插入和删除的线性结构，这一端叫栈顶。插入叫 push，删除叫 pop，读栈顶叫 top。最后进去的元素最先出来，所以叫「后进先出」（LIFO）。想象一摞盘子：你只能从最上面拿、也从最上面放。',
      '队列（queue）是只允许一端进、另一端出的线性结构：进的那端叫队尾（rear），出的那端叫队头（front）。最先进入的最先出来，所以叫「先进先出」（FIFO）。想象食堂排队：后来的人站到队尾，队头的人先打饭。',
      '栈的数组实现只需要一个数组加一个栈顶下标 top，初值 -1 表示空。push 时 top++ 再写值，pop 时直接 top--，判空是 top == -1。队列需要两个下标：front 指向队头元素，rear 指向队尾的下一个空位；入队 st[rear++] = x，出队返回 st[front++],整段移动会让 front/rear 一直增大直到越界。',
      '循环队列解决越界：所有下标对容量取模。rear = (rear + 1) % MAXN; front = (front + 1) % MAXN。代价是「队满」和「队空」都会出现 front == rear，所以要额外记一个 cnt 变量表示元素个数，或者故意浪费一个位置来区分。',
      '栈的经典应用是括号匹配：遇到左括号入栈，遇到右括号就检查栈顶是否为对应左括号并弹出。表达式求值（中缀转后缀、后缀求值）也靠栈；函数调用、递归回溯本质都是栈；DFS 用手写栈可以把递归改成迭代，避免爆栈。',
      '队列的经典应用是 BFS 层序遍历与最短路（边权为 1 时）；滑动窗口最值用「单调队列」，每次入队前把队尾比它小（或大）的全部弹掉，队头始终是窗口最值。与之对称的是「单调栈」，用来求每个位置左边/右边第一个比它大（或小）的元素，典型题是柱状图中的最大矩形。',
      '考试里最容易写错的是边界：空栈 pop、空队列出队、循环队列 MAXN 写成元素个数（应该多留一个位置或用 cnt）、单调栈弹栈用 while 还是 if（必须 while，可能连续弹出多个）。',
    ],
    analogy:
      '栈像一摞盘子，只能从顶上拿放；队列像一根两端开口的管子，从一头塞进去、另一头出来。循环队列则像一条首尾相接的跑道，跑到尽头自动回到起点。',
    keyPoints: [
      '栈 LIFO、队列 FIFO，两者的所有操作都是 O(1)。',
      '循环队列的下标必须对容量取模，队空与队满要靠 cnt 或空一格区分。',
      '括号匹配、表达式求值、DFS、递归都是栈模型。',
      'BFS、层序遍历、滑动窗口最值是队列 / 单调队列模型。',
      '单调栈、单调队列弹栈要用 while，保证弹出所有被支配的元素。',
    ],
    syntax: [
      'STL：stack<int> s; s.push(x); s.pop(); s.top(); s.size(); s.empty();',
      'STL：queue<int> q; q.push(x); q.pop(); q.front(); q.back();',
      'STL：deque<int> dq; 支持 dq.push_front / push_back / pop_front / pop_back，单调队列用它。',
      '数组模拟栈：int st[MAXN], top = -1; 入栈 st[++top] = x; 出栈 --top; 判空 top < 0。',
      '数组模拟队列：int q[MAXN], head = 0, tail = 0; 入队 q[tail++] = x; 出队 q[head++]。',
      '循环队列：q[tail] = x; tail = (tail + 1) % MAXN; 出队 head = (head + 1) % MAXN。',
      'pop() 不返回被删元素，要取值得先 top() / front() 再 pop()，且必须先判空。',
    ],
    pitfalls: [
      {
        wrong: 'while (!s.empty()) { s.top(); s.pop(); }  // 以为自己读了值',
        right: 'int x = s.top(); s.pop();  // 先取值再弹出',
        reason: 'pop() 返回 void，只删不取；写成 s.pop(); 再 s.top() 时元素已经没了。',
      },
      {
        wrong: 'q[tail++] = x;  // 队列写满后继续入队',
        right: 'if ((tail + 1) % MAXN == head) 判满；或改用 cnt 计数',
        reason: '普通数组队列 tail 会无限增大导致越界；循环队列若不判满会覆盖队头数据。',
      },
      {
        wrong: 'if (!st.empty() && st.top() == x) st.pop();  // 单调栈用 if',
        right: 'while (!st.empty() && st.top() <= x) st.pop();',
        reason: '新元素可能同时「支配」栈顶连续多个元素，只弹一个会破坏单调性。',
      },
    ],
  },
  template: {
    title: 'stack_queue.cpp',
    explain: '一份代码演示四种结构：数组栈做括号匹配、循环队列做约瑟夫环、单调栈求左右第一个更大值、单调队列求滑动窗口最大值。',
    code: `#include <iostream>
#include <string>
using namespace std;

const int MAXN = 100005;
int st[MAXN], top = -1;              // 数组栈：top 指向栈顶元素，-1 表示空
int cq[MAXN], head = 0, tail = 0, cnt = 0;  // 循环队列：cnt 用来区分空与满

bool matchBracket(const string &s) { // 括号匹配：左括号入栈，右括号配对
    top = -1;                        // 每次调用前清空栈
    for (char c : s) {
        if (c == '(' || c == '[' || c == '{') {
            st[++top] = c;           // 左括号压栈
        } else {
            if (top < 0) return false;                     // 右括号多余
            char t = st[top];            // 取栈顶
            if ((c == ')' && t != '(') || (c == ']' && t != '[') || (c == '}' && t != '{'))
                return false;        // 类型不匹配
            --top;                       // 配对成功，弹出
        }
    }
    return top < 0;                      // 栈空才算全部配平
}

void cqPush(int x) {                 // 循环队列入队
    cq[tail] = x;
    tail = (tail + 1) % MAXN;        // 到末尾回绕到 0
    ++cnt;
}

int cqPop() {                        // 循环队列出队
    int x = cq[head];
    head = (head + 1) % MAXN;
    --cnt;
    return x;
}

int main() {
    cout << matchBracket("{[()]}") << " " << matchBracket("([)]") << endl;  // 1 0

    for (int i = 1; i <= 5; i++) cqPush(i);   // 1 2 3 4 5 入队
    cout << cqPop() << " " << cqPop() << endl; // 1 2 出队，先进先出

    int a[6] = {0, 3, 1, 4, 1, 5};    // 下标从 1 开始，求右边第一个更大值
    top = -1;
    for (int i = 6; i >= 1; i--) {   // 从右往左扫，栈里存下标
        while (top >= 0 && a[st[top]] <= a[i]) --top;  // 弹出所有不大于当前值的
        cout << (top >= 0 ? a[st[top]] : -1) << " ";   // 栈顶就是右边第一个更大值
        st[++top] = i;               // 当前下标入栈
    }
    cout << endl;
    return 0;
}`,
  },
  examples: [
    {
      id: 'sq-e1',
      title: '有效的括号',
      difficulty: '入门',
      problem: '给定只含 ()[]{} 的字符串，判断括号是否按正确顺序闭合。空串视为合法。',
      sample: '输入：{[]()}  输出：true；输入：([)]  输出：false',
      ideas: [
        '左括号一律入栈，等待被配对。',
        '遇到右括号时，若栈空说明右括号多余，直接失败。',
        '否则检查栈顶是否为对应左括号：不是则失败，是则弹出。',
        '扫完后栈必须为空，否则说明有左括号没闭合。',
      ],
      code: `bool isValid(string s) {
    stack<char> st;                       // 用 STL 的栈，省去手写下标
    for (char c : s) {
        if (c == '(' || c == '[' || c == '{') {
            st.push(c);                   // 左括号压栈
        } else {
            if (st.empty()) return false; // 右括号没有可配对的左括号
            char t = st.top(); st.pop();  // 取出栈顶并弹出
            if ((c == ')' && t != '(') || (c == ']' && t != '[') || (c == '}' && t != '{'))
                return false;             // 类型不匹配
        }
    }
    return st.empty();                    // 全部配平才算合法
}`,
      time: 'O(n)',
      space: 'O(n)',
      takeaway: '括号匹配只要记住三步：左括号入栈、右括号查栈顶、最后看栈是否为空。',
    },
    {
      id: 'sq-e2',
      title: '滑动窗口最大值',
      difficulty: '进阶',
      problem: '给长度为 n 的数组和窗口大小 k，输出每个窗口内的最大值。n ≤ 10^6。',
      sample: '输入：n=8 k=3, a=1 3 -1 -3 5 3 6 7  输出：3 3 5 5 6 7',
      ideas: [
        '朴素做法每个窗口扫 k 个元素是 O(nk)，会超时。',
        '维护一个存下标的双端队列，队列内下标对应的值单调递减。',
        '新元素入队前，把队尾所有不大于它的下标弹掉——它们永远不会再成为最大值。',
        '队头下标若已滑出窗口（下标 ≤ i-k），从队头弹出；此时队头就是当前窗口最大值。',
      ],
      code: `vector<int> maxInWindow(vector<int> &a, int k) {
    deque<int> dq;                       // 存下标，对应值单调递减
    vector<int> ans;
    for (int i = 0; i < (int)a.size(); i++) {
        while (!dq.empty() && a[dq.back()] <= a[i]) dq.pop_back();  // 弹掉不可能再当最大值的
        dq.push_back(i);                 // 当前下标入队尾
        if (dq.front() <= i - k) dq.pop_front();  // 队头过期，移出窗口
        if (i >= k - 1) ans.push_back(a[dq.front()]);  // 窗口成形后记录答案
    }
    return ans;
}`,
      time: 'O(n)',
      space: 'O(k)',
      takeaway: '单调队列的本质是「迟到且更大」的元素会淘汰「早到且更小」的元素。',
    },
    {
      id: 'sq-e3',
      title: '柱状图中最大的矩形',
      difficulty: '挑战',
      problem: '给 n 个宽度为 1 的柱子高度，求能勾勒出的最大矩形面积。n ≤ 10^5。',
      sample: '输入：2 1 5 6 2 3  输出：10（高 5、宽 2 的那块）',
      ideas: [
        '固定某根柱子为矩形高度，向左右扩展到第一个比它矮的柱子，宽度由这两个边界决定。',
        '用单调递增栈维护「左边第一个更矮」的下标；当遇到更矮的柱子时，栈顶柱子被迫结算。',
        '弹出栈顶下标 mid，矩形高度是 h[mid]，右边界是当前 i，左边界是弹出后的新栈顶。',
        '宽度 = i - left - 1；在数组首尾各加一个高度 0 的哨兵，保证所有柱子都能结算。',
      ],
      code: `int largestRectangle(vector<int> h) {
    h.insert(h.begin(), 0);              // 左哨兵，高度 0 保证最后全部弹出
    h.push_back(0);                      // 右哨兵
    stack<int> st;                       // 存下标，高度单调递增
    int ans = 0;
    for (int i = 0; i < (int)h.size(); i++) {
        while (!st.empty() && h[st.top()] > h[i]) {  // 当前更矮，栈顶被迫结算
            int mid = st.top(); st.pop();            // 作为矩形高度的那根柱子
            int left = st.empty() ? -1 : st.top();   // 左边第一个更矮的下标
            ans = max(ans, h[mid] * (i - left - 1)); // 宽度 = 右界 - 左界 - 1
        }
        st.push(i);                      // 当前下标入栈
    }
    return ans;
}`,
      time: 'O(n)',
      space: 'O(n)',
      takeaway: '单调栈题目的通用套路：谁逼谁结算、结算时的左右边界是什么、要不要加哨兵。',
    },
  ],
  homework: [
    '用数组手写一个栈和队列（不用 STL），实现 push/pop/top/empty，并写测试对比 STL 的结果。',
    '实现循环队列，容量为 10，连续入队 100 次、出队 60 次，验证不越界且顺序正确。',
    '用栈把中缀表达式（含 + - * / 和括号、单位数字）转成后缀表达式，再求值。',
    '给 n 个整数，用单调栈输出每个数右边第一个比它大的数，没有则输出 -1。',
  ],
};

/** GESP 七级：哈希表 */
const hashTable: ITopic = {
  id: 'hash',
  stage: 'contest',
  order: 26,
  title: '哈希表与字符串哈希',
  subtitle: '用一次计算直接跳到该去的位置',
  minutes: 40,
  keywords: ['哈希函数', '冲突', '拉链法', '开放寻址', '字符串哈希', 'unordered_map', '双哈希'],
  summary: '哈希函数与冲突处理、拉链法与开放寻址的取舍、字符串前缀哈希判断子串相等、STL 容器的使用与防卡。',
  sections: {
    concept: [
      '哈希表要解决的问题是：给定一个键，用 O(1) 的时间找到它对应的位置。做法是把键通过哈希函数映射成一个下标，直接访问数组的那一格，跳过所有比较。代价是不同键可能映射到同一下标，这叫冲突。',
      '哈希函数的设计目标是「均匀」：让键尽可能分散到每个下标。整数常用 key % M，M 取质数能让分布更均匀；字符串常用「多项式滚动哈希」：把字符串看成一个 base 进制数再对 M 取模。base 一般取 131 或 13331，M 取 10^9+7 这类大质数。',
      '冲突处理有两种主流方案。拉链法：每个下标挂一条链表（或 vector），冲突的键都塞进同一条链，查找时先算下标再在链内线性找。实现简单、删除方便，但链表节点分散、缓存不友好。开放寻址法：冲突了就按固定规则找下一个空位（线性探测、二次探测），数组连续、缓存友好，但删除要用标记，且装载因子高时性能骤降。',
      '装载因子 = 元素个数 / 桶数。超过 0.7 左右就该扩容：新建两倍大的表，把所有元素重新哈希搬过去（rehash）。扩容是 O(n) 的，但摊还到每次插入仍是 O(1)。',
      '字符串哈希的威力在于「把子串比较变成整数比较」。预处理前缀哈希 h[i] 和幂 p[i]，则子串 [l, r] 的哈希是 h[r] - h[l-1] * p[r-l+1]（对 M 取模后补正）。这样判断两个子串是否相等只要 O(1)，是字符串题（回文、重复子串、最长公共子串）的常用工具。',
      '单模哈希有被构造数据卡掉的风险（尤其 M = 10^9+7、base 固定时）。稳妥做法是双哈希：用两组 (base, M) 同时算，两个都相等才算相等；或者用 unsigned long long 的自然溢出（相当于模 2^64），再配一个大质数模。',
      'STL 里 unordered_map / unordered_set 就是哈希表，map / set 是红黑树（O(log n)）。竞赛中若数据故意卡 unordered_map（构造同余键），可以换自定义哈希函数、加随机扰动，或改用 map。gp_hash_table 之类的扩展不在标准库内，比赛要看规则。',
    ],
    analogy:
      '哈希表像图书馆按书名首字母上架：你不用从第一排翻到最后一排，直接走到对应书架那一格；两本书首字母相同就放在同一格（冲突），格子里再排一小列。',
    keyPoints: [
      '哈希表用空间换时间，平均 O(1)，最坏 O(n)（全部冲突）。',
      '桶数取质数、base 取 131/13331，能显著降低冲突率。',
      '装载因子超过阈值必须扩容，否则退化成链表。',
      '字符串哈希把子串比较变成 O(1) 的整数比较，公式别记错。',
      '单模可能被卡，重要题目用双哈希或自然溢出 + 大模。',
    ],
    syntax: [
      'unordered_map<string,int> mp; mp["abc"] = 1; 查找用 mp.find(key)，找不到返回 mp.end()。',
      'mp.count(key) 返回 0/1；mp[key] 在键不存在时会插入默认值，只查不改时用 find。',
      'unordered_set<int> s; s.insert(x); s.count(x); s.erase(x);',
      '手写拉链：vector<int> head(M, -1), nxt(N), key(N); 插入时 nxt[idx] = head[h], head[h] = idx。',
      '字符串哈希预处理：h[i] = (h[i-1] * base + s[i]) % MOD; p[i] = p[i-1] * base % MOD;',
      '子串哈希：get(l,r) = (h[r] - h[l-1] * p[r-l+1] % MOD + MOD) % MOD;',
      '防卡：chrono 随机 base，或写双哈希把两个结果合成 pair 比较。',
    ],
    pitfalls: [
      {
        wrong: 'if (mp[key] == 0)  // 用下标访问判断存在',
        right: 'if (mp.find(key) != mp.end())',
        reason: 'operator[] 对不存在的键会插入一个默认值，既改变了表的大小，又可能把「值为 0 的已有键」误判为不存在。',
      },
      {
        wrong: 'int h = 0; for (char c : s) h = h * 131 + c;',
        right: 'h = (h * 131LL + c) % MOD;  // 用 64 位中间量',
        reason: 'h * 131 会超出 int 范围溢出成负数，哈希值完全不可控；乘法中间结果必须用 long long。',
      },
      {
        wrong: 'get(l, r) 直接 h[r] - h[l-1] * p[r-l+1]',
        right: '(h[r] - h[l-1] * p[len] % MOD + MOD) % MOD',
        reason: '取模后减法可能为负，C++ 负数取模仍为负，必须补一个 MOD 再取模。',
      },
    ],
  },
  template: {
    title: 'hash.cpp',
    explain: '手写拉链哈希表存「字符串 → 整数」，再用双哈希验证两个子串是否相等。',
    code: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

const int M = 100003;                // 桶数取质数，减少冲突
const int N = 100005;
int head[M], nxt[N], val[N], idx = 0; // 拉链法：head 存链表头，nxt 串联同桶节点
string key[N];                        // 每个节点保存原始键

int hashStr(const string &s) {        // 多项式滚动哈希求桶下标
    long long h = 0;
    for (char c : s) h = (h * 131 + c) % M;  // 131 是常用 base
    return (int)h;
}

void insert(const string &s, int v) { // 插入或覆盖
    int b = hashStr(s);
    for (int i = head[b]; i != -1; i = nxt[i]) {  // 沿链表找同键
        if (key[i] == s) { val[i] = v; return; }  // 已存在则更新
    }
    key[idx] = s; val[idx] = v;      // 新节点
    nxt[idx] = head[b];              // 头插法接到链表最前面
    head[b] = idx++;
}

int find(const string &s) {          // 返回 -1 表示不存在
    int b = hashStr(s);
    for (int i = head[b]; i != -1; i = nxt[i])
        if (key[i] == s) return val[i];
    return -1;
}

const long long B1 = 131, M1 = 1000000007;   // 第一组参数
const long long B2 = 13331, M2 = 998244353;  // 第二组参数
long long h1[N], h2[N], p1[N], p2[N];        // 前缀哈希与幂

void build(const string &s) {        // 预处理前缀哈希
    int n = s.size();
    p1[0] = p2[0] = 1; h1[0] = h2[0] = 0;
    for (int i = 1; i <= n; i++) {
        h1[i] = (h1[i-1] * B1 + s[i-1]) % M1;   // 第一组
        h2[i] = (h2[i-1] * B2 + s[i-1]) % M2;   // 第二组
        p1[i] = p1[i-1] * B1 % M1;
        p2[i] = p2[i-1] * B2 % M2;
    }
}

bool same(int l1, int r1, int l2, int r2) {   // 判断两段子串是否相等，下标从 1 开始
    long long a1 = (h1[r1] - h1[l1-1] * p1[r1-l1+1] % M1 + M1) % M1;
    long long b1 = (h1[r2] - h1[l2-1] * p1[r2-l2+1] % M1 + M1) % M1;
    long long a2 = (h2[r1] - h2[l1-1] * p2[r1-l1+1] % M2 + M2) % M2;
    long long b2 = (h2[r2] - h2[l2-1] * p2[r2-l2+1] % M2 + M2) % M2;
    return a1 == b1 && a2 == b2;     // 两组都相等才认为相同
}

int main() {
    insert("apple", 3);
    insert("banana", 5);
    cout << find("apple") << " " << find("pear") << endl;  // 3 -1

    string s = "abcabc";
    build(s);
    cout << same(1, 3, 4, 6) << endl;   // 1，前三个字符与后三个相同
    return 0;
}`,
  },
  examples: [
    {
      id: 'hash-e1',
      title: '两数之和（哈希解法）',
      difficulty: '入门',
      problem: '给 n 个整数和目标值 t，找出两个数使它们的和等于 t，输出任意一组下标。',
      sample: '输入：n=5 t=9, a=2 7 11 15 4  输出：0 1',
      ideas: [
        '朴素双重循环是 O(n²)，n 大时会超时。',
        '边扫边用哈希表记「值 → 下标」，扫到 a[i] 时查 t - a[i] 是否出现过。',
        '出现过就直接返回两个下标；否则把 a[i] 及其下标存入表。',
        '这样每个元素只进表一次，整体 O(n)。',
      ],
      code: `pair<int,int> twoSum(vector<int> &a, int t) {
    unordered_map<int,int> mp;           // 值 → 第一次出现的下标
    for (int i = 0; i < (int)a.size(); i++) {
        auto it = mp.find(t - a[i]);     // 找「补数」是否出现过
        if (it != mp.end()) return {it->second, i};
        if (!mp.count(a[i])) mp[a[i]] = i;  // 只记第一次出现，避免自己配自己
    }
    return {-1, -1};                     // 无解
}`,
      time: 'O(n)',
      space: 'O(n)',
      takeaway: '凡是「找配对/找出现过」的题，先想能不能用哈希把内层循环压掉。',
    },
    {
      id: 'hash-e2',
      title: '最长无重复子串',
      difficulty: '进阶',
      problem: '给一个只含小写字母的字符串，求不含重复字符的最长子串长度。',
      sample: '输入：abcabcbb  输出：3（abc）',
      ideas: [
        '用两个指针维护一个窗口 [l, r]，窗口内字符不重复。',
        'last[c] 记录字符 c 上一次出现的位置+1（即如果重复，左边界至少要跳到哪）。',
        'r 每次右移，l 更新为 max(l, last[s[r]])，窗口长度 r-l+1 取最大。',
        '因为每个字符最多进出窗口一次，整体 O(n)。',
      ],
      code: `int longestUnique(string s) {
    int last[26] = {0};                  // 记录每个字母上次出现位置 +1
    int l = 0, ans = 0;
    for (int r = 0; r < (int)s.size(); r++) {
        int c = s[r] - 'a';
        l = max(l, last[c]);             // 左边界只能右移，不能回退
        last[c] = r + 1;                 // 下次遇到同字母，左边界至少到 r+1
        ans = max(ans, r - l + 1);       // 当前窗口长度
    }
    return ans;
}`,
      time: 'O(n)',
      space: 'O(26)',
      takeaway: '窗口类问题两个关键：右指针怎么扩、左指针在什么条件下跳到哪里。',
    },
    {
      id: 'hash-e3',
      title: '重复子串查询',
      difficulty: '挑战',
      problem: '给字符串 s 和 m 次查询，每次问两个等长子串是否完全相同。|s| ≤ 10^5，m ≤ 10^5。',
      sample: '输入：s=abcabc，查询 (1,3) 与 (4,6)  输出：YES',
      ideas: [
        '直接逐字符比较每次 O(len)，m 次会到 10^10。',
        '预处理双哈希的前缀哈希与幂，子串哈希 O(1) 算出。',
        '两组哈希都相等就判定相同；冲突概率约 10^-18。',
        '注意下标从 1 开始，长度 = r-l+1，减法后要补模。',
      ],
      code: `// 全局已有 h1,h2,p1,p2 与函数 build(s)
bool query(int l1, int r1, int l2, int r2) {
    if (r1 - l1 != r2 - l2) return false;   // 长度不同必然不等
    long long a1 = (h1[r1] - h1[l1-1] * p1[r1-l1+1] % M1 + M1) % M1;
    long long b1 = (h1[r2] - h1[l2-1] * p1[r2-l2+1] % M1 + M1) % M1;
    long long a2 = (h2[r1] - h2[l1-1] * p2[r1-l1+1] % M2 + M2) % M2;
    long long b2 = (h2[r2] - h2[l2-1] * p2[r2-l2+1] % M2 + M2) % M2;
    return a1 == b1 && a2 == b2;
}`,
      time: 'O(|s| + m)',
      space: 'O(|s|)',
      takeaway: '字符串哈希是「子串判等」的标准武器，写的时候把补模写进肌肉记忆。',
    },
  ],
  homework: [
    '手写拉链哈希表，实现插入、查找、删除，并与 unordered_map 对比 10^5 次随机操作的结果。',
    '把桶数从 100003 改成 1000，统计冲突链的最大长度，观察装载因子的影响。',
    '用字符串哈希求一个字符串中本质不同的子串个数（n ≤ 3000，可 O(n²) 枚举）。',
    '实现双哈希，构造一个能卡掉单模哈希的测试（提示：找碰撞需要数学构造，做不出来就说明为什么难）。',
  ],
};

/** GESP 八级：计数原理与排列组合 */
const combinatorics: ITopic = {
  id: 'combinatorics',
  stage: 'contest',
  order: 27,
  title: '计数原理与排列组合',
  subtitle: '不重不漏地把方案数算清楚',
  minutes: 40,
  keywords: ['加法原理', '乘法原理', '排列', '组合', '杨辉三角', '二项式', '容斥', '卡特兰数'],
  summary: '加法与乘法原理、排列组合公式与递推、杨辉三角、二项式定理、容斥原理与几种经典计数模型。',
  sections: {
    concept: [
      '计数的两条基本法则。加法原理：完成一件事有若干类互斥的方式，第 i 类有 aᵢ 种，则总数是 Σaᵢ——关键词是「分类，任选其一」。乘法原理：完成一件事需要依次做若干步，第 i 步有 bᵢ 种，则总数是 Πbᵢ——关键词是「分步，每步都要做」。绝大多数计数题都是把这两条法则嵌套组合。',
      '排列是从 n 个不同元素中取出 m 个并按顺序排成一列，方案数 A(n,m) = n × (n-1) × … × (n-m+1) = n!/(n-m)!。组合是从 n 个中取出 m 个，不考虑顺序，C(n,m) = A(n,m)/m! = n!/(m!(n-m)!)。核心区别只有一个：交换两个元素是否得到不同方案。',
      '组合数有三个必须记住的性质。对称性 C(n,m) = C(n,n-m)；递推式 C(n,m) = C(n-1,m-1) + C(n-1,m)（杨辉三角，含义是「含第 n 个」与「不含第 n 个」两类）；以及 C(n,0) = C(n,n) = 1。用递推式打表，n ≤ 2000 时 O(n²) 预处理即可。',
      '杨辉三角第 n 行第 m 个数就是 C(n,m)，每行两端为 1、中间等于上方两数之和。它同时给出二项式定理的系数：(a+b)ⁿ = Σ C(n,k) a^(n-k) b^k。令 a=b=1 得 ΣC(n,k) = 2ⁿ（n 个元素的子集总数）；令 a=1,b=-1 得奇数项系数和等于偶数项系数和。',
      '容斥原理处理「至少满足一个条件」的计数：|A∪B| = |A| + |B| - |A∩B|；三个集合时 |A∪B∪C| = Σ|A| - Σ|A∩B| + |A∩B∩C|。规律是「奇数个集合的交加、偶数个集合的交减」。补集思想常更省事：答案 = 总数 - 不满足条件的方案数。',
      '几个经典模型。捆绑法：要求某些元素相邻，把它们捆成一个整体再排列；插空法：要求某些元素不相邻，先排其他元素再把它们插进空位；隔板法：把 n 个相同物品分给 m 个人每人至少一个，方案数 C(n-1,m-1)；圆排列：n 个元素围成一圈方案数是 (n-1)!；错排：n 封信全装错信封的方案数 D(n) = (n-1)(D(n-1)+D(n-2))。',
      '卡特兰数 Cₙ = C(2n,n)/(n+1) 出现在「n 对括号的合法匹配数」「n 个节点的二叉树形态数」「不允许越过对角线的走格子路径数」。它的前几项是 1, 1, 2, 5, 14, 42, 132，看到这些数字要条件反射。',
      '计数题最大的风险不是算错公式，而是重算或漏算。稳妥流程是：先明确「什么是同一个方案」，再决定用分类还是分步，最后用小的 n 手算出答案与公式对照。答案要求取模时，组合数要用乘法逆元（模数为质数时 inv(x) = x^(p-2)），不能直接除。',
    ],
    analogy:
      '加法原理像「回家可以坐公交、地铁或打车，方式互斥，把选择相加」；乘法原理像「先选上衣再选裤子，两步都要做，把选择相乘」。',
    keyPoints: [
      '分类用加法、分步用乘法，先判断「交换顺序算不算新方案」。',
      'C(n,m) = C(n-1,m-1) + C(n-1,m)，一行一行推出杨辉三角。',
      'ΣC(n,k) = 2ⁿ；交错和为 0（n ≥ 1）。',
      '容斥：奇加偶减；能用补集就别硬容斥。',
      '取模下的组合数必须用逆元，不能写 / m!。',
    ],
    syntax: [
      'long long C[205][205]; C[i][0] = C[i][i] = 1; C[i][j] = (C[i-1][j-1] + C[i-1][j]) % MOD;',
      '阶乘预处理：fac[0] = 1; fac[i] = fac[i-1] * i % MOD;',
      '逆元：power(fac[i], MOD-2)（MOD 为质数），组合数 = fac[n] * inv(fac[m]) % MOD * inv(fac[n-m]) % MOD;',
      'A(n,m) 用阶乘写：fac[n] * invfac[n-m] % MOD。',
      '__builtin_popcount 可枚举子集；for (int s = 0; s < (1<<n); s++) 遍历全部方案。',
      '卡特兰：cat[n] = C(2n,n) * inv(n+1) % MOD；或递推 cat[n] = cat[n-1] * (4n-2) / (n+1)。',
    ],
    pitfalls: [
      {
        wrong: 'ans = C(n, m) / m;  // 取模后直接除',
        right: 'ans = C(n, m) * power(m, MOD-2) % MOD;',
        reason: '模运算下除法没有定义，必须乘以逆元；直接除会得到完全错误的结果。',
      },
      {
        wrong: '把「选出 3 人组成小组」当成 A(n,3) 计算',
        right: 'C(n,3) = n(n-1)(n-2)/6',
        reason: '组内没有顺序，{甲乙丙} 与 {丙乙甲} 是同一组，排列数比组合数多了 3! 倍。',
      },
      {
        wrong: '相邻问题用插空法',
        right: '相邻用捆绑法，不相邻用插空法',
        reason: '两个方法的适用条件正好相反，用错会把「必须相邻」算成「必须分开」。',
      },
    ],
  },
  template: {
    title: 'comb.cpp',
    explain: '杨辉三角打表求组合数、阶乘加逆元求大组合数、容斥求 1..n 中能被 a 或 b 整除的个数、卡特兰数验证。',
    code: `#include <iostream>
using namespace std;

const int MOD = 1000000007;
const int N = 2005;
long long C[N][N];                   // 杨辉三角：C[i][j] 表示从 i 个里选 j 个

void buildC(int n) {                 // O(n²) 预处理，适合 n ≤ 2000
    for (int i = 0; i <= n; i++) {
        C[i][0] = C[i][i] = 1;       // 两端都是 1
        for (int j = 1; j < i; j++)
            C[i][j] = (C[i-1][j-1] + C[i-1][j]) % MOD;  // 上方两数之和
    }
}

long long power(long long a, long long b) {  // 快速幂，用于求逆元
    long long r = 1;
    while (b > 0) {
        if (b & 1) r = r * a % MOD;
        a = a * a % MOD;
        b >>= 1;
    }
    return r;
}

long long fac[100005], invfac[100005];

void buildFac(int n) {               // 阶乘与阶乘逆元，适合 n ≤ 10^5
    fac[0] = 1;
    for (int i = 1; i <= n; i++) fac[i] = fac[i-1] * i % MOD;
    invfac[n] = power(fac[n], MOD - 2);          // 费马小定理求逆元
    for (int i = n; i >= 1; i--) invfac[i-1] = invfac[i] * i % MOD;  // 倒推省一次快速幂
}

long long Cbig(int n, int m) {       // 大组合数，O(1)
    if (m < 0 || m > n) return 0;
    return fac[n] * invfac[m] % MOD * invfac[n-m] % MOD;
}

int main() {
    buildC(10);
    cout << C[5][2] << endl;         // 10

    buildFac(20);
    cout << Cbig(20, 10) << endl;     // 184756

    int n = 100, a = 3, b = 5;       // 容斥：能被 3 或 5 整除的个数
    int cnt = n / a + n / b - n / (a / __gcd(a, b) * b);  // 减去公倍数
    cout << cnt << endl;

    cout << Cbig(6, 3) * power(4, MOD - 2) % MOD << endl;  // 卡特兰数第 3 项 = 5
    return 0;
}`,
  },
  examples: [
    {
      id: 'comb-e1',
      title: '从 n 人中选 m 人组队',
      difficulty: '入门',
      problem: 'n 个同学中选 m 人参加比赛，问有多少种不同的组队方案。n ≤ 30。',
      sample: '输入：n=5 m=2  输出：10',
      ideas: [
        '组队不区分顺序，是组合而不是排列。',
        '公式 C(n,m) = n!/(m!(n-m)!)，n ≤ 30 时结果超过 long long 的边界要留意（C(30,15) ≈ 1.5×10^8，还安全）。',
        '用杨辉三角递推或直接乘除逐项计算。',
        '若要求取模，改成阶乘 + 逆元的写法。',
      ],
      code: `long long comb(int n, int m) {
    if (m < 0 || m > n) return 0;
    m = min(m, n - m);                   // 利用对称性少算一半
    long long r = 1;
    for (int i = 1; i <= m; i++) {
        r = r * (n - m + i) / i;         // 边乘边除，保证中间结果必整除
    }
    return r;
}`,
      time: 'O(m)',
      space: 'O(1)',
      takeaway: '小范围组合数可以边乘边除，但要保证每一步都能整除（顺序是乘 (n-m+i) 除 i）。',
    },
    {
      id: 'comb-e2',
      title: '站队方案（相邻与不相邻）',
      difficulty: '进阶',
      problem: '5 名男生 4 名女生排成一排。(1) 女生必须相邻有多少种？(2) 女生互不相邻有多少种？',
      sample: '输出：6! × 4! = 17280；(2) 5! × A(6,4) = 43200',
      ideas: [
        '(1) 捆绑法：4 名女生捆成 1 个整体，与 5 名男生共 6 个对象全排列 6!，内部再排 4!。',
        '(2) 插空法：先排 5 名男生得 5!，形成 6 个空位（含两端），选 4 个空位放女生并排序 A(6,4)。',
        '两类问题互斥，不需要再容斥。',
        '若还有「甲不站两端」这类附加限制，先处理特殊元素再排其余。',
      ],
      code: `long long fact(int n) {                 // 阶乘
    long long r = 1;
    for (int i = 2; i <= n; i++) r *= i;
    return r;
}

long long A(int n, int m) {              // 排列数 nPr
    long long r = 1;
    for (int i = 0; i < m; i++) r *= (n - i);
    return r;
}

int main() {
    cout << fact(6) * fact(4) << endl;   // 相邻：捆绑
    cout << fact(5) * A(6, 4) << endl;   // 不相邻：插空
    return 0;
}`,
      time: 'O(n)',
      space: 'O(1)',
      takeaway: '相邻捆绑、不相邻插空；插空的空位数永远比已排元素多 1。',
    },
  ],
  homework: [
    '用杨辉三角打出 C(n,m) 表（n ≤ 20），验证对称性 C(n,m) = C(n,n-m)。',
    'n 个相同小球分给 3 个人，每人至少 1 个，用隔板法求方案数并枚举验证 n ≤ 8 的情况。',
    '用容斥计算 1..1000 中不能被 2、3、5 任一整除的数的个数。',
    '验证卡特兰数前 6 项，并用它计算 3 对括号的合法匹配方案数。',
  ],
};

/** GESP 八级：最短路与最小生成树 */
const shortestPath: ITopic = {
  id: 'shortest',
  stage: 'contest',
  order: 28,
  title: '最短路与最小生成树',
  subtitle: '在图上找最短的路、最省的连线',
  minutes: 45,
  keywords: ['Dijkstra', 'Floyd', 'Bellman-Ford', 'Kruskal', 'Prim', '并查集', '堆优化'],
  summary: 'Dijkstra 的贪心本质与堆优化写法、Floyd 的三重循环、负权边的处理、Kruskal 与 Prim 两种最小生成树算法。',
  sections: {
    concept: [
      '最短路问题：给定带权图和起点 s，求 s 到每个点的最小总权值。按边权分两类：非负权用 Dijkstra，允许负权用 Bellman-Ford（或其队列优化 SPFA）。',
      'Dijkstra 的贪心思路是：把点分成「已确定最短路」和「未确定」两组，每次从未确定集合中取出距离最小的点 u，用它去松弛邻居：若 dist[u] + w(u,v) < dist[v]，就更新 dist[v]。正确性依赖非负边权——距离最小的点不可能再被别人绕路缩短。朴素实现每次找最小 O(n)，总 O(n²)；用优先队列（小根堆）找最小可降到 O((n+m) log n)。',
      '堆优化的实现细节：priority_queue 默认是大根堆，要写 priority_queue<pair<int,int>, vector<...>, greater<...>> 或用「存负距离」的技巧。弹出时若距离大于当前 dist[u] 说明是过期条目，直接跳过。每个点可能被多次入堆，所以堆大小是 O(m) 级别。',
      'Floyd 求任意两点间最短路，本质是动态规划：dist[i][j] 表示只允许经过编号 ≤ k 的中间点时 i 到 j 的最短距离，转移是 dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])。三重循环 O(n³)，适合 n ≤ 300 的稠密图，代码只有五行，非常好写。',
      'Bellman-Ford 做 n-1 轮松弛，每轮遍历所有边，O(nm)。它能处理负权边并能判负环（第 n 轮还能松弛说明存在负环）。SPFA 用队列只把「被更新的点」入队，平均快，但最坏仍是 O(nm)，且容易被网格图卡成指数级，正式比赛慎用。',
      '最小生成树（MST）：在连通带权无向图中选 n-1 条边把所有点连起来，使总权值最小。Kruskal 按边权从小到大排序，依次尝试加入，若两端已连通（用并查集判断）就跳过，否则加入；选够 n-1 条边即结束，O(m log m)，适合稀疏图。Prim 从任意点开始，每次选「连接已选集合与未选集合的最小边」，把新点并入，O(n²) 或堆优化 O(m log n)，适合稠密图。',
      '并查集是 Kruskal 的核心：find(x) 返回 x 所在集合的代表，路径压缩让后续查询接近 O(1)；union(a,b) 把两个集合合并，按秩合并可保证树高 O(log n)。判断一条边的两端 find 结果是否相同，就能 O(α(n)) 判断成环。',
      '选型口诀：单源非负权 → Dijkstra（堆优化）；多源/任意两点且 n 小 → Floyd；有负权 → Bellman-Ford/SPFA；稀疏图 MST → Kruskal；稠密图 MST → Prim。图的存储：n、m ≤ 10^5 用邻接表（链式前向星或 vector），n ≤ 300 的稠密图用邻接矩阵。',
    ],
    analogy:
      'Dijkstra 像往水里扔石子，涟漪按距离一圈圈扩散，先被波及的点一定离得最近；Kruskal 像修路时先挑最便宜的几段修，只要不形成闭环就修。',
    keyPoints: [
      'Dijkstra 必须非负权；堆优化 O((n+m) log n)。',
      'Floyd 五行三重循环，适合 n ≤ 300，能一次求出全源最短路。',
      '负权边用 Bellman-Ford；第 n 轮仍能松弛说明有负环。',
      'Kruskal = 排序 + 并查集，选 n-1 条边即停。',
      '并查集要写路径压缩，否则 Kruskal 会退化。',
    ],
    syntax: [
      '邻接表：vector<pair<int,int>> g[N]; g[u].push_back({v, w});',
      '堆优化 Dijkstra 的优先队列：priority_queue<pair<int,int>, vector<pair<int,int>>, greater<pair<int,int>>> pq;',
      '松弛：if (dist[u] + w < dist[v]) { dist[v] = dist[u] + w; pq.push({dist[v], v}); }',
      'Floyd：for k, for i, for j: d[i][j] = min(d[i][j], d[i][k] + d[k][j]); 注意 k 必须在最外层。',
      '并查集：int find(int x) { return fa[x] == x ? x : fa[x] = find(fa[x]); }',
      'Kruskal 排序：sort(edges, edges + m, [](E a, E b) { return a.w < b.w; });',
      '初始化：dist[s] = 0，其余 INF（0x3f3f3f3f 或 1e18），矩阵对角线为 0。',
    ],
    pitfalls: [
      {
        wrong: '用 Dijkstra 跑带负权边的图',
        right: '改用 Bellman-Ford，或先用 Johnson 算法处理负权',
        reason: 'Dijkstra 的贪心依赖「最小距离的点不会再被缩短」，负权边会让这个前提失效，结果错误。',
      },
      {
        wrong: 'Floyd 把 k 循环写在最内层',
        right: 'k 必须是最外层循环',
        reason: 'Floyd 是按「允许经过的中间点集合」逐层扩展的 DP，k 在内层会用到还没算好的状态。',
      },
      {
        wrong: 'Kruskal 不判连通就直接加边',
        right: 'if (find(u) == find(v)) continue; 否则 union 后计数',
        reason: '不判连通会加入成环的边，最终选出的不是树，总权也不是最小。',
      },
    ],
  },
  template: {
    title: 'graph_short.cpp',
    explain: '邻接表 + 堆优化 Dijkstra 求单源最短路，并查集 + Kruskal 求最小生成树，Floyd 求全源最短路。',
    code: `#include <iostream>
#include <vector>
#include <queue>
#include <algorithm>
using namespace std;

const int N = 100005;
const long long INF = (long long)4e18;   // 足够大的无穷
struct Edge { int to; long long w; };
vector<Edge> g[N];                        // 邻接表
int n, m;

long long dist[N];
bool vis[N];

void dijkstra(int s) {                    // 单源最短路，O((n+m) log n)
    for (int i = 1; i <= n; i++) dist[i] = INF;
    dist[s] = 0;
    priority_queue<pair<long long,int>, vector<pair<long long,int>>, greater<pair<long long,int>>> pq;
    pq.push({0, s});                      // 小根堆：距离在前
    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop(); // 取出当前距离最小的点
        if (d > dist[u]) continue;        // 过期条目，跳过
        if (vis[u]) continue;             // 已经确定过，跳过
        vis[u] = true;
        for (auto &e : g[u]) {            // 松弛所有邻居
            if (dist[u] + e.w < dist[e.to]) {
                dist[e.to] = dist[u] + e.w;
                pq.push({dist[e.to], e.to});  // 新距离入堆
            }
        }
    }
}

struct KEdge { int u, v; long long w; };  // 最小生成树的边
KEdge ke[N];
int fa[N];

int find(int x) {                         // 并查集 + 路径压缩
    return fa[x] == x ? x : fa[x] = find(fa[x]);
}

long long kruskal() {                     // 返回 MST 总权，图不连通返回 -1
    sort(ke, ke + m, [](const KEdge &a, const KEdge &b) { return a.w < b.w; });
    for (int i = 1; i <= n; i++) fa[i] = i;
    long long sum = 0; int cnt = 0;
    for (int i = 0; i < m; i++) {
        int ru = find(ke[i].u), rv = find(ke[i].v);
        if (ru == rv) continue;           // 已连通，加了会成环
        fa[ru] = rv;                      // 合并
        sum += ke[i].w;                   // 计入答案
        if (++cnt == n - 1) break;        // 选够 n-1 条边
    }
    return cnt == n - 1 ? sum : -1;
}

int main() {
    n = 4; m = 5;
    g[1].push_back({2, 2}); g[2].push_back({1, 2});
    g[1].push_back({3, 5}); g[3].push_back({1, 5});
    g[2].push_back({3, 1}); g[3].push_back({2, 1});
    g[2].push_back({4, 4}); g[4].push_back({2, 4});
    g[3].push_back({4, 3}); g[4].push_back({3, 3});
    dijkstra(1);
    cout << dist[4] << endl;              // 2+1+3 = 6

    ke[0] = {2, 3, 1}; ke[1] = {1, 2, 2};
    ke[2] = {3, 4, 3}; ke[3] = {2, 4, 4};
    ke[4] = {1, 3, 5};
    m = 5;
    cout << kruskal() << endl;            // 1+2+3 = 6
    return 0;
}`,
  },
  examples: [
    {
      id: 'sp-e1',
      title: '单源最短路（非负权）',
      difficulty: '入门',
      problem: 'n 个点 m 条有向边，边权非负，求 1 号点到 n 号点的最短距离，不可达输出 -1。',
      sample: '输入：4 5，边 1→2:2, 1→3:5, 2→3:1, 2→4:4, 3→4:3  输出：6',
      ideas: [
        '邻接表存储，dist 初始化为 INF，dist[1] = 0。',
        '用小根堆维护「候选距离」，每次取最小的点确认。',
        '用它的距离去更新所有邻居，变短就入堆。',
        '堆里可能有同一点的多个旧距离，弹出时比较 d > dist[u] 直接跳过。',
      ],
      code: `void dijkstra(int s, int n) {
    fill(dist, dist + n + 1, INF);
    dist[s] = 0;
    priority_queue<pair<long long,int>, vector<pair<long long,int>>, greater<>> pq;
    pq.push({0, s});
    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;         // 过期条目
        for (auto &e : g[u]) {
            if (dist[u] + e.w < dist[e.to]) {
                dist[e.to] = dist[u] + e.w;
                pq.push({dist[e.to], e.to});
            }
        }
    }
}`,
      time: 'O((n+m) log n)',
      space: 'O(n+m)',
      takeaway: '堆优化的关键只有两句：取最小、过期跳过；其余就是标准松弛。',
    },
    {
      id: 'sp-e2',
      title: '最小生成树（Kruskal）',
      difficulty: '进阶',
      problem: 'n 个点 m 条边的连通无向图，求最小生成树总权值；不连通输出 -1。',
      sample: '输入：4 5，边 (1,2,2) (2,3,1) (3,4,3) (2,4,4) (1,3,5)  输出：6',
      ideas: [
        '把所有边按权值升序排序。',
        '从小到大尝试每条边，用并查集判断两端是否已连通。',
        '不连通就选这条边并合并两个集合，连通则跳过（否则成环）。',
        '选够 n-1 条边就结束；结束时不足 n-1 说明图不连通。',
      ],
      code: `long long kruskal(int n, int m, vector<KEdge> &es) {
    sort(es.begin(), es.end(), [](const KEdge &a, const KEdge &b) { return a.w < b.w; });
    for (int i = 1; i <= n; i++) fa[i] = i;
    long long sum = 0; int cnt = 0;
    for (auto &e : es) {
        int ru = find(e.u), rv = find(e.v);
        if (ru == rv) continue;            // 成环，跳过
        fa[ru] = rv;
        sum += e.w;
        if (++cnt == n - 1) break;
    }
    return cnt == n - 1 ? sum : -1;
}`,
      time: 'O(m log m)',
      space: 'O(n+m)',
      takeaway: 'Kruskal 一句话概括：排序边、查连通、不成环就选、选够 n-1 条停。',
    },
    {
      id: 'sp-e3',
      title: '任意两点最短路（Floyd）',
      difficulty: '进阶',
      problem: 'n 个点（n ≤ 300）的带权有向图，求任意两点间最短距离，不可达输出 -1。',
      sample: '输入：3 个点，边 1→2:3, 2→3:1, 1→3:10  输出：d[1][3] = 4',
      ideas: [
        '用邻接矩阵存边，d[i][i] = 0，无边为 INF。',
        '三重循环：k 在最外层，表示允许经过编号 ≤ k 的点作为中转。',
        '转移 d[i][j] = min(d[i][j], d[i][k] + d[k][j])。',
        '结束后仍为 INF 的点对即不可达；注意 INF 相加会溢出，可用 0x3f3f3f3f 且判断 d[i][k] < INF。',
      ],
      code: `void floyd(int n) {
    for (int k = 1; k <= n; k++)           // 中转点必须最外层
        for (int i = 1; i <= n; i++)
            for (int j = 1; j <= n; j++)
                if (d[i][k] + d[k][j] < d[i][j])   // 经 k 中转更短
                    d[i][j] = d[i][k] + d[k][j];
}`,
      time: 'O(n³)',
      space: 'O(n²)',
      takeaway: 'Floyd 的 k 在外层是 DP 的阶段，写反了就会用未完成的状态。',
    },
  ],
  homework: [
    '实现堆优化 Dijkstra，输出起点到所有点的距离，并与朴素 O(n²) 版本对比随机图结果。',
    '用 Bellman-Ford 判负环：给一个含负权边的图，输出是否存在负环。',
    '实现并查集（含路径压缩与按秩合并），做 10^5 次合并与查询并统计耗时。',
    '同一张稠密图分别用 Kruskal 与 Prim 求 MST，验证总权相同。',
  ],
};

/** GESP 八级：倍增与快速幂 */
const doubling: ITopic = {
  id: 'doubling',
  stage: 'contest',
  order: 29,
  title: '倍增与快速幂',
  subtitle: '把线性步骤压成对数级',
  minutes: 40,
  keywords: ['快速幂', '矩阵快速幂', '倍增', 'ST 表', 'LCA', '二进制拆分'],
  summary: '快速幂的二进制拆分原理与写法、矩阵快速幂求递推、ST 表 O(1) 区间最值、倍增求 LCA。',
  sections: {
    concept: [
      '倍增的共同思想是：把「走 n 步」拆成二进制位，每次把步长翻倍，只处理为 1 的位，从而把 O(n) 变成 O(log n)。快速幂、矩阵快速幂、ST 表、LCA、后缀数组的构造都用这个思想。',
      '快速幂计算 a^b mod m：把 b 写成二进制，例如 13 = 1101₂ = 8+4+1，于是 a^13 = a^8 × a^4 × a^1。循环中维护底数 a（每轮平方）与答案 r（当前位为 1 就乘上），b 每轮右移一位。复杂度 O(log b)，b 到 10^18 也只是 60 轮。',
      '快速幂的三个注意点：底数要先对 m 取模；乘法中间结果用 long long；指数类型用 long long，别用 int 存 10^18。当 m = 1 时结果恒为 0，可以在开头特判。',
      '矩阵快速幂把「乘法」换成矩阵乘法、把「1」换成单位矩阵。它对线性递推极其有效：斐波那契 f(n) = f(n-1) + f(n-2) 可以写成 [[1,1],[1,0]] 的 n 次幂作用于初始向量，于是 O(n) 的递推变成 O(k³ log n)（k 是矩阵阶数）。构造矩阵的通用方法是：把状态写成列向量，找出下一状态 = 矩阵 × 当前状态。',
      'ST 表（Sparse Table）解决「静态数组的区间最值」：st[k][i] 表示从 i 开始长度为 2^k 的区间的最值，转移是 st[k][i] = max(st[k-1][i], st[k-1][i + 2^(k-1)])。查询 [l,r] 时取 k = log2(r-l+1)，答案是 max(st[k][l], st[k][r-2^k+1])——两段长度为 2^k 的区间必然覆盖整个查询区间，所以可重复贡献的最值可以 O(1) 查询。预处理 O(n log n)，空间 O(n log n)。注意 ST 表不支持修改，区间和也不能这么查（会重复计算）。',
      '倍增求 LCA（最近公共祖先）：先预处理每个点向上 2^k 步的祖先 up[k][v]，并把深度差用二进制拆分成若干次上跳，把较深的点提到同深度；然后从大到小尝试「同时上跳 2^k 步后是否相同」，若不同就一起跳；最后再各跳一步，父节点即 LCA。单次查询 O(log n)。',
      '倍增还用于「二分答案的替代」：当判定函数满足单调性且需要找最大可行值时，可以按 2^k 从大到小试探，能行就前进 2^k，这比二分更容易处理「跳跃式」的状态转移（如树上跳、序列自动机上跳）。',
    ],
    analogy:
      '倍增像「只能迈 1、2、4、8… 步」的走法：要到 13 米处，就走 8 米、4 米、1 米三段，总共只迈三步；而不是一步一步迈十三次。',
    keyPoints: [
      '快速幂 = 二进制拆分 + 底数平方，O(log b)。',
      '矩阵快速幂把线性递推变成 O(k³ log n)。',
      'ST 表 O(n log n) 预处理、O(1) 查询，只支持静态、可重复贡献的运算。',
      'LCA 倍增：先抬到同深度，再从大到小同步上跳。',
      '倍增的循环顺序永远是从大到小（2^k 递减）。',
    ],
    syntax: [
      'int qpow(long long a, long long b, int m) { long long r = 1; a %= m; while (b) { if (b & 1) r = r * a % m; a = a * a % m; b >>= 1; } return r; }',
      '矩阵定义：struct Mat { long long a[2][2]; }; 乘法三重循环，注意每次乘完取模。',
      '单位矩阵：对角为 1、其余为 0，作为矩阵快速幂的初始值。',
      'ST 表预处理：for (int k = 1; (1 << k) <= n; k++) for (int i = 1; i + (1<<k) - 1 <= n; i++) st[k][i] = max(st[k-1][i], st[k-1][i + (1<<(k-1))]);',
      'ST 表查询：int k = log2(r-l+1); ans = max(st[k][l], st[k][r-(1<<k)+1]);',
      'LCA 上跳：for (int k = LOG; k >= 0; k--) if (up[k][u] != up[k][v]) { u = up[k][u]; v = up[k][v]; }',
      '深度差拆分：int diff = dep[u] - dep[v]; for (int k = 0; diff; k++, diff >>= 1) if (diff & 1) u = up[k][u];',
    ],
    pitfalls: [
      {
        wrong: 'r = r * a;  // 不取模，指数一大就溢出',
        right: 'r = r * a % m; a = a * a % m;',
        reason: 'long long 上限约 9.2×10^18，两个 10^9 量级的数相乘就会溢出，必须在每次乘法后取模。',
      },
      {
        wrong: 'for (int k = 0; k <= LOG; k++) 做倍增上跳',
        right: 'for (int k = LOG; k >= 0; k--)',
        reason: '从小到大跳会一次跳太多，错过正确的分界点；必须从最大步长开始试。',
      },
      {
        wrong: '用 ST 表求区间和',
        right: '区间和用前缀和；ST 表只用于 max/min/gcd 这类可重复贡献的运算',
        reason: 'ST 表查询时两段区间会重叠，重叠部分的和会被重复计算。',
      },
    ],
  },
  template: {
    title: 'fastpow.cpp',
    explain: '快速幂模板、矩阵快速幂求斐波那契、ST 表求区间最大值。',
    code: `#include <iostream>
#include <cstring>
using namespace std;

const int MOD = 1000000007;

long long qpow(long long a, long long b, long long m) {  // 快速幂：a^b % m
    long long r = 1 % m;             // m = 1 时结果应为 0
    a %= m;                          // 底数先取模
    while (b > 0) {
        if (b & 1) r = r * a % m;    // 二进制当前位为 1，乘进答案
        a = a * a % m;               // 底数平方，对应下一位的权值
        b >>= 1;                     // 指数右移一位
    }
    return r;
}

struct Mat {                         // 2×2 矩阵
    long long a[2][2];
    Mat() { memset(a, 0, sizeof(a)); }
};

Mat mul(const Mat &x, const Mat &y) {  // 矩阵乘法，逐项取模
    Mat z;
    for (int i = 0; i < 2; i++)
        for (int j = 0; j < 2; j++)
            for (int k = 0; k < 2; k++)
                z.a[i][j] = (z.a[i][j] + x.a[i][k] * y.a[k][j]) % MOD;
    return z;
}

long long fib(int n) {               // 用矩阵快速幂求第 n 项斐波那契
    Mat base;                        // 转移矩阵 [[1,1],[1,0]]
    base.a[0][0] = base.a[0][1] = base.a[1][0] = 1;
    Mat r;                           // 单位矩阵
    r.a[0][0] = r.a[1][1] = 1;
    while (n > 0) {
        if (n & 1) r = mul(r, base);  // 对应位的矩阵乘进答案
        base = mul(base, base);       // 转移矩阵自乘
        n >>= 1;
    }
    return r.a[0][1];                // 结果在右上角
}

const int N = 100005, LOG = 17;
int st[LOG][N];                      // st[k][i]：从 i 开始长度 2^k 的区间最大值

void buildST(int n, int *a) {
    for (int i = 1; i <= n; i++) st[0][i] = a[i];   // 长度 1 就是本身
    for (int k = 1; (1 << k) <= n; k++)
        for (int i = 1; i + (1 << k) - 1 <= n; i++)
            st[k][i] = max(st[k-1][i], st[k-1][i + (1 << (k-1))]);  // 两段拼起来
}

int queryST(int l, int r) {          // O(1) 查询
    int k = 0;
    while ((1 << (k + 1)) <= r - l + 1) k++;   // 找最大的 2^k ≤ 区间长度
    return max(st[k][l], st[k][r - (1 << k) + 1]);  // 首尾两段覆盖整个区间
}

int main() {
    cout << qpow(2, 13, MOD) << endl;   // 8192
    cout << fib(10) << endl;            // 55
    int a[6] = {0, 3, 1, 4, 1, 5};
    buildST(5, a);
    cout << queryST(1, 3) << endl;      // 4
    return 0;
}`,
  },
  examples: [
    {
      id: 'db-e1',
      title: '快速幂取模',
      difficulty: '入门',
      problem: '求 a^b mod p，其中 a ≤ 10^9，b ≤ 10^18，p ≤ 10^9+7。',
      sample: '输入：2 10 1000  输出：24',
      ideas: [
        'b 太大不能循环乘 b 次。',
        '把 b 拆成二进制，维护底数 a 与结果 r。',
        'b 当前位为 1 就把 a 乘进 r；每轮 a 平方、b 右移。',
        '每步乘法后立刻取模，避免溢出。',
      ],
      code: `long long qpow(long long a, long long b, long long p) {
    long long r = 1 % p;
    a %= p;
    while (b > 0) {
        if (b & 1) r = r * a % p;      // 这一位有效
        a = a * a % p;                 // 权值翻倍
        b >>= 1;
    }
    return r;
}`,
      time: 'O(log b)',
      space: 'O(1)',
      takeaway: '快速幂只有三行核心：判位、乘、平方并右移；背下来就不会写错。',
    },
    {
      id: 'db-e2',
      title: '斐波那契第 n 项（矩阵快速幂）',
      difficulty: '进阶',
      problem: 'f(1)=f(2)=1，f(n)=f(n-1)+f(n-2)，求 f(n) mod 10^9+7，n ≤ 10^18。',
      sample: '输入：10  输出：55',
      ideas: [
        '构造状态向量 [f(n), f(n-1)]，则 [f(n+1), f(n)] = M × [f(n), f(n-1)]，M = [[1,1],[1,0]]。',
        '于是 [f(n), f(n-1)] = M^(n-1) × [f(1), f(0)]。',
        '用矩阵快速幂算 M^(n-1)，取结果矩阵的对应位置。',
        '矩阵乘法是 O(k³)，k=2 时每次 8 次乘加，log n 轮完全够快。',
      ],
      code: `long long fib(long long n) {
    Mat base; base.a[0][0] = base.a[0][1] = base.a[1][0] = 1;
    Mat r; r.a[0][0] = r.a[1][1] = 1;  // 单位矩阵
    long long e = n - 1;               // 幂次
    while (e > 0) {
        if (e & 1) r = mul(r, base);
        base = mul(base, base);
        e >>= 1;
    }
    return r.a[0][0];                  // 左上角就是 f(n)
}`,
      time: 'O(log n)',
      space: 'O(1)',
      takeaway: '线性递推 → 构造转移矩阵 → 矩阵快速幂，是压掉 O(n) 的标准套路。',
    },
    {
      id: 'db-e3',
      title: '区间最大值（ST 表）',
      difficulty: '进阶',
      problem: '给长度 n 的静态数组和 m 次查询，每次问 [l,r] 的最大值。n,m ≤ 10^5。',
      sample: '输入：a=3 1 4 1 5，查询 [1,3] 与 [2,5]  输出：4 5',
      ideas: [
        'st[k][i] 表示从 i 开始、长度 2^k 的区间最大值，k=0 时是元素本身。',
        '递推：st[k][i] = max(st[k-1][i], st[k-1][i + 2^(k-1)])。',
        '查询取 k = floor(log2(len))，用 [l, l+2^k-1] 与 [r-2^k+1, r] 两段覆盖。',
        '两段可以重叠，因为 max 重复计算不影响结果。',
      ],
      code: `void build(int n, int *a) {
    for (int i = 1; i <= n; i++) st[0][i] = a[i];
    for (int k = 1; (1 << k) <= n; k++)
        for (int i = 1; i + (1 << k) - 1 <= n; i++)
            st[k][i] = max(st[k-1][i], st[k-1][i + (1 << (k-1))]);
}

int ask(int l, int r) {
    int k = 0;
    while ((1 << (k + 1)) <= r - l + 1) k++;   // 最大的 2^k 不超过区间长度
    return max(st[k][l], st[k][r - (1 << k) + 1]);
}`,
      time: 'O(n log n) 预处理，O(1) 查询',
      space: 'O(n log n)',
      takeaway: 'ST 表用「重叠覆盖」换 O(1) 查询，所以只适用于 max/min/gcd 这类可重复贡献的运算。',
    },
  ],
  homework: [
    '用快速幂求 a^b mod p，并测试 b 取 10^18 时的运行时间。',
    '用矩阵快速幂求斐波那契前 n 项和（提示：状态加一维前缀和）。',
    '实现 ST 表求区间 gcd，比较与线段树的查询耗时。',
    '实现倍增 LCA，给一棵树和 m 次询问，输出每对点的最近公共祖先。',
  ],
};

export const GESP3_TOPICS: ITopic[] = [stackQueue, hashTable, combinatorics, shortestPath, doubling];
