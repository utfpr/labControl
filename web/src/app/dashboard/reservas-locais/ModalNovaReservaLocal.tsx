"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalNovaReservaLocal({ isOpen, onClose, onSuccess }: ModalProps) {
  const [locais, setLocais] = useState<any[]>([]);
  const [localId, setLocalId] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [motivo, setMotivo] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (isOpen) {
      const fetchLocais = async () => {
        const token = localStorage.getItem("labcontrol_token");
        try {
          const response = await fetch("http://localhost:3000/locais", {
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (response.ok) {
            setLocais(await response.json());
          }
        } catch (error) {
          console.error("Erro ao buscar locais");
        }
      };
      fetchLocais();
    } else {
      setLocalId("");
      setDataInicio("");
      setDataFim("");
      setMotivo("");
      setErro("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const token = localStorage.getItem("labcontrol_token");

      const payload = {
        localId,
        dataInicio: new Date(dataInicio).toISOString(),
        dataFim: new Date(dataFim).toISOString(),
        motivo
      };

      const response = await fetch("http://localhost:3000/reservas-locais", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao solicitar reserva");
      }

      onSuccess();
    } catch (err: any) { 
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Reservar Laboratório</h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {erro && <div className="p-3 bg-red-50 text-red-700 text-sm rounded">{erro}</div>}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Laboratório / Local *</label>
            <select required value={localId} onChange={(e) => setLocalId(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-indigo-500">
              <option value="">Selecione o espaço...</option>
              {locais.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.nome}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Início *</label>
              <input type="datetime-local" required value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-indigo-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fim *</label>
              <input type="datetime-local" required value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-indigo-500 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Motivo da Reserva</label>
            <textarea rows={3} value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Defesa de TCC, Reposição de aula..." className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-indigo-500 resize-none"></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-70 transition-colors">
              {loading ? "Solicitando..." : "Solicitar Reserva"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}