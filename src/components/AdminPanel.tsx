import React, { useState } from 'react';
import {
  ShieldCheck,
  KeyRound,
  UserX,
  Users,
  Settings,
  Archive,
  Copy,
  Check,
  Share2,
  Plus,
  Trash2,
  RefreshCw,
  Search,
  AlertTriangle,
  Lock,
  Unlock,
  DollarSign,
  Phone,
  Store,
  Calendar,
  LogOut,
  Download,
  Upload
} from 'lucide-react';
import {
  AdminSettings,
  BillRecord,
  BlacklistItem,
  RegisteredCustomer,
  ShopProfile
} from '../types';
import { calculateUnlockCode, normalizeDigits } from '../utils/security';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  adminSettings: AdminSettings;
  onUpdateAdminSettings: (settings: AdminSettings) => void;
  blacklist: BlacklistItem[];
  onUpdateBlacklist: (list: BlacklistItem[]) => void;
  customers: RegisteredCustomer[];
  onUpdateCustomers: (customers: RegisteredCustomer[]) => void;
  bills: BillRecord[];
  onDeleteBill: (id: string) => void;
  onClearAllBills: () => void;
  currentShopProfile: ShopProfile;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  adminSettings,
  onUpdateAdminSettings,
  blacklist,
  onUpdateBlacklist,
  customers,
  onUpdateCustomers,
  bills,
  onDeleteBill,
  onClearAllBills,
}) => {
  const [activeTab, setActiveTab] = useState<'generator' | 'blacklist' | 'customers' | 'bills' | 'settings'>('generator');

  // Generator state
  const [genPhone, setGenPhone] = useState('');
  const [genDeviceId, setGenDeviceId] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Blacklist state
  const [newBlTarget, setNewBlTarget] = useState('');
  const [newBlType, setNewBlType] = useState<'phone' | 'device' | 'all'>('phone');
  const [newBlReason, setNewBlReason] = useState('فیس ادا نہیں کی');
  const [blSearch, setBlSearch] = useState('');

  // Customers state
  const [custSearch, setCustSearch] = useState('');

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<AdminSettings>({ ...adminSettings });
  const [newPinInput, setNewPinInput] = useState('');
  const [settingsSaved, setSettingsSaved] = useState(false);

  if (!isOpen) return null;

  // Code generation formula
  const calculatedCode = genPhone.trim() && genDeviceId.trim()
    ? calculateUnlockCode(genPhone, genDeviceId)
    : '';

  const handleCopyGenerated = () => {
    if (!calculatedCode) return;
    navigator.clipboard.writeText(calculatedCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSendViaWhatsApp = (phone: string, code: string, name = 'محترم ممبر') => {
    const text = `السلام علیکم ${name}!%0Aچک کیلکولیٹر کی رجسٹریشن فیس وصولی پر مبارکباد۔%0Aآپ کا مستقل ایکٹیویشن کوڈ یہ ہے:%0A*${code}*%0A(نوٹ: ایپلیکیشن میں جا کر Coupon Code کی جگہ یہ کوڈ درج کریں اور ان لاک دبائیں)`;
    const clean = normalizeDigits(phone).replace(/\D/g, '');
    const full = clean.length >= 10 ? (clean.startsWith('92') ? clean : `92${clean.slice(-10)}`) : '';
    const url = full ? `https://wa.me/${full}?text=${text}` : `https://api.whatsapp.com/send?text=${text}`;
    window.open(url, '_blank');
  };

  // Blacklist handlers
  const handleAddBlacklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlTarget.trim()) return;
    const newItem: BlacklistItem = {
      id: `bl-${Date.now()}`,
      phoneOrDevice: newBlTarget.trim(),
      type: newBlType,
      reason: newBlReason.trim() || 'ایڈمن کی طرف سے بلاک',
      addedAt: new Date().toLocaleDateString('ur-PK'),
      isActive: true,
    };
    onUpdateBlacklist([newItem, ...blacklist]);
    setNewBlTarget('');
  };

  const handleToggleBlacklist = (id: string) => {
    onUpdateBlacklist(
      blacklist.map((item) =>
        item.id === id ? { ...item, isActive: !item.isActive } : item
      )
    );
  };

  const handleDeleteBlacklist = (id: string) => {
    if (window.confirm('کیا آپ اس اندراج کو بلیک لسٹ سے خارج کرنا چاہتے ہیں؟')) {
      onUpdateBlacklist(blacklist.filter((item) => item.id !== id));
    }
  };

  // Customer handlers
  const handleBlockCustomer = (customer: RegisteredCustomer) => {
    const reason = window.prompt('بلاک کرنے کی وجہ لکھیں:', 'فیس ادا نہیں کی یا خلاف ورزی');
    if (reason === null) return;

    // Add phone to blacklist
    const newItems: BlacklistItem[] = [
      {
        id: `bl-cust-${Date.now()}`,
        phoneOrDevice: customer.phone,
        type: 'phone',
        reason: reason || 'ایڈمن کی طرف سے بلاک',
        addedAt: new Date().toLocaleDateString('ur-PK'),
        isActive: true,
      },
      {
        id: `bl-dev-${Date.now()}`,
        phoneOrDevice: customer.deviceId,
        type: 'device',
        reason: reason || 'ڈیوائس بلاک',
        addedAt: new Date().toLocaleDateString('ur-PK'),
        isActive: true,
      }
    ];

    onUpdateBlacklist([...newItems, ...blacklist]);

    // Update customer status
    onUpdateCustomers(
      customers.map((c) => (c.id === customer.id ? { ...c, status: 'blocked' } : c))
    );
  };

  const handleApproveCustomer = (customer: RegisteredCustomer) => {
    const code = calculateUnlockCode(customer.phone, customer.deviceId);
    onUpdateCustomers(
      customers.map((c) =>
        c.id === customer.id ? { ...c, status: 'active', unlockCode: code, feePaid: true } : c
      )
    );
    handleSendViaWhatsApp(customer.phone, code, customer.name);
  };

  const handleDeleteCustomer = (id: string) => {
    if (window.confirm('کیا آپ اس کسٹمر کا ریکارڈ ڈیلیٹ کرنا چاہتے ہیں؟')) {
      onUpdateCustomers(customers.filter((c) => c.id !== id));
    }
  };

  // Settings Save
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAdminSettings(settingsForm);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  const handleAddPin = () => {
    if (!newPinInput.trim()) return;
    const clean = newPinInput.trim();
    if (!settingsForm.adminPins.includes(clean)) {
      setSettingsForm({
        ...settingsForm,
        adminPins: [...settingsForm.adminPins, clean],
      });
    }
    setNewPinInput('');
  };

  const handleRemovePin = (pin: string) => {
    if (settingsForm.adminPins.length <= 1) {
      alert('کم از کم ایک ایڈمن پن کا ہونا ضروری ہے!');
      return;
    }
    setSettingsForm({
      ...settingsForm,
      adminPins: settingsForm.adminPins.filter((p) => p !== pin),
    });
  };

  // Backup / Export
  const handleExportData = () => {
    const payload = {
      blacklist,
      customers,
      bills,
      adminSettings,
      exportedAt: new Date().toISOString(),
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Chak_Calculator_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const activeBlacklistCount = blacklist.filter((b) => b.isActive).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="bg-stone-900 border-2 border-amber-400 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Admin Header */}
        <div className="p-4 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-400/10 border border-amber-400/50 rounded-xl flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-amber-400">
                  مرکزی ایڈمن پینل و کنٹرول روم
                </h2>
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                  سیکرٹ کوڈ: 786050
                </span>
              </div>
              <p className="text-xs text-stone-400">
                کوڈ جنریشن، بلیک لسٹ کنٹرول، کسٹمرز مینجمنٹ اور سسٹم سیٹنگز
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 py-1.5 px-3 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-xl text-xs font-semibold transition"
          >
            <LogOut className="w-4 h-4 text-amber-400" />
            <span>کیلکولیٹر پر واپس جائیں</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-stone-950/80 px-4 pt-2 border-b border-stone-800 flex gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('generator')}
            className={`flex items-center gap-1.5 py-2.5 px-3.5 border-b-2 font-bold text-xs whitespace-nowrap transition cursor-pointer ${
              activeTab === 'generator'
                ? 'border-amber-400 text-amber-400 bg-amber-400/10 rounded-t-lg'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>کوڈ جنریٹر (Code Gen)</span>
          </button>

          <button
            onClick={() => setActiveTab('blacklist')}
            className={`flex items-center gap-1.5 py-2.5 px-3.5 border-b-2 font-bold text-xs whitespace-nowrap transition cursor-pointer relative ${
              activeTab === 'blacklist'
                ? 'border-red-500 text-red-400 bg-red-500/10 rounded-t-lg'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <UserX className="w-4 h-4" />
            <span>مضبوط بلیک لسٹ</span>
            {activeBlacklistCount > 0 && (
              <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                {activeBlacklistCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`flex items-center gap-1.5 py-2.5 px-3.5 border-b-2 font-bold text-xs whitespace-nowrap transition cursor-pointer ${
              activeTab === 'customers'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-400/10 rounded-t-lg'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>رجسٹرڈ کسٹمرز ({customers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bills')}
            className={`flex items-center gap-1.5 py-2.5 px-3.5 border-b-2 font-bold text-xs whitespace-nowrap transition cursor-pointer ${
              activeTab === 'bills'
                ? 'border-sky-400 text-sky-400 bg-sky-400/10 rounded-t-lg'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Archive className="w-4 h-4" />
            <span>تمام بلز آرکائیو ({bills.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 py-2.5 px-3.5 border-b-2 font-bold text-xs whitespace-nowrap transition cursor-pointer ${
              activeTab === 'settings'
                ? 'border-amber-400 text-amber-400 bg-amber-400/10 rounded-t-lg'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>سسٹم سیٹنگز و فیس</span>
          </button>
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-stone-900">
          
          {/* TAB 1: CODE GENERATOR */}
          {activeTab === 'generator' && (
            <div className="max-w-xl mx-auto space-y-4">
              <div className="bg-stone-950/80 border border-amber-400/40 rounded-xl p-4 shadow-md">
                <h3 className="font-bold text-amber-400 text-sm mb-1 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span>کسٹمر ایکٹیویشن کوڈ جنریٹر</span>
                </h3>
                <p className="text-xs text-stone-400 mb-4">
                  کسٹمر کا موبائل نمبر اور ڈیوائس آئی ڈی درج کریں، خودکار ریاضیاتی فارمولے سے ان کا کوڈ تیار ہو جائے گا:
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      کسٹمر کا موبائل نمبر:
                    </label>
                    <input
                      type="text"
                      placeholder="مثلاً: 03329106002"
                      value={genPhone}
                      onChange={(e) => setGenPhone(e.target.value)}
                      className="w-full py-2.5 px-3 bg-stone-900 border border-stone-700 focus:border-amber-400 rounded-lg text-white font-mono text-sm focus:outline-none"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      کسٹمر کی ڈیوائس آئی ڈی (4 ہندسے):
                    </label>
                    <input
                      type="text"
                      placeholder="مثلاً: 7845"
                      value={genDeviceId}
                      onChange={(e) => setGenDeviceId(e.target.value)}
                      className="w-full py-2.5 px-3 bg-stone-900 border border-stone-700 focus:border-amber-400 rounded-lg text-white font-mono text-sm focus:outline-none"
                      dir="ltr"
                      maxLength={4}
                    />
                  </div>

                  {calculatedCode ? (
                    <div className="mt-4 p-4 bg-emerald-950/60 border-2 border-emerald-500 rounded-xl text-center">
                      <span className="text-xs text-emerald-300 font-bold block mb-1">
                        تخلیق شدہ کوپن کوڈ (Unlock Code):
                      </span>
                      <div className="text-3xl font-black text-amber-300 font-mono tracking-widest my-1">
                        {calculatedCode}
                      </div>
                      <div className="text-[11px] text-stone-400 mb-3 font-mono">
                        حساب: ({genPhone.slice(-4)} + {genDeviceId} + 5050)
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={handleCopyGenerated}
                          className="flex-1 py-2 px-3 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
                        >
                          {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedCode ? 'کاپی ہوگیا!' : 'کوڈ کاپی کریں'}</span>
                        </button>
                        <button
                          onClick={() => handleSendViaWhatsApp(genPhone, calculatedCode)}
                          className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>واٹس ایپ پر کوڈ بھیجیں</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-stone-900/50 rounded-lg border border-stone-800 text-center text-xs text-stone-500">
                      موبائل نمبر اور ڈیوائس آئی ڈی درج کریں تا کہ کوڈ سامنے آ سکے۔
                    </div>
                  )}
                </div>
              </div>

              {/* Master bypass info */}
              <div className="bg-amber-400/5 border border-amber-400/20 rounded-xl p-3.5 text-xs text-stone-300">
                <h4 className="font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>ماسٹر کوڈز و خفیہ اوپن پن:</span>
                </h4>
                <p className="leading-relaxed">
                  ایڈمن کے لیے درج ذیل کوڈز ہر ڈیوائس پر اور بغیر کسی حساب کے براہ راست ایپلیکیشن اور ایڈمن پینل کو اوپن کر دیتے ہیں:
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {adminSettings.adminPins.map((p, idx) => (
                    <span key={idx} className="bg-stone-950 font-mono font-bold text-amber-300 px-2 py-1 rounded border border-amber-400/30 text-xs">
                      {p}
                    </span>
                  ))}
                  <span className="bg-stone-950 font-mono font-bold text-amber-300 px-2 py-1 rounded border border-amber-400/30 text-xs">
                    786ز50
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ROBUST BLACKLIST */}
          {activeTab === 'blacklist' && (
            <div className="space-y-4">
              {/* Add to Blacklist Form */}
              <div className="bg-stone-950/80 border border-red-500/40 rounded-xl p-4 shadow-md">
                <h3 className="font-bold text-red-400 text-sm mb-1 flex items-center gap-2">
                  <UserX className="w-4 h-4 text-red-400" />
                  <span>نیا موبائل یا ڈیوائس بلیک لسٹ میں شامل کریں</span>
                </h3>
                <p className="text-xs text-stone-400 mb-3">
                  یہاں درج کیا گیا نمبر یا ڈیوائس ایپلیکیشن نہیں کھول سکے گی اور اسے سیکیورٹی بلاک اسکرین دکھائی دے گی۔
                </p>

                <form onSubmit={handleAddBlacklist} className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="موبائل نمبر یا 4 ہندسوں کی ڈیوائس آئی ڈی"
                      value={newBlTarget}
                      onChange={(e) => setNewBlTarget(e.target.value)}
                      className="w-full py-2 px-3 bg-stone-900 border border-stone-700 focus:border-red-500 rounded-lg text-white font-mono text-xs focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <select
                      value={newBlType}
                      onChange={(e) => setNewBlType(e.target.value as any)}
                      className="w-full py-2 px-3 bg-stone-900 border border-stone-700 focus:border-red-500 rounded-lg text-stone-200 text-xs focus:outline-none"
                    >
                      <option value="phone">موبائل نمبر</option>
                      <option value="device">ڈیوائس آئی ڈی</option>
                      <option value="all">دونوں (Phone & Device)</option>
                    </select>
                  </div>

                  <div>
                    <button
                      type="submit"
                      className="w-full py-2 px-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs transition flex items-center justify-center gap-1 shadow"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>بلیک لسٹ میں ڈالیں</span>
                    </button>
                  </div>

                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      placeholder="بلاک کرنے کی وجہ (مثلاً: فیس جمع نہیں کروائی، ڈپلیکیٹ اکاؤنٹ)"
                      value={newBlReason}
                      onChange={(e) => setNewBlReason(e.target.value)}
                      className="w-full py-1.5 px-3 bg-stone-900/60 border border-stone-800 focus:border-red-500 rounded-lg text-stone-300 text-xs focus:outline-none"
                    />
                  </div>
                </form>
              </div>

              {/* Blacklist Table */}
              <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-white text-xs flex items-center gap-2">
                    <span>بلیک لسٹ ریکارڈز ({blacklist.length})</span>
                    <span className="text-[11px] text-red-400 bg-red-950/60 px-2 py-0.5 rounded font-mono">
                      ایکٹیو: {activeBlacklistCount}
                    </span>
                  </h4>

                  <div className="relative w-48">
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="تلاش کریں..."
                      value={blSearch}
                      onChange={(e) => setBlSearch(e.target.value)}
                      className="w-full py-1 pr-8 pl-2 bg-stone-900 border border-stone-700 rounded-lg text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-right border-collapse">
                    <thead>
                      <tr className="bg-stone-900 text-stone-300 border-b border-stone-800">
                        <th className="p-2">ہدف (موبائل / ڈیوائس)</th>
                        <th className="p-2">قسم</th>
                        <th className="p-2">وجہ</th>
                        <th className="p-2">تاریخ</th>
                        <th className="p-2">حالت</th>
                        <th className="p-2 text-center">ایکشن</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/60">
                      {blacklist
                        .filter((b) => b.phoneOrDevice.includes(blSearch) || b.reason.includes(blSearch))
                        .map((item) => (
                          <tr key={item.id} className="hover:bg-stone-900/40">
                            <td className="p-2 font-mono font-bold text-amber-300" dir="ltr">
                              {item.phoneOrDevice}
                            </td>
                            <td className="p-2 text-stone-400">
                              {item.type === 'phone' ? 'موبائل نمبر' : item.type === 'device' ? 'ڈیوائس آئی ڈی' : 'مشترکہ'}
                            </td>
                            <td className="p-2 text-stone-300">{item.reason}</td>
                            <td className="p-2 text-stone-500 font-mono">{item.addedAt}</td>
                            <td className="p-2">
                              <button
                                onClick={() => handleToggleBlacklist(item.id)}
                                className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                                  item.isActive
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                    : 'bg-stone-800 text-stone-500 border border-stone-700'
                                }`}
                              >
                                {item.isActive ? 'بلاک فعال ہے' : 'غیر فعال'}
                              </button>
                            </td>
                            <td className="p-2 text-center">
                              <button
                                onClick={() => handleDeleteBlacklist(item.id)}
                                className="p-1 text-stone-500 hover:text-red-400 transition"
                                title="خارج کریں"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  {blacklist.length === 0 && (
                    <div className="text-center py-6 text-stone-500 text-xs">
                      بلیک لسٹ میں کوئی اندراج موجود نہیں ہے۔
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: REGISTERED CUSTOMERS */}
          {activeTab === 'customers' && (
            <div className="space-y-4">
              <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 mb-3">
                  <h3 className="font-bold text-emerald-400 text-sm flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span>رجسٹرڈ ممبرز و دکانیں ({customers.length})</span>
                  </h3>

                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="کسٹمر نام، فون یا دکان سے تلاش..."
                      value={custSearch}
                      onChange={(e) => setCustSearch(e.target.value)}
                      className="w-full py-1.5 pr-8 pl-2 bg-stone-900 border border-stone-700 rounded-lg text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-right border-collapse">
                    <thead>
                      <tr className="bg-stone-900 text-stone-300 border-b border-stone-800">
                        <th className="p-2">نام کسٹمر</th>
                        <th className="p-2">دکان کا نام</th>
                        <th className="p-2">موبائل نمبر</th>
                        <th className="p-2">ڈیوائس آئی ڈی</th>
                        <th className="p-2">حالت</th>
                        <th className="p-2 text-center">ایکٹیویشن / ایکشن</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/60">
                      {customers
                        .filter(
                          (c) =>
                            c.name.includes(custSearch) ||
                            c.phone.includes(custSearch) ||
                            (c.shopName || '').includes(custSearch)
                        )
                        .map((cust) => {
                          const code = calculateUnlockCode(cust.phone, cust.deviceId);
                          return (
                            <tr key={cust.id} className="hover:bg-stone-900/40">
                              <td className="p-2 font-bold text-white">{cust.name}</td>
                              <td className="p-2 text-amber-300 font-medium">
                                {cust.shopName || 'میری دکان'}
                              </td>
                              <td className="p-2 font-mono text-stone-300" dir="ltr">
                                {cust.phone}
                              </td>
                              <td className="p-2 font-mono text-emerald-400">{cust.deviceId}</td>
                              <td className="p-2">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    cust.status === 'active'
                                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                                      : cust.status === 'blocked'
                                      ? 'bg-red-950 text-red-400 border border-red-500/30'
                                      : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                                  }`}
                                >
                                  {cust.status === 'active'
                                    ? 'فعال (Approved)'
                                    : cust.status === 'blocked'
                                    ? 'بلاک شدہ'
                                    : 'انتظار کوڈ'}
                                </span>
                              </td>
                              <td className="p-2 text-center flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleApproveCustomer(cust)}
                                  className="py-1 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold flex items-center gap-1 transition"
                                  title="منظور کریں اور کوڈ بھیجیں"
                                >
                                  <Unlock className="w-3 h-3" />
                                  <span>کوڈ بھیجیں ({code})</span>
                                </button>
                                <button
                                  onClick={() => handleBlockCustomer(cust)}
                                  className="p-1 bg-red-950 hover:bg-red-900 text-red-400 border border-red-500/40 rounded transition"
                                  title="بلیک لسٹ کریں"
                                >
                                  <UserX className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCustomer(cust.id)}
                                  className="p-1 text-stone-500 hover:text-stone-300 transition"
                                  title="حذف کریں"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                  {customers.length === 0 && (
                    <div className="text-center py-6 text-stone-500 text-xs">
                      ابھی تک کوئی کسٹمر رجسٹرڈ نہیں ہوا۔
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ALL BILLS ARCHIVE */}
          {activeTab === 'bills' && (
            <div className="space-y-4">
              <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-sky-400 text-sm flex items-center gap-2">
                    <Archive className="w-4 h-4 text-sky-400" />
                    <span>مرکزی بلز آرکائیو ({bills.length})</span>
                  </h3>
                  {bills.length > 0 && (
                    <button
                      onClick={() => {
                        if (window.confirm('کیا آپ ایڈمن کی حیثیت سے تمام بلز ڈیلیٹ کرنا چاہتے ہیں؟')) {
                          onClearAllBills();
                        }
                      }}
                      className="py-1 px-2.5 bg-red-950/40 text-red-400 border border-red-500/30 rounded text-xs hover:bg-red-900 transition"
                    >
                      تمام بلز ڈیلیٹ کریں
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-right border-collapse">
                    <thead>
                      <tr className="bg-stone-900 text-stone-300 border-b border-stone-800">
                        <th className="p-2">بل نمبر</th>
                        <th className="p-2">دکان</th>
                        <th className="p-2">کسٹمر</th>
                        <th className="p-2">قسم</th>
                        <th className="p-2">تاریخ</th>
                        <th className="p-2">فٹواری</th>
                        <th className="p-2">رقم</th>
                        <th className="p-2 text-center">ایکشن</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/60">
                      {bills.map((b) => (
                        <tr key={b.id} className="hover:bg-stone-900/40">
                          <td className="p-2 font-mono font-bold text-amber-400">#{b.billNo}</td>
                          <td className="p-2 font-medium text-stone-300">
                            {b.shopDetails?.shopName || 'عام دکان'}
                          </td>
                          <td className="p-2 font-bold text-white">{b.customerName || 'عام گاہک'}</td>
                          <td className="p-2 text-stone-400">{b.chakType}</td>
                          <td className="p-2 text-stone-500 font-mono">{b.date}</td>
                          <td className="p-2 font-mono text-amber-300">{b.grandTotal}</td>
                          <td className="p-2 font-mono font-bold text-emerald-400">
                            Rs. {b.finalTotalAmount.toLocaleString()}
                          </td>
                          <td className="p-2 text-center">
                            <button
                              onClick={() => onDeleteBill(b.id)}
                              className="p-1 text-stone-500 hover:text-red-400 transition"
                              title="ڈیلیٹ کریں"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {bills.length === 0 && (
                    <div className="text-center py-6 text-stone-500 text-xs">
                      کوئی بل ریکارڈ میں موجود نہیں ہے۔
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-xl mx-auto space-y-4">
              <form onSubmit={handleSaveSettings} className="bg-stone-950/80 border border-stone-800 rounded-xl p-4 space-y-4 shadow-md">
                <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2 border-b border-stone-800 pb-2">
                  <Settings className="w-4 h-4 text-amber-400" />
                  <span>ایڈمن و رجسٹریشن فیس سیٹنگز</span>
                </h3>

                {/* Pricing settings */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      ایک موبائل فیس (روپے):
                    </label>
                    <input
                      type="number"
                      value={settingsForm.singleFee}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, singleFee: Number(e.target.value) || 0 })
                      }
                      className="w-full py-2 px-3 bg-stone-900 border border-stone-700 rounded-lg text-white font-mono text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      دوست / 2 موبائل آفر فیس (روپے):
                    </label>
                    <input
                      type="number"
                      value={settingsForm.pairFee}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, pairFee: Number(e.target.value) || 0 })
                      }
                      className="w-full py-2 px-3 bg-stone-900 border border-stone-700 rounded-lg text-white font-mono text-xs focus:outline-none"
                    />
                  </div>
                </div>

                {/* EasyPaisa Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      ایزی پیسہ نمبر:
                    </label>
                    <input
                      type="text"
                      value={settingsForm.easypaisaNumber}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, easypaisaNumber: e.target.value })
                      }
                      className="w-full py-2 px-3 bg-stone-900 border border-stone-700 rounded-lg text-white font-mono text-xs focus:outline-none"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      ایزی پیسہ اکاؤنٹ نام:
                    </label>
                    <input
                      type="text"
                      value={settingsForm.easypaisaName}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, easypaisaName: e.target.value })
                      }
                      className="w-full py-2 px-3 bg-stone-900 border border-stone-700 rounded-lg text-white text-xs focus:outline-none"
                    />
                  </div>
                </div>

                {/* WhatsApp Support Number */}
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    واٹس ایپ ہیلپ لائن نمبر (بغیر صفر، کوڈ 92 کے ساتھ):
                  </label>
                  <input
                    type="text"
                    value={settingsForm.whatsappSupportNumber}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, whatsappSupportNumber: e.target.value })
                    }
                    placeholder="923329106002"
                    className="w-full py-2 px-3 bg-stone-900 border border-stone-700 rounded-lg text-white font-mono text-xs focus:outline-none"
                    dir="ltr"
                  />
                </div>

                {/* Master PINs */}
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    ایڈمن کے خفیہ کوڈز (Secret Bypass Pins):
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {settingsForm.adminPins.map((p, i) => (
                      <span
                        key={i}
                        className="bg-stone-900 border border-amber-400/30 text-amber-300 font-mono text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5"
                      >
                        <span>{p}</span>
                        <button
                          type="button"
                          onClick={() => handleRemovePin(p)}
                          className="text-stone-500 hover:text-red-400"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="نیا کوڈ لکھیں (مثلاً: 786050 یا 786ز50)"
                      value={newPinInput}
                      onChange={(e) => setNewPinInput(e.target.value)}
                      className="flex-1 py-1.5 px-3 bg-stone-900 border border-stone-700 rounded-lg text-white text-xs font-mono focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddPin}
                      className="py-1.5 px-3 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-bold transition"
                    >
                      کوڈ شامل کریں
                    </button>
                  </div>
                </div>

                {settingsSaved && (
                  <div className="p-2 bg-emerald-950 border border-emerald-500 rounded-lg text-emerald-300 text-xs text-center font-bold">
                    سیٹنگز کامیابی سے محفوظ ہو گئیں!
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl text-xs transition shadow cursor-pointer"
                >
                  سیٹنگز محفوظ کریں
                </button>
              </form>

              {/* Data Backup Card */}
              <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-4">
                <h4 className="font-bold text-white text-xs mb-1 flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-sky-400" />
                  <span>مکمل ڈیٹا بیک اپ و سیکیورٹی آرکائیو:</span>
                </h4>
                <p className="text-[11px] text-stone-400 mb-3">
                  تمام بلز، بلیک لسٹ اور کسٹمرز کا ڈیٹا JSON فارمیٹ میں ڈاؤن لوڈ کر کے اپنے پاس محفوظ رکھ سکتے ہیں۔
                </p>
                <button
                  type="button"
                  onClick={handleExportData}
                  className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 border border-stone-700"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>تمام ریکارڈز کا بیک اپ فائل ڈاؤن لوڈ کریں</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
