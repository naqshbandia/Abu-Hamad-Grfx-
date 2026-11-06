import React, { useState } from 'react';
import { Store, X, Check, MapPin, Phone, User, Award, FileText } from 'lucide-react';
import { ShopProfile } from '../types';

interface ShopSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: ShopProfile;
  onSave: (updated: ShopProfile) => void;
}

export const ShopSettingsModal: React.FC<ShopSettingsModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onSave,
}) => {
  const [profile, setProfile] = useState<ShopProfile>({ ...currentProfile });
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(profile);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-stone-900 border-2 border-amber-400 rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-400/10 border border-amber-400/30 rounded-xl text-amber-400">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-amber-400">
                میری دکان و کاروبار کی پروفائل
              </h2>
              <p className="text-xs text-stone-300">
                یہ تمام تفصیلات آپ کے ہر پرنٹ شدہ بل اور سلپ پر نمایاں ہوں گی
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Bill Header Preview */}
        <div className="mb-5 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 p-3.5 rounded-xl border border-white shadow-md text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-black/10 px-2 py-0.5 rounded inline-block mb-1">
            بل ہیڈر پری ویو (Bill Header Preview)
          </span>
          <h3 className="text-xl font-black tracking-wide">
            {profile.shopName || 'آپ کی دکان کا نام'}
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-xs font-bold mt-1 text-stone-900">
            {profile.proprietor && <span>پروپرائٹر: {profile.proprietor}</span>}
            {profile.phone && <span>فون: {profile.phone}</span>}
            {profile.city && <span>مقام: {profile.city}</span>}
          </div>
          {profile.tagline && (
            <p className="text-[11px] font-semibold mt-1 border-t border-black/15 pt-1 text-stone-800">
              {profile.tagline}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-amber-400" />
              <span>دکان / ٹمبر مارکیٹ / آرا مشین کا نام: *</span>
            </label>
            <input
              type="text"
              value={profile.shopName}
              onChange={(e) => setProfile({ ...profile, shopName: e.target.value })}
              placeholder="مثلاً: خان ٹمبر اینڈ چک ڈیلرز"
              className="w-full py-2.5 px-3 bg-stone-950 border border-stone-700 focus:border-amber-400 rounded-lg text-amber-200 text-sm focus:outline-none font-bold"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>پروپرائٹر / مالک کا نام:</span>
              </label>
              <input
                type="text"
                value={profile.proprietor}
                onChange={(e) => setProfile({ ...profile, proprietor: e.target.value })}
                placeholder="مثلاً: حاجی عمران خان"
                className="w-full py-2.5 px-3 bg-stone-950 border border-stone-700 focus:border-amber-400 rounded-lg text-white text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>دکان کا فون / موبائل:</span>
              </label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="0300-1234567"
                className="w-full py-2.5 px-3 bg-stone-950 border border-stone-700 focus:border-amber-400 rounded-lg text-white text-sm focus:outline-none font-mono text-left"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>پتہ / شہر / مارکیٹ:</span>
            </label>
            <input
              type="text"
              value={profile.city}
              onChange={(e) => setProfile({ ...profile, city: e.target.value })}
              placeholder="مثلاً: لکڑی مارکیٹ، بنوں روڈ، لکی مروت"
              className="w-full py-2.5 px-3 bg-stone-950 border border-stone-700 focus:border-amber-400 rounded-lg text-white text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>بل پر اضافی جملہ یا سلوگن:</span>
            </label>
            <input
              type="text"
              value={profile.tagline}
              onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
              placeholder="مثلاً: ہر قسم کے ناڑی، کانا و پشاوری چک دستیاب ہیں"
              className="w-full py-2.5 px-3 bg-stone-950 border border-stone-700 focus:border-amber-400 rounded-lg text-white text-sm focus:outline-none"
            />
          </div>

          {savedSuccess && (
            <div className="p-2.5 bg-emerald-950 border border-emerald-500 rounded-lg text-emerald-300 text-xs text-center font-bold flex items-center justify-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>دکان کی معلومات کامیابی سے محفوظ ہو گئیں!</span>
            </div>
          )}

          <div className="flex gap-2.5 pt-2">
            <button
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black rounded-xl text-sm transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>محفوظ کریں اور بل پر لاگو کریں</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-sm font-semibold transition"
            >
              بند کریں
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
