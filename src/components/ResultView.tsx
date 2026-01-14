
import React, { useRef, useEffect, useState } from 'react';
import { Download, RefreshCcw, CheckCircle2, SlidersHorizontal, Move, ZoomIn, RotateCcw } from 'lucide-react';
import { PhotoPreset } from '../types';

interface Props {
  image: string;
  preset: PhotoPreset;
  customWidth: number;
  customHeight: number;
  onBack: () => void;
}

const ResultView: React.FC<Props> = ({ image, preset, customWidth, customHeight, onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1.1); // Default slightly zoomed for better head proportion
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(-0.1); // Default slightly up to center face better
  const [brightness, setBrightness] = useState(100);

  const mmToPx = (mm: number) => Math.round((mm / 25.4) * 300);
  const targetWidth = preset.id === 'custom' ? mmToPx(customWidth) : mmToPx(preset.widthMm);
  const targetHeight = preset.id === 'custom' ? mmToPx(customHeight) : mmToPx(preset.heightMm);

  const resetAdjustments = () => {
    setZoom(1.1);
    setOffsetX(0);
    setOffsetY(-0.1);
    setBrightness(100);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = image;
    img.onload = () => {
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const baseScale = Math.max(targetWidth / img.width, targetHeight / img.height);
      const finalScale = baseScale * zoom;

      const drawWidth = img.width * finalScale;
      const drawHeight = img.height * finalScale;

      // Base centering
      const centerX = (targetWidth - drawWidth) / 2;
      const centerY = (targetHeight - drawHeight) / 2;

      // Apply manual offsets (percentage of draw area)
      const finalX = centerX + (offsetX * drawWidth);
      const finalY = centerY + (offsetY * drawHeight);

      ctx.clearRect(0, 0, targetWidth, targetHeight);
      
      // Apply brightness filter
      ctx.filter = `brightness(${brightness}%)`;
      ctx.drawImage(img, finalX, finalY, drawWidth, drawHeight);
      ctx.filter = 'none';
    };
  }, [image, targetWidth, targetHeight, zoom, offsetX, offsetY, brightness]);

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `id_photo_${preset.name}_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  };

  return (
    <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center lg:items-start gap-10 py-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Result Card */}
      <div className="flex-1 flex flex-col items-center gap-6">
        <div className="relative group">
           <div className="absolute -inset-6 bg-indigo-500/10 rounded-[48px] blur-2xl transition-all opacity-0 group-hover:opacity-100"></div>
           <div className="relative bg-white p-6 rounded-[32px] shadow-2xl border border-slate-100">
             <canvas 
               ref={canvasRef} 
               className="max-w-[280px] md:max-w-[320px] rounded-lg shadow-sm bg-slate-100"
               style={{ aspectRatio: `${targetWidth}/${targetHeight}` }}
             />
             <div className="absolute -top-4 -right-4 bg-green-500 text-white p-2.5 rounded-full shadow-xl ring-4 ring-white">
               <CheckCircle2 size={24} />
             </div>
           </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800">预览与精修</h2>
          <p className="text-slate-400 text-sm mt-1">AI 已生成初稿，您可以手动微调比例</p>
        </div>
      </div>

      {/* Manual Optimization Panel */}
      <div className="w-full lg:w-96 flex flex-col gap-5">
        <div className="bg-white p-6 rounded-[32px] shadow-xl border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <SlidersHorizontal size={18} className="text-indigo-600" />
              手动优化
            </h3>
            <button 
              onClick={resetAdjustments}
              className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-colors uppercase tracking-widest"
            >
              <RotateCcw size={12} />
              重置参数
            </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  <ZoomIn size={14} /> 缩放比例
                </label>
                <span className="text-xs font-mono text-indigo-600 font-bold">{Math.round(zoom * 100)}%</span>
              </div>
              <input 
                type="range" min="0.5" max="2" step="0.01" value={zoom} 
                onChange={e => setZoom(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  <Move size={14} /> 垂直位移
                </label>
                <span className="text-xs font-mono text-indigo-600 font-bold">{Math.round(offsetY * 100)}%</span>
              </div>
              <input 
                type="range" min="-0.5" max="0.5" step="0.01" value={offsetY} 
                onChange={e => setOffsetY(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  <Move size={14} className="rotate-90" /> 水平位移
                </label>
                <span className="text-xs font-mono text-indigo-600 font-bold">{Math.round(offsetX * 100)}%</span>
              </div>
              <input 
                type="range" min="-0.3" max="0.3" step="0.01" value={offsetX} 
                onChange={e => setOffsetX(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-500">画面亮度</label>
                <span className="text-xs font-mono text-indigo-600 font-bold">{brightness}%</span>
              </div>
              <input 
                type="range" min="80" max="150" step="1" value={brightness} 
                onChange={e => setBrightness(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={downloadImage}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2"
          >
            <Download size={20} />
            保存高清成品
          </button>
          
          <button
            onClick={onBack}
            className="w-full bg-white hover:bg-slate-50 text-slate-500 py-3 rounded-2xl font-semibold border border-slate-100 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCcw size={18} />
            重新拍摄
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultView;
