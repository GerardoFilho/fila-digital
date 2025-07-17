import { useState, useEffect, useCallback } from 'react';
import { AtendimentoService } from '../services/AtendimentoService';

interface ScheduleInfo {
  proximaChamadaEm: number;
  intervaloChamada: number;
  proximaChamadaTimestamp: number;
  senhasAguardando: number;
  chamadaAutomaticaAtiva: boolean;
}

export const useScheduleTimer = () => {
  const [scheduleInfo, setScheduleInfo] = useState<ScheduleInfo | null>(null);
  const [tempoRestante, setTempoRestante] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChamandoSenha, setIsChamandoSenha] = useState(false);

  const buscarScheduleInfo = useCallback(async () => {
    try {
      setError(null);
      const info = await AtendimentoService.getScheduleInfo();
      setScheduleInfo(info);
      setTempoRestante(info.proximaChamadaEm);
      setLoading(false);
    } catch (err) {
      console.error('Erro ao buscar informações do schedule:', err);
      setError('Erro ao carregar informações do schedule');
      setLoading(false);
    }
  }, []);

  const chamarProximaSenha = useCallback(async () => {
    if (isChamandoSenha) return;
    
    try {
      setIsChamandoSenha(true);
      console.log('Chamando próxima senha automaticamente...');
      await AtendimentoService.chamarProximaSenha("NORMAL");
      console.log('Próxima senha chamada com sucesso');
      
      // Aguarda um pouco antes de buscar novas informações
      setTimeout(() => {
        buscarScheduleInfo();
      }, 2000);
    } catch (err) {
      console.error('Erro ao chamar próxima senha:', err);
      setError('Erro ao chamar próxima senha automaticamente');
    } finally {
      setIsChamandoSenha(false);
    }
  }, [isChamandoSenha, buscarScheduleInfo]);

  useEffect(() => {
    buscarScheduleInfo();
  }, [buscarScheduleInfo]);

  useEffect(() => {
    if (!scheduleInfo || !scheduleInfo.chamadaAutomaticaAtiva) {
      return;
    }

    const interval = setInterval(() => {
      setTempoRestante((prev) => {
        if (prev <= 1) {
          // Quando o contador chegar a 0, chamar próxima senha
          chamarProximaSenha();
          return scheduleInfo.intervaloChamada;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [scheduleInfo, chamarProximaSenha]);

  const formatarTempo = (segundos: number): string => {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    return `${minutos.toString().padStart(2, '0')}:${segundosRestantes.toString().padStart(2, '0')}`;
  };

  return {
    scheduleInfo,
    tempoRestante,
    formatarTempo,
    loading,
    error,
    isChamandoSenha,
    recarregar: buscarScheduleInfo
  };
}; 