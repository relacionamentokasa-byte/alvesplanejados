import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Users,
  Building,
  Calendar,
  Layers,
  Image as ImageIcon,
  Plus,
  Trash2,
  DollarSign,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  Eye,
  FileDown,
  MessageCircle,
  Sparkles,
  Info,
  ChevronDown,
  X,
  PlusCircle,
  Percent,
  Clock,
  ShieldCheck,
  Award
} from 'lucide-react';
import { AlvesStore } from '../services/alvesStore';
import { Cliente, Proposta, Ambiente, ItemAmbiente, ImagemAmbiente, Parcela } from '../types/alves';

const AMBIENTES_SUGESTOES = [
  'Cozinha Gourmet',
  'Suíte Master',
  'Closet Integrado',
  'Home Theater / Living',
  'Espaço Gourmet / Churrasqueira',
  'Home Office / Estúdio',
  'Banheiro / Lavabo Master',
  'Área de Serviço / Lavanderia',
  'Adega Climatizada',
  'Dormitório Casal',
  'Dormitório Infantil / Juvenil'
];

export const CriadorPropostaPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const clienteIdUrl = searchParams.get('clienteId');

  const [step, setStep] = useState<number>(1);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [config, setConfig] = useState<Awaited<ReturnType<typeof AlvesStore.getConfig>> | null>(null);

  // Proposta State
  const [propostaId, setPropostaId] = useState<string>(id || 'prop-' + Date.now());
  const [numero, setNumero] = useState<string>('PROP-2026-004');
  const [versao, setVersao] = useState<number>(1);
  const [clienteId, setClienteId] = useState<string>('');
  const [nomeProjeto, setNomeProjeto] = useState<string>('');
  const [enderecoObra, setEnderecoObra] = useState<string>('');
  const [responsavel, setResponsavel] = useState<string>('Elioenai Alves (Alves Planejados)');
  const [dataEmissao, setDataEmissao] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dataValidade, setDataValidade] = useState<string>(
    new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [exibirValoresPorAmbiente, setExibirValoresPorAmbiente] = useState<boolean>(true);
  const [status, setStatus] = useState<Proposta['status']>('rascunho');

  // Ambientes
  const [ambientes, setAmbientes] = useState<Ambiente[]>([
    {
      id: 'amb-' + Date.now(),
      nome: 'Cozinha Gourmet',
      descricao: 'Mobiliário sob medida em MDF Ultra hidrorrepelente com acabamento amadeirado Freijó e laca acetinada.',
      observacoes: 'Ferragens com sistema de amortecimento Soft Close e puxadores integrados tipo cava.',
      imagens: [
        {
          id: 'img-1',
          url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
          nome: 'Perspectiva 3D Cozinha',
          principal: true
        }
      ],
      itens: [
        {
          id: 'item-1',
          descricao: 'Armários inferiores e gavetões com corrediças ocultas amortecidas',
          quantidade: 1,
          unidade: 'cj',
          valorUnitario: 16500,
          desconto: 0,
          valorTotal: 16500
        },
        {
          id: 'item-2',
          descricao: 'Armários aéreos com portas em vidro reflecta bronze e perfil de alumínio slim',
          quantidade: 1,
          unidade: 'cj',
          valorUnitario: 12400,
          desconto: 0,
          valorTotal: 12400
        }
      ],
      valorSubtotal: 28900,
      exibirValorIndividual: true
    }
  ]);

  // Condições Comerciais
  const [formaPagamento, setFormaPagamento] = useState<'a_vista' | 'parcelado' | 'entrada_parcelas' | 'personalizado'>('entrada_parcelas');
  const [descontoGeral, setDescontoGeral] = useState<number>(0);
  const [entrada, setEntrada] = useState<number>(8670);
  const [quantidadeParcelas, setQuantidadeParcelas] = useState<number>(4);
  const [prazoExecucaoDias, setPrazoExecucaoDias] = useState<number>(45);
  const [validadeDias, setValidadeDias] = useState<number>(20);
  const [garantiaMeses, setGarantiaMeses] = useState<number>(60);
  const [incluso, setIncluso] = useState<string[]>([]);
  const [naoIncluso, setNaoIncluso] = useState<string[]>([]);
  const [observacoesComerciais, setObservacoesComerciais] = useState<string>('Condições válidas para fechamento neste mês.');
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [publicToken, setPublicToken] = useState<string>('alves-prop-' + Date.now());
  const [carregando, setCarregando] = useState(true);

  // Modal Novo Cliente Rápido
  const [modalNovoClienteOpen, setModalNovoClienteOpen] = useState(false);
  const [novoClienteNome, setNovoClienteNome] = useState('');
  const [novoClienteWhats, setNovoClienteWhats] = useState('');
  const [novoClienteDoc, setNovoClienteDoc] = useState('');
  const [novoClienteCidade, setNovoClienteCidade] = useState('São Paulo');

  useEffect(() => {
    let active = true;
    Promise.all([AlvesStore.getClientes(), AlvesStore.getConfig(), id ? AlvesStore.getPropostaById(id) : Promise.resolve(undefined)])
      .then(([listCli, loadedConfig, propExistente]) => {
        if (!active) return;
        setClientes(listCli);
        setConfig(loadedConfig);
        setIncluso(loadedConfig.inclusoPadrao);
        setNaoIncluso(loadedConfig.naoInclusoPadrao);
        if (propExistente) {
          setPropostaId(propExistente.id); setNumero(propExistente.numero); setVersao(propExistente.versao);
          setClienteId(propExistente.clienteId); setNomeProjeto(propExistente.nomeProjeto); setEnderecoObra(propExistente.enderecoObra);
          setResponsavel(propExistente.responsavel); setDataEmissao(propExistente.dataEmissao); setDataValidade(propExistente.dataValidade);
          setExibirValoresPorAmbiente(propExistente.exibirValoresPorAmbiente); setStatus(propExistente.status);
          setAmbientes(propExistente.ambientes); setPublicToken(propExistente.publicToken);
          const cond = propExistente.condicoes;
          setFormaPagamento(cond.formaPagamento); setDescontoGeral(cond.descontoGeral); setEntrada(cond.entrada);
          setQuantidadeParcelas(cond.quantidadeParcelas); setPrazoExecucaoDias(cond.prazoExecucaoDias); setValidadeDias(cond.validadeDias);
          setGarantiaMeses(cond.garantiaMeses); setIncluso(cond.incluso); setNaoIncluso(cond.naoIncluso);
          setObservacoesComerciais(cond.observacoesComerciais); setParcelas(cond.parcelas);
        } else {
          const cliSel = listCli.find(c => c.id === clienteIdUrl) || listCli[0];
          if (cliSel) {
            setClienteId(cliSel.id); setNomeProjeto(`Projeto Residencial — ${cliSel.nome.split(' ')[0]}`);
            setEnderecoObra(`${cliSel.endereco.logradouro}, ${cliSel.endereco.numero} - ${cliSel.endereco.bairro}, ${cliSel.endereco.cidade}`);
          }
        }
      })
      .catch((error) => console.error('Erro ao carregar editor:', error))
      .finally(() => { if (active) setCarregando(false); });
    return () => { active = false; };
  }, [id, clienteIdUrl]);

  // Totais Calculados
  const valorTotalBrutoItens = ambientes.reduce((acc, amb) => {
    const sub = amb.itens.reduce((sum, item) => sum + item.valorTotal, 0);
    return acc + sub;
  }, 0);

  const valorFinal = Math.max(0, valorTotalBrutoItens - descontoGeral);

  // Recalcular parcelas quando mudam formaPagamento, entrada, quantidade ou valor final
  useEffect(() => {
    if (formaPagamento === 'a_vista') {
      setParcelas([
        {
          numero: 1,
          valor: valorFinal,
          vencimento: dataEmissao,
          descricao: 'À vista com desconto integral na aprovação'
        }
      ]);
    } else if (formaPagamento === 'entrada_parcelas') {
      const saldo = Math.max(0, valorFinal - entrada);
      const qtd = Math.max(1, quantidadeParcelas);
      const valorParc = saldo / qtd;

      const novasParcelas: Parcela[] = [
        {
          numero: 1,
          valor: entrada,
          vencimento: dataEmissao,
          descricao: 'Entrada na assinatura do contrato'
        }
      ];

      for (let i = 1; i <= qtd; i++) {
        const d = new Date(dataEmissao);
        d.setMonth(d.getMonth() + i);
        novasParcelas.push({
          numero: i + 1,
          valor: Math.round(valorParc * 100) / 100,
          vencimento: d.toISOString().split('T')[0],
          descricao: `${i}ª parcela do saldo`
        });
      }
      setParcelas(novasParcelas);
    } else if (formaPagamento === 'parcelado') {
      const qtd = Math.max(1, quantidadeParcelas);
      const valorParc = valorFinal / qtd;
      const novasParcelas: Parcela[] = [];

      for (let i = 1; i <= qtd; i++) {
        const d = new Date(dataEmissao);
        d.setMonth(d.getMonth() + (i - 1));
        novasParcelas.push({
          numero: i,
          valor: Math.round(valorParc * 100) / 100,
          vencimento: d.toISOString().split('T')[0],
          descricao: `${i}ª parcela mensal`
        });
      }
      setParcelas(novasParcelas);
    }
  }, [formaPagamento, entrada, quantidadeParcelas, valorFinal, dataEmissao]);

  // Helpers de Ambientes
  const adicionarAmbiente = (nomeSugerido?: string) => {
    const novoAmbiente: Ambiente = {
      id: 'amb-' + Date.now() + Math.random().toString().slice(2, 5),
      nome: nomeSugerido || 'Novo Ambiente Planejado',
      descricao: 'Descrição detalhada dos módulos, ferragens e especificações dos acabamentos...',
      observacoes: '',
      imagens: [],
      itens: [
        {
          id: 'item-' + Date.now(),
          descricao: 'Mobiliário sob medida em 100% MDF com ferragens amortecidas',
          quantidade: 1,
          unidade: 'cj',
          valorUnitario: 5000,
          desconto: 0,
          valorTotal: 5000
        }
      ],
      valorSubtotal: 5000,
      exibirValorIndividual: true
    };
    setAmbientes([...ambientes, novoAmbiente]);
  };

  const removerAmbiente = (ambId: string) => {
    if (ambientes.length <= 1) {
      alert('A proposta deve conter ao menos um ambiente.');
      return;
    }
    setAmbientes(ambientes.filter(a => a.id !== ambId));
  };

  const atualizarAmbiente = (ambId: string, updates: Partial<Ambiente>) => {
    setAmbientes(ambientes.map(a => {
      if (a.id !== ambId) return a;
      const atualizado = { ...a, ...updates };
      // Recalcula subtotal dos itens
      if (updates.itens) {
        atualizado.valorSubtotal = updates.itens.reduce((sum, item) => sum + item.valorTotal, 0);
      }
      return atualizado;
    }));
  };

  // Imagens no Ambiente (com suporte a upload local/câmera do smartphone e URL)
  const adicionarImagemAmbiente = (ambId: string) => {
    // Input oculto dinâmico para disparo direto no mobile
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          const novaImg: ImagemAmbiente = {
            id: 'img-' + Date.now(),
            url: base64,
            nome: file.name.replace(/\.[^/.]+$/, "") || 'Render / Foto Obra',
            principal: false
          };

          setAmbientes(prev => prev.map(a => {
            if (a.id !== ambId) return a;
            return {
              ...a,
              imagens: [...a.imagens, novaImg]
            };
          }));
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const removerImagemAmbiente = (ambId: string, imgId: string) => {
    setAmbientes(ambientes.map(a => {
      if (a.id !== ambId) return a;
      return {
        ...a,
        imagens: a.imagens.filter(img => img.id !== imgId)
      };
    }));
  };

  // Itens no Ambiente
  const adicionarItem = (ambId: string) => {
    const amb = ambientes.find(a => a.id === ambId);
    if (!amb) return;

    const novoItem: ItemAmbiente = {
      id: 'item-' + Date.now() + Math.random().toString().slice(2, 5),
      descricao: 'Novo módulo/serviço personalizado',
      quantidade: 1,
      unidade: 'cj',
      valorUnitario: 1000,
      desconto: 0,
      valorTotal: 1000
    };

    const novosItens = [...amb.itens, novoItem];
    atualizarAmbiente(ambId, { itens: novosItens });
  };

  const atualizarItem = (ambId: string, itemId: string, updates: Partial<ItemAmbiente>) => {
    const amb = ambientes.find(a => a.id === ambId);
    if (!amb) return;

    const novosItens = amb.itens.map(item => {
      if (item.id !== itemId) return item;
      const atual = { ...item, ...updates };
      // Recalcula total do item
      const subtotal = (atual.quantidade * atual.valorUnitario) - (atual.desconto || 0);
      atual.valorTotal = Math.max(0, subtotal);
      return atual;
    });

    atualizarAmbiente(ambId, { itens: novosItens });
  };

  const removerItem = (ambId: string, itemId: string) => {
    const amb = ambientes.find(a => a.id === ambId);
    if (!amb || amb.itens.length <= 1) {
      alert('Cada ambiente precisa ter pelo menos 1 item discriminado.');
      return;
    }
    const novosItens = amb.itens.filter(i => i.id !== itemId);
    atualizarAmbiente(ambId, { itens: novosItens });
  };

  // Salvar Proposta Completa
  const handleSalvarProposta = async (novoStatus?: Proposta['status']) => {
    const clienteSel = clientes.find(c => c.id === clienteId) || clientes[0];
    if (!clienteSel) {
      alert('Selecione um cliente válido.');
      return;
    }

    const propostaCompleta: Proposta = {
      id: propostaId,
      numero,
      versao,
      clienteId: clienteSel.id,
      cliente: clienteSel,
      nomeProjeto: nomeProjeto || `Projeto Residencial — ${clienteSel.nome}`,
      enderecoObra: enderecoObra || `${clienteSel.endereco.logradouro}, ${clienteSel.endereco.numero}`,
      responsavel,
      dataEmissao,
      dataValidade,
      status: novoStatus || status,
      exibirValoresPorAmbiente,
      ambientes,
      condicoes: {
        valorTotalItens: valorTotalBrutoItens,
        descontoGeral,
        valorFinal,
        formaPagamento,
        entrada,
        quantidadeParcelas,
        parcelas,
        prazoExecucaoDias,
        validadeDias,
        garantiaMeses,
        incluso,
        naoIncluso,
        observacoesComerciais
      },
      publicToken,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const saved = await AlvesStore.saveProposta(propostaCompleta);
    return saved;
  };

  const handleSalvarERevisar = async () => {
    const prop = await handleSalvarProposta();
    if (prop) {
      navigate(`/propostas/${prop.id}/previa`);
    }
  };

  const handleCadastrarNovoClienteRapido = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoClienteNome.trim()) return;

    const saved = await AlvesStore.saveCliente({
      nome: novoClienteNome,
      documento: novoClienteDoc,
      telefone: novoClienteWhats,
      whatsapp: novoClienteWhats,
      email: '',
      endereco: {
        logradouro: 'A definir',
        numero: 'S/N',
        bairro: 'Centro',
        cidade: novoClienteCidade,
        uf: 'SP',
        cep: ''
      }
    });

    setClientes(await AlvesStore.getClientes());
    setClienteId(saved.id);
    setNomeProjeto(`Projeto Residencial — ${saved.nome.split(' ')[0]}`);
    setModalNovoClienteOpen(false);
  };

  const formatarMoeda = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const stepsList = [
    { num: 1, title: 'Cliente & Projeto' },
    { num: 2, title: 'Ambientes & Renders' },
    { num: 3, title: 'Itens & Valores' },
    { num: 4, title: 'Condições Comerciais' },
    { num: 5, title: 'Revisão & Geração' }
  ];

  if (carregando || !config) return <div className="p-8 text-sm text-[#6E645C]">Carregando editor de proposta...</div>;

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2D9] pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-sans text-xl sm:text-2xl font-semibold text-[#1B1410]">
              {id ? `Editar Proposta — ${numero}` : 'Criador de Proposta Comercial'}
            </span>
            <span className="text-xs bg-[#FAF3E8] text-[#9E7E45] border border-[#C5A265]/40 px-2.5 py-0.5 rounded-full font-semibold">
              Versão {versao}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              handleSalvarProposta('rascunho');
              alert('Rascunho salvo com sucesso!');
            }}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-white border border-[#E8E2D9] hover:bg-[#FAF8F5] text-[#231B15] text-xs font-semibold rounded-xl transition-colors shadow-sm text-center"
          >
            Salvar Rascunho
          </button>
          <button
            type="button"
            onClick={handleSalvarERevisar}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 sm:px-5 py-2 bg-[#C5A265] hover:bg-[#DFC28B] text-[#1B1410] text-xs font-bold rounded-xl shadow-gold-glow transition-all whitespace-nowrap"
          >
            <Eye size={15} />
            <span>Prévia</span>
          </button>
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-[#E8E2D9] shadow-sm">
        {/* Stepper Desktop */}
        <div className="hidden sm:grid grid-cols-5 gap-2">
          {stepsList.map((s) => {
            const isCompleted = step > s.num;
            const isCurrent = step === s.num;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => setStep(s.num)}
                className={`flex flex-col items-center text-center p-2 rounded-xl transition-all ${
                  isCurrent
                    ? 'bg-[#1B1410] text-[#FAF8F5] shadow-sm'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-[#FAF8F5] text-[#9B9087] hover:text-[#231B15]'
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isCurrent
                        ? 'bg-[#C5A265] text-[#1B1410]'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#E8E2D9] text-[#6E645C]'
                    }`}
                  >
                    {isCompleted ? '✓' : s.num}
                  </span>
                  <span className="text-[11px] font-medium">{s.title}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Stepper Mobile Compacto */}
        <div className="sm:hidden space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1B1410]">
              Passo {step} de 5: <span className="text-[#C5A265] font-semibold">{stepsList[step - 1].title}</span>
            </span>
            <div className="flex items-center space-x-1">
              {stepsList.map((s) => (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => setStep(s.num)}
                  aria-label={`Ir para etapa ${s.num}`}
                  className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center transition-all ${
                    step === s.num
                      ? 'bg-[#C5A265] text-[#1B1410]'
                      : step > s.num
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#FAF8F5] text-[#9B9087] border border-[#E8E2D9]'
                  }`}
                >
                  {step > s.num ? '✓' : s.num}
                </button>
              ))}
            </div>
          </div>
          {/* Barra de progresso visual */}
          <div className="w-full bg-[#E8E2D9] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#C5A265] h-full transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* ETAPA 1: Cliente e Projeto */}
      {step === 1 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E2D9] shadow-sm space-y-6">
          <div className="border-b border-[#E8E2D9] pb-4 flex items-center justify-between">
            <div>
              <h2 className="font-sans text-lg font-semibold text-[#1B1410]">Cliente e Projeto</h2>
            </div>
            <button
              type="button"
              onClick={() => setModalNovoClienteOpen(true)}
              className="text-xs font-semibold text-[#C5A265] hover:text-[#9E7E45] flex items-center space-x-1 bg-[#FAF3E8] px-3 py-1.5 rounded-lg border border-[#C5A265]/30"
            >
              <Plus size={14} />
              <span>+ Novo Cliente Rápido</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            {/* Seleção do Cliente */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-semibold text-[#231B15]">Cliente da Proposta *</label>
              <select
                value={clienteId}
                onChange={(e) => {
                  setClienteId(e.target.value);
                  const sel = clientes.find(c => c.id === e.target.value);
                  if (sel) {
                    setNomeProjeto(`Projeto Residencial — ${sel.nome.split(' ')[0]}`);
                    setEnderecoObra(`${sel.endereco.logradouro}, ${sel.endereco.numero} - ${sel.endereco.bairro}, ${sel.endereco.cidade}`);
                  }
                }}
                className="w-full px-3.5 py-3 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-xs text-[#231B15] focus:outline-none focus:border-[#C5A265]"
              >
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nome} {c.documento ? `(${c.documento})` : ''} — {c.whatsapp || c.telefone}
                  </option>
                ))}
              </select>
            </div>

            {/* Nome do Projeto */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-semibold text-[#231B15]">Nome de Apresentação do Projeto *</label>
              <input
                type="text"
                value={nomeProjeto}
                onChange={(e) => setNomeProjeto(e.target.value)}
                placeholder="Ex: Residência Jardins — Cozinha Gourmet & Suíte Master"
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-xs text-[#231B15] focus:outline-none focus:border-[#C5A265]"
              />
            </div>

            {/* Endereço da Obra */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-semibold text-[#231B15]">Endereço Completo da Obra / Entrega</label>
              <input
                type="text"
                value={enderecoObra}
                onChange={(e) => setEnderecoObra(e.target.value)}
                placeholder="Alameda Gabriel Monteiro da Silva, 1450 - Apto 182, Jardins, São Paulo/SP"
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-xs text-[#231B15]"
              />
            </div>

            {/* Responsável */}
            <div className="space-y-1.5">
              <label className="font-semibold text-[#231B15]">Consultor / Responsável pela Proposta</label>
              <input
                type="text"
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
                placeholder="Ariel Matos (Consultor de Projetos)"
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-xs text-[#231B15]"
              />
            </div>

            {/* Número da Proposta */}
            <div className="space-y-1.5">
              <label className="font-semibold text-[#231B15]">Identificador da Proposta</label>
              <input
                type="text"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-xs font-mono font-bold text-[#1B1410]"
              />
            </div>

            {/* Datas */}
            <div className="space-y-1.5">
              <label className="font-semibold text-[#231B15]">Data de Emissão</label>
              <input
                type="date"
                value={dataEmissao}
                onChange={(e) => setDataEmissao(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-xs text-[#231B15]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-[#231B15]">Data de Validade</label>
              <input
                type="date"
                value={dataValidade}
                onChange={(e) => setDataValidade(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-xs text-[#231B15]"
              />
            </div>
          </div>
        </div>
      )}

      {/* ETAPA 2: Ambientes & Renders */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-[#E8E2D9] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-sans text-lg font-semibold text-[#1B1410]">Ambientes e Projetos 3D</h2>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => adicionarAmbiente()}
                className="flex items-center space-x-1.5 px-4 py-2 bg-[#1B1410] hover:bg-[#2A1F19] text-[#FAF8F5] text-xs font-semibold rounded-xl transition-all"
              >
                <Plus size={14} className="text-[#C5A265]" />
                <span>+ Adicionar Ambiente</span>
              </button>
            </div>
          </div>

          {/* Atalhos de Ambientes Rápidos */}
          <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E2D9] flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[#6E645C]">Sugestões rápidas:</span>
            {AMBIENTES_SUGESTOES.slice(0, 6).map(sug => (
              <button
                key={sug}
                type="button"
                onClick={() => adicionarAmbiente(sug)}
                className="text-[11px] bg-white hover:bg-[#FAF3E8] text-[#231B15] hover:text-[#9E7E45] border border-[#E8E2D9] hover:border-[#C5A265] px-2.5 py-1 rounded-lg transition-all"
              >
                + {sug}
              </button>
            ))}
          </div>

          {/* Cards de Ambientes */}
          <div className="space-y-6">
            {ambientes.map((amb, index) => (
              <div key={amb.id} className="bg-white p-6 rounded-3xl border border-[#E8E2D9] shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-3">
                  <div className="flex items-center space-x-3">
                    <span className="w-7 h-7 rounded-xl bg-[#1B1410] text-[#C5A265] flex items-center justify-center font-bold text-xs">
                      0{index + 1}
                    </span>
                    <input
                      type="text"
                      value={amb.nome}
                      onChange={(e) => atualizarAmbiente(amb.id, { nome: e.target.value })}
                      className="font-sans text-base font-bold text-[#1B1410] bg-transparent border-b border-dashed border-[#E8E2D9] focus:border-[#C5A265] focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removerAmbiente(amb.id)}
                    className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 text-xs flex items-center space-x-1"
                  >
                    <Trash2 size={14} />
                    <span className="hidden sm:inline">Excluir Ambiente</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-[#231B15]">Descrição Detalhada do Mobiliário</label>
                    <textarea
                      rows={3}
                      value={amb.descricao}
                      onChange={(e) => atualizarAmbiente(amb.id, { descricao: e.target.value })}
                      placeholder="Especifique padrões de MDF, cores de laca, perfis de puxadores e tipo de vidro..."
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-xs text-[#231B15]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-[#231B15]">Observações de Montagem / Ferragens</label>
                    <textarea
                      rows={3}
                      value={amb.observacoes || ''}
                      onChange={(e) => atualizarAmbiente(amb.id, { observacoes: e.target.value })}
                      placeholder="Ex: Corrediças com amortecimento Blum, LED integrado 3000K, recortes de tomadas..."
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-xs text-[#231B15]"
                    />
                  </div>
                </div>

                {/* Galeria de Imagens do Ambiente */}
                <div className="pt-2 border-t border-[#E8E2D9]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2 text-xs font-semibold text-[#231B15]">
                      <ImageIcon size={15} className="text-[#C5A265]" />
                      <span>Renders & Perspectivas 3D ({amb.imagens.length})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => adicionarImagemAmbiente(amb.id)}
                      className="text-xs font-semibold text-[#C5A265] hover:text-[#9E7E45] flex items-center space-x-1 bg-[#FAF3E8] px-2.5 py-1 rounded-lg border border-[#C5A265]/30"
                    >
                      <Plus size={13} />
                      <span>+ Adicionar Imagem / Render</span>
                    </button>
                  </div>

                  {amb.imagens.length === 0 ? (
                    <div
                      onClick={() => adicionarImagemAmbiente(amb.id)}
                      className="border-2 border-dashed border-[#E8E2D9] hover:border-[#C5A265] rounded-2xl p-6 text-center cursor-pointer transition-colors bg-[#FAF8F5]"
                    >
                      <Upload size={24} className="mx-auto text-[#9B9087] mb-1" />
                      <p className="text-xs font-semibold text-[#231B15]">Nenhum render cadastrado para este ambiente</p>
                      <p className="text-[11px] text-[#6E645C]">Clique para adicionar a URL de um render 3D.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {amb.imagens.map((img) => (
                        <div key={img.id} className="relative group rounded-xl overflow-hidden border border-[#E8E2D9] bg-black/5 aspect-video">
                          <img src={img.url} alt={img.nome} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                            <button
                              type="button"
                              onClick={() => removerImagemAmbiente(amb.id, img.id)}
                              className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700"
                              title="Remover Imagem"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 text-[10px] text-white truncate">
                            {img.nome}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ETAPA 3: Itens e Valores */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-[#E8E2D9] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-sans text-lg font-semibold text-[#1B1410]">Itens e Módulos</h2>
            </div>

            <div className="flex items-center space-x-3 bg-[#FAF8F5] p-2.5 rounded-xl border border-[#E8E2D9] text-xs">
              <span className="text-[#6E645C]">Discriminar valores por ambiente:</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={exibirValoresPorAmbiente}
                  onChange={(e) => setExibirValoresPorAmbiente(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[#E8E2D9] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#E8E2D9] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#C5A265]"></div>
              </label>
            </div>
          </div>

          {/* Ambientes com Tabela de Itens */}
          <div className="space-y-6">
            {ambientes.map((amb) => (
              <div key={amb.id} className="bg-white p-6 rounded-3xl border border-[#E8E2D9] shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-3">
                  <div>
                    <h3 className="font-sans text-base font-bold text-[#1B1410]">{amb.nome}</h3>
                    <p className="text-xs text-[#6E645C] truncate">{amb.descricao}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-[#6E645C]">Subtotal do Ambiente</span>
                    <div className="text-base font-bold text-[#C5A265]">
                      {formatarMoeda(amb.valorSubtotal)}
                    </div>
                  </div>
                </div>

                {/* Tabela de Itens para Desktop */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#FAF8F5] border-b border-[#E8E2D9] text-[11px] font-semibold text-[#6E645C]">
                        <th className="py-2.5 px-3">Descrição do Módulo / Serviço</th>
                        <th className="py-2.5 px-3 w-20 text-center">Qtd</th>
                        <th className="py-2.5 px-3 w-20 text-center">Un.</th>
                        <th className="py-2.5 px-3 w-32 text-right">Valor Unit. (R$)</th>
                        <th className="py-2.5 px-3 w-32 text-right">Valor Total (R$)</th>
                        <th className="py-2.5 px-3 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E2D9]">
                      {amb.itens.map((item) => (
                        <tr key={item.id} className="hover:bg-[#FAF8F5]/50">
                          <td className="py-2.5 px-3">
                            <input
                              type="text"
                              value={item.descricao}
                              onChange={(e) => atualizarItem(amb.id, item.id, { descricao: e.target.value })}
                              className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#E8E2D9] rounded-lg text-xs"
                            />
                          </td>
                          <td className="py-2.5 px-3">
                            <input
                              type="number"
                              min="1"
                              value={item.quantidade}
                              onChange={(e) => atualizarItem(amb.id, item.id, { quantidade: Number(e.target.value) || 1 })}
                              className="w-full px-2 py-1.5 bg-[#FAF8F5] border border-[#E8E2D9] rounded-lg text-xs text-center"
                            />
                          </td>
                          <td className="py-2.5 px-3">
                            <input
                              type="text"
                              value={item.unidade || 'cj'}
                              onChange={(e) => atualizarItem(amb.id, item.id, { unidade: e.target.value })}
                              className="w-full px-2 py-1.5 bg-[#FAF8F5] border border-[#E8E2D9] rounded-lg text-xs text-center uppercase"
                            />
                          </td>
                          <td className="py-2.5 px-3">
                            <input
                              type="number"
                              step="0.01"
                              value={item.valorUnitario}
                              onChange={(e) => atualizarItem(amb.id, item.id, { valorUnitario: Number(e.target.value) || 0 })}
                              className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#E8E2D9] rounded-lg text-xs text-right font-medium"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-[#1B1410]">
                            {formatarMoeda(item.valorTotal)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => removerItem(amb.id, item.id)}
                              className="text-red-400 hover:text-red-600 p-1"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Cards de Itens para Mobile */}
                <div className="md:hidden space-y-3">
                  {amb.itens.map((item) => (
                    <div key={item.id} className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#E8E2D9] space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-semibold text-[#6E645C] uppercase">Descrição do Módulo</label>
                        <button
                          type="button"
                          onClick={() => removerItem(amb.id, item.id)}
                          className="p-1 text-red-500 hover:text-red-700"
                          title="Remover Item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={item.descricao}
                        onChange={(e) => atualizarItem(amb.id, item.id, { descricao: e.target.value })}
                        placeholder="Descrição do móvel ou serviço"
                        className="w-full px-3 py-2 bg-white border border-[#E8E2D9] rounded-xl text-xs font-medium"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] text-[#6E645C] block mb-0.5">Qtd</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantidade}
                            onChange={(e) => atualizarItem(amb.id, item.id, { quantidade: Number(e.target.value) || 1 })}
                            className="w-full px-2 py-1.5 bg-white border border-[#E8E2D9] rounded-xl text-xs text-center"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#6E645C] block mb-0.5">Unidade</label>
                          <input
                            type="text"
                            value={item.unidade || 'cj'}
                            onChange={(e) => atualizarItem(amb.id, item.id, { unidade: e.target.value })}
                            className="w-full px-2 py-1.5 bg-white border border-[#E8E2D9] rounded-xl text-xs text-center uppercase"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#6E645C] block mb-0.5">Unitário (R$)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={item.valorUnitario}
                            onChange={(e) => atualizarItem(amb.id, item.id, { valorUnitario: Number(e.target.value) || 0 })}
                            className="w-full px-2 py-1.5 bg-white border border-[#E8E2D9] rounded-xl text-xs text-right font-medium"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-[#E8E2D9]/60">
                        <span className="text-[11px] text-[#6E645C]">Total do Item:</span>
                        <span className="text-xs font-bold text-[#1B1410]">{formatarMoeda(item.valorTotal)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => adicionarItem(amb.id)}
                    className="text-xs font-semibold text-[#1B1410] hover:text-[#C5A265] flex items-center space-x-1"
                  >
                    <Plus size={14} className="text-[#C5A265]" />
                    <span>+ Adicionar Item ao Ambiente</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Resumo Financeiro da Etapa 3 */}
          <div className="bg-[#1B1410] text-[#FAF8F5] p-5 sm:p-6 rounded-3xl border border-[#2A1F19] shadow-premium-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-[#C5A265] uppercase tracking-wider font-semibold">Subtotal dos Ambientes</span>
              <div className="text-xl sm:text-2xl font-bold font-sans text-[#FAF8F5] mt-0.5">
                {formatarMoeda(valorTotalBrutoItens)}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:space-x-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#2A1F19] w-full sm:w-auto">
              <div className="w-full sm:w-auto text-left sm:text-right">
                <label className="text-[11px] text-[#D9D2C7] block">Desconto Comercial Geral (R$)</label>
                <input
                  type="number"
                  step="100"
                  value={descontoGeral}
                  onChange={(e) => setDescontoGeral(Number(e.target.value) || 0)}
                  className="w-full sm:w-36 px-3 py-1.5 bg-[#2A1F19] border border-[#C5A265]/40 rounded-xl text-xs text-[#FAF8F5] text-left sm:text-right font-bold mt-1 sm:mt-0"
                />
              </div>

              <div className="hidden sm:block h-10 w-px bg-[#2A1F19]" />

              <div className="w-full sm:w-auto flex items-center justify-between sm:block pt-1 sm:pt-0">
                <span className="text-xs text-[#DFC28B] uppercase tracking-wider font-semibold">Valor Final Proposta:</span>
                <div className="text-xl sm:text-2xl font-bold font-sans text-[#C5A265]">
                  {formatarMoeda(valorFinal)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ETAPA 4: Condições Comerciais & Parcelas */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-[#E8E2D9] shadow-sm">
            <h2 className="font-sans text-lg font-semibold text-[#1B1410]">Condições Comerciais e Pagamento</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Configurações de Pagamento */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-[#E8E2D9] shadow-sm space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#231B15]">Forma de Pagamento *</label>
                  <select
                    value={formaPagamento}
                    onChange={(e: any) => setFormaPagamento(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-xs text-[#231B15] font-medium"
                  >
                    <option value="entrada_parcelas">Entrada + Parcelas Mensais (Padrão)</option>
                    <option value="parcelado">Parcelamento Direto sem Entrada</option>
                    <option value="a_vista">Pagamento à Vista (Desconto Especial)</option>
                    <option value="personalizado">Condição Personalizada</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[#231B15]">Quantidade de Parcelas</label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={quantidadeParcelas}
                    onChange={(e) => setQuantidadeParcelas(Number(e.target.value) || 1)}
                    disabled={formaPagamento === 'a_vista'}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-xs text-[#231B15]"
                  />
                </div>

                {formaPagamento === 'entrada_parcelas' && (
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="font-semibold text-[#231B15]">Valor da Entrada (R$) *</label>
                    <input
                      type="number"
                      step="100"
                      value={entrada}
                      onChange={(e) => setEntrada(Number(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-xs font-bold text-[#1B1410]"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="font-semibold text-[#231B15]">Prazo de Execução (Dias Úteis)</label>
                  <input
                    type="number"
                    value={prazoExecucaoDias}
                    onChange={(e) => setPrazoExecucaoDias(Number(e.target.value) || 45)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-xs text-[#231B15]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[#231B15]">Garantia Estrutural (Meses)</label>
                  <input
                    type="number"
                    value={garantiaMeses}
                    onChange={(e) => setGarantiaMeses(Number(e.target.value) || 60)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-xs text-[#231B15]"
                  />
                </div>
              </div>

              {/* Tabela de Parcelas Calculadas e Editáveis */}
              <div className="pt-3 border-t border-[#E8E2D9]">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-[#1B1410] flex items-center space-x-1.5">
                    <CreditCard size={15} className="text-[#C5A265]" />
                    <span>Cronograma de Parcelas Calculado</span>
                  </h4>
                  <span className="text-[11px] text-[#6E645C]">Valores ajustáveis manualmente</span>
                </div>

                <div className="space-y-2">
                  {parcelas.map((parc, idx) => (
                    <div key={idx} className="flex items-center space-x-3 p-2.5 bg-[#FAF8F5] rounded-xl border border-[#E8E2D9]">
                      <span className="w-6 text-center font-bold text-[#6E645C] text-xs">#{parc.numero}</span>
                      <input
                        type="text"
                        value={parc.descricao}
                        onChange={(e) => {
                          const nov = [...parcelas];
                          nov[idx].descricao = e.target.value;
                          setParcelas(nov);
                        }}
                        className="flex-1 px-2.5 py-1 bg-white border border-[#E8E2D9] rounded-lg text-xs"
                      />
                      <input
                        type="date"
                        value={parc.vencimento}
                        onChange={(e) => {
                          const nov = [...parcelas];
                          nov[idx].vencimento = e.target.value;
                          setParcelas(nov);
                        }}
                        className="w-32 px-2 py-1 bg-white border border-[#E8E2D9] rounded-lg text-xs"
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={parc.valor}
                        onChange={(e) => {
                          const nov = [...parcelas];
                          nov[idx].valor = Number(e.target.value) || 0;
                          setParcelas(nov);
                        }}
                        className="w-28 px-2 py-1 bg-white border border-[#E8E2D9] rounded-lg text-xs text-right font-bold text-[#1B1410]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Observações Comerciais */}
              <div className="pt-3 border-t border-[#E8E2D9] space-y-1.5">
                <label className="font-semibold text-[#231B15]">Observações Comerciais & Condições Especiais</label>
                <textarea
                  rows={2}
                  value={observacoesComerciais}
                  onChange={(e) => setObservacoesComerciais(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-xs text-[#231B15]"
                />
              </div>
            </div>

            {/* O que está incluso / Não incluso */}
            <div className="bg-white p-6 rounded-3xl border border-[#E8E2D9] shadow-sm space-y-4 text-xs">
              <div>
                <h4 className="font-semibold text-emerald-800 flex items-center space-x-1.5 mb-2">
                  <CheckCircle2 size={14} />
                  <span>O que está incluso no escopo</span>
                </h4>
                <ul className="space-y-1.5 text-[#6E645C]">
                  {incluso.map((inc, i) => (
                    <li key={i} className="flex items-start space-x-1.5">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t border-[#E8E2D9]">
                <h4 className="font-semibold text-amber-800 flex items-center space-x-1.5 mb-2">
                  <Info size={14} />
                  <span>Não incluso / Responsabilidade civil</span>
                </h4>
                <ul className="space-y-1.5 text-[#6E645C]">
                  {naoIncluso.map((nao, i) => (
                    <li key={i} className="flex items-start space-x-1.5">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>{nao}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ETAPA 5: Revisão & Ações */}
      {step === 5 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E2D9] shadow-sm space-y-6">
          <div className="border-b border-[#E8E2D9] pb-4">
            <h2 className="font-sans text-lg font-semibold text-[#1B1410]">Revisão da Proposta</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8E2D9]">
              <span className="text-[#6E645C] block">Cliente</span>
              <div className="font-semibold text-[#1B1410] text-sm mt-1">
                {clientes.find(c => c.id === clienteId)?.nome}
              </div>
              <div className="text-[11px] text-[#6E645C] mt-0.5">{enderecoObra}</div>
            </div>

            <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8E2D9]">
              <span className="text-[#6E645C] block">Ambientes</span>
              <div className="font-semibold text-[#1B1410] text-sm mt-1">
                {ambientes.length} ambientes
              </div>
              <div className="text-[11px] text-[#6E645C] mt-0.5 truncate">
                {ambientes.map(a => a.nome).join(', ')}
              </div>
            </div>

            <div className="p-4 bg-[#FAF3E8] rounded-2xl border border-[#C5A265]/40">
              <span className="text-[#9E7E45] font-semibold block">Valor Total</span>
              <div className="font-sans font-bold text-xl text-[#C5A265] mt-1">
                {formatarMoeda(valorFinal)}
              </div>
              <div className="text-[11px] text-[#6E645C] mt-0.5">
                {formaPagamento === 'a_vista' ? 'À vista com desconto' : `${parcelas.length} parcelas`}
              </div>
            </div>
          </div>

          {/* Botões de Ação na Revisão */}
          <div className="p-6 bg-gradient-to-r from-[#1B1410] to-[#2A1F19] text-[#FAF8F5] rounded-2xl border border-[#C5A265]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="font-sans font-semibold text-base text-[#FAF8F5]">Proposta Pronta para Apresentação</div>
              <p className="text-xs text-[#D9D2C7]">
                Acesse a prévia oficial do documento ou envie o link seguro diretamente no WhatsApp do cliente.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleSalvarERevisar}
                className="flex items-center space-x-1.5 px-4 py-2.5 bg-[#C5A265] hover:bg-[#DFC28B] text-[#1B1410] font-bold text-xs rounded-xl shadow-gold-glow transition-all"
              >
                <Eye size={15} />
                <span>Visualizar Apresentação</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navegação Inferior Desktop / Inline */}
      <div className="hidden sm:flex items-center justify-between pt-4 border-t border-[#E8E2D9]">
        <button
          type="button"
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-[#E8E2D9] text-[#6E645C] hover:bg-[#FAF8F5] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold"
        >
          <ArrowLeft size={15} />
          <span>Etapa Anterior</span>
        </button>

        <div className="text-xs font-medium text-[#9B9087]">
          Passo {step} de 5
        </div>

        {step < 5 ? (
          <button
            type="button"
            onClick={() => setStep(Math.min(5, step + 1))}
            className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-[#1B1410] hover:bg-[#2A1F19] text-[#FAF8F5] text-xs font-semibold transition-all shadow-sm"
          >
            <span>Próxima Etapa</span>
            <ArrowRight size={15} className="text-[#C5A265]" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSalvarERevisar}
            className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-[#C5A265] hover:bg-[#DFC28B] text-[#1B1410] text-xs font-bold shadow-gold-glow transition-all"
          >
            <CheckCircle2 size={16} />
            <span>Finalizar & Ver Documento</span>
          </button>
        )}
      </div>

      {/* Sticky Bottom Action Bar Mobile (Fixa no polegar acima da bottom bar) */}
      <div className="sm:hidden fixed bottom-16 inset-x-0 z-30 bg-[#1B1410]/95 backdrop-blur-md border-t border-[#2A1F19] px-4 py-2.5 flex items-center justify-between shadow-2xl">
        <div className="flex flex-col">
          <span className="text-[10px] text-[#C5A265] font-semibold uppercase tracking-wider">Passo {step}/5 • Total</span>
          <span className="text-xs font-bold text-[#FAF8F5]">{formatarMoeda(valorFinal)}</span>
        </div>

        <div className="flex items-center space-x-2">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="p-2 rounded-xl bg-[#2A1F19] text-[#FAF8F5] active:scale-95 transition-transform"
              title="Voltar"
            >
              <ArrowLeft size={16} />
            </button>
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="flex items-center space-x-1 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#9E7E45] to-[#C5A265] text-[#1B1410] text-xs font-bold shadow-sm active:scale-95 transition-transform"
            >
              <span>Avançar</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSalvarERevisar}
              className="flex items-center space-x-1 px-3.5 py-2 rounded-xl bg-[#C5A265] text-[#1B1410] text-xs font-bold shadow-gold-glow active:scale-95 transition-transform"
            >
              <CheckCircle2 size={14} />
              <span>Finalizar</span>
            </button>
          )}
        </div>
      </div>

      {/* Modal Cadastro Rápido de Cliente em Formato Bottom Sheet Mobile */}
      {modalNovoClienteOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full border border-[#E8E2D9] shadow-premium-lg overflow-hidden p-6 space-y-4 text-xs max-h-[85dvh] overflow-y-auto pb-safe">
            {/* Alça visual de toque para mobile */}
            <div className="sm:hidden w-10 h-1 bg-[#E8E2D9] rounded-full mx-auto -mt-2 mb-2" />
            <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-3">
              <h3 className="font-sans text-base font-semibold text-[#1B1410]">Novo Cliente Rápido</h3>
              <button onClick={() => setModalNovoClienteOpen(false)} className="text-[#9B9087] hover:text-[#231B15] p-1">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCadastrarNovoClienteRapido} className="space-y-3">
              <div className="space-y-1">
                <label className="font-semibold text-[#231B15]">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={novoClienteNome}
                  onChange={(e) => setNovoClienteNome(e.target.value)}
                  placeholder="Nome do cliente"
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#231B15]">WhatsApp *</label>
                <input
                  type="text"
                  required
                  value={novoClienteWhats}
                  onChange={(e) => setNovoClienteWhats(e.target.value)}
                  placeholder="(11) 98765-4321"
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#231B15]">CPF / CNPJ</label>
                <input
                  type="text"
                  value={novoClienteDoc}
                  onChange={(e) => setNovoClienteDoc(e.target.value)}
                  placeholder="000.000.000-00"
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-[#E8E2D9]">
                <button
                  type="button"
                  onClick={() => setModalNovoClienteOpen(false)}
                  className="px-3.5 py-2 border border-[#E8E2D9] text-[#6E645C] rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#C5A265] text-[#1B1410] font-bold rounded-xl"
                >
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
