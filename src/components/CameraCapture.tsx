
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, RefreshCw } from 'lucide-react';

interface Props {
  onCapture: (image: string) => void;
}

const CameraCapture: React.FC<Props> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 },
          facingMode: 'user'
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsReady(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("无法访问摄像头，请确保已授权。");
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  const capture = () => {
    if (countdown !== null) return;
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas) {
        const context = canvas.getContext('2d');
        if (context) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          // Flip horizontally for a non-mirror selfie capture
          context.translate(canvas.width, 0);
          context.scale(-1, 1);
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
          onCapture(dataUrl);
        }
      }
      setCountdown(null);
      return;
    }

    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, onCapture]);

  return (
    <div className="relative w-full max-w-2xl mx-auto rounded-3xl overflow-hidden shadow-2xl bg-black aspect-[4/3] group">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover scale-x-[-1]"
      />
      
      {!isReady && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-white gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
          <p className="text-slate-400 font-medium">正在启动摄像头...</p>
        </div>
      )}

      {/* Overlays */}
      <div className="absolute inset-0 pointer-events-none border-[20px] border-black/10">
        {/* Alignment Guide */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] w-64 h-80 border-2 border-white/30 rounded-[100px] border-dashed"></div>
      </div>

      {isReady && countdown === null && (
        <div className="absolute bottom-8 left-0 right-0 flex justify-center px-4">
          <button
            onClick={capture}
            className="group/btn bg-white hover:bg-indigo-50 text-slate-900 px-8 py-4 rounded-full font-bold shadow-xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95 pointer-events-auto"
          >
            <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center group-hover/btn:bg-indigo-700 transition-colors">
              <Camera size={24} />
            </div>
            开始拍照
          </button>
        </div>
      )}

      {countdown !== null && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <div className="text-9xl font-black text-white animate-ping drop-shadow-2xl">
            {countdown}
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraCapture;
