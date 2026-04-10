import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/organisms/Navbar';
import { Button } from '../components/atoms/Button';
import { FeatureCard } from '../components/molecules/FeatureCard';
import { Logo } from '../components/atoms/Logo';
import { STYLES } from '../lib/styles';

export function HomePage() {
  const { user } = useAuth();

  // Redirect to dashboard if logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-bg overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className={`${STYLES.SECTION} pt-32 md:pt-48`}>
        <div className={`${STYLES.CONTAINER} grid grid-cols-1 lg:grid-cols-2 gap-12 items-center`}>
          <div className="flex flex-col gap-6 text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary self-center lg:self-start border border-primary/20 text-sm font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              The All-in-One Productivity Station
            </div>

            <h1 className={STYLES.H1}>
              Elevate Your Focus <br />
              <span className="text-primary italic">with Rhythm.</span>
            </h1>

            <p className={STYLES.BODY_MUTED}>
              Stop juggling apps. Combine high-fidelity focus music, smart Pomodoro timers,
              and powerful task management into a single, beautiful workspace.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-xl shadow-xl shadow-primary/20">
                  Start Focusing for Free
                </Button>
              </Link>
              <a href="#features">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto h-14 px-8 text-xl">
                  Explore Features
                </Button>
              </a>
            </div>

            <div className="mt-8 flex items-center justify-center lg:justify-start gap-4 text-sm text-text-muted">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-surface bg-gray-200" />
                ))}
              </div>
              <span>Joined by <span className="text-text font-bold">2,000+</span> focus enthusiasts</span>
            </div>
          </div>

          <div className="relative">
            {/* Background Decorative Blobs */}
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>

            <div className="relative z-10 animate-float">
              <img
                src="/assets/images/hero_illustration.png"
                alt="FocusBeats Productivity Workspace"
                className="w-full h-auto rounded-3xl shadow-2xl shadow-primary/10 border border-border/50"
              />

              {/* Glass Floating Component - Timer Snippet */}
              <div className="absolute -bottom-6 -left-6 md:-left-12 glass-card rounded-2xl p-4 shadow-xl border border-white/20 animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                    <span className="material-symbols-rounded">timer</span>
                  </div>
                  <div>
                    <div className="text-xs text-text-muted">Current Focus</div>
                    <div className="text-lg font-bold">25:00</div>
                  </div>
                </div>
              </div>

              {/* Glass Floating Component - Task Snippet */}
              <div className="absolute -top-6 -right-6 md:-right-12 glass-card rounded-2xl p-4 shadow-xl border border-white/20 animate-float" style={{ animationDelay: '2s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <span className="material-symbols-rounded">check_circle</span>
                  </div>
                  <div>
                    <div className="text-xs text-text-muted">Daily Goal</div>
                    <div className="text-sm font-bold">4/5 Tasks Done</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className={STYLES.SECTION}>
        <div className={STYLES.CONTAINER}>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className={STYLES.H2}>Everything you need <br />to stay in the zone.</h2>
            <p className="mt-4 text-text-muted">Designed for deep work, built for peak efficiency.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              title="Lo-Fi & Ambient Music"
              description="Curated high-fidelity focus music designed to block out distractions and stimulate creativity."
              icon={<span className="material-symbols-rounded">music_note</span>}
            />
            <FeatureCard
              title="Smart Pomodoro"
              description="A fully customizable focus timer with session tracking and break reminders."
              icon={<span className="material-symbols-rounded">timer</span>}
            />
            <FeatureCard
              title="Task Management"
              description="Intuitive task board to organize your deep work sessions and track daily priorities."
              icon={<span className="material-symbols-rounded">checklist</span>}
            />
            <FeatureCard
              title="Deep Analytics"
              description="Visualize your focus trends and productivity scores to optimize your workflow over time."
              icon={<span className="material-symbols-rounded">bar_chart</span>}
            />
            <FeatureCard
              title="Premium Design"
              description="A distraction-free, minimalist interface that feels as smooth as it looks."
              icon={<span className="material-symbols-rounded">auto_awesome</span>}
            />
            <FeatureCard
              title="Global Availability"
              description="Access your workspace from anywhere. Your sessions sync seamlessly across all devices."
              icon={<span className="material-symbols-rounded">cloud_sync</span>}
            />
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="bg-primary-900 text-white py-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-32 -mb-32"></div>

        <div className={`${STYLES.CONTAINER} text-center relative z-10`}>
          <h2 className={STYLES.H2 + " text-white mb-8"}>Ready to find your rhythm?</h2>
          <Link to="/register">
            <Button
              className="h-16 px-12 text-xl bg-white text-primary-900 hover:bg-white/90 shadow-2xl shadow-black/20"
            >
              Get Started for Free
            </Button>
          </Link>
          <p className="mt-6 text-primary-200 font-medium">No credit card required • Join 2,000+ users</p>
        </div>
      </section>

      {/* Mini Footer */}
      <footer className="py-12 border-t border-border bg-surface">
        <div className={`${STYLES.CONTAINER} px-6 flex flex-col md:flex-row justify-between items-center gap-8`}>
          <Logo size="sm" />
          <div className="flex gap-8 text-sm text-text-muted">
            <a href="#" className="hover:text-primary">Privacy</a>
            <a href="#" className="hover:text-primary">Terms</a>
            <a href="#" className="hover:text-primary">Twitter</a>
            <a href="#" className="hover:text-primary">GitHub</a>
          </div>
          <p className="text-sm text-text-muted">© 2026 FocusBeats. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
