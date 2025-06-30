// 文件名: fix-mode-selector.tsx
// 将此文件保存到项目根目录，然后复制内容替换 components/ui/ModeSelector.tsx

"use client";

import { useState } from "react";
import { motion } from "framer-motion";

// 硬编码的英文模式
const ENGLISH_MODE = true; // 强制使用英文

// 模式选择器组件
export default function ModeSelector({ currentMode, onModeChange }) {
  const [showDescriptions, setShowDescriptions] = useState(false);
  
  // 定义模式类型和描述 - 全部使用英文
  const modes = [
    {
      id: "listening",
      name: "Listening Mode",
      description: "AI will only listen to your thoughts without giving evaluations or suggestions",
      icon: "🎧"
    },
    {
      id: "comfort",
      name: "Comfort Mode",
      description: "AI will provide gentle support and suggestions to help you feel at ease",
      icon: "💫"
    },
    {
      id: "challenge",
      name: "Mind Challenge Mode",
      description: "AI will help you challenge thought patterns and provide new perspectives",
      icon: "🧠"
    },
    {
      id: "debate",
      name: "Debate Training Mode",
      description: "AI will engage in beneficial debate to help you strengthen your reasoning skills",
      icon: "⚖️"
    }
  ];

  // 按钮文本 - 全部使用英文
  const viewDescText = "View mode descriptions";
  const hideDescText = "Hide mode descriptions";
  const descTitleText = "Mode Descriptions:";

  return (
    <div className="mb-6">
      {/* 模式选择按钮 */}
      <div className="flex flex-wrap gap-3 mb-4">
        {modes.map((mode) => (
          <motion.button
            key={mode.id}
            className={`relative px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 
              ${currentMode === mode.id
                ? "bg-gradient-to-br from-indigo-500/90 to-purple-600/90 text-white shadow-lg shadow-indigo-500/20"
                : "bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-gray-800 dark:text-gray-200 shadow-sm"
              } 
              flex items-center gap-2 overflow-hidden group`}
            onClick={() => onModeChange(mode.id)}
            whileTap={{ scale: 0.97 }}
            whileHover={{ 
              scale: 1.02,
              boxShadow: currentMode === mode.id 
                ? "0 8px 20px rgba(79, 70, 229, 0.3)" 
                : "0 8px 20px rgba(0, 0, 0, 0.1)" 
            }}
          >
            {/* 背景光效 */}
            {currentMode === mode.id && (
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 animate-pulse"></div>
            )}
            
            {/* 内容 */}
            <span className="relative z-10">{mode.icon}</span>
            <span className="relative z-10">{mode.name}</span>
            
            {/* 悬停时的光晕效果 */}
            <div className="absolute -inset-px bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-xl"></div>
          </motion.button>
        ))}
      </div>
      
      {/* 查看/隐藏描述按钮 */}
      <motion.button
        className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors flex items-center gap-1 group"
        onClick={() => setShowDescriptions(!showDescriptions)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-3.5 w-3.5 transition-transform duration-300 ${showDescriptions ? 'rotate-180' : 'rotate-0'}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        <span className="group-hover:underline">
          {showDescriptions ? hideDescText : viewDescText}
        </span>
      </motion.button>
      
      {/* 模式描述 */}
      {showDescriptions && (
        <motion.div 
          className="mt-3 p-4 bg-white/10 dark:bg-gray-800/40 backdrop-blur-lg rounded-xl text-sm border border-white/20 dark:border-gray-700/50 shadow-lg"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <h4 className="font-medium mb-3 text-gray-700 dark:text-gray-300">{descTitleText}</h4>
          <ul className="space-y-2.5">
            {modes.map((mode) => (
              <li key={mode.id} className="flex items-start gap-2">
                <span className="mt-0.5">{mode.icon}</span>
                <div>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{mode.name}</span>
                  <span className="mx-1 text-gray-400">—</span>
                  <span className="text-gray-600 dark:text-gray-400">{mode.description}</span>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
}