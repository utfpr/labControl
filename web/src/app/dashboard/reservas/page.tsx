"use client";

import React, { useState } from "react";
import { ReservasLocaisView } from "./ReservasLocaisView";
import { ReservasEquipamentosView } from "./ReservasEquipamentosView";

export default function ReservasPage() {
  const [activeTab, setActiveTab] = useState<'locais' | 'equipamentos'>('locais');

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
          Gestão de Reservas
        </h1>

        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('locais')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'locais'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Laboratórios
          </button>
          <button
            onClick={() => setActiveTab('equipamentos')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'equipamentos'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Equipamentos
          </button>
        </div>
      </div>

      <div className="mt-6">
        {activeTab === 'locais' ? (
          <ReservasLocaisView />
        ) : (
          <ReservasEquipamentosView />
        )}
      </div>
    </div>
  );
}
