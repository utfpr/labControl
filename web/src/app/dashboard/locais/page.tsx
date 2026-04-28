"use client";

import { useState, useEffect } from "react";
import { Plus, MapPin, Pencil, Trash2, AlertCircle, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import ModalNovoLocal from "./ModalNovoLocal";
import ModalConfirmacao from "../equipamentos/ModalConfirmacao"; // Reaproveitando nosso modal elegante!
import { useTableOperations } from "@/hooks/useTableOperations";

interface Local {
  id: string;
  nome: string;
  descricao?: string;
}

export default function LocaisPage() {
  const [locais, setLocais] = useState<Local[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  
  const [modalAberto, setModalAberto] = useState(false);
  const [localEditando, setLocalEditando] = useState<Local | null>(null);

  const [modalExclusaoAberto, setModalExclusaoAberto] = useState(false);
  const [localSelecionado, setLocalSelecionado] = useState<{id: string, nome: string} | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const {
    searchTerm,
    setSearchTerm,
    sortConfig,
    requestSort,
    filteredAndSortedData: dataList
  } = useTableOperations(locais);

  const router = useRouter();

  const buscarLocais = async () => {
    try {
      const token = localStorage.getItem("labcontrol_token");
      if (!token) throw new Error("Sessão expirada. Faça login novamente.");

      const response = await fetch("http://localhost:3000/locais", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) {
        if (response.status === 401) return router.push("/");
        throw new Error("Falha ao carregar os locais");
      }

      const data = await response.json();
      setLocais(data);
    } catch (err: unknown) {
      if (err instanceof Error) setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarLocais();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const confirmarExclusao = async () => {
    if (!localSelecionado) return;
    
    setExcluindo(true);
    try {
      const token = localStorage.getItem("labcontrol_token");
      const response = await fetch(`http://localhost:3000/locais/${localSelecionado.id}`, {
        method: 'DELETE',
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Erro ao excluir local. Verifique se existem equipamentos vinculados a ele.");
      
      setModalExclusaoAberto(false);
      setLocalSelecionado(null);
      buscarLocais();
    } catch (error: unknown) {
      if (error instanceof Error) alert(error.message);
    } finally {
      setExcluindo(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-500" /> Locais e Laboratórios
          </h1>
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar local..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:border-blue-500 text-slate-900 dark:text-white transition-all"
            />
          </div>
        </div>
        <button onClick={() => { setLocalEditando(null); setModalAberto(true); }} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
          <Plus className="w-5 h-5" /> Novo Local
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>Carregando...</div>
        ) : erro ? (
          <div className="p-8 text-center text-red-500 flex flex-col items-center"><AlertCircle className="w-10 h-10 mb-2 opacity-50" />{erro}</div>
        ) : locais.length === 0 ? (
          <div className="p-12 text-center text-slate-500">Nenhum local cadastrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 text-sm text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-4 font-semibold cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors" onClick={() => requestSort('nome')}>
                    <div className="flex items-center gap-1">
                      Sala / Nome {sortConfig?.key === 'nome' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </div>
                  </th>
                  <th className="p-4 font-semibold cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors" onClick={() => requestSort('descricao')}>
                    <div className="flex items-center gap-1">
                      Descrição {sortConfig?.key === 'descricao' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </div>
                  </th>
                  <th className="p-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {dataList.map((local) => (
                  <tr key={local.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 text-sm font-semibold text-slate-800 dark:text-white">{local.nome}</td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{local.descricao || "-"}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setLocalEditando(local); setModalAberto(true); }} className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded transition-colors" title="Editar">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setLocalSelecionado({ id: local.id, nome: local.nome }); setModalExclusaoAberto(true); }} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors" title="Excluir">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ModalNovoLocal 
        isOpen={modalAberto} 
        onClose={() => setModalAberto(false)} 
        onSuccess={() => { setModalAberto(false); buscarLocais(); }}
        local={localEditando}
      />

      <ModalConfirmacao
        isOpen={modalExclusaoAberto}
        onClose={() => setModalExclusaoAberto(false)}
        onConfirm={confirmarExclusao}
        titulo="Excluir Local"
        mensagem={`Atenção! Deseja excluir o local "${localSelecionado?.nome}"? Lembre-se: não é possível excluir locais que possuem equipamentos vinculados.`}
        loading={excluindo}
      />
    </div>
  );
}