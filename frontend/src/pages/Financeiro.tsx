import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  Search,
  Filter,
  Calendar,
  CreditCard,
  Building,
  Trash2,
  Check,
  X
} from 'lucide-react';
import { AlvesStore } from '../services/alvesStore';
import { LancamentoFinanceiro, ResumoFinanceiro } from '../types/alves';
import { ConfirmModal } from '../components/ConfirmModal';

export const FinanceiroPage: React.FC = () => {
  const [resumo, setResumo] = useState<ResumoFinanceiro>({
    totalGeral: 0,
    totalRecebido: 0,
    totalPendente: 0,
    totalAtrasado: 0,
    recebidoMesAtual: 0,
    pendenteMesAtual: 0
  });
  const [lancamentos, setLancamentos] = useState<LancamentoFinanceiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'pendente' | 'pago' | 'atrasado'>('todos');

  // Modal de novo lançamento manual
  const [modalNovoAberto, setModalNovoAberto] = useState(false);
  const [novoLancamento, setNovoLancamento] = useState({
    clientName: '',
    description: '',
    amount: '',
    dueDate: new Date().toISOString().slice(0, 10),
    paymentMethod: 'pix' as 'pix' | 'boleto' | 'cartao' | 'transferencia' | 'dinheiro',
    notes: ''
  });
  const [salvandoNovo, setSalvandoNovo] = useState(false);

  // Modal de exclusão
  const [itemParaExcluir, setItemParaExcluir] = useState<LancamentoFinanceiro | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const data = await AlvesStore.getFinanceiro();
      setResumo(data.resumo);
      setLancamentos(data.lancamentos);
    } catch (err) {
      console.error('Erro ao carregar dados financeiros:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const formatarMoeda = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleAlternarStatus = async (item: LancamentoFinanceiro) => {
    const novoStatus = item.status === 'pago' ? 'pendente' : 'pago';
    try {
      // Atualização otimista
      setLancamentos(prev =>
        prev.map(l => (l.id === item.id ? { ...l, status: novoStatus, paidDate: novoStatus === 'pago' ? new Date().toISOString().slice(0, 10) : undefined } : l))
      );
      await AlvesStore.atualizarStatusFinanceiro(item.id, novoStatus);
      await carregarDados();
    } catch (err: any) {
      console.error('Erro ao atualizar status financeiro:', err);
      alert('Não foi possível atualizar o status.');
      await carregarDados();
    }
  };

  const handleCriarLancamento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoLancamento.clientName || !novoLancamento.description || !novoLancamento.amount) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    setSalvandoNovo(true);
    try {
      await AlvesStore.criarLancamentoFinanceiro({
        clientName: novoLancamento.clientName,
        description: novoLancamento.description,
        amount: Number(novoLancamento.amount.replace(',', '.')),
        dueDate: novoLancamento.dueDate,
        paymentMethod: novoLancamento.paymentMethod,
        notes: novoLancamento.notes
      });
      setModalNovoAberto(false);
      setNovoLancamento({
        clientName: '',
        description: '',
        amount: '',
        dueDate: new Date().toISOString().slice(0, 10),
        paymentMethod: 'pix',
        notes: ''
      });
      await carregarDados();
    } catch (err: any) {
      console.error('Erro ao criar lançamento:', err);
      alert('Erro ao salvar lançamento.');
    } finally {
      setSalvandoNovo(false);
    }
  };

  const handleConfirmarExclusao = async () => {
    if (!itemParaExcluir) return;
    setExcluindo(true);
    try {
      await AlvesStore.excluirLancamentoFinanceiro(itemParaExcluir.id);
      setLancamentos(prev => prev.filter(l => l.id !== itemParaExcluir.id));
      setItemParaExcluir(null);
      await carregarDados();
    } catch (err: any) {
      console.error('Erro ao excluir lançamento:', err);
      alert('Erro ao excluir lançamento.');
    } finally {
      setExcluindo(false);
    }
  };

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const lancamentosFiltrados = lancamentos.filter(item => {
    const termo = busca.toLowerCase();
    const matchBusca =
      item.clientName.toLowerCase().includes(termo) ||
      item.description.toLowerCase().includes(termo) ||
      (item.contractNumber && item.contractNumber.toLowerCase().includes(termo));

    if (!matchBusca) return false;

    if (filtroStatus === 'todos') return true;
    if (filtroStatus === 'pago') return item.status === 'pago';

    const dataVenc = new Date(item.dueDate);
    dataVenc.setHours(0, 0, 0, 0);

    if (filtroStatus === 'atrasado') {
      return item.status === 'pendente' && dataVenc < hoje;
    }
    if (filtroStatus === 'pendente') {
      return item.status === 'pendente' && dataVenc >= hoje;
    }
    return true;
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Banner Principal com Identidade Alves */}
      <div className="bg-[#1B1410] text-[#FAF8F5] rounded-2xl p-5 sm:p-6 border border-[#2A1F19] shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-sans font-semibold text-[#FAF8F5]">
            Financeiro & Recebimentos
          </h1>
          <p className="text-xs text-[#8C7D73] mt-0.5">
            Fluxo de entradas, parcelas por contrato e previsões da Alves Planejados.
          </p>
        </div>

        <button
          onClick={() => setModalNovoAberto(true)}
          className="flex items-center justify-center space-x-1.5 bg-[#C5A265] hover:bg-[#DFC28B] text-[#1B1410] font-semibold px-4 py-2.5 rounded-xl transition-all text-xs shadow-sm self-start sm:self-auto"
        >
          <PlusCircle size={16} />
          <span>Novo Recebimento</span>
        </button>
      </div>

      {/* Cards de Resumo Financeiro */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Recebido no Mês */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8E2D9] shadow-sm">
          <div className="flex items-center justify-between text-[#6E645C] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Recebido no Mês</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-emerald-800">
            {formatarMoeda(resumo.recebidoMesAtual)}
          </div>
          <div className="text-[11px] text-[#9B9087] mt-1">Total recebido: {formatarMoeda(resumo.totalRecebido)}</div>
        </div>

        {/* A Vencer no Mês */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8E2D9] shadow-sm">
          <div className="flex items-center justify-between text-[#6E645C] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">A Vencer no Mês</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-amber-900">
            {formatarMoeda(resumo.pendenteMesAtual)}
          </div>
          <div className="text-[11px] text-[#9B9087] mt-1">Previsão de caixa deste mês</div>
        </div>

        {/* Em Aberto (Geral) */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8E2D9] shadow-sm">
          <div className="flex items-center justify-between text-[#6E645C] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total a Receber</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF3E8] text-[#C5A265] flex items-center justify-center">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-[#1B1410]">
            {formatarMoeda(resumo.totalPendente)}
          </div>
          <div className="text-[11px] text-[#9B9087] mt-1">Saldo futuro de todos os contratos</div>
        </div>

        {/* Atrasados */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8E2D9] shadow-sm">
          <div className="flex items-center justify-between text-[#6E645C] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Atrasados</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-red-700">
            {formatarMoeda(resumo.totalAtrasado)}
          </div>
          <div className="text-[11px] text-[#9B9087] mt-1">Necessitam cobrança</div>
        </div>
      </div>

      {/* Tabela de Lançamentos & Filtros */}
      <div className="bg-white rounded-2xl border border-[#E8E2D9] shadow-sm overflow-hidden">
        {/* Cabeçalho de Filtros */}
        <div className="p-4 sm:p-5 border-b border-[#E8E2D9] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setFiltroStatus('todos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filtroStatus === 'todos'
                  ? 'bg-[#1B1410] text-[#FAF8F5]'
                  : 'bg-[#FAF8F5] text-[#6E645C] hover:bg-[#F2EFEB]'
              }`}
            >
              Todos ({lancamentos.length})
            </button>
            <button
              onClick={() => setFiltroStatus('pendente')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filtroStatus === 'pendente'
                  ? 'bg-amber-700 text-white'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              A Vencer
            </button>
            <button
              onClick={() => setFiltroStatus('pago')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filtroStatus === 'pago'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              Recebidos
            </button>
            <button
              onClick={() => setFiltroStatus('atrasado')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filtroStatus === 'atrasado'
                  ? 'bg-red-700 text-white'
                  : 'bg-red-50 text-red-800 hover:bg-red-100'
              }`}
            >
              Atrasados
            </button>
          </div>

          <div className="relative w-full md:w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9087]" />
            <input
              type="text"
              placeholder="Buscar por cliente, contrato..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-xs text-[#231B15] placeholder-[#9B9087] focus:outline-none focus:border-[#C5A265]"
            />
          </div>
        </div>

        {/* Visualização em Tabela para Desktop */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E8E2D9] text-[11px] font-semibold text-[#6E645C] uppercase tracking-wider">
                <th className="py-3.5 px-5">Cliente & Contrato</th>
                <th className="py-3.5 px-5">Descrição</th>
                <th className="py-3.5 px-5">Vencimento</th>
                <th className="py-3.5 px-5">Valor</th>
                <th className="py-3.5 px-5">Forma</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Ação Rápida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2D9] text-xs">
              {lancamentosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#9B9087]">
                    Nenhum lançamento financeiro encontrado.
                  </td>
                </tr>
              ) : (
                lancamentosFiltrados.map(item => {
                  const dataVenc = new Date(item.dueDate);
                  dataVenc.setHours(0, 0, 0, 0);
                  const isAtrasado = item.status === 'pendente' && dataVenc < hoje;

                  return (
                    <tr key={item.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                      <td className="py-4 px-5">
                        <div className="font-semibold text-[#1B1410]">{item.clientName}</div>
                        {item.contractNumber ? (
                          <div className="text-[11px] text-[#C5A265] font-mono">{item.contractNumber}</div>
                        ) : (
                          <div className="text-[10px] text-[#9B9087]">Avulso</div>
                        )}
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-medium text-[#231B15]">{item.description}</div>
                        {item.notes && <div className="text-[10px] text-[#9B9087]">{item.notes}</div>}
                      </td>
                      <td className="py-4 px-5">
                        <div className={`font-semibold ${isAtrasado ? 'text-red-600' : 'text-[#231B15]'}`}>
                          {new Date(item.dueDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                        </div>
                        {item.paidDate && (
                          <div className="text-[10px] text-emerald-700">
                            Pago em {new Date(item.paidDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-bold text-sm text-[#1B1410]">{formatarMoeda(item.amount)}</div>
                      </td>
                      <td className="py-4 px-5 capitalize text-[#6E645C]">{item.paymentMethod}</td>
                      <td className="py-4 px-5">
                        {item.status === 'pago' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                            Recebido
                          </span>
                        ) : isAtrasado ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-800">
                            Atrasado
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                            A Vencer
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleAlternarStatus(item)}
                            title={item.status === 'pago' ? 'Marcar como Pendente' : 'Marcar como Recebido'}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
                              item.status === 'pago'
                                ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                            }`}
                          >
                            <Check size={13} />
                            <span>{item.status === 'pago' ? 'Desfazer' : 'Confirmar Pgto'}</span>
                          </button>
                          <button
                            onClick={() => setItemParaExcluir(item)}
                            title="Excluir Lançamento"
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Visualização em Cards para Mobile */}
        <div className="lg:hidden divide-y divide-[#E8E2D9]">
          {lancamentosFiltrados.length === 0 ? (
            <div className="py-10 text-center text-xs text-[#9B9087]">
              Nenhum lançamento financeiro encontrado.
            </div>
          ) : (
            lancamentosFiltrados.map(item => {
              const dataVenc = new Date(item.dueDate);
              dataVenc.setHours(0, 0, 0, 0);
              const isAtrasado = item.status === 'pendente' && dataVenc < hoje;

              return (
                <div key={item.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-sm text-[#1B1410]">{item.clientName}</span>
                      {item.contractNumber && (
                        <span className="text-[10px] text-[#C5A265] ml-2 font-mono">{item.contractNumber}</span>
                      )}
                    </div>
                    {item.status === 'pago' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        Recebido
                      </span>
                    ) : isAtrasado ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-800">
                        Atrasado
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                        A Vencer
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-[#6E645C]">{item.description}</div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <div className="text-[11px] text-[#9B9087]">
                        Venc: {new Date(item.dueDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </div>
                      <div className="text-base font-bold text-[#1B1410]">{formatarMoeda(item.amount)}</div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleAlternarStatus(item)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 ${
                          item.status === 'pago'
                            ? 'bg-zinc-100 text-zinc-700'
                            : 'bg-emerald-600 text-white shadow-sm'
                        }`}
                      >
                        <Check size={14} />
                        <span>{item.status === 'pago' ? 'Desfazer' : 'Pago'}</span>
                      </button>
                      <button
                        onClick={() => setItemParaExcluir(item)}
                        className="p-2 text-red-500 bg-red-50 rounded-xl"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal para Novo Lançamento Manual */}
      {modalNovoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl border border-[#E8E2D9] shadow-2xl max-w-lg w-full overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D9]">
              <h3 className="font-semibold text-base text-[#1B1410]">Novo Lançamento / Recebimento</h3>
              <button
                onClick={() => setModalNovoAberto(false)}
                className="text-[#9B9087] hover:text-[#231B15] p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCriarLancamento} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-semibold text-[#231B15] mb-1">Cliente *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do cliente"
                  value={novoLancamento.clientName}
                  onChange={e => setNovoLancamento({ ...novoLancamento, clientName: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-xs text-[#231B15] focus:outline-none focus:border-[#C5A265]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#231B15] mb-1">Descrição do Recebimento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Entrada 50%, Parcela 2/3, Adiantamento"
                  value={novoLancamento.description}
                  onChange={e => setNovoLancamento({ ...novoLancamento, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-xs text-[#231B15] focus:outline-none focus:border-[#C5A265]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#231B15] mb-1">Valor (R$) *</label>
                  <input
                    type="text"
                    required
                    placeholder="0,00"
                    value={novoLancamento.amount}
                    onChange={e => setNovoLancamento({ ...novoLancamento, amount: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-xs text-[#231B15] focus:outline-none focus:border-[#C5A265]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#231B15] mb-1">Vencimento *</label>
                  <input
                    type="date"
                    required
                    value={novoLancamento.dueDate}
                    onChange={e => setNovoLancamento({ ...novoLancamento, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-xs text-[#231B15] focus:outline-none focus:border-[#C5A265]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#231B15] mb-1">Forma de Pagamento</label>
                <select
                  value={novoLancamento.paymentMethod}
                  onChange={e => setNovoLancamento({ ...novoLancamento, paymentMethod: e.target.value as any })}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-xs text-[#231B15] focus:outline-none focus:border-[#C5A265]"
                >
                  <option value="pix">PIX</option>
                  <option value="boleto">Boleto Bancário</option>
                  <option value="cartao">Cartão de Crédito</option>
                  <option value="transferencia">Transferência Bancária</option>
                  <option value="dinheiro">Dinheiro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#231B15] mb-1">Observações (opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Chave PIX ou observação da obra"
                  value={novoLancamento.notes}
                  onChange={e => setNovoLancamento({ ...novoLancamento, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-xs text-[#231B15] focus:outline-none focus:border-[#C5A265]"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#E8E2D9]">
                <button
                  type="button"
                  onClick={() => setModalNovoAberto(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6E645C] hover:bg-[#FAF8F5]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvandoNovo}
                  className="px-5 py-2 bg-[#C5A265] hover:bg-[#DFC28B] text-[#1B1410] rounded-xl text-xs font-semibold disabled:opacity-50"
                >
                  {salvandoNovo ? 'Salvando...' : 'Salvar Lançamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Exclusão */}
      <ConfirmModal
        isOpen={Boolean(itemParaExcluir)}
        title="Excluir Lançamento Financeiro"
        message={`Deseja excluir o lançamento "${itemParaExcluir?.description || ''}" no valor de ${formatarMoeda(itemParaExcluir?.amount || 0)}?`}
        confirmLabel="Sim, Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        loading={excluindo}
        onConfirm={handleConfirmarExclusao}
        onCancel={() => setItemParaExcluir(null)}
      />
    </div>
  );
};
