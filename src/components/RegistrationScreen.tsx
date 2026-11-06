import React, { useState } from 'react';
import { Sparkles, ShieldCheck, HelpCircle, Lock, ArrowLeft } from 'lucide-react';
import { AdminSettings } from '../types';

interface RegistrationScreenProps {
  deviceId: string;
  adminSettings: AdminSettings;
  onRegister: (data: { name: string; phone: string; shopName: string }) => void;
  onAdminLoginClick: () => void;
}

export const RegistrationScreen: React.FC<RegistrationScreenProps> = ({
  deviceId,
  adminSettings,
  onRegister,
  onAdminLoginClick,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [shopName, setShopName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('براہ کرم اپنا نام درج فرمائیں۔');
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      setError('براہ کرم درست 11 ہندسوں کا موبائل نمبر درج فرمائیں۔');
      return;
    }
    setError('');
    onRegister({
      name: name.trim(),
      phone: phone.trim(),
      shopName: shopName.trim() || 'میری دکان و ٹمبر مارکیٹ',
    });
  };

  return (
    <div className="min-h-screen bg-radial from-[#0f3d2e] via-[#08241b] to-[#04130e] flex items-center justify-center p-3 sm:p-5">
      <div className="max-w-md w-full bg-stone-900/90 border-2 border-amber-400/80 rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-md">
        
        {/* Top Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/10 border border-amber-400/40 rounded-full text-amber-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>چک کیلکولیٹر پروفیشنل ایڈیشن</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-amber-400 tracking-wide">
            رجسٹریشن و سیکیورٹی فارم
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm mt-1">
            کیلکولیٹر کو مستقل استعمال کرنے کے لیے رجسٹریشن اور فیس ادائیگی لازمی ہے۔
          </p>
        </div>

        {/* Pricing & EasyPaisa Card */}
        <div className="bg-emerald-950/70 border border-amber-400/50 rounded-xl p-4 mb-5 text-center shadow-inner">
          <div className="flex justify-between items-center bg-stone-950/60 p-2.5 rounded-lg border border-amber-400/30 mb-3">
            <span className="text-stone-200 text-xs font-medium">رجسٹریشن فیس (ایک موبائل):</span>
            <span className="text-amber-400 font-extrabold text-base">
              {adminSettings.singleFee} روپے
            </span>
          </div>

          {/* Discount Offer */}
          <div className="bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-amber-500/20 border border-dashed border-amber-400/80 p-2.5 rounded-lg mb-3">
            <span className="text-amber-300 font-bold text-xs block mb-1">
              🎉 خصوصی ڈسکاؤنٹ آفر!
            </span>
            <p className="text-stone-200 text-xs leading-relaxed">
              اگر آپ دو دوست مل کر یا دو موبائل پر رجسٹر کرواتے ہیں تو دونوں کی مجموعی فیس صرف{' '}
              <span className="bg-amber-400 text-stone-950 font-black px-1.5 py-0.5 rounded text-xs">
                {adminSettings.pairFee} روپے
              </span>{' '}
              ہوگی!
            </p>
          </div>

          {/* EasyPaisa Details */}
          <div className="bg-stone-900/80 border border-emerald-500/40 p-3 rounded-lg text-right">
            <div className="flex items-center justify-between text-xs text-emerald-400 font-bold mb-1">
              <span>ایزی پیسہ اکاؤنٹ (EasyPaisa):</span>
              <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[11px]">
                آفیشل نمبر
              </span>
            </div>
            <div className="text-center my-1.5">
              <span className="text-lg font-black text-amber-300 tracking-wider font-mono">
                {adminSettings.easypaisaNumber}
              </span>
            </div>
            <div className="text-center text-xs text-stone-300">
              نام: <span className="font-bold text-white">{adminSettings.easypaisaName}</span>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {error && (
            <div className="p-2.5 bg-red-950/60 border border-red-500/60 rounded-lg text-red-200 text-xs text-center font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">
              👤 اپنا نام درج کریں:
            </label>
            <input
              type="text"
              placeholder="مثلاً: محمد عمران خان"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full py-2.5 px-3 bg-stone-950 border border-stone-700 focus:border-amber-400 rounded-lg text-white text-sm focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">
              📱 موبائل نمبر (جس پر واٹس ایپ ہو):
            </label>
            <input
              type="tel"
              placeholder="03001234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full py-2.5 px-3 bg-stone-950 border border-stone-700 focus:border-amber-400 rounded-lg text-white text-sm focus:outline-none font-mono text-left"
              dir="ltr"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-amber-300 mb-1 flex items-center justify-between">
              <span>🏢 آپ کی دکان / ٹمبر مارکیٹ کا نام:</span>
              <span className="text-[10px] text-stone-400 font-normal">(بل پر یہی پرنٹ ہوگا)</span>
            </label>
            <input
              type="text"
              placeholder="مثلاً: خان ٹمبر اینڈ چک سینٹر"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="w-full py-2.5 px-3 bg-stone-950 border border-amber-500/50 focus:border-amber-400 rounded-lg text-amber-200 text-sm focus:outline-none"
            />
          </div>

          {/* Device ID Display */}
          <div className="flex items-center justify-between p-2.5 bg-stone-950/60 border border-stone-800 rounded-lg text-xs">
            <span className="text-stone-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>آپ کی ڈیوائس آئی ڈی:</span>
            </span>
            <span className="font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
              {deviceId}
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black rounded-xl text-base transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 mt-4 cursor-pointer"
          >
            <span>فارم رجسٹر کریں اور کوڈ حاصل کریں</span>
            <ArrowLeft className="w-4 h-4 text-stone-950" />
          </button>
        </form>

        {/* Footer & Discreet Admin Login */}
        <div className="mt-5 pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
          <a
            href={`https://wa.me/${adminSettings.whatsappSupportNumber}?text=${encodeURIComponent(
              'السلام علیکم قدرت اللہ بھائی! مجھے رجسٹریشن کے بارے میں رہنمائی چاہیے۔'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-amber-300 transition flex items-center gap-1 text-[11px]"
          >
            <HelpCircle className="w-3 h-3 text-emerald-400" />
            <span>مدد برائے رجسٹریشن</span>
          </a>

          <button
            onClick={onAdminLoginClick}
            className="hover:text-amber-400 transition flex items-center gap-1 text-[11px] text-stone-500"
            title="ایڈمن لاگ ان"
          >
            <Lock className="w-3 h-3 text-stone-500" />
            <span>ایڈمن پینل</span>
          </button>
        </div>

      </div>
    </div>
  );
};
