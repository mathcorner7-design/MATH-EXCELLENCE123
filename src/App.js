import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, doc, setDoc, deleteDoc, getDocs, writeBatch } from "firebase/firestore";
import { 
  Trophy, BookOpen, TrendingUp, User, Clock, ChevronRight, GraduationCap, PlusCircle, 
  FileText, Lock, Award, Timer, Settings2, CheckCircle, PenTool, ShieldAlert, 
  Loader2, ChevronLeft, Trash2, UserPlus, History, UserCheck, X, CheckSquare, AlertCircle
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

// --- 🛡️ Secure PDF Viewer ---
const SecurePDFViewer = ({ fileUrl }) => {
  const [loading, setLoading] = useState(true);
  const getEmbedUrl = (url) => {
    if (!url) return "";
    if (url.includes('drive.google.com')) return url.replace('/view?usp=sharing', '/preview').replace('/view', '/preview').split('/edit')[0];
    return url;
  };
  return (
    <div className="w-full h-full bg-slate-100 relative shadow-inner">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-20">
          <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Establishing Security...</p>
        </div>
      )}
      <iframe src={getEmbedUrl(fileUrl)} className="w-full h-full relative z-10" onLoad={() => setLoading(false)} title="Paper" />
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
  const [practiceSets, setPracticeSets] = useState([]);
  const [students, setStudents] = useState([]);
  const [studentResults, setStudentResults] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  useEffect(() => {
    onSnapshot(collection(db, "liveMocks"), (s) => setLiveMocks(s.docs.map(d => ({id: d.id, ...d.data()}))));
    onSnapshot(collection(db, "practiceSets"), (s) => setPracticeSets(s.docs.map(d => ({id: d.id, ...d.data()}))));
    onSnapshot(collection(db, "results"), (s) => setStudentResults(s.docs.map(d => ({id: d.id, ...d.data()}))));
    onSnapshot(collection(db, "students"), (s) => setStudents(s.docs.map(d => ({id: d.id, ...d.data()})).sort((a,b) => a.name.localeCompare(b.name))));
    onSnapshot(doc(db, "settings", "adminConfig"), (d) => { if (d.exists()) setTeacherPin(d.data().pin); });
    onSnapshot(query(collection(db, "logs"), orderBy("timestamp", "desc")), (s) => setActivityLogs(s.docs.map(d => ({id: d.id, ...d.data()}))));
  }, []);

  const handleStartExamFlow = (examData) => {
    // এখানে ডিফল্ট ভ্যালু চেক করা হচ্ছে যাতে NaN না আসে
    const h = parseInt(examData.hours) || 0;
    const m = parseInt(examData.minutes) || 0;
    const totalSec = (h * 3600) + (m * 60);
    setPendingExam({ ...examData, duration: totalSec });
    setShowNameModal(true);
  };

  const finalizeExamStart = () => {
    if (!studentNameInput.trim()) return;
    setCurrentExam({ ...pendingExam, studentName: studentNameInput });
    setIsExamActive(true);
    setShowNameModal(false);
    setStudentNameInput('');
  };

  if (isExamActive) return <InteractiveExamHall exam={currentExam} onFinish={() => setIsExamActive(false)} />;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 select-none flex flex-col items-center overflow-x-hidden">
      {showNameModal && (
        <div className="fixed inset-0 bg-black/80 z-[1000] flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border-4 border-slate-50 animate-in zoom-in duration-300">
            <User size={40} className="text-blue-600 mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-6 uppercase">Student Login</h3>
            <input autoFocus type="text" onChange={(e) => setStudentNameInput(e.target.value)} className="w-full p-3 rounded-xl border-2 border-slate-100 font-bold text-center outline-none focus:border-blue-500 mb-6" placeholder="NAME" />
            <div className="flex gap-4">
              <button onClick={() => setShowNameModal(false)} className="flex-1 py-3 rounded-xl bg-slate-100 font-bold text-[10px] uppercase">Cancel</button>
              <button onClick={finalizeExamStart} className="flex-1 py-3 rounded-xl bg-blue-700 text-white font-bold text-[10px] uppercase">Confirm</button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white border-b sticky top-0 z-50 shadow-sm px-6 py-4 flex justify-between items-center w-full max-w-6xl">
        <h1 className="text-xl font-black text-blue-700 uppercase italic tracking-tighter cursor-pointer" onClick={() => setActiveTab('home')}>MATH EXCELLENCE</h1>
        <p className="text-[10px] font-bold text-slate-400 hidden sm:block uppercase tracking-widest italic">Anshu Sir's Coaching Portal</p>
      </header>

      <nav className="bg-blue-700 text-white w-full sticky top-[62px] z-40 flex justify-center shadow-lg">
        <div className="max-w-6xl w-full flex overflow-x-auto no-scrollbar">
          {[{ id: 'home', label: 'Home', icon: <History size={14}/> }, { id: 'live', label: 'Live Mock', icon: <Clock size={14}/> }, { id: 'practice', label: 'Practice', icon: <BookOpen size={14}/> }, { id: 'growth', label: 'Growth', icon: <TrendingUp size={14}/> }, { id: 'teacher', label: 'Admin', icon: <User size={14}/> }].map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-4 font-bold text-[10px] uppercase border-b-4 transition-all ${activeTab === item.id ? 'border-yellow-400 bg-blue-800' : 'border-transparent'}`}>{item.icon} {item.label}</button>
          ))}
        </div>
      </nav>

      <main className="w-full max-w-5xl p-6 mb-20 flex flex-col items-center">
        {activeTab === 'home' && (
          <div className="space-y-10 animate-in fade-in w-full">
            <div className="bg-white p-12 rounded-[2.5rem] shadow-xl border-4 border-slate-50 text-center relative group">
               <GraduationCap size={64} className="text-blue-700 mx-auto mb-4 animate-bounce-slow" />
               <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tight leading-tight">Master Mathematics <br/> <span className="text-blue-700 underline decoration-yellow-400 decoration-8 underline-offset-8">with Anshu Sir</span></h2>
               <button onClick={() => setActiveTab('live')} className="mt-10 bg-blue-700 text-white px-10 py-3 rounded-full font-bold text-[10px] uppercase shadow-xl hover:bg-blue-800 transition-all">Attend Exams</button>
            </div>
            
            <div className="bg-white p-6 rounded-3xl shadow-md border border-slate-100 text-left w-full">
              <h3 className="font-bold text-sm uppercase mb-6 border-b pb-3 flex items-center gap-3"><History size={18} className="text-blue-600"/> Activity Log</h3>
              <div className="space-y-3">
                {activityLogs.slice(0, 8).map(log => (
                  <div key={log.id} className="p-4 bg-slate-50 rounded-xl flex justify-between items-center border-l-8 border-blue-600 transition-all hover:bg-white shadow-sm">
                    <div><p className="text-[12px] font-black uppercase text-slate-800">{log.studentName}</p><p className="text-[9px] font-bold text-slate-400 uppercase italic">{log.examTitle} {log.scoreDisplay ? `• Score: ${log.scoreDisplay}` : ''}</p></div>
                    <div className="text-right"><p className="text-[10px] font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg">{log.timeDisplay}</p><p className="text-[8px] font-bold text-slate-300 mt-1">{log.dateDisplay}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'live' && (
          <div className="space-y-4 w-full animate-in slide-in-from-bottom-6">
            <h2 className="font-bold uppercase text-slate-700 border-b-2 pb-2 text-md flex items-center gap-2"><Clock size={18} className="text-red-600"/> Live assessments</h2>
            {liveMocks.filter(m => m.isPublished).map(m => (
              <div key={m.id} className="bg-white p-6 rounded-3xl shadow flex justify-between items-center border border-slate-100 group">
                <div><h3 className="text-lg font-black uppercase italic tracking-tighter">{m.name}</h3><p className="text-[10px] font-bold text-red-600 uppercase">Duration: {m.hours || 0}h {m.minutes || 0}m</p></div>
                <button onClick={() => handleStartExamFlow(m)} className="bg-red-600 text-white px-8 py-2.5 rounded-full font-bold text-[10px] uppercase shadow-lg active:scale-95 transition-all">Attend</button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'teacher' && (!isTeacherAuthenticated ? 
          <div className="max-w-md w-full mx-auto mt-20 p-10 bg-white rounded-3xl shadow-xl text-center border-t-8 border-blue-700">
            <Lock size={40} className="text-blue-700 mx-auto mb-6" />
            <input type="password" onChange={(e) => { if(e.target.value === teacherPin) setIsTeacherAuthenticated(true); }} className="w-full py-4 bg-slate-50 border-2 rounded-xl text-center text-4xl font-black outline-none shadow-inner" placeholder="••••" />
          </div> : 
          <TeacherZoneMainView 
            liveMocks={liveMocks} practiceSets={practiceSets} students={students} teacherPin={teacherPin}
            setTeacherPin={async (v) => await setDoc(doc(db, "settings", "adminConfig"), { pin: v }, { merge: true })}
            studentResults={studentResults}
          />
        )}

        {activeTab === 'growth' && <GrowthSectionView results={studentResults} students={students} />}
        
        {activeTab === 'practice' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {practiceSets.filter(p => p.isPublished).map(p => (
              <div key={p.id} className="bg-white p-6 rounded-3xl shadow flex justify-between items-center border border-slate-100 hover:border-blue-300 transition-all">
                <div><h3 className="font-bold uppercase text-sm italic">{p.name}</h3><p className="text-[10px] font-bold text-slate-400">Time: {p.hours || 0}h {p.minutes || 0}m</p></div>
                <button onClick={() => handleStartExamFlow(p)} className="bg-blue-700 text-white px-6 py-2 rounded-full font-bold text-[10px] uppercase shadow-md active:scale-95 transition-all">Start</button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

// --- Sub-component: Teacher Zone ---
const TeacherZoneMainView = ({ liveMocks, practiceSets, students, teacherPin, setTeacherPin, studentResults }) => {
  const [selectedStudentName, setSelectedStudentName] = useState(null);
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [pinVal, setPinVal] = useState('');

  const addPaper = async (type) => { 
    const coll = type === 'live' ? 'liveMocks' : 'practiceSets';
    await addDoc(collection(db, coll), { name: "New Slot", hours: "1", minutes: "0", fileUrl: "", isPublished: false, answerKey: "" }); 
  };
  const updateField = async (id, type, field, value) => { 
    const coll = type === 'live' ? 'liveMocks' : 'practiceSets';
    await setDoc(doc(db, coll, id), { [field]: value }, { merge: true }); 
  };
  const clearLogs = async () => { if(window.confirm("Clear all logs?")) { const q = query(collection(db, "logs")); const snapshot = await getDocs(q); const batch = writeBatch(db); snapshot.docs.forEach((d) => batch.delete(d.ref)); await batch.commit(); alert("Cleared!"); } };

  const PaperManager = ({ title, items, type, color }) => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border-t-8 border-slate-100 mb-8 w-full">
      <div className="flex justify-between items-center border-b pb-4 mb-6"><h3 className={`font-bold uppercase text-xs italic ${color}`}>{title} Manager</h3><button onClick={() => addPaper(type)} className="p-2 bg-slate-100 rounded-full active:scale-90 border-2 border-white shadow-sm"><PlusCircle size={20}/></button></div>
      <div className="space-y-6">{items.map(item => (
        <div key={item.id} className="p-5 bg-slate-50 rounded-2xl border-2 border-white space-y-4 shadow-sm">
          <div className="flex gap-2">
            <input type="text" value={item.name} onChange={(e) => updateField(item.id, type, 'name', e.target.value)} className="flex-1 p-2 rounded-lg border text-xs font-bold uppercase outline-none" placeholder="Paper Name" />
            <button onClick={() => updateField(item.id, type, 'isPublished', !item.isPublished)} className={`px-4 py-1 rounded-lg text-[9px] font-bold ${item.isPublished ? 'bg-green-600 text-white' : 'bg-slate-300'}`}>{item.isPublished ? 'LIVE' : 'HIDE'}</button>
            <button onClick={async () => { if(window.confirm("Delete?")) await deleteDoc(doc(db, type === 'live' ? 'liveMocks' : 'practiceSets', item.id)); }} className="text-red-400 active:scale-90"><Trash2 size={18}/></button>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-1 bg-white px-2 rounded-lg border text-[10px] font-bold shrink-0 shadow-inner">
               <Timer size={12}/> 
               <input type="number" value={item.hours} onChange={(e) => updateField(item.id, type, 'hours', e.target.value)} className="w-8 text-center bg-transparent outline-none" />H 
               <input type="number" value={item.minutes} onChange={(e) => updateField(item.id, type, 'minutes', e.target.value)} className="w-8 text-center bg-transparent outline-none" />M
            </div>
            <input type="text" value={item.fileUrl} onChange={(e) => updateField(item.id, type, 'fileUrl', e.target.value)} className="flex-1 p-2 rounded-lg border text-[10px] outline-none" placeholder="Google Drive PDF Link" />
          </div>
          <div className="bg-white p-3 rounded-xl border border-blue-100">
             <p className="text-[8px] font-black text-blue-700 uppercase mb-2 flex items-center gap-2 tracking-widest"><CheckSquare size={12}/> Answer Key (A,B,C,D...)</p>
             <input type="text" value={item.answerKey || ""} onChange={(e) => updateField(item.id, type, 'answerKey', e.target.value.toUpperCase())} className="w-full p-2 rounded-lg bg-blue-50/30 border-2 border-blue-100 font-bold text-xs outline-none" placeholder="e.g. A,D,B,C" />
          </div>
        </div>
      ))}</div>
    </div>
  );

  return (
    <div className="w-full flex flex-col items-center animate-in slide-in-from-right-8 duration-500">
      <div className="bg-white p-4 rounded-2xl flex justify-between items-center w-full mb-8 border-2 border-slate-50 shadow-sm">
        <div className="flex gap-2">
          <button onClick={() => setIsChangingPin(!isChangingPin)} className="px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase shadow-sm">PIN</button>
          <button onClick={clearLogs} className="px-4 py-1.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold uppercase shadow-sm">Clear Logs</button>
        </div>
      </div>

      {isChangingPin && (
        <div className="max-w-sm w-full p-6 bg-blue-50 rounded-3xl border-2 border-blue-100 mb-8 animate-in slide-in-from-top-4">
           <input type="text" onChange={(e) => setPinVal(e.target.value)} className="w-full p-3 rounded-xl bg-white border-2 font-black text-center text-xl outline-none shadow-inner" placeholder="NEW PIN" />
           <button onClick={async () => { if(pinVal.length >= 4) { await setTeacherPin(pinVal); setIsChangingPin(false); alert("Updated!"); } else { alert("Min 4 chars"); } }} className="w-full py-2 bg-blue-700 text-white rounded-lg mt-4 font-bold uppercase text-[10px] shadow-lg active:scale-95">Save</button>
        </div>
      )}
      
      <PaperManager title="Live Mock" items={liveMocks} type="live" color="text-red-600" />
      <PaperManager title="Practice" items={practiceSets} type="practice" color="text-blue-700" />

      <div className="bg-white p-6 rounded-3xl shadow-lg border-t-8 border-slate-900 w-full mb-20 text-center">
        <h3 className="font-bold text-xs uppercase mb-6 flex items-center justify-center gap-3 text-slate-800 border-b pb-2"><Trophy size={28} className="text-yellow-600"/> Student Registry</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {students.map((std) => (
            <div key={std.id} className="relative group transition-all">
              <button onClick={() => setSelectedStudentName(std.name)} className="w-full p-3 bg-slate-50 rounded-xl border-2 border-white text-[10px] font-bold uppercase hover:bg-blue-700 hover:text-white transition-all overflow-hidden truncate shadow-sm italic">{std.name}</button>
              <button onClick={async (e) => { e.stopPropagation(); if(window.confirm(`Delete ${std.name}?`)) await deleteDoc(doc(db, "students", std.id)); }} className="absolute -top-2 -right-2 p-1.5 bg-white text-red-500 rounded-full shadow-lg border-2 border-red-50 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12}/></button>
            </div>
          ))}
          <button onClick={async () => { const n = prompt("Name:"); if(n) await addDoc(collection(db, "students"), {name: n}); }} className="p-3 border-2 border-dashed border-slate-100 rounded-xl text-[10px] font-bold text-slate-300 uppercase hover:text-blue-600 transition-all">+ REGISTER</button>
        </div>
      </div>
      {selectedStudentName && <AdminMarksheetModal student={selectedStudentName} results={studentResults} onClose={() => setSelectedStudentName(null)} />}
    </div>
  );
};

const AdminMarksheetModal = ({ student, results, onClose }) => {
  const [newRes, setNewRes] = useState({ exam: "", date: "", obtained: "", total: "" });
  return (
    <div className="fixed inset-0 bg-white z-[1200] p-6 overflow-y-auto animate-in slide-in-from-right-full duration-500">
       <button onClick={onClose} className="flex items-center gap-2 text-[11px] font-bold text-blue-600 uppercase mb-8 hover:underline"><ChevronLeft size={24}/> BACK</button>
       <div className="bg-white p-8 rounded-[3rem] border-4 border-slate-100 shadow-2xl max-w-xl mx-auto space-y-10">
          <div className="flex items-center gap-4 border-b-4 border-slate-50 pb-6">
            <div className="w-16 h-16 bg-blue-700 rounded-2xl flex items-center justify-center text-white shadow-xl"><User size={32}/></div>
            <h3 className="text-3xl font-black uppercase italic tracking-tighter">{student} Profiling</h3>
          </div>
          <div className="p-6 bg-blue-50 rounded-3xl space-y-4 shadow-inner border-2 border-blue-100">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <input type="text" value={newRes.exam} onChange={(e) => setNewRes({...newRes, exam: e.target.value})} className="col-span-2 w-full p-3 rounded-xl border-2 font-bold text-xs outline-none shadow-sm" placeholder="Module Name" />
               <input type="date" value={newRes.date} onChange={(e) => setNewRes({...newRes, date: e.target.value})} className="w-full p-3 rounded-xl border-2 font-bold text-xs outline-none shadow-sm" />
               <div className="flex gap-2"><input type="number" placeholder="Obt" value={newRes.obtained} onChange={(e) => setNewRes({...newRes, obtained: e.target.value})} className="w-full p-3 rounded-xl border-2 font-bold text-xs text-center outline-none shadow-sm" /><input type="number" placeholder="Full" value={newRes.total} onChange={(e) => setNewRes({...newRes, total: e.target.value})} className="w-full p-3 rounded-xl border-2 font-bold text-xs text-center outline-none shadow-sm" /></div>
             </div>
             <button onClick={async () => { if(newRes.exam && newRes.obtained && newRes.total) { const p = Math.round((parseFloat(newRes.obtained)/parseFloat(newRes.total))*100); await addDoc(collection(db, "results"), { ...newRes, name: student, percent: p, timestamp: Date.now() }); setNewRes({exam: "", date: "", obtained: "", total: ""}); } }} className="w-full py-4 bg-blue-700 text-white rounded-2xl font-bold uppercase text-xs shadow-xl active:scale-95">Record Performance</button>
          </div>
          <div className="space-y-4 pt-6">
             {results.filter(r => r.name === student).sort((a,b)=>b.timestamp-a.timestamp).map(r => (<div key={r.id} className="p-5 bg-slate-50 border-2 rounded-[2rem] flex justify-between items-center shadow-md transition-all hover:bg-white group"><div className="flex items-center gap-6"><div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center font-black text-xl shadow-lg border-2 border-slate-100 group-hover:text-blue-700 transition-colors">{r.percent}%</div><div><p className="text-[14px] font-black uppercase italic tracking-tighter">{r.exam}</p><p className="text-[11px] font-bold text-slate-400 mt-1">{r.date} • Score: {r.obtained}/{r.total}</p></div></div><button onClick={async () => { if(window.confirm("Purge?")) await deleteDoc(doc(db, "results", r.id)); }} className="text-red-200 hover:text-red-600 transition-colors active:scale-90"><Trash2 size={28} /></button></div>))}
          </div>
       </div>
    </div>
  );
};

const GrowthSectionView = ({ results, students }) => {
  const [sel, setSel] = useState(null);
  return (
    <div className="max-w-2xl mx-auto w-full animate-in fade-in duration-500">
      {!sel ? (
        <div className="grid gap-5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-6 italic">Database Search:</p>
          {students.map((std) => (<button key={std.id} onClick={() => setSel(std.name)} className="w-full bg-white p-6 rounded-[2rem] shadow-xl border-4 border-white flex justify-between items-center group active:scale-95 transition-all hover:border-blue-200"><div className="flex items-center gap-6"><div className="w-12 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-700 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all"><User size={20}/></div> <span className="font-black text-slate-800 uppercase text-[15px] italic tracking-tight">{std.name}</span></div><ChevronRight size={28} className="text-slate-200 group-hover:text-blue-600 transition-colors" /></button>))}
        </div>
      ) : (
        <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
          <button onClick={() => setSel(null)} className="flex items-center gap-3 text-[12px] font-black text-blue-600 uppercase mb-4 italic hover:underline decoration-2 underline-offset-8 transition-all"><ChevronLeft size={28}/> Return to Registry</button>
          <div className="bg-white rounded-[4rem] shadow-3xl overflow-hidden border-[12px] border-slate-50 relative">
             <div className="bg-blue-700 p-12 text-white text-center relative overflow-hidden"><Trophy className="absolute -top-24 -right-24 opacity-10 rotate-12 animate-pulse" size={200}/><h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none mb-6">Growth Report</h2><div className="inline-block bg-white/20 px-10 py-3 rounded-full border-2 border-white/40 shadow-2xl backdrop-blur-md"><p className="text-lg font-black uppercase tracking-[0.3em] italic">{sel}</p></div></div>
             <div className="p-8 overflow-x-auto"><table className="w-full text-[13px] font-bold border-separate border-spacing-y-4"><thead><tr className="text-slate-400 uppercase text-[11px] tracking-widest opacity-80"><th className="pb-4 text-left">Academic Unit</th><th className="pb-4 text-center">Score</th><th className="pb-4 text-right">Performance Rank</th></tr></thead><tbody>{results.filter(r => r.name === sel).sort((a,b)=>new Date(b.date)-new Date(a.date)).map(r => (<tr key={r.id} className="bg-slate-50 rounded-2xl shadow-sm"><td className="p-6 uppercase text-slate-800 italic rounded-l-2xl border-l-[12px] border-blue-600 tracking-tighter text-lg leading-none">{r.exam}</td><td className="p-6 text-center text-blue-700 text-4xl italic tracking-tighter leading-none font-black">{r.obtained}/{r.total}</td><td className="p-6 text-right rounded-r-2xl"><span className={`px-6 py-2 rounded-full text-[11px] font-black tracking-widest border-4 shadow-xl ${r.percent >= 40 ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>{r.percent >= 90 ? 'MASTER' : r.percent >= 40 ? 'SUCCESS' : 'FAILURE'}</span></td></tr>))}</tbody></table></div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Sub-component: 🔴 Interactive Exam Hall (টাইমার ও ওএমআর ফিক্স) ---
const InteractiveExamHall = ({ exam, onFinish }) => {
  // এখানে নিশ্চিত করা হচ্ছে যে ভ্যালুগুলো নাম্বার হিসেবেই যাচ্ছে
  const h = parseInt(exam.hours) || 0;
  const m = parseInt(exam.minutes) || 0;
  const initialTime = (h * 3600) + (m * 60);

  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [scoreData, setScoreData] = useState(null);

  const answerKeyArray = exam.answerKey ? exam.answerKey.split(',').map(k => k.trim().toUpperCase()) : [];

  useEffect(() => {
    let timer;
    if (!isSubmitted && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && !isSubmitted) {
      submitExam();
    }
    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted]);

  const submitExam = async () => {
    let correctCount = 0;
    const detailResults = answerKeyArray.map((key, index) => {
      const qNum = index + 1;
      const isCorrect = answers[qNum] === key;
      if (isCorrect) correctCount++;
      return { qNum, selected: answers[qNum] || 'None', correct: key, status: isCorrect };
    });
    const percent = answerKeyArray.length > 0 ? Math.round((correctCount / answerKeyArray.length) * 100) : 0;
    setScoreData({ correct: correctCount, total: answerKeyArray.length, percent, details: detailResults });
    setIsSubmitted(true);

    const d = new Date();
    await addDoc(collection(db, "logs"), { 
      studentName: exam.studentName, examTitle: exam.name, timestamp: Date.now(), 
      timeDisplay: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dateDisplay: d.toLocaleDateString('en-GB'),
      scoreDisplay: `${correctCount} / ${answerKeyArray.length}`
    });
    
    await addDoc(collection(db, "results"), {
      name: exam.studentName, exam: exam.name, percent,
      obtained: correctCount, total: answerKeyArray.length, date: d.toLocaleDateString('en-GB'), timestamp: Date.now()
    });
  };

  const formatTime = (s) => {
    if (isNaN(s)) return "00:00";
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    return `${hrs > 0 ? hrs + ':' : ''}${mins < 10 ? '0' + mins : mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  if (isSubmitted) return (
    <div className="fixed inset-0 bg-white z-[2000] flex flex-col items-center overflow-y-auto p-12 text-center animate-in zoom-in duration-1000">
      <div className="w-32 h-32 bg-green-50 rounded-full flex items-center justify-center mb-8 shadow-3xl border-8 border-white ring-[12px] ring-green-50 animate-bounce"><CheckCircle size={80} className="text-green-600" /></div>
      <h2 className="text-5xl font-black text-slate-800 uppercase italic mb-8 tracking-tighter leading-none underline decoration-green-600 decoration-[12px] underline-offset-[20px]">EVALUATED</h2>
      <div className="bg-slate-50 p-10 rounded-[4rem] border-8 border-white mb-12 w-full max-w-sm shadow-[0_40px_80px_-15px_rgba(0,0,0,0.15)] ring-4 ring-slate-100 text-center">
         <p className="text-[14px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Metric Score</p>
         <h3 className="text-7xl font-black text-blue-700 italic tracking-tighter">{scoreData?.correct} / {scoreData?.total}</h3>
      </div>
      <div className="w-full max-w-xl space-y-5 mb-16 text-left">
         <h4 className="text-[15px] font-black text-slate-700 uppercase border-b-4 border-slate-100 pb-4 tracking-[0.2em] italic flex items-center gap-4"><CheckSquare size={24} className="text-blue-600"/> Tactical Review:</h4>
         {scoreData?.details.map(item => (
           <div key={item.qNum} className={`p-6 rounded-[2rem] border-[6px] border-white shadow-xl flex justify-between items-center transition-all hover:scale-[1.02] ${item.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
             <div><p className="font-black text-lg uppercase italic tracking-tighter">Question {item.qNum}</p><p className="text-[11px] font-bold mt-1 opacity-80">You: {item.selected} • Key: {item.correct}</p></div>
             {item.status ? <CheckSquare size={32}/> : <AlertCircle size={32}/>}
           </div>
         ))}
      </div>
      <button onClick={onFinish} className="bg-blue-700 text-white px-24 py-8 rounded-[4rem] font-black uppercase text-[18px] shadow-3xl active:scale-90 transition-all border-b-[16px] border-blue-950 active:border-b-0 active:translate-y-6 mb-24">Finalize Session</button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col overflow-hidden animate-in fade-in duration-1000">
      <div className="bg-white p-4 md:p-6 flex justify-between items-center border-b-[20px] border-yellow-400 shadow-[0_30px_60px_rgba(0,0,0,0.6)] relative z-[100]">
        <div className="flex items-center gap-6"><div className="w-14 h-14 bg-red-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl animate-pulse ring-8 ring-red-50"><ShieldAlert size={32}/></div><div><h2 className="font-black text-slate-800 text-lg md:text-3xl uppercase italic tracking-tighter leading-none">{exam.name}</h2><p className="text-[11px] md:text-[14px] text-blue-700 font-black uppercase mt-2 italic tracking-[0.3em] opacity-100">Live Surveillance Active • {exam.studentName}</p></div></div>
        <div className="flex items-center gap-10">
          <div className={`px-10 py-3 rounded-3xl font-black text-4xl md:text-7xl border-[10px] shadow-4xl tracking-tighter ring-[16px] ${timeLeft < 300 ? 'bg-red-50 text-red-600 border-red-200 animate-pulse ring-red-100' : 'bg-slate-50 text-slate-800 border-slate-100 ring-slate-50'}`}>{formatTime(timeLeft)}</div>
          <button onClick={() => { if(window.confirm("EXECUTE SECURE UPLOAD?")) submitExam(); }} className="bg-green-600 text-white px-16 py-6 rounded-[2rem] font-black text-[20px] uppercase shadow-3xl hover:bg-green-700 transition-all border-b-[14px] border-green-800 active:border-b-0 active:translate-y-4">SUBMIT</button>
        </div>
      </div>
      <div className="flex-1 bg-slate-900 overflow-hidden relative">
         <SecurePDFViewer fileUrl={exam.fileUrl} />
         <div className="absolute bottom-0 left-0 right-0 z-[100] bg-slate-800/95 border-t-[8px] border-slate-700 shadow-[0_-30px_60px_rgba(0,0,0,0.6)] backdrop-blur-3xl p-8 ring-inset ring-2 ring-white/10">
            <div className="max-w-6xl mx-auto">
               <div className="flex items-center justify-between mb-8 px-4">
                  <span className="text-[14px] font-black text-blue-400 uppercase tracking-[0.6em] flex items-center gap-5 italic"><PenTool size={28}/> DIGITAL RESPONSE TERMINAL</span>
                  {activeQuestion && <button onClick={() => setActiveQuestion(null)} className="text-slate-400 font-black text-[12px] uppercase bg-slate-900 px-6 py-2 rounded-full border-2 border-slate-700 hover:text-white transition-all shadow-xl">Close Question</button>}
               </div>
               {activeQuestion ? (
                 <div className="flex flex-col items-center animate-in slide-in-from-bottom-6 duration-500 pb-6">
                    <p className="text-white font-black text-3xl uppercase italic tracking-tighter mb-10 underline decoration-blue-600 decoration-8 underline-offset-[12px]">Inputting for Question: {activeQuestion}</p>
                    <div className="flex gap-8 mb-4">
                      {['A', 'B', 'C', 'D'].map(opt => (
                        <button key={opt} onClick={() => { setAnswers({...answers, [activeQuestion]: opt}); setActiveQuestion(null); }} className={`w-28 h-28 rounded-[3rem] font-black text-5xl flex items-center justify-center border-b-[16px] shadow-3xl active:scale-90 transition-all ${answers[activeQuestion] === opt ? 'bg-blue-600 text-white border-blue-900' : 'bg-slate-700 text-slate-300 border-slate-950 hover:bg-slate-600'}`}>{opt}</button>
                      ))}
                    </div>
                 </div>
               ) : (
                 <div className="flex overflow-x-auto gap-6 pb-6 no-scrollbar snap-x items-center">
                    {answerKeyArray.map((_, index) => {
                      const num = index + 1;
                      return (
                        <button key={num} onClick={() => setActiveQuestion(num)} className={`min-w-[70px] h-[70px] rounded-[1.5rem] font-black text-2xl flex items-center justify-center transition-all snap-center border-b-[12px] shadow-2xl active:scale-90 ${answers[num] ? 'bg-green-600 text-white border-green-900 scale-110' : 'bg-slate-700 text-slate-400 border-slate-900 hover:bg-slate-600'}`}>{num}</button>
                      );
                    })}
                    <div className="min-w-[150px] text-center border-l-4 border-slate-700 pl-6"><p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] animate-pulse">End of Sequence</p></div>
                 </div>
               )}
            </div>
         </div>
      </div>
      <div className="bg-red-900 text-white py-4 text-center text-[12px] font-black uppercase tracking-[1.5em] z-[110] border-t-[10px] border-red-600 shadow-[0_-20px_50px_rgba(0,0,0,0.6)]">CLOUD SECURITY LAYER ACTIVE • DO NOT REFRESH • DO NOT EXIT TERMINAL</div>
    </div>
  );
};

export default App;
