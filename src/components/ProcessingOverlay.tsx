
import React from 'react';
import { Sparkles } from 'lucide-react';

const ProcessingOverlay: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-500">
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-2xl animate-pulse"></div>
        <div className="relative bg-white p-8 rounded-full shadow-2xl border border-indigo-50 border-t-indigo-500 border-t-4 animate-spin-slow">
          <Sparkles size={64} className="text-indigo-600 animate-bounce" />
        </div>
      </div>
      
      <h2 className="text-3xl font-bold text-slate-800 mb-3 text-center">正在施展 AI 魔法...</h2>
      <p className="text-slate-500 max-w-sm text-center font-medium leading-relaxed">
        正在精确识别轮廓、平滑皮肤并替换背景颜色。这通常需要 3-8 秒。
      </p>

      <div className="mt-12 w-64 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-600 animate-loading-bar rounded-full"></div>
      </div>
      
      <style>{`
        @keyframes loading-bar {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        .animate-loading-bar {
          animation: loading-bar 5s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ProcessingOverlay;
