import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import { 
  Trophy, BookOpen, TrendingUp, User, Clock, ChevronRight,
  GraduationCap, AlertCircle, PlusCircle, FileText,
  Lock, Award, Timer, Settings2, CheckCircle,
  PenTool, ShieldAlert, Loader2, ChevronLeft, Trash2,
  UserPlus, Search, ArrowRight, X, Key, History, UserCheck
} from 'lucide-react';

// --- 🟢 Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyCTk1csUI0HeZhZvy6dOFwmLr-YVswPACyY",
  authDomain: "math-excellence-6d2b8.firebaseapp.com",
  projectId: "math-excellence-6d2b8",
  storageBucket: "math-excellence-6d2b8.firebasestorage.app",
  messagingSenderId: "485798196973",
  appId: "1:485798196973:web:4583be003937001685bee4",
  measurementId: "G-BVR2P0EMPN"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- 🛡️ Secure PDF Viewer (পুরো বড় সিস্টেম) ---
const SecurePDFViewer = ({ fileUrl }) => {
  const [loading, setLoading] = useState(true);
  const getEmbedUrl = (url) => {
    if (!url) return "";
    if (url.includes('drive.google.com')) {
      return url.replace('/view?usp=sharing', '/preview').replace('/view', '/preview').split('/edit')[0];
    }
    return url;
  };

  return (
    <div className="w-full h-[85vh] bg-slate-100 rounded-[5rem] overflow-hidden relative border-[12px] border-slate-900 shadow-[0_60px_120px_-30px_rgba(0,0,0,0.4)] mt-12 ring-[16px] ring-white/10 transition-all duration-700">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-20">
          <Loader2 className="animate-spin text-blue-600 mb-6" size={64} />
          <p className="text-[14px] font-black text-slate-400 uppercase italic tracking-[0.6em] animate-pulse">Establishing Secure Connection...</p>
        </div>
      )}
      <iframe src={getEmbedUrl(fileUrl)} className="w-full h-full relative z-10" onLoad={() => setLoading(false)} title="Question Paper" />
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.08] rotate-[-45deg] select-none z-0">
        <h1 className="text-[15vw] font-black text-slate-900 uppercase tracking-tighter">MATH EXCELLENCE</h1>
      </div>
    </div>
  );
};

// --- App Root Controller ---
const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isExamActive, setIsExamActive] = useState(false);
  const [currentExam, setCurrentExam] = useState(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [pendingExam, setPendingExam] = useState(null);
  const [studentNameInput, setStudentNameInput] = useState('');
  
  const [teacherPin, setTeacherPin] = useState('1234567890');
  const [isTeacherAuthenticated, setIsTeacherAuthenticated] = useState(false);
  const [liveMocks, setLiveMocks] = useState([]);
  const [prevPapers, setPrevPapers] = useState([]);
  const [practiceSets, setPracticeSets] = useState([]);
  const [growthPublished, setGrowthPublished] = useState(false);
  const [students, setStudents] = useState([]);
  const [studentResults, setStudentResults] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  // --- 🔵 Firebase Persistence Engine ---
  useEffect(() => {
    const unsubLive = onSnapshot(collection(db, "liveMocks"), (s) => setLiveMocks(s.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubPrev = onSnapshot(collection(db, "prevPapers"), (s) => setPrevPapers(s.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubPrac = onSnapshot(collection(db, "practiceSets"), (s) => setPracticeSets(s.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubRes = onSnapshot(collection(db, "results"), (s) => setStudentResults(s.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubStds = onSnapshot(collection(db, "students"), (s) => setStudents(s.docs.map(d => d.data().name).sort()));
    const unsubSets = onSnapshot(doc(db, "settings", "adminConfig"), (d) => {
      if (d.exists()) { setTeacherPin(d.data().pin); setGrowthPublished(d.data().growthPublished); }
    });
    const unsubLogs = onSnapshot(query(collection(db, "logs"), orderBy("timestamp", "desc")), (s) => setActivityLogs(s.docs.map(d => ({id: d.id, ...d.data()}))));
    return () => { unsubLive(); unsubPrev(); unsubPrac(); unsubRes(); unsubStds(); unsubSets(); unsubLogs(); };
  }, []);

  const handleStartExamFlow = (title, durationSec, fileUrl) => {
    setPendingExam({ title, duration: durationSec, fileUrl });
    setShowNameModal(true);
  };

  const finalizeExamStart = async () => {
    if (!studentNameInput.trim()) return;
    const d = new Date();
    await addDoc(collection(db, "logs"), { 
      studentName: studentNameInput, examTitle: pendingExam.title, timestamp: Date.now(), 
      timeDisplay: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dateDisplay: d.toLocaleDateString()
    });
    setCurrentExam({ ...pendingExam, studentName: studentNameInput });
    setIsExamActive(true);
    setShowNameModal(false);
    setStudentNameInput('');
  };

  if (isExamActive) return <ExamInterface exam={currentExam} onFinish={() => setIsExamActive(false)} />;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 select-none text-sm flex flex-col items-center overflow-x-hidden">
      {showNameModal && (
        <div className="fixed inset-0 bg-black/95 z-[1000] flex items-center justify-center p-10 backdrop-blur-3xl">
          <div className="bg-white rounded-[6rem] p-24 max-w-md w-full text-center shadow-[0_100px_200px_-40px_rgba(0,0,0,0.6)] border-[16px] border-slate-50 ring-8 ring-white animate-in zoom-in duration-700">
            <div className="w-32 h-32 bg-blue-50 rounded-[4rem] flex items-center justify-center text-blue-600 mx-auto mb-14 shadow-inner ring-[12px] ring-blue-50/50"><User size={64} /></div>
            <h3 className="font-black text-slate-800 uppercase text-[18px] mb-14 tracking-[0.4em] italic underline decoration-blue-200 underline-offset-[20px] decoration-[10px]">Verification</h3>
            <input autoFocus type="text" value={studentNameInput} onChange={(e) => setStudentNameInput(e.target.value)} className="w-full p-8 rounded-[3rem] border-8 border-slate-100 font-black text-3xl uppercase outline-none focus:border-blue-500 mb-14 text-center shadow-3xl transition-all tracking-tighter" placeholder="FULL NAME" />
            <div className="flex gap-8">
              <button onClick={() => setShowNameModal(false)} className="flex-1 py-7 rounded-[2rem] bg-slate-100 text-slate-500 font-black text-[14px] uppercase tracking-widest active:scale-95 transition-all">Cancel</button>
              <button onClick={finalizeExamStart} className="flex-1 py-7 rounded-[2rem] bg-blue-700 text-white font-black text-[14px] uppercase shadow-[0_40px_80px_-20px_rgba(29,78,216,0.4)] active:scale-95 transition-all">Start Session</button>
            </div>
          </div>
        </div>
      )}
      
      <header className="bg-white border-b-[12px] border-slate-50 sticky top-0 z-50 shadow-2xl px-16 py-8 flex justify-between items-center w-full max-w-6xl">
        <div onClick={() => setActiveTab('home')} className="cursor-pointer group flex flex-col">
          <h1 className="text-4xl md:text-6xl font-black text-blue-700 uppercase italic tracking-tighter leading-none transition-transform group-active:scale-95">MATH EXCELLENCE</h1>
          <p className="text-[12px] font-black text-slate-400 opacity-80 mt-4 tracking-[0.6em] uppercase italic">Academic Command Center • Anshu Sir</p>
        </div>
        <div className="hidden xl:block shadow-3xl rounded-full p-3 ring-8 ring-blue-50"><span className="bg-blue-700 text-white px-14 py-5 rounded-full font-black text-[14px] uppercase tracking-[0.4em] shadow-inner">BUILD YOUR FUTURE WITH ANSHU SIR</span></div>
      </header>

      <nav className="bg-blue-700 text-white sticky top-[130px] md:top-[164px] z-40 w-full flex justify-center shadow-[0_40px_100px_-20px_rgba(29,78,216,0.7)] border-t-2 border-blue-600/50">
        <div className="max-w-6xl w-full flex overflow-x-auto no-scrollbar">
          {[
            { id: 'live', label: 'Live Mock', icon: <Clock size={24} /> },
            { id: 'practice', label: 'Practice Set', icon: <BookOpen size={24} /> },
            { id: 'growth', label: 'Student Growth', icon: <TrendingUp size={24} /> },
            { id: 'teacher', label: 'Teacher Zone', icon: <User size={24} /> }
          ].map((item) => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); if(item.id !== 'teacher') setIsTeacherAuthenticated(false); }} className={`flex-1 flex items-center justify-center gap-6 px-12 py-9 font-black text-[14px] md:text-[16px] uppercase tracking-[0.4em] border-b-[16px] transition-all duration-500 ${activeTab === item.id ? 'border-yellow-400 bg-blue-800 text-white shadow-inner scale-[1.05]' : 'border-transparent hover:bg-blue-600'}`}>{item.icon} {item.label}</button>
          ))}
        </div>
      </nav>

      <main className="w-full max-w-6xl p-10 md:p-20 mb-40 flex flex-col items-center">
        {activeTab === 'home' && (
          <div className="text-center space-y-24 w-full animate-in fade-in duration-1000">
            <div className="bg-white p-24 md:p-40 rounded-[8rem] shadow-[0_100px_200px_-50px_rgba(0,0,0,0.25)] border-[20px] border-slate-50 ring-4 ring-slate-100 relative overflow-hidden group">
               <div className="absolute -top-60 -right-60 w-[30rem] h-[30rem] bg-blue-50 rounded-full opacity-60 group-hover:scale-125 transition-transform duration-1000"></div>
               <GraduationCap size={120} className="text-blue-700 mx-auto mb-14 relative z-10 animate-bounce-slow shadow-blue-100" />
               <h2 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-tight relative z-10">Master <span className="text-blue-700 underline decoration-yellow-400 decoration-[20px] underline-offset-[32px] shadow-yellow-100">Maths</span></h2>
               <p className="text-slate-500 font-black text-[16px] md:text-[24px] uppercase tracking-[0.7em] mt-24 opacity-80 italic relative z-10 leading-relaxed max-w-4xl mx-auto">"Nurturing precision, logic, and pure academic success"</p>
               <button onClick={() => setActiveTab('practice')} className="mt-24 bg-blue-700 text-white px-24 py-9 rounded-[4rem] font-black text-[16px] uppercase shadow-[0_50px_100px_-20px_rgba(29,78,216,0.7)] active:scale-95 transition-all flex items-center gap-7 mx-auto relative z-10 hover:bg-blue-800 hover:shadow-blue-400">Launch Learning Hub <ChevronRight size={32}/></button>
            </div>
            
            <div className="bg-white p-16 rounded-[6rem] shadow-3xl text-left border-[24px] border-slate-50 relative overflow-hidden ring-4 ring-slate-100">
              <div className="absolute top-0 left-0 w-5 h-full bg-blue-700 shadow-xl"></div>
              <h3 className="font-black text-2xl md:text-3xl uppercase italic mb-14 flex items-center gap-7 text-slate-800 border-b-8 border-slate-50 pb-10 tracking-tighter underline decoration-slate-100 decoration-8 underline-offset-8"><History size={48} className="text-blue-600 drop-shadow-lg"/> Global Student Activity Log</h3>
              <div className="space-y-8">
                {activityLogs.length === 0 ? <p className="text-center py-40 text-[20px] font-black text-slate-200 uppercase tracking-[0.8em] italic opacity-50">Initializing surveillance sensors...</p> : 
                  activityLogs.slice(0, 8).map(log => (
                  <div key={log.id} className="p-10 bg-slate-50 rounded-[4rem] flex justify-between items-center border-l-[24px] border-blue-600 shadow-2xl ring-4 ring-white transition-all hover:translate-x-6 hover:bg-white group">
                    <div className="flex items-center gap-10">
                      <div className="w-20 h-20 bg-blue-100 rounded-[2.5rem] flex items-center justify-center text-blue-700 shadow-inner ring-[10px] ring-white group-hover:bg-blue-600 group-hover:text-white transition-all duration-500"><UserCheck size={36}/></div>
                      <div><p className="text-[24px] font-black uppercase text-slate-800 tracking-tighter italic leading-none">{log.studentName}</p><p className="text-[14px] font-bold text-slate-400 uppercase italic mt-5 tracking-[0.4em] opacity-90">{log.examTitle}</p></div>
                    </div>
                    <div className="text-right"><p className="text-[16px] font-black text-blue-700 italic uppercase bg-blue-50 px-10 py-3 rounded-full border-4 border-blue-100 shadow-xl">{log.timeDisplay}</p><p className="text-[12px] font-bold text-slate-300 uppercase mt-5 tracking-[0.5em] leading-none">{log.dateDisplay}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'live' && (
          <div className="space-y-16 w-full max-w-6xl animate-in slide-in-from-bottom-20">
            <h2 className="font-black uppercase italic text-slate-700 border-b-[14px] border-red-50 pb-8 flex items-center gap-8 text-3xl tracking-tighter underline decoration-red-100 decoration-[10px] underline-offset-[24px]"><Clock className="text-red-600 animate-pulse" size={56}/> Active Live Mock Arena</h2>
            {liveMocks.filter(m => m.isPublished).length === 0 ? <div className="py-96 text-center bg-white rounded-[8rem] border-[14px] border-dashed border-slate-100 shadow-inner"><Clock size={120} className="text-slate-100 mx-auto mb-12"/><h2 className="text-[24px] font-black text-slate-300 uppercase italic tracking-[0.6em] opacity-60">Synchronizing with Global Mock Server...</h2></div> : 
              liveMocks.filter(m => m.isPublished).map(m => (
              <div key={m.id} className="bg-white p-16 rounded-[6rem] shadow-[0_80px_160px_-40px_rgba(220,38,38,0.4)] border-[12px] border-red-50 flex flex-col lg:flex-row justify-between items-center gap-12 relative overflow-hidden ring-[32px] ring-red-50/20 group hover:border-red-400 transition-all duration-700">
                <div className="absolute top-0 right-0 bg-red-600 text-white px-16 py-4 text-[14px] font-black uppercase tracking-[0.5em] animate-pulse shadow-3xl border-b-[12px] border-l-[12px] border-red-800">ENCRYPTED LIVE SESSION</div>
                <div><h3 className="text-5xl font-black uppercase italic text-slate-800 tracking-tighter leading-none">{m.name}</h3><p className="text-[18px] font-black text-red-600 uppercase flex items-center gap-6 mt-12 tracking-[0.4em] italic bg-red-50 px-12 py-5 rounded-[2.5rem] w-fit shadow-inner ring-4 ring-white"><Timer size={32}/> Countdown: {m.hours}h {m.minutes}m</p></div>
                <button onClick={() => handleStartExamFlow(m.name, (parseInt(m.hours)||0)*3600+(parseInt(m.minutes)||0)*60, m.fileUrl)} className="bg-red-600 text-white px-24 py-9 rounded-[4rem] font-black text-[20px] uppercase shadow-[0_60px_120px_-20px_rgba(220,38,38,0.7)] active:scale-95 border-b-[20px] border-red-900 active:border-b-0 transition-all hover:bg-red-700 hover:shadow-red-500 scale-110">Launch Mission</button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'practice' && (
          <div className="space-y-32 w-full max-w-6xl animate-in fade-in duration-1000">
            <section>
              <h2 className="font-black uppercase italic text-slate-800 border-b-[16px] border-blue-50 pb-10 mb-20 flex items-center gap-10 text-4xl underline decoration-blue-700 decoration-[20px] underline-offset-[36px] tracking-tighter"><BookOpen className="text-blue-700" size={56}/> Special Curated Mock Sets</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                {practiceSets.filter(p => p.isPublished).map(p => (
                  <div key={p.id} className="bg-white p-20 rounded-[5rem] shadow-4xl border-[12px] border-white flex flex-col justify-between items-start hover:shadow-[0_80px_160px_-30px_rgba(0,0,0,0.3)] hover:-translate-y-6 transition-all group relative overflow-hidden ring-8 ring-slate-50">
                    <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-blue-50 rounded-full opacity-60 group-hover:scale-150 transition-transform duration-1000"></div>
                    <div><h3 className="font-black uppercase text-[26px] text-slate-800 tracking-tighter leading-tight italic group-hover:text-blue-700 transition-colors underline decoration-slate-100 decoration-8 underline-offset-8">{p.name}</h3><p className="text-[16px] font-black text-slate-400 uppercase italic mt-10 flex items-center gap-6 opacity-95 tracking-[0.2em] leading-none"><Timer size={32} className="text-blue-400 animate-pulse"/> {p.hours}h {p.minutes}m Module</p></div>
                    <button onClick={() => handleStartExamFlow(p.name, (parseInt(p.hours)||0)*3600+(parseInt(p.minutes)||0)*60, p.fileUrl)} className="mt-16 bg-blue-700 text-white px-16 py-7 rounded-[2.5rem] font-black text-[16px] uppercase shadow-[0_40px_80px_-15px_rgba(29,78,216,0.7)] active:scale-95 transition-all w-full md:w-fit relative z-10 hover:bg-blue-900 shadow-blue-300">Open Module</button>
                  </div>
                ))}
              </div>
            </section>
            <section>
              <h2 className="font-black uppercase italic text-slate-800 border-b-[16px] border-orange-50 pb-10 mb-20 flex items-center gap-10 text-4xl underline decoration-orange-600 decoration-[20px] underline-offset-[36px] tracking-tighter"><FileText className="text-orange-600" size={56}/> Historical Paper Repository</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                {prevPapers.filter(p => p.isPublished).map(p => (
                  <div key={p.id} className="bg-white p-20 rounded-[5rem] shadow-4xl border-[12px] border-white flex flex-col justify-between items-start hover:shadow-[0_80px_160px_-30px_rgba(0,0,0,0.3)] hover:-translate-y-6 transition-all group relative overflow-hidden ring-8 ring-slate-50">
                    <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-orange-50 rounded-full opacity-60 group-hover:scale-150 transition-transform duration-1000"></div>
                    <div><h3 className="font-black uppercase text-[26px] text-slate-800 tracking-tighter leading-tight italic group-hover:text-orange-600 transition-colors underline decoration-slate-100 decoration-8 underline-offset-8">{p.name}</h3><p className="text-[16px] font-black text-slate-400 uppercase italic mt-10 flex items-center gap-6 opacity-95 tracking-[0.2em] leading-none"><Timer size={32} className="text-orange-400 animate-pulse"/> {p.hours}h {p.minutes}m Analysis</p></div>
                    <button onClick={() => handleStartExamFlow(p.name, (parseInt(p.hours)||0)*3600+(parseInt(p.minutes)||0)*60, p.fileUrl)} className="mt-16 bg-slate-900 text-white px-16 py-7 rounded-[2.5rem] font-black text-[16px] uppercase shadow-[0_40px_80px_-15px_rgba(0,0,0,0.8)] active:scale-95 transition-all w-full md:w-fit relative z-10 hover:bg-black">Decrypt Paper</button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'teacher' && (!isTeacherAuthenticated ? 
          <div className="max-w-2xl w-full mx-auto mt-40 p-24 bg-white rounded-[8rem] shadow-[0_80px_160px_-40px_rgba(0,0,0,0.3)] border-t-[32px] border-blue-700 text-center animate-in zoom-in duration-1000 ring-[20px] ring-slate-50">
            <div className="w-40 h-40 bg-blue-50 rounded-[5rem] mx-auto flex items-center justify-center text-blue-700 shadow-inner mb-20 ring-[24px] ring-blue-50/50 shadow-2xl"><Lock size={80} /></div>
            <h2 className="text-5xl font-black uppercase italic mb-20 text-slate-800 tracking-tighter leading-none">Global Authorization</h2>
            <input type="password" onChange={(e) => { if(e.target.value === teacherPin) setIsTeacherAuthenticated(true); }} className="w-full py-10 bg-slate-50 border-[10px] border-white rounded-[4rem] outline-none focus:border-blue-500 font-black text-center text-5xl tracking-[1em] shadow-4xl shadow-blue-100/50 leading-none" placeholder="••••" />
            <p className="text-[18px] font-black text-slate-300 mt-20 uppercase tracking-[0.8em] italic opacity-60 underline decoration-slate-100 underline-offset-[16px] decoration-[10px]">Hashed Protocol Entry Only</p>
          </div> : 
          <TeacherZoneMainView 
            liveMocks={liveMocks} prevPapers={prevPapers} practiceSets={practiceSets} 
            growthPublished={growthPublished} setGrowthPublished={async (v) => await setDoc(doc(db, "settings", "adminConfig"), { growthPublished: v }, { merge: true })}
            studentResults={studentResults} students={students} teacherPin={teacherPin}
            setTeacherPin={async (v) => await setDoc(doc(db, "settings", "adminConfig"), { pin: v }, { merge: true })}
          />
        )}
      </main>
    </div>
  );
};

// --- Sub-component: Teacher Zone Manager (পুরো বড় সিস্টেম) ---
const TeacherZoneMainView = ({ liveMocks, prevPapers, practiceSets, growthPublished, setGrowthPublished, studentResults, students, teacherPin, setTeacherPin }) => {
  const [msg, setMsg] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [newRes, setNewRes] = useState({ exam: "", date: "", obtained: "", total: "" });

  const notify = (m) => { setMsg(m); setTimeout(() => setMsg(""), 2000); };
  
  const addPaper = async (type) => {
    const colls = { live: 'liveMocks', practice: 'practiceSets', prev: 'prevPapers' };
    await addDoc(collection(db, colls[type]), { 
      name: `New Cloud Assignment`, hours: 1, minutes: 0, fileUrl: "", isPublished: false 
    });
    notify("Cloud Database Sync Success!");
  };

  const updateField = async (id, type, field, value) => {
    const colls = { live: 'liveMocks', practice: 'practiceSets', prev: 'prevPapers' };
    await setDoc(doc(db, colls[type], id), { [field]: value }, { merge: true });
  };

  const deleteItem = async (id, type) => {
    if(!window.confirm("PERMANENT GLOBAL PURGE? WARNING: IRREVOCABLE.")) return;
    const colls = { live: 'liveMocks', practice: 'practiceSets', prev: 'prevPapers' };
    await deleteDoc(doc(db, colls[type], id));
    notify("Cloud Data Erased Permanently");
  };

  const PaperSection = ({ title, items, type, icon, color }) => (
    <div className="bg-white p-16 rounded-[7rem] shadow-[0_60px_120px_-30px_rgba(0,0,0,0.2)] border-t-[24px] border-slate-100 space-y-16 w-full mb-20 ring-8 ring-slate-50">
      <div className="flex justify-between items-center border-b-[12px] border-slate-50 pb-12">
        <h3 className={`font-black uppercase text-[22px] italic flex items-center gap-8 tracking-[0.3em] ${color}`}>{icon} {title} Global Administration</h3>
        <button onClick={() => addPaper(type)} className="bg-slate-100 p-8 rounded-full hover:bg-slate-200 transition-all shadow-inner text-slate-800 active:scale-90 border-[10px] border-white ring-8 ring-slate-50 shadow-2xl"><PlusCircle size={56} /></button>
      </div>
      <div className="space-y-14">
        {items.map(item => (
          <div key={item.id} className="p-14 bg-slate-50 rounded-[5rem] border-[12px] border-white shadow-2xl space-y-12 transition-all hover:shadow-4xl hover:bg-white group ring-4 ring-slate-100">
            <div className="flex flex-col xl:flex-row gap-10">
              <input type="text" value={item.name} onChange={(e) => updateField(item.id, type, 'name', e.target.value)} className="flex-1 bg-white border-[10px] border-slate-100 p-7 rounded-[3rem] font-black text-[24px] uppercase outline-none focus:border-blue-500 shadow-inner group-hover:border-blue-100 transition-all leading-none italic shadow-xl" placeholder="Official Assignment Label" />
              <div className="flex gap-7">
                <button onClick={() => updateField(item.id, type, 'isPublished', !item.isPublished)} className={`px-16 py-5 rounded-[2.5rem] text-[16px] font-black uppercase transition-all shadow-3xl border-b-[16px] active:border-b-0 min-w-[240px] leading-none ${item.isPublished ? 'bg-green-600 text-white border-green-800 shadow-green-100' : 'bg-slate-300 text-slate-600 border-slate-400'}`}>{item.isPublished ? 'PUBLISHED' : 'IN DRAFT'}</button>
                <button onClick={() => deleteItem(item.id, type)} className="text-red-400 p-7 bg-white rounded-[3rem] shadow-3xl hover:text-red-600 active:scale-90 transition-all border-[8px] border-red-50"><Trash2 size={48}/></button>
              </div>
            </div>
            <div className="flex flex-col xl:flex-row gap-10">
              <div className="flex items-center gap-10 bg-white border-[10px] border-slate-100 px-12 py-7 rounded-[3rem] shadow-inner shrink-0 group-hover:border-blue-50 transition-all ring-4 ring-slate-50">
                <Timer size={48} className="text-slate-300"/>
                <div className="flex items-center gap-6"><input type="number" value={item.hours} onChange={(e) => updateField(item.id, type, 'hours', e.target.value)} className="w-20 text-center font-black text-[32px] bg-transparent outline-none border-b-[10px] border-slate-50 leading-none" /><span className="text-[18px] font-black text-slate-400 italic tracking-[0.2em]">HRS</span></div>
                <div className="flex items-center gap-6"><input type="number" value={item.minutes} onChange={(e) => updateField(item.id, type, 'minutes', e.target.value)} className="w-20 text-center font-black text-[32px] bg-transparent outline-none border-b-[10px] border-slate-50 leading-none" /><span className="text-[18px] font-black text-slate-400 italic tracking-[0.2em]">MINS</span></div>
              </div>
              <input type="text" value={item.fileUrl} onChange={(e) => updateField(item.id, type, 'fileUrl', e.target.value)} className="flex-1 bg-white border-[10px] border-slate-100 p-7 rounded-[3rem] font-bold text-[18px] outline-none shadow-inner group-hover:border-blue-50 transition-all shadow-xl" placeholder="PASTE SECURE CLOUD DRIVE ACCESS LINK" />
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-center py-40 text-[24px] font-black text-slate-200 uppercase tracking-[0.8em] italic opacity-50 leading-none">Global Database Null Registry</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-32 w-full max-w-7xl flex flex-col items-center">
      {msg && <div className="fixed top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-20 py-10 rounded-full z-[1000] text-[18px] font-black uppercase tracking-widest border-[10px] border-yellow-400 shadow-[0_80px_160px_-40px_rgba(0,0,0,0.7)] animate-in slide-in-from-top-20 leading-none">{msg}</div>}
      
      <div className="flex justify-between items-center bg-white p-14 rounded-[5rem] shadow-4xl ring-[24px] ring-slate-50 w-full mb-20 border-[8px] border-white">
        <h2 className="font-black text-[20px] uppercase italic text-slate-400 tracking-[0.8em] opacity-80 leading-none">GLOBAL CONTROL CENTER</h2>
        <button onClick={() => setIsChangingPin(!isChangingPin)} className="text-[16px] font-black text-blue-600 uppercase flex items-center gap-8 hover:underline decoration-[12px] underline-offset-[24px] transition-all leading-none decoration-blue-100"><Settings2 size={48}/> ENCRYPTION SETTINGS</button>
      </div>

      {isChangingPin && (
        <div className="max-w-4xl w-full p-20 bg-blue-50 rounded-[8rem] border-[16px] border-blue-100 shadow-[0_100px_200px_-50px_rgba(29,78,216,0.3)] space-y-14 animate-in slide-in-from-top-20 duration-1000">
           <p className="text-[24px] font-black text-blue-800 uppercase text-center italic tracking-[0.4em] underline decoration-blue-200 underline-offset-[16px] decoration-[12px] leading-none">Modify Global Encryption PIN</p>
           <input type="text" onChange={(e) => setNewRes({...newRes, pin: e.target.value})} className="w-full p-10 rounded-[4.5rem] bg-white border-[16px] border-blue-100 font-black text-center text-7xl outline-none shadow-4xl shadow-blue-200/50 leading-none" placeholder="••••" />
           <div className="flex gap-10">
             <button onClick={() => setIsChangingPin(false)} className="flex-1 py-10 font-black text-[18px] uppercase bg-white text-slate-500 rounded-[4rem] shadow-3xl active:scale-95 transition-all tracking-[0.3em]">Abort Update</button>
             <button onClick={() => { setTeacherPin(newRes.pin); setIsChangingPin(false); notify("Global Authentication PIN Re-Encrypted"); }} className="flex-1 py-10 font-black text-[18px] uppercase bg-blue-700 text-white rounded-[4rem] shadow-3xl active:scale-95 transition-all border-b-[20px] border-blue-900 tracking-[0.3em]">Finalize & Lock</button>
           </div>
        </div>
      )}
      
      <PaperSection title="Live Examination" items={liveMocks} type="live" icon={<Clock size={48}/>} color="text-red-600" />
      <PaperSection title="Practice Mock Set" items={practiceSets} type="practice" icon={<BookOpen size={48}/>} color="text-blue-700" />
      <PaperSection title="Master Historical Paper" items={prevPapers} type="prev" icon={<FileText size={48}/>} color="text-orange-600" />

      {/* Global Student Database */}
      <div className="bg-white p-24 rounded-[10rem] shadow-[0_120px_250px_-60px_rgba(0,0,0,0.35)] border-t-[48px] border-slate-900 space-y-24 w-full mb-48 ring-[16px] ring-slate-50">
        <div className="flex flex-col lg:flex-row justify-between items-center border-b-[16px] border-slate-50 pb-16 gap-14">
          <h3 className="font-black uppercase text-[28px] italic text-slate-800 flex items-center gap-10 tracking-tighter leading-none"><Trophy size={80} className="text-yellow-600 drop-shadow-[0_20px_40px_rgba(234,179,8,0.4)]"/> Intelligence Analytics Database</h3>
          <button onClick={() => setGrowthPublished(!growthPublished)} className={`px-24 py-10 rounded-full text-[18px] font-black uppercase shadow-[0_60px_120px_-20px_rgba(0,0,0,0.5)] transition-all active:scale-95 border-b-[20px] leading-none ${growthPublished ? 'bg-red-600 text-white border-red-900 shadow-red-200' : 'bg-green-600 text-white border-green-900 shadow-green-200'}`}>{growthPublished ? 'FREEZE ANALYTICS' : 'PUBLISH INTELLIGENCE'}</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-14">
          {students.map((name, i) => (
            <button key={i} onClick={() => setSelectedStudent(name)} className="p-14 bg-slate-50 rounded-[5rem] border-[16px] border-white shadow-4xl flex justify-between items-center group hover:bg-blue-600 hover:scale-[1.08] transition-all duration-500 ring-8 ring-slate-50/50">
              <span className="font-black uppercase text-[28px] group-hover:text-white transition-colors italic tracking-tighter leading-none">{name}</span>
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-slate-200 group-hover:text-blue-600 shadow-4xl transition-all duration-700"><ChevronRight size={56} /></div>
            </button>
          ))}
          <button onClick={async () => { const n = prompt("ENTER COMPLETE LEGAL NAME OF STUDENT:"); if(n) await addDoc(collection(db, "students"), {name: n}); }} className="p-14 border-[16px] border-dashed border-slate-100 rounded-[5rem] flex items-center justify-center gap-10 font-black text-[20px] uppercase text-slate-300 hover:text-blue-600 hover:border-blue-300 transition-all active:scale-95 hover:bg-blue-50/50"><UserPlus size={64}/> Initiate Cloud Profile</button>
        </div>
      </div>

      {selectedStudent && (
        <div className="fixed inset-0 bg-white z-[1200] p-16 md:p-32 overflow-y-auto animate-in slide-in-from-right-full duration-1000">
           <button onClick={() => setSelectedStudent(null)} className="flex items-center gap-8 text-[22px] font-black text-blue-600 uppercase mb-20 hover:underline decoration-[14px] underline-offset-[32px] tracking-widest italic transition-all decoration-blue-100"><ChevronLeft size={80}/> Back to Global Intelligence Registry</button>
           <div className="bg-white p-24 md:p-40 rounded-[12rem] border-[40px] border-slate-50 shadow-[0_150px_300px_-80px_rgba(0,0,0,0.45)] space-y-32 max-w-7xl mx-auto relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-blue-50 rounded-full opacity-50 -translate-y-1/2 translate-x-1/2 shadow-inner"></div>
              <div className="flex items-center gap-16 border-b-[16px] border-slate-50 pb-20 relative z-10">
                <div className="w-48 h-48 bg-blue-700 rounded-[5rem] flex items-center justify-center text-white shadow-4xl rotate-12 ring-[32px] ring-blue-50 shadow-blue-200"><User size={96} /></div>
                <div><h3 className="text-8xl font-black text-slate-800 uppercase tracking-tighter italic leading-none">{selectedStudent}</h3><p className="text-[22px] font-bold text-slate-400 uppercase italic mt-10 tracking-[0.6em] opacity-80 leading-none">Certified Academic Milestone Registry</p></div>
              </div>
              <div className="p-20 bg-blue-50 rounded-[8rem] border-[16px] border-blue-100 space-y-16 shadow-inner relative z-10">
                 <h4 className="text-[24px] font-black text-blue-700 uppercase flex items-center gap-10 italic tracking-[0.3em] leading-none"><PlusCircle size={64}/> Log New Intelligence Milestone</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div className="space-y-6"><p className="text-[16px] font-black text-slate-400 uppercase ml-12 tracking-[0.5em] italic opacity-80 leading-none">Assignment Topic</p><input type="text" value={newRes.exam} onChange={(e) => setNewRes({...newRes, exam: e.target.value})} className="w-full p-10 rounded-[4rem] border-[14px] border-white font-black text-[24px] outline-none shadow-4xl focus:border-blue-300 transition-all leading-none italic shadow-blue-50" placeholder="e.g. Euclidean Space-I" /></div>
                   <div className="space-y-6"><p className="text-[16px] font-black text-slate-400 uppercase ml-12 tracking-[0.5em] italic opacity-80 leading-none">Observation Date</p><input type="date" value={newRes.date} onChange={(e) => setNewRes({...newRes, date: e.target.value})} className="w-full p-10 rounded-[4rem] border-[14px] border-white font-black text-[24px] outline-none shadow-4xl focus:border-blue-300 transition-all leading-none shadow-blue-50" /></div>
                   <div className="space-y-6"><p className="text-[16px] font-black text-slate-400 uppercase ml-12 tracking-[0.5em] italic opacity-80 leading-none">Metric Achieved</p><input type="number" value={newRes.obtained} onChange={(e) => setNewRes({...newRes, obtained: e.target.value})} className="w-full p-10 rounded-[4rem] border-[14px] border-white font-black text-[40px] outline-none shadow-4xl text-center focus:border-blue-300 transition-all leading-none shadow-blue-50" placeholder="00" /></div>
                   <div className="space-y-6"><p className="text-[16px] font-black text-slate-400 uppercase ml-12 tracking-[0.5em] italic opacity-80 leading-none">Maximum Possible</p><input type="number" value={newRes.total} onChange={(e) => setNewRes({...newRes, total: e.target.value})} className="w-full p-10 rounded-[4rem] border-[14px] border-white font-black text-[40px] outline-none shadow-4xl text-center focus:border-blue-300 transition-all leading-none shadow-blue-50" placeholder="100" /></div>
                 </div>
                 <button onClick={async () => {
                   if(newRes.exam && newRes.obtained && newRes.total) {
                     const p = Math.round((parseFloat(newRes.obtained)/parseFloat(newRes.total))*100);
                     await addDoc(collection(db, "results"), { ...newRes, name: selectedStudent, percent: p, timestamp: Date.now() });
                     setNewRes({exam: "", date: "", obtained: "", total: ""});
                     notify("Cloud Analytics Data Locked & Synced");
                   }
                 }} className="w-full py-12 bg-blue-700 text-white rounded-[5rem] font-black text-[20px] uppercase shadow-[0_60px_120px_-20px_rgba(29,78,216,0.8)] hover:bg-blue-800 transition-all active:scale-[0.98] border-b-[20px] border-blue-900 active:border-b-0 leading-none tracking-[0.2em]">Finalize Global Metric</button>
              </div>
              <div className="space-y-10 max-h-[70rem] overflow-y-auto no-scrollbar pt-20 relative z-10">
                 {studentResults.filter(r => r.name === selectedStudent).sort((a,b)=>b.timestamp-a.timestamp).map(r => (
                   <div key={r.id} className="p-16 bg-slate-50 border-[14px] border-white rounded-[6rem] flex justify-between items-center group hover:bg-white transition-all shadow-2xl ring-[8px] ring-slate-100">
                     <div className="flex items-center gap-16">
                       <div className={`w-32 h-32 rounded-[3rem] flex items-center justify-center font-black text-5xl shadow-4xl border-[16px] border-white ${r.percent >= 40 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{r.percent}%</div>
                       <div><p className="text-4xl font-black text-slate-800 uppercase italic tracking-tighter leading-none underline decoration-slate-100 underline-offset-[20px]">{r.exam}</p><p className="text-[18px] text-slate-400 font-bold uppercase mt-10 italic tracking-[0.5em] leading-none opacity-80">{r.date} • {r.obtained}/{r.total} Intelligence Metric</p></div>
                     </div>
                     <button onClick={async () => { if(window.confirm("PERMANENT GLOBAL PURGE? THIS ACTION IS FINAL.")) await deleteDoc(doc(db, "results", r.id)); }} className="text-red-200 hover:text-red-600 transition-all p-10 bg-white rounded-[4rem] shadow-4xl active:scale-90 border-[10px] border-red-50"><Trash2 size={64} /></button>
                   </div>
                 ))}
                 {studentResults.filter(r => r.name === selectedStudent).length === 0 && <p className="text-center py-48 text-[24px] font-black text-slate-200 uppercase tracking-[1em] italic opacity-40 leading-none">Database Null</p>}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

// --- Sub-component: Growth View (পুরো বড় সিস্টেম) ---
const GrowthSectionView = ({ isPublished, results }) => {
  const [sel, setSel] = useState(null);
  if (!isPublished) return <div className="py-96 text-center bg-white rounded-[12rem] border-[24px] border-dashed border-slate-100 max-w-6xl mx-auto w-full animate-pulse shadow-4xl"><Award size={180} className="text-slate-100 mx-auto mb-14" /><h2 className="font-black text-slate-300 uppercase text-[28px] tracking-[0.8em] italic opacity-60 leading-none">Cloud Security Encryption Active • Evaluating...</h2></div>;
  const students = Array.from(new Set(results.map(r => r.name))).sort();
  return (
    <div className="max-w-4xl mx-auto w-full animate-in fade-in duration-1000">
      {!sel ? (
        <div className="grid gap-12">
          <p className="text-[18px] font-black text-slate-400 uppercase tracking-[0.6em] ml-20 mb-8 italic opacity-80 leading-none">Global Intelligence Database:</p>
          {students.map((name, i) => (<button key={i} onClick={() => setSel(name)} className="bg-white p-14 rounded-[5rem] shadow-[0_60px_120px_-30px_rgba(0,0,0,0.2)] border-[16px] border-white flex justify-between items-center group active:scale-[0.94] transition-all hover:border-blue-700 hover:shadow-blue-100/50"><div className="flex items-center gap-12"><div className="w-28 h-24 bg-blue-50 rounded-[3rem] flex items-center justify-center text-blue-700 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all duration-700 shadow-blue-100/50"><User size={40} /></div><span className="font-black text-slate-800 uppercase text-3xl italic tracking-tighter leading-none">{name}</span></div><div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all duration-700 shadow-3xl"><ChevronRight size={72} /></div></button>))}
          {students.length === 0 && <p className="text-center py-64 text-[24px] font-black text-slate-200 uppercase tracking-[1em] italic opacity-40 leading-none">Database Registry Empty</p>}
        </div>
      ) : (
        <div className="space-y-20 animate-in slide-in-from-right-full duration-1000">
          <button onClick={() => setSel(null)} className="flex items-center gap-10 text-[22px] font-black text-blue-600 uppercase mb-16 hover:underline decoration-[16px] underline-offset-[32px] tracking-[0.5em] italic transition-all decoration-blue-100"><ChevronLeft size={80}/> Return to Central Database</button>
          <div className="bg-white rounded-[12rem] shadow-[0_120px_250px_-60px_rgba(0,0,0,0.5)] overflow-hidden border-[32px] border-slate-50 relative">
             <div className="bg-blue-700 p-28 text-white text-center relative overflow-hidden shadow-4xl ring-inset ring-[24px] ring-white/10"><Trophy className="absolute -top-64 -right-64 opacity-10 rotate-12" size={600}/><h2 className="text-8xl font-black uppercase italic underline decoration-yellow-400 decoration-[16px] underline-offset-[32px] tracking-tighter leading-tight">Growth Registry</h2><div className="mt-32 inline-block bg-white/25 px-28 py-10 rounded-full border-[14px] border-white/50 backdrop-blur-3xl shadow-[0_40px_80px_rgba(0,0,0,0.5)] ring-[16px] ring-white/15 animate-pulse"><p className="text-4xl font-black uppercase tracking-[0.6em] italic leading-none">{sel}</p></div></div>
             <div className="p-24 overflow-x-auto">
               <table className="w-full text-[24px] font-black border-separate border-spacing-y-10">
                 <thead><tr className="text-slate-400 uppercase text-[15px] tracking-[0.8em] opacity-80 leading-none"><th className="p-12 text-left">Academic Unit</th><th className="p-12 text-center">Score</th><th className="p-12 text-right">Metric Analysis</th></tr></thead>
                 <tbody>{results.filter(r => r.name === sel).sort((a,b)=>new Date(b.date)-new Date(a.date)).map(r => (<tr key={r.id} className="bg-slate-50 rounded-[5rem] shadow-2xl hover:scale-[1.04] transition-all duration-700 ring-8 ring-white"><td className="p-12 uppercase text-slate-800 italic rounded-l-[4rem] border-l-[32px] border-blue-600 tracking-tighter text-4xl leading-none">{r.exam}</td><td className="p-12 text-center text-blue-700 text-8xl tracking-tighter leading-none shadow-blue-50 drop-shadow-xl">{r.percent}%</td><td className="p-12 text-right rounded-r-[4rem]"><span className={`px-20 py-6 rounded-full text-[18px] font-black shadow-[0_40px_80px_-10px_rgba(0,0,0,0.4)] tracking-[0.3em] border-[8px] ${r.percent >= 40 ? 'bg-green-100 text-green-700 border-green-200 shadow-green-100' : 'bg-red-100 text-red-700 border-red-200 shadow-red-100'}`}>{r.percent >= 90 ? 'MASTER' : r.percent >= 40 ? 'SUCCESS' : 'FAILURE'}</span></td></tr>))}</tbody>
               </table>
             </div>
          </div>
          <p className="text-center text-[18px] font-black text-slate-300 uppercase tracking-[1.5em] italic mt-32 opacity-80 underline decoration-slate-100 underline-offset-[24px] decoration-[10px]">Official Digital Analytics Registry • Global Math Excellence Engine</p>
        </div>
      )}
    </div>
  );
};

// --- Sub-component: Exam Interface (পুরো বড় সিস্টেম) ---
const ExamInterface = ({ exam, onFinish }) => {
  const [timeLeft, setTimeLeft] = useState(exam.duration);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0 || isSubmitted) { if(timeLeft === 0 && !isSubmitted) setIsSubmitted(true); return; }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted]);

  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' + m : m}:${sec < 10 ? '0' + sec : sec}`;
  };

  if (isSubmitted) return (
    <div className="fixed inset-0 bg-white z-[2000] flex flex-col items-center justify-center p-32 text-center animate-in zoom-in duration-1000">
      <div className="w-80 h-80 bg-green-50 rounded-full flex items-center justify-center mb-20 ring-[32px] ring-green-50 shadow-[0_80px_160px_-20px_rgba(22,163,74,0.3)] animate-bounce-slow"><CheckCircle size={200} className="text-green-600 shadow-4xl" /></div>
      <h2 className="text-8xl font-black text-slate-800 uppercase italic tracking-tighter leading-none underline decoration-green-600 decoration-[24px] underline-offset-[40px]">TRANSMITTED</h2>
      <p className="text-slate-400 font-bold uppercase text-[24px] mt-32 tracking-[0.8em] max-w-4xl mx-auto leading-loose italic opacity-90 underline-offset-[16px] underline decoration-slate-100 decoration-[10px]">Academic Objective Secured, {exam.studentName}. Your data packet has been securely encrypted and uploaded to the central cloud for Anshu Sir's final evaluation.</p>
      <button onClick={onFinish} className="bg-blue-700 text-white px-40 py-12 rounded-[7rem] font-black uppercase text-[26px] shadow-[0_60px_120px_-30px_rgba(29,78,216,0.8)] mt-32 active:scale-[0.8] transition-all border-b-[24px] border-blue-900 active:border-b-0 active:translate-y-8 tracking-[0.4em]">Destroy Session</button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col overflow-hidden">
      <div className="bg-white p-10 flex justify-between items-center border-b-[48px] border-yellow-400 shadow-[0_100px_200px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-14">
          <div className="w-24 h-24 bg-red-600 rounded-[3.5rem] flex items-center justify-center text-white animate-pulse shadow-[0_0_120px_rgba(220,38,38,0.8)] border-[14px] border-red-100 ring-[16px] ring-red-500 shadow-red-200"><ShieldAlert size={64}/></div>
          <div><h2 className="font-black text-slate-800 text-[32px] md:text-5xl uppercase italic tracking-tighter leading-none">{exam.title}</h2><p className="text-[22px] text-blue-700 font-black uppercase italic mt-6 tracking-[0.6em] opacity-100 flex items-center gap-10 leading-none"><User size={32}/> GLOBAL CLOUD PROCTORING ACTIVE • {exam.studentName}</p></div>
        </div>
        <div className="flex items-center gap-20">
          <div className={`px-20 py-7 rounded-[4rem] font-black text-6xl md:text-9xl border-[20px] shadow-4xl tracking-tighter ring-[32px] ${timeLeft < 300 ? 'bg-red-50 text-red-600 border-red-200 animate-pulse ring-red-100 shadow-[0_0_150px_rgba(220,38,38,0.5)]' : 'bg-slate-50 text-slate-800 border-slate-100 ring-slate-50 shadow-inner'}`}>{formatTime(timeLeft)}</div>
          <button onClick={() => { if(window.confirm("EXECUTE SECURE CLOUD UPLOAD? WARNING: DATA PACKET CANNOT BE RECOVERED OR MODIFIED.")) setIsSubmitted(true); }} className="bg-green-600 text-white px-28 py-12 rounded-[3.5rem] font-black text-[26px] uppercase shadow-[0_80px_160px_-30px_rgba(22,163,74,0.8)] hover:bg-green-700 transition-all border-b-[24px] border-green-800 active:border-b-0 active:translate-y-6 tracking-tighter">SUBMIT PACKET</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto bg-slate-900 p-12 md:p-32">
        <div className="max-w-screen-2xl mx-auto space-y-20">
           <div className="bg-blue-900/60 border-[16px] border-blue-500/40 p-16 rounded-[7rem] flex items-center gap-16 text-blue-200 shadow-[0_100px_200px_rgba(0,0,0,0.7)] backdrop-blur-3xl ring-[12px] ring-white/10">
              <div className="w-36 h-36 bg-blue-600 rounded-[4rem] flex items-center justify-center text-white shrink-0 shadow-4xl ring-[24px] ring-blue-500/20 shadow-blue-200"><PenTool size={80} /></div>
              <p className="text-[20px] md:text-[32px] font-black uppercase italic tracking-[0.1em] leading-relaxed opacity-100 underline decoration-blue-500/60 underline-offset-[24px] decoration-[12px]">Critical Objective: Utilize physical answer scripts for documentation. Cloud surveillance detects all navigation violations. Sync before the countdown reaches zero.</p>
           </div>
           <SecurePDFViewer fileUrl={exam.fileUrl} />
        </div>
      </div>
      <div className="bg-red-900 text-white py-10 text-center text-[24px] font-black uppercase tracking-[2em] z-50 border-t-[16px] border-red-600 shadow-[0_-80px_160px_rgba(0,0,0,0.8)]">GLOBAL CLOUD SECURITY SHIELD ACTIVE • DO NOT REFRESH • DO NOT EXIT TERMINAL</div>
    </div>
  );
};

export default App;
