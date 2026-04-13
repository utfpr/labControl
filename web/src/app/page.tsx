"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Lock, Mail, User, Hash, BookOpen, Upload,
  FileText, CheckCircle, Eye, EyeOff
} from "lucide-react";

// 👇 Configuração Global de Upload do Frontend
const MAX_UPLOAD_MB = 1;
const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

export default function LoginPage() {
  const router = useRouter();

  const [isRegistering, setIsRegistering] = useState(false);
  const [sucessoRegistro, setSucessoRegistro] = useState(false);

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  // Estados de Login
  const [emailLogin, setEmailLogin] = useState("");
  const [senhaLogin, setSenhaLogin] = useState("");
  const [showSenhaLogin, setShowSenhaLogin] = useState(false);

  // Estados de Registro
  const [nome, setNome] = useState("");
  const [emailReg, setEmailReg] = useState("");
  const [senhaReg, setSenhaReg] = useState("");
  const [confirmarSenhaReg, setConfirmarSenhaReg] = useState("");
  const [ra, setRa] = useState("");
  const [cursoId, setCursoId] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);

  // Estados de Visibilidade das Senhas no Registro
  const [showSenhaReg, setShowSenhaReg] = useState(false);
  const [showConfirmarReg, setShowConfirmarReg] = useState(false);

  const [cursos, setCursos] = useState<{ id: string; nome: string }[]>([]);

  useEffect(() => {
    if (isRegistering && cursos.length === 0) {
      fetch("http://localhost:3000/cursos")
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok || !Array.isArray(data)) throw new Error();
          return data;
        })
        .then(data => setCursos(data))
        .catch(() => setCursos([]));
    }
  }, [isRegistering, cursos.length]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailLogin, senha: senhaLogin }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "E-mail ou senha incorretos.");

      if (data.usuario) {
        if (data.usuario.status === 'PENDENTE') {
          throw new Error("Sua conta ainda aguarda aprovação da supervisão.");
        }
        if (data.usuario.status === 'BLOQUEADO') {
          throw new Error("O seu acesso ao sistema foi bloqueado. Procure a supervisão.");
        }
      }

      localStorage.setItem("labcontrol_token", data.access_token);
      router.push("/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    // Validações de Senha
    if (senhaReg.length < 6) return setErro("A senha deve ter no mínimo 6 caracteres.");
    if (senhaReg !== confirmarSenhaReg) return setErro("As senhas digitadas não coincidem.");

    if (!cursoId) return setErro("Selecione um curso.");
    if (!arquivo) return setErro("O comprovante de matrícula é obrigatório.");

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("nome", nome);
      formData.append("email", emailReg);
      formData.append("senha", senhaReg);
      formData.append("ra", ra);
      formData.append("cursoId", cursoId);
      formData.append("file", arquivo);

      const response = await fetch("http://localhost:3000/usuarios/registrar", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || "Erro ao criar conta.");

      setSucessoRegistro(true);
    } catch (err: unknown) {
      if (err instanceof Error) setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30 mb-4">
            <span className="text-2xl font-bold">LC</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">LabControl</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Fortalecendo a Transformação Digital no Paraná</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all">

          {sucessoRegistro ? (
            <div className="p-8 text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Solicitação Enviada!</h2>
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <p>
                  Seu registro e o comprovante de matrícula foram recebidos com sucesso pelo sistema.
                </p>
                <p>
                  Sua conta passará pela avaliação de um supervisor do laboratório. <strong>Assim que for aprovada, você receberá um e-mail de confirmação</strong> avisando que o seu acesso está liberado.
                </p>
              </div>
              <button
                onClick={() => { setSucessoRegistro(false); setIsRegistering(false); }}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition-colors"
              >
                Voltar para o Login
              </button>
            </div>
          ) : !isRegistering ? (
            /* LOGIN */
            <form onSubmit={handleLogin} className="p-8 space-y-5">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Acesse sua conta</h2>
              </div>

              {erro && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">{erro}</div>}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">E-mail Institucional</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Mail className="w-5 h-5" /></div>
                    <input type="email" required value={emailLogin} onChange={(e) => setEmailLogin(e.target.value)} className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl outline-none text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="seu.email@utfpr.edu.br" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Senha</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Lock className="w-5 h-5" /></div>
                    <input type={showSenhaLogin ? "text" : "password"} required value={senhaLogin} onChange={(e) => setSenhaLogin(e.target.value)} className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl outline-none text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="••••••••" />
                    <button type="button" onClick={() => setShowSenhaLogin(!showSenhaLogin)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                      {showSenhaLogin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition-colors disabled:opacity-70 mt-6">
                {loading ? "Entrando..." : "Entrar no Sistema"}
              </button>

              <div className="text-center pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Ainda não tem conta? <button type="button" onClick={() => setIsRegistering(true)} className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">Registre-se aqui</button>
                </p>
              </div>
            </form>
          ) : (
            /* REGISTRO */
            <form onSubmit={handleRegistro} className="p-8 space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Criar Conta</h2>
              </div>

              {erro && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">{erro}</div>}

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Nome Completo</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><User className="w-4 h-4" /></div>
                      <input type="text" required value={nome} onChange={(e) => setNome(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-blue-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">RA</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Hash className="w-4 h-4" /></div>
                      <input type="text" required value={ra} onChange={(e) => setRa(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-blue-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Curso</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><BookOpen className="w-4 h-4" /></div>
                      <select required value={cursoId} onChange={(e) => setCursoId(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-blue-500 appearance-none">
                        <option value="">Selecione...</option>
                        {cursos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">E-mail Institucional</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Mail className="w-4 h-4" /></div>
                    <input type="email" required value={emailReg} onChange={(e) => setEmailReg(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-blue-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Senha</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Lock className="w-4 h-4" /></div>
                      <input type={showSenhaReg ? "text" : "password"} required value={senhaReg} onChange={(e) => setSenhaReg(e.target.value)} className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-blue-500" />
                      <button type="button" onClick={() => setShowSenhaReg(!showSenhaReg)} className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                        {showSenhaReg ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Confirmar</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Lock className="w-4 h-4" /></div>
                      <input type={showConfirmarReg ? "text" : "password"} required value={confirmarSenhaReg} onChange={(e) => setConfirmarSenhaReg(e.target.value)} className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-white focus:border-blue-500" />
                      <button type="button" onClick={() => setShowConfirmarReg(!showConfirmarReg)} className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                        {showConfirmarReg ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  {/* 👇 Label reflete a variável automaticamente */}
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Comprovante (PDF, Máx: {MAX_UPLOAD_MB}MB)</label>
                  <label className="flex flex-col items-center justify-center w-full h-16 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 transition-colors">
                    <div className="flex flex-col items-center justify-center py-2">
                      {arquivo ? (
                        <p className="text-xs font-medium text-blue-500 truncate max-w-[150px]"><FileText className="inline w-3 h-3 mr-1" /> {arquivo.name}</p>
                      ) : (
                        <p className="text-xs text-slate-500"><Upload className="inline w-3 h-3 mr-1" /> Anexar PDF</p>
                      )}
                    </div>
                    {/* Validação dinâmica pelo tamanho definido */}
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".pdf" 
                      onChange={(e) => { 
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > MAX_UPLOAD_BYTES) {
                            setErro(`O comprovante deve ter no máximo ${MAX_UPLOAD_MB}MB.`);
                            setArquivo(null);
                          } else {
                            setErro("");
                            setArquivo(file);
                          }
                        }
                      }} 
                    />
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsRegistering(false)} className="w-1/3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 rounded-xl transition-colors">Voltar</button>
                <button type="submit" disabled={loading} className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition-colors disabled:opacity-70">
                  {loading ? "Enviando..." : "Registrar"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}