const express = require('express')
const router = express.Router()
const configuracaoController = require('../controllers/configuracoes-controller')

router.get('/:chave', configuracaoController.obterConfiguracao)
router.post('/:chave', configuracaoController.salvarConfiguracao)

module.exports = router
