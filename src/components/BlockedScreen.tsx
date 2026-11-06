import React, { useState } from 'react';
import { ShieldAlert, PhoneCall, MessageCircle, KeyRound } from 'lucide-react';

interface BlockedScreenProps {
  reason?: string;
  adminPhone: string;
  onAdminUnlock: (pin: string) => boolean;
}

export const BlockedScreen: React.FC<BlockedScreenProps> = ({
  reason,
  adminPhone,
  onAdminUnlock,
}) => {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAdminUnlock(pin)) {
      setError('');
    } else {
      setError('غلط ایڈمن کوڈ!');
    }
  };

  const whatsappLink = `https://wa.me/923329106002?text=${encodeURIComponent(
    'السلام علیکم محترم قدرت اللہ بھائی! میرا اکاؤنٹ یا ڈیوائس بلاک آ رہا ہے۔ برائے مہربانی بحال فرما دیں۔'
  )}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 via-emerald-950 to-stone-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-stone-900/90 border-2 border-red-500/80 rounded-2xl p-6 text-center shadow-2xl backdrop-blur-md">
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/40 animate-pulse">
          <ShieldAlert className="w-12 h-12 text-red-500" />
        </div>

        <h1 className="text-2xl font-black text-red-500 mb-2">
          آپ کا اکاؤنٹ / ڈیوائس بلاک ہے!
        </h1>

        <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-4 mb-5 text-sm text-red-200 leading-relaxed">
          <p className="font-semibold text-white mb-1">وجہ برائے بلاک:</p>
          <p>{reason || 'رجسٹریشن فیس یا سیکیورٹی تصدیق مکمل نہ ہونے کی وجہ سے رسائی منسوخ کر دی گئی ہے۔'}</p>
        </div>

        <p className="text-stone-300 text-sm mb-6 leading-relaxed">
          اکاؤنٹ کی دوبارہ بحالی اور مستقل رجسٹریشن کے لیے برائے مہربانی فوری ایڈمن سے رابطہ فرمائیں۔
        </p>

        <div className="space-y-3">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-lg shadow-emerald-900/30"
          >
            <MessageCircle className="w-5 h-5 text-white" />
            <span>واٹس ایپ پر رابطہ برائے بحالی</span>
          </a>

          <a
            href={`tel:${adminPhone}`}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium transition border border-stone-700"
          >
            <PhoneCall className="w-4 h-4 text-amber-400" />
            <span>کال کریں: {adminPhone}</span>
          </a>
        </div>

        {/* Discreet Admin Login */}
        <div className="mt-8 pt-4 border-t border-stone-800">
          {!showAdminLogin ? (
            <button
              onClick={() => setShowAdminLogin(true)}
              className="text-xs text-stone-500 hover:text-stone-300 transition flex items-center justify-center gap-1 mx-auto"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>ایڈمن سیکیورٹی لاگ ان</span>
            </button>
          ) : (
            <form onSubmit={handleAdminSubmit} className="space-y-2 mt-2">
              <input
                type="password"
                placeholder="ایڈمن کوڈ درج کریں"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full py-2 px-3 bg-stone-950 border border-amber-500/50 rounded-lg text-center text-amber-300 font-bold tracking-widest text-sm focus:outline-none focus:ring-1 focus:ring-amber-400"
                autoFocus
              />
              {error && <p className="text-xs text-red-400">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs"
                >
                  اوپن کریں
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdminLogin(false)}
                  className="py-1.5 px-3 bg-stone-800 hover:bg-stone-700 text-stone-400 rounded-lg text-xs"
                >
                  منسوخ
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
