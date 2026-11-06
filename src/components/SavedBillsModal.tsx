import React, { useState } from 'react';
import { Archive, Search, Trash2, Eye, Printer, X, FileText, Calendar, User, Phone } from 'lucide-react';
import { BillRecord } from '../types';

interface SavedBillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bills: BillRecord[];
  onViewBill: (bill: BillRecord) => void;
  onDeleteBill: (id: string) => void;
  onClearAll: () => void;
}

export const SavedBillsModal: React.FC<SavedBillsModalProps> = ({
  isOpen,
  onClose,
  bills,
  onViewBill,
  onDeleteBill,
  onClearAll,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredBills = bills.filter((b) => {
    const term = searchTerm.toLowerCase();
    return (
      b.billNo.toLowerCase().includes(term) ||
      (b.customerName || '').toLowerCase().includes(term) ||
      (b.customerPhone || '').includes(term) ||
      (b.chakType || '').toLowerCase().includes(term) ||
      (b.date || '').includes(term)
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-stone-900 border-2 border-amber-400 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-800 bg-stone-950/80 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Archive className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-amber-400 text-base">
              محفوظ شدہ بلز کی فہرست ({bills.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Clear all */}
        <div className="p-4 bg-stone-900/90 border-b border-stone-800 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="بل نمبر، کسٹمر نام، فون یا تاریخ سے تلاش کریں..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 pr-9 pl-3 bg-stone-950 border border-stone-700 focus:border-amber-400 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none"
            />
          </div>
          {bills.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('کیا آپ واقعی تمام محفوظ شدہ بلز ڈیلیٹ کرنا چاہتے ہیں؟')) {
                  onClearAll();
                }
              }}
              className="text-xs text-red-400 hover:text-red-300 flex items-center justify-center gap-1 py-2 px-3 bg-red-950/40 hover:bg-red-900/50 border border-red-500/30 rounded-xl transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>تمام ریکارڈ صاف کریں</span>
            </button>
          )}
        </div>

        {/* Bills List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {filteredBills.length === 0 ? (
            <div className="text-center py-12 text-stone-400">
              <FileText className="w-12 h-12 text-stone-600 mx-auto mb-2 opacity-50" />
              <p className="font-medium">کوئی محفوظ شدہ بل نہیں ملا۔</p>
              <p className="text-xs text-stone-500 mt-1">
                کیلکولیٹر سے "بل محفوظ کریں" دبانے پر تمام بل یہاں محفوظ رہیں گے۔
              </p>
            </div>
          ) : (
            filteredBills.map((b) => (
              <div
                key={b.id}
                className="bg-stone-950/80 border border-stone-800 hover:border-amber-400/50 rounded-xl p-3.5 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-amber-400 text-sm bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                      #{b.billNo}
                    </span>
                    <span className="font-bold text-white text-sm">
                      {b.customerName || 'عام گاہک'}
                    </span>
                    <span className="text-[11px] bg-stone-800 text-stone-300 px-2 py-0.5 rounded font-medium">
                      {b.chakType}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-400">
                    {b.customerPhone && (
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-stone-500" />
                        {b.customerPhone}
                      </span>
                    )}
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3 text-stone-500" />
                      {b.date} {b.time}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs pt-1">
                    <span className="text-stone-300">
                      کل فٹواری: <strong className="text-amber-300 font-mono">{b.grandTotal}</strong>
                    </span>
                    <span className="text-stone-300">
                      سینکڑے: <strong className="text-amber-300 font-mono">{b.grandHundred}</strong>
                    </span>
                    <span className="text-emerald-400 font-black font-mono">
                      مبلغ: Rs. {b.finalTotalAmount.toLocaleString()} /-
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center border-t sm:border-t-0 border-stone-800 pt-2 sm:pt-0 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => onViewBill(b)}
                    className="flex items-center gap-1 py-1.5 px-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs transition shadow"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>دیکھیں / پرنٹ</span>
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`کیا آپ بل #${b.billNo} کو مستقل حذف کرنا چاہتے ہیں؟`)) {
                        onDeleteBill(b.id);
                      }
                    }}
                    className="p-1.5 text-stone-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition"
                    title="حذف کریں"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-950/80 rounded-b-2xl border-t border-stone-800 text-left">
          <button
            onClick={onClose}
            className="py-1.5 px-4 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs font-semibold transition"
          >
            بند کریں
          </button>
        </div>

      </div>
    </div>
  );
};
