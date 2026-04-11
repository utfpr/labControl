"use client";

import { X, AlertTriangle } from "lucide-react";

interface ModalConfirmacaoProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  titulo: string;
  mensagem: string;
  loading?: boolean;
}

export default function ModalConfirmacao({
  isOpen,
  onClose,
  onConfirm,
  titulo,
  mensagem,
  loading = false,
}: ModalConfirmacaoProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            {titulo}
          </h2>
          <button 
            onClick={onClose}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo */}
        <div className="p-5">
          <p className="text-slate-600 dark:text-slate-300 text-sm">
            {mensagem}
          </p>
        </div>

        {/* Rodapé */}
        <div className="flex justify-end gap-3 p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-70 flex items-center gap-2"
          >
            {loading ? "Excluindo..." : "Sim, Excluir"}
          </button>
        </div>
      </div>
    </div>
  );
}