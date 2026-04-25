"use client";

import { useState, useEffect } from "react";
import { X, UserCog } from "lucide-react";

interface UsuarioData {
  id: string;
  nome: string;
  ra: string;
  role: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  usuario: UsuarioData | null;
}

export default function ModalEditarUsuario({ isOpen, onClose, onSuccess, usuario }: ModalProps) {
  const [nome, setNome] = useState("");
  const [ra, setRa] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (isOpen && usuario) {
      setNome(usuario.nome);
      setRa(usuario.ra);
      setRole(usuario.role);
      setErro("");
    }
  }, [isOpen, usuario]);

  if (!isOpen || !usuario) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro("");

    try {
      const token = localStorage.getItem("labcontrol_token");
      const response = await fetch(`http://localhost:3000/usuarios/${usuario.id}`, {
        method: "PATCH",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ nome, ra, role }),
      });

      if (!response.ok) throw new Error("Erro ao salvar usuário");
      onSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <UserCog className="w-5 h-5 text-blue-500" /> Editar Usuário
          </h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {erro && <div className="p-3 bg-red-50 text-red-700 text-sm rounded">{erro}</div>}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome</label>
            <input type="text" required value={nome} onChange={(e) => setNome(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg outline-none focus:border-blue-500 text-slate-900 dark:text-white" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">RA / Matrícula</label>
            <input type="text" required value={ra} onChange={(e) => setRa(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg outline-none focus:border-blue-500 text-slate-900 dark:text-white" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Permissão de Acesso</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg outline-none focus:border-blue-500 text-slate-900 dark:text-white">
              <option value="ALUNO">Aluno (Acesso Padrão)</option>
              <option value="PROFESSOR">Professor (Acesso Docente)</option>
              <option value="SUPERVISOR">Supervisor (Gere Reservas e Aprovações)</option>
              <option value="ADMIN">Administrador (Acesso Total)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400">Cancelar</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg">
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}