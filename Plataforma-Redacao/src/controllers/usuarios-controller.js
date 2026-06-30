const usuariosModel = require("../models/usuarios-model")
const path = require('path');
const fs = require('fs');
const usuariosRepository = require("../repositories/usuarios-repository");

const usuariosController = {
  // GET /usuarios
  index: async (req, res, next) => {
    try {
      const { filter } = req.query

      if (filter) {
        const resposta = await usuariosModel.retornarUsuarios(filter)
        return res.status(200).json({ data: resposta })
      }

      const resposta = await usuariosModel.retornarUsuarios()
      res.status(200).json({ data: resposta })
    } catch (error) {
      next(error)
    }
  },

  // GET /usuarios/:id
  show: async (req, res, next) => {
    try {
      const { id } = req.params
      const resposta = await usuariosModel.retornarUmUsuario(id)
      res.status(200).json({ data: resposta })
    } catch (error) {
      next(error)
    }
  },

  // POST /usuarios
  create: async (req, res, next) => {
    try {
      const corpoDaRequisicao = req.body
      const resposta = await usuariosModel.criarUsuario(corpoDaRequisicao)
      res.status(200).json({ message: "usuário criado com sucesso.", data: resposta })
    } catch (error) {
      next(error)
    }
  },

  // POST /usuarios/login
  login: async (req, res, next) => {
    try {
      const corpoDaRequisicao = req.body
      const resposta = await usuariosModel.logarUsuario(corpoDaRequisicao)
      res.status(200).json({ message: "Login efetuado com sucesso", data: resposta })
    } catch (error) {
      next(error);
    }
  },

  // PUT /usuarios/:id
  update: async (req, res, next) => {
    try {
      const { id } = req.params
      const corpoDaRequisicao = req.body
      const resposta = await usuariosModel.atualizarUsuario(id, corpoDaRequisicao)
      res.status(200).json({ message: "usuário atualizado com sucesso.", data: resposta })
    } catch (error) {
      next(error)
    }
  },
  
  // POST /usuarios/:id
  profileUpload: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Verifica se o arquivo foi enviado
      if (!req.file) {
        return res.status(400).json({ error: "Nenhuma imagem enviada." });
      }

      console.log("Arquivo recebido:", req.file);
      
      // Obtém o caminho da imagem que foi salva pelo middleware
      const caminhoImagem = req.file.filename;
      console.log("Nome do arquivo:", caminhoImagem);
      
      // Atualiza o usuário com o caminho da imagem
      const resposta = await usuariosModel.adicionarFotoDePerfil(id, caminhoImagem);
      
      res.status(200).json({ 
        message: "Imagem de perfil atualizada com sucesso.", 
        data: resposta 
      });
    } catch (error) {
      console.error("Erro no upload:", error);
      next(error);
    }
  },

  // GET /usuarios/:id/profile-image
  getProfileImage: async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // Buscar dados do usuário para verificar o nome do arquivo
      const usuario = await usuariosModel.retornarUmUsuario(id);
      
      if (!usuario || !usuario.caminho) {
        return res.status(404).json({ error: "Imagem de perfil não encontrada." });
      }
      
      // Construir o caminho completo da imagem (usando caminho geral)
      const imagemCaminho = path.join(__dirname, "..", "uploads", "profile", usuario.caminho);
      
      // Verificar se o arquivo existe
      if (!fs.existsSync(imagemCaminho)) {
        return res.status(404).json({ error: "Arquivo de imagem não encontrado." });
      }
      
      // Enviar o arquivo como resposta
      res.sendFile(imagemCaminho);
      
    } catch (error) {
      console.error("Erro ao buscar imagem de perfil:", error);
      next(error);
    }
  },

  // DELETE /usuarios/:id
  delete: async (req, res, next) => {
    try {
      const { id } = req.params
      const resposta = await usuariosModel.deletarUsuario(id)
      res.status(200).json({ message: "usuário deletado com sucesso.", data: resposta })
    } catch(error){
      next(error)
    }
  },
  // DELETE /usuarios/:id
  delete:  async (req, res, next) => {
    try {
      const { id } = req.params
      const resposta = await usuariosModel.deletarUsuario(id)
      res.status(200).json({ message: "usuário deletado com sucesso.", data: resposta })
    } catch(error){
      next(error)
    }
  },

  resetPassword: async (req, res, next) => {
    try {
      const { id } = req.params
      await usuariosModel.resetarSenha(id)
      res.status(200).json({ message: "senha resetada com sucesso." })
    } catch(error){
      next(error)
    }
  },

  updatePassword: async (req, res, next) => {
    try {
      const { id } = req.params
    
      // Verificar se req.body existe e contém os dados necessários
      if (!req.body || !req.body.senhaAtual || !req.body.novaSenha) {
        return res.status(400).json({ 
          message: "Dados incompletos. 'senhaAtual' e 'novaSenha' são obrigatórios" 
        })
      }

      // Verificar se a nova senha tem pelo menos 6 caracteres
      if (req.body.novaSenha.length < 6) {
        return res.status(400).json({ 
          message: "A nova senha deve ter pelo menos 6 caracteres" 
        })
      }
      
      const data = {
        senhaAtual: req.body.senhaAtual,
        novaSenha: req.body.novaSenha
      }
      
      const usuarioAtualizado = await usuariosModel.atualizarSenha(id, data)
      res.status(200).json({ 
        message: "Senha alterada com sucesso",
        data: usuarioAtualizado 
      })
    } catch (error) {
      next(error)
    }
  }


}

module.exports = usuariosController