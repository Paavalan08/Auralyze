import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
          Understand the Emotion <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-600">
            Behind the Sound.
          </span>
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-slate-600 mb-10">
          Auralyze is a multimodal AI platform that analyzes audio frequencies, linguistic sentiment, and visual music sheets to map complex human emotions.
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
            <h3 className="text-xl font-bold text-slate-900 mb-3">Audio CRNN Engine</h3>
            <p className="text-slate-600 leading-relaxed">
              Upload MP3 or WAV files. Our Convolutional Recurrent Neural Network tracks rhythmic patterns over time to classify genre and mood.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
              <span className="text-2xl">📝</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">NLP BiLSTM Analysis</h3>
            <p className="text-slate-600 leading-relaxed">
              Upload text or lyrics. Our State-of-the-Art Bidirectional LSTM detects 28 distinct psychological states and emotions.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
              <span className="text-2xl">👁️</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Zero-Shot Vision</h3>
            <p className="text-slate-600 leading-relaxed">
              Upload images. Our integrated CLIP architecture visually scans for sheet music, instruments, and live concert environments.
            </p>
          </div>

        </div>
      </section>
      
    </div>
  );
}

export default Home;