import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

export function AnalyticsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      api.get('/analytics')
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (!user) {
    return (
      <div className="p-8 bg-surface-container rounded-2xl text-center border border-outline-variant/20 shadow-sm mt-8 max-w-2xl mx-auto">
        <span className="material-symbols-outlined text-6xl text-primary mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>monitoring</span>
        <h3 className="text-xl font-bold mb-2">Track Your Progress</h3>
        <p className="text-slate-500 mb-6">Create an account to see your focus score, daily study trends, and Pomodoro statistics.</p>
        <button onClick={() => navigate('/login')} className="px-8 py-3 bg-primary text-white rounded-xl font-bold">Sign In to View Analytics</button>
      </div>
    );
  }

  if (loading || !data) {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin text-primary">
                <span className="material-symbols-outlined text-4xl">refresh</span>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-primary font-black mb-1">Performance Metrics</p>
        <h2 className="text-5xl font-black tracking-tighter text-on-surface">Focus Analytics</h2>
      </div>

      {/* Time Tabs */}
      <div className="flex gap-2 p-1 bg-surface-container-low w-fit rounded-xl">
        <button className="px-6 py-2 bg-white dark:bg-slate-800 rounded-lg text-xs font-bold shadow-sm">Last 7 Days</button>
        <button className="px-6 py-2 text-slate-400 text-xs font-bold hover:text-on-surface transition-colors">Last 30 Days</button>
        <button className="px-6 py-2 text-slate-400 text-xs font-bold hover:text-on-surface transition-colors">Lifetime</button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] shadow-[0px_12px_32px_rgba(25,28,29,0.04)] border border-outline-variant/5 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-primary-container/10 rounded-full flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
                </div>
                <span className="text-xs font-bold text-primary px-3 py-1 bg-primary/10 rounded-full">+12%</span>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-4">Total Study Time</p>
            <div className="flex items-baseline gap-1 mt-1">
                <span className="text-4xl font-black">{data.metrics.totalTimeHrs}</span>
                <span className="text-slate-400 font-bold">hrs</span>
            </div>
            {/* Background design circle */}
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-slate-50 dark:bg-slate-800/50 rounded-full -z-10"></div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] shadow-[0px_12px_32px_rgba(25,28,29,0.04)] border border-outline-variant/5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-[#ffdad6] rounded-full flex items-center justify-center text-[#ba1a1a]">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                </div>
                <span className="text-xs font-bold text-error px-3 py-1 bg-error-container/50 rounded-full">-2%</span>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-4">Total Sessions</p>
            <div className="flex items-baseline gap-1 mt-1">
                <span className="text-4xl font-black">{data.metrics.totalSessions}</span>
            </div>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-slate-50 dark:bg-slate-800/50 rounded-full -z-10"></div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] shadow-[0px_12px_32px_rgba(25,28,29,0.04)] border border-outline-variant/5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-primary-container/10 rounded-full flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>pulse</span>
                </div>
                <span className="text-xs font-bold text-primary px-3 py-1 bg-primary/10 rounded-full">+5%</span>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-4">Avg Session</p>
            <div className="flex items-baseline gap-1 mt-1">
                <span className="text-4xl font-black">{data.metrics.avgSessionMin}</span>
                <span className="text-slate-400 font-bold">min</span>
            </div>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-slate-50 dark:bg-slate-800/50 rounded-full -z-10"></div>
        </div>
      </div>

      {/* Charts Box */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-outline-variant/5">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h3 className="text-xl font-bold tracking-tight">Daily Study Time</h3>
                    <p className="text-xs text-slate-400 mt-1">Time allocation across the current week</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <span className="text-[10px] uppercase font-black text-slate-400">Active Hours</span>
                </div>
            </div>
            <div className="h-64 mt-12">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.dailyTime} margin={{top: 0, right: 0, left: -20, bottom: 0}}>
                        <Bar 
                          dataKey="minutes" 
                          fill="#10b981" 
                          radius={[10, 10, 10, 10]} 
                          barSize={32}
                        >
                            {data.dailyTime.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.minutes > 60 ? '#006c49' : '#10b981'} />
                            ))}
                        </Bar>
                        <XAxis 
                          dataKey="day" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}}
                          dy={10}
                        />
                        <YAxis hide />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-outline-variant/5">
             <div className="flex justify-between items-start mb-8">
                <div>
                    <h3 className="text-xl font-bold tracking-tight">Focus Score Trend</h3>
                    <p className="text-xs text-slate-400 mt-1">Cognitive efficiency rating</p>
                </div>
            </div>
            <div className="h-64 mt-12">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.focusTrend} margin={{top: 20, right: 20, left: -20, bottom: 0}}>
                        <Line 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#006c49" 
                          strokeWidth={4} 
                          dot={{ r: 4, fill: '#006c49', strokeWidth: 2, stroke: '#fff' }}
                          activeDot={{ r: 6 }}
                        />
                        <XAxis hide />
                        <YAxis hide domain={[0, 120]} />
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-black text-white p-2 rounded-lg text-xs font-bold shadow-xl">
                                  {payload[0].value}%
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className="flex justify-between mt-4 px-4 text-center">
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Lowest</p>
                    <p className="text-sm font-black">62%</p>
                </div>
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Highest</p>
                    <p className="text-sm font-black">98%</p>
                </div>
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Average</p>
                    <p className="text-sm font-black">84%</p>
                </div>
            </div>
        </div>
      </div>

      {/* Editorial Insight Section */}
      <div className="bg-surface-container-low p-12 rounded-[40px] flex flex-col md:flex-row items-center gap-12 border border-outline-variant/5">
         <div className="relative w-48 h-48 flex items-center justify-center">
            {/* A custom path ring matching the arrow look in mockup */}
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="#006c49" strokeWidth="8" strokeDasharray="210 283" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-black tracking-tighter">78<span className="text-xl">%</span></span>
                <span className="text-[10px] uppercase font-bold text-slate-400">Goal Progress</span>
            </div>
         </div>
         <div className="flex-1 space-y-6">
            <h3 className="text-4xl font-black tracking-tighter">Editorial Insight</h3>
            <p className="text-lg text-slate-500 leading-relaxed max-w-xl">
                Your focus peaks between <span className="text-on-surface font-bold underline decoration-primary">9:00 AM and 11:30 AM</span>. Shifting high-complexity tasks to this window could improve your efficiency by up to <span className="text-primary font-black">14.5%</span>.
            </p>
            <div className="flex gap-4">
                <button className="px-8 py-3 bg-white dark:bg-slate-800 rounded-xl font-bold text-sm shadow-sm hover:translate-y-[-2px] transition-all">Optimize Schedule</button>
                <button className="px-8 py-3 text-primary font-bold text-sm hover:underline">Dismiss Insight</button>
            </div>
         </div>
      </div>

      {/* Footer Info (Streak and Top Track) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
            <div className="bg-[#191C1D] p-8 rounded-[32px] flex justify-between items-center text-white overflow-hidden relative">
                <div className="z-10">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        </div>
                        <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400/80">Active Streak</span>
                    </div>
                    <p className="text-5xl font-black tracking-tighter">12 Days</p>
                </div>
                <span className="material-symbols-outlined text-9xl text-white/5 absolute right-4 top-1/2 -translate-y-1/2">local_fire_department</span>
            </div>
            
            <div className="bg-surface-container-low p-8 rounded-[32px] flex items-center gap-6 border border-outline-variant/5">
                <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center text-primary overflow-hidden">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBoFcfZLax3YZ4kS03vUWRYEamH-LoA9M58UCzeK0f1RGCHIZgTiopd7HfZldNjCQ7gvB4XINMmFR5Oan00vBDVY3KAVTMxFC1nxMWhSE4Dw4Py2RWZ2rrDijp0UXwUbN6E0SPdauNCDakGWfIDjeHaDalPG1B9YDJu72QoMfGzx9Ag5bYvAOaHFSsVSHU_mNAD2Wyq0KnFuCDeDv3MtXMl51wLtY2z4hzBzdjUQpw866YpbDILYTkj-CqAxOm4cK0h5Fu8WzDk8JM" alt="track" className="w-full h-full object-cover" />
                </div>
                <div>
                   <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Top Focus Track</p>
                   <h4 className="text-xl font-bold">Nordic Rain - Ambient</h4>
                   <p className="text-xs text-slate-400">Played 24 times this week</p>
                </div>
            </div>
      </div>
    </div>
  );
}
