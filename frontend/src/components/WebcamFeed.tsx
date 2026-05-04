import React, { useRef, useCallback, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Camera, RefreshCw, Smile, AlertCircle } from 'lucide-react';

const WebcamFeed = ({ onEmotionDetected }: { onEmotionDetected: (emotion: any) => void }) => {
  const webcamRef = useRef<Webcam>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const capture = useCallback(async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        try {
          const response = await axios.post('http://127.0.0.1:8000/api/detect/', 
            { image: imageSrc },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (response.data && response.data.length > 0) {
            onEmotionDetected(response.data[0]);
          }
        } catch (err) {
          console.error("Detection error:", err);
        }
      }
    }
  }, [webcamRef, token, onEmotionDetected]);

  useEffect(() => {
    let interval: any;
    if (isDetecting) {
      interval = setInterval(capture, 3000); // Detect every 3 seconds
    }
    return () => clearInterval(interval);
  }, [isDetecting, capture]);

  return (
    <div className="relative group">
      <div className="aspect-video bg-slate-800 rounded-2xl overflow-hidden border-2 border-white/5 group-hover:border-primary-500/50 transition-all shadow-2xl">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="w-full h-full object-cover"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
          <div className="flex justify-between items-start">
            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${isDetecting ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' : 'bg-slate-900/50 text-white/50 border border-white/10'}`}>
              <div className={`w-2 h-2 rounded-full ${isDetecting ? 'bg-red-500' : 'bg-white/20'}`} />
              {isDetecting ? 'Live Detection Active' : 'Camera Ready'}
            </div>
            {isDetecting && (
              <div className="bg-slate-900/80 backdrop-blur px-3 py-1 rounded-lg text-[10px] text-white/60">
                Scanning every 3s
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <button
          onClick={() => setIsDetecting(!isDetecting)}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all transform active:scale-95 ${
            isDetecting 
            ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20' 
            : 'bg-primary-600 text-white hover:bg-primary-500 shadow-lg shadow-primary-600/30'
          }`}
        >
          {isDetecting ? (
            <><RefreshCw className="w-5 h-5 animate-spin" /> Stop Monitoring</>
          ) : (
            <><Camera className="w-5 h-5" /> Start AI Monitoring</>
          )}
        </button>
      </div>
    </div>
  );
};

export default WebcamFeed;
