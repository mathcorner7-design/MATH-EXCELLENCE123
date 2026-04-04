import React, { useState, useEffect } from 'react';
import { 
  Trophy, BookOpen, TrendingUp, User, Clock, ChevronRight,
  GraduationCap, AlertCircle, PlusCircle, FileText,
  Lock, Award, Timer, Settings2, CheckCircle,
  PenTool, ShieldAlert, Loader2, ChevronLeft, Trash2,
  UserPlus, Search, ArrowRight, X, Key, History, UserCheck
} from 'lucide-react';

// --- 🟢 Firebase Configuration (তোমার নতুন আইডিগুলো) ---
const firebaseConfig = {
  apiKey: "AIzaSyCTk1csUI0HeZhZvy6dOFwmLr-YVswPACyY",
  authDomain: "math-excellence-6d2b8.firebaseapp.com",
  projectId: "math-excellence-6d2b8",
  storageBucket: "math-excellence-6d2b8.firebasestorage.app",
  messagingSenderId: "485798196973",
  appId: "1:485798196973:web:4583be003937001685bee4",
  measurementId: "G-BVR2P0EMPN"
};

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
      } catch (err) {
        if (isMounted) setLoading(false);
      }
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
        if (isMounted) {
          setPages(pageImages);
          setLoading(false);
        }
      } catch (e) {
        if (isMounted) setLoading(false);
      }
    };
    initRendering();
    return () => { isMounted = false; };
  }, [fileUrl]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-10 space-y-3">
      <Loader2 className="animate-spin text-blue-600" size={28} />
      <p className="font-bold text-slate-400 uppercase text-[8px]">Loading content...</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-3 w-full items-center pb-20">
      {pages.map((img, idx) => (
        <div key={idx} className="w-full shadow-md border rounded overflow-hidden relative bg-white mb-2">
          <div className="absolute top-1 left-1 bg-blue-600/80 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full z-10 uppercase">Page {idx + 1}</div>
          <img src={img} alt="Paper" className="w-full h-auto select-none pointer-events-none" />
        </div>
      ))}
    </div>
  );
};

// --- Sub-component: Activity Log ---
const ActivityLogDisplay = ({ logs }) => (
  <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xl mt-8 ring-1 ring-slate-100 w-full max-w-xl mx-auto">
    <div className="flex items-center gap-2 border-b pb-3 mb-4">
      <History className="text-blue-600" size={18} />
      <h3 className="font-black text-xs text-slate-800 uppercase italic tracking-widest">Live Activity Log</h3>
    </div>
    <div className="space-y-3 max-h-56 overflow-y-auto pr-2 no-scrollbar">
      {logs.length === 0 ? (
        <p className="text-center py-8 text-[9px] text-slate-300 font-bold uppercase tracking-widest">No recent activity</p>
      ) : (
        logs.map((log) => (
          <div key={log.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-100 border-l-4 border-l-blue-600 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 shadow-inner">
                <UserCheck size={14} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-800 uppercase leading-none">{log.studentName}</p>
                <p className="text-[7px] text-slate-400 font-bold uppercase mt-1 italic">{log.examTitle}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[7px] font-black text-blue-600 uppercase italic leading-none">{log.timeDisplay}</p>
              <p className="text-[6px] font-bold text-slate-400 uppercase mt-0.5">{log.dateDisplay}</p>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

// --- Sub-component: Home Landing ---
const HomeLandingView = ({ onStart, logs }) => (
  <div className="flex flex-col items-center w-full space-y-6">
    <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-slate-100 text-center ring-1 ring-slate-100 w-full max-w-xl">
      <GraduationCap size={36} className="text-blue-700 mx-auto mb-3" />
      <h2 className="text-xl md:text-3xl font-black text-slate-800 mb-2 leading-tight uppercase italic tracking-tight">Master Math with <span className="text-blue-700 underline decoration-yellow-400">Anshu Sir</span></h2>
      <p className="text-[8px] md:text-[9px] text-slate-500 mb-6 font-bold tracking-[0.2em] uppercase leading-relaxed opacity-80">"Your future our priority"</p>
      <button onClick={onStart} className="bg-blue-700 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase shadow-lg flex items-center justify-center gap-2 mx-auto active:scale-95 transition-all">Start Mock Practice <ChevronRight size={14} /></button>
    </div>
    <ActivityLogDisplay logs={logs} />
  </div>
);

// --- Sub-component: Name Modal ---
const StudentNameVerification = ({ isOpen, onClose, onConfirm }) => {
  const [name, setName] = useState('');
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/80 z-[250] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] p-8 max-w-xs w-full text-center shadow-2xl animate-in zoom-in duration-200">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-6 ring-4 ring-blue-50 shadow-inner">
          <User size={32} />
        </div>
        <h3 className="font-black text-slate-800 uppercase text-xs mb-1 italic tracking-widest">Identify Yourself</h3>
        <p className="text-[9px] text-slate-400 font-bold mb-6 italic">Exam suru korar age tomar naam likho.</p>
        <input 
          autoFocus
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 rounded-xl border-2 border-slate-100 font-black text-xs uppercase outline-none focus:border-blue-500 mb-6 text-center shadow-inner" 
          placeholder="Student Name"
        />
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 font-black text-[10px] uppercase">Cancel</button>
          <button onClick={() => { if(name.trim()) onConfirm(name); }} className="flex-1 py-3 rounded-xl bg-blue-700 text-white font-black text-[10px] uppercase shadow shadow-blue-100 active:translate-y-0.5">Confirm</button>
        </div>
      </div>
    </div>
  );
};

// --- Sub-component: PIN Auth ---
const TeacherPinPortal = ({ correctPin, onAuthSuccess }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const handleLogin = (e) => {
    e.preventDefault();
    if (pin === correctPin) { onAuthSuccess(); } else { setError('Wrong PIN! Try again.'); setPin(''); }
  };
  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-[2.5rem] shadow-2xl border-4 border-blue-50 text-center animate-in zoom-in duration-300">
      <div className="w-16 h-16 bg-blue-700 rounded-2xl mx-auto flex items-center justify-center text-white shadow-xl mb-6 rotate-3 border-2 border-white shadow-blue-200"><Lock size={32} /></div>
      <h2 className="text-2xl font-black text-slate-800 uppercase italic mb-2">Teacher Zone</h2>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">Access Restricted - Enter Secure PIN</p>
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="relative group">
          <Key className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-600" size={18} />
          <input type="password" value={pin} onChange={(e) => setPin(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-black text-center text-lg tracking-[0.5em]" placeholder="••••••••" />
        </div>
        {error && <p className="text-[10px] font-black text-red-500 uppercase italic animate-pulse">{error}</p>}
        <button type="submit" className="w-full py-4 bg-blue-700 text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-blue-100 border-b-4 border-blue-900 active:border-b-0 active:translate-y-1">Unlock Dashboard</button>
      </form>
    </div>
  );
};

// --- Sub-component: Exam Interface ---
const ExamInterface = ({ exam, onFinish }) => {
  const [timeLeft, setTimeLeft] = useState(exam.duration);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  useEffect(() => {
    if (timeLeft <= 0 || isSubmitted) { if (timeLeft === 0 && !isSubmitted) setIsSubmitted(true); return; }
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
    <div className="fixed inset-0 bg-white z-[110] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
      <div className="bg-green-50 p-6 rounded-full mb-4 shadow-inner ring-4 ring-green-50"><CheckCircle size={48} className="text-green-600" /></div>
      <h2 className="text-lg font-black text-slate-800 mb-1 uppercase tracking-tight">EXAM SUBMITTED!</h2>
      <p className="text-slate-500 mb-6 max-w-sm text-[9px] font-medium">"Anshu Sir results check korben. Dashboard-e firiye deya holo."</p>
      <button onClick={onFinish} className="bg-blue-700 text-white px-8 py-2.5 rounded-lg font-black uppercase text-[10px] shadow-lg">Return Home</button>
    </div>
  );
  return (
    <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col overflow-hidden">
      {showConfirm && (
        <div className="fixed inset-0 bg-black/80 z-[120] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-xs w-full text-center shadow-2xl animate-in zoom-in duration-200">
            <AlertCircle size={24} className="text-yellow-600 mx-auto mb-2" />
            <h3 className="font-black text-slate-800 uppercase text-[10px] mb-1">Submit Exam?</h3>
            <p className="text-[8px] text-slate-500 font-bold mb-6 italic">Khatay sob uttor likhe thakle 'Yes' click koro.</p>
            <div className="flex gap-2">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-2 rounded bg-slate-100 text-slate-600 font-black text-[9px] uppercase">No</button>
              <button onClick={() => setIsSubmitted(true)} className="flex-1 py-2 rounded bg-green-600 text-white font-black text-[9px] uppercase shadow-md">Yes, Submit</button>
            </div>
          </div>
        </div>
      )}
      <div className="bg-white p-2 flex justify-between items-center border-b border-yellow-400">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-red-600 text-white rounded-lg animate-pulse shadow-md"><ShieldAlert size={14} /></div>
          <div><h2 className="font-black text-slate-800 text-[9px] md:text-xs uppercase truncate max-w-[150px]">{exam.title}</h2><p className="text-[7px] text-blue-700 font-bold mt-0.5 uppercase tracking-tighter italic">Student: {exam.studentName}</p></div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`px-2 py-0.5 rounded font-black text-xs md:text-sm border-2 ${timeLeft < 300 ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-slate-50 text-blue-800 border-slate-200'}`}>{formatTime(timeLeft)}</div>
          <button onClick={() => setShowConfirm(true)} className="bg-green-600 text-white px-3 py-1 rounded font-black text-[9px] uppercase shadow shadow-green-100 active:scale-95 transition-all">Submit</button>
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

// --- Sub-component: Growth View ---
const GrowthSectionView = ({ isPublished, results }) => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  if (!isPublished) return <div className="py-24 text-center animate-in zoom-in duration-500 bg-white rounded-3xl border-2 border-dashed border-slate-100 max-w-2xl mx-auto mt-10 px-4 shadow-sm"><Award size={48} className="text-slate-200 mx-auto mb-3" /><h2 className="font-black text-slate-400 uppercase text-[9px] tracking-widest leading-loose text-center italic">Results are under evaluation.</h2></div>;
  const uniqueStudents = Array.from(new Set(results.map(r => r.name))).sort();
  return (
    <div className="max-w-3xl mx-auto py-4 px-2 animate-in fade-in duration-500">
      <h2 className="text-lg font-black text-slate-800 uppercase italic mb-4 flex items-center gap-2 border-b-2 pb-2"><TrendingUp className="text-blue-700" size={20}/> Growth Portal</h2>
      {!selectedStudent ? (
        <div className="space-y-3"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 opacity-80">Select Student Profile:</p><div className="grid grid-cols-1 md:grid-cols-2 gap-3">{uniqueStudents.map((name, i) => (<button key={i} onClick={() => setSelectedStudent(name)} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex justify-between items-center group active:scale-95"><div className="flex items-center gap-3"><div className="w-12 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-700 shadow-inner"><User size={16} /></div><span className="font-black text-slate-800 uppercase text-[10px] tracking-tight">{name}</span></div><ChevronRight className="text-slate-300 group-hover:text-blue-600 transition-colors" size={16} /></button>))}</div></div>
      ) : (
        <div className="space-y-4 animate-in slide-in-from-right-2 duration-300"><button onClick={() => setSelectedStudent(null)} className="flex items-center gap-1 text-[9px] font-black text-blue-600 uppercase hover:underline mb-1"><ChevronLeft size={14} /> Back</button><div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 ring-1 ring-slate-100 shadow-blue-100/50"><div className="bg-blue-700 p-8 text-white text-center relative overflow-hidden"><Award className="absolute -top-10 -right-10 opacity-10 rotate-12" size={120}/><h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter leading-none italic underline decoration-yellow-400 underline-offset-8">Report Card</h2><div className="mt-6 inline-block bg-white/10 px-4 py-1.5 rounded-full border border-white/20"><p className="text-[10px] font-black uppercase tracking-[0.2em]">Student: {selectedStudent}</p></div></div><div className="p-3 md:p-6 overflow-x-auto"><table className="w-full text-[9px] md:text-[10px] font-black text-slate-700 border-separate border-spacing-y-2"><thead><tr className="uppercase text-slate-400 text-[8px] tracking-[0.2em] opacity-80"><th className="p-2 text-left">Exam Topic</th><th className="p-2 text-center">Date</th><th className="p-2 text-center">Score</th><th className="p-2 text-center">Percent</th><th className="p-2 text-center">Status</th></tr></thead><tbody>{results.filter(r => r.name === selectedStudent).map((res) => (<tr key={res.id} className="bg-slate-50 hover:bg-white transition-all rounded-xl shadow-sm ring-1 ring-slate-200"><td className="p-4 uppercase rounded-l-xl border-l-4 border-blue-600 font-bold text-slate-800">{res.exam}</td><td className="p-4 text-center text-slate-400 font-bold italic">{res.date}</td><td className="p-4 text-center font-black text-blue-700 text-sm">{res.obtained} <span className="text-[9px] text-slate-300">/ {res.total}</span></td><td className="p-4 text-center font-black text-slate-800">{res.percent}%</td><td className="p-4 text-center rounded-r-xl"><span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase shadow-sm ${res.percent >= 40 ? 'bg-green-100 text-green-700 border border-green-200 shadow-green-100' : 'bg-red-100 text-red-700 border border-red-200 shadow-red-100'}`}>{res.percent >= 90 ? 'TOPPER' : res.percent >= 40 ? 'PASS' : 'FAIL'}</span></td></tr>))}</tbody></table></div></div><p className="text-[8px] text-center text-slate-300 font-black uppercase italic tracking-widest mt-4">Certified by Anshu Sir - MATH EXCELLENCE</p></div>
      )}
    </div>
  );
};

// --- Sub-component: Mock Listing View ---
const LiveMockListingView = ({ liveMocks, onStart }) => {
  const publishedMocks = liveMocks.filter(m => m.isPublished);
  if (publishedMocks.length === 0) return <div className="py-24 text-center animate-in zoom-in duration-500"><Clock size={40} className="text-slate-100 mx-auto mb-4" /><h2 className="text-[11px] font-black text-slate-300 uppercase tracking-widest">No live mocks currently active</h2></div>;
  return (
    <div className="space-y-6 max-w-2xl mx-auto mt-6 animate-in slide-in-from-top-4">
      <h2 className="text-base font-black text-slate-800 uppercase italic mb-4 flex items-center gap-2 border-b-2 pb-2"><Clock className="text-red-600 animate-pulse" size={20} /> Ongoing Live Mocks</h2>
      {publishedMocks.map(m => (
        <div key={m.id} className="bg-white p-5 rounded-2xl border-2 border-red-50 shadow-lg flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden ring-4 ring-red-50/30 group hover:border-red-400 transition-all active:scale-[0.98]">
            <div className="absolute top-0 right-0 bg-red-600 text-white px-3 py-1 text-[8px] font-black uppercase tracking-widest animate-pulse shadow-sm">LIVE</div>
            <div><h3 className="text-lg font-black text-slate-800 uppercase italic truncate max-w-[200px] leading-tight">{m.name}</h3><p className="text-[9px] font-black text-red-600 mt-1 uppercase flex items-center gap-2"><Timer size={12} /> Time: {m.hours}h {m.minutes}m</p></div>
            <button onClick={() => onStart(m.name, (parseInt(m.hours)||0)*3600+(parseInt(m.minutes)||0)*60, m.fileUrl, m.fileType)} className="bg-red-600 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase shadow shadow-red-200 active:scale-90 transition-all border-b-4 border-red-900 active:border-b-0 active:translate-y-1">Attempt</button>
        </div>
      ))}
    </div>
  );
};

// --- Sub-component: Student Practice View ---
const StudentPracticeListView = ({ prevPapers, practiceSets, onStart }) => {
  const start = (n, h, m, url, type) => onStart(n, (parseInt(h)*3600)+(parseInt(m)||0)*60, url, type);
  return (
    <div className="space-y-10 max-w-4xl mx-auto">
       <div className="space-y-4 animate-in fade-in duration-700">
          <h2 className="text-base font-black text-slate-800 uppercase border-b-2 pb-2 flex items-center gap-3 tracking-widest italic underline decoration-blue-600 decoration-2 underline-offset-8"><FileText className="text-blue-600" size={20}/> Previous Mock Papers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {prevPapers.filter(p => p.isPublished).map(p => (
               <div key={p.id} className="bg-white p-5 rounded-2xl border-2 border-blue-50 shadow-lg ring-1 ring-blue-50/50 flex justify-between items-center group hover:border-blue-400 transition-all hover:translate-y-[-2px]">
                  <div><h3 className="font-black uppercase text-[11px] text-slate-800 tracking-tighter group-hover:text-blue-700 transition-colors leading-tight">{p.name}</h3><p className="text-[8px] text-slate-400 font-bold mt-1 uppercase flex items-center gap-1.5"><Timer size={12} /> {p.hours}h {p.minutes}m Exam</p></div>
                  <button onClick={() => start(p.name, p.hours, p.minutes, p.fileUrl, p.fileType)} className="bg-blue-700 text-white px-5 py-2 rounded-xl font-black text-[9px] uppercase shadow-md active:scale-95 transition-all">Start</button>
               </div>
            ))}
          </div>
       </div>
       <div className="space-y-4 animate-in fade-in duration-1000">
          <h2 className="text-base font-black text-slate-800 uppercase border-b-2 pb-2 flex items-center gap-3 tracking-widest italic underline decoration-purple-600 decoration-2 underline-offset-8"><BookOpen className="text-purple-600" size={20}/> Special Practice Sets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {practiceSets.filter(p => p.isPublished).map(p => (
               <div key={p.id} className="bg-white p-5 rounded-2xl border-2 border-purple-50 shadow-lg ring-1 ring-purple-50/50 flex justify-between items-center group hover:border-purple-400 transition-all hover:translate-y-[-2px]">
                  <div><h3 className="font-black uppercase text-[11px] text-slate-800 tracking-tighter group-hover:text-purple-700 transition-colors leading-tight">{p.name}</h3><p className="text-[8px] text-slate-400 font-bold mt-1 uppercase flex items-center gap-1.5"><Timer size={12} /> {p.hours}h {p.minutes}m Exam</p></div>
                  <button onClick={() => start(p.name, p.hours, p.minutes, p.fileUrl, p.fileType)} className="bg-purple-700 text-white px-5 py-2 rounded-xl font-black text-[9px] uppercase shadow-md shadow-purple-100 active:scale-95 transition-all">Start</button>
               </div>
            ))}
          </div>
       </div>
    </div>
  );
};

// --- Sub-component: Teacher Zone Manager ---
const TeacherZoneMainView = ({ 
  liveMocks, setLiveMocks,
  prevPapers, setPrevPapers,
  practiceSets, setPracticeSets,
  growthPublished, setGrowthPublished,
  studentResults, setStudentResults,
  students, setStudents,
  teacherPin, setTeacherPin
}) => {
  const [msg, setMsg] = useState("");
  const [newRes, setNewRes] = useState({ exam: "", date: "", obtained: "", total: "" });
  const [selectedTeacherStudent, setSelectedTeacherStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');
  
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', id: null });
  const [addStudentModal, setAddStudentModal] = useState({ isOpen: false, name: '' });

  const notify = (m) => { setMsg(m); setTimeout(() => setMsg(""), 2000); };

  const handleUpload = (e, id, category) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const mime = file.type;
    if (category === 'live') setLiveMocks(liveMocks.map(m => m.id === id ? { ...m, fileUrl: url, fileType: mime } : m));
    else if (category === 'prev') setPrevPapers(prevPapers.map(p => p.id === id ? { ...p, fileUrl: url, fileType: mime } : p));
    else if (category === 'practice') setPracticeSets(practiceSets.map(p => p.id === id ? { ...p, fileUrl: url, fileType: mime } : p));
    notify("File Upload Success!");
  };

  const addSlot = (category) => {
    const newSlot = { id: Date.now(), name: "Untitled Paper Slot", hours: 1, minutes: 0, fileUrl: null, fileType: null, isPublished: false };
    if (category === 'live') setLiveMocks([newSlot, ...liveMocks]);
    else if (category === 'prev') setPrevPapers([newSlot, ...prevPapers]);
    else if (category === 'practice') setPracticeSets([newSlot, ...practiceSets]);
    notify("Added New Slot");
  };

  const deleteAction = () => {
    const { type, id } = confirmModal;
    if (type === 'live') setLiveMocks(liveMocks.filter(m => m.id !== id));
    else if (type === 'prev') setPrevPapers(prevPapers.filter(p => p.id !== id));
    else if (type === 'practice') setPracticeSets(practiceSets.filter(p => p.id !== id));
    else if (type === 'student') {
      setStudents(students.filter(s => s !== id));
      setStudentResults(studentResults.filter(r => r.name !== id));
      setSelectedTeacherStudent(null);
    } else if (type === 'result') {
      setStudentResults(studentResults.filter(r => r.id !== id));
    }
    setConfirmModal({ isOpen: false, type: '', id: null });
    notify("Removed Successfully");
  };

  const updatePaper = (id, category, field, value) => {
    const list = category === 'live' ? liveMocks : category === 'prev' ? prevPapers : practiceSets;
    const setter = category === 'live' ? setLiveMocks : category === 'prev' ? setPrevPapers : setPracticeSets;
    setter(list.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative pb-20 flex flex-col items-center">
      {msg && <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-2 rounded-full shadow-2xl z-[300] text-[8px] font-black border border-yellow-400 uppercase tracking-widest">{msg}</div>}
      
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 z-[400] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-xs w-full text-center shadow-2xl animate-in zoom-in duration-150 ring-4 ring-white/10">
            <Trash2 size={32} className="text-red-500 mx-auto mb-3" />
            <h3 className="font-black text-slate-800 uppercase text-xs mb-2">Confirm Delete?</h3>
            <p className="text-[9px] text-slate-400 font-bold mb-6 italic">Are you sure? This action is permanent.</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmModal({ isOpen: false, type: '', id: null })} className="flex-1 py-2 rounded bg-slate-100 text-slate-600 font-black text-[9px] uppercase">Cancel</button>
              <button onClick={deleteAction} className="flex-1 py-2 rounded bg-red-600 text-white font-black text-[9px] uppercase shadow-md">Delete</button>
            </div>
          </div>
        </div>
      )}

      {addStudentModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 z-[400] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-xs w-full shadow-2xl animate-in slide-in-from-bottom-4 duration-200">
            <div className="flex justify-between items-center mb-4 border-b pb-2"><h3 className="font-black text-blue-700 uppercase text-[10px]">Add Profile</h3><button onClick={() => setAddStudentModal({ isOpen: false, name: '' })}><X size={18}/></button></div>
            <input autoFocus type="text" value={addStudentModal.name} onChange={(e) => setAddStudentModal({...addStudentModal, name: e.target.value})} className="w-full p-2.5 rounded-xl border-2 border-slate-100 font-black text-[10px] uppercase outline-none focus:border-blue-400 mb-4" placeholder="Name" />
            <button onClick={() => { if(addStudentModal.name) { setStudents([...students, addStudentModal.name].sort()); setAddStudentModal({ isOpen: false, name: '' }); notify("Profile Added"); } }} className="w-full py-2.5 bg-blue-700 text-white rounded-xl font-black text-[9px] uppercase shadow active:scale-95 transition-all">Create Profile</button>
          </div>
        </div>
      )}

      <div className="text-center animate-in slide-in-from-top-4">
        <div className="w-10 h-10 bg-blue-700 rounded-xl mx-auto flex items-center justify-center text-white shadow-lg mb-2 border border-white ring-4 ring-blue-50 rotate-3 shadow-blue-100"><User size={18} /></div>
        <h2 className="text-lg font-black text-slate-800 uppercase italic underline decoration-blue-600 underline-offset-4 leading-none">Teacher Console</h2>
        <button onClick={() => setIsChangingPin(!isChangingPin)} className="mt-2 text-[7px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1 mx-auto hover:text-blue-500 transition-colors"><Settings2 size={10} /> PIN Settings</button>
      </div>

      {isChangingPin && (
        <div className="max-w-xs mx-auto p-4 bg-yellow-50 border-2 border-yellow-100 rounded-2xl space-y-3 shadow-sm animate-in fade-in">
           <p className="text-[8px] font-black text-yellow-700 uppercase tracking-widest text-center">Change PIN</p>
           <input type="text" value={newPinInput} onChange={(e) => setNewPinInput(e.target.value)} className="w-full p-2 rounded-lg bg-white border-2 border-yellow-200 text-center font-black text-xs outline-none" placeholder="New PIN (min 4)" />
           <div className="flex gap-2">
             <button onClick={() => setIsChangingPin(false)} className="flex-1 py-1.5 rounded-lg bg-white text-slate-400 font-black text-[8px] uppercase">Cancel</button>
             <button onClick={() => { if(newPinInput.length >= 4) { setTeacherPin(newPinInput); setIsChangingPin(false); setNewPinInput(''); notify("Security PIN Updated"); } }} className="flex-1 py-1.5 rounded-lg bg-yellow-600 text-white font-black text-[8px] uppercase active:scale-95">Save</button>
           </div>
        </div>
      )}

      {!selectedTeacherStudent ? (
        <div className="grid grid-cols-1 gap-5 text-left w-full">
          <div className="bg-white p-4 rounded-xl border shadow-sm space-y-3">
            <div className="flex justify-between items-center border-b pb-1.5 font-black text-[10px] text-red-600 uppercase tracking-widest">
              <div className="flex items-center gap-2"><Clock size={16}/> Live Mock Management</div>
              <button onClick={() => addSlot('live')} className="bg-red-50 text-red-600 p-1.5 rounded-full hover:bg-red-100 active:scale-90 transition-all shadow-sm"><PlusCircle size={20}/></button>
            </div>
            <div className="space-y-4">
              {liveMocks.map(m => (
                <div key={m.id} className="p-4 bg-slate-50 border-2 rounded-2xl flex flex-col gap-3 relative ring-1 ring-slate-100 shadow-sm transition-all hover:bg-white">
                  <div className="flex gap-2 items-center">
                    <input type="text" value={m.name} onChange={(e) => updatePaper(m.id, 'live', 'name', e.target.value)} className="bg-white border-2 border-slate-100 p-1.5 rounded-lg font-black text-[10px] uppercase flex-1 outline-none focus:border-red-400 shadow-sm" placeholder="Exam Topic" />
                    <button onClick={() => updatePaper(m.id, 'live', 'isPublished', !m.isPublished)} className={`px-3 py-1.5 rounded-lg text-[7px] font-black uppercase transition-all shadow-sm ${m.isPublished ? 'bg-green-600 text-white shadow-green-100' : 'bg-slate-200 text-slate-500'}`}>{m.isPublished ? 'LIVE' : 'HID'}</button>
                    <button onClick={() => setConfirmModal({ isOpen: true, type: 'live', id: m.id })} className="p-1.5 text-red-400 hover:text-red-600 bg-red-50 rounded-lg active:scale-90 transition-all"><Trash2 size={16} /></button>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="flex items-center gap-1 border-2 border-slate-100 p-1.5 rounded-lg bg-white shadow-sm">
                      <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter">Hrs:</span>
                      <input type="number" value={m.hours} onChange={(e) => updatePaper(m.id, 'live', 'hours', e.target.value)} className="w-12 outline-none font-black text-[10px] text-center" />
                    </div>
                    <div className="flex items-center gap-1 border-2 border-slate-100 p-1.5 rounded-lg bg-white shadow-sm">
                      <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter">Mins:</span>
                      <input type="number" value={m.minutes} onChange={(e) => updatePaper(m.id, 'live', 'minutes', e.target.value)} className="w-12 outline-none font-black text-[10px] text-center" />
                    </div>
                    <div className="relative flex-1 group">
                      <input type="file" accept="image/*,application/pdf" onChange={(e) => handleUpload(e, m.id, 'live')} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
                      <div className={`p-1.5 rounded-lg border-2 border-dashed text-center font-black text-[8px] uppercase transition-all ${m.fileUrl ? 'bg-green-50 text-green-700 border-green-300 shadow-green-50' : 'bg-white text-blue-600 border-blue-200 group-hover:border-blue-400'}`}>{m.fileUrl ? 'Ready' : 'Upload'}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
            {/* Previous Papers */}
            <div className="bg-white p-4 rounded-xl border shadow-sm space-y-4 ring-1 ring-slate-50">
               <div className="flex justify-between items-center border-b pb-2">
                 <div className="flex items-center gap-2 font-black text-[10px] text-blue-700 uppercase italic tracking-widest"><FileText size={16} /> Previous Papers</div>
                 <button onClick={() => addSlot('prev')} className="bg-blue-50 text-blue-700 p-1.5 rounded-full active:scale-90 shadow-sm"><PlusCircle size={18}/></button>
               </div>
               <div className="space-y-3 max-h-80 overflow-y-auto pr-1 no-scrollbar">
                {prevPapers.map(p => (
                  <div key={p.id} className="p-3 bg-slate-50 border rounded-xl space-y-2 shadow-sm transition-all hover:bg-white ring-1 ring-slate-100">
                      <div className="flex gap-2 items-center">
                        <input type="text" value={p.name} onChange={(e) => updatePaper(p.id, 'prev', 'name', e.target.value)} className="bg-white border-2 border-slate-100 p-1 rounded font-bold text-[9px] flex-1 outline-none uppercase" />
                        <button onClick={() => updatePaper(p.id, 'prev', 'isPublished', !p.isPublished)} className={`px-2 py-0.5 rounded text-[6px] font-black uppercase transition-all shadow-sm ${p.isPublished ? 'bg-green-600 text-white shadow-green-100' : 'bg-slate-200 text-slate-500'}`}>{p.isPublished ? 'PUB' : 'HID'}</button>
                        <button onClick={() => setConfirmModal({ isOpen: true, type: 'prev', id: p.id })} className="text-red-300 active:scale-90"><Trash2 size={12} /></button>
                      </div>
                      <div className="flex gap-1 items-center">
                        <div className="flex items-center gap-1 border-2 border-slate-100 p-1 rounded-md bg-white text-[7px] shadow-sm"><span className="text-slate-400 font-black uppercase text-[7px]">H:</span><input type="number" value={p.hours} onChange={(e) => updatePaper(p.id, 'prev', 'hours', e.target.value)} className="w-12 outline-none font-bold text-[9px] text-center border-b border-slate-100" /></div>
                        <div className="flex items-center gap-1 border-2 border-slate-100 p-1 rounded-md bg-white text-[7px] shadow-sm"><span className="text-slate-400 font-black uppercase text-[7px]">M:</span><input type="number" value={p.minutes} onChange={(e) => updatePaper(p.id, 'prev', 'minutes', e.target.value)} className="w-12 outline-none font-bold text-[9px] text-center border-b border-slate-100" /></div>
                        <div className="relative flex-1 group"><input type="file" onChange={(e) => handleUpload(e, p.id, 'prev')} className="absolute inset-0 opacity-0 cursor-pointer z-10" /><div className={`p-1 border-2 border-dashed rounded text-center text-[7px] font-black uppercase transition-all ${p.fileUrl ? 'text-green-600 border-green-200 bg-green-50 shadow-green-50' : 'text-slate-400'}`}>Upload</div></div>
                      </div>
                  </div>
                ))}
               </div>
            </div>

            {/* Practice Sets */}
            <div className="bg-white p-4 rounded-xl border shadow-sm space-y-4 ring-1 ring-slate-50">
               <div className="flex justify-between items-center border-b pb-2 font-black text-[10px] text-purple-700 uppercase tracking-widest">
                 <div className="flex items-center gap-2"><BookOpen size={16} /> Practice Sets</div>
                 <button onClick={() => addSlot('practice')} className="bg-purple-50 text-purple-700 p-1.5 rounded-full active:scale-90 shadow-sm"><PlusCircle size={18}/></button>
               </div>
               <div className="space-y-3 max-h-80 overflow-y-auto pr-1 no-scrollbar">
                {practiceSets.map(p => (
                  <div key={p.id} className="p-3 bg-slate-50 border rounded-xl space-y-2 shadow-sm transition-all hover:bg-white ring-1 ring-slate-100">
                      <div className="flex gap-2 items-center">
                        <input type="text" value={p.name} onChange={(e) => updatePaper(p.id, 'practice', 'name', e.target.value)} className="bg-white border-2 border-slate-100 p-1 rounded font-bold text-[9px] flex-1 outline-none uppercase" />
                        <button onClick={() => updatePaper(p.id, 'practice', 'isPublished', !p.isPublished)} className={`px-2 py-0.5 rounded text-[6px] font-black uppercase transition-all shadow-sm ${p.isPublished ? 'bg-green-600 text-white shadow-green-100' : 'bg-slate-200 text-slate-500'}`}>{p.isPublished ? 'PUB' : 'HID'}</button>
                        <button onClick={() => setConfirmModal({ isOpen: true, type: 'practice', id: p.id })} className="text-red-300 active:scale-90"><Trash2 size={12} /></button>
                      </div>
                      <div className="flex gap-1 items-center">
                        <div className="flex items-center gap-1 border-2 border-slate-100 p-1 rounded-md bg-white text-[7px] shadow-sm"><span className="text-slate-400 font-black uppercase text-[7px]">H:</span><input type="number" value={p.hours} onChange={(e) => updatePaper(p.id, 'practice', 'hours', e.target.value)} className="w-12 outline-none font-bold text-[9px] text-center border-b border-slate-100" /></div>
                        <div className="flex items-center gap-1 border-2 border-slate-100 p-1 rounded-md bg-white text-[7px] shadow-sm"><span className="text-slate-400 font-black uppercase text-[7px]">M:</span><input type="number" value={p.minutes} onChange={(e) => updatePaper(p.id, 'practice', 'minutes', e.target.value)} className="w-12 outline-none font-bold text-[9px] text-center border-b border-slate-100" /></div>
                        <div className="relative flex-1 group"><input type="file" onChange={(e) => handleUpload(e, p.id, 'practice')} className="absolute inset-0 opacity-0 cursor-pointer z-10" /><div className={`p-1 border-2 border-dashed rounded text-center text-[7px] font-black uppercase transition-all ${p.fileUrl ? 'text-green-600 border-green-200 bg-green-50 shadow-green-50' : 'text-slate-400'}`}>Upload</div></div>
                      </div>
                  </div>
                ))}
               </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border shadow-xl space-y-4 ring-1 ring-slate-100 w-full">
             <div className="flex justify-between items-center border-b pb-2 font-black text-[10px] text-orange-600 uppercase tracking-widest">
               <div className="flex items-center gap-2"><Trophy size={16} /> Student Records Hub</div>
               <button onClick={() => setGrowthPublished(!growthPublished)} className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all shadow-md ${growthPublished ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>{growthPublished ? 'Live' : 'Lock'}</button>
             </div>
             <div className="flex gap-2">
               <div className="flex-1 relative shadow-inner"><Search className="absolute left-2 top-2.5 text-slate-300" size={12}/><input type="text" placeholder="Search chhatro..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full p-2 pl-7 rounded-lg bg-slate-50 border-2 border-slate-100 text-[9px] font-bold outline-none shadow-sm" /></div>
               <button onClick={() => setAddStudentModal({ isOpen: true, name: '' })} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-black text-[8px] uppercase flex items-center gap-1 shadow shadow-blue-200 active:scale-95 transition-all"><UserPlus size={14}/> Profile</button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1 pt-1 no-scrollbar">
                {students.filter(n => n.toLowerCase().includes(searchQuery.toLowerCase())).map((name, i) => (
                  <button key={i} onClick={() => setSelectedTeacherStudent(name)} className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 flex justify-between items-center group border-l-8 border-l-blue-600 hover:bg-blue-100/30 transition-all text-left">
                    <div><p className="text-[10px] font-black text-slate-800 uppercase tracking-tighter leading-none">{name}</p><p className="text-[7px] text-slate-400 font-bold uppercase mt-1.5 opacity-80 italic">Manage marksheet</p></div>
                    <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
             </div>
          </div>
        </div>
      ) : (
        <div className="space-y-5 animate-in slide-in-from-right-4 duration-300 max-w-2xl mx-auto w-full">
           <div className="flex justify-between items-center px-1">
             <button onClick={() => setSelectedTeacherStudent(null)} className="flex items-center gap-1 text-[9px] font-black text-blue-600 uppercase hover:underline"><ChevronLeft size={16}/> Back</button>
             <button onClick={() => setConfirmModal({ isOpen: true, type: 'student', id: selectedTeacherStudent })} className="p-2 text-red-400 hover:text-red-600 bg-red-50 rounded-lg shadow-sm active:scale-90 transition-all border border-red-100"><Trash2 size={16} /></button>
           </div>
           <div className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-100 shadow-2xl space-y-6 ring-4 ring-blue-50/50 shadow-blue-100/50">
              <div className="flex items-center gap-4">
                 <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl border-4 border-white rotate-3 shadow-blue-100"><User size={28} /></div>
                 <div><h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter leading-none">{selectedTeacherStudent}</h3><p className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-[0.2em] italic opacity-80">Personal Marksheet</p></div>
              </div>
              <div className="p-5 bg-blue-50/50 rounded-3xl border-2 border-blue-100 space-y-4 shadow-inner">
                 <h4 className="text-[10px] font-black text-blue-700 uppercase flex items-center gap-1.5 tracking-widest leading-none"><PlusCircle size={14}/> Add Examination Mark</h4>
                 <div className="grid grid-cols-2 gap-3">
                   <div className="space-y-1"><label className="text-[7px] font-black text-slate-400 uppercase ml-1">Exam Title</label><input type="text" value={newRes.exam} onChange={(e) => setNewRes({...newRes, exam: e.target.value})} className="w-full p-2 rounded-xl bg-white border-2 border-slate-100 font-bold text-[10px] outline-none focus:border-blue-400 shadow-sm" placeholder="Topic" /></div>
                   <div className="space-y-1"><label className="text-[7px] font-black text-slate-400 uppercase ml-1">Date</label><input type="date" value={newRes.date} onChange={(e) => setNewRes({...newRes, date: e.target.value})} className="w-full p-2 rounded-xl bg-white border-2 border-slate-100 font-bold text-[10px] outline-none focus:border-blue-400 shadow-sm" /></div>
                   <div className="space-y-1"><label className="text-[7px] font-black text-slate-400 uppercase ml-1">Obtained</label><input type="number" value={newRes.obtained} onChange={(e) => setNewRes({...newRes, obtained: e.target.value})} className="w-full p-2 rounded-xl bg-white border-2 border-slate-100 font-black text-[10px] outline-none shadow-sm" placeholder="Obt." /></div>
                   <div className="space-y-1"><label className="text-[7px] font-black text-slate-400 uppercase ml-1">Total</label><input type="number" value={newRes.total} onChange={(e) => setNewRes({...newRes, total: e.target.value})} className="w-full p-2 rounded-xl bg-white border-2 border-slate-100 font-black text-[10px] outline-none shadow-sm" placeholder="Full" /></div>
                 </div>
                 <button onClick={() => { if(newRes.exam && newRes.obtained && newRes.total) { const p = Math.round((parseFloat(newRes.obtained)/parseFloat(newRes.total))*100); setStudentResults([{...newRes, name: selectedTeacherStudent, id: Date.now(), percent: p}, ...studentResults]); setNewRes({exam: "", date: "", obtained: "", total: ""}); notify("Entry Saved"); } }} className="w-full py-3 bg-blue-700 text-white rounded-2xl font-black text-[10px] uppercase active:scale-95 transition-all shadow-xl shadow-blue-200 mt-2 border-b-4 border-blue-900 active:border-b-0 active:translate-y-1">Record Score</button>
              </div>
              <div className="space-y-3 pt-2 border-t-2 border-slate-50">
                 {studentResults.filter(r => r.name === selectedTeacherStudent).map((r) => (
                   <div key={r.id} className="p-4 bg-slate-50 border-2 rounded-2xl flex justify-between items-center group ring-1 ring-slate-100 shadow-sm hover:bg-white transition-all">
                     <div><p className="text-[11px] font-black text-slate-800 uppercase italic tracking-tight">{r.exam}</p><p className="text-[8px] text-slate-400 font-bold uppercase">{r.date} • {r.obtained}/{r.total} • <span className="text-blue-600 font-black">{r.percent}%</span></p></div>
                     <button onClick={() => setConfirmModal({ isOpen: true, type: 'result', id: r.id })} className="p-2 text-red-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-xl active:scale-90"><Trash2 size={16} /></button>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}
      <p className="text-[6px] text-slate-400 font-black uppercase text-center pb-10 tracking-[0.5em] opacity-80 underline decoration-slate-200 underline-offset-4">Anshu Sir's Official Dashboard</p>
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
  const [students, setStudents] = useState(["Anshu Sir Sample"]);
  const [studentResults, setStudentResults] = useState([{ id: 1, name: "Anshu Sir Sample", exam: "Intro Mock", date: "2024-03-25", obtained: 48, total: 50, percent: 96 }]);
  const [activityLogs, setActivityLogs] = useState([]);

  useEffect(() => {
    const cleaner = setInterval(() => {
      const now = Date.now();
      setActivityLogs(prev => prev.filter(log => (now - log.timestamp) < 24 * 60 * 60 * 1000));
    }, 3600000);
    return () => clearInterval(cleaner);
  }, []);

  const handleStartExamFlow = (title, durationSec, fileUrl, fileType) => {
    setPendingExam({ title, duration: durationSec, fileUrl, fileType });
    setShowNameModal(true);
  };

  const finalizeExamStart = (name) => {
    const d = new Date();
    const newLog = { 
      id: Date.now(), 
      studentName: name, 
      examTitle: pendingExam.title, 
      timestamp: Date.now(), 
      timeDisplay: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dateDisplay: d.toLocaleDateString()
    };
    setActivityLogs([newLog, ...activityLogs]);
    setCurrentExam({ ...pendingExam, studentName: name });
    setIsExamActive(true);
    setShowNameModal(false);
  };

  if (isExamActive) return <ExamInterface exam={currentExam} onFinish={() => setIsExamActive(false)} />;

  const renderContent = () => {
    switch (activeTab) {
      case 'live': return <LiveMockListingView liveMocks={liveMocks} onStart={handleStartExamFlow} />;
      case 'practice': return <StudentPracticeListView prevPapers={prevPapers} practiceSets={practiceSets} onStart={handleStartExamFlow} />;
      case 'growth': return <GrowthSectionView isPublished={growthPublished} results={studentResults} />;
      case 'teacher': 
        if (!isTeacherAuthenticated) return <TeacherPinPortal correctPin={teacherPin} onAuthSuccess={() => setIsTeacherAuthenticated(true)} />;
        return <TeacherZoneMainView liveMocks={liveMocks} setLiveMocks={setLiveMocks} prevPapers={prevPapers} setPrevPapers={setPrevPapers} practiceSets={practiceSets} setPracticeSets={setPracticeSets} growthPublished={growthPublished} setGrowthPublished={setGrowthPublished} studentResults={studentResults} setStudentResults={setStudentResults} students={students} setStudents={setStudents} teacherPin={teacherPin} setTeacherPin={setTeacherPin} />;
      default: return <HomeLandingView onStart={() => setActiveTab('practice')} logs={activityLogs} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 select-none text-sm overflow-x-hidden flex flex-col items-center">
      <StudentNameVerification isOpen={showNameModal} onClose={() => setShowNameModal(false)} onConfirm={finalizeExamStart} />
      
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm px-4 py-2.5 flex justify-between items-center w-full max-w-6xl">
        <div className="cursor-pointer group" onClick={() => setActiveTab('home')}>
          <h1 className="text-xl md:text-2xl font-black text-blue-700 uppercase tracking-tighter italic leading-none group-hover:scale-[0.98] transition-transform">MATH EXCELLENCE</h1>
          <p className="text-[8px] md:text-[9px] font-bold text-slate-400 opacity-80 mt-1 tracking-widest leading-none">"Your future our priority"</p>
        </div>
        <div className="hidden md:block shadow-inner rounded-full p-0.5 ring-1 ring-blue-50">
          <span className="bg-blue-700 text-white px-5 py-2 rounded-full font-black text-[9px] uppercase tracking-widest shadow-md">BUILD YOUR FUTURE WITH ANSHU SIR</span>
        </div>
      </header>

      <nav className="bg-blue-700 text-white shadow-2xl sticky top-[46px] md:top-[56px] z-40 overflow-hidden border-t-2 border-blue-600/50 w-full flex justify-center">
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
        {renderContent()}
      </main>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-yellow-400 p-2 text-center font-black text-[8px] shadow-2xl z-50 text-slate-900 uppercase tracking-widest border-t-4 border-yellow-600">BUILD YOUR FUTURE WITH ANSHU SIR</div>
    </div>
  );
};

export default App;
