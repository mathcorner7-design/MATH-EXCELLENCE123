import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, doc, setDoc, deleteDoc, getDoc, serverTimestamp } from "firebase/firestore";
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

// --- Sub-component: PDF Renderer ---
const PDFToImageDisplay = ({ fileUrl }) => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const initRendering = async () => {
      try {
        if (!window.pdfjsLib) {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
          document.head.appendChild(script);
          script.onload = () => processPDF();
        } else {
          processPDF();
        }
      } catch (err) { if (isMounted) setLoading(false); }
    };
    const processPDF = async () => {
      try {
        const pdfjsLib = window.pdfjsLib;
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
        const pdf = await pdfjsLib.getDocument(fileUrl).promise;
        const pageImages = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          await page.render({ canvasContext: context, viewport: viewport }).promise;
          pageImages.push(canvas.toDataURL('image/png'));
        }
        if (isMounted) { setPages(pageImages); setLoading(false); }
      } catch (e) { if (isMounted) setLoading(false); }
    };
    initRendering();
    return () => { isMounted = false; };
  }, [fileUrl]);

  if (loading) return <div className="flex flex-col items-center py-10"><Loader2 className="animate-spin text-blue-600" size={28} /><p className="text-[8px] font-bold text-slate-400 mt-2 uppercase">Loading paper...</p></div>;

  return (
    <div className="flex flex-col gap-3 w-full items-center pb-20">
      {pages.map((img, idx) => (
        <div key={idx} className="w-full shadow-md border rounded overflow-hidden relative bg-white">
          <div className="absolute top-1 left-1 bg-blue-600/80 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full z-10">PAGE {idx + 1}</div>
          <img src={img} alt="Paper" className="w-full h-auto select-none pointer-events-none" />
        </div>
      ))}
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
  
  const [teacherPin, setTeacherPin] = useState('1234567890');
  const [isTeacherAuthenticated, setIsTeacherAuthenticated] = useState(false);
  const [liveMocks, setLiveMocks] = useState([]);
  const [prevPapers, setPrevPapers] = useState([]);
  const [practiceSets, setPracticeSets] = useState([]);
  const [growthPublished, setGrowthPublished] = useState(false);
  const [students, setStudents] = useState([]);
  const [studentResults, setStudentResults] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  // --- 🔵 Real-time Sync with Firebase ---
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

  const handleStartExamFlow = (title, durationSec, fileUrl, fileType) => {
    setPendingExam({ title, duration: durationSec, fileUrl, fileType });
    setShowNameModal(true);
  };

  const finalizeExamStart = async (name) => {
    const d = new Date();
    const logData = { 
      studentName: name, examTitle: pendingExam.title, timestamp: Date.now(), 
      timeDisplay: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dateDisplay: d.toLocaleDateString()
    };
    await addDoc(collection(db, "logs"), logData);
    setCurrentExam({ ...pendingExam, studentName: name });
    setIsExamActive(true);
    setShowNameModal(false);
  };

  if (isExamActive) return <ExamInterface exam={currentExam} onFinish={() => setIsExamActive(false)} />;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 select-none text-sm overflow-x-hidden flex flex-col items-center">
      {showNameModal && <div className="fixed inset-0 bg-black/80 z-[500] flex items-center justify-center p-4">
        <div className="bg-white rounded-[2.5rem] p-8 max-w-xs w-full text-center shadow-2xl animate-in zoom-in duration-200">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-6 ring-4 ring-blue-50"><User size={32} /></div>
          <h3 className="font-black text-slate-800 uppercase text-xs mb-1 italic tracking-widest">Identify Yourself</h3>
          <input autoFocus type="text" onChange={(e) => setPendingExam({...pendingExam, sName: e.target.value})} className="w-full p-3 rounded-xl border-2 border-slate-100 font-black text-xs uppercase outline-none focus:border-blue-500 mb-6 text-center" placeholder="Student Name" />
          <div className="flex gap-2">
            <button onClick={() => setShowNameModal(false)} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 font-black text-[10px] uppercase">Cancel</button>
            <button onClick={() => finalizeExamStart(pendingExam.sName)} className="flex-1 py-3 rounded-xl bg-blue-700 text-white font-black text-[10px] uppercase shadow-lg">Confirm</button>
          </div>
        </div>
      </div>}
      
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm px-4 py-2.5 flex justify-between items-center w-full max-w-6xl">
        <div className="cursor-pointer" onClick={() => setActiveTab('home')}>
          <h1 className="text-xl md:text-2xl font-black text-blue-700 uppercase tracking-tighter italic leading-none">MATH EXCELLENCE</h1>
          <p className="text-[8px] md:text-[9px] font-bold text-slate-400 opacity-80 mt-1 tracking-widest leading-none">"Your future our priority"</p>
        </div>
        <div className="hidden md:block shadow-inner rounded-full p-0.5 ring-1 ring-blue-50"><span className="bg-blue-700 text-white px-5 py-2 rounded-full font-black text-[9px] uppercase tracking-widest shadow-md">BUILD YOUR FUTURE WITH ANSHU SIR</span></div>
      </header>

      <nav className="bg-blue-700 text-white shadow-2xl sticky top-[46px] md:top-[56px] z-40 w-full flex justify-center">
        <div className="max-w-6xl w-full px-1 flex justify-between items-center overflow-x-auto no-scrollbar">
          {[
            { id: 'live', label: 'Live Mock', icon: <Clock size={12} /> },
            { id: 'practice', label: 'Practice Mock', icon: <BookOpen size={12} /> },
            { id: 'growth', label: 'Your Growth', icon: <TrendingUp size={12} /> },
            { id: 'teacher', label: 'Teacher Zone', icon: <User size={12} /> }
          ].map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex items-center gap-1.5 px-4 md:px-8 py-4 transition-all border-b-4 font-black text-[10px] md:text-xs uppercase tracking-widest ${activeTab === item.id ? 'border-yellow-400 bg-blue-800 text-white shadow-inner' : 'border-transparent hover:bg-blue-600'}`}>{item.icon} {item.label}</button>
          ))}
        </div>
      </nav>

      <main className="w-full max-w-6xl p-4 md:p-8 mb-20 flex flex-col items-center">
        {activeTab === 'home' && <div className="flex flex-col items-center w-full space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-slate-100 text-center w-full max-w-xl">
            <GraduationCap size={36} className="text-blue-700 mx-auto mb-3" />
            <h2 className="text-xl md:text-3xl font-black text-slate-800 mb-2 leading-tight uppercase italic tracking-tight">Master Math with <span className="text-blue-700 underline decoration-yellow-400">Anshu Sir</span></h2>
            <button onClick={() => setActiveTab('practice')} className="bg-blue-700 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase shadow-lg mt-4">Start Mock Practice</button>
          </div>
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xl w-full max-w-xl mx-auto">
            <div className="flex items-center gap-2 border-b pb-3 mb-4"><History className="text-blue-600" size={18} /><h3 className="font-black text-xs text-slate-800 uppercase italic tracking-widest">Live Activity Log</h3></div>
            <div className="space-y-3 max-h-56 overflow-y-auto no-scrollbar">
              {activityLogs.map(log => (
                <div key={log.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border-l-4 border-l-blue-600">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700"><UserCheck size={14} /></div>
                    <div><p className="text-[10px] font-black text-slate-800 uppercase leading-none">{log.studentName}</p><p className="text-[7px] text-slate-400 font-bold uppercase mt-1">{log.examTitle}</p></div>
                  </div>
                  <div className="text-right"><p className="text-[7px] font-black text-blue-600 uppercase italic leading-none">{log.timeDisplay}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>}

        {activeTab === 'live' && <div className="space-y-6 max-w-2xl mx-auto w-full">
          <h2 className="text-base font-black text-slate-800 uppercase italic flex items-center gap-2 border-b-2 pb-2"><Clock className="text-red-600 animate-pulse" size={20} /> Ongoing Live Mocks</h2>
          {liveMocks.filter(m => m.isPublished).map(m => (
            <div key={m.id} className="bg-white p-5 rounded-2xl border-2 border-red-50 shadow-lg flex justify-between items-center gap-4 relative overflow-hidden ring-4 ring-red-50/30">
              <div className="absolute top-0 right-0 bg-red-600 text-white px-3 py-1 text-[8px] font-black uppercase tracking-widest animate-pulse">LIVE</div>
              <div><h3 className="text-lg font-black text-slate-800 uppercase italic">{m.name}</h3><p className="text-[9px] font-black text-red-600 mt-1 uppercase flex items-center gap-2"><Timer size={12} /> Time: {m.hours}h {m.minutes}m</p></div>
              <button onClick={() => handleStartExamFlow(m.name, (parseInt(m.hours)||0)*3600+(parseInt(m.minutes)||0)*60, m.fileUrl, m.fileType)} className="bg-red-600 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase shadow border-b-4 border-red-900 active:border-b-0 active:translate-y-1">Attempt</button>
            </div>
          ))}
        </div>}

        {activeTab === 'practice' && <div className="space-y-10 max-w-4xl mx-auto w-full">
          <h2 className="text-base font-black text-slate-800 uppercase border-b-2 pb-2 flex items-center gap-3 italic underline decoration-blue-600 decoration-2 underline-offset-8"><FileText className="text-blue-600" size={20}/> Mock Papers & Practice Sets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[...prevPapers, ...practiceSets].filter(p => p.isPublished).map(p => (
               <div key={p.id} className="bg-white p-5 rounded-2xl border-2 border-blue-50 shadow-lg flex justify-between items-center">
                  <div><h3 className="font-black uppercase text-[11px] text-slate-800 tracking-tighter leading-tight">{p.name}</h3><p className="text-[8px] text-slate-400 font-bold mt-1 uppercase flex items-center gap-1.5"><Timer size={12} /> {p.hours}h {p.minutes}m Exam</p></div>
                  <button onClick={() => handleStartExamFlow(p.name, (parseInt(p.hours)||0)*3600+(parseInt(p.minutes)||0)*60, p.fileUrl, p.fileType)} className="bg-blue-700 text-white px-5 py-2 rounded-xl font-black text-[9px] uppercase shadow-md active:scale-95 transition-all">Start</button>
               </div>
            ))}
          </div>
        </div>}

        {activeTab === 'growth' && <GrowthSectionView isPublished={growthPublished} results={studentResults} />}

        {activeTab === 'teacher' && (!isTeacherAuthenticated ? 
          <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-[2.5rem] shadow-2xl border-4 border-blue-50 text-center">
            <div className="w-16 h-16 bg-blue-700 rounded-2xl mx-auto flex items-center justify-center text-white shadow-xl mb-6 rotate-3 border-2 border-white shadow-blue-200"><Lock size={32} /></div>
            <h2 className="text-2xl font-black text-slate-800 uppercase italic mb-2">Teacher Zone</h2>
            <input type="password" onChange={(e) => { if(e.target.value === teacherPin) setIsTeacherAuthenticated(true); }} className="w-full pl-4 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-black text-center text-lg tracking-[0.5em]" placeholder="••••••••" />
          </div> : 
          <TeacherZoneMainView 
            liveMocks={liveMocks} prevPapers={prevPapers} practiceSets={practiceSets} 
            growthPublished={growthPublished} setGrowthPublished={async (v) => await setDoc(doc(db, "settings", "adminConfig"), { growthPublished: v }, { merge: true })}
            studentResults={studentResults} students={students} teacherPin={teacherPin}
            setTeacherPin={async (v) => await setDoc(doc(db, "settings", "adminConfig"), { pin: v }, { merge: true })}
          />
        )}
      </main>
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-yellow-400 p-2 text-center font-black text-[8px] shadow-2xl z-50 text-slate-900 uppercase tracking-widest border-t-4 border-yellow-600">BUILD YOUR FUTURE WITH ANSHU SIR</div>
    </div>
  );
};

// --- Sub-component: Teacher Zone Manager ---
const TeacherZoneMainView = ({ liveMocks, prevPapers, practiceSets, growthPublished, setGrowthPublished, studentResults, students, teacherPin, setTeacherPin }) => {
  const [msg, setMsg] = useState("");
  const [selectedTeacherStudent, setSelectedTeacherStudent] = useState(null);
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [newRes, setNewRes] = useState({ exam: "", date: "", obtained: "", total: "" });

  const notify = (m) => { setMsg(m); setTimeout(() => setMsg(""), 2000); };
  const addSlot = async (cat) => {
    const col = cat === 'live' ? "liveMocks" : cat === 'prev' ? "prevPapers" : "practiceSets";
    await addDoc(collection(db, col), { name: "Untitled Paper Slot", hours: 1, minutes: 0, fileUrl: null, fileType: 'application/pdf', isPublished: false });
    notify("Slot added to Database");
  };
  const updatePaper = async (id, cat, field, value) => {
    const col = cat === 'live' ? "liveMocks" : cat === 'prev' ? "prevPapers" : "practiceSets";
    await setDoc(doc(db, col, id), { [field]: value }, { merge: true });
  };
  const deletePaper = async (id, cat) => {
    const col = cat === 'live' ? "liveMocks" : cat === 'prev' ? "prevPapers" : "practiceSets";
    await deleteDoc(doc(db, col, id));
    notify("Deleted permanently");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative w-full flex flex-col items-center">
      {msg && <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-2 rounded-full shadow-2xl z-[300] text-[8px] font-black border border-yellow-400 uppercase tracking-widest">{msg}</div>}
      
      <div className="text-center">
        <h2 className="text-lg font-black text-slate-800 uppercase italic underline decoration-blue-600 underline-offset-4 leading-none">Teacher Console</h2>
        <button onClick={() => setIsChangingPin(!isChangingPin)} className="mt-2 text-[7px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1 mx-auto hover:text-blue-500 transition-colors"><Settings2 size={10} /> PIN Settings</button>
      </div>

      {isChangingPin && (
        <div className="max-w-xs mx-auto p-4 bg-yellow-50 border-2 border-yellow-100 rounded-2xl space-y-3 shadow-sm">
           <input type="text" onChange={(e) => setTeacherPin(e.target.value)} className="w-full p-2 rounded-lg bg-white border-2 border-yellow-200 text-center font-black text-xs outline-none" placeholder="Enter New PIN" />
           <button onClick={() => { setIsChangingPin(false); notify("PIN Updated"); }} className="w-full py-1.5 rounded-lg bg-yellow-600 text-white font-black text-[8px] uppercase">Save PIN</button>
        </div>
      )}

      <div className="bg-white p-4 rounded-xl border shadow-sm space-y-3 w-full">
        <div className="flex justify-between items-center border-b pb-1.5 font-black text-[10px] text-red-600 uppercase tracking-widest">
          <div className="flex items-center gap-2"><Clock size={16}/> Live Mock Management</div>
          <button onClick={() => addSlot('live')} className="bg-red-50 text-red-600 p-1.5 rounded-full hover:bg-red-100 transition-all shadow-sm"><PlusCircle size={20}/></button>
        </div>
        <div className="space-y-4">
          {liveMocks.map(m => (
            <div key={m.id} className="p-4 bg-slate-50 border-2 rounded-2xl flex flex-col gap-3 shadow-sm transition-all hover:bg-white">
              <div className="flex gap-2 items-center">
                <input type="text" value={m.name} onChange={(e) => updatePaper(m.id, 'live', 'name', e.target.value)} className="bg-white border-2 border-slate-100 p-1.5 rounded-lg font-black text-[10px] uppercase flex-1 outline-none focus:border-red-400" />
                <button onClick={() => updatePaper(m.id, 'live', 'isPublished', !m.isPublished)} className={`px-3 py-1.5 rounded-lg text-[7px] font-black uppercase transition-all ${m.isPublished ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{m.isPublished ? 'LIVE' : 'HIDDEN'}</button>
                <button onClick={() => deletePaper(m.id, 'live')} className="p-1.5 text-red-400 hover:text-red-600 bg-red-50 rounded-lg"><Trash2 size={16} /></button>
              </div>
              <div className="flex gap-2 items-center">
                <input type="text" value={m.fileUrl || ''} onChange={(e) => updatePaper(m.id, 'live', 'fileUrl', e.target.value)} className="flex-1 p-1.5 rounded-lg border-2 text-[9px] font-bold" placeholder="Google Drive PDF/Image Link" />
                <select value={m.fileType} onChange={(e) => updatePaper(m.id, 'live', 'fileType', e.target.value)} className="p-1.5 border-2 rounded-lg text-[8px] font-black uppercase">
                  <option value="application/pdf">PDF</option>
                  <option value="image/png">IMAGE</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border shadow-xl space-y-4 w-full">
         <div className="flex justify-between items-center border-b pb-2 font-black text-[10px] text-orange-600 uppercase tracking-widest">
           <div className="flex items-center gap-2"><Trophy size={16} /> Student Records Hub</div>
           <button onClick={() => setGrowthPublished(!growthPublished)} className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all shadow-md ${growthPublished ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>{growthPublished ? 'Live' : 'Locked'}</button>
         </div>
         <button onClick={async () => { const n = prompt("Enter Student Name:"); if(n) await addDoc(collection(db, "students"), {name: n}); }} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-black text-[8px] uppercase flex items-center gap-1 shadow shadow-blue-200 active:scale-95 transition-all"><UserPlus size={14}/> Profile</button>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {students.map((name, i) => (
              <button key={i} onClick={() => setSelectedTeacherStudent(name)} className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 flex justify-between items-center border-l-8 border-l-blue-600 hover:bg-blue-100/30 transition-all text-left">
                <div><p className="text-[10px] font-black text-slate-800 uppercase leading-none">{name}</p></div>
                <ArrowRight size={14} className="text-slate-300" />
              </button>
            ))}
         </div>
      </div>

      {selectedTeacherStudent && (
        <div className="fixed inset-0 bg-white z-[200] p-6 overflow-y-auto animate-in slide-in-from-right-4">
           <button onClick={() => setSelectedTeacherStudent(null)} className="flex items-center gap-1 text-[9px] font-black text-blue-600 uppercase mb-4"><ChevronLeft size={16}/> BACK TO PORTAL</button>
           <div className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-100 shadow-2xl space-y-6">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Student: {selectedTeacherStudent}</h3>
              <div className="p-5 bg-blue-50/50 rounded-3xl border-2 border-blue-100 space-y-4">
                 <div className="grid grid-cols-2 gap-3">
                   <input type="text" placeholder="Exam Topic" value={newRes.exam} onChange={(e) => setNewRes({...newRes, exam: e.target.value})} className="p-2 rounded-xl border-2 font-bold text-[10px]" />
                   <input type="date" value={newRes.date} onChange={(e) => setNewRes({...newRes, date: e.target.value})} className="p-2 rounded-xl border-2 font-bold text-[10px]" />
                   <input type="number" placeholder="Obtained" value={newRes.obtained} onChange={(e) => setNewRes({...newRes, obtained: e.target.value})} className="p-2 rounded-xl border-2 font-black text-[10px]" />
                   <input type="number" placeholder="Total" value={newRes.total} onChange={(e) => setNewRes({...newRes, total: e.target.value})} className="p-2 rounded-xl border-2 font-black text-[10px]" />
                 </div>
                 <button onClick={async () => {
                   if(newRes.exam && newRes.obtained && newRes.total) {
                     const p = Math.round((newRes.obtained/newRes.total)*100);
                     await addDoc(collection(db, "results"), { ...newRes, name: selectedTeacherStudent, percent: p });
                     setNewRes({exam: "", date: "", obtained: "", total: ""});
                     notify("Result recorded!");
                   }
                 }} className="w-full py-3 bg-blue-700 text-white rounded-2xl font-black text-[10px] uppercase">SAVE SCORE</button>
              </div>
              <div className="space-y-3">
                 {studentResults.filter(r => r.name === selectedTeacherStudent).map(r => (
                   <div key={r.id} className="p-4 bg-slate-50 border-2 rounded-2xl flex justify-between items-center group">
                     <div><p className="text-[11px] font-black text-slate-800 uppercase italic tracking-tight">{r.exam}</p><p className="text-[8px] text-slate-400 font-bold">{r.date} • {r.obtained}/{r.total} • <span className="text-blue-600">{r.percent}%</span></p></div>
                     <button onClick={async () => await deleteDoc(doc(db, "results", r.id))} className="text-red-300 hover:text-red-500"><Trash2 size={16} /></button>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

// --- Sub-component: Growth View ---
const GrowthSectionView = ({ isPublished, results }) => {
  const [sel, setSel] = useState(null);
  if (!isPublished) return <div className="py-24 text-center bg-white rounded-3xl border-2 border-dashed max-w-2xl mx-auto w-full"><Award size={48} className="text-slate-200 mx-auto mb-3" /><h2 className="font-black text-slate-400 uppercase text-[9px] tracking-widest">Results are under evaluation.</h2></div>;
  const uniqueStudents = Array.from(new Set(results.map(r => r.name))).sort();
  return (
    <div className="max-w-3xl mx-auto py-4 px-2 w-full">
      {!sel ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {uniqueStudents.map((name, i) => (<button key={i} onClick={() => setSel(name)} className="bg-white p-4 rounded-xl border shadow-sm flex justify-between items-center group"><div className="flex items-center gap-3"><div className="w-12 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-700"><User size={16} /></div><span className="font-black text-slate-800 uppercase text-[10px]">{name}</span></div><ChevronRight size={16} /></button>))}
        </div>
      ) : (
        <div className="space-y-4 animate-in slide-in-from-right-2 duration-300">
          <button onClick={() => setSel(null)} className="flex items-center gap-1 text-[9px] font-black text-blue-600 uppercase mb-1"><ChevronLeft size={14} /> Back</button>
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border">
            <div className="bg-blue-700 p-8 text-white text-center"><h2 className="text-2xl font-black uppercase italic underline decoration-yellow-400 underline-offset-8">Report Card: {sel}</h2></div>
            <div className="p-4 overflow-x-auto"><table className="w-full text-[9px] font-black text-slate-700"><tbody>{results.filter(r => r.name === sel).map((res) => (<tr key={res.id} className="border-b"><td className="p-4 uppercase font-bold text-slate-800">{res.exam}</td><td className="p-4 text-center text-slate-400 italic">{res.date}</td><td className="p-4 text-center font-black text-blue-700 text-sm">{res.percent}%</td><td className="p-4 text-center"><span className={`px-2 py-1 rounded-full text-[7px] ${res.percent >= 40 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{res.percent >= 40 ? 'PASS' : 'FAIL'}</span></td></tr>))}</tbody></table></div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Sub-component: Exam Interface ---
const ExamInterface = ({ exam, onFinish }) => {
  const [tl, setTl] = useState(exam.duration);
  const [sub, setSub] = useState(false);
  useEffect(() => {
    if (tl <= 0 || sub) { if(tl===0 && !sub) setSub(true); return; }
    const t = setInterval(() => setTl(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [tl, sub]);
  const fmt = (s) => `${Math.floor(s/3600)>0?Math.floor(s/3600)+':':''}${Math.floor((s%3600)/60)<10?'0'+Math.floor((s%3600)/60):Math.floor((s%3600)/60)}:${s%60<10?'0'+s%60:s%60}`;
  if (sub) return <div className="fixed inset-0 bg-white z-[1000] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500"><div className="bg-green-50 p-6 rounded-full mb-4 ring-4 ring-green-50"><CheckCircle size={48} className="text-green-600" /></div><h2 className="text-lg font-black text-slate-800 mb-1 uppercase">EXAM SUBMITTED!</h2><button onClick={onFinish} className="bg-blue-700 text-white px-8 py-2.5 rounded-lg font-black uppercase text-[10px] shadow-lg mt-6">Return Home</button></div>;
  return (
    <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col overflow-hidden">
      <div className="bg-white p-2 flex justify-between items-center border-b-4 border-yellow-400">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-red-600 text-white rounded-lg animate-pulse shadow-md"><ShieldAlert size={14} /></div>
          <div><h2 className="font-black text-slate-800 text-[10px] md:text-xs uppercase">{exam.title}</h2><p className="text-[7px] text-blue-700 font-bold uppercase italic">Student: {exam.studentName}</p></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-2 py-0.5 rounded font-black text-xs md:text-sm border-2 bg-slate-50 text-blue-800 border-slate-200">{fmt(tl)}</div>
          <button onClick={() => setSub(true)} className="bg-green-600 text-white px-3 py-1 rounded font-black text-[9px] uppercase shadow shadow-green-100 active:scale-95">Submit</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 md:p-4 bg-slate-900 flex flex-col items-center">
        <div className="w-full max-w-3xl bg-blue-700 text-white p-2.5 mb-3 rounded-lg text-[8px] md:text-[10px] flex items-center gap-2 border border-blue-500 shadow-xl"><PenTool size={14} className="shrink-0" /><p><strong>Nirdesh:</strong> Screen-er prosno dekho r khatay uttor lekho. Exam sesh hole upore 'Submit' click koro.</p></div>
        <div className="relative bg-white w-full max-w-3xl shadow-2xl rounded-xl min-h-[100vh] mb-20 flex flex-col overflow-visible ring-1 ring-slate-100">
          <div className="text-center py-3 border-b-2 border-slate-50"><h3 className="text-sm md:text-lg font-black uppercase italic text-slate-900 tracking-tighter leading-none italic underline decoration-blue-600 underline-offset-4">MATH EXCELLENCE</h3><p className="text-[6px] font-black text-slate-400 tracking-[0.3em] uppercase mt-1">Official Exam Material</p></div>
          <div className="relative mt-3 flex-1 h-fit">
             <div className="absolute inset-0 z-50 bg-transparent" onContextMenu={(e) => e.preventDefault()} />
             {exam.fileUrl ? (exam.fileType === 'application/pdf' ? <PDFToImageDisplay fileUrl={exam.fileUrl} /> : <div className="flex justify-center p-2"><img src={exam.fileUrl} alt="Exam" className="w-full h-auto rounded border select-none" /></div>) : <div className="py-20 text-center text-slate-300 font-bold uppercase text-[9px]">Question paper not uploaded yet.</div>}
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-45deg] text-slate-50 text-[6rem] md:text-[12rem] font-black opacity-[0.05] pointer-events-none select-none z-0 uppercase">MATH EXCELLENCE</div>
        </div>
      </div>
      <div className="bg-red-700 text-white p-2 text-center text-[8px] font-black uppercase tracking-[0.5em] z-50 border-t border-red-500">DO NOT REFRESH - SECURITY ACTIVE</div>
    </div>
  );
};

export default App;
