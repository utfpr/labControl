"use client";

import { AlertTriangle, CheckCircle, Info, X } from "lucide-react";

interface ModalConfirmacaoProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  titulo: string;
  mensagem: string;
  loading?: boolean;
  textoBotao?: string; // 👈 Nova prop opcional
  tipo?: "danger" | "success" | "info"; // 👈 Nova prop opcional
}

export default function ModalConfirmacao({ 
  isOpen, 
  onClose, 
  onConfirm, 
  titulo, 
  mensagem, 
  loading = false,
  textoBotao = "Confirmar", // Valor padrão
  tipo = "danger" // Valor padrão para manter compatibilidade com as telas antigas
}: ModalConfirmacaoProps) {
  
  if (!isOpen) return null;

  // Define as cores e ícones baseados no tipo da ação
  const isDanger = tipo === "danger";
  const isSuccess = tipo === "success";

  const Icone = isDanger ? AlertTriangle : isSuccess ? CheckCircle : Info;
  
  const corIcone = isDanger ? "text-red-500" : isSuccess ? "text-emerald-500" : "text-blue-500";
  
  const corBotao = isDanger 
    ? "bg-red-600 hover:bg-red-700 focus:ring-red-500" 
    : isSuccess 
    ? "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
    : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800">
        
        <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Icone className={`w-6 h-6 ${corIcone}`} />
            {titulo}
          </h2>
          <button onClick={onClose} disabled={loading} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            {mensagem}
          </p>
        </div>

        <div className="flex justify-end gap-3 p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <button 
            type="button" 
            onClick={onClose} 
            disabled={loading} 
            className="px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button 
            type="button" 
            onClick={onConfirm} 
            disabled={loading} 
            className={`px-5 py-2.5 text-sm font-medium text-white rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70 flex items-center gap-2 ${corBotao}`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processando...
              </span>
            ) : (
              textoBotao
            )}
          </button>
        </div>

      </div>
    </div>
  );
}