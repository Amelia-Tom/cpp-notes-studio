// EXPORTS: GESP1_TOPICS（计算机基础与开发环境、类型转换与数学函数）

import type { ITopic } from '../types';

/** GESP 一级：计算机基础、IDE 与第一个程序 */
const env: ITopic = {
  id: 'env',
  stage: 'basic',
  order: 1,
  title: '计算机、编译器与第一个程序',
  subtitle: '先弄清代码从哪来、到哪去',
  minutes: 25,
  keywords: ['计算机组成', '编译过程', 'Dev-C++', 'main 函数', '注释', '调试'],
  summary: '计算机五大部件、程序从源码到可执行的四个阶段，以及第一个 C++ 程序的骨架写法。',
  sections: {
    concept: [
      '计算机由五个部分配合工作：输入设备（键盘、鼠标、摄像头）负责把信息送进来，输出设备（显示器、打印机）负责把结果送出去，运算器与控制器合起来就是 CPU，存储器分为内存（RAM）和外存（硬盘、U 盘）。CPU 自己不存数据，它只做运算，所有要算的数都要先搬进内存。',
      '现代计算机遵循冯·诺依曼提出的「存储程序」思想：把解决问题的步骤写成一条条指令，和数据一起放进存储器，CPU 按地址顺序取出执行。这就是为什么程序可以「写一次、反复运行」——程序本身也是数据。',
      '内存与外存的关键区别在「断电之后还在不在」：内存是易失的，程序运行结束或断电就清空；硬盘是非易失的，文件会留下来。所以变量存在内存里，而 .cpp 文件和编译出的 .exe 存在硬盘上。',
      'C++ 是编译型语言。你写的 .cpp 是给人看的源码，计算机只认机器指令，中间要经过四步：预处理（展开 #include、替换 #define）→ 编译（把源码翻成汇编）→ 汇编（汇编翻成机器指令，得到 .o 目标文件）→ 链接（把目标文件和库拼成一个可执行文件）。任何一步出错，都拿不到能运行的程序。',
      '程序出错分三类，报错位置和解决方式完全不同：编译错误（语法写错，编译器直接指出行号，程序根本生成不出来）、链接错误（函数只有声明没有定义，常见于少写了函数体）、运行时错误（能编译能运行，但中途崩溃或答案不对，比如除零、数组越界、死循环）。学会看「第一行报错」是入门最重要的技能之一。',
      '集成开发环境（IDE）把编辑、编译、运行、调试打包在一起。Dev-C++ 里 F9 编译运行、F5 调试；调试的核心动作是打断点（让程序停在某一行）、单步执行（一行一行走）、观察变量窗口（看每个变量的真实值）。调试不是「猜」，而是让程序自己把中间状态交代出来。',
    ],
    analogy:
      '做饭的比喻：食材是数据，菜谱是程序，灶台是 CPU，冰箱是硬盘，案板是内存。菜谱放在冰箱里可以一直保存，但要真正做菜，必须先拿出食材放到案板上——也就是把数据从硬盘读进内存。',
    keyPoints: [
      'CPU 只做运算，不存数据；数据必须先进入内存才能参与运算。',
      '存储程序思想：程序与数据同处存储器，CPU 按地址取指令执行。',
      'C++ 是编译型语言，源码到可执行要经过预处理、编译、汇编、链接四步。',
      '三类错误要分清：编译错误看行号，链接错误看函数定义，运行时错误靠调试。',
      'main 是程序入口，返回值 0 表示正常结束，操作系统靠它判断程序是否成功。',
    ],
    syntax: [
      '#include <iostream> —— 把头文件包含进来，才有 cin、cout 的定义；漏掉它编译器会说 cin 未声明。',
      'using namespace std; —— 把标准库的名字空间展开，之后可以写 cout 而不是 std::cout。',
      'int main() { ... return 0; } —— 程序唯一入口，括号里为空表示不接收命令行参数。',
      '语句以分号结尾；花括号 { } 划定作用范围，缩进只是给人看的，不影响运行。',
      '// 单行注释与 /* 多行注释 */ 都只是给人看的，编译时会被整段删掉，不占运行时间。',
      'cin >> a >> b; 从标准输入读数，cout << a << " " << b << endl; 输出，endl 换行并刷新缓冲区。',
      '命令行编译：g++ main.cpp -o main -std=c++17 -Wall，-Wall 打开常用警告，-o 指定输出文件名。',
    ],
    pitfalls: [
      {
        wrong: 'int mian() { ... }',
        right: 'int main() { ... }',
        reason: '把 main 拼成 mian，编译器找不到入口函数，链接阶段直接失败，报 undefined reference to `main`。',
      },
      {
        wrong: 'cout << a',
        right: 'cout << a;',
        reason: '语句末尾漏分号，编译错误常报在下一行，容易看错位置——报错行往往不是出错行。',
      },
      {
        wrong: '用中文标点：cout << a；',
        right: '全部使用英文标点',
        reason: '中文分号、中文引号对编译器是非法字符，报 stray character，肉眼极难发现，建议关掉中文输入法再写代码。',
      },
    ],
  },
  template: {
      title: 'hello.cpp',
      explain: '把「输入、处理、输出」三段写清楚：先读入姓名和年龄，再算出出生年份，最后按格式输出。',
      code: `#include <iostream>          // 引入输入输出流，cin、cout 才有定义
#include <string>            // 引入 string 类型，用来存姓名
using namespace std;         // 省略 std:: 前缀

int main() {                 // 程序入口，一切从这里开始
    string name;             // 姓名用 string，能存一串字符
    int age;                 // 年龄用 int，整数足够
    cin >> name >> age;      // 一次读入两个值，中间用空格或换行隔开

    int birth = 2026 - age;  // 处理：由年龄反推出生年份
    cout << "你好，" << name << "！" << endl;   // 输出第一段
    cout << "你大约出生于 " << birth << " 年。" << endl;  // 输出第二段
    return 0;                // 返回 0 表示程序正常结束
}`,
  },
  examples: [
      {
        id: 'env-1',
        title: '两数之和',
        difficulty: '入门',
        problem: '读入两个整数 a、b，输出它们的和。',
        sample: '输入：3 5\n输出：8',
        ideas: [
          '按「输入—处理—输出」三段式搭骨架。',
          '用 int 声明两个变量，cin 读入。',
          '直接输出 a + b，注意不要把表达式写进引号里。',
        ],
        code: `#include <iostream>
using namespace std;

int main() {
    int a, b;              // 两个加数
    cin >> a >> b;         // 读入
    cout << a + b << endl; // 输出和
    return 0;
}`,
        time: 'O(1)',
        space: 'O(1)',
        takeaway: '输入—处理—输出是每道题都复用的骨架，先把骨架写对，再想算法。',
      },
      {
        id: 'env-2',
        title: '交换两个变量',
        difficulty: '入门',
        problem: '读入 a、b，交换它们的值后输出。',
        sample: '输入：1 2\n输出：2 1',
        ideas: [
          '直接 a = b; b = a; 会丢掉 a 的原值。',
          '借助临时变量 t 保存 a，再依次赋值。',
          '输出时用空格分隔，注意输出顺序。',
        ],
        code: `#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    int t = a;   // 先用临时变量把 a 存起来
    a = b;       // 再把 b 的值写进 a
    b = t;       // 最后把原来的 a 写进 b
    cout << a << " " << b << endl;
    return 0;
}`,
        time: 'O(1)',
        space: 'O(1)',
        takeaway: '交换两个变量必须借助第三个变量，直接赋值会覆盖掉还没用的旧值。',
      },
      {
        id: 'env-3',
        title: '输出固定图案',
        difficulty: '入门',
        problem: '输出一个由星号组成的直角三角形，共 4 行，第 i 行有 i 个星号。',
        sample: '输出：\n*\n**\n***\n****',
        ideas: [
          '外层循环控制行号 i（1 到 4），内层循环控制每行星号个数。',
          '内层输出完星号后要换行，否则所有星号会挤在一行。',
          '这题练的是 cout 与循环的配合，不需要算法。',
        ],
        code: `#include <iostream>
using namespace std;

int main() {
    for (int i = 1; i <= 4; i++) {        // i 表示第几行
        for (int j = 1; j <= i; j++) {    // 第 i 行打 i 个星号
            cout << "*";
        }
        cout << endl;                     // 每行结束换行
    }
    return 0;
}`,
        time: 'O(n²)',
        space: 'O(1)',
        takeaway: '图形题的标准结构：外层管行，内层管列，每行结束补一个换行。',
      },
    ],
    homework: [
      '在自己电脑上完成一次「写代码 → 编译 → 运行」全流程，并故意删掉一个分号，观察编译器的报错行号与实际出错行是否一致。',
      '把 hello.cpp 改成读入三个整数，输出它们的和与平均值（平均值保留两位小数）。',
      '用调试器在 `int birth = 2026 - age;` 这行打断点，单步执行并观察 name、age、birth 三个变量的值如何变化。',
      '查一查自己电脑的内存容量与硬盘容量，写成「内存 X GB、硬盘 Y GB」，并解释为什么程序运行时数据要先进内存。',
    ],
  gesp: [1],
};

/** GESP 二级：类型转换、ASCII 与数学函数 */
const cast: ITopic = {
  id: 'cast',
  stage: 'basic',
  order: 5,
  title: '类型转换、ASCII 与数学函数',
  subtitle: '数字和字符之间那道看不见的桥',
  minutes: 30,
  keywords: ['隐式转换', '强制转换', '截断', 'ASCII', 'cmath', '浮点误差', 'eps'],
  summary: '隐式与显式类型转换的规则、ASCII 编码、常用数学函数，以及浮点数比较的正确姿势。',
  sections: {
    concept: [
      'C++ 在做混合运算时会自动把「窄」的类型往「宽」的方向提升，这叫隐式转换。提升顺序大致是 bool → char → int → long long → float → double：两个 int 相加还是 int，一旦有一个 double，整个表达式就变成 double。所以 a / b 在两个 int 之间是整除，而 a * 1.0 / b 就会算出小数。',
      '反向转换（宽变窄）必须显式写出来，两种写法等价：C 风格 (int)x 与 C++ 风格 static_cast<int>(x)。规则是「截断」而不是四舍五入：3.9 变成 3，-3.9 变成 -3，因为 C++ 规定浮点转整数向零取整。想四舍五入要自己加 0.5 或用 round()。',
      '浮点数天生不精确。0.1 在二进制里是无限循环小数，只能存近似值，于是 0.1 + 0.2 得到 0.30000000000000004，直接用 == 比较会得到 false。正确做法是比较差值：fabs(a - b) < 1e-8。比赛里输出常要求保留 2 位小数，用 printf("%.2f", x) 或 fixed << setprecision(2) 控制。',
      '字符在计算机里就是整数。ASCII 表里三组关键值必须背下来：\'0\' 是 48，\'A\' 是 65，\'a\' 是 97。因此 \'A\' + 1 得到 66（也就是 \'B\'），\'9\' - \'0\' 得到数字 9。把字符串里的字符数字转成整数用 c - \'0\'，反过来用 char(\'0\' + d)。',
      '常用的数学函数都在 <cmath> 里：abs 取绝对值（浮点用 fabs）、sqrt 开平方、pow 求幂、floor 向下取整、ceil 向上取整、round 四舍五入、max/min 求最值（浮点用 fmax/fmin）。注意 pow 返回 double，整数幂如果自己写循环乘还能顺便取模，比赛里更常用。',
      '类型转换的边界要记牢：int 上限约 2.1×10⁹，long long 上限约 9.2×10¹⁸，double 只能保证约 15–16 位有效数字。把大整数塞进 int 会溢出成负数（补码回绕），把 10¹⁸ 以上的整数塞进 double 会丢精度。估算数据范围、提前改用 long long，是最省事的防错手段。',
    ],
    analogy:
      '像把大杯的水倒进小杯：大杯（double）能装的精度多，倒进小杯（int）时多出来的部分会直接洒掉，而不是四舍五入地「收一收」——泼出去的水不会回来，丢掉的位数也不会补回来。',
    keyPoints: [
      '隐式转换只往宽的方向提升，窄变宽自动、宽变窄要显式转换。',
      '浮点转整数是向零截断，不是四舍五入。',
      '浮点数不能用 == 比较，要用 fabs 差值小于 1e-8。',
      "ASCII 三组数字：'0'=48、'A'=65、'a'=97；字符与整数可互转。",
      '数据范围先估算，超 2.1×10⁹ 就换 long long。',
    ],
    syntax: [
      '(int)3.9 → 3；(int)-3.9 → -3；想得到 4 要写 (int)(3.9 + 0.5) 或 round(3.9)。',
      'static_cast<double>(a) / b —— 显式把 a 转成 double，整除法立刻变成浮点除法。',
      "'A' + 1 得到 66；char(65) 得到 'A'；c - '0' 把字符数字转成整数。",
      '#include <cmath> 后用 abs(-5)、fabs(-5.5)、sqrt(16.0)、pow(2, 10)、floor(-1.2)、ceil(-1.2)。',
      'printf("%.2f", x) 保留两位小数输出；cout << fixed << setprecision(2) << x 效果相同。',
      '判断浮点相等：if (fabs(a - b) < 1e-8) { ... }，1e-8 表示 10⁻⁸。',
      'cout << (int)\'a\' 可以查看字符对应的 ASCII 码，调试编码问题很好用。',
    ],
    pitfalls: [
      {
        wrong: 'double d = 2.5; int x = d;  // 以为会得到 3',
        right: 'int x = (int)round(d);   // 想四舍五入要写 round',
        reason: '浮点转整数一律向零截断，2.5 直接变成 2，少了的 0.5 不会被补偿回来。',
      },
      {
        wrong: 'if (0.1 + 0.2 == 0.3) 判断相等',
        right: 'if (fabs(0.1 + 0.2 - 0.3) < 1e-8)',
        reason: '0.1、0.2、0.3 在二进制里都是无限循环小数，相加后与 0.3 的存储值差一个极小量，直接用 == 永远为假。',
      },
      {
        wrong: "int d = s[i];  // s[i] 是 '7'",
        right: "int d = s[i] - '0';",
        reason: "把字符直接赋给 int 得到的是 ASCII 码 55 而不是 7，字符转数字必须减去 '0' 的码值 48。",
      },
    ],
  },
  template: {
      title: 'convert.cpp',
      explain: '一次演示四件事：整除法与浮点除法的差别、截断、ASCII 互转、保留两位小数输出。',
      code: `#include <iostream>              // 输入输出
#include <cmath>                 // sqrt、fabs、round 都在这里
#include <iomanip>               // setprecision 需要它
using namespace std;             // 省略 std:: 前缀

int main() {
    int a = 7, b = 2;             // 两个整数
    cout << a / b << endl;        // 7/2 是整除，得到 3 而不是 3.5
    cout << static_cast<double>(a) / b << endl;  // 转成 double 后再除，得到 3.5

    double x = -3.9;              // 负数也要看清方向
    int t1 = (int)x;             // 向零截断：得到 -3
    int t2 = (int)round(x);      // 四舍五入：得到 -4
    cout << t1 << " " << t2 << endl;

    char c = 'A';                 // 'A' 的 ASCII 码是 65
    cout << (int)c << endl;       // 输出 65
    cout << char(c + 2) << endl;  // 65 + 2 = 67，对应字符 'C'

    cout << fixed << setprecision(2) << sqrt(2.0) << endl;  // 1.41，保留两位
    return 0;
}`,
  },
  examples: [
      {
        id: 'cast-1',
        title: '摄氏度转华氏度',
        difficulty: '入门',
        problem: '读入一个摄氏温度 C（可能带小数），输出对应华氏温度，保留两位小数。公式：F = C × 9 / 5 + 32。',
        sample: '输入：36.5\n输出：97.70',
        ideas: [
          '输入用 double，否则小数部分一进来就被截断。',
          '公式里的 9 / 5 如果写成整数除法会得到 1，必须让其中一个数是浮点：9.0 / 5。',
          '输出用 fixed + setprecision(2) 固定两位小数。',
        ],
        code: `#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    double c;                       // 摄氏温度，必须用 double
    cin >> c;
    double f = c * 9.0 / 5 + 32;    // 9.0 / 5 才是 1.8，写成 9 / 5 会变成 1
    cout << fixed << setprecision(2) << f << endl;  // 固定两位小数
    return 0;
}`,
        time: 'O(1)',
        space: 'O(1)',
        takeaway: '只要公式里出现除法，先确认分子分母是不是浮点，否则精度在第一步就丢了。',
      },
      {
        id: 'cast-2',
        title: '字符数字转整数并求和',
        difficulty: '入门',
        problem: '读入一个由数字字符组成的字符串（长度不超过 100），把它转成整数后各位数字求和并输出。',
        sample: '输入：2024\n输出：8',
        ideas: [
          '逐位扫描字符串，用 c - \'0\' 把每个字符变成 0–9 的数字。',
          '累加每一位数字，不需要真的转成完整整数。',
          '用 string 存输入，避免整数范围问题。',
        ],
        code: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string s;
    cin >> s;                       // 按字符串读入，长度不受 int 限制
    int sum = 0;
    for (int i = 0; i < (int)s.size(); i++) {
        sum += s[i] - '0';          // 字符 '7' 减 '0' 得到数字 7
    }
    cout << sum << endl;
    return 0;
}`,
        time: 'O(n)',
        space: 'O(1)',
        takeaway: "字符与数字的桥是 '0'，所有「按位处理」的题都靠它。",
      },
      {
        id: 'cast-3',
        title: '四舍五入与向下取整',
        difficulty: '进阶',
        problem: '读入一个实数 x，分别输出它的向下取整、向上取整与四舍五入结果（以整数形式）。',
        sample: '输入：-2.5\n输出：-3 -2 -3',
        ideas: [
          'floor、ceil 返回 double，输出前要转成整数，否则会带 .00。',
          'round 对 .5 的处理是「向远离零的方向」，-2.5 得到 -3。',
          '三个结果用空格分隔，注意负数的符号。',
        ],
        code: `#include <iostream>
#include <cmath>
using namespace std;

int main() {
    double x;
    cin >> x;
    cout << (int)floor(x) << " ";   // 向下取整：-2.5 → -3
    cout << (int)ceil(x) << " ";    // 向上取整：-2.5 → -2
    cout << (int)round(x) << endl;  // 四舍五入：-2.5 → -3
    return 0;
}`,
        time: 'O(1)',
        space: 'O(1)',
        takeaway: 'floor/ceil/round 都返回浮点，输出整数值时记得显式转换，避免输出成 -3.00。',
      },
    ],
    homework: [
      '写出下面三个表达式的结果并上机验证：(int)(-2.7)、round(-2.7)、(int)(2.7 + 0.5)。',
      '读入一个字符，输出它是大写字母、小写字母、数字还是其他符号（提示：比较 ASCII 码区间）。',
      '读入两个整数 a、b，输出 a / b 的整除结果与精确到 3 位小数的结果。',
      "解释为什么 0.1 + 0.2 != 0.3，并用 fabs 差值法写一段能正确判断「两数相等」的代码。",
    ],
  gesp: [2],
};

export const GESP1_TOPICS: ITopic[] = [env, cast];
