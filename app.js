import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  Plus, 
  Trash2, 
  Wallet, 
  TrendingUp, 
  Plane, 
  Award, 
  User, 
  X, 
  Settings,
  Calendar,
  Clock,
  ArrowDownCircle,
  Edit3,
  Check,
  ChevronLeft,
  History,
  CreditCard,
  Hash,
  AlertTriangle,
  CheckCircle2,
  CalendarDays,
  LogOut,
  ShieldCheck,
  Cloud,
  CloudOff
} from 'lucide-react';

// --- Firebase Configuration (已整合您的設定) ---
const userFirebaseConfig = {
  apiKey: "AIzaSyBScPpOz_ovEEIffl7S382MJKdq37L3pQA",
  authDomain: "chang-miles.firebaseapp.com",
  projectId: "chang-miles",
  storageBucket: "chang-miles.firebasestorage.app",
  messagingSenderId: "285232593870",
  appId: "1:285232593870:web:6bce1932eb953b22fe499f"
};

// 智慧切換：預覽環境使用系統變數，正式部署使用您的設定
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : userFirebaseConfig;
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
// 預覽環境使用預設ID，部署後使用您的專案ID
const appId = typeof __app_id !== 'undefined' ? __app_id : 'chang-miles-v1'; 

// --- Assets ---
const SvgLogos = {
  ci: <svg viewBox="0 0 100 100" className="w-full h-full fill-current"><path d="M50 20 C60 20 70 30 70 45 C70 60 60 70 50 85 C40 70 30 60 30 45 C30 30 40 20 50 20 Z" fillOpacity="0.9"/><path d="M50 25 C55 25 60 30 60 40 C60 50 55 55 50 65 C45 55 40 50 40 40 C40 30 45 25 50 25 Z" fill="white"/></svg>,
  br: <svg viewBox="0 0 100 100" className="w-full h-full fill-current"><path d="M10 50 Q50 10 90 50 Q50 90 10 50 Z" fillOpacity="0.3"/><path d="M20 60 L80 30 L80 45 L20 75 Z" /></svg>,
  jx: <svg viewBox="0 0 100 100" className="w-full h-full fill-current"><path d="M50 10 L60 40 L90 50 L60 60 L50 90 L40 60 L10 50 L40 40 Z" /></svg>,
  nh: <svg viewBox="0 0 100 100" className="w-full h-full fill-current"><text x="50" y="60" textAnchor="middle" fontSize="30" fontWeight="bold" style={{fontFamily: 'sans-serif'}}>ANA</text></svg>,
  jl: <svg viewBox="0 0 100 100" className="w-full h-full fill-current"><circle cx="50" cy="50" r="35" fill="currentColor" /><path d="M30 50 L70 50 M50 30 L50 70" stroke="white" strokeWidth="8" strokeLinecap="round" opacity="0.9" /></svg>,
  cx: <svg viewBox="0 0 100 100" className="w-full h-full fill-current"><path d="M20 60 L80 40 L70 30 L30 50 Z" /><path d="M25 65 L75 45" stroke="currentColor" strokeWidth="3" /></svg>
};

const AllianceSvgs = {
  star: <svg viewBox="0 0 100 20" className="w-full h-full fill-white/90"><path d="M10 10 L15 0 L20 10 L15 20 Z" /><path d="M30 10 L35 0 L40 10 L35 20 Z" /><path d="M50 10 L55 0 L60 10 L55 20 Z" /><path d="M70 10 L75 0 L80 10 L75 20 Z" /><path d="M90 10 L95 0 L100 10 L95 20 Z" /><text x="55" y="18" fontSize="6" textAnchor="middle" fontWeight="bold" className="fill-white">STAR ALLIANCE</text></svg>,
  skyteam: <svg viewBox="0 0 100 20" className="w-full h-full fill-white/90"><path d="M20 10 Q40 0 60 10 T100 10" stroke="white" strokeWidth="2" fill="none"/><text x="80" y="15" fontSize="8" textAnchor="end" fontWeight="bold" className="fill-white">SKYTEAM</text></svg>,
  oneworld: <svg viewBox="0 0 100 20" className="w-full h-full fill-white/90"><circle cx="20" cy="10" r="8" stroke="white" strokeWidth="2" fill="none" /><text x="35" y="14" fontSize="9" fontWeight="bold" className="fill-white">oneworld</text></svg>
};

// 航空公司 Logo 組件 (含白色圓底)
const AirlineLogo = ({ id, colorClass }) => (
  <div className="w-10 h-10 bg-white rounded-full p-1.5 shadow-sm flex items-center justify-center overflow-hidden">
    <div className={`w-full h-full ${colorClass}`}>
      {/* 部署時請改用: <img src={`files/${id}.svg`} alt={id} /> */}
      {SvgLogos[id]}
    </div>
  </div>
);

// 聯盟 Logo 組件
const AllianceLogo = ({ id }) => (
  <div className="w-20 h-5 opacity-80 mb-1">
    {/* 部署時請改用: <img src={`files/${id}.svg`} alt={id} /> */}
    {AllianceSvgs[id]}
  </div>
);

const INITIAL_AIRLINES = [
  { id: 'ci', name: '中華航空', enName: 'China Airlines', alliance: 'skyteam', program: '華夏會員', tier: '金卡', memberId: '', tierOptions: ['華夏會員', '金卡', '翡翠卡', '晶鑽卡'], cardClass: 'bg-gradient-to-br from-[#4a1050] to-[#862562] text-white', logoColor: 'text-purple-900', expiryRule: { type: 'activity', value: 36, unit: 'month' }, records: [], pending: [] },
  { id: 'br', name: '長榮航空', enName: 'EVA Air', alliance: 'star', program: '無限萬哩遊', tier: '銀卡', memberId: '', tierOptions: ['綠卡', '銀卡', '金卡', '鑽石卡'], cardClass: 'bg-gradient-to-br from-[#005230] to-[#00824b] text-white', logoColor: 'text-green-800', expiryRule: { type: 'fixed', value: 36, unit: 'month' }, records: [], pending: [] },
  { id: 'jx', name: '星宇航空', enName: 'STARLUX Airlines', alliance: null, program: 'COSMILE', tier: 'Adventurer', memberId: '', tierOptions: ['Traveler', 'Adventurer', 'Explorer', 'Insighter'], cardClass: 'bg-gradient-to-br from-[#59493f] to-[#8c735d] text-white', logoColor: 'text-yellow-700', expiryRule: { type: 'fixed', value: 36, unit: 'month' }, records: [], pending: [] },
  { id: 'nh', name: 'ANA全日空', enName: 'All Nippon Airways', alliance: 'star', program: 'Mileage Club', tier: 'Platinum', memberId: '', tierOptions: ['一般會員', 'Bronze', 'Platinum', 'Diamond'], cardClass: 'bg-gradient-to-br from-[#003d7c] to-[#007cc2] text-white', logoColor: 'text-blue-800', expiryRule: { type: 'fixed', value: 36, unit: 'month' }, records: [], pending: [] },
  { id: 'jl', name: '日本航空', enName: 'Japan Airlines', alliance: 'oneworld', program: 'JAL Mileage Bank', tier: 'Crystal', memberId: '', tierOptions: ['普通會員', 'Crystal', 'Sapphire', 'Diamond', 'JGC Premier'], cardClass: 'bg-gradient-to-br from-[#8a0000] to-[#d60000] text-white', logoColor: 'text-red-800', expiryRule: { type: 'fixed', value: 36, unit: 'month' }, records: [], pending: [] },
  { id: 'cx', name: '國泰航空', enName: 'Cathay Pacific', alliance: 'oneworld', program: '亞洲萬里通', tier: 'Green', memberId: '', tierOptions: ['Green', 'Silver', 'Gold', 'Diamond'], cardClass: 'bg-gradient-to-br from-[#004e4e] to-[#007a7a] text-white', logoColor: 'text-teal-800', expiryRule: { type: 'activity', value: 18, unit: 'month' }, records: [], pending: [] },
];

const formatDateForInput = (date) => date ? new Date(date).toISOString().split('T')[0] : '';
const formatDateForDisplay = (dateStr) => dateStr ? dateStr.replace(/-/g, '/') : '-';
const formatNumber = (num) => new Intl.NumberFormat('zh-TW').format(num);
const formatAmountDisplay = (amount) => {
  const num = parseInt(amount);
  if (isNaN(num)) return '0';
  const formatted = formatNumber(Math.abs(num));
  return num > 0 ? `+${formatted}` : `-${formatted}`;
};

const calculateExpiryDisplay = (recordDateStr, rule, allRecords, amount) => {
  if (parseInt(amount) <= 0) return { text: null, color: '' };
  if (rule.type === 'none') return { text: '終身有效', color: 'text-green-600 bg-green-50' };
  const recordDate = new Date(recordDateStr);
  if (isNaN(recordDate.getTime())) return { text: '-', color: 'text-gray-400 bg-gray-50' };
  let expiryDate;
  if (rule.type === 'fixed') {
    expiryDate = new Date(recordDate);
    if (rule.unit === 'year') expiryDate.setFullYear(expiryDate.getFullYear() + parseInt(rule.value));
    else expiryDate.setMonth(expiryDate.getMonth() + parseInt(rule.value));
  } else if (rule.type === 'activity') {
    const dates = allRecords.map(r => new Date(r.date).getTime()).filter(t => !isNaN(t));
    const latestDate = dates.length > 0 ? new Date(Math.max(...dates)) : recordDate;
    expiryDate = new Date(latestDate);
    if (rule.unit === 'year') expiryDate.setFullYear(expiryDate.getFullYear() + parseInt(rule.value));
    else expiryDate.setMonth(expiryDate.getMonth() + parseInt(rule.value));
  }
  const today = new Date();
  const diffTime = expiryDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const dateString = formatDateForDisplay(expiryDate.toISOString().split('T')[0]);
  if (diffDays < 0) return { text: `${dateString} (已過期)`, color: 'text-red-600 bg-red-50 font-bold' };
  if (diffDays < 90) return { text: `${dateString} (剩 ${diffDays} 天)`, color: 'text-red-500 bg-red-50' };
  if (diffDays < 180) return { text: `${dateString}`, color: 'text-orange-600 bg-orange-50' };
  return { text: dateString, color: 'text-gray-500 bg-gray-50' };
};

const SplashScreen = ({ onFinish }) => {
  const [width, setWidth] = useState(0);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    let start = null;
    const duration = 2500; 
    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const percent = Math.min((progress / duration) * 100, 100);
      setWidth(percent);
      if (progress < duration) requestAnimationFrame(animate);
      else setTimeout(() => { setOpacity(0); setTimeout(onFinish, 800); }, 200);
    };
    requestAnimationFrame(animate);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center transition-opacity duration-800 ease-out" style={{ opacity, pointerEvents: opacity === 0 ? 'none' : 'auto' }}>
      <div className="flex flex-col items-center animate-in fade-in zoom-in duration-1000">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-white blur-3xl opacity-20 animate-pulse"></div>
          <div className="p-6 border border-white/10 rounded-full bg-white/5 backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.15)]">
            <Plane className="w-16 h-16 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-white tracking-[0.2em] mb-4 font-serif text-shadow">哩程管家</h1>
        <p className="text-xs text-gray-500 font-light tracking-[0.5em] uppercase border-t border-white/10 pt-4 mt-2">寰宇萬哩 · 尊榮隨行</p>
      </div>
      <div className="absolute bottom-24 w-64 h-1 bg-gray-900 rounded-full overflow-hidden">
        <div className="h-full bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.9)]" style={{ width: `${width}%` }}></div>
      </div>
    </div>
  );
};

const Toast = ({ message, type, isVisible }) => (
  <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[120] flex items-center gap-2 px-4 py-3 rounded-full shadow-2xl transition-all duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275) ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0 pointer-events-none'} ${type === 'success' ? 'bg-slate-900 text-white' : 'bg-red-500 text-white'}`}>
    {type === 'success' ? <CheckCircle2 size={18} className="text-green-400" /> : <AlertTriangle size={18} className="text-white" />}
    <span className="text-sm font-bold tracking-wide">{message}</span>
  </div>
);

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel }) => {
  const [show, setShow] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);
  useEffect(() => { if (isOpen) { setShow(true); setIsClosing(false); } else { setIsClosing(true); setTimeout(() => setShow(false), 300); } }, [isOpen]);
  if (!show) return null;
  return (
    <div className={`fixed inset-0 z-[110] flex items-center justify-center px-4 transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel}></div>
      <div className={`bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl relative z-10 transition-all duration-300 transform ${isClosing ? 'scale-95 translate-y-4' : 'scale-100 translate-y-0'}`}>
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4 text-red-500"><AlertTriangle size={24} /></div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
          <p className="text-sm text-slate-500 leading-relaxed">{message}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={onCancel} className="py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors">取消</button>
          <button onClick={onConfirm} className="py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 transition-colors">確認刪除</button>
        </div>
      </div>
    </div>
  );
};

const AirlineCard = ({ airline, onClick, isDetail = false }) => {
  const currentBalance = airline.records.reduce((acc, r) => acc + (parseInt(r.amount)||0), 0);
  const pendingSum = airline.pending.reduce((acc, i) => acc + (parseInt(i.amount)||0), 0);

  return (
    <div onClick={onClick} className={`${airline.cardClass} relative h-[220px] rounded-2xl p-6 overflow-hidden flex flex-col justify-between ${!isDetail ? 'cursor-pointer shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-gray-300/40 hover:-translate-y-1 transition-all duration-500 ease-out group' : 'shadow-none transition-all duration-500'}`}>
      <div className={`absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-white opacity-[0.1] rounded-full blur-xl transition-opacity duration-700 ${!isDetail ? 'group-hover:opacity-[0.15]' : ''}`}></div>
      <div className="relative z-10 flex justify-between items-start">
        <AirlineLogo id={airline.id} colorClass={airline.logoColor} />
        <div className="text-right">
          <div className="text-lg font-bold tracking-wide leading-tight text-white drop-shadow-sm">{airline.name}</div>
          <div className="text-[10px] font-mono opacity-60 uppercase tracking-widest mt-1">{airline.code || airline.id.toUpperCase()}</div>
        </div>
      </div>
      <div className="relative z-10 mt-auto mb-4">
        <div className="text-[10px] uppercase opacity-70 tracking-widest mb-0.5">目前里程</div>
        <div className="flex items-end justify-between">
          <span className="text-3xl font-black tracking-tight drop-shadow-md font-sans">{formatNumber(currentBalance)}</span>
          <AllianceLogo id={airline.alliance} />
        </div>
        {pendingSum !== 0 && (
          <div className={`absolute left-0 -bottom-6 transition-all duration-300 z-20 ${!isDetail ? 'opacity-0 group-hover:opacity-100 group-hover:-bottom-5' : 'opacity-100 -bottom-5'}`}>
             <span className="text-xs font-bold text-orange-300 flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/10"><TrendingUp className="w-3 h-3" /> {formatAmountDisplay(pendingSum)} 待入帳</span>
          </div>
        )}
      </div>
      <div className="relative z-10 pt-3 border-t border-white/10 flex justify-between items-end">
        <div className="flex flex-col gap-1">
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-md text-xs font-bold tracking-wide shadow-sm w-fit"><Award className="w-3 h-3 opacity-80" /> {airline.tier}</div>
        </div>
        <div className="text-right max-w-[60%]">
          <div className="text-[10px] font-mono font-bold tracking-wider opacity-90 mb-0.5">{airline.memberId || 'NO MEMBER ID'}</div>
          <div className="text-[9px] opacity-60 truncate">{airline.enName} · {airline.program}</div>
        </div>
      </div>
    </div>
  );
};

const LoginScreen = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google Login Error:", error);
      alert("登入失敗，請確認 Firebase 設定或網域權限。");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#f8f9fa] flex items-center justify-center p-6 animate-in fade-in zoom-in duration-500">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 text-center border border-gray-100">
        <div className="flex justify-center mb-6">
          <div className="p-5 bg-slate-900 rounded-full shadow-lg shadow-slate-200"><Plane className="w-10 h-10 text-white" /></div>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2 font-serif tracking-wide">哩程管家</h1>
        <p className="text-sm text-slate-400 mb-8 tracking-widest uppercase">Premium Mileage Tracker</p>
        <button onClick={handleGoogleLogin} disabled={loading} className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 hover:bg-gray-50 text-slate-700 font-bold py-3.5 rounded-xl transition-all shadow-sm active:scale-95">
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          使用 Google 帳號登入
        </button>
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400"><ShieldCheck size={14} /><span>資料安全加密儲存</span></div>
      </div>
    </div>
  );
};

const MainApp = ({ user, onLogout }) => {
  const [airlines, setAirlines] = useState(INITIAL_AIRLINES);
  const [selectedAirlineId, setSelectedAirlineId] = useState(null);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editorState, setEditorState] = useState({ isOpen: false, type: null, data: null }); 
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, item: null, date: '' });
  const [toast, setToast] = useState({ message: '', type: '', isVisible: false });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const [isDetailClosing, setIsDetailClosing] = useState(false);
  const [isSettingsClosing, setIsSettingsClosing] = useState(false);
  const [isEditorClosing, setIsEditorClosing] = useState(false);
  const [isConfirmModalClosing, setIsConfirmModalClosing] = useState(false);

  useEffect(() => {
    if (!user || !db) return;
    const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'mileage_data', 'profile');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setAirlines(docSnap.data().data);
      } else {
        setDoc(docRef, { data: INITIAL_AIRLINES });
      }
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user || !db) {
      localStorage.setItem('mileage_data_v23_guest', JSON.stringify(airlines));
      return;
    }
    const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'mileage_data', 'profile');
    setDoc(docRef, { data: airlines }, { merge: true });
  }, [airlines, user]);

  const activeAirlineData = useMemo(() => airlines.find(a => a.id === selectedAirlineId), [airlines, selectedAirlineId]);

  const showToast = (msg, type = 'success') => { setToast({ message: msg, type, isVisible: true }); setTimeout(() => setToast(prev => ({ ...prev, isVisible: false })), 3000); };
  const closeConfirm = () => setConfirmDialog({ ...confirmDialog, isOpen: false });
  const updateAirline = (id, field, value) => setAirlines(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  const updateExpiryRule = (id, newRule) => setAirlines(prev => prev.map(a => a.id === id ? { ...a, expiryRule: { ...a.expiryRule, ...newRule } } : a));
  
  const closeDetail = () => { setIsDetailClosing(true); setTimeout(() => { setSelectedAirlineId(null); setIsDetailClosing(false); }, 500); };
  const closeSettings = () => { setIsSettingsClosing(true); setTimeout(() => { setIsSettingsOpen(false); setIsSettingsClosing(false); }, 300); };
  const closeEditor = () => { setIsEditorClosing(true); setTimeout(() => { setEditorState(prev => ({ ...prev, isOpen: false })); setIsEditorClosing(false); }, 300); };
  const closeConfirmModal = () => { setIsConfirmModalClosing(true); setTimeout(() => { setConfirmModal({ ...confirmModal, isOpen: false }); setIsConfirmModalClosing(false); }, 300); };

  const openEditor = (type, item = null) => { setIsEditorClosing(false); setEditorState({ isOpen: true, type, data: item || { id: Date.now(), name: '', amount: '', date: formatDateForInput(new Date()) } }); };
  const saveEditor = (formData) => {
    setAirlines(prev => prev.map(a => {
      if (a.id !== selectedAirlineId) return a;
      const listKey = editorState.type === 'record' ? 'records' : 'pending';
      const list = a[listKey];
      const isNew = !list.find(i => i.id === formData.id);
      let newList = isNew ? [formData, ...list] : list.map(i => i.id === formData.id ? formData : i);
      return { ...a, [listKey]: newList };
    }));
    closeEditor();
    showToast('儲存成功');
  };
  const requestDelete = (id, type) => { setConfirmDialog({ isOpen: true, title: '確認刪除', message: '您確定要永久刪除這筆項目嗎？此動作無法復原。', onConfirm: () => executeDelete(id, type) }); };
  const executeDelete = (id, type) => {
    setAirlines(prev => prev.map(a => {
      if (a.id !== selectedAirlineId) return a;
      const listKey = type === 'record' ? 'records' : 'pending';
      return { ...a, [listKey]: a[listKey].filter(item => item.id !== id) };
    }));
    closeConfirm();
    showToast('項目已刪除', 'error');
  };
  const openConfirmModal = (item) => { setIsConfirmModalClosing(false); setConfirmModal({ isOpen: true, item: item, date: formatDateForInput(new Date()) }); };
  const executeConfirm = () => {
    if (!confirmModal.item) return;
    const confirmedItem = { id: Date.now(), name: confirmModal.item.name, amount: confirmModal.item.amount, date: confirmModal.date };
    setAirlines(prev => prev.map(a => {
      if (a.id !== selectedAirlineId) return a;
      return { ...a, pending: a.pending.filter(p => p.id !== confirmModal.item.id), records: [confirmedItem, ...a.records] };
    }));
    closeConfirmModal();
    showToast('哩程已正式入帳');
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-800 font-sans animate-in fade-in duration-700 relative">
      <div className="absolute top-4 right-4 z-10 opacity-30"><Cloud size={16} className="text-green-600" /></div>

      {!selectedAirlineId && (
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 pt-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div>
            <div className="flex items-center justify-between mb-6 px-1 mt-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><CreditCard className="w-6 h-6 text-slate-400" /> 會籍卡片</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
              {airlines.map((airline) => (<AirlineCard key={airline.id} airline={airline} onClick={() => setSelectedAirlineId(airline.id)} />))}
            </div>
          </div>
        </div>
      )}

      {selectedAirlineId && activeAirlineData && (
        <div className={`fixed inset-0 z-50 bg-[#f8f9fa] flex flex-col transition-all duration-500 ${isDetailClosing ? 'opacity-0 translate-y-10' : 'opacity-100 translate-y-0 animate-in slide-in-from-bottom-10'}`}>
          <div className="absolute top-0 left-0 w-full z-20 px-5 py-6 flex justify-between items-center pointer-events-none">
             <button onClick={closeDetail} className="pointer-events-auto w-10 h-10 bg-white/80 backdrop-blur-md rounded-full shadow-lg text-slate-600 flex items-center justify-center hover:bg-white transition-all duration-300 hover:scale-110 active:scale-95"><ChevronLeft size={20} /></button>
             <button onClick={() => { setIsSettingsClosing(false); setIsSettingsOpen(true); }} className="pointer-events-auto w-10 h-10 bg-white/80 backdrop-blur-md rounded-full shadow-lg text-slate-600 flex items-center justify-center hover:bg-white transition-all duration-300 hover:scale-110 active:scale-95"><Settings size={20} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-3xl mx-auto w-full pt-24 relative">
            <div className="rounded-2xl shadow-xl mt-2 animate-in zoom-in-95 duration-500">
               <AirlineCard airline={activeAirlineData} onClick={() => {}} isDetail={true} />
            </div>
            <div className="animate-in slide-in-from-bottom-8 fade-in duration-700 delay-100">
               <div className="flex items-center justify-between mb-3 px-2">
                 <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><TrendingUp size={16} className="text-orange-500" /> 待入帳</h3>
                 <button onClick={() => { setIsEditorClosing(false); setEditorState({ isOpen: true, type: 'pending', data: { id: Date.now(), name: '', amount: '' } }); }} className="text-xs font-bold bg-white text-orange-600 px-3 py-1.5 rounded-full shadow-sm border border-orange-100 hover:bg-orange-50 transition-colors flex items-center gap-1 active:scale-95"><Plus size={14} /> 新增項目</button>
               </div>
               <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50 transition-all duration-500">
                 {activeAirlineData.pending.length === 0 && <div className="p-8 text-center text-gray-300 text-sm">暫無待入帳項目</div>}
                 {activeAirlineData.pending.map(item => (
                   <div key={item.id} className="p-4 flex items-center justify-between hover:bg-orange-50/30 transition-colors duration-300 group">
                     <div>
                       <div className="text-base font-bold text-slate-800">{item.name}</div>
                       <div className={`text-sm font-bold mt-0.5 ${item.amount < 0 ? 'text-slate-600' : 'text-orange-500'}`}>{formatAmountDisplay(item.amount)} <span className="text-[10px] text-gray-400 font-normal">Miles</span></div>
                     </div>
                     <div className="flex items-center gap-2">
                       <button onClick={() => { setIsEditorClosing(false); setEditorState({ isOpen: true, type: 'pending', data: item }); }} className="p-2 text-gray-300 hover:text-blue-500 transition-colors rounded-full hover:bg-blue-50 active:scale-90"><Edit3 size={18} /></button>
                       <button onClick={() => setConfirmDialog({ isOpen: true, title: '確認刪除', message: '確定刪除？', onConfirm: () => executeDelete(item.id, 'pending') })} className="p-2 text-gray-300 hover:text-red-500 transition-colors rounded-full hover:bg-red-50 active:scale-90"><Trash2 size={18} /></button>
                       <div className="w-px h-6 bg-gray-200 mx-1"></div>
                       <button onClick={() => { setIsConfirmModalClosing(false); setConfirmModal({ isOpen: true, item: item, date: formatDateForInput(new Date()) }); }} className="flex items-center gap-1.5 bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-slate-700 active:scale-95 transition-all shadow-md"><ArrowDownCircle size={14} /> 入帳</button>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
            <div className="pb-10 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200">
               <div className="flex items-center justify-between mb-3 px-2">
                 <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><History size={16} className="text-blue-500" /> 明細紀錄</h3>
                 <button onClick={() => { setIsEditorClosing(false); setEditorState({ isOpen: true, type: 'record', data: { id: Date.now(), name: '', amount: '', date: formatDateForInput(new Date()) } }); }} className="text-xs font-bold bg-white text-blue-600 px-3 py-1.5 rounded-full shadow-sm border border-blue-100 hover:bg-blue-50 transition-colors flex items-center gap-1 active:scale-95"><Plus size={14} /> 新增紀錄</button>
               </div>
               <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50 transition-all duration-500">
                 {activeAirlineData.records.length === 0 && <div className="p-8 text-center text-gray-300 text-sm">暫無里程紀錄</div>}
                 {activeAirlineData.records.map(item => {
                   const expiryInfo = calculateExpiryDisplay(item.date, activeAirlineData.expiryRule, activeAirlineData.records, item.amount);
                   const isNegative = item.amount < 0;
                   return (
                     <div key={item.id} className="p-4 transition-colors duration-300 hover:bg-blue-50/30 group">
                       <div className="flex justify-between items-start mb-1.5">
                          <div className="text-base font-bold text-slate-800">{item.name}</div>
                          <div className={`text-lg font-mono font-bold ${isNegative ? 'text-slate-600' : 'text-blue-600'}`}>{formatAmountDisplay(item.amount)}</div>
                       </div>
                       <div className="flex justify-between items-end">
                          <div className="flex flex-wrap items-center gap-2">
                             <span className="flex items-center gap-1 bg-gray-50 text-gray-500 px-2 py-0.5 rounded-md text-[10px] border border-gray-100"><Calendar size={10} className="opacity-70" /> 入帳 {formatDateForDisplay(item.date)}</span>
                             {expiryInfo.text && <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] border border-transparent ${expiryInfo.color}`}><Clock size={10} className="opacity-70" /> 到期 {expiryInfo.text}</span>}
                          </div>
                          <div className="flex items-center gap-1 opacity-30 group-hover:opacity-100 transition-opacity duration-200">
                             <button onClick={() => { setIsEditorClosing(false); setEditorState({ isOpen: true, type: 'record', data: item }); }} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full active:scale-90 transition-transform"><Edit3 size={16} /></button>
                             <button onClick={() => setConfirmDialog({ isOpen: true, title: '確認刪除', message: '確定刪除？', onConfirm: () => executeDelete(item.id, 'record') })} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full active:scale-90 transition-transform"><Trash2 size={16} /></button>
                          </div>
                       </div>
                     </div>
                   );
                 })}
               </div>
            </div>
          </div>
        </div>
      )}

      {isSettingsOpen && activeAirlineData && (
        <div className={`fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isSettingsClosing ? 'opacity-0' : 'animate-in fade-in opacity-100'}`}>
          <div className={`bg-white w-full max-w-xs m-4 rounded-3xl p-6 shadow-2xl transition-all duration-300 transform ${isSettingsClosing ? 'scale-95 translate-y-4' : 'scale-100 animate-in zoom-in-95'}`}>
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h3 className="text-slate-800 font-bold text-lg flex items-center gap-2"><Settings size={20} className="text-slate-400" /> 設定</h3>
              <button onClick={closeSettings} className="bg-gray-100 rounded-full p-2 text-gray-500 hover:bg-gray-200 transition-colors"><X size={18} /></button>
            </div>
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
               <div className="space-y-2"><label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><Hash size={12} /> 會員卡號</label><input type="text" value={activeAirlineData.memberId || ''} onChange={(e) => updateAirline(activeAirlineData.id, 'memberId', e.target.value)} className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 font-mono text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none uppercase transition-shadow" placeholder="請輸入會員卡號" /></div>
               <div className="space-y-2"><label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><User size={12} /> 會員等級</label><div className="grid grid-cols-2 gap-2">{activeAirlineData.tierOptions.map(opt => (<button key={opt} onClick={() => updateAirline(activeAirlineData.id, 'tier', opt)} className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all duration-300 ${activeAirlineData.tier === opt ? 'bg-slate-800 text-white border-slate-800 shadow-md transform scale-105' : 'bg-white text-slate-500 border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}>{opt}</button>))}</div></div>
               <div className="space-y-3 pt-4 border-t border-gray-100"><label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><Clock size={12} /> 里程效期規則</label><button onClick={() => updateExpiryRule(activeAirlineData.id, { type: 'none' })} className={`w-full flex items-center p-3 rounded-xl border text-left transition-all duration-300 ${activeAirlineData.expiryRule.type === 'none' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-gray-300'}`}><div className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center ${activeAirlineData.expiryRule.type === 'none' ? 'border-blue-500' : 'border-gray-300'}`}>{activeAirlineData.expiryRule.type === 'none' && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}</div><div><div className="text-sm font-bold text-slate-800">完全無效期</div><div className="text-[10px] text-gray-500">哩程終身有效，不會過期</div></div></button><div className={`rounded-xl border p-3 transition-all duration-300 ${activeAirlineData.expiryRule.type === 'fixed' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200'}`}><button onClick={() => updateExpiryRule(activeAirlineData.id, { type: 'fixed' })} className="flex items-center w-full mb-2 text-left"><div className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center ${activeAirlineData.expiryRule.type === 'fixed' ? 'border-blue-500' : 'border-gray-300'}`}>{activeAirlineData.expiryRule.type === 'fixed' && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}</div><div className="text-sm font-bold text-slate-800">個別效期</div></button>{activeAirlineData.expiryRule.type === 'fixed' && (<div className="ml-7 flex items-center gap-2 animate-in fade-in duration-300"><span className="text-xs text-gray-600">入帳後</span><input type="number" value={activeAirlineData.expiryRule.value || 36} onChange={(e) => updateExpiryRule(activeAirlineData.id, { value: e.target.value })} className="w-12 text-center text-sm border border-blue-200 rounded py-1 focus:ring-2 focus:ring-blue-300 outline-none transition-shadow" /><select value={activeAirlineData.expiryRule.unit || 'month'} onChange={(e) => updateExpiryRule(activeAirlineData.id, { unit: e.target.value })} className="text-sm border border-blue-200 rounded py-1 px-1 bg-white outline-none"><option value="month">個月</option><option value="year">年</option></select><span className="text-xs text-gray-600">到期</span></div>)}</div><div className={`rounded-xl border p-3 transition-all duration-300 ${activeAirlineData.expiryRule.type === 'activity' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200'}`}><button onClick={() => updateExpiryRule(activeAirlineData.id, { type: 'activity' })} className="flex items-center w-full mb-2 text-left"><div className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center ${activeAirlineData.expiryRule.type === 'activity' ? 'border-blue-500' : 'border-gray-300'}`}>{activeAirlineData.expiryRule.type === 'activity' && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}</div><div><div className="text-sm font-bold text-slate-800">滾動效期</div><div className="text-[10px] text-gray-500">以最後一筆活動日往後推算</div></div></button>{activeAirlineData.expiryRule.type === 'activity' && (<div className="ml-7 flex items-center gap-2 animate-in fade-in duration-300"><span className="text-xs text-gray-600">最後活動後</span><input type="number" value={activeAirlineData.expiryRule.value || 18} onChange={(e) => updateExpiryRule(activeAirlineData.id, { value: e.target.value })} className="w-12 text-center text-sm border border-blue-200 rounded py-1 focus:ring-2 focus:ring-blue-300 outline-none transition-shadow" /><select value={activeAirlineData.expiryRule.unit || 'month'} onChange={(e) => updateExpiryRule(activeAirlineData.id, { unit: e.target.value })} className="text-sm border border-blue-200 rounded py-1 px-1 bg-white outline-none"><option value="month">個月</option><option value="year">年</option></select><span className="text-xs text-gray-600">到期</span></div>)}</div></div>
            </div>
            <div className="pt-4 mt-4 border-t border-gray-100"><button onClick={onLogout} className="w-full flex items-center justify-center gap-2 text-red-500 font-bold text-sm py-2 hover:bg-red-50 rounded-xl transition-colors"><LogOut size={16} /> 登出帳號</button></div>
            <button onClick={() => { showToast('設定已更新'); closeSettings(); }} className="w-full mt-2 bg-slate-900 text-white font-bold py-3.5 rounded-2xl shadow-lg hover:bg-slate-800 transition-colors active:scale-95">完成設定</button>
          </div>
        </div>
      )}

      {editorState.isOpen && (
        <div className={`fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isEditorClosing ? 'opacity-0' : 'animate-in fade-in opacity-100'}`}>
          <div className={`bg-white w-full max-w-xs m-4 rounded-3xl p-6 shadow-2xl transition-all duration-300 transform ${isEditorClosing ? 'scale-95 translate-y-4' : 'scale-100 animate-in zoom-in-95'}`}>
            <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-gray-100 pb-3">{editorState.type === 'record' ? '編輯哩程紀錄' : '編輯待入帳項目'}</h3>
            <div className="space-y-4">
              <div><label className="text-xs font-bold text-slate-400 mb-1 block">項目名稱</label><input value={editorState.data.name} onChange={e => setEditorState({...editorState, data: {...editorState.data, name: e.target.value}})} className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" placeholder="例如: 台北-東京 來回" autoFocus /></div>
              <div><label className="text-xs font-bold text-slate-400 mb-1 block">里程數額</label><input type="number" value={editorState.data.amount} onChange={e => setEditorState({...editorState, data: {...editorState.data, amount: e.target.value}})} className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 font-mono font-bold text-lg text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" placeholder="0" /></div>
              {editorState.type === 'record' && (<div><label className="text-xs font-bold text-slate-400 mb-1 block">入帳日期</label><input type="date" value={editorState.data.date} onChange={e => setEditorState({...editorState, data: {...editorState.data, date: e.target.value}})} className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow appearance-none" style={{ minHeight: '48px' }} /></div>)}
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={closeEditor} className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">取消</button>
              <button onClick={() => saveEditor(editorState.data)} className="flex-1 py-3 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all active:scale-95">儲存</button>
            </div>
          </div>
        </div>
      )}

      {confirmModal.isOpen && (
        <div className={`fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isConfirmModalClosing ? 'opacity-0' : 'animate-in fade-in opacity-100'}`}>
          <div className={`bg-white w-full max-w-xs m-4 rounded-3xl p-6 shadow-2xl transition-all duration-300 transform ${isConfirmModalClosing ? 'scale-95 translate-y-4' : 'scale-100 animate-in zoom-in-95'}`}>
            <h3 className="text-lg font-bold text-slate-900 mb-2 border-b border-gray-100 pb-3 flex items-center gap-2"><CheckCircle2 size={20} className="text-green-500" /> 確認入帳</h3>
            <div className="space-y-4 py-2">
              <div><p className="text-sm font-bold text-slate-800">{confirmModal.item?.name}</p><p className="text-xs text-orange-500 font-bold mt-1">{formatAmountDisplay(confirmModal.item?.amount)} Miles</p></div>
              <div>
                <label className="text-xs font-bold text-slate-400 mb-1 block flex items-center gap-1"><CalendarDays size={12} /> 選擇入帳日期</label>
                <input type="date" value={confirmModal.date} onChange={e => setConfirmModal({ ...confirmModal, date: e.target.value })} className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-slate-800 focus:ring-2 focus:ring-green-500 outline-none transition-shadow appearance-none" style={{ minHeight: '48px' }} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={closeConfirmModal} className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">取消</button>
              <button onClick={executeConfirm} className="flex-1 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200 transition-all active:scale-95">確認</button>
            </div>
          </div>
        </div>
      )}

      <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} />
      <ConfirmDialog isOpen={confirmDialog.isOpen} title={confirmDialog.title} message={confirmDialog.message} onConfirm={confirmDialog.onConfirm} onCancel={closeConfirm} />

    </div>
  );
};

const App = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (auth) {
      return onAuthStateChanged(auth, (u) => {
        setUser(u);
      });
    }
  }, []);

  const handleLogout = async () => {
    if (auth) await signOut(auth);
    setUser(null);
  };

  const handleLogin = (method) => {
    // 預覽環境的 Fallback 登入，實際部署不需要這個
    setUser({ uid: 'guest_user' }); 
  };

  if (loading) {
    return <SplashScreen onFinish={() => setLoading(false)} />;
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return <MainApp user={user} onLogout={handleLogout} />;
};

export default App;
