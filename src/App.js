import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import { 
  Trophy, BookOpen, TrendingUp, User, Clock, ChevronRight, GraduationCap, AlertCircle, 
  PlusCircle, FileText, Lock, Award, Timer, Settings2, CheckCircle, PenTool, 
  ShieldAlert, Loader2, ChevronLeft, Trash2, UserPlus, Search, ArrowRight, X, Key, History, UserCheck
} from 'lucide-react';

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

const SecurePDFViewer = ({ fileUrl }) => {
  const [loading, setLoading] = useState(true);
  const getEmbedUrl = (url) => {
    if (!url) return "";
    if (url.includes('drive.google.com')) return url.replace('/view?usp=sharing', '/preview').replace('/view', '/preview').split('/edit')[0];
    return url;
  };
  return (
    <div className="w-full h-[85vh] bg-slate-100 rounded-[5rem] overflow-hidden relative border-[12px] border-slate-900 shadow-2xl mt-12 ring-[16px] ring-white/10">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-20">
          <Loader2 className="animate-spin text-blue-600 mb-6" size={64} />
          <p className="text-[14px] font-black text-slate-400 uppercase italic tracking-[0.6em]">Establishing Secure Connection...</p>
        </div>
      )}
      <iframe src={getEmbedUrl(fileUrl)} className="w-full h-full relative z-10" onLoad={() => setLoading(false)} title="Question Paper" />
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.08] rotate-[-45deg] select-none z-0">
        <h1 className="text-[15vw] font-black text-slate-900 uppercase">MATH EXCELLENCE</h1>
      </div>
    </div>
  );
};
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

  useEffect(() => {
    onSnapshot(collection(db, "liveMocks"), (s) => setLiveMocks(s.docs.map(d => ({id: d.id, ...d.data()}))));
    onSnapshot(collection(db, "prevPapers"), (s) => setPrevPapers(s.docs.map(d => ({id: d.id, ...d.data()}))));
    onSnapshot(collection(db, "practiceSets"), (s) => setPracticeSets(s.docs.map(d => ({id: d.id, ...d.data()}))));
    onSnapshot(collection(db, "results"), (s) => setStudentResults(s.docs.map(d => ({id: d.id, ...d.data()}))));
    onSnapshot(collection(db, "students"), (s) => setStudents(s.docs.map(d => d.data().name).sort()));
    onSnapshot(doc(db, "settings", "adminConfig"), (d) => { if (d.exists()) { setTeacherPin(d.data().pin); setGrowthPublished(d.data().growthPublished); } });
    onSnapshot(query(collection(db, "logs"), orderBy("timestamp", "desc")), (s) => setActivityLogs(s.docs.map(d => ({id: d.id, ...d.data()}))));
  }, []);

  const handleStartExamFlow = (title, durationSec, fileUrl) => {
    setPendingExam({ title, duration: durationSec, fileUrl });
    setShowNameModal(true);
  };

  const finalizeExamStart = async () => {
    if (!studentNameInput.trim()) return;
    const d = new Date();
    await addDoc(collection(db, "logs"), { studentName: studentNameInput, examTitle: pendingExam.title, timestamp: Date.now(), timeDisplay: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), dateDisplay: d.toLocaleDateString() });
    setCurrentExam({ ...pendingExam, studentName: studentNameInput });
    setIsExamActive(true);
    setShowNameModal(false);
    setStudentNameInput('');
  };

  if (isExamActive) return <ExamInterface exam={currentExam} onFinish={() => setIsExamActive(false)} />;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 select-none flex flex-col items-center overflow-x-hidden">
      {showNameModal && (
        <div className="fixed inset-0 bg-black/95 z-[1000] flex items-center justify-center p-10 backdrop-blur-3xl">
          <div className="bg-white rounded-[6rem] p-20 max-w-md w-full text-center shadow-2xl border-[16px] border-slate-50 animate-in zoom-in">
            <User size={64} className="text-blue-600 mx-auto mb-10" />
            <h3 className="font-black text-slate-800 uppercase text-[18px] mb-10 tracking-[0.4em] italic underline decoration-blue-200 underline-offset-[20px] decoration-8">Identification</h3>
            <input autoFocus type="text" value={studentNameInput} onChange={(e) => setStudentNameInput(e.target.value)} className="w-full p-8 rounded-[3rem] border-8 border-slate-100 font-black text-3xl uppercase outline-none focus:border-blue-500 mb-14 text-center shadow-3xl" placeholder="NAME" />
            <div className="flex gap-8"><button onClick={() => setShowNameModal(false)} className="flex-1 py-7 rounded-[2rem] bg-slate-100 font-black text-[14px] uppercase tracking-widest">Cancel</button><button onClick={finalizeExamStart} className="flex-1 py-7 rounded-[2rem] bg-blue-700 text-white font-black text-[14px] uppercase shadow-3xl active:scale-95">Confirm</button></div>
          </div>
        </div>
      )}
      <header className="bg-white border-b-[12px] border-slate-50 sticky top-0 z-50 shadow-2xl px-16 py-8 flex justify-between items-center w-full max-w-6xl">
        <div onClick={() => setActiveTab('home')} className="cursor-pointer group flex flex-col"><h1 className="text-4xl md:text-6xl font-black text-blue-700 uppercase italic tracking-tighter">MATH EXCELLENCE</h1><p className="text-[12px] font-black text-slate-400 opacity-80 mt-4 tracking-[0.6em] uppercase">Academic Command • Anshu Sir</p></div>
        <div className="hidden xl:block shadow-3xl rounded-full p-3 ring-8 ring-blue-50"><span className="bg-blue-700 text-white px-14 py-5 rounded-full font-black text-[14px] uppercase tracking-[0.4em]">BUILD YOUR FUTURE</span></div>
      </header>
      <nav className="bg-blue-700 text-white sticky top-[130px] md:top-[164px] z-40 w-full flex justify-center shadow-2xl">
        <div className="max-w-6xl w-full flex overflow-x-auto no-scrollbar">
          {[{ id: 'live', label: 'Live Mock', icon: <Clock size={24} /> }, { id: 'practice', label: 'Practice Set', icon: <BookOpen size={24} /> }, { id: 'growth', label: 'Student Growth', icon: <TrendingUp size={24} /> }, { id: 'teacher', label: 'Teacher Zone', icon: <User size={24} /> }].map((item) => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); if(item.id !== 'teacher') setIsTeacherAuthenticated(false); }} className={`flex-1 flex items-center justify-center gap-6 px-12 py-9 font-black text-[14px] uppercase tracking-[0.4em] border-b-[16px] transition-all duration-500 ${activeTab === item.id ? 'border-yellow-400 bg-blue-800' : 'border-transparent'}`}>{item.icon} {item.label}</button>
          ))}
        </div>
      </nav>
      <main className="w-full max-w-6xl p-10 mb-40">{activeTab === 'home' && ( <div className="text-center space-y-24 w-full"> <div className="bg-white p-24 md:p-40 rounded-[8rem] shadow-2xl border-[20px] border-slate-50 ring-4 ring-slate-100 relative overflow-hidden group"> <GraduationCap size={120} className="text-blue-700 mx-auto mb-14 relative z-10 animate-bounce-slow" /> <h2 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter relative z-10">Master <span className="text-blue-700 underline decoration-yellow-400 decoration-[20px] underline-offset-[32px]">Maths</span></h2> <button onClick={() => setActiveTab('practice')} className="mt-24 bg-blue-700 text-white px-24 py-9 rounded-[4rem] font-black text-[16px] uppercase shadow-2xl active:scale-95 mx-auto relative z-10">Launch Hub</button> </div> <div className="bg-white p-16 rounded-[6rem] shadow-3xl text-left border-[24px] border-slate-50 relative"><History size={48} className="text-blue-600 mb-10"/><div className="space-y-8">{activityLogs.slice(0, 5).map(log => (<div key={log.id} className="p-10 bg-slate-50 rounded-[4rem] flex justify-between items-center border-l-[24px] border-blue-600 shadow-2xl"><div><p className="text-[24px] font-black uppercase text-slate-800">{log.studentName}</p><p className="text-[14px] font-bold text-slate-400 mt-2">{log.examTitle}</p></div><div className="text-right text-[16px] font-black text-blue-700 uppercase italic bg-blue-50 px-10 py-3 rounded-full">{log.timeDisplay}</div></div>))}</div></div> </div> )}
        {activeTab === 'live' && ( <div className="space-y-16 w-full">{liveMocks.filter(m => m.isPublished).map(m => (<div key={m.id} className="bg-white p-16 rounded-[6rem] shadow-3xl border-[12px] border-red-50 flex flex-col lg:flex-row justify-between items-center gap-12 relative overflow-hidden group"> <div className="absolute top-0 right-0 bg-red-600 text-white px-16 py-4 text-[14px] font-black uppercase animate-pulse">LIVE MOCK</div> <div><h3 className="text-5xl font-black uppercase italic">{m.name}</h3><p className="text-[18px] font-black text-red-600 mt-12 bg-red-50 px-12 py-5 rounded-[2.5rem] w-fit shadow-inner"><Timer size={32}/> {m.hours}h {m.minutes}m</p></div> <button onClick={() => handleStartExamFlow(m.name, (parseInt(m.hours)||0)*3600+(parseInt(m.minutes)||0)*60, m.fileUrl)} className="bg-red-600 text-white px-24 py-9 rounded-[4rem] font-black text-[20px] uppercase shadow-2xl border-b-[20px] border-red-900 active:border-b-0">Launch</button> </div>))}</div> )}
        {activeTab === 'practice' && ( <div className="space-y-32 w-full"><section><h2 className="font-black uppercase italic text-slate-800 border-b-[16px] border-blue-50 pb-10 mb-20 text-4xl underline decoration-blue-700 decoration-[20px] underline-offset-[36px]">Practice Sets</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-16">{practiceSets.filter(p => p.isPublished).map(p => (<div key={p.id} className="bg-white p-20 rounded-[5rem] shadow-4xl border-[12px] border-white flex flex-col justify-between items-start hover:-translate-y-6 transition-all group"><div><h3 className="font-black uppercase text-[26px] text-slate-800 italic group-hover:text-blue-700">{p.name}</h3><p className="text-[16px] font-black text-slate-400 mt-10 flex items-center gap-6"><Timer size={32}/> {p.hours}h {p.minutes}m Module</p></div><button onClick={() => handleStartExamFlow(p.name, (parseInt(p.hours)||0)*3600+(parseInt(p.minutes)||0)*60, p.fileUrl)} className="mt-16 bg-blue-700 text-white px-16 py-7 rounded-[2.5rem] font-black text-[16px] uppercase shadow-2xl">Open</button></div>))}</div></section></div> )}
        {activeTab === 'growth' && <GrowthSectionView isPublished={growthPublished} results={studentResults} />}
        {activeTab === 'teacher' && (!isTeacherAuthenticated ? <div className="max-w-2xl w-full mx-auto mt-40 p-24 bg-white rounded-[8rem] shadow-2xl border-t-[32px] border-blue-700 text-center"><Lock size={80} className="text-blue-700 mx-auto mb-20"/><input type="password" onChange={(e) => { if(e.target.value === teacherPin) setIsTeacherAuthenticated(true); }} className="w-full py-10 bg-slate-50 border-[10px] border-white rounded-[4rem] font-black text-center text-5xl tracking-[1em]" placeholder="••••" /></div> : <TeacherZoneMainView liveMocks={liveMocks} prevPapers={prevPapers} practiceSets={practiceSets} growthPublished={growthPublished} setGrowthPublished={async (v) => await setDoc(doc(db, "settings", "adminConfig"), { growthPublished: v }, { merge: true })} studentResults={studentResults} students={students} teacherPin={teacherPin} setTeacherPin={async (v) => await setDoc(doc(db, "settings", "adminConfig"), { pin: v }, { merge: true })} /> )}
      </main>
    </div>
  );
};
const TeacherZoneMainView = ({ liveMocks, prevPapers, practiceSets, growthPublished, setGrowthPublished, studentResults, students, teacherPin, setTeacherPin }) => {
  const [msg, setMsg] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newRes, setNewRes] = useState({ exam: "", date: "", obtained: "", total: "" });
  const addPaper = async (type) => { const colls = { live: 'liveMocks', practice: 'practiceSets', prev: 'prevPapers' }; await addDoc(collection(db, colls[type]), { name: `New Assignment`, hours: 1, minutes: 0, fileUrl: "", isPublished: false }); setMsg("Synced!"); setTimeout(()=>setMsg(""),2000); };
  const updateField = async (id, type, field, value) => { const colls = { live: 'liveMocks', practice: 'practiceSets', prev: 'prevPapers' }; await setDoc(doc(db, colls[type], id), { [field]: value }, { merge: true }); };
  const deleteItem = async (id, type) => { if(!window.confirm("Purge?")) return; const colls = { live: 'liveMocks', practice: 'practiceSets', prev: 'prevPapers' }; await deleteDoc(doc(db, colls[type], id)); };
  const PaperSection = ({ title, items, type, icon, color }) => (
    <div className="bg-white p-16 rounded-[7rem] shadow-4xl border-t-[24px] border-slate-100 space-y-16 w-full mb-20 ring-8 ring-slate-50">
      <div className="flex justify-between items-center border-b-[12px] border-slate-50 pb-12"><h3 className={`font-black uppercase text-[22px] italic flex items-center gap-8 ${color}`}>{icon} {title} Admin</h3><button onClick={() => addPaper(type)} className="bg-slate-100 p-8 rounded-full border-[10px] border-white active:scale-90"><PlusCircle size={56} /></button></div>
      <div className="space-y-14">{items.map(item => (
        <div key={item.id} className="p-14 bg-slate-50 rounded-[5rem] border-[12px] border-white shadow-2xl space-y-12 transition-all hover:bg-white ring-4 ring-slate-100">
          <div className="flex flex-col xl:flex-row gap-10"><input type="text" value={item.name} onChange={(e) => updateField(item.id, type, 'name', e.target.value)} className="flex-1 bg-white border-[10px] border-slate-100 p-7 rounded-[3rem] font-black text-[24px] uppercase outline-none focus:border-blue-500 shadow-xl italic" placeholder="Label" /><div className="flex gap-7"><button onClick={() => updateField(item.id, type, 'isPublished', !item.isPublished)} className={`px-16 py-5 rounded-[2.5rem] text-[16px] font-black uppercase border-b-[16px] active:border-b-0 min-w-[240px] ${item.isPublished ? 'bg-green-600 text-white border-green-800' : 'bg-slate-300 text-slate-600 border-slate-400'}`}>{item.isPublished ? 'PUBLISHED' : 'IN DRAFT'}</button><button onClick={() => deleteItem(item.id, type)} className="text-red-400 p-7 bg-white rounded-[3rem] shadow-3xl hover:text-red-600 border-[8px] border-red-50"><Trash2 size={48}/></button></div></div>
          <div className="flex flex-col xl:flex-row gap-10"><div className="flex items-center gap-10 bg-white border-[10px] border-slate-100 px-12 py-7 rounded-[3rem] shadow-inner shrink-0 group-hover:border-blue-50 transition-all ring-4 ring-slate-50"><Timer size={48} className="text-slate-300"/><div className="flex items-center gap-6"><input type="number" value={item.hours} onChange={(e) => updateField(item.id, type, 'hours', e.target.value)} className="w-20 text-center font-black text-[32px] bg-transparent outline-none border-b-[10px] border-slate-50 leading-none" /><span className="text-[18px] font-black text-slate-400 italic">HRS</span></div><div className="flex items-center gap-6"><input type="number" value={item.minutes} onChange={(e) => updateField(item.id, type, 'minutes', e.target.value)} className="w-20 text-center font-black text-[32px] bg-transparent outline-none border-b-[10px] border-slate-50 leading-none" /><span className="text-[18px] font-black text-slate-400 italic">MINS</span></div></div><input type="text" value={item.fileUrl} onChange={(e) => updateField(item.id, type, 'fileUrl', e.target.value)} className="flex-1 bg-white border-[10px] border-slate-100 p-7 rounded-[3rem] font-bold text-[18px] outline-none shadow-xl" placeholder="PASTE CLOUD DRIVE LINK" /></div>
        </div>))}</div>
    </div>
  );
  return ( <div className="space-y-32 w-full flex flex-col items-center"> {msg && <div className="fixed top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-20 py-10 rounded-full z-[1000] text-[18px] font-black uppercase border-[10px] border-yellow-400 shadow-3xl animate-in slide-in-from-top-20">{msg}</div>} <PaperSection title="Live Examination" items={liveMocks} type="live" icon={<Clock size={48}/>} color="text-red-600" /> <PaperSection title="Practice Mock Set" items={practiceSets} type="practice" icon={<BookOpen size={48}/>} color="text-blue-700" /> <PaperSection title="Historical Mock Paper" items={prevPapers} type="prev" icon={<FileText size={48}/>} color="text-orange-600" /> <div className="bg-white p-24 rounded-[10rem] shadow-4xl border-t-[48px] border-slate-900 space-y-24 w-full mb-48 ring-[16px] ring-slate-50"> <div className="flex flex-col lg:flex-row justify-between items-center border-b-[16px] border-slate-50 pb-16 gap-14"> <h3 className="font-black uppercase text-[28px] italic text-slate-800 flex items-center gap-10 tracking-tighter leading-none"><Trophy size={80} className="text-yellow-600"/> Analytics Hub</h3> <button onClick={() => setGrowthPublished(!growthPublished)} className={`px-24 py-10 rounded-full text-[18px] font-black uppercase shadow-3xl transition-all border-b-[20px] ${growthPublished ? 'bg-red-600 text-white border-red-900' : 'bg-green-600 text-white border-green-900'}`}>{growthPublished ? 'RESTRICT ACCESS' : 'PUBLISH REPORTS'}</button> </div> <div className="grid grid-cols-1 md:grid-cols-2 gap-14"> {students.map((name, i) => ( <button key={i} onClick={() => setSelectedStudent(name)} className="p-14 bg-slate-50 rounded-[5rem] border-[16px] border-white shadow-4xl flex justify-between items-center group hover:bg-blue-600 hover:scale-[1.08] transition-all duration-500"> <span className="font-black uppercase text-[28px] group-hover:text-white transition-colors">{name}</span> <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-slate-200 group-hover:text-blue-600 shadow-4xl"><ChevronRight size={56} /></div> </button> ))} <button onClick={async () => { const n = prompt("NAME:"); if(n) await addDoc(collection(db, "students"), {name: n}); }} className="p-14 border-[16px] border-dashed border-slate-100 rounded-[5rem] flex items-center justify-center gap-10 font-black text-[20px] uppercase text-slate-300 hover:text-blue-600 hover:border-blue-300 transition-all active:scale-95"><UserPlus size={64}/> Initiate Profile</button> </div> </div> </div> );
};

const GrowthSectionView = ({ isPublished, results }) => { const [sel, setSel] = useState(null); if (!isPublished) return <div className="py-96 text-center bg-white rounded-[12rem] border-[24px] border-dashed border-slate-100 max-w-6xl mx-auto w-full animate-pulse shadow-4xl"><Award size={180} className="text-slate-100 mx-auto mb-14" /><h2 className="font-black text-slate-300 uppercase text-[28px] tracking-[0.8em] italic opacity-60">Security Active • Evaluating Cloud Data</h2></div>; const students = Array.from(new Set(results.map(r => r.name))).sort(); return ( <div className="max-w-4xl mx-auto w-full animate-in fade-in duration-1000"> {!sel ? ( <div className="grid gap-12"> {students.map((name, i) => (<button key={i} onClick={() => setSel(name)} className="bg-white p-14 rounded-[5rem] shadow-4xl border-[16px] border-white flex justify-between items-center group active:scale-[0.94] transition-all hover:border-blue-700"><div className="flex items-center gap-12"><div className="w-28 h-24 bg-blue-50 rounded-[3rem] flex items-center justify-center text-blue-700 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all duration-700"><User size={40} /></div><span className="font-black text-slate-800 uppercase text-3xl italic tracking-tighter leading-none">{name}</span></div><div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all duration-700 shadow-3xl"><ChevronRight size={72} /></div></button>))} </div> ) : ( <div className="space-y-20 animate-in slide-in-from-right-full duration-1000"> <button onClick={() => setSel(null)} className="flex items-center gap-10 text-[22px] font-black text-blue-600 uppercase mb-16 hover:underline decoration-[16px] underline-offset-[32px] tracking-[0.5em] italic transition-all decoration-blue-100"><ChevronLeft size={80}/> Back</button> <div className="bg-white rounded-[12rem] shadow-4xl overflow-hidden border-[32px] border-slate-50 relative"> <div className="bg-blue-700 p-28 text-white text-center relative overflow-hidden"><Trophy className="absolute -top-64 -right-64 opacity-10 rotate-12" size={600}/><h2 className="text-8xl font-black uppercase italic underline decoration-yellow-400 decoration-[16px] underline-offset-[32px] tracking-tighter leading-tight">Growth Registry</h2><div className="mt-32 inline-block bg-white/25 px-28 py-10 rounded-full border-[14px] border-white/50 backdrop-blur-3xl animate-pulse"><p className="text-4xl font-black uppercase tracking-[0.6em] italic leading-none">{sel}</p></div></div> <div className="p-24 overflow-x-auto"> <table className="w-full text-[24px] font-black border-separate border-spacing-y-10"> <thead><tr className="text-slate-400 uppercase text-[15px] tracking-[0.8em] opacity-80 leading-none"><th className="p-12 text-left">Unit</th><th className="p-12 text-center">Score</th><th className="p-12 text-right">Metric</th></tr></thead> <tbody>{results.filter(r => r.name === sel).sort((a,b)=>new Date(b.date)-new Date(a.date)).map(r => (<tr key={r.id} className="bg-slate-50 rounded-[5rem] shadow-2xl hover:scale-[1.04] transition-all duration-700 ring-8 ring-white"><td className="p-12 uppercase text-slate-800 italic rounded-l-[4rem] border-l-[32px] border-blue-600 tracking-tighter text-4xl leading-none">{r.exam}</td><td className="p-12 text-center text-blue-700 text-8xl tracking-tighter leading-none shadow-blue-50 drop-shadow-xl">{r.percent}%</td><td className="p-12 text-right rounded-r-[4rem]"><span className={`px-20 py-6 rounded-full text-[18px] font-black shadow-4xl tracking-[0.3em] border-[8px] ${r.percent >= 40 ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>{r.percent >= 90 ? 'MASTER' : r.percent >= 40 ? 'SUCCESS' : 'FAILURE'}</span></td></tr>))}</tbody> </table> </div> </div> </div> )} </div> ); };

const ExamInterface = ({ exam, onFinish }) => {
  const [timeLeft, setTimeLeft] = useState(exam.duration);
  const [isSubmitted, setIsSubmitted] = useState(false);
  useEffect(() => { if (timeLeft <= 0 || isSubmitted) { if(timeLeft === 0 && !isSubmitted) setIsSubmitted(true); return; } const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000); return () => clearInterval(timer); }, [timeLeft, isSubmitted]);
  const formatTime = (s) => { const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60); const sec = s % 60; return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' + m : m}:${sec < 10 ? '0' + sec : sec}`; };
  if (isSubmitted) return ( <div className="fixed inset-0 bg-white z-[2000] flex flex-col items-center justify-center p-32 text-center animate-in zoom-in duration-1000"> <div className="w-80 h-80 bg-green-50 rounded-full flex items-center justify-center mb-20 ring-[32px] ring-green-50 shadow-4xl animate-bounce-slow"><CheckCircle size={200} className="text-green-600 shadow-4xl" /></div> <h2 className="text-8xl font-black text-slate-800 uppercase italic tracking-tighter leading-none underline decoration-green-600 decoration-[24px] underline-offset-[40px]">TRANSMITTED</h2> <p className="text-slate-400 font-bold uppercase text-[24px] mt-32 tracking-[0.8em] max-w-4xl mx-auto leading-loose italic opacity-90 underline-offset-[16px] underline decoration-slate-100 decoration-[10px]">Academic Objective Secured, {exam.studentName}. Your data packet has been securely encrypted and uploaded to the central cloud for Anshu Sir's final evaluation.</p> <button onClick={onFinish} className="bg-blue-700 text-white px-40 py-12 rounded-[7rem] font-black uppercase text-[26px] shadow-3xl mt-32 active:scale-[0.8] transition-all border-b-[24px] border-blue-900 active:border-b-0 active:translate-y-8 tracking-[0.4em]">Destroy Session</button> </div> );
  return (
    <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col overflow-hidden">
      <div className="bg-white p-10 flex justify-between items-center border-b-[48px] border-yellow-400 shadow-[0_100px_200px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-14"><div className="w-24 h-24 bg-red-600 rounded-[3.5rem] flex items-center justify-center text-white animate-pulse shadow-2xl border-[14px] border-red-100 ring-[16px] ring-red-500 shadow-red-200"><ShieldAlert size={64}/></div><div><h2 className="font-black text-slate-800 text-[32px] md:text-5xl uppercase italic tracking-tighter leading-none">{exam.title}</h2><p className="text-[22px] text-blue-700 font-black uppercase italic mt-6 tracking-[0.6em] opacity-100 flex items-center gap-10 leading-none"><User size={32}/> GLOBAL CLOUD PROCTORING ACTIVE • {exam.studentName}</p></div></div>
        <div className="flex items-center gap-20"><div className={`px-20 py-7 rounded-[4rem] font-black text-6xl md:text-9xl border-[20px] shadow-4xl tracking-tighter ring-[32px] ${timeLeft < 300 ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-slate-50 text-slate-800 border-slate-100'}`}>{formatTime(timeLeft)}</div><button onClick={() => { if(window.confirm("EXECUTE SECURE CLOUD UPLOAD?")) setIsSubmitted(true); }} className="bg-green-600 text-white px-28 py-12 rounded-[3.5rem] font-black text-[26px] uppercase shadow-4xl hover:bg-green-700 transition-all border-b-[24px] border-green-800 active:border-b-0 active:translate-y-6">SUBMIT PACKET</button></div>
      </div>
      <div className="flex-1 overflow-y-auto bg-slate-900 p-12 md:p-32"><div className="max-w-screen-2xl mx-auto space-y-20"><div className="bg-blue-900/60 border-[16px] border-blue-500/40 p-16 rounded-[7rem] flex items-center gap-16 text-blue-200 shadow-4xl backdrop-blur-3xl ring-8 ring-white/10"><div className="w-36 h-36 bg-blue-600 rounded-[4rem] flex items-center justify-center text-white shrink-0 shadow-4xl ring-[24px] ring-blue-500/20"><PenTool size={80} /></div><p className="text-[20px] md:text-[32px] font-black uppercase italic tracking-[0.1em] leading-relaxed opacity-100 underline decoration-blue-500/60 underline-offset-[16px] decoration-8">Critical Objective: Utilize physical answer scripts. Cloud surveillance detects navigation violations. Sync before countdown zero.</p></div><SecurePDFViewer fileUrl={exam.fileUrl} /></div></div>
      <div className="bg-red-900 text-white py-10 text-center text-[24px] font-black uppercase tracking-[2em] z-50 border-t-[16px] border-red-600 shadow-3xl">GLOBAL CLOUD SECURITY SHIELD ACTIVE</div>
    </div>
  );
};

export default App;
