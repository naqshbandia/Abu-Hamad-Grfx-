import React, { useState } from 'react';
import { Lock, KeyRound, MessageCircle, RotateCcw, ShieldCheck, ArrowRight } from 'lucide-react';
import { AdminSettings } from '../types';

interface LockScreenProps {
  userName: string;
  userPhone: string;
  deviceId: string;
  adminSettings: AdminSettings;
  onUnlock: (code: string) => { success: boolean; isAdmin: boolean };
  onReset: () => void;
  onAdminLoginClick: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({
  userName,
  userPhone,
  deviceId,
  adminSettings,
  onUnlock,
  onReset,
  onAdminLoginClick,
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('براہ کرم کوپن کوڈ درج کریں۔');
      return;
    }
    const res = onUnlock(code.trim());
    if (!res.success) {
      setError('غلط کوڈ! براہ کرم درست ایکٹیویشن کوڈ حاصل کریں۔');
    }
  };

  const whatsappMessage = `السلام علیکم محترم قدرت اللہ بھائی!%0Aمیں نے رجسٹریشن کر لی ہے۔%0Aنام: ${encodeURIComponent(
    userName || 'کسٹمر'
  )}%0Aنمبر: ${encodeURIComponent(userPhone || '')}%0Aڈیوائس آئی ڈی: ${deviceId}%0Aبرائے مہربانی میرا ایکٹیویشن کوڈ فراہم فرما دیں۔`;

  const whatsappUrl = `https://wa.me/${adminSettings.whatsappSupportNumber}?text=${whatsappMessage}`;

  return (
    <div className="min-h-screen bg-radial from-[#0f3d2e] via-[#08241b] to-[#04130e] flex items-center justify-center p-3 sm:p-5">
      <div className="max-w-md w-full bg-stone-900/90 border-2 border-amber-400/80 rounded-2xl p-6 text-center shadow-2xl backdrop-blur-md">
        
        {/* Lock Icon */}
        <div className="w-16 h-16 bg-amber-400/10 border border-amber-400/40 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/10">
          <Lock className="w-8 h-8 text-amber-400" />
        </div>

        <h1 className="text-2xl font-black text-amber-400 mb-1">
          سیکیورٹی ان لاک
        </h1>
        <p className="text-stone-300 text-xs sm:text-sm mb-5">
          محترم <span className="text-amber-300 font-bold">{userName || 'کسٹمر'}</span>! اپنا ایکٹیویشن کوڈ درج کریں۔
        </p>

        {/* User Info Capsule */}
        <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-3 mb-5 text-xs text-stone-300 flex items-center justify-between">
          <div className="text-right">
            <span className="text-stone-400 block text-[11px]">موبائل نمبر:</span>
            <span className="font-mono text-amber-300 font-bold" dir="ltr">{userPhone || '---'}</span>
          </div>
          <div className="text-left">
            <span className="text-stone-400 block text-[11px]">ڈیوائس آئی ڈی:</span>
            <span className="font-mono text-emerald-400 font-bold">{deviceId}</span>
          </div>
        </div>

        {/* Code Input Form */}
        <form onSubmit={handleUnlockSubmit} className="space-y-3">
          {error && (
            <div className="p-2.5 bg-red-950/60 border border-red-500/60 rounded-lg text-red-300 text-xs font-semibold">
              {error}
            </div>
          )}

          <div>
            <input
              type="text"
              placeholder="Coupon Code / کوڈ درج کریں"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (error) setError('');
              }}
              className="w-full py-3.5 px-4 bg-stone-950 border-2 border-amber-400/60 focus:border-amber-400 rounded-xl text-center text-amber-300 font-black text-xl tracking-widest focus:outline-none shadow-inner"
              autoFocus
            />
            <p className="text-[11px] text-stone-400 mt-1">
              (کوپن کوڈ یا ایڈمن ماسٹر پن درج کریں)
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black rounded-xl text-base transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <KeyRound className="w-5 h-5 text-stone-950" />
            <span>ان لاک کریں</span>
          </button>
        </form>

        {/* Action Buttons */}
        <div className="mt-5 space-y-2.5">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow"
          >
            <MessageCircle className="w-4 h-4 text-white" />
            <span>📱 واٹس ایپ سے فوری کوڈ حاصل کریں</span>
          </a>

          <button
            onClick={() => {
              if (window.confirm('کیا آپ واقعی دوبارہ نئی رجسٹریشن کرنا چاہتے ہیں؟')) {
                onReset();
              }
            }}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-stone-950/60 hover:bg-stone-800 text-stone-400 hover:text-stone-200 rounded-lg text-xs font-medium transition border border-stone-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>دوبارہ رجسٹریشن کریں</span>
          </button>
        </div>

        {/* Subtle Admin Link */}
        <div className="mt-6 pt-3 border-t border-stone-800/80 flex justify-center">
          <button
            onClick={onAdminLoginClick}
            className="text-[11px] text-stone-500 hover:text-amber-400 transition flex items-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ایڈمن مینیجر رسائی</span>
          </button>
        </div>

      </div>
    </div>
  );
};
