"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Monitor, FileText, MoreVertical, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import ModalNovoEquipamento from "./ModalNovoEquipamento";

// Definimos o formato dos dados que o NestJS vai nos devolver
interface Equipamento {
    id: string;
    nome: string;
    patrimonio: string;
    popCaminho?: string;
    local?: {
        id: string;
        nome: string;
    };
}

export default function EquipamentosPage() {
    const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState("");
    const router = useRouter();
    const [modalAberto, setModalAberto] = useState(false);

    // Função para buscar os dados na API
    const buscarEquipamentos = async () => {
        try {
            const token = localStorage.getItem("labcontrol_token");

            if (!token) {
                throw new Error("Sessão expirada. Faça login novamente.");
            }

            const response = await fetch("http://localhost:3000/equipamentos", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    router.push("/"); // Volta pro login se o token for inválido
                    return;
                }
                throw new Error("Falha ao carregar os equipamentos");
            }

            const data = await response.json();
            setEquipamentos(data);
        } catch (err: any) {
            setErro(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Executa a busca assim que a página carrega
    useEffect(() => {
        buscarEquipamentos();
    }, []);

    return (
        <div className="max-w-7xl mx-auto space-y-6">

            {/* Cabeçalho da Página */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Monitor className="w-6 h-6 text-blue-500" />
                        Equipamentos
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Gerencie o inventário e os Procedimentos Operacionais Padrão (POP).
                    </p>
                </div>

                {/* Botão de Novo Equipamento */}
                <button
                    onClick={() => setModalAberto(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
                    <Plus className="w-5 h-5" />
                    Adicionar Equipamento
                </button>
            </div>

            {/* Barra de Pesquisa */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Buscar por nome ou patrimônio..."
                    className="w-full bg-transparent border-none focus:outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400"
                />
            </div>

            {/* Área de Conteúdo (Loading, Erro ou Tabela) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">

                {loading ? (
                    <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        Carregando inventário...
                    </div>
                ) : erro ? (
                    <div className="p-8 text-center text-red-500 flex flex-col items-center">
                        <AlertCircle className="w-10 h-10 mb-2 opacity-50" />
                        {erro}
                    </div>
                ) : equipamentos.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                        <Monitor className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p className="text-lg font-medium">Nenhum equipamento cadastrado</p>
                        <p className="text-sm">Clique em "Novo Equipamento" para começar.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    <th className="p-4 font-semibold">Patrimônio</th>
                                    <th className="p-4 font-semibold">Equipamento</th>
                                    <th className="p-4 font-semibold">Local (Laboratório)</th>
                                    <th className="p-4 font-semibold text-center">Arquivo POP</th>
                                    <th className="p-4 font-semibold text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {equipamentos.map((eq) => (
                                    <tr key={eq.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="p-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                                            {eq.patrimonio}
                                        </td>
                                        <td className="p-4 text-sm font-semibold text-slate-800 dark:text-white">
                                            {eq.nome}
                                        </td>
                                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                                            {eq.local?.nome || <span className="text-slate-400 italic">Sem local</span>}
                                        </td>
                                        <td className="p-4 text-center">
                                            {eq.popCaminho ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                                                    <FileText className="w-3.5 h-3.5" /> PDF Anexado
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-medium">
                                                    Sem arquivo
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
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
                onSuccess={() => {
                    setModalAberto(false);
                    buscarEquipamentos(); // Recarrega a tabela automaticamente!
                }}
            />
        </div>
    );
}