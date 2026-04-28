"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

export default function DashboardPage() {
  const [eqStats, setEqStats] = useState({ normal: 0, manutencao: 0, quebrado: 0 });
  const [resEqStats, setResEqStats] = useState({ confirmadas: 0, pendentes: 0 });
  const [resLocStats, setResLocStats] = useState({ confirmadas: 0, pendentes: 0 });
  const [aulaStats, setAulaStats] = useState({ confirmadas: 0, canceladas: 0 });
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  // Agenda State
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [agendaItems, setAgendaItems] = useState<any[]>([]);
  const [agendaLoading, setAgendaLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("labcontrol_token");
        if (!token) return;

        const headers = { "Authorization": `Bearer ${token}` };
        const baseUrl = "http://localhost:3000";

        const [eqRes, resEqRes, resLocRes, aulaRes] = await Promise.all([
          fetch(`${baseUrl}/equipamentos/stats`, { headers }),
          fetch(`${baseUrl}/reservas-equipamentos/stats`, { headers }),
          fetch(`${baseUrl}/reservas-locais/stats`, { headers }),
          fetch(`${baseUrl}/aulas/stats`, { headers }),
        ]);

        if (!eqRes.ok || !resEqRes.ok || !resLocRes.ok || !aulaRes.ok) {
          throw new Error("Erro ao carregar estatísticas");
        }

        setEqStats(await eqRes.json());
        setResEqStats(await resEqRes.json());
        setResLocStats(await resLocRes.json());
        setAulaStats(await aulaRes.json());
      } catch (err: any) {
        setErro(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    fetchAgenda();
  }, [selectedDate]);

  const fetchAgenda = async () => {
    setAgendaLoading(true);
    try {
      const token = localStorage.getItem("labcontrol_token");
      if (!token) return;

      const headers = { "Authorization": `Bearer ${token}` };
      const baseUrl = "http://localhost:3000";

      const dateString = selectedDate.toISOString().split('T')[0];

      const [eqAgendaRes, locAgendaRes] = await Promise.all([
        fetch(`${baseUrl}/reservas-equipamentos/agenda?date=${dateString}`, { headers }),
        fetch(`${baseUrl}/reservas-locais/agenda?date=${dateString}`, { headers }),
      ]);

      if (!eqAgendaRes.ok || !locAgendaRes.ok) {
        throw new Error("Erro ao carregar agenda");
      }

      const eqReservas = await eqAgendaRes.json();
      const locReservas = await locAgendaRes.json();

      // Merge and sort by time
      const allReservas = [...eqReservas, ...locReservas].sort((a, b) => {
        const timeA = a.horaInicio || "00:00";
        const timeB = b.horaInicio || "00:00";
        return timeA.localeCompare(timeB);
      });

      setAgendaItems(allReservas);
    } catch (err: any) {
      console.error("Agenda error:", err.message);
    } finally {
      setAgendaLoading(false);
    }
  };

  const changeDate = (offset: number) => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + offset);
      return newDate;
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR');
  };

  if (loading) return <div className="flex items-center justify-center h-screen text-slate-500">Carregando...</div>;
  if (erro) return <div className="flex items-center justify-center h-screen text-red-500">{erro}</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Visão Geral</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* COLUNA ESQUERDA: Resumos */}
        <div className="lg:col-span-4 space-y-6">

          {/* Card: Reservas de Locais */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4 border-b pb-2">Reservas de Locais</h2>
            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
              <span>Reservas Confirmadas: <strong>{resLocStats.confirmadas}</strong><br />
                Reservas Pendentes: <strong>{resLocStats.pendentes}</strong></span>
            </div>
          </div>

          {/* Card: Reservas de Equipamentos */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4 border-b pb-2">Reservas de Equipamentos</h2>
            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
              <span>Confirmadas: <strong>{resEqStats.confirmadas}</strong><br />
                Pendentes: <strong>{resEqStats.pendentes}</strong></span>
            </div>
          </div>

          {/* Card: Status de Equipamentos */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4 border-b pb-2">Status Equipamentos</h2>
            <div className="grid grid-cols-3 gap-2 mb-4 text-center">
              <div className="bg-emerald-50 rounded-lg p-2 border border-emerald-100">
                <p className="text-2xl font-bold text-emerald-600">{eqStats.normal}</p>
                <p className="text-xs text-emerald-800 font-medium">Normais</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-2 border border-amber-100">
                <p className="text-2xl font-bold text-amber-600">{eqStats.manutencao}</p>
                <p className="text-xs text-amber-800 font-medium">Manutenção</p>
              </div>
              <div className="bg-rose-50 rounded-lg p-2 border border-rose-100">
                <p className="text-2xl font-bold text-rose-600">{eqStats.quebrado}</p>
                <p className="text-xs text-rose-800 font-medium">Quebrados</p>
              </div>
            </div>
          </div>


          {/* Card: Aulas
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4 border-b pb-2">Aulas</h2>
            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
              <span>Confirmadas: <strong>{aulaStats.confirmadas}</strong></span>
              <span>Canceladas: <strong>{aulaStats.canceladas}</strong></span>
            </div>
          </div> */}

        </div>

        {/* COLUNA DIREITA: Agenda / Linha do Tempo */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-[600px]">

          {/* Cabeçalho da Agenda */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <button onClick={() => changeDate(-1)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500 dark:text-slate-400"><ChevronLeft /></button>
            <h3 className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-blue-500" />
              {formatDate(selectedDate)}
            </h3>
            <button onClick={() => changeDate(1)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500 dark:text-slate-400"><ChevronRight /></button>
          </div>

          {/* Lista de Reservas (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {agendaLoading ? (
              <div className="flex items-center justify-center h-full text-slate-500">Carregando agenda...</div>
            ) : agendaItems.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-500">Nenhuma reserva para esta data.</div>
            ) : (
              agendaItems.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                  <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 shadow-sm ${item.tipo === 'local' ? 'bg-amber-500' : 'bg-teal-500'}`}></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">
                      {/* [{item.tipo === 'local' ? `Local: ${item.local?.nome}` : `Equipamento: ${item.equipamento?.nome} (${item.equipamento?.patrimonio})`}] */}
                      [{item.tipo === 'local' ? `Local: ${item.local?.nome}` : `Equipamento: ${item.equipamento?.nome}`}]
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {/* [{item.solicitante?.id || 'N/A'} - {item.solicitante?.nome || 'Usuário'}] */}
                      Horário: {item.horaInicio} até {item.horaFim}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {/* [{item.solicitante?.id || 'N/A'} - {item.solicitante?.nome || 'Usuário'}] */}
                      {item.solicitante?.nome || 'Usuário'}
                    </p>
                    {/* <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      Das {item.horaInicio} até {item.horaFim}
                    </p> */}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
