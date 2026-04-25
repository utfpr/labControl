"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalNovaDisciplina({ isOpen, onClose, onSuccess }: ModalProps) {
  const [professores, setProfessores] = useState<any[]>([]);
  const [nome, setNome] = useState("");
  const [responsavelId, setResponsavelId] = useState("");

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (isOpen) {
      const fetchProfessores = async () => {
        const token = localStorage.getItem("labcontrol_token");
        try {
          const response = await fetch("http://localhost:3000/usuarios", {
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            // Filtramos apenas supervisores e professores ativos para aparecerem na lista
            setProfessores(data.filter((u: any) => u.status === 'ATIVO' && (u.role === 'professor' || u.role === 'supervisor')));
          }
        } catch (error) {
          setErro("Erro ao buscar a lista de responsáveis.");
        }
      };
      fetchProfessores();
    } else {
      setNome("");
      setResponsavelId("");
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

      const payload = { nome, responsavelId };

      const response = await fetch("http://localhost:3000/disciplinas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Erro ao cadastrar disciplina");

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
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Cadastrar Disciplina</h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {erro && <div className="p-3 bg-red-50 text-red-700 text-sm rounded">{erro}</div>}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome da Disciplina *</label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Banco de Dados I"
              className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-teal-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Professor Responsável *</label>
            <select required value={responsavelId} onChange={(e) => setResponsavelId(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-teal-500">
              <option value="">Selecione o professor...</option>
              {professores.map(p => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg disabled:opacity-70 transition-colors">
              {loading ? "Salvando..." : "Salvar Disciplina"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}