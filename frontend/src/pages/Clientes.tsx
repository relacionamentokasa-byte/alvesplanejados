import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  FileText,
  FileCheck,
  Edit2,
  Trash2,
  X,
  Check,
  Building,
  User,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { AlvesStore } from '../services/alvesStore';
import { Cliente, Proposta, Contrato } from '../types/alves';

export const ClientesPage: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [busca, setBusca] = useState('');
  const [clienteSelecionadoHistorico, setClienteSelecionadoHistorico] = useState<Cliente | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    documento: '',
    telefone: '',
    whatsapp: '',
    email: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: 'São Paulo',
    uf: 'SP',
    cep: '',
    observacoes: ''
  });

  const carregarDados = async () => {
    const [clientes, propostas, contratos] = await Promise.all([
      AlvesStore.getClientes(), AlvesStore.getPropostas(), AlvesStore.getContratos()
    ]);
    setClientes(clientes);
    setPropostas(propostas);
    setContratos(contratos);
  };

  useEffect(() => {
    carregarDados().catch((error) => console.error('Erro ao carregar clientes:', error));
  }, []);

  const openCreateModal = () => {
    setEditingCliente(null);
    setFormData({
      nome: '',
      documento: '',
      telefone: '',
      whatsapp: '',
      email: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: 'São Paulo',
      uf: 'SP',
      cep: '',
      observacoes: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cli: Cliente) => {
    setEditingCliente(cli);
    setFormData({
      nome: cli.nome,
      documento: cli.documento,
      telefone: cli.telefone,
      whatsapp: cli.whatsapp,
      email: cli.email,
      logradouro: cli.endereco.logradouro,
      numero: cli.endereco.numero,
      complemento: cli.endereco.complemento || '',
      bairro: cli.endereco.bairro,
      cidade: cli.endereco.cidade,
      uf: cli.endereco.uf,
      cep: cli.endereco.cep,
      observacoes: cli.observacoes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim()) return;

    await AlvesStore.saveCliente({
      id: editingCliente?.id,
      nome: formData.nome,
      documento: formData.documento,
      telefone: formData.telefone,
      whatsapp: formData.whatsapp || formData.telefone,
      email: formData.email,
      endereco: {
        logradouro: formData.logradouro,
        numero: formData.numero,
        complemento: formData.complemento,
        bairro: formData.bairro,
        cidade: formData.cidade,
        uf: formData.uf,
        cep: formData.cep
      },
      observacoes: formData.observacoes
    });

    setIsModalOpen(false);
    await carregarDados();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este cliente?')) {
      await AlvesStore.deleteCliente(id);
      await carregarDados();
      if (clienteSelecionadoHistorico?.id === id) {
        setClienteSelecionadoHistorico(null);
      }
    }
  };

  const clientesFiltrados = clientes.filter(c => {
    const termo = busca.toLowerCase();
    return (
      c.nome.toLowerCase().includes(termo) ||
      c.documento.toLowerCase().includes(termo) ||
      c.email.toLowerCase().includes(termo) ||
      c.whatsapp.toLowerCase().includes(termo)
    );
  });

  const getPropostasCliente = (clienteId: string) => {
    return propostas.filter(p => p.clienteId === clienteId);
  };

  const getContratosCliente = (clienteId: string) => {
    return contratos.filter(c => c.clienteId === clienteId);
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sans text-2xl font-semibold text-[#231B15]">Clientes</h1>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center space-x-2 bg-[#C5A265] hover:bg-[#DFC28B] text-[#1B1410] font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all text-xs"
        >
          <Plus size={16} />
          <span>+ Novo Cliente</span>
        </button>
      </div>

      {/* Barra de Busca e Filtro */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8E2D9] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9B9087]" />
          <input
            type="text"
            placeholder="Pesquisar por nome, CPF/CNPJ, WhatsApp ou e-mail..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-xs text-[#231B15] placeholder-[#9B9087] focus:outline-none focus:border-[#C5A265] transition-colors"
          />
        </div>
        <div className="text-xs text-[#6E645C] self-end sm:self-center">
          Total: <span className="font-semibold text-[#231B15]">{clientesFiltrados.length} clientes</span>
        </div>
      </div>

      {/* Grid de Clientes e Histórico Lateral */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Clientes (Cards) */}
        <div className="lg:col-span-2 space-y-3">
          {clientesFiltrados.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-[#E8E2D9]">
              <Users size={32} className="mx-auto text-[#9B9087] mb-3" />
              <p className="text-sm font-semibold text-[#231B15]">Nenhum cliente encontrado</p>
              <p className="text-xs text-[#6E645C] mt-1">Cadastre um novo cliente para começar a gerar propostas.</p>
            </div>
          ) : (
            clientesFiltrados.map((cli) => {
              const propsCli = getPropostasCliente(cli.id);
              const ctrsCli = getContratosCliente(cli.id);
              const isSelected = clienteSelecionadoHistorico?.id === cli.id;

              return (
                <div
                  key={cli.id}
                  onClick={() => setClienteSelecionadoHistorico(cli)}
                  className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#C5A265] ring-2 ring-[#C5A265]/20 shadow-md bg-[#FAF8F5]/40'
                      : 'border-[#E8E2D9] hover:border-[#C5A265]/40 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-sans text-base font-semibold text-[#1B1410]">{cli.nome}</span>
                        {cli.documento && (
                          <span className="text-[11px] bg-[#F2EFEB] text-[#6E645C] px-2 py-0.5 rounded-md font-mono">
                            {cli.documento}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#6E645C] pt-2">
                        {cli.whatsapp && (
                          <a
                            href={`https://wa.me/55${cli.whatsapp.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg text-xs font-semibold active:scale-95 transition-transform"
                          >
                            <MessageSquare size={13} className="text-emerald-600" />
                            <span>WhatsApp</span>
                          </a>
                        )}
                        {cli.whatsapp && (
                          <a
                            href={`tel:${cli.whatsapp.replace(/\D/g, '')}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center space-x-1 bg-[#FAF8F5] text-[#231B15] hover:bg-[#F2EFEB] border border-[#E8E2D9] px-2.5 py-1 rounded-lg text-xs font-medium active:scale-95 transition-transform"
                          >
                            <span>Ligar</span>
                          </a>
                        )}
                        {cli.email && (
                          <a
                            href={`mailto:${cli.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center space-x-1 text-[#6E645C] hover:text-[#1B1410] px-1 py-0.5"
                          >
                            <Mail size={13} className="text-[#9B9087]" />
                            <span className="truncate max-w-[150px]">{cli.email}</span>
                          </a>
                        )}
                        {cli.endereco.cidade && (
                          <span className="flex items-center space-x-1 text-[#9B9087]">
                            <MapPin size={13} className="text-[#9B9087]" />
                            <span>{cli.endereco.bairro}, {cli.endereco.cidade}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(cli);
                        }}
                        title="Editar Cliente"
                        className="p-1.5 text-[#6E645C] hover:text-[#1B1410] hover:bg-[#F2EFEB] rounded-lg transition-colors"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(cli.id);
                        }}
                        title="Excluir"
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {cli.observacoes && (
                    <p className="text-[11px] text-[#8C7D73] bg-[#FAF8F5] p-2 rounded-lg mt-3 border border-[#E8E2D9]">
                      <span className="font-semibold text-[#231B15]">Nota:</span> {cli.observacoes}
                    </p>
                  )}

                  {/* Badges de Propostas e Contratos */}
                  <div className="mt-3 pt-3 border-t border-[#E8E2D9] flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center space-x-1 text-[#6E645C]">
                        <FileText size={13} className="text-[#C5A265]" />
                        <span>{propsCli.length} {propsCli.length === 1 ? 'proposta' : 'propostas'}</span>
                      </span>
                      <span className="flex items-center space-x-1 text-[#6E645C]">
                        <FileCheck size={13} className="text-emerald-600" />
                        <span>{ctrsCli.length} {ctrsCli.length === 1 ? 'contrato' : 'contratos'}</span>
                      </span>
                    </div>

                    <Link
                      to={`/propostas/nova?clienteId=${cli.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[11px] font-semibold text-[#C5A265] hover:text-[#9E7E45] flex items-center space-x-1"
                    >
                      <span>+ Criar Proposta</span>
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Coluna de Histórico do Cliente Selecionado */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E2D9] shadow-sm flex flex-col h-fit sticky top-20">
          <div className="border-b border-[#E8E2D9] pb-3 mb-4">
            <h3 className="font-sans text-base font-semibold text-[#231B15]">Histórico do Cliente</h3>
            <p className="text-xs text-[#6E645C] mt-0.5">
              {clienteSelecionadoHistorico ? clienteSelecionadoHistorico.nome : 'Selecione um cliente para ver o histórico'}
            </p>
          </div>

          {clienteSelecionadoHistorico ? (
            <div className="space-y-4">
              {/* Propostas */}
              <div>
                <h4 className="text-xs font-semibold text-[#6E645C] uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Propostas ({getPropostasCliente(clienteSelecionadoHistorico.id).length})</span>
                </h4>

                <div className="space-y-2">
                  {getPropostasCliente(clienteSelecionadoHistorico.id).length === 0 ? (
                    <p className="text-xs text-[#9B9087] italic">Nenhuma proposta vinculada.</p>
                  ) : (
                    getPropostasCliente(clienteSelecionadoHistorico.id).map(p => (
                      <div key={p.id} className="p-2.5 bg-[#FAF8F5] rounded-xl border border-[#E8E2D9] text-xs">
                        <div className="flex items-center justify-between font-semibold text-[#1B1410]">
                          <span>{p.numero}</span>
                          <span className="text-[#C5A265] font-bold">{formatarMoeda(p.condicoes.valorFinal)}</span>
                        </div>
                        <div className="text-[11px] text-[#6E645C] truncate mt-0.5">{p.nomeProjeto}</div>
                        <div className="mt-2 flex items-center justify-between pt-1 border-t border-[#E8E2D9]/60">
                          <span className="text-[10px] text-[#9B9087]">Status: {p.status}</span>
                          <Link
                            to={`/propostas/${p.id}/previa`}
                            className="text-[10px] font-semibold text-[#1B1410] hover:text-[#C5A265] flex items-center space-x-0.5"
                          >
                            <span>Ver Documento</span>
                            <ExternalLink size={10} />
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Contratos */}
              <div className="pt-2">
                <h4 className="text-xs font-semibold text-[#6E645C] uppercase tracking-wider mb-2">
                  Contratos ({getContratosCliente(clienteSelecionadoHistorico.id).length})
                </h4>

                <div className="space-y-2">
                  {getContratosCliente(clienteSelecionadoHistorico.id).length === 0 ? (
                    <p className="text-xs text-[#9B9087] italic">Nenhum contrato gerado ainda.</p>
                  ) : (
                    getContratosCliente(clienteSelecionadoHistorico.id).map(c => (
                      <div key={c.id} className="p-2.5 bg-[#FAF3E8]/40 rounded-xl border border-[#C5A265]/30 text-xs">
                        <div className="flex items-center justify-between font-semibold text-[#1B1410]">
                          <span>{c.numero}</span>
                          <span className="text-emerald-800 font-bold">{formatarMoeda(c.valorTotal)}</span>
                        </div>
                        <div className="text-[11px] text-[#6E645C] truncate mt-0.5">{c.nomeProjeto}</div>
                        <div className="mt-2 flex items-center justify-between pt-1 border-t border-[#C5A265]/20">
                          <span className="text-[10px] text-[#9E7E45] font-medium uppercase">
                            {c.status.replace('_', ' ')}
                          </span>
                          <Link
                            to={`/contratos`}
                            className="text-[10px] font-semibold text-[#1B1410] hover:text-[#C5A265]"
                          >
                            Ver Contrato
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-[#9B9087]">
              Clique em qualquer cliente ao lado para carregar todas as propostas, contratos e detalhes vinculados.
            </div>
          )}
        </div>
      </div>

      {/* Modal de Criação / Edição de Cliente */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#E8E2D9] shadow-premium-lg overflow-hidden animate-scaleUp my-8">
            <div className="bg-[#1B1410] text-[#FAF8F5] p-5 sm:p-6 flex items-center justify-between border-b border-[#2A1F19]">
              <div>
                <h3 className="font-sans text-lg font-semibold text-[#FAF8F5]">
                  {editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-[#9B9087] hover:text-white rounded-lg hover:bg-[#2A1F19] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-semibold text-[#231B15]">Nome Completo ou Razão Social *</label>
                  <input
                    type="text"
                    required
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Dra. Camila Vasconcellos ou Empresa LTDA"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-xs text-[#231B15] focus:outline-none focus:border-[#C5A265]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#231B15]">CPF ou CNPJ</label>
                  <input
                    type="text"
                    value={formData.documento}
                    onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                    placeholder="000.000.000-00 ou 00.000.000/0001-00"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-xs text-[#231B15] focus:outline-none focus:border-[#C5A265]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#231B15]">WhatsApp Comercial / Celular *</label>
                  <input
                    type="text"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="(11) 98765-4321"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-xs text-[#231B15] focus:outline-none focus:border-[#C5A265]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#231B15]">Telefone Fixo / Recado</label>
                  <input
                    type="text"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    placeholder="(11) 3456-7890"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-xs text-[#231B15] focus:outline-none focus:border-[#C5A265]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#231B15]">E-mail para Envio de Propostas</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="cliente@email.com"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-xs text-[#231B15] focus:outline-none focus:border-[#C5A265]"
                  />
                </div>
              </div>

              {/* Endereço */}
              <div className="pt-2 border-t border-[#E8E2D9]">
                <h4 className="font-semibold text-[#1B1410] mb-3">Endereço Residencial / Comercial</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[#6E645C]">Logradouro (Rua, Av, Al.)</label>
                    <input
                      type="text"
                      value={formData.logradouro}
                      onChange={(e) => setFormData({ ...formData, logradouro: e.target.value })}
                      placeholder="Ex: Alameda Gabriel Monteiro da Silva"
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-xs text-[#231B15]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#6E645C]">Número</label>
                    <input
                      type="text"
                      value={formData.numero}
                      onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                      placeholder="Ex: 1450"
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-xs text-[#231B15]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#6E645C]">Complemento / Apto</label>
                    <input
                      type="text"
                      value={formData.complemento}
                      onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                      placeholder="Ex: Apto 182"
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-xs text-[#231B15]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#6E645C]">Bairro</label>
                    <input
                      type="text"
                      value={formData.bairro}
                      onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                      placeholder="Ex: Jardins"
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-xs text-[#231B15]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#6E645C]">Cidade / UF</label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={formData.cidade}
                        onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                        placeholder="São Paulo"
                        className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-xs text-[#231B15]"
                      />
                      <input
                        type="text"
                        value={formData.uf}
                        onChange={(e) => setFormData({ ...formData, uf: e.target.value })}
                        placeholder="SP"
                        className="w-16 px-2 py-2 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-xs text-[#231B15] text-center"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Observações */}
              <div className="pt-2 border-t border-[#E8E2D9] space-y-1">
                <label className="font-semibold text-[#231B15]">Observações ou Preferências do Cliente</label>
                <textarea
                  rows={2}
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Ex: Prefere tons amadeirados escuros, fechamento com amortecedores especiais, arquiteto responsável..."
                  className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-xs text-[#231B15]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-[#E8E2D9]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#E8E2D9] text-[#6E645C] hover:bg-[#F2EFEB] text-xs font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#C5A265] hover:bg-[#DFC28B] text-[#1B1410] text-xs font-semibold shadow-sm transition-all"
                >
                  {editingCliente ? 'Salvar Alterações' : 'Cadastrar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
