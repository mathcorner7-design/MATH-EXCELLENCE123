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
          <p className="text-[10px] font-bold text-slate-400 uppercase">Loading Paper...</p>
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

  const handleStartExamFlow = (examData) => { setPendingExam(examData); setShowNameModal(true); };
  const finalizeExamStart = () => { if (!studentNameInput.trim()) return; setCurrentExam({ ...pendingExam, studentName: studentNameInput }); setIsExamActive(true); setShowNameModal(false); setStudentNameInput(''); };

  if (isExamActive) return <InteractiveExamHall exam={currentExam} onFinish={() => setIsExamActive(false)} />;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 select-none flex flex-col items-center overflow-x-hidden">
      {showNameModal && (
        <div className="fixed inset-0 bg-black/80 z-[1000] flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border-4 border-slate-50">
            <User size={40} className="text-blue-600 mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-6 uppercase">Student Identification</h3>
            <input autoFocus type="text" onChange={(e) => setStudentNameInput(e.target.value)} className="w-full p-3 rounded-xl border-2 border-slate-100 font-bold text-center outline-none focus:border-blue-500 mb-6" placeholder="YOUR NAME" />
            <div className="flex gap-4">
              <button onClick={() => setShowNameModal(false)} className="flex-1 py-3 rounded-xl bg-slate-100 font-bold text-[10px] uppercase">Cancel</button>
              <button onClick={finalizeExamStart} className="flex-1 py-3 rounded-xl bg-blue-700 text-white font-bold text-[10px] uppercase">Confirm</button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white border-b sticky top-0 z-50 shadow-sm px-6 py-4 flex justify-between items-center w-full max-w-6xl">
        <h1 className="text-xl font-black text-blue-700 uppercase italic tracking-tighter cursor-pointer" onClick={() => setActiveTab('home')}>MATH EXCELLENCE</h1>
        <p className="text-[10px] font-bold text-slate-400 hidden sm:block">ANSHU SIR'S ACADEMY</p>
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
            <div className="bg-white p-12 rounded-[2.5rem] shadow-xl border-4 border-slate-50 text-center relative overflow-hidden group">
               <GraduationCap size={56} className="text-blue-700 mx-auto mb-4 animate-bounce-slow" />
               <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tight">Master Mathematics <br/> <span className="text-blue-700 underline decoration-yellow-400 decoration-8 underline-offset-8">with Anshu Sir</span></h2>
               <button onClick={() => setActiveTab('live')} className="mt-10 bg-blue-700 text-white px-10 py-3 rounded-full font-bold text-[10px] uppercase shadow-xl hover:bg-blue-800 transition-all">Attend Exams</button>
            </div>
            
            <div className="bg-white p-6 rounded-3xl shadow-md border border-slate-100 text-left w-full">
              <h3 className="font-bold text-sm uppercase mb-6 flex items-center gap-3 text-slate-800 border-b pb-3 tracking-widest"><History size={18} className="text-blue-600"/> Student Activity Log</h3>
              <div className="space-y-3">
                {activityLogs.slice(0, 8).map(log => (
                  <div key={log.id} className="p-4 bg-slate-50 rounded-xl flex justify-between items-center border-l-8 border-blue-600 shadow-sm transition-all hover:bg-white">
                    <div><p className="text-[12px] font-black uppercase">{log.studentName}</p><p className="text-[9px] font-bold text-slate-400 uppercase italic">{log.examTitle} {log.scoreDisplay ? `• Score: ${log.scoreDisplay}` : ''}</p></div>
                    <div className="text-right"><p className="text-[10px] font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg">{log.timeDisplay}</p><p className="text-[8px] font-bold text-slate-300 mt-1">{log.dateDisplay}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'live' && (
          <div className="space-y-4 w-full animate-in slide-in-from-bottom-6">
            <h2 className="font-bold uppercase text-slate-700 border-b-2 pb-2 text-md flex items-center gap-2"><Clock size={18} className="text-red-600"/> Ongoing Assessments</h2>
            {liveMocks.filter(m => m.isPublished).map(m => (
              <div key={m.id} className="bg-white p-6 rounded-2xl shadow flex justify-between items-center border border-slate-100">
                <div><h3 className="text-lg font-black uppercase italic">{m.name}</h3><p className="text-[10px] font-bold text-slate-400">Timer: {m.hours}h {m.minutes}m</p></div>
                <button onClick={() => handleStartExamFlow(m)} className="bg-red-600 text-white px-8 py-2.5 rounded-full font-bold text-[10px] uppercase shadow-lg active:scale-95 transition-all">Attend</button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'teacher' && (!isTeacherAuthenticated ? 
          <div className="max-w-md w-full mx-auto mt-20 p-10 bg-white rounded-3xl shadow-xl text-center border-t-8 border-blue-700">
            <Lock size={40} className="text-blue-700 mx-auto mb-6" />
            <input type="password" onChange={(e) => { if(e.target.value === teacherPin) setIsTeacherAuthenticated(true); }} className="w-full py-4 bg-slate-50 border-2 rounded-xl text-center text-4xl font-black outline-none" placeholder="••••" />
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
              <div key={p.id} className="bg-white p-6 rounded-2xl shadow flex justify-between items-center border border-slate-100 hover:border-blue-300 transition-all">
                <div><h3 className="font-bold uppercase text-sm italic">{p.name}</h3><p className="text-[10px] font-bold text-slate-400">Time: {p.hours}h {p.minutes}m</p></div>
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

  const addPaper = async (type) => { await addDoc(collection(db, type === 'live' ? 'liveMocks' : 'practiceSets'), { name: "New Assignment", hours: 1, minutes: 0, fileUrl: "", isPublished: false, answerKey: "" }); };
  const updateField = async (id, type, field, value) => { await setDoc(doc(db, type === 'live' ? 'liveMocks' : 'practiceSets', id), { [field]: value }, { merge: true }); };
  const clearLogs = async () => { if(window.confirm("Clear all logs?")) { const q = query(collection(db, "logs")); const snapshot = await getDocs(q); const batch = writeBatch(db); snapshot.docs.forEach((d) => batch.delete(d.ref)); await batch.commit(); alert("Cleared!"); } };

  const PaperManager = ({ title, items, type, color }) => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border-t-8 border-slate-100 mb-8 w-full">
      <div className="flex justify-between items-center border-b pb-4 mb-6"><h3 className={`font-bold uppercase text-xs italic ${color}`}>{title} Manager</h3><button onClick={() => addPaper(type)} className="p-2 bg-slate-100 rounded-full shadow-sm"><PlusCircle size={20}/></button></div>
      <div className="space-y-6">{items.map(item => (
        <div key={item.id} className="p-5 bg-slate-50 rounded-2xl border-2 border-white space-y-4 shadow-sm">
          <div className="flex gap-2">
            <input type="text" value={item.name} onChange={(e) => updateField(item.id, type, 'name', e.target.value)} className="flex-1 p-2 rounded-lg border text-xs font-bold" />
            <button onClick={() => updateField(item.id, type, 'isPublished', !item.isPublished)} className={`px-4 py-1 rounded-lg text-[9px] font-bold ${item.isPublished ? 'bg-green-600 text-white' : 'bg-slate-300'}`}>{item.isPublished ? 'LIVE' : 'HIDE'}</button>
            <button onClick={async () => await deleteDoc(doc(db, type === 'live' ? 'liveMocks' : 'practiceSets', item.id))} className="text-red-400 active:scale-90"><Trash2 size={18}/></button>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-1 bg-white px-2 rounded-lg border text-[10px] font-bold shrink-0"><Timer size={12}/> <input type="number" value={item.hours} onChange={(e) => updateField(item.id, type, 'hours', e.target.value)} className="w-6 text-center" />H <input type="number" value={item.minutes} onChange={(e) => updateField(item.id, type, 'minutes', e.target.value)} className="w-6 text-center" />M</div>
            <input type="text" value={item.fileUrl} onChange={(e) => updateField(item.id, type, 'fileUrl', e.target.value)} className="flex-1 p-2 rounded-lg border text-[10px]" placeholder="Drive PDF Link" />
          </div>
          <div className="bg-white p-3 rounded-xl border border-blue-100">
             <p className="text-[9px] font-black text-blue-700 uppercase mb-2 tracking-widest flex items-center gap-2"><CheckSquare size={12}/> Answer Key (A,B,C...)</p>
             <input type="text" value={item.answerKey || ""} onChange={(e) => updateField(item.id, type, 'answerKey', e.target.value.toUpperCase())} className="w-full p-2 rounded-lg bg-blue-50/30 border-2 border-blue-100 font-bold text-xs outline-none" />
          </div>
        </div>
      ))}</div>
    </div>
  );

  return (
    <div className="w-full flex flex-col items-center">
      <div className="bg-white p-4 rounded-2xl flex justify-between items-center w-full mb-8 border-2 border-slate-50">
        <div className="flex gap-2">
          <button onClick={() => setIsChangingPin(!isChangingPin)} className="px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase">PIN</button>
          <button onClick={clearLogs} className="px-4 py-1.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold uppercase">Clear Logs</button>
        </div>
      </div>

      {isChangingPin && (
        <div className="max-w-sm w-full p-6 bg-blue-50 rounded-3xl border-2 border-blue-100 mb-8 animate-in slide-in-from-top-4">
           <input type="text" onChange={(e) => setPinVal(e.target.value)} className="w-full p-3 rounded-xl bg-white border-2 font-black text-center text-xl outline-none" placeholder="NEW PIN" />
           <button onClick={async () => { await setTeacherPin(pinVal); setIsChangingPin(false); alert("Updated!"); }} className="w-full py-2 bg-blue-700 text-white rounded-lg mt-4 font-bold uppercase text-[10px]">Save</button>
        </div>
      )}
      
      <PaperManager title="Live Mock" items={liveMocks} type="live" color="text-red-600" />
      <PaperManager title="Practice" items={practiceSets} type="practice" color="text-blue-700" />

      <div className="bg-white p-6 rounded-3xl shadow-lg border-t-8 border-slate-900 w-full mb-20 text-center">
        <h3 className="font-bold text-xs uppercase mb-6 flex items-center justify-center gap-3 text-slate-800"><Trophy size={28} className="text-yellow-600"/> Student Management</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {students.map((std) => (
            <div key={std.id} className="relative group">
              <button onClick={() => setSelectedStudentName(std.name)} className="w-full p-3 bg-slate-50 rounded-xl border-2 border-white text-[10px] font-bold uppercase hover:bg-blue-600 hover:text-white transition-all overflow-hidden truncate">{std.name}</button>
              <button onClick={async (e) => { e.stopPropagation(); if(window.confirm(`Delete ${std.name}?`)) await deleteDoc(doc(db, "students", std.id)); }} className="absolute -top-2 -right-2 p-1.5 bg-white text-red-500 rounded-full shadow border-2 border-red-50 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12}/></button>
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
    <div className="fixed inset-0 bg-white z-[1200] p-6 overflow-y-auto animate-in slide-in-from-right-full">
       <button onClick={onClose} className="flex items-center gap-2 text-[11px] font-bold text-blue-600 uppercase mb-8"><ChevronLeft size={24}/> BACK</button>
       <div className="bg-white p-6 rounded-3xl border-4 border-slate-50 shadow-2xl max-w-xl mx-auto space-y-8">
          <h3 className="text-2xl font-black uppercase italic border-b pb-4">{student} Stats</h3>
          <div className="p-6 bg-blue-50 rounded-2xl space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <input type="text" value={newRes.exam} onChange={(e) => setNewRes({...newRes, exam: e.target.value})} className="col-span-2 w-full p-3 rounded-xl border-2 font-bold text-xs outline-none" placeholder="Module Name" />
               <input type="date" value={newRes.date} onChange={(e) => setNewRes({...newRes, date: e.target.value})} className="w-full p-3 rounded-xl border-2 font-bold text-xs outline-none" />
               <div className="flex gap-2"><input type="number" placeholder="Obt" value={newRes.obtained} onChange={(e) => setNewRes({...newRes, obtained: e.target.value})} className="w-full p-3 rounded-xl border-2 font-bold text-xs text-center outline-none" /><input type="number" placeholder="Full" value={newRes.total} onChange={(e) => setNewRes({...newRes, total: e.target.value})} className="w-full p-3 rounded-xl border-2 font-bold text-xs text-center outline-none" /></div>
             </div>
             <button onClick={async () => { if(newRes.exam && newRes.obtained && newRes.total) { const p = Math.round((parseFloat(newRes.obtained)/parseFloat(newRes.total))*100); await addDoc(collection(db, "results"), { ...newRes, name: student, percent: p, timestamp: Date.now() }); setNewRes({exam: "", date: "", obtained: "", total: ""}); } }} className="w-full py-3 bg-blue-700 text-white rounded-xl font-bold uppercase text-xs">Record Manually</button>
          </div>
          <div className="space-y-3">{results.filter(r => r.name === student).sort((a,b)=>b.timestamp-a.timestamp).map(r => (<div key={r.id} className="p-4 bg-slate-50 border-2 rounded-2xl flex justify-between items-center"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-xs bg-white">{r.percent}%</div><div><p className="text-sm font-black uppercase italic">{r.exam}</p><p className="text-[10px] font-bold text-slate-400">{r.date} • {r.obtained}/{r.total}</p></div></div><button onClick={async () => await deleteDoc(doc(db, "results", r.id))} className="text-red-300"><Trash2 size={24} /></button></div>))}</div>
       </div>
    </div>
  );
};

const GrowthSectionView = ({ results, students }) => {
  const [sel, setSel] = useState(null);
  return (
    <div className="max-w-2xl mx-auto w-full animate-in fade-in">
      {!sel ? (
        <div className="grid gap-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4 italic">Public Registry:</p>
          {students.map((std) => (<button key={std.id} onClick={() => setSel(std.name)} className="w-full bg-white p-4 rounded-2xl shadow-sm border-2 border-white flex justify-between items-center group active:scale-95 transition-all"><div className="flex items-center gap-4"><User size={18} className="text-blue-700"/> <span className="font-bold text-slate-800 uppercase text-sm italic">{std.name}</span></div><ChevronRight size={24} className="text-slate-300" /></button>))}
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-right-20">
          <button onClick={() => setSel(null)} className="flex items-center gap-2 text-[11px] font-bold text-blue-600 uppercase mb-4 italic hover:underline"><ChevronLeft size={24}/> Back</button>
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-slate-50 relative">
             <div className="bg-blue-700 p-10 text-white text-center relative overflow-hidden shadow-inner"><h2 className="text-4xl font-black uppercase italic leading-none">Growth Report</h2><p className="mt-5 inline-block bg-white/20 px-8 py-2 rounded-full border border-white/40 backdrop-blur-sm text-sm font-bold uppercase italic">{sel}</p></div>
             <div className="p-6 overflow-x-auto"><table className="w-full text-sm font-bold border-separate border-spacing-y-4"><thead><tr className="text-slate-400 uppercase text-[10px] tracking-widest opacity-80"><th className="pb-4 text-left">Module</th><th className="pb-4 text-center">Score</th><th className="pb-4 text-right">Metric</th></tr></thead><tbody>{results.filter(r => r.name === sel).sort((a,b)=>new Date(b.date)-new Date(a.date)).map(r => (<tr key={r.id} className="bg-slate-50 rounded-2xl shadow-sm"><td className="p-5 uppercase text-slate-800 italic rounded-l-2xl border-l-8 border-blue-600">{r.exam}</td><td className="p-5 text-center text-blue-700 text-3xl italic tracking-tighter leading-none">{r.obtained}/{r.total}</td><td className="p-5 text-right rounded-r-2xl"><span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest border-2 shadow-sm ${r.percent >= 40 ? 'bg-green-100 text-green-700 border-green-200 shadow-green-100' : 'bg-red-100 text-red-700 border-red-200 shadow-red-100'}`}>{r.percent >= 90 ? 'MASTER' : r.percent >= 40 ? 'SUCCESS' : 'FAILURE'}</span></td></tr>))}</tbody></table></div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Sub-component: 🔴 Interactive Exam Hall ---
const InteractiveExamHall = ({ exam, onFinish }) => {
  const [timeLeft, setTimeLeft] = useState(exam.duration);
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
  };

  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' + m : m}:${sec < 10 ? '0' + sec : sec}`;
  };

  if (isSubmitted) return (
    <div className="fixed inset-0 bg-white z-[2000] flex flex-col items-center overflow-y-auto p-10 text-center animate-in zoom-in duration-700">
      <div className="w-32 h-32 bg-green-50 rounded-full flex items-center justify-center mb-6 shadow-xl border-4 border-green-100 ring-8 ring-green-50"><CheckCircle size={80} className="text-green-600 animate-bounce" /></div>
      <h2 className="text-4xl font-black text-slate-800 uppercase italic mb-6 tracking-tighter leading-none">Result</h2>
      <div className="bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100 mb-8 w-full max-w-sm shadow-inner text-center">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Final Score</p>
         <h3 className="text-5xl font-black text-blue-700">{scoreData?.correct} / {scoreData?.total}</h3>
      </div>
      <div className="w-full max-w-lg space-y-3 mb-10 text-left">
         <h4 className="text-xs font-black text-slate-600 uppercase border-b pb-2 tracking-widest">Question Analysis:</h4>
         {scoreData?.details.map(item => (
           <div key={item.qNum} className={`p-4 rounded-2xl border-2 flex justify-between items-center ${item.status ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
             <span className="font-black text-xs italic">Question {item.qNum}</span>
             <span className="text-[10px] font-bold uppercase">You: {item.selected} | Key: {item.correct}</span>
             {item.status ? <CheckSquare size={16}/> : <AlertCircle size={16}/>}
           </div>
         ))}
      </div>
      <button onClick={onFinish} className="bg-blue-700 text-white px-16 py-5 rounded-full font-black uppercase text-[15px] shadow-lg mt-12 active:scale-95 transition-all border-b-8 border-blue-900 active:border-b-0 mb-10">Exit Session</button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col overflow-hidden">
      <div className="bg-white p-3 md:p-4 flex justify-between items-center border-b-8 border-yellow-400 shadow-2xl relative z-50">
        <div className="flex items-center gap-4"><div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-red-200 animate-pulse border-2 border-red-50"><ShieldAlert size={20}/></div><div><h2 className="font-black text-slate-800 text-sm md:text-xl uppercase italic tracking-tighter leading-none">{exam.name}</h2><p className="text-[9px] md:text-[11px] text-blue-700 font-black uppercase mt-1">{exam.studentName}</p></div></div>
        <div className="flex items-center gap-6">
          <div className={`px-4 py-1.5 rounded-2xl font-black text-2xl md:text-4xl border-4 ${timeLeft < 300 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-slate-50 text-slate-800 border-slate-100'}`}>{formatTime(timeLeft)}</div>
          <button onClick={() => { if(window.confirm("SUBMIT?")) submitExam(); }} className="bg-green-600 text-white px-8 md:px-12 py-3 rounded-full font-black text-[12px] uppercase shadow-3xl hover:bg-green-700 border-b-4 border-green-800 active:border-b-0">SUBMIT</button>
        </div>
      </div>
      
      <div className="flex-1 bg-slate-900 overflow-hidden relative">
         <SecurePDFViewer fileUrl={exam.fileUrl} />
         <div className="absolute bottom-0 left-0 right-0 z-50 bg-slate-800/95 border-t-4 border-slate-700 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] backdrop-blur-md p-4">
            <div className="max-w-4xl mx-auto">
               <div className="flex items-center justify-between mb-4 px-2">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2"><PenTool size={14}/> DIGITAL OMR PANEL</span>
                  {activeQuestion && <button onClick={() => setActiveQuestion(null)} className="text-slate-400 font-black text-[10px] uppercase"><X size={14}/></button>}
               </div>
               {activeQuestion ? (
                 <div className="flex flex-col items-center animate-in slide-in-from-bottom-2 duration-200">
                    <p className="text-slate-200 font-bold text-sm mb-4">Select Option for Q: {activeQuestion}</p>
                    <div className="flex gap-4 mb-2">
                      {['A', 'B', 'C', 'D'].map(opt => (
                        <button key={opt} onClick={() => { setAnswers({...answers, [activeQuestion]: opt}); setActiveQuestion(null); }} className={`w-14 h-14 rounded-2xl font-black text-xl flex items-center justify-center border-b-4 transition-all active:scale-90 ${answers[activeQuestion] === opt ? 'bg-blue-600 text-white border-blue-900' : 'bg-slate-700 text-slate-300 border-slate-950 hover:bg-slate-600'}`}>{opt}</button>
                      ))}
                    </div>
                 </div>
               ) : (
                 <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar snap-x items-center">
                    {answerKeyArray.map((_, index) => {
                      const num = index + 1;
                      return (
                        <button key={num} onClick={() => setActiveQuestion(num)} className={`min-w-[48px] h-[48px] rounded-xl font-black text-sm flex items-center justify-center transition-all snap-center border-b-4 ${answers[num] ? 'bg-green-600 text-white border-green-900' : 'bg-slate-700 text-slate-400 border-slate-900 hover:bg-slate-600'}`}>{num}</button>
                      );
                    })}
                 </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default App;
