import { alvesApiRequest, publicApiRequest } from './api';
import { Cliente, Proposta, Contrato, ConfiguracoesEmpresa, LancamentoFinanceiro, ResumoFinanceiro } from '../types/alves';

export const CONFIG_INICIAL: ConfiguracoesEmpresa = {
  razaoSocial: '', nomeFantasia: 'Alves Planejados', cnpj: '', ie: '', telefone: '', whatsapp: '', email: '',
  enderecoCompleto: '', site: '', logoUrl: '/alves_logo.png', textoApresentacaoPadrao: '', mensagemWhatsappPadrao: '',
  termosGarantiaPadrao: '', inclusoPadrao: [], naoInclusoPadrao: [], clausulasContratoPadrao: []
};

export class AlvesStore {
  static async getClientes(): Promise<Cliente[]> {
    return (await alvesApiRequest('/alves/clientes')).clientes;
  }

  static async saveCliente(cliente: Omit<Cliente, 'id' | 'createdAt'> & { id?: string }): Promise<Cliente> {
    const endpoint = cliente.id ? `/alves/clientes/${cliente.id}` : '/alves/clientes';
    return (await alvesApiRequest(endpoint, { method: cliente.id ? 'PUT' : 'POST', body: JSON.stringify(cliente) })).cliente;
  }

  static async deleteCliente(id: string): Promise<void> {
    await alvesApiRequest(`/alves/clientes/${id}`, { method: 'DELETE' });
  }

  static async getPropostas(): Promise<Proposta[]> {
    return (await alvesApiRequest('/alves/propostas')).propostas;
  }

  static async getPropostaById(id: string): Promise<Proposta | undefined> {
    try { return (await alvesApiRequest(`/alves/propostas/${id}`)).proposta; }
    catch (error) { if ((error as Error).message.includes('não encontrada')) return undefined; throw error; }
  }

  static async getPropostaByToken(token: string): Promise<Proposta | undefined> {
    try { return (await publicApiRequest(`/public/propostas/${encodeURIComponent(token)}`)).proposta; }
    catch (error) { if ((error as Error).message.includes('não encontrada')) return undefined; throw error; }
  }

  static async getConfigPublica(): Promise<ConfiguracoesEmpresa> {
    return (await publicApiRequest('/public/configuracao')).configuracao;
  }

  static async saveProposta(proposta: Proposta): Promise<Proposta> {
    let exists = false;
    try { exists = Boolean(await this.getPropostaById(proposta.id)); } catch { exists = false; }
    const endpoint = exists ? `/alves/propostas/${proposta.id}` : '/alves/propostas';
    return (await alvesApiRequest(endpoint, { method: exists ? 'PUT' : 'POST', body: JSON.stringify(proposta) })).proposta;
  }

  static async criarNovaVersaoProposta(id: string): Promise<Proposta> {
    return (await alvesApiRequest(`/alves/propostas/${id}/nova-versao`, { method: 'POST' })).proposta;
  }

  static async aprovarPropostaPublica(token: string, aprovadoPor: string, observacao?: string): Promise<Proposta | null> {
    return (await publicApiRequest(`/public/propostas/${encodeURIComponent(token)}/aprovar`, { method: 'POST', body: JSON.stringify({ aprovadoPor, observacao }) })).proposta;
  }

  static async solicitarAjustePropostaPublica(token: string, solicitante: string, observacao: string): Promise<Proposta | null> {
    return (await publicApiRequest(`/public/propostas/${encodeURIComponent(token)}/ajuste`, { method: 'POST', body: JSON.stringify({ solicitante, observacao }) })).proposta;
  }

  static async deleteProposta(id: string): Promise<void> {
    await alvesApiRequest(`/alves/propostas/${id}`, { method: 'DELETE' });
  }

  static async getContratos(): Promise<Contrato[]> {
    return (await alvesApiRequest('/alves/contratos')).contratos;
  }

  static async getContratoById(id: string): Promise<Contrato | undefined> {
    try { return (await alvesApiRequest(`/alves/contratos/${id}`)).contrato; }
    catch (error) { if ((error as Error).message.includes('não encontrado')) return undefined; throw error; }
  }

  static async getContratoByToken(token: string): Promise<Contrato | undefined> {
    try { return (await publicApiRequest(`/public/contratos/${encodeURIComponent(token)}`)).contrato; }
    catch { return undefined; }
  }

  static async gerarContratoDeProposta(id: string): Promise<Contrato> {
    return (await alvesApiRequest(`/alves/propostas/${id}/contrato`, { method: 'POST' })).contrato;
  }

  static async assinarContratoDemonstrativo(token: string, assinante: { nome: string; documento: string; email: string }): Promise<Contrato | null> {
    return (await alvesApiRequest(`/alves/contratos/${encodeURIComponent(token)}/assinatura-digital`, { method: 'PATCH', body: JSON.stringify(assinante) })).contrato;
  }

  static async getConfig(): Promise<ConfiguracoesEmpresa> {
    return (await alvesApiRequest('/alves/configuracao')).configuracao;
  }

  static async saveConfig(config: ConfiguracoesEmpresa): Promise<ConfiguracoesEmpresa> {
    return (await alvesApiRequest('/alves/configuracao', { method: 'PUT', body: JSON.stringify(config) })).configuracao;
  }

  static async getFinanceiro(): Promise<{ resumo: ResumoFinanceiro; lancamentos: LancamentoFinanceiro[] }> {
    return await alvesApiRequest('/alves/financeiro');
  }

  static async criarLancamentoFinanceiro(lancamento: {
    contractId?: string;
    clientId?: string;
    clientName: string;
    description: string;
    amount: number;
    dueDate: string;
    paymentMethod: string;
    notes?: string;
  }): Promise<LancamentoFinanceiro> {
    return (await alvesApiRequest('/alves/financeiro', {
      method: 'POST',
      body: JSON.stringify(lancamento)
    })).lancamento;
  }

  static async atualizarStatusFinanceiro(id: string, status: 'pendente' | 'pago' | 'cancelado', paidDate?: string): Promise<LancamentoFinanceiro> {
    return (await alvesApiRequest(`/alves/financeiro/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, paidDate })
    })).lancamento;
  }

  static async excluirLancamentoFinanceiro(id: string): Promise<void> {
    await alvesApiRequest(`/alves/financeiro/${id}`, { method: 'DELETE' });
  }
}
