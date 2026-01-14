
import React, { useState, useCallback } from 'react';
import { Camera, RefreshCcw, Download, ArrowRight, CheckCircle2, Sliders, Image as ImageIcon, Ruler, Palette, Settings, ChevronDown, ChevronUp, Sparkles, Zap } from 'lucide-react';
import CameraCapture from './components/CameraCapture';
import ProcessingOverlay from './components/ProcessingOverlay';
import ResultView from './components/ResultView';
import { AppState, BackgroundColor, PHOTO_PRESETS, APIProvider } from './types';
import { processIDPhoto, getProviderModels, getProviderConfig } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    step: 'camera',
    rawImage: null,
    processedImage: null,
    selectedColor: 'white',
    customColor: '#ffffff',
    selectedPresetId: '1inch',
    customWidth: 35,
    customHeight: 45,
    dpi: 300,
    apiConfig: {
      provider: 'tongyi' as APIProvider,
      apiKey: '',
      baseURL: '/api/tongyi',
      model: 'qwen-image-edit-plus',
    },
    error: null,
  });

  const [isApiConfigOpen, setIsApiConfigOpen] = useState(false);

  // 当提供商改变时，自动更新配置
  const handleProviderChange = (newProvider: APIProvider) => {
    const config = getProviderConfig(newProvider);
    setState(prev => ({
      ...prev,
      apiConfig: {
        provider: newProvider,
        apiKey: '', // 清空API密钥，需要用户重新输入
        baseURL: config.baseURL,
        model: config.defaultModel,
      },
    }));
  };

  const handleCapture = useCallback((image: string) => {
    setState(prev => ({ ...prev, rawImage: image, step: 'processing', error: null }));

    const color = state.selectedColor === 'custom' ? state.customColor : state.selectedColor;
    processIDPhoto(image, color, true, state.apiConfig)
      .then(processed => {
        setState(prev => ({ ...prev, processedImage: processed, step: 'result', error: null }));
      })
      .catch((error) => {
        console.error("Processing failed:", error);
        const errorMessage = error.message || "请检查API配置并重试。";
        setState(prev => ({ ...prev, step: 'camera', error: errorMessage }));
      });
  }, [state.selectedColor, state.customColor, state.apiConfig]);

  const reset = () => {
    setState(prev => ({ ...prev, step: 'camera', rawImage: null, processedImage: null, error: null }));
  };

  const updateColor = (color: BackgroundColor) => {
    setState(prev => ({ ...prev, selectedColor: color }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-slate-900 flex flex-col relative overflow-hidden">
      {/* 背景装饰元素 */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200/50 py-4 px-6 sticky top-0 z-20 shadow-lg shadow-slate-200/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-2xl text-white shadow-lg">
              <Sparkles size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                ID Photo Pro
              </h1>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <Zap size={12} className="text-indigo-500" />
                AI 驱动的一站式证件照工坊
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            <StepIndicator currentStep={state.step} />
          </div>

          <button
            onClick={reset}
            className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-all duration-200 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-indigo-50 hover:shadow-sm"
          >
            <RefreshCcw size={16} />
            重置
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {state.step === 'camera' && (
          <div className="w-full flex flex-col xl:flex-row gap-6 lg:gap-8 items-start">
            <div className="flex-1 w-full order-2 xl:order-1">
              <CameraCapture onCapture={handleCapture} />
            </div>

            <div className="w-full xl:w-96 bg-white/95 backdrop-blur-sm p-4 sm:p-6 rounded-3xl shadow-2xl border border-slate-200/50 flex flex-col gap-6 order-1 xl:order-2">
              <div>
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <Sliders size={20} className="text-indigo-600" />
                  配置参数
                </h3>

                <div className="space-y-6">
                  {/* 背景颜色选择 */}
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Palette size={16} className="text-indigo-500" />
                      选择背景颜色
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {(['white', 'blue', 'red'] as BackgroundColor[]).map(c => (
                        <button
                          key={c}
                          onClick={() => updateColor(c)}
                          className={`color-button group relative h-14 rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                            state.selectedColor === c
                              ? 'border-indigo-500 scale-105 shadow-xl shadow-indigo-200 ring-2 ring-indigo-200 animate-glow'
                              : 'border-slate-200 hover:border-slate-300 hover:shadow-lg'
                          }`}
                          style={{ backgroundColor: c }}
                        >
                          {state.selectedColor === c && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/20 to-transparent">
                              <CheckCircle2 size={20} className={c === 'white' ? 'text-indigo-600' : 'text-white'} />
                            </div>
                          )}
                          <div className="absolute bottom-1 left-1 right-1">
                            <span className={`text-[10px] font-bold capitalize ${
                              c === 'white' ? 'text-slate-600' : 'text-white drop-shadow-sm'
                            }`}>
                              {c}
                            </span>
                          </div>
                        </button>
                      ))}
                      <div className="relative h-14">
                        <input
                          type="color"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 rounded-2xl"
                          onChange={(e) => {
                            updateColor('custom');
                            setState(prev => ({ ...prev, customColor: e.target.value }));
                          }}
                        />
                        <div
                          className={`absolute inset-0 rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-300 ${
                            state.selectedColor === 'custom'
                              ? 'border-indigo-500 scale-105 shadow-xl shadow-indigo-200 ring-2 ring-indigo-200'
                              : 'border-slate-200 hover:border-slate-300 hover:shadow-lg'
                          }`}
                          style={{ backgroundColor: state.selectedColor === 'custom' ? state.customColor : 'transparent' }}
                        >
                          <span className={`text-[10px] font-bold ${
                            state.selectedColor === 'custom' ? 'text-white drop-shadow-sm' : 'text-slate-400'
                          }`}>
                            自定义
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* API配置 - 可折叠 */}
                  <div className="space-y-3">
                    <button
                      onClick={() => setIsApiConfigOpen(!isApiConfigOpen)}
                      className="hover-lift w-full flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-indigo-50/30 rounded-2xl border border-slate-200/50 hover:border-indigo-200"
                    >
                      <div className="flex items-center gap-2">
                        <Settings size={16} className="text-indigo-500" />
                        <span className="text-sm font-bold text-slate-700">AI 配置</span>
                      </div>
                      {isApiConfigOpen ? (
                        <ChevronUp size={16} className="text-slate-400 transition-transform duration-200" />
                      ) : (
                        <ChevronDown size={16} className="text-slate-400 transition-transform duration-200" />
                      )}
                    </button>

                    <div className={`overflow-hidden transition-all duration-300 ${
                      isApiConfigOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      <div className="space-y-4 p-4 bg-gradient-to-br from-indigo-50/50 to-purple-50/30 rounded-2xl border border-indigo-100/50 backdrop-blur-sm">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600">API 提供商</label>
                          <select
                            value={state.apiConfig.provider}
                            onChange={(e) => handleProviderChange(e.target.value as APIProvider)}
                            className="w-full bg-white/80 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 hover:border-slate-300"
                          >
                            <option value="siliconflow">硅基流动 (SiliconFlow)</option>
                            <option value="openrouter">OpenRouter</option>
                            <option value="tongyi">通义千问 (Tongyi)</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                            API Key
                            <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="password"
                            placeholder="输入API密钥"
                            value={state.apiConfig.apiKey}
                            onChange={(e) => setState(prev => ({
                              ...prev,
                              apiConfig: { ...prev.apiConfig, apiKey: e.target.value }
                            }))}
                            className="w-full bg-white/80 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 hover:border-slate-300"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600">Base URL</label>
                          <input
                            type="text"
                            placeholder="API基础地址"
                            value={state.apiConfig.baseURL}
                            onChange={(e) => setState(prev => ({
                              ...prev,
                              apiConfig: { ...prev.apiConfig, baseURL: e.target.value }
                            }))}
                            className="w-full bg-white/80 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 hover:border-slate-300"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600">AI 模型</label>
                          <select
                            value={state.apiConfig.model}
                            onChange={(e) => setState(prev => ({
                              ...prev,
                              apiConfig: { ...prev.apiConfig, model: e.target.value }
                            }))}
                            className="w-full bg-white/80 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 hover:border-slate-300"
                          >
                            {getProviderModels(state.apiConfig.provider).map(model => (
                              <option key={model.value} value={model.value}>
                                {model.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 照片尺寸设置 */}
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Ruler size={16} className="text-indigo-500" />
                      设定照片尺寸
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {PHOTO_PRESETS.map(p => (
                        <button
                          key={p.id}
                          onClick={() => setState(prev => ({ ...prev, selectedPresetId: p.id }))}
                          className={`hover-lift flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 ${
                            state.selectedPresetId === p.id
                              ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-lg shadow-indigo-100'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                          }`}
                        >
                          <div className="flex flex-col items-start">
                            <span className={`text-sm font-bold ${state.selectedPresetId === p.id ? 'text-indigo-700' : 'text-slate-700'}`}>
                              {p.name}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">{p.description}</span>
                          </div>
                          {state.selectedPresetId === p.id && (
                            <div className="flex items-center justify-center w-6 h-6 bg-indigo-500 rounded-full">
                              <CheckCircle2 size={14} className="text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>

                    {state.selectedPresetId === 'custom' && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50/50 to-purple-50/30 rounded-2xl border border-indigo-100 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center gap-2 mb-4 text-indigo-600">
                          <Ruler size={16} />
                          <span className="text-xs font-bold uppercase tracking-wider">自定义尺寸 (mm)</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500">宽度</label>
                            <input
                              type="number"
                              value={state.customWidth}
                              onChange={e => setState(prev => ({ ...prev, customWidth: parseInt(e.target.value) || 0 }))}
                              className="w-full bg-white/80 border border-slate-200 rounded-xl px-3 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 hover:border-slate-300"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500">高度</label>
                            <input
                              type="number"
                              value={state.customHeight}
                              onChange={e => setState(prev => ({ ...prev, customHeight: parseInt(e.target.value) || 0 }))}
                              className="w-full bg-white/80 border border-slate-200 rounded-xl px-3 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 hover:border-slate-300"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 错误提示 */}
              {state.error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800 mb-1">处理失败</p>
                      <p className="text-xs text-red-600 leading-relaxed">{state.error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100/50">
                <p className="text-xs text-slate-400 leading-relaxed italic text-center">
                  <Sparkles size={12} className="inline mr-1 text-indigo-400" />
                  AI 会根据您选择的尺寸自动构图，保持人物比例协调
                </p>
              </div>
            </div>
          </div>
        )}

        {state.step === 'processing' && <ProcessingOverlay />}

        {state.step === 'result' && state.processedImage && (
          <ResultView 
            image={state.processedImage} 
            preset={PHOTO_PRESETS.find(p => p.id === state.selectedPresetId)!}
            customWidth={state.customWidth}
            customHeight={state.customHeight}
            onBack={reset}
          />
        )}
      </main>

      <footer className="py-6 px-6 text-center text-slate-400 text-xs border-t border-slate-100">
        © 2025 ID Photo Studio Pro • 极简、高效、专业的证件照生成工具
      </footer>
    </div>
  );
};

const StepIndicator: React.FC<{ currentStep: AppState['step'] }> = ({ currentStep }) => {
  const steps = [
    { key: 'camera', label: '环境确认', icon: Camera },
    { key: 'processing', label: 'AI 处理', icon: Sparkles },
    { key: 'result', label: '精修导出', icon: Download }
  ];

  return (
    <div className="flex items-center gap-6">
      {steps.map((s, i) => {
        const Icon = s.icon;
        const isActive = currentStep === s.key;
        const isCompleted = steps.findIndex(step => step.key === currentStep) > i;

        return (
          <React.Fragment key={s.key}>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                isCompleted
                  ? 'bg-green-500 text-white shadow-lg shadow-green-200'
                  : isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110'
                    : 'bg-slate-100 text-slate-400'
              }`}>
                {isCompleted ? <CheckCircle2 size={16} /> : <Icon size={14} />}
              </div>
              <span className={`text-sm font-medium transition-all duration-300 ${
                isActive
                  ? 'text-indigo-700 font-bold'
                  : isCompleted
                    ? 'text-green-600 font-semibold'
                    : 'text-slate-400'
              }`}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`transition-colors duration-300 ${
                isCompleted ? 'text-green-400' : 'text-slate-300'
              }`}>
                <ArrowRight size={16} />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default App;
