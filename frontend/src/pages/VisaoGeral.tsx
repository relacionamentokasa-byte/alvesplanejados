import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  FileClock,
  Send,
  CheckCircle2,
  FileCheck2,
  Award,
  PlusCircle,
  ExternalLink,
  ArrowRight,
  TrendingUp,
  Search,
  Eye,
  MessageCircle,
  Clock,
  Trash2
} from 'lucide-react';
import { AlvesStore } from '../services/alvesStore';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmModal } from '../components/ConfirmModal';
import { Proposta, Contrato } from '../types/alves';

export const VisaoGeralPage: React.FC = () => {
  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [busca, setBusca] = useState('');
  const [propostaParaExcluir, setPropostaParaExcluir] = useState<{ id: string; numero: string } | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const carregarDados = async () => {
    try {
      const [props, conts] = await Promise.all([AlvesStore.getPropostas(), AlvesStore.getContratos()]);
      setPropostas(props);
      setContratos(conts);
    } catch (error) {
      console.error('Erro ao carregar painel Alves:', error);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleAbrirConfirmacaoExclusao = (id: string, numero: string) => {
    setPropostaParaExcluir({ id, numero });
  };

  const handleConfirmarExclusao = async () => {
    if (!propostaParaExcluir) return;
    setLoadingDelete(true);
    try {
      await AlvesStore.deleteProposta(propostaParaExcluir.id);
      // Atualização otimista imediata na tela
      setPropostas(prev => prev.filter(p => p.id !== propostaParaExcluir.id));
      setPropostaParaExcluir(null);
      await carregarDados();
    } catch (error: any) {
      console.error('Erro ao excluir proposta:', error);
      alert(error?.message || 'Não foi possível excluir a proposta.');
    } finally {
      setLoadingDelete(false);
    }
  };

  // Indicadores
  const totalPropostas = propostas.length;
  const propostasElaboracao = propostas.filter(p => p.status === 'rascunho').length;
  const propostasEnviadas = propostas.filter(p => p.status === 'enviada').length;
  const propostasAprovadas = propostas.filter(p => p.status === 'aprovada' || p.status === 'contrato_gerado').length;
  const contratosAguardando = contratos.filter(c => c.status === 'aguardando_assinatura').length;
  const contratosAssinados = contratos.filter(c => c.status === 'assinado').length;

  const valorTotalAprovado = propostas
    .filter(p => p.status === 'aprovada' || p.status === 'contrato_gerado')
    .reduce((acc, p) => acc + p.condicoes.valorFinal, 0);

  const propostasFiltradas = propostas.filter(p => {
    const termo = busca.toLowerCase();
    return (
      p.numero.toLowerCase().includes(termo) ||
      p.cliente.nome.toLowerCase().includes(termo) ||
      p.nomeProjeto.toLowerCase().includes(termo)
    );
  });

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner Sóbrio e Limpo */}
      <div className="bg-[#1B1410] text-[#FAF8F5] rounded-2xl p-5 sm:p-6 border border-[#2A1F19] shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-sans font-semibold text-[#FAF8F5]">
            Visão Geral
          </h1>
          <p className="text-xs text-[#8C7D73] mt-0.5">
            Orçamentos, aprovações e contratos da marcenaria.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <Link
            to="/propostas/nova"
            className="flex items-center justify-center space-x-1.5 bg-[#C5A265] hover:bg-[#DFC28B] text-[#1B1410] font-semibold px-4 py-2.5 rounded-xl transition-all text-xs"
          >
            <PlusCircle size={16} />
            <span>Nova Proposta</span>
          </Link>
          <Link
            to="/clientes"
            className="flex items-center justify-center space-x-1.5 bg-[#2A1F19] hover:bg-[#382B23] text-[#FAF8F5] font-medium px-4 py-2.5 rounded-xl border border-[#382B23] transition-colors text-xs"
          >
            <span>Gerenciar Clientes</span>
          </Link>
        </div>
      </div>

      {/* 6 Indicadores Principais com suporte a Snap Horizontal no Mobile */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
          <h2 className="text-sm sm:text-base font-semibold text-[#231B15]">
            Resumo Comercial
          </h2>
          <div className="text-xs text-[#6E645C] font-medium flex items-center justify-between sm:justify-end gap-2">
            <span>Aprovado:</span>
            <span className="text-[#1B1410] font-bold text-sm text-[#C5A265]">{formatarMoeda(valorTotalAprovado)}</span>
          </div>
        </div>

        {/* Carrossel tátil no mobile com snap horizontal e grade no desktop */}
        <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4 overflow-x-auto pb-2 sm:pb-0 snap-x snap-mandatory no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0">
          {/* Total de Propostas */}
          <div className="min-w-[130px] sm:min-w-0 flex-1 snap-start bg-white p-3.5 rounded-xl border border-[#E8E2D9] shadow-sm">
            <div className="flex items-center justify-between text-[#6E645C] mb-1">
              <span className="text-xs font-medium">Total</span>
              <FileText size={14} className="text-[#9B9087]" />
            </div>
            <div className="text-xl font-bold text-[#1B1410]">{totalPropostas}</div>
          </div>

          {/* Em Elaboração */}
          <div className="min-w-[130px] sm:min-w-0 flex-1 snap-start bg-white p-3.5 rounded-xl border border-[#E8E2D9] shadow-sm">
            <div className="flex items-center justify-between text-[#6E645C] mb-1">
              <span className="text-xs font-medium">Rascunhos</span>
              <FileClock size={14} className="text-amber-700" />
            </div>
            <div className="text-xl font-bold text-amber-900">{propostasElaboracao}</div>
          </div>

          {/* Enviadas */}
          <div className="min-w-[130px] sm:min-w-0 flex-1 snap-start bg-white p-3.5 rounded-xl border border-[#E8E2D9] shadow-sm">
            <div className="flex items-center justify-between text-[#6E645C] mb-1">
              <span className="text-xs font-medium">Enviadas</span>
              <Send size={14} className="text-blue-700" />
            </div>
            <div className="text-xl font-bold text-blue-900">{propostasEnviadas}</div>
          </div>

          {/* Aprovadas */}
          <div className="min-w-[130px] sm:min-w-0 flex-1 snap-start bg-white p-3.5 rounded-xl border border-[#E8E2D9] shadow-sm">
            <div className="flex items-center justify-between text-[#6E645C] mb-1">
              <span className="text-xs font-medium">Aprovadas</span>
              <CheckCircle2 size={14} className="text-emerald-700" />
            </div>
            <div className="text-xl font-bold text-emerald-900">{propostasAprovadas}</div>
          </div>

          {/* Contratos Aguardando */}
          <div className="min-w-[130px] sm:min-w-0 flex-1 snap-start bg-white p-3.5 rounded-xl border border-[#E8E2D9] shadow-sm">
            <div className="flex items-center justify-between text-[#6E645C] mb-1">
              <span className="text-xs font-medium">Contratos</span>
              <FileCheck2 size={14} className="text-[#9E7E45]" />
            </div>
            <div className="text-xl font-bold text-[#231B15]">{contratosAguardando}</div>
          </div>

          {/* Contratos Assinados */}
          <div className="min-w-[130px] sm:min-w-0 flex-1 snap-start bg-[#1B1410] text-[#FAF8F5] p-3.5 rounded-xl border border-[#C5A265]/30 shadow-sm">
            <div className="flex items-center justify-between text-[#D9D2C7] mb-1">
              <span className="text-xs font-medium">Assinados</span>
              <Award size={14} className="text-[#C5A265]" />
            </div>
            <div className="text-xl font-bold text-[#FAF8F5]">{contratosAssinados}</div>
          </div>
        </div>
      </div>

      {/* Tabela de Propostas Recentes */}
      <div className="bg-white rounded-2xl border border-[#E8E2D9] shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#E8E2D9] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-sans text-base font-semibold text-[#231B15]">Propostas Recentes</h3>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative w-full sm:w-64">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9087]" />
              <input
                type="text"
                placeholder="Buscar cliente, número..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-xs text-[#231B15] placeholder-[#9B9087] focus:outline-none focus:border-[#C5A265] transition-colors"
              />
            </div>
            <Link
              to="/propostas"
              className="text-xs font-semibold text-[#C5A265] hover:text-[#9E7E45] whitespace-nowrap flex items-center space-x-1"
            >
              <span>Ver todas</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Visualização em Tabela para Telas Grandes (Full Desktop) */}
        <div className="hidden xl:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E8E2D9] text-[11px] font-semibold text-[#6E645C] uppercase tracking-wider">
                <th className="py-3.5 px-5">Número / Versão</th>
                <th className="py-3.5 px-5">Cliente</th>
                <th className="py-3.5 px-5">Projeto & Ambientes</th>
                <th className="py-3.5 px-5">Valor Final</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5">Data Emissão</th>
                <th className="py-3.5 px-5 text-right">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2D9] text-xs">
              {propostasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[#9B9087]">
                    Nenhuma proposta encontrada.
                  </td>
                </tr>
              ) : (
                propostasFiltradas.slice(0, 5).map((p) => (
                  <tr key={p.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-semibold text-[#1B1410]">{p.numero}</div>
                      <div className="text-[11px] text-[#9B9087]">Versão {p.versao}</div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="font-medium text-[#231B15]">{p.cliente.nome}</div>
                      <div className="text-[11px] text-[#6E645C]">{p.cliente.whatsapp || p.cliente.telefone}</div>
                    </td>
                    <td className="py-4 px-5 max-w-xs">
                      <div className="font-medium text-[#231B15] truncate">{p.nomeProjeto}</div>
                      <div className="text-[11px] text-[#9B9087] truncate">
                        {p.ambientes.map(a => a.nome).join(', ')}
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="font-bold text-[#1B1410]">{formatarMoeda(p.condicoes.valorFinal)}</div>
                      {p.condicoes.descontoGeral > 0 && (
                        <div className="text-[10px] text-emerald-700">
                          Desc: {formatarMoeda(p.condicoes.descontoGeral)}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-5">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="py-4 px-5 text-[#6E645C]">
                      {new Date(p.dataEmissao).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/propostas/${p.id}/previa`}
                          title="Visualizar Proposta Oficial"
                          className="p-1.5 text-[#6E645C] hover:text-[#1B1410] hover:bg-[#F2EFEB] rounded-lg transition-colors"
                        >
                          <Eye size={15} />
                        </Link>
                        <Link
                          to={`/p/${p.publicToken}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Ver Link Público do Cliente"
                          className="p-1.5 text-[#C5A265] hover:text-[#9E7E45] hover:bg-[#FAF3E8] rounded-lg transition-colors"
                        >
                          <ExternalLink size={15} />
                        </Link>
                        <Link
                          to={`/propostas/${p.id}/editar`}
                          className="text-[11px] font-semibold text-[#1B1410] hover:text-[#C5A265] bg-[#FAF8F5] hover:bg-white px-2.5 py-1 rounded-md border border-[#E8E2D9] transition-all"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => handleAbrirConfirmacaoExclusao(p.id, p.numero)}
                          title="Excluir Proposta"
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Visualização em Cards para Mobile, Tablet e Telas Médias */}
        <div className="xl:hidden divide-y divide-[#E8E2D9]">
          {propostasFiltradas.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#9B9087]">
              Nenhuma proposta encontrada.
            </div>
          ) : (
            propostasFiltradas.slice(0, 5).map((p) => (
              <div key={p.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-xs text-[#1B1410]">{p.numero}</span>
                    <span className="text-[10px] text-[#9B9087] ml-1.5">(V{p.versao})</span>
                  </div>
                  <StatusBadge status={p.status} size="sm" />
                </div>

                <div>
                  <div className="text-sm font-bold text-[#1B1410]">{p.cliente.nome}</div>
                  <div className="text-xs text-[#6E645C] truncate">{p.nomeProjeto}</div>
                  <div className="text-[11px] text-[#9B9087] mt-0.5 truncate">
                    {p.ambientes.map(a => a.nome).join(', ')}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <div className="text-xs text-[#9B9087]">Valor Final</div>
                    <div className="text-sm font-bold text-[#C5A265]">{formatarMoeda(p.condicoes.valorFinal)}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/p/${p.publicToken}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-[#C5A265] bg-[#FAF3E8] rounded-xl border border-[#C5A265]/40"
                      title="Link Público"
                    >
                      <ExternalLink size={15} />
                    </Link>
                    <Link
                      to={`/propostas/${p.id}/previa`}
                      className="px-3 py-1.5 bg-[#1B1410] text-[#FAF8F5] text-xs font-semibold rounded-xl flex items-center space-x-1"
                    >
                      <Eye size={13} className="text-[#C5A265]" />
                      <span>Ver</span>
                    </Link>
                    <Link
                      to={`/propostas/${p.id}/editar`}
                      className="px-2.5 py-1.5 bg-[#FAF8F5] text-[#1B1410] text-xs font-medium rounded-xl border border-[#E8E2D9]"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleAbrirConfirmacaoExclusao(p.id, p.numero)}
                      className="p-2 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 transition-colors"
                      title="Excluir Proposta"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Moderno de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={Boolean(propostaParaExcluir)}
        title="Excluir Proposta"
        message={`Deseja realmente excluir a proposta ${propostaParaExcluir?.numero || ''}? Esta ação é permanente.`}
        confirmLabel="Sim, Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        loading={loadingDelete}
        onConfirm={handleConfirmarExclusao}
        onCancel={() => {
          if (!loadingDelete) setPropostaParaExcluir(null);
        }}
      />
    </div>
  );
};
