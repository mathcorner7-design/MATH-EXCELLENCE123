import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, doc, setDoc, deleteDoc, getDocs, writeBatch } from "firebase/firestore";
// Auth এর জন্য নতুন ইমপোর্ট
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "firebase/auth";
import { Trophy, BookOpen, TrendingUp, User, Clock, ChevronRight, GraduationCap, PlusCircle, FileText, Lock, Award, Timer, Settings2, CheckCircle, PenTool, ShieldAlert, Loader2, ChevronLeft, Trash2, UserPlus, History, UserCheck, X, CheckSquare, AlertCircle, ListChecks, Eye, Camera, Send, Link, Zap, Download, Unlock, Phone, SignalHigh } from 'lucide-react';

// --- 🖼️ CONFIGURATION ---
const APP_BACKGROUND_URL = "https://i.gifer.com/4RNk.gif";

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
const auth = getAuth(app); 
const provider = new GoogleAuthProvider();

// --- 🔵 Countdown Component ---
const LiveCountdown = ({ timestamp, onExpire }) => {
    const [timeLeft, setTimeLeft] = useState("");
    useEffect(() => {
        const timer = setInterval(() => {
            const diff = (timestamp + 6 * 3600000) - Date.now();
            if (diff <= 0) {
                clearInterval(timer);
                setTimeLeft("00h 00m 00s");
                onExpire && onExpire();
            } else {
                const h = Math.floor(diff / 3600000);
                const m = Math.floor((diff % 3600000) / 60000);
                const s = Math.floor((diff % 60000) / 1000);
                setTimeLeft(`${h}h ${m < 10 ? '0' + m : m}m ${s < 10 ? '0' + s : s}s`);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [timestamp, onExpire]);
    return <p className="text-[9px] font-black text-yellow-400 uppercase italic mt-1 animate-pulse">Ends in: {timeLeft}</p>;
};

const ImagePreviewModal = ({ src, onClose }) => {
    if (!src) return null;
    return (
        <div className="fixed inset-0 bg-black/95 z-[3000] flex flex-col items-center justify-center p-4 backdrop-blur-md animate-in fade-in print:hidden">
            <button onClick={onClose} className="absolute top-10 right-10 text-white p-3 bg-red-600 rounded-full shadow-2xl"><X size={32} /></button>
            <img src={src} alt="Student Solution" className="max-w-full max-h-[80vh] rounded-xl shadow-2xl border-4 border-white animate-in zoom-in" />
        </div>
    );
};

const ReviewResultModal = ({ result, onClose }) => {
    if (!result) return null;
    return (
        <div className="fixed inset-0 bg-slate-950 z-[2500] flex flex-col items-center overflow-y-auto p-10 text-center animate-in zoom-in duration-300 print:hidden text-white">
            <div className="w-full max-w-lg flex justify-between items-center mb-10 border-b-4 border-slate-800 pb-5">
                <h2 className="text-2xl font-black uppercase italic tracking-tighter text-blue-400">Review: {result.exam}</h2>
                <button onClick={onClose} className="p-2 bg-slate-800 rounded-full hover:bg-red-900 transition-all text-white"><X size={28} /></button>
            </div>
            <div className="w-full max-w-lg space-y-3 mb-14 text-left">
                {result.details && result.details.map((item, idx) => {
                    const isCorrect = item.type === 'written' ? item.mark > 0 : item.status;
                    return (
                        <div key={idx} className={`p-4 rounded-2xl border-2 flex justify-between items-center transition-all ${item.pending ? 'bg-orange-900/40 border-orange-700 text-orange-200' : (isCorrect ? 'bg-green-900/40 border-green-700 text-green-200 shadow-sm' : 'bg-red-900/40 border-red-700 text-red-200 shadow-sm')}`}>
                            <div>
                                <p className="font-black text-xs uppercase italic tracking-tighter">Question Q{item.qNum} <span className="text-[9px] opacity-60 ml-1">({item.mark} Marks)</span></p>
                                <p className="text-[10px] font-bold opacity-80 mt-1 uppercase italic"> Choice: {Array.isArray(item.selected) ? `IMAGE (${item.selected.length} Pgs)` : (item.selected?.startsWith('data:image') ? 'IMAGE' : item.selected)} • Correct: {item.correct} {item.pending && <span className="ml-2 bg-orange-600 px-2 py-0.5 rounded text-[8px] text-white">U GET: PENDING</span>} </p>
                            </div>
                            {item.pending ? <Clock size={18} className="animate-pulse" /> : (isCorrect ? <CheckSquare size={18} /> : <AlertCircle size={18} />)}
                        </div>
                    );
                })}
            </div>
            <button onClick={onClose} className="bg-blue-700 text-white px-16 py-4 rounded-full font-black uppercase text-[12px] shadow-2xl active:scale-95 transition-all border-b-8 border-blue-900 active:border-b-0 mb-20 tracking-tighter italic">Return to Growth</button>
        </div>
    );
};

const App = () => {
    const [activeTab, setActiveTab] = useState('home');
    const [isExamActive, setIsExamActive] = useState(false);
    const [currentExam, setCurrentExam] = useState(null);
    const [showNameModal, setShowNameModal] = useState(false);
    const [studentNameInput, setStudentNameInput] = useState('');
    const [studentCodeInput, setStudentCodeInput] = useState('');
    const [teacherPin, setTeacherPin] = useState('1234567890');
    const [isTeacherAuthenticated, setIsTeacherAuthenticated] = useState(false);
    const [user, setUser] = useState(null); // নতুন

    const [liveMocks, setLiveMocks] = useState([]);
    const [practiceSets, setPracticeSets] = useState([]);
    const [students, setStudents] = useState([]);
    const [studentResults, setStudentResults] = useState([]);
    const [activityLogs, setActivityLogs] = useState([]);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        onSnapshot(collection(db, "liveMocks"), (s) => {
            const data = s.docs.map(d => ({ id: d.id, source: 'live', ...d.data() }));
            setLiveMocks(data.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)));
        });
        onSnapshot(collection(db, "practiceSets"), (s) => {
            const data = s.docs.map(d => ({ id: d.id, source: 'practice', ...d.data() }));
            setPracticeSets(data.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)));
        });
        onSnapshot(collection(db, "results"), (s) => setStudentResults(s.docs.map(d => ({ id: d.id, ...d.data() }))));
        onSnapshot(collection(db, "students"), (s) => setStudents(s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => a.name.localeCompare(b.name))));
        onSnapshot(doc(db, "settings", "adminConfig"), (d) => {
            if (d.exists()) setTeacherPin(d.data().pin);
        });
        onSnapshot(query(collection(db, "logs"), orderBy("timestamp", "desc")), (s) => setActivityLogs(s.docs.map(d => ({ id: d.id, ...d.data() }))));
        
        return () => unsubscribeAuth();
    }, []);

    const handleAdminLogin = async () => {
        try { await signInWithPopup(auth, provider); } catch (e) { alert("Error: " + e.message); }
    };

    const handleStartExamFlow = (exam) => {
        const h = parseInt(exam.hours) || 0;
        const m = parseInt(exam.minutes) || 0;
        setCurrentExam({ ...exam, duration: (h * 3600) + (m * 60) || 3600 });
        setShowNameModal(true);
        setStudentNameInput('');
        setStudentCodeInput('');
    };

    const finalizeExamStart = () => {
        if (!studentNameInput.trim()) return alert("PLEASE ENTER YOUR NAME");
        const isGuestSession = currentExam?.isGuestEnabled;
        if (!isGuestSession) {
            if (!studentCodeInput.trim()) return alert("THIS EXAM IS PROTECTED! UNIQUE CODE IS MANDATORY.");
            const matchedStudent = students.find(s => s.studentCode?.toString().trim() === studentCodeInput.trim());
            if (!matchedStudent) { alert("INVALID STUDENT CODE!"); return; }
            setCurrentExam(prev => ({ ...prev, studentName: matchedStudent.name, studentCode: studentCodeInput.trim(), isGuest: false }));
        } else {
            setCurrentExam(prev => ({ ...prev, studentName: studentNameInput.trim().toUpperCase(), studentCode: studentCodeInput.trim() || 'GUEST', isGuest: true }));
        }
        setIsExamActive(true);
        setShowNameModal(false);
    };

    const ongoingLive = liveMocks.filter(m => m.isPublished && (Date.now() - (m.timestamp || 0) < 6 * 3600000));
    const shiftedLive = liveMocks.filter(m => m.isPublished && (Date.now() - (m.timestamp || 0) >= 6 * 3600000));

    if (isExamActive) return <InteractiveExamHall exam={currentExam} onFinish={() => setIsExamActive(false)} studentsList={students} />;

    const LevelBadge = ({ level }) => {
        if (!level) return null;
        const colors = { 'Easy': 'bg-green-900/40 text-green-400 border-green-800', 'Moderate': 'bg-yellow-900/40 text-yellow-400 border-yellow-800', 'Hard': 'bg-red-900/40 text-red-400 border-red-800' };
        return <span className={`text-[7px] px-1.5 py-0.5 rounded border font-black uppercase italic ml-2 ${colors[level] || 'bg-slate-800 text-slate-400 border-slate-700'}`}>{level}</span>;
    };

    return (
        <div className="min-h-screen font-sans text-white select-none flex flex-col items-center overflow-x-hidden transition-all duration-700 bg-black" style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(${APP_BACKGROUND_URL})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }} >
            <style>{` @media print { body { background: white !important; overflow: visible !important; } header, nav, .print-hide, button, .lucide { display: none !important; } .min-h-screen { min-height: auto !important; background: none !important; } main { padding: 0 !important; width: 100% !important; max-width: 100% !important; color: black !important; } .print-full-report { display: block !important; position: static !important; width: 100% !important; height: auto !important; overflow: visible !important; } .print-card { border: 2px solid #ddd !important; break-inside: avoid; page-break-inside: avoid; margin-bottom: 15px !important; color: black !important; background: white !important; } .text-white { color: black !important; } } main { overflow-anchor: none; } `}</style>
            
            {showNameModal && (
                <div className="fixed inset-0 bg-black/90 z-[1000] flex items-center justify-center p-6 backdrop-blur-md print:hidden">
                    <div className="bg-slate-900 rounded-3xl p-8 max-sm w-full text-center shadow-2xl border-2 border-slate-800">
                        {currentExam?.isGuestEnabled ? <Unlock size={40} className="text-green-500 mx-auto mb-4" /> : <Lock size={40} className="text-blue-500 mx-auto mb-4" />}
                        <h3 className="font-bold text-lg mb-2 uppercase tracking-tight italic text-white">{currentExam?.isGuestEnabled ? 'Guest Entry' : 'Student Login'}</h3>
                        <div className="space-y-4">
                            <input autoFocus type="text" value={studentNameInput} onChange={(e) => setStudentNameInput(e.target.value)} className="w-full p-3 rounded-xl border-2 border-slate-700 bg-black text-white font-bold text-center outline-none focus:border-blue-500 uppercase" placeholder="NAME" />
                            {!currentExam?.isGuestEnabled && <input type="text" value={studentCodeInput} onChange={(e) => setStudentCodeInput(e.target.value)} className="w-full p-3 rounded-xl border-2 border-slate-700 bg-black text-white font-bold text-center outline-none focus:border-blue-500" placeholder="ENTER UNIQUE CODE" />}
                        </div>
                        <div className="flex gap-4 mt-8">
                            <button onClick={() => setShowNameModal(false)} className="flex-1 py-3 rounded-xl bg-slate-800 text-white font-bold text-[10px] uppercase">Cancel</button>
                            <button onClick={finalizeExamStart} className="flex-1 py-3 rounded-xl bg-blue-700 text-white font-bold text-[10px] uppercase shadow-lg">Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            <header className="bg-black/60 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50 shadow-2xl px-6 py-2 flex justify-between items-center w-full max-w-6xl print:hidden">
                <h1 className="text-lg font-black text-blue-400 uppercase italic tracking-tighter cursor-pointer" onClick={() => setActiveTab('home')}>MATH EXCELLENCE</h1>
                <p className="text-[9px] font-bold text-slate-500 italic">ANSHU SIR</p>
            </header>
            <nav className="bg-blue-700/80 backdrop-blur-xl text-white w-full sticky top-[45px] z-40 flex justify-center shadow-lg print:hidden">
                <div className="max-w-6xl w-full flex overflow-x-auto no-scrollbar">
                    {[{ id: 'home', label: 'Home', icon: <History size={14} /> }, { id: 'live', label: 'Live Mock', icon: <Clock size={14} /> }, { id: 'practice', label: 'Practice', icon: <BookOpen size={14} /> }, { id: 'growth', label: 'Growth', icon: <TrendingUp size={14} /> }, { id: 'teacher', label: 'Admin', icon: <User size={14} /> }].map((item) => (
                        <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-3.5 font-bold text-[9px] uppercase border-b-4 transition-all ${activeTab === item.id ? 'border-yellow-400 bg-white/10' : 'border-transparent'}`}>{item.icon} {item.label}</button>
                    ))}
                </div>
            </nav>

            <main className="w-full max-w-5xl p-4 mb-20 flex flex-col items-center">
                {activeTab === 'home' && (
                    <div className="space-y-6 animate-in fade-in w-full text-center print:hidden">
                        <div className="bg-black/60 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border-2 border-white/10">
                            <GraduationCap size={48} className="text-blue-400 mx-auto mb-3 animate-bounce-slow" />
                            <h2 className="text-xl md:text-3xl font-black uppercase italic tracking-tight leading-tight text-white">Elevate Your Mathematics <br /> <span className="text-blue-400 underline decoration-yellow-400 decoration-2 underline-offset-8">with Anshu Sir</span></h2>
                            <div className="mt-10 p-6 bg-white/5 rounded-3xl border border-white/10 shadow-inner">
                                <p className="text-slate-400 font-bold uppercase italic text-[11px] mb-4 tracking-widest">To become a Registered Student, please contact Anshu Sir</p>
                                <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                                    <a href="tel:9002892918" className="text-3xl font-black text-yellow-400 italic tracking-tighter flex items-center gap-3 drop-shadow-xl hover:scale-105 transition-transform"><Phone size={28} className="text-blue-500 animate-pulse" /> 9002892918</a>
                                    <a href="https://wa.me/919002892918" target="_blank" rel="noreferrer" className="text-3xl font-black text-green-400 italic tracking-tighter flex items-center gap-3 drop-shadow-xl hover:scale-105 transition-transform"><Send size={28} className="text-green-500" /> WhatsApp</a>
                                </div>
                            </div>
                            <div className="mt-10 overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
                                <table className="w-full text-left text-[11px] md:text-xs">
                                    <thead>
                                        <tr className="bg-blue-700/50 text-white uppercase italic font-black">
                                            <th className="p-4 border-b border-white/10">Features</th>
                                            <th className="p-4 border-b border-white/10 text-center text-slate-300">Guest Student</th>
                                            <th className="p-4 border-b border-white/10 text-center text-yellow-400">Registered Student</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-black/40 font-bold text-slate-300">
                                        <tr className="border-b border-white/5"><td className="p-4 uppercase italic">Exam Access</td><td className="p-4 text-center">Limited Mock</td><td className="p-4 text-center text-green-400">Unlimited Mocks & Features</td></tr>
                                        <tr className="border-b border-white/5"><td className="p-4 uppercase italic">Test Format</td><td className="p-4 text-center">Only MCQ</td><td className="p-4 text-center text-green-400">MCQ + Written Test Review</td></tr>
                                        <tr className="border-b border-white/5"><td className="p-4 uppercase italic">Performance Reports</td><td className="p-4 text-center">Only Marks</td><td className="p-4 text-center text-green-400">Full Review of All Exams</td></tr>
                                        <tr><td className="p-4 uppercase italic">Live Arena</td><td className="p-4 text-center text-red-500/70">No Live Mock</td><td className="p-4 text-center text-green-400">Access to Live Mocks</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="bg-black/60 backdrop-blur-xl p-5 rounded-3xl shadow-md border border-white/10 text-left w-full">
                            <h3 className="font-bold text-xs uppercase mb-3 border-b border-white/10 pb-2 flex items-center gap-2 italic text-blue-300"><History size={16} className="text-blue-400" /> Activity Stream</h3>
                            <div className="space-y-3">
                                {activityLogs.slice(0, 10).map(log => (
                                    <div key={log.id} className="p-2.5 bg-white/5 rounded-xl flex justify-between items-center border-l-4 border-blue-600 shadow-sm hover:bg-white/10 transition-all">
                                        <div><p className="text-[10px] font-black uppercase text-white">{log.studentName}</p><p className="text-[8px] font-bold text-slate-400 uppercase italic">{log.examTitle} • {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'teacher' && (
                    !user ? (
                        <div className="max-w-md w-full mx-auto mt-20 p-10 bg-slate-950 rounded-3xl text-center border-t-8 border-blue-700">
                            <User size={40} className="text-blue-500 mx-auto mb-6" />
                            <button onClick={handleAdminLogin} className="bg-blue-700 text-white px-10 py-4 rounded-full font-black uppercase text-[10px] shadow-2xl active:scale-95 transition-all">Login with Google</button>
                        </div>
                    ) : user.email !== 'mathcorner7@gmail.com' ? (
                        <div className="max-w-md w-full mx-auto mt-20 p-10 bg-red-950 rounded-3xl text-center border-t-8 border-red-700 text-white">
                            <ShieldAlert size={40} className="text-red-500 mx-auto mb-4" />
                            <h3 className="font-black uppercase italic">Access Denied</h3>
                            <p className="text-[10px] mt-2 opacity-70">Unauthorized account: {user.email}</p>
                            <button onClick={() => signOut(auth)} className="mt-6 text-[10px] font-bold underline uppercase">Logout</button>
                        </div>
                    ) : !isTeacherAuthenticated ? (
                        <div className="max-w-md w-full mx-auto mt-20 p-10 bg-slate-950 rounded-3xl text-center border-t-8 border-blue-700">
                            <div className="flex justify-between items-center mb-6">
                                <p className="text-[8px] font-black text-green-500 uppercase italic">Admin: {user.email}</p>
                                <button onClick={() => signOut(auth)} className="text-[8px] font-black text-red-500 underline uppercase italic">Logout</button>
                            </div>
                            <Lock size={40} className="text-blue-500 mx-auto mb-6" />
                            <input type="password" autoFocus onChange={(e) => { if (e.target.value === teacherPin) setIsTeacherAuthenticated(true); }} className="w-full py-4 bg-black border-2 border-slate-800 rounded-xl text-center text-4xl font-black outline-none text-white" placeholder="••••" />
                        </div>
                    ) : (
                        <TeacherZoneMainView liveMocks={liveMocks} practiceSets={practiceSets} students={students} teacherPin={teacherPin} studentResults={studentResults} setTeacherPin={async (v) => await setDoc(doc(db, "settings", "adminConfig"), { pin: v }, { merge: true })} />
                    )
                )}

                {activeTab === 'live' && (
                    <div className="space-y-4 w-full text-left print:hidden">
                        <h2 className="font-bold uppercase text-blue-300 border-b border-white/10 pb-2 text-[10px] flex items-center gap-2 bg-black/40 p-2 rounded-lg backdrop-blur-md"><Clock size={14} className="text-red-500" /> Ongoing Live Mocks</h2>
                        {ongoingLive.length > 0 ? ongoingLive.map((m, i) => (
                            <div key={m.id} className="bg-black/60 backdrop-blur-xl p-4 rounded-2xl shadow-xl flex justify-between items-center border border-white/10">
                                <div className="flex-1 pr-4">
                                    <div className="flex items-center flex-wrap">
                                        <h3 className="text-sm font-black uppercase italic tracking-tighter text-white break-words">{i + 1}. {m.name}</h3>
                                        <LevelBadge level={m.level} />
                                    </div>
                                    <LiveCountdown timestamp={m.timestamp} />
                                </div>
                                <button onClick={() => handleStartExamFlow(m)} className={`px-6 py-2 rounded-full font-black text-[9px] uppercase shadow-lg h-fit flex items-center gap-2 ${m.isGuestEnabled ? 'bg-red-600 text-white' : 'bg-slate-800 text-blue-400 border border-blue-900/50'}`}>
                                    {!m.isGuestEnabled && <Lock size={12} />}
                                    {m.isGuestEnabled ? 'Attend' : 'Protected'}
                                </button>
                            </div>
                        )) : <p className="text-[10px] text-slate-500 italic p-4 text-center">No active sessions.</p>}
                    </div>
                )}

                {activeTab === 'growth' && <GrowthSectionView results={studentResults} students={students} />}
                {activeTab === 'practice' && (
                    <div className="w-full space-y-8 print:hidden">
                        {(() => {
                            const allMocks = [...practiceSets.filter(p => p.isPublished), ...shiftedLive];
                            const classes = [...new Set(allMocks.map(m => m.class || 'Other'))].sort((a, b) => parseInt(a) - parseInt(b));
                            return classes.map(cls => (
                                <div key={cls} className="space-y-4">
                                    <h2 className="font-black uppercase text-blue-400 border-b-2 border-blue-900/50 pb-2 text-xs flex items-center gap-2 italic tracking-widest pl-2"><BookOpen size={16} /> Class {cls}</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {allMocks.filter(m => (m.class || 'Other') === cls).map((p, i) => (
                                            <div key={p.id} className="bg-black/60 backdrop-blur-xl p-4 rounded-2xl shadow flex justify-between items-center border border-white/10">
                                                <div className="flex-1 pr-4">
                                                    <div className="flex items-center flex-wrap"><h3 className="font-bold uppercase text-xs italic text-white">{i + 1}. {p.name}</h3><LevelBadge level={p.level} /></div>
                                                    <p className="text-[9px] font-bold text-slate-500 uppercase italic mt-1">Time: {p.hours || 0}h {p.minutes || 0}m</p>
                                                </div>
                                                <button onClick={() => handleStartExamFlow(p)} className={`px-6 py-2 rounded-full font-black text-[9px] uppercase shadow-md h-fit ${p.isGuestEnabled ? 'bg-blue-600 text-white' : 'bg-slate-800 text-blue-400 border border-blue-900/50'}`}>Start</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>
                )}
            </main>
        </div>
    );
};

// --- Teacher প্যানেল ও বাকি অংশ একদম অরিজিনাল ---
const TeacherZoneMainView = ({ liveMocks, practiceSets, students, teacherPin, setTeacherPin, studentResults }) => {
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isChangingPin, setIsChangingPin] = useState(false);
    const [pinVal, setPinVal] = useState('');
    const [expandedId, setExpandedId] = useState(null);
    const [quickAddType, setQuickAddType] = useState('live');
    const [qaName, setQaName] = useState('');
    const [qaHours, setQaHours] = useState('1');
    const [qaMinutes, setQaMinutes] = useState('0');
    const [qaLink, setQaLink] = useState('');
    const [qaKey, setQaKey] = useState('');
    const [qaMarks, setQaMarks] = useState('');
    const [qaNeg, setQaNeg] = useState('0');
    const [qaGuest, setQaGuest] = useState(false);
    const [qaClass, setQaClass] = useState('10');
    const [qaLevel, setQaLevel] = useState('Moderate');

    const updateField = async (id, type, field, value) => {
        const coll = type === 'live' ? 'liveMocks' : 'practiceSets';
        const finalVal = (field === 'isPublished' && value === true) ? { [field]: value, timestamp: Date.now() } : { [field]: value };
        await setDoc(doc(db, coll, id), finalVal, { merge: true });
    };

    const handleQuickAdd = async () => {
        if (!qaName.trim()) return alert("Exam Name Required!");
        const coll = quickAddType === 'live' ? 'liveMocks' : 'practiceSets';
        await addDoc(collection(db, coll), { name: qaName.toUpperCase(), hours: qaHours, minutes: qaMinutes, fileUrl: qaLink.trim(), answerKey: qaKey.toUpperCase(), questionMarks: qaMarks, negativeMark: qaNeg || "0", isPublished: false, isGuestEnabled: qaGuest, class: qaClass, level: qaLevel, timestamp: Date.now() });
        setQaName(''); setQaLink(''); setQaKey(''); setQaMarks(''); setQaNeg('0'); setQaGuest(false);
        alert(`Success: Added to Registry`);
    };

    const adminLive = liveMocks.filter(m => (Date.now() - (m.timestamp || 0) < 6 * 3600000)).sort((a,b) => (b.timestamp || 0) - (a.timestamp || 0));
    const adminShifted = [...practiceSets, ...liveMocks.filter(m => (Date.now() - (m.timestamp || 0) >= 6 * 3600000))].sort((a,b) => (b.timestamp || 0) - (a.timestamp || 0));

    const AdminPaperManager = ({ title, items, color }) => {
        const classes = [...new Set(items.map(m => m.class || 'Other'))].sort((a,b) => parseInt(a) - parseInt(b));
        return (
            <div className="bg-black/60 backdrop-blur-xl rounded-[2rem] shadow-2xl border-t-8 border-slate-900 mb-8 w-full overflow-hidden border-x border-b border-white/5">
                <div className="flex justify-between items-center p-6 border-b border-white/5"><h3 className={`font-black uppercase text-xs italic ${color}`}>{title} Manager ({items.length})</h3></div>
                <div className="max-h-[600px] overflow-y-auto p-4 space-y-6 bg-white/5 no-scrollbar">
                    {classes.map(cls => (
                        <div key={cls} className="space-y-3">
                            <h4 className="text-[10px] font-black text-blue-400 uppercase italic border-b border-white/5 pb-1">Class {cls}</h4>
                            {items.filter(m => (m.class || 'Other') === cls).map((item) => (
                                <div key={item.id} className="bg-slate-900/60 rounded-2xl border border-white/10 overflow-hidden">
                                    <div onClick={() => setExpandedId(expandedId === item.id ? null : item.id)} className="p-4 flex justify-between items-center cursor-pointer hover:bg-white/5">
                                        <div className="flex-1 pr-2">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full ${item.isPublished ? 'bg-green-500 animate-pulse' : 'bg-slate-700'}`}></div>
                                                    <span className="text-xs font-black uppercase italic text-white">{item.name}</span>
                                                    {item.isGuestEnabled && <span className="text-[7px] bg-green-600 px-1.5 py-0.5 rounded text-white font-black italic">GUEST</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button onClick={(e) => { e.stopPropagation(); updateField(item.id, item.source, 'isPublished', !item.isPublished); }} className={`px-4 py-1.5 rounded-full text-[8px] font-black ${item.isPublished ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-500'}`}>{item.isPublished ? 'LIVE' : 'HIDDEN'}</button>
                                            <button onClick={async (e) => { e.stopPropagation(); if(window.confirm("Permanent delete?")) { await deleteDoc(doc(db, item.source === 'live' ? 'liveMocks' : 'practiceSets', item.id)); } }} className="p-2 text-slate-600 hover:text-red-500"><Trash2 size={16}/></button>
                                            <ChevronRight size={18} className={`transition-transform ${expandedId === item.id ? 'rotate-90 text-blue-400' : ''}`} />
                                        </div>
                                    </div>
                                    {expandedId === item.id && (
                                        <div className="p-5 border-t border-white/5 bg-black/40 space-y-4 animate-in slide-in-from-top-2">
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                                                <div className="flex items-center gap-2"><input type="checkbox" checked={item.isGuestEnabled} onChange={(e) => updateField(item.id, item.source, 'isGuestEnabled', e.target.checked)} className="accent-green-500" /><p className="text-[10px] font-black text-green-400 uppercase italic">Guest Mode</p></div>
                                                <div><p className="text-[8px] font-black text-blue-400 uppercase mb-1">Class</p><select value={item.class || '10'} onChange={(e) => updateField(item.id, item.source, 'class', e.target.value)} className="w-full p-2 bg-black border border-white/10 rounded-xl text-white text-xs font-black">{[5,6,7,8,9,10,11,12].map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                                                <div className="md:col-span-2"><p className="text-[8px] font-black text-yellow-500 uppercase mb-1">Complexity</p><select value={item.level || 'Moderate'} onChange={(e) => updateField(item.id, item.source, 'level', e.target.value)} className="w-full p-2 bg-black border border-white/10 rounded-xl text-white text-xs font-black">{['Easy', 'Moderate', 'Hard'].map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}</select></div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div><p className="text-[8px] font-black text-slate-500 uppercase mb-1 italic">Exam Name</p><input type="text" defaultValue={item.name} onBlur={(e) => updateField(item.id, item.source, 'name', e.target.value.toUpperCase())} className="w-full p-2.5 rounded-xl border border-white/10 bg-black text-white text-xs font-black outline-none" /></div>
                                                <div><p className="text-[8px] font-black text-red-500 uppercase mb-1 italic">Negative Mark</p><input type="number" step="0.01" defaultValue={item.negativeMark || 0} onBlur={(e) => updateField(item.id, item.source, 'negativeMark', e.target.value)} className="w-full p-2.5 rounded-xl border border-white/10 bg-black text-white text-xs font-black outline-none" /></div>
                                            </div>
                                            <div className="flex flex-wrap gap-3">
                                                <div className="bg-black p-2.5 rounded-xl border border-white/10 shadow-sm min-w-[120px]"><p className="text-[8px] font-black text-blue-400 uppercase mb-1 ml-1">Time Limit</p><div className="flex items-center gap-1"><input type="number" defaultValue={item.hours} onBlur={(e) => updateField(item.id, item.source, 'hours', e.target.value)} className="w-10 text-center font-black bg-slate-900 rounded-lg outline-none text-white" /><span className="font-bold text-[9px]">H</span><input type="number" defaultValue={item.minutes} onBlur={(e) => updateField(item.id, item.source, 'minutes', e.target.value)} className="w-10 text-center font-black bg-slate-900 rounded-lg outline-none text-white" /><span className="font-bold text-[9px]">M</span></div></div>
                                                <div className="flex-1 bg-black p-2.5 rounded-xl border border-white/10"><p className="text-[8px] font-black text-slate-500 uppercase mb-1 italic">Drive Link</p><input type="text" defaultValue={item.fileUrl} onBlur={(e) => updateField(item.id, item.source, 'fileUrl', e.target.value)} className="w-full p-2 rounded-lg border border-white/5 bg-black text-white text-[10px] font-bold" /></div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div><p className="text-[8px] font-black text-yellow-500 uppercase mb-1 italic">Answer Key</p><input type="text" defaultValue={item.answerKey} onBlur={(e) => updateField(item.id, item.source, 'answerKey', e.target.value.toUpperCase())} className="w-full p-2.5 bg-black border border-white/10 rounded-xl text-xs text-white" /></div>
                                                <div><p className="text-[8px] font-black text-green-500 uppercase mb-1 italic">Marks/Q</p><input type="text" defaultValue={item.questionMarks} onBlur={(e) => updateField(item.id, item.source, 'questionMarks', e.target.value)} className="w-full p-2.5 bg-black border border-white/10 rounded-xl text-xs text-white" /></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="w-full flex flex-col items-center">
            <div className="bg-slate-950/80 p-6 rounded-[2.5rem] shadow-2xl border-t-8 border-blue-700 w-full mb-8 text-left border-x border-b border-white/5">
                <div className="flex justify-between items-center mb-6"><h3 className="font-black text-[10px] uppercase italic text-blue-400"><Zap size={20} /> Quick Add</h3>
                <div className="flex gap-1 p-1 bg-black rounded-xl">
                    <button onClick={() => setQuickAddType('live')} className={`px-4 py-1.5 rounded-lg font-black text-[8px] uppercase ${quickAddType === 'live' ? 'bg-red-600 text-white' : 'text-slate-500'}`}>Live</button>
                    <button onClick={() => setQuickAddType('practice')} className={`px-4 py-1.5 rounded-lg font-black text-[8px] uppercase ${quickAddType === 'practice' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>Practice</button>
                </div></div>
                <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="flex items-center gap-2"><input type="checkbox" checked={qaGuest} onChange={(e) => setQaGuest(e.target.checked)} /><p className="text-[9px] font-black text-slate-400 uppercase italic">Guest</p></div>
                        <div><p className="text-[8px] font-black text-blue-400 uppercase mb-1">Class</p><select value={qaClass} onChange={(e) => setQaClass(e.target.value)} className="w-full p-2 bg-black border border-white/10 rounded-xl text-white text-[10px] font-black">{[5, 6, 7, 8, 9, 10, 11, 12].map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                        <div><p className="text-[8px] font-black text-yellow-500 uppercase mb-1">Level</p><select value={qaLevel} onChange={(e) => setQaLevel(e.target.value)} className="w-full p-2 bg-black border border-white/10 rounded-xl text-white text-[10px] font-black">{['Easy', 'Moderate', 'Hard'].map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}</select></div>
                    </div>
                    <input type="text" value={qaName} onChange={(e) => setQaName(e.target.value)} className="w-full p-3.5 bg-black border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase" placeholder="EXAM NAME" />
                    <div className="flex gap-4">
                        <div className="bg-black p-3 rounded-2xl border border-white/10 min-w-[120px]"><p className="text-[8px] font-black text-blue-400 uppercase mb-1 italic">TIME</p><div className="flex gap-1 text-[10px] font-black"><input type="number" value={qaHours} onChange={(e) => setQaHours(e.target.value)} className="w-8 bg-transparent" /><span>H</span><input type="number" value={qaMinutes} onChange={(e) => setQaMinutes(e.target.value)} className="w-8 bg-transparent" /><span>M</span></div></div>
                        <div className="flex-1 bg-black p-3 rounded-2xl border border-white/10"><p className="text-[8px] font-black text-red-400 uppercase mb-1 italic">NEGATIVE</p><input type="number" step="0.01" value={qaNeg} onChange={(e) => setQaNeg(e.target.value)} className="w-full bg-transparent text-[10px] font-bold text-white" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black p-3 rounded-2xl border border-white/10"><p className="text-[9px] font-black text-blue-400 mb-1">KEY</p><input type="text" value={qaKey} onChange={(e) => setQaKey(e.target.value)} className="w-full bg-transparent font-black text-[10px] uppercase" placeholder="A,B,W,D" /></div>
                        <div className="bg-black p-3 rounded-2xl border border-white/10"><p className="text-[9px] font-black text-yellow-500 mb-1">MARKS</p><input type="text" value={qaMarks} onChange={(e) => setQaMarks(e.target.value)} className="w-full bg-transparent font-black text-[10px]" placeholder="1,1,5,1" /></div>
                    </div>
                    <input type="text" value={qaLink} onChange={(e) => setQaLink(e.target.value)} className="w-full p-3 bg-black border border-white/10 rounded-2xl text-[9px] text-white" placeholder="PDF/DRIVE LINK" />
                    <button onClick={handleQuickAdd} className="w-full bg-blue-700 text-white py-4 rounded-[1.5rem] font-black uppercase shadow-2xl hover:bg-blue-600 italic">Deploy to Registry</button>
                </div>
            </div>

            <div className="bg-black/60 p-4 rounded-2xl flex justify-between items-center w-full mb-8 border border-white/10">
                <div className="flex gap-2">
                    {isChangingPin ? (
                        <div className="flex gap-2 animate-in slide-in-from-left-2"><input type="password" value={pinVal} onChange={(e) => setPinVal(e.target.value)} className="bg-black border border-white/10 rounded-full px-4 text-xs font-black text-white w-24" /><button onClick={async () => { if (pinVal.length >= 4) { await setTeacherPin(pinVal); setIsChangingPin(false); alert("PIN UPDATED"); } }} className="bg-green-600 text-white px-3 py-1.5 rounded-full text-[8px] font-black">Save</button></div>
                    ) : ( <button onClick={() => setIsChangingPin(true)} className="px-5 py-2 rounded-full bg-blue-900/40 text-blue-400 text-[10px] font-black border border-blue-800/50">PIN</button> )}
                    <button onClick={async () => { if (window.confirm("Clear Logs?")) { const q = query(collection(db, "logs")); const snap = await getDocs(q); const batch = writeBatch(db); snap.docs.forEach(d => batch.delete(d.ref)); await batch.commit(); } }} className="px-5 py-2 rounded-full bg-red-900/40 text-red-400 text-[10px] font-black border border-red-800/50">Clear Logs</button>
                </div>
            </div>

            <AdminPaperManager title="Live Mock" items={adminLive} color="text-red-500" />
            <AdminPaperManager title="Practice" items={adminShifted} color="text-blue-400" />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full mb-20">
                {students.map((std) => (
                    <div key={std.id} className="p-5 bg-white/5 border border-white/10 rounded-[2rem] flex flex-col items-center shadow-lg transition-all">
                        <input type="text" defaultValue={std.name} onBlur={async (e) => { if (e.target.value !== std.name) await setDoc(doc(db, "students", std.id), { name: e.target.value.toUpperCase() }, { merge: true }); }} className="bg-transparent text-center font-black uppercase italic text-white outline-none" />
                        <div className="mt-2 flex items-center gap-2 bg-blue-950 px-3 py-1 rounded-full border border-blue-900"><Lock size={10} className="text-blue-400" /><input type="text" defaultValue={std.studentCode} onBlur={async (e) => { if (e.target.value !== std.studentCode) await setDoc(doc(db, "students", std.id), { studentCode: e.target.value }, { merge: true }); }} className="bg-transparent text-[10px] font-black text-blue-400 w-20 text-center" /></div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setSelectedStudent(std)} className="px-5 py-1.5 bg-slate-800 border rounded-full text-[10px] font-black uppercase italic">Reports</button>
                            <button onClick={async () => { if (window.confirm(`Delete ${std.name}?`)) await deleteDoc(doc(db, "students", std.id)); }} className="p-2 bg-red-950/40 text-red-500 rounded-full border border-red-900/50"><Trash2 size={16} /></button>
                        </div>
                    </div>
                ))}
                <button onClick={async () => { const n = prompt("Name:"); const c = prompt("Code:"); if (n) await addDoc(collection(db, "students"), { name: n.toUpperCase(), studentCode: c || "" }); }} className="p-8 border-4 border-dashed border-white/10 rounded-[2.5rem] text-[12px] font-black text-slate-600 uppercase">+ REGISTER</button>
            </div>
            {selectedStudent && <AdminMarksheetModal student={selectedStudent} results={studentResults} onClose={() => setSelectedStudent(null)} />}
        </div>
    );
};

const AdminMarksheetModal = ({ student, results, onClose }) => {
    const [newRes, setNewRes] = useState({ exam: "", obtained: "", total: "", date: "" });
    const [previewImg, setPreviewImg] = useState(null);
    return (
        <div className="fixed inset-0 bg-slate-950 z-[1200] p-6 overflow-y-auto animate-in slide-in-from-right-full duration-500 text-white">
            {previewImg && <ImagePreviewModal src={previewImg} onClose={() => setPreviewImg(null)} />}
            <button onClick={onClose} className="font-black text-blue-400 mb-10 flex items-center gap-3 border-b-4 border-blue-400 w-fit uppercase text-[11px] italic tracking-tighter"><ChevronLeft size={24} /> Back</button>
            <div className="bg-slate-900/60 p-10 rounded-[3rem] border border-white/10 shadow-3xl max-w-xl mx-auto space-y-10">
                <div className="flex items-center gap-5 border-b border-white/10 pb-6"><div className="w-16 h-16 bg-blue-700 rounded-[1.5rem] flex items-center justify-center italic font-black text-2xl">{student?.name?.charAt(0)}</div><div><h3 className="text-3xl font-black uppercase italic text-white leading-none">{student?.name}</h3><p className="text-[11px] font-bold text-slate-500 uppercase italic">Performance Logs</p></div></div>
                <div className="p-8 bg-black rounded-[2.5rem] space-y-5 border border-white/10 print:hidden"><div className="grid grid-cols-1 gap-5 text-left"><input type="text" value={newRes.exam} onChange={(e) => setNewRes({ ...newRes, exam: e.target.value.toUpperCase() })} className="w-full p-4 rounded-xl border bg-slate-900 text-white font-black text-xs" placeholder="Module Name" /><input type="date" value={newRes.date} onChange={(e) => setNewRes({ ...newRes, date: e.target.value })} className="w-full p-4 rounded-xl border bg-slate-900 text-white font-black text-xs" /><div className="flex gap-3"><input type="number" placeholder="Obt" value={newRes.obtained} onChange={(e) => setNewRes({ ...newRes, obtained: e.target.value })} className="w-1/2 p-4 rounded-xl border bg-slate-900 text-white font-black text-lg text-center" /><input type="number" placeholder="Full" value={newRes.total} onChange={(e) => setNewRes({ ...newRes, total: e.target.value })} className="w-1/2 p-4 rounded-xl border bg-slate-900 text-white font-black text-lg text-center" /></div></div><button onClick={async () => { if (newRes.exam && newRes.obtained && newRes.total && newRes.date) { const p = Math.round((parseFloat(newRes.obtained) / parseFloat(newRes.total)) * 100); await addDoc(collection(db, "results"), { ...newRes, name: student.name, percent: p, timestamp: Date.now() }); setNewRes({ exam: "", obtained: "", total: "", date: "" }); alert("Saved!"); } }} className="w-full py-5 bg-blue-700 text-white rounded-[1.5rem] font-black uppercase text-xs">Manual Entry</button></div>
                <div className="space-y-8 pt-8 border-t border-white/10">
                    {results.filter(r => r.name === student?.name).sort((a, b) => b.timestamp - a.timestamp).map(r => (
                        <div key={r.id} className="p-6 bg-white/5 border border-white/10 rounded-[2.5rem] flex flex-col gap-6 group">
                            <div className="flex justify-between items-start w-full"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg bg-blue-900/40 text-blue-400 border border-blue-800/50">{r.percent}%</div><div className="flex-1 min-w-0 pr-2"><p className="text-sm font-black uppercase italic text-white leading-none break-words">{r.exam}</p><p className="text-[10px] font-bold text-slate-500 mt-1 italic">{r.date} • Score: {r.obtained}/{r.total}</p></div></div><button onClick={async () => { if (window.confirm("Purge record?")) await deleteDoc(doc(db, "results", r.id)); }} className="text-slate-600 hover:text-red-500"><Trash2 size={24} /></button></div>
                            {r.details && r.details.some(d => d.pending) && (
                                <div className="bg-orange-950/30 border border-orange-900/50 rounded-[2rem] p-4 flex flex-col gap-3 shadow-inner"><p className="text-[10px] font-black text-orange-400 uppercase italic text-center animate-pulse">Action Required: Written Solutions</p><div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar snap-x snap-mandatory">
                                    {r.details.filter(d => d.pending).map((pendingQ, pIdx) => {
                                        const photoList = Array.isArray(pendingQ.selected) ? pendingQ.selected : [pendingQ.selected];
                                        return photoList.map((photoUrl, imgIdx) => (
                                            <div key={`${pIdx}-${imgIdx}`} className="min-w-[200px] bg-black border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-3 snap-center"><p className="text-[9px] font-black text-slate-500 uppercase italic">Q{pendingQ.qNum} - Page {imgIdx + 1}</p><button onClick={() => setPreviewImg(photoUrl)} className="w-full py-2 bg-blue-600 text-white rounded-xl font-black text-[9px] uppercase">View Page</button>
                                                {imgIdx === photoList.length - 1 && (<div className="flex gap-2 w-full mt-2"><input id={`mark-input-${r.id}-${pendingQ.qNum}`} type="number" placeholder="Marks" className="w-1/2 p-2 border border-slate-700 rounded-xl text-center font-black text-[10px] bg-black text-white" /><button onClick={async () => { const markVal = document.getElementById(`mark-input-${r.id}-${pendingQ.qNum}`).value; if (!markVal) return alert("Enter marks!"); const updatedDetails = r.details.map(d => (d.pending && d.qNum === pendingQ.qNum) ? { ...d, status: true, mark: parseFloat(markVal), pending: false, selected: "PHOTO_DELETED" } : d); const newObt = updatedDetails.reduce((sum, d) => sum + (d.status ? d.mark : 0), 0); await setDoc(doc(db, "results", r.id), { details: updatedDetails, obtained: newObt, percent: Math.round((newObt / r.total) * 100) }, { merge: true }); alert(`Q${pendingQ.qNum} Updated!`); }} className="w-1/2 py-2 bg-orange-600 text-white rounded-xl font-black text-[9px] uppercase">Save</button></div>)}</div>));
                                    })}</div></div>)}</div>))}</div></div></div>
    );
};

const InteractiveExamHall = ({ exam, onFinish, studentsList }) => {
    const recoveryKey = `exam_recovery_${exam.studentCode}_${exam.id}`;
    const timerKey = `timer_end_${exam.studentCode}_${exam.id}`;
    const [timeLeft, setTimeLeft] = useState(() => {
        const savedEnd = localStorage.getItem(timerKey);
        if (savedEnd) { const remaining = Math.floor((parseInt(savedEnd) - Date.now()) / 1000); return remaining > 0 ? remaining : 0; }
        const initialDuration = parseInt(exam?.duration) || 3600;
        localStorage.setItem(timerKey, (Date.now() + initialDuration * 1000).toString());
        return initialDuration;
    });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [answers, setAnswers] = useState(() => { const savedAnswers = localStorage.getItem(recoveryKey); return savedAnswers ? JSON.parse(savedAnswers) : {}; });
    const [activeQuestion, setActiveQuestion] = useState(null);
    const [scoreData, setScoreData] = useState(null);

    useEffect(() => { localStorage.setItem(recoveryKey, JSON.stringify(answers)); }, [answers, recoveryKey]);

    const handleImageUpload = (qNum, file) => {
        if (exam.isGuest) return alert("Guest users cannot upload images.");
        if (!file) return;
        const reader = new FileReader(); reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image(); img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas'); const MAX_WIDTH = 800;
                canvas.width = MAX_WIDTH; canvas.height = img.height * (MAX_WIDTH / img.width);
                const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.5);
                setAnswers(prev => { const existingPhotos = Array.isArray(prev[qNum]) ? prev[qNum] : []; return { ...prev, [qNum]: [...existingPhotos, compressedBase64] }; });
            };
        };
    };

    const removeImage = (qNum, indexToRemove) => {
        setAnswers(prev => { const existingPhotos = Array.isArray(prev[qNum]) ? prev[qNum] : []; const updatedPhotos = existingPhotos.filter((_, idx) => idx !== indexToRemove); if (updatedPhotos.length === 0) { const newAnswers = { ...prev }; delete newAnswers[qNum]; return newAnswers; } return { ...prev, [qNum]: updatedPhotos }; });
    };

    const handleOptionSelect = (qNum, opt) => {
        setAnswers(prev => { const newAnswers = { ...prev }; if (prev[qNum] === opt) { delete newAnswers[qNum]; } else { newAnswers[qNum] = opt; } return newAnswers; });
    };

    const answerKeyArray = exam?.answerKey ? exam.answerKey.split(',').map(k => k.trim().toUpperCase()) : [];
    const marksArray = exam?.questionMarks ? exam.questionMarks.split(',').map(m => parseFloat(m.trim()) || 1) : [];
    const negVal = parseFloat(exam?.negativeMark) || 0;

    useEffect(() => {
        let t;
        if (!isSubmitted && timeLeft > 0) t = setInterval(() => setTimeLeft(p => p - 1), 1000);
        else if (timeLeft <= 0 && !isSubmitted) submitExam();
        return () => clearInterval(t);
    }, [timeLeft, isSubmitted]);

    const submitExam = async () => {
        try {
            let totalObtainedMarks = 0; let totalPossibleMarks = 0;
            const detailResults = answerKeyArray.map((key, index) => {
                const qNum = index + 1; const qMark = marksArray[index] !== undefined ? marksArray[index] : 1;
                const studentAns = answers[qNum] || 'None'; const isCorrect = studentAns === key; const isWrong = studentAns !== 'None' && studentAns !== key;
                totalPossibleMarks += qMark;
                if (key !== 'W') { if (isCorrect) totalObtainedMarks += qMark; else if (isWrong) totalObtainedMarks -= negVal; }
                return { qNum, selected: studentAns, correct: key, status: isCorrect, mark: qMark, type: key === 'W' ? 'written' : 'mcq', pending: key === 'W' };
            });
            const percent = totalPossibleMarks > 0 ? Math.round((totalObtainedMarks / totalPossibleMarks) * 100) : 0;
            await addDoc(collection(db, "logs"), { studentName: exam.studentName, examTitle: exam.name, timestamp: Date.now() });
            if (!exam.isGuest) { await addDoc(collection(db, "results"), { name: exam.studentName, exam: exam.name, percent, obtained: totalObtainedMarks, total: totalPossibleMarks, date: new Date().toLocaleDateString('en-GB'), timestamp: Date.now(), details: detailResults }); }
            setScoreData({ correct: totalObtainedMarks, total: totalPossibleMarks, percent });
            localStorage.removeItem(recoveryKey); localStorage.removeItem(timerKey); setIsSubmitted(true);
        } catch (e) { setIsSubmitted(true); }
    };

    const formatTime = (s) => `${Math.floor(s / 60)}:${s % 60 < 10 ? '0' + (s % 60) : s % 60}`;

    if (isSubmitted) return (
        <div className="fixed inset-0 bg-slate-950 z-[2000] flex flex-col items-center justify-center p-10 text-center text-white"><CheckCircle size={80} className="text-green-500 mb-6 animate-bounce" /><h2 className="text-3xl font-black uppercase italic mb-8">Completed</h2><div className="bg-slate-900 p-10 rounded-[3rem] border-4 border-slate-800 mb-10 w-full max-sm"><h3 className="text-5xl font-black text-blue-400 italic">{scoreData?.correct} / {scoreData?.total}</h3></div><button onClick={onFinish} className="bg-blue-700 text-white px-16 py-4 rounded-full font-black uppercase shadow-2xl">Close Arena</button></div>
    );

    return (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col overflow-hidden">
            <div className="bg-slate-900 p-3 flex justify-between items-center border-b-4 border-yellow-500 text-white">
                <div className="flex-1 truncate"><h2 className="font-black text-[10px] uppercase italic leading-none">{exam?.name}</h2><p className="text-[8px] text-blue-400 font-black uppercase mt-1 italic">{exam?.studentName} {exam.isGuest && '(GUEST)'}</p></div>
                <div className="flex items-center gap-6"><div className="px-5 py-1.5 rounded-xl font-black text-2xl border-4 text-white border-slate-800 bg-black">{formatTime(timeLeft)}</div><button onClick={() => { if (window.confirm("SUBMIT EXAM?")) submitExam(); }} className="bg-green-600 text-white px-6 py-2 rounded-full font-black text-[10px] uppercase shadow-lg">SUBMIT</button></div>
            </div>
            <div className="flex-1 bg-slate-950 overflow-hidden relative"><iframe src={exam?.fileUrl?.replace('/view?usp=sharing', '/preview').replace('/view', '/preview')} className="w-full h-full border-none opacity-90" title="Paper" />
            <div className="absolute bottom-0 left-0 right-0 bg-slate-900/98 border-t-2 border-white/10 backdrop-blur-xl p-3 md:p-4 shadow-2xl">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-2"><span className="text-[9px] font-black text-blue-400 uppercase italic flex items-center gap-2"><PenTool size={16} /> RESPONSE INTERFACE</span>{activeQuestion && <button onClick={() => setActiveQuestion(null)} className="text-white bg-slate-700 px-3 py-1 rounded-lg font-black text-[10px] uppercase">Close</button>}</div>
                    {activeQuestion ? (
                        <div className="flex flex-col items-center animate-in slide-in-from-bottom-2 pb-2">
                            <p className="text-slate-400 font-black text-xs mb-4 uppercase italic">{answerKeyArray[activeQuestion - 1] === 'W' ? `Upload Photo Q${activeQuestion}:` : `Select Choice Q${activeQuestion}:`}</p>
                            {answerKeyArray[activeQuestion - 1] === 'W' ? (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="flex gap-2 flex-wrap justify-center">{Array.isArray(answers[activeQuestion]) && answers[activeQuestion].map((_, i) => (<div key={i} className="relative"><div className="bg-green-600 text-white text-[8px] font-black px-2 py-1 rounded-lg">Page {i + 1} ✓</div><button onClick={() => removeImage(activeQuestion, i)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-0.5"><X size={12} /></button></div>))}</div>
                                    <label className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase cursor-pointer flex items-center gap-2 shadow-xl"><Camera size={16} /> CAPTURE PHOTO<input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { handleImageUpload(activeQuestion, e.target.files[0]); e.target.value = null; }} /></label>
                                </div>
                            ) : (
                                <div className="flex gap-5">{['A', 'B', 'C', 'D'].map(opt => (<button key={opt} onClick={() => handleOptionSelect(activeQuestion, opt)} className={`w-12 h-12 rounded-xl font-black text-xl flex items-center justify-center border-b-8 transition-all ${answers[activeQuestion] === opt ? 'bg-blue-600 text-white border-blue-900' : 'bg-slate-800 text-slate-400 border-black hover:bg-slate-700'}`}>{opt}</button>))}</div>
                            )}
                        </div>
                    ) : (
                        <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">{answerKeyArray.map((_, index) => { const num = index + 1; return (<button key={num} onClick={() => setActiveQuestion(num)} className={`min-w-[42px] h-[42px] rounded-xl font-black text-xs flex items-center justify-center border-b-4 ${answers[num] ? 'bg-green-600 text-white border-green-900' : 'bg-slate-800 text-slate-500 border-black'}`}>{num}</button>); })}</div>
                    )}
                </div>
            </div></div>
        </div>
    );
};

const GrowthSectionView = ({ results, students }) => {
    const [sel, setSel] = useState(null); const [selectedReview, setSelectedReview] = useState(null); const [vCode, setVCode] = useState(''); const [isVerified, setIsVerified] = useState(false);
    const handleVerify = () => { const student = students.find(s => s.name === sel); if (student && student.studentCode?.toString().trim() === vCode.trim()) { setIsVerified(true); } else { alert("ACCESS DENIED."); } };
    return (
        <div className="max-w-2xl mx-auto w-full animate-in fade-in duration-500 text-left px-2">
            {selectedReview && <ReviewResultModal result={selectedReview} onClose={() => setSelectedReview(null)} />}
            {!sel ? (
                <div className="grid gap-4">{students.map((std) => (<button key={std.id} onClick={() => { setSel(std.name); setIsVerified(false); setVCode(''); }} className="w-full bg-black/60 p-5 rounded-[2rem] border border-white/10 flex justify-between items-center group active:scale-95 transition-all"><div className="flex items-center gap-4"><div className="w-10 h-10 bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all"><User size={18} /></div><span className="font-black text-white uppercase text-[14px] italic break-words">{std.name}</span></div><ChevronRight size={24} className="text-slate-600 group-hover:text-blue-400" /></button>))}</div>
            ) : !isVerified ? (
                <div className="bg-slate-900/80 p-10 rounded-[3rem] border border-white/10 text-center animate-in zoom-in"><Lock size={48} className="text-blue-500 mx-auto mb-4" /><h3 className="font-black text-white uppercase italic mb-6">Verify: {sel}</h3><input type="password" value={vCode} onChange={(e) => setVCode(e.target.value)} placeholder="ENTER CODE" className="w-full p-4 bg-black border-2 border-slate-700 rounded-2xl text-center font-black text-white outline-none focus:border-blue-500 mb-6" /><div className="flex gap-4"><button onClick={() => setSel(null)} className="flex-1 py-4 bg-slate-800 rounded-2xl font-black uppercase text-[10px]">Back</button><button onClick={handleVerify} className="flex-1 py-4 bg-blue-700 rounded-2xl font-black uppercase text-[10px] shadow-lg">Verify</button></div></div>
            ) : (
                <div className="space-y-6 animate-in slide-in-from-right-20 print-full-report">
                    <button onClick={() => setSel(null)} className="flex items-center gap-2 text-[12px] font-black text-blue-400 uppercase italic hover:underline ml-2"><ChevronLeft size={24} /> Return</button>
                    <div className="bg-black/90 rounded-[3rem] shadow-2xl overflow-hidden border-2 border-white/10 flex flex-col print-full-report">
                        <div className="bg-blue-700 p-8 text-white text-center flex-shrink-0"><h2 className="text-2xl font-black uppercase italic tracking-tighter mb-2 leading-none text-white">Performance Transcript</h2><div className="inline-block bg-white/20 px-6 py-1.5 rounded-full border border-white/30"><p className="text-sm font-black uppercase italic text-white">{sel}</p></div></div>
                        <div className="p-4 md:p-6 space-y-4 bg-white/5 print:bg-white h-auto">
                            {results.filter(r => r.name === sel).reverse().map((r) => (
                                <div key={r.id} className="w-full bg-slate-900/60 rounded-[2rem] border border-white/10 flex items-center p-4 md:p-5 gap-3 hover:shadow-md transition-all group print-card">
                                    <div className="flex-1 min-w-0 border-l-4 md:border-l-8 border-blue-600 pl-3 md:pl-5"><p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Exam Unit</p><p className="text-xs md:text-lg font-black uppercase italic text-white leading-tight break-words">{r.exam}</p><p className="text-[8px] font-black text-blue-400 uppercase italic mt-1">{r.date} • {r.obtained}/{r.total}</p></div>
                                    <button onClick={() => setSelectedReview(r)} className="bg-slate-800 text-blue-400 p-2 md:p-3 rounded-2xl border border-white/10 print:hidden"><Eye size={18} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
