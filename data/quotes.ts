// data/quotes.ts

export interface Quote {
    id: string;
    text: {
      en: string;
      zh: string;
    };
    author?: {
      en: string;
      zh: string;
    };
    category: string;
  }
  
  export const quotes: Quote[] = [
    {
      id: "q1",
      text: {
        en: "Every dawn is a new beginning.",
        zh: "每一个黎明，都是新的开始。"
      },
      category: "inspiration"
    },
    {
      id: "q2",
      text: {
        en: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
        zh: "生活中最大的荣耀不在于从不跌倒，而在于每次跌倒后都能站起来。"
      },
      author: {
        en: "Nelson Mandela",
        zh: "纳尔逊·曼德拉"
      },
      category: "resilience"
    },
    {
      id: "q3",
      text: {
        en: "The way to get started is to quit talking and begin doing.",
        zh: "开始行动的方法就是停止空谈，开始行动。"
      },
      author: {
        en: "Walt Disney",
        zh: "沃尔特·迪士尼"
      },
      category: "action"
    },
    {
      id: "q4",
      text: {
        en: "Your time is limited, so don't waste it living someone else's life.",
        zh: "你的时间有限，所以不要浪费时间活在别人的生活里。"
      },
      author: {
        en: "Steve Jobs",
        zh: "史蒂夫·乔布斯"
      },
      category: "life"
    },
    {
        id: "q5",
        text: {
          en: "Happiness is not by chance, but by choice.",
          zh: "幸福不是偶然，而是选择。"
        },
        author: {
          en: "Jim Rohn",
          zh: "吉姆·罗恩"
        },
        category: "happiness"
    },
    {
      id: "q6",
      text: {
        en: "The only way to do great work is to love what you do.",
        zh: "做出伟大工作的唯一方法是热爱你所做的事。"
      },
      author: {
        en: "Steve Jobs",
        zh: "史蒂夫·乔布斯"
      },
      category: "passion"
    },
    {
      id: "q7",
      text: {
        en: "In the middle of difficulty lies opportunity.",
        zh: "困难之中蕴含着机遇。"
      },
      author: {
        en: "Albert Einstein",
        zh: "阿尔伯特·爱因斯坦"
      },
      category: "opportunity"
    },
    {
      id: "q8",
      text: {
        en: "The future belongs to those who believe in the beauty of their dreams.",
        zh: "未来属于那些相信梦想之美的人。"
      },
      author: {
        en: "Eleanor Roosevelt",
        zh: "埃莉诺·罗斯福"
      },
      category: "dreams"
    },
    {
      id: "q9",
      text: {
        en: "It does not matter how slowly you go as long as you do not stop.",
        zh: "前进的速度不重要，重要的是不要停下脚步。"
      },
      author: {
        en: "Confucius",
        zh: "孔子"
      },
      category: "perseverance"
    },
    {
      id: "q10",
      text: {
        en: "The best time to plant a tree was 20 years ago. The second best time is now.",
        zh: "种树的最好时间是20年前，其次是现在。"
      },
      category: "action"
    }
  ];