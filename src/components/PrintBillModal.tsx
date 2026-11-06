import React, { useRef } from 'react';
import { Printer, X, Share2, Download, CheckCircle, FileSpreadsheet } from 'lucide-react';
import { BillRecord } from '../types';

interface PrintBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: BillRecord | null;
}

export const PrintBillModal: React.FC<PrintBillModalProps> = ({
  isOpen,
  onClose,
  bill,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !bill) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    let text = `*${bill.shopDetails.shopName || 'چک و ٹمبر مارکیٹ'}*%0A`;
    if (bill.shopDetails.phone) text += `فون: ${bill.shopDetails.phone}%0A`;
    text += `--------------------------------%0A`;
    text += `*بل نمبر:* ${bill.billNo}%0A`;
    text += `*کسٹمر نام:* ${bill.customerName || 'عام گاہک'}%0A`;
    if (bill.customerPhone) text += `*موبائل:* ${bill.customerPhone}%0A`;
    text += `*چک قسم:* ${bill.chakType}%0A`;
    text += `*تاریخ:* ${bill.date}  *وقت:* ${bill.time}%0A`;
    text += `--------------------------------%0A`;
    text += `*تفصیل چک:*%0A`;
    
    bill.items.forEach((item, idx) => {
      text += `${idx + 1}) سائز ${item.size} x کٹنگ ${item.cutting} | تعداد: ${item.qty} => فٹواری: ${item.rowTotal} (${item.hundred} سینکڑے)%0A`;
    });

    text += `--------------------------------%0A`;
    text += `*کل فٹواری:* ${bill.grandTotal}%0A`;
    text += `*کل سینکڑے:* ${bill.grandHundred}%0A`;
    if (bill.rateFotwari > 0) {
      text += `*فٹواری ریٹ:* ${bill.rateFotwari} => رقم: Rs. ${bill.fotwariAmount.toLocaleString()}%0A`;
    }
    if (bill.rateHundred > 0) {
      text += `*سینکڑے ریٹ:* ${bill.rateHundred} => رقم: Rs. ${bill.hundredAmount.toLocaleString()}%0A`;
    }
    text += `*صاف کل رقم:* Rs. ${bill.finalTotalAmount.toLocaleString()}/-%0A`;
    text += `--------------------------------%0A`;
    text += `شکریہ برائے خریداری!`;

    const cleanPhone = bill.customerPhone ? bill.customerPhone.replace(/\D/g, '') : '';
    const phoneParam = cleanPhone.length >= 10 ? (cleanPhone.startsWith('92') ? cleanPhone : `92${cleanPhone.slice(-10)}`) : '';
    const url = phoneParam ? `https://wa.me/${phoneParam}?text=${text}` : `https://api.whatsapp.com/send?text=${text}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-stone-900 border-2 border-amber-400 rounded-2xl w-full max-w-xl shadow-2xl relative my-auto">
        
        {/* Modal Top Bar (Hidden in Print) */}
        <div className="no-print flex items-center justify-between p-4 border-b border-stone-800 bg-stone-950/80 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-amber-400 text-base">
              بل سلپ پری ویو و پرنٹ
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsAppShare}
              className="flex items-center gap-1.5 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow"
              title="گاہک کے واٹس ایپ پر بھیجیں"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>واٹس ایپ شیئر</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 py-1.5 px-3 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-lg text-xs font-bold transition shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>پرنٹ / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Bill Paper Content */}
        <div className="p-4 sm:p-6 bg-white text-stone-950 rounded-b-2xl font-sans" id="printable-bill" ref={printRef}>
          
          {/* Shop Header (Customer's Own Shop Name) */}
          <div className="text-center border-b-2 border-stone-900 pb-3 mb-3">
            <div className="text-xs text-stone-700 font-semibold mb-0.5">بِسْمِ اللَّهِ الرَّحْمٰنِ الرَّحِيمِ</div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900">
              {bill.shopDetails.shopName || 'میری دکان و ٹمبر مارکیٹ'}
            </h1>
            <div className="flex flex-wrap justify-center items-center gap-x-3 text-xs font-bold text-stone-800 mt-1">
              {bill.shopDetails.proprietor && <span>پروپرائٹر: {bill.shopDetails.proprietor}</span>}
              {bill.shopDetails.phone && <span dir="ltr">فون: {bill.shopDetails.phone}</span>}
              {bill.shopDetails.city && <span>مقام: {bill.shopDetails.city}</span>}
            </div>
            {bill.shopDetails.tagline && (
              <p className="text-[11px] text-stone-600 italic mt-0.5">{bill.shopDetails.tagline}</p>
            )}
          </div>

          {/* Invoice Meta Grid */}
          <div className="bg-stone-100 p-2.5 rounded-lg border border-stone-300 grid grid-cols-2 text-xs gap-y-1.5 mb-3 font-medium">
            <div>
              <span className="text-stone-600 font-normal">بل نمبر: </span>
              <span className="font-bold font-mono text-stone-950">#{bill.billNo}</span>
            </div>
            <div className="text-left" dir="ltr">
              <span className="text-stone-600 font-normal">Date: </span>
              <span className="font-bold">{bill.date} {bill.time}</span>
            </div>
            <div>
              <span className="text-stone-600 font-normal">کسٹمر کا نام: </span>
              <span className="font-bold text-stone-950">{bill.customerName || 'عام گاہک'}</span>
            </div>
            <div className="text-left" dir="ltr">
              <span className="text-stone-600 font-normal">Mobile: </span>
              <span className="font-bold font-mono">{bill.customerPhone || '---'}</span>
            </div>
            <div className="col-span-2 border-t border-stone-300 pt-1 flex justify-between items-center text-xs">
              <span className="text-stone-700">چک کی قسم: <strong className="text-stone-950">{bill.chakType}</strong></span>
              <span className="text-[11px] bg-stone-200 px-2 py-0.5 rounded font-mono font-bold">
                ٹوٹل آئٹمز: {bill.items.length}
              </span>
            </div>
          </div>

          {/* Table of items */}
          <table className="w-full text-xs text-center border-collapse border border-stone-900 mb-3">
            <thead>
              <tr className="bg-stone-900 text-white font-bold">
                <th className="border border-stone-900 py-1.5 px-1">نمبر</th>
                <th className="border border-stone-900 py-1.5 px-1">سائز</th>
                <th className="border border-stone-900 py-1.5 px-1">کٹنگ</th>
                <th className="border border-stone-900 py-1.5 px-1">تعداد (تھان)</th>
                <th className="border border-stone-900 py-1.5 px-1 bg-stone-800">فٹواری</th>
                <th className="border border-stone-900 py-1.5 px-1 bg-stone-800">سینکڑے</th>
              </tr>
            </thead>
            <tbody>
              {bill.items.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                  <td className="border border-stone-400 py-1 px-1 font-mono">{index + 1}</td>
                  <td className="border border-stone-400 py-1 px-1 font-bold">{item.size}</td>
                  <td className="border border-stone-400 py-1 px-1">{item.cutting}</td>
                  <td className="border border-stone-400 py-1 px-1 font-bold font-mono">{item.qty}</td>
                  <td className="border border-stone-400 py-1 px-1 font-bold font-mono bg-stone-100">{item.rowTotal}</td>
                  <td className="border border-stone-400 py-1 px-1 font-mono text-stone-700">{item.hundred}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-stone-200 font-black border-t-2 border-stone-900">
                <td colSpan={4} className="border border-stone-400 py-1.5 text-right px-3">
                  مجموعی کل (Grand Total)
                </td>
                <td className="border border-stone-400 py-1.5 font-mono text-stone-950 font-black bg-stone-300 text-sm">
                  {bill.grandTotal}
                </td>
                <td className="border border-stone-400 py-1.5 font-mono text-stone-950 font-black bg-stone-300 text-sm">
                  {bill.grandHundred}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Rates and Amounts Summary Card */}
          <div className="border border-stone-400 rounded-lg p-2.5 bg-stone-50 mb-3 text-xs space-y-1.5">
            {bill.rateFotwari > 0 && (
              <div className="flex justify-between items-center text-stone-800">
                <span>فٹواری ریٹ: {bill.rateFotwari} روپے فی فٹواری</span>
                <span className="font-bold font-mono text-stone-950">
                  {bill.grandTotal} × {bill.rateFotwari} = Rs. {bill.fotwariAmount.toLocaleString()}
                </span>
              </div>
            )}
            {bill.rateHundred > 0 && (
              <div className="flex justify-between items-center text-stone-800">
                <span>سینکڑے ریٹ: {bill.rateHundred} روپے فی سینکڑہ</span>
                <span className="font-bold font-mono text-stone-950">
                  {bill.grandHundred} × {bill.rateHundred} = Rs. {bill.hundredAmount.toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-stone-400 text-sm font-black text-stone-950">
              <span className="text-base">صاف کل رقم (Net Total):</span>
              <span className="text-lg font-black text-emerald-800 font-mono">
                Rs. {bill.finalTotalAmount.toLocaleString()} /-
              </span>
            </div>
          </div>

          {/* Signature & Seal Footer */}
          <div className="pt-6 flex justify-between items-end text-xs text-stone-600 border-t border-stone-300 mt-4">
            <div className="text-center">
              <div className="w-28 border-b border-stone-400 mb-1"></div>
              <span>دستخط خریدار / گاہک</span>
            </div>
            <div className="text-center">
              <div className="w-28 border-b border-stone-400 mb-1"></div>
              <span>دستخط پروپرائٹر / مہر</span>
            </div>
          </div>

          {/* Software attribution subtle footnote */}
          <div className="mt-4 pt-2 border-t border-stone-200 text-center text-[10px] text-stone-500">
            Powered by AbuHamad GRFX • برائے رابطہ و سافٹ ویئر: 03329106002
          </div>

        </div>

        {/* Modal Bottom Actions */}
        <div className="no-print p-4 bg-stone-950/80 rounded-b-2xl border-t border-stone-800 flex justify-between items-center">
          <span className="text-xs text-stone-400">
            پرنٹ بٹن دبائیں یا براہ راست گاہک کو واٹس ایپ پر ارسال کریں۔
          </span>
          <button
            onClick={onClose}
            className="py-2 px-4 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-bold transition"
          >
            بند کریں
          </button>
        </div>

      </div>
    </div>
  );
};
