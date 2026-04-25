"use client";

import { useState, useEffect } from "react";
import { Users, Check, X, FileSearch, AlertCircle, ShieldCheck, Pencil, Trash2, Ban, Unlock, UserMinus } from "lucide-react";
import { useRouter } from "next/navigation";
import ModalConfirmacao from "../equipamentos/ModalConfirmacao";
import ModalEditarUsuario from "./ModalEditarUsuario";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  ra: string;
  role: string;
  status: string; // 'PENDENTE', 'ATIVO', 'BLOQUEADO'
  comprovanteMatricula: string;
  curso?: { nome: string };
  createdAt: string;
}

export default function GestaoUsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  
  // Controle de 3 Abas
  const [abaAtiva, setAbaAtiva] = useState<"pendentes" | "ativos" | "bloqueados">("pendentes");

  const [modalConfirmacaoAberto, setModalConfirmacaoAberto] = useState(false);
  const [modalEdicaoAberto, setModalEdicaoAberto] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(null);
  const [acao, setAcao] = useState<string>(""); 
  const [processando, setProcessando] = useState(false);

  const router = useRouter();

  // Agora buscamos TODOS os usuários e o React filtra localmente nas abas
  const buscarUsuarios = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("labcontrol_token");
      const response = await fetch("http://localhost:3000/usuarios", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) {
        if (response.status === 401) return router.push("/");
        throw new Error("Erro ao carregar lista de usuários.");
      }

      const data = await response.json();
      setUsuarios(data);
    } catch (err: unknown) {
      if (err instanceof Error) setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarUsuarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // FILTRO LOCAL DAS 3 ABAS
  const usuariosExibidos = usuarios.filter(user => {
    if (abaAtiva === "pendentes") return user.status === "PENDENTE";
    if (abaAtiva === "ativos") return user.status === "ATIVO";
    if (abaAtiva === "bloqueados") return user.status === "BLOQUEADO";
    return false;
  });

  const abrirModalConfirmacao = (user: Usuario, tipoAcao: string) => {
    setUsuarioSelecionado(user);
    setAcao(tipoAcao);
    setModalConfirmacaoAberto(true);
  };

  const abrirComprovante = (path?: string) => {
    if (!path || path === "null" || path === "undefined" || path.trim() === "") {
      setAcao("erro_comprovante");
      setModalConfirmacaoAberto(true);
      return;
    }
    window.open(`http://localhost:3000/${path.replace(/\\/g, '/')}`, '_blank');
  };

  const executarAcao = async () => {
    if (acao === "erro_comprovante") return setModalConfirmacaoAberto(false);
    
    if (!usuarioSelecionado) return;
    setProcessando(true);

    try {
      const token = localStorage.getItem("labcontrol_token");
      let url = "";
      let method = "";

      if (acao === "aprovar") {
        url = `http://localhost:3000/usuarios/${usuarioSelecionado.id}/aprovar`;
        method = "PATCH";
      } else if (acao === "bloquear" || acao === "desbloquear") {
        url = `http://localhost:3000/usuarios/${usuarioSelecionado.id}/status`;
        method = "PATCH";
      } else {
        url = `http://localhost:3000/usuarios/${usuarioSelecionado.id}`;
        method = "DELETE";
      }

      const response = await fetch(url, { method, headers: { "Authorization": `Bearer ${token}` }});
      if (!response.ok) throw new Error(`Erro ao executar ação.`);

      setModalConfirmacaoAberto(false);
      buscarUsuarios(); // Recarrega a lista
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
    } finally {
      setProcessando(false);
    }
  };

  const getPropsModal = () => {
    switch (acao) {
      case "aprovar": return { titulo: "Aprovar Usuário", msg: `Deseja liberar o acesso para ${usuarioSelecionado?.nome}?`, textoBotao: "Sim, Aprovar", tipo: "success" as const };
      case "rejeitar": return { titulo: "Rejeitar Cadastro", msg: `Deseja excluir a solicitação de ${usuarioSelecionado?.nome}?`, textoBotao: "Sim, Rejeitar", tipo: "danger" as const };
      case "deletar": return { titulo: "Deletar Usuário", msg: `Deseja deletar ${usuarioSelecionado?.nome} permanentemente da base?`, textoBotao: "Sim, Deletar", tipo: "danger" as const };
      case "bloquear": return { titulo: "Bloquear Acesso", msg: `Deseja inativar a conta de ${usuarioSelecionado?.nome}? Ele perderá o acesso imediatamente.`, textoBotao: "Sim, Bloquear", tipo: "danger" as const };
      case "desbloquear": return { titulo: "Desbloquear Acesso", msg: `Deseja reativar a conta de ${usuarioSelecionado?.nome}?`, textoBotao: "Sim, Desbloquear", tipo: "success" as const };
      case "erro_comprovante": return { titulo: "Arquivo Não Encontrado", msg: "Este usuário não possui um comprovante válido anexado no sistema.", textoBotao: "Entendi", tipo: "info" as const };
      default: return { titulo: "", msg: "", textoBotao: "Confirmar", tipo: "info" as const };
    }
  };

  const modalProps = getPropsModal();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-500" /> Gestão de Usuários
          </h1>
        </div>
      </div>

      {/* AS 3 ABAS */}
      <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl w-full sm:w-fit">
        <button 
          onClick={() => setAbaAtiva("ativos")}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-colors ${abaAtiva === "ativos" ? "bg-white dark:bg-slate-800 text-blue-600 shadow-sm" : "text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800/50"}`}
        >
          <Users className="w-4 h-4" /> Ativos
        </button>
        <button 
          onClick={() => setAbaAtiva("pendentes")}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-colors ${abaAtiva === "pendentes" ? "bg-white dark:bg-slate-800 text-blue-600 shadow-sm" : "text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800/50"}`}
        >
          <ShieldCheck className="w-4 h-4" /> Pendentes
        </button>
        <button 
          onClick={() => setAbaAtiva("bloqueados")}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-colors ${abaAtiva === "bloqueados" ? "bg-white dark:bg-slate-800 text-red-600 shadow-sm" : "text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800/50"}`}
        >
          <UserMinus className="w-4 h-4" /> Bloqueados
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden min-h-[300px]">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Carregando...</div>
        ) : erro ? (
          <div className="p-8 text-center text-red-500 flex flex-col items-center"><AlertCircle className="w-10 h-10 mb-2 opacity-50" />{erro}</div>
        ) : usuariosExibidos.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-slate-500 font-medium">Nenhum registro encontrado nesta categoria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 text-sm text-slate-500 uppercase tracking-wider">
                  <th className="p-4 font-semibold w-1/3">Usuário</th>
                  <th className="p-4 font-semibold">Curso / Perfil</th>
                  <th className="p-4 font-semibold text-center">Status</th>
                  <th className="p-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {usuariosExibidos.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 dark:text-white">{user.nome}</span>
                        <span className="text-xs text-slate-500">{user.email} | RA: {user.ra}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-600">{user.curso?.nome || "-"}</span>
                        <span className={`text-xs font-bold mt-1 ${user.role === 'ADMIN' ? 'text-purple-600' : user.role === 'SUPERVISOR' ? 'text-blue-600' : user.role === 'PROFESSOR' ? 'text-indigo-600' : 'text-slate-400'}`}>
                          {user.role}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      {user.status === "PENDENTE" && <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">Pendente</span>}
                      {user.status === "ATIVO" && <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">Ativo</span>}
                      {user.status === "BLOQUEADO" && <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">Bloqueado</span>}
                    </td>
                    <td className="p-4 text-right">
                      {/* BOTOES BASEADOS NO STATUS */}
                      <div className="flex items-center justify-end gap-2">
                        {user.status === "PENDENTE" && (
                          <>
                            <button onClick={() => abrirComprovante(user.comprovanteMatricula)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Ver PDF"><FileSearch className="w-5 h-5" /></button>
                            <button onClick={() => abrirModalConfirmacao(user, "aprovar")} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded" title="Aprovar"><Check className="w-5 h-5" /></button>
                            <button onClick={() => abrirModalConfirmacao(user, "rejeitar")} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Rejeitar"><X className="w-5 h-5" /></button>
                          </>
                        )}

                        {(user.status === "ATIVO" || user.status === "BLOQUEADO") && (
                          <>
                            <button onClick={() => { setUsuarioSelecionado(user); setModalEdicaoAberto(true); }} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded" title="Editar"><Pencil className="w-4 h-4" /></button>
                            
                            {user.status === "ATIVO" ? (
                              <button onClick={() => abrirModalConfirmacao(user, "bloquear")} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded" title="Bloquear Acesso"><Ban className="w-4 h-4" /></button>
                            ) : (
                              <button onClick={() => abrirModalConfirmacao(user, "desbloquear")} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded" title="Liberar Acesso"><Unlock className="w-4 h-4" /></button>
                            )}
                            
                            <button onClick={() => abrirModalConfirmacao(user, "deletar")} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Excluir"><Trash2 className="w-4 h-4" /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ModalEditarUsuario isOpen={modalEdicaoAberto} onClose={() => setModalEdicaoAberto(false)} onSuccess={() => { setModalEdicaoAberto(false); buscarUsuarios(); }} usuario={usuarioSelecionado} />
      <ModalConfirmacao isOpen={modalConfirmacaoAberto} onClose={() => setModalConfirmacaoAberto(false)} onConfirm={executarAcao} titulo={modalProps.titulo} mensagem={modalProps.msg} textoBotao={modalProps.textoBotao} tipo={modalProps.tipo} loading={processando} />
    </div>
  );
}