import React, { useState, useEffect } from 'react';
import WebcamFeed from '../components/WebcamFeed';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Smile, Frown, Angry, Meh, Zap,
  Heart, Quote, TrendingUp, Sparkles,
  Activity, ShieldCheck, Thermometer, Clock3, AlertTriangle, Gamepad2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';

const Dashboard = () => {
  const [currentEmotion, setCurrentEmotion] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [emotionalProfile, setEmotionalProfile] = useState<any>(null);
  const [stabilityData, setStabilityData] = useState<any>(null);
  const [trendHistory, setTrendHistory] = useState<any[]>([]);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [crisisAlert, setCrisisAlert] = useState<string | null>(null);
  const [gameActive, setGameActive] = useState(false);
  const [gameScore, setGameScore] = useState(0);
  const [highScore, setHighScore] = useState<number>(() => Number(localStorage.getItem('mouseGameHighScore') || '0'));
  const [activeHole, setActiveHole] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(20);
  const { token, user } = useAuth();

  const fetchInsights = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/insights/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInsights(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRecommendations = async (emotion: string) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/recommendations/?emotion=${emotion}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecommendations(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEmotionalProfile = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/emotional-profile/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmotionalProfile(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEmotionHistory = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/emotion-history/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrendHistory(response.data.timeline || []);
      setHeatmapData(response.data.heatmap || []);
      if (response.data.crisis) {
        setCrisisAlert('Warning: Your emotional pattern shows prolonged negative stress. Seek support or take a break.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEmotionalStability = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/emotional-stability/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStabilityData(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEmotionDetected = async (data: any) => {
    setCurrentEmotion(data);
    // Log emotion to DB
    try {
      await axios.post('http://127.0.0.1:8000/api/emotions/', {
        emotion: data.emotion,
        confidence: data.confidence
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRecommendations(data.emotion);
      fetchInsights();
      fetchEmotionalProfile();
      fetchEmotionHistory();
      fetchEmotionalStability();
    } catch (err) {
      console.error("Failed to log emotion:", err);
    }
  };

  const holes = Array.from({ length: 9 }, (_, index) => index);

  useEffect(() => {
    if (!gameActive) {
      setActiveHole(null);
      return;
    }

    setActiveHole(Math.floor(Math.random() * 9));
    setTimeLeft(20);

    const moveInterval = window.setInterval(() => {
      setActiveHole(Math.floor(Math.random() * 9));
    }, 800);

    const timerInterval = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(moveInterval);
      window.clearInterval(timerInterval);
    };
  }, [gameActive]);

  useEffect(() => {
    localStorage.setItem('mouseGameHighScore', String(highScore));
  }, [highScore]);

  const startGame = () => {
    setGameScore(0);
    setTimeLeft(20);
    setGameActive(true);
  };

  const stopGame = () => {
    setGameActive(false);
  };

  const handleHoleClick = (index: number) => {
    if (gameActive && index === activeHole) {
      setGameScore((prev) => {
        const nextScore = prev + 1;
        if (nextScore > highScore) {
          setHighScore(nextScore);
        }
        return nextScore;
      });
      setActiveHole(Math.floor(Math.random() * 9));
    }
  };

  useEffect(() => {
    fetchInsights();
    fetchEmotionalProfile();
    fetchEmotionHistory();
    fetchEmotionalStability();
  }, []);

  const getEmotionIcon = (emotion: string) => {
    switch (emotion) {
      case 'Happy': return <Smile className="text-emotion-happy w-8 h-8" />;
      case 'Sad': return <Frown className="text-emotion-sad w-8 h-8" />;
      case 'Angry': return <Angry className="text-emotion-angry w-8 h-8" />;
      case 'Neutral': return <Meh className="text-emotion-neutral w-8 h-8" />;
      case 'Surprise': return <Zap className="text-emotion-surprise w-8 h-8" />;
      default: return <Sparkles className="text-primary-400 w-8 h-8" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Camera & Live Status */}
      <div className="lg:col-span-8 space-y-8">
        <section className="glass-card p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="text-primary-400" />
              Mirror of the Mind
            </h2>
            <div className="text-right">
              <p className="text-xs text-white/40 uppercase font-bold">Daily Streak</p>
              <p className="text-xl font-black text-primary-400">{user?.stats?.current_streak || 0} Days</p>
            </div>
          </div>
          
          <WebcamFeed onEmotionDetected={handleEmotionDetected} />
        </section>

        {/* Real-time Recommendations */}
        <section className="space-y-4">
          <h3 className="text-xl font-bold">
            Suggested for Your Mood
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AnimatePresence mode='popLayout'>
              {recommendations.length > 0 ? (
                recommendations.map((rec, i) => (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-card p-4 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <span className="text-[10px] font-bold uppercase text-primary-400">{rec.category}</span>
                    <h4 className="font-bold mt-1 line-clamp-1">{rec.title}</h4>
                    <p className="text-sm text-white/60 mt-2 line-clamp-2">{rec.content}</p>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-3 glass-card p-8 text-center text-white/40 italic">
                  Start the camera to receive personalized wellness recommendations.
                </div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Mood Drift & Heatmap */}
        <section className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Mood Timeline</h3>
            <span className="text-xs uppercase text-white/40">Last 30 entries</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendHistory} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="timestamp" tickFormatter={(value) => value.slice(11, 16)} tick={{ fill: '#CBD5E1', fontSize: 12 }} />
                <YAxis tick={{ fill: '#CBD5E1', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} itemStyle={{ color: '#fff' }} />
                <Line type="monotone" dataKey="stress_level" stroke="#60a5fa" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950/70 rounded-2xl border border-white/10">
              <p className="text-sm text-white/50 uppercase">Volatility</p>
              <p className="text-3xl font-black text-primary-400">{stabilityData?.volatility ?? '--'}</p>
            </div>
            <div className="p-4 bg-slate-950/70 rounded-2xl border border-white/10">
              <p className="text-sm text-white/50 uppercase">Crisis Alert</p>
              <p className={`mt-2 font-bold ${crisisAlert ? 'text-rose-400' : 'text-emerald-400'}`}>
                {crisisAlert ? 'Active' : 'Stable'}
              </p>
            </div>
          </div>
        </section>

        <section className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Weekly Emotion Heatmap</h3>
            <span className="text-xs uppercase text-white/40">Daily intensity</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {heatmapData.length > 0 ? heatmapData.map((item, index) => (
              <div key={item.day} className="p-3 rounded-2xl bg-slate-950/70 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold">{item.day}</span>
                  <span className="text-xs text-white/50">{item.total} checks</span>
                </div>
                <div className="space-y-1">
                  {Object.entries(item.scores).map(([emotion, value]) => (
                    <div key={emotion} className="flex items-center justify-between text-xs text-white/60">
                      <span>{emotion}</span>
                      <span>{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )) : (
              <div className="col-span-2 text-center text-white/40 py-8">Emotion history will show here after a few check-ins.</div>
            )}
          </div>
        </section>
      </div>

      {/* Right Column: Insights & Stats */}
      <div className="lg:col-span-4 space-y-8">
        {/* Current State Card */}
        <section className={`glass-card p-6 border-l-4 transition-all duration-500 ${currentEmotion ? `emotion-${currentEmotion.emotion.toLowerCase()}` : 'border-primary-500/20'}`}>
          <h3 className="text-sm font-bold text-white/40 uppercase mb-4 tracking-tighter">Current Resonance</h3>
          {currentEmotion ? (
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/5 rounded-2xl">
                {getEmotionIcon(currentEmotion.emotion)}
              </div>
              <div>
                <h4 className="text-3xl font-black text-white">{currentEmotion.emotion}</h4>
                <p className="text-primary-400 font-medium">{(currentEmotion.confidence * 100).toFixed(1)}% Confidence</p>
              </div>
            </div>
          ) : (
            <div className="py-4 text-white/20 italic">Awaiting consciousness...</div>
          )}
        </section>

        {/* AI Insights Card */}
        <section className="glass-card p-6 bg-gradient-to-br from-primary-600/10 to-transparent">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-primary-400 w-5 h-5" />
            <h3 className="font-bold">AI Mood Insights</h3>
          </div>
          {insights ? (
            <div className="space-y-4">
              <p className="text-lg font-medium leading-tight">{insights.insight}</p>
              <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                <p className="text-sm text-primary-300 italic">" {insights.recommendation} "</p>
              </div>
            </div>
          ) : (
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-white/10 rounded w-3/4"></div>
              <div className="h-4 bg-white/10 rounded w-full"></div>
              <div className="h-12 bg-white/10 rounded w-full mt-4"></div>
            </div>
          )}
        </section>

        <section className="glass-card p-6 bg-slate-950/80 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm uppercase text-white/40 tracking-[0.3em]">Emotional Profile</p>
              <h3 className="text-2xl font-black">Digital Twin Summary</h3>
            </div>
            <ShieldCheck className="w-7 h-7 text-primary-400" />
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm text-white/70">
            <div className="bg-slate-900/60 rounded-3xl p-4">
              <p className="text-xs uppercase text-white/40">Stability</p>
              <p className="text-2xl font-black text-primary-400">{emotionalProfile?.emotional_stability_score ?? '--'}%</p>
            </div>
            <div className="bg-slate-900/60 rounded-3xl p-4">
              <p className="text-xs uppercase text-white/40">Burnout Risk</p>
              <p className="text-2xl font-black text-rose-400">{emotionalProfile?.burnout_risk || 'Low'}</p>
            </div>
            <div className="bg-slate-900/60 rounded-3xl p-4">
              <p className="text-xs uppercase text-white/40">Recovery Speed</p>
              <p className="text-2xl font-black text-emerald-300">{emotionalProfile?.recovery_speed || 'Moderate'}</p>
            </div>
            <div className="bg-slate-900/60 rounded-3xl p-4">
              <p className="text-xs uppercase text-white/40">Stress Pattern</p>
              <p className="text-2xl font-black text-primary-200">{emotionalProfile?.stress_pattern || 'Balanced'}</p>
            </div>
          </div>
          <div className="mt-4 p-4 rounded-3xl bg-slate-900/60 border border-white/10">
            <p className="text-xs uppercase text-white/40">Dominant Emotion</p>
            <p className="text-lg font-bold text-white mt-2">{emotionalProfile?.dominant_emotion || 'Neutral'}</p>
            <p className="text-sm text-white/60 mt-2">Peak positive period: {emotionalProfile?.peak_positive_period || 'Unknown'}</p>
          </div>
        </section>

        {/* Quick Journal Link */}
        <section className="glass-card p-6 bg-slate-950/80 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm uppercase text-white/40 tracking-[0.3em]">Game</p>
              <h3 className="text-2xl font-black flex items-center gap-2">
                <Gamepad2 className="w-6 h-6 text-primary-400" />
                Let's Play
              </h3>
            </div>
            <span className="text-xs uppercase text-white/40">Hit the Mouse</span>
          </div>
          <p className="text-sm text-white/60 mb-4">Click the mouse when it appears in one of the nine holes. Score increases with every hit.</p>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {holes.map((index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleHoleClick(index)}
                className={`h-20 rounded-3xl border border-white/10 transition-colors ${activeHole === index ? 'bg-amber-400/20 animate-pulse' : 'bg-slate-900/60 hover:bg-slate-800'}`}
              >
                <span className="text-3xl block text-center leading-[5]">
                  {activeHole === index ? '🐭' : '·'}
                </span>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3 text-center mb-4 text-sm text-white/70">
            <div className="bg-slate-900/60 rounded-3xl p-3">
              <p className="uppercase text-white/40 text-[10px]">Score</p>
              <p className="text-2xl font-black text-primary-400">{gameScore}</p>
            </div>
            <div className="bg-slate-900/60 rounded-3xl p-3">
              <p className="uppercase text-white/40 text-[10px]">Best</p>
              <p className="text-2xl font-black text-emerald-400">{highScore}</p>
            </div>
            <div className="bg-slate-900/60 rounded-3xl p-3">
              <p className="uppercase text-white/40 text-[10px]">Time</p>
              <p className="text-2xl font-black text-white">{gameActive ? `${timeLeft}s` : 'Ready'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={gameActive ? stopGame : startGame}
            className="w-full py-3 bg-primary-600 hover:bg-primary-500 rounded-xl font-bold transition-all"
          >
            {gameActive ? 'Stop Game' : 'Start Game'}
          </button>
        </section>

        <section className="glass-card p-6 border border-primary-500/30 shadow-lg shadow-primary-500/10">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <Heart className="text-red-400 w-5 h-5" />
            Mindful Check-in
          </h3>
          <p className="text-sm text-white/60 mb-4">How are you truly feeling today? Write it down to track patterns.</p>
          <button className="w-full py-3 bg-primary-600 hover:bg-primary-500 rounded-xl font-bold transition-all">
            Write Journal Entry
          </button>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
