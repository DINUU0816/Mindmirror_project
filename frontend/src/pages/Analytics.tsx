import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  PieChart as PieChartIcon, 
  BarChart as BarChartIcon, 
  Activity, 
  History,
  Info
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const Analytics = () => {
  const [data, setData] = useState<any>(null);
  const { token } = useAuth();

  const fetchData = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/analytics/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const COLORS = {
    'Happy': '#fbbf24',
    'Sad': '#60a5fa',
    'Angry': '#f87171',
    'Neutral': '#9ca3af',
    'Surprise': '#c084fc',
    'Fear': '#34d399',
    'Disgust': '#a3e635',
  };

  if (!data) return <div className="flex items-center justify-center h-96">Loading Emotional Intelligence...</div>;

  const pieData = data.emotion_counts.map((item: any) => ({
    name: item.emotion,
    value: item.count
  }));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
          <PieChartIcon className="text-primary-400 w-10 h-10" />
          Emotional Spectrum
        </h1>
        <p className="text-white/40">Visualizing your mind's patterns over time.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Charts */}
        <div className="lg:col-span-8 space-y-8">
          <div className="glass-card p-6">
            <h3 className="font-bold mb-6 flex items-center gap-2">
              <Activity className="text-primary-400 w-5 h-5" />
              Mood Distribution
            </h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#8884d8'} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-bold mb-6 flex items-center gap-2">
              <BarChartIcon className="text-primary-400 w-5 h-5" />
              Check-in Frequency
            </h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pieData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={12} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {pieData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#8884d8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sidebar: History & Stats */}
        <div className="lg:col-span-4 space-y-8">
          <section className="glass-card p-6">
            <h3 className="font-bold mb-6 flex items-center gap-2">
              <History className="text-primary-400 w-5 h-5" />
              Recent Logs
            </h3>
            <div className="space-y-4">
              {data.recent_history.map((rec: any) => (
                <div key={rec.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: COLORS[rec.emotion as keyof typeof COLORS] }} />
                    <span className="font-medium">{rec.emotion}</span>
                  </div>
                  <span className="text-[10px] text-white/30 uppercase">
                    {new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="glass-card p-6 bg-primary-600/10 border border-primary-500/20">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-primary-300">
              <Info className="w-5 h-5" />
              Wellness Score
            </h3>
            <div className="text-center py-6">
              <p className="text-6xl font-black text-white">{data.stats.emotional_health_score.toFixed(0)}</p>
              <p className="text-primary-400 font-bold mt-2">Elite Mindset</p>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 mt-4">
              <div 
                className="bg-primary-500 h-2 rounded-full transition-all duration-1000" 
                style={{ width: `${data.stats.emotional_health_score}%` }} 
              />
            </div>
            <p className="text-xs text-white/40 mt-4 leading-relaxed">
              Based on your consistency and positive mood trends over the last 7 days.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
