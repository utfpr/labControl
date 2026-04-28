"use client";

import { useState, useEffect } from "react";

export interface EquipamentoStats {
  normal: number;
  manutencao: number;
  quebrado: number;
}

export interface ReservaStats {
  confirmadas: number;
  pendentes: number;
}

export interface AulaStats {
  confirmadas: number;
  canceladas: number;
}

export interface Stats {
  equipamentos: EquipamentoStats | null;
  reservasEquipamentos: ReservaStats | null;
  reservasLocais: ReservaStats | null;
  aulas: AulaStats | null;
  loading: boolean;
  error: string | null;
}

export function useStats(): Stats {
  const [equipamentos, setEquipamentos] = useState<EquipamentoStats | null>(null);
  const [reservasEquipamentos, setReservasEquipamentos] = useState<ReservaStats | null>(null);
  const [reservasLocais, setReservasLocais] = useState<ReservaStats | null>(null);
  const [aulas, setAulas] = useState<AulaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("labcontrol_token");
        if (!token) {
          throw new Error("Sessão expirada. Faça login novamente.");
        }

        const [equipamentosRes, reservasEquipRes, reservasLocaisRes, aulasRes] = await Promise.all([
          fetch("http://localhost:3000/equipamentos/stats", {
            headers: { "Authorization": `Bearer ${token}` }
          }),
          fetch("http://localhost:3000/reservas-equipamentos/stats", {
            headers: { "Authorization": `Bearer ${token}` }
          }),
          fetch("http://localhost:3000/reservas-locais/stats", {
            headers: { "Authorization": `Bearer ${token}` }
          }),
          fetch("http://localhost:3000/aulas/stats", {
            headers: { "Authorization": `Bearer ${token}` }
          })
        ]);

        if (!equipamentosRes.ok || !reservasEquipRes.ok || !reservasLocaisRes.ok || !aulasRes.ok) {
          throw new Error("Erro ao carregar estatísticas.");
        }

        const [equipamentosData, reservasEquipamentosData, reservasLocaisData, aulasData] = await Promise.all([
          equipamentosRes.json(),
          reservasEquipRes.json(),
          reservasLocaisRes.json(),
          aulasRes.json()
        ]);

        setEquipamentos(equipamentosData);
        setReservasEquipamentos(reservasEquipamentosData);
        setReservasLocais(reservasLocaisData);
        setAulas(aulasData);
        setLoading(false);
      } catch (err) {
        setError("Erro ao carregar estatísticas.");
        setLoading(false);
      }
    };

    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    equipamentos,
    reservasEquipamentos,
    reservasLocais,
    aulas,
    loading,
    error
  };
}
