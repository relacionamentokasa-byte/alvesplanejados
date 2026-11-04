export interface Cliente {
  id: string;
  nome: string;
  documento: string; // CPF ou CNPJ
  telefone: string;
  whatsapp: string;
  email: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
  };
  observacoes?: string;
  createdAt: string;
}

export interface ImagemAmbiente {
  id: string;
  url: string;
  nome: string;
  legenda?: string;
  principal?: boolean;
}

export interface ItemAmbiente {
  id: string;
  descricao: string;
  quantidade: number;
  unidade?: string;
  valorUnitario: number;
  desconto: number;
  valorTotal: number;
}

export interface Ambiente {
  id: string;
  nome: string; // ex: Cozinha Gourmet, Suíte Master, Closet Integrado
  descricao: string;
  observacoes?: string;
  imagens: ImagemAmbiente[];
  itens: ItemAmbiente[];
  valorSubtotal: number;
  exibirValorIndividual: boolean;
}

export interface Parcela {
  numero: number;
  valor: number;
  vencimento: string;
  descricao: string;
}

export interface CondicoesComerciais {
  valorTotalItens: number;
  descontoGeral: number;
  valorFinal: number;
  formaPagamento: 'a_vista' | 'parcelado' | 'entrada_parcelas' | 'personalizado';
  entrada: number;
  quantidadeParcelas: number;
  parcelas: Parcela[];
  prazoExecucaoDias: number;
  validadeDias: number;
  garantiaMeses: number;
  incluso: string[];
  naoIncluso: string[];
  observacoesComerciais: string;
}

export interface AprovacaoProposta {
  aprovadoEm: string;
  aprovadoPor: string;
  ip?: string;
  versaoAprovada: number;
  observacaoCliente?: string;
  status: 'aprovada' | 'solicitou_ajustes';
}

export interface Proposta {
  id: string;
  numero: string; // ex: PROP-2026-001
  versao: number; // ex: 1, 2, 3
  propostaOrigemId?: string; // Para histórico de versionamento
  clienteId: string;
  cliente: Cliente;
  nomeProjeto: string;
  enderecoObra: string;
  responsavel: string;
  dataEmissao: string;
  dataValidade: string;
  status: 'rascunho' | 'enviada' | 'aprovada' | 'solicitou_ajuste' | 'contrato_gerado' | 'cancelada';
  exibirValoresPorAmbiente: boolean;
  ambientes: Ambiente[];
  condicoes: CondicoesComerciais;
  aprovacao?: AprovacaoProposta;
  publicToken: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClausulaContrato {
  id: string;
  titulo: string;
  conteudo: string;
}

export interface AssinaturaContrato {
  assinadoEm: string;
  assinadoPor: string;
  documentoAssinante: string;
  emailAssinante: string;
  metodo: 'assinatura_eletronica' | 'validada_externa' | 'simulada_demonstrativa';
  ipConexao?: string;
  ipSimulado?: string;
  trilhaAuditoria: {
    evento: string;
    dataHora: string;
    detalhes: string;
  }[];
}

export interface Contrato {
  id: string;
  numero: string; // ex: CTR-2026-001
  propostaId: string;
  propostaNumero: string;
  propostaVersao: number;
  clienteId: string;
  cliente: Cliente;
  nomeProjeto: string;
  enderecoObra: string;
  valorTotal: number;
  condicoesPagamento: string;
  prazoEntregaDias: number;
  garantiaMeses: number;
  status: 'rascunho' | 'aguardando_assinatura' | 'assinado' | 'cancelado';
  clausulas: ClausulaContrato[];
  publicToken: string;
  assinatura?: AssinaturaContrato;
  createdAt: string;
  updatedAt: string;
}

export interface ConfiguracoesEmpresa {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  ie: string;
  telefone: string;
  whatsapp: string;
  email: string;
  enderecoCompleto: string;
  site: string;
  logoUrl: string;
  textoApresentacaoPadrao: string;
  mensagemWhatsappPadrao: string;
  termosGarantiaPadrao: string;
  inclusoPadrao: string[];
  naoInclusoPadrao: string[];
  clausulasContratoPadrao: ClausulaContrato[];
}

export interface LancamentoFinanceiro {
  id: string;
  contractId?: string;
  contractNumber?: string;
  clientId?: string;
  clientName: string;
  description: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pendente' | 'pago' | 'cancelado';
  paymentMethod: 'pix' | 'boleto' | 'cartao' | 'transferencia' | 'dinheiro';
  notes?: string;
  createdAt: string;
}

export interface ResumoFinanceiro {
  totalGeral: number;
  totalRecebido: number;
  totalPendente: number;
  totalAtrasado: number;
  recebidoMesAtual: number;
  pendenteMesAtual: number;
}
