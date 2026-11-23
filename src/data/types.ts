// EXPORTS: StageId, IPitfall{wrong,right,reason}, ITopicExample{id,title,difficulty,problem,ideas,code,time,space,takeaway}, ITopic{...}, IQuestion{...}

export type StageId = 'basic' | 'cert' | 'contest';

export interface IPitfall {
  /** 常见错误写法 */
  wrong: string;
  /** 正确写法 */
  right: string;
  /** 为什么错 */
  reason: string;
}

export interface ITopicExample {
  id: string;
  title: string;
  difficulty: '入门' | '进阶' | '挑战';
  /** 题目描述 */
  problem: string;
  /** 输入输出样例说明 */
  sample: string;
  /** 解题思路，按步骤写 */
  ideas: string[];
  code: string;
  time: string;
  space: string;
  /** 这题真正要记住的一句话 */
  takeaway: string;
}

export interface ITopic {
  id: string;
  stage: StageId;
  /** 全课程连续序号，从 1 开始 */
  order: number;
  title: string;
  subtitle: string;
  /** 预计精读时长（分钟） */
  minutes: number;
  keywords: string[];
  /** 一句话定位，用在列表与卡片 */
  summary: string;
  /** 该章节覆盖的 GESP 级别（1–8），可覆盖多级 */
  gesp?: number[];
  sections: {
    concept: string[];
    analogy: string;
    syntax: string[];
    pitfalls: IPitfall[];
    keyPoints: string[];
  };
  template: {
    title: string;
    /** 逐行注释的模板代码 */
    code: string;
    explain: string;
  };
  examples: ITopicExample[];
  homework: string[];
}

export interface IQuestion {
  id: string;
  topicId: string;
  type: 'choice' | 'fill';
  prompt: string;
  /** choice 题给出选项 */
  options?: string[];
  /** choice 题的正确答案下标 */
  answerIndex?: number;
  /** fill 题的可接受答案（判题时忽略空格与大小写） */
  answers?: string[];
  explanation: string;
  difficulty: 1 | 2 | 3;
}
