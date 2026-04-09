import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
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
      <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[60vh] animate-in fade-in duration-500">
        <div className="bg-surface border border-border p-xl rounded-xl shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center text-center w-full ">
          <div className="w-16 h-16 bg-info/10 text-info rounded-full flex items-center justify-center mb-md">
            <span className="material-symbols-rounded text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>monitoring</span>
          </div>
          <h3 className="text-2xl font-bold text-text mb-2">Track Your Progress</h3>
          <p className="text-text-muted mb-lg">Create an account to see your focus score, daily study trends, and Pomodoro statistics.</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3 bg-primary-500 text-white font-bold rounded-lg hover:bg-primary-600 transition-colors shadow-sm shadow-primary-500/20"
          >
            Sign In to View Analytics
          </button>
        </div>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="material-symbols-rounded animate-spin text-primary-500 text-4xl">refresh</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-lg animate-in fade-in slide-in-from-bottom-4 duration-500 pb-xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-lg border-b border-border pb-md gap-4">
        <div className="flex flex-col gap-xs">
          <p className="text-sm font-semibold uppercase tracking-wider text-text-muted">Performance Metrics</p>
          <h2 className="text-4xl font-extrabold text-text tracking-tight">Focus Analytics</h2>
        </div>

        {/* Time Tabs */}
        <div className="flex bg-surface p-1 rounded-lg border border-border shadow-sm w-full md:w-auto">
          <button className="flex-1 md:flex-auto px-4 py-1.5 text-sm font-bold bg-bg text-text rounded-md shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-border">7 Days</button>
          <button className="flex-1 md:flex-auto px-4 py-1.5 text-sm font-medium text-text-muted hover:text-text transition-colors">30 Days</button>
          <button className="flex-1 md:flex-auto px-4 py-1.5 text-sm font-medium text-text-muted hover:text-text transition-colors">Lifetime</button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
        <div className="bg-surface border border-border p-lg rounded-xl shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] hover:border-primary-300 transition-colors">
          <div className="flex justify-between items-start mb-md">
            <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-500 flex items-center justify-center">
              <span className="material-symbols-rounded" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
            </div>
            <span className="text-xs font-bold px-2 py-1 bg-success/10 text-success rounded-md">+12%</span>
          </div>
          <p className="text-text-muted text-sm font-medium">Total Study Time</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-black text-text">{data.metrics.totalTimeHrs}</span>
            <span className="text-text-muted font-bold">hrs</span>
          </div>
        </div>

        <div className="bg-surface border border-border p-lg rounded-xl shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] hover:border-info/30 transition-colors">
          <div className="flex justify-between items-start mb-md">
            <div className="w-10 h-10 rounded-lg bg-info/10 text-info flex items-center justify-center">
              <span className="material-symbols-rounded" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
            </div>
            <span className="text-xs font-bold px-2 py-1 bg-error/10 text-error rounded-md">-2%</span>
          </div>
          <p className="text-text-muted text-sm font-medium">Total Sessions</p>
          <div className="mt-1">
            <span className="text-3xl font-black text-text">{data.metrics.totalSessions}</span>
          </div>
        </div>

        <div className="bg-surface border border-border p-lg rounded-xl shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] hover:border-warning/30 transition-colors">
          <div className="flex justify-between items-start mb-md">
            <div className="w-10 h-10 rounded-lg bg-warning/10 text-warning flex items-center justify-center">
              <span className="material-symbols-rounded" style={{ fontVariationSettings: "'FILL' 1" }}>pulse</span>
            </div>
            <span className="text-xs font-bold px-2 py-1 bg-success/10 text-success rounded-md">+5%</span>
          </div>
          <p className="text-text-muted text-sm font-medium">Avg Session</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-black text-text">{data.metrics.avgSessionMin}</span>
            <span className="text-text-muted font-bold">min</span>
          </div>
        </div>
      </div>

      {/* Charts Box */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        {/* Daily Time Chart */}
        <div className="bg-surface border border-border p-xl rounded-xl shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-end mb-xl">
            <div>
              <h3 className="text-xl font-bold text-text">Daily Study Time</h3>
              <p className="text-text-muted text-sm">Time allocation across the current week</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary-500 shadow-[0_0_8px_var(--primary-500)]"></div>
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Active Hours</span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.dailyTime} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <Bar
                  dataKey="minutes"
                  fill="var(--color-primary-500)"
                  radius={[6, 6, 6, 6]}
                  barSize={32}
                >
                  {data.dailyTime.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.minutes > 60 ? 'var(--color-primary-700)' : 'var(--color-primary-500)'} />
                  ))}
                </Bar>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fontWeight: 'bold', fill: 'var(--color-text-muted)' }}
                  dy={10}
                />
                <YAxis hide />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Focus Score Chart */}
        <div className="bg-surface border border-border p-xl rounded-xl shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] flex flex-col">
          <div className="mb-xl">
            <h3 className="text-xl font-bold text-text">Focus Score Trend</h3>
            <p className="text-text-muted text-sm">Cognitive efficiency rating</p>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.focusTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="var(--color-primary-500)"
                  strokeWidth={4}
                  dot={{ r: 5, fill: 'var(--color-primary-500)', strokeWidth: 3, stroke: 'var(--color-surface)' }}
                  activeDot={{ r: 7, fill: 'var(--color-primary-600)' }}
                />
                <XAxis hide />
                <YAxis hide domain={[0, 120]} />
                <Tooltip
                  cursor={{ stroke: 'var(--color-border)', strokeWidth: 1, strokeDasharray: '4 4' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-surface border border-border p-2 rounded-lg shadow-lg font-bold text-text">
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

          <div className="grid grid-cols-3 gap-4 mt-auto pt-md border-t border-border">
            <div>
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Lowest</p>
              <p className="text-xl font-black text-text">62%</p>
            </div>
            <div>
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Highest</p>
              <p className="text-xl font-black text-primary-500">98%</p>
            </div>
            <div>
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Average</p>
              <p className="text-xl font-black text-text">84%</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI-Powered Smart Insights Section */}
      <div className="bg-surface border-2 border-primary-500/10 p-10 rounded-[40px] shadow-premium flex flex-col md:flex-row gap-10 items-center relative overflow-hidden group hover:border-primary-500 transition-all duration-500">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary-500/5 blur-[100px] rounded-full pointer-events-none group-hover:bg-primary-500/10 transition-colors"></div>
        <div className="absolute left-0 top-0 w-2 h-full bg-primary-500"></div>

        <div className="relative w-40 h-40 flex-shrink-0 animate-float">
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90 filter drop-shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <circle cx="50" cy="50" r="45" fill="none" className="stroke-bg" strokeWidth="10" />
            <circle cx="50" cy="50" r="45" fill="none" className="stroke-primary-500 transition-all duration-1000 ease-out" strokeWidth="10" strokeDasharray={283} strokeDashoffset={283 - (283 * (data?.metrics?.avgSessionMin > 30 ? 88 : 74)) / 100} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-text tracking-tighter">
              {data?.metrics?.avgSessionMin > 30 ? '88' : '74'}<span className="text-sm font-bold">%</span>
            </span>
            <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Efficiency</span>
          </div>
        </div>

        <div className="text-center md:text-left z-10 flex-1">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
             <span className="px-3 py-1 bg-primary-500/10 text-primary-500 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse"></span>
               AI Generated Insight
             </span>
          </div>
          <h3 className="text-2xl lg:text-3xl font-black text-text mb-3 tracking-tight">
            {data?.metrics?.totalSessions > 5 ? "You're a Morning Maven 🌅" : "Consistency is Key 🗝️"}
          </h3>
          <p className="text-text-muted leading-relaxed max-w-2xl text-md font-bold">
            Based on your last <span className="text-text font-black">{data?.metrics?.totalSessions} sessions</span>, your focus peaks when you work for <span className="text-text font-black px-1.5 py-0.5 bg-bg border border-border/60 rounded-md">{data?.metrics?.avgSessionMin} mins</span> at a time. 
            Keep this rhythm to boost your weekly productivity by <span className="text-primary-500 font-black">12.5%</span>.
          </p>
          <div className="flex items-center gap-4 mt-8 justify-center md:justify-start">
            <button className="px-8 py-3 bg-text text-bg font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary-500/10 text-sm tracking-tight">
              Optimize My Schedule
            </button>
            <button className="px-8 py-3 bg-transparent text-text-muted hover:text-text font-black rounded-2xl transition-all text-sm">
              View full report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
