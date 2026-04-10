"use client";

import { ChevronLeft, ChevronRight, Activity, AlertCircle, Wrench, CalendarDays } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Visão Geral</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLUNA ESQUERDA: Resumos */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card: Equipamentos */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-700 mb-4 border-b pb-2">Equipamentos</h2>
            
            <div className="grid grid-cols-3 gap-2 mb-4 text-center">
              <div className="bg-emerald-50 rounded-lg p-2 border border-emerald-100">
                <p className="text-2xl font-bold text-emerald-600">158</p>
                <p className="text-xs text-emerald-800 font-medium">Normais</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-2 border border-amber-100">
                <p className="text-2xl font-bold text-amber-600">0</p>
                <p className="text-xs text-amber-800 font-medium">Manutenção</p>
              </div>
              <div className="bg-rose-50 rounded-lg p-2 border border-rose-100">
                <p className="text-2xl font-bold text-rose-600">3</p>
                <p className="text-xs text-rose-800 font-medium">Quebrados</p>
              </div>
            </div>

            <div className="flex justify-between text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
              <span>Confirmadas: <strong>2705</strong></span>
              <span>Pendentes: <strong>0</strong></span>
            </div>
          </div>

          {/* Card: Locais */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-700 mb-4 border-b pb-2">Locais</h2>
            <div className="flex justify-between text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
              <span>Reservas Confirmadas: <strong>483</strong></span>
              <span>Reservas Pendentes: <strong>0</strong></span>
            </div>
          </div>

          {/* Card: Aulas */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-700 mb-4 border-b pb-2">Aulas</h2>
            <div className="flex justify-between text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
              <span>Confirmadas: <strong>86</strong></span>
              <span>Canceladas: <strong>94</strong></span>
            </div>
          </div>

        </div>

        {/* COLUNA DIREITA: Agenda / Linha do Tempo */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[600px]">
          
          {/* Cabeçalho da Agenda */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <button className="p-1 hover:bg-slate-100 rounded text-slate-500"><ChevronLeft /></button>
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-blue-500" />
              13/03/2026
            </h3>
            <button className="p-1 hover:bg-slate-100 rounded text-slate-500"><ChevronRight /></button>
          </div>

          {/* Lista de Reservas (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            
            {/* Item da Lista (Simulando os da imagem) */}
            <div className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
              <div className="w-3 h-3 rounded-full bg-teal-500 mt-1.5 flex-shrink-0 shadow-sm"></div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  [1027441 - Gabriela Wolhmuth]
                </p>
                <p className="text-sm text-slate-600">
                  Equipamento: LIOFILIZADOR (361173)
                </p>
                <p className="text-xs text-slate-400 mt-1">Das 07:00 até 20:50</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
              <div className="w-3 h-3 rounded-full bg-teal-500 mt-1.5 flex-shrink-0 shadow-sm"></div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  [2254204 - camila schmoeller delgado]
                </p>
                <p className="text-sm text-slate-600">
                  Equipamento: AGITADOR MAGNÉTICO (677671)
                </p>
                <p className="text-xs text-slate-400 mt-1">Das 07:00 até 17:40</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
              <div className="w-3 h-3 rounded-full bg-amber-500 mt-1.5 flex-shrink-0 shadow-sm"></div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  [646695 - Adriele R. dos Santos]
                </p>
                <p className="text-sm text-slate-600">
                  Local da Aula: C105
                </p>
                <p className="text-xs text-slate-400 mt-1">Das 19:30 até 22:50</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}