"use client";

import { useState, useEffect } from "react";
import { X, Upload, FileText } from "lucide-react";

interface EquipamentoData {
  id: string;
  nome: string;
  patrimonio: string;
  status?: string;
  curso?: { id: string };
  local?: { id: string };
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  equipamento?: EquipamentoData | null; // 👈 Saiu o "any"
}

export default function ModalNovoEquipamento({ isOpen, onClose, onSuccess, equipamento }: ModalProps) {
  const [nome, setNome] = useState("");
  const [patrimonio, setPatrimonio] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [status, setStatus] = useState("normal");
  const [cursoId, setCursoId] = useState("");
  const [localId, setLocalId] = useState("");
  const [cursos, setCursos] = useState<{ id: string; nome: string }[]>([]);
  const [locais, setLocais] = useState<{ id: string; nome: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (isOpen) {
      // Busca as listas
      const fetchDependencias = async () => {
        const token = localStorage.getItem("labcontrol_token");
        try {
          const [resCursos, resLocais] = await Promise.all([
            fetch("http://localhost:3000/cursos", { headers: { Authorization: `Bearer ${token}` } }),
            fetch("http://localhost:3000/locais", { headers: { Authorization: `Bearer ${token}` } })
          ]);
          if (resCursos.ok) setCursos(await resCursos.json());
          if (resLocais.ok) setLocais(await resLocais.json());
        } catch (error) {
          console.error("Erro ao buscar dependências:", error);
        }
      };
      fetchDependencias();

      // Se for edição, preenche o formulário
      if (equipamento) {
        setNome(equipamento.nome);
        setPatrimonio(equipamento.patrimonio);
        setStatus(equipamento.status || "normal");
        setCursoId(equipamento.curso?.id || "");
        setLocalId(equipamento.local?.id || "");
      }
    } else {
      // Limpa os dados quando fecha
      setNome("");
      setPatrimonio("");
      setStatus("normal");
      setCursoId("");
      setLocalId("");
      setArquivo(null);
      setErro("");
    }
  }, [isOpen, equipamento]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    if (!cursoId || !localId) {
      setErro("Por favor, selecione o Curso e o Local.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("labcontrol_token");
      const formData = new FormData();
      formData.append("nome", nome);
      formData.append("patrimonio", patrimonio);
      formData.append("status", status);
      formData.append("cursoId", cursoId);
      formData.append("localId", localId);

      if (arquivo) formData.append("file", arquivo);

      // Lógica crucial: Se tem id, é edição (PATCH). Se não, é criação (POST)
      const url = equipamento
        ? `http://localhost:3000/equipamentos/${equipamento.id}`
        : `http://localhost:3000/equipamentos`;

      const method = equipamento ? "PATCH" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        const mensagemErro = Array.isArray(data.message) ? data.message.join(", ") : data.message;
        throw new Error(mensagemErro || "Erro ao salvar equipamento");
      }

      onSuccess();
    } catch (err: unknown) { // 👈 Saiu o "any", entrou o "unknown"
      if (err instanceof Error) {
        setErro(err.message);
      } else {
        setErro("Erro inesperado ao salvar o equipamento.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            {equipamento ? "Editar Equipamento" : "Novo Equipamento"}
          </h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {erro && <div className="p-3 bg-red-50 text-red-700 text-sm rounded">{erro}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome *</label>
              <input type="text" required value={nome} onChange={(e) => setNome(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-blue-500" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Patrimônio *</label>
              <input type="text" required value={patrimonio} onChange={(e) => setPatrimonio(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-3 sm:col-span-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status *</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-blue-500">
                <option value="normal">Normal</option>
                <option value="em manutencao">Em Manutenção</option>
                <option value="quebrado">Quebrado</option>
              </select>
            </div>
            <div className="col-span-3 sm:col-span-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Curso *</label>
              <select required value={cursoId} onChange={(e) => setCursoId(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-blue-500">
                <option value="">Selecione...</option>
                {cursos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div className="col-span-3 sm:col-span-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Local *</label>
              <select required value={localId} onChange={(e) => setLocalId(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-blue-500">
                <option value="">Selecione...</option>
                {locais.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Substituir POP (Opcional)</label>
            <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {arquivo ? (
                  <p className="text-sm font-medium text-blue-500"><FileText className="inline w-4 h-4 mr-1" /> {arquivo.name}</p>
                ) : (
                  <p className="text-sm text-slate-500"><Upload className="inline w-4 h-4 mr-1" /> Clique para novo PDF</p>
                )}
              </div>
              <input type="file" className="hidden" accept=".pdf" onChange={(e) => { if (e.target.files?.[0]) setArquivo(e.target.files[0]); }} />
            </label>
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