import type { ITopic } from '../types';

export const CONTEST_TOPICS: ITopic[] = [
  {
    id: 'dp',
    stage: 'contest',
    order: 20,
    title: '动态规划入门',
    subtitle: '把大问题拆成能查表的小问题',
    minutes: 45,
    keywords: ['状态', '转移', '01 背包', '数字三角形', '最长上升子序列'],
    summary: '掌握「状态定义 + 转移方程 + 边界初始化」三步法，能独立完成数字三角形、01 背包、最长上升子序列。',
    sections: {
      concept: [
        '动态规划的核心是「不重复计算」。把问题拆成若干子问题，把子问题的答案存进表格，需要时直接查表，而不是重新算一遍。',
        '做题时按三步走：第一步定义状态，想清楚 dp[i] 或 dp[i][j] 到底代表什么；第二步写转移方程，想清楚这个状态由哪些更小的状态推出来；第三步定边界，把最小规模的情况手工填好。',
        '01 背包状态是 dp[j]：容量为 j 时能装下的最大价值。转移时对每件物品，从大到小枚举容量，保证每件物品只用一次——这就是「倒序枚举」的由来。',
        '空间可以优化：如果 dp[i] 只依赖 dp[i-1]，就能把第一维压掉，只留一维数组。01 背包正是这种情况，所以最终代码只有一个一维数组。',
      ],
      analogy: '动态规划像记账：你不会每次想知道总花费都从头加一遍，而是在账本上留下「到目前为止的累计」。新的一笔来了，只需用上一行的累计加上这笔。账本就是 dp 表，累计的规则就是转移方程。',
      syntax: [
        '状态定义：dp[i][j] 表示「考虑到第 i 个物品、容量为 j」时的最优值。',
        '转移：dp[j] = max(dp[j], dp[j - w[i]] + v[i]);',
        '边界：dp[0] = 0，其余按题意初始化为 0 或负无穷。',
        '倒序枚举：for (int j = m; j >= w[i]; j--) 保证物品只用一次。',
        '正序枚举：完全背包才从小到大，因为同一物品可以重复选。',
      ],
      pitfalls: [
        { wrong: '01 背包里写成 for (j = w[i]; j <= m; j++)', right: '从 m 倒着枚举到 w[i]', reason: '正序会让同一件物品被重复放进背包，变成完全背包。' },
        { wrong: 'dp 数组没初始化为负无穷，求最大值时被 0 干扰', right: '按题意初始化为 -INF 或 0', reason: '不可达状态被当成 0，会污染后续转移结果。' },
        { wrong: '状态定义含糊：dp[i] 到底表示「前 i 个」还是「以 i 结尾」', right: '写下来，并用样例验证', reason: '定义不清，转移方程一定写错。' },
      ],
      keyPoints: [
        '先想「最后一步」：答案是从哪些状态转移过来的。',
        '初始化与边界是 DP 最常见的失分点，写完先用最小样例手推一遍。',
        '看到「每件物品只能用一次」就倒序枚举，看到「可以重复选」就正序。',
      ],
    },
    template: {
      title: '01 背包模板',
      explain: '最经典的 DP：n 件物品，每件有重量与价值，背包容量 m，求最大价值。',
      code: `#include <iostream>
#include <algorithm>
using namespace std;

int w[105], v[105];               // 第 i 件物品的重量与价值，下标从 1 开始
int dp[10005];                    // dp[j]：容量 j 时的最大价值

int main() {
    int n, m;
    cin >> n >> m;
    for (int i = 1; i <= n; i++) cin >> w[i] >> v[i];  // 读入 n 件物品

    for (int i = 1; i <= n; i++) {  // 逐件考虑物品
        for (int j = m; j >= w[i]; j--) {  // 倒序，保证只用一次
            dp[j] = max(dp[j], dp[j - w[i]] + v[i]);  // 不选这件与选这件，取较大值
        }
    }
    cout << dp[m] << "\\n";       // 容量 m 的最优解
    return 0;
}`,
    },
    examples: [
      {
        id: 'dp-1',
        title: '数字三角形',
        difficulty: '进阶',
        problem: '一个 n 行的数字三角形，从顶部出发每次只能走到下一行相邻的两个位置，走到最底层，求路径上数字之和的最大值。',
        sample: '5 行：7 / 3 8 / 8 1 0 / 2 7 4 4 / 4 5 2 6 5，答案 30',
        ideas: ['状态：dp[i][j] 表示从顶走到 (i,j) 的最大和。', '转移：只能从左上或正上过来，取两者较大值。', '边界：第一行就是起点本身。'],
        code: `#include <iostream>
#include <algorithm>
using namespace std;

int a[105][105], dp[105][105];    // a 存三角形，dp 存走到每个格子的最大和

int main() {
    int n;
    cin >> n;
    for (int i = 1; i <= n; i++)  // 第 i 行有 i 个数
        for (int j = 1; j <= i; j++) cin >> a[i][j];

    dp[1][1] = a[1][1];           // 起点
    for (int i = 2; i <= n; i++)
        for (int j = 1; j <= i; j++) {
            if (j == 1) dp[i][j] = dp[i - 1][j] + a[i][j];  // 只能从正上方来
            else if (j == i) dp[i][j] = dp[i - 1][j - 1] + a[i][j];  // 只能从左上方来
            else dp[i][j] = max(dp[i - 1][j - 1], dp[i - 1][j]) + a[i][j];
        }

    int ans = 0;                  // 答案在最后一行里，不一定是最后一格
    for (int j = 1; j <= n; j++) ans = max(ans, dp[n][j]);
    cout << ans << "\\n";         // 输出最大路径和
    return 0;
}`,
        time: 'O(n^2)',
        space: 'O(n^2)',
        takeaway: '边界要单独处理，否则 dp[0][j] 会把不存在的格子算进来。',
      },
      {
        id: 'dp-2',
        title: '01 背包',
        difficulty: '挑战',
        problem: 'n 件物品，第 i 件重 w[i]、价值 v[i]，背包容量 m，每件最多选一次，求最大价值。',
        sample: '输入：4 8 / 2 3 / 3 4 / 4 5 / 5 6　　输出：10',
        ideas: ['状态：dp[j] 是容量 j 的最大价值。', '对每件物品倒序枚举容量 j。', '选与不选取较大值。'],
        code: `#include <iostream>
#include <algorithm>
using namespace std;

int w[105], v[105], dp[10005];    // w 重量、v 价值，dp[j] 是容量 j 的最大价值

int main() {
    int n, m;
    cin >> n >> m;
    for (int i = 1; i <= n; i++) cin >> w[i] >> v[i];

    for (int i = 1; i <= n; i++)
        for (int j = m; j >= w[i]; j--)  // 倒序枚举容量，保证每件物品只用一次
            dp[j] = max(dp[j], dp[j - w[i]] + v[i]);  // 选与不选，取较大值

    cout << dp[m] << "\\n";       // 容量 m 时的最优价值
    return 0;
}`,
        time: 'O(nm)',
        space: 'O(m)',
        takeaway: '倒序枚举是「每件只用一次」的保证，改成正序就变成无限件。',
      },
      {
        id: 'dp-3',
        title: '最长上升子序列',
        difficulty: '挑战',
        problem: '给一个长度为 n 的序列，求最长的严格上升子序列长度。',
        sample: '输入：6 / 3 1 2 5 4 6　　输出：4',
        ideas: ['状态：dp[i] 表示以 a[i] 结尾的最长上升子序列长度。', '转移：找所有 j < i 且 a[j] < a[i]，取 dp[j] 最大值再加 1。', '答案是所有 dp[i] 的最大值，不一定是最后一个。'],
        code: `#include <iostream>
#include <algorithm>
using namespace std;

int a[1005], dp[1005];            // dp[i]：以 a[i] 结尾的最长上升子序列长度

int main() {
    int n;
    cin >> n;
    for (int i = 0; i < n; i++) { cin >> a[i]; dp[i] = 1; }  // 每个元素自成一个序列

    for (int i = 1; i < n; i++)
        for (int j = 0; j < i; j++)
            if (a[j] < a[i]) dp[i] = max(dp[i], dp[j] + 1);  // 能接在 j 后面就试着接上

    int ans = 0;                  // 答案取所有 dp[i] 的最大值
    for (int i = 0; i < n; i++) ans = max(ans, dp[i]);
    cout << ans << "\\n";         // 输出最长长度
    return 0;
}`,
        time: 'O(n^2)',
        space: 'O(n)',
        takeaway: '「以 i 结尾」这个定义决定了转移必须往前找，而不是往后。',
      },
    ],
    homework: ['把 01 背包改成「每件物品可以选多次」，代码要改哪一行？', '手推一遍数字三角形样例，写出完整的 dp 表。'],
  },
  {
    id: 'dfs-bfs',
    stage: 'contest',
    order: 21,
    title: '搜索：DFS 与 BFS',
    subtitle: '把所有可能走一遍，或者一层层扩散',
    minutes: 45,
    keywords: ['DFS', 'BFS', '回溯', '队列', '连通块'],
    summary: '用 DFS 做枚举与回溯，用 BFS 求无权最短路，掌握访问标记与队列这两个关键细节。',
    sections: {
      concept: [
        'DFS 沿着一条路一直走到底，走不动再退回上一个岔路口换方向，天然适合「枚举所有可能」和「判断连通」。它用递归实现，栈深度就是路径长度。',
        'BFS 用队列一圈一圈向外扩散：先处理距离为 0 的起点，再处理距离为 1 的所有点，再是 2……所以它第一次到达某个点时，走的一定是最短路径（边权为 1 时）。',
        '两者都必须有「访问标记」。不标记会重复访问，DFS 陷入死循环，BFS 队列爆炸。标记要在入队 / 进入时立刻做，不能等出队再做。',
        '回溯是在 DFS 返回前把状态恢复原样，让上一层看到的是干净的现场。全排列、八皇后、数独都靠这一手。',
      ],
      analogy: 'DFS 像走迷宫时贴墙一直往前探，撞墙了退回上一个路口；BFS 像往平静水面扔一颗石子，波纹一圈圈均匀扩散，最先碰到岸边的那个方向就是最近的出口。',
      syntax: [
        '方向数组：int dx[4] = {1, -1, 0, 0}; int dy[4] = {0, 0, 1, -1};',
        'DFS 骨架：void dfs(int x, int y) { vis[x][y] = 1; for (四个方向) if (可走且未访问) dfs(nx, ny); }',
        'BFS 骨架：queue<pair<int,int>> q; q.push({sx, sy}); 出队后扩展四邻。',
        '层数记录：用 dist 数组存步数，dist[nx][ny] = dist[x][y] + 1。',
        '回溯：选 → dfs → 撤销选择，撤销那句不能漏。',
      ],
      pitfalls: [
        { wrong: 'BFS 在出队时才标记访问', right: '入队时就标记', reason: '同一层多个点会把同一个邻居重复入队，队列规模爆炸。' },
        { wrong: 'DFS 忘记 vis 标记', right: '进入时立即标记', reason: '来回走同一条边，形成无限递归。' },
        { wrong: '回溯时忘记撤销', right: 'dfs 返回后恢复 used 状态', reason: '下一分支看到的是被改脏的状态，结果偏少或重复。' },
      ],
      keyPoints: [
        '无权图最短路一律 BFS，不要用 DFS 试。',
        'BFS 的 dist 数组同时承担「访问标记」和「距离记录」两个职责。',
        'DFS 的复杂度是指数级的，先估算搜索空间再动手。',
      ],
    },
    template: {
      title: 'BFS 求迷宫最短步数',
      explain: '在 0/1 网格中从左上走到右下，0 可走，求最少步数。',
      code: `#include <iostream>
#include <queue>
using namespace std;

int grid[105][105], dist[105][105];  // grid 存地图，dist 同时充当距离与访问标记
int dx[4] = {1, -1, 0, 0};        // 四个方向：下、上、右、左
int dy[4] = {0, 0, 1, -1};

int main() {
    int n, m;
    cin >> n >> m;
    for (int i = 0; i < n; i++)
        for (int j = 0; j < m; j++) { cin >> grid[i][j]; dist[i][j] = -1; }  // 读地图，距离先全部设成未访问

    queue<pair<int, int>> q;
    q.push({0, 0});               // 起点入队，距离为 0
    dist[0][0] = 0;               // 入队即标记

    while (!q.empty()) {
        pair<int, int> cur = q.front(); q.pop();  // 取出队头并弹出
        int x = cur.first, y = cur.second;
        for (int d = 0; d < 4; d++) {
            int nx = x + dx[d], ny = y + dy[d];
            if (nx < 0 || nx >= n || ny < 0 || ny >= m) continue;  // 越界
            if (grid[nx][ny] == 1 || dist[nx][ny] != -1) continue;  // 障碍或已访问
            dist[nx][ny] = dist[x][y] + 1;  // 步数比当前点多 1
            q.push({nx, ny});
        }
    }

    cout << dist[n - 1][m - 1] << "\\n";  // -1 表示走不到
    return 0;
}`,
    },
    examples: [
      {
        id: 'search-1',
        title: '迷宫最短步数',
        difficulty: '进阶',
        problem: '5×5 的 0/1 网格，0 可走，从左上角走到右下角，求最少步数。',
        sample: '全 0 网格时答案是 8',
        ideas: ['BFS 逐层扩散。', 'dist 记录步数，同时当访问标记。', '终点第一次被赋值就是最短距离。'],
        code: `#include <iostream>
#include <queue>
using namespace std;

int g[5][5], dist[5][5];          // 固定 5×5 的网格
int dx[4] = {1, -1, 0, 0}, dy[4] = {0, 0, 1, -1};

int main() {
    for (int i = 0; i < 5; i++)
        for (int j = 0; j < 5; j++) { cin >> g[i][j]; dist[i][j] = -1; }

    queue<pair<int, int>> q;
    q.push({0, 0}); dist[0][0] = 0;  // 起点入队并标记距离 0
    while (!q.empty()) {
        auto cur = q.front(); q.pop();
        for (int d = 0; d < 4; d++) {
            int nx = cur.first + dx[d], ny = cur.second + dy[d];
            if (nx < 0 || nx >= 5 || ny < 0 || ny >= 5) continue;
            if (g[nx][ny] || dist[nx][ny] != -1) continue;
            dist[nx][ny] = dist[cur.first][cur.second] + 1;
            q.push({nx, ny});
        }
    }
    cout << dist[4][4] << "\\n";  // 右下角就是终点
    return 0;
}`,
        time: 'O(nm)',
        space: 'O(nm)',
        takeaway: '无权图里 BFS 第一次到达即最短路，这是它相对 DFS 的核心优势。',
      },
      {
        id: 'search-2',
        title: '全排列（回溯）',
        difficulty: '挑战',
        problem: '输入 n（n ≤ 8），按字典序输出 1 到 n 的全排列。',
        sample: '输入：3　　输出：123 132 213 231 312 321',
        ideas: ['用一个数组记录当前排列。', '每层从 1 到 n 尝试，没用过的就选上。', '选完递归，返回后撤销标记。'],
        code: `#include <iostream>
using namespace std;

int n, path[10];                  // path 存当前正在填的排列
bool used[10];                    // used 记录某个数字是否已经被选

void dfs(int depth) {
    if (depth == n) {             // 填满 n 个位置
        for (int i = 0; i < n; i++) cout << path[i];  // 把填满的排列整行打出来
        cout << "\\n";
        return;
    }
    for (int v = 1; v <= n; v++) {
        if (used[v]) continue;    // 已经用过就跳过
        used[v] = true; path[depth] = v;  // 选
        dfs(depth + 1);           // 深入
        used[v] = false;          // 撤销，恢复现场
    }
}

int main() {
    cin >> n;                     // 读入规模，n 不超过 8
    dfs(0);                       // 从第 0 层开始填
    return 0;
}`,
        time: 'O(n!)',
        space: 'O(n)',
        takeaway: '回溯三步：选、递归、撤销；撤销漏了结果必然不对。',
      },
      {
        id: 'search-3',
        title: '连通块计数',
        difficulty: '进阶',
        problem: '0/1 网格中，上下左右相邻的 1 属于同一块，问有多少块。',
        sample: '输入：3 3 / 1 1 0 / 0 1 0 / 0 0 1　　输出：2',
        ideas: ['遍历每个格子，遇到未访问的 1 就计数器加一。', '从这个格子 DFS，把整块全部标记。', '继续扫描，剩下的 1 就是新块。'],
        code: `#include <iostream>
using namespace std;

int g[105][105], vis[105][105];   // g 是网格，vis 标记是否已经访问
int n, m;
int dx[4] = {1, -1, 0, 0}, dy[4] = {0, 0, 1, -1};

void dfs(int x, int y) {
    vis[x][y] = 1;
    for (int d = 0; d < 4; d++) {
        int nx = x + dx[d], ny = y + dy[d];
        if (nx < 0 || nx >= n || ny < 0 || ny >= m) continue;
        if (g[nx][ny] == 1 && !vis[nx][ny]) dfs(nx, ny);
    }
}

int main() {
    cin >> n >> m;
    for (int i = 0; i < n; i++)
        for (int j = 0; j < m; j++) cin >> g[i][j];

    int blocks = 0;               // 连通块计数器
    for (int i = 0; i < n; i++)
        for (int j = 0; j < m; j++)
            if (g[i][j] == 1 && !vis[i][j]) { blocks++; dfs(i, j); }  // 发现新的一块，顺便把整块标记掉

    cout << blocks << "\\n";      // 输出块数
    return 0;
}`,
        time: 'O(nm)',
        space: 'O(nm)',
        takeaway: '「每块只处理一次」靠的就是访问标记，这是连通性问题的标准套路。',
      },
    ],
    homework: ['把迷宫题改成输出完整路径，需要额外记录什么？', 'n = 8 的全排列有多少种？估算一下搜索时间。'],
  },
  {
    id: 'graph',
    stage: 'contest',
    order: 22,
    title: '图论与最短路',
    subtitle: '把关系画成点和线',
    minutes: 45,
    keywords: ['邻接表', 'Dijkstra', '优先队列', '拓扑排序', '入度'],
    summary: '学会用邻接表存图，写出 Dijkstra 求单源最短路，理解入度与拓扑排序。',
    sections: {
      concept: [
        '图由点（顶点）和边组成。存图两种方式：邻接矩阵 a[u][v] 适合点少、边密的稠密图；邻接表 vector<pair<int,int>> g[u] 适合点多的稀疏图，遍历邻居更快。',
        'Dijkstra 解决「边权非负」的单源最短路。它每次从未确定的点里取出当前距离最小的，用它的距离去松弛邻居，一旦取出就说明它已经是最终答案。',
        '为什么不能有负权边？因为 Dijkstra 假定「已经取出的点不会再有更短的路径」，负权会打破这个前提，此时要用 Bellman-Ford 或 SPFA。',
        '拓扑排序处理有向无环图：每次取出入度为 0 的点，删掉它的出边（邻居入度减一）。如果最后处理的点少于总数，说明图里有环。',
      ],
      analogy: 'Dijkstra 像从家出发探索城市：先确定最近的加油站，再从它出发看能不能绕出更近的路。每确定一个点，就把它的距离钉死，不再回头改。',
      syntax: [
        '邻接表：vector<pair<int,int>> g[1005];  g[u].push_back({v, w});',
        '优先队列：priority_queue<pair<int,int>, vector<pair<int,int>>, greater<pair<int,int>>> pq;',
        'Dijkstra 初始化：dist 全部设为 INF，dist[s] = 0，起点入队。',
        '松弛：if (dist[v] > dist[u] + w) { dist[v] = dist[u] + w; 入队 }',
        '入度：indeg[v]++，每次处理 u 时对邻居 indeg[v]--。',
        '拓扑队列：入度为 0 的点全部入队，逐个出队处理。',
      ],
      pitfalls: [
        { wrong: 'dist 初始化为 0', right: '初始化为 INF（如 0x3f3f3f3f）', reason: '距离为 0 会让所有松弛失效，答案全是 0。' },
        { wrong: 'Dijkstra 用普通队列', right: '优先队列（小根堆）', reason: '普通队列变成随机顺序的松弛，正确性无法保证。' },
        { wrong: '有负权边还用 Dijkstra', right: '改用 Bellman-Ford / SPFA', reason: '负权会破坏「取出即最终」的前提。' },
        { wrong: '拓扑排序忘记判断环', right: '结束时比较已处理点数与 n', reason: '有环时部分点入度永远不为 0，会漏解。' },
      ],
      keyPoints: [
        '点多的稀疏图一定用邻接表，邻接矩阵会爆内存。',
        'Dijkstra 的 dist 数组要开到 long long 时记得同步改 INF 与比较逻辑。',
        '拓扑排序是「依赖关系」建模的标准工具。',
      ],
    },
    template: {
      title: 'Dijkstra 最短路模板',
      explain: '邻接表存图 + 优先队列优化的 Dijkstra，输出起点到每个点的最短距离。',
      code: `#include <iostream>
#include <vector>
#include <queue>
using namespace std;

const int INF = 0x3f3f3f3f;
vector<pair<int, int>> g[1005];   // g[u] = {v, w}
int dist[1005];                   // 起点到每个点的最短距离

int main() {
    int n, m, s;
    cin >> n >> m >> s;           // 点数、边数、起点
    for (int i = 1; i <= m; i++) {
        int u, v, w;
        cin >> u >> v >> w;
        g[u].push_back({v, w});   // 有向边 u -> v，权值 w
    }

    for (int i = 1; i <= n; i++) dist[i] = INF;  // 初始化不可达
    dist[s] = 0;                  // 起点到自己的距离是 0
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;
    pq.push({0, s});              // {距离, 点}

    while (!pq.empty()) {
        auto cur = pq.top(); pq.pop();
        int d = cur.first, u = cur.second;
        if (d > dist[u]) continue;  // 过期记录，跳过

        for (auto e : g[u]) {     // 遍历所有邻居
            int v = e.first, w = e.second;
            if (dist[v] > dist[u] + w) {  // 松弛成功
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
        }
    }

    for (int i = 1; i <= n; i++) cout << dist[i] << " ";  // 依次输出到每个点的最短路
    cout << "\\n";
    return 0;
}`,
    },
    examples: [
      {
        id: 'graph-1',
        title: '建图与度数统计',
        difficulty: '入门',
        problem: '输入 n 个点 m 条无向边，输出每个点的度数（相连的边数）。',
        sample: '输入：3 2 / 1 2 / 2 3　　输出：1 2 1',
        ideas: ['无向边要在两个方向都加一次。', '度数就是邻接表的长度。', '也可以用数组直接计数。'],
        code: `#include <iostream>
#include <vector>
using namespace std;

vector<int> g[1005];              // 无权图只需要存邻居，不用存权值

int main() {
    int n, m;
    cin >> n >> m;
    for (int i = 0; i < m; i++) {  // 读入 m 条无向边
        int u, v;
        cin >> u >> v;
        g[u].push_back(v);        // 无向边，两边都要存
        g[v].push_back(u);
    }
    for (int i = 1; i <= n; i++) cout << g[i].size() << (i == n ? "\\n" : " ");  // 邻接表长度就是这个点的度数
    return 0;
}`,
        time: 'O(n + m)',
        space: 'O(n + m)',
        takeaway: '无向边的邻接表要存两次，忘一边就会少算度数。',
      },
      {
        id: 'graph-2',
        title: '单源最短路',
        difficulty: '挑战',
        problem: 'n 个点 m 条有向边，权值均为正，求从 s 到 t 的最短距离。',
        sample: '输入：4 4 1 / 1 2 1 / 2 3 2 / 1 3 4 / 3 4 1，到 4 的距离为 4',
        ideas: ['用 Dijkstra。', '优先队列每次取最小距离的点。', '提前结束：取出 t 时就可以停。'],
        code: `#include <iostream>
#include <vector>
#include <queue>
using namespace std;

const int INF = 0x3f3f3f3f;
vector<pair<int, int>> g[1005];
int dist[1005];

int main() {
    int n, m, s, t;
    cin >> n >> m >> s >> t;      // 点数、边数、起点、终点
    for (int i = 0; i < m; i++) {
        int u, v, w;
        cin >> u >> v >> w;
        g[u].push_back({v, w});
    }
    for (int i = 1; i <= n; i++) dist[i] = INF;
    dist[s] = 0;

    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;
    pq.push({0, s});
    while (!pq.empty()) {
        auto cur = pq.top(); pq.pop();
        int d = cur.first, u = cur.second;
        if (d > dist[u]) continue;
        if (u == t) break;        // 终点确定，提前结束
        for (auto e : g[u]) {
            int v = e.first, w = e.second;
            if (dist[v] > dist[u] + w) {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
        }
    }
    cout << (dist[t] == INF ? -1 : dist[t]) << "\\n";  // 不可达就输出 -1
    return 0;
}`,
        time: 'O((n+m) log n)',
        space: 'O(n + m)',
        takeaway: '只求单点距离时，取出终点即可 break，能省不少时间。',
      },
      {
        id: 'graph-3',
        title: '任务调度（拓扑排序）',
        difficulty: '挑战',
        problem: 'n 个任务，m 条依赖关系 u -> v 表示 u 必须先完成，输出一个可行的执行顺序。',
        sample: '输入：5 5 / 1 2 / 1 3 / 2 4 / 3 4 / 4 5　　输出：1 2 3 4 5',
        ideas: ['统计每个点的入度。', '入度为 0 的点入队。', '出队后把邻居入度减一，减到 0 就入队。'],
        code: `#include <iostream>
#include <vector>
#include <queue>
using namespace std;

vector<int> g[1005];              // 有向图的邻接表
int indeg[1005];                  // 每个点的入度，也就是还有几个前置任务

int main() {
    int n, m;
    cin >> n >> m;
    for (int i = 0; i < m; i++) {
        int u, v;
        cin >> u >> v;
        g[u].push_back(v);        // u 必须先于 v 完成
        indeg[v]++;               // v 有一个前置任务
    }

    queue<int> q;
    for (int i = 1; i <= n; i++) if (indeg[i] == 0) q.push(i);  // 没有前置任务的点先入队

    vector<int> order;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        order.push_back(u);
        for (int v : g[u]) {
            indeg[v]--;           // 前置任务完成一个
            if (indeg[v] == 0) q.push(v);
        }
    }

    if ((int)order.size() != n) cout << "cycle\\n";  // 有环，无解
    else for (int x : order) cout << x << " ";  // 按拓扑顺序输出，可行的执行顺序
    cout << "\\n";
    return 0;
}`,
        time: 'O(n + m)',
        space: 'O(n + m)',
        takeaway: '拓扑排序的出口检查「处理点数是否等于 n」，能顺手发现环。',
      },
    ],
    homework: ['把 Dijkstra 改成输出路径，需要记录哪个数组？', '思考：为什么有负权边时 Dijkstra 会出错？举一个具体例子。'],
  },
  {
    id: 'tree',
    stage: 'contest',
    order: 23,
    title: '二叉树与遍历',
    subtitle: '递归结构的最佳练习场',
    minutes: 40,
    keywords: ['二叉树', '前序', '中序', '后序', '层序', '高度'],
    summary: '理解二叉树的三序遍历与层序遍历，能用递归求高度、统计叶子。',
    sections: {
      concept: [
        '二叉树每个节点最多两个孩子：左孩子和右孩子。它天然是递归结构——一棵树由根、左子树、右子树组成，所以几乎所有操作都能写成「处理根 + 递归左 + 递归右」。',
        '前序遍历顺序是根、左、右；中序是左、根、右；后序是左、右、根。三者的递归框架完全一样，只是打印语句的位置不同。',
        '层序遍历用队列逐层处理，和 BFS 一模一样：根入队，出队时把左右孩子入队。它解决的是「按距离分层」的问题。',
        '已知中序加前序（或后序）可以唯一确定一棵二叉树；只给前序和后序则不能。这是复原树类题目的核心结论。',
      ],
      analogy: '树像家谱：每个节点是个人，两个孩子是他的子女。前序是先介绍自己再介绍子女，后序是先介绍完子女再介绍自己，层序是按辈分一排一排介绍。',
      syntax: [
        '顺序存储：完全二叉树可以用数组存，i 的左孩子是 2i，右孩子是 2i+1。',
        '链式存储：struct Node { int val; Node *l, *r; };',
        '前序：void pre(Node *p) { if (!p) return; visit(p); pre(p->l); pre(p->r); }',
        '层序：queue<Node*> q; 出队时入队左右孩子，注意判空。',
        '高度：int h(Node *p) { if (!p) return 0; return 1 + max(h(p->l), h(p->r)); }',
      ],
      pitfalls: [
        { wrong: '递归遍历忘记判空', right: '第一行 if (!p) return;', reason: '空指针解引用，程序直接崩溃。' },
        { wrong: '层序遍历时不判孩子是否为空就入队', right: 'if (p->l) q.push(p->l);', reason: '队列里塞进空指针，出队时访问就崩。' },
        { wrong: '用数组存非完全二叉树还按 2i 规则算下标', right: '改用链式结构或补成完全二叉树', reason: '下标公式只对完全二叉树成立。' },
      ],
      keyPoints: [
        '三序遍历的差别只在访问根的时机，框架完全一致。',
        '递归函数先写终止条件（空节点返回），再写当前层逻辑。',
        '层序遍历就是 BFS，队列里只放非空节点。',
      ],
    },
    template: {
      title: '二叉树三序遍历与高度',
      explain: '链式存储的二叉树，演示三种遍历与求高度。',
      code: `#include <iostream>
#include <algorithm>
using namespace std;

struct Node {                     // 链式存储：一个值加两个孩子指针
    int val;
    Node *l;                      // 左孩子，空指针表示没有
    Node *r;
    Node(int v) : val(v), l(nullptr), r(nullptr) {}  // 构造时初始化孩子为空
};

void pre(Node *p) {               // 根、左、右
    if (!p) return;               // 空节点直接返回，这是递归的出口
    cout << p->val << " ";
    pre(p->l);
    pre(p->r);
}

void in(Node *p) {                // 左、根、右
    if (!p) return;
    in(p->l);
    cout << p->val << " ";
    in(p->r);
}

void post(Node *p) {              // 左、右、根
    if (!p) return;
    post(p->l);
    post(p->r);
    cout << p->val << " ";
}

int height(Node *p) {             // 空树高度为 0
    if (!p) return 0;
    return 1 + max(height(p->l), height(p->r));  // 自己算一层，再加上较高的那棵子树
}

int main() {
    Node *root = new Node(1);     // 手工搭一棵 5 个节点的样例树
    root->l = new Node(2);
    root->r = new Node(3);
    root->l->l = new Node(4);
    root->l->r = new Node(5);

    pre(root); cout << "\\n";
    in(root); cout << "\\n";
    post(root); cout << "\\n";
    cout << height(root) << "\\n";
    return 0;
}`,
    },
    examples: [
      {
        id: 'tree-1',
        title: '完全二叉树的前序',
        difficulty: '入门',
        problem: '用数组存一棵完全二叉树，值依次为 1 到 n，输出它的前序遍历。',
        sample: '输入：7　　输出：1 2 4 5 3 6 7',
        ideas: ['数组下标从 1 开始，左孩子 2i，右孩子 2i+1。', '递归时先输出自己，再递归左、右。', '下标超过 n 就返回。'],
        code: `#include <iostream>
using namespace std;

int n;

void pre(int i) {                 // i 是数组下标，根固定为 1
    if (i > n) return;            // 越界即空节点
    cout << i << " ";             // 先访问自己
    pre(2 * i);                   // 再左子树
    pre(2 * i + 1);               // 最后右子树
}

int main() {
    cin >> n;
    pre(1);
    cout << "\\n";
    return 0;
}`,
        time: 'O(n)',
        space: 'O(log n)',
        takeaway: '完全二叉树的下标公式让「指针」变成「算术」。',
      },
      {
        id: 'tree-2',
        title: '求树的高度',
        difficulty: '进阶',
        problem: '输入 n 个节点以及每个节点的左右孩子编号（0 表示空），求树的高度。',
        sample: '1->(2,3)，2->(4,0)，3->(5,0)，输出 3',
        ideas: ['高度 = 1 + 左右子树高度较大者。', '空节点高度为 0。', '用递归，天然自底向上。'],
        code: `#include <iostream>
#include <algorithm>
using namespace std;

int lc[1005], rc[1005];           // lc / rc 存左右孩子的编号，0 表示空

int height(int u) {
    if (u == 0) return 0;         // 空节点
    return 1 + max(height(lc[u]), height(rc[u]));
}

int main() {
    int n;
    cin >> n;
    for (int i = 1; i <= n; i++) cin >> lc[i] >> rc[i];  // 读入每个节点的两个孩子
    cout << height(1) << "\\n";   // 根节点编号是 1，从根开始算高度
    return 0;
}`,
        time: 'O(n)',
        space: 'O(n)',
        takeaway: '递归的返回值就是「这棵子树的高度」，不需要全局变量。',
      },
      {
        id: 'tree-3',
        title: '层序遍历',
        difficulty: '进阶',
        problem: '给出一棵二叉树，按层从左到右输出每个节点的值。',
        sample: '输入同上一题，输出 1 2 3 4 5',
        ideas: ['用队列，根先入队。', '出队时输出，并把非空孩子入队。', '队列空时结束。'],
        code: `#include <iostream>
#include <queue>
using namespace std;

int lc[1005], rc[1005];

int main() {
    int n;
    cin >> n;
    for (int i = 1; i <= n; i++) cin >> lc[i] >> rc[i];

    queue<int> q;                 // 队列负责按层推进
    q.push(1);                    // 根先入队
    while (!q.empty()) {
        int u = q.front(); q.pop();
        cout << u << " ";
        if (lc[u]) q.push(lc[u]);  // 只入队非空孩子
        if (rc[u]) q.push(rc[u]);  // 右孩子非空才入队
    }
    cout << "\\n";
    return 0;
}`,
        time: 'O(n)',
        space: 'O(n)',
        takeaway: '层序 = 树的 BFS，队列是唯一的必需品。',
      },
    ],
    homework: ['已知前序 ABDCE 与中序 DBACE，手画出这棵树并写出后序。', '改造层序遍历，按「每一层一行」的格式输出。'],
  },
  {
    id: 'number-theory',
    stage: 'contest',
    order: 24,
    title: '数论基础',
    subtitle: '整除、素数、取模与快速幂',
    minutes: 40,
    keywords: ['gcd', 'lcm', '素数筛', '快速幂', '取模'],
    summary: '掌握 gcd 与 lcm 的关系、埃氏筛的写法、快速幂的倍增思想，理解取模运算的边界。',
    sections: {
      concept: [
        'gcd(a, b) 是最大公约数，辗转相除的写法是 gcd(a, b) = gcd(b, a % b)，直到 b 为 0。它非常快，是 O(log min(a,b))。',
        'lcm(a, b) = a / gcd(a, b) * b。必须先除后乘，否则 a * b 可能先溢出。',
        '素数筛：从 2 开始，把每个素数的倍数全部标记为合数，剩下的就是素数。复杂度 O(n log log n)，n = 10^6 级别完全够用。',
        '快速幂把 a^b 拆成二进制位，每轮把底数平方、指数减半，复杂度从 O(b) 降到 O(log b)。求模时每一步都取模，避免溢出。',
      ],
      analogy: '快速幂像把乘法折叠：算 a^16 不用乘 15 次，只要把 a 平方四次（a→a²→a⁴→a⁸→a¹⁶）。指数是二进制，遇到 1 就把当前的底数乘进答案。',
      syntax: [
        'gcd：int gcd(int a, int b) { return b == 0 ? a : gcd(b, a % b); }',
        'lcm：a / gcd(a, b) * b，先除后乘。',
        '埃氏筛：for (i=2; i*i<=n; i++) if (!comp[i]) for (j=i*i; j<=n; j+=i) comp[j]=true;',
        '快速幂：while (b) { if (b & 1) ans = ans * a % mod; a = a * a % mod; b >>= 1; }',
        '模运算性质：(a + b) % m = ((a % m) + (b % m)) % m，乘法同理。',
      ],
      pitfalls: [
        { wrong: 'lcm 写成 a * b / gcd(a, b)', right: 'a / gcd(a, b) * b', reason: 'a * b 先算，10^9 级别直接溢出。' },
        { wrong: '筛法内层从 i + i 开始', right: '从 i * i 开始', reason: '更小的倍数已经被更小的素数筛掉了，从 i*i 开始更快。' },
        { wrong: '快速幂里 a = a * a 忘记取模', right: 'a = a * a % mod', reason: 'long long 也会溢出，结果直接错乱。' },
        { wrong: 'i * i <= n 用 int 且 n 接近 2×10^9', right: '用 long long 或改写成 i <= n / i', reason: 'i*i 溢出成负数，循环条件失效。' },
      ],
      keyPoints: [
        'gcd 与 lcm 的关系式要背：lcm × gcd = a × b。',
        '筛法的复杂度优势来自「从 i*i 开始」，记住这一点。',
        '凡是取模题，乘法和加法每一步都要取模。',
      ],
    },
    template: {
      title: 'gcd、筛法与快速幂',
      explain: '三个数论常用工具放在一个模板里，覆盖考级与竞赛的高频需求。',
      code: `#include <iostream>
using namespace std;

long long gcd(long long a, long long b) {  // 辗转相除
    return b == 0 ? a : gcd(b, a % b);
}

const int MAXN = 1000005;         // 筛到 10^6 能覆盖绝大多数题的数据范围
bool comp[MAXN];                  // true 表示合数

void sieve(int n) {               // 埃氏筛
    comp[0] = comp[1] = true;     // 0 和 1 不是素数，先标记掉
    for (int i = 2; 1LL * i * i <= n; i++) {
        if (comp[i]) continue;    // 合数不用再当筛子
        for (long long j = 1LL * i * i; j <= n; j += i) comp[j] = true;  // 从 i*i 开始
    }
}

long long fastPow(long long a, long long b, long long mod) {
    long long ans = 1 % mod;      // mod 为 1 时答案也必须是 0
    while (b > 0) {
        if (b & 1) ans = ans * a % mod;  // 这一位是 1，乘进答案
        a = a * a % mod;          // 底数平方
        b >>= 1;                  // 指数减半
    }
    return ans;
}

int main() {
    int n = 30;
    sieve(n);                     // 先预处理出 1 到 n 的素数表
    int cnt = 0;                  // 统计剩下没被标记的素数
    for (int i = 2; i <= n; i++) if (!comp[i]) cnt++;
    cout << cnt << "\\n";         // 30 以内有 10 个素数

    cout << gcd(12, 18) << " " << 12 / gcd(12, 18) * 18 << "\\n";  // 6 36
    cout << fastPow(2, 10, 1000) << "\\n";  // 1024 % 1000 = 24
    return 0;
}`,
    },
    examples: [
      {
        id: 'nt-1',
        title: '统计素数个数',
        difficulty: '进阶',
        problem: '输入 n（n ≤ 10^6），输出 n 以内素数的个数。',
        sample: '输入：30　　输出：10',
        ideas: ['用埃氏筛预处理。', '内层从 i*i 开始标记。', '最后统计未被标记的数。'],
        code: `#include <iostream>
using namespace std;

const int MAXN = 1000005;
bool comp[MAXN];                  // true 表示合数，false 就是素数

int main() {
    int n;
    cin >> n;
    comp[0] = comp[1] = true;     // 0 与 1 单独处理
    for (int i = 2; 1LL * i * i <= n; i++) {
        if (comp[i]) continue;
        for (long long j = 1LL * i * i; j <= n; j += i) comp[j] = true;
    }
    int cnt = 0;                  // 素数计数器
    for (int i = 2; i <= n; i++) if (!comp[i]) cnt++;
    cout << cnt << "\\n";         // 输出 n 以内的素数个数
    return 0;
}`,
        time: 'O(n log log n)',
        space: 'O(n)',
        takeaway: '筛法把「每个数都试除」变成「每个合数只被标记一次」。',
      },
      {
        id: 'nt-2',
        title: '快速幂取模',
        difficulty: '挑战',
        problem: '输入 a、b、m，求 a^b mod m（a, b ≤ 10^18）。',
        sample: '输入：2 10 1000　　输出：24',
        ideas: ['指数按二进制位拆。', '每轮底数平方、指数右移。', '指数为 1 的位就把当前底数乘进答案。'],
        code: `#include <iostream>
using namespace std;

long long fastPow(long long a, long long b, long long mod) {
    long long ans = 1 % mod;      // mod 为 1 时答案必须是 0
    while (b > 0) {
        if (b & 1) ans = ans * a % mod;  // 指数当前位是 1，就把当前底数乘进答案
        a = a * a % mod;
        b >>= 1;
    }
    return ans;
}

int main() {
    long long a, b, m;            // 底数、指数、模数都可能很大
    cin >> a >> b >> m;
    cout << fastPow(a, b, m) << "\\n";  // 直接调用快速幂
    return 0;
}`,
        time: 'O(log b)',
        space: 'O(1)',
        takeaway: '「平方底数、右移指数」是倍增思想的原型。',
      },
      {
        id: 'nt-3',
        title: '最大公约数与最小公倍数',
        difficulty: '进阶',
        problem: '输入两个正整数，输出它们的最大公约数与最小公倍数。',
        sample: '输入：12 18　　输出：6 36',
        ideas: ['递归求 gcd。', 'lcm 用 a / gcd * b，先除后乘防溢出。', '两个结果都用 long long。'],
        code: `#include <iostream>
using namespace std;

long long gcd(long long a, long long b) {  // 辗转相除：b 为 0 时 a 就是答案
    return b == 0 ? a : gcd(b, a % b);
}

int main() {
    long long a, b;
    cin >> a >> b;
    long long g = gcd(a, b);      // 先算出 gcd，算 lcm 还要用它
    cout << g << " " << a / g * b << "\\n";  // 最简结构：gcd 与先除后乘的 lcm
    return 0;
}`,
        time: 'O(log min(a,b))',
        space: 'O(1)',
        takeaway: 'lcm 的公式要会「变形」，否则大数一定溢出。',
      },
    ],
    homework: ['用筛法求出 10^6 以内的素数个数，看看和 78498 差多少。', '思考：快速幂里的 if (b & 1) 为什么不能写成 if (b % 2 == 1)？其实可以，区别在哪？'],
  },
];
