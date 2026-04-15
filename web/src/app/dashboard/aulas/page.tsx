"use client";

import { useState, useEffect } from "react";
import { GraduationCap, Plus, AlertCircle, Clock, CalendarDays } from "lucide-react";
import { useRouter } from "next/navigation";
import ModalNovaAula from "./ModalNovaAula";

export default function AulasPage() {
  const [aulas, setAulas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [userRole, setUserRole] = useState<string>("");

  const router = useRouter();

  const buscarAulas = async () => {
    try {
      const token = localStorage.getItem("labcontrol_token");
      if (!token) return router.push("/");

      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserRole(payload.role);

      const response = await fetch("http://localhost:3000/aulas", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Falha ao carregar a grade de aulas");

      const data = await response.json();
      setAulas(data);
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarAulas();
  }, []);

  const getDiaSemana = (dia: number) => {
    const dias = ["", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];
    return dias[dia] || "Indefinido";
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-purple-500" /> Grade de Aulas
        </h1>
        
        {/* Apenas Gestores podem adicionar aulas na grade */}
        {(userRole === 'admin' || userRole === 'supervisor') && (
          <button onClick={() => setModalAberto(true)} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
            <Plus className="w-5 h-5" /> Nova Aula
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
           <div className="p-12 text-center text-slate-500"><div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>Carregando grade...</div>
        ) : erro ? (
          <div className="p-8 text-center text-red-500 flex flex-col items-center"><AlertCircle className="w-10 h-10 mb-2 opacity-50" />{erro}</div>
        ) : aulas.length === 0 ? (
          <div className="p-12 text-center text-slate-500">Nenhuma aula cadastrada no sistema.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 text-sm text-slate-500 uppercase tracking-wider">
                  <th className="p-4 font-semibold">Disciplina / Prof.</th>
                  <th className="p-4 font-semibold">Laboratório</th>
                  <th className="p-4 font-semibold">Período (Semestre)</th>
                  <th className="p-4 font-semibold">Dia da Semana</th>
                  <th className="p-4 font-semibold">Horário</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {aulas.map((aula) => (
                  <tr key={aula.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <div className="text-sm font-semibold text-slate-800 dark:text-white">{aula.disciplina?.nome || 'Disciplina N/A'}</div>
                      <div className="text-xs text-slate-500 mt-0.5">Prof. {aula.professor?.nome || 'N/A'}</div>
                    </td>
                    <td className="p-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                      {aula.local?.nome || 'Local N/A'}
                    </td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="w-4 h-4 text-slate-400" />
                        {new Date(aula.dataInicio).toLocaleDateString('pt-BR')} até {new Date(aula.dataFim).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-300 font-medium">
                      {getDiaSemana(aula.diaSemana)}
                    </td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {aula.horaInicio.slice(0, 5)} - {aula.horaFim.slice(0, 5)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ModalNovaAula 
        isOpen={modalAberto} 
        onClose={() => setModalAberto(false)} 
        onSuccess={() => { setModalAberto(false); buscarAulas(); }} 
      />
    </div>
  );
}