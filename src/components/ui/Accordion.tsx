'use client';

import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface AccordionItemProps {
  title: string;
  content: string | React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, content, isOpen, onToggle }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className={`relative isolate border rounded-xl overflow-hidden transition-all ${
      isLight
        ? 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
        : 'border-white/10 bg-[#0c0c0e] hover:border-white/20'
    }`}>
      <button
        onClick={onToggle}
        className={`w-full px-6 py-4 flex items-center justify-between text-left transition-colors ${
          isLight ? 'hover:bg-slate-50' : 'hover:bg-[#121214]'
        }`}
      >
        <span className={`text-lg font-semibold pr-4 ${isLight ? 'text-slate-900' : 'text-white'}`}>{title}</span>
        <svg
          className={`w-5 h-5 ${isLight ? 'text-slate-500' : 'text-white/60'} transition-transform duration-300 flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {/* grid-rows animation tracks true content height — max-h caps clipped long answers */}
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className={`px-6 pb-4 pt-2 leading-relaxed ${isLight ? 'text-slate-600' : 'text-white/70'}`}>
            {content}
          </div>
        </div>
      </div>
    </div>
  );
};

interface AccordionProps {
  items: Array<{
    title: string;
    content: string | React.ReactNode;
  }>;
  allowMultiple?: boolean;
  defaultOpenIndex?: number;
}

export const Accordion: React.FC<AccordionProps> = ({ 
  items, 
  allowMultiple = false,
  defaultOpenIndex 
}) => {
  const [openIndexes, setOpenIndexes] = useState<number[]>(
    defaultOpenIndex !== undefined ? [defaultOpenIndex] : []
  );

  const handleToggle = (index: number) => {
    if (allowMultiple) {
      setOpenIndexes(prev =>
        prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
      );
    } else {
      setOpenIndexes(prev => (prev.includes(index) ? [] : [index]));
    }
  };

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          title={item.title}
          content={item.content}
          isOpen={openIndexes.includes(index)}
          onToggle={() => handleToggle(index)}
        />
      ))}
    </div>
  );
};
