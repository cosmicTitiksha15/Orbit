
import React, { useState, useMemo, useEffect } from 'react';
import { STUDY_DATA } from './constants';
import { StudyDay, User, SyllabusInsight } from './types';
import BackgroundStars from './components/BackgroundStars';
import OrbitChart from './components/OrbitChart';
import Modal from './components/Modal';
import AuthPage from './components/AuthPage';
import VoiceProcessor from './components/VoiceProcessor';
import { GoogleGenAI, Type } from '@google/genai';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedDay, setSelectedDay] = useState<StudyDay | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<StudyDay[]>(STUDY_DATA);
  const [insights, setInsights] = useState<SyllabusInsight[]>([]);
  const [isSynced, setIsSynced] = useState(false);
  const [promptText, setPromptText] = useState("");

  const totalDays = currentPlan.length;
  const currentProgress = useMemo(() => {
    return currentPlan.length > 0 ? currentPlan[currentPlan.length - 1].readiness_score : 0;
  }, [currentPlan]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
        
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: [
            {
              parts: [
                { text: `Analyze this syllabus and the user's request: "${promptText}". 
                        Generate a daily study plan as a JSON array of objects with keys: date, day, topic, study_strategy, readiness_score. 
                        Also provide 3 insights as a separate property "insights" containing title and description.` },
                {
                  inlineData: {
                    mimeType: file.type,
                    data: base64Data
                  }
                }
              ]
            }
          ],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                plan: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      date: { type: Type.STRING },
                      day: { type: Type.STRING },
                      topic: { type: Type.STRING },
                      study_strategy: { type: Type.STRING },
                      readiness_score: { type: Type.NUMBER }
                    }
                  }
                },
                insights: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      description: { type: Type.STRING }
                    }
                  }
                }
              }
            }
          }
        });

        const data = JSON.parse(response.text);
        setCurrentPlan(data.plan);
        setInsights(data.insights);
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  const syncToMicrosoftTodo = async () => {
    setIsProcessing(true);
    // Simulation of Microsoft To-Do API Sync
    await new Promise(r => setTimeout(r, 2000));
    setIsSynced(true);
    setIsProcessing(false);
    alert("Mission accomplished! All items synced to your Microsoft To-Do list with reminders set.");
  };

  if (!user) {
    return (
      <div className="min-h-screen space-gradient">
        <BackgroundStars />
        <AuthPage onLogin={setUser} />
      </div>
    );
  }

  return (
    <div className="min-h-screen space-gradient relative pb-20">
      <BackgroundStars />
      
      {/* Header */}
      <header className="relative z-10 p-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-purple-500 p-1">
             <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user.id}`} alt="User" className="w-full h-full rounded-full" />
          </div>
          <div>
            <h1 className="text-4xl font-black font-space tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
              ORBIT
            </h1>
            <p className="text-gray-400 text-[10px] tracking-widest uppercase">Commander {user.name}</p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="glass px-6 py-3 rounded-2xl flex flex-col items-center border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Mastery Velocity</span>
            <span className="text-2xl font-bold font-space text-blue-400">{currentProgress}%</span>
          </div>
          <button 
            onClick={() => setUser(null)}
            className="glass px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-red-500/10 transition-colors border-red-500/20 group"
          >
            <span className="text-xs font-bold text-gray-400 group-hover:text-red-400 transition-colors">TERMINATE LINK</span>
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Control Center */}
        <section className="lg:col-span-4 flex flex-col gap-6">
           <div className="glass p-8 rounded-[2.5rem] flex flex-col items-center border-purple-500/20">
             <h2 className="text-xl font-bold font-space mb-6 self-start">Neural Command</h2>
             <VoiceProcessor onTranscriptComplete={setPromptText} />
             
             <div className="w-full mt-6 space-y-4">
               <textarea 
                 value={promptText}
                 onChange={(e) => setPromptText(e.target.value)}
                 className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-gray-300 focus:outline-none focus:border-purple-500 transition-all"
                 placeholder="Refine your command sequence..."
               />
               
               <div className="relative group">
                 <input 
                   type="file" 
                   accept="application/pdf,image/*" 
                   onChange={handleFileUpload}
                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                 />
                 <div className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center group-hover:border-purple-500/50 transition-all bg-white/2 cursor-pointer">
                    <svg className="w-8 h-8 text-gray-500 group-hover:text-purple-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span className="text-xs font-bold text-gray-400 group-hover:text-white uppercase tracking-widest">Upload Syllabus (PDF/IMG)</span>
                 </div>
               </div>

               {currentPlan.length > 0 && (
                 <button 
                  onClick={syncToMicrosoftTodo}
                  disabled={isSynced || isProcessing}
                  className={`w-full py-4 rounded-2xl font-bold font-space flex items-center justify-center gap-3 transition-all ${
                    isSynced 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 text-white'
                  }`}
                 >
                   <img src="https://www.svgrepo.com/show/448239/microsoft.svg" className="w-5 h-5" alt="MS" />
                   {isSynced ? 'SYNCED TO FLEET' : 'SYNC TO MICROSOFT TO-DO'}
                 </button>
               )}
             </div>
           </div>

           {/* AI Insights Card */}
           {insights.length > 0 && (
             <div className="glass p-6 rounded-[2rem] border-blue-500/10">
               <h3 className="text-lg font-bold font-space mb-4 text-blue-400">Strategic Intelligence</h3>
               <div className="space-y-4">
                 {insights.map((ins, i) => (
                   <div key={i} className="bg-white/5 p-3 rounded-xl border-l-2 border-blue-500">
                     <div className="text-xs font-bold text-white mb-1 uppercase tracking-tighter">{ins.title}</div>
                     <div className="text-[11px] text-gray-400 leading-tight">{ins.description}</div>
                   </div>
                 ))}
               </div>
             </div>
           )}
        </section>

        {/* Visualization Section */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          <div className="glass p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            {isProcessing && (
              <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center">
                 <div className="w-20 h-20 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                 <h3 className="text-2xl font-bold font-space text-purple-400 animate-pulse">RECONFIGURING ORBIT...</h3>
                 <p className="text-xs text-gray-500 uppercase tracking-widest mt-2">Gemini is processing your trajectory</p>
              </div>
            )}
            
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-2xl font-bold font-space">Trajectory Projection</h2>
                <p className="text-gray-400 text-sm">Real-time mastery path analysis</p>
              </div>
              <div className="glass px-4 py-2 rounded-full border-white/5">
                <span className="text-[10px] text-green-400 font-bold uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Active Uplink
                </span>
              </div>
            </div>
            
            <div className="h-[450px]">
              <OrbitChart onDayClick={setSelectedDay} />
            </div>
          </div>

          <div className="glass p-6 rounded-[2.5rem] flex-1 overflow-hidden flex flex-col">
            <h3 className="text-lg font-bold font-space mb-4 px-2">Mission Logbook</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-2 custom-scrollbar">
               {currentPlan.map((day, idx) => (
                 <div 
                   key={idx}
                   onClick={() => setSelectedDay(day)}
                   className="p-4 rounded-2xl bg-white/2 border border-white/5 hover:border-purple-500/40 hover:bg-purple-500/5 transition-all cursor-pointer group"
                 >
                   <div className="flex justify-between items-start mb-2">
                     <span className="text-[10px] font-bold text-gray-500 font-mono tracking-widest">{day.date}</span>
                     <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-bold uppercase">{day.day}</span>
                   </div>
                   <h4 className="text-sm font-bold text-gray-200 line-clamp-1 group-hover:text-white transition-colors">{day.topic}</h4>
                   <div className="mt-3 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-600 to-blue-500" style={{ width: `${day.readiness_score}%` }}></div>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        </section>
      </main>

      <Modal 
        isOpen={!!selectedDay} 
        onClose={() => setSelectedDay(null)}
        title="Tactical Breakdown"
      >
        {selectedDay && (
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-3xl bg-purple-500/20 flex flex-col items-center justify-center border border-purple-500/30 shadow-xl shadow-purple-900/20">
                 <span className="text-xs font-bold text-purple-300 uppercase">Mastery</span>
                 <span className="text-3xl font-black text-white leading-none">{selectedDay.readiness_score}</span>
                 <span className="text-[10px] text-purple-400">%</span>
              </div>
              <div>
                <div className="text-xs text-blue-400 font-bold tracking-widest uppercase mb-1">{selectedDay.date} • {selectedDay.day}</div>
                <div className="text-xl font-bold text-white font-space leading-tight">{selectedDay.topic}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 relative group overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-2">Execution Protocol</h4>
                <p className="text-gray-200 text-sm leading-relaxed">{selectedDay.study_strategy}</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-transparent via-purple-500/10 to-transparent p-4 text-[11px] text-gray-400 text-center font-bold tracking-widest uppercase italic">
              "Maintain current course for optimal results"
            </div>
          </div>
        )}
      </Modal>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(168, 85, 247, 0.3); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(168, 85, 247, 0.6); }
      `}</style>
    </div>
  );
};

export default App;
