"use client";

import { useState, useEffect } from "react";
import { BookOpen, Plus, AlertCircle, BookText, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import ModalNovaDisciplina from "./ModalNovaDisciplina";
import { useTableOperations } from "@/hooks/useTableOperations";

export default function DisciplinasPage() {
  const [disciplinas, setDisciplinas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [userRole, setUserRole] = useState<string>("");

  const {
    searchTerm,
    setSearchTerm,
    sortConfig,
    requestSort,
    filteredAndSortedData: dataList
  } = useTableOperations(disciplinas);

  const router = useRouter();

  const buscarDisciplinas = async () => {
    try {
      const token = localStorage.getItem("labcontrol_token");
      if (!token) return router.push("/");

      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserRole(payload.role);

      const response = await fetch("http://localhost:3000/disciplinas", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Falha ao carregar as disciplinas");

      const data = await response.json();
      setDisciplinas(data);
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarDisciplinas();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <BookText className="w-6 h-6 text-teal-500" /> Disciplinas
          </h1>
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar disciplina..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:border-blue-500 text-slate-900 dark:text-white transition-all"
            />
          </div>
        </div>

        {(userRole === 'admin' || userRole === 'supervisor') && (
          <button onClick={() => setModalAberto(true)} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
            <Plus className="w-5 h-5" /> Nova Disciplina
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
           <div className="p-12 text-center text-slate-500"><div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>Carregando...</div>
        ) : erro ? (
          <div className="p-8 text-center text-red-500 flex flex-col items-center"><AlertCircle className="w-10 h-10 mb-2 opacity-50" />{erro}</div>
        ) : disciplinas.length === 0 ? (
          <div className="p-12 text-center text-slate-500">Nenhuma disciplina cadastrada no sistema.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 text-sm text-slate-500 uppercase tracking-wider">
                  <th className="p-4 font-semibold cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors" onClick={() => requestSort('nome')}>
                    <div className="flex items-center gap-1">
                      Nome da Disciplina {sortConfig?.key === 'nome' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </div>
                  </th>
                  <th className="p-4 font-semibold cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors" onClick={() => requestSort('responsavel.nome')}>
                    <div className="flex items-center gap-1">
                      Professor Responsável {sortConfig?.key === 'responsavel.nome' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </div>
                  </th>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {dataList.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <div className="text-sm font-semibold text-slate-800 dark:text-white">{d.nome}</div>
                    </td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                      {d.responsavel?.nome || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ModalNovaDisciplina 
        isOpen={modalAberto} 
        onClose={() => setModalAberto(false)} 
        onSuccess={() => { setModalAberto(false); buscarDisciplinas(); }} 
      />
    </div>
  );
}