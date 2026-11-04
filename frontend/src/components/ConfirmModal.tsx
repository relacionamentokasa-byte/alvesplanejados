import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  const isDanger = variant === 'danger';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-white rounded-2xl border border-[#E8E2D9] shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2.5 rounded-xl ${isDanger ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                {isDanger ? <Trash2 size={22} /> : <AlertTriangle size={22} />}
              </div>
              <h3 className="font-sans text-lg font-bold text-[#1B1410]">{title}</h3>
            </div>
            <button
              onClick={onCancel}
              disabled={loading}
              className="text-[#9B9087] hover:text-[#231B15] p-1 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <p className="text-sm text-[#6E645C] leading-relaxed">
            {message}
          </p>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#E8E2D9]">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-[#6E645C] hover:text-[#1B1410] bg-[#FAF8F5] hover:bg-[#F2EFEB] rounded-xl border border-[#E8E2D9] transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`px-4 py-2 text-xs font-semibold rounded-xl text-white shadow-sm transition-all flex items-center space-x-2 ${
                isDanger
                  ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-300'
                  : 'bg-[#C5A265] hover:bg-[#DFC28B] text-[#1B1410] disabled:opacity-50'
              }`}
            >
              {loading && (
                <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              )}
              <span>{loading ? 'Processando...' : confirmLabel}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
