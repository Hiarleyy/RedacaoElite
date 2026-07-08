const pagamentosRepository = require("../repositories/pagamentos-repository")
const usuariosRepository = require("../repositories/usuarios-repository")
const {criarPagamentoSchema, atualizarPagamentoSchema, deletarPagamentoSchema}  = require("../schemas/pagamentos-schema")
const HttpError = require("../error/http-error")

const pagamentosModel = {
  gerarPagamentosAutomaticos: async (specificUsuarioId = null) => {
    const prisma = require("../database/db");
    const uuid = require("uuid");
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth();

    const whereClause = {
      diaVencimentoPadrao: { not: null },
      valorMensalidadePadrao: { not: null },
      tipoUsuario: "STANDARD"
    };
    if (specificUsuarioId) {
      whereClause.id = specificUsuarioId;
    }

    try {
      const usuarios = await prisma.usuario.findMany({ where: whereClause });

      const mesesParaVerificar = [
        { ano: anoAtual, mes: mesAtual },
        { ano: mesAtual === 11 ? anoAtual + 1 : anoAtual, mes: (mesAtual + 1) % 12 }
      ];

      for (const usuario of usuarios) {
        const diaVenc = usuario.diaVencimentoPadrao;
        const valor = usuario.valorMensalidadePadrao;

        for (const { ano, mes } of mesesParaVerificar) {
          const ultimoDiaDoMes = new Date(ano, mes + 1, 0).getDate();
          const diaReal = Math.min(diaVenc, ultimoDiaDoMes);
          const vencimentoCorrente = new Date(ano, mes, diaReal, 12, 0, 0);

          const diffTime = vencimentoCorrente.getTime() - hoje.getTime();
          const diffDays = diffTime / (1000 * 60 * 60 * 24);

          // Gera se estiver a 10 dias ou menos do vencimento (ou se já tiver passado)
          if (diffDays <= 10) {
            const inicioMes = new Date(ano, mes, 1);
            const fimMes = new Date(ano, mes + 1, 0, 23, 59, 59);

            const pagamentoExistente = await prisma.pagamento.findFirst({
              where: {
                usuarioId: usuario.id,
                status: "ENTRADA",
                dataVencimento: {
                  gte: inicioMes,
                  lte: fimMes
                }
              }
            });

            if (!pagamentoExistente) {
              await prisma.pagamento.create({
                data: {
                  id: uuid.v4(),
                  usuarioId: usuario.id,
                  valor: valor,
                  status: "ENTRADA",
                  tipoDespensa: "Mensalidade",
                  dataVencimento: vencimentoCorrente,
                  dataPagamento: null
                }
              });
            }
          }
        }
      }
    } catch (err) {
      console.error("Erro ao gerar pagamentos automáticos:", err);
    }
  },

  retornarPagamentos: async() =>{
    await pagamentosModel.gerarPagamentosAutomaticos()
    const pagamentos = await pagamentosRepository.retorneTodosOsPagamentos()
    return pagamentos
  },

  criarPagamento: async (data) => {
    const corpo = criarPagamentoSchema.safeParse(data)
    if (!corpo.success){
      console.log("Erro de validação:", corpo.error.errors);
      throw new HttpError(400, "Erro de validação: Verifique se os dados enviados estão corretos.");
    }

    const Novopagamento = await pagamentosRepository.crieNovoPagamento(corpo.data)

    // Configurar o vencimento e valor padrão do aluno no primeiro lançamento
    if (corpo.data.usuarioId && corpo.data.dataVencimento && corpo.data.status === "ENTRADA") {
      try {
        const prisma = require("../database/db");
        const user = await prisma.usuario.findUnique({
          where: { id: corpo.data.usuarioId }
        });
        
        if (user && (user.diaVencimentoPadrao === null || user.valorMensalidadePadrao === null)) {
          const dateObj = new Date(corpo.data.dataVencimento);
          const day = dateObj.getUTCDate(); // Usar data UTC para extrair o dia correto correspondente ao string YYYY-MM-DD
          
          await prisma.usuario.update({
            where: { id: corpo.data.usuarioId },
            data: {
              diaVencimentoPadrao: day,
              valorMensalidadePadrao: corpo.data.valor
            }
          });
        }
      } catch (err) {
        console.error("Erro ao definir vencimento/valor padrão:", err);
      }
    }

    return Novopagamento
  },

  atualizarPagamento: async(id, data) => {
    const corpo = atualizarPagamentoSchema.safeParse(data)
    if (!corpo.success) {
      throw new HttpError(400, "Erro de validação: Verifique se os dados enviados estão corretos.");
    } 
    // verificar pagamento se pagamento existe
    const pagamentoExistente = await pagamentosRepository.retorneUmPagamentoPeloId(id)
    if(!pagamentoExistente) throw new HttpError(404, "Esse pagamento nao existe.")
    
    const updatePagamento = await pagamentosRepository.updateUmPagamento(id, corpo.data)

    return updatePagamento
  },
  
  deletarPagamentos: async(id) => {
    const deletePagamento = await pagamentosRepository.deleteUmPagamento(id)
    return deletePagamento
  },

  retornarPagamentosUsuario: async(id) =>{
    const usuario = await usuariosRepository.retorneUmUsuarioPeloId(id)
    if (!usuario) {
      throw new HttpError(404, "Esse usuário não existe.")
    }

    await pagamentosModel.gerarPagamentosAutomaticos(id)
    const pagamentos = await pagamentosRepository.retorneTodosOsPagamentosUsuario(id)
    return pagamentos
  }
}

module.exports = pagamentosModel
