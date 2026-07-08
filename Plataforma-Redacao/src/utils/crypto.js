const crypto = require("crypto")

const secret = process.env.JWT_SENHA || "chave-secreta-para-criptografia-plataforma-redacao"
// Derive a 32-byte key from the secret
const key = crypto.createHash("sha256").update(secret).digest()
const algorithm = "aes-256-cbc"

const encrypt = (text) => {
  if (text === null || text === undefined) return null
  const textStr = String(text)
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(algorithm, key, iv)
  let encrypted = cipher.update(textStr, "utf8", "hex")
  encrypted += cipher.final("hex")
  return iv.toString("hex") + ":" + encrypted
}

const decrypt = (encryptedText) => {
  if (encryptedText === null || encryptedText === undefined) return null
  const parts = String(encryptedText).split(":")
  if (parts.length !== 2) {
    // Return original text if it's not in encrypted format (backward compatibility)
    return encryptedText
  }
  try {
    const iv = Buffer.from(parts[0], "hex")
    const encrypted = parts[1]
    const decipher = crypto.createDecipheriv(algorithm, key, iv)
    let decrypted = decipher.update(encrypted, "hex", "utf8")
    decrypted += decipher.final("utf8")
    return decrypted
  } catch (error) {
    // Fallback to original text if decryption fails
    return encryptedText
  }
}

const mask = (value, type) => {
  if (value === null || value === undefined) return value
  const str = String(value).trim()
  if (!str) return str

  if (type === "cpf") {
    const clean = str.replace(/\D/g, "")
    if (clean.length === 11) {
      return `${clean.substring(0, 3)}.***.***-${clean.substring(9)}`
    }
    if (str.length > 5) {
      return str.substring(0, 3) + "*".repeat(str.length - 5) + str.substring(str.length - 2)
    }
    return "***.***.***-**"
  }

  if (type === "telefone" || type === "telefoneResponsavel") {
    const clean = str.replace(/\D/g, "")
    if (clean.length === 11) {
      return `(${clean.substring(0, 2)}) ${clean.substring(2, 3)}****-${clean.substring(7)}`
    } else if (clean.length === 10) {
      return `(${clean.substring(0, 2)}) ****-${clean.substring(6)}`
    }
    if (str.length > 5) {
      return str.substring(0, 4) + "****" + str.substring(str.length - 4)
    }
    return "(xx) xxxx-xxxx"
  }

  if (type === "dataNascimento" || type === "dataInicio") {
    if (str.includes("-")) {
      const parts = str.split("-")
      if (parts.length === 3) {
        return `**/**/${parts[0]}`
      }
    }
    return "**/**/****"
  }

  // Generic text masking (endereco, bairro, cidade, nomeResponsavel, comoConheceu, genero, vinculoResponsavel)
  if (str.length <= 4) {
    return "*".repeat(str.length)
  }
  return str.substring(0, 3) + "*".repeat(str.length - 3)
}

module.exports = { encrypt, decrypt, mask }

