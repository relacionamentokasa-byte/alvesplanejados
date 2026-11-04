import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Printer,
  Share2,
  ExternalLink,
  Edit3,
  Copy,
  CheckCircle2,
  Clock,
  Shield,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Layers,
  ArrowLeft,
  FileCheck2,
  GitBranch,
  Building,
  Award,
  Maximize2,
  Moon,
  Sun,
  Trash2
} from 'lucide-react';
import { BrandMark } from '../components/BrandMark';
import { ImageLightbox, LightboxImage } from '../components/ImageLightbox';
import { ConfirmModal } from '../components/ConfirmModal';
import { AlvesStore } from '../services/alvesStore';
import { Proposta, ConfiguracoesEmpresa } from '../types/alves';

export const PreviaPropostaPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [proposta, setProposta] = useState<Proposta | null>(null);
  const [config, setConfig] = useState<ConfiguracoesEmpresa | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [modoEscuro, setModoEscuro] = useState(() => {
    return localStorage.getItem('alves_modo_apresentacao') === 'dark';
  });
  const [modalExclusaoAberto, setModalExclusaoAberto] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

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
    if (!id) {
      setCarregando(false);
      return;
    }
    Promise.all([AlvesStore.getPropostaById(id), AlvesStore.getConfig()])
      .then(([prop, loadedConfig]) => {
        setProposta(prop ?? null);
        setConfig(loadedConfig);
      })
      .catch((error) => console.error('Erro ao carregar prévia:', error))
      .finally(() => setCarregando(false));
  }, [id]);

  if (carregando || !config) {
    return <div className="p-8 text-sm text-[#6E645C]">Carregando prévia...</div>;
  }

  if (!proposta) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-[#E8E2D9] text-center space-y-4 max-w-md mx-auto my-12">
        <FileText size={40} className="mx-auto text-[#9B9087]" />
        <h2 className="font-sans text-lg font-semibold text-[#1B1410]">Proposta não encontrada</h2>
        <Link to="/propostas" className="text-xs text-[#C5A265] font-semibold hover:underline block">
          Voltar para Lista de Propostas
        </Link>
      </div>
    );
  }

  const formatarMoeda = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const publicUrl = `${window.location.origin}/p/${proposta.publicToken}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleShareWhatsapp = () => {
    const rawMsg = config.mensagemWhatsappPadrao;
    const msg = rawMsg
      .replace('{CLIENTE}', proposta.cliente.nome.split(' ')[0])
      .replace('{PROJETO}', proposta.nomeProjeto)
      .replace('{LINK}', publicUrl);

    const whatsLimpo = (proposta.cliente.whatsapp || proposta.cliente.telefone || '').replace(/\D/g, '');
    const url = whatsLimpo
      ? `https://api.whatsapp.com/send?phone=55${whatsLimpo}&text=${encodeURIComponent(msg)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;

    window.open(url, '_blank');
  };

  const handleCriarNovaVersao = async () => {
    if (!window.confirm(`Deseja gerar uma nova versão (V${proposta.versao + 1}) desta proposta mantendo o histórico?`)) return;
    try {
      const nova = await AlvesStore.criarNovaVersaoProposta(proposta.id);
      navigate(`/propostas/${nova.id}/editar`);
    } catch (error) {
      console.error('Erro ao criar nova versão:', error);
      alert('Não foi possível criar a nova versão da proposta.');
    }
  };

  const handleGerarContrato = async () => {
    if (!window.confirm('Deseja converter esta proposta aprovada em um Contrato Oficial da Alves Planejados?')) return;
    try {
      await AlvesStore.gerarContratoDeProposta(proposta.id);
      navigate('/contratos');
    } catch (error) {
      console.error('Erro ao gerar contrato:', error);
      alert('Não foi possível gerar o contrato desta proposta.');
    }
  };

  const handleConfirmarExclusao = async () => {
    if (!proposta) return;
    setLoadingDelete(true);
    try {
      await AlvesStore.deleteProposta(proposta.id);
      navigate('/propostas');
    } catch (error: any) {
      console.error('Erro ao excluir proposta:', error);
      alert(error?.message || 'Não foi possível excluir a proposta.');
    } finally {
      setLoadingDelete(false);
      setModalExclusaoAberto(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      {/* Action Toolbar (No Print) */}
      <div className="no-print bg-[#1B1410] text-[#FAF8F5] p-4 sm:p-5 rounded-3xl border border-[#2A1F19] shadow-premium flex flex-col md:flex-row md:items-center md:justify-between gap-4 sticky top-16 z-20 backdrop-blur">
        <div className="flex items-center space-x-3">
          <Link
            to="/propostas"
            className="p-2 bg-[#2A1F19] text-[#FAF8F5] hover:bg-[#382B23] rounded-xl text-xs flex items-center space-x-1"
          >
            <ArrowLeft size={15} />
            <span className="hidden sm:inline">Voltar</span>
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-sans font-bold text-sm text-[#FAF8F5]">{proposta.numero}</span>
              <span className="text-[10px] bg-[#C5A265]/20 text-[#DFC28B] px-2 py-0.5 rounded-full font-semibold">
                Versão {proposta.versao}
              </span>
            </div>
            <p className="text-[11px] text-[#9B9087] truncate max-w-xs">{proposta.cliente.nome}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Toggle Modo Apresentação Escura */}
          <button
            type="button"
            onClick={toggleModoEscuro}
            className={`px-3 py-2 rounded-xl border flex items-center space-x-1.5 transition-all text-xs font-semibold ${
              modoEscuro
                ? 'bg-[#C5A265] text-[#1B1410] border-[#DFC28B] shadow-gold-glow'
                : 'bg-[#2A1F19] text-[#D9D2C7] hover:text-white border-[#382B23]'
            }`}
            title={modoEscuro ? 'Alternar para Modo Claro' : 'Ativar Modo Apresentação Luxo (Dark)'}
          >
            {modoEscuro ? <Sun size={13} /> : <Moon size={13} />}
            <span className="hidden sm:inline">
              {modoEscuro ? 'Modo Claro' : 'Modo Apresentação'}
            </span>
          </button>

          <button
            onClick={handleCriarNovaVersao}
            title="Criar nova versão com base nesta"
            className="flex items-center space-x-1 px-3 py-2 bg-[#2A1F19] hover:bg-[#382B23] text-[#FAF8F5] rounded-xl border border-[#382B23] transition-colors"
          >
            <GitBranch size={13} className="text-[#C5A265]" />
            <span>Nova Versão</span>
          </button>

          <Link
            to={`/propostas/${proposta.id}/editar`}
            className="flex items-center space-x-1 px-3 py-2 bg-[#2A1F19] hover:bg-[#382B23] text-[#FAF8F5] rounded-xl border border-[#382B23] transition-colors"
          >
            <Edit3 size={13} />
            <span>Editar</span>
          </Link>

          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1 px-3 py-2 bg-[#2A1F19] hover:bg-[#382B23] text-[#FAF8F5] rounded-xl border border-[#382B23] transition-colors"
          >
            <Printer size={13} />
            <span>Gerar / Imprimir PDF</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center space-x-1 px-3 py-2 bg-[#2A1F19] hover:bg-[#382B23] text-[#C5A265] rounded-xl border border-[#C5A265]/30 transition-colors"
          >
            {copiedLink ? <CheckCircle2 size={13} /> : <Copy size={13} />}
            <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link'}</span>
          </button>

          <button
            onClick={handleShareWhatsapp}
            className="flex items-center space-x-1 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm transition-colors"
          >
            <Share2 size={13} />
            <span>Enviar no WhatsApp</span>
          </button>

          {proposta.status === 'aprovada' && (
            <button
              onClick={handleGerarContrato}
              className="flex items-center space-x-1 px-3.5 py-2 bg-[#C5A265] hover:bg-[#DFC28B] text-[#1B1410] rounded-xl font-bold shadow-gold-glow transition-all"
            >
              <FileCheck2 size={14} />
              <span>Gerar Contrato</span>
            </button>
          )}

          <button
            onClick={() => setModalExclusaoAberto(true)}
            title="Excluir Proposta"
            className="flex items-center space-x-1 px-3 py-2 bg-red-950/60 hover:bg-red-900 text-red-300 hover:text-red-100 rounded-xl border border-red-800/60 transition-colors"
          >
            <Trash2 size={13} />
            <span>Excluir</span>
          </button>
        </div>
      </div>

      {/* DOCUMENTO OFICIAL DA PROPOSTA (LAYOUT PREMIUM) */}
      <div
        className={`rounded-3xl border shadow-premium-lg overflow-hidden transition-colors duration-300 print:border-none print:shadow-none print:rounded-none ${
          modoEscuro ? 'bg-[#18120E] border-[#2E221B] text-[#FAF8F5]' : 'bg-white border-[#E8E2D9] text-[#231B15]'
        }`}
      >
        {/* CAPA DA PROPOSTA */}
        <section className="bg-gradient-to-b from-[#1B1410] via-[#241C18] to-[#1B1410] text-[#FAF8F5] p-8 sm:p-14 relative overflow-hidden border-b border-[#C5A265]/40">
          <div className="absolute right-0 top-0 w-96 h-96 bg-[#C5A265]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-[#382B23] pb-8">
            <div className="flex items-center space-x-4">
              <BrandMark variant="document" contrast="dark" className="!bg-[#F7F3EE]" />
              <div>
                <h1 className="font-brand text-2xl font-bold tracking-wider text-[#FAF8F5]">ALVES PLANEJADOS</h1>
                <p className="text-xs text-[#C5A265] uppercase tracking-widest font-semibold mt-0.5">
                  Marcenaria & Mobiliário Sob Medida de Alto Padrão
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[11px] text-[#9B9087] uppercase tracking-wider block">Proposta Comercial</span>
              <div className="font-mono text-lg font-bold text-[#C5A265]">{proposta.numero}</div>
              <div className="text-xs text-[#D9D2C7] mt-0.5">Versão Oficial {proposta.versao}</div>
            </div>
          </div>

          <div className="pt-10 space-y-4 max-w-2xl">
            <span className="text-xs text-[#C5A265] uppercase tracking-widest font-bold">Apresentação Exclusiva</span>
            <h2 className="font-brand text-3xl sm:text-4xl font-bold text-[#FAF8F5] leading-tight">
              {proposta.nomeProjeto}
            </h2>
            <div className="flex flex-wrap gap-y-2 gap-x-6 text-xs text-[#D9D2C7] pt-2">
              <div className="flex items-center space-x-1.5">
                <span className="text-[#9B9087]">Cliente:</span>
                <span className="font-semibold text-white">{proposta.cliente.nome}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="text-[#9B9087]">Local da Obra:</span>
                <span className="font-semibold text-white">{proposta.enderecoObra}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="text-[#9B9087]">Emissão:</span>
                <span className="text-white">{new Date(proposta.dataEmissao).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="text-[#9B9087]">Validade:</span>
                <span className="text-[#DFC28B] font-semibold">
                  {new Date(proposta.dataValidade).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* APRESENTAÇÃO DO PROJETO */}
        <section
          className={`p-8 sm:p-12 border-b space-y-3 transition-colors duration-300 ${
            modoEscuro
              ? 'bg-[#1F1713] border-[#2E221B] text-[#D9D2C7]'
              : 'bg-[#FAF8F5]/60 border-[#E8E2D9] text-[#6E645C]'
          }`}
        >
          <h3
            className={`font-brand text-2xl font-bold ${
              modoEscuro ? 'text-[#FAF8F5]' : 'text-[#1B1410]'
            }`}
          >
            Apresentação
          </h3>
          <p className="text-xs sm:text-sm leading-relaxed max-w-4xl">
            {config.textoApresentacaoPadrao}
          </p>
        </section>

        {/* AMBIENTES & DETALHAMENTO */}
        <section className="p-8 sm:p-12 space-y-12">
          <div
            className={`flex items-center justify-between border-b pb-4 transition-colors duration-300 ${
              modoEscuro ? 'border-[#2E221B]' : 'border-[#E8E2D9]'
            }`}
          >
            <div>
              <span className="text-xs font-bold text-[#C5A265] uppercase tracking-widest">Escopo Completo</span>
              <h3
                className={`font-sans text-2xl font-bold mt-1 ${
                  modoEscuro ? 'text-[#FAF8F5]' : 'text-[#1B1410]'
                }`}
              >
                Ambientes & Renders do Projeto ({proposta.ambientes.length})
              </h3>
            </div>
            <div className={`text-xs ${modoEscuro ? 'text-[#A89A90]' : 'text-[#6E645C]'}`}>
              Consultor: <span className={`font-semibold ${modoEscuro ? 'text-[#FAF8F5]' : 'text-[#1B1410]'}`}>{proposta.responsavel}</span>
            </div>
          </div>

          <div className="space-y-12">
            {proposta.ambientes.map((amb, index) => (
              <div key={amb.id} className="space-y-5">
                <div
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 transition-colors duration-300 ${
                    modoEscuro ? 'border-[#2E221B]' : 'border-[#E8E2D9]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-8 h-8 rounded-xl bg-[#1B1410] text-[#C5A265] border border-[#C5A265]/30 flex items-center justify-center font-bold text-xs">
                      0{index + 1}
                    </span>
                    <h4
                      className={`font-sans text-xl font-bold ${
                        modoEscuro ? 'text-[#FAF8F5]' : 'text-[#1B1410]'
                      }`}
                    >
                      {amb.nome}
                    </h4>
                  </div>
                  {proposta.exibirValoresPorAmbiente && (
                    <div className="text-sm font-bold text-[#C5A265]">
                      Subtotal: {formatarMoeda(amb.valorSubtotal)}
                    </div>
                  )}
                </div>

                <p
                  className={`text-xs sm:text-sm leading-relaxed ${
                    modoEscuro ? 'text-[#B8ACA2]' : 'text-[#6E645C]'
                  }`}
                >
                  {amb.descricao}
                </p>

                {/* Galeria de Renders */}
                {amb.imagens && amb.imagens.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
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
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#1B1410]/90 text-[#DFC28B] text-xs font-semibold backdrop-blur-sm border border-[#C5A265]/40 shadow-lg">
                              <Maximize2 size={13} />
                              <span>Ampliar Projeto 3D</span>
                            </span>
                          </div>
                        </div>
                        <div
                          className={`p-3 text-xs font-medium border-t flex items-center justify-between transition-colors duration-300 ${
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

                {/* Itens do Ambiente */}
                <div
                  className={`rounded-2xl border p-4 text-xs space-y-2 transition-colors duration-300 ${
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
                    Especificações & Módulos Inclusos:
                  </span>
                  <div
                    className={`divide-y ${
                      modoEscuro ? 'divide-[#2E221B]' : 'divide-[#E8E2D9]'
                    }`}
                  >
                    {amb.itens.map(item => (
                      <div key={item.id} className="py-2 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="text-[#C5A265] font-bold">•</span>
                          <span
                            className={`font-medium ${
                              modoEscuro ? 'text-[#FAF8F5]' : 'text-[#231B15]'
                            }`}
                          >
                            {item.descricao}
                          </span>
                          <span
                            className={`text-[11px] ${
                              modoEscuro ? 'text-[#8C7D73]' : 'text-[#9B9087]'
                            }`}
                          >
                            ({item.quantidade} {item.unidade})
                          </span>
                        </div>
                        {proposta.exibirValoresPorAmbiente && (
                          <div
                            className={`font-semibold ${
                              modoEscuro ? 'text-[#FAF8F5]' : 'text-[#1B1410]'
                            }`}
                          >
                            {formatarMoeda(item.valorTotal)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* INVESTIMENTO & CONDIÇÕES COMERCIAIS */}
        <section
          className={`p-8 sm:p-12 border-t space-y-8 page-break transition-colors duration-300 ${
            modoEscuro
              ? 'bg-[#1F1713] border-[#2E221B]'
              : 'bg-[#FAF8F5]/80 border-[#E8E2D9]'
          }`}
        >
          <div>
            <span className="text-xs font-bold text-[#C5A265] uppercase tracking-widest">Proposta Financeira</span>
            <h3
              className={`font-sans text-2xl font-bold mt-1 ${
                modoEscuro ? 'text-[#FAF8F5]' : 'text-[#1B1410]'
              }`}
            >
              Investimento & Condições de Pagamento
            </h3>
          </div>

          {/* Card Dourado de Investimento Total */}
          <div className="bg-gradient-to-r from-[#1B1410] to-[#2A1F19] text-[#FAF8F5] p-6 sm:p-8 rounded-3xl border border-[#C5A265]/40 shadow-premium-lg flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-xs text-[#DFC28B] uppercase tracking-wider font-semibold">Valor Total do Projeto</span>
              <div className="text-3xl sm:text-4xl font-sans font-bold text-[#C5A265]">
                {formatarMoeda(proposta.condicoes.valorFinal)}
              </div>
              {proposta.condicoes.descontoGeral > 0 && (
                <div className="text-xs text-emerald-400">
                  Desconto comercial aplicado de {formatarMoeda(proposta.condicoes.descontoGeral)}
                </div>
              )}
            </div>

            <div className="text-left sm:text-right space-y-1 text-xs text-[#D9D2C7]">
              <div><span className="text-[#9B9087]">Prazo de Execução:</span> <strong className="text-white">{proposta.condicoes.prazoExecucaoDias} dias úteis</strong></div>
              <div><span className="text-[#9B9087]">Garantia Estrutural:</span> <strong className="text-white">{proposta.condicoes.garantiaMeses} meses (5 anos)</strong></div>
              <div><span className="text-[#9B9087]">Validade da Proposta:</span> <strong className="text-[#DFC28B]">{new Date(proposta.dataValidade).toLocaleDateString('pt-BR')}</strong></div>
            </div>
          </div>

          {/* Cronograma de Pagamento */}
          <div
            className={`p-6 rounded-2xl border shadow-sm space-y-4 transition-colors duration-300 ${
              modoEscuro ? 'bg-[#18120E] border-[#2E221B]' : 'bg-white border-[#E8E2D9]'
            }`}
          >
            <h4
              className={`font-semibold text-xs uppercase tracking-wider flex items-center space-x-2 ${
                modoEscuro ? 'text-[#DFC28B]' : 'text-[#1B1410]'
              }`}
            >
              <Calendar size={14} className="text-[#C5A265]" />
              <span>Cronograma de Pagamento Acordado</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {proposta.condicoes.parcelas.map(parc => (
                <div
                  key={parc.numero}
                  className={`p-3.5 rounded-xl border text-xs transition-colors duration-300 ${
                    modoEscuro
                      ? 'bg-[#221813] border-[#382B23] text-[#FAF8F5]'
                      : 'bg-[#FAF8F5] border-[#E8E2D9] text-[#231B15]'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span>Parcela #{parc.numero}</span>
                    <span className="text-[#C5A265] font-bold">{formatarMoeda(parc.valor)}</span>
                  </div>
                  <div
                    className={`text-[11px] mt-1 ${
                      modoEscuro ? 'text-[#A89A90]' : 'text-[#6E645C]'
                    }`}
                  >
                    {parc.descricao}
                  </div>
                  <div
                    className={`text-[10px] mt-2 pt-1 border-t ${
                      modoEscuro
                        ? 'text-[#8C7D73] border-[#382B23]'
                        : 'text-[#9B9087] border-[#E8E2D9]'
                    }`}
                  >
                    Vencimento: {new Date(parc.vencimento).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* O que está incluso e garantia */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div
              className={`p-6 rounded-2xl border shadow-sm space-y-2 transition-colors duration-300 ${
                modoEscuro ? 'bg-[#18120E] border-[#2E221B]' : 'bg-white border-[#E8E2D9]'
              }`}
            >
              <h4 className="font-semibold text-emerald-400 flex items-center space-x-1.5">
                <CheckCircle2 size={15} />
                <span>Escopo Incluso</span>
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

            <div
              className={`p-6 rounded-2xl border shadow-sm space-y-2 transition-colors duration-300 ${
                modoEscuro ? 'bg-[#18120E] border-[#2E221B]' : 'bg-white border-[#E8E2D9]'
              }`}
            >
              <h4
                className={`font-semibold flex items-center space-x-1.5 ${
                  modoEscuro ? 'text-[#DFC28B]' : 'text-[#1B1410]'
                }`}
              >
                <Shield size={15} className="text-[#C5A265]" />
                <span>Termos de Garantia Alves</span>
              </h4>
              <p
                className={`leading-relaxed ${
                  modoEscuro ? 'text-[#B8ACA2]' : 'text-[#6E645C]'
                }`}
              >
                {config.termosGarantiaPadrao}
              </p>
            </div>
          </div>
        </section>

        {/* ENCERRAMENTO & APROVAÇÃO */}
        <footer
          className={`p-8 sm:p-12 border-t space-y-8 transition-colors duration-300 ${
            modoEscuro ? 'bg-[#18120E] border-[#2E221B]' : 'bg-white border-[#E8E2D9]'
          }`}
        >
          <div
            className={`flex flex-col sm:flex-row items-center justify-between gap-6 border-b pb-8 text-center sm:text-left transition-colors duration-300 ${
              modoEscuro ? 'border-[#2E221B]' : 'border-[#E8E2D9]'
            }`}
          >
            <div
              className={`space-y-1 text-xs ${
                modoEscuro ? 'text-[#A89A90]' : 'text-[#6E645C]'
              }`}
            >
              <div
                className={`font-brand font-bold text-base ${
                  modoEscuro ? 'text-[#FAF8F5]' : 'text-[#1B1410]'
                }`}
              >
                {config.nomeFantasia}
              </div>
              <div>{config.enderecoCompleto}</div>
              <div>CNPJ: {config.cnpj} • Telefone: {config.telefone}</div>
            </div>

            <div className="flex items-center space-x-3">
              <BrandMark
                variant="header"
                contrast={modoEscuro ? 'light' : 'dark'}
                className="!px-1.5 !py-1"
              />
            </div>
          </div>

          {/* Status de Aprovação Registrado */}
          {proposta.aprovacao && (
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center space-x-4">
              <div className="p-2.5 bg-emerald-600 text-white rounded-xl">
                <CheckCircle2 size={24} />
              </div>
              <div className="text-xs text-emerald-900 space-y-0.5">
                <div className="font-bold text-sm">Proposta Aprovada Eletronicamente pelo Cliente</div>
                <div>Aprovado por: <strong>{proposta.aprovacao.aprovadoPor}</strong></div>
                <div>Data/Hora: {new Date(proposta.aprovacao.aprovadoEm).toLocaleString('pt-BR')} ({proposta.aprovacao.ip})</div>
                {proposta.aprovacao.observacaoCliente && (
                  <div className="text-[11px] italic text-emerald-800 mt-1">"{proposta.aprovacao.observacaoCliente}"</div>
                )}
              </div>
            </div>
          )}
        </footer>
      </div>

      {/* Lightbox 3D Imersivo */}
      <ImageLightbox
        isOpen={lightboxOpen}
        images={lightboxImages}
        initialIndex={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
      />

      {/* Modal Moderno de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={modalExclusaoAberto}
        title="Excluir Proposta"
        message={`Deseja excluir permanentemente a proposta ${proposta.numero}? Esta ação não poderá ser desfeita.`}
        confirmLabel="Sim, Excluir Proposta"
        cancelLabel="Cancelar"
        variant="danger"
        loading={loadingDelete}
        onConfirm={handleConfirmarExclusao}
        onCancel={() => {
          if (!loadingDelete) setModalExclusaoAberto(false);
        }}
      />
    </div>
  );
};
