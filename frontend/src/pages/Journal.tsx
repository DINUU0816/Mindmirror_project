import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { BookText, PenTool, Calendar, Trash2, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const Journal = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [newEntry, setNewEntry] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const fetchEntries = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/journals/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEntries(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://127.0.0.1:8000/api/journals/', newEntry, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewEntry({ title: '', content: '' });
      fetchEntries();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteEntry = async (id: number) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/journals/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchEntries();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <header className="text-center">
        <h1 className="text-4xl font-black mb-2 flex items-center justify-center gap-3">
          <BookText className="text-primary-400 w-10 h-10" />
          Reflective Journal
        </h1>
        <p className="text-white/40 text-lg">Unload your thoughts. Let the AI find the light in them.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* New Entry Form */}
        <div className="md:col-span-5">
          <section className="glass-card p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <PenTool className="w-5 h-5 text-primary-400" />
              New Reflection
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-primary-500 transition-colors"
                placeholder="Entry Title"
                value={newEntry.title}
                onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
              />
              <textarea
                required
                rows={6}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-primary-500 transition-colors resize-none"
                placeholder="What's on your mind? Be honest, be you..."
                value={newEntry.content}
                onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Analyzing...' : 'Save Reflection'}
              </button>
            </form>
          </section>
        </div>

        {/* Entries List */}
        <div className="md:col-span-7 space-y-4">
          <h2 className="text-xl font-bold mb-4">Past Reflections</h2>
          {entries.length > 0 ? (
            entries.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card p-6 border-l-4 border-primary-500/30 hover:border-primary-400 transition-all group"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold">{entry.title}</h3>
                  <button 
                    onClick={() => deleteEntry(entry.id)}
                    className="p-2 opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-white/60 text-sm mb-4 line-clamp-3 leading-relaxed">
                  {entry.content}
                </p>
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-white/30">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    {new Date(entry.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Heart className={`w-3 h-3 ${entry.sentiment_score > 0 ? 'text-green-400' : 'text-red-400'}`} />
                      {entry.detected_mood}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="glass-card p-12 text-center text-white/20 italic">
              Your reflective journey hasn't started yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Journal;
