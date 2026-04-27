"use client";

import { useState, useEffect } from "react";
import { Plus, Monitor, Pencil, Trash2, AlertCircle, FileText, Search, ArrowUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import ModalNovoEquipamento from "./ModalNovoEquipamento";
import ModalConfirmacao from "./ModalConfirmacao";
import { useTableOperations } from "@/hooks/useTableOperations";

interface Equipamento {
  id: string;
  nome: string;
  patrimonio: string;
  status: string;
  arquivoPop?: string;
  local?: { id: string; nome: string; };
  curso?: { id: string; nome: string; };
}

export default function EquipamentosPage() {
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const [modalAberto, setModalAberto] = useState(false);
  const [equipamentoEditando, setEquipamentoEditando] = useState<Equipamento | null>(null);

  const [modalExclusaoAberto, setModalExclusaoAberto] = useState(false);
  const [equipamentoSelecionado, setEquipamentoSelecionado] = useState<{ id: string, nome: string } | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  // Controle do Modal de Aviso (Para quando o POP não existe)
  const [modalInfoAberto, setModalInfoAberto] = useState(false);
  const [modalInfoProps, setModalInfoProps] = useState({ titulo: "", msg: "" });

  const {
    searchTerm,
    setSearchTerm,
    sortConfig,
    requestSort,
    filteredAndSortedData: dataList
  } = useTableOperations(equipamentos);

  const router = useRouter();

  const buscarEquipamentos = async () => {
    try {
      const token = localStorage.getItem("labcontrol_token");
      if (!token) throw new Error("Sessão expirada. Faça login novamente.");

      const response = await fetch("http://localhost:3000/equipamentos", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) {
        if (response.status === 401) return router.push("/");
        throw new Error("Falha ao carregar os equipamentos");
      }

      const data = await response.json();
      setEquipamentos(data);
    } catch (err: unknown) {
      if (err instanceof Error) setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarEquipamentos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const abrirModalNovo = () => {
    setEquipamentoEditando(null);
    setModalAberto(true);
  };

  const abrirModalEditar = (equipamento: Equipamento) => {
    setEquipamentoEditando(equipamento);
    setModalAberto(true);
  };

  // Função para abrir o arquivo ou exibir o alerta
  const baixarPop = (path?: string) => {
    if (!path || path === "null" || path.trim() === "") {
      setModalInfoProps({
        titulo: "POP não disponível",
        msg: "Este equipamento ainda não possui um Procedimento Operacional Padrão cadastrado em sua ficha."
      });
      setModalInfoAberto(true);
      return;
    }
    window.open(`http://localhost:3000/${path.replace(/\\/g, '/')}`, '_blank');
  };

  const confirmarExclusao = async () => {
    if (!equipamentoSelecionado) return;

    setExcluindo(true);
    try {
      const token = localStorage.getItem("labcontrol_token");
      const response = await fetch(`http://localhost:3000/equipamentos/${equipamentoSelecionado.id}`, {
        method: 'DELETE',
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Erro ao excluir equipamento");

      setModalExclusaoAberto(false);
      setEquipamentoSelecionado(null);
      buscarEquipamentos();
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
            <Monitor className="w-6 h-6 text-blue-500" /> Equipamentos
          </h1>
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar equipamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:border-blue-500 text-slate-900 dark:text-white transition-all"
            />
          </div>
        </div>

        <button onClick={abrirModalNovo} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
          <Plus className="w-5 h-5" /> Novo
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>Carregando...</div>
        ) : erro ? (
          <div className="p-8 text-center text-red-500 flex flex-col items-center"><AlertCircle className="w-10 h-10 mb-2 opacity-50" />{erro}</div>
        ) : equipamentos.length === 0 ? (
          <div className="p-12 text-center text-slate-500">Nenhum equipamento cadastrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 text-sm text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-4 font-semibold cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors" onClick={() => requestSort('patrimonio')}>
                    <div className="flex items-center gap-1">
                      Patrimônio {sortConfig?.key === 'patrimonio' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </div>
                  </th>
                  <th className="p-4 font-semibold cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors" onClick={() => requestSort('nome')}>
                    <div className="flex items-center gap-1">
                      Nome {sortConfig?.key === 'nome' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </div>
                  </th>
                  <th className="p-4 font-semibold cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors" onClick={() => requestSort('local.nome')}>
                    <div className="flex items-center gap-1">
                      Local {sortConfig?.key === 'local.nome' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </div>
                  </th>
                  <th className="p-4 font-semibold text-center">POP</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {dataList.map((eq) => (
                  <tr key={eq.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-300">{eq.patrimonio}</td>
                    <td className="p-4 text-sm font-semibold text-slate-800 dark:text-white">{eq.nome}</td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{eq.local?.nome || "-"}</td>
                    
                    {/* Coluna do POP */}
                    <td className="p-4 text-center">
                      {eq.arquivoPop ? (
                        <button 
                          onClick={() => baixarPop(eq.arquivoPop)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded transition-colors"
                          title="Baixar Procedimento (PDF)"
                        >
                          <FileText className="w-5 h-5" />
                        </button>
                      ) : (
                        <span className="p-1.5 text-slate-300 dark:text-slate-600 inline-block" title="POP não disponível">
                          <FileText className="w-5 h-5 opacity-50" />
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${eq.status === 'normal' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        eq.status === 'quebrado' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                        {eq.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => abrirModalEditar(eq)}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setEquipamentoSelecionado({ id: eq.id, nome: eq.nome });
                            setModalExclusaoAberto(true);
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors"
                          title="Excluir"
                        >
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

      <ModalNovoEquipamento
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        onSuccess={() => { setModalAberto(false); buscarEquipamentos(); }}
        equipamento={equipamentoEditando}
      />

      <ModalConfirmacao
        isOpen={modalExclusaoAberto}
        onClose={() => setModalExclusaoAberto(false)}
        onConfirm={confirmarExclusao}
        titulo="Excluir Equipamento"
        mensagem={`Atenção! Você tem certeza que deseja excluir o equipamento "${equipamentoSelecionado?.nome}"? Esta ação não poderá ser desfeita.`}
        loading={excluindo}
        textoBotao="Sim, Excluir"
        tipo="danger"
      />

      {/* Modal de Aviso para POP Inexistente */}
      <ModalConfirmacao
        isOpen={modalInfoAberto}
        onClose={() => setModalInfoAberto(false)}
        onConfirm={() => setModalInfoAberto(false)}
        titulo={modalInfoProps.titulo}
        mensagem={modalInfoProps.msg}
        textoBotao="Entendi"
        tipo="info"
      />
    </div>
  );
}