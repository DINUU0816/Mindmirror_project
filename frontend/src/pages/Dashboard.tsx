import React, { useState, useEffect } from 'react';
import WebcamFeed from '../components/WebcamFeed';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Smile, Frown, Angry, Meh, Zap, 
  Music, Heart, Quote, TrendingUp, Sparkles 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const [currentEmotion, setCurrentEmotion] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
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
    } catch (err) {
      console.error("Failed to log emotion:", err);
    }
  };

  useEffect(() => {
    fetchInsights();
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
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Music className="text-primary-400" />
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

        {/* Quick Journal Link */}
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
