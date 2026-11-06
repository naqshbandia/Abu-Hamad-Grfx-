/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Store,
  Printer,
  Save,
  RotateCcw,
  Archive,
  ShieldCheck,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Phone,
  User,
  Share2,
  Settings,
  HelpCircle,
  CheckCircle,
  FileText,
  Lock,
  Sparkles
} from 'lucide-react';
import {
  AdminSettings,
  BillRecord,
  BlacklistItem,
  ChakRow,
  RegisteredCustomer,
  ShopProfile
} from './types';
import {
  CHAK_CONFIGS,
  generateInitialRows
} from './utils/chakConfig';
import {
  getDeviceId,
  checkIsBlocked,
  verifyUnlockCode,
  normalizeDigits
} from './utils/security';
import {
  STORAGE_KEYS,
  getStoredShopProfile,
  saveStoredShopProfile,
  getStoredBlacklist,
  saveStoredBlacklist,
  getStoredCustomers,
  saveStoredCustomers,
  getStoredBills,
  saveStoredBills,
  getStoredAdminSettings,
  saveStoredAdminSettings,
  getNextBillNumber
} from './utils/storage';
import { RegistrationScreen } from './components/RegistrationScreen';
import { LockScreen } from './components/LockScreen';
import { BlockedScreen } from './components/BlockedScreen';
import { ShopSettingsModal } from './components/ShopSettingsModal';
import { PrintBillModal } from './components/PrintBillModal';
import { SavedBillsModal } from './components/SavedBillsModal';
import { AdminPanel } from './components/AdminPanel';

export default function App() {
  // Device ID
  const deviceId = useMemo(() => getDeviceId(), []);

  // Application State
  const [appStatus, setAppStatus] = useState<'loading' | 'unregistered' | 'pending_otp' | 'unlocked' | 'blocked'>('loading');
  const [userName, setUserName] = useState<string>('');
  const [userPhone, setUserPhone] = useState<string>('');
  const [blockReason, setBlockReason] = useState<string>('');

  // Modals & Panels
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showAdminPinPrompt, setShowAdminPinPrompt] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [adminPinError, setAdminPinError] = useState('');

  const [showShopSettings, setShowShopSettings] = useState(false);
  const [showSavedBills, setShowSavedBills] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [currentPrintBill, setCurrentPrintBill] = useState<BillRecord | null>(null);

  // App Data
  const [shopProfile, setShopProfile] = useState<ShopProfile>(getStoredShopProfile);
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(getStoredAdminSettings);
  const [blacklist, setBlacklist] = useState<BlacklistItem[]>(getStoredBlacklist);
  const [customers, setCustomers] = useState<RegisteredCustomer[]>(getStoredCustomers);
  const [bills, setBills] = useState<BillRecord[]>(getStoredBills);

  // Calculator State
  const [activeTab, setActiveTab] = useState<number>(0);
  const [rows, setRows] = useState<ChakRow[]>(() => generateInitialRows(0));
  const [rateFotwari, setRateFotwari] = useState<string>('');
  const [rateHundred, setRateHundred] = useState<string>('');

  // Bill Meta
  const [billNo, setBillNo] = useState<string>('000001');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [saveAlert, setSaveAlert] = useState<string>('');

  // 1. Initial Load & Block check
  useEffect(() => {
    const savedStatus = localStorage.getItem(STORAGE_KEYS.STATUS) || 'unregistered';
    const savedName = localStorage.getItem(STORAGE_KEYS.USER_NAME) || '';
    const savedPhone = localStorage.getItem(STORAGE_KEYS.USER_PHONE) || '';

    setUserName(savedName);
    setUserPhone(savedPhone);

    // Check if blocked
    const blockCheck = checkIsBlocked(savedPhone, deviceId, blacklist);
    if (blockCheck.isBlocked) {
      setBlockReason(blockCheck.reason || '');
      setAppStatus('blocked');
      return;
    }

    if (savedStatus === 'unlocked') {
      setAppStatus('unlocked');
    } else if (savedStatus === 'pending_otp') {
      setAppStatus('pending_otp');
    } else {
      setAppStatus('unregistered');
    }

    // Set initial date/time and bill counter
    const now = new Date();
    setCurrentDate(now.toLocaleDateString('ur-PK'));
    setCurrentTime(now.toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit' }));

    const savedCounter = localStorage.getItem(STORAGE_KEYS.BILL_COUNTER) || '1';
    setBillNo(String(parseInt(savedCounter, 10)).padStart(6, '0'));

    // Load any saved active table state
    try {
      const savedCalc = localStorage.getItem(STORAGE_KEYS.CALCULATOR_DATA);
      if (savedCalc) {
        const parsed = JSON.parse(savedCalc);
        if (parsed.activeTab !== undefined) {
          setActiveTab(parsed.activeTab);
          const initial = generateInitialRows(parsed.activeTab);
          if (parsed.qtys && Array.isArray(parsed.qtys)) {
            const mapped = initial.map((r, i) => {
              const q = parsed.qtys[i] !== undefined ? parsed.qtys[i] : '';
              const numQ = parseFloat(q) || 0;
              const rowTot = r.size * r.cutting * numQ;
              return {
                ...r,
                qty: q,
                rowTotal: rowTot,
                hundred: parseFloat((rowTot / 100).toFixed(2)),
              };
            });
            setRows(mapped);
          }
        }
        if (parsed.rateFotwari) setRateFotwari(parsed.rateFotwari);
        if (parsed.rateHundred) setRateHundred(parsed.rateHundred);
      }
    } catch (e) {
      console.error(e);
    }
  }, [deviceId, blacklist]);

  // Keep Clock updated
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentDate(now.toLocaleDateString('ur-PK'));
      setCurrentTime(now.toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit' }));
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Save changes to localStorage when updated
  const handleUpdateAdminSettings = (newSettings: AdminSettings) => {
    setAdminSettings(newSettings);
    saveStoredAdminSettings(newSettings);
  };

  const handleUpdateBlacklist = (newList: BlacklistItem[]) => {
    setBlacklist(newList);
    saveStoredBlacklist(newList);
    // Re-check current device
    const blockCheck = checkIsBlocked(userPhone, deviceId, newList);
    if (blockCheck.isBlocked) {
      setBlockReason(blockCheck.reason || '');
      setAppStatus('blocked');
    }
  };

  const handleUpdateCustomers = (newCustomers: RegisteredCustomer[]) => {
    setCustomers(newCustomers);
    saveStoredCustomers(newCustomers);
  };

  const handleUpdateShopProfile = (newProfile: ShopProfile) => {
    setShopProfile(newProfile);
    saveStoredShopProfile(newProfile);
  };

  // 2. Calculations
  const grandTotalFotwari = useMemo(() => {
    return rows.reduce((acc, r) => acc + (r.rowTotal || 0), 0);
  }, [rows]);

  const grandTotalHundreds = useMemo(() => {
    return parseFloat((grandTotalFotwari / 100).toFixed(2));
  }, [grandTotalFotwari]);

  const fotwariAmount = useMemo(() => {
    const rf = parseFloat(rateFotwari) || 0;
    return Math.round(grandTotalFotwari * rf);
  }, [grandTotalFotwari, rateFotwari]);

  const hundredAmount = useMemo(() => {
    const rh = parseFloat(rateHundred) || 0;
    return Math.round(grandTotalHundreds * rh);
  }, [grandTotalHundreds, rateHundred]);

  const finalTotalAmount = useMemo(() => {
    if (fotwariAmount > 0 && hundredAmount > 0) {
      return fotwariAmount + hundredAmount;
    }
    return fotwariAmount || hundredAmount || 0;
  }, [fotwariAmount, hundredAmount]);

  // Save calculator inputs to preserve on reload
  const persistCalculatorState = (newRows: ChakRow[], tab: number, rf: string, rh: string) => {
    try {
      const data = {
        activeTab: tab,
        qtys: newRows.map((r) => r.qty),
        rateFotwari: rf,
        rateHundred: rh,
      };
      localStorage.setItem(STORAGE_KEYS.CALCULATOR_DATA, JSON.stringify(data));
    } catch (e) {
      console.error(e);
    }
  };

  // Row input change
  const handleQtyChange = (index: number, val: string) => {
    const updated = [...rows];
    const target = updated[index];
    if (!target) return;

    target.qty = val === '' ? '' : val;
    const numQ = parseFloat(val) || 0;
    const tot = target.size * target.cutting * numQ;
    target.rowTotal = tot;
    target.hundred = parseFloat((tot / 100).toFixed(2));

    setRows(updated);
    persistCalculatorState(updated, activeTab, rateFotwari, rateHundred);
  };

  // Tab switch
  const handleTabChange = (index: number) => {
    setActiveTab(index);
    const newRows = generateInitialRows(index);
    setRows(newRows);
    persistCalculatorState(newRows, index, rateFotwari, rateHundred);
  };

  // Add custom size row
  const handleAddCustomRow = () => {
    const s = window.prompt('نئے سائز کی لمبائی (انچ / سائز درج کریں):', '20');
    if (!s) return;
    const c = window.prompt('کٹنگ کی مقدار درج کریں:', '10');
    if (!c) return;

    const numS = parseFloat(s) || 10;
    const numC = parseFloat(c) || 10;

    const newRow: ChakRow = {
      id: `custom-${Date.now()}`,
      size: numS,
      cutting: numC,
      qty: '',
      rowTotal: 0,
      hundred: 0,
    };
    const updated = [...rows, newRow];
    setRows(updated);
    persistCalculatorState(updated, activeTab, rateFotwari, rateHundred);
  };

  // Delete row
  const handleDeleteRow = (index: number) => {
    const updated = rows.filter((_, i) => i !== index);
    setRows(updated);
    persistCalculatorState(updated, activeTab, rateFotwari, rateHundred);
  };

  // 3. User Registration
  const handleUserRegister = (data: { name: string; phone: string; shopName: string }) => {
    // Check blacklist first
    const blockCheck = checkIsBlocked(data.phone, deviceId, blacklist);
    if (blockCheck.isBlocked) {
      setBlockReason(blockCheck.reason || '');
      setAppStatus('blocked');
      return;
    }

    setUserName(data.name);
    setUserPhone(data.phone);

    // Save shop profile
    const updatedProfile: ShopProfile = {
      ...shopProfile,
      shopName: data.shopName || shopProfile.shopName,
      proprietor: data.name,
      phone: data.phone,
    };
    setShopProfile(updatedProfile);
    saveStoredShopProfile(updatedProfile);

    // Add to registered customers
    const newCustomer: RegisteredCustomer = {
      id: `cust-${Date.now()}`,
      name: data.name,
      phone: data.phone,
      deviceId,
      shopName: data.shopName,
      registeredAt: new Date().toLocaleDateString('ur-PK'),
      status: 'pending',
    };
    const updatedCusts = [newCustomer, ...customers.filter((c) => c.phone !== data.phone)];
    setCustomers(updatedCusts);
    saveStoredCustomers(updatedCusts);

    localStorage.setItem(STORAGE_KEYS.USER_NAME, data.name);
    localStorage.setItem(STORAGE_KEYS.USER_PHONE, data.phone);
    localStorage.setItem(STORAGE_KEYS.STATUS, 'pending_otp');
    setAppStatus('pending_otp');
  };

  // 4. Unlock
  const handleUserUnlock = (code: string) => {
    const verified = verifyUnlockCode(code, userPhone, deviceId, adminSettings.adminPins);
    if (verified.isValid) {
      localStorage.setItem(STORAGE_KEYS.STATUS, 'unlocked');
      setAppStatus('unlocked');

      // Update customer status to active
      const updatedCusts = customers.map((c) =>
        c.phone === userPhone ? { ...c, status: 'active' as const, feePaid: true } : c
      );
      setCustomers(updatedCusts);
      saveStoredCustomers(updatedCusts);

      // If unlocked with master code, offer opening Admin Panel
      if (verified.isAdminMaster) {
        setShowAdminPanel(true);
      }
      return { success: true, isAdmin: verified.isAdminMaster };
    }
    return { success: false, isAdmin: false };
  };

  // 5. Reset Registration
  const handleResetRegistration = () => {
    localStorage.removeItem(STORAGE_KEYS.STATUS);
    localStorage.removeItem(STORAGE_KEYS.USER_NAME);
    localStorage.removeItem(STORAGE_KEYS.USER_PHONE);
    localStorage.removeItem(STORAGE_KEYS.CALCULATOR_DATA);
    setAppStatus('unregistered');
  };

  // 6. Admin Unlock
  const handleAdminVerifyAndOpen = (pin: string) => {
    const normalized = normalizeDigits(pin).trim().toUpperCase();
    const validPins = [
      ...adminSettings.adminPins,
      '786050',
      '786ز50',
      '786Z50',
      'QUDRAT786',
      '03329106002',
    ].map((p) => normalizeDigits(p).trim().toUpperCase());

    if (validPins.includes(normalized) || validPins.includes(pin.trim().toUpperCase())) {
      setShowAdminPinPrompt(false);
      setAdminPinInput('');
      setAdminPinError('');
      // If was blocked or pending, allow access
      if (appStatus === 'blocked') {
        setAppStatus('unlocked');
      }
      setShowAdminPanel(true);
      return true;
    }
    setAdminPinError('غلط ایڈمن کوڈ!');
    return false;
  };

  // 7. Save Bill
  const handleSaveBill = () => {
    const activeItems = rows
      .filter((r) => parseFloat(String(r.qty)) > 0)
      .map((r) => ({
        size: r.size,
        cutting: r.cutting,
        qty: Number(r.qty) || 0,
        rowTotal: r.rowTotal,
        hundred: r.hundred,
      }));

    if (activeItems.length === 0) {
      alert('براہ کرم کسی سائز کے سامنے تعداد درج کریں!');
      return;
    }

    const currentBillNumber = billNo;
    const newBill: BillRecord = {
      id: `bill-${Date.now()}`,
      billNo: currentBillNumber,
      customerName: customerName.trim() || 'عام گاہک',
      customerPhone: customerPhone.trim(),
      date: currentDate,
      time: currentTime,
      timestamp: Date.now(),
      chakType: CHAK_CONFIGS[activeTab]?.name || 'چک',
      items: activeItems,
      grandTotal: grandTotalFotwari,
      grandHundred: grandTotalHundreds,
      rateFotwari: parseFloat(rateFotwari) || 0,
      rateHundred: parseFloat(rateHundred) || 0,
      fotwariAmount,
      hundredAmount,
      finalTotalAmount,
      shopDetails: { ...shopProfile },
    };

    const updatedBills = [newBill, ...bills];
    setBills(updatedBills);
    saveStoredBills(updatedBills);

    // Increment bill counter
    const nextNo = getNextBillNumber();
    setBillNo(nextNo);

    setSaveAlert(`✅ بل #${currentBillNumber} کامیابی سے محفوظ ہو گیا!`);
    setTimeout(() => setSaveAlert(''), 3000);
  };

  // 8. New Calculation
  const handleNewCalculation = () => {
    if (window.confirm('کیا آپ نیا حساب شروع کرنا چاہتے ہیں؟ موجودہ اندراج صاف ہو جائے گا۔')) {
      const reset = rows.map((r) => ({
        ...r,
        qty: '' as const,
        rowTotal: 0,
        hundred: 0,
      }));
      setRows(reset);
      setCustomerName('');
      setCustomerPhone('');
      persistCalculatorState(reset, activeTab, rateFotwari, rateHundred);
    }
  };

  // 9. Open Print for current calculation
  const handleOpenCurrentPrint = () => {
    const activeItems = rows
      .filter((r) => parseFloat(String(r.qty)) > 0)
      .map((r) => ({
        size: r.size,
        cutting: r.cutting,
        qty: Number(r.qty) || 0,
        rowTotal: r.rowTotal,
        hundred: r.hundred,
      }));

    const billObj: BillRecord = {
      id: `preview-${Date.now()}`,
      billNo,
      customerName: customerName.trim() || 'عام گاہک',
      customerPhone: customerPhone.trim(),
      date: currentDate,
      time: currentTime,
      timestamp: Date.now(),
      chakType: CHAK_CONFIGS[activeTab]?.name || 'چک',
      items: activeItems.length > 0 ? activeItems : rows.slice(0, 5).map((r) => ({
        size: r.size,
        cutting: r.cutting,
        qty: 0,
        rowTotal: 0,
        hundred: 0,
      })),
      grandTotal: grandTotalFotwari,
      grandHundred: grandTotalHundreds,
      rateFotwari: parseFloat(rateFotwari) || 0,
      rateHundred: parseFloat(rateHundred) || 0,
      fotwariAmount,
      hundredAmount,
      finalTotalAmount,
      shopDetails: { ...shopProfile },
    };

    setCurrentPrintBill(billObj);
    setShowPrintModal(true);
  };

  // 10. Delete bill
  const handleDeleteBill = (id: string) => {
    const updated = bills.filter((b) => b.id !== id);
    setBills(updated);
    saveStoredBills(updated);
  };

  const handleClearAllBills = () => {
    setBills([]);
    saveStoredBills([]);
  };

  // Conditional screens based on app status
  if (appStatus === 'blocked') {
    return (
      <BlockedScreen
        reason={blockReason}
        adminPhone={adminSettings.masterPhone}
        onAdminUnlock={handleAdminVerifyAndOpen}
      />
    );
  }

  if (appStatus === 'unregistered') {
    return (
      <>
        <RegistrationScreen
          deviceId={deviceId}
          adminSettings={adminSettings}
          onRegister={handleUserRegister}
          onAdminLoginClick={() => setShowAdminPinPrompt(true)}
        />
        {/* Admin PIN Prompt Modal */}
        {showAdminPinPrompt && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-stone-900 border-2 border-amber-400 rounded-2xl p-5 max-w-xs w-full text-center">
              <h3 className="font-black text-amber-400 mb-2">ایڈمن سیکیورٹی لاگ ان</h3>
              <p className="text-xs text-stone-300 mb-3">اپنا ایڈمن پن کوڈ درج کریں:</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAdminVerifyAndOpen(adminPinInput);
                }}
                className="space-y-3"
              >
                <input
                  type="password"
                  placeholder="786050"
                  value={adminPinInput}
                  onChange={(e) => setAdminPinInput(e.target.value)}
                  className="w-full py-2 px-3 bg-stone-950 border border-amber-500 rounded-lg text-center text-amber-300 font-mono font-bold tracking-widest text-lg focus:outline-none"
                  autoFocus
                />
                {adminPinError && <p className="text-xs text-red-400">{adminPinError}</p>}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs"
                  >
                    اوپن کریں
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdminPinPrompt(false);
                      setAdminPinError('');
                    }}
                    className="py-2 px-3 bg-stone-800 text-stone-400 rounded-lg text-xs"
                  >
                    بند کریں
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    );
  }

  if (appStatus === 'pending_otp') {
    return (
      <>
        <LockScreen
          userName={userName}
          userPhone={userPhone}
          deviceId={deviceId}
          adminSettings={adminSettings}
          onUnlock={handleUserUnlock}
          onReset={handleResetRegistration}
          onAdminLoginClick={() => setShowAdminPinPrompt(true)}
        />
        {/* Admin PIN Prompt Modal */}
        {showAdminPinPrompt && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-stone-900 border-2 border-amber-400 rounded-2xl p-5 max-w-xs w-full text-center">
              <h3 className="font-black text-amber-400 mb-2">ایڈمن سیکیورٹی لاگ ان</h3>
              <p className="text-xs text-stone-300 mb-3">اپنا ایڈمن پن کوڈ درج کریں:</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAdminVerifyAndOpen(adminPinInput);
                }}
                className="space-y-3"
              >
                <input
                  type="password"
                  placeholder="786050"
                  value={adminPinInput}
                  onChange={(e) => setAdminPinInput(e.target.value)}
                  className="w-full py-2 px-3 bg-stone-950 border border-amber-500 rounded-lg text-center text-amber-300 font-mono font-bold tracking-widest text-lg focus:outline-none"
                  autoFocus
                />
                {adminPinError && <p className="text-xs text-red-400">{adminPinError}</p>}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs"
                  >
                    اوپن کریں
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdminPinPrompt(false);
                      setAdminPinError('');
                    }}
                    className="py-2 px-3 bg-stone-800 text-stone-400 rounded-lg text-xs"
                  >
                    بند کریں
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-radial from-[#0f3d2e] via-[#07241a] to-[#03130c] text-white p-2 sm:p-4 selection:bg-amber-400 selection:text-black">
      <div className="max-w-2xl mx-auto space-y-3">
        
        {/* TOP STATUS BAR: User Info + Shop Branding + Discreet Admin Button */}
        <div className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 p-2.5 sm:p-3 rounded-2xl shadow-lg border-2 border-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-stone-950 text-amber-400 flex items-center justify-center font-bold text-xs shadow">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-black flex items-center gap-1.5 leading-tight">
                <span>{shopProfile.shopName || 'میری دکان و ٹمبر مارکیٹ'}</span>
                <span className="text-[10px] bg-stone-950 text-amber-300 px-1.5 py-0.2 rounded font-normal">
                  فعال
                </span>
              </div>
              <div className="text-[10px] sm:text-xs font-semibold text-stone-900 flex items-center gap-2">
                <span>ممبر: {userName || 'کسٹمر'}</span>
                {userPhone && <span dir="ltr">({userPhone})</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowShopSettings(true)}
              className="py-1 px-2.5 bg-stone-950/90 hover:bg-black text-amber-300 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow"
              title="دکان کا نام اور تفصیلات تبدیل کریں"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">دکان سیٹنگز</span>
            </button>

            {/* Subtle Admin Icon button */}
            <button
              onClick={() => setShowAdminPinPrompt(true)}
              className="p-1.5 bg-stone-950/80 hover:bg-black text-amber-400 rounded-xl transition shadow"
              title="ایڈمن پینل لاگ ان (786050)"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CUSTOMER & INVOICE HEADER CARD */}
        <div className="bg-stone-900/90 border-2 border-amber-400/80 rounded-2xl p-4 shadow-xl backdrop-blur-md space-y-3">
          
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="flex-1">
              <label className="block text-[11px] font-bold text-stone-300 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>کسٹمر کا نام:</span>
              </label>
              <input
                type="text"
                placeholder="👤 گاہک کا نام لکھیں"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full py-2 px-3 bg-stone-950 border border-stone-700 focus:border-amber-400 rounded-xl text-white text-xs font-semibold focus:outline-none"
              />
            </div>

            <div className="flex-1">
              <label className="block text-[11px] font-bold text-stone-300 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>کسٹمر کا موبائل نمبر:</span>
              </label>
              <input
                type="tel"
                placeholder="📱 کسٹمر فون نمبر"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full py-2 px-3 bg-stone-950 border border-stone-700 focus:border-amber-400 rounded-xl text-white text-xs font-mono focus:outline-none text-left"
                dir="ltr"
              />
            </div>
          </div>

          {/* Bill Meta Bar */}
          <div className="pt-2 border-t border-stone-800 flex flex-wrap items-center justify-between text-xs text-stone-300 gap-y-1">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-mono">{currentDate}</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-mono">{currentTime}</span>
              </span>
            </div>

            <div className="flex items-center gap-1 bg-stone-950 px-2.5 py-1 rounded-lg border border-amber-400/40">
              <span className="text-[11px] text-stone-400">Bill No:</span>
              <span className="font-mono font-black text-amber-400 text-sm">
                #{billNo}
              </span>
            </div>
          </div>
        </div>

        {/* TABS FOR CHAK TYPES */}
        <div className="flex gap-1.5 bg-stone-950/80 p-1.5 rounded-xl border border-amber-400/50 shadow-inner">
          {CHAK_CONFIGS.map((conf, index) => (
            <button
              key={index}
              onClick={() => handleTabChange(index)}
              className={`flex-1 py-2 px-1 text-center font-bold text-xs rounded-lg transition cursor-pointer ${
                activeTab === index
                  ? 'bg-gradient-to-b from-amber-400 to-amber-500 text-stone-950 shadow-md font-black'
                  : 'bg-stone-900/60 text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              {conf.name}
            </button>
          ))}
        </div>

        {/* CALCULATION TABLE */}
        <div className="bg-white text-stone-950 rounded-2xl border-2 border-amber-400 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-stone-950 text-white font-bold text-xs">
                  <th className="py-2 px-1 border border-stone-800">سائز</th>
                  <th className="py-2 px-1 border border-stone-800">کٹنگ</th>
                  <th className="py-2 px-1 border border-stone-800 w-24">تعداد</th>
                  <th className="py-2 px-1 border border-stone-800 bg-stone-900 text-emerald-300">
                    فٹواری
                  </th>
                  <th className="py-2 px-1 border border-stone-800 bg-stone-900 text-amber-300">
                    سینکڑے
                  </th>
                  <th className="py-2 px-1 border border-stone-800 w-8">#</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-xs font-bold">
                {rows.map((row, index) => (
                  <tr
                    key={row.id}
                    className={`transition hover:bg-amber-50/60 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-stone-50'
                    }`}
                  >
                    <td className="py-1.5 px-1 border border-stone-300 bg-teal-50/70 text-stone-900 font-mono">
                      {row.size}
                    </td>
                    <td className="py-1.5 px-1 border border-stone-300 bg-orange-50/70 text-stone-900 font-mono">
                      {row.cutting}
                    </td>
                    <td className="py-1.5 px-1 border border-stone-300">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="0"
                        value={row.qty}
                        onChange={(e) => handleQtyChange(index, e.target.value)}
                        className="w-20 py-1 px-1.5 text-center font-black font-mono text-sm border-2 border-stone-400 focus:border-amber-500 rounded bg-white text-stone-950 shadow-inner focus:outline-none"
                      />
                    </td>
                    <td className="py-1.5 px-1 border border-stone-300 bg-emerald-50/80 font-mono font-black text-emerald-950 text-sm">
                      {row.rowTotal}
                    </td>
                    <td className="py-1.5 px-1 border border-stone-300 bg-amber-50/80 font-mono font-black text-amber-950 text-sm">
                      {row.hundred}
                    </td>
                    <td className="py-1.5 px-1 border border-stone-300 text-center">
                      <button
                        onClick={() => handleDeleteRow(index)}
                        className="p-1 text-stone-300 hover:text-red-500 transition"
                        title="رو ڈیلیٹ کریں"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-stone-950 text-white font-black text-xs sm:text-sm border-t-2 border-amber-400">
                  <td colSpan={3} className="py-2.5 px-3 text-right">
                    مجموعی ٹوٹل (Grand Total):
                  </td>
                  <td className="py-2.5 px-1 font-mono text-emerald-400 font-black text-base bg-stone-900">
                    {grandTotalFotwari}
                  </td>
                  <td className="py-2.5 px-1 font-mono text-amber-400 font-black text-base bg-stone-900">
                    {grandTotalHundreds}
                  </td>
                  <td className="py-2.5 px-1"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Add custom size row button */}
          <div className="p-2 bg-stone-100 border-t border-stone-200 flex justify-between items-center text-xs">
            <span className="text-stone-600 font-medium">
              کل سائزز: <strong>{rows.length}</strong>
            </span>
            <button
              onClick={handleAddCustomRow}
              className="flex items-center gap-1 py-1 px-2.5 bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold rounded-lg text-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>نیا سائز شامل کریں</span>
            </button>
          </div>
        </div>

        {/* RATES & PRICING PANEL */}
        <div className="bg-stone-900/90 border-2 border-amber-400/80 rounded-2xl p-4 shadow-xl backdrop-blur-md space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Fotwari Rate */}
            <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-stone-300 block">
                  فٹواری ریٹ (روپے):
                </span>
                <span className="text-[10px] text-stone-500 font-mono">
                  {grandTotalFotwari} × {rateFotwari || 0}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="ریٹ"
                  value={rateFotwari}
                  onChange={(e) => {
                    setRateFotwari(e.target.value);
                    persistCalculatorState(rows, activeTab, e.target.value, rateHundred);
                  }}
                  className="w-20 py-1.5 px-2 bg-stone-900 border border-stone-700 focus:border-amber-400 rounded-lg text-center font-mono font-bold text-sm text-white focus:outline-none"
                />
                <span className="font-mono font-black text-emerald-400 text-sm min-w-16 text-left">
                  Rs. {fotwariAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Hundred Rate */}
            <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-stone-300 block">
                  سینکڑے ریٹ (روپے):
                </span>
                <span className="text-[10px] text-stone-500 font-mono">
                  {grandTotalHundreds} × {rateHundred || 0}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="ریٹ"
                  value={rateHundred}
                  onChange={(e) => {
                    setRateHundred(e.target.value);
                    persistCalculatorState(rows, activeTab, rateFotwari, e.target.value);
                  }}
                  className="w-20 py-1.5 px-2 bg-stone-900 border border-stone-700 focus:border-amber-400 rounded-lg text-center font-mono font-bold text-sm text-white focus:outline-none"
                />
                <span className="font-mono font-black text-emerald-400 text-sm min-w-16 text-left">
                  Rs. {hundredAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Net Amount Banner */}
          <div className="bg-gradient-to-r from-emerald-950 via-stone-950 to-emerald-950 border border-emerald-500/50 rounded-xl p-3 flex items-center justify-between shadow-inner">
            <span className="text-xs sm:text-sm font-black text-emerald-300">
              صاف کل رقم (Net Total Amount):
            </span>
            <div className="text-right">
              <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
                Rs. {finalTotalAmount.toLocaleString()}
              </span>
              <span className="text-xs text-stone-400 block font-normal">روپے فقط</span>
            </div>
          </div>
        </div>

        {/* Save notification */}
        {saveAlert && (
          <div className="p-3 bg-emerald-950 border border-emerald-500 rounded-xl text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-2 animate-bounce">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{saveAlert}</span>
          </div>
        )}

        {/* ACTION BUTTONS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={handleSaveBill}
            className="py-3 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-black transition shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>بل محفوظ کریں</span>
          </button>

          <button
            onClick={handleNewCalculation}
            className="py-3 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs sm:text-sm font-black transition shadow-lg shadow-amber-900/30 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>نیا حساب</span>
          </button>

          <button
            onClick={() => setShowSavedBills(true)}
            className="py-3 px-3 bg-sky-700 hover:bg-sky-600 text-white rounded-xl text-xs sm:text-sm font-black transition shadow-lg shadow-sky-900/30 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Archive className="w-4 h-4" />
            <span>محفوظ شدہ بل ({bills.length})</span>
          </button>

          <button
            onClick={handleOpenCurrentPrint}
            className="py-3 px-3 bg-purple-700 hover:bg-purple-600 text-white rounded-xl text-xs sm:text-sm font-black transition shadow-lg shadow-purple-900/30 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>PDF / پرنٹ بل</span>
          </button>
        </div>

        {/* QUICK SHOP SETTINGS BAR */}
        <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-stone-300">
            <Store className="w-4 h-4 text-amber-400" />
            <span>
              بل پر پرنٹ نام: <strong className="text-white">{shopProfile.shopName}</strong>
            </span>
          </div>
          <button
            onClick={() => setShowShopSettings(true)}
            className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
          >
            تبدیل کریں
          </button>
        </div>

        {/* FOOTER & DEVELOPER ATTRIBUTION */}
        <div className="pt-4 pb-6 text-center text-xs text-stone-400 space-y-2">
          <p className="font-semibold text-stone-300">
            Powered by AbuHamad GRFX • ڈیزائنر و سافٹ ویئر انجینئر
          </p>
          <a
            href="https://wa.me/923329106002?text=محترم قدرت اللہ بھائی! مجھے چک کیلکولیٹر کے بارے میں رہنمائی چاہیے"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold transition text-xs"
          >
            <span>💬 رہنمائی یا مشورہ کے لیے واٹس ایپ: 03329106002</span>
          </a>

          {/* Discreet Admin Link */}
          <div className="pt-2 flex justify-center">
            <button
              onClick={() => setShowAdminPinPrompt(true)}
              className="text-[11px] text-stone-600 hover:text-amber-400 transition flex items-center gap-1"
            >
              <Lock className="w-3 h-3 text-stone-600" />
              <span>ایڈمن پینل لاگ ان</span>
            </button>
          </div>
        </div>

      </div>

      {/* ALL MODALS */}
      
      {/* 1. Shop Settings Modal */}
      <ShopSettingsModal
        isOpen={showShopSettings}
        onClose={() => setShowShopSettings(false)}
        currentProfile={shopProfile}
        onSave={handleUpdateShopProfile}
      />

      {/* 2. Print / PDF Modal */}
      <PrintBillModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        bill={currentPrintBill}
      />

      {/* 3. Saved Bills Modal */}
      <SavedBillsModal
        isOpen={showSavedBills}
        onClose={() => setShowSavedBills(false)}
        bills={bills}
        onViewBill={(b) => {
          setCurrentPrintBill(b);
          setShowPrintModal(true);
        }}
        onDeleteBill={handleDeleteBill}
        onClearAll={handleClearAllBills}
      />

      {/* 4. Full Admin Panel */}
      <AdminPanel
        isOpen={showAdminPanel}
        onClose={() => setShowAdminPanel(false)}
        adminSettings={adminSettings}
        onUpdateAdminSettings={handleUpdateAdminSettings}
        blacklist={blacklist}
        onUpdateBlacklist={handleUpdateBlacklist}
        customers={customers}
        onUpdateCustomers={handleUpdateCustomers}
        bills={bills}
        onDeleteBill={handleDeleteBill}
        onClearAllBills={handleClearAllBills}
        currentShopProfile={shopProfile}
      />

      {/* 5. Secret Admin Login Dialog */}
      {showAdminPinPrompt && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-stone-900 border-2 border-amber-400 rounded-2xl p-5 max-w-xs w-full text-center">
            <h3 className="font-black text-amber-400 mb-2">ایڈمن سیکیورٹی لاگ ان</h3>
            <p className="text-xs text-stone-300 mb-3">اپنا ایڈمن پن کوڈ درج کریں:</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAdminVerifyAndOpen(adminPinInput);
              }}
              className="space-y-3"
            >
              <input
                type="password"
                placeholder="786050"
                value={adminPinInput}
                onChange={(e) => setAdminPinInput(e.target.value)}
                className="w-full py-2 px-3 bg-stone-950 border border-amber-500 rounded-lg text-center text-amber-300 font-mono font-bold tracking-widest text-lg focus:outline-none"
                autoFocus
              />
              {adminPinError && <p className="text-xs text-red-400">{adminPinError}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs"
                >
                  اوپن کریں
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminPinPrompt(false);
                    setAdminPinError('');
                  }}
                  className="py-2 px-3 bg-stone-800 text-stone-400 rounded-lg text-xs"
                >
                  بند کریں
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
