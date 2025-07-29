import axios from 'axios';

interface SenhaAtual {
    codigo: string;
    numero: number;
    status: string;
}

interface HistoricoSenha {
    codigo: string;
    status: string;
    horario: string;
}

interface InfoFila {
    senhasAguardandoNormal: number;
    senhasAguardandoPrioritario: number;
}

interface ScheduleInfo {
    proximaChamadaEm: number;
    intervaloChamada: number;
    proximaChamadaTimestamp: number;
    senhasAguardando: number;
    chamadaAutomaticaAtiva: boolean;
}

export const AtendimentoService = {
    async chamarProximaSenha(tipo: string): Promise<void> {
        try {
            await axios.post('http://34.133.85.233:8080/api/atendimento/proxima', { tipo });
        } catch (error) {
            console.error('Erro ao chamar próxima senha:', error);
            throw error;
        }
    },

    async registrarDesistencia(codigo: string): Promise<void> {
        try {
            await axios.post(`http://34.133.85.233:8080/api/atendimento/${codigo}/desistencia`);
        } catch (error) {
            console.error('Erro ao registrar desistência:', error);
            throw error;
        }
    },

    async registrarAtendimento(codigo: string): Promise<void> {
        try {
            await axios.post(`http://34.133.85.233:8080/api/atendimento/${codigo}/finalizar`);
        } catch (error) {
            console.error('Erro ao registrar atendimento:', error);
            throw error;
        }
    },

    async getSenhaAtual(): Promise<SenhaAtual> {
        try {
            const response = await axios.get(`http://34.133.85.233:8080/api/atendimento/atual`);
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar senha atual:', error);
            throw error;
        }
    },

    async getHistoricoSenhas(): Promise<HistoricoSenha[]> {
        try {
            const response = await axios.get('http://34.133.85.233:8080/api/atendimento/historico');
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar histórico de senhas:', error);
            throw error;
        }
    },

    async getInfoFila(): Promise<InfoFila> {
        try {
            const response = await axios.get('http://34.133.85.233:8080/api/atendimento/fila/info');
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar informações da fila:', error);
            throw error;
        }
    },

    async getScheduleInfo(): Promise<ScheduleInfo> {
        try {
            const response = await axios.get('http://34.133.85.233:8080/api/atendimento/schedule/info');
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar informações do schedule:', error);
            throw error;
        }
    }
}; 