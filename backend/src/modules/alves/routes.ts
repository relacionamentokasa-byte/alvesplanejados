import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { randomBytes } from 'node:crypto';
import { prisma } from '../../lib/prisma.js';
import { alvesAuthMiddleware, alvesRoleMiddleware } from '../../middlewares/alvesAuth.js';
import { createAuditLog } from '../../lib/audit.js';

export const alvesRouter = Router();
export const publicAlvesRouter = Router();

const addressSchema = z.object({
  logradouro: z.string().default(''),
  numero: z.string().default(''),
  complemento: z.string().optional(),
  bairro: z.string().default(''),
  cidade: z.string().default(''),
  uf: z.string().default(''),
  cep: z.string().default('')
});

const clientSchema = z.object({
  nome: z.string().min(2),
  documento: z.string().default(''),
  telefone: z.string().default(''),
  whatsapp: z.string().default(''),
  email: z.string().email().or(z.literal('')).default(''),
  endereco: addressSchema,
  observacoes: z.string().optional()
});

const proposalSchema = z.object({
  numero: z.string().min(1),
  versao: z.number().int().positive().default(1),
  propostaOrigemId: z.string().optional(),
  clienteId: z.string().min(1),
  nomeProjeto: z.string().min(1),
  enderecoObra: z.string().default(''),
  responsavel: z.string().default(''),
  dataEmissao: z.coerce.date(),
  dataValidade: z.coerce.date(),
  status: z.enum(['rascunho', 'enviada', 'aprovada', 'solicitou_ajuste', 'contrato_gerado', 'cancelada']).default('rascunho'),
  exibirValoresPorAmbiente: z.boolean().default(true),
  ambientes: z.array(z.any()).default([]),
  condicoes: z.record(z.any()).default({}),
  aprovacao: z.record(z.any()).optional(),
  publicToken: z.string().optional()
});

const configSchema = z.object({
  razaoSocial: z.string(), nomeFantasia: z.string(), cnpj: z.string(), ie: z.string(),
  telefone: z.string(), whatsapp: z.string(), email: z.string(), enderecoCompleto: z.string(),
  site: z.string(), logoUrl: z.string(), textoApresentacaoPadrao: z.string(),
  mensagemWhatsappPadrao: z.string(), termosGarantiaPadrao: z.string(),
  inclusoPadrao: z.array(z.string()), naoInclusoPadrao: z.array(z.string()),
  clausulasContratoPadrao: z.array(z.object({ id: z.string(), titulo: z.string(), conteudo: z.string() }))
});

const serializeClient = (client: any) => ({
  id: client.id, nome: client.name, documento: client.document, telefone: client.phone,
  whatsapp: client.whatsapp, email: client.email, endereco: client.address,
  observacoes: client.notes || undefined, createdAt: client.createdAt.toISOString()
});

const serializeProposal = (proposal: any) => ({
  id: proposal.id, numero: proposal.number, versao: proposal.version,
  propostaOrigemId: proposal.originId || undefined, clienteId: proposal.clientId,
  cliente: proposal.client ? serializeClient(proposal.client) : undefined,
  nomeProjeto: proposal.projectName, enderecoObra: proposal.workAddress,
  responsavel: proposal.responsible, dataEmissao: proposal.issueDate.toISOString().slice(0, 10),
  dataValidade: proposal.expirationDate.toISOString().slice(0, 10), status: proposal.status,
  exibirValoresPorAmbiente: proposal.showRoomValues, ambientes: proposal.rooms,
  condicoes: proposal.commercialConditions, aprovacao: proposal.approval || undefined,
  publicToken: proposal.publicToken, createdAt: proposal.createdAt.toISOString(), updatedAt: proposal.updatedAt.toISOString()
});

const serializeContract = (contract: any) => ({
  id: contract.id, numero: contract.number, propostaId: contract.proposalId,
  propostaNumero: contract.proposalNumber, propostaVersao: contract.proposalVersion,
  clienteId: contract.clientId, cliente: contract.client ? serializeClient(contract.client) : undefined,
  nomeProjeto: contract.projectName, enderecoObra: contract.workAddress,
  valorTotal: Number(contract.totalValue), condicoesPagamento: contract.paymentTerms,
  prazoEntregaDias: contract.deliveryDays, garantiaMeses: contract.warrantyMonths,
  status: contract.status, clausulas: contract.clauses, publicToken: contract.publicToken,
  assinatura: contract.signature || undefined, createdAt: contract.createdAt.toISOString(), updatedAt: contract.updatedAt.toISOString()
});

const clientInclude = { _count: { select: { proposals: true, contracts: true } } };
const proposalInclude = { client: true };
const contractInclude = { client: true };

alvesRouter.use(alvesAuthMiddleware);

alvesRouter.get('/clientes', async (_req, res) => {
  const clients = await prisma.alvesClient.findMany({ where: { active: true }, orderBy: { createdAt: 'desc' }, include: clientInclude });
  return res.json({ clientes: clients.map(serializeClient) });
});

alvesRouter.get('/clientes/:id', async (req, res) => {
  const client = await prisma.alvesClient.findUnique({ where: { id: req.params.id }, include: { proposals: { orderBy: { updatedAt: 'desc' }, include: proposalInclude }, contracts: { orderBy: { updatedAt: 'desc' }, include: contractInclude } } });
  if (!client || !client.active) return res.status(404).json({ error: 'Cliente não encontrado' });
  return res.json({ cliente: serializeClient(client), propostas: client.proposals.map(serializeProposal), contratos: client.contracts.map(serializeContract) });
});

alvesRouter.post('/clientes', async (req, res) => {
  try {
    const data = clientSchema.parse(req.body);
    const client = await prisma.alvesClient.create({ data: { name: data.nome, document: data.documento, phone: data.telefone, whatsapp: data.whatsapp, email: data.email, address: data.endereco, notes: data.observacoes } });
    await createAuditLog({ alvesUser: req.alvesUser, action: 'CREATE', entity: 'ALVES_CLIENT', entityId: client.id, details: { nome: client.name }, ipAddress: req.ip });
    return res.status(201).json({ cliente: serializeClient(client) });
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message });
    return res.status(500).json({ error: 'Erro ao cadastrar cliente' });
  }
});

alvesRouter.put('/clientes/:id', async (req, res) => {
  try {
    const data = clientSchema.parse(req.body);
    const client = await prisma.alvesClient.update({ where: { id: req.params.id }, data: { name: data.nome, document: data.documento, phone: data.telefone, whatsapp: data.whatsapp, email: data.email, address: data.endereco, notes: data.observacoes } });
    await createAuditLog({ alvesUser: req.alvesUser, action: 'UPDATE', entity: 'ALVES_CLIENT', entityId: client.id, details: data, ipAddress: req.ip });
    return res.json({ cliente: serializeClient(client) });
  } catch (err: any) {
    if (err?.code === 'P2025') return res.status(404).json({ error: 'Cliente não encontrado' });
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message });
    return res.status(500).json({ error: 'Erro ao atualizar cliente' });
  }
});

alvesRouter.delete('/clientes/:id', alvesRoleMiddleware(['ADMIN', 'GESTOR']), async (req, res) => {
  try {
    const client = await prisma.alvesClient.update({ where: { id: req.params.id }, data: { active: false } });
    await createAuditLog({ alvesUser: req.alvesUser, action: 'DELETE', entity: 'ALVES_CLIENT', entityId: client.id, details: { softDelete: true }, ipAddress: req.ip });
    return res.json({ message: 'Cliente excluído com sucesso' });
  } catch (err: any) {
    if (err?.code === 'P2025') return res.status(404).json({ error: 'Cliente não encontrado' });
    return res.status(500).json({ error: 'Erro ao excluir cliente' });
  }
});

alvesRouter.get('/propostas', async (_req, res) => {
  const proposals = await prisma.alvesProposal.findMany({
    where: { status: { not: 'cancelada' } },
    orderBy: { updatedAt: 'desc' },
    include: proposalInclude
  });
  return res.json({ propostas: proposals.map(serializeProposal) });
});

alvesRouter.get('/propostas/:id', async (req, res) => {
  const proposal = await prisma.alvesProposal.findUnique({ where: { id: req.params.id }, include: proposalInclude });
  if (!proposal) return res.status(404).json({ error: 'Proposta não encontrada' });
  return res.json({ proposta: serializeProposal(proposal) });
});

alvesRouter.post('/propostas', async (req, res) => {
  try {
    const data = proposalSchema.parse(req.body);
    const client = await prisma.alvesClient.findUnique({ where: { id: data.clienteId } });
    if (!client || !client.active) return res.status(400).json({ error: 'Cliente não encontrado' });
    const proposal = await prisma.alvesProposal.create({ data: { number: data.numero, version: data.versao, originId: data.propostaOrigemId, clientId: data.clienteId, projectName: data.nomeProjeto, workAddress: data.enderecoObra, responsible: data.responsavel, issueDate: data.dataEmissao, expirationDate: data.dataValidade, status: data.status, showRoomValues: data.exibirValoresPorAmbiente, rooms: data.ambientes, commercialConditions: data.condicoes, approval: data.aprovacao, publicToken: data.publicToken || randomBytes(24).toString('hex') }, include: proposalInclude });
    await createAuditLog({ alvesUser: req.alvesUser, action: 'CREATE', entity: 'ALVES_PROPOSAL', entityId: proposal.id, details: { number: proposal.number, version: proposal.version }, ipAddress: req.ip });
    return res.status(201).json({ proposta: serializeProposal(proposal) });
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message });
    if (err?.code === 'P2002') return res.status(409).json({ error: 'Número, versão ou token público já cadastrado' });
    return res.status(500).json({ error: 'Erro ao cadastrar proposta' });
  }
});

alvesRouter.put('/propostas/:id', async (req, res) => {
  try {
    const data = proposalSchema.parse(req.body);
    const proposal = await prisma.alvesProposal.update({ where: { id: req.params.id }, data: { number: data.numero, version: data.versao, originId: data.propostaOrigemId, clientId: data.clienteId, projectName: data.nomeProjeto, workAddress: data.enderecoObra, responsible: data.responsavel, issueDate: data.dataEmissao, expirationDate: data.dataValidade, status: data.status, showRoomValues: data.exibirValoresPorAmbiente, rooms: data.ambientes, commercialConditions: data.condicoes, approval: data.aprovacao }, include: proposalInclude });
    await createAuditLog({ alvesUser: req.alvesUser, action: 'UPDATE', entity: 'ALVES_PROPOSAL', entityId: proposal.id, details: { number: proposal.number, status: proposal.status }, ipAddress: req.ip });
    return res.json({ proposta: serializeProposal(proposal) });
  } catch (err: any) {
    if (err?.code === 'P2025') return res.status(404).json({ error: 'Proposta não encontrada' });
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message });
    return res.status(500).json({ error: 'Erro ao atualizar proposta' });
  }
});

alvesRouter.post('/propostas/:id/nova-versao', async (req, res) => {
  try {
    const created = await prisma.$transaction(async (tx) => {
      const original = await tx.alvesProposal.findUnique({ where: { id: req.params.id } });
      if (!original) throw Object.assign(new Error('Proposta original não encontrada'), { code: 'NOT_FOUND' });
      const rootId = original.originId || original.id;
      const versions = await tx.alvesProposal.findMany({ where: { OR: [{ id: rootId }, { originId: rootId }] }, select: { version: true } });
      const nextVersion = Math.max(...versions.map((item) => item.version), original.version) + 1;
      return tx.alvesProposal.create({ data: { number: original.number.replace(/ - V\d+$/, '') + ` - V${nextVersion}`, version: nextVersion, originId: rootId, clientId: original.clientId, projectName: original.projectName, workAddress: original.workAddress, responsible: original.responsible, issueDate: original.issueDate, expirationDate: original.expirationDate, status: 'rascunho', showRoomValues: original.showRoomValues, rooms: original.rooms, commercialConditions: original.commercialConditions, publicToken: randomBytes(24).toString('hex') }, include: proposalInclude });
    });
    await createAuditLog({ alvesUser: req.alvesUser, action: 'CREATE', entity: 'ALVES_PROPOSAL', entityId: created.id, details: { versionOf: req.params.id, version: created.version }, ipAddress: req.ip });
    return res.status(201).json({ proposta: serializeProposal(created) });
  } catch (err: any) {
    if (err?.code === 'NOT_FOUND') return res.status(404).json({ error: err.message });
    return res.status(500).json({ error: 'Erro ao criar nova versão da proposta' });
  }
});

alvesRouter.delete('/propostas/:id', alvesRoleMiddleware(['ADMIN', 'GESTOR']), async (req, res) => {
  try {
    const proposal = await prisma.$transaction(async (tx) => {
      // 1. Desvincular ou cancelar contratos relacionados se existirem
      await tx.alvesContract.deleteMany({ where: { proposalId: req.params.id } });
      // 2. Apagar permanentemente a proposta ou soft-delete se preferir; aqui deletamos para limpar de vez
      return await tx.alvesProposal.delete({ where: { id: req.params.id } });
    });

    await createAuditLog({ alvesUser: req.alvesUser, action: 'DELETE', entity: 'ALVES_PROPOSAL', entityId: proposal.id, details: { deleted: true }, ipAddress: req.ip });
    return res.json({ message: 'Proposta excluída com sucesso' });
  } catch (err: any) {
    if (err?.code === 'P2025') return res.status(404).json({ error: 'Proposta não encontrada' });
    console.error('Erro ao excluir proposta:', err);
    return res.status(500).json({ error: 'Erro ao excluir proposta' });
  }
});

alvesRouter.post('/propostas/:id/contrato', alvesRoleMiddleware(['ADMIN', 'GESTOR']), async (req, res) => {
  try {
    const contract = await prisma.$transaction(async (tx) => {
      const proposal = await tx.alvesProposal.findUnique({ where: { id: req.params.id }, include: { client: true } });
      if (!proposal) throw Object.assign(new Error('Proposta não encontrada'), { code: 'NOT_FOUND' });
      if (proposal.status !== 'aprovada') throw Object.assign(new Error('Apenas propostas aprovadas podem gerar contrato'), { code: 'INVALID_STATUS' });
      const config = await tx.alvesConfiguration.findUnique({ where: { id: 'default' } });
      const count = await tx.alvesContract.count();
      const year = new Date().getFullYear();
      const payment = proposal.commercialConditions as any;
      const paymentTerms = payment.formaPagamento === 'a_vista' ? `Pagamento integral à vista no valor de R$ ${Number(payment.valorFinal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.` : `${payment.quantidadeParcelas || 0}x parcelas mensais, sendo entrada de R$ ${Number(payment.entrada || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} e saldo parcelado.`;
      const result = await tx.alvesContract.create({ data: { number: `CTR-${year}-${String(count + 1).padStart(3, '0')}`, proposalId: proposal.id, proposalNumber: proposal.number, proposalVersion: proposal.version, clientId: proposal.clientId, projectName: proposal.projectName, workAddress: proposal.workAddress, totalValue: Number(payment.valorFinal || 0), paymentTerms, deliveryDays: Number(payment.prazoExecucaoDias || 45), warrantyMonths: Number(payment.garantiaMeses || 60), clauses: config?.standardClauses || [], publicToken: randomBytes(24).toString('hex') }, include: contractInclude });
      await tx.alvesProposal.update({ where: { id: proposal.id }, data: { status: 'contrato_gerado' } });

      // Gerar automaticamente as parcelas financeiras a receber para a marcenaria
      const total = Number(payment.valorFinal || 0);
      const isAVista = payment.formaPagamento === 'a_vista';
      const today = new Date();

      if (isAVista) {
        await tx.alvesFinancialEntry.create({
          data: {
            contractId: result.id,
            clientId: proposal.clientId,
            clientName: proposal.client.name,
            description: `Pagamento integral à vista - ${proposal.projectName}`,
            amount: total,
            dueDate: today,
            status: 'pendente',
            paymentMethod: payment.tipoPagamento || 'pix'
          }
        });
      } else {
        const qtdParcelas = Math.max(1, Number(payment.quantidadeParcelas || 1));
        const entrada = Number(payment.entrada || 0);
        const saldo = total - entrada;

        if (entrada > 0) {
          await tx.alvesFinancialEntry.create({
            data: {
              contractId: result.id,
              clientId: proposal.clientId,
              clientName: proposal.client.name,
              description: `Entrada (Sinal do Projeto) - ${proposal.projectName}`,
              amount: entrada,
              dueDate: today,
              status: 'pendente',
              paymentMethod: 'pix'
            }
          });
        }

        if (saldo > 0 && qtdParcelas > 0) {
          const valorParcela = Number((saldo / qtdParcelas).toFixed(2));
          for (let i = 1; i <= qtdParcelas; i++) {
            const vencimento = new Date();
            vencimento.setMonth(vencimento.getMonth() + i);
            await tx.alvesFinancialEntry.create({
              data: {
                contractId: result.id,
                clientId: proposal.clientId,
                clientName: proposal.client.name,
                description: `Parcela ${i}/${qtdParcelas} - ${proposal.projectName}`,
                amount: valorParcela,
                dueDate: vencimento,
                status: 'pendente',
                paymentMethod: 'boleto'
              }
            });
          }
        }
      }

      return result;
    });
    await createAuditLog({ alvesUser: req.alvesUser, action: 'CREATE', entity: 'ALVES_CONTRACT', entityId: contract.id, details: { proposalId: contract.proposalId }, ipAddress: req.ip });
    return res.status(201).json({ contrato: serializeContract(contract) });
  } catch (err: any) {
    if (err?.code === 'NOT_FOUND' || err?.code === 'INVALID_STATUS') return res.status(400).json({ error: err.message });
    return res.status(500).json({ error: 'Erro ao gerar contrato' });
  }
});

alvesRouter.get('/contratos', async (_req, res) => {
  const contracts = await prisma.alvesContract.findMany({ orderBy: { updatedAt: 'desc' }, include: contractInclude });
  return res.json({ contratos: contracts.map(serializeContract) });
});

alvesRouter.get('/contratos/:id', async (req, res) => {
  const contract = await prisma.alvesContract.findUnique({ where: { id: req.params.id }, include: contractInclude });
  if (!contract) return res.status(404).json({ error: 'Contrato não encontrado' });
  return res.json({ contrato: serializeContract(contract) });
});

const handleAssinaturaDigital = async (req: Request, res: Response) => {
  try {
    const signer = z.object({ nome: z.string().min(2), documento: z.string().min(2), email: z.string().email() }).parse(req.body);
    const now = new Date().toISOString();
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || '127.0.0.1';
    const signature = {
      assinadoEm: now,
      assinadoPor: signer.nome,
      documentoAssinante: signer.documento,
      emailAssinante: signer.email,
      metodo: 'assinatura_eletronica',
      ipConexao: clientIp,
      trilhaAuditoria: [
        {
          evento: 'Assinatura eletrônica autenticada',
          dataHora: now,
          detalhes: `Registrado por ${signer.nome} via IP ${clientIp} com consentimento formal.`
        }
      ]
    };
    const contract = await prisma.alvesContract.update({
      where: { publicToken: req.params.token },
      data: { status: 'assinado', signature },
      include: contractInclude
    });
    await createAuditLog({
      action: 'STATUS_CHANGE',
      entity: 'ALVES_CONTRACT',
      entityId: contract.id,
      details: { electronicSignature: true, signer: signer.email, ip: clientIp },
      ipAddress: req.ip
    });
    return res.json({ contrato: serializeContract(contract) });
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message });
    if (err?.code === 'P2025') return res.status(404).json({ error: 'Contrato não encontrado' });
    return res.status(500).json({ error: 'Erro ao registrar assinatura eletrônica' });
  }
};

alvesRouter.patch('/contratos/:token/assinatura-digital', handleAssinaturaDigital);
alvesRouter.patch('/contratos/:token/assinatura-demonstrativa', handleAssinaturaDigital);

// ==================== ROTAS DE GESTÃO FINANCEIRA ====================
const serializeFinancialEntry = (entry: any) => ({
  id: entry.id,
  contractId: entry.contractId || undefined,
  contractNumber: entry.contract?.number || undefined,
  clientId: entry.clientId || undefined,
  clientName: entry.clientName,
  description: entry.description,
  amount: Number(entry.amount),
  dueDate: entry.dueDate.toISOString().slice(0, 10),
  paidDate: entry.paidDate ? entry.paidDate.toISOString().slice(0, 10) : undefined,
  status: entry.status,
  paymentMethod: entry.paymentMethod,
  notes: entry.notes || undefined,
  createdAt: entry.createdAt.toISOString()
});

alvesRouter.get('/financeiro', async (req, res) => {
  try {
    const entries = await prisma.alvesFinancialEntry.findMany({
      orderBy: { dueDate: 'asc' },
      include: { contract: { select: { number: true, projectName: true } } }
    });

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let totalRecebido = 0;
    let totalPendente = 0;
    let totalAtrasado = 0;
    let recebidoMesAtual = 0;
    let pendenteMesAtual = 0;

    for (const entry of entries) {
      const valor = Number(entry.amount);
      const dataVenc = new Date(entry.dueDate);
      const isMesAtual = dataVenc.getMonth() === currentMonth && dataVenc.getFullYear() === currentYear;

      if (entry.status === 'pago') {
        totalRecebido += valor;
        if (isMesAtual) recebidoMesAtual += valor;
      } else if (entry.status === 'pendente') {
        if (dataVenc < now && dataVenc.toDateString() !== now.toDateString()) {
          totalAtrasado += valor;
        } else {
          totalPendente += valor;
        }
        if (isMesAtual) pendenteMesAtual += valor;
      }
    }

    return res.json({
      resumo: {
        totalGeral: totalRecebido + totalPendente + totalAtrasado,
        totalRecebido,
        totalPendente,
        totalAtrasado,
        recebidoMesAtual,
        pendenteMesAtual
      },
      lancamentos: entries.map(serializeFinancialEntry)
    });
  } catch (err: any) {
    console.error('Erro ao buscar lançamentos financeiros:', err);
    return res.status(500).json({ error: 'Erro ao carregar dados financeiros' });
  }
});

alvesRouter.post('/financeiro', async (req, res) => {
  try {
    const schema = z.object({
      contractId: z.string().optional(),
      clientId: z.string().optional(),
      clientName: z.string().min(1, 'Nome do cliente é obrigatório'),
      description: z.string().min(1, 'Descrição é obrigatória'),
      amount: z.number().positive('Valor deve ser maior que zero'),
      dueDate: z.coerce.date(),
      paymentMethod: z.enum(['pix', 'boleto', 'cartao', 'transferencia', 'dinheiro']).default('pix'),
      notes: z.string().optional()
    });

    const data = schema.parse(req.body);
    const entry = await prisma.alvesFinancialEntry.create({
      data: {
        contractId: data.contractId || null,
        clientId: data.clientId || null,
        clientName: data.clientName,
        description: data.description,
        amount: data.amount,
        dueDate: data.dueDate,
        paymentMethod: data.paymentMethod,
        notes: data.notes || null,
        status: 'pendente'
      },
      include: { contract: { select: { number: true } } }
    });

    return res.status(201).json({ lancamento: serializeFinancialEntry(entry) });
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message });
    return res.status(500).json({ error: 'Erro ao criar lançamento financeiro' });
  }
});

alvesRouter.patch('/financeiro/:id/status', async (req, res) => {
  try {
    const schema = z.object({
      status: z.enum(['pendente', 'pago', 'cancelado']),
      paidDate: z.coerce.date().optional()
    });

    const data = schema.parse(req.body);
    const paidDate = data.status === 'pago' ? (data.paidDate || new Date()) : null;

    const entry = await prisma.alvesFinancialEntry.update({
      where: { id: req.params.id },
      data: {
        status: data.status,
        paidDate
      },
      include: { contract: { select: { number: true } } }
    });

    return res.json({ lancamento: serializeFinancialEntry(entry) });
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message });
    if (err?.code === 'P2025') return res.status(404).json({ error: 'Lançamento não encontrado' });
    return res.status(500).json({ error: 'Erro ao atualizar status do lançamento' });
  }
});

alvesRouter.delete('/financeiro/:id', async (req, res) => {
  try {
    await prisma.alvesFinancialEntry.delete({ where: { id: req.params.id } });
    return res.json({ message: 'Lançamento excluído com sucesso' });
  } catch (err: any) {
    if (err?.code === 'P2025') return res.status(404).json({ error: 'Lançamento não encontrado' });
    return res.status(500).json({ error: 'Erro ao excluir lançamento' });
  }
});

alvesRouter.get('/configuracao', async (_req, res) => {
  const config = await prisma.alvesConfiguration.findUnique({ where: { id: 'default' } });
  if (!config) return res.status(404).json({ error: 'Configuração não encontrada' });
  return res.json({ configuracao: { ...(config.companyData as object), clausulasContratoPadrao: config.standardClauses } });
});

alvesRouter.put('/configuracao', alvesRoleMiddleware(['ADMIN', 'GESTOR']), async (req, res) => {
  try {
    const data = configSchema.parse(req.body);
    const config = await prisma.alvesConfiguration.upsert({ where: { id: 'default' }, update: { companyData: data, standardClauses: data.clausulasContratoPadrao, version: { increment: 1 } }, create: { id: 'default', companyData: data, standardClauses: data.clausulasContratoPadrao } });
    await createAuditLog({ alvesUser: req.alvesUser, action: 'UPDATE', entity: 'ALVES_CONFIG', entityId: config.id, details: { version: config.version }, ipAddress: req.ip });
    return res.json({ configuracao: { ...(config.companyData as object), clausulasContratoPadrao: config.standardClauses } });
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message });
    return res.status(500).json({ error: 'Erro ao atualizar configuração' });
  }
});

publicAlvesRouter.get('/configuracao', async (_req, res) => {
  const config = await prisma.alvesConfiguration.findUnique({ where: { id: 'default' } });
  if (!config) return res.status(404).json({ error: 'Configuração não encontrada' });
  return res.json({ configuracao: { ...(config.companyData as object), clausulasContratoPadrao: config.standardClauses } });
});

publicAlvesRouter.get('/contratos/:token', async (req, res) => {
  const contract = await prisma.alvesContract.findUnique({ where: { publicToken: req.params.token }, include: contractInclude });
  if (!contract) return res.status(404).json({ error: 'Contrato não encontrado' });
  return res.json({ contrato: serializeContract(contract) });
});

publicAlvesRouter.get('/propostas/:token', async (req, res) => {
  const proposal = await prisma.alvesProposal.findUnique({ where: { publicToken: req.params.token }, include: proposalInclude });
  if (!proposal) return res.status(404).json({ error: 'Proposta não encontrada' });
  if (proposal.expirationDate < new Date() && !['aprovada', 'contrato_gerado'].includes(proposal.status)) return res.status(410).json({ error: 'Esta proposta expirou' });
  return res.json({ proposta: serializeProposal(proposal) });
});

publicAlvesRouter.post('/propostas/:token/aprovar', async (req, res) => {
  try {
    const input = z.object({ aprovadoPor: z.string().optional(), observacao: z.string().max(2000).optional() }).parse(req.body);
    const proposal = await prisma.$transaction(async (tx) => {
      const current = await tx.alvesProposal.findUnique({ where: { publicToken: req.params.token }, include: proposalInclude });
      if (!current) throw Object.assign(new Error('Proposta não encontrada'), { code: 'NOT_FOUND' });
      if (current.expirationDate < new Date()) throw Object.assign(new Error('Esta proposta expirou'), { code: 'EXPIRED' });
      if (!['enviada', 'solicitou_ajuste', 'rascunho'].includes(current.status)) throw Object.assign(new Error('Esta proposta não pode ser aprovada no estado atual'), { code: 'INVALID_STATUS' });
      const approval = { aprovadoEm: new Date().toISOString(), aprovadoPor: input.aprovadoPor?.trim() || current.client.name, ip: req.ip, versaoAprovada: current.version, observacaoCliente: input.observacao, status: 'aprovada' };
      return tx.alvesProposal.update({ where: { id: current.id }, data: { status: 'aprovada', approval }, include: proposalInclude });
    });
    await createAuditLog({ action: 'STATUS_CHANGE', entity: 'ALVES_PROPOSAL', entityId: proposal.id, details: { status: 'aprovada' }, ipAddress: req.ip });
    return res.json({ proposta: serializeProposal(proposal) });
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message });
    if (err?.code === 'NOT_FOUND') return res.status(404).json({ error: err.message });
    if (err?.code === 'EXPIRED') return res.status(410).json({ error: err.message });
    if (err?.code === 'INVALID_STATUS') return res.status(409).json({ error: err.message });
    return res.status(500).json({ error: 'Erro ao aprovar proposta' });
  }
});

publicAlvesRouter.post('/propostas/:token/ajuste', async (req, res) => {
  try {
    const input = z.object({ solicitante: z.string().optional(), observacao: z.string().min(1).max(2000) }).parse(req.body);
    const proposal = await prisma.$transaction(async (tx) => {
      const current = await tx.alvesProposal.findUnique({ where: { publicToken: req.params.token }, include: proposalInclude });
      if (!current) throw Object.assign(new Error('Proposta não encontrada'), { code: 'NOT_FOUND' });
      if (current.expirationDate < new Date()) throw Object.assign(new Error('Esta proposta expirou'), { code: 'EXPIRED' });
      const approval = { aprovadoEm: new Date().toISOString(), aprovadoPor: input.solicitante?.trim() || current.client.name, ip: req.ip, versaoAprovada: current.version, observacaoCliente: input.observacao, status: 'solicitou_ajustes' };
      return tx.alvesProposal.update({ where: { id: current.id }, data: { status: 'solicitou_ajuste', approval }, include: proposalInclude });
    });
    await createAuditLog({ action: 'STATUS_CHANGE', entity: 'ALVES_PROPOSAL', entityId: proposal.id, details: { status: 'solicitou_ajuste' }, ipAddress: req.ip });
    return res.json({ proposta: serializeProposal(proposal) });
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message });
    if (err?.code === 'NOT_FOUND') return res.status(404).json({ error: err.message });
    if (err?.code === 'EXPIRED') return res.status(410).json({ error: err.message });
    return res.status(500).json({ error: 'Erro ao registrar solicitação de ajuste' });
  }
});
