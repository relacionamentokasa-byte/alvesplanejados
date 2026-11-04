import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  PlusCircle,
  Search,
  Filter,
  Eye,
  Edit3,
  ExternalLink,
  Share2,
  Trash2,
  GitBranch,
  CheckCircle2,
  FileClock,
  Send,
  Award,
  Calendar,
  Layers
} from 'lucide-react';
import { AlvesStore } from '../services/alvesStore';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmModal } from '../components/ConfirmModal';
import { Proposta, ConfiguracoesEmpresa } from '../types/alves';

export const PropostasListPage: React.FC = () => {
  const navigate = useNavigate();
  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [config, setConfig] = useState<ConfiguracoesEmpresa | null>(null);
  const [excluindoId, setExcluindoId] = useState<string | null>(null);
  const [propostaParaExcluir, setPropostaParaExcluir] = useState<{ id: string; numero: string } | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const carregarPropostas = async () => {
    const [propostas, config] = await Promise.all([AlvesStore.getPropostas(), AlvesStore.getConfig()]);
    setPropostas(propostas);
    setConfig(config);
  };

  useEffect(() => {
    carregarPropostas().catch((error) => console.error('Erro ao carregar propostas:', error));
  }, []);

  const formatarMoeda = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleCriarNovaVersao = async (prop: Proposta) => {
    if (window.confirm(`Criar nova versão (V${prop.versao + 1}) para a proposta ${prop.numero}?`)) {
      const nova = await AlvesStore.criarNovaVersaoProposta(prop.id);
      navigate(`/propostas/${nova.id}/editar`);
    }
  };

  const handleAbrirConfirmacaoExclusao = (id: string, numero?: string) => {
    setPropostaParaExcluir({ id, numero: numero || 'selecionada' });
  };

  const handleConfirmarExclusao = async () => {
    if (!propostaParaExcluir) return;
    setLoadingDelete(true);
    setExcluindoId(propostaParaExcluir.id);
    try {
      await AlvesStore.deleteProposta(propostaParaExcluir.id);
      // Remove otimisticamente da lista para resposta imediata
      setPropostas(prev => prev.filter(p => p.id !== propostaParaExcluir.id));
      setPropostaParaExcluir(null);
      await carregarPropostas();
    } catch (error: any) {
      console.error('Erro ao excluir proposta:', error);
      alert(error?.message || 'Não foi possível excluir a proposta.');
    } finally {
      setLoadingDelete(false);
      setExcluindoId(null);
    }
  };

  const handleShareWhatsapp = (prop: Proposta) => {
    const publicUrl = `${window.location.origin}/p/${prop.publicToken}`;
    if (!config) return;
    const rawMsg = config.mensagemWhatsappPadrao;
    const msg = rawMsg
      .replace('{CLIENTE}', prop.cliente.nome.split(' ')[0])
      .replace('{PROJETO}', prop.nomeProjeto)
      .replace('{LINK}', publicUrl);

    const whatsLimpo = (prop.cliente.whatsapp || prop.cliente.telefone || '').replace(/\D/g, '');
    const url = whatsLimpo
      ? `https://api.whatsapp.com/send?phone=55${whatsLimpo}&text=${encodeURIComponent(msg)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;

    window.open(url, '_blank');
  };

  const propostasFiltradas = propostas.filter(p => {
    const matchBusca =
      p.numero.toLowerCase().includes(busca.toLowerCase()) ||
      p.cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
      p.nomeProjeto.toLowerCase().includes(busca.toLowerCase());

    const matchStatus = filtroStatus === 'todos' || p.status === filtroStatus;

    return matchBusca && matchStatus;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sans text-2xl font-semibold text-[#231B15]">Propostas Comerciais</h1>
        </div>

        <Link
          to="/propostas/nova"
          className="flex items-center justify-center space-x-2 bg-[#C5A265] hover:bg-[#DFC28B] text-[#1B1410] font-semibold px-4 py-2.5 rounded-xl shadow-gold-glow transition-all text-xs"
        >
          <PlusCircle size={16} />
          <span>+ Nova Proposta</span>
        </Link>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8E2D9] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9B9087]" />
          <input
            type="text"
            placeholder="Pesquisar por número, cliente, projeto..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-xs text-[#231B15] placeholder-[#9B9087] focus:outline-none focus:border-[#C5A265]"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 text-xs">
          <span className="text-[#6E645C] font-medium hidden sm:inline">Status:</span>
          {['todos', 'rascunho', 'enviada', 'aprovada', 'contrato_gerado'].map((st) => (
            <button
              key={st}
              onClick={() => setFiltroStatus(st)}
              className={`px-3 py-1.5 rounded-xl capitalize transition-all whitespace-nowrap ${
                filtroStatus === st
                  ? 'bg-[#1B1410] text-[#FAF8F5] font-semibold'
                  : 'bg-[#FAF8F5] text-[#6E645C] hover:bg-[#F2EFEB]'
              }`}
            >
              {st === 'todos' ? 'Todas' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Propostas */}
      <div className="space-y-3">
        {propostasFiltradas.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-[#E8E2D9]">
            <FileText size={32} className="mx-auto text-[#9B9087] mb-3" />
            <p className="text-sm font-semibold text-[#231B15]">Nenhuma proposta encontrada</p>
            <p className="text-xs text-[#6E645C] mt-1">Crie uma nova proposta para iniciar o fluxo comercial.</p>
          </div>
        ) : (
          propostasFiltradas.map((prop) => (
            <div
              key={prop.id}
              className="bg-white p-5 rounded-2xl border border-[#E8E2D9] hover:border-[#C5A265]/40 shadow-sm transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#1B1410] bg-[#FAF8F5] px-2.5 py-1 rounded-lg border border-[#E8E2D9]">
                    {prop.numero}
                  </span>
                  <span className="text-[11px] bg-[#FAF3E8] text-[#9E7E45] border border-[#C5A265]/40 px-2 py-0.5 rounded-md font-semibold">
                    Versão {prop.versao}
                  </span>
                  <StatusBadge status={prop.status} />
                </div>

                <div>
                  <h3 className="font-sans text-base font-bold text-[#1B1410]">{prop.nomeProjeto}</h3>
                  <p className="text-xs text-[#6E645C]">
                    Cliente: <strong className="text-[#231B15]">{prop.cliente.nome}</strong> • {prop.enderecoObra}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#9B9087]">
                  <span className="flex items-center space-x-1">
                    <Layers size={13} className="text-[#C5A265]" />
                    <span>{prop.ambientes.length} ambientes ({prop.ambientes.map(a => a.nome).join(', ')})</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Calendar size={13} />
                    <span>Validade: {new Date(prop.dataValidade).toLocaleDateString('pt-BR')}</span>
                  </span>
                </div>
              </div>

              {/* Valores e Ações */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between border-t lg:border-t-0 pt-3 lg:pt-0 border-[#E8E2D9] gap-3 w-full lg:w-auto">
                <div className="text-left lg:text-right">
                  <span className="text-[11px] text-[#6E645C] block">Valor Total</span>
                  <div className="font-sans text-lg font-bold text-[#C5A265]">
                    {formatarMoeda(prop.condicoes.valorFinal)}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-xs w-full sm:w-auto justify-end">
                  <button
                    onClick={() => handleCriarNovaVersao(prop)}
                    title="Criar Nova Versão (V+1)"
                    className="p-2 text-[#6E645C] hover:text-[#1B1410] hover:bg-[#FAF8F5] rounded-xl border border-[#E8E2D9] transition-colors"
                  >
                    <GitBranch size={15} />
                  </button>

                  <button
                    onClick={() => handleShareWhatsapp(prop)}
                    title="Compartilhar pelo WhatsApp"
                    className="p-2 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl border border-emerald-200 transition-colors"
                  >
                    <Share2 size={15} />
                  </button>

                  <Link
                    to={`/p/${prop.publicToken}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Link Público do Cliente"
                    className="p-2 text-[#C5A265] hover:text-[#9E7E45] hover:bg-[#FAF3E8] rounded-xl border border-[#C5A265]/30 transition-colors"
                  >
                    <ExternalLink size={15} />
                  </Link>

                  <Link
                    to={`/propostas/${prop.id}/previa`}
                    className="flex items-center space-x-1 px-3 py-2 bg-[#1B1410] hover:bg-[#2A1F19] text-[#FAF8F5] rounded-xl font-semibold transition-colors"
                  >
                    <Eye size={13} className="text-[#C5A265]" />
                    <span>Ver</span>
                  </Link>

                  <Link
                    to={`/propostas/${prop.id}/editar`}
                    className="p-2 text-[#6E645C] hover:text-[#1B1410] hover:bg-[#FAF8F5] rounded-xl border border-[#E8E2D9] transition-colors"
                  >
                    <Edit3 size={15} />
                  </Link>

                  <button
                    onClick={() => handleAbrirConfirmacaoExclusao(prop.id, prop.numero)}
                    disabled={excluindoId === prop.id}
                    title="Excluir Proposta"
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl border border-red-200 transition-colors disabled:opacity-40"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Moderno de Confirmação de Exclusão (sem window.confirm) */}
      <ConfirmModal
        isOpen={Boolean(propostaParaExcluir)}
        title="Excluir Proposta"
        message={`Tem certeza que deseja excluir permanentemente a proposta ${propostaParaExcluir?.numero || ''}? Esta ação removerá a proposta e os contratos vinculados a ela.`}
        confirmLabel="Sim, Excluir Proposta"
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
