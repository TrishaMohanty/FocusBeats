import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function MusicPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black text-on-surface">Focus Sounds</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder cards for music tracks */}
        <div className="bg-surface rounded-3xl p-6 border border-outline hover:border-primary/20 transition-all group">
           <div className="aspect-square bg-surface-low rounded-2xl mb-4 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-6xl">graphic_eq</span>
           </div>
           <h3 className="font-bold text-lg">Lo-fi Study Beats</h3>
           <p className="text-on-surface-muted text-sm mb-4">Deep focus & ambient background noise.</p>
           <button className="w-full py-3 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl font-bold flex items-center justify-center gap-2">
             <span className="material-symbols-outlined">play_arrow</span> Play
           </button>
        </div>

        <div className="bg-surface rounded-3xl p-6 border border-outline hover:border-primary/20 transition-all group">
           <div className="aspect-square bg-surface-low rounded-2xl mb-4 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-6xl">waves</span>
           </div>
           <h3 className="font-bold text-lg">Ocean Waves</h3>
           <p className="text-on-surface-muted text-sm mb-4">Nature sounds for reading and writing.</p>
           <button className="w-full py-3 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl font-bold flex items-center justify-center gap-2">
             <span className="material-symbols-outlined">play_arrow</span> Play
           </button>
        </div>
      </div>
      
      {!user && (
         <div className="mt-8 text-center text-on-surface-muted">
           <p>Log in to save your favorite tracks and create custom playlists.</p>
         </div>
      )}
    </>
  );
}
