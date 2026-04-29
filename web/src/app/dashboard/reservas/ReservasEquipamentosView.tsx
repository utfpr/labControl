"use client";

import React, { useState, useEffect, JSX } from "react";
import { CalendarDays, Plus, AlertCircle, CheckCircle, XCircle, Clock, CheckSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import ModalNovaReserva from "../reservas-equipamentos/ModalNovaReserva";

export function ReservasEquipamentosView() {
  const [reservas, setReservas] = useState<<anyany[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [userRole, setUserRole] = useState<<stringstring>("");

  const router = useRouter();

  const buscarReservas = async () => {
    try {
      const token = localStorage.getItem("labcontrol_token");
      if (!token) return router.push("/");

      const payload = JSON.parse(atob(token.split('.')[1]));
      const role = payload.role;
      setUserRole(role);

      const endpoint = (role === 'admin' || role === 'supervisor')
        ? "http://localhost:3000/reservas-equipamentos"
        : "http://localhost:3000/reservas-equipamentos/minhas";

      const response = await fetch(endpoint, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Falha ao carregar reservas");

      const data = await response.json();
      setReservas(data);
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarReservas();
  }, []);

  const alterarStatus = async (id: string, acao: 'aprovar' | 'rejeitar' | 'cancelar' | 'finalizar') => {
    try {
      const token = localStorage.getItem("labcontrol_token");
      const response = await fetch(`http://localhost:3000/reservas-equipamentos/${id}/${acao}`, {
        method: 'PATCH',
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro ao ${acao} reserva`);
      }
      buscarReservas();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<<stringstring, JSX.Element> = {
      'pendente': <<spanspan className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"><<ClockClock className="w-3 h-3"/> Pendente</span>,
      'aprovada': <<spanspan className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"><<CheckCheckCircle className="w-3 h-3"/> Aprovada</span>,
      'rejeitada': <<spanspan className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200"><<XXCircle className="w-3 h-3"/> Rejeitada</span>,
      'cancelada': <<spanspan className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-300"><<XXCircle className="w-3 h-3"/> Cancelada</span>,
      'finalizada': <<spanspan className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"><<CheckCheckSquare className="w-3 h-3"/> Finalizada</span>,
    };
    return badges[status] || <span>{status}</span>;
  };

  return (
    <<divdiv className="max-w-7xl mx-auto space-y-6">
      <<divdiv className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <<hh1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <<CalendarCalendarDays className="w-6 h-6 text-blue-500" /> Reservas de Equipamentos
        </h1>
        <<buttonbutton onClick={() => setModalAberto(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
          <<PlusPlus className="w-5 h-5" /> Nova Reserva
        </button>
      </div>

      <<divdiv className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
           <<divdiv className="p-12 text-center text-slate-500"><<divdiv className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>Carregando...</div>
        ) : erro ? (
          <<divdiv className="p-8 text-center text-red-500 flex flex-col items-center"><<AlertAlertCircle className="w-10 h-10 mb-2 opacity-50" />{erro}</div>
        ) : reservas.length === 0 ? (
          <<divdiv className="p-12 text-center text-slate-500">Nenhuma reserva encontrada.</div>
        ) : (
          <<divdiv className="overflow-x-auto">
            <<tabletable className="w-full text-left border-collapse">
              <thead>
                <<trtr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 text-sm text-slate-500 uppercase tracking-wider">
                  <<thth className="p-4 font-semibold">Equipamento</th>
                  {(userRole === 'admin' || userRole === 'supervisor') && <<thth className="p-4 font-semibold">Solicitante</th>}
                  <<thth className="p-4 font-semibold">Início</th>
                  <<thth className="p-4 font-semibold">Fim</th>
                  <<thth className="p-4 font-semibold">Status</th>
                  <<thth className="p-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <<tbodytbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {reservas.map((r) => (
                  <<trtr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <<tdtd className="p-4 text-sm font-semibold text-slate-800 dark:text-white">
                      {r.equipamento?.nome}
                      <<divdiv className="text-xs text-slate-500 font-normal mt-0.5">{r.equipamento?.patrimonio}</div>
                    </td>

                    {(userRole === 'admin' || userRole === 'supervisor') && (
                      <<tdtd className="p-4 text-sm text-slate-600 dark:text-slate-300">{r.solicitante?.nome}</td>
                    )}

                    <<tdtd className="p-4 text-sm text-slate-600 dark:text-slate-300">
                      {new Date(r.dataHoraInicio).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <<tdtd className="p-4 text-sm text-slate-600 dark:text-slate-300">
                      {new Date(r.dataHoraFim).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <<tdtd className="p-4">{getStatusBadge(r.status)}</td>
                    <<tdtd className="p-4 text-right">
                      <<divdiv className="flex items-center justify-end gap-2">
                        {(userRole === 'admin' || userRole === 'supervisor') && r.status === 'pendente' && (
                          <>
                            <<buttonbutton onClick={() => alterarStatus(r.id, 'aprovar')} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded" title="Aprovar"><<CheckCheckCircle className="w-5 h-5" /></button>
                            <<buttonbutton onClick={() => alterarStatus(r.id, 'rejeitar')} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded" title="Rejeitar"><<XXCircle className="w-5 h-5" /></button>
                          </>
                        )}
                        {(userRole === 'admin' || userRole === 'supervisor') && r.status === 'aprovada' && (
                          <<buttonbutton onClick={() => alterarStatus(r.id, 'finalizar')} className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded" title="Finalizar Devolução"><<CheckCheckSquare className="w-5 h-5" /></button>
                        )}

                        {userRole === 'comum' && r.status === 'pendente' && (
                          <<buttonbutton onClick={() => alterarStatus(r.id, 'cancelar')} className="text-xs text-red-600 font-medium hover:underline">Cancelar</button>
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

      <<ModalModalNovaReserva
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        onSuccess={() => { setModalAberto(false); buscarReservas(); }}
      />
    </div>
  );
}
