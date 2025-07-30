"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from 'next-intl';

// 模式选择器组件
export function ModeSelector({ 
  currentMode, 
  onModeChange 
}: { 
  currentMode: string, 
  onModeChange: (mode: string) => void 
}) {
  const [showDescriptions, setShowDescriptions] = useState(false);
  const t = useTranslations('Modes');
  
  // 定义模式数据
  const modes = [
    {
      id: "listening",
      name: t('listeningMode'),
      description: t('listeningModeDesc'),
      icon: "🎧"
    },
    {
      id: "comfort",
      name: t('comfortMode'),
      description: t('comfortModeDesc'),
      icon: "💫"
    },
    {
      id: "challenge",
      name: t('challengeMode'),
      description: t('challengeModeDesc'),
      icon: "🧠"
    },
    {
      id: "debate",
      name: t('debateMode'),
      description: t('debateModeDesc'),
      icon: "⚖️"
    }
  ];

  return (
    <div className="w-full max-w-md">
      <div className="flex items-center justify-between mb-2">
        <div className="flex flex-wrap gap-2">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5
                ${currentMode === mode.id 
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
            >
              <span>{mode.icon}</span>
              <span>{mode.name}</span>
            </button>
          ))}
        </div>
        
        <button
          onClick={() => setShowDescriptions(!showDescriptions)}
          className="text-xs text-gray-500 dark:text-gray-400 hover:underline"
        >
          {showDescriptions ? t('hideModeDescriptions') : t('viewModeDescriptions')}
        </button>
      </div>
      
      {showDescriptions && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-sm mb-2"
        >
          <p className="font-medium mb-1">{t('modeDescriptionsTitle')}</p>
          <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
            {modes.map((mode) => (
              <li key={mode.id} className="flex items-start gap-1.5">
                <span>{mode.icon}</span>
                <span><strong>{mode.name}</strong> - {mode.description}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
} 