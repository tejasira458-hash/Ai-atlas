
import React, { useState, useRef, useEffect } from 'react';
import { GradeLevel, TutorState, FileData, HistoryItem } from './types';
import GradeSelector from './components/GradeSelector';
import MarkdownRenderer from './components/MarkdownRenderer';
import HistoryPanel from './components/HistoryPanel';
import AboutSection from './components/AboutSection';
import { getTutorExplanationStream } from './services/gemini';

const STORAGE_KEY = 'ai_atlas_history_v1';

const App: React.FC = () => {
  const [state, setState] = useState<TutorState>({
    isLoading: false,
    error: null,
    explanation: null,
    grade: '3rd Grade',
    subject: '',
    history: [],
    showHistory: false,
  });

  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState(prev => ({ ...prev, history: parsed }));
      } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.history));
  }, [state.history]);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1024;
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height = (MAX_WIDTH / width) * height;
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8).split(',')[1]);
        };
      };
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const compressedBase64 = await compressImage(file);
        setSelectedFile({ data: compressedBase64, mimeType: 'image/jpeg', name: file.name });
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1];
          setSelectedFile({ data: base64String, mimeType: file.type, name: file.name });
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleAsk = async () => {
    if (!inputText.trim() && !selectedFile) {
      setState(prev => ({ ...prev, error: "What would you like to explore today?" }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null, explanation: '' }));

    try {
      const finalExplanation = await getTutorExplanationStream(
        inputText,
        state.grade,
        state.subject,
        selectedFile,
        (chunk) => {
          setState(prev => ({ ...prev, explanation: chunk, isLoading: false }));
        }
      );

      if (finalExplanation && finalExplanation.trim() !== "This is not the standard topic.") {
        const newItem: HistoryItem = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          grade: state.grade,
          subject: state.subject,
          query: inputText || selectedFile?.name || "New Lesson",
          explanation: finalExplanation
        };
        setState(prev => ({ ...prev, history: [...prev.history, newItem] }));
      }
    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message, isLoading: false, explanation: null }));
    }
  };

  const reset = () => {
    setInputText('');
    setSelectedFile(null);
    setState(prev => ({ ...prev, explanation: null, error: null, subject: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isNotStandardTopic = state.explanation?.trim() === "This is not the standard topic.";

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <HistoryPanel 
        history={state.history} 
        onSelectItem={(item) => {
          setState(prev => ({ ...prev, explanation: item.explanation, grade: item.grade, subject: item.subject, showHistory: false, error: null }));
          setInputText(item.query);
        }} 
        isOpen={state.showHistory}
        onClose={() => setState(prev => ({ ...prev, showHistory: false }))}
      />

      <main className="flex-1 overflow-x-hidden">
        <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex justify-between items-center shadow-sm">
          <button onClick={() => setState(prev => ({ ...prev, showHistory: true }))} className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 font-black uppercase text-xs tracking-widest">
            <i className="fas fa-bars-staggered text-xl"></i>
            <span className="hidden md:inline">History</span>
          </button>
          <div onClick={reset} className="flex items-center space-x-2 cursor-pointer group">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
              <i className="fas fa-map-location-dot"></i>
            </div>
            <span className="text-2xl font-black text-slate-800 tracking-tighter">AI ATLAS</span>
          </div>
          <button onClick={reset} className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-black text-sm hover:bg-blue-100 transition-colors">Start Fresh</button>
        </nav>

        <div className="max-w-4xl mx-auto px-6 pt-12">
          {!state.explanation && !state.isLoading && (
            <div className="space-y-12 animate-fadeIn">
              <div className="text-center mb-16">
                <h1 className="text-5xl md:text-7xl font-black text-slate-800 mb-6 tracking-tight">
                  Learning has no <br/> 
                  <span className="text-blue-600 relative inline-block">
                    borders.
                    <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 100 8" preserveAspectRatio="none">
                      <path d="M0 5 Q 50 0 100 5" stroke="#facc15" strokeWidth="8" fill="none" strokeLinecap="round" />
                    </svg>
                  </span>
                </h1>
                <p className="text-xl text-slate-500 font-medium max-w-lg mx-auto">Snap a photo and let's explore together!</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-8 space-y-6">
                  <section className="bg-white rounded-[2.5rem] shadow-xl p-8 border-4 border-yellow-50 relative">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-black text-slate-800 flex items-center">
                        <span className="w-10 h-10 bg-yellow-100 rounded-2xl flex items-center justify-center mr-3 text-lg text-yellow-600"><i className="fas fa-comment"></i></span>
                        Ask ATLAS
                      </h3>
                      <label className="cursor-pointer bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-black uppercase hover:bg-blue-100 transition-all flex items-center">
                        <i className="fas fa-file-pdf mr-2"></i>
                        {selectedFile ? 'Change File' : 'Add File'}
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf" onChange={handleFileUpload} />
                      </label>
                    </div>
                    <textarea className="w-full h-48 p-6 rounded-3xl border-4 border-slate-50 focus:border-blue-200 focus:ring-0 text-lg transition-all outline-none resize-none placeholder-slate-300 bg-slate-50/50 text-slate-700 font-medium" placeholder="Explain the water cycle like I'm 8 years old..." value={inputText} onChange={(e) => setInputText(e.target.value)} />
                    {selectedFile && (
                      <div className="mt-4 flex items-center p-3 bg-blue-50 rounded-2xl border-2 border-blue-100 animate-slideUp">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-500 shadow-sm mr-3"><i className={selectedFile.mimeType === 'application/pdf' ? 'fas fa-file-pdf' : 'fas fa-image'}></i></div>
                        <div className="flex-1 overflow-hidden"><p className="text-xs font-black text-slate-700 truncate">{selectedFile.name}</p></div>
                        <button onClick={() => setSelectedFile(null)} className="text-slate-300 hover:text-red-500 p-2"><i className="fas fa-trash"></i></button>
                      </div>
                    )}
                  </section>
                </div>
                <div className="md:col-span-4 space-y-6">
                   <section className="bg-white rounded-[2.5rem] shadow-xl p-8 border-4 border-blue-50">
                    <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center"><i className="fas fa-graduation-cap text-blue-500 mr-2"></i>Grade</h3>
                    <select value={state.grade} onChange={(e) => setState(prev => ({ ...prev, grade: e.target.value as GradeLevel }))} className="w-full p-4 rounded-2xl bg-slate-50 border-4 border-slate-50 font-bold text-slate-600 focus:border-blue-200 outline-none appearance-none">
                      {['1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </section>
                  <section className="bg-white rounded-[2.5rem] shadow-xl p-8 border-4 border-orange-50">
                    <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center"><i className="fas fa-book-open text-orange-500 mr-2"></i>Subject</h3>
                    <input type="text" className="w-full px-4 py-3 rounded-2xl border-4 border-slate-50 focus:border-orange-200 text-sm outline-none bg-slate-50 font-bold text-slate-600" placeholder="Science, Math..." value={state.subject} onChange={(e) => setState(prev => ({ ...prev, subject: e.target.value }))} />
                  </section>
                  <button onClick={handleAsk} disabled={state.isLoading} className={`w-full py-6 rounded-[2.5rem] bg-blue-600 text-white font-black text-xl shadow-[0_8px_0_0_#1d4ed8] hover:bg-blue-700 active:translate-y-1 transition-all flex items-center justify-center space-x-3 ${state.isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                    <i className="fas fa-compass"></i><span>Explore!</span>
                  </button>
                </div>
              </div>
              <AboutSection />
            </div>
          )}

          {state.isLoading && !state.explanation && (
            <div className="text-center py-20 animate-fadeIn">
              <div className="relative inline-block mb-12">
                <div className="text-9xl animate-pulse">🌍</div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl animate-spin-slow">✨</div>
              </div>
              <h2 className="text-4xl font-black text-slate-800 mb-3">ATLAS is Fast-Tracking Your Lesson</h2>
              <p className="text-xl text-blue-500 font-bold italic">Mapping out the coolest way to learn this...</p>
            </div>
          )}

          {state.explanation !== null && (
            <div className="relative animate-fadeIn pb-24">
              {isNotStandardTopic ? (
                <div className="bg-white rounded-[3rem] shadow-2xl p-12 border-4 border-red-100 text-center">
                  <div className="text-9xl mb-8">🧱</div>
                  <h2 className="text-5xl font-black text-slate-800 mb-6 tracking-tight">Topic Restricted</h2>
                  <p className="text-2xl text-red-600 font-black mb-8 bg-red-50 inline-block px-10 py-4 rounded-[2rem] border-4 border-red-100">"This is not the standard topic."</p>
                  <button onClick={reset} className="px-12 py-5 bg-slate-800 text-white rounded-[2rem] hover:bg-slate-900 transition-all font-black text-xl shadow-xl active:scale-95"><i className="fas fa-map-pin mr-3"></i> Try New Topic</button>
                </div>
              ) : (
                <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
                  <div className="bg-blue-600 p-8 text-white relative">
                    <div className="absolute -right-6 -bottom-6 text-9xl opacity-10">📖</div>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="flex items-center space-x-6">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-[2rem] flex items-center justify-center text-4xl shadow-inner"><i className="fas fa-mountain-sun"></i></div>
                        <div><p className="text-blue-100 text-xs font-black uppercase tracking-widest mb-1">Adventure Live!</p><h2 className="text-4xl font-black tracking-tight">Lesson Summary</h2></div>
                      </div>
                      <div className="flex space-x-2">
                        <span className="px-4 py-2 bg-white/10 rounded-xl text-xs font-black border border-white/20">{state.grade}</span>
                        {state.subject && <span className="px-4 py-2 bg-yellow-400 text-yellow-900 rounded-xl text-xs font-black">{state.subject}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="p-8 md:p-16"><MarkdownRenderer content={state.explanation} /></div>
                  <div className="p-8 md:p-12 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div><h4 className="text-xl font-black text-slate-800 mb-2">Feeling like a pro?</h4><p className="text-slate-500 font-medium italic">Share your excitement!</p></div>
                    <div className="flex space-x-4">
                      {['🌎', '🧠', '🎈', '🍭'].map((emoji) => <button key={emoji} className="w-16 h-16 bg-white rounded-3xl text-4xl shadow-md hover:-translate-y-2 transition-all flex items-center justify-center border-2 border-slate-50">{emoji}</button>)}
                    </div>
                  </div>
                  <div className="p-6 flex justify-center border-t border-slate-100">
                    <button onClick={reset} className="text-blue-600 font-black uppercase text-xs tracking-widest hover:bg-blue-50 px-8 py-4 rounded-2xl transition-all"><i className="fas fa-plus-circle mr-2"></i> Start Next Discovery</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <footer className="mt-20 border-t border-slate-100 bg-white py-16 px-6">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
            <div className="flex items-center space-x-2 grayscale opacity-50"><div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-white"><i className="fas fa-map-location-dot text-xs"></i></div><span className="text-lg font-black text-slate-800 tracking-tighter">AI ATLAS</span></div>
            <p className="text-slate-400 font-bold text-sm">© 2025 ATLAS Learning Global. Your safety is our mission.</p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
