// Carregar variáveis de ambiente
require('dotenv').config()

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')
const { v4: uuidv4 } = require('uuid')

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🌱 Iniciando seed...')

    // Verificar se já existe um usuário admin
    const adminExistente = await prisma.usuario.findFirst({
      where: {
        tipoUsuario: 'ADMIN'
      }
    })

    if (adminExistente) {
      console.log('⚠️  Usuário ADMIN já existe:', adminExistente.email)
      return
    }

    // Dados do usuário admin
    const emailAdmin = 'Admin@gmail.com'
    const nomeAdmin = 'Daniel Admin'
    
    // Extrair a parte antes do @gmail.com (seguindo a lógica do sistema)
    const regex = /^(.*?)@gmail\.com$/
    const value = emailAdmin.match(regex)
    
    if (!value || !value[1]) {
      throw new Error('Email deve ser no formato @gmail.com')
    }

    // Criptografar a senha
    const hashedPassword = await bcrypt.hash(value[1], 10)

    // Criar usuário admin
    const usuarioAdmin = await prisma.usuario.create({
      data: {
        id: uuidv4(),
        nome: nomeAdmin,
        email: emailAdmin,
        password: hashedPassword,
        tipoUsuario: 'ADMIN',
        turmaId: null // Admin não precisa estar vinculado a uma turma
      }
    })

    console.log('✅ Usuário ADMIN criado com sucesso!')
    console.log('📧 Email:', usuarioAdmin.email)
    console.log('🔑 Senha:', value[1]) // Mostra a senha não criptografada
    console.log('👤 Tipo:', usuarioAdmin.tipoUsuario)
    console.log('🆔 ID:', usuarioAdmin.id)

  } catch (error) {
    console.error('❌ Erro ao executar seed:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
