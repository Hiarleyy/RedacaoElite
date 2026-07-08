const express = require("express")
const usuariosController = require("./controllers/usuarios-controller")
const turmaController = require("./controllers/turmas-controller")
const pagamentosController = require("./controllers/pagamentos-controller")
const modulosController = require("./controllers/modulos-controller")
const redacoesController = require("./controllers/redacoes-controller")
const propostasController = require("./controllers/propostas-controller")
const uploadRedacoes = require("./middlewares/upload-redacoes")
const uploadPropostas = require("./middlewares/upload-propostas")
const uploadCorrecoes = require("./middlewares/upload-correcoes")
const frequenciasController = require("./controllers/frequencias-controller")
const correcoesController = require("./controllers/correcoes-controller")
const rankingController = require("./controllers/ranking-controller")
const videosController = require("./controllers/videos-controller")
const simuladoController = require("./controllers/simulado-controller")
const notasSimuladoController = require("./controllers/notasSimulado-Controller")
const uploadImagens = require('./middlewares/upload-imagens')
const adminMiddleware = require("./middlewares/admin-middleware")
const authMiddleware = require("./middlewares/auth-middleware")
const calendarioController = require("./controllers/calendario-controller")
const tipoEventoController = require("./controllers/tipoEvento-controller")
const matriculasController = require("./controllers/matriculas-controller")

const router = express.Router()

// Rota de teste
router.get("/teste", (req, res) => {
  res.status(200).json({ message: "Se você está lendo essa mensagem, é porque a api está funcionando." })
})

// Rotas relacionadas a usuários (OK)
router.post("/usuarios/login", usuariosController.login)
router.get("/usuarios", authMiddleware, adminMiddleware, usuariosController.index)
router.get("/usuarios/:id", authMiddleware, usuariosController.show)
router.post("/usuarios", authMiddleware, adminMiddleware, usuariosController.create)
router.put("/usuarios/:id", authMiddleware, adminMiddleware, usuariosController.update)
router.delete("/usuarios/:id", authMiddleware, adminMiddleware, usuariosController.delete)
router.post("/usuarios/:id/trocar-senha", authMiddleware, usuariosController.updatePassword)
router.patch("/usuarios/:id/resetar-senha", authMiddleware, usuariosController.resetPassword)
router.post("/usuarios/:id", authMiddleware, uploadImagens.single('file'), usuariosController.profileUpload)
router.get("/usuarios/:id/profile-image", usuariosController.getProfileImage)

// Rotas relacionadas a turmas (OK)
router.get("/turmas", authMiddleware, turmaController.index)
router.get("/turmas/:id", authMiddleware, adminMiddleware, turmaController.show)
router.post("/turmas", authMiddleware, adminMiddleware, turmaController.create)
router.put("/turmas/:id", authMiddleware, adminMiddleware, turmaController.update)
router.delete("/turmas/:id", authMiddleware, adminMiddleware, turmaController.delete)

// Rotas relacionadas a pagamentos
router.get("/pagamentos", authMiddleware, adminMiddleware, pagamentosController.index)
router.post('/pagamentos', authMiddleware, adminMiddleware, pagamentosController.create)
router.put('/pagamentos/:id', authMiddleware, adminMiddleware, pagamentosController.update)
router.delete('/pagamentos/:id', authMiddleware, adminMiddleware, pagamentosController.delete)
router.get("/pagamentos/:id", authMiddleware, adminMiddleware, pagamentosController.show)

// Rotas relacionadas a modulos
router.get("/modulos", authMiddleware, modulosController.index)
router.get("/modulos/:id", authMiddleware, modulosController.show)
router.post("/modulos", authMiddleware, adminMiddleware, modulosController.create)
router.delete("/modulos/:id", authMiddleware, adminMiddleware, modulosController.delete)
router.put("/modulos/:id", authMiddleware, adminMiddleware, modulosController.update)

// Rotas relacionadas a redações
router.get("/redacoes", authMiddleware, redacoesController.index)
router.get("/redacoes/:id", authMiddleware, redacoesController.show)
router.post("/redacoes/:usuarioId/upload", uploadRedacoes.single("file"), redacoesController.create)
router.get("/redacoes/download/:id", redacoesController.download)
router.delete("/redacoes/:id", authMiddleware, redacoesController.delete)

//Rotas relacionadas a propostas
router.post("/propostas", authMiddleware, adminMiddleware, uploadPropostas.single("file"), propostasController.create)
router.get("/propostas", authMiddleware, propostasController.index);
router.get("/propostas/download", propostasController.download)
router.get("/propostas/:id", authMiddleware, propostasController.show)
router.delete("/propostas/:id", authMiddleware, adminMiddleware, propostasController.delete)

// Rotas relacionadas a correções
router.get("/correcoes", correcoesController.index)
router.post("/correcoes/:usuarioId/upload", uploadCorrecoes.single("file"), correcoesController.create)
router.get("/correcoes/download/:id", correcoesController.download)
router.put("/correcoes/:id", authMiddleware, correcoesController.update)

// Rotas relacionadas a frequencia
router.get("/frequencias", authMiddleware, adminMiddleware, frequenciasController.index)
router.post("/frequencias", authMiddleware, adminMiddleware, frequenciasController.create)
router.get("/frequencias/:id", authMiddleware, adminMiddleware, frequenciasController.show)
router.put("/frequencias/:id", authMiddleware, adminMiddleware, frequenciasController.update)
router.delete("/frequencias/:id", authMiddleware, adminMiddleware, frequenciasController.delete)
router.get("/frequencias/aluno/:id", authMiddleware, adminMiddleware, frequenciasController.showByAluno)

// Rota que retorna o ranking de alunos
router.get("/ranking", authMiddleware, rankingController.index)

// Rota que retorna um vídeo
router.get("/videos/:id", authMiddleware, videosController.show)

// rotas do simulado 
router.post("/simulados", authMiddleware, adminMiddleware, simuladoController.create)
router.get("/simulados", authMiddleware, simuladoController.index)
router.get("/simulados/:id", authMiddleware, simuladoController.show)

// criar uma rota que recebe o id da turma e retorna todos os simulados dessa turma
router.get("/simulados/turmaId/:id", authMiddleware, adminMiddleware, simuladoController.showByTurma)

router.delete("/simulados/:id", authMiddleware, adminMiddleware, simuladoController.delete)

// rotas das notas de simulado
router.post("/notaSimulado", authMiddleware, adminMiddleware, notasSimuladoController.create)
router.get("/notaSimulado", authMiddleware, notasSimuladoController.index)
router.get("/notaSimulado/:id", authMiddleware, notasSimuladoController.show)
router.delete("/notaSimulado/:id", authMiddleware, adminMiddleware, notasSimuladoController.delete)
// buscar notas de um simulado especifico
router.get("/notaSimulado/simuladoId/:id", authMiddleware, notasSimuladoController.showBySimulado)

// Rotas relacionadas ao calendário acadêmico
router.get("/calendario", authMiddleware, calendarioController.index)
router.get("/calendario/:id", authMiddleware, calendarioController.show)
router.post("/calendario", authMiddleware, adminMiddleware, calendarioController.create)
router.put("/calendario/:id", authMiddleware, adminMiddleware, calendarioController.update)
router.delete("/calendario/:id", authMiddleware, adminMiddleware, calendarioController.delete)

// Rotas relacionadas aos tipos de evento do calendário
router.get("/tipoEvento", authMiddleware, tipoEventoController.index)
router.get("/tipoEvento/:id", authMiddleware, tipoEventoController.show)
router.post("/tipoEvento", authMiddleware, adminMiddleware, tipoEventoController.create)
router.put("/tipoEvento/:id", authMiddleware, adminMiddleware, tipoEventoController.update)
router.delete("/tipoEvento/:id", authMiddleware, adminMiddleware, tipoEventoController.delete)

// Rotas relacionadas a matrículas
router.post("/matriculas", authMiddleware, adminMiddleware, matriculasController.create)
router.get("/matriculas", authMiddleware, adminMiddleware, matriculasController.index)
router.get("/matriculas/:id", authMiddleware, adminMiddleware, matriculasController.show)
router.get("/matriculas/usuario/:usuarioId", authMiddleware, adminMiddleware, matriculasController.showByUsuario)

module.exports = router