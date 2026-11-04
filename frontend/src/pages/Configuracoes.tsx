import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building,
  FileText,
  MessageSquare,
  Shield,
  Save,
  CheckCircle2,
  Plus,
  Trash2
} from 'lucide-react';
import { AlvesStore } from '../services/alvesStore';
import { ConfiguracoesEmpresa, ClausulaContrato } from '../types/alves';

export const ConfiguracoesPage: React.FC = () => {
  const [config, setConfig] = useState<ConfiguracoesEmpresa | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [salvoFeedback, setSalvoFeedback] = useState(false);

  const carregar = () => {
    setCarregando(true);
    setErro(null);
    AlvesStore.getConfig()
      .then((data) => setConfig(data))
      .catch((error) => {
        console.error('Erro ao carregar configuração:', error);
        setErro('Não foi possível carregar as configurações. Verifique a conexão com o servidor.');
      })
      .finally(() => setCarregando(false));
  };

  useEffect(() => {
    carregar();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    await AlvesStore.saveConfig(config);
    setSalvoFeedback(true);
    setTimeout(() => setSalvoFeedback(false), 3000);
  };

  const handleAddClausula = () => {
    if (!config) return;
    const nova: ClausulaContrato = {
      id: 'cl-' + Date.now(),
      titulo: 'NOVA CLÁUSULA PERSONALIZADA',
      conteudo: 'Descreva aqui o texto e as condições desta cláusula...'
    };
    setConfig({ ...config, clausulasContratoPadrao: [...config.clausulasContratoPadrao, nova] });
  };

  const handleRemoveClausula = (id: string) => {
    if (!config) return;
    setConfig({ ...config, clausulasContratoPadrao: config.clausulasContratoPadrao.filter(c => c.id !== id) });
  };

  const handleUpdateClausula = (id: string, updates: Partial<ClausulaContrato>) => {
    if (!config) return;
    setConfig({ ...config, clausulasContratoPadrao: config.clausulasContratoPadrao.map(c => (c.id === id ? { ...c, ...updates } : c)) });
  };

  if (carregando) return <div className="p-8 text-sm text-[#6E645C]">Carregando configurações...</div>;

  if (erro || !config) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm text-red-600">{erro || 'Erro ao carregar configurações.'}</p>
        <button
          onClick={carregar}
          className="px-4 py-2 bg-[#9E7E45] text-white text-xs font-semibold rounded-lg hover:bg-[#856834] transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sans text-2xl font-semibold text-[#231B15]">Configurações</h1>
        </div>

        {salvoFeedback && (
          <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-2 rounded-xl text-xs font-semibold animate-fadeIn">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>Configurações salvas com sucesso!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Dados da Empresa */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E2D9] shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#E8E2D9] pb-3">
            <Building size={16} className="text-[#C5A265]" />
            <h2 className="font-sans text-base font-semibold text-[#1B1410]">Dados Cadastrais</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-[#231B15]">Razão Social</label>
              <input
                type="text"
                value={config.razaoSocial}
                onChange={(e) => setConfig({ ...config, razaoSocial: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#231B15]">Nome Fantasia</label>
              <input
                type="text"
                value={config.nomeFantasia}
                onChange={(e) => setConfig({ ...config, nomeFantasia: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#231B15]">CNPJ</label>
              <input
                type="text"
                value={config.cnpj}
                onChange={(e) => setConfig({ ...config, cnpj: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#231B15]">WhatsApp Comercial</label>
              <input
                type="text"
                value={config.whatsapp}
                onChange={(e) => setConfig({ ...config, whatsapp: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-xs"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-[#231B15]">Endereço Completo</label>
              <input
                type="text"
                value={config.enderecoCompleto}
                onChange={(e) => setConfig({ ...config, enderecoCompleto: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-xs"
              />
            </div>
          </div>
        </div>

        {/* Textos Institucionais & WhatsApp */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E2D9] shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#E8E2D9] pb-3">
            <MessageSquare size={16} className="text-[#C5A265]" />
            <h2 className="font-sans text-base font-semibold text-[#1B1410]">Textos de Apresentação & Mensagens WhatsApp</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="font-semibold text-[#231B15]">Texto Introdutório da Proposta (Conceito Alves)</label>
              <textarea
                rows={3}
                value={config.textoApresentacaoPadrao}
                onChange={(e) => setConfig({ ...config, textoApresentacaoPadrao: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-xs leading-relaxed"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#231B15]">
                Mensagem Padrão para Envio pelo WhatsApp (Tags: {`{CLIENTE}, {PROJETO}, {LINK}`})
              </label>
              <textarea
                rows={3}
                value={config.mensagemWhatsappPadrao}
                onChange={(e) => setConfig({ ...config, mensagemWhatsappPadrao: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#231B15]">Termos de Garantia Padrão</label>
              <textarea
                rows={2}
                value={config.termosGarantiaPadrao}
                onChange={(e) => setConfig({ ...config, termosGarantiaPadrao: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-xs leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Cláusulas do Contrato Padrão */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E2D9] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-3">
            <div className="flex items-center space-x-2">
              <Shield size={16} className="text-[#C5A265]" />
              <h2 className="font-sans text-base font-semibold text-[#1B1410]">
                Cláusulas Padrão para Contratos de Marcenaria ({config.clausulasContratoPadrao.length})
              </h2>
            </div>
            <button
              type="button"
              onClick={handleAddClausula}
              className="text-xs font-semibold text-[#C5A265] hover:text-[#9E7E45] flex items-center space-x-1"
            >
              <Plus size={14} />
              <span>+ Adicionar Cláusula</span>
            </button>
          </div>

          <div className="space-y-3">
            {config.clausulasContratoPadrao.map((cl, idx) => (
              <div key={cl.id} className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8E2D9] space-y-2">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={cl.titulo}
                    onChange={(e) => handleUpdateClausula(cl.id, { titulo: e.target.value })}
                    className="font-sans font-bold text-xs text-[#1B1410] bg-transparent border-b border-dashed border-[#E8E2D9] w-2/3"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveClausula(cl.id)}
                    className="text-red-400 hover:text-red-600 p-1"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={cl.conteudo}
                  onChange={(e) => handleUpdateClausula(cl.id, { conteudo: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-[#E8E2D9] rounded-xl text-xs leading-relaxed"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Salvar */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-[#C5A265] hover:bg-[#DFC28B] text-[#1B1410] font-bold text-xs rounded-xl shadow-gold-glow transition-all"
          >
            <Save size={16} />
            <span>Salvar Todas as Configurações</span>
          </button>
        </div>
      </form>
    </div>
  );
};
