import React from 'react';
import { BookOpen } from 'lucide-react';

interface EducationalNoteProps {
  title: string;
  explanation: string;
  formula?: string;
  className?: string;
}

export const EducationalNote: React.FC<EducationalNoteProps> = ({
  title,
  explanation,
  formula,
  className = '',
}) => {
  return (
    <div
      className={`border border-cyan-800/40 bg-cyan-950/20 rounded-lg p-3 text-xs text-cyan-200/90 ${className}`}
    >
      <div className="flex items-center gap-1.5 font-semibold text-cyan-300 mb-1">
        <BookOpen className="w-3.5 h-3.5 shrink-0" />
        <span>STUDENT LEARNING NOTE: {title}</span>
      </div>
      <p className="leading-relaxed text-slate-300">{explanation}</p>
      {formula && (
        <div className="mt-1.5 pt-1.5 border-t border-cyan-800/30 flex items-center gap-2">
          <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400">Formula:</span>
          <code className="text-[11px] font-mono-numbers text-white bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">
            {formula}
          </code>
        </div>
      )}
    </div>
  );
};
