import { useState } from 'react';

export function SettingsPage() {
  const [sidebarMode, setSidebarMode] = useState<'fixed' | 'auto-hide'>(() => {
    return (localStorage.getItem('sidebar_mode') as 'fixed' | 'auto-hide') || 'fixed';
  });

  const [notifications, setNotifications] = useState(true);

  const handleModeChange = (mode: 'fixed' | 'auto-hide') => {
    setSidebarMode(mode);
    localStorage.setItem('sidebar_mode', mode);
    // Dispatch a storage event so MainLayout (in same tab) can pick it up if it was listening
    window.dispatchEvent(new Event('sidebarModeChange'));
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-xs mb-12">
        <p className="text-sm font-semibold uppercase tracking-wider text-text-muted">Preferences</p>
        <h2 className="text-4xl font-extrabold text-text tracking-tight">Settings</h2>
        <p className="text-lg text-text-muted">Tailor FocusBeats to your workflow.</p>
      </div>

      <div className="space-y-8">
        {/* Interface Section */}
        <section className="bg-surface border border-border rounded-[32px] overflow-hidden shadow-sm">
          <div className="p-8 border-b border-border bg-bg/30">
            <h3 className="text-xl font-black text-text flex items-center gap-3">
              <span className="material-symbols-rounded text-primary-500">desktop_windows</span>
              Interface & Layout
            </h3>
          </div>

          <div className="p-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="">
                <h4 className="text-md font-bold text-text mb-1">Sidebar Interaction</h4>
                <p className="text-sm text-text-muted leading-relaxed">Choose how the sidebar behaves. 'Auto-hide' maximizes your focus area by hiding the sidebar until you hover.</p>
              </div>

              <div className="flex p-1 bg-bg border border-border rounded-2xl w-fit self-start">
                <button
                  onClick={() => handleModeChange('fixed')}
                  className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${sidebarMode === 'fixed' ? 'bg-surface text-text shadow-sm' : 'text-text-muted hover:text-text'}`}
                >
                  Fixed
                </button>
                <button
                  onClick={() => handleModeChange('auto-hide')}
                  className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${sidebarMode === 'auto-hide' ? 'bg-surface text-text shadow-sm' : 'text-text-muted hover:text-text'}`}
                >
                  Auto-hide
                </button>
              </div>
            </div>

            <div className="h-px bg-border/60"></div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-md font-bold text-text mb-1">Focus Mode Animations</h4>
                <p className="text-sm text-text-muted leading-relaxed">Enable smooth breathing effects and reactive glows during sessions.</p>
              </div>
              <button
                className="w-14 h-8 bg-primary-500 rounded-full relative transition-all shadow-inner"
                onClick={() => { }}
              >
                <div className="absolute right-1 top-1 w-6 h-6 bg-white rounded-full shadow-md"></div>
              </button>
            </div>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="bg-surface border border-border rounded-[32px] overflow-hidden shadow-sm">
          <div className="p-8 border-b border-border bg-bg/30">
            <h3 className="text-xl font-black text-text flex items-center gap-3">
              <span className="material-symbols-rounded text-primary-500">notifications_active</span>
              Notifications
            </h3>
          </div>

          <div className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-md font-bold text-text mb-1">Session Completion Toasts</h4>
                <p className="text-sm text-text-muted leading-relaxed">Show a celebration alert when you finish a focus session.</p>
              </div>
              <button
                className={`w-14 h-8 rounded-full relative transition-all shadow-inner ${notifications ? 'bg-primary-500' : 'bg-bg'}`}
                onClick={() => setNotifications(!notifications)}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${notifications ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-error/5 border border-error/20 rounded-[32px] overflow-hidden">
          <div className="p-8">
            <h3 className="text-lg font-black text-error mb-1">Data Management</h3>
            <p className="text-sm text-error/60 font-bold mb-6">Permanently delete your local focus profile and clear all history.</p>
            <button className="px-6 py-3 bg-error text-white font-black rounded-2xl hover:bg-error-600 transition-all text-sm shadow-lg shadow-error/20">
              Reset Focus History
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
