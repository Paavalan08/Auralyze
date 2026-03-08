function Documentation() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">AI Documentation</h1>
          <p className="mt-1 text-slate-500 font-medium">Understanding the architecture behind the Auralyze models.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 max-w-4xl">
        
        {/* AUDIO MODEL */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path></svg>
          </div>
          <span className="px-3 py-1 bg-sky-100 text-sky-700 text-xs font-bold rounded-full uppercase tracking-widest mb-4 inline-block">Audio Analysis</span>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-4">CRNN Architecture</h2>
          <p className="text-slate-600 font-medium leading-relaxed mb-6">
            The Audio Engine uses a Convolutional Recurrent Neural Network (CRNN). When you upload an audio file, Auralyze uses the `librosa` library to extract Mel-Frequency Cepstral Coefficients (MFCCs). 
            These act as a visual "fingerprint" of the audio wave. The Convolutional layers find localized patterns (like a drum beat), while the Recurrent layers (LSTMs) track how the song progresses over time, allowing it to predict the genre with high accuracy.
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold text-slate-700">
            Tech Stack: <span className="text-sky-600 font-medium">TensorFlow, Keras, Librosa, Python</span>
          </div>
        </div>

        {/* LYRICS MODEL */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
          <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full uppercase tracking-widest mb-4 inline-block">Natural Language</span>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-4">BiLSTM NLP Engine</h2>
          <p className="text-slate-600 font-medium leading-relaxed mb-6">
            The Lyrics Engine relies on a Bidirectional Long Short-Term Memory (BiLSTM) network. Unlike standard neural networks that read text only from left to right, BiLSTMs read text in both directions simultaneously. 
            This allows the AI to understand the full context of a sentence (e.g., distinguishing between "I feel blue" and "The sky is blue") to map raw lyrics to psychological emotional states.
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold text-slate-700">
            Tech Stack: <span className="text-purple-600 font-medium">Keras NLP, Tokenizer, GoEmotions Dataset</span>
          </div>
        </div>

        {/* VISION MODEL */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-5">
            <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          </div>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-widest mb-4 inline-block">Computer Vision</span>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-4">Zero-Shot CLIP Vision</h2>
          <p className="text-slate-600 font-medium leading-relaxed mb-6">
            The Image Engine utilizes OpenAI's Contrastive Language-Image Pre-training (CLIP) architecture via the HuggingFace Transformers pipeline. 
            CLIP is a "Zero-Shot" classifier, meaning it wasn't explicitly trained on a fixed set of classes. Instead, it understands the relationship between images and text, allowing Auralyze to define custom music-related labels on the fly and ask the AI to score the image against them.
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold text-slate-700">
            Tech Stack: <span className="text-emerald-600 font-medium">HuggingFace Transformers, OpenAI CLIP, PyTorch</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Documentation;