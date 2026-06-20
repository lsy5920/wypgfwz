export interface Question {
  id: number;
  question: string;
  options: string[];
  answer: number; // 正确答案的下标
}

export const questions: Question[] = [
  {
    id: 1,
    question: "问云派的八字派训是什么？",
    options: ["清醒温柔，同行自渡", "以云为幕，以灯为证", "问心问路，守善守界", "真诚互助，守正共建"],
    answer: 0,
  },
  {
    id: 2,
    question: "问云派四象（精神象征）包含哪四个？",
    options: ["云、山、水、风", "云、灯、舟、竹", "灯、竹、鹤、梅", "舟、水、月、风"],
    answer: 1,
  },
  {
    id: 3,
    question: "问云三不立中，“三不”具体指？",
    options: ["不造谣、不伤人、不越界", "不倾听、不审判、不命令", "不立神坛、不售焦虑、不替专业", "不传播、不骚扰、不欺骗"],
    answer: 2,
  },
  {
    id: 4,
    question: "入派道名须以哪个字开头？",
    options: ["问", "云", "灯", "道"],
    answer: 1,
  },
  {
    id: 5,
    question: "问云七愿中，第一愿是？",
    options: ["一愿温和", "一愿互助", "一愿守界", "一愿真诚"],
    answer: 3,
  },
  {
    id: 6,
    question: "问云言谈之法“四可四不可”中，“可倾听”对应的是？",
    options: ["不命令", "不拯救", "不审判", "不冷暴"],
    answer: 2,
  },
  {
    id: 7,
    question: "群中十禁，第一禁是？",
    options: ["一禁谣言与未经核实之内幕", "一禁广告刷屏", "一禁侮辱、诽谤、威胁", "一禁违法违规内容"],
    answer: 3,
  },
  {
    id: 8,
    question: "问云派以“云”字命名，“云”的象征含义是？",
    options: ["陪伴与希望", "渡己渡人", "自由与包容", "有节有度有韧性"],
    answer: 2,
  },
  {
    id: 9,
    question: "入云礼词“我入问云”最后一句是？",
    options: ["愿守清醒温柔，愿护一方云灯", "不造谣，不伤人，不越界", "于云深处，同行自渡", "问心即归途"],
    answer: 2,
  },
  {
    id: 10,
    question: "问云七愿中，“七愿向光”说的是？",
    options: ["不鼓励沉沦、怨毒、伤己伤人", "每人皆为此间风气之守护者", "安慰不等于纵容，陪伴不等于沉溺", "不窥私、不逼问、不越界亲近"],
    answer: 0,
  },
];

export const PASS_SCORE = 80;
export const TOTAL_QUESTIONS = questions.length;
