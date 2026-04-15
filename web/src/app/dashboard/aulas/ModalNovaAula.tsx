"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalNovaAula({ isOpen, onClose, onSuccess }: ModalProps) {
  const [disciplinas, setDisciplinas] = useState<any[]>([]);
  const [locais, setLocais] = useState<any[]>([]);
  const [professores, setProfessores] = useState<any[]>([]);

  // Campos do Formulário
  const [disciplinaId, setDisciplinaId] = useState("");
  const [localId, setLocalId] = useState("");
  const [professorId, setProfessorId] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [diaSemana, setDiaSemana] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFim, setHoraFim] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        const token = localStorage.getItem("labcontrol_token");
        const headers = { "Authorization": `Bearer ${token}` };

        try {
          // Busca os dados simultaneamente para preencher os selects
          const [resDisc, resLocais, resUsers] = await Promise.all([
            fetch("http://localhost:3000/disciplinas", { headers }),
            fetch("http://localhost:3000/locais", { headers }),
            fetch("http://localhost:3000/usuarios", { headers })
          ]);

          if (resDisc.ok) setDisciplinas(await resDisc.json());
          if (resLocais.ok) setLocais(await resLocais.json());
          
          if (resUsers.ok) {
            const users = await resUsers.json();
            // Filtramos para exibir idealmente quem pode dar aula (você pode ajustar a regra depois)
            setProfessores(users.filter((u: any) => u.status === 'ATIVO'));
          }
        } catch (error) {
          setErro("Erro ao carregar os dados de base.");
        }
      };
      fetchData();
    } else {
      // Limpa os campos ao fechar
      setDisciplinaId(""); setLocalId(""); setProfessorId("");
      setDataInicio(""); setDataFim(""); setDiaSemana("");
      setHoraInicio(""); setHoraFim(""); setErro("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const token = localStorage.getItem("labcontrol_token");

      // Adiciona os segundos para o TypeORM/Postgres não reclamar do formato 'time'
      const payload = {
        disciplinaId,
        localId,
        professorId,
        dataInicio,
        dataFim,
        diaSemana: Number(diaSemana),
        horaInicio: `${horaInicio}:00`,
        horaFim: `${horaFim}:00`
      };

      const response = await fetch("http://localhost:3000/aulas", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao cadastrar aula");
      }

      onSuccess();
    } catch (err: any) { 
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Alocar Nova Aula</h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {erro && <div className="p-3 bg-red-50 text-red-700 text-sm rounded">{erro}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Disciplina *</label>
              <select required value={disciplinaId} onChange={(e) => setDisciplinaId(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-purple-500">
                <option value="">Selecione a disciplina...</option>
                {disciplinas.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Laboratório *</label>
              <select required value={localId} onChange={(e) => setLocalId(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-purple-500">
                <option value="">Selecione o local...</option>
                {locais.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Professor Responsável *</label>
              <select required value={professorId} onChange={(e) => setProfessorId(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-purple-500">
                <option value="">Selecione o professor...</option>
                {professores.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Início do Semestre *</label>
              <input type="date" required value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-purple-500 text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fim do Semestre *</label>
              <input type="date" required value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-purple-500 text-sm" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Dia da Semana *</label>
              <select required value={diaSemana} onChange={(e) => setDiaSemana(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-purple-500">
                <option value="">Selecione o dia...</option>
                <option value="1">Segunda-feira</option>
                <option value="2">Terça-feira</option>
                <option value="3">Quarta-feira</option>
                <option value="4">Quinta-feira</option>
                <option value="5">Sexta-feira</option>
                <option value="6">Sábado</option>
                <option value="7">Domingo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Hora de Início *</label>
              <input type="time" required value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-purple-500 text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Hora de Fim *</label>
              <input type="time" required value={horaFim} onChange={(e) => setHoraFim(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-purple-500 text-sm" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-70 transition-colors">
              {loading ? "Salvando..." : "Alocar Aula"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}