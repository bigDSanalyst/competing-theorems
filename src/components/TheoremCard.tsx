import React from 'react';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';

interface TheoremCardProps {
  id: number;
  title: string;
  expression: string;
  summary: string;
  proofBasis: string[];
  focus: 'Runtime' | 'Space';
  className?: string;
  isActive?: boolean;
}

export const TheoremCard: React.FC<TheoremCardProps> = ({
  id,
  title,
  expression,
  summary,
  proofBasis,
  focus,
  className,
  isActive
}) => {
  return (
    <div
      className={cn(
        "border p-6 transition-all duration-300",
        isActive 
          ? "border-black bg-black text-white" 
          : "border-gray-200 bg-white text-gray-900 hover:border-gray-400",
        className
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <span className={cn(
          "font-mono text-[10px] uppercase tracking-widest",
          isActive ? "text-gray-400" : "text-gray-500"
        )}>
          Theorem {id} — Focus: {focus}
        </span>
        <div className={cn(
          "w-2 h-2 rounded-full",
          isActive ? "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]" : "bg-gray-300"
        )} />
      </div>

      <h3 className="font-serif italic text-xl mb-3">{title}</h3>
      
      <div className={cn(
        "font-mono text-lg p-3 border mb-4",
        isActive ? "border-gray-700 bg-gray-900" : "border-gray-100 bg-gray-50"
      )}>
        {expression}
      </div>

      <p className="text-sm leading-relaxed mb-6 opacity-80">
        {summary}
      </p>

      <div className="space-y-2">
        <span className="font-mono text-[10px] uppercase tracking-widest opacity-60">Proof Foundations:</span>
        <ul className="grid grid-cols-1 gap-2">
          {proofBasis.map((basis, idx) => (
            <li key={idx} className="flex items-center gap-2 text-xs font-mono">
              <span className="text-blue-500">→</span> {basis}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
