"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

// 模式选择器组件
export default function ModeSelector({ currentMode, onModeChange }) {
  // const t = useTranslations("Modes"); // 注释掉这行，因为没有对应的翻译键
  const [showDescriptions, setShowDescriptions] = useState(false);
  const [locale, setLocale] = useState("zh");

  // 获取当前语言
  useEffect(() => {
    const path = window.location.pathname;
    const pathLocale = path.split('/')[1];
    if (pathLocale === 'en' || pathLocale === 'zh') {
      setLocale(pathLocale);
    }
  }, []);

  // 定义模式类型和描述
  const modes = [
    {
      id: "listening",
      name: locale === "en" ? "Listening Mode" : "倾听模式",
      description: locale === "en" 
        ? "AI will only listen to your thoughts without giving evaluations or suggestions" 
        : "AI只会倾听您的想法，不会给出评价或建议"
    },
    {
      id: "comfort",
      name: locale === "en" ? "Comfort Mode" : "安慰模式",
      description: locale === "en" 
        ? "AI will provide gentle support and suggestions to help you feel at ease" 
        : "AI会提供温和的支持和建议，帮助您感到安心"
    },
    {
      id: "challenge",
      name: locale === "en" ? "Mind Challenge Mode" : "思维挑战模式",
      description: locale === "en" 
        ? "AI will help you challenge thought patterns and provide new perspectives" 
        : "AI会帮助您挑战思维模式，提供新的视角"
    },
    {
      id: "debate",
      name: locale === "en" ? "Debate Training Mode" : "辩论训练模式",
      description: locale === "en" 
        ? "AI will engage in beneficial debate to help you strengthen your reasoning skills" 
        : "AI会与您进行有益的辩论，帮助您锻炼思维能力"
    }
  ];

  return (
    <div className="mb-4">
      <div className="flex flex-wrap gap-2 mb-2">
        {modes.map((mode) => (
          <button
            key={mode.id}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              currentMode === mode.id
                ? "bg-primary text-primary-foreground font-bold" // 添加font-bold使选中的按钮文字加粗
                : "bg-muted hover:bg-muted/80"
            }`}
            onClick={() => onModeChange(mode.id)}
          >
            {mode.name}
          </button>
        ))}
      </div>
      
      <button
        className="text-xs text-muted-foreground hover:underline"
        onClick={() => setShowDescriptions(!showDescriptions)}
      >
        {showDescriptions 
          ? (locale === "en" ? "Hide mode descriptions" : "隐藏模式说明") 
          : (locale === "en" ? "View mode descriptions" : "查看模式说明")
        }
      </button>
      
      {showDescriptions && (
        <div className="mt-2 p-3 bg-muted/50 rounded-md text-sm">
          <h4 className="font-medium mb-2">{locale === "en" ? "Mode Descriptions:" : "模式说明："}</h4>
          <ul className="space-y-1">
            {modes.map((mode) => (
              <li key={mode.id}>
                <span className="font-medium">{mode.name}：</span>
                {mode.description}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}