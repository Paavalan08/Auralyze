import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
          Discover the Emotion <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-600">
            Behind the Music.
          </span>
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-slate-600 mb-10">
          Auralyze is your personal AI music expert. Upload a song, paste your favorite lyrics, or drop in a concert photo to instantly uncover the deep moods, genres, and hidden meanings.
        </p>
        
        <div className="flex justify-center gap-4">
          <Link to="/register" className="px-8 py-3 text-base font-bold text-white bg-sky-500 rounded-xl shadow-lg shadow-sky-500/30 hover:bg-sky-600 hover:-translate-y-0.5 transition-all">
            Start Analyzing Now
          </Link>
          <Link to="/login" className="px-8 py-3 text-base font-bold text-slate-700 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition-all">
            View Dashboard
          </Link>
        </div>
      </main>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-6">
              <span className="text-2xl">🎵</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Audio Analysis</h3>
            <p className="text-slate-600 leading-relaxed">
              Upload an audio file or paste a streaming link. Our smart AI listens to the instruments, rhythm, and beat to instantly detect the song's genre and emotional vibe.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
              <span className="text-2xl">📝</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Lyric Breakdown</h3>
            <p className="text-slate-600 leading-relaxed">
              Curious about what a song really means? Upload the lyrics and let Auralyze read between the lines to uncover the deep psychological emotions and themes hidden inside.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
              <span className="text-2xl">👁️</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Visual Vibe Check</h3>
            <p className="text-slate-600 leading-relaxed">
              Music is visual, too. Drop in a photo of sheet music, a live concert, or a musical instrument, and our AI will recognize the scene and describe its musical atmosphere.
            </p>
          </div>

        </div>
      </section>
      
    </div>
  );
}

export default Home;