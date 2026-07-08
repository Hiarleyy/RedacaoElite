const { z } = require("zod")

const criarMatriculaSchema = z.object({
  // ── Dados do usuário (criados junto) ──────────────────────────
  nome: z.string().min(2),
  email: z.string().email(),
  turmaId: z.string().uuid(),

  // ── Dados pessoais da matrícula ───────────────────────────────
  cpf: z.string().min(11).max(14),
  dataNascimento: z.string().optional().nullable(),
  genero: z.string().optional().nullable(),

  // ── Contato ──────────────────────────────────────────────────
  telefone: z.string().min(8).max(20),
  endereco: z.string().optional().nullable(),
  bairro: z.string().optional().nullable(),
  cidade: z.string().optional().nullable(),

  // ── Responsável ──────────────────────────────────────────────
  nomeResponsavel: z.string().optional().nullable(),
  vinculoResponsavel: z.string().optional().nullable(),
  telefoneResponsavel: z.string().optional().nullable(),

  // ── Acadêmico ─────────────────────────────────────────────────
  dataInicio: z.string(),
  comoConheceu: z.string().optional().nullable(),
  observacoes: z.string().max(200).optional().nullable(),
})

const atualizarMatriculaSchema = z.object({
  cpf: z.string().min(11).max(14),
  dataNascimento: z.string().optional().nullable(),
  genero: z.string().optional().nullable(),
  telefone: z.string().min(8).max(20),
  endereco: z.string().optional().nullable(),
  bairro: z.string().optional().nullable(),
  cidade: z.string().optional().nullable(),
  nomeResponsavel: z.string().optional().nullable(),
  vinculoResponsavel: z.string().optional().nullable(),
  telefoneResponsavel: z.string().optional().nullable(),
  dataInicio: z.string(),
  comoConheceu: z.string().optional().nullable(),
  observacoes: z.string().max(200).optional().nullable(),
})

module.exports = { criarMatriculaSchema, atualizarMatriculaSchema }
