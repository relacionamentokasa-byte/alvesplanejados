import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Calendar,
  Layers,
  Phone,
  MessageSquare,
  Building,
  Check,
  X,
  FileCheck,
  Printer,
  Maximize2,
  Moon,
  Sun
} from 'lucide-react';
import { BrandMark } from '../components/BrandMark';
import { ImageLightbox, LightboxImage } from '../components/ImageLightbox';
import { AlvesStore } from '../services/alvesStore';
import { Proposta, ConfiguracoesEmpresa } from '../types/alves';

export const PropostaPublicaPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [proposta, setProposta] = useState<Proposta | null>(null);
  const [config, setConfig] = useState<ConfiguracoesEmpresa | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados de Interação do Cliente
  const [modalAprovarOpen, setModalAprovarOpen] = useState(false);
  const [modalAjusteOpen, setModalAjusteOpen] = useState(false);
  const [nomeAprovador, setNomeAprovador] = useState('');
  const [observacaoAprovacao, setObservacaoAprovacao] = useState('');
  const [observacaoAjuste, setObservacaoAjuste] = useState('');
  const [sucessoMensagem, setSucessoMensagem] = useState<string | null>(null);

  // Modo Apresentação Escura
  const [modoEscuro, setModoEscuro] = useState(() => {
    return localStorage.getItem('alves_modo_apresentacao') === 'dark';
  });

  const toggleModoEscuro = () => {
    setModoEscuro((prev) => {
      const next = !prev;
      localStorage.setItem('alves_modo_apresentacao', next ? 'dark' : 'light');
      return next;
    });
  };

  // Estado da Galeria Lightbox 3D
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState<LightboxImage[]>([]);

  const handleAbrirLightbox = (imagensAmbiente: { id: string; url: string; nome: string }[], imagemSelecionadaId: string, nomeAmbiente: string) => {
    // Monta lista de imagens com o contexto do ambiente
    const formatadas: LightboxImage[] = imagensAmbiente.map(img => ({
      id: img.id,
      url: img.url,
      nome: img.nome,
      ambienteNome: nomeAmbiente
    }));
    setLightboxImages(formatadas);
    const index = formatadas.findIndex(img => img.id === imagemSelecionadaId);
    setLightboxIndex(index >= 0 ? index : 0);
    setLightboxOpen(true);
  };

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    Promise.all([AlvesStore.getPropostaByToken(token), AlvesStore.getConfigPublica()])
      .then(([prop, loadedConfig]) => {
        setProposta(prop ?? null);
        setConfig(loadedConfig);
        if (prop) setNomeAprovador(prop.cliente.nome);
      })
      .catch((error) => console.error('Erro ao carregar proposta pública:', error))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading || !config) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-[#C5A265] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#6E645C] font-medium">Carregando Proposta Comercial Alves Planejados...</p>
        </div>
      </div>
    );
  }

  if (loading || !config) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-[#C5A265] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#6E645C] font-medium">Carregando Proposta Comercial Alves Planejados...</p>
        </div>
      </div>
    );
  }

  if (!proposta) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#E8E2D9] shadow-premium max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-[#C5A265]">
            <AlertCircle size={28} />
          </div>
          <h1 className="font-sans text-xl font-bold text-[#1B1410]">Proposta Não Encontrada</h1>
          <p className="text-xs text-[#6E645C] leading-relaxed">
            Este link de proposta pode ter expirado ou sido atualizado para uma versão mais recente pela equipe Alves Planejados.
          </p>
        </div>
      </div>
    );
  }

  const formatarMoeda = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleConfirmarAprovacao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const propAtualizada = await AlvesStore.aprovarPropostaPublica(
        token,
        nomeAprovador || proposta.cliente.nome,
        observacaoAprovacao
      );
      if (propAtualizada) {
        setProposta(propAtualizada);
        setModalAprovarOpen(false);
        setSucessoMensagem('Proposta Comercial Aprovada com Sucesso! Nossa equipe entrará em contato para os próximos passos da medição e contrato.');
      }
    } catch (error) {
      console.error('Erro ao aprovar proposta:', error);
      setSucessoMensagem('Não foi possível registrar a aprovação. Atualize a página e tente novamente.');
    }
  };

  const handleConfirmarAjuste = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !observacaoAjuste.trim()) return;

    try {
      const propAtualizada = await AlvesStore.solicitarAjustePropostaPublica(
        token,
        nomeAprovador || proposta.cliente.nome,
        observacaoAjuste
      );
      if (propAtualizada) {
        setProposta(propAtualizada);
        setModalAjusteOpen(false);
        setSucessoMensagem('Solicitação de ajuste enviada! O consultor responsável revisará as alterações solicitadas.');
      }
    } catch (error) {
      console.error('Erro ao solicitar ajuste:', error);
      setSucessoMensagem('Não foi possível enviar a solicitação de ajuste. Atualize a página e tente novamente.');
    }
  };

  const isAprovada = proposta.status === 'aprovada' || proposta.status === 'contrato_gerado';

  return (
    <div
      className={`min-h-screen transition-colors duration-300 font-sans pb-24 selection:bg-[#C5A265]/30 ${
        modoEscuro ? 'bg-[#0F0C0A] text-[#FAF8F5]' : 'bg-[#FAF8F5] text-[#231B15]'
      }`}
    >
      {/* Top Header Barra do Cliente */}
      <header className="bg-[#1B1410] text-[#FAF8F5] px-4 sm:px-8 py-4 border-b border-[#2A1F19] sticky top-0 z-30 shadow-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BrandMark variant="header" contrast="light" className="!px-1.5 !py-1" />
            <div className="hidden sm:block">
              <div className="font-brand font-bold text-sm text-[#FAF8F5]">ALVES PLANEJADOS</div>
              <div className="text-[10px] text-[#C5A265] uppercase tracking-wider">Apresentação Oficial</div>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 text-xs">
            {/* Toggle Modo Apresentação */}
            <button
              type="button"
              onClick={toggleModoEscuro}
              className={`px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 transition-all text-xs font-semibold ${
                modoEscuro
                  ? 'bg-[#C5A265] text-[#1B1410] border-[#DFC28B] shadow-gold-glow'
                  : 'bg-[#2A1F19] text-[#D9D2C7] hover:text-white border-[#382B23]'
              }`}
              title={modoEscuro ? 'Alternar para Modo Claro' : 'Ativar Modo Apresentação Escura'}
            >
              {modoEscuro ? <Sun size={13} /> : <Moon size={13} />}
              <span className="hidden sm:inline">
                {modoEscuro ? 'Modo Claro' : 'Modo Apresentação'}
              </span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-[#2A1F19] hover:bg-[#382B23] text-[#FAF8F5] rounded-xl border border-[#382B23] flex items-center space-x-1 transition-colors"
            >
              <Printer size={13} />
              <span className="hidden sm:inline">Imprimir / Salvar PDF</span>
            </button>
            <div className="px-3 py-1 bg-[#241C18] border border-[#C5A265]/40 rounded-xl text-[#DFC28B] font-mono font-bold text-[11px]">
              {proposta.numero}
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 mt-4">
        {/* Banner de Sucesso / Feedback */}
        {sucessoMensagem && (
          <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-3xl text-emerald-900 flex items-start space-x-3 shadow-sm animate-fadeIn">
            <CheckCircle2 size={22} className="text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold text-sm">Ação Registrada com Sucesso!</p>
              <p className="mt-0.5 leading-relaxed">{sucessoMensagem}</p>
            </div>
          </div>
        )}

        {/* STATUS BAR DE APROVAÇÃO SE JÁ APROVADA */}
        {isAprovada && (
          <div className="bg-gradient-to-r from-emerald-800 to-emerald-900 text-white p-6 rounded-3xl shadow-premium flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-700/80 rounded-2xl">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h3 className="font-sans text-base font-bold">Proposta Comercial Aprovada</h3>
                <p className="text-xs text-emerald-100">
                  Aprovada por {proposta.aprovacao?.aprovadoPor} em {proposta.aprovacao ? new Date(proposta.aprovacao.aprovadoEm).toLocaleString('pt-BR') : ''}
                </p>
              </div>
            </div>
            <div className="text-xs bg-emerald-950/60 px-3.5 py-1.5 rounded-xl border border-emerald-500/30 text-emerald-200">
              Versão {proposta.versao} Confirmada
            </div>
          </div>
        )}

        {/* CAPA & APRESENTAÇÃO */}
        <div
          className={`rounded-3xl border shadow-premium-lg overflow-hidden transition-colors duration-300 ${
            modoEscuro ? 'bg-[#18120E] border-[#2E221B]' : 'bg-white border-[#E8E2D9]'
          }`}
        >
          {/* Header da Capa */}
          <div className="bg-gradient-to-b from-[#1B1410] via-[#241C18] to-[#1B1410] text-[#FAF8F5] p-8 sm:p-12 relative overflow-hidden border-b border-[#C5A265]/40">
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center space-x-2 bg-[#C5A265]/20 text-[#DFC28B] px-3 py-1 rounded-full text-xs font-semibold border border-[#C5A265]/30">
                <span>Proposta Comercial</span>
              </div>
              <h1 className="font-brand text-2xl sm:text-4xl font-bold text-[#FAF8F5] leading-tight">
                {proposta.nomeProjeto}
              </h1>
              <div className="flex flex-wrap gap-y-2 gap-x-6 text-xs text-[#D9D2C7] pt-2">
                <div><span className="text-[#9B9087]">Cliente:</span> <strong className="text-white">{proposta.cliente.nome}</strong></div>
                <div><span className="text-[#9B9087]">Obra:</span> <span className="text-white">{proposta.enderecoObra}</span></div>
                <div><span className="text-[#9B9087]">Emissão:</span> <span>{new Date(proposta.dataEmissao).toLocaleDateString('pt-BR')}</span></div>
              </div>
            </div>
          </div>

          {/* Texto Institucional */}
          <div
            className={`p-6 sm:p-10 border-b text-xs sm:text-sm leading-relaxed transition-colors duration-300 ${
              modoEscuro
                ? 'bg-[#1F1713] border-[#2E221B] text-[#D9D2C7]'
                : 'bg-[#FAF8F5]/60 border-[#E8E2D9] text-[#6E645C]'
            }`}
          >
            {config.textoApresentacaoPadrao}
          </div>

          {/* AMBIENTES */}
          <div className="p-6 sm:p-10 space-y-10">
            <h2
              className={`font-sans text-2xl font-bold border-b pb-3 transition-colors duration-300 ${
                modoEscuro ? 'text-[#FAF8F5] border-[#2E221B]' : 'text-[#1B1410] border-[#E8E2D9]'
              }`}
            >
              Ambientes do Projeto ({proposta.ambientes.length})
            </h2>

            <div className="space-y-10">
              {proposta.ambientes.map((amb, idx) => (
                <div key={amb.id} className="space-y-4">
                  <div
                    className={`flex items-center justify-between border-b pb-2 transition-colors duration-300 ${
                      modoEscuro ? 'border-[#2E221B]' : 'border-[#E8E2D9]'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="w-7 h-7 rounded-xl bg-[#1B1410] text-[#C5A265] border border-[#C5A265]/30 flex items-center justify-center font-bold text-xs">
                        0{idx + 1}
                      </span>
                      <h3
                        className={`font-sans text-lg font-bold ${
                          modoEscuro ? 'text-[#FAF8F5]' : 'text-[#1B1410]'
                        }`}
                      >
                        {amb.nome}
                      </h3>
                    </div>
                    {proposta.exibirValoresPorAmbiente && (
                      <span className="text-xs font-bold text-[#C5A265]">
                        {formatarMoeda(amb.valorSubtotal)}
                      </span>
                    )}
                  </div>

                  <p
                    className={`text-xs sm:text-sm leading-relaxed ${
                      modoEscuro ? 'text-[#B8ACA2]' : 'text-[#6E645C]'
                    }`}
                  >
                    {amb.descricao}
                  </p>

                  {/* Renders 3D */}
                  {amb.imagens && amb.imagens.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {amb.imagens.map((img) => (
                        <div
                          key={img.id}
                          onClick={() => handleAbrirLightbox(amb.imagens, img.id, amb.nome)}
                          className={`group relative rounded-2xl overflow-hidden border shadow-sm cursor-pointer hover:border-[#C5A265] transition-all ${
                            modoEscuro
                              ? 'border-[#382B23] bg-black/40 hover:shadow-gold-glow'
                              : 'border-[#E8E2D9] bg-black/5'
                          }`}
                        >
                          <div className="relative h-64 overflow-hidden">
                            <img
                              src={img.url}
                              alt={img.nome}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            {/* Overlay sutil de ampliação no hover */}
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#1B1410]/90 text-[#DFC28B] text-xs font-semibold backdrop-blur-sm border border-[#C5A265]/40 shadow-lg">
                                <Maximize2 size={13} />
                                <span>Ampliar em Alta Resolução</span>
                              </span>
                            </div>
                          </div>
                          <div
                            className={`p-2.5 text-xs font-medium border-t flex items-center justify-between transition-colors duration-300 ${
                              modoEscuro
                                ? 'bg-[#221813] text-[#FAF8F5] border-[#382B23]'
                                : 'bg-[#FAF8F5] text-[#231B15] border-[#E8E2D9]'
                            }`}
                          >
                            <span className="truncate">{img.nome}</span>
                            <span className="text-[10px] text-[#C5A265] font-semibold group-hover:underline">Toque para ver</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Especificações */}
                  <div
                    className={`p-4 rounded-2xl border text-xs space-y-1.5 transition-colors duration-300 ${
                      modoEscuro
                        ? 'bg-[#1F1713] border-[#2E221B]'
                        : 'bg-[#FAF8F5] border-[#E8E2D9]'
                    }`}
                  >
                    <span
                      className={`font-semibold block text-[11px] uppercase tracking-wider ${
                        modoEscuro ? 'text-[#DFC28B]' : 'text-[#1B1410]'
                      }`}
                    >
                      Módulos e Especificações:
                    </span>
                    <ul
                      className={`space-y-1 ${
                        modoEscuro ? 'text-[#B8ACA2]' : 'text-[#6E645C]'
                      }`}
                    >
                      {amb.itens.map(it => (
                        <li key={it.id} className="flex items-center justify-between py-1">
                          <span className="flex items-center space-x-2">
                            <span className="text-[#C5A265] font-bold">•</span>
                            <span>{it.descricao} ({it.quantidade} {it.unidade})</span>
                          </span>
                          {proposta.exibirValoresPorAmbiente && (
                            <span
                              className={`font-semibold ${
                                modoEscuro ? 'text-[#FAF8F5]' : 'text-[#1B1410]'
                              }`}
                            >
                              {formatarMoeda(it.valorTotal)}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* INVESTIMENTO & CONDIÇÕES */}
          <div
            className={`p-6 sm:p-10 border-t space-y-6 transition-colors duration-300 ${
              modoEscuro
                ? 'bg-[#1F1713] border-[#2E221B]'
                : 'bg-[#FAF8F5]/80 border-[#E8E2D9]'
            }`}
          >
            <h2
              className={`font-sans text-2xl font-bold ${
                modoEscuro ? 'text-[#FAF8F5]' : 'text-[#1B1410]'
              }`}
            >
              Investimento & Pagamento
            </h2>

            {/* Total */}
            <div className="bg-gradient-to-r from-[#1B1410] to-[#2A1F19] text-[#FAF8F5] p-6 sm:p-8 rounded-3xl border border-[#C5A265]/40 shadow-premium flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <span className="text-xs text-[#DFC28B] uppercase tracking-wider font-semibold">Investimento Total</span>
                <div className="text-3xl sm:text-4xl font-sans font-bold text-[#C5A265] mt-0.5">
                  {formatarMoeda(proposta.condicoes.valorFinal)}
                </div>
              </div>

              <div className="text-xs text-[#D9D2C7] space-y-1 text-left sm:text-right">
                <div>Prazo de Fabricação: <strong className="text-white">{proposta.condicoes.prazoExecucaoDias} dias úteis</strong></div>
                <div>Garantia Estrutural: <strong className="text-white">{proposta.condicoes.garantiaMeses} meses (5 anos)</strong></div>
                <div>Validade da Proposta: <strong className="text-[#DFC28B]">{new Date(proposta.dataValidade).toLocaleDateString('pt-BR')}</strong></div>
              </div>
            </div>

            {/* Parcelas */}
            <div
              className={`p-5 rounded-2xl border space-y-3 transition-colors duration-300 ${
                modoEscuro ? 'bg-[#18120E] border-[#2E221B]' : 'bg-white border-[#E8E2D9]'
              }`}
            >
              <h4
                className={`font-semibold text-xs uppercase tracking-wider ${
                  modoEscuro ? 'text-[#DFC28B]' : 'text-[#1B1410]'
                }`}
              >
                Cronograma de Pagamento:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {proposta.condicoes.parcelas.map(p => (
                  <div
                    key={p.numero}
                    className={`p-3 rounded-xl border text-xs transition-colors duration-300 ${
                      modoEscuro
                        ? 'bg-[#221813] border-[#382B23] text-[#FAF8F5]'
                        : 'bg-[#FAF8F5] border-[#E8E2D9] text-[#231B15]'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span>Parcela #{p.numero}</span>
                      <span className="text-[#C5A265] font-bold">{formatarMoeda(p.valor)}</span>
                    </div>
                    <div
                      className={`text-[11px] mt-0.5 ${
                        modoEscuro ? 'text-[#A89A90]' : 'text-[#6E645C]'
                      }`}
                    >
                      {p.descricao}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* O que está incluso */}
            <div
              className={`p-5 rounded-2xl border space-y-2 text-xs transition-colors duration-300 ${
                modoEscuro ? 'bg-[#18120E] border-[#2E221B]' : 'bg-white border-[#E8E2D9]'
              }`}
            >
              <h4 className="font-semibold text-emerald-400 flex items-center space-x-1.5">
                <CheckCircle2 size={14} />
                <span>O que está incluso no seu projeto</span>
              </h4>
              <ul
                className={`space-y-1 ${
                  modoEscuro ? 'text-[#B8ACA2]' : 'text-[#6E645C]'
                }`}
              >
                {proposta.condicoes.incluso.map((inc, i) => (
                  <li key={i} className="flex items-start space-x-1.5">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Rodapé da Empresa */}
          <div className="p-6 sm:p-8 bg-[#1B1410] text-[#FAF8F5] border-t border-[#2A1F19] text-xs text-center space-y-1">
            <div className="font-sans font-bold text-sm text-[#DFC28B]">{config.nomeFantasia}</div>
            <div className="text-[#D9D2C7]">{config.enderecoCompleto} • CNPJ: {config.cnpj}</div>
            <div className="text-[#9B9087]">Dúvidas? Entre em contato via WhatsApp: {config.whatsapp}</div>
          </div>
        </div>
      </div>

      {/* Floating Action Bar for Client Approval (Bottom Fixed com Safe Area do iOS) */}
      {!isAprovada && (
        <div className="fixed bottom-0 inset-x-0 bg-[#1B1410]/95 backdrop-blur-md border-t border-[#C5A265]/30 p-3 sm:p-4 pb-safe z-40 shadow-2xl">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-center sm:text-left">
              <div className="text-xs text-[#FAF8F5] font-semibold">Deseja aprovar esta proposta comercial?</div>
              <div className="text-[11px] text-[#C5A265]">
                Aprovação digital simplificada. Sem necessidade de login ou senha.
              </div>
            </div>

            <div className="flex items-center space-x-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setModalAjusteOpen(true)}
                className="flex-1 sm:flex-none px-4 py-3 sm:py-2.5 bg-[#2A1F19] hover:bg-[#382B23] text-[#FAF8F5] text-xs font-semibold rounded-xl border border-[#382B23] transition-colors active:scale-95"
              >
                Solicitar Ajuste
              </button>

              <button
                type="button"
                onClick={() => setModalAprovarOpen(true)}
                className="flex-1 sm:flex-none px-6 py-3 sm:py-2.5 bg-[#C5A265] hover:bg-[#DFC28B] text-[#1B1410] text-xs font-bold rounded-xl shadow-gold-glow transition-all flex items-center justify-center space-x-1.5 active:scale-95"
              >
                <CheckCircle2 size={16} />
                <span>APROVAR PROPOSTA</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Aprovação (Bottom Sheet no Mobile) */}
      {modalAprovarOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full border border-[#E8E2D9] shadow-premium-lg overflow-hidden p-6 space-y-4 text-xs animate-scaleUp max-h-[85dvh] overflow-y-auto pb-safe">
            <div className="sm:hidden w-10 h-1 bg-[#E8E2D9] rounded-full mx-auto -mt-2 mb-2" />
            <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-3">
              <h3 className="font-sans text-base font-bold text-[#1B1410] flex items-center space-x-2">
                <CheckCircle2 size={18} className="text-emerald-600" />
                <span>Confirmar Aprovação Comercial</span>
              </h3>
              <button onClick={() => setModalAprovarOpen(false)} className="text-[#9B9087] hover:text-[#231B15]">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmarAprovacao} className="space-y-4">
              <p className="text-[#6E645C] leading-relaxed">
                Ao confirmar, você concorda comercialmente com o escopo, valores e condições apresentados na <strong>{proposta.numero} (Versão {proposta.versao})</strong>.
              </p>

              <div className="space-y-1">
                <label className="font-semibold text-[#231B15]">Nome do Responsável pela Aprovação *</label>
                <input
                  type="text"
                  required
                  value={nomeAprovador}
                  onChange={(e) => setNomeAprovador(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-xs text-[#231B15]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#231B15]">Mensagem ou Observação Opcional</label>
                <textarea
                  rows={2}
                  value={observacaoAprovacao}
                  onChange={(e) => setObservacaoAprovacao(e.target.value)}
                  placeholder="Ex: Tudo perfeito, aguardo contato para agendamento da medição final..."
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-xs text-[#231B15]"
                />
              </div>

              <div className="p-3 bg-[#FAF3E8] rounded-xl text-[11px] text-[#9E7E45] border border-[#C5A265]/30">
                Esta ação registra a validação comercial do projeto. O contrato formal com assinatura jurídica será gerado a seguir.
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#E8E2D9]">
                <button
                  type="button"
                  onClick={() => setModalAprovarOpen(false)}
                  className="px-4 py-2 border border-[#E8E2D9] text-[#6E645C] rounded-xl"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm"
                >
                  Confirmar Aprovação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Solicitação de Ajuste */}
      {modalAjusteOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-[#E8E2D9] shadow-premium-lg overflow-hidden p-6 space-y-4 text-xs animate-scaleUp">
            <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-3">
              <h3 className="font-sans text-base font-bold text-[#1B1410] flex items-center space-x-2">
                <MessageSquare size={18} className="text-[#C5A265]" />
                <span>Solicitar Alterações no Projeto</span>
              </h3>
              <button onClick={() => setModalAjusteOpen(false)} className="text-[#9B9087] hover:text-[#231B15]">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmarAjuste} className="space-y-4">
              <p className="text-[#6E645C]">
                Descreva quais alterações ou dúvidas você possui a respeito dos ambientes, acabamentos ou condições de pagamento:
              </p>

              <div className="space-y-1">
                <label className="font-semibold text-[#231B15]">O que gostaria de ajustar? *</label>
                <textarea
                  rows={4}
                  required
                  value={observacaoAjuste}
                  onChange={(e) => setObservacaoAjuste(e.target.value)}
                  placeholder="Ex: Gostaria de alterar o acabamento da cozinha para Freijó e parcelar a entrada em 2x..."
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-xs text-[#231B15]"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#E8E2D9]">
                <button
                  type="button"
                  onClick={() => setModalAjusteOpen(false)}
                  className="px-4 py-2 border border-[#E8E2D9] text-[#6E645C] rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1B1410] hover:bg-[#2A1F19] text-[#FAF8F5] font-semibold rounded-xl"
                >
                  Enviar Solicitação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox 3D Imersivo */}
      <ImageLightbox
        isOpen={lightboxOpen}
        images={lightboxImages}
        initialIndex={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
};
