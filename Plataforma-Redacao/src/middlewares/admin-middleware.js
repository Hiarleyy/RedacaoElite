const adminMiddleware = (req, res, next) => {
  const user = req.authenticatedUser;

  if (user.tipoUsuario !== "ADMIN") {
    return res.status(401).json({ message: "Acesso negado, rota exclusiva para admins." })
  }

  next()
}

module.exports = adminMiddleware