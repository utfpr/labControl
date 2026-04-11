"use client";

import { useState, useEffect } from "react";
import { X, BookOpen } from "lucide-react";

interface CursoData {
  id: string;
  nome: string;
  coordenador?: string; // 👈 Atualizado na interface
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  curso?: CursoData | null;
}

export default function ModalNovoCurso({ isOpen, onClose, onSuccess, curso }: ModalProps) {
  const [nome, setNome] = useState("");
  const [coordenador, setCoordenador] = useState(""); // 👈 Novo estado
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (curso) {
        setNome(curso.nome);
        setCoordenador(curso.coordenador || "");
      }
    } else {
      setNome("");
      setCoordenador("");
      setErro("");
    }
  }, [isOpen, curso]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const token = localStorage.getItem("labcontrol_token");
      
      const url = curso 
        ? `http://localhost:3000/cursos/${curso.id}`
        : `http://localhost:3000/cursos`;
      
      const method = curso ? "PATCH" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ nome, coordenador }), // 👈 Enviando o payload correto
      });

      const data = await response.json();

      if (!response.ok) {
        const mensagemErro = Array.isArray(data.message) ? data.message.join(", ") : data.message;
        throw new Error(mensagemErro || "Erro ao salvar curso");
      }

      onSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErro(err.message);
      } else {
        setErro("Ocorreu um erro inesperado.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            {curso ? "Editar Curso" : "Novo Curso"}
          </h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {erro && <div className="p-3 bg-red-50 text-red-700 text-sm rounded">{erro}</div>}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome do Curso *</label>
            <input 
              type="text" 
              required 
              value={nome} 
              onChange={(e) => setNome(e.target.value)} 
              className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-blue-500" 
              placeholder="Ex: Engenharia de Software" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Coordenador (Opcional)</label>
            <input 
              type="text" 
              value={coordenador} 
              onChange={(e) => setCoordenador(e.target.value)} 
              className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-blue-500" 
              placeholder="Ex: Prof. Dr. Alan Turing" 
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Cancelar</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-70">
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}